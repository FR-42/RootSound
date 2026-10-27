"use strict";

// Runs the production transport against a deterministic clock, with no browser
// or audio device. The fakes validate transport scheduling, not actual DSP.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const Module = require("node:module");
const transportFilename = require.resolve("./workbench.js");
// The workspace declares type=module, while this browser script deliberately
// exposes a CommonJS testing hook. Compile its exact on-disk source in a CJS
// wrapper; no transport implementation is copied or replaced by the test.
const transportModule = new Module(transportFilename, module);
transportModule.filename = transportFilename;
transportModule._compile(fs.readFileSync(transportFilename, "utf8"), transportFilename);
const { ListeningTransport } = transportModule.exports;

const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-9,
  `${actual} differs from ${expected}`);
const deferred = () => {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
};
const flush = () => new Promise(resolve => setImmediate(resolve));

class FakeSource {
  constructor(context) {
    this.context = context;
    this.playbackRate = { value: 1 };
    this.onended = null;
    this.stopped = false;
    this.disconnections = 0;
  }
  connect(destination) { assert.equal(destination, this.context.destination); }
  disconnect() { this.disconnections++; }
  start(when, offset, duration) {
    assert.ok(Number.isFinite(offset) && offset >= 0);
    assert.ok(Number.isFinite(duration) && duration > 0);
    assert.ok(offset + duration <= this.buffer.duration + 1e-6,
      "scheduled segment must fit the rendered audio buffer");
    this.schedule = { when, offset, duration, clock: this.context.currentTime };
  }
  stop() { this.stopped = true; }
  finish() {
    this.context.currentTime = this.schedule.clock + this.schedule.duration;
    if (this.onended) this.onended();
  }
}

class FakeContext {
  constructor() {
    this.currentTime = 100;
    this.destination = {};
    this.sources = [];
    this.resumeCalls = 0;
    this.resumeGate = null;
  }
  createBufferSource() {
    const source = new FakeSource(this);
    this.sources.push(source);
    return source;
  }
  async resume() {
    this.resumeCalls++;
    if (this.resumeGate) await this.resumeGate.promise;
  }
  advance(seconds) { this.currentTime += seconds; }
}

function fixture(customLoad) {
  const context = new FakeContext();
  const tracks = {
    original: { duration: 8 }, selected: { duration: 8 },
    a: { duration: 1.08, candidate: true },
    b: { duration: 1.08, candidate: true }
  };
  const loads = [];
  const load = async (track, speed) => {
    loads.push({ track, speed });
    if (customLoad) return customLoad(track, speed);
    return { id: `${track}:${speed}`, duration: tracks[track].duration / speed };
  };
  let changes = 0;
  const transport = new ListeningTransport(context, load, tracks, 1.08,
    () => { changes++; });
  return { context, tracks, loads, transport, changes: () => changes };
}

test("slow audio uses original-song seconds, pre-rendered offsets and playbackRate one", async () => {
  const { transport: t, context: c } = fixture();
  await t.seek(.3);
  await t.play();
  const source = c.sources[0];
  near(source.playbackRate.value, 1);
  near(source.schedule.offset, .3 / .6);
  near(source.schedule.duration, (1.08 - .3) / .6);
  c.advance(.5);
  near(t.position(), .6);
  c.advance(100);
  near(t.position(), 1.08); // onended can arrive late, cursor cannot escape range
});

test("changing speed while playing preserves the source-song position", async () => {
  const { transport: t, context: c } = fixture();
  await t.play();
  c.advance(.4);
  await t.configure({ speed: 1 });
  near(t.position(), .24);
  assert.equal(c.sources[0].stopped, true);
  assert.equal(c.sources[0].disconnections, 1);
  assert.equal(c.sources[1].buffer.id, "selected:1");
  near(c.sources[1].schedule.offset, .24);
  c.advance(.2);
  near(t.position(), .44);
});

test("switching original and accepted source preserves time and full-song range", async () => {
  const { transport: t, context: c } = fixture();
  await t.configure({ focus: false });
  await t.play();
  c.advance(.8);
  await t.configure({ track: "original" });
  near(t.position(), .48);
  near(t.end, 8);
  assert.equal(t.focus, false);
  assert.equal(c.sources[1].buffer.id, "original:0.6");
  near(c.sources[1].schedule.offset, .48 / .6);
});

test("candidate switch shrinks the range and restarts only if current time falls outside it", async () => {
  const { transport: t, context: c } = fixture();
  await t.configure({ focus: false });
  await t.seek(2);
  await t.play();
  await t.configure({ track: "a" });
  assert.equal(t.focus, true);
  near(t.end, 1.08);
  near(t.position(), 0);
  near(c.sources.at(-1).schedule.duration, 1.08 / .6);
  await t.configure({ focus: false });
  assert.equal(t.focus, true);
  near(t.end, 1.08);
});

