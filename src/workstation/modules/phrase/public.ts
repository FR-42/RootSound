import { readMidiExpressionMessage, MAX_MIDI_EXPRESSION_EVENTS, type MidiExpressionLane } from '../../contracts/midi-expression.ts';
import { phraseExpression, phrasePartTouch } from '../../contracts/phrase-expression.ts';
import type { ContentRecord, Draft, MaterialLibrary } from '../../contracts/content.ts';
import type { KeyboardPitch, PhraseBody, PhraseDraftPartEdit, PhraseEditorPort, PhraseNote, PhrasePart, PhrasePlaybackPort, PhraseSection } from '../../contracts/phrase.ts';
import type { SoundPlan, SoundSequencePlan } from '../../contracts/sound.ts';
import type { TimbrePlaybackPort } from '../../contracts/timbre.ts';
import type { ReferenceAdapter, ReferenceSlot } from '../../contracts/references.ts';
import { MAX_PHRASE_BEATS, MAX_PHRASE_NOTES, MAX_NOTE_GAIN_DB, MIN_NOTE_BEATS, MIN_NOTE_GAIN_DB, MIN_NOTE_SECONDS } from '../../contracts/phrase-limits.ts';
import { phraseNotePan, phraseStepsPerBeat } from '../../contracts/phrase.ts';
import { isSupportedMeter, phraseBarBeats, phraseBeatSeconds, phraseDurationSeconds, phraseGainTimeline, phraseHeldSeconds, phraseHeldBeats, phraseMeterBeatLength, phraseSecondsBeat, phraseTempoGrid, withPhraseGridOffset } from '../../contracts/phrase-time.ts';
import { CURVE_LIMITS, isPedalCurve, MAX_GAIN_CURVE_POINTS, PERFORMANCE_CURVES, type CurveKind } from '../../contracts/gain-curve.ts';
import { resizeTempoRoll } from './tempo-roll-resize.ts';
import { MIN_TEMPO_BPM, MAX_TEMPO_BPM, MIN_PITCH_HZ, MAX_PITCH_HZ, MIN_MIDI_PITCH, MAX_MIDI_PITCH } from '../../contracts/music-limits.ts';

export type { KeyboardPitch, PhraseBody, PhraseEditorPort, PhraseNote, PhrasePart, PhraseSection, PhraseView, PhrasePlaybackPort, PhraseNoteRef, PhraseNoteUpdate } from '../../contracts/phrase.ts';
export { PHRASE_STEPS_PER_BEAT, phraseStepsPerBeat } from '../../contracts/phrase.ts';

const KIND = 'rootsound.phrase';
const OWNER = 'phrase';
/** First editor limits, not a restriction on future RootSound phrase formats. */
const MAX_PARTS = 128;

/** Tempo edits retain musical lengths, including old notes stored in seconds. */
function retimeHeldNotes(body:PhraseBody, change:()=>void, maxSeconds = Infinity):void {
  const before=structuredClone(body);
  const held=new Map(body.parts.flatMap(part=>part.notes.map(note=>[note.id,phraseHeldBeats(before,note.startBeat,phraseHeldSeconds(before,note))] as const)));
  const hiddenSections = new Map(body.parts.flatMap(part => (part.hiddenNotes ?? []).map(item => [item.note.id, item.sectionId] as const)));
  change();
  for(const part of body.parts) {
    for(const note of part.notes) {
      const beats=held.get(note.id)!;
      note.durationBeats=Math.max(MIN_NOTE_BEATS,Math.min(body.lengthBeats-note.startBeat,beats));
      note.durationSeconds=Math.min(maxSeconds,Math.max(MIN_NOTE_SECONDS,phraseBeatSeconds(body,note.startBeat+beats)-phraseBeatSeconds(body,note.startBeat)));
    }
    for(const hidden of part.hiddenNotes??[]) {
      const oldId = hiddenSections.get(hidden.note.id);
      const oldTempo=oldId==='first'?before.tempoBpm:before.tempoSections!.find(section=>section.id===oldId)!.tempoBpm;
      const newTempo=hidden.sectionId==='first'?body.tempoBpm:body.tempoSections!.find(section=>section.id===hidden.sectionId)!.tempoBpm;
      hidden.note.durationSeconds=Math.min(maxSeconds,Math.max(MIN_NOTE_SECONDS,hidden.note.durationSeconds!*oldTempo/newTempo));
    }
  }
}

export type PhraseSecondsInput = {
  name: string; timbreId: string; durationSeconds: number; tempoBpm?: number;
  notes: { startSeconds: number; durationSeconds: number; frequencyHz: number; velocity?: number; level?: number; pan?: number }[];
};

function setTempoGrid(body: PhraseBody, tempoBpm: number, sectionId?: string): void {
  const before = { ...body }, next = phraseTempoGrid(before, tempoBpm, sectionId);
  if (next === before) return;
  const previousTempo = sectionId === undefined ? before.tempoBpm : before.tempoSections!.find(section => section.id === sectionId)!.tempoBpm;
  const remapLocalBeat = (beat: number, id: string) => id === (sectionId ?? 'first') ? beat * tempoBpm / previousTempo : beat;
  const remapBeat = (beat: number) => phraseSecondsBeat(next, phraseBeatSeconds(before, beat));
  const remapCurve = (curve: NonNullable<PhrasePart['gainCurve']>) => curve.map(point => ({ ...point, beat: remapBeat(point.beat) }));
  const parts = before.parts.map(part => ({
    ...part,
    notes: part.notes.map(note => {
      const startBeat = remapBeat(note.startBeat);
      const seconds = phraseHeldSeconds(before, note);
      const durationBeats = Math.min(next.lengthBeats - startBeat, phraseHeldBeats(next, startBeat, seconds));
      const explicit = seconds >= MIN_NOTE_SECONDS && seconds <= 96;
      if (!explicit && durationBeats < MIN_NOTE_BEATS) throw new Error('这个速度会使音符超出可保留的时值范围。');
      return { ...note, startBeat, durationBeats: Math.max(MIN_NOTE_BEATS, durationBeats), durationSeconds: explicit ? seconds : undefined };
    }),
    ...(part.hiddenNotes ? { hiddenNotes: part.hiddenNotes.map(item => ({ ...item, note: {
      ...item.note, startBeat: remapLocalBeat(item.note.startBeat, item.sectionId),
      durationBeats: Math.max(MIN_NOTE_BEATS, remapLocalBeat(item.note.durationBeats, item.sectionId)),
    } })) } : {}),
    ...(part.gainCurve ? { gainCurve: remapCurve(part.gainCurve) } : {}),
    ...(part.performanceCurves ? { performanceCurves: Object.fromEntries(Object.entries(part.performanceCurves).map(([kind, curve]) => [kind, remapCurve(curve)])) } : {}),
  }));
  const midiExpression = before.midiExpression?.map(lane => ({
    ...lane,
    events: lane.events.map(event => ({ ...event, beat: Math.min(next.lengthBeats, remapBeat(event.beat)) })),
    ...(lane.hiddenEvents ? { hiddenEvents: lane.hiddenEvents.map(item => ({ ...item, event: {
      ...item.event, beat: remapLocalBeat(item.event.beat, item.sectionId),
    } })) } : {}),
  }));
  Object.assign(body, next, { parts, midiExpression });
}

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
function uniquePhraseId(ids: Set<string>, value: unknown, label: string): string {
  const id = text(value, label);
  if (ids.has(id)) throw new Error('音乐中存在重复的声音或音符标识。原内容已保留。');
  ids.add(id);
  return id;
}

