import assert from 'node:assert/strict';
import test from 'node:test';
import { createBrowserSoundRuntime } from '../src/workstation/modules/sound-runtime/public.ts';
import type { SoundPlan, SoundSequencePlan } from '../src/workstation/contracts/sound.ts';
import type { ContentRecord, SaveResult } from '../src/workstation/contracts/content.ts';
import { createMaterialLibrary } from '../src/workstation/modules/materials/public.ts';
import { createTimbreEditor, createTimbrePlayback } from '../src/workstation/modules/timbre/public.ts';
import { createPhraseEditor, createPhrasePlayback } from '../src/workstation/modules/phrase/public.ts';
import { createSongEditor, createSongPlayback } from '../src/workstation/modules/song/public.ts';

class Param {
  changes: { value: number; time: number; ramp: boolean }[] = [];
  setValueAtTime(value: number, time: number): void { this.changes.push({ value, time, ramp: false }); }
  linearRampToValueAtTime(value: number, time: number): void { this.changes.push({ value, time, ramp: true }); }
}
class Node {
  disconnected = false;
  connect(): void { /* No audio is produced by these scheduling tests. */ }
  disconnect(): void { this.disconnected = true; }
}
class Oscillator extends Node {
  frequency = new Param(); type = 'sine'; onended: (() => void) | null = null;
  startTime = -1; stopTime = -1;
  start(time = 0): void { this.startTime = time; }
  stop(time = 0): void { this.stopTime = time; }
}
class Gain extends Node { gain = new Param(); }
class Panner extends Node { pan = new Param(); }
class Constant extends Oscillator { offset = new Param(); }
class Context {
  static instances: Context[] = [];
  oscillators: Oscillator[] = []; gains: Gain[] = []; panners: Panner[] = [];
  currentTime = 0; sampleRate = 48000; state = 'running'; onstatechange: (() => void) | null = null;
  destination = new Node();
  constructor() { Context.instances.push(this); }
  createOscillator(): Oscillator { const node = new Oscillator(); this.oscillators.push(node); return node; }
  createGain(): Gain { const node = new Gain(); this.gains.push(node); return node; }
  createStereoPanner(): Panner { const node = new Panner(); this.panners.push(node); return node; }
  createConstantSource(): Constant { return new Constant(); }
  async resume(): Promise<void> { /* Always available for the scheduling fixture. */ }
  async close(): Promise<void> { this.state = 'closed'; }
}
class Offline extends Context {
  static instances: Offline[] = [];
  static mode: 'normal' | 'pending' | 'failure' | 'nonfinite' = 'normal';
  readonly channels: number; readonly length: number;
  suspensionTimes: number[] = [];
  constructor(channels: number, length: number, sampleRate: number) {
    super(); this.channels = channels; this.length = length; this.sampleRate = sampleRate; Offline.instances.push(this);
  }
  suspend(time: number): Promise<void> { this.suspensionTimes.push(time); return new Promise(() => {}); }
  startRendering(): Promise<AudioBuffer> {
    if (Offline.mode === 'pending') return new Promise(() => {});
    if (Offline.mode === 'failure') return Promise.reject(new Error('offline device failed'));
    const left = new Float32Array(this.length);
    const right = new Float32Array(this.length);
    left.set([0, 0.25, -0.5, 1, -1, 1.5, -1.5].slice(0, this.length));
    right.set([-0.25, 0.5, 0, -1, 1, -1.5, 1.5].slice(0, this.length));
    if (Offline.mode === 'nonfinite') left[0] = Number.NaN;
    return Promise.resolve({ length: this.length, sampleRate: this.sampleRate, getChannelData: (channel: number) => channel === 0 ? left : right } as AudioBuffer);
  }
}

