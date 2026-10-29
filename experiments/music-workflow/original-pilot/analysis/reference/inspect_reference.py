"""Inspect only the explicitly selected opening, without sound-device playback."""
from pathlib import Path
import hashlib, json, subprocess
import numpy as np
from scipy import signal, ndimage
from scipy.io import wavfile
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

OUT = Path(__file__).resolve().parent
SOURCE = Path(r'D:\Sound\temp\music\vulcanus.mp3')

def main():
    OUT.mkdir(parents=True, exist_ok=True)
    metadata = json.loads(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration:format_tags:stream=codec_name,sample_rate,channels', '-of', 'json', str(SOURCE)], text=True))
    digest_before = hashlib.sha256(SOURCE.read_bytes()).hexdigest()
    wav = OUT/'reference-private-0-20.wav'
    subprocess.run(['ffmpeg','-v','error','-y','-i',str(SOURCE),'-t','20','-c:a','pcm_f32le',str(wav)], check=True)
    sr, audio = wavfile.read(wav)
    mono=audio.mean(axis=1).astype(np.float64)
    f,t,z=signal.stft(mono,sr,nperseg=8192,noverlap=8192-441,boundary=None)
    mag=np.abs(z)
    flux=np.maximum(np.diff(np.log1p(100*mag),axis=1,prepend=np.zeros((len(f),1))),0).mean(axis=0)
    flux=np.maximum(flux-ndimage.median_filter(flux, size=41),0)
    bands=[(25,150),(150,500),(500,2500),(2500,12000)]
    bandpower=np.array([(mag[(f>=a)&(f<b)]**2).sum(axis=0) for a,b in bands])
    # Approximate harmonic emphasis to reduce broadband transients; this is not a transcription.
    harm=ndimage.median_filter(mag,size=(1,31))
    chroma=np.zeros((12,len(t)))
    for midi in range(36,97):
        frequency=440*2**((midi-69)/12)
        # Look for fundamental plus several harmonics, down-weighting higher ones.
        score=np.zeros(len(t))
        for harmonic,weight in [(1,1),(2,.5),(3,.25)]:
            k=int(np.argmin(abs(f-frequency*harmonic)))
            score+=weight*harm[max(0,k-1):k+2].max(axis=0)
        chroma[midi%12]+=score
    pitch_names=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B']
    summary=[]
    for second in range(20):
        a=audio[second*sr:(second+1)*sr]
        idx=(t>=second)&(t<second+1)
        c=chroma[:,idx].mean(axis=1)
        ranked=np.argsort(c)[::-1]
        summary.append({'start':second,'end':second+1,'rms':float(np.sqrt(np.mean(a.astype(np.float64)**2))), 'bandFractions':(bandpower[:,idx].mean(axis=1)/max(bandpower[:,idx].sum(axis=0).mean(),1e-12)).tolist(), 'harmonicPitchClassCandidates':[pitch_names[i] for i in ranked[:5]] if c.sum()>1e-8 else [],'pitchClassWeights':c.tolist()})
    peaks,_=signal.find_peaks(flux,distance=8,prominence=np.percentile(flux,75)*.35)
    strong=sorted(peaks,key=lambda i:flux[i],reverse=True)[:50]
    # Correlate periodic novelty only, not a claim that this fixes musical beat phase.
    ac=signal.fftconvolve(flux,flux[::-1],mode='full')[len(flux)-1:]
    tempos=[]
    for lag in signal.find_peaks(ac[20:110])[0]+20:
        tempos.append({'bpm':60/(lag*.01),'correlation':float(ac[lag])})
    # The strongest half-time autocorrelation has a coarse 10ms resolution.
    # Parabolic refinement illustrates compatibility, without defining beat phase.
    lag=int(np.argmax(ac[52:62]))+52
    correction=.5*(ac[lag-1]-ac[lag+1])/max(1e-12,ac[lag-1]-2*ac[lag]+ac[lag+1]) if ac[lag-1]-2*ac[lag]+ac[lag+1]>0 else .5*(ac[lag-1]-ac[lag+1])/(ac[lag-1]-2*ac[lag]+ac[lag+1])
    half_lag=lag+float(np.clip(correction,-.5,.5))
    grid_evidence={'metadataBpm':212,'secondsPerBeatAtMetadataBpm':60/212,'eightBeatsSeconds':8*60/212,'firstLargeNoveltySeconds':float(t[np.argmax(flux[(t>=2)&(t<2.5)])+np.where((t>=2)&(t<2.5))[0][0]]),'doubleHalfTimeAutocorrelationBpm':120/(half_lag*.01),'interpretation':'The first large attack is very close to 8 beats at the tagged tempo. A half-time novelty correlation is compatible with this tag. This does not independently verify meter or beat phase.'}
    report={'source':str(SOURCE),'sha256Before':digest_before,'sha256After':hashlib.sha256(SOURCE.read_bytes()).hexdigest(),'metadata':metadata,'windowSeconds':[0,20],'sampleRate':sr,'frames':len(audio),'peak':float(abs(audio).max()),'rms':float(np.sqrt(np.mean(audio.astype(np.float64)**2))),'perSecond':summary,'strongNoveltyTimesSeconds':sorted(float(t[i]) for i in strong),'noveltyTempoCandidates':sorted(tempos,key=lambda x:x['correlation'],reverse=True)[:8],'gridEvidence':grid_evidence, 'limitations':['No audio-device playback or listening performed.','Band energy and harmonic pitch classes cannot determine instrument identity, lead melody, emotional quality or definitive key.','MP3 TBPM=212 is source metadata, not a verified beat/downbeat annotation.','Original composition must not copy this estimated pitch-class sequence or reference audio.']}
    (OUT/'reference-analysis.json').write_text(json.dumps(report,indent=2,ensure_ascii=False),encoding='utf-8')
    fig,axes=plt.subplots(4,1,figsize=(15,11),sharex=True)
    samples=np.arange(len(mono))/sr
    axes[0].plot(samples[::100],mono[::100],lw=.3);axes[0].set(ylabel='Amplitude',title='Selected opening: signal inspection only, not source transcription')
    axes[1].pcolormesh(t,f,20*np.log10(np.maximum(mag,1e-7)),vmin=-70,vmax=-20,shading='auto',cmap='magma',rasterized=True);axes[1].set(ylim=(40,10000),yscale='log',ylabel='Hz')
    for i,(lo,hi) in enumerate(bands):axes[2].plot(t,10*np.log10(bandpower[i]+1e-10),label=f'{lo}-{hi} Hz')
    axes[2].legend(ncol=4);axes[2].set(ylabel='Band dB')
    axes[3].plot(t,flux);axes[3].set(xlabel='Seconds',ylabel='Novelty')
    axes[3].set_xlim(0,20)
    fig.tight_layout();fig.savefig(OUT/'reference-opening.png',dpi=130);plt.close(fig)
    print(json.dumps({'gridEvidence':grid_evidence,'perSecondRmsAndLowBand':[{k:r[k] for k in ['start','rms','bandFractions']} for r in summary],'shaUnchanged':report['sha256Before']==report['sha256After']},ensure_ascii=False,indent=2))

if __name__=='__main__':main()