function readNote(rawNote: unknown, lengthBeats: number, laneIds: ReadonlySet<string>, ids: Set<string>, hidden = false): PhraseNote {
  const note = object(rawNote, '音符');
  fields(note, ['id', 'startBeat', 'durationBeats', 'durationSeconds', 'frequencyHz', 'velocity', 'level', 'gainDb', 'pan', 'midiOnOrder', 'midiOffOrder', 'midiChannelId', 'drumLane'], '音符');
  const noteId = uniquePhraseId(ids, note.id, '音符标识');
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
    ...(note.gainDb === undefined ? {} : { gainDb: number(note.gainDb, '音符音量', MIN_NOTE_GAIN_DB, MAX_NOTE_GAIN_DB) }),
    ...(note.pan === undefined ? {} : { pan: number(note.pan, '音符声像', -1, 1) }),
  };
}

export function readPhraseBody(value: unknown): PhraseBody {
  const body = object(value, '音乐');
  fields(body, ['model', 'version', 'timeUnit', 'tempoBpm', 'gridOffsetBeats', 'tempoSections', 'lengthBeats', 'stepsPerBeat', 'beatsPerBar', 'beatUnit', 'pickupBeats', 'masterLevel', 'parts', 'midiExpression'], '音乐');
  if (body.model !== 'note-phrase' || body.version !== 1 || body.timeUnit !== 'beat') {
    throw new Error('暂不支持这份音乐的格式或版本。原内容已保留。');
  }
  const tempoBpm = number(body.tempoBpm, '速度', MIN_TEMPO_BPM, MAX_TEMPO_BPM);
  const lengthBeats = number(body.lengthBeats, '音乐长度', 0.25, MAX_PHRASE_BEATS);
  const beatsPerBar = body.beatsPerBar === undefined ? undefined : number(body.beatsPerBar, '每小节拍数', 1, 16);
  const beatUnit = body.beatUnit === undefined ? undefined : number(body.beatUnit, '拍号分母', 1, 32);
  if (!isSupportedMeter(beatsPerBar ?? 4, beatUnit ?? 4)) throw new Error('拍号超出当前支持范围。');
  const bar = phraseBarBeats({ beatsPerBar, beatUnit });
  let previousStart = 0;
  const sectionIds = new Set<string>();
  const tempoSections = body.tempoSections === undefined ? undefined : (() => {
    if (!Array.isArray(body.tempoSections) || body.tempoSections.length > 2047) throw new Error('BPM画布数量超出当前范围。');
    return body.tempoSections.map(raw => {
      const value = object(raw, 'BPM画布'); fields(value, ['id', 'startBeat', 'tempoBpm', 'stepsPerBeat', 'gridOffsetBeats'], 'BPM画布');
      const id = text(value.id, 'BPM画布标识'), startBeat = number(value.startBeat, 'BPM画布起点', 0, lengthBeats);
      if (id === 'first' || sectionIds.has(id) || startBeat <= previousStart || startBeat >= lengthBeats) throw new Error('BPM画布必须按时间连续排列。');
      sectionIds.add(id); previousStart = startBeat;
      return { id, startBeat, tempoBpm: number(value.tempoBpm, 'BPM画布速度', MIN_TEMPO_BPM, MAX_TEMPO_BPM),
        ...(value.gridOffsetBeats === undefined ? {} : { gridOffsetBeats: number(value.gridOffsetBeats, 'BPM画布网格偏移', 0, 64) }),
        ...(value.stepsPerBeat === undefined ? {} : { stepsPerBeat: phraseStepsPerBeat({ stepsPerBeat: value.stepsPerBeat as number }) }) };
    });
  })();
  const stepsPerBeat = body.stepsPerBeat === undefined ? undefined : phraseStepsPerBeat({ stepsPerBeat: body.stepsPerBeat as number });
  const pickupBeats = body.pickupBeats === undefined ? undefined : number(body.pickupBeats, '弱起拍数', 0, bar);
  if (pickupBeats !== undefined && pickupBeats >= bar) throw new Error('弱起拍数必须少于一小节。');
  const masterLevel = body.masterLevel === undefined ? undefined : number(body.masterLevel, '音乐音量', 0, 1);
  if (!Array.isArray(body.parts) || body.parts.length > MAX_PARTS) {
    throw new Error(`当前音乐最多可使用 ${MAX_PARTS} 个声音。`);
  }
  const ids = new Set<string>();
  let noteCount = 0;
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
        const sectionId = text(item.sectionId, '事件所属画布');
        if (sectionId !== 'first' && !sectionIds.has(sectionId)) throw new Error('隐藏演奏事件缺少所属画布。');
        return { sectionId, event: readEvent(item.event, true) };
      });
      return { id, events, ...(hiddenEvents?.length ? { hiddenEvents } : {}) };
    });
  })();
  const parts: PhrasePart[] = body.parts.map(raw => {
    const part = object(raw, '音乐中的声音');
    fields(part, ['id', 'name', 'timbreId', 'section', 'unassigned', 'notes', 'hiddenNotes', 'midiChannelId', 'level', 'pan', 'gainCurve', 'performanceCurves'], '音乐中的声音');
    const id = uniquePhraseId(ids, part.id, '声音标识');
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
    const notes = part.notes.map(rawNote => readNote(rawNote, lengthBeats, laneIds, ids));
    const gainCurve = part.gainCurve === undefined ? undefined : readGainCurve(part.gainCurve);
    const rawCurves = part.performanceCurves === undefined ? {} : object(part.performanceCurves, '演奏曲线');
    fields(rawCurves, PERFORMANCE_CURVES, '演奏曲线');
    const performanceCurves = Object.fromEntries(PERFORMANCE_CURVES.flatMap(kind => {
      const points = rawCurves[kind] === undefined ? [] : readGainCurve(rawCurves[kind], kind);
      return points.length ? [[kind, points]] : [];
    }));
    const hiddenNotes = (part.hiddenNotes as unknown[] | undefined)?.map(raw => {
      const item = object(raw, '被隐藏的音符'); fields(item, ['sectionId', 'note'], '被隐藏的音符');
      const sectionId = text(item.sectionId, '音符所属画布');
      if (sectionId !== 'first' && !sectionIds.has(sectionId)) throw new Error('被隐藏的音符缺少所属BPM画布。');
      const note = readNote(item.note, lengthBeats, laneIds, ids, true);
      if (note.durationSeconds === undefined) throw new Error('被隐藏的音符缺少原始持续时值。');
      return { sectionId, note };
    });
    return { id, name, timbreId,
      ...(part.level === undefined ? {} : { level: number(part.level, '音色音量', 0, 1) }),
      ...(gainCurve?.length ? { gainCurve } : {}),
      ...(Object.keys(performanceCurves).length ? { performanceCurves } : {}),
      ...(part.pan === undefined ? {} : { pan: number(part.pan, '音色声像', -1, 1) }), ...(midiChannelId === undefined ? {} : { midiChannelId }), ...(section === undefined ? {} : { section }),
      ...(part.unassigned === undefined ? {} : { unassigned: part.unassigned }), notes,
      ...(hiddenNotes?.length ? { hiddenNotes } : {}) };
  });
  return { model: 'note-phrase', version: 1, timeUnit: 'beat', tempoBpm, lengthBeats,
    ...(tempoSections === undefined ? {} : { tempoSections }),
    ...(stepsPerBeat === undefined ? {} : { stepsPerBeat }),
    ...(beatsPerBar === undefined ? {} : { beatsPerBar }),
    ...(beatUnit === undefined ? {} : { beatUnit }),
    ...(pickupBeats === undefined ? {} : { pickupBeats }),
    ...(body.gridOffsetBeats === undefined ? {} : { gridOffsetBeats: number(body.gridOffsetBeats, 'BPM画布网格偏移', 0, 64) }),
    ...(masterLevel === undefined ? {} : { masterLevel }), ...(midiExpression === undefined ? {} : { midiExpression }), parts };
}

