import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { createSampleBankAudio } from '../src/workstation/modules/timbre/sample-bank.ts';
import { readSampleBankBody, selectBankZone } from '../src/workstation/modules/timbre/sample-bank-model.ts';
import { createInitialProjectLibrary } from '../src/workstation/app/project-setup.ts';
import { openMusicDocument, commitMusicDocument } from '../src/workstation/app/music-document.ts';
import { createMaterialLibrary } from '../src/workstation/modules/materials/public.ts';
import { createTimbrePlayback, createTimbreReferenceAdapter, prepareMelodyTimbres } from '../src/workstation/modules/timbre/public.ts';
import { createPhraseEditor, createPhrasePlayback, createPhraseReferenceAdapter } from '../src/workstation/modules/phrase/public.ts';
import { createSongEditor, createSongReferenceAdapter } from '../src/workstation/modules/song/public.ts';
import { createSampleAudio, createSampleReferenceAdapter, createBrowserSampleDecoder } from '../src/workstation/modules/sampling/public.ts';
import { encodeFloatWav } from '../src/workstation/modules/sampling/audio.ts';
import { readPreview } from '../src/workstation/modules/sound-runtime/plan.ts';
import { createProjectClosePreparation } from '../src/workstation/app/project-close.ts';

function fixture() {
  let text=createInitialProjectLibrary('采样工程');
  const adapters=[createTimbreReferenceAdapter(),createPhraseReferenceAdapter(),createSongReferenceAdapter(),createSampleReferenceAdapter()];
  const library=createMaterialLibrary({read:()=>text,write:value=>{text=value;}},{project:{rootKind:'rootsound.song',adapters}});
  const original=library.listContent().find(record=>record.name==='钢琴')!;
  const data=[.1,.2,.3].map(level=>encodeFloatWav({sampleRate:8000,channels:[Float32Array.from({length:32},(_,i)=>Math.sin(i)*level)]}));
  const names=data.map(bytes=>createHash('sha256').update(bytes).digest('hex')+'.wav');
  const zones=data.map((bytes,i)=>({keyMin:i===2?64:0,keyMax:i===2?127:63,velocityMin:i===1?64:0,velocityMax:i===0?63:127,
    rootFrequencyHz:i===2?880:220,startSeconds:0,endSeconds:.004,attackSeconds:.001,releaseSeconds:.03,decaySeconds:.1,sustain:.8,level:1,
    asset:names[i],byteLength:bytes.length,sampleRate:8000,channels:1,frames:32}));
  const requests:string[]=[];let broken=false;
  const fetcher=(async(input:RequestInfo|URL)=>{
    const url=String(input);requests.push(url);
    if(url.endsWith('manifest.json'))return new Response(JSON.stringify({bank:'generaluser-gs-2.0.3',instruments:{piano:zones}}));
    if(broken)return new Response('',{status:404});
    const index=names.findIndex(name=>url.endsWith(name));return index>=0?new Response(new Uint8Array(data[index]!)):new Response('',{status:404});
  }) as typeof fetch;
  const samples=createSampleAudio(library,createBrowserSampleDecoder()), bank=createSampleBankAudio(library,samples,fetcher);
  const tones=createTimbrePlayback(library,samples,undefined,bank), phrase=createPhraseEditor(library,tones);
  const song=createSongEditor(library,createPhrasePlayback(library,tones),{defaultTempoMode:'source'});
  openMusicDocument(library,song,phrase);
  return {library,original,bank,tones,phrase,song,zones,names,requests,fetcher,adapters,text:()=>text,breakFiles(){broken=true;},restoreFiles(){broken=false;}};
}
const low={frequencyHz:220,holdSeconds:.04,velocity:.3};

test('sampled voices load lazily and choose the right key and velocity recordings',async()=>{
  const f=fixture();assert.equal(f.requests.length,0);
  await f.tones.prepareForSaved(f.original.id,[low]);
  const a=f.tones.planForSaved(f.original.id,low);assert.equal(a.kind,'sample');assert.equal(f.requests.length,2);assert.equal(a.kind==='sample'&&a.source.id,f.names[0]);
  const high={...low,frequencyHz:880,velocity:.9};await f.tones.prepareForSaved(f.original.id,[high]);
  const b=f.tones.planForSaved(f.original.id,high);assert.equal(b.kind==='sample'&&b.source.id,f.names[2]);assert.equal(f.requests.length,3);
  assert(readPreview(a));assert(readPreview(b));
});

