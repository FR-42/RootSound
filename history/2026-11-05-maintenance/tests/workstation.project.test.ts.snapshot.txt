import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { ContentRecord, MaterialLibrary, SaveResult } from '../src/workstation/contracts/content.ts';
import type { ProjectImportResult } from '../src/workstation/contracts/project.ts';
import type { ReferenceAdapter } from '../src/workstation/contracts/references.ts';
import { MAX_PROJECT_FILE_BYTES } from '../src/workstation/contracts/files.ts';
import { createMaterialLibrary, createProjectPackages } from '../src/workstation/modules/materials/public.ts';
import { createTimbreEditor, createTimbrePlayback, createTimbreReferenceAdapter } from '../src/workstation/modules/timbre/public.ts';
import { createPhraseEditor, createPhrasePlayback, createPhraseReferenceAdapter, readPhraseBody } from '../src/workstation/modules/phrase/public.ts';
import { createSongEditor, createSongPlayback, createSongReferenceAdapter, readSongBody } from '../src/workstation/modules/song/public.ts';

function saved(result: SaveResult): ContentRecord { assert.equal(result.status, 'saved'); if (result.status !== 'saved') throw new Error('Expected saved'); return result.content; }
function imported(result: ProjectImportResult) { assert.equal(result.status, 'imported', JSON.stringify(result)); if (result.status !== 'imported') throw new Error('Expected imported'); return result; }
function adapters(): ReferenceAdapter[] { return [createSongReferenceAdapter(), createPhraseReferenceAdapter(), createTimbreReferenceAdapter()]; }
function packages(library: MaterialLibrary) { return createProjectPackages(library, adapters(), { rootKind: 'rootsound.song' }); }
function storageFixture() {
  let raw: string | null = null; let failing = false; let writes = 0;
  const storage = { read: () => raw, write(value: string) { if (failing) throw new Error('磁盘空间不足'); raw = value; writes++; } };
  return { storage, library: createMaterialLibrary(storage), raw: () => raw, writes: () => writes, fail: () => { failing = true; } };
}
function fixture() {
  const store = storageFixture(); const library = store.library;
  const timbre = createTimbreEditor(library); timbre.rename('风中的木琴'); timbre.setLevel(0.6789123456789); timbre.setEnvelope(0.123456789, 3.987654321);
  const firstSound = saved(timbre.save('new'));
  timbre.create(); timbre.rename('轻轻回应'); timbre.setCharacter('clear'); timbre.setLevel(0.4321987654321);
  const secondSound = saved(timbre.save('new'));
  const phrase = createPhraseEditor(library, createTimbrePlayback(library)); phrase.create(firstSound.id); phrase.rename('慢慢 · 90'); phrase.setTempo(90); phrase.setLength(4);
  const main = phrase.read().body!.parts[0]!.id; const doubling = phrase.addPart(firstSound.id); const response = phrase.addPart(secondSound.id);
  phrase.addNote(main, { startBeat: 0.123456789123, durationBeats: 1.234567891234, frequencyHz: 270.123456789123, velocity: 0.765432109876 });
  phrase.addNote(doubling, { startBeat: 3.75, durationBeats: 0.25, frequencyHz: 401.987654321987, velocity: 0.345678912345 });
  phrase.addNote(response, { startBeat: 1.765432198765, durationBeats: 1.012345678912, frequencyHz: 620.123456789, velocity: 0.876543219876 });
  const firstPhrase = saved(phrase.save('new'));
  phrase.create(firstSound.id); phrase.rename('轻轻 · 120'); phrase.setTempo(120); phrase.setLength(4);
  phrase.addNote(phrase.read().body!.parts[0]!.id, { startBeat: 3.23456789, durationBeats: 0.76543211, frequencyHz: 423.123456789123, velocity: 0.567891234567 });
  const secondPhrase = saved(phrase.save('new'));
  const playback = createPhrasePlayback(library, createTimbrePlayback(library));
  const song = createSongEditor(library, playback, { defaultTempoMode: 'source' }); song.create(); song.rename('一首可带走的歌');
  const firstTrack = song.read().body!.tracks[0]!.id; const secondTrack = song.addTrack('回应与尾音');
  song.updateTrack(firstTrack, { level: 0.456789123456, pan: -0.723456789123 }); song.updateTrack(secondTrack, { level: 0.765432198765, pan: 0.612345678912 });
  song.addClip(firstTrack, firstPhrase.id, 0.123456789123); song.addClip(firstTrack, firstPhrase.id, 8.234567891234);
  song.addClip(secondTrack, secondPhrase.id, 15.123456789123);
  const savedSong = saved(song.save('new'));
  // A package captures current edits, rather than silently exporting its saved origin.
  song.rename('尚未保存 · 但能完整带走'); song.updateTrack(firstTrack, { pan: -0.812345678912 });
  const project = packages(library);
  return { ...store, timbre, phrase, song, project, firstSound, secondSound, firstPhrase, secondPhrase, savedSong,
    draftId: song.read().draft!.id };
}

