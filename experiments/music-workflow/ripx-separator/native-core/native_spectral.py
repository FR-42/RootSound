"""Evidence-derived pieces of RipX.exe 0x140326880.

This is NOT a complete PCM transcriber. No default window, hop, sample scale,
or transform backend is guessed. `select_spectral_peaks` starts at the native
post-transform scalar array, immediately before the loop at 0x140326880's
spectral-frame-analysis.c lines 348-415. Helper 0x140614580 was independently
confirmed as sqrt(re*re+im*im) through its assembly and sqrt import.

Evidence ev_fe806f1622cce01d8567300962445237f3a52a618ce47c229230d114364dd389.
Target SHA256 5f088fa4fbbe1759ef75d8034c79f33c846e3bf5f13d5048dd95a6614d2ad441.
Static-derived finite-domain implementation; original-runtime equivalence is
unverified. Standard float32 rounding is explicit; centroid mulss/addss were
corroborated at 0x140327197..0x1403271ba (no fused operation).
"""
from dataclasses import dataclass, replace
import ctypes
import math
from functools import lru_cache
from native_fft import forward_real


def f32(value):
    return ctypes.c_float(value).value


def _native_power_of_two(threshold):
    result, candidate, exponent = 2, 4, 2
    while candidate <= threshold and exponent < 16:
        result = candidate
        exponent += 1
        candidate <<= 1
    return result


def native_configuration(sample_rate):
    """N/H from confirmed initializers, not conventional STFT defaults.

    0x140365f70 chooses H from trunc(float32(Fs/64))+1.
    0x14031f5a0, instructions 0x14031f673..0x14031f6e9 choose N from
    trunc(float32(float32(Fs/15)+float32(0.5001))). Both cap at 32768.
    Input Fs is the caller's WAVEFORMATEX sample rate; no resampling assumed.
    """
    if not isinstance(sample_rate, int) or not 8000 <= sample_rate <= 192000:
        raise ValueError('Reconstructed audio domain is 8000..192000 Hz')
    hop_threshold = math.trunc(f32(f32(sample_rate) * f32(.015625))) + 1
    window_threshold = math.trunc(f32(f32(f32(sample_rate) / f32(15)) + f32(.5001)))
    return dict(sample_rate=sample_rate, base_window=_native_power_of_two(window_threshold),
                hop=_native_power_of_two(hop_threshold))


@lru_cache(maxsize=8)
def native_window(length):
    """0x1406145a0: symmetric Hann; constants verified in original PE bytes.

    Formula confirmed for scalar and two-lane vector paths. math.cos is a
    standard numerical primitive; the original SIMD cosine implementation
    may differ in last bits. The supported analysis windows are all >= 4.
    """
    if not isinstance(length, int) or length < 2:
        raise ValueError('At least two samples required')
    return tuple((1.0 - math.cos((float(index) * 6.283185307179586) / (length - 1))) * .5
                 for index in range(length))


@dataclass(frozen=True)
class FrameLayout:
    level: int
    input_samples: int
    transform_samples: int
    retained_bins: int
    cache_stride: int
    start_sample: int
    strength_scale: float


