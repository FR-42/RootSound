import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createCurveEditor, curveFactor, curveTransform, curveUntransform, curveValue,
  normalizeCurvePoints, zoomCurveView } from '../web/curve-editor.mjs';

class Element {
  constructor(document, tag) {
    this.ownerDocument = document; this.tagName = tag.toUpperCase(); this.children = [];
    this.attributes = new Map(); this.listeners = new Map(); this.captures = new Set();
    this.className = ''; this.value = ''; this.disabled = false; this.hidden = false;
    this.style = {}; this.width = 900; this.height = 270; this.textContent = '';
  }
  append(...children) { for (const child of children) { child.remove(); child.parentElement = this; this.children.push(child); } }
  replaceChildren(...children) { for (const child of this.children) child.parentElement = undefined; this.children = []; this.append(...children); }
  remove() { if (this.parentElement) this.parentElement.children = this.parentElement.children.filter(child => child !== this); this.parentElement = undefined; }
  setAttribute(key, value) { this.attributes.set(key, String(value)); if (key === 'class') this.className = String(value); }
  getAttribute(key) { return this.attributes.has(key) ? this.attributes.get(key) : null; }
  removeAttribute(key) { this.attributes.delete(key); }
  classList = { add: name => { if (!this.className.split(' ').includes(name)) this.className += ` ${name}`; },
    remove: name => { this.className = this.className.split(' ').filter(value => value !== name).join(' '); } };
  addEventListener(type, callback) { this.listeners.set(type, [...this.listeners.get(type) ?? [], callback]); }
  removeEventListener(type, callback) { this.listeners.set(type, (this.listeners.get(type) ?? []).filter(value => value !== callback)); }
  emit(type, extra = {}) {
    const event = { type, target: this, pointerId: 1, button: 0, clientX: 0, clientY: 0, deltaX: 0, deltaY: 0,
      shiftKey: false, ctrlKey: false, metaKey: false, altKey: false, key: '',
      preventDefault() { this.defaultPrevented = true; }, stopPropagation() {}, ...extra };
    for (const callback of this.listeners.get(type) ?? []) callback(event); return event;
  }
  getBoundingClientRect() { return { left: 0, top: 0, width: this.width, height: this.height }; }
  focus() { this.ownerDocument.activeElement = this; }
  setPointerCapture(id) { this.captures.add(id); }
  hasPointerCapture(id) { return this.captures.has(id); }
  releasePointerCapture(id) { this.captures.delete(id); }
  find(className) { return this.findAll(className)[0]; }
  findAll(className) { return this.children.flatMap(child => [...(child.className.split(' ').includes(className) ? [child] : []), ...child.findAll(className)]); }
}
class Document {
  created = 0;
  createElement(tag) { this.created++; return new Element(this, tag); }
  createElementNS(_namespace, tag) { return this.createElement(tag); }
}
function fixture(options = {}) {
  const document = new Document(); const container = document.createElement('main');
  const previews = []; const commits = []; const cancels = []; const selections = [];
  const editor = createCurveEditor(container, { kind: 'amplitude', label: '音量包络', xMin: 0, xMax: 1, yMin: 0, yMax: 1,
    points: [{ x: 0, y: 0 }, { x: .5, y: .8 }, { x: 1, y: 0 }],
    onPreview: value => previews.push(value), onCommit: value => commits.push(value), onCancel: value => cancels.push(value),
    onSelect: (index, point) => selections.push({ index, point }), ...options });
  return { document, container, editor, previews, commits, cancels, selections, svg: container.find('curve-svg') };
}
const close = (a, b, epsilon = 1e-8) => assert(Math.abs(a - b) < epsilon, `${a} != ${b}`);

