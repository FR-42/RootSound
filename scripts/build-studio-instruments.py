import hashlib
import io
import json
import mmap
from pathlib import Path
import re
import struct
import wave

import numpy as np


ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / '.cache/curated-sources'
BANK = 'rootsound-studio-v1'
OUT = ROOT / 'public/instruments' / BANK
CATALOG = ROOT / 'src/workstation/modules/timbre/studio-instrument-definitions.json'

ORCHESTRA = (
    ('violin', '独奏小提琴', '弦乐', 40, 64, 'SViolinVib.sfz'),
    ('viola', '中提琴组', '弦乐', 41, 57, 'ViolaEnsSusVib.sfz'),
    ('cello', '大提琴组', '弦乐', 42, 48, 'CelloEnsSusVib.sfz'),
    ('flute', '管弦长笛', '木管', 73, 72, 'FluteSusVib.sfz'),
    ('trumpet', '管弦小号', '铜管', 56, 64, 'TrumpetSus.sfz'),
    ('trombone', '管弦长号', '铜管', 57, 55, 'TromboneSus.sfz'),
    ('horn', '管弦圆号', '铜管', 60, 53, 'FHornSus.sfz'),
)
INSTRUMENTS = (
    ('piano', '三角钢琴', '键盘', '钢琴', 0, 60),
    ('sax', '次中音萨克斯', '木管', '木管', 66, 60),
    ('bass', '指弹电贝斯', '低音', '贝斯', 33, 40),
    ('guitar', '古典吉他', '拨弦', '吉他', 24, 57),
)
DRUMS = (
    ('kick', '底鼓', 36, 36), ('snare', '军鼓', 38, 38), ('rim', '边击', 37, 37),
    ('hat-closed', '闭镲', 42, 42), ('hat-pedal', '踏板踩镲', 44, 44),
    ('hat-half', '半开镲', 46, 46), ('hat-open', '开镲', 48, 46),
    ('tom-floor', '落地通鼓', 41, 41), ('tom-rack', '架子通鼓', 45, 45),
    ('crash', '吊镲', 49, 49), ('ride', '叮叮镲', 51, 51),
)
KITS = (
    ('black-pearl', '录音室鼓 A', 'Black_Pearl_4_LV2.sf2'),
    ('red-zeppelin', '录音室鼓 B', 'Red_Zeppelin_4_LV2.sf2'),
)
DIZI = ((77, 384956), (79, 384954), (81, 384960), (83, 384958),
        (84, 384957), (86, 384961), (88, 384951), (91, 384952))


def chunks(data, begin=0, end=None):
    end = len(data) if end is None else end
    while begin + 8 <= end:
        key, size = struct.unpack_from('<4sI', data, begin)
        offset = begin + 8
        if offset + size > end:
            raise ValueError(f'Invalid RIFF chunk {key!r}')
        if key in (b'RIFF', b'LIST'):
            yield from chunks(data, offset + 4, offset + size)
        else:
            yield key, (offset, size)
        begin = offset + size + (size & 1)


def write_zone(pcm, rate, root, key_range, velocity, attack, release, level, loop=None, decay=None, sustain=None):
    buffer = io.BytesIO()
    with wave.open(buffer, 'wb') as handle:
        handle.setparams((pcm.shape[1], 2, rate, len(pcm), 'NONE', 'not compressed'))
        handle.writeframes(pcm.astype('<i2', copy=False).tobytes())
    data = buffer.getvalue()
    asset = hashlib.sha256(data).hexdigest() + '.wav'
    if not (OUT / asset).exists():
        (OUT / asset).write_bytes(data)
    result = dict(asset=asset, byteLength=len(data), sampleRate=rate, channels=pcm.shape[1], frames=len(pcm),
                  keyMin=key_range[0], keyMax=key_range[1], velocityMin=velocity[0], velocityMax=velocity[1],
                  rootFrequencyHz=440 * 2 ** ((root - 69) / 12), startSeconds=0, endSeconds=len(pcm) / rate,
                  attackSeconds=max(0, min(2, attack)), releaseSeconds=max(.01, min(4, release)), level=min(1, level))
    if loop and 0 <= loop[0] < loop[1] <= len(pcm):
        result['loop'] = dict(startSeconds=loop[0] / rate, endSeconds=loop[1] / rate)
    if decay is not None:
        result.update(decaySeconds=min(5, decay), sustain=min(1, sustain))
    return result


