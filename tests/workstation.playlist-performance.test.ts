import assert from 'node:assert/strict';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { registerHooks } from 'node:module';
import { test } from 'node:test';
import type { ContentRecord, Draft } from '../src/workstation/contracts/content.ts';
import type { SongBody, SongEditorPort } from '../src/workstation/contracts/song.ts';
import type { SoundRuntimePort } from '../src/workstation/contracts/sound.ts';
import { createMaterialLibrary } from '../src/workstation/modules/materials/public.ts';
import { createPhrasePlayback } from '../src/workstation/modules/phrase/public.ts';
import { createSongEditor } from '../src/workstation/modules/song/public.ts';
import { createTimbreEditor, createTimbrePlayback } from '../src/workstation/modules/timbre/public.ts';

// Baseline mode loads the captured original at its real URL, preserving imports.
// It records operation counts, not browser frame rates or sound-device latency.
const baseline = process.env.ROOTSOUND_PLAYLIST_BASELINE === '1';
const hook = registerHooks({ load(url, context, next) {
  if (url.endsWith('.css')) return { format: 'module', source: '', shortCircuit: true };
  const result = next(url, context);
  if (baseline && url.endsWith('/ui-rendering/song-workspace.ts')) {
    return { ...result, source: readFileSync(new URL('../.test-output/playlist-performance/before-song-workspace.ts', import.meta.url), 'utf8') };
  }
  return result;
} });
const { mountSongWorkspace } = await import('../src/workstation/modules/ui-rendering/song-workspace.ts');
hook.deregister();

type Counts = { phrases: number; songReads: number; prepares: number; elements: number; replaces: number;
  rowReplaces: number; inspectorReplaces: number; styleWrites: number; layouts: number; frames: number };
const emptyCounts = (): Counts => ({ phrases: 0, songReads: 0, prepares: 0, elements: 0, replaces: 0,
  rowReplaces: 0, inspectorReplaces: 0, styleWrites: 0, layouts: 0, frames: 0 });
let counts = emptyCounts();
type FakeEvent = Record<string, unknown> & { target: Element; type: string; preventDefault(): void; stopPropagation(): void };

