import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { ContentRecord, SaveResult } from '../src/workstation/contracts/content.ts';
import type { PhraseNote } from '../src/workstation/contracts/phrase.ts';
import { createProjectPhrase } from '../src/workstation/app/project-phrases.ts';
import { createMaterialLibrary, createProjectPackages, createReferenceEditing } from '../src/workstation/modules/materials/public.ts';
import { createTimbrePlayback, createTimbreReferenceAdapter } from '../src/workstation/modules/timbre/public.ts';
import { createPhraseEditor, createPhrasePlayback, createPhraseReferenceAdapter, preparePhraseFromSeconds, readPhraseBody } from '../src/workstation/modules/phrase/public.ts';
import { createSongEditor, createSongPlayback, createSongReferenceAdapter, readSongBody } from '../src/workstation/modules/song/public.ts';

function saved(result: SaveResult): ContentRecord {
  assert.equal(result.status, 'saved', JSON.stringify(result));
  if (result.status !== 'saved') throw new Error('Expected saved.');
  return result.content;
}
const note = (changes: Partial<Omit<PhraseNote, 'id'>> = {}) => ({ startBeat: 1, durationBeats: 2, frequencyHz: 330, velocity: .8, ...changes });
function close(actual: number | undefined, expected: number): void {
  assert.equal(typeof actual, 'number'); assert(Math.abs(actual! - expected) < 1e-12, `${actual} should equal ${expected}`);
}
function fixture() {
  let raw: string | null = null; let writes = 0; let broken = false;
  const storage = { read: () => raw, write(value: string) { if (broken) throw new Error('测试磁盘无法写入'); raw = value; writes++; } };
  const adapters = [createTimbreReferenceAdapter(), createPhraseReferenceAdapter(), createSongReferenceAdapter()];
  const policy = { project: { rootKind: 'rootsound.song', adapters } };
  const library = createMaterialLibrary(storage, policy); const sounds = createTimbrePlayback(library);
  const phrase = createPhraseEditor(library, sounds); const phrases = createPhrasePlayback(library, sounds);
  const song = createSongEditor(library, phrases, { defaultTempoMode: 'source' }); song.create();
  const songId = song.read().draft!.id; const source = createProjectPhrase(library, songId); phrase.openDraft(source.draftId);
  const partId = phrase.read().body!.parts[0]!.id; const toneId = phrase.read().body!.parts[0]!.timbreId;
  return { library, storage, adapters, policy, sounds, phrases, phrase, song, songId, source, partId, toneId,
    raw: () => raw, writes: () => writes, fail: () => { broken = true; } };
}

test('legacy notes preserve their exact shape while explicit note gain and stereo position validate strictly', () => {
  const f = fixture(); f.phrase.addNote(f.partId, note()); const body = f.phrase.read().body!;
  const original = body.parts[0]!.notes[0]!;
  assert.equal(Object.hasOwn(original, 'level'), false); assert.equal(Object.hasOwn(original, 'pan'), false);
  assert.deepEqual(readPhraseBody(body), body);
  for (const [key, valid, invalid] of [
    ['level', [0, .25, 1], [-.01, 1.01, NaN, Infinity, '0.5', null]],
    ['pan', [-1, -.25, 0, 1], [-1.01, 1.01, NaN, Infinity, '0', null]],
  ] as const) {
    for (const value of valid) {
      const candidate = structuredClone(body); Object.assign(candidate.parts[0]!.notes[0]!, { [key]: value });
      assert.equal(readPhraseBody(candidate).parts[0]!.notes[0]![key], value);
    }
    for (const value of invalid) {
      const candidate = structuredClone(body); Object.assign(candidate.parts[0]!.notes[0]!, { [key]: value });
      assert.throws(() => readPhraseBody(candidate), key === 'level' ? /音符音量/u : /音符声像/u);
    }
  }
  const seconds = preparePhraseFromSeconds({ name: '精确音符', timbreId: f.toneId, durationSeconds: 4,
    notes: [{ startSeconds: .25, durationSeconds: .5, frequencyHz: 220, level: .35, pan: -.7 }] });
  const converted = readPhraseBody(seconds.body).parts[0]!.notes[0]!;
  assert.equal(converted.level, .35); assert.equal(converted.pan, -.7);
  assert.deepEqual(f.phrase.read().body, body);
});

