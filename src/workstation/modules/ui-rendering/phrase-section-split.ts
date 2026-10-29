import type { PhraseBody } from '../../contracts/phrase.ts';

export const PHRASE_SECTION_MIN_RATIO = .15;
export const PHRASE_SECTION_MIN_HEIGHT = 64;

/** Symmetric limits; a small window shares the available height fairly. */
export function phraseSplitBounds(height: number): { min: number; max: number } {
  const min = Number.isFinite(height) && height > 0
    ? Math.min(.5, Math.max(PHRASE_SECTION_MIN_RATIO, PHRASE_SECTION_MIN_HEIGHT / height))
    : PHRASE_SECTION_MIN_RATIO;
  return { min, max: 1 - min };
}

export function clampPhraseSplit(ratio: number, height: number): number {
  const { min, max } = phraseSplitBounds(height);
  return Math.max(min, Math.min(max, Number.isFinite(ratio) ? ratio : .5));
}

/** Prioritize the creation preview while keeping the phrase console visible. */
export function defaultPhraseSplit(_body: PhraseBody | undefined, height: number): number {
  return clampPhraseSplit(.75, height);
}
