"""Offline evidence about a possible sustained bed; no instrument recognition."""
from pathlib import Path
import json, hashlib
import numpy as np
from scipy import signal, ndimage
from scipy.io import wavfile
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

HERE = Path(__file__).resolve().parent
SOURCE = Path(r'D:\Sound\temp\music\vulcanus.mp3')
CACHE = Path(r'D:\RootSound\experiments\music-workflow\original-pilot\analysis\reference\reference-private-0-20.wav')
sr, stereo = wavfile.read(CACHE)
stereo = stereo.astype(np.float64)
mid = stereo.mean(axis=1)
side = (stereo[:, 0] - stereo[:, 1]) / 2
freq, times, mid_stft = signal.stft(mid, sr, nperseg=8192, noverlap=8192-441, boundary=None)
_, _, side_stft = signal.stft(side, sr, nperseg=8192, noverlap=8192-441, boundary=None)
mag_m, mag_s = abs(mid_stft), abs(side_stft)
stable_m = ndimage.median_filter(mag_m, size=(1, 61))
stable_s = ndimage.median_filter(mag_s, size=(1, 61))
bands = [(40,150),(150,350),(350,700),(700,1500),(1500,3500),(3500,7000),(7000,14000)]
windows = [(1.7,2.25),(2.45,4.4),(4.6,6.6),(6.9,8.8),(9.2,11),(11.4,13.35),(13.7,15.7),(16,18),(18.3,20)]
rows = []
for lo, hi in windows:
    mask = (times >= lo) & (times < hi)
    sm = stable_m[:, mask].mean(axis=1)
    ss = stable_s[:, mask].mean(axis=1)
    peaks, prop = signal.find_peaks(ss, distance=3, prominence=max(ss.max()*.008,1e-10))
    peaks = [p for p in peaks if 140 < freq[p] < 6000]
    peaks = sorted(peaks, key=lambda p: ss[p], reverse=True)[:25]
    peak_rows = []
    for p in peaks:
        midi = 69 + 12*np.log2(freq[p]/440)
        peak_rows.append({'hz':round(float(freq[p]),2),'db':round(float(20*np.log10(ss[p]+1e-12)),2),
          'nearMidi':round(float(midi),2),'sideToMidDb':round(float(20*np.log10((ss[p]+1e-12)/(sm[p]+1e-12))),2)})
    b = []
    for low, high in bands:
        idx = (freq>=low)&(freq<high)
        pm = float(np.square(stable_m[idx][:, mask]).sum())
        ps = float(np.square(stable_s[idx][:, mask]).sum())
        b.append({'lo':low,'hi':high,'sideToMidDb':round(float(10*np.log10((ps+1e-20)/(pm+1e-20))),2),
          'stableSidePower':ps,'stableMidPower':pm})
    rows.append({'start':lo,'end':hi,'sideStablePeaks':peak_rows,'bands':b})

# Curves below summarize the mixture's sustained side component, not an isolated
# instrument response. They can constrain broad spectral/width choices only.
active = (times>=2.4)&(times<20)
profile_m = np.sqrt(np.mean(stable_m[:,active]**2,axis=1))
profile_s = np.sqrt(np.mean(stable_s[:,active]**2,axis=1))
center_hz = np.geomspace(80,16000,64)
spectral = []
for f in center_hz:
    idx=(freq>=f/2**(1/6))&(freq<f*2**(1/6))
    spectral.append({'hz':round(float(f),3),'sideDensityDb':round(float(20*np.log10(np.sqrt(np.mean(profile_s[idx]**2))+1e-12)),3),
      'midDensityDb':round(float(20*np.log10(np.sqrt(np.mean(profile_m[idx]**2))+1e-12)),3)})

report={'source':str(SOURCE),'sourceSha256':hashlib.sha256(SOURCE.read_bytes()).hexdigest(),
  'decodedCache':str(CACHE),'sampleRate':int(sr),'windowSeconds':[0,20],
  'method':'M/S STFT, 8192 samples, 441-sample hop; 610 ms median along time removes short bursts approximately. No source model or audio-device playback.',
  'windows':rows,'broadMixtureProfile':spectral,
  'limitations':['Side channel is not an isolated pad: it includes stereo lead, vocal effects, percussion and ambience.',
    'Peak pitch annotations include harmonics; they do not prove fundamentals or chord notes.',
    'Time median does not identify artistic timbre or distinguish a sustained voice from a sustained synth.',
    'No listening or subjective match acceptance was performed.']}
HERE.mkdir(parents=True,exist_ok=True)
(HERE/'pad-evidence.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
fig, axes=plt.subplots(3,1,figsize=(16,11),sharex=True)
for ax, data, title in zip(axes[:2],[stable_m,stable_s],['Time-stable MID mixture','Time-stable SIDE mixture']):
    ax.pcolormesh(times,freq,20*np.log10(data+1e-8),shading='auto',cmap='magma',vmin=-75,vmax=-28,rasterized=True)
    ax.set(ylim=(100,8000),yscale='log',ylabel='Hz',title=title)
for low, high in [(150,700),(700,3500),(3500,10000)]:
    idx=(freq>=low)&(freq<high)
    pm=np.square(stable_m[idx]).sum(axis=0)
    ps=np.square(stable_s[idx]).sum(axis=0)
    axes[2].plot(times,10*np.log10((ps+1e-15)/(pm+1e-15)),label=f'{low}-{high} Hz S/M')
axes[2].legend();axes[2].set(ylabel='Side/Mid dB',xlabel='Seconds',ylim=(-35,10),xlim=(0,20))
fig.tight_layout();fig.savefig(HERE/'mid-side-stable.png',dpi=130);plt.close(fig)
print(json.dumps({'report':str(HERE/'pad-evidence.json'),'windows':[{k:r[k] for k in ['start','end','sideStablePeaks','bands']} for r in rows[:3]]},ensure_ascii=False,indent=2))
