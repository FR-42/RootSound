"""Local, cached official Hybrid Demucs. Disk-backed outputs; no network or playback.

6 s windows / 3 s stride, 0.75 s context and raised-cosine overlap-add.
Only drums, bass and vocals are returned; the host computes the complementary
other/residual from the original, retaining full input reconstruction.
"""
import hashlib
import json
import os
from pathlib import Path
import socket
import sys
import time
import traceback
import warnings

def forbid(*args, **kwargs):
    raise RuntimeError('This worker only uses local cached weights; network is disabled')

socket.socket.connect = forbid
socket.create_connection = forbid

def report(fraction, message):
    print(json.dumps(dict(progress=fraction, message=message), ensure_ascii=False), flush=True)

def gpu_device(torch):
    if torch.cuda.is_available():
        return torch.device('cuda'), torch.cuda.get_device_name(0)
    if hasattr(torch, 'xpu') and torch.xpu.is_available():
        return torch.device('xpu'), torch.xpu.get_device_name(0)
    raise RuntimeError('当前运行库没有可用的 GPU。请检查显卡驱动和 GPU 运行组件。')

def main(request):
    started = time.monotonic()
    sys.path.insert(0, request['packages'])
    if request.get('support') and request['support'] != request['packages']:
        sys.path.insert(1, request['support'])
    dll_directories = []
    if sys.platform == 'win32':
        for relative in ['Library/bin', 'bin', 'torch/lib']:
            directory = Path(request['packages']) / relative
            if directory.is_dir():
                dll_directories.append(os.add_dll_directory(str(directory)))
                os.environ['PATH'] = str(directory) + os.pathsep + os.environ.get('PATH', '')
    os.environ.setdefault('OMP_NUM_THREADS', '4')
    if not request.get('probe'):
        report(.01, '正在检查本地模型运行设备…')
    import numpy as np
    import torch
    import torchaudio
    torch.hub.download_url_to_file = forbid
    torch.set_num_threads(4)
    torch.set_num_interop_threads(1)
    if request.get('probe'):
        device, name = gpu_device(torch)
        with torch.inference_mode():
            test = torch.ones((64, 64), device=device)
            result = (test @ test).cpu()
            assert torch.isfinite(result).all() and result[0, 0] == 64
        print(json.dumps(dict(available=True, backend=device.type, name=name, torch=torch.__version__), ensure_ascii=False), flush=True)
        return
    device, name = gpu_device(torch) if request.get('device') == 'gpu' else (torch.device('cpu'), 'CPU')
    report(.015, f'正在加载乐器模型 · {name}（{device.type.upper()}）…')
    weight_path = Path(request['weights'])
    with weight_path.open('rb') as file:
        digest = hashlib.file_digest(file, 'sha256').hexdigest()
    if digest != 'a004b2790d73ffeaa535db458a1a79b539dfdbafbccc31f275d07e632ebd7816':
        raise RuntimeError('Cached model weights differ from the locally verified model')
    names = ['drums', 'bass', 'other', 'vocals']
    model = torchaudio.models.hdemucs_high(sources=names)
    model.load_state_dict(torch.load(weight_path, map_location='cpu', weights_only=True))
    model.eval().to(device)
    if next(model.parameters()).device.type != device.type:
        raise RuntimeError('Model parameters were not moved to the selected device')

    rate, channels, frames = int(request['rate']), int(request['channels']), int(request['frames'])
    assert channels in (1, 2) and frames > 0
    original = np.memmap(request['input'], dtype='<f4', mode='r', shape=(frames, channels))
    outputs = [np.memmap(path, dtype='<f4', mode='w+', shape=(frames, channels)) for path in request['outputs']]
    counts = np.memmap(request['sums'], dtype='<f4', mode='w+', shape=(frames,))
    window, stride, pad = 6 * rate, 3 * rate, round(.75 * rate)
    starts = range(0, frames, stride)
    inference_seconds = 0.
    cpu_operator_fallback = False
    with torch.inference_mode():
        for index, start in enumerate(starts):
            take = min(window, frames - start)
            left, right = max(0, start - pad), min(frames, start + take + pad)
            piece = torch.from_numpy(np.asarray(original[left:right]).T.copy())
            if channels == 1:
                piece = piece.repeat(2, 1)
            missing_left, missing_right = pad - (start - left), pad - (right - start - take)
            piece = torch.nn.functional.pad(piece, (missing_left, missing_right))
            piece = torchaudio.functional.resample(piece, rate, 44100)
            center, scale = piece.mean(), piece.mean(0).std().clamp_min(1e-6)
            inference_start = time.monotonic()
            with warnings.catch_warnings(record=True) as captured:
                raw = model(((piece - center) / scale)[None].to(device))[0]
                if raw.device.type != device.type:
                    raise RuntimeError('Model output is not on the selected device')
                estimated = raw.cpu() * scale + center / 4
            if any('fallback from XPU to CPU' in str(item.message) for item in captured):
                cpu_operator_fallback = True
            for item in captured:
                print(str(item.message),file=sys.stderr,flush=True)
            inference_seconds += time.monotonic() - inference_start
            estimated = torchaudio.functional.resample(estimated, 44100, rate)
            estimated = estimated[:, :, pad:pad + take]
            if estimated.shape[-1] < take:
                estimated = torch.nn.functional.pad(estimated, (0, take - estimated.shape[-1]))
            weight = np.maximum(np.sin(np.pi * (np.arange(take, dtype=np.float32) + .5) / take) ** 2, .0001)
            for target, source_index in zip(outputs, [0, 1, 3]):
                data = estimated[source_index].numpy().T
                if channels == 1:
                    data = data.mean(axis=1, keepdims=True)
                if not np.isfinite(data).all():
                    raise RuntimeError('Model produced non-finite audio')
                target[start:start + take] += data * weight[:, None]
            counts[start:start + take] += weight
            report(.04 + .87 * (index + 1) / len(starts), f'{name} · 乐器分轨：{index + 1} / {len(starts)} 个时间窗')
        for start in range(0, frames, 65536):
            end = min(frames, start + 65536)
            divisor = np.maximum(np.asarray(counts[start:end]), 1e-8)
            for target in outputs:
                target[start:end] /= divisor[:, None]
        for target in outputs:
            target.flush()
    execution = dict(Device=name, Backend=device.type, UsedGpu=device.type != 'cpu', Seconds=time.monotonic()-started, InferenceSeconds=inference_seconds, CpuOperatorFallback=cpu_operator_fallback, Precision='fp32')
    Path(request['execution']).write_text(json.dumps(execution, ensure_ascii=False), encoding='utf-8')
    report(.94, f'{name} 处理完成，正在保留其余声部并校验对齐…')

if __name__ == '__main__':
    request = json.loads(Path(sys.argv[1]).read_text(encoding='utf-8-sig'))
    try:
        main(request)
    except Exception as error:
        if request.get('probe'):
            print(json.dumps(dict(available=False, reason=str(error)), ensure_ascii=False), flush=True)
        traceback.print_exc(file=sys.stderr)
        sys.exit(3 if request.get('device') == 'gpu' or request.get('probe') else 1)
