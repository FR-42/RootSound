from pathlib import Path
import json
import numpy as np
from scipy import signal, ndimage
from scipy.io import wavfile
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
ROOT=Path(__file__).resolve().parent/'analysis'
sr,a=wavfile.read(ROOT/'reference-first20.wav'); mid=a.mean(axis=1).astype(float)
windows=[(3.05,3.9),(5.4,6.35),(9.1,10),(11.95,12.9),(13.45,14.4),(15.1,16.05),(16.85,17.8),(18.0,18.95)]
fig,axes=plt.subplots(4,2,figsize=(19,14))
for ax,(lo,hi) in zip(axes.flat,windows):
 y=mid[round(lo*sr):round(hi*sr)]
 f,t,z=signal.stft(y,sr,nperseg=2048,noverlap=2048-48,nfft=8192)
 ax.pcolormesh(t+lo,f,20*np.log10(abs(z)+1e-9),vmin=-58,vmax=-20,shading='auto',cmap='magma',rasterized=True)
 ax.set(yscale='log',ylim=(45,5000),xlim=(lo,hi),title=f'{lo}–{hi}s',ylabel='Hz',xlabel='seconds')
 ax.set_yticks([50,80,120,200,400,1000,2000,4000]);ax.set_yticklabels(['50','80','120','200','400','1k','2k','4k'])
fig.tight_layout();fig.savefig(ROOT/'attack-details.png',dpi=130);plt.close(fig)
