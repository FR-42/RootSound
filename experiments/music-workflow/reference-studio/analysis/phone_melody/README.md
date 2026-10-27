# Phone45--53s lead: editable reconstruction draft

**Listening verdict: rejected.** User says both melody/rhythm and timbre/articulation
are severely wrong. The33-note artifact and heuristic confidence labels below
are failed experimental records, not a verified score. Accepted07 remains intact.

User scope: use the existing07-derived timbre to try reconstructing the main
melody of the8-second selection as an editable PhraseStudio phrase. Accepted07
and the instrument remain byte-exact. No UI, sound device or new model run.

## Reproduction and evidence

Use the existing NumPy/SciPy/Matplotlib Python environment. All seconds in events
are relative to45s of the original recording. Generated case data is ignored by
Git; source helpers are retained.

1. `template_probe.py` performs measured harmonic-profile/nonnegative fitting
   and saves stereo harmonic evidence. Optional `A` or `B` analyzes the existing
   extraction candidates as independent pitch evidence, not replacement timbres.
2. `rhythm_probe.py` fits a robust grid from prior onset data. Estimated tempo
   is192.984BPM, phase35.27ms; use193BPM as an editable working estimate.
3. `independent/` contains a separate attack/odd-harmonic analysis of07 andA/B.
   `sample_match/` separately fits the recorded sample after removing stationary
   contaminants. Its extended96-pitch run exposes otherwise missed upper notes.
   Naive whole-sample matching was rejected because embedded accompaniment
   incorrectly kept selecting the sampled root through changing melody notes.
4. Reviewed independent events are retained under case `melody/independent/`.
   Focused onset/partial comparisons distinguish a few lower-note/third-harmonic
   aliases. `build_events.py` assembles the reviewed33 notes, preserves alternatives,
   estimates bounded velocities and writes `melody/events-final.json` plus review.
5. Build [native-phrase](native-phrase/README.md) and run its DLL with the unchanged
   `音色/手机旋律-短音.rstimbre`, eventJSON and a fresh `melody/native-final` output.
   It uses actual PhraseArchive and PhraseMixSource, embeds the exact samples and
   settings, reopens and renders the saved phrase. It does not launch either app.
6. `package_delivery.py` independently inspects ZIP assets, note pitches, velocities,
   tick timing and8s audio. Collects case `乐句/` with Chinese names and instructions.
   Standalone audition crops have2ms edge fades; phrase audio keeps native release.
   Repeated packaging only refreshes unchanged files owned by the prior delivery
   manifest, refusing user-edited or unfamiliar content.

## Boundaries

33 notes, one piano-roll channel,193BPM,7wholebars. The selected8s is not an exact
whole-bar duration; about0.705s blank follows it in the document. Time conversion
is within0.057ms, but onset detection itself has roughly10--25ms uncertainty and
several pitches remain ambiguous. These are not the author's original MIDI data.
Only the selected lead is reconstructed, with no drums or accompaniment added.

The same0.28s one-shot sample is used throughout. It has no dependable sustained
loop. Higher transpositions become shorter and can sound thinner/sharper; some
long notes end early. Reconstructing notes does not fix this instrument limitation.
Source07 approval does not approve the timbre or this melody. Musical likeness,
articulation and usefulness require user listening; numerical checks cannot replace it.

## Learned-model diagnostic after rejection

`prepare_basic_pitch.py` downloads public Spotify model/source files only, pinned
to commit `fa5997af0a8210982619003269994a1be25eddf3`. Git blobSHA/byte lengths
and SHA256 are verified in `.cache/pitch-model-experiment/official-provenance.json`.
ONNX Runtime1.31.0 is isolated in that cache; global Python and app dependencies
are unchanged. Source/weights are Apache2.0; cached license retained.

`run_basic_pitch.py` runs the official neural model and selected official decoder
functions with default onset0.5/frame0.3/minimum11frames on existing07/A/B. Only
resampling implementation and elementary unit-conversion dependencies differ
from the official wrapper. Inference networking is disabled. Raw polyphonic
outputs are kept in case `melody/neural-basicpitch/`:67/42/123 events respectively.
These outputs include many low accompanying notes and do not establish a stable
target lead, including the short opening checkpoint. No new phrase is made from
them, and no thresholds are tuned merely to imitate the previous rejected notes.

`piano-check/` uses the existing native PianoReference for a short neutral-note
listening check. It is for judging note selection only, not timbre restoration.
It has no GUI, device, network or app-build side effects. It was built successfully;
no listening artifact is claimed until supported model notes are selected.
