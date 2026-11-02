"""Actual 373790/373df0 representative-frequency preparation.

Recovered from whole-373790.c/whole-373df0.c and their independent instruction
exports. No audio/model processing is performed here: input is the native
harmonic object produced by recovered 370a00 packing. Mutable arrays are owned
by this private clone, matching 36b850's default same-length copy boundary.
"""
from dataclasses import replace
import math
from native_minimum_frames import f32


class PreparedNativeObject:
    def __init__(self, original):
        self.original = original
        self.start, self.end = original.start, original.end
        self.flags = original.flags_21c
        self.negative = bool(self.flags & 0x8000)
        self.frequencies = list(original.frequencies)
        self.secondary = (None if original.secondary_frequencies is None else
                          list(original.secondary_frequencies))
        self.harmonic_frequencies = [[list(slot) for slot in harmonic.field_10]
                                    for harmonic in original.harmonics]

    def index(self, absolute):
        return 0 if self.negative else max(0, min(self.end-self.start-1, absolute-self.start))

    def frequency(self, absolute):
        return f32(self.frequencies[self.index(absolute)]) if self.start < self.end else 0.

    def set_primary_and_harmonics(self, absolute, value):
        """373790's inline setter, preserving native additive-mode bit0x80."""
        if not self.start <= absolute < self.end: return
        index, value = self.index(absolute), f32(value)
        previous = f32(self.frequencies[index])
        additive = bool(self.flags & 0x80)
        factor = 0. if additive else 1.
        if value > 0 and previous > 0:
            factor = f32(value-previous) if additive else f32(value/previous)
        self.frequencies[index] = value
        if factor == (0. if additive else 1.): return
        for harmonic in self.harmonic_frequencies:
            for component in harmonic:
                component[index] = f32(component[index]+factor) if additive else f32(component[index]*factor)

    def freeze(self):
        harmonics = tuple(replace(harmonic, field_10=tuple(tuple(slot) for slot in slots))
                          for harmonic, slots in zip(self.original.harmonics, self.harmonic_frequencies))
        return replace(self.original, frequencies=tuple(self.frequencies),
                       secondary_frequencies=None if self.secondary is None else tuple(self.secondary),
                       harmonics=harmonics)


def native_initial_weights(obj, stride=1):
    """36ad30's exact overwrite order; weights are NOT amplitude sums."""
    if not isinstance(stride, int) or stride <= 0: raise ValueError('Positive stride required')
    size = obj.end-obj.start
    weights = None
    for harmonic in obj.harmonics:
        for component in harmonic.amplitudes:
            if len(component) != size: raise ValueError('Native component extent mismatch')
            weights = [f32(max(component[i], 1)) for i in range(0, size, stride)]
    if weights is None:
        raise ValueError('Native producer supplied no components; uninitialized allocation is not modeled')
    return weights


