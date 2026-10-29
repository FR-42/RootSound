import test from 'node:test';
import assert from 'node:assert/strict';
import { createDefaultPatch, normalizePatch, createPresets, validateCurve, curveValue, envelopeValue,
  effectivePolyphony, VOICE_UNIT_BUDGET } from '../web/model.mjs';
import { fft, preparePatch, createSpectrumImpulse, SpectralSynth, renderPatch, encodeWav24, DSP_LIMITS } from '../web/dsp.mjs';
import { handleWorkerRequest } from '../web/render-worker.mjs';
import { SpectralSynthProcessor } from '../web/synth-worklet.mjs';
import { normalizeCurvePoints } from '../web/curve-editor.mjs';

const RATE = 48000;
const point = (x, y, curve = 0) => ({ x, y, curve });
const clone = value => structuredClone(value);
function plain(waveform = 'sine') {
  const p = createDefaultPatch(); p.oscillators[0].waveform = waveform; p.oscillators[0].level = .5;
  p.master.level = .5; p.master.velocitySensitivity = 0;
  p.spectrum.points = [point(20, 0), point(20000, 0)];
  p.amplitude = { points: [point(0, 0), point(.001, 1), point(.08, 1), point(.12, 0)], sustainIndex: 2 };
  return p;
}
function audio(synth, frames) {
  const left = new Float32Array(frames), right = new Float32Array(frames);
  for (let start = 0; start < frames; start += 128) synth.process(left.subarray(start, start + 128), right.subarray(start, start + 128));
  return { left, right };
}
function power(samples, low = 0, high = RATE / 2) {
  const n = 8192, re = new Float64Array(n), im = new Float64Array(n);
  const start = Math.max(0, samples.length - n);
  for (let i = 0; i < n && start + i < samples.length; i++) re[i] = samples[start + i] * (.5 - .5 * Math.cos(2 * Math.PI * i / (n - 1)));
  fft(re, im); let sum = 0;
  for (let b = Math.ceil(low * n / RATE); b <= Math.min(n / 2, Math.floor(high * n / RATE)); b++) sum += re[b] ** 2 + im[b] ** 2;
  return sum;
}
function frequency(samples, start = 0, end = samples.length) {
  let first = -1, last = -1, count = 0;
  for (let i = Math.max(1, start); i < end; i++) if (samples[i - 1] <= 0 && samples[i] > 0) {
    const at = i - 1 - samples[i - 1] / (samples[i] - samples[i - 1]); if (first < 0) first = at; last = at; count++;
  }
  return (count - 1) * RATE / (last - first);
}
function signal(p, midi = 69, seconds = .5) {
  const synth = new SpectralSynth(RATE, p); synth.noteOn({ id: 'test', midi, velocity: 1 });
  return audio(synth, Math.round(seconds * RATE)).left;
}

test('versioned model validates bounds and ten-point curves without mutating the input', () => {
  const p = createDefaultPatch(), before = clone(p); assert.deepEqual(normalizePatch(p), p); assert.deepEqual(p, before);
  p.spectrum.points = Array.from({ length: 10 }, (_, i) => point(20 * 1000 ** (i / 9), Math.sin(i) * 12));
  assert.equal(normalizePatch(p).spectrum.points.length, 10); assert.equal(DSP_LIMITS.curvePoints, 10);
  p.spectrum.points.push(point(20000, 0)); assert.throws(() => normalizePatch(p), /10/);
  for (const mutate of [q => q.version = 2, q => q.master.level = 1.1, q => q.oscillators[0].unison = 6,
    q => q.effects.delayFeedback = .9, q => q.pitch.points[1].y = NaN, q => q.amplitude.points.at(-1).y = .5]) {
    const q = createDefaultPatch(); mutate(q); assert.throws(() => normalizePatch(q));
  }
});

