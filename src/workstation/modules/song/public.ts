import type { ContentRecord, Draft, MaterialLibrary } from '../../contracts/content.ts';
import type { PhrasePlaybackPort } from '../../contracts/phrase.ts';
import type { SongBody, SongClip, SongEditorPort, SongPlaybackPort, SongTempoMode, SongTrack } from '../../contracts/song.ts';
import type { SoundSequencePlan } from '../../contracts/sound.ts';
import type { PostProductionPort, PostProductionSettings } from '../../contracts/post-production.ts';
import type { ReferenceAdapter } from '../../contracts/references.ts';

export type { SongBody, SongClip, SongEditorPort, SongPlaybackPort, SongTempoMode, SongTrack, SongView } from '../../contracts/song.ts';

const KIND = 'rootsound.song';
const OWNER = 'song';
const MAX_TRACKS = 16;
const MAX_CLIPS = 512;
const MAX_LENGTH = 1024;
const MAX_EVENTS = 2048;
const MAX_SECONDS = 600;

function object(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`${label}不是有效对象。原内容已保留。`);
  return value as Record<string, unknown>;
}
function fields(value: Record<string, unknown>, allowed: readonly string[], label: string): void {
  if (Object.keys(value).some(key => !allowed.includes(key))) throw new Error(`${label}包含暂不支持的设置。原内容已保留。`);
}
function text(value: unknown, label: string): string {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${label}不能为空。`);
  return value;
}
function finite(value: unknown, label: string, min: number, max: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max) throw new Error(`${label}必须在 ${min} 至 ${max} 之间。`);
  return value;
}
function boolean(value: unknown, label: string): boolean {
  if (typeof value !== 'boolean') throw new Error(`${label}必须明确开启或关闭。`);
  return value;
}
function mode(value: unknown): SongTempoMode {
  if (value !== 'song' && value !== 'source') throw new Error('请明确选择乐句跟随歌曲速度，还是保留原速。');
  return value;
}
function same(a: unknown, b: unknown): boolean { return JSON.stringify(a) === JSON.stringify(b); }
function references(body: SongBody): string[] { return [...new Set(body.tracks.flatMap(track => track.clips.map(clip => clip.phraseId)))]; }
function readPostProduction(value: unknown): PostProductionSettings {
  const output = object(value, '后期设置'); fields(output, ['enabled', 'level', 'fadeInSeconds', 'fadeOutSeconds'], '后期设置');
  return { enabled: boolean(output.enabled, '后期处理'), level: finite(output.level, '总音量', 0, 1),
    fadeInSeconds: finite(output.fadeInSeconds, '淡入秒数', 0, 30), fadeOutSeconds: finite(output.fadeOutSeconds, '淡出秒数', 0, 30) };
}

/** Clip ids, not phrase identities, distinguish repeated uses on the timeline. */
export function createSongReferenceAdapter(): ReferenceAdapter {
  function validate(record: ContentRecord | Draft): SongBody {
    if (record.kind !== KIND || record.owner !== OWNER || record.schemaVersion !== 1) throw new Error('这份内容不是当前支持的歌曲。');
    const body = readSongBody(record.body); const actual = references(body);
    if (record.dependencies.length !== actual.length || actual.some(id => !record.dependencies.includes(id))) throw new Error('歌曲乐句引用与依赖记录不一致。');
    return body;
  }
  return { kind: KIND,
    slots(record) { return validate(record).tracks.flatMap(track => track.clips.map(clip => ({ id: clip.id, targetId: clip.phraseId,
      label: `${track.name} · 第 ${Number((clip.startBeat + 1).toFixed(4))} 拍` }))); },
    validateTarget(record, slotId, target) {
      if (!validate(record).tracks.some(track => track.clips.some(clip => clip.id === slotId)) || target.kind !== 'rootsound.phrase'
        || target.owner !== 'phrase' || target.schemaVersion !== 1) throw new Error('歌曲片段需要当前支持的乐句内容。');
    },
    replace(record, replacements) {
      const body = validate(record); const used = new Set<string>();
      for (const replacement of replacements) {
        const clip = body.tracks.flatMap(track => track.clips).find(item => item.id === replacement.slotId);
        if (!clip || used.has(clip.id) || typeof replacement.targetId !== 'string' || !replacement.targetId.trim()) throw new Error('要修改的歌曲片段位置已改变。');
        used.add(clip.id); clip.phraseId = replacement.targetId;
      }
      return { body, dependencies: references(body) };
    },
  };
}

/** Unknown formats are preserved rather than reinterpreted as this first timeline model. */
export function readSongBody(value: unknown): SongBody {
  const body = object(value, '歌曲');
  fields(body, ['model', 'version', 'timeUnit', 'tempoBpm', 'tempoMode', 'lengthBeats', 'tracks', 'postProduction'], '歌曲');
  if (body.model !== 'phrase-arrangement' || body.version !== 1 || body.timeUnit !== 'beat') throw new Error('暂不支持这份歌曲的格式或版本。原内容已保留。');
  const tempoBpm = finite(body.tempoBpm, '歌曲速度', 40, 240);
  const tempoMode = mode(body.tempoMode);
  const lengthBeats = finite(body.lengthBeats, '歌曲长度', 16, MAX_LENGTH);
  if (!Array.isArray(body.tracks) || body.tracks.length < 1 || body.tracks.length > MAX_TRACKS) throw new Error(`当前歌曲需要 1 至 ${MAX_TRACKS} 条声音轨道。`);
  const ids = new Set<string>();
  let count = 0;
  function unique(value: unknown): string {
    const id = text(value, '歌曲内容标识');
    if (ids.has(id)) throw new Error('歌曲中有重复的轨道或片段标识。原内容已保留。');
    ids.add(id); return id;
  }
  const tracks = body.tracks.map(raw => {
    const track = object(raw, '轨道'); fields(track, ['id', 'name', 'level', 'pan', 'muted', 'solo', 'clips'], '轨道');
    const id = unique(track.id);
    if (!Array.isArray(track.clips) || (count += track.clips.length) > MAX_CLIPS) throw new Error(`当前歌曲最多放置 ${MAX_CLIPS} 个乐句片段。`);
    const clips = track.clips.map(rawClip => {
      const clip = object(rawClip, '乐句片段'); fields(clip, ['id', 'phraseId', 'startBeat'], '乐句片段');
      return { id: unique(clip.id), phraseId: text(clip.phraseId, '引用乐句'), startBeat: finite(clip.startBeat, '片段开始位置', 0, MAX_LENGTH) };
    });
    return { id, name: text(track.name, '轨道名称'), level: finite(track.level, '轨道音量', 0, 1),
      pan: finite(track.pan, '左右位置', -1, 1), muted: boolean(track.muted, '静音'), solo: boolean(track.solo, '单独播放'), clips };
  });
  return { model: 'phrase-arrangement', version: 1, timeUnit: 'beat', tempoBpm, tempoMode, lengthBeats, tracks,
    ...(body.postProduction === undefined ? {} : { postProduction: readPostProduction(body.postProduction) }) };
}

type Snapshot = { name: string; dependencies: string[]; body: SongBody };
function snapshot(draft: Draft, body: SongBody): Snapshot { return { name: draft.name, dependencies: [...draft.dependencies], body }; }

function phraseLength(body: SongBody, phraseId: string, phrases: PhrasePlaybackPort): number {
  const source = phrases.readSaved(phraseId).body;
  return source.lengthBeats * (body.tempoMode === 'source' ? body.tempoBpm / source.tempoBpm : 1);
}
function extent(body: SongBody, phrases: PhrasePlaybackPort): number {
  const lengths = new Map<string, number>();
  return Math.max(body.lengthBeats, ...body.tracks.flatMap(track => track.clips.map(clip => {
    let length = lengths.get(clip.phraseId);
    if (length === undefined) { length = phraseLength(body, clip.phraseId, phrases); lengths.set(clip.phraseId, length); }
    return clip.startBeat + length;
  })));
}
function validateSong(record: Draft | ContentRecord, phrases: PhrasePlaybackPort): SongBody {
  if (record.kind !== KIND || record.schemaVersion !== 1 || record.owner !== OWNER) throw new Error('这份内容目前不能作为歌曲打开。原内容已保留。');
  const body = readSongBody(record.body); const actual = references(body);
  if (record.dependencies.length !== actual.length || actual.some(id => !record.dependencies.includes(id))) throw new Error('歌曲的乐句引用与依赖记录不一致。原内容已保留。');
  for (const id of actual) phrases.readSaved(id);
  return body;
}
function compileSong(body: SongBody, phrases: PhrasePlaybackPort, allowSilence = false, postProduction?: PostProductionPort): SoundSequencePlan {
  const secondsPerBeat = 60 / body.tempoBpm;
  const hasSolo = body.tracks.some(track => track.solo && !track.muted);
  const events: Array<SoundSequencePlan['events'][number]> = [];
  let durationSeconds = extent(body, phrases) * secondsPerBeat;
  for (const track of body.tracks) {
    if (track.muted || track.level === 0 || hasSolo && !track.solo) continue;
    for (const clip of track.clips) {
      const plan = phrases.planForSaved(clip.phraseId, body.tempoMode === 'song' ? body.tempoBpm : undefined);
      const offset = clip.startBeat * secondsPerBeat;
      durationSeconds = Math.max(durationSeconds, offset + plan.durationSeconds);
      for (const event of plan.events) events.push({ atSeconds: offset + event.atSeconds,
        sound: { ...event.sound, level: event.sound.level * track.level }, pan: track.pan });
      if (events.length > MAX_EVENTS) throw new Error(`这首歌曲超过当前 ${MAX_EVENTS} 个发声音符的试听范围，请缩短编排。`);
    }
  }
  if (!events.length && !allowSilence) throw new Error('先放入有音符的乐句，并开启至少一条轨道，再听整首歌吧。');
  if (durationSeconds > MAX_SECONDS) throw new Error('当前歌曲试听与导出支持最长 10 分钟，请缩短编排或提高速度。');
  events.sort((a, b) => a.atSeconds - b.atSeconds);
  const plan: SoundSequencePlan = { kind: 'sequence', version: 1, durationSeconds, events };
  if (!body.postProduction) return plan;
  if (!postProduction) throw new Error('这首歌曲需要连接后期处理模块，原稿已保留。');
  return postProduction.apply(plan, body.postProduction);
}
export function createSongPlayback(library: MaterialLibrary, phrases: PhrasePlaybackPort, postProduction?: PostProductionPort): SongPlaybackPort {
  function readSaved(id: string): { content: ContentRecord; body: SongBody } {
    const content = library.readContent(id); if (!content) throw new Error('找不到要使用的歌曲。');
    return { content, body: validateSong(content, phrases) };
  }
  return { listSaved: () => library.listContentInfo().filter(content => content.kind === KIND).map(content => library.readContent(content.id)!), readSaved,
    async prepareForSaved(id) {
      const before = readSaved(id); await Promise.all(references(before.body).map(phraseId => phrases.prepareForSaved(phraseId)));
      if (!same(readSaved(id).content, before.content)) throw new Error('准备期间歌曲发生变化，请重新试听。');
    },
    planForSaved(id) { return compileSong(readSaved(id).body, phrases, false, postProduction); } };
}

export function createSongEditor(library: MaterialLibrary, phrases: PhrasePlaybackPort, options: { defaultTempoMode: SongTempoMode; postProduction?: PostProductionPort }): SongEditorPort {
  const defaultTempoMode = mode(options.defaultTempoMode);
  const apiPostProduction = options.postProduction;
  let active = library.listDrafts().filter(draft => draft.kind === KIND).at(-1)?.id;
  const clipLength = (body: SongBody, id: string) => phraseLength(body, id, phrases);
  const songLength = (body: SongBody) => extent(body, phrases);
  const validate = (record: Draft | ContentRecord) => validateSong(record, phrases);
  function current(): { draft: Draft; body: SongBody } {
    const draft = active ? library.readDraft(active) : undefined;
    if (!draft) throw new Error('先新建一首歌曲，再把乐句放进来。');
    return { draft, body: validate(draft) };
  }
  function changed(draft: Draft): boolean {
    const source = draft.sourceId ? library.readContent(draft.sourceId) : undefined;
    return !source || source.name !== draft.name || !same(source.body, draft.body) || !same(source.dependencies, draft.dependencies);
  }
  function write(next: Snapshot): void {
    const { draft, body } = current(); const before = snapshot(draft, body);
    const candidate = { ...draft, ...next }; const after = snapshot(candidate, validate(candidate));
    // A referenced phrase may have grown after an explicit overwrite warning.
    // Keep the arrangement repairable; editing may retain or reduce that extent.
    if (songLength(after.body) > Math.max(MAX_LENGTH, songLength(before.body)) + 1e-8) throw new Error(`片段超出当前 ${MAX_LENGTH} 拍的编排范围，请向前移动或缩短编排。`);
    if (same(before, after)) return;
    library.updateDraft(draft.id, after, { remember: true, expected: draft });
  }
  function modify(change: (body: SongBody) => void): void {
    const { draft, body } = current(); change(body); write({ name: draft.name, dependencies: references(body), body });
  }
  function track(body: SongBody, id: string): SongTrack {
    const result = body.tracks.find(item => item.id === id); if (!result) throw new Error('找不到这条轨道。'); return result;
  }
  function clip(body: SongBody, trackId: string, clipId: string): SongClip {
    const result = track(body, trackId).clips.find(item => item.id === clipId); if (!result) throw new Error('找不到这个乐句片段。'); return result;
  }
  function travel(direction: 'undo' | 'redo'): void {
    const { draft } = current(); const history = library.readDraftHistory(draft.id);
    const from = direction === 'undo' ? history.past : history.future;
    const target = from.at(-1); if (!target) return;
    if (!target.transactionId) validate({ ...draft, ...target });
    library.travelDraft(draft.id, direction, draft);
  }
  const api: SongEditorPort = {
    read() {
      const preserved = active ? library.readDraft(active) : undefined; let state: ReturnType<typeof current> | undefined; let problem: string | undefined;
      if (active) try { state = current(); } catch (error) { problem = error instanceof Error ? error.message : String(error); }
      const history = state ? library.readDraftHistory(state.draft.id) : undefined;
      const clipLengths = state ? Object.fromEntries(references(state.body).map(id => [id, clipLength(state.body, id)])) : {};
      const lengthBeats = state ? Math.max(state.body.lengthBeats, ...state.body.tracks.flatMap(track => track.clips.map(clip => clip.startBeat + clipLengths[clip.phraseId]!))) : 16;
      return { draft: state?.draft ?? preserved, body: state?.body, problem, lengthBeats, clipLengths,
        savedSongs: library.listContentInfo().filter(content => content.kind === KIND).map(content => library.readContent(content.id)!),
        unfinishedDrafts: library.listDrafts().filter(draft => draft.kind === KIND && changed(draft)),
        availablePhrases: (() => {
          const available = preserved && library.listContentInfoForDraft ? new Set(library.listContentInfoForDraft(preserved.id).map(item => item.id)) : undefined;
          return phrases.listSaved().filter(item => !available || available.has(item.id));
        })(),
        changed: preserved ? changed(preserved) : false, canUndo: !!history?.past.length, canRedo: !!history?.future.length };
    },
    create() {
      const body: SongBody = { model: 'phrase-arrangement', version: 1, timeUnit: 'beat', tempoBpm: 120, tempoMode: defaultTempoMode,
        lengthBeats: 16, tracks: [{ id: crypto.randomUUID(), name: '旋律', level: 0.8, pan: 0, muted: false, solo: false, clips: [] }] };
      active = library.createDraft({ kind: KIND, schemaVersion: 1, owner: OWNER, name: '我的第一首歌', dependencies: [], body }).id;
    },
    createFromPhrase(phraseId, name) {
      const source = phrases.readSaved(phraseId);
      const body: SongBody = { model: 'phrase-arrangement', version: 1, timeUnit: 'beat', tempoBpm: source.body.tempoBpm,
        tempoMode: defaultTempoMode, lengthBeats: Math.max(16, source.body.lengthBeats),
        tracks: [{ id: crypto.randomUUID(), name: '旋律', level: 0.8, pan: 0, muted: false, solo: false,
          clips: [{ id: crypto.randomUUID(), phraseId, startBeat: 0 }] }] };
      const input = { kind: KIND, schemaVersion: 1, owner: OWNER, name: text((name ?? source.content.name).trim(), '歌曲名称'), dependencies: [phraseId], body };
      validate({ ...input, id: 'new-song' });
      active = library.createDraft(input).id;
    },
    open(contentId) {
      const content = library.readContent(contentId); if (!content) throw new Error('找不到要打开的歌曲。'); validate(content);
      const existing = library.listDrafts().find(draft => draft.sourceId === contentId); if (existing) validate(existing);
      active = (existing ?? library.createDraft({ sourceId: contentId })).id;
    },
    openDraft(draftId) { const draft = library.readDraft(draftId); if (!draft) throw new Error('找不到这份歌曲编辑稿。'); validate(draft); active = draft.id; },
    rename(name) { const { draft, body } = current(); write({ name: text(name.trim(), '歌曲名称'), dependencies: draft.dependencies, body }); },
    setTempo(tempoBpm) { modify(body => { body.tempoBpm = tempoBpm; }); },
    setTempoMode(tempoMode) { modify(body => { body.tempoMode = mode(tempoMode); }); },
    setPostProduction(settings) {
      if (!apiPostProduction) throw new Error('后期处理模块尚未连接。');
      const next = readPostProduction(settings); modify(body => { body.postProduction = next; });
    },
    setLength(lengthBeats) {
      finite(lengthBeats, '歌曲长度', 16, MAX_LENGTH);
      modify(body => { if (body.tracks.some(item => item.clips.some(clip => clip.startBeat + clipLength(body, clip.phraseId) > lengthBeats + 1e-8))) throw new Error('乐句仍在这个位置之后，请先移动或移除这些片段。'); body.lengthBeats = lengthBeats; });
    },
    addTrack(name) {
      const id = crypto.randomUUID(); modify(body => { body.tracks.push({ id, name: text(name ?? `声音 ${body.tracks.length + 1}`, '轨道名称'), level: 0.8, pan: 0, muted: false, solo: false, clips: [] }); }); return id;
    },
    updateTrack(trackId, changes) { fields(object(changes, '轨道修改'), ['name', 'level', 'pan', 'muted', 'solo'], '轨道修改'); modify(body => { Object.assign(track(body, trackId), changes); }); },
    removeTrack(trackId) { modify(body => { track(body, trackId); if (body.tracks.length === 1) throw new Error('至少保留一条轨道。'); body.tracks = body.tracks.filter(item => item.id !== trackId); }); },
    addClip(trackId, phraseId, startBeat) {
      return api.addClips([{ trackId, phraseId, startBeat }])[0]!;
    },
    addClips(inputs) {
      if (!inputs.length) return [];
      const ids: string[] = [];
      modify(body => { for (const input of inputs) {
        fields(object(input, '添加片段'), ['trackId', 'phraseId', 'startBeat'], '添加片段');
        phrases.readSaved(input.phraseId); const id = crypto.randomUUID(); ids.push(id);
        track(body, input.trackId).clips.push({ id, phraseId: input.phraseId, startBeat: input.startBeat });
      } }); return ids;
    },
    moveClip(trackId, clipId, targetTrackId, startBeat) {
      api.moveClips([{ trackId, clipId, targetTrackId, startBeat }]);
    },
    moveClips(updates) {
      if (!updates.length) return;
      modify(body => {
        const seen = new Set<string>();
        const moves = updates.map(update => {
          fields(object(update, '移动片段'), ['trackId', 'clipId', 'targetTrackId', 'startBeat'], '移动片段');
          if (seen.has(update.clipId)) throw new Error('同一片段不能重复移动。'); seen.add(update.clipId);
          const original = clip(body, update.trackId, update.clipId); track(body, update.targetTrackId);
          return { ...update, original: { ...original, startBeat: update.startBeat } };
        });
        for (const move of moves) track(body, move.trackId).clips = track(body, move.trackId).clips.filter(item => item.id !== move.clipId);
        for (const move of moves) track(body, move.targetTrackId).clips.push(move.original);
      });
    },
    copyClip(trackId, clipId, targetTrackId, startBeat) {
      const id = crypto.randomUUID(); modify(body => { const original = clip(body, trackId, clipId); track(body, targetTrackId ?? trackId).clips.push({ ...original, id, startBeat: startBeat ?? original.startBeat + clipLength(body, original.phraseId) }); }); return id;
    },
    repeatClip(trackId, clipId, additionalCount) {
      if (!Number.isInteger(additionalCount) || additionalCount < 1 || additionalCount > MAX_CLIPS) throw new Error('重复次数需要是 1 至 512 之间的整数。');
      const ids: string[] = [];
      modify(body => { const original = clip(body, trackId, clipId); const length = clipLength(body, original.phraseId);
        for (let index = 1; index <= additionalCount; index++) { const id = crypto.randomUUID(); ids.push(id); track(body, trackId).clips.push({ ...original, id, startBeat: original.startBeat + length * index }); } });
      return ids;
    },
    removeClip(trackId, clipId) { api.removeClips([{ trackId, clipId }]); },
    removeClips(clips) {
      if (!clips.length) return;
      modify(body => { const seen = new Set<string>(); for (const ref of clips) { if (seen.has(ref.clipId)) throw new Error('同一片段不能重复移除。'); seen.add(ref.clipId); clip(body, ref.trackId, ref.clipId); }
        for (const ref of clips) track(body, ref.trackId).clips = track(body, ref.trackId).clips.filter(item => item.id !== ref.clipId); });
    },
    clipLengthBeats(phraseId) { return clipLength(current().body, phraseId); },
    undo() { travel('undo'); }, redo() { travel('redo'); },
    async preparePreview() {
      const before = current(); await Promise.all(references(before.body).map(id => phrases.prepareForSaved(id)));
      if (!same(current().draft, before.draft)) throw new Error('准备期间歌曲发生变化，请重新试听。');
    },
    previewPlan(bodyOverride, options = {}) {
      const { draft, body } = current();
      if (bodyOverride === undefined) return compileSong(body, phrases, options.allowSilence, apiPostProduction);
      const temporary = readSongBody(bodyOverride);
      return compileSong(validate({ ...draft, body: temporary, dependencies: references(temporary) }), phrases, options.allowSilence, apiPostProduction);
    },
    save(saveMode, confirmation) { const { draft, body } = current(); if (!body.tracks.some(track => track.clips.length)) throw new Error('先放入一段乐句，再保存歌曲吧。'); return library.saveDraft(draft.id, saveMode, confirmation); },
  };
  return api;
}
