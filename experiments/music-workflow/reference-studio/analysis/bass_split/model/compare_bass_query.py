"""Prepare aligned bass-query estimate and complementary07 remainder."""
from __future__ import annotations
import json
import numpy as np
from scipy import signal
from scipy.ndimage import gaussian_filter
from run_bass import CASE,SOURCE,read,rms,sha,pcm24,stft,inverse,band_diagnostics

OUT=CASE/'低音分离试验/model/bass-audio-query'


def main():
    sr,source=read(SOURCE)
    sr2,context=read(OUT/'bass-query-estimate-context.wav')
    assert sr==48000 and sr2==44100
    audio=signal.resample_poly(context,160,147,axis=0)[48000:432000]
    assert audio.shape==source.shape
    rest=source-audio
    z=stft(source);bz=stft(audio)
    pb=np.mean(np.abs(bz)**2,axis=0)
    pr=np.mean(np.abs(z-bz)**2,axis=0)
    mask=gaussian_filter(pb/(pb+pr+1e-15),sigma=(.4,.5))
    projected=inverse(z*mask[None],len(source))
    projected_rest=source-projected
    files=[]
    for file,a in [('01-bass-query-target-8s.wav',audio),
                   ('02-07-minus-bass-query-8s.wav',rest),
                   ('03-bass-query-projection-8s.wav',projected),
                   ('04-07-minus-bass-query-projection-8s.wav',projected_rest)]:
        pcm24(OUT/file,a)
        files.append(dict(file=file,rms=rms(a),rmsRatioTo07=rms(a)/rms(source),peak=float(np.max(np.abs(a)))))
    bands=band_diagnostics(source,audio)
    projected_bands=band_diagnostics(source,projected)
    f,ps=signal.welch(audio.T,48000,nperseg=16384,axis=-1)
    ps=ps.mean(axis=0)
    total=float(np.sum(ps[(f>=20)&(f<12000)]))
    report=dict(source=str(SOURCE),sourceSha256=sha(SOURCE),
        originalSeconds=[45,53],files=files,
        rawEstimateBands=bands,projectionBands=projected_bands,
        estimatePowerFractionBelow250=float(np.sum(ps[(f>=20)&(f<250)]))/total,
        estimatePowerFractionAbove700=float(np.sum(ps[(f>=700)&(f<12000)]))/total,
        rawEstimateVs07Correlation=float(np.sum(audio*source)/np.sqrt(np.sum(audio*audio)*np.sum(source*source))),
        rawPairSumMaxError=float(np.max(np.abs(audio+rest-source))),
        projectedPairSumMaxError=float(np.max(np.abs(projected+projected_rest-source))),
        projectedMethod='Estimatedbass vs07-minus-estimate Wiener softmask at original07 stereo phase',
        actualListeningPerformed=False,
        caveat='High harmonics can be legitimate bass or bleed. Frequency metrics do not prove musical target separation. No pure reference or original author stems are available.')
    (OUT/'comparison-diagnostics.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),'utf-8')
    print(json.dumps(report,ensure_ascii=False))


if __name__=='__main__':
    main()
