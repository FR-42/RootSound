import type { OutputProcessingPlan } from './post-production.ts';

/** Shared, serializable input for the first sound execution capability. */
export type BasicWaveform = 'sine' | 'triangle' | 'sawtooth' | 'square' | 'noise';

/** Decoded, planar PCM on its own sample clock; independent of audio devices. */
export interface PcmAudio {
  readonly sampleRate: number;
  readonly channels: readonly Float32Array[];
}
export const MAX_PCM_AUDIO_BYTES = 64 * 1024 * 1024;
export const MAX_SAMPLE_DURATION_SECONDS = 120;

export interface SoundSource {
  readonly waveform: BasicWaveform;
  /** Multiplies note.frequencyHz; this is not a musical tuning system. */
  readonly frequencyRatio: number;
  /** Linear amplitude, from 0 to 1. The sum of all source levels must be <= 1. */
  readonly level: number;
}

export interface SoundPlan {
  readonly kind: 'basic-synth';
  readonly version: 1;
  readonly sources: readonly SoundSource[];
  readonly envelope: {
    readonly attackSeconds: number;
    readonly releaseSeconds: number;
    readonly decaySeconds?: number;
    readonly sustain?: number;
  };
  readonly note: {
    readonly frequencyHz: number;
    /** Time from the beginning of the note until release begins. */
    readonly holdSeconds: number;
    /** Linear amplitude multiplier from 0 to 1. */
    readonly velocity: number;
  };
  /** Overall linear amplitude multiplier from 0 to 1. */
  readonly level: number;
  readonly filter?: { readonly type: 'lowpass' | 'highpass' | 'bandpass'; readonly frequencyHz: number; readonly resonance: number };
  readonly pitch?: { readonly semitones: number; readonly seconds: number };
}

/** An execution-only view of a prepared original sample; content stores references, never PCM. */
export interface SampleSoundPlan {
  readonly kind: 'sample';
  readonly version: 1;
  readonly source: { readonly id: string; readonly revision: number; readonly audio: PcmAudio };
  /** Bounds are always seconds on the original sample's clock. */
  readonly startSeconds: number;
  readonly endSeconds: number;
  /** One-shot resampling: pitch and playback speed change together. */
  readonly playbackRate: number;
  readonly loop?: { readonly startSeconds: number; readonly endSeconds: number };
  readonly envelope: SoundPlan['envelope'];
  /** Generated PCM already contains its complete amplitude/FX tail; do not apply it twice. */
  readonly envelopeBaked?: true;
  readonly note: SoundPlan['note'];
  readonly level: number;
}
export type PlayableNotePlan = SoundPlan | SampleSoundPlan;

/** A finite preview on one device clock; each event owns a complete sound plan. */
export interface SoundSequencePlan {
  readonly kind: 'sequence';
  readonly version: 1;
  /** Musical extent; the runtime preserves this silence and any note release tails. */
  readonly durationSeconds: number;
  /** Playback-head position and speed only. Individual sounds keep their own clock. */
  readonly transport?: { readonly positionSeconds: number; readonly rate: number };
  /** Final-mix processing. Fades include the final note's release tail. */
  readonly output?: OutputProcessingPlan;
  readonly events: readonly {
    readonly atSeconds: number;
    readonly sound: PlayableNotePlan;
    /** -1 is left, 1 is right; omitted values are centered. */
    readonly pan?: number;
  }[];
}

/** Ordinary playable audio, independent of RootSound's editable project formats. */
export interface RenderedAudio {
  readonly bytes: Uint8Array;
  readonly mimeType: 'audio/wav';
  readonly extension: '.wav';
  readonly sampleRate: number;
  readonly channels: 2;
  readonly bitsPerSample: 24;
  readonly durationSeconds: number;
}

export interface AudioRenderOptions {
  readonly sampleRate?: 44100 | 48000 | 96000;
  readonly signal?: AbortSignal;
  /** Fraction from 0 through 1; subscriber errors do not interrupt rendering. */
  readonly onProgress?: (progress: number) => void;
}

export type PlaybackStatus = 'playing' | 'paused' | 'ended' | 'stopped' | 'failed';

/** An immutable state snapshot; subscribe for subsequent snapshots. */
export interface PlaybackSession {
  readonly id: string;
  readonly status: PlaybackStatus;
  /** Seconds on this execution device's clock, not a date or song position. */
  readonly startedAtSeconds: number;
  /** Scheduled duration including release tails, when known by this adapter. */
  readonly durationSeconds?: number;
  readonly endedAtSeconds?: number;
  readonly error?: string;
}

export type SoundDeviceStatus = 'idle' | 'running' | 'suspended' | 'closed' | 'failed';

export type SoundRuntimeEvent =
  | { readonly type: 'session'; readonly session: PlaybackSession }
  | { readonly type: 'device'; readonly status: SoundDeviceStatus; readonly error?: string };

export interface SoundRuntimePort {
  /** A short key/note audition on the same device, independent of the main transport. */
  audition(plan: PlayableNotePlan): Promise<void>;
  cancelAudition(): void;
  /** Play acquired audio through the same global device/session boundary. */
  previewAudio(audio: PcmAudio): Promise<PlaybackSession>;
  /** First adapter: a new successful request replaces the previous preview. */
  preview(plan: PlayableNotePlan | SoundSequencePlan): Promise<PlaybackSession>;
  /**
   * Replace the active session's content at its current device-clock position.
   * Keeps its id and start time; invalid input throws without stopping playback.
   * Returns undefined for an expired, stopped or superseded session. A shorter
   * plan may complete immediately after the brief transition to silence.
   * An empty sequence silences the music while its timeline keeps advancing.
   */
  update(sessionId: string, plan: PlayableNotePlan | SoundSequencePlan): PlaybackSession | undefined;
  /** Optional sequence transport: freeze source ages without suspending the shared device. */
  pause?(sessionId: string): PlaybackSession | undefined;
  /** Continue the paused sequence at its retained source ages, optionally applying edits. */
  resume?(sessionId: string, plan?: SoundSequencePlan): Promise<PlaybackSession>;
  /** Renders on an offline clock; never records or opens the playback device. */
  render(plan: PlayableNotePlan | SoundSequencePlan, options?: AudioRenderOptions): Promise<RenderedAudio>;
  /** Active device seconds, excluding transport pauses; never song seconds or head speed. */
  position(sessionId: string): number | undefined;
  stop(sessionId: string): void;
  stopAll(): void;
  /** Idempotent; releases the audio device and all sessions. */
  dispose(): Promise<void>;
  /** Immediately supplies the current device state and any active session. */
  subscribe(listener: (event: SoundRuntimeEvent) => void): () => void;
}
