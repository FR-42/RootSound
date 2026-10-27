import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { ReferenceApplyResult } from '../src/workstation/contracts/references.ts';
import type { TimbreBody } from '../src/workstation/contracts/timbre.ts';
import { copyProjectPhrase, createProjectPhrase, readProjectPhrases, retainProjectPhrases } from '../src/workstation/app/project-phrases.ts';
import { createMaterialLibrary, createReferenceEditing } from '../src/workstation/modules/materials/public.ts';
import { createTimbrePlayback, createTimbreReferenceAdapter } from '../src/workstation/modules/timbre/public.ts';
import { createPhraseEditor, createPhrasePlayback, createPhraseReferenceAdapter, readPhraseBody } from '../src/workstation/modules/phrase/public.ts';
import { createSongEditor, createSongReferenceAdapter, readSongBody } from '../src/workstation/modules/song/public.ts';
import { savePhraseInPlace, type PhraseSaveContinuation, type PhraseSaveSelection } from '../src/workstation/modules/ui-rendering/phrase-save.ts';

function fixture() {
  let raw: string | null = null; let writes = 0; let broken = false;
  const storage = { read: () => raw, write(text: string) { if (broken) throw new Error('测试磁盘拒绝写入'); raw = text; writes++; } };
  const adapters = [createTimbreReferenceAdapter(), createPhraseReferenceAdapter(), createSongReferenceAdapter()];
  const library = createMaterialLibrary(storage, { project: { rootKind: 'rootsound.song', adapters } });
  const sounds = createTimbrePlayback(library); const phrase = createPhraseEditor(library, sounds);
  const song = createSongEditor(library, createPhrasePlayback(library, sounds), { defaultTempoMode: 'source', initialTrackCount: 7 });
  song.create(); const songId = song.read().draft!.id;
  const created = createProjectPhrase(library, songId); phrase.openDraft(created.draftId);
  const references = createReferenceEditing(library, adapters);
  const keep = (ids: string[]) => retainProjectPhrases(library, songId, ids);
  return { library, phrase, song, songId, created, references, keep, raw: () => raw, writes: () => writes, fail: () => { broken = true; } };
}
function applied(result: ReferenceApplyResult) {
  assert.equal(result.status, 'applied', JSON.stringify(result));
  if (result.status !== 'applied') throw new Error('Expected applied.');
  return result;
}
function placed(f: ReturnType<typeof fixture>, count = 2) {
  const track = f.song.read().body!.tracks[0]!.id;
  const clips = Array.from({ length: count }, (_, index) => f.song.addClip(track, f.created.id, index * 8));
  const context = { root: { type: 'draft' as const, id: f.songId }, path: [clips[0]!] };
  const edit = f.references.begin(context); f.phrase.openDraft(edit.draftId);
  return { context, edit };
}

test('the blank shell saves an empty source and changed tempo without bypassing the note-editor save guard', () => {
  const f = fixture(); const writes = f.writes();
  assert.throws(() => f.phrase.save('overwrite'), /先添加几个音符/);
  assert.equal(savePhraseInPlace({ ...f, onKeep: f.keep }).id, f.created.id);
  assert.equal(f.writes(), writes, 'clean already-retained saves perform no write');
  f.phrase.setTempo(150);
  const result = savePhraseInPlace({ ...f, onKeep: f.keep });
  assert.equal(result.id, f.created.id); assert.equal(f.phrase.read().changed, false);
  assert.equal(readPhraseBody(f.library.readContent(result.id)!.body).tempoBpm, 150);
  assert.deepEqual(f.phrase.read().body!.parts[0]!.notes, []);
  assert(readProjectPhrases(f.library, f.songId).some(item => item.id === result.id));
});

test('an occurrence save forks only the selected use and continues subsequent saves at that same use', () => {
  const f = fixture(); const { context } = placed(f); const original = f.library.readContent(f.created.id)!;
  f.phrase.setTempo(140);
  const first = savePhraseInPlace({ ...f, onKeep: f.keep });
  assert.notEqual(first.id, f.created.id); assert.deepEqual(first.session!.context, context);
  assert.equal(f.phrase.read().draft!.id, first.session!.draftId);
  assert.deepEqual(f.library.readContent(f.created.id), original);
  let clips = readSongBody(f.library.readDraft(f.songId)!.body).tracks[0]!.clips;
  assert.equal(clips[0]!.phraseId, first.id); assert.equal(clips[1]!.phraseId, f.created.id);
  const count = f.library.listContent().length; f.phrase.setTempo(160);
  const second = savePhraseInPlace({ ...f, onKeep: f.keep });
  assert.equal(second.id, first.id); assert.equal(f.library.listContent().length, count);
  clips = readSongBody(f.library.readDraft(f.songId)!.body).tracks[0]!.clips;
  assert.equal(clips[0]!.phraseId, second.id); assert.equal(clips[1]!.phraseId, f.created.id);
  assert.equal(readPhraseBody(f.library.readContent(second.id)!.body).tempoBpm, 160);
});

