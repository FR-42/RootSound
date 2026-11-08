import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { createBrowserSampleCapture, createBrowserSampleDecoder } from '../src/workstation/modules/sampling/browser.ts';
import { encodeFloatWav } from '../src/workstation/modules/sampling/audio.ts';

class Track {
  stopped = 0; listeners = new Set<() => void>();
  readyState = 'live';
  stop() { this.stopped++; this.readyState = 'ended'; }
  addEventListener(_name: string, listener: () => void) { this.listeners.add(listener); }
  removeEventListener(_name: string, listener: () => void) { this.listeners.delete(listener); }
  end() { this.readyState = 'ended'; for (const listener of this.listeners) listener(); }
}
class Stream { track = new Track(); getTracks() { return [this.track]; } }
class Node {
  disconnected = false; connected = false;
  connect(_node: unknown) { this.connected = true; }
  disconnect() { this.disconnected = true; }
}
class Port {
  onmessage: ((event: { data: unknown }) => void) | null = null;
  closed = false;
  postMessage(value: { type: string }) { if (value.type === 'stop') queueMicrotask(() => this.send({ type: 'done' })); }
  close() { this.closed = true; }
  send(data: unknown) { this.onmessage?.({ data }); }
}
class Worklet extends Node {
  static instances: Worklet[] = [];
  port = new Port(); onprocessorerror: (() => void) | null = null;
  options: AudioWorkletNodeOptions;
  constructor(_context: unknown, name: string, options: AudioWorkletNodeOptions) {
    super(); assert.equal(name, 'rootsound-capture'); this.options = options; Worklet.instances.push(this);
  }
}
class Context {
  static instances: Context[] = [];
  static module: Promise<void> = Promise.resolve();
  state = 'suspended'; sampleRate = 8000; closed = 0;
  destination = new Node(); input = new Node(); onstatechange: (() => void) | null = null;
  audioWorklet = { addModule: (url: string) => { assert(url.endsWith('capture-worklet.js')); return Context.module; } };
  constructor() { Context.instances.push(this); }
  createMediaStreamSource(_stream: unknown) { return this.input; }
  async resume() { this.state = 'running'; }
  async close() { this.closed++; this.state = 'closed'; }
  suspend() { this.state = 'suspended'; this.onstatechange?.(); }
}
function deferred<T>() { let resolve!: (value: T) => void; const promise = new Promise<T>(done => { resolve = done; }); return { promise, resolve }; }
async function environment(run: (stream: Stream, requests: MediaStreamConstraints[]) => Promise<void>,
  getMedia?: () => Promise<Stream>, module: Promise<void> = Promise.resolve()) {
  const names = ['navigator', 'AudioContext', 'AudioWorkletNode', 'OfflineAudioContext'] as const;
  const originals = names.map(name => [name, Object.getOwnPropertyDescriptor(globalThis, name)] as const);
  const stream = new Stream(); const requests: MediaStreamConstraints[] = [];
  Context.instances = []; Worklet.instances = []; Context.module = module;
  Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { mediaDevices: {
    getUserMedia(constraints: MediaStreamConstraints) { requests.push(constraints); return getMedia ? getMedia() : Promise.resolve(requests.length === 1 ? stream : new Stream()); },
  } } });
  Object.defineProperty(globalThis, 'AudioContext', { configurable: true, value: Context });
  Object.defineProperty(globalThis, 'AudioWorkletNode', { configurable: true, value: Worklet });
  Reflect.deleteProperty(globalThis, 'OfflineAudioContext');
  try { await run(stream, requests); }
  finally { for (const [name, original] of originals) { if (original) Object.defineProperty(globalThis, name, original); else Reflect.deleteProperty(globalThis, name); } }
}

