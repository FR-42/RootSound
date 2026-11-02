"""32edb0 native subharmonic-sharing energy suppression.

Source:whole-32edb0.c and whole-32edb0-direct.asm. The original loop at
32f4a0 processes min(other harmonic count,1), so the suppression matrices
have only their diagonal populated in this normal context. This is kept
explicitly rather than silently replacing it with a harmonic-comb heuristic.
"""
import struct
from native_spectral import f32
from native_harmonic_weights import native_harmonic_weights
from native_selected_candidates import native_strength_energy,native_energy_strength
from native_harmonic_similarity import native_harmonic_similarity


def _f(record,offset):return struct.unpack_from('<f',record,offset)[0]
def _set(record,offset,value):struct.pack_into('<f',record,offset,f32(value))
def _weight(record,index):return _f(record,0x14+index*0x20)
def _auxiliary(record,index):return _f(record,0x24+index*0x20)
def _expected(record,harmonic):
    n=f32(harmonic);value=f32(n*_f(record,0));stretch=_f(record,4)
    return f32(f32(f32(f32(f32(n*n)-f32(1))*stretch)+f32(1))*value) if stretch>0 else value


def _compatibility(left,right,left_harmonic,right_harmonic):
    frequency=_expected(left,left_harmonic);other_frequency=_expected(right,right_harmonic)
    pitch=_f(left,0x18+(left_harmonic-1)*0x20)
    other_pitch=_f(right,0x18+(right_harmonic-1)*0x20)
    return native_harmonic_similarity(frequency,pitch,other_frequency,other_pitch)


def _factor(current,other,divisor):
    count=current[0xd92];other_count=other[0xd92]
    limit=min(max(count//divisor,other_count),48//divisor)
    current_sum=other_sum=0.
    for index in range(1,limit):
        harmonic=(index+1)*divisor-1
        if harmonic<count:current_sum=f32(current_sum+max(_weight(current,harmonic),_auxiliary(current,harmonic)))
        if index<other_count:
            if index==2 and _f(other,0x58)>f32(123):
                value=min(max(_weight(other,1),_auxiliary(other,1)),max(_weight(other,2),_auxiliary(other,2)))
            else:value=max(_weight(other,index),_auxiliary(other,index))
            other_sum=f32(other_sum+value)
    if current_sum>0:return max(0.,min(f32(1),f32(f32(other_sum/current_sum)-f32(1))))
    return f32(1) if other_sum>0 else 0.


def _recalculate(record):
    from native_raw_selection import _native_adjusted_envelope
    count=record[0xd92]
    if not count:return
    residual=[native_energy_strength(max(0.,f32(_f(record,0x20+i*0x20)-_f(record,0x28+i*0x20)))) for i in range(count)]
    weights=native_harmonic_weights(residual,_f(record,0),flag_91=False,flag_92=False,flag_93=False)
    for index,value in enumerate(weights):_set(record,0x14+index*0x20,min(_weight(record,index),value))
    for index,value in enumerate(_native_adjusted_envelope(residual)):_set(record,0x24+index*0x20,value)


def suppress_native_raw(records,indices,peak_records,context,lookup):
    """Mutate real raw storage in the original descending-f0 processing order."""
    if any((context.seed_context.flag_91,context.seed_context.flag_92,context.seed_context.flag_93,context.flag_95,context.flag_98)):
        raise NotImplementedError('32edb0 special/reference contexts require their original extra branches')
    for raw_index in reversed(indices):
        current=records[raw_index];trimmed=current[0xd92]
        while trimmed and _weight(current,trimmed-1)==0:trimmed-=1
        maximum=min(trimmed-1,23)
        if maximum<1:continue
        groups=[[] for _ in range(24)]
        for index in range(1,min(trimmed,24)):
            observed=struct.unpack_from('<i',current,0xc+index*0x20)[0]
            if observed<0:continue
            divisor=index+1
            for other_harmonic in range(divisor//2):
                if divisor%(other_harmonic+1):continue
                for position in lookup.get((observed,other_harmonic),()):
                    #Original32f10e..32f165 compares the preceding divisor
                    #group's entries, then its result against current count.
                    previous=groups[index-1]
                    found=previous.index(position) if position in previous else len(previous)
                    if len(groups[index])<=found and len(groups[index])<0xc00:groups[index].append(position)
        matrices={}
        for index in range(maximum,0,-1):
            if struct.unpack_from('<i',current,0xc+index*0x20)[0]<0:continue
            for position in groups[index]:
                other_index=indices[position];other=records[other_index]
                if other[0xd92]==0 or _weight(other,0)==0:continue
                if index>=trimmed:continue
                factor=_factor(current,other,index+1)
                fraction=_compatibility(current,other,index+1,1)
                amount=f32(f32(_weight(other,0)*factor)*fraction)
                old_amount,old_mixture,_=matrices.get(index,(0.,0.,None))
                if old_amount<amount or (factor==0 and old_amount==0 and old_mixture<fraction):
                    matrices[index]=(amount,f32(f32(f32(1)-factor)*fraction),other_index)
        if not matrices:continue
        had_energy=False
        for index in range(1,maximum+1):
            amount=matrices.get(index,(0.,0.,None))[0]
            if amount>0:
                at=0x28+index*0x20
                _set(current,at,f32(native_strength_energy(amount)+_f(current,at)))
                had_energy=True
        if had_energy:_recalculate(current)
        first=1 if _f(current,0)<65 else 3
        for index in range(first,maximum+1):
            _,mixture,other_index=matrices.get(index,(0.,0.,None))
            if other_index is None:continue
            other=records[other_index]
            amount=f32(min(_weight(current,index),_auxiliary(current,index))*mixture)
            at=0x60c+index*4
            if _f(other,at)<amount:
                _set(other,at,amount)
                upper=max((_f(other,0x60c+i*4) for i in range(index,7)),default=0.) if index<7 else 0.
                _set(other,0x28,native_strength_energy(upper))
                _recalculate(other)
