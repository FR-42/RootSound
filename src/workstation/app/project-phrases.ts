import type { ContentRecord, Draft, MaterialLibrary, SaveResult } from '../contracts/content.ts';
import type { SongClipRef } from '../contracts/song.ts';
import { createMaterialLibrary, createReferenceEditing, countUsagePositions } from '../modules/materials/public.ts';
import { createTimbreEditor, createTimbrePlayback, createTimbreReferenceAdapter } from '../modules/timbre/public.ts';
import { createPhraseEditor, createPhrasePlayback, createPhraseReferenceAdapter, readPhraseBody } from '../modules/phrase/public.ts';
import { createSongReferenceAdapter, readSongBody } from '../modules/song/public.ts';
import { createSampleReferenceAdapter } from '../modules/sampling/public.ts';

function currentSong(library: MaterialLibrary, draftId: string) {
  const draft = library.readDraft(draftId);
  if (!draft) throw new Error('先打开一首歌曲，再新建或保留乐句。');
  createSongReferenceAdapter().slots(draft);
  const view = library.currentProjectView?.(draftId);
  if (!view || view.project.id !== draft.id) throw new Error('找不到当前歌曲的素材列表，请重新打开项目。');
  return { draft, view, scope: library.projectScopeOf?.({ type: 'draft', id: draftId }) ?? draftId };
}
function requireSaved(result: SaveResult): { content: ContentRecord; draft: Extract<SaveResult, { status: 'saved' }>['draft'] } {
  if (result.status === 'saved') return result;
  throw new Error(result.status === 'storage-error' ? result.message
    : result.status === 'conflict' ? result.reason : '未能准备新乐句，原工程已保留。');
}
function committed(result: ReturnType<MaterialLibrary['commitTransaction']>): void {
  if (result.status === 'committed') return;
  throw new Error(result.status === 'storage-error' ? result.message : result.reason);
}
const nameKey = (name: string): string => name.trim().normalize('NFC').toLocaleLowerCase('en-US');

function projectNames(library: MaterialLibrary, scope: string): Map<string, Set<string>> {
  const names = new Map<string, Set<string>>();
  for (const item of [...library.listContentInfo(), ...library.listDrafts()]) {
    const type = 'revision' in item ? 'content' : 'draft';
    if (library.projectScopeOf?.({ type, id: item.id }) !== scope) continue;
    const taken = names.get(item.kind) ?? new Set<string>(); taken.add(nameKey(item.name)); names.set(item.kind, taken);
  }
  return names;
}
function reserveName(names: Map<string, Set<string>>, kind: string, proposed: string): string {
  const taken = names.get(kind) ?? new Set<string>(); let name = proposed; let suffix = 2;
  while (taken.has(nameKey(name))) name = `${proposed} ${suffix++}`;
  taken.add(nameKey(name)); names.set(kind, taken); return name;
}
/** Public sound graphs are copied; a new phrase never takes ownership of a shared starter's voice. */
function privateSoundGraph(library: MaterialLibrary, scope: string, names: Map<string, Set<string>>) {
  const owners = new Map([createTimbreReferenceAdapter(), createSampleReferenceAdapter()].map(adapter => [adapter.kind, adapter]));
  const copied = new Map<string, ContentRecord>(); const visiting = new Set<string>(); const created: ContentRecord[] = [];
  function adopt(id: string): ContentRecord {
    const record = library.readContent(id); if (!record) throw new Error('乐句所需的音色或采样不存在。');
    const owner = library.projectScopeOf?.({ type: 'content', id });
    if (owner && owner !== scope) throw new Error('不能使用另一首歌曲的音色或采样。');
    if (owner === scope) return record;
    const previous = copied.get(id); if (previous) return previous;
    if (visiting.has(id)) throw new Error('音色素材存在循环引用。');
    visiting.add(id); const adapter = owners.get(record.kind);
    if (!adapter) throw new Error('暂不支持这份音色依赖的素材类型。');
    const changes = adapter.replace(record, adapter.slots(record).map(slot => ({ slotId: slot.id, targetId: adopt(slot.targetId).id })));
    const local = { ...structuredClone(record), ...changes, id: crypto.randomUUID(), revision: 1,
      name: reserveName(names, record.kind, record.name) };
    visiting.delete(id); copied.set(id, local); created.push(local); return local;
  }
  return { adopt, created };
}

