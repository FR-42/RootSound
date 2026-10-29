import test from 'node:test';
import assert from 'node:assert/strict';
import { createDefaultPatch, createPresets, normalizePatch, curveValue } from '../web/model.mjs';

test('new instruments and all presets start with six editable points and valid sustain anchors', () => {
  for (const patch of [createDefaultPatch(), ...createPresets().map(item => item.patch)]) {
    assert.equal(patch.spectrum.points.length, 6, patch.name);
    for (const kind of ['amplitude','pitch']) {
      assert.equal(patch[kind].points.length, 6, `${patch.name} ${kind}`);
      assert(patch[kind].sustainIndex >= 0 && patch[kind].sustainIndex < 5);
      assert.equal(patch[kind].points[0].x, 0);
    }
    assert.equal(patch.amplitude.points.at(-1).y, 0);
    assert.deepEqual(normalizePatch(patch), patch);
  }
});

test('default six-point curves retain original times, gains and sustain with bounded curve fitting error', () => {
  const patch = createDefaultPatch();
  const original = [{x:0,y:0,curve:0},{x:.012,y:1,curve:-.2},{x:.24,y:.65,curve:0},{x:.65,y:0,curve:.2}];
  for (const point of original) assert.equal(patch.amplitude.points.find(candidate => candidate.x === point.x)?.y, point.y);
  assert.equal(patch.amplitude.points[patch.amplitude.sustainIndex].x, .24);
  assert.equal(patch.pitch.points[patch.pitch.sustainIndex].x, .1);
  for (let index=0; index<=4096; index++) {
    const time = index/4096 * .65;
    assert(Math.abs(curveValue(patch.amplitude.points, time) - curveValue(original, time)) < .02);
  }
});
