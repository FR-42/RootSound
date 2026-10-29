"""Offline pitch-window inspection of downloaded singing vowels; no playback."""
from pathlib import Path
import json
import numpy as np
from scipy.io import wavfile
from scipy import signal, ndimage

ROOT = Path(__file__).resolve().parent


def inspect(path):
    sr, raw = wavfile.read(path)
    x = raw.astype(np.float64)
    if np.issubdtype(raw.dtype, np.integer):
        x /= max(abs(np.iinfo(raw.dtype).min), np.iinfo(raw.dtype).max)
    if x.ndim > 1:
        x = x.mean(axis=1)
    x = signal.resample_poly(x, 1, 4)
    fs = sr / 4
    rows = []
    for start in range(0, len(x)-2048, 256):
        z = x[start:start+2048].copy()
        z -= z.mean()
        rms = float(np.sqrt(np.mean(z*z)))
        if rms < 0.008:
            continue
        r = signal.fftconvolve(z, z[::-1])[len(z)-1:]
        lo, hi = int(fs/1100), int(fs/150)
        peaks, _ = signal.find_peaks(r[lo:hi])
        if len(peaks) == 0:
            continue
        peaks += lo
        best = max(r[peaks])
        viable = peaks[r[peaks] >= best*.94]
        k = int(viable[0])
        confidence = float(r[k] / (r[0]+1e-12))
        if confidence < .7:
            continue
        delta = .5*(r[k-1]-r[k+1]) / (r[k-1]-2*r[k]+r[k+1])
        hz = float(fs/(k+delta))
        midi = float(69+12*np.log2(hz/440))
        rows.append(dict(time=start/fs, frequency=hz, midi=midi, key=int(round(midi)), confidence=confidence, rms=rms))
    # Contiguous same-note voiced regions are only candidates, not certified loops.
    groups = []
    for row in rows:
        if groups and row['key'] == groups[-1][-1]['key'] and row['time']-groups[-1][-1]['time'] < .08:
            groups[-1].append(row)
        else:
            groups.append([row])
    windows = []
    for group in groups:
        if len(group) < 13:
            continue
        hz = [r['frequency'] for r in group]
        windows.append(dict(start=round(group[0]['time']+.08, 4), end=round(group[-1]['time']+.1, 4), midi=group[0]['key'], frequencyHz=round(float(np.median(hz)), 4), centsStd=round(float(np.std(1200*np.log2(np.array(hz)/np.median(hz)))), 2)))
    return dict(file=str(path.relative_to(ROOT)), samplerate=sr, durationSeconds=round(len(raw)/sr, 5), windows=windows, note='Signal-estimated stable pitch windows, not a listening or loop-quality acceptance.')


if __name__ == '__main__':
    result = [inspect(path) for path in (ROOT/'vocalset').glob('*.wav')]
    (ROOT/'vocalset-pitch-windows.json').write_text(json.dumps(result, indent=2), encoding='utf-8')
    print(json.dumps(result, indent=2))
