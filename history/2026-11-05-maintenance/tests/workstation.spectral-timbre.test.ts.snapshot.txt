import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import type { ContentRecord } from '../src/workstation/contracts/content.ts';
import type { SoundPlan } from '../src/workstation/contracts/sound.ts';
import { createMaterialLibrary } from '../src/workstation/modules/materials/public.ts';
import { createProjectPackages } from '../src/workstation/modules/materials/project.ts';
import { createTimbreEditor, createTimbrePlayback, createTimbreReferenceAdapter, createSpectralAudio,
  prepareImportedTimbre, readEditableTimbreBody, spectralTimbreBody, timbrePresets } from '../src/workstation/modules/timbre/public.ts';
import { createDefaultPatch } from '../src/workstation/modules/timbre/spectral/model.mjs';
import { handleSpectralWorkerRequest, renderSpectralNote } from '../src/workstation/modules/timbre/spectral-worker.ts';
import { readPreview, previewFingerprint } from '../src/workstation/modules/sound-runtime/plan.ts';
import { allocateGraph, scheduleGraph, releaseGraph, type GraphResources } from '../src/workstation/modules/sound-runtime/graph.ts';
import { MAX_SPECTRAL_CACHE_BYTES } from '../src/workstation/modules/timbre/spectral-model.ts';

const note: SoundPlan['note'] = { frequencyHz: 432.125, holdSeconds: .0371, velocity: .61 };
function patch() {
  const value = createDefaultPatch(); value.name = '精确音色';
  value.amplitude = { points: [{ x: 0, y: 0, curve: -.2 }, { x: .001, y: 1, curve: .3 },
    { x: .01, y: .63, curve: -.4 }, { x: .04, y: 0, curve: 0 }], sustainIndex: 2 };
  value.pitch = { points: [{ x: 0, y: 7.345678912345, curve: -.2 }, { x: .012, y: -1, curve: .1 },
    { x: .05, y: 0, curve: 0 }], sustainIndex: 1 };
  value.spectrum = { mix: .87, points: [{ x: 20, y: -18, curve: .2 }, { x: 723.125, y: 4.123456789123, curve: -.1 }, { x: 20000, y: -27, curve: 0 }] };
  value.oscillators[0] = { ...value.oscillators[0]!, waveform: 'pulse', pulseWidth: .3123456789123, unison: 2, pan: -.25, fmAmount: .4 };
  value.oscillators[1] = { ...value.oscillators[1]!, enabled: true, waveform: 'sine', pan: .3, semitones: 12 };
  value.lfos[0] = { enabled: true, waveform: 'triangle', rateHz: 6.1, depth: .06, target: 'pitch' };
  value.lfos[1] = { enabled: true, waveform: 'sine', rateHz: 3.7, depth: .13, target: 'amplitude' };
  value.effects = { drive: .14, delaySeconds: .01, delayFeedback: .1, delayMix: .12,
    chorusMix: .1, chorusRateHz: .7, chorusDepthMs: 3.2 };
  return value;
}
function workerHarness(deferred = false) {
  let created = 0; let terminated = 0; let posted = 0;
  const queued: (() => void)[] = [];
  const factory = () => {
    created++;
    const worker = { onmessage: null as null | ((event: { data: unknown }) => void), onerror: null, onmessageerror: null,
      postMessage(message: Parameters<typeof handleSpectralWorkerRequest>[0]) {
        posted++; const owned = structuredClone(message);
        const run = () => handleSpectralWorkerRequest(owned, value => worker.onmessage?.({ data: structuredClone(value) }));
        if (deferred) queued.push(run); else queueMicrotask(run);
      },
      terminate() { terminated++; },
    };
    return worker as unknown as Worker;
  };
  return { factory, created: () => created, terminated: () => terminated, posted: () => posted,
    flush() { for (const run of queued.splice(0)) run(); } };
}
function stored(record: ContentRecord) {
  const library = createMaterialLibrary();
  assert.equal(library.commitTransaction({ expectedToken: library.currentToken(), label: '导入音色测试', createContents: [record] }).status, 'committed');
  return library;
}
const settle = async () => { for (let index = 0; index < 8; index++) await Promise.resolve(); };

