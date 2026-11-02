"""RipX raw-buffer / constant-frequency phase-amplitude fitting branch.

Reconstructs 3293f0(param9=-1,param10=0),328860(unweighted energy),3291c0,
32a1b0/3297a0(no-chirp),31b830 statistic consumption. This is a native branch,
not the complete band-filtered/chirp estimator or automatic pitch detector.
All window/frame/hop parameters are explicit, never guessed from an FFT size.
Input PCM uses the native signed-16-bit amplitude scale, represented as float32.
"""
from dataclasses import dataclass
from functools import lru_cache
import math
from native_harmonic_fields import f32, phase_from_four_statistics, amplitude_from_native_objective
from native_pcm_component import native_sine_table, add_component_inplace, TAU, TABLE_SCALE, PHASE_FRACTION, MASK64


@lru_cache(maxsize=32)
def native_sample_window(length):
    """3291c0's flat-center window, exact integer condition i*6 < N>>1."""
    if not isinstance(length, int) or length < 1:
        raise ValueError('Positive native window length required')
    window = [0.0] * length
    for i in range((length + 1) >> 1):
        value = f32((1.0 - math.cos(((float(i) * TAU) * 6.0) / (float(length) - 1.0))) * .5) if i * 6 < length >> 1 else 1.0
        window[i] = value
        window[length - i - 1] = value
    return tuple(window)


def _indices(frequency, sample_rate, phase, count):
    omega = math.fmod((TAU / float(sample_rate)) * float(f32(frequency)), TAU)
    if omega < 0:
        omega += TAU
    increment = int(omega * TABLE_SCALE * PHASE_FRACTION + .5)
    # Unlike the3190b0 renderer, these estimators multiply initial phase in float32.
    initial = int(f32(f32(f32(f32(phase) * f32(TABLE_SCALE)) * f32(PHASE_FRACTION)) + f32(.5)))
    position = (initial - increment) & MASK64
    for _ in range(count):
        position = (position + increment) & MASK64
        yield (position >> 32) & 0x7fff


@dataclass(frozen=True)
class NativeEstimate:
    frequency: float
    amplitude: float
    phase_at_frame: float
    phase_at_window_start: float
    energy: float
    estimated_improvement: float
    window_start: int
    window_end: int
    frame_index: int
    hop: int
    energy_start: int
    energy_end: int
    phase_statistics: tuple[float, float, float, float]
    objective_coefficients: tuple[float, float, float]


