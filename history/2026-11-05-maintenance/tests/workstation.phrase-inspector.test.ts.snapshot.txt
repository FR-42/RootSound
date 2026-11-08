import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { ContentRecord, MaterialLibrary, SaveResult } from '../src/workstation/contracts/content.ts';
import { createProjectPhrase, readProjectPhraseInfo, renameProjectPhrase } from '../src/workstation/app/project-phrases.ts';
import { createMaterialLibrary, createReferenceEditing } from '../src/workstation/modules/materials/public.ts';
import { createTimbrePlayback, createTimbreReferenceAdapter } from '../src/workstation/modules/timbre/public.ts';
import { createPhraseEditor, createPhrasePlayback, createPhraseReferenceAdapter, readPhraseBody } from '../src/workstation/modules/phrase/public.ts';
import { createSongEditor, createSongReferenceAdapter, readSongBody } from '../src/workstation/modules/song/public.ts';

const adapters = () => [createSongReferenceAdapter(), createPhraseReferenceAdapter(), createTimbreReferenceAdapter()];
function saved(result: SaveResult): ContentRecord {
  assert.equal(result.status, 'saved'); if (result.status !== 'saved') throw new Error('save'); return result.content;
}
function fixture(notes = true) {
  let text: string | null = null; let writes = 0; let broken = false;
  const storage = { read: () => text, write(value: string) { if (broken) throw new Error('测试磁盘失败'); text = value; writes++; } };
  const library = createMaterialLibrary(storage, { project: { rootKind: 'rootsound.song', adapters: adapters() } });
  const sounds = createTimbrePlayback(library); const phrases = createPhrasePlayback(library, sounds);
  const song = createSongEditor(library, phrases, { defaultTempoMode: 'source' }); song.create();
  const songId = song.read().draft!.id; const made = createProjectPhrase(library, songId);
  const phrase = createPhraseEditor(library, sounds); phrase.openDraft(made.draftId);
  if (notes) {
    phrase.setTempo(93); phrase.setLength(8);
    phrase.addNote(phrase.read().body!.parts[0]!.id, { startBeat: .25, durationBeats: 1.5, frequencyHz: 330, velocity: .6 });
    saved(phrase.save('overwrite'));
  }
  const track = song.read().body!.tracks[0]!.id;
  const refs = createReferenceEditing(library, adapters());
  return { library, storage, phrases, phrase, song, songId, made, track, refs,
    raw: () => text, writes: () => writes, fail() { broken = true; } };
}
const clipIds = (library: MaterialLibrary, songId: string): string[] => readSongBody(library.readDraft(songId)!.body).tracks.flatMap(track => track.clips.map(clip => clip.phraseId));

test('phrase inspector reads source tempo and musical duration without creating drafts, history or writes', () => {
  const f = fixture(); const before = f.raw(); const token = f.library.currentToken();
  const info = readProjectPhraseInfo(f.library, f.songId, f.made.id);
  assert.deepEqual(info, { id: f.made.id, name: '乐句 1', tempoBpm: 93, durationSeconds: 8 * 60 / 93 });
  assert.equal(f.raw(), before); assert.equal(f.library.currentToken(), token);
  const empty = fixture(false); assert.equal(readProjectPhraseInfo(empty.library, empty.songId, empty.made.id).durationSeconds, 8);
});

test('renaming a singly used occurrence preserves its identity, sound and placement, and undoes as one durable change', () => {
  const f = fixture(); const clip = f.song.addClip(f.track, f.made.id, 3.125);
  const plan = f.song.previewPlan(); const body = f.library.readContent(f.made.id)!.body; const writes = f.writes();
  const result = renameProjectPhrase(f.library, f.songId, f.made.id, '新的旋律', { trackId: f.track, clipId: clip });
  assert.equal(result.id, f.made.id); assert.equal(f.writes() - writes, 1);
  assert.equal(f.library.readContent(f.made.id)!.name, '新的旋律');
  assert.deepEqual(f.library.readContent(f.made.id)!.body, body); assert.deepEqual(f.song.previewPlan(), plan);
  assert.equal(f.library.readDraft(f.made.draftId)!.name, '新的旋律');
  f.song.undo(); assert.equal(f.library.readContent(f.made.id)!.name, '乐句 1');
  f.song.redo(); assert.equal(f.library.readContent(f.made.id)!.name, '新的旋律');
});

