"""Local low-pitched harmonic observations for accepted 07, no device/network."""
import os
for name in ["OMP_NUM_THREADS", "OPENBLAS_NUM_THREADS", "MKL_NUM_THREADS"]:
    os.environ[name] = "2"
from pathlib import Path
import json
import hashlib
import numpy as np
from scipy import signal
from scipy.io import wavfile
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

ROOT = Path(__file__).resolve().parents[3]
CASE = ROOT / "cases/phone-recording-20261023-233819"
SOURCE = CASE / "试听/07-普通分轨基线.wav"
REFERENCE = CASE / "hdemucs/context-44-54/bass-estimate.wav"
OUT = CASE / "低音分离试验/harmonic"
SHA = "db79615e148120d8183bca8cddf7e4d881beefb09999b45ee9e215b24c672fac"


def read(path):
    sr, x = wavfile.read(path)
    if x.dtype.kind in "iu":
        x = x.astype(float) / 2 ** (x.dtype.itemsize * 8 - 1)
    else:
        x = x.astype(float)
    return sr, x


def stft(x, sr):
    f, t, z = signal.stft(x.T, fs=sr, window="hann", nperseg=8192,
                          noverlap=8192-384, nfft=16384, boundary="zeros", padded=True)
    return f, t, z


def peaks(mag, f, low=45, high=600, count=12):
    use = np.flatnonzero((f > low) & (f < high))
    locations, _ = signal.find_peaks(mag[use], distance=3)
    bins = use[locations]
    selected = bins[np.argsort(mag[bins])[::-1][:count]]
    return [{"hz": float(f[i]), "midi": float(69+12*np.log2(f[i]/440)),
             "amplitude": float(mag[i])} for i in selected]


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    sr, original = read(SOURCE)
    br, reference = read(REFERENCE)
    assert br == sr == 48000
    assert hashlib.sha256(SOURCE.read_bytes()).hexdigest() == SHA
    reference = reference[sr:sr*9]
    f, t, z = stft(original, sr)
    _, _, rz = stft(reference, sr)
    v = np.sqrt(np.mean(np.abs(z) ** 2, axis=0))
    rv = np.sqrt(np.mean(np.abs(rz) ** 2, axis=0))
    windows = []
    for start in np.arange(0, 8, .16):
        use = (t >= start+.02) & (t < start+.14)
        windows.append({"start": float(start), "end": float(start+.16),
                        "07peaks": peaks(np.mean(v[:,use],axis=1),f),
                        "originalBassReferencePeaks": peaks(np.mean(rv[:,use],axis=1),f)})
    (OUT / "low-family-observations.json").write_text(json.dumps({
        "source": str(SOURCE), "sha256": SHA,
        "referencePurpose": "Pitch/activity observation only, no reference audio is added to output",
        "windows": windows}, indent=2, ensure_ascii=False), encoding="utf-8")
    fig, axs = plt.subplots(2, 1, figsize=(15, 7), sharex=True)
    for ax, matrix, title in zip(axs,[v,rv],["07 accepted other stem", "Previously separated original bass, observation reference"]):
        sel = (f > 45)&(f < 1400)
        ax.pcolormesh(t, f[sel], 20*np.log10(matrix[sel]/matrix.max()+1e-8), shading="auto", cmap="magma",vmin=-65,vmax=0)
        ax.set_yscale("log"); ax.set_ylim(45,1400); ax.set_title(title)
        ax.set_yticks([55,82.4,110,155.6,207.7,233.1,311.1,466.2,698.5,932.3,1396.9])
        ax.get_yaxis().set_major_formatter(matplotlib.ticker.ScalarFormatter())
    fig.tight_layout();fig.savefig(OUT / "low-families.png",dpi=130);plt.close(fig)
    for row in windows[:15]:
        print(round(row['start'],2), '07:', [round(p['hz'],1) for p in row['07peaks'][:6]],
              'reference:', [round(p['hz'],1) for p in row['originalBassReferencePeaks'][:5]])


if __name__ == "__main__":
    main()
