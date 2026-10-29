"""Independent local workflow: official HTDemucs + Spotify Basic Pitch.
No RipX executable, license service, private DSP or project format is used.
"""
from bootstrap import ROOT, CONFIG
from pathlib import Path
import hashlib, json, math, os, socket, subprocess, sys, tempfile, traceback
import numpy as np
import soundfile as sf

RATE = 44100
NAMES = {'drums':'鼓', 'bass':'贝斯', 'other':'其他', 'vocals':'人声', 'guitar':'吉他', 'piano':'钢琴'}
PROGRAMS = {'bass':33, 'guitar':24, 'piano':0, 'vocals':53, 'other':0}

def report(value, message, **extra):
    print(json.dumps(dict(progress=value, message=message, **extra), ensure_ascii=False), flush=True)

def deny_network(*args, **kwargs):
    raise RuntimeError('此工具仅使用本地模型，不在运行时联网下载。')

def write_json(path, data):
    path = Path(path)
    temp = path.with_name(path.name + '.tmp')
    temp.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding='utf8')
    os.replace(temp, path)

def decode(source, output):
    source = Path(source).resolve(strict=True)
    result = subprocess.run([CONFIG['ffmpeg'], '-v', 'error', '-nostdin', '-i', str(source),
        '-vn', '-ar', str(RATE), '-ac', '2', '-f', 'f32le', '-y', str(output)],
        capture_output=True, creationflags=getattr(subprocess,'CREATE_NO_WINDOW',0))
    if result.returncode:
        raise RuntimeError(result.stderr.decode('utf8', errors='replace')[-3000:])
    frames = output.stat().st_size // 8
    if not frames:
        raise ValueError('输入没有可解码的音频。')
    return np.memmap(output, dtype='<f4', mode='r', shape=(frames,2))

def load_separator(mode):
    import torch
    from demucs.states import load_model
    records = json.loads((ROOT/'models'/'provenance.json').read_text(encoding='utf8'))
    name = '955717e8-8726e21a.th' if mode == '4' else '5c90dfd2-34c22ccb.th'
    record = next(r for r in records if r['file'] == name)
    path = ROOT/'models'/name
    with path.open('rb') as stream:
        digest = hashlib.file_digest(stream,'sha256').hexdigest()
    if digest != record['sha256'] or not digest.startswith(name.split('-')[1].split('.')[0]):
        raise RuntimeError('模型校验失败，请恢复官方模型文件。')
    # Only these fixed, digest-verified official checkpoints are deserialized.
    package = torch.load(path, map_location='cpu', weights_only=False)
    model = load_model(package).eval()
    return model

