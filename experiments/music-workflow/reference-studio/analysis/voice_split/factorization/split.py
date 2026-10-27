"""Exploratory original-phase, data-driven spectral atom grouping of accepted 07.

This is an unsupervised listening candidate, not a validated instrument separator.
No resynthesis, note transcription, models, device access, or network access.
"""
from __future__ import annotations

import os
for variable in ("OMP_NUM_THREADS", "OPENBLAS_NUM_THREADS", "MKL_NUM_THREADS",
                 "VECLIB_MAXIMUM_THREADS", "NUMEXPR_NUM_THREADS"):
    os.environ[variable] = "2"

from pathlib import Path
import hashlib
import json
import time
import numpy as np
from scipy import signal
from scipy.ndimage import gaussian_filter1d, median_filter
from scipy.io import wavfile
from sklearn.decomposition import NMF
from sklearn.cluster import KMeans
from threadpoolctl import threadpool_limits
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

ROOT = Path(__file__).resolve().parents[3]
CASE = ROOT / "cases/phone-recording-20261023-233819"
SOURCE = CASE / "试听/07-普通分轨基线.wav"
OUT = CASE / "声部分离试验/factorization"
SHA = "db79615e148120d8183bca8cddf7e4d881beefb09999b45ee9e215b24c672fac"


def audio_read(path):
    sr, x = wavfile.read(path)
    if x.dtype.kind in "iu":
        x = x.astype(np.float64) / 2 ** (x.dtype.itemsize * 8 - 1)
    else:
        x = x.astype(np.float64)
    return sr, x


def describe_atom(w, h, freqs, stereo, spectrum):
    # Choose a harmonic-family candidate, never treating it as verified MIDI.
    midis = np.arange(42, 97)
    f0s = 440 * 2 ** ((midis - 69) / 12)
    bins = []
    scores = []
    for f0 in f0s:
        harmonic_bins = []
        weighted = 0
        for harmonic in range(1, min(15, int(9500 / f0)) + 1):
            use = np.flatnonzero(np.abs(freqs - harmonic * f0)
                                 <= max(12, harmonic * f0 * .008))
            harmonic_bins.extend(use)
            weighted += np.sum(w[use]) / harmonic ** .15
        # Penalize missing lower members a little, without forcing a fundamental.
        fundamental = np.sum(w[np.abs(freqs - f0) < max(12, f0 * .008)])
        scores.append(weighted * (.9 + .1 * min(1, fundamental / (w.max() + 1e-12))))
        bins.append(np.unique(harmonic_bins))
    selected = int(np.argmax(scores))
    f0 = f0s[selected]
    harmonicity = float(w[bins[selected]].sum() / (w.sum() + 1e-12))
    energies = np.array([
        w[np.abs(freqs - harmonic * f0) <= max(12, harmonic * f0 * .009)].sum()
        for harmonic in range(1, 13)])
    energies /= np.sum(energies) + 1e-12
    # Estimate atom-wide left/right distribution from original stereo bins.
    responsibility = w[:, None] * h[None, :] / (spectrum + 1e-10)
    responsibility = np.minimum(responsibility, 1)
    weighted_lr = np.sum(np.abs(stereo) ** 2 * responsibility[None, :, :], axis=(1, 2))
    pan = float((weighted_lr[1] - weighted_lr[0]) / (weighted_lr.sum() + 1e-12))
    active = h > .2 * np.max(h)
    duration_fraction = float(np.mean(active))
    onset_fraction = float(np.sum(np.maximum(np.diff(h), 0)) / (np.sum(h) + 1e-12))
    high = w[freqs > 4000].sum() / (w.sum() + 1e-12)
    return {
        "midiHypothesis": int(midis[selected]), "f0HypothesisHz": float(f0),
        "harmonicity": harmonicity, "pan": pan,
        "durationFraction": duration_fraction, "onsetFraction": onset_fraction,
        "highFraction": float(high), "harmonicShape": energies.tolist(),
        "energy": float(w.sum() * h.sum()),
    }


