"""Independent actual-recorded-sample spectral matching; no waveform outputs."""
from pathlib import Path
from fractions import Fraction
import hashlib
import json
import argparse
import numpy as np
from scipy import signal, ndimage
from scipy.io import wavfile
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

ROOT = Path(__file__).resolve().parents[3]
CASE = ROOT/'cases/phone-recording-20261023-233819'
OUT = CASE/'melody/sample-match'
parser=argparse.ArgumentParser()
parser.add_argument('--maximum-midi',type=int,default=88)
args=parser.parse_args()
assert 88<=args.maximum_midi<=108
if args.maximum_midi!=88:
    OUT=OUT/('extended-'+str(args.maximum_midi))
OUT.mkdir(parents=True, exist_ok=True)
SOURCE = CASE/'试听/07-普通分轨基线.wav'
SAMPLE = CASE/'instrument/prepared/melody-note-Gs5.wav'
fs, raw = wavfile.read(SOURCE)
assert fs == 48000
x = raw.astype(np.float64)/2**31
fs2, sample = wavfile.read(SAMPLE)
assert fs2 == fs
sample = sample.astype(np.float64)
nfft, hop = 8192, 240
f,t,z = signal.stft(x,fs,axis=0,nperseg=nfft,noverlap=nfft-hop)
mag = np.sqrt(np.mean(abs(z)**2,axis=1))
midis = np.arange(60,args.maximum_midi+1)
measured = []
for midi in midis:
    ratio = 2**((midi-80)/12)
    frac = Fraction(1/ratio).limit_denominator(4096)
    pitched = signal.resample_poly(sample, frac.numerator, frac.denominator, axis=0)
    # A fixed nfft is required even for high notes shorter than a window.
    padded = np.pad(pitched, ((0,max(0,nfft-len(pitched))),(0,0)))
    ff,tt,zz = signal.stft(padded,fs,axis=0,nperseg=nfft,noverlap=nfft-hop)
    spectrum = np.sqrt(np.mean(abs(zz)**2,axis=1))
    stable = (tt>=.03/ratio)&(tt<=.20/ratio)
    measured.append(np.mean(spectrum[:,stable],axis=1))
measured = np.array(measured).T

results = {}
for lower in [500,1300]:
    mask = (f>=lower)&(f<=10500)
    freq, v = f[mask], mag[mask]
    whitening = 1/np.maximum(ndimage.gaussian_filter1d(np.mean(v,axis=1),10),1e-5)**.62
    columns = [col[mask]*whitening for col in measured.T]
    labels = [['sample',int(m)] for m in midis]
    # Generic simultaneous low voices absorb ordinary accompaniment harmonics.
    # No musical scale or melodic continuity is assumed.
    for m in range(43,83):
        f0 = 440*2**((m-69)/12)
        col = np.zeros(len(freq))
        for h in range(1,20):
            hz = f0*h
            if hz>10500: break
            col += h**-.75*np.exp(-.5*((freq-hz)/max(6,hz*.003))**2)
        columns.append(col*whitening); labels.append(['generic',m])
    for center in np.geomspace(lower,10500,16):
        columns.append(np.exp(-.5*(np.log(freq/center)/.20)**2)*whitening)
        labels.append(['noise',float(center)])
    D = np.array(columns).T
    D /= np.maximum(np.linalg.norm(D,axis=0),1e-16)
    V = v*whitening[:,None]
    gram, cross = D.T@D, D.T@V
    H = np.maximum(cross,1e-12)
    for iteration in range(180):
        H *= cross/np.maximum(gram@H+.00015,1e-12)
    lead = H[:len(midis)]
    results[str(lower)] = lead

