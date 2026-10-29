/**
 * Add useful control points without dropping existing anchors. A signed-power
 * curve is not closed under arbitrary subdivision: subsegments are fitted at
 * their midpoint, then the largest visual gaps / approximation errors receive
 * more points. This is a close approximation, not an exact shape equivalence.
 */
export function densifyCurve(input, targetCount, { logX = false, maxPoints = 512 } = {}) {
  if (!Number.isInteger(maxPoints) || maxPoints < 2 || maxPoints > 512
    || !Number.isInteger(targetCount) || targetCount < 2 || targetCount > maxPoints)
    throw new RangeError('曲线点数需要在2～512之间。');
  if (!Array.isArray(input) || input.length < 2 || input.length > maxPoints)
    throw new RangeError('曲线点数无效。');
  const points = input.map(point => {
    if (!point || ![point.x, point.y, point.curve ?? 0].every(Number.isFinite)
      || Math.abs(point.curve ?? 0) > 1 || logX && point.x <= 0)
      throw new RangeError('曲线点包含无效数值。');
    return { x: point.x, y: point.y, curve: point.curve ?? 0 };
  });
  // Match the editor's normalized minimum spacing. Broader nonstandard input
  // domains remain usable; normal time and 20 Hz–20 kHz curves match exactly.
  const low = Math.min(logX ? 20 : 0, points[0].x);
  const high = logX ? Math.max(20000, points.at(-1).x) : points.at(-1).x;
  if (!(high > low)) throw new RangeError('曲线横坐标需要从左至右排列。');
  const span = logX ? Math.log(high / low) : high - low;
  const unit = x => logX ? Math.log(x / low) / span : (x - low) / span;
  const world = t => logX ? low * (high / low) ** t : low + (high - low) * t;
  const EPS = 1e-8;
  for (let i = 1; i < points.length; i++)
    if (unit(points[i].x) - unit(points[i - 1].x) < EPS)
      throw new RangeError('曲线点需要从左至右排列，并保留足够间距。');
  if (targetCount <= points.length) return points;
  const ys = points.map(point => point.y);
  const ySpan = Math.max(1e-12, Math.max(...ys) - Math.min(...ys));
  const factor = (t, curve) => curve >= 0 ? t ** (1 + 8 * curve) : 1 - (1 - t) ** (1 - 8 * curve);
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  function fit(source, left, right) {
    const a = unit(left.x), b = unit(right.x);
    const originalA = unit(source.left.x), originalB = unit(source.right.x);
    const evaluate = u => source.left.y + (source.right.y - source.left.y)
      * factor(clamp((u - originalA) / (originalB - originalA), 0, 1), source.left.curve);
    let curve = source.left.curve;
    if (left.x !== source.left.x || right.x !== source.right.x) {
      const delta = right.y - left.y;
      if (Math.abs(delta) <= ySpan * 1e-14) curve = 0;
      else {
        const ratio = clamp((evaluate((a + b) / 2) - left.y) / delta, 1 / 512, 511 / 512);
        curve = ratio <= .5 ? (Math.log(ratio) / Math.log(.5) - 1) / 8
          : (1 - Math.log(1 - ratio) / Math.log(.5)) / 8;
        curve = clamp(curve, -1, 1);
      }
    }
    let error = 0;
    for (let sample = 1; sample < 16; sample++) {
      const t = sample / 16;
      error = Math.max(error, Math.abs(evaluate(a + (b - a) * t)
        - (left.y + (right.y - left.y) * factor(t, curve))) / ySpan);
    }
    const middleX = world((a + b) / 2), middleU = unit(middleX);
    const canSplit = middleU - a >= EPS * 2 && b - middleU >= EPS * 2;
    return { source, left, right, curve, error, middleX, evaluate,
      score: canSplit ? Math.max(b - a, Math.sqrt(error * 8)) : -1 };
  }
  const intervals = points.slice(0, -1).map((left, index) => {
    const right = points[index + 1]; return fit({ left, right }, left, right);
  });
  while (intervals.length + 1 < targetCount) {
    let best = -1, score = -1;
    for (let i = 0; i < intervals.length; i++)
      if (intervals[i].score > score) { best = i; score = intervals[i].score; }
    if (best < 0) break;
    const chosen = intervals[best];
    const middle = { x: chosen.middleX, y: chosen.evaluate(unit(chosen.middleX)), curve: 0 };
    intervals.splice(best, 1, fit(chosen.source, chosen.left, middle), fit(chosen.source, middle, chosen.right));
  }
  return intervals.map(interval => ({ x: interval.left.x, y: interval.left.y, curve: interval.curve }))
    .concat([{ ...points.at(-1) }]);
}

/** Resize visible controls without truncating the end of an existing curve.
 * Reduction chooses original anchors by reconstruction error. Endpoints and
 * caller-protected anchors (for example sustain) are never candidates to drop.
 * Curved subsegments are fitted, so arbitrary reduction is an approximation.
 */
