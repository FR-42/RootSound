import type { ContentRecord, Draft, JsonValue } from '../../contracts/content.ts';
import type { ReferenceAdapter } from '../../contracts/references.ts';
import { copyJson, sameJson } from './json-value.ts';

export type ProjectPolicy = { rootKind: string; adapters: ReferenceAdapter[] };
export type ProjectScopes = {
  version: 1;
  roots: { type: 'content' | 'draft'; id: string; scopeId: string }[];
  /** Retained identities also cover material temporarily removed by undo. */
  contents: { id: string; scopeId: string }[];
  imports?: { scopeId: string; sourceId: string; sourceRevision: number; graphToken: string; localId: string }[];
  /** Assets explicitly retained by a project, never inferred from undo custody. */
  members?: { id: string; scopeId: string }[];
};
export type ProjectState = { contents: ContentRecord[]; drafts: Draft[]; projectScopes?: ProjectScopes };
const same = sameJson;
const clone = copyJson;
const key = (kind: string, name: string): string => JSON.stringify([kind, name.trim().normalize('NFC').toLocaleLowerCase('en-US')]);
function fail(message: string): never { throw new Error(`歌曲素材：${message}`); }

export function validateProjectScopes(value: unknown): void {
  if (value === undefined) return;
  if (!value || typeof value !== 'object') fail('工程归属记录无效，原数据已保留。');
  const scopes = value as ProjectScopes;
  if (scopes.version !== 1 || !Array.isArray(scopes.roots) || !Array.isArray(scopes.contents)) fail('工程归属版本无效，原数据已保留。');
  for (const [items, roots] of [[scopes.roots, true], [scopes.contents, false]] as const) {
    const seen = new Set<string>();
    for (const item of items) {
      if (!item || typeof item.id !== 'string' || !item.id || typeof item.scopeId !== 'string' || !item.scopeId
        || roots && (!('type' in item) || !['draft', 'content'].includes(String(item.type)))) fail('工程归属标识无效，原数据已保留。');
      const identity = roots ? `${'type' in item ? item.type : ''}:${item.id}` : item.id;
      if (seen.has(identity)) fail('工程归属标识重复，原数据已保留。');
      seen.add(identity);
    }
  }
  if (scopes.imports !== undefined) {
    if (!Array.isArray(scopes.imports)) fail('工程素材采用记录无效。');
    for (const item of scopes.imports) if (!item || !['scopeId', 'sourceId', 'graphToken', 'localId'].every(field =>
      typeof item[field as keyof typeof item] === 'string' && !!item[field as keyof typeof item])
      || !Number.isSafeInteger(item.sourceRevision) || item.sourceRevision < 1) fail('工程素材采用标识无效。');
  }
  if (scopes.members !== undefined) {
    if (!Array.isArray(scopes.members)) fail('工程素材成员列表无效。');
    const seen = new Set<string>();
    for (const item of scopes.members) {
      if (!item || typeof item.id !== 'string' || !item.id || typeof item.scopeId !== 'string' || !item.scopeId
        || seen.has(`${item.scopeId}:${item.id}`)) fail('工程素材成员标识无效。');
      seen.add(`${item.scopeId}:${item.id}`);
    }
  }
}