# Exact full-sample fitting above can match accompaniment frozen into the
# source sample. A second diagnostic keeps only its coherent 830.927 Hz
# harmonic partials and fits separately from the full measured spectrum.
for lower in [500,1300]:
    mask=(f>=lower)&(f<=10500)
    freq,v=f[mask],mag[mask]
    whitening=1/np.maximum(ndimage.gaussian_filter1d(np.mean(v,axis=1),10),1e-5)**.62
    cols=[]
    for midi,col in zip(midis,measured.T):
        root=830.9271*2**((midi-80)/12)
        comb=np.zeros(len(f))
        for h in range(1,15):
            if root*h>11000:break
            comb=np.maximum(comb,np.exp(-.5*((f-root*h)/max(8,root*h*.0035))**4))
        cols.append((col*comb)[mask]*whitening)
    for m in range(43,72):
        root=440*2**((m-69)/12)
        col=np.zeros(len(freq))
        for h in range(1,25):
            if root*h>10500:break
            col+=h**-.8*np.exp(-.5*((freq-root*h)/max(6,root*h*.003))**2)
        cols.append(col*whitening)
    for center in np.geomspace(lower,10500,16):
        cols.append(np.exp(-.5*(np.log(freq/center)/.20)**2)*whitening)
    D=np.array(cols).T
    D/=np.maximum(np.linalg.norm(D,axis=0),1e-16)
    V=v*whitening[:,None]
    gram,cross=D.T@D,D.T@V
    H=np.maximum(cross,1e-12)
    for iteration in range(180):
        H*=cross/np.maximum(gram@H+.00015,1e-12)
    results['comb'+str(lower)]=H[:len(midis)]

np.savez_compressed(OUT/'sample-evidence.npz',times=t,midis=midis,frequencies=f,
    magnitude=mag,measuredSpectra=measured,
    lead500=results['500'],lead1300=results['1300'],
    comb500=results['comb500'],comb1300=results['comb1300'])
rows=[]
for sec in np.arange(.025,7.99,.025):
    k=np.argmin(abs(t-sec))
    row={'time':round(float(sec),3)}
    for key,lead in results.items():
        top=np.argsort(lead[:,k])[-5:][::-1]
        row['match'+key]=[[int(midis[q]),round(float(lead[q,k]),5)] for q in top]
    rows.append(row)
(OUT/'frame-candidates.json').write_text(json.dumps(rows,indent=2),encoding='utf-8')

# Candidate runs of strongest sample component, confidence from independent
# frequency bands and the margin to competing sample pitches. Not final notes.
combined=np.sqrt(results['comb500']*results['comb1300'])
best=np.argmax(combined,axis=0)
best=ndimage.median_filter(best,size=5)
runs=[]
start=0
for k in range(1,len(t)+1):
    if k<len(t) and best[k]==best[start]: continue
    a,b=max(0,t[start]-.0025),min(8,t[k-1]+.0025)
    if b-a>=.025:
        q=best[start]; section=combined[:,start:k]
        other=section.copy();other[q]=0
        margin=float(np.mean(section[q])/max(1e-10,np.mean(np.max(other,axis=0))))
        runs.append({'start':round(float(a),4),'end':round(float(b),4),
            'midi':int(midis[q]),'relativeDominance':round(margin,3),
            'twoBandsAgreeFraction':round(float(np.mean(np.argmax(results['comb500'][:,start:k],axis=0)==
                np.argmax(results['comb1300'][:,start:k],axis=0))),3)})
    start=k
(OUT/'candidate-runs.json').write_text(json.dumps(runs,indent=2),encoding='utf-8')
for a,b in [(0,4),(4,8)]:
    fig,axes=plt.subplots(3,1,figsize=(18,11),sharex=True)
    freqsel=(f>=500)&(f<=6200)
    axes[0].pcolormesh(t,f[freqsel],20*np.log10(mag[freqsel]+1e-8),
        shading='auto',cmap='magma',vmin=-75,vmax=-35)
    axes[0].set_yscale('log');axes[0].set_ylabel('stereo power spectrum Hz')
    for ax,key in zip(axes[1:],['comb500','comb1300']):
        normalized=results[key]/np.maximum(np.max(results[key],axis=0,keepdims=True),1e-7)
        ax.pcolormesh(t,midis,normalized,shading='nearest',cmap='viridis',vmin=0,vmax=1)
        ax.set_ylim(60,args.maximum_midi+1);ax.set_yticks(np.arange(60,args.maximum_midi+2));ax.grid(axis='y',alpha=.2)
        ax.set_ylabel('sample MIDI >= '+key+'Hz')
    for ax in axes:
        ax.set_xlim(a,b);ax.set_xticks(np.arange(a,b+.01,.1));ax.grid(axis='x',alpha=.2)
    fig.tight_layout();fig.savefig(OUT/f'match-{a}-{b}.png',dpi=120);plt.close(fig)
print(json.dumps({'output':str(OUT),'sourceSha256':hashlib.sha256(SOURCE.read_bytes()).hexdigest(),
                  'sampleSha256':hashlib.sha256(SAMPLE.read_bytes()).hexdigest(),'runs':runs}))
