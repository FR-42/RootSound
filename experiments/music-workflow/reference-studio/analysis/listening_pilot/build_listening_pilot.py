"""A bounded listening checkpoint, not an accepted transcription.

Preserves accepted07 and old rejected artifacts. All musical audio stays local.
The self-contained HTML never fetches resources or uses browser rate shifting.
"""
from __future__ import annotations

import base64
import hashlib
import io
import json
import os
from pathlib import Path
import subprocess
import tempfile
import wave

import matplotlib
import numpy as np
from PIL import Image
from scipy import signal
from scipy.io import wavfile

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[4]
STUDIO = HERE.parents[1]
CASE = STUDIO / "cases/phone-recording-20261023-233819"
OUT = CASE / "观察与核对"
CACHE = ROOT / ".cache/listening-pilot"
STRETCH = ROOT / ".cache/stretch-pilot/build/stretch-pilot.exe"
PIANO = CACHE / "piano/PianoCheck.dll"
RATE = 48000
EXPECTED_07 = "db79615e148120d8183bca8cddf7e4d881beefb09999b45ee9e215b24c672fac"


def sha(blob):
    return hashlib.sha256(blob).hexdigest()


def read_audio(path):
    rate, pcm = wavfile.read(path)
    assert rate == RATE and pcm.ndim == 2 and pcm.shape[1] == 2, str(path)
    if pcm.dtype.kind == "i":
        pcm = pcm.astype(np.float64) / 2 ** (pcm.dtype.itemsize * 8 - 1)
    else:
        assert pcm.dtype.kind == "f"
        pcm = pcm.astype(np.float64)
    assert np.isfinite(pcm).all()
    return pcm


def wav_bytes(pcm):
    assert pcm.ndim == 2 and pcm.shape[1] == 2 and np.isfinite(pcm).all()
    assert np.max(np.abs(pcm)) < 1, "Do not silently clip listening output"
    quantized = np.rint(pcm * 8388608).astype("<i4")
    packed = np.frombuffer(quantized.tobytes(), dtype=np.uint8).reshape(-1, 4)[:, :3].tobytes()
    output = io.BytesIO()
    with wave.open(output, "wb") as wav:
        wav.setnchannels(2); wav.setsampwidth(3); wav.setframerate(RATE); wav.writeframes(packed)
    return output.getvalue()


