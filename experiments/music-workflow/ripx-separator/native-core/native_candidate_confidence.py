"""321220 selected-candidate ceiling, translated from original SSE assembly.

Reads actual0xd94 raw and0x3c18 selected records. All48 harmonic slots are
visited in their original order with float32 multiplication/addition. This
is the recovered native gate, not a generic confidence-score substitute.
Source:whole-321220-direct.asm140321220..140321766 and
selector-constants-direct.json; source-only, no audio/runtime verification.
"""
import math
import struct
from native_spectral import f32


def _f(data,offset):return struct.unpack_from('<f',data,offset)[0]


def native_candidate_ceiling(raw_d94,selected_records,*,flag_92=False,flag_93=False):
    """Return321220's original scalar gate (including its early32 branch)."""
    if len(raw_d94)!=0xD94 or any(len(record)!=0x3C18 for record in selected_records):
        raise ValueError('Actual native0xd94 raw and0x3c18 selected records required')
    if type(flag_92) is not bool or type(flag_93) is not bool:
        raise ValueError('Native context flags must be explicit booleans')
    if len(selected_records)>0xFFFF:raise ValueError('Native selected count is a ushort')
    if raw_d94[0xD8C]>=3:return 32.0
    pitch=_f(raw_d94,0x18)
    if not math.isfinite(pitch):raise ValueError('Native raw pitch must be finite')
    low_boundary=f32(pitch-f32(.6666666865348816))
    total=low_total=low_maximum=0.0
    for record in selected_records:
        selected_pitch=_f(record,0xDC)
        if not math.isfinite(selected_pitch):raise ValueError('Native selected pitch must be finite')
        summed=0.0
        for harmonic in range(48):
            metadata=_f(record,0x18+harmonic*4)
            strength=_f(record,0x1A4+harmonic*0x13C)
            if not math.isfinite(metadata) or not math.isfinite(strength):raise ValueError('Native harmonic fields must be finite')
            value=max(f32(metadata*.5),strength)
            summed=f32(summed+value)
        if selected_pitch<low_boundary:
            low_total=f32(low_total+summed)
            if flag_92 or flag_93:low_maximum=max(low_maximum,f32(summed*.25))
        total=f32(total+summed)
    lower=max(f32(low_total*f32(.07000000029802322)),low_maximum)
    #Native loads a double then converts it tofloat before multiplying.
    scaled=f32(f32(.055 if flag_92 else .06)*total)
    return max(100.0,scaled,lower)
