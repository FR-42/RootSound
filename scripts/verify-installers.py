import gzip
import hashlib
import io
import json
import pathlib
import plistlib
import stat
import struct
import xml.etree.ElementTree as ET
import zlib

ROOT = pathlib.Path(__file__).resolve().parents[1]
plan = json.loads((ROOT / '.cache/release-package-plan.json').read_text('utf-8'))
output = ROOT / 'release' / plan['version']
package = output / '简乐安装.pkg'


class Slice(io.RawIOBase):
    def __init__(self, source, offset, length):
        self.source, self.offset, self.length, self.position = source, offset, length, 0
    def read(self, size=-1):
        size = self.length - self.position if size < 0 else min(size, self.length - self.position)
        self.source.seek(self.offset + self.position)
        data = self.source.read(size)
        self.position += len(data)
        return data
    def readable(self):
        return True
    def readinto(self, buffer):
        data = self.read(len(buffer))
        buffer[:len(data)] = data
        return len(data)


with package.open('rb') as source:
    magic, header_size, version, compressed, expanded, algorithm = struct.unpack('>IHHQQI', source.read(28))
    assert magic == 0x78617221 and version == 1 and algorithm == 1
    toc_compressed = source.read(compressed)
    toc_raw = zlib.decompress(toc_compressed)
    assert len(toc_raw) == expanded
    toc = ET.fromstring(toc_raw).find('toc')
    heap = header_size + compressed
    source.seek(heap)
    assert source.read(20) == hashlib.sha1(toc_compressed).digest()
    members = {}
    def collect(parent, prefix=''):
        for entry in parent.findall('file'):
            name = prefix + entry.findtext('name')
            if entry.find('data') is not None:
                members[name] = entry.find('data')
            collect(entry, name + '/')
    collect(toc)
    for name, data in members.items():
        stream = Slice(source, heap + int(data.findtext('offset')), int(data.findtext('length')))
        assert hashlib.file_digest(stream, 'sha1').hexdigest() == data.findtext('archived-checksum'), name
    def read_member(name):
        data = members[name]
        source.seek(heap + int(data.findtext('offset')))
        raw = source.read(int(data.findtext('length')))
        if data.find('encoding').get('style') == 'application/x-gzip':
            raw = zlib.decompress(raw)
        assert len(raw) == int(data.findtext('size'))
        assert hashlib.sha1(raw).hexdigest() == data.findtext('extracted-checksum')
        return raw
    distribution = ET.fromstring(read_member('Distribution'))
    options = distribution.find('options')
    assert options.get('hostArchitectures') == 'arm64' and options.get('customize') == 'allow'
    choice = next(item for item in distribution.findall('choice') if item.get('id') == 'com.rootsound.desktop')
    assert choice.get('customLocation') == '/Applications' and choice.get('customLocationAllowAlternateVolumes') == 'true'
    assert choice.get('visible') == 'true'
    assert distribution.find('background').get('file') == 'background.png'
    assert read_member('Resources/background.png').startswith(b'\x89PNG')
    assert '简乐' in read_member('Resources/welcome.html').decode('utf-8')
    prefix = 'com.rootsound.desktop.pkg/'
    metadata = ET.fromstring(read_member(prefix + 'PackageInfo'))
    assert metadata.get('version') == plan['macBuildVersion']
    assert metadata.find('bundle').get('CFBundleVersion') == plan['macBundleVersion']
    assert metadata.find('atomic-update-bundle/bundle').get('id') == 'com.rootsound.desktop'
    payload = members[prefix + 'Payload']
    stream = gzip.GzipFile(fileobj=Slice(source, heap + int(payload.findtext('offset')), int(payload.findtext('length'))))
    seen, links, executables = set(), 0, 0
    def read_exact(length):
        value = stream.read(length)
        assert len(value) == length, 'Truncated CPIO'
        return value
    while True:
        header = read_exact(76)
        assert header[:6] == b'070707'
        mode, size, name_size = int(header[18:24], 8), int(header[65:76], 8), int(header[59:65], 8)
        name = read_exact(name_size).rstrip(b'\0').decode('utf-8')
        if name == 'TRAILER!!!':
            break
        relative = name.removeprefix('./')
        assert relative not in seen and not name.startswith('/') and '..' not in relative.split('/')
        seen.add(relative)
        digest = hashlib.sha256()
        body = bytearray() if relative.endswith('/Info.plist') or stat.S_ISLNK(mode) else None
        remaining = size
        while remaining:
            block = read_exact(min(remaining, 1024 * 1024))
            digest.update(block)
            if body is not None:
                body.extend(block)
            remaining -= len(block)
        if stat.S_ISLNK(mode):
            assert body.decode('utf-8') == plan['macLinks'][relative]
            links += 1
        elif stat.S_ISREG(mode):
            original = pathlib.Path(plan['mac']) / relative
            with original.open('rb') as file:
                assert digest.hexdigest() == hashlib.file_digest(file, 'sha256').hexdigest(), relative
            if mode & 0o111:
                executables += 1
            if relative == 'RootSound.app/Contents/Info.plist':
                assert plistlib.loads(body)['CFBundleVersion'] == plan['macBundleVersion']
        else:
            assert stat.S_ISDIR(mode)
    assert links == len(plan['macLinks'])
    for path in ['RootSound.app/Contents/MacOS/Electron', 'RootSound.app/Contents/Resources/app/runtime/dotnet']:
        assert path in seen
    report = {'version': plan['version'], 'macPkgEntries': len(seen), 'macLinks': links,
              'macExecutableFiles': executables, 'macPayloadMatchesPreparedBuild': True,
              'customLocationEnabled': True, 'atomicBundleUpgradeEnabled': True, 'actualMacExecution': False}
    (ROOT / '.test-output/release-installer-verification.json').write_text(json.dumps(report, indent=2), encoding='utf-8')
    print(json.dumps(report, indent=2))
