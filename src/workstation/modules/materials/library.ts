import type {
  ContentRecord, CurrentProjectView, Draft, DraftChanges, DraftEditOptions, DraftSnapshot, JsonValue, MaterialLibrary,
  MaterialStorage, MaterialTransaction, MaterialTransactionResult, NewContent, SaveConfirmation, SaveResult,
} from '../../contracts/content.ts';
import { createProjectScopePolicy, validateProjectScopes, type ProjectPolicy, type ProjectScopes } from './project-scope.ts';
import { countUsagePositions } from './usage-positions.ts';
import { copyJson, sameJson } from './json-value.ts';

type HistoryStep = DraftSnapshot & { transactionId?: string };
type HistoryEntry = { draftId: string; past: HistoryStep[]; future: HistoryStep[] };
type RecordPatch<T> = { before: T | null; after: T | null };
type TransactionJournal = {
  id: string; label: string; anchorDraftId: string; anchorBefore: Draft; anchorAfter: Draft;
  contents: RecordPatch<ContentRecord>[]; drafts: RecordPatch<Draft>[];
  /** Same-identity edits must not rewind a subsequently saved upstream work. */
  protectedUses?: ContentRecord[];
};

interface State {
  format: 'RootSoundMaterialLibrary';
  version: 1;
  contents: ContentRecord[];
  drafts: Draft[];
  /** Optional extension keeps libraries made before durable undo readable. */
  editHistory?: { version: 1; entries: HistoryEntry[] };
  transactionHistory?: { version: 1; entries: TransactionJournal[] };
  projectScopes?: ProjectScopes;
}

const MAX_HISTORY = 64;
function snapshot(draft: Pick<Draft, 'name' | 'dependencies' | 'body'>): DraftSnapshot {
  return clone({ name: draft.name, dependencies: draft.dependencies, body: draft.body });
}
const same = sameJson;
function historyFor(state: State, draftId: string): HistoryEntry | undefined {
  return state.editHistory?.entries.find(entry => entry.draftId === draftId);
}
function collectJournals(state: State): void {
  if (!state.transactionHistory) return;
  const used = new Set(state.editHistory?.entries.flatMap(entry => [...entry.past, ...entry.future])
    .flatMap(step => step.transactionId ? [step.transactionId] : []) ?? []);
  state.transactionHistory.entries = state.transactionHistory.entries.filter(entry => used.has(entry.id));
}

/** Histories are recovery custody. Explicit permanent deletion must forget it too. */
function forgetDeletedIdentities(state: State, ids: Set<string>): void {
  function mentions(value: unknown): boolean {
    if (typeof value === 'string') return ids.has(value);
    if (!value || typeof value !== 'object') return false;
    return (Array.isArray(value) ? value : Object.values(value)).some(mentions);
  }
  const journals = new Set((state.transactionHistory?.entries ?? []).filter(mentions).map(journal => journal.id));
  if (state.editHistory) state.editHistory.entries = state.editHistory.entries.filter(entry =>
    !ids.has(entry.draftId) && !mentions(entry)
    && ![...entry.past, ...entry.future].some(step => step.transactionId && journals.has(step.transactionId)));
  if (state.transactionHistory) state.transactionHistory.entries = state.transactionHistory.entries.filter(entry => !journals.has(entry.id));
  if (state.projectScopes) {
    const scopes = state.projectScopes;
    scopes.contents = scopes.contents.filter(item => !ids.has(item.id));
    scopes.roots = scopes.roots.filter(item => !ids.has(item.id));
    if (scopes.members) scopes.members = scopes.members.filter(item => !ids.has(item.id));
    if (scopes.imports) scopes.imports = scopes.imports.filter(item => !ids.has(item.sourceId) && !ids.has(item.localId)
      && ![...ids].some(id => item.graphToken.includes(JSON.stringify(id))));
  }
  collectJournals(state);
}

