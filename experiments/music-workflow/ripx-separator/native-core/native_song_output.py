"""Native objects -> classified WAV stems, MIDI tracks and portable evidence.

The recognizer and classifier own musical facts. This boundary owns files,
serialization and bounded output buffers; it never invents instrument labels.
"""
from dataclasses import asdict,fields,is_dataclass
from pathlib import Path
import json
import math
import struct
import tempfile

import numpy as np
import soundfile as sf

from native_audio_render import render_harmonic_object_inplace
from native_note_cache import build_note_cache
from native_midi_parameters import note_event_parameters
from native_minimum_frames import f32


def _native_json_default(value):
    if is_dataclass(value):return {field.name:getattr(value,field.name) for field in fields(value)}
    raise TypeError(f'Unsupported native output value:{type(value).__name__}')


def _assignment_value(assignment,name,default=None):
    if assignment is None:return default
    return assignment.get(name,default) if isinstance(assignment,dict) else getattr(assignment,name,default)


def _aligned_assignments(assignments,count,*,require_note_identity=False):
    if assignments is None:return (None,)*count
    selected=tuple(assignments)
    if len(selected)!=count:raise ValueError('Native assignments must align with every input note')
    for index,assignment in enumerate(selected):
        if assignment is None:continue
        if require_note_identity and _assignment_value(assignment,'note_index')!=index:
            raise ValueError('Native assignment identity does not match input note index')
        if type(_assignment_value(assignment,'complete')) is not bool:
            raise ValueError('Native assignment completeness must be explicit')
        if not isinstance(_assignment_value(assignment,'source'),str) or not _assignment_value(assignment,'source'):
            raise ValueError('Native assignment provenance source must be explicit')
        identifier=_assignment_value(assignment,'instrument_id')
        if identifier is not None and (type(identifier) is not int or not 0<=identifier<=65535):
            raise ValueError('Native instrument identity must be uint16 or unknown')
        if _assignment_value(assignment,'complete'):
            name=_assignment_value(assignment,'name');program=_assignment_value(assignment,'program_0based')
            if identifier is None or not isinstance(name,str) or not name:
                raise ValueError('Complete native classification requires its source identity and name')
            if type(program) is not int or not 0<=program<=127:
                raise ValueError('Complete native classification requires a valid source MIDI program')
    return selected


def _instrument_identity(assignment,*,negative=False):
    if assignment is not None and _assignment_value(assignment,'complete'):
        identifier=_assignment_value(assignment,'instrument_id')
        return ('instrument',identifier),f'native-{identifier}',_assignment_value(assignment,'name'),identifier
    # These are export descriptions, not names produced by the classifier.
    kind='noise' if negative else 'notes'
    return ('unknown',kind),f'native-unknown-{kind}',f'Unclassified native {kind}',None


def _native_sample_offset(sample_rate,time_seconds):
    value=f32(time_seconds)
    if not math.isfinite(value) or value<0:raise ValueError('Native note origin must be finite and nonnegative')
    return int(f32(f32(f32(sample_rate)*value)+f32(.5)))


def _vlq(value):
    if type(value) is not int or not 0<=value<=0x0fffffff:
        raise ValueError('MIDI delta is outside the SMF variable-length range')
    result=[value&127]
    while value>127:
        value>>=7;result.append((value&127)|128)
    return bytes(reversed(result))


def _midi_voice(assignment):
    if assignment is not None and _assignment_value(assignment,'midi_eligible',True) is False:
        raise ValueError('Ineligible native noise/percussion cannot be supplied as an ordinary MIDI event')
    percussion=bool(_assignment_value(assignment,'percussion',False))
    if percussion:
        # Original304bb0 requires30a110's real key for positive harmonic
        # percussion. Negative objects are excluded before event production.
        key=_assignment_value(assignment,'midi_percussion_key')
        if type(key) is not int or not 0<=key<=127:
            raise NotImplementedError('Original30a110 percussion key is required for channel10')
    else:key=None
    identity,_,label,identifier=_instrument_identity(assignment)
    complete=assignment is not None and _assignment_value(assignment,'complete')
    if complete and _assignment_value(assignment,'midi_track_name') is not None:
        label=_assignment_value(assignment,'midi_track_name')
    program=0 if not complete or percussion else _assignment_value(assignment,'program_0based')
    return (identity,percussion,program),label,identifier,program,percussion,key,not complete


