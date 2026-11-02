"""Recovered group-run -> initial note-time projection (not final MIDI notes).

Native evidence: 370b60 clears processed bits; 36faf0 selects runs;
370d98/da2 set indices; 371bfb bypasses merging when argument 2 is zero;
37239c/3bc and 3724e1..503 assign times. Harmonic arrays, pitch caches,
allocation failures and later cleanup are not reconstructed by this projection.
"""
from dataclasses import dataclass
import struct
from native_group_runs import find_group_run
from native_initial_times import initial_time_fields


@dataclass(frozen=True)
class InitialNoteTimes:
    group_id: int
    frame_start: int
    frame_end: int
    time_fields: dict[int, float]
    references: tuple[tuple[int, int], ...]
    stage: str = 'initial-note-time-projection'


def project_initial_note_times(frames, context_start: int, rate_98a1ac: float, *,
                               maximum_run_length: int, merge_argument_2: bool,
                               editing_or_offset_mode: bool):
    """Supported branch requires arg2=0, no editing/offset, valid allocations.

    Run capacity must be supplied from the original configuration; no default
    analysis rate, duration or harmonic-to-note guess is introduced here.
    Output intentionally contains no guessed pitch, instrument or velocity.
    """
    if merge_argument_2 or editing_or_offset_mode:
        raise NotImplementedError('Only native no-merge, no-edit initial projection is reconstructed')
    if not isinstance(context_start, int) or context_start < 0:
        raise ValueError('Nonnegative native context start required')
    # 370b60..370b90 clears the consumed bit before scanning a frame block.
    reset = []
    for frame in frames:
        groups = []
        for raw in frame:
            group = bytearray(raw)
            if len(group) != 0x9e0:
                raise ValueError('Invalid expanded group layout')
            group[4] &= 0xfe
            groups.append(bytes(group))
        reset.append(tuple(groups))
    current, cursor, output = tuple(reset), 0, []
    while True:
        run = find_group_run(current, cursor, maximum_run_length)
        if run.start_frame is None:
            return tuple(output)
        first_frame, first_group = run.references[0]
        group_id, = struct.unpack_from('<I', current[first_frame][first_group], 0x9d8)
        start = context_start + run.start_frame
        end = start + len(run.references)
        fields = initial_time_fields(start, end, rate_98a1ac,
                                     editing_or_offset_mode=False,
                                     matching_existing_note=False)
        output.append(InitialNoteTimes(group_id, start, end, fields, run.references))
        current, cursor = run.marked_frames, run.next_cursor
