"""Prepare first five seconds as one model chunk; evaluate only first 1.3s.

The extra context avoids asking a five-second model to infer from mostly padding.
This script never performs network operations or rewrites the source audio.
"""
from pathlib import Path
import hashlib
import json
import numpy as np
from scipy import signal
from scipy.io import wavfile

ROOT = Path(__file__).resolve().parents[6]
CACHE = ROOT / '.cache/muscriptor-experiment'
CASE = ROOT / 'experiments/music-workflow/reference-studio/cases/phone-recording-20261023-233819'
source = next((CASE / '试听').glob('07-*.wav'))
before = hashlib.sha256(source.read_bytes()).hexdigest()
rate, pcm = wavfile.read(source)
if pcm.dtype != np.int32 or rate != 48000:
    raise RuntimeError(f'Unexpected source audio: {pcm.dtype} {rate}')
mono = pcm[:5 * rate].astype(np.float32).mean(axis=1) / 2**31
audio = signal.resample_poly(mono, 1, 3).astype('<f4')
if len(audio) != 80000 or not np.isfinite(audio).all():
    raise RuntimeError('Audio preparation failed')
prepared = CACHE / '07-first-five-seconds-16000.f32'
prepared.write_bytes(audio.tobytes())
metadata = {'source': str(source), 'sourceSha256': before, 'preparedSha256': hashlib.sha256(prepared.read_bytes()).hexdigest(),
    'sourceSampleRate': rate, 'preparedSampleRate': 16000, 'preparedSeconds': 5.0,
    'focusSeconds': [0, 1.3], 'preprocessing': 'int32 stereo average; scipy rational 1/3 resampling; float32',
    'audioUploaded': False, 'sourceUnchanged': hashlib.sha256(source.read_bytes()).hexdigest() == before}
(CACHE / 'audio-provenance.json').write_text(json.dumps(metadata, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps(metadata, ensure_ascii=False))