/** Owns graph identity and names only. Musical owners alone rewrite their slots. */
export function createProjectScopePolicy(policy: ProjectPolicy) {
  const adapters = new Map(policy.adapters.map(adapter => [adapter.kind, adapter]));
  if (adapters.size !== policy.adapters.length || !adapters.has(policy.rootKind)) fail('工程素材解释器配置无效。');
  const owner = (record: ContentRecord | Draft) => adapters.get(record.kind) ?? fail(`尚不能独立复制 ${record.kind} 类型的素材。`);
  function closure(root: ContentRecord | Draft, contents: Map<string, ContentRecord>): ContentRecord[] {
    const result: ContentRecord[] = []; const seen = new Set<string>(); const visiting = new Set<string>();
    function visit(record: ContentRecord | Draft, include: boolean): void {
      if (visiting.has(record.id)) fail('工程中存在循环引用。');
      if (include && seen.has(record.id)) return;
      visiting.add(record.id);
      const adapter = owner(record); const slots = adapter.slots(record);
      const actual = new Set(slots.map(slot => slot.targetId));
      if (actual.size !== record.dependencies.length || record.dependencies.some(id => !actual.has(id))) fail('素材引用与依赖列表不一致。');
      for (const slot of slots) {
        const child = contents.get(slot.targetId) ?? fail('工程缺少引用的素材，原稿已保留。');
        adapter.validateTarget?.(record, slot.id, child); visit(child, true);
      }
      visiting.delete(record.id);
      if (include) { seen.add(record.id); result.push(record as ContentRecord); }
    }
    visit(root, false); return result;
  }
  function roots(state: ProjectState): { type: 'content' | 'draft'; record: ContentRecord | Draft }[] {
    const scopeByContent = new Map(state.projectScopes?.contents.map(item => [item.id, item.scopeId]) ?? []);
    const boundDrafts = new Set(state.projectScopes?.roots.filter(item => item.type === 'draft').map(item => item.id) ?? []);
    function belongs(draft: Draft, seen = new Set<string>()): boolean {
      if (seen.has(draft.id)) return false; seen.add(draft.id);
      if (draft.projectRootId || draft.kind === policy.rootKind || boundDrafts.has(draft.id) || draft.sourceId && scopeByContent.has(draft.sourceId)) return true;
      const value = draft.editingContext;
      if (!value || typeof value !== 'object' || Array.isArray(value) || value.format !== 'RootSoundReferenceEdit') return false;
      const nested = value.context; if (!nested || typeof nested !== 'object' || Array.isArray(nested)) return false;
      const root = nested.root; if (!root || typeof root !== 'object' || Array.isArray(root) || typeof root.id !== 'string') return false;
      return root.type === 'draft' ? !!state.drafts.find(item => item.id === root.id && belongs(item, seen))
        : state.contents.some(item => item.id === root.id && item.kind === policy.rootKind);
    }
    const published = new Set(state.drafts.filter(draft => draft.projectRootId && draft.sourceId).map(draft => draft.sourceId));
    return [...state.contents.filter(item => item.kind === policy.rootKind || published.has(item.id)).map(record => ({ type: 'content' as const, record })),
      ...state.drafts.filter(item => belongs(item)).map(record => ({ type: 'draft' as const, record }))];
  }
  function assertDraftName(state: ProjectState, draft: Draft, name: string): void {
    if (key(draft.kind, name) === key(draft.kind, draft.name)) return;
    assertPublicName(state, draft, name);
    const contents = new Map(state.contents.map(record => [record.id, record]));
    let contextRoot: Draft | ContentRecord = draft.projectRootId ? state.drafts.find(item => item.id === draft.projectRootId)! : draft; const visited = new Set<string>();
    while (contextRoot && !visited.has(contextRoot.id)) {
      visited.add(contextRoot.id);
      const context: JsonValue | undefined = 'editingContext' in contextRoot ? contextRoot.editingContext : undefined;
      if (!context || typeof context !== 'object' || Array.isArray(context) || context.format !== 'RootSoundReferenceEdit') break;
      const nested: JsonValue | undefined = context.context;
      if (!nested || typeof nested !== 'object' || Array.isArray(nested)) break;
      const root: JsonValue | undefined = nested.root;
      if (!root || typeof root !== 'object' || Array.isArray(root) || typeof root.id !== 'string') break;
      const parent: ContentRecord | Draft | undefined = root.type === 'draft' ? state.drafts.find(item => item.id === root.id) : contents.get(root.id);
      if (!parent) break; contextRoot = parent;
    }
    const scopeId = state.projectScopes?.contents.find(item => item.id === draft.sourceId)?.scopeId
      ?? state.projectScopes?.roots.find(item => item.type === 'draft' && item.id === draft.projectRootId)?.scopeId;
    const candidates = contextRoot.kind === policy.rootKind ? [{ record: contextRoot }] : roots(state).filter(({ type, record }) => {
      const binding = state.projectScopes?.roots.find(item => item.type === type && item.id === record.id);
      if (scopeId) return binding?.scopeId === scopeId;
      return !!draft.sourceId && closure(record, contents).some(item => item.id === draft.sourceId);
    });
    const candidateScopes = new Set(candidates.flatMap(({ record }) => state.projectScopes?.roots.filter(item => item.id === record.id).map(item => item.scopeId) ?? []));
    if (scopeId) candidateScopes.add(scopeId);
    const occupied = new Map(candidates.flatMap(({ record }) => closure(record, contents)).map(record => [record.id, record]));
    for (const assignment of state.projectScopes?.contents ?? []) if (candidateScopes.has(assignment.scopeId)) {
      const record = contents.get(assignment.id); if (record) occupied.set(record.id, record);
    }
    for (const other of occupied.values()) {
      if (other.id !== draft.sourceId && other.id !== draft.id && key(other.kind, other.name) === key(draft.kind, name)) {
        fail(`这首歌曲已经有同类素材“${other.name}”，请换一个名称。你的修改仍然保留。`);
      }
    }
    for (const other of state.drafts) {
      if (other.id === draft.id || other.sourceId && other.sourceId === draft.sourceId) continue;
      const otherScope = state.projectScopes?.roots.find(item => item.type === 'draft' && item.id === other.id)?.scopeId;
      if (otherScope && candidateScopes.has(otherScope) && key(other.kind, other.name) === key(draft.kind, name)) {
        fail(`这首歌曲已经有同类编辑稿“${other.name}”，请换一个名称。你的修改仍然保留。`);
      }
    }
  }
  function isPublic(state: ProjectState, record: ContentRecord | Draft): boolean {
    if (record.kind === policy.rootKind) return false;
    if ('revision' in record) return !state.projectScopes?.contents.some(item => item.id === record.id);
    if (record.projectRootId) return false;
    return !state.projectScopes?.roots.some(item => item.type === 'draft' && item.id === record.id)
      && (!record.sourceId || !state.projectScopes?.contents.some(item => item.id === record.sourceId));
  }
  function assertPublicName(state: ProjectState, record: ContentRecord | Draft, name: string): void {
    if (!isPublic(state, record)) return;
    const identity = 'sourceId' in record && record.sourceId ? record.sourceId : record.id;
    for (const other of [...state.contents, ...state.drafts]) {
      const otherIdentity = 'sourceId' in other && other.sourceId ? other.sourceId : other.id;
      if (otherIdentity !== identity && isPublic(state, other) && key(other.kind, other.name) === key(record.kind, name)) {
        fail(`公共素材中已经有同类素材“${other.name}”，请换一个名称。你的修改仍然保留。`);
      }
    }
  }
  /** Explicit unpublished custody may never adopt material owned by another song. */
  function validateDraftOwnership(state: ProjectState): void {
    const contents = new Map(state.contents.map(record => [record.id, record]));
    for (const draft of state.drafts) {
      if (draft.projectRootId === undefined) continue;
      const root = state.drafts.find(item => item.id === draft.projectRootId);
      if (!root || root.id === draft.id || root.kind !== policy.rootKind || draft.kind === policy.rootKind) fail('编辑稿缺少有效的所属歌曲。');
      const scope = state.projectScopes?.roots.find(item => item.type === 'draft' && item.id === root.id)?.scopeId
        ?? state.projectScopes?.roots.find(item => item.type === 'content' && item.id === root.sourceId)?.scopeId ?? root.id;
      const recorded = state.projectScopes?.roots.find(item => item.type === 'draft' && item.id === draft.id)?.scopeId;
      if (recorded && recorded !== scope) fail('编辑稿的歌曲归属记录不一致。');
      for (const record of [...closure(draft, contents), ...(draft.sourceId && contents.has(draft.sourceId) ? [contents.get(draft.sourceId)!] : [])]) {
        const ownerScope = state.projectScopes?.contents.find(item => item.id === record.id)?.scopeId;
        if (ownerScope && ownerScope !== scope) fail('编辑稿不能引用另一首歌曲的素材。');
      }
    }
  }
  function normalize(before: ProjectState, next: ProjectState, exactNameIds = new Set<string>()): void {
    validateDraftOwnership(next);
    const oldContents = new Map(before.contents.map(record => [record.id, record]));
    const oldDrafts = new Map(before.drafts.map(record => [record.id, record]));
    const contents = new Map(next.contents.map(record => [record.id, record]));
    const scopes: ProjectScopes = clone(next.projectScopes ?? { version: 1, roots: [], contents: [] });
    const bindings = new Map(scopes.roots.map(item => [`${item.type}:${item.id}`, item.scopeId]));
    const ownership = new Map(scopes.contents.map(item => [item.id, item.scopeId]));
    for (const draft of next.drafts) if (draft.projectRootId) {
      const previous = oldDrafts.get(draft.id);
      if (previous?.projectRootId && previous.projectRootId !== draft.projectRootId) fail('编辑稿不能更换所属歌曲。');
      const root = next.drafts.find(item => item.id === draft.projectRootId)!;
      const scope = bindings.get(`draft:${root.id}`) ?? (root.sourceId ? bindings.get(`content:${root.sourceId}`) : undefined) ?? root.id;
      bindings.set(`draft:${root.id}`, scope); bindings.set(`draft:${draft.id}`, scope);
      if (draft.sourceId) {
        const source = contents.get(draft.sourceId); if (!source) fail('编辑稿来源不存在。');
        const existing = ownership.get(source.id); if (existing && existing !== scope) fail('编辑稿来源属于另一首歌曲。');
        if (!existing && oldContents.has(source.id)) fail('编辑稿来源尚未归属于当前歌曲。');
        ownership.set(source.id, scope); bindings.set(`content:${source.id}`, scope);
        scopes.members ??= [];
        if (!scopes.members.some(item => item.id === source.id && item.scopeId === scope)) scopes.members.push({ id: source.id, scopeId: scope });
      }
    }
    const adoptionKey = (scopeId: string, sourceId: string, graphToken: string) => JSON.stringify([scopeId, sourceId, graphToken]);
    const imports = new Map((scopes.imports ?? []).map(item => [adoptionKey(item.scopeId, item.sourceId, item.graphToken), item]));
    const graphTokens = new Map<string, string>();
    function graphToken(record: ContentRecord): string {
      const cached = graphTokens.get(record.id); if (cached) return cached;
      const identities = new Map<string, number>(); const pending = [record];
      while (pending.length) {
        const item = pending.pop()!; if (identities.has(item.id)) continue;
        identities.set(item.id, item.revision);
        for (const id of item.dependencies) pending.push(contents.get(id) ?? fail('采用的素材缺少依赖。'));
      }
      const token = JSON.stringify([...identities].sort((a, b) => a[0].localeCompare(b[0]))); graphTokens.set(record.id, token); return token;
    }
    const projectRoots = roots(next);
    for (const { type, record } of projectRoots.filter(item => item.type === 'content')) {
      const identity = `${type}:${record.id}`;
      if (bindings.has(identity)) continue;
      const saving = next.drafts.find(draft => draft.sourceId === record.id && oldDrafts.has(draft.id) && !oldDrafts.get(draft.id)!.sourceId);
      bindings.set(identity, saving ? bindings.get(`draft:${saving.id}`) ?? saving.id : record.id);
    }
    function draftScope(draft: Draft, seen = new Set<string>()): string | undefined {
      if (seen.has(draft.id)) return undefined; seen.add(draft.id);
      if (draft.kind === policy.rootKind) return draft.sourceId ? bindings.get(`content:${draft.sourceId}`) : bindings.get(`draft:${draft.id}`);
      if (draft.projectRootId) return bindings.get(`draft:${draft.projectRootId}`);
      const context = draft.editingContext;
      if (context && typeof context === 'object' && !Array.isArray(context) && context.format === 'RootSoundReferenceEdit') {
        const nested = context.context;
        if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
          const root = nested.root;
          if (root && typeof root === 'object' && !Array.isArray(root) && typeof root.id === 'string') {
            if (root.type === 'content') return bindings.get(`content:${root.id}`) ?? ownership.get(root.id);
            const parent = next.drafts.find(item => item.id === root.id);
            if (parent) return draftScope(parent, seen) ?? bindings.get(`draft:${parent.id}`);
          }
        }
      }
      return draft.sourceId ? ownership.get(draft.sourceId) : bindings.get(`draft:${draft.id}`);
    }
    for (const { type, record } of projectRoots.filter(item => item.type === 'draft')) {
      const draft = record as Draft;
      const scope = draftScope(draft);
      bindings.set(`${type}:${record.id}`, scope ?? bindings.get(`${type}:${record.id}`) ?? record.id);
    }
    // A direct overwrite of an old shared item cannot be made project-local
    // without an occurrence. Refuse instead of silently changing two songs.
    for (const record of next.contents) {
      const previous = oldContents.get(record.id);
      if (!previous || same(previous, record) || record.kind === policy.rootKind) continue;
      const users = new Set(roots(before).filter(({ record: root }) => closure(root, oldContents).some(item => item.id === record.id))
        .map(({ type, record: root }) => bindings.get(`${type}:${root.id}`) ?? root.id));
      if (users.size > 1) fail('这份旧素材仍被多首歌曲共用。请从歌曲中的具体位置修改，系统会为该歌曲保留独立版本。');
    }
    const processed = new Map<string, Map<string, ContentRecord>>();
    const scopeNames = new Map<string, Map<string, string>>();
    // A project namespace includes retained selectable materials, not just the
    // saved or current arrangement's immediate graph.
    for (const [id, scopeId] of ownership) {
      const record = contents.get(id); if (!record) continue;
      const names = scopeNames.get(scopeId) ?? new Map<string, string>(); scopeNames.set(scopeId, names);
      const nameKey = key(record.kind, record.name); const other = names.get(nameKey);
      if (other && other !== id) fail(`这首歌曲已经有同类素材“${record.name}”，请换一个名称。`);
      names.set(nameKey, id);
    }
    for (const draft of next.drafts.filter(item => item.projectRootId)) {
      const scopeId = bindings.get(`draft:${draft.id}`)!;
      const names = scopeNames.get(scopeId) ?? new Map<string, string>(); scopeNames.set(scopeId, names);
      const identity = draft.sourceId ?? draft.id; const proposed = draft.name.trim(); let name = proposed; let suffix = 2;
      const previous = oldDrafts.get(draft.id); const manual = previous && key(draft.kind, previous.name) !== key(draft.kind, proposed);
      const conflicts = () => names.has(key(draft.kind, name)) && names.get(key(draft.kind, name)) !== identity;
      if (conflicts() && (manual || exactNameIds.has(draft.id))) fail(`这首歌曲已经有同类素材“${proposed}”，请换一个名称。`);
      while (conflicts()) name = `${proposed} ${suffix++}`;
      draft.name = name; names.set(key(draft.kind, name), identity);
    }
    for (const { type, record: root } of projectRoots) {
      const previous = type === 'draft' ? oldDrafts.get(root.id) : oldContents.get(root.id);
      const dependencies = closure(root, contents);
      const touched = !previous || !same(previous, root) || dependencies.some(record => !same(record, oldContents.get(record.id)));
      if (!touched) continue;
      const scopeId = bindings.get(`${type}:${root.id}`)!;
      const mapped = processed.get(scopeId) ?? new Map<string, ContentRecord>(); processed.set(scopeId, mapped);
      const names = scopeNames.get(scopeId) ?? new Map<string, string>(); scopeNames.set(scopeId, names);
      // Previously local identities keep their names; additions and copies get
      // a suffix when needed. Repeated references to one identity reserve once.
      for (const record of dependencies) if (ownership.get(record.id) === scopeId && oldContents.has(record.id)) {
        const nameKey = key(record.kind, record.name); const other = names.get(nameKey);
        if (other && other !== record.id) fail(`这首歌曲已经有同类素材“${record.name}”，请换一个名称。`);
        names.set(nameKey, record.id);
      }
      function visit(record: ContentRecord): ContentRecord {
        const cached = mapped.get(record.id);
        if (cached) {
          const nameKey = key(cached.kind, cached.name); const other = names.get(nameKey);
          if (other && other !== cached.id) fail(`这首歌曲中的“${cached.name}”需要使用不同名称。`);
          names.set(nameKey, cached.id); return cached;
        }
        const local = ownership.get(record.id) === scopeId;
        const external = !local && (oldContents.has(record.id) || ownership.has(record.id));
        const originToken = external ? graphToken(record) : undefined;
        if (originToken) {
          const adopted = imports.get(adoptionKey(scopeId, record.id, originToken)); const existing = adopted ? contents.get(adopted.localId) : undefined;
          if (existing && ownership.get(existing.id) === scopeId) {
            mapped.set(record.id, existing); names.set(key(existing.kind, existing.name), existing.id); return existing;
          }
        }
        const identity = external ? crypto.randomUUID() : record.id;
        const adapter = owner(record); const slots = adapter.slots(record);
        const children = slots.map(slot => ({ slotId: slot.id, targetId: visit(contents.get(slot.targetId)!).id }));
        const changes = adapter.replace(record, children);
        let name = record.name.trim(); let suffix = 2;
        if (exactNameIds.has(record.id) && names.has(key(record.kind, name)) && names.get(key(record.kind, name)) !== identity) {
          fail(`这首歌曲已经有同类素材“${name}”，请换一个名称。你的修改仍然保留。`);
        }
        while (names.has(key(record.kind, name)) && names.get(key(record.kind, name)) !== identity) name = `${record.name.trim()} ${suffix++}`;
        names.set(key(record.kind, name), identity);
        let result: ContentRecord = { ...clone(record), ...changes, id: identity, name,
          revision: external ? 1 : record.revision };
        if (!external && oldContents.has(identity) && !same(result, record) && result.revision === oldContents.get(identity)!.revision) {
          result = { ...result, revision: result.revision + 1 };
        }
        mapped.set(record.id, result); mapped.set(identity, result); ownership.set(identity, scopeId); contents.set(identity, result);
        if (originToken) imports.set(adoptionKey(scopeId, record.id, originToken), { scopeId, sourceId: record.id, sourceRevision: record.revision, graphToken: originToken, localId: identity });
        return result;
      }
      // Reserve local branches first even if an incoming clip appears earlier.
      for (const item of dependencies) if (ownership.get(item.id) === scopeId) visit(item);
      const replacements = owner(root).slots(root).map(slot => ({ slotId: slot.id, targetId: visit(contents.get(slot.targetId)!).id }));
      const updated = { ...root, ...owner(root).replace(root, replacements) };
      if (type === 'draft') next.drafts[next.drafts.findIndex(item => item.id === root.id)] = updated as Draft;
      else {
        const content = updated as ContentRecord;
        if (!same(content, root) && oldContents.get(root.id)?.revision === content.revision) content.revision++;
        contents.set(content.id, content); ownership.set(content.id, scopeId);
      }
      const finalGraph = closure(updated, contents); const finalNames = new Map<string, string>();
      for (const item of finalGraph) {
        const nameKey = key(item.kind, item.name); const existing = finalNames.get(nameKey);
        if (existing && existing !== item.id) fail(`这首歌曲已经有同类素材“${item.name}”。`);
        finalNames.set(nameKey, item.id);
      }
    }
    next.contents = [...contents.values()];
    scopes.roots = [...bindings].map(([identity, scopeId]) => {
      const split = identity.indexOf(':'); return { type: identity.slice(0, split) as 'content' | 'draft', id: identity.slice(split + 1), scopeId };
    });
    scopes.contents = [...ownership].map(([id, scopeId]) => ({ id, scopeId })); next.projectScopes = scopes;
    scopes.imports = [...imports.values()];
    // Unassigned starts have their own namespace. A saved identity and its
    // working drafts count once; each independent unsaved draft counts once.
    // Reserve unchanged legacy names without rewriting the library on read.
    const publicRecords = [...next.contents, ...next.drafts].filter(record => isPublic(next, record));
    const identityOf = (record: ContentRecord | Draft) => 'sourceId' in record && record.sourceId ? record.sourceId : record.id;
    const previousOf = (record: ContentRecord | Draft) => 'revision' in record ? oldContents.get(record.id) : oldDrafts.get(record.id);
    const stable = (record: ContentRecord | Draft) => {
      const previous = previousOf(record);
      return !!previous && isPublic(before, previous) && identityOf(previous) === identityOf(record)
        && key(previous.kind, previous.name) === key(record.kind, record.name);
    };
    const publicNames = new Map<string, Set<string>>();
    const reserve = (record: ContentRecord | Draft) => {
      const nameKey = key(record.kind, record.name); const identities = publicNames.get(nameKey) ?? new Set<string>();
      identities.add(identityOf(record)); publicNames.set(nameKey, identities);
    };
    const conflicts = (record: ContentRecord | Draft, name: string) => [...(publicNames.get(key(record.kind, name)) ?? [])]
      .some(id => id !== identityOf(record));
    for (const record of publicRecords.filter(stable)) reserve(record);
    for (const record of publicRecords.filter(record => !stable(record))) {
      const previous = previousOf(record);
      const manualRename = !!previous && identityOf(previous) === identityOf(record)
        && key(previous.kind, previous.name) !== key(record.kind, record.name);
      const originalName = record.name.trim(); let name = originalName; let suffix = 2;
      if (conflicts(record, name) && (manualRename || exactNameIds.has(record.id))) {
        fail(`公共素材中已经有同类素材“${name}”，请换一个名称。你的修改仍然保留。`);
      }
      while (conflicts(record, name)) name = `${originalName} ${suffix++}`;
      record.name = name;
      if ('revision' in record && name !== originalName) for (const draft of next.drafts) {
        if (draft.sourceId === record.id && draft.name.trim() === originalName) draft.name = name;
      }
      reserve(record);
    }
  }
  function assertRestoredNames(before: ProjectState, next: ProjectState): void {
    validateDraftOwnership(next);
    for (const draft of next.drafts.filter(item => item.projectRootId)) {
      const scope = next.projectScopes?.roots.find(item => item.type === 'draft' && item.id === draft.projectRootId)?.scopeId ?? draft.projectRootId;
      const identity = draft.sourceId ?? draft.id;
      for (const other of [...next.contents, ...next.drafts]) {
        const otherIdentity = 'revision' in other ? other.id : other.sourceId ?? other.id;
        const otherScope = 'revision' in other ? next.projectScopes?.contents.find(item => item.id === other.id)?.scopeId
          : next.projectScopes?.roots.find(item => item.type === 'draft' && item.id === other.id)?.scopeId
            ?? next.projectScopes?.contents.find(item => item.id === other.sourceId)?.scopeId;
        if (otherIdentity !== identity && otherScope === scope && key(other.kind, other.name) === key(draft.kind, draft.name)) {
          fail(`这首歌曲中“${draft.name}”的名称已被使用，请调整冲突名称后再重做。`);
        }
      }
    }
    const previous = new Map([...before.contents, ...before.drafts].map(record => [record.id, record]));
    for (const record of [...next.contents, ...next.drafts]) {
      const old = previous.get(record.id);
      const identity = 'sourceId' in record && record.sourceId ? record.sourceId : record.id;
      const oldIdentity = old && ('sourceId' in old && old.sourceId ? old.sourceId : old.id);
      if (old && identity === oldIdentity && key(old.kind, old.name) === key(record.kind, record.name)) continue;
      if (isPublic(next, record)) assertPublicName(next, record, record.name);
      else if ('revision' in record && record.kind !== policy.rootKind) {
        const scope = next.projectScopes?.contents.find(item => item.id === record.id)?.scopeId;
        if (scope && next.contents.some(other => other.id !== record.id && key(other.kind, other.name) === key(record.kind, record.name)
          && next.projectScopes?.contents.some(item => item.id === other.id && item.scopeId === scope))) {
          fail(`这首歌曲中“${record.name}”的名称已被使用，请调整冲突名称后再重做。`);
        }
      }
    }
  }
  return { normalize, assertDraftName, assertPublicName, assertRestoredNames, validateDraftOwnership };
}
