"""349600 mode0 low-band transient preprocessing over actual0xf8 records.

This is the source-derived six-pass producer called by350e40 before34b460.
It preserves native ordinal frequency identity, missing-bin tests, float32
boundaries and group1 type0x10/0x11 writes. No media, model or original app
is opened. Source:remaining-349600.c and noise-preprocess-static-constants.json.
Static construction only; listening/numerical equivalence is unverified.
"""
import math
import struct

from native_harmonic_fields import f32
from native_residual_grid import NativeNoiseContext

RECORD_BYTES=0xF8
GAIN_UP5=1.778279423713684
GAIN_UP10=3.1622776985168457
GAIN_DOWN5=.5623413324356079
GAIN_DOWN10=.3162277638912201
GAIN_DOWN15=.17782793939113617
GAIN_SPECIAL7=2.2387211322784424
RECOVERY=.8912509083747864


def _f(data,offset):return struct.unpack_from('<f',data,offset)[0]
def _put(data,offset,value):struct.pack_into('<f',data,offset,f32(value))


class _NoiseFrames:
    """One parsed owner of frame/ordinal/side interpretation for349600."""
    def __init__(self,frames,frequencies,channel_mode):
        self.frames=frames;self.frequencies=frequencies;self.mode=channel_mode
        self.counts={frame:len(packed)//RECORD_BYTES for frame,packed in frames.items()}

    def present(self,frame,index):return 0<=index<self.counts[frame]

    def strength(self,frame,index,group=0):
        packed=self.frames[frame];offset=index*RECORD_BYTES+0x14+group*0x18
        left=_f(packed,offset)
        return left if self.mode==1 else f32(f32(left+_f(packed,offset+4))*.5)

    def tag(self,frame,index):return self.frames[frame][index*RECORD_BYTES+0xD1]

    def mark(self,frame,index,*,peak=None):
        packed=self.frames[frame];offset=index*RECORD_BYTES
        packed[offset+0xD1]=0x10;struct.pack_into('<I',packed,offset+0xDC,0)
        if peak is not None:
            _put(packed,offset+0x2C,peak)
            if self.mode!=1:_put(packed,offset+0x30,peak)

    def any_low_marked(self,frame):
        for index in range(self.counts[frame]):
            if self.frequencies[index]>500.:break
            if self.tag(frame,index)==0x10:return True
        return False


def _detect_segments(owner,first,last,rate):
    """34974e..349e8b onset, forward peak envelope and backward core."""
    shorter=max(1,int(f32(f32(f32(rate)*f32(.15))+f32(.5))))
    longer=max(1,int(f32(f32(f32(rate)*f32(.2))+f32(.5))))
    threshold_high=f32(f32(math.pow(.20000000298023224,1.6609640475208238))*32767.)
    threshold_low=f32(f32(math.pow(.07500000298023224,1.6609640475208238))*32767.)
    for index,reference in enumerate(owner.frequencies):
        if reference>500.:break
        previous_previous=previous=0.;frame=first
        while frame<=last:
            next_previous_previous,next_previous=previous_previous,previous
            if owner.present(frame,index):
                current=owner.strength(frame,index)
                next_previous_previous,next_previous=previous,current
                actual_frequency=_f(owner.frames[frame],index*RECORD_BYTES)
                horizon,threshold=(shorter,threshold_high) if actual_frequency>=500. else (longer,threshold_low)
                onset=(frame>=first+1 and threshold<current and
                    ((f32(GAIN_UP5*previous)<current and f32(previous+48.)<current) or
                     (frame>=first+2 and previous<current and f32(GAIN_UP5*previous_previous)<current
                        and f32(previous_previous+48.)<current)))
                if onset:
                    falling=False;near_peak=True;after=frame+1;peak_frame=frame
                    peak=current;old=current;before_old=previous
                    while after<=last:
                        observed=old
                        if owner.present(after,index):
                            observed=owner.strength(after,index)
                            if near_peak:
                                if f32(GAIN_DOWN5*peak)<=observed:
                                    peak=max(peak,observed)
                                    before_old,old=old,observed;after+=1
                                    continue
                                peak_frame=after-1;near_peak=False
                            if (observed<f32(GAIN_DOWN10*peak)
                                    or (falling and (f32(RECOVERY*old)<=observed or f32(old+16.)<=observed))
                                    or (f32(GAIN_UP5*old)<observed and f32(old+48.)<observed
                                        and f32(GAIN_UP5*before_old)<observed and f32(before_old+48.)<observed)
                                    or observed<threshold):
                                break
                            if observed<f32(GAIN_DOWN5*old):falling=True
                            before_old=old
                        old=observed;after+=1
                    # Outer history resumes from the forward scan, regardless
                    # of the later backward core's independent scratch values.
                    next_previous_previous,next_previous=before_old,old
                    cursor=peak_frame;amplitude=peak;small_recoveries=0
                    while True:
                        core_begin=cursor;previous_back=amplitude;cursor-=1
                        if cursor<max(first,frame):break
                        if not owner.present(cursor,index):continue
                        amplitude=owner.strength(cursor,index)
                        if not (f32(GAIN_DOWN15*peak)<=amplitude and threshold<=amplitude):break
                        if f32(GAIN_DOWN10*peak)<=amplitude:continue
                        if not (amplitude<f32(RECOVERY*previous_back) and amplitude<f32(previous_back+16.)):break
                        small_recoveries+=1
                        if small_recoveries>=3:break
                    if 0<after-core_begin<=horizon:
                        for target in range(core_begin,after):
                            if owner.present(target,index):owner.mark(target,index,peak=peak)
                    frame=after-1
            previous_previous,previous=next_previous_previous,next_previous
            frame+=1
    return threshold_high


def _reject_weak_segments(owner,first,last,threshold_high):
    """349e8b..34a432 neighborhood and adjacent-frequency rejection."""
    for index,frequency in enumerate(owner.frequencies):
        if frequency>500.:break
        if frequency<100.:
            #349ed3 multiplies the rounded pow before multiplying32767.
            threshold=f32(f32(GAIN_UP10*f32(math.pow(.07500000298023224,1.6609640475208238)))*32767.)
        else:threshold=f32((GAIN_SPECIAL7 if frequency<=150. else GAIN_UP5)*threshold_high)
        frame=first
        while frame<=last:
            if not owner.present(frame,index) or owner.tag(frame,index)!=0x10:
                frame+=1;continue
            after=frame;peak=0.
            while after<=last:
                if owner.present(after,index):
                    if owner.tag(after,index)!=0x10:break
                    peak=max(peak,owner.strength(after,index,1))
                after+=1
            summed=0.;count=0
            for direction,begin,stop in ((-1,frame-1,max(first,frame-2)-1),(1,after,min(last+1,after+2))):
                for neighbor in range(begin,stop,direction):
                    if not owner.present(neighbor,index):continue
                    if owner.tag(neighbor,index)==0x10:break
                    summed=f32(summed+owner.strength(neighbor,index));count+=1
            background=f32(summed/f32(count)) if count else summed
            if f32(peak-background)<threshold:
                adjacent=0.
                for target in range(frame,after):
                    if not owner.present(target,index):continue
                    right=owner.strength(target,index+1,1) if owner.present(target,index+1) else 0.
                    left=owner.strength(target,index-1,1) if index>0 else 0.
                    adjacent=max(adjacent,left,right)
                if adjacent==0. or adjacent<threshold:
                    for target in range(frame,after):
                        if owner.present(target,index):
                            packed=owner.frames[target];offset=index*RECORD_BYTES
                            _put(packed,offset+0x2C,0.);_put(packed,offset+0x30,0.);packed[offset+0xD1]=0
            frame=after


def _cover_lower_frequencies(owner,first,last):
    """34a432..34a4f0:mark lower ordinals below the highest low transient."""
    for frame in range(first,last+1):
        for index in range(owner.counts[frame]-1,-1,-1):
            if owner.frequencies[index]<500. and owner.tag(frame,index)==0x10:
                for lower in range(index):owner.mark(frame,lower)
                break


def _extend_temporal_tails(owner,first,last):
    """34a4f0..34a924 decreasing>=16 tails with neighboring-event guards."""
    for index,frequency in enumerate(owner.frequencies):
        if frequency>500.:break
        frame=first
        while frame<=last:
            if not owner.present(frame,index) or owner.tag(frame,index)!=0x10:
                frame+=1;continue
            current=owner.strength(frame,index);before=frame-1
            # Source backward bound is max(first,frame-1):one prior frame.
            if before>=first and owner.present(before,index) and owner.tag(before,index)!=0x10:
                strength=owner.strength(before,index)
                if (strength<current and strength>=16.
                        and not (before>first and owner.any_low_marked(before-1))):
                    owner.mark(before,index)
            frame+=1
            while frame<=last and owner.present(frame,index) and owner.tag(frame,index)==0x10:frame+=1
            if frame<=last and owner.present(frame,index):
                previous=owner.strength(frame-1,index)
                while frame<=last:
                    if not owner.present(frame,index):break
                    if owner.tag(frame,index)==0x10:
                        frame-=1;break
                    current=owner.strength(frame,index)
                    if previous<=current or current<16.:break
                    if frame<last and owner.any_low_marked(frame+1):break
                    owner.mark(frame,index);previous=current;frame+=1
            frame+=1


def _split_low_band_types(owner,first,last,task_start):
    """34a924..34b105 contiguous-run weighted115Hz split0x10->0x11."""
    def centroid_inputs(frame):
        weighted=total=0.
        for index in range(owner.counts[frame]):
            frequency=owner.frequencies[index]
            if frequency>=500.:break
            if owner.tag(frame,index)==0x10:
                strength=owner.strength(frame,index)
                total=f32(total+strength);weighted=f32(weighted+f32(strength*frequency))
        return weighted,total
    frame=max(first,task_start)
    while frame<=last:
        weighted,total=centroid_inputs(frame)
        if total==0.:
            frame+=1;continue
        after=frame+1
        while after<=last:
            next_weighted,next_total=centroid_inputs(after)
            if next_total==0.:break
            weighted=f32(weighted+next_weighted);total=f32(total+next_total);after+=1
        if f32(weighted/total)>=115.:
            for target in range(frame,after):
                for index in range(owner.counts[target]):
                    if owner.frequencies[index]>=500.:break
                    if owner.tag(target,index)==0x10:owner.frames[target][index*RECORD_BYTES+0xD1]=0x11
        frame=after+1 # Source for-loop skips the already examined zero frame.


def _cover_upper_and_transfer(owner,first,last):
    """34b105..34b460 complete low band then move actual primary side values."""
    for frame in range(first,last+1):
        count=owner.counts[frame]
        for index in range(count-1,-1,-1):
            if owner.frequencies[index]<500. and owner.tag(frame,index)==0x10:
                for upper in range(index+1,count):
                    if owner.frequencies[upper]>=500.:break
                    owner.mark(frame,upper)
                break
    for index,frequency in enumerate(owner.frequencies):
        if frequency>500.:break
        for frame in range(first,last+1):
            if owner.present(frame,index) and owner.tag(frame,index) in (0x10,0x11):
                packed=owner.frames[frame];offset=index*RECORD_BYTES
                # Keep the literal native mode2 repeated side0 move as well.
                for channel in range(1 if owner.mode>=3 else 0,owner.mode):
                    side=max(0,channel-1)
                    _put(packed,offset+0x2C+side*4,_f(packed,offset+0x14+side*4))
                    _put(packed,offset+0x14+side*4,0.)


def preprocess_native_noise_frames(records_by_frame,*,context,task_start_frame,task_end_frame,
                                    first_frame=None,last_frame=None):
    """Run actual349600; update/return the same frame dictionary.

    task_end_frame is exclusive.350e40 normally supplies first=start-bias and
    last=end+bc-1(inclusive); explicit first_frame/last_frame preserve a
    caller's already-resolved clipped347170 range. Every owned frame must be
    present, including empty frames. Bytes stay bytes; bytearrays retain
    their identities. No absent frame, side strength or group is synthesized.
    """
    if not isinstance(context,NativeNoiseContext):raise TypeError('Actual native noise context required')
    if context.mode_14!=0:raise ValueError('349600 is selected only by native mode14=0')
    if not isinstance(records_by_frame,dict):raise TypeError('Actual native packed-frame dictionary required')
    if any(type(value) is not int for value in (task_start_frame,task_end_frame)) or not 0<=task_start_frame<=task_end_frame:
        raise ValueError('Actual ordered native task frame bounds required')
    if task_end_frame>context.context_24+context.context_28*2:
        raise ValueError('Native noise task bounds exceed their actual task allocation')
    first=task_start_frame-context.bias_989fe4 if first_frame is None else first_frame
    last=task_end_frame+context.context_bc-1 if last_frame is None else last_frame
    if type(first) is not int or type(last) is not int or first>last+1:
        raise ValueError('Actual native inclusive preprocessing range required')
    if first>last:return records_by_frame
    if task_start_frame not in records_by_frame:raise ValueError('Native preprocessing reference-frequency frame is absent')
    reference=records_by_frame[task_start_frame]
    if not isinstance(reference,(bytes,bytearray)) or len(reference)%RECORD_BYTES or len(reference)//RECORD_BYTES>0x1D0:
        raise ValueError('Actual native reference0xf8 records required')
    frequencies=tuple(_f(reference,index*RECORD_BYTES) for index in range(len(reference)//RECORD_BYTES))
    if any(not math.isfinite(value) for value in frequencies) or any(left>right for left,right in zip(frequencies,frequencies[1:])):
        raise ValueError('Native preprocessing requires its ordered reference-frequency grid')
    for frame in range(first,last+1):
        if frame not in records_by_frame:raise ValueError('Native preprocessing lacks a required owned frame')
        packed=records_by_frame[frame]
        if not isinstance(packed,(bytes,bytearray)) or len(packed)%RECORD_BYTES or len(packed)//RECORD_BYTES>len(frequencies):
            raise ValueError('Native preprocessing frame count exceeds its reference grid')
        for index in range(len(packed)//RECORD_BYTES):
            offset=index*RECORD_BYTES
            if _f(packed,offset)!=frequencies[index]:raise ValueError('Native preprocessing frequency-grid identity changed')
            if any(not math.isfinite(_f(packed,offset+field)) for field in (0x14,0x18,0x2C,0x30)):
                raise ValueError('Native preprocessing side amplitudes must be finite')
    frames={frame:(value if isinstance(value,bytearray) else bytearray(value))
        for frame in range(first,last+1) for value in (records_by_frame[frame],)}
    owner=_NoiseFrames(frames,frequencies,context.channel_mode)
    high=_detect_segments(owner,first,last,context.analysis_rate)
    _reject_weak_segments(owner,first,last,high)
    _cover_lower_frequencies(owner,first,last)
    _extend_temporal_tails(owner,first,last)
    _split_low_band_types(owner,first,last,task_start_frame)
    _cover_upper_and_transfer(owner,first,last)
    for frame,packed in frames.items():
        if isinstance(records_by_frame[frame],bytes):records_by_frame[frame]=bytes(packed)
    return records_by_frame