def estimate_constant_component(pcm, begin, end, frequency, sample_rate, hop, frame_index,
                                *, energy_begin=None, energy_end=None):
    """Actual raw constant-frequency native branch, automatic phase/amplitude.

    begin/end: native sample boundaries supplied by33b560/319940.
    frame_index/hop: target native analysis frame; phase returned at frame*hop.
    Caller must not label an arbitrary whole-file/FFT-sized range as native.

    328860 obtains energy from task+0x488/+0x48c, whereas 3293f0 records the
    separately supplied fit interval. Pass those task bounds explicitly when
    they differ. Omitting both means the caller deliberately supplies a task
    whose energy interval is this same fit interval; it is not a recovered
    rule for choosing either interval.
    """
    if not all(isinstance(x, int) for x in (begin, end, sample_rate, hop, frame_index)):
        raise ValueError('Native sample/frame coordinates must be integers')
    if not (0 <= begin < end <= len(pcm) and sample_rate > 0 and hop > 0 and begin // hop <= frame_index <= (end - 1) // hop):
        raise ValueError('Window and target frame must be within the supplied PCM')
    if math.ceil(end / hop) - begin // hop > 64:
        raise ValueError('Native trajectory preparation has at most64 entries')
    if energy_begin is None and energy_end is None:
        energy_begin, energy_end = begin, end
    if not (type(energy_begin) is int and type(energy_end) is int
            and 0 <= energy_begin < energy_end <= len(pcm)):
        raise ValueError('Explicit native energy bounds must lie within PCM')
    frequency = f32(frequency)
    if not math.isfinite(frequency) or frequency <= 0:
        raise ValueError('Finite positive candidate frequency required')
    values = [f32(pcm[i]) for i in range(begin, end)]
    if any(not math.isfinite(x) for x in values):
        raise ValueError('Nonfinite PCM is unsupported')
    count = len(values)
    window = native_sample_window(count)
    table = native_sine_table()
    energy = 0.0
    for index in range(energy_begin, energy_end):
        value = f32(pcm[index])
        if not math.isfinite(value):
            raise ValueError('Nonfinite energy-context PCM is unsupported')
        energy = energy + float(value) * float(value)
    sine_sum = cosine_sum = 0.0
    if energy != 0:
        for sample, weight, index in zip(values, window, _indices(frequency, sample_rate, 0, count)):
            sample = f32(sample * weight)
            sine_sum = f32(sine_sum + f32(sample * table[index]))
            cosine_sum = f32(cosine_sum + f32(sample * table[(index + 0x2000) & 0x7fff]))
    baseline = float(count) * 0.5000000000190247 + energy
    doubled_sine = f32(sine_sum + sine_sum)
    doubled_cosine = f32(cosine_sum + cosine_sum)
    statistics = (f32(baseline - doubled_sine), f32(baseline - doubled_cosine),
                  f32(baseline + doubled_sine), f32(baseline + doubled_cosine))
    phase = phase_from_four_statistics(*statistics)
    negative_correlation = 0.0
    if energy != 0:
        for sample, weight, index in zip(values, window, _indices(frequency, sample_rate, phase, count)):
            product = f32(f32(weight * sample) * table[index])
            negative_correlation = f32(negative_correlation - product)
    # 3297a0 samples the native objective at three amplitudes then solves it.
    # Replacing this with sum(sine^2) normal equations would change behavior.
    cross = float(f32(negative_correlation * f32(16383.5)))
    cross2 = f32(cross + cross)
    cross3 = f32(cross * 3.0)
    base = float(count) * 33552384.03252665
    first = float(f32(base + energy + cross))
    delta2 = float(f32(base * 4.0 + energy + float(cross2))) - first
    quadratic = ((float(f32(base * 9.0 + energy + float(cross3))) - first) * 8191.75 - delta2 * 16383.5) / 1099410967551.9688
    linear = (delta2 - quadratic * 201314304.1875) / 8191.75
    constant = (first - quadratic * 8191.75 * 8191.75) - linear * 8191.75
    amplitude, improvement = amplitude_from_native_objective(energy, quadratic, linear, constant)
    omega = f32(float(frequency) * TAU / sample_rate)
    integrated_phase = 0.0
    for i in range(frame_index - begin // hop):
        distance = hop - begin % hop if i == 0 and begin % hop > 0 else hop
        integrated_phase = f32(float(omega) * distance + float(integrated_phase))
    at_frame = math.fmod(float(f32(integrated_phase + phase)), TAU)
    if at_frame < 0:
        at_frame += TAU
    return NativeEstimate(frequency, amplitude, f32(at_frame), phase, energy, improvement,
                          begin, end, frame_index, hop, energy_begin, energy_end,
                          statistics, (quadratic, linear, constant))


def estimate_and_subtract(pcm, begin, end, frequency, sample_rate, hop, frame_index,
                          *, energy_begin=None, energy_end=None):
    if frame_index * hop + hop > len(pcm):
        raise ValueError('Native subtraction frame must fit the supplied PCM')
    estimate = estimate_constant_component(pcm, begin, end, frequency, sample_rate, hop, frame_index,
                                          energy_begin=energy_begin, energy_end=energy_end)
    add_component_inplace(pcm, frame_index * hop, hop, sample_rate, -estimate.amplitude, estimate.frequency, estimate.phase_at_frame)
    return estimate
