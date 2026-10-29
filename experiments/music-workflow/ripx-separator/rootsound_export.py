"""Export through RootSound's own material validation and MIDI importer."""
import json, math, subprocess, tempfile
from pathlib import Path
import soundfile as sf
from bootstrap import ROOT, CONFIG

def export_project(request, report, transcribe, save_midi):
    project = Path(request['project']).resolve()
    manifest = json.loads(project.read_text(encoding='utf8'))
    mode = request['mode']
    if mode not in ('audio', 'notes'): raise ValueError('未知工程类型')
    name = Path(manifest['source']).stem[:50] + (' · 分离原音' if mode == 'audio' else ' · 识别音符')
    destination = request.get('destination', str(ROOT.parents[2] / 'project'))
    choices = request.get('tracks', [{'name': s['name'], 'gain': 1} for s in manifest['stems']])
    if not choices: raise ValueError('请至少选择一个声部')
    allowed = {s['name']: s for s in manifest['stems']}
    if manifest.get('residual'): allowed['residual'] = {'file': manifest['residual'], 'label': '残差', 'name': 'residual'}
    for choice in choices:
        if choice['name'] not in allowed: raise ValueError('未知声部')
        if not math.isfinite(choice['gain']) or not 0 <= choice['gain'] <= 2: raise ValueError('声部音量必须在 0–200%')
    report(.05, '准备 RootSound 工程…')
    with tempfile.TemporaryDirectory(prefix='rootsound-', dir=ROOT / '.cache') as temporary:
        work = Path(temporary)
        payload = dict(mode=mode, name=name, destination=destination)
        if mode == 'audio':
            rate, frames = manifest['sample_rate'], manifest['frames']
            if not 0 < frames / rate <= 512: raise ValueError('原音工程当前支持不超过 512 秒')
            if frames * 2 * 4 * len(choices) > 512 * 1024**2: raise ValueError('所选原音超过 RootSound 的 512 MiB 采样播放容量')
            if frames * 2 * 4 * len(choices) * 4 / 3 > 480 * 1024**2:
                raise ValueError('原音工程超过当前单文件容量；请减少所选声部（不会截断或降低精度）')
            lanes = []
            for i, choice in enumerate(choices):
                stem = allowed[choice['name']]
                if Path(stem['file']).name != stem['file']: raise ValueError('非法音轨路径')
                chunks = []
                with sf.SoundFile(project.parent / stem['file']) as source:
                    if source.frames != frames or source.samplerate != rate or source.channels != 2: raise ValueError('音轨长度或格式不一致')
                    for start in range(0, frames, rate * 24):
                        data = source.read(min(rate * 24, frames - start), dtype='float32', always_2d=True)
                        output = work / f'{i}-{start}.wav'
                        sf.write(output, data, rate, subtype='FLOAT')
                        chunks.append(dict(file=str(output), startFrame=start, frames=len(data), rate=rate, channels=2))
                lanes.append(dict(label=stem['label'], gain=choice['gain'], chunks=chunks))
                report(.1 + .5 * (i + 1) / len(choices), '准备原音片段：' + stem['label'])
            payload.update(lanes=lanes, duration=frames / rate)
        else:
            notes = request.get('notes')
            if notes is None:
                if not manifest.get('notes'):
                    report(.08, '识别音符（Basic Pitch；不包含鼓点识别）…')
                    transcribe(project.parent, manifest)
                notes = json.loads((project.parent / manifest['notes']).read_text(encoding='utf8'))
            selected = {c['name']: c['gain'] for c in choices}
            notes = dict(tracks=[t for t in notes['tracks'] if t['name'] in selected])
            if not any(t['notes'] for t in notes['tracks']): raise ValueError('所选声部没有识别音符；鼓与残差不支持旋律转录')
            midi = work / 'notes.mid'
            save_midi(notes, midi)
            # Preserve the selected per-track mix as MIDI channel volume, not note velocity.
            import pretty_midi
            parsed = pretty_midi.PrettyMIDI(str(midi))
            for instrument in parsed.instruments:
                gain = selected.get(instrument.name, 1)
                if gain > 1: raise ValueError('音符工程目前支持 0–100% 声部音量；请降低后导出')
                instrument.control_changes.append(pretty_midi.ControlChange(7, round(gain * 127), 0))
            parsed.write(str(midi))
            payload['midi'] = str(midi)
        input_path = work / 'request.json'
        input_path.write_text(json.dumps(payload, ensure_ascii=False), encoding='utf8')
        report(.7, '使用 RootSound 原生校验器生成工程…')
        process = subprocess.run([CONFIG.get('node', 'node'), '--max-old-space-size=8192', str(ROOT / 'rootsound-export.mjs'), str(input_path)],
            capture_output=True, text=True, encoding='utf8', creationflags=subprocess.CREATE_NO_WINDOW)
        if process.returncode: raise RuntimeError(process.stderr[-6000:])
        result = json.loads(process.stdout)
        for warning in result['warnings']: report(.98, warning)
        report(1, f"RootSound 工程已生成（{result['tracks']} 轨）", result=result['path'])
