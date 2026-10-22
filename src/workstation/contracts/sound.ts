/** Shared, serializable input for the first sound execution capability. */
export type BasicWaveform = 'sine' | 'triangle' | 'sawtooth' | 'square';

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
}

export type PlaybackStatus = 'playing' | 'ended' | 'stopped' | 'failed';

/** An immutable state snapshot; subscribe for subsequent snapshots. */
export interface PlaybackSession {
  readonly id: string;
  readonly status: PlaybackStatus;
  /** Seconds on this execution device's clock, not a date or song position. */
  readonly startedAtSeconds: number;
  readonly endedAtSeconds?: number;
  readonly error?: string;
}

export type SoundDeviceStatus = 'idle' | 'running' | 'suspended' | 'closed' | 'failed';

export type SoundRuntimeEvent =
  | { readonly type: 'session'; readonly session: PlaybackSession }
  | { readonly type: 'device'; readonly status: SoundDeviceStatus; readonly error?: string };

export interface SoundRuntimePort {
  /** First adapter: a new successful request replaces the previous preview. */
  preview(plan: SoundPlan): Promise<PlaybackSession>;
  stop(sessionId: string): void;
  stopAll(): void;
  /** Idempotent; releases the audio device and all sessions. */
  dispose(): Promise<void>;
  /** Immediately supplies the current device state and any active session. */
  subscribe(listener: (event: SoundRuntimeEvent) => void): () => void;
}
