"""Verify exported periodic-table provenance and replay, not auditory quality."""
from fit_pattern import *


def main():
    data=json.loads((OUT/"双声道周期表.json").read_text(encoding="utf-8"))
    table=np.asarray(data["stereoWaveform"],dtype=float)
    phase=np.asarray(data["phaseGridCycles"],dtype=float)
    f0=data["referenceFundamentalHz"]
    sr,x=read(SOURCE)
    assert hashlib.sha256(SOURCE.read_bytes()).hexdigest()==SHA
    assert table.shape==(1024,2) and np.isfinite(table).all()
    assert np.max(np.abs(phase-np.arange(1024)/1024))<1e-15
    npz=np.load(OUT/"双声道周期表.npz")
    assert np.array_equal(npz["waveform"],table)
    assert npz["training"].shape==(8,1024,2) and npz["heldout"].shape==(4,1024,2)
    actual_sr,original=read(OUT/"原声稳态短窗.wav")
    assert actual_sr==sr==48000 and original.shape[1]==2
    start=round(EPOCH*sr); end=start+len(original)
    original_error=float(np.max(np.abs(original-x[start:end])))
    assert original_error==0
    _,replayed=read(OUT/"估计周期模式-与短窗等长.wav")
    times=np.arange(start,end)/sr
    replay_error=float(np.max(np.abs(replayed-render(table,f0,times))))
    assert replay_error<1e-7
    _,sustained=read(OUT/"估计周期模式-重复播放1.5秒.wav")
    assert sustained.shape==(72000,2) and np.isfinite(sustained).all()
    assert np.max(np.abs(sustained))<1
    train0,train1=data["trainingSourceRelativeSeconds"]
    held0,held1=data["heldoutSourceRelativeSeconds"]
    assert train0==EPOCH and train1==held0 and held1>held0
    result={"sourceUnchanged":True,"tableAndNpzIdentical":True,
            "phaseBins":1024,"channels":2,"trainingCycles":8,"heldoutCycles":4,
            "originalExcerptMaxError":original_error,"tableReplayMaxError":replay_error,
            "renderNoClippingOrNaN":True,"trainHeldoutDisjointInSamplingGrid":True,
            "samplingCaveat":"Interpolation adjacent to split boundary may share one input sample; no heldout samples optimized the waveform or f0.",
            "trainHalfDiagnosticScope":"The 0.899 training-half correlation reuses a complete-training alignment template and is an in-sample consistency diagnostic, not independent held-out validation.",
            "timeRangeConvention":"Nominal cycle intervals [start,end); the training and held-out phase grids do not duplicate a boundary point, but their interpolation supports may share one input sample.",
            "notMusicalAcceptanceOrInstrumentPurity":True}
    (OUT/"周期表验证.json").write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding="utf-8")
    print(json.dumps(result,ensure_ascii=False))


if __name__=="__main__":
    main()
