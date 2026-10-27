"""Independent stable-region stereo loop search; never edits the instrument."""
from pathlib import Path
import hashlib
import json
import numpy as np
from scipy.io import wavfile
from scipy import signal

ROOT=Path(__file__).resolve().parents[2]
CASE=ROOT/"cases/phone-recording-20261023-233819"
PREP=CASE/"instrument/prepared"
OUT=CASE/"instrument/pitch-analysis"
manifest=json.loads((PREP/"material-manifest.json").read_text(encoding="utf-8-sig"))
source=Path(manifest["source"])
fs,raw=wavfile.read(source)
original=raw.astype(np.float64)/2**31
fs2,prepared=wavfile.read(PREP/"melody-note-Gs5.wav")
prepared=prepared.astype(np.float64)
if np.max(abs(prepared))>1:
    prepared/=2**31
assert fs==fs2==48000
sos=signal.butter(4,350,btype="highpass",fs=fs,output="sos")
adapted=signal.sosfiltfilt(sos,original,axis=0)
a,b=[round(t*fs) for t in manifest["selectionSecondsIn07"]]
expected=adapted[a:b]
verification={"source_sha256":hashlib.sha256(source.read_bytes()).hexdigest(),
              "source_hash_matches_manifest":hashlib.sha256(source.read_bytes()).hexdigest()==manifest["sourceSha256"],
              "prepared_frames":len(prepared),
              "prepared_matches_context_filter_crop_max_abs_error":float(np.max(abs(prepared-expected))),
              "prepared_matches_float32_expected_exact":bool(np.array_equal(prepared,expected.astype(np.float32).astype(np.float64))),
              "no_audio_written":True}
period=fs/830.9271
crossfade=round(8*period)
lo=round(.03*fs)
hi=round(.21*fs)
rows=[]
# For each integer-period cycle, use cumulative sums to score every possible
# full-stereo head/tail overlap within the stable bounds in linear time.
for n in range(int(np.ceil(.070*fs/period)),int(np.floor(.150*fs/period))+1):
    cycle=round(n*period)
    if lo+cycle+crossfade>hi: continue
    left=prepared[:-cycle]
    right=prepared[cycle:]
    dot=np.sum(left*right,axis=1)
    en1=np.sum(left*left,axis=1)
    en2=np.sum(right*right,axis=1)
    sums=[]
    for arr in (dot,en1,en2):
        prefix=np.r_[0.,np.cumsum(arr)]
        sums.append(prefix[crossfade:]-prefix[:-crossfade])
    starts=np.arange(lo,hi-cycle-crossfade+1)
    d,e1,e2=[v[starts] for v in sums]
    symmetric=2*d/(e1+e2+1e-30)
    correlation=d/np.sqrt(e1*e2+1e-30)
    # Similar scores prefer a longer cycle. Preference can never turn a
    # below-threshold overlap into a suitable candidate.
    preference=symmetric+min(.005,cycle/fs*.025)
    idx=int(np.argmax(preference)); start=int(starts[idx]); end=start+cycle+crossfade
    each=[]
    for ch in range(prepared.shape[1]):
        p=prepared[start:start+crossfade,ch]
        q=prepared[end-crossfade:end,ch]
        each.append(float(np.dot(p,q)/np.sqrt(np.dot(p,p)*np.dot(q,q)+1e-30)))
    rows.append({"start_frame":start,"end_frame":end,"crossfade_frames":crossfade,
                 "start_seconds":start/fs,"end_seconds":end/fs,
                 "crossfade_seconds":crossfade/fs,"effective_cycle_frames":cycle,
                 "effective_cycle_seconds":cycle/fs,"cycle_fundamental_periods":n,
                 "symmetric_similarity":float(symmetric[idx]),
                 "normalized_correlation":float(correlation[idx]),
                 "tail_head_energy_ratio":float(e2[idx]/e1[idx]),
                 "per_channel_correlation":each})
rows.sort(key=lambda x:x["symmetric_similarity"]+min(.005,x["effective_cycle_seconds"]*.025),reverse=True)
best=rows[0]
result={"verification":verification,"stable_range_seconds":[.03,.21],
        "estimated_fundamental_hz":830.9271,"crossfade_periods":8,
        "metric":"2*dot(head,tail)/(energy(head)+energy(tail)), over both stereo channels and complete crossfade; 1 is identical.",
        "candidate_threshold":.8,"suitable_candidate":best if best["symmetric_similarity"]>=.8 else None,
        "best_observed":best,"top_candidates":rows[:10],
        "caution":"Numeric continuity only, not proof of subjective sustain quality. No audio audition or file modification performed."}
OUT.mkdir(parents=True,exist_ok=True)
(OUT/"loop-probe.json").write_text(json.dumps(result,indent=2),encoding="utf-8")
print(json.dumps({"verification":verification,"suitable_candidate":result["suitable_candidate"],"best_observed":best},indent=2))
