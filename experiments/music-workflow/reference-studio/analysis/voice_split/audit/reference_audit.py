"""Read-only audit of reference contamination and stereo structure.

No source-separation model, audio output or claim of instrument identity.
"""
from pathlib import Path
import hashlib
import json
import numpy as np
from scipy.io import wavfile
from scipy.signal import stft

ROOT = Path(__file__).resolve().parents[3]
CASE = ROOT / "cases/phone-recording-20261023-233819"
OUT = Path(__file__).with_name("reference-audit.json")
WINDOWS = [(0.06, .26), (.37, .57), (.70, .90), (.99, 1.09),
           (1.16, 1.245), (1.30, 1.40), (1.46, 1.54)]
FREQUENCIES = [233.08, 466.16, 698.46, 1396.91, 2095.37, 2330.82, 3492.28]
FILES = {
    "accepted07": "试听/07-普通分轨基线.wav",
    "original": "input/original-45-53.wav",
    "oldGuidedEstimate": "试听/02-参考引导候选A.wav",
    "oldAutomaticEstimate": "试听/05-自动分离候选B.wav"
}


def read_stereo(path):
    sr, audio = wavfile.read(path)
    if audio.dtype.kind in "iu":
        scale = 2 ** (audio.dtype.itemsize * 8 - 1)
        audio = audio.astype(float) / scale
    else:
        audio = audio.astype(float)
    assert audio.ndim == 2 and audio.shape[1] == 2
    return sr, audio


results = {}
for name, relative in FILES.items():
    path = CASE / relative
    sr, audio = read_stereo(path)
    audio = audio[:round(1.7 * sr)]
    kwargs = dict(fs=sr, nperseg=4096, noverlap=3968, nfft=8192)
    frequencies, times, left = stft(audio[:, 0], **kwargs)
    _, _, right = stft(audio[:, 1], **kwargs)
    rows = []
    for begin, end in WINDOWS:
        selected_time = (times >= begin) & (times <= end)
        for frequency in FREQUENCIES:
            selected_frequency = np.abs(frequencies-frequency) <= max(12, frequency*.007)
            l = left[selected_frequency][:, selected_time]
            r = right[selected_frequency][:, selected_time]
            lp, rp = np.mean(abs(l)**2), np.mean(abs(r)**2)
            cross = np.mean(l * r.conj())
            mid_power = np.mean(abs((l+r)/2)**2)
            side_power = np.mean(abs((l-r)/2)**2)
            rows.append({
                "relativeWindowSeconds": [begin, end],
                "originalWindowSeconds": [45+begin, 45+end],
                "frequencyHz": frequency,
                "bandHalfWidthHz": max(12, frequency*.007),
                "leftMinusRightDb": float(10*np.log10((lp+1e-20)/(rp+1e-20))),
                "sideEnergyFraction": float(side_power/(mid_power+side_power+1e-20)),
                "lrCoherencyMagnitude": float(abs(cross)/(np.sqrt(lp*rp)+1e-20)),
                "lrCoherencyPhaseDegrees": float(np.angle(cross)*180/np.pi),
                "meanStereoPower": float(lp+rp)
            })
    results[name] = {"path": str(path), "sha256": hashlib.sha256(path.read_bytes()).hexdigest(),
                     "sampleRate": sr, "measurements": rows}

report = {
    "status": "Stereo/reference audit only; no isolated instrument ground truth",
    "sources": results,
    "referenceWindows": [
        {
            "purpose": "Relatively brighter, coherent central attack/harmonic material",
            "relativeSeconds": [.06, .26],
            "originalSeconds": [45.06, 45.26],
            "frequencyHintsHz": [[2010, 2180], [3400, 3580]],
            "preferredSpatialObservation": "Mid can emphasize this material; do not confuse Mid with an instrument identity.",
            "contamination": "Bass, chords, earlier tails and lower/wide components coexist. The window is only .2 s, not a clean full-timbre query."
        },
        {
            "purpose": "Relatively wider lower-frequency sustained material",
            "relativeSeconds": [.99, 1.09],
            "alternateRelativeSeconds": [1.30, 1.40],
            "originalSeconds": [45.99, 46.09],
            "frequencyHintsHz": [[650, 745]],
            "preferredSpatialObservation": "Side strongly retains this band, unlike direct L/R averaging.",
            "contamination": "This band can be the third harmonic of a lower note, not necessarily a F5 fundamental. The full Side signal also includes reverberation and other stereo sources."
        }
    ],
    "unsafeReferences": [
        {
            "relativeSeconds": [1.16, 1.245],
            "reason": "A newly increasing 466/1398 family coexists with 698/2095 material. Not an isolated second instrument, despite the useful change in spectral balance."
        },
        {
            "relativeSeconds": [1.12, 1.57],
            "reason": "Multiple overlapping attacks/tails and changing stereo phase. Do not concatenate the dominant peaks into one voice or treat the whole window as a pure second reference."
        }
    ],
    "conclusions": [
        "Different bands have strongly different stereo structure in the original mixture as well as 07, so this is not solely a Demucs artifact.",
        "A direct arithmetic L/R average suppresses substantial Side energy and can bias both pitch analysis and reference embeddings toward the brighter central partials.",
        "Neither a solo exposure nor a stationary independent pan position for exactly two instruments has been established.",
        "Stereo chorus, detuning, all-pass effects, reverberation, layered patches and different instruments can all explain frequency-dependent stereo shape.",
        "The two proposed reference observations are contrasts, not two verified complete timbres. Keep an unassigned residual layer."
    ],
    "noNewModelInference": True,
    "noAudioDeviceUsed": True,
    "noSourceAudioModified": True
}
OUT.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
print(json.dumps({"report": str(OUT), "acceptedSha256": results["accepted07"]["sha256"],
                  "referenceWindows": report["referenceWindows"]}, ensure_ascii=False))
