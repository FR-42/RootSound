"""Owned native0x38 event records used by34d770/34c5a0/34df10.

The three original pointers are represented by owned Python vectors. The
metadata retains every non-pointer source byte and its exact offsets; callers
must never reinterpret display labels as the event kind or retained identity.
"""
from dataclasses import dataclass,field
import math
import struct

from native_harmonic_fields import f32


@dataclass
class NativeNoiseEvent:
    metadata:bytearray=field(default_factory=lambda:bytearray(0x38))
    samples:list|None=None
    baseline:list|None=None
    tail_baseline:list|None=None
    columns:int=0
    first_frame:int=0
    last_frame:int=-1

    def __post_init__(self):
        if len(self.metadata)!=0x38:raise ValueError('Native event metadata must contain0x38 bytes')
        self.metadata=bytearray(self.metadata)
        #Native offsets00,08,28 are resource pointers, represented by the
        #three vector owners above. Addresses have no portable identity.
        self.metadata[0:16]=bytes(16);self.metadata[0x28:0x30]=bytes(8)

    def h(self,offset):return struct.unpack_from('<H',self.metadata,offset)[0]
    def set_h(self,offset,value):struct.pack_into('<H',self.metadata,offset,int(value)&0xffff)
    def f(self,offset):return struct.unpack_from('<f',self.metadata,offset)[0]
    def set_f(self,offset,value):struct.pack_into('<f',self.metadata,offset,f32(value))
    def u(self,offset):return struct.unpack_from('<I',self.metadata,offset)[0]
    def set_u(self,offset,value):struct.pack_into('<I',self.metadata,offset,int(value)&0xffffffff)
    @property
    def kind(self):return self.metadata[0x20]
    @kind.setter
    def kind(self,value):self.metadata[0x20]=int(value)&255
    @property
    def identity(self):return self.u(0x30)
    @identity.setter
    def identity(self,value):self.set_u(0x30,value)
    @property
    def lower(self):return self.h(0x10)
    @lower.setter
    def lower(self,value):self.set_h(0x10,value)
    @property
    def upper(self):return self.h(0x12)
    @upper.setter
    def upper(self,value):self.set_h(0x12,value)
    @property
    def start(self):return self.h(0x14)
    @start.setter
    def start(self,value):self.set_h(0x14,value)
    @property
    def end(self):return self.h(0x16)
    @end.setter
    def end(self,value):self.set_h(0x16,value)
    @property
    def peak(self):return self.h(0x18)
    @peak.setter
    def peak(self,value):self.set_h(0x18,value)
    @property
    def seed(self):return self.h(0x1a)
    @seed.setter
    def seed(self,value):self.set_h(0x1a,value)
    @property
    def score(self):return self.f(0x1c)
    @score.setter
    def score(self,value):self.set_f(0x1c,value)

    def position(self,frame,bucket):
        if type(frame) is not int or type(bucket) is not int or not self.first_frame<=frame<=self.last_frame or not 0<=bucket<self.columns:
            raise IndexError('Native event energy lookup exceeds its owned task span')
        return (frame-self.first_frame)*self.columns+bucket
    def sample(self,frame,bucket):
        if self.samples is None:raise ValueError('Native event has no current task energy allocation')
        return self.samples[self.position(frame,bucket)]
    def set_sample(self,frame,bucket,value):
        if self.samples is None:raise ValueError('Native event has no current task energy allocation')
        self.samples[self.position(frame,bucket)]=f32(value)
    def clone(self,*,include_samples=True,include_baseline=True):
        return NativeNoiseEvent(bytearray(self.metadata),None if self.samples is None or not include_samples else list(self.samples),
            None if self.baseline is None or not include_baseline else list(self.baseline),
            None if self.tail_baseline is None else list(self.tail_baseline),
            self.columns,self.first_frame,self.last_frame)
    def clear(self):
        self.metadata[:]=bytes(0x38);self.samples=None;self.baseline=None;self.tail_baseline=None


@dataclass(frozen=True)
class NativeNoiseSpan:
    seed:int
    lower:int
    upper:int
    score:float


def native_db_ratio(value):
    """2a0d40/351660/3516c0 finite signed dB helper source values."""
    values={0:1.0,5:1.7782794,10:3.1622777,15:5.623413,20:10.0,
        -60:.001,-55:.0017782794,-50:.0031622776,-45:.0056234132,
        -40:.01,-35:.017782794,-30:.031622775,-25:.056234132,-20:.1,
        -15:.17782794,-10:.31622776,-5:.56234133,7:2.2387211,14:5.0118723,
        -2:.7943282,-1:.8912509,3:1.4125376,6:1.9952623,9:2.818383,
        12:3.9810717,30:31.622776,40:100.0}
    if type(value) is not int:raise TypeError('Native dB helper takes a signed integer')
    return f32(values[value] if value in values else math.pow(10.0,float(value)/20.0))
