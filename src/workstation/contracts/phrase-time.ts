import { phraseStepsPerBeat, type PhraseBody, type PhraseGainPoint } from './phrase.ts';
import { MAX_PHRASE_BEATS } from './phrase-limits.ts';

export type PhraseTempoSpan = { id?: string; startBeat: number; endBeat: number; startSeconds: number; endSeconds: number; tempoBpm: number; gridOffsetBeats?: number };
export const phraseMeterBeatLength = (body: Pick<PhraseBody, 'beatUnit'>) => 4 / (body.beatUnit ?? 4);
export const phraseBarBeats = (body: Pick<PhraseBody, 'beatsPerBar' | 'beatUnit'>) => (body.beatsPerBar ?? 4) * phraseMeterBeatLength(body);
export function isSupportedMeter(numerator: number, denominator: number): boolean {
  return Number.isInteger(numerator) && numerator >= 1 && numerator <= 16 && [1, 2, 4, 8, 16, 32].includes(denominator);
}
const clocks = new WeakMap<PhraseBody, PhraseTempoSpan[]>();
/** All departments use the same beat/second boundary, including variable tempo. */
export function phraseTempoSpans(body: PhraseBody): readonly PhraseTempoSpan[] {
  const cached = clocks.get(body); if (cached) return cached;
  const points = [{ startBeat: 0, tempoBpm: body.tempoBpm, id: undefined as string | undefined }, ...(body.tempoSections ?? [])];
  let seconds = 0;
  const spans = points.map((point, index) => {
    const endBeat = points[index + 1]?.startBeat ?? body.lengthBeats, startSeconds = seconds;
    seconds += (endBeat - point.startBeat) * 60 / point.tempoBpm;
    return { ...point, endBeat, startSeconds, endSeconds: seconds };
  });
  clocks.set(body, spans); return spans;
}
export function phraseTempoBoundary(body: PhraseBody, id: string) {
  const spans = phraseTempoSpans(body);
  const index = spans.findIndex(span => span.id === id);
  if (index < 1) throw new Error('这个BPM卷帘已不存在。');
  const upper = spans[index - 1]!, lower = spans[index]!;
  const ratio = lower.tempoBpm / upper.tempoBpm;
  const beatShiftPerBeat = 1 - ratio;
  // Leave each adjacent roll at least one beat, or its existing size for a short import.
  const beatSize = phraseMeterBeatLength(body);
  let minimum = upper.startBeat + Math.min(beatSize, upper.endBeat - upper.startBeat);
  let maximum = lower.startBeat + (lower.endBeat - lower.startBeat - Math.min(beatSize, lower.endBeat - lower.startBeat)) / ratio;
  if (beatShiftPerBeat !== 0) {
    const limit = lower.startBeat + (MAX_PHRASE_BEATS - body.lengthBeats) / beatShiftPerBeat;
    if (beatShiftPerBeat < 0) minimum = Math.max(minimum, limit);
    else maximum = Math.min(maximum, limit);
  }
  return { index, upper, lower, ratio, beatShiftPerBeat, minimum, maximum };
}
function find(body: PhraseBody, position: number, field: 'startBeat' | 'startSeconds'): PhraseTempoSpan {
  const spans = phraseTempoSpans(body); let low = 0, high = spans.length;
  while (low < high) { const mid = (low + high) >>> 1; if (spans[mid]![field] <= position) low = mid + 1; else high = mid; }
  return spans[Math.max(0, low - 1)]!;
}
export function phraseBeatSeconds(body: PhraseBody, beat: number): number {
  const span = find(body, beat, 'startBeat'); return span.startSeconds + (beat - span.startBeat) * 60 / span.tempoBpm;
}
export function phraseSecondsBeat(body: PhraseBody, seconds: number): number {
  const span = find(body, seconds, 'startSeconds'); return span.startBeat + (seconds - span.startSeconds) * span.tempoBpm / 60;
}
export const phraseDurationSeconds = (body: PhraseBody) => phraseBeatSeconds(body, body.lengthBeats);
export function phraseGainTimeline(body: PhraseBody, points: readonly PhraseGainPoint[], ratio = 1) {
  return points.map(({ beat, ...point }) => ({ ...point, atSeconds: phraseBeatSeconds(body, beat) * ratio }));
}
export const phraseTempoAtBeat = (body: PhraseBody, beat: number) => find(body, beat, 'startBeat').tempoBpm;
export const phraseTempoSpanAtBeat = (body: PhraseBody, beat: number) => find(body, beat, 'startBeat');
export function phraseStepsAtBeat(body: PhraseBody, beat: number): number {
  const id = find(body, beat, 'startBeat').id;
  const section = id ? body.tempoSections?.find(section => section.id === id) : undefined;
  return phraseStepsPerBeat({ stepsPerBeat: section?.stepsPerBeat ?? body.stepsPerBeat });
}
export const phraseHeldSeconds = (body: PhraseBody, note: { startBeat: number; durationBeats: number; durationSeconds?: number }) =>
  note.durationSeconds ?? phraseBeatSeconds(body, note.startBeat + note.durationBeats) - phraseBeatSeconds(body, note.startBeat);
export const phraseHeldBeats = (body: PhraseBody, startBeat: number, seconds: number) =>
  phraseSecondsBeat(body, phraseBeatSeconds(body, startBeat) + seconds) - startBeat;
