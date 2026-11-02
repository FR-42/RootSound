"""332fd0 native left/right harmonic seed expansion.

The eight-slot search deliberately enumerates missing observations as-1,
matches at most the first eight peaks in each native frequency window, and
returns actual324770 input seeds. No generic harmonic-comb selector is used.
"""
from dataclasses import dataclass
import math
from native_spectral import f32
from native_fundamental_seeds import native_pair_seeds


@dataclass(frozen=True)
class NativeExtendedSeed:
    harmonic_peak_indices: tuple[int, ...]
    first_slot: int
    last_slot: int
    stereo_balance: int
    frame_index: int
    stage: str = 'native324770-input'


def _weighted_balance(peaks, slots, first, last, channels):
    if channels < 2:
        return 0
    numerator = denominator = 0.
    for slot in range(first, last + 1):
        index = slots[slot]
        if index >= 0:
            amplitude = f32(peaks[index].amplitude)
            denominator = f32(denominator + amplitude)
            numerator = f32(numerator + f32(f32(peaks[index].stereo_balance) * amplitude))
    result = f32(numerator / denominator) if denominator else 0.
    if result >= 0:
        result = min(f32(result + f32(.5001)), f32(32767))
    else:
        result = max(f32(result - f32(.5001)), f32(-32767))
    return int(result)


def _window(peaks, slots, first, last, side, flag_91):
    available = [i for i in range(first, last + 1) if slots[i] >= 0]
    ordered = available if side == 0 else list(reversed(available))
    if len(ordered) == 1:
        # The333930 single-peak seed always occupies harmonic1. The native
        # one-point branch predicts2*f; do not invent f/n for invalid callers.
        if first != 0 or ordered[0] != 0 or side != 1:
            raise NotImplementedError('Native one-point extension requires its observed harmonic1 seed')
        step = f32(peaks[slots[0]].frequency_hz)
        predicted = f32(f32(f32(last + 1) * step) + step)
    else:
        a, b = ordered[:2]
        fa, fb = f32(peaks[slots[a]].frequency_hz), f32(peaks[slots[b]].frequency_hz)
        step = f32(f32(fb - fa) / f32(b - a))
        if side == 0:
            predicted = f32(fa - f32(f32(a - first + 1) * step))
        else:
            predicted = f32(f32(f32(last - a + 1) * step) + fa)
    base = f32(10 if flag_91 else 8.5)
    below = max(f32(f32(step / f32(17.817153930664062)) * f32(.25)), base)
    above = max(f32(f32(step / f32(16.817153930664062)) / f32(3)), base)
    return f32(predicted - below), f32(predicted + above)


def extend_native_seed(peaks, seed, context, *, frequency_order=None):
    """Enumerate the original332fd0 recursive leaves for one333930 seed."""
    order = tuple(sorted(range(len(peaks)), key=lambda index:peaks[index].frequency_hz)) if frequency_order is None else tuple(frequency_order)
    if len(order) != len(peaks) or set(order) != set(range(len(peaks))):
        raise ValueError('Native frequency-order index must cover each refined peak exactly once')
    def walk(slots, first, last):
        balance = _weighted_balance(peaks, slots, first, last, context.channels)
        left = _window(peaks, slots, first, last, 0, context.flag_91) if first > 0 else None
        right = _window(peaks, slots, first, last, 1, context.flag_91) if last < 7 else None
        left_allowed = left is not None and context.minimum_fundamental <= left[1]
        right_allowed = right is not None and right[0] <= 16000.
        if not left_allowed and not right_allowed:
            yield NativeExtendedSeed(tuple(slots), first, last, balance, seed.frame_index)
            return
        def matches(bounds, new_slot):
            found = []
            for index in order:
                peak = peaks[index]
                if peak.frequency_hz < bounds[0]:
                    continue
                if bounds[1] < peak.frequency_hz:
                    break
                if f32(peak.amplitude) < f32(62) or abs(peak.stereo_balance - balance) >= 0x7001:
                    continue
                if peak.usage[new_slot] >= 3:
                    continue
                found.append(index)
                if len(found) == 8:
                    break
            return found
        left_matches = matches(left, first - 1) if left_allowed and context.minimum_fundamental < left[1] else []
        right_matches = matches(right, last + 1) if right_allowed and right[0] < 16000. else []
        # Once either side can expand, native recursion advances both remaining
        #slot boundaries, even when one side contributes only a missing-1.
        left_options = [-1] + left_matches if first > 0 else [None]
        right_options = [-1] + right_matches if last < 7 else [None]
        for left_index in left_options:
            for right_index in right_options:
                expanded = list(slots)
                new_first, new_last = first, last
                if left_index is not None:
                    new_first -= 1
                    expanded[new_first] = left_index
                if right_index is not None:
                    new_last += 1
                    expanded[new_last] = right_index
                yield from walk(expanded, new_first, new_last)
    yield from walk(list(seed.harmonic_peak_indices), seed.first_slot, seed.last_slot)


def native_fundamental_inputs(peaks, context, *, frame_index, history, frequency_order=None):
    """Automatic refined peaks→333930 pair seeds→332fd0 leaves."""
    for seed in native_pair_seeds(peaks, context, frame_index=frame_index, history=history):
        yield from extend_native_seed(peaks, seed, context, frequency_order=frequency_order)


@dataclass(frozen=True)
class NativeInitialFundamental:
    fundamental_hz: float
    strong_harmonics: int
    frequencies: tuple[float, ...]
    amplitudes: tuple[float, ...]
    seed: NativeExtendedSeed
    stage: str = 'native324770-initial-f0-before-weighted-fit-and-registration'


def initialize_native_fundamental(peaks, seed, context):
    """324770 initial eight-slot load,36c990 initial frequency and range gate."""
    from reconstructed_pitch_math import initial_fundamental
    frequencies, amplitudes = [], []
    for index in seed.harmonic_peak_indices:
        frequencies.append(0. if index < 0 else f32(peaks[index].frequency_hz))
        amplitudes.append(0. if index < 0 else f32(peaks[index].amplitude))
    initial, count = initial_fundamental(frequencies, amplitudes)
    if not context.minimum_fundamental <= initial <= context.maximum_fundamental:
        return None
    return NativeInitialFundamental(initial, count, tuple(frequencies), tuple(amplitudes), seed)
