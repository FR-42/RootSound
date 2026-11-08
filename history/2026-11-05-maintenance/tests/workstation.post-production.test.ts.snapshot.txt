import assert from 'node:assert/strict';
import test from 'node:test';
import type { ContentRecord, SaveResult } from '../src/workstation/contracts/content.ts';
import type { SoundSequencePlan } from '../src/workstation/contracts/sound.ts';
import { createMaterialLibrary, createProjectPackages } from '../src/workstation/modules/materials/public.ts';
import { createTimbreEditor, createTimbrePlayback, createTimbreReferenceAdapter } from '../src/workstation/modules/timbre/public.ts';
import { createPhraseEditor, createPhrasePlayback, createPhraseReferenceAdapter } from '../src/workstation/modules/phrase/public.ts';
import { createSongEditor, createSongPlayback, createSongReferenceAdapter, readSongBody } from '../src/workstation/modules/song/public.ts';
import { createPostProduction } from '../src/workstation/modules/post-production/public.ts';
import { readPreview, previewFingerprint } from '../src/workstation/modules/sound-runtime/plan.ts';
import { allocateGraph, releaseGraph, scheduleGraph, type GraphResources } from '../src/workstation/modules/sound-runtime/graph.ts';

function saved(result: SaveResult): ContentRecord { assert.equal(result.status, 'saved'); if (result.status !== 'saved') throw new Error('Expected saved'); return result.content; }
const settings = { enabled: true, level: 0.4, fadeInSeconds: 1, fadeOutSeconds: 2 };
function plan(): SoundSequencePlan { return { kind: 'sequence', version: 1, durationSeconds: 4, events: [{ atSeconds: 3,
  sound: { kind: 'basic-synth', version: 1, sources: [{ waveform: 'sine', frequencyRatio: 1, level: 1 }],
    envelope: { attackSeconds: 0, releaseSeconds: 2 }, note: { frequencyHz: 440, holdSeconds: 1, velocity: 1 }, level: 1 } }] }; }
function fixture() {
  let raw: string | null = null; let failing = false;
  const storage = { read: () => raw, write(value: string) { if (failing) throw new Error('模拟磁盘失败'); raw = value; } };
  const library = createMaterialLibrary(storage); const timbre = createTimbreEditor(library); const voice = saved(timbre.save('new'));
  const phrases = createPhrasePlayback(library, createTimbrePlayback(library)); const phrase = createPhraseEditor(library, createTimbrePlayback(library));
  phrase.create(voice.id); phrase.addNote(phrase.read().body!.parts[0]!.id, { startBeat: 0, durationBeats: 1, frequencyHz: 440, velocity: 1 });
  const melody = saved(phrase.save('new')); const postProduction = createPostProduction();
  const song = createSongEditor(library, phrases, { defaultTempoMode: 'source', postProduction }); song.createFromPhrase(melody.id);
  return { storage, library, voice, melody, song, postProduction, raw: () => raw, fail() { failing = true; } };
}

test('post-production keeps all events and original music untouched, with reversible bypass', () => {
  const source = plan(); const original = structuredClone(source); const post = createPostProduction();
  const processed = post.apply(source, settings);
  assert.deepEqual(source, original); assert.equal(processed.events, source.events);
  assert.deepEqual(processed.output, { level: 0.4, fadeInSeconds: 1, fadeOutSeconds: 2 });
  assert.deepEqual(post.apply(processed, { ...settings, enabled: false }), source);
  for (const invalid of [{ ...settings, level: 1.01 }, { ...settings, fadeInSeconds: -1 }, { ...settings, fadeOutSeconds: Infinity }, { ...settings, enabled: 1 }]) {
    assert.throws(() => post.apply(source, invalid as typeof settings), /后期设置无效/);
  }
});

test('song final controls are one durable edit, survive save and restart, and undo without modifying sources', () => {
  const f = fixture(); const before = f.raw(); const voice = f.library.readContent(f.voice.id); const phrase = f.library.readContent(f.melody.id);
  f.song.setPostProduction(settings); assert.deepEqual(f.song.read().body!.postProduction, settings);
  assert.deepEqual(f.song.previewPlan().output, { level: 0.4, fadeInSeconds: 1, fadeOutSeconds: 2 });
  f.song.undo(); assert.equal(f.song.read().body!.postProduction, undefined); f.song.redo();
  const content = saved(f.song.save('new')); const reopened = createMaterialLibrary(f.storage);
  const playback = createSongPlayback(reopened, createPhrasePlayback(reopened, createTimbrePlayback(reopened)), f.postProduction);
  assert.deepEqual(playback.planForSaved(content.id), f.song.previewPlan());
  assert.deepEqual(f.library.readContent(f.voice.id), voice); assert.deepEqual(f.library.readContent(f.melody.id), phrase);
  assert.notEqual(f.raw(), before); const preserved = f.raw();
  assert.throws(() => f.song.setPostProduction({ ...settings, fadeOutSeconds: 31 })); assert.equal(f.raw(), preserved);
  f.fail(); assert.throws(() => f.song.setPostProduction({ ...settings, level: 0.6 }), /模拟磁盘/);
  assert.equal(f.raw(), preserved); assert.deepEqual(f.song.read().body!.postProduction, settings);
});

