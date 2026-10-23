import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { ContentRecord, Draft, MaterialLibrary, NewContent, SaveResult } from '../src/workstation/contracts/content.ts';
import type { PhraseBody } from '../src/workstation/contracts/phrase.ts';
import type { SongBody } from '../src/workstation/contracts/song.ts';
import type { TimbreBody } from '../src/workstation/contracts/timbre.ts';
import type { ReferenceApplyResult, ReferenceRoot } from '../src/workstation/contracts/references.ts';
import { createMaterialLibrary } from '../src/workstation/modules/materials/public.ts';
import { createReferenceEditing } from '../src/workstation/modules/materials/reference-editing.ts';
import { createTimbreReferenceAdapter, createTimbrePlayback } from '../src/workstation/modules/timbre/public.ts';
import { createPhraseReferenceAdapter, createPhrasePlayback, createPhraseEditor, readPhraseBody } from '../src/workstation/modules/phrase/public.ts';
import { createSongReferenceAdapter, createSongEditor, readSongBody } from '../src/workstation/modules/song/public.ts';

function saved(value: SaveResult): ContentRecord { assert.equal(value.status, 'saved'); if (value.status !== 'saved') throw new Error('Expected saved'); return value.content; }
function applied(value: ReferenceApplyResult) { assert.equal(value.status, 'applied', JSON.stringify(value)); if (value.status !== 'applied') throw new Error('Expected apply'); return value; }
function adapters() { return [createTimbreReferenceAdapter(), createPhraseReferenceAdapter(), createSongReferenceAdapter()]; }
function fixture() {
  let raw: string | null = null; let broken = false; let writes = 0;
  const storage = { read: () => raw, write(value: string) { if (broken) throw new Error('磁盘不可用'); raw = value; writes++; } };
  const library = createMaterialLibrary(storage);
  function save(input: NewContent) { const draft = library.createDraft(input); const content = saved(library.saveDraft(draft.id, 'new')); return { content, draft: library.readDraft(draft.id)! }; }
  const timbre = save({ kind: 'rootsound.timbre', owner: 'timbre', schemaVersion: 1, name: '木琴',
    body: { model: 'basic-synth', version: 1, character: 'warm', attackSeconds: 0.02, releaseSeconds: 0.5, level: 0.6 } });
  const phraseBody: PhraseBody = { model: 'note-phrase', version: 1, timeUnit: 'beat', tempoBpm: 120, lengthBeats: 4,
    parts: ['part-a', 'part-b'].map((id, index) => ({ id, name: index ? '回应' : '主旋律', timbreId: timbre.content.id,
      notes: [{ id: `note-${index}`, startBeat: 0, durationBeats: 1, frequencyHz: 220 + index * 110, velocity: 0.7 }] })) };
  const phrase = save({ kind: 'rootsound.phrase', owner: 'phrase', schemaVersion: 1, name: '副歌', dependencies: [timbre.content.id], body: phraseBody });
  const songBody: SongBody = { model: 'phrase-arrangement', version: 1, timeUnit: 'beat', tempoBpm: 120, tempoMode: 'source', lengthBeats: 16,
    tracks: [{ id: 'track-a', name: '旋律', level: 0.8, pan: 0, muted: false, solo: false,
      clips: ['clip-a', 'clip-b', 'clip-c'].map((id, index) => ({ id, phraseId: phrase.content.id, startBeat: index * 4 })) }] };
  const song = save({ kind: 'rootsound.song', owner: 'song', schemaVersion: 1, name: '清晨', dependencies: [phrase.content.id], body: songBody });
  const secondBody: SongBody = { ...songBody, tracks: [{ ...songBody.tracks[0]!, clips: [{ id: 'clip-z', phraseId: phrase.content.id, startBeat: 0 }] }] };
  const second = save({ kind: 'rootsound.song', owner: 'song', schemaVersion: 1, name: '晚风', dependencies: [phrase.content.id], body: secondBody });
  const refs = createReferenceEditing(library, adapters());
  const root: ReferenceRoot = { type: 'draft', id: song.draft.id };
  return { library, storage, refs, timbre, phrase, song, second, root, save, raw: () => raw, writes: () => writes, break: () => { broken = true; } };
}
function changeSound(library: MaterialLibrary, id: string, level: number) {
  const draft = library.readDraft(id)!; library.updateDraft(id, { body: { ...(draft.body as TimbreBody), level } });
}
function changeNote(library: MaterialLibrary, id: string, frequencyHz: number) {
  const draft = library.readDraft(id)!; const body = readPhraseBody(draft.body); body.parts[0]!.notes[0]!.frequencyHz = frequencyHz;
  library.updateDraft(id, { body }, { remember: true, expected: draft });
}
function clipIds(draft: Draft | ContentRecord) { return readSongBody(draft.body).tracks[0]!.clips.map(clip => clip.phraseId); }

