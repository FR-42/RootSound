"""31e930's real rolling snapshots and31fdf0 native lookback matching.

The history is produced only from registered type1 candidates whose actual
confidence exceeds1. It never manufactures confidence for a fresh frame.
Source:pitch-analysis-driver.c and whole-31fdf0-direct.asm.
"""
import math
import struct
from native_spectral import f32


def _f(record,offset):return struct.unpack_from('<f',record,offset)[0]


class NativeSelectionHistory:
    def __init__(self,analysis_rate):
        if not math.isfinite(analysis_rate) or analysis_rate<=0:
            raise ValueError('Actual native analysis rate is required')
        self.analysis_rate=f32(analysis_rate)
        self.capacity=max(1,int(f32(f32(self.analysis_rate*f32(.2))+f32(.5))))
        self.metadata_horizon=max(1,int(f32(f32(self.analysis_rate*f32(.1))+f32(.5))))
        self.rows=[tuple() for _ in range(self.capacity)]

    def retain_for_next_task(self,context_bc):
        """32dc40 excludes already examined lookahead before next task."""
        if not isinstance(context_bc,int) or context_bc<0:raise ValueError('Native context+bc must be a nonnegative frame count')
        old=tuple(self.rows)
        self.rows[:]=[old[index+context_bc] if index+context_bc<self.capacity else tuple() for index in range(self.capacity)]

    def advance(self,selected_records):
        """31e930 shifts old rows, saving only true confident type1 records."""
        snapshots=[]
        for selected in selected_records:
            if len(selected)!=0x3c18:raise ValueError('Native selected records must be0x3c18 bytes')
            if selected[0xc]!=1 or selected[0x15]<=1:continue
            snapshot=bytearray(0x190)
            snapshot[0:4]=selected[0:4]
            snapshot[4:8]=selected[8:12]
            snapshot[8:12]=selected[4:8]
            snapshot[0xc:0xe]=selected[0xe:0x10]
            snapshot[0xe]=selected[0xc]
            for harmonic in range(48):
                at=0xd8+harmonic*0x13c
                snapshot[0x10+harmonic*8:0x14+harmonic*8]=selected[at+0xcc:at+0xd0]
                snapshot[0x14+harmonic*8:0x18+harmonic*8]=selected[at+4:at+8]
            snapshots.append(bytes(snapshot))
        if len(snapshots)>96:raise ValueError('Original history storage holds96 snapshots per frame')
        self.rows[:]=[tuple(snapshots)]+self.rows[:self.capacity-1]

    def observe(self,raw_record,*,produce_metadata=False,requested_rows=None,pitch_tolerance=0.):
        """31fdf0 positive/zero-request path; returns(age gate,48floats)."""
        if len(raw_record)!=0xd94:raise ValueError('Native raw record must be0xd94 bytes')
        requested=self.capacity if requested_rows is None else requested_rows
        if not isinstance(requested,int) or requested<0:raise ValueError('Nonnegative native lookback request required')
        limit=min(self.capacity,requested if requested else self.metadata_horizon)
        frequency,pitch=_f(raw_record,0),_f(raw_record,0x18)
        balance=struct.unpack_from('<h',raw_record,0xd90)[0]
        result=[0.]*48;returned=misses=last_miss=age=0
        if frequency==0:return 0,tuple(result)
        tolerance=f32(pitch_tolerance) if pitch_tolerance else f32(.75)
        while age<limit:
            if misses and age-last_miss>=4:
                misses-=1;last_miss=age
            nearest=None;distance=f32(-1)
            for candidate in self.rows[age]:
                if candidate[0xe]!=1:continue
                other_balance=struct.unpack_from('<h',candidate,0xc)[0]
                if abs(balance-other_balance)>0x7000:continue
                delta=abs(f32(_f(candidate,0)-frequency))
                if nearest is None or delta<distance:nearest,distance=candidate,delta
            matched=False
            if nearest is not None:
                other_pitch,other_frequency=_f(nearest,0x14),_f(nearest,0)
                if pitch<other_pitch:
                    delta_pitch=f32(other_pitch-pitch);delta_frequency=f32(other_frequency-frequency)
                else:
                    delta_pitch=f32(pitch-other_pitch);delta_frequency=f32(frequency-other_frequency)
                matched=tolerance>delta_pitch or f32(6)>delta_frequency
            if matched:
                if pitch_tolerance==0:
                    frequency,pitch=other_frequency,other_pitch
                balance=struct.unpack_from('<h',nearest,0xc)[0]
                returned=age+1
                if produce_metadata and (requested==0 or age<1):
                    multiplier=f32(math.pow(.99,age)) if requested==0 else f32(1)
                    for harmonic in range(raw_record[0xd92]):
                        result[harmonic]=max(result[harmonic],f32(multiplier*_f(nearest,0x10+harmonic*8)))
            else:
                maximum_misses=2 if pitch_tolerance<=0 and age else 1
                misses+=1
                if misses>=maximum_misses:break
                last_miss=age
            age+=1
        return returned&0xff,tuple(result)

    def initialize_raw(self,raw_record):
        """3312a0 fresh-D8C calls:first age gate, then metadata horizon."""
        result=bytearray(raw_record)
        if result[0xd93]&1 and result[0xd8c]==0xff:
            result[0xd8c]=self.observe(result,requested_rows=self.capacity)[0]
            _,metadata=self.observe(result,produce_metadata=True,requested_rows=0)
            for harmonic,value in enumerate(metadata):
                struct.pack_into('<f',result,0xccc+harmonic*4,value)
        return bytes(result)
