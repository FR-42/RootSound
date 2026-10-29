import type { ContentRecord, Draft, MaterialLibrary } from '../contracts/content.ts';
import type { PhraseSection } from '../contracts/phrase.ts';
import { createTimbrePlayback, createTimbreReferenceAdapter, prepareMelodyTimbres, readEditableTimbreBody } from '../modules/timbre/public.ts';
import { createPhraseReferenceAdapter, readPhraseBody } from '../modules/phrase/public.ts';
import { createSongReferenceAdapter, readSongBody } from '../modules/song/public.ts';
import { createSampleReferenceAdapter } from '../modules/sampling/public.ts';

function currentSong(library: MaterialLibrary, songDraftId: string) {
  const song = library.readDraft(songDraftId);
  if (!song) throw new Error('先打开一首歌曲，再选择音色。');
  createSongReferenceAdapter().slots(song);
  const view = library.currentProjectView?.(song.id);
  const scope = library.projectScopeOf?.({ type: 'draft', id: song.id });
  if (!view || view.project.id !== song.id || !scope) throw new Error('找不到当前歌曲的音色库，请重新打开项目。');
  return { song, view, scope };
}
const nameKey = (name: string) => name.trim().normalize('NFC').toLocaleLowerCase('en-US');
let starterSignatures: Array<{ prefix: string; name: string; body: string }> | undefined;
/** Only untouched bundled starters can be removed without a warning. Imported copies have new ids. */
export function requiresTimbreDeleteConfirmation(record: ContentRecord, workingDrafts: readonly Draft[] = []): boolean {
  if (record.revision !== 1) return true;
  if (workingDrafts.some(draft => draft.sourceId === record.id && (draft.editingContext || draft.baseRevision !== record.revision
    || draft.name !== record.name || JSON.stringify(draft.body) !== JSON.stringify(record.body)
    || JSON.stringify(draft.dependencies) !== JSON.stringify(record.dependencies)))) return true;
  starterSignatures ??= prepareMelodyTimbres().map(preset => ({
    prefix: `rootsound.melody.${presetKey(preset)}.v1:`, name: preset.name, body: JSON.stringify(readEditableTimbreBody(preset.body)),
  }));
  const body = JSON.stringify(readEditableTimbreBody(record.body));
  return !starterSignatures.some(preset => record.id.startsWith(preset.prefix) && record.name === preset.name && body === preset.body);
}
function committed(result: ReturnType<MaterialLibrary['commitTransaction']>): void {
  if (result.status !== 'committed') throw new Error(result.status === 'storage-error' ? result.message : result.reason);
}
/** Keep strict occurrence snapshots current for these non-musical metadata edits only. */
function songLibraryMetadataChanges(library: MaterialLibrary, song: Draft, body: ReturnType<typeof readSongBody>, excludedDraftIds = new Set<string>()) {
  const previous = readSongBody(song.body);
  const changed = (['timbreLibraryOrder', 'melodyTimbresSeeded'] as const)
    .filter(key => JSON.stringify(previous[key]) !== JSON.stringify(body[key]));
  const object = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value);
  function rewrite(value: unknown): unknown {
    if (Array.isArray(value)) return value.map(rewrite);
    if (!object(value)) return value;
    const next = Object.fromEntries(Object.entries(value).map(([key, item]) => [key, rewrite(item)]));
    if (next.kind === 'rootsound.song' && next.id === song.id && object(next.body)) {
      const metadata = { ...next.body };
      for (const key of changed) {
        if (body[key] === undefined) delete metadata[key]; else metadata[key] = structuredClone(body[key]);
      }
      next.body = readSongBody(metadata);
    }
    return next;
  }
  const result: Array<{ expected: Draft; replacement: Draft }> = [{ expected: song, replacement: { ...song, body } }];
  if (!changed.length) return result;
  for (const draft of library.listDrafts()) {
    if (draft.id === song.id || excludedDraftIds.has(draft.id) || !object(draft.editingContext)
      || draft.editingContext.format !== 'RootSoundReferenceEdit' || draft.editingContext.version !== 1) continue;
    const context = rewrite(draft.editingContext) as Draft['editingContext'];
    if (JSON.stringify(context) !== JSON.stringify(draft.editingContext)) result.push({ expected: draft, replacement: { ...draft, editingContext: context } });
  }
  return result;
}
function presetKey(record: ContentRecord): string | undefined {
  const body = readEditableTimbreBody(record.body);
  if (body.model !== 'synthesizer') return undefined;
  return ['piano', 'flute', 'bass-drum', 'kick', 'strings', 'trumpet', 'guitar']
    .find(key => body.sources.some(source => source.id.startsWith(`rootsound.melody.${key}.v1:`)));
}

