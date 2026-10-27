"""Run released MuS3D query BS-Locoformer on an explicit local ten-second clip.

Model architecture, weights, SEG settings, and classification are official.
Adaptations: cached frozen-encoder paths; CPU threads; sequential queries to
bound memory; lossless FLOAT WAV rather than official default PCM16 output.
No synthesis, resynthesis, per-stem normalisation, device playback, or upload.
"""
from __future__ import annotations
import argparse, hashlib, json, os, shutil, socket, sys, time
from pathlib import Path

ROOT = Path(r'D:\RootSound')
CACHE = ROOT / '.cache/mus3d-experiment'
REPO = CACHE / 'MuS3D-main'
sys.path[:0] = [str(ROOT / '.cache/reference-python'),
                str(CACHE / 'torchvision-python'), str(CACHE / 'python'),
                str(CACHE / 'dacvae-414c20785fc3a28373073ea8ef7a1316eeeaca6e'),
                str(REPO / 'src')]
os.environ.update(TORCH_HOME=str(CACHE / 'torch-cache'),
                  HF_HOME=str(CACHE / 'hf-cache'),
                  HUGGINGFACE_HUB_CACHE=str(CACHE / 'hf-cache/hub'),
                  NUMBA_CACHE_DIR=str(CACHE / 'numba-cache'),
                  MKL_THREADING_LAYER='SEQUENTIAL', NUMBA_THREADING_LAYER='workqueue',
                  OMP_NUM_THREADS='4', OPENBLAS_NUM_THREADS='1',
                  HF_HUB_OFFLINE='1',
                  HF_HUB_DISABLE_TELEMETRY='1', WANDB_MODE='disabled')

def digest(path):
    with path.open('rb') as stream:
        return hashlib.file_digest(stream, 'sha256').hexdigest()

