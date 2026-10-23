import type { SoundSequencePlan } from './sound.ts';

/** Whole-song output controls; source phrases and timbres remain unchanged. */
export type PostProductionSettings = {
  enabled: boolean;
  level: number;
  fadeInSeconds: number;
  fadeOutSeconds: number;
};
/** Final-mix controls understood by the common execution boundary. */
export type OutputProcessingPlan = Omit<PostProductionSettings, 'enabled'>;
export interface PostProductionPort {
  apply(plan: SoundSequencePlan, settings: PostProductionSettings): SoundSequencePlan;
}
