import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { ContentRecord, Draft, MaterialLibrary, NewContent, SaveResult } from '../src/workstation/contracts/content.ts';
import type { ReferenceAdapter } from '../src/workstation/contracts/references.ts';
import { createMaterialLibrary, createProjectPackages, createReferenceEditing } from '../src/workstation/modules/materials/public.ts';
import { createTimbreEditor, createTimbrePlayback, createTimbreReferenceAdapter } from '../src/workstation/modules/timbre/public.ts';
import { createCoCreation, createCoCreationReferenceAdapter } from '../src/workstation/modules/co-creation/public.ts';
import { createPhrasePlayback, createPhraseReferenceAdapter, readPhraseBody } from '../src/workstation/modules/phrase/public.ts';
import { createSongEditor, createSongReferenceAdapter, readSongBody } from '../src/workstation/modules/song/public.ts';
import { createSampling, createSampleReferenceAdapter } from '../src/workstation/modules/sampling/public.ts';
import { encodeFloatWav, decodePcmWav } from '../src/workstation/modules/sampling/audio.ts';
import { createMelodyRecognition } from '../src/workstation/modules/melody-recognition/public.ts';

const adapters = () => [createTimbreReferenceAdapter(), createPhraseReferenceAdapter(), createSongReferenceAdapter()];
const options = () => ({ project: { rootKind: 'rootsound.song', adapters: adapters() } });
function saved(result: SaveResult) { assert.equal(result.status, 'saved', JSON.stringify(result)); if (result.status !== 'saved') throw Error('save'); return result; }
function save(library: MaterialLibrary, input: NewContent) { const draft = library.createDraft(input); return saved(library.saveDraft(draft.id, 'new')); }
function sound(library: MaterialLibrary, name = '木琴') { return save(library, { kind: 'rootsound.timbre', owner: 'timbre', schemaVersion: 1, name,
  body: { model: 'basic-synth', version: 1, character: 'warm', attackSeconds: 0.02, releaseSeconds: 0.5, level: 0.6 } }).content; }
function phrase(library: MaterialLibrary, timbreId: string, name = '旋律') { return save(library, { kind: 'rootsound.phrase', owner: 'phrase', schemaVersion: 1, name, dependencies: [timbreId],
  body: { model: 'note-phrase', version: 1, timeUnit: 'beat', tempoBpm: 120, lengthBeats: 4,
    parts: [{ id: crypto.randomUUID(), name: '旋律', timbreId, notes: [{ id: crypto.randomUUID(), startBeat: 0, durationBeats: 1, frequencyHz: 220, velocity: 0.7 }] }] } }).content; }
function editor(library: MaterialLibrary) { return createSongEditor(library, createPhrasePlayback(library, createTimbrePlayback(library)), { defaultTempoMode: 'source' }); }
function closure(library: MaterialLibrary, root: Draft | ContentRecord): ContentRecord[] {
  const seen = new Map<string, ContentRecord>(); const pending = [...root.dependencies];
  while (pending.length) { const id = pending.pop()!; if (seen.has(id)) continue; const content = library.readContent(id)!; assert.ok(content); seen.set(id, content); pending.push(...content.dependencies); }
  return [...seen.values()];
}
function fixture() {
  let raw: string | null = null; let broken = false;
  const storage = { read: () => raw, write(value: string) { if (broken) throw Error('disk'); raw = value; } };
  const library = createMaterialLibrary(storage, options()); const voice = sound(library); const melody = phrase(library, voice.id);
  return { library, voice, melody, storage, raw: () => raw, break: () => { broken = true; } };
}

test('new songs clone the complete source graph, preserving repeated identities inside each song', () => {
  const f = fixture(); const song = editor(f.library); song.createFromPhrase(f.melody.id, '同名歌曲'); const first = song.read().draft!;
  song.createFromPhrase(f.melody.id, '同名歌曲'); const second = song.read().draft!;
  const a = closure(f.library, first); const b = closure(f.library, second);
  assert.equal(a.length, 2); assert.equal(b.length, 2); assert.ok(!a.some(item => b.some(other => other.id === item.id)));
  assert.ok(!a.some(item => [f.voice.id, f.melody.id].includes(item.id)));
  assert.deepEqual(a.map(item => item.name).sort(), b.map(item => item.name).sort());
  song.openDraft(first.id); const part = readSongBody(first.body).tracks[0]!; const local = part.clips[0]!.phraseId;
  song.addClip(part.id, local, 4);
  assert.deepEqual(new Set(readSongBody(song.read().draft!.body).tracks[0]!.clips.map(item => item.phraseId)), new Set([local]));
  assert.equal(closure(f.library, song.read().draft!).length, 2);
});

