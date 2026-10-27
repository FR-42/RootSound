"""Estimate a short stereo periodic waveform from 07; not separated raw audio.

Training uses eight cycles of a steady segment; four later cycles and an earlier
different-melody segment are held out. A repeating mixture can still contain
several instruments or shared harmonics. No recovered original synth is claimed.
"""
import os
for name in ["OMP_NUM_THREADS", "OPENBLAS_NUM_THREADS", "MKL_NUM_THREADS"]:
    os.environ[name] = "2"
from pathlib import Path
import hashlib
import json
import numpy as np
from scipy.io import wavfile
from scipy.optimize import minimize_scalar
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

ROOT = Path(__file__).resolve().parents[2]
CASE = ROOT / "cases/phone-recording-20261023-233819"
SOURCE = CASE / "试听/07-普通分轨基线.wav"
OUT = CASE / "周期模式试验"
SHA = "db79615e148120d8183bca8cddf7e4d881beefb09999b45ee9e215b24c672fac"
EPOCH = .68
PHASE_BINS = 1024
TRAIN_CYCLES = 8
TEST_CYCLES = 4
LOW_HARMONICS = np.array([2, 3, 4, 5, 6, 8])


def read(path):
    sr, x = wavfile.read(path)
    if x.dtype.kind in "iu":
        x = x.astype(float) / 2**(x.dtype.itemsize*8-1)
    else:
        x = x.astype(float)
    return sr, x


def cycles_at(x, sr, f0, first_cycle, count, epoch=EPOCH):
    phase = (np.arange(count)[:,None] + first_cycle + np.arange(PHASE_BINS)[None,:]/PHASE_BINS)
    positions = (epoch + phase/f0) * sr
    grid = np.arange(len(x))
    return np.stack([np.interp(positions.ravel(), grid, x[:,c]).reshape(positions.shape)
                     for c in range(2)], axis=-1)


def low_coherence(cycles):
    coefficients = np.fft.rfft(cycles - cycles.mean(axis=1,keepdims=True), axis=1)
    selected = coefficients[:,LOW_HARMONICS,:]
    coherent = np.sum(np.abs(np.mean(selected,axis=0))**2,axis=-1)
    total = np.mean(np.sum(np.abs(selected)**2,axis=-1),axis=0)
    weights = np.array([1,.7,1,.5,.7,.5])
    return float(np.average(coherent/(total+1e-20),weights=weights))


def shift_cycle(cycle, phase_offset):
    coefficients = np.fft.rfft(cycle,axis=0)
    multiplier = np.exp(2j*np.pi*np.arange(len(coefficients))*phase_offset)
    return np.fft.irfft(coefficients*multiplier[:,None],n=len(cycle),axis=0)


def align_and_fold(training):
    training = training-training.mean(axis=1,keepdims=True)
    template = np.median(training,axis=0)
    offsets = np.zeros(len(training)); gains=np.ones(len(training))
    for _ in range(3):
        tf = np.fft.rfft(template,axis=0)[LOW_HARMONICS]
        aligned=[]
        for i, cycle in enumerate(training):
            cf = np.fft.rfft(cycle,axis=0)[LOW_HARMONICS]
            def objective(offset):
                candidate=cf*np.exp(2j*np.pi*LOW_HARMONICS*offset)[:,None]
                return -float(np.real(np.sum(candidate*np.conj(tf))))
            result=minimize_scalar(objective,bounds=(-.025,.025),method="bounded",
                                   options={"xatol":1e-7})
            offsets[i]=result.x
        # Retain the phase gauge of the observed starting time.
        offsets-=np.mean(offsets)
        for i, cycle in enumerate(training):
            shifted=shift_cycle(cycle,offsets[i])
            cf=np.fft.rfft(shifted,axis=0)[LOW_HARMONICS]
            gains[i]=np.clip(np.real(np.sum(cf*np.conj(tf)))/(np.sum(np.abs(tf)**2)+1e-20),.5,2)
            aligned.append(shifted/gains[i])
        template=np.median(aligned,axis=0)
        template-=template.mean(axis=0,keepdims=True)
    return template,np.stack(aligned),offsets,gains


def render(table, f0, times, epoch=EPOCH):
    phase=np.mod((times-epoch)*f0,1.)
    grid=np.arange(len(table)+1)/len(table)
    periodic=np.vstack([table,table[0]])
    return np.stack([np.interp(phase,grid,periodic[:,c]) for c in range(2)],axis=-1)


