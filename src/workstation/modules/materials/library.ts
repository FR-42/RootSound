import type {
  ContentRecord, Draft, DraftChanges, JsonValue, MaterialLibrary,
  MaterialStorage, NewContent, SaveConfirmation, SaveResult,
} from '../../contracts/content.ts';

interface State {
  format: 'RootSoundMaterialLibrary';
  version: 1;
  contents: ContentRecord[];
  drafts: Draft[];
}

function fail(message: string): never { throw new Error(`素材库：${message}`); }
function clone<T>(value: T): T { return JSON.parse(JSON.stringify(value)) as T; }
function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
function validJson(value: unknown, ancestors = new Set<object>()): value is JsonValue {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return true;
  if (typeof value === 'number') return Number.isFinite(value);
  if (typeof value !== 'object' || ancestors.has(value)) return false;
  if (!Array.isArray(value) && Object.getPrototypeOf(value) !== Object.prototype) return false;
  ancestors.add(value);
  const valid = Object.getOwnPropertySymbols(value).length === 0
    && (Array.isArray(value) ? Array.from(value) : Object.values(value)).every(item => validJson(item, ancestors));
  ancestors.delete(value);
  return valid;
}
function validateFields(value: unknown): asserts value is NewContent & { dependencies: string[] } & Record<string, unknown> {
  if (!isObject(value)) fail('内容必须是对象。');
  for (const key of ['kind', 'owner', 'name']) {
    if (typeof value[key] !== 'string' || !(value[key] as string).trim()) fail(`${key} 不能为空。`);
  }
  if (!Number.isSafeInteger(value.schemaVersion) || Number(value.schemaVersion) < 1) fail('内容格式版本无效。');
  if (!Array.isArray(value.dependencies) || value.dependencies.some(id => typeof id !== 'string' || !id)) {
    fail('依赖必须是内容标识列表。');
  }
  if (new Set(value.dependencies).size !== value.dependencies.length) fail('依赖不能重复。');
  if (!validJson(value.body)) fail('内容必须是完整、有限且无循环的 JSON 数据。');
}
function validateDependencies(contents: ContentRecord[], candidate: ContentRecord): void {
  const records = new Map(contents.map(record => [record.id, record]));
  records.set(candidate.id, candidate);
  const visiting = new Set<string>();
  const visited = new Set<string>();
  function visit(id: string): void {
    if (visiting.has(id)) fail('内容不能循环引用自身。');
    if (visited.has(id)) return;
    const record = records.get(id);
    if (!record) fail(`找不到依赖内容 ${id}。`);
    visiting.add(id);
    record.dependencies.forEach(visit);
    visiting.delete(id);
    visited.add(id);
  }
  visit(candidate.id);
}
function restore(raw: string): State {
  let value: unknown;
  try { value = JSON.parse(raw); } catch { return fail('已保存的数据损坏，未清空或覆盖原数据。'); }
  if (!isObject(value) || value.format !== 'RootSoundMaterialLibrary' || value.version !== 1
    || !Array.isArray(value.contents) || !Array.isArray(value.drafts)) fail('不支持或损坏的素材库格式。');
  for (const records of [value.contents, value.drafts]) {
    const ids = new Set<string>();
    for (const record of records) {
      validateFields(record);
      if (typeof record.id !== 'string' || !record.id || ids.has(record.id)) fail('内容或编辑稿标识无效。');
      ids.add(record.id);
    }
  }
  const state = value as unknown as State;
  for (const record of state.contents) {
    if (!Number.isSafeInteger(record.revision) || record.revision < 1) fail('已保存修订无效。');
    validateDependencies(state.contents, record);
  }
  for (const draft of state.drafts) {
    if (draft.sourceId === undefined && draft.baseRevision === undefined) continue;
    const source = state.contents.find(record => record.id === draft.sourceId);
    if (!source || !Number.isSafeInteger(draft.baseRevision) || Number(draft.baseRevision) < 1
      || Number(draft.baseRevision) > source.revision || draft.kind !== source.kind
      || draft.owner !== source.owner || draft.schemaVersion !== source.schemaVersion) fail('编辑稿来源无效。');
  }
  return state;
}
function affected(contents: ContentRecord[], sourceId: string): ContentRecord[] {
  const found = new Set([sourceId]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const record of contents) {
      if (!found.has(record.id) && record.dependencies.some(id => found.has(id))) {
        found.add(record.id);
        changed = true;
      }
    }
  }
  return contents.filter(record => record.id !== sourceId && found.has(record.id));
}

