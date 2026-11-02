"""378220's shipped idat signature loader, read-only and without audio.

Version6+ stores only classifier metadata/signatures in the covered format.
Older versions embed harmonic objects and are deliberately not read here.
"""
from dataclasses import dataclass
from pathlib import Path
import hashlib
import struct


@dataclass(frozen=True)
class NativeSignatureExample:
    kind_00: int
    instrument_id_04: int
    field_08: int
    name: str
    field_118: float


@dataclass(frozen=True)
class NativeHarmonicSignature:
    values_04: tuple[float, ...]
    values_c4: tuple[float, ...]
    field_184: float
    example_index_188: int


@dataclass(frozen=True)
class NativeSignatureLibrary:
    version: int
    examples: tuple[NativeSignatureExample, ...]
    signatures: tuple[NativeHarmonicSignature, ...]
    source_path: str
    source_sha256: str
    bytes_examined: int
    source_bytes: int


class _Reader:
    def __init__(self, data):
        self.data, self.offset = data, 0
    def unpack(self, format):
        size = struct.calcsize(format)
        if self.offset + size > len(self.data):
            raise ValueError(f'Truncated native signature data at {self.offset}')
        value = struct.unpack_from(format, self.data, self.offset)[0]
        self.offset += size
        return value
    def byte(self): return self.unpack('<B')
    def integer(self): return self.unpack('<I')
    def floating(self): return self.unpack('<f')
    def text(self, capacity):
        result = []
        for _ in range(capacity):
            unit = self.unpack('<H')
            if unit == 13:
                # 5333d0 consumes the next UTF16 word after CR.
                self.unpack('<H')
                return ''.join(result)
            if unit == 0:
                return ''.join(result)
            result.append(chr(unit))
        raise ValueError('Native classifier string exceeds its source buffer')


def load_native_signature_library(path) -> NativeSignatureLibrary:
    """Parse actual owned signatures; no unpickling, imports or target calls."""
    source = Path(path)
    raw = source.read_bytes()
    reader = _Reader(raw)
    version = reader.integer()
    if not 6 <= version <= 8:
        raise NotImplementedError('Only source idat versions6..8 without embedded harmonic objects are covered')
    # Original metadata records are consumed, but builtin definitions are
    # initialized from the executable rather than overwritten with this copy.
    for _ in range(128 if version >= 8 else 512):
        if reader.byte():
            reader.text(512)
            reader.byte(); reader.byte()
            for _ in range(7): reader.floating()
            reader.integer()
            reader.floating(); reader.floating()
    reader.integer(); reader.integer()  # legacy parameters passed only for v<6
    example_count = reader.integer()
    if example_count > (len(raw)-reader.offset)//12:
        raise ValueError('Native signature example count exceeds recorded data')
    examples = []
    for _ in range(example_count):
        kind = reader.byte()
        instrument = reader.integer()
        if instrument in (1, 2): instrument = 1
        elif instrument in (4, 5): instrument = 4
        elif instrument == 8: instrument = 7
        field08 = reader.byte()
        name = reader.text(128)
        examples.append(NativeSignatureExample(kind, instrument, field08, name, reader.floating()))
    signature_count = reader.integer()
    if signature_count > (len(raw)-reader.offset)//9:
        raise ValueError('Native harmonic signature count exceeds recorded data')
    signatures = []
    for _ in range(signature_count):
        count = reader.byte()
        if count > 48:
            raise ValueError('Native signature harmonic count exceeds source48 fields')
        primary, secondary = [], []
        for _ in range(count):
            primary.append(reader.floating()); secondary.append(reader.floating())
        field184 = reader.floating()
        example_index = reader.integer()
        if example_index >= example_count:
            raise ValueError('Native harmonic signature references a missing example')
        signatures.append(NativeHarmonicSignature(tuple(primary), tuple(secondary), field184, example_index))
    return NativeSignatureLibrary(version, tuple(examples), tuple(signatures), str(source.resolve()),
                                  hashlib.sha256(raw).hexdigest(), reader.offset, len(raw))
