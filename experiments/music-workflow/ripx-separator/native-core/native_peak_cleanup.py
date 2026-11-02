"""335480 tail:strong-first7Hz duplicates and actual50/60Hz hum removal.

Source:peak-stage-driver.c lines1180..end; the decompiler loses the median
assignment, recovered independently at3373f6..33741b in
peak-sequence-hum-direct.asm.346e50 is the owned native strength->power map.
No audio execution or numeric/equivalence validation was performed.
"""
import math
import struct

from native_spectral import f32
from native_selected_candidates import native_strength_energy,native_energy_strength


def _f(record,offset):return struct.unpack_from('<f',record,offset)[0]


def _hum_distance(frequency):
    return min(abs(f32(frequency-50.0)),abs(f32(frequency-60.0)))


def cleanup_native_peak_frames(frame_records,*,task_start,task_end,context_bc):
    """Update actual indexed mutable0x13c lists in the native335480 order.

    task_start is the original local400 cleanup boundary after previous-frame
    reuse; task_end is the original task end. No missing frame is manufactured.
    Other0x13c fields remain intact when the source updates amplitude+cc alone.
    The caller owns rebuilding its NativeRefinedFrame result/provenance mapping.
    """
    if any(type(value) is not int for value in (task_start,task_end,context_bc)) or not 0<=task_start<=task_end or context_bc<0:
        raise ValueError('Actual native cleanup frame geometry required')
    stop=task_end+context_bc
    for index in range(task_start,stop):
        if index not in frame_records:raise ValueError('Native peak cleanup requires every actual task/context frame')
        records=frame_records[index]
        if not isinstance(records,list) or len(records)>0x200 or any(not isinstance(record,bytearray) or len(record)!=0x13C for record in records):
            raise ValueError('Native peak cleanup requires mutable lists of at most512 actual0x13c records')
        if any(not math.isfinite(_f(record,offset)) for record in records for offset in (0,0xCC)):
            raise ValueError('Native peak frequency/strength fields must be finite')
    #Native335480 sorts by strict amplitude comparisons; equal values retain
    #their original order, which the stable sort preserves exactly.
    levels=[];summed=weighted=0.0
    threshold=f32(f32(f32(math.pow(.003906369212927641,.6020599913))*32767.0)*.5)
    for ordinal,index in enumerate(range(task_start,stop)):
        records=frame_records[index]
        records.sort(key=lambda record:_f(record,0xCC),reverse=True)
        first=0
        while first<len(records):
            frequency=_f(records[first],0);later=first+1
            while later<len(records):
                other=_f(records[later],0)
                if f32(other-frequency)<=7.0 and f32(frequency-other)<=7.0:del records[later]
                else:later+=1
            first+=1
        level=0.0
        for record in records:
            strength=_f(record,0xCC)
            if _hum_distance(_f(record,0))<5.0 and strength<threshold:level=max(level,strength)
        levels.append(level)
        summed=f32(summed+level);weighted=f32(weighted+f32(f32(ordinal)*level))
    center=f32(weighted/summed) if summed!=0.0 else weighted
    noise=0.0;count=len(levels)
    if f32(f32(count)*f32(.3499999940395355))<center<f32(f32(count)*f32(.6499999761581421)):
        levels.sort(reverse=True)
        #This multiply is double in the native SSE, with one finalf32 cast.
        noise=f32(float(levels[count//2])*1.414214)
    noise_power=native_strength_energy(noise)
    for index in range(task_start,stop):
        records=frame_records[index];position=0
        while position<len(records):
            record=records[position];frequency=_f(record,0);strength=_f(record,0xCC)
            if frequency!=0.0 and strength!=0.0 and _hum_distance(frequency)<5.0:
                remaining=f32(native_strength_energy(strength)-noise_power)
                updated=native_energy_strength(remaining)
                struct.pack_into('<f',record,0xCC,updated)
                if updated<62.0:del records[position];continue
            position+=1
