"""Inspect accepted phone stem without changing or auditioning its samples.

This produces pitch/onset evidence only. A spectral match is not proof that a
single clean source has been isolated. All times are relative to selected 07.
"""
from pathlib import Path
import json
import hashlib
import numpy as np
from scipy.io import wavfile
from scipy import signal, ndimage
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / "cases/phone-recording-20261023-233819/试听/07-普通分轨基线.wav"
OUT = ROOT / "cases/phone-recording-20261023-233819/instrument/pitch-analysis"
OUT.mkdir(parents=True, exist_ok=True)

fs, raw = wavfile.read(SOURCE)
x = raw.astype(np.float64) / (2.0**31 if raw.dtype == np.int32 else 2.0**15)
mono = x.mean(axis=1)
freqs, times, stft = signal.stft(mono, fs, nperseg=8192, noverlap=8192-240,
                                boundary="zeros", padded=True)
mag = np.abs(stft)
# Smooth spectral-envelope whitening keeps broad resonances from dominating
# harmonic evidence. It is analysis only; output audio is never filtered.
envelope = ndimage.gaussian_filter1d(mag, 12, axis=0)
white = mag / (envelope + np.max(mag)*0.002)
white = np.sqrt(np.maximum(white-0.4, 0))
midis = np.arange(36, 97)
scores = np.zeros((len(midis), len(times)))
for k, midi in enumerate(midis):
    f0 = 440*2.0**((midi-69)/12)
    for h in range(1, min(17, int(12000/f0))):
        b = int(round(f0*h/(fs/8192)))
        scores[k] += np.max(white[max(0,b-1):b+2], axis=0)/h**0.7
scores = ndimage.gaussian_filter1d(scores, 1.4, axis=1)

# Flux with less temporal blur locates attacks; does not label their source.
ff, tt, zz = signal.stft(mono, fs, nperseg=1024, noverlap=784,
                        boundary="zeros", padded=True)
mm = np.abs(zz)
flux = np.maximum(np.diff(np.log1p(mm*1000), axis=1),0)
flux = flux[(ff>250)&(ff<12000)].sum(axis=0)
onsets,_ = signal.find_peaks(flux, distance=14, prominence=np.percentile(flux,70)*0.18)

plt.rcParams.update({"font.size":9})
fig,ax = plt.subplots(3,1,figsize=(18,10),sharex=True,
                       gridspec_kw={"height_ratios":[3,2,1]})
sel=(freqs>=80)&(freqs<=14000)
ax[0].pcolormesh(times,freqs[sel],20*np.log10(mag[sel]+1e-7),
                 vmin=-75,vmax=-25,shading="auto",cmap="magma")
ax[0].set_yscale("log"); ax[0].set_ylabel("Hz"); ax[0].set_yticks([100,200,400,800,1600,3200,6400,12800]); ax[0].get_yaxis().set_major_formatter(matplotlib.ticker.ScalarFormatter())
ax[1].pcolormesh(times,midis,scores,shading="nearest",cmap="viridis")
ax[1].set_ylabel("MIDI harmonic evidence")
ax[1].set_yticks(np.arange(36,97,3)); ax[1].grid(axis="y",alpha=.25)
ax[2].plot(tt[1:],flux); ax[2].scatter(tt[1:][onsets],flux[onsets],s=10,c="r")
ax[2].set_ylabel("spectral flux"); ax[2].set_xlabel("seconds in selected 07 (source time +45s)")
for a in ax:
    a.set_xlim(0,8); a.set_xticks(np.arange(0,8.01,.25)); a.grid(axis="x",alpha=.2)
fig.tight_layout(); fig.savefig(OUT/"overview.png",dpi=140); plt.close(fig)

def spectral_peaks(start,end):
    y=mono[int(start*fs):int(end*fs)]
    n=2**18
    sp=np.abs(np.fft.rfft(y*signal.windows.hann(len(y)),n))
    f=np.fft.rfftfreq(n,1/fs)
    peaks,_=signal.find_peaks(sp,distance=8)
    peaks=peaks[(f[peaks]>80)&(f[peaks]<10000)]
    peaks=peaks[np.argsort(sp[peaks])[-30:]][::-1]
    return [{"hz":round(float(f[p]),3),"midi":round(float(69+12*np.log2(f[p]/440)),3),"amplitude":round(float(sp[p]),3)} for p in peaks]

rows=[]
for t in np.arange(.1,7.95,.05):
    ti=int(np.argmin(abs(times-t)))
    inds=np.argsort(scores[:,ti])[-7:][::-1]
    rows.append({"time":round(float(t),3),"midi_scores":[[int(midis[k]),round(float(scores[k,ti]),3)] for k in inds]})
