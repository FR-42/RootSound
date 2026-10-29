import type { ContentRecord, Draft, SaveConfirmation, SaveResult } from './content.ts';
import type { BasicWaveform, PlayableNotePlan, SoundPlan } from './sound.ts';

/** First-path experiment, not a limit on future synthesis or musical pitch. */
export type TimbreBody = {
  model: 'basic-synth';
  version: 1;
  character: 'warm' | 'clear' | 'bright';
  attackSeconds: number;
  releaseSeconds: number;
  level: number;
};
export type SampleTimbreBody = {
  model: 'sample-instrument';
  version: 1 | 2;
  sampleId: string;
  startSeconds: number;
  endSeconds: number;
  rootFrequencyHz: number;
  attackSeconds: number;
  releaseSeconds: number;
  level: number;
  loop?: { startSeconds: number; endSeconds: number };
};
export type SynthesizerBody = {
  model: 'synthesizer'; version: 1;
  sources: { id: string; waveform: BasicWaveform; semitones: number; detuneCents: number; level: number; enabled: boolean }[];
  attackSeconds: number; decaySeconds: number; sustain: number; releaseSeconds: number; level: number;
  filter: { enabled: boolean; type: 'lowpass' | 'highpass' | 'bandpass'; frequencyHz: number; resonance: number };
  pitch: { semitones: number; seconds: number };
};
export type TimbrePreset = { id: string; name: string; category: '旋律' | '低音' | '铺底' | '打击' | '音效'; body: SynthesizerBody };
export type SpectralCurvePoint = { x: number; y: number; curve: number };
export type SpectralPatch = {
  format: 'RootSoundSpectralPatch'; version: 1; name: string; seed: number;
  master: { level: number; glideSeconds: number; polyphony: number; velocitySensitivity: number };
  oscillators: { id: string; enabled: boolean; waveform: 'sine' | 'triangle' | 'saw' | 'pulse' | 'noise';
    level: number; pan: number; semitones: number; cents: number; phase: number; pulseWidth: number;
    unison: number; detuneCents: number; spread: number; fmRatio: number; fmAmount: number }[];
  spectrum: { mix: number; points: SpectralCurvePoint[] };
  amplitude: { points: SpectralCurvePoint[]; sustainIndex: number };
  pitch: { points: SpectralCurvePoint[]; sustainIndex: number };
  lfos: { enabled: boolean; waveform: 'sine' | 'triangle' | 'square' | 'random'; rateHz: number;
    depth: number; target: 'pitch' | 'amplitude' | 'pan' | 'fm' }[];
  effects: { drive: number; delaySeconds: number; delayFeedback: number; delayMix: number;
    chorusMix: number; chorusRateHz: number; chorusDepthMs: number };
};
/** Exact parameter document; ordinary synthesis controls must not flatten these curves. */
export type SpectralTimbreBody = {
  model: 'spectral-synth'; version: 1; patch: SpectralPatch;
  /** Derived display metadata, validated against the patch. */
  attackSeconds: number; releaseSeconds: number; level: number;
};
export type EditableTimbreBody = TimbreBody | SampleTimbreBody | SynthesizerBody | SpectralTimbreBody;

export type TimbreView = {
  draft: Draft;
  body: EditableTimbreBody;
  sample?: { name: string; durationSeconds: number; waveform: readonly number[]; ready: boolean };
  savedSounds: ContentRecord[];
  unfinishedDrafts: Draft[];
  changed: boolean;
  canUndo: boolean;
  canRedo: boolean;
};

/** Compiles a saved sound through its owning module; callers keep only its identity. */
export interface TimbrePlaybackPort {
  listSaved(): ContentRecord[];
  readSaved(contentId: string): { content: ContentRecord; body: EditableTimbreBody };
  prepareForSaved(contentId: string, notes?: readonly SoundPlan['note'][]): Promise<void>;
  planForSaved(contentId: string, note: SoundPlan['note']): PlayableNotePlan;
}

export interface TimbreEditorPort {
  read(): TimbreView;
  create(): void;
  createFromPreset(presetId: string): void;
  setSynthesis(body: SynthesizerBody): void;
  undo(): void;
  redo(): void;
  /** An independent editable sound; retrying the same unchanged source reuses its draft. */
  createFromSample(sampleId: string, signal?: AbortSignal): Promise<void>;
  open(contentId: string): void;
  openDraft(draftId: string): void;
  rename(name: string): void;
  setCharacter(character: TimbreBody['character']): void;
  setEnvelope(attackSeconds: number, releaseSeconds: number): void;
  setLevel(level: number): void;
  setSampleRange(startSeconds: number, endSeconds: number): void;
  setRootFrequency(frequencyHz: number): void;
  setSampleLoop(loop?: { startSeconds: number; endSeconds: number }): void;
  /** Async codec work happens explicitly before synchronous clock scheduling. */
  preparePreview(notes?: readonly SoundPlan['note'][]): Promise<void>;
  /** A temporary body is validated and compiled without saving an edit. */
  previewPlan(bodyOverride?: EditableTimbreBody, note?: SoundPlan['note']): PlayableNotePlan;
  save(mode: 'overwrite' | 'new', confirmation?: SaveConfirmation): SaveResult;
  /** A standalone basic sound, not a complete song/project package. */
  exportSound(): string;
  /** Adds an independent draft; existing sounds and their references stay intact. */
  importSound(text: string): void;
}