test('ordinary phrase edits split only the selected repeated occurrence and persist one atomic write', () => {
  const f = fixture(); const edit = f.refs.begin({ root: f.root, path: ['clip-b'] });
  changeNote(f.library, edit.draftId, 440); const writes = f.writes(); const result = applied(f.refs.apply(edit.draftId));
  assert.equal(f.writes(), writes + 1); assert.deepEqual(result.roots, [f.root]);
  assert.deepEqual(clipIds(f.library.readDraft(f.root.id)!), [f.phrase.content.id, result.content.id, f.phrase.content.id]);
  assert.equal(readPhraseBody(result.content.body).parts[0]!.notes[0]!.frequencyHz, 440);
  assert.equal(readPhraseBody(f.library.readContent(f.phrase.content.id)!.body).parts[0]!.notes[0]!.frequencyHz, 220);
  assert.deepEqual(clipIds(f.library.readContent(f.song.content.id)!), [f.phrase.content.id, f.phrase.content.id, f.phrase.content.id]);
  assert.equal(f.library.readDraft(edit.draftId), undefined);
});

test('sound edits isolate the whole occurrence chain despite only one directly referenced sound identity', () => {
  const f = fixture(); const edit = f.refs.begin({ root: f.root, path: ['clip-b', 'part-a'] });
  changeSound(f.library, edit.draftId, 0.25); const result = applied(f.refs.apply(edit.draftId));
  const ids = clipIds(f.library.readDraft(f.root.id)!); assert.equal(ids[0], f.phrase.content.id); assert.equal(ids[2], f.phrase.content.id);
  assert.notEqual(ids[1], f.phrase.content.id);
  const isolated = readPhraseBody(f.library.readContent(ids[1]!)!.body);
  assert.equal(isolated.parts[0]!.timbreId, result.content.id); assert.equal(isolated.parts[1]!.timbreId, f.timbre.content.id);
  assert.equal((f.library.readContent(f.timbre.content.id)!.body as TimbreBody).level, 0.6);
  assert.equal((result.content.body as TimbreBody).level, 0.25);
  assert.equal(f.library.listContent().length, 6);
});

test('joint application rewrites selected occurrences across songs while leaving all unselected parts unchanged', () => {
  const f = fixture(); const edit = f.refs.begin({ root: f.root, path: ['clip-a', 'part-a'] });
  const places = f.refs.locations(edit.draftId);
  assert.equal(places.locations.length, 8); // two parts in three current clips plus one saved song clip
  const chosen = places.locations.filter(item => item.path.at(-1) === 'part-a'
    && (item.path[0] === 'clip-a' || item.path[0] === 'clip-c' || item.root.id === f.second.content.id));
  changeSound(f.library, edit.draftId, 0.1);
  const result = applied(f.refs.apply(edit.draftId, { locationIds: chosen.map(item => item.id), expectedToken: places.token }));
  const current = clipIds(f.library.readDraft(f.root.id)!); const other = clipIds(f.library.readContent(f.second.content.id)!);
  assert.equal(current[1], f.phrase.content.id); assert.notEqual(current[0], f.phrase.content.id);
  assert.equal(current[0], current[2]); assert.equal(current[0], other[0]);
  const phrase = readPhraseBody(f.library.readContent(current[0]!)!.body);
  assert.equal(phrase.parts[0]!.timbreId, result.content.id); assert.equal(phrase.parts[1]!.timbreId, f.timbre.content.id);
  assert.deepEqual(clipIds(f.library.readDraft(f.second.draft.id)!), other);
});

