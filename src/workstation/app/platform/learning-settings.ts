import type { GuideId, GuideProgress, LearningSettings, LearningSettingsPort } from '../../contracts/guidance.ts';
import type { PreferenceStorage } from './preferences.ts';

export const LEARNING_KEY = 'rootsound.learning.v1';
const LESSON_VERSION = 5;
/** Explicit relearn request: reset lessons, preserving feature choices and music. */
export function restartLearning(storage: PreferenceStorage): void {
  const settings = createLearningSettings(storage).read();
  for (const id of ['basics', 'tempo-rolls'] as const) settings.guides[id] = { status: 'new', step: 0 };
  storage.setItem(LEARNING_KEY, JSON.stringify({ version: 1, lessonVersion: LESSON_VERSION, ...settings }));
}
export function createLearningSettings(storage: PreferenceStorage): LearningSettingsPort {
  const fresh = (): LearningSettings => ({ multipleTempoRolls: false, drumLanes: false, workbench: false,
    guides: { basics: { status: 'new', step: 0 }, 'tempo-rolls': { status: 'new', step: 0 } } });
  let value = fresh();
  try {
    const parsed = JSON.parse(storage.getItem(LEARNING_KEY) ?? 'null');
    if (parsed?.version === 1) {
      value.multipleTempoRolls = parsed.multipleTempoRolls === true;
      value.drumLanes = parsed.drumLanes === true;
      value.workbench = parsed.workbench === true;
      for (const id of ['basics', 'tempo-rolls'] as const) {
        const p = parsed.guides?.[id];
        if (p && ['new', 'learning', 'completed', 'skipped'].includes(p.status)
          && Number.isInteger(p.step) && p.step >= 0 && p.step < 100) {
          value.guides[id] = p.status === 'learning' && parsed.lessonVersion !== LESSON_VERSION
            ? { status: 'new', step: 0 } : { status: p.status, step: p.step };
        }
      }
    }
  } catch { /* A missing local lesson record is a first visit, never a score edit. */ }
  function write(next: LearningSettings) {
    try { storage.setItem(LEARNING_KEY, JSON.stringify({ version: 1, lessonVersion: LESSON_VERSION, ...next })); }
    catch { throw new Error('设置未能保存，请检查本地存储空间后重试。'); }
    value = next;
  }
  return {
    read: () => structuredClone(value),
    setMultipleTempoRolls(enabled) { write({ ...value, multipleTempoRolls: enabled }); },
    setDrumLanes(enabled) { write({ ...value, drumLanes: enabled }); },
    setWorkbench(enabled) { write({ ...value, workbench: enabled }); },
    record(id: GuideId, progress: GuideProgress) { write({ ...value, guides: { ...value.guides, [id]: { ...progress } } }); },
  };
}
