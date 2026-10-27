"""Harmonic-template activation estimates, not isolated instrument stems."""
import json
import numpy as np
from scipy import signal,ndimage
from scipy.io import wavfile
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from analyze_vulcanus import CASE,SOURCE

START=25.345; BPM=212.; BEAT=60/BPM; BARS=8
r,a=wavfile.read(SOURCE); x=signal.resample_poly(a.mean(1)[round(START*r):round((START+BARS*4*BEAT)*r)],1,4)
sr=r//4
f,t,z=signal.stft(x,sr,nperseg=8192,noverlap=8192-120,boundary='zeros'); v=abs(z).astype(np.float32)
keep=(f>=35)&(f<5500); f=f[keep]; v=v[keep]
midi=np.arange(28,97); freq=440*2**((midi-69)/12)
w=np.zeros((len(f),len(midi)+3),dtype=np.float32)
for j,ff in enumerate(freq):
    for h in range(1,35):
        if ff*h>f[-1]:break
        width=1.5+ff*h*.0018
        w[:,j]+=np.exp(-.5*((f-ff*h)/width)**2)/h**.85
for i in range(3):w[:,len(midi)+i]=(f/300)**(i-1)*np.exp(-f/7000)
# Whiten shared spectral envelope so the bass cannot dominate all activations.
weight=1/np.maximum(ndimage.gaussian_filter1d(v.mean(1),10),.00003)**.65
w*=weight[:,None];v*=weight[:,None]
norm=np.sqrt(np.sum(w*w,axis=0));w/=norm[None,:]
cross=w.T@v; gram=w.T@w
h=np.maximum(cross,.00001)
for k in range(180):h*=np.maximum(cross-.002,1e-9)/(gram@h+1e-9)
h=h[:len(midi)]
np.savez_compressed(CASE/'transcription_features.npz',t=t,midi=midi,activation=h,start=START,bpm=BPM)
fig,axs=plt.subplots(2,1,figsize=(18,10),sharex=True)
for ax,lo,hi in [(axs[0],58,92),(axs[1],28,58)]:
    pick=(midi>=lo)&(midi<=hi)
    ax.pcolormesh(t+START,midi[pick],h[pick],shading='auto',cmap='magma')
    for beat in range(BARS*4+1):ax.axvline(START+beat*BEAT,color='cyan',alpha=.2 if beat%4 else .7)
    ax.set(ylabel='MIDI harmonic activation',ylim=(lo-.5,hi+.5),yticks=np.arange(lo,hi+1,2))
axs[1].set(xlabel='original seconds');fig.tight_layout();fig.savefig(CASE/'pitch_estimates.png',dpi=150)
for k in range(64):
    active=(t>=k*BEAT/2+.025)&(t<(k+1)*BEAT/2-.01)
    averages=h[:,active].mean(1)
    p=(midi>=60)&(midi<=90);order=np.argsort(averages[p])[-3:][::-1]
    p2=(midi>=30)&(midi<=53);o2=np.argsort(averages[p2])[-2:][::-1]
    print(k, 'lead',[(int(midi[p][i]),round(float(averages[p][i]),3)) for i in order], 'bass',[(int(midi[p2][i]),round(float(averages[p2][i]),3)) for i in o2])