test('portable song packages carry output settings without a separate material dependency', () => {
  const f = fixture(); f.song.setPostProduction(settings);
  const adapters = [createSongReferenceAdapter(), createPhraseReferenceAdapter(), createTimbreReferenceAdapter()];
  const pkg = createProjectPackages(f.library, adapters, { rootKind: 'rootsound.song' });
  const exported = pkg.exportDraft(f.song.read().draft!.id); const target = createMaterialLibrary();
  const imported = createProjectPackages(target, adapters, { rootKind: 'rootsound.song' }).importProject(exported.text);
  assert.equal(imported.status, 'imported'); if (imported.status !== 'imported') throw new Error('Expected imported');
  const playback = createSongPlayback(target, createPhrasePlayback(target, createTimbrePlayback(target)), f.postProduction);
  assert.deepEqual(playback.planForSaved(imported.content.id), f.song.previewPlan());
  assert.equal(target.listContentInfo().length, 3);
  const malformed = { ...f.song.read().body!, postProduction: { ...settings, surprise: true } };
  assert.throws(() => readSongBody(malformed), /后期设置/);
});

class Param {
  changes: { value: number; time: number; ramp: boolean }[] = [];
  setValueAtTime(value: number, time: number) { this.changes.push({ value, time, ramp: false }); }
  linearRampToValueAtTime(value: number, time: number) { this.changes.push({ value, time, ramp: true }); }
}
class Node { connections: Node[] = []; disconnected = false; connect(node: Node) { this.connections.push(node); } disconnect() { this.disconnected = true; } }
class Gain extends Node { gain = new Param(); }
class Panner extends Node { pan = new Param(); }
class Oscillator extends Node { type = ''; frequency = new Param(); onended = null; stop() {} }
function graph(input: SoundSequencePlan, fromSeconds = 0) {
  const destination = new Node();
  const audio = { destination, createGain: () => new Gain(), createStereoPanner: () => new Panner(), createOscillator: () => new Oscillator() };
  const resources: GraphResources = { gains: [], panners: [], samples: [], oscillators: [], bufferReleases: [] };
  const preview = readPreview(input); const built = allocateGraph(audio as unknown as BaseAudioContext, preview, resources);
  scheduleGraph(built, preview.normalization, 10, fromSeconds);
  return { resources, preview, destination, output: resources.outputBuses![0] as unknown as Gain };
}

test('the final-mix envelope follows the full release tail and keeps every panner routed through it', () => {
  const g = graph(createPostProduction().apply(plan(), settings));
  assert.equal(g.preview.durationSeconds, 6);
  assert.deepEqual(g.output.gain.changes, [{ value: 0, time: 10, ramp: false }, { value: 0.4, time: 11, ramp: true },
    { value: 0.4, time: 14, ramp: true }, { value: 0, time: 16, ramp: true }]);
  assert.deepEqual((g.resources.panners[0] as unknown as Panner).connections, [g.output]);
  assert.deepEqual(g.output.connections, [g.destination]); releaseGraph(g.resources); assert.equal(g.output.disconnected, true);
});

test('overlapping fades remain continuous and live replacement rejoins the original song age', () => {
  const post = createPostProduction(); const input = post.apply(plan(), { ...settings, fadeInSeconds: 30, fadeOutSeconds: 30 });
  const g = graph(input); assert.deepEqual(g.output.gain.changes, [{ value: 0, time: 10, ramp: false },
    { value: 0.2, time: 13, ramp: true }, { value: 0, time: 16, ramp: true }]); releaseGraph(g.resources);
  const resumed = graph(post.apply(plan(), settings), 5);
  assert.deepEqual(resumed.output.gain.changes, [{ value: 0.2, time: 15, ramp: false }, { value: 0, time: 16, ramp: true }]);
  releaseGraph(resumed.resources);
});

test('output controls are snapshotted, enter live fingerprints, and cannot bypass peak protection', () => {
  const post = createPostProduction(); const source = plan(); const input = { ...source, events: [...source.events, ...source.events], output: { level: 0.4, fadeInSeconds: 1, fadeOutSeconds: 2 } };
  const preview = readPreview(input); assert.equal(preview.normalization, 0.5);
  input.output.level = 0.9; assert.equal(preview.output!.level, 0.4);
  assert.notEqual(previewFingerprint(preview), previewFingerprint(readPreview(input)));
  assert.equal(readPreview(post.apply(source, { ...settings, enabled: false })).output, undefined);
  for (const invalid of [{ level: 2, fadeInSeconds: 0, fadeOutSeconds: 0 }, { level: 1, fadeInSeconds: NaN, fadeOutSeconds: 0 },
    { level: 1, fadeInSeconds: 0, fadeOutSeconds: -1 }, { level: 1, fadeInSeconds: 0, fadeOutSeconds: 0, bypassProtection: true }]) {
    assert.throws(() => readPreview({ ...source, output: invalid }));
  }
});
