"""Native33ec60/33d520 harmonic excess redistribution after33c5c0.

The original default939a00 value is1 (retained PE evidence), so this stage
is implemented rather than skipped. All candidate grouping, cubic harmonic
bounds, phase compatibility, donor ordering and power-domain transfers are
from the retained native functions. No generic spectral-mask transfer occurs.

Source:whole-33ec60.c/json,whole-33d520.c/json and direct SSE disassemblies.
Construction/AST only; no audio or original-runtime verification performed.
"""
from dataclasses import dataclass
import math

from native_harmonic_fields import f32
from native_harmonic_weights import native_harmonic_weights
from native_selected_candidates import native_strength_energy, native_energy_strength
from native_trajectory_refinement import NativeRefinementContext, _MutableTrajectory, _frame_indices_31cd90, _f, _put, _strength

TAU=6.283185307179586


@dataclass(frozen=True)
class NativeHarmonicPostprocessResult:
    trajectories: tuple
    transfers: int
    phase_probes: int
    processed_groups: int
    extra_components_939a00: int
    stage: str='native-33ec60/33d520'


def merge_native_component(destination,source,source_component,incoming_strengths,*,
                           analysis_rate,channel_mode,component_limit,extra_components,
                           minimum_strength=62.0,probe_only=False):
    """33d520:find compatible slot, or return0xff; mutate only real merge.

    The source ABI's stack arguments5..8 are not read by the native body.
    Its actual remaining arguments are minimum strength+48 and probe flag+50.
    A probe may report the next slot; the mutation branch rejects that slot
    when it equals the destination count, exactly as the original does.
    """
    if len(destination)!=0x5C or len(source)!=0x5C or not 0<=source_component<3:
        raise ValueError('Actual native trajectory component records required')
    sides=max(1,channel_mode-1)
    if channel_mode not in (1,2,3) or len(incoming_strengths)!=sides:
        raise ValueError('Native per-channel incoming strengths required')
    if not math.isfinite(analysis_rate) or analysis_rate<=0 or not 1<=component_limit<=3 or not 0<=extra_components<=255:
        raise ValueError('Actual native frame clock/component configuration required')
    minimum=f32(minimum_strength)
    if _strength(source,source_component,channel_mode)<minimum:return 0xFF
    count=destination[0x4B]
    if count>3:raise ValueError('Native0x5c component count exceeds physical slots')
    window=float(f32(1.0/f32(analysis_rate)))
    chosen=count
    for component in range(count):
        compatible=True
        for side in range(sides):
            offset=component*0x18+side*4;source_offset=source_component*0x18+side*4
            strength=_f(destination,offset+8);frequency=_f(destination,offset+0x10)
            if strength>=minimum or frequency==0.0:compatible=False;break
            source_frequency=_f(source,source_offset+0x10)
            if source_frequency==0.0:compatible=False;break
            phase=_f(destination,offset);source_phase=_f(source,source_offset)
            initial=abs(float(f32(source_phase-phase)))
            after=abs(((float(source_frequency)*TAU)*window+float(source_phase))-((float(frequency)*TAU)*window+float(phase)))
            denominator=max(4.0,float(f32(strength+f32(incoming_strengths[side])))*.03125)
            if math.pi/denominator<=(after+initial)*float(frequency)*window:compatible=False;break
        if compatible:chosen=component;break
    if chosen>=((component_limit+extra_components)&0xFF):return 0xFF
    if probe_only:return chosen
    if chosen==count:return 0xFF
    for side in range(sides):
        offset=chosen*0x18+side*4;source_offset=source_component*0x18+side*4
        phase=_f(destination,offset);incoming=f32(incoming_strengths[side])
        if phase==-999999.0:
            _put(destination,offset,_f(source,source_offset));_put(destination,offset+0x10,_f(source,source_offset+0x10))
            strength=max(0.0,incoming)
        else:
            old=_f(destination,offset+8);source_phase=_f(source,source_offset)
            denominator=f32(old+incoming)
            if denominator==0:raise ValueError('Native phase merge reached zero-strength division')
            weight=f32(old/denominator);remaining=f32(1.0-weight)
            sine=f32(f32(f32(math.sin(source_phase))*remaining)+f32(f32(math.sin(phase))*weight))
            cosine=f32(f32(f32(math.cos(source_phase))*remaining)+f32(f32(math.cos(phase))*weight))
            mixed=f32(math.atan2(sine,cosine));wrapped=math.fmod(float(mixed),TAU)
            if wrapped<0:wrapped+=TAU
            _put(destination,offset,wrapped)
            #The frequency product has a double(1-weight), unlike sinf/cosf.
            frequency=float(_f(source,source_offset+0x10))*(1.0-float(weight))+float(f32(weight*_f(destination,offset+0x10)))
            _put(destination,offset+0x10,frequency)
            strength=native_energy_strength(f32(native_strength_energy(old)+native_strength_energy(incoming)))
        _put(destination,offset+8,strength)
    return chosen