test('bulk note gain and pan edits persist once, undo together, reopen exactly and can restore omitted defaults', () => {
  const f = fixture(); const ids = f.phrase.addNotes(f.partId, [note(), note({ startBeat: 4, level: .5, pan: .3 })]);
  const before = f.phrase.read().body!; const draftId = f.phrase.read().draft!.id;
  const history = f.library.readDraftHistory(draftId); const writes = f.writes();
  f.phrase.updateNotes([{ partId: f.partId, noteId: ids[0]!, changes: { level: .2, pan: -.65 } },
    { partId: f.partId, noteId: ids[1]!, changes: { level: .7, pan: .8 } }]);
  assert.equal(f.writes(), writes + 1); assert.equal(f.library.readDraftHistory(draftId).past.length, history.past.length + 1);
  const after = f.phrase.read().body!; f.phrase.undo(); assert.deepEqual(f.phrase.read().body, before);
  f.phrase.redo(); assert.deepEqual(f.phrase.read().body, after);
  const reopened = createMaterialLibrary(f.storage, f.policy); const editor = createPhraseEditor(reopened, createTimbrePlayback(reopened));
  editor.openDraft(draftId); assert.deepEqual(editor.read().body, after);
  f.phrase.updateNote(f.partId, ids[0]!, { level: undefined, pan: undefined });
  const reset = f.phrase.read().body!.parts[0]!.notes[0]!;
  assert.equal(Object.hasOwn(reset, 'level'), false); assert.equal(Object.hasOwn(reset, 'pan'), false);
  assert.deepEqual(reset, before.parts[0]!.notes[0]);
});

test('invalid note mix or failed writes leave bulk edits, token and undo history untouched', () => {
  const f = fixture(); const ids = f.phrase.addNotes(f.partId, [note(), note({ startBeat: 4 })]);
  const draftId = f.phrase.read().draft!.id; const before = f.raw(); const token = f.library.currentToken();
  const history = f.library.readDraftHistory(draftId); const body = f.phrase.read().body;
  assert.throws(() => f.phrase.addNotes(f.partId, [note({ level: .3 }), note({ pan: 2 })]), /音符声像/u);
  assert.throws(() => f.phrase.updateNotes([{ partId: f.partId, noteId: ids[0]!, changes: { level: .4, pan: -.3 } },
    { partId: f.partId, noteId: ids[1]!, changes: { level: -1 } }]), /音符音量/u);
  assert.equal(f.raw(), before); assert.equal(f.library.currentToken(), token); assert.deepEqual(f.phrase.read().body, body);
  assert.deepEqual(f.library.readDraftHistory(draftId), history);
  f.fail(); assert.throws(() => f.phrase.updateNote(f.partId, ids[0]!, { level: .2, pan: -.4 }), /测试磁盘无法写入/u);
  assert.equal(f.raw(), before); assert.equal(f.library.currentToken(), token); assert.deepEqual(f.phrase.read().body, body);
  assert.deepEqual(f.library.readDraftHistory(draftId), history);
});

