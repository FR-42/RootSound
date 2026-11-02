"""321770 selected-candidate record construction and amplitude representation.

This owns the actual0x3c18 layout, distinct from324770's0xd94 raw pool.
The append constructor implements321770's final param7-enabled branch.
Its pre-existing-candidate energy redistribution is applied separately by
the selection owner; append alone is not advertised as full registration.
"""
import math
import struct
from native_spectral import f32


def native_strength_energy(value):
    value=f32(value)
    return f32(f32(math.pow(float(value)/32767.,1.6609640475208238))*f32(32767)) if value>0 else 0.


def native_energy_strength(value):
    value=f32(value)
    return f32(f32(math.pow(float(value)/32767.,.6020599913))*f32(32767)) if value>0 else 0.


def native_selected_candidate_record(raw_record,confidence):
    """Exact321770 new-record writes, accepting an actual0xd94 raw record."""
    if len(raw_record)!=0xd94:
        raise ValueError('Native raw candidate must be exactly0xd94 bytes')
    if not isinstance(confidence,int) or not 0<=confidence<=255:
        raise ValueError('Actual332410 decision-confidence byte required')
    result=bytearray(0x3c18)
    f0,stretch=struct.unpack_from('<ff',raw_record,0)
    if not math.isfinite(f0) or f0<=0 or not math.isfinite(stretch):
        raise ValueError('Native selected candidate requires finite fitted f0/stretch')
    balance,=struct.unpack_from('<h',raw_record,0xd90)
    struct.pack_into('<ff',result,0,f0,stretch)
    result[0xc]=1
    struct.pack_into('<h',result,0xe,balance)
    result[0x14]=raw_record[0xd8c]
    result[0x15]=confidence
    result[0x18:0xd8]=raw_record[0xccc:0xd8c]
    aggregate=0.
    for index in range(48):
        raw=0xc+index*0x20
        selected=0xd8+index*0x13c
        n=f32(index+1)
        frequency=f32(n*f0)
        if stretch>0:
            factor=f32(f32(f32(f32(n*n)-f32(1))*stretch)+f32(1))
            frequency=f32(factor*frequency)
        weight,pitch=struct.unpack_from('<ff',raw_record,raw+8)
        observed_index,=struct.unpack_from('<i',raw_record,raw)
        struct.pack_into('<ff',result,selected,frequency,pitch)
        struct.pack_into('<f',result,selected+0xcc,weight)
        struct.pack_into('<8i',result,selected+0xd0,observed_index,-1,-1,-1,-1,-1,-1,-1)
        struct.pack_into('<h',result,selected+0xf0,balance)
        result[selected+0xf2]=1
        aggregate=native_energy_strength(f32(native_strength_energy(aggregate)+native_strength_energy(weight)))
    struct.pack_into('<f',result,8,aggregate)
    return bytes(result)


def candidate_strength(record):
    if len(record)!=0x3c18:raise ValueError('Invalid native selected-candidate record')
    return struct.unpack_from('<f',record,8)[0]