def edge_fade(pcm):
    pcm = pcm.copy()
    n = min(96, len(pcm) // 2)
    fade = np.linspace(0, 1, n)
    pcm[:n] *= fade[:, None]; pcm[-n:] *= fade[::-1, None]
    return pcm


def rms(pcm):
    return float(np.sqrt(np.mean(pcm ** 2)))


def main():
    OUT.mkdir(parents=True, exist_ok=True); CACHE.mkdir(parents=True, exist_ok=True)
    manifest_path = OUT / "delivery.json"
    old = json.loads(manifest_path.read_text("utf-8")) if manifest_path.exists() else {}
    owned = {item["path"]: item["sha256"] for item in old.get("files", [])}
    files = []

    def deliver(name, blob):
        path = OUT / name
        if path.exists() and (name not in owned or sha(path.read_bytes()) != owned[name]):
            raise RuntimeError(f"Refusing to replace unfamiliar or user-modified output: {path}")
        path.parent.mkdir(parents=True, exist_ok=True)
        with tempfile.NamedTemporaryFile(dir=path.parent, delete=False) as temp:
            temp.write(blob); temp_name = temp.name
        os.replace(temp_name, path)
        files.append({"path": name, "sha256": sha(blob), "bytes": len(blob)})

    accepted = next((CASE / "试听").glob("07-*.wav"))
    assert sha(accepted.read_bytes()) == EXPECTED_07, "Accepted source changed; stop"
    original_path = CASE / "input/original-45-53.wav"
    original_hash = sha(original_path.read_bytes())
    selected, original = read_audio(accepted), read_audio(original_path)
    assert selected.shape == original.shape == (384000, 2)
    candidates = {key: json.loads((OUT / f"analysis/candidate-{key}.json").read_text("utf-8"))
                  for key in ("a", "b")}
    focus = candidates["a"]["DurationSeconds"]
    assert focus == candidates["b"]["DurationSeconds"] == 1.08
    differences = [(i, field) for i, (a, b) in enumerate(zip(candidates["a"]["Events"], candidates["b"]["Events"]))
                   for field in a if a[field] != b[field]]
    assert differences == [(1, "Midi")], differences
    assert candidates["a"]["Events"][1]["Midi"] == 77
    assert candidates["b"]["Events"][1]["Midi"] == 80

    assert STRETCH.is_file() and PIANO.is_file(), "Build the isolated helpers first"
    work = Path(tempfile.mkdtemp(prefix="render-", dir=CACHE))
    piano_logs = {}
    audio = {"original": original, "selected": selected}
    for key in ("a", "b"):
        output = work / f"piano-{key}.wav"
        env = dict(os.environ, DOTNET_CLI_HOME=str(ROOT / ".cache/dotnet-home"), DOTNET_CLI_TELEMETRY_OPTOUT="1")
        run = subprocess.run(["dotnet", str(PIANO), str(OUT / f"analysis/candidate-{key}.json"), str(output)],
                             check=True, capture_output=True, text=True, env=env)
        piano_logs[key] = json.loads(run.stdout)
        audio[key] = read_audio(output)
        assert len(audio[key]) == round(focus * RATE)

    # One shared reference gain for A and B: no loudness cue between hypotheses.
    active = selected[round(.025 * RATE):round(focus * RATE)]
    candidate_rms = np.sqrt((rms(audio["a"]) ** 2 + rms(audio["b"]) ** 2) / 2)
    candidate_gain = min(rms(active) / candidate_rms,
                         .8 / max(np.max(np.abs(audio["a"])), np.max(np.abs(audio["b"]))))
    for key in ("a", "b"):
        audio[key] *= candidate_gain

    buffers = {}; processing = []
    for key, pcm in audio.items():
        for speed in (1, .6):
            if speed == 1:
                output = pcm.copy()
            else:
                raw_in, raw_out = work / f"{key}.f32", work / f"{key}-slow.f32"
                pcm.astype("<f4").tofile(raw_in)
                run = subprocess.run([str(STRETCH), str(raw_in), str(raw_out), str(RATE), "2", str(speed)],
                                     check=True, capture_output=True, text=True)
                report = json.loads(run.stdout); report["track"] = key; processing.append(report)
                output = np.fromfile(raw_out, dtype="<f4").reshape(-1, 2).astype(np.float64)
            assert len(output) == round(len(pcm) / speed)
            buffers[(key, speed)] = output
    peak = max(float(np.max(np.abs(pcm))) for pcm in buffers.values())
    headroom_gain = min(1, .95 / peak)
    names = {"original": "原曲", "selected": "07原声", "a": "候选A", "b": "候选B"}
    data = {"focusDuration": focus, "sourceStart": 45,
            "tracks": {}, "images": {}, "status": "unconfirmed listening checkpoint"}
    encoded = {}
    for key in audio:
        data["tracks"][key] = {"duration": len(audio[key]) / RATE, "candidate": key in candidates,
                               "audio": {}, "notes": candidates.get(key, {}).get("Events", [])}
        for speed in (1, .6):
            output = edge_fade(buffers[(key, speed)] * headroom_gain)
            blob = wav_bytes(output); encoded[(key, speed)] = blob
            name = f"audio/{names[key]}-{'原速' if speed == 1 else '慢放'}.wav"
            deliver(name, blob)
            data["tracks"][key]["audio"][str(speed)] = base64.b64encode(blob).decode("ascii")
            with wave.open(io.BytesIO(blob), "rb") as wav:
                assert wav.getnframes() == round(len(audio[key]) / speed)
                assert (wav.getnchannels(), wav.getsampwidth(), wav.getframerate()) == (2, 3, RATE)

    # A common, logarithmic frequency axis for the original and both note overlays.
    frequencies, times, stft = signal.stft(selected.mean(axis=1), RATE, nperseg=4096,
                                         noverlap=4000, boundary="zeros", padded=True)
    hz = 440 * 2 ** ((np.linspace(96, 60, 260) - 69) / 12)
    spectrum = np.array([np.interp(hz, frequencies, column) for column in np.abs(stft).T]).T
    maximum = float(spectrum.max())
    for key, duration in (("opening", focus), ("full", 8)):
        target_times = np.linspace(0, duration, 1200)
        interpolated = np.array([np.interp(target_times, times, row) for row in spectrum])
        colors = matplotlib.colormaps["magma"](np.clip((20 * np.log10(np.maximum(interpolated, 1e-12) / maximum) + 65) / 65, 0, 1))
        blob = io.BytesIO(); Image.fromarray(np.uint8(colors[:, :, :3] * 255)).save(blob, format="PNG")
        deliver(f"analysis/spectrum-{key}.png", blob.getvalue())
        data["images"][key] = "data:image/png;base64," + base64.b64encode(blob.getvalue()).decode("ascii")

    # Standalone A/B checks repeat the same source before each hypothesis.
    for key in ("a", "b"):
        source = buffers[("selected", .6)][:round(focus * RATE / .6)] * headroom_gain
        candidate = buffers[(key, .6)] * headroom_gain
        silence = np.zeros((round(.35 * RATE), 2))
        sequence = np.concatenate([edge_fade(source), silence, edge_fade(candidate)])
        deliver(f"对照-原声与候选{key.upper()}.wav", wav_bytes(sequence))

    js = (HERE / "workbench.js").read_text("utf-8")
    assert "</script" not in js.lower()
    template = (HERE / "workbench.html.template").read_text("utf-8")
    links = " ".join(f'<a href="对照-原声与候选{key.upper()}.wav" download>下载原声与候选{key.upper()}对照</a>' for key in ("a", "b"))
    html = template.replace("__LISTENING_DATA__", json.dumps(data, ensure_ascii=False, separators=(",", ":")).replace("<", "\\u003c"))
    html = html.replace("__WORKBENCH_JS__", js).replace("__DOWNLOAD_LINKS__", links)
    assert "__LISTENING_DATA__" not in html and "__WORKBENCH_JS__" not in html
    deliver("听清这一小段.html", html.encode("utf-8"))
    manifest = {"status": "Awaiting listening; not a confirmed melody or timbre",
                "source07": str(accepted), "source07Sha256": EXPECTED_07,
                "originalExcerptSha256": original_hash, "sourceStartSeconds": 45,
                "focusDurationSeconds": focus, "singleVariable": "Second note MIDI77 versus80",
                "candidates": candidates, "pianoRender": piano_logs,
                "sameCandidateGain": candidate_gain, "commonHeadroomGain": headroom_gain,
                "auditionEdgeFadeSeconds": .002, "stretchProcessing": processing,
                "pitchTimeBackend": "Signalsmith Stretch, MIT; pinned provenance in .cache/stretch-pilot",
                "noAudioUpload": True, "noScreenOrDeviceUse": True,
                "musicalAcceptance": False, "files": files}
    # A prior manifest only authorizes replacing files whose recorded hashes match.
    # Manifest itself is machine evidence, never a user-selected song destination.
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), "utf-8")
    assert sha(accepted.read_bytes()) == EXPECTED_07
    assert sha(original_path.read_bytes()) == original_hash
    print(json.dumps({"output": str(OUT), "focusSeconds": focus, "files": len(files),
                      "sourcePreserved": True, "peakBeforeCommonGain": peak,
                      "htmlBytes": (OUT / "听清这一小段.html").stat().st_size}, ensure_ascii=False))


if __name__ == "__main__":
    main()