def _group_span(trajectories,refs,center):
    """33ec60's contiguous same-group range within31cd90's existing index."""
    group=trajectories[refs[center][0]].header[0x10:0x14]
    first=last=center
    while first>0 and trajectories[refs[first-1][0]].header[0x10:0x14]==group:first-=1
    while last+1<len(refs) and trajectories[refs[last+1][0]].header[0x10:0x14]==group:last+=1
    return first,last


def _native_harmonic_bounds(frequency,base,stretch,source_fundamental):
    """33ec60 cubic inverse branch and original half-ratio interval."""
    if stretch==0.0 or f32(frequency*.125)<=base:center=float(frequency)/float(base)
    else:
        ratio=(1.0-float(stretch))/float(stretch)
        negative=-float(frequency)/(float(base)*float(stretch))
        discriminant=math.sqrt(((ratio*ratio)*ratio)/27.0+(negative*negative)*.25)
        center=math.pow(discriminant-negative*.5,1.0/3.0)-math.pow(discriminant+negative*.5,1.0/3.0)
    half=min((float(source_fundamental)/float(base))*.5,2.0)
    return max(1,int(center-half+.5)),min(48,int(half+center+.5))


def postprocess_native_harmonics(trajectories,*,context,task_start_frame,task_end_frame,extra_components=1):
    """Actual default33ec60 producer; consumes refined0x28/0x5c trajectories.

    extra_components is originalglobal939a00 (PE initial1). Zero selects the
    original explicit early-return configuration; it is not a default fallback.
    The stage uses trajectory fields only; native bands/background are owned by
    the preceding phase/amplitude estimator and are not recomputed here.
    """
    if not isinstance(context,NativeRefinementContext):raise TypeError('Actual native refinement context required')
    if type(extra_components) is not int or not 0<=extra_components<=255:
        raise ValueError('Actual939a00 global value required')
    if any(type(x) is not int for x in (task_start_frame,task_end_frame)) or not 0<=task_start_frame<=task_end_frame<=context.frame_limit:
        raise ValueError('Actual native postprocess interval required')
    mutable=[_MutableTrajectory(item) for item in trajectories]
    if not extra_components or task_start_frame==task_end_frame:
        return NativeHarmonicPostprocessResult(tuple(item.freeze() for item in mutable),0,0,0,extra_components)
    if context.flag_92:raise NotImplementedError('The special flag92 dispatcher uses33dc80 instead of33ec60')
    indices,_,_=_frame_indices_31cd90(mutable,task_end_frame)
    sides=max(1,context.channel_mode-1);transfers=probes=groups=0
    for absolute in range(task_start_frame,task_end_frame):
        refs=indices[absolute]
        if len(refs)<2:continue
        position=0
        while position<len(refs):
            first,last=_group_span(mutable,refs,position);groups+=1
            observed=[0.0]*48
            for at in range(first,last+1):
                identity,relative=refs[at];trajectory=mutable[identity];frame=trajectory.frames[relative];rank=trajectory.header[0x25]
                if not 1<=rank<=48:raise ValueError('Native harmonic rank must index the48-slot envelope')
                aggregate=observed[rank-1]
                for component in range(frame[0x4B]):
                    aggregate=native_energy_strength(f32(native_strength_energy(aggregate)+native_strength_energy(_strength(frame,component,context.channel_mode))))
                observed[rank-1]=aggregate
            fundamental=_f(mutable[refs[position][0]].header,0x18)
            count=max((index+1 for index,value in enumerate(observed) if value>0.0),default=0)
            filtered=list(native_harmonic_weights(observed[:count],fundamental,flag_91=context.flag_91,flag_92=False,flag_93=False)) if count else []
            filtered.extend([0.0]*(48-count))
            source_fundamental=_f(mutable[refs[first][0]].frames[refs[first][1]],0x50)
            for donor_at in range(first,last+1):
                donor_id,donor_relative=refs[donor_at];donor_trajectory=mutable[donor_id];donor=donor_trajectory.frames[donor_relative];rank=donor_trajectory.header[0x25]
                if rank<2:continue
                excess=max(0.0,f32(native_strength_energy(observed[rank-1])-native_strength_energy(filtered[rank-1])))
                if excess<1.0:continue
                donor_frequency=_f(donor,0x10);best=None;best_distance=0.0;candidate_at=last+1
                while candidate_at<len(refs):
                    identity,relative=refs[candidate_at];candidate=mutable[identity];frame=candidate.frames[relative]
                    base=_f(frame,0x50);stretch=_f(candidate.header,0x20)
                    if base<=0:raise ValueError('Native candidate fundamental must be positive')
                    low,high=_native_harmonic_bounds(donor_frequency,base,stretch,source_fundamental)
                    other_first,other_last=_group_span(mutable,refs,candidate_at)
                    ratio=f32(_f(mutable[refs[other_first][0]].frames[refs[other_first][1]],0x50)/source_fundamental)
                    if ratio>=f32(1.4):
                        for at in range(other_first,other_last+1):
                            other_id,other_relative=refs[at];other=mutable[other_id];other_rank=other.header[0x25]
                            if other_rank<low:continue
                            if other_rank>high:break
                            recipient=other.frames[other_relative]
                            distance=abs(f32(donor_frequency-_f(recipient,0x10)))
                            if best is not None and distance>=best_distance:continue
                            incoming=tuple(_f(donor,8+side*4) for side in range(sides));probes+=1
                            selected=merge_native_component(recipient,donor,0,incoming,analysis_rate=context.analysis_rate,channel_mode=context.channel_mode,
                                    component_limit=context.component_limit,extra_components=extra_components,minimum_strength=62.0,probe_only=True)
                            if selected!=0xFF:best=at;best_distance=distance
                    candidate_at=other_last+1
                if best is None:continue
                tolerance=max(f32(donor_frequency/f32(17.317154)),10.0 if context.flag_91 else 8.5)
                if best_distance>=tolerance:continue
                recipient_id,recipient_relative=refs[best];recipient=mutable[recipient_id].frames[recipient_relative]
                attempted=[False]*3;requested=native_energy_strength(excess)
                while True:
                    above=below=None
                    for component in range(donor[0x4B]):
                        if attempted[component]:continue
                        strength=_strength(donor,component,context.channel_mode)
                        if strength<requested:
                            if below is None or strength>_strength(donor,below,context.channel_mode):below=component
                        elif above is None or strength<_strength(donor,above,context.channel_mode):above=component
                    component=above if above is not None else below
                    if component is None:break
                    attempted[component]=True;amounts=[];old_powers=[];incoming=[]
                    for side in range(sides):
                        amount=excess
                        if context.channel_mode!=1:
                            left=_f(donor,component*0x18+8);right=_f(donor,component*0x18+12);total=f32(left+right)
                            if total==0:raise ValueError('Native stereo redistribution reached zero-strength division')
                            #33f62a..33f64e multiplies in double before thef32 cast.
                            requested_side=f32(float(_f(donor,component*0x18+8+side*4))*(float(requested)*2.0)/float(total))
                            amount=native_strength_energy(requested_side)
                        old=native_strength_energy(_f(donor,component*0x18+8+side*4));amount=min(amount,old)
                        old_powers.append(old);amounts.append(amount);incoming.append(native_energy_strength(amount))
                    selected=merge_native_component(recipient,donor,component,tuple(incoming),analysis_rate=context.analysis_rate,channel_mode=context.channel_mode,
                            component_limit=context.component_limit,extra_components=extra_components,minimum_strength=62.0,probe_only=False)
                    if selected==0xFF:continue
                    transfers+=1
                    for side in range(sides):
                        value=max(0.0,native_energy_strength(f32(old_powers[side]-amounts[side])))
                        _put(donor,component*0x18+8+side*4,value)
                        reduction=amounts[side] if context.channel_mode==1 else native_strength_energy(f32(incoming[side]*.5))
                        excess=f32(excess-reduction)
                    #The original removes only a sub62 last slot. Its copy
                    #loop is unreachable for earlier slots under this guard.
                    if component==donor[0x4B]-1 and _strength(donor,component,context.channel_mode)<62.0:donor[0x4B]-=1
                    if excess<1.0:break
                    requested=native_energy_strength(excess)
            position=last+1
    return NativeHarmonicPostprocessResult(tuple(item.freeze() for item in mutable),transfers,probes,groups,extra_components)
