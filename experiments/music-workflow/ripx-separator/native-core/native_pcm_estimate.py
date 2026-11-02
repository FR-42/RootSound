"""RipX native raw/prepared-band constant/chirp phase-amplitude estimator.

Reconstructs3293f0,328860,3291c0,32a1b0/3297a0 and31b830, preserving
distinct raw/filtered/preweighted sources and constant/chirp branches. The
native_band_buffers owner produces actual31bde0 filtered/decimated signals.
An upstream native frequency/trajectory owner still supplies the candidate;
this estimator alone is not an automatic pitch detector.
All window/frame/hop parameters are explicit, never guessed from an FFT size.
Input PCM uses the native signed-16-bit amplitude scale, represented as float32.
"""
from dataclasses import dataclass
from functools import lru_cache
import math
from native_harmonic_fields import f32, phase_from_four_statistics, amplitude_from_native_objective
from native_pcm_component import native_sine_table, add_component_inplace, TAU, TABLE_SCALE, PHASE_FRACTION, MASK64
from native_loop_kernels import correlate


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


def _objective_coefficients(count, energy, negative_correlation, *, stride=1, mean_weight=1.0):
    """3297a0's three sampled amplitudes, preserving post-float32 stride scale."""
    cross = float(f32(negative_correlation * f32(16383.5)))
    cross2 = f32(cross + cross)
    cross3 = f32(cross * 3.0)
    base = float(count) * 33552384.03252665 * float(mean_weight)
    first = float(f32(base + energy + cross)) * float(stride)
    delta2 = float(f32(base * 4.0 + energy + float(cross2))) * float(stride) - first
    quadratic = ((float(f32(base * 9.0 + energy + float(cross3))) * float(stride) - first) * 8191.75 - delta2 * 16383.5) / 1099410967551.9688
    linear = (delta2 - quadratic * 201314304.1875) / 8191.75
    constant = (first - quadratic * 8191.75 * 8191.75) - linear * 8191.75
    return quadratic, linear, constant


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
    quadratic, linear, constant = _objective_coefficients(count, energy, negative_correlation)
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


@dataclass(frozen=True)
class NativeTrajectoryEstimate:
    """31b830 fields with the source clock and frequency reference explicit."""
    frequency: float
    frequency_seed: float
    angular_frequency_at_frame: float
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
    phase_statistics: tuple[float, ...] | None
    objective_coefficients: tuple[float, float, float]
    angular_slopes: tuple[float, ...]
    chirp_branch: bool
    frequency_reference: str = '31b830-component-frequency-at-window-start'
    prepared_sample_rate: float | None = None
    prepared_hop: int | None = None
    sample_stride: int = 1
    preweighted: bool = False
    band_index: int = -1




@dataclass(frozen=True)
class NativePreparedPCM:
    """Actual 3293f0 prepared data, retaining both native sample clocks.

    The owner supplies the cache produced by328e60/328860, not a generic filter.
    fit bounds are converted by the configured uint stride, independently from
    sample rate and hop copied from the original band record.
    """
    pcm: object
    sample_rate: float
    stride: int
    hop: int
    energy: float
    energy_begin: int
    energy_end: int
    band_index: int
    preweighted: bool = False
    mean_weight: float = 1.0
    fit_begin: int | None = None
    fit_end: int | None = None
    fit_values: object = None


