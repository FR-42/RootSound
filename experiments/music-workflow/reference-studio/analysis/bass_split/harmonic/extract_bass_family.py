"""Bass-family-guided original-phase extraction, deliberately conservative.

The original MuS3D bass is only a pitch/envelope reference. Every output sample
comes from 07, and the second output is the exact complementary remainder.
No low-pass substitute, unconstrained two-way clustering, or synthesis is used.
"""
from observe_low_families import *
from scipy.ndimage import median_filter, gaussian_filter1d
import sys

WIDE_LOW_PARTIALS = "--wide-low-partials" in sys.argv
if WIDE_LOW_PARTIALS:
    OUT = OUT / "wide-low-partials"


def bands_at(mag, f, centers, radius):
    distance = np.abs(f[:, None] - centers[None, :])
    return np.max(np.where(distance <= radius[None, :], mag, 0), axis=0)


def track_states(v, rv, f, t):
    # Roots are candidate missing fundamentals, not asserted recovered MIDI.
    midi = np.arange(26, 33)
    roots = 440 * 2 ** ((midi - 69) / 12)
    strength = np.zeros((len(roots), len(t)))
    norm = np.maximum(gaussian_filter1d(np.mean(v, axis=1), 5), v.max() * .0002)
    rnorm = np.maximum(gaussian_filter1d(np.mean(rv, axis=1), 5), rv.max() * .0002)
    for j, root in enumerate(roots):
        score = 0
        for h in (2, 3, 4, 5, 6, 8):
            bins = np.flatnonzero(np.abs(f - h * root) < 5.5)
            value = np.max(v[bins] / norm[bins, None], axis=0)
            rvalue = np.max(rv[bins] / rnorm[bins, None], axis=0)
            score += np.log1p(value) * .8 + np.log1p(rvalue) * .2
        strength[j] = gaussian_filter1d(score, 3)
    transition = .5 + .3 * np.abs(midi[:, None] - midi[None, :])
    np.fill_diagonal(transition, 0)
    dp = strength[:, 0].copy()
    back = np.zeros((len(t), len(midi)), dtype=int)
    for frame in range(1, len(t)):
        options = dp[:, None] - transition
        back[frame] = np.argmax(options, axis=0)
        dp = strength[:, frame] + np.max(options, axis=0)
    labels = np.zeros(len(t), dtype=int)
    labels[-1] = np.argmax(dp)
    for frame in range(len(t)-1, 0, -1):
        labels[frame-1] = back[frame, labels[frame]]
    labels = median_filter(labels, size=9)
    root = roots[labels]
    # Estimate slow detune jointly from multiple lower harmonics, never 698 Hz
    # alone: at that point the wanted melody can overlap the bass harmonics.
    estimates = []
    for h in (2, 3, 4, 6, 8):
        dist = np.abs(f[:, None] - root[None, :] * h)
        allowed = dist <= np.maximum(5.5, root*h*.018)[None, :]
        indices = np.argmax(np.where(allowed, v, 0), axis=0)
        estimates.append(f[indices] / h)
    measured = np.median(estimates, axis=0)
    measured = np.clip(measured / root, .99, 1.01) * root
    measured = median_filter(measured, size=15)
    return midi[labels], measured, strength


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    sr, x = read(SOURCE)
    ref_path = CASE / "audition/mus3d-stem/float-estimates/03-03-bass.wav"
    rsr, ref = read(ref_path)
    assert rsr == sr == 48000 and x.shape == ref.shape == (384000, 2)
    assert hashlib.sha256(SOURCE.read_bytes()).hexdigest() == SHA
    f, t, z = stft(x, sr)
    _, _, rz = stft(ref, sr)
    v = np.sqrt(np.mean(np.abs(z) ** 2, axis=0))
    rv = np.sqrt(np.mean(np.abs(rz) ** 2, axis=0))
    labels, roots, state_scores = track_states(v, rv, f, t)
    # Each continuous root region has its own spectral-amplitude reference.
    boundaries = np.r_[0, np.flatnonzero(np.diff(labels)) + 1, len(t)]
    mask = np.zeros_like(v)
    diagnostics = []
    for a, b in zip(boundaries[:-1], boundaries[1:]):
        if b-a < 5:
            continue
        root = roots[a:b]
        segment = {"startSeconds": float(t[a]), "endSeconds": min(8., float(t[min(b,len(t)-1)])),
                   "missingFundamentalMidiHypothesis": int(labels[a]),
                   "medianRootHz": float(np.median(root)), "partials": []}
        for h in range(1, 97):
            centers = root * h
            if np.min(centers) > 4400:
                break
            # A Hann main lobe is wider than one zero-padded FFT bin. The wide
            # variant includes its low-order skirts and stereo modulation,
            # while leaving higher overlapping melody partials conservative.
            minimum_radius = 12. if WIDE_LOW_PARTIALS and h <= 12 else 6.
            radius = np.maximum(minimum_radius, centers*.0055)
            source_amp = bands_at(v[:,a:b], f, centers, radius)
            ref_amp = bands_at(rv[:,a:b], f, centers, radius)
            # A neighbouring off-harmonic region detects broad unrelated noise.
            neighbour = bands_at(rv[:,a:b], f, centers + root*.35, radius*.7)
            prominence = float(np.median(ref_amp / (neighbour + rv.max()*1e-5)))
            valid = (ref_amp > np.max(ref_amp)*.12) & (source_amp > v.max()*1e-5)
            if np.sum(valid) < 4:
                continue
            corr = float(np.corrcoef(source_amp[valid], ref_amp[valid])[0,1])
            if not np.isfinite(corr):
                corr = 0
            # Lower harmonics establish the target. At higher overlapping
            # partials, only a quieter envelope shared with the bass reference
            # is removed; independent lead attacks stay in the remainder.
            if h <= 8:
                quantile, cap = .62, .97
            elif h <= 16:
                quantile, cap = .30, .75
            else:
                quantile, cap = .20, .62
            if h > 8 and prominence < 1.3:
                continue
            if h > 16 and corr < .15:
                cap *= .45
            scale = float(np.quantile(source_amp[valid] / (ref_amp[valid]+1e-12), quantile))
            predicted_amp = gaussian_filter1d(ref_amp, .8) * scale
            gain = np.clip(predicted_amp/(source_amp+1e-12), 0, cap)
            shape = np.exp(-.5*((f[:,None]-centers[None,:])/(radius[None,:]*.72))**4)
            contribution = shape * gain[None,:]
            mask[:,a:b] = np.maximum(mask[:,a:b], contribution)
            segment["partials"].append({"harmonic": h, "medianHz": float(np.median(centers)),
                         "referenceProminence": prominence, "envelopeCorrelation": corr,
                         "scale": scale, "meanMaskGain": float(np.mean(gain))})
        diagnostics.append(segment)
    mask = gaussian_filter1d(mask, .75, axis=1)
    mask = np.clip(mask, 0, .97)
    _, result = signal.istft(z * mask[None,:,:], fs=sr, window="hann", nperseg=8192,
                            noverlap=8192-384, nfft=16384, input_onesided=True, boundary=True)
    bass = result.T[:len(x)]
    remainder = x - bass
    names = ["低音泛音族候选.wav", "07减去低音泛音族.wav"]
    files = []
    for name, audio in zip(names,[bass,remainder]):
        wavfile.write(OUT/name,sr,audio.astype(np.float32))
        files.append({"path": str(OUT/name), "sha256": hashlib.sha256((OUT/name).read_bytes()).hexdigest(),
                      "rms": float(np.sqrt(np.mean(audio**2))), "peak": float(np.abs(audio).max())})
    # Parse the actual exported floats, rather than trusting in-memory identity.
    exported = [read(OUT/name)[1] for name in names]
    error = sum(exported)-x
    power = np.mean(np.abs(z)**2,axis=0)
    removed = power * mask**2
    band_stats = {}
    for lower,upper in [(35,250),(250,600),(600,1600),(1600,4400)]:
        sel=(f>=lower)&(f<upper)
        band_stats[f"{lower}-{upper}Hz"]={"bassCandidateSpectralEnergy":float(removed[sel].sum()),
                     "originalSpectralEnergy":float(power[sel].sum()),
                     "fractionOfSourceBandEnergy":float(removed[sel].sum()/(power[sel].sum()+1e-12))}
    report={"status":"Unvalidated bass-family extraction with original-signal complement",
            "source":str(SOURCE), "sourceSha256":SHA, "rangeOriginalSeconds":[45,53],
            "reference":str(ref_path), "referencePurpose":"Only harmonic identity and per-partial envelope; no reference samples added",
            "method":"Missing-fundamental harmonic state tracking using both stereo powers; phase-preserving tube masks tied to bass-reference envelopes, with conservative overlapping upper harmonics",
            "notLowPass":True, "wideLowPartialTubes":WIDE_LOW_PARTIALS,
            "noSynthesisOrMidiOrDeviceOrUiOrUpload":True,
            "sourceUnchanged":hashlib.sha256(SOURCE.read_bytes()).hexdigest()==SHA,
            "sumExportedMaxAbsoluteError":float(np.abs(error).max()),
            "sumExportedRmsError":float(np.sqrt(np.mean(error**2))),
            "bands":band_stats,"files":files,"segments":diagnostics,
            "caveats":["Bass root octaves are hypotheses, not recovered original notes",
                       "Upper harmonics overlap lead/chords; a shared partial cannot be uniquely assigned",
                       "No actual auditory evaluation was performed", "Conservation does not establish musical separation quality"]}
    assert report["sourceUnchanged"] and report["sumExportedMaxAbsoluteError"] < 1e-6
    (OUT/"extraction-report.json").write_text(json.dumps(report,indent=2,ensure_ascii=False),encoding="utf-8")
    np.savez_compressed(OUT/"harmonic-mask.npz",frequency=f,time=t,mask=mask,rootHz=roots,
                        rootMidiHypothesis=labels,stateScores=state_scores)
    fig,axs=plt.subplots(4,1,figsize=(15,10),sharex=True)
    for ax,material,title in zip(axs[:3],[v,v*mask,v*(1-mask)],
                                ["Accepted 07", "Bass harmonic-family candidate", "Complementary remainder"]):
        use=(f>35)&(f<4400)
        ax.pcolormesh(t,f[use],20*np.log10(material[use]/v.max()+1e-8),shading="auto",cmap="magma",vmin=-65,vmax=0)
        ax.set_yscale("log");ax.set_ylim(35,4400);ax.set_title(title)
    axs[3].plot(t,roots);axs[3].set_ylabel("Missing-root hypothesis Hz");axs[3].set_ylim(30,60)
    axs[3].set_xlabel("Seconds relative to original 45 s")
    fig.tight_layout();fig.savefig(OUT/"bass-family-review.png",dpi=130);plt.close(fig)
    print(json.dumps({k:v for k,v in report.items() if k!='segments'},ensure_ascii=False))
    print(json.dumps([{k:v for k,v in seg.items() if k!='partials'} for seg in diagnostics],ensure_ascii=False))


if __name__=="__main__":
    main()
