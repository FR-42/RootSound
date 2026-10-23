import type { ContentRecord } from './content.ts';
import type { PcmAudio } from './sound.ts';

export interface SampleBody {
  model: 'audio-sample'; version: 1;
  source: { kind: 'file' | 'microphone'; name: string; mimeType: string };
  audio: { encoding: 'base64'; byteLength: number; data: string };
  /** Information about the decoded audition, not a claim about source encoding. */
  decoded: { sampleRate: number; channels: number; frames: number; durationSeconds: number };
}
export interface SampleDecoderPort { decode(bytes: Uint8Array): Promise<PcmAudio> }
/** Decode belongs to sampling; other modules prepare and read by shared material identity. */
export interface SampleAudioPort {
  prepare(ids: readonly string[]): Promise<void>;
  readPrepared(id: string): { id: string; revision: number; audio: PcmAudio; waveform: readonly number[] };
}
export interface SampleRecording {
  result: Promise<PcmAudio>;
  stop(): void;
  cancel(): void;
}
export interface SampleCapturePort {
  start(onProgress: (seconds: number, level: number) => void): Promise<SampleRecording>;
  /** Also invalidates a pending permission request; late streams must be closed. */
  cancel(): void;
}
export const MAX_RECORDING_SECONDS = 30;
export interface SampleSummary { id: string; name: string; durationSeconds?: number }
export interface SamplingView {
  phase: 'idle' | 'loading' | 'requesting' | 'recording' | 'processing';
  name: string;
  currentId?: string;
  /** Changes only when the completed source audio changes, not when it is named or saved. */
  audioToken?: string;
  sourceKind?: 'file' | 'microphone';
  durationSeconds?: number;
  sampleRate?: number;
  channelCount?: number;
  waveform: number[];
  elapsedSeconds: number;
  inputLevel: number;
  changed: boolean;
  savedSamples: SampleSummary[];
  problem?: string;
}
export interface SamplingPort {
  read(): SamplingView;
  importFile(): Promise<void>;
  startRecording(): Promise<void>;
  stopRecording(): Promise<void>;
  cancelRecording(): void;
  open(id: string): Promise<void>;
  rename(name: string): void;
  save(): ContentRecord;
  previewAudio(): PcmAudio;
  /** Read-only library audition; does not replace the pending imported/recorded audio. */
  audioForSaved(id: string): Promise<PcmAudio>;
  /** Cancel acquisition on leaving the workspace, retaining completed pending audio. */
  leave(): void;
  dispose(): void;
  subscribe(listener: () => void): () => void;
}
