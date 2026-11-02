"""Native task-local trajectory tail and unique whole-song frame ownership.

32dd40 owns crop/rebase before3443e0 consumes the task's original objects.
367be0 establishes PCM origin=(block_index*context24-context28)*hop.
345080 establishes the configurable emit interval, not a guessed chunk join.
No original runtime or audio verification was run for this reconstruction.
"""
from dataclasses import dataclass
import struct

from native_minimum_frames import minimum_valid_frames
from native_tracking import NativeTrackingPolicy
from native_trajectory_output import NativeTrajectory, NativeOutputPolicy, emit_frame_records


@dataclass(frozen=True)
class NativeTailCapture:
    trajectories: tuple[NativeTrajectory, ...]
    source_indices: tuple[int, ...]
    next_origin_shift_frames: int
    below_minimum_indices: tuple[int, ...]


@dataclass(frozen=True)
class NativeTaskHandoff:
    record_frames: tuple[bytes, ...]
    first_output_frame: int
    next_output_frame: int
    next_origin_frame: int
    retained: NativeTailCapture
    consumed_trajectory_indices: tuple[int, ...]
    rejected_trajectory_indices: tuple[int, ...]
    output_capacity_drops: tuple[tuple[int, int], ...]


def native_task_output_interval(*, context_24, task_start, task_end,
                                task_identity_is_first, control_flag_44,
                                worker_index=-1, worker_count=1,
                                worker_task_is_final=False):
    """345080's exact interval arithmetic; flags preserve their source identity.

    task_identity_is_first meansparam1[0]==param1[1]. control_flag_44 is
    the owning dispatch/control object's byte+44, distinct from trajectory flags.
    This function selects native output ownership, not new acoustic thresholds.
    """
    if any(type(x) is not int for x in (context_24,task_start,task_end,worker_index,worker_count)):
        raise ValueError('Actual native dispatch coordinates required')
    if context_24<0 or task_end<task_start or worker_count<1 or worker_index>=worker_count:
        raise ValueError('Invalid native dispatch coordinates')
    half=context_24>>1
    first=task_start-(0 if task_identity_is_first else half)
    stop=task_end-(0 if control_flag_44 else half)
    if worker_index>=0:
        if task_identity_is_first and worker_index>0:first=task_start+half
        if worker_task_is_final and worker_index<worker_count-1:stop=task_end-half+1
    if first<0 or stop<first:raise ValueError('Native output interval lies outside the prepared task-local domain')
    return first,stop


def capture_native_task_tail(trajectories, *, policy, task_start, task_end):
    """32dd40: qualification, native crop atcontext24, then signed-short rebase.

    These are copied immutable snapshots captured BEFORE3443e0 consumption.
    No last-note guessing, overlap duplication or nearest-neighbor linking is
    performed. Group identity, component flags and refined samples stay exact.
    """
    if not isinstance(policy,NativeTrackingPolicy):raise TypeError('Actual native tracking policy required')
    if any(type(x) is not int for x in (task_start,task_end)) or task_end<task_start:
        raise ValueError('Actual ordered task-local frame interval required')
    retained=[];indices=[];below=[]
    for index,trajectory in enumerate(trajectories):
        if not isinstance(trajectory,NativeTrajectory):raise TypeError('Actual refined native trajectories required')
        header=trajectory.header
        if header[0x0c]&1:continue
        frequency=struct.unpack_from('<f',header,0x18)[0]
        minimum=minimum_valid_frames(header[0x24],frequency,policy.rate_98a1ac,
            policy.context_24,policy.context_28,flag_91=policy.flag_91,
            flag_92=policy.flag_92,mode_14=policy.mode_14)
        if sum(not frame[0x48]&0x82 for frame in trajectory.frames)<minimum:
            below.append(index);continue
        start=trajectory.start_frame;end=start+len(trajectory.frames)
        if not (start<task_end and task_start+(policy.context_24>>1)<=end):continue
        if len(retained)>=0x3c00:raise OverflowError('Native retained-tail capacity exceeded')
        trim=max(0,policy.context_24-start)
        if trim>len(trajectory.frames):
            raise ValueError('Native task context violates32dd40 tail invariant: retained group ends before rebase cut')
        new_start=start+trim-policy.context_24
        if not -32768<=new_start<=32767:raise OverflowError('Rebased native trajectory start exceeds signed-short range')
        frames=trajectory.frames[trim:]
        copied=bytearray(header)
        # The independent owner stores its immutable frame tuple, not a target pointer.
        copied[:8]=bytes(8)
        struct.pack_into('<Hh',copied,8,len(frames),new_start)
        retained.append(NativeTrajectory(bytes(copied),frames));indices.append(index)
    return NativeTailCapture(tuple(retained),tuple(indices),policy.context_24,tuple(below))


def complete_native_task(trajectories, *, policy, origin_frame, task_start,task_end,
                         emit_start,emit_stop,expected_output_frame,is_final_task=False):
    """Capture next-task copies, format only this task's unique global interval.

    origin_frame is a Python global song index; it may be negative for the
    first window's leading PCM context. Every0x28 header remains TASK-LOCAL.
    expected_output_frame is the owner's contiguous output frontier, starting0.
    A mismatch is explicit instead of dropping or duplicating overlapping audio.
    """
    if any(type(x) is not int for x in (origin_frame,task_start,task_end,emit_start,emit_stop,expected_output_frame)):
        raise ValueError('Actual integer task/global ownership coordinates required')
    first=origin_frame+emit_start;stop=origin_frame+emit_stop
    if first!=expected_output_frame or first<0 or stop<first:
        raise ValueError('Native task output is not contiguous with the owned whole-song frontier')
    values=tuple(trajectories)
    # Native dispatch captures its retained tail BEFORE3443e0 frees originals.
    retained=capture_native_task_tail(values,policy=policy,task_start=task_start,task_end=task_end)
    output_policy=NativeOutputPolicy(policy.rate_98a1ac,policy.context_24,policy.context_28,
        policy.flag_91,policy.flag_92,policy.mode_14,policy.channel_mode)
    output=emit_frame_records(values,emit_start,emit_stop,policy=output_policy)
    if is_final_task:retained=NativeTailCapture((),(),policy.context_24,retained.below_minimum_indices)
    drops=tuple((origin_frame+frame,index) for frame,index in output.output_capacity_drops)
    return NativeTaskHandoff(output.frames,first,stop,origin_frame+policy.context_24,
        retained,output.consumed_trajectory_indices,output.below_minimum_trajectory_indices,drops)
