import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { ContentRecord, MaterialStorage, SaveResult } from '../src/workstation/contracts/content.ts';
import type { SongBody } from '../src/workstation/contracts/song.ts';
import { createMaterialLibrary } from '../src/workstation/modules/materials/public.ts';
import { createTimbreEditor, createTimbrePlayback } from '../src/workstation/modules/timbre/public.ts';
import { createPhraseEditor, createPhrasePlayback } from '../src/workstation/modules/phrase/public.ts';
import { createSongEditor, createSongPlayback, readSongBody } from '../src/workstation/modules/song/public.ts';

function saved(result: SaveResult): ContentRecord { assert.equal(result.status, 'saved'); if (result.status !== 'saved') throw new Error('Expected save.'); return result.content; }
function fixture() {
  let raw: string | null = null; let failing = false; let writes = 0;
  const storage: MaterialStorage = { read: () => raw, write(value) { if (failing) throw new Error('测试磁盘写入失败'); raw = value; writes++; } };
  const library = createMaterialLibrary(storage); const timbre = createTimbreEditor(library); timbre.rename('清晨的风');
  const voice = saved(timbre.save('new')); const sounds = createTimbrePlayback(library); const phrase = createPhraseEditor(library, sounds);
  phrase.create(voice.id); phrase.rename('慢慢'); phrase.setTempo(60); phrase.setLength(4);
  phrase.addNote(phrase.read().body!.parts[0]!.id, { startBeat: 0, durationBeats: 2, frequencyHz: 220, velocity: 0.7 });
  const first = saved(phrase.save('new'));
  phrase.create(voice.id); phrase.rename('轻轻'); phrase.setTempo(120);
  phrase.addNote(phrase.read().body!.parts[0]!.id, { startBeat: 2, durationBeats: 1, frequencyHz: 330, velocity: 0.5 });
  const second = saved(phrase.save('new')); const phrases = createPhrasePlayback(library, sounds);
  const song = createSongEditor(library, phrases, { defaultTempoMode: 'source' });
  return { library, storage, timbre, voice, phrase, first, second, phrases, song, raw: () => raw, writes: () => writes, fail: (value = true) => { failing = value; } };
}
function start(f: ReturnType<typeof fixture>): string { f.song.create(); return f.song.read().body!.tracks[0]!.id; }
function baseBody(): SongBody { return { model: 'phrase-arrangement', version: 1, timeUnit: 'beat', tempoBpm: 120, tempoMode: 'source', lengthBeats: 16,
  tracks: [{ id: 'track-a', name: '旋律', level: 0.8, pan: 0, muted: false, solo: false, clips: [] }] }; }

test('song construction is lazy and the caller must explicitly choose the initial tempo policy', () => {
  const f = fixture(); const before = f.raw(); assert.equal(f.song.read().body, undefined); assert.equal(f.song.read().draft, undefined);
  assert.deepEqual(f.song.read().availablePhrases.map(item => item.id), [f.first.id, f.second.id]);
  assert.equal(f.raw(), before); assert.throws(() => f.song.previewPlan(), /新建一首歌曲/);
  assert.throws(() => createSongEditor(f.library, f.phrases, { defaultTempoMode: 'unknown' as 'source' }), /明确选择/);
  start(f); assert.equal(f.song.read().body!.tempoMode, 'source'); assert.equal(f.song.read().lengthBeats, 16);
});

