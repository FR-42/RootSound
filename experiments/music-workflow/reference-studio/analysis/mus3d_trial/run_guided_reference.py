"""Actual audio-exemplar query test, using a noisy model-derived reference.

This is NOT blind MuS3D and does NOT claim a clean or true isolated timbre.
The reference is encoded by the official PaSST + PCA query encoder and used
by the unchanged released BS-Locoformer, with the original mixture as input.
"""
from __future__ import annotations
import argparse, json, socket, time
from pathlib import Path
import run_local as runtime  # establishes the isolated cached runtime paths

def main():
    p = argparse.ArgumentParser()
    p.add_argument('--input', required=True, type=Path)
    p.add_argument('--reference', required=True, type=Path)
    p.add_argument('--output', required=True, type=Path)
    args = p.parse_args()
    args.output.mkdir(parents=True, exist_ok=True)
    def forbid_network(*_a, **_kw):
        raise RuntimeError('Network disabled during local audio inference')
    socket.socket.connect = forbid_network
    import numpy as np
    import soundfile as sf
    import torch
    torch.set_num_threads(4)
    torch.set_num_interop_threads(2)
    import os
    os.chdir(runtime.REPO)
    from source_embedding_generator.separator_io import load_separator
    from source_embedding_generator import protocol
    from utils.torch_common import set_seed
    import inference
    start = time.perf_counter()
    set_seed(0)
    print('Loading unchanged official query BS-Locoformer', flush=True)
    sep = load_separator(runtime.REPO / 'checkpoints/BS-Locoformer_query',
                         device='cpu', use_ema=False)
    mix, _ = inference.load_segment(args.input, 0.0)
    ref, _ = inference.load_segment(args.reference, 0.0)
    with torch.inference_mode():
        tq = time.perf_counter()
        print('Encoding actual noisy audio reference via PaSST and PCA', flush=True)
        query = sep.query_adapter(sep.query_model(ref))
        query_time = time.perf_counter() - tq
        np.save(args.output / 'actual-audio-query-embedding.npy', query.numpy())
        ts = time.perf_counter()
        # A model-derived 'other' stem can contain several voices, so request
        # stem granularity. This does not make the reference a clean source.
        level = torch.tensor([protocol.LEVEL_STEM], dtype=torch.long)
        print('Separating original mixture using actual reference embedding', flush=True)
        estimate = sep.sample(query.reshape(1, 1, -1), mix=mix,
                              query_is_embedding=True, level=level)[0, 0]
        audio = estimate.detach().float().cpu().numpy().T
        if not np.isfinite(audio).all():
            raise RuntimeError('Nonfinite model output')
        sf.write(args.output / '01-noisy-reference-guided.wav', audio, 44100, subtype='FLOAT')
        sf.write(args.output / 'mixture-stereo.wav', mix[0].numpy().T, 44100, subtype='FLOAT')
        sf.write(args.output / 'reference-noisy-model-derived.wav', ref[0].numpy().T, 44100, subtype='FLOAT')
    result = {
        'method': 'Official query BS-Locoformer with actual PaSST/PCA audio-exemplar query',
        'blindStemDiscovery': False,
        'referenceIsNoisyModelEstimate': True,
        'referenceIsCleanOriginalTimbre': False,
        'referenceDescription': 'HDEMUCS_HIGH_MUSDB_PLUS other-estimate from the same 44–54 s mixture; may contain several sounds and separation artifacts',
        'input': str(args.input), 'inputSha256': runtime.digest(args.input),
        'reference': str(args.reference), 'referenceSha256': runtime.digest(args.reference),
        'modelSource': 'https://huggingface.co/remus-aalto/MuS3D',
        'level': 'stem', 'seed': 0, 'threads': 4,
        'networkDisabledDuringInference': True, 'audioUploaded': False,
        'outputFormat': '44.1 kHz stereo FLOAT, no individual normalisation',
        'outputs': [{'file': '01-noisy-reference-guided.wav',
                     'modelLabel': 'noisy-reference-guided',
                     'rms': float(np.sqrt(np.mean(audio ** 2))),
                     'peak': float(np.max(np.abs(audio)))}],
        'timings': {'queryEncodingSeconds': query_time,
                    'separationSeconds': time.perf_counter() - ts,
                    'totalSeconds': time.perf_counter() - start},
        'limitations': ['Reference includes multiple possible sounds and artifacts',
                        'No guarantee of isolated target melody timbre',
                        'No filtering, resynthesis, or model-weight changes']}
    (args.output / 'run-manifest.json').write_text(json.dumps(result, ensure_ascii=False, indent=2), 'utf-8')
    print(json.dumps(result, ensure_ascii=False), flush=True)

if __name__ == '__main__':
    main()
