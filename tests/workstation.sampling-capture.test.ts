import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { createBrowserSampleCapture, createBrowserSampleDecoder } from '../src/workstation/modules/sampling/browser.ts';
import { mountHumPitch } from '../src/workstation/modules/ui-rendering/hum-pitch.ts';
import { createHumPitchTracker, frequencyPitchClass, majorGuidePitchRole, recognizeHum } from '../src/workstation/modules/pitch-guide/public.ts';
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
  loads = 0;
  audioWorklet = { addModule: (url: string) => { this.loads++; assert(url.endsWith('capture-worklet.js')); return Context.module; } };
  constructor() { Context.instances.push(this); }
  createMediaStreamSource(_stream: unknown) { return this.input; }
  createAnalyser() { return Object.assign(new Node(), { fftSize: 1024, smoothingTimeConstant: 0,
    getByteFrequencyData(data: Uint8Array) { data.fill(180); } }); }
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

function hummedTone(hz: number, rate = 48000): Float32Array {
  return Float32Array.from({ length: rate * .65 }, (_, i) => {
    const t = i / rate;
    const phase = 2 * Math.PI * hz * t + .26 * Math.sin(2 * Math.PI * 5 * t);
    return .16 * Math.sin(phase) + .08 * Math.sin(2 * phase);
  });
}

test('steady hum identifies the pitch class across octaves and maps the first five major notes', async () => {
  for (const hz of [110, 220, 440, 466.1638, 261.6256]) {
    assert.equal(await recognizeHum(hummedTone(hz), 48000), frequencyPitchClass(hz));
  }
  const quietHum = hummedTone(220).map(sample => sample * .025);
  assert.equal(await recognizeHum(quietHum, 48000), 9);
  const strongHarmonic = Float32Array.from({ length: 32000 }, (_, i) => {
    const phase = 2 * Math.PI * 196 * i / 48000;
    return .048 * Math.sin(phase) + .18 * Math.sin(3 * phase);
  });
  assert.equal(await recognizeHum(strongHarmonic, 48000), 7);
  const quick = hummedTone(329.6276).slice(0, 8600);
  assert.equal(await recognizeHum(quick, 48000), 4);
  const gliding = hummedTone(261.6256);
  for (let i = 0; i < 8500; i++) gliding[i] = .16 * Math.sin(2 * Math.PI * (200 * i / 48000 + (61.6256 / 17000) * i ** 2 / 48000));
  assert.equal(await recognizeHum(gliding, 48000), 0);
  assert.equal(await recognizeHum(new Float32Array(48000), 48000), undefined);
  let seed = 17;
  const noise = Float32Array.from({ length: 48000 }, () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 2 ** 32 - .5;
  });
  assert.equal(await recognizeHum(noise, 48000), undefined);
  const alternating = new Float32Array(62400);
  alternating.set(hummedTone(220)); alternating.set(hummedTone(261.6256), 31200);
  assert.equal(await recognizeHum(alternating, 48000), undefined);
  const pitches = Array.from({ length: 12 }, (_, pitch) => pitch);
  assert.deepEqual(pitches.filter(pitch => majorGuidePitchRole(pitch, 0, true)), [0, 2, 4, 5, 7]);
  assert.deepEqual(pitches.filter(pitch => majorGuidePitchRole(pitch, 10, true)), [0, 2, 3, 5, 10]);
  assert.equal(majorGuidePitchRole(10, 10), 'tonic');
});

test('streaming pitch rejects noise, follows changes, and distinguishes octaves', () => {
  const pitches: number[] = [];
  const tracker = createHumPitchTracker(midi => pitches.push(midi));
  const rate = 44100;
  const push = (sound: Float32Array) => {
    for (let at = 0; at < sound.length; at += 793) tracker.push(sound.subarray(at, at + 793), rate);
  };
  let seed = 17;
  const noise = Float32Array.from({ length: rate }, () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return (seed / 2 ** 32 - .5) * .055;
  });
  noise[1200] = .9;
  push(new Float32Array(rate));
  push(noise);
  assert.deepEqual(pitches, []);
  push(hummedTone(220, rate).map((value, i) => value * .45 + noise[i]! * .55));
  assert.deepEqual(pitches, [57]);
  push(noise);
  assert.deepEqual(pitches, [57]);
  push(hummedTone(440, rate).slice(0, Math.floor(rate * .22)));
  assert.deepEqual(pitches, [57, 69]);
  push(hummedTone(493.8833, rate).slice(0, Math.floor(rate * .06)));
  push(noise);
  assert.deepEqual(pitches, [57, 69]);
  push(hummedTone(293.6648, rate).slice(0, Math.floor(rate * .22)));
  assert.deepEqual(pitches, [57, 69, 62]);
});