test('curve domain spacing matches the editor and rejects externally supplied near-coincident points', () => {
  const p = plain(), original = clone(p);
  p.spectrum.points = [point(20, 0), point(20.00000000001, -20), point(20000, 0)];
  assert.throws(() => normalizePatch(p), /过于接近/); assert.equal(original.spectrum.points.length, 2);
  p.spectrum.points = original.spectrum.points;
  p.pitch.points = [point(0, 0), point(1e-12, 1), point(1, 0)];
  assert.throws(() => normalizePatch(p), /过于接近/);
  assert.throws(() => validateCurve([point(0, 0), point(0, 1)]), /递增/);
  for (const logX of [true, false]) for (const gap of [.999999e-8, 1e-8, 1.000001e-8]) {
    const range = { xMin: logX ? 20 : 0, xMax: logX ? 20000 : 1, yMin: 0, yMax: 1, logX };
    const xs = [0, gap, 1].map(t => logX ? 20 * 1000 ** t : t);
    const points = xs.map(x => point(x, 0));
    let modelAccepted = true, uiAccepted = true;
    try { validateCurve(points, { minX: range.xMin, maxX: range.xMax, logarithmic: logX }); } catch { modelAccepted = false; }
    try { normalizeCurvePoints(points, range); } catch { uiAccepted = false; }
    assert.equal(modelAccepted, uiAccepted);
  }
});

test('linear, logarithmic and signed curvature have the exact same interpolation as the drawn curve', () => {
  assert.equal(curveValue([point(20, -12), point(2000, 12)], 200, true), 0);
  assert.equal(curveValue([point(0, 0, .5), point(1, 1)], .5), .5 ** 5);
  assert.equal(curveValue([point(0, 0, -.5), point(1, 1)], .5), 1 - .5 ** 5);
  assert.equal(curveValue([point(0, 2), point(1, 4)], -3), 2);
});

test('multi-point sustain and early release remain continuous and reach their endpoint', () => {
  const env = { points: [point(0, 0), point(.2, 1), point(.4, .7), point(.8, .2), point(1, 0)], sustainIndex: 2 };
  assert.equal(envelopeValue(env, 20), .7);
  const value = envelopeValue(env, .1); assert.equal(value, .5);
  assert.equal(envelopeValue(env, .1, .1, value), value);
  assert.equal(envelopeValue(env, .7, .1, value), 0);
  assert.ok(envelopeValue(env, .4, .1, value) > 0);
});

test('eight actual sound designs are independently editable and all validate', () => {
  const presets = createPresets(); assert.equal(presets.length, 8);
  assert.equal(new Set(presets.map(v => v.id)).size, 8);
  for (const { patch } of presets) normalizePatch(patch);
  const before = presets[1].patch.oscillators[0].level; presets[0].patch.oscillators[0].level = 0;
  assert.equal(presets[1].patch.oscillators[0].level, before);
  assert.ok(presets.some(v => v.patch.oscillators[0].waveform === 'noise'));
  assert.ok(presets.some(v => v.patch.oscillators[0].fmAmount > 1));
});

test('radix-two FFT round trips with normalization', () => {
  const re = Float64Array.from({ length: 1024 }, (_, i) => Math.sin(i * .163) + .3 * Math.cos(i * .017)), im = new Float64Array(1024);
  const original = re.slice(); fft(re, im); fft(re, im, true);
  assert.ok(re.every((v, i) => Math.abs(v - original[i]) < 1e-10));
  assert.throws(() => fft(new Float64Array(3), new Float64Array(3)));
});

test('minimum-phase FIR honors absolute frequency gain including dense multi-point curves', () => {
  const spectrum = { mix: 1, points: [point(20, -18), point(150, -18), point(700, 6), point(2000, -24), point(6000, 0), point(20000, -36)] };
  const impulse = createSpectrumImpulse(spectrum, RATE), re = Float64Array.from(impulse), im = new Float64Array(impulse.length); fft(re, im);
  for (const hz of [70, 300, 700, 2000, 6000, 14000]) {
    const bin = Math.round(hz * re.length / RATE), actual = 20 * Math.log10(Math.hypot(re[bin], im[bin]));
    const expected = curveValue(spectrum.points, bin * RATE / re.length, true);
    assert.ok(Math.abs(actual - expected) < .12, `${hz}Hz: ${actual} vs ${expected}`);
  }
  const flat = createSpectrumImpulse({ mix: 0, points: spectrum.points }, RATE);
  assert.ok(Math.abs(flat[0] - 1) < 1e-6); assert.ok(flat.subarray(1).every(v => Math.abs(v) < 1e-8));
});