def main():
    start = time.perf_counter()
    OUT.mkdir(parents=True, exist_ok=True)
    digest = hashlib.sha256(SOURCE.read_bytes()).hexdigest()
    assert digest == SHA
    sr, x = audio_read(SOURCE)
    assert sr == 48000 and x.shape == (384000, 2)
    # The factorization uses 24 kHz only; masks are mapped back to 48 kHz.
    down = signal.resample_poly(x, 1, 2, axis=0)
    freq, times, z = signal.stft(down.T, fs=24000, window="hann", nperseg=3072,
                                noverlap=3072 - 192, boundary="zeros", padded=True)
    v = np.sqrt(np.mean(np.abs(z) ** 2, axis=0))
    whitening = np.maximum(np.mean(v, axis=1), np.max(v) * .0007) ** .55
    weighted = (v / whitening[:, None]).astype(np.float32)
    # Multiplicative KL update models recurring spectral shapes and activations.
    with threadpool_limits(limits=2):
        model = NMF(n_components=36, init="nndsvda", solver="mu",
                    beta_loss="kullback-leibler", max_iter=220,
                    random_state=26, tol=2e-4)
        w0 = model.fit_transform(weighted)
        h = model.components_
    w = w0 * whitening[:, None]
    model_v = w @ h
    atoms = [describe_atom(w[:, i], h[i], freq, z, model_v)
             for i in range(w.shape[1])]
    # Relatively nonharmonic/short noise atoms remain in an unassigned residual.
    usable = np.array([a["harmonicity"] > .38 and a["durationFraction"] > .012
                       for a in atoms])
    indices = np.flatnonzero(usable)
    assert len(indices) >= 4
    features = []
    for i in indices:
        a = atoms[i]
        # Harmonic ratios are fundamental-relative, not a low/high frequency cut.
        harmonic = np.sqrt(np.array(a["harmonicShape"]) + .002)
        features.append(np.r_[harmonic,
                              a["onsetFraction"] * 5,
                              a["durationFraction"], a["pan"] * .6])
    features = np.array(features)
    with threadpool_limits(limits=2):
        km = KMeans(n_clusters=2, random_state=53, n_init=20)
        labels = km.fit_predict(features,
                               sample_weight=np.sqrt([atoms[i]["energy"] for i in indices]))
    distances = km.transform(features)
    contrast = np.abs(distances[:, 0] - distances[:, 1]) / (distances.sum(axis=1) + 1e-12)
    # Ambiguous atoms are assigned softly and mostly held in the residual.
    groups = np.zeros((3, len(atoms)))
    groups[2] = 1
    for j, atom_index in enumerate(indices):
        confidence = np.clip((contrast[j] - .025) / .30, 0, 1) * .88
        groups[labels[j], atom_index] = confidence
        groups[2, atom_index] = 1 - confidence
        atoms[atom_index]["group"] = int(labels[j])
        atoms[atom_index]["confidence"] = float(confidence)
    group_model = np.einsum("gk,fk,kt->gft", groups, w, h, optimize=True)
    masks = group_model / (group_model.sum(axis=0, keepdims=True) + 1e-12)
    # Keep very weak, unexplained/edge bins in residual, never force two voices.
    masks[:2, freq < 100] *= .1
    masks[2] = np.maximum(0, 1 - masks[:2].sum(axis=0))
    masks[:2] = median_filter(masks[:2], size=(1, 1, 3))
    masks[:2] = gaussian_filter1d(masks[:2], .6, axis=2)
    masks[2] = 1 - masks[:2].sum(axis=0)
    full_freq, full_time, full_z = signal.stft(x.T, fs=48000, window="hann",
                     nperseg=6144, noverlap=6144 - 384, boundary="zeros", padded=True)
    assert np.allclose(times, full_time)
    full_masks = np.zeros((3, len(full_freq), len(full_time)))
    full_masks[:, :len(freq)] = masks
    full_masks[2, len(freq):] = 1
    outputs = []
    for g in range(3):
        _, restored = signal.istft(full_z * full_masks[g], fs=48000, window="hann",
                       nperseg=6144, noverlap=6144 - 384, input_onesided=True,
                       boundary=True)
        outputs.append(restored.T[:len(x)])
    names = ["候选声部A.wav", "候选声部B.wav", "未分配剩余.wav"]
    files = []
    for name, audio in zip(names, outputs):
        wavfile.write(OUT / name, sr, audio.astype(np.float32))
        files.append({"name": name, "peak": float(np.max(np.abs(audio))),
                      "rms": float(np.sqrt(np.mean(audio ** 2))),
                      "sha256": hashlib.sha256((OUT / name).read_bytes()).hexdigest()})
    error = sum(outputs) - x
    metadata = {
        "status": "Unvalidated unsupervised spectral atom listening candidates",
        "source": str(SOURCE), "sourceSha256": digest,
        "sourceRangeSeconds": [45, 53], "sampleRate": sr,
        "method": "KL-NMF 36 atoms of full eight seconds; group fundamental-relative harmonic shapes, temporal activation and stereo energy; retain uncertain atoms; original-phase soft masks",
        "notAClaim": ["Two actual instruments proven", "Recovered source score",
                      "Ground-truth pitches", "Auditory acceptance"],
        "iterations": int(model.n_iter_), "seconds": time.perf_counter() - start,
        "sumMaxAbsoluteError": float(np.max(np.abs(error))),
        "sumRmsError": float(np.sqrt(np.mean(error ** 2))),
        "files": files, "atoms": atoms,
        "noAudioUploadOrDeviceOrUi": True,
        "sourceUnchanged": hashlib.sha256(SOURCE.read_bytes()).hexdigest() == SHA,
    }
    (OUT / "diagnostics.json").write_text(json.dumps(metadata, indent=2, ensure_ascii=False), encoding="utf-8")
    np.savez_compressed(OUT / "factorization.npz", frequency=freq, time=times,
                       W=w, H=h, group_weights=groups, masks=masks)
    fig, axes = plt.subplots(4, 1, figsize=(14, 10), sharex=True)
    use = (freq > 150) & (freq < 8000)
    for ax, matrix, title in zip(axes, [v, *[v * m for m in masks]],
                                  ["Accepted 07 original", "Candidate A", "Candidate B", "Unassigned residual"]):
        ax.pcolormesh(times, freq[use], 20 * np.log10(matrix[use] / v.max() + 1e-7),
                      shading="auto", vmin=-65, vmax=0, cmap="magma")
        ax.set_ylim(150, 8000)
        ax.set_yscale("log")
        ax.set_title(title)
        ax.set_ylabel("Hz")
    axes[-1].set_xlabel("Seconds relative to original 45 s")
    fig.tight_layout()
    fig.savefig(OUT / "spectral-review.png", dpi=130)
    plt.close(fig)
    print(json.dumps({k: v for k, v in metadata.items() if k != "atoms"}, ensure_ascii=False))


if __name__ == "__main__":
    main()
