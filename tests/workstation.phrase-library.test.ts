import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createProjectPhrase, readProjectPhrases, renameProjectPhrase, retainProjectPhrases } from '../src/workstation/app/project-phrases.ts';
import { createMaterialLibrary } from '../src/workstation/modules/materials/public.ts';
import { createTimbreEditor, createTimbrePlayback, createTimbreReferenceAdapter } from '../src/workstation/modules/timbre/public.ts';
import { createPhraseEditor, createPhrasePlayback, createPhraseReferenceAdapter } from '../src/workstation/modules/phrase/public.ts';
import { createSongEditor, createSongReferenceAdapter, readSongBody } from '../src/workstation/modules/song/public.ts';
import type { SaveResult } from '../src/workstation/contracts/content.ts';

function saved(result: SaveResult) {
  assert.equal(result.status, 'saved', JSON.stringify(result));
  if (result.status !== 'saved') throw new Error('Expected saved content.');
  return result.content;
}
function fixture() {
  let raw: string | null = null; let writes = 0; let broken = false;
  const storage = { read: () => raw, write(value: string) { if (broken) throw new Error('测试磁盘失败'); raw = value; writes++; } };
  const policy = { project: { rootKind: 'rootsound.song',
    adapters: [createSongReferenceAdapter(), createPhraseReferenceAdapter(), createTimbreReferenceAdapter()] } };
  const library = createMaterialLibrary(storage, policy); const sounds = createTimbrePlayback(library);
  const phrases = createPhrasePlayback(library, sounds); const phrase = createPhraseEditor(library, sounds);
  const song = createSongEditor(library, phrases, { defaultTempoMode: 'source' }); song.create();
  const songId = song.read().draft!.id;
  function createWithNotes() {
    const made = createProjectPhrase(library, songId); phrase.openDraft(made.draftId);
    phrase.addNote(phrase.read().body!.parts[0]!.id, { startBeat: 0, durationBeats: 1, frequencyHz: 330, velocity: .7 });
    saved(phrase.save('overwrite')); return made;
  }
  return { library, storage, policy, sounds, phrases, phrase, song, songId, createWithNotes,
    raw: () => raw, writes: () => writes, fail() { broken = true; } };
}

test('the project phrase catalog scans its scope once and reuses isolated metadata until a durable edit', () => {
  const f = fixture(); f.createWithNotes(); f.createWithNotes();
  let views = 0, contents = 0, eligibleLists = 0;
  const originalView = f.library.currentProjectView!, originalContent = f.library.readContent;
  const originalEligible = f.library.listContentInfoForDraft!;
  f.library.currentProjectView = id => { views++; return originalView(id); };
  f.library.readContent = id => { contents++; return originalContent(id); };
  f.library.listContentInfoForDraft = id => { eligibleLists++; return originalEligible(id); };
  const first = readProjectPhrases(f.library, f.songId);
  assert.equal(first.length, 2); assert.equal(views, 1); assert.equal(contents, 2); assert.equal(eligibleLists, 0);
  const expected = structuredClone(first);
  first[0]!.name = '调用者的临时名字'; first.pop();
  for (let index = 0; index < 20; index++) assert.deepEqual(readProjectPhrases(f.library, f.songId), expected);
  assert.equal(views, 1); assert.equal(contents, 2); assert.equal(eligibleLists, 0);
});

test('phrase catalog keeps saved metadata through draft rename, undo and redo until an explicit save', () => {
  const f = fixture(), made = f.createWithNotes();
  const original = readProjectPhrases(f.library, f.songId)[0]!;
  f.phrase.rename('新名称');
  assert.equal(readProjectPhrases(f.library, f.songId)[0]!.name, '乐句 1');
  f.phrase.undo(); assert.deepEqual(readProjectPhrases(f.library, f.songId)[0], original);
  f.phrase.redo(); assert.deepEqual(readProjectPhrases(f.library, f.songId)[0], original);
  f.phrase.setTempo(144); saved(f.phrase.save('overwrite'));
  const edited = readProjectPhrases(f.library, f.songId)[0]!;
  assert.equal(edited.id, made.id); assert.equal(edited.name, '新名称'); assert.equal(edited.tempoBpm, 144);
  assert.equal(edited.durationSeconds, 16 * 60 / 144);
  f.song.create(); const other = f.song.read().draft!.id;
  assert.deepEqual(readProjectPhrases(f.library, other), []);
  assert.deepEqual(readProjectPhrases(f.library, f.songId), [edited]);
});