test('partitioned convolution has exactly 128 frames of algorithmic latency and preserves the full FIR tail', () => {
  const p = plain(); p.spectrum.points = [point(20, -24), point(300, 0), point(1200, -20), point(20000, -30)];
  const prepared = preparePatch(p), synth = new SpectralSynth(RATE, p, prepared);
  const output = new Float64Array(DSP_LIMITS.spectrumImpulseSamples + 128);
  for (let i = 0; i < output.length; i++) { synth.eq.sample(i === 0 ? 1 : 0, 0); output[i] = synth.eq.left; }
  assert.ok(output.subarray(0, 128).every(v => v === 0));
  for (let i = 0; i < prepared.eq.impulse.length; i++) assert.ok(Math.abs(output[i + 128] - prepared.eq.impulse[i]) < 2e-7);
});

test('oscillator pitch is correct; pitch envelope changes fundamental rather than just the background', () => {
  const samples = signal(plain()); assert.ok(Math.abs(frequency(samples, 5000, 22000) - 440) < .05);
  const p = plain(); p.pitch = { points: [point(0, 0), point(.1, 0), point(.15, 12), point(.3, 12), point(.4, 0)], sustainIndex: 3 };
  const pitched = signal(p);
  assert.ok(Math.abs(frequency(pitched, 1000, 4500) - 440) < .1);
  assert.ok(Math.abs(frequency(pitched, 10000, 20000) - 880) < .1);
});

test('bandlimited high saw avoids the strong folded partials of a naive discontinuous saw', () => {
  const midi = 69 + 12 * Math.log2(7500 / 440), samples = signal(plain('saw'), midi);
  const naive = Float32Array.from({ length: samples.length }, (_, i) => 2 * ((i * 7500 / RATE) % 1) - 1);
  const ratio = power(samples, 1000, 6500) / power(samples, 7300, 7700);
  const naiveRatio = power(naive, 1000, 6500) / power(naive, 7300, 7700);
  assert.ok(ratio < naiveRatio * .01, `${ratio} vs naive ${naiveRatio}`);
});

test('static spectrum acts after noise and PM so newly generated high frequencies also obey it', () => {
  for (const waveform of ['noise', 'sine']) {
    const flat = plain(waveform); flat.oscillators[0].fmRatio = 5; flat.oscillators[0].fmAmount = waveform === 'sine' ? 3 : 0;
    const shaped = clone(flat); shaped.spectrum.points = [point(20, 0), point(1500, 0), point(2500, -48), point(20000, -48)];
    const baseline = signal(flat), processed = signal(shaped);
    const attenuation = 10 * Math.log10(power(processed, 3500, 12000) / power(baseline, 3500, 12000));
    assert.ok(attenuation < -40, `${waveform} high-band attenuation=${attenuation}dB`);
    assert.ok(power(processed, 100, 1200) > 0);
  }
});

test('pitch motion still passes through an absolute spectral notch', () => {
  const p = plain(); p.pitch = { points: [point(0, 12), point(.2, 12), point(.3, 0)], sustainIndex: 1 };
  const flat = signal(p); p.spectrum.points = [point(20, 0), point(650, 0), point(800, -48), point(1000, -48), point(1200, 0), point(20000, 0)];
  const shaped = signal(p); const attenuation = 10 * Math.log10(power(shaped, 850, 910) / power(flat, 850, 910));
  assert.ok(attenuation < -40, `${attenuation}dB`);
});

