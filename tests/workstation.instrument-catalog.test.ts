import assert from 'node:assert/strict';
import { test } from 'node:test';
import { prepareMelodyTimbres, readEditableTimbreBody } from '../src/workstation/modules/timbre/public.ts';
import { listDefaultInstruments, instrumentCategories, defaultInstrumentInfo } from '../src/workstation/modules/timbre/instrument-catalog.ts';
import { createInitialProjectLibrary } from '../src/workstation/app/project-setup.ts';
import { ensureProjectMelodyTimbres, listProjectTimbres, requiresTimbreDeleteConfirmation, tryRemoveUnusedProjectTimbre } from '../src/workstation/app/project-timbres.ts';
import { createMaterialLibrary } from '../src/workstation/modules/materials/public.ts';

test('the complete palette covers nine families with 175 uniquely named, distinct portable recipes', () => {
  const definitions = listDefaultInstruments(), tones = prepareMelodyTimbres();
  assert.equal(tones.length, 175); assert.equal(new Set(tones.map(item => item.id)).size, 175);
  assert.equal(new Set(tones.map(item => item.name)).size, 175);
  assert.deepEqual(new Set(definitions.map(item => item.category)), new Set(instrumentCategories));
  for (const required of ['钢琴','管风琴','手风琴','尼龙吉他','小提琴','大提琴','长笛','单簧管','萨克斯','小号','圆号','大号','电贝司','军鼓','闭镲','马林巴','温暖铺底','人声呜'])
    assert(tones.some(item => item.name === required), required);
  const fingerprints = tones.map(tone => { const body = readEditableTimbreBody(tone.body); assert.equal(tone.dependencies.length, 0);
    return JSON.stringify(body).replace(/rootsound\.instrument\.[a-z-]+/gu, 'instrument').replace(/"name":"[^"]+"/gu, '"name":"sound"'); });
  assert.equal(new Set(fingerprints).size, tones.length);
  assert.equal(defaultInstrumentInfo('imported-voice'), undefined);
});

test('every new project gets independent ordered defaults; deleted defaults do not respawn', () => {
  let text = createInitialProjectLibrary('音色测试');
  const library = createMaterialLibrary({ read: () => text, write: value => { text = value; } });
  const root = library.listDrafts().find(item => item.kind === 'rootsound.song')!;
  const first = listProjectTimbres(library, root.id);
  assert.deepEqual(first.map(item => item.name), listDefaultInstruments().map(item => item.name));
  assert(first.every(tone => defaultInstrumentInfo(tone.id)));
  assert(first.every(tone => !requiresTimbreDeleteConfirmation(tone)));
  assert.equal(ensureProjectMelodyTimbres(library, root.id).length, 175);
  assert(tryRemoveUnusedProjectTimbre(library, root.id, first[0]!.id));
  assert.equal(ensureProjectMelodyTimbres(library, root.id).length, 174);
  const other = JSON.parse(createInitialProjectLibrary('另一个音乐')).contents.filter((item: {kind:string}) => item.kind === 'rootsound.timbre');
  assert(other.every((tone: {id:string}) => !first.some(item => item.id === tone.id)));
});

test('the new defaults are compact sampled-bank definitions, with no imitation oscillator recipes', () => {
  const tones=prepareMelodyTimbres();
  for(const tone of tones){const body=readEditableTimbreBody(tone.body);assert.equal(body.model,'sample-bank');
    assert(!JSON.stringify(body).includes('sources'));assert(!JSON.stringify(body).includes('oscillators'));}
  assert(JSON.stringify(tones).length<85000, 'empty projects must not eagerly embed the entire recording library');
});

test('all GM numbers and drum notes have exactly one library entry, including imported identities', () => {
  const definitions=listDefaultInstruments();
  assert.deepEqual(definitions.filter(item=>'program' in item).map(item=>item.program),Array.from({length:128},(_,i)=>i));
  assert.deepEqual(definitions.filter(item=>'drum' in item).map(item=>item.drum),Array.from({length:47},(_,i)=>i+35));
  for(let program=0;program<128;program++) {
    const info=defaultInstrumentInfo('imported-id',{model:'sample-bank',instrument:`gm-${program}`});
    assert(info && 'program' in info && info.program===program);assert(info.aliases.includes(`GM ${program+1} `));
  }
});

test('upgrading an old 53-voice project adds only new entries, without resurrecting a deleted starter', () => {
  const snapshot=JSON.parse(createInitialProjectLibrary('旧音乐'));
  const legacyKeys=new Set(listDefaultInstruments().filter(item=>item.introduced===1&&item.key!=='piano').map(item=>item.key));
  const keep=new Set(snapshot.contents.filter((item:{id:string;kind:string})=>item.kind!=='rootsound.timbre'
    || [...legacyKeys].some(key=>item.id.startsWith(`rootsound.instrument.${key}.v2:`))).map((item:{id:string})=>item.id));
  snapshot.contents=snapshot.contents.filter((item:{id:string})=>keep.has(item.id));
  // The fixture is a real serialized library, with explicit project membership/order.
  function prune(value:unknown):void {
    if(!value||typeof value!=='object')return;
    if(Array.isArray(value)){for(const item of value)prune(item);return;}
    const record=value as Record<string,unknown>;
    delete record.timbreCatalogVersion;
    for(const [key,item] of Object.entries(record)) {
      if(Array.isArray(item)&&item.every(entry=>typeof entry==='string')&&['memberIds','contentIds','timbreLibraryOrder'].includes(key))
        record[key]=item.filter(id=>!id.startsWith('rootsound.instrument.')||keep.has(id));
      else prune(item);
    }
  }
  prune(snapshot);
  let text=JSON.stringify(snapshot);const library=createMaterialLibrary({read:()=>text,write:value=>{text=value;}});
  const root=library.listDrafts().find(item=>item.kind==='rootsound.song')!;
  const upgraded=ensureProjectMelodyTimbres(library,root.id);
  assert.equal(upgraded.length,174);assert(!upgraded.some(item=>item.name==='钢琴'));
  assert.equal(ensureProjectMelodyTimbres(library,root.id).length,174);
});