/** Current song identities only: no global starters, other songs or historical custody. */
export function listProjectTimbres(library: MaterialLibrary, songDraftId: string): ContentRecord[] {
  const { song, view, scope } = currentSong(library, songDraftId);
  const ids = new Set([...view.contents.filter(record => record.kind === 'rootsound.timbre').map(record => record.id),
    ...view.drafts.filter(record => record.kind === 'rootsound.timbre').flatMap(record => record.sourceId ? [record.sourceId] : [])]);
  const phraseParts = [...view.contents.filter(record => record.kind === 'rootsound.phrase')
    .map(record => library.readContent(record.id)!), ...view.drafts.filter(record => record.kind === 'rootsound.phrase')]
    .flatMap(record => readPhraseBody(record.body).parts);
  const playback = createTimbrePlayback(library);
  const records = [...ids].filter(id => library.projectScopeOf?.({ type: 'content', id }) === scope).map(id => {
    const record = playback.readSaved(id).content;
    const draft = view.drafts.find(item => item.kind === 'rootsound.timbre' && item.sourceId === id);
    return draft ? { ...record, name: draft.name } : record;
  }).filter(record => {
    const uses = phraseParts.filter(part => part.timbreId === record.id);
    // Scaffold voices remain stored, but untouched empty defaults are not choices.
    return view.memberIds.includes(record.id) || !uses.length || !uses.every(part => generatedEmptyPlaceholder(library, part));
  }).sort((first, second) => first.name.localeCompare(second.name, 'zh-CN') || first.id.localeCompare(second.id));
  const byId = new Map(records.map(record => [record.id, record])); const ordered: ContentRecord[] = [];
  for (const id of readSongBody(song.body).timbreLibraryOrder ?? []) {
    const record = byId.get(id); if (record) { ordered.push(record); byId.delete(id); }
  }
  for (const record of records) if (byId.delete(record.id)) ordered.push(record);
  return ordered;
}

/** Seed independent local starters together; repeated entry never resets edits or names. */
export function ensureProjectMelodyTimbres(library: MaterialLibrary, songDraftId: string): ContentRecord[] {
  const expectedToken = library.currentToken(); const { song, view, scope } = currentSong(library, songDraftId);
  const songBody = readSongBody(song.body);
  if (songBody.melodyTimbresSeeded) return listProjectTimbres(library, songDraftId);
  const current = listProjectTimbres(library, songDraftId);
  const names = new Set([...library.listContentInfo(), ...library.listDrafts()]
    .filter(item => item.kind === 'rootsound.timbre' && library.projectScopeOf?.({ type: 'revision' in item ? 'content' : 'draft', id: item.id }) === scope)
    .map(item => nameKey(item.name)));
  const created: ContentRecord[] = [];
  for (const preset of prepareMelodyTimbres()) {
    const key = presetKey(preset)!; const id = `rootsound.melody.${key}.v1:${scope}`;
    if (current.some(record => record.id === id || presetKey(record) === key)) continue;
    // A renamed/edited preset is still the same saved identity after reopening.
    const previous = library.readContent(id);
    if (previous && library.projectScopeOf?.({ type: 'content', id }) === scope) continue;
    let name = preset.name; let suffix = 2;
    while (names.has(nameKey(name))) name = `${preset.name} ${suffix++}`;
    names.add(nameKey(name)); created.push({ ...preset, id, name });
  }
  songBody.melodyTimbresSeeded = true;
  committed(library.commitTransaction({ expectedToken, label: '准备本曲音色', createContents: created,
    replaceDrafts: songLibraryMetadataChanges(library, song, songBody),
    exactNameIds: created.map(record => record.id), projectMembers: [{ rootId: song.id,
      contentIds: [...new Set([...view.memberIds, ...created.map(record => record.id)])] }] }));
  return listProjectTimbres(library, songDraftId);
}

