"""One local small-model probe, with source/model identity and audio checks.

The native backend only reads local model/audio files. It has no audio-device,
UI, HTTP or upload code. No synthesis or melody selection is performed here.
"""
from pathlib import Path
from collections import Counter
import hashlib
import json
import math
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[6]
CACHE = ROOT / '.cache/muscriptor-experiment'
CASE = ROOT / 'experiments/music-workflow/reference-studio/cases/phone-recording-20261023-233819'
OUT = CASE / 'melody/muscriptor-short'
condition = sys.argv[1] if len(sys.argv) == 2 else 'automatic'
if condition not in {'automatic', 'synth_lead'} or len(sys.argv) > 2:
    raise ValueError('Only automatic or synth_lead conditioning is supported')
stem = '07-automatic' if condition == 'automatic' else '07-synth-lead'
provenance = json.loads((CACHE / 'provenance.json').read_text('utf-8-sig'))
audio_provenance = json.loads((CACHE / 'audio-provenance.json').read_text('utf-8'))
ggml_provenance = json.loads((CACHE / 'ggml-provenance.json').read_text('utf-8-sig'))

def sha256(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

weights = CACHE / 'muscriptor-small-f16.gguf'
audio = CACHE / '07-first-five-seconds-16000.f32'
source = Path(audio_provenance['source'])
executable = CACHE / 'build/muscriptor_short.exe'
assert sha256(weights) == provenance['weightSha256']
assert sha256(CACHE / 'source.zip') == provenance['sourceArchiveSha256']
assert sha256(CACHE / 'ggml.zip') == ggml_provenance['archiveSha256']
assert sha256(audio) == audio_provenance['preparedSha256']
assert sha256(source) == audio_provenance['sourceSha256']
native_report = CACHE / (stem + '-native.json')
command = [str(executable), str(weights), str(audio), str(native_report)]
if condition == 'synth_lead':
    command.append('synth_lead')
process = subprocess.run(command,
    capture_output=True, text=True, timeout=180, creationflags=subprocess.CREATE_NO_WINDOW)
(CACHE / (stem + '-runtime.log')).write_text(process.stdout + '\n' + process.stderr, encoding='utf-8')
if process.returncode != 0:
    raise RuntimeError(f'Native transcription failed ({process.returncode}): {process.stderr[-3000:]}')
report = json.loads(native_report.read_text('utf-8'))
assert report['backend'] == 'CPU' and report['audioSeconds'] == 5
assert report['conditioning'] == condition
assert len(report['notes']) > 0, 'Model returned no notes'
for note in report['notes']:
    assert all(math.isfinite(note[key]) for key in ['onset', 'offset', 'pitch', 'program'])
    assert 0 <= note['onset'] < note['offset'] <= 5.01
    assert 0 <= note['pitch'] <= 127 and 0 <= note['program'] <= 128
source_unchanged = sha256(source) == audio_provenance['sourceSha256']
assert source_unchanged
report.update({'model': 'MuScriptor small 103M F16, muscriptor.cpp unmodified transcription API',
    'provenance': provenance, 'ggmlProvenance': ggml_provenance,
    'executableSha256': sha256(executable), 'audioProvenance': audio_provenance,
    'sourceUnchanged': source_unchanged, 'focusSeconds': [0, 1.3],
    'networkExecution': 'Inference command uses the default restricted sandbox; no network escalation or downloader is invoked.',
    'limitations': ['Polyphonic model output is not a selected main melody.',
        'Five seconds of input provide one model chunk; only the first 1.3s are the requested diagnostic.',
        'No timbre, velocity, pitch bends or articulations are reconstructed.',
        'Successful execution and a different note list do not establish correct transcription.',
        'Weights are CC BY-NC 4.0; retained source notice applies.']})
focus = [note for note in report['notes'] if note['onset'] < 1.3]
summary = {'model': report['model'], 'inferenceSeconds': report['inferenceSeconds'],
    'conditioning': condition,
    'allFiveSecondNoteCount': len(report['notes']), 'first1Point3SecondsNoteCount': len(focus),
    'instrumentCounts': dict(Counter(note['instrument'] for note in report['notes'])),
    'focusNotes': focus, 'audioUploaded': False, 'sourceUnchanged': source_unchanged,
    'leadSelected': False}
OUT.mkdir(parents=True, exist_ok=True)
(OUT / (stem + '-notes.json')).write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
focus_name = '07-first-1.3-seconds.json' if condition == 'automatic' else '07-synth-lead-focus.json'
(OUT / focus_name).write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps(summary, ensure_ascii=False), flush=True)
