"""Native33c5c0 scheduler,33b560/319940 estimation, and339d20 cleanup.

Inputs are340630-owned0x28/0x5c trajectories and31bde0-owned native band
buffers. This module does not link peaks, infer track identity, or invoke a
public separation/pitch algorithm. It implements the ordinary native queue
call (fixed component,33bfd0 param11=1); the interactive reordering variant
is a different caller and is deliberately not substituted here.

Source:analysis-post-harmonics.c,analysis-note-finalize.c,trajectory-post-a
through-d.c,harmonic-refine.c,whole-3397c0/338ec0/3387f0/339d20.c.
Only static syntax inspection has been performed; no original audio/runtime
equivalence or performance measurement is claimed.
"""
from dataclasses import dataclass
import math
import struct

from native_harmonic_fields import f32, prepare_trajectory
from native_pcm_estimate import estimate_prepared_trajectory_component
from native_frequency_search import search_native_frequency, native_frequency_blend_table, native_frequency_blend_length
from native_peak_windows import native_frequency_record_index
from native_trajectory_output import NativeTrajectory, write_refined_component


def _f(data,offset):return struct.unpack_from('<f',data,offset)[0]
def _put(data,offset,value):struct.pack_into('<f',data,offset,f32(value))
def _active(header):return not header[0xC]&1 and header[0x24]==1
def _strength(frame,component,mode):
    base=component*0x18+8
    return _f(frame,base) if mode==1 else f32(f32(_f(frame,base)+_f(frame,base+4))*.5)


@dataclass(frozen=True)
class NativeRefinementContext:
    sample_rate: int
    hop: int
    analysis_rate: float
    context_24: int
    context_28: int
    context_b8: int
    context_bc: int
    component_limit: int
    channel_mode: int
    minimum_hz: float
    maximum_hz: float
    flag_91: bool=False
    flag_92: bool=False
    flag_95: bool=False

    def __post_init__(self):
        if any(type(x) is not int for x in (self.sample_rate,self.hop,self.context_24,self.context_28,self.context_b8,self.context_bc,self.component_limit,self.channel_mode)):
            raise ValueError('Actual native clock/context integers required')
        if self.sample_rate<=0 or self.hop<=0 or self.hop&(self.hop-1) or min(self.context_24,self.context_28,self.context_b8,self.context_bc)<0:
            raise ValueError('Invalid native task geometry')
        if not 1<=self.component_limit<=3 or self.channel_mode not in (1,2,3):
            raise ValueError('Native0x5c records contain at most three components')
        if not all(math.isfinite(x) for x in (self.analysis_rate,self.minimum_hz,self.maximum_hz)) or self.analysis_rate<=0 or not 0<self.minimum_hz<=self.maximum_hz:
            raise ValueError('Explicit finite native frequency/threshold values required')

    @property
    def frame_limit(self):return self.context_24+self.context_28*2


@dataclass(frozen=True)
class NativeRefinementResult:
    trajectories: tuple[NativeTrajectory,...]
    queue_entries: int
    components_processed: int
    frequency_searches: int
    residual_subtractions: int
    stage: str='native-33c5c0/33b560/319940/339d20'


class _MutableTrajectory:
    def __init__(self,source):
        if not isinstance(source,NativeTrajectory):raise TypeError('Actual340630-owned NativeTrajectory required')
        self.header=bytearray(source.header);self.frames=[bytearray(frame) for frame in source.frames]
        self.start=source.start_frame
    def freeze(self):
        struct.pack_into('<H',self.header,8,len(self.frames))
        return NativeTrajectory(bytes(self.header),tuple(map(bytes,self.frames)))