test('export captures the current song and exact transitive closure without writes, history, contexts or unrelated material', () => {
  const f = fixture(); f.timbre.create(); f.timbre.rename('这份无关声音不能进入工程'); saved(f.timbre.save('new'));
  const before = f.raw(); const writes = f.writes(); const token = f.library.currentToken();
  const output = f.project.exportDraft(f.draftId); const file = JSON.parse(output.text);
  assert.equal(output.name, '尚未保存 · 但能完整带走.rsproject'); assert.equal(output.contentCount, 5);
  assert.equal(file.format, 'RootSoundProject'); assert.equal(file.version, 1); assert.equal(file.contents.length, 5);
  assert.notEqual(file.rootId, f.savedSong.id); assert.notEqual(file.rootId, f.draftId);
  assert.deepEqual(file.contents.find((item: ContentRecord) => item.id === file.rootId).body, f.song.read().body);
  assert.equal(file.contents.find((item: ContentRecord) => item.id === file.rootId).name, f.song.read().draft!.name);
  assert(!file.contents.some((item: ContentRecord) => item.id === f.savedSong.id || item.name.includes('无关')));
  for (const record of file.contents) assert.deepEqual(Object.keys(record).sort(), ['body', 'dependencies', 'id', 'kind', 'name', 'owner', 'revision', 'schemaVersion']);
  assert.equal(f.raw(), before); assert.equal(f.writes(), writes); assert.equal(f.library.currentToken(), token);
});

test('a complete mixed-tempo song imports into an empty library with identical panning, fractional timing, frequencies and release tails', () => {
  const f = fixture(); const expected = f.song.previewPlan(); const output = f.project.exportDraft(f.draftId);
  const destination = storageFixture(); const result = imported(packages(destination.library).importProject(output.text));
  assert.equal(destination.writes(), 1); assert.equal(result.contentCount, 5); assert.equal(destination.library.listContent().length, 5);
  assert.equal(destination.library.listDrafts().length, 1); assert.equal(result.draft.sourceId, result.content.id);
  const importedPlayback = createSongPlayback(destination.library, createPhrasePlayback(destination.library, createTimbrePlayback(destination.library)));
  assert.deepEqual(importedPlayback.planForSaved(result.content.id), expected);
  assert(expected.events.some(event => event.pan === -0.812345678912)); assert(expected.events.some(event => event.pan === 0.612345678912));
  assert(expected.durationSeconds > 12); assert(expected.events.some(event => event.sound.envelope.releaseSeconds === 3.987654321));
  const originalIds = new Set(f.library.listContent().map(record => record.id));
  assert(destination.library.listContent().every(record => !originalIds.has(record.id) && record.revision === 1));
});

test('shared phrases and shared sounds retain one identity inside the imported project, while every original identity is replaced', () => {
  const f = fixture(); const target = storageFixture(); const result = imported(packages(target.library).importProject(f.project.exportDraft(f.draftId).text));
  const body = readSongBody(result.content.body); const first = body.tracks[0]!.clips;
  assert.equal(first[0]!.phraseId, first[1]!.phraseId); assert.notEqual(first[0]!.phraseId, f.firstPhrase.id);
  const phrase = readPhraseBody(target.library.readContent(first[0]!.phraseId)!.body);
  assert.equal(phrase.parts[0]!.timbreId, phrase.parts[1]!.timbreId);
  const second = readPhraseBody(target.library.readContent(body.tracks[1]!.clips[0]!.phraseId)!.body);
  assert.equal(phrase.parts[0]!.timbreId, second.parts[0]!.timbreId);
  assert.notEqual(phrase.parts[0]!.timbreId, f.firstSound.id);
  assert.equal(target.library.listContent().filter(record => record.kind === 'rootsound.timbre').length, 2);
  assert.deepEqual(phrase.parts[0]!.notes, readPhraseBody(f.firstPhrase.body).parts[0]!.notes);
});

