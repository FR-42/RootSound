"""Two cached query-BS-Locoformer trials using stereo-derived noisy exemplars.

Mid/Side are observation references, NOT instruments. PaSST averages query
channels, so Side is copied into both channels rather than passed as [S,-S].
The separator still receives unchanged stereo 07. No MIDI, new synthesis,
downloads, model-weight changes, desktop access, or device playback.
"""
from __future__ import annotations

import hashlib
import json
import os
from pathlib import Path
import socket
import sys
import time

BASE = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(BASE / 'mus3d_trial'))
import run_local as runtime

CASE = BASE.parent / 'cases/phone-recording-20261023-233819'
OUT = CASE / '声部分离试验/model'
SOURCE = CASE / '试听/07-普通分轨基线.wav'


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    def forbid(*_args, **_kwargs):
        raise RuntimeError('Network prohibited during local audio inference')
    socket.socket.connect = forbid
    import numpy as np
    import soundfile as sf
    import torch
    torch.set_num_threads(4)
    torch.set_num_interop_threads(2)
    os.chdir(runtime.REPO)
    from source_embedding_generator.separator_io import load_separator
    from source_embedding_generator import protocol
    from utils.torch_common import set_seed
    import inference

    start = time.perf_counter()
    source_hash = digest(SOURCE)
    set_seed(0)
    sep = load_separator(runtime.REPO / 'checkpoints/BS-Locoformer_query',
                         device='cpu', use_ema=False)
    mix, _ = inference.load_segment(SOURCE, 0.)
    mid = mix.mean(dim=1, keepdim=True)
    side = (mix[:, :1] - mix[:, 1:2]) * .5
    references = [mid.repeat(1, 2, 1), side.repeat(1, 2, 1)]
    queries = []
    with torch.inference_mode():
        for name, reference in zip(['mid', 'side'], references):
            sf.write(OUT / f'reference-{name}-mixed.wav',
                     reference[0].numpy().T, 44100, subtype='FLOAT')
            queries.append(sep.query_adapter(sep.query_model(reference)))
        cosine = float(torch.nn.functional.cosine_similarity(
            queries[0], queries[1], dim=-1))
        print('Projected reference cosine', cosine, flush=True)
        np.savez(OUT / 'query-embeddings.npz',
                 mid=queries[0].numpy(), side=queries[1].numpy())
        outputs = []
        for name, query in zip(['mid', 'side'], queries):
            tick = time.perf_counter()
            print('Separating query', name, flush=True)
            estimate = sep.sample(query.reshape(1, 1, -1), mix=mix,
                                  query_is_embedding=True,
                                  level=torch.tensor([protocol.LEVEL_TRACK]))[0, 0]
            audio = estimate.detach().float().cpu().numpy().T
            if not np.isfinite(audio).all():
                raise RuntimeError('Nonfinite estimate')
            file = f'estimate-query-{name}.wav'
            sf.write(OUT / file, audio, 44100, subtype='FLOAT')
            outputs.append(dict(file=file, seconds=time.perf_counter()-tick,
                                rms=float(np.sqrt(np.mean(audio**2))),
                                peak=float(np.max(np.abs(audio)))))
            print('Written', file, outputs[-1]['seconds'], flush=True)
    report = dict(
        method='Released query BS-Locoformer, PaSST/PCA audio exemplars, track level',
        source=str(SOURCE), sourceSha256=source_hash,
        sourceUnchanged=digest(SOURCE)==source_hash,
        sourceIntervalSeconds=[45,53], inputModelRate=44100,
        inferenceInput='Unchanged stereo 07, resampled by official loader and padded to 10 s',
        queryReferences='Full 8-second mid and side observations of 07, each duplicated in phase; both mixed, not clean timbres',
        whyDuplicateSide='Official PaSST averages query channels; [S,-S] would cancel',
        projectedReferenceCosine=cosine,
        outputs=outputs, elapsedSeconds=time.perf_counter()-start,
        networkDisabled=True, audioUploaded=False, downloads=False,
        devicePlayback=False, timbreCountConfirmed=False,
        limitations=['Queries differ in stereo content and may still select the same instrument family',
                     'No pure exemplar for the alleged second timbre is available',
                     'Two estimates are not guaranteed independent sources or an exact partition',
                     'Waveforms are model estimates, not original author stems',
                     'The model was not retrained or adjusted after seeing the results'])
    (OUT / 'query-run-manifest.json').write_text(
        json.dumps(report, ensure_ascii=False, indent=2), 'utf-8')
    print(json.dumps(report, ensure_ascii=False), flush=True)


if __name__ == '__main__':
    main()
