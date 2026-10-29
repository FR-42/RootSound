"""Application boundary for recovered native stages; never imports an AI model."""
from dataclasses import asdict
from pathlib import Path
import hashlib
import json
import subprocess
import tempfile

import numpy as np
import soundfile as sf
from native_spectral import native_configuration, iter_pcm_spectral_frames

TARGET_SHA256 = '5f088fa4fbbe1759ef75d8034c79f33c846e3bf5f13d5048dd95a6614d2ad441'

def analyze_audio(request, report, config):
    source = Path(request['input']).resolve(strict=True)
    job = Path(request['job']).resolve()
    job.mkdir(parents=True, exist_ok=False)
    status = job / 'status.json'
    def save_status(value):
        status.write_text(json.dumps(value, ensure_ascii=False, indent=2), encoding='utf8')
    save_status({'status': 'running', 'algorithm': 'ripx-static-native-spectral'})
    try:
        with tempfile.TemporaryDirectory(prefix='.native-', dir=job) as scratch:
            pcm_path = Path(scratch) / 'decoded.wav'
            report(.02, '解码为原生已确认的 16 位 PCM 分支；不改变原文件')
            decoded = subprocess.run([config['ffmpeg'], '-v', 'error', '-nostdin', '-i', str(source),
                '-map', '0:a:0', '-vn', '-c:a', 'pcm_s16le', '-f', 'wav', str(pcm_path)],
                capture_output=True, creationflags=getattr(subprocess, 'CREATE_NO_WINDOW', 0))
            if decoded.returncode: raise RuntimeError(decoded.stderr.decode('utf8', errors='replace')[-3000:])
            total_peaks = 0
            with sf.SoundFile(pcm_path) as pcm:
                settings = native_configuration(pcm.samplerate)
                from native_fft import forward_real as fft
                backend = 'recovered-fft-python'
                try:
                    from native_fft_numba import forward_real as compiled_fft
                    from numba.core.errors import NumbaError
                except (ImportError, OSError) as error:
                    report(.03, f'原生 FFT 使用 Python 实现（编译器不可用：{error}）')
                else:
                    report(.03, '编译同一原生 FFT，保留运算顺序；不加载 AI 模型')
                    try:
                        for length in (settings['base_window'] * 2, settings['base_window'] * 4):
                            compiled_fft(np.zeros(length))
                    except NumbaError as error:
                        report(.04, f'编译不可用，使用同一原生 FFT 的 Python 实现：{error}')
                    else:
                        fft = compiled_fft
                        backend = 'recovered-fft-numba-strict-no-cache'
                frames, channels, rate = pcm.frames, pcm.channels, pcm.samplerate
                if not frames or channels > 8: raise ValueError('原生分析入口支持非空的 1–8 声道输入')
                count = (frames + settings['hop'] - 1) // settings['hop']
                # Read per window; never retain whole-song decoded PCM or all spectra.
                for channel in range(channels):
                    def read(start, length):
                        pcm.seek(start)
                        return pcm.read(length, dtype='int16', always_2d=True)[:, channel].astype(np.float32)
                    with (job / f'channel-{channel + 1}-spectral-peaks.jsonl').open('x', encoding='utf8') as output:
                        for frame in iter_pcm_spectral_frames(read, sample_count=frames, sample_rate=rate, fft=fft):
                            frame['peaks'] = [asdict(peak) for peak in frame['peaks']]
                            total_peaks += len(frame['peaks'])
                            output.write(json.dumps(frame, ensure_ascii=False, allow_nan=False) + '\n')
                            if frame['frame_index'] % 128 == 0:
                                progress = (channel + (frame['frame_index'] + 1) / count) / channels
                                report(.05 + .9 * progress, f"原生双窗谱峰：声道 {channel + 1}/{channels}，帧 {frame['frame_index'] + 1}/{count}")
            with source.open('rb') as original:
                digest = hashlib.file_digest(original, 'sha256').hexdigest()
            summary = {
                'format': 'RipXStaticNativeAnalysis', 'version': 1, 'source': str(source),
                'source_sha256': digest,
                'reference_binary_sha256': TARGET_SHA256, 'algorithm': 'ripx-static-native-spectral',
                'public_model_used': False, 'device': 'cpu', 'fft_backend': backend, 'native_runtime_differential_verified': False,
                'configuration': settings, 'frames': frames, 'channels': channels,
                'analysis_frames_per_channel': count, 'spectral_peaks': total_peaks,
                'completed_stages': ['signed-int16 input representation', 'native N/H selection',
                    'symmetric window', 'two-resolution FFT', 'native spectral peak selection'],
                'unavailable_stages': ['full candidate/trajectory pipeline', 'final musical note segmentation',
                    'complete note-level audio resynthesis', 'native-equivalent MIDI from input audio'],
                'limitations': ['Static-derived, not verified against an original RipX run.',
                    'FFT uses recovered radix-4/2 and packed-real recombination; standard sin/cos roundoff is not original-runtime verified.',
                    'Task-specific leading/trailing context is not reconstructed; file boundaries are zero-padded.',
                    'FFT-bin phase is not final refined harmonic phase.',
                    'This output is spectral analysis, not a separated-stem or note project.']}
            (job / 'native-analysis.json').write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding='utf8')
            save_status({'status': 'complete', 'full_transcription_complete': False})
            report(1, f'原生谱峰阶段已完成：{total_peaks} 个谱峰；最终音符与完整重建尚未完成', result=str(job / 'native-analysis.json'))
    except BaseException as error:
        save_status({'status': 'failed', 'error': str(error)})
        raise


