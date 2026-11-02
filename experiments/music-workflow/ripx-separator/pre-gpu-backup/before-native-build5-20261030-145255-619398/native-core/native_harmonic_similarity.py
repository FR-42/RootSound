"""Repeated native pitch/Hz compatibility primitive, owned at one boundary.

33548033668x/3368xx,3247703251xx,321770321xxx and32edb032f5xx
all use max in the high-frequency branch and min below base*17.317154.
The Hz difference follows the pitch direction, preserving native rounding.
"""
from native_spectral import f32


def native_harmonic_similarity(frequency,pitch,other_frequency,other_pitch,*,flag_91=False):
    base=f32(10 if flag_91 else 8.5)
    high=f32(base*f32(17.317153930664062))<=frequency
    denominator=f32(310) if high else base
    if other_pitch<=pitch:
        pitch_delta=f32(pitch-other_pitch);frequency_delta=f32(f32(frequency-other_frequency)/denominator)
    else:
        pitch_delta=f32(other_pitch-pitch);frequency_delta=f32(f32(other_frequency-frequency)/denominator)
    distance=max(pitch_delta,frequency_delta) if high else min(pitch_delta,frequency_delta)
    return f32(f32(1)-min(f32(1),distance))
