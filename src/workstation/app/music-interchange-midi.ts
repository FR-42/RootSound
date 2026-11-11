import { parseMidi as parseRawMidi, writeMidi, type MidiEvent } from 'midi-file';
import { parseMidi } from '../modules/midi-import/public.ts';
import type { ExchangeScore } from './music-interchange-model.ts';
import type { MidiExpressionLane } from '../contracts/midi-expression.ts';

/** RIFF MIDI wraps an ordinary SMF in a RIFF data chunk. */
export function unwrapMidi(bytes: Uint8Array): Uint8Array {
  if (new TextDecoder().decode(bytes.subarray(0, 4)) !== 'RIFF') return bytes;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (new TextDecoder().decode(bytes.subarray(8, 12)) !== 'RMID') throw new Error('不是有效的 RIFF MIDI 文件。');
  const end = 8 + view.getUint32(4, true);
  if (end > bytes.length) throw new Error('RIFF MIDI 文件被截断。');
  for (let at = 12; at + 8 <= end;) {
    const size = view.getUint32(at + 4, true);
    if (at + 8 + size > end) throw new Error('RIFF MIDI 数据块被截断。');
    if (new TextDecoder().decode(bytes.subarray(at, at + 4)) === 'data') return bytes.subarray(at + 8, at + 8 + size);
    at += 8 + size + size % 2;
  }
  throw new Error('RIFF MIDI 缺少音乐数据。');
}
export function readExchangeMidi(bytes: Uint8Array, name: string): { score: ExchangeScore; warnings: string[] } {
  const midi = parseMidi(unwrapMidi(bytes), { allowEmpty: true, captureExpression: true });
  const expression = new Map<string, MidiExpressionLane>();
  for (const event of midi.expression ?? []) {
    const id = `midi:${event.port}:${event.channel}`, lane = expression.get(id) ?? { id, events: [] };
    const { port: _port, channel: _channel, ...point } = event; lane.events.push(point); expression.set(id, lane);
  }
  const parts = new Map<string, ExchangeScore['parts'][number]>();
  let tempoIndex = 0;
  for (const note of midi.notes) {
    const key = `${note.trackIndex}:${note.port ?? 0}:${note.channel}:${note.channel === 9 ? note.pitch : note.program}`;
    let part = parts.get(key);
    if (!part) {
      const track = midi.tracks.find(item => item.index === note.trackIndex);
      const id = `midi:${note.port ?? 0}:${note.channel}`;
      part = { name: track?.name || `声部 ${note.trackIndex + 1}`, program: note.program, sourceTrack: note.trackIndex, sourceChannel: note.channel, sourcePort: note.port ?? 0,
        ...(expression.has(id) ? { midiChannelId: id } : {}),
        ...(note.channel === 9 ? { drum: note.pitch } : {}), notes: [] };
      parts.set(key, part);
    }
    while (midi.tempos[tempoIndex + 1] && midi.tempos[tempoIndex + 1]!.beat <= note.startBeat) tempoIndex++;
    const bpm = midi.tempos[tempoIndex]?.bpm ?? midi.initialTempoBpm;
    const keyEnd = part.midiChannelId ? note.keyEndBeat ?? note.endBeat : note.endBeat;
    part.notes.push({ beat: note.startBeat, duration: note.channel === 9 && keyEnd === note.startBeat ? .12 * bpm / 60 : Math.max(.000001, keyEnd - note.startBeat),
      pitch: note.pitch, velocity: note.velocity, level: part.midiChannelId ? 1 : note.level, pan: part.midiChannelId ? 0 : note.pan,
      ...(part.midiChannelId ? { midiOnOrder: note.onOrder, midiOffOrder: note.offOrder } : {}) });
  }
  let length = Math.max(.25, midi.durationBeats);
  for (const part of parts.values()) for (const note of part.notes) length = Math.max(length, note.beat + note.duration);
  return { score: { name, length, tempos: midi.tempos.map(point => ({ beat: point.beat, bpm: point.bpm })), parts: [...parts.values()],
    ...(expression.size ? { midiExpression: [...expression.values()] } : {}) },
    warnings: [...midi.warnings, 'MIDI 使用内置 GM 采样音色试听，不包含原演奏设备的声音。',
      ...(midi.notes.some(note => note.channel === 9 && (note.pitch < 35 || note.pitch > 81)) ? ['部分鼓音超出标准 GM 鼓组，已用邻近鼓音试听；普通音符编辑仍保留其原始鼓编号。'] : [])] };
}
type TimedEvent = { tick: number; order: number; event: MidiEvent };
type NewEvent = MidiEvent extends infer T ? T extends MidiEvent ? Omit<T, 'deltaTime'> : never : never;
const event = (data: NewEvent): MidiEvent => ({ ...data, deltaTime: 0 }) as MidiEvent;
function midiTempo(bpm: number): number {
  const value = Math.round(60000000 / bpm);
  if (value < 1 || value > 0xffffff) throw new Error('MIDI 文件最低约支持 3.58 BPM。请提高速度，或另存为 .rootsound 保留当前速度。');
  return value;
}

