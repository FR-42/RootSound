"""Actual34c5a0 event shaping and34ba00 span eligibility.

This layer operates on the native histogram/event owners, never a generic
onset curve or a public model. Source:remaining-34c5a0/34ba00.c and their
retained REA records, target5f088fa4fbbe1759ef75d8034c79f33c846e3bf5f13d5048dd95a6614d2ad441.
"""
from native_harmonic_fields import f32
from native_noise_events import NativeNoiseEvent,native_db_ratio


def noise_span_compatible(context,lower,upper,reference_lower,reference_upper,event):
    """34ba00 returnsits low-byte bool and may trim both proposed bounds."""
    if any(type(value) is not int or not 0<=value<=65535 for value in (lower,upper,reference_lower,reference_upper)):
        raise ValueError('Native noise frequency spans must beushort values')
    half=max(1,int(f32(f32(f32(reference_upper-reference_lower+1)*f32(.5))+f32(.5))))
    if lower>reference_lower+half or upper<reference_upper-half:return None
    if context.flag_92:
        if event.h(0x14)*500.<1000. and upper>reference_upper+half:return None
        if event.h(0x16)*500.>1500. and lower<reference_lower-half:return None
    margin_low=max(1,int(f32(f32(f32(reference_lower)*f32(.125))+f32(.5))))
    margin_high=max(1,int(f32(f32(f32(reference_upper)*f32(.125))+f32(.5))))
    if lower<reference_lower-margin_low:lower=reference_lower
    if reference_upper+margin_high<upper:upper=reference_upper
    return lower,upper


def _return_energy(event,table,frame,bucket):
    from native_noise_growth import histogram_value,set_histogram_value
    value=event.sample(frame,bucket)
    set_histogram_value(table,frame,bucket,f32(histogram_value(table,frame,bucket)+value))
    event.set_sample(frame,bucket,0.)


