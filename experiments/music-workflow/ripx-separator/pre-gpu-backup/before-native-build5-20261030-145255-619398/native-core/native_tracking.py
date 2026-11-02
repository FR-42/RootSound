"""340630 normal type-1 candidate association and native 0x28/0x5c ownership.

Source: audio-analysis-core.c, ev_4c53aa3d4f3c1583fb94c33aebfd65609d99b2fddf016f7f7641079b57cc8629;
call-site ABI: audio-core-assembly.asm, ev_b26f6466e0cc0ae84ef0518b55ec07a966c1d3adda4c9783f2af9650c3face34.
This stage consumes selected 321770 0x3c18 records, never raw 0xd94 seeds.
The resulting trajectories still require 33c5c0/319940 refinement before output.
No target execution, media processing, or numeric equivalence test was performed.
"""
from dataclasses import dataclass
import math
import struct

from native_minimum_frames import f32, minimum_valid_frames
from native_trajectory_output import NativeTrajectory
from native_background import NativeBackgroundCache


def _f(data, offset):
    return struct.unpack_from('<f', data, offset)[0]


def _h(data, offset):
    return struct.unpack_from('<h', data, offset)[0]


def _pitch(frequency):
    return f32((math.log10(float(frequency)*32.0/440.0)*12.0)/.3010299956639812+9.0)


def _divide(left, right):
    # Native SSE division preserves infinities/NaNs rather than inventing a floor.
    if right == 0:
        return math.nan if left == 0 else math.copysign(math.inf, left)
    return f32(left/right)


def native_tracking_tolerance(frequency, semitones, minimum_hz):
    """346460 nearest native semitone bucket; first bucket wins an equal tie."""
    buckets=(1/128,1/16,1/12,1/8,1/6,1/4,1/3,.45,.5,2/3,.75,1,1.5,2,3,4,6,8,12)
    bucket=min(buckets,key=lambda value:abs(f32(value)-f32(semitones)))
    ratio=math.pow(2.0,float(f32(bucket))/12.0)
    return (f32(max(float(minimum_hz),float(frequency)*(1.0-1.0/ratio))),
            f32(max(float(minimum_hz),float(frequency)*(ratio-1.0))))


@dataclass(frozen=True)
class NativeTrackingPolicy:
    rate_98a1ac: float
    context_24: int
    context_28: int
    context_bc: int
    channel_mode: int
    mode_14: int = 0
    flag_91: bool = False
    flag_92: bool = False
    flag_93: bool = False
    flag_94: bool = False
    flag_95: bool = False
    flag_96: bool = False
    flag_99: bool = False
    reduced_harmonics_989f11: bool = False
    threshold_939674: float = 128.0
    threshold_939678: float = 192.0
    threshold_93967c: float = 768.0
    lookback_98a05c: int | None = None
    lookback_98a060: int | None = None

    def __post_init__(self):
        if not math.isfinite(self.rate_98a1ac) or self.rate_98a1ac <= 0:
            raise ValueError('Actual positive native frame clock required')
        if any(type(x) is not int or x < 0 for x in (self.context_24,self.context_28,self.context_bc)):
            raise ValueError('Actual nonnegative native context capacities required')
        if self.channel_mode not in (1,2,3):
            raise ValueError('Actual native channel mode required')
        if self.flag_92 or self.flag_93 or self.reduced_harmonics_989f11:
            raise NotImplementedError('340630 specialized flags92/93/reduced-harmonic paths are not reconstructed')
        if self.mode_14 and (self.lookback_98a05c is None or self.lookback_98a060 is None):
            raise ValueError('3463b0 requires both actual lookback globals for nonzero mode14')


@dataclass(frozen=True)
class NativeTrackingResult:
    trajectories: tuple[NativeTrajectory, ...]
    next_group_id: int
    decisions: tuple[dict, ...]
    coverage: dict


class _OwnedTrajectory:
    def __init__(self, header, frames):
        self.header=bytearray(header)
        self.frames=[bytearray(frame) for frame in frames]

    @property
    def start(self):return _h(self.header,10)
    @property
    def group(self):return struct.unpack_from('<I',self.header,0x10)[0]
    @property
    def ordinal(self):return self.header[0x25]
    @property
    def active(self):return not self.header[0x0c]&1

    def sync(self):
        if len(self.frames)>65535:raise OverflowError('Native trajectory ushort capacity exceeded')
        struct.pack_into('<H',self.header,8,len(self.frames))

    def frame(self,index):
        index-=self.start
        return self.frames[index] if 0<=index<len(self.frames) else None

    def frozen(self):
        self.sync()
        return NativeTrajectory(bytes(self.header),tuple(bytes(frame) for frame in self.frames))