/** A reusable empty phrase and its own voice enter the project in one durable write. */
export function createProjectPhrase(library: MaterialLibrary, songDraftId: string, timbreId?: string): { id: string; draftId: string } {
  const expectedToken = library.currentToken();
  const { draft: song, view, scope } = currentSong(library, songDraftId);
  const local = [...library.listContentInfo().filter(item => library.projectScopeOf?.({ type: 'content', id: item.id }) === scope),
    ...library.listDrafts().filter(item => library.projectScopeOf?.({ type: 'draft', id: item.id }) === scope),
    ...view.contents, ...view.drafts];
  const phraseNames = new Set(local.filter(item => item.kind === 'rootsound.phrase').map(item => nameKey(item.name)));
  const voiceNames = new Set(local.filter(item => item.kind === 'rootsound.timbre').map(item => nameKey(item.name)));
  let number = 1;
  while (phraseNames.has(nameKey(`乐句 ${number}`)) || voiceNames.has(nameKey(`乐句 ${number} 音色`))) number++;
  const name = `乐句 ${number}`;
  const staging = createMaterialLibrary();
  let voice: ContentRecord; let created: ContentRecord[];
  if (timbreId !== undefined) {
    createTimbrePlayback(library).readSaved(timbreId);
    const graph = privateSoundGraph(library, scope, projectNames(library, scope)); voice = graph.adopt(timbreId); created = graph.created;
    const staged = new Map(created.map(record => [record.id, record]));
    const included = new Set<string>();
    function include(record: ContentRecord): void {
      if (included.has(record.id)) return; included.add(record.id);
      staged.set(record.id, record);
      for (const id of record.dependencies) { const child = staged.get(id) ?? library.readContent(id); if (!child) throw new Error('音色缺少采样。'); include(child); }
    }
    include(voice);
    committed(staging.commitTransaction({ expectedToken: staging.currentToken(), label: '准备选定音色', createContents: [...staged.values()] }));
  } else {
    const voiceEditor = createTimbreEditor(staging); voiceEditor.rename(`${name} 音色`);
    voice = requireSaved(voiceEditor.save('new')).content; created = [voice];
  }
  const phrases = createPhrasePlayback(staging, createTimbrePlayback(staging));
  const phraseEditor = createPhraseEditor(staging, createTimbrePlayback(staging));
  phraseEditor.create(voice.id); phraseEditor.rename(name);
  phraseEditor.setLength(16);
  // Empty phrases are valid reusable entities; the old editor's explicit-save guard stays intact.
  const phrase = requireSaved(staging.saveDraft(phraseEditor.read().draft!.id, 'new'));
  phrases.readSaved(phrase.content.id);
  committed(library.commitTransaction({ expectedToken, label: `新建${name}`,
    createContents: [...created, phrase.content], createDrafts: [phrase.draft],
    exactNameIds: [...created.map(record => record.id), phrase.content.id, phrase.draft.id],
    projectMembers: [{ rootId: song.id, contentIds: [...new Set([...view.memberIds, phrase.content.id])] }],
  }));
  return { id: phrase.content.id, draftId: phrase.draft.id };
}

/** Save-as copies this edit, retaining its musical data and sharing this song's sound identities. */
export function copyProjectPhrase(library: MaterialLibrary, songDraftId: string, phraseDraftId: string): { id: string; draftId: string } {
  const expectedToken = library.currentToken();
  const { draft: song, view, scope } = currentSong(library, songDraftId);
  const source = library.readDraft(phraseDraftId);
  if (!source) throw new Error('先打开要另存的乐句。');
  const adapter = createPhraseReferenceAdapter(); adapter.slots(source);
  const owner = library.projectScopeOf?.({ type: 'draft', id: source.id });
  if (owner && owner !== scope) throw new Error('不能另存另一首歌曲的乐句。');
  const references = createReferenceEditing(library, [createTimbreReferenceAdapter(), adapter,
    createSongReferenceAdapter(), createSampleReferenceAdapter()]);
  if (references.sessions().some(session => session.context?.root.type === 'draft' && session.context.root.id === source.id)) {
    throw new Error('先完成或取消正在调整的音色，再另存乐句。');
  }
  const names = projectNames(library, scope);
  let number = 1;
  while (names.get('rootsound.phrase')?.has(nameKey(`乐句 ${number}`))
    || names.get('rootsound.timbre')?.has(nameKey(`乐句 ${number} 音色`))) number++;
  const name = `乐句 ${number}`;
  const graph = privateSoundGraph(library, scope, names);
  const fields = adapter.replace(source, adapter.slots(source).map(slot => ({ slotId: slot.id, targetId: graph.adopt(slot.targetId).id })));
  const record: ContentRecord = { id: crypto.randomUUID(), kind: source.kind, owner: source.owner,
    schemaVersion: source.schemaVersion, revision: 1, name,
    dependencies: fields.dependencies ?? source.dependencies, body: fields.body ?? source.body };
  adapter.slots(record);
  const draft: Draft = { id: crypto.randomUUID(), sourceId: record.id, baseRevision: record.revision,
    kind: record.kind, owner: record.owner, schemaVersion: record.schemaVersion, name,
    dependencies: [...record.dependencies], body: structuredClone(record.body) };
  committed(library.commitTransaction({ expectedToken, label: `另存${name}`,
    createContents: [...graph.created, record], createDrafts: [draft],
    exactNameIds: [...graph.created.map(item => item.id), record.id, draft.id],
    projectMembers: [{ rootId: song.id, contentIds: [...new Set([...view.memberIds, record.id])] }],
  }));
  return { id: record.id, draftId: draft.id };
}

