"""382c80's actual harmonic signature windows and note feature producers.

Sources: remaining-{380d90,382540,381980,3827e0,36a7f0,36c2a0}.c.
No note detector or public timbre model is used at this boundary.
"""
from dataclasses import dataclass
import math
from native_minimum_frames import f32


class NativeClassificationUnavailable(ValueError):
    """An expected native feature boundary is not supported for this object."""


@dataclass(frozen=True)
class NativeQuerySignature:
    amplitudes: tuple[float, ...]
    phases: tuple[float, ...]
    inharmonicity_184: float
    pitch_188: int


def frame_amplitude(obj, frame, harmonic=None):
    """36a7f0's all-component uint16 sum, with source frame clamping."""
    relative = max(0, min(obj.end-obj.start-1, frame-obj.start))
    total = 0.
    selected = obj.harmonics if harmonic is None else (obj.harmonics[harmonic],)
    for item in selected:
        for component in item.amplitudes:
            total = f32(total + component[relative])
    return total


def frequency_at(obj, frame):
    if obj.start >= obj.end: return 0.
    index = 0 if obj.flags_21c & 0x8000 else max(0,min(obj.end-obj.start-1,frame-obj.start))
    return f32(obj.frequencies[index])


def harmonic_frequency(obj, harmonic, frame):
    index = max(0,min(obj.end-obj.start-1,frame-obj.start))
    if not harmonic.ordinal or obj.flags_21c & 0x8000:
        return f32(harmonic.field_10[0][0 if obj.flags_21c & 0x8000 else index])
    value = f32(harmonic.ordinal*frequency_at(obj,frame))
    if obj.weighted_218 > 0:
        value = f32(f32(f32((harmonic.ordinal*harmonic.ordinal-1)*obj.weighted_218)+1.)*value)
    return value


def inharmonicity_normalizer(frequency):
    """36c2a0, original90Hz threshold and executable float4e-6 constant."""
    value = f32(frequency)
    if value < 90.: return 0.
    value = f32(value-90.)
    return f32(f32(value*value)*f32(3.999999989900971e-06))


def _phase(obj, harmonic, frame):
    relative = frame-obj.start
    word = harmonic.field_08[0][relative]
    side = harmonic.field_18[0][relative]
    phase = word & 65535 if side & 0x8000 else word >> 16
    return f32(phase*f32(.0001))


def _wrap(value, period=math.tau):
    value = math.fmod(value,period)
    return value+period if value < 0 else value


def signature_window(obj, start, length, *, timestep, minimum_amplitude, maximum_amplitude):
    """380d90: phase-align real harmonic components to one native window.

    A failed amplitude gate returns the examined frame to the source scanner.
    Only the actual first phase/component array is used by original code.
    """
    amplitudes, phase_sums, aligned = [0.]*48, [0.]*48, [0.]*48
    weighted_frequency = total_amplitude = 0.
    count = 0
    stop = min(obj.end,start+length)
    for frame in range(start,stop):
        amplitude = frame_amplitude(obj,frame)
        if minimum_amplitude >= 0 and maximum_amplitude >= 0 and not minimum_amplitude <= amplitude <= maximum_amplitude:
            return None, frame
        weighted_frequency = f32(float(frequency_at(obj,frame))*float(amplitude)+float(weighted_frequency))
        total_amplitude = f32(float(total_amplitude)+float(amplitude))
        for index,harmonic in enumerate(obj.harmonics):
            slot = harmonic.ordinal-1 if harmonic.ordinal else index
            if not 0 <= slot < 48: raise ValueError('Native harmonic ordinal exceeds classifier array')
            count = max(count,slot+1)
            value = f32(frame_amplitude(obj,frame,index)/f32(length))
            amplitudes[slot] = f32(amplitudes[slot]+value)
            phase = _phase(obj,harmonic,frame)
            for previous in range(frame-1,start-1,-1):
                advance = f32(f32(harmonic_frequency(obj,harmonic,previous)*timestep)*f32(6.2831855))
                phase = f32(phase-advance)
            delta = f32(_wrap(phase)-float(_phase(obj,harmonic,start)))
            if delta > f32(math.pi): delta = f32(delta-f32(math.tau))
            elif delta < f32(-math.pi): delta = f32(delta+f32(math.tau))
            phase_sums[slot] = f32(phase_sums[slot]+f32(delta*value))
    for index,harmonic in enumerate(obj.harmonics):
        slot = harmonic.ordinal-1 if harmonic.ordinal else index
        if amplitudes[slot]:
            phase = _wrap(float(f32(_phase(obj,harmonic,start)+f32(phase_sums[slot]/amplitudes[slot]))))
            frequency = harmonic_frequency(obj,harmonic,start)
            if frequency == 0: raise NativeClassificationUnavailable('Native nonzero signature amplitude has zero harmonic frequency')
            aligned[slot] = f32(f32(frequency_at(obj,start)/frequency)*f32(phase))
    phases = [0.]*48
    for index,harmonic in enumerate(obj.harmonics[1:],1):
        slot = harmonic.ordinal-1 if harmonic.ordinal else index
        if not amplitudes[slot]: continue
        period = f32(math.tau/(slot+1))
        total = 0.
        for previous,prior in enumerate(obj.harmonics[:index]):
            prior_slot = prior.ordinal-1 if prior.ordinal else previous
            if not amplitudes[prior_slot]: continue
            reduced = _wrap(float(aligned[prior_slot]),float(period))
            delta = f32(float(aligned[slot])-reduced)
            if delta > float(period)*.5: delta = f32(delta-period)
            elif delta < float(-period)*.5: delta = f32(delta+period)
            total = f32(total+amplitudes[prior_slot])
            phases[slot] = f32(f32(amplitudes[prior_slot]*delta)+phases[slot])
        if total: phases[slot] = f32(phases[slot]/total)
    maximum = max(amplitudes[:count],default=0.)
    while count and amplitudes[count-1] <= f32(maximum*f32(.015625)):
        count -= 1
    mean = f32(weighted_frequency/total_amplitude) if total_amplitude > 0 else 0.
    pitch = 0 if mean <= 0 else math.trunc(f32(f32(12.*math.log10(float(mean)*32./440.)/math.log10(2.)+9.)+f32(.5))) & 255
    normalizer = inharmonicity_normalizer(mean)
    if total_amplitude <= 0: return None, stop
    ratio = f32(obj.weighted_218/normalizer) if normalizer else (0. if not obj.weighted_218 else math.inf)
    return NativeQuerySignature(tuple(amplitudes[:count]),tuple(phases[:count]),ratio,pitch), stop