test('measured overlays are read-only, gap-aware and reuse their DOM nodes', () => {
  const f = fixture(), before = f.editor.getPoints();
  const line = f.container.find('curve-analysis-path'), created = f.document.created;
  f.editor.setAnalysis([{ x: 0, y: .2 }, { x: .2, y: .4 }, { x: .3, y: null }, { x: .5, y: .3 }], { label: '实际输出', filled: true });
  const data = line.getAttribute('d'); assert.equal((data.match(/M /g) ?? []).length, 2);
  assert(!/NaN|Infinity/.test(data)); assert(f.container.find('curve-analysis-fill').getAttribute('d').includes('Z'));
  for (let i = 0; i < 30; i++) f.editor.setAnalysis([{ x: .1, y: i / 100 }, { x: .9, y: .1 }]);
  assert.equal(f.document.created, created); assert.deepEqual(f.editor.getPoints(), before);
  assert.equal(f.previews.length, 0); assert.equal(f.commits.length, 0);
  assert.equal(f.container.find('curve-analysis').getAttribute('pointer-events'), 'none');
  f.editor.destroy();
});

test('measured coordinates follow logarithmic zoom and never change the editable curve', () => {
  const f = fixture({ kind: 'spectrum', xMin: 20, xMax: 20000, yMin: -96, yMax: 24, logX: true,
    points: [{ x: 20, y: 0 }, { x: 20000, y: 0 }] });
  f.editor.setAnalysis([{ x: 200, y: -12 }, { x: 2000, y: -30 }]);
  const line = f.container.find('curve-analysis-path'), first = line.getAttribute('d');
  const coordinates = first.match(/-?\d+(?:\.\d+)?/g).map(Number);
  close(coordinates[0], 54 + 828 / 3, .01);
  const before = f.editor.getPoints(); f.svg.emit('wheel', { clientX: 450, clientY: 100, deltaY: -150 });
  assert.notEqual(line.getAttribute('d'), first); assert.deepEqual(f.editor.getPoints(), before);
  f.editor.viewReset(); assert.equal(line.getAttribute('d'), first); f.editor.destroy();
});

test('curve interpolation uses logarithmic frequency coordinates and matching signed curvature', () => {
  close(curveTransform(200, 20, 20000, true), 1 / 3);
  close(curveUntransform(1 / 3, 20, 20000, true), 200);
  for (const bend of [-1, -.3, 0, .4, 1]) {
    close(curveFactor(0, bend), 0); close(curveFactor(1, bend), 1);
    let previous = -1;
    for (let i = 0; i <= 100; i++) { const value = curveFactor(i / 100, bend); assert(value >= previous); previous = value; }
  }
  assert(curveFactor(.5, .5) < .5); assert(curveFactor(.5, -.5) > .5);
  close(curveValue([{ x: 20, y: -20 }, { x: 2000, y: 0 }], 200, true), -10);
  close(curveValue([{ x: 0, y: 0, curve: .5 }, { x: 1, y: 1 }], .5), .5 ** 5);
});

test('point validation supports 512 precise points and rejects overlap, bad ranges and non-finite values atomically', () => {
  const range = { xMin: 0, xMax: 1, yMin: 0, yMax: 1 };
  const many = Array.from({ length: 512 }, (_, index) => ({ x: index / 511, y: .5, curve: 0 }));
  assert.equal(normalizeCurvePoints(many, range).length, 512);
  assert.throws(() => normalizeCurvePoints([...many, { x: 1, y: 1 }], range), /曲线/);
  for (const bad of [NaN, Infinity, -Infinity]) assert.throws(() => normalizeCurvePoints([{ x: 0, y: 0 }, { x: 1, y: bad }], range));
  assert.throws(() => normalizeCurvePoints([{ x: 0, y: 0 }, { x: 0, y: 1 }], range), /重合/);
  assert.throws(() => normalizeCurvePoints(many, { ...range, xMin: 0, logX: true }), /范围/);
  const f = fixture();
  const before = f.editor.getPoints();
  assert.throws(() => f.editor.setPoints([{ x: 0, y: 0 }, { x: NaN, y: .5 }]), /无效/);
  assert.deepEqual(f.editor.getPoints(), before); f.editor.destroy();
});

