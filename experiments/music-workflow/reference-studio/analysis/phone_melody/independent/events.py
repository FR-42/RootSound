from pathlib import Path
import json
import numpy as np
from scipy import signal, ndimage

OUT=Path(__file__).resolve().parents[3]/'cases/phone-recording-20261023-233819/melody/independent'
d=np.load(OUT/'scores.npz');H=d['harmonics'];t=d['times'];m=d['midis']
# Combine the target's third-dominant odd harmonic structure. A strong single
# fundamental at MIDI84/85 alone is often a lower voice's third harmonic.
w=np.array([.35,.25,1,.25,.28,.2,.15,.12,.18,.1,.08,.06])
indices=[0,2,4,6,8]
ratios=H[:,indices]/w[indices][None,:,None]
shape=np.exp(np.mean(np.log(np.maximum(ratios,1e-8)),axis=1))
novel=np.maximum(shape-ndimage.minimum_filter1d(shape,55,axis=1),0)
pitch_score=shape*(H[:,2]/(H[:,0]+H[:,1]+H[:,2]+1e-7))**1.1
rows=[]
for j,q in enumerate(np.arange(.034,8,.1553)):
    pre=H[:,:,(t>q-.10)&(t<q-.025)].mean(2)
    post=H[:,:,(t>q+.025)&(t<q+.10)].mean(2)
    rise=np.maximum(post-pre,0)
    rise_score=(rise[:,2]*.9+rise[:,4]*.7+rise[:,6]*.6+rise[:,8]*.5+rise[:,0]*.18)
    # penalize fundamental-only notes; source target has a strong third.
    rise_score*=np.clip(post[:,2]/(post[:,0]+1e-7),0,1.4)
    ix=(t>q+.035)&(t<q+.115)
    abs_score=pitch_score[:,ix].mean(1)
    k=np.argsort(np.where(m>=70,rise_score,0))[-7:][::-1]
    k2=np.argsort(np.where(m>=70,abs_score,0))[-5:][::-1]
    rows.append({'grid_step':j,'time':round(q,4),'rise':[[int(m[i]),round(float(rise_score[i])*1e4,4)]for i in k],
                 'held_shape':[[int(m[i]),round(float(abs_score[i])*1e4,4)]for i in k2]})
(OUT/'grid-candidates.json').write_text(json.dumps(rows,indent=2),encoding='utf8')
for r in rows:
    print(f'{r["time"]:.4f}',r['rise'][:4],r['held_shape'][:3])
