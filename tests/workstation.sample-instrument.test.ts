import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { ContentRecord, JsonValue, MaterialLibrary } from '../src/workstation/contracts/content.ts';
import type { PcmAudio } from '../src/workstation/contracts/sound.ts';
import { createMaterialLibrary, createReferenceEditing, createProjectPackages } from '../src/workstation/modules/materials/public.ts';
import { createSampleAudio, createSampleReferenceAdapter } from '../src/workstation/modules/sampling/public.ts';
import { encodeBase64, encodeFloatWav, decodePcmWav } from '../src/workstation/modules/sampling/audio.ts';
import { createTimbreEditor, createTimbrePlayback, createTimbreReferenceAdapter, readSampleTimbreBody } from '../src/workstation/modules/timbre/public.ts';
import { createPhraseEditor, createPhrasePlayback, createPhraseReferenceAdapter, readPhraseBody } from '../src/workstation/modules/phrase/public.ts';
import { createSongEditor, createSongReferenceAdapter } from '../src/workstation/modules/song/public.ts';
import { createCoCreation, createCoCreationReferenceAdapter } from '../src/workstation/modules/co-creation/public.ts';

function pcm(frames = 8000): PcmAudio { return { sampleRate: 8000, channels: [Float32Array.from({ length: frames }, (_, i) => Math.sin(i / 5) * 0.3)] }; }
function source(id = 'sample', audio = pcm()): ContentRecord {
  const bytes = encodeFloatWav(audio);
  return { id, kind: 'rootsound.sample', owner: 'sampling', schemaVersion: 1, revision: 1, name: id, dependencies: [],
    body: { model: 'audio-sample', version: 1, source: { kind: 'file', name: `${id}.wav`, mimeType: 'audio/wav' },
      audio: { encoding: 'base64', byteLength: bytes.length, data: encodeBase64(bytes) },
      decoded: { sampleRate: audio.sampleRate, channels: audio.channels.length, frames: audio.channels[0]!.length, durationSeconds: audio.channels[0]!.length / audio.sampleRate } } };
}
function store(contents: ContentRecord[]) {
  let text = JSON.stringify({ format: 'RootSoundMaterialLibrary', version: 1, contents, drafts: [] }); let writes = 0; let failing = false;
  const storage = { read: () => text, write(value: string) { if (failing) throw new Error('disk full'); text = value; writes++; } };
  return { library: createMaterialLibrary(storage), storage, writes: () => writes, fail(value: boolean) { failing = value; } };
}
const decoder = { async decode(bytes: Uint8Array) { const audio = decodePcmWav(bytes); assert(audio); return audio; } };
function replace(library: MaterialLibrary, before: ContentRecord, changes: Partial<ContentRecord> = {}): ContentRecord {
  const replacement = { ...before, ...changes, revision: before.revision + 1 };
  const result = library.commitTransaction({ expectedToken: library.currentToken(), label: 'test source update', replaceContents: [{ expected: before, replacement }] });
  assert.equal(result.status, 'committed'); return replacement;
}
function savedVoice(editor: ReturnType<typeof createTimbreEditor>): ContentRecord {
  const result = editor.save('new'); assert.equal(result.status, 'saved'); if (result.status !== 'saved') throw new Error('Expected saved'); return result.content;
}
function gate<T>() { let resolve!: (value: T) => void; const promise = new Promise<T>(r => { resolve = r; }); return { promise, resolve }; }

test('sample preparation shares concurrent decodes, keeps unrelated prepared sources and performs no persistent writes', async () => {
  const f = store([source('a'), source('b')]); let calls = 0;
  const audio = createSampleAudio(f.library, { async decode(bytes) { calls++; return decoder.decode(bytes); } });
  await Promise.all([audio.prepare(['a', 'a']), audio.prepare(['a', 'b'])]);
  assert.equal(calls, 2); const a = audio.readPrepared('a'); const b = audio.readPrepared('b');
  f.library.createDraft({ kind: 'other', owner: 'other', schemaVersion: 1, name: 'unrelated', body: {} });
  const writes = f.writes(); await audio.prepare(['a']);
  assert.equal(calls, 2); assert.equal(audio.readPrepared('a').audio, a.audio); assert.equal(audio.readPrepared('b').audio, b.audio);
  assert.equal(f.writes(), writes); assert.equal(a.audio.sampleRate, 8000); assert(a.waveform.length > 0);
});