function plan(): SoundPlan {
  return { kind: 'basic-synth', version: 1, sources: [{ waveform: 'sine', frequencyRatio: 1, level: 1 }],
    envelope: { attackSeconds: 0.1, releaseSeconds: 0.2 }, note: { frequencyHz: 440, holdSeconds: 0.05, velocity: 1 }, level: 1 };
}
async function fixture(run: () => Promise<void>, mode: typeof Offline.mode = 'normal'): Promise<void> {
  const before = ['OfflineAudioContext', 'AudioContext'].map(name => [name, Object.getOwnPropertyDescriptor(globalThis, name)] as const);
  Offline.instances = []; Context.instances = []; Offline.mode = mode;
  Object.defineProperty(globalThis, 'OfflineAudioContext', { configurable: true, value: Offline });
  Object.defineProperty(globalThis, 'AudioContext', { configurable: true, value: Context });
  try { await run(); } finally {
    for (const [name, descriptor] of before) {
      if (descriptor) Object.defineProperty(globalThis, name, descriptor); else Reflect.deleteProperty(globalThis, name);
    }
  }
}
function pcm(bytes: Uint8Array, frame: number, channel: number): number {
  const at = 44 + frame * 6 + channel * 3;
  const unsigned = bytes[at]! | (bytes[at + 1]! << 8) | (bytes[at + 2]! << 16);
  return unsigned & 0x800000 ? unsigned - 0x1000000 : unsigned;
}
function saved(result: SaveResult): ContentRecord {
  if (result.status !== 'saved') throw new Error(`Expected successful save, received ${result.status}.`);
  return result.content;
}

test('offline WAV encodes exact stereo PCM samples, duration and standard RIFF headers', async () => fixture(async () => {
  const runtime = createBrowserSoundRuntime();
  const progress: number[] = [];
  const result = await runtime.render(plan(), { onProgress: value => progress.push(value) });
  const view = new DataView(result.bytes.buffer);
  assert.equal(result.mimeType, 'audio/wav'); assert.equal(result.channels, 2); assert.equal(result.bitsPerSample, 24);
  assert.equal(result.sampleRate, 48000); assert.equal(result.durationSeconds, 0.25);
  assert.equal(result.bytes.length, 44 + 12000 * 6);
  assert.equal(Buffer.from(result.bytes.subarray(0, 4)).toString(), 'RIFF');
  assert.equal(Buffer.from(result.bytes.subarray(8, 16)).toString(), 'WAVEfmt ');
  assert.equal(view.getUint32(4, true), result.bytes.length - 8);
  assert.equal(view.getUint32(24, true), 48000); assert.equal(view.getUint32(28, true), 288000);
  assert.equal(view.getUint16(20, true), 1); assert.equal(view.getUint16(22, true), 2);
  assert.equal(view.getUint16(32, true), 6); assert.equal(view.getUint16(34, true), 24);
  assert.equal(view.getUint32(40, true), 72000);
  assert.equal(pcm(result.bytes, 1, 0), 2097152); assert.equal(pcm(result.bytes, 0, 1), -2097152);
  assert.equal(pcm(result.bytes, 3, 0), 8388607); assert.equal(pcm(result.bytes, 4, 0), -8388608);
  assert.equal(pcm(result.bytes, 5, 0), 8388607); assert.equal(pcm(result.bytes, 6, 0), -8388608);
  assert.deepEqual([progress[0], progress.at(-1)], [0, 1]);
  assert(Offline.instances[0]!.oscillators.every(node => node.disconnected));
  await runtime.dispose();
}));

