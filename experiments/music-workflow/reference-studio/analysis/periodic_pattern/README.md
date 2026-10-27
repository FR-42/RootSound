# Local periodic-pattern experiment

User proposal: exploit repeated waveform structure, not only frequency bands;
an estimated pattern is an acceptable exploratory output. The user then notes
that melody need not repeat. These are different scales: local waveform cycles
may recur within a changing note sequence; an entire repeated melody is optional.
Pitch perception does not prove hundreds of identical cycles or a unique source.

`fit_pattern.py` uses accepted07, preserving both channels. Eight cycles near
relative0.68s train a robust, phase-aligned1024-point stereo table, with a
training-only reference-period estimate of21.65817ms (46.171953Hz). Four following
cycles and relative0.08–0.28s are not used to fit the table. Output is in the case's
`周期模式试验/`; `双声道周期表.json` contains waveform and provenance, not a product format.

The frozen pattern correlates0.621 with held-out cycles but explains only6.3%
of their energy at fixed gain. The external window correlates0.417 even after
one diagnostic global-phase correction. This does not establish cross-window
stability. The0.899 training-half comparison uses a shared alignment template;
it is descriptive, not independent validation. Octave ambiguity, shared harmonics,
envelopes, modulation, noise and reverb remain unresolved. A repeating mixture
is not necessarily one instrument. No full melody, new MIDI or whole8s remake.

`verify_pattern.py` checks table/NPZ identity, replay, source excerpts, finite
unclipped output and accepted07's unchanged hash. Adjacent interpolation across
the train/test boundary may share one input sample. These checks are not musical
acceptance. `prepare_delivery.py` makes one48kHz24-bit stereo1.5s audition with
gain2, no separate normalization. It is **estimated pattern replay**, not unchanged
separated audio. No application, desktop, audio-device, upload or download operation.

Run these scripts with the existing Anaconda Python and NumPy/SciPy/Matplotlib.
No new models or dependencies are needed. Related primary documentation:
[Praat autocorrelation pitch analysis](https://www.fon.hum.uva.nl/praat/manual/pitch_analysis_by_raw_autocorrelation.html).
