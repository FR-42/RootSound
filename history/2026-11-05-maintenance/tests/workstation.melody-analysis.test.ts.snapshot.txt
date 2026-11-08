import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { MelodyAnalysis, RecognizedNote } from '../src/workstation/contracts/melody-recognition.ts';
import type { PcmAudio } from '../src/workstation/contracts/sound.ts';
import { analyzeMelody } from '../src/workstation/modules/melody-recognition/analyze.ts';

type Hum = { start: number; duration: number; hz: number | ((time: number) => number); amplitude?: number; harmonics?: number[]; attack?: number; release?: number };
function synthesize(rate: number, duration: number, hums: Hum[], noise = 0, seed = 73): PcmAudio {
  const data = new Float32Array(Math.round(rate * duration)); let random = seed >>> 0;
  for (let index = 0; index < data.length; index++) { random = (Math.imul(1664525, random) + 1013904223) >>> 0; data[index] = noise * (random / 2147483648 - 1); }
  for (const hum of hums) {
    const first = Math.round(hum.start * rate); const end = Math.min(data.length, Math.round((hum.start + hum.duration) * rate)); let phase = 0;
    const harmonics = hum.harmonics ?? [1, 0.35, 0.16, 0.08];
    for (let index = first; index < end; index++) {
      const elapsed = (index - first) / rate; const frequency = typeof hum.hz === 'function' ? hum.hz(elapsed) : hum.hz;
      phase += 2 * Math.PI * frequency / rate;
      const envelope = Math.min(1, elapsed / (hum.attack ?? 0.015), (hum.duration - elapsed) / (hum.release ?? 0.02));
      let value = 0; harmonics.forEach((strength, harmonic) => { value += strength * Math.sin((harmonic + 1) * phase); });
      data[index] = data[index]! + (hum.amplitude ?? 0.45) * Math.max(0, envelope) * value;
    }
  }
  return { sampleRate: rate, channels: [data] };
}
function close(actual: number, expected: number, tolerance: number, description: string): void {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${description}: ${actual} vs ${expected}, tolerance ${tolerance}`);
}
function pitchClose(actual: number, expected: number, toleranceCents = 15): void {
  close(1200 * Math.log2(actual / expected), 0, toleranceCents, `physical pitch ${actual} Hz vs ${expected} Hz`);
}
function bounded(result: MelodyAnalysis): void {
  let end = 0;
  for (const note of result.notes) {
    assert.ok(Number.isFinite(note.frequencyHz) && note.frequencyHz >= 55 * 0.998 && note.frequencyHz <= 1400 * 1.002);
    assert.ok(note.startSeconds >= end - 1e-12); assert.ok(note.durationSeconds > 0);
    end = note.startSeconds + note.durationSeconds; assert.ok(end <= result.durationSeconds + 1e-12);
    assert.ok(note.velocity > 0 && note.velocity <= 1); assert.ok(note.confidence >= 0.7 && note.confidence <= 1);
  }
  close(result.coverage, result.notes.reduce((sum, note) => sum + note.durationSeconds, 0) / result.durationSeconds, 1e-12, 'coverage describes the actual notes');
}
function nearest(result: MelodyAnalysis, time: number): RecognizedNote {
  const found = result.notes.find(note => note.startSeconds <= time && note.startSeconds + note.durationSeconds >= time);
  assert.ok(found, `no recognized note at ${time}s: ${JSON.stringify(result.notes)}`); return found;
}

test('harmonic humming becomes arbitrary-frequency notes with free starts, lengths and real rests', async () => {
  const hums: Hum[] = [
    { start: 0.137, duration: 0.419, hz: 223.47 },
    { start: 0.691, duration: 0.363, hz: 337.92, amplitude: 0.29 },
    { start: 1.173, duration: 0.487, hz: 281.33, amplitude: 0.52 },
  ];
  const result = await analyzeMelody(synthesize(48000, 1.9, hums)); bounded(result); assert.equal(result.notes.length, 3);
  hums.forEach((hum, index) => {
    const note = result.notes[index]!; pitchClose(note.frequencyHz, hum.hz as number, 10);
    close(note.startSeconds, hum.start, 0.04, 'unquantized onset'); close(note.durationSeconds, hum.duration, 0.065, 'unquantized duration');
  });
  assert.ok(result.notes[1]!.velocity < result.notes[2]!.velocity);
  assert.ok(result.notes[0]!.startSeconds + result.notes[0]!.durationSeconds < result.notes[1]!.startSeconds);
});

test('a weak or absent fundamental is recovered from its harmonic pattern without an octave jump', async () => {
  for (const harmonics of [[0.035, 1, 0.44, 0.16], [0, 0.9, 0.55, 0.12]]) {
    const result = await analyzeMelody(synthesize(44100, 0.85, [{ start: 0.1, duration: 0.65, hz: 196.73, harmonics }]));
    bounded(result); assert.equal(result.notes.length, 1); pitchClose(result.notes[0]!.frequencyHz, 196.73, 18);
  }
});

test('natural vibrato stays one sustained editable note instead of many tiny notes', async () => {
  const centre = 307.17;
  const result = await analyzeMelody(synthesize(48000, 2.4, [{ start: 0.15, duration: 2.05, hz: time => centre * Math.pow(2, 35 * Math.sin(2 * Math.PI * 5.3 * time) / 1200) }]));
  bounded(result); assert.equal(result.notes.length, 1); pitchClose(result.notes[0]!.frequencyHz, centre, 15);
  close(result.notes[0]!.durationSeconds, 2.05, 0.065, 'vibrato sustain');
});

test('a continuous glide follows a small sequence of continuous pitches and never snaps to a scale', async () => {
  const start = 0.12; const duration = 1.05; const frequency = (time: number) => 211.37 * Math.pow(2, 640 * time / duration / 1200);
  const result = await analyzeMelody(synthesize(44100, 1.3, [{ start, duration, hz: frequency }])); bounded(result);
  assert.ok(result.notes.length >= 2 && result.notes.length <= 9, JSON.stringify(result.notes));
  for (const note of result.notes) {
    const middle = note.startSeconds + note.durationSeconds / 2 - start;
    pitchClose(note.frequencyHz, frequency(Math.max(0, Math.min(duration, middle))), 65);
  }
  assert.ok(result.notes.at(-1)!.frequencyHz > result.notes[0]!.frequencyHz * 1.2);
});

test('repeated equal pitches preserve silence boundaries and renewed attacks without silence', async () => {
  const separated = await analyzeMelody(synthesize(48000, 1.4, [0.1, 0.52, 0.94].map(start => ({ start, duration: 0.3, hz: 254.83 }))));
  bounded(separated); assert.equal(separated.notes.length, 3); separated.notes.forEach(note => pitchClose(note.frequencyHz, 254.83, 12));
  assert.ok(separated.notes[1]!.startSeconds - (separated.notes[0]!.startSeconds + separated.notes[0]!.durationSeconds) > 0.055);
  const touching = await analyzeMelody(synthesize(44100, 1.1, [0.1, 0.5].map(start => ({ start, duration: 0.4, hz: 254.83, attack: 0.03, release: 0.03 }))));
  bounded(touching); assert.equal(touching.notes.length, 2); close(touching.notes[1]!.startSeconds, 0.5, 0.045, 'new attack at the same pitch');
});

test('breath noise does not become pitched notes and a clear melody survives moderate noise', async () => {
  const result = await analyzeMelody(synthesize(48000, 1.3, [{ start: 0.22, duration: 0.74, hz: 242.19, amplitude: 0.38 }], 0.075));
  bounded(result); assert.equal(result.notes.length, 1); pitchClose(nearest(result, 0.6).frequencyHz, 242.19, 18);
  close(result.notes[0]!.startSeconds, 0.22, 0.07, 'noisy onset'); close(result.notes[0]!.durationSeconds, 0.74, 0.11, 'noisy duration');
  assert.ok(result.coverage < 0.8 && result.coverage > 0.45);
});

test('different sample clocks preserve physical pitch and duration including low and high humming', async () => {
  for (const rate of [8000, 11025, 44100, 48000, 96000, 192000]) {
    const hz = rate === 8000 ? 71.83 : rate === 11025 ? 1137.31 : 413.27;
    const result = await analyzeMelody(synthesize(rate, 0.75, [{ start: 0.11, duration: 0.5, hz }]));
    bounded(result); assert.equal(result.notes.length, 1, `sample clock ${rate}`); pitchClose(result.notes[0]!.frequencyHz, hz, 20);
    close(result.notes[0]!.startSeconds, 0.11, 0.045, `onset at ${rate}`); close(result.notes[0]!.durationSeconds, 0.5, 0.075, `duration at ${rate}`);
  }
});

test('working-range endpoints remain one physical note rather than fragments or lower-octave substitutes', async () => {
  for (const rate of [8000, 48000]) for (const hz of [55, 55.1, 1399, 1400]) {
    const result = await analyzeMelody(synthesize(rate, 0.8, [{ start: 0, duration: 0.8, hz, harmonics: [1, 0.3], attack: 0.02, release: 0.02 }]));
    bounded(result); assert.equal(result.notes.length, 1, `${rate} Hz clock / ${hz} Hz pitch: ${JSON.stringify(result.notes)}`);
    pitchClose(result.notes[0]!.frequencyHz, hz, 5); close(result.notes[0]!.durationSeconds, 0.8, 0.035, 'complete endpoint sustain');
  }
});

test('strong high harmonics do not conceal a weaker fundamental or force a false octave correction', async () => {
  for (const rate of [8000, 48000]) {
    const result = await analyzeMelody(synthesize(rate, 0.8, [{ start: 0.06, duration: 0.67, hz: 603.27, harmonics: [0.025, 1, 0.48] }]));
    bounded(result); assert.equal(result.notes.length, 1); pitchClose(result.notes[0]!.frequencyHz, 603.27, 12);
  }
});

test('anti-alias filtering rejects a loud high partial that would alias into a false melody', async () => {
  const audio = synthesize(48000, 0.9, [{ start: 0.1, duration: 0.7, hz: 217.39, amplitude: 0.07, harmonics: [1] },
    { start: 0.1, duration: 0.7, hz: 7569, amplitude: 0.9, harmonics: [1] }]);
  const result = await analyzeMelody(audio); bounded(result); assert.equal(result.notes.length, 1); pitchClose(result.notes[0]!.frequencyHz, 217.39, 15);
});

test('opposite-phase channels cannot cancel the melody, and selection uses strongest AC energy', async () => {
  const base = synthesize(48000, 0.9, [{ start: 0.14, duration: 0.61, hz: 277.31 }]).channels[0]!;
  const anti = Float32Array.from(base, value => -value);
  const stereo = await analyzeMelody({ sampleRate: 48000, channels: [base, anti] }); bounded(stereo);
  assert.equal(stereo.channelIndex, 0); assert.equal(stereo.notes.length, 1); pitchClose(stereo.notes[0]!.frequencyHz, 277.31, 12);
  const channels = [new Float32Array(base.length).fill(3), Float32Array.from(base, value => value * 0.3),
    Float32Array.from(base, value => value * 1.7 + 4), anti, new Float32Array(base.length), base, anti, base];
  const strongest = await analyzeMelody({ sampleRate: 48000, channels }); bounded(strongest);
  assert.equal(strongest.channelIndex, 2); pitchClose(strongest.notes[0]!.frequencyHz, 277.31, 12);
});

test('silence, DC and broadband noise reject honestly instead of inventing a melody', async () => {
  for (const audio of [{ sampleRate: 8000, channels: [new Float32Array(8000)] },
    { sampleRate: 8000, channels: [new Float32Array(8000).fill(0.3)] }, synthesize(48000, 1.1, [], 0.5)]) {
    await assert.rejects(analyzeMelody(audio), /稳定|旋律/);
  }
});

test('analysis preserves the caller audio, is deterministic, and reports bounded monotonic progress', async () => {
  const audio = synthesize(44100, 0.7, [{ start: 0.08, duration: 0.53, hz: 432.123 }]); const original = audio.channels[0]!.slice(); const progress: number[] = [];
  const result = await analyzeMelody(audio, { onProgress: value => { progress.push(value); } }); bounded(result);
  assert.deepEqual(audio.channels[0], original); assert.deepEqual(await analyzeMelody(audio), result);
  assert.equal(progress[0], 0); assert.equal(progress.at(-1), 1); assert.ok(progress.every((value, index) => value >= 0 && value <= 1 && (index === 0 || value >= progress[index - 1]!)));
  pitchClose(result.notes[0]!.frequencyHz, 432.123, 10);
});

test('cancellation before and during analysis stops without a partial result; display errors do not corrupt it', async () => {
  const audio = synthesize(48000, 1.1, [{ start: 0.1, duration: 0.9, hz: 236.13 }]);
  const already = new AbortController(); already.abort(); await assert.rejects(analyzeMelody(audio, { signal: already.signal }), { name: 'AbortError' });
  const during = new AbortController(); const progress: number[] = [];
  await assert.rejects(analyzeMelody(audio, { signal: during.signal, onProgress(value) { progress.push(value); if (value >= 0.2) during.abort(); } }), { name: 'AbortError' });
  assert.ok(progress.at(-1)! < 1);
  assert.ok((await analyzeMelody(audio, { onProgress() { throw new Error('display disconnected'); } })).notes.length > 0);
});

test('caller changes after the first await cannot rewrite an ongoing analysis', async () => {
  const audio = synthesize(48000, 0.7, [{ start: 0.08, duration: 0.53, hz: 351.17 }]);
  const analyzing = analyzeMelody(audio); audio.channels[0]!.fill(0);
  const result = await analyzing; bounded(result); pitchClose(result.notes[0]!.frequencyHz, 351.17, 12);
});

test('invalid PCM and recordings longer than thirty seconds are rejected without truncation', async () => {
  const valid = synthesize(8000, 0.2, [{ start: 0, duration: 0.2, hz: 300 }]);
  const cases = [null, { ...valid, sampleRate: 7999 }, { ...valid, sampleRate: Number.NaN }, { ...valid, channels: [] },
    { ...valid, channels: [new Float64Array(1600)] }, { ...valid, channels: [valid.channels[0], new Float32Array(1)] },
    { ...valid, channels: Array.from({ length: 9 }, () => valid.channels[0]) }, { ...valid, channels: [Float32Array.from([0, Infinity, 1])] },
    { ...valid, channels: [Float32Array.from([0, NaN, 1])] }];
  for (const input of cases) await assert.rejects(analyzeMelody(input as PcmAudio));
  await assert.rejects(analyzeMelody({ sampleRate: 8000, channels: [new Float32Array(240001)] }), /30 秒/);
});