function wrapMidi(output: Uint8Array, source?: Uint8Array): Uint8Array {
  if (!source || new TextDecoder().decode(source.subarray(0, 4)) !== 'RIFF') return output;
  const chunks: Uint8Array[] = [], view = new DataView(source.buffer, source.byteOffset, source.byteLength);
  for (let at = 12; at + 8 <= source.length;) {
    const size = view.getUint32(at + 4, true);
    if (new TextDecoder().decode(source.subarray(at, at + 4)) === 'data') {
      const chunk = new Uint8Array(8 + output.length + output.length % 2);
      chunk.set(new TextEncoder().encode('data')); new DataView(chunk.buffer).setUint32(4, output.length, true);chunk.set(output,8);chunks.push(chunk);
    } else chunks.push(source.subarray(at, at + 8 + size + size % 2));
    at += 8 + size + size % 2;
  }
  const wrapped = new Uint8Array(12 + chunks.reduce((sum, chunk) => sum + chunk.length, 0));
  wrapped.set(new TextEncoder().encode('RIFF'));new DataView(wrapped.buffer).setUint32(4,wrapped.length-8,true);wrapped.set(new TextEncoder().encode('RMID'),8);
  let at = 12;for(const chunk of chunks){wrapped.set(chunk,at);at+=chunk.length;}return wrapped;
}

