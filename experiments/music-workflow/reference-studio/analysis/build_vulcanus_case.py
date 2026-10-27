"""Build a transparent, editable first approximation from local signal estimates.

Every generated sound has provenance. The optional low-frequency guide is a
filtered mixture, explicitly not an isolated instrument or a transcription.
Only local files are used. Run analyze_vulcanus.py and transcribe_segment.py first.
"""
from pathlib import Path
import argparse,hashlib,json,uuid,zipfile
import numpy as np
from scipy import signal,ndimage,optimize
from scipy.io import wavfile
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import Rectangle
from analyze_vulcanus import CASE,SOURCE

SR=48000; BPM=212; BARS=8; BEAT=60/BPM; DURATION=BARS*4*BEAT; START=25.345
TONE_CENTER_SECONDS=26.55; TONE_ROOT_MIDI=70
N=round(DURATION*SR); NS=uuid.UUID('9a19885a-6ef3-4a39-aee0-51c6a3997c7d')
def gid(name):return str(uuid.uuid5(NS,name))
def write_json(p,obj):p.write_text(json.dumps(obj,ensure_ascii=False,indent=2),encoding='utf-8')
def sha(data):return hashlib.sha256(data).hexdigest().upper()
def settings(root=60,attack=.003,decay=.08,sustain=.8,release=.04):
    return dict(RootMidi=root,AttackSeconds=attack,DecaySeconds=decay,Sustain=sustain,ReleaseSeconds=release,
        LoopEnabled=False,LoopStart=0,LoopEnd=0,LoopCrossfadeSeconds=.015,GainDb=0)
def norm(a,peak=.7):return a.astype(np.float32)*(peak/max(float(np.max(np.abs(a))),1e-8))
def filters(x,lo=None,hi=None,order=4):
    if lo and hi:sos=signal.butter(order,[lo,hi],btype='bandpass',fs=SR,output='sos')
    else:sos=signal.butter(order,lo or hi,btype='highpass' if lo else 'lowpass',fs=SR,output='sos')
    return signal.sosfiltfilt(sos,x,axis=0).astype(np.float32)
def note(name,pitch,start,length,velocity=1):
    tick=round(start/BEAT*960);end=min(BARS*3840,round((start+length)/BEAT*960))
    return dict(Id=gid(name),Pitch=int(pitch),StartTick=max(0,tick),LengthTick=max(1,end-max(0,tick)),Velocity=round(float(np.clip(velocity,.1,1)),6))

def extract_notes(features,lo,hi,label,threshold=.048,min_duration=.065,dominance=.25):
    t=features['t']; m=features['midi'];h=features['activation'];pick=(m>=lo)&(m<=hi); pitches=m[pick]; h=h[pick]
    h=ndimage.median_filter(h,size=(1,5)); best=np.argmax(h,axis=0); strength=np.max(h,axis=0)
    # A confidence gate preserves unknown regions as rests instead of inventing notes.
    total=np.sum(h,axis=0)+1e-8; good=(strength>threshold)&(strength/total>dominance)
    selected=np.where(good,pitches[best],-1)
    # Bridge a <= 20 ms hole only when its two neighbours agree.
    for i in range(1,len(selected)-2):
        if selected[i]<0 and selected[i-1]>=0 and selected[i-1]==selected[i+1]:selected[i]=selected[i-1]
    out=[];evidence=[];i=0
    while i<len(t):
        j=i+1
        while j<len(t) and selected[j]==selected[i]:j+=1
        start=max(0,float(t[i]-.035)); end=min(DURATION,float(t[min(j,len(t)-1)]-.025))
        if selected[i]>=0 and end-start>=min_duration:
            conf=float(np.median((strength/total)[i:j]));amp=float(np.median(strength[i:j]))
            out.append(note(f'{label}-{len(out)}',int(selected[i]),start,end-start, min(1,.45+amp*2)))
            evidence.append(dict(pitch=int(selected[i]),startSeconds=round(start,5),endSeconds=round(end,5),
                harmonicDominance=round(conf,4),activation=round(amp,4),status='estimated, not manually verified'))
        i=j
    return out,evidence

