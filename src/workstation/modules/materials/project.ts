import type { ContentRecord, Draft, JsonValue, MaterialLibrary } from '../../contracts/content.ts';
import { MAX_PROJECT_FILE_BYTES, PROJECT_FILE_EXTENSION } from '../../contracts/files.ts';
import type { ProjectImportResult, ProjectPackagesPort } from '../../contracts/project.ts';
import type { ReferenceAdapter, ReferenceSlot } from '../../contracts/references.ts';

const MAX_CONTENTS = 8192;
const MAX_JSON_DEPTH = 128;
const MAX_JSON_NODES = 2_000_000;
const RECORD_FIELDS = ['id', 'kind', 'schemaVersion', 'owner', 'name', 'revision', 'dependencies', 'body'];

type ProjectFile = { format: 'RootSoundProject'; version: 1 | 2; rootId: string; contents: ContentRecord[]; memberIds?: string[] };
type ValidatedProject = { file: ProjectFile; records: Map<string, ContentRecord>; slots: Map<string, ReferenceSlot[]> };

function fail(message: string): never { throw new Error(`歌曲工程：${message}`); }
function clone<T>(value: T): T { return JSON.parse(JSON.stringify(value)) as T; }
function object(value: unknown): value is Record<string, unknown> { return !!value && typeof value === 'object' && !Array.isArray(value); }
function exactFields(value: Record<string, unknown>, fields: string[], label: string): void {
  if (Object.keys(value).length !== fields.length || fields.some(field => !Object.hasOwn(value, field))) fail(`${label}包含缺失或尚不支持的设置。`);
}
function text(value: unknown, label: string, maximum: number): string {
  if (typeof value !== 'string' || !value.trim() || value.length > maximum) fail(`${label}无效或过长。`);
  return value;
}
function validateJson(value: unknown): asserts value is JsonValue {
  const pending = [{ value, depth: 0 }]; let count = 0;
  while (pending.length) {
    const item = pending.pop()!;
    if (++count > MAX_JSON_NODES || item.depth > MAX_JSON_DEPTH) fail('内容过于复杂，未导入或改动任何素材。');
    const current = item.value;
    if (current === null || typeof current === 'boolean' || typeof current === 'string') continue;
    if (typeof current === 'number' && Number.isFinite(current)) continue;
    if (!object(current) && !Array.isArray(current)) fail('内容包含无效或非有限的数据。');
    for (const child of Object.values(current)) pending.push({ value: child, depth: item.depth + 1 });
  }
}
function readRecord(value: unknown): ContentRecord {
  if (!object(value)) fail('素材记录不是有效对象。');
  exactFields(value, RECORD_FIELDS, '素材记录');
  text(value.id, '素材标识', 1024); text(value.kind, '素材类型', 256); text(value.owner, '素材所有者', 256); text(value.name, '素材名称', 4096);
  if (!Number.isSafeInteger(value.schemaVersion) || Number(value.schemaVersion) < 1
    || !Number.isSafeInteger(value.revision) || Number(value.revision) < 1) fail('素材格式或修订版本无效。');
  if (!Array.isArray(value.dependencies) || value.dependencies.length > MAX_CONTENTS) fail('素材引用列表无效。');
  for (const dependency of value.dependencies) text(dependency, '素材引用', 1024);
  if (new Set(value.dependencies).size !== value.dependencies.length) fail('素材引用不能重复。');
  validateJson(value.body);
  return value as unknown as ContentRecord;
}