test('adding an outside phrase clones its dependencies and preserves the public names allocated at creation', () => {
  const f = fixture(); const outsideVoice = sound(f.library); const outside = phrase(f.library, outsideVoice.id);
  const song = editor(f.library); song.createFromPhrase(f.melody.id); const first = song.read().draft!;
  const track = readSongBody(first.body).tracks[0]!; song.addClip(track.id, outside.id, 4);
  const graph = closure(f.library, song.read().draft!);
  for (const kind of ['rootsound.phrase', 'rootsound.timbre']) {
    const records = graph.filter(item => item.kind === kind); assert.equal(records.length, 2); assert.equal(new Set(records.map(item => item.name)).size, 2);
  }
  assert.equal(f.library.readContent(outside.id)!.name, '旋律 2'); assert.equal(f.library.readContent(outsideVoice.id)!.name, '木琴 2');
  assert.ok(!graph.some(item => item.id === outside.id || item.id === outsideVoice.id));
});

test('foreign song-owned materials remain isolated when explicitly added to another song', () => {
  const f = fixture(); const song = editor(f.library); song.createFromPhrase(f.melody.id); const first = song.read().draft!;
  const foreign = first.dependencies[0]!; song.create(); const current = song.read().draft!;
  song.addClip(readSongBody(current.body).tracks[0]!.id, foreign, 0);
  assert.ok(!closure(f.library, first).some(item => closure(f.library, song.read().draft!).some(other => other.id === item.id)));
});

test('repeated adoption of the same public phrase reuses one local identity across calls and restart', () => {
  const f = fixture(); const song = editor(f.library); song.createFromPhrase(f.melody.id); const initial = song.read().draft!;
  const track = readSongBody(initial.body).tracks[0]!; song.addClip(track.id, f.melody.id, 4);
  let ids = readSongBody(song.read().draft!.body).tracks[0]!.clips.map(item => item.phraseId); assert.equal(new Set(ids).size, 1);
  const restarted = createMaterialLibrary(f.storage, options()); const reopened = editor(restarted); reopened.openDraft(initial.id); reopened.addClip(track.id, f.melody.id, 8);
  ids = readSongBody(reopened.read().draft!.body).tracks[0]!.clips.map(item => item.phraseId); assert.equal(new Set(ids).size, 1);
  assert.equal(closure(restarted, reopened.read().draft!).length, 2);
});

test('a source dependency revision creates a fresh local version without changing an earlier adoption', () => {
  const f = fixture(); const song = editor(f.library); song.createFromPhrase(f.melody.id); const initial = song.read().draft!;
  const source = f.library.createDraft({ sourceId: f.voice.id }); f.library.updateDraft(source.id, { name: '新的原始声音' });
  const changed = saved(f.library.saveDraft(source.id, 'overwrite')); assert.equal(changed.content.id, f.voice.id);
  song.addClip(readSongBody(initial.body).tracks[0]!.id, f.melody.id, 4);
  const current = song.read().draft!; assert.equal(current.dependencies.length, 2);
  assert.ok(closure(f.library, initial).some(item => item.name === '木琴'));
  assert.ok(closure(f.library, current).some(item => item.name === '新的原始声音'));
});

test('saving a new song preserves its project; save as creates a fully independent project', () => {
  const f = fixture(); const song = editor(f.library); song.createFromPhrase(f.melody.id); const before = song.read().draft!;
  const first = saved(f.library.saveDraft(before.id, 'new'));
  assert.equal(f.library.projectScopeOf?.({ type: 'draft', id: before.id }), f.library.projectScopeOf?.({ type: 'content', id: first.content.id }));
  assert.deepEqual(first.content.dependencies, before.dependencies);
  const copy = saved(f.library.saveDraft(before.id, 'new'));
  const a = closure(f.library, first.content); const b = closure(f.library, copy.content);
  assert.ok(!a.some(item => b.some(other => other.id === item.id)));
  assert.deepEqual(a.map(item => item.name).sort(), b.map(item => item.name).sort());
});

