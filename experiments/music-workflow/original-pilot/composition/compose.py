"""Original musical sketch. Reference audio is never read by this builder.

The only external sound source is a separately licensed, documented VocalSet
female vowel. Every pitch, onset, harmony and accompaniment here is authored.
"""
from pathlib import Path
import argparse
import hashlib
import json
import math
import struct
import numpy as np
from scipy import signal, ndimage
from scipy.io import wavfile

HERE = Path(__file__).resolve().parent
SOUNDS = HERE / 'sounds'
SR = 44100
BPM = 212
BEAT = 60 / BPM
RNG = np.random.default_rng(20261027)


def hz(midi):
    return 440 * 2 ** ((midi - 69) / 12)


def clean(x):
    x = np.asarray(x, dtype=np.float64)
    if x.ndim == 1:
        x = np.column_stack([x, x])
    x = signal.sosfilt(signal.butter(2, 25, 'highpass', fs=SR, output='sos'), x, axis=0)
    n = min(300, len(x) // 4)
    x[:n] *= np.linspace(0, 1, n)[:, None]
    x[-n:] *= np.linspace(1, 0, n)[:, None]
    return x


def room(x, wet=.19, seconds=1.55, pre=.023):
    """A deterministic diffuse stereo tail, baked into each playable note."""
    x = clean(x)
    n = int(SR * seconds)
    r = np.random.default_rng(20261027)
    ir = r.normal(size=(n, 2))
    ir = signal.sosfilt(signal.butter(2, [260, 6200], 'bandpass', fs=SR, output='sos'), ir, axis=0)
    t = np.arange(n) / SR
    ir *= (np.exp(-6.91 * t / seconds) * np.minimum(t / .025, 1))[:, None]
    ir /= max(np.sqrt(np.sum(ir[:, 0] ** 2)), np.sqrt(np.sum(ir[:, 1] ** 2)))
    for channel in range(2):
        for delay, gain in [(.031, .34), (.047, .25), (.073, .18), (.113, .13)]:
            ir[int((delay + channel * .007) * SR), channel] += gain
    pre_n = int(pre * SR)
    result = np.zeros((len(x) + n + pre_n - 1, 2))
    result[:len(x)] += x
    for c in range(2):
        mixed = .78 * x[:, c] + .22 * x[:, 1-c]
        result[pre_n:, c] += signal.fftconvolve(mixed, ir[:, c]) * wet
    return clean(result)


instruments = []
sound_by_id = {}


def instrument(key, name, x, root=60, release=.3, level=1):
    x = clean(x)
    peak = np.max(np.abs(x))
    if peak > 0:
        x = x / peak * .92
    path = SOUNDS / (key + '.wav')
    wavfile.write(path, SR, np.round(np.clip(x, -1, 1) * 32767).astype(np.int16))
    if key.startswith('voice_'):
        # Keep attribution inside the WAV bytes that RootSound embeds, so a
        # single project file retains it without a new project schema.
        tags={
          'IART':'VocalSet: Julia Wilkins; Prem Seetharaman; Alison Wahl; Bryan Pardo',
          'ICOP':'CC BY 4.0 - https://creativecommons.org/licenses/by/4.0/',
          'ICMT':'Source: https://doi.org/10.5281/zenodo.1442513 ; female1 long straight a. Modified: cropped C4/C5, tuned by pitch-synchronous grains, short pitch transitions, stereo reverb. No endorsement implied.'}
        info=b'INFO'
        for tag,value in tags.items():
            data=value.encode('utf-8')+b'\x00'
            info+=tag.encode('ascii')+struct.pack('<I',len(data))+data
            if len(data)%2:info+=b'\x00'
        payload=path.read_bytes()+b'LIST'+struct.pack('<I',len(info))+info
        payload=payload[:4]+struct.pack('<I',len(payload)-8)+payload[8:]
        path.write_bytes(payload)
    entry = dict(id=key, name=name, wavPath='sounds/' + path.name, rootMidi=root,
                 level=level, attackSeconds=.001, releaseSeconds=release)
    instruments.append(entry)
    sound_by_id[key] = (x, entry)
    return key


def glass_key():
    root = 72
    t = np.arange(int(SR * 1.3)) / SR
    f = hz(root)
    stereo = []
    for cents in [-1.4, 1.4]:
        phase = 2 * np.pi * f * 2 ** (cents / 1200) * t
        modulation = .43 * np.exp(-t / .14) * np.sin(phase * 2)
        y = (np.sin(phase + modulation) * np.exp(-t / .43)
             + .23 * np.sin(phase * 2.002) * np.exp(-t / .2)
             + .07 * np.sin(phase * 3.997) * np.exp(-t / .11))
        y *= (1 - np.exp(-t / .005))
        stereo.append(y)
    return instrument('glass', '晶莹键音', room(np.array(stereo).T, .23, 1.65), root, .75)


def velvet_pad():
    root = 60
    t = np.arange(int(SR * 3.2)) / SR
    out = np.zeros((len(t), 2))
    for c in range(2):
        for detune in [-8, -3, 2, 7]:
            f = hz(root) * 2 ** ((detune + c*.7) / 1200)
            phase = 2 * np.pi * f * t
            for partial in range(1, 13):
                out[:, c] += np.sin(partial * phase + partial*.4) / partial ** 1.65
    out = signal.sosfilt(signal.butter(3, 1800, 'lowpass', fs=SR, output='sos'), out, axis=0)
    env = np.minimum(t / .19, 1) * np.minimum((3.2-t)/.5, 1)
    out *= env[:, None]
    return instrument('pad', '柔光铺底', room(out, .28, 1.9), root, .75)


def bass():
    root = 29
    t = np.arange(int(SR * .7)) / SR
    phase = 2 * np.pi * hz(root) * t
    x = .85 * np.sin(phase) + .20 * np.sin(2 * phase) + .10 * np.sin(3 * phase)
    x = np.tanh(x * 1.3) / 1.3
    x *= (1 - np.exp(-t/.006)) * np.exp(-t/.31)
    return instrument('bass', '圆润低音', x, root, .055)


def kick():
    t = np.arange(int(SR * .46)) / SR
    f = 47 + 105 * np.exp(-t/.017) + 18 * np.exp(-t/.10)
    phase = 2*np.pi*np.cumsum(f)/SR
    body = np.sin(phase)*np.exp(-t/.115)
    click = RNG.normal(size=len(t)) * np.exp(-t/.002) * .12
    x = np.tanh((body + click) * 1.3) / 1.3
    return instrument('kick', '深鼓', x, 36, .03)


def snare():
    t = np.arange(int(SR*.26))/SR
    noise = signal.sosfilt(signal.butter(2,[1500,10500], 'bandpass', fs=SR, output='sos'), RNG.normal(size=len(t)))
    x = noise*np.exp(-t/.044)*.5 + np.sin(2*np.pi*180*t)*np.exp(-t/.038)*.24
    # Three quiet flams keep the body soft and broad rather than a hard click.
    for delay in [.009,.018]:
        n = int(delay*SR)
        x[n:] += .16 * noise[:-n] * np.exp(-t[:-n]/.016)
    return instrument('snare', '轻拍', room(x,.08,.45), 38, .13)


def hat():
    t = np.arange(int(SR*.13))/SR
    noise = signal.sosfilt(signal.butter(2,[6500,16000], 'bandpass', fs=SR, output='sos'), RNG.normal(size=len(t)))
    x = noise*np.exp(-t/.019)*(1-np.exp(-t/.0008))
    return instrument('hat', '细碎高帽', x, 42, .04)


def shimmer():
    root = 84
    t = np.arange(int(SR*1.7))/SR
    f = hz(root)
    x = sum(np.sin(2*np.pi*f*ratio*t)*gain*np.exp(-t/tau)
            for ratio,gain,tau in [(1,1,.55),(2.76,.14,.18),(4.1,.07,.12)])
    x *= 1-np.exp(-t/.009)
    return instrument('shimmer', '微光铃', room(x,.28,1.8), root, .95)


def read_mono(path):
    rate, x = wavfile.read(path)
    if np.issubdtype(x.dtype, np.integer):
        x = x.astype(np.float64) / max(abs(np.iinfo(x.dtype).min),np.iinfo(x.dtype).max)
    if x.ndim == 2:
        x = x.mean(axis=1)
    if rate != SR:
        g = math.gcd(rate, SR)
        x = signal.resample_poly(x, SR//g, rate//g)
    return signal.sosfilt(signal.butter(2, 60, 'highpass', fs=SR, output='sos'), x)


def voiced_region(x):
    """Locate one stable voiced region, never infer a melody from a mixture."""
    hop = 441
    size = 4096
    candidates = []
    for p in range(0, len(x)-size, hop):
        w = x[p:p+size] * np.hanning(size)
        ac = signal.fftconvolve(w,w[::-1], mode='full')[size-1:]
        lo,hi = int(SR/900),int(SR/150)
        peaks,_ = signal.find_peaks(ac[lo:hi])
        if not len(peaks) or ac[0] < 1e-8:
            candidates.append((p,0,0,0));continue
        peaks += lo
        # Earliest strong period, so an exact repeated second period is not
        # mistaken for a lower octave.
        best = max(ac[peaks])
        strong = peaks[ac[peaks] > best*.94]
        lag = strong[0]
        delta = .5*(ac[lag-1]-ac[lag+1])/(ac[lag-1]-2*ac[lag]+ac[lag+1]+1e-15)
        f = SR/(lag+delta)
        candidates.append((p, f, float(ac[lag]/ac[0]),float(np.sqrt(np.mean(w*w)))))
    a = np.array(candidates)
    if not len(a):
        raise ValueError('Vocal source is too short')
    good = (a[:,2]>.65)&(a[:,3]>max(a[:,3])*.22)
    notes = 69+12*np.log2(np.maximum(a[:,1],1)/440)
    best = None
    for p in range(max(1,len(a)-50)):
        q = min(len(a),p+75)
        valid = good[p:q]
        if np.sum(valid) < 40:
            continue
        ns=notes[p:q][valid]
        score=float(np.mean(a[p:q,2][valid]) - np.std(ns)*.8)
        if best is None or score>best[0]:
            best=(score,p,q,float(np.median(a[p:q,1][valid])))
    if best is None:
        raise ValueError('No sufficiently stable sung vowel in source')
    _,p,q,f = best
    begin=int(a[p,0]+size//2)
    end=int(min(len(x),a[q-1,0]+size//2))
    region = x[begin:end].copy()
    rms = np.sqrt(ndimage.uniform_filter1d(region*region,size=2205)+1e-8)
    region = region / np.maximum(rms,np.median(rms)*.4) * np.median(rms)
    # Follow positive waveform peaks approximately one source period apart.
    period=SR/f
    smoothed = signal.sosfiltfilt(signal.butter(2,min(f*2.5,1800),'lowpass',fs=SR,output='sos'),region)
    first = int(np.argmax(smoothed[:int(period*2)]))
    marks=[first]
    while marks[-1]+period*1.4<len(region):
        center=marks[-1]+period
        lo=max(marks[-1]+int(period*.65),int(center-period*.22))
        hi=min(len(region),int(center+period*.22))
        marks.append(lo+int(np.argmax(smoothed[lo:hi])))
    return region,np.array(marks),dict(sourceStartSeconds=begin/SR,sourceEndSeconds=end/SR,
        estimatedSourceHz=f,estimatedSourceMidi=69+12*math.log2(f/440),stableScore=best[0])


def psola(region, marks, midi, previous=None, duration=2.5):
    """Pitch-synchronous overlap/add: keep vowel grains at their source rate.

    Changes the excitation period without speeding the whole recording up.
    This is an experimental sustained-vowel treatment, not a singing model.
    """
    n=int(duration*SR)
    out=np.zeros(n)
    weight=np.zeros(n)
    pos=0.0
    k=0
    while pos<n:
        sec=pos/SR
        blend=min(1,sec/.065)
        blend=blend*blend*(3-2*blend)
        pitch=midi if previous is None else previous+(midi-previous)*blend
        pitch += .095*math.sin(2*math.pi*5.2*sec)*min(1,sec/.30)
        target_period=SR/hz(pitch)
        # Forward/backward donor movement avoids repeatedly using one frozen cycle.
        scan=(sec*.64)%(2*max(.001,len(region)/SR-.08))
        scan=min(scan,2*max(.001,len(region)/SR-.08)-scan)
        index=int(np.argmin(np.abs(marks-(scan+.035)*SR)))
        index=max(2,min(len(marks)-3,index))
        center=marks[index]
        radius=int((marks[index+1]-marks[index-1])/2)
        radius=max(12,radius)
        start=center-radius
        grain=region[start:center+radius+1]
        if len(grain)!=2*radius+1:
            pos+=target_period;continue
        window=np.hanning(len(grain))
        at=int(round(pos))-radius
        a=max(0,at);b=min(n,at+len(grain))
        if b>a:
            out[a:b]+=grain[a-at:b-at]*window[a-at:b-at]
            weight[a:b]+=window[a-at:b-at]
        pos+=target_period
        k+=1
    out/=np.maximum(weight,.30)
    # The main note envelope remains editable; this source has only gentle edges.
    t=np.arange(n)/SR
    out*=np.minimum(t/.038,1)*np.minimum((duration-t)/.16,1)
    return out


def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--vocal', type=Path, required=True)
    args=parser.parse_args()
    HERE.mkdir(parents=True,exist_ok=True);SOUNDS.mkdir(exist_ok=True)
    glass_key();velvet_pad();bass();kick();snare();hat();shimmer()
    raw=read_mono(args.vocal)
    # This selected VocalSet soprano recording sings three held registers.
    # Use the same singer's C4 and C5 regions, rather than shifting F5 down
    # an octave. These windows were independently inspected in assets/.
    regions=[]
    for left,right in [(1.25,3.30),(4.80,6.75)]:
        vowel,marks,info=voiced_region(raw[int(left*SR):int(right*SR)])
        info['sourceStartSeconds']+=left;info['sourceEndSeconds']+=left
        regions.append((vowel,marks,info))
    vocal_info=dict(source=str(args.vocal.resolve()),
        sha256=hashlib.sha256(args.vocal.read_bytes()).hexdigest(),
        method='Experimental pitch-synchronous grains from two registers of one singer; no reference-song audio is used.',
        regions=[r[2] for r in regions])
    (HERE/'vocal-processing.json').write_text(json.dumps(vocal_info,indent=2),encoding='utf-8')

    tracks=[]
    def track(name, inst, section='melody', level=1, pan=0, color='#6d91b8'):
        t=dict(name=name,instrumentId=inst,section=section,level=level,pan=pan,color=color,notes=[])
        tracks.append(t);return t
    voice=track('女声 · 啊','voice_65',level=.31, color='#be8aa1')
    keys=track('背景旋律','glass',level=.135,pan=-.15,color='#6e9bc3')
    pad=track('和声铺底','pad',level=.065,pan=.12,color='#8d8cba')
    low=track('低音','bass',level=.22,color='#739b9b')
    drums=track('低频鼓','kick','rhythm',level=.27,color='#a58770')
    snaps=track('轻拍','snare','rhythm',level=.085,color='#a69083')
    hats=track('细节节奏','hat','rhythm',level=.045,pan=.16,color='#94a391')
    bells=track('高处回应','shimmer',level=.075,pan=.28,color='#c6b57e')

    def note(t,midi,start,beats,velocity=.8,inst=None,seconds=None,pan=None):
        n=dict(midi=midi,startBeat=round(start,7),durationSeconds=round(seconds if seconds is not None else beats*BEAT,7),velocity=round(velocity,4))
        if inst:n['instrumentId']=inst
        if pan is not None:n['pan']=pan
        t['notes'].append(n)

    # A newly authored melodic arc over F minor, Db, Ab, Eb, Bbm, Db, C7, Fm.
    # Entries are (position in beats, pitch, held beats). Air between gestures
    # is deliberate; repeated notes are not forced into a glissando.
    vocal_line=[(1,65,4.5),(6,67,1.7),(8,68,3.5),(12,67,1.8),(14,65,1.7),
        (16,72,2.7),(19,70,1.4),(21,68,2.5),(24,67,3.0),(28,63,3.3),
        (32,65,1.8),(34,68,1.7),(36,70,3.2),(40,72,3.0),(44,68,1.8),
        (46,67,1.6),(48,67,1.6),(50,73,1.6),(52,72,1.8),(54,70,1.5),
        (56,68,2.7),(59,67,1.6),(61,65,2.7)]
    previous=None;previous_end=-100
    voice_keys={}
    for start,pitch,held in vocal_line:
        # Only near-adjacent gestures receive a small, baked glide in this demo.
        from_pitch=previous if (start-previous_end)*BEAT<.14 and previous!=pitch else None
        key=f'voice_{pitch}'+(f'_from_{from_pitch}' if from_pitch is not None else '')
        if key not in voice_keys:
            vowel,marks,region_info=min(regions,key=lambda r:abs(pitch-r[2]['estimatedSourceMidi']))
            sample=psola(vowel,marks,pitch,from_pitch,duration=2.5)
            pitch_name=['C','C♯','D','E♭','E','F','F♯','G','A♭','A','B♭','B'][pitch%12]+str(pitch//12-1)
            keyname=f'女声啊 {pitch_name}' + (f' · 连音{from_pitch}' if from_pitch is not None else '')
            instrument(key,keyname,room(sample,.30,1.8),pitch,.43)
            voice_keys[key]=True
        note(voice,pitch,start,held,.86 if start<32 else .91,inst=key)
        previous=pitch;previous_end=start+held

    # A recurring accompaniment motif, with an answer and a short development.
    phrases=[
      [65,72,68,75,72,68,67,72], [68,72,77,75,72,68,67,65],
      [65,68,72,75,72,68,67,72], [68,72,77,79,75,72,68,67],
      [61,68,65,72,75,72,68,65], [68,72,77,75,72,68,65,63],
      [63,68,72,75,79,75,72,68], [67,70,75,77,75,70,67,63],
      [65,68,72,77,75,72,68,65], [68,72,77,80,77,75,72,68],
      [65,68,72,77,80,77,72,68], [65,68,72,75,72,68,67,65],
      [67,72,73,77,76,73,72,70], [64,67,70,72,76,79,76,72],
      [65,68,72,77,79,77,75,72], [68,72,77,75,72,68,67,65]]
    for bar,sequence in enumerate(phrases):
        for i,pitch in enumerate(sequence):
            if bar==0 and i not in [0,4]:continue
            if bar==1 and i not in [0,2,5,7]:continue
            if bar in [2,4,6,8,12,14] and i in [1,5]:continue
            if bar in [5,9,13] and i==3:continue
            if bar==10 and i in [4,5,6,7]:continue
            if bar==11 and i in [0,1]:continue
            velocity=[.88,.48,.69,.52,.78,.51,.64,.55][i]
            note(keys,pitch,bar*4+i*.5,.42,velocity,pan=-.14+.10*math.sin(i*.9))

    chords=[[53,60,68],[53,61,68],[51,60,67],[55,63,70],
            [53,60,68],[53,61,68],[52,58,67],[53,60,68]]
    roots=[29,37,32,31,34,37,36,29]
    for block,chord in enumerate(chords):
        for j,pitch in enumerate(chord):
            note(pad,pitch,block*8+.055*j,6.8,.66)
        if block==0:continue
        for off in [0,1,2,3,4,5,6,7]:
            start=block*8+off
            if 42<=start<46:continue
            note(low,roots[block],start,.74,.86 if off%2==0 else .62)
        if block in [2,3,5,7]:
            note(low,roots[block]+12,block*8+7.5,.32,.52)

    # The first full low-frequency entrance occurs at beat 8, not at file start.
    for bar in range(2,16):
        hits=([0,2] if bar<6 else [0,1.5,2.75])
        if bar in [10,11]:hits=[0] if bar==10 else [2.5]
        if bar==15:hits=[0,1.5,3]
        for off in hits:note(drums,36,bar*4+off,.45,.92 if off==0 else .74)
        if bar>=4 and bar not in [10,11]:
            for off in [1,3]:note(snaps,38,bar*4+off,.3,.57 if off==1 else .69)
        if bar>=4:
            for i in range(8):
                if bar in [10,11] and i not in [0,6]:continue
                note(hats,42,bar*4+i*.5,.16,.44 if i%2==0 else .70)
        if bar in [7,13,15]:
            for off in [3.25,3.5,3.75]:note(hats,42,bar*4+off,.12,.35+(off-3)*.3)

    for start,pitch in [(0,84),(7,80),(15,84),(23,87),(31,82),(39,84),(47,80),(55,79),(62,77)]:
        note(bells,pitch,start,.85,.55)
    score=dict(name='余焰 · 第一稿',tempoBpm=BPM,lengthBeats=64,phraseBeats=16,masterLevel=1,
        instruments=instruments,tracks=tracks,
        provenance=dict(referenceRole='Vulcanus 0–20 seconds: structural reference only; no source audio copied.',
          authored='All notes, chord voicings, rhythm and synthetic sounds authored for this sketch.',
          vocalSource=str(args.vocal.resolve()),vocalProcessing='PSOLA vowel-grain treatment with per-note baked transitions; not a general-purpose legato engine.'))
    (HERE/'score.json').write_text(json.dumps(score,ensure_ascii=False,indent=2),encoding='utf-8')
    summary=dict(name=score['name'],tempo=BPM,bodySeconds=64*BEAT,instruments=len(instruments),
        notes=sum(len(t['notes']) for t in tracks),tracks=[dict(name=t['name'],notes=len(t['notes'])) for t in tracks],vocalProcessing=vocal_info)
    (HERE/'composition-summary.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps(summary,ensure_ascii=False,indent=2))


if __name__=='__main__':
    main()
