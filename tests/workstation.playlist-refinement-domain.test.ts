import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { ContentRecord, MaterialStorage, SaveResult } from '../src/workstation/contracts/content.ts';
import { createMaterialLibrary } from '../src/workstation/modules/materials/public.ts';
import { createTimbreEditor, createTimbrePlayback } from '../src/workstation/modules/timbre/public.ts';
import { createPhraseEditor, createPhrasePlayback } from '../src/workstation/modules/phrase/public.ts';
import { createSongEditor, readSongBody, songGridSegments, songGridTempoAt } from '../src/workstation/modules/song/public.ts';

function saved(result: SaveResult): ContentRecord {
  assert.equal(result.status, 'saved'); if (result.status !== 'saved') throw new Error('Expected saved content.'); return result.content;
}
function fixture() {
  let raw: string | null = null; let writes = 0; let failing = false;
  const storage: MaterialStorage = { read: () => raw, write(value) { if (failing) throw new Error('磁盘测试失败'); raw = value; writes++; } };
  const library = createMaterialLibrary(storage);
  const timbre = createTimbreEditor(library); const tone = saved(timbre.save('new'));
  const sounds = createTimbrePlayback(library); const phrase = createPhraseEditor(library, sounds);
  phrase.create(tone.id); phrase.setTempo(93); phrase.setLength(4);
  phrase.addNote(phrase.read().body!.parts[0]!.id, { startBeat: 0.25, durationBeats: 1.375, frequencyHz: 234.75, velocity: 0.7 });
  const material = saved(phrase.save('new')); const phrases = createPhrasePlayback(library, sounds);
  const song = createSongEditor(library, phrases, { defaultTempoMode: 'source', initialTrackCount: 7 }); song.create();
  const rows = song.read().body!.tracks.map(track => track.id);
  const first = song.addClip(rows[0]!, material.id, 1.25); const second = song.addClip(rows[0]!, material.id, 8.75);
  return { song, storage, library, rows, first, second, material, raw: () => raw, writes: () => writes, fail: () => { failing = true; } };
}
function emptyPhrase(f: ReturnType<typeof fixture>): ContentRecord {
  const phrase = createPhraseEditor(f.library, createTimbrePlayback(f.library));
  phrase.create(f.library.readContent(f.material.id)!.dependencies[0]!); phrase.rename('空乐句'); phrase.setTempo(80); phrase.setLength(16);
  return saved(f.library.saveDraft(phrase.read().draft!.id, 'new'));
}

test('visual BPM edits replace every right-hand section while retaining earlier grid and all note timing', () => {
  const f = fixture(); const plan = f.song.previewPlan(); const tracks = f.song.read().body!.tracks;
  f.song.setGridTempo(110); f.song.setGridTempo(85, 4); f.song.setGridTempo(190, 12);
  const earlier = songGridSegments(f.song.read().body!); const beforeReset = f.song.read().body!; const writes = f.writes();
  f.song.setGridTempo(150, 8);
  const body = f.song.read().body!;
  assert.equal(f.writes() - writes, 1, 'one edit replaces the complete right-hand grid atomically');
  assert.deepEqual(body.gridTempoChanges, [{ atSeconds: 4, tempoBpm: 85 }, { atSeconds: 8, tempoBpm: 150 }]);
  assert.deepEqual(songGridSegments(body).slice(0, 1), earlier.slice(0, 1));
  assert.deepEqual([0, 3.99, 4, 7.99, 8, 11.99, 12, 999].map(seconds => songGridTempoAt(body, seconds)), [110, 110, 85, 85, 150, 150, 150, 150]);
  assert.deepEqual(songGridSegments(body), [
    { atSeconds: 0, endSeconds: 4, tempoBpm: 110, offsetSeconds: 0 },
    { atSeconds: 4, endSeconds: 8, tempoBpm: 85, offsetSeconds: 4 },
    { atSeconds: 8, endSeconds: Infinity, tempoBpm: 150, offsetSeconds: 8 },
  ]);
  assert.deepEqual(f.song.previewPlan(), plan); assert.deepEqual(body.tracks, tracks); assert.equal(body.tempoBpm, 120);
  f.song.undo(); assert.deepEqual(f.song.read().body, beforeReset); f.song.redo(); assert.deepEqual(f.song.read().body, body);
  f.song.setGridTempo(160, 8); assert.equal(f.song.read().body!.gridTempoChanges!.length, 2);
  assert.equal(songGridTempoAt(f.song.read().body!, 8), 160);
  f.song.undo(); assert.equal(songGridTempoAt(f.song.read().body!, 8), 150);
  f.song.redo(); assert.equal(songGridTempoAt(f.song.read().body!, 8), 160);
  f.song.setGridTempo(100); assert.equal(songGridTempoAt(f.song.read().body!, 0), 100);
  assert.equal(f.song.read().body!.gridTempoChanges, undefined, 'changing at zero clears every later explicit boundary');
  assert.equal(songGridTempoAt(f.song.read().body!, 4), 100);
  assert.equal(songGridTempoAt(f.song.read().body!, 999), 100);
  assert.deepEqual(f.song.previewPlan(), plan);
});

