import assert from 'node:assert/strict';
import test from 'node:test';
import type { SoundPlan, SoundRuntimeEvent, SoundSequencePlan } from '../../contracts/sound.ts';
import { createBrowserSoundRuntime } from './browser.ts';

class FakeParam {
  readonly changes: { kind: 'set' | 'ramp' | 'hold'; value: number; time: number }[] = [];
  setValueAtTime(value: number, time: number): void { this.changes.push({ kind: 'set', value, time }); }
  linearRampToValueAtTime(value: number, time: number): void { this.changes.push({ kind: 'ramp', value, time }); }
  cancelAndHoldAtTime(time: number): void { this.changes.push({ kind: 'hold', value: 0, time }); }
}

class FakeNode {
  disconnected = false;
  connections: FakeNode[] = [];
  connect(node: FakeNode): void { this.connections.push(node); }
  disconnect(): void { this.disconnected = true; }
}

class FakeGain extends FakeNode { readonly gain = new FakeParam(); }
class FakePanner extends FakeNode { readonly pan = new FakeParam(); }

class FakeOscillator extends FakeNode {
  readonly frequency = new FakeParam();
  type = 'sine';
  onended: (() => void) | null = null;
  started = false;
  stopped = false;
  startTime: number | undefined;
  stopTime: number | undefined;
  start(time?: number): void { this.started = true; this.startTime = time; }
  stop(time?: number): void {
    if (!this.started) throw new Error('a source must start before it can stop');
    if (time === undefined) this.stopped = true; else this.stopTime = time;
  }
  end(): void { this.onended?.(); }
}

class FakeConstantSource extends FakeOscillator { readonly offset = new FakeParam(); }
class FakeBuffer {
  readonly data: Float32Array[];
  readonly numberOfChannels: number;
  readonly length: number;
  readonly sampleRate: number;
  constructor(numberOfChannels: number, length: number, sampleRate: number) {
    this.numberOfChannels = numberOfChannels; this.length = length; this.sampleRate = sampleRate;
    this.data = Array.from({ length: numberOfChannels }, () => new Float32Array(length));
  }
  getChannelData(channel: number): Float32Array { return this.data[channel]!; }
}
class FakeBufferSource extends FakeOscillator {
  buffer: FakeBuffer | null = null;
  readonly playbackRate = new FakeParam();
  loop = false;
  offset = 0;
  sourceDuration = Infinity;
  override start(time?: number, offset = 0, duration = Infinity): void { super.start(time); this.offset = offset; this.sourceDuration = duration; }
}

class FakeAudioContext {
  static mode: 'normal' | 'blocked' | 'rejected' = 'normal';
  static instances: FakeAudioContext[] = [];
  currentTime = 1;
  readonly sampleRate = 48000;
  readonly destination = new FakeNode();
  readonly oscillators: FakeOscillator[] = [];
  readonly gains: FakeGain[] = [];
  readonly panners: FakePanner[] = [];
  readonly clocks: FakeConstantSource[] = [];
  readonly sampleSources: FakeBufferSource[] = [];
  failSampleAllocation = false;
  failAfterOscillators = Number.POSITIVE_INFINITY;
  allocationDelaySeconds = 0;
  state = FakeAudioContext.mode === 'normal' ? 'running' : 'suspended';
  onstatechange: (() => void) | null = null;
  closeCount = 0;

