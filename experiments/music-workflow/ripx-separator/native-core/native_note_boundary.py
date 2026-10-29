"""Fail-closed handoff between recovered harmonic groups and real notes.

The actual 0x90 note table is confirmed at the MIDI consumer. Its producer is
not recovered yet. A frame group cannot legally be promoted to a musical note
merely by joining equal IDs or applying an arbitrary envelope threshold.
"""
from dataclasses import dataclass
from native_frame_groups import FrameGroups


class NativeNoteBoundaryUnavailable(NotImplementedError):
    """The required producer has not been recovered; no fallback is permitted."""


@dataclass(frozen=True)
class BoundaryCoverage:
    frame_group_assembly: str = 'static-derived; synthetic tests passed'
    frame_group_expansion: str = '0x1403449c0; direct instruction-derived; synthetic tests passed'
    trajectory_minimum_frames: str = '0x140318820; direct instruction-derived; synthetic tests passed'
    note_table_consumer: str = '0x140304bb0: stride 0x90; start +0x10; end +0x14'
    note_table_producer: str = 'unresolved'
    unresolved_calls: tuple[str, ...] = ('0x140370a00', '0x14036faf0', '0x140377c10')
    original_runtime_differential: bool = False
    fallback_allowed: bool = False


COVERAGE = BoundaryCoverage()


def identify_note_boundaries(frames: tuple[FrameGroups, ...]):
    """Never return invented notes, including for empty/marked-only input.

    Empty input cannot distinguish a truly silent analysis from an incomplete
    producer. The overall pipeline must establish that separately.
    """
    raise NativeNoteBoundaryUnavailable(
        'RipX native harmonic frame groups are available, but their final '
        'note onset/offset producer is unresolved. No Basic Pitch, public '
        'model, threshold-based or group-ID-based substitute was run.')
