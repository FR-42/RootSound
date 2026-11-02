import assert from 'node:assert/strict';
import { test } from 'node:test';
import { prepareMelodyTimbres, readEditableTimbreBody } from '../src/workstation/modules/timbre/public.ts';
import { listDefaultInstruments, instrumentCategories, defaultInstrumentInfo } from '../src/workstation/modules/timbre/instrument-catalog.ts';
import { createInitialProjectLibrary } from '../src/workstation/app/project-setup.ts';
import { ensureProjectMelodyTimbres, listProjectTimbres, requiresTimbreDeleteConfirmation, tryRemoveUnusedProjectTimbre } from '../src/workstation/app/project-timbres.ts';
import { createMaterialLibrary } from '../src/workstation/modules/materials/public.ts';

test('the complete palette covers nine families with 53 uniquely named, distinct portable recipes', () => {
  const definitions = listDefaultInstruments(), tones = prepareMelodyTimbres();
  assert.equal(tones.length, 53); assert.equal(new Set(tones.map(item => item.id)).size, 53);
  assert.equal(new Set(tones.map(item => item.name)).size, 53);
  assert.deepEqual([...new Set(definitions.map(item => item.category))], [...instrumentCategories]);
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
  assert.equal(ensureProjectMelodyTimbres(library, root.id).length, 53);
  assert(tryRemoveUnusedProjectTimbre(library, root.id, first[0]!.id));
  assert.equal(ensureProjectMelodyTimbres(library, root.id).length, 52);
  const other = JSON.parse(createInitialProjectLibrary('另一个音乐')).contents.filter((item: {kind:string}) => item.kind === 'rootsound.timbre');
  assert(other.every((tone: {id:string}) => !first.some(item => item.id === tone.id)));
});

test('the new defaults are compact sampled-bank definitions, with no imitation oscillator recipes', () => {
  const tones=prepareMelodyTimbres();
  for(const tone of tones){const body=readEditableTimbreBody(tone.body);assert.equal(body.model,'sample-bank');
    assert(!JSON.stringify(body).includes('sources'));assert(!JSON.stringify(body).includes('oscillators'));}
  assert(JSON.stringify(tones).length<25000, 'empty projects must not eagerly embed the entire recording library');
});