/** One song-wide library order, shared by every phrase and both departments. */
export function reorderProjectTimbres(library: MaterialLibrary, songDraftId: string, timbreId: string, targetIndex: number): void {
  const expectedToken = library.currentToken(); const { song } = currentSong(library, songDraftId);
  const tones = listProjectTimbres(library, songDraftId); const from = tones.findIndex(record => record.id === timbreId);
  if (from < 0) throw new Error('请选择当前歌曲音色库里的音色。');
  if (!Number.isInteger(targetIndex) || targetIndex < 0 || targetIndex >= tones.length) throw new Error('音色库目标位置无效。');
  if (from === targetIndex) return;
  const order = tones.map(record => record.id); order.splice(targetIndex, 0, order.splice(from, 1)[0]!);
  const body = readSongBody(song.body); body.timbreLibraryOrder = order;
  committed(library.commitTransaction({ expectedToken, label: '调整音色库顺序', anchorDraftId: song.id,
    replaceDrafts: songLibraryMetadataChanges(library, song, body) }));
}

/** Unused voices can leave this library without discarding notes or unfinished edits. */
export function tryRemoveUnusedProjectTimbre(library: MaterialLibrary, songDraftId: string, timbreId: string): boolean {
  const expectedToken = library.currentToken(); const { song, scope } = currentSong(library, songDraftId);
  const visible = listProjectTimbres(library, songDraftId).find(record => record.id === timbreId);
  if (!visible) throw new Error('请选择当前歌曲音色库里的音色。');
  const tone = library.readContent(timbreId)!;
  if (library.projectScopeOf?.({ type: 'content', id: tone.id }) !== scope) throw new Error('不能删除其他歌曲的音色。');
  const drafts = library.listDrafts(); const toneDrafts = drafts.filter(draft => draft.sourceId === tone.id);
  const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
  if (toneDrafts.some(draft => draft.editingContext || draft.name !== tone.name || draft.baseRevision !== tone.revision
    || !same(draft.body, tone.body) || !same(draft.dependencies, tone.dependencies))) return false;
  if (toneDrafts.some(draft => {
    const history = library.readDraftHistory(draft.id); return history.past.length > 0 || history.future.length > 0;
  })) return false;
  const deletedDraftIds = new Set(toneDrafts.map(draft => draft.id));
  function mentions(value: unknown): boolean {
    if (typeof value === 'string') return value === tone.id || deletedDraftIds.has(value);
    if (value && typeof value === 'object' && !Array.isArray(value) && 'kind' in value
      && value.kind === 'rootsound.song' && 'body' in value && value.body && typeof value.body === 'object' && !Array.isArray(value.body)) {
      const { timbreLibraryOrder: _order, ...musicalBody } = value.body as Record<string, unknown>;
      return Object.entries(value).some(([key, item]) => mentions(key === 'body' ? musicalBody : item));
    }
    return !!value && typeof value === 'object' && (Array.isArray(value) ? value : Object.values(value)).some(mentions);
  }
  // Include saved phrases outside the current arrangement, other departments,
  // and ordinary undo snapshots: deleting a picker tile must not break them.
  if (library.listContentInfo().some(record => record.id !== tone.id && library.readContent(record.id)!.dependencies.includes(tone.id))) return false;
  for (const draft of drafts) {
    if (deletedDraftIds.has(draft.id)) continue;
    if (draft.dependencies.includes(tone.id) || mentions(draft.editingContext)) return false;
    const history = library.readDraftHistory(draft.id);
    if ([...history.past, ...history.future].some(step => step.dependencies.includes(tone.id))) return false;
  }
  const body = readSongBody(song.body); body.melodyTimbresSeeded = true;
  if (body.timbreLibraryOrder) body.timbreLibraryOrder = body.timbreLibraryOrder.filter(id => id !== tone.id);
  committed(library.commitTransaction({ expectedToken, label: `删除未使用音色${tone.name}`, anchorDraftId: song.id,
    deleteContents: [tone], deleteDrafts: toneDrafts,
    replaceDrafts: songLibraryMetadataChanges(library, song, body, deletedDraftIds) }));
  return true;
}