/** Retaining an instance's source keeps it on the shelf after that instance is erased. */
export function retainProjectPhrases(library: MaterialLibrary, songDraftId: string, ids: string[]): void {
  const expectedToken = library.currentToken();
  const { draft: song, view, scope } = currentSong(library, songDraftId);
  if (!Array.isArray(ids) || ids.some(id => typeof id !== 'string' || !id)) throw new Error('要保留的乐句标识无效。');
  const accessible = new Set((library.listContentInfoForDraft?.(songDraftId) ?? view.contents).map(item => item.id));
  const phrases = createPhrasePlayback(library, createTimbrePlayback(library));
  const unique = [...new Set(ids)];
  for (const id of unique) {
    if (!accessible.has(id)) throw new Error('这份乐句不属于当前歌曲可使用的素材。');
    phrases.readSaved(id);
  }
  const members = [...new Set([...view.memberIds, ...unique])];
  if (members.length === view.memberIds.length) return;
  const names = projectNames(library, scope); const graph = privateSoundGraph(library, scope, names);
  const replacements: Array<{ expected: ContentRecord; replacement: ContentRecord }> = [];
  const drafts: Array<{ expected: Draft; replacement: Draft }> = [];
  for (const id of unique) {
    if (library.projectScopeOf?.({ type: 'content', id }) === scope) continue;
    const source = library.readContent(id)!;
    const working = library.listDrafts().filter(draft => draft.sourceId === id);
    if (working.some(draft => draft.editingContext || draft.name !== source.name || !same(draft.body, source.body) || !same(draft.dependencies, source.dependencies))) {
      throw new Error('先完成或取消正在编辑的乐句，再加入乐句库。');
    }
    const adapter = createPhraseReferenceAdapter();
    const replacement = { ...source, ...adapter.replace(source, adapter.slots(source).map(slot => ({ slotId: slot.id, targetId: graph.adopt(slot.targetId).id }))),
      name: reserveName(names, source.kind, source.name), revision: source.revision + 1 };
    if (same({ ...replacement, revision: source.revision }, source)) continue;
    replacements.push({ expected: source, replacement });
    for (const draft of working) drafts.push({ expected: draft, replacement: { ...draft, name: replacement.name,
      body: structuredClone(replacement.body), dependencies: [...replacement.dependencies], baseRevision: replacement.revision } });
  }
  committed(library.commitTransaction({ expectedToken, label: '在本曲乐句库保留乐句',
    ...(graph.created.length ? { createContents: graph.created } : {}),
    ...(replacements.length ? { replaceContents: replacements, replaceDrafts: drafts,
      exactNameIds: [...graph.created.map(record => record.id), ...replacements.map(item => item.replacement.id), ...drafts.map(item => item.replacement.id)] } : {}),
    projectMembers: [{ rootId: song.id, contentIds: members }],
  }));
}

export type ProjectPhraseInfo = { id: string; name: string; tempoBpm: number; durationSeconds: number };

