"""Independent best-effort melodic hypothesis, not recovered original score.

Kept separate from root's decoder so disagreements remain reviewable. Confidence
labels describe relative spectral support, not calibrated probabilities.
"""
from pathlib import Path
import json

OUT=Path(__file__).resolve().parents[3]/'cases/phone-recording-20261023-233819/melody/independent'
phase=.0352721; step=60/193/2
# Index in half-quarter grid, MIDI, held half-quarter units, confidence, alternates.
# Suspected accompaniment or harmonic aliases are explicit alternatives. This
# sequence should be compared with the other source/decoder before packaging.
specs=[
 (0,77,2,'high',[]),(2,80,2,'high',[]),(4,75,2,'high',[]),
 (6,77,1,'medium',[75]),(7,70,1,'low',[89,None]),
 (8,80,1,'high',[]),(9,77,1,'medium',[70,89]),
 (10,75,1,'medium',[]),(11,80,1,'high',[]),(12,82,2,'high',[]),
 (14,70,2,'medium',[89]),(16,89,2,'medium',[70]),
 (18,73,2,'medium',[92]),(20,87,2,'high',[80]),
 (22,70,2,'medium',[89]),(24,77,2,'medium',[]),
 (26,73,2,'medium',[92]),(28,75,2,'medium',[73]),
 (30,75,1,'low',[70,None]),(31,89,2,'medium',[70]),
 (33,88,1,'medium',[75]),(34,75,2,'medium',[87]),
 (36,74,2,'low',[75,70]),(38,70,2,'low',[75]),
 (40,85,2,'high',[]),(42,87,1,'medium',[]),
 (43,85,1,'low',[74,70]),(44,84,2,'high',[72]),
 (46,74,1,'low',[84,75]),(47,85,2,'high',[]),
 (49,85,2,'high',[]),(51,72,1,'low',[84,87]),
]
events=[]
for i,(k,m,n,c,a) in enumerate(specs):
    onset=phase+step*k
    next_onset=phase+step*specs[i+1][0] if i+1<len(specs) else 8.
    duration=min(next_onset-onset-.015,n*step-.02,8-onset)
    events.append({'onset_seconds':round(onset,5),'midi':m,'duration_seconds':round(max(.025,duration),5),
                   'confidence':c,'alternative_midis':a,
                   'onset_basis':'193 BPM half-quarter grid from independent shared rhythm evidence; spectral onset uncertainty about 10-25 ms'})
report={'status':'independent_candidate_not_final_score','source_excerpt_seconds':[45,53],
 'tempo_bpm':193,'phase_seconds':phase,'events':events,
 'evidence_files':['scores.npz','grid-candidates.json','alternative-02.npz','alternative-05.npz'],
 'important_findings':[
  'First new G-sharp lead is MIDI80 rather than68: even harmonics of415Hz increase at.345 while odd415Hz harmonics mostly do not.',
  'MIDI85-looking fundamental at2.36 has almost no third harmonic; reject it as a newlead, likely lowerF-sharp4 thirdharmonic.',
  'At2.52-2.8, MIDI70 vs89 is the specific fifth/octave compound ambiguity;89 strongerinA,70strongerin07/B.',
  'MIDI87 at3.14-3.4,85at6.25-6.5,84at6.87-7.1,85at7.34 and7.65 have cross-source support.',
  'First3notes are long ratherthan automatically reattacked every halfquarter. Weaklateparticles ofpriornotes are not automaticnewnotes.',
  'Laterhalves have insufficientinstrumentseparation for certainty; alternates retained forreview, no humanlistening performed.'
 ]}
(OUT/'recommended-events.json').write_text(json.dumps(report,indent=2),encoding='utf8')
print(len(events),'events written',OUT/'recommended-events.json')