test('joint apply is one durable undo and redo step including saved songs, forks and restored editing draft', () => {
  const f = fixture(); const edit = f.refs.begin({ root: f.root, path: ['clip-b'] }); changeNote(f.library, edit.draftId, 550);
  const places = f.refs.locations(edit.draftId);
  const chosen = places.locations.filter(item => item.current || item.root.id === f.second.content.id);
  const result = applied(f.refs.apply(edit.draftId, { locationIds: chosen.map(item => item.id), expectedToken: places.token }));
  const changed = f.raw(); const reopened = createMaterialLibrary(f.storage);
  reopened.travelDraft(f.root.id, 'undo', reopened.readDraft(f.root.id)!);
  assert.deepEqual(clipIds(reopened.readDraft(f.root.id)!), clipIds(f.song.content));
  assert.deepEqual(reopened.readContent(f.second.content.id), f.second.content);
  assert.equal(reopened.readContent(result.content.id), undefined); assert.ok(reopened.readDraft(edit.draftId));
  const again = createMaterialLibrary(f.storage);
  again.travelDraft(f.root.id, 'redo', again.readDraft(f.root.id)!);
  assert.equal(clipIds(again.readDraft(f.root.id)!)[1], result.content.id);
  assert.equal(clipIds(again.readContent(f.second.content.id)!)[0], result.content.id);
  assert.equal(again.readDraft(edit.draftId), undefined); assert.equal(f.raw(), changed);
});

test('new unsaved song roots can be edited without publishing the song', () => {
  const f = fixture(); const fresh = f.library.createDraft({ kind: f.song.draft.kind, owner: f.song.draft.owner,
    schemaVersion: f.song.draft.schemaVersion, name: '未保存的新歌', dependencies: f.song.draft.dependencies, body: f.song.draft.body });
  const edit = f.refs.begin({ root: { type: 'draft', id: fresh.id }, path: ['clip-b'] }); changeNote(f.library, edit.draftId, 660);
  const result = applied(f.refs.apply(edit.draftId));
  assert.equal(f.library.readDraft(fresh.id)!.sourceId, undefined); assert.equal(clipIds(f.library.readDraft(fresh.id)!)[1], result.content.id);
  assert.equal(f.library.listContent().filter(item => item.kind === 'rootsound.song').length, 2);
});

test('cancelled isolated editing deletes its working draft without adding or changing public contents', () => {
  const f = fixture(); const before = f.library.listContent(); const drafts = f.library.listDrafts();
  const edit = f.refs.begin({ root: f.root, path: ['clip-b', 'part-a'] }); changeSound(f.library, edit.draftId, 0.15);
  assert.equal(f.refs.cancel(edit.draftId).status, 'done'); assert.deepEqual(f.library.listContent(), before); assert.deepEqual(f.library.listDrafts(), drafts);
});

test('context and library draft adoption survive reopening and preserve pending music and undo history', () => {
  const f = fixture(); const before = f.library.readDraft(f.phrase.draft.id)!; changeNote(f.library, before.id, 880);
  const history = f.library.readDraftHistory(before.id); const edit = f.refs.beginLibrary(f.phrase.content.id, before.id);
  assert.equal(edit.draftId, before.id); assert.deepEqual(f.library.readDraftHistory(before.id), history);
  const reopened = createMaterialLibrary(f.storage); const manager = createReferenceEditing(reopened, adapters());
  assert.equal(manager.resume(edit.draftId)!.targetKind, 'rootsound.phrase');
  const result = applied(manager.apply(edit.draftId)); assert.equal(result.workingDraftId, before.id); assert.notEqual(result.content.id, f.phrase.content.id);
  assert.equal(readPhraseBody(result.content.body).parts[0]!.notes[0]!.frequencyHz, 880);
  assert.equal(reopened.readDraft(edit.draftId)!.editingContext, undefined);
});

test('cancelling an adopted library scope preserves all edits made before and during scope selection', () => {
  const f = fixture(); changeNote(f.library, f.phrase.draft.id, 770); const history = f.library.readDraftHistory(f.phrase.draft.id);
  const edit = f.refs.beginLibrary(f.phrase.content.id, f.phrase.draft.id);
  assert.equal(f.refs.cancel(edit.draftId).status, 'done');
  assert.equal(readPhraseBody(f.library.readDraft(edit.draftId)!.body).parts[0]!.notes[0]!.frequencyHz, 770);
  assert.deepEqual(f.library.readDraftHistory(edit.draftId), history);
});

