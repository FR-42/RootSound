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

/** Local editing context, deliberately separate from saved musical content. */
export interface MusicWorkspaceState {
  showGridCells?: boolean;
  drumLanes?: number;
  drumLaneWidth?: number;
  orientation?: 'vertical';
  viewport: { leftSeconds: number; zoom: number; top: number; rowHeight: number };
  selection?: { partId: string; noteId?: string };
  playheadSeconds: number;
  entryOctave: number;
  entryToneId?: string;
  noteLengths: Record<string, number>;
}
export interface MusicWorkspaceStatePort {
  read(): MusicWorkspaceState | undefined;
  write(state: MusicWorkspaceState): void;
}