test('explicit same-kind rename conflicts preserve draft and durable storage', () => {
  const f = fixture(); const other = phrase(f.library, sound(f.library, '笛子').id, '回应'); const song = editor(f.library);
  song.createFromPhrase(f.melody.id); song.addClip(readSongBody(song.read().draft!.body).tracks[0]!.id, other.id, 4);
  const graph = closure(f.library, song.read().draft!); const voices = graph.filter(item => item.kind === 'rootsound.timbre');
  const draft = f.library.createDraft({ sourceId: voices[0]!.id }); const raw = f.raw();
  assert.throws(() => f.library.updateDraft(draft.id, { name: ` ${voices[1]!.name} ` }), /同类素材/);
  assert.deepEqual(f.library.readDraft(draft.id), draft); assert.equal(f.raw(), raw);
  f.library.updateDraft(draft.id, { name: '新的音色' }); assert.equal(f.library.readDraft(draft.id)!.name, '新的音色');
});

test('names may match across kinds; normalized case and whitespace are considered within a kind', () => {
  const f = fixture(); const lead = sound(f.library, 'Lead'); const second = sound(f.library, ' lead ');
  const song = editor(f.library); song.createFromPhrase(phrase(f.library, lead.id, 'Lead').id);
  song.addClip(readSongBody(song.read().draft!.body).tracks[0]!.id, phrase(f.library, second.id, 'Different').id, 4);
  const graph = closure(f.library, song.read().draft!); assert.ok(graph.some(item => item.kind === 'rootsound.phrase' && item.name === 'Lead'));
  assert.equal(new Set(graph.filter(item => item.kind === 'rootsound.timbre').map(item => item.name.toLowerCase())).size, 2);
});

test('ordinary occurrence edits get distinct names for leaf and intermediate forks, with durable undo', () => {
  const f = fixture(); const song = editor(f.library); song.createFromPhrase(f.melody.id); const original = song.read().draft!;
  const track = readSongBody(original.body).tracks[0]!; song.addClip(track.id, original.dependencies[0]!, 4);
  const before = song.read().draft!; const body = readSongBody(before.body); const phraseId = body.tracks[0]!.clips[0]!.phraseId;
  const source = f.library.readContent(phraseId)!; const partId = readPhraseBody(source.body).parts[0]!.id;
  const refs = createReferenceEditing(f.library, adapters()); const session = refs.begin({ root: { type: 'draft', id: before.id }, path: [body.tracks[0]!.clips[0]!.id, partId] });
  const draft = f.library.readDraft(session.draftId)!; f.library.updateDraft(draft.id, { body: { ...(draft.body as object), level: 0.2 } as never });
  const result = refs.apply(session.draftId); assert.equal(result.status, 'applied', JSON.stringify(result));
  const graph = closure(f.library, f.library.readDraft(before.id)!);
  for (const kind of ['rootsound.phrase', 'rootsound.timbre']) { const names = graph.filter(item => item.kind === kind).map(item => item.name); assert.equal(names.length, 2); assert.equal(new Set(names).size, 2); }
  const reopened = createMaterialLibrary(f.storage, options()); reopened.travelDraft(before.id, 'undo', reopened.readDraft(before.id)!);
  assert.deepEqual(reopened.readDraft(before.id)!.dependencies, before.dependencies);
  const again = createMaterialLibrary(f.storage, options()); again.travelDraft(before.id, 'redo', again.readDraft(before.id)!);
  assert.equal(closure(again, again.readDraft(before.id)!).length, 4);
});

test('portable import creates an independent scope and leaves the original project intact', () => {
  const f = fixture(); const song = editor(f.library); song.createFromPhrase(f.melody.id); const original = song.read().draft!;
  const packages = createProjectPackages(f.library, adapters(), { rootKind: 'rootsound.song' }); const exported = packages.exportDraft(original.id);
  const imported = packages.importProject(exported.text); assert.equal(imported.status, 'imported'); if (imported.status !== 'imported') return;
  assert.deepEqual(imported.content, f.library.readContent(imported.content.id)); assert.deepEqual(imported.draft, f.library.readDraft(imported.draft.id));
  assert.ok(!closure(f.library, original).some(item => closure(f.library, imported.draft).some(other => other.id === item.id)));
});

