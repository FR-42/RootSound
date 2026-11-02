"""350e40 native event extraction, predecessor history and group classification.

This assembles the actual349600/34b460/34d770/34c5a0/34df10/350430 path.
The memory owners retain source fields and identities across task boundaries.
Only syntax/source inspection is authorized; no audio or target execution.
"""
from dataclasses import dataclass,replace
import math
import struct

from native_harmonic_fields import f32
from native_noise_events import NativeNoiseEvent
from native_noise_growth import histogram_value,grow_native_noise_event
from native_noise_preprocess import preprocess_native_noise_frames
from native_noise_segments import native_noise_histograms
from native_noise_distribution import distribute_native_noise_events
from native_residual_grid import NativeResidualGrid


@dataclass(frozen=True)
class NativeNoiseClassificationResult:
    grid:NativeResidualGrid
    events:tuple
    retained_events:tuple
    last_event_identity:int
    histogram_columns:int
    group_width:int
    reconstruction_policies:tuple=()
    stage:str='native-350e40/349600/34b460/34d770/34c5a0/34df10/350430'


def _restore_and_grow_34d770(table,previous,*,context,first_frame,last_frame,task_end_frame,last_event_identity):
    from native_noise_event_shape import refine_native_noise_event
    previous=[event.clone() for event in previous]
    if any(not isinstance(event,NativeNoiseEvent) or event.columns!=table.columns for event in previous):
        raise ValueError('Native retained event grid identity/column count mismatch')
    events=[];frontier=last_event_identity
    while len(events)<0x600:
        event=NativeNoiseEvent(columns=table.columns,first_frame=first_frame,last_frame=last_frame,
            baseline=[0.0]*table.columns)
        minimum=1500.0 if context.flag_92 else 500.0
        for bucket in range(table.columns):
            if bucket*500.0<minimum:continue
            frame=first_frame
            while frame<=last_frame:
                if histogram_value(table,frame,bucket)>8.0:
                    baseline=[histogram_value(table,frame-1,col) for col in range(table.columns)] if first_frame-context.bias_989fe4<frame else [8.0]*table.columns
                    stop=grow_native_noise_event(table,baseline,bucket,frame,1,context=context,event=event,
                        first_frame=first_frame,last_frame=last_frame,skip_jumps=False)
                    if frame<=stop:frame=stop
                frame+=1
        retained=None
        for candidate in previous:
            if candidate.score>0 and (retained is None or retained.score<candidate.score):retained=candidate
        if retained is not None and event.score<retained.score:
            if retained.tail_baseline is None or len(retained.tail_baseline)!=table.columns:
                raise ValueError('Native retained event lacks actual34c5a0 tail baseline')
            event=retained.clone();event.baseline=list(retained.tail_baseline);event.tail_baseline=None
            event.samples=None;event.columns=table.columns;event.first_frame=first_frame;event.last_frame=last_frame
            event.end=min((first_frame-1)&0xffff,event.end)
        else:retained=None
        if event.score==0.0:break
        event.samples=[0.0]*(table.columns*(last_frame-first_frame+1))
        refine_native_noise_event(event,table,previous,context=context,first_frame=first_frame,last_frame=last_frame,
            task_start_frame=first_frame,task_end_frame=task_end_frame)
        if event.identity==0:
            frontier=(frontier+1)&0xffffffff;event.identity=frontier
        elif retained is not None:retained.clear()
        event.baseline=None
        if event.start<task_end_frame and first_frame<=event.end:events.append(event)
    return events,frontier


def _retained_event_history(events,*,context,task_end_frame):
    """350e40's exact cut-over selection and ctx24-relative event metadata."""
    retained=[]
    for event in events:
        if task_end_frame-1<event.start or event.end<task_end_frame:continue
        saved=event.clone(include_samples=False,include_baseline=False)
        if event.peak>=task_end_frame:saved.score=0.0
        saved.start=max(0,event.start-context.context_24)
        saved.end=max(0,event.end-context.context_24)
        saved.peak=max(0,event.peak-context.context_24)
        saved.samples=None;saved.baseline=None
        saved.first_frame=event.first_frame-context.context_24;saved.last_frame=event.last_frame-context.context_24
        retained.append(saved)
    if len(retained)>65535:raise ValueError('Native retained event count exceeds ushort')
    return retained


