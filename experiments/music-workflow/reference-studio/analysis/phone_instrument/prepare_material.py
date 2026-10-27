"""Prepare a single-note sampler source from user-approved result 07.

The approved file is read-only. Raw crop remains exact; the separate adapted
crop has only a documented low-frequency accompaniment reduction. No high cut,
denoising, replacement oscillator or guessed reconstruction is applied.
"""
from __future__ import annotations

import hashlib
import json
from pathlib import Path

import numpy as np
from scipy import signal
from scipy.io import wavfile


CASE = Path(__file__).resolve().parents[2] / "cases" / "phone-recording-20261023-233819"
SOURCE = CASE / "试听" / "07-普通分轨基线.wav"
OUT = CASE / "instrument" / "prepared"


def sha(path: Path) -> str:
    with path.open("rb") as stream:
        return hashlib.file_digest(stream, "sha256").hexdigest()


def write_json(path: Path, value: dict) -> None:
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2), encoding="utf-8")


def main() -> None:
    expected = json.loads((CASE / "试听" / "selected-result.json").read_text("utf-8"))["sha256"]
    assert sha(SOURCE) == expected
    sr, pcm = wavfile.read(SOURCE)
    assert sr == 48000 and pcm.shape == (384000, 2) and pcm.dtype == np.int32
    # scipy left-aligns PCM24 in int32. These decoded samples are exact in float32.
    source = pcm.astype(np.float32) / 2147483648.0
    first, last = round(.340 * sr), round(.620 * sr)
    raw = source[first:last].copy()
    sos = signal.butter(4, 350, btype="highpass", fs=sr, output="sos")
    # Process the context, then crop, so filter boundaries are not placed at
    # the musical attack. The full accepted clip remains unchanged on disk.
    adapted = signal.sosfiltfilt(sos, source, axis=0)[first:last].astype(np.float32)
    assert len(raw) == len(adapted) == 13440 and np.isfinite(adapted).all()
    OUT.mkdir(parents=True, exist_ok=True)
    wavfile.write(OUT / "raw-note-Gs5.wav", sr, raw)
    wavfile.write(OUT / "melody-note-Gs5.wav", sr, adapted)
    gain = float(np.clip(20 * np.log10(.45 / max(float(np.abs(adapted).max()), 1e-9)), 0, 24))
    settings = {"RootMidi": 80, "AttackSeconds": .002, "DecaySeconds": .03,
                "Sustain": .95, "ReleaseSeconds": .055, "LoopEnabled": False,
                "LoopStart": 0, "LoopEnd": 0, "LoopCrossfadeSeconds": 0,
                "GainDb": round(gain, 6)}
    write_json(OUT / "short-settings.json", settings)
    f = np.array([92, 175, 350, 622.4181, 697.7659, 830.9271, 1661.8542, 4000, 8000, 16000])
    _, response = signal.sosfreqz(sos, worN=f, fs=sr)
    attenuation = 40 * np.log10(np.maximum(np.abs(response), 1e-30))
    evidence = {"source": str(SOURCE), "sourceSha256": expected,
                "selectionSecondsIn07": [.340, .620], "sourceSongSeconds": [45.340, 45.620],
                "sampleRate": sr, "channels": 2, "frames": len(raw),
                "rawCropExactDecodedSource": bool(np.array_equal(raw, source[first:last])),
                "rootMidi": 80, "rootName": "G#5", "estimatedFundamentalHz": 830.9271,
                "rootIsEstimate": True,
                "adaptation": "4th-order 350Hz highpass applied forward/backward to full8second context; crop afterward",
                "filterResponseDb": [{"hz": float(hz), "db": float(db)} for hz, db in zip(f, attenuation)],
                "highCutApplied": False, "denoisingApplied": False, "synthesisApplied": False,
                "rawPeak": float(np.abs(raw).max()), "adaptedPeak": float(np.abs(adapted).max()),
                "rawRms": float(np.sqrt(np.mean(raw.astype(np.float64) ** 2))),
                "adaptedRms": float(np.sqrt(np.mean(adapted.astype(np.float64) ** 2))),
                "settings": settings,
                "limitations": ["Residual accompaniment/reverb can remain above350Hz",
                                "Single-zone sampling changes duration/timbre when transposed",
                                "Loop suitability and subjective fidelity require listening"],
                "sourceUnchanged": sha(SOURCE) == expected}
    write_json(OUT / "material-manifest.json", evidence)
    print(json.dumps({"output": str(OUT), "gainDb": settings["GainDb"],
                      "rootMidi": 80, "frames": len(raw), "sourceUnchanged": evidence["sourceUnchanged"]}))


if __name__ == "__main__":
    main()
