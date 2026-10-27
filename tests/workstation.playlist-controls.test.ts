import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { SaveResult } from '../src/workstation/contracts/content.ts';
import { createProjectPhrase, deleteProjectPhrase, readProjectPhrases, renameProjectPhrase } from '../src/workstation/app/project-phrases.ts';
import { createProjectCopyLibrary } from '../src/workstation/app/project-setup.ts';
import { createMaterialLibrary } from '../src/workstation/modules/materials/public.ts';
import { createTimbrePlayback, createTimbreReferenceAdapter } from '../src/workstation/modules/timbre/public.ts';
import { createPhraseEditor, createPhrasePlayback, createPhraseReferenceAdapter } from '../src/workstation/modules/phrase/public.ts';
import { createSongEditor, createSongReferenceAdapter, orderSongPhraseShelf, readSongBody } from '../src/workstation/modules/song/public.ts';

function saved(result: SaveResult) { assert.equal(result.status, 'saved'); if (result.status !== 'saved') throw new Error('Expected saved'); return result.content; }
function fixture() {
  let raw: string | null = null; let writes = 0; let broken = false;
  const storage = { read: () => raw, write(value: string) { if (broken) throw new Error('测试磁盘失败'); raw = value; writes++; } };
  const policy = { project: { rootKind: 'rootsound.song', adapters: [createSongReferenceAdapter(), createPhraseReferenceAdapter(), createTimbreReferenceAdapter()] } };
  const library = createMaterialLibrary(storage, policy); const sounds = createTimbrePlayback(library);
  const phrases = createPhrasePlayback(library, sounds); const phrase = createPhraseEditor(library, sounds);
  const song = createSongEditor(library, phrases, { defaultTempoMode: 'source', initialTrackCount: 3 }); song.create();
  const id = song.read().draft!.id;
  const create = (frequency = 220) => {
    const result = createProjectPhrase(library, id); phrase.openDraft(result.draftId);
    phrase.addNote(phrase.read().body!.parts[0]!.id, { startBeat: 0, durationBeats: 1, frequencyHz: frequency, velocity: .6 });
    saved(phrase.save('overwrite')); return result;
  };
  const shelf = () => orderSongPhraseShelf(readProjectPhrases(library, id), song.read().body).filter(item => !song.read().body!.hiddenPhraseIds?.includes(item.id)).map(item => item.id);
  return { library, storage, policy, sounds, phrases, phrase, song, id, create, shelf, raw: () => raw, writes: () => writes, fail() { broken = true; } };
}

test('shelf reorder is a single durable nonmusical edit and survives restart, undo and a full project copy', () => {
  const f = fixture(); const a = f.create(); const b = f.create(330); const c = f.create(440);
  const row = f.song.read().body!.tracks[0]!.id; f.song.addClip(row, a.id, 0); f.song.addClip(row, b.id, 8);
  const before = f.song.previewPlan(); const dependencies = f.song.read().draft!.dependencies; const source = f.library.listContent();
  const writes = f.writes(); const history = f.library.readDraftHistory(f.id).past.length;
  f.song.reorderPhraseShelf(c.id, 0);
  assert.equal(f.writes() - writes, 1); assert.equal(f.library.readDraftHistory(f.id).past.length - history, 1);
  assert.deepEqual(f.shelf(), [c.id, a.id, b.id]); assert.deepEqual(f.song.read().draft!.dependencies, dependencies);
  assert.deepEqual(f.song.previewPlan(), before); assert.deepEqual(f.library.listContent(), source);
  f.song.undo(); assert.deepEqual(f.shelf(), [a.id, b.id, c.id]); f.song.redo(); assert.deepEqual(f.shelf(), [c.id, a.id, b.id]);
  const reopened = createMaterialLibrary(f.storage, f.policy);
  const editor = createSongEditor(reopened, createPhrasePlayback(reopened, createTimbrePlayback(reopened)), { defaultTempoMode: 'source' }); editor.openDraft(f.id);
  assert.deepEqual(orderSongPhraseShelf(readProjectPhrases(reopened, f.id), editor.read().body).map(item => item.id), [c.id, a.id, b.id]);
  const copied = createProjectCopyLibrary(f.raw()!, '复制后的歌', f.id); const copy = createMaterialLibrary({ read: () => copied, write() { throw new Error('Read only'); } }, f.policy);
  const copySong = createSongEditor(copy, createPhrasePlayback(copy, createTimbrePlayback(copy)), { defaultTempoMode: 'source' }); copySong.openDraft(f.id);
  assert.deepEqual(copySong.read().body!.phraseShelfOrder, [c.id, a.id, b.id]);
});

test('hidden sources retain their slot while visible sources reorder, new ones append and renaming keeps identity order', () => {
  const f = fixture(); const a = f.create(); const b = f.create(); const c = f.create();
  f.song.setPhraseShelfVisible(b.id, false); f.song.reorderPhraseShelf(c.id, 0);
  assert.deepEqual(f.song.read().body!.phraseShelfOrder, [c.id, b.id, a.id]); assert.deepEqual(f.shelf(), [c.id, a.id]);
  const d = f.create(); assert.deepEqual(f.shelf(), [c.id, a.id, d.id]);
  f.song.setPhraseShelfVisible(b.id, true); assert.deepEqual(f.shelf(), [c.id, b.id, a.id, d.id]);
  renameProjectPhrase(f.library, f.id, c.id, '最后才排到的名字'); assert.deepEqual(f.shelf(), [c.id, b.id, a.id, d.id]);
  const writes = f.writes(); f.song.reorderPhraseShelf(c.id, 0); assert.equal(f.writes(), writes);
});

