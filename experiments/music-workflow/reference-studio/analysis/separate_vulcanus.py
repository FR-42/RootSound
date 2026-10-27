"""Local official Hybrid Demucs analysis. Downloads a model, never uploads audio.

CPU Python components are installed separately by the task owner into the
workspace cache. Output is explicitly a model estimate, not original stems.
"""
from pathlib import Path
import os,sys,time,json,hashlib
ROOT=Path(__file__).resolve().parents[4]
COMPONENTS=ROOT/'.cache'/'reference-python'
sys.path.insert(0,str(COMPONENTS))
os.environ.setdefault('TORCH_HOME',str(Path(__file__).resolve().parent/'.torch-cache'))
os.environ.setdefault('OMP_NUM_THREADS','4')
import numpy as np
from scipy.io import wavfile
import torch
import torchaudio

SOURCE=Path(r'D:\Sound\temp\music\Vulcanus.wav')
OUT=Path(__file__).resolve().parents[1]/'cases'/'Vulcanus'/'separated-estimate'
SOURCE_START=24.;SOURCE_END=36.

def main():
    started=time.monotonic();torch.set_num_threads(4)
    try:torch.set_num_interop_threads(1)
    except RuntimeError:pass
    OUT.mkdir(parents=True,exist_ok=True)
    rate,original=wavfile.read(SOURCE,mmap=True)
    assert rate==48000 and original.ndim==2 and original.shape[1]==2
    clip=np.asarray(original[round(SOURCE_START*rate):round(SOURCE_END*rate)],dtype=np.float32).copy()
    assert np.isfinite(clip).all()
    bundle=torchaudio.pipelines.HDEMUCS_HIGH_MUSDB_PLUS
    model_rate=bundle.sample_rate
    print(f'Loading official HDEMUCS_HIGH_MUSDB_PLUS at {model_rate} Hz; audio remains local.',flush=True)
    model=bundle.get_model().eval().to('cpu')
    names=list(model.sources)
    assert set(names)=={'drums','bass','other','vocals'}
    input_audio=torchaudio.functional.resample(torch.from_numpy(clip.T.copy()),rate,model_rate)
    pad=round(1.5*model_rate)
    work=torch.nn.functional.pad(input_audio,(pad,pad),mode='reflect')
    window=round(6*model_rate);stride=round(3*model_rate);total=work.shape[-1]
    starts=list(range(0,max(1,total-window+1),stride))
    if starts[-1]!=total-window:starts.append(total-window)
    output=torch.zeros((len(names),2,total),dtype=torch.float32)
    weight=torch.sin(torch.pi*(torch.arange(window,dtype=torch.float32)+.5)/window).square().clamp_min(.0001)
    sums=torch.zeros(total)
    with torch.inference_mode():
        for index,start in enumerate(starts):
            piece=work[:,start:start+window]
            center=piece.mean();scale=piece.mean(0).std().clamp_min(1e-6)
            estimated=model(((piece-center)/scale)[None])[0]
            assert estimated.shape==(len(names),2,window),estimated.shape
            estimated=estimated*scale+center/len(names)
            output[:,:,start:start+window]+=estimated*weight
            sums[start:start+window]+=weight
            print(f'Analysis window {index+1}/{len(starts)} complete ({time.monotonic()-started:.1f}s).',flush=True)
        output/=sums[None,None,:].clamp_min(1e-8)
        output=output[:,:,pad:pad+input_audio.shape[-1]]
        output=torchaudio.functional.resample(output,model_rate,rate)
    result=output.numpy()
    if result.shape[-1]<len(clip):result=np.pad(result,((0,0),(0,0),(0,len(clip)-result.shape[-1])))
    result=result[:,:,:len(clip)]
    descriptions=[]
    for i,name in enumerate(names):
        stereo=result[i].T.copy().astype(np.float32)
        assert np.isfinite(stereo).all()
        destination=OUT/(name+'.wav');wavfile.write(destination,rate,stereo)
        descriptions.append(dict(name=name,file=destination.name,rms=float(np.sqrt(np.mean(stereo.astype(np.float64)**2))),
            peak=float(abs(stereo).max()),sha256=hashlib.sha256(destination.read_bytes()).hexdigest().upper()))
    reconstructed=result.sum(0).T
    residual=clip-reconstructed
    wavfile.write(OUT/'model-mixture-residual.wav',rate,residual.astype(np.float32))
    evidence=dict(model='torchaudio.pipelines.HDEMUCS_HIGH_MUSDB_PLUS',
        officialDocumentation='https://docs.pytorch.org/audio/2.7/pipelines.html#hdemucs-high-musdb-plus',
        torchVersion=torch.__version__,torchaudioVersion=torchaudio.__version__,
        sourceStartSeconds=SOURCE_START,sourceEndSeconds=SOURCE_END,sourceSampleRate=rate,
        modelSampleRate=model_rate,channels=2,frames=len(clip),windowSeconds=6,overlapSeconds=3,paddingSeconds=1.5,
        method='Official locally executed model; mixture mean/std normalization; raised-cosine overlap-add; no audio uploaded.',
        caveat='Estimated sources can contain bleed, missing transients, musical artifacts or mistaken allocation. These are not original stems.',
        elapsedSeconds=time.monotonic()-started,stems=descriptions,
        inputRms=float(np.sqrt(np.mean(clip.astype(np.float64)**2))),
        residualRms=float(np.sqrt(np.mean(residual.astype(np.float64)**2))),
        sourceSha256=hashlib.sha256(SOURCE.read_bytes()).hexdigest().upper())
    (OUT/'separation-evidence.json').write_text(json.dumps(evidence,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps(evidence,ensure_ascii=False,indent=2),flush=True)

if __name__=='__main__':main()
