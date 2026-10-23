import type { ContentRecord, Draft } from '../../contracts/content.ts';
import type { ReferenceAdapter } from '../../contracts/references.ts';

/** Count audible positions, not saved/editing representations of one position. */
export function countUsagePositions(contents: ContentRecord[], drafts: Draft[], adapters: ReferenceAdapter[]): Map<string, number> {
  const owners = new Map(adapters.map(adapter => [adapter.kind, adapter]));
  const records = new Map(contents.map(record => [record.id, record]));
  const ordinary = drafts.filter(draft => !draft.editingContext);
  const temporary = new Set(drafts.flatMap(draft => {
    const context = draft.editingContext;
    return context && typeof context === 'object' && !Array.isArray(context) && Array.isArray(context.ownedContentIds)
      ? context.ownedContentIds.filter((id): id is string => typeof id === 'string') : [];
  }));
  const incoming = new Set([...contents, ...ordinary].flatMap(record => record.dependencies));
  type Slot = { id: string; targetId: string };
  function slotsOf(record: ContentRecord | Draft): Slot[] {
    const owner = owners.get(record.kind);
    return owner ? owner.slots(record) : record.dependencies.map(id => ({ id: `dependency:${id}`, targetId: id }));
  }
  const roots: { record: ContentRecord | Draft; identity: string; slots?: Slot[] }[] = contents.filter(record => !incoming.has(record.id) && !temporary.has(record.id))
    .map(record => ({ record, identity: `content:${record.id}` }));
  for (const draft of ordinary) {
    // An ordinary editor is a view of an already used material. Its unchanged
    // slots are counted through that material's audible paths; newly introduced
    // references still belong to this unfinished edit and need protection.
    if (draft.sourceId && incoming.has(draft.sourceId)) {
      const source = records.get(draft.sourceId);
      const previous = new Map(source ? slotsOf(source).map(slot => [slot.id, slot.targetId]) : []);
      const added = slotsOf(draft).filter(slot => previous.get(slot.id) !== slot.targetId);
      if (added.length) roots.push({ record: draft, identity: `draft:${draft.id}`, slots: added });
      continue;
    }
    roots.push({ record: draft, identity: draft.sourceId ? `content:${draft.sourceId}` : `draft:${draft.id}` });
  }
  const positions = new Map<string, Set<string>>();
  function visit(record: ContentRecord | Draft, identity: string, path: string[], visited: Set<string>, selectedSlots?: Slot[]): void {
    if (path.length > 32) throw new Error('素材引用层级过深，未改变原内容。');
    const slots = selectedSlots ?? slotsOf(record);
    for (const slot of slots) {
      if (visited.has(slot.targetId)) throw new Error('素材引用出现循环，未改变原内容。');
      const nextPath = [...path, slot.id]; const uses = positions.get(slot.targetId) ?? new Set<string>();
      uses.add(JSON.stringify([identity, nextPath])); positions.set(slot.targetId, uses);
      const child = records.get(slot.targetId);
      if (child) visit(child, identity, nextPath, new Set([...visited, slot.targetId]));
    }
  }
  for (const root of roots) visit(root.record, root.identity, [], new Set(), root.slots);
  return new Map([...positions].map(([id, uses]) => [id, uses.size]));
}