test('whole-shelf editing refreshes its selected positions and token before the next save', () => {
  const f = fixture(); const { edit } = placed(f);
  const locations = f.references.locations(edit.draftId);
  let selection: PhraseSaveSelection = { ids: locations.locations.filter(item => item.root.type === 'draft' && item.root.id === f.songId).map(item => item.id),
    token: locations.token, reuseIfAllSelected: true };
  assert.equal(selection.ids.length, 2); f.phrase.setTempo(135);
  const first = savePhraseInPlace({ ...f, selection, onKeep: f.keep });
  assert.equal(first.id, f.created.id); assert.equal(first.selection!.ids.length, 2);
  assert.notEqual(first.selection!.token, selection.token); selection = first.selection!;
  f.phrase.setTempo(155);
  const second = savePhraseInPlace({ ...f, selection, onKeep: f.keep });
  assert.equal(second.id, f.created.id);
  assert.equal(readPhraseBody(f.library.readContent(second.id)!.body).tempoBpm, 155);
  assert(readSongBody(f.library.readDraft(f.songId)!.body).tracks[0]!.clips.every(clip => clip.phraseId === second.id));
});

test('retaining a two-of-three fork refreshes the continuation selection after its membership write', () => {
  const f = fixture(); const { edit } = placed(f, 3); f.phrase.setTempo(135);
  const locations = f.references.locations(edit.draftId);
  const selection: PhraseSaveSelection = { ids: locations.locations.filter(item => item.root.type === 'draft' && item.root.id === f.songId).slice(0, 2).map(item => item.id),
    token: locations.token, reuseIfAllSelected: true };
  const first = savePhraseInPlace({ ...f, selection, onKeep: f.keep });
  assert.notEqual(first.id, f.created.id); assert.equal(first.selection!.ids.length, 2);
  assert.equal(first.selection!.token, f.references.locations(first.session!.draftId).token);
  f.phrase.setTempo(155);
  const second = savePhraseInPlace({ ...f, selection: first.selection, onKeep: f.keep });
  assert.equal(second.id, first.id);
  const clips = readSongBody(f.library.readDraft(f.songId)!.body).tracks[0]!.clips;
  assert.equal(clips.filter(clip => clip.phraseId === second.id).length, 2);
  assert.equal(clips.filter(clip => clip.phraseId === f.created.id).length, 1);
});

test('saving the outer phrase commits a previously staged nested sound and preserves its singleton identity', () => {
  const f = fixture(); const { edit } = placed(f, 1);
  const part = f.phrase.read().body!.parts[0]!; const originalTone = part.timbreId;
  const inner = f.references.begin({ root: { type: 'draft', id: edit.draftId }, path: [part.id] });
  const draft = f.library.readDraft(inner.draftId)!;
  f.library.updateDraft(draft.id, { body: { ...(draft.body as TimbreBody), level: 0.17 } }, { remember: true, expected: draft });
  const staged = applied(f.references.apply(inner.draftId)); assert.notEqual(staged.content.id, originalTone);
  const result = savePhraseInPlace({ ...f, onKeep: f.keep });
  assert.equal(result.id, f.created.id); assert.equal(f.phrase.read().body!.parts[0]!.timbreId, originalTone);
  assert.equal((f.library.readContent(originalTone)!.body as TimbreBody).level, 0.17);
  assert.equal(f.library.readContent(staged.content.id), undefined);
  assert(f.references.resume(f.phrase.read().draft!.id));
});

test('an unfinished child or stale position token preserves the editing draft and never claims a save', () => {
  const f = fixture(); const { edit } = placed(f, 1); const part = f.phrase.read().body!.parts[0]!;
  const inner = f.references.begin({ root: { type: 'draft', id: edit.draftId }, path: [part.id] });
  const before = f.raw(); let kept = false;
  assert.throws(() => savePhraseInPlace({ ...f, onKeep: () => { kept = true; } }), /先完成或取消/);
  assert.equal(f.raw(), before); assert.equal(kept, false); assert(f.library.readDraft(inner.draftId));
  assert.equal(f.references.cancel(inner.draftId).status, 'done');
  const locations = f.references.locations(edit.draftId); f.phrase.setTempo(170); const edited = f.raw();
  assert.throws(() => savePhraseInPlace({ ...f, selection: { ids: locations.locations.map(item => item.id), token: `${locations.token}stale` }, onKeep: f.keep }), /使用位置已发生变化/);
  assert.equal(f.raw(), edited); assert.equal(f.phrase.read().body!.tempoBpm, 170);
});