/** Same headless event model as playlist-ui.test.ts, with allocation/layout counters. */
class Element {
  tagName: string; className = ''; private text = ''; parentElement?: Element; children: Element[] = [];
  dataset: Record<string, string> = {}; attributes = new Map<string, string>();
  value = ''; hidden = false; disabled = false; isContentEditable = false; tabIndex = 0;
  private width = 1000; private height = 420; private captures = new Set<number>();
  private listeners = new Map<string, Array<(event: FakeEvent) => void>>();
  style: Record<string, string> = new Proxy({}, { set(target: Record<string, string>, key: string, value: string) {
    counts.styleWrites++; target[key] = value; return true;
  } });
  constructor(tag = 'div') { this.tagName = tag.toUpperCase(); counts.elements++; }
  get textContent() { return this.text; }
  set textContent(value: string) { this.text = value; for (const child of this.children) child.parentElement = undefined; this.children = []; }
  get clientWidth() { counts.layouts++; return this.width; } set clientWidth(value: number) { this.width = value; }
  get clientHeight() { counts.layouts++; return this.height; } set clientHeight(value: number) { this.height = value; }
  classList = {
    contains: (name: string) => this.className.split(' ').includes(name),
    add: (...names: string[]) => { this.className = [...new Set([...this.className.split(' ').filter(Boolean), ...names])].join(' '); },
    remove: (...names: string[]) => { this.className = this.className.split(' ').filter(name => !names.includes(name)).join(' '); },
    toggle: (name: string, force?: boolean) => { const enabled = force ?? !this.classList.contains(name); if (enabled) this.classList.add(name); else this.classList.remove(name); return enabled; },
  };
  append(...nodes: Element[]) { for (const node of nodes) { node.remove(); node.parentElement = this; this.children.push(node); } }
  replaceChildren(...nodes: Element[]) {
    counts.replaces++;
    if (this.classList.contains('song-row-controls')) counts.rowReplaces++;
    if (this.closest('.song-inspector')) counts.inspectorReplaces++;
    this.textContent = ''; this.append(...nodes);
  }
  remove() { if (this.parentElement) this.parentElement.children = this.parentElement.children.filter(child => child !== this); this.parentElement = undefined; }
  setAttribute(name: string, value: string) { this.attributes.set(name, value); }
  removeAttribute(name: string) { this.attributes.delete(name); }
  matches(selector: string): boolean {
    if (selector[0] === '.') return this.classList.contains(selector.slice(1));
    const match = /^([a-z][a-z0-9]*)(?:\[([^\]]+)\])?$/u.exec(selector);
    return !!match && this.tagName.toLowerCase() === match[1] && (!match[2] || this.attributes.has(match[2]));
  }
  closest<T = Element>(selector: string): T | undefined { let current: Element | undefined = this; while (current) { if (current.matches(selector)) return current as T; current = current.parentElement; } }
  querySelectorAll<T = Element>(selector: string): T[] { return this.children.flatMap(child => [...(child.matches(selector) ? [child as T] : []), ...child.querySelectorAll<T>(selector)]); }
  querySelector<T = Element>(selector: string): T | undefined { return this.querySelectorAll<T>(selector)[0]; }
  contains(other: Element): boolean { return other === this || this.children.some(child => child.contains(other)); }
  addEventListener(type: string, callback: (event: FakeEvent) => void) { this.listeners.set(type, [...this.listeners.get(type) ?? [], callback]); }
  removeEventListener(type: string, callback: (event: FakeEvent) => void) { this.listeners.set(type, (this.listeners.get(type) ?? []).filter(value => value !== callback)); }
  emit(type: string, values: Record<string, unknown> = {}) {
    const event = { type, target: this, pointerId: 1, button: 0, clientX: 0, clientY: 0,
      key: '', repeat: false, altKey: false, ctrlKey: false, metaKey: false, shiftKey: false,
      deltaX: 0, deltaY: 0, preventDefault() {}, stopPropagation() {}, ...values } as FakeEvent;
    for (const listener of this.listeners.get(type) ?? []) listener(event);
    return event;
  }
  getBoundingClientRect() {
    counts.layouts++; let left = 0; let top = this.classList.contains('song-timeline') ? 28 : 0;
    if (this.classList.contains('song-clip') || this.classList.contains('song-track') || this.classList.contains('song-row-control')) {
      left = Number.parseFloat(this.style.left ?? '0'); top = 28 + Number.parseFloat(this.style.top ?? '0');
      const xy = /translate\(([-.0-9]+)px, ([-.0-9]+)px\)/u.exec(this.style.transform ?? '');
      if (xy) { left += Number(xy[1]); top += Number(xy[2]); }
    }
    if (this.classList.contains('song-phrase-trash')) { left = 860; top = 35; }
    return { left, top, width: this.width, height: this.height, right: left + this.width, bottom: top + this.height };
  }
  setPointerCapture(id: number) { this.captures.add(id); } hasPointerCapture(id: number) { return this.captures.has(id); } releasePointerCapture(id: number) { this.captures.delete(id); }
  focus() { const doc = globalThis.document as unknown as Document; if (doc.activeElement !== this) doc.activeElement?.blur(); doc.activeElement = this; this.emit('focus'); }
  blur() { const doc = globalThis.document as unknown as Document; if (doc.activeElement === this) doc.activeElement = undefined; this.emit('blur'); }
  select() {}
  animate() {}
  showModal() { this.attributes.set('open', ''); } close() { this.attributes.delete('open'); this.emit('close'); }
}
class Input extends Element {} class Select extends Element {} class TextArea extends Element {}
class Document extends Element {
  activeElement?: Element;
  createElement(tag: string) { return tag === 'input' ? new Input(tag) : new Element(tag); }
  createElementNS(_namespace: string, tag: string) { return this.createElement(tag); }
}
function installDom() {
  const document = new Document('document'); const window = new Element('window');
  const frames = new Map<number, FrameRequestCallback>(); let frameId = 0;
  const timers: ReturnType<typeof setTimeout>[] = [];
  Object.assign(window, { setTimeout(callback: () => void, delay: number) { const timer = setTimeout(callback, delay); timer.unref(); timers.push(timer); return Number(timer); }, clearTimeout });
  const replacements = { document, window, HTMLElement: Element, HTMLInputElement: Input, HTMLSelectElement: Select,
    HTMLTextAreaElement: TextArea, Node: Element,
    requestAnimationFrame(callback: FrameRequestCallback) { frames.set(++frameId, callback); return frameId; },
    cancelAnimationFrame(id: number) { frames.delete(id); } };
  const previous = new Map<string, PropertyDescriptor | undefined>();
  for (const [key, value] of Object.entries(replacements)) { previous.set(key, Object.getOwnPropertyDescriptor(globalThis, key)); Object.defineProperty(globalThis, key, { configurable: true, writable: true, value }); }
  return { document, window, pendingFrames: () => frames.size,
    flushFrame() { const batch = [...frames.values()]; frames.clear(); for (const callback of batch) { counts.frames++; callback(performance.now()); } },
    restore() { timers.forEach(clearTimeout); frames.clear(); for (const [key, descriptor] of previous) { if (descriptor) Object.defineProperty(globalThis, key, descriptor); else Reflect.deleteProperty(globalThis, key); } } };
}
function fixture() {
  const environment = installDom(); const seed = createMaterialLibrary(); const timbre = createTimbreEditor(seed);
  const saved = timbre.save('new'); assert.equal(saved.status, 'saved'); if (saved.status !== 'saved') throw new Error('tone');
  const tone = saved.content;
  const records: ContentRecord[] = Array.from({ length: 225 }, (_, index) => ({
    id: 'phrase-' + index, kind: 'rootsound.phrase', owner: 'phrase', schemaVersion: 1, revision: 1,
    name: '乐句 ' + (index + 1), dependencies: [tone.id],
    body: { model: 'note-phrase', version: 1, timeUnit: 'beat', tempoBpm: 120, lengthBeats: 4,
      parts: [{ id: 'part-' + index, name: '钢琴', timbreId: tone.id, notes: Array.from({ length: index < 92 ? 24 : 23 }, (_, note) => ({
        id: 'note-' + index + '-' + note, startBeat: note / 6, durationBeats: .1, frequencyHz: 220 + index % 12 * 10, velocity: .6,
      })) }] },
  }));
  const body: SongBody = { model: 'phrase-arrangement', version: 1, timeUnit: 'beat', tempoBpm: 120, tempoMode: 'source',
    lengthBeats: 112, tracks: Array.from({ length: 17 }, (_, index) => ({ id: 'track-' + index, name: '行' + (index + 1),
      level: .8, pan: 0, muted: false, solo: false, clips: records.flatMap((record, clip) => clip % 17 === index
        ? [{ id: 'clip-' + clip, phraseId: record.id, startBeat: Math.floor(clip / 17) * 8 }] : []) })) };
  const draft: Draft = { id: 'song-draft', kind: 'rootsound.song', owner: 'song', schemaVersion: 1, name: '滚动回归',
    dependencies: records.map(record => record.id), body };
  const library = createMaterialLibrary();
  assert.equal(library.commitTransaction({ expectedToken: library.currentToken(), label: '性能回归样本',
    createContents: [tone, ...records], createDrafts: [draft] }).status, 'committed');
  const actual = createSongEditor(library, createPhrasePlayback(library, createTimbrePlayback(library)), { defaultTempoMode: 'source' });
  const song: SongEditorPort = { ...actual, read() { counts.songReads++; return actual.read(); },
    preparePreview() { counts.prepares++; return actual.preparePreview(); } };
  const shelf = records.map(record => ({ id: record.id, name: record.name, tempoBpm: 120, durationSeconds: 2 }));
  const edited: Array<{ trackId: string; clipId: string }> = [];
  const root = new Element('main');
  const runtime = { subscribe: () => () => {}, stopAll() {}, stop() {}, position: () => 0 } as unknown as SoundRuntimePort;
  const workspace = mountSongWorkspace(root as unknown as HTMLElement, { song, sound: runtime, onSound() {}, onPhrase() {}, onWelcome() {},
    projectName: () => '滚动回归', phrases() { counts.phrases++; return shelf.map(item => ({ ...item })); },
    onEditPhrase(ref) { edited.push(ref); }, renderEntities() { throw new Error('unused old rail'); } });
  const viewport = root.querySelector('.song-scroll')!; const content = root.querySelector('.song-timeline')!;
  content.clientHeight = 420; environment.flushFrame();
  return { ...environment, root, viewport, content, actual, workspace, edited, library,
    block(id: string) { return root.querySelectorAll('.song-clip').find(element => element.dataset.clipId === id); },
    row(id: string) { return root.querySelectorAll('.song-row-control').find(element => element.dataset.trackId === id); },
    cleanup() { workspace.dispose(); environment.restore(); } };
}
function resetCounts() { counts = emptyCounts(); }
function measure(action: () => void) { resetCounts(); const start = performance.now(); action(); return { ...counts, milliseconds: performance.now() - start }; }
function transfer(id: string) {
  const data = new Map([['application/x-rootsound-phrase', id]]);
  return { types: ['application/x-rootsound-phrase'], effectAllowed: '', dropEffect: '',
    getData(type: string) { return data.get(type) ?? ''; }, setData(type: string, value: string) { data.set(type, value); } };
}
function noMusicReads(value: Counts) {
  assert.equal(value.phrases, 0, 'viewport work must use one retained phrase metadata snapshot');
  assert.equal(value.songReads, 0, 'viewport work must not decode the song again');
  assert.equal(value.prepares, 0, 'viewport work must not prepare audio');
}

