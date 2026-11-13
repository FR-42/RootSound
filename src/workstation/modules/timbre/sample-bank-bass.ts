import type { PcmAudio } from '../../contracts/sound.ts';

const bassCurves: Readonly<Record<string, readonly (readonly [number, number])[]>> = {
  'studio-piano': [[24, 4.5], [36, 3.5], [48, 1.5], [60, 0]],
  'studio-sax': [[36, 5], [48, 3], [60, 0]],
  'studio-guitar': [[30, 3], [42, 2], [57, 0]],
  'studio-violin': [[36, 5], [52, 3], [64, 0]],
  'studio-viola': [[36, 10], [48, 8], [60, 0]],
  'studio-cello': [[30, 8], [40, 5], [48, 3], [60, 0]],
  'studio-flute': [[48, 10], [60, 8], [72, 0]],
  'studio-trumpet': [[40, 7], [52, 5], [64, 0]],
  'studio-trombone': [[36, 9], [48, 6], [67, 0]],
  'studio-horn': [[36, 9], [48, 5], [63, 0]],
  'studio-dizi': [[28, 6], [40, 3], [58, 0]],
};

export function sampleBassCompensation(instrument: string, frequencyHz: number) {
  const points = bassCurves[instrument];
  if (!points) return undefined;
  const pitch = 69 + 12 * Math.log2(frequencyHz / 440);
  let decibels = points[0]![1];
  for (let index = 1; index < points.length; index++) {
    const [end, gain] = points[index]!;
    if (pitch < end) {
      const [start, previous] = points[index - 1]!;
      const t = Math.max(0, (pitch - start) / (end - start));
      decibels = previous + (gain - previous) * t * t * (3 - 2 * t);
      break;
    }
    decibels = gain;
  }
  const t = Math.min(1, decibels / 4.5);
  return decibels > 0 ? { gain: 10 ** (decibels / 20), onsetMix: t * t * (3 - 2 * t) } : undefined;
}

export function quietSampleLead(audio: PcmAudio, startSeconds: number, endSeconds: number): number {
  const { channels, sampleRate } = audio;
  const block = Math.max(1, Math.round(sampleRate * .005));
  const start = Math.round(startSeconds * sampleRate);
  const end = Math.min(Math.floor(endSeconds * sampleRate), channels[0]!.length, start + block * 110);
  const powers: number[] = [];
  let peak = 0;
  for (let from = start; from + block <= end; from += block) {
    let power = 0;
    for (const channel of channels) {
      for (let frame = from; frame < from + block; frame++) power += channel[frame]! ** 2;
    }
    powers.push(power);
    peak = Math.max(peak, power);
  }
  if (peak === 0) return 0;
  const threshold = peak * .12 ** 2;
  const onset = powers.findIndex((power, index) => power >= threshold && (powers[index + 1] ?? 0) >= threshold);
  return Math.max(0, Math.min(.16, onset * block / sampleRate - .01));
}
