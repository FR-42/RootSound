"""RipX32aef0 frequency/trajectory search, reconstructed from native control flow.

This module performs the original quarter-interval search and directional
extension. It never substitutes a generic optimizer.31b830's estimator remains
the owner of band preparation, phase and amplitude statistics.
"""
from dataclasses import dataclass
from functools import lru_cache
import math
import struct

from native_spectral import f32

TAU = 6.283185307179586


@lru_cache(maxsize=8)
def native_frequency_blend_table(length):
    """614b90:float32 symmetric Hann, not a linear interpolation assumption."""
    if not isinstance(length, int) or length < 2:
        raise ValueError('Native smoothing table needs at least two entries')
    return tuple(f32((1. - math.cos((float(i) * TAU) / (length - 1.))) * .5)
                 for i in range(length))


def native_frequency_blend_length(analysis_rate, hop):
    if not math.isfinite(analysis_rate) or analysis_rate <= 0 or not isinstance(hop, int) or hop <= 0:
        raise ValueError('Explicit native analysis rate and hop required')
    #31f5a0:single precision global rate is promoted for these double constants.
    frames = max(1, int(float(f32(analysis_rate)) * .065 + .5))
    return frames * hop * 2


@dataclass(frozen=True)
class NativeSearchTrial:
    target_frequency: float
    frequency_trajectory: tuple[float, ...]
    angular_slopes: tuple[float, ...]
    seed_frequency: float
    estimate: object

    @property
    def improvement(self):
        return self.estimate.estimated_improvement

    @property
    def amplitude(self):
        return self.estimate.amplitude


@dataclass(frozen=True)
class NativeSearchResult:
    status: int
    trial: NativeSearchTrial | None
    evaluations: int
    converged: bool

    def candidate_record(self, descriptor, *, frequency_record_index, component_type):
        """Emit the actual0x230 refined record consumed by the next native stage."""
        if not isinstance(frequency_record_index, int) or not -1 <= frequency_record_index < 2**31:
            raise ValueError('Explicit native band index required')
        if not isinstance(component_type, int) or not 0 <= component_type <= 255:
            raise ValueError('Explicit native component type required')
        output = bytearray(0x230)
        if self.trial is None:
            return bytes(output)
        trial = self.trial
        struct.pack_into('<ffdf', output, 0, trial.target_frequency,
            trial.estimate.phase_at_window_start, trial.improvement, trial.amplitude)
        struct.pack_into('<64d', output, 0x18, *trial.angular_slopes)
        struct.pack_into('<ii', output, 0x218, descriptor.begin, descriptor.end)
        struct.pack_into('<i', output, 0x228, frequency_record_index)
        output[0x22c] = component_type
        return bytes(output)


