"""Cache official MuS3D runtime assets. Never reads or sends user audio."""
from __future__ import annotations
import base64, hashlib, importlib.util, json, sys, urllib.request, zipfile
from pathlib import Path

ROOT = Path(r'D:\RootSound')
CACHE = ROOT / '.cache/mus3d-experiment'
REPO = CACHE / 'MuS3D-main'

def fetch(url, destination):
    if not destination.exists():
        with urllib.request.urlopen(url, timeout=60) as r:
            destination.write_bytes(r.read())
    return destination

def main():
    CACHE.mkdir(parents=True, exist_ok=True)
    spec = importlib.util.spec_from_file_location('persistent_dl', ROOT / '.cache/reference-download.py')
    dl = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(dl)
    dl.CACHE = CACHE / 'downloads'
    dl.CACHE.mkdir(exist_ok=True)
    entries = json.loads((CACHE / 'hf.json').read_text())
    wanted = ('SEG_mixemb/', 'BS-Locoformer_query/', 'classifiers/')
    for item in entries:
        name = item['path']
        if item['type'] != 'file' or not name.startswith(wanted):
            continue
        target = REPO / 'checkpoints' / name
        target.parent.mkdir(parents=True, exist_ok=True)
        info = {'filename': name.replace('/', '__'), 'size': item['size'],
                'url': 'https://huggingface.co/remus-aalto/MuS3D/resolve/main/' + name,
                'digests': {'sha256': item.get('lfs', {}).get('oid')}}
        if item.get('lfs'):
            stored = dl.download_file(info)
            if not target.exists():
                import shutil
                shutil.copyfile(stored, target)
        else:
            fetch(info['url'], target)
        print('READY', name, target.stat().st_size, flush=True)
    pca = REPO / 'checkpoints/classifiers/pca_params_train.pkl'
    import shutil
    shutil.copyfile(pca, REPO / 'src/query_conditioned_bslocoformer/pca_params_train.pkl')
    for name, url in {
        'dacvae.zip': 'https://codeload.github.com/facebookresearch/dacvae/zip/414c20785fc3a28373073ea8ef7a1316eeeaca6e',
        'dacvae-hf.json': 'https://huggingface.co/api/models/facebook/dacvae-watermarked/tree/main?recursive=true&expand=false'
    }.items():
        fetch(url, CACHE / name)
    zipfile.ZipFile(CACHE / 'dacvae.zip').extractall(CACHE)
    enc = next(x for x in json.loads((CACHE / 'dacvae-hf.json').read_text())
               if x['path'] == 'weights.pth')
    dl.download_file({'filename': 'dacvae-watermarked__weights.pth',
                      'size': enc['size'],
                      'url': 'https://huggingface.co/facebook/dacvae-watermarked/resolve/main/weights.pth',
                      'digests': {'sha256': enc['lfs']['oid']}})
    passt_url = 'https://github.com/kkoutini/PaSST/releases/download/v0.0.5/openmic-passt-s-f128-10sec-p16-s10-ap.85.pt'
    meta_path = CACHE / 'passt-head.json'
    if not meta_path.exists():
        with urllib.request.urlopen(urllib.request.Request(passt_url, method='HEAD'), timeout=40) as r:
            meta_path.write_text(json.dumps({'url': passt_url,
                'bytes': r.headers['Content-Length'], 'etag': r.headers.get('ETag'),
                'headers': dict(r.headers)}), 'utf-8')
    meta = json.loads(meta_path.read_text())
    passt = dl.download_file({'filename': 'openmic-passt-s-f128-10sec-p16-s10-ap.85.pt',
                             'size': int(meta['bytes']), 'url': passt_url,
                             'digests': {'sha256': None}}, meta['etag'])
    expected_md5 = meta['headers'].get('x-ms-blob-content-md5')
    if expected_md5:
        with passt.open('rb') as r:
            actual_md5 = base64.b64encode(hashlib.file_digest(r, 'md5').digest()).decode()
        if actual_md5 != expected_md5:
            raise RuntimeError('PaSST official blob MD5 mismatch')
    print('All official MuS3D CPU runtime model assets ready', flush=True)

if __name__ == '__main__':
    main()
