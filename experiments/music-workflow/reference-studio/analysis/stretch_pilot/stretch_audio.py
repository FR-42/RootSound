"""Offline float32 array/WAV wrapper; no playback or network operations."""
from __future__ import annotations

import argparse
import json
from pathlib import Path
import subprocess
import tempfile

import numpy as np
from scipy.io import wavfile

ROOT = Path(__file__).resolve().parents[5]
CACHE = ROOT / ".cache" / "stretch-pilot"
EXECUTABLE = CACHE / "build" / "stretch-pilot.exe"


def stretch_audio(audio: np.ndarray, sample_rate: int, speed: float = 1,
                  pitch_semitones: float = 0) -> tuple[np.ndarray, dict]:
    audio = np.asarray(audio, dtype="<f4")
    was_mono = audio.ndim == 1
    if was_mono:
        audio = audio[:, None]
    if audio.ndim != 2 or not len(audio):
        raise ValueError("Expected nonempty [frames, channels] audio")
    if not EXECUTABLE.is_file():
        raise FileNotFoundError("Build the isolated stretch pilot first")
    temporary_root = CACHE / "temporary"
    temporary_root.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="clip-", dir=temporary_root) as directory:
        input_path = Path(directory) / "input.f32"
        output_path = Path(directory) / "output.f32"
        audio.tofile(input_path)
        result = subprocess.run([str(EXECUTABLE), str(input_path), str(output_path),
                                 str(sample_rate), str(audio.shape[1]), str(speed), str(pitch_semitones)],
                                check=True, capture_output=True, text=True)
        metadata = json.loads(result.stdout)
        output = np.fromfile(output_path, dtype="<f4").reshape(-1, audio.shape[1])
    return (output[:, 0] if was_mono else output), metadata


def read_wav(path: Path) -> tuple[int, np.ndarray]:
    rate, audio = wavfile.read(path)
    if np.issubdtype(audio.dtype, np.signedinteger):
        audio = audio.astype(np.float64) / -float(np.iinfo(audio.dtype).min)
    elif audio.dtype == np.uint8:
        audio = (audio.astype(np.float64) - 128) / 128
    elif not np.issubdtype(audio.dtype, np.floating):
        raise ValueError(f"Unsupported WAV sample type {audio.dtype}")
    return rate, audio.astype("<f4")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("input", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument("--speed", type=float, default=1)
    parser.add_argument("--pitch-semitones", type=float, default=0)
    args = parser.parse_args()
    if args.input.resolve() == args.output.resolve():
        parser.error("Input and output must differ")
    if args.output.exists():
        parser.error("Output already exists; choose a new filename")
    rate, audio = read_wav(args.input)
    result, metadata = stretch_audio(audio, rate, args.speed, args.pitch_semitones)
    wavfile.write(args.output, rate, result.astype("<f4"))
    print(json.dumps(metadata, indent=2))


if __name__ == "__main__":
    main()
