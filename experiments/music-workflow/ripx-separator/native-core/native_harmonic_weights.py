"""31b4c0/346180/31aa20 native harmonic weight construction.

Ported from retained RipX instructions/pseudocode, preserving float32
arithmetic and the separate odd/even envelopes. This is not1/n weighting.
No signal-processing execution was used to validate this construction pass.
"""
import math
import struct
from native_spectral import f32


def _bits(value):
    return struct.unpack('<f', struct.pack('<I', value))[0]


def native_harmonic_envelope(values):
    """31b4c0 parity-specific neighboring-peak floor."""
    values = tuple(map(f32, values)); count = len(values)
    if not 1 <= count <= 48 or any(not math.isfinite(x) or x < 0 for x in values):
        raise ValueError('Native harmonic envelope accepts1..48 finite nonnegative slots')
    output = [0.] * count
    output[0] = values[0]
    for index in range(2, count, 2):
        neighbors = [values[index-2], values[index-1]]
        if index+1 < count:
            neighbors.append(values[index+1])
        if index+2 < count:
            neighbors.append(values[index+2])
        output[index] = min(values[index], max(neighbors))
    for index in range(1, count, 2):
        upper = max(values[index-1], values[index+1] if index+1<count else values[index-1])
        output[index] = min(values[index], upper)
    return output


def native_harmonic_decay(index, fundamental, alternate):
    """346180's exact indexed/frequency branches and float constants."""
    if alternate:
        return _bits(0x3eaaaaab)
    value = f32(fundamental); common = _bits(0x3ebb67af)
    if index == 4:
        if 100 < value <= 150:
            return _bits(0x3e947ae1)
        return _bits(0x3e800000) if 250 < value <= 300 else common
    if index == 5:
        return _bits(0x3e947ae1) if 300 < value <= 350 else common
    if index == 7:
        if 100 < value <= 200:
            return _bits(0x3e800000)
        return _bits(0x3e947ae1) if 200 < value < 250 else common
    if index == 8:
        return _bits(0x3e947ae1) if 70 < value < 150 else common
    if index == 9:
        return _bits(0x3e4ccccd) if 70 < value <= 100 else common
    if index == 10:
        return _bits(0x3e4ccccd) if value < 100 else common
    return _bits(0x3e3b67af) if index >= 12 else common


def native_harmonic_weights(amplitudes, fundamental, *, flag_91, flag_92, flag_93, alternate=False):
    """31aa20's complete bounded harmonic-envelope/peak adjustment."""
    observed = tuple(map(f32, amplitudes)); count = len(observed)
    if not 1 <= count <= 48 or any(not math.isfinite(x) or x<0 for x in observed):
        raise ValueError('Native harmonic weighting accepts1..48 finite nonnegative amplitudes')
    if count == 1:
        return observed
    fundamental = f32(fundamental)
    envelope = native_harmonic_envelope(observed)
    original_envelope = list(envelope)
    total = 0.
    for value in envelope:
        total = f32(total + value)
    factor = f32(1)
    if not(flag_91 or flag_92 or flag_93):
        if 250 < fundamental < 450:
            factor = f32(.5)
        elif 450 <= fundamental < 500:
            factor = f32(.7)
    envelope[1] = max(min(observed[1], f32(total*factor)), envelope[1])
    multiplier = f32(1.2 if flag_92 or flag_93 or (flag_91 and fundamental < 50) else 1)
    peaks = [0.] * count
    limit = min(count-1, 3 if alternate else 23)
    for index in range(2, limit+1):
        peak = observed[index]
        if not(observed[index-1] < peak and (index+1 >= count or observed[index+1] < peak)):
            continue
        cap = peak
        decay = f32(native_harmonic_decay(index, fundamental, alternate) * multiplier)
        left_cap = right_cap = peak
        maximum_neighbors = 24 if alternate else 2
        for pass_index in ((1,0) if alternate else (0,)):
            neighbor_sum = 0.
            for direction in (-1,1):
                bound = (right_cap if direction<0 else left_cap) if alternate else min(left_cap,right_cap)
                for distance in range(1, maximum_neighbors+1):
                    at = index + direction*distance
                    if not 0 <= at < count:
                        break
                    value = envelope[at]
                    if pass_index == 0:
                        bound = f32(bound * decay)
                        neighbor_sum = f32(neighbor_sum + min(value,bound))
                    else:
                        for _ in range(distance):
                            value = f32(value/decay)
                        if direction < 0:
                            right_cap = min(right_cap,value)
                        else:
                            left_cap = min(left_cap,value)
            if pass_index == 0:
                cap = min(cap,neighbor_sum)
        adjusted = min(cap,peak)
        if envelope[index-1] < adjusted and (index+1 >= count or envelope[index+1] < adjusted):
            peaks[index] = max(adjusted,peaks[index])
    attenuation = f32(multiplier * f32(.36602542))
    if not alternate:
        for index in range(2,limit+1):
            value = peaks[index]
            if value:
                for multiple in range(index*2+1,limit+1,index+1):
                    value = f32(value/attenuation)
                    if peaks[multiple] < value:
                        peaks[multiple] = 0.
    output = [max(min(peaks[index],observed[index]),envelope[index]) for index in range(count)]
    even_max = odd_max = 0.
    even_base, odd_base = output[0], min(observed[0],output[1])
    for index in range(count):
        if index>1:
            ceiling = max(even_base,even_max) if index%2==0 else max(odd_base,odd_max)
            ceiling = max(peaks[index],ceiling)
            output[index] = min(output[index],ceiling)
        value = output[index]
        even_max, odd_max = f32(even_max*attenuation), f32(odd_max*attenuation)
        if index%2==0:
            even_max = max(even_max,value)
            floor = f32(f32(attenuation*attenuation)*even_base)
            even_base = max(min(even_base,value),floor)
        else:
            odd_max = max(odd_max,value)
            floor = f32(f32(attenuation*attenuation)*odd_base)
            odd_base = max(min(odd_base,value),floor)
    #31b2xx uses the captured pre-adjustment envelope for this final second-slot
    #limit and its scalar unroll adds each group in3,2,1,previous,0 order.
    summed = 0.; complete=count//4*4
    for start in range(0,complete,4):
        vals=[min(output[start+i],original_envelope[start+i]) for i in range(4)]
        summed=f32(f32(f32(f32(vals[3]+vals[2])+vals[1])+summed)+vals[0])
    for index in range(complete,count):
        summed=f32(min(output[index],original_envelope[index])+summed)
    output[1] = max(min(observed[1],f32(summed*factor)),original_envelope[1])
    return tuple(output)
