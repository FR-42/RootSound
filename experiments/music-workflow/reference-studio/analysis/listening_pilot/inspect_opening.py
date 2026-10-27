"""Diagnose a tiny, unconfirmed pitch contrast without rewriting any old result."""
from pathlib import Path
import hashlib
import json
import numpy as np
from scipy.io import wavfile
from scipy import signal
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

ROOT = Path(__file__).resolve().parents[2]
CASE = ROOT / "cases/phone-recording-20261023-233819"
OUT = CASE / "观察与核对/analysis"
SOURCE = CASE / "试听/07-普通分轨基线.wav"
CONTEXT = CASE / "hdemucs/context-44-54/other-estimate.wav"
OUT.mkdir(parents=True, exist_ok=True)


def read_audio(path):
    sr, audio = wavfile.read(path)
    if audio.dtype.kind in "iu":
        audio = audio.astype(float) / (2 ** (audio.dtype.itemsize * 8 - 1))
    else:
        audio = audio.astype(float)
    if audio.ndim == 2:
        audio = audio.mean(axis=1)
    return sr, audio


def spectrum(audio, sr):
    return signal.stft(audio, fs=sr, window="hann", nperseg=2048,
                       noverlap=2000, nfft=8192, boundary="zeros", padded=True)


def harmonic_track(frequencies, magnitude, midi, harmonics=(1, 3, 5)):
    f0 = 440 * 2 ** ((midi - 69) / 12)
    parts = []
    for harmonic in harmonics:
        center = f0 * harmonic
        width = max(13, center * .008)
        band = np.abs(frequencies - center) <= width
        parts.append(np.max(magnitude[band], axis=0))
    return np.sqrt(np.mean(np.square(parts), axis=0))


sr, audio = read_audio(SOURCE)
f, t, z = spectrum(audio[:round(1.4 * sr)], sr)
mag = np.abs(z)
tracks = {midi: harmonic_track(f, mag, midi) for midi in (77, 80, 75)}
context_sr, context = read_audio(CONTEXT)
cf, ct, cz = spectrum(context[:round(2.4 * context_sr)], context_sr)
ct = ct - 1.0  # The context starts at source second 44, the accepted cut at 45.
cmag = np.abs(cz)
ctracks = {midi: harmonic_track(cf, cmag, midi) for midi in (77, 80, 75)}

onsets = []
for midi, lo, hi in [(77, -.04, .13), (80, .25, .43),
                     (75, .55, .74), (77, .86, 1.06)]:
    env = ctracks[midi]
    # Broad-window energy growth is timing evidence only, not a note detector.
    delta = np.maximum(env[10:] - env[:-10], 0)
    times = ct[5:-5]
    select = np.flatnonzero((times >= lo) & (times <= hi))
    ix = select[np.argmax(delta[select])]
    at = float(times[ix])
    onsets.append({"MidiHypothesis": midi, "WindowSeconds": [lo, hi],
                   "MaximumGrowthSeconds": round(at, 5),
                   "TemporalResolutionSeconds": 2048 / context_sr,
                   "Warning": "Energy onset of selected partials, not proof of the target melody."})

fig, axs = plt.subplots(3, 1, figsize=(13, 9), sharex=True,
                         gridspec_kw={"height_ratios": [2, 1, 1]})
valid = (f >= 250) & (f <= 6500)
db = 20 * np.log10(mag[valid] / max(mag[valid].max(), 1e-12) + 1e-8)
axs[0].pcolormesh(t, f[valid], db, shading="auto", vmin=-60, vmax=0, cmap="magma")
axs[0].set_yscale("log")
axs[0].set_yticks([311, 415, 620, 698, 831, 1245, 1867, 2095, 2492, 3492, 4153])
axs[0].get_yaxis().set_major_formatter(matplotlib.ticker.ScalarFormatter())
axs[0].set_ylabel("Frequency / Hz")
axs[0].set_title("Accepted 07: spectral lines include harmonics, accompaniment and overlap")
for midi, label in [(77, "F5 hypothesis"), (80, "Ab5 hypothesis"), (75, "Eb5 hypothesis")]:
    track = tracks[midi]
    axs[1].plot(t, track / max(track.max(), 1e-12), label=label)
    env = ctracks[midi]
    use = (ct >= -.1) & (ct <= 1.3)
    axs[2].plot(ct[use], env[use] / max(env[use].max(), 1e-12), label=label)