test('live hum keeps weak fundamentals while following scales and real octave jumps', () => {
  const rate = 48000;
  const scale = [60, 62, 64, 65, 67, 69, 71, 72];
  const scan = (notes: number[], ms: number, levels: (index: number) => [number, number], noise = 0) => {
    const pitches: number[] = [];
    const tracker = createHumPitchTracker(midi => pitches.push(midi));
    let phase = 0, seed = 17;
    for (const [index, midi] of notes.entries()) {
      const [base, harmonic] = levels(index);
      const step = 2 * Math.PI * 440 * 2 ** ((midi - 69) / 12) / rate;
      for (let at = 0; at < ms; at += 20) {
        const chunk = Float32Array.from({ length: 960 }, () => {
          phase += step;
          seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
          return base * Math.sin(phase) + harmonic * Math.sin(2 * phase) + noise * (seed / 2 ** 32 - .5);
        });
        tracker.push(chunk, rate);
      }
    }
    return pitches;
  };
  assert.deepEqual(scan([57, 57, 57], 340, i => i === 1 ? [.006, .12] : [.12, .04]), [57]);
  assert.deepEqual(scan([57, 69, 57], 220, () => [.12, .04]), [57, 69, 57]);
  assert.deepEqual(scan(scale, 100, () => [.12, .04]), scale);
  assert.deepEqual(scan([...scale].reverse().map(note => note - 5), 100, () => [.12, .04]),
    [67, 66, 64, 62, 60, 59, 57, 55]);
  assert.deepEqual(scan(scale, 220, i => i % 2 ? [.006, .12] : [.12, .04], .01), scale);
  assert.deepEqual(scan([72, 76, 79, 81, 84, 87], 200, () => [.09, 0]), [72, 76, 79, 81, 84, 87]);
});

test('live hum holds its column through weak fundamentals and semitone boundary drift', () => {
  const rate = 48000;
  const pitches: number[] = [];
  const tracker = createHumPitchTracker(midi => pitches.push(midi));
  let phase = 0;
  function hum(frequency: number, fundamental: number, secondHarmonic: number, frames = 25): void {
    const step = 2 * Math.PI * frequency / rate;
    for (let i = 0; i < frames; i++) {
      tracker.push(Float32Array.from({ length: 960 }, () => {
        phase += step;
        return fundamental * Math.sin(phase) + secondHarmonic * Math.sin(phase * 2);
      }), rate);
    }
  }

  hum(220, .10, .05);
  hum(220, .0017, .12);
  hum(220, .10, .05);
  assert.deepEqual(pitches, [57]);
  hum(220 * 2 ** (37 / 1200), .10, .05);
  hum(220 * 2 ** (65 / 1200), .10, .05);
  hum(220 * 2 ** (37 / 1200), .10, .05);
  assert.deepEqual(pitches, [57]);
  hum(220 * 2 ** (1 / 12), .10, .05, 6);
  assert.deepEqual(pitches, [57, 58]);
  hum(440 * 2 ** (1 / 12), .10, .05, 11);
  hum(220 * 2 ** (1 / 12), .10, .05, 11);
  assert.deepEqual(pitches, [57, 58, 70, 58]);
});

