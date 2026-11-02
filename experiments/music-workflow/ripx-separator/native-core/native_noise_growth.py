"""3492f0/34c020/34bb60/34c2b0 exact histogram event growth.

All rows are34b460-owned0x410 cells. Region boundaries, gap counts, jump
probes and original float32 rounding follow the retained source. This module
does not infer onsets from PCM or from an independent spectrogram.
"""
import struct

from native_harmonic_fields import f32
from native_noise_events import NativeNoiseEvent,NativeNoiseSpan,native_db_ratio


def histogram_value(table,frame,bucket):
    return struct.unpack_from('<f',table.cell(frame,bucket),0)[0]


def set_histogram_value(table,frame,bucket,value):
    if not isinstance(table.packed,bytearray):raise TypeError('Native event growth requires its mutable histogram owner')
    table.cell(frame,bucket) #Validate owned coordinates before writing.
    offset=((table.bias+frame-table.first_frame)*table.columns+bucket)*0x410
    struct.pack_into('<f',table.packed,offset,f32(value))


def _span_34bb60(table,baseline,seed,frame,reference_frame,lower,upper,*,context,event,maximum_delta):
    value=histogram_value(table,frame,seed);difference=f32(value-baseline[seed]);score=difference
    threshold=min(24.0,max(2.0,f32(maximum_delta*f32(.1))))
    baseline_sum=baseline[seed];lo=hi=seed
    for direction in (-1,1):
        at=seed;last_difference=difference;weak=0
        while True:
            at+=direction
            if not 0<=at<table.columns:break
            current=histogram_value(table,frame,at)
            if context.flag_92 and direction<0 and event.upper*500.0>4500.0 and at*500.0<=1500.0 and f32(current-baseline[at])<difference:break
            base=baseline[at]
            if current<=f32(native_db_ratio(3)*base) or current<=f32(base+threshold):
                weak+=1;keep=weak<=(0 if context.flag_92 else 1)
            else:
                delta=f32(current-base)
                if delta<=f32(native_db_ratio(-10)*last_difference) or f32(native_db_ratio(10)*last_difference)<=delta:
                    weak+=1;keep=weak<=(0 if context.flag_92 else 1)
                else:weak=0;keep=True;last_difference=delta
            if direction<0:lo=at
            else:hi=at
            if not keep:break
            if seed-3<=at<=seed+3:
                score=f32(score+min(maximum_delta,f32(current-base)));baseline_sum=f32(baseline_sum+base)
        if direction<0:lo+=weak
        else:hi-=weak
    average=f32(score/f32(7.0));mean_baseline=f32(baseline_sum/f32(7.0))
    if frame==reference_frame:return NativeNoiseSpan(seed,lo,hi,average)
    floor=min(48.0,f32(event.score*f32(.031622775)))
    if max(f32(f32(context.threshold_939684)*mean_baseline),f32(floor+mean_baseline))>=f32(average+mean_baseline):return None
    #34ba00 is shared with the actual34c5a0 shape owner; import only at call
    #time because that owner itself invokes this growth module.
    from native_noise_event_shape import noise_span_compatible
    clipped=noise_span_compatible(context,lo,hi,lower,upper,event)
    return None if clipped is None else NativeNoiseSpan(seed,clipped[0],clipped[1],average)


def select_native_noise_span(table,baseline,seed,frame,reference_frame,lower,upper,*,context,event,modify_seed=True):
    """34c020's actual bounded seed selection and34bb60 neighborhood."""
    if not isinstance(event,NativeNoiseEvent):raise TypeError('Actual native event owner required')
    if len(baseline)!=table.columns:raise ValueError('Native histogram baseline length mismatch')
    if not 0<=seed<table.columns:return None
    maximum=max(0.0,f32(histogram_value(table,frame,seed)-baseline[seed]))
    found=_span_34bb60(table,baseline,seed,frame,reference_frame,lower,upper,context=context,event=event,maximum_delta=maximum)
    if found is None or (frame!=reference_frame and found.score<=2.0):return None
    return NativeNoiseSpan(found.seed if modify_seed else seed,found.lower,found.upper,max(2.0,found.score))


def probe_native_noise_jump(table,baseline,seed,reference_frame,frame,direction,*,context,event,
                            recursive_skip_jumps,param_delta,previous_delta,first_change,
                            first_frame,last_frame):
    """34c2b0 returns(jumpFrame,previousDelta,firstChange).

    recursive_skip_jumps is source param11, passed as3492f0 param9. The
    first-change byte is true until the first strictly falling delta.
    Source updates previousDelta even when no jump is selected.
    """
    if direction not in (-1,1):raise ValueError('Native event growth direction must be -1 or1')
    delta=f32(param_delta);previous=f32(previous_delta);changed=bool(first_change)
    if frame==reference_frame:return -1,previous,changed
    if (direction>0 and reference_frame+1<frame) or (direction<0 and frame<reference_frame-1):
        if not changed:
            if max(8.0,previous)<delta:
                base=baseline[seed];before=histogram_value(table,frame-direction,seed);current=histogram_value(table,frame,seed)
                if f32(max(base,before)*f32(context.threshold_939688))<current and f32(max(before,base)+2.0)<current:
                    next_baseline=[histogram_value(table,frame-direction,bucket) for bucket in range(table.columns)]
                    stop=grow_native_noise_event(table,next_baseline,seed,frame,direction,context=context,event=event,
                        first_frame=first_frame,last_frame=last_frame,skip_jumps=bool(recursive_skip_jumps))
                    if (direction>0 and frame<=stop) or (direction<0 and stop<=frame):
                        while (first_frame-context.bias_989fe4<=stop if direction<0 else stop<=last_frame):
                            current=histogram_value(table,stop,seed)
                            if current<=f32(base*f32(context.threshold_939688)) or current<=f32(base+2.0):break
                            stop+=direction
                        return stop,delta,changed
        elif delta<previous:changed=False
    return -1,delta,changed


def grow_native_noise_event(table,baseline,seed,frame,direction,*,context,event,
                            first_frame,last_frame,skip_jumps=False):
    """3492f0 chronological scan and native peak/event descriptor writes."""
    if direction not in (-1,1):raise ValueError('Native event growth direction must be -1 or1')
    origin=frame;current=frame;lower=upper=seed;previous_score=previous_delta=0.0;first_change=True
    while first_frame-context.bias_989fe4<=current if direction<0 else current<=last_frame:
        span=select_native_noise_span(table,baseline,seed,current,origin,lower,upper,context=context,event=event)
        if span is None:break
        seed=span.seed
        if not skip_jumps:
            stop,previous_delta,first_change=probe_native_noise_jump(table,baseline,seed,origin,current,direction,
                context=context,event=event,recursive_skip_jumps=False,param_delta=f32(span.score-previous_score),
                previous_delta=previous_delta,first_change=first_change,first_frame=first_frame,last_frame=last_frame)
            if stop!=-1:current=stop+direction;continue
        lower,upper=span.lower,span.upper
        if event.score<span.score and first_frame<=current:
            event.score=span.score;event.start=event.end=event.peak=current;event.seed=seed
            event.lower=lower;event.upper=upper;event.kind=0
            event.set_u(0x24,0);event.set_h(0x22,0);event.tail_baseline=None;event.identity=0
            if not skip_jumps:event.baseline=list(baseline)
        previous_score=span.score;current+=direction
    return current-direction
