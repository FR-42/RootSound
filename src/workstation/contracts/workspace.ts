export type WorkspaceId = 'sound' | 'phrase' | 'song' | 'library' | 'co-creation' | 'sampling';
export interface WorkspacePreferences {
  /** Chromatic note-entry shortcuts are opt-in and stay local to this device. */
  keyboardPerformance: boolean;
  welcomeEnabled: boolean;
  startWorkspace: 'last' | WorkspaceId;
  lastWorkspace: WorkspaceId;
}
export interface WorkspacePreferencesPort {
  read(): WorkspacePreferences;
  update(changes: Partial<WorkspacePreferences>): WorkspacePreferences;
}