test('scope queries exclude foreign owned entities while keeping public starting materials', () => {
  const f = fixture(); const song = editor(f.library); song.createFromPhrase(f.melody.id); const first = song.read().draft!;
  song.createFromPhrase(f.melody.id); const second = song.read().draft!; const visible = f.library.listContentInfoForDraft?.(first.id);
  assert.ok(visible); assert.ok(!visible.some(item => item.id === f.melody.id));
  assert.ok(closure(f.library, first).every(item => visible.some(record => record.id === item.id)));
  assert.ok(closure(f.library, second).every(item => !visible.some(record => record.id === item.id)));
  const restarted = createMaterialLibrary(f.storage, options()); assert.deepEqual(restarted.listContentInfoForDraft?.(first.id), visible);
});

test('a project picker hides adopted public origins, retaining its local material and unused public choices', () => {
  const f = fixture(); const unused = phrase(f.library, sound(f.library, '可用声音').id, '可用起点');
  const songs = editor(f.library); songs.createFromPhrase(f.melody.id); const root = songs.read().draft!;
  const visible = f.library.listContentInfoForDraft!(root.id);
  assert.ok(!visible.some(item => item.id === f.melody.id || item.id === f.voice.id));
  assert.ok(visible.some(item => item.id === unused.id));
  assert.ok(closure(f.library, root).every(item => visible.some(choice => choice.id === item.id)));
  assert.equal(visible.filter(item => item.kind === 'rootsound.phrase' && item.name === '旋律').length, 1);
});

test('retained project materials reserve names after removal from the current arrangement', () => {
  const f = fixture(); const song = editor(f.library); song.createFromPhrase(f.melody.id); const initial = song.read().draft!;
  const oldPhrase = initial.dependencies[0]!; const initialClip = readSongBody(initial.body).tracks[0]!.clips[0]!;
  song.removeClip(readSongBody(initial.body).tracks[0]!.id, initialClip.id);
  const outside = phrase(f.library, sound(f.library, '另一个声音').id);
  song.addClip(readSongBody(initial.body).tracks[0]!.id, outside.id, 0);
  const current = song.read().draft!; const newPhrase = f.library.readContent(current.dependencies[0]!)!;
  assert.equal(f.library.readContent(oldPhrase)!.name, '旋律'); assert.equal(newPhrase.name, '旋律 2');
  const edit = f.library.createDraft({ sourceId: newPhrase.id });
  assert.throws(() => f.library.updateDraft(edit.id, { name: '旋律' }), /同类素材/);
});

test('an explicit rename cannot collide with a material used only by the saved project version', () => {
  const f = fixture(); const song = editor(f.library); song.createFromPhrase(f.melody.id); const root = song.read().draft!;
  const first = saved(f.library.saveDraft(root.id, 'new')); const savedPhrase = first.content.dependencies[0]!;
  const body = readSongBody(first.draft.body); song.removeClip(body.tracks[0]!.id, body.tracks[0]!.clips[0]!.id);
  song.addClip(body.tracks[0]!.id, phrase(f.library, sound(f.library, '别的声音').id, '回应').id, 0);
  const newPhrase = song.read().draft!.dependencies[0]!; const edit = f.library.createDraft({ sourceId: newPhrase });
  assert.throws(() => f.library.updateDraft(edit.id, { name: f.library.readContent(savedPhrase)!.name }), /同类素材/);
});

test('project isolation returns the final disambiguated content from an occurrence edit', () => {
  const f = fixture(); const song = editor(f.library); song.createFromPhrase(f.melody.id); const root = song.read().draft!;
  const body = readSongBody(root.body); song.addClip(body.tracks[0]!.id, root.dependencies[0]!, 4);
  const refs = createReferenceEditing(f.library, adapters()); const session = refs.begin({ root: { type: 'draft', id: root.id }, path: [body.tracks[0]!.clips[0]!.id] });
  const draft = f.library.readDraft(session.draftId)!; const changed = readPhraseBody(draft.body); changed.parts[0]!.notes[0]!.frequencyHz = 440;
  f.library.updateDraft(draft.id, { body: changed }); const result = refs.apply(draft.id); assert.equal(result.status, 'applied'); if (result.status !== 'applied') return;
  assert.equal(result.content.name, '旋律 2'); assert.deepEqual(result.content, f.library.readContent(result.content.id));
});