def _smooth_3397c0(trajectories,context):
    """Callsite asm confirms arg4=1:frequency and base-amplitude smoothing."""
    rate=f32(context.analysis_rate)
    for trajectory in trajectories:
        if not _active(trajectory.header):continue
        frames=trajectory.frames;count=len(frames);frequencies={};amplitudes={}
        total_weight=total_frequency=0.0
        for index,frame in enumerate(frames):
            if frame[0x48]&0x40:continue
            factor=f32(.025 if _f(frame,0x50)>=100.0 else .035)
            radius=min(index,max(1,int(float(f32(factor*rate))+.5)))
            if count-1<radius+index:radius=index+1+(radius*2-count)
            begin=max(0,index-radius);end=min(count-1,index+radius)
            weight_sum=frequency_sum=0.0
            for neighbor in range(begin,end+1):
                weight=f32(1.0-f32(f32(abs(neighbor-index))/f32(radius+1)))
                weight_sum=f32(weight_sum+weight)
                frequency_sum=f32(frequency_sum+f32(weight*_f(frames[neighbor],0x50)))
            average=f32(frequency_sum/weight_sum) if weight_sum else frequency_sum
            frequencies[index]=average
            total_weight=f32(total_weight+weight_sum)
            total_frequency=f32(total_frequency+f32(weight_sum*average))
            radius=max(1,int(float(rate)*.7+.5)) if context.flag_95 else 1
            summed=denominator=0.0
            for neighbor in range(max(0,index-radius),min(count-1,index+radius)+1):
                denominator=f32(denominator+1.0)
                summed=f32(summed+_strength(frames[neighbor],0,context.channel_mode))
            amplitudes[index]=f32(summed/denominator) if denominator else summed
        average=f32(total_frequency/total_weight) if total_weight else total_frequency
        if average<=60.0:continue
        for index in frequencies:
            frame=frames[index];_put(frame,0x50,frequencies[index]);_put(frame,8,amplitudes[index]);_put(frame,12,amplitudes[index])
            for component in range(context.component_limit):
                offset=component*0x18;frame[offset:offset+8]=bytes(8)
                if component:frame[offset+8:offset+16]=bytes(8)


def _stretch_338ec0(trajectories,context,task_start):
    """Group-owned numerator/denominator aggregate and harmonic stretch."""
    for index,trajectory in enumerate(trajectories):
        header=trajectory.header
        if not _active(header) or not _f(header,0x1C)>=0 or trajectory.start<task_start:continue
        group=struct.unpack_from('<I',header,0x10)[0];numerator=denominator=0.0
        members=[]
        for other in trajectories[index:]:
            if not other.header[0xC]&1 and other.start>=task_start and struct.unpack_from('<I',other.header,0x10)[0]==group:
                numerator+=float(_f(other.header,0x1C));denominator+=float(_f(other.header,0x20));members.append(other)
        ratio=numerator/denominator if denominator else numerator
        #338ec0 direct asm1403390da passes this header's frequency+18.
        #36c270 performs both divisions separately; cancellation would lose
        #the original float32 rounding. Zero yields native NaN/no clamp.
        scaled=f32(_f(header,0x18)*24.0)
        denominator32=f32(scaled*575.0)
        threshold=f32(f32(scaled/4433.19140625)/denominator32) if denominator32 else math.nan
        if ratio<float(threshold):ratio=0.0
        for other in members:_put(other.header,0x1C,-1.0);_put(other.header,0x20,ratio)
    for trajectory in trajectories:
        if not _active(trajectory.header):continue
        if trajectory.start>=task_start:trajectory.header[0x1C:0x20]=trajectory.header[0x20:0x24]
        rank=f32(trajectory.header[0x25]);stretch=_f(trajectory.header,0x20)
        for index,frame in enumerate(trajectory.frames):
            if trajectory.start+index<task_start or frame[0x48]&0x40:continue
            frequency=f32(rank*_f(frame,0x50))
            if stretch>0:frequency=f32(f32(f32(f32(rank*rank)-1.0)*stretch+1.0)*frequency)
            _put(frame,0x10,frequency)


