"""347a90 assembled native residual/nonharmonic task and preserved cache.

The caller selects the actual native context/profile. Combining a harmonic
pass from one profile with a residual pass from another is reconstruction
scheduling, not a recovered claim about RipX's original preset orchestration.
No target execution, media file read, public model or numerical test occurs.
"""
from dataclasses import dataclass

from native_background import NativeBackgroundCache
from native_residual_grid import NativeNoiseContext,subtract_native_harmonics,produce_native_residual_grid
from native_noise_history import (NativeNoiseTaskKey,restore_native_noise_tail,
    retain_native_noise_tail)
from native_noise_classification import classify_native_noise_grid
from native_noise_tracking import track_native_noise

OWNED_INACTIVE_ZERO_POLICY='reconstruction-owned-inactive-zero'


@dataclass(frozen=True)
class NativeNoiseTaskResult:
    trajectories:tuple
    next_group_id:int
    next_event_identity:int
    tail_cache:object
    background_cache:NativeBackgroundCache
    stats:dict


def run_native_noise_task(trajectories,band_buffers,grids,*,context,
                          task_start_frame,task_end_frame,next_group_id,
                          task_key,previous_cache=None,next_event_identity=0,
                          task_output_frame=None,zero_initialized_frames=()):
    """Complete347a90:subtract->restore->grid->classify->save->track->split.

    task_end_frame is EXCLUSIVE. next_event_identity means the current native
    98a148 frontier(last issued), which increments before an event assignment.
    Set zero_initialized_frames to OWNED_INACTIVE_ZERO_POLICY to explicitly
    zero this reconstruction's inactive pool slots. The original executable
    allocates that pool without clearing it, so its inactive bytes are unknown.
    A supplied iterable instead asserts only those actual frame allocations.
    """
    if not isinstance(context,NativeNoiseContext) or not isinstance(task_key,NativeNoiseTaskKey):
        raise TypeError('Actual native noise context and task cache key required')
    if type(next_event_identity) is not int or not 0<=next_event_identity<=0xffffffff:
        raise ValueError('Actual uint32 native event identity frontier required')
    restored=restore_native_noise_tail(task_key,previous_cache,
        task_start_frame=task_start_frame,bias_989fe4=context.bias_989fe4)
    residual=subtract_native_harmonics(trajectories,band_buffers,context=context,
        task_start_frame=task_start_frame,task_end_frame=task_end_frame)
    grid=produce_native_residual_grid(residual,grids,task_start_frame=task_start_frame,
        task_end_frame=task_end_frame,from_frame=restored.from_frame,
        task_output_frame=task_output_frame,mode=0,retained_records=restored.records_by_frame)
    policies=();events=();retained_events=();frontier=next_event_identity
    columns=group_width=0
    if grid.history_active:
        if zero_initialized_frames==OWNED_INACTIVE_ZERO_POLICY:
            #This allocation policy is explicit and local to the new owner.
            #It supplies inactive-slot facts, never fills absent active input.
            zero_frames=frozenset(grid.records_by_frame)
        elif isinstance(zero_initialized_frames,str):
            raise ValueError('Unknown native reconstruction allocation policy')
        else:zero_frames=frozenset(zero_initialized_frames)
        classified=classify_native_noise_grid(grid,context=context,
            task_start_frame=task_start_frame,task_end_frame=task_end_frame,
            previous_events=restored.event_history,last_event_identity=frontier,
            mode=0,zero_initialized_frames=zero_frames)
        grid=classified.grid;events=classified.events;retained_events=classified.retained_events
        frontier=classified.last_event_identity;policies=classified.reconstruction_policies
        columns=classified.histogram_columns;group_width=classified.group_width
    #32e4b0 happens before347a90 clears outside counts and31d960 consumes IDs.
    tail=retain_native_noise_tail(task_key,grid.records_by_frame,
        task_end_frame=task_end_frame,bias_989fe4=context.bias_989fe4,event_history=retained_events)
    records=dict(grid.records_by_frame)
    for frame in range(task_start_frame-context.bias_989fe4,task_end_frame+context.context_bc):
        if frame<task_start_frame or task_end_frame<=frame:records[frame]=b''
    tracked=track_native_noise(trajectories,records,grids,context=context,
        task_start_frame=task_start_frame,task_end_frame=task_end_frame,next_group_id=next_group_id)
    records.update(tracked.consumed_records_by_frame)
    background=NativeBackgroundCache(first_frame=task_start_frame,task_end_frame=task_end_frame,
        context_bc=context.context_bc,context_24=context.context_24,bias_989fe4=context.bias_989fe4,
        flag_92=context.flag_92,channel_mode=context.channel_mode,bandwidth_989fe0=context.bandwidth_989fe0,
        records_by_frame=records,minimum_frequency=context.minimum_frequency)
    stats={'stage':'native-347a90','mode_14':context.mode_14,
        'harmonic_subtractions':residual.harmonic_subtractions,'fixed_frequency_fits':grid.fixed_frequency_fits,
        'maximum_grid_count':grid.maximum_grid_count,'history_classification_active':grid.history_active,
        'classified_events':len(events),'retained_events':len(retained_events),
        'histogram_columns':columns,'histogram_group_width':group_width,
        'created_nonharmonic_groups':tracked.created_groups,'split_nonharmonic_groups':tracked.split_groups,
        'capacity_drops':tracked.capacity_drops,'reconstruction_policies':policies,
        'verification':'AST/source inspection only; original runtime/audio equivalence unverified'}
    return NativeNoiseTaskResult(tracked.trajectories,tracked.next_group_id,frontier,tail,background,stats)
