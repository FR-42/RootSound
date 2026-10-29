import type { MidiImportNotice } from '../../contracts/project-directory.ts';

const KEY = 'rootsound.midi-import-notice.v1';
type SessionStore = { getItem(key: string): string | null; setItem(key: string, value: string): void; removeItem(key: string): void };

function notice(value: unknown): MidiImportNotice | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return;
  const input = value as Record<string, unknown>;
  if (typeof input.projectId !== 'string' || !input.projectId || input.projectId.length > 256
    || typeof input.name !== 'string' || !input.name || input.name.length > 256
    || typeof input.trackCount !== 'number' || !Number.isSafeInteger(input.trackCount) || input.trackCount < 1 || input.trackCount > 128
    || typeof input.noteCount !== 'number' || !Number.isSafeInteger(input.noteCount) || input.noteCount < 1 || input.noteCount > 50000
    || !Array.isArray(input.warnings) || input.warnings.length > 64
    || input.warnings.some(warning => typeof warning !== 'string' || warning.length > 2000)) return;
  return { projectId: input.projectId, name: input.name, trackCount: input.trackCount, noteCount: input.noteCount, warnings: [...input.warnings] as string[] };
}

/** One-shot status survives only this reload, and is scoped to the new project. */
export function rememberMidiImportNotice(store: SessionStore, value: MidiImportNotice): boolean {
  const valid = notice(value); if (!valid) return false;
  try { store.setItem(KEY, JSON.stringify(valid)); return true; } catch { return false; }
}
export function takeMidiImportNotice(store: SessionStore, projectId?: string): MidiImportNotice | undefined {
  try {
    const raw = store.getItem(KEY); store.removeItem(KEY);
    if (!raw || raw.length > 128 * 1024) return;
    const value = notice(JSON.parse(raw));
    return value?.projectId === projectId ? value : undefined;
  } catch { return; }
}