test('prepared PCM rejects mismatching codec clocks, frame lengths and nonfinite values, then can retry', async () => {
  const f = store([source()]); let mode = 0;
  const audio = createSampleAudio(f.library, { async decode(bytes) {
    const original = await decoder.decode(bytes);
    if (mode === 0) return { ...original, sampleRate: 16000 };
    if (mode === 1) return pcm(7999);
    if (mode === 2) { original.channels[0]![0] = NaN; return original; }
    return original;
  } });
  for (mode = 0; mode < 3; mode++) {
    await assert.rejects(audio.prepare(['sample']), /不一致|非有限/); assert.throws(() => audio.readPrepared('sample'), /尚未准备/);
  }
  await audio.prepare(['sample']); assert.equal(audio.readPrepared('sample').audio.channels[0]!.length, 8000); assert.equal(f.writes(), 0);
});

test('a source revision changing during codec work rejects its late PCM and invalidates old prepared values', async () => {
  const original = source(); const f = store([original]); const wait = gate<PcmAudio>(); let first = true;
  const audio = createSampleAudio(f.library, { async decode(bytes) { if (first) { first = false; return wait.promise; } return decoder.decode(bytes); } });
  const work = audio.prepare(['sample']); await Promise.resolve();
  replace(f.library, original, { name: 'changed' }); wait.resolve(pcm());
  await assert.rejects(work, /发生变化/); assert.throws(() => audio.readPrepared('sample'), /尚未准备/);
  await audio.prepare(['sample']); assert.equal(audio.readPrepared('sample').revision, 2);
  replace(f.library, f.library.readContent('sample')!, { name: 'another change' });
  assert.throws(() => audio.readPrepared('sample'), /尚未准备/);
});

test('the whole parallel preparation working set is rejected before decoding when declared PCM exceeds 512 MiB', async () => {
  const contents = Array.from({ length: 11 }, (_, index) => String(index)).map(id => {
    const record = source(id); const body = record.body as { [key: string]: JsonValue };
    body.decoded = { sampleRate: 32000, channels: 4, frames: 3 * 1024 * 1024, durationSeconds: 3 * 1024 * 1024 / 32000 };
    return record;
  });
  const f = store(contents); let calls = 0;
  const audio = createSampleAudio(f.library, { async decode() { calls++; return pcm(); } });
  const results = await Promise.allSettled(contents.map(record => audio.prepare([record.id])));
  assert(results.every(result => result.status === 'rejected' && /512 MiB/.test(String(result.reason))));
  assert.equal(calls, 0); assert.equal(f.writes(), 0);
});

test('sample cache evicts only sources outside a requested working set and prepares evicted sources again explicitly', async () => {
  const frames = 3 * 1024 * 1024;
  const contents = Array.from({ length: 11 }, (_, index) => String(index)).map(id => {
    const record = source(id); (record.body as { [key: string]: JsonValue }).decoded = { sampleRate: 32000, channels: 4, frames, durationSeconds: frames / 32000 }; return record;
  });
  const f = store(contents); let calls = 0;
  const audio = createSampleAudio(f.library, { async decode() { calls++; return { sampleRate: 32000, channels: Array.from({ length: 4 }, () => new Float32Array(frames)) }; } });
  await audio.prepare(Array.from({ length: 10 }, (_, i) => String(i))); assert.equal(calls, 10);
  await audio.prepare(['9', '10']); assert.equal(calls, 11);
  assert.equal(audio.readPrepared('9').audio.channels.length, 4); assert.equal(audio.readPrepared('10').revision, 1);
  assert.throws(() => audio.readPrepared('0'), /尚未准备/);
  await audio.prepare(['0']); assert.equal(calls, 12); assert.equal(audio.readPrepared('0').revision, 1); assert.equal(f.writes(), 0);
});

