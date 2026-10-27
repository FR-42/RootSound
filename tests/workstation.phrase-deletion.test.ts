import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { MaterialStorage, SaveResult } from '../src/workstation/contracts/content.ts';
import { createProjectPhrase, deleteProjectPhrase, readProjectPhrases, renameProjectPhrase } from '../src/workstation/app/project-phrases.ts';
import { createMaterialLibrary, createReferenceEditing } from '../src/workstation/modules/materials/public.ts';
import { createTimbreEditor, createTimbrePlayback, createTimbreReferenceAdapter } from '../src/workstation/modules/timbre/public.ts';
import { createPhraseEditor, createPhrasePlayback, createPhraseReferenceAdapter } from '../src/workstation/modules/phrase/public.ts';
import { createSongEditor, createSongReferenceAdapter, readSongBody } from '../src/workstation/modules/song/public.ts';
import { createSampleReferenceAdapter } from '../src/workstation/modules/sampling/public.ts';

function saved(result: SaveResult) {
  assert.equal(result.status, 'saved', JSON.stringify(result));
  if (result.status !== 'saved') throw new Error('Expected saved content.');
  return result.content;
}
function fixture() {
  let raw: string | null = null; let writes = 0; let failWrites = false;
  const storage = { read: () => raw, write(value: string) { if (failWrites) throw new Error('测试写入失败'); raw = value; writes++; } };
  const adapters = [createSongReferenceAdapter(), createPhraseReferenceAdapter(), createTimbreReferenceAdapter(), createSampleReferenceAdapter()];
  const policy = { project: { rootKind: 'rootsound.song', adapters } };
  const library = createMaterialLibrary(storage, policy); const timbres = createTimbrePlayback(library);
  const phrases = createPhrasePlayback(library, timbres); const phrase = createPhraseEditor(library, timbres);
  const song = createSongEditor(library, phrases, { defaultTempoMode: 'source' }); song.create();
  const songId = song.read().draft!.id;
  function createWithNotes() {
    const made = createProjectPhrase(library, songId); phrase.openDraft(made.draftId);
    phrase.addNote(phrase.read().body!.parts[0]!.id, { startBeat: 0, durationBeats: 1, frequencyHz: 330, velocity: .7 });
    saved(phrase.save('overwrite')); return made;
  }
  return { library, storage, policy, adapters, timbres, phrases, phrase, song, songId, createWithNotes,
    raw: () => raw!, writes: () => writes, fail() { failWrites = true; } };
}

test('permanent phrase deletion removes every placement, source draft, member and undo snapshot in one write, but keeps tones', () => {
  const f = fixture(); const made = f.createWithNotes(); const kept = createProjectPhrase(f.library, f.songId);
  const row = f.song.read().body!.tracks[0]!.id;
  f.song.addClip(row, made.id, 0); f.song.addClip(row, made.id, 8); f.song.addClip(row, kept.id, 12);
  f.song.setPhraseShelfVisible(made.id, false); const songContent = saved(f.song.save('new'));
  f.song.rename('包含新编辑的歌曲'); f.phrase.setTempo(143);
  const tones = f.library.listContent().filter(item => item.kind === 'rootsound.timbre'); const before = f.writes();
  deleteProjectPhrase(f.library, f.songId, made.id);
  assert.equal(f.writes() - before, 1); assert.equal(f.library.readContent(made.id), undefined);
  assert.equal(f.library.readDraft(made.draftId), undefined);
  assert.deepEqual(readProjectPhrases(f.library, f.songId).map(item => item.id), [kept.id]);
  assert.deepEqual(f.song.read().body!.tracks[0]!.clips.map(clip => clip.phraseId), [kept.id]);
  assert.equal(f.song.read().body!.hiddenPhraseIds, undefined);
  assert.deepEqual(readSongBody(f.library.readContent(songContent.id)!.body).tracks[0]!.clips.map(clip => clip.phraseId), [kept.id]);
  assert.deepEqual(f.library.listContent().filter(item => item.kind === 'rootsound.timbre'), tones);
  assert(!f.raw().includes(made.id), 'neither ordinary snapshots nor composite journals may retain the deleted identity');
  assert(!f.raw().includes(made.draftId));
  assert.equal(f.song.read().canUndo, false); f.song.undo(); assert.equal(f.library.readContent(made.id), undefined);
  const reopened = createMaterialLibrary(f.storage, f.policy);
  const editor = createSongEditor(reopened, createPhrasePlayback(reopened, createTimbrePlayback(reopened)), { defaultTempoMode: 'source' });
  editor.openDraft(f.songId); assert.deepEqual(readProjectPhrases(reopened, f.songId).map(item => item.id), [kept.id]);
  assert.equal(editor.read().body!.tracks[0]!.clips.length, 1); assert.equal(editor.read().canUndo, false);
});

