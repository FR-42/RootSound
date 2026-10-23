import type { CreativeEntityKind } from '../../contracts/entities.ts';

export const ENTITY_DRAG_TYPE = 'application/x-rootsound-entity';
export type EntityDrag = { id: string; kind: CreativeEntityKind };
export function writeEntityDrag(transfer: Pick<DataTransfer, 'setData' | 'effectAllowed'>, entity: EntityDrag): void {
  transfer.effectAllowed = 'copy';
  transfer.setData(ENTITY_DRAG_TYPE, JSON.stringify({ version: 1, id: entity.id, kind: entity.kind }));
}
export function readEntityDrag(transfer: Pick<DataTransfer, 'getData'>): EntityDrag | undefined {
  try {
    const text = transfer.getData(ENTITY_DRAG_TYPE);
    if (!text || text.length > 8192) return;
    const value: unknown = JSON.parse(text);
    if (!value || typeof value !== 'object' || Array.isArray(value)) return;
    const record = value as Record<string, unknown>;
    if (Object.keys(record).length !== 3 || record.version !== 1 || typeof record.id !== 'string'
      || !record.id.trim() || record.id.length > 4096
      || !['rootsound.timbre', 'rootsound.phrase'].includes(String(record.kind))) return;
    return { id: record.id, kind: record.kind as CreativeEntityKind };
  } catch { return; }
}
