"""321770 native selected-candidate append/energy-redistribution paths.

Consumes actual0xd94 raw records and updates actual0x3c18 records. Existing
harmonic strength is redistributed using the original powered-amplitude
domain and31aa20 envelope, not by a generic candidate-deduplication rule.
"""
from dataclasses import dataclass
import math
import struct

from native_spectral import f32
from native_harmonic_weights import native_harmonic_weights
from native_selected_candidates import native_selected_candidate_record, native_strength_energy, native_energy_strength
from native_harmonic_similarity import native_harmonic_similarity


def _f(record,offset):return struct.unpack_from('<f',record,offset)[0]
def _set(record,offset,value):struct.pack_into('<f',record,offset,f32(value))
def _frequency(f0,stretch,n):
    n=f32(n);value=f32(n*f0)
    return f32(f32(f32(f32(f32(n*n)-f32(1))*stretch)+f32(1))*value) if stretch>0 else value
def _close(existing,raw):
    old_pitch,new_pitch=_f(existing,0xdc),_f(raw,0x18)
    pitch_delta=f32(old_pitch-new_pitch) if new_pitch<=old_pitch else f32(new_pitch-old_pitch)
    frequency_delta=f32(_f(existing,0)-_f(raw,0)) if new_pitch<=old_pitch else f32(_f(raw,0)-_f(existing,0))
    return pitch_delta<f32(.0078125) or frequency_delta<f32(5)


def _harmonic_map(existing,raw,index,flag_91,*,nonzero_only):
    old_f0,old_b=_f(existing,0),_f(existing,4)
    new_f0,new_b=_f(raw,0),_f(raw,4)
    target=_frequency(new_f0,new_b,index+1)
    if old_b==0 or f32(target*f32(.125))<=old_f0:
        center=float(target)/old_f0
    else:
        stretch=float(old_b);p=(1.-stretch)/stretch;q=float(target)/(old_f0*stretch)
        discriminant=math.sqrt((p*p*p)/27.+q*q*.25)
        center=math.pow(discriminant+q*.5,1./3.)-math.pow(discriminant-q*.5,1./3.)
    margin=min((float(new_f0)/old_f0)*.5,2.)
    first,last=max(1,int(center-margin+.5)),min(48,int(center+margin+.5))
    new_pitch=_f(raw,0xc+index*0x20+0xc)
    base=f32(10 if flag_91 else 8.5)
    output=[]
    for harmonic in range(first,last+1):
        offset=0xd8+(harmonic-1)*0x13c
        strength=_f(existing,offset+0xcc)
        if nonzero_only and strength==0:continue
        expected=_frequency(old_f0,old_b,harmonic)
        pitch=_f(existing,offset+4)
        output.append((harmonic-1,native_harmonic_similarity(expected,pitch,target,new_pitch,flag_91=flag_91)))
    return output


def _add_strength(left,right):
    return native_energy_strength(f32(native_strength_energy(left)+native_strength_energy(right)))


def _proposed_weights(existing,raw,incoming,context,nonzero_only):
    weights=[_f(existing,0xd8+i*0x13c+0xcc) for i in range(48)]
    original_weights=tuple(weights)
    overlap=0.
    for index in range(raw[0xd92]):
        if _f(raw,0xc+index*0x20+8)==0:continue
        mapping=_harmonic_map(existing,raw,index,context.flag_91,nonzero_only=nonzero_only)
        total=0.
        for _,fraction in mapping:total=f32(total+fraction)
        if total==0:continue
        for harmonic,fraction in mapping:
            if nonzero_only:overlap=f32(overlap+f32(fraction*original_weights[harmonic]))
            share=f32(1) if total<=1 else f32(fraction/total)
            amount=f32(f32(fraction*incoming[index])*share)
            weights[harmonic]=_add_strength(weights[harmonic],amount)
    count=max((i+1 for i,value in enumerate(weights) if value>0),default=0)
    filtered=list(native_harmonic_weights(weights[:count],_f(existing,0),
        flag_91=context.flag_91,flag_92=context.flag_92,flag_93=context.flag_93)) if count else []
    filtered += [0.]*(48-count)
    return weights,filtered,overlap


@dataclass(frozen=True)
class NativeRegistration:
    selected_records: tuple[bytes,...]
    consumed_raw_record: bytes
    appended: bool
    capacity_reached: bool
    stop_requested: bool


