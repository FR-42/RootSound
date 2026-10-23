import type { PostProductionPort } from '../../contracts/post-production.ts';
export type { PostProductionPort, PostProductionSettings } from '../../contracts/post-production.ts';

/** Composes an execution plan; sound-runtime alone owns the audio device. */
export function createPostProduction(): PostProductionPort {
  return { apply(plan, settings) {
    if (!settings || Object.keys(settings).some(key => !['enabled', 'level', 'fadeInSeconds', 'fadeOutSeconds'].includes(key))
      || typeof settings.enabled !== 'boolean' || !Number.isFinite(settings.level) || settings.level < 0 || settings.level > 1
      || !Number.isFinite(settings.fadeInSeconds) || settings.fadeInSeconds < 0 || settings.fadeInSeconds > 30
      || !Number.isFinite(settings.fadeOutSeconds) || settings.fadeOutSeconds < 0 || settings.fadeOutSeconds > 30) {
      throw new Error('后期设置无效：音量为 0–100%，淡入和淡出为 0–30 秒。');
    }
    const { output: _previous, ...clean } = plan;
    if (!settings.enabled) return clean;
    return { ...clean, output: { level: settings.level, fadeInSeconds: settings.fadeInSeconds, fadeOutSeconds: settings.fadeOutSeconds } };
  } };
}
