import type { ContentRecord, Draft, JsonValue, MaterialLibrary, MaterialTransaction } from '../../contracts/content.ts';
import type {
  ReferenceAdapter, ReferenceApplyResult, ReferenceContext, ReferenceEditingPort, ReferenceLocation,
  ReferenceLocations, ReferenceOperationResult, ReferenceReplacement, ReferenceRoot, ReferenceSession,
} from '../../contracts/references.ts';
import { countUsagePositions } from './usage-positions.ts';

type RecordValue = ContentRecord | Draft;
type SessionContext = {
  format: 'RootSoundReferenceEdit'; version: 1; target: ContentRecord;
  context?: ReferenceContext; rootSnapshot?: RecordValue; route: ContentRecord[];
  adopted: boolean; ownedContentIds: string[];
  pendingActions?: PendingAction[];
  /** Private nested forks may reuse a singly used identity only at the outer commit. */
  pendingReuses?: { target: ContentRecord; replacementId: string; name: string }[];
};
type Trace = { root: RecordValue; records: ContentRecord[]; labels: string[] };
type Candidate = { location: ReferenceLocation; root: RecordValue; records: ContentRecord[] };
type PendingAction = { target: ContentRecord; replacement: ContentRecord; candidates: Candidate[] };
type Instruction = { path: string[]; targetId: string; replacement: ContentRecord };

function clone<T>(value: T): T { return JSON.parse(JSON.stringify(value)) as T; }
function same(a: unknown, b: unknown): boolean { return JSON.stringify(a) === JSON.stringify(b); }
function asJson(value: unknown): JsonValue { return clone(value) as JsonValue; }
function fail(message: string): never { throw new Error(message); }
function isObject(value: unknown): value is Record<string, unknown> { return !!value && typeof value === 'object' && !Array.isArray(value); }
function rootKey(root: ReferenceRoot): string { return `${root.type}:${root.id}`; }
function locationId(context: ReferenceContext): string { return JSON.stringify([context.root.type, context.root.id, context.path]); }
function fields(record: RecordValue): Omit<ContentRecord, 'id' | 'revision'> {
  return { kind: record.kind, schemaVersion: record.schemaVersion, owner: record.owner, name: record.name,
    body: clone(record.body), dependencies: [...record.dependencies] };
}
function editableSame(draft: Draft, content: ContentRecord): boolean {
  return draft.kind === content.kind && draft.schemaVersion === content.schemaVersion && draft.owner === content.owner
    && draft.name === content.name && same(draft.body, content.body) && same(draft.dependencies, content.dependencies);
}