test('225-clip viewport scrolling reuses data, row controls and the selected console; repeated wheels coalesce', () => {
  const f = fixture(); try {
    assert.equal(f.actual.read().body!.tracks.length, 17);
    assert.equal(f.actual.read().body!.tracks.flatMap(track => track.clips).length, 225);
    const original = f.library.currentToken();
    f.viewport.emit('pointerdown', { target: f.block('clip-17')!, clientX: 410, clientY: 50 });
    f.document.emit('pointerup', { clientX: 410, clientY: 50 }); f.flushFrame();
    const row = f.row('track-0')!; const input = f.root.querySelector('.song-inspector-level')!.querySelector('input')!;
    const details = f.root.querySelector('.song-inspector-details');
    const wheel = measure(() => {
      for (let index = 0; index < 30; index++) f.viewport.emit('wheel', { deltaY: 1, clientX: 300, clientY: 60 });
      if (!baseline) assert.equal(f.pendingFrames(), 1, 'one viewport frame for the whole input burst');
      f.flushFrame();
    });
    if (!baseline) {
      noMusicReads(wheel); assert.equal(wheel.frames, 1);
      assert.equal(wheel.elements, 0, 'the same visible clips and grid need no new elements');
      assert.equal(wheel.rowReplaces, 0); assert.equal(wheel.inspectorReplaces, 0);
      assert.equal(f.row('track-0'), row); assert.equal(f.root.querySelector('.song-inspector-level')!.querySelector('input'), input);
      assert.equal(f.root.querySelector('.song-inspector-details'), details);
    }
    const arrowsAndZoom = measure(() => {
      for (let index = 0; index < 4; index++) {
        f.document.emit('keydown', { target: f.viewport, key: 'ArrowRight' }); f.flushFrame();
        f.document.emit('keydown', { target: f.viewport, key: 'ArrowLeft' }); f.flushFrame();
        f.document.emit('keydown', { target: f.viewport, key: 'ArrowRight', ctrlKey: true }); f.flushFrame();
        f.document.emit('keydown', { target: f.viewport, key: 'ArrowLeft', ctrlKey: true }); f.flushFrame();
      }
    });
    if (!baseline) { noMusicReads(arrowsAndZoom); assert.equal(f.row('track-0'), row); assert.equal(arrowsAndZoom.inspectorReplaces, 0); }
    const pan = measure(() => {
      f.viewport.emit('pointerdown', { target: f.content, clientX: 600, clientY: 400 });
      for (let index = 1; index <= 20; index++) f.document.emit('pointermove', { clientX: 600 - index, clientY: 400 });
      f.flushFrame(); f.document.emit('pointerup', { clientX: 580, clientY: 400 }); f.flushFrame();
    });
    if (!baseline) {
      noMusicReads(pan); assert.equal(pan.frames, 1); assert.equal(pan.rowReplaces, 0);
      assert(pan.inspectorReplaces <= 2, 'only initial deselection may clear the console, not each pan event');
    }
    assert.equal(f.library.currentToken(), original, 'panning, scrolling and zooming must never edit the song');
    if (process.env.ROOTSOUND_PLAYLIST_REPORT === '1') {
      const directory = new URL('../.test-output/playlist-performance/', import.meta.url);
      mkdirSync(directory, { recursive: true });
      writeFileSync(new URL((baseline ? 'before' : 'after') + '-ui.json', directory), JSON.stringify({
        mode: baseline ? 'captured-original' : 'current', headless: true, tracks: 17, clips: 225, phraseNotes: 5267,
        operations: { wheel, arrowsAndZoom, pan }, realBrowserFrameRateMeasured: false, soundDeviceOpened: false,
      }, null, 2) + '\n');
    }
  } finally { f.cleanup(); }
});

