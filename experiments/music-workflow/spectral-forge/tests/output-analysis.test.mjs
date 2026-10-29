import test from 'node:test';
import assert from 'node:assert/strict';
import { ANALYSIS_FFT_SIZE, spectrumTrace, estimatePitch, envelopeTime, createOutputAnalysis } from '../web/output-analysis.mjs';
import { createDefaultPatch } from '../web/model.mjs';
import { renderPatch } from '../web/dsp.mjs';

function wave(hz, rate = 48000, age = 1, level = .3) {
  return Float32Array.from({ length: ANALYSIS_FFT_SIZE }, (_, i) => {
    const time = age - (ANALYSIS_FFT_SIZE - i) / rate;
    return time < 0 ? 0 : level * Math.sin(2 * Math.PI * hz * time + .73);
  });
}
function spectrum(hz = 440, rate = 48000) {
  const bins = new Float32Array(ANALYSIS_FFT_SIZE / 2).fill(-Infinity);
  bins[Math.round(hz * ANALYSIS_FFT_SIZE / rate)] = -12; return bins;
}
function input(age = .1, extra = {}) {
  return { samples: wave(261.625565, 48000, age), frequencyDb: spectrum(261.625565), sampleRate: 48000,
    note: { id: 'one', serial: 1, midi: 60, started: 0, released: null, age }, patch: createDefaultPatch(), ...extra };
}

test('logarithmic spectrum keeps narrow peaks and uses absolute output levels', () => {
  const bins = spectrum(); bins[Math.round(7000 * ANALYSIS_FFT_SIZE / 48000)] = -31;
  const points = spectrumTrace(bins, 48000);
  assert(points.length > 100 && points.length <= 512);
  assert.equal(Math.max(...points.map(p => p.y)), -12);
  assert(points.some(p => Math.abs(p.x - 440) < 6 && p.y === -12));
  assert(points.some(p => Math.abs(p.x - 7000) < 6 && p.y === -31));
  assert(points.every((p, i) => p.x >= 20 && p.x <= 20000 && Number.isFinite(p.y) && (!i || p.x > points[i - 1].x)));
  assert.deepEqual(spectrumTrace([], 48000), []);
});

test('sine fundamentals cover low kicks and normal notes at both device rates', () => {
  for (const rate of [44100, 48000]) for (const hz of [32.703, 55, 82.407, 110, 261.625565, 440, 880, 1760]) {
    const pitch = estimatePitch(wave(hz, rate), rate);
    assert(pitch, `Missing ${hz}Hz at ${rate}`);
    assert(Math.abs(pitch.frequency / hz - 1) < .015, `${hz}Hz measured ${pitch.frequency}`);
    assert(pitch.confidence > .93);
  }
});

test('a harmonic-rich periodic signal retains its fundamental rather than the loudest partial', () => {
  const data = wave(110);
  const second = wave(220, 48000, 1, .55), third = wave(330, 48000, 1, .15);
  for (let i = 0; i < data.length; i++) data[i] += second[i] + third[i];
  const pitch = estimatePitch(data, 48000);
  assert(pitch && Math.abs(pitch.frequency - 110) < 1);
});

test('high output tones use the native rate instead of aliasing into false low pitches', () => {
  for (const hz of [2093.005, 4186.009, 8372.018, 10000]) {
    const pitch = estimatePitch(wave(hz), 48000, 8192, hz);
    assert(pitch && Math.abs(pitch.frequency / hz - 1) < .025, `${hz}Hz measured ${pitch?.frequency}`);
  }
});

test('silence DC aperiodic noise invalid data and insufficient history produce no invented pitch', () => {
  assert.equal(estimatePitch(new Float32Array(8192), 48000), undefined);
  assert.equal(estimatePitch(new Float32Array(8192).fill(.2), 48000), undefined);
  let seed = 737;
  const noise = Float32Array.from({ length: 8192 }, () => { seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5; return (seed >>> 0) / 2147483648 - 1; });
  assert.equal(estimatePitch(noise, 48000), undefined);
  const bad = wave(440); bad[bad.length - 1] = NaN;
  assert.equal(estimatePitch(bad, 48000), undefined);
  assert.equal(estimatePitch(wave(440), 48000, 100), undefined);
});