test('a drag previews continuously, preserves all other points and commits one history operation', () => {
  const f = fixture(); const before = f.editor.getPoints(); const circle = f.container.findAll('curve-point')[1];
  const x = Number(circle.getAttribute('cx')); const y = Number(circle.getAttribute('cy'));
  f.svg.emit('pointerdown', { target: circle, clientX: x, clientY: y });
  for (let i = 1; i <= 20; i++) f.svg.emit('pointermove', { clientX: x + i, clientY: y - i / 4 });
  assert.equal(f.commits.length, 0); assert.equal(f.previews.length, 20);
  f.svg.emit('pointerup'); assert.equal(f.commits.length, 1);
  const after = f.editor.getPoints(); assert(after[1].x > before[1].x); assert(after[1].y > before[1].y);
  assert.deepEqual(after[0], before[0]); assert.deepEqual(after[2], before[2]);
  assert.equal(f.svg.captures.size, 0); f.editor.destroy();
});

test('Shift precision can be engaged during dragging without jumping and pointer cancellation restores preview', () => {
  const f = fixture(); const before = f.editor.getPoints(); const circle = f.container.findAll('curve-point')[1];
  const x = Number(circle.getAttribute('cx')); const y = Number(circle.getAttribute('cy'));
  f.svg.emit('pointerdown', { target: circle, clientX: x, clientY: y });
  f.svg.emit('pointermove', { clientX: x + 10, clientY: y });
  const first = f.editor.getPoints()[1].x;
  f.svg.emit('pointermove', { clientX: x + 20, clientY: y, shiftKey: true });
  const second = f.editor.getPoints()[1].x;
  close(second - first, (first - before[1].x) * .1);
  f.svg.emit('pointercancel'); assert.deepEqual(f.editor.getPoints(), before);
  assert.equal(f.commits.length, 0); assert.equal(f.cancels.length, 1); assert.equal(f.svg.captures.size, 0);
  f.editor.destroy();
});

test('point editing never crosses neighbours, keeps locked endpoints, and supports precise numerical entry', () => {
  const f = fixture({ kind: 'spectrum', label: '频谱', xMin: 20, xMax: 20000, yMin: -72, yMax: 24,
    points: [{ x: 20, y: 0 }, { x: 1000, y: -8 }, { x: 20000, y: 0 }], logX: true });
  f.editor.select(1); f.editor.updateSelected({ x: -123, y: -200 });
  const moved = f.editor.getSelected().point; assert(Number.isFinite(moved.x)); assert(moved.x > 20); assert.equal(moved.y, -72);
  const input = f.container.find('curve-point-x'); input.focus(); input.value = '1234.56789'; input.emit('input');
  close(f.editor.getSelected().point.x, 1234.56789, 1e-6);
  const commitsBefore = f.commits.length; input.emit('change'); input.emit('blur');
  assert.equal(f.commits.length, commitsBefore + 1);
  f.editor.select(0); assert.equal(f.editor.updateSelected({ x: 100, y: -3 }), true);
  assert.equal(f.editor.getSelected().point.x, 20); assert.equal(f.editor.deleteSelected(), false);
  f.editor.select(2); f.editor.updateSelected({ x: 2000 }); assert.equal(f.editor.getSelected().point.x, 20000);
  f.editor.destroy();
});

test('add/delete, fixed end amplitude and atomic point/range changes retain valid ordered data', () => {
  const f = fixture({ fixedEndY: 0 });
  assert.equal(f.editor.addPoint(.75, .3), true); assert.equal(f.editor.getPoints().length, 4);
  assert.equal(f.editor.addPoint(.75, .8), false);
  assert.equal(f.editor.deleteSelected(), true); assert.equal(f.editor.getPoints().length, 3);
  f.editor.select(2); f.editor.updateSelected({ y: .8 }); assert.equal(f.editor.getSelected().point.y, 0);
  f.editor.setData([{ x: 0, y: 0 }, { x: .1, y: .6 }, { x: .2, y: 0 }], { xMax: .2 });
  assert.equal(f.editor.getPoints().at(-1).x, .2);
  assert.throws(() => f.editor.setRange({ xMax: .15 }), /范围/);
  assert.equal(f.editor.getPoints().at(-1).x, .2); f.editor.destroy();
});

