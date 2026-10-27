from pathlib import Path
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
OUT=Path(__file__).resolve().parents[3]/'cases/phone-recording-20261023-233819/melody/independent'
d=np.load(OUT/'scores.npz'); H=d['harmonics']; t=d['times']; m=d['midis']
for k,(a,b) in enumerate([(0,2),(2,4),(4,6),(6,8)]):
    fig,ax=plt.subplots(4,1,figsize=(18,10),sharex=True)
    for ai,j in zip(ax,[1,2,4,8]):
        ai.pcolormesh(t,m,20*np.log10(H[:,j]+1e-9),vmin=-90,vmax=-45,cmap='magma',shading='nearest')
        ai.set_title(f'Harmonic {j+1}')
        ai.set_xlim(a,b);ai.set_ylim(65,88);ai.set_yticks(m);ai.set_xticks(np.arange(a,b+.001,.05));ai.grid(alpha=.3)
    fig.tight_layout();fig.savefig(OUT/f'partials-{k}.png',dpi=140);plt.close(fig)
print('ok')