  constructor() { FakeAudioContext.instances.push(this); }
  createBuffer(channels: number, frames: number, rate: number): FakeBuffer { return new FakeBuffer(channels, frames, rate); }
  createBufferSource(): FakeBufferSource {
    if (this.failSampleAllocation) throw new Error('sample device allocation failed');
    const source = new FakeBufferSource(); this.sampleSources.push(source); return source;
  }
  createOscillator(): FakeOscillator {
    if (this.oscillators.length >= this.failAfterOscillators) throw new Error('device allocation failed');
    this.currentTime += this.allocationDelaySeconds;
    const node = new FakeOscillator();
    this.oscillators.push(node);
    return node;
  }
  createGain(): FakeGain {
    const node = new FakeGain();
    this.gains.push(node);
    return node;
  }
  createStereoPanner(): FakePanner {
    const node = new FakePanner();
    this.panners.push(node);
    return node;
  }
  createConstantSource(): FakeConstantSource {
    const node = new FakeConstantSource();
    this.clocks.push(node);
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

function phrase(events: SoundSequencePlan['events'], durationSeconds = 2): SoundSequencePlan {
  return { kind: 'sequence', version: 1, durationSeconds, events };
}

function close(actual: number | undefined, expected: number): void {
  assert(actual !== undefined && Math.abs(actual - expected) < 1e-10, `${actual} should equal ${expected}`);
}

function acquired() { return { sampleRate: 8000, channels: [new Float32Array([0, 0.25, -0.5, 0]), new Float32Array([0.5, 0, 0, -1])] }; }

test('sample audition uses the shared device clock, copies exact channels and releases on natural completion', async () => fixture(async () => {
  const runtime = createBrowserSoundRuntime(); const input = acquired();
  const pending = runtime.previewAudio(input); input.channels[0]![0] = 1;
  const session = await pending; const source = audio().sampleSources[0]!;
  assert.equal(source.buffer!.sampleRate, 8000); assert.equal(source.buffer!.length, 4);
  assert.deepEqual([...source.buffer!.data[0]!], [0, 0.25, -0.5, 0]);
  assert.deepEqual(source.buffer!.data[1], input.channels[1]);
  close(session.durationSeconds, 4 / 8000); close(source.startTime, session.startedAtSeconds);
  source.end(); assert(source.stopped); assert(source.disconnected);
  close(runtime.position(session.id), session.durationSeconds!); await runtime.dispose();
}));

test('sample and synthesized previews replace each other without leaving a second global player', async () => fixture(async () => {
  const runtime = createBrowserSoundRuntime(); const synth = await runtime.preview(plan());
  const sample = await runtime.previewAudio(acquired()); assert(audio().oscillators[0]!.stopped);
  runtime.stop(synth.id); assert.equal(audio().sampleSources[0]!.stopped, false);
  assert.throws(() => runtime.update(sample.id, plan()), /采样试听/);
  const next = await runtime.preview(plan()); assert(audio().sampleSources[0]!.stopped); assert(audio().sampleSources[0]!.disconnected);
  audio().sampleSources[0]!.end(); runtime.stop(sample.id);
  assert.equal(audio().oscillators[1]!.stopped, false); assert.equal(next.status, 'playing');
  await runtime.dispose();
}));

test('invalid or unallocatable sample auditions preserve the existing music', async () => fixture(async () => {
  const runtime = createBrowserSoundRuntime(); await runtime.preview(plan());
  await assert.rejects(runtime.previewAudio({ ...acquired(), sampleRate: 0 }), /采样率/);
  assert.equal(audio().oscillators[0]!.stopped, false);
  audio().failSampleAllocation = true;
  await assert.rejects(runtime.previewAudio(acquired()), /allocation failed/);
  assert.equal(audio().oscillators[0]!.stopped, false); await runtime.dispose();
}));

test('stopping or disposing while the device is pending prevents a late sample playback', async () => fixture(async () => {
  const runtime = createBrowserSoundRuntime(); const pending = runtime.previewAudio(acquired());
  runtime.stopAll(); await assert.rejects(pending, /取消/); assert.equal(audio().sampleSources.length, 0);
  await runtime.dispose(); await assert.rejects(runtime.previewAudio(acquired()), /关闭/);
}, 'blocked'));

test('device suspension stops and releases acquired audio and reports the failed session', async () => fixture(async () => {
  const runtime = createBrowserSoundRuntime(); const events: SoundRuntimeEvent[] = []; runtime.subscribe(event => events.push(event));
  const sample = await runtime.previewAudio(acquired()); audio().suspend();
  assert(audio().sampleSources[0]!.stopped); assert(audio().sampleSources[0]!.disconnected);
  assert(events.some(event => event.type === 'session' && event.session.id === sample.id && event.session.status === 'failed'));
  await runtime.dispose();
}));

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
  await assert.rejects(runtime.preview({ ...plan(), filter: { frequencyHz: 100 } } as SoundPlan), /不支持/);
  await assert.rejects(runtime.preview({ ...plan(), customGraph: {} } as unknown as SoundPlan), /不支持的内容/);
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

test('sequence notes share one clock, retain offsets and complete after the final release tail', async () => fixture(async () => {
  const runtime = createBrowserSoundRuntime();
  const events: SoundRuntimeEvent[] = [];
  runtime.subscribe(event => events.push(event));
  const last = { ...plan(), envelope: { attackSeconds: 0.01, releaseSeconds: 0.5 } };
  const session = await runtime.preview(phrase([{ atSeconds: 1.9, sound: last }, { atSeconds: 0, sound: plan() }]));
  close(audio().oscillators[0]!.startTime, session.startedAtSeconds + 1.9);
  close(audio().oscillators[1]!.startTime, session.startedAtSeconds);
  close(session.durationSeconds, 2.5);
  close(audio().clocks[0]!.stopTime, session.startedAtSeconds + 2.5 + 0.001);
  assert.deepEqual(audio().clocks[0]!.offset.changes, [{ kind: 'set', value: 0, time: session.startedAtSeconds }]);
  audio().oscillators.forEach(node => node.end());
  assert.deepEqual(events.filter(event => event.type === 'session').map(event => event.session.status), ['playing']);
  audio().currentTime = session.startedAtSeconds + 2.501;
  audio().clocks[0]!.end();
  assert.deepEqual(events.filter(event => event.type === 'session').map(event => event.session.status), ['playing', 'ended']);
  assert(audio().oscillators.every(node => node.disconnected));
  assert(audio().clocks.every(node => node.disconnected));
  await runtime.dispose();
}));

test('trailing silence and playhead follow device time, with stable terminal positions', async () => fixture(async () => {
  const runtime = createBrowserSoundRuntime();
  const session = await runtime.preview(phrase([{ atSeconds: 0, sound: plan() }], 4));
  assert.equal(runtime.position(session.id), 0);
  assert.equal(runtime.position('missing'), undefined);
  audio().oscillators[0]!.end();
  audio().currentTime = session.startedAtSeconds + 2.25;
  close(runtime.position(session.id), 2.25);
  audio().currentTime = session.startedAtSeconds + 5;
  assert.equal(runtime.position(session.id), 4);
  audio().clocks[0]!.end();
  assert.equal(runtime.position(session.id), 4);
  const next = await runtime.preview(plan());
  audio().currentTime = next.startedAtSeconds + 0.04;
  runtime.stop(next.id);
  audio().currentTime += 20;
  close(runtime.position(next.id), 0.04);
  assert.equal(runtime.position(session.id), undefined);
  await runtime.dispose();
}));

test('stopping or disposing a sequence cancels all future notes and its completion source', async () => fixture(async () => {
  const runtime = createBrowserSoundRuntime();
  const events: SoundRuntimeEvent[] = [];
  runtime.subscribe(event => events.push(event));
  const input = phrase([{ atSeconds: 0, sound: plan() }, { atSeconds: 1.5, sound: plan() }]);
  const first = await runtime.preview(input);
  runtime.stop(first.id);
  assert(audio().oscillators.every(node => node.stopped && node.disconnected));
  assert(audio().clocks.every(node => node.stopped && node.disconnected));
  audio().clocks[0]!.end();
  assert.equal(events.filter(event => event.type === 'session' && event.session.status === 'ended').length, 0);
  await runtime.preview(input);
  await runtime.dispose();
  assert(audio().oscillators.every(node => node.stopped && node.disconnected));
  assert(audio().clocks.every(node => node.stopped && node.disconnected));
  assert(audio().gains.every(node => node.disconnected));
}));

test('every sequence event validates before replacing the active preview or allocating nodes', async () => fixture(async () => {
  const runtime = createBrowserSoundRuntime();
  const first = await runtime.preview(plan());
  const invalid = { ...plan(), note: { ...plan().note, frequencyHz: Number.NaN } };
  await assert.rejects(runtime.preview(phrase([{ atSeconds: 0, sound: plan() }, { atSeconds: 1, sound: invalid }])), /有限数值/);
  await assert.rejects(runtime.preview(phrase([{ atSeconds: 0, sound: plan() }, { atSeconds: 1, sound: { ...plan(), sources: [{ waveform: 'sine', frequencyRatio: 64, level: 1 }] } } ])), /超出/);
  await assert.rejects(runtime.preview(phrase([], 1)), /空乐句/);
  await assert.rejects(runtime.preview(phrase([{ atSeconds: 0, sound: plan() }], 601)), /600/);
  await assert.rejects(runtime.preview(phrase([{ atSeconds: 2, sound: plan() }], 2)), /结束前/);
  await assert.rejects(runtime.preview(phrase(Array.from({ length: 2049 }, () => ({ atSeconds: 0, sound: plan() })))), /2048/);
  await assert.rejects(runtime.preview({ ...phrase([{ atSeconds: 0, sound: plan() }]), version: 2 } as unknown as SoundSequencePlan), /第 1 版/);
  await assert.rejects(runtime.preview(phrase(new Array(1))), /必须是有效对象/);
  assert.equal(audio().oscillators.length, 1);
  assert.equal(audio().clocks.length, 0);
  assert.equal(audio().oscillators[0]!.stopped, false);
  assert.equal(runtime.position(first.id), 0);
  await runtime.dispose();
}));

test('overlapping notes are conservatively normalized while adjacent notes keep their level', async () => fixture(async () => {
  const runtime = createBrowserSoundRuntime();
  const loud = { ...plan(), level: 1, note: { ...plan().note, velocity: 1 } };
  const sequence = phrase([{ atSeconds: 0, sound: loud }, { atSeconds: 0.05, sound: loud }, { atSeconds: 1, sound: loud }]);
  await runtime.preview(sequence);
  for (const index of [0, 2, 4]) close(audio().gains[index]!.gain.changes.find(change => change.kind === 'ramp')!.value, 0.5);
  const before = audio().gains.length;
  await runtime.preview(phrase([{ atSeconds: 0, sound: loud }, { atSeconds: 0.12, sound: loud }]));
  for (const index of [before, before + 2]) close(audio().gains[index]!.gain.changes.find(change => change.kind === 'ramp')!.value, 1);
  const first = audio().oscillators.length;
  await assert.rejects(runtime.preview(phrase(Array.from({ length: 257 }, () => ({ atSeconds: 0, sound: loud })))), /256/);
  assert.equal(audio().oscillators.length, first);
  await runtime.dispose();
}));

test('a short note releases from its partial attack level without changing its duration', async () => fixture(async () => {
  const runtime = createBrowserSoundRuntime();
  const short = { ...plan(), level: 1, note: { ...plan().note, velocity: 1, holdSeconds: 0.002 }, envelope: { attackSeconds: 0.1, releaseSeconds: 0.05 } };
  const session = await runtime.preview(short);
  const changes = audio().gains[0]!.gain.changes;
  assert.deepEqual(changes.map(change => change.kind), ['set', 'ramp', 'set', 'ramp']);
  close(changes[1]!.value, 0.02);
  close(changes[1]!.time, session.startedAtSeconds + 0.002);
  close(changes[2]!.value, 0.02);
  close(changes[3]!.time, session.startedAtSeconds + 0.052);
  close(audio().oscillators[0]!.stopTime, session.startedAtSeconds + 0.053);
  await runtime.dispose();
}));

test('device interruption and allocation failure release scheduled notes and the clock source', async () => fixture(async () => {
  const runtime = createBrowserSoundRuntime();
  const events: SoundRuntimeEvent[] = [];
  runtime.subscribe(event => events.push(event));
  const sequence = phrase([{ atSeconds: 0, sound: plan() }, { atSeconds: 1.5, sound: plan() }]);
  await runtime.preview(sequence);
  audio().suspend();
  assert(audio().oscillators.every(node => node.stopped && node.disconnected));
  assert(audio().clocks.every(node => node.stopped && node.disconnected));
  audio().state = 'running';
  audio().failAfterOscillators = audio().oscillators.length + 1;
  await assert.rejects(runtime.preview(sequence), /device allocation failed/);
  assert(audio().oscillators.every(node => node.disconnected));
  assert(audio().clocks.every(node => node.disconnected));
  assert(audio().gains.every(node => node.disconnected));
  assert.equal(events.filter(event => event.type === 'session' && event.session.status === 'failed').length, 2);
  await runtime.dispose();
}));

test('building a slow sequence graph does not schedule the first note in the past', async () => fixture(async () => {
  const runtime = createBrowserSoundRuntime();
  await runtime.preview(plan());
  runtime.stopAll();
  audio().allocationDelaySeconds = 0.25;
  const session = await runtime.preview(phrase([{ atSeconds: 0, sound: plan() }, { atSeconds: 1, sound: plan() }]));
  assert(session.startedAtSeconds > audio().currentTime);
  close(audio().oscillators[1]!.startTime, session.startedAtSeconds);
  close(audio().oscillators[2]!.startTime, session.startedAtSeconds + 1);
  await runtime.dispose();
}));

test('live edits retain the session clock, join the current envelope and replace future notes', async () => fixture(async () => {
  const runtime = createBrowserSoundRuntime();
  const events: SoundRuntimeEvent[] = [];
  runtime.subscribe(event => events.push(event));
  const sustained: SoundPlan = {
    ...plan(), level: 0.5, note: { frequencyHz: 440, holdSeconds: 2, velocity: 1 },
    envelope: { attackSeconds: 2, releaseSeconds: 0.2 },
  };
  const first = await runtime.preview(phrase([
    { atSeconds: 0, sound: sustained }, { atSeconds: 0.2, sound: plan() }, { atSeconds: 3, sound: plan() },
  ], 4));
  audio().currentTime = first.startedAtSeconds + 1;
  const oldClockEnded = audio().clocks[0]!.onended;
  const changed = { ...sustained, note: { ...sustained.note, frequencyHz: 660 }, sources: [{ waveform: 'triangle' as const, frequencyRatio: 1, level: 1 }] };
  const updated = runtime.update(first.id, phrase([
    { atSeconds: 0, sound: changed, pan: 0.75 }, { atSeconds: 3.5, sound: plan(), pan: -0.5 },
  ], 5));
  assert(updated);
  assert.equal(updated.id, first.id);
  assert.equal(updated.startedAtSeconds, first.startedAtSeconds);
  assert.equal(updated.durationSeconds, 5);
  close(runtime.position(first.id), 1);
  assert.equal(audio().oscillators.length, 5, 'the elapsed short note is not recreated');
  const joined = audio().oscillators[3]!;
  assert.equal(joined.type, 'triangle');
  assert.equal(joined.frequency.changes[0]!.value, 660);
  assert(joined.startTime! > audio().currentTime && joined.startTime! < audio().currentTime + 0.02);
  close(audio().oscillators[4]!.startTime, first.startedAtSeconds + 3.5);
  const envelope = audio().gains[6]!.gain.changes;
  assert.equal(envelope[0]!.value, 0, 'the replacement fades in rather than clicking');
  close(envelope[1]!.value, 0.5 * (envelope[1]!.time - first.startedAtSeconds) / 2);
  close(envelope[2]!.time, first.startedAtSeconds + 2);
  assert.equal(audio().panners[3]!.pan.changes[0]!.value, 0.75);
  assert(audio().gains[0]!.gain.changes.some(change => change.kind === 'hold'));
  assert(audio().oscillators.slice(0, 3).every(node => node.stopTime! < joined.startTime! + 0.01));
  assert(audio().oscillators[2]!.stopTime! <= joined.startTime!, 'removed future notes are cancelled before the transition');
  oldClockEnded?.();
  assert.equal(events.filter(event => event.type === 'session' && event.session.status === 'ended').length, 0);
  assert.deepEqual(events.filter(event => event.type === 'session').map(event => event.session.status), ['playing', 'playing']);
  audio().clocks[2]!.end();
  assert(audio().oscillators.slice(0, 3).every(node => node.disconnected));
  assert(!joined.disconnected);
  await runtime.dispose();
  assert(audio().oscillators.every(node => node.disconnected));
  assert(audio().gains.every(node => node.disconnected));
  assert(audio().panners.every(node => node.disconnected));
  assert(audio().clocks.every(node => node.disconnected));
}));

test('live edits preserve release progress and accept an immediate transition to silence', async () => fixture(async () => {
  const runtime = createBrowserSoundRuntime();
  const sustained: SoundPlan = {
    ...plan(), level: 0.8, note: { frequencyHz: 440, holdSeconds: 1, velocity: 1 },
    envelope: { attackSeconds: 0, releaseSeconds: 1 },
  };
  const first = await runtime.preview(sustained);
  audio().currentTime = first.startedAtSeconds + 1.5;
  const updated = runtime.update(first.id, { ...sustained, level: 0.4 });
  assert(updated);
  const envelope = audio().gains[2]!.gain.changes;
  close(envelope[1]!.value, 0.4 * (first.startedAtSeconds + 2 - envelope[1]!.time));
  close(envelope.at(-1)!.time, first.startedAtSeconds + 2);
  const muted = runtime.update(first.id, { ...sustained, level: 0 });
  assert(muted);
  assert(audio().gains[4]!.gain.changes.every(change => change.value === 0));
  const shortened = runtime.update(first.id, { ...sustained, note: { ...sustained.note, holdSeconds: 0.1 }, envelope: { attackSeconds: 0, releaseSeconds: 0 } });
  assert(shortened);
  assert.equal(audio().oscillators.length, 3, 'a plan ending before the playhead does not retrigger old notes');
  assert.equal(shortened.durationSeconds, 0.1);
  audio().currentTime += 0.02;
  audio().clocks.at(-2)!.end();
  assert.equal(runtime.position(first.id), 0.1);
  assert.equal(runtime.update(first.id, sustained), undefined);
  await runtime.dispose();
}));

test('invalid live input and replacement allocation failures leave the previous music intact', async () => fixture(async () => {
  const runtime = createBrowserSoundRuntime();
  const input = phrase([{ atSeconds: 0, sound: plan() }, { atSeconds: 2, sound: plan() }], 4);
  const session = await runtime.preview(input);
  audio().currentTime = session.startedAtSeconds + 0.5;
  assert.throws(() => runtime.update(session.id, { ...input, durationSeconds: Number.NaN }), /有限数值/);
  assert.throws(() => runtime.update(session.id, phrase([{ atSeconds: 1, sound: { ...plan(), sources: [{ waveform: 'sine', frequencyRatio: 64, level: 1 }] } }], 4)), /超出/);
  assert.equal(audio().oscillators.length, 2);
  const oldStopTimes = audio().oscillators.map(node => node.stopTime);
  audio().failAfterOscillators = 3;
  assert.throws(() => runtime.update(session.id, phrase([{ atSeconds: 1, sound: plan() }, { atSeconds: 3, sound: plan() }], 5)), /device allocation failed/);
  assert.deepEqual(audio().oscillators.slice(0, 2).map(node => node.stopTime), oldStopTimes);
  assert(audio().oscillators.slice(0, 2).every(node => !node.disconnected));
  assert(audio().oscillators[2]!.disconnected);
  close(runtime.position(session.id), 0.5);
  await runtime.dispose();
}));

test('unchanged content does not rebuild nodes; stale sessions and delayed old note callbacks cannot restart or stop newer content', async () => fixture(async () => {
  const runtime = createBrowserSoundRuntime();
  const session = await runtime.preview(plan());
  assert.equal(runtime.update(session.id, structuredClone(plan())), session);
  assert.equal(audio().oscillators.length, 1);
  const lateEnded = audio().oscillators[0]!.onended;
  const updated = runtime.update(session.id, { ...plan(), level: 0.3 });
  assert(updated);
  lateEnded?.();
  const states: string[] = [];
  runtime.subscribe(event => { if (event.type === 'session') states.push(event.session.status); });
  assert.deepEqual(states, ['playing']);
  const next = await runtime.preview(plan());
  assert.equal(runtime.update(session.id, plan()), undefined);
  assert.equal(audio().oscillators.length, 3);
  audio().currentTime = next.startedAtSeconds + next.durationSeconds! + 0.002;
  assert.equal(runtime.update(next.id, { ...plan(), note: { ...plan().note, holdSeconds: 10 } }), undefined);
  assert.equal(audio().oscillators.length, 3);
  assert.equal(runtime.position(next.id), next.durationSeconds);
  await runtime.dispose();
  assert.equal(runtime.update(next.id, plan()), undefined);
}));

test('repeated live replacements release retiring graphs on the device clock and stop cancels every remaining node', async () => fixture(async () => {
  const runtime = createBrowserSoundRuntime();
  const session = await runtime.preview(phrase([{ atSeconds: 0, sound: { ...plan(), note: { ...plan().note, holdSeconds: 4 } } }], 5));
  for (let index = 0; index < 40; index += 1) {
    audio().currentTime = session.startedAtSeconds + 0.01 + index * 0.02;
    for (const clock of audio().clocks) if (clock.stopTime! <= audio().currentTime) clock.end();
    assert(runtime.update(session.id, phrase([{ atSeconds: 0, pan: index / 40, sound: { ...plan(), level: 0.1 + index / 100, note: { ...plan().note, holdSeconds: 4 } } }], 5)));
    assert(audio().oscillators.filter(node => !node.disconnected).length <= 2);
  }
  runtime.stop(session.id);
  assert(audio().oscillators.every(node => node.disconnected));
  assert(audio().gains.every(node => node.disconnected));
  assert(audio().panners.every(node => node.disconnected));
  assert(audio().clocks.every(node => node.disconnected));
  assert.equal(runtime.update(session.id, plan()), undefined);
  await runtime.dispose();
}));

test('deleting every note produces silence without resetting the timeline, and notes can be added back during playback', async () => fixture(async () => {
  const runtime = createBrowserSoundRuntime();
  const session = await runtime.preview(phrase([{ atSeconds: 0, sound: plan() }, { atSeconds: 2, sound: plan() }], 4));
  audio().currentTime = session.startedAtSeconds + 0.5;
  const silent = runtime.update(session.id, phrase([], 4));
  assert(silent);
  assert.equal(silent.id, session.id);
  assert.equal(audio().oscillators.length, 2);
  close(runtime.position(session.id), 0.5);
  audio().currentTime += 0.02;
  audio().clocks[2]!.end();
  assert(audio().oscillators.every(node => node.disconnected));
  const restored = runtime.update(session.id, phrase([{ atSeconds: 1, sound: plan() }], 4));
  assert(restored);
  assert.equal(restored.startedAtSeconds, session.startedAtSeconds);
  close(audio().oscillators[2]!.startTime, session.startedAtSeconds + 1);
  close(runtime.position(session.id), 0.52);
  await runtime.dispose();
}));

test('a session expiring while replacement nodes are being allocated does not unexpectedly start again', async () => fixture(async () => {
  const runtime = createBrowserSoundRuntime();
  const session = await runtime.preview(plan());
  audio().currentTime = session.startedAtSeconds + 0.05;
  audio().allocationDelaySeconds = 0.2;
  assert.equal(runtime.update(session.id, { ...plan(), note: { ...plan().note, holdSeconds: 10 } }), undefined);
  assert(audio().oscillators.every(node => node.disconnected));
  assert.equal(audio().oscillators[1]!.started, false);
  assert.equal(runtime.position(session.id), session.durationSeconds);
  await runtime.dispose();
}));

test('notes ending during live graph preparation stay silent and do not prevent the next update', async () => fixture(async () => {
  const runtime = createBrowserSoundRuntime();
  const session = await runtime.preview(phrase([{ atSeconds: 2, sound: plan() }], 4));
  audio().currentTime = session.startedAtSeconds + 0.45;
  audio().allocationDelaySeconds = 0.2;
  assert(runtime.update(session.id, phrase([{ atSeconds: 0.4, sound: plan() }, { atSeconds: 2, sound: plan() }], 4)));
  assert.equal(audio().oscillators[1]!.started, false);
  assert(audio().oscillators[1]!.disconnected);
  audio().allocationDelaySeconds = 0;
  assert(runtime.update(session.id, phrase([{ atSeconds: 2.5, sound: plan() }], 4)));
  close(audio().oscillators[3]!.startTime, session.startedAtSeconds + 2.5);
  await runtime.dispose();
  assert(audio().oscillators.every(node => node.disconnected));
}));

test('short note audition shares the device and preserves the main session clock through live updates', async () => fixture(async () => {
  const runtime = createBrowserSoundRuntime(); const states: SoundRuntimeEvent[] = []; runtime.subscribe(event => states.push(event));
  const main = await runtime.preview(phrase([{ atSeconds: 0, sound: { ...plan(), note: { ...plan().note, holdSeconds: 4 } } }], 5));
  audio().currentTime = main.startedAtSeconds + 0.6; const eventCount = states.filter(event => event.type === 'session').length;
  await runtime.audition({ ...plan(), note: { ...plan().note, frequencyHz: 330 } });
  assert.equal(FakeAudioContext.instances.length, 1); assert.equal(audio().oscillators[0]!.stopped, false);
  close(audio().oscillators[1]!.frequency.changes[0]!.value, 330); close(runtime.position(main.id), 0.6);
  assert.equal(states.filter(event => event.type === 'session').length, eventCount, 'short notes never become transport sessions');
  const mix = audio().gains.at(-1)!; assert.deepEqual(mix.gain.changes.at(-1), { kind: 'ramp', value: 0.5, time: audio().oscillators[1]!.startTime });
  const keyEnvelope = audio().gains[2]!; close(keyEnvelope.gain.changes.find(change => change.kind === 'ramp')!.value, plan().level * plan().note.velocity * 0.5);
  const changed = runtime.update(main.id, phrase([{ atSeconds: 1, sound: plan() }], 5));
  assert.equal(changed?.id, main.id); assert.equal(changed?.startedAtSeconds, main.startedAtSeconds); close(runtime.position(main.id), 0.6);
  audio().oscillators[1]!.end(); assert(audio().oscillators[1]!.disconnected); assert.equal(mix.gain.changes.at(-1)!.value, 1);
  close(runtime.position(main.id), 0.6); await runtime.dispose(); assert(mix.disconnected);
}));

test('audition replacement and cancellation release only the short note; a normal preview and stopAll release both lanes', async () => fixture(async () => {
  const runtime = createBrowserSoundRuntime(); const main = await runtime.preview(phrase([{ atSeconds: 2, sound: plan() }], 4));
  await runtime.audition(plan()); const first = audio().oscillators[1]!; const ended = first.onended;
  await runtime.audition({ ...plan(), note: { ...plan().note, frequencyHz: 550 } }); const second = audio().oscillators[2]!;
  assert(first.stopped); assert(first.disconnected); ended?.(); assert.equal(second.stopped, false);
  runtime.cancelAudition(); assert(second.stopped); assert.equal(audio().oscillators[0]!.stopped, false); assert.equal(runtime.position(main.id), 0);
  await runtime.audition(plan()); const third = audio().oscillators[3]!; const next = await runtime.preview(plan());
  assert(third.stopped); assert(audio().oscillators[0]!.stopped); assert.equal(next.status, 'playing');
  await runtime.audition(plan()); runtime.stopAll(); assert(audio().oscillators.every(node => node.stopped));
  await runtime.dispose();
}));

test('a one-shot sampled key uses the audition lane trim and pitch, and invalid keys preserve main playback', async () => fixture(async () => {
  const runtime = createBrowserSoundRuntime(); const main = await runtime.preview(phrase([{ atSeconds: 0, sound: plan() }], 3));
  const input = { kind: 'sample' as const, version: 1 as const, source: { id: 'bell', revision: 1,
    audio: { sampleRate: 8000, channels: [new Float32Array(8000).fill(0.4)] } }, startSeconds: 0.1, endSeconds: 0.9,
    playbackRate: 2, envelope: { attackSeconds: 0.01, releaseSeconds: 0.03 }, note: { frequencyHz: 440, holdSeconds: 0.2, velocity: 0.6 }, level: 0.7 };
  await runtime.audition(input); const source = audio().sampleSources[0]!;
  assert.equal(source.loop, false); close(source.offset, 0.1); close(source.sourceDuration, 0.8); close(source.playbackRate.changes[0]!.value, 2);
  close(source.stopTime! - source.startTime!, 0.231); assert.equal(audio().oscillators[0]!.stopped, false);
  await assert.rejects(runtime.audition({ ...input, playbackRate: NaN }), /倍率/); assert.equal(source.stopped, false);
  audio().failSampleAllocation = true; await assert.rejects(runtime.audition(input), /allocation failed/);
  assert.equal(audio().oscillators[0]!.stopped, false); assert.equal(runtime.position(main.id), 0);
  await runtime.dispose();
}));

test('cancelled pending key device work cannot play late or cancel a pending main preview', async () => fixture(async () => {
  const runtime = createBrowserSoundRuntime(); const main = runtime.preview(plan()); const short = runtime.audition(plan());
  runtime.cancelAudition(); await assert.rejects(short, /取消/); assert.equal(audio().oscillators.length, 0);
  runtime.stopAll(); await assert.rejects(main, /取消/);
  const leaving = runtime.audition(plan()); const disposed = runtime.dispose(); await assert.rejects(leaving, /取消/); await disposed;
  assert.equal(audio().oscillators.length, 0); await assert.rejects(runtime.audition(plan()), /关闭/);
}, 'blocked'));

test('device suspension releases a key and restores main gain before a later normal preview', async () => fixture(async () => {
  const runtime = createBrowserSoundRuntime(); await runtime.preview(plan()); await runtime.audition(plan());
  const mix = audio().gains.at(-1)!; audio().suspend(); assert(audio().oscillators.every(node => node.stopped));
  assert.equal(mix.gain.changes.at(-1)!.value, 1);
  const next = await runtime.preview(plan()); assert.equal(next.status, 'playing'); assert.equal(mix.gain.changes.at(-1)!.value, 1);
  await runtime.dispose();
}));

test('live final-output edits keep the song clock and note audition cannot bypass the final mix bus', async () => fixture(async () => {
  const runtime = createBrowserSoundRuntime(); const input: SoundSequencePlan = {
    ...phrase([{ atSeconds: 0, sound: { ...plan(), note: { ...plan().note, holdSeconds: 4 } } }], 6),
    output: { level: 0.8, fadeInSeconds: 1, fadeOutSeconds: 2 },
  };
  const session = await runtime.preview(input); const bus = audio().gains[0]!; const panner = audio().panners[0]!;
  assert.deepEqual(panner.connections, [bus]);
  audio().currentTime = session.startedAtSeconds + 3; await runtime.audition(plan());
  assert.deepEqual(panner.connections, [bus]); assert.equal(bus.connections.at(-1), audio().gains.at(-1));
  const before = audio().gains.length;
  const updated = runtime.update(session.id, { ...input, output: { ...input.output!, level: 0.4 } })!;
  assert.equal(updated.id, session.id); assert.equal(updated.startedAtSeconds, session.startedAtSeconds);
  const nextBus = audio().gains[before]!; assert.equal(nextBus.gain.changes[0]!.value, 0.4);
  assert(nextBus.gain.changes[0]!.time > audio().currentTime); assert.equal(nextBus.gain.changes.at(-1)!.value, 0);
  const preserved = audio().gains.length;
  assert.throws(() => runtime.update(session.id, { ...input, output: { ...input.output!, level: 2 } }), /总输出音量/);
  assert.equal(audio().gains.length, preserved);
  await runtime.dispose(); assert.equal(bus.disconnected, true); assert.equal(nextBus.disconnected, true);
}));