test('zoom and pan preserve the sound points; playhead animation does not rebuild curves or markers', () => {
  const f = fixture(); const before = f.editor.getPoints();
  const circle = f.container.findAll('curve-point')[0]; const previousX = circle.getAttribute('cx');
  f.svg.emit('wheel', { deltaY: -250, clientX: 450, clientY: 130 });
  assert.notEqual(circle.getAttribute('cx'), previousX); assert.deepEqual(f.editor.getPoints(), before);
  f.svg.emit('pointerdown', { button: 1, clientX: 450, clientY: 130 });
  f.svg.emit('pointermove', { clientX: 420, clientY: 130 }); f.svg.emit('pointerup');
  assert.deepEqual(f.editor.getPoints(), before); assert.equal(f.commits.length, 0);
  f.editor.setMarkers([{ x: .5, label: '保持' }]);
  const marker = f.container.find('curve-markers').children[0]; const created = f.document.created;
  for (let i = 0; i < 120; i++) f.editor.setPlayhead(i / 120);
  assert.equal(f.document.created, created); assert.equal(f.container.find('curve-markers').children[0], marker);
  f.editor.viewReset(); assert.deepEqual(f.editor.getPoints(), before); f.editor.destroy();
});

test('ten-point editor retains point nodes during live changes and stops receiving events after disposal', () => {
  const points = Array.from({ length: 10 }, (_, i) => ({ x: i / 9, y: .4, curve: 0 }));
  const f = fixture({ points });
  const nodes = f.container.findAll('curve-point'); assert.equal(nodes.length, 10);
  f.editor.select(5); const created = f.document.created;
  for (let i = 0; i < 30; i++) f.editor.updateSelected({ y: .4 + i / 1000 }, false);
  assert.equal(f.document.created, created);
  assert.equal(f.container.findAll('curve-point')[0], nodes[0]);
  assert.equal(f.container.findAll('curve-point')[9], nodes[9]);
  const previews = f.previews.length; f.editor.destroy();
  f.svg.emit('dblclick', { clientX: 200, clientY: 150 }); assert.equal(f.previews.length, previews);
  assert.equal(f.container.children.length, 0);
});

test('view zoom remains bounded and keyboard steps permit fine edits without modifying endpoints', () => {
  const full = { x0: 0, x1: 1, y0: 0, y1: 1 };
  const zoomed = zoomCurveView(full, 'x', 4, .25);
  close((.25 - zoomed.x0) / (zoomed.x1 - zoomed.x0), .25);
  assert.deepEqual(zoomCurveView(zoomed, 'x', .001, .25), full);
  const f = fixture(); f.editor.select(1); const before = f.editor.getSelected().point;
  f.svg.emit('keydown', { key: 'ArrowRight', shiftKey: true });
  close(f.editor.getSelected().point.x - before.x, .0002);
  f.svg.emit('keydown', { key: 'Delete' }); assert.equal(f.editor.getPoints().length, 2);
  f.editor.select(0); f.svg.emit('keydown', { key: 'Delete' }); assert.equal(f.editor.getPoints().length, 2);
  f.editor.destroy();
});

