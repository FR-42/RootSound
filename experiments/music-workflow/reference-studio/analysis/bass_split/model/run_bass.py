"""Cached official bass-target re-separation of accepted07 stereo context.

This actually reruns HDEMUCS_HIGH_MUSDB_PLUS on its old 'other' estimate.
No claim is made that a model label establishes musical listening success.
No new model download, network connection, playback, or desktop operation.
"""
from __future__ import annotations
import hashlib
import json
import os
from pathlib import Path
import socket
import sys
import time

ANALYSIS=Path(__file__).resolve().parents[2]
STUDIO=ANALYSIS.parent
ROOT=STUDIO.parents[2]
CACHE=ROOT/'.cache/reference-python'
sys.path.insert(0,str(CACHE))
sys.path.insert(0,str(ANALYSIS/'phone_trial'))
os.environ['TORCH_HOME']=str(ANALYSIS/'.torch-cache')
os.environ['OMP_NUM_THREADS']='4'
os.environ['MKL_THREADING_LAYER']='SEQUENTIAL'

import numpy as np
from scipy.io import wavfile
from scipy import signal
from scipy.ndimage import gaussian_filter
from prepare_comparison import pcm24
import torch
import torchaudio

CASE=STUDIO/'cases/phone-recording-20261023-233819'
OUT=CASE/'低音分离试验/model'
SOURCE=CASE/'试听/07-普通分轨基线.wav'
CONTEXT=CASE/'hdemucs/context-44-54/other-estimate.wav'
EXPECTED='db79615e148120d8183bca8cddf7e4d881beefb09999b45ee9e215b24c672fac'


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def read(path):
    sr,a=wavfile.read(path)
    if a.dtype.kind=='i':
        a=a.astype(np.float64)/2**(a.dtype.itemsize*8-1)
    else:
        a=a.astype(np.float64)
    return sr,a


def rms(a):
    return float(np.sqrt(np.mean(a*a)))


def stft(a):
    return signal.stft(a.T,fs=48000,nperseg=4096,noverlap=3584,
                       boundary='zeros',padded=True)[2]


def inverse(z,n):
    return signal.istft(z,fs=48000,nperseg=4096,noverlap=3584,
                         boundary=True)[1].T[:n]


def band_diagnostics(source,part):
    # Use both channel powers; never a left/right average that can cancel
    # an intentionally widened bass or lead.
    nfft=16384
    f,p=signal.welch(source.T,48000,nperseg=nfft,axis=-1)
    _,q=signal.welch(part.T,48000,nperseg=nfft,axis=-1)
    p=p.mean(axis=0); q=q.mean(axis=0)
    result=[]
    for lo,hi in [(20,250),(250,700),(700,3000),(3000,12000)]:
        use=(f>=lo)&(f<hi)
        ps=float(np.sum(p[use]));qs=float(np.sum(q[use]))
        result.append(dict(hz=[lo,hi],sourcePower=ps,estimatePower=qs,
                           estimateToSourcePower=qs/max(ps,1e-20)))
    return result


