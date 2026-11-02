"""Recovered RipX WAV rendering kernel and unedited harmonic-frame dispatcher.

0x1405aa200 schedules actual frame intervals;0x1405afd00 is the renderer.
Unlike3190b0's residual-analysis kernel, this uses both encoded phases,
linear stereo balance, buffer clipping and native crossfade extension.
Source: whole-5aa200.c,whole-5afd00.c and whole-5afd00-asm.c.
No target executable or public model is loaded or executed.
"""
import math
from native_minimum_frames import f32
from native_pcm_component import native_sine_table

TAU = 6.283185307179586
TABLE_SCALE = 5215.189175235227
PHASE_FRACTION = 4294967296.
MASK64 = (1<<64)-1


def _roundf(value):
    value = f32(value)
    return math.floor(value+.5) if value >= 0 else math.ceil(value-.5)


def decode_native_phases(packed):
    if not isinstance(packed, int) or not 0 <= packed <= 0xffffffff:
        raise ValueError('Raw uint32 native phase word required; float carriers are lossy')
    return (f32(f32(packed & 0xffff)*f32(.0001)),
            f32(f32(packed>>16)*f32(.0001)))


def signed_native_pan(raw):
    if not isinstance(raw, int) or not 0 <= raw <= 0xffff:
        raise ValueError('Raw uint16 native pan word required')
    return raw-65536 if raw & 0x8000 else raw


def render_component_inplace(buffers, *, sample_rate: int, sample_start: int,
                             sample_count: int, frequency: float,
                             phases: tuple[float,float], amplitude: float,
                             pan: int, crossfade_samples: int):
    """5afd00 normal float32 PCM path; buffers are planar mono or stereo.

    Crossfade width is an explicit upstream native scheduling value. This
    kernel never chooses an arbitrary window from FFT size or note duration.
    """
    if not isinstance(sample_rate, int) or sample_rate <= 0:
        raise ValueError('Positive output sample rate required')
    if len(buffers) not in (1,2) or not buffers or any(len(b)!=len(buffers[0]) for b in buffers):
        raise ValueError('Equal planar mono/stereo output buffers required')
    if not all(isinstance(x,int) for x in (sample_start,sample_count,crossfade_samples,pan)):
        raise ValueError('Native sample coordinates and pan must be integers')
    if crossfade_samples < 0 or not -32767 <= pan <= 32767:
        raise ValueError('Unsupported native fade or pan value')
    frequency, amplitude = f32(frequency), f32(amplitude)
    phases = tuple(f32(p) for p in phases)
    if len(phases)!=2 or not all(math.isfinite(x) for x in (frequency,amplitude,*phases)):
        raise ValueError('Finite native renderer values required')
    if amplitude == 0 or frequency <= 0 or frequency >= f32(sample_rate)*.5 or sample_count <= 1:
        return (0,0)
    first=max(-crossfade_samples,-sample_start)
    last=min(sample_count+crossfade_samples,len(buffers[0])-sample_start)
    if first>=last:return (0,0)
    omega=math.fmod(float(frequency)*TAU/float(sample_rate),TAU)
    if omega<0:omega+=TAU
    increment=int(omega*TABLE_SCALE*PHASE_FRACTION+.5)&MASK64
    positions=[]
    for phase in phases:
        angle=math.fmod(float(phase)+float(first)*omega,TAU)
        if angle<0:angle+=TAU
        positions.append((int(angle*TABLE_SCALE*PHASE_FRACTION+.5)-increment)&MASK64)
    if len(buffers)==2:
        right=f32(f32(f32(f32(pan)+f32(32767.))*f32(2.))/f32(65534.))
        left=f32(f32(2.)-right)
        gains=(f32(left*amplitude),f32(right*amplitude))
    else:gains=(amplitude,)
    table=native_sine_table()

    def segment(begin,end,levels,deltas):
        for relative in range(begin,end):
            absolute=relative+sample_start
            for channel in range(len(buffers)):
                positions[channel]=(positions[channel]+increment)&MASK64
                value=table[(positions[channel]>>32)&0x7fff]
                buffers[channel][absolute]=f32(f32(value*levels[channel])+f32(buffers[channel][absolute]))
                levels[channel]=f32(levels[channel]+deltas[channel])

    if crossfade_samples==0:
        segment(first,last,list(gains),[f32(g*0.) for g in gains])
    else:
        #5afd00 extends each side by fade, splits at original count/2.
        midpoint=min(last,int(sample_count/2))
        rising_count=max(0,midpoint-first)
        rising_end=first+rising_count
        reciprocal=f32(1./float(crossfade_samples*2))
        factor=f32(f32(first+crossfade_samples)*reciprocal)
        segment(first,rising_end,[f32(factor*g) for g in gains],
                [f32(reciprocal*g) for g in gains])
        factor=f32(f32(sample_count+crossfade_samples-rising_count-first)*reciprocal)
        segment(rising_end,last,[f32(factor*g) for g in gains],
                [f32(f32(-reciprocal)*g) for g in gains])
    return (sample_start+first,sample_start+last)


def render_harmonic_object_inplace(buffers, obj, *, sample_rate: int,
                                  timestep_27c: float, sample_offset: int,
                                  crossfade_samples: int, output_gain: float,
                                  pan_offset: int = 0):
    """5aaa70/5aa200 unedited constant-timestep harmonic dispatcher.

    sample_offset is the note's actual position on the output buffer clock.
    output_gain and pan_offset are caller-selected native mix values; editor
    offsets, variable timestep arrays and instrument/effect transforms belong
    to their upstream owners rather than being silently approximated here.
    """
    step,gain=f32(timestep_27c),f32(output_gain)
    if not math.isfinite(step) or step<=0 or not math.isfinite(gain) or gain<0:
        raise ValueError('Positive native timestep and nonnegative gain required')
    if not isinstance(sample_offset,int) or not isinstance(pan_offset,int):
        raise ValueError('Integer native output offset/pan required')
    frames=obj.end-obj.start
    if frames<=0:return 0
    negative=bool(obj.flags_21c & 0x8000)
    times=[0.]
    for _ in range(frames):times.append(f32(times[-1]+step))
    segments=0
    for harmonic in obj.harmonics:
        for component, amplitudes in enumerate(harmonic.amplitudes):
            if len(amplitudes)!=frames:raise ValueError('Native amplitude extent mismatch')
            ending=frames
            while ending>0 and f32(f32(amplitudes[ending-1])*gain)<f32(.01):ending-=1
            for frame in range(ending):
                freq_index=0 if negative else frame
                frequency=harmonic.field_10[component][freq_index]
                if frequency==0:continue
                phases=decode_native_phases(harmonic.field_08[component][frame])
                pan=signed_native_pan(harmonic.field_18[component][frame])
                pan=max(-32767,min(32767,pan+max(-32767,min(32767,pan_offset))))
                #5aa200 adds its integer offsets only after converting them
                # to float32. Preserve that boundary even beyond2^24 samples.
                start=int(f32(f32(_roundf(f32(f32(sample_rate)*times[frame])))+f32(sample_offset)))
                end=int(f32(f32(_roundf(f32(f32(sample_rate)*times[frame+1])))+f32(sample_offset)))
                render_component_inplace(buffers,sample_rate=sample_rate,sample_start=start,
                    sample_count=end-start,frequency=frequency,phases=phases,
                    amplitude=f32(f32(amplitudes[frame])*gain),pan=pan,
                    crossfade_samples=crossfade_samples)
                segments+=1
    return segments
