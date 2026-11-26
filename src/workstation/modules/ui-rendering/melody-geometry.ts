import type { KeyboardPitch, PhraseBody, PhraseNote } from '../../contracts/phrase.ts';
import { PHRASE_STEPS_PER_BEAT, phraseStepsPerBeat } from '../../contracts/phrase.ts';
import { playlistSegmentIntersectsRect } from './playlist-geometry.ts';
import { phrasePitchRow } from './phrase-viewport.ts';
import { MIN_TEMPO_BPM, MAX_TEMPO_BPM } from '../../contracts/music-limits.ts';
import { phraseBeatSeconds, phraseSecondsBeat, phraseDurationSeconds, phraseHeldSeconds, phraseTempoSpans, phraseStepsAtBeat, phraseBarBeats, phraseMeterBeatLength } from '../../contracts/phrase-time.ts';

export type MelodyView = { leftSeconds: number; zoom: number; rowHeight: number };
export const melodyPitchTop = (keys: readonly KeyboardPitch[], row: number, height: number) => Math.max(0, Math.min(keys.length, row)) * height;
export const melodyPitchHeight = (_keys: readonly KeyboardPitch[], _row: number, height: number) => height;
export function melodyPitchAt(keys: readonly KeyboardPitch[], y: number, height: number): number {
  return Math.max(0, Math.min(keys.length - 1, Math.floor(y / height)));
}
export const melodySeconds = (beats: number, tempo: number | PhraseBody) => typeof tempo === 'number' ? beats * 60 / tempo : phraseBeatSeconds(tempo, beats);
export const melodyBeats = (seconds: number, tempo: number | PhraseBody) => typeof tempo === 'number' ? seconds * tempo / 60 : phraseSecondsBeat(tempo, seconds);
export function formatPlayheadTime(seconds: number): string {
  const ms = Math.round(seconds * 1000);
  const minutes = String(Math.floor(ms / 60000)).padStart(2, '0');
  const wholeSeconds = String(Math.floor(ms / 1000) % 60).padStart(2, '0');
  return `${minutes}:${wholeSeconds}.${String(ms % 1000).padStart(3, '0')}`;
}
export const melodyDuration = phraseDurationSeconds;
/** Start with usable cells rather than fitting an arbitrarily long score on screen. */
export function initialMelodyView(body: PhraseBody, width: number): MelodyView {
  return clampMelodyView({ leftSeconds: 0, zoom: 8 * 32 * phraseStepsPerBeat(body) * body.tempoBpm / (60 * Math.max(1, width) * phraseMeterBeatLength(body)), rowHeight: 32 }, melodyDuration(body));
}
export const melodyClamp = (value: number, low: number, high: number) => Math.max(low, Math.min(high, value));
export function clampMelodyView(view: MelodyView, duration: number, leadingFraction = 0): MelodyView {
  const zoom = melodyClamp(Number.isFinite(view.zoom) ? view.zoom : 1, .25, 256);
  return { zoom, rowHeight: melodyClamp(view.rowHeight, 12, 44),
    leftSeconds: melodyClamp(view.leftSeconds, leadingFraction ? -8 * leadingFraction / zoom : 0, Math.max(0, duration - 8 / zoom)) };
}
/** A stable seconds scale makes tempo changes visibly move beats, without stretching held notes. */
export const melodyScale = (view: MelodyView, width: number, _duration: number) => Math.max(1, width) * view.zoom / 8;
export function melodyTimeAt(view: MelodyView, width: number, duration: number, x: number): number {
  return melodyClamp(view.leftSeconds + x / melodyScale(view, width, duration), 0, duration);
}
export function zoomMelody(view: MelodyView, width: number, duration: number, x: number, factor: number, leadingFraction = 0): MelodyView {
  const anchor = melodyClamp(x, 0, Math.max(1, width));
  const time = leadingFraction ? view.leftSeconds + anchor / melodyScale(view, width, duration) : melodyTimeAt(view, width, duration, anchor);
  const next = clampMelodyView({ ...view, zoom: view.zoom * factor }, duration, leadingFraction);
  return clampMelodyView({ ...next, leftSeconds: time - anchor / melodyScale(next, width, duration) }, duration, leadingFraction);
}
export function melodyNoteRect(note: PhraseNote, body: PhraseBody, keys: readonly KeyboardPitch[], view: MelodyView, width: number, row = phrasePitchRow(note.frequencyHz, keys)) {
  const scale = melodyScale(view, width, melodyDuration(body));
  return { x: (phraseBeatSeconds(body, note.startBeat) - view.leftSeconds) * scale,
    y: melodyPitchTop(keys, row, view.rowHeight) + 1,
    width: Math.max(0, phraseHeldSeconds(body, note) * scale), height: melodyPitchHeight(keys, row, view.rowHeight) - 2 };
}
export function melodySweepHit(from: { x: number; y: number }, to: { x: number; y: number },
  note: { x: number; y: number; width: number; height: number }, headRadius: number): 'head' | number | undefined {
  const pitch = note.y + note.height / 2;
  const deltaTime = to.x - from.x, deltaPitch = to.y - from.y;
  const lengthSquared = deltaTime ** 2 + deltaPitch ** 2;
  const timeToHead = note.x - from.x, pitchToHead = pitch - from.y;
  const nearest = lengthSquared ? melodyClamp((timeToHead * deltaTime + pitchToHead * deltaPitch) / lengthSquared, 0, 1) : 0;
  const headDistanceSquared = (timeToHead - nearest * deltaTime) ** 2 + (pitchToHead - nearest * deltaPitch) ** 2;
  const headLength = Math.min(note.width, Math.max(1, Math.min(4, note.width * .14)));
  if (headDistanceSquared <= headRadius ** 2 || playlistSegmentIntersectsRect(from, to, { ...note, width: headLength })) return 'head';

  const tolerance = note.height / 2;
  if (!playlistSegmentIntersectsRect(from, to, {
    x: note.x, y: pitch - tolerance, width: note.width, height: tolerance * 2,
  })) return;
  if (Math.abs(deltaPitch) < 1e-9) return Math.max(note.x, Math.min(from.x, to.x));
  const center = (pitch - from.y) / deltaPitch;
  const crossing = from.x + center * deltaTime;
  if (center >= 0 && center <= 1 && crossing >= note.x && crossing <= note.x + note.width) return crossing;
  const range = tolerance / Math.abs(deltaPitch);
  const start = from.x + Math.max(0, center - range) * deltaTime;
  const end = from.x + Math.min(1, center + range) * deltaTime;
  return Math.max(note.x, Math.min(start, end));
}