test('diagonal blank panning coalesces pointer input without music reads or writes even if content layout moves', { skip: baseline }, () => {
  const f = fixture(); try {
    const before = structuredClone(f.actual.read().draft), token = f.library.currentToken();
    const clock = f.root.querySelector('.song-clock')!.textContent;
    const originalX = Number.parseFloat(f.block('clip-17')!.style.left!);
    const bounds = f.content.getBoundingClientRect.bind(f.content); let layoutOffset = 0;
    f.content.getBoundingClientRect = () => { const rect = bounds(); return { ...rect, top: rect.top + layoutOffset, left: rect.left + layoutOffset }; };
    const pan = measure(() => {
      f.viewport.emit('pointerdown', { target: f.content, clientX: 600, clientY: 350 });
      layoutOffset = 37;
      for (let index = 1; index <= 20; index++) f.document.emit('pointermove', {
        clientX: 600 - index * 2, clientY: 350 - index * 2, shiftKey: index % 2 === 0,
      });
      assert.equal(f.pendingFrames(), 1); f.flushFrame();
      f.document.emit('pointerup', { clientX: 560, clientY: 310 }); f.flushFrame();
    });
    noMusicReads(pan); assert.equal(pan.frames, 1); assert.equal(pan.rowReplaces, 0);
    assert.equal(Number.parseFloat(f.block('clip-17')!.style.left!), originalX - 40);
    assert.equal(f.row('track-1')!.style.top, '20px');
    assert.equal(f.root.querySelector('.song-clock')!.textContent, clock);
    assert.equal(f.library.currentToken(), token); assert.deepEqual(f.actual.read().draft, before);
  } finally { f.cleanup(); }
});

