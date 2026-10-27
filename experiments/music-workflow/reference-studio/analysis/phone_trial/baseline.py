"""Cached official four-stem baseline, not a targeted lead extraction.

Reads the supplied recording locally. It cannot download models or upload audio.
Output source names are model estimates and do not identify the desired timbre.
"""
from pathlib import Path
import hashlib
import json
import os
import sys
import time

HERE = Path(__file__).resolve().parent
STUDIO = HERE.parents[1]
ROOT = HERE.parents[4]
sys.path.insert(0, str(ROOT / '.cache' / 'reference-python'))
os.environ['TORCH_HOME'] = str(HERE.parent / '.torch-cache')
os.environ.setdefault('OMP_NUM_THREADS', '4')

import numpy as np
from scipy.io import wavfile
import torch
import torchaudio

SOURCE = Path(r'D:\Sound\temp\music\手机录音-20261023-233819.wav')
EXPECTED_SHA = '5dc9759718578315815c8119b3cb4e54e26f60c0401a6e3fa69f912a84ae8f58'
OUT = STUDIO / 'cases' / 'phone-recording-20261023-233819' / 'hdemucs'
CONTEXT_START, CONTEXT_END = 44.0, 54.0
TARGET_START, TARGET_END = 45.0, 53.0


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def stats(audio):
    return dict(rms=float(np.sqrt(np.mean(audio.astype(np.float64) ** 2))),
                peak=float(np.abs(audio).max()), frames=len(audio))


def write_clip(folder, name, audio, rate):
    path = folder / (name + '.wav')
    assert np.isfinite(audio).all(), name
    wavfile.write(path, rate, audio.astype(np.float32))
    return dict(file=str(path.relative_to(OUT)), sha256=sha(path), **stats(audio))


def main():
    started = time.monotonic()
    assert sha(SOURCE) == EXPECTED_SHA, 'Source identity differs from task input'
    torch.set_num_threads(4)
    try:
        torch.set_num_interop_threads(1)
    except RuntimeError:
        pass

    def no_download(*args, **kwargs):
        raise RuntimeError('Only existing cached official model weights are permitted')

    torch.hub.download_url_to_file = no_download
    bundle = torchaudio.pipelines.HDEMUCS_HIGH_MUSDB_PLUS
    model = bundle.get_model().eval().to('cpu')
    rate, original = wavfile.read(SOURCE, mmap=True)
    assert rate == 48000 and original.ndim == 2 and original.shape[1] == 2
    assert original.dtype == np.float32, original.dtype
    clip = np.asarray(original[round(CONTEXT_START * rate):round(CONTEXT_END * rate)],
                      dtype=np.float32).copy()
    assert len(clip) == round((CONTEXT_END - CONTEXT_START) * rate)
    assert np.isfinite(clip).all()
    names = list(model.sources)
    assert set(names) == {'drums', 'bass', 'other', 'vocals'}
    model_rate = bundle.sample_rate
    input_audio = torchaudio.functional.resample(torch.from_numpy(clip.T.copy()), rate, model_rate)
    pad = round(1.5 * model_rate)
    work = torch.nn.functional.pad(input_audio, (pad, pad), mode='reflect')
    window, stride = round(6 * model_rate), round(3 * model_rate)
    total = work.shape[-1]
    starts = list(range(0, max(1, total - window + 1), stride))
    if starts[-1] != total - window:
        starts.append(total - window)
    output = torch.zeros((len(names), 2, total), dtype=torch.float32)
    weight = torch.sin(torch.pi * (torch.arange(window, dtype=torch.float32) + .5) / window).square().clamp_min(.0001)
    sums = torch.zeros(total)
    with torch.inference_mode():
        for index, start in enumerate(starts):
            piece = work[:, start:start + window]
            center = piece.mean()
            scale = piece.mean(0).std().clamp_min(1e-6)
            estimated = model(((piece - center) / scale)[None])[0]
            assert estimated.shape == (len(names), 2, window)
            estimated = estimated * scale + center / len(names)
            output[:, :, start:start + window] += estimated * weight
            sums[start:start + window] += weight
            print(f'Baseline window {index + 1}/{len(starts)}; elapsed {time.monotonic() - started:.2f}s', flush=True)
        output /= sums[None, None, :].clamp_min(1e-8)
        output = output[:, :, pad:pad + input_audio.shape[-1]]
        output = torchaudio.functional.resample(output, model_rate, rate)
    result = output.numpy()
    if result.shape[-1] < len(clip):
        result = np.pad(result, ((0, 0), (0, 0), (0, len(clip) - result.shape[-1])))
    result = result[:, :, :len(clip)]
    residual = clip - result.sum(0).T
    crop_start = round((TARGET_START - CONTEXT_START) * rate)
    crop_end = round((TARGET_END - CONTEXT_START) * rate)
    files = []
    for label, selected in [('context-44-54', slice(None)), ('target-45-53', slice(crop_start, crop_end))]:
        folder = OUT / label
        folder.mkdir(parents=True, exist_ok=True)
        files.append(write_clip(folder, 'original', clip[selected], rate))
        for index, name in enumerate(names):
            files.append(write_clip(folder, name + '-estimate', result[index].T[selected], rate))
        files.append(write_clip(folder, 'model-mixture-residual', residual[selected], rate))
    assert sha(SOURCE) == EXPECTED_SHA, 'Source changed during processing'
    evidence = dict(
        model='torchaudio.pipelines.HDEMUCS_HIGH_MUSDB_PLUS',
        officialDocumentation='https://docs.pytorch.org/audio/2.7/pipelines.html#hdemucs-high-musdb-plus',
        source=str(SOURCE), sourceSha256=EXPECTED_SHA, sourceUnchanged=True,
        contextStartSeconds=CONTEXT_START, contextEndSeconds=CONTEXT_END,
        targetStartSeconds=TARGET_START, targetEndSeconds=TARGET_END,
        sourceSampleRate=rate, modelSampleRate=model_rate, channels=2,
        torchVersion=torch.__version__, torchaudioVersion=torchaudio.__version__,
        device='cpu', cpuThreads=4, windowSeconds=6, overlapSeconds=3, paddingSeconds=1.5,
        method='Cached official model, mean/std normalized, raised-cosine overlap-add. Local processing; downloads blocked.',
        caveat='Four broad source estimates only. Not a targeted separation of the lead timbre. Bleed, missing events, artifacts, and mistaken allocation remain possible. No semantic or listening success is claimed.',
        elapsedSeconds=time.monotonic() - started, files=files,
        contextInput=stats(clip), contextResidual=stats(residual))
    manifest = OUT / 'separation-evidence.json'
    manifest.write_text(json.dumps(evidence, ensure_ascii=False, indent=2), encoding='utf-8')
    print(json.dumps(dict(manifest=str(manifest), elapsedSeconds=evidence['elapsedSeconds'],
                         sourceUnchanged=True, files=len(files)), ensure_ascii=False), flush=True)


if __name__ == '__main__':
    main()
