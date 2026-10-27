"""Joint mid/side spectral factorization; unvalidated original-sound layers."""
from split import *


def main():
    started = time.perf_counter()
    out = OUT / "joint-spatial"
    out.mkdir(parents=True, exist_ok=True)
    assert hashlib.sha256(SOURCE.read_bytes()).hexdigest() == SHA
    sr, x = audio_read(SOURCE)
    down = signal.resample_poly(x, 1, 2, axis=0)
    ms = np.stack([(down[:, 0] + down[:, 1]) / np.sqrt(2),
                   (down[:, 0] - down[:, 1]) / np.sqrt(2)])
    freq, times, z = signal.stft(ms, fs=24000, nperseg=3072, noverlap=2880,
                                boundary="zeros", padded=True)
    v = np.abs(z)
    whiten = np.maximum(np.mean(v, axis=(0, 2)), v.max() * .0008) ** .6
    values = (v / whiten[None, :, None]).reshape(-1, v.shape[-1]).astype(np.float32)
    with threadpool_limits(limits=2):
        model = NMF(n_components=48, init="nndsvda", solver="mu", beta_loss="kullback-leibler",
                    max_iter=240, random_state=26, tol=2e-4)
        wf = model.fit_transform(values)
    h = model.components_
    w = wf.reshape(2, len(freq), -1) * whiten[None, :, None]
    combined = np.sqrt(np.sum(w ** 2, axis=0))
    atoms = []
    for i in range(w.shape[-1]):
        wi = combined[:, i]
        hi = h[i]
        side = float(w[1, :, i].sum() / (w[:, :, i].sum() + 1e-12))
        active = hi > .2 * hi.max()
        segments = np.diff(np.r_[0, active.astype(int), 0])
        max_span = float(np.max(np.flatnonzero(segments == -1) - np.flatnonzero(segments == 1))) * .008
        centroid = float(np.sum(wi * freq) / wi.sum())
        onset = float(np.sum(np.maximum(np.diff(hi), 0)) / np.sum(hi))
        # Adjacent broad-band ratios describe envelope; no hard frequency cut.
        band_edges = np.geomspace(180, 10000, 13)
        bands = np.array([wi[(freq >= left) & (freq < right)].sum()
                          for left, right in zip(band_edges[:-1], band_edges[1:])])
        bands /= bands.sum() + 1e-12
        # Cepstral low coefficients suppress narrow harmonic comb/pitch identity.
        smoothed = gaussian_filter1d(wi, 20)
        envelope = np.interp(np.geomspace(180, 10000, 40), freq, smoothed)
        envelope = np.log(envelope + 1e-8)
        envelope -= envelope.mean()
        from scipy.fft import dct
        cep = dct(envelope, norm="ortho")[1:7]
        cep /= max(1, np.linalg.norm(cep))
        atoms.append({"index": i, "sideFraction": side, "maxActiveSpan": max_span,
                      "centroid": centroid, "onsetFraction": onset,
                      "energy": float(wi.sum() * hi.sum()),
                      "envelope": bands.tolist(), "cepstrum": cep.tolist()})
    use = np.array([a["maxActiveSpan"] < 1.2 and a["centroid"] > 450 for a in atoms])
    indices = np.flatnonzero(use)
    features = np.array([np.r_[np.array(atoms[i]["cepstrum"]) * .6,
                              atoms[i]["sideFraction"] * 2.2,
                              atoms[i]["onsetFraction"] * 1.5,
                              min(atoms[i]["maxActiveSpan"], .8) * .3]
                         for i in indices])
    with threadpool_limits(limits=2):
        km = KMeans(n_clusters=2, n_init=20, random_state=53).fit(features,
                           sample_weight=np.sqrt([atoms[i]["energy"] for i in indices]))
    distances = km.transform(features)
    contrast = np.abs(distances[:, 0] - distances[:, 1]) / (distances.sum(axis=1) + 1e-12)
    group = np.zeros((3, w.shape[-1]))
    group[2] = 1
    for j, i in enumerate(indices):
        confidence = .85 * np.clip((contrast[j] - .02) / .25, 0, 1)
        group[km.labels_[j], i] = confidence
        group[2, i] = 1 - confidence
        atoms[i]["group"] = int(km.labels_[j])
        atoms[i]["confidence"] = float(confidence)
    # Joint MS bases share each activation, allowing harmonics in different
    # stereo directions to travel together instead of splitting every MS bin.
    predicted = np.einsum("gk,cfk,kt->gcft", group, w, h, optimize=True)
    masks = predicted / (predicted.sum(axis=0, keepdims=True) + 1e-12)
    masks[:2] = gaussian_filter1d(masks[:2], .65, axis=-1)
    masks[2] = 1 - masks[:2].sum(axis=0)
    full_ms = np.stack([(x[:, 0] + x[:, 1]) / np.sqrt(2),
                        (x[:, 0] - x[:, 1]) / np.sqrt(2)])
    ff, ft, fz = signal.stft(full_ms, fs=48000, nperseg=6144, noverlap=5760,
                            boundary="zeros", padded=True)
    assert np.allclose(times, ft)
    full_masks = np.zeros((3, 2, len(ff), len(ft)))
    full_masks[:, :, :len(freq)] = masks
    full_masks[2, :, len(freq):] = 1
    audio_outputs = []
    for g in range(3):
        _, rec = signal.istft(fz * full_masks[g], fs=48000, nperseg=6144,
                              noverlap=5760, boundary=True)
        lr = np.stack([(rec[0] + rec[1]) / np.sqrt(2),
                       (rec[0] - rec[1]) / np.sqrt(2)], axis=1)[:len(x)]
        audio_outputs.append(lr)
    files = []
    for name, aud in zip(["候选层A.wav", "候选层B.wav", "未分配剩余.wav"], audio_outputs):
        wavfile.write(out / name, sr, aud.astype(np.float32))
        files.append({"name": name, "rms": float(np.sqrt(np.mean(aud ** 2))),
                      "peak": float(np.abs(aud).max())})
    err = sum(audio_outputs) - x
    report = {"status": "Unvalidated spectral/spatial joint factorization candidates; not confirmed instruments",
              "method": "48 KL-NMF atoms shared across Mid/Side spectra, spatial profile and smooth timbre envelope clustering; long bass/background and uncertain atoms retained in residual; original complex coefficients masked",
              "source": str(SOURCE), "sha256": SHA, "rangeSeconds": [45, 53],
              "iterations": int(model.n_iter_), "elapsedSeconds": time.perf_counter() - started,
              "maxSumError": float(np.abs(err).max()), "rmsSumError": float(np.sqrt(np.mean(err ** 2))),
              "files": files, "atoms": atoms,
              "noGroundTruthOrHumanAudition": True,
              "noNetworkUiAudioDevice": True,
              "sourceUnchanged": hashlib.sha256(SOURCE.read_bytes()).hexdigest() == SHA}
    (out / "diagnostics.json").write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8")
    np.savez_compressed(out / "factorization.npz", W=w, H=h, group=group,
                       masks=masks, frequency=freq, time=times)
    fig, axs = plt.subplots(4, 1, figsize=(14, 10), sharex=True)
    reference = np.sqrt(np.mean(v ** 2, axis=0))
    for ax, material, title in zip(axs, [reference, *[np.sqrt(np.mean((v * mask) ** 2, axis=0)) for mask in masks]],
                                 ["Accepted 07 original", "Joint spatial candidate A", "Joint spatial candidate B", "Unassigned residual"]):
        sel = (freq > 150) & (freq < 8000)
        ax.pcolormesh(times, freq[sel], 20 * np.log10(material[sel] / reference.max() + 1e-7),
                      shading="auto", vmin=-65, vmax=0, cmap="magma")
        ax.set_yscale("log")
        ax.set_ylim(150, 8000)
        ax.set_title(title)
    fig.tight_layout()
    fig.savefig(out / "spectral-review.png", dpi=130)
    plt.close(fig)
    print(json.dumps({k: v for k, v in report.items() if k != "atoms"}, ensure_ascii=False))


if __name__ == "__main__":
    main()
