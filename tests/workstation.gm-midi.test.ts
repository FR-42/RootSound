import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFileSync,statSync,readdirSync} from 'node:fs';
import {resolve} from 'node:path';
import {createMidiProjectLibrary} from '../src/workstation/app/midi-project.ts';
import {createMaterialLibrary} from '../src/workstation/modules/materials/public.ts';
import {createSampleBankAudio} from '../src/workstation/modules/timbre/sample-bank.ts';
import {createTimbrePlayback,createTimbreReferenceAdapter} from '../src/workstation/modules/timbre/public.ts';
import {createPhraseEditor,createPhrasePlayback,createPhraseReferenceAdapter} from '../src/workstation/modules/phrase/public.ts';
import {createSongEditor,createSongReferenceAdapter} from '../src/workstation/modules/song/public.ts';
import {openMusicDocument} from '../src/workstation/app/music-document.ts';
import {readPreview} from '../src/workstation/modules/sound-runtime/plan.ts';

const be32=(v:number)=>[v>>>24,v>>>16&255,v>>>8&255,v&255];
const ascii=(s:string)=>[...new TextEncoder().encode(s)];
function midi(drums:boolean):Uint8Array {
  const events:number[]=[];
  for(let i=0;i<(drums?47:128);i++) {
    const pitch=drums?35+i:60,channel=drums?9:0;
    if(!drums)events.push(0,192,i);
    events.push(0,144+channel,pitch,100,120,128+channel,pitch,0);
  }
  events.push(0,255,47,0);
  return Uint8Array.from([...ascii('MThd'),0,0,0,6,0,0,0,1,1,224,...ascii('MTrk'),...be32(events.length),...events]);
}

for(const drums of [false,true])test(`MIDI ${drums?'47 drum notes':'all 128 programs'} opens as editable music and prepares original PCM`,async()=>{
  const count=drums?47:128,bytes=midi(drums),before=bytes.slice();
  const imported=createMidiProjectLibrary(bytes,'GM 完整性');assert.equal(imported.noteCount,count);assert.deepEqual(bytes,before);
  let text=imported.libraryText;
  const library=createMaterialLibrary({read:()=>text,write:value=>{text=value;}},{project:{rootKind:'rootsound.song',adapters:[createTimbreReferenceAdapter(),createPhraseReferenceAdapter(),createSongReferenceAdapter()]}});
  const requests=new Set<string>();
  const fetcher=(async(input:RequestInfo|URL)=>{
    const url=String(input);assert(url.startsWith('/instruments/rootsound-studio-v1/'));
    requests.add(url);return new Response(readFileSync(resolve('public','.'+url)));
  }) as typeof fetch;
  const bank=createSampleBankAudio(library,undefined,fetcher),tones=createTimbrePlayback(library,undefined,undefined,bank);
  const song=createSongEditor(library,createPhrasePlayback(library,tones),{defaultTempoMode:'source'}),score=createPhraseEditor(library,tones);
  openMusicDocument(library,song,score);
  assert.equal(score.read().body!.parts.length,count);
  assert.equal(score.read().body!.parts.reduce((n,part)=>n+part.notes.length,0),count);
  await score.preparePreview();
  const plan=score.previewPlan();assert.equal(plan.events.length,count);
  assert(plan.events.every(event=>event.sound.kind==='sample'));
  const prepared=readPreview(plan);assert(prepared.events.length>=count);
  for(const source of prepared.samples) {
    assert(source.audio.channels.every(channel=>channel.every(Number.isFinite)));
  }
  // SoundFont pedal/choke regions can intentionally be silent; every musical
  // strike must nevertheless retain at least one audible original layer.
  for(const event of plan.events)assert(prepared.events.some(rendered=>rendered.atSeconds===event.atSeconds
    && rendered.sound.kind==='sample'&&rendered.sound.source.peak>1e-5),`silent strike at ${event.atSeconds}`);
  const instruments=library.listContent().filter(record=>record.kind==='rootsound.timbre').map(record=>record.body as {midiProgram?:number; midiDrum?:number});
  assert.deepEqual(new Set(instruments.map(body=>drums?body.midiDrum:body.midiProgram)),new Set(Array.from({length:count},(_,i)=>drums?35+i:i)));
  assert.equal([...requests].filter(url=>url.endsWith('manifest.json')).length,1);
});

test('the complete installed PCM bank stays below the user’s 1 GB budget',()=>{
  const directory='public/instruments/rootsound-studio-v1';
  const total=readdirSync(directory).reduce((sum,name)=>sum+statSync(resolve(directory,name)).size,0);
  assert(total<1_000_000_000);assert(total>30_000_000);
});