test('nested joint edits keep final local names in staged snapshots and publish after restart', () => {
  const f = fixture(); const songs = editor(f.library); songs.createFromPhrase(f.melody.id); const root = songs.read().draft!;
  const track = readSongBody(root.body).tracks[0]!; songs.addClip(track.id, root.dependencies[0]!, 4);
  const clips = readSongBody(songs.read().draft!.body).tracks[0]!.clips;
  const manager = createReferenceEditing(f.library, adapters()); const outer = manager.begin({ root: { type: 'draft', id: root.id }, path: [clips[0]!.id] });
  const parent = f.library.readDraft(outer.draftId)!; const part = readPhraseBody(parent.body).parts[0]!;
  const inner = manager.begin({ root: { type: 'draft', id: parent.id }, path: [part.id] });
  const working = f.library.readDraft(inner.draftId)!; f.library.updateDraft(working.id, { body: { ...(working.body as object), level: 0.17 } as never });
  const places = manager.locations(inner.draftId); const chosen = places.locations.filter(item => item.current || item.root.id === root.id && item.path[0] === clips[1]!.id);
  assert.equal(chosen.length, 2); const staged = manager.apply(inner.draftId, { locationIds: chosen.map(item => item.id), expectedToken: places.token });
  assert.equal(staged.status, 'applied', JSON.stringify(staged)); if (staged.status !== 'applied') return;
  assert.equal(staged.content.name, '木琴 2'); assert.equal(staged.staged, true);
  const restart = createMaterialLibrary(f.storage, options()); const resumed = createReferenceEditing(restart, adapters());
  const applied = resumed.apply(parent.id); assert.equal(applied.status, 'applied', JSON.stringify(applied));
  const current = restart.readDraft(root.id)!; const voices = closure(restart, current).filter(item => item.kind === 'rootsound.timbre');
  assert.equal(voices.length, 1); assert.equal((voices[0]!.body as { level: number }).level, 0.17);
  assert.deepEqual(restart.listContentInfoForDraft!(root.id).filter(item => item.kind === 'rootsound.timbre').map(item => item.id), voices.map(item => item.id));
});

test('legacy libraries load untouched; editing one legacy song isolates it without changing the other', () => {
  let raw: string | null = null; const storage = { read: () => raw, write(value: string) { raw = value; } };
  const old = createMaterialLibrary(storage); const shared = phrase(old, sound(old).id); const songs = editor(old);
  songs.createFromPhrase(shared.id); const first = saved(old.saveDraft(songs.read().draft!.id, 'new'));
  songs.createFromPhrase(shared.id); const second = saved(old.saveDraft(songs.read().draft!.id, 'new'));
  const snapshot = raw; const library = createMaterialLibrary(storage, options()); assert.equal(raw, snapshot);
  library.updateDraft(first.draft.id, { name: '新版歌曲' }); const current = library.readDraft(first.draft.id)!;
  assert.ok(!closure(library, current).some(item => closure(library, second.content).some(other => other.id === item.id)));
  assert.deepEqual(library.readContent(second.content.id), second.content);
});

test('legacy cross-song joint apply produces isolated copies and its exact journal survives restart', () => {
  let raw: string | null = null; const storage = { read: () => raw, write(value: string) { raw = value; } };
  const legacy = createMaterialLibrary(storage); const shared = phrase(legacy, sound(legacy).id); const songs = editor(legacy);
  songs.createFromPhrase(shared.id); const first = saved(legacy.saveDraft(songs.read().draft!.id, 'new'));
  songs.createFromPhrase(shared.id); const second = saved(legacy.saveDraft(songs.read().draft!.id, 'new'));
  const library = createMaterialLibrary(storage, options()); const refs = createReferenceEditing(library, adapters());
  const clipId = readSongBody(first.draft.body).tracks[0]!.clips[0]!.id;
  const session = refs.begin({ root: { type: 'draft', id: first.draft.id }, path: [clipId] });
  const working = library.readDraft(session.draftId)!; const music = readPhraseBody(working.body); music.parts[0]!.notes[0]!.frequencyHz = 440;
  library.updateDraft(working.id, { body: music }); const places = refs.locations(working.id);
  const selected = places.locations.filter(item => item.current || item.root.id === second.content.id);
  const result = refs.apply(working.id, { locationIds: selected.map(item => item.id), expectedToken: places.token });
  assert.equal(result.status, 'applied', JSON.stringify(result));
  const a = closure(library, library.readDraft(first.draft.id)!); const b = closure(library, library.readContent(second.content.id)!);
  assert.ok(!a.some(item => b.some(other => other.id === item.id)));
  assert.ok([...a, ...b].filter(item => item.kind === 'rootsound.phrase').every(item => readPhraseBody(item.body).parts[0]!.notes[0]!.frequencyHz === 440));
  const after = raw; const restart = createMaterialLibrary(storage, options()); restart.travelDraft(first.draft.id, 'undo', restart.readDraft(first.draft.id)!);
  assert.deepEqual(restart.readContent(second.content.id), second.content);
  const redo = createMaterialLibrary(storage, options()); redo.travelDraft(first.draft.id, 'redo', redo.readDraft(first.draft.id)!); assert.equal(raw, after);
});