axs[1].set_ylabel("Normalized partial energy")
axs[1].set_title("07: fundamental + third + fifth partials (not independent notes)")
axs[2].set_ylabel("Normalized partial energy")
axs[2].set_title("Neighbor-context separation: boundary/onset check only; not identical to 07")
axs[2].set_xlabel("Seconds relative to source 45 s")
for ax in axs:
    ax.set_xlim(-.05, 1.3)
    ax.grid(alpha=.25)
    for boundary in (0, .34, .65, .96, 1.08):
        ax.axvline(boundary, color="white" if ax is axs[0] else "gray", alpha=.45, linewidth=.8)
axs[1].legend(loc="upper right")
fig.tight_layout()
fig.savefig(OUT / "opening-spectrum.png", dpi=150)
plt.close(fig)

review = {
    "Status": "Unconfirmed hypotheses for a one-variable listening comparison",
    "Source": str(SOURCE),
    "SourceSha256": hashlib.sha256(SOURCE.read_bytes()).hexdigest(),
    "OriginalSourceStartSeconds": 45,
    "RecommendedComparisonDurationSeconds": 1.08,
    "ReasonToStopAt1Point08": "At about 1.12 s the old FFT and model hypotheses diverge again; at about 1.28 s another onset occurs. These are excluded to avoid testing multiple variables.",
    "OnsetMeasurements": onsets,
    "TimingCaveat": "The 0.16 s first onset in MuScriptor is not an accepted acoustic onset. Model timing, spectral rise and a musical note onset are distinct.",
    "ModelEvidence": {
        "BasicPitch": "F5 at .04644-.26703, no detected Ab5 at .34; absence is not evidence the note is absent.",
        "MuScriptorAutomatic": "F5 at .16-.64, Eb5 at .64-.96, F5 at .96-1.28; multiple simultaneous voices remain.",
        "OldFft": "F5 at .03527, Ab5 at .34615, Eb5 at .65703, F5 at .96791; this full reconstruction was rejected by the user.",
        "SpectralEvidence": "At .37-.57 s, about 832 Hz and 2493 Hz coexist; consistent with an Ab5 harmonic family, but an overlapping lower Ab4 component and non-target layers prevent identifying the main melody from spectrum alone."
    },
    "NoGroundTruth": True,
    "NoActualAudioAuditionPerformed": True,
    "AudioDeviceUsed": False,
    "Limitations": [
        "These candidate files do not claim recovery of original MIDI.",
        "The accepted stem contains bass, accompaniment and reverberation as well as the target.",
        "The onset measurement uses a 42.7 ms window and should not be reported with sample-level certainty.",
        "A note heard at the same pitch may come from a different layer; listener confirmation remains necessary."
    ]
}

# Same attacks, durations and velocities in both files: only the second pitch
# differs. The automatic model merges the first two attacks; doing that only
# in candidate A would confound pitch with articulation in the listening test.
shared_starts = [.035, .346, .657, .968]
shared_ends = [.326, .637, .948, 1.08]
for key, pitches, description in [
    ("a", [77, 77, 75, 77], "The disputed second attack stays on F5. MuScriptor held F5 across this interval, but both audition candidates intentionally share four attacks."),
    ("b", [77, 80, 75, 77], "The disputed second attack rises to Ab5. Harmonic energy near 832 and 2493 Hz motivates this hypothesis, without identifying the target voice.")
]:
    candidate = {
        "Status": "Unconfirmed listening hypothesis, not recovered original notes",
        "Name": f"Opening candidate {key.upper()}",
        "DurationSeconds": 1.08,
        "Events": [
            {"StartSeconds": start, "DurationSeconds": round(end - start, 6),
             "Midi": midi, "Velocity": .75}
            for start, end, midi in zip(shared_starts, shared_ends, pitches)
        ],
        "Description": description,
        "TempoAssumed": False,
        "OnlyDifferenceBetweenCandidates": "Second event MIDI 77 versus 80",
        "TimingUncertaintySeconds": .025,
        "FirstOnsetWarning": "A .16 s model onset was not used as an acoustic timing truth; partial energy rises around .03 s."
    }
    (OUT / f"candidate-{key}.json").write_text(json.dumps(candidate, ensure_ascii=False, indent=2), encoding="utf-8")
review["CandidateSchema"] = "PianoCheck DurationSeconds/Events; four identical onsets/durations/velocities, second MIDI differs."
review["CandidateArticulationCaveat"] = "Candidate A uses a repeated F5 at .346 s rather than the automatic model's single held F5, to keep the listening contrast restricted to pitch. Neither is a verified transcription."
(OUT / "opening-review.json").write_text(json.dumps(review, ensure_ascii=False, indent=2), encoding="utf-8")
print(json.dumps({"Output": str(OUT), "OnsetMeasurements": onsets}, ensure_ascii=False))