def blend_native_trajectory(original, target, frame_offset, extent, table, sample_rate, hop):
    """32aef0 trajectory blend and float32-difference/double slope preparation."""
    target = f32(target)
    length = len(table)
    values = []
    for index, previous in enumerate(original):
        if previous == 0:
            values.append(0.)
            continue
        position = int((((float(index - frame_offset) * length) * .5) * .125) / extent + length // 2)
        position = max(0, min(position, length - 1))
        mix = f32(table[position])
        # Native first product promotes(1-mix) only after its float subtraction;
        # second product is explicitly float32 before addition in double.
        values.append(float(f32(1. - mix)) * previous + float(f32(mix * target)))
    slopes = []
    factor = TAU / sample_rate
    for index in range(64):
        if index == 63 or values[index] == 0 or values[index + 1] == 0:
            slopes.append(0.)
        else:
            slopes.append(float(f32(f32(values[index + 1]) - f32(values[index]))) * factor / hop)
    first = next((value for value in values if value != 0), 0.)
    return tuple(values), tuple(slopes), f32(first)


def search_native_frequency(original_trajectory, *, frame_index, begin, end,
                            sample_rate, hop, minimum_hz, maximum_hz,
                            search_minimum_hz, search_maximum_hz,
                            minimum_step_hz, directional_iterations,
                            minimum_amplitude, blend_table, estimate_trial):
    """Actual32aef0 controller;estimate_trial consumes its native trajectory.

    estimate_trial(seed_frequency,angular_slopes) MUST be a31b830-derived
    estimator over an already owned native band/raw source. It is not a
    user-supplied candidate or arbitrary objective function. Return values
    have amplitude and estimated_improvement, as native_pcm_estimate does.
    """
    original = tuple(float(x) for x in original_trajectory)
    if len(original) != 64 or not any(original) or any(not math.isfinite(x) or x < 0 for x in original):
        raise ValueError('Exactly64 native frequency slots with at least one active slot required')
    if not (0 <= begin < end and sample_rate > 0 and hop > 0):
        raise ValueError('Native sample clock and fit interval required')
    if not isinstance(directional_iterations, int) or not 1 <= directional_iterations:
        raise ValueError('Native directional search count must be positive')
    lo, hi = f32(search_minimum_hz), f32(search_maximum_hz)
    epsilon, minimum_amplitude = f32(minimum_step_hz), f32(minimum_amplitude)
    if not all(math.isfinite(x) for x in (lo, hi, epsilon, minimum_hz, maximum_hz, minimum_amplitude)) or not 0 < minimum_hz <= lo <= hi <= maximum_hz or epsilon < 0:
        raise ValueError('Invalid native frequency search range')
    frame_offset = frame_index - begin // hop
    extent = max(1, frame_offset + 1, (end - 1 + hop) // hop - frame_index) + 1
    evaluated = 0

    def trial(target):
        nonlocal evaluated
        target = f32(min(maximum_hz, max(minimum_hz, f32(target))))
        trajectory, slopes, seed = blend_native_trajectory(original, target, frame_offset,
            extent, blend_table, sample_rate, hop)
        result = estimate_trial(seed, slopes)
        evaluated += 1
        return NativeSearchTrial(target, trajectory, slopes, seed, result)

    width = f32(hi - lo)
    had_pair = went_up = went_down = False
    previous_frequency = previous_score = 0.
    best = None
    while True:
        step = f32(width * f32(.25))
        if had_pair and float(step) <= float(epsilon) * .9:
            status = 0 if directional_iterations < 2 or (went_up and went_down) else (1 if went_up else -1)
            return NativeSearchResult(status, best, evaluated, True)
        left = trial(f32(lo + step))
        right = left if step == 0 else trial(f32(hi - step))
        if left.improvement == 0 and right.improvement == 0:
            status = 0 if directional_iterations < 2 or (went_up and went_down) else (1 if went_up else -1)
            return NativeSearchResult(status, best, evaluated, False)
        if not had_pair:
            # First-pass directional extrapolation only;subsequent passes narrow.
            if abs(left.improvement - right.improvement) > .1:
                direction = -1 if right.improvement < left.improvement else 1
                count = 1
                while count < directional_iterations:
                    current_direction = -1 if right.improvement < left.improvement else 1
                    if current_direction != direction:
                        break
                    outside = f32(lo - step) if direction < 0 else f32(step + hi)
                    if not minimum_hz <= outside <= maximum_hz:
                        break
                    outer = trial(outside)
                    edge = left if direction < 0 else right
                    if outer.improvement <= edge.improvement:
                        break
                    movement = f32(step * f32(4))
                    if direction < 0:
                        right = outer
                        lo, hi = f32(lo - movement), f32(hi - movement)
                        left = trial(f32(lo + step))
                    else:
                        left = outer
                        lo, hi = f32(lo + movement), f32(hi + movement)
                        right = trial(f32(hi - step))
                    count += 1
            if max(left.amplitude, right.amplitude) < float(minimum_amplitude) * .8:
                return NativeSearchResult(0, None, evaluated, False)
        choose_right = left.improvement < right.improvement
        selected = right if choose_right else left
        if choose_right:
            lo = f32(hi - f32(step + step))
            went_up = True
        else:
            hi = f32(f32(step + step) + lo)
            went_down = True
        if previous_frequency == 0 or previous_score <= selected.improvement:
            previous_score = selected.improvement
            previous_frequency = selected.target_frequency
        elif choose_right:
            previous_score = previous_frequency = 0.
            went_down = True
            hi = f32(hi - step)
        else:
            previous_score = previous_frequency = 0.
            went_up = True
            lo = f32(lo + step)
        width = f32(hi - lo)
        if (0. if best is None else best.improvement) < selected.improvement:
            best = selected
        had_pair = True


def search_peak_candidate(pcm, peak, frame_index, context, *,
                          analysis_rate, frequency_record_index, component_type,
                          prepared_source=None, estimate_trial=None):
    """Automatically build32c560's seed and run the native frequency search.

    band>=0 requires the native prepared-band estimator. Passing no estimator
    in that case fails explicitly rather than substituting raw PCM. The raw
    branch remains executable for caller-selected native band index-1.
    """
    from native_peak_windows import prepare_peak_window
    descriptor = prepare_peak_window(peak, frame_index, context)
    if descriptor is None:
        return None
    if not isinstance(component_type, int) or not 0 <= component_type <= 255:
        raise ValueError('Actual3459a0 component type required')
    if estimate_trial is None and prepared_source is not None:
        from native_pcm_estimate import estimate_prepared_trajectory_component
        if prepared_source.band_index != frequency_record_index:
            raise ValueError('Prepared PCM band does not match the native candidate band index')
        def estimate_trial(frequency, slopes):
            return estimate_prepared_trajectory_component(prepared_source,
                descriptor.begin, descriptor.end, frequency, context.sample_rate,
                context.hop, frame_index, slopes)
    if estimate_trial is None:
        if frequency_record_index != -1:
            raise NotImplementedError('Native filtered-band source must be prepared before default peak refinement')
        from native_pcm_estimate import estimate_trajectory_component
        def estimate_trial(frequency, slopes):
            return estimate_trajectory_component(pcm, descriptor.begin, descriptor.end,
                frequency, context.sample_rate, context.hop, frame_index, slopes,
                energy_begin=descriptor.begin, energy_end=descriptor.end)
    original = [0.] * 64
    original[descriptor.seed_slot] = float(descriptor.frequency_hz)
    table = native_frequency_blend_table(native_frequency_blend_length(analysis_rate, context.hop))
    result = search_native_frequency(original, frame_index=frame_index,
        begin=descriptor.begin, end=descriptor.end, sample_rate=context.sample_rate,
        hop=context.hop, minimum_hz=context.minimum_hz, maximum_hz=context.maximum_hz,
        search_minimum_hz=descriptor.search_minimum_hz,
        search_maximum_hz=descriptor.search_maximum_hz,
        minimum_step_hz=descriptor.search_step_hz,
        directional_iterations=descriptor.search_iterations, minimum_amplitude=0.,
        blend_table=table, estimate_trial=estimate_trial)
    return descriptor, result


def finish_native_peak_record(descriptor, result, *, frequency_record_index, component_type):
    """32c560 success/one-unit gate and346e90 amplitude-domain conversion."""
    if result.status != 0 or result.trial is None or result.trial.amplitude < 1:
        return bytes(0x230)
    record = bytearray(result.candidate_record(descriptor,
        frequency_record_index=frequency_record_index, component_type=component_type))
    amplitude = f32(result.trial.amplitude)
    transformed = f32(f32(math.pow(float(amplitude) / 32767., .6020599913)) * f32(32767))
    struct.pack_into('<f', record, 0x10, transformed)
    #32cac0..32cad1 overwrites the successful search objective field with
    #the original spectral-slot frequency before copying the fresh record.
    struct.pack_into('<d', record, 8, float(f32(descriptor.frequency_hz)))
    #32c560 clears this fresh peak's pan word after the component estimate.
    struct.pack_into('<h', record, 0x14, 0)
    return bytes(record)
