"""Whole-song output from recovered native note objects and rendering kernel.

No audio-to-note model is imported. The native recognizer owns payloads;
this boundary owns files, MIDI serialization and bounded output buffers.
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
    # Shallow field access avoids asdict deep-copying all harmonic arrays.
    # JSON recursively encodes the owned immutable tuples/dataclasses itself.
    if is_dataclass(value):return {field.name:getattr(value,field.name) for field in fields(value)}
    raise TypeError(f'Unsupported native output value:{type(value).__name__}')


def _native_sample_offset(sample_rate,time_seconds):
    value=f32(time_seconds)
    if not math.isfinite(value) or value<0:raise ValueError('Native note origin must be finite and nonnegative')
    return int(f32(f32(f32(sample_rate)*value)+f32(.5)))


def _vlq(value):
    if type(value) is not int or not 0 <= value <= 0x0fffffff:
        raise ValueError('MIDI delta is outside the SMF variable-length range')
    result = [value & 127]
    while value > 127:
        value >>= 7; result.append((value & 127) | 128)
    return bytes(reversed(result))


def write_native_midi(path, events, *, coordinate_bpm):
    """SMF1/256 PPQ; event pitch/velocity already follow native conversions.

    BPM is an explicit user export coordinate. This does not invent beat
    detection or pretend that a fixed grid is recovered RipX tempo analysis.
    """
    bpm = float(coordinate_bpm)
    if not math.isfinite(bpm) or not 40 <= bpm <= 240:
        raise ValueError('Export coordinate BPM must be within40..240')
    tempo = int(60000000 / bpm + .5)
    tempo_track = b'\0\xff\x51\x03' + tempo.to_bytes(3,'big') + b'\0\xff\x2f\0'
    points = []
    for index,event in enumerate(events):
        start = int(event.start_seconds * 256 * bpm / 60 + .5)
        end = max(start + 1, int(event.end_seconds * 256 * bpm / 60 + .5))
        points.append((start,1,index,bytes((0x90,event.pitch,event.velocity))))
        points.append((end,0,index,bytes((0x80,event.pitch,0))))
    # The pitch/velocity come from real native caches. Instrument attribution
    # has no recovered classifier here; GM0 is an explicit unclassified voice.
    name = b'Native notes'
    track = bytearray(b'\0\xff\x03'+_vlq(len(name))+name+b'\0\xc0\0')
    previous = 0
    for tick,_,_,message in sorted(points):
        track.extend(_vlq(tick-previous));track.extend(message);previous=tick
    track.extend(b'\x01\xff\x2f\0')
    with Path(path).open('xb') as output:
        output.write(b'MThd'+struct.pack('>IHHH',6,1,2,256))
        for body in (tempo_track,bytes(track)):
            output.write(b'MTrk'+struct.pack('>I',len(body))+body)


def export_native_song(job, payloads, *, decoded_pcm16, coordinate_bpm,
                       output_gain=1., minimum_velocity=1, report):
    """Connect real note cache -> native render -> WAV/MIDI/portable document.

    Memory-mapped native-amplitude PCM avoids a whole-song Python sample list.
    The residual is the retained PCM16 input minus the actual reconstructed
    waveform, preserving unrecognized content without inventing noisy notes.
    """
    job = Path(job); source = Path(decoded_pcm16)
    info = sf.info(source)
    if info.subtype != 'PCM_16' or info.channels not in (1, 2) or not info.frames:
        raise ValueError('The recovered output path requires nonempty mono/stereo decoded PCM16')
    channels = info.channels
    payloads = tuple(payloads)
    events, preview = [], []
    objects_file=job/'native-note-objects.jsonl'
    with objects_file.open('x',encoding='utf8') as objects:
        for index,payload in enumerate(payloads):
            # This output implements fresh constant-step native payloads.
            # Their source/select/play positions coincide; edited positions
            # need their own dispatcher rather than a guessed offset.
            if payload.harmonic_object.start!=0 or payload.time_fields[0x08]!=payload.time_fields[0x10]:
                raise NotImplementedError('Edited or non-relative native note rendering is outside this output path')
            cache = build_note_cache(payload)
            event = note_event_parameters(payload,cache,output_gain=output_gain,
                                          minimum_velocity_9886a8=minimum_velocity)
            if event is not None: events.append(event)
            summary={'index':index,'start_seconds':payload.time_fields[0x10],
                'end_seconds':payload.time_fields[0x14],'cache':asdict(cache)}
            if len(preview)<200:preview.append(summary)
            entry={**summary,'format':'RipXNativeNoteObject','version':1,
                'time_fields':{f'0x{offset:02x}':value for offset,value in payload.time_fields.items()},
                'harmonic_object':payload.harmonic_object,'timestep':payload.time_step_27c,
                'phase_encoding':'raw-uint32:low/high uint16 in0.0001 radians'}
            json.dump(entry,objects,ensure_ascii=False,allow_nan=False,
                      default=_native_json_default,separators=(',',':'))
            objects.write('\n')
    report(.83,f'原生音符对象已准备：{len(payloads)}项；写出重建音频')
    with tempfile.TemporaryDirectory(prefix='.native-output-',dir=job) as temporary:
        scratch = Path(temporary)/'render-native-units.f32'
        pcm = np.memmap(scratch,dtype=np.float32,mode='w+',shape=(channels,info.frames))
        try:
            pcm[:] = 0
            for index,payload in enumerate(payloads):
                step = f32(payload.time_step_27c)
                # The5a56a0 caller computes round(Fs*timestep)>>1.
                frame_samples = int(f32(f32(f32(info.samplerate)*step)+f32(.5)))
                fade = frame_samples >> 1
                offset = _native_sample_offset(info.samplerate,payload.time_fields[0x08])
                render_harmonic_object_inplace(tuple(pcm[c] for c in range(channels)),
                    payload.harmonic_object,sample_rate=info.samplerate,timestep_27c=step,
                    sample_offset=offset,crossfade_samples=fade,output_gain=output_gain)
                if index % 32 == 0: report(.83+.1*(index+1)/max(1,len(payloads)),f'原生渲染 {index+1}/{len(payloads)}')
            pcm.flush()
            with sf.SoundFile(source) as original, \
                 sf.SoundFile(job/'native-reconstruction.wav',mode='w',format='WAV',subtype='FLOAT',
                     samplerate=info.samplerate,channels=channels) as rendered, \
                 sf.SoundFile(job/'native-residual.wav',mode='w',format='WAV',subtype='FLOAT',
                     samplerate=info.samplerate,channels=channels) as residual:
                for start in range(0,info.frames,65536):
                    size = min(65536,info.frames-start)
                    block = np.array(pcm[:,start:start+size].T,dtype=np.float32)/np.float32(32768)
                    source_block = original.read(size,dtype='int16',always_2d=True).astype(np.float32)/np.float32(32768)
                    rendered.write(block);residual.write(source_block-block)
        finally:
            del pcm
    midi = job/'native-notes.mid'
    write_native_midi(midi,events,coordinate_bpm=coordinate_bpm)
    document = {'format':'RipXReconstructedNativeSong','version':1,
        'notes':preview,'note_count':len(payloads),'midi_count':len(events),
        'objects_file':objects_file.name,'notes_preview_limit':200,
        'notes_preview_complete':len(payloads)<=200,'sample_rate':info.samplerate,
        'channels':channels,'frames':info.frames,'midi':midi.name,
        'reconstruction':'native-reconstruction.wav','residual':'native-residual.wav',
        'public_model_used':False,'original_runtime_equivalence_verified':False,
        'coordinate_bpm':float(coordinate_bpm),'tempo_source':'explicit-user-export-coordinate',
        'instrument_assignment':'unclassified-GM0','source_pcm_domain':'signed-int16'}
    output = job/'native-song.json'
    with output.open('x',encoding='utf8') as target:
        json.dump(document,target,ensure_ascii=False,allow_nan=False)
    return output