test('virtualized rows and clips regain selection, double-click, drag and drop handlers after scrolling', () => {
  const f = fixture(); try {
    const originalRow = f.row('track-0');
    f.viewport.emit('wheel', { deltaY: 660, shiftKey: true, clientX: 200, clientY: 100 }); f.flushFrame();
    assert.equal(f.block('clip-0'), undefined, 'offscreen clips are not retained as visible DOM');
    const distant = f.block('clip-11')!; assert(distant);
    f.viewport.emit('pointerdown', { target: distant, clientX: 10, clientY: 50 });
    f.document.emit('pointerup', { clientX: 10, clientY: 50 }); f.flushFrame();
    assert.equal(f.block('clip-11')!.attributes.get('aria-pressed'), 'true');
    f.viewport.emit('dblclick', { target: f.block('clip-11')! });
    assert.deepEqual(f.edited.at(-1), { trackId: 'track-11', clipId: 'clip-11' });
    f.viewport.emit('wheel', { deltaY: -660, shiftKey: true, clientX: 200, clientY: 100 }); f.flushFrame();
    assert(f.block('clip-0'));
    if (!baseline) assert.equal(f.row('track-0'), originalRow, 'a row returning to view retains its controls and handlers');
    const data = transfer('phrase-0');
    resetCounts();
    for (let index = 0; index < 20; index++) f.viewport.emit('dragover', { dataTransfer: data, clientX: 231 + index, clientY: 50 });
    if (!baseline) assert.equal(f.pendingFrames(), 1, 'drag preview movement shares one viewport frame');
    f.flushFrame(); if (!baseline) noMusicReads(counts);
    assert(f.root.querySelector('.song-drop-preview'));
    const before = f.actual.read().body!.tracks.flatMap(track => track.clips).length;
    f.viewport.emit('drop', { dataTransfer: data, clientX: 250, clientY: 50 }); f.flushFrame();
    assert.equal(f.actual.read().body!.tracks.flatMap(track => track.clips).length, before + 1);
    const newClip = f.actual.read().body!.tracks[0]!.clips.at(-1)!;
    const block = f.block(newClip.id)!; assert(block);
    const expectedBeat = newClip.startBeat + 20 * 2 / Number.parseFloat(block.style.width!) * 2;
    f.viewport.emit('pointerdown', { target: block, clientX: 250, clientY: 50 });
    f.document.emit('pointermove', { clientX: 270, clientY: 50 }); f.flushFrame();
    f.document.emit('pointerup', { clientX: 270, clientY: 50 }); f.flushFrame();
    assert(Math.abs(f.actual.read().body!.tracks[0]!.clips.find(clip => clip.id === newClip.id)!.startBeat - expectedBeat) < 1e-8);
    f.viewport.emit('pointerdown', { target: f.row('track-0')!, clientX: -30, clientY: 50 });
    f.document.emit('pointerup', { clientX: -30, clientY: 50 }); f.flushFrame();
    assert.equal(f.root.querySelector('.song-inspector-name')?.value ?? f.root.querySelector('.song-inspector')!.querySelector('input')!.value, '行1');
    f.row('track-0')!.querySelector('.song-row-solo')!.emit('click'); f.flushFrame();
    assert.equal(f.actual.read().body!.tracks[0]!.solo, true, 'returned row buttons still act on their original row');
    f.viewport.emit('wheel', { deltaY: 1, clientX: 200, clientY: 50 });
    if (!baseline) assert.equal(f.pendingFrames(), 1);
    f.workspace.dispose();
    assert.equal(f.pendingFrames(), 0, 'disposing cancels pending viewport work');
  } finally { f.cleanup(); }
});

