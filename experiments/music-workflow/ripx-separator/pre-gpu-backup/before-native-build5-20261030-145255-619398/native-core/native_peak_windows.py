"""Native 0x14032c560 peak-refinement input preparation.

The window and search rules below are taken from the original instructions,
not from a conventional FFT-window or a generic pitch tracker. This prepares
the input to 0x14032aef0. Its full frequency/chirp search is not implemented
here. The optional fixed-frequency estimate is explicitly a different stage.

Source SHA256: 5f088fa4fbbe1759ef75d8034c79f33c846e3bf5f13d5048dd95a6614d2ad441.
Existing REA spectral-peak-check.json and next-31f5a0.json are supplemented by
peak-refinement-window-direct.asm and peak-window-constants.json.
"""
from dataclasses import dataclass
import math
import struct

from native_spectral import f32, native_configuration


@dataclass(frozen=True)
class PeakWindowContext:
    sample_rate: int
    hop: int
    base_window: int
    prefix_frames: int
    body_frames: int
    flag_91: bool
    minimum_hz: float
    maximum_hz: float

    @property
    def sample_limit(self):
        return (self.body_frames + self.prefix_frames * 2) * self.hop


def native_peak_window_context(sample_rate, *, prefix_frames, body_frames, flag_91):
    """31f5a0 supplies 21Hz and min(Fs/2,24000); context remains explicit.

    prefix_frames/body_frames are ctx+0x28/+0x24. They describe the caller's
    native task buffer and cannot be invented from a file's FFT frame count.
    """
    config = native_configuration(sample_rate)
    if not all(isinstance(x, int) and x >= 0 for x in (prefix_frames, body_frames)):
        raise ValueError('Native prefix/body frame counts must be explicit nonnegative integers')
    if body_frames + prefix_frames * 2 < 1:
        raise ValueError('Native task buffer must contain at least one frame')
    return PeakWindowContext(sample_rate, config['hop'], config['base_window'],
        prefix_frames, body_frames, bool(flag_91), 21.0,
        min(f32(f32(sample_rate) * f32(.5)), 24000.0))


@dataclass(frozen=True)
class NativePeakWindow:
    frame_index: int
    frequency_hz: float
    strength: float
    begin: int
    end: int
    requested_samples: int
    context_sample_limit: int
    seed_slot: int
    search_minimum_hz: float
    search_maximum_hz: float
    search_step_hz: float
    search_iterations: int
    stage: str = 'native-peak-refinement-input'

    def candidate_seed(self, *, frequency_record_index, component_type):
        """Exact supported 0x230 seed representation before 32aef0.

        Frequency-band index comes from31b7a0; component_type comes from3459a0.
        Neither has a guessed default here. Begin/end are int32, despite a
        misleading float pointer cast in an earlier Ghidra decompilation.
        """
        if not isinstance(frequency_record_index, int) or not 0 <= frequency_record_index < 2**31:
            raise ValueError('Explicit nonnegative native frequency-record index required')
        if not isinstance(component_type, int) or not 0 <= component_type <= 255:
            raise ValueError('Explicit native component-type byte required')
        result = bytearray(0x230)
        struct.pack_into('<d', result, 0x18 + self.seed_slot * 8, self.frequency_hz)
        struct.pack_into('<ii', result, 0x218, self.begin, self.end)
        struct.pack_into('<i', result, 0x228, frequency_record_index)
        result[0x22c] = component_type
        return bytes(result)


