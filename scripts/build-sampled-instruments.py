"""Build an immutable, local multi-sample bank from GeneralUser GS 2.0.3.

Input is the pinned official SF2 in .cache/instrument-bank-source. No playback,
user projects or network is used. Only selected presets' recorded PCM is exported.
"""
from pathlib import Path
import struct, hashlib, json, wave, io, math, shutil

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / '.cache/instrument-bank-source'
OUT = ROOT / 'public/instruments/generaluser-gs-2.0.3'
COMMIT = '684543d5e5efaef08d02be50dcda8d552478fa60'
raw = (SOURCE / 'GeneralUser-GS.sf2').read_bytes()
chunks = {}
def walk(start, end):
    while start + 8 <= end:
        key, size = struct.unpack_from('<4sI', raw, start)
        begin = start + 8
        if key in (b'RIFF', b'LIST'): walk(begin + 4, begin + size)
        else: chunks[key.decode('ascii')] = memoryview(raw)[begin:begin+size]
        start = begin + size + size % 2
walk(0, len(raw))
def records(key, fmt): return list(struct.iter_unpack(fmt, chunks[key]))
phdr=records('phdr','<20sHHHIII'); pbag=records('pbag','<HH'); pgen=records('pgen','<HH')
inst=records('inst','<20sH'); ibag=records('ibag','<HH'); igen=records('igen','<HH')
shdr=records('shdr','<20sIIIII BbHH'.replace(' ',''))
programs=dict(zip(['piano','bright-piano','electric-piano','fm-piano','harpsichord','organ','accordion',
 'nylon-guitar','steel-guitar','clean-guitar','distorted-guitar','harp','guzheng',
 'violin','viola','cello','contrabass','string-ensemble','piccolo','flute','clarinet','oboe','bassoon','saxophone',
 'trumpet','horn','trombone','tuba','electric-bass','synth-bass','sub-bass','xylophone','marimba','celesta','tubular-bells',
 'saw-lead','square-lead','synth-pluck','warm-pad','airy-pad','bell-pluck','vocal-ah','choir'],
 [0,1,4,5,6,19,21,24,25,27,30,46,107,40,41,42,43,48,72,73,71,68,70,65,56,60,57,58,33,38,39,13,12,8,14,81,80,45,89,91,10,53,52]))
drums={'acoustic-kick':35,'electronic-kick':36,'snare':38,'clap':39,'closed-hat':42,'open-hat':46,'crash':49,'tom':45,'tambourine':54,'shaker':70}
definitions=json.loads((SOURCE/'catalogue.json').read_text(encoding='utf-8'))
cases=definitions+[{'key':f'gm-{i}'} for i in range(128)]+[{'key':f'gm-drum-{i}'} for i in range(35,82)]
def zones(bags, gens, begin, end, target):
    glob={}
    for i in range(begin,end):
        z=dict(gens[bags[i][0]:bags[i+1][0]])
        if target not in z: glob.update(z)
        else: yield {**glob,**z}
def signed(v): return v if v<32768 else v-65536
def extent(g, op):
    v=g.get(op,0x7f00); return (v&255,v>>8)