test('starting a song from a phrase is one durable write and preserves the previous work', () => {
  const f = fixture(); const track = start(f); f.song.addClip(track, f.second.id, 3);
  const previous = f.song.read().draft!; const writes = f.writes();
  f.song.createFromPhrase(f.first.id);
  const view = f.song.read();
  assert.equal(f.writes() - writes, 1);
  assert.notEqual(view.draft!.id, previous.id);
  assert.deepEqual(f.library.readDraft(previous.id), previous);
  assert.equal(view.draft!.name, f.first.name);
  assert.deepEqual(view.draft!.dependencies, [f.first.id]);
  assert.equal(view.body!.tempoBpm, 60); assert.equal(view.body!.tempoMode, 'source');
  assert.deepEqual(view.body!.tracks[0]!.clips.map(clip => [clip.phraseId, clip.startBeat]), [[f.first.id, 0]]);
  assert.equal(f.song.previewPlan().events[0]!.sound.note.holdSeconds, 2);
  const reopened = createSongEditor(createMaterialLibrary(f.storage), f.phrases, { defaultTempoMode: 'source' });
  assert.equal(reopened.read().draft!.id, view.draft!.id);
});

test('invalid sources and storage failure cannot replace the current song or leave a partial new song', () => {
  const f = fixture(); start(f); const view = f.song.read(); const raw = f.raw();
  assert.throws(() => f.song.createFromPhrase('missing'));
  assert.throws(() => f.song.createFromPhrase(f.voice.id));
  assert.throws(() => f.song.createFromPhrase(f.first.id, '  '));
  assert.equal(f.raw(), raw); assert.deepEqual(f.song.read(), view);
  f.fail(); assert.throws(() => f.song.createFromPhrase(f.first.id), /测试磁盘/);
  assert.equal(f.raw(), raw); assert.deepEqual(f.song.read(), view);
});

test('default source mode keeps each phrase tempo, computes actual widths, and references originals once', () => {
  const f = fixture(); const track = start(f); f.song.addClip(track, f.first.id, 0); f.song.addClip(track, f.second.id, 8); f.song.addClip(track, f.first.id, 16);
  assert.equal(f.song.clipLengthBeats(f.first.id), 8); assert.equal(f.song.clipLengthBeats(f.second.id), 8);
  assert.equal(f.song.read().lengthBeats, 24); assert.deepEqual(f.song.read().draft!.dependencies, [f.first.id, f.second.id]);
  const before = f.raw(); const plan = f.song.previewPlan();
  assert.deepEqual(plan.events.map(event => event.atSeconds), [0, 5, 8]);
  assert.deepEqual(plan.events.map(event => event.sound.note.holdSeconds), [2, 0.5, 2]);
  assert.equal(plan.durationSeconds, 12); assert.equal(f.raw(), before);
  const song = saved(f.song.save('new')); assert.deepEqual(song.dependencies, [f.first.id, f.second.id]);
  assert.equal(JSON.stringify(song.body).includes('frequencyHz'), false); assert.equal(JSON.stringify(song.body).includes('sources'), false);
});

test('changing song tempo in source mode moves beat-based placement but never retimes the source notes', () => {
  const f = fixture(); const track = start(f); f.song.addClip(track, f.first.id, 0); f.song.addClip(track, f.second.id, 8);
  f.song.setTempo(240); assert.equal(f.song.clipLengthBeats(f.first.id), 16); assert.equal(f.song.clipLengthBeats(f.second.id), 16);
  const plan = f.song.previewPlan(); assert.deepEqual(plan.events.map(event => event.atSeconds), [0, 3]);
  assert.deepEqual(plan.events.map(event => event.sound.note.holdSeconds), [2, 0.5]); assert.equal(plan.durationSeconds, 6);
  f.song.setTempoMode('song'); assert.equal(f.song.clipLengthBeats(f.first.id), 4);
  assert.deepEqual(f.song.previewPlan().events.map(event => event.sound.note.holdSeconds), [0.5, 0.25]);
});

