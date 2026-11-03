"""Assemble only public runtime files. Run prepare, sign, then archive/verify."""
import hashlib, json, os, pathlib, plistlib, posixpath, shutil, stat, subprocess, sys, tarfile, tempfile, zipfile
from verify_macos_signatures import verify_macho
from windows_icon import embed_icon

ROOT = pathlib.Path(__file__).resolve().parents[1]
CACHE = ROOT / '.cache'
DEPS = CACHE / 'release-dependencies'
PLAN = CACHE / 'release-package-plan.json'
VERSION = os.environ.get('ROOTSOUND_RELEASE_VERSION', '0.1.0-preview.2')

def safe_path(root, name):
    target = (root / name).resolve()
    if not target.is_relative_to(root.resolve()): raise ValueError('Archive path escapes build directory')
    return target

def populate(app, runtime, host, ui):
    app.mkdir(parents=True)
    for name in ['main.cjs', 'preload.cjs', 'rpc.cjs', 'bundled-projects.cjs']: shutil.copyfile(ROOT / 'desktop/electron' / name, app / name)
    shutil.copyfile(ROOT/'desktop/assets/RootSound.png',app/'icon.png')
    (app / 'package.json').write_text(json.dumps({'name':'rootsound','productName':'RootSound','version':VERSION,'main':'main.cjs','private':True}), 'utf-8')
    (app / 'host').mkdir()
    for name in ['RootSound.Host.dll','RootSound.Host.deps.json','RootSound.Host.runtimeconfig.json']: shutil.copyfile(host / name, app / 'host' / name)
    shutil.copytree(ui, app / 'ui')
    # Vite can emit an asset from a tree-shaken recording implementation. It is
    # not referenced by the actual public JS and must not ship a dormant recorder.
    for asset in (app / 'ui/assets').glob('capture-worklet-*'):
        assert all(asset.name not in file.read_text('utf-8') for file in (app / 'ui/assets').glob('index-*.js'))
        asset.unlink()
    (app / 'ui/release-scope.json').unlink()
    runtime.mkdir()

