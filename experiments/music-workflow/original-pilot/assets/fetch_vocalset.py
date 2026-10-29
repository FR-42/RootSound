"""Fetch selected CC-BY VocalSet entries by verified bounded HTTP ranges.

Does not download the complete data archive and never opens an audio device.
"""
from pathlib import Path
import argparse
import binascii
import hashlib
import json
import struct
import urllib.request
import zlib

ROOT = Path(__file__).resolve().parent
URL = 'https://zenodo.org/api/records/1442513/files/VocalSet11.zip/content'
SIZE = 2077243579
TOTAL = 0


def get_range(start, count):
    global TOTAL
    if not 0 <= start < SIZE or not 0 < count <= 16 * 1024**2:
        raise ValueError('Unsafe range')
    if TOTAL + count > 30 * 1024**2:
        raise ValueError('Download budget exceeded')
    req = urllib.request.Request(URL, headers={
        'Range': f'bytes={start}-{start + count - 1}',
        'User-Agent': 'RootSound-original-pilot/1.0',
    })
    with urllib.request.urlopen(req, timeout=40) as response:
        expected = f'bytes {start}-{start + count - 1}/{SIZE}'
        if response.status != 206 or response.headers.get('Content-Range') != expected:
            raise RuntimeError(f'Range refused: {response.status}, {response.headers.get("Content-Range")}')
        data = response.read(count + 1)
        if len(data) != count:
            raise RuntimeError('Unexpected range response size')
    TOTAL += count
    return data


def directory():
    tail = get_range(SIZE - 65536, 65536)
    end = tail.rfind(b'PK\x05\x06')
    if end < 0:
        raise RuntimeError('ZIP end missing')
    fields = struct.unpack_from('<4s4H2LH', tail, end)
    cd_size, cd_offset = fields[5:7]
    if 0xFFFFFFFF in (cd_size, cd_offset):
        raise RuntimeError('ZIP64 archive requires separate explicit handling')
    data = get_range(cd_offset, cd_size)
    files = []
    i = 0
    while i < len(data):
        h = struct.unpack_from('<4s6H3L5H2L', data, i)
        if h[0] != b'PK\x01\x02':
            raise RuntimeError('Invalid central directory')
        name = data[i+46:i+46+h[10]].decode('utf-8' if h[3] & 2048 else 'cp437')
        files.append(dict(name=name, method=h[4], crc=h[7], compressed=h[8], size=h[9], offset=h[16]))
        i += 46 + h[10] + h[11] + h[12]
    (ROOT/'vocalset-central-directory.json').write_text(json.dumps(files, ensure_ascii=False, indent=2), encoding='utf-8')
    return files


def extract(entry):
    h = struct.unpack('<4s5H3L2H', get_range(entry['offset'], 30))
    if h[0] != b'PK\x03\x04' or h[2] & 1:
        raise RuntimeError('Invalid/encrypted local ZIP entry')
    start = entry['offset'] + 30 + h[9] + h[10]
    raw = get_range(start, entry['compressed'])
    data = zlib.decompress(raw, -15) if entry['method'] == 8 else raw
    if len(data) != entry['size'] or binascii.crc32(data) & 0xFFFFFFFF != entry['crc']:
        raise RuntimeError('ZIP CRC/size mismatch')
    name = entry['name'].replace('/', '__').replace('\\', '__')
    target = ROOT/'vocalset'/name
    target.parent.mkdir(exist_ok=True)
    target.write_bytes(data)
    return dict(archive_entry=entry['name'], file=str(target.relative_to(ROOT)), bytes=len(data), sha256=hashlib.sha256(data).hexdigest(), zip_crc32=f"{entry['crc']:08x}")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--extract', nargs='*', default=[])
    args = parser.parse_args()
    files = directory()
    if not args.extract:
        candidates = [f for f in files if ('female' in f['name'].lower() or '/f' in f['name'].lower()) and f['name'].lower().endswith('.wav')]
        print(json.dumps(candidates[:100], ensure_ascii=False, indent=2))
    else:
        chosen = [f for f in files if f['name'] in args.extract]
        if len(chosen) != len(args.extract):
            raise RuntimeError('Requested archive paths missing or duplicated')
        result = dict(source_record='https://zenodo.org/records/1442513', license='CC-BY-4.0', archive=URL, downloaded_bytes=0, files=[extract(f) for f in chosen])
        result['downloaded_bytes'] = TOTAL
        (ROOT/'vocalset-download-manifest.json').write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding='utf-8')
        print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
