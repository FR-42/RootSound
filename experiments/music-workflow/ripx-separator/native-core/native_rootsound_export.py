"""Export native reconstruction or native MIDI through RootSound's importer.

The native song's own recovered notes are the sole MIDI source. This adapter
has no transcribe argument and cannot fall through to Basic Pitch/Demucs.
"""
from pathlib import Path
import json
import subprocess
import tempfile

import numpy as np
import soundfile as sf


def export_native_rootsound(request,report,config,application_root):
    root=Path(application_root);manifest_file=Path(request['native_song']).resolve(strict=True)
    manifest=json.loads(manifest_file.read_text(encoding='utf-8-sig'))
    if manifest.get('format')!='RipXReconstructedNativeSong' or manifest.get('public_model_used') is not False:
        raise ValueError('需要原生整曲识别结果')
    mode=request['mode']
    if mode not in ('audio','notes'):raise ValueError('未知原生工程类型')
    destination=request.get('destination',str(root.parents[2]/'project'))
    name=Path(manifest.get('source','原生整曲')).stem[:50]+(' · 原生重建' if mode=='audio' else ' · 原生音符')
    cache=root/'.cache';cache.mkdir(exist_ok=True)
    with tempfile.TemporaryDirectory(prefix='native-rootsound-',dir=cache) as temporary:
        work=Path(temporary);payload={'mode':mode,'name':name,'destination':destination}
        if mode=='notes':
            midi=manifest.get('midi')
            if not isinstance(midi,str) or Path(midi).name!=midi:raise ValueError('非法原生MIDI路径')
            payload['midi']=str(manifest_file.parent/midi)
        else:
            rate=manifest['sample_rate'];frames=manifest['frames']
            if not 0<frames/rate<=512:raise ValueError('RootSound原音工程目前支持不超过512秒')
            stems=manifest.get('stems')
            if stems:
                choices=[{'name':stem['name'],'label':stem['label'],'file':stem['file']} for stem in stems]
            else:choices=[{'name':'reconstruction','label':'原生重建','file':manifest['reconstruction']}]
            choices.append({'name':'residual','label':'未重建余量','file':manifest['residual']})
            allowed={item['name']:item for item in choices}
            selected=request.get('tracks',list(allowed))
            if not isinstance(selected,list) or not selected or any(type(name) is not str for name in selected) or len(selected)!=len(set(selected)) or any(name not in allowed for name in selected):
                raise ValueError('请至少选择一条有效原生音轨')
            choices=[allowed[name] for name in selected]
            if frames*2*4*len(choices)*4/3>480*1024**2:
                raise ValueError('所选原生音轨超过RootSound工程容量，请减少导出的轨道；原始WAV全部保留')
            lanes=[]
            for lane,choice in enumerate(choices):
                filename=choice['file'];label=choice['label']
                if Path(filename).name!=filename:raise ValueError('非法原生音轨路径')
                chunks=[]
                with sf.SoundFile(manifest_file.parent/filename) as audio:
                    if audio.frames!=frames or audio.samplerate!=rate or audio.channels not in (1,2):
                        raise ValueError('原生音轨格式不一致')
                    for start in range(0,frames,rate*24):
                        samples=audio.read(min(rate*24,frames-start),dtype='float32',always_2d=True)
                        if audio.channels==1:samples=np.repeat(samples,2,axis=1)
                        output=work/f'{lane}-{start}.wav';sf.write(output,samples,rate,subtype='FLOAT')
                        chunks.append({'file':str(output),'startFrame':start,'frames':len(samples),'rate':rate,'channels':2})
                lanes.append({'label':label,'gain':1,'chunks':chunks})
            payload.update(lanes=lanes,duration=frames/rate)
        input_file=work/'request.json';input_file.write_text(json.dumps(payload,ensure_ascii=False),encoding='utf8')
        report(.7,'使用RootSound原生导入器生成工程')
        result=subprocess.run([config.get('node','node'),'--max-old-space-size=8192',str(root/'rootsound-export.mjs'),str(input_file)],
            capture_output=True,text=True,encoding='utf8',creationflags=getattr(subprocess,'CREATE_NO_WINDOW',0))
        if result.returncode:raise RuntimeError(result.stderr[-6000:])
        value=json.loads(result.stdout)
        for warning in value['warnings']:report(.98,warning)
        report(1,'原生'+('重建音频' if mode=='audio' else '识别音符')+'工程已保存',result=value['path'])