test('phrase plans apply note gain and master gain independently of velocity, timing and stereo defaults', () => {
  const f = fixture(); const ids = f.phrase.addNotes(f.partId, [note(), note({ startBeat: 4, level: .25, pan: -.6 }), note({ startBeat: 7, level: 0, pan: 0 })]);
  const plain = f.sounds.planForSaved(f.toneId, { frequencyHz: 330, holdSeconds: 1, velocity: .8 });
  f.phrase.setMasterLevel(.4); const before = f.raw(); const plan = f.phrase.previewPlan();
  assert.deepEqual(plan.events.map(event => event.atSeconds), [.5, 2, 3.5]);
  assert.deepEqual(plan.events.map(event => event.sound.level), [plain.level * .4, plain.level * .4 * .25, 0]);
  assert.equal(Object.hasOwn(plan.events[0]!, 'pan'), false); assert.equal(plan.events[1]!.pan, -.6); assert.equal(plan.events[2]!.pan, 0);
  assert(plan.events.every(event => event.sound.note.velocity === .8 && event.sound.note.holdSeconds === 1));
  assert.equal(f.raw(), before);
  const source = saved(f.phrase.save('overwrite')); assert.deepEqual(f.phrases.planForSaved(source.id), plan);
  const temporary = structuredClone(f.phrase.read().body!); temporary.parts[0]!.notes[1]!.level = .8; temporary.parts[0]!.notes[1]!.pan = .9;
  const current = f.raw(); const preview = f.phrase.previewPlan(temporary);
  close(preview.events[1]!.sound.level, plain.level * .4 * .8); assert.equal(preview.events[1]!.pan, .9); assert.equal(f.raw(), current);
  f.phrase.updateNote(f.partId, ids[0]!, { pan: 1 }); assert.equal(f.phrase.previewPlan().events[0]!.pan, 1);
});

test('song plans combine note pan with current clip or row pan and clamp the sum while retaining all gain stages', () => {
  const f = fixture(); f.phrase.addNotes(f.partId, [note({ pan: -.6, level: .25 }), note({ startBeat: 4, pan: 1 }), note({ startBeat: 7, pan: -1 })]);
  f.phrase.setMasterLevel(.5); const source = saved(f.phrase.save('overwrite')); const phrasePlan = f.phrases.planForSaved(source.id);
  const track = f.song.read().body!.tracks[0]!.id; const clip = f.song.addClip(track, source.id, 0);
  f.song.updateTrack(track, { level: .7, pan: -.2, panOffset: .1 }); f.song.setMasterLevel(.8); f.song.updateClip(track, clip, { level: .6 });
  let plan = f.song.previewPlan(); plan.events.forEach((event, index) => close(event.pan, [-.7, .9, -1][index]!));
  f.song.updateClip(track, clip, { pan: .4 }); plan = f.song.previewPlan();
  plan.events.forEach((event, index) => close(event.pan, [-.1, 1, -.5][index]!));
  assert.equal(plan.events[0]!.sound.level, phrasePlan.events[0]!.sound.level * .7 * .6 * .8);
  const song = saved(f.song.save('new')); assert.deepEqual(createSongPlayback(f.library, f.phrases).planForSaved(song.id), plan);
});

test('reference copy-on-write and portable project transfer preserve note gain and pan for each occurrence', () => {
  const f = fixture(); const noteId = f.phrase.addNote(f.partId, note({ level: .6, pan: .4 }));
  const source = saved(f.phrase.save('overwrite')); const original = structuredClone(source);
  const track = f.song.read().body!.tracks[0]!.id; const clip = f.song.addClip(track, source.id, 0); f.song.addClip(track, source.id, 16);
  const references = createReferenceEditing(f.library, f.adapters); const edit = references.begin({ root: { type: 'draft', id: f.songId }, path: [clip] });
  f.phrase.openDraft(edit.draftId); f.phrase.updateNote(f.partId, noteId, { level: .15, pan: -.8 });
  const applied = references.apply(edit.draftId); assert.equal(applied.status, 'applied'); if (applied.status !== 'applied') throw new Error('Expected applied.');
  assert.notEqual(applied.content.id, original.id); assert.deepEqual(f.library.readContent(original.id), original);
  assert.equal(readPhraseBody(applied.content.body).parts[0]!.notes[0]!.level, .15);
  const clips = readSongBody(f.library.readDraft(f.songId)!.body).tracks[0]!.clips;
  assert.equal(clips[0]!.phraseId, applied.content.id); assert.equal(clips[1]!.phraseId, original.id);
  const expected = f.song.previewPlan(); assert.deepEqual(expected.events.map(event => event.pan), [-.8, .4]);
  const reopened = createMaterialLibrary(f.storage, f.policy);
  const output = createProjectPackages(reopened, f.adapters, { rootKind: 'rootsound.song' }).exportDraft(f.songId);
  const target = createMaterialLibrary(undefined, f.policy); const packages = createProjectPackages(target, f.adapters, { rootKind: 'rootsound.song' });
  const imported = packages.importProject(output.text); assert.equal(imported.status, 'imported'); if (imported.status !== 'imported') throw new Error('Expected imported.');
  const phrases = createPhrasePlayback(target, createTimbrePlayback(target)); const song = createSongEditor(target, phrases, { defaultTempoMode: 'source' });
  song.openDraft(imported.draft.id); assert.deepEqual(song.previewPlan(), expected);
  const transferred = target.listContent().filter(item => item.kind === 'rootsound.phrase').map(item => readPhraseBody(item.body).parts[0]!.notes[0]!);
  assert(transferred.some(item => item.level === .15 && item.pan === -.8)); assert(transferred.some(item => item.level === .6 && item.pan === .4));
});

