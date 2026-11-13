import type { MaterialLibrary } from '../../contracts/content.ts';
import type { SampleAudioPort } from '../../contracts/sampling.ts';
import type { PcmAudio, SampleSoundPlan, SoundPlan } from '../../contracts/sound.ts';
import type { SampleBankTimbreBody, SampleBankZone } from '../../contracts/timbre.ts';
import { decodePcmWav } from '../sampling/audio.ts';
import { readSampleBankBody, selectBankZones } from './sample-bank-model.ts';
import { quietSampleLead, sampleBassCompensation } from './sample-bank-bass.ts';
import { defaultInstrumentInfo, DRUM_REFERENCE_FREQUENCY_HZ, unpitchedDrumKey } from './instrument-catalog.ts';

type AssetZone = Omit<SampleBankZone,'sampleId'> & { asset:string; byteLength:number; sampleRate:number; channels:number; frames:number };
type Asset = { audio:PcmAudio };
export type SampleBankAudio = ReturnType<typeof createSampleBankAudio>;
const base=(import.meta.env?.BASE_URL ?? '/')+'instruments/';
const frequency=(body:SampleBankTimbreBody,note:SoundPlan['note'])=>unpitchedDrumKey(body) === undefined
  ? note.frequencyHz*2**((body.tuningSemitones??0)/12) : DRUM_REFERENCE_FREQUENCY_HZ;
