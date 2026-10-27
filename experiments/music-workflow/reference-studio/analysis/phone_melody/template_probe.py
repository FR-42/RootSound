"""Analysis-only lead tracking using accepted sample harmonic/template evidence.

No replacement audio is generated here. Existing accepted sources and sampler
remain read-only. All times are seconds relative to the selected45--53s clip.
"""
from pathlib import Path
import hashlib
import json
import sys
import numpy as np
from scipy import signal, ndimage, optimize
from scipy.io import wavfile
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

ROOT = Path(__file__).resolve().parents[2]
CASE = ROOT/'cases/phone-recording-20261023-233819'
tag=sys.argv[1] if len(sys.argv)>1 else '07'
paths={'07':'07-普通分轨基线.wav','A':'02-参考引导候选A.wav','B':'05-自动分离候选B.wav'}
OUT = CASE/('melody/template' if tag=='07' else 'melody/template-'+tag)
OUT.mkdir(parents=True, exist_ok=True)
SOURCE = CASE/'试听'/paths[tag]
fs, raw = wavfile.read(SOURCE)
x = raw.astype(np.float64)/2**31
assert fs == 48000 and x.shape == (384000,2)
# Summed stereo power avoids cancellation of a deliberately wide lead.
nfft, hop = 8192, 240
f,t,z = signal.stft(x,fs,axis=0,nperseg=nfft,noverlap=nfft-hop)
mag = np.sqrt(np.mean(abs(z)**2,axis=1))
midis = np.arange(48,94)
nominal = 440*2**((midis-69)/12)
harmonic = np.zeros((len(midis),len(t)))
parts = []
for i,f0 in enumerate(nominal):
    p=[]
    for h in range(1,11):
        # Wider support allows slight stereo detune, not adjacent semitones.
        ids=np.where(abs(f-f0*h)<max(11,f0*h*.007))[0]
        p.append(np.max(mag[ids],axis=0))
    parts.append(p)
parts=np.array(parts)
for h,w in enumerate([.17,.20,.32,.10,.10,.06,.02,.01,.01,.01]):
    local = parts[:,h]
    # Frequency-local normalization keeps a loud bass harmonic from dominating.
    floor=ndimage.percentile_filter(local,25,size=(7,1))+1e-6
    harmonic+=w*np.maximum(np.log1p(local/floor)-.2,0)

# Dictionary of each pitch's measured lead harmonic profile. Jointly fit lower
# equal-amplitude harmonic distractors rather than assigning their harmonics to
# new high notes. The template does not assume a key or a melody path.
mask=(f>=260)&(f<=10500)
freq=f[mask]
v=mag[mask]
whiten=1/np.maximum(ndimage.gaussian_filter1d(np.mean(v,axis=1),8),1e-5)**.55
profiles=[np.array([.30,.43,1,.18,.29,.19,.05,.06,.08,.025]),
          1/np.arange(1,11)**.75]
dictionary=[]
labels=[]
for family,profile in enumerate(profiles):
    for midi,f0 in zip(midis,nominal):
        # A hann-spectrum line plus detuned width approximates the stereo tone.
        col=np.zeros(len(freq))
        for h,weight in enumerate(profile,1):
            if f0*h>10500: continue
            width=max(5.2,f0*h*.003)
            col+=weight*np.exp(-.5*((freq-f0*h)/width)**2)
        dictionary.append(col*whiten)
        labels.append([int(family),int(midi)])
# Smooth nuisance spectrum absorbs nonpitched accompaniment.
for c in np.geomspace(300,10000,12):
    dictionary.append(np.exp(-.5*(np.log(freq/c)/.23)**2)*whiten)
    labels.append([2,float(c)])
D=np.array(dictionary).T
D/=np.maximum(np.linalg.norm(D,axis=0),1e-15)
V=v*whiten[:,None]
# Multiplicative nonnegative least-squares fit, then sparse shrinkage.
gram=D.T@D
cross=D.T@V
H=np.maximum(cross,1e-10)
for iteration in range(160):
    H*=cross/np.maximum(gram@H + .0003,1e-12)
lead=H[:len(midis)]
generic=H[len(midis):2*len(midis)]

np.savez_compressed(OUT/'template-evidence.npz',times=t,frequencies=f,
    midis=midis,magnitude=mag,harmonic=harmonic,lead=lead,generic=generic,parts=parts)
rows=[]
for seconds in np.arange(.075,7.96,.05):
    k=np.argmin(abs(t-seconds))
    # Focus on the established high lead while retaining lower evidence arrays.
    ids=np.where((midis>=70)&(midis<=86))[0]
    top=ids[np.argsort(lead[ids,k])[-4:]][::-1]
    hs=ids[np.argsort(harmonic[ids,k])[-4:]][::-1]
    rows.append({'time':round(float(seconds),3),
        'template':[[int(midis[q]),round(float(lead[q,k]),4)] for q in top],
        'harmonic':[[int(midis[q]),round(float(harmonic[q,k]),4)] for q in hs]})
(OUT/'frame-candidates.json').write_text(json.dumps(rows,indent=2),encoding='utf-8')

for a,b in [(0,4),(4,8)]:
    fig,ax=plt.subplots(3,1,figsize=(18,11),sharex=True)
    freqsel=(f>500)&(f<6000)
    ax[0].pcolormesh(t,f[freqsel],20*np.log10(mag[freqsel]+1e-7),
                    vmin=-75,vmax=-35,shading='auto',cmap='magma')
    ax[0].set_yscale('log');ax[0].set_ylabel('spectrum Hz')
    for midi in range(72,86):
        hz=440*2**((midi-69)/12)
        ax[0].axhline(hz,alpha=.17,color='white')
        ax[0].text(a,hz,str(midi),color='white',fontsize=7)
    ax[1].pcolormesh(t,midis,lead,shading='nearest',cmap='viridis')
    ax[1].set_ylabel('sample harmonic template');ax[1].set_ylim(68,88)
    ax[2].pcolormesh(t,midis,harmonic,shading='nearest',cmap='viridis')
    ax[2].set_ylabel('whitened harmonic evidence');ax[2].set_ylim(68,88)
    for aa in ax:
        aa.set_xlim(a,b);aa.set_xticks(np.arange(a,b+.01,.1));aa.grid(axis='x',alpha=.2)
    for aa in ax[1:]:
        aa.set_yticks(np.arange(68,89));aa.grid(axis='y',alpha=.2)
    ax[2].set_xlabel('seconds in selected07; original time +45s')
    fig.tight_layout();fig.savefig(OUT/f'lead-{a}-{b}.png',dpi=125);plt.close(fig)
print(json.dumps({'output':str(OUT),'sourceSha256':hashlib.sha256(SOURCE.read_bytes()).hexdigest(),
                  'frames':len(t),'duration':len(x)/fs}))
