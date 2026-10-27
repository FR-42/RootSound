"""Audit the audible low family left in 07, with no new model inference."""
from pathlib import Path
import hashlib
import json
import warnings
import numpy as np
from scipy.io import wavfile
from scipy.signal import stft, find_peaks, savgol_filter

ROOT = Path(__file__).resolve().parents[3]
CASE = ROOT / "cases/phone-recording-20261023-233819"
OUT = Path(__file__).with_name("bass-evidence.json")
FILES = {
    "accepted07": ("试听/07-普通分轨基线.wav", 0),
    "original": ("input/original-45-53.wav", 0),
    "hdemucsBass": ("hdemucs/target-45-53/bass-estimate.wav", 0),
    "mus3dBassStem": ("mus3d/stem-context-44-54/03-bass.wav", 1),
    "mus3dBassGuitar04": ("mus3d/context-44-54/04-bass_guitar.wav", 1),
    "mus3dBassGuitar05": ("mus3d/context-44-54/05-bass_guitar.wav", 1)
}
WINDOWS = [(.1, .4, 46.249), (1.15, 1.45, 46.249), (2.3, 2.6, 46.249),
           (3.3, 3.6, 43.654), (4.6, 4.9, 38.891), (5.5, 5.8, 38.891),
           (6.3, 6.6, 38.891), (7, 7.3, 43.654)]


def read_stereo(path, offset):
    with warnings.catch_warnings():
        warnings.simplefilter("ignore", wavfile.WavFileWarning)
        sr, audio = wavfile.read(path)
    scale = 2**(audio.dtype.itemsize*8-1) if audio.dtype.kind in "iu" else 1
    audio = audio.astype(float) / scale
    assert audio.ndim == 2 and audio.shape[1] == 2
    return sr, audio[round(offset*sr):round((offset+8)*sr)]


results = {}
for name, (relative, offset) in FILES.items():
    path = CASE / relative
    sr, audio = read_stereo(path, offset)
    frequencies, times, left = stft(audio[:, 0], fs=sr, nperseg=8192, noverlap=7952, nfft=32768)
    _, _, right = stft(audio[:, 1], fs=sr, nperseg=8192, noverlap=7952, nfft=32768)
    stereo_power = abs(left)**2 + abs(right)**2
    rows = []
    for begin, end, root in WINDOWS:
        use_time = (times >= begin) & (times <= end)
        harmonic_rows = []
        for harmonic in (1, 2, 3, 4, 5, 6, 8):
            target = root * harmonic
            use_frequency = abs(frequencies-target) <= max(3, target*.012)
            l = left[use_frequency][:, use_time]
            r = right[use_frequency][:, use_time]
            mid = float(np.mean(abs((l+r)/2)**2))
            side = float(np.mean(abs((l-r)/2)**2))
            lp, rp = float(np.mean(abs(l)**2)), float(np.mean(abs(r)**2))
            cross = np.mean(l*r.conj())
            harmonic_rows.append({
                "harmonicIfMissingFundamentalHypothesis": harmonic,
                "frequencyHz": target,
                "meanStereoPower": lp+rp,
                "sideEnergyFraction": side/(mid+side+1e-20),
                "lrCoherency": float(abs(cross)/(np.sqrt(lp*rp)+1e-20)),
                "lrPhaseDegrees": float(np.angle(cross)*180/np.pi)
            })
        sample = audio[round(begin*sr):round(end*sr)]
        fft_power = (abs(np.fft.rfft(sample*np.hanning(len(sample))[:, None], 65536, axis=0))**2).sum(axis=1)
        fft_frequency = np.fft.rfftfreq(65536, 1/sr)
        peaks, _ = find_peaks(fft_power, distance=round(8/(sr/65536)))
        peaks = [index for index in peaks if 25 < fft_frequency[index] < 330]
        peaks = sorted(peaks, key=lambda index: fft_power[index], reverse=True)[:7]
        rows.append({
            "relativeSeconds": [begin, end], "originalSeconds": [45+begin, 45+end],
            "possibleMissingFundamentalHz": root,
            "strongLowPeaks": [{"frequencyHz": float(fft_frequency[index]),
                               "dbRelativeToStrongestFullSpectrumPeak": float(10*np.log10(fft_power[index]/fft_power.max()))}
                              for index in peaks],
            "harmonicAndStereoMeasurements": harmonic_rows
        })

    result = {"path": str(path), "sha256": hashlib.sha256(path.read_bytes()).hexdigest(),
              "contextCropOffsetSeconds": offset, "sampleRate": sr,
              "method": "Sum of L and R powers; arithmetic mono averaging deliberately avoided.",
              "windows": rows}
    if name == "accepted07":
        family_tracks = []
        for frequency in (184.997, 174.614, 155.563):
            band = abs(frequencies-frequency) <= 5
            track = np.mean(stereo_power[band], axis=0)
            family_tracks.append(savgol_filter(track, 21, 2))
        winning = np.argmax(family_tracks, axis=0)
        runs = []
        start = 0
        for index in range(1, len(winning)+1):
            if index == len(winning) or winning[index] != winning[start]:
                duration = times[index-1] - times[start]
                if duration >= .1:
                    runs.append({"fromSeconds": float(times[start]), "toSeconds": float(times[index-1]),
                                 "dominantLowFamilyAnchorHz": (184.997, 174.614, 155.563)[int(winning[start])]})
                start = index
        result["dominantUpperBassAnchorRuns"] = runs
    results[name] = result