test('changing BPM can atomically preserve held seconds while moving note onsets and retaining legacy one-argument behavior', () => {
  const f = fixture(); f.phrase.addNotes(f.partId, [note({ level: .6, pan: -.4 }), note({ startBeat: 4, durationSeconds: .375 })]);
  const before = f.phrase.read().body!; const draftId = f.phrase.read().draft!.id;
  const original = f.phrase.previewPlan(); const history = f.library.readDraftHistory(draftId); const writes = f.writes();
  assert.equal(Object.hasOwn(before.parts[0]!.notes[0]!, 'durationSeconds'), false);
  f.phrase.setTempo(120, { preserveNoteDurations: true }); assert.equal(f.writes(), writes, 'same BPM is still a no-op');
  f.phrase.setTempo(240, { preserveNoteDurations: true }); assert.equal(f.writes(), writes + 1);
  assert.equal(f.library.readDraftHistory(draftId).past.length, history.past.length + 1);
  const plan = f.phrase.previewPlan(); assert.deepEqual(plan.events.map(event => event.atSeconds), [.25, 1]);
  assert.deepEqual(plan.events.map(event => event.sound.note.holdSeconds), [1, .375]);
  assert.deepEqual(plan.events.map(event => event.sound.note.frequencyHz), original.events.map(event => event.sound.note.frequencyHz));
  assert.equal(plan.events[0]!.sound.level, original.events[0]!.sound.level); assert.equal(plan.events[0]!.pan, -.4);
  f.phrase.undo(); assert.deepEqual(f.phrase.read().body, before); f.phrase.redo();
  f.phrase.setTempo(60, { preserveNoteDurations: true }); assert.deepEqual(f.phrase.previewPlan().events.map(event => event.sound.note.holdSeconds), [1, .375]);
  const savedPhrase = saved(f.phrase.save('overwrite'));
  assert.deepEqual(f.phrases.planForSaved(savedPhrase.id, 90).events.map(event => event.sound.note.holdSeconds), [1, .375], 'explicit held seconds also survive a caller tempo override');
  const reopened = createMaterialLibrary(f.storage, f.policy); const editor = createPhraseEditor(reopened, createTimbrePlayback(reopened));
  editor.openDraft(draftId); assert.deepEqual(editor.previewPlan(), f.phrase.previewPlan());
  const legacy = fixture(); legacy.phrase.addNote(legacy.partId, note()); legacy.phrase.setTempo(240);
  assert.equal(legacy.phrase.previewPlan().events[0]!.sound.note.holdSeconds, .5);
  assert.equal(Object.hasOwn(legacy.phrase.read().body!.parts[0]!.notes[0]!, 'durationSeconds'), false);
});

