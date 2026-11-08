import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { SampleSoundPlan, SoundPlan } from '../src/workstation/contracts/sound.ts';
import { createBrowserSoundRuntime } from '../src/workstation/modules/sound-runtime/public.ts';
import { allocateGraph, scheduleGraph, releaseGraph, startGraphSource, type GraphResources } from '../src/workstation/modules/sound-runtime/graph.ts';
import { readPreview } from '../src/workstation/modules/sound-runtime/plan.ts';
import { previewTimbrePreset } from '../src/workstation/modules/timbre/public.ts';

class Param {
  value = 0; changes: { time: number; value: number; ramp: boolean }[] = [];
  setValueAtTime(value: number, time: number) { this.changes.push({ time, value, ramp: false }); }
  linearRampToValueAtTime(value: number, time: number) { this.changes.push({ time, value, ramp: true }); }
  cancelAndHoldAtTime(time: number) { this.setValueAtTime(this.at(time), time); }
  at(time: number): number { let previous = { time: -Infinity, value: this.value }; for (const change of this.changes) { if (time < change.time) return change.ramp && Number.isFinite(previous.time) ? previous.value + (change.value - previous.value) * (time - previous.time) / (change.time - previous.time) : previous.value; previous = change; } return previous.value; }
}
class Node { links: Node[] = []; disconnected = false; connect(next: Node) { this.links.push(next); } disconnect() { this.links = []; this.disconnected = true; } }
class Gain extends Node { gain = Object.assign(new Param(), { value: 1 }); }
class Panner extends Node { pan = new Param(); }
class Filter extends Node { frequency = new Param(); Q = new Param(); type = 'lowpass'; }
class Buffer {
  data: Float32Array[]; numberOfChannels: number; length: number; sampleRate: number;
  constructor(numberOfChannels: number, length: number, sampleRate: number) { this.numberOfChannels = numberOfChannels; this.length = length; this.sampleRate = sampleRate; this.data = Array.from({ length: numberOfChannels }, () => new Float32Array(length)); }
  getChannelData(channel: number) { return this.data[channel]!; }
}
class Source extends Node {
  onended: (() => void) | null = null; startTime = Infinity; stopTime = Infinity;
  start(time = 0) { this.startTime = time; } stop(time = 0) { this.stopTime = time; }
}
class Oscillator extends Source { frequency = new Param(); type = 'sine'; }
class Constant extends Source { offset = new Param(); }
class Sample extends Source {
  playbackRate = Object.assign(new Param(), { value: 1 }); buffer: Buffer | null = null; loop = false; loopStart = 0; loopEnd = 0; offset = 0; duration = Infinity;
  override start(time = 0, offset = 0, duration = Infinity) { super.start(time); this.offset = offset; this.duration = duration; }
}
class Context {
  static instances: Context[] = []; currentTime = 0; sampleRate = 48000; state = 'running'; onstatechange: (() => void) | null = null;
  destination = new Node(); gains: Gain[] = []; panners: Panner[] = []; filters: Filter[] = []; oscillators: Oscillator[] = []; samples: Sample[] = []; buffers: Buffer[] = [];
  constructor() { Context.instances.push(this); }
  createGain() { const node = new Gain(); this.gains.push(node); return node; }
  createStereoPanner() { const node = new Panner(); this.panners.push(node); return node; }
  createBiquadFilter() { const node = new Filter(); this.filters.push(node); return node; }
  createOscillator() { const node = new Oscillator(); this.oscillators.push(node); return node; }
  createBufferSource() { const node = new Sample(); this.samples.push(node); return node; }
  createBuffer(channels: number, frames: number, rate: number) { const buffer = new Buffer(channels, frames, rate); this.buffers.push(buffer); return buffer; }
  createConstantSource() { return new Constant(); }
  async resume() { this.state = 'running'; } async close() { this.state = 'closed'; }
}
class Offline extends Context {
  static renders: Offline[] = [];
  channelCount: number; frames: number;
  constructor(channelCount: number, frames: number, rate: number) { super(); this.channelCount = channelCount; this.frames = frames; this.sampleRate = rate; Offline.renders.push(this); }
  suspend(): Promise<void> { return new Promise(() => {}); }
  async startRendering(): Promise<AudioBuffer> {
    const result = new Buffer(2, this.frames, this.sampleRate);
    // Independent scalar oscillator/buffer + gain/pan evaluator. Filter DSP is
    // deliberately not simulated; filter wiring/parameters are asserted below.
    for (let frame = 0; frame < this.frames; frame++) {
      const time = frame / this.sampleRate;
      const route = (node: Node, values: number[]) => {
        if (node instanceof Gain) values = values.map(value => value * node.gain.at(time));
        if (node instanceof Panner) { const pan = node.pan.at(time); values = [values[0]! * Math.cos((pan + 1) * Math.PI / 4), values[0]! * Math.sin((pan + 1) * Math.PI / 4)]; }
        if (node === this.destination) { for (let channel = 0; channel < 2; channel++) result.data[channel]![frame] = result.data[channel]![frame]! + (values[channel] ?? 0); }
        else node.links.forEach(next => route(next, values));
      };
      for (const source of [...this.oscillators, ...this.samples]) {
        if (time < source.startTime || time >= source.stopTime) continue;
        let value = 0;
        if (source instanceof Oscillator) value = Math.sin(2 * Math.PI * source.frequency.at(time) * (time - source.startTime));
        else if (source.buffer) {
          const age = (time - source.startTime) * source.playbackRate.at(time); if (age >= source.duration) continue;
          let position = source.offset + age;
          if (source.loop && position >= source.loopEnd) position = source.loopStart + (position - source.loopStart) % (source.loopEnd - source.loopStart);
          const index = Math.floor(position * source.buffer.sampleRate); value = source.buffer.data[0]![index] ?? 0;
        }
        source.links.forEach(next => route(next, [value]));
      }
    }
    return result as unknown as AudioBuffer;
  }
}
function resources(): GraphResources { return { oscillators: [], samples: [], gains: [], panners: [], bufferReleases: [] }; }
const close = (a: number, b: number) => assert(Math.abs(a - b) < 1e-7, `${a} != ${b}`);
async function device<T>(run: () => Promise<T>): Promise<T> {
  const old = ['AudioContext', 'OfflineAudioContext'].map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)] as const);
  Object.defineProperty(globalThis, 'AudioContext', { configurable: true, value: Context }); Object.defineProperty(globalThis, 'OfflineAudioContext', { configurable: true, value: Offline });
  try { return await run(); } finally { old.forEach(([key, value]) => { if (value) Object.defineProperty(globalThis, key, value); else Reflect.deleteProperty(globalThis, key); }); }
}
function sample(): SampleSoundPlan { return { kind: 'sample', version: 1, source: { id: 'raw', revision: 1, audio: { sampleRate: 8000, channels: [Float32Array.from({ length: 800 }, () => .4)] } }, startSeconds: 0, endSeconds: .1, playbackRate: 1, envelope: { attackSeconds: 0, releaseSeconds: .1 }, note: { frequencyHz: 220, holdSeconds: .5, velocity: 1 }, level: .5 }; }
function pcm(bytes: Uint8Array, time: number): number { const frame = Math.floor(time * 48000); const at = 44 + frame * 6; let n = bytes[at]! | bytes[at + 1]! << 8 | bytes[at + 2]! << 16; if (n & 0x800000) n -= 0x1000000; return n / 8388607; }