def seconds(tc): return min(4,max(.001,2**(tc/1200)))
OUT.mkdir(parents=True,exist_ok=True); audio_files={}; manifest={}
for definition in cases:
    key=definition['key']; drum=int(key[8:]) if key.startswith('gm-drum-') else drums.get(key)
    bank=128 if drum is not None else 0
    program=0 if drum is not None else int(key[3:]) if key.startswith('gm-') else programs[key]
    pi=next(i for i,p in enumerate(phdr[:-1]) if p[1]==program and p[2]==bank)
    result=[]
    for pg in zones(pbag,pgen,phdr[pi][3],phdr[pi+1][3],41):
        ii=pg[41]
        for ig in zones(ibag,igen,inst[ii][1],inst[ii+1][1],53):
            lo=max(extent(pg,43)[0],extent(ig,43)[0]); hi=min(extent(pg,43)[1],extent(ig,43)[1])
            vl=max(extent(pg,44)[0],extent(ig,44)[0]); vh=min(extent(pg,44)[1],extent(ig,44)[1])
            if lo>hi or vl>vh or (drum is not None and not lo<=drum<=hi): continue
            h=shdr[ig[53]]; sample_type=h[9]&0x7fff
            channels=[h]
            if sample_type in (2,4):
                other=shdr[h[8]]; channels=[h,other] if sample_type==4 else [other,h]
            offset=signed(ig.get(0,0))+32768*signed(ig.get(4,0)); endoff=signed(ig.get(1,0))+32768*signed(ig.get(12,0))
            start=h[1]+offset; end=h[2]+endoff
            if end<=start: continue
            pcm=[]
            for c in channels:
                a=c[1]+offset; b=c[2]+endoff
                pcm.append(bytes(chunks['smpl'][a*2:b*2]))
            frames=min(map(lambda b:len(b)//2,pcm)); rate=h[5]
            interleaved=pcm[0][:frames*2] if len(pcm)==1 else b''.join(pcm[c][i:i+2] for i in range(0,frames*2,2) for c in range(2))
            buffer=io.BytesIO()
            with wave.open(buffer,'wb') as out: out.setnchannels(len(pcm)); out.setsampwidth(2); out.setframerate(rate); out.writeframes(interleaved)
            data=buffer.getvalue(); digest=hashlib.sha256(data).hexdigest(); file=digest+'.wav'
            if file not in audio_files: (OUT/file).write_bytes(data); audio_files[file]=len(data)
            root=ig.get(58,h[6]); root=60 if root>127 else root
            tuning=signed(ig.get(51,0))+signed(pg.get(51,0))+(signed(ig.get(52,0))+signed(pg.get(52,0))+h[7])/100
            if drum is not None: root=root-drum+60; lo=0; hi=127
            attack=seconds(signed(ig.get(34,53536))+signed(pg.get(34,0)))
            decay=min(5,seconds(signed(ig.get(36,53536))+signed(pg.get(36,0))))
            sustain=min(1,10**(-(ig.get(37,0)+signed(pg.get(37,0)))/200))
            release=seconds(signed(ig.get(38,53536))+signed(pg.get(38,0)))
            attenuation=signed(ig.get(48,0))+signed(pg.get(48,0))
            zone=dict(keyMin=lo,keyMax=hi,velocityMin=vl,velocityMax=vh,rootFrequencyHz=440*2**((root-tuning-69)/12),
              startSeconds=0,endSeconds=frames/rate,attackSeconds=min(2,attack),decaySeconds=decay,sustain=sustain,releaseSeconds=max(.02,release),level=min(1,10**(-attenuation/200)),
              asset=file,byteLength=len(data),sampleRate=rate,channels=len(pcm),frames=frames)
            if ig.get(54,0)&1:
                ls=h[3]+signed(ig.get(2,0))+32768*signed(ig.get(45,0))-start
                le=h[4]+signed(ig.get(3,0))+32768*signed(ig.get(50,0))-start
                if 0<=ls<le<=frames: zone['loop']={'startSeconds':ls/rate,'endSeconds':le/rate}
            result.append(zone)
    if not result: raise ValueError('No regions for '+key)
    # Exact duplicate regions do not add another playback layer.
    result=list({json.dumps(z,sort_keys=True):z for z in result}.values())
    manifest[key]=result
    if key=='guzheng': definition['name']='日本筝'
    if key=='vocal-ah': definition['name']='人声呜'
    if 'category' in definition: definition['midi']=36 if definition['category']=='低音' or key in ('contrabass','tuba') else 48 if key in ('cello','bassoon','trombone') else 72 if key in ('flute','piccolo','celesta') else 60
    print(key,len(result),flush=True)
(OUT/'manifest.json').write_text(json.dumps({'bank':'generaluser-gs-2.0.3','instruments':manifest},separators=(',',':')),encoding='utf-8')
shutil.copyfile(SOURCE/'LICENSE.txt',OUT/'LICENSE.txt')
(OUT/'CREDITS.txt').write_text('GeneralUser GS 2.0.3 by S. Christian Collins\nhttps://www.schristiancollins.com/generaluser.php\nSource: https://github.com/mrbumpy409/GeneralUser-GS\nPinned commit: '+COMMIT+'\nRootSound repackaging: selected, uncompressed original PCM regions and pitch/key/velocity/loop metadata.\nNot a complete SoundFont renderer; filters, modulators and layered articulations are not reproduced in full.\nSee LICENSE.txt for the author\'s complete terms and source-provenance statement.\n',encoding='utf-8')
(ROOT/'src/workstation/modules/timbre/sampled-instrument-definitions.json').write_text(json.dumps(definitions,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
report={'commit':COMMIT,'sourceSha256':hashlib.sha256(raw).hexdigest(),'instruments':len(manifest),'files':len(audio_files),'bytes':sum(audio_files.values()),'zones':sum(map(len,manifest.values()))}
(OUT/'PROVENANCE.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8'); print(json.dumps(report))
