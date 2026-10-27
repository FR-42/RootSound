"""Deliver one targeted original-audio bass/remnant pair for listening.

No model or application is rerun here. Raw estimates, accepted07 and earlier
listening artifacts are read-only. Correct WAV arithmetic is not sound acceptance.
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
TRIAL = CASE / "低音分离试验"
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
    selected_input = TRIAL / "harmonic/wide-low-partials"
    bass_path = selected_input / "低音泛音族候选.wav"
    rest_path = selected_input / "07减去低音泛音族.wav"
    bass, remainder = read_audio(bass_path), read_audio(rest_path)
    assert source.shape == bass.shape == remainder.shape == (384000, 2)
    raw_sum_error = float(np.max(np.abs(bass + remainder - source)))
    assert raw_sum_error < 2e-8
    report = json.loads((selected_input / "extraction-report.json").read_text("utf-8"))
    assert report["sourceSha256"] == EXPECTED_07
    for item in report["files"]:
        assert sha(Path(item["path"]).read_bytes()) == item["sha256"]

    gain = min(2, .9 / max(np.max(np.abs(value)) for value in [source, bass, remainder]))
    source, bass, remainder = [edge_fade(value * gain) for value in [source, bass, remainder]]
    gap = np.zeros((RATE // 4, 2))
    audio = {"00-07原声对照.wav": source,
             "01-低音伴奏候选.wav": bass,
             "02-减弱低音后的声音.wav": remainder,
             "03-原声-低音-剩余对照.wav": np.concatenate([source, gap, bass, gap, remainder])}
    blobs = {name: wav_bytes(value) for name, value in audio.items()}
    for name, blob in blobs.items():
        with wave.open(io.BytesIO(blob), "rb") as wav:
            assert (wav.getframerate(), wav.getnchannels(), wav.getsampwidth(), wav.getnframes()) == (RATE, 2, 3, len(audio[name]))
        emitted = decode(blob)
        assert np.isfinite(emitted).all() and np.max(np.abs(emitted)) < .96
        assert np.max(np.abs(emitted - audio[name])) < .501 / 8388608
    pcm_sum_error = float(np.max(np.abs(decode(blobs["01-低音伴奏候选.wav"])
                     + decode(blobs["02-减弱低音后的声音.wav"])
                     - decode(blobs["00-07原声对照.wav"]))))
    assert pcm_sum_error < 2e-7
    comparison = decode(blobs["03-原声-低音-剩余对照.wav"])
    assert np.all(comparison[384000:396000] == 0)
    assert np.all(comparison[780000:792000] == 0)
    previous_manifests = [CASE / "观察与核对/delivery.json",
                          CASE / "观察与核对/第二轮/delivery.json",
                          CASE / "声部分离试验/试听/delivery.json"]
    protected = {}
    for manifest_path in previous_manifests:
        prior = json.loads(manifest_path.read_text("utf-8"))
        for item in prior["files"]:
            path = manifest_path.parent / item["path"]
            assert sha(path.read_bytes()) == item["sha256"]
            protected[path] = item["sha256"]

    instructions = """先听01：它是否是你听到的那条低音伴奏？
再听02：低音减弱后，想要的主旋律是否保留？

00是07对照。03按07原声8秒→低音8秒→剩余8秒播放，中间各停0.25秒。
本版从07提取低音及共同变化的泛音，不是钢琴重奏或简单低通。
与旋律重叠、无法确定归属的成分采取保守处理，仍可能残留或误分。
全部试听使用相同增益2，未分别归一化；原始07和以前的文件均未改。
这是一份待听辨的提取候选，数值相加还原不代表已正确分离。
"""
    blobs["先听这里.txt"] = instructions.encode("utf-8-sig")
    manifest_path = OUT / "delivery.json"
    previous_delivery = json.loads(manifest_path.read_text("utf-8")) if manifest_path.exists() else {}
    owned = {item["path"]: item["sha256"] for item in previous_delivery.get("files", [])}
    for name in blobs:
        target = OUT / name
        if target.exists() and (name not in owned or sha(target.read_bytes()) != owned[name]):
            raise RuntimeError(f"Refusing to replace unfamiliar or user-modified output: {target}")
    files = []
    for name, blob in blobs.items():
        path = OUT / name
        with tempfile.NamedTemporaryFile(dir=OUT, delete=False) as temporary:
            temporary.write(blob); temporary_path = temporary.name
        os.replace(temporary_path, path)
        files.append({"path": name, "sha256": sha(blob), "bytes": len(blob),
                      "frames": len(audio[name]) if name in audio else None})
    assert sha(source_path.read_bytes()) == EXPECTED_07
    assert all(sha(path.read_bytes()) == digest for path, digest in protected.items())
    result = {"status": "Targeted bass/accompaniment candidate; listening pending",
              "sourceSha256": EXPECTED_07, "sourceRangeSeconds": [45, 53],
              "method": report["method"], "reference": report["reference"],
              "inputVariant": "wide-low-partials: broadened first12 partials only",
              "inputFiles": [{"path": str(path), "sha256": sha(path.read_bytes())} for path in [bass_path, rest_path]],
              "referenceAudioTransplanted": False, "commonAuditionGain": gain,
              "edgeFadeSeconds": .002, "rawFloatSumMaxError": raw_sum_error,
              "pcm24SumMaxError": pcm_sum_error, "priorFilesPreserved": len(protected),
              "inputBandMeasurementsNotMusicalAcceptance": report["bands"],
              "lowRootOctavesConfirmed": False, "musicalAcceptance": False,
              "noAudioUploadOrUiOrDevice": True, "files": files}
    manifest_path.write_text(json.dumps(result, ensure_ascii=False, indent=2), "utf-8")
    print(json.dumps({"output": str(OUT), "files": len(files), "commonGain": gain,
                      "pcmSumMaxError": pcm_sum_error, "sourcePreserved": True,
                      "priorFilesPreserved": len(protected)}, ensure_ascii=False))


if __name__ == "__main__":
    main()
