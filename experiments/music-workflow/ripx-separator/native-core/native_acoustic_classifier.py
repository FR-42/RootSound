"""Actual RipX 382c80 single-note classifier with shipped harmonic signatures.

The surrounding whole-song scheduler is this reconstruction's adapter.
3848b0's editor/stem preset branches and contextual regrouping are not claimed
as recovered here. Classification itself follows original native producers.
"""
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path
import json
import math

from native_minimum_frames import f32
from native_acoustic_features import (NativeQuerySignature, frame_amplitude, signature_window,
    attack_ratio, pitch_spread, vibrato_extent, inharmonicity_normalizer, frequency_at,
    NativeClassificationUnavailable)
from native_signature_data import (NativeSignatureExample, NativeHarmonicSignature,
                                    NativeSignatureLibrary)
from native_general_midi import load_native_program_map, native_program_for_name, native_midi_track_name
from native_context_assignment import transient_instrument_id


SOURCE_SHA256 = '5f088fa4fbbe1759ef75d8034c79f33c846e3bf5f13d5048dd95a6614d2ad441'


@dataclass(frozen=True)
class NativeInstrumentCandidate:
    instrument_id: int
    score: float
    quality: int


@dataclass(frozen=True)
class NativeAcousticAssignment:
    note_index: int
    instrument_id: int | None
    name: str | None
    program_0based: int | None
    percussion: bool
    candidates: tuple[NativeInstrumentCandidate, ...]
    complete: bool
    source: str = 'native-382c80-shipped-signatures'
    limitation: str | None = None
    signature_source_sha256: str | None = None
    midi_eligible: bool = True
    midi_limitation: str | None = None
    midi_track_name: str | None = None


@lru_cache(maxsize=1)
def _owned_resources():
    directory = Path(__file__).parent
    metadata = json.loads((directory/'native-builtin-instruments.json').read_text(encoding='utf8'))
    if metadata['source_sha256'] != SOURCE_SHA256:
        raise ValueError('Native instrument definitions have a different executable identity')
    definitions = {item['instrument_id']: item for item in metadata['definitions']}
    for definition in definitions.values():
        if not definition.get('name') or any(value is None for value in definition['fields'].values()):
            raise ValueError('Embedded native definition extraction is incomplete')
    value = json.loads((directory/'native-signature-library.json').read_text(encoding='utf8'))
    library = NativeSignatureLibrary(value['version'],
        tuple(NativeSignatureExample(**entry) for entry in value['examples']),
        tuple(NativeHarmonicSignature(tuple(entry['values_04']),tuple(entry['values_c4']),
              entry['field_184'],entry['example_index_188']) for entry in value['signatures']),
        value['source_path'],value['source_sha256'],value['bytes_examined'],value['source_bytes'])
    if library.source_sha256 != '9c30650d33152928155f70ddc352e4f57fdf37417680c2d639307188386ad262':
        raise ValueError('Native signature source identity changed')
    programs = load_native_program_map(directory/'GeneralMIDI.txt')
    return definitions,library,programs


def native_db(amplitude):
    """365a30 -> 3883b0: floor/clamp table index and original1/32768."""
    index = math.trunc(max(0.,min(32767.,f32(amplitude))))
    return -90. if index == 0 else f32(math.log10(float(index)*3.0517578125e-05)*20.)


def native_pitch_gate(distance):
    """387c00's original piecewise loss, not a replacement distance model."""
    value=f32(distance)
    if value>4.:return 0.
    if value<=1.:return f32(1.-f32(value/100.))
    if value<=3.:return f32(f32(.99)-f32(f32(value-1.)/22.))
    return f32(f32(.9)-f32(f32(value-3.)/12.))


def signature_similarity(query, reference):
    """37c3e0: original amplitude-ratio and phase discrepancy reduction."""
    first,second=query.amplitudes,reference.amplitudes
    total=0.
    for value in first:total=f32(total+value)
    if total<=0:return 0.
    maximum=max(second,default=0.)
    cutoff=f32(native_db(maximum)-50.)
    def considered(index):
        left=first[index] if index<len(first) else 0.
        right=second[index] if index<len(second) else 0.
        return left!=0. or native_db(right)>=cutoff
    minimum=-1.
    for anchor in range(min(6,len(first))):
        if not considered(anchor):continue
        left=first[anchor]
        right=second[anchor] if anchor<len(second) else 0.
        if not left or not right:continue
        discrepancy=0.
        for index in range(min(16,max(len(first),len(second)))):
            if not considered(index):continue
            weight=1. if index<8 else f32(1./(index-6))
            value=first[index] if index<len(first) else 0.
            scaled=f32(f32(left/right)*second[index]) if index<len(second) else 0.
            discrepancy=f32(discrepancy+f32(abs(f32(value-scaled))*weight))
        minimum=discrepancy if minimum == -1. else min(minimum,discrepancy)
    phase_sum=phase_weight=0.
    for index in range(min(len(first),len(second))):
        if first[index] and second[index]:
            weight=max(first[index],second[index])
            period=f32(f32(6.2831855)/f32(index+1))
            delta=f32(query.phases[index]-reference.phases[index])
            if delta>f32(period*f32(.5)):delta=f32(delta-period)
            elif delta<f32(period*f32(-.5)):delta=f32(delta+period)
            phase_weight=f32(phase_weight+weight)
            phase_sum=f32(phase_sum+f32(f32(abs(delta)/period)*weight))
    if phase_weight:phase_sum=f32(phase_sum/phase_weight)
    total=f32(total*f32(1.2))
    discrepancy=f32(minimum*f32(phase_sum+1.))
    ratio=f32(f32(total-discrepancy)/total)
    return f32(native_pitch_gate(abs(query.pitch_188-reference.pitch_188))*ratio)


