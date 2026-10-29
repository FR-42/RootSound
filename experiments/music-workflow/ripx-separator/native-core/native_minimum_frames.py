"""0x140318820: required valid trajectory-frame count, statically recovered.

Instruction evidence: direct-318820.asm; PE bytes: duration-constants.json.
No claim that this threshold alone identifies a musical note's start or end.
Raw option offsets are retained because their user-facing meanings are unknown.
"""
import math
import struct


def f32(value: float) -> float:
    return struct.unpack('<f', struct.pack('<f', value))[0]


def minimum_valid_frames(kind: int, frequency: float, rate_98a1ac: float,
                         context_24: int, context_28: int, *,
                         flag_91: bool, flag_92: bool, mode_14: int) -> int:
    """Recovered finite, nonnegative-domain behavior, with explicit config.

    rate_98a1ac's assignment and physical units must be confirmed upstream;
    this function does not invent a sample rate, hop, or fixed time threshold.
    """
    if kind != 1:
        return 1
    frequency, rate = f32(frequency), f32(rate_98a1ac)
    if not math.isfinite(frequency) or frequency < 0 or not math.isfinite(rate) or rate < 0:
        raise ValueError('Expected finite, nonnegative frequency and configured rate')
    if not isinstance(context_24, int) or not isinstance(context_28, int) or min(context_24, context_28) < 0:
        raise ValueError('Expected nonnegative context frame capacities')
    limit = context_24 + context_28
    if flag_91:
        span = f32(.1) if frequency < 50 else f32(.07)
    elif flag_92 or mode_14 == 1:
        span = f32(.1)
    elif frequency > 1000:
        span = f32(.05)
    else:
        # DIVSS then MULSS: preserve the division-rounding boundary.
        span = math.inf if frequency == 0 else f32(f32(1 / frequency) * 20)
        span = min(f32(.1), max(f32(.06), span))
    count = math.trunc(f32(f32(rate * span) + f32(.5)))
    return min(limit, max(1, count))