test('an old shared saved identity is forked instead of overwritten across multiple projects', () => {
  let raw: string | null = null; const storage = { read: () => raw, write(value: string) { raw = value; } };
  const legacy = createMaterialLibrary(storage); const voice = sound(legacy); const shared = phrase(legacy, voice.id); const songs = editor(legacy);
  songs.createFromPhrase(shared.id); songs.createFromPhrase(shared.id);
  const library = createMaterialLibrary(storage, options()); const working = library.createDraft({ sourceId: voice.id });
  library.updateDraft(working.id, { name: '修改过的声音' }); const result = saved(library.saveDraft(working.id, 'overwrite'));
  assert.notEqual(result.content.id, voice.id);
  assert.deepEqual(library.readContent(voice.id), voice);
});

test('an isolation storage failure keeps the entire original graph and scope map unchanged', () => {
  const f = fixture(); const song = editor(f.library); song.createFromPhrase(f.melody.id); const first = song.read().draft!; const before = f.raw();
  f.break(); assert.throws(() => song.createFromPhrase(f.melody.id), /写入失败/); assert.equal(f.raw(), before); assert.deepEqual(f.library.readDraft(first.id), first);
});

test('raw source assets also get project-local identities while retaining exact source bytes', () => {
  const rawAdapter: ReferenceAdapter = { kind: 'test.raw', slots: () => [], replace: record => ({ body: record.body, dependencies: [] }) };
  const phraseAdapter: ReferenceAdapter = { kind: 'test.phrase', slots: record => record.dependencies.map(id => ({ id, targetId: id, label: id })),
    replace: (record, uses) => ({ body: record.body, dependencies: uses.map(item => item.targetId) }) };
  const songAdapter: ReferenceAdapter = { ...phraseAdapter, kind: 'test.song' };
  const library = createMaterialLibrary(undefined, { project: { rootKind: 'test.song', adapters: [rawAdapter, phraseAdapter, songAdapter] } });
  const raw = save(library, { kind: 'test.raw', owner: 'raw', schemaVersion: 1, name: '录音', body: { bytes: 'AP8BAgM=' } }).content;
  const source = save(library, { kind: 'test.phrase', owner: 'phrase', schemaVersion: 1, name: '旋律', dependencies: [raw.id], body: {} }).content;
  const one = library.createDraft({ kind: 'test.song', owner: 'song', schemaVersion: 1, name: 'A', dependencies: [source.id], body: {} });
  const two = library.createDraft({ kind: 'test.song', owner: 'song', schemaVersion: 1, name: 'B', dependencies: [source.id], body: {} });
  const a = closure(library, one).find(item => item.kind === 'test.raw')!; const b = closure(library, two).find(item => item.kind === 'test.raw')!;
  assert.notEqual(a.id, b.id); assert.deepEqual(a.body, raw.body); assert.deepEqual(b.body, raw.body);
});

test('independent public drafts get distinct names, while a saved item and its working draft count once', () => {
  const f = fixture(); const timbre = createTimbreEditor(f.library);
  timbre.create(); const first = timbre.read().draft; timbre.create(); const second = timbre.read().draft;
  assert.equal(first.name, '我的第一个声音'); assert.equal(second.name, '我的第一个声音 2');
  const original = saved(f.library.saveDraft(second.id, 'new')); assert.equal(original.content.name, second.name);
  assert.equal(original.draft.name, original.content.name);
  const alias = f.library.createDraft({ sourceId: original.content.id }); assert.equal(alias.name, original.content.name);
  const reopen = createMaterialLibrary(f.storage, options());
  const copy = saved(reopen.saveDraft(alias.id, 'new')); assert.equal(copy.content.name, '我的第一个声音 2 2');
  assert.equal(copy.draft.name, copy.content.name); assert.notEqual(copy.content.id, original.content.id);
  assert.equal(reopen.readContent(original.content.id)!.name, original.content.name);
});

