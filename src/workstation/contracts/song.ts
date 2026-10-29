import type { ContentRecord, Draft, SaveConfirmation, SaveResult } from './content.ts';
import type { SoundSequencePlan } from './sound.ts';
import type { PostProductionSettings } from './post-production.ts';

/** Song positions are beats. This explicit choice controls how phrase time is interpreted. */
export type SongTempoMode = 'song' | 'source';
export type SongClip = {
  id: string; phraseId: string; startBeat: number;
  /** Per-instance amplitude; omitted values are 1. Shared phrase content is unchanged. */
  level?: number;
  /** Per-instance pan; omitted values inherit the track's pan. */
  pan?: number;
};
export type SongTrack = {
  id: string; name: string; level: number; pan: number; muted: boolean; solo: boolean; clips: SongClip[];
  /** Optional visual identity, independent of track mix or shared phrase content. */
  color?: string;
  /** Extra row pan offset, applied after each instance's own pan. Omitted values are zero. */
  panOffset?: number;
};
export type SongGridTempoChange = { atSeconds: number; tempoBpm: number };
export type SongBody = {
  model: 'phrase-arrangement'; version: 1; timeUnit: 'beat'; tempoBpm: number;
  tempoMode: SongTempoMode;
  /** Visual beat/bar grid only; omitted values use tempoBpm. Never changes audio timing. */
  gridTempoBpm?: number;
  /** Visual grid sections only; changes restart the grid at their song-clock boundary. */
  gridTempoChanges?: SongGridTempoChange[];
  /** Visual grid phase on the song clock, in seconds; omitted values are 0. */
  gridOffsetSeconds?: number;
  /** Overall arrangement amplitude; omitted values are 1. */
  masterLevel?: number;
  /** Sources kept in this song's library but hidden from its arrangement shelf. No musical references are changed. */
  hiddenPhraseIds?: string[];
  /** Arrangement shelf ordering only; includes hidden sources and adds no musical reference. */
  phraseShelfOrder?: string[];
  /** Song-wide timbre picker order; visual metadata, not musical references. */
  timbreLibraryOrder?: string[];
  /** Starter palette has been prepared once; removed starters must not respawn. */
  melodyTimbresSeeded?: boolean;
  /** Minimum musical extent. Referenced phrase changes can extend the effective extent. */
  lengthBeats: number; tracks: SongTrack[];
  /** Omitted in earlier songs; equivalent to unprocessed output. */
  postProduction?: PostProductionSettings;
};
export type SongClipRef = { trackId: string; clipId: string };
export type SongView = {
  draft?: Draft; body?: SongBody; problem?: string; lengthBeats: number;
  /** Derived once per read, for UI layout without repeatedly decoding shared phrases. */
  clipLengths?: Readonly<Record<string, number>>;
  savedSongs: ContentRecord[]; unfinishedDrafts: Draft[]; availablePhrases: ContentRecord[];
  changed: boolean; canUndo: boolean; canRedo: boolean;
};
export interface SongPlaybackPort {
  listSaved(): ContentRecord[];
  readSaved(id: string): { content: ContentRecord; body: SongBody };
  prepareForSaved(id: string): Promise<void>;
  planForSaved(id: string): SoundSequencePlan;
}
export interface SongEditorPort {
  read(): SongView;
  create(): void;
  /** A complete starting arrangement is created in one write, preserving the previous song draft. */
  createFromPhrase(phraseId: string, name?: string): void;
  open(contentId: string): void;
  openDraft(draftId: string): void;
  rename(name: string): void;
  setTempo(tempoBpm: number): void;
  /** Replaces the visual grid from this position onward, removing all later sections without retiming phrases. */
  setGridTempo(tempoBpm: number, fromSeconds?: number): void;
  /** Shifts only the background grid phase; phrase placement stays on its existing clock. */
  setGridOffset(seconds: number): void;
  setMasterLevel(level: number): void;
  /** Hides or restores a reusable shelf tile without removing its library source or timeline occurrences. */
  setPhraseShelfVisible(phraseId: string, visible: boolean): void;
  /** Moves a visible shelf source in one undoable edit; hidden sources retain their relative slots. */
  reorderPhraseShelf(phraseId: string, targetIndex: number): void;
  setTempoMode(mode: SongTempoMode): void;
  setLength(lengthBeats: number): void;
  setPostProduction(settings: PostProductionSettings): void;
  addTrack(name?: string): string;
  updateTrack(trackId: string, changes: Partial<Pick<SongTrack, 'name' | 'level' | 'pan' | 'muted' | 'solo' | 'color' | 'panOffset'>>): void;
  /** Exclusive solo enables this row; switching it off respects all rows' stored mute/gain values. */
  toggleTrackSolo(trackId: string): void;
  toggleTrackMute(trackId: string): void;
  /** Moves the row as one durable edit, preserving its identity and all instances. */
  reorderTrack(trackId: string, targetIndex: number): void;
  removeTrack(trackId: string): void;
  addClip(trackId: string, phraseId: string, startBeat: number): string;
  addClips(inputs: Array<{ trackId: string; phraseId: string; startBeat: number }>): string[];
  updateClip(trackId: string, clipId: string, changes: Partial<Pick<SongClip, 'level' | 'pan'>>): void;
  /** Applies a row or selection's mix changes atomically, with one undo step. */
  updateClips(updates: Array<SongClipRef & { level?: number; pan?: number }>): void;
  moveClip(trackId: string, clipId: string, targetTrackId: string, startBeat: number): void;
  moveClips(updates: Array<SongClipRef & { targetTrackId: string; startBeat: number }>): void;
  copyClip(trackId: string, clipId: string, targetTrackId?: string, startBeat?: number): string;
  /** Makes adjacent instances of one shared phrase, in a single durable edit. */
  repeatClip(trackId: string, clipId: string, additionalCount: number): string[];
  removeClip(trackId: string, clipId: string): void;
  removeClips(clips: SongClipRef[]): void;
  clipLengthBeats(phraseId: string): number;
  undo(): void;
  redo(): void;
  preparePreview(): Promise<void>;
  /** A temporary body supports live gestures without changing the draft/history. */
  previewPlan(bodyOverride?: SongBody, options?: { allowSilence?: boolean }): SoundSequencePlan;
  save(mode: 'overwrite' | 'new', confirmation?: SaveConfirmation): SaveResult;
}
