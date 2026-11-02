"""Native0xf8 background table ownership and347db0/32c3e0 queries.

Normal flag92=false is a recovered empty production path, not a fallback:
343da0 clears count table atctx+5a0;335480 calls347170 with mode1;347170
sets both frequency bounds to0 and returns without generating records. Its
347db0 consumer independently rejects every positive query under that flag.
Specialized flag92 tables must contain actual347170-produced record bytes.
"""
import math
import struct
from dataclasses import dataclass
from native_minimum_frames import f32


def _f(data,offset):return struct.unpack_from('<f',data,offset)[0]


@dataclass(frozen=True)
class NativeBackgroundGrid:
    kind: int
    lower: float
    upper: float
    count: int

    def frequency(self,ordinal):
        """3198c0 exact float32 subtract/divide/multiply/add sequence."""
        if self.kind<0xc0 or type(ordinal) is not int or ordinal<1:return 0.0
        value=f32(f32(_divide_grid(f32(self.upper-self.lower),f32(self.count))*f32(ordinal-1))+self.lower)
        return value if value<self.upper else 0.0


def _divide_grid(left,right):
    if right==0:raise ValueError('Native grid count cannot be zero')
    return f32(left/right)


def native_background_grids(sample_rate,hop,*,reduced_harmonics_989f11=False):
    """31f5a0's actual989f20 grid, including the1500/3200 first boundaries.

    Returns(grid_records,989fe0 bandwidth). The actual clock is provided by
    its owning native initializer; no conventional FFT grid is substituted.
    """
    if type(sample_rate) is not int or type(hop) is not int or min(sample_rate,hop)<=0:
        raise ValueError('Actual native positive source clock required')
    bandwidth=f32(f32(sample_rate)/f32(hop*2))
    lower=f32(f32(bandwidth*.5)+0.0)
    upper_limit=f32((16000.0 if reduced_harmonics_989f11 else 20000.0)-f32(bandwidth*.5))
    grids=[]
    for index in range(64):
        upper=1500.0 if index==0 else 3200.0 if index==1 else min(upper_limit,f32(f32(bandwidth*48.0)+lower))
        #31f7fa promotes the rounded quotient, then ADDSD .5001.
        count=min(48,int(float(_divide_grid(f32(upper-lower),bandwidth))+.5001))
        if count<1:break
        upper=f32(f32(f32(count)*bandwidth)+lower)
        grids.append(NativeBackgroundGrid(0xc0+index,lower,upper,count))
        lower=upper
        if not lower<f32(upper_limit-f32(.001)):break
    else:raise ValueError('Native background grid exceeds its owned type-byte range')
    return tuple(grids),bandwidth


