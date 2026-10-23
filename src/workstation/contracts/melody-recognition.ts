import type { ContentRecord, Draft } from './content.ts';
import type { PcmAudio, SoundSequencePlan } from './sound.ts';

export interface RecognizedNote {
  startSeconds: number;
  durationSeconds: number;
  frequencyHz: number;
  velocity: number;
  confidence: number;
}
export interface MelodyAnalysis {
  durationSeconds: number;
  channelIndex: number;
  notes: RecognizedNote[];
  /** Reliable note duration as a fraction of the entire input, including rests. */
  coverage: number;
  warnings: string[];
}
export interface MelodyAnalysisOptions { signal?: AbortSignal; onProgress?: (progress: number) => void }
export interface MelodyAnalyzerPort {
  analyze(audio: PcmAudio, options?: MelodyAnalysisOptions): Promise<MelodyAnalysis>;
  dispose?(): void;
}
export const MAX_MELODY_INPUT_SECONDS = 30;
export interface MelodyRecognitionInput { audio: PcmAudio; sourceToken: string; sourceName: string }
export interface MelodyRecognitionView {
  phase: 'idle' | 'analyzing' | 'ready';
  progress: number;
  sourceName?: string;
  result?: MelodyAnalysis;
  problem?: string;
  adopted?: { contentId: string; draftId: string };
}
export interface MelodyRecognitionPort {
  read(): MelodyRecognitionView;
  analyze(input: MelodyRecognitionInput): Promise<void>;
  previewPlan(): SoundSequencePlan;
  /** Confirmation publishes all generated music atomically; repeat calls reuse it. */
  adopt(name?: string): { content: ContentRecord; draft: Draft };
  cancel(): void;
  dispose(): void;
  subscribe(listener: () => void): () => void;
}
