import assert from 'node:assert/strict';
import test from 'node:test';
import type { SoundPlan, SoundRuntimeEvent } from '../../contracts/sound.ts';
import { createBrowserSoundRuntime } from './browser.ts';

class FakeParam {
  setValueAtTime(): void { /* Recording is unnecessary for lifecycle checks. */ }
  linearRampToValueAtTime(): void { /* Recording is unnecessary for lifecycle checks. */ }
}

class FakeNode {
  disconnected = false;
  connect(): void { /* A fake device does not produce audio. */ }
  disconnect(): void { this.disconnected = true; }
}

class FakeGain extends FakeNode { readonly gain = new FakeParam(); }

class FakeOscillator extends FakeNode {
  readonly frequency = new FakeParam();
  type = 'sine';
  onended: (() => void) | null = null;
  started = false;
  stopped = false;
  start(): void { this.started = true; }
  stop(time?: number): void { if (time === undefined) this.stopped = true; }
  end(): void { this.onended?.(); }
}

class FakeAudioContext {
  static mode: 'normal' | 'blocked' | 'rejected' = 'normal';
  static instances: FakeAudioContext[] = [];
  readonly currentTime = 1;
  readonly sampleRate = 48000;
  readonly destination = new FakeNode();
  readonly oscillators: FakeOscillator[] = [];
  readonly gains: FakeGain[] = [];
  state = FakeAudioContext.mode === 'normal' ? 'running' : 'suspended';
  onstatechange: (() => void) | null = null;
  closeCount = 0;

  constructor() { FakeAudioContext.instances.push(this); }
  createOscillator(): FakeOscillator {
    const node = new FakeOscillator();
    this.oscillators.push(node);
    return node;
  }
  createGain(): FakeGain {
    const node = new FakeGain();
    this.gains.push(node);
    return node;
  }
  resume(): Promise<void> {
    if (FakeAudioContext.mode === 'rejected') return Promise.reject(new Error('device denied'));
    if (FakeAudioContext.mode === 'blocked') return new Promise(() => {});
    this.state = 'running';
    this.onstatechange?.();
    return Promise.resolve();
  }
  close(): Promise<void> {
    this.closeCount += 1;
    this.state = 'closed';
    this.onstatechange?.();
    return Promise.resolve();
  }
  suspend(): void {
    this.state = 'suspended';
    this.onstatechange?.();
  }
}

function plan(): SoundPlan {
  return {
    kind: 'basic-synth', version: 1,
    sources: [{ waveform: 'sine', frequencyRatio: 1, level: 1 }],
    envelope: { attackSeconds: 0.01, releaseSeconds: 0.02 },
    note: { frequencyHz: 440, holdSeconds: 0.1, velocity: 0.8 },
    level: 0.2,
  };
}

async function fixture(run: () => Promise<void>, mode: typeof FakeAudioContext.mode = 'normal'): Promise<void> {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'AudioContext');
  FakeAudioContext.mode = mode;
  FakeAudioContext.instances = [];
  Object.defineProperty(globalThis, 'AudioContext', { configurable: true, value: FakeAudioContext });
  try { await run(); } finally {
    if (descriptor === undefined) Reflect.deleteProperty(globalThis, 'AudioContext');
    else Object.defineProperty(globalThis, 'AudioContext', descriptor);
  }
}

function audio(): FakeAudioContext { return FakeAudioContext.instances[0]!; }

test('natural completion releases every node and reports one ended session', async () => fixture(async () => {
  const runtime = createBrowserSoundRuntime();
  const events: SoundRuntimeEvent[] = [];
  runtime.subscribe(event => events.push(event));
  const session = await runtime.preview(plan());
  assert.equal(session.status, 'playing');
  assert.equal(audio().oscillators.length, 1);
  audio().oscillators[0]!.end();
  assert(audio().oscillators.every(node => node.disconnected));
  assert(audio().gains.every(node => node.disconnected));
  assert.deepEqual(events.filter(event => event.type === 'session').map(event => event.session.status), ['playing', 'ended']);
  await runtime.dispose();
  assert.equal(audio().closeCount, 1);
}));

