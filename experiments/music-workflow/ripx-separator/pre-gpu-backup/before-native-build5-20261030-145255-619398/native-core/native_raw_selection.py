"""3312a0/332410 original raw scoring and confidence selection.

This module implements the normal untuned, non-reference context. Optional
native context branches are rejected where their helpers are not yet ported.
It consumes real history and never substitutes a constant confidence.
"""
from dataclasses import dataclass
import struct
from native_spectral import f32
from native_harmonic_weights import native_harmonic_weights
from native_raw_order import native_raw_score_order,prune_native_raw_duplicates
from native_candidate_confidence import native_candidate_ceiling
from native_selected_candidates import native_strength_energy


def _f(record,offset):return struct.unpack_from('<f',record,offset)[0]
def _set(record,offset,value):struct.pack_into('<f',record,offset,f32(value))


@dataclass(frozen=True)
class NativeSelectionContext:
    seed_context: object
    analysis_rate: float
    iteration_budget: int
    candidate_limit: int
    maximum_selected_fundamental: float
    flag_90: bool=False
    flag_94: bool=False
    flag_95: bool=False
    flag_98: bool=False
    flag_99: bool=False
    tuning_mode_b0: int=0

    def check_supported(self):
        seed=self.seed_context
        if seed.flag_91 or seed.flag_92 or seed.flag_93 or self.flag_95 or self.flag_98 or self.flag_99 or self.tuning_mode_b0:
            raise NotImplementedError('3312a0 special/reference/tuning context branches are not reconstructed')
        if self.iteration_budget<0 or not 1<=self.candidate_limit<=96 or self.maximum_selected_fundamental<=0:
            raise ValueError('Actual native selector budget, physical limit and frequency ceiling required')


def native_peak_candidate_index(raw_records,indices):
    """32ff30 first10 candidate-list positions per(peak,harmonic)."""
    output={}
    for position,index in enumerate(indices):
        raw=raw_records[index]
        for harmonic in range(48):
            peak=struct.unpack_from('<i',raw,0xc+harmonic*0x20)[0]
            if peak>=0:
                bucket=output.setdefault((peak,harmonic),[])
                if len(bucket)<10:bucket.append(position)
    return {key:tuple(value) for key,value in output.items()}


def _native_frequency_order(records,indices):
    #3312a0's second first-pivot sort is ascending f0, with the same equal
    #partition directions as31f060. Keep ties faithful, not Python stable sort.
    order=list(indices);pending=[(0,len(order))]
    while pending:
        start,stop=pending.pop()
        if start>=stop-1:continue
        pivot=order[start];left=start;right=stop-1
        while left<right:
            while left<right and _f(records[order[right]],0)>=_f(records[pivot],0):right-=1
            if left<right:order[left]=order[right];left+=1
            while left<right and _f(records[pivot],0)>=_f(records[order[left]],0):left+=1
            if left<right:order[right]=order[left];right-=1
        order[left]=pivot
        pending.append((start,left));pending.append((left+1,stop))
    return tuple(order)


def _native_adjusted_envelope(values):
    """331647..33179f auxiliary even/odd upper envelope (not31b4c0)."""
    count=len(values);result=[0.]*count
    if not count:return result
    first=values[0];result[0]=first
    for index in range(2,count,2):
        before=min(first,max(values[index-2],values[index-1]))
        after=min(first,max(values[index+1:index+3],default=0.))
        result[index]=min(values[index],max(before,f32(f32(before+after)*f32(.5))))
    cap=f32(first*f32(4))
    for index in range(1,count,2):
        before=min(cap,values[index-1])
        after=min(cap,values[index+1] if index+1<count else 0.)
        result[index]=min(values[index],max(before,f32(f32(before+after)*f32(.5))))
    return result


