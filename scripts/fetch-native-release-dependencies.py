import hashlib
import json
import pathlib
import re
import subprocess
import shutil
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parents[1]
cache = ROOT / '.cache/native-release-dependencies'
cache.mkdir(parents=True, exist_ok=True)
lock = ROOT / 'desktop/installer/native-runtime-lock.json'


def request(url):
    return urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'RootSound-release-builder'}), timeout=60)


if lock.exists():
    plan = json.loads(lock.read_text('utf-8'))
else:
    version = json.loads((ROOT / '.cache/release-dependencies/manifest.json').read_text('utf-8'))['dotnetVersion']
    with request('https://builds.dotnet.microsoft.com/dotnet/release-metadata/9.0/releases.json') as stream:
        metadata = json.load(stream)
    release = next(item for item in metadata['releases'] if item.get('windowsdesktop', {}).get('version') == version)
    runtime = next(item for item in release['windowsdesktop']['files'] if item['rid'] == 'win-x64' and item['name'].endswith('.zip'))
    with request('https://developer.microsoft.com/en-us/microsoft-edge/webview2/') as stream:
        page = stream.read().decode('utf-8')
    matches = re.findall(r'https:[^"<> ]+Microsoft\.WebView2\.FixedVersionRuntime\.(\d+\.\d+\.\d+\.\d+)\.x64\.cab', page)
    webview_version = max(matches, key=lambda value: tuple(map(int, value.split('.'))))
    url = re.search(r'https:[^"<> ]+Microsoft\.WebView2\.FixedVersionRuntime\.' + re.escape(webview_version) + r'\.x64\.cab', page).group().replace('\\u002F', '/')
    plan = {'dotnetVersion': version, 'webviewVersion': webview_version, 'downloads': [
        {'file': f'windowsdesktop-runtime-{version}-win-x64.zip', 'url': runtime['url'], 'sha512': runtime['hash'].lower()},
        {'file': f'WebView2-{webview_version}-x64.cab', 'url': url},
    ]}

for item in plan['downloads']:
    target = cache / item['file']
    algorithm = 'sha512' if 'sha512' in item else 'sha256'
    expected = item.get(algorithm)
    def digest():
        with target.open('rb') as stream:
            return hashlib.file_digest(stream, algorithm).hexdigest()
    if not target.exists() or expected and digest() != expected:
        temporary = target.with_suffix(target.suffix + '.part')
        with request(item['url']) as source, temporary.open('wb') as output:
            while block := source.read(1024 * 1024):
                output.write(block)
        temporary.replace(target)
    actual = digest()
    if expected and actual != expected:
        raise ValueError('Runtime checksum mismatch: ' + item['file'])
    item[algorithm] = actual
    if target.suffix == '.cab':
        extracted = cache / ('webview-' + plan['webviewVersion'])
        if not extracted.exists():
            extracted.mkdir()
            subprocess.run(['expand.exe', str(target), '-F:*', str(extracted)], check=True, stdout=subprocess.DEVNULL)
        executables = list(extracted.rglob('msedgewebview2.exe'))
        assert len(executables) == 1
        plan['webviewDirectory'] = str(executables[0].parent.relative_to(cache))
        command = '$signature = Get-AuthenticodeSignature -LiteralPath $env:ROOTSOUND_VERIFY_BROWSER; if ($signature.Status -ne "Valid" -or $signature.SignerCertificate.Subject -notmatch "Microsoft Corporation") { throw "Untrusted WebView2 runtime" }'
        import os
        subprocess.run([shutil.which('pwsh') or 'powershell', '-NoProfile', '-Command', command], env=dict(os.environ, ROOTSOUND_VERIFY_BROWSER=str(executables[0])), check=True)

lock.write_text(json.dumps(plan, indent=2), encoding='utf-8')
print(json.dumps({'dotnet': plan['dotnetVersion'], 'webview': plan['webviewVersion'], 'verifiedDownloads': len(plan['downloads'])}))