class NativeTracker:
    """One native analysis task; owns IDs, association, gaps, retention and padding.

    selected candidates are provided once per analysis frame, including empty
    frames. Optional previous trajectories must be real retained native records.
    grouped_f8_frames supplies the original background table for low-frequency
    gap flags. Missing data is never silently treated as an empty native table.
    """
    def __init__(self, *, policy, first_frame, task_end_frame, next_group_id=0,
                 previous_trajectories=(), grouped_f8_frames=None, bandwidth_989fe0=None,
                 background_cache=None):
        if not isinstance(policy,NativeTrackingPolicy):raise TypeError('Native tracking policy required')
        if any(type(x) is not int for x in (first_frame,task_end_frame,next_group_id)) or task_end_frame<first_frame:
            raise ValueError('Explicit ordered task frame range required')
        self.policy=policy;self.first=first_frame;self.end=task_end_frame;self.next_frame=first_frame
        self.next_group_id=next_group_id;self.decisions=[];self.finished=False
        self.objects=[]
        for value in previous_trajectories:
            if not isinstance(value,NativeTrajectory):raise TypeError('Actual retained native trajectories required')
            self.objects.append(_OwnedTrajectory(value.header,value.frames))
        if background_cache is not None and grouped_f8_frames is not None:
            raise ValueError('Background has one owner; supply cache or packed frames, not both')
        if background_cache is not None and not isinstance(background_cache,NativeBackgroundCache):
            raise TypeError('Actual native background cache owner required')
        self.background=background_cache or NativeBackgroundCache(first_frame=first_frame,
            task_end_frame=task_end_frame,context_bc=policy.context_bc,context_24=policy.context_24,
            channel_mode=policy.channel_mode,flag_92=policy.flag_92,
            records_by_frame=grouped_f8_frames,bandwidth_989fe0=bandwidth_989fe0)

    def _count(self,seconds):
        return max(1,int(f32(f32(f32(self.policy.rate_98a1ac)*f32(seconds))+.5)))

    def _strength(self,frame):
        return _f(frame,8) if self.policy.channel_mode==1 else f32(f32(_f(frame,8)+_f(frame,12))*.5)

    def _group(self,group):
        return [obj for obj in self.objects if obj.active and obj.group==group]

    def _profile(self,group,index,ignore_gap=False):
        profile=[0.0]*48;total=0.0
        for obj in self._group(group):
            frame=obj.frame(index)
            if frame is None or (ignore_gap and frame[0x48]&2):continue
            strength=self._strength(frame)
            total=f32(total+strength)
            profile[obj.ordinal-1]=f32(profile[obj.ordinal-1]+strength)
        return profile,total

    def _gap_background(self,index,frequency):
        return self.background.gap_background(index,frequency)

    def _best_match(self,candidate,strongest,index):
        p=self.policy;f0=_f(candidate,0);balance=_h(candidate,14)
        new_profile=[_f(candidate,0x1a4+h*0x13c) if _f(candidate,0xd8+h*0x13c)!=0 else 0.0 for h in range(48)]
        new_total=0.0
        for value in new_profile:new_total=f32(new_total+value)
        best=None;best_score=-1.0;best_index=-1;best_provisional=False
        for obj_index,obj in enumerate(self.objects):
            if not obj.active or obj.header[0x24]!=1 or obj.ordinal!=strongest:continue
            current=obj.frame(index)
            if current is not None and current[0x48]&0x40:
                old=_f(current,0x50);down,up=native_tracking_tolerance(old,.5,6)
                if abs(f32(f0-old))<(down if f0<=old else up):return None,-1.0,-1,True
            if obj.start>=index or not obj.frames:continue
            last=min(index-obj.start,len(obj.frames))-1
            old_max=max((_f(obj.frames[i],8) for i in range(max(0,last-2),last+1)),default=0.0)
            onset=p.flag_96 and f32(old_max+old_max)<new_profile[strongest-1]
            gap=max(0,index-obj.start-len(obj.frames));window=0
            if gap>0:
                needed=self._count(.025);valid=0
                for old_index in range(len(obj.frames)-1,-1,-1):
                    if self._profile(obj.group,obj.start+old_index,True)[1]>=62:
                        valid+=1
                        if valid>=needed:break
                if valid<needed:continue
                window=self._count(.075)
                amplitude=new_profile[strongest-1]
                #3413f4..341414 promotes old strength before MULSD.
                if float(amplitude)<float(old_max)*1.414214:
                    if p.threshold_939674<old_max:window+=1
                    if p.threshold_939678<old_max:window+=1
                if len(obj.frames)>=self._count(.05) and p.threshold_93967c<amplitude:window=max(window,2)
                window=min(window,len(obj.frames))
            if onset:window=min(window,2)
            if p.flag_95:window=max(window,self._count(.05))
            if gap>window:continue
            # Normal chronological path visits the last retained frame only.
            # The complete source loop has this same one-element range when gap>=0.
            attach=last
            if obj.start+attach+1<self.first:continue
            frame=obj.frames[attach]
            if not frame[0x48]&0x40 and abs(_h(frame,0x4c)-balance)>0x7000:continue
            old_f0=_f(frame,0x50)
            if old_f0<=0:continue
            pitch_delta=abs(f32(_pitch(old_f0)-_f(candidate,0xdc)))
            semitones=.25 if p.flag_94 or p.flag_99 else .5
            # In normal flag92=false the actual347db0 range is[0,0], hence
            # any positive-frequency query returns zero, yielding the4Hz floor.
            minimum_hz=0.0 if old_f0>500 else (1.0 if old_f0<=60 else 4.0)
            down,up=native_tracking_tolerance(old_f0,semitones,minimum_hz)
            if f0<f32(old_f0-down) or f32(old_f0+up)<f0:continue
            old_profile,old_total=self._profile(obj.group,obj.start+len(obj.frames)-1)
            distance=0.0
            for left,right in zip(old_profile,new_profile):distance=f32(distance+abs(f32(left-right)))
            shape=_divide(distance,max(old_total,new_total)) if max(old_total,new_total)>0 else 0.0
            ratio=_divide(max(old_total,new_total),min(old_total,new_total))
            balance_cost=f32(max(0,abs(balance-_h(frame,0x4c))-28672)/36862.0)
            score=f32(balance_cost+f32(_divide(pitch_delta,f32(semitones))*10.0))
            elapsed=index-(obj.start+attach+1)
            score=f32(score+f32(_divide(f32(elapsed),f32(max(1,window)))*1.5))
            score=f32(score+f32(shape*(0.0 if p.flag_95 else 1.5)))
            score=f32(score+f32(ratio*1.5))
            following=obj.frames[attach+1] if attach+1<len(obj.frames) else None
            if following is not None and not following[0x48]&0x40 and _f(following,0x54)<=score:continue
            provisional=following is not None and bool(following[0x48]&0x40)
            if best is not None and best_score<=score and (not provisional or best_provisional):continue
            best=obj_index;best_score=score;best_index=attach;best_provisional=provisional
        return best,best_score,best_index,best_provisional

    def _new_group(self,candidate,index):
        if not -32768<=index<=32767:raise OverflowError('Task frame start exceeds native signed-short range')
        group=self.next_group_id;self.next_group_id=(group+1)&0xffffffff
        if not 0<=group<=0xffffffff:raise ValueError('Native group counter exceeds uint32')
        reusable=[i for i,obj in enumerate(self.objects) if not obj.active]
        group_objects=[]
        for ordinal in range(1,49):
            if f32(ordinal*_f(candidate,0))>16000:break
            header=bytearray(0x28)
            struct.pack_into('<h',header,10,index);struct.pack_into('<I',header,0x10,group)
            struct.pack_into('<f',header,0x18,_f(candidate,0));header[0x24]=1;header[0x25]=ordinal
            obj=_OwnedTrajectory(header,())
            if reusable:self.objects[reusable.pop(0)]=obj
            elif len(self.objects)<0x3c00:self.objects.append(obj)
            else:raise OverflowError('Native340630 trajectory pool capacity exceeded')
            group_objects.append(obj)
        return group,group_objects

    def _write_candidate(self,candidate,index,matched,score,attach):
        if matched is None:group,objects=self._new_group(candidate,index)
        else:
            group=self.objects[matched].group;objects=self._group(group)
        f0=_f(candidate,0);balance=_h(candidate,14)
        for obj in objects:
            if matched is not None and attach<len(obj.frames)-1:obj.frames=obj.frames[:attach+1]
            initial=len(obj.frames);current=index-obj.start
            if current<initial:raise ValueError('Native normal chronological fill requires an append position')
            previous=bytes(obj.frames[-1]) if obj.frames else None
            obj.frames.extend(bytearray(0x5c) for _ in range(current-initial+1))
            present=_f(candidate,0xd8+(obj.ordinal-1)*0x13c)!=0
            for offset in range(current,initial-1,-1):
                frame=bytearray(0x5c)
                harmonic=f32(f32(obj.ordinal)*f0)
                if not present or offset<current:
                    target=obj.frames[current]
                    if previous is not None and _f(previous,0x10)!=0 and _f(target,0x10)!=0:
                        distance=f32(offset+1-initial);denominator=f32(current-initial+1)
                        harmonic=f32(_divide(f32(f32(_f(target,0x10)-_f(previous,0x10))*distance),denominator)+_f(previous,0x10))
                        fundamental=f32(_divide(f32(f32(_f(target,0x50)-_f(previous,0x50))*distance),denominator)+_f(previous,0x50))
                        interpolated=f32(_divide(f32(f32(_h(target,0x4c)-_h(previous,0x4c))*distance),denominator)+_h(previous,0x4c))
                        pan=int(min(32767,max(-32767,interpolated)))
                    else:fundamental=f0;pan=balance
                    struct.pack_into('<f',frame,0x10,harmonic);struct.pack_into('<f',frame,0x50,fundamental)
                    struct.pack_into('<h',frame,0x4c,pan);struct.pack_into('<f',frame,0x54,100000000.0)
                    frame[0x48]=2
                    if offset<current and previous is not None and _f(previous,0x10)!=0 and _f(target,0x10)!=0 and harmonic<250:
                        if self._strength(frame)<self._gap_background(obj.start+offset,harmonic):frame[0x48]=10
                else:
                    amplitude=_f(candidate,0x1a4+(obj.ordinal-1)*0x13c)
                    struct.pack_into('<ff',frame,8,amplitude,amplitude)
                    struct.pack_into('<f',frame,0x10,harmonic);struct.pack_into('<f',frame,0x50,f0)
                    struct.pack_into('<h',frame,0x4c,balance);struct.pack_into('<f',frame,0x54,score)
                    frame[0x48]=0x80 if candidate[0x15]<2 else 0
                obj.frames[offset]=frame
                if obj.start>=self.first and offset==current:
                    strength=self._strength(frame)
                    struct.pack_into('<f',obj.header,0x1c,f32(f32(strength*_f(candidate,4))+_f(obj.header,0x1c)))
                    struct.pack_into('<f',obj.header,0x20,f32(strength+_f(obj.header,0x20)))
            obj.sync()
        return group

    def _prune(self,index):
        p=self.policy
        lookback=0 if p.mode_14==0 else max(p.lookback_98a05c,p.lookback_98a060)
        for obj in self.objects:
            if obj.active and obj.header[0x24]==1:obj.header[0xc]&=0xfd
        for leader in self.objects:
            if not leader.active or leader.header[0x24]!=1 or leader.header[0xc]&2:continue
            objects=self._group(leader.group);valid=False;end=0;longest=0
            for obj in objects:
                end=max(end,obj.start+len(obj.frames));longest=max(longest,len(obj.frames));obj.header[0xc]|=2
                minimum=minimum_valid_frames(1,_f(obj.header,0x18),p.rate_98a1ac,p.context_24,p.context_28,
                                             flag_91=p.flag_91,flag_92=False,mode_14=p.mode_14)
                valid=valid or sum(not frame[0x48]&0x82 for frame in obj.frames)>=minimum
            if end>=index-lookback:continue
            if valid and longest<min(self._count(.2),p.context_bc-1):
                sums={}
                for obj in objects:
                    for offset,frame in enumerate(obj.frames):
                        if not frame[0x48]&0x82:
                            key=obj.start+offset;sums[key]=f32(sums.get(key,0.0)+self._strength(frame))
                values=[sums.get(i,0.0) for i in range(leader.start,leader.start+len(leader.frames))]
                total=0.0
                for value in values:total=f32(total+value)
                early=max(values[:self._count(.035)],default=0.0);peak=max(values,default=0.0)
                valid=early>=320 or (peak>=384 and total>=4096)
            if not valid:
                for obj in objects:obj.header[0xc]|=1

    def push_frame(self,index,selected_candidates):
        if self.finished:raise RuntimeError('Native tracker task is already finalized')
        if index!=self.next_frame:raise ValueError('Native tracker must consume every frame in exact chronological order')
        if index>=self.end+self.policy.context_bc:raise ValueError('Frame exceeds native340630 task plus context span')
        candidates=[]
        for raw in selected_candidates:
            if not isinstance(raw,bytes) or len(raw)!=0x3c18:raise ValueError('Actual321770 selected0x3c18 candidate bytes required')
            if raw[12]!=1:raise NotImplementedError('340630 nonharmonic/instrument candidate type is not reconstructed')
            if not math.isfinite(_f(raw,0)) or _f(raw,0)<=0:raise ValueError('Actual positive selected fundamental required')
            candidates.append(raw)
        # The native bubble sort swaps only a strict increase, preserving ties.
        candidates.sort(key=lambda raw:_f(raw,8),reverse=True)
        for ordinal,candidate in enumerate(candidates):
            strongest=0;maximum=0.0
            for h in range(48):
                if _f(candidate,0xd8+h*0x13c)!=0 and maximum<_f(candidate,0x1a4+h*0x13c):
                    maximum=_f(candidate,0x1a4+h*0x13c);strongest=h+1
            if not strongest:
                self.decisions.append({'frame':index,'candidate':ordinal,'status':'no-positive-present-harmonic'});continue
            matched,score,attach,provisional=self._best_match(candidate,strongest,index)
            if provisional:
                self.decisions.append({'frame':index,'candidate':ordinal,'status':'native-provisional-suppression'});continue
            group=self._write_candidate(candidate,index,matched,score,attach)
            self.decisions.append({'frame':index,'candidate':ordinal,'status':'new-group' if matched is None else 'associated',
                                   'group_id':group,'association_cost':score,'strongest_ordinal':strongest})
        self._prune(index);self.next_frame+=1

    def finish(self):
        """340630 tail: same-group length padding, then context-only removal."""
        if self.finished:raise RuntimeError('Native tracker task is already finalized')
        if self.next_frame!=self.end+self.policy.context_bc:
            raise ValueError('Native340630 task must include every frame through task_end+context_bc before finalization')
        for obj in self.objects:
            if obj.active and obj.header[0x24]==1:obj.header[0xc]&=0xfd
        for leader in self.objects:
            if not leader.active or leader.header[0x24]!=1 or leader.header[0xc]&2:continue
            objects=self._group(leader.group);length=max(len(obj.frames) for obj in objects)
            for obj in objects:
                while len(obj.frames)<length:
                    if not obj.frames:raise ValueError('Native trajectory tail cannot clone an absent previous frame')
                    frame=bytearray(obj.frames[-1]);struct.pack_into('<ff',frame,8,0.0,0.0);frame[0x48]=0
                    obj.frames.append(frame)
                obj.header[0xc]|=2;obj.sync()
        for obj in self.objects:
            if obj.active and obj.start>=self.end:obj.header[0xc]|=1
        self.finished=True
        return NativeTrackingResult(tuple(obj.frozen() for obj in self.objects),self.next_group_id,tuple(self.decisions),{
            'source_function':'0x140340630','candidate_bytes':0x3c18,'trajectory_header_bytes':0x28,'trajectory_frame_bytes':0x5c,
            'implemented':'normal type1, chronological task, full five-term score, group allocation, gaps, retention, tail padding',
            'excluded':['flags92/93','989f11 reduced harmonic mode','instrument/nonharmonic candidates','native pool allocation/cache serialization'],
            'requires_after':'33c5c0 native harmonic amplitude/phase/frequency refinement',
            'background_production':self.background.production,
            'verification':'construction and syntax only; no audio or numeric validation'})


def track_native_candidates(candidate_frames, *, policy, first_frame, task_end_frame,
                            next_group_id=0, previous_trajectories=(), grouped_f8_frames=None,
                            bandwidth_989fe0=None, background_cache=None):
    tracker=NativeTracker(policy=policy,first_frame=first_frame,task_end_frame=task_end_frame,
                          next_group_id=next_group_id,previous_trajectories=previous_trajectories,
                          grouped_f8_frames=grouped_f8_frames,bandwidth_989fe0=bandwidth_989fe0,
                          background_cache=background_cache)
    for offset,frame in enumerate(candidate_frames):tracker.push_frame(first_frame+offset,frame)
    return tracker.finish()
