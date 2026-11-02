"""347a90 raw harmonic subtraction and347170/346ed0 residual grid.

This is the native fixed-frequency estimator path, with its original0xf8
records and0x230 fit representation. It consumes already refined native
trajectories and31bde0-owned input; it never invokes a public model or reads
media files. The classification/history step350e40 is owned separately.

Source identity:RipX.exe SHA256
5f088fa4fbbe1759ef75d8034c79f33c846e3bf5f13d5048dd95a6614d2ad441.
Evidence:notes/direct-347170.asm,notes/direct-346ed0.asm,
noise/direct-31c500.asm,noise/direct-31e620.asm and
noise/native-noise-static-constants.json. Static construction only.
"""
from dataclasses import dataclass
import math
import struct
import numpy as np

from native_harmonic_fields import f32, encode_phase
from native_pcm_component import add_component_inplace
from native_pcm_estimate import NativePreparedPCM, estimate_prepared_trajectory_component
from native_trajectory_output import NativeTrajectory
from native_background import NativeBackgroundGrid
from native_loop_kernels import sum_squares


def _f(data,offset):return struct.unpack_from('<f',data,offset)[0]
def _put(data,offset,value):struct.pack_into('<f',data,offset,f32(value))


@dataclass(frozen=True)
class NativeNoiseContext:
    sample_rate:int
    hop:int
    analysis_rate:float
    context_24:int
    context_28:int
    context_bc:int
    channel_mode:int
    bandwidth_989fe0:float
    bias_989fe4:int
    mode_14:int=0
    flag_92:bool=False
    reduced_harmonics_989f11:bool=False
    history_enabled_939680:bool=True
    duration_10:float=0.0
    minimum_frequency:float=21.0
    threshold_939684:float=1.778279423713684
    threshold_939688:float=1.778279423713684

    def __post_init__(self):
        if any(type(x) is not int for x in (self.sample_rate,self.hop,self.context_24,self.context_28,self.context_bc,self.channel_mode,self.bias_989fe4,self.mode_14)):
            raise ValueError('Actual native noise clock/context integers required')
        if self.sample_rate<=0 or self.hop<=0 or self.hop&(self.hop-1) or min(self.context_24,self.context_28,self.context_bc,self.bias_989fe4)<0 or self.channel_mode not in (1,2,3):
            raise ValueError('Invalid native noise geometry/channel mode')
        if not all(math.isfinite(x) for x in (self.analysis_rate,self.bandwidth_989fe0,self.duration_10,self.minimum_frequency,self.threshold_939684,self.threshold_939688)) or min(self.analysis_rate,self.bandwidth_989fe0,self.minimum_frequency,self.threshold_939684,self.threshold_939688)<=0 or self.duration_10<0:
            raise ValueError('Actual finite positive native noise clocks/frequencies required')

    @property
    def sample_limit(self):return (self.context_24+self.context_28*2)*self.hop

    @property
    def history_active(self):return self.history_enabled_939680 and (self.flag_92 or self.mode_14==0)


@dataclass(frozen=True)
class NativeResidualPCM:
    """Private raw residual owner; original31bde0 source remains caller-owned."""
    channels:tuple
    context:NativeNoiseContext
    harmonic_subtractions:int


@dataclass(frozen=True)
class NativeResidualGrid:
    records_by_frame:dict
    produced_from_frame:int
    next_frame:int
    maximum_grid_count:int
    history_active:bool
    fixed_frequency_fits:int
    stage:str='native-347a90/31c500/347170/346ed0/31b830'


