import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { ContentRecord } from '../src/workstation/contracts/content.ts';
import type { PhraseBody } from '../src/workstation/contracts/phrase.ts';
import type { TimbreBody } from '../src/workstation/contracts/timbre.ts';
import { generateIdea, type IdeaDirection, type IdeaGraph } from '../src/workstation/modules/co-creation/generate.ts';
import { createMaterialLibrary } from '../src/workstation/modules/materials/public.ts';
import { createPhrasePlayback, readPhraseBody } from '../src/workstation/modules/phrase/public.ts';
import { createTimbrePlayback } from '../src/workstation/modules/timbre/public.ts';

const directions: IdeaDirection[] = ['light', 'calm', 'airy'];
function clone<T>(value: T): T { return JSON.parse(JSON.stringify(value)) as T; }
function freeze<T>(value: T): T {
  if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
}
function sound(id: string): ContentRecord {
  return { id, revision: 9, kind: 'rootsound.timbre', owner: 'timbre', schemaVersion: 1, name: `声音 ${id}`, dependencies: [],
    body: { model: 'basic-synth', version: 1, character: 'clear', attackSeconds: 0.123456789, releaseSeconds: 0.456789123, level: 0.678912345 } };
}
function seed(): IdeaGraph {
  const sounds = [sound('sound-a'), sound('sound-b')];
  const body: PhraseBody = { model: 'note-phrase', version: 1, timeUnit: 'beat', tempoBpm: 97.123456789, lengthBeats: 4.123456789,
    parts: [
      { id: 'part-a', name: '我的原始旋律', timbreId: 'sound-a', notes: [{ id: 'note-a', startBeat: 0.123456789012345,
        durationBeats: 0.987654321098765, frequencyHz: 432.123456789, velocity: 0.73123456789 }] },
      { id: 'part-b', name: '自己写的回应', timbreId: 'sound-b', notes: [{ id: 'note-b', startBeat: 2.100000000000001,
        durationBeats: 0.750123456789, frequencyHz: 377.987654321, velocity: 0.432198765 }] },
    ] };
  return { phrase: { id: 'source-phrase', revision: 13, kind: 'rootsound.phrase', owner: 'phrase', schemaVersion: 1,
    name: '我的未完成想法', dependencies: sounds.map(item => item.id), body }, sounds };
}
function playback(graph: IdeaGraph) {
  const library = createMaterialLibrary();
  const saved = library.commitTransaction({ expectedToken: library.currentToken(), label: '验证生成的完整声音图', createContents: [...graph.sounds, graph.phrase] });
  assert.equal(saved.status, 'committed', JSON.stringify(saved));
  return createPhrasePlayback(library, createTimbrePlayback(library)).planForSaved(graph.phrase.id);
}
function noteCount(body: PhraseBody): number { return body.parts.reduce((sum, part) => sum + part.notes.length, 0); }

test('all offline directions retain original note identities, physical precision and timing in real phrase playback', () => {
  const original = freeze(seed()); const before = clone(original); const input = readPhraseBody(original.phrase.body);
  for (const direction of directions) {
    const graph = generateIdea({ seed: original, direction, round: 0, hasArrangement: false });
    const body = readPhraseBody(graph.phrase.body); const plan = playback(graph);
    assert.equal(body.tempoBpm, input.tempoBpm); assert.equal(body.lengthBeats, input.lengthBeats);
    for (let index = 0; index < input.parts.length; index++) {
      const source = input.parts[index]!; const current = body.parts[index]!;
      assert.equal(current.id, source.id); assert.equal(current.name, source.name); assert.deepEqual(current.notes, source.notes);
      for (const note of source.notes) {
        const event = plan.events.find(item => item.atSeconds === note.startBeat * (60 / input.tempoBpm) && item.sound.note.frequencyHz === note.frequencyHz);
        assert.ok(event); assert.equal(event.sound.note.holdSeconds, note.durationBeats * (60 / input.tempoBpm)); assert.equal(event.sound.note.velocity, note.velocity);
      }
    }
  }
  assert.deepEqual(original, before);
});

test('each candidate owns new UUID material identities and a closed dependency graph without source mutation', () => {
  const original = seed(); const ids = new Set([original.phrase.id, ...original.sounds.map(item => item.id)]);
  for (const direction of directions) {
    const result = generateIdea({ seed: original, direction, round: 2, hasArrangement: false }); playback(result);
    for (const record of [result.phrase, ...result.sounds]) {
      assert.match(record.id, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu);
      assert.ok(!ids.has(record.id)); ids.add(record.id); assert.equal(record.revision, 1);
    }
    const references = new Set(readPhraseBody(result.phrase.body).parts.map(part => part.timbreId));
    assert.deepEqual(new Set(result.phrase.dependencies), references); assert.deepEqual(new Set(result.sounds.map(item => item.id)), references);
  }
});