test("candidate switch within the short range preserves the original-song position", async () => {
  const { transport: t, context: c } = fixture();
  await t.play();
  c.advance(1);
  await t.configure({ track: "b" });
  near(t.position(), .6);
  assert.equal(c.sources.at(-1).buffer.id, "b:0.6");
  near(c.sources.at(-1).schedule.offset, 1);
});

test("natural end loops only the active region, at the selected speed and track", async () => {
  const { transport: t, context: c } = fixture();
  await t.configure({ track: "b", speed: 1 });
  await t.play();
  const first = c.sources[0];
  first.finish();
  await flush();
  assert.equal(first.disconnections, 1);
  assert.equal(c.sources.length, 2);
  assert.equal(t.playing, true);
  near(t.position(), 0);
  near(c.sources[1].schedule.offset, 0);
  near(c.sources[1].schedule.duration, 1.08);
  assert.equal(c.sources[1].buffer.id, "b:1");
});

test("natural end without loop holds the endpoint and play restarts from zero", async () => {
  const { transport: t, context: c } = fixture();
  t.loop = false;
  await t.play();
  c.sources[0].finish();
  await flush();
  assert.equal(t.playing, false);
  near(t.position(), 1.08);
  assert.equal(c.sources.length, 1);
  await t.play();
  near(c.sources[1].schedule.offset, 0);
});

test("pause freezes the original-song position; paused seek does not start playback", async () => {
  const { transport: t, context: c } = fixture();
  await t.play();
  c.advance(.7);
  t.halt();
  near(t.position(), .42);
  c.advance(10);
  near(t.position(), .42);
  await t.seek(.8);
  near(t.position(), .8);
  assert.equal(t.playing, false);
  assert.equal(c.sources.length, 1);
  await t.seek(-5);
  near(t.position(), 0);
  await t.seek(20);
  near(t.position(), 1.08);
});

test("seek while playing replaces the old source and schedules the requested song position", async () => {
  const { transport: t, context: c } = fixture();
  await t.play();
  c.advance(.4);
  await t.seek(.7);
  assert.equal(c.sources[0].stopped, true);
  assert.equal(t.playing, true);
  near(t.position(), .7);
  near(c.sources[1].schedule.offset, .7 / .6);
});

test("late decode after pause cannot create or restart a source", async () => {
  const gate = deferred();
  const { transport: t, context: c } = fixture(() => gate.promise);
  const playing = t.play();
  assert.equal(t.pending, true);
  t.halt();
  gate.resolve({ duration: 8 / .6 });
  await playing;
  assert.equal(t.pending, false);
  assert.equal(t.playing, false);
  assert.equal(c.sources.length, 0);
});

test("late context resume after pause cannot create or restart a source", async () => {
  const { transport: t, context: c } = fixture();
  const gate = deferred();
  c.resumeGate = gate;
  const playing = t.play();
  await flush();
  assert.equal(c.resumeCalls, 1);
  t.halt();
  gate.resolve();
  await playing;
  assert.equal(c.sources.length, 0);
  assert.equal(t.playing, false);
});

test("a stale decode cannot replace a newer selected track or speed", async () => {
  const old = deferred(), recent = deferred();
  const { transport: t, context: c } = fixture((track, speed) =>
    speed === .6 ? old.promise : recent.promise);
  const first = t.play();
  const second = t.configure({ track: "b", speed: 1 });
  recent.resolve({ id: "b:1", duration: 1.08 });
  await second;
  assert.equal(c.sources.length, 1);
  assert.equal(c.sources[0].buffer.id, "b:1");
  old.resolve({ id: "selected:0.6", duration: 8 / .6 });
  await first;
  assert.equal(c.sources.length, 1);
  assert.equal(t.playing, true);
  assert.equal(t.track, "b");
  assert.equal(t.speed, 1);
});

test("an already queued old onended callback cannot loop after pause or switch", async () => {
  const { transport: t, context: c } = fixture();
  await t.play();
  const ended = c.sources[0].onended;
  t.halt();
  ended();
  await flush();
  assert.equal(c.sources.length, 1);
  assert.equal(t.playing, false);
  await t.play();
  const secondEnded = c.sources[1].onended;
  await t.configure({ track: "a" });
  secondEnded();
  await flush();
  assert.equal(c.sources.length, 3);
  assert.equal(t.track, "a");
  assert.equal(t.playing, true);
});

test("a load failure clears pending state and reports the current error", async () => {
  const failure = new Error("fake decoder failure");
  const { transport: t, context: c } = fixture(() => Promise.reject(failure));
  const errors = [];
  t.onError = error => errors.push(error);
  await assert.rejects(t.play(), /fake decoder failure/);
  assert.equal(t.pending, false);
  assert.equal(t.playing, false);
  assert.equal(c.sources.length, 0);
  assert.deepEqual(errors, [failure]);
});
