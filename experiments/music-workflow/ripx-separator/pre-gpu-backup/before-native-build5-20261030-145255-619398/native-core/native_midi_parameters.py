"""Recovered MIDI event parameter conversions from 0x140304bb0.

This module does not invent a tempo, program map or note detector. The owner
supplies actual native note times/cache and output gain/configuration. It
preserves the writer's note-number byte conversion and amplitude curve.
Sources: midi-writer.c:1750..1810, midi-velocity-clamp.c, midi-time-to-ticks.c.
"""
from dataclasses import dataclass
import math
from native_minimum_frames import f32


@dataclass(frozen=True)
class NativeMidiEventParameters:
    start_seconds: float
    end_seconds: float
    pitch: int
    velocity: int
    native_amplitude: float
    stage: str = 'native-midi-note-parameters'


def native_note_number(continuous_pitch: float) -> int:
    pitch = f32(continuous_pitch)
    if not math.isfinite(pitch): raise ValueError('Finite native pitch required')
    return min(127, math.trunc(f32(pitch+f32(.5))) & 0xff)


def native_velocity(amplitude: float, output_gain: float,
                    minimum_velocity_9886a8: int) -> int | None:
    """Native power curve/doubling/minimum/clamp; zero amplitude emits no note.

    output_gain must be the caller's actual 5a85c0 result (or an explicitly
    user-selected output gain); it is never guessed from track identity.
    """
    amplitude, gain = f32(amplitude), f32(output_gain)
    if not math.isfinite(amplitude) or amplitude < 0 or not math.isfinite(gain) or gain < 0:
        raise ValueError('Finite nonnegative native amplitude and gain required')
    if not isinstance(minimum_velocity_9886a8, int):
        raise ValueError('Explicit native minimum velocity configuration required')
    value = f32(amplitude*gain)
    if value == 0: return None
    powered = f32(f32(math.pow(float(value)/32767., .6020599913))*f32(32767.))
    scaled = f32(f32(powered/f32(32767.))*f32(127.))
    velocity = math.trunc(f32(f32(scaled+scaled)+f32(.5)))
    return max(1, min(127, max(velocity, minimum_velocity_9886a8)))


def note_event_parameters(payload, cache, *, output_gain: float,
                          minimum_velocity_9886a8: int) -> NativeMidiEventParameters | None:
    """Convert real cached native note fields to an editable event document."""
    if not cache.representative_frequency_ready or cache.pitch_24 is None:
        raise NotImplementedError('Native representative-frequency preparation is required before MIDI parameters')
    start, end = f32(payload.time_fields[0x10]), f32(payload.time_fields[0x14])
    if not math.isfinite(start) or not math.isfinite(end) or not 0 <= start < end:
        raise ValueError('Native note time fields are invalid')
    velocity = native_velocity(cache.amplitude_28, output_gain, minimum_velocity_9886a8)
    if velocity is None: return None
    return NativeMidiEventParameters(start, end, native_note_number(cache.pitch_24), velocity,
                                     f32(cache.amplitude_28))


def native_time_to_ticks(time_seconds: float, origin_seconds: float, *,
                         bar_boundaries, initial_bar_start: float,
                         time_signature_numerator: int) -> int:
    """30ac80's explicit recorded-bar coordinate conversion, 256 PPQ.

    Uses the caller's actual bar boundary list; there is deliberately no
    constant-tempo substitute when beat/bar analysis has not been recovered.
    """
    position, origin = f32(time_seconds), f32(origin_seconds)
    boundaries = tuple(f32(t) for t in bar_boundaries)
    if not math.isfinite(position) or not math.isfinite(origin) or any(not math.isfinite(t) for t in boundaries):
        raise ValueError('Finite native timing values required')
    if any(a >= b for a, b in zip(boundaries, boundaries[1:])):
        raise ValueError('Native bar boundaries must increase')
    numerator = time_signature_numerator
    if not isinstance(numerator, int) or not 1 <= numerator <= 0xffff:
        raise ValueError('Explicit valid native meter numerator required')
    if numerator > 5 and numerator % 3 == 0: numerator //= 3
    index = 0
    while index < len(boundaries) and not f32(origin+f32(.001)) < boundaries[index]: index += 1
    previous = f32(initial_bar_start) if index == 0 else boundaries[index-1]
    ticks = 0
    for boundary in boundaries[index:]:
        if f32(position+f32(.001)) <= boundary:
            if boundary == previous: raise ValueError('Native bar interval is empty')
            fraction = f32(f32(f32(position-previous)*f32(numerator*256))/f32(boundary-previous))
            return max(0, ticks+math.trunc(f32(fraction+f32(.5))))
        ticks += numerator*256
        previous = boundary
    return ticks
