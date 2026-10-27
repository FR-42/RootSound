import assert from 'node:assert/strict';
import test from 'node:test';
import type { ContentRecord, SaveResult } from '../src/workstation/contracts/content.ts';
import { createMaterialLibrary } from '../src/workstation/modules/materials/public.ts';
import { createPhraseEditor, createPhrasePlayback, readPhraseBody } from '../src/workstation/modules/phrase/public.ts';
import { createTimbreEditor, createTimbrePlayback } from '../src/workstation/modules/timbre/public.ts';
import { createSongEditor, createSongPlayback } from '../src/workstation/modules/song/public.ts';

function saved(result: SaveResult): ContentRecord { assert.equal(result.status, 'saved'); if (result.status !== 'saved') throw new Error('Expected save'); return result.content; }
function fixture() {
  let raw: string | null = null; let fail = false; let writes = 0;
  const storage = { read: () => raw, write(value: string) { if (fail) throw new Error('test write failed'); raw = value; writes++; } };
  const library = createMaterialLibrary(storage); const timbre = createTimbreEditor(library);
  const voice = saved(timbre.save('new')); const playback = createTimbrePlayback(library); const phrase = createPhraseEditor(library, playback);
  phrase.create(voice.id); const part = phrase.read().body!.parts[0]!.id;
  phrase.addNote(part, { startBeat: 1, durationBeats: 2, frequencyHz: 220, velocity: .7 });
  return { library, storage, playback, phrase, part, voice, raw: () => raw, writes: () => writes, fail(value = true) { fail = value; } };
}

test('legacy phrase bodies keep their exact shape and unity gain while explicit gain validates narrowly', () => {
  const f = fixture(); const before = f.phrase.read().body!;
  assert.equal(before.lengthBeats, 8, 'the old domain default is preserved outside the new creation flow');
  assert.equal(Object.hasOwn(before, 'masterLevel'), false);
  assert.deepEqual(readPhraseBody(before), before);
  const original = f.playback.planForSaved(f.voice.id, { frequencyHz: 220, holdSeconds: 1, velocity: .7 });
  assert.deepEqual(f.phrase.previewPlan().events[0]!.sound, original);
  for (const value of [0, .25, 1]) assert.equal(readPhraseBody({ ...before, masterLevel: value }).masterLevel, value);
  for (const value of [-.01, 1.01, NaN, Infinity, '0.5', null]) assert.throws(() => readPhraseBody({ ...before, masterLevel: value }), /乐句音量/);
  assert.deepEqual(f.phrase.read().body, before);
});

test('phrase gain is durable, undoable and atomic without changing notes or timbres', () => {
  const f = fixture(); const before = structuredClone(f.phrase.read().body!); const draft = f.phrase.read().draft!;
  const voices = f.library.listContentInfo(); const writes = f.writes(); const history = f.library.readDraftHistory(draft.id);
  f.phrase.setMasterLevel(.4); assert.equal(f.writes(), writes + 1);
  assert.deepEqual(f.phrase.read().body, { ...before, masterLevel: .4 });
  assert.deepEqual(f.library.listContentInfo(), voices);
  const after = f.raw(); f.phrase.setMasterLevel(.4); assert.equal(f.raw(), after); assert.equal(f.writes(), writes + 1);
  f.phrase.undo(); assert.deepEqual(f.phrase.read().body, before);
  assert.equal(f.library.readDraftHistory(draft.id).past.length, history.past.length);
  f.phrase.redo(); assert.equal(f.phrase.read().body!.masterLevel, .4);
  const reopened = createMaterialLibrary(f.storage); const editor = createPhraseEditor(reopened, createTimbrePlayback(reopened));
  assert.equal(editor.read().body!.masterLevel, .4);
  const token = f.library.currentToken(); const view = f.phrase.read(); const past = f.library.readDraftHistory(draft.id);
  for (const value of [-1, 2, NaN]) assert.throws(() => f.phrase.setMasterLevel(value), /乐句音量/);
  f.fail(); assert.throws(() => f.phrase.setMasterLevel(.6), /test write failed/);
  assert.equal(f.library.currentToken(), token); assert.deepEqual(f.phrase.read(), view);
  assert.deepEqual(f.library.readDraftHistory(draft.id), past);
});

test('draft audition, individual key audition, saved phrases and song export plans use the same phrase gain', async () => {
  const f = fixture(); const original = f.phrase.previewPlan(); f.phrase.setMasterLevel(.25);
  const reduced = f.phrase.previewPlan();
  assert.deepEqual(reduced.events[0]!.sound.note, original.events[0]!.sound.note);
  assert.equal(reduced.events[0]!.sound.level, original.events[0]!.sound.level * .25);
  assert.equal(reduced.durationSeconds, original.durationSeconds); assert.equal(reduced.events[0]!.atSeconds, original.events[0]!.atSeconds);
  const key = await f.phrase.previewNotePlan(f.part, { frequencyHz: 220, holdSeconds: 1, velocity: .7 });
  assert.equal(key.level, reduced.events[0]!.sound.level);
  const source = saved(f.phrase.save('new')); const phrases = createPhrasePlayback(f.library, f.playback);
  assert.deepEqual(phrases.planForSaved(source.id), reduced);
  const song = createSongEditor(f.library, phrases, { defaultTempoMode: 'source' }); song.createFromPhrase(source.id);
  song.updateTrack(song.read().body!.tracks[0]!.id, { level: 1 });
  const live = song.previewPlan(); const output = saved(song.save('new'));
  const exported = createSongPlayback(f.library, phrases).planForSaved(output.id);
  assert.deepEqual(exported, live);
  assert.equal(exported.events[0]!.sound.level, reduced.events[0]!.sound.level);
  f.phrase.setMasterLevel(0); assert.equal(f.phrase.previewPlan().events[0]!.sound.level, 0);
  assert.equal(readPhraseBody(f.library.readContent(source.id)!.body).masterLevel, .25, 'draft volume never changes its saved source implicitly');
});
