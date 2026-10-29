"""Only generated signals. No user music, screenshots, or playback."""
from bootstrap import ROOT, CONFIG
from pathlib import Path
import hashlib, json, os, subprocess, sys, time, uuid
import numpy as np
import soundfile as sf
import mido
from engine import mix, save_midi, transcribe, write_json

run=ROOT/'tests-output'/uuid.uuid4().hex[:8]; run.mkdir(parents=True)
rate=44100; duration=8.2
t=np.arange(round(rate*duration))/rate
envelope=np.minimum(1,t/.04)*np.minimum(1,(duration-t)/.08)
signal=(.16*np.sin(2*np.pi*440*t)+.06*np.sin(2*np.pi*880*t)+.025*np.sin(2*np.pi*1320*t))*envelope
source=run/'generated A4.wav'; sf.write(source,np.column_stack([signal,signal*.92]),rate,subtype='FLOAT')
before=hashlib.sha256(source.read_bytes()).hexdigest()
metrics={}; started=time.monotonic()
for mode in ('4','6'):
    job=run/('split-'+mode); request=run/('request-'+mode+'.json')
    write_json(request,{'action':'separate','input':str(source),'mode':mode,'midi':mode=='4','job':str(job)})
    begin=time.monotonic()
    with (run/('worker-'+mode+'.log')).open('w',encoding='utf8') as log:
        result=subprocess.run([CONFIG['python'],'-u',str(ROOT/'engine.py'),str(request)],stdout=log,stderr=subprocess.STDOUT,timeout=600,creationflags=subprocess.CREATE_NO_WINDOW)
    assert result.returncode==0,(mode,(run/('worker-'+mode+'.log')).read_text(encoding='utf8')[-4000:])
    manifest=json.loads((job/'project.json').read_text(encoding='utf8'))
    assert len(manifest['stems'])==int(mode)
    combined=np.zeros((len(t),2),dtype=np.float32)
    for item in manifest['stems']+[{'file':'residual.wav'}]:
        data,sr=sf.read(job/item['file'],dtype='float32',always_2d=True)
        assert sr==rate and data.shape==combined.shape and np.isfinite(data).all()
        combined+=data
    expected,_=sf.read(source,dtype='float32',always_2d=True)
    error=float(np.abs(combined-expected).max())
    assert error<2e-6,error
    if mode=='4':
        assert manifest['midi_status']=='complete',manifest.get('midi_error')
        midi=mido.MidiFile(job/'all-stems.mid'); assert midi.type==1 and midi.ticks_per_beat==256
        active=[msg for track in midi.tracks for msg in track if msg.type=='note_on' and msg.velocity>0]
        assert any(msg.note==69 for msg in active),'Generated A4 was not detected'
        metrics['midi_note_count']=len(active)
        for track in midi.tracks:
            assert all(msg.time>=0 for msg in track)
    metrics[mode]={'seconds':time.monotonic()-begin,'reconstruction_max_error':error,'frames':len(t),'stems':len(manifest['stems']),'midi_status':manifest['midi_status']}
    print('PASS mode',mode,metrics[mode],flush=True)

project=run/'split-4'/'project.json'
choices=[{'name':x,'gain':1} for x in ('drums','bass','other','vocals','residual')]
mix({'project':str(project),'tracks':choices,'output':str(run/'mix.wav')})
mixed,_=sf.read(run/'mix.wav',dtype='float32',always_2d=True)
assert np.abs(mixed-expected).max()<2e-6
try: mix({'project':str(project),'tracks':choices,'output':str(source)})
except ValueError: pass
else: raise AssertionError('Source overwrite was not rejected')
assert hashlib.sha256(source.read_bytes()).hexdigest()==before
notes={'tracks':[{'name':'piano','notes':[{'pitch':69,'velocity':100,'start':.2,'end':1.1}]}]}
save_midi(notes,run/'edited.mid'); midi=mido.MidiFile(run/'edited.mid')
assert any(msg.type=='note_on' and msg.note==69 and msg.velocity==100 for track in midi.tracks for msg in track)
notes['tracks'][0]['notes'][0]['end']=-1
try: save_midi(notes,run/'invalid.mid')
except ValueError: pass
else: raise AssertionError('Invalid note accepted')

import app
ui=app.Application(hidden=True); ui.load_project(str(project)); ui.update_idletasks()
assert len(ui.stem_vars)==5 and ui.notes is not None
ui.destroy()
metrics.update(source_unchanged=True,mix_reconstruction=True,invalid_note_rejected=True,source_overwrite_rejected=True,ui_load_hidden=True,total_seconds=time.monotonic()-started)
write_json(run/'results.json',metrics)
(ROOT/'last-test.txt').write_text(str(run),encoding='utf8')
print('ALL PASS',run,flush=True)
