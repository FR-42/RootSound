"""Offline learned-note diagnostic after user rejection of spectral guesses.

Uses Spotify's official ONNX weights and selected official decoding functions.
No single melody is inferred from polyphonic outputs, and no new music is made.
"""
from __future__ import annotations
import ast
from pathlib import Path
import hashlib
import json
import socket
import sys
import time
import types
import numpy as np
import scipy
from scipy import signal
from scipy.io import wavfile

ROOT=Path(__file__).resolve().parents[5]
CACHE=ROOT/'.cache/pitch-model-experiment'
sys.path.insert(0,str(CACHE/'python'))
import onnxruntime as ort
STUDIO=Path(__file__).resolve().parents[2]
CASE=STUDIO/'cases/phone-recording-20261023-233819'
OUT=CASE/'melody/neural-basicpitch'
OUT.mkdir(parents=True,exist_ok=True)
OFFICIAL=CACHE/'official/basic_pitch'
provenance=json.loads((CACHE/'official-provenance.json').read_text('utf-8'))
for item in provenance['files']:
    assert hashlib.sha256((CACHE/item['path']).read_bytes()).hexdigest()==item['sha256']

def load_functions(path,names,namespace):
    tree=ast.parse(path.read_text('utf-8'))
    body=[ast.ImportFrom(module='__future__',names=[ast.alias(name='annotations')],level=0)]
    body.extend(node for node in tree.body if isinstance(node,ast.FunctionDef) and node.name in names)
    assert len(body)==len(names)+1
    module=ast.fix_missing_locations(ast.Module(body=body,type_ignores=[]))
    exec(compile(module,str(path),'exec'),namespace)

# Only dependency adaptations: scipy's rational resampler replaces librosa's
# default soxr resampler, and these two elementary unit conversions avoid MIDI
# writer/audio playback dependencies. Official neural weights/decoder unchanged.
librosa=types.SimpleNamespace(hz_to_midi=lambda hz:69+12*np.log2(np.asarray(hz)/440),
    core=types.SimpleNamespace(frames_to_time=lambda frames,sr,hop_length:np.asarray(frames)*hop_length/sr))
ns={'np':np,'scipy':scipy,'librosa':librosa,'MIDI_OFFSET':21,'MAX_FREQ_IDX':87,
    'AUDIO_SAMPLE_RATE':22050,'FFT_HOP':256,'ANNOT_N_FRAMES':172,
    'AUDIO_N_SAMPLES':43844,'AUDIO_WINDOW_LENGTH':2,'ANNOTATIONS_FPS':86,
    'MAGIC_ALIGNMENT_OFFSET':.0018}
load_functions(OFFICIAL/'inference.py',{'window_audio_file','unwrap_output'},ns)
load_functions(OFFICIAL/'note_creation.py',{'get_infered_onsets','constrain_frequency',
    'model_frames_to_time','output_to_notes_polyphonic'},ns)
options=ort.SessionOptions();options.intra_op_num_threads=4;options.inter_op_num_threads=1
model=ort.InferenceSession(str(OFFICIAL/'saved_models/icassp_2022/nmp.onnx'),
    sess_options=options,providers=['CPUExecutionProvider'])
def blocked(*args,**kwargs):raise RuntimeError('Network disabled during local audio inference')
socket.socket=blocked
reports=[]
for prefix in ['07-','02-','05-']:
    source=next((CASE/'试听').glob(prefix+'*.wav'))
    source_sha=hashlib.sha256(source.read_bytes()).hexdigest()
    rate,pcm=wavfile.read(source)
    audio=pcm.astype(np.float32).mean(axis=1)/2**31
    audio=signal.resample_poly(audio,147,320).astype(np.float32)
    assert rate==48000 and len(audio)==176400
    overlap=30*256;hop=43844-overlap
    padded=np.concatenate([np.zeros(overlap//2,np.float32),audio])
    outputs={name:[]for name in ['note','onset','contour']}
    start=time.monotonic()
    for window,_ in ns['window_audio_file'](padded,hop):
        raw=model.run(['StatefulPartitionedCall:1','StatefulPartitionedCall:2','StatefulPartitionedCall:0'],
            {'serving_default_input_2:0':window[None]})
        for key,value in zip(outputs,raw):outputs[key].append(value)
    decoded={key:ns['unwrap_output'](np.concatenate(value),len(audio),30,hop)for key,value in outputs.items()}
    assert all(np.isfinite(value).all()for value in decoded.values())
    events=ns['output_to_notes_polyphonic'](decoded['note'].copy(),decoded['onset'].copy(),
        onset_thresh=.5,frame_thresh=.3,min_note_len=11,infer_onsets=True,
        max_freq=None,min_freq=None,melodia_trick=True)
    times=ns['model_frames_to_time'](len(decoded['note'])+1)
    note_events=[{'startSeconds':round(float(times[a]),5),'endSeconds':round(float(times[b]),5),
        'midi':int(p),'activation':round(float(v),5)}for a,b,p,v in events]
    note_events.sort(key=lambda event:(event['startSeconds'],event['midi']))
    report={'source':str(source),'sourceSha256':source_sha,'officialCommit':provenance['commit'],
        'model':'Spotify BasicPitch official ICASSP2022 ONNX','seconds':time.monotonic()-start,
        'notes':note_events,'settings':{'onsetThreshold':.5,'frameThreshold':.3,'minimumNoteFrames':11},
        'limitations':['Polyphonic notes are not a selected main melody.',
            'Model outputs require listening; replacing FFT with ML is not proof of correct notes.',
            'Preprocessing differs from official CLI only in resampling implementation and unit conversion dependencies.'],
        'audioUploaded':False,'sourceUnchanged':hashlib.sha256(source.read_bytes()).hexdigest()==source_sha}
    np.savez_compressed(OUT/(prefix[:2]+'-activations.npz'),**decoded)
    (OUT/(prefix[:2]+'-notes.json')).write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
    reports.append({'source':prefix,'events':len(note_events),'seconds':report['seconds'],
                    'firstSecond':[e for e in note_events if e['startSeconds']<1]})
print(json.dumps(reports,ensure_ascii=False))