test('shared original sounds remain shared inside an independent candidate, and unused source sounds are not published', () => {
  const original = seed(); const body = readPhraseBody(original.phrase.body);
  body.parts[1]!.timbreId = 'sound-a'; original.phrase = { ...original.phrase, body, dependencies: ['sound-a'] };
  const result = generateIdea({ seed: original, direction: 'airy', round: 0, hasArrangement: true });
  const changed = readPhraseBody(result.phrase.body); assert.equal(result.sounds.length, 1);
  assert.equal(changed.parts[0]!.timbreId, changed.parts[1]!.timbreId); assert.notEqual(changed.parts[0]!.timbreId, 'sound-a');
  assert.equal(playback(result).events.length, 2); assert.equal(original.sounds.length, 2);
});

test('the three local directions produce distinct executable sound and accompaniment behavior', () => {
  const plans = directions.map(direction => playback(generateIdea({ direction, round: 0, hasArrangement: false })));
  const frequencies = plans.map(plan => plan.events.map(event => event.sound.note.frequencyHz));
  assert.equal(new Set(plans.map(plan => plan.events.length)).size, 3);
  assert.equal(new Set(plans.map(plan => { const sound = plan.events[0]!.sound; assert(sound.kind === 'basic-synth'); return JSON.stringify(sound.sources); })).size, 3);
  assert.equal(new Set(plans.map(plan => JSON.stringify(plan.events[0]!.sound.envelope))).size, 3);
  assert.ok(frequencies.every(list => list.length > 8));
  for (const plan of plans) assert.ok(plan.events.every(event => Number.isFinite(event.atSeconds) && event.sound.note.holdSeconds > 0));
});

test('starting without a seed gives a complete eight-beat melody that works with or without first accompaniment', () => {
  for (const hasArrangement of [false, true]) for (const direction of directions) {
    const result = generateIdea({ direction, round: 0, hasArrangement }); const body = readPhraseBody(result.phrase.body);
    assert.equal(body.lengthBeats, 8); assert.equal(body.parts[0]!.notes.length, 8);
    assert.equal(body.parts.length, hasArrangement ? 1 : 3); assert.equal(playback(result).events.length, noteCount(body));
  }
});

test('later rounds preserve every finely edited part and note instead of stacking accompaniment again', () => {
  let previous = generateIdea({ seed: seed(), direction: 'light', round: 0, hasArrangement: false });
  const fine = readPhraseBody(previous.phrase.body); fine.parts[0]!.notes[0]!.frequencyHz = 436.567890123;
  fine.parts[0]!.notes[0]!.durationBeats = 0.3333333333333333;
  fine.parts[1]!.notes.push({ id: '手动新增的音符', startBeat: 3.123456789, durationBeats: 0.125, frequencyHz: 597.654321, velocity: 0.8123456789 });
  fine.parts[0]!.name = '我刚细调的旋律'; previous.phrase = { ...previous.phrase, body: fine };
  for (let round = 1; round <= 6; round++) {
    const frozen = freeze(previous); const before = clone(frozen); const result = generateIdea({ seed: frozen, direction: directions[round % 3]!, round, hasArrangement: true });
    const body = readPhraseBody(result.phrase.body); assert.equal(body.parts.length, fine.parts.length); assert.equal(noteCount(body), noteCount(fine));
    assert.deepEqual(body.parts.map(({ id, name, notes }) => ({ id, name, notes })), fine.parts.map(({ id, name, notes }) => ({ id, name, notes })));
    assert.deepEqual(frozen, before); assert.equal(playback(result).events.length, noteCount(fine)); previous = result;
  }
});

test('a full 512-note, eight-part seed stays intact and playable instead of truncating music for generated layers', () => {
  const original = seed(); const body = readPhraseBody(original.phrase.body);
  body.parts = Array.from({ length: 8 }, (_, part) => ({ id: `full-part-${part}`, name: `第 ${part + 1} 个声音`, timbreId: 'sound-a',
    notes: Array.from({ length: 64 }, (_, note) => ({ id: `full-note-${part}-${note}`, startBeat: note / 32, durationBeats: 0.01, frequencyHz: 220 + part * 17.12345, velocity: 0.3 })) }));
  original.phrase = { ...original.phrase, body, dependencies: ['sound-a'] };
  const result = generateIdea({ seed: original, direction: 'calm', round: 0, hasArrangement: false }); const current = readPhraseBody(result.phrase.body);
  assert.equal(current.parts.length, 8); assert.equal(noteCount(current), 512); assert.equal(playback(result).events.length, 512);
  assert.deepEqual(current.parts.map(part => part.notes), body.parts.map(part => part.notes)); assert.equal(result.sounds.length, 1);
});

