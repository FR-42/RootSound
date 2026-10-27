export const PHRASE_COMPOSITION_BEATS = 16;
export type PhraseCompositionView = { leftBeat: number; zoom: number };
const clamp = (value: number, low: number, high: number) => Math.min(high, Math.max(low, value));

/** The phrase is a bounded view; zooming never reveals negative or later time. */
export function clampPhraseCompositionView(view: PhraseCompositionView, lengthBeats = PHRASE_COMPOSITION_BEATS): PhraseCompositionView {
  const zoom = clamp(Number.isFinite(view.zoom) ? view.zoom : 1, 1, 32);
  const leftBeat = clamp(Number.isFinite(view.leftBeat) ? view.leftBeat : 0, 0, lengthBeats - lengthBeats / zoom);
  return { leftBeat, zoom };
}
export function phraseCompositionScale(view: PhraseCompositionView, width: number, lengthBeats = PHRASE_COMPOSITION_BEATS): number {
  return Math.max(1, width) * clampPhraseCompositionView(view, lengthBeats).zoom / lengthBeats;
}
export function phraseCompositionBeatAt(view: PhraseCompositionView, width: number, x: number, lengthBeats = PHRASE_COMPOSITION_BEATS): number {
  return clamp(clampPhraseCompositionView(view, lengthBeats).leftBeat + x / phraseCompositionScale(view, width, lengthBeats), 0, lengthBeats);
}
export function panPhraseComposition(view: PhraseCompositionView, width: number, pixels: number, lengthBeats = PHRASE_COMPOSITION_BEATS): PhraseCompositionView {
  return clampPhraseCompositionView({ ...view, leftBeat: view.leftBeat + pixels / phraseCompositionScale(view, width, lengthBeats) }, lengthBeats);
}
export function zoomPhraseComposition(view: PhraseCompositionView, width: number, x: number, factor: number, lengthBeats = PHRASE_COMPOSITION_BEATS): PhraseCompositionView {
  const anchor = clamp(x, 0, Math.max(1, width)); const beat = phraseCompositionBeatAt(view, width, anchor, lengthBeats);
  const next = clampPhraseCompositionView({ ...view, zoom: view.zoom * factor }, lengthBeats);
  return clampPhraseCompositionView({ ...next, leftBeat: beat - anchor / phraseCompositionScale(next, width, lengthBeats) }, lengthBeats);
}
