"""335480 normal mono/stereo task producer, including temporal peak state.

Recovered sequence:326880 spectral table; preceding-frame empty-slot
injection; descending slot order;32c560 actual band/window/frequency search;
backward and forward two-frame bridges;7Hz/hum tail cleanup. This preserves
the original native data flow and is not an independent public transcriber.
Source:peak-stage-driver.c plus retained spectral/refinement/bridge assembly.
"""
from dataclasses import dataclass,replace
import math
import struct
import time
from native_spectral import f32,SpectralPeak,iter_pcm_spectral_frames
from native_peak_windows import prepare_peak_window,native_frequency_record_index
from native_frequency_search import search_peak_candidate,finish_native_peak_record
from native_fundamental_seeds import native_fundamental_peak_record
from native_frame_refinement import NativeRefinedFrame,native_component_type
from native_stereo_spectral import NativeStereoSpectralPeak,iter_native_stereo_spectral_frames
from native_harmonic_similarity import native_harmonic_similarity
from native_peak_cleanup import cleanup_native_peak_frames


def _f(record,offset):return struct.unpack_from('<f',record,offset)[0]
def _set(record,offset,value):struct.pack_into('<f',record,offset,f32(value))


@dataclass(frozen=True)
class NativePeakSequenceResult:
    frames:tuple[NativeRefinedFrame,...]
    retained_peak_frames:tuple[NativeRefinedFrame,...]
    fresh_begin:int
    stage:str='native335480-normal-mono-task-peaks'


def _slot_order(slots,count):
    """335480 first-pivot descending strength sort, including zero/tie slots."""
    order=list(range(count));pending=[(0,count)]
    strength=lambda index:slots[index].strength if index in slots else 0.
    while pending:
        start,stop=pending.pop()
        if start>=stop-1:continue
        #Only zero-strength slots remain in such a partition. Their equal
        #permutation is never consumed:32c560 stops at its first zero slot.
        if not any(strength(order[index])>0 for index in range(start,stop)):continue
        pivot=order[start];left=start;right=stop-1
        while left<right:
            while left<right and strength(order[right])<=strength(pivot):right-=1
            if left<right:order[left]=order[right];left+=1
            while left<right and strength(pivot)<=strength(order[left]):left+=1
            if left<right:order[right]=order[left];right-=1
        order[left]=pivot
        pending.append((start,left));pending.append((left+1,stop))
    return order


def _inject_previous(slots,previous,*,slot_count,base_window,sample_rate,analysis_channels=1):
    """335e5x:seed previous native peaks into first empty(center,left,right)."""
    width=f32(f32(f32(sample_rate)*f32(.5))/f32(base_window))
    for record in previous:
        frequency=_f(record,0)
        slot=int(f32(f32(frequency/width)+f32(.5001)))-1
        if not 0<=slot<slot_count:continue
        for candidate in (slot,slot-1,slot+1):
            if not 0<=candidate<slot_count:continue
            old=slots.get(candidate)
            if old is None or old.frequency_hz==0:
                amplitude=_f(record,0xcc)
                strength=f32(float(amplitude)*(float(base_window)+float(base_window))*.7071067812)
                if analysis_channels==3:
                    balance=struct.unpack_from('<h',record,0xf0)[0]
                    slots[candidate]=NativeStereoSpectralPeak(candidate,strength,frequency,1,candidate+1,
                        stereo_balance=balance)
                else:slots[candidate]=SpectralPeak(candidate,strength,frequency,1,candidate+1)
                break


def _similarity(left,right,flag_91):
    return native_harmonic_similarity(_f(left,0),_f(left,4),_f(right,0),_f(right,4),flag_91=flag_91)


