from pathlib import Path
import json
import sys
import numpy as np
from scipy.io import wavfile
from scipy import signal
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
HERE=Path(__file__).resolve().parent
OUT=Path(sys.argv[1]).resolve() if len(sys.argv)>1 else HERE/'delivery-final'
report=json.loads((OUT/'generation-verification.json').read_text(encoding='utf8'))
rows=[];fig,axes=plt.subplots(2,3,figsize=(16,8))
for row,p in enumerate(report['patches']):
    sr,data=wavfile.read(OUT/(p['name']+'-单击.wav'))
    if sr!=48000 or data.dtype!=np.int32 or data.ndim!=2 or data.shape[1]!=2:
        raise ValueError('Not PCM24 stereo48k')
    if np.any(data & 255):raise ValueError('Not 24-bit PCM')
    data=data.astype(float)/2147483648
    floats=np.fromfile(OUT/(p['name']+'.f32'),dtype='<f4').reshape(-1,2)
    err=float(abs(data-floats).max())
    if err>1.3e-7 or abs(data).max()>=.97 or not np.isfinite(data).all():raise ValueError('Invalid quantization/headroom')
    mono=data.mean(axis=1);time=np.arange(len(mono))/sr
    energy=np.cumsum(mono**2);energy/=energy[-1]
    t99=float(time[np.searchsorted(energy,.99)])
    env=np.sqrt(np.convolve(mono**2,np.ones(192)/192,mode='same'))
    axes[row,0].plot(time,mono,lw=.6);axes[row,0].plot(time,env,'k',lw=1);axes[row,0].set(xlim=(0,.32),title=f'{p["id"]} waveform and 4ms RMS',xlabel='Seconds')
    f,t,z=signal.stft(mono,sr,nperseg=1536,noverlap=1536-96,nfft=8192)
    axes[row,1].pcolormesh(t,f,20*np.log10(abs(z)+1e-10),cmap='magma',vmin=-60,vmax=-15,shading='auto',rasterized=True)
    axes[row,1].set(xlim=(0,.28),ylim=(30,6000),yscale='log',title=f'{p["id"]} native synth output',xlabel='Seconds',ylabel='Hz')
    profiles={}
    for lo,hi in [(0,.025),(.025,.08),(.08,.17)]:
        seg=mono[round(lo*sr):round(hi*sr)];freq,ps=signal.periodogram(seg,sr,nfft=32768)
        axes[row,2].semilogx(freq,10*np.log10(ps+1e-15),label=f'{lo:.3f}–{hi:.3f}s')
        mask=(freq>=35)&(freq<250);profiles[f'{lo}-{hi}']=round(float(freq[mask][np.argmax(ps[mask])]),3)
    axes[row,2].set(xlim=(30,10000),ylim=(-115,-20),title=f'{p["id"]} evolving spectrum',xlabel='Hz');axes[row,2].legend()
    rows.append({'id':p['id'],'quantizationMaximumError':err,'energy99Seconds':t99,'windowPeakHz':profiles,
                 'peak':float(abs(data).max()),'last60msPeak':float(abs(data[-2880:]).max())})
if not rows[1]['energy99Seconds']>rows[0]['energy99Seconds']:
    raise ValueError('B is not longer than A')
fig.tight_layout();fig.savefig(HERE/'analysis'/'native-output-check.png',dpi=140);plt.close(fig)
(OUT/'audio-measurements.json').write_text(json.dumps({'items':rows,'subjectiveMatchVerified':False},indent=2),encoding='utf8')
print(json.dumps(rows))