/** Installed recordings load only on demand; portable projects use the ordinary audio custody/cache. */
export function createSampleBankAudio(_library:MaterialLibrary, samples?:SampleAudioPort, fetcher:typeof fetch=globalThis.fetch) {
  const manifests = new Map<string, Promise<Record<string,AssetZone[]>>>();
  const assets=new Map<string,Promise<Asset>>();
  let studioPcmBytes=0;
  async function regions(body:SampleBankTimbreBody):Promise<AssetZone[]> {
    const path = body.bank + '/manifest.json';
    let manifest = manifests.get(path);
    if (!manifest) {
      manifest = (async()=>{
        const response=await fetcher(base+path); if(!response.ok)throw new Error('内置采样库尚未安装完整，请重新安装新版 RootSound。');
        const value=await response.json() as {bank:string;instruments:Record<string,AssetZone[]>};
        if(value.bank!==body.bank)throw new Error('采样库版本不匹配。');
        for(const zones of Object.values(value.instruments)) for(const zone of zones) {
          if(!/^[a-f0-9]{64}\.wav$/u.test(zone.asset) || !Number.isInteger(zone.byteLength) || zone.byteLength<44 || zone.byteLength>16*1024*1024)throw new Error('采样库目录损坏。');
        }
        return value.instruments;
      })().catch(error=>{manifests.delete(path);throw error;});
      manifests.set(path, manifest);
    }
    const found=(await manifest)[body.instrument]; if(!found?.length)throw new Error('找不到这个乐器的原始录音。');
    readSampleBankBody({...body,zones:found.map(zone=>{ const {asset,byteLength: _bytes,sampleRate: _rate,channels: _channels,frames: _frames,...fields}=zone;return {...fields,sampleId:asset}; })});
    return found;
  }
  function source(zone:AssetZone, bank: SampleBankTimbreBody['bank']):Promise<Asset> {
    const path = bank + '/' + zone.asset;
    let pending=assets.get(path);
    if(!pending) {
      pending=(async()=>{
        const response=await fetcher(base+path); if(!response.ok)throw new Error('乐器采样读取失败，请重试。');
        const data=new Uint8Array(await response.arrayBuffer()); if(data.byteLength!==zone.byteLength)throw new Error('乐器采样文件不完整。');
        const pcm = decodePcmWav(data);
        if (!pcm) throw new Error('内置录音不是有效的 PCM WAV。');
        const decodedBytes = pcm.channels.reduce((total, channel) => total + channel.byteLength, 0);
        if (studioPcmBytes + decodedBytes > 1536 * 1024 * 1024) throw new Error('采样缓存已满，请关闭并重新打开项目。');
        studioPcmBytes += decodedBytes;
        return { audio: pcm };
      })().catch(error=>{assets.delete(path);throw error;}); assets.set(path,pending);
    }
    return pending;
  }
  const preparedRegions = new Map<string, AssetZone[]>();
  const readySources = new Map<string, Asset>();
  const quietLeads = new WeakMap<AssetZone, number>();
  async function prepare(body: SampleBankTimbreBody, notes: readonly SoundPlan['note'][]) {
    if (body.zones) {
      if (!samples) throw new Error('工程采样尚未接入声音运行模块。');
      await samples.prepare([...new Set(notes.flatMap(note =>
        selectBankZones(body.zones!, frequency(body, note), note.velocity).map(zone => zone.sampleId)))]);
      return;
    }
    const zones = preparedRegions.get(body.instrument) ?? await regions(body);
    preparedRegions.set(body.instrument, zones);
    const needed = new Map(notes.flatMap(note =>
      selectBankZones(zones, frequency(body, note), note.velocity).map(zone => [zone.asset, zone] as const)));
    const pending = [...needed].filter(([id]) => !readySources.has(id));
    for (let index = 0; index < pending.length; index += 4) {
      await Promise.all(pending.slice(index, index + 4).map(async ([id, zone]) => {
        readySources.set(id, await source(zone, body.bank));
      }));
    }
  }
  function plan(body:SampleBankTimbreBody,note:SoundPlan['note']):SampleSoundPlan {
    const drum = unpitchedDrumKey(body);
    const hz = frequency(body, note);
    const playedNote = drum === undefined ? note : {...note, frequencyHz: hz};
    const zones=selectBankZones<SampleBankZone | AssetZone>(body.zones ?? preparedRegions.get(body.instrument) ?? [],hz,note.velocity);
    const percussion = drum !== undefined || defaultInstrumentInfo('',body)?.category === '打击';
    const naturalRelease = !body.zones && !percussion;
    const releaseLimit = naturalRelease
      ? Math.min(.36, (body.instrument === 'studio-piano' ? .22 : .16) + note.holdSeconds * .1) : Infinity;
    const compensation = body.zones || percussion ? undefined : sampleBassCompensation(body.instrument, hz);
    function layer(zone:SampleBankZone | AssetZone):SampleSoundPlan {
    const sourceId='sampleId' in zone ? zone.sampleId : (zone as AssetZone).asset;
    const prepared='sampleId' in zone ? samples?.readPrepared(zone.sampleId) : {id:sourceId,revision:1,audio:readySources.get(sourceId)?.audio};
    if(!prepared?.audio)throw new Error('这个乐器尚未准备，请重新试听。');
    const tail=percussion&&!zone.loop?(zone.endSeconds-zone.startSeconds)/(hz/zone.rootFrequencyHz):0;
    const releaseSeconds = Math.min(Math.max(body.releaseSeconds, zone.releaseSeconds, tail), releaseLimit);
    let startSeconds = zone.startSeconds;
    if (compensation && 'asset' in zone) {
      let lead = quietLeads.get(zone);
      if (lead === undefined) {
        lead = quietSampleLead(prepared.audio, zone.startSeconds, zone.loop?.startSeconds ?? zone.endSeconds);
        quietLeads.set(zone, lead);
      }
      startSeconds += lead * compensation.onsetMix;
    }
    return {kind:'sample',version:1,source:{id:prepared.id,revision:prepared.revision,audio:prepared.audio},
      startSeconds,endSeconds:zone.endSeconds,playbackRate:hz/zone.rootFrequencyHz,
      ...(compensation ? { sampleGain: compensation.gain } : {}),
      ...(zone.loop?{loop:zone.loop}:{}),envelope:{attackSeconds:Math.max(body.attackSeconds,zone.attackSeconds,Math.min(.003, startSeconds - zone.startSeconds)),releaseSeconds,
        ...(naturalRelease ? { releaseShape: 'natural' as const } : {}), decaySeconds:zone.decaySeconds ?? 0,sustain:zone.sustain ?? 1},
      note:{...playedNote},level:body.level*zone.level};
    }
    const [primary,...layers]=zones.map(layer);
    return layers.length ? {...primary!,layers,layerReferenceLevel:primary!.level} : primary!;
  }
  return {prepare,plan};
}