test('sample handoff retries reuse an unchanged draft but retain edited drafts and never alter the original sample', async () => {
  const original = source(); const f = store([original]); const audio = createSampleAudio(f.library, decoder); const editor = createTimbreEditor(f.library, audio);
  await editor.createFromSample('sample'); const first = editor.read().draft;
  await editor.createFromSample('sample'); assert.equal(editor.read().draft.id, first.id);
  editor.setSampleRange(0.123456789, 0.876543219); editor.setRootFrequency(234.123456789); editor.setEnvelope(0.11, 0.27); editor.setLevel(0.49);
  const changed = editor.read().draft; await editor.createFromSample('sample');
  assert.notEqual(editor.read().draft.id, changed.id); assert.deepEqual(f.library.readDraft(changed.id), changed);
  editor.openDraft(changed.id); const body = editor.read().body; assert.equal(body.model, 'sample-instrument');
  if (body.model !== 'sample-instrument') throw new Error('Expected sampled instrument');
  assert.equal(body.rootFrequencyHz, 234.123456789); assert.equal(body.startSeconds, 0.123456789);
  assert.deepEqual(f.library.readContent('sample'), original); assert.throws(() => editor.setCharacter('clear'), /不能切换/);
  assert.throws(() => editor.setSampleRange(0, 2), /超出原始/); assert.deepEqual(editor.read().draft, changed);
  assert.throws(() => editor.exportSound(), /外部依赖/);
});

test('late sample decode cannot create or activate a new draft after the editor opens another sound', async () => {
  const f = store([source()]); const wait = gate<PcmAudio>();
  const audio = createSampleAudio(f.library, { async decode() { return wait.promise; } }); const editor = createTimbreEditor(f.library, audio);
  const old = editor.read().draft; const work = editor.createFromSample('sample'); await Promise.resolve();
  editor.create(); const latest = editor.read().draft; const count = f.library.listDrafts().length;
  editor.openDraft(old.id); wait.resolve(pcm()); await assert.rejects(work, /切换到另一份/);
  assert.equal(editor.read().draft.id, old.id); assert.equal(f.library.listDrafts().length, count); assert(f.library.readDraft(latest.id));
});

test('aborting a sample handoff on workspace departure preserves the active draft even without another editor operation', async () => {
  const f = store([source()]); const wait = gate<PcmAudio>();
  const audio = createSampleAudio(f.library, { async decode() { return wait.promise; } }); const editor = createTimbreEditor(f.library, audio);
  const old = editor.read().draft; const count = f.library.listDrafts().length; const abort = new AbortController();
  const work = editor.createFromSample('sample', abort.signal); await Promise.resolve();
  abort.abort(); wait.resolve(pcm());
  await assert.rejects(work, { name: 'AbortError' });
  assert.deepEqual(editor.read().draft, old); assert.equal(f.library.listDrafts().length, count);
  assert.equal(audio.readPrepared('sample').revision, 1, 'cancelled handoff may still warm a reusable decoded cache');
  await editor.createFromSample('sample'); const completed = editor.read().draft; editor.create(); const latest = editor.read().draft;
  const initiallyAborted = new AbortController(); initiallyAborted.abort();
  await assert.rejects(editor.createFromSample('sample', initiallyAborted.signal), { name: 'AbortError' });
  assert.equal(editor.read().draft.id, latest.id); assert(f.library.readDraft(completed.id));
});

test('failed sample decode or failed draft persistence leaves the existing sound active and permits a clean retry', async () => {
  const f = store([source()]); let codecFails = true;
  const audio = createSampleAudio(f.library, { async decode(bytes) { if (codecFails) throw new Error('codec failed'); return decoder.decode(bytes); } });
  const editor = createTimbreEditor(f.library, audio); const old = editor.read().draft; const count = f.library.listDrafts().length;
  await assert.rejects(editor.createFromSample('sample'), /codec failed/); assert.deepEqual(editor.read().draft, old);
  codecFails = false; f.fail(true); await assert.rejects(editor.createFromSample('sample'), /disk full/);
  assert.equal(editor.read().draft.id, old.id); assert.equal(f.library.listDrafts().length, count);
  f.fail(false); await editor.createFromSample('sample'); assert.notEqual(editor.read().draft.id, old.id); assert.equal(editor.read().body.model, 'sample-instrument');
});

