"""Assemble the reviewed single lead into editable events, not a full-song score."""
from pathlib import Path
import hashlib
import json
import numpy as np

CASE=Path(__file__).resolve().parents[2]/'cases/phone-recording-20261023-233819'
OUT=CASE/'melody'
SOURCE=CASE/'试听/07-普通分轨基线.wav'
PATCH=CASE/'音色/手机旋律-短音.rstimbre'
SOURCE_SHA='db79615e148120d8183bca8cddf7e4d881beefb09999b45ee9e215b24c672fac'
PATCH_SHA='c943706fa91a665075f9276c7c8b92ec7a89b98a8b91c42e683f17f2b7aba4db'
assert hashlib.sha256(SOURCE.read_bytes()).hexdigest()==SOURCE_SHA
assert hashlib.sha256(PATCH.read_bytes()).hexdigest()==PATCH_SHA
candidate=json.loads((OUT/'independent/recommended-events.json').read_text('utf-8'))
events=candidate['events']
annotations=[]
for item in events:
    event=dict(item)
    t=event['onset_seconds']
    if abs(t-2.8332)<.001:
        event.update(midi=92,confidence='medium',alternative_midis=[73],
            review='1661Hz and4983Hz rise together;554Hz does not. New upper G-sharp6 is preferred over lower C-sharp5 harmonic alias.')
    if abs(t-3.45496)<.001:
        event.update(midi=89,confidence='medium',alternative_midis=[70],
            review='New4190Hz third harmonic occurs in07/A/B while lower accompaniment remains. Prefer F6; retain lower alternative.')
    if abs(t-4.07672)<.001:
        event.update(review='554Hz fundamental attacks across07/A/B. Keep C-sharp5; G-sharp6 can be an overlapping layer, not automatic replacement.')
    if abs(t-7.96273)<.001:
        event.update(midi=84,confidence='medium',alternative_midis=[72,87],
            review='Additional existing context beyond53s supports new1046Hz/3140Hz C6 at this boundary.')
    annotations.append(event)
annotations.append({'onset_seconds':7.88501,'midi':87,'confidence':'medium',
    'alternative_midis':[85], 'review':'1244Hz and3730Hz new attack before the final C6, confirmed in existing44--54s context.'})
annotations.sort(key=lambda e:e['onset_seconds'])
data=np.load(OUT/'template/template-evidence.npz')
amplitudes=[]
for event in annotations:
    t=event['onset_seconds'];i=np.where(data['midis']==event['midi'])[0][0]
    frames=(data['times']>=t+.025)&(data['times']<min(t+.11,8.001))
    amplitudes.append(float(np.mean(data['parts'][i,2,frames])))
median=float(np.median(amplitudes[:-1]))
native=[]
for i,event in enumerate(annotations):
    start=event['onset_seconds']
    next_onset=annotations[i+1]['onset_seconds'] if i+1<len(annotations) else 8.0
    duration=round(max(.01,next_onset-start-(.020 if i+1<len(annotations) else .0)),5)
    # A gentle dynamic estimate, bounded because reverb/other voices contaminate
    # partial amplitudes. It is not original MIDI velocity recovery.
    velocity=round(float(np.clip(.82*(max(amplitudes[i],1e-8)/median)**.35,.58,.98)),3)
    if i==len(annotations)-1:velocity=.78
    event.update(duration_seconds=duration,velocity=velocity)
    native.append({'startSeconds':start,'durationSeconds':duration,
                   'midi':event['midi'],'velocity':velocity})
doc={'name':'手机旋律 · 45至53秒 · 还原草稿','tempo':193,'bars':7,
     'durationSeconds':8,'events':native}
(OUT/'events-final.json').write_text(json.dumps(doc,ensure_ascii=False,indent=2),encoding='utf-8')
report={'status':'Editable reconstruction draft; user listening pending',
    'source':str(SOURCE),'sourceSha256':SOURCE_SHA,'instrument':str(PATCH),'instrumentSha256':PATCH_SHA,
    'sourceOriginalSeconds':[45,53],'noteCount':len(native),'tempoBpm':193,
    'noteTiming':'Approximate onset grid from measured attacks; phase35.27ms. Spectral onset uncertainty about10--25ms. Not original author grid.',
    'velocityEstimate':'0.82*(mean third-partial amplitude / median)**0.35, bounded0.58--0.98; final clipped note0.78. Not original MIDI velocities.',
    'events':annotations,'evidence':['rhythm-evidence.json','independent/focused-alias-conclusions.json',
        'independent/focused-alias-measurements.json','sample-match/extended-96/focused-review.json'],
    'limitations':['Only one selected lead, no drums/bass/accompaniment reconstruction.',
        'Ambiguous overlapping notes remain editable approximations, not original score.',
        'Unchanged single0.28s one-shot instrument cannot sustain all long/high notes.',
        'Sample transposition changes formants and duration; distant high notes can be thin/sharp.',
        '7whole bars cover8s at193BPM; file has about0.705s blank after source window.',
        'No subjective listening, desktop control or audio device was used.']}
(OUT/'transcription-review.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({'notes':len(native),'tempo':193,'events':str(OUT/'events-final.json'),
                  'midiRange':[min(e['midi']for e in native),max(e['midi']for e in native)]}))
