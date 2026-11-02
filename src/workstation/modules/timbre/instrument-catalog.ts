import type { ContentRecord } from '../../contracts/content.ts';
import definitions from './sampled-instrument-definitions.json' with { type: 'json' };
export const instrumentCategories = ['键盘', '拨弦', '弦乐', '木管', '铜管', '低音', '打击', '电子', '人声'] as const;
export type InstrumentCategory = typeof instrumentCategories[number];
export function defaultInstrumentInfo(id: string) {
  const key = /^rootsound\.instrument\.([a-z-]+)\.v[12](?::|$)/u.exec(id)?.[1];
  const item=definitions.find(item=>item.key===key);
  return item ? {...item,aliases:item.key.replaceAll('-',' ')+(item.key==='flute'?' flute 笛子':'')} : undefined;
}
export function listDefaultInstruments() { return structuredClone(definitions); }
export function prepareDefaultInstruments(): ContentRecord[] {
  return definitions.map(spec=>({id:`rootsound.instrument.${spec.key}.v2`,kind:'rootsound.timbre',owner:'timbre',schemaVersion:1,
    revision:1,name:spec.name,dependencies:[],body:{model:'sample-bank',version:1,bank:'generaluser-gs-2.0.3',instrument:spec.key,
      attackSeconds:0,releaseSeconds:.03,level:.7}}));
}
