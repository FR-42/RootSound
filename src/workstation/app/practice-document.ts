import type { GuideId, PracticeDocument, PracticeFactory } from '../contracts/guidance.ts';
import type { PreferenceStorage } from './platform/preferences.ts';
import { createWebDemoModel } from './web-demo-model.ts';
import { createWebExampleModel, webExampleSnapshot } from './web-demo-example.ts';

/** Original short exercise. Only this document, never a user's work, is remembered automatically. */
export function createPracticeFactory(storage: PreferenceStorage,
  save: (text: string, name: string) => Promise<'saved' | 'download-started' | 'cancelled'>): PracticeFactory {
  return (id: GuideId, resume: boolean): PracticeDocument => {
    const key = `rootsound.practice.${id}.v1`;
    let model: ReturnType<typeof createWebDemoModel> | undefined;
    if (resume) try { const text = storage.getItem(key); if (text) model = createWebExampleModel(JSON.parse(text)); } catch { /* Restart the isolated exercise if its local copy is unavailable. */ }
    if (!model) {
      model = createWebDemoModel(undefined, '第一次创作');
      const score = model.score, voice = score.read().body!.parts[0]!.id;
      score.setTempo(110); score.setLength(16);
      const line = [64, 67, 69, 67, 64, 62, 60, 62, 64, 67, 72, 71, 69, 67, 64, 60];
      score.addNotes(voice, line.map((pitch, index) => ({ startBeat: index, durationBeats: index === 15 ? .95 : .72,
        frequencyHz: 440 * 2 ** ((pitch - 69) / 12), velocity: .8, level: .9 })));
      const pad = model.addGroup(model.palette.find(tone => tone.key === 'bell-pluck')!.id);
      score.addNotes(pad, [48, 53, 55, 48].flatMap((pitch, index) => [0, 7].map(interval => ({ startBeat: index * 4,
        durationBeats: 2.8, frequencyHz: 440 * 2 ** ((pitch + interval - 69) / 12), velocity: .6, level: .44 }))));
    }
    const practice = model;
    return {
      phrase: practice.score, listTimbres: () => practice.palette.filter(tone => ['piano', 'flute', 'string-ensemble'].includes(tone.key)),
      addGroup: tone => practice.addGroup(tone), changeTone: (part, tone) => practice.changeTone(part, tone),
      async save() { return save(await practice.save(), practice.score.read().draft!.name); },
      remember() { storage.setItem(key, JSON.stringify(webExampleSnapshot(practice))); },
    };
  };
}