/** Opaque occurrence traversal and copy-on-write; musical body interpretation stays with owners. */
export function createReferenceEditing(library: MaterialLibrary, adapters: ReferenceAdapter[]): ReferenceEditingPort {
  const owners = new Map(adapters.map(adapter => [adapter.kind, adapter]));
  if (owners.size !== adapters.length) fail('同一种素材只能有一个引用解释器。');
  function adapter(record: RecordValue): ReferenceAdapter {
    return owners.get(record.kind) ?? fail('当前版本尚不能在这些素材中编辑引用，原内容已保留。');
  }
  function readRoot(root: ReferenceRoot): RecordValue {
    return (root.type === 'draft' ? library.readDraft(root.id) : library.readContent(root.id)) ?? fail('原来的使用位置已不存在。');
  }
  function readContext(draft: Draft): SessionContext | undefined {
    const raw = draft.editingContext;
    if (raw === undefined) return undefined;
    if (!isObject(raw) || raw.format !== 'RootSoundReferenceEdit' || raw.version !== 1 || !isObject(raw.target)
      || typeof raw.target.id !== 'string' || !Array.isArray(raw.route) || typeof raw.adopted !== 'boolean'
      || !Array.isArray(raw.ownedContentIds) || raw.ownedContentIds.some(id => typeof id !== 'string')) {
      return fail('这份引用编辑稿的上下文暂不支持，原内容已保留。');
    }
    const value = raw as unknown as SessionContext;
    if (value.context && (!isObject(value.context) || !isObject(value.context.root)
      || !['draft', 'content'].includes(value.context.root.type) || typeof value.context.root.id !== 'string'
      || !Array.isArray(value.context.path) || !value.context.path.length || value.context.path.some(id => typeof id !== 'string' || !id))) {
      return fail('这份编辑稿的原使用位置无效，原内容已保留。');
    }
    if (value.pendingActions !== undefined && (!Array.isArray(value.pendingActions) || value.pendingActions.some(action =>
      !isObject(action) || !isObject(action.target) || !isObject(action.replacement) || typeof action.replacement.id !== 'string' || !Array.isArray(action.candidates)))) {
      return fail('这份编辑稿的待应用位置无效，原内容已保留。');
    }
    if (value.pendingReuses !== undefined && (!Array.isArray(value.pendingReuses) || value.pendingReuses.some(item =>
      !isObject(item) || !isObject(item.target) || typeof item.target.id !== 'string'
      || typeof item.replacementId !== 'string' || typeof item.name !== 'string'))) {
      return fail('这份编辑稿的暂存保存信息无效，原内容已保留。');
    }
    adapter(value.target).slots(value.target);
    return clone(value);
  }
  function session(draftId: string): { draft: Draft; meta: SessionContext } {
    const draft = library.readDraft(draftId) ?? fail('找不到这份独立编辑稿。');
    const meta = readContext(draft) ?? fail('这份编辑稿没有引用编辑上下文。');
    if (draft.kind !== meta.target.kind || draft.owner !== meta.target.owner || draft.schemaVersion !== meta.target.schemaVersion) fail('编辑稿与原素材的类型不一致。');
    adapter(draft).slots(draft);
    return { draft, meta };
  }
  function trace(context: ReferenceContext): Trace {
    if (!context.path.length || context.path.length > 32) fail('请选择一个具体使用位置。');
    const root = readRoot(context.root); let value = root;
    const records: ContentRecord[] = []; const labels = [root.name]; const visited = new Set<string>();
    for (const id of context.path) {
      const slot = adapter(value).slots(value).find(item => item.id === id);
      if (!slot) fail('要编辑的位置已经改变，请重新打开。');
      if (visited.has(slot.targetId)) fail('素材引用出现循环，原内容已保留。');
      visited.add(slot.targetId);
      const content = library.readContent(slot.targetId) ?? fail('这个位置使用的素材已不存在。');
      adapter(content).slots(content);
      labels.push(slot.label, content.name); records.push(content); value = content;
    }
    return { root, records, labels };
  }
  function assertOrigin(meta: SessionContext): void {
    const target = library.readContent(meta.target.id);
    if (!target || !same(target, meta.target)) fail('原素材已发生变化，请重新打开这个位置；你的编辑稿已保留。');
    if (meta.context) {
      const now = trace(meta.context);
      if (!same(now.root, meta.rootSnapshot) || !same(now.records, meta.route)) fail('原使用位置已发生变化，请重新打开；你的编辑稿已保留。');
    }
  }
  function assertPending(action: PendingAction): void {
    if (!same(library.readContent(action.target.id), action.target)) fail('等待应用的原素材已改变；你的编辑稿和选择已保留。');
    const replacement = library.readContent(action.replacement.id) ?? fail('等待应用的声音已不存在，原编辑稿已保留。');
    if (!same(replacement, action.replacement)) fail('等待应用的声音已发生变化；你的编辑稿和选择已保留。');
    if (replacement.kind !== action.target.kind || replacement.owner !== action.target.owner || replacement.schemaVersion !== action.target.schemaVersion) fail('等待应用的素材类型不一致。');
    adapter(replacement).slots(replacement);
    for (const candidate of action.candidates) {
      const now = trace(candidate.location);
      if (!same(now.root, candidate.root) || !same(now.records, candidate.records)) fail('等待应用的使用位置已发生变化；你的编辑稿和选择已保留。');
    }
  }
  function ancestors(meta: SessionContext): ReferenceContext[] {
    const result: ReferenceContext[] = []; const seen = new Set<string>(); let current = meta;
    while (current.context?.root.type === 'draft') {
      if (seen.has(current.context.root.id)) fail('编辑上下文出现循环，原内容已保留。');
      seen.add(current.context.root.id);
      const parent = library.readDraft(current.context.root.id); if (!parent) break;
      const parentMeta = readContext(parent); if (!parentMeta) break;
      assertOrigin(parentMeta);
      if (parentMeta.context) result.push(clone(parentMeta.context));
      current = parentMeta;
    }
    return result;
  }
  function finishResult(result: ReturnType<MaterialLibrary['commitTransaction']>): ReferenceOperationResult {
    return result.status === 'committed' ? { status: 'done' } : result;
  }
  function describeSession(draftId: string, meta: SessionContext): ReferenceSession {
    const labels = [meta.rootSnapshot?.name ?? meta.target.name];
    if (meta.context && meta.rootSnapshot) {
      let record = meta.rootSnapshot;
      for (let index = 0; index < meta.context.path.length; index++) {
        const slot = adapter(record).slots(record).find(item => item.id === meta.context!.path[index]);
        const target = meta.route[index];
        if (slot) labels.push(slot.label);
        if (target) { labels.push(target.name); record = target; }
      }
    }
    return { draftId, targetId: meta.target.id, targetKind: meta.target.kind,
      ...(meta.context ? { context: clone(meta.context), rootKind: meta.rootSnapshot?.kind,
        labels } : { labels }),
      pendingApplyCount: new Set((meta.pendingActions ?? []).flatMap(action => action.candidates.map(item => item.location.id))).size };
  }
  function makeSession(content: ContentRecord, context?: ReferenceContext, adoptedDraft?: Draft): ReferenceSession {
    adapter(content).slots(content);
    const resolved = context ? trace(context) : undefined;
    if (resolved && resolved.records.at(-1)?.id !== content.id) fail('这个使用位置与原素材不一致。');
    const meta: SessionContext = { format: 'RootSoundReferenceEdit', version: 1, target: clone(content),
      ...(context ? { context: clone(context), rootSnapshot: clone(resolved!.root) } : {}),
      route: clone(resolved?.records ?? []), adopted: !!adoptedDraft, ownedContentIds: [] };
    const draft: Draft = adoptedDraft ? { ...clone(adoptedDraft), editingContext: asJson(meta) }
      : { ...fields(content), id: crypto.randomUUID(), sourceId: content.id, baseRevision: content.revision, editingContext: asJson(meta) };
    const token = library.currentToken();
    const result = library.commitTransaction({ expectedToken: token, label: '开始独立编辑',
      ...(adoptedDraft ? { replaceDrafts: [{ expected: adoptedDraft, replacement: draft }] } : { createDrafts: [draft] }) });
    if (result.status !== 'committed') fail(result.status === 'conflict' ? result.reason : result.message);
    return describeSession(draft.id, meta);
  }
  function collect(draft: Draft, meta: SessionContext): { public: ReferenceLocations; candidates: Candidate[] } {
    assertOrigin(meta);
    for (const action of meta.pendingActions ?? []) assertPending(action);
    const ancestorContexts = ancestors(meta);
    const contents = library.listContent(); const drafts = library.listDrafts();
    // Unpublished arrangements also use their phrases. Such phrases must never
    // be overwritten as apparent standalone roots behind an unselected draft.
    const incoming = new Set([...contents, ...drafts].flatMap(item => item.dependencies));
    const roots: ReferenceRoot[] = contents.filter(item => !incoming.has(item.id)).map(item => ({ type: 'content', id: item.id }));
    // A current editing view represents its saved version, avoiding two identical choices.
    for (const context of [...(meta.context ? [meta.context] : []), ...ancestorContexts]) {
      if (context.root.type !== 'draft') continue;
      const current = library.readDraft(context.root.id);
      if (current?.sourceId) {
        const index = roots.findIndex(item => item.type === 'content' && item.id === current.sourceId);
        if (index >= 0) roots.splice(index, 1);
      }
    }
    for (const item of drafts) {
      if (item.id === draft.id) continue;
      // Other active reference leaf drafts are not independent public usage roots.
      const itemContext = readContext(item);
      if (itemContext && meta.context?.root.id !== item.id && !item.dependencies.includes(meta.target.id)) continue;
      const source = item.sourceId ? library.readContent(item.sourceId) : undefined;
      if (!source || !editableSame(item, source) || meta.context?.root.type === 'draft' && meta.context.root.id === item.id) roots.push({ type: 'draft', id: item.id });
    }
    if (meta.context && !roots.some(root => rootKey(root) === rootKey(meta.context!.root))) roots.push(clone(meta.context.root));
    for (const context of ancestorContexts) if (!roots.some(root => rootKey(root) === rootKey(context.root))) roots.push(clone(context.root));
    const candidates: Candidate[] = [];
    function visit(rootRef: ReferenceRoot, root: RecordValue, value: RecordValue, path: string[], labels: string[], records: ContentRecord[], visited: Set<string>): void {
      if (path.length >= 32) return;
      let slots: ReturnType<ReferenceAdapter['slots']>;
      try { slots = adapter(value).slots(value); } catch { return; }
      for (const slot of slots) {
        const child = contents.find(item => item.id === slot.targetId); if (!child || visited.has(child.id)) continue;
        const childPath = [...path, slot.id]; const childLabels = [...labels, slot.label, child.name]; const childRecords = [...records, child];
        if (child.id === meta.target.id) {
          const context = { root: rootRef, path: childPath };
          // The containing temporary phrase already represents this occurrence.
          // Listing its original song path too would create two choices for one use.
          if (ancestorContexts.some(ancestor => rootKey(ancestor.root) === rootKey(rootRef)
            && ancestor.path.every((id, index) => childPath[index] === id))) continue;
          const current = !!meta.context && locationId(meta.context) === locationId(context);
          candidates.push({ location: { ...clone(context), id: locationId(context), labels: childLabels, current }, root, records: childRecords });
        } else visit(rootRef, root, child, childPath, childLabels, childRecords, new Set([...visited, child.id]));
      }
    }
    const uniqueRoots = new Map(roots.map(root => [rootKey(root), root]));
    for (const rootRef of uniqueRoots.values()) {
      const root = readRoot(rootRef); visit(rootRef, root, root, [], [root.name, ...(rootRef.type === 'draft' ? ['未保存编辑'] : [])], [], new Set());
    }
    candidates.sort((a, b) => Number(b.location.current) - Number(a.location.current) || a.location.id.localeCompare(b.location.id));
    const token = JSON.stringify({ target: meta.target,
      locations: candidates.map(item => ({ location: item.location, root: item.root, records: item.records })) });
    return { public: { token, locations: candidates.map(item => clone(item.location)) }, candidates };
  }
  function operationError(error: unknown): { status: 'conflict'; reason: string } {
    return { status: 'conflict', reason: error instanceof Error ? error.message : String(error) };
  }
  const api: ReferenceEditingPort = {
    begin(context) {
      const resolved = trace(context); return makeSession(resolved.records.at(-1)!, context);
    },
    beginLibrary(contentId, draftId) {
      const content = library.readContent(contentId) ?? fail('找不到要编辑的素材。');
      const draft = draftId ? library.readDraft(draftId) ?? fail('找不到当前编辑稿。') : undefined;
      if (draft) {
        const existing = readContext(draft);
        if (existing) {
          if (existing.target.id !== contentId) fail('当前编辑稿属于另一个素材。');
          return describeSession(draft.id, existing);
        }
        if (draft.sourceId !== contentId || draft.kind !== content.kind || draft.schemaVersion !== content.schemaVersion || draft.owner !== content.owner) fail('当前编辑稿与要编辑的素材不一致。');
        adapter(draft).slots(draft);
      }
      return makeSession(content, undefined, draft);
    },
    resume(draftId) {
      const draft = library.readDraft(draftId); if (!draft) return undefined;
      const meta = readContext(draft); if (!meta) return undefined;
      return describeSession(draftId, meta);
    },
    sessions() {
      return library.listDrafts().flatMap(draft => {
        const meta = readContext(draft);
        return meta ? [describeSession(draft.id, meta)] : [];
      });
    },
    locations(draftId) { const { draft, meta } = session(draftId); return collect(draft, meta).public; },
    apply(draftId, options = {}): ReferenceApplyResult {
      try {
        const { draft, meta } = session(draftId);
        if (library.listDrafts().some(item => {
          if (item.id === draft.id) return false;
          const child = readContext(item);
          return child?.context?.root.type === 'draft' && child.context.root.id === draft.id;
        })) return { status: 'conflict', reason: '请先完成或取消正在调整的声音，再保存这段乐句；所有修改均已保留。' };
        const { public: available, candidates } = collect(draft, meta);
        if (options.expectedToken !== undefined && options.expectedToken !== available.token) return { status: 'conflict', reason: '使用位置已发生变化，请重新选择；你的修改已保留。' };
        const selectedIds = options.locationIds ?? available.locations.filter(item => item.current).map(item => item.id);
        if (new Set(selectedIds).size !== selectedIds.length) return { status: 'conflict', reason: '使用位置不能重复选择。' };
        const selected = selectedIds.map(id => candidates.find(item => item.location.id === id) ?? fail('选中的使用位置已改变，请重新选择。'));
        if (meta.context && !selected.length) return { status: 'conflict', reason: '至少选择一个要应用的位置。' };
        if (meta.context && editableSame(draft, meta.target) && !meta.pendingActions?.length) {
          const cancelled = api.cancel(draftId);
          if (cancelled.status !== 'done') return cancelled;
          return { status: 'applied', content: clone(meta.target), roots: selected.map(item => clone(item.location.root)) };
        }
        const token = library.currentToken();
        const unchanged = editableSame(draft, meta.target);
        const uses = countUsagePositions(library.listContent(), library.listDrafts(), adapters);
        const parent = meta.context?.root.type === 'draft' ? library.readDraft(meta.context.root.id) : undefined;
        const parentMeta = parent ? readContext(parent) : undefined;
        if (parentMeta) assertOrigin(parentMeta);
        const created: ContentRecord[] = [];
        const replaceDrafts: NonNullable<MaterialTransaction['replaceDrafts']> = [];
        const replaceContents: NonNullable<MaterialTransaction['replaceContents']> = [];
        const pendingReuses: NonNullable<SessionContext['pendingReuses']> = clone(meta.pendingReuses ?? []);
        function rememberReuse(source: ContentRecord, replacementId: string, name: string): void {
          const earlier = [...(parentMeta?.pendingReuses ?? []), ...pendingReuses].find(item => item.replacementId === source.id);
          pendingReuses.push({ target: clone(earlier?.target ?? source), replacementId,
            name: earlier && name === source.name ? earlier.name : name });
        }
        function replaceSaved(source: ContentRecord, replacement: ContentRecord): void {
          const queued = replaceContents.find(item => item.expected.id === source.id);
          if (queued) {
            if (!same(queued.replacement, replacement)) fail('同一素材存在不同的待保存版本，原稿已保留。');
            return;
          }
          replaceContents.push({ expected: source, replacement });
          // A clean editor is another view of the same saved material.
          for (const open of library.listDrafts().filter(item => item.id !== draft.id && item.id !== parent?.id
            && item.sourceId === source.id && !item.editingContext && editableSame(item, source))) {
            if (!replaceDrafts.some(item => item.expected.id === open.id)) replaceDrafts.push({ expected: open,
              replacement: { ...open, ...fields(replacement), baseRevision: replacement.revision } });
          }
        }
        const reusable = new Map<string, NonNullable<SessionContext['pendingReuses']>[number]>();
        if (!parentMeta) for (const pending of pendingReuses) {
          if (!same(library.readContent(pending.target.id), pending.target)) fail('暂存修改的来源已变化，原稿已保留。');
          if ((uses.get(pending.target.id) ?? 0) <= 1 && (uses.get(pending.replacementId) ?? 0) === 0) reusable.set(pending.replacementId, pending);
        }
        const materialized = new Map<string, ContentRecord>();
        function materialize(record: ContentRecord): ContentRecord {
          const cached = materialized.get(record.id); if (cached) return cached;
          const reuse = reusable.get(record.id);
          const replacements = adapter(record).slots(record).map(slot => ({ slotId: slot.id,
            targetId: materialize(library.readContent(slot.targetId) ?? fail('暂存修改缺少依赖，原稿已保留。')).id }));
          const changes = adapter(record).replace(record, replacements);
          let result = { ...clone(record), ...changes };
          if (reuse) {
            result = { ...result, id: reuse.target.id, name: reuse.name, revision: reuse.target.revision + 1 };
            replaceSaved(reuse.target, result);
          } else if (!same(result, record)) {
            result.revision = record.revision + 1; replaceSaved(record, result);
          }
          materialized.set(record.id, result); return result;
        }
        const outgoing = !parentMeta && pendingReuses.length ? { ...draft, ...adapter(draft).replace(draft,
          adapter(draft).slots(draft).map(slot => ({ slotId: slot.id, targetId: materialize(library.readContent(slot.targetId)!).id }))) } : draft;
        const mayReuse = !parentMeta && (uses.get(meta.target.id) ?? 0) <= 1;
        const leaf: ContentRecord = meta.context && unchanged ? clone(meta.target)
          : { ...fields(outgoing), id: mayReuse ? meta.target.id : crypto.randomUUID(), revision: mayReuse ? meta.target.revision + 1 : 1 };
        adapter(leaf).slots(leaf);
        if (!same(leaf, meta.target)) {
          if (leaf.id === meta.target.id) replaceSaved(meta.target, leaf);
          else {
            created.push(leaf);
            if (parentMeta) rememberReuse(meta.target, leaf.id, draft.name);
          }
        }
        const roots = new Map<string, { rootRef: ReferenceRoot; original: RecordValue; instructions: Instruction[] }>();
        const deferred: PendingAction[] = [];
        function register(candidate: Candidate, targetId: string, replacement: ContentRecord): void {
          const key = rootKey(candidate.location.root);
          const group = roots.get(key) ?? { rootRef: candidate.location.root, original: candidate.root, instructions: [] };
          if (!same(group.original, candidate.root)) fail('所选位置的编辑状态不一致，请重新选择。');
          // Later, more complete containing edits intentionally replace earlier
          // nested instructions for the same path; deeper paths are overridden below.
          group.instructions = group.instructions.filter(item => !same(item.path, candidate.location.path));
          group.instructions.push({ path: candidate.location.path, targetId, replacement }); roots.set(key, group);
        }
        // Earlier nested joint saves only staged these outside uses. They enter
        // the same atomic commit as the containing phrase, never a separate save.
        for (const action of meta.pendingActions ?? []) {
          assertPending(action); const replacement = library.readContent(action.replacement.id)!;
          const waiting: Candidate[] = [];
          for (const candidate of action.candidates) {
            if (!parentMeta || candidate.location.root.type === 'draft' && candidate.location.root.id === parent!.id) register(candidate, action.target.id, replacement);
            else waiting.push(candidate);
          }
          if (waiting.length) deferred.push({ ...clone(action), candidates: waiting });
        }
        const outside: Candidate[] = [];
        for (const candidate of selected) {
          if (!parentMeta || candidate.location.root.type === 'draft' && candidate.location.root.id === parent!.id) register(candidate, meta.target.id, leaf);
          else outside.push(candidate);
        }
        if (outside.length) deferred.push({ target: clone(meta.target), replacement: clone(leaf), candidates: clone(outside) });
        // Equal rewrite maps share one fork even across separate selected occurrences.
        const forks = new Map<string, ContentRecord>();
        function rewrite(record: RecordValue, instructions: Instruction[]): RecordValue {
          const grouped = new Map<string, Instruction[]>();
          for (const instruction of instructions) {
            const first = instruction.path[0] ?? fail('使用位置路径无效。'); const group = grouped.get(first) ?? [];
            group.push({ ...instruction, path: instruction.path.slice(1) }); grouped.set(first, group);
          }
          const replacements: ReferenceReplacement[] = [];
          const slots = adapter(record).slots(record);
          for (const [slotId, suffixes] of grouped) {
            const slot = slots.find(item => item.id === slotId) ?? fail('原使用位置已改变。');
            let target: ContentRecord;
            const direct = suffixes.filter(item => !item.path.length).at(-1);
            if (direct) {
              if (slot.targetId !== direct.targetId) fail('使用位置不是要修改的素材。');
              target = direct.replacement;
            } else {
              const source = library.readContent(slot.targetId) ?? fail('引用的素材已不存在。');
              const key = JSON.stringify([source, suffixes.slice().sort((a, b) => JSON.stringify(a.path).localeCompare(JSON.stringify(b.path)))]);
              const cached = forks.get(key);
              if (cached) target = cached;
              else {
                const rewritten = rewrite(source, suffixes);
                const reuse = !parentMeta && (uses.get(source.id) ?? 0) <= 1;
                target = { ...fields(rewritten), id: reuse ? source.id : crypto.randomUUID(), revision: reuse ? source.revision + 1 : 1 };
                if (reuse) replaceSaved(source, target);
                else {
                  created.push(target);
                  if (parentMeta) rememberReuse(source, target.id, source.name);
                }
                forks.set(key, target);
              }
            }
            replacements.push({ slotId, targetId: target.id });
          }
          const changes = adapter(record).replace(record, replacements);
          const result = { ...clone(record), ...clone(changes) };
          adapter(result).slots(result);
          return result;
        }
        for (const group of roots.values()) {
          const original = group.original; const updated = rewrite(original, group.instructions);
          if (group.rootRef.type === 'draft') {
            const current = original as Draft; const replacement = updated as Draft;
            replaceDrafts.push({ expected: current, replacement });
          } else {
            const content = original as ContentRecord;
            const replacement = { ...updated, revision: content.revision + 1 } as ContentRecord;
            replaceSaved(content, replacement);
          }
        }
        if (parent && parentMeta) {
          const update = replaceDrafts.find(item => item.expected.id === parent.id);
          const replacement = update?.replacement ?? clone(parent);
          parentMeta.ownedContentIds = [...new Set([...parentMeta.ownedContentIds, ...meta.ownedContentIds, ...created.map(item => item.id)])];
          parentMeta.pendingActions = [...(parentMeta.pendingActions ?? []), ...deferred];
          parentMeta.pendingReuses = [...(parentMeta.pendingReuses ?? []), ...pendingReuses];
          replacement.editingContext = asJson(parentMeta);
          if (!update) replaceDrafts.push({ expected: parent, replacement });
          // The parent is an affected editing root even if the user applied the
          // sound only to other places and its notes therefore stayed untouched.
          if (!roots.has(`draft:${parent.id}`)) roots.set(`draft:${parent.id}`, { rootRef: { type: 'draft', id: parent.id }, original: parent, instructions: [] });
        }
        let workingDraftId: string | undefined;
        const deleteDrafts: Draft[] = [];
        if (!meta.context) {
          const replacement: Draft = { ...fields(leaf), id: draft.id, sourceId: leaf.id, baseRevision: leaf.revision };
          replaceDrafts.push({ expected: draft, replacement }); workingDraftId = draft.id;
        } else deleteDrafts.push(draft);
        const anchor = meta.context?.root.type === 'draft' ? meta.context.root.id
          : selected.find(item => item.location.root.type === 'draft')?.location.root.id ?? workingDraftId;
        const deleteContents: ContentRecord[] = [];
        if (!parentMeta && reusable.size) {
          const finalContents = library.listContent().map(item => replaceContents.find(update => update.expected.id === item.id)?.replacement ?? item).concat(created);
          const finalDrafts = library.listDrafts().filter(item => !deleteDrafts.some(removed => removed.id === item.id))
            .map(item => replaceDrafts.find(update => update.expected.id === item.id)?.replacement ?? item);
          const retained = new Set([...finalContents.filter(item => !reusable.has(item.id)), ...finalDrafts].flatMap(item => item.dependencies));
          for (const item of finalDrafts) if (item.sourceId) retained.add(item.sourceId);
          for (const id of reusable.keys()) {
            const old = library.readContent(id);
            if (old && !retained.has(id)) deleteContents.push(old);
          }
        }
        const result = library.commitTransaction({ expectedToken: token, label: selected.length > 1 ? '应用到所选位置' : '仅修改此处',
          ...(anchor ? { anchorDraftId: anchor } : {}), createContents: created, replaceContents, replaceDrafts, deleteDrafts, deleteContents });
        if (result.status !== 'committed') return result;
        // Project isolation may rewrite an occurrence and disambiguate its name
        // during the same transaction. Return the actual committed occurrence.
        const committed = meta.context && selected.some(item => item.location.current) && roots.has(rootKey(meta.context.root))
          ? trace(meta.context).records.at(-1) : library.readContent(leaf.id);
        return { status: 'applied', content: clone(committed ?? leaf), roots: [...roots.values()].map(group => clone(group.rootRef)),
          ...(workingDraftId ? { workingDraftId } : {}), ...(parentMeta && deferred.length ? { staged: true } : {}) };
      } catch (error) { return operationError(error); }
    },
    cancel(draftId): ReferenceOperationResult {
      try {
        const { draft, meta } = session(draftId); const token = library.currentToken();
        const deleteDrafts: Draft[] = [];
        const replaceDrafts: NonNullable<MaterialTransaction['replaceDrafts']> = [];
        if (meta.adopted) {
          const replacement = clone(draft); delete replacement.editingContext;
          replaceDrafts.push({ expected: draft, replacement });
        } else deleteDrafts.push(draft);
        // Closing an outer edit also closes unfinished editors opened inside it.
        const closingIds = new Set([draft.id]);
        let added = true;
        while (added) {
          added = false;
          for (const item of library.listDrafts()) {
            if (closingIds.has(item.id)) continue;
            const child = readContext(item);
            if (child?.context?.root.type === 'draft' && closingIds.has(child.context.root.id)) { deleteDrafts.push(item); closingIds.add(item.id); added = true; }
          }
        }
        const owned = new Set(deleteDrafts.flatMap(item => readContext(item)?.ownedContentIds ?? []));
        const contents = library.listContent(); const remainingDrafts = library.listDrafts().filter(item => !deleteDrafts.some(value => value.id === item.id));
        // Retain a generated item if someone explicitly started using it elsewhere.
        const retained = new Set<string>();
        for (const item of [...contents.filter(item => !owned.has(item.id)), ...remainingDrafts]) for (const id of item.dependencies) retained.add(id);
        for (const item of remainingDrafts) {
          const history = library.readDraftHistory(item.id);
          for (const point of [...history.past, ...history.future]) for (const id of point.dependencies) retained.add(id);
        }
        let growing = true;
        while (growing) {
          growing = false;
          for (const item of contents) if (retained.has(item.id)) for (const id of item.dependencies) if (!retained.has(id)) { retained.add(id); growing = true; }
        }
        const deleteContents = contents.filter(item => owned.has(item.id) && !retained.has(item.id));
        return finishResult(library.commitTransaction({ expectedToken: token, label: '取消独立编辑', deleteDrafts, replaceDrafts, deleteContents }));
      } catch (error) { return operationError(error); }
    },
  };
  return api;
}