test('track level, pan, mute and solo apply to execution without rewriting saved phrases', () => {
  const f = fixture(); const a = start(f); const b = f.song.addTrack('回应'); const c = f.song.addTrack('静静');
  f.song.addClip(a, f.first.id, 0); f.song.addClip(b, f.second.id, 0); f.song.addClip(c, f.first.id, 4);
  f.song.updateTrack(a, { level: 0.25, pan: -0.7 }); f.song.updateTrack(b, { level: 0.5, pan: 0.6 }); f.song.updateTrack(c, { muted: true, solo: false });
  const originalLevel = f.phrases.planForSaved(f.first.id).events[0]!.sound.level; const before = f.raw();
  const mixed = f.song.previewPlan(); assert.equal(mixed.events.length, 2); assert.equal(mixed.events[0]!.sound.level, originalLevel * 0.25); assert.equal(mixed.events[0]!.pan, -0.7); assert.equal(mixed.events[1]!.pan, 0.6);
  assert.equal(f.raw(), before); f.song.updateTrack(b, { solo: true }); const solo = f.song.previewPlan(); assert.equal(solo.events.length, 1); assert.equal(solo.events[0]!.sound.note.frequencyHz, 330);
  f.song.updateTrack(b, { level: 0 }); assert.throws(() => f.song.previewPlan(), /开启至少一条轨道/);
  assert.equal(f.phrases.readSaved(f.first.id).content.revision, 1);
});

test('copy, adjacent repeat and cross-track movement preserve identity references and undo as durable edits', () => {
  const f = fixture(); const a = start(f); const b = f.song.addTrack('第二层'); const original = f.song.addClip(a, f.first.id, 0);
  const copies = f.song.repeatClip(a, original, 2); assert.equal(copies.length, 2); assert.deepEqual(f.song.read().body!.tracks[0]!.clips.map(clip => clip.startBeat), [0, 8, 16]);
  f.song.undo(); assert.equal(f.song.read().body!.tracks[0]!.clips.length, 1); f.song.redo(); assert.equal(f.song.read().body!.tracks[0]!.clips.length, 3);
  const copy = f.song.copyClip(a, original, b, 0.123456789); f.song.moveClip(b, copy, a, 0.987654321);
  assert.equal(f.song.read().body!.tracks[0]!.clips.find(clip => clip.id === copy)!.startBeat, 0.987654321);
  f.song.removeClip(a, original); assert.equal(f.song.read().body!.tracks[0]!.clips.length, 3);
  assert.deepEqual(f.song.read().draft!.dependencies, [f.first.id]);
  f.song.undo(); assert.equal(f.song.read().body!.tracks[0]!.clips.length, 4);
});

test('bulk add, move and remove each make one history step and cannot partially apply invalid lists', () => {
  const f = fixture(); const a = start(f); const b = f.song.addTrack(); const beforeWrites = f.writes();
  const ids = f.song.addClips([{ trackId: a, phraseId: f.first.id, startBeat: 0.1 }, { trackId: b, phraseId: f.second.id, startBeat: 3.2 }]);
  assert.equal(f.writes() - beforeWrites, 1); f.song.undo(); assert.equal(f.song.read().draft!.dependencies.length, 0); f.song.redo();
  f.song.moveClips([{ trackId: a, clipId: ids[0]!, targetTrackId: b, startBeat: 4 }, { trackId: b, clipId: ids[1]!, targetTrackId: a, startBeat: 0 }]);
  assert.deepEqual(f.song.read().body!.tracks.map(track => track.clips.map(clip => clip.id)), [[ids[1]], [ids[0]]]);
  f.song.undo(); assert.deepEqual(f.song.read().body!.tracks.map(track => track.clips.map(clip => clip.startBeat)), [[0.1], [3.2]]);
  const before = f.raw(); assert.throws(() => f.song.moveClips([{ trackId: a, clipId: ids[0]!, targetTrackId: b, startBeat: 5 }, { trackId: b, clipId: 'missing', targetTrackId: a, startBeat: 0 }])); assert.equal(f.raw(), before);
  assert.throws(() => f.song.removeClips([{ trackId: a, clipId: ids[0]! }, { trackId: a, clipId: ids[0]! }])); assert.equal(f.raw(), before);
  f.song.removeClips([{ trackId: a, clipId: ids[0]! }, { trackId: b, clipId: ids[1]! }]); assert.deepEqual(f.song.read().draft!.dependencies, []);
  f.song.undo(); assert.equal(f.song.read().body!.tracks[0]!.clips.length, 1);
});