export function melodyScoreGrid(body: PhraseBody, view: MelodyView, width: number, cellPixels = 48, visibleSeconds = 8 / view.zoom) {
  const result: (ReturnType<typeof melodyDetailGrid>[number] & { sectionId?: string })[] = [];
  const end = view.leftSeconds + visibleSeconds;
  const spans = phraseTempoSpans(body);
  const depth = melodyScoreGridDepth(body, melodyScale(view, width, end), cellPixels);
  for (const span of spans) {
    if (span.endSeconds < view.leftSeconds || span.startSeconds > end) continue;
    const offset = (span.gridOffsetBeats ?? 0) * 60 / span.tempoBpm;
    const origin = span.startSeconds - offset;
    const local = { ...view, leftSeconds: view.leftSeconds - origin };
    const endFromOrigin = span.endSeconds - origin;
    const steps = phraseStepsAtBeat(body, span.startBeat);
    for (const line of melodyGridLines(endFromOrigin, span.tempoBpm, steps, local, width, phraseBarBeats(body), span.startBeat === 0 ? body.pickupBeats ?? 0 : 0, steps ** depth, phraseMeterBeatLength(body), visibleSeconds)) {
      if (line.seconds < offset - 1e-8 || line.seconds >= endFromOrigin - 1e-8 && span.endBeat < body.lengthBeats) continue;
      result.push({ ...line, seconds: line.seconds + origin, sectionId: span.id });
    }
  }
  return result;
}
export function melodyScoreGridDepth(body: PhraseBody, scale: number, minimumCellPixels = 48): number {
  let depth = Infinity;
  for (const span of phraseTempoSpans(body)) {
    const steps = phraseStepsAtBeat(body, span.startBeat);
    depth = Math.min(depth, melodyGridDepth(span.tempoBpm, steps, scale, minimumCellPixels, phraseMeterBeatLength(body)));
    if (!depth) break;
  }
  return depth;
}
function melodyGridDepth(tempo: number, steps: number, scale: number, minimumCellPixels: number, beatSize: number): number {
  const cellPixels = 60 / tempo * beatSize / steps * scale;
  if (cellPixels < (minimumCellPixels || 6)) return 0;
  const threshold = minimumCellPixels || 48;
  return Math.min(1 + Math.max(0, Math.floor(Math.log(cellPixels / threshold) / Math.log(steps) + 1e-12)), Math.floor(Math.log(4096) / Math.log(steps) + 1e-12));
}
/** Only reveal subdivisions when there is room, then subdivide further as zoom increases. */
export function melodyDetailSteps(tempo: number, steps: number, scale: number, minimumCellPixels = 48, beatSize = 1): number {
  return steps ** melodyGridDepth(tempo, steps, scale, minimumCellPixels, beatSize);
}
export function melodyDetailGrid(duration: number, tempo: number, steps: number, view: MelodyView, width: number, beatsPerBar = 4, pickupBeats = 0, minimumCellPixels = 48, beatSize = 1, visibleSeconds = 8 / view.zoom) {
  const divisions = melodyDetailSteps(tempo, steps, melodyScale(view, width, duration), minimumCellPixels, beatSize);
  return melodyGridLines(duration, tempo, steps, view, width, beatsPerBar, pickupBeats, divisions, beatSize, visibleSeconds);
}
function melodyGridLines(duration: number, tempo: number, steps: number, view: MelodyView, width: number, beatsPerBar: number, pickupBeats: number, divisions: number, beatSize: number, visibleSeconds: number) {
  const scale = melodyScale(view, width, duration);
  const cell = 60 / tempo * beatSize / divisions;
  const visibleStart = view.leftSeconds - 1 / scale;
  const visibleEnd = Math.min(duration, view.leftSeconds + visibleSeconds + 1 / scale) + 1e-8;
  const first = Math.max(0, Math.ceil(visibleStart / cell));
  const last = Math.floor(visibleEnd / cell);
  const lines = Array.from({ length: Math.max(0, last - first + 1) }, (_, offset) => {
    const index = first + offset;
    const measure = (index / divisions * beatSize - pickupBeats) / beatsPerBar;
    return { seconds: index * cell, beat: index % divisions === 0, cell: divisions >= steps && index % (divisions / steps) === 0, bar: measure >= -1e-8 && Math.abs(measure - Math.round(measure)) < 1e-8 };
  });
  const pickupCells = pickupBeats / beatSize * divisions;
  if (Math.abs(pickupCells - Math.round(pickupCells)) > 1e-8) {
    const pickupSeconds = pickupBeats * 60 / tempo;
    const barSeconds = beatsPerBar * 60 / tempo;
    const firstBar = Math.max(0, Math.ceil((visibleStart - pickupSeconds) / barSeconds));
    for (let seconds = pickupSeconds + firstBar * barSeconds; seconds <= visibleEnd; seconds += barSeconds) {
      lines.push({ seconds, bar: true, beat: false, cell: false });
    }
    lines.sort((a, b) => a.seconds - b.seconds);
  }
  return lines;
}
/** The grid tempo is a visual ruler; note positions always use the phrase's own clock. */
export function melodyGrid(duration: number, tempo: number, stepsPerBeat = PHRASE_STEPS_PER_BEAT): Array<{ seconds: number; beat: boolean; bar: boolean }> {
  const steps = phraseStepsPerBeat({ stepsPerBeat });
  const cell = 60 / melodyClamp(tempo, MIN_TEMPO_BPM, MAX_TEMPO_BPM) / steps; const result: Array<{ seconds: number; beat: boolean; bar: boolean }> = [];
  for (let index = 0; index * cell <= duration + 1e-8; index++) result.push({ seconds: index * cell, beat: index % steps === 0, bar: index % (steps * 4) === 0 });
  return result;
}
