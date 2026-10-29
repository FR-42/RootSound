export type WorkspaceId = 'sound' | 'phrase' | 'song' | 'library' | 'co-creation' | 'sampling';
export interface WorkspacePreferences {
  /** Chromatic note-entry shortcuts are opt-in and stay local to this device. */
  keyboardPerformance: boolean;
  /** Retained legacy data; no longer controls whether the welcome page is shown. */
  welcomeEnabled: boolean;
  /** Retained legacy data, no longer an active startup setting. */
  startWorkspace: 'last' | WorkspaceId;
  lastWorkspace: WorkspaceId;
}
export interface WorkspacePreferencesPort {
  read(): WorkspacePreferences;
  update(changes: Partial<WorkspacePreferences>): WorkspacePreferences;
}