def write_native_midi(path,events,*,coordinate_bpm,assignments=None):
    """SMF1/256 PPQ, grouped by actual source instrument assignment.

    Existing callers may omit assignments and receive explicitly unclassified
    GM0 notes. Events keep the native pitch/velocity conversions. This export
    adapter adds standard MIDI Port meta events when more than15 independent
    melodic voices are present. That packaging extension is not represented as
    original304bb0 sequencing; source-verified percussion uses channel10.
    """
    bpm=float(coordinate_bpm)
    if not math.isfinite(bpm) or not 40<=bpm<=240:
        raise ValueError('Export coordinate BPM must be within40..240')
    events=tuple(events);selected=_aligned_assignments(assignments,len(events))
    groups={}
    for index,(event,assignment) in enumerate(zip(events,selected)):
        identity,label,identifier,program,percussion,key,placeholder=_midi_voice(assignment)
        if not all(type(value) is int and 0<=value<=127 for value in (event.pitch,event.velocity)):
            raise ValueError('Native MIDI event pitch/velocity must be valid bytes')
        group=groups.setdefault(identity,{'label':label,'instrument_id':identifier,'program_0based':program,
            'percussion':percussion,'unclassified_export_placeholder':placeholder,'events':[]})
        group['events'].append((index,event,key))
    if not groups:
        groups[(('unknown','notes'),False,0)]={'label':'Unclassified native notes','instrument_id':None,
            'program_0based':0,'percussion':False,'unclassified_export_placeholder':True,'events':[]}
    tempo=int(60000000/bpm+.5)
    tempo_track=b'\0\xff\x51\x03'+tempo.to_bytes(3,'big')+b'\0\xff\x2f\0'
    bodies=[tempo_track];tracks=[];melodic_index=0
    melodic_channels=tuple(channel for channel in range(16) if channel!=9)
    for group in groups.values():
        if group['percussion']:port,channel=0,9
        else:
            port,voice=divmod(melodic_index,15);channel=melodic_channels[voice];melodic_index+=1
        if port>127:raise ValueError('MIDI Port meta-event capacity exceeded by source instrument groups')
        name=group['label'].encode('utf8')
        if len(name)>255:raise ValueError('Native MIDI track name exceeds the recovered255-byte name boundary')
        body=bytearray(b'\0\xff\x21\x01'+bytes((port,))+b'\0\xff\x03'+_vlq(len(name))+name+
                       bytes((0,0xc0|channel,group['program_0based'])))
        points=[]
        for index,event,percussion_key in group['events']:
            start=int(event.start_seconds*256*bpm/60+.5)
            end=max(start+1,int(event.end_seconds*256*bpm/60+.5))
            pitch=event.pitch if percussion_key is None else percussion_key
            points.append((start,1,index,bytes((0x90|channel,pitch,event.velocity))))
            points.append((end,0,index,bytes((0x80|channel,pitch,0))))
        previous=0
        for tick,_,_,message in sorted(points):
            body.extend(_vlq(tick-previous));body.extend(message);previous=tick
        body.extend(b'\x01\xff\x2f\0');bodies.append(bytes(body))
        tracks.append({key:value for key,value in group.items() if key!='events'}|
                      {'port':port,'channel':channel+1,'event_count':len(group['events']),
                       'packaging':'export-adapter-multiport'})
    with Path(path).open('xb') as output:
        output.write(b'MThd'+struct.pack('>IHHH',6,1,len(bodies),256))
        for body in bodies:output.write(b'MTrk'+struct.pack('>I',len(body))+body)
    return tuple(tracks)


def _midi_eligibility(payload,assignment):
    if payload.harmonic_object.flags_21c&0x8000:
        return False,'304bb0 channel10 excludes signed-negative21c objects'
    if _assignment_value(assignment,'midi_eligible',True) is False:
        return False,_assignment_value(assignment,'midi_limitation','Native producer excluded MIDI export')
    if payload.harmonic_object.flags_21c&0x80:
        key=_assignment_value(assignment,'midi_percussion_key')
        if _assignment_value(assignment,'percussion') is not True or type(key) is not int or not 0<=key<=127:
            return False,'Positive harmonic percussion requires original30a110 key mapping'
    return True,None


def _render_payloads(pcm,payloads,indices,info,output_gain,report,first,last,label):
    for ordinal,index in enumerate(indices):
        payload=payloads[index];step=f32(payload.time_step_27c)
        frame_samples=int(f32(f32(f32(info.samplerate)*step)+f32(.5)))
        offset=_native_sample_offset(info.samplerate,payload.time_fields[0x08])
        render_harmonic_object_inplace(tuple(pcm[channel] for channel in range(info.channels)),
            payload.harmonic_object,sample_rate=info.samplerate,timestep_27c=step,
            sample_offset=offset,crossfade_samples=frame_samples>>1,output_gain=output_gain)
        if ordinal%32==0:
            report(first+(last-first)*(ordinal+1)/max(1,len(indices)),f'{label} {ordinal+1}/{len(indices)}')
    pcm.flush()