test('retention failure occurs after the editor and caller can adopt their valid continuation', () => {
  const f = fixture(); placed(f); f.phrase.setTempo(145); let continuation: PhraseSaveContinuation | undefined;
  assert.throws(() => savePhraseInPlace({ ...f, onContinuation: value => { continuation = value; }, onKeep: () => { throw new Error('保留失败'); } }), /保留失败/);
  assert(continuation?.session); assert.equal(f.phrase.read().draft!.id, continuation.session.draftId);
  assert.equal(f.phrase.read().body!.tempoBpm, 145); assert.equal(f.phrase.read().changed, false);
});

test('save-as copies the current long edit into this song atomically without rewriting its original or clipping notes', () => {
  const f = fixture(); const original = f.library.readContent(f.created.id)!;
  f.phrase.setLength(32); f.phrase.setTempo(180); f.phrase.setMasterLevel(0.65);
  f.phrase.addNote(f.phrase.read().body!.parts[0]!.id, { startBeat: 24, durationBeats: 2, frequencyHz: 330, velocity: 0.8 });
  const draft = f.phrase.read().draft!; const body = f.phrase.read().body!; const song = f.song.read().draft!;
  const history = f.library.readDraftHistory(f.songId); const writes = f.writes();
  const copy = copyProjectPhrase(f.library, f.songId, draft.id);
  assert.equal(f.writes(), writes + 1); assert.notEqual(copy.id, f.created.id);
  assert.equal(f.library.readContent(copy.id)!.name, '乐句 2');
  assert.deepEqual(readPhraseBody(f.library.readContent(copy.id)!.body), body);
  assert.deepEqual(f.library.readContent(copy.id)!.dependencies, draft.dependencies, 'private sound references stay shared');
  assert.deepEqual(f.library.readContent(f.created.id), original); assert.deepEqual(f.library.readDraft(draft.id), draft);
  assert.deepEqual(f.song.read().draft, song); assert.deepEqual(f.library.readDraftHistory(f.songId), history);
  assert.equal(f.library.projectScopeOf!({ type: 'content', id: copy.id }), f.library.projectScopeOf!({ type: 'draft', id: f.songId }));
  assert.deepEqual(f.library.currentProjectView!(f.songId)!.memberIds, [f.created.id, copy.id]);
  f.phrase.openDraft(copy.draftId); assert.equal(f.phrase.read().changed, false);
  assert.equal(f.phrase.read().body!.parts[0]!.notes[0]!.startBeat, 24);
});

test('a save-as copy keeps a staged tone alive when its original occurrence edit is later cancelled', () => {
  const f = fixture(); const { edit } = placed(f, 1); const part = f.phrase.read().body!.parts[0]!;
  const originalTone = f.library.readContent(part.timbreId)!;
  const inner = f.references.begin({ root: { type: 'draft', id: edit.draftId }, path: [part.id] });
  const workingTone = f.library.readDraft(inner.draftId)!;
  f.library.updateDraft(workingTone.id, { body: { ...(workingTone.body as TimbreBody), level: 0.12 } }, { remember: true, expected: workingTone });
  const staged = applied(f.references.apply(inner.draftId));
  const copy = copyProjectPhrase(f.library, f.songId, edit.draftId);
  assert.equal(f.references.cancel(edit.draftId).status, 'done');
  assert.equal(readPhraseBody(f.library.readContent(copy.id)!.body).parts[0]!.timbreId, staged.content.id);
  assert.equal((f.library.readContent(staged.content.id)!.body as TimbreBody).level, 0.12);
  assert.deepEqual(f.library.readContent(originalTone.id), originalTone);
  assert.equal(readSongBody(f.library.readDraft(f.songId)!.body).tracks[0]!.clips[0]!.phraseId, f.created.id);
  f.phrase.openDraft(copy.draftId); assert.equal(f.phrase.read().problem, undefined);
});

test('save-as rejects a foreign song or unfinished child and failed storage never creates a partial copy', () => {
  const f = fixture(); const source = f.phrase.read().draft!.id;
  f.song.create(); const otherSong = f.song.read().draft!.id; let before = f.raw();
  assert.throws(() => copyProjectPhrase(f.library, otherSong, source), /另一首歌曲/); assert.equal(f.raw(), before);
  const child = f.references.begin({ root: { type: 'draft', id: source }, path: [f.phrase.read().body!.parts[0]!.id] });
  before = f.raw(); assert.throws(() => copyProjectPhrase(f.library, f.songId, source), /先完成或取消/); assert.equal(f.raw(), before);
  assert.equal(f.references.cancel(child.draftId).status, 'done'); before = f.raw(); f.fail();
  assert.throws(() => copyProjectPhrase(f.library, f.songId, source), /测试磁盘拒绝写入/); assert.equal(f.raw(), before);
  assert.deepEqual(readProjectPhrases(f.library, f.songId).map(item => item.id), [f.created.id]);
});
