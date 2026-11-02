"""34dd10/34df10 native noise-event merging and residual-label ownership.

Consumes real0x38 event objects and0xf8 residual rows. This module is the
source-derived post-growth producer, not a generic event proximity merger.
Source:remaining-34dd10.c,remaining-34df10.c; target SHA256
5f088fa4fbbe1759ef75d8034c79f33c846e3bf5f13d5048dd95a6614d2ad441.
Construction/source checks only; original-runtime/audio equivalence unknown.
"""
from dataclasses import dataclass
import math
import struct

from native_harmonic_fields import f32
from native_noise_events import NativeNoiseEvent,native_db_ratio
from native_residual_grid import NativeNoiseContext


@dataclass(frozen=True)
class NativeNoiseMergeResult:
    events:list
    retained_events:list
    next_identity:int
    merged_events:int
    stage:str='native-34df10/34dd10'


def _count(rate,seconds):return max(1,int(f32(f32(f32(rate)*f32(seconds))+f32(.5))))


def _energy(event,frame):
    total=0.
    for bucket in range(event.lower,event.upper+1):total=f32(total+event.sample(frame,bucket))
    return total


def merge_native_noise_event(events,destination,source,*,task_start_frame,retained_events=()):
    """34dd10 literal destination/source merge, including retained-ID writes."""
    if destination==source or not 0<=destination<len(events) or not 0<=source<len(events):
        raise ValueError('Distinct actual native event ordinals required')
    target,donor=events[destination],events[source]
    if not isinstance(target,NativeNoiseEvent) or not isinstance(donor,NativeNoiseEvent):
        raise TypeError('Actual native event owners required')
    if (target.columns,target.first_frame,target.last_frame)!=(donor.columns,donor.first_frame,donor.last_frame):
        raise ValueError('Native merged event energy allocations must share coordinates')
    if target.samples is None or donor.samples is None:
        raise ValueError('34dd10 requires both actual current-task energy allocations')
    if target.start<task_start_frame or task_start_frame<=donor.start:
        for previous in retained_events:
            if previous.identity==donor.identity:previous.identity=target.identity
    else:
        target.kind=donor.kind;target.identity=donor.identity
        #The source compares after adopting donor ID; preserve that ordering.
        for previous in retained_events:
            if previous.identity==target.identity:previous.identity=donor.identity
    target.lower=min(target.lower,donor.lower);target.upper=max(target.upper,donor.upper)
    target.start=min(target.start,donor.start);target.end=max(target.end,donor.end)
    for frame in range(max(donor.first_frame,donor.start),donor.end+1):
        for bucket in range(donor.lower,donor.upper+1):
            target.set_sample(frame,bucket,f32(donor.sample(frame,bucket)+target.sample(frame,bucket)))
    donor.samples=None
    del events[source]


def _merge_contained(events,retained,context,task_start):
    #Native bubble sort is stable on equal widths.
    events.sort(key=lambda event:event.upper-event.lower,reverse=True)
    maximum_duration=_count(context.analysis_rate,.5);merged=0;index=0
    while index<len(events)-1:
        anchor=events[index];begin,end=anchor.start,anchor.end
        margin=_count(context.analysis_rate,.1 if context.mode_14==0 else .05)
        if context.mode_14!=0:
            margin=max(1,min(margin,int(f32(f32(f32(end-begin+1)*f32(.5))+f32(.5)))))
        other=index+1
        while other<len(events):
            anchor=events[index];candidate=events[other]
            allowed=(task_start<=anchor.start or task_start<=candidate.start or candidate.kind==anchor.kind)
            if allowed and context.flag_92:
                left,right=anchor.lower*500.,candidate.lower*500.
                allowed=not ((left>=1500. and (right<1500. or(candidate.upper*500.<6500. and right<3000.)))
                    or(right>=1500. and (left<1500. or(anchor.upper*500.<6500. and left<3000.))))
                if allowed and anchor.kind==0 and candidate.kind==0:
                    allowed=max(anchor.end,candidate.end)-min(anchor.start,candidate.start)<=maximum_duration
            contained=begin-margin<=candidate.start and candidate.end<=end+margin
            if context.mode_14==0:
                frequency_match=anchor.lower-2<=candidate.upper and candidate.lower<=anchor.upper+1
                time_match=abs(anchor.end-candidate.end)<margin and abs(anchor.start-candidate.start)<margin
            else:
                frequency_match=anchor.lower-1<=candidate.lower and candidate.upper<=anchor.upper+1
                time_match=True
            if allowed and contained and frequency_match and time_match:
                anchor_energy=candidate_energy=0.
                for frame in range(max(candidate.first_frame,candidate.start),candidate.end+1):
                    for bucket in range(candidate.lower,candidate.upper+1):
                        anchor_energy=f32(anchor_energy+anchor.sample(frame,bucket))
                        candidate_energy=f32(candidate_energy+candidate.sample(frame,bucket))
                if anchor_energy==0. or candidate_energy<=f32(native_db_ratio(10)*anchor_energy):
                    merge_native_noise_event(events,index,other,task_start_frame=task_start,retained_events=retained)
                    merged+=1;other=index+1;continue
            other+=1
        index+=1
    return merged,maximum_duration