/** Current reusable identities only; neither global starters nor undo custody are library tiles. */
export function readProjectPhrases(library: MaterialLibrary, songDraftId: string): ProjectPhraseInfo[] {
  const { view, scope } = currentSong(library, songDraftId);
  const ids = new Set([...view.contents.filter(item => item.kind === 'rootsound.phrase').map(item => item.id),
    ...view.drafts.filter(item => item.kind === 'rootsound.phrase').flatMap(item => item.sourceId ? [item.sourceId] : [])]);
  return [...ids].filter(id => library.projectScopeOf?.({ type: 'content', id }) === scope).map(id => {
    const info = readProjectPhraseInfo(library, songDraftId, id);
    const working = view.drafts.find(item => item.kind === 'rootsound.phrase' && item.sourceId === id);
    return working ? { ...info, name: working.name } : info;
  }).sort((first, second) => first.name.localeCompare(second.name, 'zh-CN') || first.id.localeCompare(second.id));
}

/** Read the saved source actually used by the playlist, without creating an editor. */
export function readProjectPhraseInfo(library: MaterialLibrary, songDraftId: string, phraseId: string): ProjectPhraseInfo {
  const { view, scope } = currentSong(library, songDraftId);
  const eligible = library.listContentInfoForDraft?.(songDraftId) ?? view.contents;
  const owner = library.projectScopeOf?.({ type: 'content', id: phraseId });
  if (!eligible.some(item => item.id === phraseId) || owner && owner !== scope) throw new Error('这份乐句不属于当前歌曲。');
  const phrase = library.readContent(phraseId);
  if (!phrase || phrase.kind !== 'rootsound.phrase' || phrase.owner !== 'phrase' || phrase.schemaVersion !== 1) throw new Error('找不到当前支持的乐句。');
  createPhraseReferenceAdapter().slots(phrase);
  const body = readPhraseBody(phrase.body);
  return { id: phrase.id, name: phrase.name, tempoBpm: body.tempoBpm, durationSeconds: body.lengthBeats * 60 / body.tempoBpm };
}

const same = (first: unknown, second: unknown): boolean => JSON.stringify(first) === JSON.stringify(second);