test('the workstation vendors the exact experiment DSP, model and curve engine without algorithm substitutions', () => {
  for (const file of ['model.mjs', 'dsp.mjs', 'curve-density.mjs']) {
    const original = readFileSync(new URL('../experiments/music-workflow/spectral-forge/web/' + file, import.meta.url));
    const shared = readFileSync(new URL('../src/workstation/modules/timbre/spectral/' + file, import.meta.url));
    assert.deepEqual(shared, original);
  }
});

test('rssynth import retains every normalized curve, oscillator, modulation and effect with independent identity', () => {
  const value = patch(); const text = JSON.stringify(value); const a = prepareImportedTimbre(text); const b = prepareImportedTimbre(text);
  assert.notEqual(a.id, b.id); assert.deepEqual(a.dependencies, []); assert.equal(a.name, value.name);
  const body = readEditableTimbreBody(a.body); assert.equal(body.model, 'spectral-synth');
  if (body.model !== 'spectral-synth') throw new Error('spectral');
  assert.deepEqual(body.patch, value); assert.equal(body.level, value.master.level);
  assert.equal(body.patch.pitch.points[0]!.y, 7.345678912345);
  assert.equal(JSON.stringify(value), text);
  assert.equal(prepareImportedTimbre(text, '自己的名字').name, '自己的名字');
  assert.deepEqual(prepareImportedTimbre('\ufeff' + text).body, a.body);
});

test('unsupported, malformed, excessive and inconsistent spectral data are rejected rather than flattened', () => {
  const value = patch();
  for (const invalid of [{ ...value, future: true }, { ...value, version: 2 },
    { ...value, effects: { ...value.effects, unknown: 1 } },
    { ...value, oscillators: value.oscillators.slice(0, 3) },
    { ...value, amplitude: { ...value.amplitude, sustainIndex: 999 } },
    { ...value, pitch: { ...value.pitch, points: Array.from({ length: 11 }, (_, index) => ({ x: index / 10, y: 0, curve: 0 })) } }]) {
    assert.throws(() => prepareImportedTimbre(JSON.stringify(invalid)));
  }
  assert.throws(() => prepareImportedTimbre('{bad'));
  assert.throws(() => prepareImportedTimbre(' '.repeat(4 * 1024 * 1024 + 1)), /4 MiB/);
  const body = spectralTimbreBody(value);
  assert.throws(() => readEditableTimbreBody({ ...body, level: .1 }), /不一致/);
});

test('independent generated notes match the original spectral-forge render at fractional pitch and gate', async () => {
  const value = patch();
  const original = await import(new URL('../experiments/music-workflow/spectral-forge/web/dsp.mjs', import.meta.url).href);
  const expected = original.renderPatch(value, { sampleRate: 48000, midi: 69 + 12 * Math.log2(note.frequencyHz / 440),
    holdSeconds: note.holdSeconds, velocity: note.velocity });
  const actual = renderSpectralNote(value, note);
  assert.deepEqual(actual.left, expected.left); assert.deepEqual(actual.right, expected.right);
  assert(actual.left.some(sample => sample !== 0)); assert.notDeepEqual(actual.left, actual.right);
});

