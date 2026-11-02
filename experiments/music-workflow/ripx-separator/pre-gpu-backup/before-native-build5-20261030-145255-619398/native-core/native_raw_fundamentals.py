"""Fresh-frame324770 native raw-fundamental production.

This implements the actually entered first iteration(local744<1), two
fixed/free initial fits,48-harmonic matching,31aa20 weights and0xd94 records.
334230's subsequent residual-driven selection/re-estimation is a separate
stage;0xd94 records must not be renamed0x3c18 selected candidates.
"""
from dataclasses import dataclass
import math
import struct

from native_spectral import f32
from native_fundamental_seeds import NativeFundamentalPeak, NativeSeedHistory
from native_seed_extension import native_fundamental_inputs, initialize_native_fundamental
from native_harmonic_weights import native_harmonic_weights
from native_harmonic_similarity import native_harmonic_similarity


def _pitch(frequency):
    return f32((math.log10((float(frequency)*32.)/440.)*12.)/.3010299956639812+9.)


@dataclass(frozen=True)
class NativeRawFundamental:
    fundamental_hz: float
    stretch: float
    score: float
    stereo_balance: int
    seed_peak_indices: tuple[int, ...]
    matched_peak_indices: tuple[int, ...]
    matched_amplitudes: tuple[float, ...]
    weighted_amplitudes: tuple[float, ...]
    expected_pitches: tuple[float, ...]
    observed_frequencies: tuple[float, ...]
    harmonic_count: int
    frame_index: int
    stage: str = 'native-raw-fundamental-before-residual-selection'

    def record_d94(self):
        result=bytearray(0xd94)
        struct.pack_into('<fff',result,0,self.fundamental_hz,self.stretch,self.score)
        for index in range(48):
            offset=0xc+index*0x20
            struct.pack_into('<ii',result,offset,self.matched_peak_indices[index],
                self.seed_peak_indices[index] if index<8 and index<self.harmonic_count else -1)
            if index<self.harmonic_count:
                struct.pack_into('<fff',result,offset+8,self.weighted_amplitudes[index],
                    self.expected_pitches[index],self.matched_amplitudes[index])
            else:
                struct.pack_into('<f',result,offset+0xc,self.expected_pitches[index])
        result[0xd8c]=0xff
        struct.pack_into('<hBB',result,0xd90,self.stereo_balance,self.harmonic_count,1)
        return bytes(result)

    def seed_history(self):
        return NativeSeedHistory(tuple(value if i<self.harmonic_count else -1
            for i,value in enumerate(self.seed_peak_indices)),self.matched_peak_indices[:8])


def _match(peaks,order,f0,stretch,balance,context,seed):
    expected=[0.]*48; amplitudes=[0.]*48; matches=[-1]*48; observed=[0.]*8
    base=f32(10 if context.flag_91 else 8.5)
    used=0
    for index in range(48):
        n=f32(index+1)
        frequency=f32(n*f0)
        if stretch>0:
            frequency=f32(f32(f32(f32(n*n)-f32(1))*stretch)+f32(1))*frequency
            frequency=f32(frequency)
        if frequency>16100:
            break
        pitch=_pitch(frequency);expected[index]=pitch
        best_score=0.;best=-1
        for at in order:
            peak=peaks[at];pf=f32(peak.frequency_hz);pp=_pitch(pf)
            if pp<=f32(pitch-f32(1)) and not f32(frequency-base)<pf:
                continue
            if f32(pitch+f32(1))<=pp and f32(frequency+base)<=pf:
                break
            if abs(balance-peak.stereo_balance)>=0x7001:
                continue
            similarity=native_harmonic_similarity(frequency,pitch,pf,pp,flag_91=context.flag_91)
            score=f32(similarity*f32(peak.amplitude))
            if best_score<score:
                best_score,best=score,at
        if best>=0:
            amplitudes[index]=best_score;matches[index]=best;used=index+1
            if index<8:observed[index]=f32(peaks[best].frequency_hz)
    if not used:
        return None
    weighted=list(native_harmonic_weights(amplitudes[:used],f0,flag_91=context.flag_91,
        flag_92=context.flag_92,flag_93=context.flag_93,alternate=False))+[0.]*(48-used)
    score=0.
    for value in weighted[:used]:score=f32(score+value)
    return NativeRawFundamental(f0,stretch,score,balance,seed.harmonic_peak_indices,
        tuple(matches),tuple(amplitudes),tuple(weighted),tuple(expected),tuple(observed),used,seed.frame_index)


