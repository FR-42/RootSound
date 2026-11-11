import { readMidiExpressionMessage, MAX_MIDI_EXPRESSION_EVENTS, type MidiExpressionLane } from '../../contracts/midi-expression.ts';
import { phraseExpression } from '../../contracts/phrase-expression.ts';
import type { ContentRecord, Draft, MaterialLibrary } from '../../contracts/content.ts';
import type { KeyboardPitch, PhraseBody, PhraseEditorPort, PhraseNote, PhrasePart, PhrasePlaybackPort, PhraseSection } from '../../contracts/phrase.ts';
import type { SoundPlan, SoundSequencePlan } from '../../contracts/sound.ts';
import type { TimbrePlaybackPort } from '../../contracts/timbre.ts';
import type { ReferenceAdapter } from '../../contracts/references.ts';
import { MAX_PHRASE_BEATS, MAX_PHRASE_NOTES, MIN_NOTE_BEATS, MIN_NOTE_SECONDS } from '../../contracts/phrase-limits.ts';
import { phraseStepsPerBeat } from '../../contracts/phrase.ts';
import { phraseBeatSeconds, phraseDurationSeconds, phraseHeldSeconds, phraseHeldBeats } from '../../contracts/phrase-time.ts';
import { resizeTempoRoll } from './tempo-roll-resize.ts';
import { MIN_TEMPO_BPM, MAX_TEMPO_BPM, MIN_PITCH_HZ, MAX_PITCH_HZ, MIN_MIDI_PITCH, MAX_MIDI_PITCH } from '../../contracts/music-limits.ts';

export type { KeyboardPitch, PhraseBody, PhraseEditorPort, PhraseNote, PhrasePart, PhraseSection, PhraseView, PhrasePlaybackPort, PhraseNoteRef, PhraseNoteUpdate } from '../../contracts/phrase.ts';
export { PHRASE_STEPS_PER_BEAT, phraseStepsPerBeat } from '../../contracts/phrase.ts';

const KIND = 'rootsound.phrase';
const OWNER = 'phrase';
/** First editor limits, not a restriction on future RootSound phrase formats. */
const MAX_PARTS = 128;

/** Tempo edits retain musical lengths, including old notes stored in seconds. */
function retimeHeldNotes(body:PhraseBody, change:()=>void):void {
  const before=structuredClone(body);
  const held=new Map(body.parts.flatMap(part=>part.notes.map(note=>[note.id,phraseHeldBeats(before,note.startBeat,phraseHeldSeconds(before,note))] as const)));
  change();
  for(const part of body.parts) {
    for(const note of part.notes) {
      const beats=held.get(note.id)!;
      note.durationBeats=Math.max(MIN_NOTE_BEATS,Math.min(body.lengthBeats-note.startBeat,beats));
      note.durationSeconds=Math.max(MIN_NOTE_SECONDS,phraseBeatSeconds(body,note.startBeat+beats)-phraseBeatSeconds(body,note.startBeat));
    }
    for(const hidden of part.hiddenNotes??[]) {
      const oldTempo=hidden.sectionId==='first'?before.tempoBpm:before.tempoSections!.find(section=>section.id===hidden.sectionId)!.tempoBpm;
      const newTempo=hidden.sectionId==='first'?body.tempoBpm:body.tempoSections!.find(section=>section.id===hidden.sectionId)!.tempoBpm;
      hidden.note.durationSeconds=hidden.note.durationSeconds!*oldTempo/newTempo;
    }
  }
}

export type PhraseSecondsInput = {
  name: string; timbreId: string; durationSeconds: number; tempoBpm?: number;
  notes: { startSeconds: number; durationSeconds: number; frequencyHz: number; velocity?: number; level?: number; pan?: number }[];
};

/** A tempo here is only a coordinate conversion; this function infers no beat, key or tuning. */
export function preparePhraseFromSeconds(input: PhraseSecondsInput): ContentRecord {
  if (!input || typeof input !== 'object') throw new Error('先提供要谱写的旋律。');
  const name = text(input.name, '音乐名称').trim(); const timbreId = text(input.timbreId, '旋律的声音标识');
  if (name.length > 4096) throw new Error('音乐名称过长。');
  const tempoBpm = number(input.tempoBpm ?? 120, '编辑坐标速度', MIN_TEMPO_BPM, MAX_TEMPO_BPM);
  const duration = number(input.durationSeconds, '旋律时长', Number.MIN_VALUE, 3600);
  const beatsPerSecond = tempoBpm / 60; const lengthBeats = duration * beatsPerSecond;
  if (lengthBeats < 0.25 || lengthBeats > MAX_PHRASE_BEATS) throw new Error('这段旋律过短或过长，超出当前音乐支持的时长范围。');
  if (!Array.isArray(input.notes) || input.notes.length > MAX_PHRASE_NOTES) throw new Error('旋律音符数量超出当前音乐范围。');
  const notes: PhraseNote[] = input.notes.map(raw => {
    const note = object(raw, '旋律音符'); fields(note, ['startSeconds', 'durationSeconds', 'frequencyHz', 'velocity', 'level', 'pan'], '旋律音符');
    return { id: crypto.randomUUID(), startBeat: number(note.startSeconds, '音符开始时间', 0, duration) * beatsPerSecond,
      durationBeats: number(note.durationSeconds, '音符持续时间', MIN_NOTE_BEATS / beatsPerSecond, duration) * beatsPerSecond,
      frequencyHz: number(note.frequencyHz, '音高', MIN_PITCH_HZ, MAX_PITCH_HZ), velocity: note.velocity === undefined ? 0.75 : number(note.velocity, '音符力度', 0, 1),
      ...(note.level === undefined ? {} : { level: number(note.level, '音符音量', 0, 1) }),
      ...(note.pan === undefined ? {} : { pan: number(note.pan, '音符声像', -1, 1) }) };
  });
  const body = readPhraseBody({ model: 'note-phrase', version: 1, timeUnit: 'beat', tempoBpm, lengthBeats,
    parts: [{ id: crypto.randomUUID(), name: '旋律', timbreId, notes }] });
  return { id: crypto.randomUUID(), kind: KIND, owner: OWNER, schemaVersion: 1, revision: 1, name, dependencies: [timbreId], body };
}

