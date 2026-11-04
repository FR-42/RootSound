"""Check release scope, Mac modes/links and sealed resources without launching UI."""
import hashlib,json,os,pathlib,plistlib,posixpath,stat,struct,tempfile,zipfile
from verify_macos_signatures import verify_macho

ROOT=pathlib.Path(__file__).resolve().parents[1]
plan=json.loads((ROOT/'.cache/release-package-plan.json').read_text('utf-8'))
release=pathlib.Path(os.environ.get('ROOTSOUND_RELEASE_OUTPUT',str(ROOT/'release'))).resolve()
scope=json.loads((ROOT/'.cache/release-ui/release-scope.json').read_text('utf-8'))
assert scope['onlyCurrentEntry']
for filename in scope['modules']:
    assert not any(name in filename for name in ['song-workspace.ts','co-creation-workspace.ts','sampling-workspace.ts','melody-recognition/','app/browser.ts'])
reports=[]
for platform in ['windows','mac']:
    basename=pathlib.Path(plan[platform]).name
    filename=release/f'{basename}-{plan["version"]}.zip'
    with zipfile.ZipFile(filename) as package:
        names=package.namelist();assert len(names)==len(set(names))
        assert all(not name.startswith('/') and '..' not in name.split('/') for name in names)
        assert not any(any(part in name.split('/') for part in ['.git','.cache','.test-output','experiments','legacy','node_modules','project','data','timbres']) for name in names)
        assert not any(name.endswith(('.mid','.midi','.pdb','.cs','.ts','.py','.map','.tmp','.bak')) for name in names)
        assert not any('capture-worklet-' in name or 'melody-worker-' in name or 'default_app.asar' in name for name in names)
        prefix=basename+('/resources/app/' if platform=='windows' else '/RootSound.app/Contents/Resources/app/')
        requested={prefix+'seed-projects/'+item['name'] for item in plan.get('projects',[])}
        assert {name for name in names if name.endswith('.rootsound')}==requested
        for item in plan.get('projects',[]):
            entry=package.getinfo(prefix+'seed-projects/'+item['name']);assert entry.file_size==item['bytes']
            with package.open(entry) as stream:checksum=hashlib.file_digest(stream,'sha256').hexdigest()
            assert checksum==item['sha256'],'Bundled project differs from the requested saved snapshot'
        if requested:
            manifest=json.loads(package.read(prefix+'seed-projects/manifest.json'));assert manifest['projects']==plan['projects']
        assert package.read(prefix+'icon.png')==(ROOT/'desktop/assets/RootSound.png').read_bytes()
        for required in ['main.cjs','preload.cjs','rpc.cjs','package.json','host/RootSound.Host.dll','ui/index.html','ui/instruments/generaluser-gs-2.0.3/LICENSE.txt','runtime/LICENSE.txt']:
            assert prefix+required in names,required
        bank=prefix+'ui/instruments/generaluser-gs-2.0.3/'
        for required in ['GeneralUser-GS.sf2','CREDITS.txt','THIRD-PARTY.txt','PROVENANCE.json','spessasynth_core-LICENSE.txt','fflate-LICENSE.txt','stb-vorbis-LICENSE.txt']:
            assert bank+required in names,required
        provenance=json.loads(package.read(bank+'PROVENANCE.json'))
        with package.open(bank+'GeneralUser-GS.sf2') as stream:
            assert hashlib.file_digest(stream,'sha256').hexdigest()==provenance['sourceSha256']
        assert any(name.startswith(prefix+'ui/assets/soundfont-worklet-') and package.getinfo(name).file_size>100000 for name in names),'Full SoundFont engine missing'
        for source in ['main.cjs','preload.cjs','rpc.cjs','bundled-projects.cjs']:
            assert package.read(prefix+source)==(ROOT/'desktop/electron'/source).read_bytes(),source
        assert b"script-src 'self' 'wasm-unsafe-eval'" in package.read(prefix+'main.cjs')
        runtime='runtime/dotnet.exe' if platform=='windows' else 'runtime/dotnet'
        assert prefix+runtime in names
        voices=[name for name in names if name.startswith(prefix+'ui/instruments/') and name.endswith('.wav')]
        assert len(voices)>100
        detail={'platform':platform,'file':filename.name,'bytes':filename.stat().st_size,'entries':len(names),
                'onlyCurrentPublicEntry':True,'explicitlyRequestedProjects':len(requested),'noProjectBackups':True,'developmentAndExperimentsExcluded':True,
                'bundledRuntime':plan['dotnetVersion'],'installedRecordings':len(voices)}
        if platform=='windows':
            with package.open(basename+'/RootSound.exe') as binary:
                header=binary.read(4096);assert header[:2]==b'MZ';position=struct.unpack_from('<I',header,60)[0]
                assert struct.unpack_from('<H',header,position+4)[0]==0x8664
            detail['windowsX64']=True
        else:
            app=basename+'/RootSound.app/'
            info=plistlib.loads(package.read(app+'Contents/Info.plist'));assert info['CFBundleIdentifier']=='com.rootsound.desktop'
            icon=info['CFBundleIconFile'];icon=icon if icon.endswith('.icns') else icon+'.icns'
            assert package.read(app+'Contents/Resources/'+icon)==(ROOT/'desktop/assets/RootSound.icns').read_bytes()
            assert info['LSMinimumSystemVersion']=='13.0'
            executable=package.getinfo(app+'Contents/MacOS/Electron')
            assert (executable.external_attr>>16)&0o111
            assert (package.getinfo(prefix+'runtime/dotnet').external_attr>>16)&0o111
            for relative,target in plan['macLinks'].items():
                item=package.getinfo(basename+'/'+relative);assert stat.S_ISLNK(item.external_attr>>16)
                assert package.read(item).decode()==target
                resolved=posixpath.normpath(posixpath.join(posixpath.dirname(relative),target));assert resolved.startswith('RootSound.app/')
            # Check every regular resource digest from the final ZIP, bounded by
            # a small streaming buffer rather than expanding the whole archive.
            resources=plistlib.loads(package.read(app+'Contents/_CodeSignature/CodeResources'));regular=0
            for relative,record in resources.get('files2',{}).items():
                if 'hash2' in record:
                    with package.open(app+'Contents/'+relative) as stream: actual=hashlib.file_digest(stream,'sha256').digest()
                    assert actual==record['hash2'],relative;regular+=1
            with tempfile.TemporaryDirectory(dir=ROOT/'.test-output') as temporary:
                temporary=pathlib.Path(temporary)
                signatures=[]
                locations=['Contents']+[f'Contents/Frameworks/{name}/Contents' for name in ['Electron Helper.app','Electron Helper (GPU).app','Electron Helper (Renderer).app','Electron Helper (Plugin).app']]
                for number,location in enumerate(locations):
                    directory=temporary/str(number);directory.mkdir()
                    metadata=package.read(app+location+'/Info.plist');definition=plistlib.loads(metadata)
                    binary=app+location+'/MacOS/'+definition['CFBundleExecutable']
                    (directory/'Info.plist').write_bytes(metadata);(directory/'CodeResources').write_bytes(package.read(app+location+'/_CodeSignature/CodeResources'))
                    (directory/'binary').write_bytes(package.read(binary))
                    signatures.append(verify_macho(directory/'binary',directory/'Info.plist',directory/'CodeResources'))
                # Prove that the checker rejects changed executable pages.
                bad=temporary/'0/binary';data=bytearray(bad.read_bytes());data[4096]^=1;bad.write_bytes(data)
                try:verify_macho(bad)
                except ValueError:pass
                else:raise AssertionError('Tampered executable passed verification')
            detail.update(appleArm64=True,unixLinksPreserved=len(plan['macLinks']),unixExecutableModesPreserved=True,
                          sealedResourceDigestsVerified=regular,localCodeSignaturesVerified=len(signatures),
                          appleDeveloperIdSigned=False,notarized=False,actualMacExecution=False)
        reports.append(detail)
(ROOT/'.test-output/release-package-verification.json').write_text(json.dumps(reports,indent=2),encoding='utf-8')
print(json.dumps(reports,indent=2))