function generatedEmptyPlaceholder(library: MaterialLibrary, part: ReturnType<typeof readPhraseBody>['parts'][number]): boolean {
  if (part.notes.length || !/^乐句 [1-9]\d* 音色$/.test(part.name)) return false;
  const record = library.readContent(part.timbreId);
  if (!record || record.name !== part.name || record.dependencies.length) return false;
  if (library.listDrafts().some(draft => draft.sourceId === record.id && (draft.name !== record.name
    || JSON.stringify(draft.body) !== JSON.stringify(record.body) || JSON.stringify(draft.dependencies) !== JSON.stringify(record.dependencies)))) return false;
  const body = readEditableTimbreBody(record.body);
  return body.model === 'basic-synth' && body.character === 'warm' && body.attackSeconds === .025
    && body.releaseSeconds === .55 && body.level === .65;
}

function validateProjectTimbreGraph(library: MaterialLibrary, scope: string, voice: ContentRecord): void {
  const adapters = new Map([createTimbreReferenceAdapter(), createSampleReferenceAdapter()].map(adapter => [adapter.kind, adapter]));
  const checked = new Set<string>();
  function visit(record: ContentRecord): void {
    if (checked.has(record.id)) return; checked.add(record.id);
    if (library.projectScopeOf?.({ type: 'content', id: record.id }) !== scope) throw new Error('音色引用了本曲之外的素材。');
    const adapter = adapters.get(record.kind); if (!adapter) throw new Error('音色依赖的素材类型暂不支持。');
    for (const slot of adapter.slots(record)) {
      const child = library.readContent(slot.targetId); if (!child) throw new Error('音色缺少原始采样。');
      adapter.validateTarget?.(record, slot.id, child); visit(child);
    }
  }
  visit(voice);
}

/** One undoable phrase edit using only this song's already-owned voice graph. */
export function addProjectPhraseTimbre(library: MaterialLibrary, songDraftId: string, phraseDraftId: string, timbreId: string, section: PhraseSection = 'melody'): string {
  return addProjectPhrasePart(library, songDraftId, phraseDraftId, timbreId, section, true);
}

/** Every Melody shelf entry is an independent note family, even when voices are shared. */
export function createProjectPhraseNoteGroup(library: MaterialLibrary, songDraftId: string, phraseDraftId: string, timbreId: string): string {
  return addProjectPhrasePart(library, songDraftId, phraseDraftId, timbreId, 'melody', false);
}

function addProjectPhrasePart(library: MaterialLibrary, songDraftId: string, phraseDraftId: string, timbreId: string, section: PhraseSection, reuseExisting: boolean): string {
  if (section !== 'melody' && section !== 'rhythm') throw new Error('请选择旋律部或节奏部。');
  const expectedToken = library.currentToken(); const { scope } = currentSong(library, songDraftId);
  const source = library.readDraft(phraseDraftId);
  if (!source || library.projectScopeOf?.({ type: 'draft', id: source.id }) !== scope) throw new Error('这份乐句不属于当前歌曲。');
  const phraseAdapter = createPhraseReferenceAdapter(); phraseAdapter.slots(source);
  const body = readPhraseBody(source.body);
  const voice = listProjectTimbres(library, songDraftId).find(record => record.id === timbreId);
  if (!voice) throw new Error('请选择当前歌曲音色库里的音色。');
  validateProjectTimbreGraph(library, scope, voice);
  const existing = body.parts.find(part => part.timbreId === voice.id && (part.section ?? 'melody') === section); if (reuseExisting && existing) return existing.id;
  if (body.parts.length === 1 && generatedEmptyPlaceholder(library, body.parts[0]!)) body.parts = [];
  const partId = crypto.randomUUID(); body.parts.push({ id: partId, name: voice.name, timbreId: voice.id,
    ...(section === 'rhythm' ? { section } : {}), notes: [] });
  const nextBody = readPhraseBody(body); const dependencies = [...new Set(nextBody.parts.map(part => part.timbreId))];
  const replacement = { ...source, body: nextBody, dependencies }; phraseAdapter.slots(replacement);
  committed(library.commitTransaction({ expectedToken, label: reuseExisting ? `加入${voice.name}` : '新建总音符', anchorDraftId: source.id,
    replaceDrafts: [{ expected: source, replacement }] }));
  return partId;
}

