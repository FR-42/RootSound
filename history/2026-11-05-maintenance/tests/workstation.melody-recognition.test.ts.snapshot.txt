import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { MelodyAnalysis, MelodyAnalysisOptions, MelodyRecognitionInput } from '../src/workstation/contracts/melody-recognition.ts';
import type { PcmAudio } from '../src/workstation/contracts/sound.ts';
import { createMaterialLibrary } from '../src/workstation/modules/materials/public.ts';
import { createMelodyRecognition } from '../src/workstation/modules/melody-recognition/public.ts';
import { createTimbrePlayback, prepareBasicTimbre } from '../src/workstation/modules/timbre/public.ts';
import { createPhraseEditor, createPhrasePlayback, preparePhraseFromSeconds, readPhraseBody } from '../src/workstation/modules/phrase/public.ts';
import { createSampling } from '../src/workstation/modules/sampling/public.ts';

function deferred<T>() {
  let resolve!: (value: T) => void; let reject!: (error: Error) => void;
  const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no; }); return { promise, resolve, reject };
}
function audio(): PcmAudio { return { sampleRate: 8000, channels: [new Float32Array(32000)] }; }
function analysis(): MelodyAnalysis {
  return { durationSeconds: 4, channelIndex: 0, coverage: 0.5, warnings: ['单人旋律估计，仍可继续细调。'], notes: [
    { startSeconds: 0.125, durationSeconds: 0.75, frequencyHz: 317.123456789123, velocity: 0.765432198765, confidence: 0.812345678912 },
    { startSeconds: 2.25, durationSeconds: 1.25, frequencyHz: 448.987654321987, velocity: 0.543219876543, confidence: 0.923456789123 },
  ] };
}
function fixture() {
  let raw: string | null = null; let writes = 0; let failing = false; let token: string | undefined = 'source-a'; let calls = 0; let disposals = 0;
  const storage = { read: () => raw, write(value: string) { if (failing) throw new Error('磁盘空间不足'); raw = value; writes++; } };
  const library = createMaterialLibrary(storage);
  let recognize = async (_audio: PcmAudio, options?: MelodyAnalysisOptions) => { options?.onProgress?.(0.4); return analysis(); };
  const recognition = createMelodyRecognition(library, { currentSourceToken: () => token,
    analyzer: { analyze(input, options) { calls++; return recognize(input, options); }, dispose() { disposals++; } } });
  return { library, storage, recognition, input: (): MelodyRecognitionInput => ({ audio: audio(), sourceToken: token ?? 'source-a', sourceName: '还未保存的哼唱' }),
    source: (value: string | undefined) => { token = value; }, handler: (value: typeof recognize) => { recognize = value; },
    raw: () => raw, writes: () => writes, calls: () => calls, disposals: () => disposals, fail: (value = true) => { failing = value; } };
}

test('recognition and synthesized audition are temporary, retain leading and trailing rests, and preserve exact seconds and Hz', async () => {
  const f = fixture(); await f.recognition.analyze(f.input()); const view = f.recognition.read();
  assert.equal(view.phase, 'ready'); assert.equal(view.progress, 1); assert.deepEqual(view.result, analysis());
  const plan = f.recognition.previewPlan(); assert.equal(plan.durationSeconds, 4);
  assert.deepEqual(plan.events.map(event => event.atSeconds), [0.125, 2.25]);
  assert.deepEqual(plan.events.map(event => event.sound.note.holdSeconds), [0.75, 1.25]);
  assert.deepEqual(plan.events.map(event => event.sound.note.frequencyHz), analysis().notes.map(note => note.frequencyHz));
  assert.equal(f.writes(), 0); assert.deepEqual(f.library.listContent(), []); assert.deepEqual(f.library.listDrafts(), []);
});