test('input capture preserves float samples, reports progress and stops the microphone before finalizing', async () => environment(async (stream, requests) => {
  const capture = createBrowserSampleCapture(); assert.equal(requests.length, 0);
  const progress: number[] = []; const recording = await capture.start(seconds => { progress.push(seconds); });
  assert.deepEqual(requests[0], { video: false, audio: { channelCount: 1, echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
  const node = Worklet.instances[0]!; const data = new Float32Array([0, -0.234567, 0.75, 1.1]);
  node.port.send({ type: 'chunk', data }); recording.stop();
  assert(stream.track.stopped > 0);
  const audio = await recording.result;
  assert.equal(audio.sampleRate, 8000); assert.deepEqual(audio.channels, [data]); assert.deepEqual(progress, [4 / 8000]);
  assert(node.port.closed && node.disconnected && Context.instances[0]!.input.disconnected);
  assert.equal(Context.instances[0]!.closed, 1); capture.cancel();
}));

test('cancelled permission requests reject promptly and close a microphone stream that arrives later', async () => {
  const incoming = deferred<Stream>(); const late = new Stream();
  await environment(async () => {
    const capture = createBrowserSampleCapture(); const pending = capture.start(() => {});
    const rejected = assert.rejects(pending, /取消/); capture.cancel(); await rejected;
    incoming.resolve(late); await Promise.resolve(); await Promise.resolve();
    assert(late.track.stopped > 0); assert.equal(Context.instances.length, 0); assert.equal(Worklet.instances.length, 0);
  }, () => incoming.promise);
});

test('cancellation during worklet loading releases input and cannot start a late graph', async () => {
  const module = deferred<void>();
  await environment(async stream => {
    const capture = createBrowserSampleCapture(); const pending = capture.start(() => {});
    for (let count = 0; count < 8 && !Context.instances.length; count++) await Promise.resolve();
    assert.equal(Context.instances.length, 1);
    const rejected = assert.rejects(pending, /取消/); capture.cancel(); await rejected;
    assert(stream.track.stopped > 0); assert.equal(Context.instances[0]!.closed, 1);
    module.resolve(); await Promise.resolve(); assert.equal(Worklet.instances.length, 0);
  }, undefined, module.promise);
});

test('permission refusal is readable and does not prevent a later explicit recording attempt', async () => {
  let first = true; const stream = new Stream();
  await environment(async () => {
    const capture = createBrowserSampleCapture(); await assert.rejects(capture.start(() => {}), /尚未获准/);
    const recording = await capture.start(() => {}); const rejected = assert.rejects(recording.result, /取消/);
    recording.cancel(); await rejected; assert(stream.track.stopped > 0);
  }, () => { if (first) { first = false; return Promise.reject(new DOMException('denied', 'NotAllowedError')); } return Promise.resolve(stream); });
});

test('a microphone disconnected while the worklet is loading cannot become a silent recording', async () => {
  const module = deferred<void>();
  await environment(async stream => {
    const capture = createBrowserSampleCapture(); const pending = capture.start(() => {});
    for (let count = 0; count < 8 && !Context.instances.length; count++) await Promise.resolve();
    assert.equal(Context.instances.length, 1);
    const rejected = assert.rejects(pending, /断开/); stream.track.end(); await rejected;
    assert(stream.track.stopped > 0); assert.equal(Context.instances[0]!.closed, 1);
    module.resolve(); await Promise.resolve(); assert.equal(Worklet.instances.length, 0);
  }, undefined, module.promise);
});

test('device interruption rejects the partial take and releases every input resource', async () => environment(async stream => {
  const capture = createBrowserSampleCapture(); const recording = await capture.start(() => { throw new Error('observer'); });
  Worklet.instances[0]!.port.send({ type: 'chunk', data: new Float32Array([0.5]) });
  const rejected = assert.rejects(recording.result, /暂停/); Context.instances[0]!.suspend(); await rejected;
  assert(stream.track.stopped > 0); assert(Worklet.instances[0]!.disconnected);
}));

test('malformed capture data and empty takes are explicit failures, never silently saved as valid audio', async () => environment(async () => {
  const capture = createBrowserSampleCapture(); let recording = await capture.start(() => {});
  let rejected = assert.rejects(recording.result, /无效/);
  Worklet.instances[0]!.port.send({ type: 'chunk', data: new Float32Array([NaN]) }); await rejected;
  recording = await capture.start(() => {}); rejected = assert.rejects(recording.result, /还没有/); recording.stop(); await rejected;
}));

test('native-rate PCM WAV decoding uses no playback device and preserves the source bytes', async () => environment(async () => {
  const audio = { sampleRate: 8000, channels: [new Float32Array([0, -0.25, 0.1234567, 1])] };
  const bytes = encodeFloatWav(audio); const before = bytes.slice();
  assert.deepEqual(await createBrowserSampleDecoder().decode(bytes), audio); assert.deepEqual(bytes, before);
  assert.equal(Context.instances.length, 0);
}));

test('other codecs decode offline into owned PCM and report unsupported codecs without changing input', async () => environment(async () => {
  const channel = new Float32Array([0, 1, -0.5]); let fail = false;
  class Offline {
    async decodeAudioData(_bytes: ArrayBuffer) {
      if (fail) throw new Error('codec unsupported');
      return { sampleRate: 48000, numberOfChannels: 1, getChannelData: () => channel };
    }
  }
  Object.defineProperty(globalThis, 'OfflineAudioContext', { configurable: true, value: Offline });
  const bytes = new Uint8Array([1, 2, 3, 4]); const result = await createBrowserSampleDecoder().decode(bytes);
  channel[0] = 1; assert.equal(result.channels[0]![0], 0); assert.deepEqual([...bytes], [1, 2, 3, 4]);
  fail = true; await assert.rejects(createBrowserSampleDecoder().decode(bytes), /暂时无法读取/);
  assert.equal(Context.instances.length, 0);
}));

type Processor = { process(inputs: Float32Array[][], outputs: Float32Array[][]): boolean; port: {
  onmessage: ((event: { data: { type: string } }) => void) | null;
} };
function processor(maxFrames: number) {
  const messages: Array<{ type: string; data?: Float32Array }> = [];
  let Constructor!: new (options: { processorOptions: { maxFrames: number } }) => Processor;
  class Base { port = { onmessage: null, postMessage(value: { type: string; data?: Float32Array }) { messages.push(value); } }; }
  runInNewContext(readFileSync(new URL('../src/workstation/modules/sampling/capture-worklet.js', import.meta.url), 'utf8'), {
    AudioWorkletProcessor: Base, Float32Array,
    registerProcessor(name: string, value: typeof Constructor) { assert.equal(name, 'rootsound-capture'); Constructor = value; },
  });
  return { worklet: new Constructor({ processorOptions: { maxFrames } }), messages };
}

test('the shipped worklet outputs silence, stops exactly at its frame limit and flushes a final partial batch', () => {
  const { worklet, messages } = processor(5); const output = new Float32Array([1, 1, 1, 1]);
  assert.equal(worklet.process([[new Float32Array([0.1, 0.2, 0.3, 0.4])]], [[output]]), true);
  assert.deepEqual([...output], [0, 0, 0, 0]);
  assert.equal(worklet.process([[new Float32Array([0.5, 0.6, 0.7])]], [[output]]), false);
  assert.deepEqual(messages.map(message => message.type), ['chunk', 'done']);
  assert.deepEqual(messages[0]!.data, new Float32Array([0.1, 0.2, 0.3, 0.4, 0.5]));
  worklet.port.onmessage!({ data: { type: 'stop' } }); assert.equal(messages.length, 2);
});

test('manual worklet stop flushes all accumulated frames once and never emits the remaining input', () => {
  const { worklet, messages } = processor(10000);
  worklet.process([[new Float32Array([0.25, -0.5])]], [[]]); worklet.port.onmessage!({ data: { type: 'stop' } });
  assert.deepEqual(messages[0]!.data, new Float32Array([0.25, -0.5])); assert.equal(messages[1]!.type, 'done');
  assert.equal(worklet.process([[new Float32Array([1])]], [[]]), false); assert.equal(messages.length, 2);
});
