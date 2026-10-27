"""Offline synthetic integrity checks. They do not judge musical quality."""
from __future__ import annotations

import json
from pathlib import Path
import subprocess

import numpy as np

ROOT = Path(__file__).resolve().parents[5]
CACHE = ROOT / ".cache" / "stretch-pilot"
EXECUTABLE = CACHE / "build" / "stretch-pilot.exe"
WORK = CACHE / "verification"
RATE = 48000


def render(audio: np.ndarray, speed: float, semitones: float = 0) -> tuple[np.ndarray, dict]:
    WORK.mkdir(parents=True, exist_ok=True)
    input_path = WORK / "测试输入.f32"
    output_path = WORK / f"output-{len(audio)}-{speed}-{semitones}.f32"
    audio.astype("<f4").tofile(input_path)
    result = subprocess.run([str(EXECUTABLE), str(input_path), str(output_path), str(RATE),
                             str(audio.shape[1]), str(speed), str(semitones)],
                            check=True, capture_output=True, text=True)
    metadata = json.loads(result.stdout)
    output = np.fromfile(output_path, dtype="<f4").reshape(-1, audio.shape[1])
    assert len(output) == round(len(audio) / speed)
    assert np.isfinite(output).all()
    return output, metadata


def peak_hz(audio: np.ndarray) -> float:
    mono = audio[int(.25 * RATE):-int(.25 * RATE), 0].astype(np.float64)
    spectrum = np.abs(np.fft.rfft(mono * np.hanning(len(mono)), n=2 ** 20))
    return np.argmax(spectrum) * RATE / 2 ** 20


def main() -> None:
    time = np.arange(2 * RATE) / RATE
    tone = .3 * np.sin(2 * np.pi * 440 * time)
    stereo = np.column_stack([tone, .5 * tone]).astype("<f4")
    unity, unity_metadata = render(stereo, 1)
    assert np.array_equal(stereo, unity)
    slow, slow_metadata = render(stereo, .6)
    hz = peak_hz(slow)
    assert abs(hz - 440) < .5, hz
    stereo_error = float(np.max(np.abs(slow[:, 1] - .5 * slow[:, 0])))
    stereo_rms_error = float(np.sqrt(np.mean((slow[:, 1] - .5 * slow[:, 0]) ** 2)))
    stereo_correlation = float(np.corrcoef(slow.T)[0, 1])
    assert stereo_error < .003 and stereo_rms_error < 1e-4 and stereo_correlation > .999
    start_rms = float(np.sqrt(np.mean(slow[:int(.02 * RATE)] ** 2)))
    end_rms = float(np.sqrt(np.mean(slow[-int(.02 * RATE):] ** 2)))
    assert start_rms > .03 and end_rms > .03, (start_rms, end_rms)

    # A clip shorter than the analysis pre-roll must retain its beginning and
    # tail rather than being silently replaced with zeros by exact().
    short, short_metadata = render(stereo[:int(.05 * RATE)], .6)
    assert float(np.sqrt(np.mean(short ** 2))) > .03
    raised, raised_metadata = render(stereo, 1, 12)
    raised_hz = peak_hz(raised)
    assert abs(raised_hz - 880) < 1, raised_hz
    report = {"unity_bit_exact": True, "slowdown": slow_metadata,
              "measured_hz": hz, "stereo_proportion_max_error": stereo_error,
              "stereo_proportion_rms_error": stereo_rms_error,
              "stereo_correlation": stereo_correlation,
              "first_20ms_rms": start_rms, "last_20ms_rms": end_rms,
              "short_clip": short_metadata, "octave_up": raised_metadata,
              "octave_up_measured_hz": raised_hz,
              "limitation": "Synthetic integrity only; no subjective listening or music-quality acceptance."}
    (CACHE / "verification.json").write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