def render_patch(audio,s,n,gain_db=0):
    # Equivalent note timing / ADSR, linear resampling for the reproducible Python
    # preview. The app uses its band-limited C# renderer when saving an audio mix.
    start=round(n['StartTick']/960*BEAT*SR);held=n['LengthTick']/960*BEAT;release=max(.005,s['ReleaseSeconds'])
    step=2**((n['Pitch']-s['RootMidi'])/12)
    count=min(round((held+release)*SR),int(len(audio)/step))
    age=np.arange(count)/SR;pos=np.arange(count)*step
    env=np.where(age<s['AttackSeconds'],age/max(s['AttackSeconds'],1e-9),
        np.where(age-s['AttackSeconds']<s['DecaySeconds'],1+(s['Sustain']-1)*np.maximum(0,age-s['AttackSeconds'])/max(s['DecaySeconds'],1e-9),s['Sustain']))
    offlevel=float(np.interp(held,age,env))
    env=np.where(age<held,env,offlevel*(.5+.5*np.cos(np.pi*np.clip((age-held)/release,0,1))))
    env*=np.minimum(1,age/.002)*np.clip((len(audio)-1-pos)/(.005*SR),0,1)
    out=np.array([np.interp(pos,np.arange(len(audio)),audio[:,c],left=0,right=0) for c in range(audio.shape[1])]).T
    if out.shape[1]==1:out=np.repeat(out,2,axis=1)
    return start,out*env[:,None]*10**((gain_db+s['GainDb'])/20)*n['Velocity']
def render_layer(audio,s,notes,gain):
    out=np.zeros((N,2),np.float64)
    for n in notes:
        start,voice=render_patch(audio,s,n,gain);count=min(len(voice),N-start)
        if start>=0 and count>0:out[start:start+count]+=voice[:count]
    return out.astype(np.float32)

def make_archive(channels,assets,dest,document_name='Vulcanus · 信号驱动近似重建',document_id=None):
    descriptions=[]; entries={}
    for channel,asset in zip(channels,assets):
        audio=asset['audio'].astype('<f4');raw=audio.tobytes();ah=sha(raw);st=asset['settings'];name=asset['name']
        # Anonymous property order and indented ASCII JSON match System.Text.Json.
        keydata=dict(name=name,rate=SR,channels=audio.shape[1],frames=len(audio),hash=ah,settings=st)
        # .NET 9 on Windows uses CRLF in WriteIndented by default. The current
        # Windows phrase format hashes those exact serialized bytes.
        key=sha(json.dumps(keydata,ensure_ascii=True,indent=2).replace('\n','\r\n').encode())
        channel['AssetKey']=key
        descriptions.append(dict(Key=key,Name=name,SampleRate=SR,Channels=audio.shape[1],Frames=len(audio),AudioSha256=ah,Settings=st))
        entries['assets/'+key+'.f32']=raw
        # Standalone sounds remain usable in the existing timbre/phrase modules.
        tm=dict(Format='RootSound.Timbre',Version=1,Name=name,SampleRate=SR,Channels=audio.shape[1],Frames=len(audio),AudioEntry='audio.f32',AudioSha256=ah,Settings=st)
        with zipfile.ZipFile(CASE/(name+'.rstimbre'),'w',zipfile.ZIP_DEFLATED) as z:
            z.writestr('manifest.json',json.dumps(tm,indent=2));z.writestr('audio.f32',raw)
    doc=dict(Format='RootSound.Phrase',Version=1,Id=document_id or gid('phrase'),Name=document_name,Tempo=BPM,Bars=BARS,
        Channels=channels,Assets=descriptions,SavedPath=None,SavedSha256=None)
    with zipfile.ZipFile(dest,'w',zipfile.ZIP_DEFLATED) as z:
        z.writestr('manifest.json',json.dumps(doc,ensure_ascii=True,indent=2))
        for k,v in entries.items():z.writestr(k,v)
    return doc