def prepare_peak_window(peak, frame_index, context):
    """Return the native peak's window/search descriptor, or None if rejected.

    peak has the native326880 strength/frequency_hz fields. The caller retains
    original peak ordering/consumption; this function does not invent tracks.
    """
    if not isinstance(frame_index, int) or frame_index < 0:
        raise ValueError('Explicit nonnegative native frame index required')
    frequency, strength = f32(peak.frequency_hz), f32(peak.strength)
    if not all(math.isfinite(x) and x >= 0 for x in (frequency, strength)):
        raise ValueError('Finite nonnegative native peak fields required')
    if frequency == 0 or strength == 0:
        return None
    # 32c63a..32c667 is double arithmetic after float32 peak load.
    if (float(strength) / (float(context.base_window) * 2.0)) / .7071067812 < 1.0:
        return None
    # 32c6c4..32c71f: choose a small integer multiple of7Hz, capped by41/7.
    ratio = f32(frequency / f32(17.317153930664062))
    ratio = min(ratio, f32(41))
    iterations = max(1, math.trunc(f32(ratio / f32(7))))
    lower_for_window = max(f32(frequency - f32(f32(iterations) * f32(7))), f32(context.minimum_hz))
    search_step = f32(lower_for_window / f32(17732.765625))
    search_step = f32(max(search_step, 0.0))
    search_step = f32(search_step + search_step)
    fs, rounding = f32(context.sample_rate), f32(.5001000165939331)
    # The exact scalar SSE order differs from the old decompiler's doubles.
    cycle_samples = math.trunc(f32(f32(f32(fs * f32(40)) / lower_for_window) + rounding))
    minimum_samples = math.trunc(f32(f32(fs * f32(.03500000014901161)) + rounding))
    requested = max(cycle_samples, minimum_samples)
    duration_factor = f32(2 if context.flag_91 else 1)
    upper_samples = math.trunc(f32(f32(fs * f32(duration_factor * f32(.15000000596046448))) + rounding))
    upper_samples = min(upper_samples, (context.prefix_frames * 2 + 1) * context.hop)
    requested = min(requested, upper_samples)
    begin = max(0, context.hop // 2 - requested // 2 + frame_index * context.hop)
    end = min(begin + requested, context.sample_limit)
    if not 0 <= begin < end:
        raise ValueError('Native candidate window falls outside its explicit task buffer')
    seed_slot = frame_index - begin // context.hop
    if not 0 <= seed_slot < 64:
        raise ValueError('Native candidate seed exceeds its recovered64-slot representation')
    search_min = max(f32(frequency - f32(7)), f32(context.minimum_hz))
    search_max = min(f32(frequency + f32(7)), f32(context.maximum_hz))
    if search_min > search_max:
        raise ValueError('Peak is outside the native frequency-search limits')
    return NativePeakWindow(frame_index, frequency, strength, begin, end, requested,
        context.sample_limit, seed_slot, search_min, search_max, search_step, iterations)


def native_frequency_record_index(frequency, upper_frequencies, bandwidth, *, search=True):
    """31b7a0's backwards band lookup; all context-owned inputs stay explicit."""
    frequency, bandwidth = f32(frequency), f32(bandwidth)
    values = tuple(f32(value) for value in upper_frequencies)
    if not values or not all(math.isfinite(x) for x in (frequency, bandwidth, *values)):
        raise ValueError('Finite native frequency records and bandwidth required')
    if not search:
        return len(values)
    half_width = max(f32(bandwidth * f32(.5)), f32(40))
    for index in range(len(values) - 1, 0, -1):
        if frequency < f32(values[index] - half_width):
            return index
    return 0


def estimate_peak_at_supplied_frequency(pcm, peak, frame_index, context):
    """Connect native window selection to the recovered raw fixed-frequency fit.

    This deliberately preserves the supplied frequency.32aef0's complete
    frequency/chirp search, later harmonic assignment and note segmentation
    remain separate; callers must label this fixed-frequency estimate.
    """
    from native_pcm_estimate import estimate_constant_component
    descriptor = prepare_peak_window(peak, frame_index, context)
    if descriptor is None:
        return None
    if descriptor.end > len(pcm):
        raise ValueError('PCM does not contain the explicit native task window; no guessed padding was added')
    estimate = estimate_constant_component(pcm, descriptor.begin, descriptor.end,
        descriptor.frequency_hz, context.sample_rate, context.hop, frame_index)
    return descriptor, estimate
