import test from 'node:test';
import assert from 'node:assert/strict';
import { densifyCurve, resizeCurve } from '../web/curve-density.mjs';
import { curveValue, validateCurve } from '../web/model.mjs';
import { normalizeCurvePoints } from '../web/curve-editor.mjs';

const p = (x, y, curve = 0) => ({ x, y, curve });
function error(original, dense, logX = false) {
  let maximum = 0;
  const first = original[0].x, last = original.at(-1).x;
  for (let i = 0; i <= 20000; i++) {
    const t = i / 20000, x = logX ? first * (last / first) ** t : first + (last - first) * t;
    maximum = Math.max(maximum, Math.abs(curveValue(original, x, logX) - curveValue(dense, x, logX)));
  }
  return maximum;
}
function retainAnchors(source, result) {
  for (const point of source) {
    const anchor = result.find(item => item.x === point.x);
    assert(anchor, `Missing original x=${point.x}`); assert.equal(anchor.y, point.y);
  }
}

test('linear and logarithmic straight segments gain dense points with exact values', () => {
  for (const [source, logX] of [[[p(0, 0), p(.1, 1), p(1, 0)], false], [[p(20, -30), p(1000, 4), p(20000, -10)], true]]) {
    const original = structuredClone(source), result = densifyCurve(source, 64, { logX });
    assert.equal(result.length, 64); retainAnchors(source, result);
    assert(error(source, result, logX) < 1e-10); assert.deepEqual(source, original);
    assert.deepEqual(result, densifyCurve(source, 64, { logX }));
  }
});

test('strong positive and negative curvature converge without losing endpoints', () => {
  for (const curve of [-1, -.5, .5, 1]) {
    const source = [p(0, 0, curve), p(1, 1)]; let previous = Infinity;
    for (const count of [32, 64, 128]) {
      const dense = densifyCurve(source, count); assert.equal(dense.length, count); retainAnchors(source, dense);
      const measured = error(source, dense);
      assert(measured < .002, `${curve}/${count}: ${measured}`);
      assert(measured <= previous + 1e-12, `${curve}/${count} did not converge`); previous = measured;
      validateCurve(dense, { maxPoints: 512 });
    }
  }
});

test('actual default volume shape keeps early attack, sustain anchor, release, and detailed curve', () => {
  const source = [p(0, 0), p(.012, 1, -.2), p(.24, .65), p(.65, 0, .2)];
  const dense = densifyCurve(source, 32);
  assert.equal(dense.length, 32); retainAnchors(source, dense);
  assert(error(source, dense) < .0003); assert(dense.findIndex(point => point.x === .24) > 2);
  assert.equal(dense.at(-1).y, 0); assert.equal(dense.at(-1).curve, .2);
  normalizeCurvePoints(dense, { xMin: 0, xMax: .65, yMin: 0, yMax: 1 });
});

test('nonuniform logarithmic curves preserve all existing anchors with low frequency gain error', () => {
  const source = [p(20, -60, 1), p(35, 3, -1), p(41, -20, .5), p(80, 0, -.8), p(20000, -50)];
  let previous = Infinity;
  for (const count of [32, 64, 128]) {
    const dense = densifyCurve(source, count, { logX: true });
    retainAnchors(source, dense); const measured = error(source, dense, true);
    assert(measured < .1, `Gain error ${count}: ${measured} dB`);
    assert(measured <= previous + 1e-10); previous = measured;
    validateCurve(dense, { minX: 20, maxX: 20000, minY: -96, maxY: 24, logarithmic: true, maxPoints: 512 });
    normalizeCurvePoints(dense, { xMin: 20, xMax: 20000, yMin: -96, yMax: 24, logX: true });
  }
});

test('repeated density increases preserve current anchors and cannot exceed 512 points', () => {
  let points = [p(0, 0, 1), p(.001, 1, -.7), p(.8, .2), p(1, 0)];
  for (const count of [32, 64, 128, 256, 512]) {
    const next = densifyCurve(points, count); assert.equal(next.length, count); retainAnchors(points, next); points = next;
  }
  const unchanged = densifyCurve(points, 128); assert.deepEqual(unchanged, points); assert.notEqual(unchanged, points);
  assert.throws(() => densifyCurve(points, 513));
});