test('invalid controls, missing references and timeline limits preserve the complete prior state', () => {
  const f = fixture(); const track = start(f); const clip = f.song.addClip(track, f.first.id, 0); const before = f.raw(); const view = f.song.read();
  for (const tempo of [0, 39, 241, NaN, Infinity]) assert.throws(() => f.song.setTempo(tempo));
  for (const startBeat of [-1, NaN, Infinity, 1020]) assert.throws(() => f.song.moveClip(track, clip, track, startBeat));
  for (const changes of [{ level: 1.1 }, { pan: -2 }, { muted: 1 }, { name: '' }, { future: true }]) assert.throws(() => f.song.updateTrack(track, changes as never));
  for (const length of [0, 15, 1025, NaN]) assert.throws(() => f.song.setLength(length));
  assert.throws(() => f.song.addClip(track, f.voice.id, 0)); assert.throws(() => f.song.addClip(track, 'missing', 0)); assert.throws(() => f.song.removeTrack('missing'));
  assert.throws(() => f.song.setTempoMode('guess' as 'source')); assert.throws(() => f.song.repeatClip(track, clip, 0)); assert.throws(() => f.song.repeatClip(track, clip, 1.5));
  assert.equal(f.raw(), before); assert.deepEqual(f.song.read(), view);
});

test('song shortening refuses to cut clips and external phrase changes extend the effective musical extent', () => {
  const f = fixture(); const track = start(f); f.song.addClip(track, f.first.id, 12); assert.equal(f.song.read().lengthBeats, 20); assert.throws(() => f.song.setLength(16), /先移动/);
  f.song.setLength(32); f.phrase.open(f.first.id); f.phrase.setLength(16); const check = f.phrase.save('overwrite'); assert.equal(check.status, 'needs-confirmation');
  if (check.status !== 'needs-confirmation') throw new Error('Expected reference warning.');
  assert.ok(check.affectedDrafts.some(draft => draft.id === f.song.read().draft!.id)); saved(f.phrase.save('overwrite', check.confirmation));
  assert.equal(f.song.clipLengthBeats(f.first.id), 32); assert.equal(f.song.read().lengthBeats, 44);
});

test('disk failures leave content, draft identity and undo/redo history unchanged', () => {
  const f = fixture(); const track = start(f); const clip = f.song.addClip(track, f.first.id, 0); const before = f.raw(); const view = f.song.read(); f.fail();
  assert.throws(() => f.song.moveClip(track, clip, track, 2), /测试磁盘/); assert.equal(f.raw(), before); assert.deepEqual(f.song.read(), view);
  assert.throws(() => f.song.undo(), /测试磁盘/); assert.deepEqual(f.song.read(), view);
  assert.equal(f.song.save('new').status, 'storage-error'); assert.deepEqual(f.song.read(), view);
  assert.throws(() => f.song.create(), /测试磁盘/); assert.deepEqual(f.song.read(), view);
  f.fail(false); f.song.undo(); assert.equal(f.song.read().body!.tracks[0]!.clips.length, 0); const undoView = f.song.read(); f.fail();
  assert.throws(() => f.song.redo(), /测试磁盘/); assert.deepEqual(f.song.read(), undoView);
});

test('a shared phrase growing beyond the first editor range leaves the song editable and repairable', () => {
  const f = fixture(); const track = start(f); const clip = f.song.addClip(track, f.first.id, 1016);
  assert.equal(f.song.read().lengthBeats, 1024); f.phrase.open(f.first.id); f.phrase.setLength(8);
  const warning = f.phrase.save('overwrite'); if (warning.status !== 'needs-confirmation') throw new Error('Expected reference warning.'); saved(f.phrase.save('overwrite', warning.confirmation));
  assert.equal(f.song.read().problem, undefined); assert.equal(f.song.read().lengthBeats, 1032);
  f.song.updateTrack(track, { name: '仍然可以编辑' }); assert.equal(f.song.read().body!.tracks[0]!.name, '仍然可以编辑');
  f.song.moveClip(track, clip, track, 1008); assert.equal(f.song.read().lengthBeats, 1024); f.song.undo(); assert.equal(f.song.read().lengthBeats, 1032);
  f.song.removeClip(track, clip); assert.equal(f.song.read().lengthBeats, 16); assert.deepEqual(f.song.read().draft!.dependencies, []);
});