def _frame_indices_31cd90(trajectories,last_frame):
    """Actual stable ascending fundamental/group/rank index with0x1500 cap."""
    indices={};encoded={};reverse={}
    for absolute in range(last_frame):
        refs=[]
        for identity,trajectory in enumerate(trajectories):
            if not _active(trajectory.header) or not trajectory.start<=absolute<trajectory.start+len(trajectory.frames):continue
            relative=absolute-trajectory.start
            refs.append((identity,relative))
            if len(refs)>=0x1500:break
        #31cd90 bubble swaps only on these strict comparisons, so equal keys
        #retain trajectory-table order, as Python's stable sort does here.
        refs.sort(key=lambda ref:(_f(trajectories[ref[0]].frames[ref[1]],0x50),struct.unpack_from('<I',trajectories[ref[0]].header,0x10)[0],trajectories[ref[0]].header[0x25]))
        indices[absolute]=tuple(refs)
        for slot,ref in enumerate(refs):
            code=(absolute*0x1500+slot)&0xFFFFFF
            if code in encoded:raise ValueError('Native24-bit queue coordinates alias in supplied task geometry')
            encoded[code]=ref;reverse[ref]=code
    return indices,encoded,reverse


def _priority(strength,rank):
    strength=max(.5,f32(strength))
    factors={1:1.2589254,2:1.0,3:.56234133,4:.056234132,5:.1,6:.031622775,7:.031622775,8:.017782794,9:.017782794}
    factor=factors.get(rank)
    if factor is None:
        if rank<=13 and rank>=10:factor=.0056234132
        elif 14<=rank<=16:factor=.0031622776
        elif 17<=rank<=19:factor=.0017782794
        elif 20<=rank<=23:factor=.001
        else:
            #346b60 special table contains the same float32 power values.
            factor=f32(f32(math.pow(10.0,(-2*min(rank-23,20))/20.0))*.001)
    return f32(strength*f32(factor))


def _mark_segments_3387f0(trajectories,context):
    rate=f32(context.analysis_rate);horizon=max(1,int(float(rate)*.05+.5));skip=max(1,int(float(rate)*.2+.5))
    for trajectory in trajectories:
        if not _active(trajectory.header):continue
        frames=trajectory.frames
        for frame in frames:frame[0x48]&=0xFB
        index=0;started=False
        while index<len(frames):
            if not started:
                frames[index][0x48]|=4;started=True;index+=skip
            else:
                strength=_strength(frames[index],0,context.channel_mode)
                minimum=strength
                for previous in range(max(0,index-horizon),index):minimum=min(minimum,_strength(frames[previous],0,context.channel_mode))
                #2a0d40(20)=10^(20/20), rounded to a native float.
                if f32(10.0*minimum)<strength:
                    after=index+1
                    while after<len(frames) and _strength(frames[after],0,context.channel_mode)>_strength(frames[after-1],0,context.channel_mode):after+=1
                    frames[after-1][0x48]|=4;index=skip+after-1
            index+=1


def _sort_queue_native(queue,score):
    """33c5c0 literal first-pivot hole partition; descending priority."""
    stack=[(0,len(queue))]
    while stack:
        begin,end=stack.pop()
        if begin>=end-1:continue
        pivot=queue[begin];left=begin;right=end-1
        while left<right:
            while left<right and score(queue[right])<=score(pivot):right-=1
            if left<right:queue[left]=queue[right];left+=1
            while left<right and score(pivot)<=score(queue[left]):left+=1
            if left<right:queue[right]=queue[left];right-=1
        queue[left]=pivot
        stack.append((begin,left));stack.append((left+1,end))


