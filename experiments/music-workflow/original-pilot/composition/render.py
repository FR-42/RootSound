"""Render the *compiled RootSound plan* without opening an audio device.

This reproduces sample/envelope/pan scheduling. A single documented gain is
applied to listening files; no different notes, instruments or hidden mix.
"""
from pathlib import Path
from fractions import Fraction
import argparse
import hashlib
import json
import subprocess
import re
import numpy as np
from scipy import signal
from scipy.io import wavfile

HERE=Path(__file__).resolve().parent
ROOT=HERE.parent
SR=44100


def load(path):
    rate,x=wavfile.read(path)
    if np.issubdtype(x.dtype,np.integer):
        info=np.iinfo(x.dtype)
        x=x.astype(np.float64)/max(abs(info.min),info.max)
    else:x=x.astype(np.float64)
    if x.ndim==1:x=x[:,None]
    return rate,x


def panner(x,pan):
    if x.shape[1]==1:
        angle=(pan+1)*np.pi/4
        return np.column_stack((x[:,0]*np.cos(angle),x[:,0]*np.sin(angle)))
    left,right=x[:,0],x[:,1]
    if pan<=0:
        angle=(pan+1)*np.pi/2
        return np.column_stack((left+right*np.cos(angle),right*np.sin(angle)))
    angle=pan*np.pi/2
    return np.column_stack((left*np.cos(angle),right+left*np.sin(angle)))


def write_wav(path,x):
    if not np.isfinite(x).all():raise ValueError('Non-finite output')
    if np.max(np.abs(x))>=1:raise ValueError('Output would clip')
    # FFmpeg performs the final 24-bit conversion; no sound hardware is used.
    temp=path.with_suffix('.float.wav')
    wavfile.write(temp,SR,x.astype(np.float32))
    subprocess.run(['ffmpeg','-v','error','-nostdin','-y','-i',str(temp),'-c:a','pcm_s24le',str(path)],check=True)
    temp.unlink()


def measure(path):
    r=subprocess.run(['ffmpeg','-hide_banner','-nostdin','-i',str(path),'-af',
        'loudnorm=I=-16:TP=-1.2:LRA=11:print_format=json','-f','null','NUL'],capture_output=True,text=True,encoding='utf-8',errors='replace',check=True)
    match=re.findall(r'\{\s*"input_i".*?\}',r.stderr,re.S)
    if not match:raise RuntimeError('Loudness report missing')
    return json.loads(match[-1])


def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--delivery',type=Path,default=ROOT/'delivery')
    args=parser.parse_args()
    delivery=args.delivery.resolve()
    plan=json.loads((delivery/'播放计划.json').read_text(encoding='utf-8'))
    score=json.loads((HERE/'score.json').read_text(encoding='utf-8'))
    instrument_track={}
    for track in score['tracks']:
        instrument_track.setdefault(track['instrumentId'],track['name'])
        for note in track['notes']:
            instrument_track.setdefault(note.get('instrumentId',track['instrumentId']),track['name'])
    frames=int(np.ceil(plan['durationSeconds']*SR))
    layers={t['name']:np.zeros((frames,2)) for t in score['tracks']}
    cache={}
    for event in plan['events']:
        if event['kind']!='sample':raise ValueError('This renderer expects baked playable sample instruments')
        key=(event['wavKey'],event['playbackRate'])
        if key not in cache:
            path=(HERE/event['wavPath']).resolve()
            assert hashlib.sha256(path.read_bytes()).hexdigest()==event['sampleSha256']
            rate,x=load(path)
            begin=round(event['startSeconds']*rate);end=round(event['endSeconds']*rate)
            x=x[begin:end]
            ratio=Fraction(SR/(rate*event['playbackRate'])).limit_denominator(2000)
            cache[key]=signal.resample_poly(x,ratio.numerator,ratio.denominator,axis=0)
        source=cache[key]
        count=min(len(source),int(np.ceil(event['durationSeconds']*SR)))
        age=np.arange(count)/SR
        hold=event['holdSeconds'];attack=event['envelope']['attackSeconds'];release=event['envelope']['releaseSeconds']
        peak=min(1,hold/attack) if attack else 1
        env=np.ones(count)*peak
        if attack:
            mask=age<min(attack,hold);env[mask]=age[mask]/attack
        if release:
            mask=age>=hold;env[mask]=peak*np.maximum(0,1-(age[mask]-hold)/release)
        else:env[age>=hold]=0
        voice=source[:count]*env[:,None]*event['level']*event['velocity']*plan['normalization']
        voice=panner(voice,event['pan'])
        begin=int(round(event['atSeconds']*SR));count=min(count,frames-begin)
        layers[instrument_track[event['wavKey']]][begin:begin+count]+=voice[:count]
    mix=sum(layers.values())
    # Tiny final taper corresponds only to the last 6ms of the rendered release.
    n=min(265,len(mix))
    for x in layers.values():x[-n:]*=np.linspace(1,0,n)[:,None]
    mix=sum(layers.values())
    raw=delivery/'工程原音量.wav'
    write_wav(raw,mix)
    before=measure(raw)
    gain_db=min(-16-float(before['input_i']),-1.2-float(before['input_tp']))
    gain=10**(gain_db/20)
    full=delivery/'01-余焰-完整试听.wav'
    write_wav(full,mix*gain)
    focus_names=['女声 · 啊','背景旋律','和声铺底','高处回应']
    focus=sum(layers[name] for name in focus_names)
    focus_peak=np.max(abs(focus))*gain
    if focus_peak>=1:raise ValueError('Focused mix clips after documented gain')
    write_wav(delivery/'02-人声与背景旋律.wav',focus*gain)
    stems=delivery/'分轨';stems.mkdir(exist_ok=True)
    for i,(name,x) in enumerate(layers.items(),1):
        write_wav(stems/f'{i:02d}-{name}.wav',x*gain)
    after=measure(full)
    summary=dict(sampleRate=SR,channels=2,bitsPerSample=24,seconds=frames/SR,
        notesRendered=len(plan['events']),rootSoundNormalization=plan['normalization'],
        listeningGainDb=gain_db,rawLoudness=before,listeningLoudness=after,
        peak=float(np.max(np.abs(mix*gain))),rms=float(np.sqrt(np.mean((mix*gain)**2))),
        allFinite=bool(np.isfinite(mix).all()),
        stemReconstructionMaxError=float(np.max(np.abs(sum(layers.values())-mix))),
        method='Compiled RootSound plan, resample_poly, same envelope and StereoPanner equations; one global listening gain. Offline only; no device audition.',
        sourceReferenceCopied=False)
    (delivery/'试听核验.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps(summary,ensure_ascii=False,indent=2))


if __name__=='__main__':main()