/** Patch ordinary note/tempo edits into original tracks, leaving every other event intact. */
export function createMidiPatcher(source: Uint8Array, baseline: ExchangeScore) {
  const original = parseRawMidi(unwrapMidi(source)), decoded = readExchangeMidi(source, baseline.name).score;
  const aligned = decoded.parts.length === baseline.parts.length && baseline.parts.every((part,index) => {
    const from=decoded.parts[index]!;
    return part.program===from.program&&part.drum===from.drum&&part.notes.length===from.notes.length
      &&part.notes.every((note,i)=>Math.abs(note.beat-from.notes[i]!.beat)<1e-7
        &&Math.abs(note.pitch-(part.drum??from.notes[i]!.pitch))<.001);
  });
  if(!aligned)return()=>undefined;
  const ppq = Math.max(original.header.ticksPerBeat!,9600), scale = ppq / original.header.ticksPerBeat!;
  const tracks = original.tracks.map(track => { let tick=0; return track.map(item=>{tick+=item.deltaTime;return {tick:Math.round(tick*scale),order:0,event:{...item,deltaTime:0}} as TimedEvent;}); });
  let eventOrder=0;
  for(const item of tracks.flatMap((items,track)=>items.map(item=>({item,track}))).sort((a,b)=>a.item.tick-b.item.tick||a.track-b.track))
    if('channel' in item.item.event||item.item.event.type==='setTempo'||item.item.event.type==='timeSignature')item.item.order=++eventOrder;
  const groups = new Map(baseline.parts.map((part,i)=>[part.id,{part,notes:new Map(part.notes.map(note=>[note.id,note])),source:decoded.parts[i]}]));
  type OriginalNote = {on:TimedEvent;off?:TimedEvent};
  const starts = new Map<string,OriginalNote[]>(), held = new Map<string,OriginalNote[]>();
  const queueKey=(port:number,channel:number,pitch:number)=>`${port}:${channel}:${pitch}`;
  const ports=new Map<number,number>();
  // MIDI key releases pair FIFO across tracks, matching the reader's semantics.
  for(const {item,track} of tracks.flatMap((items,track)=>items.map(item=>({item,track}))).sort((a,b)=>a.item.tick-b.item.tick||a.track-b.track)) {
    const ev=item.event;
    if(ev.type==='portPrefix'){ports.set(track,ev.port);continue;}
    if(ev.type!=='noteOn'&&ev.type!=='noteOff')continue;
    const key=queueKey(ports.get(track)??0,ev.channel,ev.noteNumber);
    if(ev.type==='noteOn'&&ev.velocity>0){
      const note={on:item};const pending=held.get(key)??[];pending.push(note);held.set(key,pending);
      const onset=`${track}:${key}:${item.tick}`;const list=starts.get(onset)??[];list.push(note);starts.set(onset,list);
    }else{const note=held.get(key)?.shift();if(note)note.off=item;}
  }
  const originals=new Map<string,OriginalNote>();
  for(const {part,source:from} of groups.values())if(from)for(const [index,note] of part.notes.entries()){
    const pitch=from.notes[index]?.pitch??note.pitch;
    const onset=`${from.sourceTrack}:${queueKey(from.sourcePort??0,from.sourceChannel!,Math.round(pitch))}:${Math.round(note.beat*ppq)}`;
    const originalNote=starts.get(onset)?.shift();if(originalNote&&note.id)originals.set(note.id,originalNote);
  }
  return (current:ExchangeScore):{bytes:Uint8Array;warnings:string[]}|undefined=>{
    if(JSON.stringify(current.midiExpression??[])!==JSON.stringify(baseline.midiExpression??[]))return undefined;
    if(current.parts.some(part=>{const old=groups.get(part.id);return !old?.source||old.part.program!==part.program||old.part.drum!==part.drum;}))return undefined;
    for(const part of current.parts)for(const note of part.notes){
      if(Math.abs(note.pitch-Math.round(note.pitch))>.001)return undefined;
      const before=groups.get(part.id)?.notes.get(note.id);
      if(before&&(Math.abs(before.level-note.level)>1e-8||Math.abs(before.pan-note.pan)>1e-8))return undefined;
      // New notes must use their source channel's current volume and pan.
      if(!before&&(Math.abs(note.level-1)>1e-8||Math.abs(note.pan)>1e-8))return undefined;
    }
    const output=tracks.map(items=>items.filter(item=>!['noteOn','noteOff','setTempo','endOfTrack'].includes(item.event.type)).map(item=>({...item})));
    for(const point of current.tempos)output[0]!.push({tick:Math.round(point.beat*ppq),order:-1,event:event({type:'setTempo',microsecondsPerBeat:midiTempo(point.bpm)})});
    let pedalMoved=false;
    const pedal=tracks.flat().some(item=>item.event.type==='controller'&&item.event.controllerType===64);
    for(const part of current.parts){const from=groups.get(part.id)!.source!, oldNotes=groups.get(part.id)!.notes;
      for(const note of part.notes){
        if(note.velocity<=0)continue;
        const before=oldNotes.get(note.id), pair=note.id?originals.get(note.id):undefined;
        const start=Math.round(note.beat*ppq);
        const unchangedLength=before&&Math.abs(before.duration-note.duration)<1e-8;
        const end=unchangedLength&&pair?.off?start+pair.off.tick-pair.on.tick:Math.round((note.beat+note.duration)*ppq);
        if(pedal&&!part.midiChannelId&&before&&(Math.abs(before.beat-note.beat)>1e-8||!unchangedLength))pedalMoved=true;
        const pitch=from.drum!==undefined&&pair&&(pair.on.event.type==='noteOn')?pair.on.event.noteNumber:Math.round(note.pitch);
        output[from.sourceTrack!]!.push({tick:start,order:pair?.on.order??note.midiOnOrder??1,event:event({type:'noteOn',channel:from.sourceChannel!,noteNumber:pitch,velocity:Math.max(1,Math.round(note.velocity*127))})},
          {tick:Math.max(start+1,end),order:pair?.off?.order??note.midiOffOrder??-1,event:event({type:'noteOff',channel:from.sourceChannel!,noteNumber:pitch,velocity:0})});
      }
    }
    const bytes=Uint8Array.from(writeMidi({header:{...original.header,ticksPerBeat:ppq},tracks:output.map(items=>{
      items.sort((a,b)=>a.tick-b.tick||a.order-b.order);let tick=0;
      const result=items.map(item=>{const deltaTime=item.tick-tick;tick=item.tick;return{...item.event,deltaTime};});
      result.push({type:'endOfTrack',deltaTime:Math.max(0,Math.round(current.length*ppq)-tick)});return result;
    })}));
    return{bytes:wrapMidi(bytes,source),warnings:pedalMoved?['原 MIDI 踏板事件已保留；移动或改长音符后，外部播放器会按原踏板位置重新决定延音。']:[]};
  };
}

