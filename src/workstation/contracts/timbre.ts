import type { ContentRecord, Draft, SaveConfirmation, SaveResult } from './content.ts';
import type { SoundPlan } from './sound.ts';

/** First-path experiment, not a limit on future synthesis or musical pitch. */
export type TimbreBody = {
  model: 'basic-synth';
  version: 1;
  character: 'warm' | 'clear' | 'bright';
  attackSeconds: number;
  releaseSeconds: number;
  level: number;
};

export type TimbreView = {
  draft: Draft;
  body: TimbreBody;
  savedSounds: ContentRecord[];
  unfinishedDrafts: Draft[];
  changed: boolean;
};

export interface TimbreEditorPort {
  read(): TimbreView;
  create(): void;
  open(contentId: string): void;
  openDraft(draftId: string): void;
  rename(name: string): void;
  setCharacter(character: TimbreBody['character']): void;
  setEnvelope(attackSeconds: number, releaseSeconds: number): void;
  setLevel(level: number): void;
  previewPlan(): SoundPlan;
  save(mode: 'overwrite' | 'new', confirmation?: SaveConfirmation): SaveResult;
}
