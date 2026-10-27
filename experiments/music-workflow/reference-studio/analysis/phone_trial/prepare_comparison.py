"""Prepare aligned listening files from a local model trial, without synthesis.

The original samples and raw model estimates remain separate. A remainder is
original minus one candidate, not a claim that accompaniment was recovered.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import math
import wave
from pathlib import Path

import numpy as np
from scipy.io import wavfile
from scipy.signal import resample_poly


def digest(path: Path) -> str:
    with path.open("rb") as stream:
        return hashlib.file_digest(stream, "sha256").hexdigest()


def read_float(path: Path) -> tuple[int, np.ndarray]:
    rate, samples = wavfile.read(path)
    if samples.dtype.kind == "i":
        samples = samples.astype(np.float32) / (2 ** (samples.dtype.itemsize * 8 - 1))
    elif samples.dtype.kind == "u":
        samples = (samples.astype(np.float32) - 128) / 128
    else:
        samples = samples.astype(np.float32)
    if samples.ndim == 1:
        samples = samples[:, None]
    if samples.ndim != 2 or samples.shape[1] not in (1, 2):
        raise ValueError(f"Unsupported channels: {path}")
    if not np.isfinite(samples).all():
        raise ValueError(f"Non-finite model output: {path}")
    return int(rate), samples


def pcm24(path: Path, samples: np.ndarray, rate: int = 48000) -> None:
    if np.max(np.abs(samples), initial=0) >= 1:
        raise ValueError("Listening output would clip; use a shared gain and record it")
    values = np.rint(samples.astype(np.float64) * 8388608).astype(np.int32).ravel()
    data = np.empty((len(values), 3), np.uint8)
    data[:, 0] = values & 255
    data[:, 1] = (values >> 8) & 255
    data[:, 2] = (values >> 16) & 255
    with wave.open(str(path), "wb") as output:
        output.setnchannels(samples.shape[1])
        output.setsampwidth(3)
        output.setframerate(rate)
        output.writeframes(data.tobytes())


def stats(samples: np.ndarray) -> dict:
    return {"rms": float(np.sqrt(np.mean(samples.astype(np.float64) ** 2))),
            "peak": float(np.max(np.abs(samples), initial=0)),
            "frames": len(samples), "channels": samples.shape[1]}


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--case", type=Path, required=True)
    parser.add_argument("--model-dir", type=Path, required=True)
    parser.add_argument("--model-name", default="MuS3D BS-Locoformer query + SEG")
    parser.add_argument("--group", default="mus3d")
    parser.add_argument("--include", action="append", help="Keep only these raw filename stems")
    args = parser.parse_args()
    case = args.case.resolve()
    manifest = json.loads((case / "source-manifest.json").read_text("utf-8"))
    source = Path(manifest["source"])
    if digest(source) != manifest["sourceSha256"]:
        raise ValueError("Source changed since the trial began")
    rate, original = read_float(case / "input" / "original-45-53.wav")
    assert rate == 48000 and original.shape == (384000, 2)
    output = case / "audition" / args.group
    floats = output / "float-estimates"
    floats.mkdir(parents=True, exist_ok=True)
    pcm24(output / "00-original-45-53.wav", original)
    candidates = []
    run_manifest = args.model_dir / "run-manifest.json"
    declared = None
    if run_manifest.exists():
        declared = {item["file"] for item in json.loads(run_manifest.read_text("utf-8"))["outputs"]}
    for path in sorted(args.model_dir.glob("*.wav")):
        if declared is not None and path.name not in declared:
            continue
        if path.stem.lower() in {"mix", "mixture", "original"} or path.stem.lower().startswith("mixture-"):
            continue
        if args.include and path.stem not in args.include:
            continue
        sr, whole = read_float(path)
        source_channels = whole.shape[1]
        if abs(len(whole) / sr - 10) > .01:
            raise ValueError(f"Expected 44–54 second context: {path}")
        factor = math.gcd(sr, rate)
        whole = resample_poly(whole, rate // factor, sr // factor, axis=0).astype(np.float32)
        if whole.shape[1] == 1:
            whole = np.repeat(whole, 2, axis=1)
        target = whole[48000:432000].copy()
        assert target.shape == original.shape
        number = len(candidates) + 1
        prefix = f"{number:02d}-{path.stem}"
        remainder = original - target
        # A shared gain preserves level relationships in all three comparisons.
        peak = max(float(np.abs(original).max()), float(np.abs(target).max()),
                   float(np.abs(remainder).max()))
        gain = min(1.0, .98 / max(peak, 1e-12))
        wavfile.write(floats / f"{prefix}.wav", rate, target)
        pcm24(output / f"{prefix}-candidate.wav", target * gain)
        pcm24(output / f"{prefix}-remainder.wav", remainder * gain)
        gap = np.zeros((rate // 4, 2), np.float32)
        sequence = np.concatenate([original, gap, target, gap, remainder]) * gain
        pcm24(output / f"{prefix}-comparison.wav", sequence)
        assert np.max(np.abs((target + remainder) - original)) < 1e-6
        candidates.append({"number": number, "modelLabelNotVerified": path.stem,
                           "sourceEstimate": str(path), "sourceEstimateSha256": digest(path),
                           "sourceRate": sr, "originalChannels": source_channels,
                           "candidate": f"{prefix}-candidate.wav",
                           "remainder": f"{prefix}-remainder.wav",
                           "comparison": f"{prefix}-comparison.wav", "sharedListeningGain": gain,
                           "stats": stats(target),
                           "warning": "Model estimate; not confirmed target timbre or original stem. "
                                      "Remainder is original minus estimate, not verified accompaniment."})
    if not candidates:
        raise ValueError("The model produced no candidate audio; no success can be claimed")
    result = {"model": args.model_name, "targetSeconds": [45, 53], "contextSeconds": [44, 54],
              "sourceSha256": manifest["sourceSha256"], "originalUnchanged": digest(source) == manifest["sourceSha256"],
              "audioUploaded": False, "sampleRate": rate, "audioFormat": "PCM24 preview; float32 estimates retained",
              "comparisonOrder": ["8s original", ".25s silence", "8s candidate", ".25s silence", "8s original minus candidate"],
              "candidates": candidates, "listeningAcceptance": "Not performed; user review required"}
    (output / "comparison-manifest.json").write_text(json.dumps(result, ensure_ascii=False, indent=2), "utf-8")
    print(json.dumps({"output": str(output), "candidates": len(candidates), "originalUnchanged": result["originalUnchanged"]}))


if __name__ == "__main__":
    main()
