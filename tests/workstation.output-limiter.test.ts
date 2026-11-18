import assert from 'node:assert/strict';
import { test } from 'node:test';
import { OUTPUT_CEILING, OutputPeakLimiter } from '../src/workstation/modules/sound-runtime/output-limiter-worklet.js';

function limit(left: Float32Array, right: Float32Array, rate: number) {
  const limiter = new OutputPeakLimiter(rate);
  const output = [new Float32Array(left.length), new Float32Array(left.length)] as const;
  for (let index = 0; index < left.length + limiter.delayFrames; index++) {
    limiter.push(left[index] ?? 0, right[index] ?? 0);
    const frame = index - limiter.delayFrames;
    if (frame < 0) continue;
    output[0][frame] = limiter.left;
    output[1][frame] = limiter.right;
  }
  return output;
}

test('output protection is exact below its ceiling at each supported render rate', () => {
  for (const rate of [44100, 48000, 96000]) {
    const left = Float32Array.from({ length: 3179 }, (_, index) => Math.sin(index * .11) * .4);
    const right = Float32Array.from({ length: 3179 }, (_, index) => Math.sin(index * .4 + .1) * .8);
    const output = limit(left, right, rate);
    assert.deepEqual(output, [left, right]);
  }
});

test('peak protection passes the quiet channel at the same gain as the loud channel without clipping impulses', () => {
  const left = new Float32Array(5000);
  const right = new Float32Array(5000);
  left.fill(.35); right.fill(-.175);
  left[2000] = 4; right[2000] = -2;
  left[4999] = -18; right[4999] = 9;
  const [l, r] = limit(left, right, 48000);
  assert.equal(l[1600], left[1600]);
  assert(l[1999]! < l[1600]!, 'the limiter reacts before emitting an overload');
  assert(l[4000]! < left[4000]!, 'gain releases gradually');
  for (let index = 0; index < left.length; index++) {
    assert(Math.abs(l[index]!) <= OUTPUT_CEILING + 1e-7);
    assert.equal(r[index], -l[index]! / 2);
  }
  assert(Math.abs(l[2000]! - OUTPUT_CEILING) < 1e-7);
  assert(Math.abs(l[4999]! + OUTPUT_CEILING) < 1e-7);
});

test('400% playback preserves the shape of a sustained bass tone when protection engages', () => {
  const rate = 48000;
  const wave = Float32Array.from({ length: rate }, (_, index) => Math.sin(2 * Math.PI * 40 * index / rate));
  const boosted = wave.map(value => value * 3.2);
  const [heard] = limit(boosted, boosted, rate);
  for (let index = rate / 10; index < rate; index++)
    assert(Math.abs(heard[index]! - OUTPUT_CEILING * wave[index]!) < 1e-6);
});
