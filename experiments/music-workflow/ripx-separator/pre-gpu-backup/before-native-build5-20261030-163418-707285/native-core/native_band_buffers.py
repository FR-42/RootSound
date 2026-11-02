"""31bde0/328210 native frequency-band buffers and3293f0 prepared-source owner.

Band records and their complex responses come from the recovered native band
initializer. There is no generic filter, resampler or raw-PCM band substitute.
The source PCM already includes the owning native task's explicit context.
"""
from dataclasses import dataclass
import math
import struct

from native_harmonic_fields import f32
from native_pcm_estimate import NativePreparedPCM
from native_fft import forward_real
from native_inverse_fft import inverse_real as native_inverse_real
from native_pcm_component import add_component_inplace


def _native_lowpass(order,sample_rate,cutoff):
    """3276c0's scalar Blackman-windowed sinc and original sum normalization."""
    omega=(float(cutoff)/float(sample_rate))*6.283185307179586
    middle=order//2;values=[];summed=0.0
    for index in range(order+1):
        if index==middle:value=omega
        else:
            distance=float(index)-float(middle)
            value=math.sin(omega*distance)/distance
            window=(.42-math.cos(float(index)*6.283185307179586/float(order))*.5)
            window=window+math.cos(float(index)*12.566370614359172/float(order))*.08
            value=window*value
        values.append(value);summed=summed+value
    if summed==0:raise ValueError('Degenerate native FIR normalization')
    return [value/summed for value in values]


def _native_filter_response(sample_rate,lower,upper):
    """3276c0 +327f60: actual257 taps, zero-pad512, recovered native FFT."""
    taps=[0.0]*257 if float(sample_rate)*.5<=upper else _native_lowpass(256,sample_rate,upper)
    if lower!=0:
        lower_taps=_native_lowpass(256,sample_rate,lower)
        lower_taps=[-value for value in lower_taps];lower_taps[128]+=1.0
        taps=[lower_taps[i]+taps[i] for i in range(257)]
        if float(sample_rate)*.5>upper:
            taps=[-value for value in taps];taps[128]+=1.0
    positive=forward_real(taps+[0.0]*255)
    response=tuple(list(positive)+[positive[512-index].conjugate() for index in range(257,512)])
    actual_lower=lower
    if lower!=0:
        for index in range(1,256):
            value=response[index]
            if math.sqrt(value.real*value.real+value.imag*value.imag)>=.9999:
                actual_lower=f32(f32(f32(index-1)*f32(sample_rate))*.001953125);break
        else:actual_lower=upper
    actual_upper=actual_lower
    for index in range(255,0,-1):
        value=response[index]
        if math.sqrt(value.real*value.real+value.imag*value.imag)>=.9999:
            actual_upper=f32(f32(f32(sample_rate)*f32(index))*.001953125);break
    return response,actual_lower,actual_upper