def score_signature(query, definitions, library):
    """37be30's default no-excluded-example, all-registered-instrument path."""
    scores=[0.]*128;qualities=[0]*128
    best=0.
    quality_weights={1:f32(.6),2:f32(.7),3:f32(.8),4:f32(.9),5:1.}
    thresholds={1:1.,2:f32(.6),3:f32(.7),4:f32(.8),5:f32(.9)}
    for quality in range(5,0,-1):
        for signature in library.signatures:
            example=library.examples[signature.example_index_188]
            if example.field_08!=quality:continue
            identifier=example.instrument_id_04
            definition=definitions.get(identifier)
            if definition is None or not 0<=identifier<128:continue
            fields=definition['fields']
            if not fields['0x08']<=query.pitch_188<=fields['0x0a']:continue
            if not native_pitch_gate(abs(example.kind_00-query.pitch_188)):continue
            reference=NativeQuerySignature(signature.values_04,signature.values_c4,
                                           signature.field_184,example.kind_00)
            score=signature_similarity(query,reference)
            if query.pitch_188>fields['0x09']:score=f32(score*f32(.5))
            score=f32(score*quality_weights[quality])
            if best<score:best=score;qualities[identifier]=quality
            if scores[identifier]<score:scores[identifier]=score
        if best>=thresholds[quality]:break
    return scores,qualities


def select_native_candidates(scores,qualities):
    """381ef0's stable first-maximum scan, threshold0.1, eight candidates."""
    values=list(scores); output=[]
    for _ in range(8):
        score=max(values)
        if score<f32(.1):break
        identifier=values.index(score)
        output.append(NativeInstrumentCandidate(identifier,score,math.trunc(f32(qualities[identifier]+f32(.5)))&255))
        values[identifier]=0.
    return tuple(output)