def adjust_native_raw_scores(raw_records,indices,peak_records,history,context,*,iteration):
    """Default3312a0 path, returning original raw storage and frequency order."""
    context.check_supported();seed=context.seed_context
    threshold=750 if iteration>=20 else 600 if iteration>=16 else 500 if iteration>=12 else 0
    order=tuple(index for index in indices if _f(raw_records[index],0)>=threshold)
    records=[bytearray(record) for record in raw_records]
    for index in order:
        records[index]=bytearray(history.initialize_raw(records[index]))
        raw=records[index];count=raw[0xd92]
        incoming=[_f(raw,0x1c+i*0x20) for i in range(count)]
        weights=native_harmonic_weights(incoming,_f(raw,0),flag_91=False,flag_92=False,flag_93=False) if count else []
        envelope=_native_adjusted_envelope(incoming)
        for harmonic in range(48):
            base=0xc+harmonic*0x20
            _set(raw,base+8,weights[harmonic] if harmonic<count else 0.)
            _set(raw,base+0x18,envelope[harmonic] if harmonic<count else 0.)
            _set(raw,base+0x1c,0.)
            if harmonic<count:_set(raw,base+0x14,native_strength_energy(incoming[harmonic]))
        #Original temporary energy storage follows harmonic rows at+60c.
        raw[0x60c:0x6cc]=bytes(0xc0)
    #Original3318bb initially updates flagged raw slots by storage ordinal,
    #not by the current task+668 permutation.
    for raw in records[:len(order)]:
        if raw[0xd93]&1:
            total=0.
            for harmonic in range(raw[0xd92]):total=f32(total+_f(raw,0x14+harmonic*0x20))
            _set(raw,8,total)
    ordered=native_raw_score_order(records,order)
    immutable,ordered=prune_native_raw_duplicates(records,ordered)
    records=[bytearray(record) for record in immutable]
    ordered=_native_frequency_order(records,ordered)
    lookup=native_peak_candidate_index(records,ordered)
    if not context.flag_90 and len(peak_records)>24:
        from native_raw_suppression import suppress_native_raw
        suppress_native_raw(records,ordered,peak_records,context,lookup)
    for index in ordered:
        raw=records[index];count=raw[0xd92]
        #The normal92/93=false branch caps a local weighted maximum by the
        #observed amplitude before the alternate-envelope score pass.
        for harmonic in range(3,count):
            at=0x14+harmonic*0x20
            observed=_f(raw,at+8)
            value=min(observed,max(_f(raw,at),_f(raw,at-0x20)))
            if harmonic>2 and harmonic%2==0:value=min(observed,max(value,_f(raw,at-0x40)))
            _set(raw,at,value)
        incoming=[_f(raw,0x1c+i*0x20) for i in range(count)]
        alternate=native_harmonic_weights(incoming,_f(raw,0),flag_91=False,flag_92=False,flag_93=False,alternate=True) if count else []
        if (seed.mode_14==1 or context.flag_94) and count:
            largest=max((_f(raw,0x14+i*0x20) for i in range(1,count)),default=0.)
            first=_f(raw,0x14)
            #331ef7 chooses the recovered-10dB table entry when94 is on;
            #the ordinary mono/one-candidate branch uses-70dB instead.
            coefficient=f32(.3162277638912201 if context.flag_94 else .0003162277571391314)
            if f32(largest*coefficient)>=first:
                for harmonic in range(1,count):
                    _set(raw,0x14+harmonic*0x20,max(_f(raw,0x14+harmonic*0x20),f32(first*f32(3.1622776985168457))))
        total=0.
        for harmonic in range(count):total=f32(total+min(_f(raw,0x14+harmonic*0x20),alternate[harmonic]))
        _set(raw,8,total)
    return tuple(bytes(record) for record in records),ordered,lookup


def choose_native_raw_candidate(raw_records,indices,selected_records,context):
    """332410 normal context and true321220/3204c0 confidence gate."""
    context.check_supported()
    chosen=None;best=0.
    for index in indices:
        raw=raw_records[index]
        if _f(raw,0)>context.maximum_selected_fundamental:continue
        score=_f(raw,8)
        if best<score:chosen,best=index,score
    if chosen is None:return None,0
    raw=raw_records[chosen]
    #3204c0 jumps directly to321166 when92/93 are both clear.
    total=0.
    for harmonic in range(48):total=f32(total+_f(raw,0x14+harmonic*0x20))
    ceiling=native_candidate_ceiling(raw,selected_records,flag_92=False,flag_93=False)
    return chosen,2 if total>ceiling else 0
