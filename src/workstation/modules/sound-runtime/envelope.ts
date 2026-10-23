import type { SoundPlan } from '../../contracts/sound.ts';

/** Normalized amplitude, including early release before attack/decay completes. */
export function envelopeValue(envelope: SoundPlan['envelope'], hold: number, age: number): number {
  const { attackSeconds: attack, releaseSeconds: release } = envelope;
  const decay = envelope.decaySeconds ?? 0; const sustain = envelope.sustain ?? 1;
  const pressed = (time: number): number => time < 0 ? 0 : attack > 0 && time < attack ? time / attack
    : decay > 0 && time < attack + decay ? 1 + (sustain - 1) * (time - attack) / decay : sustain;
  if (age < hold) return pressed(age);
  if (release === 0 || age >= hold + release) return 0;
  return pressed(hold) * (1 - (age - hold) / release);
}
