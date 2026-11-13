import type { SoundGainPoint } from './sound.ts';

export const MAX_GAIN_CURVE_POINTS = 2048;
export const dbAmplitude = (db: number) => 10 ** (db / 20);

export const PERFORMANCE_CURVES = ['pitch', 'velocity', 'sustain', 'sostenuto', 'soft'] as const;
export type PerformanceCurve = typeof PERFORMANCE_CURVES[number];
export type CurveKind = 'gain' | PerformanceCurve;
export const CURVE_LIMITS = { gain: 12, pitch: 12, velocity: 100, sustain: 1, sostenuto: 1, soft: 1 } satisfies Record<CurveKind, number>;
export const GAIN_CURVE_LIMIT_DB = CURVE_LIMITS.gain;
export const isPedalCurve = (kind: CurveKind) => kind === 'sustain' || kind === 'sostenuto' || kind === 'soft';
export type CurveControls = { before?: number; after?: number };

function gainSlope(points: readonly SoundGainPoint[], index: number): number {
  const before = points[index - 1], point = points[index]!, after = points[index + 1];
  if (!before || !after) return 0;
  const left = point.atSeconds - before.atSeconds, right = after.atSeconds - point.atSeconds;
  const up = (point.db - before.db) / left, down = (after.db - point.db) / right;
  if (up * down <= 0) return 0;
  const a = 2 * right + left, b = right + 2 * left;
  return (a + b) / (a / up + b / down);
}

export function gainSegmentControls(points: readonly SoundGainPoint[], index: number): [number, number] {
  const from = points[index]!, to = points[index + 1]!;
  const span = (to.atSeconds - from.atSeconds) / 3;
  return [from.after ?? from.db + gainSlope(points, index) * span, to.before ?? to.db - gainSlope(points, index + 1) * span];
}

export function splitGainSegment(points: readonly SoundGainPoint[], index: number, seconds: number) {
  const from = points[index]!, to = points[index + 1]!;
  const fraction = (seconds - from.atSeconds) / (to.atSeconds - from.atSeconds);
  const mix = (a: number, b: number) => a + (b - a) * fraction;
  const [a, b] = gainSegmentControls(points, index);
  const left = mix(from.db, a), middle = mix(a, b), right = mix(b, to.db);
  const before = mix(left, middle), after = mix(middle, right);
  return { left, right, before, after, db: mix(before, after) };
}

export function stepGainAtTime(points: readonly SoundGainPoint[], seconds: number): number {
  return points[segmentAfter(points, seconds) - 1]?.db ?? 0;
}

function cubic(from: number, a: number, b: number, to: number, fraction: number): number {
  const rest = 1 - fraction;
  return from * rest ** 3 + 3 * a * rest ** 2 * fraction + 3 * b * rest * fraction ** 2 + to * fraction ** 3;
}

export function segmentAfter(points: readonly SoundGainPoint[], seconds: number): number {
  let low = 0, high = points.length;
  while (low < high) {
    const middle = (low + high) >>> 1;
    if (points[middle]!.atSeconds <= seconds) low = middle + 1;
    else high = middle;
  }
  return low;
}

export function gainAtTime(points: readonly SoundGainPoint[], seconds: number, smooth = true): number {
  const index = segmentAfter(points, seconds);
  const left = points[index - 1], right = points[index];
  if (!left || !right) return left?.db ?? right?.db ?? 0;
  const fraction = (seconds - left.atSeconds) / (right.atSeconds - left.atSeconds);
  if (!smooth) return left.db + (right.db - left.db) * fraction;
  const [a, b] = gainSegmentControls(points, index - 1);
  return cubic(left.db, a, b, right.db, fraction);
}

export function sampleGainCurve(points: SoundGainPoint[]): SoundGainPoint[] {
  const sampled: SoundGainPoint[] = [];
  for (let index = 0; index < points.length; index++) {
    const point = points[index]!, next = points[index + 1];
    sampled.push(point);
    if (!next) continue;
    const [a, b] = gainSegmentControls(points, index);
    if (point.db === next.db && a === point.db && b === point.db) continue;
    const span = next.atSeconds - point.atSeconds;
    for (let step = 1; step < 12; step++) {
      const fraction = step / 12, atSeconds = point.atSeconds + span * fraction;
      if (atSeconds > sampled.at(-1)!.atSeconds && atSeconds < next.atSeconds) {
        sampled.push({ atSeconds, db: cubic(point.db, a, b, next.db, fraction) });
      }
    }
  }
  return sampled;
}