test('a cached offscreen row loses its old selection when another visible row is selected', () => {
  const f = fixture(); try {
    const first = f.row('track-0')!;
    f.viewport.emit('pointerdown', { target: first, clientX: -20, clientY: 50 });
    f.document.emit('pointerup', { clientX: -20, clientY: 50 }); f.flushFrame();
    assert(f.row('track-0')!.classList.contains('is-selected'));
    f.viewport.emit('wheel', { deltaY: 660, shiftKey: true, clientX: 200, clientY: 100 }); f.flushFrame();
    f.viewport.emit('pointerdown', { target: f.row('track-11')!, clientX: -20, clientY: 50 });
    f.document.emit('pointerup', { clientX: -20, clientY: 50 }); f.flushFrame();
    assert(f.row('track-11')!.classList.contains('is-selected'));
    f.viewport.emit('wheel', { deltaY: -660, shiftKey: true, clientX: 200, clientY: 100 }); f.flushFrame();
    assert.equal(f.row('track-0')!.classList.contains('is-selected'), false);
    if (!baseline) assert.equal(f.row('track-0'), first);
    assert.equal(f.root.querySelector('.song-inspector')!.querySelector('input')!.value, '行12');
  } finally { f.cleanup(); }
});

test('offscreen content refresh restores row metadata without reviving old clip selection', () => {
  const f = fixture(); try {
    f.viewport.emit('pointerdown', { target: f.block('clip-0')!, clientX: 10, clientY: 50 });
    f.document.emit('pointerup', { clientX: 10, clientY: 50 }); f.flushFrame();
    assert.equal(f.block('clip-0')!.attributes.get('aria-pressed'), 'true');
    f.viewport.emit('wheel', { deltaY: 660, shiftKey: true, clientX: 200, clientY: 100 }); f.flushFrame();
    f.viewport.emit('pointerdown', { target: f.block('clip-11')!, clientX: 10, clientY: 50 });
    f.document.emit('pointerup', { clientX: 10, clientY: 50 }); f.flushFrame();
    assert.equal(f.block('clip-11')!.attributes.get('aria-pressed'), 'true');
    f.actual.updateTrack('track-0', { name: '更新行', color: '#ff0000', solo: true, muted: true });
    f.workspace.refresh(); f.flushFrame();
    f.viewport.emit('wheel', { deltaY: -660, shiftKey: true, clientX: 200, clientY: 100 }); f.flushFrame();
    const row = f.row('track-0')!;
    assert.equal(row.querySelector('.song-row-name')!.value, '更新行');
    assert.equal(row.querySelector('.song-row-color')!.style.background, '#ff0000');
    assert.equal(row.querySelector('.song-row-solo')!.attributes.get('aria-pressed'), 'true');
    assert.equal(row.querySelector('.song-row-mute')!.attributes.get('aria-pressed'), 'true');
    assert.equal(f.block('clip-0')!.style.backgroundColor, '#ff0000');
    assert.equal(f.block('clip-0')!.attributes.get('aria-pressed'), 'false');
  } finally { f.cleanup(); }
});