def _initial_labels(events,retained,context,task_start,maximum_duration):
    for event in events:
        if task_start<=event.start and event.kind==0:
            if not context.flag_92:
                if context.mode_14==0:event.kind=0x12
            elif event.lower*500.>=1500.:
                upper=event.upper*500.;minimum_width=3000. if upper<=9000. else 1500.
                if (event.upper-event.lower)*500.>=minimum_width and upper>=6500. and event.end-event.start<=maximum_duration:
                    event.kind=0x40
            for previous in retained:
                if previous.identity==event.identity:previous.kind=event.kind
        if event.kind==0x40 and event.lower<6:event.lower=6


def _merge_adjacent(events,retained,context,task_start):
    if context.mode_14==0:return 0
    merged=0;index=0
    while index<len(events)-1:
        other=0
        while other<len(events) and index<len(events):
            anchor,candidate=events[index],events[other]
            if (candidate.start==anchor.end+1 and candidate.kind==anchor.kind
                    and abs(candidate.lower-anchor.lower)<2 and abs(candidate.upper-anchor.upper)<2):
                merge_native_noise_event(events,index,other,task_start_frame=task_start,retained_events=retained)
                merged+=1;continue
            other+=1
        index+=1
    return merged


def _filter_reference_labels(events,context,task_start):
    if not context.flag_92:return
    duration=_count(context.analysis_rate,.3)
    for event in events:
        if event.start<task_start or event.kind!=0x40 or event.end-event.start+1<=duration:continue
        total=0.;begin=max(event.first_frame,event.start)
        for frame in range(begin,event.end+1):
            row=0.
            for bucket in range(max(event.lower,12),event.upper+1):row=f32(row+event.sample(frame,bucket))
            total=f32(total+row)
        denominator=event.end-begin+1
        if denominator<=0:raise ValueError('Native reference-event mean has no owned frames')
        if f32(total/f32(denominator))<500.:event.kind=0


