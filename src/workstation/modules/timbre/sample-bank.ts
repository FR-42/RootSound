import type { ContentRecord, MaterialLibrary, JsonValue } from '../../contracts/content.ts';
import type { SampleAudioPort, SampleBody } from '../../contracts/sampling.ts';
import type { PcmAudio, SampleSoundPlan, SoundPlan } from '../../contracts/sound.ts';
import type { SampleBankTimbreBody, SampleBankZone } from '../../contracts/timbre.ts';
import { decodePcmWav, encodeBase64 } from '../sampling/audio.ts';
import { bankSampleIds, readSampleBankBody, selectBankZones } from './sample-bank-model.ts';
import { defaultInstrumentInfo } from './instrument-catalog.ts';

type AssetZone = Omit<SampleBankZone,'sampleId'> & { asset:string; byteLength:number; sampleRate:number; channels:number; frames:number };
type Asset = { bytes:Uint8Array; audio?:PcmAudio };
export type SampleBankAudio = ReturnType<typeof createSampleBankAudio>;
const base=(import.meta.env?.BASE_URL ?? '/')+'instruments/generaluser-gs-2.0.3/';
const frequency=(body:SampleBankTimbreBody,note:SoundPlan['note'])=>note.frequencyHz*2**((body.tuningSemitones??0)/12);
const referencePcm:PcmAudio={sampleRate:48000,channels:[new Float32Array([1])]};
/** Installed recordings load only on demand; portable projects use the ordinary audio custody/cache. */
export function createSampleBankAudio(library:MaterialLibrary, samples?:SampleAudioPort, fetcher:typeof fetch=globalThis.fetch,
  options:{soundFont?:boolean}={}) {
  const full=options.soundFont ?? typeof globalThis.AudioWorkletNode==='function';
  let manifest:Promise<Record<string,AssetZone[]>> | undefined;
  const assets=new Map<string,Promise<Asset>>(); let bytes=0;
  async function regions(body:SampleBankTimbreBody):Promise<AssetZone[]> {
    manifest ??= (async()=>{
      const response=await fetcher(base+'manifest.json'); if(!response.ok)throw new Error('内置采样库尚未安装完整，请重新安装新版 RootSound。');
      const value=await response.json() as {bank:string;instruments:Record<string,AssetZone[]>};
      if(value.bank!=='generaluser-gs-2.0.3')throw new Error('采样库版本不匹配。');
      for(const zones of Object.values(value.instruments)) for(const zone of zones) {
        if(!/^[a-f0-9]{64}\.wav$/u.test(zone.asset) || !Number.isInteger(zone.byteLength) || zone.byteLength<44 || zone.byteLength>16*1024*1024)throw new Error('采样库目录损坏。');
      }
      return value.instruments;
    })().catch(error=>{manifest=undefined;throw error;});
    const found=(await manifest)[body.instrument]; if(!found?.length)throw new Error('找不到这个乐器的原始录音。');
    readSampleBankBody({...body,zones:found.map(zone=>{ const {asset,byteLength: _bytes,sampleRate: _rate,channels: _channels,frames: _frames,...fields}=zone;return {...fields,sampleId:asset}; })});
    return found;
  }
  function source(zone:AssetZone):Promise<Asset> {
    let pending=assets.get(zone.asset);
    if(!pending) {
      pending=(async()=>{
        const response=await fetcher(base+zone.asset); if(!response.ok)throw new Error('乐器采样读取失败，请重试。');
        const data=new Uint8Array(await response.arrayBuffer()); if(data.byteLength!==zone.byteLength)throw new Error('乐器采样文件不完整。');
        if(bytes+data.byteLength>128*1024*1024)throw new Error('采样缓存已满，请关闭并重新打开项目。');
        bytes+=data.byteLength; return {bytes:data};
      })().catch(error=>{assets.delete(zone.asset);throw error;}); assets.set(zone.asset,pending);
    }
    return pending;
  }
  async function prepare(body:SampleBankTimbreBody, notes:readonly SoundPlan['note'][]) {
    if(body.zones) {
      if(!samples)throw new Error('工程采样尚未接入声音运行模块。');
      await samples.prepare([...new Set(notes.flatMap(note=>selectBankZones(body.zones!,frequency(body,note),note.velocity).map(zone=>zone.sampleId)))]); return;
    }
    const zones=await regions(body);
    for(const zone of new Map(notes.flatMap(note=>selectBankZones(zones,frequency(body,note),note.velocity).map(z=>[z.asset,z] as const))).values()) {
      const item=await source(zone); if(!item.audio){const audio=decodePcmWav(item.bytes);if(!audio)throw new Error('内置录音不是有效的 PCM WAV。');item.audio=audio;}
    }
  }
  const preparedRegions=new Map<string,AssetZone[]>();
  const readySources=new Map<string,Asset>();
  async function prepareForNotes(body:SampleBankTimbreBody,notes:readonly SoundPlan['note'][]) {
    if(full){const zones=await regions(body);preparedRegions.set(body.instrument,zones);return;}
    await prepare(body,notes); if(body.zones)return;
    const zones=await regions(body);preparedRegions.set(body.instrument,zones);
    for(const note of notes)for(const zone of selectBankZones(zones,frequency(body,note),note.velocity))readySources.set(zone.asset,await source(zone));
  }
  function plan(body:SampleBankTimbreBody,note:SoundPlan['note']):SampleSoundPlan {
    if(full) {
      const info=defaultInstrumentInfo('',body);if(!info)throw new Error('找不到这个内置音色的完整音源。');
      const pitch=69+12*Math.log2(frequency(body,note)/440),drums='drum' in info;
      const key=drums?info.drum!:Math.max(0,Math.min(127,Math.round(pitch)));
      const zones=preparedRegions.get(body.instrument);if(!zones)throw new Error('音源尚未准备。');
      const release=Math.max(...selectBankZones(zones,frequency(body,note),note.velocity).map(zone=>{
        const r=zone.sf2Release,strength=Math.round(note.velocity*127)/127;
        const seconds=r?2**(Math.max(-12000,Math.min(8000,r.base+r.velocity*strength+r.inverseVelocity*(1-strength)))/1200):zone.releaseSeconds;
        return zone.loop?seconds:Math.max(0,Math.min(seconds,(zone.endSeconds-zone.startSeconds)/(frequency(body,note)/zone.rootFrequencyHz)-note.holdSeconds));
      }));
      return {kind:'sample',version:1,source:{id:'rootsound-sf2-clock',revision:1,audio:referencePcm},
        startSeconds:0,endSeconds:1/48000,playbackRate:1,envelope:{attackSeconds:body.attackSeconds,releaseSeconds:Math.max(body.releaseSeconds,release)},
        envelopeBaked:true,note:{...note,velocity:1},level:body.level,
        soundFont:{bank:body.bank,program:drums?0:info.program!,key,velocity:Math.round(note.velocity*127),cents:(pitch-(drums?60:key))*100,drums}};
    }
    const zones=selectBankZones<SampleBankZone | AssetZone>(body.zones ?? preparedRegions.get(body.instrument) ?? [],frequency(body,note),note.velocity);
    function layer(zone:SampleBankZone | AssetZone):SampleSoundPlan {
    const sourceId='sampleId' in zone ? zone.sampleId : (zone as AssetZone).asset;
    const prepared='sampleId' in zone ? samples?.readPrepared(zone.sampleId) : {id:sourceId,revision:1,audio:readySources.get(sourceId)?.audio};
    if(!prepared?.audio)throw new Error('这个乐器尚未准备，请重新试听。');
    const percussion=body.instrument.startsWith('gm-drum-') || defaultInstrumentInfo('',body)?.category==='打击';
    const tail=percussion&&!zone.loop?(zone.endSeconds-zone.startSeconds)/(frequency(body,note)/zone.rootFrequencyHz):0;
    return {kind:'sample',version:1,source:{id:prepared.id,revision:prepared.revision,audio:prepared.audio},
      startSeconds:zone.startSeconds,endSeconds:zone.endSeconds,playbackRate:frequency(body,note)/zone.rootFrequencyHz,
      ...(zone.loop?{loop:zone.loop}:{}),envelope:{attackSeconds:Math.max(body.attackSeconds,zone.attackSeconds),releaseSeconds:Math.max(body.releaseSeconds,zone.releaseSeconds,tail),decaySeconds:zone.decaySeconds ?? 0,sustain:zone.sustain ?? 1},
      note:{...note},level:body.level*zone.level};
    }
    const [primary,...layers]=zones.map(layer);
    return layers.length ? {...primary!,layers,layerReferenceLevel:primary!.level} : primary!;
  }
  /** Capture all pitch/velocity zones of used voices, so later edits work on another device offline. */
  async function materialize(contentIds:readonly string[]) {
    for(const id of new Set(contentIds)) {
      const record=library.readContent(id); if(!record || !record.body || typeof record.body!=='object' || Array.isArray(record.body) || record.body.model!=='sample-bank')continue;
      const body=readSampleBankBody(record.body); if(body.zones)continue;
      const scope=library.projectScopeOf?.({type:'content',id}) ?? 'local';
      const zones=await regions(body);const created:ContentRecord[]=[];const used=new Set<string>();
      const portable:SampleBankZone[]=[];
      for(const zone of zones) {
        const sampleId=`rootsound.recording.${zone.asset.slice(0,64)}:${scope}`;
        if(!used.has(sampleId) && !library.readContentInfo(sampleId)) {
          const data=await source(zone);
          const sample:SampleBody={model:'audio-sample',version:1,source:{kind:'file',name:`GeneralUser GS · ${zone.asset}`,mimeType:'audio/wav'},
            audio:{encoding:'base64',byteLength:data.bytes.byteLength,data:encodeBase64(data.bytes)},
            decoded:{sampleRate:zone.sampleRate,channels:zone.channels,frames:zone.frames,durationSeconds:zone.frames/zone.sampleRate}};
          created.push({id:sampleId,kind:'rootsound.sample',owner:'sampling',schemaVersion:1,revision:1,name:`乐器录音 ${zone.asset.slice(0,12)}`,dependencies:[],body:sample as unknown as JsonValue});
        }
        used.add(sampleId);
        const {asset:_asset,byteLength:_bytes,sampleRate:_rate,channels:_channels,frames:_frames,...fields}=zone;
        portable.push({...fields,sampleId});
      }
      const next=readSampleBankBody({...body,zones:portable});
      const current=library.readContent(id);if(!current || current.revision!==record.revision)throw new Error('保存期间音色已改变，请重新保存。');
      const replacement={...record,revision:record.revision+1,body:next,dependencies:bankSampleIds(next)};
      const result=library.commitTransaction({expectedToken:library.currentToken(),label:`收录${record.name}的采样`,createContents:created,
        replaceContents:[{expected:record,replacement}],replaceDrafts:library.listDrafts().filter(draft=>draft.sourceId===id)
          .map(draft=>({expected:draft,replacement:{...draft,baseRevision:replacement.revision,body:next,dependencies:replacement.dependencies}}))});
      if(result.status!=='committed')throw new Error(result.status==='storage-error'?result.message:result.reason);
    }
  }
  return {prepare:prepareForNotes,plan,materialize};
}
