"""Whole-fragment model estimates for listening, distinct from editable notes."""
import argparse,json,shutil,hashlib
from pathlib import Path
import numpy as np
from scipy.io import wavfile
from analyze_vulcanus import CASE,SOURCE
from model_refinement import read_stems
import build_vulcanus_case as builder

def main():
    parser=argparse.ArgumentParser();parser.add_argument('--stem-dir',type=Path,default=CASE/'separated-estimate');args=parser.parse_args()
    stems,evidence=read_stems(args.stem_dir,builder.START,builder.DURATION,builder.SR)
    destination=CASE/'sound-observation';destination.mkdir(exist_ok=True)
    builder.CASE=destination
    shutil.copy2(CASE/'reference.wav',destination/'reference.wav')
    original=json.loads((CASE/'case.json').read_text(encoding='utf-8'))
    rms={k:float(np.sqrt(np.mean(x.astype(np.float64)**2))) for k,x in stems.items()}
    selected=['drums','bass','other']
    if rms['vocals']>max(rms.values())*.01:selected.append('vocals')
    titles=dict(drums='鼓与打击 · 估计',bass='低音 · 估计',other='旋律与背景 · 混合',vocals='类人声部分 · 估计')
    prompts=dict(drums='独听鼓声的落点、细碎变化和尾音；可能残留其他声音。',
        bass='独听低频的持续与变化，再和鼓一起比较；模型可能把鼓尾分到这里。',
        other='这里混合着旋律、和声与其他背景声音，可和鼓、低音分别比较。',
        vocals='模型分到类人声的一部分，可能是采样、合成器或分离残留，并不保证有人声。')
    assets=[];channels=[];layers=[];sounds=[]
    for name in selected:
        audio=stems[name];asset_name='Vulcanus-Observation-'+name.title();identifier=builder.gid('observation-'+name)
        assets.append(dict(name=asset_name,audio=audio,settings=builder.settings(60,attack=0,decay=0,sustain=1,release=.005)))
        channel=dict(Id=identifier,Name=titles[name],AssetKey='',Mode=1,StepPitch=60,GainDb=0,Muted=False,
            Notes=[builder.note('observation-note-'+name,60,0,builder.DURATION,1)])
        channels.append(channel)
        layers.append(dict(ChannelId=identifier,Role=titles[name],Explanation=prompts[name],
            Origin='本地官方 Hybrid Demucs（HDEMUCS_HIGH_MUSDB_PLUS）模型的 '+name+' 整段估计；音频未经独立归一化。不是原始分轨，音符只用于触发整段声音，不是扒出的音符。'))
        sounds.append(dict(ChannelId=identifier,BrightnessHz=16000,Sweep=0,EchoMix=0))
    builder.make_archive(channels,assets,destination/'reconstruction.rsphrase',
        document_name='Vulcanus · 模型声音观察',document_id=builder.gid('observation-phrase'))
    mix=sum(stems[name] for name in selected)
    wavfile.write(destination/'reconstruction.wav',builder.SR,mix.astype(np.float32))
    info=original['Info'].copy();info.update(Title='Vulcanus · 声音观察',
        Summary='把同一片段的模型估计声音分别独听。每层是一整段音频，用于观察，非音符级重建。',
        AnalysisCaveat='官方 Hybrid Demucs 在本机生成的声音估计，不是原始分轨；可能串音、丢失声音或产生残留。每层仅用一个音符触发整段，不能当作原曲乐谱。')
    case=dict(Format='RootSound.ReferenceCase',Version=1,Info=info,Layers=layers,Sounds=sounds,ReferenceGainDb=0,MasterGainDb=0)
    builder.write_json(destination/'case.json',case)
    provenance=dict(type='whole-fragment model-estimate observation, not note transcription',separation=evidence,
        selectedSources=selected,omittedSources=[k for k in stems if k not in selected],rms=rms,
        perLayerGainDb=0,independentNormalization=False,frames=builder.N,sampleRate=builder.SR,
        mixturePeak=float(abs(mix).max()),mixtureRms=float(np.sqrt(np.mean(mix.astype(np.float64)**2))))
    builder.write_json(destination/'observation-evidence.json',provenance)
    print(json.dumps(dict(directory=str(destination),sources=selected,frames=builder.N,rms=rms),indent=2))
if __name__=='__main__':main()