test('live and offline use identical normalized envelope, source, panning and note timing', async () => fixture(async () => {
  const runtime = createBrowserSoundRuntime();
  const input: SoundSequencePlan = { kind: 'sequence', version: 1, durationSeconds: 2,
    events: [{ atSeconds: 0.2, sound: plan(), pan: -0.7 }, { atSeconds: 0.2, sound: plan(), pan: 1 }] };
  const live = await runtime.preview(input);
  await runtime.render(input);
  const offline = Offline.instances[0]!;
  const allocated = offline.gains[0]!.gain.changes;
  assert.deepEqual(allocated.map(change => change.value), [0, 0.25, 0.25, 0]);
  assert.equal(offline.panners[0]!.pan.changes[0]!.value, -0.7);
  assert.equal(offline.panners[1]!.pan.changes[0]!.value, 1);
  assert.equal(offline.oscillators[0]!.startTime, 0.2);
  assert.equal(offline.oscillators[0]!.frequency.changes[0]!.value, 440);
  assert.equal(live.durationSeconds, 2);
  assert.equal(offline.length, 96000);
  const liveGraph = Context.instances[0]!;
  const afterStart = liveGraph.gains[0]!.gain.changes.map(change => ({ ...change, time: change.time - live.startedAtSeconds }));
  for (let index = 0; index < allocated.length; index += 1) {
    assert.equal(afterStart[index]!.value, allocated[index]!.value);
    assert.equal(afterStart[index]!.ramp, allocated[index]!.ramp);
    assert(Math.abs(afterStart[index]!.time - allocated[index]!.time) < 1e-10);
  }
  assert.deepEqual(liveGraph.panners.map(node => node.pan.changes[0]!.value), [-0.7, 1]);
  assert.equal(liveGraph.oscillators[0]!.frequency.changes[0]!.value, offline.oscillators[0]!.frequency.changes[0]!.value);
  await runtime.dispose();
}));

test('the complete public content pipeline renders a source-tempo song with track levels, pan and the final release tail', async () => fixture(async () => {
  let raw: string | null = null;
  let writes = 0;
  const storage = { read: () => raw, write(value: string) { raw = value; writes += 1; } };
  const library = createMaterialLibrary(storage);
  const timbre = createTimbreEditor(library);
  timbre.rename('风中的木琴'); timbre.setCharacter('warm'); timbre.setEnvelope(0.05, 0.6); timbre.setLevel(0.5);
  const voice = saved(timbre.save('new'));
  const timbrePlayback = createTimbrePlayback(library);
  const phrase = createPhraseEditor(library, timbrePlayback);
  phrase.create(voice.id); phrase.rename('慢慢的回应'); phrase.setTempo(60); phrase.setLength(4);
  phrase.addNote(phrase.read().body!.parts[0]!.id, { startBeat: 1, durationBeats: 2, frequencyHz: 220, velocity: 0.8 });
  const slow = saved(phrase.save('new'));
  phrase.create(voice.id); phrase.rename('轻快的结尾'); phrase.setTempo(120); phrase.setLength(4);
  phrase.addNote(phrase.read().body!.parts[0]!.id, { startBeat: 3.5, durationBeats: 0.5, frequencyHz: 330, velocity: 0.5 });
  const quick = saved(phrase.save('new'));
  const phrases = createPhrasePlayback(library, timbrePlayback);
  const song = createSongEditor(library, phrases, { defaultTempoMode: 'source' });
  song.create(); song.rename('不同步伐，同一首歌');
  const left = song.read().body!.tracks[0]!.id;
  const right = song.addTrack('右边的回应');
  song.updateTrack(left, { level: 0.4, pan: -1 }); song.updateTrack(right, { level: 0.6, pan: 1 });
  song.addClip(left, slow.id, 0); song.addClip(right, quick.id, 12);
  const content = saved(song.save('new'));
  const before = raw; const beforeWrites = writes;
  const reopened = createMaterialLibrary(storage);
  const playback = createSongPlayback(reopened, createPhrasePlayback(reopened, createTimbrePlayback(reopened)));
  const execution = playback.planForSaved(content.id);
  assert.deepEqual(execution.events.map(event => [event.atSeconds, event.sound.note.holdSeconds]), [[1, 2], [7.75, 0.25]]);
  assert.deepEqual(execution.events.map(event => event.sound.level), [0.2, 0.3]);
  assert(Math.abs(execution.durationSeconds - 8.6) < 1e-10);
  const runtime = createBrowserSoundRuntime();
  const result = await runtime.render(execution);
  const audio = Offline.instances[0]!;
  assert.deepEqual(audio.oscillators.map(node => node.startTime), [1, 1, 7.75, 7.75]);
  assert.deepEqual(audio.oscillators.map(node => node.frequency.changes[0]!.value), [220, 220, 330, 330]);
  assert.deepEqual(audio.panners.map(node => node.pan.changes[0]!.value), [-1, 1]);
  const envelopes = audio.gains.filter(node => node.gain.changes.length === 4);
  assert(Math.abs(envelopes[0]!.gain.changes[1]!.value - 0.16) < 1e-10);
  assert(Math.abs(envelopes[1]!.gain.changes[1]!.value - 0.15) < 1e-10);
  assert(Math.abs(envelopes[1]!.gain.changes[3]!.time - 8.6) < 1e-10);
  const header = new DataView(result.bytes.buffer);
  assert.equal(header.getUint32(24, true), 48000);
  assert.equal(header.getUint16(34, true), 24);
  assert.equal(header.getUint32(40, true), Math.ceil(8.6 * 48000) * 6);
  assert(Math.abs(result.durationSeconds - 8.6) <= 1 / 48000);
  assert.equal(raw, before); assert.equal(writes, beforeWrites);
  await runtime.dispose();
}));

