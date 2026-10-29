import { resizeCurve } from './curve-density.mjs';

const NS = 'http://www.w3.org/2000/svg';
const EPS = 1e-8;
const clamp = (value, low, high) => Math.min(high, Math.max(low, value));
const copy = points => points.map(point => ({ ...point }));
const equal = (a, b) => a.length === b.length && a.every((point, index) =>
  point.x === b[index].x && point.y === b[index].y && (point.curve ?? 0) === (b[index].curve ?? 0));

export function curveFactor(t, curve = 0) {
  t = clamp(t, 0, 1); curve = clamp(curve, -1, 1);
  return curve >= 0 ? t ** (1 + 8 * curve) : 1 - (1 - t) ** (1 - 8 * curve);
}

export function curveTransform(value, min, max, logarithmic = false) {
  return logarithmic ? Math.log(value / min) / Math.log(max / min) : (value - min) / (max - min);
}

export function curveUntransform(position, min, max, logarithmic = false) {
  return logarithmic ? min * (max / min) ** position : min + (max - min) * position;
}

export function curveValue(points, x, logarithmic = false) {
  if (!points.length) return 0;
  if (x <= points[0].x) return points[0].y;
  if (x >= points.at(-1).x) return points.at(-1).y;
  let lo = 0; let hi = points.length - 1;
  while (hi - lo > 1) { const middle = (lo + hi) >>> 1; if (points[middle].x <= x) lo = middle; else hi = middle; }
  const left = points[lo]; const right = points[hi];
  const fraction = logarithmic ? Math.log(x / left.x) / Math.log(right.x / left.x) : (x - left.x) / (right.x - left.x);
  return left.y + (right.y - left.y) * curveFactor(fraction, left.curve ?? 0);
}

function validateRange(range) {
  if (![range.xMin, range.xMax, range.yMin, range.yMax].every(Number.isFinite)
    || range.xMax <= range.xMin || range.yMax <= range.yMin || range.logX && range.xMin <= 0)
    throw new RangeError('曲线坐标范围无效。');
}

export function normalizeCurvePoints(input, range, maxPoints = 512) {
  validateRange(range);
  if (!Array.isArray(input) || input.length < 2 || input.length > maxPoints) throw new RangeError(`曲线需要2～${maxPoints}个点。`);
  let previous = -Infinity;
  return input.map(point => {
    if (!point || !Number.isFinite(point.x) || !Number.isFinite(point.y) || !Number.isFinite(point.curve ?? 0)
      || point.x < range.xMin || point.x > range.xMax || point.y < range.yMin || point.y > range.yMax
      || (point.curve ?? 0) < -1 || (point.curve ?? 0) > 1)
      throw new RangeError('曲线点必须在坐标范围内，且不能包含无效数字。');
    const transformed = curveTransform(point.x, range.xMin, range.xMax, range.logX);
    if (transformed - previous < EPS) throw new RangeError('曲线点必须从左至右排列，不能重合。');
    previous = transformed;
    return { ...point, x: point.x, y: point.y, curve: point.curve ?? 0 };
  });
}

function spanAt(low, high, factor, anchor) {
  const span = clamp((high - low) / factor, .00001, 1);
  const start = clamp(anchor - (anchor - low) / (high - low) * span, 0, 1 - span);
  return [start, start + span];
}

export function zoomCurveView(view, axis, factor, anchor = .5) {
  if (!Number.isFinite(factor) || factor <= 0) return { ...view };
  const next = { ...view };
  const low = axis === 'x' ? 'x0' : 'y0'; const high = axis === 'x' ? 'x1' : 'y1';
  [next[low], next[high]] = spanAt(view[low], view[high], factor, anchor);
  return next;
}

function svgNode(document, tag, attributes = {}) {
  const element = document.createElementNS(NS, tag);
  for (const [key, value] of Object.entries(attributes)) element.setAttribute(key, String(value));
  return element;
}

function attribute(element, key, value) {
  value = String(value);
  if (element.getAttribute(key) !== value) element.setAttribute(key, value);
}

function numberText(value) { return Number(value.toPrecision(9)).toString(); }
function pretty(value) {
  const absolute = Math.abs(value);
  if (absolute >= 1000) return `${Number((value / 1000).toPrecision(4))}k`;
  return Number(value.toPrecision(4)).toString();
}

/**
 * Multi-point editor. Undo ownership stays with the caller: previews can be
 * numerous, but each completed drag/number edit calls onCommit only once.
 */