test('explicit public renames reject normalized same-kind names without discarding edits or writing storage', () => {
  const f = fixture(); const first = sound(f.library, 'Lead'); const next = sound(f.library, 'Other');
  const draft = f.library.createDraft({ sourceId: next.id }); const current = f.library.updateDraft(draft.id, { body: { ...draft.body as object, level: 0.13 } as never });
  const raw = f.raw(); assert.throws(() => f.library.updateDraft(draft.id, { name: '  lead  ' }), /公共素材.*同类素材/);
  assert.equal(f.raw(), raw); assert.deepEqual(f.library.readDraft(draft.id), current);
  const newDraft = f.library.createDraft({ kind: first.kind, owner: first.owner, schemaVersion: first.schemaVersion, name: '第三份', body: first.body });
  assert.throws(() => f.library.updateDraft(newDraft.id, { name: first.name }), /公共素材.*同类素材/);
  const sameKindNames = f.library.listContentInfo().filter(item => item.kind === first.kind).map(item => item.name.toLowerCase());
  assert.equal(new Set(sameKindNames).size, sameKindNames.length);
});

test('public names are independent of song scopes and may still match across content kinds', () => {
  const f = fixture(); const songs = editor(f.library); songs.createFromPhrase(f.melody.id); const first = songs.read().draft!;
  songs.createFromPhrase(f.melody.id); const second = songs.read().draft!;
  assert.ok(closure(f.library, first).some(item => item.name === f.voice.name));
  assert.ok(closure(f.library, second).some(item => item.name === f.voice.name));
  const matchingPhrase = phrase(f.library, f.voice.id, f.voice.name); assert.equal(matchingPhrase.name, f.voice.name);
  const next = sound(f.library); assert.equal(next.name, '木琴 2');
  assert.ok(!closure(f.library, first).some(item => item.id === next.id));
});

test('public copies and imported starting drafts receive numeric names, with manual copy names rejected', () => {
  const f = fixture(); const first = f.library.duplicateContent(f.voice.id); assert.equal(first.status, 'saved'); if (first.status !== 'saved') return;
  const second = f.library.duplicateContent(f.voice.id); assert.equal(second.status, 'saved'); if (second.status !== 'saved') return;
  assert.equal(first.content.name, '木琴 副本'); assert.equal(second.content.name, '木琴 副本 2');
  const raw = f.raw(); const conflict = f.library.duplicateContent(f.voice.id, '木琴'); assert.equal(conflict.status, 'conflict'); assert.equal(f.raw(), raw);
  const timbre = createTimbreEditor(f.library); timbre.open(f.voice.id); const text = timbre.exportSound();
  timbre.importSound(text); assert.equal(timbre.read().draft.name, '木琴 2');
  const imported = timbre.save('new'); assert.equal(imported.status, 'saved'); if (imported.status !== 'saved') return;
  assert.equal(imported.content.name, '木琴 2'); assert.equal(imported.draft.name, imported.content.name);
});

test('generated co-creation graphs stay unique in public custody and manual result renames are exact or rejected', () => {
  let raw: string | null = null; const storage = { read: () => raw, write(value: string) { raw = value; } };
  const configuration = { project: { rootKind: 'rootsound.song', adapters: [...adapters(), createCoCreationReferenceAdapter()] } };
  const library = createMaterialLibrary(storage, configuration); const first = createCoCreation(library);
  first.chooseIdea('calm', first.read().token); const firstResult = first.read().currentPhrase!;
  const second = createCoCreation(library); second.start(); second.chooseIdea('calm', second.read().token);
  assert.notEqual(second.read().currentPhrase!.name, firstResult.name);
  for (const kind of ['rootsound.timbre', 'rootsound.phrase']) {
    const names = library.listContentInfo().filter(record => record.kind === kind).map(record => record.name); assert.equal(new Set(names).size, names.length);
  }
  const before = raw; const current = second.read(); assert.throws(() => second.renameCurrent(firstResult.name, current.token), /公共素材.*同类素材/);
  assert.equal(raw, before); assert.deepEqual(second.read(), current);
  second.renameCurrent('独立名称', current.token); assert.equal(second.read().currentPhrase!.name, '独立名称');
  const reopened = createMaterialLibrary(storage, configuration); const again = createCoCreation(reopened); again.openDraft(current.draft.id);
  again.undo(); assert.equal(again.read().currentPhrase!.name, current.currentPhrase!.name);
  again.redo(); assert.equal(again.read().currentPhrase!.name, '独立名称');
});