class NativeRawFundamentalTable:
    """324770 fresh-call raw record and333930 history owner."""
    def __init__(self,peaks,context,frequency_order=None):
        self.peaks=peaks;self.context=context
        self.order=tuple(sorted(range(len(peaks)),key=lambda i:peaks[i].frequency_hz)) if frequency_order is None else tuple(frequency_order)
        self.records=[];self.history=[]

    def _register(self,candidate):
        total=0.
        for value in candidate.matched_amplitudes[:candidate.harmonic_count]:total=f32(total+value)
        replacement=None
        for index in range(len(self.records)-1,-1,-1):
            old=self.records[index];equal=True;comparable=True
            for h in range(max(old.harmonic_count,candidate.harmonic_count)):
                if old.matched_peak_indices[h]!=candidate.matched_peak_indices[h]:
                    equal=False
                    if old.matched_peak_indices[h]>=0:
                        comparable=False;break
            if not comparable:continue
            old_pitch,new_pitch=old.expected_pitches[0],candidate.expected_pitches[0]
            if abs(f32(old_pitch-new_pitch))>=.5:
                frequency_difference=(f32(candidate.observed_frequencies[0]-old.fundamental_hz)
                    if old_pitch<=new_pitch else f32(old.fundamental_hz-candidate.observed_frequencies[0]))
                if frequency_difference>=6.5:continue
            if total<old.score or(total==old.score and equal):return
            if candidate.score<old.score or(candidate.score==old.score and equal):return
            if replacement is None or old.score<self.records[replacement].score:
                replacement=index
        if replacement is None:
            if len(self.records)>=0xc00:return
            self.records.append(candidate);self.history.append(candidate.seed_history())
        else:
            self.records[replacement]=candidate;self.history[replacement]=candidate.seed_history()

    def consume(self,seed):
        from reconstructed_pitch_math import fit_inharmonicity
        initial=initialize_native_fundamental(self.peaks,seed,self.context)
        if initial is None:return
        count=max((i+1 for i,value in enumerate(initial.amplitudes) if value!=0),default=0)
        if not count:return
        weights=list(native_harmonic_weights(initial.amplitudes[:count],initial.fundamental_hz,
            flag_91=self.context.flag_91,flag_92=self.context.flag_92,flag_93=self.context.flag_93,
            alternate=False))+[0.]*(8-count)
        free=fit_inharmonicity(initial.frequencies,weights,fixed_f0=0.,restrict_range=True)
        fits=[]
        if initial.frequencies[0]!=0:
            fixed=fit_inharmonicity(initial.frequencies,weights,fixed_f0=initial.frequencies[0],restrict_range=True)
            if fixed!=free:fits.append(fixed)
        fits.append(free)
        for f0,stretch in fits:
            if not 0<f0 or not self.context.minimum_fundamental<=f0<=self.context.maximum_fundamental:continue
            candidate=_match(self.peaks,self.order,f0,stretch,seed.stereo_balance,self.context,seed)
            if candidate is not None:self._register(candidate)


def native_raw_fundamentals(refined_frame,context,*,frequency_order=None):
    """Concrete13c frame→native pair/recursive seeds→weighted raw f0 table."""
    peaks=[NativeFundamentalPeak.from_record(record) for record in refined_frame.peak_records_13c]
    table=NativeRawFundamentalTable(peaks,context,frequency_order)
    for seed in native_fundamental_inputs(peaks,context,frame_index=refined_frame.frame_index,
                                         history=table.history,frequency_order=table.order):
        table.consume(seed)
    return tuple(table.records)


def refit_native_raw_fundamental(peak_records,context,harmonic_indices,*,frame_index,frequency_order=None):
    """324770 existing-record mode:free fit only, no fresh-table dedup.

    334230 clears the destination before reading its balance for this call,
    so the observed existing-record path passes zero balance. Only the
    original eight seed slots participate in its initial weighted fit.
    """
    from native_seed_extension import NativeExtendedSeed
    from reconstructed_pitch_math import fit_inharmonicity
    peaks=[NativeFundamentalPeak.from_record(record) for record in peak_records]
    slots=tuple(harmonic_indices[:8])
    occupied=[i for i,value in enumerate(slots) if value>=0]
    if not occupied:return None
    seed=NativeExtendedSeed(slots,occupied[0],occupied[-1],0,frame_index)
    initial=initialize_native_fundamental(peaks,seed,context)
    if initial is None:return None
    count=max((i+1 for i,value in enumerate(initial.amplitudes) if value!=0),default=0)
    if not count:return None
    weights=list(native_harmonic_weights(initial.amplitudes[:count],initial.fundamental_hz,
        flag_91=context.flag_91,flag_92=context.flag_92,flag_93=context.flag_93))+[0.]*(8-count)
    f0,stretch=fit_inharmonicity(initial.frequencies,weights,fixed_f0=0.,restrict_range=True)
    if not 0<f0 or not context.minimum_fundamental<=f0<=context.maximum_fundamental:return None
    order=tuple(sorted(range(len(peaks)),key=lambda i:peaks[i].frequency_hz)) if frequency_order is None else tuple(frequency_order)
    candidate=_match(peaks,order,f0,stretch,0,context,seed)
    return candidate.record_d94() if candidate is not None else None