test('the library starts empty, lists each current private phrase once and excludes global and other-song sources', () => {
  const f = fixture(); assert.deepEqual(readProjectPhrases(f.library, f.songId), []);
  const voice = createTimbreEditor(f.library); voice.rename('公共音色'); const timbre = saved(voice.save('new'));
  f.phrase.create(timbre.id); f.phrase.rename('公共乐句');
  f.phrase.addNote(f.phrase.read().body!.parts[0]!.id, { startBeat: 0, durationBeats: .5, frequencyHz: 440, velocity: .5 });
  const global = saved(f.phrase.save('new'));
  assert(f.song.read().availablePhrases.some(item => item.id === global.id));
  assert.deepEqual(readProjectPhrases(f.library, f.songId), [], 'available starter content is not a song library entity');
  const first = f.createWithNotes(); const second = createProjectPhrase(f.library, f.songId);
  f.phrase.openDraft(first.draftId); f.phrase.setTempo(137); saved(f.phrase.save('overwrite'));
  f.phrase.setTempo(138); saved(f.phrase.save('overwrite'));
  assert.deepEqual(readProjectPhrases(f.library, f.songId).map(item => item.id), [first.id, second.id]);
  assert.equal(readProjectPhrases(f.library, f.songId)[0]!.tempoBpm, 138);
  f.song.create(); const otherSong = f.song.read().draft!.id; const other = createProjectPhrase(f.library, otherSong);
  assert.deepEqual(readProjectPhrases(f.library, otherSong).map(item => item.id), [other.id]);
  assert.deepEqual(readProjectPhrases(f.library, f.songId).map(item => item.id), [first.id, second.id]);
});

test('hiding a shelf source preserves every occurrence, audio, identity and library tile, including after reload', () => {
  const f = fixture(); const made = f.createWithNotes(); const row = f.song.read().body!.tracks[0]!.id;
  f.song.addClip(row, made.id, 0); f.song.addClip(row, made.id, 12.25);
  const before = f.song.read().body!; const plan = f.song.previewPlan(); const content = f.library.readContent(made.id);
  const writes = f.writes(); const history = f.library.readDraftHistory(f.songId).past.length;
  f.song.setPhraseShelfVisible(made.id, false);
  assert.equal(f.writes() - writes, 1);
  assert.equal(f.library.readDraftHistory(f.songId).past.length - history, 1);
  assert.deepEqual(f.song.read().body!.hiddenPhraseIds, [made.id]);
  assert.deepEqual(f.song.read().body!.tracks, before.tracks); assert.deepEqual(f.song.previewPlan(), plan);
  assert.deepEqual(f.library.readContent(made.id), content);
  assert.deepEqual(readProjectPhrases(f.library, f.songId).map(item => item.id), [made.id]);
  const reopened = createMaterialLibrary(f.storage, f.policy);
  const editor = createSongEditor(reopened, createPhrasePlayback(reopened, createTimbrePlayback(reopened)), { defaultTempoMode: 'source' });
  editor.openDraft(f.songId); assert.deepEqual(editor.read().body!.hiddenPhraseIds, [made.id]);
  assert.deepEqual(readProjectPhrases(reopened, f.songId).map(item => item.id), [made.id]);
  editor.setPhraseShelfVisible(made.id, true); assert.equal(editor.read().body!.hiddenPhraseIds, undefined);
  assert.deepEqual(editor.read().body!.tracks, before.tracks); assert.deepEqual(editor.previewPlan(), plan);
  assert.deepEqual(editor.read().draft!.dependencies, [made.id]);
  assert.equal(reopened.listContentInfo().filter(item => item.kind === 'rootsound.phrase').length, 1, 'restoring adds no cloned source');
});

test('unchanged visibility is a no-op, hide/show undo separately and new phrases are visible by default', () => {
  const f = fixture(); const first = createProjectPhrase(f.library, f.songId); const start = f.writes();
  f.song.setPhraseShelfVisible(first.id, true); assert.equal(f.writes(), start);
  f.song.setPhraseShelfVisible(first.id, false); const hiddenWrites = f.writes();
  f.song.setPhraseShelfVisible(first.id, false); assert.equal(f.writes(), hiddenWrites);
  const second = createProjectPhrase(f.library, f.songId);
  assert.deepEqual(f.song.read().body!.hiddenPhraseIds, [first.id]);
  assert(!f.song.read().body!.hiddenPhraseIds!.includes(second.id));
  f.song.setPhraseShelfVisible(first.id, true); f.song.undo();
  assert.deepEqual(f.song.read().body!.hiddenPhraseIds, [first.id]);
  f.song.undo(); assert.equal(f.song.read().body!.hiddenPhraseIds, undefined);
  f.song.redo(); assert.deepEqual(f.song.read().body!.hiddenPhraseIds, [first.id]);
  assert.equal(readProjectPhrases(f.library, f.songId).length, 2);
});

