import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { ContentRecord, MaterialLibrary, MaterialStorage, SaveResult } from '../src/workstation/contracts/content.ts';
import type { SongBody } from '../src/workstation/contracts/song.ts';
import { createMaterialLibrary, createProjectPackages } from '../src/workstation/modules/materials/public.ts';
import { createTimbreEditor, createTimbrePlayback, createTimbreReferenceAdapter } from '../src/workstation/modules/timbre/public.ts';
import { createPhraseEditor, createPhrasePlayback, createPhraseReferenceAdapter } from '../src/workstation/modules/phrase/public.ts';
import { createSongEditor, createSongPlayback, createSongReferenceAdapter, readSongBody } from '../src/workstation/modules/song/public.ts';

function saved(result: SaveResult): ContentRecord {
  assert.equal(result.status, 'saved');
  if (result.status !== 'saved') throw new Error('Expected saved content.');
  return result.content;
}
function store() {
  let raw: string | null = null;
  const storage: MaterialStorage = { read: () => raw, write: value => { raw = value; } };
  return { storage, library: createMaterialLibrary(storage), raw: () => raw };
}
function editor(library: MaterialLibrary, initialTrackCount = 1) {
  const phrases = createPhrasePlayback(library, createTimbrePlayback(library));
  return createSongEditor(library, phrases, { defaultTempoMode: 'source', initialTrackCount });
}
function fixture(initialTrackCount = 1) {
  const f = store(); const timbre = createTimbreEditor(f.library); const sound = saved(timbre.save('new'));
  const phrase = createPhraseEditor(f.library, createTimbrePlayback(f.library));
  phrase.create(sound.id); phrase.setTempo(73); phrase.setLength(4);
  phrase.addNote(phrase.read().body!.parts[0]!.id, {
    startBeat: 0.123456789123, durationBeats: 1.234567891234, frequencyHz: 231.123456789, velocity: 0.7123456789,
  });
  const slow = saved(phrase.save('new'));
  phrase.create(sound.id); phrase.setTempo(137); phrase.setLength(4);
  phrase.addNote(phrase.read().body!.parts[0]!.id, {
    startBeat: 1.987654321, durationBeats: 0.34567891234, frequencyHz: 437.987654321, velocity: 0.543219876,
  });
  const fast = saved(phrase.save('new'));
  const song = editor(f.library, initialTrackCount); song.create();
  const track = song.read().body!.tracks[0]!.id;
  return { ...f, slow, fast, song, track };
}
function packages(library: MaterialLibrary) {
  return createProjectPackages(library, [createSongReferenceAdapter(), createPhraseReferenceAdapter(), createTimbreReferenceAdapter()], { rootKind: 'rootsound.song' });
}

test('grid BPM changes preserve every exact audio time, source tempo and arrangement position', () => {
  const f = fixture();
  f.song.addClip(f.track, f.slow.id, 0.123456789123);
  f.song.addClip(f.track, f.fast.id, 8.987654321987);
  const body = f.song.read().body!; const plan = f.song.previewPlan();
  const slow = f.library.readContent(f.slow.id); const fast = f.library.readContent(f.fast.id);
  for (const bpm of [40, 240, 91.123456789]) {
    f.song.setGridTempo(bpm);
    assert.equal(f.song.read().body!.gridTempoBpm, bpm);
    assert.equal(f.song.read().body!.tempoBpm, body.tempoBpm);
    assert.deepEqual(f.song.read().body!.tracks, body.tracks);
    assert.deepEqual(f.song.previewPlan(), plan, 'note starts, held durations and full extent stay exactly equal');
  }
  assert.deepEqual(f.library.readContent(f.slow.id), slow);
  assert.deepEqual(f.library.readContent(f.fast.id), fast);
  f.song.undo(); assert.equal(f.song.read().body!.gridTempoBpm, 240); assert.deepEqual(f.song.previewPlan(), plan);
  f.song.redo(); assert.equal(f.song.read().body!.gridTempoBpm, 91.123456789); assert.deepEqual(f.song.previewPlan(), plan);
  for (const offset of [-1e6, -0.123456789, 0, 0.987654321, 1e6]) {
    f.song.setGridOffset(offset); assert.equal(f.song.read().body!.gridOffsetSeconds, offset);
    assert.deepEqual(f.song.read().body!.tracks, body.tracks); assert.deepEqual(f.song.previewPlan(), plan);
  }
  const content = saved(f.song.save('new'));
  assert.deepEqual(createSongPlayback(f.library, createPhrasePlayback(f.library, createTimbrePlayback(f.library))).planForSaved(content.id), plan);
});

