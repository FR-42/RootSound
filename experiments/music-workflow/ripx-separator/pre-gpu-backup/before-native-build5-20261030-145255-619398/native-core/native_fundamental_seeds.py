"""333930 native pair-to-eight-harmonic seed production.

Input is the actual refined0x13c peak representation from335480. This owns
pair enumeration and seed acceptance; it does not call a public pitch model.
332fd0 recursive extension and324770 full candidate registration are separate.
The generator is deliberately lazy so native downstream usage/history updates
are observed before the next pair, as in the original nested call structure.
"""
from dataclasses import dataclass, field
import math
import struct
from native_spectral import f32


@dataclass
class NativeFundamentalPeak:
    frequency_hz: float
    amplitude: float
    stereo_balance: int = 0
    usage: list[int] = field(default_factory=lambda: [0] * 8)

    @classmethod
    def from_record(cls, record):
        if len(record) != 0x13c:
            raise ValueError('Expected a native3354800x13c peak record')
        frequency, = struct.unpack_from('<f', record, 0)
        amplitude, = struct.unpack_from('<f', record, 0xcc)
        balance, = struct.unpack_from('<h', record, 0xf0)
        return cls(frequency, amplitude, balance, list(record[0xf4:0xfc]))


def native_fundamental_peak_record(refined_record):
    """335480 fresh native0x230 refined component→0x13c peak base fields.

    This is the no flag92 reference-subtraction path. Its later cross-frame
    corrections remain separate; the output is a native candidate input.
    """
    if len(refined_record) != 0x230:
        raise ValueError('Expected a0x230 native refined component record')
    frequency, = struct.unpack_from('<f', refined_record, 0)
    if not math.isfinite(frequency) or frequency <= 0:
        raise ValueError('Only retained positive-frequency native components can become peaks')
    amplitude, = struct.unpack_from('<f', refined_record, 0x10)
    source_slot_frequency, = struct.unpack_from('<d', refined_record, 8)
    balance, = struct.unpack_from('<h', refined_record, 0x14)
    output = bytearray(0x13c)
    pitch = f32((math.log10((float(frequency) * 32.) / 440.) * 12.) / .3010299956639812 + 9.)
    struct.pack_into('<fff', output, 0, frequency, pitch, f32(source_slot_frequency))
    struct.pack_into('<f', output, 0xcc, amplitude)
    struct.pack_into('<h', output, 0xf0, balance)
    return bytes(output)


@dataclass(frozen=True)
class NativeSeedContext:
    minimum_fundamental: float
    maximum_fundamental: float
    channels: int
    flag_91: bool
    mode_14: int
    flag_97: bool
    previous_frame_fundamental: float = 0.
    flag_92: bool = False
    flag_93: bool = False


@dataclass(frozen=True)
class NativeSeedHistory:
    primary_peak_indices: tuple[int, ...]
    alternate_peak_indices: tuple[int, ...]


@dataclass(frozen=True)
class NativePairSeed:
    harmonic_peak_indices: tuple[int, ...]
    first_slot: int
    last_slot: int
    proposed_fundamental: float
    spacing_divisor: int
    half_spacing: bool
    frame_index: int
    stage: str = 'native-eight-harmonic-seed-before-recursive-extension'


def native_harmonic_tolerance(fundamental, difference, flag_91):
    """3463d0 ABI:direction uses signed observed-minus-predicted difference."""
    denominator = f32(17.817153930664062 if difference < 0 else 16.817153930664062)
    return max(f32(f32(fundamental) / denominator), f32(10 if flag_91 else 8.5))


def _harmonic(value, spacing):
    return int(max(0., f32(f32(f32(value) / spacing) + f32(.5001)))) & 0xffff