test('explicit held seconds validate strictly, permit audible tails, and old beat-based resize updates them atomically', () => {
  const f = fixture(); const id = f.phrase.addNote(f.partId, note({ durationSeconds: 20 }));
  const body = f.phrase.read().body!; assert(f.phrase.previewPlan().durationSeconds > 20, 'held seconds can extend beyond the nominal phrase');
  for (const value of [0, .00001, -1, 96.01, NaN, Infinity, null, '1']) {
    const candidate = structuredClone(body); Object.assign(candidate.parts[0]!.notes[0]!, { durationSeconds: value });
    assert.throws(() => readPhraseBody(candidate), /音符持续秒数/u);
  }
  const before = f.raw(); const draftId = f.phrase.read().draft!.id; const history = f.library.readDraftHistory(draftId);
  assert.throws(() => f.phrase.addNotes(f.partId, [note({ durationSeconds: .5 }), note({ durationSeconds: 0 })]), /音符持续秒数/u);
  assert.equal(f.raw(), before); assert.deepEqual(f.library.readDraftHistory(draftId), history);
  f.phrase.updateNote(f.partId, id, { durationBeats: 1 }); assert.equal(f.phrase.read().body!.parts[0]!.notes[0]!.durationSeconds, .5);
  f.phrase.updateNote(f.partId, id, { durationBeats: 2, durationSeconds: .75 }); assert.equal(f.phrase.read().body!.parts[0]!.notes[0]!.durationSeconds, .75);
  f.phrase.updateNote(f.partId, id, { durationSeconds: undefined }); assert.equal(Object.hasOwn(f.phrase.read().body!.parts[0]!.notes[0]!, 'durationSeconds'), false);
  const edited = f.raw(); const view = f.phrase.read(); f.fail();
  assert.throws(() => f.phrase.setTempo(180, { preserveNoteDurations: true }), /测试磁盘无法写入/u);
  assert.equal(f.raw(), edited); assert.deepEqual(f.phrase.read(), view);
});

test('duration-preserving BPM, note gain and pan survive reference copy-on-write and portable transfer together', () => {
  const f = fixture(); const id = f.phrase.addNote(f.partId, note({ level: .6, pan: .4 }));
  const source = saved(f.phrase.save('overwrite')); const original = structuredClone(source);
  const track = f.song.read().body!.tracks[0]!.id; const clip = f.song.addClip(track, source.id, 0); f.song.addClip(track, source.id, 16);
  const references = createReferenceEditing(f.library, f.adapters); const edit = references.begin({ root: { type: 'draft', id: f.songId }, path: [clip] });
  f.phrase.openDraft(edit.draftId); f.phrase.setTempo(180, { preserveNoteDurations: true }); f.phrase.updateNote(f.partId, id, { level: .2, pan: -.7 });
  const applied = references.apply(edit.draftId); assert.equal(applied.status, 'applied'); if (applied.status !== 'applied') throw new Error('Expected applied.');
  assert.notEqual(applied.content.id, original.id); assert.deepEqual(f.library.readContent(original.id), original);
  const updated = readPhraseBody(applied.content.body).parts[0]!.notes[0]!;
  assert.equal(updated.durationSeconds, 1); assert.equal(updated.level, .2); assert.equal(updated.pan, -.7);
  const expected = f.song.previewPlan(); assert.deepEqual(expected.events.map(event => event.atSeconds), [1 / 3, 8.5]);
  assert.deepEqual(expected.events.map(event => event.sound.note.holdSeconds), [1, 1]);
  const output = createProjectPackages(f.library, f.adapters, { rootKind: 'rootsound.song' }).exportDraft(f.songId);
  const target = createMaterialLibrary(undefined, f.policy); const imported = createProjectPackages(target, f.adapters, { rootKind: 'rootsound.song' }).importProject(output.text);
  assert.equal(imported.status, 'imported'); if (imported.status !== 'imported') throw new Error('Expected imported.');
  const phrases = createPhrasePlayback(target, createTimbrePlayback(target)); const song = createSongEditor(target, phrases, { defaultTempoMode: 'source' });
  song.openDraft(imported.draft.id); assert.deepEqual(song.previewPlan(), expected);
});