test('limited free capacity adds only valid useful notes and never creates empty accompaniment parts', () => {
  const original = seed(); const body = readPhraseBody(original.phrase.body);
  body.parts = [{ id: 'almost-full', name: '接近上限的旋律', timbreId: 'sound-a', notes: Array.from({ length: 511 }, (_, index) => ({ id: `note-${index}`,
    startBeat: index / 256, durationBeats: 0.01, frequencyHz: 311.123456789, velocity: 0.4 })) }];
  original.phrase = { ...original.phrase, body, dependencies: ['sound-a'] };
  const result = generateIdea({ seed: original, direction: 'light', round: 0, hasArrangement: false }); const current = readPhraseBody(result.phrase.body);
  assert.equal(noteCount(current), 512); assert.equal(current.parts.length, 2); assert.equal(current.parts[1]!.notes.length, 1);
  assert.deepEqual(current.parts[0]!.notes, body.parts[0]!.notes); assert.equal(playback(result).events.length, 512);
});

test('short phrases, extreme legal tempos and arbitrary low or high physical pitches stay in bounds', () => {
  for (const tempoBpm of [40, 240]) for (const frequencyHz of [20, 4999.999999999]) for (const direction of directions) {
    const original = seed(); const body = readPhraseBody(original.phrase.body); body.lengthBeats = 0.25; body.tempoBpm = tempoBpm;
    body.parts = [{ id: 'tiny-part', name: '极短的想法', timbreId: 'sound-a', notes: [{ id: 'tiny-note', startBeat: 0.00123456789,
      durationBeats: 1 / 1024, frequencyHz, velocity: 0.9123456789 }] }]; original.phrase = { ...original.phrase, body, dependencies: ['sound-a'] };
    const result = generateIdea({ seed: original, direction, round: 2, hasArrangement: false }); const current = readPhraseBody(result.phrase.body);
    assert.deepEqual(current.parts[0]!.notes, body.parts[0]!.notes); assert.equal(current.tempoBpm, tempoBpm); assert.equal(current.lengthBeats, 0.25);
    for (const note of current.parts.flatMap(part => part.notes)) { assert.ok(note.startBeat + note.durationBeats <= 0.25); assert.ok(note.frequencyHz >= 20 && note.frequencyHz <= 5000); }
    assert.equal(playback(result).events.length, noteCount(current));
  }
});

test('round variation follows explicit bounded rules while matching inputs produce identical musical values', () => {
  const first = generateIdea({ direction: 'light', round: 1, hasArrangement: false }); const second = generateIdea({ direction: 'light', round: 1, hasArrangement: false });
  const values = (graph: IdeaGraph) => readPhraseBody(graph.phrase.body).parts.map(part => part.notes.map(({ id: _id, ...note }) => note));
  assert.deepEqual(values(first), values(second)); assert.notEqual(first.phrase.id, second.phrase.id);
  const different = generateIdea({ direction: 'light', round: 2, hasArrangement: false }); assert.notDeepEqual(values(first)[0], values(different)[0]);
  const original = seed(); const later = generateIdea({ seed: original, direction: 'light', round: 2, hasArrangement: true });
  assert.deepEqual(readPhraseBody(later.phrase.body).parts.map(part => part.notes), readPhraseBody(original.phrase.body).parts.map(part => part.notes));
  assert.ok(later.sounds.every(item => (item.body as TimbreBody).attackSeconds <= 2)); playback(later);
});

test('invalid or incomplete inputs fail through public domain validation without altering the source', () => {
  const original = seed(); const before = clone(original);
  assert.throws(() => generateIdea({ seed: { ...original, sounds: [] }, direction: 'light', round: 0, hasArrangement: false }), /缺少/);
  assert.throws(() => generateIdea({ seed: { ...original, phrase: { ...original.phrase, dependencies: [] } }, direction: 'calm', round: 0, hasArrangement: false }), /依赖/);
  assert.throws(() => generateIdea({ seed: { ...original, sounds: [...original.sounds, original.sounds[0]!] }, direction: 'airy', round: 0, hasArrangement: false }), /重复/);
  const unsupported = clone(original); (unsupported.sounds[0]!.body as Record<string, unknown>).futureSetting = true;
  assert.throws(() => generateIdea({ seed: unsupported, direction: 'light', round: 0, hasArrangement: false }), /尚不支持/);
  for (const round of [-1, 0.5, NaN, Infinity]) assert.throws(() => generateIdea({ seed: original, direction: 'light', round, hasArrangement: false }));
  assert.throws(() => generateIdea({ direction: 'unknown' as IdeaDirection, round: 0, hasArrangement: false }));
  assert.deepEqual(original, before);
});