def _next_33adb0(trajectories,queue,encoded,cursor,component,context,task_start):
    """Fixed-component native backward/forward segment traversal."""
    while cursor<len(queue):
        identity,relative=encoded[queue[cursor]&0xFFFFFF];trajectory=trajectories[identity]
        frames=trajectory.frames;frame=frames[relative];stopped=bool(frame[0x48]&0x10)
        processed=bool(frame[0x48+component]&1)
        frequency=_f(frame,component*0x18+0x10)
        if not stopped and not processed and not context.minimum_hz<=frequency<=min(context.maximum_hz,16000.0):
            if not frame[0x48]&0x40:frame[component*0x18:component*0x18+16]=bytes(16)
            frame[0x48+component]|=1;frame[0x48]|=0x10;cursor+=1;continue
        threshold=0.0
        for later in queue[cursor+1:]:
            other_id,other_index=encoded[later&0xFFFFFF]
            if other_id==identity:continue
            other=trajectories[other_id].frames[other_index]
            if not other[0x48+component]&1 and not other[0x48]&0x50 and abs(_f(other,component*0x18+0x10)-frequency)<=1000.0:
                threshold=f32(f32(.31622776)*_f(other,0x54));break
        if not stopped and not processed:
            lower=max(0,task_start-trajectory.start)
            position=relative
            while lower<=position:
                previous=frames[position-1] if position>lower else None
                boundary=(position==lower or bool(frames[position][0x48]&4) or (position>lower and component<previous[0x4B] and bool(previous[0x48+component]&1)))
                reprioritized=(position>lower and component<previous[0x4B] and _f(previous,0x54)<threshold)
                if boundary or reprioritized:
                    for candidate in range(position,relative+1):
                        current=frames[candidate]
                        if not current[0x48]&0x10 and (not current[0x48]&0x40 or current[0x4B]):return identity,candidate,cursor
                position-=1
        for candidate in range(relative+1,len(frames)):
            current=frames[candidate]
            if current[0x48]&4:break
            if not current[0x48+component]&1 and not current[0x48]&0x10:
                if component<=current[0x4B] and _f(current,0x54)>=threshold:return identity,candidate,cursor
                break
        cursor+=1
    return None