test('cold sampled voices can be edited and saved without decoding; plans explicitly require prepared audio and preserve float pitch', async () => {
  const f = store([source()]); const editor = createTimbreEditor(f.library, createSampleAudio(f.library, decoder));
  await editor.createFromSample('sample'); editor.setSampleRange(0.1, 0.8); editor.setRootFrequency(233.123456789); const voice = savedVoice(editor);
  let coldText = f.storage.read();
  const cold = createTimbreEditor(createMaterialLibrary({ read: () => coldText, write(value) { coldText = value; } }));
  cold.open(voice.id); cold.rename('offline edit'); savedVoice(cold);
  const unprepared = createSampleAudio(f.library, decoder); const sounds = createTimbrePlayback(f.library, unprepared);
  assert.equal(sounds.readSaved(voice.id).body.model, 'sample-instrument'); assert.throws(() => sounds.planForSaved(voice.id, { frequencyHz: 440, holdSeconds: 0.5, velocity: 0.8 }), /尚未准备/);
  await sounds.prepareForSaved(voice.id); const plan = sounds.planForSaved(voice.id, { frequencyHz: 440.123456789, holdSeconds: 0.5, velocity: 0.8 });
  assert.equal(plan.kind, 'sample'); if (plan.kind !== 'sample') throw new Error('Expected sample');
  assert.equal(plan.playbackRate, 440.123456789 / 233.123456789); assert.equal(plan.startSeconds, 0.1); assert.equal(plan.source.id, 'sample');
  assert.equal(plan.source.audio, unprepared.readPrepared('sample').audio);
  assert.throws(() => sounds.planForSaved(voice.id, { frequencyHz: 0, holdSeconds: 0.5, velocity: 0.8 }), /超出/);
  editor.setRootFrequency(5000); const extreme = savedVoice(editor); await sounds.prepareForSaved(extreme.id);
  assert.throws(() => sounds.planForSaved(extreme.id, { frequencyHz: 1, holdSeconds: 0.5, velocity: 0.8 }), /相差过大/);
});

test('invalid sampled bodies and reference targets are rejected instead of silently changing a voice', () => {
  const body = { model: 'sample-instrument', version: 1, sampleId: 'sample', startSeconds: 0, endSeconds: 1, rootFrequencyHz: 220, attackSeconds: 0.01, releaseSeconds: 0.2, level: 0.5 };
  for (const change of [{ startSeconds: -1 }, { endSeconds: 0 }, { endSeconds: 121 }, { rootFrequencyHz: 0 }, { unknown: true }, { level: Infinity }]) assert.throws(() => readSampleTimbreBody({ ...body, ...change } as JsonValue));
  const voice: ContentRecord = { id: 'voice', kind: 'rootsound.timbre', owner: 'timbre', schemaVersion: 1, revision: 1, name: 'voice', dependencies: ['sample'], body };
  const adapter = createTimbreReferenceAdapter(); assert.deepEqual(adapter.slots(voice).map(slot => slot.targetId), ['sample']);
  assert.throws(() => adapter.validateTarget!(voice, 'sample', { ...source(), kind: 'other' }));
  assert.throws(() => adapter.slots({ ...voice, dependencies: [] }));
  assert.throws(() => adapter.replace(voice, [{ slotId: 'sample', targetId: 42 as unknown as string }]));
});

test('sampled phrase and song preparation validates current draft identity after delayed decoding', async () => {
  const f = store([source()]); const warm = createTimbreEditor(f.library, createSampleAudio(f.library, decoder));
  await warm.createFromSample('sample'); const voice = savedVoice(warm);
  const wait = gate<PcmAudio>(); const sounds = createTimbrePlayback(f.library, createSampleAudio(f.library, { async decode() { return wait.promise; } }));
  const phrase = createPhraseEditor(f.library, sounds); phrase.create(voice.id); const part = phrase.read().body!.parts[0]!.id;
  phrase.addNote(part, { startBeat: 0, durationBeats: 1, frequencyHz: 220, velocity: 0.7 });
  const saved = phrase.save('new'); assert.equal(saved.status, 'saved'); if (saved.status !== 'saved') throw new Error('Expected phrase');
  const song = createSongEditor(f.library, createPhrasePlayback(f.library, sounds), { defaultTempoMode: 'source' }); song.createFromPhrase(saved.content.id);
  const preparing = song.preparePreview(); await Promise.resolve(); song.rename('still editing'); wait.resolve(pcm());
  await assert.rejects(preparing, /歌曲发生变化/); assert.equal(song.read().draft!.name, 'still editing');
  await song.preparePreview(); assert.equal(song.previewPlan().events[0]!.sound.kind, 'sample');
});