def main():
    started=time.perf_counter()
    OUT.mkdir(parents=True,exist_ok=True)
    assert sha(SOURCE)==EXPECTED
    sr,source=read(SOURCE); sr2,context=read(CONTEXT)
    assert sr==sr2==48000
    assert source.shape==(384000,2) and context.shape==(480000,2)
    context_crop=context[48000:432000]
    input_error=float(np.max(np.abs(context_crop-source)))
    assert input_error<1.3e-7,input_error
    def forbid(*_args,**_kwargs):
        raise RuntimeError('No network/downloads permitted during local inference')
    socket.socket.connect=forbid
    torch.hub.download_url_to_file=forbid
    torch.set_num_threads(4)
    torch.set_num_interop_threads(1)
    bundle=torchaudio.pipelines.HDEMUCS_HIGH_MUSDB_PLUS
    model=bundle.get_model().eval().cpu()
    names=list(model.sources);model_sr=bundle.sample_rate
    audio=torchaudio.functional.resample(torch.from_numpy(context.T.copy()).float(),sr,model_sr)
    pad=round(1.5*model_sr)
    work=torch.nn.functional.pad(audio,(pad,pad),mode='reflect')
    window=round(6*model_sr); stride=round(3*model_sr)
    total=work.shape[-1]
    starts=list(range(0,total-window+1,stride))
    if starts[-1]!=total-window:
        starts.append(total-window)
    estimate=torch.zeros((len(names),2,total))
    weights=torch.sin(torch.pi*(torch.arange(window,dtype=torch.float32)+.5)/window).square().clamp_min(.0001)
    counts=torch.zeros(total)
    with torch.inference_mode():
        for i,start in enumerate(starts):
            piece=work[:,start:start+window]
            center=piece.mean()
            scale=piece.mean(0).std().clamp_min(1e-6)
            result=model(((piece-center)/scale)[None])[0]
            result=result*scale+center/len(names)
            estimate[:,:,start:start+window]+=result*weights
            counts[start:start+window]+=weights
            print('Actual bass re-separation window',i+1,'/',len(starts),flush=True)
        estimate/=counts[None,None].clamp_min(1e-8)
        estimate=estimate[:,:,pad:pad+audio.shape[-1]]
        estimate=torchaudio.functional.resample(estimate,model_sr,sr)
    estimates=estimate.numpy()[:,:,:len(context)]
    bass=estimates[names.index('bass')].T[48000:432000].astype(np.float64)
    assert bass.shape==source.shape and np.isfinite(bass).all()
    remainder=source-bass
    pcm24(OUT/'01-bass-target-estimate.wav',bass)
    pcm24(OUT/'02-07-minus-bass-estimate.wav',remainder)
    wavfile.write(OUT/'bass-target-estimate-float.wav',sr,bass.astype(np.float32))
    wavfile.write(OUT/'07-minus-bass-estimate-float.wav',sr,remainder.astype(np.float32))
    z=stft(source); bz=stft(bass)
    pb=np.mean(np.abs(bz)**2,axis=0)
    pr=np.mean(np.abs(z-bz)**2,axis=0)
    mask=gaussian_filter(pb/(pb+pr+1e-15),sigma=(.4,.5))
    projected=inverse(z*mask[None],len(source))
    projected_rest=source-projected
    pcm24(OUT/'03-bass-phase-preserved-projection.wav',projected)
    pcm24(OUT/'04-07-minus-projected-bass.wav',projected_rest)
    _,pbcheck=read(OUT/'01-bass-target-estimate.wav')
    _,prcheck=read(OUT/'02-07-minus-bass-estimate.wav')
    pcm_error=float(np.max(np.abs(pbcheck+prcheck-source)))
    assert pcm_error<2.5e-7
    bands=band_diagnostics(source,bass)
    file_stats=[]
    for file,a in [('01-bass-target-estimate.wav',bass),
                   ('02-07-minus-bass-estimate.wav',remainder),
                   ('03-bass-phase-preserved-projection.wav',projected),
                   ('04-07-minus-projected-bass.wav',projected_rest)]:
        file_stats.append(dict(file=file,rms=rms(a),peak=float(np.max(np.abs(a))),
                               rmsRatioTo07=rms(a)/rms(source),sha256=sha(OUT/file)))
    report=dict(model='Official cached torchaudio HDEMUCS_HIGH_MUSDB_PLUS',
        operation='Actual second-pass separation of accepted07 other context; extract bass index',
        source=str(SOURCE),sourceSha256=EXPECTED,sourceUnchanged=sha(SOURCE)==EXPECTED,
        context=str(CONTEXT),contextSha256=sha(CONTEXT),
        contextOriginalSeconds=[44,54],targetOriginalSeconds=[45,53],
        contextCropVs07MaxError=input_error,sourceRate=sr,modelRate=model_sr,
        cpuThreads=4,windowSeconds=6,overlapSeconds=3,reflectPaddingSeconds=1.5,
        inputChannels=2,inputIsStereo=True,networkDisabled=True,downloads=False,
        audioUploaded=False,devicePlayback=False,
        rawBassBands=bands,projectedBassBands=band_diagnostics(source,projected),
        rawFloatPairSumMaxError=float(np.max(np.abs(bass+remainder-source))),
        pcm24PairSumMaxError=pcm_error,
        projectionMethod='Bass vs 07-minus-bass Wiener soft mask, projected onto original07 stereo complex STFT; complement retained',
        sourceRms=rms(source),files=file_stats,elapsedSeconds=time.perf_counter()-started,
        noListeningClaim=True,
        caveat='Bass is the model source target, not verified musical identity. Upper harmonics can be legitimate bass or melody bleed. Raw remainder is subtraction, not a verified isolated lead. Projection preserves source phase but can miss overlapping bass and lead.')
    (OUT/'bass-separation-manifest.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),'utf-8')
    print(json.dumps(report,ensure_ascii=False),flush=True)


if __name__=='__main__':
    main()