/** The confirmed library action removes the entity, its uses and recovery custody in one write. */
export function deleteProjectPhrase(library: MaterialLibrary, songDraftId: string, phraseId: string): void {
  const expectedToken = library.currentToken();
  const { scope } = currentSong(library, songDraftId);
  if (!readProjectPhrases(library, songDraftId).some(item => item.id === phraseId)
    || library.projectScopeOf?.({ type: 'content', id: phraseId }) !== scope) throw new Error('这份乐句不属于当前歌曲的乐句库。');
  const source = library.readContent(phraseId)!;
  const contents = library.listContent(); const drafts = library.listDrafts();
  const object = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value);
  const deletionIds = new Set([phraseId]);
  const deletedDrafts = new Set(drafts.filter(draft => draft.sourceId === phraseId).map(draft => draft.id));
  // Child tone edits are temporary work of this phrase; their saved tones are independent entities.
  let changed = true;
  while (changed) {
    changed = false;
    for (const draft of drafts) {
      if (deletedDrafts.has(draft.id)) continue;
      const meta = draft.editingContext;
      if (!object(meta) || meta.format !== 'RootSoundReferenceEdit') continue;
      const context = object(meta.context) ? meta.context : undefined;
      const root = object(context?.root) ? context.root : undefined;
      const ownsPhrase = object(meta.target) && meta.target.id === phraseId
        || Array.isArray(meta.route) && meta.route.some(item => object(item) && item.id === phraseId)
        || root?.type === 'draft' && typeof root.id === 'string' && deletedDrafts.has(root.id);
      if (ownsPhrase) { deletedDrafts.add(draft.id); changed = true; }
    }
  }
  for (const id of deletedDrafts) deletionIds.add(id);
  function mentions(value: unknown): boolean {
    if (typeof value === 'string') return deletionIds.has(value);
    if (!value || typeof value !== 'object') return false;
    return (Array.isArray(value) ? value : Object.values(value)).some(mentions);
  }
  function withoutPhrase(record: ContentRecord | Draft) {
    const body = readSongBody(record.body);
    createSongReferenceAdapter().slots(record);
    body.tracks = body.tracks.map(track => ({ ...track, clips: track.clips.filter(clip => clip.phraseId !== phraseId) }));
    if (body.hiddenPhraseIds) {
      body.hiddenPhraseIds = body.hiddenPhraseIds.filter(id => id !== phraseId);
      if (!body.hiddenPhraseIds.length) delete body.hiddenPhraseIds;
    }
    if (body.phraseShelfOrder) {
      body.phraseShelfOrder = body.phraseShelfOrder.filter(id => id !== phraseId);
      if (!body.phraseShelfOrder.length) delete body.phraseShelfOrder;
    }
    return { body, dependencies: [...new Set(body.tracks.flatMap(track => track.clips.map(clip => clip.phraseId)))] };
  }
  const savedChanges = new Map<string, ContentRecord>();
  const contentUpdates: Array<{ expected: ContentRecord; replacement: ContentRecord }> = [];
  for (const record of contents) {
    if (record.id === phraseId) continue;
    const songBody = record.kind === 'rootsound.song' ? readSongBody(record.body) : undefined;
    const contains = record.dependencies.includes(phraseId)
      || songBody?.hiddenPhraseIds?.includes(phraseId) || songBody?.phraseShelfOrder?.includes(phraseId);
    if (!contains) continue;
    if (record.kind !== 'rootsound.song' || library.projectScopeOf?.({ type: 'content', id: record.id }) !== scope)
      throw new Error('另一个作品仍在使用这份乐句，请先处理对应使用位置。');
    const replacement = { ...record, ...withoutPhrase(record), revision: record.revision + 1 };
    savedChanges.set(record.id, replacement); contentUpdates.push({ expected: record, replacement });
  }
  // Other open phrase edits may contain a snapshot of the whole song. Repair only
  // its deleted placements so those unrelated edits can still be finished safely.
  function repairContext(value: unknown): unknown {
    if (Array.isArray(value)) return value.map(repairContext);
    if (!object(value)) return value;
    if (value.kind === 'rootsound.song' && typeof value.id === 'string' && value.body) {
      const record = value as unknown as ContentRecord | Draft;
      const clean = { ...record, ...withoutPhrase(record) };
      if ('revision' in record && savedChanges.has(record.id) && record.revision === savedChanges.get(record.id)!.revision - 1)
        return { ...clean, revision: record.revision + 1 };
      return clean;
    }
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, repairContext(item)]));
  }
  const draftUpdates: Array<{ expected: Draft; replacement: Draft }> = [];
  for (const draft of drafts) {
    if (deletedDrafts.has(draft.id)) continue;
    let replacement = structuredClone(draft);
    const songBody = draft.kind === 'rootsound.song' ? readSongBody(draft.body) : undefined;
    if (draft.dependencies.includes(phraseId)
      || songBody?.hiddenPhraseIds?.includes(phraseId) || songBody?.phraseShelfOrder?.includes(phraseId)) {
      if (draft.kind !== 'rootsound.song' || library.projectScopeOf?.({ type: 'draft', id: draft.id }) !== scope)
        throw new Error('另一份编辑稿仍在使用这份乐句，请先处理对应使用位置。');
      replacement = { ...replacement, ...withoutPhrase(draft) };
    }
    const sourceChange = draft.sourceId ? savedChanges.get(draft.sourceId) : undefined;
    if (sourceChange && draft.baseRevision === sourceChange.revision - 1) replacement.baseRevision = sourceChange.revision;
    if (draft.editingContext && mentions(draft.editingContext)) {
      if (library.projectScopeOf?.({ type: 'draft', id: draft.id }) !== scope) throw new Error('其他歌曲的编辑仍在使用这份乐句，当前未删除。');
      replacement.editingContext = repairContext(draft.editingContext) as Draft['editingContext'];
      if (mentions(replacement.editingContext)) throw new Error('还有未完成的联合编辑使用这份乐句，请先完成或取消后再删除。');
    }
    if (!same(draft, replacement)) draftUpdates.push({ expected: draft, replacement });
  }
  committed(library.commitTransaction({ expectedToken, label: '永久删除本曲乐句', permanentDelete: true,
    deleteContents: [source], deleteDrafts: drafts.filter(draft => deletedDrafts.has(draft.id)),
    replaceContents: contentUpdates, replaceDrafts: draftUpdates,
  }));
}