test('actual synthesis graph has looping deterministic noise and correctly wired filter, pitch and ADSR scheduling', () => {
  const context = new Context(); const r = resources(); const plan = previewTimbrePreset('snare');
  const graph = allocateGraph(context as unknown as BaseAudioContext, readPreview(plan), r); scheduleGraph(graph, 1, 0);
  graph.starts.forEach(start => startGraphSource(start, 0));
  assert.equal(context.samples.length, 1); assert(context.samples[0]!.loop); assert(context.buffers[0]!.data[0]!.some(value => value !== 0));
  assert.equal(context.filters[0]!.type, 'highpass'); assert.equal(context.filters[0]!.frequency.value, 650);
  const envelope = graph.envelopes[0]!.node as unknown as Gain; close(envelope.gain.at(.076), plan.level * plan.note.velocity * .5); close(envelope.gain.at(.2), 0);
  releaseGraph(r); assert(context.filters.every(node => node.disconnected)); assert(context.samples.every(node => node.disconnected));
  const next = resources(); allocateGraph(context as unknown as BaseAudioContext, readPreview(plan), next); assert.equal(context.buffers.length, 1, 'noise buffer is reused per device'); releaseGraph(next);
});

test('live replacements rejoin pitch decay and amplitude at original note age, and expire sources correctly', () => {
  const context = new Context(); const r = resources(); const plan: SoundPlan = { ...previewTimbrePreset('plain'), pitch: { semitones: 12, seconds: 1 }, envelope: { attackSeconds: .2, decaySeconds: .4, sustain: .5, releaseSeconds: .2 } };
  const graph = allocateGraph(context as unknown as BaseAudioContext, readPreview(plan), r); scheduleGraph(graph, 1, 0, .5, .005);
  graph.starts.forEach(start => startGraphSource(start, 0, .5));
  const oscillator = context.oscillators[0]!; close(oscillator.frequency.at(.5), 330); close(oscillator.frequency.at(1), 220);
  const envelope = graph.envelopes[0]!.node as unknown as Gain; close(envelope.gain.at(.505), .65 * .8 * (.5 + (.6 - .505) / .4 * .5));
  close(oscillator.startTime, .5); close(oscillator.stopTime, 1.201); releaseGraph(r);
});