def classify_native_noise_grid(grid,*,context,task_start_frame,task_end_frame,
                               previous_events=(),last_event_identity=0,mode=0,
                               zero_initialized_frames=()):
    """Actual350e40; task_end_frame is thetask'sEXCLUSIVE output end.

    The produced grid's next_frame supplies350e40's inclusive analysis end,
    including actual ctxBC lookahead or the native duration-limited endpoint.
    Native kind bytes are retained; naming an event a drum is a later policy.
    """
    if not isinstance(grid,NativeResidualGrid) or not grid.history_active:
        raise ValueError('350e40 requires theactual active347170 history path')
    if type(last_event_identity) is not int or not 0<=last_event_identity<=0xffffffff or mode not in (0,1):
        raise ValueError('Actual uint32 native event counter and mode required')
    last=grid.next_frame-1
    #One mutable owner spans350e40's ordered phases; freeze only at the
    #returned record boundary instead of recopying every row per helper.
    records={frame:bytearray(packed) for frame,packed in grid.records_by_frame.items()}
    if context.mode_14==0:
        preprocess_native_noise_frames(records,context=context,task_start_frame=task_start_frame,
            task_end_frame=task_end_frame,first_frame=task_start_frame-context.bias_989fe4,last_frame=last)
    width=int(f32(f32(500.0)/f32(context.bandwidth_989fe0))+.5)&0xffff
    if width<1:raise ValueError('Native500Hz histogram group width became zero')
    histogram=native_noise_histograms(records,task_start_frame=task_start_frame,task_end_frame=last,
        bias_989fe4=context.bias_989fe4,channel_mode=context.channel_mode,group_width=width,radius=3)
    histogram=replace(histogram,packed=bytearray(histogram.packed))
    events,frontier=_restore_and_grow_34d770(histogram,previous_events,context=context,
        first_frame=task_start_frame,last_frame=last,task_end_frame=task_end_frame,last_event_identity=last_event_identity)
    retained=_retained_event_history(events,context=context,task_end_frame=task_end_frame)
    from native_noise_event_merge import merge_native_noise_events
    merged=merge_native_noise_events(events,records,context=context,columns=histogram.columns,group_width=width,
        task_start_frame=task_start_frame,task_end_frame=task_end_frame,retained_events=retained,next_identity=frontier,
        zero_initialized_frames=zero_initialized_frames)
    events=merged.events;retained=merged.retained_events;frontier=merged.next_identity
    distribute_native_noise_events(events,records,context=context,columns=histogram.columns,group_width=width,
        task_start_frame=task_start_frame,task_end_frame=task_end_frame,analysis_last_frame=last,cleanup=not mode)
    #350e40 releases the current event energy allocation afterdistribution.
    #Retained snapshots own their separately copied tail baselines.
    for event in events:event.samples=None;event.baseline=None;event.tail_baseline=None
    sides=tuple(max(0,index-1) for index in range(1 if context.channel_mode>=3 else 0,context.channel_mode))
    for frame in range(task_start_frame,last+1):
        if frame not in records:raise ValueError('Native classified grid lacks produced frame')
        packed=records[frame]
        for side in sides:
            for offset in range(0,len(packed),0xf8):
                for group in range(8):
                    at=offset+0x14+group*0x18+side*4;value=struct.unpack_from('<f',packed,at)[0]
                    strength=f32(f32(math.pow(float(value)/32767.0,.6020599913))*32767.0) if value>0 else 0.0
                    struct.pack_into('<f',packed,at,strength)
        records[frame]=bytes(packed)
    records={frame:bytes(packed) for frame,packed in records.items()}
    classified=replace(grid,records_by_frame=records)
    policies=('Reconstruction initializes its own inactive0xf8 allocation slots to zero; original malloc padding is unknown.',) if zero_initialized_frames else ()
    return NativeNoiseClassificationResult(classified,tuple(events),tuple(retained),frontier,histogram.columns,width,policies)
