"""0x14036faf0 group-run scanner, reconstructed from direct instructions.

The caller must provide the already-resolved cursor. The original optionally
raises that cursor using 0x14040b310; that host/editor-dependent preamble is
not implemented here. These runs are inputs to 0x140370a00, NOT final notes.
"""
from dataclasses import dataclass
import struct
from native_frame_groups import EXPANDED_GROUP_BYTES, MAX_FRAME_GROUPS


@dataclass(frozen=True)
class GroupRun:
    start_frame: int | None
    references: tuple[tuple[int, int], ...]
    next_cursor: int
    marked_frames: tuple[tuple[bytes, ...], ...]


def find_group_run(frames: tuple[tuple[bytes, ...], ...], cursor: int,
                   maximum_length: int) -> GroupRun:
    """Select the first unprocessed group and collect its consecutive run.

    Match exact uint32 groupID at +0x9d8 and the sign/type mask 0x8000 at +4;
    processed mask0x1 excludes candidates. Stop at the first missing frame,
    end of input, or caller capacity. Marks are returned as owned snapshots.
    """
    if not isinstance(cursor, int) or cursor < 0 or not isinstance(maximum_length, int) or maximum_length < 1:
        raise ValueError('Nonnegative cursor and positive run capacity required')
    if any(len(frame) > MAX_FRAME_GROUPS or any(len(group) != EXPANDED_GROUP_BYTES for group in frame) for frame in frames):
        raise ValueError('Invalid recovered frame/group layout')
    owned = [[bytearray(group) for group in frame] for frame in frames]
    def snapshot(): return tuple(tuple(bytes(group) for group in frame) for frame in owned)
    seed = None
    for frame_index in range(cursor, len(owned)):
        for group_index, group in enumerate(owned[frame_index]):
            flags, = struct.unpack_from('<H', group, 4)
            key, = struct.unpack_from('<I', group, 0x9D8)
            if not flags & 1 and key != 0xFFFFFFFF:
                seed = (frame_index, group_index, key, flags & 0x8000)
                break
        if seed is not None: break
    if seed is None: return GroupRun(None, (), max(cursor, len(owned)), snapshot())
    start, position, key, type_mask = seed
    run = [(start, position)]
    owned[start][position][4] |= 1
    for frame_index in range(start + 1, len(owned)):
        if len(run) >= maximum_length: break
        match = None
        for group_index, group in enumerate(owned[frame_index]):
            flags, = struct.unpack_from('<H', group, 4)
            candidate, = struct.unpack_from('<I', group, 0x9D8)
            if not flags & 1 and candidate == key and flags & 0x8000 == type_mask:
                match = group_index
                break
        if match is None: break
        owned[frame_index][match][4] |= 1
        run.append((frame_index, match))
    return GroupRun(start, tuple(run), start, snapshot())
