"""File adapters for recovered native stages. No model fallback is available."""
from contextlib import ExitStack
from pathlib import Path
import base64
import json
import subprocess
import tempfile

import numpy as np
import soundfile as sf

from native_component_sequence import NativeComponentRequest, iter_native_window_results
from native_note_export import build_initial_notes_document
from native_spectral import native_configuration

REFERENCE = '5f088fa4fbbe1759ef75d8034c79f33c846e3bf5f13d5048dd95a6614d2ad441'


def write_json(path, value):
    path.write_text(json.dumps(value, ensure_ascii=False, allow_nan=False, indent=2), encoding='utf8')


def run_component_sequence(request, report, config):
    """Estimate caller-selected native candidates and optionally subtract them.

    Candidate coordinates are explicit task inputs; this adapter does not fill
    the missing automatic frequency/chirp/harmonic-assignment stages.
    """
    source = Path(request['input']).resolve(strict=True)
    candidates = request.get('candidates')
    if not isinstance(candidates, list) or not candidates:
        raise ValueError('此入口需要原生候选任务；自动谐波候选调度尚未接通。')
    parsed = [NativeComponentRequest.from_mapping(value) for value in candidates]
    subtract = request.get('subtract', False)
    if type(subtract) is not bool:
        raise ValueError('subtract 必须为布尔值')
    # Reject unsupported branches before opening or decoding any audio.
    if any(value.branch != 'raw-pcm-constant-frequency-unweighted-energy' for value in parsed):
        raise NotImplementedError('变频及滤波频段估计分支尚未恢复，任务未执行。')
    job = Path(request['job']).resolve()
    job.mkdir(parents=True, exist_ok=False)
    state = job / 'status.json'
    write_json(state, {'status': 'running', 'full_transcription_complete': False})
    try:
        with tempfile.TemporaryDirectory(prefix='.native-', dir=job) as temporary:
            work = Path(temporary)
            decoded = work / 'input-pcm16.wav'
            report(.02, '准备原生 PCM16 分支；按提供的候选任务处理')
            process = subprocess.run([config['ffmpeg'], '-v', 'error', '-nostdin', '-i', str(source),
                '-map', '0:a:0', '-vn', '-c:a', 'pcm_s16le', '-f', 'wav', str(decoded)],
                capture_output=True, creationflags=getattr(subprocess, 'CREATE_NO_WINDOW', 0))
            if process.returncode:
                raise RuntimeError(process.stderr.decode('utf8', errors='replace')[-3000:])
            with ExitStack() as stack:
                original = stack.enter_context(sf.SoundFile(decoded))
                rate, channels, count = original.samplerate, original.channels, original.frames
                settings = native_configuration(rate)
                if count < 1 or not 1 <= channels <= 8:
                    raise ValueError('此入口支持非空的 1–8 声道音频')
                residual = None
                if subtract:
                    # Float scratch retains fractional native-amplitude writes.
                    # It is neither normalized nor exposed as a playable result.
                    residual = stack.enter_context(sf.SoundFile(work / 'residual-native-units.wav',
                        mode='w+', format='WAV', subtype='FLOAT', channels=channels, samplerate=rate))
                    while True:
                        block = original.read(65536, dtype='int16', always_2d=True)
                        if not len(block): break
                        residual.write(block.astype(np.float32))
                    residual.flush()

                def read(channel, start, length):
                    stream = residual if residual is not None else original
                    stream.seek(start)
                    dtype = 'float32' if residual is not None else 'int16'
                    return stream.read(length, dtype=dtype, always_2d=True)[:, channel].astype(np.float32)

                def write(channel, start, values):
                    residual.seek(start)
                    block = residual.read(len(values), dtype='float32', always_2d=True)
                    if len(block) != len(values): raise ValueError('原生余量写入范围不完整')
                    block[:, channel] = values
                    residual.seek(start)
                    residual.write(block)
                    residual.flush()

                result_file = job / 'native-components.jsonl'
                with result_file.open('x', encoding='utf8') as output:
                    for result in iter_native_window_results(read, parsed, sample_counts=[count] * channels,
                            sample_rate=rate, hop=settings['hop'], write_pcm=write if subtract else None):
                        output.write(json.dumps(result.as_record(), ensure_ascii=False, allow_nan=False) + '\n')
                        report(.1 + .7 * (result.index + 1) / len(parsed),
                            f'原生幅度／相位估计：{result.index + 1}/{len(parsed)}')
                if subtract:
                    residual.seek(0)
                    with sf.SoundFile(job / 'native-residual.wav', mode='w', format='WAV',
                            subtype='FLOAT', channels=channels, samplerate=rate) as target:
                        while True:
                            block = residual.read(65536, dtype='float32', always_2d=True)
                            if not len(block): break
                            target.write(block / np.float32(32768))
            manifest = {'format': 'RipXNativeComponentSequence', 'version': 1,
                'source': str(source), 'reference_binary_sha256': REFERENCE,
                'sample_rate': rate, 'frames': count, 'channels': channels,
                'configuration': settings, 'components': len(parsed), 'records': result_file.name,
                'residual': 'native-residual.wav' if subtract else None,
                'stage': 'native-raw-constant-frequency-estimation', 'public_model_used': False,
                'full_transcription_complete': False, 'native_runtime_differential_verified': False,
                'candidate_origin': 'explicit-caller-task',
                'limitations': ['候选频率和拟合／能量窗口必须由调用者明确提供。',
                    '未实现完整自动谐波调度、变频和滤波分支。',
                    '余量来自已恢复的 PCM16 分支及浮点扣除核；不等同原件整曲重建。']}
            write_json(job / 'native-component-sequence.json', manifest)
        write_json(state, {'status': 'complete', 'full_transcription_complete': False})
        report(1, '原生分量任务已完成；完整自动转录仍未接通',
            result=str(job / 'native-component-sequence.json'))
    except BaseException as error:
        write_json(state, {'status': 'failed', 'error': str(error)})
        raise


def run_initial_notes(request, report):
    """Connect genuine refined harmonic records to recovered note structures."""
    carrier = Path(request['harmonic_frames']).resolve(strict=True)
    if carrier.stat().st_size > 64 * 1024**2:
        raise ValueError('谐波中间数据超过此构建入口的 64 MiB 读取容量')
    document = json.loads(carrier.read_text(encoding='utf-8-sig'))
    if document.get('format') != 'RipXNativeHarmonicFrames' or document.get('version') != 1:
        raise ValueError('需要已细化的原生 0x4c 谐波帧；不能以谱峰或通用音符代替')
    if document.get('reference_binary_sha256') != REFERENCE:
        raise ValueError('原生中间记录的来源版本不匹配')
    frames = [base64.b64decode(value, validate=True) for value in document['frames_base64']]
    result = build_initial_notes_document(frames, rate_98a1ac=document['rate_98a1ac'],
        timestep_9c3720=document['timestep_9c3720'], component_slots=document['component_slots'])
    output = Path(request['job']).resolve()
    output.mkdir(parents=True, exist_ok=False)
    write_json(output / 'native-initial-notes.json', result)
    report(1, '原生初始音符结构已组装；代表音高及最终清理仍未完成',
        result=str(output / 'native-initial-notes.json'))
