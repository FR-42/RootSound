import type { ContentRecord, MaterialLibrary } from '../contracts/content.ts';
import { createTimbreReferenceAdapter } from '../modules/timbre/public.ts';
import { createSampleReferenceAdapter } from '../modules/sampling/public.ts';
import { createSongReferenceAdapter } from '../modules/song/public.ts';

/** Adopt a fully validated, independent voice graph in one atomic project transaction. */
export function importProjectTimbre(library: MaterialLibrary, songDraftId: string, root: ContentRecord, dependencies: ContentRecord[] = []): ContentRecord {
  const expectedToken = library.currentToken(); const song = library.readDraft(songDraftId);
  if (!song) throw new Error('先打开一首歌曲，再导入音色。');
  createSongReferenceAdapter().slots(song);
  const scope = library.projectScopeOf?.({ type: 'draft', id: song.id }); const view = library.currentProjectView?.(song.id);
  if (!scope || !view || view.project.id !== song.id) throw new Error('当前歌曲已改变，请重新导入音色。');
  if (root.kind !== 'rootsound.timbre') throw new Error('请选择音色文件。');
  const graph = [root, ...dependencies]; const originals = new Map(graph.map(record => [record.id, record]));
  if (originals.size !== graph.length || dependencies.some(record => record.kind !== 'rootsound.sample')) throw new Error('音色文件包含重复或不支持的依赖。');
  const adapters = new Map([createTimbreReferenceAdapter(), createSampleReferenceAdapter()].map(adapter => [adapter.kind, adapter]));
  const visited = new Set<string>(); const visiting = new Set<string>();
  function validate(record: ContentRecord): void {
    if (visited.has(record.id)) return;
    if (visiting.has(record.id)) throw new Error('音色文件包含循环引用。');
    visiting.add(record.id); const adapter = adapters.get(record.kind);
    if (!adapter || !Number.isSafeInteger(record.revision) || record.revision < 1 || typeof record.id !== 'string' || !record.id || typeof record.name !== 'string' || !record.name.trim()) throw new Error('音色文件的内容格式无效。');
    for (const slot of adapter.slots(record)) {
      const target = originals.get(slot.targetId); if (!target) throw new Error('音色文件缺少采样，请选择自带完整声音的文件。');
      adapter.validateTarget?.(record, slot.id, target); validate(target);
    }
    visiting.delete(record.id); visited.add(record.id);
  }
  validate(root);
  if (visited.size !== graph.length) throw new Error('音色文件包含与当前声音无关的内容。');
  const idMap = new Map(graph.map(record => [record.id, crypto.randomUUID()]));
  const names = new Set([...library.listContentInfo(), ...library.listDrafts()]
    .filter(record => library.projectScopeOf?.({ type: 'revision' in record ? 'content' : 'draft', id: record.id }) === scope)
    .map(record => JSON.stringify([record.kind, record.name.trim().normalize('NFC').toLocaleLowerCase('en-US')])));
  const prepared = graph.map(record => {
    const base = record.name.trim(); let name = base; let suffix = 2;
    const key = () => JSON.stringify([record.kind, name.normalize('NFC').toLocaleLowerCase('en-US')]);
    while (names.has(key())) name = `${base} ${suffix++}`;
    names.add(key()); const adapter = adapters.get(record.kind)!;
    const rewritten = adapter.replace(record, adapter.slots(record).map(slot => ({ slotId: slot.id, targetId: idMap.get(slot.targetId)! })));
    return { ...record, id: idMap.get(record.id)!, name, revision: 1,
      body: rewritten.body === undefined ? record.body : rewritten.body, dependencies: rewritten.dependencies ?? record.dependencies };
  });
  const imported = prepared[0]!;
  const committed = library.commitTransaction({ expectedToken, label: `导入${imported.name}`, createContents: prepared,
    exactNameIds: prepared.map(record => record.id), projectMembers: [{ rootId: song.id, contentIds: [...new Set([...view.memberIds, imported.id])] }] });
  if (committed.status !== 'committed') throw new Error(committed.status === 'storage-error' ? committed.message : committed.reason);
  return library.readContent(imported.id)!;
}