export function resizeCurve(input, targetCount, { logX = false, maxPoints = 10, protectedXs = [] } = {}) {
  if (!Number.isInteger(maxPoints) || maxPoints < 2 || maxPoints > 10
    || !Number.isInteger(targetCount) || targetCount < 2 || targetCount > maxPoints)
    throw new RangeError('曲线点数需要在2～10之间。');
  // Legacy files may contain many more controls than the new visible limit.
  // Reuse the same finite-number / spacing checks before touching any data.
  const points = densifyCurve(input, input?.length, { logX, maxPoints: 512 });
  if (!Array.isArray(protectedXs) || protectedXs.some(x => !Number.isFinite(x)))
    throw new RangeError('需要保留的曲线点无效。');
  const protectedIndices = new Set([0, points.length - 1]);
  for (const x of protectedXs) {
    const index = points.findIndex(point => point.x === x);
    if (index < 0) throw new RangeError('需要保留的曲线点不存在。');
    protectedIndices.add(index);
  }
  if (targetCount < protectedIndices.size) throw new RangeError(`至少保留${protectedIndices.size}个点，才能保留首尾和持续点。`);
  if (targetCount === points.length) return points;
  if (targetCount > points.length) {
    const result = densifyCurve(points, targetCount, { logX, maxPoints: 512 });
    if (result.length !== targetCount) throw new RangeError('曲线点过于接近，无法再增加控制点。');
    return result;
  }
  const low = Math.min(logX ? 20 : 0, points[0].x);
  const high = logX ? Math.max(20000, points.at(-1).x) : points.at(-1).x;
  const span = logX ? Math.log(high / low) : high - low;
  const unit = x => logX ? Math.log(x / low) / span : (x - low) / span;
  const units = points.map(point => unit(point.x));
  const ys = points.map(point => point.y);
  const ySpan = Math.max(1e-12, Math.max(...ys) - Math.min(...ys));
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const factor = (t, curve) => curve >= 0 ? t ** (1 + 8 * curve) : 1 - (1 - t) ** (1 - 8 * curve);
  const sourceValue = x => {
    let lo = 0, hi = points.length - 1;
    while (hi - lo > 1) { const middle = (lo + hi) >>> 1; if (units[middle] <= x) lo = middle; else hi = middle; }
    const t = clamp((x - units[lo]) / (units[hi] - units[lo]), 0, 1);
    return points[lo].y + (points[hi].y - points[lo].y) * factor(t, points[lo].curve);
  };
  function fitInterval(left, right) {
    if (right === left + 1) return { left, right, curve: points[left].curve, error: 0, candidate: -1, width: units[right] - units[left] };
    const a = units[left], width = units[right] - a, y0 = points[left].y, delta = points[right].y - y0;
    const samples = [];
    for (let index = left; index < right; index++) {
      for (let part = 0; part < 8; part++) {
        const x = units[index] + (units[index + 1] - units[index]) * part / 8;
        samples.push({ t: (x - a) / width, y: sourceValue(x) });
      }
    }
    samples.push({ t: 1, y: points[right].y });
    const evaluate = curve => {
      let maximum = 0, squares = 0, worstT = .5;
      for (const sample of samples) {
        const difference = Math.abs(sample.y - (y0 + delta * factor(sample.t, curve))) / ySpan;
        squares += difference * difference;
        if (difference > maximum) { maximum = difference; worstT = sample.t; }
      }
      return { curve, error: maximum, score: maximum + Math.sqrt(squares / samples.length) * .01, worstT };
    };
    let best = evaluate(0);
    if (Math.abs(delta) > ySpan * 1e-14) {
      const ratio = clamp((sourceValue(a + width / 2) - y0) / delta, 1 / 512, 511 / 512);
      const middleCurve = clamp(ratio <= .5 ? (Math.log(ratio) / Math.log(.5) - 1) / 8
        : (1 - Math.log(1 - ratio) / Math.log(.5)) / 8, -1, 1);
      for (const curve of [-1, -.75, -.5, -.25, 0, .25, .5, .75, 1, middleCurve]) {
        const tested = evaluate(curve); if (tested.score < best.score) best = tested;
      }
      let step = .125;
      for (let refinement = 0; refinement < 5; refinement++, step /= 4) {
        const center = best.curve;
        for (const curve of [clamp(center - step, -1, 1), clamp(center + step, -1, 1)]) {
          const tested = evaluate(curve); if (tested.score < best.score) best = tested;
        }
      }
    }
    // Prefer the original anchor near the largest unresolved deviation. Exact
    // straight spans use their middle anchor so extra controls remain useful.
    let candidate = left + 1, candidateScore = -Infinity;
    const desired = a + width * (best.error > 1e-12 ? best.worstT : .5);
    for (let index = left + 1; index < right; index++) {
      const t = (units[index] - a) / width;
      const difference = Math.abs(points[index].y - (y0 + delta * factor(t, best.curve))) / ySpan;
      const candidateValue = difference - Math.abs(units[index] - desired) / width * 1e-9;
      if (candidateValue > candidateScore) { candidate = index; candidateScore = candidateValue; }
    }
    return { left, right, curve: best.curve, error: best.error, candidate, width };
  }
  const anchors = [...protectedIndices].sort((a, b) => a - b);
  const intervals = anchors.slice(0, -1).map((left, index) => fitInterval(left, anchors[index + 1]));
  while (intervals.length + 1 < targetCount) {
    let best = -1;
    for (let index = 0; index < intervals.length; index++) {
      const interval = intervals[index]; if (interval.candidate < 0) continue;
      if (best < 0 || interval.error > intervals[best].error + 1e-12
        || Math.abs(interval.error - intervals[best].error) <= 1e-12 && interval.width > intervals[best].width) best = index;
    }
    if (best < 0) break;
    const chosen = intervals[best];
    intervals.splice(best, 1, fitInterval(chosen.left, chosen.candidate), fitInterval(chosen.candidate, chosen.right));
  }
  return intervals.map(interval => ({ ...points[interval.left], curve: interval.curve })).concat([{ ...points.at(-1) }]);
}
