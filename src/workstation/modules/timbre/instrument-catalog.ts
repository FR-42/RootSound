import type { ContentRecord } from '../../contracts/content.ts';
import definitions from './sampled-instrument-definitions.json' with { type: 'json' };
import generalMidi from './general-midi.json' with { type: 'json' };
export const instrumentCatalogVersion = 2;
export const instrumentCategories = ['键盘', '拨弦', '弦乐', '木管', '铜管', '低音', '打击', '电子', '人声'] as const;
export type InstrumentCategory = typeof instrumentCategories[number];
export function defaultInstrumentInfo(id: string, body?: unknown) {
  let key = /^rootsound\.instrument\.([a-z0-9-]+)\.v[12](?::|$)/u.exec(id)?.[1];
  if (!key && body && typeof body === 'object' && 'model' in body && body.model === 'sample-bank' && 'instrument' in body) key = String(body.instrument);
  const item=definitions.find(item=>item.key===key)
    ?? definitions.find(item=>'program' in item && key===`gm-${item.program}` || 'drum' in item && key===`gm-drum-${item.drum}`);
  if (!item) return undefined;
  const label = 'program' in item ? `GM ${item.program!+1} ${generalMidi.programs[item.program!]}` : `鼓 ${item.drum}`;
  return {...item,aliases:`${label} ${item.key.replaceAll('-',' ')}${item.key==='flute'?' flute 笛子':''}`};
}
export function listDefaultInstruments() { return structuredClone(definitions); }
export function prepareDefaultInstruments(introducedAfter = 0): ContentRecord[] {
  return definitions.filter(spec=>spec.introduced>introducedAfter).map(spec=>({id:`rootsound.instrument.${spec.key}.v2`,kind:'rootsound.timbre',owner:'timbre',schemaVersion:1,
    revision:1,name:spec.name,dependencies:[],body:{model:'sample-bank',version:1,bank:'generaluser-gs-2.0.3',instrument:spec.key,
      attackSeconds:0,releaseSeconds:.03,level:.7}}));
}