def smooth_native_vibrato(state, weights, mask, *, timestep, stride=1):
    """373790 complete ordinary object path, with original event capacity1024."""
    previous = anchor_frequency = 0.
    sum_frequency = 0.
    sum_weight = 0
    rising = falling = saved_falling = False
    carry = carry_after_flush = False
    turn_frame = 0
    events = []
    for frame in range(state.start, state.end, stride):
        current = state.frequency(frame)
        if current == 0: continue
        flush = False
        if previous == 0:
            rising = falling = saved_falling = False
            sum_weight = 0; sum_frequency = 0.; anchor_frequency = 0.; turn_frame = 0
            events = []
        else:
            divisor = sum_weight & 0xffffffff
            if divisor == 0: raise ValueError('Native weight sum lost its positive denominator')
            average = f32(sum_frequency/divisor)
            margin = f32(average/f32(5.7723846435546875))
            edge = False
            if current < f32(average-margin) or f32(margin+average) < current:
                carry = carry_after_flush = False; flush = True
            elif rising:
                if current < previous:
                    falling = True; rising = False; edge = True
                saved_falling = falling
            elif falling:
                if previous < current:
                    falling = False; rising = True; saved_falling = False; edge = True
            else:
                rising = previous < current
                if current < previous: falling = saved_falling = True
            if edge:
                append = False
                if turn_frame != 0:
                    elapsed = f32(float(f32(timestep))*float((frame-turn_frame)-1))
                    swing_margin = f32(anchor_frequency/f32(34.634307861328125))
                    append = elapsed <= f32(.2) and (previous <= f32(anchor_frequency-swing_margin)
                               or f32(swing_margin+anchor_frequency) <= previous)
                    if append:
                        if len(events) < 1024:
                            distance = f32(abs(f32(anchor_frequency-previous)))
                            events.append((turn_frame, frame-1, f32(average-f32(distance/f32(3.5)))))
                        if len(events) >= 1024:
                            carry = carry_after_flush = True
                        sum_weight = 0; sum_frequency = 0.
                        turn_frame = frame-1; anchor_frequency = current
                        flush = len(events) >= 1024
                    else:
                        carry = carry_after_flush = False; flush = True
                if not append:
                    turn_frame = frame-1; anchor_frequency = current
        weight = f32(weights[(frame-state.start)//stride])
        sum_frequency += float(f32(weight*current))
        sum_weight = math.trunc(f32(f32(sum_weight & 0xffffffff)+weight))
        previous = current
        if flush:
            if len(events) >= 3:
                for first, last, replacement in events:
                    for at in range(first, last+1, stride):
                        state.set_primary_and_harmonics(at, replacement)
                        if not state.start <= at < state.end:
                            raise ValueError('Recovered native event exceeded its object')
                        mask[at-state.start] |= 4
                falling = saved_falling
                carry = carry_after_flush
                if carry:
                    events = events[-3:]
                    continue
            events = []
            previous = 0.


def suppress_native_terminal_glides(state, weights, mask, *, timestep, stride=1,
                                    set_frequency, duration_frame_count):
    """373df0 complete backward scan; setters/count use recovered primitives.

    set_frequency(state, frame, Hz, True) is276380's requested branch;
    duration_frame_count(.2) is36d220. They are supplied explicitly until
    their definitions are recovered, never replaced with heuristics.
    """
    step = f32(timestep)
    unit = f32(step/f32(.1))
    slope_scale = f32(f32(17.317153930664062)/unit)
    minimum_stable = math.trunc((float(step)*.5+.10000000149011612)/float(step))
    trend = 0; transition_count = 0; previous_frequency = 0.; previous_weight = 0
    turn = 0; sum_weight = 0; log_sum = 0.; stable_first = stable_last = 0
    last = state.end-1 - ((state.end-1-state.start) % stride)
    for frame in range(last, state.start+stride-1, -stride):
        current = state.frequency(frame)
        if current == 0: continue
        integer_weight = math.trunc(weights[(frame-state.start)//stride])
        weight_byte = integer_weight & 0xff
        close = False; left = frame
        if state.start+1 < frame:
            earlier = state.frequency(frame-1)
            if earlier == 0: continue
            margin = f32(min(f32(current/f32(17.317153930664062)), f32(4.))*f32(.7))
            older_margin = f32(min(f32(earlier/f32(17.317153930664062)), f32(4.))*f32(.7))
            close = not (f32(margin+current) < f32(earlier-older_margin)
                         or f32(older_margin+earlier) < f32(current-margin))
            if close:
                direction = 1 if current < earlier else (-1 if earlier < current else 0)
                if trend != 0:
                    if direction == trend:
                        previous_weight >>= 1
                        if previous_weight < weight_byte:
                            delta = f32(current/slope_scale)
                            if f32(delta+current) <= earlier or earlier <= f32(current-delta):
                                transition_count += 1
                            previous_frequency, previous_weight = current, weight_byte
                            continue
                        left = frame+1
                    # Different direction or fallen weight finalizes the run.
                else:
                    delta = f32(current/slope_scale)
                    if previous_frequency != 0 and (f32(delta+current) <= earlier or earlier <= f32(current-delta)):
                        transition_count = 1; turn = frame; trend = direction
                        previous_frequency, previous_weight = current, weight_byte
                        continue
                    reset = sum_weight == 0
                    if not reset:
                        center = math.exp(log_sum/sum_weight)
                        reset = current < center-center/17.317153930664062 or center+center/17.317153930664062 < current
                    if reset:
                        sum_weight = 0; log_sum = 0.; stable_first = frame
                    sum_weight = (sum_weight+weight_byte) & 0xffffffff
                    log_sum += float(f32(f32(math.log(current))*f32(weight_byte)))
                    stable_last = frame
                    previous_frequency, previous_weight = current, weight_byte
                    continue
        if trend != 0 and sum_weight != 0:
            distance = turn-left
            minimum_pitch_gap = max(f32(f32(distance+1)*unit), f32(2.))
            current_pitch = f32(math.log10(float(current)*32./440.)*12./.3010299956639812+9.)
            center = math.exp(log_sum/sum_weight)
            center_pitch = f32(math.log10(center*32./440.)*12./.3010299956639812+9.)
            pitch_gap = abs(f32(current_pitch-center_pitch))
            if (transition_count != 0 and minimum_pitch_gap <= pitch_gap
                    and minimum_stable < ((stable_first-stable_last) & 0xffffffff) and left <= turn):
                for at in range(left, turn+1):
                    set_frequency(state, at, f32(center), True)
                    mask[at-state.start] |= 1
                    if duration_frame_count(f32(.2)) < distance: mask[at-state.start] |= 2
            trend = 0; log_sum = 0.; sum_weight = 0
        previous_frequency, previous_weight = current, weight_byte


def native_duration_frames(seconds, timestep):
    """36d220's actual double-seconds -> current-rip frame conversion."""
    step = f32(timestep)
    if not math.isfinite(step) or step <= 0 or not math.isfinite(seconds):
        raise ValueError('Finite seconds and positive current-rip timestep required')
    return math.trunc((float(step)*.5+max(0., float(seconds)))/float(step))


def prepare_representative_frequency(obj, *, timestep, stride=1):
    """36b850(default clone) ->373790 ->373df0, with real native helpers."""
    step = f32(timestep)
    if not math.isfinite(step) or step <= 0: raise ValueError('Positive native timestep required')
    size = obj.end-obj.start
    if size <= 0: raise ValueError('Nonempty native harmonic object required')
    expected = 1 if obj.flags_21c & 0x8000 else size
    if len(obj.frequencies) != expected or any(not math.isfinite(f) or f < 0 for f in obj.frequencies):
        raise ValueError('Invalid native frequency representation')
    if any(len(component) != expected for harmonic in obj.harmonics for component in harmonic.field_10):
        raise ValueError('Native harmonic frequency length mismatch')
    state = PreparedNativeObject(obj)
    weights = native_initial_weights(obj, stride)
    mask = bytearray(size)
    smooth_native_vibrato(state, weights, mask, timestep=step, stride=stride)
    # 276380(...,True) performs exactly the same primary+harmonic correction
    # as373790's inline setter. It deliberately leaves secondary untouched.
    def set_frequency(owner, frame, value, adjust):
        if not adjust: raise ValueError('This source path always adjusts native harmonic frequencies')
        owner.set_primary_and_harmonics(frame, value)
    suppress_native_terminal_glides(state, weights, mask, timestep=step, stride=stride,
        set_frequency=set_frequency,
        duration_frame_count=lambda seconds: native_duration_frames(seconds, step))
    return state.freeze(), tuple(weights), bytes(mask)