def read_wav(path):
    raw = path.read_bytes()
    index = dict(chunks(raw))
    fmt, _ = index[b'fmt ']
    tag, channels, rate, _, _, bits = struct.unpack_from('<HHIIHH', raw, fmt)
    if tag not in (1, 65534) or channels not in (1, 2) or bits not in (16, 24):
        raise ValueError(f'Unsupported source WAV {path}')
    start, size = index[b'data']
    pcm = np.frombuffer(raw, '<i2', size // 2, start) if bits == 16 else (
        np.frombuffer(raw, 'u1', size, start).reshape(-1, 3)[:, 1:].copy().view('<i2')
    )
    loop = None
    if b'smpl' in index:
        sampler, length = index[b'smpl']
        if length >= 60 and struct.unpack_from('<I', raw, sampler + 28)[0]:
            loop = struct.unpack_from('<II', raw, sampler + 44)
    return pcm.reshape(-1, channels), rate, loop


def sfz_zones(path):
    entries = dict.fromkeys(('control', 'global', 'group', 'region'))
    region_list = []
    for section, body in re.findall(r'<(\w+)>\s*([^<]*)', path.read_text(encoding='utf-8-sig')):
        body = re.sub(r'//[^\r\n]*', '', body)
        values = dict((key, value.strip()) for key, value in re.findall(r'(\w+)=([^\r\n]*?)(?=\s+\w+=|[\r\n]|$)', body))
        if section in entries:
            entries[section] = values
        if section == 'region' and values.get('seq_position', '1') == '1':
            region_list.append({**(entries['global'] or {}), **(entries['group'] or {}), **values})
    directory = path.parent / entries['control']['default_path'].replace('\\', '/')
    result = []
    for region in region_list:
        pcm, rate, loop = read_wav(directory / region['sample'].replace('\\', '/'))
        root = int(region['pitch_keycenter']) - float(region.get('tune', 0)) / 100
        result.append(write_zone(
            pcm, rate, root, (int(region['lokey']), int(region['hikey'])),
            (int(region.get('lovel', 0)), int(region.get('hivel', 127))),
            float(region.get('ampeg_attack', .005)), float(region.get('ampeg_release', .2)),
            10 ** (float(region.get('volume', 0)) / 20), loop,
        ))
    return result