def _trim_event(event,table,first_frame):
    """34ce33..34d753 alternating column/time tail trimming and returns."""
    ratio=native_db_ratio(-20)
    while True:
        changed=False;start=event.start;end=event.end
        if first_frame<=start:
            best=-1;maximum=0.
            for bucket in range(event.lower,event.upper+1):
                total=0.
                for frame in range(start,end+1):total=f32(total+event.sample(frame,bucket))
                if maximum<total:best,maximum=bucket,total
            if best>=0:
                width=end-start+1
                middle_first=max(first_frame,start+width//3)
                middle_last=max(first_frame,start+(width*2)//3)
                for direction in (-1,1):
                    boundary=event.lower if direction<0 else event.upper
                    bucket=best+direction;weak=None
                    while boundary<=bucket if direction<0 else bucket<=boundary:
                        total=peak=0.
                        for frame in range(start,end+1):
                            value=event.sample(frame,bucket);total=f32(total+value)
                            if middle_first<=frame<=middle_last:peak=max(peak,value)
                        cutoff=f32(ratio*maximum)
                        if total<cutoff and f32(f32(f32(width)*peak)/f32(3.))<cutoff:weak=bucket;break
                        bucket+=direction
                    if weak is None:continue
                    bucket=weak
                    while boundary<=bucket if direction<0 else bucket<=boundary:
                        for frame in range(start,end+1):_return_energy(event,table,frame,bucket)
                        bucket+=direction
                    if direction<0:event.lower=weak+1
                    else:event.upper=weak-1
                    changed=True
        lower,upper=event.lower,event.upper
        scan_start=max(first_frame,event.start);best=-1;maximum=0.
        for frame in range(scan_start,event.end+1):
            total=0.
            for bucket in range(lower,upper+1):total=f32(total+event.sample(frame,bucket))
            if maximum<total:best,maximum=frame,total
        if best>=0:
            width=upper-lower+1;middle_first=lower+width//3;middle_last=lower+(width*2)//3
            directions=(-1,1) if first_frame<=event.start else (1,)
            for direction in directions:
                boundary=scan_start if direction<0 else event.end
                frame=best-1 if direction<0 else max(first_frame,best+1);weak=None
                while boundary<=frame if direction<0 else frame<=boundary:
                    total=peak=0.
                    for bucket in range(lower,upper+1):
                        value=event.sample(frame,bucket);total=f32(total+value)
                        if middle_first<=bucket<=middle_last:peak=max(peak,value)
                    cutoff=f32(ratio*maximum)
                    if total<cutoff and f32(f32(f32(width)*peak)/f32(3.))<cutoff:weak=frame;break
                    frame+=direction
                if weak is None:continue
                frame=weak
                while boundary<=frame if direction<0 else frame<=boundary:
                    for bucket in range(lower,upper+1):_return_energy(event,table,frame,bucket)
                    frame+=direction
                if direction<0:event.start=weak+1
                else:event.end=weak-1
                changed=True
        if not changed:return


def refine_native_noise_event(event,table,previous_events,*,context,first_frame,last_frame,
                               task_start_frame,task_end_frame):
    """34c5a0 forward/backward shaping, retained matching and native trim.

    first_frame/last_frame are the original350e40 inclusive query span. The
    event owns its complete current surface separately from its0x38metadata;
    the mutable34b460 table receives every unclaimed/trimmed energy value.
    """
    from native_noise_growth import (select_native_noise_span,probe_native_noise_jump,
        histogram_value,set_histogram_value)
    if not isinstance(event,NativeNoiseEvent):raise TypeError('Actual native noise event owner required')
    if event.samples is None or event.baseline is None or len(event.baseline)!=table.columns:
        raise ValueError('Native event needs its actual surface and baseline vectors')
    if event.columns!=table.columns:raise ValueError('Native event and histogram column clocks differ')
    reference_lower,reference_upper=event.lower,event.upper
    anchor_lower,anchor_upper=reference_lower,reference_upper
    for direction in (1,-1):
        if event.start<task_start_frame:
            if direction==-1:continue
            reference_lower,reference_upper=event.h(0x22),event.h(0x24)
            seed=event.h(0x26);event.set_u(0x22,0);event.set_h(0x26,0)
        else:seed=event.seed
        frame=max(first_frame,event.peak)+(0 if direction>0 else -1)
        previous_peak=previous_delta=f32(0);first_change=True
        selected=None;select_next=True
        last_reference_lower,last_reference_upper=reference_lower,reference_upper
        while frame<=last_frame if direction>0 else first_frame<=frame:
            if select_next:
                selected=select_native_noise_span(table,event.baseline,seed,frame,event.peak,
                    reference_lower,reference_upper,context=context,event=event)
                if selected is None:break
                seed=selected.seed
            lower,upper,score=selected.lower,selected.upper,selected.score
            if frame==event.peak:anchor_lower,anchor_upper=lower,upper
            if not first_change and score<f32(native_db_ratio(-10)*event.score):
                if context.mode_14==0 or f32(score-previous_peak)<=32.:break
            probe=NativeNoiseEvent(columns=event.columns,first_frame=event.first_frame,last_frame=event.last_frame)
            jump,previous_delta,first_change=probe_native_noise_jump(table,event.baseline,seed,
                event.peak,frame,direction,context=context,event=probe,recursive_skip_jumps=True,
                param_delta=f32(score-previous_peak),previous_delta=previous_delta,
                first_change=first_change,first_frame=first_frame,last_frame=last_frame)
            select_next=True
            if f32(native_db_ratio(7)*previous_peak)<=probe.score and jump!=-1:
                following=jump+direction
                if not first_frame-context.bias_989fe4<=following<=last_frame:break
                upcoming=select_native_noise_span(table,event.baseline,seed,following,event.peak,
                    reference_lower,reference_upper,context=context,event=event)
                if upcoming is None:break
                seed=upcoming.seed;lower,upper=upcoming.lower,upcoming.upper
                select_next=False
            else:
                jump=-1;reference_lower,reference_upper=lower,upper;previous_peak=score
                upcoming=None
            stop=frame if jump==-1 else jump
            for bucket in range(lower,upper+1):
                before=after=f32(0)
                if jump!=-1:
                    if first_frame-context.bias_989fe4<=frame-direction<=last_frame:
                        before=histogram_value(table,frame-direction,bucket)
                    if first_frame-context.bias_989fe4<=jump+direction<=last_frame:
                        after=histogram_value(table,jump+direction,bucket)
                boundary=min(before,after);position=frame
                while position<=stop if direction>0 else stop<=position:
                    #34caad..34cb76 indexes RSI(current frame), while R8
                    #advances the interpolation counter. Preserve these real
                    #source writes rather than changing them to the counter.
                    measured=histogram_value(table,frame,bucket)
                    if jump==-1:available=measured
                    else:
                        fraction=f32(f32(abs(jump-frame)+1-abs(position-frame))/f32(abs(jump-frame)+2))
                        available=min(measured,f32(f32(f32(1.-fraction)*boundary)+f32(fraction*before)))
                    amount=max(0.,f32(available-event.baseline[bucket]))
                    event.set_sample(frame,bucket,amount)
                    set_histogram_value(table,frame,bucket,max(0.,f32(measured-amount)))
                    position+=direction
            #This is the task ending boundary, distinct from the producer's
            #inclusive query end with native lookahead.
            crossing=(direction>0 and event.start<=task_end_frame-1 and frame<=task_end_frame-1<=stop) or (
                direction<0 and task_end_frame<=event.end and stop<=task_end_frame-1<=frame)
            if crossing:
                event.set_h(0x22,min(event.lower,lower));event.set_h(0x24,max(event.upper,upper));event.set_h(0x26,seed)
                event.tail_baseline=list(event.baseline)
            event.lower=min(event.lower,lower);event.upper=max(event.upper,upper)
            if direction<0:event.start=stop
            else:event.end=stop
            last_reference_lower,last_reference_upper=reference_lower,reference_upper
            frame=stop+direction;selected=upcoming
        if direction<0 and frame<task_start_frame and previous_events:
            match=None;distance=None
            for old in previous_events:
                lower,upper=old.h(0x22),old.h(0x24)
                if not lower<last_reference_upper or not last_reference_lower<upper:continue
                clipped=noise_span_compatible(context,lower,upper,last_reference_lower,last_reference_upper,event)
                if clipped is None:continue
                current=abs(last_reference_lower-lower)+abs(last_reference_upper-upper)
                if match is None or current<distance:match,distance=old,current
            if match is not None:
                event.start=match.start;event.kind=match.kind;event.identity=match.identity
                event.lower=min(event.lower,match.lower);event.upper=max(event.upper,match.upper)
        reference_lower,reference_upper=anchor_lower,anchor_upper
    _trim_event(event,table,first_frame)
    return event