test('resetting to the currently active BPM still removes future edits and survives saved reopen', () => {
  const f = fixture(); const plan = f.song.previewPlan();
  f.song.setGridTempo(120); f.song.setGridTempo(180, 12); f.song.setGridTempo(150, 20);
  const before = f.song.read().body!;
  f.song.setGridTempo(120, 4);
  assert.deepEqual(f.song.read().body!.gridTempoChanges, [{ atSeconds: 4, tempoBpm: 120 }]);
  assert.equal(songGridTempoAt(f.song.read().body!, 20), 120);
  f.song.undo(); assert.deepEqual(f.song.read().body, before); f.song.redo();
  const expected = f.song.read().body!; const content = saved(f.song.save('new'));
  const library = createMaterialLibrary(f.storage); const reopened = createSongEditor(library,
    createPhrasePlayback(library, createTimbrePlayback(library)), { defaultTempoMode: 'source' });
  reopened.open(content.id); assert.deepEqual(reopened.read().body, expected); assert.deepEqual(reopened.previewPlan(), plan);
  reopened.setGridTempo(120);
  assert.equal(reopened.read().body!.gridTempoChanges, undefined);
  assert.deepEqual(reopened.previewPlan(), plan);
});

test('BPM boundaries, legacy phase and row colour survive a saved project reopen exactly', () => {
  const f = fixture(); f.song.setGridOffset(-1.23456789); f.song.setGridTempo(71.25); f.song.setGridTempo(211.25, 5.123456789);
  f.song.updateTrack(f.rows[0]!, { name: '低音', color: '#E07a35' });
  f.song.updateClip(f.rows[0]!, f.first, { level: 0.456, pan: -0.123 });
  const expected = f.song.read().body!; const plan = f.song.previewPlan(); const content = saved(f.song.save('new'));
  const library = createMaterialLibrary(f.storage); const phrases = createPhrasePlayback(library, createTimbrePlayback(library));
  const reopened = createSongEditor(library, phrases, { defaultTempoMode: 'source' }); reopened.open(content.id);
  assert.deepEqual(reopened.read().body, expected); assert.deepEqual(reopened.previewPlan(), plan);
  assert.deepEqual(songGridSegments(expected)[0], { atSeconds: 0, endSeconds: 5.123456789, tempoBpm: 71.25, offsetSeconds: -1.23456789 });
  assert.equal(songGridSegments(expected)[1]!.offsetSeconds, 5.123456789, 'new segment starts at its own boundary');
});

test('row reordering moves the complete row, displaces intervening rows, and undoes in one step', () => {
  const f = fixture(); f.song.updateTrack(f.rows[0]!, { name: '主奏', color: '#4F82C4' });
  const original = f.song.read().body!.tracks; const writes = f.writes();
  f.song.reorderTrack(f.rows[0]!, 4);
  const reordered = f.song.read().body!.tracks;
  assert.equal(f.writes() - writes, 1);
  assert.deepEqual(reordered.map(row => row.id), [f.rows[1], f.rows[2], f.rows[3], f.rows[4], f.rows[0], f.rows[5], f.rows[6]]);
  assert.deepEqual(reordered[4], original[0]); assert.deepEqual(f.song.read().draft!.dependencies, [f.material.id]);
  f.song.undo(); assert.deepEqual(f.song.read().body!.tracks, original);
  f.song.redo(); assert.deepEqual(f.song.read().body!.tracks, reordered);
  const unchanged = f.raw(); f.song.reorderTrack(f.rows[0]!, 4); assert.equal(f.raw(), unchanged, 'same-position drops do not add history');
  f.song.reorderTrack(f.rows[0]!, 0); assert.deepEqual(f.song.read().body!.tracks, original);
});

