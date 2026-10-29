import test from 'node:test';
import assert from 'node:assert/strict';
import { createAudioClient } from '../web/audio-client.mjs';
import { createDefaultPatch } from '../web/model.mjs';

const tick = () => new Promise(resolve => setImmediate(resolve));
function fixture({ deferredModule = false } = {}) {
  const workers = [], sent = [], errors = []; let devices = 0, moduleReady;
  const module = deferredModule ? new Promise(resolve => { moduleReady = resolve; }) : Promise.resolve();
  const context = { sampleRate: 48000, currentTime: 0, state: 'running', destination: {},
    audioWorklet: { addModule: () => module },
    createAnalyser: () => ({ connect() {}, disconnect() {} }), close: async () => {} };
  const node = { port: { postMessage: message => sent.push(message) }, connect() {}, disconnect() {} };
  const client = createAudioClient({ onError: reason => errors.push(reason),
    contextFactory: () => { devices++; return context; }, nodeFactory: () => node,
    workerFactory: kind => { const worker = { kind, requests: [], terminated: false,
      postMessage(message) { this.requests.push(message); }, terminate() { this.terminated = true; },
      respond(message, extra = {}) { this.onmessage({ data: { id: message.id, type: message.type === 'prepare' ? 'prepared' : 'rendered', prepared: { tag: message.patch.name }, ...extra } }); },
    }; workers.push(worker); return worker; },
  });
  client.setPatch(createDefaultPatch());
  return { client, workers, sent, errors, context, get devices() { return devices; }, moduleReady };
}

test('editing and offline export never initialize a real audio context', async () => {
  const f = fixture(); assert.equal(f.devices, 0);
  const render = f.client.render(createDefaultPatch(), { midi: 60 });
  assert.equal(f.devices, 0); assert.equal(f.workers[0].kind, 'render');
  f.workers[0].respond(f.workers[0].requests[0], { bytes: new ArrayBuffer(0) }); await render;
  await f.client.dispose();
});

test('release or panic during device initialization cannot produce a late stuck note', async () => {
  const f = fixture({ deferredModule: true });
  const pressed = f.client.noteOn('key', 60); f.client.noteOff('key');
  f.moduleReady(); await pressed;
  assert.equal(f.sent.some(message => message.type === 'noteOn'), false);
  assert.equal(f.workers.length, 0); assert.equal(f.client.activeKeys.size, 0);
  await f.client.dispose();
});

test('a chord shares one preparation and subsequent notes reuse the installed sound', async () => {
  const f = fixture();
  const notes = [60, 64, 67].map(midi => f.client.noteOn(String(midi), midi)); await tick();
  assert.equal(f.workers.length, 1); assert.equal(f.workers[0].requests.length, 1);
  f.workers[0].respond(f.workers[0].requests[0]); await Promise.all(notes);
  assert.equal(f.client.noteClock.polyphonic, true);
  await f.client.noteOn('next', 72);
  assert.equal(f.workers[0].requests.length, 1);
  assert.equal(f.sent.filter(m => m.type === 'noteOn').length, 4); await f.client.dispose();
});

test('release during preparation suppresses noteOn; preparation results cannot go backwards', async () => {
  const f = fixture(); const one = f.client.noteOn('a', 60); await tick();
  const worker = f.workers[0], first = worker.requests[0];
  const newer = createDefaultPatch(); newer.name = 'new'; f.client.setPatch(newer);
  const two = f.client.noteOn('b', 64); await tick(); const second = worker.requests[1];
  worker.respond(second); await two;
  f.client.noteOff('a'); worker.respond(first); await one;
  assert.equal(f.sent.filter(m => m.type === 'patch').at(-1).patch.name, 'new');
  assert.deepEqual(f.sent.filter(m => m.type === 'noteOn').map(m => m.id), ['b']);
  await f.client.dispose();
});

