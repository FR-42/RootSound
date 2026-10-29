import test from 'node:test';
import assert from 'node:assert/strict';
import { createDefaultPatch, normalizePatch, importPatch, MAX_CURVE_POINTS, LEGACY_CURVE_POINTS } from '../web/model.mjs';
import { densifyCurve } from '../web/curve-density.mjs';

function legacyPatch() {
  const patch = createDefaultPatch();
  patch.spectrum.points = densifyCurve(patch.spectrum.points, 512, { logX: true });
  for (const [kind, count] of [['amplitude',64], ['pitch',32]]) {
    const envelope = patch[kind], sustainX = envelope.points[envelope.sustainIndex].x;
    envelope.points = densifyCurve(envelope.points, count);
    envelope.sustainIndex = envelope.points.findIndex(point => point.x === sustainX);
  }
  return patch;
}

test('legacy imports reduce all oversized curves to ten while retaining endpoints, sustain, other settings and input', () => {
  const legacy = legacyPatch(), before = structuredClone(legacy);
  const result = importPatch(legacy);
  assert.equal(MAX_CURVE_POINTS, 10); assert.equal(LEGACY_CURVE_POINTS, 512);
  assert.equal(result.reduced, true); assert.deepEqual(legacy, before);
  assert.deepEqual(result.patch.oscillators, legacy.oscillators);
  assert.deepEqual(result.patch.master, legacy.master); assert.deepEqual(result.patch.effects, legacy.effects);
  for (const kind of ['spectrum','amplitude','pitch']) {
    const original = legacy[kind], next = result.patch[kind];
    assert.equal(next.points.length, 10);
    assert.equal(next.points[0].x, original.points[0].x); assert.equal(next.points[0].y, original.points[0].y);
    assert.equal(next.points.at(-1).x, original.points.at(-1).x); assert.equal(next.points.at(-1).y, original.points.at(-1).y);
    if (kind !== 'spectrum') {
      assert.equal(next.points[next.sustainIndex].x, original.points[original.sustainIndex].x);
      assert.equal(next.points[next.sustainIndex].y, original.points[original.sustainIndex].y);
    }
  }
  assert.deepEqual(normalizePatch(result.patch), result.patch);
  assert.throws(() => normalizePatch(legacy), /10/);
});

test('current ten-or-fewer point files import without simplification and remain independent snapshots', () => {
  const patch = createDefaultPatch(); const result = importPatch(patch);
  assert.equal(result.reduced, false); assert.deepEqual(result.patch, patch); assert.notEqual(result.patch, patch);
  result.patch.amplitude.points[0].y = .4; assert.equal(patch.amplitude.points[0].y, 0);
});

test('legacy import validates every original field before fitting, so malformed files cannot lose their evidence', () => {
  const valid = legacyPatch();
  for (const mutate of [p => p.spectrum.points[200].y = NaN,
    p => p.amplitude.sustainIndex = 999,
    p => p.oscillators[0].level = 5,
    p => p.amplitude.points.at(-1).y = .8,
    p => p.pitch.points[1].x = 0,
    p => p.spectrum.points.push({x:20000,y:0,curve:0})]) {
    const invalid = structuredClone(valid); mutate(invalid); const original = structuredClone(invalid);
    assert.throws(() => importPatch(invalid)); assert.deepEqual(invalid, original);
  }
});