def _bridge_native_peaks(rows,*,fresh_begin,stop,flag_91,analysis_channels=1):
    """3364xx..336ca4:backward then forward original two-frame bridge."""
    for direction,frame_indices in ((-1,range(stop-3,fresh_begin-2,-1)),(1,range(fresh_begin+1,stop))):
        for frame_index in frame_indices:
            current=rows.get(frame_index,())
            distant=rows.get(frame_index-2*direction,())
            middle=rows.get(frame_index-direction)
            if middle is None:continue
            for record in current:
                if record[0xf3]&2:continue
                far=None;strongest=0.
                for other in distant:
                    if other[0xf3]&2:continue
                    if analysis_channels!=1 and abs(struct.unpack_from('<h',record,0xf0)[0]-struct.unpack_from('<h',other,0xf0)[0])>=0x7001:continue
                    score=f32(_similarity(record,other,flag_91)*_f(other,0xcc))
                    if strongest<score:far,strongest=other,score
                if far is None or strongest<=0:continue
                chosen=None;strongest=0.
                for index,other in enumerate(middle):
                    if other[0xf3]&2:continue
                    if analysis_channels!=1 and abs(struct.unpack_from('<h',record,0xf0)[0]-struct.unpack_from('<h',other,0xf0)[0])>=0x7001:continue
                    fraction=_similarity(record,other,flag_91)
                    if fraction<=0:continue
                    fraction=min(fraction,_similarity(far,other,flag_91))
                    score=f32(fraction*_f(other,0xcc))
                    if strongest<score:chosen,strongest=index,score
                if chosen is None:
                    destination=len(middle)
                    if destination==0x200:
                        weakest=None;weakest_amplitude=0.
                        for index,other in enumerate(middle):
                            if other[0xf3]&2:continue
                            amplitude=_f(other,0xcc)
                            if weakest is None or amplitude<weakest_amplitude:weakest,weakest_amplitude=index,amplitude
                        if weakest is not None and weakest_amplitude<_f(record,0xcc):
                            #The original changes the count to the weakest
                            #slot before appending, discarding its later tail.
                            del middle[weakest:];destination=weakest
                    if destination<0x200:
                        copied=bytearray(record)
                        current_amplitude,far_amplitude=_f(record,0xcc),_f(far,0xcc)
                        weighted=f32(f32(_f(far,4)*far_amplitude)+f32(current_amplitude*_f(record,4)))
                        pitch=f32(weighted/f32(current_amplitude+far_amplitude))
                        _set(copied,4,pitch)
                        _set(copied,0,f32(f32(math.pow(2.,f32(f32(pitch-f32(9))/f32(12))))*f32(13.75)))
                        _set(copied,8,0.);copied[0xf3]=0;_set(copied,0xcc,0.)
                        middle.append(copied);chosen=destination
                if chosen is not None:
                    _set(middle[chosen],0xcc,max(_f(middle[chosen],0xcc),_f(record,0xcc)))


