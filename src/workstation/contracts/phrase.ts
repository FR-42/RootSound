import type { ContentRecord, Draft, SaveConfirmation, SaveResult } from './content.ts';
import type { PlayableNotePlan, SoundPlan, SoundSequencePlan } from './sound.ts';

/** Legacy default. Each phrase can choose its own editing resolution without retiming notes. */
export const PHRASE_STEPS_PER_BEAT = 4;

/** Omitted older phrases retain four cells per beat; explicit choices are validated. */
export function phraseStepsPerBeat(body?: Pick<PhraseBody, 'stepsPerBeat'>): number {
  const steps = body?.stepsPerBeat === undefined ? PHRASE_STEPS_PER_BEAT : body.stepsPerBeat;
  if (!Number.isInteger(steps) || steps < 2 || steps > 9) throw new Error('每拍格数必须是 2 至 9 的整数。');
  return steps;
}

/** Musical positions use beats; tempo translates those beats to execution seconds. */
export type PhraseNote = {
  id: string;
  startBeat: number;
  durationBeats: number;
  /** Explicit held duration independent of BPM; omitted older notes use durationBeats. */
  durationSeconds?: number;
  /** Explicit physical pitch; the editor's keyboard does not limit stored precision. */
  frequencyHz: number;
  velocity: number;
  /** Per-note output gain; omitted older notes use unity gain. */
  level?: number;
  /** Per-note stereo position; omitted older notes are centered. */
  pan?: number;
};
export type PhraseSection = 'melody' | 'rhythm';
/** Older unmarked parts belong to Melody; both sections share one phrase clock. */
export type PhrasePart = {
  id: string; name: string; timbreId: string; section?: PhraseSection;
  /** Unassigned tone uses keep notes and origin identity for rebinding but remain silent. */
  unassigned?: boolean;
  notes: PhraseNote[];
};
export type PhraseBody = {
  model: 'note-phrase';
  version: 1;
  timeUnit: 'beat';
  tempoBpm: number;
  lengthBeats: number;
  /** Editing cells per beat only; changing this never quantizes existing notes. Omitted values are four. */
  stepsPerBeat?: number;
  /** Phrase output gain; omitted older content uses unity gain. */
  masterLevel?: number;
  parts: PhrasePart[];
};
export type KeyboardPitch = { label: string; frequencyHz: number; accidental: boolean };
export type PhraseNoteRef = { partId: string; noteId: string };
export type PhraseNoteUpdate = PhraseNoteRef & { changes: Partial<Omit<PhraseNote, 'id'>> };
/** Read-only interpretation for other modules; content remains in the common library. */
export interface PhrasePlaybackPort {
  listSaved(): ContentRecord[];
  readSaved(id: string): { content: ContentRecord; body: PhraseBody };
  prepareForSaved(id: string, tempoBpm?: number): Promise<void>;
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
  setTempo(tempoBpm: number, options?: { preserveNoteDurations?: boolean }): void;
  /** Changes the shared Melody/Rhythm editing grid, preserving every stored note coordinate and duration. */
  setStepsPerBeat(stepsPerBeat: number): void;
  setMasterLevel(level: number): void;
  setLength(lengthBeats: number): void;
  addPart(timbreId: string, section?: PhraseSection): string;
  setPartTimbre(partId: string, timbreId: string): void;
  /** Unselecting a tone preserves its notes as silent, undefined tone uses. */
  setPartVisible(partId: string, visible: boolean): void;
  /** Related duplicate uses toggle together in one undo step. */
  setPartsVisible(partIds: string[], visible: boolean): void;
  removePart(partId: string): void;
  /** Removes the selected uses and their notes together, retaining the sound assets. */
  removeParts(partIds: string[]): void;
  addNote(partId: string, input: Omit<PhraseNote, 'id'>): string;
  /** Each bulk operation validates and persists once, with one undo step. */
  addNotes(partId: string, inputs: Array<Omit<PhraseNote, 'id'>>): string[];
  updateNote(partId: string, noteId: string, changes: Partial<Omit<PhraseNote, 'id'>>): void;
  updateNotes(updates: PhraseNoteUpdate[]): void;
  /** Transfer a note to another tone within its section, preserving its identity. */
  moveNote(partId: string, noteId: string, targetPartId: string, changes?: Partial<Omit<PhraseNote, 'id'>>): void;
  removeNote(partId: string, noteId: string): void;
  removeNotes(notes: PhraseNoteRef[]): void;
  undo(): void;
  redo(): void;
  /** All supported equal-tempered pitches, ascending (20–5000 Hz), A4=440 Hz; content remains exact Hz. */
  keyboard(): KeyboardPitch[];
  /** Prepare the same current or temporary body that previewPlan will compile. */
  preparePreview(bodyOverride?: PhraseBody): Promise<void>;
  /** Audition one selected voice without changing or requiring any stored notes. */
  previewNotePlan(partId: string, note: SoundPlan['note']): Promise<PlayableNotePlan>;
  /** Audition an available current-project tone without adding a part or musical history. */
  previewTimbrePlan(timbreId: string, note: SoundPlan['note']): Promise<PlayableNotePlan>;
  /** A temporary body supports live gestures without changing the draft/history. */
  previewPlan(bodyOverride?: PhraseBody, options?: { allowSilence?: boolean }): SoundSequencePlan;
  save(mode: 'overwrite' | 'new', confirmation?: SaveConfirmation): SaveResult;
}
