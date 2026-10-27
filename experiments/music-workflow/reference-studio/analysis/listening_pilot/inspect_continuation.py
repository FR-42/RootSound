"""Second, narrowly scoped listening contrast; never asserts original MIDI."""
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
OUT = CASE / "观察与核对/第二轮/analysis"
SOURCE = CASE / "试听/07-普通分轨基线.wav"
OUT.mkdir(parents=True, exist_ok=True)


def read_audio(path):
    sr, audio = wavfile.read(path)
    if audio.dtype.kind in "iu":
        scale = 2 ** (audio.dtype.itemsize * 8 - 1)
        audio = audio.astype(float) / scale
    else:
        audio = audio.astype(float)
    if audio.ndim == 2:
        audio = audio.mean(axis=1)
    return sr, audio


sr, audio = read_audio(SOURCE)
frequencies, times, transform = signal.stft(
    audio[:round(2.4 * sr)], fs=sr, window="hann", nperseg=4096,
    noverlap=4000, nfft=16384, boundary="zeros", padded=True)
magnitude = np.abs(transform)


def partial(midi, harmonic):
    frequency = 440 * 2 ** ((midi - 69) / 12) * harmonic
    band = np.abs(frequencies - frequency) <= max(10, frequency * .007)
    return np.max(magnitude[band], axis=0)


pre = (times >= 1.03) & (times <= 1.10)
post = (times >= 1.16) & (times <= 1.245)
rows = []
for midi in (58, 70, 77, 82, 89):
    before, after = [], []
    for harmonic in range(1, 10):
        envelope = partial(midi, harmonic)
        before.append(float(np.mean(envelope[pre])))
        after.append(float(np.mean(envelope[post])))
    rows.append({
        "MidiHypothesis": midi,
        "MeanMagnitudeBefore": before,
        "MeanMagnitudeAfter": after,
        "MagnitudeChange": [b-a for a, b in zip(before, after)],
        "HarmonicIndices": list(range(1, 10))
    })

growth = partial(70, 3)
delta = growth[5:] - growth[:-5]
delta_times = times[2:-3]
use = np.flatnonzero((delta_times >= 1.07) & (delta_times <= 1.18))
growth_time = float(delta_times[use[np.argmax(delta[use])]])

model_evidence = {}
for name, relative in [
    ("MuScriptorAutomatic", "melody/muscriptor-short/07-automatic-notes.json"),
    ("MuScriptorForcedLead", "melody/muscriptor-short/07-synth-lead-notes.json")
]:
    content = json.loads((CASE / relative).read_text(encoding="utf-8"))
    model_evidence[name] = [note for note in content["notes"]
                            if note["onset"] < 2.22 and note["offset"] > 1.08
                            and note["pitch"] >= 65]
basic = json.loads((CASE / "melody/neural-basicpitch/07-notes.json").read_text(encoding="utf-8"))
model_evidence["BasicPitch"] = [note for note in basic["notes"]
                                 if note["startSeconds"] < 2.22
                                 and note["endSeconds"] > 1.08 and note["midi"] >= 65]

# The prior B preference supports a relative local choice, not these four notes
# as exact truth. Both new candidates share that working context, without
# importing the old 33-note result or reading its final event list.
starts = [.035, .346, .657, .968, 1.123, 1.279, 1.434]
ends = [.326, .637, .948, 1.103, 1.259, 1.414, 1.57]
for name, disputed in [("a", 70), ("b", 77)]:
    pitches = [77, 80, 75, 77, disputed, 80, 77]
    candidate = {
        "Status": "Unconfirmed second-round pitch contrast",
        "Name": f"Second-round candidate {name.upper()}",
        "DurationSeconds": 1.57,
        "Events": [
            {"StartSeconds": start, "DurationSeconds": round(end - start, 6),
             "Midi": midi, "Velocity": .75}
            for start, end, midi in zip(starts, ends, pitches)
        ],
        "DisputedEventIndex": 4,
        "OnlyDifferenceBetweenCandidates": "MIDI at 1.123 seconds: A=70 (Bb4), B=77 (F5)",
        "PriorPreferenceScope": "The user preferred the previous B relative to A. Exact pitches, timing, timbre and the complete melody were not confirmed.",
        "CommonContextStatus": "The first four pitches are the previously preferred working hypothesis; the two later notes are also unconfirmed common context.",
        "TempoAssumed": False,
        "TimingUncertaintySeconds": .035
    }
    (OUT / f"candidate-{name}.json").write_text(json.dumps(candidate, ensure_ascii=False, indent=2), encoding="utf-8")