report={"source":str(SOURCE),"sha256":hashlib.sha256(SOURCE.read_bytes()).hexdigest(),
        "sample_rate":fs,"duration_seconds":len(mono)/fs,
        "onsets":[round(float(tt[1:][i]),4) for i in onsets],"frames":rows,
        "caution":"Analysis only. Harmonic evidence may include simultaneous voices, octaves, and reverb. No listening performed."}
(OUT/"initial-probe.json").write_text(json.dumps(report,indent=2),encoding="utf-8")

candidate_specs = [
    {"label":"F5", "root_midi":77, "crop":[0.000,0.330], "stable":[0.065,0.295],
     "pitch_window":[0.100,0.270], "onset_caution":"Selected 07 begins within or immediately around this attack; earlier attack information cannot be verified within selected source."},
    {"label":"G#5", "root_midi":80, "crop":[0.340,0.620], "stable":[0.370,0.550],
     "pitch_window":[0.380,0.540], "onset_caution":"Attack around 0.345s; preceding F5 reverb and a simultaneous G#4-like component remain."},
    {"label":"D#5", "root_midi":75, "crop":[0.650,1.030], "stable":[0.690,0.920],
     "pitch_window":[0.720,0.900], "onset_caution":"Attack around 0.655s; preceding G#5 reverb overlaps and later spectral activity is not a clean release."},
]
hp = signal.butter(4,350,fs=fs,btype="highpass",output="sos")
highpassed = signal.sosfiltfilt(hp,x,axis=0)  # Analysis only, not saved as audio.
details=[]
for spec in candidate_specs:
    a,b=spec["pitch_window"]
    y=mono[int(a*fs):int(b*fs)]
    nfft=2**19
    spectrum=abs(np.fft.rfft(y*signal.windows.hann(len(y)),nfft))
    fftfreq=np.fft.rfftfreq(nfft,1/fs)
    nominal=440*2**((spec["root_midi"]-69)/12)
    partials=[]
    for h in range(1,11):
        ids=np.where((fftfreq>nominal*h*.982)&(fftfreq<nominal*h*1.018))[0]
        p=int(ids[np.argmax(spectrum[ids])])
        # Quadratic interpolation of log FFT magnitude.
        v=np.log(np.maximum(spectrum[p-1:p+2],1e-15))
        delta=.5*(v[0]-v[2])/(v[0]-2*v[1]+v[2])
        hz=(p+delta)*fs/nfft
        partials.append({"harmonic":h,"hz":round(float(hz),4),
                         "implied_fundamental_hz":round(float(hz/h),4),
                         "cents_from_nominal":round(float(1200*np.log2(hz/h/nominal)),3),
                         "amplitude":round(float(spectrum[p]),5)})
    # Robust estimate from strongest six partials. Other simultaneous sounds
    # can occupy harmonic bins, hence dispersion and ambiguity are retained.
    strongest=sorted(partials,key=lambda p:p["amplitude"],reverse=True)[:6]
    est=np.median([p["implied_fundamental_hz"] for p in strongest])
    spread=np.percentile([p["cents_from_nominal"] for p in strongest],[10,90])
    ia,ib=[round(t*fs) for t in spec["crop"]]
    old=x[ia:ib]; new=highpassed[ia:ib]
    evalf=np.array([92,175,350,nominal,2*nominal,5000,10000])
    _,response=signal.sosfreqz(hp,worN=evalf,fs=fs)
    details.append({**spec,"source_time_crop":[45+t for t in spec["crop"]],
        "nominal_hz":nominal,"robust_harmonic_hz":round(float(est),4),
        "robust_cents":round(float(1200*np.log2(est/nominal)),3),
        "strong_partial_cents_p10_p90":[round(float(v),3) for v in spread],
        "partials":partials,"raw_rms":float(np.sqrt(np.mean(old**2))),
        "highpass350_rms":float(np.sqrt(np.mean(new**2))),
        "highpass350_filtfilt_response_db":{str(round(float(f),3)):round(float(40*np.log10(abs(v))),6) for f,v in zip(evalf,response)},
        "confidence":"High for high lead pitch class and octave from multiple harmonics; not a probability; monophonic isolation is incomplete.",
        "recommendation":"Use nominal root without pretending sub-cent certainty. No denoising/low-pass. Keep raw crop as alternate and identify HP350 as adapted version."})
final={"source":str(SOURCE),"source_sha256":report["sha256"],"sample_rate":fs,
       "candidate_notes":details,"limitations":[
           "Selected source is a musical layer with simultaneous pitches and reverberation, not isolated single notes.",
           "The 350Hz analysis high-pass removes strong bass but leaves overlapping upper accompaniment.",
           "No sustained loop has been established; do not claim arbitrary hold length without separate verification.",
           "No audio playback or listening judgment was performed by this analysis."]}
(OUT/"candidate-notes.json").write_text(json.dumps(final,indent=2),encoding="utf-8")
print(json.dumps({"output":str(OUT),"candidate_notes":[{k:v for k,v in d.items() if k not in ["partials"]} for d in details]},indent=2))