test('offline preserves final release tails and trailing silence at the requested sample rate', async () => fixture(async () => {
  const runtime = createBrowserSoundRuntime();
  const input: SoundSequencePlan = { kind: 'sequence', version: 1, durationSeconds: 2,
    events: [{ atSeconds: 1.9, sound: plan() }] };
  const tail = await runtime.render(input, { sampleRate: 44100 });
  assert(Math.abs(tail.durationSeconds - 2.15) <= 1 / 44100);
  assert.equal(Offline.instances[0]!.length, Math.ceil(2.15 * 44100));
  const silence = await runtime.render({ ...input, durationSeconds: 4 });
  assert.equal(silence.durationSeconds, 4);
  assert.equal(Offline.instances[1]!.length, 192000);
  await runtime.dispose();
}));

test('a suspension near the final render block is skipped instead of rounding beyond the buffer', async () => fixture(async () => {
  const runtime = createBrowserSoundRuntime();
  const input = { ...plan(), note: { ...plan().note, holdSeconds: 0.0501 } };
  const result = await runtime.render(input);
  assert(Math.abs(result.durationSeconds - 0.2501) <= 1 / 48000);
  assert.deepEqual(Offline.instances[0]!.suspensionTimes, []);
  await runtime.dispose();
}));

test('invalid plans, pan, sample rate, frequency and output limits reject before offline allocation', async () => fixture(async () => {
  const runtime = createBrowserSoundRuntime();
  await assert.rejects(runtime.render({ ...plan(), level: Number.NaN }), /有限数值/);
  await assert.rejects(runtime.render(plan(), { sampleRate: 100 as 48000 }), /支持/);
  await assert.rejects(runtime.render({ ...plan(), sources: [{ waveform: 'sine', frequencyRatio: 64, level: 1 }] }), /超出/);
  const input: SoundSequencePlan = { kind: 'sequence', version: 1, durationSeconds: 600, events: [{ atSeconds: 0, sound: plan() }] };
  await assert.rejects(runtime.render(input, { sampleRate: 96000 }), /大小范围/);
  await assert.rejects(runtime.render({ ...input, events: [{ atSeconds: 0, sound: plan(), pan: 1.1 }] }), /左右位置/);
  assert.equal(Offline.instances.length, 0);
  await runtime.dispose();
}));

test('cancellation before rendering allocates nothing and during rendering releases every node', async () => fixture(async () => {
  const runtime = createBrowserSoundRuntime();
  const pre = new AbortController(); pre.abort();
  await assert.rejects(runtime.render(plan(), { signal: pre.signal }), { name: 'AbortError' });
  assert.equal(Offline.instances.length, 0);
  const controller = new AbortController();
  const rendering = runtime.render(plan(), { signal: controller.signal });
  controller.abort();
  await assert.rejects(rendering, { name: 'AbortError' });
  const audio = Offline.instances[0]!;
  assert(audio.oscillators.every(node => node.disconnected)); assert(audio.gains.every(node => node.disconnected));
  await runtime.dispose();
}, 'pending'));