function fail(message: string): never { throw new Error(`素材库：${message}`); }
const clone = copyJson;
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
  if (value.editingContext !== undefined && !validJson(value.editingContext)) fail('编辑上下文必须是有效 JSON。');
  if (value.projectRootId !== undefined && (typeof value.projectRootId !== 'string' || !value.projectRootId.trim())) fail('编辑稿的歌曲归属标识无效。');
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
function restore(raw: string, projectRootKind = 'rootsound.song'): State {
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
  validateProjectScopes(value.projectScopes);
  for (const record of state.contents) {
    if (Object.hasOwn(record, 'projectRootId')) fail('编辑稿归属不能写入已保存素材。');
    if (!Number.isSafeInteger(record.revision) || record.revision < 1) fail('已保存修订无效。');
    validateDependencies(state.contents, record);
  }
  for (const draft of state.drafts) {
    if (draft.projectRootId !== undefined) {
      const root = state.drafts.find(item => item.id === draft.projectRootId);
      if (!root || root.id === draft.id || root.kind !== projectRootKind || draft.kind === projectRootKind) fail('编辑稿缺少有效的所属歌曲。');
    }
    if (draft.sourceId === undefined && draft.baseRevision === undefined) continue;
    const source = state.contents.find(record => record.id === draft.sourceId);
    if (!source || !Number.isSafeInteger(draft.baseRevision) || Number(draft.baseRevision) < 1
      || Number(draft.baseRevision) > source.revision || draft.kind !== source.kind
      || draft.owner !== source.owner || draft.schemaVersion !== source.schemaVersion) fail('编辑稿来源无效。');
  }
  if (value.editHistory !== undefined) {
    const history = value.editHistory;
    if (!isObject(history) || history.version !== 1 || !Array.isArray(history.entries)) fail('不支持或损坏的编辑历史。原数据已保留。');
    const ids = new Set<string>();
    for (const entry of history.entries) {
      if (!isObject(entry) || typeof entry.draftId !== 'string' || ids.has(entry.draftId)) fail('编辑历史标识无效。');
      const draft = state.drafts.find(item => item.id === entry.draftId);
      if (!draft) fail('编辑历史找不到对应编辑稿。');
      ids.add(entry.draftId);
      for (const key of ['past', 'future']) {
        const snapshots = entry[key];
        if (!Array.isArray(snapshots) || snapshots.length > MAX_HISTORY) fail('编辑历史列表无效。');
        for (const item of snapshots) {
          if (!isObject(item) || Object.keys(item).length < 3 || Object.keys(item).length > 4
            || Object.keys(item).some(field => !['name', 'dependencies', 'body', 'transactionId'].includes(field))
            || !['name', 'dependencies', 'body'].every(field => Object.hasOwn(item, field))
            || (item.transactionId !== undefined && (typeof item.transactionId !== 'string' || !item.transactionId))) fail('编辑历史快照无效。');
          validateFields({ ...draft, ...item });
        }
      }
    }
  }
  if (value.transactionHistory !== undefined) {
    const journals = value.transactionHistory;
    if (!isObject(journals) || journals.version !== 1 || !Array.isArray(journals.entries)) fail('复合编辑历史格式无效。');
    const ids = new Set<string>();
    for (const journal of journals.entries) {
      if (!isObject(journal) || typeof journal.id !== 'string' || !journal.id || ids.has(journal.id)
        || typeof journal.label !== 'string' || !journal.label.trim() || typeof journal.anchorDraftId !== 'string') fail('复合编辑历史标识无效。');
      ids.add(journal.id);
      for (const key of ['anchorBefore', 'anchorAfter']) {
        const anchor = journal[key]; validateFields(anchor);
        if (anchor.id !== journal.anchorDraftId) fail('复合编辑历史的撤销位置无效。');
      }
      for (const key of ['contents', 'drafts']) {
        const patches = journal[key];
        if (!Array.isArray(patches)) fail('复合编辑历史变更无效。');
        const patchIds = new Set<string>();
        for (const patch of patches) {
          if (!isObject(patch) || (patch.before === null && patch.after === null)) fail('复合编辑历史记录无效。');
          for (const record of [patch.before, patch.after]) {
            if (record === null) continue;
            validateFields(record);
            if (typeof record.id !== 'string' || !record.id) fail('复合编辑历史内容标识无效。');
            if (key === 'contents' && (!Number.isSafeInteger(record.revision) || Number(record.revision) < 1)) fail('复合编辑历史修订无效。');
          }
          const before = patch.before as Record<string, unknown> | null;
          const after = patch.after as Record<string, unknown> | null;
          const id = String(before?.id ?? after?.id);
          if ((before && after && before.id !== after.id) || patchIds.has(id)) fail('复合编辑历史包含重复或变化的标识。');
          patchIds.add(id);
        }
      }
      if (journal.protectedUses !== undefined) {
        if (!Array.isArray(journal.protectedUses)) fail('复合编辑的保存保护记录无效。');
        for (const record of journal.protectedUses) {
          validateFields(record);
          if (typeof record.id !== 'string' || !Number.isSafeInteger(record.revision) || Number(record.revision) < 1) fail('复合编辑的保存保护记录无效。');
        }
      }
    }
  }
  for (const entry of state.editHistory?.entries ?? []) {
    for (const direction of ['past', 'future'] as const) {
      for (const step of entry[direction]) {
        if (!step.transactionId) continue;
        const journal = state.transactionHistory?.entries.find(item => item.id === step.transactionId && item.anchorDraftId === entry.draftId);
        if (!journal || !same(snapshot(step), snapshot(direction === 'past' ? journal.anchorBefore : journal.anchorAfter))) {
          fail('编辑历史找不到匹配的完整复合操作，原数据已保留。');
        }
      }
    }
  }
  return state;
}
function affected(contents: ContentRecord[], drafts: Draft[], sourceId: string): {
  contents: ContentRecord[]; drafts: Draft[];
} {
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
  return {
    contents: contents.filter(record => record.id !== sourceId && found.has(record.id)),
    // A draft's source is its editing origin, not a playback dependency. Only
    // explicit references participate, including references through saved content.
    drafts: drafts.filter(draft => draft.dependencies.some(id => found.has(id))),
  };
}