test('invalid data is rejected atomically and near-spacing inputs are not overfilled', () => {
  for (const source of [[p(0, 0), p(0, 1)], [p(0, NaN), p(1, 0)], [p(0, 0, 2), p(1, 0)], [p(0, 0), p(1e-12, 1), p(1, 0)]])
    assert.throws(() => densifyCurve(source, 32));
  assert.throws(() => densifyCurve([p(0, 0), p(1, 0)], 3.5));
  assert.throws(() => densifyCurve([p(0, 0), p(1, 0)], 32, { logX: true }));
  const source = [p(0, 0), p(2e-8, 1), p(4e-8, 0), p(1, .2)];
  const result = densifyCurve(source, 512); retainAnchors(source, result);
  validateCurve(result, { maxPoints: 512 }); assert(result.length <= 512);
});

test('count resizing reduces legacy 64/512-point curves to 6/10 controls while retaining sustain and endpoints', () => {
  const sparse = [p(0, 0), p(.012, 1, -.2), p(.24, .65), p(.65, 0, .2)];
  for (const sourceCount of [64, 512]) {
    const source = densifyCurve(sparse, sourceCount), before = structuredClone(source);
    for (const count of [6, 10]) {
      const result = resizeCurve(source, count, { protectedXs: [.24] });
      assert.equal(result.length, count);
      assert.equal(result[0].x, 0); assert.equal(result[0].y, 0);
      assert.deepEqual(result.at(-1), source.at(-1));
      assert.equal(result.find(point => point.x === .24)?.y, .65);
      assert(result.some(point => point.x === .012), 'The attack peak should survive reduction');
      assert(error(source, result) < .01);
      normalizeCurvePoints(result, { xMin: 0, xMax: .65, yMin: 0, yMax: 1 }, 10);
      assert.deepEqual(result, resizeCurve(source, count, { protectedXs: [.24] }));
    }
    assert.deepEqual(source, before);
  }
});

test('count reduction keeps a narrow important spectral turn instead of truncating the first ten points', () => {
  const sparse = [p(20, -40), p(200, 0), p(11000, -5), p(12000, -70), p(13000, -5), p(20000, -12)];
  const source = densifyCurve(sparse, 512, { logX: true });
  const result = resizeCurve(source, 10, { logX: true });
  assert.equal(result.length, 10); assert.equal(result.at(-1).x, 20000);
  assert(result.some(point => point.x === 12000 && point.y === -70));
  assert(error(source, result, true) < 1);
  normalizeCurvePoints(result, { xMin: 20, xMax: 20000, yMin: -96, yMax: 24, logX: true }, 10);
});

test('count increase and same-count operations preserve anchors and never mutate the input', () => {
  const source = [p(0, 0), p(.2, 1, -.3), p(1, 0)], before = structuredClone(source);
  const same = resizeCurve(source, 3, { protectedXs: [.2] });
  assert.deepEqual(same, source); assert.notEqual(same, source);
  const more = resizeCurve(source, 10, { protectedXs: [.2] });
  assert.equal(more.length, 10); retainAnchors(source, more); assert(error(source, more) < .01);
  assert.deepEqual(source, before);
});

test('reduction to two is allowed for unprotected curves and cannot delete protected sustain controls', () => {
  const source = [p(20, -12), p(2000, -6), p(20000, 0)];
  const result = resizeCurve(source, 2, { logX: true });
  assert.equal(result.length, 2); assert.equal(result[0].x, 20); assert.equal(result[1].x, 20000);
  assert.throws(() => resizeCurve(source, 2, { logX: true, protectedXs: [2000] }), /至少保留3/);
  assert.throws(() => resizeCurve(source, 2, { logX: true, protectedXs: [999] }), /不存在/);
});

test('count range, invalid legacy data, and protection errors are rejected without partial changes', () => {
  const source = [p(0, 0), p(.3, 1), p(1, 0)], before = structuredClone(source);
  for (const count of [1, 11, NaN, 3.5]) assert.throws(() => resizeCurve(source, count));
  assert.throws(() => resizeCurve(source, 3, { protectedXs: [NaN] }));
  assert.throws(() => resizeCurve(source, 3, { maxPoints: 512 }));
  assert.throws(() => resizeCurve([p(0, 0), p(.3, Infinity), p(1, 0)], 3));
  assert.deepEqual(source, before);
});
