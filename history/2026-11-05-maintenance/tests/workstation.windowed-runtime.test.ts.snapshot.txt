import assert from 'node:assert/strict';
import test from 'node:test';
import { createBrowserSoundRuntime } from '../src/workstation/modules/sound-runtime/public.ts';
import { readPreview } from '../src/workstation/modules/sound-runtime/plan.ts';
import { MAX_SEQUENCE_EVENTS } from '../src/workstation/contracts/playback-limits.ts';
import { audio, close, FakeAudioContext, fixture, longSample, phrase, plan } from '../src/workstation/modules/sound-runtime/testing.ts';
import type { SoundSequencePlan } from '../src/workstation/contracts/sound.ts';

class Timers {
  now = 0;
  #id = 0;
  readonly pending = new Map<number, { at: number; callback: () => void }>();
  readonly #set = globalThis.setTimeout;
  readonly #clear = globalThis.clearTimeout;
  constructor() {
    globalThis.setTimeout = ((callback: () => void, milliseconds = 0) => {
      const id = ++this.#id; this.pending.set(id, { at: this.now + milliseconds, callback }); return id;
    }) as unknown as typeof setTimeout;
    globalThis.clearTimeout = ((id: number) => this.pending.delete(id)) as unknown as typeof clearTimeout;
  }
  tick(milliseconds: number, clock: (wall: number) => void): void {
    const until = this.now + milliseconds;
    for (;;) {
      const next = [...this.pending].filter(([, item]) => item.at <= until).sort((a, b) => a[1].at - b[1].at)[0];
      if (!next) break;
      this.now = next[1].at; this.pending.delete(next[0]); clock(this.now); next[1].callback();
    }
    this.now = until; clock(this.now);
  }
  restore(): void { globalThis.setTimeout = this.#set; globalThis.clearTimeout = this.#clear; }
}

function sequence(count: number, spacing = .02): SoundSequencePlan {
  return phrase(Array.from({ length: count }, (_, index) => ({ atSeconds: index * spacing,
    sound: { ...plan(), note: { ...plan().note, frequencyHz: 200 + index % 5000 } } })), count * spacing + .5);
}

for (const count of [5267, 12000]) test(`${count} notes play through every beginning, middle and ending event with bounded live nodes`, async () => fixture(async () => {
  const timers = new Timers(); const runtime = createBrowserSoundRuntime();
  try {
    const input = sequence(count, .005); const session = await runtime.preview(input); const context = audio();
    assert(context.oscillators.length < 100, 'start must not allocate the whole song');
    let maximum = 0;
    const totalTicks = Math.ceil(input.durationSeconds / .025);
    for (let index = 0; index < totalTicks; index++) {
      timers.tick(25, wall => { context.currentTime = session.startedAtSeconds + wall / 1000; });
      if (index % 20 === 0) maximum = Math.max(maximum, context.oscillators.filter(node => !node.disconnected).length);
    }
    assert.equal(context.oscillators.length, count);
    assert(maximum < 110, `live sources grew to ${maximum}`);
    for (let index = 0; index < count; index++) close(context.oscillators[index]!.startTime! - session.startedAtSeconds, index * .005);
    assert.equal(timers.pending.size, 0, 'trailing silence needs no replenishment timer');
    context.clocks[0]!.end();
    assert(context.oscillators.every(node => node.disconnected));
    assert(context.gains.every(node => node.disconnected));
    close(runtime.position(session.id), session.durationSeconds!);
  } finally { await runtime.dispose(); assert.equal(timers.pending.size, 0); timers.restore(); }
}));

test('the shared 50,000-note boundary accepts a sparse whole song and rejects excess, polyphony and extreme bursts', () => {
  const small = { ...plan(), envelope: { attackSeconds: 0, releaseSeconds: 0 }, note: { ...plan().note, holdSeconds: .0001 } };
  const accepted = phrase(Array.from({ length: MAX_SEQUENCE_EVENTS }, (_, index) => ({ atSeconds: index * .005, sound: small })), 251);
  assert.equal(readPreview(accepted).events.length, MAX_SEQUENCE_EVENTS);
  assert.throws(() => readPreview({ ...accepted, events: [...accepted.events, accepted.events[0]!] }), /50000/);
  assert.throws(() => readPreview(phrase(Array.from({ length: 257 }, () => ({ atSeconds: 0, sound: small })))), /同时运行 256/);
  assert.throws(() => readPreview(phrase(Array.from({ length: 4097 }, (_, index) => ({ atSeconds: index * .00005, sound: small })))), /过于密集/);
  assert.throws(() => readPreview({ ...accepted, events: [{ atSeconds: Number.NaN, sound: small }] }), /有限数值/);
});

test('long sampled notes resume and survive a delayed background timer at the original sample age', async () => fixture(async () => {
  const timers = new Timers(); const runtime = createBrowserSoundRuntime();
  try {
    const input = sequence(600, .01); const sample = longSample();
    const session = await runtime.preview({ ...input, events: [{ atSeconds: 0, sound: sample }, ...input.events] });
    const context = audio(); context.currentTime = session.startedAtSeconds + 1.2;
    runtime.pause!(session.id); assert.equal(timers.pending.size, 0);
    const continued = await runtime.resume!(session.id);
    const source = context.sampleSources.at(-1)!;
    close(source.offset, sample.startSeconds + 1.2 * sample.playbackRate);
    assert(source.startTime! > context.currentTime, 'the resumed start is chosen after first-window allocation');
    close(source.stopTime! - source.startTime!, 1.801);
    // Advancing the device clock without timer callbacks represents a delayed tab.
    context.currentTime = continued.startedAtSeconds + 2.4;
    timers.tick(25, () => {});
    const future = context.oscillators.at(-1)!;
    assert(future.startTime! >= context.currentTime, 'surviving notes rejoin now; future notes are never scheduled in the past');
    runtime.stop(session.id); assert.equal(timers.pending.size, 0);
    assert(context.sampleSources.every(node => node.disconnected));
  } finally { await runtime.dispose(); timers.restore(); }
}));

test('slow first-window allocation happens before the live start and replacement cutover are chosen', async () => fixture(async () => {
  const timers = new Timers(); const runtime = createBrowserSoundRuntime();
  try {
    await runtime.preview(plan()); const context = audio(); context.allocationDelaySeconds = .003;
    const input = sequence(600, .01); const before = context.currentTime;
    const session = await runtime.preview(input);
    assert(context.currentTime > before + .1, 'fixture genuinely spends device time constructing the batch');
    assert(session.startedAtSeconds > context.currentTime);
    close(context.oscillators[1]!.startTime, session.startedAtSeconds);
    context.currentTime = session.startedAtSeconds + 1;
    const offset = context.oscillators.length;
    runtime.update!(session.id, { ...input, events: input.events.map(event => ({ ...event, pan: -.3 })) });
    const newSources = context.oscillators.slice(offset);
    assert(newSources.length > 20);
    assert(newSources.every(source => source.started ? source.startTime! >= context.currentTime : source.disconnected), 'replacement sources cannot be sent into the past after slow allocation');
    runtime.stopAll(); assert.equal(timers.pending.size, 0);
  } finally { await runtime.dispose(); timers.restore(); }
}));

test('a middle-song seek and later speed edit retain long-note age and continue future triggers', async () => fixture(async () => {
  const timers = new Timers(); const runtime = createBrowserSoundRuntime();
  try {
    const input = sequence(5267, .01);
    const long = { ...plan(), note: { ...plan().note, frequencyHz: 123, holdSeconds: 4 } };
    const sought: SoundSequencePlan = { ...input, transport: { positionSeconds: 20, rate: .75 }, events: [{ atSeconds: 18, sound: long }, ...input.events] };
    const session = await runtime.preview(sought); const context = audio();
    const sustained = context.oscillators[0]!;
    close(sustained.frequency.changes[0]!.value, 123);
    close(sustained.startTime, session.startedAtSeconds);
    close(sustained.stopTime! - session.startedAtSeconds, 4.021 - 2 / .75);
    const originalEnd = sustained.stopTime;
    assert(context.oscillators.slice(1).every(node => node.frequency.changes[0]!.value >= 200));
    timers.tick(500, wall => { context.currentTime = session.startedAtSeconds + wall / 1000; });
    const offset = context.oscillators.length;
    runtime.update!(session.id, { ...sought, transport: { positionSeconds: 20.375, rate: 1.25 } });
    const rejoined = context.oscillators.slice(offset).find(node => node.frequency.changes[0]!.value === 123)!;
    assert(rejoined);
    close(rejoined.stopTime, originalEnd!);
    timers.tick(500, wall => { context.currentTime = session.startedAtSeconds + wall / 1000; });
    assert(context.oscillators.length > offset + 30);
    runtime.stopAll(); assert.equal(timers.pending.size, 0);
  } finally { await runtime.dispose(); timers.restore(); }
}));

test('live edits, silence, auditions and pause preserve the rolling clock and release every timer', async () => fixture(async () => {
  const timers = new Timers(); const runtime = createBrowserSoundRuntime();
  try {
    const input = sequence(5267, .01); const session = await runtime.preview(input); const context = audio();
    timers.tick(1000, wall => { context.currentTime = session.startedAtSeconds + wall / 1000; });
    const before = runtime.position(session.id)!;
    const changes = { ...input, transport: { positionSeconds: before, rate: .75 }, events: input.events.map(event => ({ ...event, pan: .4 })) };
    runtime.update!(session.id, changes); close(runtime.position(session.id), before);
    const replacementStart = context.oscillators.length;
    await runtime.audition!(plan());
    const mix = context.gains.at(-1)!;
    assert.equal(mix.gain.changes.at(-1)!.value, .5);
    timers.tick(500, wall => { context.currentTime = session.startedAtSeconds + wall / 1000; });
    assert(context.oscillators.length > replacementStart, 'the replacement keeps replenishing future notes');
    const newPanner = context.panners.at(-1)!;
    const outlet = newPanner.connections[0]!;
    assert(outlet.connections.includes(mix), 'newly scheduled notes still pass through the ducked main mix');
    runtime.cancelAudition!(); assert.equal(mix.gain.changes.at(-1)!.value, 1);
    runtime.update!(session.id, { ...changes, events: [] });
    assert.equal(timers.pending.size, 0, 'transitioning to silence cancels the old rolling timer');
    context.clocks.forEach(clock => { if (clock.stopTime !== undefined && clock.stopTime < context.currentTime + .1) clock.end(); });
    runtime.pause!(session.id); assert.equal(timers.pending.size, 0);
    await runtime.resume!(session.id, { ...changes, events: [] }); assert.equal(timers.pending.size, 0);
    runtime.update!(session.id, changes); assert.equal(timers.pending.size, 1);
    runtime.stopAll(); assert.equal(timers.pending.size, 0);
    assert(context.oscillators.every(node => node.disconnected));
  } finally { await runtime.dispose(); timers.restore(); }
}));

test('a later rolling allocation failure ends once and clears partial and previous resources', async () => fixture(async () => {
  const timers = new Timers(); const runtime = createBrowserSoundRuntime();
  try {
    const failures: string[] = []; runtime.subscribe(event => { if (event.type === 'session' && event.session.status === 'failed') failures.push(event.session.id); });
    const session = await runtime.preview(sequence(5267)); const context = audio();
    context.failAfterOscillators = context.oscillators.length + 2;
    timers.tick(100, wall => { context.currentTime = session.startedAtSeconds + wall / 1000; });
    assert.deepEqual(failures, [session.id]); assert.equal(timers.pending.size, 0);
    assert(context.oscillators.every(node => node.disconnected)); assert(context.gains.every(node => node.disconnected));
  } finally { await runtime.dispose(); timers.restore(); }
}));

class Offline extends FakeAudioContext {
  static rendered: Offline[] = [];
  readonly frames: number;
  readonly channels: number;
  maximumLive = 0;
  suspensions = 0;
  #suspension: { at: number; resolve: () => void } | undefined;
  #resolve: ((value: AudioBuffer) => void) | undefined;
  #driving = false;
  constructor(channels: number, frames: number, _rate: number) {
    super(); this.channels = channels; this.frames = frames; this.currentTime = 0; Offline.rendered.push(this);
  }
  override suspend(at = 0): Promise<void> {
    return new Promise(resolve => { this.#suspension = { at, resolve }; });
  }
  override resume(): Promise<void> { queueMicrotask(() => this.#drive()); return Promise.resolve(); }
  startRendering(): Promise<AudioBuffer> {
    return new Promise(resolve => { this.#resolve = resolve; this.#driving = true; queueMicrotask(() => this.#drive()); });
  }
  #drive(): void {
    if (!this.#driving) return;
    this.maximumLive = Math.max(this.maximumLive, this.oscillators.filter(node => !node.disconnected).length);
    const suspension = this.#suspension; this.#suspension = undefined;
    if (suspension) { this.currentTime = suspension.at; this.suspensions++; suspension.resolve(); return; }
    this.#driving = false; this.currentTime = this.frames / this.sampleRate;
    const data = Array.from({ length: this.channels }, () => new Float32Array(this.frames));
    this.#resolve?.({ length: this.frames, sampleRate: this.sampleRate, getChannelData: (channel: number) => data[channel]! } as AudioBuffer);
  }
}

async function offlineFixture(run: () => Promise<void>): Promise<void> {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'OfflineAudioContext'); Offline.rendered = [];
  Object.defineProperty(globalThis, 'OfflineAudioContext', { configurable: true, value: Offline });
  try { await run(); }
  finally { if (descriptor) Object.defineProperty(globalThis, 'OfflineAudioContext', descriptor); else Reflect.deleteProperty(globalThis, 'OfflineAudioContext'); }
}

function offlineSequence(): SoundSequencePlan {
  const short = { ...plan(), envelope: { attackSeconds: 0, releaseSeconds: 0 }, note: { ...plan().note, holdSeconds: .0001 } };
  return phrase([{ atSeconds: 0, sound: { ...plan(), note: { ...plan().note, holdSeconds: 2.8 } } },
    ...Array.from({ length: 5267 }, (_, index) => ({ atSeconds: .02 + index * .0005, sound: short }))], 3);
}

test('offline suspensions schedule all 5267 notes in bounded batches without restarting sustained notes', async () => offlineFixture(async () => {
  const runtime = createBrowserSoundRuntime();
  try {
    const input = offlineSequence(); const result = await runtime.render(input); const context = Offline.rendered[0]!;
    assert.equal(result.durationSeconds, 3); assert(context.suspensions > 8);
    assert.equal(context.oscillators.length, input.events.length); assert(context.maximumLive < 725);
    const sorted = [...input.events].sort((a, b) => a.atSeconds - b.atSeconds);
    for (let index = 0; index < sorted.length; index++) close(context.oscillators[index]!.startTime, sorted[index]!.atSeconds);
    assert.equal(context.oscillators.filter(node => node.startTime === 0).length, 1, 'the long note keeps its original oscillator across suspension boundaries');
    close(context.oscillators[0]!.stopTime, 2.821);
    assert(context.oscillators.every(node => node.disconnected));
  } finally { await runtime.dispose(); }
}));

test('cancelling a suspended long export releases its batch and prevents later allocations', async () => offlineFixture(async () => {
  const runtime = createBrowserSoundRuntime(); const controller = new AbortController();
  try {
    await assert.rejects(runtime.render(offlineSequence(), { signal: controller.signal, onProgress(value) { if (value > .1) controller.abort(); } }), error => error instanceof DOMException && error.name === 'AbortError');
    const context = Offline.rendered[0]!; const count = context.oscillators.length;
    await Promise.resolve(); await Promise.resolve();
    assert.equal(context.oscillators.length, count); assert(count < 5267);
    assert(context.oscillators.every(node => node.disconnected)); assert(context.gains.every(node => node.disconnected));
  } finally { await runtime.dispose(); }
}));
