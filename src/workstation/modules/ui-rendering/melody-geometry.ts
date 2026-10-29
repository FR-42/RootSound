import type { KeyboardPitch, PhraseBody, PhraseNote } from '../../contracts/phrase.ts';
import { PHRASE_STEPS_PER_BEAT, phraseStepsPerBeat } from '../../contracts/phrase.ts';
import { phrasePitchRow } from './phrase-viewport.ts';

export type MelodyView = { leftSeconds: number; zoom: number; rowHeight: number };
export const melodySeconds = (beats: number, tempo: number) => beats * 60 / tempo;
export const melodyBeats = (seconds: number, tempo: number) => seconds * tempo / 60;
export const melodyDuration = (body: PhraseBody) => melodySeconds(body.lengthBeats, body.tempoBpm);
export const melodyClamp = (value: number, low: number, high: number) => Math.max(low, Math.min(high, value));
export function clampMelodyView(view: MelodyView, duration: number): MelodyView {
  const zoom = melodyClamp(Number.isFinite(view.zoom) ? view.zoom : 1, .25, 32);
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
  return { x: (melodySeconds(note.startBeat, body.tempoBpm) - view.leftSeconds) * scale,
    y: phrasePitchRow(note.frequencyHz, keys) * view.rowHeight + 1,
    width: Math.max(0, (note.durationSeconds ?? melodySeconds(note.durationBeats, body.tempoBpm)) * scale), height: view.rowHeight - 2 };
}
/** The grid tempo is a visual ruler; note positions always use the phrase's own clock. */
export function melodyGrid(duration: number, tempo: number, stepsPerBeat = PHRASE_STEPS_PER_BEAT): Array<{ seconds: number; beat: boolean; bar: boolean }> {
  const steps = phraseStepsPerBeat({ stepsPerBeat });
  const cell = 60 / melodyClamp(tempo, 40, 240) / steps; const result: Array<{ seconds: number; beat: boolean; bar: boolean }> = [];
  for (let index = 0; index * cell <= duration + 1e-8; index++) result.push({ seconds: index * cell, beat: index % steps === 0, bar: index % (steps * 4) === 0 });
  return result;
}