export function createCurveEditor(container, options) {
  const document = container.ownerDocument ?? globalThis.document;
  const kind = options.kind ?? 'amplitude';
  let range = { xMin: options.xMin ?? 0, xMax: options.xMax ?? 1,
    yMin: options.yMin ?? 0, yMax: options.yMax ?? 1, logX: options.logX ?? kind === 'spectrum' };
  validateRange(range);
  const maxPoints = options.maxPoints ?? 10;
  if (!Number.isInteger(maxPoints) || maxPoints < 2 || maxPoints > 10) throw new RangeError('曲线点容量必须为2～10。');
  const lockEndpoints = options.lockEndpoints !== false;
  let points = normalizeCurvePoints(options.points, range, maxPoints);
  let selected = 0; let disposed = false; let gesture; let numeric; let countGesture;
  let view = { x0: 0, x1: 1, y0: 0, y1: 1 };
  let markers = []; let playhead;
  let analysis = [], analysisFilled = false;
  let width = 900; let height = 270;
  const padding = { left: 54, right: 18, top: 14, bottom: 30 };
  const circles = [];
  const root = document.createElement('section'); root.className = `curve-editor curve-${kind}`;
  const heading = document.createElement('div'); heading.className = 'curve-heading';
  const title = document.createElement('h3'); title.textContent = options.label ?? ({ spectrum: '频谱', amplitude: '音量', pitch: '音高' }[kind]);
  const tools = document.createElement('div'); tools.className = 'curve-tools';
  function tool(text, label, action) {
    const element = document.createElement('button'); element.type = 'button'; element.textContent = text;
    element.setAttribute('aria-label', label); element.title = label; element.addEventListener('click', action); tools.append(element); return element;
  }
  tool('−', '缩小横轴', () => changeZoom('x', 1 / 1.5, .5));
  tool('+', '放大横轴', () => changeZoom('x', 1.5, .5));
  tool('全览', '显示整条曲线', () => viewReset());
  const countLabel = document.createElement('label'); countLabel.className = 'curve-count';
  const countCaption = document.createElement('span'); countCaption.textContent = '点数';
  const countSlider = document.createElement('input'); countSlider.type = 'range'; countSlider.className = 'curve-count-slider';
  countSlider.min = '2'; countSlider.max = String(maxPoints); countSlider.step = '1';
  countSlider.setAttribute('aria-label', `${options.label ?? kind} 控制点数量`);
  const countOutput = document.createElement('output'); countOutput.className = 'curve-count-value';
  countLabel.append(countCaption, countSlider, countOutput); tools.append(countLabel);
  countSlider.addEventListener('input', () => resizeCount(Number(countSlider.value), true));
  countSlider.addEventListener('change', commitCount);
  countSlider.addEventListener('blur', commitCount);
  countSlider.addEventListener('pointercancel', cancelCount);
  countSlider.addEventListener('keydown', event => {
    if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); cancelCount(); }
  });
  const titleGroup = document.createElement('div'); titleGroup.className = 'curve-heading-title';
  const analysisLegend = document.createElement('span'); analysisLegend.className = 'curve-analysis-legend';
  analysisLegend.textContent = '试听后显示实际输出';
  const analysisHint = kind === 'spectrum'
    ? '原色线是设置的增益；粉紫色是处理后输出电平（dBFS），两者零点含义不同。分析不改写音色。'
    : kind === 'amplitude' ? '粉紫色显示包含振荡器、力度、总音量和效果后的实际输出峰值，原色线是音量包络设置。'
    : '粉紫色为合并声道的主音高估计，相对最近弹奏的琴键，包含振荡器移调。噪声、多音或快速滑音可能留空，检测存在窗口延迟。';
  analysisLegend.title = analysisHint;
  titleGroup.append(title, analysisLegend); heading.append(titleGroup, tools);
  const svg = svgNode(document, 'svg', { class: 'curve-svg', tabindex: '0', role: 'application', 'aria-label': options.label ?? '曲线编辑器', viewBox: `0 0 ${width} ${height}` });
  const background = svgNode(document, 'rect', { class: 'curve-background', x: 0, y: 0, width: '100%', height: '100%' });
  const id = `curve-${Math.random().toString(36).slice(2)}`;
  const definitions = svgNode(document, 'defs'); const clipPath = svgNode(document, 'clipPath', { id }); const clipRect = svgNode(document, 'rect');
  clipPath.append(clipRect); definitions.append(clipPath);
  const grid = svgNode(document, 'g', { class: 'curve-grid' });
  const labels = svgNode(document, 'g', { class: 'curve-labels' });
  const content = svgNode(document, 'g', { 'clip-path': `url(#${id})` });
  const analysisLayer = svgNode(document, 'g', { class: 'curve-analysis', 'pointer-events': 'none', 'aria-hidden': 'true' });
  const analysisFill = svgNode(document, 'path', { class: 'curve-analysis-fill' });
  const analysisPath = svgNode(document, 'path', { class: 'curve-analysis-path' });
  analysisLayer.append(analysisFill, analysisPath);
  const fill = svgNode(document, 'path', { class: 'curve-fill' }); const path = svgNode(document, 'path', { class: 'curve-path' });
  const markerLayer = svgNode(document, 'g', { class: 'curve-markers' });
  const head = svgNode(document, 'line', { class: 'curve-time-head', hidden: '' });
  const pointLayer = svgNode(document, 'g', { class: 'curve-points' });
  content.append(analysisLayer, fill, path, markerLayer, head, pointLayer); svg.append(background, definitions, grid, labels, content);
  const footer = document.createElement('div'); footer.className = 'curve-footer';
  const fields = document.createElement('div'); fields.className = 'curve-fields';
  const fieldLabels = kind === 'spectrum' ? ['频率 Hz', '增益 dB'] : kind === 'pitch' ? ['时间 s', '音高 半音'] : ['时间 s', '音量'];
  function numberField(label, className, property) {
    const wrap = document.createElement('label'); wrap.className = 'curve-field';
    const name = document.createElement('span'); name.textContent = label;
    const input = document.createElement('input'); input.type = 'number'; input.step = property === 'curve' ? '.01' : 'any'; input.className = className;
    input.setAttribute('aria-label', `${options.label ?? kind} ${label}`);
    input.addEventListener('input', () => {
      const value = Number(input.value);
      if (!input.value.trim() || !Number.isFinite(value)) { input.classList.add('is-invalid'); return; }
      input.classList.remove('is-invalid');
      if (!numeric) numeric = { before: copy(points) };
      updateSelected({ [property]: value }, false);
    });
    const commit = () => {
      if (!numeric) { renderFields(true); return; }
      const before = numeric.before; numeric = undefined;
      if (!equal(points, before)) options.onCommit?.(copy(points));
      renderFields(true);
    };
    input.addEventListener('change', commit); input.addEventListener('blur', commit);
    input.addEventListener('keydown', event => {
      // Let document shortcuts (especially Ctrl+S) reach the controller while
      // keeping edits and arrows local to this numeric field.
      if (!((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's')) event.stopPropagation();
      if (event.key === 'Enter') { event.preventDefault(); commit(); }
      if (event.key === 'Escape' && numeric) {
        event.preventDefault(); points = numeric.before; numeric = undefined; render();
        options.onPreview?.(copy(points)); options.onCancel?.(copy(points));
      }
    });
    wrap.append(name, input); fields.append(wrap); return input;
  }
  const xField = numberField(fieldLabels[0], 'curve-point-x', 'x');
  const yField = numberField(fieldLabels[1], 'curve-point-y', 'y');
  const bendField = numberField('曲率', 'curve-point-curve', 'curve');
  bendField.min = '-1'; bendField.max = '1';
  const remove = document.createElement('button'); remove.type = 'button'; remove.className = 'curve-delete'; remove.textContent = '删除点';
  remove.addEventListener('click', () => deleteSelected());
  const status = document.createElement('span'); status.className = 'curve-status'; status.setAttribute('aria-live', 'polite');
  const hint = document.createElement('span'); hint.className = 'curve-hint'; hint.textContent = '双击加点 · Shift精调 · 滚轮缩放';
  footer.append(fields, remove, status, hint); root.append(heading, svg, footer); container.append(root);
  const plotWidth = () => Math.max(1, width - padding.left - padding.right);
  const plotHeight = () => Math.max(1, height - padding.top - padding.bottom);
  const u = x => curveTransform(x, range.xMin, range.xMax, range.logX);
  const v = y => (y - range.yMin) / (range.yMax - range.yMin);
  const inverseX = x => curveUntransform(x, range.xMin, range.xMax, range.logX);
  const inverseY = y => range.yMin + y * (range.yMax - range.yMin);
  const screenX = x => padding.left + (u(x) - view.x0) / (view.x1 - view.x0) * plotWidth();
  const screenY = y => padding.top + (1 - (v(y) - view.y0) / (view.y1 - view.y0)) * plotHeight();
  function local(event) {
    const rect = svg.getBoundingClientRect();
    return { x: (event.clientX - rect.left) / Math.max(1, rect.width) * width,
      y: (event.clientY - rect.top) / Math.max(1, rect.height) * height };
  }
  function world(screen) {
    return { x: view.x0 + (screen.x - padding.left) / plotWidth() * (view.x1 - view.x0),
      y: view.y0 + (1 - (screen.y - padding.top) / plotHeight()) * (view.y1 - view.y0) };
  }
  function announceSelection() { options.onSelect?.(selected, selected === undefined ? undefined : { ...points[selected] }); }
  function protectedXs() { return options.getProtectedXs?.() ?? []; }
  function minimumCount(source = points, protectedValues = protectedXs()) {
    const anchors = new Set([source[0].x, source.at(-1).x]);
    for (const x of protectedValues) if (source.some(point => point.x === x)) anchors.add(x);
    return Math.max(2, anchors.size);
  }
  function renderCountControls() {
    countSlider.min = String(minimumCount()); countSlider.value = String(points.length);
    countOutput.textContent = String(points.length); countSlider.setAttribute('aria-valuetext', `${points.length}个控制点`);
    countSlider.title = `控制点数量：${countSlider.min}～${maxPoints}`;
  }
  function renderFields(force = false) {
    const point = points[selected]; const active = document.activeElement;
    renderCountControls();
    for (const input of [xField, yField, bendField]) input.disabled = !point;
    if (!point) { status.textContent = `${points.length}点`; remove.disabled = true; return; }
    const locked = lockEndpoints && (selected === 0 || selected === points.length - 1);
    xField.disabled = locked;
    yField.disabled = selected === 0 && Number.isFinite(options.fixedStartY)
      || selected === points.length - 1 && Number.isFinite(options.fixedEndY);
    bendField.disabled = selected === points.length - 1;
    if (force || active !== xField) xField.value = numberText(point.x);
    if (force || active !== yField) yField.value = numberText(point.y);
    if (force || active !== bendField) bendField.value = numberText(point.curve ?? 0);
    const limits = pointLimits(selected);
    xField.min = String(inverseX(limits.x0)); xField.max = String(inverseX(limits.x1));
    yField.min = String(range.yMin); yField.max = String(range.yMax);
    remove.disabled = points.length <= 2 || locked;
    status.textContent = `${selected + 1} / ${points.length}点`;
  }
  function tickLabel(x, y, text, anchor = 'middle') {
    const label = svgNode(document, 'text', { x, y, 'text-anchor': anchor }); label.textContent = text; labels.append(label);
  }
  function renderGrid() {
    grid.replaceChildren(); labels.replaceChildren();
    const xValues = [];
    if (range.logX) {
      for (let decade = -3; decade <= 8; decade++) for (const multiplier of [1, 2, 5]) {
        const value = multiplier * 10 ** decade;
        if (value >= range.xMin && value <= range.xMax && u(value) >= view.x0 - 1e-9 && u(value) <= view.x1 + 1e-9) xValues.push(value);
      }
    } else for (let i = 0; i <= 8; i++) xValues.push(inverseX(view.x0 + i / 8 * (view.x1 - view.x0)));
    for (const value of xValues) {
      const x = screenX(value);
      grid.append(svgNode(document, 'line', { x1: x, x2: x, y1: padding.top, y2: height - padding.bottom }));
      tickLabel(x, height - 9, options.formatX?.(value) ?? pretty(value));
    }
    for (let i = 0; i <= 4; i++) {
      const value = inverseY(view.y0 + i / 4 * (view.y1 - view.y0)); const y = screenY(value);
      grid.append(svgNode(document, 'line', { x1: padding.left, x2: width - padding.right, y1: y, y2: y }));
      tickLabel(padding.left - 8, y + 4, options.formatY?.(value) ?? pretty(value), 'end');
    }
    if (range.yMin <= 0 && range.yMax >= 0 && v(0) >= view.y0 && v(0) <= view.y1)
      grid.append(svgNode(document, 'line', { class: 'curve-zero', x1: padding.left, x2: width - padding.right, y1: screenY(0), y2: screenY(0) }));
    attribute(clipRect, 'x', padding.left); attribute(clipRect, 'y', padding.top);
    attribute(clipRect, 'width', plotWidth()); attribute(clipRect, 'height', plotHeight());
  }
  function renderPath() {
    let d = '';
    if (points.length) {
      d = `M ${screenX(points[0].x)} ${screenY(points[0].y)}`;
      for (let index = 0; index < points.length - 1; index++) {
        const left = points[index]; const right = points[index + 1];
        const segments = Math.abs(left.curve ?? 0) < 1e-9 ? 1 : Math.max(5, Math.min(32, Math.ceil(Math.abs(screenX(right.x) - screenX(left.x)) / 10)));
        for (let step = 1; step <= segments; step++) {
          const t = step / segments;
          const x = inverseX(u(left.x) + (u(right.x) - u(left.x)) * t);
          const y = left.y + (right.y - left.y) * curveFactor(t, left.curve ?? 0);
          d += ` L ${screenX(x)} ${screenY(y)}`;
        }
      }
    }
    attribute(path, 'd', d);
    const baseline = screenY(clamp(0, range.yMin, range.yMax));
    attribute(fill, 'd', points.length ? `${d} L ${screenX(points.at(-1).x)} ${baseline} L ${screenX(points[0].x)} ${baseline} Z` : '');
    while (circles.length > points.length) circles.pop().remove();
    for (let index = 0; index < points.length; index++) {
      let circle = circles[index];
      if (!circle) { circle = svgNode(document, 'circle', { class: 'curve-point', r: 4.5 }); circles.push(circle); pointLayer.append(circle); }
      attribute(circle, 'cx', screenX(points[index].x)); attribute(circle, 'cy', screenY(points[index].y));
      attribute(circle, 'data-index', index); attribute(circle, 'class', `curve-point${index === selected ? ' is-selected' : ''}`);
      attribute(circle, 'r', index === selected ? 5.5 : 4);
      attribute(circle, 'aria-label', `点${index + 1}: ${numberText(points[index].x)}, ${numberText(points[index].y)}`);
    }
  }
  function renderAnalysis() {
    let line = '', area = '', run = [], previousX = -Infinity;
    const coordinate = (x, y) => `${screenX(x).toFixed(2)} ${screenY(y).toFixed(2)}`;
    function finish() {
      if (!run.length) return;
      const d = run.map((p, i) => `${i ? 'L' : 'M'} ${coordinate(p.x, p.y)}`).join(' ');
      line += `${d} `;
      if (analysisFilled) area += `${d} L ${coordinate(run.at(-1).x, range.yMin)} L ${coordinate(run[0].x, range.yMin)} Z `;
      run = [];
    }
    for (const point of analysis) {
      if (!point || !Number.isFinite(point.x) || !Number.isFinite(point.y) || range.logX && point.x <= 0 || point.x < previousX) { finish(); continue; }
      previousX = point.x; run.push(point);
    }
    finish(); attribute(analysisPath, 'd', line.trim()); attribute(analysisFill, 'd', area.trim());
  }
  function renderMarkers() {
    markerLayer.replaceChildren();
    for (const marker of markers) {
      const x = screenX(marker.x);
      markerLayer.append(svgNode(document, 'line', { x1: x, x2: x, y1: padding.top, y2: height - padding.bottom }));
      const label = svgNode(document, 'text', { x: x + 5, y: padding.top + 12 }); label.textContent = marker.label ?? ''; markerLayer.append(label);
    }
    positionHead();
  }
  function positionHead() {
    head.hidden = playhead === undefined;
    if (playhead === undefined) head.setAttribute('hidden', '');
    else { head.removeAttribute('hidden'); const x = screenX(playhead); attribute(head, 'x1', x); attribute(head, 'x2', x); attribute(head, 'y1', padding.top); attribute(head, 'y2', height - padding.bottom); }
  }
  function render(all = false) {
    if (disposed) return;
    if (all) { renderGrid(); renderMarkers(); }
    renderPath(); renderAnalysis(); renderFields();
  }
  function pointLimits(index) {
    const x0 = index > 0 ? u(points[index - 1].x) + EPS * 2 : 0;
    const x1 = index < points.length - 1 ? u(points[index + 1].x) - EPS * 2 : 1;
    return x0 <= x1 ? { x0, x1 } : { x0: u(points[index].x), x1: u(points[index].x), frozen: true };
  }
  function movePoint(index, x, y, curve = points[index].curve) {
    const limits = pointLimits(index);
    const locked = lockEndpoints && (index === 0 || index === points.length - 1);
    x = clamp(x, range.xMin, range.xMax);
    if (index === 0 && Number.isFinite(options.fixedStartY)) y = options.fixedStartY;
    if (index === points.length - 1 && Number.isFinite(options.fixedEndY)) y = options.fixedEndY;
    points[index] = { ...points[index], x: locked || limits.frozen ? points[index].x : inverseX(clamp(u(x), limits.x0, limits.x1)),
      y: clamp(y, range.yMin, range.yMax), curve: clamp(curve ?? 0, -1, 1) };
  }
  function updateSelected(changes, commit = true) {
    if (disposed || selected === undefined || !points[selected] || !Object.values(changes).every(Number.isFinite)) return false;
    const before = copy(points); const point = points[selected];
    movePoint(selected, changes.x ?? point.x, changes.y ?? point.y, changes.curve ?? point.curve);
    if (equal(before, points)) { renderFields(); return false; }
    render(); announceSelection(); options.onPreview?.(copy(points));
    if (commit) options.onCommit?.(copy(points)); return true;
  }
  function select(index) {
    if (disposed) return;
    selected = Number.isInteger(index) && index >= 0 && index < points.length ? index : undefined;
    render(); announceSelection();
  }
  function addPoint(x, y) {
    if (disposed || !Number.isFinite(x) || !Number.isFinite(y)) return false;
    if (points.length >= maxPoints) { status.textContent = `最多${maxPoints}个点`; return false; }
    x = clamp(x, range.xMin, range.xMax); y = clamp(y, range.yMin, range.yMax);
    if (points.some(point => Math.abs(u(point.x) - u(x)) < EPS)) return false;
    const index = points.findIndex(point => point.x > x);
    selected = index < 0 ? points.length : index;
    points.splice(selected, 0, { x, y, curve: 0 }); render(); announceSelection();
    options.onPreview?.(copy(points)); options.onCommit?.(copy(points)); return true;
  }
  function deleteSelected() {
    if (disposed || selected === undefined || points.length <= 2 || lockEndpoints && (selected === 0 || selected === points.length - 1)) return false;
    points.splice(selected, 1); selected = Math.min(selected, points.length - 1); render(); announceSelection();
    options.onPreview?.(copy(points)); options.onCommit?.(copy(points)); return true;
  }
  function resizeCount(targetCount, live = false) {
    if (disposed || !Number.isInteger(targetCount)) { renderCountControls(); return false; }
    endPointer(undefined);
    const original = countGesture ?? { before: copy(points), selectedX: points[selected]?.x, protectedXs: [...protectedXs()] };
    targetCount = clamp(targetCount, minimumCount(original.before, original.protectedXs), maxPoints);
    const next = resizeCurve(original.before, targetCount, { logX: range.logX, maxPoints, protectedXs: original.protectedXs });
    if (live) countGesture = original;
    const changed = !equal(points, next);
    points = next;
    selected = original.selectedX === undefined ? undefined : points.findIndex(point => point.x === original.selectedX);
    if (selected === -1) selected = points.reduce((best, point, index) => Math.abs(u(point.x) - u(original.selectedX)) < Math.abs(u(points[best].x) - u(original.selectedX)) ? index : best, 0);
    render(); announceSelection();
    if (live) { if (changed) options.onPreview?.(copy(points)); }
    else { countGesture = undefined; if (changed) options.onCommit?.(copy(points)); }
    return changed;
  }
  function commitCount() {
    if (!countGesture) return;
    countGesture = undefined; options.onCommit?.(copy(points)); renderCountControls();
  }
  function cancelCount() {
    if (!countGesture) return;
    const previous = countGesture; countGesture = undefined; points = previous.before;
    selected = previous.selectedX === undefined ? undefined : points.findIndex(point => point.x === previous.selectedX);
    render(); announceSelection(); options.onPreview?.(copy(points)); options.onCancel?.(copy(points));
  }
  function viewReset() { if (disposed) return; view = { x0: 0, x1: 1, y0: 0, y1: 1 }; render(true); }
  function changeZoom(axis, factor, fraction) {
    if (disposed || gesture) return;
    const anchor = axis === 'x' ? view.x0 + fraction * (view.x1 - view.x0) : view.y0 + fraction * (view.y1 - view.y0);
    view = zoomCurveView(view, axis, factor, anchor); render(true);
  }
  function nearby(screen) {
    let found; let distance = 13 ** 2;
    for (let index = 0; index < points.length; index++) {
      const d = (screenX(points[index].x) - screen.x) ** 2 + (screenY(points[index].y) - screen.y) ** 2;
      if (d < distance) { found = index; distance = d; }
    }
    return found;
  }
  function pointerDown(event) {
    if (disposed || ![0, 1, 2].includes(event.button)) return;
    const at = local(event); const targetIndex = event.target?.getAttribute?.('data-index');
    const index = targetIndex !== null && targetIndex !== undefined ? Number(targetIndex) : nearby(at);
    if (event.button === 2) { event.preventDefault(); if (index !== undefined) { select(index); deleteSelected(); } return; }
    event.preventDefault(); svg.focus?.({ preventScroll: true });
    if (event.button === 1 || event.altKey) gesture = { kind: 'pan', id: event.pointerId, last: at };
    else if (index !== undefined) { select(index); gesture = { kind: 'point', id: event.pointerId, index, last: at, before: copy(points) }; }
    else { select(undefined); return; }
    svg.setPointerCapture?.(event.pointerId);
  }
  function pointerMove(event) {
    if (disposed || !gesture || event.pointerId !== gesture.id) return;
    event.preventDefault(); const at = local(event);
    const dx = (at.x - gesture.last.x) / plotWidth() * (view.x1 - view.x0);
    const dy = -(at.y - gesture.last.y) / plotHeight() * (view.y1 - view.y0);
    if (gesture.kind === 'pan') {
      const xSpan = view.x1 - view.x0; const ySpan = view.y1 - view.y0;
      view.x0 = clamp(view.x0 - dx, 0, 1 - xSpan); view.x1 = view.x0 + xSpan;
      view.y0 = clamp(view.y0 - dy, 0, 1 - ySpan); view.y1 = view.y0 + ySpan;
      render(true);
    } else {
      const point = points[gesture.index]; const precision = event.shiftKey ? .1 : 1;
      movePoint(gesture.index, inverseX(u(point.x) + dx * precision), inverseY(v(point.y) + dy * precision));
      render(); announceSelection(); options.onPreview?.(copy(points));
    }
    gesture.last = at;
  }
  function endPointer(event, cancel = false) {
    if (!gesture || event?.pointerId !== undefined && event.pointerId !== gesture.id) return;
    const previous = gesture; gesture = undefined;
    if (svg.hasPointerCapture?.(previous.id)) svg.releasePointerCapture(previous.id);
    if (previous.kind === 'point') {
      if (cancel) { points = previous.before; render(); announceSelection(); options.onPreview?.(copy(points)); options.onCancel?.(copy(points)); }
      else if (!equal(points, previous.before)) options.onCommit?.(copy(points));
    }
  }
  function doubleClick(event) {
    if (disposed) return; event.preventDefault(); const at = local(event);
    const existing = event.target?.getAttribute?.('data-index');
    if (existing !== null && existing !== undefined) { select(Number(existing)); if (!xField.disabled) xField.focus?.(); return; }
    if (at.x < padding.left || at.x > width - padding.right || at.y < padding.top || at.y > height - padding.bottom) return;
    const position = world(at); addPoint(inverseX(position.x), inverseY(position.y));
  }
  function wheel(event) {
    if (disposed) return; event.preventDefault(); if (gesture) return;
    const at = local(event); const position = world(at);
    if (event.shiftKey) {
      const span = view.x1 - view.x0; view.x0 = clamp(view.x0 + (event.deltaX || event.deltaY) / 700 * span, 0, 1 - span); view.x1 = view.x0 + span;
    } else {
      const axis = event.ctrlKey || event.metaKey ? 'y' : 'x';
      view = zoomCurveView(view, axis, Math.exp(-clamp(event.deltaY, -500, 500) * .002), axis === 'x' ? position.x : position.y);
    }
    render(true);
  }
  function keyboard(event) {
    if (disposed || event.target?.tagName?.toLowerCase() === 'input') return;
    if (event.key === 'Escape') { event.preventDefault(); endPointer(undefined, true); return; }
    if (event.key === 'Home') { event.preventDefault(); viewReset(); return; }
    if (event.key === 'Delete') { event.preventDefault(); deleteSelected(); return; }
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key) || selected === undefined) return;
    event.preventDefault(); event.stopPropagation();
    const precision = event.shiftKey ? .1 : 1; const point = points[selected];
    const dx = (view.x1 - view.x0) * .002 * precision; const dy = (view.y1 - view.y0) * .002 * precision;
    if (event.ctrlKey || event.metaKey) {
      const horizontal = event.key === 'ArrowLeft' || event.key === 'ArrowRight';
      const low = horizontal ? 'x0' : 'y0'; const high = horizontal ? 'x1' : 'y1'; const span = view[high] - view[low];
      const direction = event.key === 'ArrowLeft' || event.key === 'ArrowDown' ? -1 : 1;
      view[low] = clamp(view[low] + direction * span * .1, 0, 1 - span); view[high] = view[low] + span; render(true); return;
    }
    updateSelected({ x: inverseX(u(point.x) + (event.key === 'ArrowLeft' ? -dx : event.key === 'ArrowRight' ? dx : 0)),
      y: inverseY(v(point.y) + (event.key === 'ArrowDown' ? -dy : event.key === 'ArrowUp' ? dy : 0)) });
  }
  const pointerUp = event => endPointer(event);
  const pointerCancel = event => endPointer(event, true);
  const context = event => event.preventDefault();
  svg.addEventListener('pointerdown', pointerDown); svg.addEventListener('pointermove', pointerMove);
  svg.addEventListener('pointerup', pointerUp); svg.addEventListener('pointercancel', pointerCancel);
  svg.addEventListener('lostpointercapture', pointerCancel); svg.addEventListener('dblclick', doubleClick);
  svg.addEventListener('contextmenu', context); svg.addEventListener('wheel', wheel, { passive: false }); svg.addEventListener('keydown', keyboard);
  function resize() {
    if (disposed) return; const rect = svg.getBoundingClientRect();
    width = Math.max(320, rect.width || 900); height = Math.max(180, rect.height || 270);
    attribute(svg, 'viewBox', `0 0 ${width} ${height}`); render(true);
  }
  const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(resize) : undefined;
  observer?.observe(svg); resize(); announceSelection();
  function discardGesture() {
    const previous = gesture; gesture = undefined; numeric = undefined; countGesture = undefined;
    if (previous && svg.hasPointerCapture?.(previous.id)) svg.releasePointerCapture(previous.id);
  }
  const sameRange = (left, right) => ['xMin', 'xMax', 'yMin', 'yMax', 'logX'].every(key => left[key] === right[key]);
  return {
    element: root,
    setPoints(next, { preserveSelection = true } = {}) {
      const checked = normalizeCurvePoints(next, range, maxPoints);
      if (equal(checked, points)) return;
      discardGesture(); points = checked;
      selected = preserveSelection && selected !== undefined ? Math.min(selected, points.length - 1) : 0;
      render(); renderFields(true); announceSelection();
    },
    setRange(next) {
      const candidate = { ...range, ...next }; validateRange(candidate);
      if (sameRange(range, candidate)) return;
      // The caller owns duration/unit changes and must supply matching points.
      // Existing coordinates are preserved and checked, never silently scaled.
      normalizeCurvePoints(points, candidate, maxPoints); range = candidate; viewReset();
    },
    setData(next, nextRange = {}) {
      const candidate = { ...range, ...nextRange }; const checked = normalizeCurvePoints(next, candidate, maxPoints);
      const changedRange = !sameRange(range, candidate);
      if (!changedRange && equal(checked, points)) return;
      discardGesture(); range = candidate; points = checked;
      selected = selected === undefined ? 0 : Math.min(selected, points.length - 1);
      if (changedRange) viewReset(); else render();
      renderFields(true); announceSelection();
    },
    select,
    getSelected: () => selected === undefined ? undefined : ({ index: selected, point: { ...points[selected] } }),
    getPoints: () => copy(points),
    updateSelected,
    addPoint,
    deleteSelected,
    resizeCount,
    viewReset,
    setMarkers(next = []) {
      renderCountControls();
      const checked = next.filter(marker => Number.isFinite(marker.x)).map(marker => ({ ...marker }));
      if (checked.length === markers.length && checked.every((marker, index) => marker.x === markers[index].x && marker.label === markers[index].label)) return;
      markers = checked; renderMarkers();
    },
    setPlayhead(x) { playhead = Number.isFinite(x) ? x : undefined; positionHead(); },
    setAnalysis(points = [], { label = '实际输出', filled = false } = {}) {
      if (disposed) return;
      analysis = Array.isArray(points) ? points.slice(0, 4096) : []; analysisFilled = filled;
      if (analysisLegend.textContent !== label) { analysisLegend.textContent = label; analysisLegend.title = `${label}\n${analysisHint}`; }
      renderAnalysis();
    },
    destroy() {
      if (disposed) return; endPointer(undefined, true); cancelCount(); disposed = true; observer?.disconnect();
      svg.removeEventListener('pointerdown', pointerDown); svg.removeEventListener('pointermove', pointerMove);
      svg.removeEventListener('pointerup', pointerUp); svg.removeEventListener('pointercancel', pointerCancel);
      svg.removeEventListener('lostpointercapture', pointerCancel); svg.removeEventListener('dblclick', doubleClick);
      svg.removeEventListener('contextmenu', context); svg.removeEventListener('wheel', wheel); svg.removeEventListener('keydown', keyboard); root.remove();
    },
  };
}