test('per-clip level and pan affect only that instance, while master level affects the full mix', () => {
  const f = fixture(); const first = f.song.addClip(f.track, f.slow.id, 0); f.song.addClip(f.track, f.slow.id, 8);
  f.song.updateTrack(f.track, { level: 0.6, pan: -0.4 });
  const before = f.song.previewPlan(); const source = f.library.readContent(f.slow.id);
  f.song.updateClip(f.track, first, { level: 0.25, pan: 0.7 });
  const mixed = f.song.previewPlan();
  assert.equal(mixed.events[0]!.sound.level, before.events[0]!.sound.level * 0.25);
  assert.equal(mixed.events[0]!.pan, 0.7);
  assert.deepEqual(mixed.events[1], before.events[1]);
  assert.equal(mixed.events[0]!.atSeconds, before.events[0]!.atSeconds);
  assert.deepEqual(mixed.events[0]!.sound.note, before.events[0]!.sound.note);
  f.song.setMasterLevel(0.5);
  const mastered = f.song.previewPlan();
  for (let index = 0; index < mixed.events.length; index++) {
    assert.equal(mastered.events[index]!.sound.level, mixed.events[index]!.sound.level * 0.5);
    assert.equal(mastered.events[index]!.pan, mixed.events[index]!.pan);
    assert.equal(mastered.events[index]!.atSeconds, mixed.events[index]!.atSeconds);
  }
  assert.deepEqual(f.library.readContent(f.slow.id), source);
  f.song.updateClip(f.track, first, { level: 0 });
  assert.equal(f.song.previewPlan().events.length, 1, 'a silent instance leaves its shared sibling audible');
  f.song.setMasterLevel(0);
  assert.throws(() => f.song.previewPlan(), /开启至少一条轨道/);
  assert.deepEqual(f.song.previewPlan(undefined, { allowSilence: true }).events, []);
});

test('copy, repeat, movement, undo and reopening preserve clip mix without changing phrase dependencies', () => {
  const f = fixture(); const first = f.song.addClip(f.track, f.slow.id, 0);
  f.song.updateClip(f.track, first, { level: 0.23456789123, pan: -0.87654321987 });
  f.song.undo(); assert.equal(f.song.read().body!.tracks[0]!.clips[0]!.level, undefined);
  f.song.redo();
  const secondTrack = f.song.addTrack(); const copy = f.song.copyClip(f.track, first, secondTrack, 8.123456789);
  const repeats = f.song.repeatClip(f.track, first, 1);
  f.song.moveClip(secondTrack, copy, secondTrack, 11.987654321);
  f.song.setGridTempo(93); f.song.setMasterLevel(0.45678912345);
  const expected = f.song.read().body!; const expectedPlan = f.song.previewPlan();
  for (const clip of expected.tracks.flatMap(track => track.clips)) {
    assert.equal(clip.level, 0.23456789123); assert.equal(clip.pan, -0.87654321987);
  }
  assert.equal(new Set([first, copy, ...repeats]).size, 3);
  assert.deepEqual(f.song.read().draft!.dependencies, [f.slow.id]);
  const content = saved(f.song.save('new')); const reopened = editor(createMaterialLibrary(f.storage), 7);
  reopened.open(content.id); assert.deepEqual(reopened.read().body, expected); assert.deepEqual(reopened.previewPlan(), expectedPlan);
  reopened.undo(); assert.equal(reopened.read().body!.masterLevel, undefined);
  reopened.redo(); assert.deepEqual(reopened.read().body, expected);
});