class NativeBackgroundCache:
    def __init__(self, *, first_frame, task_end_frame, context_bc, bias_989fe4=0,
                 flag_92=False, channel_mode=1, bandwidth_989fe0=None,
                 records_by_frame=None, minimum_frequency=21.0, context_24=None):
        if any(type(x) is not int for x in (first_frame,task_end_frame,context_bc,bias_989fe4)):
            raise ValueError('Actual native background frame geometry required')
        if context_bc<0 or bias_989fe4<0 or task_end_frame<first_frame or channel_mode not in (1,2,3):
            raise ValueError('Invalid native background geometry/channel mode')
        if flag_92 and records_by_frame is None:
            raise NotImplementedError('flag92 background production requires actual347170-generated0xf8 records')
        if records_by_frame is not None:
            for index,packed in records_by_frame.items():
                if type(index) is not int or not isinstance(packed,bytes) or len(packed)%0xf8:
                    raise ValueError('Actual indexed packed0xf8 background records required')
                if len(packed)//0xf8>0x1d0:raise ValueError('Native background frame exceeds464-record capacity')
        self.first=first_frame;self.end=task_end_frame;self.context_bc=context_bc;self.bias=bias_989fe4
        if context_24 is not None and (type(context_24) is not int or context_24<0):
            raise ValueError('Actual nonnegative native context24 required')
        self.context_24=context_24
        self.flag_92=bool(flag_92);self.channel_mode=channel_mode
        self.bandwidth=None if bandwidth_989fe0 is None else f32(bandwidth_989fe0)
        self.minimum=f32(minimum_frequency);self.records=records_by_frame
        self.production=('actual-retained347170-0xf8-records' if records_by_frame is not None else
                         '343da0-zero-counts/347170-mode1-normal-early-return')

    def packed(self,index):
        if not self.first-self.bias<=index<self.end+self.context_bc:return b''
        if self.records is None:return b''
        if index not in self.records:raise ValueError('Native background cache lacks a required actual frame')
        return self.records[index]

    def lookup(self,frame,frequency,channel=0,selector=0xff,flags=0):
        """347db0 exact source fields:channel=param5,selector=mask6,flags=type7.

        This query may take at most the one requested frame. A stored positive
        component is converted to linear power before summing selected groups;
        the maximum neighborhood record is converted back using native exponents.
        """
        frequency=f32(frequency)
        if type(frame) is not int or not math.isfinite(frequency):raise ValueError('Actual native frame/frequency required')
        if any(type(x) is not int or not 0<=x<=255 for x in (channel,selector,flags)):
            raise ValueError('Native query channel/mask/type must be bytes')
        lower=self.minimum if self.flag_92 else 0.0;upper=24000.0 if self.flag_92 else 0.0
        if frequency<lower or upper<frequency:return 0.0
        packed=self.packed(frame)
        if not packed:return 0.0
        if self.bandwidth is None:raise ValueError('Actual989fe0 bandwidth required for nonempty background query')
        maximum=0.0;half=float(self.bandwidth)/1.9
        for offset in range(0,len(packed),0xf8):
            center=_f(packed,offset)
            if frequency>float(center)+half:continue
            if frequency<float(center)-half:break
            total=0.0
            for group in range(8):
                if not (selector>>group)&1 or (flags and packed[offset+0xd0+group]!=flags):continue
                base=offset+0x14+group*0x18
                if 1<=channel<=254:
                    # Valid native selectors are1/2; larger values would read
                    # outside their owned six-float group and are not invented.
                    if channel>6:raise ValueError('Native channel selector exceeds owned component slots')
                    strength=_f(packed,base+(channel-1)*4)
                else:
                    strength=_f(packed,base) if self.channel_mode==1 else f32(f32(_f(packed,base)+_f(packed,base+4))*.5)
                power=f32(f32(math.pow(float(strength)/32767.0,1.6609640475208238))*32767.0) if strength>0 else 0.0
                total=f32(total+power)
            maximum=max(maximum,total)
        return f32(f32(math.pow(float(maximum)/32767.0,.6020599913))*32767.0) if maximum>0 else 0.0

    def gap_background(self,frame,frequency):
        """32c3e0 (also inlined in340630): nearest left/right minimum envelope."""
        if self.context_24 is None:raise ValueError('Actual native context24 required for gap query')
        local=frame-self.first
        if not 0<=local<self.context_bc+self.context_24:
            return 0.0
        packed=self.packed(frame)
        if not packed:return 0.0
        if self.bandwidth is None:raise ValueError('Actual989fe0 bandwidth required for nonempty gap background')
        left=right=-1.0;wide=f32(self.bandwidth*1.5);narrow=f32(self.bandwidth*.75)
        for offset in range(0,len(packed),0xf8):
            center=_f(packed,offset)
            if frequency<f32(center-wide):break
            if frequency<=f32(center+wide):
                strength=_f(packed,offset+8)
                if f32(center-narrow)<frequency and (left==-1 or strength<left):left=strength
                if frequency<f32(center+narrow) and (right==-1 or strength<right):right=strength
        return max(left,right)

