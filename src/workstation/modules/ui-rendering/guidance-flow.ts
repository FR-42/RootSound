import type { GuideId } from '../../contracts/guidance.ts';
import type { PhraseBody } from '../../contracts/phrase.ts';

export type BasicGuideScene = 'rows' | 'columns' | 'pan' | 'note' | 'note-pan' | 'group' | 'add' | 'draw' | 'move' | 'resize' | 'deselect';
export type GuideSceneId = BasicGuideScene | 'bpm' | 'grid' | 'tap' | 'rolls' | 'boundary' | 'done';
export interface GuideScene { id: GuideSceneId; duration: number }

const basics: readonly GuideScene[] = [
  { id: 'rows', duration: 5500 },
  { id: 'columns', duration: 5000 },
  { id: 'pan', duration: 5000 },
  { id: 'note', duration: 4200 },
  { id: 'note-pan', duration: 4700 },
  { id: 'group', duration: 4700 },
  { id: 'add', duration: 4500 },
  { id: 'draw', duration: 6600 },
  { id: 'move', duration: 5200 },
  { id: 'resize', duration: 5000 },
  { id: 'deselect', duration: 4200 },
];
const tempo: readonly GuideScene[] = [
  { id: 'bpm', duration: 11000 }, { id: 'grid', duration: 9500 }, { id: 'tap', duration: 15000 },
  { id: 'rolls', duration: 9000 }, { id: 'boundary', duration: 9000 }, { id: 'done', duration: 3000 },
];
export function guideScenes(id: GuideId): readonly GuideScene[] { return id === 'basics' ? basics : tempo; }
export function guideSceneStart(id: GuideId, index: number): number { return guideScenes(id).slice(0, Math.max(0, Math.min(guideScenes(id).length - 1, index))).reduce((sum, scene) => sum + scene.duration, 0) / 1000; }
export function guideDuration(id: GuideId): number { return guideScenes(id).reduce((sum, scene) => sum + scene.duration, 0) / 1000; }
export function guideSceneAt(id: GuideId, seconds: number): number {
  let time = Number.isFinite(seconds) ? Math.max(0, seconds) * 1000 : 0;
  const scenes = guideScenes(id);
  for (let i = 0; i < scenes.length; i++) { if (time < scenes[i]!.duration || i === scenes.length - 1) return i; time -= scenes[i]!.duration; }
  return 0;
}
export function needsTempoRolls(body: Pick<PhraseBody, 'tempoSections'> | undefined): boolean { return !!body?.tempoSections?.length; }
