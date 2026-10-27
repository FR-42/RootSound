"""Independent structural/audio checks and objective comparison, no device I/O."""
from pathlib import Path
import csv,json,hashlib,zipfile
import numpy as np
from scipy import signal,ndimage
from scipy.io import wavfile
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from analyze_vulcanus import CASE,SOURCE

def main():
    case=json.loads((CASE/'case.json').read_text(encoding='utf-8'))
    r,ref=wavfile.read(CASE/'reference.wav');rr,rec=wavfile.read(CASE/'reconstruction.wav')
    assert r==rr==48000 and ref.shape==rec.shape and ref.dtype==rec.dtype==np.float32
    assert np.isfinite(ref).all() and np.isfinite(rec).all() and abs(rec).max()<1
    assert case['Info']['SourceSha256']==hashlib.sha256(SOURCE.read_bytes()).hexdigest().upper()
    source_rate,source=wavfile.read(SOURCE,mmap=True)
    source_start=round(case['Info']['SourceStartSeconds']*source_rate)
    assert np.array_equal(ref,source[source_start:source_start+len(ref)])
    with zipfile.ZipFile(CASE/'reconstruction.rsphrase') as z:
        manifest=json.loads(z.read('manifest.json'))
        expected={'manifest.json'}
        for asset in manifest['Assets']:
            name='assets/'+asset['Key']+'.f32';expected.add(name);raw=z.read(name)
            assert len(raw)==asset['Frames']*asset['Channels']*4
            assert hashlib.sha256(raw).hexdigest().upper()==asset['AudioSha256']
            values=np.frombuffer(raw,dtype='<f4');assert np.isfinite(values).all() and abs(values).max()<=1
        assert set(z.namelist())==expected and len(z.namelist())==len(expected)
    assert abs(len(ref)/r-manifest['Bars']*4*60/manifest['Tempo'])<1/r
    assert {x['ChannelId'] for x in case['Layers']}=={x['Id'] for x in manifest['Channels']}
    all_ids=[n['Id'] for c in manifest['Channels'] for n in c['Notes']];assert len(all_ids)==len(set(all_ids))
    with (CASE/'estimated-notes.csv').open('w',newline='',encoding='utf-8-sig') as o:
        out=csv.writer(o);out.writerow(['layer','pitch_midi','start_seconds','length_seconds','velocity','status'])
        for ch in manifest['Channels']:
            for n in ch['Notes']:
                out.writerow([ch['Name'],n['Pitch'],n['StartTick']/960*60/manifest['Tempo'],n['LengthTick']/960*60/manifest['Tempo'],n['Velocity'],'estimated, not manually heard/verified'])
    fig,axs=plt.subplots(3,1,figsize=(16,10),gridspec_kw={'height_ratios':[2,2,1]})
    powers=[]
    for ax,x,title in [(axs[0],ref,'Original mixture'),(axs[1],rec,'Editable synthesis approximation')]:
        f,t,z=signal.stft(x.mean(1),r,nperseg=4096,noverlap=4096-480)
        p=abs(z);powers.append(p)
        ax.pcolormesh(t,f,20*np.log10(np.maximum(p,1e-7)),shading='auto',cmap='magma',vmin=-75,vmax=-30)
        ax.set(title=title,yscale='log',ylim=(40,16000),ylabel='Hz')
    for ax in axs[:2]:
        for k in range(33):ax.axvline(k*60/manifest['Tempo'],alpha=.15,color='cyan')
    b=[(35,180),(180,500),(500,2000),(2000,6000),(6000,16000)]
    pows=np.array([[np.mean(np.sum(p[(f>=lo)&(f<hi)]**2,axis=0)) for lo,hi in b] for p in powers])
    xx=np.arange(len(b));axs[2].bar(xx-.17,10*np.log10(pows[0]+1e-12),.34,label='original');axs[2].bar(xx+.17,10*np.log10(pows[1]+1e-12),.34,label='approximation')
    axs[2].set(xticks=xx,xticklabels=[f'{a}-{b} Hz' for a,b in b],ylabel='band power dB');axs[2].legend();fig.tight_layout();fig.savefig(CASE/'spectral-comparison.png',dpi=140)
    flat=[x.ravel() for x in powers]
    spectral_cosine=float(np.dot(flat[0],flat[1])/(np.linalg.norm(flat[0])*np.linalg.norm(flat[1])))
    report=dict(structureChecksPassed=True,sampleRate=r,frames=len(ref),durationSeconds=len(ref)/r,
        layers=len(manifest['Channels']),notes=len(all_ids),sourceHashVerified=True,
        referenceRms=float(np.sqrt(np.mean(ref.astype(np.float64)**2))),
        reconstructionRms=float(np.sqrt(np.mean(rec.astype(np.float64)**2))),
        reconstructionPeak=float(abs(rec).max()),spectralMagnitudeCosine=spectral_cosine,
        metricCaveat='Spectral similarity and RMS are objective diagnostics only, not evidence of faithful transcription or pleasing timbre. No auditory review occurred.',
        bandPowerRatioDb=(10*np.log10((pows[1]+1e-12)/(pows[0]+1e-12))).tolist())
    (CASE/'analysis-verification.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
    print(json.dumps(report,indent=2))
if __name__=='__main__':main()
