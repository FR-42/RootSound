# MuScriptor short local diagnostic

This experiment follows the user's rejection of both the prior spectral note
guesses and the short sampled timbre. It does not reuse those 33 notes or generate
new music. It only probes a different learned transcription model.

The Windows CPU backend is [muscriptor.cpp](https://github.com/DamRsn/muscriptor.cpp)
at `c8adc019677ed3479fa3c22c1a117d662382f347`. The source archive and the
upstream-pinned ggml `e91ded11bdcd78c42f9c8d3978ff6686eb4c1226` are fetched from
their exact GitHub commit URLs. Both archives have recorded SHA256 hashes in
`.cache/muscriptor-experiment/` provenance records. Because ggml's configure script
runs Git in an archive below the RootSound checkout, its printed short commit
can refer to the containing RootSound checkout. The pinned source URL, extracted
directory, `FETCHCONTENT_SOURCE_DIR_GGML`, and archive hash identify the dependency.

The small 103M F16 checkpoint is from the backend author's public
[GGUF distribution](https://huggingface.co/DamRsn/muscriptor-gguf), revision
`d7045f94e8b19427f4ff9542975035e66596e51c`. Its exact byte count and SHA256 are
verified against the same pinned repository's `v1/SHA256SUMS` before use.
`MODEL-NOTICE.md` and `MODEL-LICENSE.txt` remain in the local cache. These weights
are CC BY-NC 4.0, used for this personal diagnostic only. The native backend is
MIT; this is not approval to ship these weights commercially with RootSound.

`build.cmd` uses existing Visual Studio 2022 MSVC and bundled CMake/Ninja, with
CPU only, no Vulkan, Metal, UI, sound device or synthesizer. MSVC's PDB manager
failed CMake's initial compiler check (C1902), so the wrapper enables CMake
CMP0141 and embedded `/Z7` debug information before `project()`. The second
configure/build uses the same compiler and dependency source, without installing
or switching toolchains. `trial.cpp` is only raw float32 input and JSON output
around the unmodified upstream `Transcriber` API.

`prepare_audio.py` reads the first five seconds of source `07-*.wav`, averages
stereo channels, and resamples 48 kHz to 16 kHz with SciPy's rational resampler.
Five seconds provide one native model chunk; the diagnostic focuses on the first
1.3 seconds. The original file is hash-checked before and after. Preparation,
inference and output are local; only code, public weights and licence files are
downloaded. User audio is never supplied to a network request.

Run `build.cmd`, then `prepare_audio.py`, then `run_trial.py`. The downloader is
`fetch_model.py`; it reads no user audio. All downloaded dependencies/build files
stay below `.cache/muscriptor-experiment/`. Results go to this case's
`melody/muscriptor-short/` and include the complete raw note list plus a short
focus summary. No model-detected instrument is automatically declared the lead.
Successful execution alone does not verify note correctness.

## Observed short result, 2026-10-24

The single automatic small-model run completed in 31.354 seconds on CPU with
four threads (five seconds of audio). It emitted 182 notes: 146 labelled
`acoustic_guitar`, 36 labelled `string_ensemble`. Forty-six notes start before
1.3 seconds. It produced no `synth_lead` group.

The upper string-ensemble notes in that focus window are MIDI 77 at
0.16–0.64 s, MIDI 75 at 0.64–0.96 s, MIDI 77 at 0.96–1.28 s, and MIDI 70 at
1.28–1.59 s. In particular this automatic output does not contain MIDI 80 near
0.35 s. These observations do not establish either the lead's true pitches or
the correctness of the model's instrument labels. No track was selected as the
main melody, no notes were replaced with earlier guesses, and no audio was
synthesized or played.

The complete notes and provenance are in
`cases/phone-recording-20261023-233819/melody/muscriptor-short/07-automatic-notes.json`
relative to the reference studio. The focus summary is `07-first-1.3-seconds.json`
beside it. Model file SHA256 is
`925f55af65a20ebc4f8b45ceaf095a12b72493d436cb112623cd0041a1af23d4`.
Original `07` source SHA256 remained
`db79615e148120d8183bca8cddf7e4d881beefb09999b45ee9e215b24c672fac`.

Exactly one additional run used the model's supported `synth_lead` instrument
condition, with the same prepared audio, weights, CPU backend and four threads:
`run_trial.py synth_lead`. It completed in 26.447 seconds and emitted 66 notes,
15 starting before 1.3 seconds. Every output note has program 80 because the
condition restricts decoding to that group; the label is not independent
confirmation of source separation or correctness.

The conditioned output is still polyphonic: seven notes start together at
0.16 s, including MIDI 42, 49 and 54 held until 3.12 s and MIDI 58 until 1.88 s.
It therefore contains sustained low notes and simultaneous harmony as well as
changing upper notes. A restriction to `synth_lead` has not yielded a clean
single lead. Its early onsets (0.16, 0.33, 0.49, 0.66, 0.97 s) form a regular
pattern, but these timestamps alone do not verify the target melody's timing.
No notes were fitted to earlier pitch guesses, no melody was selected, and no
audio was produced or played. The second run used the default restricted
network execution environment; no downloader or network escalation was invoked.

The separate files are `07-synth-lead-notes.json` and
`07-synth-lead-focus.json` in the same `melody/muscriptor-short/` directory.
The source hash remained unchanged. These two short diagnostics complete this
bounded model trial; no further model or conditioning runs were performed.