test('spectral playback prepares asynchronously, deduplicates notes and preserves original gate with a baked complete tail', async () => {
  const imported = prepareImportedTimbre(JSON.stringify(patch())); const library = stored(imported); const worker = workerHarness();
  const audio = createSpectralAudio(worker.factory); const playback = createTimbrePlayback(library, undefined, audio);
  const before = library.currentToken();
  assert.throws(() => playback.planForSaved(imported.id, note), /后台准备/);
  const preparing = playback.prepareForSaved(imported.id, [note, { ...note }]);
  assert.equal(worker.created(), 0, 'parsing and synchronous invocation never render DSP');
  await preparing; assert.equal(worker.posted(), 1); assert.equal(worker.terminated(), 1);
  const plan = playback.planForSaved(imported.id, note); assert.equal(plan.kind, 'sample');
  if (plan.kind !== 'sample') throw new Error('sample');
  assert.equal(plan.playbackRate, 1); assert.equal(plan.note.frequencyHz, note.frequencyHz);
  assert.equal(plan.note.holdSeconds, note.holdSeconds); assert.equal(plan.envelopeBaked, true);
  assert(plan.envelope.releaseSeconds > .2); assert.equal(plan.note.velocity, 1, 'requested velocity is already synthesized into PCM');
  const expected = renderSpectralNote(patch(), note);
  assert.deepEqual(plan.source.audio.channels[0], expected.left); assert.deepEqual(plan.source.audio.channels[1], expected.right);
  const preparedSource = plan.source;
  await playback.prepareForSaved(imported.id, [note]); assert.equal(worker.posted(), 1);
  const again = playback.planForSaved(imported.id, note); assert.equal(again.kind, 'sample');
  if (again.kind === 'sample') assert.equal(again.source.audio === preparedSource.audio, true);
  const snapshot = readPreview(plan); assert.equal(snapshot.samples.length, 1); assert(snapshot.durationSeconds > note.holdSeconds);
  assert.equal(library.currentToken(), before);
});

test('very short gates and pitches are synthesized independently, not transposed from a C4 sample', async () => {
  const body = spectralTimbreBody(patch()); const worker = workerHarness(); const audio = createSpectralAudio(worker.factory);
  const short = { ...note, frequencyHz: 210.123, holdSeconds: .0001 }; const high = { ...note, frequencyHz: 840.246, velocity: .3 };
  await audio.prepare(body, [short, high]);
  const a = audio.plan(body, short); const b = audio.plan(body, high);
  assert.equal(a.note.holdSeconds, .0001); assert.equal(a.playbackRate, 1); assert.equal(b.playbackRate, 1);
  assert.notEqual(a.source.id, b.source.id);
  assert.deepEqual(a.source.audio.channels[0], renderSpectralNote(body.patch, short).left);
  assert.deepEqual(b.source.audio.channels[0], renderSpectralNote(body.patch, high).left);
});

test('cache working sets and full natural tails are bounded before worker allocation, without truncation', async () => {
  const body = spectralTimbreBody(patch()); const worker = workerHarness(); const audio = createSpectralAudio(worker.factory);
  const notes = Array.from({ length: 128 }, (_, index) => ({ ...note, frequencyHz: 220 + index, holdSeconds: 10 }));
  assert(notes.length * 10 * 48000 * 8 > MAX_SPECTRAL_CACHE_BYTES);
  await assert.rejects(audio.prepare(body, notes), /128 MiB/); assert.equal(worker.created(), 0);
  await assert.rejects(audio.prepare(body, [{ ...note, holdSeconds: 120 }]), /120秒/);
  assert.equal(worker.created(), 0);
});

test('spectral imports remain portable and ordinary controls cannot silently replace their complete curves', async () => {
  const imported = prepareImportedTimbre(JSON.stringify(patch())); const library = stored(imported); const worker = workerHarness();
  const editor = createTimbreEditor(library, undefined, createSpectralAudio(worker.factory));
  editor.open(imported.id); const old = library.currentToken();
  assert.throws(() => editor.setEnvelope(.1, .2), /多点包络/);
  assert.throws(() => editor.setSynthesis(timbrePresets()[0]!.body), /原音色/);
  assert.equal(library.currentToken(), old);
  editor.setLevel(.321); const body = editor.read().body;
  assert.equal(body.model, 'spectral-synth'); if (body.model !== 'spectral-synth') throw new Error('spectral');
  assert.equal(body.patch.master.level, .321); assert.equal(body.level, .321);
  const exported = editor.exportSound(); assert.equal(JSON.parse(exported).version, 3);
  const reopened = prepareImportedTimbre(exported); assert.deepEqual(reopened.body, body);
  const saved = editor.save('overwrite'); assert.equal(saved.status, 'saved');
  const packages = createProjectPackages(library, [createTimbreReferenceAdapter()], { rootKind: 'rootsound.timbre' });
  const bundle = packages.exportDraft(editor.read().draft.id);
  const cold = createMaterialLibrary(); const result = createProjectPackages(cold, [createTimbreReferenceAdapter()], { rootKind: 'rootsound.timbre' }).importProject(bundle.text);
  assert.equal(result.status, 'imported');
  if (result.status === 'imported') assert.deepEqual(readEditableTimbreBody(result.content.body), body);
  assert.equal(worker.created(), 0, 'saving and reopening only parameters does not calculate audio');
});