test('renaming one of repeated occurrences copies only the reference target for that occurrence', () => {
  const f = fixture(); const one = f.song.addClip(f.track, f.made.id, 0); f.song.addClip(f.track, f.made.id, 9.25);
  const original = f.library.readContent(f.made.id)!; const plan = f.song.previewPlan(); const writes = f.writes();
  const result = renameProjectPhrase(f.library, f.songId, f.made.id, '独立的这一处', { trackId: f.track, clipId: one });
  assert.notEqual(result.id, f.made.id); assert.equal(f.writes() - writes, 1);
  assert.deepEqual(clipIds(f.library, f.songId), [result.id, f.made.id]);
  assert.deepEqual(f.library.readContent(f.made.id), original); assert.deepEqual(f.library.readContent(result.id)!.body, original.body);
  assert.deepEqual(f.song.previewPlan(), plan);
  f.song.undo(); assert.deepEqual(clipIds(f.library, f.songId), [f.made.id, f.made.id]);
  f.song.redo(); assert.deepEqual(clipIds(f.library, f.songId), [result.id, f.made.id]);
  const reopened = createMaterialLibrary(f.storage, { project: { rootKind: 'rootsound.song', adapters: adapters() } });
  assert.equal(readProjectPhraseInfo(reopened, f.songId, result.id).name, '独立的这一处');
});

test('shelf rename explicitly changes shared metadata while keeping all occurrence identities and notes', () => {
  const f = fixture(); f.song.addClip(f.track, f.made.id, 0); f.song.addClip(f.track, f.made.id, 10);
  const ids = clipIds(f.library, f.songId); const plan = f.song.previewPlan(); const writes = f.writes();
  assert.equal(renameProjectPhrase(f.library, f.songId, f.made.id, '全部使用的新名称').id, f.made.id);
  assert.deepEqual(clipIds(f.library, f.songId), ids); assert.deepEqual(f.song.previewPlan(), plan);
  assert.equal(f.writes() - writes, 1); assert.equal(readProjectPhraseInfo(f.library, f.songId, f.made.id).name, '全部使用的新名称');
  f.song.undo(); assert.equal(readProjectPhraseInfo(f.library, f.songId, f.made.id).name, '乐句 1');
  f.song.redo(); assert.equal(readProjectPhraseInfo(f.library, f.songId, f.made.id).name, '全部使用的新名称');
});

test('empty phrases can be renamed; duplicate names and invalid locations do not change any data', () => {
  const f = fixture(false); const second = createProjectPhrase(f.library, f.songId);
  renameProjectPhrase(f.library, f.songId, f.made.id, '空的乐句');
  const raw = f.raw(); const token = f.library.currentToken();
  assert.throws(() => renameProjectPhrase(f.library, f.songId, second.id, '空的乐句'), /同类|不同名称|重名/);
  assert.throws(() => renameProjectPhrase(f.library, f.songId, second.id, '   '), /不能为空/);
  assert.throws(() => renameProjectPhrase(f.library, f.songId, second.id, '不存在的位置', { trackId: f.track, clipId: 'missing' }), /位置已改变/);
  assert.equal(f.raw(), raw); assert.equal(f.library.currentToken(), token);
});

test('other songs remain isolated and a public starter rename is adopted instead of overwritten', () => {
  const f = fixture(); const firstSong = f.songId; const original = f.library.readContent(f.made.id)!;
  f.song.create(); const otherId = f.song.read().draft!.id; const other = createProjectPhrase(f.library, otherId);
  const before = f.raw();
  assert.throws(() => renameProjectPhrase(f.library, otherId, f.made.id, '跨歌曲'), /不属于/);
  assert.equal(f.raw(), before);
  renameProjectPhrase(f.library, firstSong, f.made.id, '这里的新名字');
  assert.equal(readProjectPhraseInfo(f.library, otherId, other.id).name, '乐句 1');
  const publicContent = { ...original, id: crypto.randomUUID(), name: '公共乐句', revision: 1 };
  const committed = f.library.commitTransaction({ expectedToken: f.library.currentToken(), label: '测试公共起点', createContents: [publicContent] });
  assert.equal(committed.status, 'committed');
  const renamed = renameProjectPhrase(f.library, otherId, publicContent.id, '采用的乐句');
  assert.notEqual(renamed.id, publicContent.id); assert.equal(f.library.readContent(publicContent.id)!.name, '公共乐句');
  assert.notEqual(f.library.readContent(renamed.id)!.dependencies[0], original.dependencies[0]);
  assert.equal(f.library.projectScopeOf!({ type: 'content', id: renamed.id }), f.library.projectScopeOf!({ type: 'draft', id: otherId }));
});

test('pending phrase edits and failed storage are preserved without leaking rename drafts or partial forks', () => {
  const f = fixture(); const one = f.song.addClip(f.track, f.made.id, 0); f.song.addClip(f.track, f.made.id, 10);
  f.phrase.openDraft(f.made.draftId); const part = f.phrase.read().body!.parts[0]!.id;
  f.phrase.addNote(part, { startBeat: 3, durationBeats: .5, frequencyHz: 440, velocity: .7 });
  const pending = f.raw(); const history = f.library.readDraftHistory(f.made.draftId);
  assert.throws(() => renameProjectPhrase(f.library, f.songId, f.made.id, '不能丢掉音符'), /先完成或取消/);
  assert.equal(f.raw(), pending); assert.deepEqual(f.library.readDraftHistory(f.made.draftId), history);
  f.phrase.undo(); const before = f.raw(); const token = f.library.currentToken(); f.fail();
  assert.throws(() => renameProjectPhrase(f.library, f.songId, f.made.id, '测试失败的新名', { trackId: f.track, clipId: one }), /测试磁盘失败/);
  assert.equal(f.raw(), before); assert.equal(f.library.currentToken(), token);
});

