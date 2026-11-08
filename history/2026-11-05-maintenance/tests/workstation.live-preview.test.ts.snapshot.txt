import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { MaterialStorage } from '../src/workstation/contracts/content.ts';
import type { SoundPlan, SoundRuntimePort } from '../src/workstation/contracts/sound.ts';
import { createMaterialLibrary } from '../src/workstation/modules/materials/public.ts';
import { createTimbreEditor } from '../src/workstation/modules/timbre/public.ts';
import { createLivePreview } from '../src/workstation/modules/ui-rendering/live-preview.ts';

function frameClock() {
  let sequence = 0;
  const callbacks = new Map<number, () => void>();
  const cancelled: number[] = [];
  return {
    request(callback: () => void): number { const id = ++sequence; callbacks.set(id, callback); return id; },
    cancel(id: number): void { cancelled.push(id); callbacks.delete(id); },
    tick(): void {
      const current = [...callbacks];
      for (const [id] of current) callbacks.delete(id);
      for (const [, callback] of current) callback();
    },
    get queued() { return callbacks.size; },
    cancelled,
  };
}

function plan(level: number): SoundPlan {
  return {
    kind: 'basic-synth', version: 1,
    sources: [{ waveform: 'sine', frequencyRatio: 1, level: 1 }],
    envelope: { attackSeconds: 0.02, releaseSeconds: 0.3 },
    note: { frequencyHz: 220, holdSeconds: 4, velocity: 0.7 }, level,
  };
}

function liveHarness() {
  const frames = frameClock();
  const updates: Array<{ id: string; plan: Parameters<SoundRuntimePort['update']>[1] }> = [];
  const errors: unknown[] = [];
  let sessionId: string | undefined = 'playing-1';
  let updateError: Error | undefined;
  const live = createLivePreview({ update(id, next) {
    if (updateError) throw updateError;
    updates.push({ id, plan: next }); return undefined;
  } }, () => sessionId, error => errors.push(error), frames);
  return {
    frames, updates, errors, live,
    session(id: string | undefined) { sessionId = id; },
    failUpdate(error: Error | undefined) { updateError = error; },
  };
}

test('rapid slider input compiles and submits only the latest audible value on the next frame', () => {
  const h = liveHarness(); const compiled: number[] = [];
  for (const level of [0.2, 0.4, 0.8]) {
    h.live.request(() => { compiled.push(level); return plan(level); });
  }
  assert.deepEqual(compiled, []);
  assert.deepEqual(h.updates, []);
  assert.equal(h.frames.queued, 1);
  h.frames.tick();
  assert.deepEqual(compiled, [0.8]);
  assert.deepEqual(h.updates, [{ id: 'playing-1', plan: plan(0.8) }]);
  assert.equal(h.frames.queued, 0);
  h.frames.tick();
  assert.equal(h.updates.length, 1);
});

test('committing a gesture flushes its final value immediately and cancels the provisional frame', () => {
  const h = liveHarness(); let provisionalBuilds = 0;
  h.live.request(() => { provisionalBuilds++; return plan(0.2); });
  h.live.flush(() => plan(0.6));
  assert.equal(provisionalBuilds, 0);
  assert.equal(h.frames.queued, 0);
  assert.equal(h.frames.cancelled.length, 1);
  assert.deepEqual(h.updates, [{ id: 'playing-1', plan: plan(0.6) }]);
  h.frames.tick();
  assert.equal(h.updates.length, 1);
});

test('flushing without a replacement delivers the latest queued value once', () => {
  const h = liveHarness();
  h.live.request(() => plan(0.2)); h.live.request(() => plan(0.7));
  h.live.flush(); h.live.flush(); h.frames.tick();
  assert.deepEqual(h.updates, [{ id: 'playing-1', plan: plan(0.7) }]);
});

test('input queued by an old transport cannot compile or alter its replacement session', () => {
  const h = liveHarness(); let oldBuilds = 0;
  h.live.request(() => { oldBuilds++; return plan(0.1); });
  h.session('playing-2'); h.frames.tick();
  assert.equal(oldBuilds, 0);
  assert.deepEqual(h.updates, []);
  h.live.request(() => plan(0.9)); h.frames.tick();
  assert.deepEqual(h.updates, [{ id: 'playing-2', plan: plan(0.9) }]);
});

test('stopping before the frame drops pending input and ignores further input while stopped', () => {
  const h = liveHarness(); let builds = 0;
  const build = () => { builds++; return plan(0.5); };
  h.live.request(build); h.session(undefined); h.frames.tick();
  h.live.request(build); h.live.flush(build); h.frames.tick();
  assert.equal(builds, 0);
  assert.equal(h.frames.queued, 0);
  assert.deepEqual(h.updates, []);
  assert.deepEqual(h.errors, []);
});

test('cancelling a gesture discards it without disabling later live input', () => {
  const h = liveHarness(); let abandonedBuilds = 0;
  h.live.request(() => { abandonedBuilds++; return plan(0.2); });
  h.live.cancel(); h.live.cancel(); h.frames.tick(); h.live.flush();
  assert.equal(abandonedBuilds, 0);
  assert.deepEqual(h.updates, []);
  h.live.request(() => plan(0.4)); h.frames.tick();
  assert.deepEqual(h.updates, [{ id: 'playing-1', plan: plan(0.4) }]);
});

