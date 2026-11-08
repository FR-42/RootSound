import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createBrowserMelodyAnalyzer } from '../src/workstation/modules/melody-recognition/browser.ts';
import type { MelodyAnalysis } from '../src/workstation/contracts/melody-recognition.ts';

class FakeWorker {
  onmessage: ((event: { data: unknown }) => void) | null = null;
  onerror: ((event: { preventDefault(): void }) => void) | null = null;
  onmessageerror: (() => void) | null = null;
  terminated = 0; posted: unknown; transferred: Transferable[] = []; failPost = false;
  postMessage(message: unknown, transferred: Transferable[]) { if (this.failPost) throw new Error('worker not available'); this.posted = message; this.transferred = transferred; }
  terminate() { this.terminated++; }
  send(data: unknown) { this.onmessage?.({ data }); }
}
const pcm = () => ({ sampleRate: 8000, channels: [new Float32Array(8000).fill(0.25)] });
const result: MelodyAnalysis = { durationSeconds: 1, channelIndex: 0, notes: [{ startSeconds: 0.1, durationSeconds: 0.7, frequencyHz: 220.123, velocity: 0.6, confidence: 0.95 }], coverage: 0.7, warnings: [] };

test('background analysis transfers owned copies without detaching or modifying the original sample', async () => {
  const worker = new FakeWorker(); const analyzer = createBrowserMelodyAnalyzer(() => worker as unknown as Worker);
  const input = pcm(); const progress: number[] = []; const pending = analyzer.analyze(input, { onProgress: value => progress.push(value) });
  const posted = worker.posted as { audio: ReturnType<typeof pcm> };
  assert.notEqual(posted.audio.channels[0]!.buffer, input.channels[0]!.buffer);
  assert.equal(worker.transferred[0], posted.audio.channels[0]!.buffer);
  input.channels[0]![0] = -0.5; assert.equal(posted.audio.channels[0]![0], 0.25);
  worker.send({ type: 'progress', value: 0.5 }); worker.send({ type: 'result', analysis: result });
  assert.deepEqual(await pending, result); assert.deepEqual(progress, [0.5]); assert.equal(worker.terminated, 1);
  assert.equal(input.channels[0]!.length, 8000); analyzer.dispose(); assert.equal(worker.terminated, 1);
});

test('cancelling a worker promptly rejects and ignores a captured late result callback', async () => {
  const worker = new FakeWorker(); const analyzer = createBrowserMelodyAnalyzer(() => worker as unknown as Worker);
  const cancellation = new AbortController(); const pending = analyzer.analyze(pcm(), { signal: cancellation.signal });
  const late = worker.onmessage!; const rejected = assert.rejects(pending, /取消/); cancellation.abort(); await rejected;
  late({ data: { type: 'result', analysis: result } }); assert.equal(worker.terminated, 1); assert.equal(worker.onmessage, null); analyzer.dispose();
});

test('dispose cancels all active requests and refuses new analysis without constructing a worker', async () => {
  const workers: FakeWorker[] = []; const analyzer = createBrowserMelodyAnalyzer(() => { const worker = new FakeWorker(); workers.push(worker); return worker as unknown as Worker; });
  const first = analyzer.analyze(pcm()); const second = analyzer.analyze(pcm());
  const a = assert.rejects(first, /取消/); const b = assert.rejects(second, /取消/); analyzer.dispose(); await Promise.all([a, b]);
  assert(workers.every(worker => worker.terminated === 1)); await assert.rejects(analyzer.analyze(pcm()), /关闭/); assert.equal(workers.length, 2);
});

test('invalid source or an already cancelled request never launches the worker', async () => {
  let created = 0; const analyzer = createBrowserMelodyAnalyzer(() => { created++; return new FakeWorker() as unknown as Worker; });
  const cancelled = new AbortController(); cancelled.abort();
  await assert.rejects(analyzer.analyze(pcm(), { signal: cancelled.signal }), /取消/);
  await assert.rejects(analyzer.analyze({ sampleRate: 8000, channels: [new Float32Array(8000 * 31)] }), /30 秒/);
  await assert.rejects(analyzer.analyze({ sampleRate: 8000, channels: [new Float32Array([NaN])] }), /数值/);
  assert.equal(created, 0); analyzer.dispose();
});

test('worker errors, invalid protocol and post failures release their request without a stuck progress state', async () => {
  for (const mode of ['error', 'messageerror', 'invalid', 'post'] as const) {
    const worker = new FakeWorker(); worker.failPost = mode === 'post';
    const analyzer = createBrowserMelodyAnalyzer(() => worker as unknown as Worker); const pending = analyzer.analyze(pcm());
    const rejected = assert.rejects(pending);
    if (mode === 'error') worker.onerror!({ preventDefault() {} });
    else if (mode === 'messageerror') worker.onmessageerror!();
    else if (mode === 'invalid') worker.send({ type: 'progress', value: Infinity });
    await rejected; assert.equal(worker.terminated, 1); analyzer.dispose();
  }
});

test('observer errors do not prevent completion and a constructor failure is reported', async () => {
  const worker = new FakeWorker(); const analyzer = createBrowserMelodyAnalyzer(() => worker as unknown as Worker);
  const pending = analyzer.analyze(pcm(), { onProgress() { throw new Error('view'); } });
  worker.send({ type: 'progress', value: 0.1 }); worker.send({ type: 'result', analysis: result }); assert.deepEqual(await pending, result);
  const failed = createBrowserMelodyAnalyzer(() => { throw new Error('cannot load worker'); });
  await assert.rejects(failed.analyze(pcm()), /cannot load/); failed.dispose(); analyzer.dispose();
});
