"""31d960 actual nonharmonic trajectory ownership and31cf80 event splitting.

Consumes334d50's classified0x3c18 records and preserves both trajectory group
identity(header10) and350e40 event identity(header14). There is no generic
onset detector, pitch association or instrument inference at this boundary.
Source:remaining-31d960.c,remaining-31cf80.c and direct disassemblies. The
decompiler's final frame stores in31d960 were corrected against14031e46a.
"""
from dataclasses import dataclass
import struct

from native_harmonic_fields import f32
from native_trajectory_output import NativeTrajectory
from native_noise_candidates import native_noise_candidates
from native_residual_grid import NativeNoiseContext


def _f(data,offset):return struct.unpack_from('<f',data,offset)[0]
def _put(data,offset,value):struct.pack_into('<f',data,offset,f32(value))
def _u(data,offset):return struct.unpack_from('<I',data,offset)[0]
def _transient(kind):return 0x10<=kind<=0x12 or kind==0x40


class _NoiseTrajectory:
    def __init__(self,item):
        if not isinstance(item,NativeTrajectory):raise TypeError('Actual native trajectory required')
        self.header=bytearray(item.header);self.frames=[bytearray(frame) for frame in item.frames]
    @property
    def start(self):return struct.unpack_from('<h',self.header,10)[0]
    @property
    def group(self):return _u(self.header,0x10)
    @property
    def event(self):return _u(self.header,0x14)
    @property
    def kind(self):return self.header[0x24]
    @property
    def rank(self):return self.header[0x25]
    @property
    def active(self):return not self.header[0xc]&1
    def freeze(self):
        if len(self.frames)>65535:raise ValueError('Native ushort trajectory frame capacity exceeded')
        struct.pack_into('<H',self.header,8,len(self.frames))
        return NativeTrajectory(bytes(self.header),tuple(map(bytes,self.frames)))


@dataclass(frozen=True)
class NativeNoiseTrackingResult:
    trajectories:tuple
    next_group_id:int
    consumed_records_by_frame:dict
    candidate_counts_by_frame:dict
    created_groups:int
    split_groups:int
    capacity_drops:tuple
    stage:str='native-334d50/31d960/31cd90/31cf80'


def _strength(frame,mode):return _f(frame,8) if mode==1 else f32(float(f32(_f(frame,8)+_f(frame,12)))*.5)


def _indices(objects,frame_limit):
    """31cd90 param3=1:nonharmonics only, original table order, no sort."""
    result={}
    for absolute in range(frame_limit):
        refs=[]
        for identity,obj in enumerate(objects):
            if obj.active and obj.kind!=1 and obj.start<=absolute<obj.start+len(obj.frames):
                refs.append((identity,absolute-obj.start))
                if len(refs)==0x1500:break
        result[absolute]=refs
    return result


def _free_slots(objects,number):
    slots=[index for index,obj in enumerate(objects) if not obj.active][:number]
    for index in range(len(objects),min(0x3c00,len(objects)+number-len(slots))):slots.append(index)
    return slots


