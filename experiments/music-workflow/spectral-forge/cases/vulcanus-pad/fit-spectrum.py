"""Constrain a synthetic pad by broad sustained SIDE-mixture evidence only.

This does not isolate a pad or certify perceptual similarity. The source song
is never mixed into the generated audio. All final controls stay in rssynth.
"""
from pathlib import Path
import json
import numpy as np
from scipy import signal, ndimage
from scipy.io import wavfile

HERE=Path(__file__).resolve().parent
reference=json.loads((HERE/'analysis-agent/pad-evidence.json').read_text(encoding='utf-8'))
patch=json.loads((HERE/'calibration/Vulcanus-铺底音色.rssynth').read_text(encoding='utf-8'))
profiles=[]
for name in ['Vulcanus-铺底-和弦试听.wav','calibration-Bb7.wav']:
    sr,a=wavfile.read(HERE/'calibration'/name)
    a=a.astype(np.float64)/2147483648
    side=(a[:,0]-a[:,1])/2
    f,t,z=signal.stft(side,sr,nperseg=8192,noverlap=8192-480,boundary=None)
    stable=ndimage.median_filter(np.abs(z),size=(1,61))
    power=np.mean(stable[:,(t>=1.2)&(t<3.8)]**2,axis=1)
    profiles.append([10*np.log10(max(1e-24,power[(f>=row['hz']/2**(1/6))&(f<row['hz']*2**(1/6))].mean()))
                     for row in reference['broadMixtureProfile']])
hz=np.array([r['hz'] for r in reference['broadMixtureProfile']])
target=np.array([r['sideDensityDb'] for r in reference['broadMixtureProfile']])
generated=10*np.log10(np.mean(10**(np.array(profiles)/10),axis=0))
core=(hz>=320)&(hz<=1800)
offset=float(np.median((target-generated)[core]))
differences=ndimage.gaussian_filter1d(target-generated-offset,2)
points=[]
for point in patch['spectrum']['points']:
    correction=0.
    if 280<=point['x']<=12500:
        correction=float(np.interp(np.log(point['x']),np.log(hz),differences))*.55
        # This is a mixture, so do not copy bright lead/percussion energy into
        # the pad by aggressively boosting its high frequencies.
        correction=float(np.clip(correction,-5,2 if point['x']>=3000 else 4))
    points.append({**point,'y':round(point['y']+correction,3)})
correction=np.interp(np.log(hz),np.log([p['x'] for p in points]),[a['y']-b['y'] for a,b in zip(points,patch['spectrum']['points'])])
mask=(hz>=320)&(hz<=9000)
before=target-generated-offset
after=before-correction
after-=np.median(after[core])
report={'spectrumPoints':points,'adjustments':{'chorusMix':.36,'masterLevel':.94},
        'method':'Bounded broad SIDE-mixture profile correction; two stationary test chord voicings, 610ms median. Not isolated-timbre matching.',
        'relativeProfileRmsDbBefore':float(np.sqrt(np.mean(before[mask]**2))),
        'predictedRelativeProfileRmsDbAfter':float(np.sqrt(np.mean(after[mask]**2))),
        'rows':[{'hz':float(h),'referenceSideMixtureDb':float(r),'syntheticDb':float(s),'correctionDb':float(c)}
                for h,r,s,c in zip(hz,target,generated,correction)]}
(HERE/'fit-adjustments.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({k:v for k,v in report.items() if k!='rows'},ensure_ascii=False,indent=2))
