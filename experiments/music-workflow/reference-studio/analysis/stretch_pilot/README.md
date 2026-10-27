# Isolated pitch-preserving playback experiment

This command-line helper performs offline audio processing only. It does not
separate instruments, identify melody, open an application or use an audio device.
The main RootSound application is unchanged.

## Reproduce

1. Run `prepare_sources.py` with Python when public-source download is authorized.
2. Run `build.ps1` with the existing Visual Studio 2022 Community compiler.
3. Run `verify.py` with NumPy available.

Sources, executable, build files and generated checks stay in
`D:\RootSound\.cache\stretch-pilot`. The executable is
`D:\RootSound\.cache\stretch-pilot\build\stretch-pilot.exe`.

```
stretch-pilot.exe input.f32 output.f32 48000 2 0.6
```

Parameters are input path, output path, sample rate, channel count, playback speed
and optionally pitch shift in semitones. Raw files use interleaved little-endian
float32 samples. Speed 0.6 creates round(input frames / 0.6) output frames without
lowering pitch. Speed 1 with zero pitch shift bypasses the processor exactly.

`stretch_audio.py input.wav output.wav --speed 0.6` accepts PCM/float WAV and writes
float32 WAV. Its `stretch_audio()` function accepts NumPy audio arrays. It refuses
to replace an existing WAV. Raw CLI output paths are explicitly writable and may
be replaced; input and output must be different.

One multichannel Signalsmith processor links stereo decisions. The upstream
`exact()` finite-clip path handles its `outputSeek()` pre-roll and `flush()` tail.
Clips below one second are zero-extended for processing, then trimmed to precisely
their requested duration. There is no normalization, limiting or clipping; float
output may exceed magnitude 1 around transients and needs appropriate playback
headroom. The algorithm can smear transients or alter timbre; synthetic integrity
checks do not establish musical quality.

## Dependencies and retained licenses

- [Signalsmith Stretch](https://github.com/Signalsmith-Audio/signalsmith-stretch),
  fixed commit `88061fd4eda56a2353c5d65c74aa3f4ccf76f9da`, library version 1.3.2,
  MIT. Its unmodified source and `LICENSE.txt` remain in the cache; a license copy
  is retained beside this document.
- [Signalsmith Linear](https://github.com/Signalsmith-Audio/linear), upstream
  required tag 0.6.6, fixed commit `7bb1c8f36794d6980080ce817c91f8da8fe56a66`, MIT.
  Its unmodified source and `LICENSE.txt` remain in the cache, with a local copy.

`sources.json` records pinned URLs and archive SHA-256 checksums. No model weights,
commercial plug-ins, account registration or audio upload are used. The wrapper's
NumPy/SciPy dependencies use the existing local Python environment.

## Verification scope

`verification.json` reports exact frame counts, exact unity bypass, 440 Hz tone
preservation at speed 0.6, linked stereo integrity, finite start/end signal,
50 ms clip handling and independent octave transposition. The initial MSVC probe
needed embedded debug information (`/Z7`) to avoid this machine's existing PDB
manager mismatch; the build file applies that before compiler detection.
Upstream templates emit floating-point conversion/shadowing warnings under `/W4`;
these are not hidden or promoted into a claim of a warning-free build.
