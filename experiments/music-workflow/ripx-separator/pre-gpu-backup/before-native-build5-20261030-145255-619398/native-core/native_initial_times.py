"""Recovered fresh, non-editing note-time assignment in 0x140370a00.

Evidence: direct-370a00-region.asm at 370d98/370da2/370dad,
37238a..3723c4 and 3724e1..372503. This maps already retained run indices;
it does not perform harmonic retention, note merging, or whole-rip cleanup.
"""
import math
from native_minimum_frames import f32


def initial_time_fields(start_index: int, end_index: int, rate_98a1ac: float, *,
                        editing_or_offset_mode: bool, matching_existing_note: bool) -> dict[int, float]:
    """Return the eight recovered time-field offsets for the supported branch.

    Explicit unsupported flags prevent callers silently discarding editing
    offsets or existing-note merge behavior. A real pipeline must separately
    establish that the run survived native harmonic processing before emission.
    """
    if editing_or_offset_mode or matching_existing_note:
        raise NotImplementedError('Editing offsets and existing-note merging require unrecovered native branches')
    if not isinstance(start_index, int) or not isinstance(end_index, int) or not 0 <= start_index < end_index <= 0x7FFFFFFF:
        raise ValueError('Expected a nonempty retained run in native signed-index range')
    rate = f32(rate_98a1ac)
    if not math.isfinite(rate) or rate <= 0:
        raise ValueError('Explicit positive configured analysis rate required')
    step = f32(1 / rate)
    start = f32(f32(start_index) * step)
    end = f32(f32(end_index) * step)
    return {0x00: start, 0x04: end, 0x08: start, 0x0C: end,
            0x10: start, 0x14: end, 0x18: start, 0x1C: end}
