import type { MusicWorkspaceState, MusicWorkspaceStatePort } from '../../contracts/workspace.ts';
import type { PreferenceStorage } from './preferences.ts';

/** One small local record per stable project identity; contains no musical draft. */
export function createMusicWorkspaceState(storage: PreferenceStorage, projectId: string): MusicWorkspaceStatePort {
  const key = 'rootsound.music-workspace.v1:' + encodeURIComponent(projectId);
  let current: MusicWorkspaceState | undefined;
  try {
    const raw = storage.getItem(key);
    const value = raw ? JSON.parse(raw) : undefined;
    const view = value?.viewport;
    if (value?.version === 1 && view && [view.leftSeconds, view.zoom, view.top, view.rowHeight, value.playheadSeconds, value.entryOctave].every(Number.isFinite)
      && view.zoom > 0 && view.rowHeight > 0) {
      const selection = typeof value.selection?.partId === 'string' ? { partId: value.selection.partId,
        ...(typeof value.selection.noteId === 'string' ? { noteId: value.selection.noteId } : {}) } : undefined;
      const noteLengths = Object.fromEntries(Object.entries(value.noteLengths ?? {}).filter(([id, seconds]) => id && typeof seconds === 'number' && Number.isFinite(seconds) && seconds >= .0001 && seconds <= 96));
      current = { ...(value.orientation === 'vertical' ? { orientation: 'vertical' as const } : {}), viewport: { leftSeconds: Math.max(0, view.leftSeconds), zoom: view.zoom, top: Math.max(0, view.top), rowHeight: view.rowHeight },
        selection, playheadSeconds: Math.max(0, value.playheadSeconds), entryOctave: Math.max(0, Math.min(8, Math.round(value.entryOctave))),
        entryToneId: typeof value.entryToneId === 'string' ? value.entryToneId : undefined, noteLengths: noteLengths as Record<string, number> };
    }
  } catch { /* Unavailable or stale local context must not prevent opening music. */ }
  return {
    read: () => current ? structuredClone(current) : undefined,
    write(state) {
      current = structuredClone(state);
      try { storage.setItem(key, JSON.stringify({ version: 1, ...current })); }
      catch { /* Keep this session usable if the local preference store is unavailable. */ }
    },
  };
}
