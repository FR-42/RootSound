import type { KeyboardPitch, PhraseBody, PhraseNote } from '../../contracts/phrase.ts';
import { PHRASE_STEPS_PER_BEAT, phraseStepsPerBeat } from '../../contracts/phrase.ts';
import { phrasePitchRow } from './phrase-viewport.ts';

export type MelodyView = { leftSeconds: number; zoom: number; rowHeight: number };
export const melodyPitchTop = (keys: readonly KeyboardPitch[], row: number, height: number) => Math.max(0, Math.min(keys.length, row)) * height;
export const melodyPitchHeight = (_keys: readonly KeyboardPitch[], _row: number, height: number) => height;
export function melodyPitchAt(keys: readonly KeyboardPitch[], y: number, height: number): number {
  return Math.max(0, Math.min(keys.length - 1, Math.floor(y / height)));
}
export const melodySeconds = (beats: number, tempo: number) => beats * 60 / tempo;
export const melodyBeats = (seconds: number, tempo: number) => seconds * tempo / 60;
export const melodyDuration = (body: PhraseBody) => melodySeconds(body.lengthBeats, body.tempoBpm);
/** Start with usable cells rather than fitting an arbitrarily long score on screen. */
export function initialMelodyView(body: PhraseBody, width: number): MelodyView {
  return clampMelodyView({ leftSeconds: 0, zoom: 8 * 32 * phraseStepsPerBeat(body) * body.tempoBpm / (60 * Math.max(1, width)), rowHeight: 32 }, melodyDuration(body));
}
export const melodyClamp = (value: number, low: number, high: number) => Math.max(low, Math.min(high, value));
export function clampMelodyView(view: MelodyView, duration: number): MelodyView {
  const zoom = melodyClamp(Number.isFinite(view.zoom) ? view.zoom : 1, .25, 256);
  return { zoom, rowHeight: melodyClamp(view.rowHeight, 12, 44),
    leftSeconds: melodyClamp(view.leftSeconds, 0, Math.max(0, duration - 8 / zoom)) };
}
/** A stable seconds scale makes tempo changes visibly move beats, without stretching held notes. */
export const melodyScale = (view: MelodyView, width: number, _duration: number) => Math.max(1, width) * view.zoom / 8;
export function melodyTimeAt(view: MelodyView, width: number, duration: number, x: number): number {
  return melodyClamp(view.leftSeconds + x / melodyScale(view, width, duration), 0, duration);
}
export function zoomMelody(view: MelodyView, width: number, duration: number, x: number, factor: number): MelodyView {
  const anchor = melodyClamp(x, 0, Math.max(1, width)); const time = melodyTimeAt(view, width, duration, anchor);
  const next = clampMelodyView({ ...view, zoom: view.zoom * factor }, duration);
  return clampMelodyView({ ...next, leftSeconds: time - anchor / melodyScale(next, width, duration) }, duration);
}
export function melodyNoteRect(note: PhraseNote, body: PhraseBody, keys: readonly KeyboardPitch[], view: MelodyView, width: number) {
  const scale = melodyScale(view, width, melodyDuration(body));
  const row = phrasePitchRow(note.frequencyHz, keys);
  return { x: (melodySeconds(note.startBeat, body.tempoBpm) - view.leftSeconds) * scale,
    y: melodyPitchTop(keys, row, view.rowHeight) + 1,
    width: Math.max(0, (note.durationSeconds ?? melodySeconds(note.durationBeats, body.tempoBpm)) * scale), height: melodyPitchHeight(keys, row, view.rowHeight) - 2 };
}
/** Only reveal subdivisions when there is room, then subdivide further as zoom increases. */
export function melodyDetailSteps(tempo: number, steps: number, scale: number): number {
  const cellPixels = 60 / tempo / steps * scale;
  return cellPixels < 48 ? 1 : steps * 2 ** Math.min(Math.floor(Math.log2(cellPixels / 48)), Math.floor(Math.log2(4096 / steps)));
}
export function melodyDetailGrid(duration: number, tempo: number, steps: number, view: MelodyView, width: number, beatsPerBar = 4, pickupBeats = 0) {
  const scale = melodyScale(view, width, duration), divisions = melodyDetailSteps(tempo, steps, scale);
  const cell = 60 / tempo / divisions;
  const first = Math.max(0, Math.ceil((view.leftSeconds - 1 / scale) / cell));
  const last = Math.floor((Math.min(duration, view.leftSeconds + (width + 1) / scale) + 1e-8) / cell);
  return Array.from({ length: Math.max(0, last - first + 1) }, (_, offset) => {
    const index = first + offset;
    const measure = (index / divisions - pickupBeats) / beatsPerBar;
    return { seconds: index * cell, beat: index % divisions === 0, bar: measure >= 0 && Math.abs(measure - Math.round(measure)) < 1e-8 };
  });
}
/** The grid tempo is a visual ruler; note positions always use the phrase's own clock. */
export function melodyGrid(duration: number, tempo: number, stepsPerBeat = PHRASE_STEPS_PER_BEAT): Array<{ seconds: number; beat: boolean; bar: boolean }> {
  const steps = phraseStepsPerBeat({ stepsPerBeat });
  const cell = 60 / melodyClamp(tempo, 40, 240) / steps; const result: Array<{ seconds: number; beat: boolean; bar: boolean }> = [];
  for (let index = 0; index * cell <= duration + 1e-8; index++) result.push({ seconds: index * cell, beat: index % steps === 0, bar: index % (steps * 4) === 0 });
  return result;
}