def main():
    p = argparse.ArgumentParser()
    p.add_argument('--input', required=True, type=Path)
    p.add_argument('--output', required=True, type=Path)
    p.add_argument('--level', choices=['track', 'stem'], default='track')
    p.add_argument('--seed', type=int, default=0)
    args = p.parse_args()
    args.output.mkdir(parents=True, exist_ok=True)
    passt = CACHE / 'downloads/openmic-passt-s-f128-10sec-p16-s10-ap.85.pt'
    hub = CACHE / 'torch-cache/hub/checkpoints' / passt.name
    hub.parent.mkdir(parents=True, exist_ok=True)
    if not hub.exists():
        shutil.copyfile(passt, hub)

    # All inference sockets are forbidden: source audio cannot leave this process.
    def forbid_network(*_a, **_kw):
        raise RuntimeError('Network disabled during local audio inference')
    socket.socket.connect = forbid_network
    import numpy as np
    import soundfile as sf
    import torch
    torch.set_num_threads(4)
    torch.set_num_interop_threads(2)
    from query_conditioned_dit.codec import DacVaeCodec
    codec_init = DacVaeCodec.__init__
    def local_codec_init(self, *a, **kw):
        kw['model_id'] = str(CACHE / 'downloads/dacvae-watermarked__weights.pth')
        codec_init(self, *a, **kw)
    DacVaeCodec.__init__ = local_codec_init
    from source_embedding_generator.separator_io import load_seg, load_separator
    from classifiers.stem_classifier import StemClassifier
    from utils.torch_common import set_seed
    from source_embedding_generator import protocol
    import inference
    os.chdir(REPO)
    t0 = time.perf_counter()
    set_seed(args.seed)
    print('Loading official SEG and frozen encoders', flush=True)
    seg = load_seg(REPO / 'checkpoints/SEG_mixemb', device='cpu', use_ema=False)
    print('Loading official query BS-Locoformer', flush=True)
    sep = load_separator(REPO / 'checkpoints/BS-Locoformer_query', device='cpu', use_ema=False)
    clf = StemClassifier.load(REPO / 'checkpoints/classifiers/stem_classifier_pcatrain.pkl')
    clf.check_basis(seg)
    stereo, start = inference.load_segment(args.input, 0.0)
    mono = stereo.mean(1, keepdim=True)
    level = protocol.LEVEL_TRACK if args.level == 'track' else protocol.LEVEL_STEM
    timings = {'loadSeconds': time.perf_counter() - t0}
    print('Discovering unnamed sources', flush=True)
    td = time.perf_counter()
    with torch.inference_mode():
        run = seg.inference(mono, level=level, max_steps=16, steps=32,
                            churn=0.1, audio=False)
        timings['discoverSeconds'] = time.perf_counter() - td
        names = list(clf.predict(run['emb'], args.level))
        queries = seg._as_queries(run['emb'], 'cpu')
        lvls = seg._level_for(run, queries.shape[0], 'cpu')
        print('Discovered', len(names), 'model labels:', names, flush=True)
        sf.write(args.output / 'mixture-mono.wav', mono[0].numpy().T, 44100, subtype='FLOAT')
        sf.write(args.output / 'mixture-stereo.wav', stereo[0].numpy().T, 44100, subtype='FLOAT')
        outputs = []
        for i, (query, name) in enumerate(zip(queries, names)):
            ts = time.perf_counter()
            print(f'Separating candidate {i + 1}/{len(names)} ({name}, model guess)', flush=True)
            estimate = sep.sample(query.reshape(1, 1, -1), mix=stereo,
                                  query_is_embedding=True, level=lvls[i:i+1])[0, 0]
            waveform = estimate.detach().float().cpu().numpy().T
            if not np.isfinite(waveform).all():
                raise RuntimeError('Nonfinite model output')
            filename = f'{i + 1:02d}-{inference.slug(name)}.wav'
            sf.write(args.output / filename, waveform, 44100, subtype='FLOAT')
            outputs.append({'file': filename, 'modelLabel': name,
                            'stopCosine': float(run['stop_cos'][i]),
                            'rms': float(np.sqrt(np.mean(waveform ** 2))),
                            'peak': float(np.max(np.abs(waveform))),
                            'seconds': time.perf_counter() - ts})
            print('Written', filename, 'seconds', outputs[-1]['seconds'], flush=True)
    timings['totalSeconds'] = time.perf_counter() - t0
    np.savez(args.output / 'discovery-embeddings.npz', embeddings=run['emb'],
             stop_cos=run['stop_cos'])
    receipt = {'method': 'MuS3D SEG_mixemb + BS-Locoformer_query',
               'sourceRepository': 'https://github.com/REMUS-Aalto/MuS3D',
               'checkpoints': 'https://huggingface.co/remus-aalto/MuS3D',
               'input': str(args.input), 'inputSha256': digest(args.input),
               'level': args.level, 'seed': args.seed, 'SEGsteps': 32,
               'SEGchurn': 0.1, 'maxSteps': 16, 'threads': 4,
               'networkDisabledDuringInference': True, 'audioUploaded': False,
               'outputFormat': '44.1 kHz stereo FLOAT, no individual normalisation',
               'adaptations': ['local encoder checkpoint paths', 'CPU thread limit',
                               'sequential MKL to avoid duplicate OpenMP runtimes',
                               'sequential independent query inference', 'FLOAT output'],
               'labelsAreModelGuesses': True, 'timings': timings, 'outputs': outputs}
    (args.output / 'run-manifest.json').write_text(json.dumps(receipt, ensure_ascii=False, indent=2), 'utf-8')
    (args.output / 'trace.txt').write_text('\n'.join(
        [f'level={args.level} seed={args.seed} SEGsteps=32 churn=0.1 CPUthreads=4'] +
        [f'{x["file"]} model_label={x["modelLabel"]} stop_cos={x["stopCosine"]:+.4f}' for x in outputs]) + '\n', 'utf-8')
    print(json.dumps(receipt, ensure_ascii=False), flush=True)

if __name__ == '__main__':
    main()