test('nested sound editing retains unsaved phrase notes and final application changes only the outer song occurrence', () => {
  const f = fixture(); const outer = f.refs.begin({ root: f.root, path: ['clip-b'] }); changeNote(f.library, outer.draftId, 990);
  const inner = f.refs.begin({ root: { type: 'draft', id: outer.draftId }, path: ['part-a'] }); changeSound(f.library, inner.draftId, 0.12);
  const sound = applied(f.refs.apply(inner.draftId)).content;
  const pending = readPhraseBody(f.library.readDraft(outer.draftId)!.body);
  assert.equal(pending.parts[0]!.notes[0]!.frequencyHz, 990); assert.equal(pending.parts[0]!.timbreId, sound.id);
  const result = applied(f.refs.apply(outer.draftId));
  const phrase = readPhraseBody(result.content.body); assert.equal(phrase.parts[0]!.notes[0]!.frequencyHz, 990); assert.equal(phrase.parts[0]!.timbreId, sound.id);
  assert.deepEqual(clipIds(f.library.readDraft(f.root.id)!), [f.phrase.content.id, result.content.id, f.phrase.content.id]);
});

test('cancelling an outer phrase reclaims its unpublished nested sound and all nested editing drafts', () => {
  const f = fixture(); const before = f.library.listContent(); const outer = f.refs.begin({ root: f.root, path: ['clip-b'] });
  const inner = f.refs.begin({ root: { type: 'draft', id: outer.draftId }, path: ['part-a'] }); changeSound(f.library, inner.draftId, 0.1);
  const sound = applied(f.refs.apply(inner.draftId)).content; assert.ok(f.library.readContent(sound.id));
  const third = f.refs.begin({ root: { type: 'draft', id: outer.draftId }, path: ['part-b'] });
  assert.equal(f.refs.cancel(outer.draftId).status, 'done'); assert.equal(f.library.readDraft(third.draftId), undefined);
  assert.equal(f.library.readContent(sound.id), undefined); assert.deepEqual(f.library.listContent(), before);
  assert.doesNotThrow(() => createMaterialLibrary(f.storage));
});

test('preselected scope tolerates changes to the working draft but rejects changed source locations', () => {
  const f = fixture(); const edit = f.refs.begin({ root: f.root, path: ['clip-b'] }); const places = f.refs.locations(edit.draftId);
  changeNote(f.library, edit.draftId, 440); assert.equal(f.refs.locations(edit.draftId).token, places.token);
  const root = f.library.readDraft(f.root.id)!; f.library.updateDraft(root.id, { name: '修改后的作品名称' }); const before = f.raw();
  assert.equal(f.refs.apply(edit.draftId, { locationIds: places.locations.filter(item => item.current).map(item => item.id), expectedToken: places.token }).status, 'conflict');
  assert.equal(f.raw(), before); assert.ok(f.library.readDraft(edit.draftId));
});

test('a changed shared source or lost selected path rejects the complete operation without discarding edits', () => {
  const f = fixture(); const edit = f.refs.begin({ root: f.root, path: ['clip-b', 'part-a'] }); changeSound(f.library, edit.draftId, 0.2);
  const source = f.library.readContent(f.timbre.content.id)!;
  assert.equal(f.library.commitTransaction({ expectedToken: f.library.currentToken(), label: '模拟其他位置修改', replaceContents: [{ expected: source, replacement: { ...source, revision: 2, name: '别处改变' } }] }).status, 'committed');
  const before = f.raw(); assert.equal(f.refs.apply(edit.draftId).status, 'conflict'); assert.equal(f.raw(), before); assert.ok(f.library.readDraft(edit.draftId));
});

test('failed disk persistence cannot publish partial forks or reference changes', () => {
  const f = fixture(); const edit = f.refs.begin({ root: f.root, path: ['clip-b', 'part-a'] }); changeSound(f.library, edit.draftId, 0.1);
  const before = f.raw(); const contents = f.library.listContent(); const root = f.library.readDraft(f.root.id); f.break();
  assert.equal(f.refs.apply(edit.draftId).status, 'storage-error'); assert.equal(f.raw(), before); assert.deepEqual(f.library.listContent(), contents); assert.deepEqual(f.library.readDraft(f.root.id), root);
});

