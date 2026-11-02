"""Default non-edit branch of 370a00, 371cdf..372098.

This decides eligibility only. Actual merge still requires native array
operation 370070 and cache refresh. Boundary frequencies must come from the
recovered native getter, not a replacement pitch estimator.
"""
from dataclasses import dataclass
import math
from native_minimum_frames import f32


@dataclass(frozen=True)
class MergeCandidate:
    old_start_time: float
    old_end_time: float
    old_type_flags: int
    old_group_id: int
    old_boundary_frequency: float


def native_pitch(frequency):
    frequency = f32(frequency)
    if not math.isfinite(frequency) or frequency <= 0:
        raise ValueError('Nonpositive/nonfinite pitch comparison outside wrapper coverage')
    return f32(math.log10(float(frequency)*32./440.)*12./0.3010299956639812 + 9.)


def note_frequency_at_frame(payload, absolute_frame: int, *, current_rip_timestep: float):
    """25f6c0 layer0 getter; current-rip time step is explicit, not inferred."""
    obj = payload.harmonic_object
    if obj.start >= obj.end:
        return 0.
    step = f32(current_rip_timestep)
    relative_frame = absolute_frame
    if step != 0:
        relative_frame -= int((f32(payload.time_fields[0x10])+.0005)/step)
    if obj.flags_21c & 0x8000:
        return obj.frequencies[0]
    relative_frame = max(obj.start, min(obj.end-1, relative_frame))
    return obj.frequencies[relative_frame-obj.start]


def eligible_default_merge(candidate, new_object, *, timestep: float,
                           pitch_tolerance_9399e0: float, run_start: int):
    """Return true iff native default-path candidate passes recovered checks.

    Input time step and pitch tolerance are explicit native configuration.
    Caller scans the note table backwards down to DAT941c78 inclusive.
    """
    if run_start != 0:
        return False
    timestep = f32(timestep)
    if not math.isfinite(timestep) or timestep <= 0:
        raise ValueError('Positive native time step required')
    # asm adds 0 as float32, promotes to double, then adds double .0005.
    old_start = int((f32(candidate.old_start_time)+.0005)/timestep)
    old_end = int((f32(candidate.old_end_time)+.0005)/timestep)
    start, end = new_object.start, new_object.end
    if start-old_end > 1 or start < old_end:
        return False
    if (candidate.old_type_flags ^ new_object.flags_21c) & 0x8000:
        return False
    if candidate.old_group_id != new_object.group_id_220 or end < old_start:
        return False
    # Since start >= old_end, native clamp(max(start, old_end-1)) selects start.
    old_pitch = native_pitch(candidate.old_boundary_frequency)
    new_pitch = native_pitch(new_object.frequencies[0])
    return not (pitch_tolerance_9399e0 < float(f32(old_pitch-new_pitch)) or
                pitch_tolerance_9399e0 < float(f32(new_pitch-old_pitch)))
