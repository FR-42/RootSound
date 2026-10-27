import type { ContentRecord, Draft, MaterialLibrary } from '../../contracts/content.ts';
import type { KeyboardPitch, PhraseBody, PhraseEditorPort, PhraseNote, PhrasePart, PhrasePlaybackPort, PhraseSection } from '../../contracts/phrase.ts';
import type { SoundSequencePlan } from '../../contracts/sound.ts';
import type { TimbrePlaybackPort } from '../../contracts/timbre.ts';
import type { ReferenceAdapter } from '../../contracts/references.ts';

export type { KeyboardPitch, PhraseBody, PhraseEditorPort, PhraseNote, PhrasePart, PhraseSection, PhraseView, PhrasePlaybackPort, PhraseNoteRef, PhraseNoteUpdate } from '../../contracts/phrase.ts';
export { PHRASE_STEPS_PER_BEAT } from '../../contracts/phrase.ts';

const KIND = 'rootsound.phrase';
const OWNER = 'phrase';
/** First editor limits, not a restriction on future RootSound phrase formats. */
const MAX_PARTS = 8;
const MAX_NOTES = 512;
const MIN_NOTE_BEATS = 1 / 1024;

export type PhraseSecondsInput = {
  name: string; timbreId: string; durationSeconds: number; tempoBpm?: number;
  notes: { startSeconds: number; durationSeconds: number; frequencyHz: number; velocity?: number; level?: number; pan?: number }[];
};