test('saved songs and unfinished drafts reopen exactly with their own undo history', () => {
  const f = fixture(); const track = start(f); f.song.addClip(track, f.first.id, 0.123456789); f.song.rename('雨停以后的歌');
  const first = saved(f.song.save('new')); f.song.updateTrack(track, { pan: 0.123456789, level: 0.432109876 });
  const expected = f.song.read(); const reopenedLibrary = createMaterialLibrary(f.storage); const soundPlayback = createTimbrePlayback(reopenedLibrary);
  const reopened = createSongEditor(reopenedLibrary, createPhrasePlayback(reopenedLibrary, soundPlayback), { defaultTempoMode: 'song' });
  assert.deepEqual(reopened.read().body, expected.body); assert.equal(reopened.read().body!.tempoMode, 'source'); assert.equal(reopened.read().changed, true); assert.equal(reopened.read().canUndo, true);
  assert.equal(reopened.read().draft!.sourceId, first.id); reopened.open(first.id); assert.deepEqual(reopened.read().body, expected.body, 'opening a saved song resumes its unfinished draft');
  const copy = saved(reopened.save('new')); assert.notEqual(copy.id, first.id); assert.equal((f.library.readContent(first.id)!.body as SongBody).tracks[0]!.pan, 0);
});

test('song undo and redo survive separate restarts and do not change a saved shared song', () => {
  const f = fixture(); const track = start(f); const clip = f.song.addClip(track, f.first.id, 0);
  const content = saved(f.song.save('new')); const draftId = f.song.read().draft!.id;
  f.song.moveClip(track, clip, track, 4);
  const reopen = () => { const library = createMaterialLibrary(f.storage); return { library,
    editor: createSongEditor(library, createPhrasePlayback(library, createTimbrePlayback(library)), { defaultTempoMode: 'source' }) }; };
  let fresh = reopen(); assert.equal(fresh.editor.read().canUndo, true); fresh.editor.undo();
  assert.equal(fresh.editor.read().body!.tracks[0]!.clips[0]!.startBeat, 0); assert.equal(fresh.editor.read().changed, false);
  fresh = reopen(); assert.equal(fresh.editor.read().canRedo, true); fresh.editor.redo();
  assert.equal(fresh.editor.read().body!.tracks[0]!.clips[0]!.startBeat, 4);
  assert.equal(fresh.editor.read().draft!.id, draftId); assert.equal(fresh.editor.read().draft!.sourceId, content.id);
  assert.deepEqual(fresh.library.readContent(content.id), content);
});

test('song temporary preview accepts live clip and mix changes without writing drafts or history', () => {
  const f = fixture(); const track = start(f); f.song.addClip(track, f.first.id, 0); saved(f.song.save('new'));
  const view = f.song.read(); const raw = f.raw(); const temporary = structuredClone(view.body!);
  temporary.tracks[0]!.clips[0]!.startBeat = 4; temporary.tracks[0]!.pan = 0.75; temporary.tracks[0]!.level = 0.2;
  const inputBefore = structuredClone(temporary); const preview = f.song.previewPlan(temporary);
  assert.equal(preview.events[0]!.atSeconds, 2); assert.equal(preview.events[0]!.pan, 0.75);
  assert.equal(preview.events[0]!.sound.level, f.phrases.planForSaved(f.first.id).events[0]!.sound.level * 0.2);
  assert.deepEqual(temporary, inputBefore); assert.equal(f.raw(), raw); assert.deepEqual(f.song.read(), view);
  assert.throws(() => f.song.previewPlan({ ...temporary, futureParameter: 1 } as SongBody), /暂不支持/);
  temporary.tracks[0]!.clips[0]!.phraseId = 'missing'; assert.throws(() => f.song.previewPlan(temporary));
  assert.equal(f.raw(), raw); assert.deepEqual(f.song.read(), view);
});