test('row mix edits are one durable undoable operation and preserve sibling placements', () => {
  const f = fixture(); const untouched = f.song.addClip(f.rows[1]!, f.material.id, 4.25);
  const before = f.song.read().body!; const writes = f.writes();
  f.song.updateClips([{ trackId: f.rows[0]!, clipId: f.first, level: 0.55, pan: -0.4 }, { trackId: f.rows[0]!, clipId: f.second, level: 0.25, pan: 0.7 }]);
  const after = f.song.read().body!; assert.equal(f.writes() - writes, 1);
  assert.deepEqual(after.tracks[1], before.tracks[1]); assert.equal(after.tracks[1]!.clips[0]!.id, untouched);
  assert.deepEqual(after.tracks[0]!.clips.map(clip => [clip.startBeat, clip.level, clip.pan]), [[1.25, 0.55, -0.4], [8.75, 0.25, 0.7]]);
  f.song.undo(); assert.deepEqual(f.song.read().body, before); f.song.redo(); assert.deepEqual(f.song.read().body, after);
});

test('all rows including the last can be removed, reopened, undone and replaced with a fresh named row', () => {
  const f = fixture(); assert.deepEqual(f.song.read().body!.tracks.map(row => row.name), ['行1', '行2', '行3', '行4', '行5', '行6', '行7']);
  for (const id of f.rows) f.song.removeTrack(id);
  assert.deepEqual(f.song.read().body!.tracks, []); assert.deepEqual(f.song.read().draft!.dependencies, []);
  assert.equal(f.song.previewPlan(undefined, { allowSilence: true }).events.length, 0);
  const library = createMaterialLibrary(f.storage); const reopened = createSongEditor(library, createPhrasePlayback(library, createTimbrePlayback(library)), { defaultTempoMode: 'source' });
  assert.deepEqual(reopened.read().body!.tracks, []);
  f.song.undo(); assert.equal(f.song.read().body!.tracks[0]!.id, f.rows[6]); f.song.redo();
  const added = f.song.addTrack(); assert.equal(f.song.read().body!.tracks[0]!.id, added); assert.equal(f.song.read().body!.tracks[0]!.name, '行1');
});

test('malformed row metadata, sections and batch operations leave storage and history untouched', () => {
  const f = fixture(); const before = f.song.read(); const raw = f.raw();
  for (const value of ['red', '#abc', '#GG1122', '', undefined]) assert.throws(() => f.song.updateTrack(f.rows[0]!, { color: value }));
  for (const index of [-1, 7, 1.2, NaN, Infinity]) assert.throws(() => f.song.reorderTrack(f.rows[0]!, index));
  assert.throws(() => f.song.reorderTrack('missing', 0));
  for (const at of [-1, NaN, Infinity, 1e6 + 1]) assert.throws(() => f.song.setGridTempo(100, at));
  const valid = { trackId: f.rows[0]!, clipId: f.first, pan: 0.5 };
  for (const invalid of [
    { trackId: f.rows[0]!, clipId: 'missing', level: 0.5 },
    { trackId: f.rows[0]!, clipId: f.second, level: 2 },
    { trackId: f.rows[0]!, clipId: f.second, pan: undefined },
    { trackId: f.rows[0]!, clipId: f.second, unknown: 0.4 }, valid,
  ]) assert.throws(() => f.song.updateClips([valid, invalid] as never));
  for (const changes of [
    [{ atSeconds: 0, tempoBpm: 100 }], [{ atSeconds: 2, tempoBpm: 100 }, { atSeconds: 1, tempoBpm: 100 }],
    [{ atSeconds: 1, tempoBpm: 100 }, { atSeconds: 1, tempoBpm: 100 }], [{ atSeconds: 1, tempoBpm: 250 }],
    [{ atSeconds: 1, tempoBpm: 100, unknown: true }], 'invalid',
  ]) assert.throws(() => readSongBody({ ...before.body!, gridTempoChanges: changes }));
  assert.equal(f.raw(), raw); assert.deepEqual(f.song.read(), before);
});