class _NoiseRows:
    """Own the exact0xf8 side/group/id interpretation and explicit zero rows."""
    def __init__(self,records,context,zero_frames):
        self.records=records;self.context=context;self.zero_frames=frozenset(zero_frames)
        self.counts={frame:len(packed)//0xF8 for frame,packed in records.items()}
        self.frames={frame:(packed if isinstance(packed,bytearray) else bytearray(packed)) for frame,packed in records.items()}
        self.sides=tuple(max(0,channel-1) for channel in range(1 if context.channel_mode>2 else 0,context.channel_mode))

    def count(self,frame):
        if frame not in self.frames:raise ValueError('Native noise merge lacks a required owned residual frame')
        return self.counts[frame]

    def read(self,frame,index,offset):
        if not 0<=index<self.count(frame):
            if frame in self.zero_frames:return 0.
            raise ValueError('Native direct residual lookup lacks an explicitly zero-initialized inactive slot')
        return struct.unpack_from('<f',self.frames[frame],index*0xF8+offset)[0]

    def write(self,frame,index,offset,value):
        if not 0<=index<self.count(frame):raise ValueError('Native residual write exceeds active owned records')
        struct.pack_into('<f',self.frames[frame],index*0xF8+offset,f32(value))

    def frequency(self,frame,index):return self.read(frame,index,0)
    def mean(self,frame,index,group=0):
        offset=0x14+group*0x18;left=self.read(frame,index,offset)
        return left if self.context.channel_mode==1 else f32(f32(left+self.read(frame,index,offset+4))*.5)

    def tag(self,frame,index):
        if not 0<=index<self.count(frame):
            if frame in self.zero_frames:return 0
            raise ValueError('Native direct residual type lookup exceeds its owned records')
        return self.frames[frame][index*0xF8+0xD1]

    def identity(self,frame,index):
        if not 0<=index<self.count(frame):
            if frame in self.zero_frames:return 0
            raise ValueError('Native direct residual identity lookup exceeds its owned records')
        return struct.unpack_from('<I',self.frames[frame],index*0xF8+0xDC)[0]

    def label(self,frame,index,kind,identity):
        packed=self.frames[frame];packed[index*0xF8+0xD1]=kind
        struct.pack_into('<I',packed,index*0xF8+0xDC,identity&0xFFFFFFFF)

    def move(self,frame,index,*,maximum=None,kind,identity,overwrite=False):
        for side in self.sides:
            primary=0x14+side*4;group=0x2C+side*4
            amount=self.read(frame,index,primary)
            if maximum is not None:amount=min(amount,maximum)
            self.write(frame,index,group,amount if overwrite else f32(self.read(frame,index,group)+amount))
            self.write(frame,index,primary,f32(self.read(frame,index,primary)-amount))
            self.label(frame,index,kind,identity)

    def commit(self):
        for frame,packed in self.frames.items():
            if isinstance(self.records[frame],bytes):self.records[frame]=bytes(packed)


def _claim_event_frame(event,frame,found,kind,rows,group_width,onset_width,first_hit):
    for index in range(rows.count(frame)):
        if rows.frequency(frame,index)>500.:break
        if found<index:rows.move(frame,index,kind=kind,identity=event.identity,overwrite=True)
        if rows.tag(frame,index)==kind:rows.label(frame,index,kind,event.identity)
    if kind!=0x10 or frame>min(event.start,first_hit)+onset_width:return
    envelope=0.
    for bucket in range(event.lower,event.upper+1):
        if bucket*500.>750.:break
        envelope=max(envelope,event.sample(frame,bucket))
    for bucket in range(event.lower,event.upper+1):
        amount=event.sample(frame,bucket)
        if bucket*500.>750.:
            amount=min(amount,envelope);envelope=f32(native_db_ratio(-5)*amount)
        if amount<=0.:continue
        for index in range(bucket*group_width,min((bucket+1)*group_width,rows.count(frame))):
            if rows.frequency(frame,index)>500. and rows.mean(frame,index)>0.:
                rows.move(frame,index,maximum=amount,kind=event.kind,identity=event.identity)


def _extend_claimed_ids(event,kind,first_hit,last_hit,rows,task_start,task_end):
    begin,end=first_hit,last_hit
    for direction,initial in ((-1,first_hit-1),(1,last_hit+1)):
        frame=initial
        while task_start<=frame<=task_end:
            found=False
            for index in range(rows.count(frame)-1,-1,-1):
                if rows.tag(frame,index)==kind:
                    rows.label(frame,index,kind,event.identity);found=True
            if not found:break
            if direction<0:begin=frame
            else:end=frame
            frame+=direction
    return begin,end


def _spread_low_event(event,frame,rows):
    for side in rows.sides:
        strongest=0.;index=0
        while index<rows.count(frame):
            frequency=rows.frequency(frame,index)
            if frequency>500.:break
            if frequency>=350.:strongest=max(strongest,rows.read(frame,index,0x2C+side*4))
            index+=1
        if strongest<=0.:continue
        while index<rows.count(frame) and rows.frequency(frame,index)<=3000.:
            strongest=f32(native_db_ratio(-1)*strongest)
            if strongest<1.:break
            primary=0x14+side*4;group=0x2C+side*4
            amount=min(strongest,rows.read(frame,index,primary))
            rows.write(frame,index,group,f32(rows.read(frame,index,group)+amount))
            rows.write(frame,index,primary,f32(rows.read(frame,index,primary)-amount))
            rows.label(frame,index,0x10,event.identity);index+=1


def _assign_low_events(events,rows,context,task_start,task_end,group_width,frontier):
    onset_width=_count(context.analysis_rate,.05)
    for ordinal,event in enumerate(events):
        if event.kind!=0x12 or event.lower*500.>1000.:continue
        for kind in (0x11,0x10):
            first_hit=task_end+1;last_hit=task_start-1
            for frame in range(max(event.start,task_start),min(event.end,task_end)+1):
                found=None
                for index in range(rows.count(frame)-1,-1,-1):
                    if rows.frequency(frame,index)<=500. and rows.tag(frame,index)==kind and rows.identity(frame,index)==0:
                        found=index;break
                if found is None:continue
                own_energy=None;stronger=False
                for other in events[ordinal+1:]:
                    if other.start<=frame<=other.end and other.kind==0x12 and other.lower*500.<=1000.:
                        if own_energy is None:own_energy=_energy(event,frame)
                        if own_energy<_energy(other,frame):stronger=True;break
                if stronger:continue
                first_hit=min(first_hit,frame);last_hit=max(last_hit,frame);event.kind=kind
                _claim_event_frame(event,frame,found,kind,rows,group_width,onset_width,first_hit)
            if first_hit>task_end:continue
            if kind==0x10:last_hit=min(last_hit,min(event.start,first_hit)+onset_width)
            event.start=max(event.start,first_hit);event.end=min(event.end,max(last_hit,first_hit))
            begin,end=_extend_claimed_ids(event,kind,first_hit,last_hit,rows,task_start,task_end)
            identity=None
            if begin==task_start:
                for index in range(rows.count(task_start-1)-1,-1,-1):
                    previous=rows.identity(task_start-1,index)
                    if rows.tag(task_start-1,index)==kind and previous!=0:
                        if previous!=0xFFFFFFFF:identity=previous
                        break
            if identity is None:frontier=(frontier+1)&0xFFFFFFFF;identity=frontier
            old_identity=event.identity
            for frame in range(begin,end+1):
                if kind==0x10:_spread_low_event(event,frame,rows)
                for index in range(rows.count(frame)-1,-1,-1):
                    if rows.tag(frame,index)==kind and rows.identity(frame,index) in (old_identity,0):
                        rows.label(frame,index,kind,identity)
            event.identity=identity
            break
    return frontier


def _fill_low_band_continuations(rows,task_start,task_end):
    reference=rows.count(task_start)
    for index in range(reference):
        if rows.frequency(task_start,index)>500.:break
        for frame in range(task_start,task_end+1):
            previous_frame=frame-1;selected=index;strength=rows.mean(previous_frame,index,1)
            if index>0 and strength<rows.mean(previous_frame,index-1,1):
                selected=index-1;strength=rows.mean(previous_frame,selected,1)
            if index+1<rows.count(frame) and strength<rows.mean(previous_frame,index+1,1):
                selected=index+1;strength=rows.mean(previous_frame,selected,1)
            if strength<1.:
                continue
            current=rows.mean(frame,index)
            if current>=16.:
                if current>=1.:
                    rows.move(frame,index,kind=rows.tag(previous_frame,selected),identity=rows.identity(previous_frame,selected))


def _high_band_events(events,rows,context,columns,task_start,task_end,frontier):
    for frame in range(task_start-context.bias_989fe4,task_end+1):
        for index in range(rows.count(frame)):
            struct.pack_into('<I',rows.frames[frame],index*0xF8+0xD8,0)
    onset=peak_frame=None;previous=maximum=0.;minimum=_count(context.analysis_rate,.035)
    for frame in range(task_start-3,task_end+1):
        following=0.
        for index in range(rows.count(frame+1)):
            if rows.frequency(frame+1,index)>=3000.:following=f32(following+rows.mean(frame+1,index))
        if frame>=task_start:
            if onset is None and previous>=8192.:onset=frame
            if onset is not None:
                if peak_frame is None and following<=previous:peak_frame=frame
                maximum=max(maximum,previous)
            if (peak_frame is not None or(onset is not None and frame==task_end)) and (previous<following or following<4096. or frame==task_end):
                if maximum>=16384. and frame-onset+1>=minimum and len(events)<0x600 and frame-onset>1:
                    event=NativeNoiseEvent(columns=columns,first_frame=task_start-context.bias_989fe4,last_frame=task_end)
                    event.kind=0x12;event.upper=columns-1;frontier=(frontier+1)&0xFFFFFFFF;event.identity=frontier
                    event.end=frame;event.start=max(task_start,onset);event.peak=peak_frame if peak_frame is not None else frame
                    events.append(event)
                    for target in range(max(event.start,task_start),event.end+1):
                        for index in range(rows.count(target)):
                            rows.frames[target][index*0xF8+0xD0]=0x12
                            struct.pack_into('<I',rows.frames[target],index*0xF8+0xD8,event.identity)
                peak_frame=onset=None;maximum=0.
        previous=following
    return frontier


def merge_native_noise_events(events,records_by_frame,*,context,columns,group_width,
        task_start_frame,task_end_frame,retained_events=None,next_identity=0,
        zero_initialized_frames=()):
    """34df10 post-growth path; task_end_frame is the actual task+0x10 value.

    The native body reads through that value INCLUSIVELY; this is the same
    coordinate the whole-song owner calls its exclusive output frontier.
    It is not the separate347170 lookahead endpoint(end+bc-1).

    next_identity is the current native identity frontier(last issued ID),
    incremented before each new assignment. zero_initialized_frames is an
    explicit owner's proof that inactive slots in those allocated rows are
    zero; without that proof direct missing-bin reads fail rather than guess.
    Both current/retained lists and the supplied residual dictionary mutate.
    """
    if not isinstance(context,NativeNoiseContext):raise TypeError('Actual native noise context required')
    if not isinstance(events,list) or retained_events is not None and not isinstance(retained_events,list):
        raise TypeError('Owned current and retained event lists required')
    retained=[] if retained_events is None else retained_events
    if any(not isinstance(event,NativeNoiseEvent) for event in events+retained):raise TypeError('Actual native0x38 event owners required')
    if any(type(value) is not int for value in (columns,group_width,task_start_frame,task_end_frame,next_identity)) or not 0<columns<=0xFFFF or group_width<1 or task_start_frame>task_end_frame or not 0<=next_identity<=0xFFFFFFFF:
        raise ValueError('Actual native event/grid/task/counter geometry required')
    for event in events:
        if event.columns!=columns or event.samples is None or len(event.samples)!=(event.last_frame-event.first_frame+1)*columns or not 0<=event.lower<=event.upper<columns:
            raise ValueError('Native current event energy allocation does not match its grid')
        if event.start>event.end or event.end>event.last_frame:
            raise ValueError('Native event temporal bounds exceed its energy owner')
    merged,maximum=_merge_contained(events,retained,context,task_start_frame)
    _initial_labels(events,retained,context,task_start_frame,maximum)
    merged+=_merge_adjacent(events,retained,context,task_start_frame)
    _filter_reference_labels(events,context,task_start_frame)
    if context.mode_14==0:
        if not isinstance(records_by_frame,dict):raise TypeError('Actual native residual frame dictionary required')
        for packed in records_by_frame.values():
            if not isinstance(packed,(bytes,bytearray)) or len(packed)%0xF8 or len(packed)//0xF8>0x1D0:
                raise ValueError('Actual packed native0xf8 residual rows required')
            for offset in range(0,len(packed),0xF8):
                if any(not math.isfinite(struct.unpack_from('<f',packed,offset+field)[0]) for field in (0,0x14,0x18,0x2C,0x30)):
                    raise ValueError('Native residual frequency/side amplitudes must be finite')
        rows=_NoiseRows(records_by_frame,context,zero_initialized_frames)
        for frame in range(min(task_start_frame-context.bias_989fe4,task_start_frame-2),task_end_frame+2):rows.count(frame)
        next_identity=_assign_low_events(events,rows,context,task_start_frame,task_end_frame,group_width,next_identity)
        _fill_low_band_continuations(rows,task_start_frame,task_end_frame)
        #Native deletes provisional0x12 objects before appending high-band ones.
        events[:]=[event for event in events if event.kind!=0x12]
        next_identity=_high_band_events(events,rows,context,columns,task_start_frame,task_end_frame,next_identity)
        rows.commit()
    return NativeNoiseMergeResult(events,retained,next_identity,merged)