def attack_ratio(obj, timestep):
    """382540's early/late smoothed amplitude maximum ratio, capped at4."""
    initial = min(max(1,math.trunc(f32(f32(.3/timestep)+f32(.5)))),(obj.end-obj.start)//3)
    peak, peak_index = 0.,0
    def smooth(frame):
        return f32(f32(f32(frame_amplitude(obj,frame-1)+frame_amplitude(obj,frame))+frame_amplitude(obj,frame+1))/f32(3.))
    for frame in range(obj.start+1,min(obj.end-1,obj.start+initial)):
        value = smooth(frame)
        if value > peak: peak,peak_index=value,frame
    if not peak:return 0.
    first = min((obj.end+peak_index)//2,peak_index+max(1,math.trunc(f32(f32(.3/timestep)+f32(.5)))))
    late = max((smooth(frame) for frame in range(first,obj.end-1)),default=0.)
    return min(4.,f32(peak/max(1.,late)))


def pitch_spread(obj,timestep):
    """3827e0's minimum sliding-window semitone spread."""
    length = min(obj.end-obj.start,max(1,math.trunc(f32(f32(.3/timestep)+f32(.5)))))
    best = -1.
    for start in range(obj.start,obj.end-length+1,2):
        low=high=-1.
        for frame in range(start+1,start+length-1,2):
            value=f32(f32(f32(frequency_at(obj,frame)+frequency_at(obj,frame-1))+frequency_at(obj,frame+1))/f32(3.))
            low=value if low == -1. else min(low,value)
            high=value if high == -1. else max(high,value)
        if low <= 0 or high <= 0:
            raise NativeClassificationUnavailable('3827e0 has no positive interior frequency coverage for this short window')
        value=f32(f32(12.*math.log10(float(high)*32./440.)/math.log10(2.)+9.)-f32(12.*math.log10(float(low)*32./440.)/math.log10(2.)+9.))
        best=value if best == -1. else min(best,value)
    return max(0.,best)


def vibrato_extent(obj,timestep):
    """381980's confirmed repeated extrema feature; no guessed vibrato model."""
    previous=mean_sum=peak=extent=0.
    weight=0
    rising=falling=False
    extrema=[]
    previous_extreme=0
    saturated=False
    for frame in range(obj.start,obj.end):
        value=frequency_at(obj,frame)
        if value == 0:continue
        boundary=False
        next_peak=peak
        next_extreme=previous_extreme
        if previous == 0:
            rising=falling=False; weight=0; mean_sum=0.; next_peak=0.; next_extreme=0
        else:
            average=f32(mean_sum/weight)
            if value < f32(average-f32(average/f32(5.7723846))) or value > f32(average+f32(average/f32(5.7723846))):
                boundary=True; saturated=False
            else:
                turn=False
                if rising:
                    if value < previous:falling=True; rising=False; turn=True
                elif falling:
                    if previous < value:falling=False; rising=True; turn=True
                else:
                    rising=previous < value
                    if value < previous:falling=True
                if turn:
                    next_peak=value; next_extreme=frame-1
                    if previous_extreme:
                        close=f32(peak-f32(peak/f32(173.17154))) < previous < f32(peak+f32(peak/f32(173.17154)))
                        if (frame-previous_extreme-1)*float(timestep) > .2 or close:
                            boundary=True; saturated=False
                        else:
                            if len(extrema)<1024:extrema.append((peak,previous))
                            saturated=len(extrema)>=1024; boundary=saturated
                            weight=0; mean_sum=0.
        amplitude=max(1.,frame_amplitude(obj,frame))
        weight=int(f32(f32(weight)+amplitude))
        mean_sum+=float(f32(amplitude*value))
        previous=value; peak=next_peak; previous_extreme=next_extreme
        if boundary:
            if len(extrema)<3:previous=0.;extrema=[]
            else:
                for low,high in extrema:
                    if low > 0 and high > 0:
                        difference=abs(f32(12.*math.log10(float(high)*32./440.)/math.log10(2.)+9.)-f32(12.*math.log10(float(low)*32./440.)/math.log10(2.)+9.))
                        extent=max(extent,f32(difference*f32(.5)))
                if saturated:extrema=extrema[-3:]
                else:extrema=[];previous=0.
    return extent
