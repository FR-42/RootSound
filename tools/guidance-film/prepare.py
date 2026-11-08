import json
import math
from pathlib import Path
import struct
import wave
from PIL import Image

root = Path(__file__).resolve().parents[2]
target = root / '.cache' / 'guidance-film' / 'input'
target.mkdir(parents=True, exist_ok=True)
for name in ['add-voice', 'editing', 'zoom', 'bpm', 'cells', 'extend']:
    source = Image.open(root / 'history' / '2026-11-08-website-guide' / 'guides' / (name + '.webp'))
    frames = target / (name + '-frames')
    frames.mkdir(exist_ok=True)
    lines = ['ffconcat version 1.0']
    for index in range(source.n_frames):
        source.seek(index)
        path = frames / f'{index:05d}.png'
        source.convert('RGB').save(path)
        lines.extend([f"file '{name}-frames/{index:05d}.png'", f"duration {source.info.get('duration', 33) / 1000:.6f}"])
    lines.append(f"file '{name}-frames/{source.n_frames - 1:05d}.png'")
    (target / (name + '.ffconcat')).write_text('\n'.join(lines), encoding='utf-8')
    print(name, source.n_frames, flush=True)

rate = 44100
seconds = 42
audio = [0.0] * (rate * seconds)
melody = [64, 67, 71, 74, 71, 67, 62, 66, 69, 73, 69, 66, 60, 64, 67, 71]
for index in range(72):
    start = .5 + index * .55
    pitch = melody[index % len(melody)]
    frequency = 440 * 2 ** ((pitch - 69) / 12)
    amplitude = .10 if index % 4 else .15
    for n in range(int(rate * 1.8)):
        position = round(start * rate) + n
        if position >= len(audio):
            break
        t = n / rate
        attack = min(1, t / .014)
        value = (math.sin(2 * math.pi * frequency * t) * math.exp(-t * 3.2)
                 + .18 * math.sin(2 * math.pi * frequency * 2 * t) * math.exp(-t * 7)
                 + .05 * math.sin(2 * math.pi * frequency * 3 * t) * math.exp(-t * 12))
        audio[position] += value * amplitude * attack
with wave.open(str(target / 'overture.wav'), 'wb') as out:
    out.setnchannels(2)
    out.setsampwidth(2)
    out.setframerate(rate)
    out.writeframes(b''.join(struct.pack('<hh', round(max(-1, min(1, sample)) * 32767), round(max(-1, min(1, sample)) * 32767)) for sample in audio))
print(json.dumps({'originalSoundtrackSeconds': seconds, 'sampleRate': rate}), flush=True)