test('sample loops outlive the original file and resume from loop phase while one-shot durations remain unchanged', () => {
  const plain = sample(); close(readPreview(plain).durationSeconds, .1);
  const plan: SampleSoundPlan = { ...plain, loop: { startSeconds: .02, endSeconds: .08 } }; close(readPreview(plan).durationSeconds, .6);
  const context = new Context(); const r = resources(); const graph = allocateGraph(context as unknown as BaseAudioContext, readPreview(plan), r);
  scheduleGraph(graph, 1, 0, .23); graph.starts.forEach(start => startGraphSource(start, 0, .23));
  assert(context.samples[0]!.loop); close(context.samples[0]!.loopStart, .02); close(context.samples[0]!.loopEnd, .08); close(context.samples[0]!.offset, .05);
  assert.equal(context.samples[0]!.duration, Infinity); close(context.samples[0]!.stopTime, .601); releaseGraph(r);
  for (const loop of [{ startSeconds: .1, endSeconds: .2 }, { startSeconds: .08, endSeconds: .02 }]) assert.throws(() => readPreview({ ...plain, loop }));
});

test('offline WAV contains the programmed sustain release and looping sample after the original audio ends', async () => device(async () => {
  const runtime = createBrowserSoundRuntime();
  const base = previewTimbrePreset('plain'); const plan = { ...base, envelope: { attackSeconds: .05, decaySeconds: .05, sustain: .4, releaseSeconds: .1 }, note: { ...base.note, holdSeconds: .3 } };
  const wav = await runtime.render(plan); close(wav.durationSeconds, .4);
  assert(Math.abs(pcm(wav.bytes, .126)) > .05); const tail = Math.abs(pcm(wav.bytes, .376)); assert(tail > .01 && tail < .09);
  const looped = await runtime.render({ ...sample(), loop: { startSeconds: .02, endSeconds: .08 } });
  close(looped.durationSeconds, .6); close(pcm(looped.bytes, .3), .2 / Math.sqrt(2)); close(pcm(looped.bytes, .55), .1 / Math.sqrt(2));
  assert(Offline.renders.every(context => context.gains.every(node => node.disconnected))); await runtime.dispose();
}));
