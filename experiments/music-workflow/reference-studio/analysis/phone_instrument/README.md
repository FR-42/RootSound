# Selected07 to a playable short-note instrument

Input is the user's accepted `07-普通分轨基线.wav` from the phone recording
case. Its SHA256 stays `db79615e148120d8183bca8cddf7e4d881beefb09999b45ee9e215b24c672fac`.
Acceptance of that extraction is not acceptance of this derived instrument.

Run Python helpers in the existing local audio-analysis environment (NumPy,
SciPy, Matplotlib), not through a desktop or audio device:

1. `pitch_probe.py` records pitch/onset evidence and short-note candidates.
2. `prepare_material.py` preserves an exact decoded raw crop and separately
   reduces low-frequency accompaniment. Context filtering precedes cropping;
   the original source is never overwritten. Settings keep estimated root80.
3. `loop_probe.py` checks prepared samples independently and searches stable
   stereo loops. No reliable candidate was found; keep sustain loop disabled.
4. Build and invoke [native-probe](native-probe/README.md) to `create` the
   instrument from `instrument/prepared/melody-note-Gs5.wav` and
   `short-settings.json`. Use a new export destination. `verify` imports it
   through the actual existing native code and renders keys plus a portable
   editable phrase into a new output directory.
5. `package_delivery.py` collects native-verified results into case `音色/`,
   checks exact embedded samples and PCM24 quantization, and writes provenance.
   Its expected paths refer to this original run; preserve existing deliveries
   when repeating with changed settings.

Current output is a 0.28-second one-shot around G-sharp5, from07-relative
0.340–0.620seconds (original45.340–45.620). No high cut or resynthesis is used.
Sampler transposition changes playback speed and duration; residual layers and
reverb can remain. Numerical/native-engine checks do not establish musical
fidelity. Previews are keyboard tests, not original-melody transcriptions.