test('dispose cancels an in-progress export and later export rejects', async () => fixture(async () => {
  const runtime = createBrowserSoundRuntime();
  const rendering = runtime.render(plan());
  const rejected = assert.rejects(rendering, { name: 'AbortError' });
  await runtime.dispose(); await rejected;
  await assert.rejects(runtime.render(plan()), /已关闭/);
}, 'pending'));

test('offline export opens no playback device and does not replace an existing live preview', async () => fixture(async () => {
  const runtime = createBrowserSoundRuntime();
  await runtime.render(plan());
  assert.equal(Context.instances.every(audio => audio instanceof Offline), true);
  const live = await runtime.preview(plan());
  const playbackContext = Context.instances.find(audio => !(audio instanceof Offline))!;
  await runtime.render(plan());
  assert.equal(playbackContext.oscillators[0]!.disconnected, false);
  assert.equal(runtime.position(live.id), 0);
  await runtime.dispose();
}));

test('cancelling during PCM encoding produces no completed audio and a later export still succeeds', async () => fixture(async () => {
  const runtime = createBrowserSoundRuntime();
  const controller = new AbortController();
  const input: SoundSequencePlan = { kind: 'sequence', version: 1, durationSeconds: 4, events: [{ atSeconds: 0, sound: plan() }] };
  await assert.rejects(runtime.render(input, { signal: controller.signal, onProgress: value => {
    if (value > 0.85) controller.abort();
  } }), { name: 'AbortError' });
  assert.equal((await runtime.render(plan())).mimeType, 'audio/wav');
  await runtime.dispose();
}));

test('offline failure releases resources and nonfinite samples produce no output', async () => fixture(async () => {
  const runtime = createBrowserSoundRuntime();
  await assert.rejects(runtime.render(plan()), /offline device failed/);
  assert(Offline.instances[0]!.gains.every(node => node.disconnected));
  Offline.mode = 'nonfinite';
  await assert.rejects(runtime.render(plan()), /无效采样/);
  await runtime.dispose();
}, 'failure'));

test('a display progress callback cannot break export and an absent offline backend is explicit', async () => fixture(async () => {
  const runtime = createBrowserSoundRuntime();
  assert.equal((await runtime.render(plan(), { onProgress: () => { throw new Error('display failure'); } })).mimeType, 'audio/wav');
  Reflect.deleteProperty(globalThis, 'OfflineAudioContext');
  await assert.rejects(runtime.render(plan()), /离线音频接口/);
  await runtime.dispose();
}));

test('live playback and WAV rendering share the same final-output envelope including the natural tail', async () => fixture(async () => {
  const runtime = createBrowserSoundRuntime(); const input: SoundSequencePlan = { kind: 'sequence', version: 1, durationSeconds: 1,
    events: [{ atSeconds: 0.9, sound: { ...plan(), note: { ...plan().note, holdSeconds: 0.1 }, envelope: { attackSeconds: 0, releaseSeconds: 0.5 } } }],
    output: { level: 0.45, fadeInSeconds: 0.2, fadeOutSeconds: 0.4 } };
  const live = await runtime.preview(input); const result = await runtime.render(input);
  const offline = Offline.instances[0]!; const liveBus = Context.instances[0]!.gains[0]!.gain;
  const offlineBus = offline.gains[0]!.gain;
  assert.equal(result.durationSeconds, 1.5); assert.equal(live.durationSeconds, 1.5);
  const levels = [0, 0.45, 0.45, 0];
  offlineBus.changes.forEach((change, index) => { assert(Math.abs(change.value - levels[index]!) < 1e-12); });
  for (let index = 0; index < offlineBus.changes.length; index++) {
    const actual = liveBus.changes[index]!; const expected = offlineBus.changes[index]!;
    assert.equal(actual.value, expected.value); assert.equal(actual.ramp, expected.ramp);
    assert(Math.abs(actual.time - live.startedAtSeconds - expected.time) < 1e-10);
  }
  assert(Math.abs(offlineBus.changes.at(-1)!.time - 1.5) < 1e-10);
  await runtime.dispose(); assert(offline.gains.every(gain => gain.disconnected));
}));