def subtract_native_harmonics(trajectories,band_buffers,*,context,task_start_frame,task_end_frame):
    """347a90->31c500 exact raw-only call1,0,1,0,1,0.

    Noise extraction uses raw slot0, quantizes linear amplitude through the
    actual ushort cast, and does not update/recompute analysis channel0 in
    stereo mode. The refinement scheduler's filtered-band subtraction is a
    different call and must not be substituted here.
    """
    if not isinstance(context,NativeNoiseContext):raise TypeError('Native noise context required')
    if (band_buffers.sample_rate,band_buffers.hop,len(band_buffers.raw_channels))!=(context.sample_rate,context.hop,context.channel_mode):
        raise ValueError('Native noise context and band-buffer ownership disagree')
    channels=tuple([f32(value) for value in channel] for channel in band_buffers.raw_channels)
    if any(len(channel)!=context.sample_limit for channel in channels):
        raise ValueError('Native raw residual requires complete explicit task context')
    count=0
    for trajectory in trajectories:
        if not isinstance(trajectory,NativeTrajectory):raise TypeError('Actual refined native trajectories required')
        if trajectory.header[0x0c]&1 or trajectory.header[0x24]!=1:continue
        for relative,frame in enumerate(trajectory.frames):
            absolute=trajectory.start_frame+relative
            if absolute<task_start_frame-context.context_28:continue
            if absolute>=task_end_frame+context.context_28:break
            if frame[0x4b]>3:raise ValueError('Native frame exceeds three component slots')
            for component in range(frame[0x4b]):
                base=component*0x18;frequency=_f(frame,base+0x10)
                for channel in range(1 if context.channel_mode>=3 else 0,context.channel_mode):
                    side=max(0,channel-1);strength=_f(frame,base+8+side*4)
                    if strength<62.0 or frequency==0.0:continue
                    linear=f32(f32(math.pow(float(strength)/32767.0,1.6609640475208238))*32767.0) if strength>0 else 0.0
                    amplitude=float(int(f32(linear+.5))&0xffff)
                    if amplitude<1.0:continue
                    add_component_inplace(channels[channel],absolute*context.hop,context.hop,
                        context.sample_rate,-amplitude,frequency,_f(frame,base+side*4))
                    count+=1
    return NativeResidualPCM(channels,context,count)