test('a changed source during background preparation cannot be adopted as the newly saved tone', async () => {
  const imported = prepareImportedTimbre(JSON.stringify(patch())); const library = stored(imported); const worker = workerHarness(true);
  const audio = createSpectralAudio(worker.factory); const playback = createTimbrePlayback(library, undefined, audio);
  const preparing = playback.prepareForSaved(imported.id, [note]); await settle(); assert.equal(worker.created(), 1);
  const editor = createTimbreEditor(library); editor.open(imported.id); editor.setLevel(.2); assert.equal(editor.save('overwrite').status, 'saved');
  worker.flush(); await assert.rejects(preparing, /发生变化/);
  assert.throws(() => playback.planForSaved(imported.id, note), /后台准备/);
});

test('a queued preparation cannot evict a fulfilled batch before its Promise.all consumers compile plans', async () => {
  const body = spectralTimbreBody(patch()); const worker = workerHarness(true); const audio = createSpectralAudio(worker.factory);
  const first = Promise.all([audio.prepare(body, [note])]).then(() => {
    assert.equal(worker.created(), 1, 'the second batch must yield past all ready-plan continuations');
    assert.equal(audio.plan(body, note).note.holdSeconds, note.holdSeconds);
  });
  await settle(); assert.equal(worker.created(), 1);
  const other = { ...note, frequencyHz: 600 };
  const second = audio.prepare(body, [other]); worker.flush(); await first;
  await new Promise<void>(resolve => setTimeout(resolve, 0));
  assert.equal(worker.created(), 2); worker.flush(); await second;
  assert.equal(audio.plan(body, other).note.frequencyHz, 600);
  assert.equal(worker.terminated(), 2);
});

test('baked amplitude and FX tails are not attenuated a second time by the common sample envelope', () => {
  const param = () => ({ value: 0, calls: [] as unknown[][],
    setValueAtTime(value: number, time: number) { this.calls.push(['set', value, time]); },
    linearRampToValueAtTime(value: number, time: number) { this.calls.push(['ramp', value, time]); } });
  const node = () => ({ gain: param(), pan: param(), playbackRate: param(), connect() {}, disconnect() {}, start() {}, stop() {} });
  const context = { destination: node(), createGain: node, createStereoPanner: node, createBufferSource: node,
    createBuffer(channels: number, frames: number) { const data = Array.from({ length: channels }, () => new Float32Array(frames));
      return { getChannelData(index: number) { return data[index]!; } }; } } as unknown as BaseAudioContext;
  const source = { id: 'generated', revision: 1, audio: { sampleRate: 48000, channels: [new Float32Array(4800)] } };
  const plan = { kind: 'sample' as const, version: 1 as const, source, startSeconds: 0, endSeconds: .1, playbackRate: 1,
    note: { frequencyHz: 440, holdSeconds: .04, velocity: 1 }, envelope: { attackSeconds: 0, releaseSeconds: .06 },
    level: .8, envelopeBaked: true as const };
  const preview = readPreview(plan); const resources: GraphResources = { oscillators: [], samples: [], bufferReleases: [], gains: [], panners: [] };
  try {
    const graph = allocateGraph(context, preview, resources); scheduleGraph(graph, 1, 2);
    const calls = (graph.envelopes[0]!.node.gain as unknown as ReturnType<typeof param>).calls;
    assert.deepEqual(calls, [['set', .8, 2], ['set', 0, 2.1]]);
    assert.notEqual(previewFingerprint(preview), previewFingerprint(readPreview({ ...plan, envelopeBaked: undefined })));
    assert.throws(() => readPreview({ ...plan, envelopeBaked: false }), /标记/);
  } finally { releaseGraph(resources); }
});
