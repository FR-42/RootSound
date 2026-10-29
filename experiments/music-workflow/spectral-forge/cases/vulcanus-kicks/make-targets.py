"""Conservative grouped attack evidence; mixture features are not isolated kick audio."""
from pathlib import Path
import numpy as np
from scipy import signal,ndimage
from scipy.io import wavfile
import json
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
ROOT=Path(__file__).resolve().parent/'analysis'
sr,a=wavfile.read(ROOT/'reference-first20.wav');mid=a.mean(axis=1).astype(float)
# The user's dense/sparse cue guides these groups. Some dense-section heavy hits
# also resemble the sparse group; region membership does not prove instrument identity.
groups={'A':[3.080,3.424,3.674,5.700,5.850,7.690,8.208,9.246],
        'B':[3.998,4.566,6.834,10.786,13.626,15.304,17.048,18.154,19.008]}
target={};fig,axes=plt.subplots(2,2,figsize=(14,8))
for row,(label,onsets) in enumerate(groups.items()):
    magnitudes=[]
    for onset in onsets:
        y=mid[round((onset-.14)*sr):round((onset+.36)*sr)]
        f,t,z=signal.stft(y,sr,nperseg=1536,noverlap=1536-96,nfft=8192,boundary='zeros')
        t-=.14;power=abs(z)**2
        background=np.median(power[:,(t>=-.12)&(t<=-.045)],axis=1)
        residual=np.maximum(power-background[:,None],0)
        normal=np.sqrt(np.max(np.sum(residual[(f>=65)&(f<250)][:,(t>=0)&(t<=.1)],axis=0)))
        magnitudes.append(residual/max(normal**2,1e-12))
    template=np.median(magnitudes,axis=0)
    ax=axes[row,0];ax.pcolormesh(t,f,10*np.log10(template+1e-10),shading='auto',cmap='magma',vmin=-45,vmax=-8,rasterized=True)
    ax.set(ylim=(45,1500),yscale='log',xlim=(-.03,.24),title=f'{label}: grouped positive mixture energy',xlabel='Seconds after proposed onset',ylabel='Hz')
    windows=[(.004,.020),(.020,.04),(.04,.07),(.07,.11),(.11,.16)]
    ridge=[]
    for lo,hi in windows:
        profile=template[:,(t>=lo)&(t<hi)].mean(axis=1)
        mask=(f>=65)&(f<=350)
        peak=f[mask][np.argmax(profile[mask])]
        ridge.append({'windowSeconds':[lo,hi],'mixtureRidgeHz':round(float(peak),2)})
    bands=[(65,150),(150,350),(350,1200),(1200,5000),(5000,14000)]
    curves=[]
    for lo,hi in bands:
        env=np.sqrt(template[(f>=lo)&(f<hi)].sum(axis=0));curves.append(env)
        axes[row,1].plot(t,env,label=f'{lo}-{hi}Hz')
    axes[row,1].set(xlim=(-.03,.24),title=f'{label}: attack/body evidence',xlabel='Seconds after proposed onset')
    axes[row,1].legend()
    target[label]={'proposedOnsetsSeconds':onsets,'ridge':ridge,
        'constraints':'Use only coarse attack/body trends. Background subtraction and windowing do not isolate the instrument.',
        'times':t.tolist(),'bandRms':np.array(curves).tolist(),'bandsHz':bands}
fig.tight_layout();fig.savefig(ROOT/'grouped-targets.png',dpi=140);plt.close(fig)
(ROOT/'grouped-targets.json').write_text(json.dumps(target,ensure_ascii=False,indent=2),encoding='utf8')
print(json.dumps({k:{'onsets':v['proposedOnsetsSeconds'],'ridge':v['ridge']}for k,v in target.items()}))
