"""Recovered 3747f0 -> 36b4e0 full-range amplitude cache and 25fc80 fields.

Direct instruction evidence: direct-3747f0.asm, direct-36b460.asm. The full
representative-frequency producer is implemented in native_frequency_cache
and native_frequency_prepare from retained whole-*.c REA evidence.
"""
from dataclasses import dataclass
import math
from native_minimum_frames import f32
from native_merge_candidate import native_pitch


@dataclass(frozen=True)
class NativeNoteCache:
    frequency_20: float | None
    pitch_24: float | None
    amplitude_28: int
    flags_44: int | None
    representative_frequency_ready: bool


def native_amplitude_cache(obj, timestep_27c: float) -> int:
    """25fc80's full object range, all-harmonic amplitude request.

    36b4e0 selects an initial scan length from round(.5/timeStep), capped
    by trunc(2*length/3) with the source's minimum-one fallback, then keeps
    the maximum float32 sum over all harmonic/component uint16 amplitudes.
    The result is a native cache integer, NOT MIDI velocity.
    """
    count = obj.end-obj.start
    step = f32(timestep_27c)
    if count <= 0: return 0
    if not math.isfinite(step) or step <= 0:
        raise ValueError('Positive constant native timestep required')
    limit = math.trunc(f32(f32(f32(.5)/step)+f32(.5)))
    two_thirds = (count*2)//3
    if limit > two_thirds: limit = max(1, two_thirds)
    maximum = 0.
    for frame in range(limit):
        value = 0.
        for harmonic in obj.harmonics:
            for component in harmonic.amplitudes:
                if len(component) != count:
                    raise ValueError('Native amplitude array length mismatch')
                value = f32(value + component[frame])
        maximum = max(maximum, value)
    return math.trunc(maximum)


def build_note_cache(payload, *, representative_frequency: float | None = None,
                     flags_44: int | None = None) -> NativeNoteCache:
    """25fc80's actual default cache update, including native pitch producer."""
    if representative_frequency is None:
        from native_frequency_cache import representative_frequency as produce_frequency
        representative_frequency = produce_frequency(payload.harmonic_object, timestep=payload.time_step_27c)
    frequency = f32(representative_frequency)
    if not math.isfinite(frequency) or frequency <= 0:
        raise ValueError('Finite positive native representative frequency required')
    pitch = native_pitch(frequency)
    return NativeNoteCache(frequency, pitch,
                           native_amplitude_cache(payload.harmonic_object, payload.time_step_27c),
                           None if flags_44 is None else flags_44 & 0xfffffffd,
                           True)
