"""Make one PCM24 audition of an estimated repeating pattern, not a stem."""
import io
import json
from pathlib import Path
import sys
import wave

import numpy as np
from scipy.io import wavfile

HERE = Path(__file__).resolve().parent
CASE = HERE.parents[1] / "cases/phone-recording-20261023-233819"
TRIAL = CASE / "周期模式试验"
OUT = TRIAL / "试听"
sys.path.insert(0, str(HERE.parent / "listening_pilot"))
from build_listening_pilot import read_audio, sha, wav_bytes


def main():
    source = CASE / "试听/07-普通分轨基线.wav"
    expected = "db79615e148120d8183bca8cddf7e4d881beefb09999b45ee9e215b24c672fac"
    assert sha(source.read_bytes()) == expected
    raw = TRIAL / "估计周期模式-重复播放1.5秒.wav"
    pcm = read_audio(raw)
    assert pcm.shape == (72000, 2)
    gain = 2.0
    blob = wav_bytes(pcm * gain)
    with wave.open(io.BytesIO(blob), "rb") as w:
        assert (w.getframerate(), w.getnchannels(), w.getsampwidth(), w.getnframes()) == (48000, 2, 3, 72000)
    _, decoded = wavfile.read(io.BytesIO(blob))
    decoded = decoded.astype(np.float64) / 2147483648
    error = float(np.max(np.abs(decoded - pcm * gain)))
    assert error <= .501 / 8388608
    assert np.isfinite(decoded).all() and np.max(np.abs(decoded)) < 1
    OUT.mkdir(exist_ok=True)
    output = OUT / "01-估计周期模式-重复播放.wav"
    # Never replace an unfamiliar or user-modified audition.
    if output.exists():
        assert output.read_bytes() == blob
    else:
        output.write_bytes(blob)
    assert sha(source.read_bytes()) == expected
    manifest = {"status": "Local periodic-pattern estimate; listening unvalidated; not an isolated stem",
                "sourceSha256": expected, "inputSha256": sha(raw.read_bytes()),
                "output": output.name, "outputSha256": sha(blob),
                "gain": gain, "quantizationMaxError": error,
                "frames": 72000, "channels": 2, "rate": 48000, "bits": 24,
                "sourceUnchanged": True,
                "warning": "Cross-window transfer remains weak; no instrument purity or melody reconstruction is claimed"}
    (OUT / "delivery.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2), "utf-8")
    print(json.dumps(manifest, ensure_ascii=False))


if __name__ == "__main__":
    main()