/** 所有修改先写入适配器；写入成功后才替换内存状态。 */
export function createMaterialLibrary(storage?: MaterialStorage, options?: { project?: ProjectPolicy }): MaterialLibrary {
  const projectPolicy = options?.project ? createProjectScopePolicy(options.project) : undefined;
  let raw: string | null = null;
  try { raw = storage?.read() ?? null; } catch (error) { fail(`读取失败：${String(error)}`); }
  let state: State = raw === null
    ? { format: 'RootSoundMaterialLibrary', version: 1, contents: [], drafts: [] }
    : restore(raw, options?.project?.rootKind);
  projectPolicy?.validateDraftOwnership(state);
  let token = crypto.randomUUID();
  function commit(next: State, permanent = false): void {
    collectJournals(next);
    const nextRaw = JSON.stringify(next);
    try {
      // Another store client may have committed since this instance was opened.
      // Never let an old undo stack replace newer disk content.
      if (storage && storage.read() !== raw) fail('素材库已被其他窗口修改，请重新打开后继续。原数据未被覆盖。');
      if (permanent && storage?.writePermanent) storage.writePermanent(nextRaw);
      else storage?.write(nextRaw);
    } catch (error) { fail(`写入失败：${String(error)}`); }
    state = next;
    raw = nextRaw;
    token = crypto.randomUUID();
  }
  function checkCandidate(next: State, changedDrafts: Set<string>): void {
    // Keep old unfinished drafts readable, but never create a new missing reference
    // or delete a saved item that a surviving draft still uses.
    const oldIds = new Set(state.contents.map(item => item.id));
    const newIds = new Set(next.contents.map(item => item.id));
    for (const draft of next.drafts) {
      for (const dependency of draft.dependencies) {
        if (!newIds.has(dependency) && (oldIds.has(dependency) || changedDrafts.has(draft.id))) fail('仍有编辑稿引用将被移除或不存在的素材。');
      }
    }
    restore(JSON.stringify(next), options?.project?.rootKind);
  }
  function commitTransaction(transaction: MaterialTransaction): MaterialTransactionResult {
    if (transaction.expectedToken !== token) return { status: 'conflict', reason: '素材或使用位置已变化，请重新查看后再应用。' };
    const next = clone(state);
    const transactionId = crypto.randomUUID();
    const contents: RecordPatch<ContentRecord>[] = [];
    const drafts: RecordPatch<Draft>[] = [];
    const changedDrafts = new Set<string>();
    try {
      if (typeof transaction.label !== 'string' || !transaction.label.trim()) fail('请说明这次联合编辑的用途。');
      if (transaction.permanentDelete !== undefined && (transaction.permanentDelete !== true || transaction.anchorDraftId
        || !transaction.deleteContents?.length)) fail('永久删除需要实际删除素材，且不能同时创建撤销记录。');
      function apply<T extends ContentRecord | Draft>(
        records: T[], creates: T[] | undefined, replacements: { expected: T; replacement: T }[] | undefined,
        deletes: T[] | undefined, patches: RecordPatch<T>[], saved: boolean,
      ): void {
        const seen = new Set<string>();
        function touch(record: T): void {
          validateFields(record);
          if (typeof record.id !== 'string' || !record.id || seen.has(record.id)) fail('事务包含重复或无效的内容标识。');
          seen.add(record.id);
          if (saved && (!Number.isSafeInteger((record as ContentRecord).revision) || (record as ContentRecord).revision < 1)) fail('事务中的素材修订无效。');
          if (saved && (Object.hasOwn(record, 'editingContext') || Object.hasOwn(record, 'projectRootId'))) fail('编辑上下文或稿件归属不能写入音乐素材。');
        }
        for (const group of [creates, replacements, deletes]) if (group !== undefined && !Array.isArray(group)) fail('事务操作必须为列表。');
        for (const record of creates ?? []) {
          touch(record);
          if (records.some(item => item.id === record.id)) fail('要创建的标识已存在。');
          if (saved && (record as ContentRecord).revision !== 1) fail('新素材必须从第一个修订开始。');
          records.push(clone(record)); patches.push({ before: null, after: clone(record) });
        }
        for (const { expected, replacement } of replacements ?? []) {
          touch(replacement);
          const index = records.findIndex(item => item.id === expected.id);
          if (index < 0 || !same(records[index], expected) || replacement.id !== expected.id) fail('要替换的内容已变化，请重新打开后再应用。');
          if (saved && (replacement as ContentRecord).revision !== (expected as ContentRecord).revision + 1) fail('替换素材必须使用下一个修订。');
          if (same(expected, replacement)) continue;
          records[index] = clone(replacement); patches.push({ before: clone(expected), after: clone(replacement) });
        }
        for (const expected of deletes ?? []) {
          touch(expected);
          const index = records.findIndex(item => item.id === expected.id);
          if (index < 0 || !same(records[index], expected)) fail('要移除的内容已变化，请重新查看后再操作。');
          records.splice(index, 1); patches.push({ before: clone(expected), after: null });
        }
      }
      apply(next.contents, transaction.createContents, transaction.replaceContents, transaction.deleteContents, contents, true);
      apply(next.drafts, transaction.createDrafts, transaction.replaceDrafts, transaction.deleteDrafts, drafts, false);
      if (transaction.permanentDelete) forgetDeletedIdentities(next,
        new Set([...transaction.deleteContents!, ...(transaction.deleteDrafts ?? [])].map(item => item.id)));
      for (const membership of transaction.projectMembers ?? []) {
        const savedRoot = next.contents.find(item => item.id === membership.rootId);
        const root = savedRoot ?? next.drafts.find(item => item.id === membership.rootId);
        const rootType = savedRoot ? 'content' : 'draft';
        if (!root || options?.project && root.kind !== options.project.rootKind
          || !savedRoot && root.kind !== (options?.project?.rootKind ?? 'rootsound.song')
          || !Array.isArray(membership.contentIds)) fail('工程素材成员缺少有效的歌曲根。');
        next.projectScopes ??= { version: 1, roots: [], contents: [] };
        const scopeId = next.projectScopes.roots.find(item => item.type === rootType && item.id === root.id)?.scopeId
          ?? (!savedRoot && 'sourceId' in root && root.sourceId
            ? next.projectScopes.roots.find(item => item.type === 'content' && item.id === root.sourceId)?.scopeId : undefined)
          ?? root.id;
        if (!next.projectScopes.roots.some(item => item.type === rootType && item.id === root.id)) next.projectScopes.roots.push({ type: rootType, id: root.id, scopeId });
        next.projectScopes.members ??= [];
        const pending = [...membership.contentIds]; const seen = new Set<string>();
        while (pending.length) {
          const id = pending.pop()!; if (seen.has(id)) continue; seen.add(id);
          const record = next.contents.find(item => item.id === id);
          if (!record || id === root.id || options?.project && record.kind === options.project.rootKind) fail('工程素材成员无效。');
          const assignment = next.projectScopes.contents.find(item => item.id === id);
          if (assignment && assignment.scopeId !== scopeId) fail('不能把另一首歌曲的素材直接加入本曲。');
          if (!assignment) next.projectScopes.contents.push({ id, scopeId });
          pending.push(...record.dependencies);
        }
        for (const id of membership.contentIds) if (!next.projectScopes.members.some(item => item.id === id && item.scopeId === scopeId)) {
          next.projectScopes.members.push({ id, scopeId });
        }
      }
      const exactNames = transaction.exactNameIds ?? [];
      const changedIds = new Set([...contents, ...drafts].flatMap(patch => patch.after ? [patch.after.id] : []));
      if (!Array.isArray(exactNames) || exactNames.some(id => typeof id !== 'string' || !changedIds.has(id))) fail('明确命名的素材不在本次变更中。');
      projectPolicy?.normalize(state, next, new Set(exactNames));
      if (projectPolicy) for (const draft of next.drafts) {
        const context = draft.editingContext;
        if (!isObject(context) || context.format !== 'RootSoundReferenceEdit' || !Array.isArray(context.pendingActions)) continue;
        for (const action of context.pendingActions) {
          if (!isObject(action) || !isObject(action.replacement) || typeof action.replacement.id !== 'string') continue;
          const replacementId = action.replacement.id;
          const replacement = next.contents.find(item => item.id === replacementId);
          // The scope planner may give this newly staged fork its final local
          // name. Keep the workflow's exact snapshot synchronized in this same
          // transaction, so a later parent save still validates the handoff.
          if (replacement && !state.contents.some(item => item.id === replacement.id)) action.replacement = clone(replacement) as unknown as JsonValue;
        }
      }
      // Graph isolation may create and rewrite additional records. The undo
      // journal must capture the final plan, never the pre-isolation request.
      if (projectPolicy) {
        function differences<T extends { id: string }>(before: T[], after: T[]): RecordPatch<T>[] {
          const old = new Map(before.map(item => [item.id, item])); const current = new Map(after.map(item => [item.id, item]));
          return [...new Set([...old.keys(), ...current.keys()])].flatMap(id => same(old.get(id), current.get(id)) ? [] :
            [{ before: clone(old.get(id) ?? null), after: clone(current.get(id) ?? null) }]);
        }
        contents.splice(0, contents.length, ...differences(state.contents, next.contents));
        drafts.splice(0, drafts.length, ...differences(state.drafts, next.drafts));
      }
      for (const patch of drafts) {
        const id = patch.before?.id ?? patch.after!.id;
        changedDrafts.add(id);
        // Attaching workflow context must not erase the user's existing edits.
        const onlyContext = patch.before && patch.after
          && same({ ...patch.before, editingContext: null }, { ...patch.after, editingContext: null });
        if (!onlyContext && next.editHistory && id !== transaction.anchorDraftId) {
          next.editHistory.entries = next.editHistory.entries.filter(entry => entry.draftId !== id);
        }
      }
      if (transaction.anchorDraftId) {
        const before = state.drafts.find(item => item.id === transaction.anchorDraftId);
        const after = next.drafts.find(item => item.id === transaction.anchorDraftId);
        if (!before || !after) fail('复合撤销需要一份前后都存在的编辑稿。');
        next.editHistory ??= { version: 1, entries: [] };
        let history = historyFor(next, transaction.anchorDraftId);
        if (!history) { history = { draftId: transaction.anchorDraftId, past: [], future: [] }; next.editHistory.entries.push(history); }
        history.past.push({ ...snapshot(before), transactionId });
        if (history.past.length > MAX_HISTORY) history.past.shift();
        history.future = [];
        next.transactionHistory ??= { version: 1, entries: [] };
        const changedIds = new Set(contents.map(patch => patch.before?.id ?? patch.after!.id));
        const overwrittenIds = contents.filter(patch => patch.before && patch.after).map(patch => patch.before!.id);
        const protectedIds = new Set(overwrittenIds.flatMap(id => affected(next.contents, [], id).contents.map(item => item.id)));
        const protectedUses = next.contents.filter(item => protectedIds.has(item.id) && !changedIds.has(item.id));
        next.transactionHistory.entries.push({ id: transactionId, label: transaction.label, anchorDraftId: transaction.anchorDraftId,
          anchorBefore: clone(before), anchorAfter: clone(after), contents, drafts,
          ...(protectedUses.length ? { protectedUses: clone(protectedUses) } : {}) });
      }
      checkCandidate(next, changedDrafts);
    } catch (error) { return { status: 'conflict', reason: String(error) }; }
    try { commit(next, transaction.permanentDelete); } catch (error) { return { status: 'storage-error', message: String(error) }; }
    return { status: 'committed', transactionId };
  }
  function createDraft(input: (NewContent | { sourceId: string }) & { projectRootId?: string }): Draft {
    let draft: Draft;
    if ('sourceId' in input) {
      const source = state.contents.find(record => record.id === input.sourceId);
      if (!source) fail('找不到要编辑的内容。');
      const { revision, id, ...fields } = source;
      draft = { ...clone(fields), id: crypto.randomUUID(), sourceId: id, baseRevision: revision,
        ...(input.projectRootId === undefined ? {} : { projectRootId: input.projectRootId }) };
    } else {
      const fields = { ...input, dependencies: input.dependencies ?? [] };
      validateFields(fields);
      draft = { ...clone(fields), id: crypto.randomUUID() };
    }
    const next = clone(state);
    next.drafts.push(draft);
    projectPolicy?.normalize(state, next);
    if (draft.projectRootId) checkCandidate(next, new Set([draft.id]));
    commit(next);
    return clone(next.drafts.find(item => item.id === draft.id)!);
  }
  function updateDraft(id: string, changes: DraftChanges, options?: DraftEditOptions): Draft {
    const next = clone(state);
    const draft = next.drafts.find(item => item.id === id);
    if (!draft) fail('找不到编辑稿。');
    if (options && !same(draft, options.expected)) fail('编辑稿已发生变化，请重新查看后继续。');
    const fields = { ...draft };
    for (const key of ['body', 'name', 'dependencies'] as const) {
      if (Object.prototype.hasOwnProperty.call(changes, key)) Object.assign(fields, { [key]: changes[key] });
    }
    validateFields(fields);
    if (changes.name !== undefined) projectPolicy?.assertDraftName(state, draft, changes.name);
    if (same(snapshot(draft), snapshot(fields))) return clone(draft);
    if (options?.remember) {
      next.editHistory ??= { version: 1, entries: [] };
      let history = historyFor(next, id);
      if (!history) { history = { draftId: id, past: [], future: [] }; next.editHistory.entries.push(history); }
      history.past.push(snapshot(draft));
      if (history.past.length > MAX_HISTORY) history.past.shift();
      history.future = [];
    } else if (next.editHistory) {
      next.editHistory.entries = next.editHistory.entries.filter(entry => entry.draftId !== id);
    }
    Object.assign(draft, clone(fields));
    projectPolicy?.normalize(state, next);
    commit(next);
    return clone(next.drafts.find(item => item.id === id)!);
  }
  function travelDraft(id: string, direction: 'undo' | 'redo', expected: Draft): Draft {
    const next = clone(state);
    const draft = next.drafts.find(item => item.id === id);
    if (!draft) fail('找不到编辑稿。');
    if (!same(draft, expected)) fail('编辑稿已发生变化，请重新查看后继续。');
    const history = historyFor(next, id);
    const from = direction === 'undo' ? history?.past : history?.future;
    const to = direction === 'undo' ? history?.future : history?.past;
    const target = from?.at(-1);
    if (!target || !to) return clone(draft);
    const beforeTravel = snapshot(draft);
    validateFields({ ...draft, ...target });
    const changedDrafts = new Set([id]);
    if (target.transactionId) {
      const journal = next.transactionHistory?.entries.find(item => item.id === target.transactionId && item.anchorDraftId === id);
      if (!journal) fail('找不到这次联合应用的完整撤销记录。');
      for (const saved of journal.protectedUses ?? []) if (!same(next.contents.find(item => item.id === saved.id), saved)) {
        fail('相关作品已另行保存或继续修改，不能用旧撤销改变它；当前保存和编辑稿均已保留。');
      }
      const currentAnchor = direction === 'undo' ? journal.anchorAfter : journal.anchorBefore;
      const desiredAnchor = direction === 'undo' ? journal.anchorBefore : journal.anchorAfter;
      if (!same(snapshot(draft), snapshot(currentAnchor))) fail('联合应用的编辑内容已变化，无法安全恢复。');
      const reclaimable = new Set<string>();
      function restorePatches<T extends ContentRecord | Draft>(records: T[], patches: RecordPatch<T>[], isDraft: boolean): void {
        for (const patch of patches) {
          const current = direction === 'undo' ? patch.after : patch.before;
          const desired = direction === 'undo' ? patch.before : patch.after;
          const recordId = current?.id ?? desired!.id;
          if (isDraft && recordId === id) continue;
          const index = records.findIndex(item => item.id === recordId);
          if (!isDraft && patch.before === null) {
            if (direction === 'undo') {
              if (index < 0) fail('联合应用产生的素材已被移除，无法安全恢复。');
              // A later save may legitimately publish this fork elsewhere. Keep
              // those copies (and later-edited forks) while undoing the draft.
              if (same(records[index], current)) reclaimable.add(recordId);
              continue;
            }
            // Redo may reuse a fork retained for a subsequently saved work.
            if (index >= 0 && same(records[index], desired)) continue;
          }
          if (current ? index < 0 || !same(records[index], current) : index >= 0) fail('联合应用涉及的其他位置已变化，无法安全撤销或重做。');
          if (desired) {
            if (index < 0) records.push(clone(desired)); else records[index] = clone(desired);
          } else records.splice(index, 1);
          if (isDraft) {
            changedDrafts.add(recordId);
            if (next.editHistory) next.editHistory.entries = next.editHistory.entries.filter(entry => entry.draftId !== recordId);
          }
        }
      }
      restorePatches(next.contents, journal.contents, false);
      restorePatches(next.drafts, journal.drafts, true);
      // Saving the anchor later may change its source identity. Undo edits its
      // musical fields and workflow context, never rolls that saved identity back.
      if (desiredAnchor.editingContext === undefined) delete draft.editingContext;
      else draft.editingContext = clone(desiredAnchor.editingContext);
      Object.assign(draft, clone({ name: target.name, dependencies: target.dependencies, body: target.body }));
      if (direction === 'undo' && reclaimable.size) {
        const retained = new Set<string>();
        const references = (dependencies: string[]) => { for (const dependency of dependencies) retained.add(dependency); };
        for (const content of next.contents) if (!reclaimable.has(content.id)) references(content.dependencies);
        for (const item of next.drafts) {
          references(item.dependencies);
          if (item.sourceId) retained.add(item.sourceId);
        }
        // Independent ordinary history cannot recreate a missing fork. Composite
        // history can, so its own redo marker does not pin all generated records.
        for (const entry of next.editHistory?.entries ?? []) {
          // This anchor's later ordinary redo steps follow the composite redo,
          // which recreates the dependencies before those steps are reached.
          if (entry.draftId === id) continue;
          for (const step of [...entry.past, ...entry.future]) if (!step.transactionId) references(step.dependencies);
        }
        let growing = true;
        while (growing) {
          growing = false;
          for (const item of next.contents) if (retained.has(item.id)) {
            for (const dependency of item.dependencies) if (!retained.has(dependency)) { retained.add(dependency); growing = true; }
          }
        }
        next.contents = next.contents.filter(item => !reclaimable.has(item.id) || retained.has(item.id));
      }
    }
    from!.pop(); to.push({ ...beforeTravel, ...(target.transactionId ? { transactionId: target.transactionId } : {}) });
    if (to.length > MAX_HISTORY) to.shift();
    Object.assign(draft, clone({ name: target.name, dependencies: target.dependencies, body: target.body }));
    if (!target.transactionId) projectPolicy?.normalize(state, next);
    if (target.transactionId) {
      projectPolicy?.assertRestoredNames(state, next);
      checkCandidate(next, changedDrafts);
    }
    commit(next);
    return clone(next.drafts.find(item => item.id === id)!);
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
      // The production song policy saves one use in place and protects multiple
      // uses by forking. The generic low-level store retains its explicit-impact
      // confirmation API for non-musical consumers and legacy import tools.
      if (options?.project) {
        const count = countUsagePositions(state.contents, state.drafts, options.project.adapters).get(source.id) ?? 0;
        if (count > 1) mode = 'new';
      }
      const impact = affected(state.contents, state.drafts, source.id);
      // Include exact draft snapshots: they have no saved revision, but changing
      // their references or content must invalidate a previously shown warning.
      // The replacement draft is included so confirmation also matches this edit.
      const impactToken = JSON.stringify({
        source: [source.id, source.revision], replacement: draft,
        contents: impact.contents.map(item => [item.id, item.revision]).sort((a, b) => String(a[0]).localeCompare(String(b[0]))),
        drafts: [...impact.drafts].sort((a, b) => a.id.localeCompare(b.id)),
      });
      if (!options?.project && (impact.contents.length || impact.drafts.length)
        && (confirmation?.expectedRevision !== source.revision || confirmation.impactToken !== impactToken)) {
        return { status: 'needs-confirmation', affectedContent: clone(impact.contents), affectedDrafts: clone(impact.drafts),
          confirmation: { expectedRevision: source.revision, impactToken } };
      }
    }
    const { id: draftId, sourceId: _sourceId, baseRevision: _baseRevision, editingContext: _editingContext, projectRootId: _projectRootId, ...fields } = draft;
    const content: ContentRecord = { ...clone(fields), id: mode === 'overwrite' && source ? source.id : crypto.randomUUID(),
      revision: mode === 'overwrite' && source ? source.revision + 1 : 1 };
    try { validateDependencies(state.contents, content); }
    catch (error) { return { status: 'conflict', reason: String(error) }; }
    const next = clone(state);
    const index = next.contents.findIndex(item => item.id === content.id);
    if (index < 0) next.contents.push(content); else next.contents[index] = content;
    const savedDraft: Draft = { ...clone(fields), id: draftId, sourceId: content.id, baseRevision: content.revision,
      ...(draft.projectRootId === undefined ? {} : { projectRootId: draft.projectRootId }),
      ...(draft.editingContext !== undefined ? { editingContext: clone(draft.editingContext) } : {}) };
    next.drafts[next.drafts.findIndex(item => item.id === draftId)] = savedDraft;
    try { projectPolicy?.normalize(state, next); checkCandidate(next, new Set([draft.id])); }
    catch (error) { return { status: 'conflict', reason: String(error) }; }
    try { commit(next); } catch (error) { return { status: 'storage-error', message: String(error) }; }
    return { status: 'saved', content: clone(next.contents.find(item => item.id === content.id)!), draft: clone(next.drafts.find(item => item.id === draftId)!) };
  }
  function projectScopeOf(reference: { type: 'draft' | 'content'; id: string }, visited = new Set<string>()): string | undefined {
    const identity = `${reference.type}:${reference.id}`; if (visited.has(identity)) return undefined; visited.add(identity);
    const root = state.projectScopes?.roots.find(item => item.type === reference.type && item.id === reference.id);
    if (root) return root.scopeId;
    if (reference.type === 'content') return state.projectScopes?.contents.find(item => item.id === reference.id)?.scopeId;
    const draft = state.drafts.find(item => item.id === reference.id); if (!draft) return undefined;
    if (draft.projectRootId) return projectScopeOf({ type: 'draft', id: draft.projectRootId }, visited);
    const context = draft.editingContext;
    if (isObject(context) && context.format === 'RootSoundReferenceEdit' && isObject(context.context) && isObject(context.context.root)) {
      const parent = context.context.root;
      if ((parent.type === 'draft' || parent.type === 'content') && typeof parent.id === 'string') {
        const inherited = projectScopeOf({ type: parent.type, id: parent.id }, visited); if (inherited) return inherited;
      }
    }
    return draft.sourceId ? projectScopeOf({ type: 'content', id: draft.sourceId }, visited) : undefined;
  }
  function currentProjectView(draftId: string): CurrentProjectView | undefined {
    const focus = state.drafts.find(item => item.id === draftId); if (!focus) return undefined;
    const rootKind = options?.project?.rootKind ?? 'rootsound.song';
    const scopeId = projectScopeOf({ type: 'draft', id: focus.id });
    const project = focus.kind === rootKind ? focus : scopeId
      ? state.drafts.filter(item => item.kind === rootKind && projectScopeOf({ type: 'draft', id: item.id }) === scopeId).at(-1)
        ?? state.contents.find(item => item.kind === rootKind && projectScopeOf({ type: 'content', id: item.id }) === scopeId)
      : undefined;
    if (!project) return undefined;
    const memberIds = state.projectScopes?.members?.filter(item => item.scopeId === scopeId
      && state.contents.some(record => record.id === item.id)).map(item => item.id) ?? [];
    const records = new Map(state.contents.map(item => [item.id, item]));
    const work = new Map<string, Draft[]>();
    for (const draft of state.drafts) {
      if (!draft.sourceId || draft.kind === rootKind) continue;
      const candidates = work.get(draft.sourceId) ?? []; candidates.push(draft); work.set(draft.sourceId, candidates);
    }
    const unpublished = state.drafts.filter(draft => !draft.sourceId && !!draft.projectRootId
      && projectScopeOf({ type: 'draft', id: draft.id }) === scopeId);
    const contents: CurrentProjectView['contents'] = []; const drafts: Draft[] = [...('revision' in project ? [] : [project]), ...unpublished];
    const reached = new Set<string>(); const pending = [...project.dependencies, ...memberIds, ...unpublished.flatMap(draft => draft.dependencies)];
    if ('revision' in project) { const { body: _body, ...info } = project; contents.push(info); }
    while (pending.length) {
      const id = pending.pop()!; if (reached.has(id) || id === project.id || 'sourceId' in project && id === project.sourceId) continue;
      reached.add(id); const record = records.get(id); if (!record) continue;
      const candidates = [...(work.get(id) ?? [])];
      if (focus.sourceId === id) { const index = candidates.findIndex(item => item.id === focus.id); if (index >= 0) candidates.push(...candidates.splice(index, 1)); }
      // Compare only bodies reached by this document, never unrelated source
      // audio. Stale/clean recovery views cannot multiply an entity's card.
      const draft = candidates.reverse().find(item => item.baseRevision === record.revision
        && (item.name !== record.name || !same(item.body, record.body) || !same(item.dependencies, record.dependencies)));
      if (draft) { drafts.push(draft); pending.push(...draft.dependencies); }
      else { const { body: _body, ...info } = record; contents.push(info); pending.push(...record.dependencies); }
    }
    return clone({ project, contents, drafts, memberIds });
  }
  return {
    createDraft, updateDraft, saveDraft, travelDraft, commitTransaction, currentToken: () => token,
    readDraftHistory(id) {
      const history = historyFor(state, id);
      const plain = (step: HistoryStep): DraftSnapshot => ({ name: step.name, dependencies: step.dependencies, body: step.body,
        ...(step.transactionId ? { transactionId: step.transactionId } : {}) });
      return clone({ past: (history?.past ?? []).map(plain), future: (history?.future ?? []).map(plain) });
    },
    duplicateContent(id, name, expectedRevision) {
      const source = state.contents.find(item => item.id === id);
      if (!source) return { status: 'conflict', reason: '找不到要另存的素材。' };
      if (expectedRevision !== undefined && source.revision !== expectedRevision) return {
        status: 'conflict', reason: '素材已发生变化，请重新查看后另存。', actualRevision: source.revision,
      };
      const title = (name ?? `${source.name} 副本`).trim();
      if (!title) return { status: 'conflict', reason: '请给副本起一个名字。' };
      const content: ContentRecord = { ...clone(source), id: crypto.randomUUID(), name: title, revision: 1 };
      const scopeId = projectScopeOf({ type: 'content', id: source.id });
      try { validateDependencies(state.contents, content); }
      catch (error) { return { status: 'conflict', reason: String(error) }; }
      if (name !== undefined && !scopeId) try { projectPolicy?.assertPublicName(state, content, title); }
      catch (error) { return { status: 'conflict', reason: String(error) }; }
      const { revision, ...fields } = content;
      const draft: Draft = { ...clone(fields), id: crypto.randomUUID(), sourceId: content.id, baseRevision: revision };
      const next = clone(state); next.contents.push(content); next.drafts.push(draft);
      if (scopeId && source.kind !== options?.project?.rootKind) {
        next.projectScopes ??= { version: 1, roots: [], contents: [] };
        next.projectScopes.contents.push({ id: content.id, scopeId });
        next.projectScopes.members ??= []; next.projectScopes.members.push({ id: content.id, scopeId });
      }
      try { projectPolicy?.normalize(state, next); }
      catch (error) { return { status: 'conflict', reason: String(error) }; }
      try { commit(next); } catch (error) { return { status: 'storage-error', message: String(error) }; }
      return { status: 'saved', content: clone(next.contents.find(item => item.id === content.id)!), draft: clone(next.drafts.find(item => item.id === draft.id)!) };
    },
    readDraft: id => clone(state.drafts.find(item => item.id === id) ?? null) ?? undefined,
    listDrafts: () => clone(state.drafts),
    readContent: id => clone(state.contents.find(item => item.id === id) ?? null) ?? undefined,
    readContentInfo: id => {
      const record = state.contents.find(item => item.id === id);
      if (!record) return undefined;
      const { body: _body, ...info } = record;
      return clone(info);
    },
    listContentInfo: () => state.contents.map(({ body: _body, ...info }) => clone(info)),
    projectScopeOf, currentProjectView,
    listContentInfoForDraft(draftId) {
      const scopeId = projectScopeOf({ type: 'draft', id: draftId });
      const project = currentProjectView(draftId);
      const currentIds = new Set(project ? [...project.contents.map(item => item.id), ...project.drafts.flatMap(item => item.sourceId ? [item.sourceId] : [])] : []);
      const present = new Set(state.contents.map(item => item.id));
      const adopted = new Set(state.projectScopes?.imports?.filter(item => item.scopeId === scopeId && present.has(item.localId)).map(item => item.sourceId) ?? []);
      return state.contents.filter(item => {
        const owner = projectScopeOf({ type: 'content', id: item.id });
        return (owner === scopeId && (!project || currentIds.has(item.id))) || !owner && !adopted.has(item.id);
      }).map(({ body: _body, ...info }) => clone(info));
    },
    listContent: () => clone(state.contents),
  };
}
