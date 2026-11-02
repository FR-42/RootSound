import type { JsonValue } from '../../contracts/content.ts';
import type { SampleBankTimbreBody, SampleBankZone } from '../../contracts/timbre.ts';
import definitions from './sampled-instrument-definitions.json' with { type: 'json' };

export function readSampleBankBody(value: JsonValue): SampleBankTimbreBody {
  const fail = (): never => { throw new Error('采样乐器的音区或演奏参数无效。'); };
  if (!value || typeof value !== 'object' || Array.isArray(value)) return fail();
  const keys = ['model','version','bank','instrument','attackSeconds','releaseSeconds','level','zones','tuningSemitones'];
  if (Object.keys(value).some(key => !keys.includes(key)) || value.model !== 'sample-bank' || value.version !== 1
    || value.bank !== 'generaluser-gs-2.0.3' || !(definitions.some(item => item.key === value.instrument)
      || typeof value.instrument==='string' && (/^gm-(\d{1,3})$/u.test(value.instrument) && Number(value.instrument.slice(3))<128
        || /^gm-drum-(\d{2})$/u.test(value.instrument) && Number(value.instrument.slice(8))>=35 && Number(value.instrument.slice(8))<=81))) return fail();
  const number = (n: unknown, low: number, high: number): number => typeof n === 'number' && Number.isFinite(n) && n >= low && n <= high ? n : fail();
  let zones: SampleBankZone[] | undefined;
  if (value.zones !== undefined) {
    if (!Array.isArray(value.zones) || !value.zones.length || value.zones.length > 512) return fail();
    zones = value.zones.map(raw => {
      if (!raw || typeof raw !== 'object' || Array.isArray(raw) || Object.keys(raw).some(key => !['keyMin','keyMax','velocityMin','velocityMax','rootFrequencyHz','startSeconds','endSeconds','attackSeconds','releaseSeconds','decaySeconds','sustain','level','loop','sampleId'].includes(key))
        || typeof raw.sampleId !== 'string' || !raw.sampleId.trim()) return fail();
      const startSeconds=number(raw.startSeconds,0,120), endSeconds=number(raw.endSeconds,startSeconds+.000001,120);
      const zone: SampleBankZone = {sampleId:raw.sampleId,keyMin:number(raw.keyMin,0,127),keyMax:number(raw.keyMax,0,127),
        velocityMin:number(raw.velocityMin,0,127),velocityMax:number(raw.velocityMax,0,127),rootFrequencyHz:number(raw.rootFrequencyHz,1,20000),startSeconds,endSeconds,
        attackSeconds:number(raw.attackSeconds,0,2),releaseSeconds:number(raw.releaseSeconds,.01,4),level:number(raw.level,0,1)};
      if(raw.decaySeconds!==undefined)zone.decaySeconds=number(raw.decaySeconds,0,5);
      if(raw.sustain!==undefined)zone.sustain=number(raw.sustain,0,1);
      if (zone.keyMin>zone.keyMax || zone.velocityMin>zone.velocityMax) return fail();
      if (raw.loop !== undefined) {
        if (!raw.loop || typeof raw.loop !== 'object' || Array.isArray(raw.loop) || Object.keys(raw.loop).some(key => !['startSeconds','endSeconds'].includes(key))) return fail();
        const start=number(raw.loop.startSeconds,startSeconds,endSeconds),end=number(raw.loop.endSeconds,start+.000001,endSeconds);
        zone.loop={startSeconds:start,endSeconds:end};
      }
      return zone;
    });
  }
  return {model:'sample-bank',version:1,bank:value.bank,instrument:String(value.instrument),
    attackSeconds:number(value.attackSeconds,0,2),releaseSeconds:number(value.releaseSeconds,.01,4),level:number(value.level,0,1),...(zones ? {zones} : {}),
    ...(value.tuningSemitones===undefined?{}:{tuningSemitones:number(value.tuningSemitones,-127,127)})};
}
export function bankSampleIds(body: SampleBankTimbreBody): string[] { return [...new Set(body.zones?.map(zone=>zone.sampleId) ?? [])]; }
export function selectBankZone<T extends Omit<SampleBankZone,'sampleId'>>(zones: readonly T[], frequency: number, velocity: number): T {
  const key=69+12*Math.log2(frequency/440), strength=Math.round(velocity*127);
  let best: T | undefined; let distance=Infinity;
  for(const zone of zones) {
    const outside=Math.max(zone.keyMin-key,0,key-zone.keyMax), dynamic=Math.max(zone.velocityMin-strength,0,strength-zone.velocityMax);
    // A quiet bow/hammer-noise overlay must not replace the main pitched recording.
    const candidate=outside*1000000+dynamic*10000-(zone.level ?? 1)*100+Math.abs(12*Math.log2(frequency/zone.rootFrequencyHz));
    if(candidate<distance){distance=candidate;best=zone;}
  }
  if(!best) throw new Error('这个乐器没有可播放的采样。');
  return best;
}
