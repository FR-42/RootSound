# Local MuS3D trial

This helper is an isolated research experiment, not a RootSound production
module. It runs the official MuS3D stem-discovery generator with the released
query-conditioned BS-Locoformer. Candidate names are classifier guesses.
Successful execution does not establish successful timbre extraction.

Official code: <https://github.com/REMUS-Aalto/MuS3D>
Official model weights: <https://huggingface.co/remus-aalto/MuS3D>

## Trial performed

- User recording: `D:\Sound\temp\music\手机录音-20261023-233819.wav`.
- User target: leading melody at 45–53 seconds.
- Model context: exact source excerpt 44–54 seconds, provided by the parent
  task under `cases/phone-recording-20261023-233819/input/context-44-54.wav`.
- Local CPU inference, 4 PyTorch threads, track-level, seed 0, SEG 32 steps,
  churn 0.1, recursive cap 16. The model stopped normally after 5 queries.
- Actual successful run took 156.90 seconds after dependencies/downloads.
- Each estimate is stereo, 44.1 kHz, 10 seconds, FLOAT WAV, unnormalised.
- Output: `cases/phone-recording-20261023-233819/mus3d/context-44-54`.
- `run-manifest.json`, `trace.txt`, and `discovery-embeddings.npz` preserve
  configuration, model guesses, stopping cosines, timings, and embeddings.

The source recording is never overwritten or uploaded. During inference,
socket connections are rejected by the helper. There is no playback or UI
automation. The model performs source estimation only, with no replacement
synthesis, MIDI generation, or claims of recovering an original author patch.

## Local runtime

The existing project cache supplies PyTorch/torchaudio 2.7.1 CPU. Additional
dependencies live only in `.cache/mus3d-experiment/python`; compatible CPU
torchvision 0.22.1 is in `torchvision-python`. The frozen DAC-VAE source is the
official pinned commit `414c20785fc3a28373073ea8ef7a1316eeeaca6e`. We do not install
the much larger training environment or DiT separator.

`prepare_official.py` retrieves official public assets to that cache using
persistent downloads and verifies official Hugging Face LFS SHA-256 hashes.
PaSST has no published SHA-256 in its source; its downloaded SHA-256 is
recorded, and the content MD5 was checked against the official GitHub release
blob header. `.cache/mus3d-experiment/asset-provenance.json` records the archive
and model digests.

The official PaSST constructors print architecture details. Full successful
stdout/stderr is retained in `.cache/mus3d-experiment/inference-track.log`.

One initial execution failed because the Anaconda and PyTorch OpenMP runtimes
collided. `MKL_THREADING_LAYER=SEQUENTIAL` resolves this by keeping NumPy MKL
sequential; the unsafe `KMP_DUPLICATE_LIB_OK` workaround is not used. The
official CUDA autocast decorators safely disable themselves on CPU and warn;
legacy STFT deprecation warnings do not change outputs.

Adaptations to the official inference procedure are explicit: local frozen
encoder paths, CPU thread limits, sequential independent separator queries
to bound memory, and FLOAT output instead of the official default PCM16.
No learned weights or model architecture were changed. Each query is extracted
independently from the same mixture; the candidate estimates are not guaranteed
to form an exact partition or sum back to the mixture.

## Focused target checks

After the fine-level discovery, the parent task requested two further checks
on exactly the same context to investigate the target melody:

1. `run_local.py --level stem`, seed 0, writes
   `mus3d/stem-context-44-54`. The actual run found 3 candidates and took
   80.43 seconds. All original weights, SEG steps/churn, and signal handling
   remain unchanged.
2. `run_guided_reference.py` uses the previously generated Hybrid Demucs
   `other-estimate.wav` as an explicitly noisy, model-derived audio exemplar.
   The real reference is encoded by official PaSST and PCA, then passed to
   the unchanged query BS-Locoformer at stem granularity. This is a guided
   query test, not blind discovery or a clean reference, and may contain
   multiple voices and artifacts. Outputs and its separate method manifest
   go in `mus3d/guided-context-44-54`.

These checks do not generate a substitute timbre or a new musical performance.
They remain audio separation estimates whose fidelity must be judged against
the original target sound.