def native_band_records(sample_rate,hop,context_samples,*,reduced_bandwidth=False):
    """31f5a0 triples ->318290/328690 four original0x40 records.

    reduced_bandwidth corresponds to the source global989f11; its UI meaning
    is deliberately not invented. The normal zero-global branch uses20000 Hz.
    """
    if any(type(value) is not int or value<=0 for value in (sample_rate,hop,context_samples)):
        raise ValueError('Explicit positive native source clock/context required')
    cutoff_limit=16000 if reduced_bandwidth else 20000
    half=sample_rate//2;guard=sample_rate//40;stride=1
    available=half-guard
    while cutoff_limit*2<=available:
        stride*=2;available=half//stride-guard
    records=[]
    for index in range(4):
        factor=stride*(1<<index)
        lower=sample_rate//4//factor-guard if index<3 else 0
        if lower<1:lower=0
        upper=half//factor
        lower,upper=f32(lower),f32(upper)
        response,adjusted_lower,adjusted_upper=_native_filter_response(sample_rate,lower,upper)
        def clock(divisor):
            return NativeBandClock(f32(f32(sample_rate)/f32(divisor)),divisor,
                                   hop//divisor,int(f32(f32(256)/f32(divisor))),
                                   context_samples//divisor)
        records.append(NativeBandRecord(adjusted_lower,adjusted_upper,lower,upper,
                                        clock(factor),clock(1),response))
    return tuple(records)


def native_band_processing_range(sample_rate,hop,*,context_24,context_28,context_bc,
                                 task_start_frame,task_end_frame,last_band_stride,
                                 flag_91=False,minimum_frequency=21.0):
    """31bde0's exact source processing span, before per-channel filtering."""
    fs=f32(sample_rate);minimum=f32(minimum_frequency)
    if minimum==0:span=0
    else:
        span=max(int(float(fs)*.035+.5001),int((float(fs)*40.0)/float(minimum)+.5001))
        multiplier=f32(2.0 if flag_91 else 1.0)
        ceiling=min((context_28*2+1)*hop,int(float(f32(fs*multiplier))*.15+.5001))
        span=min(span,ceiling)
    first=max(0,hop//2-span//2+task_start_frame*hop)
    total=context_24+context_28*2
    last=max(0,hop//2-span//2+(context_bc+task_end_frame)*hop)
    last=min(last+span,total*hop)
    last=(hop-1+last)//hop
    last=min(last,total)
    first=first//hop
    first-=first%last_band_stride
    last=last_band_stride-(last_band_stride-1+last)%last_band_stride-1+last
    return max(0,first)*hop,min(total,last)*hop


@dataclass(frozen=True)
class NativeBandClock:
    sample_rate: float
    stride: int
    hop: int
    radius: int
    buffer_samples: int


@dataclass(frozen=True)
class NativeBandRecord:
    field_00: float
    upper_frequency_04: float
    lower_08: float
    upper_0c: float
    primary: NativeBandClock
    alternate: NativeBandClock
    response: tuple[complex, ...]

    @classmethod
    def from_record_bytes(cls, record, response):
        if len(record) != 0x40 or len(response) != 512:
            raise ValueError('Native band requires one0x40 record and512 complex response values')
        fields=struct.unpack_from('<ffff',record)
        rates=struct.unpack_from('<ff',record,0x10)
        strides=struct.unpack_from('<II',record,0x18)
        hops=struct.unpack_from('<II',record,0x20)
        radii=struct.unpack_from('<II',record,0x28)
        lengths=struct.unpack_from('<II',record,0x30)
        clocks=tuple(NativeBandClock(rates[i],strides[i],hops[i],radii[i],lengths[i]) for i in range(2))
        coefficients=tuple(complex(value) for value in response)
        if any(not math.isfinite(v.real) or not math.isfinite(v.imag) for v in coefficients):
            raise ValueError('Native complex response must be finite')
        return cls(*fields,*clocks,coefficients)


class _WeightedPCMView:
    """Own only328860's prepared interval while retaining native indices."""
    def __init__(self,total_samples,first,values):
        self.total=total_samples;self.first=first;self.values=tuple(values)
    def __len__(self):return self.total
    def __getitem__(self,index):
        if type(index) is not int or not self.first<=index<self.first+len(self.values):
            raise IndexError('Read outside the native prepared-weight interval')
        return self.values[index-self.first]


class NativeBandBuffers:
    """Own raw, filtered and complementary buffers from31bde0.

    processing_begin/end are the actual31bde0 source sample interval. The
    upstream task initializer owns selecting that interval and context padding.
    inverse_real is the recovered3266c0 wrapper (inverse transform then /N).
    No codec, file, model or external application is opened here.
    """
    def __init__(self,pcm_channels,bands,*,sample_rate,hop,processing_begin,processing_end,
                 bandwidth_989fe0,inverse_real=native_inverse_real,window_lookup_989ff0=None):
        if type(sample_rate) is not int or sample_rate <= 0 or type(hop) is not int or hop <= 0:
            raise ValueError('Explicit native source clock required')
        if not pcm_channels or len(pcm_channels)>3 or len(bands) not in (1,4):
            raise ValueError('Recovered native buffers require1..3 channels and1 or4 bands')
        if any(not isinstance(record,NativeBandRecord) for record in bands) or not callable(inverse_real):
            raise TypeError('Native band records and recovered inverse FFT are required')
        if not math.isfinite(bandwidth_989fe0) or bandwidth_989fe0 < 0:
            raise ValueError('Explicit native frequency-bandwidth scalar required')
        self.sample_rate=sample_rate;self.hop=hop;self.bands=tuple(bands)
        self.bandwidth_989fe0=f32(bandwidth_989fe0)
        self.upper_frequencies=tuple(record.upper_frequency_04 for record in bands)
        self.window_lookup_989ff0=None if window_lookup_989ff0 is None else tuple(map(f32,window_lookup_989ff0))
        self.raw_channels=tuple(pcm_channels)
        self.channels=[]
        for source in pcm_channels:
            if not 0<=processing_begin<=processing_end<=len(source):
                raise ValueError('Native task processing interval exceeds its context PCM')
            slots=[source]
            for record in bands:
                if record.primary.stride<1 or record.primary.buffer_samples<1 or record.primary.radius*2>512:
                    raise ValueError('Native primary band geometry is unsupported')
                slots.append([0.0]*record.primary.buffer_samples)
            for record in bands:
                slots.append([0.0]*record.alternate.buffer_samples)
            slots[len(bands)+1][:]=[f32(source[i]) for i in range(bands[0].alternate.buffer_samples)]
            if len(bands)==1:
                count=bands[0].primary.buffer_samples
                slots[1][:]=[f32(source[i]) for i in range(count)]
                #31bde0's single-band fast branch copies the primary count.
                slots[2][:count]=[f32(source[i]) for i in range(count)]
            else:
                if bands[0].field_00==0:
                    count=bands[0].primary.buffer_samples
                    slots[1][:]=[f32(source[i]) for i in range(count)]
                for start in range(processing_begin,processing_end,256):
                    if start+256>len(source):
                        raise ValueError('Native task lacks the required preceding/following PCM context')
                    block=[float(f32(source[start+i])) for i in range(256)]+[0.0]*256
                    positive=forward_real(block)
                    spectrum=list(positive)+[positive[512-index].conjugate() for index in range(257,512)]
                    for band_index,record in enumerate(bands):
                        if band_index==0 and record.field_00==0:continue
                        #328210 separate double mul/add/sub; no FMA contraction.
                        filtered=[]
                        for value,response in zip(spectrum,record.response):
                            filtered.append(complex(value.real*response.real-value.imag*response.imag,
                                                    value.real*response.imag+value.imag*response.real))
                        temporal=inverse_real(filtered)
                        if len(temporal)!=512:raise ValueError('Native inverse must return512 real doubles')
                        clock=record.primary
                        sign=-1.0 if record.lower_08>0 and record.upper_0c<sample_rate*.5 else 1.0
                        shift=start//clock.stride-clock.radius//2
                        first=max(0,-shift)
                        target=slots[band_index+1]
                        for index in range(first,clock.radius*2):
                            destination=index+shift
                            if destination>=clock.buffer_samples:break
                            sample=index*clock.stride
                            if sample>=len(temporal):raise ValueError('Native decimation indexes exceed inverse block')
                            target[destination]=f32(sign*float(temporal[sample])+float(target[destination]))
            self.channels.append(tuple(slots))
        self.channels=tuple(self.channels)

    def prepare(self,channel,band_index,begin,end,energy_begin,energy_end,frame_index,*,preweighted=False):
        """3293f0 +328860 actual source lookup and energy preparation.

        band_index=-1 explicitly selects raw. Nonnegative indices select their
        real native slot; they never fall back to raw if a response is missing.
        The complement index len(bands) uses the first record's alternate clock.
        """
        if type(channel) is not int or not 0<=channel<len(self.channels):
            raise ValueError('Invalid native analysis channel')
        if type(band_index) is not int or not -1<=band_index<=len(self.bands):
            raise ValueError('Invalid native frequency-band index')
        if any(type(x) is not int for x in (begin,end,energy_begin,energy_end,frame_index)) or not 0<=energy_begin<energy_end:
            raise ValueError('Explicit native fit/energy/frame coordinates required')
        if band_index<0:
            clock=NativeBandClock(float(self.sample_rate),1,self.hop,0,len(self.raw_channels[channel]))
        elif band_index<len(self.bands):clock=self.bands[band_index].primary
        else:clock=self.bands[0].alternate
        data=self.channels[channel][band_index+1]
        first,stop=energy_begin//clock.stride,energy_end//clock.stride
        if not 0<=first<stop<=len(data):raise ValueError('Native energy range exceeds band buffer')
        energy=0.0;mean=1.0
        if preweighted:
            table=self.window_lookup_989ff0
            if table is None:
                raise NotImplementedError('Native328860 window lookup table has not been supplied')
            if len(table)<2 or len(table)%2:raise ValueError('Native weighting lookup length must be even')
            center=clock.hop*frame_index+clock.hop//2
            half=(stop-first)//2
            left=max(half,center-first);right=max(half,stop-center)
            if min(left,right)<=0:raise ValueError('Degenerate native weighting interval')
            half_table=len(table)//2
            step=f32(f32(half_table-1)/f32(left));right_step=f32(f32(half_table-1)/f32(right))
            cursor=f32(f32(f32(first-center-1)*step)+f32(half_table))
            cursor=f32(cursor+f32(.5001))
            weighted=[];weight_sum=0.0
            for index in range(first,stop):
                if index==center:step=right_step
                cursor=f32(cursor+step);slot=int(cursor)&0xffffffff
                if slot>=len(table):raise ValueError('Native weight index exceeds its table')
                value=f32(data[index]);weight=table[slot]
                weighted.append(f32(value*weight))
                weight_sum=f32(weight_sum+weight)
                energy=energy+float(value)*float(value)*float(weight)
            data=_WeightedPCMView(len(data),first,weighted);mean=f32(weight_sum/f32(stop-first))
            if not first<=begin//clock.stride<end//clock.stride<=stop:
                raise ValueError('Native fit interval extends beyond prepared weighted PCM')
        else:
            for index in range(first,stop):
                value=f32(data[index]);energy=energy+float(value)*float(value)
        return NativePreparedPCM(data,clock.sample_rate,clock.stride,clock.hop,energy,
                                 energy_begin,energy_end,band_index,preweighted,mean)

    def subtract_trajectory_component(self,trajectory_start,frames,relative_frame,component_index):
        """31c500's ordinary scheduler call (flags1,1,0,0,0,1).

        Update actual primary/alternate residual buffers using the native
        magnitude-response interpolation and3190b0 kernel. Raw input slot0
        stays unchanged. Stereo mode recomputes analysis channel0 from1/2 only
        over the exact touched native support. No generic re-filtering occurs.
        """
        if not 0<=relative_frame<len(frames) or not 0<=component_index<3:
            raise ValueError('Invalid native trajectory component')
        frame=frames[relative_frame];previous=frames[max(0,relative_frame-1)]
        offset=component_index*0x18
        previous_frequency=struct.unpack_from('<f',previous,offset+0x10)[0]
        current_frequency=struct.unpack_from('<f',frame,offset+0x10)[0]
        minimum=min(previous_frequency,current_frequency);maximum=max(previous_frequency,current_frequency)
        absolute=trajectory_start+relative_frame
        mode=len(self.channels)
        for band_index,record in enumerate(self.bands):
            for alternate in (True,False):
                #31c500's bVar39==0 branch only visits the first alternate.
                #The later alternate slots are allocated native state, but
                #are not residual targets of this ordinary scheduler call.
                if alternate and band_index>0:continue
                unconditional=alternate and band_index==0
                if not unconditional and record.upper_0c<maximum:break
                if not unconditional and minimum<record.lower_08:continue
                clock=record.alternate if alternate else record.primary
                slot=len(self.bands)+band_index+1 if alternate else band_index+1
                start=clock.hop*absolute
                if start<0 or start+clock.hop>clock.buffer_samples:
                    raise ValueError('Native residual subtraction requires complete task context')
                for channel in range(1 if mode>2 else 0,mode):
                    side=max(channel-1,0)
                    phase=struct.unpack_from('<f',frame,offset+side*4)[0]
                    strength=struct.unpack_from('<f',frame,offset+8+side*4)[0]
                    frequency=struct.unpack_from('<f',frame,offset+0x10)[0]
                    if strength<62 or frequency==0:continue
                    amplitude=f32(f32(math.pow(float(strength)/32767.0,1.6609640475208238))*32767.0)
                    if not unconditional:
                        x=f32(f32(frequency*512.0)/f32(self.sample_rate))
                        x=min(255.0,max(1.0,x));nearest=math.floor(f32(x+f32(.5001)))
                        fraction=f32(x-f32(nearest))
                        value=record.response[nearest]
                        center=math.sqrt(value.real*value.real+value.imag*value.imag)
                        if fraction<0:
                            other=record.response[nearest-1] if nearest>=2 else 0j
                            edge=math.sqrt(other.real*other.real+other.imag*other.imag)*float(-fraction)
                            gain=center*(float(fraction)+1.0)+edge
                        else:
                            other=record.response[nearest+1] if nearest<255 else 0j
                            edge=math.sqrt(other.real*other.real+other.imag*other.imag)*float(fraction)
                            gain=center*(1.0-float(fraction))+edge
                        amplitude=f32(gain*float(amplitude))
                    if amplitude>=1.0:
                        add_component_inplace(self.channels[channel][slot],start,clock.hop,
                                               int(clock.sample_rate),-amplitude,frequency,phase)
                if mode>2:
                    count=clock.buffer_samples
                    left=min(clock.hop//2,start)
                    right=min(clock.hop//2,count-start-clock.hop)
                    for sample in range(start-left,start+clock.hop+right):
                        self.channels[0][slot][sample]=f32(f32(self.channels[2][slot][sample]+self.channels[1][slot][sample])*.5)
