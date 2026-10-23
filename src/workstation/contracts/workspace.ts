export type WorkspaceId = 'sound' | 'phrase' | 'song' | 'library' | 'co-creation' | 'sampling';
export interface WorkspacePreferences {
  welcomeEnabled: boolean;
  startWorkspace: 'last' | WorkspaceId;
  lastWorkspace: WorkspaceId;
}
export interface WorkspacePreferencesPort {
  read(): WorkspacePreferences;
  update(changes: Partial<WorkspacePreferences>): WorkspacePreferences;
}