test('live all-muted, zero-level and empty songs can silence the running plan while initial playback still rejects silence', () => {
  const f = fixture(); const track = start(f); const clip = f.song.addClip(track, f.first.id, 0);
  const raw = f.raw(); const history = f.library.readDraftHistory(f.song.read().draft!.id);
  const temporary = f.song.read().body!; temporary.tracks[0]!.muted = true;
  assert.throws(() => f.song.previewPlan(temporary), /开启至少/);
  assert.deepEqual(f.song.previewPlan(temporary, { allowSilence: true }), { kind: 'sequence', version: 1, durationSeconds: 8, events: [] });
  temporary.tracks[0]!.muted = false; temporary.tracks[0]!.level = 0;
  assert.deepEqual(f.song.previewPlan(temporary, { allowSilence: true }).events, []);
  assert.equal(f.raw(), raw); assert.deepEqual(f.library.readDraftHistory(f.song.read().draft!.id), history);
  f.song.removeClip(track, clip);
  assert.throws(() => f.song.previewPlan(), /开启至少/);
  assert.deepEqual(f.song.previewPlan(undefined, { allowSilence: true }).events, []);
});

test('read-only song playback uses saved content and never replaces an active draft or writes library data', () => {
  const f = fixture(); const track = start(f); f.song.addClip(track, f.first.id, 0); const content = saved(f.song.save('new'));
  f.song.moveClip(track, f.song.read().body!.tracks[0]!.clips[0]!.id, track, 4); const active = f.song.read(); const before = f.raw();
  const playback = createSongPlayback(f.library, f.phrases); const plan = playback.planForSaved(content.id);
  assert.equal(plan.events[0]!.atSeconds, 0); assert.equal(f.song.previewPlan().events[0]!.atSeconds, 2); assert.equal(f.raw(), before); assert.deepEqual(f.song.read(), active);
  assert.deepEqual(playback.listSaved().map(item => item.id), [content.id]); assert.throws(() => playback.planForSaved(f.first.id));
});

test('unsupported song bodies and dependency tampering are preserved and isolated from other content', () => {
  const f = fixture(); const body = baseBody(); body.tracks[0]!.clips.push({ id: 'clip-a', phraseId: f.first.id, startBeat: 0 });
  const bad = f.library.createDraft({ kind: 'rootsound.song', owner: 'song', schemaVersion: 1, name: '未来的歌', dependencies: [f.first.id], body: { ...body, futureAutomation: [] } });
  const before = f.raw(); const editor = createSongEditor(f.library, f.phrases, { defaultTempoMode: 'source' }); assert.equal(editor.read().draft!.id, bad.id); assert.match(editor.read().problem!, /暂不支持/); assert.equal(editor.read().body, undefined); assert.equal(f.raw(), before);
  assert.throws(() => editor.openDraft(bad.id)); editor.create(); assert.equal(f.library.readDraft(bad.id)!.name, '未来的歌');
  const inconsistent = f.library.createDraft({ kind: 'rootsound.song', owner: 'song', schemaVersion: 1, name: '损坏引用', dependencies: [], body }); assert.throws(() => editor.openDraft(inconsistent.id), /依赖记录不一致/);
});

