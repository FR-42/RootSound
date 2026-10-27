from pathlib import Path
import numpy as np
from scipy import signal, ndimage
from scipy.io import wavfile
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from analyze_vulcanus import CASE,SOURCE

SR,a=wavfile.read(SOURCE); mono=a.mean(1)
START=25.24; END=START+32*60/212
x=signal.resample_poly(mono[round(START*SR):round(END*SR)],1,2)
sr=SR//2
f,t,z=signal.stft(x,sr,nperseg=4096,noverlap=4096-120,boundary='zeros')
mag=np.abs(z)
med=ndimage.median_filter(mag,size=(1,17))
harm=med/(med+ndimage.median_filter(mag,size=(35,1))+1e-8)*mag
midi=np.arange(30,97); freq=440*2**((midi-69)/12)
scores=[]
for ff in freq:
    s=np.zeros(len(t))
    for h in range(1,9):
        target=ff*h; idx=np.argmin(abs(f-target))
        if idx>=len(f)-1: continue
        s+=np.max(harm[max(0,idx-1):idx+2],axis=0)/h**.65
    # Support fundamental rather than octave errors from strong higher harmonics.
    idx=np.argmin(abs(f-ff));s*=.5+np.sqrt(np.maximum(harm[idx],0))/(np.max(np.sqrt(harm),axis=0)+1e-8)
    scores.append(s)
scores=np.array(scores)
fig,axs=plt.subplots(3,1,figsize=(18,12),sharex=True)
axs[0].pcolormesh(t+START,f,20*np.log10(np.maximum(mag,1e-7)),vmin=-65,vmax=-28,cmap='magma',shading='auto');axs[0].set(ylim=(100,4000),yscale='log',ylabel='Hz')
axs[1].pcolormesh(t+START,midi,scores,shading='auto',cmap='magma');axs[1].set(ylabel='MIDI harmonic estimate',ylim=(36,96))
for ax in axs:
    for k in range(33): ax.axvline(START+k*60/212,alpha=.15,color='cyan')
axs[2].plot(np.arange(len(x))/sr+START,x,lw=.2);axs[2].set(xlabel='original seconds')
fig.tight_layout();fig.savefig(CASE/'segment_inspection.png',dpi=130)
np.savez_compressed(CASE/'segment_features.npz',t=t,f=f,magnitude=mag,harmonic=harm,midi=midi,scores=scores,start=START)
print('segment',START,END)
print('top lead pitch / every half beat:')
for k in range(64):
    active=(t>=k*30/212)&(t<(k+1)*30/212)
    s=scores[(midi>=60)&(midi<=88)][:,active].mean(1); order=np.argsort(s)[-3:][::-1]; pitches=midi[(midi>=60)&(midi<=88)]
    print(k,[(int(pitches[j]),round(float(s[j]),4)) for j in order])
