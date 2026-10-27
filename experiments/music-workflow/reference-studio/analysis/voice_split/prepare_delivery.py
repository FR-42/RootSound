"""Package actual original-audio layer candidates, never synthesized substitutes.

Uncertain content stays in a third layer. Numerical reconstruction validates
preservation, not whether the candidates are two real musical instruments.
"""
from __future__ import annotations

import io
import json
import os
from pathlib import Path
import sys
import tempfile
import wave

import numpy as np
from scipy.io import wavfile

HERE = Path(__file__).resolve().parent
STUDIO = HERE.parents[1]
CASE = STUDIO / "cases/phone-recording-20261023-233819"
TRIAL = CASE / "声部分离试验"
OUT = TRIAL / "试听"
sys.path.insert(0, str(HERE.parent / "listening_pilot"))
from build_listening_pilot import edge_fade, read_audio, sha, wav_bytes

EXPECTED_07 = "db79615e148120d8183bca8cddf7e4d881beefb09999b45ee9e215b24c672fac"
RATE = 48000


def decode(blob):
    rate, pcm = wavfile.read(io.BytesIO(blob))
    assert rate == RATE and pcm.dtype == np.int32
    return pcm.astype(np.float64) / 2147483648


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    source_path = CASE / "试听/07-普通分轨基线.wav"
    assert sha(source_path.read_bytes()) == EXPECTED_07
    source = read_audio(source_path)
    inputs = TRIAL / "factorization/joint-spatial"
    input_names = ["候选层A.wav", "候选层B.wav", "未分配剩余.wav"]
    raw = [read_audio(inputs / name) for name in input_names]
    assert source.shape == (384000, 2)
    assert all(value.shape == source.shape and np.isfinite(value).all() for value in raw)
    raw_error = np.max(np.abs(sum(raw) - source))
    assert raw_error < 2e-8
    # One gain for every reference and candidate, not loudness normalization
    # independently favoring a quieter stem. Raw float estimates are untouched.
    maximum_peak = max(np.max(np.abs(value)) for value in [source, *raw])
    gain = min(2, .9 / maximum_peak)
    source_audition = edge_fade(source * gain)
    candidates = [edge_fade(value * gain) for value in raw]
    audio = {"00-07原声对照.wav": source_audition,
             "01-候选声部A.wav": candidates[0],
             "02-候选声部B.wav": candidates[1],
             "03-尚未分开的声音.wav": candidates[2]}
    frames = round(2.4 * RATE)
    gap = np.zeros((RATE // 4, 2))
    short = [edge_fade(value[:frames]) for value in [source_audition, *candidates]]
    audio["04-开头顺序对照.wav"] = np.concatenate([short[0], gap, short[1], gap, short[2], gap, short[3]])

    # Spatial observation only. Mid/Side are not instrument labels. The normal
    # Side stereo file retains [S,-S]; its optional focused audition uses [S,S]
    # to remain audible if the listener/device sums channels to mono.
    mid = source.mean(axis=1)
    side = (source[:, 0] - source[:, 1]) / 2
    middle_stereo = np.column_stack([mid, mid])
    side_stereo = np.column_stack([side, -side])
    assert np.max(np.abs(middle_stereo + side_stereo - source)) < 1e-15
    audio["辅助监听/中心成分.wav"] = edge_fade(middle_stereo * gain)
    audio["辅助监听/左右差异-保留原声场.wav"] = edge_fade(side_stereo * gain)
    audio["辅助监听/左右差异-集中试听.wav"] = edge_fade(np.column_stack([side, side]) * gain)

    blobs = {name: wav_bytes(pcm) for name, pcm in audio.items()}
    for name, blob in blobs.items():
        with wave.open(io.BytesIO(blob), "rb") as wav:
            assert (wav.getframerate(), wav.getnchannels(), wav.getsampwidth(), wav.getnframes()) == (RATE, 2, 3, len(audio[name]))
        emitted = decode(blob)
        assert np.max(np.abs(emitted)) < .96
        assert np.max(np.abs(emitted - audio[name])) < .501 / 8388608
    emitted_sum_error = float(np.max(np.abs(sum(decode(blobs[name]) for name in
        ["01-候选声部A.wav", "02-候选声部B.wav", "03-尚未分开的声音.wav"]) - decode(blobs["00-07原声对照.wav"]))))
    assert emitted_sum_error < 3e-7
    # Keep the first listening rounds and user feedback intact.
    previous = CASE / "观察与核对"
    protected = {}
    for manifest_path in [previous / "delivery.json", previous / "第二轮/delivery.json"]:
        manifest = json.loads(manifest_path.read_text("utf-8"))
        for item in manifest["files"]:
            path = manifest_path.parent / item["path"]
            assert sha(path.read_bytes()) == item["sha256"]
            protected[path] = item["sha256"]

    manifest_path = OUT / "delivery.json"
    previous_delivery = json.loads(manifest_path.read_text("utf-8")) if manifest_path.exists() else {}
    owned = {item["path"]: item["sha256"] for item in previous_delivery.get("files", [])}
    instructions = """先听01、02，再听03。

01、02是两条原声分层候选；03保留尚不能可靠分开的内容。
它们都来自你认可的07，没有钢琴重奏或合成替代。尚未确认它们对应两种真实音色。

00是07对照。04只取开头2.4秒，顺序是原声→A→B→剩余，中间各停0.25秒。
所有试听使用同一个增益，没有分别把某层放大来伪造效果；原始07未改。

辅助监听中的“中心”和“左右差异”只是声场观察，不是两种乐器。
“左右差异-集中试听”将差异声同相放到左右两边，便于听清；它改变试听声场。
原声场版本和未经改动的原始分层保留在本实验其他目录。
"""
    blobs["先听这里.txt"] = instructions.encode("utf-8-sig")
    for name in blobs:
        target = OUT / name
        if target.exists() and (name not in owned or sha(target.read_bytes()) != owned[name]):
            raise RuntimeError(f"Refusing to replace unfamiliar or user-modified file: {target}")
    files = []
    for name, blob in blobs.items():
        target = OUT / name; target.parent.mkdir(parents=True, exist_ok=True)
        with tempfile.NamedTemporaryFile(dir=target.parent, delete=False) as temporary:
            temporary.write(blob); temporary_path = temporary.name
        os.replace(temporary_path, target)
        files.append({"path": name, "sha256": sha(blob), "bytes": len(blob),
                      "frames": len(audio[name]) if name in audio else None})
    assert sha(source_path.read_bytes()) == EXPECTED_07
    assert all(sha(path.read_bytes()) == digest for path, digest in protected.items())
    result = {"status": "Listening candidates, not confirmed two-instrument separation",
              "sourceSha256": EXPECTED_07, "sourceRangeSeconds": [45, 53],
              "method": "Joint Mid/Side spectral-template factorization with shared temporal activation and conservative residual",
              "modelTrial": "Two new exemplar queries nearly identical; not used as primary separation",
              "commonAuditionGain": gain, "edgeFadeSeconds": .002,
              "rawFloatSumMaxError": float(raw_error), "pcm24SumMaxError": emitted_sum_error,
              "priorFilesProtected": len(protected),
              "inputFiles": [{"path": str(inputs / name), "sha256": sha((inputs / name).read_bytes())} for name in input_names],
              "audioUploaded": False, "screenOrRealDeviceUsed": False,
              "musicalAcceptance": False, "files": files}
    manifest_path.write_text(json.dumps(result, ensure_ascii=False, indent=2), "utf-8")
    print(json.dumps({"output": str(OUT), "files": len(files), "commonGain": gain,
                      "pcm24SumMaxError": emitted_sum_error, "sourcePreserved": True,
                      "priorFilesPreserved": len(protected)}, ensure_ascii=False))


if __name__ == "__main__":
    main()