def refine_native_peak_sequence(pcm,*,sample_rate,window_context,band_buffers,
        analysis_rate,task_start,task_end,context_bc,previous_peak_frames=(),
        flag_96=True,flag_97=False,flag_98=False,fft=None,pcm_channels=None,progress=None):
    """Concrete ordinary335480 producer and its cross-task peak owner.

    pcm is the real zero-padded task allocation in signed-int16 amplitude
    units. Flags96/97/98 choose the original96/272 peak ceiling; defaults
    match the nativeff03 profile used by the calling whole-song job.
    Returned retained frames are shifted by context+24 for the next task,
    including one preceding frame and the actual+bc lookahead snapshots.
    Mode3 requires explicit pcm_channels=(mean,left,right) bound to the same
    native band owner. Its peak discovery uses separate actualL/R; the fused
    balance chooses source0/1/2 for the real amplitude/phase/frequency search.
    Fresh13c pan remains0 as32c560 explicitly clears it; later trajectory
    refinement owns final real per-side amplitudes/phases and pan.
    """
    if not 0<=task_start<=task_end or context_bc<0:raise ValueError('Native task frame geometry required')
    if sample_rate!=window_context.sample_rate:raise ValueError('Native peak/window sample clocks differ')
    sources=(pcm,) if pcm_channels is None else tuple(pcm_channels)
    analysis_channels=len(sources)
    if analysis_channels not in (1,3) or sources[0] is not pcm:
        raise ValueError('Native peak sources must be the actual mono or(mean,left,right) task allocation')
    if any(len(source)!=len(pcm) for source in sources):
        raise ValueError('Native peak PCM channel clocks differ')
    if len(band_buffers.raw_channels)!=analysis_channels or any(left is not right for left,right in zip(sources,band_buffers.raw_channels)):
        raise ValueError('Native peak sources must match their actual per-channel band owner')
    stage='native335480-normal-stereo-task-peaks' if analysis_channels==3 else 'native335480-normal-mono-task-peaks'
    stop=task_end+context_bc
    available=(len(pcm)+window_context.hop-1)//window_context.hop
    if stop>available:raise ValueError('Native task PCM allocation does not cover its declared lookahead')
    rows={};provenance={}
    for frame in previous_peak_frames:
        if len(frame.component_records_230)!=len(frame.peak_records_13c) or len(frame.source_slots)!=len(frame.peak_records_13c):
            raise ValueError('Retained native peak provenance must remain aligned')
        rows[frame.frame_index]=[]
        for record,component,slot in zip(frame.peak_records_13c,frame.component_records_230,frame.source_slots):
            mutable=bytearray(record);rows[frame.frame_index].append(mutable)
            provenance[id(mutable)]=(component,slot)
    fresh_begin=max(task_start,max((frame.frame_index for frame in previous_peak_frames),default=task_start))
    if fresh_begin>stop:raise ValueError('Retained native peaks do not belong to this task geometry')
    for index in range(task_start,stop):rows.setdefault(index,[])
    base_window=window_context.base_window
    width=f32(f32(f32(sample_rate)*f32(.5))/f32(base_window))
    slot_count=min(base_window,int(f32(f32(window_context.maximum_hz/width)+f32(1.5))))
    peak_limit=0x60 if flag_96 or flag_97 or flag_98 else 0x110
    fft_options={} if fft is None else {'fft':fft}
    if analysis_channels==3:
        spectral_frames=iter_native_stereo_spectral_frames(sources,sample_rate=sample_rate,
            start_frame=fresh_begin,stop_frame=stop,slot_count=slot_count,fft=fft)
    else:
        spectral_frames=iter_pcm_spectral_frames(lambda first,count:pcm[first:first+count],
            sample_count=len(pcm),sample_rate=sample_rate,start_frame=fresh_begin,stop_frame=stop,**fft_options)
    last_notice=0.
    for spectral in spectral_frames:
        index=spectral['frame_index'];slots={peak.slot:peak for peak in spectral['peaks'] if peak.slot<slot_count}
        _inject_previous(slots,rows.get(index-1,()),slot_count=slot_count,base_window=base_window,sample_rate=sample_rate,
            analysis_channels=analysis_channels)
        records=rows[index];limit=peak_limit
        for slot in _slot_order(slots,slot_count):
            now=time.monotonic()
            if progress is not None and now-last_notice>=2:
                progress(index-task_start,stop-task_start,len(records));last_notice=now
            if len(records)>=limit:break
            peak=slots.get(slot)
            if peak is None:break
            descriptor=prepare_peak_window(peak,index,window_context)
            if descriptor is None:break
            band_index=native_frequency_record_index(descriptor.frequency_hz,band_buffers.upper_frequencies,
                band_buffers.bandwidth_989fe0,search=True)
            component_type=native_component_type(getattr(peak,'stereo_balance',None),analysis_channels)
            source=band_buffers.prepare(component_type,band_index,descriptor.begin,descriptor.end,
                descriptor.begin,descriptor.end,index,preweighted=False)
            descriptor,result=search_peak_candidate(sources[component_type],peak,index,window_context,analysis_rate=analysis_rate,
                frequency_record_index=band_index,component_type=component_type,prepared_source=source)
            component=finish_native_peak_record(descriptor,result,frequency_record_index=band_index,component_type=component_type)
            if component==bytes(0x230):
                if len(records)>=0x60:limit-=1
                continue
            mutable=bytearray(native_fundamental_peak_record(component));records.append(mutable)
            provenance[id(mutable)]=(component,slot)
    if progress is not None:progress(stop-task_start,stop-task_start,0)
    _bridge_native_peaks(rows,fresh_begin=fresh_begin,stop=stop,flag_91=window_context.flag_91,
        analysis_channels=analysis_channels)
    def produce(index):
        records=rows[index]
        origins=[provenance.get(id(record),(bytes(0x230),-1)) for record in records]
        return NativeRefinedFrame(index,tuple(bytes(record) for record in records),
            tuple(item[0] for item in origins),tuple(item[1] for item in origins),
            stage=stage)
    #335480336cf6 invokes32dfa0 before the tail cleanup. Its retained
    #snapshot must therefore remain unsorted, undeduplicated and without hum
    #subtraction; the next task cleans its whole reused+fresh range once.
    retained=tuple(replace(produce(index),frame_index=index-window_context.body_frames)
        for index in range(max(task_start,task_end-1),stop))
    cleanup_native_peak_frames(rows,task_start=task_start,task_end=task_end,context_bc=context_bc)
    frames=tuple(produce(index) for index in range(task_start,stop))
    return NativePeakSequenceResult(frames,retained,fresh_begin,stage)


def refine_native_stereo_peak_sequence(pcm_channels,**options):
    """Explicit stereo batch API; returns genuine native13c and230 records."""
    sources=tuple(pcm_channels)
    if len(sources)!=3:raise ValueError('Stereo native peak sequence requires(mean,left,right) sources')
    return refine_native_peak_sequence(sources[0],pcm_channels=sources,**options)
