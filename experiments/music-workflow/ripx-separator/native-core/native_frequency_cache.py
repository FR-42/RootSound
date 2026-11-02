"""36ad30's actual prepared-trajectory representative-pitch reduction.

Instruction ranges 36b05a..36b389, constants in frequency-cache-constants.json.
This is not an invented arithmetic-mean pitch estimator: it follows the two
native passes, native edge trim and semitone rejection. The preceding native
373790/373df0 weights/mask production must be supplied by their recovered
implementation; this module never replaces it with an all-valid mask.
"""
import math
from native_minimum_frames import f32


def representative_pitch_from_prepared(obj, weights, mask, *, timestep: float,
                                       stride: int = 1,
                                       use_secondary_frequency: bool = False) -> float:
    """Reduce the native prepared object with its ACTUAL weights and mask.

    Whole-range input is the 25fc80 ->36b460 call used for note caches.
    Non-default caller ranges are deliberately not inferred. Bit0 rejects a
    native mask entry. All accumulation rounds in float32 as source SSE.
    """
    count = obj.end-obj.start
    step = f32(timestep)
    if not isinstance(stride, int) or stride <= 0:
        raise ValueError('Positive native reduction stride required')
    if not math.isfinite(step) or step <= 0 or count <= 0:
        raise ValueError('Nonempty native object and positive timestep required')
    if len(mask) != count or len(weights) != (count+stride-1)//stride:
        raise ValueError('Actual native weight/mask dimensions do not match object')
    if any(not math.isfinite(float(x)) or x < 0 for x in weights):
        raise ValueError('Invalid native weights')
    data = obj.secondary_frequencies if use_secondary_frequency else obj.frequencies
    if data is None:
        raise ValueError('Requested native frequency array is absent')
    negative = bool(obj.flags_21c & 0x8000)
    if len(data) != (1 if negative else count):
        raise ValueError('Native frequency array length mismatch')
    trim = min(count//4, math.trunc(f32(f32(.10000000149011612)/step)))
    first, end = obj.start+trim, obj.end-trim
    first -= (first-obj.start) % stride

    def usable(index):
        relative = index-obj.start
        value = f32(data[0 if negative else min(count-1, max(0, relative))])
        if not math.isfinite(value) or value < 0:
            raise ValueError('Frequency outside finite nonnegative native domain')
        return relative, value

    log_sum = weight_sum = 0.
    for index in range(first, end, stride):
        relative, frequency = usable(index)
        if frequency == 0 or mask[relative] & 1: continue
        weight = f32(weights[relative//stride])
        log_sum = f32(log_sum + f32(f32(math.log(frequency))*weight))
        weight_sum = f32(weight_sum+weight)
    center_hz = f32(math.exp(f32(log_sum/weight_sum))) if weight_sum != 0 else 440.
    center_pitch = f32(math.log10(float(center_hz)*32./440.)*12./.3010299956639812 + 9.)
    pitch_sum = weight_sum = 0.
    for index in range(first, end, stride):
        relative, frequency = usable(index)
        if frequency == 0 or mask[relative] & 1: continue
        pitch = f32(math.log10(float(frequency)*32./440.)*12./.3010299956639812 + 9.)
        if float(pitch) < float(center_pitch)-1. or float(center_pitch)+1. < float(pitch): continue
        weight = f32(weights[relative//stride])
        pitch_sum = f32(pitch_sum + f32(pitch*weight))
        weight_sum = f32(weight_sum+weight)
    return center_pitch if weight_sum == 0 else f32(pitch_sum/weight_sum)


def frequency_from_representative_pitch(pitch: float) -> float:
    """36b460's actual reverse conversion, retaining native constants/order."""
    pitch = f32(pitch)
    if not math.isfinite(pitch): raise ValueError('Finite native pitch required')
    return f32(math.pow(2., (float(pitch)-9.)/12.)*13.75)


def representative_pitch(obj, *, timestep: float) -> float:
    """Complete default 36ad30 cache path, stride1, full range, primary array."""
    from native_frequency_prepare import prepare_representative_frequency
    prepared, weights, mask = prepare_representative_frequency(obj, timestep=timestep, stride=1)
    return representative_pitch_from_prepared(prepared, weights, mask, timestep=timestep, stride=1)


def representative_frequency(obj, *, timestep: float) -> float:
    """36b460 including its actual prepared-object producer, no callbacks."""
    return frequency_from_representative_pitch(representative_pitch(obj, timestep=timestep))