test('a compilation error is reported without submitting a broken plan or poisoning the next edit', () => {
  const h = liveHarness(); const failure = new Error('This provisional melody cannot be compiled.');
  h.live.request(() => { throw failure; });
  assert.doesNotThrow(() => h.frames.tick());
  assert.deepEqual(h.errors, [failure]);
  assert.deepEqual(h.updates, []);
  h.live.request(() => plan(0.3)); h.frames.tick();
  assert.deepEqual(h.updates, [{ id: 'playing-1', plan: plan(0.3) }]);
});

test('a device update error is reported and a later gesture can still update playback', () => {
  const h = liveHarness(); const failure = new Error('The device temporarily rejected this update.');
  h.failUpdate(failure); h.live.request(() => plan(0.1));
  assert.doesNotThrow(() => h.live.flush());
  assert.deepEqual(h.errors, [failure]);
  assert.deepEqual(h.updates, []);
  assert.equal(h.frames.queued, 0);
  h.failUpdate(undefined); h.live.request(() => plan(0.75)); h.frames.tick();
  assert.deepEqual(h.updates, [{ id: 'playing-1', plan: plan(0.75) }]);
});

test('temporary timbre preview hears the proposed settings without persisting a draft or history change', () => {
  let data: string | null = null; let writes = 0;
  const storage: MaterialStorage = { read: () => data, write(value) { data = value; writes++; } };
  const library = createMaterialLibrary(storage); const editor = createTimbreEditor(library);
  const before = editor.read(); const beforeHistory = library.readDraftHistory(before.draft.id);
  const beforeStorage = data; const beforeWrites = writes;
  const proposed = { ...before.body, character: 'bright' as const, attackSeconds: 0.7, releaseSeconds: 1.8, level: 0.2 };
  const audible = editor.previewPlan(proposed);
  assert.equal(audible.level, proposed.level);
  assert.deepEqual(audible.envelope, { attackSeconds: 0.7, releaseSeconds: 1.8 });
  const original = editor.previewPlan();
  assert.equal(audible.kind, 'basic-synth'); assert.equal(original.kind, 'basic-synth');
  if (audible.kind !== 'basic-synth' || original.kind !== 'basic-synth') assert.fail('The basic draft must compile to basic synthesis.');
  assert.notDeepEqual(audible.sources, original.sources);
  assert.deepEqual(editor.read(), before);
  assert.deepEqual(library.readDraftHistory(before.draft.id), beforeHistory);
  assert.equal(data, beforeStorage); assert.equal(writes, beforeWrites);
  assert.equal(library.listContent().length, 0);
  assert.throws(() => editor.previewPlan({ ...proposed, level: 2 }));
  assert.deepEqual(editor.read(), before);
  assert.equal(data, beforeStorage); assert.equal(writes, beforeWrites);
});

function deferred() {
  let resolve!: () => void; let reject!: (error: Error) => void;
  const promise = new Promise<void>((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}
async function microtasks(): Promise<void> { await Promise.resolve(); await Promise.resolve(); }

test('live sample preparation waits before compiling and cannot update a replacement transport', async () => {
  const preparation = deferred(); const updates: unknown[] = []; const errors: unknown[] = []; const frames = frameClock();
  let sessionId = 'first'; let builds = 0;
  const live = createLivePreview({ update(id, next) { updates.push({ id, next }); return undefined; } }, () => sessionId, error => errors.push(error), frames, () => preparation.promise);
  live.flush(() => { builds++; return plan(0.3); });
  assert.equal(builds, 0); sessionId = 'replacement'; preparation.resolve(); await microtasks();
  assert.equal(builds, 0); assert.deepEqual(updates, []); assert.deepEqual(errors, []);
});

test('a later live gesture supersedes an unresolved sample preparation', async () => {
  const first = deferred(); const second = deferred(); const updates: unknown[] = []; const frames = frameClock(); let preparations = 0;
  const live = createLivePreview({ update(id, next) { updates.push({ id, next }); return undefined; } }, () => 'playing', error => assert.fail(String(error)), frames, () => ++preparations === 1 ? first.promise : second.promise);
  live.flush(() => plan(0.1)); live.request(() => plan(0.8)); frames.tick();
  second.resolve(); await microtasks(); first.resolve(); await microtasks();
  assert.deepEqual(updates, [{ id: 'playing', next: plan(0.8) }]);
});

test('live preparation failure is reported and a subsequent gesture can recover', async () => {
  const failure = new Error('The sample could not be decoded.'); const updates: unknown[] = []; const errors: unknown[] = []; const frames = frameClock(); let fail = true;
  const live = createLivePreview({ update(id, next) { updates.push({ id, next }); return undefined; } }, () => 'playing', error => errors.push(error), frames,
    async () => { if (fail) throw failure; });
  live.flush(() => plan(0.1)); await microtasks(); assert.deepEqual(errors, [failure]); assert.deepEqual(updates, []);
  fail = false; live.flush(() => plan(0.5)); await microtasks(); assert.deepEqual(updates, [{ id: 'playing', next: plan(0.5) }]);
});

test('cancelling pending live preparation ignores its late failure and preserves later updates', async () => {
  const first = deferred(); const updates: unknown[] = []; const errors: unknown[] = []; const frames = frameClock(); let calls = 0;
  const live = createLivePreview({ update(id, next) { updates.push({ id, next }); return undefined; } }, () => 'playing', error => errors.push(error), frames, () => ++calls === 1 ? first.promise : Promise.resolve());
  live.flush(() => plan(0.1)); live.cancel(); first.reject(new Error('Late cancelled decoder failure')); await microtasks();
  assert.deepEqual(errors, []); assert.deepEqual(updates, []);
  live.flush(() => plan(0.9)); await microtasks(); assert.deepEqual(updates, [{ id: 'playing', next: plan(0.9) }]);
});
