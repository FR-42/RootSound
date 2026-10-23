import type { ContentRecord, Draft, SaveConfirmation, SaveResult } from './content.ts';
import type { SoundSequencePlan } from './sound.ts';
import type { PostProductionSettings } from './post-production.ts';

/** Song positions are beats. This explicit choice controls how phrase time is interpreted. */
export type SongTempoMode = 'song' | 'source';
export type SongClip = { id: string; phraseId: string; startBeat: number };
export type SongTrack = {
  id: string; name: string; level: number; pan: number; muted: boolean; solo: boolean; clips: SongClip[];
};
export type SongBody = {
  model: 'phrase-arrangement'; version: 1; timeUnit: 'beat'; tempoBpm: number;
  tempoMode: SongTempoMode;
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
  setTempoMode(mode: SongTempoMode): void;
  setLength(lengthBeats: number): void;
  setPostProduction(settings: PostProductionSettings): void;
  addTrack(name?: string): string;
  updateTrack(trackId: string, changes: Partial<Pick<SongTrack, 'name' | 'level' | 'pan' | 'muted' | 'solo'>>): void;
  removeTrack(trackId: string): void;
  addClip(trackId: string, phraseId: string, startBeat: number): string;
  addClips(inputs: Array<{ trackId: string; phraseId: string; startBeat: number }>): string[];
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
