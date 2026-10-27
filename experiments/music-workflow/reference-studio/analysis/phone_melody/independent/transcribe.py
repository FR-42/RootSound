from pathlib import Path
import json
import numpy as np
from scipy import signal, ndimage
from scipy.io import wavfile
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

ROOT=Path(__file__).resolve().parents[3]
CASE=ROOT/'cases/phone-recording-20261023-233819'
OUT=CASE/'melody/independent'
OUT.mkdir(parents=True,exist_ok=True)
fs,raw=wavfile.read(CASE/'试听/07-普通分轨基线.wav')
x=raw.astype(float)/(2**31)
x=x.mean(axis=1)
N=8192; hop=120
f,t,z=signal.stft(x,fs,nperseg=N,noverlap=N-hop,boundary='zeros')
mag=abs(z)
midis=np.arange(65,97)
hs=np.arange(1,13)
H=np.zeros((len(midis),len(hs),len(t)))
for i,m in enumerate(midis):
    f0=440*2**((m-69)/12)
    for j,h in enumerate(hs):
        center=f0*h
        ids=np.where(abs(f-center)<max(fs/N*1.25,center*.003))[0]
        if not len(ids): continue
        H[i,j]=mag[ids].max(axis=0)
# Local off-line background: geometric aggregate avoids a single accompanying
# harmonic dominating. Preserve linear amplitude map for manual inspection.
env=ndimage.gaussian_filter1d(mag,5,axis=0)+np.max(mag)*.0005
white_mag=mag/env
W=np.zeros_like(H)
for i,m in enumerate(midis):
    f0=440*2**((m-69)/12)
    for j,h in enumerate(hs):
        center=f0*h; ids=np.where(abs(f-center)<max(fs/N*1.25,center*.003))[0]
        if not len(ids): continue
        W[i,j]=white_mag[ids].max(axis=0)
scores=np.mean(np.log(np.maximum(W[:,:8],.05)),axis=1)
score_amp=np.mean(np.log(np.maximum(H[:,:8],1e-9)),axis=1)
for k,(a,b) in enumerate([(0,2),(2,4),(4,6),(6,8)]):
    fig,ax=plt.subplots(4,1,figsize=(18,11),sharex=True)
    mask=(f>480)&(f<2100)
    ax[0].pcolormesh(t,69+12*np.log2(f[mask]/440),20*np.log10(mag[mask]+1e-9),vmin=-85,vmax=-35,cmap='magma',shading='auto')
    ax[1].pcolormesh(t,midis,scores,vmin=-.3,vmax=1,cmap='viridis',shading='nearest')
    ax[2].pcolormesh(t,midis,20*np.log10(H[:,0]+1e-9),vmin=-85,vmax=-35,cmap='magma',shading='nearest')
    ax[3].pcolormesh(t,midis,score_amp,vmin=-10,vmax=-5,cmap='magma',shading='nearest')
    for ai in ax:
        ai.set_xlim(a,b); ai.set_ylim(65,96); ai.set_yticks(midis);ai.set_xticks(np.arange(a,b+.001,.05));ai.grid(alpha=.2)
    fig.tight_layout();fig.savefig(OUT/f'pitch-{k}.png',dpi=140);plt.close(fig)
np.savez(OUT/'scores.npz',midis=midis,times=t,harmonics=H,white=W,scores=scores)
rows=[]
for q in np.arange(.05,8,.05):
    ti=np.argmin(abs(t-q)); idx=np.argsort(scores[:,ti])[-5:][::-1]
    rows.append({'time':round(float(q),3),'candidates':[[int(midis[i]),round(float(scores[i,ti]),3)]for i in idx]})
(OUT/'pitch-candidates.json').write_text(json.dumps(rows,indent=2),encoding='utf8')
print(OUT)
