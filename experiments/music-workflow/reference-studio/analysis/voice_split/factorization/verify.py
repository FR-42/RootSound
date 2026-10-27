"""Signal-integrity checks and narrow-band observations, not music validation."""
from split import *


def main():
    out = OUT / "joint-spatial"
    sr, original = audio_read(SOURCE)
    paths = [out / "候选层A.wav", out / "候选层B.wav", out / "未分配剩余.wav"]
    audio = []
    files = []
    narrow = {}
    for path in [SOURCE, *paths]:
        sample_rate, x = audio_read(path)
        assert sample_rate == sr and x.shape == original.shape
        assert np.isfinite(x).all() and np.abs(x).max() < 1
        if path != SOURCE:
            audio.append(x)
            files.append({"file": str(path), "sha256": hashlib.sha256(path.read_bytes()).hexdigest(),
                          "frames": len(x), "channels": x.shape[1], "peak": float(np.abs(x).max())})
        ff, tt, z = signal.stft(x.T, fs=sr, nperseg=8192, noverlap=7808,
                                boundary="zeros", padded=True)
        windows = {}
        for start, end in [(.06, .26), (.99, 1.09), (1.16, 1.245), (1.3, 1.4)]:
            row = {}
            for hz in [466, 698, 1398, 2095, 3490]:
                f = np.abs(ff - hz) < 22
                t = (tt >= start) & (tt <= end)
                row[str(hz)] = float(np.sum(np.abs(z[:, f][:, :, t]) ** 2))
            windows[f"{start}-{end}"] = row
        narrow[path.name] = windows
    error = sum(audio) - original
    result = {"checks": "sample count, stereo, finite, no clipping, unchanged source, sum of exported files",
              "sourceUnchanged": hashlib.sha256(SOURCE.read_bytes()).hexdigest() == SHA,
              "floatFileSumMaxError": float(np.max(np.abs(error))),
              "floatFileSumRmsError": float(np.sqrt(np.mean(error ** 2))),
              "files": files,
              "narrowBandEnergyObservations": narrow,
              "notMusicalAcceptance": True,
              "bandsMayBeSharedHarmonicsNotInstrumentLabels": True}
    assert result["sourceUnchanged"]
    assert result["floatFileSumMaxError"] < 1e-6
    (out / "verification.json").write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps({k: v for k, v in result.items() if k != "narrowBandEnergyObservations"}, ensure_ascii=False))


if __name__ == "__main__":
    main()
