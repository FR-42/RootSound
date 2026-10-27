"""Audit specific fifth/octave aliases and excerpt-ending note using context."""
from pathlib import Path
import json
import numpy as np
from scipy import signal
from scipy.io import wavfile
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

ROOT=Path(__file__).resolve().parents[3];CASE=ROOT/'cases/phone-recording-20261023-233819';OUT=CASE/'melody/independent'
def read(path):
    fs,a=wavfile.read(path)
    x=a.astype(float)/(2**31 if a.dtype==np.int32 else 1)
    return fs,x.mean(1)
files={'07':CASE/'试听/07-普通分轨基线.wav','A':next((CASE/'试听').glob('02-*.wav')),'B':next((CASE/'试听').glob('05-*.wav'))}
midis=np.array([58,65,70,73,77,80,82,84,85,87,89,92]);hs=np.arange(1,16)
rows=[]
for label,path in files.items():
    fs,x=read(path);N=8192; f,t,z=signal.stft(x,fs,nperseg=N,noverlap=N-120,boundary='zeros');mag=abs(z)
    H=np.zeros((len(midis),len(hs),len(t)))
    for i,m in enumerate(midis):
        f0=440*2**((m-69)/12)
        for j,h in enumerate(hs):
            ids=np.where(abs(f-f0*h)<max(fs/N*1.25,f0*h*.003))[0]
            if len(ids): H[i,j]=mag[ids].max(0)
    for q in [1.123,2.211,2.522,2.833,3.455,4.077,4.854]:
        for mi in ([70,77,89] if q not in [2.833,4.077] else [73,80,92]):
            i=np.where(midis==mi)[0][0]
            pre=H[i,:,(t>q-.12)&(t<q-.035)].mean(0)
            post=H[i,:,(t>q+.045)&(t<q+.19)].mean(0)
            rows.append({'source':label,'onset':q,'midi':mi,
                         'pre_h1_to_h15':np.round(pre,8).tolist(),'post_h1_to_h15':np.round(post,8).tolist(),
                         'rise_h1_to_h15':np.round(post-pre,8).tolist()})

# Larger context exists solely to determine the pitch already beginning near
# 52.96 s. It is not extra material added to the delivered eight-second phrase.
fs,x=read(CASE/'hdemucs/context-44-54/other-estimate.wav')
N=8192;f,t,z=signal.stft(x,fs,nperseg=N,noverlap=N-120,boundary='zeros');mag=abs(z);t=t-1
midis2=np.arange(60,97);H=np.zeros((len(midis2),9,len(t)))
for i,m in enumerate(midis2):
    f0=440*2**((m-69)/12)
    for j in range(9):
        center=f0*(j+1);ids=np.where(abs(f-center)<max(fs/N*1.25,center*.003))[0]
        if len(ids):H[i,j]=mag[ids].max(0)
for q in [7.95,8.02,8.07,8.12,8.18,8.25]:
    ti=np.argmin(abs(t-q));vals=H[:,2,ti]
    ix=np.argsort(vals)[-10:][::-1]
    print('context',q,[(int(midis2[i]),np.round(H[i,[0,1,2,4,6,8],ti]*1e4,2).tolist())for i in ix])
fig,ax=plt.subplots(3,1,figsize=(16,10),sharex=True)
mask=(f>350)&(f<11000)
ax[0].pcolormesh(t,f[mask],20*np.log10(mag[mask]+1e-9),vmin=-85,vmax=-35,shading='auto',cmap='magma');ax[0].set_yscale('log')
for ai,j in zip(ax[1:],[0,2]):
    ai.pcolormesh(t,midis2,20*np.log10(H[:,j]+1e-9),vmin=-85,vmax=-35,shading='nearest',cmap='magma');ai.set_ylim(60,96);ai.set_yticks(midis2);ai.set_title(f'h{j+1}')
for ai in ax:ai.set_xlim(7.7,8.4);ai.set_xticks(np.arange(7.7,8.401,.025));ai.grid(alpha=.3)
fig.tight_layout();fig.savefig(OUT/'ending-context.png',dpi=160);plt.close(fig)
report={'source_windows':'pre onset-.12..-.035, post onset+.045..+.19','rows':rows}
(OUT/'focused-alias-measurements.json').write_text(json.dumps(report,indent=2),encoding='utf8')
conclusions={
 'status':'focused_independent_review_candidate_changes_only',
 'recommendations':[
  {'onset_seconds':1.123,'midi':70,'action':'keep','confidence':'medium','reason':'F6 third harmonic remains tiny in07/A/B; do notraisejustbecause1398Hzfundamentalaliasisbright.'},
  {'onset_seconds':2.211,'midi':70,'action':'keep','confidence':'medium','reason':'F6 third harmonic remains tiny in07/A/B.'},
  {'onset_seconds':2.522,'midi':89,'action':'keep_or_choose_upper','confidence':'high_relative_to70','reason':'4190Hz newstrongcomponent appears coherently in07/A/B alongside1398Hz;sourcepatch thirdharmonicpattern supportsF6.'},
  {'onset_seconds':3.455,'midi':89,'action':'change_from70','confidence':'high_relative_to70','reason':'StrongnewF6h3 across07/A/B; lower70oddharmonics5/7weakandF5oddthirdweak.'},
  {'onset_seconds':4.854,'midi':89,'action':'keep_or_choose_upper','confidence':'high_relative_to70','reason':'Samecross-sourceF6fundamental+thirdpatternas2.522/3.455.'},
  {'onset_seconds':2.833,'midi':92,'action':'change_from73','confidence':'medium','reason':'554Hz(M73fundamental)doesnotattack,1661and4983Hzdoattackstronglyinaccepted07.M80fundandthirddecline,disfavoringnewAb5. A/Battenuateuppercomponent;original07islisteningselectedsource.'},
  {'onset_seconds':4.077,'midi':73,'action':'keep','confidence':'medium','alternative_midis':[92],'reason':'554Hznewattackiscross-sourceclear;source07alsohasupperAb6-likecomponentbutnotcompellingreasontoreplacemainlowerattack.'},
  {'onset_seconds':7.884,'midi':87,'action':'insert_sixteenth_note','confidence':'medium_high','reason':'Context44-54independentstemshowsnew1244and3730HzrisingtogetherwhilepreviousDb6falls;notgrid7.96onsetitself.'},
  {'onset_seconds':7.962,'midi':84,'action':'prefer_over72','confidence':'medium_low','alternative_midis':[72],'reason':'Contextshows1046and3140Hzincreaseswhile349HzF4fundfalls.C5fund523HzalsorisesbutC5third1569falls;likelyC6leadpluslowerC5accompaniment,butincompleteoverlappreventsproof.'}
 ],
 'limitations':['Theseareindependentpitchhypotheses,notrecoveredoriginalMIDI.','Contextusedonlytoidentifyalready-startingboundarynote;donotextendrequested8sexcerptunasked.','Noaudioauditionorsounddeviceused.']}
(OUT/'focused-alias-conclusions.json').write_text(json.dumps(conclusions,indent=2),encoding='utf8')
np.savez(OUT/'ending-context.npz',midis=midis2,times=t,harmonics=H)
for r in rows:
    print(r['source'],r['onset'],r['midi'],'post',np.round(np.array(r['post_h1_to_h15'])[[0,1,2,4,6,8]]*1e4,2))