test('an unused hidden phrase is forgotten completely without clearing unrelated phrase or other-song history', () => {
  const f = fixture(); const removed = createProjectPhrase(f.library, f.songId); const kept = f.createWithNotes();
  f.song.setPhraseShelfVisible(removed.id, false); f.phrase.openDraft(kept.draftId); f.phrase.setTempo(144);
  f.song.create(); const otherId = f.song.read().draft!.id; const other = createProjectPhrase(f.library, otherId);
  f.song.rename('另一首歌曲'); const otherBefore = f.library.readDraft(otherId); const otherHistory = f.library.readDraftHistory(otherId);
  const keptHistory = f.library.readDraftHistory(kept.draftId);
  deleteProjectPhrase(f.library, f.songId, removed.id);
  assert.deepEqual(f.library.readDraft(otherId), otherBefore); assert.deepEqual(f.library.readDraftHistory(otherId), otherHistory);
  assert.deepEqual(f.library.readDraftHistory(kept.draftId), keptHistory);
  assert.deepEqual(readProjectPhrases(f.library, otherId).map(item => item.id), [other.id]);
  assert(!f.raw().includes(removed.id)); f.phrase.undo(); assert.notEqual(f.phrase.read().body!.tempoBpm, 144);
});

test('a composite reference edit cannot resurrect a permanently removed source or erase its surviving fork', () => {
  const f = fixture(); const removed = f.createWithNotes(); const row = f.song.read().body!.tracks[0]!.id;
  const first = f.song.addClip(row, removed.id, 0); f.song.addClip(row, removed.id, 8);
  const fork = renameProjectPhrase(f.library, f.songId, removed.id, '保留的独立版本', { trackId: row, clipId: first });
  assert.notEqual(fork.id, removed.id);
  assert(f.library.readDraftHistory(f.songId).past.some(step => step.transactionId));
  const surviving = f.library.readContent(fork.id);
  deleteProjectPhrase(f.library, f.songId, removed.id);
  assert(!f.raw().includes(removed.id)); assert.equal(f.library.readDraftHistory(f.songId).past.length, 0);
  f.song.undo(); assert.deepEqual(f.library.readContent(fork.id), surviving);
  assert.equal(f.song.read().body!.tracks[0]!.clips[0]!.phraseId, fork.id);
  assert.equal(f.library.readContent(removed.id), undefined);
  assert.deepEqual(readProjectPhrases(f.library, f.songId).map(item => item.id), [fork.id]);
});

