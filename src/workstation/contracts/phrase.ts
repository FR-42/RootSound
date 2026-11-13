import type { ContentRecord, Draft, SaveConfirmation, SaveResult } from './content.ts';
import type { PlayableNotePlan, SoundPlan, SoundSequencePlan } from './sound.ts';
import type { MidiExpressionLane } from './midi-expression.ts';
import type { CurveControls, PerformanceCurve } from './gain-curve.ts';

/** Legacy default. Each phrase can choose its own editing resolution without retiming notes. */
export const PHRASE_STEPS_PER_BEAT = 4;

/** Omitted older phrases retain four cells per beat; explicit choices are validated. */
export function phraseNotePan(part: Pick<PhrasePart, 'pan'>, note: Pick<PhraseNote, 'pan'>): number {
  return Math.max(-1, Math.min(1, (part.pan ?? 0) + (note.pan ?? 0)));
}

export function phraseStepsPerBeat(body?: Pick<PhraseBody, 'stepsPerBeat'>): number {
  const steps = body?.stepsPerBeat === undefined ? PHRASE_STEPS_PER_BEAT : body.stepsPerBeat;
  if (!Number.isInteger(steps) || steps < 2 || steps > 9) throw new Error('每拍细分的份数必须是 2 至 9 的整数。');
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
  drumLane?: number;
  velocity: number;
  /** Per-note output gain; omitted older notes use unity gain. */
  level?: number;
  /** Per-note stereo position; omitted older notes are centered. */
  pan?: number;
  /** Source ordering at simultaneous MIDI keys/pedals; ordinary edits need no order. */
  midiOnOrder?: number; midiOffOrder?: number;
  midiChannelId?: string | null;
};
export type PhraseSection = 'melody' | 'rhythm';
export type PhraseGainPoint = { beat: number; db: number } & CurveControls;
/** Older unmarked parts belong to Melody; both sections share one phrase clock. */
export type PhrasePart = {
  id: string; name: string; timbreId: string; section?: PhraseSection;
  level?: number; pan?: number;
  gainCurve?: PhraseGainPoint[];
  performanceCurves?: Partial<Record<PerformanceCurve, PhraseGainPoint[]>>;
  /** Unassigned tone uses keep notes and origin identity for rebinding but remain silent. */
  unassigned?: boolean;
  notes: PhraseNote[];
  midiChannelId?: string;
  /** Notes outside a shortened BPM roll, with startBeat local to that roll. */
  hiddenNotes?: { sectionId: string; note: PhraseNote }[];
};
export type PhraseBody = {
  model: 'note-phrase';
  version: 1;
  timeUnit: 'beat';
  tempoBpm: number;
  /** Additional sequential BPM rolls; the first roll starts at beat0/tempoBpm. */
  tempoSections?: {
    id: string; startBeat: number; tempoBpm: number; stepsPerBeat?: number;
    /** Beats elapsed in the local grid at the boundary, modulo one bar. */
    gridOffsetBeats?: number;
  }[];
  lengthBeats: number;
  /** Editing cells per beat only; changing this never quantizes existing notes. Omitted values are four. */
  stepsPerBeat?: number;
  beatsPerBar?: number;
  beatUnit?: number;
  /** Initial incomplete bar, in quarter-note beats. */
  pickupBeats?: number;
  /** Phrase output gain; omitted older content uses unity gain. */
  masterLevel?: number;
  midiExpression?: MidiExpressionLane[];
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
  setMeter(beatsPerBar: number, beatUnit: number): void;
  addTempoSection(): string;
  removeTempoSection(id: string): void;
  setTempoSection(id: string, tempoBpm: number): void;
  /** Change one roll's grid, retaining all note timing and other rolls' resolutions. */
  setTempoSectionSteps(id: string | undefined, stepsPerBeat: number): void;
  previewTempoSectionStart(id: string, startBeat: number, gridOnlyBase?: PhraseBody): PhraseBody;
  setTempoSectionStart(id: string, startBeat: number): void;
  previewLastTempoRollLength(lengthBeats: number, base?: PhraseBody): PhraseBody;
  setLastTempoRollLength(lengthBeats: number): void;
  /** Changes the shared Melody/Rhythm editing grid, preserving every stored note coordinate and duration. */
  setStepsPerBeat(stepsPerBeat: number): void;
  setMasterLevel(level: number): void;
  setLength(lengthBeats: number): void;
  addPart(timbreId: string, section?: PhraseSection): string;
  setPartTimbre(partId: string, timbreId: string): void;
  setPartMix(partId: string, changes: { level?: number; pan?: number }): void;
  setPartGainCurve(partId: string, points: readonly PhraseGainPoint[]): void;
  setPartPerformanceCurve(partId: string, kind: PerformanceCurve, points: readonly PhraseGainPoint[]): void;
  /** Unselecting a tone preserves its notes as silent, undefined tone uses. */
  setPartVisible(partId: string, visible: boolean): void;
  /** Related duplicate uses toggle together in one undo step. */
  setPartsVisible(partIds: string[], visible: boolean): void;
  removePart(partId: string): void;
  /** Removes the selected uses and their notes together, retaining the sound assets. */
  removeParts(partIds: string[]): void;
  mergeParts(sourcePartId: string, targetPartId: string): void;
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
  /** Full MIDI 0–127 keyboard, ascending (C−1–G9), A4=440 Hz; content remains exact Hz. */
  keyboard(): KeyboardPitch[];
  /** Prepare the same current or temporary body that previewPlan will compile. */
  preparePreview(bodyOverride?: PhraseBody): Promise<void>;
  /** Audition one selected voice without changing or requiring any stored notes. */
  previewNotePlan(partId: string, note: SoundPlan['note']): Promise<PlayableNotePlan>;
  /** Audition an available current-project tone without adding a part or musical history. */
  previewTimbrePlan(timbreId: string, note: SoundPlan['note']): Promise<PlayableNotePlan>;
  /** Reference piano remains available with no selected family, even if removed from the library. */
  previewPianoPlan(note: SoundPlan['note']): Promise<PlayableNotePlan>;
  /** A temporary body supports live gestures without changing the draft/history. */
  previewPlan(bodyOverride?: PhraseBody, options?: { allowSilence?: boolean; midiEffects?: boolean }): SoundSequencePlan;
  save(mode: 'overwrite' | 'new', confirmation?: SaveConfirmation): SaveResult;
}