test('an imported project survives reopening, can be edited and saved, and does not require the originating library', () => {
  const f = fixture(); const target = storageFixture(); const result = imported(packages(target.library).importProject(f.project.exportDraft(f.draftId).text));
  const reopened = createMaterialLibrary(target.storage);
  const song = createSongEditor(reopened, createPhrasePlayback(reopened, createTimbrePlayback(reopened)), { defaultTempoMode: 'source' });
  song.openDraft(result.draft.id); assert.deepEqual(song.previewPlan(), f.song.previewPlan());
  const first = song.read().body!.tracks[0]!; song.moveClip(first.id, first.clips[0]!.id, first.id, 2.987654321987);
  const savedSong = saved(song.save('overwrite'));
  const movedId = first.clips[0]!.id;
  assert.equal(readSongBody(savedSong.body).tracks[0]!.clips.find(clip => clip.id === movedId)!.startBeat, 2.987654321987);
  song.undo(); assert.equal(song.read().body!.tracks[0]!.clips.find(clip => clip.id === movedId)!.startBeat, first.clips[0]!.startBeat);
  assert.equal(readSongBody(reopened.readContent(savedSong.id)!.body).tracks[0]!.clips.find(clip => clip.id === movedId)!.startBeat, 2.987654321987);
});

test('importing into the original library or importing twice creates independent identities without overwriting same names or ids', () => {
  const f = fixture(); const output = f.project.exportDraft(f.draftId); const previous = f.library.listContent();
  const first = imported(f.project.importProject(output.text)); const second = imported(f.project.importProject(output.text));
  assert.equal(first.content.name, second.content.name); assert.notEqual(first.content.id, second.content.id);
  assert.equal(f.library.listContent().length, previous.length + 10);
  for (const record of previous) assert.deepEqual(f.library.readContent(record.id), record);
  const firstGraph = new Set([first.content.id, ...first.content.dependencies]);
  assert(!second.content.dependencies.some(id => firstGraph.has(id)));
});

test('disk failures do not publish partial imported content or drafts and leave the original library byte-for-byte intact', () => {
  const f = fixture(); const output = f.project.exportDraft(f.draftId); const target = storageFixture();
  const existing = createTimbreEditor(target.library); saved(existing.save('new'));
  const raw = target.raw(); const contents = target.library.listContent(); const drafts = target.library.listDrafts(); const token = target.library.currentToken();
  target.fail(); assert.equal(packages(target.library).importProject(output.text).status, 'storage-error');
  assert.equal(target.raw(), raw); assert.deepEqual(target.library.listContent(), contents); assert.deepEqual(target.library.listDrafts(), drafts);
  assert.equal(target.library.currentToken(), token);
});

test('an intervening library change rejects the import transaction without any imported fragments', () => {
  const f = fixture(); const output = f.project.exportDraft(f.draftId); const target = storageFixture();
  const originalCommit = target.library.commitTransaction;
  const observing: MaterialLibrary = { ...target.library, commitTransaction(transaction) {
    target.library.createDraft({ kind: 'unrelated', owner: 'unrelated', schemaVersion: 1, name: '另一处刚保存的编辑稿', body: null });
    return originalCommit(transaction);
  } };
  assert.equal(packages(observing).importProject(output.text).status, 'conflict');
  assert.deepEqual(target.library.listContent(), []); assert.equal(target.library.listDrafts().length, 1);
  assert.equal(target.library.listDrafts()[0]!.name, '另一处刚保存的编辑稿');
});

test('missing roots, missing references, duplicate identities, inconsistent dependencies and unrelated extra contents all reject without writes', () => {
  const f = fixture(); const original = JSON.parse(f.project.exportDraft(f.draftId).text);
  const variants = [
    (file: typeof original) => { file.rootId = 'missing'; },
    (file: typeof original) => { file.contents = file.contents.filter((record: ContentRecord) => record.id !== f.firstSound.id); },
    (file: typeof original) => { file.contents.push(file.contents[0]); },
    (file: typeof original) => { file.contents[0].dependencies = []; },
    (file: typeof original) => { file.contents.push({ ...file.contents.find((record: ContentRecord) => record.id === f.firstSound.id), id: 'orphan' }); },
  ];
  for (const change of variants) {
    const target = storageFixture(); const file = structuredClone(original); change(file);
    assert.equal(packages(target.library).importProject(JSON.stringify(file)).status, 'conflict');
    assert.equal(target.writes(), 0); assert.deepEqual(target.library.listContent(), []); assert.deepEqual(target.library.listDrafts(), []);
  }
});