test('plain copies keep shared references while subsequent occurrence edits are isolated', () => {
  const f = fixture(); const copy = saved(f.library.duplicateContent(f.phrase.content.id)); assert.deepEqual(copy.dependencies, [f.timbre.content.id]);
  assert.deepEqual(readPhraseBody(copy.body).parts.map(part => part.timbreId), [f.timbre.content.id, f.timbre.content.id]);
  const edit = f.refs.beginLibrary(f.timbre.content.id); changeSound(f.library, edit.draftId, 0.4); const result = applied(f.refs.apply(edit.draftId));
  assert.notEqual(result.content.id, f.timbre.content.id); assert.deepEqual(f.library.readContent(copy.id)!.dependencies, [f.timbre.content.id]);
});

test('adapter replacements reject unknown slots and retain exact dependencies for partial repeated references', () => {
  const f = fixture(); const phrase = createPhraseReferenceAdapter(); const song = createSongReferenceAdapter();
  assert.throws(() => phrase.replace(f.phrase.content, [{ slotId: 'missing', targetId: 'new' }]), /位置/);
  assert.throws(() => song.replace(f.song.content, [{ slotId: 'clip-a', targetId: 'new' }, { slotId: 'clip-a', targetId: 'other' }]), /位置/);
  const rewritten = phrase.replace(f.phrase.content, [{ slotId: 'part-a', targetId: 'new' }]); assert.deepEqual(rewritten.dependencies, ['new', f.timbre.content.id]);
  assert.throws(() => createTimbreReferenceAdapter().replace(f.timbre.content, [{ slotId: 'nothing', targetId: 'new' }]), /没有/);
});

test('actual song editor can redo a composite operation whose fork does not exist until restoration', () => {
  const f = fixture(); const edit = f.refs.begin({ root: f.root, path: ['clip-b'] }); changeNote(f.library, edit.draftId, 440);
  const result = applied(f.refs.apply(edit.draftId));
  const reopened = createMaterialLibrary(f.storage); const timbres = createTimbrePlayback(reopened); const phrases = createPhrasePlayback(reopened, timbres);
  const song = createSongEditor(reopened, phrases, { defaultTempoMode: 'source' }); song.openDraft(f.root.id);
  song.undo(); assert.equal(reopened.readContent(result.content.id), undefined);
  assert.doesNotThrow(() => song.redo()); assert.equal(song.read().body!.tracks[0]!.clips[1]!.phraseId, result.content.id);
  assert.equal(song.previewPlan().events[2]!.sound.note.frequencyHz, 440);
});

test('actual phrase editor can redo a new sound and undo restores its earlier context metadata', () => {
  const f = fixture(); const outer = f.refs.begin({ root: f.root, path: ['clip-b'] });
  const edit = f.refs.begin({ root: { type: 'draft', id: outer.draftId }, path: ['part-a'] }); changeSound(f.library, edit.draftId, 0.24);
  const result = applied(f.refs.apply(edit.draftId)); const reopened = createMaterialLibrary(f.storage);
  const phrase = createPhraseEditor(reopened, createTimbrePlayback(reopened)); phrase.openDraft(outer.draftId);
  phrase.undo(); assert.equal(reopened.readContent(result.content.id), undefined);
  assert.doesNotThrow(() => phrase.redo()); assert.equal(phrase.read().body!.parts[0]!.timbreId, result.content.id);
  const manager = createReferenceEditing(reopened, adapters()); assert.equal(manager.cancel(outer.draftId).status, 'done');
  assert.equal(reopened.readContent(result.content.id), undefined);
});

test('an unchanged occurrence save closes its temporary draft without creating a fork or undo step', () => {
  const f = fixture(); const contents = f.library.listContent(); const root = f.library.readDraft(f.root.id)!;
  const history = f.library.readDraftHistory(root.id); const edit = f.refs.begin({ root: f.root, path: ['clip-b'] });
  assert.match(edit.labels!.join(' / '), /第 5 拍/);
  const result = applied(f.refs.apply(edit.draftId)); assert.equal(result.content.id, f.phrase.content.id);
  assert.deepEqual(f.library.listContent(), contents); assert.deepEqual(f.library.readDraft(root.id), root);
  assert.deepEqual(f.library.readDraftHistory(root.id), history); assert.equal(f.library.readDraft(edit.draftId), undefined);
});