def _window(context,absolute,frequency,*,small):
    """33b560's separately selected fit/energy contexts, native rounding."""
    fs=f32(context.sample_rate);multiplier=2.0 if context.flag_91 else 1.0
    if frequency==0:span=0
    elif small:
        span=max(int(float(fs)*.03+.5001),int(float(fs)/frequency+.5001))
        span=min(span,min((context.context_28*2+1)*context.hop,int(multiplier*.035*float(fs)+.5001)))
    else:
        span=max(int(float(fs)*.035+.5001),int((float(fs)*40.0)/frequency+.5001))
        span=min(span,min((context.context_28*2+1)*context.hop,int(multiplier*.15*float(fs)+.5001)))
    begin=max(0,context.hop//2-span//2+absolute*context.hop)
    return begin,min(begin+span,context.frame_limit*context.hop)


def _subtract_prior_33b270(trajectories,identity,relative,component,processed,encoded,band_buffers,context):
    trajectory=trajectories[identity];absolute=trajectory.start+relative
    frequency=_f(trajectory.frames[relative],component*0x18+0x10)
    begin,end=_window(context,absolute,frequency,small=False)
    first=begin//context.hop;stop=(end+context.hop-1)//context.hop;retained=[];removed=0
    for value in processed:
        other_id,other_index=encoded[value&0xFFFFFF];other_component=value>>24
        other=trajectories[other_id];other_frame=other.start+other_index
        other_frequency=_f(other.frames[other_index],other_component*0x18+0x10)
        if (other_id!=identity or other_component<component) and first<=other_frame+1 and other_frame-1<stop and frequency-90.0<other_frequency<frequency+90.0:
            band_buffers.subtract_trajectory_component(other.start,other.frames,other_index,other_component);removed+=1
        else:retained.append(value)
    processed[:]=retained
    return removed


def _fit_33b560(trajectories,identity,relative,component,indices,band_buffers,context,background,blend_table):
    trajectory=trajectories[identity];absolute=trajectory.start+relative;frame=trajectory.frames[relative]
    if frame[0x4B]<component:raise ValueError('Native queue selected a component beyond current frame count')
    if frame[0x48]&0x40:
        frame[0x48+component]|=1
        return 160.0,False
    maximum=0.0
    for other_id,other_index in indices[absolute]:
        other=trajectories[other_id].frames[other_index]
        if other[0x48]&1:maximum=max(maximum,_strength(other,0,context.channel_mode))
    #The normal flag92 path has a real empty background producer. Specialized
    #flag92 fitting additionally calls346d70, which is not guessed here.
    if context.flag_92:raise NotImplementedError('Special flag92 min-amplitude346d70 branch requires its native producer')
    minimum=max(160.0,f32(maximum*.03125))
    frequency=_f(frame,component*0x18+0x10)
    begin,end=_window(context,absolute,frequency,small=False);small_begin,small_end=_window(context,absolute,frequency,small=True)
    if not begin<end or not small_begin<small_end:raise ValueError('Native fitting window is empty')
    origin=begin//context.hop
    stop=min((end+context.hop-1)//context.hop+2,trajectory.start+len(trajectory.frames),context.frame_limit,origin+64)
    frequencies=[0.0]*64
    for index in range(origin,stop):
        if index<trajectory.start:continue
        other=trajectory.frames[index-trajectory.start]
        if index>absolute and other[0x48]&4:break
        frequencies[index-origin]=_f(other,(component if index<absolute else 0)*0x18+0x10)
    #319940 takes f30 from the selected time slot, distinct from its31b830 seed.
    target=f32(frequencies[absolute-origin]);searched=False
    previous_gate=f32(f32(math.pow(3.051850947599719e-05,.6020599913))*32767.0)
    if component>0 and context.component_limit>1 and _strength(frame,component-1,context.channel_mode)>previous_gate:
        rank=f32(trajectory.header[0x25]);extent=f32(f32(rank*_f(frame,0x50))/f32(17.317154));extent=min(41.0,extent)
        iterations=max(1,int(float(f32(extent/7.0))))
        lower=f32(max(context.minimum_hz,f32(target-7.0)));upper=f32(min(context.maximum_hz,f32(target+7.0)))
        step=f32(max(0.0,f32(f32(max(context.minimum_hz,f32(target-f32(iterations*7.0))))/f32(17732.766))))
        band=native_frequency_record_index(target,band_buffers.upper_frequencies,band_buffers.bandwidth_989fe0,search=True)
        balance=struct.unpack_from('<h',frame,0x4C)[0]
        search_channel=0 if context.channel_mode<3 else (1 if balance< -0x4800 else 2 if balance>0x4800 else 0)
        source=band_buffers.prepare(search_channel,band,begin,end,begin,end,absolute,preweighted=False)
        #319940 copies only the fit interval into32aef0's double slots; the
        #extra two33b560 frequency slots are reserved for final slope prep.
        search_stop=(end+context.hop-1)//context.hop-origin
        search_trajectory=tuple(frequencies[:search_stop]+[0.0]*(64-search_stop))
        result=search_native_frequency(search_trajectory,frame_index=absolute,begin=begin,end=end,sample_rate=context.sample_rate,hop=context.hop,
                minimum_hz=context.minimum_hz,maximum_hz=context.maximum_hz,search_minimum_hz=lower,search_maximum_hz=upper,
                minimum_step_hz=step,directional_iterations=iterations,minimum_amplitude=0.0,blend_table=blend_table,
                estimate_trial=lambda seed,slopes:estimate_prepared_trajectory_component(source,begin,end,seed,context.sample_rate,context.hop,absolute,slopes))
        searched=True
        if result.status==0 and result.trial is not None and result.trial.improvement>0:
            target=result.trial.target_frequency;frequencies[absolute-origin]=target
    first=small_begin//context.hop;last=(small_end+context.hop-1)//context.hop
    if not origin<=first<last<=origin+64:raise ValueError('Native small window exceeds its64-slot producer')
    prepared=prepare_trajectory(frequencies[first-origin:last-origin],target,context.sample_rate,context.hop)
    slopes=prepared.angular_slopes+(0.0,)*(64-len(prepared.angular_slopes));estimates=[]
    #31b7a0(search=False) returns count, i.e. the real first alternate buffer.
    complement=native_frequency_record_index(target,band_buffers.upper_frequencies,band_buffers.bandwidth_989fe0,search=False)
    for channel in range(1 if context.channel_mode>2 else 0,context.channel_mode):
        source=band_buffers.prepare(channel,complement,small_begin,small_end,small_begin,small_end,absolute,preweighted=True)
        estimates.append(estimate_prepared_trajectory_component(source,small_begin,small_end,prepared.seed_frequency,context.sample_rate,context.hop,absolute,slopes))
    selected=estimates[:1] if context.channel_mode<3 else estimates
    trajectory.frames[relative]=bytearray(write_refined_component(frame,component,target,selected,channel_mode=context.channel_mode))
    return minimum,searched


def _stop_33bfd0(trajectory,relative,component,minimum,context):
    frame=trajectory.frames[relative];locked=bool(frame[0x48]&0x40)
    limit=frame[0x4B] if locked else context.component_limit
    if not locked and 1<component+1<context.component_limit:
        radius=max(1,int(float(f32(context.analysis_rate))*.05+.5));frequency=_f(frame,0x50);change=0.0
        for neighbor in range(max(0,relative-radius),min(len(trajectory.frames)-1,relative+radius)+1):change=max(change,abs(f32(_f(trajectory.frames[neighbor],0x50)-frequency)))
        if change<15.0 and context.component_limit>2:limit=2
    if component+1>=limit or (not locked and _strength(frame,component,context.channel_mode)<minimum):frame[0x48]|=0x10


def _cleanup_339d20(trajectories,context,task_start,task_end,background):
    for trajectory in trajectories:
        if not _active(trajectory.header):continue
        frames=trajectory.frames;numerator=denominator=0.0
        for index,frame in enumerate(frames):
            if task_start<=trajectory.start+index<task_end+context.context_bc and frame[0x4B]:
                value=_strength(frame,0,context.channel_mode);denominator=f32(denominator+value);numerator=f32(numerator+f32(value*_f(frame,0x10)))
        average=f32(numerator/denominator) if denominator else numerator
        if average==0 or average>(100000.0 if context.flag_92 else 500.0):continue
        for component in range(context.component_limit):
            for side in range(2):
                scratch={}
                for index,frame in enumerate(frames):
                    absolute=trajectory.start+index
                    if not task_start<=absolute<task_end+context.context_bc:continue
                    old=_f(frame,component*0x18+8+side*4) if component<frame[0x4B] else 0.0
                    scratch[index]=old
                for index in scratch:
                    frame=frames[index]
                    if component>=frame[0x4B] or _f(frame,component*0x18+8+side*4)==0:continue
                    queried=f32(background.lookup(trajectory.start+index,_f(frame,component*0x18+0x10),0 if context.channel_mode<3 else side+1,0xFF if context.flag_92 else 0xFD,0x40 if context.flag_92 else 0))
                    if queried==0:continue
                    old=scratch[index];value=old
                    if queried<old:
                        if queried>0:value=f32(math.pow(math.pow(float(f32(old/queried)),1.6609640475208238)-1.0,.6020599913)*float(queried))
                    elif old>0:value=f32(math.pow(math.pow(float(f32(queried/old)),1.6609640475208238)-1.0,.6020599913)*float(-old))
                    else:value=-queried
                    scratch[index]=max(0.0,value)
                for index,value in scratch.items():
                    if component<frames[index][0x4B]:_put(frames[index],component*0x18+8+side*4,value)


def refine_native_trajectories(trajectories,band_buffers,*,context,task_start_frame,task_end_frame,background):
    """Build the actual ordinary33c5c0 producer for3443e0/0x4c output.

    background must be the native0xf8 owner (NativeBackgroundCache), including
    its observed normal-empty producer. It is not an arbitrary score callback.
    band_buffers is mutated exactly by33b270's31c500 residual subtractions.
    Original input trajectories are retained; the result owns refined bytes.
    """
    if not isinstance(context,NativeRefinementContext):raise TypeError('Explicit native refinement context required')
    if any(type(x) is not int for x in (task_start_frame,task_end_frame)) or not 0<=task_start_frame<=task_end_frame or task_end_frame+max(context.context_bc,context.context_b8)>context.frame_limit:
        raise ValueError('Actual bounded native task interval required')
    if band_buffers.sample_rate!=context.sample_rate or band_buffers.hop!=context.hop or len(band_buffers.channels)!=context.channel_mode:
        raise ValueError('Native band/task clocks or channel modes disagree')
    if bool(background.flag_92)!=context.flag_92 or background.channel_mode!=context.channel_mode:
        raise ValueError('Native background/task modes disagree')
    if background.first!=task_start_frame or background.end!=task_end_frame or background.context_bc!=context.context_bc:
        raise ValueError('Native background owner belongs to different task coordinates')
    if band_buffers.window_lookup_989ff0 is None:
        raise ValueError('Native328860 weighting lookup must be initialized before refinement')
    if context.flag_92:raise NotImplementedError('Automatic special flag92 refinement requires346d70 and actual347170 production')
    mutable=[_MutableTrajectory(trajectory) for trajectory in trajectories]
    _smooth_3397c0(mutable,context);_stretch_338ec0(mutable,context,task_start_frame)
    indices,encoded,reverse=_frame_indices_31cd90(mutable,task_end_frame+context.context_bc)
    for trajectory in mutable:
        if not _active(trajectory.header):continue
        rank=trajectory.header[0x25]
        for frame in trajectory.frames:
            _put(frame,0x54,_priority(_strength(frame,0,context.channel_mode),rank))
            for component in range(context.component_limit):
                frame[0x48+component]&=0xFE
                if not frame[0x48]&0x40 and component:
                    offset=component*0x18;frame[offset+0x10:offset+0x14]=frame[0x10:0x14];frame[offset:offset+16]=bytes(16)
            frame[0x48]&=0xEF
            if not frame[0x48]&0x40:frame[0x4B]=0
    _mark_segments_3387f0(mutable,context)
    queue=[];processed=[]
    for absolute in range(task_start_frame,task_end_frame+context.context_bc):
        for ref in indices[absolute]:
            frame=mutable[ref[0]].frames[ref[1]]
            if not frame[0x48]&0x40 or frame[0x4B]:queue.append(reverse[ref])
            else:frame[:16]=bytes(16)
    _sort_queue_native(queue,lambda value:_f(mutable[encoded[value][0]].frames[encoded[value][1]],0x54))
    for absolute in range(task_start_frame):
        for ref in indices[absolute]:
            for component in range(mutable[ref[0]].frames[ref[1]][0x4B]):processed.append(reverse[ref]+component*0x1000000)
    blend=native_frequency_blend_table(native_frequency_blend_length(context.analysis_rate,context.hop))
    fits=searches=subtractions=0
    for component in range(context.component_limit):
        cursor=0
        while True:
            found=_next_33adb0(mutable,queue,encoded,cursor,component,context,task_start_frame)
            if found is None:break
            identity,relative,cursor=found
            subtractions+=_subtract_prior_33b270(mutable,identity,relative,component,processed,encoded,band_buffers,context)
            minimum,searched=_fit_33b560(mutable,identity,relative,component,indices,band_buffers,context,background,blend)
            fits+=1;searches+=int(searched)
            processed.append(reverse[(identity,relative)]+component*0x1000000)
            _stop_33bfd0(mutable[identity],relative,component,minimum,context)
    for trajectory in mutable:
        if not _active(trajectory.header):continue
        keep=min(len(trajectory.frames),task_end_frame+context.context_b8-trajectory.start)
        if keep<0:raise ValueError('Native trajectory starts after its retained task region')
        trajectory.frames=trajectory.frames[:keep]
        for index,frame in enumerate(trajectory.frames):
            if trajectory.start+index>=task_start_frame:struct.pack_into('<h',frame,0x4C,0);frame[0x48]|=0x40
    _cleanup_339d20(mutable,context,task_start_frame,task_end_frame,background)
    return NativeRefinementResult(tuple(item.freeze() for item in mutable),len(queue),fits,searches,subtractions)
