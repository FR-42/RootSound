"""370070's ordinary non-overlapping continuation branch.

Source: work/ripx-analysis/next-370070.c, REA-derived output. The caller's
370a00 default merge gate admits only a zero- or one-frame gap. This module
implements that admitted branch, including the native distinction between
frequency propagation and zeroing the optional secondary frequency array.
Editing/overlap replacement and variable-step objects remain explicit gaps.
"""
from dataclasses import replace
from native_harmonic_object import NativeHarmonic, NativeHarmonicObject


def _series(values, count, label):
    if len(values) != count:
        raise ValueError(f'{label} length does not match native object extent')
    return tuple(values)


def merge_default_objects(old: NativeHarmonicObject,
                          new: NativeHarmonicObject) -> NativeHarmonicObject:
    """Merge already eligible objects in the SAME native frame coordinate.

    Eligibility (group/type/time/pitch) remains owned by the caller. Source
    old metadata is retained, as 370070 updates arrays and end, not caches.
    The source allocation/free lifecycle becomes immutable owned tuples here.
    """
    if (old.flags_21c ^ new.flags_21c) & 0x8000 or old.group_id_220 != new.group_id_220:
        raise ValueError('Native continuation identity/type mismatch')
    if old.start >= old.end or new.start >= new.end:
        raise ValueError('Native objects must have nonempty ranges')
    gap = new.start - old.end
    if gap not in (0, 1):
        raise NotImplementedError('Only the recovered default zero/one-frame continuation is implemented')
    if len(old.harmonics) != 48 or len(new.harmonics) != 48:
        raise NotImplementedError('Reduced native harmonic objects require another allocation branch')
    old_length, new_length = old.end-old.start, new.end-new.start
    negative = bool(old.flags_21c & 0x8000)
    count_old, count_new = (1, 1) if negative else (old_length, new_length)
    left_frequency = _series(old.frequencies, count_old, 'old frequency')
    right_frequency = _series(new.frequencies, count_new, 'new frequency')
    # 370070 scans backwards for a nonzero frequency in a gap. A negative
    # object stores a single constant, and the later incoming frame wins.
    previous = next((f for f in reversed(left_frequency) if f != 0), 0.)
    frequencies = right_frequency if negative else left_frequency + (previous,)*gap + right_frequency
    if old.secondary_frequencies is None:
        secondary = None
    elif negative:
        secondary = ((new.secondary_frequencies or (0.,))[0],)
    else:
        secondary = (_series(old.secondary_frequencies, old_length, 'old secondary frequency')
                     + (0.,)*gap
                     + (_series(new.secondary_frequencies, new_length, 'new secondary frequency')
                        if new.secondary_frequencies is not None else (0.,)*new_length))

    harmonics = []
    for first, second in zip(old.harmonics, new.harmonics):
        if first.ordinal != second.ordinal:
            raise ValueError('Harmonic ordinal changed in native continuation')
        components = max(len(first.amplitudes), len(second.amplitudes))
        if not 1 <= components <= 3:
            raise ValueError('Unsupported native component count')
        amplitude, field08, field10, field18 = [], [], [], []
        for slot in range(components):
            def part(harmonic, values, count, zero):
                if slot >= len(harmonic.amplitudes): return (zero,)*count
                return _series(values[slot], count, 'native harmonic field')
            amplitude.append(part(first, first.amplitudes, old_length, 0) + (0,)*gap
                             + part(second, second.amplitudes, new_length, 0))
            field08.append(part(first, first.field_08, old_length, 0) + (0,)*gap
                           + part(second, second.field_08, new_length, 0))
            field18.append(part(first, first.field_18, old_length, 0) + (0,)*gap
                           + part(second, second.field_18, new_length, 0))
            field10.append(part(second, second.field_10, 1, 0.) if negative else
                           part(first, first.field_10, old_length, 0.) + (0.,)*gap
                           + part(second, second.field_10, new_length, 0.))
        harmonics.append(NativeHarmonic(first.ordinal, tuple(amplitude), tuple(field08),
                                        tuple(field10), tuple(field18)))
    return replace(old, end=new.end, frequencies=frequencies,
                   secondary_frequencies=secondary, harmonics=tuple(harmonics))