def main():
    parser=argparse.ArgumentParser();parser.add_argument('--include-low-guide',action='store_true');parser.add_argument('--stem-dir',type=Path);args=parser.parse_args()
    r,src=wavfile.read(SOURCE);assert r==SR and src.shape[1]==2
    reference=src[round(START*SR):round(START*SR)+N].copy();assert len(reference)==N
    # Preserve the exact source PCM. Playback owns click prevention; the stored
    # reference is an auditable, bit-exact source fragment.
    wavfile.write(CASE/'reference.wav',SR,reference.astype(np.float32))
    features=np.load(CASE/'transcription_features.npz')
    stems=None;separation=None;bass_features=None
    if args.stem_dir:
        from model_refinement import read_stems,harmonic_features
        stems,separation=read_stems(args.stem_dir,START,DURATION,SR)
        features=harmonic_features(stems['other'])
        bass_features=harmonic_features(stems['bass'],lo=24,hi=65)
        np.savez_compressed(CASE/'transcription_features-model.npz',**features)
        np.savez_compressed(CASE/'bass_features-model.npz',**bass_features)
    lead_notes,lead_ev=extract_notes(features,63,84,'melody',threshold=.043,min_duration=.065,dominance=.28)
    upper_notes,upper_ev=extract_notes(features,85,96,'upper',threshold=.13,min_duration=.09,dominance=.4)
    # Original transient times, not a prewritten dance pattern. Detect low-frequency
    # envelope peaks near each beat and compensate measured attack-to-body delay.
    mono=reference.mean(1);analysis_signal=stems['drums'].mean(1) if stems is not None else mono
    f,t,z=signal.stft(analysis_signal,SR,nperseg=1024,noverlap=904);m=abs(z)
    energy=lambda lo,hi:np.sqrt((m[(f>=lo)&(f<hi)]**2).sum(0))
    low=energy(35,180);high=energy(5000,15000)
    low_n=np.maximum(low-ndimage.minimum_filter1d(low,size=35),0)
    high_n=np.maximum(high-ndimage.minimum_filter1d(high,size=35),0)
    kick_notes=[];kick_ev=[]
    for k in range(32):
        pick=np.flatnonzero((t>=k*BEAT+.035)&(t<=k*BEAT+.14))
        j=pick[np.argmax(low_n[pick])];peak=float(low_n[j]);at=max(0,float(t[j]-.08))
        minimum=(float(low_n.max())*.23 if stems is not None else .045)
        if peak<minimum:continue
        kick_notes.append(note(f'kick-{k}',36,at,.18,.65+peak*2))
        kick_ev.append(dict(startSeconds=at,bodyPeakSeconds=float(t[j]),bodyPeak=peak,status='low-band transient; kick attribution provisional'))
    hp=signal.find_peaks(high_n,distance=22,prominence=.003)[0]
    noise_notes=[note(f'noise-{i}',60,max(0,float(t[j]-.012)),.085,np.clip(high_n[j]/.009,.25,1)) for i,j in enumerate(hp) if t[j]<DURATION-.02]
    rng=np.random.default_rng(2122026)
    # Low drum: the original low-body ridge is approximately 85 Hz; reconstruct
    # its pitch drop and distortion rather than claiming it is a tuned F2 bass.
    qt=np.arange(round(.31*SR))/SR;fq=85+95*np.exp(-qt/.011)+15*np.exp(-qt/.05)
    kick=np.sin(2*np.pi*np.cumsum(fq)/SR)*np.exp(-qt/ .073)
    kick+=.12*filters(rng.normal(size=(len(qt),1)).astype(np.float32),lo=3000)[:,0]*np.exp(-qt/.005)
    kick=np.tanh(kick*2.8);kick*=np.minimum(1,qt/.0006);kick=norm(kick,.8)[:,None]
    qt=np.arange(round(.19*SR))/SR
    no=filters(rng.normal(size=(len(qt),1)).astype(np.float32),lo=4700)[:,0]
    noise=norm(no*np.exp(-qt/.027)*np.minimum(1,qt/.0006),.65)[:,None]
    # Spectrum-informed additive timbres. Relative harmonic amplitudes are read
    # from a stable Bb4 in the actual mixture; phase/detuning are synthetic.
    nfft=65536;center=round((TONE_CENTER_SECONDS-START)*SR)
    tone_signal=stems['other'].mean(1) if stems is not None else mono
    win=tone_signal[center-nfft//2:center+nfft//2]
    spectrum=abs(np.fft.rfft(win*np.hanning(nfft)));freq=np.fft.rfftfreq(nfft,1/SR)
    root=TONE_ROOT_MIDI;fund=440*2**((root-69)/12);amps=[]
    for partial in range(1,17):
        zone=abs(freq-fund*partial)<max(3,fund*partial*.003)
        amps.append(float(spectrum[zone].max()) if np.any(zone) else 0)
    amps=np.array(amps);amps/=max(amps[0],1e-8);amps=np.clip(amps,.015,1.4)
    qt=np.arange(round(2.7*SR))/SR
    lead=np.zeros((len(qt),2));upper=np.zeros((len(qt),2))
    for c,detune in enumerate([-.0018,.0018]):
        for i,amp in enumerate(amps):
            h=i+1;angle=2*np.pi*fund*h*(1+detune)*qt+i*.49
            lead[:,c]+=amp*np.sin(angle)*np.exp(-qt*(.16+h*.08))
            upper[:,c]+=(1/h**1.4)*np.sin(angle+i*.3)*np.exp(-qt*(1+h*.1))
    lead=norm(np.tanh(lead*.5),.65);upper=norm(upper,.55)
    assets=[dict(name='Vulcanus-Low-Drum',audio=kick,settings=settings(36,attack=.001,decay=0,sustain=1,release=.025)),
        dict(name='Vulcanus-Noise-Rhythm',audio=noise,settings=settings(60,attack=.001,decay=0,sustain=1,release=.015)),
        dict(name='Vulcanus-Spectral-Lead',audio=lead,settings=settings(root,attack=.004,decay=.11,sustain=.7,release=.065)),
        dict(name='Vulcanus-Upper-Contour',audio=upper,settings=settings(root,attack=.004,decay=.08,sustain=.6,release=.06))]
    names=['低频鼓击 · 估计','高频节奏 · 估计','旋律轮廓 · 估计','上方声部 · 估计']
    notes=[kick_notes,noise_notes,lead_notes,upper_notes]
    roles=['支撑节奏的低频冲击','高频瞬态节奏','中高音旋律轮廓','高音区变化轮廓']
    origins=['合成重建：按原曲低频瞬态时间和约 85 Hz 鼓尾特征生成；不是原始鼓轨。',
        '合成重建：按原曲高频瞬态时间生成噪声击打；可能混含镲、军鼓或其他声响。',
        '合成重建：谐波模板估计音符，原曲局部谱包络生成音色；未人工听音核对。',
        '合成重建：高音区谐波模板估计；可能包含倍频误识别，保留为可修改草稿。']
    explanations=['先独听落点和尾音，再关闭它比较推动感。','和低频鼓击一起听，再删掉几处细碎击打比较速度感。','独听高低与长短，改一个音符后切回原曲同一位置比较。','先关闭，再打开比较明亮感；突兀高音可能是倍频误判。']
    bass_ev=[];bass_amps=[]
    if stems is not None:
        # The model drum fragment remains a mixture of percussion. Cropping and
        # filtering do not turn it into an original isolated instrument.
        if kick_ev:
            strongest=max(range(len(kick_ev)),key=lambda i:kick_ev[i]['bodyPeak'])
            onset=max(0,round(kick_ev[strongest]['startSeconds']*SR));length=round(.26*SR)
            grain=stems['drums'][onset:onset+length].copy()
            fade=np.minimum(1,np.minimum(np.arange(len(grain)),np.arange(len(grain))[::-1])/(.003*SR))
            grain=filters(grain,hi=9000)*fade[:,None];assets[0]['audio']=norm(grain,.8)
        if len(hp):
            j=int(hp[np.argmax(high_n[hp])]);onset=max(0,round((float(t[j])-.012)*SR));length=round(.12*SR)
            grain=filters(stems['drums'],lo=4200)[onset:onset+length].copy()
            fade=np.minimum(1,np.minimum(np.arange(len(grain)),np.arange(len(grain))[::-1])/(.002*SR))
            assets[1]['audio']=norm(grain*fade[:,None],.65)
        origins[:]=['模型估计采样：本地 Hybrid Demucs 的 drums 输出中截取短鼓声，含其他打击声和分离残留；不是原始鼓轨。',
            '模型估计采样：本地 Hybrid Demucs 鼓声输出的高通短片段，按高频瞬态触发；含残留。',
            '合成重建：本地 Hybrid Demucs 的 other 估计声部中提取音符与谱包络；音符尚未人工听音核对。',
            '合成重建：本地 Hybrid Demucs 的 other 高音估计，可能存在倍频误识别；不是原始分轨。']
        from model_refinement import additive_bass
        activation=bass_features['activation'];pitches=bass_features['midi'];sel=(pitches>=28)&(pitches<=53)
        threshold=max(.035,float(np.percentile(activation[sel].max(0),75))*.3)
        bass_notes,bass_ev=extract_notes(bass_features,28,53,'bass',threshold=threshold,min_duration=.095,dominance=.26)
        if bass_notes:
            root=int(np.median([n['Pitch'] for n in bass_notes]));bass,bass_amps=additive_bass(stems['bass'],root,SR)
            assets.append(dict(name='Vulcanus-Estimated-Bass',audio=bass,settings=settings(root,attack=.004,decay=.08,sustain=.8,release=.06)))
            names.append('低音轮廓 · 估计');notes.append(bass_notes);roles.append('低音音高与持续变化')
            origins.append('合成重建：本地 Hybrid Demucs 的 bass 估计声部中读取音符与谱包络；可能混入鼓尾，不是原始低音轨。')
            explanations.append('先独听持续音高，再与鼓一起听，比较它们是否互相遮住。')
    if args.include_low_guide:
        guide=filters(reference,hi=220,order=6)
        # A single explicitly-labelled mixture guide, never presented as a bass stem.
        assets.append(dict(name='Vulcanus-Low-Mixture-Guide',audio=guide,settings=settings(60,attack=0,decay=0,sustain=1,release=.005)))
        names.append('低频参考 · 原曲混合');notes.append([note('low-mixture',60,0,DURATION,1)])
        roles.append('辅助低频参考，含鼓与低音');origins.append('原曲频带截取：220 Hz 低通混合，仍含鼓和其他声音；不是分离的低音，也不是合成重建。')
        explanations.append('保留原曲低频关系以供比较。关闭后可听全合成草稿；该层不代表已理解低音音符。')
    raw=[render_layer(a['audio'],a['settings'],ns,0) for a,ns in zip(assets,notes)]
    # Match time/frequency power distributions in 45 ms windows. This fits levels,
    # not phases; original and reconstruction stay independent.
    bands=[(35,180),(180,500),(500,2000),(2000,6000),(6000,16000)]
    def band_features(x):
        fs,ts,zz=signal.stft(x.mean(1),SR,nperseg=2048,noverlap=1024)
        return np.concatenate([ndimage.gaussian_filter1d(np.sum(abs(zz[(fs>=lo)&(fs<hi)])**2,axis=0),1) for lo,hi in bands])
    target=band_features(reference);design=np.stack([band_features(x) for x in raw],axis=1)
    # Whiten frequency groups to keep the louder bass from erasing melodic layers.
    white=1/np.sqrt(np.maximum(target,np.max(target)*.001));fit,_=optimize.nnls(design*white[:,None],target*white)
    gain=np.sqrt(fit);gain=np.clip(gain,.005,2)
    if args.include_low_guide:gain[-1]=min(gain[-1],.72)
    model_level_adjustments=[]
    if stems is not None:
        # A full-mix power fit can hide the melody underneath a loud bass. Retain
        # model-estimated relative group levels so the editable contours remain
        # audible. The 85% other target is provisional: not all background notes
        # were transcribed, so their entire level must not be forced into a lead.
        groups=[('drums',[0,1],1),('other',[2,3],.85)]
        if len(assets)>4 and assets[4]['name']=='Vulcanus-Estimated-Bass':groups.append(('bass',[4],1))
        for source,indices,fraction in groups:
            combined=sum(raw[i]*gain[i] for i in indices)
            current=float(np.sqrt(np.mean(combined.astype(np.float64)**2)))
            target=float(np.sqrt(np.mean(stems[source].astype(np.float64)**2)))*fraction
            change=float(np.clip(target/max(current,1e-8),.3,4))
            for i in indices:gain[i]*=change
            model_level_adjustments.append(dict(source=source,targetRms=target,scale=change,provisionalOtherFraction=fraction))
    mix=sum(x*g for x,g in zip(raw,gain));target_rms=np.sqrt(np.mean(reference.astype(np.float64)**2));mix_rms=np.sqrt(np.mean(mix**2))
    correction=target_rms/max(mix_rms,1e-8);gain*=min(correction, .88/max(float(abs(mix).max()),1e-8))
    mixed=[x*g for x,g in zip(raw,gain)];mix=sum(mixed)
    channels=[];layers=[];sounds=[]
    for i,(asset,ns) in enumerate(zip(assets,notes)):
        channel_id=gid('channel-'+asset['name']);gdb=round(20*np.log10(max(float(gain[i]),1e-6)),6)
        channels.append(dict(Id=channel_id,Name=names[i],AssetKey='',Mode=0 if i<2 else 1,StepPitch=36 if i==0 else 60,GainDb=gdb,Muted=False,Notes=ns))
        layers.append(dict(ChannelId=channel_id,Role=roles[i],Explanation=explanations[i],Origin=origins[i]))
        sounds.append(dict(ChannelId=channel_id,BrightnessHz=16000,Sweep=0,EchoMix=0))
        wavfile.write(CASE/('layer-'+str(i+1)+'.wav'),SR,mixed[i].astype(np.float32))
    make_archive(channels,assets,CASE/'reconstruction.rsphrase')
    wavfile.write(CASE/'reconstruction.wav',SR,mix.astype(np.float32))
    all_synth=sum(mixed[:4] if stems is None else mixed[2:]);wavfile.write(CASE/'reconstruction-all-synthetic.wav',SR,all_synth.astype(np.float32))
    case=dict(Format='RootSound.ReferenceCase',Version=1,Info=dict(Title='Vulcanus · 参考重建',SourceFileName='Vulcanus.wav',
        SourceStartSeconds=START,SourceDurationSeconds=len(src)/SR,SourceSha256=sha(SOURCE.read_bytes()),
        Summary='约 25 秒起的 8 小节。对照原曲，独听各层，修改音符和声音变化。',
        AnalysisCaveat='本地节拍与谐波估计的近似草稿，尚未人工听音核对；不是原始分轨或精确扒谱。'+('使用本地 Hybrid Demucs 估计辅助辨认，鼓声含模型采样残留；其余声部为合成重建。' if stems is not None else '')+('低频参考层明确保留原曲滤波混合，关闭可听全合成版本。' if args.include_low_guide else ''),
        SourcePath=str(SOURCE)),Layers=layers,Sounds=sounds,ReferenceGainDb=0,MasterGainDb=0)
    write_json(CASE/'case.json',case)
    evidence=dict(sourceStartSeconds=START,sourceEndSeconds=START+DURATION,bpm=BPM,bars=BARS,
        tempoStatus='signal estimate; 141.333 BPM is a metrical alternative, 212 chosen provisionally',
        tempoAnchorEvidence={'firstStrongOnsetSeconds':6.103,'denseEntryOnsetSeconds':25.343,'estimatedBeatCountBetween':68,
            'tempoFromAnchorInterval':60*68/(25.343-6.103),'caveat':'Beat count and bar meter are inferred, not score ground truth.'},
        onsetTiming='Low drum uses measured low-envelope peaks minus 80 ms body delay; noise rhythm uses measured high-envelope peaks minus 12 ms.',
        melody=lead_ev,upper=upper_ev,bass=bass_ev,kick=kick_ev,highTransientSeconds=[round(float(t[j]),5) for j in hp],
        leadHarmonicEnvelope=amps.tolist(),layers=[dict(name=names[i],gainDb=channels[i]['GainDb'],noteCount=len(notes[i]),rms=float(np.sqrt(np.mean(mixed[i]**2)))) for i in range(len(notes))],
        referenceRms=float(target_rms),reconstructionRms=float(np.sqrt(np.mean(mix**2))),reconstructionPeak=float(abs(mix).max()),
        bandPowerOriginal=band_features(reference).reshape(len(bands),-1).mean(1).tolist(),
        bandPowerReconstruction=band_features(mix).reshape(len(bands),-1).mean(1).tolist(),
        separation=separation,bassHarmonicEnvelope=bass_amps,modelLevelAdjustments=model_level_adjustments,
        limitations=[('Local Hybrid Demucs estimates informed this draft; no manual auditory verification.' if stems is not None else 'No learned source separation, no manual auditory verification.'),'Pitch templates can mistake partials for separate notes.','Drum identities inferred from transient band; no original isolated stems.']+
            (['Low guide is a filtered original mixture, not a bass transcription.'] if args.include_low_guide else []))
    write_json(CASE/'evidence.json',evidence)
    fig,axs=plt.subplots(4,1,figsize=(18,12),sharex=True,gridspec_kw={'height_ratios':[1,1,2,1]})
    sec=np.arange(N)/SR;axs[0].plot(sec,reference.mean(1),lw=.2);axs[0].set(ylabel='original',title='Vulcanus: original signal and editable first approximation (not original stems)')
    axs[1].plot(sec,mix.mean(1),lw=.2,color='darkorange');axs[1].set(ylabel='reconstruction')
    for i,color in [(2,'royalblue'),(3,'purple')]:
        for n in notes[i]:
            st=n['StartTick']/960*BEAT;le=n['LengthTick']/960*BEAT
            axs[2].add_patch(Rectangle((st,n['Pitch']-.4),le,.8,color=color,alpha=.65))
    axs[2].set(ylim=(60,97),ylabel='estimated MIDI notes')
    axs[3].vlines([n['StartTick']/960*BEAT for n in kick_notes],0,1,color='firebrick',label='low transient')
    axs[3].vlines([n['StartTick']/960*BEAT for n in noise_notes],1.2,2,color='teal',label='high transient');axs[3].legend(loc='upper right')
    for ax in axs:
        ax.set_xlim(0,DURATION)
        for k in range(33):ax.axvline(k*BEAT,alpha=.25 if k%4 else .6,color='gray')
    axs[-1].set(xlabel='seconds from source 25.345');fig.tight_layout();fig.savefig(CASE/'notes-and-timing.png',dpi=140)
    print(json.dumps(dict(duration=DURATION,frames=N,notes=[len(x) for x in notes],gain=gain.tolist(),rms=evidence['reconstructionRms'],referenceRms=target_rms),indent=2))

if __name__=='__main__':main()