test('render cancellation terminates its worker, preserves live audition, and allows another render', async () => {
  const f = fixture(); const note = f.client.noteOn('a', 60); await tick();
  const live = f.workers[0]; live.respond(live.requests[0]); await note;
  const controller = new AbortController(); const render = f.client.render(createDefaultPatch(), {}, controller.signal);
  const rejected = assert.rejects(render, { name: 'AbortError' }); controller.abort(); await rejected;
  assert.equal(f.workers[1].terminated, true); assert.equal(live.terminated, false);
  assert.equal(f.client.activeKeys.has(60), true);
  const retry = f.client.render(createDefaultPatch(), {}); const worker = f.workers.at(-1);
  worker.respond(worker.requests[0]); await retry; assert.notEqual(worker, f.workers[1]);
  await f.client.dispose();
});

test('continuous changes are coalesced without waiting for the end of a drag', async () => {
  const f = fixture(); const note = f.client.noteOn('a', 60); await tick();
  const worker = f.workers[0]; worker.respond(worker.requests[0]); await note;
  const patch = createDefaultPatch(); patch.name = 'drag-1'; f.client.setPatch(patch);
  await new Promise(resolve => setTimeout(resolve, 25));
  assert.equal(worker.requests.length, 2);
  for (let index = 2; index <= 40; index++) { patch.name = `drag-${index}`; f.client.setPatch(patch); }
  worker.respond(worker.requests[1]); await tick();
  assert.equal(f.sent.filter(m => m.type === 'patch').at(-1).patch.name, 'drag-1');
  await new Promise(resolve => setTimeout(resolve, 25));
  assert.equal(worker.requests.length, 3); assert.equal(worker.requests[2].patch.name, 'drag-40');
  worker.respond(worker.requests[2]); await tick();
  assert.equal(f.sent.filter(m => m.type === 'patch').at(-1).patch.name, 'drag-40');
  await f.client.dispose();
});

test('worker failure reports the error and the next render creates a fresh worker', async () => {
  const f = fixture(); const failed = f.client.render(createDefaultPatch(), {});
  const rejection = assert.rejects(failed, /broken/); f.workers[0].onerror({ message: 'broken' }); await rejection;
  const next = f.client.render(createDefaultPatch(), {}); f.workers[1].respond(f.workers[1].requests[0]); await next;
  assert.equal(f.workers[0].terminated, true); await f.client.dispose();
});

test('a device creation failure can be retried and does not retain a phantom pressed key', async () => {
  let attempts = 0; const errors = [];
  const client = createAudioClient({ contextFactory: () => { attempts++; throw new Error('device unavailable'); }, onError: reason => errors.push(reason) });
  client.setPatch(createDefaultPatch());
  await client.noteOn('one', 60); await client.noteOn('two', 62);
  assert.equal(attempts, 2); assert.equal(errors.length, 2); assert.equal(client.activeKeys.size, 0);
  await client.dispose();
});

test('analysis clock distinguishes attacks and does not release the newest same-pitch key by mistake', async () => {
  const f = fixture(); f.context.currentTime = 1;
  const first = f.client.noteOn('one', 60); await tick(); f.workers[0].respond(f.workers[0].requests[0]); await first;
  assert.equal(f.client.analyser.fftSize, 8192);
  const serial = f.client.noteClock.serial;
  f.context.currentTime = 1.05; await f.client.noteOn('two', 60);
  assert(f.client.noteClock.serial > serial); assert.equal(f.client.noteClock.id, 'two');
  f.context.currentTime = 1.10; f.client.noteOff('one'); assert.equal(f.client.noteClock.released, null);
  f.context.currentTime = 1.15; f.client.noteOff('two'); assert.equal(f.client.noteClock.released, 1.15);
  await f.client.noteOn('two', 60); assert.equal(f.client.noteClock.started, 1.15); assert.equal(f.client.noteClock.released, null);
  await f.client.dispose();
});
