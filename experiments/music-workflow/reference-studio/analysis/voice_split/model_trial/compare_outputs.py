"""Audit the two model outputs; retain uncertain shared content separately.

This is a model-guided spectral contrast, not two verified instruments.
Both model queries may contain the same music. Shared model content stays in
a residual instead of forcing every bin into one of two claimed voices.
"""
from __future__ import annotations
import hashlib
import json
from pathlib import Path
import sys
import numpy as np
from scipy import signal
from scipy.io import wavfile
from scipy.ndimage import gaussian_filter

BASE = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(BASE / 'phone_trial'))
from prepare_comparison import pcm24
CASE = BASE.parent / 'cases/phone-recording-20261023-233819'
OUT = CASE / '声部分离试验/model'
SOURCE = CASE / '试听/07-普通分轨基线.wav'


def read(path):
    sr, a = wavfile.read(path)
    if a.dtype.kind == 'i':
        a = a.astype(np.float64) / 2**(a.dtype.itemsize*8-1)
    else:
        a = a.astype(np.float64)
    return sr, a


def rms(a):
    return float(np.sqrt(np.mean(a*a)))


def spectral(a):
    return signal.stft(a.T, fs=48000, nperseg=2048,
                       noverlap=1536, boundary='zeros', padded=True)[2]


def inverse(z, length):
    return signal.istft(z, fs=48000, nperseg=2048,
                         noverlap=1536, boundary=True)[1].T[:length]


def main():
    sr, source = read(SOURCE)
    assert sr == 48000 and source.shape == (384000,2)
    models=[]
    for name in ['mid','side']:
        sr2,a = read(OUT / f'estimate-query-{name}.wav')
        a = signal.resample_poly(a, 160,147,axis=0)[:len(source)]
        assert sr2==44100 and a.shape==source.shape
        models.append(a)
        pcm24(OUT / f'raw-query-{name}-8s.wav', a)
    a,b=models
    corr=float(np.dot(a.ravel(),b.ravel()) / np.sqrt(
        np.sum(a*a)*np.sum(b*b)))
    relative_difference=rms(a-b)/rms(a)
    za,zb=map(spectral, models)
    # Equal global energy in the comparison scores prevents a query's overall
    # gain bias from assigning the entire mixture to that query. This affects
    # scores only; rendered samples always come from unchanged 07.
    qa=np.sqrt(np.mean(np.abs(za)**2,axis=0))/max(rms(a),1e-12)
    qb=np.sqrt(np.mean(np.abs(zb)**2,axis=0))/max(rms(b),1e-12)
    eps=max(float(qa.max()),float(qb.max()))*1e-5
    contrast=(qa-qb)/(qa+qb+eps)
    contrast=gaussian_filter(contrast,sigma=(.6,.8))
    wa=np.clip(contrast,0,1)
    wb=np.clip(-contrast,0,1)
    wr=1-wa-wb
    z=spectral(source)
    parts=[inverse(z*w[None],len(source)) for w in [wa,wb,wr]]
    names=['contrast-query-mid','contrast-query-side','shared-and-uncertain']
    files=[]
    for name,a in zip(names,parts):
        filename=f'{name}-8s.wav'
        pcm24(OUT/filename,a)
        wavfile.write(OUT/f'{name}-float.wav',48000,a.astype(np.float32))
        files.append(dict(file=filename,rms=rms(a),
                          rmsRatioTo07=rms(a)/rms(source)))
    rec=sum(parts)
    max_error=float(np.max(np.abs(rec-source)))
    assert max_error<1e-8
    # Independent fallback: a previously discovered fine-level model query,
    # rather than trying to amplify the near-identical new query difference.
    # Its classifier name is not a verified instrument identity.
    legacy=CASE/'mus3d/context-44-54/01-clean_electric_guitar.wav'
    legacy_sr, legacy_audio=read(legacy)
    assert legacy_sr==44100
    legacy_audio=signal.resample_poly(legacy_audio,160,147,axis=0)[48000:432000]
    assert legacy_audio.shape==source.shape
    legacy_z=spectral(legacy_audio)
    p=np.mean(np.abs(legacy_z)**2,axis=0)
    pr=np.mean(np.abs(z-legacy_z)**2,axis=0)
    legacy_mask=gaussian_filter(p/(p+pr+1e-15),sigma=(.4,.5))
    legacy_part=inverse(z*legacy_mask[None],len(source))
    legacy_rest=source-legacy_part
    fallback=[]
    for name, part in [('existing-fine-query-projection',legacy_part),
                       ('existing-fine-query-remainder',legacy_rest)]:
        file=f'{name}-8s.wav'
        pcm24(OUT/file,part)
        fallback.append(dict(file=file,rms=rms(part),rmsRatioTo07=rms(part)/rms(source)))
    report=dict(
        source=str(SOURCE),sourceSha256=hashlib.sha256(SOURCE.read_bytes()).hexdigest(),
        rawOutputCorrelation=corr,relativeRmsDifference=relative_difference,
        notIndependentTwoVoices=bool(corr>.97),
        scoreNormalization='Each estimate divided by its full-clip RMS for contrast only',
        projection='Nonnegative signed magnitude contrast, gaussian smoothed 0.6 bins/0.8 frames; common score remains residual',
        phaseAndSamples='All projected outputs derive only from original07 complex stereo STFT',
        inverseMaxError=max_error,files=files,
        fallback=dict(method='Old model-estimate versus original-minus-estimate Wiener mask projected onto07; old label is not confirmed',
                      estimate=str(legacy),estimateSha256=hashlib.sha256(legacy.read_bytes()).hexdigest(),
                      files=fallback,remainderIsNotVerifiedSecondVoice=True),
        noGroundTruth=True,actualListeningPerformed=False,
        warning='Projection is an observation aid. Difference is not proof of a second instrument; output correlation and dominance must be reviewed before presenting.',
        modelQueriesTotal=2)
    (OUT/'comparison-diagnostics.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),'utf-8')
    print(json.dumps(report,ensure_ascii=False))


if __name__=='__main__':
    main()