test('erasing the last timeline occurrence does not restore a hidden tile or remove its library source', () => {
  const f = fixture(); const made = f.createWithNotes(); const row = f.song.read().body!.tracks[0]!.id;
  const clip = f.song.addClip(row, made.id, 4); f.song.setPhraseShelfVisible(made.id, false);
  retainProjectPhrases(f.library, f.songId, [made.id]); f.song.removeClip(row, clip);
  assert.deepEqual(f.song.read().body!.hiddenPhraseIds, [made.id]);
  assert.deepEqual(f.song.read().draft!.dependencies, []);
  assert.deepEqual(readProjectPhrases(f.library, f.songId).map(item => item.id), [made.id]);
  f.song.setPhraseShelfVisible(made.id, true); const restored = f.song.addClip(row, made.id, 3.125);
  assert.equal(f.song.read().body!.tracks[0]!.clips.find(item => item.id === restored)!.phraseId, made.id);
});

test('dirty editors contribute one library identity and reference forks remain distinct reusable phrases', () => {
  const f = fixture(); const made = f.createWithNotes(); const row = f.song.read().body!.tracks[0]!.id;
  f.phrase.openDraft(made.draftId); f.phrase.rename('正在细调');
  const working = readProjectPhrases(f.library, f.songId);
  assert.deepEqual(working.map(item => [item.id, item.name]), [[made.id, '乐句 1']]);
  f.phrase.undo();
  const first = f.song.addClip(row, made.id, 0); f.song.addClip(row, made.id, 8);
  f.song.setPhraseShelfVisible(made.id, false);
  const fork = renameProjectPhrase(f.library, f.songId, made.id, '另一个版本', { trackId: row, clipId: first });
  assert.notEqual(fork.id, made.id);
  assert.deepEqual(new Set(readProjectPhrases(f.library, f.songId).map(item => item.id)), new Set([made.id, fork.id]));
  assert.deepEqual(f.song.read().body!.hiddenPhraseIds, [made.id], 'the independently edited new identity is visible by default');
  f.song.undo(); assert.deepEqual(readProjectPhrases(f.library, f.songId).map(item => item.id), [made.id]);
});

test('invalid, foreign and failed shelf changes preserve the entire store, history and token', () => {
  const f = fixture(); const made = createProjectPhrase(f.library, f.songId);
  f.song.create(); const other = createProjectPhrase(f.library, f.song.read().draft!.id); f.song.openDraft(f.songId);
  const before = f.raw(); const token = f.library.currentToken(); const history = f.library.readDraftHistory(f.songId);
  assert.throws(() => f.song.setPhraseShelfVisible(other.id, false), /不属于/);
  assert.throws(() => f.song.setPhraseShelfVisible('missing', false), /找不到/);
  assert.equal(f.raw(), before); assert.equal(f.library.currentToken(), token);
  f.fail(); assert.throws(() => f.song.setPhraseShelfVisible(made.id, false), /测试磁盘失败/);
  assert.equal(f.raw(), before); assert.equal(f.library.currentToken(), token);
  assert.deepEqual(f.library.readDraftHistory(f.songId), history);
});

test('song format validates shelf metadata and preserves older songs without creating hidden entries', () => {
  const f = fixture(); const body = f.song.read().body!;
  assert.equal(readSongBody(body).hiddenPhraseIds, undefined);
  assert.deepEqual(readSongBody({ ...body, hiddenPhraseIds: ['one'] }).hiddenPhraseIds, ['one']);
  for (const hiddenPhraseIds of [['one', 'one'], [null], [''], {}, 4]) {
    assert.throws(() => readSongBody({ ...body, hiddenPhraseIds }), /乐句栏/);
  }
});