test('a singly used phrase stays in place while joint edits isolate its shared sound', () => {
  const f = fixture();
  const solo = f.save({ kind: f.phrase.content.kind, owner: f.phrase.content.owner, schemaVersion: 1, name: '尚未编排', dependencies: [f.timbre.content.id], body: f.phrase.content.body });
  const body = readSongBody(f.song.content.body); body.tracks[0]!.clips = [{ id: 'fresh-clip', phraseId: solo.content.id, startBeat: 0 }];
  const root = f.library.createDraft({ kind: 'rootsound.song', owner: 'song', schemaVersion: 1, name: '只有草稿', dependencies: [solo.content.id], body });
  const edit = f.refs.begin({ root: f.root, path: ['clip-b', 'part-a'] });
  const places = f.refs.locations(edit.draftId);
  assert.ok(!places.locations.some(item => item.root.type === 'content' && item.root.id === solo.content.id));
  const chosen = places.locations.find(item => item.root.id === root.id && item.path.at(-1) === 'part-a')!;
  changeSound(f.library, edit.draftId, 0.23); applied(f.refs.apply(edit.draftId, { locationIds: [chosen.id], expectedToken: places.token }));
  assert.equal(clipIds(f.library.readDraft(root.id)!)[0], solo.content.id);
  const changed = f.library.readContent(solo.content.id)!; assert.equal(changed.revision, 2);
  assert.notEqual(readPhraseBody(changed.body).parts[0]!.timbreId, f.timbre.content.id);
  assert.equal(readPhraseBody(changed.body).parts[1]!.timbreId, f.timbre.content.id);
});

test('song save after an isolated edit does not prevent durable undo and redo of the editing view', () => {
  const f = fixture(); const edit = f.refs.begin({ root: f.root, path: ['clip-b', 'part-a'] }); changeSound(f.library, edit.draftId, 0.18);
  const result = applied(f.refs.apply(edit.draftId));
  const sounds = createTimbrePlayback(f.library); const phrases = createPhrasePlayback(f.library, sounds);
  const song = createSongEditor(f.library, phrases, { defaultTempoMode: 'source' }); song.openDraft(f.root.id);
  const storedSong = saved(song.save('overwrite'));
  const reopened = createMaterialLibrary(f.storage); const again = createSongEditor(reopened, createPhrasePlayback(reopened, createTimbrePlayback(reopened)), { defaultTempoMode: 'source' });
  again.openDraft(f.root.id); again.undo();
  assert.deepEqual(clipIds(again.read().draft!), clipIds(f.song.content));
  assert.deepEqual(reopened.readContent(storedSong.id), storedSong); assert.ok(reopened.readContent(result.content.id));
  assert.doesNotThrow(() => again.redo()); assert.deepEqual(clipIds(again.read().draft!), clipIds(storedSong));
  assert.equal(again.previewPlan().events[2]!.sound.level, 0.18 * 0.8);
});

