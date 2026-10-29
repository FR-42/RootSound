import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { PcmAudio, SampleSoundPlan, SoundPlan, SoundSequencePlan } from '../src/workstation/contracts/sound.ts';
import { createBrowserSoundRuntime } from '../src/workstation/modules/sound-runtime/public.ts';
import { previewFingerprint, readPreview } from '../src/workstation/modules/sound-runtime/plan.ts';

class Param {
  changes: { kind: 'set' | 'ramp' | 'hold'; value: number; time: number }[] = [];
  readonly initial: number;
  constructor(initial = 0) { this.initial = initial; }
  setValueAtTime(value: number, time: number): void { this.changes.push({ kind: 'set', value, time }); }
  linearRampToValueAtTime(value: number, time: number): void { this.changes.push({ kind: 'ramp', value, time }); }
  cancelAndHoldAtTime(time: number): void { const value = this.at(time); this.changes.push({ kind: 'hold', value, time }); }
  at(time: number): number {
    let previous = { value: this.initial, time: Number.NEGATIVE_INFINITY };
    for (const change of this.changes) {
      if (time < change.time) return change.kind === 'ramp' && Number.isFinite(previous.time)
        ? previous.value + (change.value - previous.value) * (time - previous.time) / (change.time - previous.time) : previous.value;
      previous = change;
    }
    return previous.value;
  }
}
class Node {
  disconnected = false; connections: Node[] = [];
  connect(node: Node): void { this.connections.push(node); }
  disconnect(): void { this.disconnected = true; this.connections.length = 0; }
}
class Gain extends Node { gain = new Param(1); }
class Panner extends Node { pan = new Param(); }
class Source extends Node {
  onended: (() => void) | null = null; startTime = -1; stopTime = Infinity; stopped = false; started = false;
  start(time = 0): void { this.started = true; this.startTime = time; }
  stop(time?: number): void { if (!this.started) throw new Error('not started'); if (time === undefined) this.stopped = true; else this.stopTime = time; }
  end(): void { this.onended?.(); }
}
class Oscillator extends Source { frequency = new Param(); type = 'sine'; }
class Constant extends Source { offset = new Param(); }
class BufferData {
  readonly data: Float32Array[];
  readonly numberOfChannels: number; readonly length: number; readonly sampleRate: number;
  constructor(numberOfChannels: number, length: number, sampleRate: number) { this.numberOfChannels = numberOfChannels; this.length = length; this.sampleRate = sampleRate; this.data = Array.from({ length: numberOfChannels }, () => new Float32Array(length)); }
  getChannelData(index: number): Float32Array { return this.data[index]!; }
}
class Sample extends Source {
  buffer: BufferData | null = null; playbackRate = new Param(1); loop = false; offset = 0; sourceDuration = Infinity;
  override start(time = 0, offset = 0, duration = Infinity): void { super.start(time); this.offset = offset; this.sourceDuration = duration; }
}
class Context {
  static instances: Context[] = []; static blocked = false;
  currentTime = 1; sampleRate = 48000; state = Context.blocked ? 'suspended' : 'running'; onstatechange: (() => void) | null = null;
  destination = new Node(); buffers: BufferData[] = []; samples: Sample[] = []; oscillators: Oscillator[] = []; gains: Gain[] = []; panners: Panner[] = []; clocks: Constant[] = [];
  failBuffer = false; failSource = false;
  constructor() { Context.instances.push(this); }
  createBuffer(channels: number, length: number, rate: number): BufferData { if (this.failBuffer) throw new Error('buffer allocation failed'); const data = new BufferData(channels, length, rate); this.buffers.push(data); return data; }
  createBufferSource(): Sample { if (this.failSource) throw new Error('source allocation failed'); const node = new Sample(); this.samples.push(node); return node; }
  createOscillator(): Oscillator { const node = new Oscillator(); this.oscillators.push(node); return node; }
  createGain(): Gain { const node = new Gain(); this.gains.push(node); return node; }
  createStereoPanner(): Panner { const node = new Panner(); this.panners.push(node); return node; }
  createConstantSource(): Constant { const node = new Constant(); this.clocks.push(node); return node; }
  resume(): Promise<void> { if (Context.blocked) return new Promise(() => {}); this.state = 'running'; this.onstatechange?.(); return Promise.resolve(); }
  close(): Promise<void> { this.state = 'closed'; this.onstatechange?.(); return Promise.resolve(); }
}
class Offline extends Context {
  static renders: Offline[] = []; static pending = false;
  readonly channels: number; readonly frames: number;
  constructor(channels: number, frames: number, rate: number) { super(); this.channels = channels; this.frames = frames; this.currentTime = 0; this.sampleRate = rate; Offline.renders.push(this); }
  suspend(): Promise<void> { return new Promise(() => {}); }
  startRendering(): Promise<AudioBuffer> {
    if (Offline.pending) return new Promise(() => {});
    const buffer = new BufferData(this.channels, this.frames, this.sampleRate);
    // A device-free evaluator of AudioBufferSource/AudioParam routing, independent
    // of the runtime's envelope and trim calculations. Known constant regions are
    // checked below, away from resampling edges.
    for (let frame = 0; frame < this.frames; frame++) {
      const time = frame / this.sampleRate;
      for (const source of this.samples) {
        if (!source.buffer || !source.started || source.stopped || time < source.startTime || time >= source.stopTime) continue;
        const seconds = (time - source.startTime) * source.playbackRate.at(time);
        if (seconds >= source.sourceDuration) continue;
        const position = (source.offset + seconds) * source.buffer.sampleRate;
        if (position >= source.buffer.length) continue;
        const index = Math.floor(position); const fraction = position - index;
        const values = source.buffer.data.map(channel => channel[index]! * (1 - fraction) + (channel[index + 1] ?? 0) * fraction);
        const route = (node: Node, channels: number[]): void => {
          let output = channels;
          if (node instanceof Gain) output = channels.map(value => value * node.gain.at(time));
          if (node instanceof Panner) {
            const pan = node.pan.at(time);
            if (channels.length === 1) output = [channels[0]! * Math.cos((pan + 1) * Math.PI / 4), channels[0]! * Math.sin((pan + 1) * Math.PI / 4)];
            else if (pan <= 0) output = [channels[0]! + channels[1]! * Math.cos((pan + 1) * Math.PI / 2), channels[1]! * Math.sin((pan + 1) * Math.PI / 2)];
            else output = [channels[0]! * Math.cos(pan * Math.PI / 2), channels[1]! + channels[0]! * Math.sin(pan * Math.PI / 2)];
          }
          if (node === this.destination) { buffer.data[0]![frame] = buffer.data[0]![frame]! + (output[0] ?? 0); buffer.data[1]![frame] = buffer.data[1]![frame]! + (output[1] ?? 0); }
          else for (const next of node.connections) route(next, output);
        };
        for (const node of source.connections) route(node, values);
      }
    }
    return Promise.resolve(buffer as unknown as AudioBuffer);
  }
}

