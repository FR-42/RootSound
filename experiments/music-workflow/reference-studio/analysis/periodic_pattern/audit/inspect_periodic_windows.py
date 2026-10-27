"""Window/period ambiguity audit only; no waveform extraction or model inference."""
from pathlib import Path
import hashlib
import json
import numpy as np
from scipy.io import wavfile

ROOT = Path(__file__).resolve().parents[3]
SOURCE = ROOT / "cases/phone-recording-20261023-233819/试听/07-普通分轨基线.wav"
OUT = Path(__file__).with_name("periodic-windows.json")
sr, audio = wavfile.read(SOURCE)
scale = 2**(audio.dtype.itemsize*8-1) if audio.dtype.kind in "iu" else 1
audio = audio.astype(float) / scale
assert audio.ndim == 2 and audio.shape[1] == 2

windows = []
for role, begin, end, upper_hint in [
    ("training", .08, .28, "Upper spectral family near 698 Hz, not an isolated F5 instrument"),
    ("external validation", .70, .90, "Upper spectral family near 622 Hz, not an isolated Eb5 instrument")
]:
    segment = audio[round(begin*sr):round(end*sr)].copy()
    segment -= segment.mean(axis=0)
    correlations = []
    for hypothesis_hz in (185, 92.5, 46.25, 23.125):
        lag = round(sr/hypothesis_hz)
        u, v = segment[lag:], segment[:-lag]
        corr = np.sum(u*v) / np.sqrt(np.sum(u*u)*np.sum(v*v))
        correlations.append({"periodFrequencyHypothesisHz": hypothesis_hz,
                             "lagSamples": lag,
                             "lagSeconds": lag/sr,
                             "normalizedStereoLagCorrelation": float(corr),
                             "cyclesInWindow": (end-begin)*hypothesis_hz})
    nfft = 262144
    power = np.sum(abs(np.fft.rfft(segment*np.hanning(len(segment))[:, None], nfft, axis=0))**2, axis=1)
    frequencies = np.fft.rfftfreq(nfft, 1/sr)
    local_peaks = []
    for center in (46.25, 92.5, 138.75, 185, 231.25, 277.5, 370):
        candidates = np.flatnonzero(abs(frequencies-center) < 5)
        peak = candidates[np.argmax(power[candidates])]
        local_peaks.append({"nominalCenterHz": center,
                            "observedLocalPeakHz": float(frequencies[peak]),
                            "dbRelativeToStrongestPeak": float(10*np.log10(power[peak]/power.max()))})
    windows.append({"role": role, "relativeSeconds": [begin, end],
                    "originalSeconds": [45+begin, 45+end],
                    "upperInterferenceHint": upper_hint,
                    "lagComparisons": correlations, "localLowPeaks": local_peaks})

report = {
    "status": "Promising local quasiperiodic reference windows, not pure instruments",
    "source": str(SOURCE), "sourceSha256": hashlib.sha256(SOURCE.read_bytes()).hexdigest(),
    "windows": windows,
    "supportedApproach": [
        "A stationary pitched source can provide several repeatable waveform cycles without the melody repeating.",
        "Estimate a short local cycle or harmonic template with both channels intact, then assess it on a separate same-root window with different upper interference.",
        "About nine putative 46.25 Hz cycles exist in each .2 s window; this is a small prototype sample, not a robust instrument library.",
        "Keep the extracted component and unassigned remainder so leakage and missing desired components can both be judged."
    ],
    "limits": [
        "A perceived pitch need not imply exact waveform repetition: missing fundamentals, detuned layers, inharmonic partials, noise and modulation matter.",
        "The low 46.25 Hz hypothesis fits the approximate 92/138/185 family, but a half-frequency 23.125 Hz cycle also gives high correlation; longer cycles can fit additional mixture components.",
        "The partial peaks are not perfectly integer-related in these short windows. Fixed-cycle averaging can erase stereo modulation and timbral details.",
        "Periodic folding is closely related to projection onto a harmonic Fourier basis. It does not supply independent source identity or separate sources sharing those harmonics.",
        "Ordinary autocorrelation and power-spectrum views are closely related; presenting the same information differently does not itself solve separation.",
        "For F1 and Eb1, the sixteenth harmonic coincides exactly with F5 and Eb5. A bass template extended too far upward can absorb the wanted melody.",
        "A lower residual or higher lag correlation is a fitting result, not proof of musical purity or the correct original bass octave."
    ],
    "validationRequirements": [
        "Freeze the training-derived cycle/template before examining the external validation window.",
        "Allow root/phase tracking only from independently selected low anchors, not free tuning on upper melody bins.",
        "Report energy and stereo structure retained in the desired low family and leakage from the changed upper family separately.",
        "Compare doubled/halved period hypotheses under the same model capacity, favoring the shortest adequate explanation rather than unconstrained long-period fit.",
        "Listener confirmation is still required; this audit did not audition audio."
    ],
    "noSourceAudioModified": True, "noModelInference": True,
    "noMidiProduced": True, "noAudioDeviceUsed": True
}
OUT.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
print(json.dumps({"report": str(OUT), "sourceSha256": report["sourceSha256"],
                  "windows": [{"relativeSeconds": w["relativeSeconds"],
                               "lagComparisons": w["lagComparisons"]} for w in windows]}, ensure_ascii=False))