/** Owns only the portable graph; each musical owner validates and rewrites its own references. */
export function createProjectPackages(
  library: MaterialLibrary, adapters: ReferenceAdapter[], options: { rootKind: string },
): ProjectPackagesPort {
  const owners = new Map(adapters.map(adapter => [adapter.kind, adapter]));
  if (owners.size !== adapters.length) fail('同一种素材不能有多个工程解释器。');
  text(options.rootKind, '工程根类型', 256);
  function owner(record: ContentRecord): ReferenceAdapter {
    return owners.get(record.kind) ?? fail(`尚不支持工程中的素材类型 ${record.kind}。原内容未改变。`);
  }
  function validate(value: unknown): ValidatedProject {
    if (!object(value)) fail('不是支持的歌曲工程文件。');
    if (value.format !== 'RootSoundProject' || value.version !== 1 && value.version !== 2) fail('暂不支持这个工程格式或版本。');
    exactFields(value, value.version === 2 ? ['format', 'version', 'rootId', 'contents', 'memberIds'] : ['format', 'version', 'rootId', 'contents'], '工程文件');
    const rootId = text(value.rootId, '工程根标识', 1024);
    if (!Array.isArray(value.contents) || !value.contents.length || value.contents.length > MAX_CONTENTS) fail(`工程需要 1 至 ${MAX_CONTENTS} 份素材。`);
    const contents = value.contents.map(readRecord);
    const records = new Map(contents.map(record => [record.id, record]));
    if (records.size !== contents.length) fail('工程中有重复的素材标识。');
    const root = records.get(rootId);
    if (!root || root.kind !== options.rootKind) fail('工程缺少正确的歌曲根内容。');
    const memberIds: string[] = [];
    if (value.version === 2) {
      if (!Array.isArray(value.memberIds) || value.memberIds.length > MAX_CONTENTS) fail('工程素材成员列表无效。');
      for (const valueId of value.memberIds) {
        const id = text(valueId, '工程素材成员', 1024); const record = records.get(id);
        if (!record || id === rootId || record.kind === options.rootKind || memberIds.includes(id)) fail('工程素材成员缺失、重复或类型无效。');
        memberIds.push(id);
      }
    }
    const slots = new Map<string, ReferenceSlot[]>();
    for (const record of contents) {
      const adapter = owner(record); const uses = adapter.slots(record);
      const ids = new Set<string>(); const dependencies = new Set<string>();
      for (const slot of uses) {
        text(slot.id, '引用位置', 1024); text(slot.targetId, '引用目标', 1024);
        if (ids.has(slot.id)) fail('素材中存在重复的引用位置。');
        ids.add(slot.id); dependencies.add(slot.targetId);
        const target = records.get(slot.targetId) ?? fail('工程缺少引用的素材，无法独立打开。');
        if (!adapter.validateTarget) fail('这种素材尚不支持工程引用目标验证。');
        adapter.validateTarget(record, slot.id, target);
      }
      if (dependencies.size !== record.dependencies.length || record.dependencies.some(id => !dependencies.has(id))) fail('素材实际使用的位置与引用列表不一致。');
      slots.set(record.id, uses);
    }
    // Iterative traversal handles large graphs without relying on the call stack.
    const colors = new Map<string, 'visiting' | 'visited'>();
    const pending: { id: string; finish: boolean }[] = [rootId, ...memberIds].map(id => ({ id, finish: false }));
    while (pending.length) {
      const item = pending.pop()!;
      if (item.finish) { colors.set(item.id, 'visited'); continue; }
      if (colors.get(item.id) === 'visiting') fail('工程素材存在循环引用。');
      if (colors.get(item.id) === 'visited') continue;
      colors.set(item.id, 'visiting'); pending.push({ id: item.id, finish: true });
      const record = records.get(item.id) ?? fail('工程缺少引用素材。');
      for (let index = record.dependencies.length - 1; index >= 0; index--) pending.push({ id: record.dependencies[index]!, finish: false });
    }
    if (colors.size !== contents.length) fail('工程包含与这首歌曲无关的孤立素材。');
    return { file: { format: 'RootSoundProject', version: value.version, rootId, contents,
      ...(value.version === 2 ? { memberIds } : {}) }, records, slots };
  }
  function freshId(used: Set<string>): string {
    for (let attempt = 0; attempt < 8; attempt++) {
      const id = crypto.randomUUID();
      if (!used.has(id)) { used.add(id); return id; }
    }
    return fail('无法创建独立的素材身份，请重试。');
  }
  return {
    exportDraft(draftId) {
      const expected = library.currentToken(); const draft = library.readDraft(draftId);
      if (!draft || draft.kind !== options.rootKind) fail('先打开一首歌曲，再导出完整工程。');
      if (draft.editingContext !== undefined) fail('请先完成或取消正在调整的独立编辑，再导出工程。');
      const current = library.currentProjectView?.(draftId);
      if (current?.drafts.some(item => item.id !== draft.id)) fail('请先完成或取消当前音色、乐句等素材的调整，再保存歌曲工程。');
      const used = new Set([...library.listContentInfo().map(record => record.id), ...library.listDrafts().map(item => item.id)]);
      const root: ContentRecord = { id: freshId(used), kind: draft.kind, schemaVersion: draft.schemaVersion, owner: draft.owner,
        name: draft.name, revision: 1, dependencies: [...draft.dependencies], body: clone(draft.body) };
      const memberIds = current?.memberIds ?? [];
      const records = new Map<string, ContentRecord>([[root.id, root]]); const pending = [...root.dependencies, ...memberIds];
      while (pending.length) {
        const id = pending.pop()!; if (records.has(id)) continue;
        const content = library.readContent(id) ?? fail('歌曲缺少引用的素材，请修复后再导出。');
        if (records.size >= MAX_CONTENTS) fail(`当前工程最多携带 ${MAX_CONTENTS} 份素材。`);
        records.set(id, content); pending.push(...content.dependencies);
      }
      const project = validate({ format: 'RootSoundProject', version: memberIds.length ? 2 : 1, rootId: root.id, contents: [...records.values()],
        ...(memberIds.length ? { memberIds } : {}) }).file;
      const result = JSON.stringify(project);
      if (new TextEncoder().encode(result).byteLength > MAX_PROJECT_FILE_BYTES) fail('工程超过当前文件大小上限，未导出不完整文件。');
      if (library.currentToken() !== expected) fail('导出期间素材发生变化，请重试。');
      return { text: result, name: `${draft.name}${PROJECT_FILE_EXTENSION}`, contentCount: project.contents.length };
    },
    importProject(source): ProjectImportResult {
      const expectedToken = library.currentToken();
      try {
        if (typeof source !== 'string' || new TextEncoder().encode(source).byteLength > MAX_PROJECT_FILE_BYTES) fail('工程文件超过当前大小上限。');
        let value: unknown;
        try { value = JSON.parse(source); } catch { return { status: 'conflict', reason: '歌曲工程文件损坏，未改动任何素材。' }; }
        const project = validate(value);
        const used = new Set([...project.records.keys(), ...library.listContentInfo().map(record => record.id), ...library.listDrafts().map(item => item.id)]);
        const remap = new Map(project.file.contents.map(record => [record.id, freshId(used)]));
        const contents = project.file.contents.map(record => {
          const adapter = owner(record);
          const replacements = project.slots.get(record.id)!.map(slot => ({ slotId: slot.id, targetId: remap.get(slot.targetId)! }));
          const changes = adapter.replace(record, replacements);
          if (changes.name !== undefined && changes.name !== record.name) fail('素材解释器意外改变了名称，未导入工程。');
          return { ...clone(record), ...clone(changes), id: remap.get(record.id)!, revision: 1 };
        });
        const rootId = remap.get(project.file.rootId)!;
        const memberIds = project.file.memberIds?.map(id => remap.get(id)!) ?? [];
        const rewritten = validate({ format: 'RootSoundProject', version: project.file.version, rootId, contents,
          ...(project.file.version === 2 ? { memberIds } : {}) });
        const content = rewritten.records.get(rootId)!;
        const { revision, id, ...fields } = content;
        const draft: Draft = { ...clone(fields), id: freshId(used), sourceId: id, baseRevision: revision };
        const result = library.commitTransaction({ expectedToken, label: '导入完整歌曲工程', createContents: rewritten.file.contents, createDrafts: [draft],
          ...(memberIds.length ? { projectMembers: [{ rootId, contentIds: memberIds }] } : {}) });
        if (result.status !== 'committed') return result;
        return { status: 'imported', content: library.readContent(content.id)!, draft: library.readDraft(draft.id)!, contentCount: contents.length };
      } catch (error) { return { status: 'conflict', reason: error instanceof Error ? error.message : String(error) }; }
    },
  };
}
