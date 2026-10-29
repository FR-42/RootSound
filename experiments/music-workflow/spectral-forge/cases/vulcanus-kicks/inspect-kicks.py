"""Read-only first-20-second kick evidence. Mixture events, not isolated stems."""
from pathlib import Path
import json, hashlib
import numpy as np
from scipy import signal, ndimage
from scipy.io import wavfile
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

HERE = Path(__file__).resolve().parent
OUT = HERE / 'analysis'
sr, stereo = wavfile.read(OUT / 'reference-first20.wav')
stereo = stereo.astype(float)
mid = stereo.mean(axis=1)
side = (stereo[:, 0] - stereo[:, 1]) / 2
bands = [(28, 85), (85, 180), (180, 450), (450, 1500), (1500, 5000), (5000, 14000)]
hop = 96
envelopes = []
filtered = []
for low, high in bands:
    y = signal.sosfiltfilt(signal.butter(3, [low, high], btype='bandpass', fs=sr, output='sos'), mid)
    filtered.append(y)
    envelopes.append(np.sqrt(ndimage.uniform_filter1d(y*y, size=384)[::hop] + 1e-20))
envelopes = np.array(envelopes)
times = np.arange(envelopes.shape[1]) * hop / sr
low_energy = np.sqrt(envelopes[0]**2 + envelopes[1]**2)
past = ndimage.uniform_filter1d(low_energy, 80, origin=39)
rise = np.maximum(0, low_energy - past)
peaks, props = signal.find_peaks(rise, distance=50, prominence=np.percentile(rise, 90)*.12)
events = []
for k, peak in enumerate(peaks):
    search = max(0, peak - 35)
    segment = low_energy[search:peak+1]
    gradient = np.diff(ndimage.gaussian_filter1d(segment, 1.5), prepend=segment[0])
    onset = search + int(np.argmax(gradient))
    onset = max(0, onset-2)
    at = int(onset*hop)
    duration = min(.25, 20 - at/sr)
    if duration < .24:
        continue
    window = slice(onset, min(onset+125, envelopes.shape[1]))
    energy = np.mean(envelopes[:, window]**2, axis=1)
    amp = low_energy[window]
    moments = [float(np.mean(amp[int(a/.002):max(int(b/.002),int(a/.002)+1)])) for a,b in [(0,.03),(.03,.08),(.08,.15),(.15,.24)]]
    chunk = mid[at:at+int(.24*sr)]
    f, t, z = signal.stft(chunk, sr, nperseg=2048, noverlap=1952, boundary='zeros')
    mask = (f >= 35) & (f <= 260)
    ridge = f[mask][np.argmax(abs(z[mask]), axis=0)]
    events.append({'id': k+1, 'onsetSeconds': round(at/sr,4), 'lowPeak': round(float(amp.max()),5),
        'riseScore': round(float(rise[peak]),5), 'bandsDb': np.round(10*np.log10(energy+1e-20),1).tolist(),
        'decayWindows': np.round(moments,5).tolist(),
        'lowRidgeHz': [round(float(np.median(ridge[(t>=a)&(t<b)])),1) for a,b in [(0,.03),(.03,.07),(.07,.12),(.12,.20)]],
        'sideToMidDb': round(float(10*np.log10((np.mean(side[at:at+len(chunk)]**2)+1e-20)/(np.mean(chunk**2)+1e-20))),2)})

report = {'source': r'D:\Sound\temp\music\vulcanus.mp3',
    'sourceSha256': hashlib.sha256(Path(r'D:\Sound\temp\music\vulcanus.mp3').read_bytes()).hexdigest(),
    'sampleRate': sr, 'referenceWindowSeconds': [0,20], 'bandsHz': bands,
    'method': 'Low-band RMS onset proposals and short-window mixture spectral ridges; not automatic instrument labels or clean stems.',
    'events': events, 'audioInputSupported': False, 'listeningAccepted': False}
(OUT/'kick-events.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf8')
np.savez_compressed(OUT/'features.npz', sr=sr, times=times, envelopes=envelopes, mid=mid, side=side)
fig, axes = plt.subplots(3,1,figsize=(19,12),sharex=True)
for i in range(3):
    axes[0].plot(times,20*np.log10(envelopes[i]+1e-8),label=str(bands[i]))
axes[0].set(ylim=(-70,-8),ylabel='Band RMS (dB)');axes[0].legend()
f,t,z = signal.stft(mid,sr,nperseg=4096,noverlap=4096-240)
axes[1].pcolormesh(t,f,20*np.log10(abs(z)+1e-9),vmin=-65,vmax=-20,shading='auto',cmap='magma',rasterized=True)
axes[1].set(yscale='log',ylim=(25,3000),ylabel='Hz')
for i in range(3,6):
    axes[2].plot(times,20*np.log10(envelopes[i]+1e-8),label=str(bands[i]))
for event in events:
    if event['lowPeak'] > .018:
        for ax in axes:
            ax.axvline(event['onsetSeconds'],color='grey',lw=.5,alpha=.6)
        axes[0].text(event['onsetSeconds'], -10, str(event['id']),fontsize=7,rotation=90)
axes[2].set(ylim=(-75,-8),xlim=(0,20),xlabel='Seconds',ylabel='Band RMS (dB)');axes[2].legend()
fig.tight_layout();fig.savefig(OUT/'first20-kick-evidence.png',dpi=140);plt.close(fig)
print(json.dumps({'count':len(events),'report':str(OUT/'kick-events.json')},ensure_ascii=False))