test('pitch is measured from the native final rendering including oscillator transposition', () => {
  const patch = createDefaultPatch(); patch.oscillators[0].waveform = 'sine'; patch.oscillators[0].semitones = 7;
  patch.spectrum.mix = 0;
  const rendered = renderPatch(patch, { sampleRate: 48000, midi: 60, velocity: .8, holdSeconds: .35 });
  const at = Math.round(.3 * 48000), samples = rendered.left.subarray(at - ANALYSIS_FFT_SIZE, at);
  const pitch = estimatePitch(samples, 48000);
  assert(pitch && Math.abs(pitch.frequency - 391.9954) < 1);
  const semitones = 12 * Math.log2(pitch.frequency / 261.625565);
  assert(Math.abs(semitones - 7) < .05, 'Measured output must include oscillator tuning, not echo the zero pitch envelope');
});

test('sustain and release positions map independently in the two time envelopes', () => {
  const patch = createDefaultPatch(), note = { started: 0, released: null };
  assert.equal(envelopeTime(3, note, patch.amplitude), patch.amplitude.points[patch.amplitude.sustainIndex].x);
  assert.equal(envelopeTime(3, note, patch.pitch), patch.pitch.points[patch.pitch.sustainIndex].x);
  note.released = 3;
  const release = envelopeTime(3.15, note, patch.amplitude);
  assert(Math.abs(release - patch.amplitude.points[patch.amplitude.sustainIndex].x - .15) < 1e-9);
});

test('captured levels and relative pitch use actual samples without editing patch or control points', () => {
  const capture = createOutputAnalysis(), original = input(.12), before = structuredClone(original.patch);
  const frame = capture.update(original);
  assert(frame.measured && frame.spectrum.length > 0 && frame.amplitude.length > 10);
  assert(frame.amplitude.some(p => p.y > .29) && frame.amplitude.every(p => p.y <= .301));
  assert(frame.pitch.some(p => p.y !== null && Math.abs(p.y) < .05));
  assert.deepEqual(original.patch, before);
  const saved = frame.spectrum;
  capture.update(input(.16, { samples: new Float32Array(8192) }));
  assert.equal(capture.frame.spectrum, saved, 'A silent tail retains the last useful spectrum for inspection');
  capture.update({ ...input(), note: undefined }); assert(capture.frame.amplitude.length > 0);
  capture.clear(); assert.equal(capture.frame.amplitude.length, 0); assert.equal(capture.frame.spectrum.length, 0);
});

test('new attacks clear old histories and multi-key output leaves pitch gaps', () => {
  const capture = createOutputAnalysis(); capture.update(input(.15));
  const next = input(.08); next.note.serial = 2; next.note.midi = 72; next.multipleKeys = true;
  const frame = capture.update(next);
  assert.equal(frame.referenceMidi, 72); assert(frame.amplitude.at(-1).x < .1);
  assert(frame.pitch.length > 0 && frame.pitch.every(p => p.y === null));
  assert.match(frame.pitchStatus, /多音/);
  next.note.age = .16; next.multipleKeys = false; next.note.released = .1;
  assert(capture.update(next).pitch.every(p => p.y === null), 'Releasing a chord must not create a false single-note tail');
});

test('clearing on an edit discards samples from before that edit', () => {
  const capture = createOutputAnalysis(); capture.update(input(.1)); capture.clear(input(.11).note);
  const frame = capture.update(input(.14));
  assert(frame.amplitude.length > 0 && frame.amplitude[0].x >= .11);
});

test('long history stays bounded while preserving the peak and chronological coordinates', () => {
  const capture = createOutputAnalysis(), patch = createDefaultPatch();
  patch.amplitude = { points: [{ x: 0, y: 0 }, { x: 58, y: .8 }, { x: 60, y: 0 }], sustainIndex: 1 };
  const samples = new Float32Array(8192).fill(.1), frequencyDb = spectrum();
  for (let i = 1; i <= 590; i++) {
    samples.fill(i === 3 ? .95 : .1);
    capture.update(input(i / 10, { samples, frequencyDb, patch }));
  }
  const points = capture.frame.amplitude;
  assert(points.length <= 1536 && points.some(p => p.y > .94));
  assert(points.every((p, i) => !i || p.x >= points[i - 1].x));
});
