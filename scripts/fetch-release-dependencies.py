"""Fetch pinned desktop runtimes into build cache; never copy user projects."""
import concurrent.futures, hashlib, json, pathlib, urllib.request, sys

ROOT = pathlib.Path(__file__).resolve().parents[1]
OUT = ROOT / '.cache' / 'release-dependencies'
OUT.mkdir(parents=True, exist_ok=True)

if '--offline' in sys.argv:
    manifest = json.loads((OUT / 'manifest.json').read_text('utf-8'))
    for item in manifest['downloads']:
        algorithm = 'sha256' if 'sha256' in item else 'sha512'
        with (OUT / item['file']).open('rb') as source:
            actual = hashlib.file_digest(source, algorithm).hexdigest()
        if actual != item[algorithm]: raise ValueError('Cached runtime checksum mismatch: ' + item['file'])
    print(json.dumps({'cachedRuntimesVerified':len(manifest['downloads']),'electronVersion':manifest['electronVersion'],'dotnetVersion':manifest['dotnetVersion']}))
    sys.exit(0)

def request(url):
    return urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'RootSound-release-builder'}), timeout=60)

def get(url):
    with request(url) as response:
        return response.read()

def download(item):
    name, url, digest, algorithm = item
    target = OUT / name
    if target.exists() and hashlib.new(algorithm, target.read_bytes()).hexdigest() == digest:
        return {'file': name, 'url': url, algorithm: digest}
    temporary = target.with_suffix(target.suffix + '.part')
    checksum = hashlib.new(algorithm)
    with request(url) as response, temporary.open('wb') as output:
        while chunk := response.read(1024 * 1024):
            checksum.update(chunk); output.write(chunk)
    if checksum.hexdigest() != digest:
        raise ValueError('Download checksum mismatch: ' + name)
    temporary.replace(target)
    return {'file': name, 'url': url, algorithm: digest}

# Resolve once from the upstream registry, then retain the exact version and hashes.
manifest_file = OUT / 'manifest.json'
metadata = json.loads(get('https://builds.dotnet.microsoft.com/dotnet/release-metadata/9.0/releases.json'))
runtime_version = metadata['latest-runtime']
if manifest_file.exists():
    manifest = json.loads(manifest_file.read_text('utf-8'))
    jobs = [(x['file'], x['url'], x.get('sha256', x.get('sha512')), 'sha256' if 'sha256' in x else 'sha512') for x in manifest['downloads'] if not x['file'].startswith('dotnet-runtime-')]
else:
    version = json.loads(get('https://registry.npmjs.org/electron/latest'))['version']
    base = f'https://github.com/electron/electron/releases/download/v{version}/'
    sums = {line.split()[-1].lstrip('*'): line.split()[0] for line in get(base + 'SHASUMS256.txt').decode().splitlines() if line.strip()}
    jobs = []
    for platform in ['win32-x64', 'darwin-arm64']:
        name = f'electron-v{version}-{platform}.zip'; jobs.append((name, base + name, sums[name], 'sha256'))
    codebase = 'https://github.com/indygreg/apple-platform-rs/releases/download/apple-codesign%2F0.29.0/'
    name = 'apple-codesign-0.29.0-i686-pc-windows-msvc.zip'
    checksum = get(codebase + name + '.sha256').decode().split()[0]
    jobs.append((name, codebase + name, checksum, 'sha256'))
    manifest = {'electronVersion': version, 'downloads': []}
runtime = next(release['runtime'] for release in metadata['releases'] if release['runtime']['version'] == runtime_version)
for rid, extension in [('win-x64', '.zip'), ('osx-arm64', '.tar.gz')]:
    artifact = next(item for item in runtime['files'] if item['rid'] == rid and item['name'].endswith(extension))
    jobs.append((f'dotnet-runtime-{runtime_version}-{rid}{extension}', artifact['url'], artifact['hash'].lower(), 'sha512'))
manifest['dotnetVersion'] = runtime_version
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
    manifest['downloads'] = list(pool.map(download, jobs))
manifest_file.write_text(json.dumps(manifest, indent=2), encoding='utf-8')
print(json.dumps({'electronVersion': manifest['electronVersion'], 'files': [x['file'] for x in manifest['downloads']]}))
