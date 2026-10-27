# Opening listening checkpoint

User approves trying the staged observation/comparison workflow after discussing
the Gemini proposal. This is a personal experiment using the already accepted07,
not a new whole-excerpt remake or a replacement for the existing workstation.

Output: `cases/phone-recording-20261023-233819/观察与核对/`.
Open `听清这一小段.html` in a browser. The single HTML embeds all audio and images;
it works without a server, Python, plug-in, model, account or network. Playback
begins only when the user clicks. The assistant does not open it or a sound device.

## Listening question

Compare original45.00–46.08s, using accepted07 as the main reference. Two neutral
piano hypotheses differ only in their second note: F5 versus Ab5. They share four
onsets, durations and velocities. Candidate A repeats F5 rather than holding it,
so pitch and articulation do not change simultaneously between alternatives.
Neither candidate is a verified transcription; both can be wrong. Piano sound
is a pitch/contour reference, not an attempt to recreate the target instrument.

The opening boundary excludes another ambiguity after1.12s. Timing is an estimate
from spectral growth and existing context, not known original MIDI or a confirmed
193BPM grid. `inspect_opening.py` retains the evidence and its limitations.

## Implementation and reproduction

- `inspect_opening.py`: read-only investigation of existing07, context and previous
  model outputs; writes candidate JSONs and diagnostic image in output/analysis.
- `build_listening_pilot.py`: uses the existing actual native PianoReference
  renderer, isolated Signalsmith Stretch helper and NumPy/SciPy/Matplotlib/Pillow.
  Creates all WAVs, common spectrogram views and an offline HTML comparison.
- Build existing `phone_melody/piano-check/PianoCheck.csproj` Release to
  `.cache/listening-pilot/piano` before running the builder. Build the isolated
  `analysis/stretch_pilot` helper according to its README. No main-app rebuild.
- Run builder and `verify_delivery.py` with existing Python3.13/SciPy environment.
- `workbench.js`: one shared AudioContext clock; original-song seconds map onto
  precomputed pitch-preserving buffers. Browser playbackRate stays1. Source/speed
  changes preserve position; late loads cannot restart canceled playback.
- `test_transport.cjs`:14 checks execute the same source in a fake audio context;
  they do not play audio, open a browser or operate the user's desktop.

Slow speed0.6 is rendered with MIT Signalsmith Stretch, pinned together with its
MIT dependency in sibling `stretch_pilot/sources.json`. Code and license copies
are retained there; this tool does not identify/separate melody. Its synthetic
integrity checks are separate from the real-song experiment and listening verdict.

The original8s reference and07 stay unchanged. Generated audition copies receive
2ms edge fades and24-bit quantization. A/B use one shared gain matched approximately
to the short reference RMS; no per-candidate normalization favors an alternative.
The HTML defaults to the1.08s loop at0.6 speed. Original/full07 can additionally
play8s; candidates are limited to the opening. Standalone comparison WAVs play
07 slow→0.35s silence→candidate slow, each approximately3.95s long.

`delivery.json` records output hashes and exact processing. Re-running the builder
refuses to overwrite unfamiliar or user-modified generated files. Temporary raw
audio and helper builds stay in the project cache. No audio is uploaded.

## Verification limits

Independent verification checks source hashes, embedded/file WAV identity,
24-bit stereo frames, peaks, common timing and gain, notes differing in only
one field, intended reference-note frequencies at both speeds, and14 transport
tests. These establish correct comparison delivery, not correct transcription.
Actual browser decoding, pointer feel and musical judgment await user use.

## Second checkpoint after the user prefers B

User reply `b` is retained as a relative preference with hashes in output
`listening-feedback.json`, not expanded to exact-note or whole-excerpt acceptance.
`inspect_continuation.py` writes two7-note hypotheses and evidence under
`观察与核对/第二轮/analysis`. They cover45.00–46.57s and differ only in the fifth
pitch: A=Bb4/MIDI70, B=F5/MIDI77. This reverses the previous label/change association.
The first three events exactly match prior B; the fourth tail extends beyond
the earlier crop. Other common notes remain provisional.

`build_continuation.py` reuses audio helpers, the prior exact07 slow file, native
piano DLL and existing stretch executable. It delivers five WAVs, including two
5.583s original→pause→candidate comparisons; no HTML or model rebuild. It checks
frames, gap, peaks, common gain,466/698Hz reference peaks, output hashes and prior
file retention. These checks do not establish target-voice selection or musical
likeness. The first HTML and its original delivery are preserved unchanged.

Follow-up: user rejects both second-round endings and suggests two timbres might
be involved. The exact rejected boundary is unspecified, so no fifth-note verdict
is inferred. Existing pitch components overlap, supporting a voice-grouping audit
but not proving exactly two instruments. Same-instrument polyphony, reverberation
and multiple timbral layers remain possible. First-round relative B preference
stands; do not extend serial note choices without resolving voice attribution.