test('explicit all-use phrase editing retains a private shelf entity; default or partial editing still forks', () => {
  const f = fixture(); const one = f.song.addClip(f.track, f.made.id, 0); f.song.addClip(f.track, f.made.id, 9);
  const edit = f.refs.begin({ root: { type: 'draft', id: f.songId }, path: [one] });
  const draft = f.library.readDraft(edit.draftId)!; const body = readPhraseBody(draft.body); body.parts[0]!.notes[0]!.frequencyHz = 550;
  f.library.updateDraft(edit.draftId, { body }, { remember: true, expected: draft });
  const places = f.refs.locations(edit.draftId); const selected = places.locations.filter(location => location.root.type === 'draft' && location.root.id === f.songId);
  const result = f.refs.apply(edit.draftId, { locationIds: selected.map(location => location.id), expectedToken: places.token, reuseIfAllSelected: true });
  assert.equal(result.status, 'applied'); if (result.status !== 'applied') throw new Error('apply');
  assert.equal(result.content.id, f.made.id); assert.deepEqual(clipIds(f.library, f.songId), [f.made.id, f.made.id]);
  assert.equal(readPhraseBody(result.content.body).parts[0]!.notes[0]!.frequencyHz, 550);
  assert.deepEqual(f.library.currentProjectView!(f.songId)!.memberIds, [f.made.id]);
  f.song.undo(); assert.equal(readPhraseBody(f.library.readContent(f.made.id)!.body).parts[0]!.notes[0]!.frequencyHz, 330);
  f.song.redo(); assert.equal(readPhraseBody(f.library.readContent(f.made.id)!.body).parts[0]!.notes[0]!.frequencyHz, 550);

  const partial = fixture(); const clip = partial.song.addClip(partial.track, partial.made.id, 0); partial.song.addClip(partial.track, partial.made.id, 9);
  const session = partial.refs.begin({ root: { type: 'draft', id: partial.songId }, path: [clip] });
  const source = partial.library.readDraft(session.draftId)!; partial.library.updateDraft(source.id, { name: '仅一处' }, { remember: true, expected: source });
  const outcome = partial.refs.apply(source.id, { reuseIfAllSelected: true });
  assert.equal(outcome.status, 'applied'); if (outcome.status !== 'applied') throw new Error('apply');
  assert.notEqual(outcome.content.id, partial.made.id);
});

test('all-use reuse collapses saved and draft representations, but never overwrites an unselected saved position', () => {
  const f = fixture(); const one = f.song.addClip(f.track, f.made.id, 0); const two = f.song.addClip(f.track, f.made.id, 9);
  saved(f.song.save('new'));
  const edit = f.refs.begin({ root: { type: 'draft', id: f.songId }, path: [one] });
  const draft = f.library.readDraft(edit.draftId)!; f.library.updateDraft(draft.id, { name: '全部使用共享名称' }, { remember: true, expected: draft });
  const locations = f.refs.locations(draft.id);
  const selected = locations.locations.filter(location => location.root.type === 'draft' && location.root.id === f.songId);
  assert.equal(selected.length, 2);
  const outcome = f.refs.apply(draft.id, { locationIds: selected.map(location => location.id), expectedToken: locations.token, reuseIfAllSelected: true });
  assert.equal(outcome.status, 'applied'); if (outcome.status !== 'applied') throw new Error('apply');
  assert.equal(outcome.content.id, f.made.id);

  f.song.removeClip(f.track, one);
  const original = f.library.readContent(f.made.id)!;
  const next = f.refs.begin({ root: { type: 'draft', id: f.songId }, path: [two] });
  const work = f.library.readDraft(next.draftId)!; f.library.updateDraft(work.id, { name: '仅当前剩余的位置' }, { remember: true, expected: work });
  const places = f.refs.locations(work.id); const remaining = places.locations.filter(location => location.root.type === 'draft' && location.root.id === f.songId);
  assert.equal(remaining.length, 1);
  const safe = f.refs.apply(work.id, { locationIds: remaining.map(location => location.id), expectedToken: places.token, reuseIfAllSelected: true });
  assert.equal(safe.status, 'applied'); if (safe.status !== 'applied') throw new Error('apply');
  assert.notEqual(safe.content.id, f.made.id); assert.deepEqual(f.library.readContent(f.made.id), original);
});