/** Rebind one note family without dropping its former sound from this song's library. */
export function changeProjectPhraseNoteGroupTimbre(library: MaterialLibrary, songDraftId: string, phraseDraftId: string, partId: string, timbreId: string): void {
  const expectedToken = library.currentToken(); const { song, view, scope } = currentSong(library, songDraftId);
  const source = library.readDraft(phraseDraftId);
  if (!source || library.projectScopeOf?.({ type: 'draft', id: source.id }) !== scope) throw new Error('这份乐句不属于当前歌曲。');
  const adapter = createPhraseReferenceAdapter(); adapter.slots(source); const body = readPhraseBody(source.body);
  const target = body.parts.find(part => part.id === partId);
  if (!target) throw new Error('请选择一个总音符。');
  const voice = listProjectTimbres(library, songDraftId).find(record => record.id === timbreId);
  if (!voice) throw new Error('请选择当前歌曲音色库里的音色。');
  validateProjectTimbreGraph(library, scope, voice);
  const previous = library.readContent(target.timbreId);
  if (!previous || previous.kind !== 'rootsound.timbre' || library.projectScopeOf?.({ type: 'content', id: previous.id }) !== scope) throw new Error('原音色不属于当前歌曲。');
  if (target.timbreId === voice.id && target.name === voice.name && !target.unassigned) return;
  Object.assign(target, { timbreId: voice.id, name: voice.name }); delete target.unassigned;
  const next = readPhraseBody(body); const replacement = { ...source, body: next, dependencies: [...new Set(next.parts.map(part => part.timbreId))] }; adapter.slots(replacement);
  committed(library.commitTransaction({ expectedToken, label: '更换总音符音色', anchorDraftId: source.id,
    replaceDrafts: [{ expected: source, replacement }], projectMembers: [{ rootId: song.id,
      contentIds: [...new Set([...view.memberIds, previous.id])] }] }));
}

/** Remove matching uses together while keeping the shared tone in this song's library. */
export function removeProjectPhraseTimbre(library: MaterialLibrary, songDraftId: string, phraseDraftId: string, timbreId: string, section: PhraseSection | 'all' = 'melody'): void {
  if (section !== 'melody' && section !== 'rhythm' && section !== 'all') throw new Error('请选择有效的音符范围。');
  const expectedToken = library.currentToken(); const { song, view, scope } = currentSong(library, songDraftId);
  const source = library.readDraft(phraseDraftId);
  if (!source || library.projectScopeOf?.({ type: 'draft', id: source.id }) !== scope) throw new Error('这份乐句不属于当前歌曲。');
  const adapter = createPhraseReferenceAdapter(); adapter.slots(source); const body = readPhraseBody(source.body);
  const targets = body.parts.filter(part => part.timbreId === timbreId && (section === 'all' || (part.section ?? 'melody') === section));
  if (!targets.length) return;
  const tone = library.readContent(timbreId);
  if (!tone || tone.kind !== 'rootsound.timbre' || library.projectScopeOf?.({ type: 'content', id: tone.id }) !== scope) throw new Error('请选择当前歌曲里的音色。');
  const removed = new Set(targets.map(part => part.id));
  const next = readPhraseBody({ ...body, parts: body.parts.filter(part => !removed.has(part.id)) });
  const replacement = { ...source, body: next, dependencies: [...new Set(next.parts.map(part => part.timbreId))] }; adapter.slots(replacement);
  committed(library.commitTransaction({ expectedToken, label: `从乐句移除${tone.name}`, anchorDraftId: source.id,
    replaceDrafts: [{ expected: source, replacement }], projectMembers: [{ rootId: song.id,
      contentIds: [...new Set([...view.memberIds, tone.id])] }] }));
}
