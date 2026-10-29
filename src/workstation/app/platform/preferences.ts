import type { WorkspaceId, WorkspacePreferences, WorkspacePreferencesPort } from '../../contracts/workspace.ts';

export interface PreferenceStorage { getItem(key: string): string | null; setItem(key: string, value: string): void }
const KEY = 'rootsound.workstation.preferences.v1';
const workspaces: WorkspaceId[] = ['sound', 'phrase', 'song', 'library', 'co-creation', 'sampling'];
const defaults: WorkspacePreferences = { keyboardPerformance: false, welcomeEnabled: true, startWorkspace: 'last', lastWorkspace: 'sound' };

export function createWorkspacePreferences(storage: PreferenceStorage): WorkspacePreferencesPort {
  let value = { ...defaults };
  let retained: Record<string, unknown> = {};
  try {
    const raw = storage.getItem(KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed) && parsed.version === 1) {
        retained = { ...parsed };
        // Removed entry controls are compatibility data, never prerequisites for
        // restoring the remaining keyboard switch or internal workspace memory.
        value = { keyboardPerformance: parsed.keyboardPerformance === true,
          welcomeEnabled: typeof parsed.welcomeEnabled === 'boolean' ? parsed.welcomeEnabled : defaults.welcomeEnabled,
          startWorkspace: parsed.startWorkspace === 'last' || workspaces.includes(parsed.startWorkspace) ? parsed.startWorkspace : defaults.startWorkspace,
          lastWorkspace: workspaces.includes(parsed.lastWorkspace) ? parsed.lastWorkspace : defaults.lastWorkspace };
      }
    } else {
      const previous = storage.getItem('rootsound.workstation.workspace.v1');
      if (workspaces.includes(previous as WorkspaceId)) value.lastWorkspace = previous as WorkspaceId;
    }
  } catch { /* Display preferences cannot make preserved musical content unreadable. */ }
  return {
    read: () => ({ ...value }),
    update(changes) {
      const next = { ...value, ...changes };
      if (Object.keys(changes).some(key => !['keyboardPerformance', 'welcomeEnabled', 'startWorkspace', 'lastWorkspace'].includes(key))
        || typeof next.keyboardPerformance !== 'boolean' || typeof next.welcomeEnabled !== 'boolean' || !workspaces.includes(next.lastWorkspace)
        || (next.startWorkspace !== 'last' && !workspaces.includes(next.startWorkspace))) throw new Error('设置无效。');
      try { storage.setItem(KEY, JSON.stringify({ ...retained, version: 1, ...next })); }
      catch { throw new Error('未能保存设置，原设置仍然保留。'); }
      value = next; return { ...value };
    },
  };
}