def dizi_zones():
    result = []
    for i, (key, sound_id) in enumerate(DIZI):
        pcm, rate, _ = read_wav(SOURCE / 'dizi' / f'{key}-{sound_id}.wav')
        middle = pcm[len(pcm) // 4:len(pcm) // 2].mean(axis=1)
        size = max(2 * rate, len(middle))
        spectrum = abs(np.fft.rfft(middle * np.hanning(len(middle)), n=size))
        expected = 440 * 2 ** ((key - 69) / 12)
        low, high = int(expected * .98 * size / rate), int(expected * 1.02 * size / rate)
        peak = (low + np.argmax(spectrum[low:high + 1])) * rate / size
        root = 69 + 12 * np.log2(peak / 440)
        key_min = 0 if i == 0 else (DIZI[i - 1][0] + key) // 2 + 1
        key_max = 127 if i == len(DIZI) - 1 else (key + DIZI[i + 1][0]) // 2
        result.append(write_zone(pcm, rate, float(root), (key_min, key_max), (0, 127), .006, .18, 1))
    return result


def sf2_zones(path, drum_keys=(), piano=False):
    with path.open('rb') as handle, mmap.mmap(handle.fileno(), 0, access=mmap.ACCESS_READ) as raw:
        index = dict(chunks(raw))
        def table(key, fmt):
            start, size = index[key]
            return list(struct.iter_unpack(fmt, raw[start:start + size]))

        presets = table(b'phdr', '<20sHHHIII')
        instruments = table(b'inst', '<20sH')
        samples = table(b'shdr', '<20sIIIIIBbHH')
        pcm_offset, _ = index[b'smpl']

        def zones(bags, gens, start, end, sample_generator):
            shared = {}
            for position in range(start, end):
                local = dict(gens[bags[position][0]:bags[position + 1][0]])
                if sample_generator in local:
                    yield {**shared, **local}
                else:
                    shared.update(local)

        def value(local, parent, generator, default=0):
            def signed(n):
                return n - 65536 if n >= 32768 else n
            return signed(local.get(generator, default)) + signed(parent.get(generator, 0))

        def extent(local, parent, generator):
            a, b = local.get(generator, 0x7f00), parent.get(generator, 0x7f00)
            return max(a & 255, b & 255), min(a >> 8, b >> 8)

        pbag, pgen = table(b'pbag', '<HH'), table(b'pgen', '<HH')
        ibag, igen = table(b'ibag', '<HH'), table(b'igen', '<HH')
        result = {key: [] for key in drum_keys} if drum_keys else {None: []}
        for preset in zones(pbag, pgen, presets[0][3], presets[1][3], 41):
            instrument = preset[41]
            for region in zones(ibag, igen, instruments[instrument][1], instruments[instrument + 1][1], 53):
                low, high = extent(region, preset, 43)
                velocity = extent(region, preset, 44)
                if low > high or velocity[0] > velocity[1]:
                    continue
                targets = [key for key in result if key is None or low <= key <= high]
                if not targets:
                    continue
                bands = ((0, 21), (22, 43), (44, 64), (65, 85), (86, 106), (107, 127))
                if piano:
                    bands = tuple(band for band in bands if velocity[0] <= sum(band) // 2 <= velocity[1])
                    if not bands:
                        continue
                else:
                    bands = (velocity,)
                sample = samples[region[53]]
                _, start, end, ls, le, rate, root, correction, link, kind = sample
                channels = (sample, samples[link]) if kind == 4 else (samples[link], sample) if kind == 2 else (sample,)
                offset = value(region, preset, 0) + 32768 * value(region, preset, 4)
                end_offset = value(region, preset, 1) + 32768 * value(region, preset, 12)
                frames = min(channel[2] + end_offset - channel[1] - offset for channel in channels)
                if frames <= 0:
                    continue
                limit = min(frames, rate * 8) if piano else frames
                pcm = np.column_stack(tuple(np.frombuffer(raw, '<i2', limit, pcm_offset + 2 * (channel[1] + offset))
                                            for channel in channels))
                if limit < frames:
                    fade = min(limit, rate // 4)
                    pcm[-fade:] = np.rint(pcm[-fade:] * np.linspace(1, 0, fade)[:, None]).astype('<i2')
                root = region.get(58, root)
                root = 60 if root > 127 else root
                tuning = value(region, preset, 51) + (value(region, preset, 52) + correction) / 100
                loop = None
                if region.get(54, 0) & 1:
                    loop = (ls - start - offset + value(region, preset, 2) + 32768 * value(region, preset, 45),
                            le - start - offset + value(region, preset, 3) + 32768 * value(region, preset, 50))
                attack = 2 ** (value(region, preset, 34, -12000) / 1200)
                release = 2 ** (value(region, preset, 38, -12000) / 1200)
                level = 10 ** (-value(region, preset, 48) / 200)
                decay = 2 ** (value(region, preset, 36, -12000) / 1200)
                sustain = 10 ** (-value(region, preset, 37) / 200)
                for key in targets:
                    pitch = (root - tuning) if key is None else (root - tuning + 60 - key)
                    extent_keys = (low, high) if key is None else (0, 127)
                    for band in bands:
                        result[key].append(write_zone(pcm, rate, pitch, extent_keys, band, attack, release, level, loop, decay, sustain))
        return {key: list({json.dumps(zone, sort_keys=True): zone for zone in group}.values()) for key, group in result.items()}


def write_json(path, data):
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8', newline='\n')


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    definitions, instruments = [], {}

    def add(key, name, category, midi, zones, library_group=None, **mapping):
        if not zones or len(zones) > 512:
            raise ValueError(f'{key}: invalid number of zones ({len(zones)})')
        key = 'studio-' + key
        definitions.append(dict(key=key, name=name, category=category, libraryGroup=library_group or category, midi=midi, **mapping))
        instruments[key] = zones
        print(key, len(zones), flush=True)

    for key, name, category, group, program, midi in INSTRUMENTS:
        source = next((SOURCE / key).rglob('*.sf2'))
        add(key, name, category, midi, sf2_zones(source, piano=key == 'piano')[None], library_group=group, program=program)
    for key, name, category, program, midi, filename in ORCHESTRA:
        add(key, name, category, midi, sfz_zones(SOURCE / 'vsco-selection' / filename), program=program)
    add('dizi', '竹笛', '木管', 79, dizi_zones(), program=73)
    for kit, title, filename in KITS:
        kit_zones = sf2_zones(SOURCE / 'avl' / filename, tuple(key for _, _, key, _ in DRUMS))
        for voice, label, key, drum in DRUMS:
            add(kit + '-' + voice, f'{title} · {label}', '打击', 60, kit_zones[key], library_group=title, drum=drum)
    write_json(CATALOG, definitions)
    write_json(OUT / 'manifest.json', dict(bank=BANK, instruments=instruments))
    print(f'{len(definitions)} voices, {len({z["asset"] for group in instruments.values() for z in group})} unique samples')


if __name__ == '__main__':
    main()
