import { MIDI_LIMITS, type MidiDocument, type MidiNote, type MidiTempo, type MidiTimeSignature, type MidiTrack } from '../../contracts/midi.ts';

type Position = { tick: number; trackIndex: number; order: number; port: number };
type Event = Position & ({ kind: 'channel'; status: number; first: number; second: number }
  | { kind: 'tempo'; microseconds: number }
  | { kind: 'meter'; numerator: number; denominator: number });
type PendingNote = Omit<MidiNote, 'endTick' | 'startBeat' | 'endBeat' | 'startSeconds' | 'endSeconds'>;
type KeyQueue = { notes: PendingNote[]; head: number };
type Channel = { program: number; volume: number; expression: number; pan: number; pedal: boolean;
  keys: Map<number, KeyQueue>; sustained: PendingNote[] };

function fail(message: string): never { throw new Error(`MIDI 导入失败：${message}`); }
class Reader {
  position: number;
  readonly end: number;
  readonly bytes: Uint8Array;
  constructor(bytes: Uint8Array, start = 0, end = bytes.length) { this.bytes = bytes; this.position = start; this.end = end; }
  take(length: number): Uint8Array {
    if (!Number.isSafeInteger(length) || length < 0 || length > this.end - this.position) fail('文件内容不完整，原文件已保留。');
    const result = this.bytes.subarray(this.position, this.position + length); this.position += length; return result;
  }
  byte(): number { return this.take(1)[0]!; }
  word(): number { const data = this.take(2); return data[0]! * 256 + data[1]!; }
  uint(): number { const data = this.take(4); return ((data[0]! * 256 + data[1]!) * 256 + data[2]!) * 256 + data[3]!; }
  tag(): string { return String.fromCharCode(...this.take(4)); }
  variable(): number {
    let value = 0;
    for (let index = 0; index < 4; index++) { const next = this.byte(); value = value * 128 + (next & 127); if (next < 128) return value; }
    return fail('可变长度数字超过 MIDI 允许的四字节范围。');
  }
  data(): number { const value = this.byte(); if (value > 127) fail('通道事件含有无效的数据字节。'); return value; }
}

/** Read Standard MIDI Files (format 0/1, PPQ), without modifying input or opening devices.
 * Running status is cancelled by metadata/SysEx as required by the SMF specification.
 * Rendering limitations are reported, never represented as equivalent original audio.
 */
