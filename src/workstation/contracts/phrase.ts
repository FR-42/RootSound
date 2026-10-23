import type { ContentRecord, Draft, SaveConfirmation, SaveResult } from './content.ts';
import type { PlayableNotePlan, SoundPlan, SoundSequencePlan } from './sound.ts';

/** Musical positions use beats; tempo translates those beats to execution seconds. */
export type PhraseNote = {
  id: string;
  startBeat: number;
  durationBeats: number;
  /** Explicit physical pitch; the editor's keyboard does not limit stored precision. */
  frequencyHz: number;
  velocity: number;
};
export type PhrasePart = { id: string; name: string; timbreId: string; notes: PhraseNote[] };
export type PhraseBody = {
  model: 'note-phrase';
  version: 1;
  timeUnit: 'beat';
  tempoBpm: number;
  lengthBeats: number;
  parts: PhrasePart[];
};
export type KeyboardPitch = { label: string; frequencyHz: number; accidental: boolean };
export type PhraseNoteRef = { partId: string; noteId: string };
export type PhraseNoteUpdate = PhraseNoteRef & { changes: Partial<Omit<PhraseNote, 'id'>> };
/** Read-only interpretation for other modules; content remains in the common library. */
export interface PhrasePlaybackPort {
  listSaved(): ContentRecord[];
  readSaved(id: string): { content: ContentRecord; body: PhraseBody };
  prepareForSaved(id: string): Promise<void>;
  /** A tempo override is applied only when explicitly supplied by the caller. */
  planForSaved(id: string, tempoBpm?: number): SoundSequencePlan;
}
export type PhraseView = {
  draft?: Draft;
  body?: PhraseBody;
  savedPhrases: ContentRecord[];
  unfinishedDrafts: Draft[];
  availableSounds: ContentRecord[];
  /** A preserved draft the current editor cannot interpret; never silently replaced. */
  problem?: string;
  changed: boolean;
  canUndo: boolean;
  canRedo: boolean;
};
export interface PhraseEditorPort {
  read(): PhraseView;
  /** No draft or sound is silently created until the user starts a phrase. */
  create(timbreId: string): void;
  open(contentId: string): void;
  openDraft(draftId: string): void;
  rename(name: string): void;
  setTempo(tempoBpm: number): void;
  setLength(lengthBeats: number): void;
  addPart(timbreId: string): string;
  setPartTimbre(partId: string, timbreId: string): void;
  removePart(partId: string): void;
  addNote(partId: string, input: Omit<PhraseNote, 'id'>): string;
  /** Each bulk operation validates and persists once, with one undo step. */
  addNotes(partId: string, inputs: Array<Omit<PhraseNote, 'id'>>): string[];
  updateNote(partId: string, noteId: string, changes: Partial<Omit<PhraseNote, 'id'>>): void;
  updateNotes(updates: PhraseNoteUpdate[]): void;
  removeNote(partId: string, noteId: string): void;
  removeNotes(notes: PhraseNoteRef[]): void;
  undo(): void;
  redo(): void;
  /** All supported equal-tempered pitches, ascending (20–5000 Hz), A4=440 Hz; content remains exact Hz. */
  keyboard(): KeyboardPitch[];
  preparePreview(): Promise<void>;
  /** Audition one selected voice without changing or requiring any stored notes. */
  previewNotePlan(partId: string, note: SoundPlan['note']): Promise<PlayableNotePlan>;
  /** A temporary body supports live gestures without changing the draft/history. */
  previewPlan(bodyOverride?: PhraseBody, options?: { allowSilence?: boolean }): SoundSequencePlan;
  save(mode: 'overwrite' | 'new', confirmation?: SaveConfirmation): SaveResult;
}