def separate(request):
    import torch
    from demucs.apply import apply_model
    torch.set_num_threads(4)
    from gpu_backend import select_device
    device, device_name = select_device(request.get('device', 'gpu'))
    mode = str(request.get('mode','4'))
    if mode not in ('4','6'):
        raise ValueError('只支持四轨或六轨。')
    job = Path(request['job']).resolve()
    job.mkdir(parents=True, exist_ok=False)
    write_json(job/'status.json', {'status':'running', 'source':request['input']})
    report(.01,'解码音频…',job=str(job))
    # All scratch files are owned by this job and are removed on normal/failing exit.
    with tempfile.TemporaryDirectory(prefix='.work-',dir=job) as temporary:
        scratch = Path(temporary)
        audio = decode(request['input'], scratch/'input.f32')
        frames = len(audio)
        try:
            report(.03,'加载本地 HTDemucs 模型：'+device_name,device=device,device_name=device_name)
            model = load_separator(mode).to(device)
            names = list(model.sources)
            window = int(float(model.segment) * RATE)
            hop = int(window * .83)
            tracks = [np.memmap(scratch/(n+'.f32'), dtype='<f4', mode='w+', shape=(frames,2)) for n in names]
            sums = np.memmap(scratch/'sums.f32', dtype='<f4', mode='w+', shape=(frames,))
            # Global normalization in bounded blocks, independent of song duration.
            total = total2 = 0.0
            for start in range(0,frames,65536):
                mono = np.asarray(audio[start:start+65536],dtype=np.float64).mean(axis=1)
                if not np.isfinite(mono).all(): raise ValueError('输入包含非有限采样。')
                total += float(mono.sum()); total2 += float(np.square(mono).sum())
            mean = total / frames
            scale = max(math.sqrt(max(0,total2/frames-mean*mean)),1e-6)
            count = math.ceil(frames/hop)
            try:
                with torch.inference_mode():
                    for index,start in enumerate(range(0,frames,hop)):
                        end = min(frames,start+window)
                        piece = torch.from_numpy(np.asarray(audio[start:end]).T.copy())
                        estimate = apply_model(model, ((piece-mean)/scale)[None],
                            shifts=0, split=False, device=device, progress=False)[0]
                        data = (estimate*scale + mean/len(names)).cpu().numpy()
                        if not np.isfinite(data).all(): raise RuntimeError('模型输出包含非有限采样。')
                        weights = np.maximum(np.sin(np.pi*(np.arange(end-start)+.5)/(end-start))**2,1e-4).astype('float32')
                        for dest,stem in zip(tracks,data): dest[start:end] += stem.T*weights[:,None]
                        sums[start:end] += weights
                        report(.05+.67*(index+1)/count,f'音轨分离 {index+1}/{count} 个时间窗')
                outputs=[]
                for name,track in zip(names,tracks):
                    path=job/(name+'.wav')
                    with sf.SoundFile(path,mode='w',samplerate=RATE,channels=2,subtype='FLOAT',format='WAV') as output:
                        for start in range(0,frames,65536):
                            output.write(track[start:start+65536]/np.maximum(sums[start:start+65536,None],1e-8))
                    outputs.append({'name':name,'label':NAMES[name],'file':path.name})
                # Preserve any unassigned model residual separately; predicted stems stay unmodified.
                residual=job/'residual.wav'
                with sf.SoundFile(residual,mode='w',samplerate=RATE,channels=2,subtype='FLOAT',format='WAV') as output:
                    for start in range(0,frames,65536):
                        predicted=sum(np.asarray(t[start:start+65536])/np.maximum(sums[start:start+65536,None],1e-8) for t in tracks)
                        output.write(np.asarray(audio[start:start+65536])-predicted)
            finally:
                for track in tracks: track._mmap.close()
                sums._mmap.close()
            del model
            manifest={'version':1,'source':str(Path(request['input']).resolve()),'model':'htdemucs' if mode=='4' else 'htdemucs_6s',
                      'device':device,'device_name':device_name,'torch_version':torch.__version__,
                      'sample_rate':RATE,'frames':frames,'duration':frames/RATE,'stems':outputs,
                      'residual':'residual.wav','midi':None,'notes':None,'midi_status':'not_requested'}
            write_json(job/'project.json',manifest)
        finally:
            audio._mmap.close()
    if request.get('midi'):
        try:
            transcribe(job, manifest)
        except Exception as exc:
            manifest['midi_status']='failed'
            manifest['midi_error']=str(exc)
            write_json(job/'project.json',manifest)
            report(.99,'音轨已保存；MIDI 转录失败：'+str(exc))
    write_json(job/'status.json',{'status':'complete','midi_status':manifest['midi_status']})
    report(1,'完成：音轨已保存。',result=str(job/'project.json'))

def save_midi(notes, path):
    import pretty_midi
    midi=pretty_midi.PrettyMIDI(initial_tempo=120,resolution=256)
    for track in notes['tracks']:
        instrument=pretty_midi.Instrument(program=PROGRAMS.get(track['name'],0),name=track['name'].encode('ascii',errors='replace').decode('ascii'))
        for item in track['notes']:
            start,end=float(item['start']),float(item['end'])
            pitch,velocity=int(item['pitch']),int(item['velocity'])
            if not all(math.isfinite(x) for x in (start,end)) or not (0<=start<end and 0<=pitch<=127 and 1<=velocity<=127):
                raise ValueError('音符的时间、音高或力度超出范围。')
            instrument.notes.append(pretty_midi.Note(velocity,pitch,start,end))
        midi.instruments.append(instrument)
    midi.write(str(path))