test('co-creation can adopt an unprepared sample graph, continues exact fine edits and rejects a stale original-source token', async () => {
  const f = store([source()]); const editor = createTimbreEditor(f.library, createSampleAudio(f.library, decoder));
  await editor.createFromSample('sample'); const voice = savedVoice(editor);
  let decodes = 0; const cache = createSampleAudio(f.library, { async decode(bytes) { decodes++; return decoder.decode(bytes); } });
  const sounds = createTimbrePlayback(f.library, cache); const phrase = createPhraseEditor(f.library, sounds); phrase.create(voice.id);
  phrase.addNote(phrase.read().body!.parts[0]!.id, { startBeat: 0.125, durationBeats: 0.75, frequencyHz: 311.123456789, velocity: 0.71 });
  const initial = phrase.save('new'); assert.equal(initial.status, 'saved'); if (initial.status !== 'saved') throw new Error('Expected phrase');
  const co = createCoCreation(f.library, cache); co.start(initial.content.id);
  co.chooseIdea('calm', co.read().token); assert.equal(decodes, 0, 'saving music references never requires a playback codec');
  const beforeFine = co.read(); const part = readPhraseBody(beforeFine.currentPhrase!.body).parts[0]!;
  const references = createReferenceEditing(f.library, [createCoCreationReferenceAdapter(), createPhraseReferenceAdapter(), createTimbreReferenceAdapter(), createSampleReferenceAdapter(), createSongReferenceAdapter()]);
  const editing = references.begin({ root: { type: 'draft', id: beforeFine.draft.id }, path: ['current', part.id] });
  editor.openDraft(editing.draftId); editor.setSampleRange(0.173456789, 0.876543219); editor.setRootFrequency(233.765432198);
  assert.equal(references.apply(editing.draftId).status, 'applied');
  assert.equal(co.read().currentPhrase!.id, beforeFine.currentPhrase!.id, 'the singly used containing phrase keeps its identity');
  assert.equal(co.read().currentPhrase!.revision, beforeFine.currentPhrase!.revision + 1);
  assert.deepEqual(f.library.readContent(initial.content.id), initial.content, 'the unselected source phrase stays exact');
  assert.deepEqual(f.library.readContent(voice.id), voice, 'the sound shared with the source phrase is not overwritten');
  await co.prepareIdea('light'); const modified = co.previewIdea('light').events.find(event => event.sound.kind === 'sample')!.sound;
  assert.equal(modified.kind, 'sample'); if (modified.kind !== 'sample') throw new Error('Expected sample');
  assert.equal(modified.startSeconds, 0.173456789); assert.equal(modified.endSeconds, 0.876543219);
  assert.equal(modified.playbackRate, 311.123456789 / 233.765432198); assert.equal(modified.source.id, 'sample');
  const token = co.read().token; const original = f.library.readContent('sample')!;
  replace(f.library, original, { name: 'new original revision' }); const count = f.library.listContentInfo().length;
  assert.throws(() => co.chooseIdea('light', token), /当前成果已改变/); assert.equal(f.library.listContentInfo().length, count);
  assert.throws(() => cache.readPrepared('sample'), /尚未准备/);
  await co.prepareIdea('light'); co.chooseIdea('light', co.read().token);
  assert.equal(f.library.listContentInfo().filter(record => record.kind === 'rootsound.sample').length, 1);
  assert.equal(decodes, 2); assert.deepEqual(f.library.readContent('sample')!.body, original.body);
});