def _write_float_wav(path,pcm,info):
    with sf.SoundFile(path,mode='w',format='WAV',subtype='FLOAT',samplerate=info.samplerate,channels=info.channels) as output:
        for start in range(0,info.frames,65536):
            block=np.array(pcm[:,start:start+65536].T,dtype=np.float32)/np.float32(32768)
            output.write(block)


def export_native_song(job,payloads,*,decoded_pcm16,coordinate_bpm,output_gain=1.,
                       minimum_velocity=1,report,assignments=None):
    """Retain all real objects, classified stems and source-derived MIDI.

    Total reconstruction retains original object order. Each stem rerenders
    only its source object group using the same native kernel; this adds one
    render per object, with unmeasured CPU cost. One full-song scratch map at
    a time and65536-frame write blocks bound resident output buffers.
    """
    job=Path(job);source=Path(decoded_pcm16);info=sf.info(source)
    if info.subtype!='PCM_16' or info.channels not in (1,2) or not info.frames:
        raise ValueError('The recovered output path requires nonempty mono/stereo decoded PCM16')
    payloads=tuple(payloads);selected=_aligned_assignments(assignments,len(payloads),require_note_identity=True)
    events=[];event_assignments=[];preview=[];groups={};reasons={};sources={};digests=set()
    unknown_reasons={};native_kinds={}
    complete_count=0;excluded_count=0
    objects_file=job/'native-note-objects.jsonl'
    with objects_file.open('x',encoding='utf8') as objects:
        for index,(payload,assignment) in enumerate(zip(payloads,selected)):
            obj=payload.harmonic_object
            if obj.start!=0 or payload.time_fields[0x08]!=payload.time_fields[0x10]:
                raise NotImplementedError('Edited or non-relative native note rendering is outside this output path')
            negative=bool(obj.flags_21c&0x8000)
            kind='unknown' if obj.native_kind is None else str(obj.native_kind)
            native_kinds[kind]=native_kinds.get(kind,0)+1
            identity,name,label,identifier=_instrument_identity(assignment,negative=negative)
            group=groups.setdefault(identity,{'name':name,'label':label,'file':f'native-stem-{name.removeprefix("native-")}.wav',
                'instrument_id':identifier,'indices':[],'assignment_sources':set(),'percussion_note_count':0,
                'classification_complete':identifier is not None})
            group['indices'].append(index)
            group['percussion_note_count']+=int(bool(obj.flags_21c&0x8080))
            assignment_source=_assignment_value(assignment,'source','not-supplied')
            group['assignment_sources'].add(assignment_source);sources[assignment_source]=sources.get(assignment_source,0)+1
            digest=_assignment_value(assignment,'signature_source_sha256')
            if digest:digests.add(digest)
            complete_count+=int(bool(_assignment_value(assignment,'complete',False)))
            if not _assignment_value(assignment,'complete',False):
                unknown_reason=_assignment_value(assignment,'limitation') or 'Native classification was not supplied'
                unknown_reasons[unknown_reason]=unknown_reasons.get(unknown_reason,0)+1
            eligible,reason=_midi_eligibility(payload,assignment)
            cache=None;event=None
            if eligible:
                cache=build_note_cache(payload)
                event=note_event_parameters(payload,cache,output_gain=output_gain,
                                             minimum_velocity_9886a8=minimum_velocity)
                if event is not None:
                    events.append(event);event_assignments.append(assignment)
            else:
                excluded_count+=1;reasons[reason]=reasons.get(reason,0)+1
            summary={'index':index,'start_seconds':payload.time_fields[0x10],'end_seconds':payload.time_fields[0x14],
                'cache':None if cache is None else asdict(cache),'assignment':assignment,'native_kind':obj.native_kind,
                'midi_eligible':eligible,'midi_emitted':event is not None,'midi_limitation':reason}
            if len(preview)<200:preview.append(summary)
            entry={**summary,'format':'RipXNativeNoteObject','version':1,
                'time_fields':{f'0x{offset:02x}':value for offset,value in payload.time_fields.items()},
                'harmonic_object':obj,'timestep':payload.time_step_27c,
                'phase_encoding':'raw-uint32:low/high uint16 in0.0001 radians'}
            json.dump(entry,objects,ensure_ascii=False,allow_nan=False,default=_native_json_default,separators=(',',':'))
            objects.write('\n')
    # Event-aligned selection retains each original source note_index. The
    # writer owns event ordering, never the recognizer's musical identity.
    midi=job/'native-notes.mid'
    midi_tracks=write_native_midi(midi,events,coordinate_bpm=coordinate_bpm,assignments=event_assignments)
    report(.83,f'原生对象 {len(payloads)}项；分类音轨 {len(groups)}条；写出重建音频')
    stems=[]
    with tempfile.TemporaryDirectory(prefix='.native-output-',dir=job) as temporary:
        scratch=Path(temporary)/'native-output.f32'
        pcm=np.memmap(scratch,dtype=np.float32,mode='w+',shape=(info.channels,info.frames))
        try:
            pcm[:]=0
            _render_payloads(pcm,payloads,range(len(payloads)),info,output_gain,report,.83,.88,'原生重建')
            with sf.SoundFile(source) as original, \
                 sf.SoundFile(job/'native-reconstruction.wav',mode='w',format='WAV',subtype='FLOAT',samplerate=info.samplerate,channels=info.channels) as rendered, \
                 sf.SoundFile(job/'native-residual.wav',mode='w',format='WAV',subtype='FLOAT',samplerate=info.samplerate,channels=info.channels) as residual:
                for start in range(0,info.frames,65536):
                    size=min(65536,info.frames-start)
                    block=np.array(pcm[:,start:start+size].T,dtype=np.float32)/np.float32(32768)
                    original_block=original.read(size,dtype='int16',always_2d=True).astype(np.float32)/np.float32(32768)
                    rendered.write(block);residual.write(original_block-block)
            # Reuse one map sequentially. Total is already safely written;
            # no per-instrument full-song map collection is retained.
            for ordinal,group in enumerate(groups.values()):
                pcm[:]=0
                first=.88+.1*ordinal/max(1,len(groups));last=.88+.1*(ordinal+1)/max(1,len(groups))
                _render_payloads(pcm,payloads,group['indices'],info,output_gain,report,first,last,group['label'])
                _write_float_wav(job/group['file'],pcm,info)
                stems.append({key:value for key,value in group.items() if key not in ('indices','assignment_sources')}|
                    {'note_count':len(group['indices']),'assignment_source':sorted(group['assignment_sources']),
                     'sample_rate':info.samplerate,'frames':info.frames,'channels':info.channels,
                     'unclassified_export_placeholder':not group['classification_complete']})
        finally:del pcm
    classification={'supplied':assignments is not None,'complete_note_count':complete_count,
        'unknown_note_count':len(payloads)-complete_count,'sources':sources,'signature_source_sha256':sorted(digests),
        'unknown_reasons':unknown_reasons,'native_kind_counts':native_kinds,
        'midi_excluded_note_count':excluded_count,'midi_exclusion_reasons':reasons,
        'scope':'source-derived382c80 per-note classifier and382b40 transient type mapping',
        'provenance':{'source_executable_sha256':'5f088fa4fbbe1759ef75d8034c79f33c846e3bf5f13d5048dd95a6614d2ad441',
            'automatic_classifier':'0x140382c80','transient_assignment':'0x140382b40',
            'program_lookup':'0x1406132a0','evidence_kind':'retained-REA-and-static-shipped-data',
            'runtime_equivalence_verified':False},
        'whole_song_native_editor_orchestration_reproduced':False}
    document={'format':'RipXReconstructedNativeSong','version':1,'notes':preview,'note_count':len(payloads),
        'midi_count':len(events),'midi_tracks':midi_tracks,'stems':stems,'classification':classification,
        'objects_file':objects_file.name,'notes_preview_limit':200,'notes_preview_complete':len(payloads)<=200,
        'sample_rate':info.samplerate,'channels':info.channels,'frames':info.frames,'midi':midi.name,
        'reconstruction':'native-reconstruction.wav','residual':'native-residual.wav','public_model_used':False,
        'original_runtime_equivalence_verified':False,'coordinate_bpm':float(coordinate_bpm),
        'tempo_source':'explicit-user-export-coordinate','instrument_assignment':'native-source-classification-with-explicit-unknowns',
        'source_pcm_domain':'signed-int16','midi_packaging':'export-adapter-multiport',
        'limits':{'melodic_midi_channels_per_port':15,'midi_port_meta_event':'FF2101; export adapter extension',
        'percussion_key_source':'requires-original30a110',
        'midi_expression':'native note pitch/velocity only; original dynamic pressure, pitch bend and overlap stack not reconstructed',
        'stem_rendering':'one-extra-native-kernel-render-per-object; sequentially-reused-scratch-map',
        'performance_measured':False,'audio_or_numeric_validation_performed':False}}
    output=job/'native-song.json'
    with output.open('x',encoding='utf8') as target:
        json.dump(document,target,ensure_ascii=False,allow_nan=False,default=_native_json_default)
    return output