def prepare():
    dependencies = json.loads((DEPS/'manifest.json').read_text('utf-8')); electron = dependencies['electronVersion']; dotnet = dependencies['dotnetVersion']
    build_root = CACHE / 'release-package-builds'; build_root.mkdir(exist_ok=True)
    stage = pathlib.Path(tempfile.mkdtemp(prefix='r-', dir=build_root))
    windows = stage / 'RootSound-Windows-x64'; windows.mkdir()
    with zipfile.ZipFile(DEPS / f'electron-v{electron}-win32-x64.zip') as archive:
        for item in archive.infolist(): safe_path(windows, item.filename)
        archive.extractall(windows)
    (windows/'electron.exe').rename(windows/'RootSound.exe')
    embed_icon(windows/'RootSound.exe',ROOT/'desktop/assets/RootSound.ico')
    (windows/'resources/default_app.asar').unlink(missing_ok=True)
    win_app = windows/'resources/app'
    populate(win_app, win_app/'runtime', CACHE/'release-host', CACHE/'release-ui')
    with zipfile.ZipFile(DEPS/f'dotnet-runtime-{dotnet}-win-x64.zip') as archive:
        for item in archive.infolist(): safe_path(win_app/'runtime', item.filename)
        archive.extractall(win_app/'runtime')

    mac = stage/'RootSound-macOS-arm64'; mac.mkdir()
    links = {}; mac_modes = {}; base_entries = []
    with zipfile.ZipFile(DEPS/f'electron-v{electron}-darwin-arm64.zip') as archive:
        for item in archive.infolist():
            relative = item.filename.replace('Electron.app/', 'RootSound.app/', 1)
            if relative.endswith('Resources/default_app.asar'): continue
            target = safe_path(mac, relative); base_entries.append(relative)
            mode = item.external_attr >> 16; mac_modes[relative] = mode
            if stat.S_ISLNK(mode): links[relative] = archive.read(item).decode('utf-8'); continue
            if item.is_dir(): target.mkdir(parents=True, exist_ok=True)
            else: target.parent.mkdir(parents=True, exist_ok=True); target.write_bytes(archive.read(item))
    app = mac/'RootSound.app'; mac_app = app/'Contents/Resources/app'
    populate(mac_app, mac_app/'runtime', CACHE/'release-host', CACHE/'release-ui')
    with tarfile.open(DEPS/f'dotnet-runtime-{dotnet}-osx-arm64.tar.gz') as archive:
        for member in archive.getmembers():
            relative = member.name.removeprefix('./'); target = safe_path(mac_app/'runtime', relative)
            mac_modes[str(target.relative_to(mac)).replace('\\','/')] = member.mode | (stat.S_IFDIR if member.isdir() else stat.S_IFREG)
            if member.isdir(): target.mkdir(parents=True, exist_ok=True)
            elif member.isfile(): target.parent.mkdir(parents=True, exist_ok=True); target.write_bytes(archive.extractfile(member).read())
            else: raise ValueError('Unexpected linked .NET runtime entry')
    info_file = app/'Contents/Info.plist'; info = plistlib.loads(info_file.read_bytes())
    info.update(CFBundleName='RootSound', CFBundleDisplayName='RootSound', CFBundleIdentifier='com.rootsound.desktop',
                CFBundleShortVersionString=VERSION.split('-')[0], CFBundleVersion=VERSION.split('-')[0])
    info_file.write_bytes(plistlib.dumps(info))
    icon_name=info.get('CFBundleIconFile','electron.icns')
    if not icon_name.endswith('.icns'):icon_name+='.icns'
    shutil.copyfile(ROOT/'desktop/assets/RootSound.icns',app/'Contents/Resources'/icon_name)

    # Personal projects are opt-in per build, never part of the default recipe.
    projects=[]
    if os.environ.get('ROOTSOUND_INCLUDE_PROJECTS')=='1':
        snapshot=stage/'bundled-projects';snapshot.mkdir()
        for source in sorted((ROOT/'project').glob('*.rootsound')):
            if source.is_symlink() or not source.is_file():continue
            checksum=hashlib.sha256();target=snapshot/source.name
            with source.open('rb') as input,target.open('xb') as output:
                while chunk:=input.read(1024*1024):checksum.update(chunk);output.write(chunk)
            projects.append({'name':source.name,'bytes':target.stat().st_size,'sha256':checksum.hexdigest()})
        if projects:
            for destination in [win_app/'seed-projects',mac_app/'seed-projects']:
                shutil.copytree(snapshot,destination)
                (destination/'manifest.json').write_text(json.dumps({'version':1,'projects':projects},ensure_ascii=False,indent=2),encoding='utf-8')

    # Windows cannot create Unix symlinks without a system privilege. Provide
    # local-only aliases so the shallow signer can read vendor framework bundles;
    # the final ZIP restores all 14 original relative Unix links and their modes.
    def resolve_link(relative):
        for _ in range(40):
            pieces = relative.split('/'); replaced = False
            for count in range(1,len(pieces)+1):
                prefix = '/'.join(pieces[:count])
                if prefix in links:
                    relative = posixpath.normpath(posixpath.join(posixpath.dirname(prefix), links[prefix], *pieces[count:])); replaced = True; break
            if not replaced: return relative
        raise ValueError('Cyclic framework link')
    for relative in links:
        alias, actual = safe_path(mac,relative), safe_path(mac,resolve_link(relative))
        alias.parent.mkdir(parents=True,exist_ok=True)
        if actual.is_dir():
            env = dict(os.environ, ROOTSOUND_RELEASE_LINK=str(alias), ROOTSOUND_RELEASE_TARGET=str(actual))
            subprocess.run(['powershell','-NoProfile','-Command','New-Item -ItemType Junction -Path $env:ROOTSOUND_RELEASE_LINK -Target $env:ROOTSOUND_RELEASE_TARGET | Out-Null'],env=env,check=True,creationflags=getattr(subprocess,'CREATE_NO_WINDOW',0))
        else:
            try: os.link(actual,alias)
            except OSError: shutil.copyfile(actual,alias)
    entitlements = stage/'entitlements.plist'
    entitlements.write_bytes(plistlib.dumps({'com.apple.security.cs.allow-jit':True,'com.apple.security.cs.allow-unsigned-executable-memory':True,'com.apple.security.cs.disable-library-validation':True}))
    plan = {'version':VERSION,'electronVersion':electron,'dotnetVersion':dotnet,'windows':str(windows),'mac':str(mac),'macLinks':links,
            'macModes':mac_modes,'macBaseEntries':base_entries,'entitlements':str(entitlements),'macMinimumVersion':info.get('LSMinimumSystemVersion'),
            'projects':projects,'customAppIcon':True}
    PLAN.write_text(json.dumps(plan,indent=2),encoding='utf-8')
    print(json.dumps({key:plan[key] for key in ['version','windows','mac','macMinimumVersion']}))

