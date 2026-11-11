import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createHash } from 'node:crypto';
import { createSampleBankAudio } from '../src/workstation/modules/timbre/sample-bank.ts';
import { selectBankZone } from '../src/workstation/modules/timbre/sample-bank-model.ts';
import { createInitialProjectLibrary } from '../src/workstation/app/project-setup.ts';
import { openMusicDocument, commitMusicDocument } from '../src/workstation/app/music-document.ts';
import { createMaterialLibrary } from '../src/workstation/modules/materials/public.ts';
import { createTimbrePlayback, createTimbreReferenceAdapter } from '../src/workstation/modules/timbre/public.ts';
import { createPhraseEditor, createPhrasePlayback, createPhraseReferenceAdapter } from '../src/workstation/modules/phrase/public.ts';
import { createSongEditor, createSongReferenceAdapter } from '../src/workstation/modules/song/public.ts';
import { createSampleAudio, createSampleReferenceAdapter, createBrowserSampleDecoder } from '../src/workstation/modules/sampling/public.ts';
import { encodeFloatWav } from '../src/workstation/modules/sampling/audio.ts';
import { readPreview } from '../src/workstation/modules/sound-runtime/plan.ts';
import { createProjectClosePreparation } from '../src/workstation/app/project-close.ts';
import { removeProjectTimbre } from '../src/workstation/app/project-timbres.ts';

function fixture(overlap=false) {
  let text=createInitialProjectLibrary('采样工程');
  const adapters=[createTimbreReferenceAdapter(),createPhraseReferenceAdapter(),createSongReferenceAdapter(),createSampleReferenceAdapter()];
  const library=createMaterialLibrary({read:()=>text,write:value=>{text=value;}},{project:{rootKind:'rootsound.song',adapters}});
  const original=library.listContent().find(record=>record.name==='三角钢琴')!;
  const data=[.1,.2,.3].map(level=>encodeFloatWav({sampleRate:8000,channels:[Float32Array.from({length:32},(_,i)=>Math.sin(i)*level)]}));
  const names=data.map(bytes=>createHash('sha256').update(bytes).digest('hex')+'.wav');
  const zones=data.map((bytes,i)=>({keyMin:i===2?64:0,keyMax:i===2?127:63,velocityMin:i===1?64:0,velocityMax:i===0?63:127,
    rootFrequencyHz:i===2?880:220,startSeconds:0,endSeconds:.004,attackSeconds:.001,releaseSeconds:.03,decaySeconds:.1,sustain:.8,level:1,
    asset:names[i],byteLength:bytes.length,sampleRate:8000,channels:1,frames:32}));
  if(overlap)zones[1]!.velocityMin=0;
  const requests:string[]=[];let broken=false;
  const fetcher=(async(input:RequestInfo|URL)=>{
    const url=String(input);requests.push(url);
    if(url.endsWith('manifest.json'))return new Response(JSON.stringify({bank:'rootsound-studio-v1',instruments:{'studio-piano':zones}}));
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

test('overlapping recordings survive audition, mixing gain, explicit save and reopen',async()=>{
  const f=fixture(true);await f.tones.prepareForSaved(f.original.id,[low]);
  const plan=f.tones.planForSaved(f.original.id,low);assert(plan.kind==='sample');assert.equal(plan.layers?.length,1);
  const audition=readPreview(plan);assert.equal(audition.sequence,false);assert.equal(audition.events.length,2);
  assert.equal(audition.samples.length,2);
  const muted=readPreview({...plan,level:0});assert(muted.events.every(event=>event.sound.level===0));
  const mix=readPreview({kind:'sequence',version:1,durationSeconds:1,events:[{atSeconds:.2,pan:-.5,sound:{...plan,level:plan.level*.25}}]});
  assert.equal(mix.events.length,2);
  for(let i=0;i<2;i++){assert.equal(mix.events[i]!.atSeconds,.2);assert.equal(mix.events[i]!.pan,-.5);assert.equal(mix.events[i]!.sound.level,audition.events[i]!.sound.level*.25);}
  const part=f.phrase.addPart(f.original.id);f.phrase.addNote(part,{startBeat:0,durationBeats:1,frequencyHz:220,velocity:.3});
  commitMusicDocument(f.library,f.song,f.phrase);
  let text=f.text();const reopened=createMaterialLibrary({read:()=>text,write:value=>{text=value;}},{project:{rootKind:'rootsound.song',adapters:f.adapters}});
  const samples=createSampleAudio(reopened,createBrowserSampleDecoder());
  const bank=createSampleBankAudio(reopened,samples,f.fetcher);
  const tones=createTimbrePlayback(reopened,samples,undefined,bank);
  await tones.prepareForSaved(f.original.id,[low]);
  const restored=readPreview(tones.planForSaved(f.original.id,low));assert.equal(restored.events.length,2);assert.equal(restored.samples.length,2);
  assert.deepEqual(restored.events.map(event=>event.sound.level),audition.events.map(event=>event.sound.level));
});

test('sampled voices load lazily and choose the right key and velocity recordings',async()=>{
  const f=fixture();assert.equal(f.requests.length,0);
  await f.tones.prepareForSaved(f.original.id,[low]);
  const a=f.tones.planForSaved(f.original.id,low);assert.equal(a.kind,'sample');assert.equal(f.requests.length,2);assert.equal(a.kind==='sample'&&a.source.id,f.names[0]);
  const high={...low,frequencyHz:880,velocity:.9};await f.tones.prepareForSaved(f.original.id,[high]);
  const b=f.tones.planForSaved(f.original.id,high);assert.equal(b.kind==='sample'&&b.source.id,f.names[2]);assert.equal(f.requests.length,3);
  assert(readPreview(a));assert(readPreview(b));
});

test('reference piano plays without project membership and creates no content, draft or history',async()=>{
  const f=fixture();
  // Default piano is not used by a family, so it may be removed from the library.
  removeProjectTimbre(f.library,f.song.read().draft!.id,f.original.id);
  const before=f.text(),draft=f.phrase.read().draft;
  const plan=await f.phrase.previewPianoPlan(low);
  assert.equal(plan.kind,'sample');assert.equal(plan.note.frequencyHz,low.frequencyHz);
  assert.equal(f.text(),before);assert.deepEqual(f.phrase.read().draft,draft);
  assert(readPreview(plan));assert(f.requests.length>0);
});

test('failed sample loading leaves the editable voice intact and allows a later retry',async()=>{
  const f=fixture();const before=f.text();f.breakFiles();
  await assert.rejects(f.tones.prepareForSaved(f.original.id,[low]),/读取失败/);assert.equal(f.text(),before);
  f.restoreFiles();await f.tones.prepareForSaved(f.original.id,[low]);assert(readPreview(f.tones.planForSaved(f.original.id,low)));
});

test('quiet bow/noise overlays cannot displace the principal pitched recording',()=>{
  const base={keyMin:50,keyMax:80,velocityMin:0,velocityMax:127,startSeconds:0,endSeconds:1,attackSeconds:.01,releaseSeconds:.1};
  const main={...base,rootFrequencyHz:238,level:.3};const noise={...base,rootFrequencyHz:294,level:.01};
  assert.equal(selectBankZone([main,noise],277,.75),main);
});

test('native close preparation awaits asynchronous sample capture and reports a capture failure',async()=>{
  let completed=false;const prepare=createProjectClosePreparation({flush(){},async prepareSave(){await Promise.resolve();completed=true;throw Error('采样读取失败');},name:()=> '音乐'});
  const result=await prepare('save');assert(completed);assert.equal(result.canSave,false);assert.equal(result.saveMessage,'采样读取失败');
});