/** 所有修改先写入适配器；写入成功后才替换内存状态。 */
export function createMaterialLibrary(storage?: MaterialStorage): MaterialLibrary {
  let raw: string | null = null;
  try { raw = storage?.read() ?? null; } catch (error) { fail(`读取失败：${String(error)}`); }
  let state: State = raw === null
    ? { format: 'RootSoundMaterialLibrary', version: 1, contents: [], drafts: [] }
    : restore(raw);
  function commit(next: State): void {
    try { storage?.write(JSON.stringify(next)); } catch (error) { fail(`写入失败：${String(error)}`); }
    state = next;
  }
  function createDraft(input: NewContent | { sourceId: string }): Draft {
    let draft: Draft;
    if ('sourceId' in input) {
      const source = state.contents.find(record => record.id === input.sourceId);
      if (!source) fail('找不到要编辑的内容。');
      const { revision, id, ...fields } = source;
      draft = { ...clone(fields), id: crypto.randomUUID(), sourceId: id, baseRevision: revision };
    } else {
      const fields = { ...input, dependencies: input.dependencies ?? [] };
      validateFields(fields);
      draft = { ...clone(fields), id: crypto.randomUUID() };
    }
    const next = clone(state);
    next.drafts.push(draft);
    commit(next);
    return clone(draft);
  }
  function updateDraft(id: string, changes: DraftChanges): Draft {
    const next = clone(state);
    const draft = next.drafts.find(item => item.id === id);
    if (!draft) fail('找不到编辑稿。');
    const fields = { ...draft };
    for (const key of ['body', 'name', 'dependencies'] as const) {
      if (Object.prototype.hasOwnProperty.call(changes, key)) Object.assign(fields, { [key]: changes[key] });
    }
    validateFields(fields);
    Object.assign(draft, clone(fields));
    commit(next);
    return clone(draft);
  }
  function saveDraft(id: string, mode: 'overwrite' | 'new', confirmation?: SaveConfirmation): SaveResult {
    const draft = state.drafts.find(item => item.id === id);
    if (!draft) return { status: 'conflict', reason: '找不到编辑稿。' };
    const source = state.contents.find(record => record.id === draft.sourceId);
    if (mode === 'overwrite') {
      if (!source) return { status: 'conflict', reason: '新编辑稿没有可覆盖的来源，请保存为新内容。' };
      if (source.revision !== draft.baseRevision) return {
        status: 'conflict', reason: '来源已被其他编辑稿修改，请重新打开或另存为新内容。', actualRevision: source.revision,
      };
      const impact = affected(state.contents, source.id);
      const impactToken = `${source.id}@${source.revision}|${impact.map(item => `${item.id}@${item.revision}`).sort().join('|')}`;
      if (impact.length && (confirmation?.expectedRevision !== source.revision || confirmation.impactToken !== impactToken)) {
        return { status: 'needs-confirmation', affectedContent: clone(impact),
          confirmation: { expectedRevision: source.revision, impactToken } };
      }
    }
    const { id: draftId, sourceId: _sourceId, baseRevision: _baseRevision, ...fields } = draft;
    const content: ContentRecord = { ...clone(fields), id: mode === 'overwrite' && source ? source.id : crypto.randomUUID(),
      revision: mode === 'overwrite' && source ? source.revision + 1 : 1 };
    try { validateDependencies(state.contents, content); }
    catch (error) { return { status: 'conflict', reason: String(error) }; }
    const next = clone(state);
    const index = next.contents.findIndex(item => item.id === content.id);
    if (index < 0) next.contents.push(content); else next.contents[index] = content;
    const savedDraft: Draft = { ...clone(fields), id: draftId, sourceId: content.id, baseRevision: content.revision };
    next.drafts[next.drafts.findIndex(item => item.id === draftId)] = savedDraft;
    try { commit(next); } catch (error) { return { status: 'storage-error', message: String(error) }; }
    return { status: 'saved', content: clone(content), draft: clone(savedDraft) };
  }
  return {
    createDraft, updateDraft, saveDraft,
    readDraft: id => clone(state.drafts.find(item => item.id === id) ?? null) ?? undefined,
    listDrafts: () => clone(state.drafts),
    readContent: id => clone(state.contents.find(item => item.id === id) ?? null) ?? undefined,
    listContent: () => clone(state.contents),
  };
}
