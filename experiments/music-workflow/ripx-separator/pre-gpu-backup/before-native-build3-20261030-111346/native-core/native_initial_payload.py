"""Default fresh-analysis initial payloads from native expanded frames.

This implements a first block with an initially empty note table. Each run is
packed as the actual 48-harmonic object before time fields are emitted. Cross
block merge, cache refresh25fc80 and373670 postprocessing remain excluded.
"""
from dataclasses import dataclass, replace
from native_group_runs import find_group_run
from native_harmonic_object import NativeHarmonicObject, pack_harmonic_run
from native_initial_times import initial_time_fields
from native_minimum_frames import f32


@dataclass(frozen=True)
class InitialNativePayload:
    time_fields: dict[int, float]
    harmonic_object: NativeHarmonicObject
    time_step_27c: float
    references: tuple[tuple[int, int], ...]
    stage: str = 'native-initial-note-before-cache-and-cleanup'


def build_fresh_initial_payloads(frames, *, context_start: int, rate_98a1ac: float,
                                 timestep_9c3720: float, component_slots: int,
                                 existing_notes: tuple, editing_mode: bool):
    """Normal argument2=1 path, initially empty table, no edit offsets.

    Caller passes native output frames, never audio or estimated group IDs.
    Readiness is deliberately separate from full final-note/MIDI readiness.
    """
    if existing_notes or editing_mode:
        raise NotImplementedError('Cross-block merging/editing is not yet reconstructed')
    if context_start != 0:
        raise NotImplementedError('This entry supports the first native block only')
    step = f32(timestep_9c3720)
    if step <= 0:
        raise ValueError('Explicit positive native frame time step required')
    # 370aeb..370b0e uses single precision 30 / configured time step.
    capacity = int(f32(30. / step))
    current = []
    for frame in frames:
        reset = []
        for g in frame:
            if len(g) != 0x9e0:
                raise ValueError('Invalid expanded native group')
            data = bytearray(g); data[4] &= 0xfe; reset.append(bytes(data))
        current.append(tuple(reset))
    current, cursor, output = tuple(current), 0, []
    while True:
        run = find_group_run(current, cursor, capacity)
        if run.start_frame is None:
            return tuple(output)
        groups = tuple(current[t][g] for t, g in run.references)
        obj = pack_harmonic_run(groups, run.start_frame, component_slots=component_slots)
        # Existing records created in this first block cannot satisfy both
        # same group ID and nonoverlapping boundary at runstart0; verify that
        # invariant rather than silently ignoring a possible merge.
        if run.start_frame == 0 and any(p.harmonic_object.group_id_220 == obj.group_id_220
                                       for p in output):
            raise NotImplementedError('Repeated group identity requires native merge handling')
        fields = initial_time_fields(obj.start, obj.end, rate_98a1ac,
                                     editing_or_offset_mode=False,
                                     matching_existing_note=False)
        # 3723f9..3723fc changes attached object to note-relative indexing.
        relative = replace(obj, start=0, end=obj.end-obj.start)
        output.append(InitialNativePayload(fields, relative, f32(1/f32(rate_98a1ac)), run.references))
        current, cursor = run.marked_frames, run.next_cursor
