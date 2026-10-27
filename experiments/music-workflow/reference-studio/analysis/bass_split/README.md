# Targeted original-audio bass extraction

User rejects the previous generic layer grouping and asks to extract the obvious
accompaniment/bass inside accepted07. Exactly two timbres and original MIDI remain
unconfirmed. Output: case `低音分离试验/试听`.

Listen to01 bass candidate, then02 remaining audio.00 is07 reference;03 plays
8s original→.25s pause→8s bass→.25s→8s remainder. All are48kHz24-bit stereo with
common gain2 and2ms edge fades. Raw float estimates and previous files are retained.
There is no guide-audio transplant, replacement instrument or synthesized note.

## Actual investigation

- `audit/`: low harmonic families follow about46→44→39→44Hz missing-root
  hypotheses. Root octave/instrument identity is unknown. Old MuS3D stem03 and
  track05 match07's strong155/175/185Hz upper bass better than HD bass/track04.
- `model/run_bass.py`: cached official HDEMUCS rerun on07's10s stereo other
  context barely reassigns bass (RMS.117% of07); this attempt fails.
- `model/run_bass_query.py`: one cached PaSST/PCA→BS-Locoformer stem query with
  original HD bass reference captures a conservative lower layer.98.86% of its
  power is20–250Hz, capturing13.75% of07's corresponding band power. Upper bass
  remains; this alternative is retained under `model/bass-audio-query`.
- `harmonic/extract_bass_family.py`: follows low harmonic-family movement using
  both-channel power and old stem03 partial/envelope identity. Time-varying soft
  tubes select07's own complex spectrum, not a simple low-pass. Higher partials
  can coincide with melody, so their assignment remains conservative.
- Initial narrow version is retained. The selected `harmonic/wide-low-partials`
  corrects spectral-skirt residual by widening only the first12 partials (up to
  about555Hz); higher rules are unchanged. No further tuning/model loops.

Selected tracking states:46.14Hz to3.272s,43.95Hz to4.464s,38.82Hz to6.904s,
then43.58Hz. These are hypotheses, not recovered original bass notes. Candidate/
source band-power ratios are78.6% at35–250Hz,43.5% at250–600Hz,1.95% at600–1600Hz
and.224% at1600–4400Hz; they are not percentages of the true instrument removed.

`prepare_delivery.py` packages the selected raw pair without rerunning models,
refuses unfamiliar/user-modified replacement and records hashes in delivery.json.
Frames, finite values, peaks, quantization and pauses pass; raw additive max error
7.45e-9 and PCM24 error1.20e-7. Source07 and27 previous delivered files remain
hash-identical. Existing local runtimes only, no new download, upload, application,
screen or audio device. Listening must establish target identity and melody
preservation; arithmetic checks cannot establish successful musical separation.

Listening follow-up: user hears some resemblance but finds the bass imprecise,
rough and cut-out sounding. Extraction quality is not accepted. A read-only audit
finds independent partial gains and root-region fits, short smoothing and no
explicit same-pitch note attacks; these may contribute but are not a proven cause.
Joint event/envelope/timbre inference is a proposed next experiment, unimplemented.
Regularity must allow intentional glide, distortion and modulation. A newly
synthesized smooth bass would be a separate reconstruction, not validated extraction.
