"""Signal estimates from local model outputs; no source is called ground truth."""
import json
from pathlib import Path
import numpy as np
from scipy import signal,ndimage
from scipy.io import wavfile

def read_stems(directory,start,duration,rate=48000):
    directory=Path(directory)
    evidence=json.loads((directory/'separation-evidence.json').read_text(encoding='utf-8'))
    offset=start-evidence['sourceStartSeconds'];n=round(duration*rate)
    if offset<0:raise ValueError('Requested case begins before model fragment.')
    stems={}
    for name in ['drums','bass','other','vocals']:
        r,x=wavfile.read(directory/(name+'.wav'))
        if r!=rate:x=signal.resample_poly(x,rate,r,axis=0)
        x=x[round(offset*rate):round(offset*rate)+n].astype(np.float32)
        if x.shape!=(n,2) or not np.isfinite(x).all():raise ValueError('Invalid model stem '+name)
        stems[name]=x
    return stems,evidence

def harmonic_features(audio,lo=28,hi=96,rate=48000):
    mono=audio.mean(1) if audio.ndim==2 else audio
    x=signal.resample_poly(mono,1,4);sr=rate//4
    f,t,z=signal.stft(x,sr,nperseg=8192,noverlap=8192-120,boundary='zeros')
    keep=(f>=max(28,440*2**((lo-69)/12)*.8))&(f<5500);f=f[keep];v=abs(z[keep]).astype(np.float32)
    midi=np.arange(lo,hi+1);freq=440*2**((midi-69)/12);w=np.zeros((len(f),len(midi)+3),np.float32)
    for j,ff in enumerate(freq):
        for h in range(1,35):
            if ff*h>f[-1]:break
            width=1.5+ff*h*.0018;w[:,j]+=np.exp(-.5*((f-ff*h)/width)**2)/h**.85
    for i in range(3):w[:,len(midi)+i]=(f/300)**(i-1)*np.exp(-f/7000)
    weight=1/np.maximum(ndimage.gaussian_filter1d(v.mean(1),10),.00003)**.65
    w*=weight[:,None];v*=weight[:,None];w/=np.sqrt((w*w).sum(0))[None,:]
    cross=w.T@v;gram=w.T@w;h=np.maximum(cross,.00001)
    for k in range(180):h*=np.maximum(cross-.002,1e-9)/(gram@h+1e-9)
    return dict(t=t,midi=midi,activation=h[:len(midi)])

def additive_bass(audio,pitch,rate=48000):
    # Read median energy around the selected fundamental and its partials. The
    # resulting oscillator phases are synthetic, not copied model source audio.
    mono=audio.mean(1);f,t,z=signal.stft(mono,rate,nperseg=32768,noverlap=16384)
    f0=440*2**((pitch-69)/12);p=abs(z)
    amps=[]
    for h in range(1,31):
        zone=abs(f-f0*h)<max(3,f0*h*.004)
        amps.append(float(np.percentile(p[zone].max(0),65)) if zone.any() else 0)
    amps=np.array(amps);amps/=max(amps.max(),1e-8)
    tt=np.arange(round(6*rate))/rate;out=np.zeros((len(tt),2))
    for c,detune in enumerate([-.0004,.0004]):
        for i,amp in enumerate(amps):
            out[:,c]+=amp*np.sin(2*np.pi*f0*(i+1)*(1+detune)*tt+.13*i)
    out=np.tanh(out*.85)*(.9+.1*np.exp(-tt/.03))[:,None]
    out*=.65/max(float(abs(out).max()),1e-8)
    return out.astype(np.float32),amps.tolist()
