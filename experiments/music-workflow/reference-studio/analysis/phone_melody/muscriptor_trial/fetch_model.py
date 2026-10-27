"""Public upstream-author GGUF fetch, with pinned revisions and enforced hash.

Only model/code/licence downloads happen here. User audio is never read.
"""
from pathlib import Path
import hashlib
import json
import shutil
import time
import urllib.request

ROOT = Path(__file__).resolve().parents[6]
CACHE = ROOT / '.cache/muscriptor-experiment'
SOURCE_REV = 'c8adc019677ed3479fa3c22c1a117d662382f347'
WEIGHT_REV = 'd7045f94e8b19427f4ff9542975035e66596e51c'
name = 'muscriptor-small-f16.gguf'
checksums = (CACHE / 'SHA256SUMS').read_text('utf-8')
expected = next(line.split()[0] for line in checksums.splitlines() if line.endswith(name))
url = f'https://huggingface.co/DamRsn/muscriptor-gguf/resolve/{WEIGHT_REV}/v1/{name}'
partial = CACHE / (name + '.python-part')
began = time.monotonic()
with urllib.request.urlopen(url, timeout=30) as response, partial.open('wb') as output:
    length = int(response.headers['Content-Length'])
    copied = 0
    while chunk := response.read(2**20):
        output.write(chunk)
        copied += len(chunk)
        if copied % (32 * 2**20) == 0:
            print(f'public model {copied}/{length} bytes', flush=True)
if copied != length:
    raise RuntimeError(f'Incomplete model: {copied}/{length}')
digest = hashlib.sha256(partial.read_bytes()).hexdigest()
if digest != expected:
    raise RuntimeError(f'Model SHA256 mismatch: {digest}')
partial.replace(CACHE / name)
provenance = {'sourceRevision': SOURCE_REV, 'weightRevision': WEIGHT_REV,
    'weightSha256': digest, 'weightBytes': copied, 'weightURL': url,
    'sourceArchiveSha256': hashlib.sha256((CACHE / 'source.zip').read_bytes()).hexdigest(),
    'source': 'https://github.com/DamRsn/muscriptor.cpp', 'weights': 'https://huggingface.co/DamRsn/muscriptor-gguf',
    'audioUploaded': False, 'licence': 'CC BY-NC 4.0 personal experiment; upstream MODEL-NOTICE.md and MODEL-LICENSE.txt retained',
    'downloadSeconds': time.monotonic() - began}
(CACHE / 'provenance.json').write_text(json.dumps(provenance, indent=2), encoding='utf-8')
print(json.dumps(provenance), flush=True)