test('future envelope or musical versions, unknown fields and mismatched target types are rejected before persistence', () => {
  const f = fixture(); const original = JSON.parse(f.project.exportDraft(f.draftId).text);
  const variants = [
    (file: typeof original) => { file.version = 2; },
    (file: typeof original) => { file.remoteAssets = ['https://example.invalid/sample']; },
    (file: typeof original) => { file.contents[0].editingContext = { private: true }; },
    (file: typeof original) => { file.contents.find((record: ContentRecord) => record.id === f.firstSound.id).schemaVersion = 2; },
    (file: typeof original) => { file.contents.find((record: ContentRecord) => record.id === f.firstSound.id).body.version = 2; },
    (file: typeof original) => { file.contents.find((record: ContentRecord) => record.id === f.firstSound.id).body.unsupportedEffect = true; },
    (file: typeof original) => { const root = file.contents[0]; const body = readSongBody(root.body); body.tracks[0]!.clips.forEach(clip => { clip.phraseId = f.firstSound.id; }); root.body = body; root.dependencies = [f.firstSound.id, f.secondPhrase.id]; },
  ];
  for (const change of variants) {
    const target = storageFixture(); const file = structuredClone(original); change(file);
    assert.equal(packages(target.library).importProject(JSON.stringify(file)).status, 'conflict'); assert.equal(target.writes(), 0);
  }
});

test('size is measured in UTF-8 bytes, record count is bounded, and malformed or nonfinite input never enters the library', () => {
  const target = storageFixture(); const port = packages(target.library);
  const oversized = '中'.repeat(Math.floor(MAX_PROJECT_FILE_BYTES / 3) + 1);
  const sizeResult = port.importProject(oversized); assert.equal(sizeResult.status, 'conflict');
  if (sizeResult.status === 'conflict') assert.match(sizeResult.reason, /大小/);
  assert.equal(port.importProject(JSON.stringify({ format: 'RootSoundProject', version: 1, rootId: 'x', contents: Array(8193).fill(null) })).status, 'conflict');
  for (const bad of ['{bad', 'null', '[]', '{"format":"RootSoundProject","version":1,"rootId":"x","contents":[]}']) assert.equal(port.importProject(bad).status, 'conflict');
  const f = fixture(); const source = f.project.exportDraft(f.draftId);
  // A parsed numeric overflow is not valid finite musical data.
  assert.equal(port.importProject(source.text.replace(/"tempoBpm":120/, '"tempoBpm":1e309')).status, 'conflict');
  assert.equal(target.writes(), 0);
});

test('cyclic reference graphs and adapters without target verification are refused by the generic packaging layer', () => {
  const graph: ReferenceAdapter = { kind: 'graph', slots(record) {
    const body = record.body as { references: string[] }; return body.references.map((id, index) => ({ id: `slot-${index}`, targetId: id, label: id }));
  }, validateTarget() {}, replace() { throw new Error('Not reached for an invalid graph'); } };
  const record = (id: string, target: string): ContentRecord => ({ id, kind: 'graph', owner: 'graph', schemaVersion: 1, name: id, revision: 1, dependencies: [target], body: { references: [target] } });
  const target = storageFixture();
  const cycle = createProjectPackages(target.library, [graph], { rootKind: 'graph' }).importProject(JSON.stringify({ format: 'RootSoundProject', version: 1,
    rootId: 'a', contents: [record('a', 'b'), record('b', 'a')] }));
  assert.equal(cycle.status, 'conflict'); if (cycle.status === 'conflict') assert.match(cycle.reason, /循环/);
  const source = fixture(); const unsupported = adapters().map(adapter => adapter.kind === 'rootsound.song' ? { ...adapter, validateTarget: undefined } : adapter);
  assert.equal(createProjectPackages(target.library, unsupported, { rootKind: 'rootsound.song' }).importProject(source.project.exportDraft(source.draftId).text).status, 'conflict');
  assert.equal(target.writes(), 0);
});

test('export refuses missing saved dependencies or incomplete independent editing without modifying any data', () => {
  const f = fixture(); const draft = f.library.readDraft(f.draftId)!;
  f.library.updateDraft(draft.id, { dependencies: ['missing'] }); const before = f.raw();
  assert.throws(() => f.project.exportDraft(draft.id), /缺少引用/); assert.equal(f.raw(), before);
  const g = fixture(); const current = g.library.readDraft(g.draftId)!;
  assert.equal(g.library.commitTransaction({ expectedToken: g.library.currentToken(), label: '正在独立调整',
    replaceDrafts: [{ expected: current, replacement: { ...current, editingContext: { temporary: true } } }] }).status, 'committed');
  const raw = g.raw(); assert.throws(() => g.project.exportDraft(g.draftId), /先完成或取消/); assert.equal(g.raw(), raw);
});
