"""Download public official BasicPitch model/source into an isolated cache.

This script downloads model/code only; it never reads or uploads user audio.
"""
from pathlib import Path
import hashlib
import json
import requests

ROOT=Path(__file__).resolve().parents[5]
OUT=ROOT/'.cache/pitch-model-experiment'
OUT.mkdir(parents=True,exist_ok=True)
session=requests.Session()
session.headers['User-Agent']='RootSound-local-audio-experiment'
def get(url):
    response=session.get(url,timeout=40);response.raise_for_status();return response
commit=get('https://api.github.com/repos/spotify/basic-pitch/commits/main').json()['sha']
names=['inference.py','constants.py','note_creation.py','saved_models/icassp_2022/nmp.onnx','../LICENSE']
items=[]
for name in names:
    rel='LICENSE' if name=='../LICENSE' else 'basic_pitch/'+name
    meta=get(f'https://api.github.com/repos/spotify/basic-pitch/contents/{rel}?ref={commit}').json()
    data=get(meta['download_url']).content
    blob=hashlib.sha1(b'blob '+str(len(data)).encode()+b'\0'+data).hexdigest()
    assert blob==meta['sha'] and len(data)==meta['size']
    path=OUT/'official'/rel
    path.parent.mkdir(parents=True,exist_ok=True)
    path.write_bytes(data)
    items.append({'path':str(path.relative_to(OUT)),'url':meta['download_url'],
        'bytes':len(data),'gitBlobSha':blob,'sha256':hashlib.sha256(data).hexdigest()})
(OUT/'official-provenance.json').write_text(json.dumps({'repository':'spotify/basic-pitch',
    'commit':commit,'files':items,'audioReadOrUploaded':False},indent=2),encoding='utf-8')
print(json.dumps({'commit':commit,'files':len(items),'bytes':sum(i['bytes']for i in items)}))