test('nested joint sound edits stage every other use and publish atomically with the containing phrase after reopening', () => {
  const f = fixture(); const originalSong = f.library.readDraft(f.root.id)!; const originalOther = f.library.readContent(f.second.content.id)!;
  const outer = f.refs.begin({ root: f.root, path: ['clip-b'] }); changeNote(f.library, outer.draftId, 550);
  const inner = f.refs.begin({ root: { type: 'draft', id: outer.draftId }, path: ['part-a'] });
  const places = f.refs.locations(inner.draftId);
  assert.ok(!places.locations.some(item => item.root.id === f.root.id && item.path[0] === 'clip-b'));
  assert.ok(!places.locations.some(item => item.root.id === f.song.content.id));
  const chosen = places.locations.filter(item => item.current || item.path.at(-1) === 'part-a'
    && (item.root.id === f.root.id && item.path[0] === 'clip-a' || item.root.id === f.second.content.id));
  assert.equal(chosen.length, 3); changeSound(f.library, inner.draftId, 0.19);
  const innerResult = applied(f.refs.apply(inner.draftId, { locationIds: chosen.map(item => item.id), expectedToken: places.token }));
  assert.equal(innerResult.staged, true); assert.equal(f.refs.resume(outer.draftId)!.pendingApplyCount, 2);
  assert.deepEqual(f.library.readDraft(f.root.id), originalSong); assert.deepEqual(f.library.readContent(f.second.content.id), originalOther);
  const reopened = createMaterialLibrary(f.storage); const manager = createReferenceEditing(reopened, adapters());
  assert.equal(manager.resume(outer.draftId)!.pendingApplyCount, 2); const beforeWrites = f.writes();
  const result = applied(manager.apply(outer.draftId)); assert.equal(f.writes(), beforeWrites + 1);
  const ids = clipIds(reopened.readDraft(f.root.id)!); assert.equal(ids[2], f.phrase.content.id); assert.equal(ids[1], result.content.id);
  assert.equal(ids[0], clipIds(reopened.readContent(f.second.content.id)!)[0]);
  const main = readPhraseBody(reopened.readContent(ids[1]!)!.body); const other = readPhraseBody(reopened.readContent(ids[0]!)!.body);
  assert.equal(main.parts[0]!.notes[0]!.frequencyHz, 550); assert.equal(other.parts[0]!.notes[0]!.frequencyHz, 220);
  assert.equal(main.parts[0]!.timbreId, innerResult.content.id); assert.equal(other.parts[0]!.timbreId, innerResult.content.id);
  assert.equal(main.parts[1]!.timbreId, f.timbre.content.id); assert.equal(other.parts[1]!.timbreId, f.timbre.content.id);
  reopened.travelDraft(f.root.id, 'undo', reopened.readDraft(f.root.id)!);
  assert.deepEqual(reopened.readDraft(f.root.id), originalSong); assert.deepEqual(reopened.readContent(f.second.content.id), originalOther);
  assert.equal(manager.resume(outer.draftId)!.pendingApplyCount, 2);
});

test('cancelling a nested joint edit leaves all outside songs untouched and removes its unpublished sound', () => {
  const f = fixture(); const before = f.library.listContent(); const root = f.library.readDraft(f.root.id)!;
  const outer = f.refs.begin({ root: f.root, path: ['clip-b'] }); changeNote(f.library, outer.draftId, 880);
  const inner = f.refs.begin({ root: { type: 'draft', id: outer.draftId }, path: ['part-a'] });
  const places = f.refs.locations(inner.draftId); const chosen = places.locations.filter(item => item.current || item.root.id === f.second.content.id);
  changeSound(f.library, inner.draftId, 0.13); const sound = applied(f.refs.apply(inner.draftId, { locationIds: chosen.map(item => item.id), expectedToken: places.token })).content;
  assert.equal(f.refs.cancel(outer.draftId).status, 'done'); assert.equal(f.library.readContent(sound.id), undefined);
  assert.deepEqual(f.library.listContent(), before); assert.deepEqual(f.library.readDraft(f.root.id), root);
  assert.doesNotThrow(() => createMaterialLibrary(f.storage));
});

test('later changes to any staged outside root reject the full final save and preserve all pending edits', () => {
  const f = fixture(); const outer = f.refs.begin({ root: f.root, path: ['clip-b'] }); changeNote(f.library, outer.draftId, 660);
  const inner = f.refs.begin({ root: { type: 'draft', id: outer.draftId }, path: ['part-a'] }); const places = f.refs.locations(inner.draftId);
  const chosen = places.locations.filter(item => item.current || item.root.id === f.second.content.id);
  changeSound(f.library, inner.draftId, 0.17); applied(f.refs.apply(inner.draftId, { locationIds: chosen.map(item => item.id), expectedToken: places.token }));
  const other = f.library.readContent(f.second.content.id)!;
  f.library.commitTransaction({ expectedToken: f.library.currentToken(), label: '其它位置继续编辑', replaceContents: [{ expected: other, replacement: { ...other, revision: 2, name: '其它修改' } }] });
  const before = f.raw(); assert.equal(f.refs.apply(outer.draftId).status, 'conflict'); assert.equal(f.raw(), before);
  assert.equal(f.refs.resume(outer.draftId)!.pendingApplyCount, 2);
  assert.equal(readPhraseBody(f.library.readDraft(outer.draftId)!.body).parts[0]!.notes[0]!.frequencyHz, 660);
});