function object(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`${label}不是有效对象。原内容已保留。`);
  return value as Record<string, unknown>;
}
function fields(value: Record<string, unknown>, supported: readonly string[], label: string): void {
  if (Object.keys(value).some(key => !supported.includes(key))) throw new Error(`${label}包含尚不支持的设置。原内容已保留。`);
}
function text(value: unknown, label: string): string {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${label}不能为空。`);
  return value;
}
function number(value: unknown, label: string, min: number, max: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max) {
    throw new Error(`${label}必须在 ${min} 至 ${max} 之间。`);
  }
  return value;
}
function exceedsLength(startBeat: number, durationBeats: number, lengthBeats: number): boolean {
  const end = startBeat + durationBeats;
  return end > lengthBeats + Number.EPSILON * Math.max(1, end, lengthBeats) * 8;
}
function partSection(value: unknown): PhraseSection {
  if (value !== 'melody' && value !== 'rhythm') throw new Error('音乐声部只能属于旋律部或节奏部。');
  return value;
}

/** Strict reads reject unknown fields rather than silently truncating future content. */
export function readPhraseBody(value: unknown): PhraseBody {
  const body = object(value, '音乐');
  fields(body, ['model', 'version', 'timeUnit', 'tempoBpm', 'tempoSections', 'lengthBeats', 'stepsPerBeat', 'beatsPerBar', 'pickupBeats', 'masterLevel', 'parts', 'midiExpression'], '音乐');
  if (body.model !== 'note-phrase' || body.version !== 1 || body.timeUnit !== 'beat') {
    throw new Error('暂不支持这份音乐的格式或版本。原内容已保留。');
  }
  const tempoBpm = number(body.tempoBpm, '速度', MIN_TEMPO_BPM, MAX_TEMPO_BPM);
  const lengthBeats = number(body.lengthBeats, '音乐长度', 0.25, MAX_PHRASE_BEATS);
  let previousStart = 0;
  const sectionIds = new Set<string>();
  const tempoSections = body.tempoSections === undefined ? undefined : (() => {
    if (!Array.isArray(body.tempoSections) || body.tempoSections.length > 2047) throw new Error('BPM卷帘数量超出当前范围。');
    return body.tempoSections.map(raw => {
      const value = object(raw, 'BPM卷帘'); fields(value, ['id', 'startBeat', 'tempoBpm', 'stepsPerBeat', 'gridOffsetBeats'], 'BPM卷帘');
      const id = text(value.id, 'BPM卷帘标识'), startBeat = number(value.startBeat, 'BPM卷帘起点', 0, lengthBeats);
      if (id === 'first' || sectionIds.has(id) || startBeat <= previousStart || startBeat >= lengthBeats) throw new Error('BPM卷帘必须按时间连续排列。');
      sectionIds.add(id); previousStart = startBeat;
      return { id, startBeat, tempoBpm: number(value.tempoBpm, 'BPM卷帘速度', MIN_TEMPO_BPM, MAX_TEMPO_BPM),
        ...(value.gridOffsetBeats === undefined ? {} : { gridOffsetBeats: number(value.gridOffsetBeats, 'BPM卷帘网格偏移', 0, 16) }),
        ...(value.stepsPerBeat === undefined ? {} : { stepsPerBeat: phraseStepsPerBeat({ stepsPerBeat: value.stepsPerBeat as number }) }) };
    });
  })();
  const stepsPerBeat = body.stepsPerBeat === undefined ? undefined : phraseStepsPerBeat({ stepsPerBeat: body.stepsPerBeat as number });
  const beatsPerBar = body.beatsPerBar === undefined ? undefined : number(body.beatsPerBar, '每小节拍数', 1, 16);
  if (beatsPerBar !== undefined && !Number.isInteger(beatsPerBar)) throw new Error('每小节拍数必须是整数。');
  const pickupBeats = body.pickupBeats === undefined ? undefined : number(body.pickupBeats, '弱起拍数', 0, beatsPerBar ?? 4);
  if (pickupBeats !== undefined && pickupBeats >= (beatsPerBar ?? 4)) throw new Error('弱起拍数必须少于一小节。');
  const masterLevel = body.masterLevel === undefined ? undefined : number(body.masterLevel, '音乐音量', 0, 1);
  if (!Array.isArray(body.parts) || body.parts.length > MAX_PARTS) {
    throw new Error(`当前音乐最多可使用 ${MAX_PARTS} 个声音。`);
  }
  const ids = new Set<string>();
  let noteCount = 0;
  function unique(value: unknown, label: string): string {
    const id = text(value, label);
    if (ids.has(id)) throw new Error('音乐中存在重复的声音或音符标识。原内容已保留。');
    ids.add(id);
    return id;
  }
  const laneIds = new Set<string>(); let eventCount = 0;
  const midiExpression: MidiExpressionLane[] | undefined = body.midiExpression === undefined ? undefined : (() => {
    if (!Array.isArray(body.midiExpression) || body.midiExpression.length > 2048) throw new Error('MIDI 演奏通道数量无效。');
    return body.midiExpression.map(raw => {
      const lane = object(raw, 'MIDI 演奏通道'); fields(lane, ['id', 'events', 'hiddenEvents'], 'MIDI 演奏通道');
      const id = text(lane.id, 'MIDI 演奏通道标识'); if (laneIds.has(id)) throw new Error('MIDI 演奏通道重复。'); laneIds.add(id);
      function readEvent(raw: unknown, hidden = false) {
        const item = object(raw, 'MIDI 演奏事件'); fields(item, ['type', 'controller', 'key', 'value', 'beat', 'order'], 'MIDI 演奏事件');
        if (++eventCount > MAX_MIDI_EXPRESSION_EVENTS) throw new Error('MIDI 演奏事件超出当前范围。');
        const order = item.order === undefined ? undefined : number(item.order, 'MIDI 事件顺序', 0, Number.MAX_SAFE_INTEGER);
        if (order !== undefined && !Number.isInteger(order)) throw new Error('MIDI 事件顺序必须为整数。');
        return { ...readMidiExpressionMessage(item), beat: number(item.beat, 'MIDI 演奏位置', 0, hidden ? MAX_PHRASE_BEATS : lengthBeats),
          ...(order === undefined ? {} : { order }) };
      }
      if (!Array.isArray(lane.events) || lane.hiddenEvents !== undefined && !Array.isArray(lane.hiddenEvents)) throw new Error('MIDI 演奏事件列表无效。');
      const events = lane.events.map(raw => readEvent(raw)).sort((a,b) => a.beat-b.beat || (a.order??0)-(b.order??0));
      const hiddenEvents = (lane.hiddenEvents as unknown[] | undefined)?.map(raw => {
        const item = object(raw, '隐藏演奏事件'); fields(item, ['sectionId', 'event'], '隐藏演奏事件');
        const sectionId = text(item.sectionId, '事件所属卷帘');
        if (sectionId !== 'first' && !sectionIds.has(sectionId)) throw new Error('隐藏演奏事件缺少所属卷帘。');
        return { sectionId, event: readEvent(item.event, true) };
      });
      return { id, events, ...(hiddenEvents?.length ? { hiddenEvents } : {}) };
    });
  })();
  const parts: PhrasePart[] = body.parts.map(raw => {
    const part = object(raw, '音乐中的声音');
    fields(part, ['id', 'name', 'timbreId', 'section', 'unassigned', 'notes', 'hiddenNotes', 'midiChannelId', 'level', 'pan'], '音乐中的声音');
    const id = unique(part.id, '声音标识');
    const name = text(part.name, '声音名称');
    const timbreId = text(part.timbreId, '引用声音标识');
    const midiChannelId = part.midiChannelId === undefined ? undefined : text(part.midiChannelId, 'MIDI 演奏通道');
    if (midiChannelId !== undefined && !laneIds.has(midiChannelId)) throw new Error('找不到音符对应的 MIDI 演奏通道。');
    const section = part.section === undefined ? undefined : partSection(part.section);
    if (part.unassigned !== undefined && typeof part.unassigned !== 'boolean') throw new Error('音色状态必须为开或关。');
    if (!Array.isArray(part.notes)) throw new Error('音乐中的音符列表无效。');
    if (part.hiddenNotes !== undefined && !Array.isArray(part.hiddenNotes)) throw new Error('被隐藏的音符不是有效列表。');
    noteCount += part.notes.length + ((part.hiddenNotes as unknown[] | undefined)?.length ?? 0);
    if (noteCount > MAX_PHRASE_NOTES) throw new Error(`当前音乐最多可编辑 ${MAX_PHRASE_NOTES} 个音符。`);
    function readNote(rawNote: unknown, hidden = false): PhraseNote {
      const note = object(rawNote, '音符');
      fields(note, ['id', 'startBeat', 'durationBeats', 'durationSeconds', 'frequencyHz', 'velocity', 'level', 'pan', 'midiOnOrder', 'midiOffOrder', 'midiChannelId', 'drumLane'], '音符');
      const noteId = unique(note.id, '音符标识');
      const noteChannel = note.midiChannelId == null ? note.midiChannelId : text(note.midiChannelId, '音符演奏通道');
      if (noteChannel != null && !laneIds.has(noteChannel)) throw new Error('找不到音符对应的 MIDI 演奏通道。');
      const startBeat = number(note.startBeat, '音符开始位置', 0, hidden ? MAX_PHRASE_BEATS : lengthBeats);
      const durationBeats = number(note.durationBeats, '音符长度', MIN_NOTE_BEATS, hidden ? MAX_PHRASE_BEATS : lengthBeats);
      if (!hidden && exceedsLength(startBeat, durationBeats, lengthBeats)) throw new Error('音符超出音乐结尾，请先延长音乐。');
      const drumLane = note.drumLane === undefined ? undefined : number(note.drumLane, '打击位', 0, Number.MAX_SAFE_INTEGER);
      if (drumLane !== undefined && !Number.isInteger(drumLane)) throw new Error('打击位必须是整数。');
      return {
        id: noteId, startBeat, durationBeats,
        ...(drumLane === undefined ? {} : { drumLane }),
        ...(noteChannel === undefined ? {} : { midiChannelId: noteChannel }),
        ...(note.midiOnOrder === undefined ? {} : { midiOnOrder: number(note.midiOnOrder, 'MIDI 按键顺序', 0, Number.MAX_SAFE_INTEGER) }),
        ...(note.midiOffOrder === undefined ? {} : { midiOffOrder: number(note.midiOffOrder, 'MIDI 松键顺序', 0, Number.MAX_SAFE_INTEGER) }),
        ...(note.durationSeconds === undefined ? {} : { durationSeconds: number(note.durationSeconds, '音符持续秒数', MIN_NOTE_SECONDS, 96) }),
        frequencyHz: number(note.frequencyHz, '音高', MIN_PITCH_HZ, MAX_PITCH_HZ),
        velocity: number(note.velocity, '音符力度', 0, 1),
        ...(note.level === undefined ? {} : { level: number(note.level, '音符音量', 0, 1) }),
        ...(note.pan === undefined ? {} : { pan: number(note.pan, '音符声像', -1, 1) }),
      };
    }
    const notes = part.notes.map(rawNote => readNote(rawNote));
    const hiddenNotes = (part.hiddenNotes as unknown[] | undefined)?.map(raw => {
      const item = object(raw, '被隐藏的音符'); fields(item, ['sectionId', 'note'], '被隐藏的音符');
      const sectionId = text(item.sectionId, '音符所属卷帘');
      if (sectionId !== 'first' && !sectionIds.has(sectionId)) throw new Error('被隐藏的音符缺少所属BPM卷帘。');
      const note = readNote(item.note, true);
      if (note.durationSeconds === undefined) throw new Error('被隐藏的音符缺少原始持续时值。');
      return { sectionId, note };
    });
    return { id, name, timbreId,
      ...(part.level === undefined ? {} : { level: number(part.level, '音色音量', 0, 1) }),
      ...(part.pan === undefined ? {} : { pan: number(part.pan, '音色声像', -1, 1) }), ...(midiChannelId === undefined ? {} : { midiChannelId }), ...(section === undefined ? {} : { section }),
      ...(part.unassigned === undefined ? {} : { unassigned: part.unassigned }), notes,
      ...(hiddenNotes?.length ? { hiddenNotes } : {}) };
  });
  return { model: 'note-phrase', version: 1, timeUnit: 'beat', tempoBpm, lengthBeats,
    ...(tempoSections === undefined ? {} : { tempoSections }),
    ...(stepsPerBeat === undefined ? {} : { stepsPerBeat }),
    ...(beatsPerBar === undefined ? {} : { beatsPerBar }),
    ...(pickupBeats === undefined ? {} : { pickupBeats }),
    ...(masterLevel === undefined ? {} : { masterLevel }), ...(midiExpression === undefined ? {} : { midiExpression }), parts };
}

type Snapshot = { name: string; dependencies: string[]; body: PhraseBody };
function references(body: PhraseBody): string[] { return [...new Set(body.parts.map(part => part.timbreId))]; }
async function preparePhraseSounds(body: PhraseBody, playback: TimbrePlaybackPort, tempoBpm = body.tempoBpm): Promise<void> {
  const ratio = body.tempoBpm / number(tempoBpm, '速度', MIN_TEMPO_BPM, MAX_TEMPO_BPM);
  const sounds = new Map<string, Map<string, SoundPlan['note']>>();
  for (const part of body.parts) {
    if (part.unassigned) continue;
    for (const note of part.notes) {
      const input = { frequencyHz: note.frequencyHz,
        holdSeconds: Math.max(MIN_NOTE_SECONDS, note.durationSeconds ?? phraseHeldSeconds(body, note) * ratio), velocity: note.velocity };
      const unique = sounds.get(part.timbreId) ?? new Map<string, SoundPlan['note']>();
      unique.set(JSON.stringify([input.frequencyHz, input.holdSeconds, input.velocity]), input); sounds.set(part.timbreId, unique);
    }
  }
  await Promise.all([...sounds].map(([id, notes]) => playback.prepareForSaved(id, [...notes.values()])));
}
/** Stable part ids identify individual uses even when several parts share one sound. */
export function createPhraseReferenceAdapter(): ReferenceAdapter {
  function validate(record: ContentRecord | Draft): PhraseBody {
    if (record.kind !== KIND || record.owner !== OWNER || record.schemaVersion !== 1) throw new Error('这份内容不是当前支持的音乐。');
    const body = readPhraseBody(record.body); const actual = references(body);
    if (record.dependencies.length !== actual.length || actual.some(id => !record.dependencies.includes(id))) throw new Error('音乐声音引用与依赖记录不一致。');
    return body;
  }
  return { kind: KIND,
    slots(record) { return validate(record).parts.map(part => ({ id: part.id, targetId: part.timbreId, label: part.name })); },
    validateTarget(record, slotId, target, slots) {
      if (!(slots ?? validate(record).parts).some(part => part.id === slotId) || target.kind !== 'rootsound.timbre'
        || target.owner !== 'timbre' || target.schemaVersion !== 1) throw new Error('音乐的声音位置需要当前支持的音色内容。');
    },
    replace(record, replacements) {
      const body = validate(record); const used = new Set<string>();
      for (const replacement of replacements) {
        const part = body.parts.find(item => item.id === replacement.slotId);
        if (!part || used.has(part.id) || typeof replacement.targetId !== 'string' || !replacement.targetId.trim()) throw new Error('要修改的音乐声音位置已改变。');
        used.add(part.id); part.timbreId = replacement.targetId;
      }
      return { body, dependencies: references(body) };
    },
  };
}
function snapshot(draft: Draft, body: PhraseBody): Snapshot {
  return { name: draft.name, dependencies: [...draft.dependencies], body };
}
function same(a: unknown, b: unknown): boolean { return JSON.stringify(a) === JSON.stringify(b); }

function validatePhrase(record: Draft | ContentRecord, playback: TimbrePlaybackPort, parsed?: PhraseBody): PhraseBody {
  if (record.kind !== KIND || record.schemaVersion !== 1 || record.owner !== OWNER) {
    throw new Error('这份内容目前不能作为音乐打开。原内容已保留。');
  }
  const body = parsed ?? readPhraseBody(record.body);
  const actual = references(body);
  if (record.dependencies.length !== actual.length || actual.some(id => !record.dependencies.includes(id))) {
    throw new Error('音乐中的声音引用与依赖记录不一致。原内容已保留。');
  }
  for (const id of actual) playback.readSaved(id);
  return body;
}
function compilePhrase(body: PhraseBody, playback: TimbrePlaybackPort, tempoBpm = body.tempoBpm, allowSilence = false, midiEffects = true): SoundSequencePlan {
  number(tempoBpm, '速度', MIN_TEMPO_BPM, MAX_TEMPO_BPM);
  const ratio = body.tempoBpm / tempoBpm;
  const performance = midiEffects ? phraseExpression(body, ratio) : undefined;
  const events = body.parts.filter(part => !part.unassigned).flatMap(part => part.notes.map(note => {
      let sound = playback.planForSaved(part.timbreId, { frequencyHz: note.frequencyHz,
        holdSeconds: Math.max(MIN_NOTE_SECONDS, note.durationSeconds ?? phraseHeldSeconds(body, note) * ratio), velocity: note.velocity });
      const at = phraseBeatSeconds(body, note.startBeat) * ratio;
      const gate = performance?.gates.get(note.id);
      if (gate) sound = { ...sound, note: { ...sound.note, holdSeconds: Math.max(MIN_NOTE_SECONDS, gate.soundEnd - at) } };
      const level = (body.masterLevel ?? 1) * (note.level ?? 1) * (part.level ?? 1);
      return { atSeconds: phraseBeatSeconds(body, note.startBeat) * ratio,
        sound: body.masterLevel === undefined && note.level === undefined && part.level === undefined ? sound : { ...sound, level: sound.level * level },
        ...(note.pan === undefined && part.pan === undefined ? {} : { pan: Math.max(-1, Math.min(1, (note.pan ?? 0) + (part.pan ?? 0))) }) };
  }));
  if (!events.length && !allowSilence && !body.parts.some(part => part.unassigned && part.notes.length || part.hiddenNotes?.length)) throw new Error('先添加几个音符，再试听这个音乐吧。');
  events.sort((a, b) => a.atSeconds - b.atSeconds);
  const durationSeconds = events.reduce((end, event) => Math.max(end,
    event.atSeconds + event.sound.note.holdSeconds + event.sound.envelope.releaseSeconds), phraseDurationSeconds(body) * ratio);
  return { kind: 'sequence', version: 1, durationSeconds, events, ...(performance?.lanes.length ? { midiExpression: performance.lanes } : {}) };
}

export function createPhrasePlayback(library: MaterialLibrary, playback: TimbrePlaybackPort): PhrasePlaybackPort {
  function readSaved(id: string): { content: ContentRecord; body: PhraseBody } {
    const content = library.readContent(id);
    if (!content) throw new Error('找不到要使用的音乐。');
    return { content, body: validatePhrase(content, playback) };
  }
  return {
    listSaved: () => library.listContentInfo().filter(content => content.kind === KIND).map(content => library.readContent(content.id)!),
    readSaved,
    async prepareForSaved(id, tempoBpm) {
      const before = readSaved(id);
      await preparePhraseSounds(before.body, playback, tempoBpm);
      if (!same(readSaved(id).content, before.content)) throw new Error('准备期间音乐发生变化，请重新试听。');
    },
    planForSaved(id, tempoBpm) { return compilePhrase(readSaved(id).body, playback, tempoBpm); },
  };
}

/** Phrase meaning stays here; storage, sound compilation and execution are injected ports. */
export function createPhraseEditor(library: MaterialLibrary, playback: TimbrePlaybackPort): PhraseEditorPort {
  let active: string | undefined;

  function validate(record: Draft | ContentRecord): PhraseBody {
    return validatePhrase(record, playback);
  }
  const latest = library.listDrafts().filter(draft => draft.kind === KIND).at(-1);
  // Retain the user's latest identity even if its domain data is unsupported.
  // read() reports the problem without blocking unrelated workstation modules.
  if (latest) active = latest.id;

  function current(draft = active ? library.readDraft(active) : undefined): { draft: Draft; body: PhraseBody } {
    if (!draft) throw new Error('先选择一个声音，开始谱写音乐吧。');
    return { draft, body: validate(draft) };
  }
  function changed(draft: Draft): boolean {
    const source = draft.sourceId ? library.readContent(draft.sourceId) : undefined;
    return !source || source.name !== draft.name || !same(source.body, draft.body)
      || !same(source.dependencies, draft.dependencies);
  }
  function write(next: Snapshot, baseline?: { draft: Draft; before: string }): void {
    const { draft, before } = baseline ?? (() => { const { draft, body } = current(); return { draft, before: JSON.stringify(snapshot(draft, body)) }; })();
    const candidate = { ...draft, ...next };
    const validBody = validate(candidate);
    const after = snapshot(candidate, validBody);
    if (before === JSON.stringify(after)) return;
    library.updateDraft(draft.id, after, { remember: true, expected: draft });
  }
  function modify(change: (body: PhraseBody) => void): void {
    const { draft, body } = current();
    const before = JSON.stringify(snapshot(draft, body));
    change(body);
    write({ name: draft.name, dependencies: references(body), body }, { draft, before });
  }
  function part(body: PhraseBody, partId: string): PhrasePart {
    const found = body.parts.find(item => item.id === partId);
    if (!found) throw new Error('找不到这个音乐中的声音。');
    return found;
  }
  function soundName(timbreId: string): string {
    return playback.readSaved(timbreId).content.name;
  }
  function availableSounds(draft?: Draft): ContentRecord[] {
    const available = draft && library.listContentInfoForDraft ? new Set(library.listContentInfoForDraft(draft.id).map(item => item.id)) : undefined;
    return playback.listSaved().filter(item => !available || available.has(item.id));
  }
  function travel(direction: 'undo' | 'redo'): void {
    const { draft } = current();
    let target;
    if (library.readDraftHistoryStep) target = library.readDraftHistoryStep(draft.id, direction);
    else {
      const history = library.readDraftHistory(draft.id);
      target = (direction === 'undo' ? history.past : history.future).at(-1);
    }
    if (!target) return;
    if (!target.transactionId) validate({ ...draft, ...target });
    library.travelDraft(draft.id, direction, draft);
  }

  return {
    read() {
      let state: ReturnType<typeof current> | undefined;
      let problem: string | undefined;
      const preserved = active ? library.readDraft(active) : undefined;
      if (active) {
        try { state = current(preserved); }
        catch (error) { problem = error instanceof Error ? error.message : String(error); }
      }
      const history = state ? library.readDraftHistoryStatus?.(state.draft.id) ?? (() => {
        const history = library.readDraftHistory(state.draft.id);
        return { canUndo: !!history.past.length, canRedo: !!history.future.length };
      })() : undefined;
      const edited = preserved ? changed(preserved) : false;
      return {
        draft: state?.draft ?? preserved, body: state?.body, problem,
        savedPhrases: library.listContentInfo().filter(content => content.kind === KIND).map(content => library.readContent(content.id)!),
        unfinishedDrafts: library.listDrafts().filter(draft => draft.kind === KIND && (draft.id === preserved?.id ? edited : changed(draft))),
        availableSounds: availableSounds(preserved), changed: edited,
        canUndo: history?.canUndo ?? false, canRedo: history?.canRedo ?? false,
      };
    },
    create(timbreId) {
      const name = soundName(timbreId);
      const body: PhraseBody = {
        model: 'note-phrase', version: 1, timeUnit: 'beat', tempoBpm: 120, lengthBeats: 8,
        parts: [{ id: crypto.randomUUID(), name, timbreId, notes: [] }],
      };
      const draft = library.createDraft({ kind: KIND, schemaVersion: 1, owner: OWNER,
        name: '我的第一个音乐', dependencies: [timbreId], body });
      active = draft.id;
    },
    open(contentId) {
      const content = library.readContent(contentId);
      if (!content) throw new Error('找不到要打开的音乐。');
      validate(content);
      const existing = library.listDrafts().find(draft => draft.sourceId === contentId);
      if (existing) validate(existing);
      const draft = existing ?? library.createDraft({ sourceId: contentId });
      active = draft.id;
    },
    openDraft(draftId) {
      const draft = library.readDraft(draftId);
      if (!draft) throw new Error('找不到这份音乐编辑稿。');
      validate(draft);
      active = draft.id;
    },
    rename(name) {
      const { draft, body } = current();
      write({ name: text(name.trim(), '音乐名称'), dependencies: draft.dependencies, body });
    },
    setTempo(tempoBpm, options = {}) {
      const value = number(tempoBpm, '速度', MIN_TEMPO_BPM, MAX_TEMPO_BPM);
      modify(body => {
        if(value===body.tempoBpm)return;
        if (options.preserveNoteDurations && value !== body.tempoBpm) {
          for (const part of body.parts) for (const note of part.notes) {
            if (note.durationSeconds === undefined) note.durationSeconds = phraseHeldSeconds(body, note);
          }
        }
        if(options.preserveNoteDurations)body.tempoBpm=value;
        else retimeHeldNotes(body,()=>{body.tempoBpm=value;});
      });
    },
    addTempoSection() {
      const id = crypto.randomUUID();
      modify(body => {
        const startBeat = body.lengthBeats, tempoBpm = body.tempoSections?.at(-1)?.tempoBpm ?? body.tempoBpm;
        body.lengthBeats += (body.beatsPerBar ?? 4) * 4;
        const stepsPerBeat = body.tempoSections?.at(-1)?.stepsPerBeat ?? phraseStepsPerBeat(body);
        body.tempoSections = [...(body.tempoSections ?? []), { id, startBeat, tempoBpm, stepsPerBeat }];
      });
      return id;
    },
    setTempoSection(id, tempoBpm) {
      const value = number(tempoBpm, 'BPM卷帘速度', MIN_TEMPO_BPM, MAX_TEMPO_BPM);
      modify(body => {
        const target = body.tempoSections?.find(section => section.id === id);
        if (!target) throw new Error('这个BPM卷帘已不存在。');
        if(value===target.tempoBpm)return;
        retimeHeldNotes(body,()=>{target.tempoBpm=value;});
      });
    },
    setTempoSectionSteps(id, stepsPerBeat) {
      const value = phraseStepsPerBeat({ stepsPerBeat });
      modify(body => {
        if (id) {
          const target = body.tempoSections?.find(section => section.id === id);
          if (!target) throw new Error('这个BPM卷帘已不存在。');
          target.stepsPerBeat = value;
        } else {
          const old = phraseStepsPerBeat(body);
          for (const section of body.tempoSections ?? []) section.stepsPerBeat ??= old;
          body.stepsPerBeat = value;
        }
      });
    },
    previewTempoSectionStart(id, startBeat, gridOnlyBase) {
      return gridOnlyBase ? resizeTempoRoll(gridOnlyBase, id, startBeat, true) : readPhraseBody(resizeTempoRoll(current().body, id, startBeat));
    },
    previewLastTempoRollLength(lengthBeats, base) {
      return base ? resizeTempoRoll(base, undefined, lengthBeats) : readPhraseBody(resizeTempoRoll(current().body, undefined, lengthBeats));
    },
    setLastTempoRollLength(lengthBeats) {
      const { draft, body } = current();
      write({ name: draft.name, dependencies: draft.dependencies, body: resizeTempoRoll(body, undefined, lengthBeats) });
    },
    setTempoSectionStart(id, startBeat) {
      const { draft, body } = current();
      write({ name: draft.name, dependencies: draft.dependencies, body: resizeTempoRoll(body, id, startBeat) });
    },
    setMasterLevel(level) { const value = number(level, '音乐音量', 0, 1); modify(body => { body.masterLevel = value; }); },
    setStepsPerBeat(stepsPerBeat) {
      const value = phraseStepsPerBeat({ stepsPerBeat: number(stepsPerBeat, '每拍细分', 2, 9) });
      modify(body => { if (phraseStepsPerBeat(body) !== value) body.stepsPerBeat = value; });
    },
    setLength(lengthBeats) {
      const value = number(lengthBeats, '音乐长度', 0.25, MAX_PHRASE_BEATS);
      modify(body => {
        if (body.parts.some(part => part.notes.some(note => exceedsLength(note.startBeat, note.durationBeats, value)))) {
          throw new Error('音符超出音乐结尾，请先移动或缩短这些音符。');
        }
        body.lengthBeats = value;
      });
    },
    addPart(timbreId, section) {
      const name = soundName(timbreId);
      const selectedSection = section === undefined ? undefined : partSection(section);
      const id = crypto.randomUUID();
      modify(body => { body.parts.push({ id, name, timbreId, ...(selectedSection === undefined ? {} : { section: selectedSection }), notes: [] }); });
      return id;
    },
    setPartMix(partId, changes) {
      if (changes.level !== undefined) number(changes.level, '音色音量', 0, 1);
      if (changes.pan !== undefined) number(changes.pan, '音色声像', -1, 1);
      modify(body => { Object.assign(part(body, partId), changes); });
    },
    setPartTimbre(partId, timbreId) {
      if (!availableSounds(current().draft).some(sound => sound.id === timbreId)) throw new Error('请选择当前歌曲音色库里的音色。');
      const name = soundName(timbreId);
      modify(body => { const target = part(body, partId); Object.assign(target, { timbreId, name }); delete target.unassigned; });
    },
    setPartVisible(partId, visible) {
      this.setPartsVisible([partId], visible);
    },
    setPartsVisible(partIds, visible) {
      if (typeof visible !== 'boolean') throw new Error('音色状态必须为开或关。');
      if (!Array.isArray(partIds) || partIds.some(id => typeof id !== 'string' || !id)) throw new Error('音色位置无效。');
      modify(body => {
        const targets = [...new Set(partIds)].map(id => part(body, id));
        for (const target of targets) { if (visible) delete target.unassigned; else target.unassigned = true; }
      });
    },
    removePart(partId) {
      this.removeParts([partId]);
    },
    removeParts(partIds) {
      if (!Array.isArray(partIds) || partIds.some(id => typeof id !== 'string' || !id)) throw new Error('音色位置无效。');
      modify(body => {
        const ids = new Set(partIds); for (const id of ids) part(body, id);
        body.parts = body.parts.filter(item => !ids.has(item.id));
      });
    },
    mergeParts(sourcePartId, targetPartId) {
      if (sourcePartId === targetPartId) return;
      modify(body => {
        const source = part(body, sourcePartId), target = part(body, targetPartId);
        if (source.unassigned || target.unassigned || source.timbreId !== target.timbreId)
          throw new Error('只能合并使用相同音色的音符组。');
        if (source.level !== target.level || source.pan !== target.pan) {
          for (const group of [source, target]) {
            const bake = (note: PhraseNote): PhraseNote => ({ ...note, level: (note.level ?? 1) * (group.level ?? 1), pan: Math.max(-1, Math.min(1, (note.pan ?? 0) + (group.pan ?? 0))) });
            group.notes = group.notes.map(bake);
            if (group.hiddenNotes) group.hiddenNotes = group.hiddenNotes.map(item => ({ ...item, note: bake(item.note) }));
            delete group.level; delete group.pan;
          }
        }
        const preserve = (note: PhraseNote): PhraseNote => {
          const channel = note.midiChannelId === undefined ? source.midiChannelId ?? null : note.midiChannelId;
          return (channel ?? undefined) === target.midiChannelId && note.midiChannelId === undefined
            ? note : { ...note, midiChannelId: channel };
        };
        target.notes.push(...source.notes.map(preserve));
        if (source.hiddenNotes?.length) target.hiddenNotes = [...target.hiddenNotes ?? [],
          ...source.hiddenNotes.map(item => ({ ...item, note: preserve(item.note) }))];
        body.parts = body.parts.filter(item => item.id !== sourcePartId);
      });
    },
    addNote(partId, input) {
      return this.addNotes(partId, [input])[0]!;
    },
    addNotes(partId, inputs) {
      if (!Array.isArray(inputs)) throw new Error('音符列表无效。');
      const notes = inputs.map(input => {
        fields(object(input, '音符'), ['startBeat', 'durationBeats', 'durationSeconds', 'frequencyHz', 'velocity', 'level', 'pan', 'midiOnOrder', 'midiOffOrder', 'midiChannelId', 'drumLane'], '音符');
        return { ...input, id: crypto.randomUUID() };
      });
      modify(body => { part(body, partId).notes.push(...notes); });
      return notes.map(note => note.id);
    },
    updateNote(partId, noteId, changes) {
      this.updateNotes([{ partId, noteId, changes }]);
    },
    updateNotes(updates) {
      if (!Array.isArray(updates)) throw new Error('音符修改列表无效。');
      modify(body => {
        const ids = new Set<string>();
        for (const update of updates) {
          fields(object(update, '音符修改'), ['partId', 'noteId', 'changes'], '音符修改');
          fields(object(update.changes, '音符修改'), ['startBeat', 'durationBeats', 'durationSeconds', 'frequencyHz', 'velocity', 'level', 'pan', 'drumLane'], '音符修改');
          if (ids.has(update.noteId)) throw new Error('一次修改中不能重复指定同一音符。');
          ids.add(update.noteId);
          const found = part(body, update.partId).notes.find(item => item.id === update.noteId);
          if (!found) throw new Error('找不到这个音符。');
          if (found.durationSeconds !== undefined && update.changes.durationBeats !== undefined
            && !Object.hasOwn(update.changes, 'durationSeconds')) {
            found.durationSeconds = update.changes.durationBeats * 60 / body.tempoBpm;
          }
          Object.assign(found, update.changes, { id: found.id });
        }
      });
    },
    moveNote(partId, noteId, targetPartId, changes = {}) {
      fields(object(changes, '音符修改'), ['startBeat', 'durationBeats', 'durationSeconds', 'frequencyHz', 'velocity', 'level', 'pan', 'drumLane'], '音符修改');
      modify(body => {
        const source = part(body, partId); const target = part(body, targetPartId);
        if ((source.section ?? 'melody') !== (target.section ?? 'melody')) throw new Error('音符只能在同一部门内更换音色。');
        const note = source.notes.find(item => item.id === noteId);
        if (!note) throw new Error('找不到这个音符。');
        const replacement = { ...note, ...changes, id: note.id };
        if (note.durationSeconds !== undefined && changes.durationBeats !== undefined && !Object.hasOwn(changes, 'durationSeconds')) {
          replacement.durationSeconds = changes.durationBeats * 60 / body.tempoBpm;
        }
        if (source.id === target.id) source.notes[source.notes.indexOf(note)] = replacement;
        else { source.notes = source.notes.filter(item => item.id !== noteId); target.notes.push(replacement); }
      });
    },
    removeNote(partId, noteId) {
      this.removeNotes([{ partId, noteId }]);
    },
    removeNotes(notes) {
      if (!Array.isArray(notes)) throw new Error('音符列表无效。');
      modify(body => {
        for (const ref of notes) {
          fields(object(ref, '音符标识'), ['partId', 'noteId'], '音符标识');
          const found = part(body, ref.partId);
          if (!found.notes.some(item => item.id === ref.noteId)) throw new Error('找不到这个音符。');
          found.notes = found.notes.filter(item => item.id !== ref.noteId);
        }
      });
    },
    undo() { travel('undo'); },
    redo() { travel('redo'); },
    keyboard(): KeyboardPitch[] {
      const labels = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
      const first = MIN_MIDI_PITCH;
      const last = MAX_MIDI_PITCH;
      return Array.from({ length: last - first + 1 }, (_, index) => {
        const midi = first + index; const semitone = midi % 12;
        return { label: `${labels[semitone]}${Math.floor(midi / 12) - 1}`,
          frequencyHz: 440 * 2 ** ((midi - 69) / 12), accidental: [1, 3, 6, 8, 10].includes(semitone) };
      });
    },
    async preparePreview(bodyOverride) {
      const before = current();
      const token = library.currentToken();
      const temporary = bodyOverride === undefined ? before.body : readPhraseBody(bodyOverride);
      const body = bodyOverride === undefined ? temporary : validatePhrase({ ...before.draft, dependencies: references(temporary) }, playback, temporary);
      await preparePhraseSounds(body, playback);
      if (active !== before.draft.id || token !== library.currentToken() && !same(current().draft, before.draft))
        throw new Error('准备期间音乐发生变化，请重新试听。');
    },
    async previewNotePlan(partId, input) {
      const before = current(); const target = part(before.body, partId);
      if (target.unassigned) throw new Error('这个音色尚未定义，请先从音色库中选择音色。');
      const note = { frequencyHz: number(input.frequencyHz, '音高', MIN_PITCH_HZ, MAX_PITCH_HZ),
        holdSeconds: number(input.holdSeconds, '试音长度', 0.0001, 120), velocity: number(input.velocity, '音符力度', 0, 1) };
      await playback.prepareForSaved(target.timbreId, [note]);
      const after = current(); const selected = after.body.parts.find(item => item.id === partId);
      if (after.draft.id !== before.draft.id || selected?.timbreId !== target.timbreId || selected.unassigned) throw new Error('试音期间使用的声音发生变化，请重试。');
      const sound = playback.planForSaved(target.timbreId, note);
      return after.body.masterLevel === undefined ? sound : { ...sound, level: sound.level * after.body.masterLevel };
    },
    async previewPianoPlan(input) {
      const before = current();
      const note = { frequencyHz: number(input.frequencyHz, '音高', MIN_PITCH_HZ, MAX_PITCH_HZ),
        holdSeconds: number(input.holdSeconds, '试音长度', MIN_NOTE_SECONDS, 120), velocity: number(input.velocity, '音符力度', 0, 1) };
      const plan = await playback.previewPianoPlan(note);
      const after = current();
      if (after.draft.id !== before.draft.id) throw new Error('试音期间歌曲发生变化，请重试。');
      return after.body.masterLevel === undefined ? plan : { ...plan, level: plan.level * after.body.masterLevel };
    },
    async previewTimbrePlan(timbreId, input) {
      const before = current();
      if (!availableSounds(before.draft).some(item => item.id === timbreId)) throw new Error('请选择当前歌曲音色库里的音色。');
      const note = { frequencyHz: number(input.frequencyHz, '音高', MIN_PITCH_HZ, MAX_PITCH_HZ),
        holdSeconds: number(input.holdSeconds, '试音长度', 0.0001, 120), velocity: number(input.velocity, '音符力度', 0, 1) };
      await playback.prepareForSaved(timbreId, [note]);
      const after = current();
      if (after.draft.id !== before.draft.id || !availableSounds(after.draft).some(item => item.id === timbreId)) throw new Error('试音期间使用的音色库发生变化，请重试。');
      const sound = playback.planForSaved(timbreId, note);
      return after.body.masterLevel === undefined ? sound : { ...sound, level: sound.level * after.body.masterLevel };
    },
    previewPlan(bodyOverride, options = {}): SoundSequencePlan {
      const { draft, body } = current();
      if (bodyOverride === undefined) return compilePhrase(body, playback, body.tempoBpm, options.allowSilence, options.midiEffects);
      const temporary = readPhraseBody(bodyOverride);
      return compilePhrase(validatePhrase({ ...draft, dependencies: references(temporary) }, playback, temporary), playback, temporary.tempoBpm, options.allowSilence, options.midiEffects);
    },
    save(mode, confirmation) {
      const { draft, body } = current();
      if (!body.parts.some(part => part.notes.length || part.hiddenNotes?.length)) throw new Error('先添加几个音符，再保存这个音乐吧。');
      return library.saveDraft(draft.id, mode, confirmation);
    },
  };
}