test('controller preview echoes do not interrupt captured drags or reset zoom; external changes release capture', () => {
  let f;
  f = fixture({ onPreview(points) { f.previews.push(points); f.editor.setData(points, { xMin: 0, xMax: 1, yMin: 0, yMax: 1 }); } });
  f.svg.emit('wheel', { deltaY: -200, clientX: 450, clientY: 130 });
  const first = f.container.findAll('curve-point')[0]; const left = first.getAttribute('cx');
  const circle = f.container.findAll('curve-point')[1];
  const x = Number(circle.getAttribute('cx')); const y = Number(circle.getAttribute('cy'));
  f.svg.emit('pointerdown', { target: circle, clientX: x, clientY: y });
  for (let i = 1; i <= 10; i++) f.svg.emit('pointermove', { clientX: x + i, clientY: y });
  assert.equal(f.previews.length, 10); assert.equal(f.svg.captures.size, 1);
  assert.equal(first.getAttribute('cx'), left, 'point-data echoes preserve the current zoom');
  f.svg.emit('pointerup'); assert.equal(f.commits.length, 1);
  f.svg.emit('pointerdown', { target: circle, clientX: x, clientY: y });
  f.editor.setData([{ x: 0, y: 0 }, { x: .4, y: .6 }, { x: 1, y: 0 }]);
  assert.equal(f.svg.captures.size, 0);
  f.svg.emit('pointerup'); assert.equal(f.commits.length, 1); f.editor.destroy();
});

test('nearly adjacent valid points cannot cross through pointer or numeric updates', () => {
  const f = fixture({ points: [{ x: 0, y: 0 }, { x: .5, y: .3 }, { x: .500000015, y: .5 }, { x: .50000003, y: .7 }, { x: 1, y: 0 }] });
  f.editor.select(2); const before = f.editor.getSelected().point.x;
  f.editor.updateSelected({ x: .8, y: .8 });
  assert.equal(f.editor.getSelected().point.x, before);
  assert.doesNotThrow(() => f.editor.setPoints(f.editor.getPoints()));
  f.editor.destroy();
});

test('numeric fields keep local edits contained but let the controller receive its save shortcut', () => {
  const f = fixture(); const input = f.container.find('curve-point-y');
  for (const key of ['Enter', 'Escape', 'ArrowUp']) {
    let stopped = false; input.emit('keydown', { key, stopPropagation() { stopped = true; } }); assert.equal(stopped, true);
  }
  for (const modifier of ['ctrlKey', 'metaKey']) {
    let stopped = false; const event = input.emit('keydown', { key: 's', [modifier]: true, stopPropagation() { stopped = true; } });
    assert.equal(stopped, false); assert.equal(event.defaultPrevented, undefined);
  }
  f.editor.destroy();
});

test('the count slider previews from the gesture origin, preserves sustain, and commits once', () => {
  let f;
  f = fixture({ getProtectedXs: () => [.5], onPreview(points) {
    f.previews.push(points); f.editor.setData(points, { xMin: 0, xMax: 1, yMin: 0, yMax: 1 });
  } });
  f.editor.select(1); const slider = f.container.find('curve-count-slider');
  assert.equal(slider.min, '3'); assert.equal(slider.max, '10');
  for (const count of [10,4,8]) { slider.value = String(count); slider.emit('input'); assert.equal(f.editor.getPoints().length, count); }
  assert.equal(f.commits.length, 0); assert.equal(f.previews.length, 3);
  slider.emit('change'); slider.emit('blur'); assert.equal(f.commits.length, 1);
  assert.equal(f.editor.getSelected().point.x, .5); assert.equal(f.editor.getSelected().point.y, .8);
  assert.equal(f.editor.resizeCount(10), true); assert.equal(f.editor.getPoints().length, 10);
  assert.equal(f.editor.addPoint(.07, .2), false); assert.equal(f.editor.resizeCount(999), false);
  assert.equal(f.editor.resizeCount(2), true); assert.equal(f.editor.getPoints().length, 3);
  f.editor.destroy();
});

test('count slider cancellation and returning to the original count restore exact original data', () => {
  const f = fixture(); const original = f.editor.getPoints(), slider = f.container.find('curve-count-slider');
  for (const count of [10,5,3]) { slider.value = String(count); slider.emit('input'); }
  assert.deepEqual(f.editor.getPoints(), original); slider.emit('change');
  slider.value = '9'; slider.emit('input'); slider.emit('keydown', { key: 'Escape' });
  assert.deepEqual(f.editor.getPoints(), original); assert.equal(f.cancels.length, 1);
  slider.emit('change'); assert.equal(f.commits.length, 1); f.editor.destroy();
});