def apply_identified_components(request, report):
    """Execute the recovered PCM kernel on explicit components, not guessed notes.

    Input is deliberately restricted to the recovered signed-int16 WAV domain.
    A future recovered estimator supplies the component descriptors. No AI or
    generic pitch estimator is used when those descriptors are absent.
    """
    import os
    import math
    from native_pcm_component import add_component_inplace
    source = Path(request['input']).resolve(strict=True)
    output = Path(request['output']).resolve()
    if output == source or output.exists(): raise ValueError('不能覆盖原文件或现有输出')
    components = request.get('components')
    if not isinstance(components, list) or not components:
        raise ValueError('尚未恢复自动谐波参数估计；必须提供明确的原生分量，绝不回退到其他识别器')
    info = sf.info(source)
    if info.format != 'WAV' or info.subtype != 'PCM_16' or info.frames * info.channels * 4 > 512 * 1024**2:
        raise ValueError('当前已恢复入口仅接受不超过 512 MiB 解码容量的 PCM16 WAV')
    data, rate = sf.read(source, dtype='int16', always_2d=True)
    data = data.astype(np.float32)
    for index, component in enumerate(components):
        channel = component['channel']
        if not isinstance(channel, int) or not 0 <= channel < info.channels: raise ValueError('声道无效')
        if not all(math.isfinite(float(component[key])) for key in ('amplitude', 'frequency', 'phase_at_start')):
            raise ValueError('分量参数必须是有限值')
        add_component_inplace(data[:, channel], component['start'], component['hop'], rate,
            component['amplitude'], component['frequency'], component['phase_at_start'])
        report((index + 1) / len(components) * .95, f'原生 PCM 分量处理 {index + 1}/{len(components)}')
    output.parent.mkdir(parents=True, exist_ok=True)
    handle, temporary = tempfile.mkstemp(prefix='.native-component-', suffix='.wav', dir=output.parent)
    os.close(handle)
    try:
        sf.write(temporary, data / np.float32(32768), rate, format='WAV', subtype='FLOAT')
        os.link(temporary, output)  # atomic no-overwrite publication
    finally:
        Path(temporary).unlink(missing_ok=True)
    report(1, '原生定点相位／查表／坡窗 PCM 核已执行；此操作不包含自动音符识别', result=str(output))
