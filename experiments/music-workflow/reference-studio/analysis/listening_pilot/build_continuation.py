"""Continue one short pitch comparison after the user's local preference for B.

Reuses existing audio/DSP helpers and the exact original07 slow reference.
It does not rebuild the first HTML, rerun models, or change previous artifacts.
"""
from __future__ import annotations

import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import wave

import numpy as np

from build_listening_pilot import CACHE, CASE, EXPECTED_07, OUT, PIANO, RATE, ROOT
from build_listening_pilot import edge_fade, read_audio, sha, wav_bytes

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "stretch_pilot"))
from stretch_audio import stretch_audio


def main():
    destination = OUT / "第二轮"
    analysis = destination / "analysis"
    old_delivery = json.loads((OUT / "delivery.json").read_text("utf-8"))
    feedback = json.loads((OUT / "listening-feedback.json").read_text("utf-8"))
    assert feedback["feedback"][-1]["preferredCandidate"] == "B"
    before = {file["path"]: sha((OUT / file["path"]).read_bytes()) for file in old_delivery["files"]}
    assert all(before[file["path"]] == file["sha256"] for file in old_delivery["files"])
    assert sha(Path(old_delivery["source07"]).read_bytes()) == EXPECTED_07
    candidates = {key: json.loads((analysis / f"candidate-{key}.json").read_text("utf-8")) for key in ("a", "b")}
    duration = candidates["a"]["DurationSeconds"]
    assert 1.08 < duration < 1.6 and candidates["b"]["DurationSeconds"] == duration
    a, b = candidates["a"]["Events"], candidates["b"]["Events"]
    assert len(a) == len(b) == 7
    differences = [(i, field) for i, (left, right) in enumerate(zip(a, b)) for field in left if left[field] != right[field]]
    assert differences == [(4, "Midi")]
    assert (a[4]["Midi"], b[4]["Midi"]) == (70, 77)
    previous = json.loads((OUT / "analysis/candidate-b.json").read_text("utf-8"))["Events"]
    assert a[:3] == b[:3] == previous[:3]
    for note in (a[3], b[3]):
        assert all(note[key] == previous[3][key] for key in ("StartSeconds", "Midi", "Velocity"))

    cache = Path(tempfile.mkdtemp(prefix="continuation-", dir=CACHE))
    rendered, render_logs, stretch_logs = {}, {}, {}
    for key in ("a", "b"):
        output = cache / f"piano-{key}.wav"
        run = subprocess.run(["dotnet", str(PIANO), str(analysis / f"candidate-{key}.json"), str(output)],
                             capture_output=True, text=True, encoding="utf-8", check=True,
                             env=dict(os.environ, DOTNET_CLI_HOME=str(ROOT / ".cache/dotnet-home"),
                                      DOTNET_CLI_TELEMETRY_OPTOUT="1"))
        render_logs[key] = json.loads(run.stdout)
        assert render_logs[key]["Gain"] == 1
        pcm = read_audio(output) * old_delivery["sameCandidateGain"]
        rendered[key], stretch_logs[key] = stretch_audio(pcm, RATE, .6)
        rendered[key] = edge_fade(rendered[key].astype(np.float64))
    frames = round(duration * RATE / .6)
    source = edge_fade(read_audio(OUT / "audio/07原声-慢放.wav")[:frames])
    assert all(len(value) == frames for value in rendered.values())
    assert max(np.max(np.abs(value)) for value in [source, *rendered.values()]) < .95
    gap = np.zeros((round(.35 * RATE), 2))
    waveforms = {"原声-慢放.wav": source}
    for key in ("a", "b"):
        waveforms[f"候选{key.upper()}-慢放.wav"] = rendered[key]
        waveforms[f"对照-原声与下一段{key.upper()}.wav"] = np.concatenate([source, gap, rendered[key]])

    manifest_path = destination / "delivery.json"
    prior = json.loads(manifest_path.read_text("utf-8")) if manifest_path.exists() else {}
    owned = {item["path"]: item["sha256"] for item in prior.get("files", [])}
    blobs = {name: wav_bytes(value) for name, value in waveforms.items()}
    for name in blobs:
        target = destination / name
        if target.exists() and (name not in owned or sha(target.read_bytes()) != owned[name]):
            raise RuntimeError(f"Refusing to overwrite user-modified or unfamiliar output: {target}")
    files = []
    for name, blob in blobs.items():
        target = destination / name
        with tempfile.NamedTemporaryFile(dir=destination, delete=False) as temporary:
            temporary.write(blob); temporary_path = temporary.name
        os.replace(temporary_path, target)
        with wave.open(str(target), "rb") as wav:
            expected = frames if not name.startswith("对照") else frames * 2 + len(gap)
            assert (wav.getframerate(), wav.getnchannels(), wav.getsampwidth(), wav.getnframes()) == (RATE, 2, 3, expected)
        files.append({"path": name, "sha256": sha(blob), "frames": expected, "peak": float(np.max(np.abs(waveforms[name])))})

    # Independent checks of actual emitted samples, including silence and
    # reference-note fundamentals. This does not assess musical correctness.
    note_hz = {}
    for key, expected in (("a", 440 * 2 ** ((70 - 69) / 12)), ("b", 440 * 2 ** ((77 - 69) / 12))):
        emitted = read_audio(destination / f"候选{key.upper()}-慢放.wav")
        start, end = round(1.17 / .6 * RATE), round(1.23 / .6 * RATE)
        section = emitted[start:end].mean(axis=1)
        spectrum = np.abs(np.fft.rfft(section * np.hanning(len(section)), 262144))
        frequencies = np.fft.rfftfreq(262144, 1 / RATE)
        band = np.abs(frequencies - expected) < 25
        measured = float(frequencies[band][np.argmax(spectrum[band])])
        assert abs(measured - expected) < 2
        note_hz[key] = measured
        comparison = read_audio(destination / f"对照-原声与下一段{key.upper()}.wav")
        assert np.all(comparison[frames:frames+len(gap)] == 0)
        assert np.max(np.abs(comparison[:frames] - source)) < .501 / 8388608
    assert np.array_equal(read_audio(destination / "候选A-慢放.wav")[:round(.9/.6*RATE)],
                          read_audio(destination / "候选B-慢放.wav")[:round(.9/.6*RATE)])
    assert all(sha((OUT / path).read_bytes()) == digest for path, digest in before.items())
    assert sha(Path(old_delivery["source07"]).read_bytes()) == EXPECTED_07
    report = {"status": "Next short hypotheses, listening pending", "source07Sha256": EXPECTED_07,
              "sourceRangeSeconds": [45, 45 + duration], "speed": .6,
              "previousFeedback": feedback["feedback"][-1],
              "oneVariable": "Fifth note: A MIDI70/Bb4 versus B MIDI77/F5",
              "sameGainAsOpening": old_delivery["sameCandidateGain"],
              "renderLogs": render_logs, "stretchLogs": stretch_logs,
              "referenceNoteHz": note_hz, "prior13FilesUnchanged": True,
              "noAudioUploadOrUiOrDevice": True, "musicalAcceptance": False, "files": files}
    manifest_path.write_text(json.dumps(report, ensure_ascii=False, indent=2), "utf-8")
    print(json.dumps({"output": str(destination), "sourceSeconds": duration,
                      "comparisonSeconds": (frames * 2 + len(gap)) / RATE,
                      "filesVerified": len(files), "referenceNoteHz": note_hz}, ensure_ascii=False))


if __name__ == "__main__":
    main()