def _split_31cf80(objects,context,first,end,next_group_id,drops):
    """Source group-strength rise/fall rule and actual48-slot split ownership."""
    for obj in objects:
        if obj.active and obj.kind!=1:
            for frame in obj.frames:frame[0x48]&=0xfe
    indices=_indices(objects,end);splits=0
    margin=max(1,int(f32(f32(f32(context.analysis_rate)*f32(.05))+.5)))
    for absolute in range(first,end):
        refs=indices[absolute];position=0
        while position<len(refs):
            identity,relative=refs[position];obj=objects[identity];frame=obj.frames[relative]
            if frame[0x48]&1 or _transient(obj.kind):position+=1;continue
            members=[ref for ref in refs[position:] if objects[ref[0]].group==obj.group]
            summed=0.0
            for member_id,member_relative in members:summed=f32(summed+_strength(objects[member_id].frames[member_relative],context.channel_mode))
            for member_id,member_relative in members:
                target=objects[member_id].frames[member_relative];_put(target,0x54,summed);target[0x48]|=1
            if margin<relative<=len(obj.frames)-margin:
                previous=obj.frames[relative-1];old=_f(previous,0x54) if previous[0x48]&1 else 0.0
                raised=max(384.0,f32(old*f32(2.3713737)))
                if raised<summed or (old>256.0 and summed<f32(old*f32(.707107))):
                    slots=_free_slots(objects,48)
                    if len(slots)<48:drops.append((absolute,'31cf80-48-trajectory-capacity'));position+=1;continue
                    new_group=next_group_id;next_group_id=(next_group_id+1)&0xffffffff;mapping={};stop=absolute
                    #The original traverses the contiguous group run in its
                    #existing index, with one new trajectory slot per rank.
                    copy_members=[]
                    for member_id,member_relative in refs[position:]:
                        source=objects[member_id]
                        if not source.active:continue
                        if source.group!=obj.group:break
                        copy_members.append((member_id,member_relative))
                    for member_id,member_relative in copy_members:
                        source=objects[member_id]
                        if not source.active:continue
                        if not 1<=source.rank<=48:raise ValueError('Native split rank exceeds48-slot table')
                        slot=slots[source.rank-1];header=bytearray(source.header)
                        struct.pack_into('<h',header,10,absolute);struct.pack_into('<I',header,0x10,new_group)
                        retained=tuple(bytes(value) for value in source.frames[member_relative:])
                        struct.pack_into('<H',header,8,len(retained))
                        replacement=_NoiseTrajectory(NativeTrajectory(bytes(header),retained))
                        source.frames=source.frames[:member_relative]
                        while len(objects)<slot:
                            empty=bytearray(0x28);empty[0xc]=1;objects.append(_NoiseTrajectory(NativeTrajectory(bytes(empty),())))
                        if slot==len(objects):objects.append(replacement)
                        else:objects[slot]=replacement
                        mapping[source.rank]=slot;stop=max(stop,absolute+len(retained))
                    for later in range(absolute,min(stop,end)):
                        updated=list(indices[later]);seen=False
                        for at,(old_id,old_relative) in enumerate(indices[later]):
                            old_obj=objects[old_id]
                            if not old_obj.active:continue
                            replacement=mapping.get(old_obj.rank) if old_obj.group==obj.group else None
                            if replacement is not None:
                                updated[at]=(replacement,later-objects[replacement].start);seen=True
                            elif seen:break
                        indices[later]=updated
                    refs=indices[absolute];splits+=1
            position+=1
    return next_group_id,splits


