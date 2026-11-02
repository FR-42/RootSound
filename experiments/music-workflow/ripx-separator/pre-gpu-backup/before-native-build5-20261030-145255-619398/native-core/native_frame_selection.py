"""334230 actual residual-state loop:13c peaks→selected3c18 candidates.

Runs recovered pair seeds/raw fits/scoring/confidence/registration, subtracts
native powered strengths from each harmonic's residual peak, then refits
overlapping candidates. It is a static-derived construction, not runtime
equivalence or an original RipX proprietary-model extraction claim.
"""
from dataclasses import dataclass,replace
import struct
from native_spectral import f32
from native_raw_fundamentals import native_raw_fundamentals,refit_native_raw_fundamental
from native_raw_order import native_raw_score_order,prune_native_raw_duplicates
from native_raw_selection import adjust_native_raw_scores,choose_native_raw_candidate
from native_candidate_registration import register_native_candidate
from native_selected_candidates import native_strength_energy,native_energy_strength


def _f(record,offset):return struct.unpack_from('<f',record,offset)[0]
def _set(record,offset,value):struct.pack_into('<f',record,offset,f32(value))


@dataclass(frozen=True)
class NativeSelectedFrame:
    frame_index:int
    selected_records:tuple[bytes,...]
    residual_peak_records:tuple[bytes,...]
    raw_record_count:int
    iterations:int
    capacity_reached:bool
    stage:str='native334230-selected-candidates'


def select_native_frame(refined_frame,context,history,*,advance_history=True):
    """Concrete frame/context/history→true selected records for340630.

    context:NativeSelectionContext;history:NativeSelectionHistory. Both
    contexts must use the native analysis clock. The caller owns history
    lifetime across ordered frames and blocks.
    """
    context.check_supported();seed=context.seed_context
    if f32(context.analysis_rate)!=history.analysis_rate:
        raise ValueError('Native selector and rolling history clocks differ')
    peaks=[bytearray(record) for record in refined_frame.peak_records_13c]
    for peak in peaks:
        if len(peak)!=0x13c:raise ValueError('Native peak record must be0x13c bytes')
        amplitude=_f(peak,0xcc)
        for harmonic in range(48):
            _set(peak,0xc+harmonic*4,amplitude)
            peak[0xf4+harmonic]=0
    prepared_frame=replace(refined_frame,peak_records_13c=tuple(bytes(peak) for peak in peaks))
    raw=list(candidate.record_d94() for candidate in native_raw_fundamentals(prepared_frame,seed))
    order=native_raw_score_order(raw)
    immutable,order=prune_native_raw_duplicates(raw,order)
    raw=list(immutable);selected=();iteration=0;capacity=False
    frequency_order=tuple(sorted(range(len(peaks)),key=lambda i:_f(peaks[i],0)))
    while iteration<context.iteration_budget-2*len(selected):
        adjusted,order,_=adjust_native_raw_scores(raw,order,peaks,history,context,iteration=iteration)
        raw=list(adjusted)
        chosen,confidence=choose_native_raw_candidate(raw,order,selected,context)
        if chosen is None:break
        registration=register_native_candidate(selected,raw[chosen],confidence,seed,candidate_limit=context.candidate_limit)
        selected=registration.selected_records
        raw[chosen]=registration.consumed_raw_record
        if registration.stop_requested:
            capacity=registration.capacity_reached;break
        for peak in peaks:peak[0xf3]&=0xfb
        consumed=raw[chosen]
        for harmonic in range(consumed[0xd92]):
            at=0xc+harmonic*0x20
            index=struct.unpack_from('<i',consumed,at)[0]
            if index<0:continue
            peak=peaks[index]
            previous=native_strength_energy(_f(peak,0xc+harmonic*4))
            claimed=native_strength_energy(_f(consumed,at+8))
            residual=native_energy_strength(max(0.,f32(previous-claimed)))
            _set(peak,0xc+harmonic*4,residual)
            _set(peak,0xcc,min(_f(peak,0xcc),residual))
            if peak[0xf4+harmonic]!=0xff:peak[0xf4+harmonic]=(peak[0xf4+harmonic]+1)&0xff
            peak[0xf3]|=4
        remaining=[]
        for index in order:
            record=bytearray(raw[index]);record[0xd93]&=0xfe
            count=record[0xd92]
            shares=False
            for harmonic in range(count):
                matched=struct.unpack_from('<i',record,0xc+harmonic*0x20)[0]
                if matched>=0 and peaks[matched][0xf3]&4:shares=True;break
            if not shares:
                raw[index]=bytes(record);remaining.append(index);continue
            indices=[];retained=[]
            for harmonic in range(48):
                matched=struct.unpack_from('<i',record,0xc+harmonic*0x20)[0] if harmonic<count else -1
                if matched<0 or _f(peaks[matched],0xcc)<62 or peaks[matched][0xf4+harmonic]>2:
                    matched=-1
                indices.append(matched)
                if matched>=0:retained.append(harmonic+1)
            replacement=None
            if retained and retained[0]<9 and any(h&1 for h in retained) and (len(retained)>1 or indices[0]>=0):
                replacement=refit_native_raw_fundamental(peaks,seed,indices,frame_index=refined_frame.frame_index,frequency_order=frequency_order)
            raw[index]=replacement if replacement is not None else bytes(0xd94)
            if replacement is not None:remaining.append(index)
        order=tuple(remaining);iteration+=1
    if advance_history:history.advance(selected)
    return NativeSelectedFrame(refined_frame.frame_index,tuple(selected),tuple(bytes(peak) for peak in peaks),len(raw),iteration,capacity)