def archive():
    plan=json.loads(PLAN.read_text('utf-8')); release=pathlib.Path(os.environ.get('ROOTSOUND_RELEASE_OUTPUT',str(ROOT/'release'))).resolve()
    if not release.is_relative_to(ROOT):raise ValueError('Release output must stay inside this workspace')
    release.mkdir(parents=True,exist_ok=True)
    if not plan.get('macAdhocSignatureVerified'): raise ValueError('Mac signature preparation has not completed')
    checksums=[]
    for key in ['windows','mac']:
        source=pathlib.Path(plan[key])
        readme='RootSound '+VERSION+'\n\n'
        readme+=('解压整个文件夹，双击 RootSound.exe。无需安装 Node.js 或 .NET。\n项目默认保存在程序旁的 project 文件夹。\n' if key=='windows' else
                 '适用于 Apple 芯片 Mac，macOS 13 或以上。解压后将 RootSound.app 拖入“应用程序”，再打开。\n项目默认保存在“音乐/RootSound/project”，不写入应用程序包。\n本预览包为本地签名，尚无苹果开发者签名／公证；首次打开可能需要在“系统设置→隐私与安全性”中确认。\n尚未在真实 Mac 上完成运行与听音验收。\n')
        readme+='\n包含：乐曲库、竖向钢琴卷帘、默认采样音色、音色导入、键盘演奏、MIDI导入、工程保存和WAV导出。\n不包含：旧歌曲编排界面、乐句库、灵感共创、独立采样／蓝牙实验工具。\n'
        if plan.get('projects'):
            readme+=f'\n随包附带作者当前的{len(plan["projects"])}个工程，不含备份和历史缓存。\n'
            readme+='首次打开会加入乐曲库；已有同名工程不会被覆盖，删除后的随包工程不会在下次启动时重新出现。\n'
            readme+='\n'.join('- '+item['name'] for item in plan['projects'])+'\n'
        readme+='\n退出时可选择保存、放弃或取消，普通编辑不会自动保存工程。\n'
        output=release/f'{source.name}-{VERSION}.zip'
        with zipfile.ZipFile(output,'x',compression=zipfile.ZIP_DEFLATED,compresslevel=6) as archive:
            if key=='windows':
                for file in source.rglob('*'):
                    if file.is_file(): archive.write(file,source.name+'/'+str(file.relative_to(source)).replace('\\','/'))
            else:
                # Read original archive paths instead of walking NTFS junctions.
                names={name for name in plan['macBaseEntries'] if not name.endswith('/')}
                names.update(str(file.relative_to(source)).replace('\\','/') for file in (source/'RootSound.app/Contents/Resources/app').rglob('*') if file.is_file())
                names.add('RootSound.app/Contents/_CodeSignature/CodeResources')
                names.update(str(file.relative_to(source)).replace('\\','/') for file in (source/'RootSound.app/Contents/Frameworks').glob('*.app/Contents/_CodeSignature/CodeResources'))
                for relative in sorted(names):
                    info=zipfile.ZipInfo(source.name+'/'+relative);info.create_system=3;info.compress_type=zipfile.ZIP_DEFLATED
                    mode=plan['macModes'].get(relative,stat.S_IFREG|0o644)
                    if relative in plan['macLinks']:
                        info.external_attr=(stat.S_IFLNK|0o777)<<16
                        archive.writestr(info,plan['macLinks'][relative].encode())
                    else:
                        info.external_attr=mode<<16
                        with (source/relative).open('rb') as input, archive.open(info,'w') as output_stream:
                            shutil.copyfileobj(input,output_stream,1024*1024)
            archive.writestr(source.name+'/使用说明.txt',readme.encode('utf-8'))
        with output.open('rb') as input: checksum=hashlib.file_digest(input,'sha256').hexdigest()
        checksums.append(checksum+'  '+output.name)
    (release/'SHA256SUMS.txt').write_text('\n'.join(checksums)+'\n',encoding='utf-8')
    project_note=f'本版按作者要求附带当前{len(plan.get("projects",[]))}个工程（不含.bak）；白底灰色音符图标。' if plan.get('projects') else '本版不附带个人工程。'
    (release/'发布说明.txt').write_text('RootSound '+VERSION+'\n\n两个ZIP是上传GitHub Release的下载文件。Windows版本已做隔离文件功能检查；Mac ARM64包已完成结构与签名检查，仍需真实Mac验收，且未做Apple Developer ID签名／公证。请作为预览版本发布。\n\n'+project_note+'\n运行环境已随包附带，不含项目源码目录、实验、历史版本或开发依赖。\nMac的ZIP保留Unix可执行权限和框架内部链接，请在Mac上直接解压ZIP；不要在Windows解压后重新压缩。\n',encoding='utf-8')
    print('\n'.join(checksums))