export function parseMidi(bytes: Uint8Array): MidiDocument {
  if (!(bytes instanceof Uint8Array) || bytes.byteLength < 14) return fail('请选择完整的 .mid 或 .midi 文件。');
  if (bytes.byteLength > MIDI_LIMITS.bytes) return fail('文件超过当前 10 MiB 的导入范围。');
  const reader = new Reader(bytes), warnings = new Set<string>();
  if (reader.tag() !== 'MThd') return fail('文件不是标准 MIDI 文件。');
  const headerLength = reader.uint();
  if (headerLength < 6 || headerLength > reader.end - reader.position) return fail('MIDI 文件头无效或不完整。');
  const headerEnd = reader.position + headerLength;
  const format = reader.word(), trackCount = reader.word(), division = reader.word();
  if (format !== 0 && format !== 1) return fail(format === 2 ? '暂不支持包含独立序列的格式 2，请先另存为格式 0 或 1。' : '不支持这个 MIDI 文件版本。');
  if (!trackCount || trackCount > MIDI_LIMITS.tracks || format === 0 && trackCount !== 1) return fail('轨道数量无效，当前最多支持 256 条 MIDI 轨道。');
  if (division & 0x8000) return fail('暂不支持 SMPTE 时间码，请先另存为按拍计时的 MIDI 文件。');
  if (!division) return fail('每拍时钟数量不能为零。');
  reader.position = headerEnd;
  const tracks: MidiTrack[] = [], events: Event[] = [];
  let count = 0, endTick = 0;
  const readName = (raw: Uint8Array): string => {
    if (raw.length > 1024) warnings.add('过长的轨道名称已截短。');
    const data = raw.subarray(0, 1024); let text: string;
    try { text = new TextDecoder('utf-8', { fatal: true }).decode(data); }
    catch {
      warnings.add('部分轨道名称使用旧文字编码，已尽量转换。');
      try { text = new TextDecoder('gb18030', { fatal: true }).decode(data); }
      catch { text = new TextDecoder('windows-1252').decode(data); }
    }
    return text.replace(/[\u0000-\u001f\u007f]/gu, ' ').replace(/\s+/gu, ' ').trim().slice(0, 160);
  };
  while (tracks.length < trackCount) {
    if (reader.end - reader.position < 8) return fail('声明的 MIDI 轨道缺失。');
    const tag = reader.tag(), length = reader.uint(), start = reader.position;
    reader.take(length);
    if (tag !== 'MTrk') { warnings.add('文件中的非音乐扩展区块未导入。'); continue; }
    const input = new Reader(bytes, start, start + length), trackIndex = tracks.length;
    let tick = 0, order = 0, running = 0, port = 0, ended = false, name = '';
    while (input.position < input.end) {
      if (++count > MIDI_LIMITS.events) return fail('事件过多，当前最多支持 200000 个 MIDI 事件。');
      tick += input.variable();
      if (!Number.isSafeInteger(tick)) return fail('事件时间超过可安全读取的范围。');
      const next = input.byte(); let status = next;
      if (next < 128) { if (!running) return fail('音符事件缺少有效的 MIDI 状态。'); status = running; input.position--; }
      const position: Position = { tick, trackIndex, order: order++, port };
      if (status >= 0x80 && status <= 0xef) {
        running = status;
        const first = input.data(), second = (status & 0xe0) === 0xc0 ? 0 : input.data();
        events.push({ ...position, kind: 'channel', status, first, second });
      } else if (status === 0xff) {
        running = 0;
        const type = input.data(), data = input.take(input.variable());
        if (type === 0x2f) {
          if (data.length !== 0) return fail('轨道结束标记无效。');
          if (input.position !== input.end) {
            if (input.take(input.end - input.position).some(value => value !== 0)) return fail('轨道结束标记后仍有音乐事件。');
            warnings.add('轨道结束后的空白填充已忽略。');
          }
          ended = true; break;
        }
        if (type === 0x51) {
          if (data.length < 3) return fail('速度事件不完整。');
          const microseconds = data[0]! * 65536 + data[1]! * 256 + data[2]!;
          if (!microseconds) return fail('速度事件不能为零。');
          events.push({ ...position, kind: 'tempo', microseconds });
        } else if (type === 0x58) {
          if (data.length < 4 || data[0] === 0) return fail('拍号事件无效。');
          events.push({ ...position, kind: 'meter', numerator: data[0]!, denominator: 2 ** data[1]! });
        } else if (type === 0x03) { name ||= readName(data); }
        else if (type === 0x21) { if (!data.length) return fail('MIDI 端口标记不完整。'); port = data[0]!; }
        else if ([0x01, 0x05, 0x06, 0x07].includes(type)) warnings.add('歌词、文字注释及段落标记尚未作为工程内容导入。');
      } else if (status === 0xf0 || status === 0xf7) {
        running = 0; input.take(input.variable()); warnings.add('系统专用信息（音源设置、调音等）尚未还原。');
      } else return fail('文件含有不符合标准 MIDI 文件格式的系统事件。');
    }
    if (!ended) warnings.add('部分轨道没有结束标记，已按轨道内容的末尾处理。');
    endTick = Math.max(endTick, tick); tracks.push({ index: trackIndex, name: name || `轨道 ${trackIndex + 1}` });
  }
  while (reader.position < reader.end) {
    if (reader.end - reader.position < 8) return fail('文件末尾有不完整的区块。');
    const tag = reader.tag(), length = reader.uint(); reader.take(length);
    if (tag === 'MTrk') return fail('实际轨道数量超过文件头的声明。');
    warnings.add('文件中的非音乐扩展区块未导入。');
  }
  events.sort((left, right) => left.tick - right.tick || left.trackIndex - right.trackIndex || left.order - right.order);
  const clock: { tick: number; seconds: number; microseconds: number }[] = [{ tick: 0, seconds: 0, microseconds: 500_000 }];
  const timeSignatures: MidiTimeSignature[] = [{ tick: 0, beat: 0, numerator: 4, denominator: 4 }];
  const tickSeconds = (tick: number): number => {
    let lo = 0, hi = clock.length;
    while (lo + 1 < hi) { const mid = (lo + hi) >>> 1; if (clock[mid]!.tick <= tick) lo = mid; else hi = mid; }
    const segment = clock[lo]!; return segment.seconds + (tick - segment.tick) / division * segment.microseconds / 1_000_000;
  };
  let previousTempoTick = -1, previousTempoValue = -1;
  for (const event of events) {
    if (event.kind === 'tempo') {
      if (previousTempoTick === event.tick && previousTempoValue !== event.microseconds) warnings.add('同一时点有多个不同速度，按文件中的后一个设置导入。');
      previousTempoTick = event.tick; previousTempoValue = event.microseconds;
      const last = clock.at(-1)!;
      if (last.tick === event.tick) last.microseconds = event.microseconds;
      else if (last.microseconds !== event.microseconds) clock.push({ tick: event.tick, seconds: tickSeconds(event.tick), microseconds: event.microseconds });
    } else if (event.kind === 'meter') {
      const meter = { tick: event.tick, beat: event.tick / division, numerator: event.numerator, denominator: event.denominator };
      if (timeSignatures.at(-1)!.tick === meter.tick) timeSignatures[timeSignatures.length - 1] = meter;
      else if (timeSignatures.at(-1)!.numerator !== meter.numerator || timeSignatures.at(-1)!.denominator !== meter.denominator) timeSignatures.push(meter);
    }
  }
  if (timeSignatures.some(meter => meter.numerator !== 4 || meter.denominator !== 4)) warnings.add('音符时间已保留；非 4/4 拍号尚未显示为对应的小节网格。');
  const durationSeconds = tickSeconds(endTick);
  if (!Number.isFinite(durationSeconds) || durationSeconds > MIDI_LIMITS.durationSeconds) return fail('时长超过当前两小时的导入范围。');
  const channels = new Map<number, Channel>(), notes: MidiNote[] = [];
  let noteCount = 0, zeroLength = false, zeroLengthDrum = false, missingOff = false;
  const channelFor = (port: number, channel: number): Channel => {
    const key = port * 16 + channel; let state = channels.get(key);
    if (!state) { state = { program: 0, volume: 127, expression: 127, pan: 64, pedal: false, keys: new Map(), sustained: [] }; channels.set(key, state); }
    return state;
  };
  const hasSounding = (state: Channel): boolean => state.sustained.length > 0 || state.keys.size > 0;
  const finish = (note: PendingNote, tick: number): void => {
    if (tick <= note.startTick) {
      if (tick === note.startTick && note.channel === 9) zeroLengthDrum = true;
      else { zeroLength = true; return; }
    }
    notes.push({ ...note, endTick: tick, startBeat: note.startTick / division, endBeat: tick / division,
      startSeconds: tickSeconds(note.startTick), endSeconds: tickSeconds(tick) });
  };
  const releaseSustain = (state: Channel, tick: number): void => { for (const note of state.sustained) finish(note, tick); state.sustained = []; };
  const releaseKey = (state: Channel, pitch: number, tick: number): void => {
    const queue = state.keys.get(pitch), note = queue?.notes[queue.head++];
    if (!note) return;
    if (queue!.head === queue!.notes.length) state.keys.delete(pitch);
    if (state.pedal) state.sustained.push(note); else finish(note, tick);
  };
  const releaseKeys = (state: Channel, tick: number): void => {
    for (const queue of state.keys.values()) for (let index = queue.head; index < queue.notes.length; index++) {
      const note = queue.notes[index]!; if (state.pedal) state.sustained.push(note); else finish(note, tick);
    }
    state.keys.clear();
  };
  for (const event of events) {
    if (event.kind !== 'channel') continue;
    const channel = event.status & 15, state = channelFor(event.port, channel), kind = event.status >> 4;
    if (kind === 9 && event.second > 0) {
      if (++noteCount > MIDI_LIMITS.notes) return fail('音符过多，当前最多支持 50000 个 MIDI 音符。');
      const note: PendingNote = { trackIndex: event.trackIndex, channel, program: state.program, pitch: event.first,
        velocity: event.second / 127, level: state.volume / 127 * (state.expression / 127),
        pan: state.pan <= 64 ? (state.pan - 64) / 64 : (state.pan - 64) / 63, startTick: event.tick };
      const queue = state.keys.get(event.first) ?? { notes: [], head: 0 }; queue.notes.push(note); state.keys.set(event.first, queue);
    } else if (kind === 8 || kind === 9) releaseKey(state, event.first, event.tick);
    else if (kind === 12) state.program = event.first;
    else if (kind === 11) {
      const controller = event.first, value = event.second;
      if ([7, 10, 11].includes(controller)) {
        const key = controller === 7 ? 'volume' : controller === 10 ? 'pan' : 'expression';
        if (state[key] !== value && hasSounding(state)) warnings.add('演奏中的音量、表情和声像变化仅保留在音符起点，连续变化尚未还原。');
        state[key] = value;
      } else if (controller === 64) {
        const down = value >= 64; if (!down && state.pedal) releaseSustain(state, event.tick); state.pedal = down;
      } else if (controller === 120) {
        for (const queue of state.keys.values()) for (let index = queue.head; index < queue.notes.length; index++) finish(queue.notes[index]!, event.tick);
        state.keys.clear(); releaseSustain(state, event.tick);
      } else if (controller === 121) {
        if (hasSounding(state) && state.expression !== 127) warnings.add('演奏中的音量、表情和声像变化仅保留在音符起点，连续变化尚未还原。');
        releaseSustain(state, event.tick); state.pedal = false; state.expression = 127;
      } else if (controller === 123 || controller >= 124 && controller <= 127) {
        releaseKeys(state, event.tick);
        if (controller !== 123) warnings.add('MIDI 的单音、复音及设备通道模式已按普通音符演奏处理。');
      } else if ((controller === 0 || controller === 32) && value !== 0) warnings.add('自定义音色库编号尚未还原，已使用通用乐器编号匹配替代音色。');
      else if (![0, 32, 122].includes(controller) && value !== 0) warnings.add('部分连续控制器（调制、效果等）尚未还原，可在工程中重新调整。');
    } else if (kind === 14 && (event.first !== 0 || event.second !== 64)) warnings.add('弯音变化尚未还原，导入音符保持原始音高。');
    else if ((kind === 10 && event.second !== 0) || (kind === 13 && event.first !== 0)) warnings.add('触后压力变化尚未还原。');
  }
  for (const state of channels.values()) {
    for (const queue of state.keys.values()) for (let index = queue.head; index < queue.notes.length; index++) { finish(queue.notes[index]!, endTick); missingOff = true; }
    // A held pedal is legitimate. Release remaining sustained voices at EOF.
    for (const note of state.sustained) finish(note, endTick);
  }
  if (zeroLength) warnings.add('长度为零的音符已忽略。');
  if (zeroLengthDrum) warnings.add('部分打击乐音符的起止时间相同，已保留击发点。');
  if (missingOff) warnings.add('部分音符缺少结束事件，已在文件末尾结束。');
  if (!notes.length) return fail('文件没有可导入的有效音符。');
  notes.sort((left, right) => left.startTick - right.startTick || left.trackIndex - right.trackIndex || left.channel - right.channel || left.pitch - right.pitch);
  const tempos: MidiTempo[] = clock.map(item => ({ tick: item.tick, beat: item.tick / division, seconds: item.seconds, bpm: 60_000_000 / item.microseconds }));
  return { format, division, initialTempoBpm: tempos[0]!.bpm, durationSeconds, durationBeats: endTick / division,
    tracks, tempos, timeSignatures, notes, warnings: [...warnings] };
}
