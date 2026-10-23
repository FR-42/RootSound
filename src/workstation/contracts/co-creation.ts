import type { ContentRecord, Draft } from './content.ts';
import type { SoundSequencePlan } from './sound.ts';

/** Offline directions are editable musical suggestions, not remote AI responses. */
export type CoCreationDirection = 'light' | 'calm' | 'airy';
export type CoCreationBody = {
  model: 'guided-session'; version: 1;
  sourcePhraseId?: string;
  currentPhraseId?: string;
  hasArrangement: boolean;
  round: number;
  lastDirection?: CoCreationDirection;
};
export type CoCreationIdea = { id: CoCreationDirection; title: string; description: string };
export type CoCreationView = {
  draft: Draft;
  body?: CoCreationBody;
  sourceName?: string;
  currentPhrase?: ContentRecord;
  availablePhrases: ContentRecord[];
  ideas: CoCreationIdea[];
  /** Includes the current draft and the saved music from which its next suggestions derive. */
  token: string;
  canUndo: boolean;
  canRedo: boolean;
  problem?: string;
};
export interface CoCreationPort {
  read(): CoCreationView;
  /** Starts another independent journey; existing journeys and musical material stay intact. */
  start(sourcePhraseId?: string): void;
  openDraft(draftId: string): void;
  /** Rename this journey's current music only; shared works keep their saved names. */
  renameCurrent(name: string, expectedToken?: string): void;
  prepareIdea(id: CoCreationDirection): Promise<void>;
  prepareCurrent(): Promise<void>;
  /** Candidate previews are built in memory and publish no materials. */
  previewIdea(id: CoCreationDirection): SoundSequencePlan;
  /** Persists only the chosen music and session in one durable undoable operation. */
  chooseIdea(id: CoCreationDirection, expectedToken?: string): void;
  previewCurrent(): SoundSequencePlan;
  undo(): void;
  redo(): void;
}