def _window(context,frame):
    """346ed0 and347170 share31e620's clamped2*hop*13/12 span."""
    requested=int((float(context.hop)*2.0)*1.0833333333333333)
    begin=max(0,frame*context.hop+context.hop//2-requested//2)
    return begin,min(begin+requested,context.sample_limit)


def _prepare_frame(residual,frame):
    """31e620/328860 raw energy cache shared by theframe's fixed fits."""
    context=residual.context;begin,end=_window(context,frame)
    prepared=[]
    for channel in range(1 if context.channel_mode>=3 else 0,context.channel_mode):
        pcm=residual.channels[channel]
        values=np.asarray(pcm[begin:end],dtype=np.float32).astype(np.float64)
        if not np.isfinite(values).all():raise ValueError('Native residual PCM must be finite')
        values.flags.writeable=False;energy=sum_squares(values)
        prepared.append(NativePreparedPCM(pcm,float(context.sample_rate),1,context.hop,energy,begin,end,-1,
            fit_begin=begin,fit_end=end,fit_values=values))
    return tuple(prepared)


def _fixed_fit(residual,frame,frequency,prepared,*,transform_strength):
    context=residual.context;estimates=[]
    for source in prepared:
        begin,end=source.energy_begin,source.energy_end
        estimate=estimate_prepared_trajectory_component(source,begin,end,frequency,
            context.sample_rate,context.hop,frame,(0.0,)*64,phase_at_frame_hint=-1.0)
        amplitude=f32(float(estimate.amplitude)*1.0833333333333333)
        if context.reduced_harmonics_989f11 and amplitude<8.0:amplitude=0.0
        if transform_strength:
            amplitude=f32(f32(math.pow(float(amplitude)/32767.0,.6020599913))*32767.0) if amplitude>0 else 0.0
        #346ed0 exposes the actual31b830 float phase, not the packed phase.
        estimates.append((estimate.phase_at_frame,amplitude))
    return tuple(estimates)


def produce_native_residual_grid(residual,grids,*,task_start_frame,task_end_frame,
                                 from_frame=None,task_output_frame=None,mode=0,
                                 retained_records=None):
    """347170's actual fixed-frequency0xf8 production before350e40.

    retained_records are32e650-restored records in current task coordinates.
    Every produced frame replaces its owned records; absent restored frames
    are an error. mode1/normal flag92false has the real early-empty path.
    The returned history_active flag requires350e40 before these records are
    advertised as classified groups; group0 here retains native type0x7e.
    """
    if not isinstance(residual,NativeResidualPCM):raise TypeError('Native raw residual owner required')
    context=residual.context
    if any(type(x) is not int for x in (task_start_frame,task_end_frame,mode)) or mode not in (0,1) or not 0<=task_start_frame<=task_end_frame<=context.context_24+context.context_28*2:
        raise ValueError('Actual native task frame bounds/mode required')
    first=task_start_frame if from_frame is None else from_frame
    output=task_start_frame if task_output_frame is None else task_output_frame
    if type(first) is not int or type(output) is not int or not task_start_frame<=first<=task_end_frame+context.context_bc:
        raise ValueError('Native restored production boundary is invalid')
    retained={} if retained_records is None else dict(retained_records)
    for index,packed in retained.items():
        if type(index) is not int or not isinstance(packed,bytes) or len(packed)%0xf8 or len(packed)//0xf8>0x1d0:
            raise ValueError('Actual packed retained0xf8 records required')
    for frame in range(task_start_frame,first):
        if frame not in retained:raise ValueError('Native restored residual grid lacks required preceding frame')
    #343da0 clears the owned count table before32e650 restores predecessor
    #rows. These empty allocation rows have a known producer and are not an
    #inferred substitute for missing measurements in the produced interval.
    records={frame:b'' for frame in range(task_start_frame-context.bias_989fe4,task_end_frame+context.context_bc)}
    records.update(retained)
    if mode and not context.flag_92:
        return NativeResidualGrid(records,first,task_start_frame,0,False,0)
    grids=tuple(grids)
    if any(not isinstance(grid,NativeBackgroundGrid) for grid in grids):raise TypeError('Actual989f20 background grid records required')
    last=task_end_frame+(context.context_bc if context.history_active else 0)-1
    if context.duration_10!=0.0:
        requested=max(1,int(f32(f32(context.duration_10)*f32(context.analysis_rate))+.5))
        total=output-task_start_frame+last+1
        if requested<total:last-=total-requested
        if last<first:return NativeResidualGrid(records,first,task_start_frame,0,False,0)
    maximum=max((grid.count for grid in grids),default=0);fits=0
    for frame in range(first,last+1):
        packed=bytearray();prepared=None
        for grid in grids:
            for ordinal in range(1,grid.count+1):
                if len(packed)//0xf8>=0x1d0:break
                frequency=grid.frequency(ordinal);record=bytearray(0xf8)
                _put(record,0,frequency);record[0xd0]=0x7e
                if mode and not context.minimum_frequency<frequency<24000.0:
                    packed.extend(record);continue
                if prepared is None:prepared=_prepare_frame(residual,frame)
                estimates=_fixed_fit(residual,frame,frequency,prepared,transform_strength=not context.history_active)
                fits+=len(estimates)
                left,strength_left=estimates[0]
                right,strength_right=estimates[0] if context.channel_mode<3 else estimates[-1]
                if context.channel_mode<3:balance=0;strength=strength_left
                else:
                    summed=f32(strength_left+strength_right)
                    balance_value=f32(f32(f32(strength_right/summed)*65534.0)-32767.0) if strength_left>0 or strength_right>0 else 0.0
                    balance_value=f32(balance_value+f32(.5001)) if balance_value>=0 else f32(balance_value-f32(.5001))
                    balance=int(min(32767.0,max(-32767.0,balance_value)))
                    strength=f32(float(summed)*.5)
                struct.pack_into('<HH',record,4,encode_phase(left),encode_phase(right))
                _put(record,8,strength);_put(record,0xc,left);_put(record,0x10,right)
                _put(record,0x14,strength_left);_put(record,0x18,strength_right);_put(record,0x1c,frequency)
                record[0xcc]=1;struct.pack_into('<h',record,0xce,balance)
                packed.extend(record)
        records[frame]=bytes(packed)
    for frame in range(task_start_frame,first):
        if context.history_active:
            packed=bytearray(records[frame])
            for offset in range(0,len(packed),0xf8):
                strength=_f(packed,offset+8)
                if context.channel_mode>=3:
                    balance=struct.unpack_from('<h',packed,offset+0xce)[0]
                    right=f32(f32(f32(float(balance)+32767.0)+f32(float(balance)+32767.0))/65534.0)
                    left=f32(f32(2.0-right)*strength);right=f32(right*strength)
                else:left=right=strength
                _put(packed,offset+0x14,left);_put(packed,offset+0x18,right)
                for group in range(1,8):
                    packed[offset+0x14+group*0x18:offset+0x1c+group*0x18]=bytes(8)
                    packed[offset+0xd0+group]=0;struct.pack_into('<I',packed,offset+0xd8+group*4,0)
                packed[offset+0xd0]=0x7e;struct.pack_into('<I',packed,offset+0xd8,0);packed[offset+0xcc]=1
            records[frame]=bytes(packed)
    return NativeResidualGrid(records,first,last+1,maximum,context.history_active,fits)
