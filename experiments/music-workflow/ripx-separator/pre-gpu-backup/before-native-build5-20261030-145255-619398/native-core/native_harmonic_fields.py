"""Static reconstruction of two bounded RipX native harmonic stages.

NOT a full resynthesizer. No waveform or note detector is substituted here.
Source: RipX.exe SHA256 5f088fa4fbbe1759ef75d8034c79f33c846e3bf5f13d5048dd95a6614d2ad441.
0x140319940: frequency trajectory preparation immediately before 0x14031b830.
0x1403443e0: component-field output conversion, not the enclosing ownership loop.
The original executable has not been run for differential comparison.
"""
from dataclasses import dataclass
import math
import struct


def f32(value):
    return struct.unpack('<f', struct.pack('<f', value))[0]


@dataclass(frozen=True)
class PreparedTrajectory:
    seed_frequency: float
    angular_slopes: tuple[float, ...]


def prepare_trajectory(frequencies, fallback_frequency, sample_rate, hop):
    """319940's selected frequency slice -> double angular slopes.

    Caller owns the native frame/window slice; this does not invent N, H,
    sample-rate defaults, or time boundaries. Zero frequencies are gaps.
    Difference is rounded to float32 BEFORE promotion to double, as in code.
    Slopes are radians/sample^2 IF the supplied clock is the sample rate.
    The native global DAT_14098a154's assignment still needs tracing; this
    function does not claim its initialization has already been recovered.
    """
    if not math.isfinite(sample_rate) or sample_rate <= 0 or not isinstance(hop, int) or hop <= 0:
        raise ValueError('The native sample clock and hop must be supplied explicitly')
    values = [f32(x) for x in frequencies]
    if len(values) > 64 or any(not math.isfinite(x) or x < 0 for x in values):
        raise ValueError('Expected the caller-selected <=64 finite nonnegative frequencies')
    fallback_frequency = f32(fallback_frequency)
    if not math.isfinite(fallback_frequency) or fallback_frequency <= 0:
        raise ValueError('A finite positive current frequency is required')
    seed = None
    slopes = []
    factor = 6.283185307179586 / sample_rate
    for left, right in zip(values, values[1:]):
        if left != 0 and right != 0:
            slopes.append(float(f32(right - left)) * factor / hop)
            if seed is None:
                seed = left
        else:
            slopes.append(0.0)
    return PreparedTrajectory(fallback_frequency if seed is None else seed, tuple(slopes))


def encode_phase(phase):
    """3443e0's unsigned 16-bit phase carrier; period is 62832 units.

    The C decompiler prints signed shorts, but the stored bits are unsigned.
    0xf570 is the wrap threshold; +0xa90 modulo 65536 subtracts 62832.
    """
    phase = f32(phase)
    if not math.isfinite(phase):
        phase = 0.0
    tau = f32(6.2831855)
    phase = f32(math.fmod(phase, tau))
    if phase < 0:
        phase = f32(phase + tau)
    quantized = int(f32(f32(phase * f32(10000.0)) + f32(.5)))
    if quantized >= 0xf570:
        quantized += 0xa90
    return quantized & 0xffff


@dataclass(frozen=True)
class OutputComponent:
    frequency: float
    phase_left_u16: int
    phase_right_u16: int
    transformed_strength: float
    balance_i16: int


def phase_from_four_statistics(a, b, c, d):
    """31b830 31bb41..31bc1e, after producer 32a1b0.

    This consumes the real producer's four statistics, not raw PCM. Until that
    producer is recovered, generic correlations must not be substituted here.
    Operation order preserves double cancellation in the original instructions.
    """
    if not all(math.isfinite(v) for v in (a, b, c, d)):
        raise ValueError('Finite native statistics required')
    mean_ac = (c + a) * .5
    mean_bd = (d + b) * .5
    first = (((a - mean_bd) + (a - mean_ac)) - (c - mean_ac)) - (c - mean_bd)
    second = (((b - mean_bd) + (b - mean_ac)) - (d - mean_ac)) - (d - mean_bd)
    phase = math.fmod(4.71238898038469 - math.atan2(first * .25, second * .25), 6.283185307179586)
    if phase < 0:
        phase += 6.283185307179586
    return f32(phase)


def amplitude_from_native_objective(total_energy, quadratic, linear, constant):
    """31b830 31bc6f..31bd43; coefficients must come from native3297a0.

    Not a general least-squares replacement. Original code evaluates the
    objective at the *unclipped* ratio, then clips amplitude to [0,32767].
    Returns (float32 amplitude, double energy improvement).
    """
    if not all(math.isfinite(v) for v in (total_energy, quadratic, linear, constant)):
        raise ValueError('Finite native objective required')
    if total_energy == 0:
        return 0.0, 0.0
    if quadratic <= 0:
        raise ValueError('Degenerate native quadratic requires original boundary analysis')
    ratio = (linear * -.5) / quadratic
    residual = ((ratio * quadratic) * ratio + ratio * linear) + constant
    amplitude = f32(max(0.0, min(32767.0, ratio)))
    improvement = total_energy - residual
    if improvement <= 0:
        amplitude = 0.0
    return amplitude, improvement


def output_component(frequency, phase_left, phase_right, amplitude_left, amplitude_right, channel_mode):
    """3443e0 fields +0, +4/+6, +8, +0xc for one 0x10-byte slot.

    channel_mode is DAT_1409399a8; caller must supply it. Its wider mode
    semantics are intentionally not replaced with a guessed channel count.
    This returns known fields only, not an invented complete binary record.
    """
    if channel_mode not in (1, 2, 3):
        raise ValueError('Only observed modes 1, 2, 3 are supported')
    frequency, left, right = map(f32, (frequency, amplitude_left, amplitude_right))
    if not all(math.isfinite(x) for x in (frequency, left, right)) or min(left, right) < 0:
        raise ValueError('Expected finite frequency and nonnegative component amplitudes')
    average = left if channel_mode == 1 else f32(f32(left + right) * f32(.5))
    strength = f32(f32(math.pow(float(average) / 32767.0, 1.6609640475208238)) * f32(32767.0)) if average > 0 else 0.0
    balance = 0
    if channel_mode >= 3:
        if left > 0 or right > 0:
            balance = f32(f32(f32(right / f32(right + left)) * f32(65534.0)) - f32(32767.0))
            balance = f32(balance - f32(.5001)) if balance < 0 else f32(balance + f32(.5001))
        else:
            balance = f32(.5001)
        balance = int(max(-32767.0, min(32767.0, balance)))
    return OutputComponent(frequency, encode_phase(phase_left), encode_phase(phase_right), strength, balance)
