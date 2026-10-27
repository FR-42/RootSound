"""Local, reproducible signal inspection. Never uploads the source recording."""
from pathlib import Path
import json
import numpy as np
from scipy.io import wavfile
from scipy import signal, ndimage
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

ROOT=Path(__file__).resolve().parents[1]
CASE=ROOT/'cases'/'Vulcanus'
SOURCE=Path(r'D:\Sound\temp\music\Vulcanus.wav')

def main():
    sr,a=wavfile.read(SOURCE)
    if np.issubdtype(a.dtype,np.integer): a=a.astype(np.float32)/max(abs(np.iinfo(a.dtype).min),np.iinfo(a.dtype).max)
    a=np.asarray(a,dtype=np.float32)
    mono=a.mean(axis=1) if a.ndim==2 else a
    low=signal.resample_poly(mono,1,4)
    r=sr//4; hop=120
    f,t,z=signal.stft(low,r,nperseg=1024,noverlap=1024-hop,boundary=None)
    mag=np.abs(z)
    flux=np.maximum(np.diff(np.log1p(mag*80),axis=1,prepend=np.zeros((len(f),1))),0)
    bands=[(f>=35)&(f<180),(f>=180)&(f<2000),(f>=2000)&(f<5500)]
    envs=np.array([flux[b].mean(axis=0) for b in bands])
    envs/=np.maximum(np.percentile(envs,95,axis=1,keepdims=True),1e-8)
    onset=envs.mean(axis=0)
    onset=np.maximum(onset-ndimage.median_filter(onset,size=101),0)
    ac=signal.fftconvolve(onset,onset[::-1],mode='full')[len(onset)-1:]
    tempos=[]
    for lag in signal.find_peaks(ac[20:80],distance=2)[0]+20:
        bpm=60/(lag*hop/r)
        score=float(ac[lag]+.5*ac[2*lag]+.25*ac[3*lag])
        tempos.append({'bpm':round(bpm,4),'lag':int(lag),'score':score})
    tempos=sorted(tempos,key=lambda q:q['score'],reverse=True)
    # Fractional-lag beat grids avoid the resolution limit of integer FFT bins.
    candidates=[]
    for bpm in np.arange(120,281,.1):
        period=60/bpm
        phases=np.arange(0,period,.005)
        scores=[]
        for phase in phases:
            bt=np.arange(phase+20, min(float(len(mono)/sr)-10,150),period)
            scores.append(np.interp(bt,t,onset).mean())
        idx=np.argmax(scores)
        candidates.append((float(scores[idx]),float(bpm),float(phases[idx])))
    top=sorted(candidates,reverse=True)[:20]
    secs=np.arange(0,len(low),r)/r
    rms_sec=np.array([np.sqrt(np.mean(low[i:i+r]**2)) for i in range(0,len(low),r)])
    out={'source':str(SOURCE),'sampleRate':sr,'channels':int(a.shape[1] if a.ndim==2 else 1),'frames':len(a),
        'durationSeconds':len(a)/sr,'peak':float(abs(a).max()),'rms':float(np.sqrt(np.mean(a.astype(np.float64)**2))),
        'tempoAutocorrelation':tempos,'tempoGridCandidates':[{'score':s,'bpm':b,'phase':p} for s,b,p in top],
        'method':'Local spectral-flux onset and beat-grid correlation; estimates require musical review. No source separation or learned model.'}
    CASE.mkdir(parents=True,exist_ok=True)
    (CASE/'overview.json').write_text(json.dumps(out,ensure_ascii=False,indent=2),encoding='utf-8')
    np.savez_compressed(CASE/'analysis_cache.npz',t=t,f=f,magnitude=mag,onset=onset,envs=envs)
    fig,ax=plt.subplots(3,1,figsize=(16,9),gridspec_kw={'height_ratios':[1,2,1]})
    ax[0].plot(secs,rms_sec);ax[0].set(xlabel='seconds',ylabel='RMS',title='Vulcanus: original recording, local signal inspection')
    ax[1].pcolormesh(t,f,20*np.log10(np.maximum(mag,1e-7)),vmin=-65,vmax=-20,shading='auto',cmap='magma',rasterized=True)
    ax[1].set(ylim=(40,5500),yscale='log',ylabel='Hz')
    ax[2].plot(t,onset,lw=.5);ax[2].set(xlabel='seconds',ylabel='spectral novelty')
    fig.tight_layout();fig.savefig(CASE/'overview.png',dpi=140);plt.close(fig)
    print(json.dumps(out,ensure_ascii=False,indent=2))

if __name__=='__main__': main()
