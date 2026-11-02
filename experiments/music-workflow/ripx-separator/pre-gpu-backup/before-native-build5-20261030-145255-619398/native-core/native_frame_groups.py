"""Static reconstruction of RipX.exe 0x140344d40's per-frame group assembly.

This is NOT a note-on/off detector. Input is the already refined 0x4c harmonic
records emitted by 0x1403443e0. The consumer 0x1403449c0 still owns the subsequent
internal-record update. No target code, models, media, or shared libraries load.

Evidence: ev_b1eebb1f2e8bef1c0712f52c249293a6f697e0282752108f4e388b83434f3810
Target SHA256: 5f088fa4fbbe1759ef75d8034c79f33c846e3bf5f13d5048dd95a6614d2ad441
"""
from dataclasses import dataclass
import struct

HARMONIC_RECORD_BYTES = 0x4C
GROUP_RECORD_BYTES = 0xD8
MAX_FRAME_GROUPS = 112
HARMONICS_PER_GROUP = 48
EXPANDED_GROUP_BYTES = 0x9E0


@dataclass(frozen=True)
class FrameGroups:
    groups: tuple[bytes, ...]
    marked_records: bytes
    remaining_unmarked: tuple[int, ...]


def assemble_frame_groups(records: bytes) -> FrameGroups:
    """Return exact group bytes and native bit-2 marks, without mutating input.

    +0x31 bit mask 2 marks consumed records; +0x34 is the grouping key;
    +0x49 (1..48) selects the int32 slot after a raw 24-byte copied header.
    Later records with the same group key overwrite duplicate harmonic slots.
    At most 112 distinct groups are assembled; remaining records are reported.

    Record-length and harmonic-index checks are reconstruction boundary guards;
    the original producer is assumed to supply structurally valid records.
    """
    if len(records) % HARMONIC_RECORD_BYTES:
        raise ValueError('Incomplete 0x4c harmonic record')
    count = len(records) // HARMONIC_RECORD_BYTES
    for index in range(count):
        harmonic = records[index * HARMONIC_RECORD_BYTES + 0x49]
        if not 1 <= harmonic <= HARMONICS_PER_GROUP:
            raise ValueError(f'Harmonic index outside recovered 1..48 layout: {harmonic}')
    mutable = bytearray(records)
    groups = []
    for index in range(count):
        offset = index * HARMONIC_RECORD_BYTES
        if mutable[offset + 0x31] & 2:
            continue
        group = bytearray(GROUP_RECORD_BYTES)
        group[:24] = mutable[offset + 0x34:offset + 0x4C]
        group[24:] = b'\xff' * (HARMONICS_PER_GROUP * 4)
        key = mutable[offset + 0x34:offset + 0x38]
        for candidate in range(index, count):
            position = candidate * HARMONIC_RECORD_BYTES
            if mutable[position + 0x34:position + 0x38] != key:
                continue
            mutable[position + 0x31] |= 2
            harmonic = mutable[position + 0x49]
            struct.pack_into('<I', group, 24 + (harmonic - 1) * 4, candidate)
        groups.append(bytes(group))
        if len(groups) == MAX_FRAME_GROUPS:
            break
    remaining = tuple(index for index in range(count)
                      if not mutable[index * HARMONIC_RECORD_BYTES + 0x31] & 2)
    return FrameGroups(tuple(groups), bytes(mutable), remaining)


def expand_frame_groups(groups: tuple[bytes, ...], records: bytes,
                        component_slots: int) -> tuple[bytes, ...]:
    """Reconstruct 0x1403449c0's 0xd8 -> 0x9e0 per-frame representation.

    Direct objdump instruction evidence: direct-3449c0.asm. The fifth native
    argument is the 0x4c source-record array, omitted by the earlier decompiler.
    component_slots is explicitly supplied as DAT_1409399fc+DAT_140939a00;
    its initialization is not recovered here, so there is deliberately no default.
    Neither this packing nor its 48 harmonic slots imply final musical notes.
    """
    if not isinstance(component_slots, int) or not 0 <= component_slots <= 3:
        raise ValueError('Only the recovered zero-to-three component layout is supported')
    if len(records) % HARMONIC_RECORD_BYTES:
        raise ValueError('Incomplete 0x4c harmonic record')
    if len(groups) > MAX_FRAME_GROUPS:
        raise ValueError('The recovered frame holds at most 112 groups')
    expanded = []
    for group in groups:
        if len(group) != GROUP_RECORD_BYTES:
            raise ValueError('Incomplete 0xd8 group record')
        output = bytearray(EXPANDED_GROUP_BYTES)
        output[0:4] = group[8:12]
        kind = group[20]
        flags = 0 if kind == 1 else 0x8000
        if kind in (16, 17) or kind in (18, 64) and struct.unpack_from('<I', group, 4)[0]:
            flags |= 4
        struct.pack_into('<H', output, 4, flags)
        output[0x9C8:0x9CC] = group[16:20]
        output[0x9CC] = HARMONICS_PER_GROUP
        output[0x9CD] = kind
        output[0x9D0:0x9D4] = group[4:8]
        output[0x9D8:0x9DC] = group[0:4]
        for harmonic, index in enumerate(struct.unpack_from('<48i', group, 24)):
            target = 8 + harmonic * 0x34
            if index < 0:
                count = 1
            else:
                if index >= len(records) // HARMONIC_RECORD_BYTES:
                    raise ValueError('Group points beyond harmonic source array')
                source = index * HARMONIC_RECORD_BYTES
                count = records[source + 0x30]
                if count > 3:
                    raise ValueError('Source component count exceeds the recovered record')
                for component in range(min(component_slots, count)):
                    at = component * 16
                    output[target + at:target + at + 16] = records[source + at:source + at + 16]
            output[target + 48] = count
            output[target + 49] = harmonic + 1 if kind == 1 else 0
        expanded.append(bytes(output))
    return tuple(expanded)
