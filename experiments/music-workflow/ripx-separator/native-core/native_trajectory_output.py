"""Recovered refinement-slot writes and3443e0 trajectory ->0x4c output.

The native candidate/340630 owner supplies actual trajectory identities and
flags. This module never invents group IDs or links peaks by generic proximity.
It contains the numeric33b560 slot write/threshold and complete finite3443e0
record-formatting loop; output can feed native_frame_groups directly.
"""
from dataclasses import dataclass
import math
import struct

from native_harmonic_fields import f32, output_component
from native_minimum_frames import minimum_valid_frames

TRAJECTORY_HEADER_BYTES = 0x28
TRAJECTORY_FRAME_BYTES = 0x5C
OUTPUT_RECORD_BYTES = 0x4C
MAX_COMPONENTS = 3
MAX_OUTPUTS_PER_FRAME = 0x3C00


@dataclass(frozen=True)
class NativeTrajectory:
    header: bytes
    frames: tuple[bytes, ...]

    def __post_init__(self):
        if len(self.header) != TRAJECTORY_HEADER_BYTES:
            raise ValueError('Native trajectory header must contain0x28 bytes')
        if any(len(frame) != TRAJECTORY_FRAME_BYTES for frame in self.frames):
            raise ValueError('Every native trajectory frame must contain0x5c bytes')
        count, = struct.unpack_from('<H', self.header,8)
        if count != len(self.frames):
            raise ValueError('Native header frame count disagrees with retained frames')

    @property
    def start_frame(self):
        return struct.unpack_from('<h',self.header,10)[0]


@dataclass(frozen=True)
class NativeOutputPolicy:
    rate_98a1ac: float
    context_24: int
    context_28: int
    flag_91: bool
    flag_92: bool
    mode_14: int
    channel_mode: int


@dataclass(frozen=True)
class NativeTrajectoryOutput:
    frames: tuple[bytes, ...]
    consumed_trajectory_indices: tuple[int, ...]
    below_minimum_trajectory_indices: tuple[int, ...]
    output_capacity_drops: tuple[tuple[int, int], ...]


def write_refined_component(frame, component_index, target_frequency, estimates, *, channel_mode):
    """319940 output scaling +33b560's actual slot storage and62 gate.

    The target frequency is319940's return value, distinct from31b830's
    window-start component seed. Estimates are actual31b830 results with raw
    linear amplitude. No missing channel estimate is guessed or interpolated.
    """
    if len(frame) != TRAJECTORY_FRAME_BYTES or type(component_index) is not int or not 0 <= component_index < MAX_COMPONENTS:
        raise ValueError('Native component slot or frame shape is invalid')
    if channel_mode not in (1,2,3):
        raise ValueError('Explicit supported native channel mode required')
    expected=1 if channel_mode < 3 else 2
    if len(estimates) != expected:
        raise ValueError('The native channel mode requires explicit per-channel estimates')
    frequency=f32(target_frequency)
    if not math.isfinite(frequency) or frequency < 0:
        raise ValueError('Finite nonnegative native target frequency required')
    phases=[]; strengths=[]
    for estimate in estimates:
        amplitude,phase=f32(estimate.amplitude),f32(estimate.phase_at_frame)
        if not math.isfinite(amplitude) or amplitude < 0 or not math.isfinite(phase):
            raise ValueError('Native refined amplitude/phase is invalid')
        #319940 rounds pow result before multiplying32767 in float32.
        strength=f32(f32(math.pow(float(amplitude)/32767.0,.6020599913))*32767.0) if amplitude > 0 else 0.0
        phases.append(phase);strengths.append(strength)
    if channel_mode < 3:
        phases.append(phases[0]);strengths.append(strengths[0])
    result=bytearray(frame)
    offset=component_index*0x18
    struct.pack_into('<fffff',result,offset,phases[0],phases[1],strengths[0],strengths[1],frequency)
    average=strengths[0] if channel_mode == 1 else f32(f32(strengths[0]+strengths[1])*.5)
    if average < 62.0:
        struct.pack_into('<ff',result,offset+8,0.0,0.0)
        result[0x48] |= 0x10
    else:
        result[0x4B]=component_index+1
    result[0x48+component_index] |= 1
    return bytes(result)


def emit_frame_records(trajectories, start_frame, stop_frame, *, policy):
    """3443e0 formatting/valid-frame filter, preserving original record order.

    A qualifying trajectory emits every retained frame in the requested
    interval, including gap-marked frames. Its minimum-count scan alone masks
    0x82. The original releases qualifying trajectory storage afterward; this
    immutable boundary reports consumed identities for the owning scheduler.
    """
    if not isinstance(policy,NativeOutputPolicy):
        raise TypeError('Explicit native output policy required')
    if type(start_frame) is not int or type(stop_frame) is not int or stop_frame < start_frame:
        raise ValueError('Ordered integer output frame range required')
    if policy.channel_mode not in (1,2,3):
        raise ValueError('Unsupported native channel mode')
    output=[bytearray() for _ in range(stop_frame-start_frame)]
    consumed=[];rejected=[];drops=[]
    for trajectory_index,trajectory in enumerate(trajectories):
        if not isinstance(trajectory,NativeTrajectory):
            raise TypeError('The output producer consumes actual native trajectories')
        header=trajectory.header
        if header[0x0C]&1 or not trajectory.frames:
            continue
        kind=header[0x24]
        frequency,=struct.unpack_from('<f',header,0x18)
        minimum=minimum_valid_frames(kind,frequency,policy.rate_98a1ac,
            policy.context_24,policy.context_28,flag_91=policy.flag_91,
            flag_92=policy.flag_92,mode_14=policy.mode_14)
        valid=0;qualified=False
        for frame in trajectory.frames:
            if not frame[0x48]&0x82:
                valid+=1
                if valid >= minimum:
                    qualified=True;break
        if not qualified:
            rejected.append(trajectory_index)
            continue
        for relative,frame in enumerate(trajectory.frames):
            absolute=trajectory.start_frame+relative
            if absolute < start_frame: continue
            if absolute >= stop_frame: break
            target=output[absolute-start_frame]
            if len(target)//OUTPUT_RECORD_BYTES >= MAX_OUTPUTS_PER_FRAME:
                drops.append((absolute,trajectory_index));continue
            count=frame[0x4B]
            if count > MAX_COMPONENTS:
                raise ValueError('Native frame exceeds three retained component slots')
            record=bytearray(OUTPUT_RECORD_BYTES)
            for component_index in range(count):
                phase_l,phase_r,left,right,frequency=struct.unpack_from('<fffff',frame,component_index*0x18)
                #3443e0's _fdtest branch zeroes nonfinite phase only.
                phase_l=phase_l if math.isfinite(phase_l) else 0.0
                phase_r=phase_r if math.isfinite(phase_r) else 0.0
                converted=output_component(frequency,phase_l,phase_r,left,right,policy.channel_mode)
                offset=component_index*0x10
                struct.pack_into('<fHHfh',record,offset,converted.frequency,
                    converted.phase_left_u16,converted.phase_right_u16,
                    converted.transformed_strength,converted.balance_i16)
            record[0x30]=count
            record[0x31]=0
            record[0x34:0x4C]=header[0x10:0x28]
            if kind == 1:
                record[0x3C:0x40]=frame[0x50:0x54]
            target.extend(record)
        consumed.append(trajectory_index)
    return NativeTrajectoryOutput(tuple(bytes(frame) for frame in output),tuple(consumed),tuple(rejected),tuple(drops))
