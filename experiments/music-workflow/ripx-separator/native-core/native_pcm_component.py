"""Static reconstruction of RipX 0x1403190b0 PCM component add/subtract.

This is the actual observed lookup-table/fixed-phase/window algorithm, not a
generic sinusoid renderer. No RipX process or extracted executable code runs.
All constants and instruction ranges are listed in PCM-RECONSTRUCTION.txt.
Full note identification and original-runtime equivalence remain unestablished.
"""
from functools import lru_cache
import math
from native_harmonic_fields import f32

TAU = 6.283185307179586
TABLE_SCALE = 5215.189175235227
PHASE_FRACTION = 4294967296.0
MASK64 = (1 << 64) - 1


def _table_sine_fast(x):
    """61dd30 fast branch used by every 36e5a0 table input (0 < x < 2pi).

    Explicit multiply/add ordering matches SSE2, without FMA contraction.
    This deliberately does not call math.sin as an unproven replacement.
    """
    biased = x * 0.3183098861837907 + 6755399441055744.0
    k = biased - 6755399441055744.0
    r = x - 3.141592502593994 * k
    r = r - 1.5099578831723193e-7 * k
    r = r - 1.078060505991553e-14 * k
    r2 = r * r
    y = r - 6.564007085747001e-22 * k
    r4 = r2 * r2
    odd = -7.642917806891047e-13 * r4 + -2.5052106798274583e-8
    odd = odd * r4 + -0.0001984126984120184
    odd = odd * r4 + -0.16666666666666666
    even = 2.7204790957888847e-15 * r4 + 1.605893649037159e-10
    even = even * r4 + 2.7557319210152756e-6
    even = even * r4 + 0.008333333333333165
    even = even * r4
    odd = odd * (r2 * y)
    even = even * y
    result = even + (odd + y)
    return -result if int(k) & 1 else result


@lru_cache(maxsize=1)
def native_sine_table():
    """36e5a0: half-bin-centered, 32768-entry float32 sine table."""
    return tuple(f32(_table_sine_fast((i + .5) / TABLE_SCALE)) for i in range(32768))


def phase_state(frequency, sample_rate, phase_at_start, left_span):
    """3190b0 0x3190bc..0x319211, finite ordinary audio inputs."""
    if not isinstance(sample_rate, int) or not 0 < sample_rate < 2**31:
        raise ValueError('Native integer sample-rate argument is required')
    frequency, phase_at_start = f32(frequency), f32(phase_at_start)
    if not math.isfinite(frequency) or not math.isfinite(phase_at_start):
        raise ValueError('Nonfinite oscillator arguments are unsupported')
    omega = math.fmod(float(frequency) * TAU / sample_rate, TAU)
    if omega < 0:
        omega += TAU
    omega = f32(omega)
    shifted = f32(phase_at_start - f32(f32(left_span) * omega))
    phase = math.fmod(float(shifted), TAU)
    if phase < 0:
        phase += TAU
    increment = int(float(omega) * TABLE_SCALE * PHASE_FRACTION + .5)
    position = int(phase * TABLE_SCALE * PHASE_FRACTION + .5)
    return position & MASK64, increment & MASK64


def add_component_inplace(pcm, start, hop, sample_rate, amplitude, frequency, phase_at_start):
    """Add native tapered component into a mutable mono float32 PCM buffer.

    Pass negative amplitude to reproduce the residual subtraction caller.
    start, hop and len(pcm) correspond directly to args 2, 4 and 3.
    Unlike generic overlap-add, the zero-valued edge is not written, and a
    clipped left edge still starts at index start-left_span+1.
    Valid native buffer coordinates only; no guessed behavior outside bounds.
    Returns the half-open written range; an empty range means no samples changed.
    """
    if not isinstance(start, int) or not isinstance(hop, int) or start < 0 or hop < 1 or start + hop > len(pcm):
        raise ValueError('Component window must lie within the supplied PCM buffer')
    amplitude = f32(amplitude)
    if not math.isfinite(amplitude):
        raise ValueError('Amplitude must be finite')
    left = min(hop // 2, start)
    end = start + hop
    right = min(hop // 2, len(pcm) - end)
    first = start - left + 1
    position, increment = phase_state(frequency, sample_rate, phase_at_start, left)
    table = native_sine_table()
    index = first

    def add_at(index, weight=None):
        nonlocal position
        position = (position + increment) & MASK64
        value = f32(amplitude * table[(position >> 32) & 0x7fff])
        if weight is not None:
            value = f32(value * weight)
        pcm[index] = f32(f32(pcm[index]) + value)

    stop = start + left
    while index < stop:
        weight = f32(f32(index - start + left) / f32(2 * left))
        add_at(index, weight)
        index += 1
    stop = end - right
    while index < stop:
        add_at(index)
        index += 1
    stop = end + right
    while index < stop:
        weight = f32(f32(end + right - index) / f32(2 * right))
        add_at(index, weight)
        index += 1
    return first, index
