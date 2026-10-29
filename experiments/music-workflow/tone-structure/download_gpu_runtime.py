"""Resumable, SHA-256 verified official wheels for this experiment's Intel GPU runtime."""
from concurrent.futures import ThreadPoolExecutor, wait
import hashlib
from pathlib import Path
import shutil
import threading
import time
from urllib.request import Request,urlopen

ROOT = Path(__file__).resolve().parents[3]
CACHE = ROOT / '.cache' / 'tone-structure-gpu' / 'wheels'
CACHE.mkdir(parents=True, exist_ok=True)
LOCK=threading.Lock()

def sha256(path):
    with path.open('rb') as stream:
        return hashlib.file_digest(stream,'sha256').hexdigest()

def download_part(url,path,first,last,total):
    expected=last-first+1
    for attempt in range(16):
        have=path.stat().st_size if path.exists() else 0
        if have==expected:return
        if have>expected:raise RuntimeError('Persistent range has excess data')
        start=first+have
        try:
            request=Request(url,headers={'User-Agent':'RootSound-GPU-setup/1.0','Range':f'bytes={start}-{last}','Accept-Encoding':'identity'})
            with urlopen(request,timeout=40) as response:
                if response.status!=206 or response.headers.get('Content-Range')!=f'bytes {start}-{last}/{total}':
                    raise RuntimeError('Incorrect HTTP range')
                remaining=last-start+1
                with path.open('ab',buffering=0) as output:
                    while remaining:
                        piece=response.read(min(262144,remaining))
                        if not piece:raise EOFError('Download ended early')
                        output.write(piece);remaining-=len(piece)
            return
        except Exception as error:
            with LOCK:print('RANGE RETRY',path.name,attempt+1,str(error),flush=True)
            if attempt==15:raise
            time.sleep(min(8,attempt+1))
FILES = [
    ('torch-2.7.1+xpu-cp313-cp313-win_amd64.whl', 733315069, 'cd3669fee311bc3ee5501d696bf989226a6f2bf957d120a04881a07af05526d6'),
    ('torchaudio-2.7.1+xpu-cp313-cp313-win_amd64.whl', 2480333, 'c4442b550f588d1f4961c6bb64e05cebf3c48027bf533b30ae29f7eddebc2f6d'),
    ('pytorch_triton_xpu-3.3.1-cp313-cp313-win_amd64.whl',265801771,'1260c4a4bad426b6cd3c8f3e1a21835381c6f217bf434bcb55fedec08a206dea')]

for name, total, digest in FILES:
    target = CACHE / name
    if target.exists():
        if target.stat().st_size == total and sha256(target) == digest:
            print('VERIFIED', name, flush=True)
            for part in CACHE.glob(name+'.part*'):part.unlink()
            continue
        raise RuntimeError('Existing completed file failed verification: ' + name)
    count = 16 if total > 100000000 else 1
    parts = [(CACHE / (name + f'.part{i}'), i * total // count, (i + 1) * total // count - 1) for i in range(count)]
    url = 'https://download.pytorch.org/whl/' + ('' if name.startswith('pytorch_triton') else 'xpu/') + name.replace('+', '%2B')
    began = time.monotonic()
    with ThreadPoolExecutor(max_workers=count) as pool:
        jobs = [pool.submit(download_part, url + f'?rootsound_block={i}', path, first, last, total) for i, (path, first, last) in enumerate(parts)]
        while True:
            _, pending = wait(jobs, timeout=8)
            current = sum(path.stat().st_size if path.exists() else 0 for path, _, _ in parts)
            print(f'{name}: {current/total:.1%}; {current/1048576:.1f} MiB; {time.monotonic()-began:.0f}s', flush=True)
            if not pending:
                break
        for job in jobs:
            job.result()
    candidate = CACHE / (name + '.assembling')
    with candidate.open('wb') as output:
        for path, _, _ in parts:
            with path.open('rb') as source:
                shutil.copyfileobj(source, output, 1048576)
    if candidate.stat().st_size != total or sha256(candidate) != digest:
        raise RuntimeError('Official wheel checksum mismatch: ' + name)
    candidate.replace(target)
    for path,_,_ in parts:path.unlink()
    print('VERIFIED', name, flush=True)