test('explicit adoption creates only one independent voice, phrase and root draft in one write and is repeat-safe', async () => {
  const f = fixture(); const original = prepareBasicTimbre('原来的声音');
  f.library.commitTransaction({ expectedToken: f.library.currentToken(), label: '原有素材', createContents: [original] });
  await f.recognition.analyze(f.input()); const heard = f.recognition.previewPlan(); const writes = f.writes();
  const result = f.recognition.adopt('我的哼唱旋律'); assert.equal(f.writes() - writes, 1);
  assert.equal(result.content.name, '我的哼唱旋律'); assert.equal(result.content.kind, 'rootsound.phrase'); assert.equal(result.draft.sourceId, result.content.id);
  assert.deepEqual(f.library.readContent(original.id), original); assert.equal(f.library.listContent().length, 3); assert.equal(f.library.listDrafts().length, 1);
  const body = readPhraseBody(result.content.body); assert.equal(body.tempoBpm, 120); assert.equal(body.lengthBeats, 8);
  assert.deepEqual(body.parts[0]!.notes.map(note => [note.startBeat, note.durationBeats]), [[0.25, 1.5], [4.5, 2.5]]);
  assert(!JSON.stringify(body).includes('confidence')); assert(!JSON.stringify(body).includes('sourceToken'));
  assert.equal(result.content.dependencies.length, 1); assert(!result.content.dependencies.includes('source-a'));
  assert.deepEqual(createPhrasePlayback(f.library, createTimbrePlayback(f.library)).planForSaved(result.content.id), heard);
  const repeated = f.recognition.adopt('重复点击不能生成第二份'); assert.equal(repeated.content.id, result.content.id); assert.equal(repeated.draft.id, result.draft.id);
  assert.equal(f.writes() - writes, 1); assert.deepEqual(f.recognition.read().adopted, { contentId: result.content.id, draftId: result.draft.id });
});

test('adopted music survives reopening and can be finely edited without changing the saved recognized phrase', async () => {
  const f = fixture(); await f.recognition.analyze(f.input()); const result = f.recognition.adopt();
  const reopened = createMaterialLibrary(f.storage); const editor = createPhraseEditor(reopened, createTimbrePlayback(reopened)); editor.openDraft(result.draft.id);
  const part = editor.read().body!.parts[0]!; editor.updateNote(part.id, part.notes[0]!.id, { frequencyHz: 777.123456789 });
  assert.equal(editor.read().body!.parts[0]!.notes[0]!.frequencyHz, 777.123456789);
  assert.equal(readPhraseBody(reopened.readContent(result.content.id)!.body).parts[0]!.notes[0]!.frequencyHz, analysis().notes[0]!.frequencyHz);
});

test('an unsaved microphone take can be recognized and adopted without saving or mutating the original sample', async () => {
  const f = fixture(); const take = audio(); const sampling = createSampling(f.library, {
    files: { async open() { return { status: 'cancelled' }; } }, decoder: { async decode() { return take; } },
    capture: { async start() { return { result: Promise.resolve(take), stop() {}, cancel() {} }; }, cancel() {} },
  });
  await sampling.startRecording(); await sampling.stopRecording(); const before = sampling.read(); const beforeAudio = sampling.previewAudio();
  assert.equal(before.sourceKind, 'microphone'); assert.equal(before.changed, true); assert.equal(before.currentId, undefined); assert(before.audioToken);
  const recognition = createMelodyRecognition(f.library, { currentSourceToken: () => sampling.read().phase === 'idle' ? sampling.read().audioToken : undefined,
    analyzer: { async analyze() { return analysis(); } } });
  await recognition.analyze({ audio: sampling.previewAudio(), sourceToken: before.audioToken!, sourceName: before.name }); const result = recognition.adopt();
  assert.deepEqual(sampling.read(), before); assert.deepEqual(sampling.previewAudio(), beforeAudio);
  assert.equal(f.library.listContent().filter(record => record.kind === 'rootsound.sample').length, 0);
  assert.deepEqual(f.library.listContent().map(record => record.kind).sort(), ['rootsound.phrase', 'rootsound.timbre']);
  assert.equal(f.library.readDraft(result.draft.id)!.dependencies.length, 1);
});

test('storage failure publishes no fragments and leaves a valid audition ready for retry', async () => {
  const f = fixture(); await f.recognition.analyze(f.input()); const preview = f.recognition.previewPlan(); f.fail();
  assert.throws(() => f.recognition.adopt(), /磁盘空间不足/); assert.equal(f.raw(), null); assert.equal(f.writes(), 0);
  assert.equal(f.recognition.read().phase, 'ready'); assert.deepEqual(f.recognition.previewPlan(), preview);
  assert.deepEqual(f.library.listContent(), []); assert.deepEqual(f.library.listDrafts(), []);
  f.fail(false); const result = f.recognition.adopt(); assert(f.library.readContent(result.content.id)); assert.equal(f.writes(), 1);
});