/** Rename one occurrence safely, or explicitly rename this shared source from the shelf. */
export function renameProjectPhrase(library: MaterialLibrary, songDraftId: string, phraseId: string, input: string, ref?: SongClipRef): { id: string } {
  const expectedToken = library.currentToken();
  const { draft: song, view, scope } = currentSong(library, songDraftId);
  readProjectPhraseInfo(library, songDraftId, phraseId);
  const source = library.readContent(phraseId)!;
  const name = input.trim();
  if (!name) throw new Error('乐句名称不能为空。');
  if ([...name].length > 80) throw new Error('乐句名称请控制在 80 个字以内。');
  const body = readSongBody(song.body);
  const clip = ref ? body.tracks.find(track => track.id === ref.trackId)?.clips.find(item => item.id === ref.clipId) : undefined;
  if (ref && (!clip || clip.phraseId !== phraseId)) throw new Error('这个乐句使用位置已改变，请重新选择。');
  if (name === source.name) return { id: source.id };
  const working = library.listDrafts().filter(draft => draft.sourceId === source.id);
  if (working.some(draft => draft.editingContext || draft.name !== source.name || !same(draft.body, source.body) || !same(draft.dependencies, source.dependencies))) {
    throw new Error('先完成或取消正在编辑的乐句，再改名。');
  }
  const adapters = [createSongReferenceAdapter(), createPhraseReferenceAdapter(), createTimbreReferenceAdapter()];
  const usage = countUsagePositions(library.listContent(), library.listDrafts(), adapters).get(source.id) ?? 0;
  const privateSource = library.projectScopeOf?.({ type: 'content', id: source.id }) === scope;
  const fork = !privateSource || !!ref && usage > 1;
  let replacement: ContentRecord = { ...structuredClone(source), id: fork ? crypto.randomUUID() : source.id,
    revision: fork ? 1 : source.revision + 1, name };
  const created: ContentRecord[] = [];
  if (!privateSource) {
    // Public starts retain their own dependency graph. Adopting one must copy
    // that graph instead of assigning its shared voices to this song's scope.
    const owners = new Map([...adapters, createSampleReferenceAdapter()].map(adapter => [adapter.kind, adapter]));
    const names = new Map<string, Set<string>>();
    for (const record of [...library.listContentInfo(), ...library.listDrafts()]) {
      const type = 'revision' in record ? 'content' : 'draft';
      if (library.projectScopeOf?.({ type, id: record.id }) !== scope) continue;
      const taken = names.get(record.kind) ?? new Set<string>(); taken.add(nameKey(record.name)); names.set(record.kind, taken);
    }
    const copied = new Map<string, ContentRecord>(); const visiting = new Set<string>();
    function adopt(id: string): ContentRecord {
      const content = library.readContent(id); if (!content) throw new Error('乐句缺少音色或采样，原内容已保留。');
      if (library.projectScopeOf?.({ type: 'content', id }) === scope) return content;
      const previous = copied.get(id); if (previous) return previous;
      if (visiting.has(id)) throw new Error('乐句素材出现循环引用，原内容已保留。');
      visiting.add(id);
      const owner = owners.get(content.kind); if (!owner) throw new Error('暂不支持采用这份乐句所需的素材类型。');
      const changes = owner.replace(content, owner.slots(content).map(slot => ({ slotId: slot.id, targetId: adopt(slot.targetId).id })));
      const taken = names.get(content.kind) ?? new Set<string>();
      let nextName = content.name; let number = 1;
      while (taken.has(nameKey(nextName))) nextName = `${content.name} ${number++}`;
      taken.add(nameKey(nextName)); names.set(content.kind, taken);
      const local: ContentRecord = { ...structuredClone(content), ...changes, id: crypto.randomUUID(), revision: 1, name: nextName };
      visiting.delete(id); copied.set(id, local); created.push(local); return local;
    }
    const owner = owners.get(source.kind)!;
    replacement = { ...replacement, ...owner.replace(source, owner.slots(source).map(slot => ({ slotId: slot.id, targetId: adopt(slot.targetId).id }))) };
  }
  const updates: Array<{ expected: Draft; replacement: Draft }> = [];
  if (fork) {
    if (clip) clip.phraseId = replacement.id;
    updates.push({ expected: song, replacement: { ...song, body,
      dependencies: [...new Set(body.tracks.flatMap(track => track.clips.map(item => item.phraseId)))] } });
  } else for (const draft of working) updates.push({ expected: draft,
    replacement: { ...draft, name, baseRevision: replacement.revision } });
  committed(library.commitTransaction({ expectedToken, anchorDraftId: song.id, label: ref ? '修改此处乐句名称' : '修改本曲乐句名称',
    ...(fork ? { createContents: [...created, replacement] } : { replaceContents: [{ expected: source, replacement }] }),
    replaceDrafts: updates,
    exactNameIds: [replacement.id, ...updates.filter(update => update.expected.id !== song.id).map(update => update.replacement.id)],
    ...(fork ? { projectMembers: [{ rootId: song.id, contentIds: [...new Set([...view.memberIds, replacement.id])] }] } : {}),
  }));
  return { id: replacement.id };
}
