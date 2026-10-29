import assert from 'node:assert/strict';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { test } from 'node:test';
import { createDefaultPatch } from '../web/model.mjs';
import { densifyCurve } from '../web/curve-density.mjs';

// This intentionally uses no browser, audio device, worker or screen automation.
// It runs the real controller against the checked-in HTML and a small DOM seam.
class Element {
  constructor(document, tag) {
    this.ownerDocument = document; this.tagName = tag.toUpperCase(); this.children = [];
    this.attributes = new Map(); this.listeners = new Map(); this.dataset = {};
    this.className = ''; this.value = ''; this.textContent = ''; this.style = {};
    this.disabled = false; this.hidden = false; this.checked = false; this.captures = new Set();
    this.width = tag === 'canvas' ? 600 : 900; this.height = tag === 'canvas' ? 48 : 270;
  }
  append(...children) { for (const child of children) { child.remove(); child.parentElement = this; this.children.push(child); } }
  replaceChildren(...children) { for (const child of this.children) child.parentElement = undefined; this.children = []; this.append(...children); }
  remove() { if (this.parentElement) this.parentElement.children = this.parentElement.children.filter(child => child !== this); this.parentElement = undefined; }
  setAttribute(key, value) {
    value = String(value); this.attributes.set(key, value);
    if (key === 'id') this.id = value;
    if (key === 'class') this.className = value;
    if (key === 'value') this.value = value;
    if (key === 'hidden') this.hidden = true;
    if (key === 'open') this.open = true;
    if (key.startsWith('data-')) this.dataset[key.slice(5).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())] = value;
  }
  getAttribute(key) { return this.attributes.has(key) ? this.attributes.get(key) : null; }
  removeAttribute(key) { this.attributes.delete(key); }
  classList = {
    add: name => { if (!this.className.split(' ').includes(name)) this.className += ` ${name}`; },
    remove: name => { this.className = this.className.split(' ').filter(value => value !== name).join(' '); },
    toggle: (name, force) => { const enabled = force ?? !this.className.split(' ').includes(name); this.classList[enabled ? 'add' : 'remove'](name); return enabled; },
  };
  addEventListener(type, callback) { this.listeners.set(type, [...this.listeners.get(type) ?? [], callback]); }
  removeEventListener(type, callback) { this.listeners.set(type, (this.listeners.get(type) ?? []).filter(value => value !== callback)); }
  emit(type, extra = {}) {
    const event = { type, target: this, pointerId: 1, button: 0, clientX: 0, clientY: 0, deltaX: 0, deltaY: 0,
      shiftKey: false, ctrlKey: false, metaKey: false, altKey: false, key: '', code: '', repeat: false,
      preventDefault() { this.defaultPrevented = true; }, stopPropagation() { this.stopped = true; }, ...extra };
    let target = this;
    do { for (const callback of target.listeners.get(type) ?? []) callback(event); target = event.stopped ? undefined : target.parentElement; } while (target);
    return event;
  }
  querySelectorAll(selector) { return this.children.flatMap(child => [...(matches(child, selector) ? [child] : []), ...child.querySelectorAll(selector)]); }
  querySelector(selector) { return this.querySelectorAll(selector)[0] ?? null; }
  getBoundingClientRect() { return { left: 0, top: 0, width: this.width, height: this.height }; }
  focus() { this.ownerDocument.activeElement = this; }
  setPointerCapture(id) { this.captures.add(id); }
  hasPointerCapture(id) { return this.captures.has(id); }
  releasePointerCapture(id) { this.captures.delete(id); }
  getContext() { return { clearRect() {}, beginPath() {}, moveTo() {}, lineTo() {}, stroke() {} }; }
}
class Input extends Element {}
class Select extends Element {}
class TextArea extends Element {}
function matches(element, selector) {
  const tag = selector.match(/^[a-z]+/i)?.[0]; if (tag && element.tagName !== tag.toUpperCase()) return false;
  const className = selector.match(/\.([\w-]+)/)?.[1]; if (className && !element.className.split(' ').includes(className)) return false;
  const attr = selector.match(/\[([\w-]+)(?:=["']?([^\]"']+)["']?)?\]/);
  if (attr && (attr[1].startsWith('data-') ? element.dataset[attr[1].slice(5).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())] === undefined : !element.attributes.has(attr[1]))) return false;
  if (attr?.[2] && String(attr[1].startsWith('data-') ? element.dataset[attr[1].slice(5).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())] : element.getAttribute(attr[1])) !== attr[2]) return false;
  return true;
}
class Document extends Element {
  constructor() { super(undefined, 'document'); this.ownerDocument = this; this.hidden = false; }
  createElement(tag) { return new (tag === 'input' ? Input : tag === 'select' ? Select : tag === 'textarea' ? TextArea : Element)(this, tag); }
  createElementNS(_namespace, tag) { return this.createElement(tag); }
  createTextNode(text) { const node = this.createElement('#text'); node.textContent = text; return node; }
  getElementById(id) { return this.querySelectorAll('*').find(element => element.id === id) ?? null; }
}
function loadHtml(text) {
  const document = new Document(), stack = [document];
  const voids = new Set(['meta','link','input','br','hr']);
  for (const token of text.matchAll(/<\/?([\w-]+)([^>]*)>/g)) {
    const [raw, tag, attributeText] = token;
    if (raw.startsWith('</')) { if (stack.at(-1)?.tagName === tag.toUpperCase()) stack.pop(); continue; }
    const element = document.createElement(tag);
    for (const attribute of attributeText.matchAll(/([\w-]+)(?:="([^"]*)")?/g)) element.setAttribute(attribute[1], attribute[2] ?? '');
    stack.at(-1).append(element); if (!voids.has(tag) && !raw.endsWith('/>')) stack.push(element);
  }
  return document;
}
const settle = () => new Promise(resolve => setImmediate(resolve));

test('live samples reach all three real graph overlays and remain outside the saved patch', async () => {
  const html = await readFile(new URL('../web/index.html', import.meta.url), 'utf8');
  const document = loadHtml(html), window = new Element(document, 'window'), frames = new Map(), messages = [], listeners = [];
  let nextFrame = 0, contexts = 0, sounding = false, begun = 0;
  const context = { sampleRate: 48000, currentTime: 0, state: 'running', destination: {},
    audioWorklet: { addModule: async () => {} }, close: async () => {},
    createAnalyser: () => ({ connect() {}, disconnect() {},
      getFloatTimeDomainData(data) {
        for (let i = 0; i < data.length; i++) {
          const age = context.currentTime - begun - (data.length - i) / context.sampleRate;
          data[i] = sounding && age >= 0 ? .35 * Math.sin(2 * Math.PI * 440 * age) : 0;
        }
      },
      getFloatFrequencyData(data) { data.fill(-Infinity); if (sounding) data[Math.round(440 * 8192 / 48000)] = -12; },
    }),
  };
  const node = { connect() {}, disconnect() {}, port: { postMessage(message) {
    if (message.type === 'noteOn') { sounding = true; begun = context.currentTime; }
    if (message.type === 'allNotesOff' || message.type === 'noteOff') sounding = false;
  } } };
  const replacements = { document, window, HTMLInputElement: Input, HTMLSelectElement: Select, HTMLTextAreaElement: TextArea,
    confirm: () => true, requestAnimationFrame: callback => { const id = ++nextFrame; frames.set(id, callback); return id; },
    cancelAnimationFrame: id => frames.delete(id), AudioContext: class { constructor() { contexts++; return context; } },
    AudioWorkletNode: class { constructor() { return node; } },
    Worker: class { postMessage(message) { queueMicrotask(() => this.onmessage({ data: { id: message.id, type: 'prepared', prepared: {} } })); } terminate() {} },
    chrome: { webview: { addEventListener: (_type, listener) => listeners.push(listener), postMessage: request => {
      messages.push(request); const result = request.method === 'loadRecovery' ? { status: 'empty' } :
        request.method === 'savePatch' ? { status: 'saved' } : {};
      queueMicrotask(() => listeners.forEach(listener => listener({ data: { id: request.id, ok: true, result } })));
    } } },
  };
  const originals = new Map(Object.keys(replacements).map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  for (const [key, value] of Object.entries(replacements)) Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
  const id = name => document.getElementById(name);
  async function advance(time) {
    context.currentTime = time;
    const [frameId, callback] = frames.entries().next().value; frames.delete(frameId); callback(time * 1000); await settle();
  }
  function serialize(element) {
    if (element.tagName === 'SCRIPT') return '';
    const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;');
    const attrs = new Map(element.attributes); if (element.className) attrs.set('class', element.className);
    if (element.value && element.tagName === 'INPUT') attrs.set('value', element.value);
    if (element.disabled) attrs.set('disabled', ''); if (element.hidden) attrs.set('hidden', '');
    const tag = element.tagName.toLowerCase(); if (tag === 'svg') attrs.set('xmlns', 'http://www.w3.org/2000/svg');
    const opening = `<${tag}${[...attrs].map(([k, v]) => ` ${k}="${escape(v)}"`).join('')}>`;
    return opening + escape(element.textContent) + element.children.map(serialize).join('') + (['meta','link','input','br','hr'].includes(tag) ? '' : `</${tag}>`);
  }
  async function snapshot(name) {
    if (!process.env.SPECTRAL_ANALYSIS_ARTIFACTS) return;
    const directory = resolve(process.env.SPECTRAL_ANALYSIS_ARTIFACTS); await mkdir(directory, { recursive: true });
    const page = document.querySelector('html');
    await writeFile(join(directory, name + '.html'), '<!doctype html>' + serialize(page));
    await writeFile(join(directory, 'styles.css'), await readFile(new URL('../web/styles.css', import.meta.url)));
  }
  try {
    await import(new URL(`../web/app.mjs?live-analysis=${Date.now()}`, import.meta.url)); await settle();
    assert.equal(contexts, 0); assert.equal(id('spectrum-editor').querySelector('.curve-analysis-path').getAttribute('d'), '');
    id('preview-button').emit('click'); await settle(); await settle();
    for (let time = .04; time < .35; time += .04) await advance(time);
    assert.equal(contexts, 1);
    assert(id('spectrum-editor').querySelector('.curve-analysis-path').getAttribute('d').includes('L '));
    assert(id('envelope-editor').querySelector('.curve-analysis-path').getAttribute('d').includes('L '));
    assert.match(id('envelope-editor').querySelector('.curve-analysis-legend').textContent, /实际输出峰值/);
    assert.equal(id('spectrum-editor').querySelectorAll('.curve-point').length, 6);
    await snapshot('amplitude-overlay');
    document.querySelector('[data-envelope="pitch"]').emit('click');
    const path = id('envelope-editor').querySelector('.curve-analysis-path');
    assert(path.getAttribute('d').includes('L '));
    assert.match(id('envelope-editor').querySelector('.curve-analysis-legend').textContent, /440.*相对 C4/);
    await snapshot('pitch-overlay');
    const retained = path.getAttribute('d'); id('stop-audio').emit('click'); await advance(.4);
    assert.equal(path.getAttribute('d'), retained);
    id('save-patch').emit('click'); await settle();
    const saved = JSON.parse(messages.filter(m => m.method === 'savePatch').at(-1).payload.text);
    assert.deepEqual(saved, createDefaultPatch(), 'All measurements are transient UI state');
  } finally {
    window.emit('beforeunload'); await settle();
    for (const [key, descriptor] of originals) { if (descriptor) Object.defineProperty(globalThis, key, descriptor); else delete globalThis[key]; }
  }
});

test('real app starts, edits curves and parameters, undoes, and monitors without devices or per-frame patch cloning', async () => {
  const html = await readFile(new URL('../web/index.html', import.meta.url), 'utf8');
  const document = loadHtml(html), window = new Element(document, 'window');
  const messages = [], listeners = [], frames = new Map(), responses = new Map(); let nextFrame = 0, cloneCount = 0, deviceCount = 0;
  const originalClone = globalThis.structuredClone;
  const replacements = { document, window, HTMLInputElement: Input, HTMLSelectElement: Select, HTMLTextAreaElement: TextArea,
    confirm: () => true,
    requestAnimationFrame: callback => { const id = ++nextFrame; frames.set(id, callback); return id; },
    cancelAnimationFrame: id => frames.delete(id),
    structuredClone: value => { if (value?.format === 'RootSoundSpectralPatch') cloneCount++; return originalClone(value); },
    AudioContext: class { constructor() { deviceCount++; throw new Error('Opening an audio device is forbidden in this test'); } },
    Worker: class { constructor() { deviceCount++; throw new Error('Creating an audio worker is forbidden in this test'); } },
    chrome: { webview: { addEventListener: (_name, listener) => listeners.push(listener), postMessage: request => {
      messages.push(request);
      const result = responses.has(request.method) ? responses.get(request.method)
        : request.method === 'getInfo' ? { outputDirectory: 'test-output' }
        : request.method === 'loadRecovery' ? { status: 'empty' }
        : request.method === 'savePatch' ? { status: 'saved' } : { status: 'updated' };
      queueMicrotask(() => { for (const listener of listeners) listener({ data: result instanceof Error
        ? { id: request.id, ok: false, error: result.message } : { id: request.id, ok: true, result } }); });
    } } },
  };
  const originals = new Map(Object.keys(replacements).map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  for (const [key, value] of Object.entries(replacements)) Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
  const id = name => { const element = document.getElementById(name); assert(element, `Missing #${name}`); return element; };
  const label = name => document.querySelectorAll('input').find(input => input.getAttribute('aria-label') === name);
  const captureSavedPatch = async () => {
    const count = messages.filter(message => message.method === 'savePatch').length;
    id('save-patch').emit('click'); await settle();
    const saves = messages.filter(message => message.method === 'savePatch');
    assert.equal(saves.length, count + 1, 'The real controller must submit a new save snapshot');
    return JSON.parse(saves.at(-1).payload.text);
  };
  try {
    await import(new URL(`../web/app.mjs?smoke=${Date.now()}`, import.meta.url)); await settle();
    assert.equal(document.querySelectorAll('.oscillator-card').length, 4);
    assert.equal(id('piano').children.length, 24);
    const initialPatch = createDefaultPatch();
    assert.equal(id('spectrum-editor').querySelectorAll('.curve-point').length, 6);
    assert(messages.some(message => message.method === 'getInfo')); assert(messages.some(message => message.method === 'loadRecovery'));
    assert.equal(id('status').className.includes('is-error'), false); assert.equal(deviceCount, 0);

    const level = label('音量'); assert(level); level.value = '.4'; level.emit('input'); level.emit('change');
    assert.equal(id('dirty-mark').textContent, '未保存'); assert.equal(id('undo').disabled, false);
    id('undo').emit('click'); assert.equal(label('音量').value, '0.7'); assert.equal(id('dirty-mark').textContent, '');
    id('redo').emit('click'); assert.equal(label('音量').value, '0.4');

    const pitchTab = document.querySelector('[data-envelope="pitch"]'); pitchTab.emit('click');
    assert.equal(pitchTab.getAttribute('aria-selected'), 'true'); assert(id('envelope-editor').querySelector('.curve-pitch'));
    const ampTab = document.querySelector('[data-envelope="amplitude"]'); ampTab.emit('click');
    assert.equal(id('envelope-editor').querySelectorAll('.curve-point').length, 6);
    const point = id('envelope-editor').querySelectorAll('.curve-point')[initialPatch.amplitude.sustainIndex];
    id('envelope-editor').querySelector('.curve-svg').emit('pointerdown', { target: point, clientX: Number(point.getAttribute('cx')), clientY: Number(point.getAttribute('cy')) });
    id('envelope-editor').querySelector('.curve-svg').emit('pointermove', { clientX: Number(point.getAttribute('cx')) + 30, clientY: Number(point.getAttribute('cy')) });
    id('envelope-editor').querySelector('.curve-svg').emit('pointerup');
    assert(id('envelope-summary').textContent.includes('持续点'));

    const cloneBefore = cloneCount;
    for (let frame = 0; frame < 120; frame++) { const [frameId, callback] = frames.entries().next().value; frames.delete(frameId); callback(frame * 16); }
    assert.equal(cloneCount, cloneBefore, 'The monitor must use cached patch data rather than cloning the whole patch every animation frame');
    assert.equal(deviceCount, 0); assert.equal(frames.size, 1);

    const y = id('spectrum-editor').querySelector('.curve-point-y');
    y.value = '-3'; y.emit('input'); y.emit('keydown', { key: 's', ctrlKey: true }); await settle();
    const saved = messages.filter(message => message.method === 'savePatch').at(-1); assert(saved, 'Ctrl+S inside precise curve fields must reach the app');
    const snapshot = JSON.parse(saved.payload.text);
    assert.equal(snapshot.spectrum.points[0].y, -3);
    assert.equal(snapshot.amplitude.sustainIndex, initialPatch.amplitude.sustainIndex, 'Dragging the sustain point must preserve its identity');
    assert(snapshot.amplitude.points[snapshot.amplitude.sustainIndex].x > .24, 'The selected sustain point moved continuously');
    assert.equal(id('dirty-mark').textContent, '');

    const beforeDensity = await captureSavedPatch();
    const countSlider = id('envelope-editor').querySelector('.curve-count-slider');
    assert(countSlider); assert.equal(countSlider.min, '3'); assert.equal(countSlider.max, '10');
    for (const count of [9,4,10]) { countSlider.value = String(count); countSlider.emit('input'); }
    countSlider.emit('change');
    assert.equal(id('envelope-editor').querySelectorAll('.curve-point').length, 10);
    const afterDensity = await captureSavedPatch();
    assert.deepEqual(afterDensity.amplitude.points[afterDensity.amplitude.sustainIndex],
      afterDensity.amplitude.points.find(point => point.x === beforeDensity.amplitude.points[beforeDensity.amplitude.sustainIndex].x));
    assert.equal(afterDensity.amplitude.points[afterDensity.amplitude.sustainIndex].x, beforeDensity.amplitude.points[beforeDensity.amplitude.sustainIndex].x);
    id('undo').emit('click'); assert.deepEqual(await captureSavedPatch(), beforeDensity, 'Moving the count slider is exactly one undoable edit');
    id('redo').emit('click'); assert.deepEqual(await captureSavedPatch(), afterDensity);

    // Failed document replacement must leave the patch and its undo/redo stack
    // usable; inspect actual save payloads rather than only the displayed name.
    async function verifyReplacementFailure(action, expectedError) {
      const beforeRename = await captureSavedPatch();
      id('patch-name').value = `保留编辑-${action}`; id('patch-name').emit('change');
      const beforeFailure = await captureSavedPatch();
      assert.equal(id('undo').disabled, false);
      id(action).emit('click'); await settle();
      assert(id('status').className.includes('is-error'), `${action} must report the replacement failure`);
      assert.match(id('status').textContent, expectedError);
      assert.equal(id('undo').disabled, false, `${action} must retain the undo stack`);
      assert.deepEqual(await captureSavedPatch(), beforeFailure, `${action} must preserve every current patch parameter`);
      id('undo').emit('click');
      assert.deepEqual(await captureSavedPatch(), beforeRename, `${action} must leave the previous edit undoable`);
      id('redo').emit('click');
      assert.deepEqual(await captureSavedPatch(), beforeFailure, `${action} must leave the previous edit redoable`);
    }

    const invalidExternal = originalClone(snapshot);
    invalidExternal.name = '不应打开的极近频谱点';
    invalidExternal.spectrum.points = [{ x: 20, y: 0, curve: 0 }, { x: 20 + 1e-9, y: 1, curve: 0 }, { x: 20000, y: 0, curve: 0 }];
    responses.set('openPatch', { status: 'opened', text: JSON.stringify(invalidExternal) });
    const clearCount = messages.filter(message => message.method === 'clearRecovery').length;
    await verifyReplacementFailure('open-patch', /曲线|横坐标|重合|间距/);
    assert.equal(messages.filter(message => message.method === 'clearRecovery').length, clearCount,
      'An invalid external curve must fail validation before recovery data is touched');

    responses.set('clearRecovery', new Error('Recovery cleanup unavailable'));
    await verifyReplacementFailure('new-patch', /Recovery cleanup unavailable/);
    const validExternal = originalClone(snapshot); validExternal.name = '不应替换的外部音色'; validExternal.oscillators[0].level = .17;
    responses.set('openPatch', { status: 'opened', text: JSON.stringify(validExternal) });
    const clearBeforeOpen = messages.filter(message => message.method === 'clearRecovery').length;
    await verifyReplacementFailure('open-patch', /Recovery cleanup unavailable/);
    assert.equal(messages.filter(message => message.method === 'clearRecovery').length, clearBeforeOpen + 1,
      'A valid external patch reaches the failing recovery operation without replacing the current document');

    responses.delete('clearRecovery');
    const legacy = originalClone(snapshot);
    legacy.spectrum.points = densifyCurve(legacy.spectrum.points, 64, { logX: true });
    for (const kind of ['amplitude','pitch']) {
      const sustainX = legacy[kind].points[legacy[kind].sustainIndex].x;
      legacy[kind].points = densifyCurve(legacy[kind].points, 32);
      legacy[kind].sustainIndex = legacy[kind].points.findIndex(point => point.x === sustainX);
    }
    responses.set('openPatch', { status: 'opened', text: JSON.stringify(legacy) });
    const savesBeforeImport = messages.filter(message => message.method === 'savePatch').length;
    id('open-patch').emit('click'); await settle();
    assert.equal(id('status').className.includes('is-error'), false);
    assert.equal(id('spectrum-editor').querySelectorAll('.curve-point').length, 10);
    assert.equal(id('envelope-editor').querySelectorAll('.curve-point').length, 10);
    assert.equal(messages.filter(message => message.method === 'savePatch').length, savesBeforeImport, 'Importing a legacy patch does not overwrite its file');
    const converted = await captureSavedPatch();
    assert.equal(converted.amplitude.points[converted.amplitude.sustainIndex].x, legacy.amplitude.points[legacy.amplitude.sustainIndex].x);
    assert.equal(deviceCount, 0);
  } finally {
    for (const listener of listeners) listener({ data: { event: 'beforeClose' } });
    window.emit('beforeunload'); await settle();
    for (const [key, descriptor] of originals) { if (descriptor) Object.defineProperty(globalThis, key, descriptor); else delete globalThis[key]; }
  }
});