test('strict song decoding rejects unknown fields, duplicate identities, booleans and nonfinite values', () => {
  assert.deepEqual(readSongBody(baseBody()), baseBody());
  const variants: unknown[] = [null, { ...baseBody(), version: 2 }, { ...baseBody(), tempoMode: undefined }, { ...baseBody(), tracks: null },
    { ...baseBody(), tracks: [{ ...baseBody().tracks[0], pan: NaN }] }, { ...baseBody(), tracks: [{ ...baseBody().tracks[0], muted: 'yes' }] },
    { ...baseBody(), tracks: [{ ...baseBody().tracks[0], clips: [{ id: 'track-a', phraseId: 'phrase', startBeat: 0 }] }] },
    { ...baseBody(), tracks: [{ ...baseBody().tracks[0], effect: 'unknown' }] },
    { ...baseBody(), tracks: [{ ...baseBody().tracks[0], clips: [{ id: 'clip', phraseId: 'phrase', startBeat: Infinity }] }] }];
  for (const value of variants) assert.throws(() => readSongBody(value));
});

test('preview refuses an unsupported execution size without corrupting or truncating an editable arrangement', () => {
  const f = fixture(); const track = start(f); f.song.addClip(track, f.first.id, 0); f.song.setLength(1024); f.song.setTempo(40);
  const before = f.raw(); assert.throws(() => f.song.previewPlan(), /最长 10 分钟/); assert.equal(f.raw(), before); saved(f.song.save('new'));
  f.song.setLength(16); f.phrase.create(f.voice.id); const part = f.phrase.read().body!.parts[0]!.id;
  for (let index = 0; index < 512; index++) f.phrase.addNote(part, { startBeat: 0, durationBeats: 0.25, frequencyHz: 220, velocity: 0.2 });
  const dense = saved(f.phrase.save('new')); f.song.create(); const denseTrack = f.song.read().body!.tracks[0]!.id;
  f.song.addClips(Array.from({ length: 5 }, () => ({ trackId: denseTrack, phraseId: dense.id, startBeat: 0 })));
  const denseBefore = f.raw(); assert.throws(() => f.song.previewPlan(), /2048/); assert.equal(f.raw(), denseBefore);
});

test('empty songs cannot be saved, and another common-store editor invalidates stale undo history', () => {
  const f = fixture(); const track = start(f); assert.throws(() => f.song.save('new'), /放入一段乐句/);
  f.song.addClip(track, f.first.id, 0); const draft = f.song.read().draft!; const body = f.song.read().body!; body.tracks[0]!.name = '别处改过的名称';
  f.library.updateDraft(draft.id, { body }); assert.equal(f.song.read().canUndo, false); const before = f.raw(); f.song.undo(); assert.equal(f.raw(), before);
});

test('mixed source tempos preserve short notes and natural tails even when a song tempo changes their placement', () => {
  const f = fixture(); f.timbre.create(); f.timbre.rename('长长的回声'); f.timbre.setLevel(0.4); f.timbre.setEnvelope(1.75, 3.75);
  const voice = saved(f.timbre.save('new')); f.phrase.create(voice.id); f.phrase.setTempo(60); f.phrase.setLength(4);
  f.phrase.addNote(f.phrase.read().body!.parts[0]!.id, { startBeat: 3.5, durationBeats: 0.5, frequencyHz: 277.1826309768721, velocity: 0.6 });
  const slow = saved(f.phrase.save('new')); const a = start(f); const b = f.song.addTrack('另一句');
  f.song.addClip(a, slow.id, 12); f.song.addClip(b, f.second.id, 0);
  f.song.updateTrack(a, { level: 0.3, pan: -0.9 }); f.song.updateTrack(b, { level: 0.6, pan: 0.4 });
  const plan = f.song.previewPlan(); const last = plan.events.at(-1)!;
  assert.equal(last.atSeconds, 9.5); assert.equal(last.sound.note.holdSeconds, 0.5); assert.equal(last.sound.envelope.attackSeconds, 1.75);
  assert.equal(last.sound.envelope.releaseSeconds, 3.75); assert.equal(last.sound.level, 0.12); assert.equal(last.pan, -0.9);
  assert.equal(plan.events[0]!.pan, 0.4); assert.equal(plan.events[0]!.sound.note.holdSeconds, 0.5);
  assert.equal(f.song.read().lengthBeats, 20); assert.equal(plan.durationSeconds, 13.75, 'the final tail survives beyond the clip and timeline musical extent');
  const sourceBefore = f.library.readContent(slow.id); f.song.setTempo(90); const moved = f.song.previewPlan().events.at(-1)!;
  assert.equal(moved.atSeconds, 11.5); assert.deepEqual(moved.sound, last.sound); assert.equal(moved.pan, last.pan);
  assert.equal(f.song.previewPlan().durationSeconds, 15.75); assert.deepEqual(f.library.readContent(slow.id), sourceBefore);
  assert.deepEqual(f.song.read().draft!.dependencies, [slow.id, f.second.id]);
});

