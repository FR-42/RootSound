import type { SpectralPatch } from '../../../contracts/timbre.ts';
export function normalizePatch(value: unknown): SpectralPatch;
export function createDefaultPatch(): SpectralPatch;
export function createPresets(): { id: string; name: string; patch: SpectralPatch }[];
export function releaseSeconds(envelope: SpectralPatch['amplitude']): number;