test('deleting a phrase clears nested unfinished sound edits but preserves its saved voice and unrelated pending editor', () => {
  const f = fixture(); const removed = f.createWithNotes(); const kept = f.createWithNotes();
  const row = f.song.read().body!.tracks[0]!.id;
  const removedClip = f.song.addClip(row, removed.id, 0); const keptClip = f.song.addClip(row, kept.id, 8);
  const refs = createReferenceEditing(f.library, f.adapters);
  const phraseSession = refs.begin({ root: { type: 'draft', id: f.songId }, path: [removedClip] });
  const part = f.phrases.readSaved(removed.id).body.parts[0]!.id;
  const voiceId = f.phrases.readSaved(removed.id).body.parts[0]!.timbreId; const voiceBefore = f.library.readContent(voiceId);
  const toneSession = refs.begin({ root: { type: 'draft', id: phraseSession.draftId }, path: [part] });
  const tone = createTimbreEditor(f.library); tone.openDraft(toneSession.draftId); tone.rename('未完成音色修改');
  const unrelated = refs.begin({ root: { type: 'draft', id: f.songId }, path: [keptClip] });
  const unrelatedEditor = createPhraseEditor(f.library, f.timbres); unrelatedEditor.openDraft(unrelated.draftId); unrelatedEditor.setTempo(157);
  deleteProjectPhrase(f.library, f.songId, removed.id);
  assert.equal(f.library.readDraft(phraseSession.draftId), undefined); assert.equal(f.library.readDraft(toneSession.draftId), undefined);
  assert.deepEqual(f.library.readContent(voiceId), voiceBefore);
  assert.equal(unrelatedEditor.read().body!.tempoBpm, 157); assert(refs.resume(unrelated.draftId));
  const apply = refs.apply(unrelated.draftId); assert.equal(apply.status, 'applied', JSON.stringify(apply));
  assert.equal(f.song.read().body!.tracks[0]!.clips.length, 1);
});

test('failed deletion preserves content, placements, membership, histories and token; foreign or missing sources never write', () => {
  const f = fixture(); const removed = f.createWithNotes(); const row = f.song.read().body!.tracks[0]!.id;
  f.song.addClip(row, removed.id, 0); f.song.rename('待保留的编辑');
  f.song.create(); const otherId = f.song.read().draft!.id; const other = createProjectPhrase(f.library, otherId);
  const before = f.raw(); const token = f.library.currentToken(); const writes = f.writes();
  assert.throws(() => deleteProjectPhrase(f.library, f.songId, other.id), /不属于/);
  assert.throws(() => deleteProjectPhrase(f.library, f.songId, 'missing'), /不属于/);
  assert.equal(f.raw(), before); assert.equal(f.writes(), writes);
  f.fail(); assert.throws(() => deleteProjectPhrase(f.library, f.songId, removed.id), /测试写入失败/);
  assert.equal(f.raw(), before); assert.equal(f.library.currentToken(), token); assert.equal(f.writes(), writes);
});

test('permanent transaction mode rejects an undo anchor and stale callers without disturbing the store', () => {
  const f = fixture(); const removed = createProjectPhrase(f.library, f.songId); const source = f.library.readContent(removed.id)!;
  const before = f.raw();
  assert.equal(f.library.commitTransaction({ expectedToken: f.library.currentToken(), label: '不合法永久删除',
    permanentDelete: true, anchorDraftId: f.songId, deleteContents: [source] }).status, 'conflict');
  assert.equal(f.library.commitTransaction({ expectedToken: 'stale', label: '过时删除', permanentDelete: true, deleteContents: [source] }).status, 'conflict');
  assert.equal(f.raw(), before);
});

test('confirmed deletion uses the atomic permanent checkpoint hook and a failed hook leaves every state unchanged', () => {
  const f = fixture(); let permanentWrites = 0; let checkpoint: string | undefined;
  (f.storage as MaterialStorage).writePermanent = value => { f.storage.write(value); permanentWrites++; checkpoint = value; };
  const removed = f.createWithNotes(); assert.equal(permanentWrites, 0, 'ordinary edits must not mark a manual checkpoint');
  deleteProjectPhrase(f.library, f.songId, removed.id);
  assert.equal(permanentWrites, 1); assert.equal(checkpoint, f.raw()); assert(!checkpoint!.includes(removed.id));
  const kept = createProjectPhrase(f.library, f.songId); const before = f.raw(); const beforeToken = f.library.currentToken();
  const previousCheckpoint = checkpoint; f.fail();
  assert.throws(() => deleteProjectPhrase(f.library, f.songId, kept.id), /测试写入失败/);
  assert.equal(permanentWrites, 1); assert.equal(checkpoint, previousCheckpoint); assert.equal(f.raw(), before);
  assert.equal(f.library.currentToken(), beforeToken); assert(f.library.readContent(kept.id));
});