report = {
    "status": "Low-family audit; root octave, source ownership and actual musical notes remain unconfirmed",
    "evidence": results,
    "usefulAnchors": [
        {"relativeSeconds": [.1, .4], "frequenciesHz": [92.5, 138.75, 185, 231.25, 277.5],
         "possibleFamilyRootHz": 46.25, "rootNameHypothesis": "F#1, possibly missing; octave alternatives remain"},
        {"relativeSeconds": [3.3, 3.6], "frequenciesHz": [87.3, 130.96, 174.62, 261.92],
         "possibleFamilyRootHz": 43.65, "rootNameHypothesis": "F1, possibly missing; octave alternatives remain"},
        {"relativeSeconds": [4.6, 4.9], "frequenciesHz": [77.78, 116.67, 155.56, 233.34],
         "possibleFamilyRootHz": 38.89, "rootNameHypothesis": "Eb1, possibly missing; octave alternatives remain"},
        {"relativeSeconds": [7, 7.3], "frequenciesHz": [87.3, 130.96, 174.62, 261.92],
         "possibleFamilyRootHz": 43.65, "rootNameHypothesis": "F1, possibly missing; octave alternatives remain"}
    ],
    "interpretation": [
        "07 contains strong changing low families, especially around 185, 175 and 155 Hz; the user describing audible bass/accompaniment is consistent with the spectrum.",
        "The low peaks fit harmonic families with weak or missing sub fundamentals; do not blindly label every 92/138/185 peak a separate chord note.",
        "Equally, multiple related notes/layered patches can fit the same family. Missing-fundamental root names are analysis hypotheses, not recovered MIDI.",
        "HDEMUCS bass is dominated by lower, mostly central components. 07 retains strong moving stereo components at the higher low-family anchors.",
        "MuS3D bass often retains the spatial shape and high low-family anchors found in 07, making it a useful reference for the remaining low layer; it also contains material no longer in07.",
        "A simple low-pass cut or fixed Mid removal will miss much of the audible bass identity and can damage other voices.",
        "699 and 1398 Hz are not privileged bass roots: any association must be tested as higher partials with corresponding low-family activity."
    ],
    "limitations": [
        "No auditory evaluation was performed.",
        "Spatial features vary substantially by time and frequency, so no single stable pan defines this bass.",
        "The original model estimates differ in sample rate and context; this report compares matched time windows, not phase-aligned subtraction.",
        "The rough anchor runs track dominant 155/175/185 energy, not exact note starts, tempo or recovered bass notes."
    ],
    "noModelInference": True, "noAudioDeviceUsed": True, "noMidiProduced": True,
    "noSourceAudioModified": True
}
OUT.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
print(json.dumps({"report": str(OUT), "acceptedSha256": results["accepted07"]["sha256"],
                  "anchorRuns": results["accepted07"]["dominantUpperBassAnchorRuns"]}, ensure_ascii=False))