test('live parameter, waveform, EQ and envelope edits preserve held voice age and phase', () => {
  const p = plain(), synth = new SpectralSynth(RATE, p); synth.noteOn({ id: 'held', midi: 60 }); audio(synth, 6000);
  const voice = synth.voices[0], age = voice.age, phase = voice.oscillators[0].phases[0], amp = synth.ampAt(voice);
  const changed = clone(p); changed.oscillators[0].waveform = 'pulse'; changed.oscillators[0].phase = .5;
  changed.amplitude.points[2].y = .2; changed.spectrum.points[1].y = -20;
  synth.setPatch(changed, preparePatch(changed));
  assert.equal(synth.voices[0], voice); assert.equal(voice.age, age); assert.equal(voice.oscillators[0].phases[0], phase);
  assert.ok(Math.abs(synth.ampAt(voice) - amp) < 1e-12);
  const result = audio(synth, 2000); assert.ok(result.left.every(Number.isFinite)); assert.ok(voice.age > age);
  const preserved = synth.patch; const invalid = clone(changed); invalid.master.level = NaN;
  assert.throws(() => synth.setPatch(invalid)); assert.equal(synth.patch, preserved); assert.equal(synth.voices[0], voice);
});

test('mono glide reuses the voice without restarting its amplitude attack', () => {
  const p = plain(); p.master.polyphony = 1; p.master.glideSeconds = .1;
  const synth = new SpectralSynth(RATE, p); synth.noteOn({ id: 'a', midi: 60 }); audio(synth, 6000);
  const voice = synth.voices[0], age = voice.age; synth.noteOn({ id: 'b', midi: 72 });
  assert.equal(synth.voices[0], voice); assert.equal(voice.age, age); assert.equal(synth.midiAt(voice), 60);
  audio(synth, 2400); assert.ok(Math.abs(synth.midiAt(voice) - 66) < .01);
  synth.noteOff('a'); assert.equal(voice.releasedAt, null); synth.noteOff('b'); assert.equal(voice.releasedAt, voice.age);
});

test('static voice budget and stealing tails keep worst-case allocation bounded', () => {
  const p = plain(); p.master.polyphony = 12; p.oscillators.forEach(o => { o.enabled = true; o.unison = 5; });
  assert.equal(VOICE_UNIT_BUDGET, 48); assert.equal(DSP_LIMITS.voiceUnitBudget, 48); assert.equal(effectivePolyphony(p), 2);
  const synth = new SpectralSynth(RATE, p);
  for (let i = 0; i < 30; i++) synth.noteOn({ id: String(i), midi: 48 + i });
  assert.equal(synth.voices.length, 2); assert.equal(synth.stealing.length, 0, 'unheard voices do not need release tails');
  for (let i = 0; i < 8; i++) { audio(synth, 32); synth.noteOn({ id: `playing-${i}`, midi: 60 + i }); assert.ok(synth.stealing.length <= 4); }
  const result = audio(synth, 1024); assert.ok(result.left.every(v => Number.isFinite(v) && Math.abs(v) <= 1)); assert.equal(synth.stealing.length, 0);
  synth.allNotesOff(true); audio(synth, 512); assert.equal(synth.activeVoices, 0);
  assert.ok(audio(synth, 128).left.every(v => v === 0));
});

test('prepared buffers reject mismatches and nonfinite data before replacing active sound', () => {
  const p = plain(), synth = new SpectralSynth(RATE, p), changed = clone(p); changed.oscillators[0].waveform = 'saw';
  const original = synth.patch; assert.throws(() => synth.setPatch(changed, preparePatch(p))); assert.equal(synth.patch, original);
  const bad = preparePatch(changed); bad.eq.real[0] = NaN; assert.throws(() => synth.setPatch(changed, bad)); assert.equal(synth.patch, original);
  assert.throws(() => synth.noteOn({ id: 'bad', midi: NaN }));
  assert.throws(() => synth.process(new Float32Array(4), new Float32Array(5)));
});

test('offline and live paths produce identical deterministic audio before the deliberate final file fade', () => {
  const p = plain('noise'), holdSeconds = .12, tailSeconds = .15;
  const rendered = renderPatch(p, { holdSeconds, tailSeconds, midi: 65, velocity: .8 });
  const synth = new SpectralSynth(RATE, p); synth.noteOn({ id: 'different-id', midi: 65, velocity: .8 });
  const held = audio(synth, Math.round(holdSeconds * RATE)); synth.noteOff('different-id'); const released = audio(synth, Math.round(tailSeconds * RATE));
  const expected = new Float32Array(rendered.left.length); expected.set(held.left); expected.set(released.left, held.left.length);
  for (let i = 0; i < expected.length - RATE * .12; i++) assert.equal(rendered.left[i], expected[i]);
  assert.ok(Math.abs(rendered.left.at(-1)) === 0); assert.ok(Math.abs(rendered.right.at(-1)) === 0);
  assert.ok(rendered.latencySeconds > 128 / RATE); assert.equal(rendered.spectrumResolutionHz, RATE / 8192);
});