test('aggregate reuse remains atomic when storage rejects an overwrite and ordinary occurrence editing remains a fork', () => {
  const f = fixture(); const one = f.song.addClip(f.track, f.made.id, 0); f.song.addClip(f.track, f.made.id, 9);
  const edit = f.refs.begin({ root: { type: 'draft', id: f.songId }, path: [one] });
  const draft = f.library.readDraft(edit.draftId)!; f.library.updateDraft(draft.id, { name: '等待保存的名称' }, { remember: true, expected: draft });
  const places = f.refs.locations(draft.id); const all = places.locations.filter(location => location.root.id === f.songId);
  const before = f.raw(); const source = f.library.readContent(f.made.id); f.fail();
  const outcome = f.refs.apply(draft.id, { locationIds: all.map(location => location.id), expectedToken: places.token, reuseIfAllSelected: true });
  assert.equal(outcome.status, 'storage-error'); assert.equal(f.raw(), before); assert.deepEqual(f.library.readContent(f.made.id), source);
  assert.equal(f.library.readDraft(draft.id)!.name, '等待保存的名称');

  const ordinary = fixture(); const clip = ordinary.song.addClip(ordinary.track, ordinary.made.id, 0); ordinary.song.addClip(ordinary.track, ordinary.made.id, 9);
  const session = ordinary.refs.begin({ root: { type: 'draft', id: ordinary.songId }, path: [clip] });
  const leaf = ordinary.library.readDraft(session.draftId)!; ordinary.library.updateDraft(leaf.id, { name: '普通局部改名' }, { remember: true, expected: leaf });
  const result = ordinary.refs.apply(leaf.id);
  assert.equal(result.status, 'applied'); if (result.status !== 'applied') throw new Error('apply');
  assert.notEqual(result.content.id, ordinary.made.id);
});

test('aggregate identity reuse yields to another unfinished source draft without hiding its notes', () => {
  const f = fixture(); const one = f.song.addClip(f.track, f.made.id, 0); f.song.addClip(f.track, f.made.id, 9);
  const part = f.phrase.read().body!.parts[0]!.id;
  f.phrase.addNote(part, { startBeat: 3, durationBeats: .5, frequencyHz: 660, velocity: .7 });
  const pending = f.library.readDraft(f.made.draftId)!;
  const original = f.library.readContent(f.made.id)!;
  const edit = f.refs.begin({ root: { type: 'draft', id: f.songId }, path: [one] });
  const draft = f.library.readDraft(edit.draftId)!; f.library.updateDraft(draft.id, { name: '全部实例的新版本' }, { remember: true, expected: draft });
  const places = f.refs.locations(draft.id); const chosen = places.locations.filter(location => location.root.id === f.songId);
  const result = f.refs.apply(draft.id, { locationIds: chosen.map(location => location.id), expectedToken: places.token, reuseIfAllSelected: true });
  assert.equal(result.status, 'applied'); if (result.status !== 'applied') throw new Error('apply');
  assert.notEqual(result.content.id, f.made.id); assert.deepEqual(f.library.readDraft(f.made.draftId), pending);
  assert.deepEqual(f.library.readContent(f.made.id), original);
  assert.equal(f.library.readDraft(f.made.draftId)!.baseRevision, original.revision);
});

test('row pan offset reaches inherited and explicit clip pans without changing legacy mixes and survives save/undo', () => {
  const f = fixture(); f.song.addClip(f.track, f.made.id, 0); const explicit = f.song.addClip(f.track, f.made.id, 9);
  f.song.updateTrack(f.track, { pan: -.2 }); f.song.updateClip(f.track, explicit, { pan: .8 });
  const legacy = f.song.previewPlan(); assert.deepEqual(legacy.events.map(event => event.pan), [-.2, .8]);
  f.song.updateTrack(f.track, { panOffset: .35 }); assert.deepEqual(f.song.previewPlan().events.map(event => event.pan), [.14999999999999997, 1]);
  assert.equal(f.song.read().body!.tracks[0]!.pan, -.2); assert.equal(f.song.read().body!.tracks[0]!.clips[1]!.pan, .8);
  f.song.undo(); assert.deepEqual(f.song.previewPlan(), legacy); f.song.redo();
  const content = saved(f.song.save('new')); const reopened = createSongEditor(createMaterialLibrary(f.storage, { project: { rootKind: 'rootsound.song', adapters: adapters() } }), f.phrases, { defaultTempoMode: 'source' });
  reopened.open(content.id); assert.equal(reopened.read().body!.tracks[0]!.panOffset, .35);
  const before = f.raw();
  for (const invalid of [-1.1, 1.1, NaN, Infinity, undefined]) assert.throws(() => f.song.updateTrack(f.track, { panOffset: invalid }));
  assert.equal(f.raw(), before);
});