test('shelf reorder rejects foreign/hidden/missing/out-of-range sources and failed writes preserve state and token', () => {
  const f = fixture(); const a = f.create(); const b = f.create(); f.song.setPhraseShelfVisible(b.id, false);
  f.song.create(); const otherId = f.song.read().draft!.id; const foreign = createProjectPhrase(f.library, otherId); f.song.openDraft(f.id);
  const before = f.raw(); const token = f.library.currentToken();
  for (const [id, index] of [[foreign.id, 0], ['missing', 0], [b.id, 0], [a.id, -1], [a.id, .5], [a.id, 3]] as const) assert.throws(() => f.song.reorderPhraseShelf(id, index));
  assert.equal(f.raw(), before); assert.equal(f.library.currentToken(), token);
  f.song.setPhraseShelfVisible(b.id, true); const intact = f.raw(); const intactToken = f.library.currentToken();
  f.fail(); assert.throws(() => f.song.reorderPhraseShelf(b.id, 0), /测试磁盘失败/);
  assert.equal(f.raw(), intact); assert.equal(f.library.currentToken(), intactToken);
});

test('permanent phrase deletion purges shelf order metadata as well as normal references and history', () => {
  const f = fixture(); const a = f.create(); const b = f.create(); f.song.reorderPhraseShelf(b.id, 0);
  f.song.setPhraseShelfVisible(a.id, false); deleteProjectPhrase(f.library, f.id, a.id);
  assert.deepEqual(f.song.read().body!.phraseShelfOrder, [b.id]); assert(!f.raw()!.includes(a.id));
  assert.deepEqual(f.song.read().draft!.dependencies, []); assert.deepEqual(f.shelf(), [b.id]);
});

test('exclusive solo enables this row atomically; mute remains effective during solo and other row gains/mutes return intact', () => {
  const f = fixture(); const a = f.create(220); const b = f.create(660); const [first, second, third] = f.song.read().body!.tracks;
  f.song.addClip(first!.id, a.id, 0); f.song.addClip(second!.id, b.id, 0); f.song.addClip(third!.id, a.id, 0);
  f.song.updateTrack(first!.id, { level: .25 }); f.song.updateTrack(second!.id, { level: 0, muted: true }); f.song.updateTrack(third!.id, { level: .4, muted: true });
  const contents = f.library.listContent(); const writes = f.writes(); f.song.toggleTrackSolo(second!.id);
  assert.equal(f.writes() - writes, 1); assert.deepEqual(f.song.read().body!.tracks.map(item => item.solo), [false, true, false]);
  assert.equal(f.song.read().body!.tracks[1]!.level, 1); assert.equal(f.song.read().body!.tracks[1]!.muted, false);
  assert.deepEqual(f.song.previewPlan().events.map(event => event.sound.note.frequencyHz), [660]);
  f.song.toggleTrackMute(second!.id); assert.deepEqual(f.song.previewPlan(undefined, { allowSilence: true }).events, [], 'muting the sole row must not suddenly reveal other rows');
  f.song.toggleTrackMute(second!.id); f.song.toggleTrackSolo(second!.id);
  assert.deepEqual(f.song.read().body!.tracks.map(item => item.solo), [false, false, false]);
  assert.equal(f.song.read().body!.tracks[0]!.level, .25); assert.equal(f.song.read().body!.tracks[2]!.muted, true);
  assert.deepEqual(f.song.previewPlan().events.map(event => event.sound.note.frequencyHz), [220, 660]);
  f.song.toggleTrackSolo(first!.id); f.song.toggleTrackSolo(second!.id); assert.deepEqual(f.song.read().body!.tracks.map(item => item.solo), [false, true, false]);
  f.song.undo(); assert.deepEqual(f.song.read().body!.tracks.map(item => item.solo), [true, false, false]);
  assert.deepEqual(f.library.listContent(), contents);
});

test('solo and mute reject missing rows and cannot partially change a failing store; shelf order schema stays optional and strict', () => {
  const f = fixture(); const first = f.song.read().body!.tracks[0]!.id; const original = f.raw();
  assert.throws(() => f.song.toggleTrackMute('missing')); assert.throws(() => f.song.toggleTrackSolo('missing')); assert.equal(f.raw(), original);
  const body = f.song.read().body!; assert.equal(readSongBody(body).phraseShelfOrder, undefined);
  for (const phraseShelfOrder of [['a', 'a'], [''], [null], {}, 3]) assert.throws(() => readSongBody({ ...body, phraseShelfOrder }), /乐句栏顺序/);
  f.fail(); assert.throws(() => f.song.toggleTrackSolo(first), /测试磁盘失败/); assert.throws(() => f.song.toggleTrackMute(first), /测试磁盘失败/);
  assert.equal(f.raw(), original);
});