test('saving a containing phrase waits for unfinished child edits instead of leaving a dangling child', () => {
  const f = fixture(); const outer = f.refs.begin({ root: f.root, path: ['clip-b'] }); changeNote(f.library, outer.draftId, 440);
  const inner = f.refs.begin({ root: { type: 'draft', id: outer.draftId }, path: ['part-a'] }); changeSound(f.library, inner.draftId, 0.1);
  const before = f.raw(); const result = f.refs.apply(outer.draftId); assert.equal(result.status, 'conflict');
  if (result.status === 'conflict') assert.match(result.reason, /先完成或取消/);
  assert.equal(f.raw(), before); assert.ok(f.library.readDraft(inner.draftId)); assert.ok(f.library.readDraft(outer.draftId));
});

test('a later joint phrase selection supersedes nested changes at that same path without losing the new sound', () => {
  const f = fixture(); const outer = f.refs.begin({ root: f.root, path: ['clip-b'] }); changeNote(f.library, outer.draftId, 770);
  const inner = f.refs.begin({ root: { type: 'draft', id: outer.draftId }, path: ['part-a'] }); const places = f.refs.locations(inner.draftId);
  const chosen = places.locations.filter(item => item.current || item.root.id === f.root.id && item.path[0] === 'clip-a' && item.path.at(-1) === 'part-a');
  changeSound(f.library, inner.draftId, 0.22); const sound = applied(f.refs.apply(inner.draftId, { locationIds: chosen.map(item => item.id), expectedToken: places.token })).content;
  const outerPlaces = f.refs.locations(outer.draftId); const outerChosen = outerPlaces.locations.filter(item => item.current || item.root.id === f.root.id && item.path[0] === 'clip-a');
  const result = applied(f.refs.apply(outer.draftId, { locationIds: outerChosen.map(item => item.id), expectedToken: outerPlaces.token }));
  assert.deepEqual(clipIds(f.library.readDraft(f.root.id)!), [result.content.id, result.content.id, f.phrase.content.id]);
  const body = readPhraseBody(result.content.body); assert.equal(body.parts[0]!.notes[0]!.frequencyHz, 770); assert.equal(body.parts[0]!.timbreId, sound.id);
});

test('staged changes still apply when the containing phrase itself was not changed', () => {
  const f = fixture(); const outer = f.refs.begin({ root: f.root, path: ['clip-b'] });
  const inner = f.refs.begin({ root: { type: 'draft', id: outer.draftId }, path: ['part-a'] }); const places = f.refs.locations(inner.draftId);
  const chosen = places.locations.filter(item => item.root.id === f.root.id && item.path[0] === 'clip-a' && item.path.at(-1) === 'part-a');
  changeSound(f.library, inner.draftId, 0.21); const sound = applied(f.refs.apply(inner.draftId, { locationIds: chosen.map(item => item.id), expectedToken: places.token })).content;
  assert.deepEqual(f.library.readDraft(outer.draftId)!.body, f.phrase.content.body);
  const result = applied(f.refs.apply(outer.draftId)); assert.equal(result.content.id, f.phrase.content.id);
  const ids = clipIds(f.library.readDraft(f.root.id)!); assert.notEqual(ids[0], f.phrase.content.id); assert.equal(ids[1], f.phrase.content.id);
  assert.equal(readPhraseBody(f.library.readContent(ids[0]!)!.body).parts[0]!.timbreId, sound.id);
});

test('cancelling an adopted outer editor also removes unfinished nested drafts while preserving its earlier music', () => {
  const f = fixture(); changeNote(f.library, f.phrase.draft.id, 990);
  const outer = f.refs.beginLibrary(f.phrase.content.id, f.phrase.draft.id);
  const inner = f.refs.begin({ root: { type: 'draft', id: outer.draftId }, path: ['part-a'] }); changeSound(f.library, inner.draftId, 0.2);
  assert.equal(f.refs.cancel(outer.draftId).status, 'done'); assert.equal(f.library.readDraft(inner.draftId), undefined);
  assert.equal(f.library.readDraft(outer.draftId)!.editingContext, undefined);
  assert.equal(readPhraseBody(f.library.readDraft(outer.draftId)!.body).parts[0]!.notes[0]!.frequencyHz, 990);
});