def estimate_prepared_trajectory_component(source, begin, end, frequency, sample_rate,
                                            hop, frame_index, angular_slopes, *,
                                            phase_at_frame_hint=-1.0):
    """Real 32a1b0/3297a0 prepared-band estimator and31b830 phase transport.

    This consumes a native-produced NativePreparedPCM. It never substitutes
    raw PCM for a requested band. Original hop H scales the slope entries;
    prepared hop controls their lookup segments, exactly as the binary does.
    The objective costs and returned energy scale by the band stride only
    after the observed float32 rounding. Preweighted sources skip flat-window
    multiplication and supply the328860 mean-weight factor.
    """
    if not isinstance(source, NativePreparedPCM):
        raise TypeError('Native prepared-band cache is required')
    if any(type(value) is not int for value in (begin,end,sample_rate,hop,frame_index)):
        raise ValueError('Original native coordinates must be integers')
    if hop <= 0 or hop & (hop-1) or sample_rate <= 0 or not 0 <= begin < end:
        raise ValueError('Valid original clock and sample bounds required')
    if type(source.stride) is not int or source.stride < 1 or type(source.hop) is not int or source.hop <= 0 or source.hop & (source.hop-1):
        raise ValueError('Prepared stride and power-of-two hop must be positive integers')
    if not math.isfinite(source.sample_rate) or source.sample_rate <= 0 or not math.isfinite(source.energy) or source.energy < 0:
        raise ValueError('Prepared sample rate and energy must be finite')
    if not math.isfinite(source.mean_weight) or source.mean_weight < 0 or type(source.preweighted) is not bool:
        raise ValueError('Prepared weighting metadata is invalid')
    first, stop = begin // source.stride, end // source.stride
    if not 0 <= first < stop <= len(source.pcm):
        raise ValueError('Prepared fit interval lies outside the native band buffer')
    if not begin//hop <= frame_index <= (end-1)//hop or math.ceil(stop/source.hop)-first//source.hop > 64:
        raise ValueError('Native target frame or64-slot trajectory range is invalid')
    slopes = tuple(float(value) for value in angular_slopes)
    if len(slopes) != 64 or any(not math.isfinite(value) for value in slopes):
        raise ValueError('Exactly64 finite native double angular slopes required')
    seed, hint = f32(frequency), f32(phase_at_frame_hint)
    if not math.isfinite(seed) or seed <= 0 or not math.isfinite(hint):
        raise ValueError('Finite positive seed and finite phase hint required')
    adjusted = f32((float(begin % hop)*slopes[0])/(TAU/sample_rate)+float(seed))
    if not math.isfinite(adjusted) or adjusted <= 0:
        raise ValueError('Adjusted native window-start frequency is unsupported')
    if source.fit_values is not None and (source.fit_begin,source.fit_end)==(first,stop):
        #3293f0 owner snapshots and validates this immutable fit once, not
        #again for every32aef0 trial against the same prepared source.
        values=source.fit_values
    else:
        values = tuple(f32(source.pcm[index]) for index in range(first,stop))
        if any(not math.isfinite(value) for value in values):
            raise ValueError('Prepared PCM must be finite')
    chirp = any(value != 0 for value in slopes)
    window = native_sample_window(len(values)) if not chirp and not source.preweighted else None
    prepared_rate = f32(source.sample_rate)
    # This original-clock integration belongs to31b830, outside prepared lookup.
    omega = f32(float(adjusted)*TAU/sample_rate)
    integrated = 0.0
    for index in range(frame_index-begin//hop):
        distance = hop-begin%hop if index == 0 and begin%hop > 0 else hop
        integrated = f32(float(omega)*distance+float(integrated))
        omega = f32(float(distance)*slopes[index]+float(omega))
    statistics = None
    if hint >= 0:
        phase = math.fmod(float(f32(hint-integrated)),TAU)
        if phase < 0: phase += TAU
        phase = f32(phase)
    else:
        sine_sum=cosine_sum=0.0
        if source.energy != 0:
            sine_sum,cosine_sum,_=correlate(values,window,slopes,adjusted,prepared_rate,0.,
                first,source.hop,hop,begin,chirp=chirp)
        mean=source.mean_weight if source.preweighted else 1.0
        baseline=float(len(values))*.5000000000190247*float(mean)+source.energy
        sine_sum,cosine_sum=f32(sine_sum+sine_sum),f32(cosine_sum+cosine_sum)
        statistics=(f32(baseline-sine_sum),f32(baseline-cosine_sum),
                    f32(baseline+sine_sum),f32(baseline+cosine_sum))
        phase=phase_from_four_statistics(*statistics)
    negative=0.0
    if source.energy != 0:
        _,_,negative=correlate(values,window,slopes,adjusted,prepared_rate,phase,
            first,source.hop,hop,begin,chirp=chirp,negative=True)
    mean=source.mean_weight if source.preweighted else 1.0
    objective=_objective_coefficients(len(values),source.energy,negative,
                                     stride=source.stride,mean_weight=mean)
    scaled_energy=float(source.stride)*source.energy
    amplitude,improvement=amplitude_from_native_objective(scaled_energy,*objective)
    at_frame=hint
    if hint < 0:
        at_frame=math.fmod(float(f32(integrated+phase)),TAU)
        if at_frame < 0: at_frame += TAU
        at_frame=f32(at_frame)
    return NativeTrajectoryEstimate(adjusted,seed,omega,amplitude,at_frame,phase,
                                    scaled_energy,improvement,begin,end,frame_index,hop,
                                    source.energy_begin,source.energy_end,statistics,
                                    objective,slopes,chirp,prepared_sample_rate=prepared_rate,
                                    prepared_hop=source.hop,sample_stride=source.stride,
                                    preweighted=source.preweighted,band_index=source.band_index)


def estimate_trajectory_component(pcm, begin, end, frequency, sample_rate, hop, frame_index,
                                  angular_slopes, *, energy_begin, energy_end,
                                  phase_at_frame_hint=-1.0):
    """31b830 with the real raw-buffer chirp producer branches connected.

    The 64 double slopes are the component+0x18 array, in radians/sample².
    All-zero slopes select the actual constant path with its flat-center sample
    window. Any nonzero slope selects the actual chirp path, which reads raw PCM
    without that extra window. No constant-frequency substitute is used there.

    frequency is the component's seed at begin//H. The returned frequency is
    31b830's adjusted *window-start* component value. The caller must retain its
    target-frame candidate frequency separately, as the native caller does.
    Only band index -1/unweighted raw PCM is implemented by this boundary.
    """
    coordinates = (begin, end, sample_rate, hop, frame_index, energy_begin, energy_end)
    if any(type(value) is not int for value in coordinates):
        raise ValueError('Native sample and frame coordinates must be integers')
    if hop <= 0 or hop & (hop - 1) or sample_rate <= 0:
        raise ValueError('The recovered native hop must be a positive power of two')
    if not (0 <= begin < end <= len(pcm) and 0 <= energy_begin < energy_end <= len(pcm)):
        raise ValueError('Native fit and energy ranges must be inside PCM')
    if not begin // hop <= frame_index <= (end - 1) // hop:
        raise ValueError('Native target frame must lie within the supplied trajectory')
    if math.ceil(end / hop) - begin // hop > 64:
        raise ValueError('Native preparation has at most64 trajectory entries')
    slopes = tuple(float(value) for value in angular_slopes)
    if len(slopes) != 64 or any(not math.isfinite(value) for value in slopes):
        raise ValueError('Exactly64 finite native double angular slopes are required')
    seed = f32(frequency)
    hint = f32(phase_at_frame_hint)
    if not math.isfinite(seed) or seed <= 0 or not math.isfinite(hint):
        raise ValueError('Finite positive seed frequency and finite phase hint required')
    adjusted = f32((float(begin % hop) * slopes[0]) / (TAU / sample_rate) + float(seed))
    if not math.isfinite(adjusted) or adjusted <= 0:
        raise ValueError('Adjusted native window-start frequency is outside supported domain')
    energy = 0.0
    for index in range(energy_begin, energy_end):
        value = f32(pcm[index])
        if not math.isfinite(value):
            raise ValueError('Nonfinite native energy-context PCM')
        energy += float(value) * float(value)
    source = NativePreparedPCM(pcm,float(sample_rate),1,hop,energy,
                               energy_begin,energy_end,-1)
    return estimate_prepared_trajectory_component(source,begin,end,seed,sample_rate,
                                                  hop,frame_index,slopes,
                                                  phase_at_frame_hint=hint)


def estimate_and_subtract(pcm, begin, end, frequency, sample_rate, hop, frame_index,
                          *, energy_begin=None, energy_end=None):
    if frame_index * hop + hop > len(pcm):
        raise ValueError('Native subtraction frame must fit the supplied PCM')
    estimate = estimate_constant_component(pcm, begin, end, frequency, sample_rate, hop, frame_index,
                                          energy_begin=energy_begin, energy_end=energy_end)
    add_component_inplace(pcm, frame_index * hop, hop, sample_rate, -estimate.amplitude, estimate.frequency, estimate.phase_at_frame)
    return estimate