test('sample loop edits preserve originals, reject invalid bounds, follow trimming and survive undo redo across reopening', async () => {
  const original = source(); const f = store([original]); const cache = createSampleAudio(f.library, decoder); const editor = createTimbreEditor(f.library, cache);
  await editor.createFromSample('sample'); editor.setSampleLoop({ startSeconds: .2, endSeconds: .8 });
  assert.equal(editor.read().body.version, 2); const looped = editor.read().body;
  const before = f.storage.read();
  for (const loop of [{ startSeconds: -.1, endSeconds: .8 }, { startSeconds: .7, endSeconds: .6 }, { startSeconds: .2, endSeconds: 2 }]) assert.throws(() => editor.setSampleLoop(loop), /循环范围/);
  assert.equal(f.storage.read(), before); assert.deepEqual(f.library.readContent('sample'), original);
  editor.setSampleRange(.3, .6); assert.deepEqual((editor.read().body as { loop?: unknown }).loop, { startSeconds: .3, endSeconds: .6 });
  editor.undo(); assert.deepEqual(editor.read().body, looped);
  const coldLibrary = createMaterialLibrary(f.storage); const cold = createTimbreEditor(coldLibrary, createSampleAudio(coldLibrary, decoder)); cold.redo();
  assert.deepEqual((cold.read().body as { loop?: unknown }).loop, { startSeconds: .3, endSeconds: .6 });
  cold.setSampleLoop(); assert.equal(cold.read().body.version, 1); assert.equal((cold.read().body as { loop?: unknown }).loop, undefined);
});

test('looped sample voices retain repeat bounds and exact original bytes in a portable song reopened into an empty library', async () => {
  const f = store([source()]); const cache = createSampleAudio(f.library, decoder); const editor = createTimbreEditor(f.library, cache);
  await editor.createFromSample('sample'); editor.setSampleRange(.1, .9); editor.setSampleLoop({ startSeconds: .3, endSeconds: .7 });
  const voice = savedVoice(editor); const phrase = createPhraseEditor(f.library, createTimbrePlayback(f.library, cache)); phrase.create(voice.id);
  phrase.addNote(phrase.read().body!.parts[0]!.id, { startBeat: 0, durationBeats: 4, frequencyHz: 220, velocity: .7 });
  const result = phrase.save('new'); assert.equal(result.status, 'saved'); if (result.status !== 'saved') return;
  const song = createSongEditor(f.library, createPhrasePlayback(f.library, createTimbrePlayback(f.library, cache)), { defaultTempoMode: 'source' }); song.createFromPhrase(result.content.id, '延长的音符');
  const adapters = [createSampleReferenceAdapter(), createTimbreReferenceAdapter(), createPhraseReferenceAdapter(), createSongReferenceAdapter()];
  const text = createProjectPackages(f.library, adapters, { rootKind: 'rootsound.song' }).exportDraft(song.read().draft!.id).text;
  const target = createMaterialLibrary(); const imported = createProjectPackages(target, adapters, { rootKind: 'rootsound.song' }).importProject(text);
  assert.equal(imported.status, 'imported');
  const sample = target.listContent().find(item => item.kind === 'rootsound.sample')!; assert.deepEqual(sample.body, f.library.readContent('sample')!.body);
  const copied = target.listContent().find(item => item.kind === 'rootsound.timbre')!; const audio = createSampleAudio(target, decoder); const player = createTimbrePlayback(target, audio); await player.prepareForSaved(copied.id);
  const plan = player.planForSaved(copied.id, { frequencyHz: 440, holdSeconds: 3, velocity: .8 }); assert.equal(plan.kind, 'sample');
  if (plan.kind === 'sample') { assert.deepEqual(plan.loop, { startSeconds: .3, endSeconds: .7 }); assert.equal(plan.playbackRate, 2); }
});

test('loop creation and undo fail atomically on disk error without dropping the source or prior edit', async () => {
  const f = store([source()]); const cache = createSampleAudio(f.library, decoder); const editor = createTimbreEditor(f.library, cache);
  await editor.createFromSample('sample'); editor.setRootFrequency(330); const before = f.storage.read(); f.fail(true);
  assert.throws(() => editor.setSampleLoop({ startSeconds: .1, endSeconds: .8 }), /disk/); assert.equal(f.storage.read(), before);
  assert.throws(() => editor.undo(), /disk/); assert.equal(f.storage.read(), before); assert.equal(editor.read().body.model, 'sample-instrument');
});