test('legacy public names stay unchanged on read but a new public sound cannot add another duplicate', () => {
  let raw: string | null = null; const storage = { read: () => raw, write(value: string) { raw = value; } };
  const legacy = createMaterialLibrary(storage); sound(legacy); sound(legacy); const before = raw;
  const library = createMaterialLibrary(storage, options()); assert.equal(raw, before);
  const next = sound(library); assert.equal(next.name, '木琴 2');
  assert.equal(library.listContentInfo().filter(item => item.name === '木琴').length, 2);
});

test('redo refuses to restore a public name taken by another entity after undo, preserving the complete library', () => {
  let raw: string | null = null; const storage = { read: () => raw, write(value: string) { raw = value; } };
  const library = createMaterialLibrary(storage, { project: { rootKind: 'rootsound.song', adapters: [...adapters(), createCoCreationReferenceAdapter()] } });
  const co = createCoCreation(library); co.chooseIdea('calm', co.read().token); co.renameCurrent('再见', co.read().token);
  co.undo(); const current = co.read(); const outside = phrase(library, library.listContentInfo().find(item => item.kind === 'rootsound.timbre')!.id, '再见');
  const before = raw; assert.throws(() => co.redo(), /公共素材.*同类素材/);
  assert.equal(raw, before); assert.equal(co.read().currentPhrase!.id, current.currentPhrase!.id); assert.deepEqual(library.readContent(outside.id), outside);
});

test('repeat humming adoption returns final unique names, and a supplied conflicting name leaves the result adoptable', async () => {
  const f = fixture(); const audio = { sampleRate: 8000, channels: [new Float32Array(8000)] };
  const recognition = createMelodyRecognition(f.library, { currentSourceToken: () => 'voice', analyzer: { async analyze() {
    return { durationSeconds: 1, channelIndex: 0, coverage: 0.5, warnings: [],
      notes: [{ startSeconds: 0, durationSeconds: 0.5, frequencyHz: 220, velocity: 0.7, confidence: 0.9 }] };
  } } });
  const input = { audio, sourceToken: 'voice', sourceName: '哼唱' }; await recognition.analyze(input); const first = recognition.adopt();
  await recognition.analyze(input); const second = recognition.adopt();
  assert.equal(first.content.name, '哼唱 · 旋律'); assert.equal(second.content.name, '哼唱 · 旋律 2');
  assert.equal(second.draft.name, second.content.name); assert.deepEqual(second.content, f.library.readContent(second.content.id));
  assert.equal(f.library.readContent(second.content.dependencies[0]!)!.name, '识别旋律的声音 2');
  await recognition.analyze(input); const before = f.raw(); assert.throws(() => recognition.adopt(first.content.name), /公共素材.*同类素材/);
  assert.equal(f.raw(), before); assert.equal(recognition.read().phase, 'ready');
  const third = recognition.adopt('另一次哼唱'); assert.equal(third.content.name, '另一次哼唱');
});

test('default sample saves use their committed unique names while explicit duplicate names preserve pending audio', async () => {
  const library = createMaterialLibrary(undefined, { project: { rootKind: 'rootsound.song', adapters: [...adapters(), createSampleReferenceAdapter()] } });
  const audio = { sampleRate: 8000, channels: [new Float32Array([0.1, -0.2, 0.3])] }; const bytes = encodeFloatWav(audio);
  const sampling = createSampling(library, { files: { async open() { return { status: 'opened', name: '声音.wav', mimeType: 'audio/wav', bytes }; } },
    decoder: { async decode(input) { return decodePcmWav(input)!; } }, capture: { async start() { throw Error('no recording'); }, cancel() {} } });
  await sampling.importFile(); const first = sampling.save(); await sampling.importFile(); const second = sampling.save();
  assert.equal(first.name, '声音.wav'); assert.equal(second.name, '声音.wav 2'); assert.equal(sampling.read().name, second.name);
  assert.equal(sampling.read().changed, false); assert.equal(sampling.save().id, second.id);
  await sampling.importFile(); sampling.rename(first.name); const before = library.currentToken(); const pending = sampling.previewAudio();
  assert.throws(() => sampling.save(), /公共素材.*同类素材/); assert.equal(library.currentToken(), before); assert.deepEqual(sampling.previewAudio(), pending);
  assert.equal(sampling.read().name, first.name); assert.equal(sampling.read().changed, true);
  sampling.rename('我的采样'); assert.equal(sampling.save().name, '我的采样');
});