async function fixture(run: () => Promise<void>, options: { blocked?: boolean; pendingRender?: boolean } = {}): Promise<void> {
  const descriptors = ['AudioContext', 'OfflineAudioContext'].map(name => [name, Object.getOwnPropertyDescriptor(globalThis, name)] as const);
  Context.instances = []; Offline.renders = []; Context.blocked = options.blocked ?? false; Offline.pending = options.pendingRender ?? false;
  Object.defineProperty(globalThis, 'AudioContext', { configurable: true, value: Context }); Object.defineProperty(globalThis, 'OfflineAudioContext', { configurable: true, value: Offline });
  try { await run(); } finally { for (const [name, descriptor] of descriptors) { if (descriptor) Object.defineProperty(globalThis, name, descriptor); else Reflect.deleteProperty(globalThis, name); } }
}
function audio(): Context { return Context.instances[0]!; }
function sample(audio: PcmAudio = { sampleRate: 8000, channels: [new Float32Array(8000).fill(0.5)] }): SampleSoundPlan {
  return { kind: 'sample', version: 1, source: { id: 'recorded-bell', revision: 1, audio }, startSeconds: 0.1, endSeconds: 0.9, playbackRate: 2,
    envelope: { attackSeconds: 0.01, releaseSeconds: 0.08 }, note: { frequencyHz: 440, holdSeconds: 0.2, velocity: 0.8 }, level: 0.5 };
}
function basic(): SoundPlan { return { kind: 'basic-synth', version: 1, sources: [{ waveform: 'sine', frequencyRatio: 1, level: 1 }],
  envelope: { attackSeconds: 0, releaseSeconds: 0.1 }, note: { frequencyHz: 220, holdSeconds: 0.3, velocity: 1 }, level: 0.4 }; }