test('storage failures cannot leave partial row order, mix edits, or BPM markers', () => {
  const f = fixture(); const before = f.song.read(); const raw = f.raw(); f.fail();
  assert.throws(() => f.song.reorderTrack(f.rows[0]!, 4), /磁盘测试失败/);
  assert.throws(() => f.song.updateClips([{ trackId: f.rows[0]!, clipId: f.first, level: 0.2 }, { trackId: f.rows[0]!, clipId: f.second, pan: 0.5 }]), /磁盘测试失败/);
  assert.throws(() => f.song.setGridTempo(90, 4), /磁盘测试失败/);
  assert.equal(f.raw(), raw); assert.deepEqual(f.song.read(), before);
});

test('a placed empty phrase produces a correctly sized silent song plan, including after save and reopen', async () => {
  const f = fixture(); const empty = emptyPhrase(f);
  f.song.removeClips([{ trackId: f.rows[0]!, clipId: f.first }, { trackId: f.rows[0]!, clipId: f.second }]);
  const instance = f.song.addClip(f.rows[0]!, empty.id, 8);
  await f.song.preparePreview();
  const plan = f.song.previewPlan(undefined, { allowSilence: true });
  assert.deepEqual(plan.events, []); assert.equal(plan.durationSeconds, 16, '4s placement plus a 12s source phrase');
  assert.throws(() => f.song.previewPlan(), /先放入有音符的乐句/);
  assert.throws(() => createPhrasePlayback(f.library, createTimbrePlayback(f.library)).planForSaved(empty.id), /先添加几个音符/,
    'direct empty phrase audition keeps its independent guard');
  f.song.updateClip(f.rows[0]!, instance, { level: 0.4, pan: -0.2 });
  assert.deepEqual(f.song.previewPlan(undefined, { allowSilence: true }), plan);
  const content = saved(f.song.save('new'));
  const library = createMaterialLibrary(f.storage); const reopened = createSongEditor(library,
    createPhrasePlayback(library, createTimbrePlayback(library)), { defaultTempoMode: 'source' });
  reopened.open(content.id); assert.deepEqual(reopened.previewPlan(undefined, { allowSilence: true }), plan);
  reopened.setGridTempo(180, 5); reopened.reorderTrack(f.rows[0]!, 3);
  assert.deepEqual(reopened.previewPlan(undefined, { allowSilence: true }), plan);
});

test('an empty phrase never blocks audible siblings and retains its own extent during live mix mutations', () => {
  const f = fixture(); const empty = emptyPhrase(f); const original = f.song.previewPlan();
  f.song.addClip(f.rows[1]!, empty.id, 20);
  const mixed = f.song.previewPlan();
  assert.deepEqual(mixed.events, original.events); assert.equal(mixed.durationSeconds, 22);
  f.song.updateClips([{ trackId: f.rows[0]!, clipId: f.first, level: 0 }, { trackId: f.rows[0]!, clipId: f.second, level: 0 }]);
  assert.deepEqual(f.song.previewPlan(undefined, { allowSilence: true }).events, []);
  assert.equal(f.song.previewPlan(undefined, { allowSilence: true }).durationSeconds, 22);
  f.song.undo(); assert.deepEqual(f.song.previewPlan(), mixed);
  f.song.redo(); assert.deepEqual(f.song.previewPlan(undefined, { allowSilence: true }).events, []);
  f.song.undo();
  const content = saved(f.song.save('new')); const library = createMaterialLibrary(f.storage);
  const reopened = createSongEditor(library, createPhrasePlayback(library, createTimbrePlayback(library)), { defaultTempoMode: 'source' });
  reopened.open(content.id); assert.deepEqual(reopened.previewPlan(), mixed);
});