test('reopening keeps the saved song snapshot separate from pending song and phrase edits', () => {
  const f = fixture(); const a = start(f); const b = f.song.addTrack('回应'); const clip = f.song.addClip(a, f.first.id, 0);
  f.song.addClip(b, f.second.id, 4); f.song.setTempo(150); f.song.updateTrack(a, { level: 0.22, pan: -0.25 }); f.song.updateTrack(b, { level: 0.66, pan: 0.75 });
  const content = saved(f.song.save('new')); const savedPlan = f.song.previewPlan(); const savedBody = f.library.readContent(content.id)!.body;
  f.song.updateTrack(a, { level: 0.77, pan: 0.5 }); f.song.moveClip(a, clip, a, 6.25); const pendingPlan = f.song.previewPlan();
  f.phrase.open(f.first.id); const part = f.phrase.read().body!.parts[0]!; f.phrase.updateNote(part.id, part.notes[0]!.id, { frequencyHz: 880 });
  assert.deepEqual(f.song.previewPlan(), pendingPlan, 'a referenced phrase draft cannot replace its saved musical content');
  const restoredLibrary = createMaterialLibrary(f.storage); const restoredPhrases = createPhrasePlayback(restoredLibrary, createTimbrePlayback(restoredLibrary));
  const restoredPlayback = createSongPlayback(restoredLibrary, restoredPhrases); const restoredEditor = createSongEditor(restoredLibrary, restoredPhrases, { defaultTempoMode: 'song' });
  const before = f.raw(); assert.deepEqual(restoredPlayback.planForSaved(content.id), savedPlan); assert.deepEqual(restoredEditor.previewPlan(), pendingPlan);
  assert.equal(restoredEditor.read().changed, true); assert.equal(restoredEditor.read().draft!.sourceId, content.id); assert.equal(restoredEditor.read().body!.tempoMode, 'source');
  assert.deepEqual(restoredLibrary.readContent(content.id)!.body, savedBody); assert.equal(f.raw(), before, 'recovery and read-only playback cannot write or resave anything');
});

test('a competing saved revision causes a conflict while Save As preserves both independent song identities', () => {
  const f = fixture(); const track = start(f); f.song.addClip(track, f.first.id, 0); const original = saved(f.song.save('new')); f.song.rename('这里继续的想法');
  const competingDraft = f.library.createDraft({ sourceId: original.id }); const other = createSongEditor(f.library, f.phrases, { defaultTempoMode: 'source' });
  other.openDraft(competingDraft.id); other.rename('别处保存的版本'); const replacement = saved(other.save('overwrite')); assert.equal(replacement.revision, 2);
  const before = f.raw(); const state = f.song.read(); assert.equal(f.song.save('overwrite').status, 'conflict'); assert.equal(f.raw(), before); assert.deepEqual(f.song.read(), state);
  const independent = saved(f.song.save('new')); assert.notEqual(independent.id, original.id); assert.equal(independent.name, '这里继续的想法');
  assert.equal(f.library.readContent(original.id)!.name, '别处保存的版本'); assert.deepEqual(independent.dependencies, [f.first.id]);
  assert.deepEqual(f.library.readContent(f.first.id)!.dependencies, [f.voice.id]);
});