test('replacement stops the old session; stop by id cannot stop a newer session', async () => fixture(async () => {
  const runtime = createBrowserSoundRuntime();
  const events: SoundRuntimeEvent[] = [];
  runtime.subscribe(event => events.push(event));
  const first = await runtime.preview(plan());
  const second = await runtime.preview(plan());
  assert.notEqual(first.id, second.id);
  assert(audio().oscillators[0]!.stopped);
  runtime.stop(first.id);
  assert(!audio().oscillators[1]!.stopped);
  runtime.stop(second.id);
  assert(audio().oscillators[1]!.stopped);
  const terminals = events.filter(event => event.type === 'session' && event.session.status === 'stopped');
  assert.equal(terminals.length, 2);
  await runtime.dispose();
}));

test('invalid and unsupported input fails explicitly without starting nodes', async () => fixture(async () => {
  const runtime = createBrowserSoundRuntime();
  await assert.rejects(runtime.preview({ ...plan(), level: Number.NaN }), /有限数值/);
  await assert.rejects(runtime.preview({ ...plan(), kind: 'unknown' } as unknown as SoundPlan), /仅支持/);
  await assert.rejects(runtime.preview({ ...plan(), filter: { frequencyHz: 100 } } as SoundPlan), /不支持的内容/);
  await assert.rejects(runtime.preview({ ...plan(), sources: new Array(1) } as SoundPlan), /必须是有效对象/);
  await assert.rejects(runtime.preview({ ...plan(), note: { ...plan().note, frequencyHz: Number.POSITIVE_INFINITY } }), /有限数值/);
  await assert.rejects(runtime.preview({ ...plan(), sources: [{ waveform: 'sine', frequencyRatio: 64, level: 1 }] }), /超出/);
  assert.equal(audio().oscillators.length, 0);
  await runtime.dispose();
}));

test('device suspension terminates playback and publishes a visible failure', async () => fixture(async () => {
  const runtime = createBrowserSoundRuntime();
  const events: SoundRuntimeEvent[] = [];
  runtime.subscribe(event => events.push(event));
  await runtime.preview(plan());
  audio().suspend();
  assert(events.some(event => event.type === 'session' && event.session.status === 'failed' && event.session.error?.includes('暂停')));
  assert(events.some(event => event.type === 'device' && event.status === 'suspended'));
  assert(audio().gains.every(node => node.disconnected));
  await runtime.dispose();
}));

test('dispose cancels a blocked device start promptly and closes the context once', async () => fixture(async () => {
  const runtime = createBrowserSoundRuntime();
  const pending = runtime.preview(plan());
  const rejection = assert.rejects(pending, /取消/);
  const first = runtime.dispose();
  const second = runtime.dispose();
  assert.equal(first, second);
  await Promise.all([first, rejection]);
  assert.equal(audio().closeCount, 1);
  assert.equal(audio().oscillators.length, 0);
  await assert.rejects(runtime.preview(plan()), /已关闭/);
}, 'blocked'));

test('device refusal rejects preview and is reported to subscribers', async () => fixture(async () => {
  const runtime = createBrowserSoundRuntime();
  const events: SoundRuntimeEvent[] = [];
  runtime.subscribe(event => events.push(event));
  await assert.rejects(runtime.preview(plan()), /device denied/);
  assert(events.some(event => event.type === 'device' && event.status === 'failed'));
  await runtime.dispose();
}, 'rejected'));

test('stopAll cancels pending starts without a late sounding session', async () => fixture(async () => {
  const runtime = createBrowserSoundRuntime();
  const pending = runtime.preview(plan());
  const rejection = assert.rejects(pending, /取消/);
  runtime.stopAll();
  await rejection;
  assert.equal(audio().oscillators.length, 0);
  await runtime.dispose();
}, 'blocked'));

test('a subscriber can stop immediately without reversing state order for other subscribers', async () => fixture(async () => {
  const runtime = createBrowserSoundRuntime();
  runtime.subscribe(event => {
    if (event.type === 'session' && event.session.status === 'playing') runtime.stop(event.session.id);
  });
  const states: string[] = [];
  runtime.subscribe(event => { if (event.type === 'session') states.push(event.session.status); });
  const session = await runtime.preview(plan());
  assert.deepEqual(states, ['playing', 'stopped']);
  assert.equal(session.status, 'stopped');
  assert(audio().gains.every(node => node.disconnected));
  await runtime.dispose();
}));