test('saving embeds every zone of used voices and reopens with all bank/network access disabled',async()=>{
  const f=fixture();const part=f.phrase.addPart(f.original.id);f.phrase.addNote(part,{startBeat:0,durationBeats:1,frequencyHz:220,velocity:.3});
  await f.bank.materialize([f.original.id]);commitMusicDocument(f.library,f.song,f.phrase);
  const body=readSampleBankBody(f.library.readContent(f.original.id)!.body);assert.equal(body.zones?.length,3);
  assert.equal(f.library.listContentInfo().filter(record=>record.kind==='rootsound.sample').length,3);
  let text=f.text();const reopened=createMaterialLibrary({read:()=>text,write:value=>{text=value;}},{project:{rootKind:'rootsound.song',adapters:f.adapters}});
  const samples=createSampleAudio(reopened,createBrowserSampleDecoder());let network=0;
  const bank=createSampleBankAudio(reopened,samples,(async()=>{network++;throw Error('network disabled');}) as typeof fetch);
  const tones=createTimbrePlayback(reopened,samples,undefined,bank);
  await tones.prepareForSaved(f.original.id,[low]);const plan=tones.planForSaved(f.original.id,low);assert.equal(plan.kind,'sample');assert.equal(network,0);assert(readPreview(plan));
  const stable=text;await bank.materialize([f.original.id]);assert.equal(text,stable,'saving again must not duplicate samples');
});

test('failed sample loading leaves the editable voice intact and allows a later retry',async()=>{
  const f=fixture();const before=f.text();f.breakFiles();
  await assert.rejects(f.bank.materialize([f.original.id]),/读取失败/);assert.equal(f.text(),before);
  f.restoreFiles();await f.tones.prepareForSaved(f.original.id,[low]);assert(readPreview(f.tones.planForSaved(f.original.id,low)));
});

test('quiet bow/noise overlays cannot displace the principal pitched recording',()=>{
  const base={keyMin:50,keyMax:80,velocityMin:0,velocityMax:127,startSeconds:0,endSeconds:1,attackSeconds:.01,releaseSeconds:.1};
  const main={...base,rootFrequencyHz:238,level:.3};const noise={...base,rootFrequencyHz:294,level:.01};
  assert.equal(selectBankZone([main,noise],277,.75),main);
});

test('native close preparation awaits asynchronous sample capture and reports a capture failure',async()=>{
  let completed=false;const prepare=createProjectClosePreparation({flush(){},async assertSaveReady(){await Promise.resolve();completed=true;throw Error('采样读取失败');},name:()=> '音乐'});
  const result=await prepare();assert(completed);assert.equal(result.canSave,false);assert.equal(result.saveMessage,'采样读取失败');
});

test('installed recordings support actual piano, bowed string, wind, brass and drum plans without a sound device',async()=>{
  const library=createMaterialLibrary();const records=prepareMelodyTimbres();
  assert.equal(library.commitTransaction({expectedToken:library.currentToken(),label:'recordings',createContents:records}).status,'committed');
  let audioBytes=0;
  const fetcher=(async(input:RequestInfo|URL)=>{
    const url=String(input);assert(url.startsWith('/instruments/generaluser-gs-2.0.3/'));
    const bytes=readFileSync(resolve('public','.'+url));if(url.endsWith('.wav')){assert(bytes.length<300000);audioBytes+=bytes.length;}
    return new Response(bytes);
  }) as typeof fetch;
  const bank=createSampleBankAudio(library,undefined,fetcher);const tones=createTimbrePlayback(library,undefined,undefined,bank);
  const signatures=new Set<string>();
  for(const key of ['piano','violin','flute','trumpet','acoustic-kick']){
    const record=records.find(item=>item.id.includes('.'+key+'.'))!;
    await tones.prepareForSaved(record.id,[low]);const plan=tones.planForSaved(record.id,low);assert.equal(plan.kind,'sample');
    if(plan.kind==='sample'){let energy=0;for(const value of plan.source.audio.channels[0]!){assert(Number.isFinite(value));energy+=value*value;}assert(energy>0);signatures.add(plan.source.id);}
    assert(readPreview(plan));
  }
  assert.equal(signatures.size,5);assert(audioBytes<1024*1024);
  const importedDrum={...records[0]!,id:'imported-midi-drum',name:'MIDI 鼓',body:{model:'sample-bank',version:1,bank:'generaluser-gs-2.0.3',instrument:'gm-drum-36',attackSeconds:0,releaseSeconds:.03,level:.7,tuningSemitones:24}};
  assert.equal(library.commitTransaction({expectedToken:library.currentToken(),label:'MIDI drum',createContents:[importedDrum]}).status,'committed');
  const drumNote={...low,frequencyHz:440*2**((36-69)/12)};
  await tones.prepareForSaved(importedDrum.id,[drumNote]);const drum=tones.planForSaved(importedDrum.id,drumNote);
  assert(drum.kind==='sample');assert(Math.abs(drum.playbackRate-1)<.01,'MIDI drum number must not slow the original recording by two octaves');
  assert(readPreview(drum));assert(audioBytes<1024*1024);
});