test('left Alt streams without a badge, keeps the final stable note, and cancels interrupted sessions', async () => environment(async (_stream, requests) => {
  const original = Object.getOwnPropertyDescriptor(globalThis, 'window');
  Object.defineProperty(globalThis, 'window', { configurable: true, value: new EventTarget() });
  const doc = new EventTarget();
  const host = { ownerDocument: doc };
  const pitches: Array<[number | undefined, boolean | undefined]> = [];
  const errors: string[] = [];
  const pitch = mountHumPitch(host as unknown as HTMLElement, {
    canStart: () => true, showPitch: (value, released) => pitches.push([value, released]), report: error => errors.push(error),
  });
  const send = (type: string, code: string, repeat = false) =>
    doc.dispatchEvent(Object.assign(new Event(type, { cancelable: true }), { code, key: code, repeat }));
  const wait = async (until: () => boolean) => {
    for (let i = 0; i < 50 && !until(); i++) await new Promise(resolve => setTimeout(resolve, 2));
    assert(until());
  };
  const begin = async (count: number) => {
    send('keydown', 'AltLeft');
    send('keydown', 'AltLeft', true);
    await wait(() => Worklet.instances.length === count);
    return Worklet.instances[count - 1]!;
  };
  try {
    send('keydown', 'AltRight'); send('keyup', 'AltRight');
    assert.equal(requests.length, 0);
    send('keydown', 'AltLeft'); send('keyup', 'AltLeft');
    assert.equal(Worklet.instances.length, 0);
    const first = await begin(1);
    assert.equal(requests.length, 2);
    assert.equal(first.options.processorOptions!.maxFrames, Infinity);
    first.port.send({ type: 'chunk', data: hummedTone(220, 8000) });
    first.port.send({ type: 'chunk', data: hummedTone(261.6256, 8000).slice(0, 1800) });
    assert.deepEqual(pitches, [[57, undefined], [60, undefined]]);
    send('keyup', 'AltLeft');
    assert(first.disconnected);
    assert.deepEqual(pitches.at(-1), [60, true]);
    pitch.dismissResult();
    assert.deepEqual(pitches.at(-1), [undefined, false]);
    const silence = await begin(2);
    silence.port.send({ type: 'chunk', data: new Float32Array(3200) });
    send('keyup', 'AltLeft');
    assert(silence.disconnected);
    assert.equal(pitches.length, 4);
    const interrupted = await begin(3);
    interrupted.port.send({ type: 'chunk', data: hummedTone(220, 8000) });
    send('keydown', 'Escape');
    assert(interrupted.disconnected);
    send('keyup', 'AltLeft');
    assert.deepEqual(pitches.slice(-2), [[57, undefined], [undefined, false]]);
    const blurred = await begin(4);
    window.dispatchEvent(new Event('blur'));
    assert(blurred.disconnected);
    assert.equal(Context.instances.length, 1);
    assert.equal(Context.instances[0]!.loads, 1);
    assert.deepEqual(errors, []);
  } finally {
    pitch.dispose();
    if (original) Object.defineProperty(globalThis, 'window', original);
    else Reflect.deleteProperty(globalThis, 'window');
  }
}));

test('hum capture prepares the audio module in parallel with permission and reuses it after stop', async t => {
  const device = deferred<Stream>(), loading = deferred<void>();
  await environment(async () => {
    const input = createBrowserSampleCapture({ reuseEngine: true });
    try {
      const start = performance.now();
      const first = input.start(() => {});
      assert.equal(Context.instances[0]?.loads, 1);
      assert.equal(Worklet.instances.length, 0);
      await new Promise(resolve => setTimeout(resolve, 35));
      loading.resolve();
      assert.equal(Worklet.instances.length, 0);
      device.resolve(new Stream());
      const recording = await first;
      const firstReady = performance.now() - start;
      Worklet.instances[0]!.port.send({ type: 'chunk', data: hummedTone(220, 8000) });
      const stop = performance.now();
      recording.stop();
      const pcm = await recording.result;
      assert.equal(await recognizeHum(pcm.channels[0]!, pcm.sampleRate), 9);
      const stopToResult = performance.now() - stop;
      const restart = performance.now();
      const next = await input.start(() => {});
      const warmReady = performance.now() - restart;
      next.cancel();
      await assert.rejects(next.result, /取消/);
      assert.equal(Context.instances.length, 1);
      assert.equal(Context.instances[0]!.loads, 1);
      t.diagnostic('simulated first setup ' + firstReady.toFixed(1) + ' ms, repeat ' + warmReady.toFixed(1) +
        ' ms, stop to pitch ' + stopToResult.toFixed(1) + ' ms');
    } finally { input.dispose(); }
  }, (() => {
    let first = true;
    return () => {
      if (first) { first = false; return device.promise; }
      return Promise.resolve(new Stream());
    };
  })(), loading.promise);
});