def sign_mac():
    plan=json.loads(PLAN.read_text('utf-8')); app=pathlib.Path(plan['mac'])/'RootSound.app'
    signer=DEPS/'apple-codesign/apple-codesign-0.29.0-i686-pc-windows-msvc/rcodesign.exe'
    entitlement=os.path.relpath(plan['entitlements'],ROOT)
    signatures=[]
    for helper in sorted((app/'Contents/Frameworks').glob('*.app')):
        infofile=helper/'Contents/Info.plist';info=plistlib.loads(infofile.read_bytes())
        executables=list((helper/'Contents/MacOS').iterdir());assert len(executables)==1
        info['CFBundleExecutable']=executables[0].name
        suffix=''.join(c for c in helper.stem if c.isalnum()).lower()
        info['CFBundleIdentifier']='com.rootsound.desktop.'+suffix
        infofile.write_bytes(plistlib.dumps(info))
        subprocess.run([str(signer),'sign','--entitlements-xml-file',entitlement,str(helper)],cwd=ROOT,check=True)
        verify_macho(executables[0],infofile,helper/'Contents/_CodeSignature/CodeResources')
        signatures.append(str(executables[0].relative_to(app)).replace('\\','/'))
    subprocess.run([str(signer),'sign','--shallow','--exclude','**','--entitlements-xml-file',entitlement,
                    '--binary-identifier','com.rootsound.desktop',str(app)],cwd=ROOT,check=True)
    verify_macho(app/'Contents/MacOS/Electron',app/'Contents/Info.plist',app/'Contents/_CodeSignature/CodeResources')
    signatures.append('Contents/MacOS/Electron')
    resources=plistlib.loads((app/'Contents/_CodeSignature/CodeResources').read_bytes())
    for helper in (app/'Contents/Frameworks').glob('*.app'):
        assert 'Frameworks/'+helper.name in resources['files2'], 'Helper must be sealed as nested code'
    assert not any('\\' in name for name in resources['files2'])
    plan['macAdhocSignatureVerified']=signatures
    PLAN.write_text(json.dumps(plan,indent=2),encoding='utf-8')
    print('Verified local signatures:',len(signatures),'Developer ID/notarization: not supplied')

if __name__=='__main__':
    {'prepare':prepare,'sign-mac':sign_mac,'archive':archive}[sys.argv[1]]()
