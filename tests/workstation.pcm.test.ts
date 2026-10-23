import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readPcmAudio } from '../src/workstation/modules/sound-runtime/pcm.ts';

test('PCM snapshots preserve samples and channel identity while isolating later caller changes', () => {
  const source = { sampleRate: 44100, channels: [new Float32Array([0, 0.1234567, 1.1]), new Float32Array([-1, 0, 1])] };
  const snapshot = readPcmAudio(source); assert.deepEqual(snapshot, source);
  source.channels[0]![0] = 1; assert.equal(snapshot.channels[0]![0], 0);
});

test('malformed, nonfinite, incomplete and oversized PCM is rejected before allocation on a device', () => {
  const good = { sampleRate: 8000, channels: [new Float32Array([0, 1])] };
  for (const value of [{ ...good, sampleRate: 7999 }, { ...good, sampleRate: 192001 }, { ...good, sampleRate: 44100.1 },
    { ...good, channels: [] }, { ...good, channels: [new Float32Array()] }, { ...good, channels: [new Float32Array([NaN])] },
    { ...good, channels: [new Float32Array([Infinity])] }, { ...good, channels: [[0, 1]] },
    { ...good, channels: [new Float32Array([0]), new Float32Array([0, 1])] },
    { ...good, channels: Array.from({ length: 9 }, () => new Float32Array([0])) },
    { ...good, channels: [new Float32Array(8000 * 120 + 1)] }, { ...good, future: true }])
    assert.throws(() => readPcmAudio(value as never));
  const channel = new Float32Array(192000 * 12);
  assert.throws(() => readPcmAudio({ sampleRate: 192000, channels: Array.from({ length: 8 }, () => channel) }), /容量/);
});