def transcribe(job, manifest):
    from basic_pitch.inference import predict, Model
    # Force ONNX CPU model; never fall back to a cloud service.
    model_path=ROOT/'packages'/'basic_pitch'/'saved_models'/'icassp_2022'/'nmp.onnx'
    import onnxruntime as ort
    options=ort.SessionOptions(); options.intra_op_num_threads=4; options.inter_op_num_threads=1
    model=Model.__new__(Model)
    model.model_type=Model.MODEL_TYPES.ONNX
    model.model=ort.InferenceSession(str(model_path),sess_options=options,providers=['CPUExecutionProvider'])
    melodic=[x for x in manifest['stems'] if x['name']!='drums']
    notes={'engine':'Spotify Basic Pitch 0.4.0 (ONNX)','tracks':[],'timing':'seconds; MIDI tempo fixed at 120, not beat-quantized'}
    for index,stem in enumerate(melodic):
        report(.73+.25*index/len(melodic),'转录 MIDI：'+stem['label'])
        items=[]
        with sf.SoundFile(job/stem['file']) as audio:
            rate=audio.samplerate; frames=len(audio); step=20*rate; pad=rate
            with tempfile.TemporaryDirectory(prefix='.midi-',dir=job) as temporary:
                for start in range(0,frames,step):
                    end=min(frames,start+step); left=max(0,start-pad); right=min(frames,end+pad)
                    audio.seek(left); samples=audio.read(right-left,dtype='float32',always_2d=True)
                    piece=Path(temporary)/'chunk.wav'; sf.write(piece,samples,rate,subtype='FLOAT')
                    _,predicted,_=predict(str(piece),model,minimum_note_length=100)
                    for instrument in predicted.instruments:
                        for note in instrument.notes:
                            a=max(start/rate,note.start+left/rate); b=min(end/rate,note.end+left/rate)
                            if b-a >= .04:
                                items.append(dict(pitch=int(note.pitch),velocity=max(1,int(note.velocity)),start=round(a,5),end=round(b,5)))
                    report(.73+.25*(index+(end/frames))/len(melodic),'MIDI：'+stem['label']+f' {end/rate:.0f}/{frames/rate:.0f} 秒')
        # Join only fragments cut by a chunk boundary, not ordinary repeated notes.
        items.sort(key=lambda n:(n['pitch'],n['start']))
        merged=[]
        for note in items:
            previous=merged[-1] if merged else None
            boundary=round(note['start']/20)*20
            if previous and previous['pitch']==note['pitch'] and abs(note['start']-boundary)<.002 and abs(previous['end']-note['start'])<.002:
                previous['end']=note['end']
            else: merged.append(note)
        track={'name':stem['name'],'notes':sorted(merged,key=lambda n:n['start'])}
        notes['tracks'].append(track)
        save_midi({'tracks':[track]},job/(stem['name']+'.mid'))
    write_json(job/'notes.json',notes)
    save_midi(notes,job/'all-stems.mid')
    manifest.update(midi='all-stems.mid',notes='notes.json',midi_status='complete')
    write_json(job/'project.json',manifest)

def mix(request):
    from contextlib import ExitStack
    project=Path(request['project']); manifest=json.loads(project.read_text(encoding='utf8'))
    allowed={s['name']:s['file'] for s in manifest['stems']}; allowed['residual']=manifest['residual']
    choices=request['tracks']; output=Path(request['output']).resolve()
    protected={project.resolve(),Path(manifest['source']).resolve()}
    protected.update((project.parent/p).resolve() for p in allowed.values())
    if output in protected: raise ValueError('不能覆盖输入或项目音轨。')
    if not choices: raise ValueError('请至少勾选一条音轨。')
    with ExitStack() as stack:
        opened=[]
        for choice in choices:
            gain=float(choice['gain'])
            if not math.isfinite(gain) or not 0<=gain<=2: raise ValueError('音量必须在0到200%之间。')
            opened.append((stack.enter_context(sf.SoundFile(project.parent/allowed[choice['name']])),gain))
        frames=manifest['frames']; peak=0.0
        for start in range(0,frames,65536):
            data=sum(f.read(min(65536,frames-start),dtype='float32',always_2d=True)*gain for f,gain in opened)
            peak=max(peak,float(np.abs(data).max(initial=0)))
        factor=min(1,.98/max(peak,1e-9))
        for f,_ in opened: f.seek(0)
        temporary=output.with_name(output.name+'.partial')
        try:
            with sf.SoundFile(temporary,mode='w',format='WAV',samplerate=RATE,channels=2,subtype='PCM_16' if request.get('preview') else 'PCM_24') as target:
                for start in range(0,frames,65536):
                    data=sum(f.read(min(65536,frames-start),dtype='float32',always_2d=True)*gain for f,gain in opened)
                    target.write(data*factor)
            os.replace(temporary,output)
        finally:
            temporary.unlink(missing_ok=True)
    report(1,f'已导出；防削波增益 {factor:.3f}',result=str(output))

def main():
    socket.socket.connect=deny_network; socket.create_connection=deny_network
    request=json.loads(Path(sys.argv[1]).read_text(encoding='utf-8-sig'))
    action=request.get('action','separate')
    if action=='separate': separate(request)
    elif action=='mix': mix(request)
    elif action=='midi':
        project=Path(request['project']); manifest=json.loads(project.read_text(encoding='utf8'))
        transcribe(project.parent,manifest); report(1,'MIDI 已导出',result=str(project))
    elif action=='save_notes':
        save_midi(request['notes'],Path(request['output'])); report(1,'修改后的 MIDI 已保存',result=request['output'])
    else: raise ValueError('未知操作')

if __name__=='__main__':
    try: main()
    except Exception as error:
        try:
            request=json.loads(Path(sys.argv[1]).read_text(encoding='utf-8-sig'))
            job=Path(request['job']) if request.get('action','separate')=='separate' else None
            if job and (job/'status.json').exists(): write_json(job/'status.json',{'status':'failed','error':str(error)})
        except Exception: pass
        traceback.print_exc(); sys.exit(1)