def _pair_spacing(first, second, flag_91):
    initial = f32(first) if first == second else f32(abs(f32(first - second)))
    #333930 tries the first successful D,D/2,D/3 spacing, rather than
    #independently emitting three generic subharmonic candidates.
    for divisor in (1, 2, 3):
        spacing = initial if divisor == 1 else (f32(initial * f32(.5)) if divisor == 2 else f32(initial / f32(3)))
        if spacing <= 0:
            continue
        tolerance = max(f32(spacing / f32(16.817153930664062)), f32(10 if flag_91 else 8.5))
        n1, n2 = _harmonic(first, spacing), _harmonic(second, spacing)
        delta1 = abs(f32(f32(first) - f32(f32(n1) * spacing)))
        delta2 = abs(f32(f32(second) - f32(f32(n2) * spacing)))
        if delta1 <= tolerance and delta2 <= tolerance:
            return spacing, divisor
    return None


def native_pair_seeds(peaks, context, *, frame_index, history):
    """Automatically produce the native333930 seeds from refined frame peaks."""
    if not isinstance(frame_index, int) or frame_index < 0:
        raise ValueError('Native frame index must be nonnegative')
    if not 0 < context.minimum_fundamental <= context.maximum_fundamental or context.channels < 1:
        raise ValueError('Explicit native fundamental limits and channel count required')
    for peak in peaks:
        if not all(math.isfinite(x) and x >= 0 for x in (peak.frequency_hz, peak.amplitude)) or len(peak.usage) != 8:
            raise ValueError('Invalid native refined peak fields')
    for i, first in enumerate(peaks):
        if f32(first.amplitude) < f32(62):
            continue
        for j in range(i, len(peaks)):
            second = peaks[j]
            if f32(second.amplitude) < f32(62):
                continue
            difference = abs(f32(f32(first.frequency_hz) - f32(second.frequency_hz)))
            if i != j and difference < f32(15):
                continue
            if context.channels != 1 and abs(first.stereo_balance - second.stereo_balance) >= 0x7001:
                continue
            pair = _pair_spacing(f32(first.frequency_hz), f32(second.frequency_hz), context.flag_91)
            if pair is None:
                continue
            spacing, divisor = pair
            low_index, high_index = (i, j) if first.frequency_hz < second.frequency_hz else (j, i)
            low, high = peaks[low_index], peaks[high_index]
            for half in range(1 if i == j else 2):
                proposed = spacing if not half else f32(spacing * f32(.5))
                if not context.minimum_fundamental <= proposed <= context.maximum_fundamental:
                    continue
                previous = f32(context.previous_frame_fundamental)
                if previous != 0 and abs(f32(previous - proposed)) > f32(previous / f32(34.634308)):
                    continue
                low_n = _harmonic(low.frequency_hz, proposed)
                if (half and low_n != 2) or not 1 <= low_n <= 8:
                    continue
                if low.usage[low_n - 1] >= 3 or (low.frequency_hz > 3000 and low_n > half + 1):
                    continue
                if divisor >= 2 and low_n % 2 == 0:
                    continue
                delta = f32(f32(low.frequency_hz) - f32(f32(low_n) * proposed))
                if abs(delta) > f32(native_harmonic_tolerance(proposed, delta, context.flag_91) * f32(divisor)):
                    continue
                high_n = _harmonic(high.frequency_hz, proposed)
                if (half and high_n != low_n + 2) or not 1 <= high_n <= 8:
                    continue
                if high.usage[high_n - 1] >= 3 or (low.frequency_hz > 3000 and high_n > half + 3):
                    continue
                duplicate = False
                for old in history:
                    primary = old.primary_peak_indices
                    if primary[low_n - 1] == low_index and primary[high_n - 1] == high_index:
                        duplicate = True
                        break
                    if context.mode_14 > 2 and context.flag_97:
                        alternate = old.alternate_peak_indices
                        if alternate[low_n - 1] == low_index and alternate[high_n - 1] == high_index:
                            duplicate = True
                            break
                if duplicate:
                    continue
                slots = [-1] * 8
                slots[low_n - 1], slots[high_n - 1] = low_index, high_index
                yield NativePairSeed(tuple(slots), low_n - 1, high_n - 1,
                    proposed, divisor, bool(half), frame_index)
