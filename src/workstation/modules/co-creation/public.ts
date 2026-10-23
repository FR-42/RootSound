import type { ContentRecord, Draft, MaterialLibrary } from '../../contracts/content.ts';
import type { CoCreationBody, CoCreationDirection, CoCreationIdea, CoCreationPort, CoCreationView } from '../../contracts/co-creation.ts';
import type { ReferenceAdapter } from '../../contracts/references.ts';
import type { SampleAudioPort } from '../../contracts/sampling.ts';
import type { PhrasePlaybackPort } from '../../contracts/phrase.ts';
import { createMaterialLibrary } from '../materials/public.ts';
import { createTimbrePlayback, createTimbreReferenceAdapter } from '../timbre/public.ts';
import { createPhrasePlayback } from '../phrase/public.ts';
import { generateIdea } from './generate.ts';

export type { CoCreationBody, CoCreationDirection, CoCreationIdea, CoCreationPort, CoCreationView } from '../../contracts/co-creation.ts';

const KIND = 'rootsound.co-creation';
const OWNER = 'co-creation';
const IDEAS: CoCreationIdea[] = [
  { id: 'light', title: '轻快一点', description: '明亮的声音和轻盈的节奏，试试更有活力的方向。' },
  { id: 'calm', title: '温柔一点', description: '柔和的声音与安稳的陪伴，让旋律慢慢展开。' },
  { id: 'airy', title: '空灵一点', description: '清透的声音与舒展的余韵，留一点想象的空间。' },
];

function clone<T>(value: T): T { return JSON.parse(JSON.stringify(value)) as T; }
function fail(message: string): never { throw new Error(message); }
function validDirection(value: unknown): value is CoCreationDirection { return value === 'light' || value === 'calm' || value === 'airy'; }
function references(body: CoCreationBody): string[] { return [...new Set([body.sourcePhraseId, body.currentPhraseId].filter((id): id is string => id !== undefined))]; }

export function readCoCreationBody(value: unknown): CoCreationBody {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return fail('这份创作旅途不是可识别的记录，原内容已保留。');
  const body = value as Record<string, unknown>;
  if (Object.keys(body).some(key => !['model', 'version', 'sourcePhraseId', 'currentPhraseId', 'hasArrangement', 'round', 'lastDirection'].includes(key))
    || body.model !== 'guided-session' || body.version !== 1 || typeof body.hasArrangement !== 'boolean'
    || !Number.isSafeInteger(body.round) || Number(body.round) < 0
    || body.lastDirection !== undefined && !validDirection(body.lastDirection)) return fail('这份创作旅途包含暂不支持的设置，原内容已保留。');
  for (const key of ['sourcePhraseId', 'currentPhraseId']) {
    if (body[key] !== undefined && (typeof body[key] !== 'string' || !(body[key] as string).trim())) return fail('创作旅途引用的乐句标识无效。');
  }
  if ((body.hasArrangement || Number(body.round) > 0) && body.currentPhraseId === undefined) return fail('创作旅途缺少当前成果，原内容已保留。');
  return clone(body) as CoCreationBody;
}

/** The common reference manager can open and isolate the current phrase like any other occurrence. */
export function createCoCreationReferenceAdapter(): ReferenceAdapter {
  function validate(record: ContentRecord | Draft): CoCreationBody {
    if (record.kind !== KIND || record.owner !== OWNER || record.schemaVersion !== 1) return fail('这份内容不是当前支持的创作旅途。');
    const body = readCoCreationBody(record.body); const actual = references(body);
    if (record.dependencies.length !== actual.length || actual.some(id => !record.dependencies.includes(id))) return fail('创作旅途的乐句与引用记录不一致。');
    return body;
  }
  return { kind: KIND,
    slots(record) {
      const body = validate(record);
      return [
        ...(body.sourcePhraseId ? [{ id: 'source', targetId: body.sourcePhraseId, label: '起点旋律' }] : []),
        ...(body.currentPhraseId ? [{ id: 'current', targetId: body.currentPhraseId, label: '当前成果' }] : []),
      ];
    },
    validateTarget(record, slotId, target) {
      const body = validate(record);
      const exists = slotId === 'source' ? !!body.sourcePhraseId : slotId === 'current' && !!body.currentPhraseId;
      if (!exists || target.kind !== 'rootsound.phrase' || target.owner !== 'phrase' || target.schemaVersion !== 1) fail('创作旅途的位置需要当前支持的乐句。');
    },
    replace(record, replacements) {
      const body = validate(record); const seen = new Set<string>();
      for (const replacement of replacements) {
        if (seen.has(replacement.slotId) || typeof replacement.targetId !== 'string' || !replacement.targetId.trim()) fail('要修改的创作位置无效或重复。');
        seen.add(replacement.slotId);
        if (replacement.slotId === 'current' && body.currentPhraseId) body.currentPhraseId = replacement.targetId;
        else if (replacement.slotId === 'source' && body.sourcePhraseId) body.sourcePhraseId = replacement.targetId;
        else fail('要修改的创作位置已不存在。');
      }
      return { body, dependencies: references(body) };
    },
  };
}