def metrics(actual,predicted):
    a=actual-actual.mean(axis=0,keepdims=True)
    b=predicted-predicted.mean(axis=0,keepdims=True)
    error=a-b
    scale=float(np.sum(a*b)/(np.sum(b*b)+1e-20))
    return {"fixedGainNormalizedRmsError":float(np.sqrt(np.sum(error**2)/(np.sum(a*a)+1e-20))),
            "fixedGainExplainedEnergy":float(1-np.sum(error**2)/(np.sum(a*a)+1e-20)),
            "stereoShapeCorrelation":float(np.sum(a*b)/np.sqrt(np.sum(a*a)*np.sum(b*b)+1e-20)),
            "bestScalarDiagnosticOnly":scale,
            "actualRms":float(np.sqrt(np.mean(a*a))),
            "predictedRms":float(np.sqrt(np.mean(b*b)))}


def wav(out,name,x,sr):
    assert np.isfinite(x).all() and np.max(np.abs(x))<1
    wavfile.write(out/name,sr,x.astype(np.float32))
    return {"name":name,"frames":len(x),"peak":float(np.max(np.abs(x))),
            "sha256":hashlib.sha256((out/name).read_bytes()).hexdigest()}


def main():
    OUT.mkdir(parents=True,exist_ok=True)
    assert hashlib.sha256(SOURCE.read_bytes()).hexdigest()==SHA
    sr,x=read(SOURCE)
    assert sr==48000 and x.shape==(384000,2)
    grid=np.arange(45.5,46.81,.025)
    scores=np.array([low_coherence(cycles_at(x,sr,f,0,TRAIN_CYCLES)) for f in grid])
    j=int(np.argmax(scores))
    optimize=minimize_scalar(lambda f:-low_coherence(cycles_at(x,sr,f,0,TRAIN_CYCLES)),
                             bounds=(max(45.5,grid[j]-.04),min(46.8,grid[j]+.04)),
                             method="bounded",options={"xatol":1e-6})
    f0=float(optimize.x)
    training=cycles_at(x,sr,f0,0,TRAIN_CYCLES)
    heldout=cycles_at(x,sr,f0,TRAIN_CYCLES,TEST_CYCLES)
    table,aligned,offsets,gains=align_and_fold(training)
    repeated=np.repeat(table[None,:,:],TEST_CYCLES,axis=0)
    heldout_metrics=metrics(heldout.reshape(-1,2),repeated.reshape(-1,2))
    # Both halves were already aligned/normalized against a template estimated
    # from all eight training cycles. This is an in-sample consistency
    # diagnostic, not independent fitting or held-out validation.
    split_a=np.median(aligned[:4],axis=0)
    split_b=np.median(aligned[4:],axis=0)
    template_stability=metrics(split_a,split_b)
    # External window was not used to optimize frequency, phase, or waveform.
    ext_start,ext_end=.08,.28
    ext_times=np.arange(round(ext_start*sr),round(ext_end*sr))/sr
    external=x[round(ext_start*sr):round(ext_end*sr)]
    ext_fixed=render(table,f0,ext_times)
    external_fixed_metrics=metrics(external,ext_fixed)
    # This additional transfer diagnostic adjusts only one global phase, not
    # the table or individual cycles; it is explicitly not an unseen prediction.
    phase_grid=np.linspace(-.5,.5,257,endpoint=False)
    correlations=[metrics(external,render(table,f0,ext_times,epoch=EPOCH+p/f0))["stereoShapeCorrelation"] for p in phase_grid]
    phase=float(phase_grid[int(np.argmax(correlations))])
    external_phase_metrics=metrics(external,render(table,f0,ext_times,epoch=EPOCH+phase/f0))
    start=EPOCH;end=EPOCH+(TRAIN_CYCLES+TEST_CYCLES)/f0
    sample_times=np.arange(round(start*sr),round(end*sr))/sr
    original=x[round(start*sr):round(end*sr)]
    estimate=render(table,f0,sample_times)
    sustained=render(table,f0,np.arange(round(1.5*sr))/sr,epoch=0)
    # Audition copy only: fades make starting/stopping a sustained loop gentle.
    fade=round(.012*sr)
    sustained[:fade]*=np.linspace(0,1,fade)[:,None]
    sustained[-fade:]*=np.linspace(1,0,fade)[:,None]
    files=[wav(OUT,"原声稳态短窗.wav",original,sr),
           wav(OUT,"估计周期模式-与短窗等长.wav",estimate,sr),
           wav(OUT,"估计周期模式-重复播放1.5秒.wav",sustained,sr)]
    table_data={"format":"RootSound exploratory stereo periodic waveform v1",
                "status":"Estimated/replayed periodic pattern, not isolated original audio or confirmed instrument",
                "source":str(SOURCE),"sourceSha256":SHA,"sourceExcerptOriginalStartSeconds":45,
                "referenceFundamentalHz":f0,"initialMissingFundamentalHypothesisHz":46.25,
                "periodSeconds":1/f0,"phaseZeroSourceRelativeSeconds":EPOCH,
                "phaseGridCycles":(np.arange(PHASE_BINS)/PHASE_BINS).tolist(),
                "stereoWaveform":table.tolist(),"channelOrder":["left","right"],
                "normalization":"Original 07 floating amplitude scale; per-channel DC removed, no peak normalization",
                "trainingSourceRelativeSeconds":[EPOCH,EPOCH+TRAIN_CYCLES/f0],
                "heldoutSourceRelativeSeconds":[EPOCH+TRAIN_CYCLES/f0,end],
                "timeRangeConvention":"Nominal cycle intervals [start,end); phase samples exclude each cycle endpoint. Adjacent linear-interpolation supports may share one input sample.",
                "trainingCycles":TRAIN_CYCLES,"heldoutCycles":TEST_CYCLES,
                "trainAlignmentPhaseOffsetsCycles":offsets.tolist(),
                "trainAmplitudeNormalizationGains":gains.tolist(),
                "ambiguityHz":[f0/2,f0,f0*2],
                "warning":"A shared periodicity can contain bass, other instruments, coincident harmonics and effects. This is not original preset recovery."}
    (OUT/"双声道周期表.json").write_text(json.dumps(table_data,indent=2,ensure_ascii=False),encoding="utf-8")
    np.savez_compressed(OUT/"双声道周期表.npz",phase=np.arange(PHASE_BINS)/PHASE_BINS,
                        waveform=table,frequencyHz=f0,training=training,alignedTraining=aligned,
                        heldout=heldout,trainPhaseOffsets=offsets,trainGains=gains,
                        periodOptimizationGridHz=grid,periodOptimizationScores=scores)
    report={"status":"One short periodic-pattern estimate; listening unvalidated",
            "sourceSha256":SHA,"optimizedReferenceF0Hz":f0,"periodSeconds":1/f0,
            "optimizationUsesTrainingOnly":True,"trainingLowHarmonicCoherence":float(-optimize.fun),
            "heldoutCyclesFixedPattern":heldout_metrics,"disjointTrainHalfTemplateStability":template_stability,
            "trainHalfDiagnosticScope":"The two groups contain disjoint training cycles, but frequency optimization, alignment template, phase offsets and amplitude normalization use the complete eight-cycle training set. The 0.899 correlation is an in-sample shared-fit consistency diagnostic, not independent held-out validation.",
            "trainHeldoutBoundaryConvention":f"Training cycles 0-7 occupy nominal [{EPOCH},{EPOCH+TRAIN_CYCLES/f0}) s; held-out cycles 8-11 occupy [{EPOCH+TRAIN_CYCLES/f0},{end}) s, relative to 07. Sampling grids are disjoint, but adjacent linear-interpolation supports may share one input sample.",
            "externalWindowRelativeSeconds":[ext_start,ext_end],
            "externalFixedPhaseAndGain":external_fixed_metrics,
            "externalOneGlobalPhaseDiagnostic":{"phaseAdjustmentCycles":phase,"metrics":external_phase_metrics},
            "files":files,"sourceUnchanged":hashlib.sha256(SOURCE.read_bytes()).hexdigest()==SHA,
            "limitations":["Heldout repetition measures pattern stability, not instrument purity",
                           "46/92/23 Hz octave/period ambiguity is retained, not resolved by fitting error",
                           "Inharmonicity, stereo modulation, envelopes, transient/noise and FM may be averaged away",
                           "Simultaneous parts sharing this period or harmonics cannot be uniquely separated",
                           "Loop playback is estimated/reconstructed sound, not unchanged separated original audio"],
            "noAudioDeviceUiUploadOrNewDownloads":True,"noMidiOrWholeExcerptRemake":True}
    (OUT/"周期拟合报告.json").write_text(json.dumps(report,indent=2,ensure_ascii=False),encoding="utf-8")
    fig,axs=plt.subplots(3,1,figsize=(13,9))
    phase=np.arange(PHASE_BINS)/PHASE_BINS
    for channel,name in enumerate(["Left","Right"]):
        axs[channel].plot(phase,aligned[:,:,channel].T,color="gray",alpha=.35)
        axs[channel].plot(phase,table[:,channel],color="red",label="Robust estimated cycle")
        axs[channel].set_title(name+": aligned training cycles and estimated template")
        axs[channel].legend()
    axs[2].plot(grid,scores);axs[2].axvline(f0,color="red");axs[2].set_xlabel("Candidate reference frequency / Hz")
    axs[2].set_title("Training-only shared low-harmonic repeatability")
    fig.tight_layout();fig.savefig(OUT/"周期拟合诊断.png",dpi=130);plt.close(fig)
    print(json.dumps(report,ensure_ascii=False))


if __name__=="__main__":
    main()
