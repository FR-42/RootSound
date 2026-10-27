"""Collect the native-tested instrument, reference crop and listening files."""
from __future__ import annotations

import hashlib
import json
import shutil
import sys
import zipfile
from pathlib import Path

import numpy as np
from scipy.io import wavfile

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "phone_trial"))
from prepare_comparison import pcm24
from prepare_material import CASE, SOURCE, sha


def main() -> None:
    out = CASE / "音色"
    prepared = CASE / "instrument" / "prepared"
    native = CASE / "instrument" / "native-checks" / "short"
    material = json.loads((prepared / "material-manifest.json").read_text("utf-8"))
    checks = json.loads((native / "native-verification.json").read_text("utf-8"))
    instrument = out / "手机旋律-短音.rstimbre"
    assert sha(SOURCE) == material["sourceSha256"]
    assert sha(instrument).upper() == checks["InputSha256"]
    sr, adapted = wavfile.read(prepared / "melody-note-Gs5.wav")
    with zipfile.ZipFile(instrument) as archive:
        samples = np.frombuffer(archive.read("audio.f32"), dtype="<f4").reshape(-1, 2)
        assert np.array_equal(samples, adapted)
    pcm24(out / "手机旋律-采样.wav", adapted, sr)
    rate, raw = wavfile.read(prepared / "raw-note-Gs5.wav")
    pcm24(out / "对照-原始短音.wav", raw, rate)
    copies = {"试听-几个音高.wav": "键盘移调测试.wav",
              "试奏乐句.rsphrase": "可编辑键盘测试.rsphrase",
              "试听-乐句播放.wav": "乐句模块实际渲染.wav"}
    for name, original in copies.items():
        shutil.copyfile(native / original, out / name)
        assert sha(out / name) == sha(native / original)
    # Check delivery WAV quantization against the exact archived sampling data.
    _, decoded = wavfile.read(out / "手机旋律-采样.wav")
    err = float(np.max(np.abs(decoded.astype(np.float64) / 2147483648 - adapted)))
    assert err <= .500001 / 8388608
    loop = json.loads((CASE / "instrument" / "pitch-analysis" / "loop-probe.json").read_text("utf-8"))
    notes = """手机旋律·短音

使用：在“乐句谱写”的通道点击“导入音色”，选择“手机旋律-短音.rstimbre”。
也可在“音色打磨”点击“打开音色”，选择同一文件继续调整。
键盘请选“采样模式”；G♯5（MIDI80）附近可听原音和附近的移调声音。
“试奏乐句.rsphrase”可以通过“从上一个乐句开始”打开，直接看可编辑音符。

“试听-几个音高.wav”来自现有音色引擎，“试听-乐句播放.wav”来自现有乐句引擎。
这些是键盘试音，不是原曲旋律的转写。

来源：用户选定的07，截取其中0.340～0.620秒，对应原录音45.340～45.620秒。
原音高估计G♯5，采样长度0.28秒。单独减弱明显低频伴奏，没有高切、降噪或合成替换。
“对照-原始短音.wav”保留未经该处理的截段；完整07保持不变。
“手机旋律-采样.wav”是原调采样，不含演奏音量/包络；.rstimbre保留这些可调设置。

本版适合短促旋律。稳定部分没有找到足够可靠的循环，延音循环保持关闭；长按后声音
自然结束，不能像持续合成器一样无限延长。仍可能含少量其他声音与混响。
移调同时改变采样速度和时长，先在原音附近使用。

已用现有原生代码验证音色导入/导出、不同按键渲染、乐句内嵌重开与播放。
音色细节是否符合你的要求仍需试听。本轮没有修改原素材、播放设备或应用界面。
"""
    (out / "使用说明.txt").write_text(notes, encoding="utf-8-sig")
    names = [instrument.name, "手机旋律-采样.wav", "对照-原始短音.wav", *copies]
    manifest = {"source": str(SOURCE), "sourceSha256": material["sourceSha256"],
                "sourceUnchanged": sha(SOURCE) == material["sourceSha256"],
                "sourceSongSeconds": [45.340, 45.620], "rootMidiEstimate": 80,
                "instrumentType": "Single-zone one-shot sampler, no sustain loop",
                "rawMaterialPreserved": True, "highCutApplied": False,
                "nativeChecksPassed": len(checks["Checks"]),
                "nativeEvidence": "../instrument/native-checks/short/native-verification.json",
                "materialEvidence": "../instrument/prepared/material-manifest.json",
                "loopEvidence": "../instrument/pitch-analysis/loop-probe.json",
                "loopNotEnabled": True, "loopDecision": "No stable-region loop met independent0.8criterion",
                "sampleWavMaximumQuantizationError": err,
                "files": [{"file": name, "sha256": sha(out / name)} for name in names],
                "userListeningAcceptance": "Pending; selected07source approval does not approve derived instrument"}
    (out / "instrument-delivery.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2), "utf-8")
    print(json.dumps({"directory": str(out), "nativeChecksPassed": len(checks["Checks"]),
                      "sourceUnchanged": manifest["sourceUnchanged"], "loopEnabled": False,
                      "wavQuantizationError": err}))


if __name__ == "__main__":
    main()
