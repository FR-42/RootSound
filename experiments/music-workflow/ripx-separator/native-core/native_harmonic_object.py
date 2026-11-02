"""370a00's expanded-run packing, using REA next-ok-370a00.c.

Represents native arrays without process pointers. Does not implement merging,
instrument lookup 382b40, note caches or final cleanup. Field names retain
native offsets where physical meanings are not independently established.
"""
from dataclasses import dataclass
import math
import struct
from native_minimum_frames import f32


@dataclass(frozen=True)
class NativeHarmonic:
    ordinal: int
    amplitudes: tuple[tuple[int, ...], ...]
    # 5aa200 reads this word as two uint16 phases, not a numeric float.
    # Keeping raw bits avoids NaN canonicalization corrupting valid phases.
    field_08: tuple[tuple[int, ...], ...]
    field_10: tuple[tuple[float, ...], ...]
    field_18: tuple[tuple[int, ...], ...]


@dataclass(frozen=True)
class NativeHarmonicObject:
    start: int
    end: int
    flags_21c: int
    group_id_220: int
    metadata_22c: int
    weighted_218: float
    frequencies: tuple[float, ...]
    harmonics: tuple[NativeHarmonic, ...]
    # Native +0x10 is a separately owned optional frequency array. Fresh
    # 370a00 packing initializes it from the same frame value as +0x08.
    # It must remain distinct because 370070 clears gap entries here while
    # propagating a nonzero +0x08 frequency through the same gap.
    secondary_frequencies: tuple[float, ...] | None = None
    #Source3449c0 group+9cd; retain transient identity separately from the
    #note's21c flags and from an instrument classifier's later assignment.
    native_kind: int | None = None


def pack_harmonic_run(groups, start: int, *, component_slots: int):
    """Pack a nonempty 3449c0-expanded run; no guessed component count.

    Expanded groups have exactly 48 harmonics. Native missing-group and
    reduced-harmonic branches are unnecessary for this producer's output and
    rejected explicitly instead of substituting unrelated interpolation.
    """
    if not groups or not isinstance(component_slots, int) or not 1 <= component_slots <= 3:
        raise ValueError('A nonempty run and explicit component count 1..3 required')
    if any(len(g) != 0x9e0 or g[0x9cc] != 48 for g in groups):
        raise ValueError('Only complete 3449c0 expanded groups are supported')
    getf = lambda g, off: struct.unpack_from('<f', g, off)[0]
    flags = struct.unpack_from('<H', groups[0], 4)[0]
    negative_type = bool(flags & 0x8000)
    slots = 1 if negative_type else component_slots
    key = struct.unpack_from('<I', groups[0], 0x9d8)[0]
    if any(struct.unpack_from('<I', g, 0x9d8)[0] != key or
           bool(struct.unpack_from('<H', g, 4)[0] & 0x8000) != negative_type for g in groups):
        raise ValueError('Run identity/type changed')
    total, weighted = 0., 0.
    if not negative_type:
        for g in groups:
            amplitude = 0.
            for h in range(48):
                amplitude = f32(amplitude + getf(g, 0x10 + 0x34*h))
            total = f32(total + amplitude)
            weighted = f32(weighted + f32(amplitude * getf(g, 0x9c8)))
        if total != 0:
            weighted = f32(weighted / total)
    harmonics = []
    for h in range(48):
        amplitudes, field08, field10, field18 = [], [], [], []
        for c in range(slots):
            amps, values08, values10, values18 = [], [], [], []
            for t, g in enumerate(groups):
                offset = 8 + h*0x34 + c*0x10
                present = c < g[8 + h*0x34 + 48]
                amp = getf(g, offset+8) if present else 0.
                if not math.isfinite(amp):
                    raise ValueError('Nonfinite native amplitude conversion is outside wrapper coverage')
                amps.append(int(max(0., min(65535., f32(amp + .5)))))
                values08.append(struct.unpack_from('<I', g, offset+4)[0] if present else 0)
                if not negative_type or t == 0:
                    values10.append(getf(g, offset) if present else 0.)
                values18.append(struct.unpack_from('<H', g, offset+12)[0] if present else 0)
            amplitudes.append(tuple(amps)); field08.append(tuple(values08))
            field10.append(tuple(values10)); field18.append(tuple(values18))
        harmonics.append(NativeHarmonic(0 if negative_type else h+1, tuple(amplitudes),
                                        tuple(field08), tuple(field10), tuple(field18)))
    frequencies = (tuple(getf(g, 0) for g in groups[:1]) if negative_type
                   else tuple(getf(g, 0) for g in groups))
    return NativeHarmonicObject(start, start+len(groups),
                               (0x8000 | (0x40 if flags & 4 else 0)) if negative_type else 0,
                               key, struct.unpack_from('<I', groups[0], 0x9d0)[0], weighted,
                               frequencies, tuple(harmonics), frequencies,groups[0][0x9cd])