/** A tempo here is only a coordinate conversion; this function infers no beat, key or tuning. */
export function preparePhraseFromSeconds(input: PhraseSecondsInput): ContentRecord {
  if (!input || typeof input !== 'object') throw new Error('先提供要谱写的旋律。');
  const name = text(input.name, '乐句名称').trim(); const timbreId = text(input.timbreId, '旋律的声音标识');
  if (name.length > 4096) throw new Error('乐句名称过长。');
  const tempoBpm = number(input.tempoBpm ?? 120, '编辑坐标速度', 40, 240);
  const duration = number(input.durationSeconds, '旋律时长', Number.MIN_VALUE, 3600);
  const beatsPerSecond = tempoBpm / 60; const lengthBeats = duration * beatsPerSecond;
  if (lengthBeats < 0.25 || lengthBeats > 64) throw new Error('这段旋律过短或过长，超出当前乐句支持的时长范围。');
  if (!Array.isArray(input.notes) || input.notes.length > MAX_NOTES) throw new Error('旋律音符数量超出当前乐句范围。');
  const notes: PhraseNote[] = input.notes.map(raw => {
    const note = object(raw, '旋律音符'); fields(note, ['startSeconds', 'durationSeconds', 'frequencyHz', 'velocity', 'level', 'pan'], '旋律音符');
    return { id: crypto.randomUUID(), startBeat: number(note.startSeconds, '音符开始时间', 0, duration) * beatsPerSecond,
      durationBeats: number(note.durationSeconds, '音符持续时间', MIN_NOTE_BEATS / beatsPerSecond, duration) * beatsPerSecond,
      frequencyHz: number(note.frequencyHz, '音高', 20, 5000), velocity: note.velocity === undefined ? 0.75 : number(note.velocity, '音符力度', 0, 1),
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
  if (value !== 'melody' && value !== 'rhythm') throw new Error('乐句声部只能属于旋律部或节奏部。');
  return value;
}

/** Strict reads reject unknown fields rather than silently truncating future content. */
export function readPhraseBody(value: unknown): PhraseBody {
  const body = object(value, '乐句');
  fields(body, ['model', 'version', 'timeUnit', 'tempoBpm', 'lengthBeats', 'masterLevel', 'parts'], '乐句');
  if (body.model !== 'note-phrase' || body.version !== 1 || body.timeUnit !== 'beat') {
    throw new Error('暂不支持这份乐句的格式或版本。原内容已保留。');
  }
  const tempoBpm = number(body.tempoBpm, '速度', 40, 240);
  const lengthBeats = number(body.lengthBeats, '乐句长度', 0.25, 64);
  const masterLevel = body.masterLevel === undefined ? undefined : number(body.masterLevel, '乐句音量', 0, 1);
  if (!Array.isArray(body.parts) || body.parts.length > MAX_PARTS) {
    throw new Error(`当前乐句最多可使用 ${MAX_PARTS} 个声音。`);
  }
  const ids = new Set<string>();
  let noteCount = 0;
  function unique(value: unknown, label: string): string {
    const id = text(value, label);
    if (ids.has(id)) throw new Error('乐句中存在重复的声音或音符标识。原内容已保留。');
    ids.add(id);
    return id;
  }
  const parts: PhrasePart[] = body.parts.map(raw => {
    const part = object(raw, '乐句中的声音');
    fields(part, ['id', 'name', 'timbreId', 'section', 'unassigned', 'notes'], '乐句中的声音');
    const id = unique(part.id, '声音标识');
    const name = text(part.name, '声音名称');
    const timbreId = text(part.timbreId, '引用声音标识');
    const section = part.section === undefined ? undefined : partSection(part.section);
    if (part.unassigned !== undefined && typeof part.unassigned !== 'boolean') throw new Error('音色状态必须为开或关。');
    if (!Array.isArray(part.notes)) throw new Error('乐句中的音符列表无效。');
    noteCount += part.notes.length;
    if (noteCount > MAX_NOTES) throw new Error(`当前乐句最多可编辑 ${MAX_NOTES} 个音符。`);
    const notes: PhraseNote[] = part.notes.map(rawNote => {
      const note = object(rawNote, '音符');
      fields(note, ['id', 'startBeat', 'durationBeats', 'durationSeconds', 'frequencyHz', 'velocity', 'level', 'pan'], '音符');
      const noteId = unique(note.id, '音符标识');
      const startBeat = number(note.startBeat, '音符开始位置', 0, lengthBeats);
      const durationBeats = number(note.durationBeats, '音符长度', MIN_NOTE_BEATS, lengthBeats);
      if (exceedsLength(startBeat, durationBeats, lengthBeats)) throw new Error('音符超出乐句结尾，请先延长乐句。');
      return {
        id: noteId, startBeat, durationBeats,
        ...(note.durationSeconds === undefined ? {} : { durationSeconds: number(note.durationSeconds, '音符持续秒数', .0001, 96) }),
        frequencyHz: number(note.frequencyHz, '音高', 20, 5000),
        velocity: number(note.velocity, '音符力度', 0, 1),
        ...(note.level === undefined ? {} : { level: number(note.level, '音符音量', 0, 1) }),
        ...(note.pan === undefined ? {} : { pan: number(note.pan, '音符声像', -1, 1) }),
      };
    });
    return { id, name, timbreId, ...(section === undefined ? {} : { section }),
      ...(part.unassigned === undefined ? {} : { unassigned: part.unassigned }), notes };
  });
  return { model: 'note-phrase', version: 1, timeUnit: 'beat', tempoBpm, lengthBeats,
    ...(masterLevel === undefined ? {} : { masterLevel }), parts };
}

type Snapshot = { name: string; dependencies: string[]; body: PhraseBody };
function references(body: PhraseBody): string[] { return [...new Set(body.parts.map(part => part.timbreId))]; }
function audibleReferences(body: PhraseBody): string[] { return [...new Set(body.parts.filter(part => !part.unassigned).map(part => part.timbreId))]; }
/** Stable part ids identify individual uses even when several parts share one sound. */
export function createPhraseReferenceAdapter(): ReferenceAdapter {
  function validate(record: ContentRecord | Draft): PhraseBody {
    if (record.kind !== KIND || record.owner !== OWNER || record.schemaVersion !== 1) throw new Error('这份内容不是当前支持的乐句。');
    const body = readPhraseBody(record.body); const actual = references(body);
    if (record.dependencies.length !== actual.length || actual.some(id => !record.dependencies.includes(id))) throw new Error('乐句声音引用与依赖记录不一致。');
    return body;
  }
  return { kind: KIND,
    slots(record) { return validate(record).parts.map(part => ({ id: part.id, targetId: part.timbreId, label: part.name })); },
    validateTarget(record, slotId, target) {
      if (!validate(record).parts.some(part => part.id === slotId) || target.kind !== 'rootsound.timbre'
        || target.owner !== 'timbre' || target.schemaVersion !== 1) throw new Error('乐句的声音位置需要当前支持的音色内容。');
    },
    replace(record, replacements) {
      const body = validate(record); const used = new Set<string>();
      for (const replacement of replacements) {
        const part = body.parts.find(item => item.id === replacement.slotId);
        if (!part || used.has(part.id) || typeof replacement.targetId !== 'string' || !replacement.targetId.trim()) throw new Error('要修改的乐句声音位置已改变。');
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

function validatePhrase(record: Draft | ContentRecord, playback: TimbrePlaybackPort): PhraseBody {
  if (record.kind !== KIND || record.schemaVersion !== 1 || record.owner !== OWNER) {
    throw new Error('这份内容目前不能作为乐句打开。原内容已保留。');
  }
  const body = readPhraseBody(record.body);
  const actual = references(body);
  if (record.dependencies.length !== actual.length || actual.some(id => !record.dependencies.includes(id))) {
    throw new Error('乐句中的声音引用与依赖记录不一致。原内容已保留。');
  }
  for (const id of actual) playback.readSaved(id);
  return body;
}
function compilePhrase(body: PhraseBody, playback: TimbrePlaybackPort, tempoBpm = body.tempoBpm, allowSilence = false): SoundSequencePlan {
  number(tempoBpm, '速度', 40, 240);
  const secondsPerBeat = 60 / tempoBpm;
  const events = body.parts.filter(part => !part.unassigned).flatMap(part => part.notes.map(note => {
      const sound = playback.planForSaved(part.timbreId, { frequencyHz: note.frequencyHz,
        holdSeconds: note.durationSeconds ?? note.durationBeats * secondsPerBeat, velocity: note.velocity });
      const level = (body.masterLevel ?? 1) * (note.level ?? 1);
      return { atSeconds: note.startBeat * secondsPerBeat,
        sound: body.masterLevel === undefined && note.level === undefined ? sound : { ...sound, level: sound.level * level },
        ...(note.pan === undefined ? {} : { pan: note.pan }) };
  }));
  if (!events.length && !allowSilence && !body.parts.some(part => part.unassigned && part.notes.length)) throw new Error('先添加几个音符，再试听这个乐句吧。');
  events.sort((a, b) => a.atSeconds - b.atSeconds);
  return { kind: 'sequence', version: 1,
    durationSeconds: Math.max(body.lengthBeats * secondsPerBeat,
      ...events.map(event => event.atSeconds + event.sound.note.holdSeconds + event.sound.envelope.releaseSeconds)), events };
}

export function createPhrasePlayback(library: MaterialLibrary, playback: TimbrePlaybackPort): PhrasePlaybackPort {
  function readSaved(id: string): { content: ContentRecord; body: PhraseBody } {
    const content = library.readContent(id);
    if (!content) throw new Error('找不到要使用的乐句。');
    return { content, body: validatePhrase(content, playback) };
  }
  return {
    listSaved: () => library.listContentInfo().filter(content => content.kind === KIND).map(content => library.readContent(content.id)!),
    readSaved,
    async prepareForSaved(id) {
      const before = readSaved(id);
      await Promise.all(audibleReferences(before.body).map(soundId => playback.prepareForSaved(soundId)));
      if (!same(readSaved(id).content, before.content)) throw new Error('准备期间乐句发生变化，请重新试听。');
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

  function current(): { draft: Draft; body: PhraseBody } {
    const draft = active ? library.readDraft(active) : undefined;
    if (!draft) throw new Error('先选择一个声音，开始谱写乐句吧。');
    return { draft, body: validate(draft) };
  }
  function changed(draft: Draft): boolean {
    const source = draft.sourceId ? library.readContent(draft.sourceId) : undefined;
    return !source || source.name !== draft.name || !same(source.body, draft.body)
      || !same(source.dependencies, draft.dependencies);
  }
  function write(next: Snapshot): void {
    const { draft, body } = current();
    const before = snapshot(draft, body);
    const candidate = { ...draft, ...next };
    const validBody = validate(candidate);
    const after = snapshot(candidate, validBody);
    if (same(before, after)) return;
    library.updateDraft(draft.id, after, { remember: true, expected: draft });
  }
  function modify(change: (body: PhraseBody) => void): void {
    const { draft, body } = current();
    change(body);
    write({ name: draft.name, dependencies: references(body), body });
  }
  function part(body: PhraseBody, partId: string): PhrasePart {
    const found = body.parts.find(item => item.id === partId);
    if (!found) throw new Error('找不到这个乐句中的声音。');
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
    const history = library.readDraftHistory(draft.id);
    const from = direction === 'undo' ? history.past : history.future;
    const target = from.at(-1);
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
        try { state = current(); }
        catch (error) { problem = error instanceof Error ? error.message : String(error); }
      }
      const history = state ? library.readDraftHistory(state.draft.id) : undefined;
      return {
        draft: state?.draft ?? preserved, body: state?.body, problem,
        savedPhrases: library.listContentInfo().filter(content => content.kind === KIND).map(content => library.readContent(content.id)!),
        unfinishedDrafts: library.listDrafts().filter(draft => draft.kind === KIND && changed(draft)),
        availableSounds: availableSounds(preserved), changed: preserved ? changed(preserved) : false,
        canUndo: !!history?.past.length, canRedo: !!history?.future.length,
      };
    },
    create(timbreId) {
      const name = soundName(timbreId);
      const body: PhraseBody = {
        model: 'note-phrase', version: 1, timeUnit: 'beat', tempoBpm: 120, lengthBeats: 8,
        parts: [{ id: crypto.randomUUID(), name, timbreId, notes: [] }],
      };
      const draft = library.createDraft({ kind: KIND, schemaVersion: 1, owner: OWNER,
        name: '我的第一个乐句', dependencies: [timbreId], body });
      active = draft.id;
    },
    open(contentId) {
      const content = library.readContent(contentId);
      if (!content) throw new Error('找不到要打开的乐句。');
      validate(content);
      const existing = library.listDrafts().find(draft => draft.sourceId === contentId);
      if (existing) validate(existing);
      const draft = existing ?? library.createDraft({ sourceId: contentId });
      active = draft.id;
    },
    openDraft(draftId) {
      const draft = library.readDraft(draftId);
      if (!draft) throw new Error('找不到这份乐句编辑稿。');
      validate(draft);
      active = draft.id;
    },
    rename(name) {
      const { draft, body } = current();
      write({ name: text(name.trim(), '乐句名称'), dependencies: draft.dependencies, body });
    },
    setTempo(tempoBpm, options = {}) {
      const value = number(tempoBpm, '速度', 40, 240);
      modify(body => {
        if (options.preserveNoteDurations && value !== body.tempoBpm) {
          for (const part of body.parts) for (const note of part.notes) {
            if (note.durationSeconds === undefined) note.durationSeconds = note.durationBeats * 60 / body.tempoBpm;
          }
        }
        body.tempoBpm = value;
      });
    },
    setMasterLevel(level) { const value = number(level, '乐句音量', 0, 1); modify(body => { body.masterLevel = value; }); },
    setLength(lengthBeats) {
      const value = number(lengthBeats, '乐句长度', 0.25, 64);
      modify(body => {
        if (body.parts.some(part => part.notes.some(note => exceedsLength(note.startBeat, note.durationBeats, value)))) {
          throw new Error('音符超出乐句结尾，请先移动或缩短这些音符。');
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
    addNote(partId, input) {
      return this.addNotes(partId, [input])[0]!;
    },
    addNotes(partId, inputs) {
      if (!Array.isArray(inputs)) throw new Error('音符列表无效。');
      const notes = inputs.map(input => {
        fields(object(input, '音符'), ['startBeat', 'durationBeats', 'durationSeconds', 'frequencyHz', 'velocity', 'level', 'pan'], '音符');
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
          fields(object(update.changes, '音符修改'), ['startBeat', 'durationBeats', 'durationSeconds', 'frequencyHz', 'velocity', 'level', 'pan'], '音符修改');
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
      fields(object(changes, '音符修改'), ['startBeat', 'durationBeats', 'durationSeconds', 'frequencyHz', 'velocity', 'level', 'pan'], '音符修改');
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
      const first = Math.ceil(69 + 12 * Math.log2(20 / 440));
      const last = Math.floor(69 + 12 * Math.log2(5000 / 440));
      return Array.from({ length: last - first + 1 }, (_, index) => {
        const midi = first + index; const semitone = midi % 12;
        return { label: `${labels[semitone]}${Math.floor(midi / 12) - 1}`,
          frequencyHz: 440 * 2 ** ((midi - 69) / 12), accidental: [1, 3, 6, 8, 10].includes(semitone) };
      });
    },
    async preparePreview() {
      const before = current();
      await Promise.all(audibleReferences(before.body).map(id => playback.prepareForSaved(id)));
      if (!same(current().draft, before.draft)) throw new Error('准备期间乐句发生变化，请重新试听。');
    },
    async previewNotePlan(partId, input) {
      const before = current(); const target = part(before.body, partId);
      if (target.unassigned) throw new Error('这个音色尚未定义，请先从音色库中选择音色。');
      const note = { frequencyHz: number(input.frequencyHz, '音高', 20, 5000),
        holdSeconds: number(input.holdSeconds, '试音长度', 0.0001, 120), velocity: number(input.velocity, '音符力度', 0, 1) };
      await playback.prepareForSaved(target.timbreId);
      const after = current(); const selected = after.body.parts.find(item => item.id === partId);
      if (after.draft.id !== before.draft.id || selected?.timbreId !== target.timbreId || selected.unassigned) throw new Error('试音期间使用的声音发生变化，请重试。');
      const sound = playback.planForSaved(target.timbreId, note);
      return after.body.masterLevel === undefined ? sound : { ...sound, level: sound.level * after.body.masterLevel };
    },
    async previewTimbrePlan(timbreId, input) {
      const before = current();
      if (!availableSounds(before.draft).some(item => item.id === timbreId)) throw new Error('请选择当前歌曲音色库里的音色。');
      const note = { frequencyHz: number(input.frequencyHz, '音高', 20, 5000),
        holdSeconds: number(input.holdSeconds, '试音长度', 0.0001, 120), velocity: number(input.velocity, '音符力度', 0, 1) };
      await playback.prepareForSaved(timbreId);
      const after = current();
      if (after.draft.id !== before.draft.id || !availableSounds(after.draft).some(item => item.id === timbreId)) throw new Error('试音期间使用的音色库发生变化，请重试。');
      const sound = playback.planForSaved(timbreId, note);
      return after.body.masterLevel === undefined ? sound : { ...sound, level: sound.level * after.body.masterLevel };
    },
    previewPlan(bodyOverride, options = {}): SoundSequencePlan {
      const { draft, body } = current();
      if (bodyOverride === undefined) return compilePhrase(body, playback, body.tempoBpm, options.allowSilence);
      const temporary = readPhraseBody(bodyOverride);
      return compilePhrase(validate({ ...draft, body: temporary, dependencies: references(temporary) }), playback, temporary.tempoBpm, options.allowSilence);
    },
    save(mode, confirmation) {
      const { draft, body } = current();
      if (!body.parts.some(part => part.notes.length)) throw new Error('先添加几个音符，再保存这个乐句吧。');
      return library.saveDraft(draft.id, mode, confirmation);
    },
  };
}