def frame_layout(*, base_window: int, hop: int, frame_sample: int, level: int):
    """Native nonnegative-PCM-index layout; all configuration is caller supplied.

    0x140326880 local_144/uVar21/local_124/iVar9. The analysis cache stride
    max(H,N/4) is NOT the analysis hop. The returned start can be negative;
    native extraction uses zero samples outside the actual PCM allocation.
    """
    if not isinstance(base_window, int) or base_window < 4 or base_window % 4:
        raise ValueError('Explicit base_window must be positive and divisible by four')
    if not isinstance(hop, int) or hop < 1 or not isinstance(frame_sample, int) or frame_sample < 0:
        raise ValueError('Explicit hop and nonnegative frame sample required')
    if level not in (1, 2):
        raise ValueError('Only observed level 1 and level 2 loop branches are reconstructed')
    count = base_window * level
    stride = max(hop, base_window // 4)
    start = hop // 2 - stride // 2 - frame_sample % stride - count // 2 + stride + frame_sample
    return FrameLayout(level, count, count * 2, count, stride, start, f32(f32(base_window / count) * 2))


def windowed_frame(pcm, window, layout):
    """Exact zero-pad/extract/multiply representation, with explicit window data.

    Does not generate a guessed Hann/Hamming window. PCM values first narrow to
    native float32 then widen to float64; window multiplication is float64.
    """
    if len(window) != layout.input_samples:
        raise ValueError('Window length disagrees with native frame layout')
    output = [0.0] * layout.transform_samples
    for offset, coefficient in enumerate(window):
        coefficient = float(coefficient)
        if not math.isfinite(coefficient):
            raise ValueError('Only finite window coefficients are supported')
        index = layout.start_sample + offset
        if 0 <= index < len(pcm):
            value = f32(pcm[index])
            if not math.isfinite(value):
                raise ValueError('Only finite PCM inputs are supported')
            output[offset] = float(value) * coefficient
    return output


@dataclass(frozen=True)
class SpectralPeak:
    slot: int
    strength: float
    frequency_hz: float
    level: int
    center_bin: int
    # This is the raw FFT center-bin phase. Native 326880's output record does
    # not copy it; it must never be presented as the final refined note phase.
    center_bin_phase_radians: float | None = None


def select_spectral_peaks(short_magnitudes, long_magnitudes, *, sample_rate: int, base_window: int):
    """Combine two native scalar spectra into the shared N-record peak table.

    Arrays contain bins [0,N) / [0,2N), omitting the Nyquist bin, from 2N/4N
    transforms. The long spectrum contributes only centers strictly below
    220 Hz. Same-slot candidates replace only on strictly greater strength.
    Missing transforms must be supplied; no fallback FFT or AI is called.
    """
    if not isinstance(sample_rate, int) or sample_rate <= 0:
        raise ValueError('Explicit positive sample_rate required')
    frame_layout(base_window=base_window, hop=1, frame_sample=0, level=1)
    if len(short_magnitudes) != base_window or len(long_magnitudes) != base_window * 2:
        raise ValueError('Scalar spectra do not match explicit base_window')
    peaks = {}
    for level, magnitudes in ((1, short_magnitudes), (2, long_magnitudes)):
        values = tuple(float(x) for x in magnitudes)
        if any(not math.isfinite(x) or x < 0 for x in values):
            raise ValueError('Only finite nonnegative post-transform scalars are reconstructed')
        count = base_window * level
        scale = f32(f32(base_window / count) * 2)
        bin_hz = f32(f32(sample_rate) / f32(count * 2))
        ceiling = min(f32(f32(sample_rate) * .5), 24000.0)
        threshold = f32((float(count) + float(count)) * .7071067812 * 8.0)
        for center in range(1, count):
            frequency = f32(f32(center) * bin_hz)
            if ceiling < frequency:
                break
            if level == 2 and not frequency < 220.0:
                continue
            left = f32(scale * values[center - 1]) if center > 1 else 0.0
            strength = f32(scale * values[center])
            right = f32(scale * values[center + 1]) if center + 1 < count else 0.0
            if strength < threshold or left > strength or right > strength:
                continue
            slot = ((center - 1) * base_window) // count
            previous = peaks.get(slot)
            if previous is not None and previous.strength >= strength:
                continue
            denominator = numerator = 0.0
            for index in range(max(1, center - 1), min(count - 1, center + 1) + 1):
                magnitude = f32(values[index])
                denominator = f32(denominator + magnitude)
                weight = f32(f32(f32(index) * bin_hz) * magnitude)
                numerator = f32(weight + numerator)
            centroid = f32(numerator / denominator) if denominator else numerator
            peaks[slot] = SpectralPeak(slot, strength, centroid, level, center)
    return [peaks[slot] for slot in sorted(peaks)]


def iter_pcm_spectral_frames(read_pcm, *, sample_count, sample_rate, start_frame=0, stop_frame=None, fft=forward_real):
    """Bounded PCM-reader → native-layout/window/peak frames (not notes).

    `read_pcm(start,count)` must return one-dimensional *native amplitude-unit*
    samples, and exactly count entries. Input decoding/channel mixing/scaling
    remains the caller's explicit responsibility. The original reader supports
    signed-int16-unit PCM; blindly passing normalized [-1,1] changes thresholds.

    Uses the statically reconstructed radix-4/2 packed-real FFT in native_fft.
    Its negative-exponent and unnormalized scale are traced through original
    plan setup, recursive workers, butterflies and real recombination. NumPy
    is only used for bounded arrays/sqrt/atan2, never an AI or FFT fallback.
    Original-runtime differential roundoff is unverified, so this frontend is
    explicitly static-derived, not a bit-equivalent native implementation.

    Frame numbering starts from a caller-chosen absolute sample-clock index.
    RipX task-specific leading/trailing analysis context is not reconstructed.
    Only the last transform per resolution is retained; output is a generator.
    """
    import numpy as np
    if not isinstance(sample_count, int) or sample_count < 0:
        raise ValueError('sample_count must be a nonnegative integer')
    config = native_configuration(sample_rate)
    n, hop = config['base_window'], config['hop']
    frame_count = (sample_count + hop - 1) // hop
    stop_frame = frame_count if stop_frame is None else stop_frame
    if not isinstance(start_frame, int) or not isinstance(stop_frame, int) or not 0 <= start_frame <= stop_frame <= frame_count:
        raise ValueError('Invalid caller-selected frame range')
    cache = {}
    windows = {level: np.asarray(native_window(n * level), dtype=np.float64) for level in (1, 2)}
    for frame_index in range(start_frame, stop_frame):
        spectra = []
        contexts = []
        for level in (1, 2):
            layout = frame_layout(base_window=n, hop=hop, frame_sample=frame_index * hop, level=level)
            contexts.append(dict(level=level, start_sample=layout.start_sample,
                                 input_samples=layout.input_samples, transform_samples=layout.transform_samples))
            previous = cache.get(level)
            if previous is not None and previous[0] == layout.start_sample:
                spectrum = previous[1]
            else:
                data = np.zeros(layout.transform_samples, dtype=np.float64)
                first, end = max(0, layout.start_sample), min(sample_count, layout.start_sample + layout.input_samples)
                if end > first:
                    pcm = np.asarray(read_pcm(first, end - first), dtype=np.float32)
                    if pcm.ndim != 1 or len(pcm) != end - first or not np.isfinite(pcm).all():
                        raise ValueError('PCM reader must supply exactly the requested finite mono float32 samples')
                    offset = first - layout.start_sample
                    data[offset:offset + len(pcm)] = pcm
                data[:layout.input_samples] *= windows[level]
                transformed = np.asarray(fft(data)[:layout.retained_bins], dtype=np.complex128)
                # 0x140614580 has separate re*re + im*im then sqrt, not hypot.
                spectrum = np.sqrt(transformed.real * transformed.real + transformed.imag * transformed.imag)
                # 0x140614560 reads re in XMM1 and im in XMM0 then calls atan2.
                phases = np.arctan2(transformed.imag, transformed.real)
                cache[level] = (layout.start_sample, spectrum, phases)
            spectra.append(spectrum)
        peaks = select_spectral_peaks(*spectra, sample_rate=sample_rate, base_window=n)
        peaks = [replace(peak, center_bin_phase_radians=float(cache[peak.level][2][peak.center_bin])) for peak in peaks]
        yield dict(frame_index=frame_index, sample_index=frame_index * hop,
                   time_seconds=frame_index * hop / sample_rate,
                   windows=contexts, peaks=peaks)