test('source replacement invalidates pending analysis, audition and adoption while preserving already adopted library music', async () => {
  const f = fixture(); await f.recognition.analyze(f.input()); const result = f.recognition.adopt(); const raw = f.raw();
  f.source('source-b'); const changed = f.recognition.read(); assert.equal(changed.phase, 'idle'); assert.equal(changed.result, undefined); assert.equal(changed.adopted, undefined);
  assert.match(changed.problem!, /来源已改变/); assert.throws(() => f.recognition.previewPlan(), /先识别/); assert.throws(() => f.recognition.adopt(), /先识别/);
  assert.equal(f.raw(), raw); assert.deepEqual(f.library.readContent(result.content.id), result.content);
});

test('starting another acquisition rejects old worker results even if the worker ignores cancellation', async () => {
  const f = fixture(); const waiting = deferred<MelodyAnalysis>(); let signal: AbortSignal | undefined;
  f.handler(async (_audio, options) => { signal = options?.signal; return waiting.promise; });
  const running = f.recognition.analyze(f.input()); assert.equal(f.recognition.read().phase, 'analyzing');
  f.source(undefined); assert.equal(f.recognition.read().phase, 'idle'); assert.equal(signal!.aborted, true);
  waiting.resolve(analysis()); await running; assert.equal(f.recognition.read().result, undefined); assert.equal(f.writes(), 0);
});

test('a newer request wins over late earlier results and late progress cannot regress the current journey', async () => {
  const f = fixture(); const old = deferred<MelodyAnalysis>(); let lateProgress: ((value: number) => void) | undefined; let calls = 0;
  f.handler(async (_audio, options) => { if (++calls === 1) { lateProgress = options?.onProgress; return old.promise; } return analysis(); });
  const first = f.recognition.analyze(f.input()); f.source('source-b'); await f.recognition.analyze(f.input());
  const before = f.recognition.read(); lateProgress?.(0.99); old.resolve({ ...analysis(), warnings: ['旧结果不应覆盖新结果'] }); await first;
  assert.deepEqual(f.recognition.read(), before); assert.equal(f.writes(), 0);
});

test('cancel and disposal suppress late results, release the analyzer once and cannot publish material', async () => {
  const f = fixture(); const waiting = deferred<MelodyAnalysis>(); f.handler(async () => waiting.promise);
  const running = f.recognition.analyze(f.input()); f.recognition.cancel(); assert.equal(f.recognition.read().phase, 'idle');
  f.recognition.dispose(); f.recognition.dispose(); waiting.resolve(analysis()); await running;
  assert.equal(f.disposals(), 1); assert.equal(f.writes(), 0); assert.throws(() => f.recognition.adopt(), /已经关闭/);
  await assert.rejects(f.recognition.analyze(f.input()), /已经关闭/);
});

test('immediate cancellation from an observer prevents launching another analysis and observer failures are isolated', async () => {
  const f = fixture(); f.recognition.subscribe(() => { if (f.recognition.read().phase === 'analyzing') f.recognition.cancel(); });
  f.recognition.subscribe(() => { throw new Error('display failure'); }); await f.recognition.analyze(f.input());
  assert.equal(f.calls(), 0); assert.equal(f.writes(), 0); assert.equal(f.recognition.read().phase, 'idle');
});

test('worker outputs with missing fields, impossible timing, wrong clocks, out-of-range annotations or no melody never become adoptable', async () => {
  const mutations = [
    (value: MelodyAnalysis) => { value.durationSeconds = 5; },
    (value: MelodyAnalysis) => { value.channelIndex = 1; },
    (value: MelodyAnalysis) => { value.notes[0]!.frequencyHz = NaN; },
    (value: MelodyAnalysis) => { value.notes[0]!.confidence = 2; },
    (value: MelodyAnalysis) => { value.notes[0]!.velocity = Infinity; },
    (value: MelodyAnalysis) => { value.notes[1]!.startSeconds = 0.5; },
    (value: MelodyAnalysis) => { value.notes[0]!.startSeconds = -1; },
    (value: MelodyAnalysis) => { value.notes[1]!.durationSeconds = 3; },
    (value: MelodyAnalysis) => { value.coverage = 0.1; },
    (value: MelodyAnalysis) => { value.notes = Array.from({ length: 513 }, () => ({ ...value.notes[0]! })); },
    (value: MelodyAnalysis) => { value.notes = []; value.coverage = 0; },
    (value: MelodyAnalysis) => { (value as unknown as Record<string, unknown>).remoteModel = 'unknown'; },
  ];
  for (const change of mutations) {
    const f = fixture(); const value = analysis(); change(value); f.handler(async () => value);
    await assert.rejects(f.recognition.analyze(f.input())); assert.equal(f.recognition.read().phase, 'idle'); assert(f.recognition.read().problem);
    assert.throws(() => f.recognition.adopt()); assert.equal(f.writes(), 0); assert.deepEqual(f.library.listContent(), []);
  }
});

