import type { ContentRecord } from '../../contracts/content.ts';
import studioDefinitions from './studio-instrument-definitions.json' with { type: 'json' };
import generalMidi from './general-midi.json' with { type: 'json' };
export const studioInstrumentCatalogVersion = 3;
export const studioBank = 'rootsound-studio-v1';
export const instrumentCategories = ['键盘', '拨弦', '弦乐', '木管', '铜管', '低音', '打击', '电子', '人声'] as const;
export const studioLibraryGroups = [...new Set(studioDefinitions.map(item => item.libraryGroup))];
export type InstrumentCategory = typeof instrumentCategories[number];
export const DRUM_REFERENCE_FREQUENCY_HZ = 440 * 2 ** ((60 - 69) / 12);
const drumKeys = new Map<string, number>();
for (const item of studioDefinitions) {
  if (typeof item.drum === 'number') {
    drumKeys.set(item.key, item.drum);
  }
}
export function unpitchedDrumKey(body: unknown): number | undefined {
  if (body && typeof body === 'object' && 'model' in body && body.model === 'sample-bank'
    && 'instrument' in body && typeof body.instrument === 'string') return drumKeys.get(body.instrument);
  return undefined;
}
export function defaultInstrumentInfo(id: string, body?: unknown) {
  let key = /^rootsound\.instrument\.([a-z0-9-]+)\.v3(?::|$)/u.exec(id)?.[1];
  if (!key && body && typeof body === 'object' && 'model' in body && body.model === 'sample-bank' && 'instrument' in body) key = String(body.instrument);
  const item = studioDefinitions.find(item => item.key === key);
  if (!item) return undefined;
  const label = 'program' in item ? `GM ${item.program!+1} ${generalMidi.programs[item.program!]}` : `鼓 ${item.drum}`;
  return {...item, aliases:`${label} ${item.key.replaceAll('-',' ')}${item.key==='studio-flute'?' flute 笛子':''}`};
}
export function isStudioInstrument(key: unknown): boolean {
  return studioDefinitions.some(item => item.key === key);
}
export function studioInstrumentForMidi(program: number, drum?: number) {
  if (drum !== undefined) {
    const drums = studioDefinitions.filter(item => item.key.startsWith('studio-black-pearl-') && typeof item.drum === 'number');
    const substitute = drum <= 36 ? 36 : drum <= 40 ? 38 : drum <= 50 ? 45 : 49;
    return (drums.find(item => item.drum === drum && !item.key.endsWith('-half'))
      ?? drums.find(item => item.drum === substitute))!;
  }
  const exact = studioDefinitions.find(item => item.program === program);
  if (exact) return exact;
  const group = Math.floor(program / 8);
  const alternatives = ['piano', 'piano', 'flute', 'guitar', 'bass', 'violin', 'violin',
    'trumpet', 'sax', 'flute', 'flute', 'piano', 'violin', 'violin', 'guitar', 'piano'];
  return studioDefinitions.find(item => item.key === `studio-${alternatives[group] ?? 'piano'}`)!;
}
export function prepareStudioInstruments(): ContentRecord[] {
  return studioDefinitions.map(spec => ({
    id: `rootsound.instrument.${spec.key}.v3`, kind: 'rootsound.timbre', owner: 'timbre', schemaVersion: 1,
    revision: 1, name: spec.name, dependencies: [],
    body: { model: 'sample-bank', version: 1, bank: studioBank, instrument: spec.key, attackSeconds: 0, releaseSeconds: .03, level: .7 },
  }));
}
export function listDefaultInstruments() { return structuredClone(studioDefinitions); }
