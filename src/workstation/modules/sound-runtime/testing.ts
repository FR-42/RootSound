// Shared simulated WebAudio device for programmatic tests; never opens a real device.
import assert from 'node:assert/strict';
import type { SampleSoundPlan, SoundPlan, SoundSequencePlan } from '../../contracts/sound.ts';

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

export class FakeAudioContext {
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

export function plan(): SoundPlan {
  return {
    kind: 'basic-synth', version: 1,
    sources: [{ waveform: 'sine', frequencyRatio: 1, level: 1 }],
    envelope: { attackSeconds: 0.01, releaseSeconds: 0.02 },
    note: { frequencyHz: 440, holdSeconds: 0.1, velocity: 0.8 },
    level: 0.2,
  };
}

export async function fixture(run: () => Promise<void>, mode: typeof FakeAudioContext.mode = 'normal'): Promise<void> {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'AudioContext');
  FakeAudioContext.mode = mode;
  FakeAudioContext.instances = [];
  Object.defineProperty(globalThis, 'AudioContext', { configurable: true, value: FakeAudioContext });
  try { await run(); } finally {
    if (descriptor === undefined) Reflect.deleteProperty(globalThis, 'AudioContext');
    else Object.defineProperty(globalThis, 'AudioContext', descriptor);
  }
}

export function audio(): FakeAudioContext { return FakeAudioContext.instances[0]!; }

export function phrase(events: SoundSequencePlan['events'], durationSeconds = 2): SoundSequencePlan {
  return { kind: 'sequence', version: 1, durationSeconds, events };
}

export function close(actual: number | undefined, expected: number): void {
  assert(actual !== undefined && Math.abs(actual - expected) < 1e-10, `${actual} should equal ${expected}`);
}

export function acquired() { return { sampleRate: 8000, channels: [new Float32Array([0, 0.25, -0.5, 0]), new Float32Array([0.5, 0, 0, -1])] }; }

export function longSample(): SampleSoundPlan {
  return { kind: 'sample', version: 1, source: { id: 'transport-sample', revision: 1, audio: { sampleRate: 8000, channels: [new Float32Array(64000)] } },
    startSeconds: .2, endSeconds: 7, playbackRate: 1.5, envelope: { attackSeconds: 1, releaseSeconds: 1 },
    note: { frequencyHz: 440, holdSeconds: 2, velocity: 1 }, level: .5 };
}