test('invalid, overlong and stale inputs are refused before any analyzer or storage work', async () => {
  const f = fixture(); const wrong = { ...f.input(), sourceToken: 'other-source' }; await assert.rejects(f.recognition.analyze(wrong), /来源已改变/);
  await assert.rejects(f.recognition.analyze({ ...f.input(), audio: { sampleRate: 8000, channels: [new Float32Array(8000 * 31)] } }), /30 秒/);
  await assert.rejects(f.recognition.analyze({ ...f.input(), audio: { sampleRate: 8000, channels: [new Float32Array([Infinity])] } }), /非有限/);
  await assert.rejects(f.recognition.analyze({ ...f.input(), sourceName: '' }), /选好/);
  assert.equal(f.calls(), 0); assert.equal(f.writes(), 0);
});

test('analysis takes an owned PCM snapshot and returned diagnostics or plans cannot mutate pending music', async () => {
  const f = fixture(); const input = f.input(); const returned = analysis();
  f.handler(async received => { received.channels[0]!.fill(0.99); return returned; }); await f.recognition.analyze(input);
  assert.equal(input.audio.channels[0]![0], 0); returned.notes[0]!.frequencyHz = 999;
  const view = f.recognition.read(); view.result!.notes[0]!.frequencyHz = 888; view.result!.warnings.push('not shared');
  const preview = f.recognition.previewPlan(); assert.equal(preview.events[0]!.sound.note.frequencyHz, analysis().notes[0]!.frequencyHz);
  (preview.events[0]!.sound.note as { frequencyHz: number }).frequencyHz = 777;
  assert.equal(f.recognition.previewPlan().events[0]!.sound.note.frequencyHz, analysis().notes[0]!.frequencyHz);
});

test('musical owner factories are pure, independent and preserve fine seconds without inventing rhythmic quantization', () => {
  const voice = prepareBasicTimbre('试听声音'); const input = { name: '连续时间旋律', timbreId: voice.id, durationSeconds: 4,
    notes: [{ startSeconds: 0.123456789123, durationSeconds: 0.765432198765, frequencyHz: 321.123456789123, velocity: 0.456789123456 }] };
  const before = structuredClone(input); const first = preparePhraseFromSeconds(input); const second = preparePhraseFromSeconds(input);
  assert.notEqual(first.id, second.id); assert.notEqual(readPhraseBody(first.body).parts[0]!.notes[0]!.id, readPhraseBody(second.body).parts[0]!.notes[0]!.id);
  assert.deepEqual(input, before); assert.deepEqual(first.dependencies, [voice.id]);
  const memory = createMaterialLibrary(); memory.commitTransaction({ expectedToken: memory.currentToken(), label: '独立测试素材', createContents: [voice, first] });
  const plan = createPhrasePlayback(memory, createTimbrePlayback(memory)).planForSaved(first.id); const note = input.notes[0]!;
  assert.equal(plan.events[0]!.atSeconds, note.startSeconds); assert.equal(plan.events[0]!.sound.note.holdSeconds, note.durationSeconds);
  assert.equal(plan.events[0]!.sound.note.frequencyHz, note.frequencyHz); assert.equal(plan.durationSeconds, input.durationSeconds);
  assert.throws(() => preparePhraseFromSeconds({ ...input, notes: [{ ...note, startSeconds: 3.9, durationSeconds: 1 }] }), /结尾/);
  assert.throws(() => prepareBasicTimbre(''), /名称/);
});
