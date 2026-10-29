import type { SpectralPatch } from '../../../contracts/timbre.ts';
export function preparePatch(patch: SpectralPatch, rate?: number): unknown;
export class SpectralSynth {
  constructor(rate: number, patch: SpectralPatch, prepared?: unknown);
  noteOn(note: { id: string; midi: number; velocity: number }): void;
  noteOff(id: string): void;
  process(left: Float32Array, right: Float32Array): number;
}
export function renderPatch(patch: SpectralPatch, options?: { midi?: number; velocity?: number; holdSeconds?: number; sampleRate?: number; tailSeconds?: number }): {
  sampleRate: number; left: Float32Array; right: Float32Array; durationSeconds: number; peak: number; tailTruncated: boolean;
};
