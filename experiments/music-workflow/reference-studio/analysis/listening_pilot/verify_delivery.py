"""Independent checks of delivered WAVs, embedded HTML data and source retention.

These checks validate delivery mechanics, not recognition accuracy or likeness.
"""
from pathlib import Path
import base64
import hashlib
import io
import json
import re
import subprocess
import wave

import numpy as np
from scipy.io import wavfile

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[4]
CASE = HERE.parents[1] / "cases/phone-recording-20261023-233819"
OUT = CASE / "观察与核对"


def digest(blob):
    return hashlib.sha256(blob).hexdigest()


def read(blob):
    rate, values = wavfile.read(io.BytesIO(blob))
    return rate, values.astype(np.float64) / 2147483648


def pitch_of_second_note(values, speed, rate):
    start, end = round(.41 / speed * rate), round(.57 / speed * rate)
    section = values[start:end].mean(axis=1)
    spectrum = np.abs(np.fft.rfft(section * np.hanning(len(section)), 262144))
    frequencies = np.fft.rfftfreq(262144, 1 / rate)
    selected = (frequencies > 590) & (frequencies < 910)
    return float(frequencies[selected][np.argmax(spectrum[selected])])


manifest = json.loads((OUT / "delivery.json").read_text("utf-8"))
for file in manifest["files"]:
    blob = (OUT / file["path"]).read_bytes()
    assert digest(blob) == file["sha256"] and len(blob) == file["bytes"]
assert digest(Path(manifest["source07"]).read_bytes()) == manifest["source07Sha256"]
assert digest((CASE / "input/original-45-53.wav").read_bytes()) == manifest["originalExcerptSha256"]

html = (OUT / "听清这一小段.html").read_text("utf-8")
data = json.loads(re.search(r"window\.LISTENING_DATA=(.*?);</script>", html).group(1))
assert "http://" not in html and "https://" not in html
assert "connect-src 'none'" in html
embedded_script = html.split("<script>")[2].split("</script>")[0]
assert embedded_script == (HERE / "workbench.js").read_text("utf-8")
assert data["focusDuration"] == 1.08
checks = []
expected_names = {"original": "原曲", "selected": "07原声", "a": "候选A", "b": "候选B"}
audio = {}
for key, track in data["tracks"].items():
    for speed in (1, .6):
        blob = base64.b64decode(track["audio"][str(speed)])
        filename = f"audio/{expected_names[key]}-{'原速' if speed == 1 else '慢放'}.wav"
        assert blob == (OUT / filename).read_bytes()
        with wave.open(io.BytesIO(blob), "rb") as wav:
            assert (wav.getframerate(), wav.getnchannels(), wav.getsampwidth()) == (48000, 2, 3)
            assert wav.getnframes() == round(track["duration"] / speed * 48000)
        rate, values = read(blob)
        assert values.shape[1] == 2 and np.isfinite(values).all()
        assert 0 < np.max(np.abs(values)) < .96
        assert np.all(values[0] == 0) and np.all(values[-1] == 0)
        audio[key, speed] = values
        checks.append({"track": key, "speed": speed, "frames": len(values),
                       "peak": float(np.max(np.abs(values)))})

# At original speed, unchanged source samples survive apart from the documented
# 2 ms edge fades and 24-bit quantization. No separation/model is run here.
_, original = wavfile.read(CASE / "input/original-45-53.wav")
_, selected = wavfile.read(manifest["source07"])
selected = selected.astype(np.float64) / 2147483648
for key, expected in (("original", original), ("selected", selected)):
    error = np.max(np.abs(audio[key, 1][96:-96] - expected[96:-96]))
    assert error <= .501 / 8388608

assert manifest["pianoRender"]["a"]["Gain"] == manifest["pianoRender"]["b"]["Gain"]
assert np.array_equal(audio["a", 1][:round(.346*48000)], audio["b", 1][:round(.346*48000)])
pitches = {}
for key, expected in (("a", 440*2**((77-69)/12)), ("b", 440*2**((80-69)/12))):
    pitches[key] = {str(speed): pitch_of_second_note(audio[key, speed], speed, 48000) for speed in (1, .6)}
    assert all(abs(value - expected) < 2 for value in pitches[key].values()), pitches[key]

for key in ("a", "b"):
    blob = (OUT / f"对照-原声与候选{key.upper()}.wav").read_bytes()
    rate, values = read(blob)
    length = round(1.08 / .6 * rate); pause = round(.35 * rate)
    assert len(values) == length * 2 + pause
    assert np.all(values[length:length+pause] == 0)

transport = subprocess.run(["node", str(HERE / "test_transport.cjs")], capture_output=True,
                           text=True, encoding="utf-8", check=True)
report = {"fileHashChecks": len(manifest["files"]), "audio": checks,
          "candidateSecondNoteHz": pitches, "sourcePreserved": True,
          "embeddedDataMatchesWavFiles": True, "embeddedScriptMatchesSource": True,
          "offlineNetworkBlockedByCsp": True, "transportTestsPassed": 14,
          "actualBrowserDecodeTested": False, "screenOrDeviceUsed": False,
          "musicalSimilarityAccepted": False}
(OUT / "analysis/verification.json").write_text(json.dumps(report, indent=2), "utf-8")
(OUT / "analysis/transport-tests.txt").write_text(transport.stdout, "utf-8")
print(json.dumps(report, indent=2))
