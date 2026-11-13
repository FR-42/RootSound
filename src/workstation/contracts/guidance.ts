import type { PhraseEditorPort } from './phrase.ts';

export type GuideId = 'basics' | 'tempo-rolls';
export type GuideStatus = 'new' | 'learning' | 'completed' | 'skipped';
export interface GuideProgress { status: GuideStatus; step: number }
export interface LearningSettings {
  multipleTempoRolls: boolean;
  drumLanes: boolean;
  workbench?: boolean;
  guides: Record<GuideId, GuideProgress>;
}
export interface LearningSettingsPort {
  read(): LearningSettings;
  setMultipleTempoRolls(enabled: boolean): void;
  setDrumLanes(enabled: boolean): void;
  setWorkbench(enabled: boolean): void;
  record(id: GuideId, progress: GuideProgress): void;
}
/** Report committed user actions, not tutorial clicks or synthetic input. */
export type LearningAction =
  | 'play' | 'pause-space' | 'resume-space' | 'reset' | 'drag-playhead-ruler'
  | 'pan' | 'scroll-x' | 'scroll-y' | 'zoom-x' | 'zoom-y'
  | 'add-group' | 'select-group' | 'draw-note' | 'move-note' | 'resize-note'
  | 'delete-note' | 'undo' | 'deselect' | 'save' | 'export' | 'exit'
  | 'add-roll' | 'change-tempo' | 'change-grid' | 'resize-roll';

/** A practice document owns a separate in-memory library, never the user's draft. */
export interface PracticeDocument {
  phrase: PhraseEditorPort;
  listTimbres(): { id: string; name: string }[];
  addGroup(timbreId: string): string;
  changeTone(partId: string, timbreId: string): void;
  save(): Promise<'saved' | 'download-started' | 'cancelled'>;
  remember(): void;
}
export interface PracticeFactory {
  (id: GuideId, resume: boolean): PracticeDocument;
}