test('creating from a chosen private sound keeps that exact source and creates one part without an unused default voice', () => {
  const f = fixture(); const first = f.createWithNotes(); const voice = f.phrases.readSaved(first.id).body.parts[0]!.timbreId;
  const before = f.library.listContentInfo().filter(item => item.kind === 'rootsound.timbre').map(item => item.id); const writes = f.writes();
  const next = createProjectPhrase(f.library, f.songId, voice);
  assert.equal(f.writes() - writes, 1); assert.equal(f.phrases.readSaved(next.id).body.parts.length, 1);
  assert.equal(f.phrases.readSaved(next.id).body.parts[0]!.timbreId, voice);
  assert.deepEqual(f.library.listContentInfo().filter(item => item.kind === 'rootsound.timbre').map(item => item.id), before);
  assert(readProjectPhrases(f.library, f.songId).some(item => item.id === next.id));
});

test('creating from a public sound copies its graph privately and rejects a different song sound without writes', () => {
  const f = fixture(); const voiceEditor = createTimbreEditor(f.library); voiceEditor.rename('公共起点音色');
  const original = saved(voiceEditor.save('new')); const writes = f.writes();
  const made = createProjectPhrase(f.library, f.songId, original.id); assert.equal(f.writes() - writes, 1);
  const localVoice = f.phrases.readSaved(made.id).body.parts[0]!.timbreId;
  assert.notEqual(localVoice, original.id); assert.deepEqual(f.library.readContent(localVoice)!.body, original.body);
  assert.deepEqual(f.library.readContent(original.id), original); assert.equal(f.library.projectScopeOf!({ type: 'content', id: original.id }), undefined);
  f.song.create(); const other = f.song.read().draft!.id; const before = f.raw();
  assert.throws(() => createProjectPhrase(f.library, other, localVoice), /另一首歌曲/); assert.equal(f.raw(), before);
});

test('a direct save-as enters the song library under its saved identity and receives a unique local name', () => {
  const f = fixture(); const made = f.createWithNotes(); f.phrase.openDraft(made.draftId);
  const copy = saved(f.phrase.save('new')); assert.notEqual(copy.id, made.id);
  assert(!readProjectPhrases(f.library, f.songId).some(item => item.id === copy.id));
  const notes = structuredClone(copy.body); retainProjectPhrases(f.library, f.songId, [copy.id]);
  assert.deepEqual(new Set(readProjectPhrases(f.library, f.songId).map(item => item.id)), new Set([made.id, copy.id]));
  const retained = f.library.readContent(copy.id)!; assert.notEqual(retained.name, f.library.readContent(made.id)!.name);
  assert.deepEqual(retained.body, notes); assert.equal(f.phrase.read().draft!.sourceId, copy.id);
  assert.equal(f.phrase.read().draft!.baseRevision, retained.revision); assert.equal(f.phrase.read().changed, false);
  const row = f.song.read().body!.tracks[0]!.id; f.song.addClip(row, copy.id, 0);
  assert.equal(f.song.read().body!.tracks[0]!.clips[0]!.phraseId, copy.id, 'adding the retained source makes no adoption clone');
  f.song.create(); const other = f.song.read().draft!.id;
  assert.deepEqual(readProjectPhrases(f.library, other), []);
  assert.throws(() => retainProjectPhrases(f.library, other, [copy.id]), /不属于/);
});

test('retaining a newly saved public phrase preserves its identity while copying public voice dependencies privately', () => {
  const f = fixture(); const voiceEditor = createTimbreEditor(f.library); voiceEditor.rename('仍然公开的音色');
  const voice = saved(voiceEditor.save('new')); f.phrase.create(voice.id);
  f.phrase.addNote(f.phrase.read().body!.parts[0]!.id, { startBeat: 0, durationBeats: 1, frequencyHz: 220, velocity: .6 });
  const phrase = saved(f.phrase.save('new')); const beforePlan = f.phrases.planForSaved(phrase.id);
  retainProjectPhrases(f.library, f.songId, [phrase.id]); const local = f.phrases.readSaved(phrase.id);
  assert.equal(local.content.id, phrase.id); assert.notEqual(local.body.parts[0]!.timbreId, voice.id);
  assert.deepEqual(f.library.readContent(voice.id), voice); assert.equal(f.library.projectScopeOf!({ type: 'content', id: voice.id }), undefined);
  assert.deepEqual(f.phrases.planForSaved(phrase.id), beforePlan); assert.equal(f.phrase.read().changed, false);
  assert.equal(f.phrase.read().draft!.baseRevision, local.content.revision);
  assert.deepEqual(readProjectPhrases(f.library, f.songId).map(item => item.id), [phrase.id]);
});