review = {
    "Status": "Listening comparison required; not source MIDI recovery",
    "Source": str(SOURCE),
    "SourceSha256": hashlib.sha256(SOURCE.read_bytes()).hexdigest(),
    "SourceOriginalStartSeconds": 45,
    "PriorPreference": {
        "UserReply": "b",
        "Supports": "Relative preference for previous B over A in the first 1.08-second test, especially the changed second pitch.",
        "DoesNotConfirm": ["All four exact notes", "All onset/offset times", "Reconstructed timbre", "The complete eight-second melody"]
    },
    "ComparisonDurationSeconds": 1.57,
    "TargetComparisonIntervalSeconds": [1.09, 1.27],
    "TargetOriginalIntervalSeconds": [46.09, 46.27],
    "ComparedEvent": {"StartSeconds": 1.123, "A_Midi": 70, "B_Midi": 77},
    "ReasonForShortScope": "At 1.75 seconds MuScriptor and spectral hypotheses disagree again. Stopping at 1.57 excludes that independent question and the next attack near 1.59.",
    "PartialGrowthMaximumSeconds": growth_time,
    "SpectralWindowSeconds": 4096 / sr,
    "MagnitudeMeasurementWindowsSeconds": {"Before": [1.03, 1.10], "After": [1.16, 1.245]},
    "PartialMeasurements": rows,
    "ExistingModelEvidence": model_evidence,
    "Interpretation": {
        "WhyTestBb4": "Near the disputed attack, the Bb4 fundamental around 466 Hz and its third partial around 1398 Hz rise together. Basic Pitch/MuScriptor also contain Bb4, though their event timing differs and neither selects a verified main melody.",
        "WhyKeepF5AsAlternative": "F5 energy around 698 Hz remains present; it may be sustained target material, a tail, or another layer. A new Bb4 component can belong to accompaniment rather than the desired lead.",
        "OctaveAmbiguity": "Bb3's third partial (~699 Hz) and fifth (~1165 Hz) do not show the same new onset; Bb5's fundamental (~932 Hz) does not rise. These observations favor Bb4 over simple octave substitutes, but filtering, overlapping voices and missing fundamentals prevent proof.",
        "SharedPartialAmbiguity": "1398 Hz is simultaneously Bb4's third partial, F5's second partial and F6's fundamental. It must not be treated as a separate F6 note just because it is bright. F6's third partial (~4191 Hz) has only weak change here, unlike a clear independent upper-note onset.",
        "UnconfirmedCommonFollowingNotes": "Ab5 at 1.279 and F5 at 1.434 follow short harmonic-family changes; the automatic model merges them into a lower Bb4 span. They are shared working context, not accepted notes or an independently validated extension."
    },
    "NoNewModelInference": True,
    "NoActualAudioAuditionPerformed": True,
    "AudioDeviceUsed": False,
    "SourceUnchanged": True,
    "NoConfirmedMainMelody": True
}
(OUT / "continuation-review.json").write_text(json.dumps(review, ensure_ascii=False, indent=2), encoding="utf-8")

fig, axs = plt.subplots(3, 1, figsize=(14, 9), sharex=True,
                         gridspec_kw={"height_ratios": [2, 1, 1]})
selected = (frequencies >= 200) & (frequencies <= 6000)
db = 20 * np.log10(magnitude[selected] / max(magnitude[selected].max(), 1e-12) + 1e-8)
axs[0].pcolormesh(times, frequencies[selected], db, shading="auto", cmap="magma", vmin=-60, vmax=0)
axs[0].set_yscale("log")
axs[0].set_yticks([233, 466, 699, 831, 932, 1165, 1398, 2095, 2492, 4191])
axs[0].get_yaxis().set_major_formatter(matplotlib.ticker.ScalarFormatter())
axs[0].set_ylabel("Frequency / Hz")
axs[0].set_title("07 continuation: shared harmonics do not identify the desired voice")
for midi, harmonic, label in [(70, 1, "Bb4 fundamental ~466"), (77, 1, "F5 fundamental ~698"),
                               (70, 3, "Shared ~1398"), (89, 3, "F6 third ~4191")]:
    envelope = partial(midi, harmonic)
    local = (times >= .9) & (times <= 1.59)
    axs[1].plot(times, envelope / max(envelope[local].max(), 1e-12), label=label)
axs[1].set_ylabel("Each band normalized separately")
axs[1].legend(loc="upper right", fontsize=8)
for midi, label in [(77, "F5 family"), (80, "Ab5 family"), (75, "Eb5 family"), (82, "Bb5 family")]:
    energy = np.sqrt(np.mean([partial(midi, h) ** 2 for h in (1, 3, 5)], axis=0))
    local = (times >= .9) & (times <= 2.22)
    axs[2].plot(times, energy / max(energy[local].max(), 1e-12), label=label)
axs[2].set_ylabel("Normalized partial energy")
axs[2].legend(loc="upper right", fontsize=8)
axs[2].set_xlabel("Seconds relative to source 45 s")
for ax in axs:
    ax.set_xlim(.9, 2.22)
    ax.grid(alpha=.25)
    ax.axvspan(1.09, 1.27, color="cyan", alpha=.12)
    ax.axvline(1.57, color="red", linestyle="--", alpha=.6)
fig.tight_layout()
fig.savefig(OUT / "continuation-spectrum.png", dpi=150)
plt.close(fig)
print(json.dumps({"comparisonDuration": 1.57, "disputedEventSeconds": 1.123,
                  "aMidi": 70, "bMidi": 77, "partialGrowthMaximumSeconds": growth_time,
                  "measuredChanges": [{"midi": r["MidiHypothesis"], "h1": r["MagnitudeChange"][0],
                                       "h3": r["MagnitudeChange"][2], "h5": r["MagnitudeChange"][4]}
                                      for r in rows]}, ensure_ascii=False))
