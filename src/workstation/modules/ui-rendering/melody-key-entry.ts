import { PHRASE_STEPS_PER_BEAT } from '../../contracts/phrase.ts';

/** Physical typing order follows the twelve semitones from C through B. */
export const MELODY_ENTRY_KEYS = 'cfvgbnjmk,l.';
const GRID_EPSILON = 1e-9;

function keyIndex(key: string): number {
  return typeof key === 'string' && key.length === 1 ? MELODY_ENTRY_KEYS.indexOf(key.toLowerCase()) : -1;
}

export function melodyEntryKey(key: string): boolean { return keyIndex(key) >= 0; }

/** Edge octaves are partial because the existing sound domain supports 20–5000 Hz. */
export function melodyEntryPitch(key: string, octave: number): number | undefined {
  const index = keyIndex(key);
  if (index < 0 || !Number.isInteger(octave) || octave < 0 || octave > 8) return;
  const midi = (octave + 1) * 12 + index;
  const frequency = 440 * 2 ** ((midi - 69) / 12);
  return frequency >= 20 && frequency <= 5000 ? frequency : undefined;
}

export type MelodyEntryStep = {
  startBeat: number;
  seconds: number;
  durationSeconds: number;
  /** The last boundary can accept a rest/head move, but not another note. */
  canWrite: boolean;
};

/** A key advances once to the strictly next cell line; it never wraps or extends the phrase. */
export function nextMelodyEntryStep(positionSeconds: number, tempoBpm: number, lengthBeats = 16): MelodyEntryStep | undefined {
  if (!Number.isFinite(positionSeconds) || !Number.isFinite(tempoBpm) || tempoBpm < 40 || tempoBpm > 240
    || !Number.isFinite(lengthBeats) || lengthBeats <= 0) return;
  const limit = lengthBeats;
  const cells = Math.max(0, positionSeconds) * tempoBpm / 60 * PHRASE_STEPS_PER_BEAT;
  const lastCell = limit * PHRASE_STEPS_PER_BEAT;
  if (cells >= lastCell - GRID_EPSILON) return;
  // Converting a head's seconds back to beats can put an exact line a few ulps
  // to either side. Treat that tiny error as the same line before moving on.
  const rounded = Math.round(cells);
  const currentCell = Math.abs(cells - rounded) <= GRID_EPSILON ? rounded : Math.floor(cells);
  const nextCell = currentCell + 1;
  if (nextCell > lastCell + GRID_EPSILON) return;
  const startBeat = nextCell / PHRASE_STEPS_PER_BEAT;
  const durationSeconds = 60 / tempoBpm / PHRASE_STEPS_PER_BEAT;
  return { startBeat, seconds: startBeat * 60 / tempoBpm, durationSeconds,
    canWrite: nextCell + 1 <= lastCell + GRID_EPSILON };
}