def register_native_candidate(selected_records,raw_record,confidence,context,*,candidate_limit):
    """Normal param7=1 registration, including close/low-confidence absorption."""
    if len(raw_record)!=0xd94 or any(len(r)!=0x3c18 for r in selected_records):
        raise ValueError('Native registration requires0xd94 raw and0x3c18 selected records')
    if not isinstance(confidence,int) or not 0<=confidence<=255 or not isinstance(candidate_limit,int) or candidate_limit<1:
        raise ValueError('Actual native confidence and positive selected-candidate limit required')
    #321770's normal append terminates this frame at context+14, bounded by
    #the96-record allocation. Hitting a mode's polyphony is ordinary success.
    limit=min(candidate_limit,context.mode_14,96)
    if limit<1:raise ValueError('Native mode+14 must allow at least one selected candidate')
    if confidence and not any(_close(record,raw_record) for record in selected_records):
        if len(selected_records)>=96:raise ValueError('Native selected-candidate storage capacity reached')
        appended=tuple(selected_records)+(native_selected_candidate_record(raw_record,confidence),)
        return NativeRegistration(appended,bytes(raw_record),True,len(appended)>=96,len(appended)>=limit)
    selected=[bytearray(record) for record in selected_records]
    incoming=[_f(raw_record,0xc+i*0x20+8) for i in range(48)]
    choices=[]
    for index,existing in enumerate(selected):
        proposed,filtered,overlap=_proposed_weights(existing,raw_record,incoming,context,True)
        if overlap<=0:continue
        difference=0.
        for before,after in zip(proposed,filtered):
            difference=f32(difference+f32(native_strength_energy(before)-native_strength_energy(after)))
        impact=max(0.,f32(native_energy_strength(difference)-f32(.1)))
        choices.append((index,_close(existing,raw_record),impact))
    #321770's bubble ordering:true close flag first, then ascending impact;
    #equal impacts prefer the higher existing fundamental.
    for end in range(len(choices)-1,0,-1):
        changed=False
        for at in range(end):
            left,right=choices[at],choices[at+1]
            swap=(right[1] and not left[1]) or(left[1]==right[1] and(right[2]<left[2] or(right[2]==left[2] and _f(selected[left[0]],0)<_f(selected[right[0]],0))))
            if swap:choices[at],choices[at+1]=right,left;changed=True
        if not changed:break
    for old_index,_,_ in choices:
        existing=selected[old_index]
        proposed,filtered,_=_proposed_weights(existing,raw_record,incoming,context,False)
        for index in range(raw_record[0xd92]):
            if _f(raw_record,0xc+index*0x20+8)==0:continue
            mapping=_harmonic_map(existing,raw_record,index,context.flag_91,nonzero_only=False)
            total=0.
            for _,fraction in mapping:total=f32(total+fraction)
            if total==0:continue
            observed_index=struct.unpack_from('<i',raw_record,0xc+index*0x20)[0]
            for harmonic,_ in mapping:
                previous=incoming[index]
                allocation=f32(native_strength_energy(previous)-f32(native_strength_energy(proposed[harmonic])-native_strength_energy(filtered[harmonic])))
                allocation=max(allocation,0.)
                offset=0xd8+harmonic*0x13c
                _set(existing,offset+0xcc,native_energy_strength(f32(native_strength_energy(_f(existing,offset+0xcc))+allocation)))
                _set(existing,8,native_energy_strength(f32(native_strength_energy(_f(existing,8))+allocation)))
                used=existing[offset+0xf2]
                if used<8:
                    struct.pack_into('<i',existing,offset+0xd0+used*4,observed_index)
                    existing[offset+0xf2]=used+1
                incoming[index]=native_energy_strength(max(0.,f32(native_strength_energy(previous)-allocation)))
        if not any(incoming):break
    consumed=bytearray(raw_record)
    for index in range(48):
        offset=0xc+index*0x20
        for field in (8,0x10):
            difference=f32(native_strength_energy(_f(raw_record,offset+field))-native_strength_energy(incoming[index]))
            _set(consumed,offset+field,native_energy_strength(max(0.,difference)))
    return NativeRegistration(tuple(bytes(record) for record in selected),bytes(consumed),False,len(selected)>=96,False)