test('project export and reference remapping retain grid, master and clip mix with the exact dependency graph', () => {
  const f = fixture(7); const first = f.song.addClip(f.track, f.slow.id, 0.23456789);
  f.song.addClip(f.song.read().body!.tracks[6]!.id, f.fast.id, 7.654321);
  f.song.updateClip(f.track, first, { level: 0.3456789123, pan: 0.7654321987 });
  f.song.setGridTempo(89.123456789); f.song.setGridOffset(-2.3456789123); f.song.setMasterLevel(0.6543219876);
  const expected = f.song.read().body!; const plan = f.song.previewPlan(); const raw = f.raw();
  const output = packages(f.library).exportDraft(f.song.read().draft!.id); const file = JSON.parse(output.text);
  const exported = file.contents.find((content: ContentRecord) => content.id === file.rootId);
  assert.deepEqual(exported.body, expected); assert.equal(file.contents.length, 4);
  assert.equal(f.raw(), raw, 'export does not modify the arrangement or its history');
  const destination = store(); const result = packages(destination.library).importProject(output.text);
  assert.equal(result.status, 'imported'); if (result.status !== 'imported') throw new Error('Expected imported project.');
  const actual = readSongBody(result.content.body);
  assert.equal(actual.gridTempoBpm, expected.gridTempoBpm); assert.equal(actual.masterLevel, expected.masterLevel);
  assert.equal(actual.gridOffsetSeconds, expected.gridOffsetSeconds);
  assert.equal(actual.tracks[0]!.clips[0]!.level, expected.tracks[0]!.clips[0]!.level);
  assert.equal(actual.tracks[0]!.clips[0]!.pan, expected.tracks[0]!.clips[0]!.pan);
  assert.equal(actual.tracks.length, 7);
  assert.notEqual(actual.tracks[0]!.clips[0]!.phraseId, f.slow.id);
  assert.deepEqual(new Set(result.content.dependencies), new Set(actual.tracks.flatMap(track => track.clips.map(clip => clip.phraseId))));
  assert.deepEqual(editor(createMaterialLibrary(destination.storage)).previewPlan(), plan);
});

test('new songs can start with seven rows, add more, and preserve an existing one-row song as stored', () => {
  const f = fixture(7); const original = f.song.read().body!;
  assert.equal(original.tracks.length, 7); assert.equal(new Set(original.tracks.map(track => track.id)).size, 7);
  f.song.addTrack(); assert.equal(f.song.read().body!.tracks.length, 8);
  f.song.undo(); assert.equal(f.song.read().body!.tracks.length, 7);
  f.song.createFromPhrase(f.fast.id);
  assert.equal(f.song.read().body!.tracks.length, 7);
  assert.equal(f.song.read().body!.tracks[0]!.clips.length, 1);
  assert.equal(f.song.read().body!.tracks.slice(1).flatMap(track => track.clips).length, 0);
  const legacy = fixture(); const legacyBody = legacy.song.read().body!;
  assert.deepEqual(readSongBody(legacyBody), legacyBody);
  assert.equal(editor(createMaterialLibrary(legacy.storage), 7).read().body!.tracks.length, 1);
  const maximum: SongBody = { ...original, tracks: Array.from({ length: 128 }, (_, index) => ({ ...original.tracks[0]!, id: `row-${index}` })) };
  assert.equal(readSongBody(maximum).tracks.length, 128);
  assert.throws(() => readSongBody({ ...maximum, tracks: [...maximum.tracks, { ...maximum.tracks[0], id: 'extra-row' }] }), /128/);
});

test('new controls strictly reject invalid values and unknown fields without writing or altering history', () => {
  const f = fixture(); const clip = f.song.addClip(f.track, f.slow.id, 0);
  const raw = f.raw(); const before = f.song.read();
  for (const bpm of [0, 39, 241, NaN, Infinity]) assert.throws(() => f.song.setGridTempo(bpm));
  for (const seconds of [-1e6 - 1, 1e6 + 1, NaN, Infinity]) {
    assert.throws(() => f.song.setGridOffset(seconds)); assert.throws(() => readSongBody({ ...before.body!, gridOffsetSeconds: seconds }));
  }
  for (const level of [-0.1, 1.1, NaN, Infinity]) {
    assert.throws(() => f.song.setMasterLevel(level)); assert.throws(() => f.song.updateClip(f.track, clip, { level }));
    assert.throws(() => readSongBody({ ...before.body!, masterLevel: level }));
  }
  for (const pan of [-1.1, 1.1, NaN, Infinity]) assert.throws(() => f.song.updateClip(f.track, clip, { pan }));
  for (const initialTrackCount of [0, -1, 1.5, 129, NaN, Infinity]) assert.throws(() => editor(f.library, initialTrackCount));
  for (const changes of [{ volume: 0.5 }, { level: undefined }, { pan: undefined }, { phraseId: f.fast.id }]) {
    assert.throws(() => f.song.updateClip(f.track, clip, changes as never));
  }
  assert.throws(() => f.song.updateClip(f.track, 'missing', { level: 0.5 }));
  const body = structuredClone(before.body!); body.tracks[0]!.clips[0]!.pan = 2;
  assert.throws(() => readSongBody(body));
  assert.throws(() => readSongBody({ ...before.body!, gridTempoBpm: 39 }));
  assert.equal(f.raw(), raw); assert.deepEqual(f.song.read(), before);
});
