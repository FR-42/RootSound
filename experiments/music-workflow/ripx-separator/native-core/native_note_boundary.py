"""Fail-closed handoff between recovered harmonic groups and real notes.

The actual 0x90 note table's initial producer is located in 0x140370a00.
Initial creation and ordinary zero/one-frame continuation are implemented
separately. Representative-frequency preparation is implemented. This legacy
signature lacks the actual native clock/options; useNativeNoteOwner for the
refined-frame pipeline.373670 only frees scratch memory.
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
    note_table_producer: str = 'initial creation/default continuation/native caches implemented;373670 is memory cleanup'
    group_run_scanner: str = '0x14036faf0: core recovered; host/editor cursor preamble excluded'
    initial_time_projection: str = 'native_initial_payload.py: default argument2=1, first block with empty note table'
    unresolved_calls: tuple[str, ...] = ()
    original_runtime_differential: bool = False
    fallback_allowed: bool = False


COVERAGE = BoundaryCoverage()


def identify_note_boundaries(frames: tuple[FrameGroups, ...]):
    """Never return invented notes, including for empty/marked-only input.

    Empty input cannot distinguish a truly silent analysis from an incomplete
    producer. The overall pipeline must establish that separately.
    """
    raise NativeNoteBoundaryUnavailable(
        'This legacy boundary has no native clock/options. UseNativeNoteOwner '
        'with actual refined0x4c records for initial notes, continuation andcache refresh. '
        '373670 is scratch-memory cleanup, not a missing musical-note algorithm.')