def track_native_noise(trajectories,records_by_frame,grids,*,context,
                       task_start_frame,task_end_frame,next_group_id):
    """31d960:all eight actual group slots, continuity, gap fills and cleanup.

    Input trajectories include the retained harmonic and nonharmonic objects
    owned by the task. Input records must already be347170-produced and, when
    history_active,350e40-classified. Event IDs are never synthesized here.
    """
    if not isinstance(context,NativeNoiseContext):raise TypeError('Native noise context required')
    if any(type(x) is not int for x in (task_start_frame,task_end_frame,next_group_id)) or not 0<=task_start_frame<=task_end_frame or not 0<=next_group_id<=0xffffffff:
        raise ValueError('Actual ordered task bounds and uint32 native group counter required')
    objects=[_NoiseTrajectory(item) for item in trajectories]
    consumed={};counts={};created=0;drops=[]
    full_capacity=context.context_24+context.context_28+context.context_bc
    if full_capacity>65535:raise ValueError('Native trajectory capacity exceeds ushort')
    for absolute in range(task_start_frame,task_end_frame):
        if absolute not in records_by_frame:raise ValueError('Native residual grid lacks required analysis frame')
        packed=records_by_frame[absolute];frame_counts=[]
        for selector in range(8):
            result=native_noise_candidates(packed,grids,selector=selector,channel_mode=context.channel_mode,mode_14=context.mode_14,flag_92=context.flag_92)
            packed=result.consumed_records;frame_counts.append(len(result.candidates))
            if result.capacity_reached:drops.append((absolute,'334d50-96-candidate-capacity'))
            for candidate in result.candidates:
                kind=candidate[0xc];strongest=0;weight=0.0;frequency=0.0;maximum=0.0
                for rank in range(1,49):
                    base=(rank-1)*0x13c;strength=_f(candidate,0x1a4+base);observed=_f(candidate,0xd8+base)
                    if observed!=0.0 and weight<strength:strongest=rank;weight=strength;frequency=observed
                    maximum=max(maximum,strength)
                if strongest==0 or maximum<1.0:continue
                gap_limit=0 if _transient(kind) else task_end_frame-task_start_frame
                best=None;best_gap=gap_limit+1;event=_u(candidate,0x10)
                if absolute>task_start_frame or _transient(kind):
                    for identity,obj in enumerate(objects):
                        if not obj.active or obj.kind!=kind or obj.rank!=strongest:continue
                        if kind==0x12 and obj.event!=event and obj.start+len(obj.frames)==absolute and abs(f32(_f(obj.header,0x18)-_f(candidate,0)))<1000.0:
                            old_event=obj.event
                            for other in objects:
                                if other.active and other.event==old_event:struct.pack_into('<I',other.header,0x14,event)
                        if obj.event!=event or obj.start>=absolute:continue
                        elapsed=absolute-obj.start;at=min(elapsed,len(obj.frames));gap=max(0,elapsed-len(obj.frames))
                        if at<1 or gap>gap_limit or _f(obj.frames[at-1],0x10)!=frequency or gap>=best_gap:continue
                        best=identity;best_gap=gap
                        if gap==0:break
                if best is None:
                    slots=_free_slots(objects,48)
                    if len(slots)<48:drops.append((absolute,'31d960-48-trajectory-capacity'));continue
                    group=next_group_id;next_group_id=(next_group_id+1)&0xffffffff;created+=1
                    members={}
                    for rank,slot in enumerate(slots,1):
                        header=bytearray(0x28);struct.pack_into('<h',header,10,absolute)
                        header[0x18:0x1c]=candidate[:4];header[0x24]=kind;header[0x25]=rank
                        struct.pack_into('<II',header,0x10,group,event)
                        new=_NoiseTrajectory(NativeTrajectory(bytes(header),()))
                        if slot==len(objects):objects.append(new)
                        else:objects[slot]=new
                        members[rank]=new
                else:
                    group=objects[best].group;members={obj.rank:obj for obj in objects if obj.active and obj.group==group}
                for rank in range(1,49):
                    obj=members.get(rank)
                    if obj is None:continue
                    target=absolute-obj.start;old_count=len(obj.frames);delta=(rank-1)*0x13c
                    if target<old_count:continue
                    if target>=full_capacity:drops.append((absolute,'346420-full-frame-capacity'));continue
                    previous=next((_f(old,0x10) for old in reversed(obj.frames) if _f(old,0x10)!=0.0),0.0)
                    obj.frames.extend(bytearray(0x5c) for _ in range(target+1-old_count))
                    for relative in range(target,old_count-1,-1):
                        frame=bytearray(0x5c);frame[0x50:0x54]=candidate[:4]
                        if _f(candidate,0xd8+delta)==0.0:
                            _put(frame,0x10,previous)
                        else:
                            frame[:0x18]=candidate[0x1fc+delta:0x214+delta]
                            if relative!=target:frame[8:16]=bytes(8)
                            frame[0x4b]=1
                        frame[0x48]=0;frame[0x4c:0x4e]=candidate[0x1c8+delta:0x1ca+delta]
                        #Backward writes fill owned indices; commit in order.
                        obj.frames[relative]=frame
        consumed[absolute]=packed;counts[absolute]=tuple(frame_counts)
        #Allocation-pool migration of closed <=32-frame objects changes no
        #record facts. Immutable Python ownership retains exactly those bytes.
        for obj in objects:
            if obj.active and obj.kind!=1 and not obj.frames and obj.start+(0 if _transient(obj.kind) else task_end_frame-task_start_frame)<absolute-1:
                obj.header[0xc]|=1
    next_group_id,splits=_split_31cf80(objects,context,task_start_frame,task_end_frame,next_group_id,drops)
    return NativeNoiseTrackingResult(tuple(obj.freeze() for obj in objects),next_group_id,consumed,counts,created,splits,tuple(drops))
