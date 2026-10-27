from pathlib import Path
import numpy as np
from scipy import signal,ndimage
from scipy.io import wavfile
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
ROOT=Path(__file__).resolve().parents[3]; CASE=ROOT/'cases/phone-recording-20261023-233819';OUT=CASE/'melody/independent'
for prefix in ['02-','05-']:
    src=next((CASE/'试听').glob(prefix+'*.wav'))
    fs,raw=wavfile.read(src);x=(raw.astype(float)/(2**31)).mean(1)
    N=8192;hop=120
    f,t,z=signal.stft(x,fs,nperseg=N,noverlap=N-hop,boundary='zeros')
    mag=abs(z);midis=np.arange(60,97);hs=np.arange(1,11);H=np.zeros((len(midis),len(hs),len(t)))
    for i,m in enumerate(midis):
        f0=440*2**((m-69)/12)
        for j,h in enumerate(hs):
            center=f0*h;ids=np.where(abs(f-center)<max(fs/N*1.25,center*.003))[0]
            if len(ids):H[i,j]=mag[ids].max(axis=0)
    np.savez(OUT/f'alternative-{prefix[:2]}.npz',midis=midis,times=t,harmonics=H)
    for a,b in [(0,4),(4,8)]:
        fig,ax=plt.subplots(3,1,figsize=(18,9),sharex=True)
        mask=(f>250)&(f<2100)
        ax[0].pcolormesh(t,69+12*np.log2(f[mask]/440),20*np.log10(mag[mask]+1e-9),vmin=-85,vmax=-40,cmap='magma',shading='auto')
        for ai,j in zip(ax[1:],[0,2]):
            ai.pcolormesh(t,midis,20*np.log10(H[:,j]+1e-9),vmin=-85,vmax=-40,cmap='magma',shading='nearest')
            ai.set_title(f'Harmonic {j+1}')
        for ai in ax:
            ai.set_xlim(a,b);ai.set_ylim(60,96);ai.set_yticks(midis);ai.set_xticks(np.arange(a,b+.001,.1));ai.grid(alpha=.25)
        fig.tight_layout();fig.savefig(OUT/f'alt-{prefix[:2]}-{a}-{b}.png',dpi=150);plt.close(fig)
print('done')