function readGainCurve(value: unknown, kind: CurveKind = 'gain'): NonNullable<PhrasePart['gainCurve']> {
  if (!Array.isArray(value) || value.length > MAX_GAIN_CURVE_POINTS) throw new Error('曲线控制点数量超出范围。');
  const limit = CURVE_LIMITS[kind], pedal = isPedalCurve(kind);
  let previous = -1;
  return value.map(raw => {
    const point = object(raw, '音量增益控制点');
    fields(point, pedal ? ['beat', 'db'] : ['beat', 'db', 'before', 'after'], '曲线控制点');
    const beat = number(point.beat, '控制点位置', 0, MAX_PHRASE_BEATS);
    if (beat <= previous) throw new Error('音量增益控制点必须按时间排列，且不能重叠。');
    previous = beat;
    const db = number(point.db, '控制点数值', pedal ? 0 : -limit, limit);
    if (pedal && !Number.isInteger(db)) throw new Error('踏板只能开启或关闭。');
    return { beat, db, ...(point.before === undefined ? {} : { before: number(point.before, '曲线形状', -limit, limit) }),
      ...(point.after === undefined ? {} : { after: number(point.after, '曲线形状', -limit, limit) }) };
  });
}

type Snapshot = { name: string; dependencies: string[]; body: PhraseBody };
function references(body: PhraseBody): string[] { return [...new Set(body.parts.map(part => part.timbreId))]; }
const validatedSlots = new WeakMap<object, ReferenceSlot[]>();
function rememberPhraseSlots(value: unknown, body: PhraseBody): void {
  if (typeof value === 'object' && value !== null) {
    validatedSlots.set(value, body.parts.map(part => ({ id: part.id, targetId: part.timbreId, label: part.name })));
  }
}
async function preparePhraseSounds(body: PhraseBody, playback: TimbrePlaybackPort, tempoBpm = body.tempoBpm): Promise<void> {
  const ratio = body.tempoBpm / number(tempoBpm, '速度', MIN_TEMPO_BPM, MAX_TEMPO_BPM);
  const sounds = new Map<string, Map<string, SoundPlan['note']>>();
  for (const part of body.parts) {
    if (part.unassigned || !part.notes.length) continue;
    let unique = sounds.get(part.timbreId);
    if (!unique) sounds.set(part.timbreId, unique = new Map());
    const touch = phrasePartTouch(body, part);
    for (const note of part.notes) {
      const input = { frequencyHz: note.frequencyHz,
        holdSeconds: Math.max(MIN_NOTE_SECONDS, note.durationSeconds ?? phraseHeldSeconds(body, note) * ratio), velocity: touch(note) };
      unique.set(JSON.stringify([input.frequencyHz, input.holdSeconds, input.velocity]), input);
    }
  }
  await Promise.all([...sounds].map(([id, notes]) => playback.prepareForSaved(id, [...notes.values()])));
}
export function readPhraseReferenceBody(record: ContentRecord | Draft): PhraseBody {
  if (record.kind !== KIND || record.owner !== OWNER || record.schemaVersion !== 1) throw new Error('这份内容不是当前支持的音乐。');
  const body = readPhraseBody(record.body); const actual = references(body);
  if (record.dependencies.length !== actual.length || actual.some(id => !record.dependencies.includes(id))) throw new Error('音乐声音引用与依赖记录不一致。');
  return body;
}
/** Stable part ids identify individual uses even when several parts share one sound. */
export function createPhraseReferenceAdapter(): ReferenceAdapter {
  return { kind: KIND,
    slots(record) {
      const cached = record.owner === OWNER && record.schemaVersion === 1 && record.body && typeof record.body === 'object'
        ? validatedSlots.get(record.body) : undefined;
      if (cached) return cached.map(slot => ({ ...slot }));
      return readPhraseReferenceBody(record).parts.map(part => ({ id: part.id, targetId: part.timbreId, label: part.name }));
    },
    validateTarget(record, slotId, target, slots) {
      if (!(slots ?? readPhraseReferenceBody(record).parts).some(part => part.id === slotId) || target.kind !== 'rootsound.timbre'
        || target.owner !== 'timbre' || target.schemaVersion !== 1) throw new Error('音乐的声音位置需要当前支持的音色内容。');
    },
    replace(record, replacements) {
      const body = readPhraseReferenceBody(record); const used = new Set<string>();
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
function compilePhrase(body: PhraseBody, playback: TimbrePlaybackPort, tempoBpm = body.tempoBpm, allowSilence = false, midiEffects = true, editableNotes?: true): SoundSequencePlan {
  number(tempoBpm, '速度', MIN_TEMPO_BPM, MAX_TEMPO_BPM);
  const ratio = body.tempoBpm / tempoBpm;
  const performance = phraseExpression(body, ratio, midiEffects);
  const activeParts = body.parts.filter(part => !part.unassigned && part.notes.length);
  const curveMap = (pick: (part: PhrasePart) => PhrasePart['gainCurve']) => Object.fromEntries(activeParts.flatMap(part => {
    const points = pick(part);
    return points?.some(point => point.db || point.before || point.after) ? [[part.id, phraseGainTimeline(body, points, ratio)]] : [];
  }));
  const gainCurves = curveMap(part => part.gainCurve), pitchCurves = curveMap(part => part.performanceCurves?.pitch);
  const events = activeParts.flatMap(part => {
    const touch = phrasePartTouch(body, part);
    return part.notes.map(note => {
      let sound = playback.planForSaved(part.timbreId, { frequencyHz: note.frequencyHz,
        holdSeconds: Math.max(MIN_NOTE_SECONDS, note.durationSeconds ?? phraseHeldSeconds(body, note) * ratio), velocity: touch(note) });
      const at = phraseBeatSeconds(body, note.startBeat) * ratio;
      const gate = performance.gates.get(note.id);
      if (gate) sound = { ...sound, note: { ...sound.note, holdSeconds: Math.max(MIN_NOTE_SECONDS, gate.soundEnd - at) } };
      const level = (body.masterLevel ?? 1) * (note.level ?? 1) * (part.level ?? 1);
      return { atSeconds: at, groupId: part.id, ...(editableNotes ? { noteId: note.id } : {}),
        sound: body.masterLevel === undefined && note.level === undefined && part.level === undefined ? sound : { ...sound, level: sound.level * level },
        ...(note.gainDb ? { noteGainDb: note.gainDb } : {}),
        ...(Object.hasOwn(gainCurves, part.id) ? { gainCurveId: part.id } : {}),
        ...(Object.hasOwn(pitchCurves, part.id) ? { pitchCurveId: part.id } : {}),
        ...(note.pan === undefined && part.pan === undefined ? {} : { pan: phraseNotePan(part, note) }) };
    });
  });
  if (!events.length && !allowSilence && !body.parts.some(part => part.unassigned && part.notes.length || part.hiddenNotes?.length)) throw new Error('先添加几个音符，再试听这个音乐吧。');
  events.sort((a, b) => a.atSeconds - b.atSeconds);
  const durationSeconds = events.reduce((end, event) => Math.max(end,
    event.atSeconds + event.sound.note.holdSeconds + event.sound.envelope.releaseSeconds), phraseDurationSeconds(body) * ratio);
  return { kind: 'sequence', version: 1, durationSeconds, events, ...(editableNotes ? { editableNotes } : {}), ...(Object.keys(gainCurves).length ? { gainCurves } : {}),
    ...(Object.keys(pitchCurves).length ? { pitchCurves } : {}), ...(performance.lanes.length ? { midiExpression: performance.lanes } : {}) };
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
export function createPhraseEditor(library: MaterialLibrary, playback: TimbrePlaybackPort, options: { autoRollLength?: boolean } = {}): PhraseEditorPort {
  const noteTails = new WeakMap<PhraseNote[], { tempo: number; sections: PhraseBody['tempoSections']; end: number }>();
  function noteTail(body: PhraseBody, note: PhraseNote): number {
    const beatEnd = note.startBeat + note.durationBeats;
    if (note.durationSeconds === undefined) return beatEnd;
    return Math.max(beatEnd, phraseSecondsBeat(body, phraseBeatSeconds(body, note.startBeat) + note.durationSeconds));
  }
  function cachedTail(body: PhraseBody, notes: PhraseNote[]): number | undefined {
    const cached = noteTails.get(notes);
    return cached?.tempo === body.tempoBpm && cached.sections === body.tempoSections ? cached.end : undefined;
  }
  function fitRollEnd(body: PhraseBody): PhraseBody {
    if (!options.autoRollLength) return body;
    const last = body.tempoSections?.at(-1);
    const beat = phraseMeterBeatLength(body);
    let occupiedEnd = last?.startBeat ?? 0;
    let hasNotes = false;
    for (const voice of body.parts) {
      let end = cachedTail(body, voice.notes);
      if (end === undefined) {
        end = 0;
        for (const note of voice.notes) end = Math.max(end, noteTail(body, note));
        noteTails.set(voice.notes, { tempo: body.tempoBpm, sections: body.tempoSections, end });
      }
      hasNotes ||= voice.notes.length > 0;
      occupiedEnd = Math.max(occupiedEnd, end);
      for (const point of voice.gainCurve ?? []) occupiedEnd = Math.max(occupiedEnd, point.beat);
      for (const curve of Object.values(voice.performanceCurves ?? {}))
        for (const point of curve) occupiedEnd = Math.max(occupiedEnd, point.beat);
    }
    for (const lane of body.midiExpression ?? [])
      for (const event of lane.events) occupiedEnd = Math.max(occupiedEnd, event.beat);
    const remaining = body.lengthBeats - occupiedEnd;
    if (hasNotes && remaining > 4 * beat && remaining <= 12 * beat) return body;
    const minimum = last ? last.startBeat + beat : .25;
    const lengthBeats = Math.min(MAX_PHRASE_BEATS, Math.max(minimum, occupiedEnd + 8 * beat));
    return Math.abs(lengthBeats - body.lengthBeats) < 1e-8 ? body : { ...body, lengthBeats };
  }
  let active: string | undefined;
  let deferNoteWrites = false;
  let noteCommit: { token: string; draft: Draft; body: PhraseBody } | undefined;
  let noteDraft: { token: string; draft: Draft; body: PhraseBody; ids: Set<string>; laneIds: Set<string>; count: number } | undefined;
  const validatedDraftBodies = new WeakSet<object>();
  const noteDeletionListeners = new Set<(ids: readonly string[], deleted: boolean) => void>();
  let preparedPreview: { id: string; token: string; source: PhraseBody | undefined; ready: Promise<void> } | undefined;

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
  function cachedNoteDraft() {
    return noteDraft?.draft.id === active && noteDraft?.token === library.currentToken() ? noteDraft : undefined;
  }
  function previewDraft(bodyOverride?: PhraseBody): { draft: Draft; body: PhraseBody } {
    const before = (deferNoteWrites ? prepareDraftNoteEdit() : undefined) ?? current();
    if (bodyOverride === undefined || bodyOverride === before.body) return before;
    const temporary = readPhraseBody(bodyOverride);
    const draft = before.draft;
    return { draft, body: validatePhrase({ ...draft, dependencies: references(temporary) }, playback, temporary) };
  }
  function prepareDraftNoteEdit() {
    const cached = cachedNoteDraft();
    if (cached) return cached;
    if (!active || !library.readDraftView || !library.editDraftBody) return;
    const draft = library.readDraftView(active);
    if (!draft) return;
    const retained = draft.body as unknown as PhraseBody;
    const parsed = validatedDraftBodies.has(retained) ? retained : validate(draft);
    const body = parsed === retained || same(draft.body, parsed) ? retained : parsed;
    const laneIds = new Set(body.midiExpression?.map(lane => lane.id));
    let count = 0;
    const ids = new Set<string>();
    for (const voice of body.parts) {
      ids.add(voice.id);
      for (const note of voice.notes) { ids.add(note.id); count++; }
      for (const { note } of voice.hiddenNotes ?? []) { ids.add(note.id); count++; }
    }
    rememberPhraseSlots(draft.body, body);
    if (body === retained) validatedDraftBodies.add(body);
    return noteDraft = { token: library.currentToken(), draft, body, ids, laneIds, count };
  }
  function commitDraftEdit(snapshot: NonNullable<typeof noteDraft>, body: PhraseBody,
    references?: { dependencies: string[]; retainContent?: string }): { draft: Draft; body: PhraseBody } {
    if (!library.editDraftBody) throw new Error('找不到正在编辑的音乐。');
    rememberPhraseSlots(body, body);
    const draft = library.editDraftBody(snapshot.draft.id, body, snapshot.token, references);
    const saved = draft.body as unknown as PhraseBody;
    rememberPhraseSlots(saved, saved);
    validatedDraftBodies.add(saved);
    noteDraft = { ...snapshot, token: library.currentToken(), draft, body: saved };
    return { draft, body: saved };
  }
  function publishNoteDeletions(ids: readonly string[], deleted = true): void {
    if (!ids.length) return;
    for (const listener of noteDeletionListeners) {
      try { listener(ids, deleted); } catch { }
    }
  }
  function editDraftNote(draftId: string, partId: string, edit: Parameters<NonNullable<PhraseEditorPort['editDraftNote']>>[2]) {
    const snapshot = prepareDraftNoteEdit();
    if (!snapshot || snapshot.draft.id !== draftId || !library.editDraftBody) throw new Error('找不到正在编辑的音乐。');
    const { body, ids, laneIds, count } = snapshot;
    const voice = part(body, partId);
    const added = edit.kind === 'add' ? readNote(edit.note, body.lengthBeats, laneIds, new Set()) : undefined;
    const id = edit.kind === 'add' ? added!.id : edit.id;
    const notes = voice.notes.slice();
    let previous: PhraseNote | undefined, replacement = added;
    if (edit.kind === 'add') {
      if (count >= MAX_PHRASE_NOTES) throw new Error(`当前音乐最多可编辑 ${MAX_PHRASE_NOTES} 个音符。`);
      if (ids.has(id)) throw new Error('音乐中存在重复的声音或音符标识。原内容已保留。');
      notes.push(added!);
    } else {
      const index = notes.findIndex(note => note.id === id);
      if (index < 0) throw new Error('找不到这个音符。');
      previous = notes[index];
      if (edit.kind === 'remove') notes.splice(index, 1);
      else if (edit.kind === 'gain') notes[index] = readNote({ ...notes[index]!, gainDb: edit.gainDb }, body.lengthBeats, laneIds, new Set());
      else notes[index] = readNote({ ...notes[index]!, durationBeats: edit.durationBeats,
        durationSeconds: edit.durationSeconds ?? (notes[index]!.durationSeconds === undefined ? undefined : edit.durationBeats * 60 / body.tempoBpm) },
      body.lengthBeats, laneIds, new Set());
      if (edit.kind !== 'remove') replacement = notes[index];
    }
    const previousEnd = options.autoRollLength ? cachedTail(body, voice.notes) : undefined;
    if (previousEnd !== undefined) {
      const nextEnd = replacement ? noteTail(body, replacement) : 0;
      if (!previous || noteTail(body, previous) < previousEnd || nextEnd >= previousEnd) {
        noteTails.set(notes, { tempo: body.tempoBpm, sections: body.tempoSections, end: Math.max(previousEnd, nextEnd) });
      }
    }
    const changed = { ...body, parts: body.parts.map(value => value === voice ? { ...value, notes } : value) };
    const edited = commitDraftEdit(snapshot, edit.kind === 'gain' ? changed : fitRollEnd(changed));
    if (edit.kind === 'add') ids.add(id);
    else if (edit.kind === 'remove') ids.delete(id);
    noteDraft = { ...noteDraft!, ids, laneIds,
      count: count + (edit.kind === 'add' ? 1 : edit.kind === 'remove' ? -1 : 0) };
    if (edit.kind === 'remove' && noteDeletionListeners.size) publishNoteDeletions([id]);
    return edited;
  }
  function editDraftParts(draftId: string, edit: PhraseDraftPartEdit): string | undefined {
    const current = prepareDraftNoteEdit();
    if (!current || current.draft.id !== draftId) throw new Error('找不到正在编辑的音乐。');
    const { body, ids } = current;
    let removed: PhrasePart[] = [], created: PhrasePart | undefined, previous: string | undefined;
    let parts: PhrasePart[];
    if (edit.kind === 'add') {
      const replaced = edit.replaceEmpty === undefined ? undefined : part(body, edit.replaceEmpty);
      if (replaced && (replaced.notes.length || replaced.hiddenNotes?.length)) throw new Error('音符组已变化，请重新选择。');
      if (!replaced && body.parts.length >= MAX_PARTS) throw new Error(`当前音乐最多可使用 ${MAX_PARTS} 个声音。`);
      if (replaced) removed = [replaced];
      created = { id: crypto.randomUUID(), name: text(edit.name, '声音名称'), timbreId: text(edit.timbreId, '引用声音标识'),
        ...(edit.section === undefined ? {} : { section: partSection(edit.section) }), notes: [] };
      if (ids.has(created.id)) throw new Error('音乐中存在重复的声音或音符标识。原内容已保留。');
      parts = [...body.parts.filter(value => value !== replaced), created];
    } else if (edit.kind === 'rebind') {
      const old = part(body, edit.partId);
      if (old.timbreId === edit.timbreId && old.name === edit.name && !old.unassigned) return old.id;
      const replacement = { ...old, timbreId: text(edit.timbreId, '引用声音标识'), name: text(edit.name, '声音名称') };
      delete replacement.unassigned;
      previous = old.timbreId;
      parts = body.parts.map(value => value === old ? replacement : value);
    } else {
      const removable = new Set(edit.partIds);
      if (!removable.size) return;
      removed = [...removable].map(id => part(body, id));
      parts = body.parts.filter(value => !removable.has(value.id));
    }
    const next = { ...body, parts };
    const fitted = edit.kind === 'remove' && removed.some(voice => voice.notes.length) ? fitRollEnd(next) : next;
    commitDraftEdit(current, fitted, { dependencies: references(fitted), ...(previous && { retainContent: previous }) });
    if (created) ids.add(created.id);
    for (const voice of removed) {
      ids.delete(voice.id);
      for (const note of voice.notes) ids.delete(note.id);
      for (const { note } of voice.hiddenNotes ?? []) ids.delete(note.id);
      noteDraft!.count -= voice.notes.length + (voice.hiddenNotes?.length ?? 0);
    }
    if (noteDeletionListeners.size && removed.length) publishNoteDeletions(removed.flatMap(voice => voice.notes.map(note => note.id)));
    return edit.kind === 'rebind' ? edit.partId : created?.id;
  }
  function changed(draft: Draft): boolean {
    const source = draft.sourceId ? library.readContent(draft.sourceId) : undefined;
    return !source || source.name !== draft.name || !same(source.body, draft.body)
      || !same(source.dependencies, draft.dependencies);
  }
  function write(next: Snapshot, baseline?: { draft: Draft; before?: string }, deferStorage = false): void {
    const { draft, before } = baseline ?? (() => { const { draft, body } = current(); return { draft, before: JSON.stringify(snapshot(draft, body)) }; })();
    const candidate = { ...draft, ...next };
    const validBody = validate(candidate);
    const after = snapshot(candidate, validBody);
    if (before !== undefined && before === JSON.stringify(after)) return;
    library.updateDraft(draft.id, after, { remember: true, expected: draft, deferStorage });
  }
  function modify(change: (body: PhraseBody) => void): void {
    const { draft, body } = current();
    const before = JSON.stringify(snapshot(draft, body));
    change(body);
    write({ name: draft.name, dependencies: references(body), body }, { draft, before });
  }
  function modifyNotes(change: (body: PhraseBody, editPart: (id: string) => PhrasePart, laneIds: ReadonlySet<string>) => boolean,
    removed?: readonly { noteId: string }[]): void {
    const fast = deferNoteWrites ? prepareDraftNoteEdit() : undefined;
    if (fast) {
      const original = fast.body.parts;
      const body = { ...fast.body, parts: original.slice() };
      function editPart(id: string): PhrasePart {
        const target = part(body, id);
        const index = body.parts.indexOf(target);
        if (target !== original[index]) return target;
        return body.parts[index] = { ...target, notes: target.notes.slice() };
      }
      if (!change(body, editPart, fast.laneIds)) return;
      commitDraftEdit(fast, fitRollEnd(body));
      if (removed) {
        for (const { noteId } of removed) fast.ids.delete(noteId);
        noteDraft!.count -= removed.length;
        if (noteDeletionListeners.size) publishNoteDeletions(removed.map(ref => ref.noteId));
      }
      return;
    }
    const expectedToken = library.currentToken();
    const { draft, body } = current();
    if (change(body, id => part(body, id), new Set(body.midiExpression?.map(lane => lane.id)))) {
      writeNotes(draft, readPhraseBody(fitRollEnd(body)), expectedToken);
      if (removed && noteDeletionListeners.size) publishNoteDeletions(removed.map(ref => ref.noteId));
    }
  }
  function writeNotes(expected: Draft, body: PhraseBody, expectedToken: string): void {
    const draft = library.updateDraft(expected.id, { body }, { remember: true, expected, expectedToken, deferStorage: deferNoteWrites });
    const committed = draft.body as unknown as PhraseBody;
    if (committed.parts.length === body.parts.length && committed.parts.every((part, index) => part.timbreId === body.parts[index]?.timbreId)) {
      noteCommit = { token: library.currentToken(), draft, body };
    }
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
    const fast = deferNoteWrites ? prepareDraftNoteEdit() : undefined;
    const { draft, body } = fast ?? current();
    let target;
    if (library.readDraftHistoryStep) target = library.readDraftHistoryStep(draft.id, direction, !!fast);
    else {
      const history = library.readDraftHistory(draft.id);
      target = (direction === 'undo' ? history.past : history.future).at(-1);
    }
    if (!target) return;
    if (!target.transactionId && !validatedDraftBodies.has(target.body as object)) {
      const record = { ...draft, ...target }, parsed = validate(record);
      if (fast && same(parsed, target.body)) {
        rememberPhraseSlots(target.body, parsed);
        validatedDraftBodies.add(target.body as object);
      }
    }
    const next = library.travelDraft(draft.id, direction, draft, fast?.token);
    if (!noteDeletionListeners.size) return;
    const before = new Set(body.parts.map(voice => voice.notes));
    const after = new Set((next.body as unknown as PhraseBody).parts.map(voice => voice.notes));
    const changedIds = (left: Set<PhrasePart['notes']>, right: Set<PhrasePart['notes']>) => new Set(
      [...left].filter(notes => !right.has(notes)).flatMap(notes => notes.map(note => note.id)));
    const previousIds = changedIds(before, after), nextIds = changedIds(after, before);
    publishNoteDeletions([...previousIds].filter(id => !nextIds.has(id)));
    publishNoteDeletions([...nextIds].filter(id => !previousIds.has(id)), false);
  }

  return {
    autoRollLength: options.autoRollLength,
    ...(library.readDraftView && library.editDraftBody ? { prepareDraftNoteEdit, editDraftNote, editDraftParts } : {}),
    async prepareNoteAudition(partId, pitches) {
      const voice = part((cachedNoteDraft() ?? current()).body, partId);
      if (!voice.unassigned) await playback.prepareForSaved(voice.timbreId, pitches.map(frequencyHz => ({ frequencyHz, holdSeconds: .35, velocity: .75 })));
    },
    read(options) {
      let state: ReturnType<typeof current> | undefined;
      let problem: string | undefined;
      const recent = noteCommit;
      noteCommit = undefined;
      const committed = recent && recent.draft.id === active && recent.token === library.currentToken() ? recent : undefined;
      let shared: ReturnType<typeof prepareDraftNoteEdit>;
      if (options?.sharedDraft && active) {
        try { shared = prepareDraftNoteEdit(); } catch (error) { problem = error instanceof Error ? error.message : String(error); }
      }
      const preserved = shared?.draft ?? committed?.draft ?? (active ? library.readDraft(active) : undefined);
      if (active) {
        try { state = shared ?? committed ?? current(preserved); }
        catch (error) { problem = error instanceof Error ? error.message : String(error); }
      }
      const history = state ? library.readDraftHistoryStatus?.(state.draft.id) ?? (() => {
        const history = library.readDraftHistory(state.draft.id);
        return { canUndo: !!history.past.length, canRedo: !!history.future.length };
      })() : undefined;
      const edited = preserved ? (options?.sharedDraft ? library.isDraftChanged?.(preserved.id) : undefined) ?? changed(preserved) : false;
      return {
        draft: state?.draft ?? preserved, body: state?.body, problem,
        savedPhrases: options?.includeCatalog === false ? [] : library.listContentInfo().filter(content => content.kind === KIND).map(content => library.readContent(content.id)!),
        unfinishedDrafts: options?.includeCatalog === false ? [] : library.listDrafts().filter(draft => draft.kind === KIND && (draft.id === preserved?.id ? edited : changed(draft))),
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
      if (options.preserveTimeline) { modify(body => setTempoGrid(body, value)); return; }
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
    setMeter(beatsPerBar, beatUnit) {
      if (!isSupportedMeter(beatsPerBar, beatUnit)) throw new Error('拍号超出当前支持范围。');
      modify(body => {
        if ((body.beatsPerBar ?? 4) === beatsPerBar && (body.beatUnit ?? 4) === beatUnit) return;
        body.beatsPerBar = beatsPerBar;
        body.beatUnit = beatUnit;
        const bar = phraseBarBeats(body);
        if (body.pickupBeats !== undefined && body.pickupBeats >= bar) body.pickupBeats %= bar;
      });
    },
    addTempoSection() {
      const id = crypto.randomUUID();
      modify(body => {
        const startBeat = body.lengthBeats, tempoBpm = body.tempoSections?.at(-1)?.tempoBpm ?? body.tempoBpm;
        body.lengthBeats += phraseBarBeats(body) * 4;
        const stepsPerBeat = body.tempoSections?.at(-1)?.stepsPerBeat ?? phraseStepsPerBeat(body);
        body.tempoSections = [...(body.tempoSections ?? []), { id, startBeat, tempoBpm, stepsPerBeat }];
      });
      return id;
    },
    removeTempoSection(id) {
      modify(body => {
        const sections = body.tempoSections ?? [];
        const index = sections.findIndex(section => section.id === id);
        if (index < 0) throw new Error('这个 BPM 画布不能删除。');
        const previous = sections[index - 1];
        const upperId = previous?.id ?? 'first';
        const offset = sections[index]!.startBeat - (previous?.startBeat ?? 0);
        const merge = () => {
          if (sections.length === 1) delete body.tempoSections;
          else body.tempoSections = sections.filter(section => section.id !== id);
          for (const part of body.parts) for (const item of part.hiddenNotes ?? []) {
            if (item.sectionId !== id) continue;
            item.sectionId = upperId; item.note.startBeat += offset;
          }
          for (const lane of body.midiExpression ?? []) for (const item of lane.hiddenEvents ?? []) {
            if (item.sectionId !== id) continue;
            item.sectionId = upperId; item.event.beat += offset;
          }
        };
        if (sections[index]!.tempoBpm === (previous?.tempoBpm ?? body.tempoBpm)) merge();
        else retimeHeldNotes(body, merge, 96);
      });
    },
    setTempoSection(id, tempoBpm, options = {}) {
      const value = number(tempoBpm, 'BPM画布速度', MIN_TEMPO_BPM, MAX_TEMPO_BPM);
      if (options.preserveTimeline) { modify(body => setTempoGrid(body, value, id)); return; }
      modify(body => {
        const target = body.tempoSections?.find(section => section.id === id);
        if (!target) throw new Error('这个BPM画布已不存在。');
        if(value===target.tempoBpm)return;
        retimeHeldNotes(body,()=>{target.tempoBpm=value;});
      });
    },
    setTempoGridOffset(id, offsetBeats) {
      const offset = number(offsetBeats, 'BPM画布网格偏移', 0, 64);
      modify(body => {
        if (id !== undefined && !body.tempoSections?.some(section => section.id === id)) throw new Error('这个 BPM 画布已不存在。');
        Object.assign(body, withPhraseGridOffset(body, id, offset));
      });
    },
    setTempoSectionSteps(id, stepsPerBeat) {
      const value = phraseStepsPerBeat({ stepsPerBeat });
      modify(body => {
        if (id) {
          const target = body.tempoSections?.find(section => section.id === id);
          if (!target) throw new Error('这个BPM画布已不存在。');
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
    setPartGainCurve(partId, points) {
      const curve = readGainCurve(points);
      modify(body => {
        const target = part(body, partId);
        if (curve.length) target.gainCurve = curve;
        else delete target.gainCurve;
      });
    },
    setPartPerformanceCurve(partId, kind, points) {
      if (!PERFORMANCE_CURVES.includes(kind)) throw new Error('未知的演奏曲线。');
      const curve = readGainCurve(points, kind);
      modify(body => {
        const target = part(body, partId);
        const curves = { ...target.performanceCurves };
        if (curve.length) curves[kind] = curve;
        else delete curves[kind];
        if (Object.keys(curves).length) target.performanceCurves = curves;
        else delete target.performanceCurves;
      });
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
      const fast = deferNoteWrites ? prepareDraftNoteEdit() : undefined;
      if (fast) { editDraftParts(fast.draft.id, { kind: 'remove', partIds }); return; }
      const removed: string[] = [];
      modify(body => {
        const ids = new Set(partIds);
        for (const id of ids) {
          const voice = part(body, id);
          if (noteDeletionListeners.size) for (const note of voice.notes) removed.push(note.id);
        }
        body.parts = body.parts.filter(item => !ids.has(item.id));
      });
      publishNoteDeletions(removed);
    },
    mergeParts(sourcePartId, targetPartId) {
      if (sourcePartId === targetPartId) return;
      modify(body => {
        const source = part(body, sourcePartId), target = part(body, targetPartId);
        if (source.unassigned || target.unassigned || source.timbreId !== target.timbreId)
          throw new Error('只能合并使用相同音色的音符组。');
        if (!same(source.gainCurve ?? [], target.gainCurve ?? []) || PERFORMANCE_CURVES.some(kind =>
          !same(source.performanceCurves?.[kind] ?? [], target.performanceCurves?.[kind] ?? []))) throw new Error('两个音色卡的曲线不同，无法合并。');
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
        fields(object(input, '音符'), ['startBeat', 'durationBeats', 'durationSeconds', 'frequencyHz', 'velocity', 'level', 'gainDb', 'pan', 'midiOnOrder', 'midiOffOrder', 'midiChannelId', 'drumLane'], '音符');
        return { ...input, id: crypto.randomUUID() };
      });
      const expectedToken = library.currentToken();
      const { draft, body } = current();
      const target = part(body, partId);
      if (!notes.length) return [];
      const laneIds = new Set(body.midiExpression?.map(lane => lane.id));
      const ids = new Set<string>();
      let noteCount = notes.length;
      for (const voice of body.parts) {
        noteCount += voice.notes.length + (voice.hiddenNotes?.length ?? 0);
        ids.add(voice.id);
        for (const note of voice.notes) ids.add(note.id);
        for (const entry of voice.hiddenNotes ?? []) ids.add(entry.note.id);
      }
      if (noteCount > MAX_PHRASE_NOTES) throw new Error(`当前音乐最多可编辑 ${MAX_PHRASE_NOTES} 个音符。`);
      for (const note of notes) target.notes.push(readNote(note, body.lengthBeats, laneIds, ids));
      writeNotes(draft, fitRollEnd(body), expectedToken);
      return notes.map(note => note.id);
    },
    updateNote(partId, noteId, changes) {
      this.updateNotes([{ partId, noteId, changes }]);
    },
    updateNotes(updates, removals = []) {
      if (!Array.isArray(updates)) throw new Error('音符修改列表无效。');
      if (!Array.isArray(removals)) throw new Error('音符列表无效。');
      modifyNotes((body, editPart, laneIds) => {
        const ids = new Set<string>();
        let changed = false;
        for (const update of updates) {
          fields(object(update, '音符修改'), ['partId', 'noteId', 'changes'], '音符修改');
          fields(object(update.changes, '音符修改'), ['startBeat', 'durationBeats', 'durationSeconds', 'frequencyHz', 'velocity', 'level', 'gainDb', 'pan', 'drumLane'], '音符修改');
          if (ids.has(update.noteId)) throw new Error('一次修改中不能重复指定同一音符。');
          ids.add(update.noteId);
          const notes = editPart(update.partId).notes, index = notes.findIndex(item => item.id === update.noteId);
          const found = notes[index];
          if (!found) throw new Error('找不到这个音符。');
          const next = { ...found, ...update.changes, id: found.id };
          if (found.durationSeconds !== undefined && update.changes.durationBeats !== undefined
            && !Object.hasOwn(update.changes, 'durationSeconds')) {
            next.durationSeconds = update.changes.durationBeats * 60 / body.tempoBpm;
          }
          if (!same(found, next)) {
            notes[index] = readNote(next, body.lengthBeats, laneIds, new Set());
            changed = true;
          }
        }
        const byPart = new Map<string, Set<string>>();
        for (const ref of removals) {
          fields(object(ref, '音符标识'), ['partId', 'noteId'], '音符标识');
          if (ids.has(ref.noteId)) throw new Error('一次修改中不能重复指定同一音符。');
          ids.add(ref.noteId);
          let group = byPart.get(ref.partId);
          if (!group) byPart.set(ref.partId, group = new Set());
          group.add(ref.noteId);
        }
        for (const [id, group] of byPart) {
          const target = editPart(id), remaining = target.notes.filter(note => !group.has(note.id));
          if (target.notes.length - remaining.length !== group.size) throw new Error('找不到这个音符。');
          target.notes = remaining;
        }
        return changed || removals.length > 0;
      }, removals.length ? removals : undefined);
    },
    moveNote(partId, noteId, targetPartId, changes = {}) {
      fields(object(changes, '音符修改'), ['startBeat', 'durationBeats', 'durationSeconds', 'frequencyHz', 'velocity', 'level', 'gainDb', 'pan', 'drumLane'], '音符修改');
      modifyNotes((body, editPart, laneIds) => {
        const source = editPart(partId); const target = editPart(targetPartId);
        if ((source.section ?? 'melody') !== (target.section ?? 'melody')) throw new Error('音符只能在同一部门内更换音色。');
        const note = source.notes.find(item => item.id === noteId);
        if (!note) throw new Error('找不到这个音符。');
        const replacement = { ...note, ...changes, id: note.id };
        if (note.durationSeconds !== undefined && changes.durationBeats !== undefined && !Object.hasOwn(changes, 'durationSeconds')) {
          replacement.durationSeconds = changes.durationBeats * 60 / body.tempoBpm;
        }
        if (source.id === target.id) {
          if (same(note, replacement)) return false;
          source.notes[source.notes.indexOf(note)] = readNote(replacement, body.lengthBeats, laneIds, new Set());
        } else {
          const moved = readNote(replacement, body.lengthBeats, laneIds, new Set());
          source.notes = source.notes.filter(item => item.id !== noteId);
          target.notes.push(moved);
        }
        return true;
      });
    },
    removeNote(partId, noteId) {
      this.removeNotes([{ partId, noteId }]);
    },
    removeNotes(notes) {
      if (!Array.isArray(notes)) throw new Error('音符列表无效。');
      this.updateNotes([], notes);
    },
    subscribeNoteDeletions(listener) {
      noteDeletionListeners.add(listener);
      return () => { noteDeletionListeners.delete(listener); };
    },
    setNoteWritesDeferred(deferred) { deferNoteWrites = deferred; if (!deferred) preparedPreview = undefined; },
    hasDeferredNoteWrites: () => library.hasDeferredWrites?.() ?? false,
    flushNoteWrites() { library.flushDeferredWrites?.(); },
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
      const token = library.currentToken();
      if (deferNoteWrites && preparedPreview && preparedPreview.id === active && preparedPreview.token === token
        && preparedPreview.source === bodyOverride) return preparedPreview.ready;
      const before = previewDraft(bodyOverride);
      const ready = preparePhraseSounds(before.body, playback).then(() => {
        if (active !== before.draft.id || token !== library.currentToken() && !same((cachedNoteDraft() ?? current()).draft, before.draft))
          throw new Error('准备期间音乐发生变化，请重新试听。');
      });
      if (deferNoteWrites) preparedPreview = { id: before.draft.id, token, source: bodyOverride, ready };
      try { await ready; }
      catch (error) {
        if (preparedPreview?.ready === ready) preparedPreview = undefined;
        throw error;
      }
    },
    async previewNotePlan(partId, input) {
      const before = cachedNoteDraft() ?? current(); const target = part(before.body, partId); const token = library.currentToken();
      if (target.unassigned) throw new Error('这个音色尚未定义，请先从音色库中选择音色。');
      const note = { frequencyHz: number(input.frequencyHz, '音高', MIN_PITCH_HZ, MAX_PITCH_HZ),
        holdSeconds: number(input.holdSeconds, '试音长度', 0.0001, 120), velocity: number(input.velocity, '音符力度', 0, 1) };
      await playback.prepareForSaved(target.timbreId, [note]);
      const after = active === before.draft.id && library.currentToken() === token ? before : cachedNoteDraft() ?? current();
      const selected = after.body.parts.find(item => item.id === partId);
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
      const { body } = previewDraft(bodyOverride);
      return compilePhrase(body, playback, body.tempoBpm, options.allowSilence, options.midiEffects, options.editableNotes);
    },
    save(mode, confirmation) {
      const { draft, body } = current();
      if (!body.parts.some(part => part.notes.length || part.hiddenNotes?.length)) throw new Error('先添加几个音符，再保存这个音乐吧。');
      return library.saveDraft(draft.id, mode, confirmation);
    },
  };
}
