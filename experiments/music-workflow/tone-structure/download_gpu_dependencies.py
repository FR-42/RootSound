"""Download the pinned Windows XPU runtime dependencies from official package metadata."""
from pathlib import Path
from urllib.request import Request, urlopen
import concurrent.futures
import hashlib
import json
import sys
import time

ROOT = Path(__file__).resolve().parents[3]
CACHE = ROOT / '.cache' / 'tone-structure-gpu' / 'wheels'
CACHE.mkdir(parents=True, exist_ok=True)
PACKAGES = [('tcmlib','1.2.0'),('umf','0.9.1'),('intel-pti','0.10.1'),('intel-cmplr-lib-rt','2025.0.5'),('intel-cmplr-lib-ur','2025.0.5'),('intel-cmplr-lic-rt','2025.0.5'),('intel-sycl-rt','2025.0.5')]

def fetch(url):
    for attempt in range(10):
        try:
            with urlopen(Request(url, headers={'User-Agent':'RootSound-GPU-setup/1.0'}), timeout=45) as response:
                return response.read()
        except Exception:
            if attempt == 9:
                raise
            time.sleep(min(5, attempt+1))

def download(package):
    name, version = package
    metadata = json.loads(fetch(f'https://pypi.org/pypi/{name}/{version}/json'))
    wheel = next(item for item in metadata['urls'] if item['filename'].endswith('win_amd64.whl'))
    if not wheel['url'].startswith('https://files.pythonhosted.org/'):
        raise RuntimeError('Unexpected package origin')
    path = CACHE / wheel['filename']
    if path.exists() and hashlib.sha256(path.read_bytes()).hexdigest() == wheel['digests']['sha256']:
        print('VERIFIED CACHE',path.name,flush=True)
        return
    print('DOWNLOAD',path.name,round(wheel['size']/1048576,1),'MiB',flush=True)
    data = fetch(wheel['url'])
    if len(data) != wheel['size'] or hashlib.sha256(data).hexdigest() != wheel['digests']['sha256']:
        raise RuntimeError('Official checksum mismatch: '+path.name)
    path.write_bytes(data)
    path.with_suffix('.json').write_text(json.dumps(wheel,indent=2),encoding='utf-8')
    print('VERIFIED',path.name,flush=True)

with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
    list(pool.map(download,PACKAGES))