function sequence(sound: SampleSoundPlan, events = [0, 0.6], durationSeconds = 2): SoundSequencePlan {
  return { kind: 'sequence', version: 1, durationSeconds, events: events.map(atSeconds => ({ atSeconds, sound })) };
}
function close(actual: number, expected: number, tolerance = 1e-10): void { assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} vs ${expected}`); }
function pcm(bytes: Uint8Array, frame: number, channel: number): number { const at = 44 + frame * 6 + channel * 3; const value = bytes[at]! | bytes[at + 1]! << 8 | bytes[at + 2]! << 16; return value & 0x800000 ? value - 0x1000000 : value; }

test('one-shot sample notes use exact trim, rate, velocity and release on the global clock', async () => fixture(async () => {
  const runtime = createBrowserSoundRuntime(); const input = sample(); const playing = runtime.preview(input); input.source.audio.channels[0]!.fill(0);
  const session = await playing; const node = audio().samples[0]!;
  assert.equal(node.loop, false); assert.equal(node.buffer!.data[0]![4000], 0.5); close(node.offset, 0.1); close(node.sourceDuration, 0.8);
  close(node.playbackRate.at(session.startedAtSeconds), 2); close(node.startTime, session.startedAtSeconds); close(session.durationSeconds!, 0.28);
  close(node.stopTime - node.startTime, 0.281); close(audio().gains[0]!.gain.at(session.startedAtSeconds + 0.1), 0.4);
  close(audio().gains[0]!.gain.at(session.startedAtSeconds + 0.24), 0.2);
  node.end(); assert.ok(node.disconnected && node.stopped); close(runtime.position(session.id)!, 0.28); await runtime.dispose();
}));

test('the source can finish before note release while musical trailing silence remains', async () => fixture(async () => {
  const runtime = createBrowserSoundRuntime(); const short = { ...sample(), endSeconds: 0.3, playbackRate: 2, note: { ...sample().note, holdSeconds: 1 } };
  const single = await runtime.preview(short); close(single.durationSeconds!, 0.1); audio().samples[0]!.end();
  const phrase = await runtime.preview(sequence(short, [0.2], 2)); close(phrase.durationSeconds!, 2); audio().samples[1]!.end();
  assert.equal(runtime.position(phrase.id), 0); assert.equal(audio().clocks[0]!.stopped, false);
  audio().currentTime = phrase.startedAtSeconds + 2.001; audio().clocks[0]!.end(); close(runtime.position(phrase.id)!, 2); await runtime.dispose();
}));

test('many uses share one owned snapshot, one device buffer and a compact fingerprint', async () => fixture(async () => {
  const input = sample(); const plan = sequence(input, Array.from({ length: 512 }, (_, index) => index * 0.01), 6);
  const checked = readPreview(plan); assert.equal(checked.samples.length, 1);
  assert.ok(checked.events.every(event => event.sound.kind === 'sample' && event.sound.source.audio === checked.samples[0]!.audio));
  assert.ok(previewFingerprint(checked).length < 300000);
  const reused = readPreview(plan, { previous: checked }); assert.equal(reused.samples[0]!.audio, checked.samples[0]!.audio, 'fully checked unchanged sources reuse their owned PCM snapshot');
  const runtime = createBrowserSoundRuntime(); const session = await runtime.preview(plan);
  assert.equal(audio().buffers.length, 1); assert(audio().samples.length > 0 && audio().samples.length < 64, 'only the upcoming time window is allocated'); runtime.stop(session.id);
  assert.ok(audio().samples.every(node => node.disconnected && node.stopped)); await runtime.preview(input);
  assert.equal(audio().buffers.length, 2, 'the released graph must not retain an unused buffer forever'); await runtime.dispose();
}));

test('source identity conflicts and invalid tail samples reject before replacing music', async () => fixture(async () => {
  const runtime = createBrowserSoundRuntime(); const current = await runtime.preview(basic()); const head = sample();
  const tail = sample({ sampleRate: 8000, channels: [head.source.audio.channels[0]!.slice()] }); tail.source.audio.channels[0]![7999] = -0.5;
  await assert.rejects(runtime.preview({ kind: 'sequence', version: 1, durationSeconds: 2, events: [{ atSeconds: 0, sound: head }, { atSeconds: 1, sound: tail }] }), /同一个采样声源版本/);
  assert.equal(audio().oscillators[0]!.stopped, false); assert.equal(audio().buffers.length, 0);
  head.source.audio.channels[0]![7999] = NaN; await assert.rejects(runtime.preview(head), /无效/);
  assert.equal(audio().oscillators[0]!.stopped, false); assert.equal(runtime.position(current.id), 0); await runtime.dispose();
}));

test('equal source identities backed by separate identical arrays deduplicate without losing validation', async () => fixture(async () => {
  const one = sample(); const two = sample({ sampleRate: 8000, channels: [one.source.audio.channels[0]!.slice()] });
  const runtime = createBrowserSoundRuntime(); await runtime.preview({ kind: 'sequence', version: 1, durationSeconds: 2,
    events: [{ atSeconds: 0, sound: one }, { atSeconds: 1, sound: two }] });
  assert.equal(audio().buffers.length, 1); assert.equal(audio().samples.length, 2); await runtime.dispose();
}));

test('different material identities sharing PCM cannot multiply device buffers beyond the source budget', async () => fixture(async () => {
  const original = sample();
  const sounds = Array.from({ length: 200 }, (_, index) => ({ ...original, source: { ...original.source, id: `material-${index}` } }));
  const input: SoundSequencePlan = { kind: 'sequence', version: 1, durationSeconds: 3, events: sounds.map((sound, index) => ({ sound, atSeconds: index * 0.01 })) };
  const runtime = createBrowserSoundRuntime(); const playing = await runtime.preview(input);
  assert.equal(audio().samples.length, 200); assert.equal(audio().buffers.length, 1);
  runtime.stop(playing.id); await runtime.preview(original); assert.equal(audio().buffers.length, 2, 'all material leases must release the shared buffer together');
  await runtime.dispose();
}));

test('actual finite PCM peaks bound mixed sample and synthesized amplitudes', async () => fixture(async () => {
  const loud = sample({ sampleRate: 8000, channels: [new Float32Array(8000).fill(4)] });
  const input: SoundSequencePlan = { kind: 'sequence', version: 1, durationSeconds: 1, events: [{ atSeconds: 0, sound: loud }, { atSeconds: 0, sound: basic() }] };
  const checked = readPreview(input); close(checked.normalization, 1 / (4 * 0.5 * 0.8 + 0.4));
  const runtime = createBrowserSoundRuntime(); const session = await runtime.preview(input);
  close(audio().gains[0]!.gain.at(session.startedAtSeconds + 0.1), 0.2); close(audio().gains[1]!.gain.at(session.startedAtSeconds + 0.1), 0.2);
  assert.equal(audio().samples.length, 1); assert.equal(audio().oscillators.length, 1); await runtime.dispose();
}));

test('stereo full-pan and multichannel downmix stay conservatively bounded before WAV encoding', async () => fixture(async () => {
  const channel = new Float32Array(8000).fill(0.8); const source = { sampleRate: 8000, channels: [channel, channel] };
  const stereo = { ...sample(source), envelope: { attackSeconds: 0, releaseSeconds: 0 }, note: { ...sample().note, velocity: 1 }, level: 1 };
  const left: SoundSequencePlan = { kind: 'sequence', version: 1, durationSeconds: 0.3, events: [{ atSeconds: 0, sound: stereo, pan: -1 }] };
  close(readPreview(left).normalization, 1 / (channel[0]! * 2));
  const runtime = createBrowserSoundRuntime(); const rendered = await runtime.render(left);
  close(pcm(rendered.bytes, 100, 0), 8388607, 2); assert.equal(pcm(rendered.bytes, 100, 1), 0);
  for (const count of [3, 4, 5, 6, 7, 8]) {
    const multi = { ...stereo, source: { ...stereo.source, audio: { sampleRate: 8000, channels: Array.from({ length: count }, () => channel) } } };
    const checked = readPreview({ ...left, events: [{ atSeconds: 0, sound: multi, pan: 1 }] });
    close(checked.normalization, 1 / (channel[0]! * count));
  }
  await runtime.dispose();
}));

test('live edits seek to current note age, preserve release progress and reuse the source buffer', async () => fixture(async () => {
  const runtime = createBrowserSoundRuntime(); const input = { ...sample(), playbackRate: 1, note: { ...sample().note, holdSeconds: 0.6 } };
  const session = await runtime.preview(sequence(input, [0, 1], 2)); const oldEnded = audio().samples[0]!.onended;
  audio().currentTime = session.startedAtSeconds + 0.25;
  const updated = runtime.update(session.id, { ...sequence({ ...input, level: 0.25 }, [0, 1], 2), events: sequence({ ...input, level: 0.25 }, [0, 1], 2).events.map(event => ({ ...event, pan: 0.5 })) });
  assert.equal(updated!.id, session.id); assert.equal(updated!.startedAtSeconds, session.startedAtSeconds); assert.equal(audio().buffers.length, 1);
  const resumed = audio().samples[2]!; close(resumed.offset, 0.1 + resumed.startTime - session.startedAtSeconds);
  assert.ok(resumed.offset > 0.35); close(audio().samples[3]!.offset, 0.1); close(audio().samples[3]!.startTime, session.startedAtSeconds + 1);
  assert.equal(audio().panners[2]!.pan.at(resumed.startTime), 0.5); oldEnded?.(); assert.equal(audio().samples[2]!.stopped, false);
  audio().clocks.at(-1)!.end(); runtime.stop(session.id); assert.ok(audio().samples.every(node => node.disconnected)); await runtime.dispose();
}));

test('unchanged and repeated parameter edits neither rebuild identical content nor accumulate buffers', async () => fixture(async () => {
  const runtime = createBrowserSoundRuntime(); const input = sample(); const session = await runtime.preview(sequence(input, [0], 2));
  assert.equal(runtime.update(session.id, sequence(input, [0], 2))!.id, session.id); assert.equal(audio().samples.length, 1);
  for (let index = 0; index < 20; index++) {
    audio().currentTime = session.startedAtSeconds + 0.001 * index;
    runtime.update(session.id, sequence({ ...input, level: 0.3 + index / 100 }, [0], 2)); audio().clocks.at(-1)!.end();
    assert.equal(audio().buffers.length, 1); assert.ok(audio().samples.filter(node => !node.disconnected).length <= 1);
  }
  input.source.audio.channels[0]![7999] = 0.25;
  runtime.update(session.id, sequence({ ...input, level: 0.49 }, [0], 2)); assert.equal(audio().buffers.length, 2, 'a changed tail cannot hide behind a stable id/revision');
  runtime.stopAll(); assert.ok(audio().samples.every(node => node.disconnected)); await runtime.dispose();
}));

test('exhausted samples never restart during live edits and interruptions release every node', async () => fixture(async () => {
  const runtime = createBrowserSoundRuntime(); const short = { ...sample(), endSeconds: 0.2, playbackRate: 2 };
  const session = await runtime.preview(sequence(short, [0], 2)); audio().currentTime = session.startedAtSeconds + 0.3;
  runtime.update(session.id, sequence({ ...short, level: 0.2 }, [0], 2)); assert.equal(audio().samples.length, 1);
  audio().state = 'suspended'; audio().onstatechange?.(); assert.ok(audio().samples.every(node => node.disconnected && node.stopped)); await runtime.dispose();
}));

test('invalid sample controls and allocation failures preserve a playing preview', async () => fixture(async () => {
  const runtime = createBrowserSoundRuntime(); const playing = await runtime.preview(sample()); const original = audio().samples[0]!;
  for (const changes of [{ playbackRate: 0 }, { playbackRate: Infinity }, { startSeconds: -1 }, { endSeconds: 1.1 }, { startSeconds: 0.9, endSeconds: 0.9 }, { source: { ...sample().source, revision: 0 } }])
    await assert.rejects(runtime.preview({ ...sample(), ...changes }));
  audio().failBuffer = true; await assert.rejects(runtime.preview(sample({ sampleRate: 8000, channels: [new Float32Array(8000).fill(0.25)] })), /allocation failed/);
  assert.equal(original.stopped, false); assert.equal(original.disconnected, false); audio().failBuffer = false;
  audio().failSource = true; assert.throws(() => runtime.update(playing.id, { ...sample(), level: 0.2 }), /source allocation failed/);
  assert.equal(original.stopped, false); assert.equal(original.disconnected, false);
  await runtime.dispose();
}));

test('pending device starts can be cancelled without late sampled notes', async () => fixture(async () => {
  const runtime = createBrowserSoundRuntime(); const pending = runtime.preview(sample()); runtime.stopAll(); await assert.rejects(pending, /取消/);
  assert.equal(audio().samples.length, 0); assert.equal(audio().buffers.length, 0); await runtime.dispose();
}, { blocked: true }));

test('unique sample capacity is bounded before device allocation, with repeated identities counted once', () => {
  const channel = new Float32Array(4 * 1024 * 1024).fill(0.25);
  const sounds = Array.from({ length: 9 }, (_, id) => id).map(id => ({ ...sample({ sampleRate: 192000, channels: [channel, channel, channel, channel] }), source: { id: `large-${id}`, revision: 1,
    audio: { sampleRate: 192000, channels: [channel, channel, channel, channel] } } }));
  assert.throws(() => readPreview({ kind: 'sequence', version: 1, durationSeconds: 2, events: sounds.map(sound => ({ atSeconds: 0, sound })) }), /512 MiB/);
});

test('offline WAV contains the trimmed, pitched sample through the same envelopes and pan as live playback', async () => fixture(async () => {
  const source = new Float32Array(80); source.fill(0.5, 0, 20); source.fill(1, 20, 40); source.fill(-0.25, 40);
  const sound: SampleSoundPlan = { ...sample({ sampleRate: 8000, channels: [source] }), startSeconds: 0.0025, endSeconds: 0.0075, playbackRate: 2,
    envelope: { attackSeconds: 0, releaseSeconds: 0 }, note: { frequencyHz: 527.3, holdSeconds: 0.02, velocity: 0.8 }, level: 0.5 };
  const input: SoundSequencePlan = { kind: 'sequence', version: 1, durationSeconds: 0.02, events: [{ atSeconds: 0.005, sound, pan: -1 }] };
  const runtime = createBrowserSoundRuntime(); const live = await runtime.preview(input); const rendered = await runtime.render(input, { sampleRate: 44100 });
  const offline = Offline.renders[0]!; const node = offline.samples[0]!;
  close(node.offset, audio().samples[0]!.offset); close(node.sourceDuration, audio().samples[0]!.sourceDuration); close(node.playbackRate.at(0.005), 2);
  close(node.startTime, audio().samples[0]!.startTime - live.startedAtSeconds); assert.equal(offline.buffers.length, 1);
  assert.equal(pcm(rendered.bytes, 100, 0), 0); close(pcm(rendered.bytes, 240, 0), Math.round(0.4 * 8388607), 2);
  close(pcm(rendered.bytes, 305, 0), Math.round(-0.1 * 8388608), 2); assert.equal(pcm(rendered.bytes, 400, 0), 0);
  assert.equal(pcm(rendered.bytes, 240, 1), 0); assert.ok(offline.samples.every(source => source.disconnected));
  close(rendered.durationSeconds, 0.02); await runtime.dispose();
}));

test('offline cancellation releases sampled graph resources without opening a playback device', async () => fixture(async () => {
  const runtime = createBrowserSoundRuntime(); const controller = new AbortController(); const job = runtime.render(sequence(sample()), { signal: controller.signal });
  assert.equal(Context.instances.length, 1); assert.equal(Offline.renders.length, 1); controller.abort(); await assert.rejects(job, /取消/);
  assert.ok(Offline.renders[0]!.samples.every(source => source.stopped && source.disconnected)); await runtime.dispose();
}, { pendingRender: true }));
