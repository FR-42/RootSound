import type { SoundPlan } from '../../contracts/sound.ts';

const naturalRelease = [[0, 1], [.12, .8], [.32, .39], [.58, .13], [.8, .035], [1, 0]] as const;

export function releaseBreakpoints(envelope: SoundPlan['envelope'], hold: number): number[] {
  return envelope.releaseShape === 'natural' ? naturalRelease.slice(1).map(([time]) => hold + time * envelope.releaseSeconds)
    : [hold + envelope.releaseSeconds];
}

/** Normalized amplitude, including early release before attack/decay completes. */
export function envelopeValue(envelope: SoundPlan['envelope'], hold: number, age: number): number {
  const { attackSeconds: attack, releaseSeconds: release } = envelope;
  const decay = envelope.decaySeconds ?? 0; const sustain = envelope.sustain ?? 1;
  const pressed = (time: number): number => time < 0 ? 0 : attack > 0 && time < attack ? time / attack
    : decay > 0 && time < attack + decay ? 1 + (sustain - 1) * (time - attack) / decay : sustain;
  if (age < hold) return pressed(age);
  if (release === 0 || age >= hold + release) return 0;
  const position = (age - hold) / release;
  if (envelope.releaseShape !== 'natural') return pressed(hold) * (1 - position);
  for (let index = 1; index < naturalRelease.length; index++) {
    const [end, to] = naturalRelease[index]!;
    if (position <= end) {
      const [start, from] = naturalRelease[index - 1]!;
      return pressed(hold) * (from + (to - from) * (position - start) / (end - start));
    }
  }
  return 0;
}