/** Offline guidance coordinates music owners and common storage; sound compilation stays with its owner. */
export function createCoCreation(library: MaterialLibrary, sampleAudio?: SampleAudioPort): CoCreationPort {
  const playback = createPhrasePlayback(library, createTimbrePlayback(library, sampleAudio));
  const adapter = createCoCreationReferenceAdapter();
  const soundAdapter = createTimbreReferenceAdapter();
  let active = library.listDrafts().filter(draft => draft.kind === KIND).at(-1)?.id;
  type Generated = ReturnType<typeof generateIdea>;
  const cache = new Map<CoCreationDirection, { token: string; graph: Generated }>();
  const assetCache = new Map<string, ContentRecord>();
  const previewPlayers = new WeakMap<Generated, PhrasePlaybackPort>();

  function readMusic(phraseId: string) {
    const phrase = playback.readSaved(phraseId).content;
    const sounds = phrase.dependencies.map(id => {
      const sound = library.readContent(id) ?? fail('这段乐句引用的声音已不存在。');
      soundAdapter.slots(sound); return sound;
    });
    const assets = [...new Set(sounds.flatMap(sound => soundAdapter.slots(sound).map(slot => slot.targetId)))].map(id => {
      const header = library.readContentInfo(id) ?? fail('这份声音的原始采样已不存在。');
      const old = assetCache.get(id); if (old?.revision === header.revision) return old;
      const asset = library.readContent(id)!; assetCache.set(id, asset); return asset;
    });
    return { phrase, sounds, ...(assets.length ? { assets } : {}) };
  }

  function newSession(sourcePhraseId?: string): Draft {
    const source = sourcePhraseId !== undefined ? readMusic(sourcePhraseId).phrase : undefined;
    const body: CoCreationBody = { model: 'guided-session', version: 1, hasArrangement: false, round: 0,
      ...(source ? { sourcePhraseId: source.id, currentPhraseId: source.id } : {}) };
    return library.createDraft({ kind: KIND, schemaVersion: 1, owner: OWNER,
      name: source ? `从「${source.name}」出发` : '新的创作旅途', body, dependencies: references(body) });
  }
  if (!active) active = newSession().id;

  function current() {
    const draft = active ? library.readDraft(active) : undefined;
    if (!draft) return fail('这次创作旅途已不存在，请开始新的旅途。');
    adapter.slots(draft); const body = readCoCreationBody(draft.body);
    const sourceMusic = body.sourcePhraseId ? readMusic(body.sourcePhraseId) : undefined;
    const currentMusic = body.currentPhraseId ? readMusic(body.currentPhraseId) : undefined;
    const source = sourceMusic?.phrase; const phrase = currentMusic?.phrase;
    const seed = currentMusic ?? sourceMusic;
    const identity = (music: typeof seed) => music ? { phrase: music.phrase, sounds: music.sounds,
      assets: music.assets?.map(asset => ({ id: asset.id, revision: asset.revision })) } : undefined;
    const token = JSON.stringify({ draft, sourceMusic: identity(sourceMusic), seed: identity(seed) });
    return { draft, body, source, phrase, seed, token };
  }
  function candidate(id: CoCreationDirection, state: ReturnType<typeof current>): Generated {
    if (!validDirection(id)) return fail('请选择一个支持的创作方向。');
    const found = cache.get(id); if (found?.token === state.token) return found.graph;
    const graph = generateIdea({ ...(state.seed ? { seed: state.seed } : {}), direction: id, hasArrangement: state.body.hasArrangement, round: state.body.round });
    cache.set(id, { token: state.token, graph }); return graph;
  }
  function graphPlayback(graph: Generated) {
    const existing = previewPlayers.get(graph); if (existing) return existing;
    const memory = createMaterialLibrary({ read: () => JSON.stringify({ format: 'RootSoundMaterialLibrary', version: 1,
      contents: [...(graph.assets ?? []), ...graph.sounds, graph.phrase], drafts: [] }), write() { fail('试听不能改动素材库。'); } });
    const player = createPhrasePlayback(memory, createTimbrePlayback(memory, sampleAudio)); previewPlayers.set(graph, player); return player;
  }
  function travel(direction: 'undo' | 'redo'): void {
    const state = current(); const history = library.readDraftHistory(state.draft.id);
    const target = (direction === 'undo' ? history.past : history.future).at(-1);
    if (!target) return;
    if (!target.transactionId) {
      const restored = { ...state.draft, ...target }; adapter.slots(restored);
      for (const id of restored.dependencies) playback.readSaved(id);
    }
    library.travelDraft(state.draft.id, direction, state.draft); cache.clear();
  }
  return {
    read(): CoCreationView {
      const draft = library.readDraft(active!) ?? fail('这次创作旅途已不存在，请重新打开。');
      const history = library.readDraftHistory(draft.id);
      const view: CoCreationView = { draft, availablePhrases: library.listContentInfo().filter(record => record.kind === 'rootsound.phrase').map(record => library.readContent(record.id)!),
        ideas: clone(IDEAS), token: JSON.stringify(draft), canUndo: !!history.past.length, canRedo: !!history.future.length };
      try {
        const state = current(); view.body = state.body; view.sourceName = state.source?.name;
        view.currentPhrase = state.phrase; view.token = state.token;
      } catch (error) { view.problem = error instanceof Error ? error.message : String(error); }
      return view;
    },
    start(sourcePhraseId) { const draft = newSession(sourcePhraseId); active = draft.id; cache.clear(); },
    openDraft(id) {
      const draft = library.readDraft(id);
      if (!draft || draft.kind !== KIND) fail('找不到这份创作旅途。');
      active = id; cache.clear();
    },
    async prepareIdea(id) {
      const state = current(); const graph = candidate(id, state); await graphPlayback(graph).prepareForSaved(graph.phrase.id);
      if (current().token !== state.token) fail('准备期间当前成果已改变，请重新试听。');
    },
    previewIdea(id) { const state = current(); const graph = candidate(id, state); return graphPlayback(graph).planForSaved(graph.phrase.id); },
    chooseIdea(id, expectedToken) {
      const expected = library.currentToken(); const state = current();
      if (expectedToken !== undefined && expectedToken !== state.token) fail('当前成果已改变，请重新试听后再选择；你的修改已保留。');
      const graph = candidate(id, state); graphPlayback(graph).readSaved(graph.phrase.id);
      if (state.body.round === Number.MAX_SAFE_INTEGER) fail('这次旅途的轮次已满，请开始新的旅途。');
      const body: CoCreationBody = { ...state.body, currentPhraseId: graph.phrase.id, hasArrangement: true, round: state.body.round + 1, lastDirection: id };
      const replacement: Draft = { ...state.draft, body, dependencies: references(body) };
      adapter.slots(replacement);
      const result = library.commitTransaction({ expectedToken: expected, label: `选择「${IDEAS.find(idea => idea.id === id)!.title}」`,
        anchorDraftId: state.draft.id, createContents: [...graph.sounds, graph.phrase], replaceDrafts: [{ expected: state.draft, replacement }] });
      if (result.status !== 'committed') fail(result.status === 'conflict' ? result.reason : result.message);
      cache.clear();
    },
    renameCurrent(name, expectedToken) {
      if (typeof name !== 'string' || !name.trim()) fail('请给当前结果起一个名称。');
      const value = name.trim(); if (value.length > 4096) fail('当前结果名称过长，请缩短一些。');
      const expected = library.currentToken(); const state = current();
      if (expectedToken !== undefined && expectedToken !== state.token) fail('当前成果已改变，请核对后重新修改名称；原内容已保留。');
      if (!state.phrase) fail('先选择一个喜欢的方向，再给当前结果改名。');
      if (value === state.phrase.name) return;
      // A title belongs to this occurrence too: preserve the source and every song or other journey.
      const phrase: ContentRecord = { ...state.phrase, id: crypto.randomUUID(), revision: 1, name: value };
      const body: CoCreationBody = { ...state.body, currentPhraseId: phrase.id };
      const replacement: Draft = { ...state.draft, name: value, body, dependencies: references(body) };
      adapter.slots(replacement); playback.readSaved(state.phrase.id);
      const result = library.commitTransaction({ expectedToken: expected, label: '修改当前结果名称',
        anchorDraftId: state.draft.id, exactNameIds: [phrase.id], createContents: [phrase], replaceDrafts: [{ expected: state.draft, replacement }] });
      if (result.status !== 'committed') fail(result.status === 'conflict' ? result.reason : result.message);
      cache.clear();
    },
    async prepareCurrent() {
      const state = current(); if (!state.phrase) fail('先选择一个喜欢的方向，再试听当前成果。');
      await playback.prepareForSaved(state.phrase.id);
      if (current().token !== state.token) fail('准备期间当前成果已改变，请重新试听。');
    },
    previewCurrent() { const state = current(); if (!state.phrase) fail('先选择一个喜欢的方向，再试听当前成果。'); return playback.planForSaved(state.phrase.id); },
    undo() { travel('undo'); }, redo() { travel('redo'); },
  };
}
