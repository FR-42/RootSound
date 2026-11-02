"""334d50 classified0xf8 groups -> real0x3c18 nonharmonic candidates.

The two identities are distinct:group0xd8 is350e40's retained event identity,
while the later31d960 owner assigns trajectory groups. Raw type bytes0x7e,
2,0x10..0x12 and0x40 are preserved without inventing instrument labels.
Source:noise/direct-334d50.asm, constants in native-noise-static-constants.json.
"""
from dataclasses import dataclass
import math
import struct

from native_harmonic_fields import f32
from native_background import NativeBackgroundGrid


def _f(data,offset):return struct.unpack_from('<f',data,offset)[0]
def _put(data,offset,value):struct.pack_into('<f',data,offset,f32(value))


@dataclass(frozen=True)
class NativeNoiseCandidateResult:
    candidates:tuple[bytes,...]
    consumed_records:bytes
    selector:int
    capacity_reached:bool


def _types(selector,mode_14,flag_92):
    if selector==0:return (0x7e,2,0x12) if mode_14==0 else (0x7e,2)
    if selector==1:return (0x10,0x11)
    if flag_92:return (0x40,)
    return (0x11,0x12) if mode_14==0 else (0x11,0x40)


def native_noise_candidates(packed_records,grids,*,selector,channel_mode,mode_14=0,flag_92=False):
    """334d50 consumes one explicit group slot in source/grid/type order.

    Group identity0xffffffff is the native consumed sentinel. Source records
    are copied before those writes so a caller can retain the pre-consumption
    history exactly as32e4b0 does. Capacity is the native96 candidates and48
    selected records per candidate; unexamined records retain their IDs.
    """
    if not isinstance(packed_records,bytes) or len(packed_records)%0xf8 or len(packed_records)//0xf8>0x1d0:
        raise ValueError('Actual packed0xf8 frame records required')
    if type(selector) is not int or not 0<=selector<8 or channel_mode not in (1,2,3) or type(mode_14) is not int:
        raise ValueError('Native group selector/channel mode required')
    grids=tuple(grids)
    if any(not isinstance(grid,NativeBackgroundGrid) for grid in grids) or any(not 1<=grid.count<=48 for grid in grids):
        raise ValueError('Actual <=48-slot native background grids required')
    source=bytearray(packed_records);candidates=[];capacity=False
    for grid in grids:
        if len(candidates)==96:capacity=True;break
        for kind in _types(selector,mode_14,flag_92):
            while len(candidates)<96:
                records=[];identity=None;aggregate=0.0;valid=0
                for offset in range(0,len(source),0xf8):
                    center=_f(source,offset)
                    if center<f32(grid.lower-f32(.001)) or not center<f32(grid.upper-f32(.001)):continue
                    if source[offset+0xd0+selector]!=kind:continue
                    group=struct.unpack_from('<I',source,offset+0xd8+selector*4)[0]
                    if group==0xffffffff or (identity is not None and group!=identity):continue
                    if identity is None:identity=group
                    struct.pack_into('<I',source,offset+0xd8+selector*4,0xffffffff)
                    if len(records)>=48:break
                    aggregate=f32(aggregate+_f(source,offset+8));records.append(offset)
                    strength=_f(source,offset+0x14+selector*0x18)
                    if channel_mode!=1:strength=f32(float(f32(strength+_f(source,offset+0x18+selector*0x18)))*.5)
                    if strength>=.5:valid+=1
                if not valid:break
                candidate=bytearray(0x3c18)
                _put(candidate,0,grid.frequency(1));_put(candidate,8,aggregate)
                candidate[0xc]=kind;candidate[0xe:0x10]=source[records[0]+0xce:records[0]+0xd0]
                struct.pack_into('<I',candidate,0x10,identity)
                for rank in range(grid.count):
                    frequency=grid.frequency(rank+1)
                    _put(candidate,0xd8+rank*0x13c,frequency);_put(candidate,0x20c+rank*0x13c,frequency)
                step=f32(f32(grid.upper-grid.lower)/f32(grid.count))
                for offset in records:
                    if step==0:raise ValueError('Native background grid has zero interval')
                    ordinal=int(f32(f32(f32(_f(source,offset)-grid.lower)/step)+1.5))
                    if not 1<=ordinal<=48:continue
                    delta=(ordinal-1)*0x13c
                    candidate[0x1a4+delta:0x1a8+delta]=source[offset+8:offset+12]
                    candidate[0x1cb+delta]=0
                    candidate[0xd8+delta:0xdc+delta]=source[offset:offset+4]
                    candidate[0x1fc+delta:0x214+delta]=source[offset+0xc:offset+0x24]
                    group_offset=offset+selector*0x18
                    candidate[0x204+delta:0x20c+delta]=source[group_offset+0x14:group_offset+0x1c]
                    candidate[0x1c8+delta:0x1ca+delta]=source[offset+0xce:offset+0xd0]
                candidates.append(bytes(candidate))
            if len(candidates)==96:capacity=True;break
    return NativeNoiseCandidateResult(tuple(candidates),bytes(source),selector,capacity)