def classify_native_object(obj, *, timestep, definitions, library):
    """382c80's source-derived per-note computation, without editor dispatch."""
    if obj.flags_21c&0x8000:
        return (), 'Native unpitched type requires its separate382b40 assignment'
    count=obj.end-obj.start
    if count<=0 or len(obj.harmonics)>48:
        raise ValueError('Invalid native object coverage for instrument classification')
    step=f32(timestep)
    if not math.isfinite(step) or step<=0:raise ValueError('Positive native timestep required')
    amplitudes=[frame_amplitude(obj,frame) for frame in range(obj.start,obj.end)]
    mean=sum(float(value) for value in amplitudes)/count
    variance=sum(float(value)*float(value) for value in amplitudes)/count-mean*mean
    deviation=math.sqrt(max(0.,variance))
    length=max(2,math.trunc(f32(f32(f32(.025)/step)+f32(.5))))
    original_length=length
    aggregate=[0.]*128;quality_sums=[0.]*128
    windows=0;previous=None;similarity=0.
    while length>0:
        cursor=obj.start
        while cursor<=obj.end-length:
            query,examined=signature_window(obj,cursor,length,timestep=step,
                 minimum_amplitude=mean-deviation*.5,maximum_amplitude=mean+deviation*1.4)
            if query is None:cursor=examined+1;continue
            if previous is not None:similarity=f32(similarity+signature_similarity(query,previous))
            previous=query
            scores,qualities=score_signature(query,definitions,library)
            for index in range(128):
                aggregate[index]=f32(aggregate[index]+scores[index])
                quality_sums[index]=f32(quality_sums[index]+qualities[index])
            windows+=1;cursor+=length
        if windows:break
        length+=1-original_length
    if not windows:return (), 'No native amplitude-gated signature window was accepted'
    scores=[f32(value/f32(windows)) for value in aggregate]
    qualities=[f32(value/f32(windows)) for value in quality_sums]
    attack=attack_ratio(obj,step);vibrato=vibrato_extent(obj,step);spread=pitch_spread(obj,step)
    changing=f32(1.-(1. if windows<2 else f32(similarity/f32(windows-1))))
    duration=f32(f32(count)*step)
    inharm=f32(obj.weighted_218)
    normalizer=inharmonicity_normalizer(frequency_at(obj,obj.start)) if inharm>0 else 0.
    for identifier,definition in definitions.items():
        if identifier>=128 or not scores[identifier]:continue
        fields=definition['fields'];flags=fields['0x28'];value=scores[identifier]
        if flags&0x10:continue
        def reduce(penalty):
            nonlocal value
            value=f32(value*f32(1.-f32(penalty)))
        if flags&0x40:reduce(min(f32(.4),max(0.,f32(max(0.,f32(spread-f32(.3)))-f32(vibrato*2.)))))
        if fields['0x0c']<attack:reduce(min(f32(.4),f32(f32(attack-fields['0x0c'])/3.)))
        if fields['0x1c']<vibrato:reduce(min(f32(.5),f32(f32(vibrato-fields['0x1c'])/f32(.2))))
        if flags&4 and duration>f32(.2) and vibrato<f32(.1):reduce(f32(f32(1.-f32(vibrato/f32(.1)))*f32(.1)))
        if spread>fields['0x20']:reduce(min(f32(.1),f32(f32(spread-fields['0x20'])*f32(.25))))
        elif flags&2:reduce(min(f32(.4),max(0.,f32(f32(.4)-spread))))
        if changing>fields['0x24']:reduce(min(f32(.15),f32(f32(changing-fields['0x24'])*f32(.5))))
        elif flags&2:reduce(min(f32(.2),f32(max(0.,f32(f32(.05)-changing))*4.)))
        if duration<fields['0x2c']:reduce(min(f32(.4),f32(fields['0x2c']-duration)))
        rate=f32(spread/duration)
        if fields['0x30']<rate:reduce(min(f32(.4),f32(f32(rate-fields['0x30'])/f32(1.5))))
        if not flags&0x80 and inharm>0:
            # Positive/zero is +infinity in the source SSE path, after which
            # its explicit0.2 cap applies. This is a known source branch.
            reduce(f32(.2) if normalizer == 0 else min(f32(.2),f32(f32(inharm*16.)/normalizer)))
        scores[identifier]=value
    scores[4]=f32(f32(scores[4]+scores[5])+scores[6]);scores[5]=scores[6]=0.
    scores[7]=f32(scores[7]+scores[8]);scores[8]=0.
    scores[3]=f32(f32(scores[3]*f32(.6))+scores[3])
    candidates=list(select_native_candidates(scores,qualities))
    if candidates:
        first=candidates[0]
        if definitions[first.instrument_id]['fields']['0x28']&8:
            for position,candidate in enumerate(candidates[1:],1):
                if candidate.instrument_id in (1,2):
                    if candidate.score<=f32(first.score-f32(.1)):break
                    candidates[position]=first
                    candidates[0]=NativeInstrumentCandidate(candidate.instrument_id,f32(candidate.score+f32(.1)),candidate.quality)
                    break
        elif first.instrument_id in (1,2) and len(candidates)>1 and definitions[candidates[1].instrument_id]['fields']['0x28']&8:
            adjusted=NativeInstrumentCandidate(first.instrument_id,f32(first.score-f32(.1)),first.quality)
            candidates[0]=adjusted
            if adjusted.score<candidates[1].score:candidates[0],candidates[1]=candidates[1],adjusted
    return tuple(candidates), None


def classify_native_notes(payloads, *, context_mode_14=None):
    """Return aligned real automatic instrument assignments for native notes.

    Unknown/negative-type boundaries retain their own explicit attribution;
    ordinary source ID0 is named Other and is not relabelled as Piano.
    """
    definitions,library,programs=_owned_resources()
    output=[]
    for index,payload in enumerate(payloads):
        obj=payload.harmonic_object
        percussion=bool(obj.flags_21c&0x8080)
        if obj.flags_21c&0x8000:
            identifier=transient_instrument_id(obj.native_kind,context_mode_14=context_mode_14)
            name=None if identifier is None else definitions[identifier]['name']
            reason=None if identifier is not None else '382b40 requires preserved native kind and its original context14'
            output.append(NativeAcousticAssignment(index,identifier,name,
                None if name is None else native_program_for_name(native_midi_track_name(name),programs).program_0based,
                percussion,(),identifier is not None,source='native-382b40-transient-kind',
                limitation=reason,signature_source_sha256=library.source_sha256,
                midi_eligible=False,midi_limitation='304bb0 channel10 excludes signed-negative21c objects',
                midi_track_name=None if name is None else native_midi_track_name(name)))
            continue
        try:
            candidates,limitation=classify_native_object(obj,timestep=payload.time_step_27c,
                                                        definitions=definitions,library=library)
        except NativeClassificationUnavailable as failure:
            candidates,limitation=(),str(failure)
        identifier=candidates[0].instrument_id if candidates else (0 if limitation is None else None)
        name=definitions[identifier]['name'] if identifier is not None else None
        program=None if name is None else native_program_for_name(native_midi_track_name(name),programs).program_0based
        output.append(NativeAcousticAssignment(index,identifier,name,program,percussion,candidates,
            limitation is None,limitation=limitation,signature_source_sha256=library.source_sha256,
            midi_eligible=not percussion,midi_limitation=None if not percussion else
            'Positive harmonic percussion requires original30a110 key mapping',
            midi_track_name=None if name is None else native_midi_track_name(name)))
    return tuple(output)