export function writeExchangeMidi(score: ExchangeScore, source?: Uint8Array): { bytes: Uint8Array; warnings: string[] } {
  const ppq = 9600, warnings = new Set<string>();
  const conductor: TimedEvent[] = score.tempos.map(point => ({ tick: Math.round(point.beat * ppq), order: 0,
    event: event({ type: 'setTempo', microsecondsPerBeat: midiTempo(point.bpm) }) }));
  if (source) {
    const original = parseRawMidi(unwrapMidi(source)), sourcePpq = original.header.ticksPerBeat!;
    for (const track of original.tracks) {
      let tick = 0;
      for (const item of track) {
        tick += item.deltaTime;
        if (['trackName', 'setTempo', 'endOfTrack'].includes(item.type)) continue;
        if ('channel' in item || item.type === 'sysEx' || item.type === 'endSysEx') {
          if (item.type==='sysEx'||item.type==='endSysEx'||item.type==='controller'&&[0,32].includes(item.controllerType)&&item.value!==0) warnings.add('设备专用的音源设置与自定义音色库选择无法写回；标准演奏控制信息会保留。');
          continue;
        }
        conductor.push({ tick: Math.round(tick / sourcePpq * ppq), order: 1, event: { ...item, deltaTime: 0 } });
      }
    }
  }
  const tracks: TimedEvent[][] = [conductor];
  const lanes=new Map(score.midiExpression?.map(lane=>[lane.id,lane]));
  const settings = new Map<string,{channel:number;track:TimedEvent[]}>();
  const panValue=(pan:number)=>Math.round(pan<=0?64+pan*64:64+pan*63);
  const panFloat=(value:number)=>value<=64?(value-64)/64:(value-64)/63;
  for(const part of score.parts)for(const note of part.notes){
    if(note.velocity*note.level<=0)continue;
    const lane=part.midiChannelId?lanes.get(part.midiChannelId):undefined;
    const key=part.drum===undefined?JSON.stringify([part.program,lane?.id,note.level,note.pan]):'drums';
    let target=settings.get(key);
    if(!target){
      const melodic=[...settings.values()].filter(value=>value.channel!==9).length;
      if(part.drum===undefined&&melodic>=15)throw new Error('这些音色、音量与声像需要超过 15 个独立 MIDI 通道；请另存为 .rootsound 保留全部设置。');
      const channel=part.drum!==undefined?9:melodic<9?melodic:melodic+1;
      const text=Array.from(new TextEncoder().encode(part.name),byte=>String.fromCharCode(byte)).join('');
      const track:TimedEvent[]=[{tick:0,order:-10,event:event({type:'trackName',text})},
        {tick:0,order:-9,event:event({type:'programChange',channel,programNumber:part.program})}];
      const baseVolume=lane?100:127;
      track.push({tick:0,order:-8,event:event({type:'controller',channel,controllerType:7,value:Math.round(baseVolume*(part.drum===undefined?note.level:1))})},
        {tick:0,order:-8,event:event({type:'controller',channel,controllerType:10,value:panValue(note.pan)})});
      for(const message of lane?.events??[]){
        let data:NewEvent;
        if(message.type==='controller'){
          const value=message.controller===7?Math.round(message.value*note.level):message.controller===10?panValue(Math.max(-1,Math.min(1,panFloat(message.value)+note.pan))):message.value;
          data={type:'controller',channel,controllerType:message.controller,value};
        }else if(message.type==='pitch-bend')data={type:'pitchBend',channel,value:message.value-8192};
        else if(message.type==='channel-pressure')data={type:'channelAftertouch',channel,amount:message.value};
        else data={type:'noteAftertouch',channel,noteNumber:message.key,amount:message.value};
        track.push({tick:Math.round(message.beat*ppq),order:message.order??0,event:event(data)});
      }
      target={channel,track};settings.set(key,target);tracks.push(track);
    }
    const {channel,track}=target,pitch=Math.max(0,Math.min(127,Math.round(note.pitch))),start=Math.round(note.beat*ppq);
    const end=Math.max(start+1,Math.round((note.beat+note.duration)*ppq));
    if(Math.abs(pitch-note.pitch)>.001)warnings.add('MIDI 音高按十二平均律写入，微分音会取最近的半音。');
    if(part.drum!==undefined&&(note.level!==1||note.pan!==0)){
      track.push({tick:start,order:(note.midiOnOrder??1)-.5,event:event({type:'controller',channel,controllerType:10,value:panValue(note.pan)})});
      warnings.add('GM 鼓组共享同一 MIDI 通道；逐音音量会折算为力度，声像变化也会影响同时发声的鼓。');
    }
    track.push({tick:start,order:note.midiOnOrder??1,event:event({type:'noteOn',channel,noteNumber:pitch,velocity:Math.max(1,Math.min(127,Math.round(note.velocity*(part.drum===undefined?1:note.level)*127)))})},
      {tick:end,order:note.midiOffOrder??-1,event:event({type:'noteOff',channel,noteNumber:pitch,velocity:0})});
  }
  const output = Uint8Array.from(writeMidi({ header: { format: 1, numTracks: tracks.length, ticksPerBeat: ppq }, tracks: tracks.map(timed => {
    timed.sort((a, b) => a.tick - b.tick || a.order - b.order);
    let last = 0; const result = timed.map(item => { const deltaTime = item.tick - last; last = item.tick; return { ...item.event, deltaTime }; });
    result.push({ type: 'endOfTrack', deltaTime: Math.max(0, Math.round(score.length * ppq) - last) }); return result;
  }) }));
  return { bytes: wrapMidi(output, source), warnings: [...warnings] };
}
