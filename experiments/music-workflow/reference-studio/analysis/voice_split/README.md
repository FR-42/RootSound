# Original-audio voice grouping experiment

User asks to first separate some of the possibly different voices, after rejecting
both endings of the second piano comparison. Exactly two timbres are a hypothesis,
not known original instrumentation. This experiment never generates MIDI or
substitute instruments and preserves accepted07 and all earlier artifacts.

## Listen

Case output: `cases/phone-recording-20261023-233819/声部分离试验/试听`.

- `00-07原声对照.wav`: accepted07 reference, common audition gain only.
- `01-候选声部A.wav`, `02-候选声部B.wav`: tentative original-audio layers.
- `03-尚未分开的声音.wav`: conservative remaining material, potentially still
  including desired target details; not a verified accompaniment.
- `04-开头顺序对照.wav`: first2.4s reference→A→B→remaining, .25s gaps.

All main clips are8s,48kHz,24-bit stereo. One shared gain2 and2ms edge fades are
used for every preview, including reference; no per-stem loudness normalization.
Unmodified float estimates remain in `factorization/joint-spatial`.
The layer candidates may still mix instruments or divide one instrument's notes
or harmonics. They require real listening and are not accepted instrument stems.

## Findings and actually tested methods

`audit/` checks existing07 and the raw mix: some698Hz-region content is strongly
Side/anti-phase, while other harmonics are strongly Mid. Directly averaging left
and right suppresses that content. This occurs in the raw mix too; it is not solely
a Demucs artifact. Neither frequency nor spatial position uniquely identifies a
voice: one stereo synthesizer or reverberation can create these observations.
No clean solo-reference window or stable pair of pan positions was established.

`model_trial/` actually runs the cached official PaSST/PCA plus BS-Locoformer twice
with Mid/Side-biased real-audio examples and the unchanged full stereo07 mixture.
The Side reference is duplicated in-phase so the query encoder's mono average
does not cancel it. Query embeddings differ (cosine.9275), but separated waveforms
correlate.99255: the queries did not reliably separate the suspected voices. Their
conservative differences leave most material in a shared residual. Those two
near-duplicates are not delivered as the main candidate pair.

`factorization/` actually tests two unsupervised decompositions. The first ordinary
NMF mainly collects low/background material and is not selected. The second joint
Mid/Side KL-NMF learns48 spectral atoms with shared temporal activations and groups
them using smoothed spectral envelope, spatial proportion and attack/decay features.
Original complex spectral content is masked and reconstructed; uncertain atoms
remain in a third layer. It retains full8s stereo input and outputs48kHz samples.
The240-iteration limit was reached without convergence, and unsupervised grouping
can still follow notes/sections instead of instruments. This is a tentative
practical decomposition, not a claim of reproducing a particular published system.

NMF spectral-template/activation and audio-mask background:
[AudioLabs FMP](https://www.audiolabs-erlangen.de/resources/MIR/FMP/C8/C8S3_NMFSpecFac.html).
That reference also explains why unconditioned factors do not automatically have
musical meaning. This experiment does not have a verified score to constrain it.

## Spatial observations, separately labeled

The optional `试听/辅助监听` files are Mid/Side observation aids, not two separated
instruments. `中心成分` is[M,M], `左右差异-保留原声场` is[S,-S], where
M=(L+R)/2 and S=(L-R)/2. Their unscaled versions sum exactly to stereo07.
`左右差异-集中试听` instead uses[S,S] so that mono playback cannot cancel it again;
it intentionally changes the audition image and is not an additive stereo stem.

## Reproduction and verification

Sources are isolated under this directory. Python uses existing local
NumPy/SciPy/scikit-learn and cached model runtimes; no new weights or packages are
downloaded. `prepare_delivery.py` packages the selected joint-spatial WAVs without
rerunning models, refuses unfamiliar/user-modified output replacement and records
all output hashes in `试听/delivery.json`.

Three raw float layers sum back to07 with maximum error9.31e-9. Three delivered
24-bit layers sum back to the common-gain reference within1.20e-7. Frame count,
channels, finite values, clipping, WAV quantization and source hashes are checked;
all18 earlier audition outputs remain hash-identical. These numbers establish
signal preservation and delivery mechanics, not correct voice identity or sound
quality. No audio upload, desktop operation or real-device playback occurred.

Listening follow-up: user heard all delivered files and did not find the suspected
voices separated. This grouping is rejected as a musical result. The next target
is the obvious bass/accompaniment inside07; see sibling `bass_split/README.md`.
Keep these results intact; numeric preservation does not imply musical acceptance.