test('offline release and full FIR tail are retained, and PCM24 WAV contains the exact stereo frame count', () => {
  const p = plain(); const result = renderPatch(p, { holdSeconds: .04 });
  assert.ok(result.durationSeconds > .04 + .04 + 8192 / RATE); assert.equal(result.tailTruncated, false);
  assert.ok(result.left.every(v => Number.isFinite(v) && Math.abs(v) <= 1));
  const bytes = encodeWav24(result), view = new DataView(bytes.buffer), ascii = (a, b) => String.fromCharCode(...bytes.slice(a, b));
  assert.equal(ascii(0, 4), 'RIFF'); assert.equal(ascii(8, 12), 'WAVE'); assert.equal(view.getUint16(34, true), 24);
  assert.equal(view.getUint32(40, true), result.left.length * 6); assert.equal(view.getUint32(24, true), RATE);
  assert.throws(() => renderPatch(p, { holdSeconds: 59, tailSeconds: 2 }));
  assert.throws(() => renderPatch(p, { sampleRate: 192000 }));
  assert.throws(() => encodeWav24({ sampleRate: RATE, left: Float32Array.of(NaN), right: Float32Array.of(0) }));
});

test('worker preparation cache and offline render protocol operate without any audio device', () => {
  const p = plain(), messages = [], emit = (message, transfer) => messages.push({ message, transfer });
  handleWorkerRequest({ type: 'prepare', id: 1, patch: p, sampleRate: RATE }, emit);
  const bank = messages[0].message.prepared; assert.equal(messages[0].message.type, 'prepared');
  const changed = clone(p); changed.oscillators[0].level = .2;
  handleWorkerRequest({ type: 'prepare', id: 2, patch: changed, sampleRate: RATE }, emit);
  assert.equal(messages[1].message.prepared, bank);
  handleWorkerRequest({ type: 'render', id: 3, patch: p, options: { holdSeconds: .01, tailSeconds: .01 } }, emit);
  const result = messages[2]; assert.equal(result.message.type, 'rendered'); assert.equal(result.message.id, 3);
  assert.ok(result.message.bytes instanceof ArrayBuffer); assert.equal(result.transfer[0], result.message.bytes);
  handleWorkerRequest({ type: 'prepare', id: 4, patch: { format: 'wrong' } }, emit);
  assert.equal(messages.at(-1).message.type, 'error'); assert.equal(messages.at(-1).message.id, 4);
});

test('worklet starts silent, requires prepared data, renders messages, and retains a valid document on errors', () => {
  const processor = new SpectralSynthProcessor(), messages = []; processor.port.postMessage = message => messages.push(message);
  const l = new Float32Array(128).fill(1), r = new Float32Array(128).fill(1);
  processor.process([], [[l, r]]); assert.equal(processor.synth, null); assert.ok(l.every(v => v === 0));
  const send = data => processor.port.onmessage({ data }), p = plain();
  send({ type: 'patch', patch: p }); assert.equal(messages.at(-1).type, 'error'); assert.equal(processor.synth, null);
  send({ type: 'patch', patch: p, prepared: preparePatch(p) }); send({ type: 'noteOn', id: 'key', midi: 69, velocity: .8 });
  for (let i = 0; i < 6; i++) processor.process([], [[l, r]]); assert.ok(l.some(v => Math.abs(v) > 1e-4));
  const voice = processor.synth.voices[0]; const bad = clone(p); bad.master.level = -1;
  send({ type: 'patch', patch: bad, prepared: preparePatch(p) }); assert.equal(processor.synth.voices[0], voice);
  send({ type: 'allNotesOff', immediate: true }); for (let i = 0; i < 5; i++) processor.process([], [[l, r]]);
  assert.equal(processor.synth.activeVoices, 0); assert.ok(l.every(v => v === 0));
});
