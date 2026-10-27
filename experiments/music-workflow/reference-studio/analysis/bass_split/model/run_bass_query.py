"""One local cached BS-Locoformer query using the old actual bass estimate.

This is not the failed two-reference voice query. It asks for resemblance to
the original recording's model-derived bass, using stereo07 as the mixture.
The bass exemplar can contain bleed and need not share every layer in07.
"""
from __future__ import annotations
import hashlib,json,os,socket,sys,time
from pathlib import Path
ANALYSIS=Path(__file__).resolve().parents[2]
sys.path.insert(0,str(ANALYSIS/'mus3d_trial'))
import run_local as runtime
CASE=ANALYSIS.parent/'cases/phone-recording-20261023-233819'
OUT=CASE/'低音分离试验/model/bass-audio-query'
MIX=CASE/'hdemucs/context-44-54/other-estimate.wav'
REF=CASE/'hdemucs/context-44-54/bass-estimate.wav'


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main():
    OUT.mkdir(parents=True,exist_ok=True)
    def forbid(*_a,**_kw):
        raise RuntimeError('Network disabled during local bass query')
    socket.socket.connect=forbid
    import numpy as np
    import soundfile as sf
    import torch
    torch.set_num_threads(4);torch.set_num_interop_threads(2)
    os.chdir(runtime.REPO)
    from source_embedding_generator.separator_io import load_separator
    from source_embedding_generator import protocol
    from utils.torch_common import set_seed
    import inference
    started=time.perf_counter();set_seed(0)
    sep=load_separator(runtime.REPO/'checkpoints/BS-Locoformer_query',device='cpu',use_ema=False)
    mix,_=inference.load_segment(MIX,0.)
    reference,_=inference.load_segment(REF,0.)
    with torch.inference_mode():
        query=sep.query_adapter(sep.query_model(reference))
        np.save(OUT/'bass-query-embedding.npy',query.numpy())
        print('Separating07 using actual first-pass bass-estimate reference',flush=True)
        result=sep.sample(query.reshape(1,1,-1),mix=mix,query_is_embedding=True,
                          level=torch.tensor([protocol.LEVEL_STEM]))[0,0]
        audio=result.detach().float().cpu().numpy().T
        assert np.isfinite(audio).all()
        sf.write(OUT/'bass-query-estimate-context.wav',audio,44100,subtype='FLOAT')
    report=dict(method='Cached unchanged official query BS-Locoformer; actual model-derived bass audio exemplar',
        input=str(MIX),inputSha256=sha(MIX),reference=str(REF),referenceSha256=sha(REF),
        referenceIsOriginalSourceStem=False,referenceIsNoisyModelEstimate=True,
        level='stem',seed=0,threads=4,sampleRate=44100,channels=2,
        output='bass-query-estimate-context.wav',rms=float(np.sqrt(np.mean(audio**2))),
        peak=float(np.max(np.abs(audio))),elapsedSeconds=time.perf_counter()-started,
        audioUploaded=False,networkDisabled=True,devicePlayback=False,
        actualListeningPerformed=False,
        limitations=['No clean original bass reference',
                     'Query can select other low accompaniment or leak target melody',
                     'No assumption of two instruments, no new MIDI or synthesis'])
    (OUT/'query-manifest.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),'utf-8')
    print(json.dumps(report,ensure_ascii=False),flush=True)


if __name__=='__main__':
    main()
