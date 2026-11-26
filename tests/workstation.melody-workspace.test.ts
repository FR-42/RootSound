import assert from 'node:assert/strict';
import type { PhraseEditorViewport } from '../src/workstation/modules/ui-rendering/phrase-editor-viewport.ts';
import test from 'node:test';
import { registerHooks } from 'node:module';
import { writeMidi } from 'midi-file';
import { readMusicFile } from '../src/workstation/app/music-file.ts';
import type { PhraseBody, PhraseView } from '../src/workstation/contracts/phrase.ts';
import type { PlayableNotePlan, SoundRuntimePort } from '../src/workstation/contracts/sound.ts';
import { createMaterialLibrary } from '../src/workstation/modules/materials/public.ts';
import { createPhraseEditor } from '../src/workstation/modules/phrase/public.ts';
import { createTimbreEditor, createTimbrePlayback, prepareImportedTimbre, readEditableTimbreBody } from '../src/workstation/modules/timbre/public.ts';
import { createDefaultPatch } from '../src/workstation/modules/timbre/spectral/model.mjs';
import { clampMelodyView, melodyGrid, melodyNoteRect, melodyScale, melodyTimeAt, zoomMelody } from '../src/workstation/modules/ui-rendering/melody-geometry.ts';
import { attachEdgeGesture } from '../src/workstation/modules/ui-rendering/pointer-gestures.ts';
import { attachConsoleHorizontalWheel } from '../src/workstation/modules/ui-rendering/console-scroll.ts';
const hook = registerHooks({ load(url, context, next) { return url.endsWith('.css') ? { format: 'module', source: '', shortCircuit: true } : next(url, context); } });
const { mountMelodyWorkspace } = await import('../src/workstation/modules/ui-rendering/melody-workspace.ts');
const { mountSynthWorkspace } = await import('../src/workstation/modules/ui-rendering/synth-workspace.ts'); hook.deregister();

type Event = Record<string, unknown> & { type: string; target: Element; preventDefault(): void; stopPropagation(): void };
class Element {
  tagName: string; className = ''; private text = ''; children: Element[] = []; parentElement?: Element;
  style: Record<string, string> & { setProperty(key: string, value: string): void } = Object.assign(Object.create(null), { setProperty: (key: string, value: string) => { this.style[key] = value; } });
  dataset: Record<string, string> = {}; attributes = new Map<string, string>(); value = ''; hidden = false; disabled = false; tabIndex = 0; scrollTop = 0; scrollLeft = 0; scrollWidth = 800; type = '';
  private measuredWidth = 800; layoutReads = 0; clientHeight = 400; private captures = new Set<number>(); private listeners = new Map<string, Array<(event: Event) => void>>();
  get clientWidth() { this.layoutReads++; return this.measuredWidth; }
  set clientWidth(value: number) { this.measuredWidth = value; }
  constructor(tag = 'div') { this.tagName = tag.toUpperCase(); }
  set textContent(value: string) { this.text = value; this.children.forEach(child => { child.parentElement = undefined; }); this.children = []; }
  get textContent() { return this.text; }
  classList = {
    contains: (name: string) => this.className.split(' ').includes(name),
    add: (...names: string[]) => { this.className = [...new Set([...this.className.split(' ').filter(Boolean), ...names])].join(' '); },
    remove: (...names: string[]) => { this.className = this.className.split(' ').filter(name => !names.includes(name)).join(' '); },
    toggle: (name: string, value?: boolean) => { const on = value ?? !this.classList.contains(name); if (on) this.classList.add(name); else this.classList.remove(name); return on; },
  };
  append(...nodes: Element[]) { nodes.forEach(child => { child.remove(); child.parentElement = this; this.children.push(child); }); }
  get firstElementChild() { return this.children[0]; }
  get lastElementChild() { return this.children.at(-1); }
  get childElementCount() { return this.children.length; }
  insertBefore(child: Element, before: Element | null) {
    if (child === before) return;
    child.remove(); child.parentElement = this;
    this.children.splice(before ? this.children.indexOf(before) : this.children.length, 0, child);
  }
  replaceChildren(...nodes: Element[]) { this.textContent = ''; this.append(...nodes); }
  prepend(child: Element) { child.remove(); child.parentElement = this; this.children.unshift(child); }
  remove() { if (this.parentElement) this.parentElement.children = this.parentElement.children.filter(child => child !== this); this.parentElement = undefined; }
  contains(other: Element): boolean { return other === this || this.children.some(child => child.contains(other)); }
  setAttribute(name: string, value: string) { this.attributes.set(name, value); }
  removeAttribute(name: string) { this.attributes.delete(name); }
  matches(selector: string): boolean { if (selector === '.melody-note:not(.is-dim)') return this.classList.contains('melody-note') && !this.classList.contains('is-dim'); if (selector[0] === '.') return this.classList.contains(selector.slice(1)); const match = /^([a-z]+)(?:\[([^\]]+)\])?$/u.exec(selector); return !!match && this.tagName.toLowerCase() === match[1] && (!match[2] || this.attributes.has(match[2])); }
  closest<T = Element>(selector: string): T | undefined { let item: Element | undefined = this; while (item) { if (item.matches(selector)) return item as T; item = item.parentElement; } }
  querySelectorAll(selector: string): Element[] { return this.children.flatMap(child => [...(child.matches(selector) ? [child] : []), ...child.querySelectorAll(selector)]); }
  querySelector(selector: string) { return this.querySelectorAll(selector)[0]; }
  addEventListener(type: string, callback: (event: Event) => void) { this.listeners.set(type, [...this.listeners.get(type) ?? [], callback]); }
  removeEventListener(type: string, callback: (event: Event) => void) { this.listeners.set(type, (this.listeners.get(type) ?? []).filter(value => value !== callback)); }
  emit(type: string, values: Record<string, unknown> = {}) { const event = { type, target: this, pointerId: 1, clientX: 0, clientY: 0, button: 0, altKey: false, shiftKey: false, ctrlKey: false, metaKey: false, key: '', repeat: false, deltaX: 0, deltaY: 0, preventDefault() {}, stopPropagation() {}, ...values } as Event; for (const listener of this.listeners.get(type) ?? []) listener(event); return event; }
  click() { this.emit('click'); }
  dispatchEvent(event: { type: string; detail?: unknown }) { this.emit(event.type, { detail: event.detail }); return true; }
  setPointerCapture(id: number) { this.captures.add(id); } hasPointerCapture(id: number) { return this.captures.has(id); } releasePointerCapture(id: number) { this.captures.delete(id); }
  focus() { (globalThis.document as unknown as Document).activeElement = this; }
  showModal() { this.attributes.set('open', ''); } close() { this.attributes.delete('open'); this.emit('close'); }
  getBoundingClientRect() {
    let left = 212; let top = 100; let width = this.clientWidth; let height = this.clientHeight;
    if (this.classList.contains('melody-library-card')) {
      const index = this.parentElement?.children.indexOf(this) ?? 0;
      left = 20 + index % 2 * 120; top = 50 + Math.floor(index / 2) * 44; width = 110; height = 36;
    } else if (this.classList.contains('melody-note')) {
      const scroll = this.closest('.melody-workspace')?.querySelector('.melody-scroll');
      left += Number.parseFloat(this.style.left ?? '0'); top += Number.parseFloat(this.style.top ?? '0') - (scroll?.scrollTop ?? 0); width = Number.parseFloat(this.style.width ?? '0'); height = Number.parseFloat(this.style.height ?? '0');
    }
    return { left, right: left + width, top, bottom: top + height, width, height };
  }
}
class Input extends Element {} class Select extends Element {} class TextArea extends Element {}
class Document extends Element {
  activeElement?: Element;
  documentElement = new Element('html');
  createElement(tag: string) { return tag === 'input' ? new Input(tag) : tag === 'select' ? new Select(tag) : new Element(tag); }
  createElementNS(_namespace: string, tag: string) { return new Element(tag); }
  dispatchEvent(event: { type: string; detail?: unknown }) { this.emit(event.type, { detail: event.detail }); return true; }
}
function dom() {
  const document = new Document(); const window = new Element(); const desktopHost = new EventTarget(); const timers: ReturnType<typeof setTimeout>[] = [];
  const frames = new Map<number, FrameRequestCallback>(); let frameId = 0;
  Object.assign(window, { chrome: { webview: desktopHost }, innerWidth: 1000, innerHeight: 640, setTimeout(callback: () => void, delay: number) { const timer = setTimeout(callback, delay); timer.unref(); timers.push(timer); return Number(timer); }, clearTimeout });
  const values = { document, window, requestAnimationFrame: (callback: FrameRequestCallback) => { frames.set(++frameId, callback); return frameId; }, cancelAnimationFrame: (id: number) => { frames.delete(id); }, HTMLElement: Element, HTMLInputElement: Input, HTMLSelectElement: Select, HTMLTextAreaElement: TextArea };
  const previous = new Map<string, PropertyDescriptor | undefined>(); for (const [key, value] of Object.entries(values)) { previous.set(key, Object.getOwnPropertyDescriptor(globalThis, key)); Object.defineProperty(globalThis, key, { value, writable: true, configurable: true }); }
  return { document, window, desktopHost, flushFrames() { const pending = [...frames]; frames.clear(); for (const [, callback] of pending) callback(performance.now()); }, restore() { timers.forEach(clearTimeout); frames.clear(); for (const [key, descriptor] of previous) if (descriptor) Object.defineProperty(globalThis, key, descriptor); else Reflect.deleteProperty(globalThis, key); } };
}
async function settle() { for (let index = 0; index < 10; index++) await Promise.resolve(); }
function fixture(config: { desktopPointerUx?: boolean; windowsPalette?: boolean; voices?: number; notes?: boolean; placeholder?: boolean; customized?: boolean; fixedGridBpm?: boolean; initialViewport?: PhraseEditorViewport; performance?: boolean; confirmDeletion?: boolean; includeAllSections?: boolean; legacyRhythm?: boolean; onImportTimbre?(): Promise<boolean>; onReorderTimbres?(id: string, targetIndex: number): void; onRemoveTimbre?(id: string): void } = {}) {
  const environment = dom();
  if (config.windowsPalette) environment.document.documentElement.classList.add('windows-desktop-colors');
  const library = createMaterialLibrary(); const timbre = createTimbreEditor(library); const voices: Array<{ id: string; name: string; requiresDeleteConfirmation?: boolean }> = [];
  for (let index = 0; index < (config.voices ?? 2); index++) { if (index) timbre.create(); timbre.rename(config.placeholder && !index ? '乐句 1 音色' : `音色 ${index + 1}`); if (config.customized) timbre.setLevel(.4); const saved = timbre.save('new'); if (saved.status !== 'saved') throw new Error('voice'); voices.push(saved.content); }
  if (config.confirmDeletion) for (const voice of voices) voice.requiresDeleteConfirmation = true;
  const phrase = createPhraseEditor(library, createTimbrePlayback(library)); phrase.create(voices[0]!.id); phrase.rename('乐句 1'); phrase.setLength(16); const partId = phrase.read().body!.parts[0]!.id;
  if (config.notes) phrase.addNote(partId, { startBeat: 2, durationBeats: 1, durationSeconds: .5, frequencyHz: 440, velocity: .75 });
  const legacyRhythmId = config.legacyRhythm ? phrase.addPart(voices[1]!.id, 'rhythm') : undefined;
  if (legacyRhythmId) phrase.addNote(legacyRhythmId, { startBeat: 4, durationBeats: .5, durationSeconds: .17, frequencyHz: 220, velocity: .6, pan: -.2 });
  const beforeMount = phrase.read().draft; const tokenBeforeMount = library.currentToken();
  const root = new Element('main'); const previews: Array<PhraseBody | undefined> = []; const auditions: PlayableNotePlan[] = []; const seeks: number[] = []; let changes = 0; let lastChange: PhraseView | undefined; const viewports: PhraseEditorViewport[] = [];
  const sound = { async audition(plan: PlayableNotePlan) { auditions.push(plan); }, cancelAudition() {} } as unknown as SoundRuntimePort;
  let settingsOpen = false;
  const playbackFamilies: Array<string | undefined> = [];
  const workspace = mountMelodyWorkspace(root as unknown as HTMLElement, { phrase, sound, gridBpm: () => config.fixedGridBpm ? 120 : phrase.read().body!.tempoBpm,
    initialViewport: config.initialViewport, includeAllSections: config.includeAllSections,
    orientation: config.desktopPointerUx ? 'vertical' : undefined, desktopPointerUx: config.desktopPointerUx, onViewportChange(value) { viewports.push(value); }, readPerformanceMode: () => !!config.performance,
    editorSettings: config.desktopPointerUx ? { isOpen: () => settingsOpen, setOpen: open => { settingsOpen = open; workspace.settingsVisibilityChanged(); } } : undefined,
    onImportTimbre: config.onImportTimbre, onPlaybackFamilyChange(id) { playbackFamilies.push(id); },
    onReorderTimbres: config.onReorderTimbres, onRemoveTimbre: config.onRemoveTimbre,
    onPreview(value) { previews.push(value); }, onChange(view) { changes++; lastChange = view; }, onSeek(value) { seeks.push(value); }, listTimbres: () => voices,
    onAddTimbre(id) { return phrase.read().body!.parts.find(value => value.timbreId === id)?.id ?? phrase.addPart(id); } });
  const scroll = root.querySelector('.melody-scroll')!; const canvas = root.querySelector('.melody-canvas')!;
  function pointAt(beat: number, frequency = 440) { const keys = phrase.keyboard().slice().reverse(); const row = keys.findIndex(key => Math.abs(key.frequencyHz - frequency) < .01); return { clientX: 212 + beat * 50, clientY: 100 + row * 24 + 12 - scroll.scrollTop }; }
  function openTones() {
    if (config.desktopPointerUx && !root.querySelector('.melody-workspace')!.classList.contains('is-tone-shelf-open'))
      root.querySelector('.melody-tone-shortcut')!.emit('click');
  }
  function selectTone(id = partId) { openTones(); root.querySelectorAll('.melody-tone').find(value => value.dataset.partId === id)!.emit('click'); }
  function block(id: string) { return root.querySelectorAll('.melody-note').find(value => value.dataset.noteId === id)!; }
  return { ...environment, root, library, phrase, workspace, previews, auditions, seeks, voices, scroll, canvas, partId, legacyRhythmId, beforeMount, tokenBeforeMount, selectTone, openTones, settingsOpen: () => settingsOpen, pointAt, block, viewports, playbackFamilies, changes: () => changes,
    lastChange: () => lastChange, cleanup() { workspace.dispose(); environment.restore(); } };
}

test('hover solos immediately, overrides the pinned tone and restores it without changing the score', () => {
  const f=fixture({desktopPointerUx:true,notes:true,legacyRhythm:true,includeAllSections:true});
  try {
    const main=f.root.querySelector('.melody-main')!;
    const hover=(id?:string)=>{
      const target=id ? f.root.querySelectorAll('.melody-note-family').find(card=>card.dataset.partId===id)! : f.canvas;
      main.emit('pointermove',{target,pointerType:'mouse',clientX:500,clientY:500,buttons:0});
    };
    f.openTones();hover(f.legacyRhythmId!);assert.equal(f.playbackFamilies.at(-1),f.legacyRhythmId);
    hover();assert.equal(f.playbackFamilies.at(-1),undefined);
    f.selectTone();assert.equal(f.playbackFamilies.at(-1),f.partId);
    const score=f.phrase.read().body,changes=f.changes(),previews=f.previews.length;
    for(let i=0;i<30;i++){hover(f.legacyRhythmId!);assert.equal(f.playbackFamilies.at(-1),f.legacyRhythmId);hover();assert.equal(f.playbackFamilies.at(-1),f.partId);}
    assert.equal(f.changes(),changes);assert.equal(f.previews.length,previews);assert.deepEqual(f.phrase.read().body,score);
    hover(f.legacyRhythmId!);f.root.querySelector('.melody-tone-shortcut')!.emit('click');
    assert.equal(f.playbackFamilies.at(-1),f.partId);
    f.selectTone();assert.equal(f.playbackFamilies.at(-1),undefined);
    f.openTones();hover(f.legacyRhythmId!);main.emit('pointerleave');assert.equal(f.playbackFamilies.at(-1),undefined);
  } finally { f.cleanup(); }
});

test('desktop pans above time zero, preserves the zoom anchor and never draws notes in the leading margin', () => {
  const f=fixture({desktopPointerUx:true,notes:true,initialViewport:{leftSeconds:0,zoom:2,top:1300,rowHeight:24}});
  try {
    const before=f.phrase.read().body;
    f.scroll.emit('wheel',{target:f.canvas,deltaY:-120,clientX:500,clientY:260});
    assert(f.workspace.readViewport().leftSeconds<0);
    f.scroll.emit('wheel',{target:f.canvas,deltaY:-80,ctrlKey:true,clientX:500,clientY:260});
    assert(f.workspace.readViewport().leftSeconds<0);
    const view=f.workspace.readViewport();assert(view.leftSeconds>=-4/view.zoom);
    f.selectTone();
    f.scroll.emit('wheel',{target:f.canvas,deltaY:100,clientX:500,clientY:101});
    assert.deepEqual(f.phrase.read().body,before);
  } finally { f.cleanup(); }
});

test('the bottom edge requires a fast fresh approach and rejects held keys', t => {
  const f = dom(), target = new Element();
  let time = 1000, opens = 0;
  t.mock.method(performance, 'now', () => time);
  const edge = attachEdgeGesture(target as unknown as HTMLElement, 'bottom', {
    enabled: () => true, open() { opens++; },
  });
  function move(y: number, delay = 250) {
    time += delay;
    f.desktopHost.dispatchEvent(new MessageEvent('message', {
      data: { type: 'rootsound-pointer', x: .5, y, pressed: false, held: false },
    }));
  }
  try {
    move(.96); move(1, 80);
    assert.equal(opens, 0);
    move(.8, 16); move(.94, 16);
    assert.equal(opens, 0);
    move(1, 16);
    assert.equal(opens, 1);
    move(1.05); move(1);
    assert.equal(opens, 1);
    f.document.emit('keydown', { code: 'KeyA', key: 'a' });
    move(.8, 16); move(1, 16);
    assert.equal(opens, 1);
    f.document.emit('keyup', { code: 'KeyA', key: 'a' });
    move(1, 16);
    assert.equal(opens, 1);
    move(.9, 16); move(1, 16);
    assert.equal(opens, 2);
  } finally { edge.dispose(); f.restore(); }
});

test('the native left edge filters slow arrival and preserves active drags', t => {
  let time = 1000;
  t.mock.method(performance, 'now', () => time);
  const f = fixture({ desktopPointerUx: true });
  const page = f.root.querySelector('.melody-workspace')!;
  const open = () => page.classList.contains('is-tone-shelf-open');
  function move(x: number, delay: number, held = false) {
    time += delay;
    f.desktopHost.dispatchEvent(new MessageEvent('message', {
      data: { type: 'rootsound-pointer', x, y: .5, clientX: x, clientY: .5, dx: 0, dy: 0, pressed: false, held },
    }));
  }
  try {
    move(.04, 20); move(0, 600); assert(!open());
    move(.2, 20); move(0, 10); assert(open());
    move(.2, 20); move(0, 10); assert(!open());
    move(.2, 20); move(0, 10, true); assert(!open());
    move(0, 10); assert(!open());
    move(.2, 20); move(.02, 20); assert(!open());
    move(0, 10); assert(open());
  } finally { f.cleanup(); }
});

test('left and right contacts toggle their views without a cooldown', t => {
  let time = 1000;
  t.mock.method(performance, 'now', () => time);
  t.mock.method(Date, 'now', () => time);
  const f = fixture({ desktopPointerUx: true });
  const page = f.root.querySelector('.melody-workspace')!;
  const open = () => page.classList.contains('is-tone-shelf-open');
  const pulses: string[] = [];
  for (const edge of f.root.querySelectorAll('.melody-tone-edge')) {
    Object.assign(edge, { animate() { pulses.push(edge.classList.contains('is-left') ? 'left' : 'right'); } });
  }
  const move = (x: number, dx: number, delay = 20, held = false) => {
    time += delay;
    f.desktopHost.dispatchEvent(new MessageEvent('message', {
      data: { type: 'rootsound-pointer', x, y: .6, clientX: x, clientY: .6, dx, dy: 0, pressed: false, held },
    }));
  };
  try {
    move(.22, 0);
    move(.14, -80, 220);
    move(.04, -100, 195);
    move(.04, 0);
    assert(!open()); assert.deepEqual(pulses, []);

    move(.51, 410);
    move(0, -470, 60, true);
    assert(!open()); assert.deepEqual(pulses, []);
    move(.50, 400);
    move(0, -460, 45);
    assert(open()); assert.deepEqual(pulses, ['left']);

    move(.50, 460, 1);
    move(1, 460, 1);
    assert(f.settingsOpen()); assert(!open()); assert.deepEqual(pulses, ['left', 'right']);
    assert.equal(f.root.querySelectorAll('.melody-tone-edge')[1]!.style['--tone-edge-y'], '60%');

    move(.50, -460, 1000);
    move(0, -460);
    assert(f.settingsOpen()); assert(!open()); assert.deepEqual(pulses, ['left', 'right']);

    move(.50, 460);
    move(1, 460);
    assert(!f.settingsOpen()); assert(open()); assert.deepEqual(pulses, ['left', 'right', 'right']);
  } finally { f.cleanup(); }
});

test('staying against the edge only toggles once with position panning off', t => {
  let time = 1000;
  t.mock.method(performance, 'now', () => time);
  t.mock.method(Date, 'now', () => time);
  const f = fixture({ desktopPointerUx: true });
  const page = f.root.querySelector('.melody-workspace')!;
  const open = () => page.classList.contains('is-tone-shelf-open');
  const push = (x: number, dx: number, delay = 16) => {
    time += delay;
    f.desktopHost.dispatchEvent(new MessageEvent('message', {
      data: { type: 'rootsound-pointer', x, y: .5, clientX: x, clientY: .5, dx, dy: 0, pressed: false, held: false },
    }));
  };
  try {
    f.scroll.emit('pointerdown', { target: f.canvas, pointerType: 'mouse', button: 1, buttons: 4, clientX: 500, clientY: 320 });
    f.document.emit('pointerup', { target: f.canvas, pointerType: 'mouse', button: 1, buttons: 0 });
    push(.5, 0);
    push(0, -500);
    assert(open());
    for (let index = 0; index < 7; index++) {
      push(0, -25, 90);
      assert(open());
    }
    push(.50, 500);
    push(0, -500);
    assert(!open());
  } finally { f.cleanup(); }
});

test('browser edge contact after wheel input opens details once', t => {
  let time = 1000;
  t.mock.method(performance, 'now', () => time);
  const f = fixture({ desktopPointerUx: true });
  const main = f.root.querySelector('.melody-main')!;
  const move = (clientX: number) => {
    time += 30;
    main.emit('pointermove', { target: f.canvas, pointerType: 'mouse', clientX, clientY: 260 });
  };
  try {
    move(450); move(800);
    f.document.emit('wheel', { target: f.canvas, deltaY: 20 });
    assert(!f.settingsOpen());
    move(999);
    assert(f.settingsOpen());
    f.desktopHost.dispatchEvent(new MessageEvent('message', { data: { type: 'rootsound-pointer-reset' } }));
    move(999);
    assert(f.settingsOpen());
    move(500); move(999);
    assert(!f.settingsOpen());
  } finally { f.cleanup(); }
});

test('left clicks audition while a quick right click seeks through small movement and a held right press erases', async () => {
  const f = fixture({ desktopPointerUx: true, notes: true,
    initialViewport: { leftSeconds: 0, zoom: 1, top: 1300, rowHeight: 24 } });
  try {
    f.selectTone();
    const noteId = f.phrase.read().body!.parts[0]!.notes[0]!.id;
    const note = f.block(noteId), box = note.getBoundingClientRect();
    const position = { target: note, pointerType: 'mouse', clientX: box.left + box.width / 2, clientY: box.top + box.height / 2, timeStamp: 50 };
    f.scroll.emit('pointerdown', position);
    f.document.emit('pointerup', { ...position, timeStamp: 65 });
    await settle();
    assert.equal(f.seeks.length, 0);
    assert.equal(f.auditions.length, 1);
    assert.equal(f.auditions[0]!.note.frequencyHz, 440);
    f.scroll.emit('pointerdown', { ...position, button: 2 });
    const jitter = { ...position, clientX: position.clientX + 5, clientY: position.clientY + 4, button: 2 };
    f.document.emit('pointermove', { ...jitter, buttons: 2, timeStamp: 70 });
    f.document.emit('pointerup', { ...jitter, buttons: 0, timeStamp: 85 });
    assert.equal(f.phrase.read().body!.parts[0]!.notes.length, 1);
    assert.equal(f.seeks.length, 1);
    assert.equal(f.auditions.length, 1);

    const blank = { ...position, target: f.canvas, clientX: 412, clientY: 145, button: 0, timeStamp: 100 };
    f.scroll.emit('pointerdown', blank);
    f.document.emit('pointerup', { ...blank, timeStamp: 110 });
    await new Promise<void>(resolve => setImmediate(resolve));
    assert.equal(f.auditions.length, 2);
    assert(f.phrase.keyboard().some(pitch => pitch.frequencyHz === f.auditions[1]!.note.frequencyHz));
    assert.equal(f.root.querySelectorAll('.melody-key').length, 0);
    assert.equal(f.root.querySelectorAll('.melody-pitch-row').length, 0);
    assert.equal(f.seeks.length, 1);
    f.scroll.emit('pointerdown', { ...blank, button: 2, buttons: 2, timeStamp: 120 });
    f.document.emit('pointerup', { ...blank, button: 2, buttons: 0, timeStamp: 130 });
    assert.equal(f.seeks.length, 2);
    assert.equal(f.auditions.length, 2);
    f.scroll.emit('pointerdown', { ...position, button: 2, buttons: 2, timeStamp: 150 });
    f.document.emit('pointerup', { ...position, button: 2, buttons: 0, timeStamp: 340 });
    assert.equal(f.phrase.read().body!.parts[0]!.notes.length, 0);
    assert.equal(f.seeks.length, 2);
    f.phrase.undo();
    assert.equal(f.phrase.read().body!.parts[0]!.notes[0]!.id, noteId);
  } finally { f.cleanup(); }
});

test('imported MIDI velocity changes note shading before any manual gain edit', () => {
  const f = fixture({ desktopPointerUx: true, initialViewport: { leftSeconds: 0, zoom: 1, top: 1300, rowHeight: 24 } });
  try {
    const bytes = Uint8Array.from(writeMidi({ header: { format: 0, numTracks: 1, ticksPerBeat: 480 }, tracks: [[
      { deltaTime: 0, type: 'noteOn', channel: 0, noteNumber: 69, velocity: 25 },
      { deltaTime: 480, type: 'noteOff', channel: 0, noteNumber: 69, velocity: 0 },
      { deltaTime: 0, type: 'noteOn', channel: 0, noteNumber: 69, velocity: 100 },
      { deltaTime: 480, type: 'noteOff', channel: 0, noteNumber: 69, velocity: 0 },
      { deltaTime: 0, type: 'endOfTrack' },
    ]] }));
    const { libraryText } = readMusicFile(bytes, 'Velocity.mid', 'midi');
    const imported = createMaterialLibrary({ read: () => libraryText, write: () => {} });
    const phrase = imported.listContentInfo().find(record => record.kind === 'rootsound.phrase')!;
    const notes = (imported.readContent(phrase.id)!.body as PhraseBody).parts[0]!.notes;
    assert.deepEqual(notes.map(note => [note.frequencyHz, Math.round(note.velocity * 127), note.gainDb]), [
      [440, 25, undefined], [440, 100, undefined],
    ]);
    const ids = f.phrase.addNotes(f.partId, notes.map(({ id, ...note }) => note));
    f.workspace.refresh();
    const [soft, loud] = ids.map(id => f.block(id).style);
    assert.equal(soft!['--tone-color'], loud!['--tone-color']);
    assert(Number(loud!['--note-velocity-scale']) > Number(soft!['--note-velocity-scale']) + .3);
    assert.equal(soft!['--note-gain-db'], '');
    assert.equal(loud!['--note-gain-db'], '');
  } finally { f.cleanup(); }
});

test('one right-button sweep trims stems, deletes heads and is undone as a unit', () => {
  const f = fixture({ desktopPointerUx: true,
    initialViewport: { leftSeconds: 0, zoom: 1, top: 1300, rowHeight: 24 } });
  try {
    const stem = f.phrase.addNote(f.partId, { startBeat: 1, durationBeats: 3, frequencyHz: 440, velocity: .75 });
    const head = f.phrase.addNote(f.partId, { startBeat: 2, durationBeats: 1, frequencyHz: 466.16, velocity: .6 });
    const other = f.phrase.addPart(f.voices[1]!.id);
    f.phrase.addNote(other, { startBeat: 1, durationBeats: 3, frequencyHz: 440, velocity: .8 });
    f.workspace.refresh();
    f.selectTone();
    const before = f.phrase.read().body!;
    const a = f.block(stem).getBoundingClientRect(), b = f.block(head).getBoundingClientRect();
    const from = { clientX: Math.min(a.left, b.left) - f.scroll.scrollLeft - 8, clientY: b.top, pointerType: 'mouse' };
    const to = { ...from, clientX: Math.max(a.right, b.right) - f.scroll.scrollLeft + 8 };
    f.scroll.emit('pointerdown', { ...from, target: f.canvas, button: 2, buttons: 2 });
    f.document.emit('pointermove', { ...to, button: -1, buttons: 2 });
    f.flushFrames();
    assert.deepEqual(f.phrase.read().body, before);
    assert(f.block(stem).getBoundingClientRect().height < a.height);
    f.document.emit('pointerup', { ...to, button: 2, buttons: 0 });
    const after = f.phrase.read().body!;
    const [remaining] = after.parts[0]!.notes;
    assert.equal(after.parts[0]!.notes.length, 1);
    assert.equal(remaining!.id, stem);
    assertCloseValue(remaining!.startBeat, 1);
    assertCloseValue(remaining!.durationBeats, 1);
    assertCloseValue(remaining!.durationSeconds!, .5);
    assert.deepEqual(after.parts[1], before.parts[1]);
    assert.equal(f.auditions.length, 0);
    assert.equal(f.changes(), 1);
    f.phrase.undo();
    assert.deepEqual(f.phrase.read().body, before);
  } finally { f.cleanup(); }
});

test('a fast right-button sweep reaches heads at the pointer rim and leaves adjacent heads outside it', () => {
  const f = fixture({ desktopPointerUx: true,
    initialViewport: { leftSeconds: 0, zoom: 1, top: 1300, rowHeight: 12 } });
  try {
    const first = f.phrase.addNote(f.partId, { startBeat: 2, durationBeats: .05, frequencyHz: 440, velocity: .75 });
    const next = f.phrase.addNote(f.partId, { startBeat: 2.1, durationBeats: 1, frequencyHz: 440, velocity: .75 });
    f.workspace.refresh();
    f.selectTone();
    const box = f.block(first).getBoundingClientRect();
    const outside = f.block(next).getBoundingClientRect();
    const x = box.left + box.width / 2 - f.scroll.scrollLeft;
    const y = box.top - 12.5;
    assert(outside.top - y > 12.5);
    const from = { clientX: x - 20, clientY: y, pointerType: 'mouse' };
    const to = { ...from, clientX: x + 20 };
    f.scroll.emit('pointerdown', { ...from, target: f.canvas, button: 2, buttons: 2 });
    f.document.emit('pointermove', { ...to, button: -1, buttons: 2 });
    f.document.emit('pointerup', { ...to, button: 2, buttons: 0 });
    assert.deepEqual(f.phrase.read().body!.parts[0]!.notes.map(note => note.id), [next]);
  } finally { f.cleanup(); }
});

test('left-button audition and right-button seeking work in either press order, and left drag only pans', async () => {
  const f = fixture({ desktopPointerUx: true,
    initialViewport: { leftSeconds: 1, zoom: 2, top: 1300, rowHeight: 24 } });
  try {
    f.selectTone();
    const keyboardHeight = Number.parseFloat(f.root.querySelector('.melody-workspace')!.style['--melody-keyboard-height']!);
    const pixelsPerSecond = (f.scroll.clientHeight - keyboardHeight) / 4;
    const point = { target: f.canvas, pointerType: 'mouse', clientX: 412, clientY: 145, timeStamp: 50 };
    const move = (buttons: number, clientY: number, timeStamp: number) =>
      f.document.emit('pointermove', { ...point, buttons, clientY, timeStamp });
    f.scroll.emit('pointerdown', { ...point, button: 0, buttons: 1 });
    move(3, 145, 60);
    move(2, 145, 70);
    f.document.emit('pointerup', { ...point, button: 2, buttons: 0, timeStamp: 80 });

    f.scroll.emit('pointerdown', { ...point, button: 2, buttons: 2, timeStamp: 100 });
    move(3, 145, 110);
    move(1, 145, 120);
    f.document.emit('pointerup', { ...point, button: 0, buttons: 0, timeStamp: 130 });
    await new Promise<void>(resolve => setImmediate(resolve));

    assert.deepEqual(f.seeks, [1 + 45 / pixelsPerSecond, 1 + 45 / pixelsPerSecond]);
    assert.equal(f.auditions.length, 2);
    f.scroll.emit('pointerdown', { ...point, button: 0, buttons: 1, timeStamp: 160 });
    move(1, 203, 170);
    f.document.emit('pointerup', { ...point, button: 0, buttons: 0, clientY: 203, timeStamp: 180 });
    assert(f.workspace.readViewport().leftSeconds < 1);
    assert.equal(f.seeks.length, 2);
    assert.equal(f.auditions.length, 2);
    assert.equal(f.phrase.read().body!.parts[0]!.notes.length, 0);
  } finally { f.cleanup(); }
});

test('a quick left drag owns its note while the right button is held', () => {
  const f = fixture({ desktopPointerUx: true, notes: true,
    initialViewport: { leftSeconds: 0, zoom: 1, top: 1300, rowHeight: 24 } });
  try {
    f.selectTone();
    const before = f.phrase.read().body!.parts[0]!.notes[0]!;
    const block = f.block(before.id), box = block.getBoundingClientRect();
    const from = { target: block, pointerType: 'mouse', clientX: box.left + box.width / 2, clientY: box.bottom - 2 };
    f.scroll.emit('pointerdown', { ...from, button: 0, buttons: 1, timeStamp: 100 });
    f.document.emit('pointermove', { ...from, button: 2, buttons: 3, timeStamp: 105 });
    const moved = { ...from, target: f.canvas, clientX: from.clientX + 48 };
    f.document.emit('pointermove', { ...moved, buttons: 3, timeStamp: 115 });
    f.document.emit('pointermove', { ...moved, button: 2, buttons: 1, timeStamp: 120 });
    f.document.emit('pointerup', { ...moved, button: 0, buttons: 0, timeStamp: 130 });
    const [after] = f.phrase.read().body!.parts[0]!.notes;
    assert.equal(after?.id, before.id);
    assert.notEqual(after?.frequencyHz, before.frequencyHz);
    assert.equal(f.seeks.length, 0);
  } finally { f.cleanup(); }
});

test('middle click keeps the scale across edits and toggles it off at the tonic or an octave', () => {
  const f = fixture({ desktopPointerUx: true, initialViewport: { leftSeconds: 1, zoom: 2, top: 1300, rowHeight: 24 } });
  try {
    const main = f.root.querySelector('.melody-main')!;
    const where = { target: f.canvas, pointerType: 'mouse', clientX: 820, clientY: 320 };
    const press = (clientX = where.clientX) => {
      f.scroll.emit('pointerdown', { ...where, clientX, button: 1, buttons: 4 });
      f.document.emit('pointerup', { ...where, clientX, button: 1, buttons: 0 });
    };
    const columns = () => f.root.querySelectorAll('.melody-scale-band');
    press();
    assert(columns().length > 1);
    assert.equal(f.root.querySelectorAll('.melody-tonic-mark').length, 0);
    const original = columns();
    const before = f.workspace.readViewport();
    main.emit('pointermove', { ...where, buttons: 0 });
    f.flushFrames();
    assert.deepEqual(f.workspace.readViewport(), before);
    assert.deepEqual(columns(), original);
    f.document.emit('wheel', { target: f.canvas });
    f.document.emit('keydown', { code: 'KeyQ', key: 'q' });
    f.document.emit('keyup', { code: 'KeyQ', key: 'q' });
    f.document.emit('pointerdown', { ...where, button: 0, buttons: 1 });
    f.document.emit('pointerup', { ...where, button: 0, buttons: 0 });
    assert.deepEqual(columns(), original);
    press(where.clientX - 12 * 24);
    assert.equal(columns().length, 0);
    press();
    press(where.clientX - 24);
    assert(columns().length > 1);
    press(where.clientX - 24);
    assert.equal(columns().length, 0);
  } finally { f.cleanup(); }
});

test('Windows Ctrl-middle locks the exact column independently from the major guide', () => {
  const f = fixture({ desktopPointerUx: true, windowsPalette: true, initialViewport: { leftSeconds: 1, zoom: 2, top: 1300, rowHeight: 24 } });
  try {
    const press = (clientX: number, ctrlKey: boolean) => {
      const input = { target: f.canvas, pointerType: 'mouse', clientX, clientY: 320, button: 1, ctrlKey };
      f.scroll.emit('pointerdown', { ...input, buttons: 4 });
      f.document.emit('pointerup', { ...input, buttons: 0 });
    };
    const locked = () => f.root.querySelectorAll('.melody-locked-pitch-band');
    const guide = () => f.root.querySelectorAll('.melody-scale-band');
    press(820, true);
    assert.equal(locked().length, 1);
    assert.equal(guide().length, 0);
    const original = locked()[0]!;
    press(796, false);
    assert(guide().length > 0);
    assert.deepEqual(locked(), [original]);
    assert(original.classList.contains('has-white-pitch-neighbor'));
    press(796, false);
    assert.equal(guide().length, 0);
    assert.deepEqual(locked(), [original]);
    assert(!original.classList.contains('has-white-pitch-neighbor'));
    press(796, true);
    assert(original.classList.contains('has-white-pitch-neighbor'));
    press(796, true);
    assert(!original.classList.contains('has-white-pitch-neighbor'));
    press(820 - 12 * 24, true);
    assert.equal(locked().length, 2);
    assert.equal(Math.abs(parseFloat(locked()[1]!.style.left!) - parseFloat(original.style.left!)), 12 * 24);
    f.scroll.emit('wheel', { target: f.canvas, deltaY: 30, ctrlKey: true, shiftKey: true, clientX: 815, clientY: 315 });
    f.flushFrames();
    assert.equal(locked().length, 2);
    assert.notEqual(original.style.width, '24px');
    const zoomed = f.workspace.readViewport();
    const clickOn = (band: Element) => 212 + parseFloat(band.style.left!) + zoomed.rowHeight / 2 - zoomed.top;
    const other = locked()[1]!;
    press(clickOn(original), true);
    assert.deepEqual(locked(), [other]);
    press(clickOn(other), true);
    assert.equal(locked().length, 0);
  } finally { f.cleanup(); }
});

test('desktop roll reuses note and grid geometry across a pan and shows newly visible notes after a jump', () => {
  const f = fixture({ desktopPointerUx: true, notes: true,
    initialViewport: { leftSeconds: 0, zoom: 2, top: 1300, rowHeight: 24 } });
  try {
    f.phrase.setLength(128);
    const [later] = f.phrase.addNotes(f.partId, [{ startBeat: 80, durationBeats: .5, frequencyHz: 440, velocity: .7 }]);
    f.workspace.refresh();
    const original = f.phrase.read().body!.parts[0]!.notes.find(note => note.id !== later)!;
    const block = f.block(original.id), noteLayer = f.root.querySelector('.melody-notes')!, grid = f.root.querySelector('.melody-grid')!;
    const keyboardHeight = Number.parseFloat(f.root.querySelector('.melody-workspace')!.style['--melody-keyboard-height']!);
    const pixelsPerSecond = (f.scroll.clientHeight - keyboardHeight) / 4;
    const top = block.style.top;
    assert(grid.children.length > 0 && grid.children.every(line => line.classList.contains('is-beat')));
    f.scroll.emit('wheel', { target: f.scroll, deltaY: 20 });
    f.flushFrames();
    assert.equal(f.block(original.id), block);
    assert.equal(block.style.top, top);
    assert(grid.children.length > 0 && grid.children.every(line => line.classList.contains('is-beat')));
    assert.equal(noteLayer.style.translate, '0 -20px');
    f.scroll.emit('wheel', { target: f.scroll, deltaY: pixelsPerSecond * 38 });
    f.flushFrames();
    assert(f.block(later!));
    assert.equal(f.block(original.id), undefined);
    const layerY = Number.parseFloat(noteLayer.style.translate.split(' ')[1] ?? '0');
    assert(Math.abs(Number.parseFloat(f.block(later!).style.top!) + layerY - (40 - f.workspace.readViewport().leftSeconds) * pixelsPerSecond) < 1e-7);
  } finally { f.cleanup(); }
});

test('desktop edges restore the existing deck and pin after settings', t => {
  let now = 50000;
  t.mock.method(Date, 'now', () => now);
  const f = fixture({ desktopPointerUx: true, voices: 10 });
  try {
    const main = f.root.querySelector('.melody-main')!;
    const editor = f.root.querySelector('.melody-workspace')!;
    const shelfOpen = () => editor.classList.contains('is-tone-shelf-open');
    const sample = (x: number, dx: number) => {
      f.desktopHost.dispatchEvent(new MessageEvent('message', { data: { type: 'rootsound-pointer',
        x, y: .4, clientX: x, clientY: .4, dx, dy: 0, held: false, pressed: false } }));
    };
    const push = (x: number) => { sample(.5, x ? 40 : -40); sample(x, x ? 60 : -60); sample(x, x ? 1 : -1); };
    push(0); assert(shelfOpen());
    main.emit('pointermove', { target: f.canvas, pointerType: 'mouse', clientX: 600, clientY: 360 });
    assert(shelfOpen());
    push(1); assert(f.settingsOpen()); assert(!shelfOpen());
    now += 1001;
    f.document.emit('keydown', { key: 'Shift', code: 'ShiftLeft' });
    push(0); assert(f.settingsOpen());
    f.document.emit('keyup', { key: 'Shift', code: 'ShiftLeft' });
    push(0); assert(f.settingsOpen()); assert(!shelfOpen());
    push(1); assert(shelfOpen()); assert(!f.settingsOpen());
    f.selectTone();
    const pinned = f.root.querySelector('.melody-pinned-tone')!;
    assert(shelfOpen()); assert(!pinned.hidden);
    const pile = f.root.querySelector('.melody-tone-pile')!;
    pile.emit('click');
    const library = f.root.querySelector('.melody-tone-library')!;
    const deck = library.querySelector('.melody-library-deck')!;
    deck.emit('wheel', { deltaY: 120 });
    const first = deck.querySelector('.melody-library-card');
    now += 1001;
    push(1); assert(f.settingsOpen()); assert(!shelfOpen()); assert(!pinned.hidden);
    now += 1001;
    push(1); assert(!f.settingsOpen()); assert(shelfOpen());
    assert.equal(f.root.querySelector('.melody-tone-library'), library);
    assert.equal(pile.attributes.get('aria-expanded'), 'true');
    assert.equal(deck.querySelector('.melody-library-card'), first);
    f.selectTone(); assert(shelfOpen()); assert(pinned.hidden);
    now += 1001;
    push(0); assert(!shelfOpen()); assert.equal(f.root.querySelector('.melody-tone-library'), undefined);
    now += 1001; push(1); assert(f.settingsOpen());
    now += 1001; push(1); assert(!f.settingsOpen()); assert(!shelfOpen());
    f.selectTone(); assert(!pinned.hidden);
    f.root.querySelector('.melody-tone-shortcut')!.emit('click');
    pinned.querySelector('.melody-note-family')!.emit('click');
    assert(!shelfOpen()); assert(pinned.hidden);
  } finally { f.cleanup(); }
});

test('Windows blocks horizontal edges at both bottom corners and keeps the playline locator shown', () => {
  const f = fixture({ desktopPointerUx: true, windowsPalette: true });
  try {
    const pile = f.root.querySelector('.melody-tone-pile')!;
    pile.getBoundingClientRect = () => ({ left: 0, top: 470, right: 170, bottom: 640, width: 170, height: 170 });
    const editor = f.root.querySelector('.melody-workspace')!;
    const open = () => editor.classList.contains('is-tone-shelf-open');
    const sample = (x: number, y: number) => {
      f.desktopHost.dispatchEvent(new MessageEvent('message', { data: { type: 'rootsound-pointer', x, y, pressed: false, held: false } }));
    };
    const push = (x: number, y: number) => { sample(.5, y); sample(x, y); };
    assert.equal(f.root.querySelector('.melody-side-entry'), undefined);
    push(0, .9); assert(!open());
    push(1, .9); assert(!f.settingsOpen());
    push(0, .4); assert(open());
    pile.emit('click'); assert.equal(pile.attributes.get('aria-expanded'), 'true');
    pile.emit('click'); assert.equal(pile.attributes.get('aria-expanded'), 'false');
    push(1, .4); assert(f.settingsOpen());
    push(1, .4); assert(!f.settingsOpen());
    assert(!f.root.querySelector('.melody-quick-scroll')!.hidden);
    f.workspace.setPlayhead(.5, false);
    const hint = f.root.querySelector('.melody-quick-hint')!;
    assert(!hint.hidden);
    assert.match(hint.style.transform ?? '', /^translateY/);
  } finally { f.cleanup(); }
});

test('Windows Alt keeps native menu focus suppressed without drawing edge hints', () => {
  const f = fixture({ desktopPointerUx: true, windowsPalette: true });
  try {
    f.root.querySelector('.melody-tone-pile')!.getBoundingClientRect = () => ({ left: 0, top: 470, right: 170, bottom: 640, width: 170, height: 170 });
    const alt = (type: string) => {
      let prevented = false;
      const fields = { key: 'Alt', code: 'AltLeft' };
      f.window.emit(type, { ...fields, preventDefault() { prevented = true; } });
      f.document.emit(type, fields);
      return prevented;
    };
    const pushRight = () => {
      for (const x of [.5, 1]) f.desktopHost.dispatchEvent(new MessageEvent('message', {
        data: { type: 'rootsound-pointer', x, y: .4, pressed: false, held: false },
      }));
    };
    assert.equal(f.root.querySelector('.pointer-edge-hints'), undefined);
    assert(alt('keydown'));
    assert.equal(f.root.querySelector('.pointer-edge-hints'), undefined);
    pushRight(); assert(!f.settingsOpen());
    assert(alt('keyup'));
    pushRight(); assert(f.settingsOpen());
    alt('keydown');
    let chordPrevented = false;
    f.window.emit('keydown', { code: 'F4', key: 'F4', altKey: true, preventDefault() { chordPrevented = true; } });
    assert(!chordPrevented);
    assert(!alt('keyup'));
    assert(alt('keydown'));
    f.window.emit('blur');
    assert.equal(f.root.querySelector('.pointer-edge-hints'), undefined);
  } finally { f.cleanup(); }
});

test('Windows tap tempo expires after seven seconds and only Apply commits the candidate', t => {
  const f = fixture({ desktopPointerUx: true, windowsPalette: true });
  let now = 1000, renewals = 0, expire: (() => void) | undefined;
  t.mock.method(performance, 'now', () => now);
  const timerHost = f.window as Element & { setTimeout(callback: () => void, delay: number): number };
  const originalTimeout = timerHost.setTimeout;
  t.mock.method(timerHost, 'setTimeout', (callback: () => void, delay: number) => {
    if (delay === 7000) { expire = callback; return 1234 + renewals++; }
    return originalTimeout(callback, delay);
  });
  try {
    const dockButton = f.root.querySelector('.melody-tempo-button')!;
    dockButton.click();
    const panel = f.root.querySelector('.melody-tempo-panel')!;
    const tap = panel.querySelector('.melody-tap-tempo')!;
    const rate = panel.querySelector('.melody-tempo-input')!;
    const original = f.phrase.read().body!.tempoBpm;
    const tapFour = () => {
      for (let index = 0; index < 4; index++) {
        now += 400;
        f.document.emit('keydown', { key: ' ', code: 'Space', stopImmediatePropagation() {} });
      }
    };
    assert(tap.classList.contains('is-space-key'));
    assert.equal(panel.querySelector('.melody-analyze-tempo'), undefined);
    tapFour();
    assert.equal(tap.textContent, '应用');
    assert.equal(rate.value, '150');
    assert.equal(f.phrase.read().body!.tempoBpm, original);
    const rateControl = panel.querySelector('.melody-tempo-rate')!;
    const beforeDrag = renewals;
    rateControl.emit('pointerdown', { clientY: 120 });
    rateControl.emit('pointermove', { clientY: 115 });
    f.flushFrames();
    assert.equal(rate.value, '155');
    assert.equal(renewals, beforeDrag + 1);
    rateControl.emit('pointerup', { clientY: 115 });
    const beforeWheel = renewals;
    rateControl.emit('wheel', { deltaY: -1 });
    f.flushFrames();
    assert.equal(rate.value, '156');
    assert.equal(renewals, beforeWheel + 1);
    assert.equal(f.phrase.read().body!.tempoBpm, original);
    assert(expire); expire();
    assert(tap.classList.contains('is-space-key'));
    assert.equal(rate.value, String(original));
    assert.equal(f.phrase.read().body!.tempoBpm, original);
    tapFour();
    rateControl.emit('wheel', { deltaY: -1 });
    tap.click();
    assert.equal(f.phrase.read().body!.tempoBpm, 151);
    assert(panel.hidden);
    dockButton.click();
    tapFour();
    rateControl.emit('wheel', { deltaY: -1 });
    dockButton.click();
    assert(panel.hidden);
    assert.equal(f.phrase.read().body!.tempoBpm, 151);
  } finally { f.cleanup(); }
});

test('the upper library shows all cards and adds more than ten while preserving a pinned group', () => {
  const f = fixture({ desktopPointerUx: true, notes: true, voices: 12 });
  try {
    f.selectTone();
    f.openTones();
    const pile = f.root.querySelector('.melody-tone-pile')!;
    pile.emit('click');
    const deck = f.root.querySelector('.melody-library-deck')!;
    assert.equal(f.root.querySelector('.melody-library-search'), undefined);
    assert.equal(f.root.querySelector('.melody-library-tools'), undefined);
    assert.equal(f.root.querySelector('.melody-library-preview'), undefined);
    const shown = () => deck.querySelectorAll('.melody-library-card').map(card => card.dataset.timbreId);
    assert.equal(shown().length, 12);
    assert.equal(new Set(shown()).size, 12);
    assert.equal(deck.querySelector('.melody-card-backs'), undefined);
    const firstCard = deck.querySelector('.melody-library-tone')!;
    for (let index = 0; index < 12; index++) deck.querySelector('.melody-library-tone')!.emit('click');
    assert.equal(deck.querySelector('.melody-library-tone'), firstCard);
    assert.equal(f.phrase.read().body!.parts.length, 13);
    assert.equal(f.root.querySelector('.melody-tone-hand')!.children.length, 12);
    assert.equal(pile.attributes.get('aria-expanded'), 'true');
    assert.equal(deck.querySelector('.melody-library-tone')!.attributes.get('aria-disabled'), 'false');
    const group = f.phrase.read().body!.parts.find(part => part.id === f.partId)!;
    const replacement = deck.querySelectorAll('.melody-library-card')[1]!;
    const transfer = toneTransfer();
    replacement.emit('dragstart', { dataTransfer: transfer });
    f.root.querySelector('.melody-pinned-tone')!.querySelector('.melody-tone-entry')!.emit('drop', { dataTransfer: transfer });
    const updated = f.phrase.read().body!.parts.find(part => part.id === group.id)!;
    assert.equal(updated.timbreId, replacement.dataset.timbreId);
    assert.deepEqual(updated.notes, group.notes);
    assert.equal(f.phrase.read().body!.parts.length, 13);
  } finally { f.cleanup(); }
});

test('the open deck accepts hand drops for removal and adds stock dropped into the empty hand area', () => {
  const removed: string[] = [];
  const f = fixture({ desktopPointerUx: true, notes: true, onRemoveTimbre(id) { removed.push(id); } });
  try {
    f.openTones();
    const pile = f.root.querySelector('.melody-tone-pile')!;
    pile.emit('click');
    const main = f.root.querySelector('.melody-main')!;
    const hand = f.root.querySelector('.melody-tone-hand')!;
    const deck = f.root.querySelector('.melody-library-grid')!;
    const stock = deck.querySelectorAll('.melody-library-card')[1]!;
    const parts = () => f.phrase.read().body!.parts;
    const fromStock = (clientX: number, clientY: number) => {
      const transfer = toneTransfer();
      stock.emit('dragstart', { dataTransfer: transfer });
      assert(hand.classList.contains('is-revealed'));
      main.emit('drop', { dataTransfer: transfer, clientX, clientY });
      stock.emit('dragend', { dataTransfer: transfer });
    };
    const fromHand = (id: string) => {
      const card = hand.querySelectorAll('.melody-note-family').find(card => card.dataset.partId === id)!;
      const transfer = toneTransfer();
      card.emit('dragstart', { dataTransfer: transfer });
      deck.emit('drop', { dataTransfer: transfer });
      card.emit('dragend', { dataTransfer: transfer });
    };
    const bounds = hand.getBoundingClientRect();
    const stray = toneTransfer();
    stock.emit('dragstart', { dataTransfer: stray });
    pile.emit('drop', { dataTransfer: stray });
    stock.emit('dragend', { dataTransfer: stray });
    assert.deepEqual(removed, []);
    fromStock(bounds.left - 1, bounds.bottom - 5);
    assert.equal(parts().length, 1);
    fromStock(bounds.left + 5, bounds.bottom - 5);
    assert.equal(parts().length, 2);
    const added = parts().find(part => part.id !== f.partId)!;
    assert.equal(added.timbreId, stock.dataset.timbreId);
    fromHand(added.id);
    assert.equal(parts().length, 1);
    assert.equal(f.root.querySelector('.melody-tone-delete-dialog'), undefined);
    fromHand(f.partId);
    f.root.querySelector('.melody-tone-delete-cancel')!.emit('click');
    assert.equal(parts()[0]!.notes.length, 1);
    fromHand(f.partId);
    f.root.querySelector('.melody-tone-delete-confirm')!.emit('click');
    assert(!parts().some(part => part.id === f.partId));
    assert.equal(f.root.querySelector('.melody-library-grid'), deck);
  } finally { f.cleanup(); }
});

test('selecting, switching and returning tone cards closes every gap in the hand', () => {
  const f = fixture({ desktopPointerUx: true, notes: true, voices: 5 });
  try {
    for (const voice of f.voices.slice(1)) f.phrase.addPart(voice.id);
    f.workspace.refresh(); f.openTones();
    const hand = f.root.querySelector('.melody-tone-hand')!;
    const order = hand.children.map(card => card.dataset.partId!);
    const body = f.phrase.read().body;
    const compact = (selected?: string) => {
      assert.deepEqual(hand.children.map(card => card.dataset.partId), order.filter(id => id !== selected));
      const positions = hand.children.map(card => parseFloat(card.style['--hand-x']!));
      assert(Math.abs(positions[0]! + positions.at(-1)!) < .01, 'remaining cards recenter');
      const spacing = positions[1]! - positions[0]!;
      for (let i = 2; i < positions.length; i++) assert(Math.abs(positions[i]! - positions[i - 1]! - spacing) < .01, 'no empty slot remains');
    };
    for (const id of [order[0]!, order[2]!, order[4]!]) {
      f.selectTone(id); compact(id);
      f.selectTone(id); compact();
    }
    f.selectTone(order[1]!); compact(order[1]!);
    f.selectTone(order[3]!); compact(order[3]!);
    f.selectTone(order[3]!); compact();
    assert.deepEqual(f.phrase.read().body, body);
  } finally { f.cleanup(); }
});

test('a scrolled hand keeps a full fan after selecting and returning a card', () => {
  const f = fixture({ desktopPointerUx: true, notes: true, voices: 24 });
  try {
    for (const voice of f.voices.slice(1)) f.phrase.addPart(voice.id);
    f.workspace.refresh(); f.openTones();
    const hand = f.root.querySelector('.melody-tone-hand')!, main = f.root.querySelector('.melody-main')!;
    const order = hand.children.map(card => card.dataset.partId!);
    for (const deltaY of [300, 99999]) {
      main.emit('wheel', { deltaY, deltaMode: 0, clientX: 500, clientY: 300 }); f.flushFrames();
      const id = hand.children[Math.round(Number(hand.dataset.handStart)) + 1]!.dataset.partId!;
      f.selectTone(id);
      assert.deepEqual(hand.children.map(card => card.dataset.partId), order.filter(part => part !== id));
      assert(Number(hand.dataset.handStart) <= hand.children.length - Number(hand.dataset.handSlots));
      const positions = hand.children.map(card => parseFloat(card.style['--hand-x']!));
      const spacing = positions[1]! - positions[0]!;
      for (let i = 2; i < positions.length; i++) assert(Math.abs(positions[i]! - positions[i - 1]! - spacing) < .01);
      f.selectTone(id);
      assert.deepEqual(hand.children.map(card => card.dataset.partId), order);
    }
  } finally { f.cleanup(); }
});

test('a large hand scrolls through a clipped fan without changing music or rebuilding cards', () => {
  const f = fixture({ desktopPointerUx: true, notes: true, voices: 24 });
  try {
    for (const voice of f.voices.slice(1)) f.phrase.addPart(voice.id);
    f.workspace.refresh(); f.openTones();
    const hand = f.root.querySelector('.melody-tone-hand')!, main = f.root.querySelector('.melody-main')!;
    const cards = [...hand.children], original = f.phrase.read().body;
    assert.equal(cards.length, 24); assert.equal(hand.dataset.handStart, '0');
    assert(cards.at(-1)!.classList.contains('is-hand-hidden'));
    const before = cards[0]!.style['--hand-x'];
    main.emit('wheel', { deltaY: 100, deltaMode: 0, clientX: 500, clientY: 300 }); f.flushFrames();
    assert.equal(hand.dataset.handStart, '1'); assert.notEqual(cards[0]!.style['--hand-x'], before);
    assert.deepEqual(hand.children, cards); assert.deepEqual(f.phrase.read().body, original);
    for (let index = 0; index < 30; index++) main.emit('wheel', { deltaY: 200, deltaMode: 0, clientX: 500, clientY: 300 });
    f.flushFrames(); assert.equal(Number(hand.dataset.handStart), 24 - Number(hand.dataset.handSlots));
    assert.equal(cards.at(-1)!.classList.contains('is-hand-hidden'), false);
    assert.equal(hand.querySelector('.melody-card-backs'), undefined);
  } finally { f.cleanup(); }
});

test('desktop cards reveal near the bottom, select by click, and confirm populated deletions', t => {
  let now = 50000;
  t.mock.method(Date, 'now', () => now);
  const f = fixture({ desktopPointerUx: true, notes: true });
  const empty = f.phrase.addPart(f.voices[1]!.id);
  f.workspace.refresh();
  try {
    f.openTones();
    const page = f.root.querySelector('.melody-workspace')!;
    const main = f.root.querySelector('.melody-main')!;
    const hand = f.root.querySelector('.melody-tone-hand')!;
    const pin = f.root.querySelector('.melody-pinned-tone')!;
    const bounds = main.getBoundingClientRect();
    main.emit('pointermove', { target: f.canvas, pointerType: 'mouse', clientX: bounds.left + 24, clientY: bounds.bottom - 130 });
    assert(hand.classList.contains('is-revealed'));
    main.emit('pointermove', { target: f.canvas, pointerType: 'mouse', clientX: 430, clientY: bounds.bottom - 25 });
    assert(hand.classList.contains('is-revealed'));
    assert(pin.hidden);
    main.emit('pointermove', { target: f.canvas, pointerType: 'mouse', clientX: 430, clientY: 220 });
    assert(!hand.classList.contains('is-revealed'));
    const drag = (id: string, endY: number) => {
      const card = f.root.querySelectorAll('.melody-note-family').find(card => card.dataset.partId === id)!;
      const dataTransfer = toneTransfer();
      card.emit('dragstart', { dataTransfer, clientX: 430, clientY: 422 });
      main.emit('pointermove', { target: f.canvas, pointerType: 'mouse', clientX: 430, clientY: 220 });
      assert(hand.classList.contains('is-revealed'));
      main.emit('drop', { dataTransfer, clientX: 430, clientY: endY });
      card.emit('dragend', { dataTransfer });
      now += 251;
    };
    drag(f.partId, 312);
    assert(pin.hidden);
    f.selectTone();
    f.flushFrames();
    assert(page.classList.contains('is-tone-shelf-open'));
    assert(!pin.hidden);
    const note = f.phrase.read().body!.parts.find(part => part.id === f.partId)!.notes[0]!;
    assert(f.block(note.id).parentElement?.classList.contains('is-current-tone'));
    const pinnedCard = pin.querySelector('.melody-note-family')!;
    const transfer = toneTransfer();
    pinnedCard.emit('dragstart', { dataTransfer: transfer, clientX: 240, clientY: 140 });
    pinnedCard.emit('dragend', { dataTransfer: transfer });
    assert(!pin.hidden);
    now += 251;
    pinnedCard.emit('dragstart', { dataTransfer: transfer, clientX: 240, clientY: 140 });
    main.emit('drop', { dataTransfer: transfer, clientX: 620, clientY: 479 });
    pinnedCard.emit('dragend', { dataTransfer: transfer });
    assert(pin.hidden);
    assert(page.classList.contains('is-tone-shelf-open'));
    assert(hand.children.some(entry => entry.dataset.partId === f.partId));
    assert.equal(f.root.querySelector('.melody-tone-delete-dialog'), undefined);
    assert.deepEqual(f.phrase.read().body!.parts.find(part => part.id === f.partId)!.notes, [note]);
    f.openTones();
    drag(empty, 478);
    assert.equal(f.root.querySelector('.melody-tone-delete-dialog'), undefined);
    assert(!f.phrase.read().body!.parts.some(part => part.id === empty));
    drag(f.partId, 478);
    const warning = f.root.querySelector('.melody-tone-delete-dialog')!;
    assert(warning);
    warning.querySelector('.melody-tone-delete-cancel')!.emit('click');
    assert.deepEqual(f.phrase.read().body!.parts.find(part => part.id === f.partId)!.notes, [note]);
  } finally { f.cleanup(); }
});

test('desktop wheel keeps a newly added note until the pointer moves to an existing note', () => {
  const f = fixture({ desktopPointerUx: true, notes: true,
    initialViewport: { leftSeconds: 0, zoom: 1, top: 1300, rowHeight: 24 } });
  try {
    const notes = () => f.phrase.read().body!.parts[0]!.notes;
    const existingId = notes()[0]!.id;
    f.selectTone();
    const original = structuredClone(notes());
    const position = { clientX: 412, clientY: 180 };
    let hit = f.canvas;
    Object.assign(f.document, { elementFromPoint: () => hit });
    f.scroll.emit('wheel', { target: f.canvas, deltaY: 100, ...position });
    f.flushFrames();
    assert.equal(f.root.querySelectorAll('.melody-note').length, 2);
    hit = f.block(existingId);
    f.scroll.emit('wheel', { target: f.block(existingId), deltaY: 100, ...position });
    f.workspace.flush();
    assert.equal(notes().length, 2);
    assert.deepEqual(notes().find(note => note.id === existingId), original[0]);
    f.scroll.emit('wheel', { target: f.canvas, deltaY: 100, ...position, clientY: position.clientY + 1 });
    f.workspace.flush();
    assert(notes().find(note => note.id === existingId)!.durationSeconds! > original[0]!.durationSeconds!);
    f.phrase.undo(); f.phrase.undo(); f.workspace.refresh();
    assert.deepEqual(notes(), original);
  } finally { f.cleanup(); }
});

test('the unpinned wheel pans over blank space, and a pinned card routes the wheel to note editing', () => {
  const f = fixture({ desktopPointerUx: true, notes: true,
    initialViewport: { leftSeconds: 0, zoom: 1, top: 1300, rowHeight: 24 } });
  try {
    const notes = () => f.phrase.read().body!.parts[0]!.notes;
    const existing = notes()[0]!;
    const pinned = f.root.querySelector('.melody-pinned-tone')!;
    const wheel = (target: Element, clientY: number, extra = {}) => f.scroll.emit('wheel', { target, deltaY: 100, clientX: 412, clientY, ...extra });
    assert.equal(pinned.hidden, true);
    wheel(f.block(existing.id), 180); f.workspace.flush();
    assert(notes()[0]!.durationSeconds! > existing.durationSeconds!);
    const before = f.workspace.readViewport();
    wheel(f.canvas, 210); f.workspace.flush();
    assert.equal(notes().length, 1);
    const panned = f.workspace.readViewport();
    assert(panned.leftSeconds > before.leftSeconds);
    f.selectTone();
    assert.equal(pinned.hidden, false);
    wheel(f.canvas, 220, { deltaY: -100 });
    wheel(f.scroll, 220, { shiftKey: true });
    wheel(f.canvas, 220, { deltaY: 0, deltaX: 300 });
    assert.deepEqual(f.workspace.readViewport(), panned);
    wheel(f.canvas, 220); f.workspace.flush();
    assert.equal(notes().length, 2);
    assert.deepEqual(f.workspace.readViewport(), panned);
  } finally { f.cleanup(); }
});

test('desktop wheel creates at a blank center even when the circle touches a note and the event still targets it', () => {
  const f = fixture({ desktopPointerUx: true, notes: true,
    initialViewport: { leftSeconds: 0, zoom: 1, top: 1300, rowHeight: 24 } });
  try {
    const notes = () => f.phrase.read().body!.parts[0]!.notes;
    const note = notes()[0]!, box = f.block(note.id).getBoundingClientRect();
    f.selectTone();
    Object.assign(f.document, { elementFromPoint: () => f.canvas });
    const position = { target: f.block(note.id), clientX: box.left + box.width / 2 - f.scroll.scrollLeft, clientY: box.bottom + 8 };
    const view = f.workspace.readViewport();
    f.scroll.emit('wheel', { ...position, deltaY: 100, timeStamp: 1000 });
    f.workspace.flush();
    assert.deepEqual(f.workspace.readViewport(), view);
    assert.equal(notes().length, 2);
    assert.deepEqual(notes().find(item => item.id === note.id), note);
  } finally { f.cleanup(); }
});

test('desktop note entry still snaps near a beat with only beat lines', () => {
  const f = fixture({ desktopPointerUx: true, notes: true,
    initialViewport: { leftSeconds: 0, zoom: 1, top: 1300, rowHeight: 24 } });
  try {
    const original = f.phrase.read().body!.parts[0]!.notes[0]!;
    const box = f.block(original.id).getBoundingClientRect();
    f.selectTone();
    const lines = f.root.querySelectorAll('.melody-grid-line');
    assert(lines.length > 0 && lines.every(line => line.classList.contains('is-beat')));
    f.scroll.emit('wheel', { target: f.canvas, deltaY: 100, timeStamp: 1000,
      clientX: box.left + box.width / 2 - f.scroll.scrollLeft + 24, clientY: box.top + 3 });
    f.workspace.flush();
    const added = f.phrase.read().body!.parts[0]!.notes.find(note => note.id !== original.id);
    assert.equal(added?.startBeat, original.startBeat);
    assert.notEqual(added?.frequencyHz, original.frequencyHz);
  } finally { f.cleanup(); }
});

test('blank wheel scrolling stays locked until the pointer actually moves', () => {
  const f = fixture({ desktopPointerUx: true, notes: true,
    initialViewport: { leftSeconds: 0, zoom: 1, top: 1300, rowHeight: 24 } });
  try {
    const notes = () => f.phrase.read().body!.parts[0]!.notes;
    const note = notes()[0]!, block = f.block(note.id), box = block.getBoundingClientRect();
    const position = { clientX: box.left + box.width / 2 - f.scroll.scrollLeft, clientY: box.top - 16 };
    f.scroll.emit('wheel', { ...position, target: f.canvas, deltaY: 20, timeStamp: 1000 });
    const first = f.workspace.readViewport().leftSeconds;
    assert(first > 0);
    f.scroll.emit('wheel', { ...position, target: block, deltaY: 2, timeStamp: 1120 });
    f.scroll.emit('wheel', { ...position, target: block, deltaY: 2, timeStamp: 1340 });
    f.workspace.flush();
    assert(f.workspace.readViewport().leftSeconds > first);
    assert.deepEqual(notes(), [note]);
    f.scroll.emit('wheel', { ...position, target: block, deltaY: 10_000, timeStamp: 8100 });
    const limit = f.workspace.readViewport().leftSeconds;
    f.scroll.emit('wheel', { ...position, target: block, deltaY: 100, timeStamp: 61_000 });
    f.workspace.flush();
    assert.equal(f.workspace.readViewport().leftSeconds, limit);
    assert.deepEqual(notes(), [note]);
    const moved = { ...position, clientY: position.clientY + 1, target: block };
    f.root.querySelector('.melody-main')!.emit('pointermove', { ...moved, pointerType: 'mouse' });
    f.scroll.emit('wheel', { ...moved, deltaY: 100, timeStamp: 61_002 });
    f.workspace.flush();
    assert(notes()[0]!.durationSeconds! > note.durationSeconds!);
  } finally { f.cleanup(); }
});

test('desktop follow eases to the center, holds the line and gives manual scrolling priority', () => {
  const f = fixture({ desktopPointerUx: true, notes: true,
    initialViewport: { leftSeconds: 0, zoom: 1, top: 1300, rowHeight: 24 } });
  try {
    const head = f.root.querySelector('.melody-playhead')!;
    const headY = () => Number(head.style.transform!.slice('translateY('.length, -3));
    const stamp = performance.now();
    const token = f.library.currentToken();
    f.workspace.setPlayhead(0, true, 0, stamp);
    assert.equal(f.workspace.readViewport().leftSeconds, 0);
    f.workspace.setPlayhead(.016, true, .016, stamp + 16);
    assert(f.workspace.readViewport().leftSeconds < 0);
    assert(headY() > 0 && headY() < 80);
    for (let frame = 2; frame <= 80; frame++) f.workspace.setPlayhead(frame * .016, true, frame * .016, stamp + frame * 16);
    const centered = headY();
    const middle = f.workspace.readViewport().leftSeconds;
    assert(Math.abs(1.28 - middle - 4) < .01);
    f.workspace.setPlayhead(1.296, true, 1.296, stamp + 81 * 16);
    assert(Math.abs(headY() - centered) < .01);
    assert(f.workspace.readViewport().leftSeconds > middle);

    f.scroll.emit('wheel', { target: f.canvas, clientX: 850, clientY: 275, deltaY: 35 });
    const browsed = f.workspace.readViewport().leftSeconds;
    const browsedAt = performance.now();
    f.workspace.setPlayhead(1.5, true, 1.5, browsedAt + 300);
    assert.equal(f.workspace.readViewport().leftSeconds, browsed);
    f.workspace.setPlayhead(2.1, true, 2.1, browsedAt + 950);
    assert.equal(f.workspace.readViewport().leftSeconds, browsed);
    f.workspace.setPlayhead(2.116, true, 2.116, browsedAt + 966);
    assert.notEqual(f.workspace.readViewport().leftSeconds, browsed);
    assert.equal(f.library.currentToken(), token);
  } finally { f.cleanup(); }
});

test('a sounding note can be edited while playback continues', () => {
  const f = fixture({ desktopPointerUx: true, notes: true,
    initialViewport: { leftSeconds: 0, zoom: 1, top: 1300, rowHeight: 24 } });
  try {
    f.selectTone();
    const before = structuredClone(f.phrase.read().body!.parts[0]!.notes);
    f.workspace.setPlayhead(1.25, true);
    const block = f.block(before[0]!.id);
    f.scroll.emit('wheel', { target: block, deltaY: 100, clientX: 412, clientY: 156 });
    f.workspace.flush();
    const [note] = f.phrase.read().body!.parts[0]!.notes;
    assert.equal(note?.id, before[0]!.id);
    assert(note!.durationSeconds! > before[0]!.durationSeconds!);
  } finally { f.cleanup(); }
});

test('desktop wheel holds a shrinking note through deletion and a pause until the pointer moves', () => {
  const f = fixture({ desktopPointerUx: true, notes: true, initialViewport: { leftSeconds: 0, zoom: 1, top: 1300, rowHeight: 24 } });
  try {
    const notes = () => f.phrase.read().body!.parts[0]!.notes;
    const id = notes()[0]!.id;
    const otherId = f.phrase.addNote(f.partId, { startBeat: 4, durationBeats: 1, durationSeconds: .5, frequencyHz: 440, velocity: .75 });
    const other = notes().find(note => note.id === otherId)!;
    f.phrase.updateNote(f.partId, id, { durationSeconds: .045, durationBeats: .09 });
    f.workspace.refresh();
    f.selectTone();
    const location = { clientX: 412, clientY: 190 };
    let hit = f.block(id);
    Object.assign(f.document, { elementFromPoint: () => hit });
    f.scroll.emit('wheel', { target: f.block(id), deltaY: -100, ...location });
    f.workspace.flush();
    assert(notes().find(note => note.id === id)!.durationSeconds! < .01);
    hit = f.block(otherId);
    f.scroll.emit('wheel', { target: f.canvas, deltaY: -1, ...location });
    f.flushFrames();
    f.workspace.flush();
    assert.deepEqual(notes(), [other]);

    f.scroll.emit('wheel', { target: f.block(otherId), deltaY: 100, ...location });
    hit = f.canvas;
    f.scroll.emit('wheel', { target: f.canvas, deltaY: 100, ...location });
    f.workspace.flush();
    assert.deepEqual(notes(), [other]);

    hit = f.block(otherId);
    f.scroll.emit('wheel', { target: f.canvas, deltaY: 100, ...location, clientX: location.clientX + 1 });
    f.workspace.flush();
    assert.equal(notes().length, 1);
    assert.equal(notes()[0]!.id, otherId);
    assert(notes()[0]!.durationSeconds! > other.durationSeconds!);
  } finally { f.cleanup(); }
});

test('a long imported note can be shortened and moved past the explicit-seconds limit', () => {
  const f = fixture({ desktopPointerUx: true, initialViewport: { leftSeconds: 0, zoom: 1, top: 1300, rowHeight: 24 } });
  try {
    f.phrase.setLength(256);
    const id = f.phrase.addNote(f.partId, { startBeat: 2, durationBeats: 220, frequencyHz: 440, velocity: .7 });
    f.workspace.refresh();
    f.scroll.emit('wheel', { target: f.block(id), clientX: 412, clientY: 190, deltaY: -100 });
    f.workspace.flush();
    const after = f.phrase.read().body!.parts[0]!.notes[0]!;
    assert(after.durationBeats < 220 && after.durationBeats > 200);
    assert.equal(after.durationSeconds, undefined);
    const target = f.block(id), box = target.getBoundingClientRect();
    const point = { target, pointerType: 'mouse', clientX: box.left + box.width / 2, clientY: box.top + 20 };
    f.scroll.emit('pointerdown', { ...point, buttons: 1, timeStamp: 200 });
    f.document.emit('pointerup', { ...point, clientY: point.clientY + 28, buttons: 0, timeStamp: 212 });
    const moved = f.phrase.read().body!.parts[0]!.notes[0]!;
    assert(moved.startBeat > after.startBeat);
    assert(Math.abs(moved.durationBeats - after.durationBeats) < 1e-8);
    assert.equal(moved.durationSeconds, undefined);
  } finally { f.cleanup(); }
});

test('melody seconds geometry keeps held widths while BPM moves four-cell beat lines', () => {
  const body: PhraseBody = { model: 'note-phrase', version: 1, timeUnit: 'beat', tempoBpm: 120, lengthBeats: 16, parts: [] };
  const view = { leftSeconds: 0, zoom: 1, rowHeight: 24 }; const note = { id: 'n', startBeat: 4, durationBeats: 1, durationSeconds: .5, frequencyHz: 440, velocity: .7 };
  const keys = [{ label: 'A4', frequencyHz: 440, accidental: false }]; const first = melodyNoteRect(note, body, keys, view, 800);
  const second = melodyNoteRect(note, { ...body, tempoBpm: 240 }, keys, view, 800);
  assert.equal(first.x, 200); assert.equal(second.x, 100); assert.equal(first.width, second.width);
  const lines = melodyGrid(8, 120); assert.equal(lines.length, 65); assert.equal(lines[1]!.seconds, .125); assert.equal(lines[4]!.beat, true); assert.equal(lines[16]!.bar, true);
  assert.equal(melodyGrid(4, 240)[1]!.seconds, .0625); assert.equal(melodyScale(view, 800, 4), melodyScale(view, 800, 8));
  const zoomed = zoomMelody(view, 800, 8, 200, 4); assert.equal(melodyTimeAt(zoomed, 800, 8, 200), 2);
  assert.deepEqual(clampMelodyView({ leftSeconds: 100, zoom: 4, rowHeight: 200 }, 8), { leftSeconds: 6, zoom: 4, rowHeight: 44 });
});


test('ordinary Melody remains section-scoped while unified creation exposes legacy rhythm families without rewriting a draft', () => {
  for (const includeAllSections of [false, true]) {
    const f = fixture({ notes: true, legacyRhythm: true, includeAllSections }); try {
      if (includeAllSections) f.workspace.frameNotes();
      assert.equal(f.root.querySelectorAll('.melody-note-family').length, includeAllSections ? 2 : 1);
      assert.equal(f.root.querySelectorAll('.melody-note').length, includeAllSections ? 2 : 1);
      assert.deepEqual(f.phrase.read().draft, f.beforeMount); assert.equal(f.library.currentToken(), f.tokenBeforeMount);
      assert.equal(f.phrase.read().body!.parts.find(part => part.id === f.legacyRhythmId)!.section, 'rhythm');
      assert.equal(f.changes(), 0); assert.equal(f.previews.length, 0); assert.equal(f.auditions.length, 0);
      f.workspace.refresh(); assert.deepEqual(f.phrase.read().draft, f.beforeMount); assert.equal(f.library.currentToken(), f.tokenBeforeMount);
    } finally { f.cleanup(); }
  }
});



function pendingImport() {
  let resolve!: (value: boolean) => void;
  const promise = new Promise<boolean>(yes => { resolve = yes; });
  return { promise, resolve };
}

test('tone-library import prevents duplicate pending pickers and refreshes the open library without creating a note family', async () => {
  const pending = pendingImport(); let attempts = 0;
  const f = fixture({ onImportTimbre() { attempts++; return pending.promise; } }); try {
    const original = f.phrase.read().draft, token = f.library.currentToken();
    f.root.querySelector('.melody-add-tone')!.emit('click'); const dialog = f.root.querySelector('.melody-tone-library')!;
    const add = dialog.querySelector('.melody-library-import')!; assert.equal(add.textContent, '+');
    add.emit('click'); add.emit('click'); await settle();
    assert.equal(attempts, 1); assert.equal(add.disabled, true); assert.equal(add.attributes.get('aria-busy'), 'true');
    f.workspace.refresh(); const pendingButton = dialog.querySelector('.melody-library-import')!;
    assert.equal(pendingButton.disabled, true); pendingButton.emit('click'); await settle(); assert.equal(attempts, 1);
    f.voices.push({ id: 'imported-tone', name: '新导入音色' }); pending.resolve(true); await settle();
    assert.equal(f.root.querySelector('.melody-tone-library'), dialog);
    assert.deepEqual(dialog.querySelectorAll('.melody-library-tone').map(tile => tile.textContent), ['音色 1', '音色 2', '新导入音色']);
    assert.equal(dialog.querySelector('.melody-library-import')!.disabled, false); assert.equal(f.changes(), 1);
    assert.deepEqual(f.phrase.read().draft, original); assert.equal(f.library.currentToken(), token);
    assert.equal(f.root.querySelectorAll('.melody-note').length, 0); assert.equal(f.auditions.length, 0);
  } finally { f.cleanup(); }
});

test('cancelled tone import keeps the library and musical selection unchanged without notifying a phrase edit', async () => {
  const f = fixture({ notes: true, onImportTimbre: async () => false }); try {
    f.selectTone(); const original = f.phrase.read().draft, token = f.library.currentToken();
    f.root.querySelector('.melody-add-tone')!.emit('click'); const dialog = f.root.querySelector('.melody-tone-library')!;
    dialog.querySelector('.melody-library-import')!.emit('click'); await settle();
    assert.equal(f.root.querySelector('.melody-tone-library'), dialog); assert.equal(f.changes(), 0);
    assert.equal(dialog.querySelectorAll('.melody-library-tone').length, 2); assert.equal(dialog.querySelector('.melody-library-import')!.disabled, false);
    assert.equal(dialog.querySelector('.melody-library-error')!.hidden, true);
    assert.deepEqual(f.phrase.read().draft, original); assert.equal(f.library.currentToken(), token);
    assert(f.root.querySelector('.melody-tone')!.classList.contains('is-selected'));
  } finally { f.cleanup(); }
});

test('tone import errors stay in the current library and permit a clean retry without changing the phrase', async () => {
  let attempts = 0;
  const f = fixture({ onImportTimbre: async () => { if (++attempts === 1) throw new Error('音色文件不完整'); return false; } }); try {
    const original = f.phrase.read().draft, token = f.library.currentToken();
    f.root.querySelector('.melody-add-tone')!.emit('click'); const dialog = f.root.querySelector('.melody-tone-library')!;
    dialog.querySelector('.melody-library-import')!.emit('click'); await settle();
    const error = dialog.querySelector('.melody-library-error')!;
    assert.equal(error.hidden, false); assert.equal(error.textContent, '音色文件不完整');
    assert.equal(dialog.querySelector('.melody-library-import')!.disabled, false);
    dialog.querySelector('.melody-library-import')!.emit('click'); await settle();
    assert.equal(attempts, 2); assert.equal(error.hidden, true); assert.equal(f.root.querySelector('.melody-tone-library'), dialog);
    assert.deepEqual(f.phrase.read().draft, original); assert.equal(f.library.currentToken(), token); assert.equal(f.changes(), 0);
  } finally { f.cleanup(); }
});

for (const ending of ['close', 'dispose']) test(`late tone import resolution after ${ending} does not mutate a stale dialog or phrase`, async () => {
  const pending = pendingImport(); const f = fixture({ notes: true, onImportTimbre: () => pending.promise }); try {
    const original = f.phrase.read().draft, token = f.library.currentToken();
    f.root.querySelector('.melody-add-tone')!.emit('click'); const oldDialog = f.root.querySelector('.melody-tone-library')!;
    oldDialog.querySelector('.melody-library-import')!.emit('click'); await settle();
    let nextDialog: Element | undefined;
    if (ending === 'dispose') f.workspace.dispose();
    else {
      oldDialog.querySelector('.melody-library-close')!.emit('click');
      f.root.querySelector('.melody-add-tone')!.emit('click'); nextDialog = f.root.querySelector('.melody-tone-library'); assert(nextDialog);
    }
    assert.equal(oldDialog.parentElement, undefined); const oldTiles = oldDialog.querySelectorAll('.melody-library-tone');
    const nextTiles = nextDialog?.querySelectorAll('.melody-library-tone'); pending.resolve(true); await settle();
    assert.deepEqual(oldDialog.querySelectorAll('.melody-library-tone'), oldTiles);
    if (nextDialog) { assert.equal(f.root.querySelector('.melody-tone-library'), nextDialog); assert.deepEqual(nextDialog.querySelectorAll('.melody-library-tone'), nextTiles); }
    else assert.equal(f.root.querySelector('.melody-tone-library'), undefined);
    assert.deepEqual(f.phrase.read().draft, original); assert.equal(f.library.currentToken(), token); assert.equal(f.changes(), 0);
  } finally { f.cleanup(); }
});

test('the imported spectral editor preserves full curves through rename, level and save, and discards a late audition after disposal', async () => {
  const environment = dom(); const library = createMaterialLibrary(); const patch = createDefaultPatch(); patch.name = '完整精细音色';
  patch.spectrum.points[2]!.y = -13.123; patch.pitch.points[1]!.y = 7.321;
  const imported = prepareImportedTimbre(JSON.stringify(patch));
  assert.equal(library.commitTransaction({ expectedToken: library.currentToken(), label: '精细界面冒烟测试', createContents: [imported] }).status, 'committed');
  const editor = createTimbreEditor(library); editor.open(imported.id);
  let ready!: () => void; const preparing = new Promise<void>(resolve => { ready = resolve; });
  let auditions = 0, cancelled = 0, savedId = '';
  const root = new Element('main'); const sound = { async audition() { auditions++; }, cancelAudition() { cancelled++; } } as unknown as SoundRuntimePort;
  const workspace = mountSynthWorkspace(root as unknown as HTMLElement, { timbre: { ...editor, preparePreview: () => preparing }, sound,
    onWelcome() {}, onNew() { throw new Error('must not enter the ordinary synthesizer'); }, onSave() {
      const result = editor.save('overwrite'); assert.equal(result.status, 'saved'); if (result.status === 'saved') savedId = result.content.id;
    } });
  try {
    const initial = editor.read().body; assert.equal(initial.model, 'spectral-synth');
    if (initial.model !== 'spectral-synth') throw new Error('Expected complete spectral body');
    const original = structuredClone(initial.patch);
    assert.equal(root.querySelectorAll('select').length, 0, 'ordinary source/preset controls must not flatten this tone');
    const name = root.querySelector('.sound-name')!; name.value = '改名后的精细音色'; name.emit('change');
    const level = root.querySelectorAll('input').find(input => input.attributes.get('aria-label') === '音色音量')!;
    level.value = '.23'; level.emit('change'); root.querySelectorAll('button').find(button => button.textContent === '保存')!.emit('click');
    assert.equal(savedId, imported.id); assert.equal(library.readContent(savedId)!.name, '改名后的精细音色');
    const saved = readEditableTimbreBody(library.readContent(savedId)!.body); assert.equal(saved.model, 'spectral-synth');
    if (saved.model !== 'spectral-synth') throw new Error('Expected preserved spectral body');
    assert.deepEqual(saved.patch.amplitude, original.amplitude); assert.deepEqual(saved.patch.pitch, original.pitch);
    assert.deepEqual(saved.patch.spectrum, original.spectrum); assert.deepEqual(saved.patch.oscillators, original.oscillators);
    assert.equal(saved.patch.master.level, .23); assert.equal(saved.level, .23);
    const listen = root.querySelectorAll('button').find(button => button.textContent.includes('试听'))!;
    listen.emit('click'); assert.equal(listen.disabled, true); workspace.dispose(); ready(); await settle();
    assert.equal(auditions, 0); assert.equal(cancelled, 1); assert.deepEqual(editor.read().body, saved);
  } finally { workspace.dispose(); environment.restore(); }
});

test('two successive vertical pan movements each move the pitch view by the full pointer distance', () => {
  const f = fixture({ notes: true }); try {
    const before = f.scroll.scrollTop; const original = f.phrase.read().body;
    f.scroll.emit('pointerdown', { button: 1, target: f.canvas, clientX: 412, clientY: 300 });
    f.document.emit('pointermove', { clientX: 412, clientY: 280 }); assert.equal(f.scroll.scrollTop, before + 20);
    f.document.emit('pointermove', { clientX: 412, clientY: 260 }); assert.equal(f.scroll.scrollTop, before + 40);
    f.document.emit('pointerup'); assert.deepEqual(f.phrase.read().body, original);
    f.scroll.emit('pointerdown', { altKey: true, target: f.canvas, clientX: 412, clientY: 260 });
    f.document.emit('pointermove', { clientX: 412, clientY: 270 }); f.document.emit('pointermove', { clientX: 412, clientY: 280 });
    assert.equal(f.scroll.scrollTop, before + 20); f.document.emit('pointerup');
  } finally { f.cleanup(); }
});

test('restored melody viewport survives initialization and diagonal panning uses only client-space increments', () => {
  const initial = { leftSeconds: 2, zoom: 4, top: 600, rowHeight: 30 };
  const f = fixture({ notes: true, initialViewport: initial }); try {
    assert.deepEqual(f.workspace.readViewport(), initial);
    assert.equal(f.root.querySelector('.melody-key')!.style.height, '30px');
    const detached = f.workspace.readViewport(); detached.top = 0; assert.equal(f.scroll.scrollTop, 600);
    const original = f.phrase.read().body; const previewCount = f.previews.length;
    f.scroll.emit('pointerdown', { button: 1, target: f.canvas, clientX: 412, clientY: 300 });
    f.document.emit('pointermove', { clientX: 372, clientY: 280 });
    assert.deepEqual(f.workspace.readViewport(), { ...initial, leftSeconds: 2.1, top: 620 });
    f.document.emit('pointermove', { clientX: 332, clientY: 260 });
    assert.deepEqual(f.workspace.readViewport(), { ...initial, leftSeconds: 2.2, top: 640 });
    f.document.emit('pointermove', { clientX: 392, clientY: 290 });
    assert(Math.abs(f.workspace.readViewport().leftSeconds - 2.05) < 1e-10); assert.equal(f.scroll.scrollTop, 610);
    f.document.emit('pointerup');
    assert.deepEqual(f.viewports.at(-1), f.workspace.readViewport());
    assert.deepEqual(f.phrase.read().body, original); assert.equal(f.changes(), 0); assert.equal(f.previews.length, previewCount); assert.equal(f.seeks.length, 0);
    f.scroll.emit('pointerdown', { altKey: true, target: f.canvas, clientX: 400, clientY: 300 });
    f.document.emit('pointermove', { clientX: 10000, clientY: 10000 });
    assert.equal(f.workspace.readViewport().leftSeconds, 0); assert.equal(f.scroll.scrollTop, 0);
    f.document.emit('pointermove', { clientX: 9990, clientY: 9990 });
    assert.equal(f.workspace.readViewport().leftSeconds, .025); assert.equal(f.scroll.scrollTop, 10);
    f.document.emit('pointermove', { clientX: -100000, clientY: -100000 });
    assert.equal(f.workspace.readViewport().leftSeconds, 6); assert.equal(f.scroll.scrollTop, f.phrase.keyboard().length * 30 - f.scroll.clientHeight);
    f.document.emit('pointercancel'); assert.equal(f.previews.length, previewCount);
  } finally { f.cleanup(); }
});

test('wheel, zoom, arrows and native scrolling report independent view snapshots without musical side effects', () => {
  const f = fixture({ initialViewport: { leftSeconds: 1, zoom: 2, top: 100, rowHeight: 24 } }); try {
    const original = f.phrase.read().body; const previewCount = f.previews.length;
    f.scroll.emit('wheel', { shiftKey: true, deltaY: 100, clientX: 412, clientY: 200 });
    assert.equal(f.workspace.readViewport().leftSeconds, 1.5);
    f.scroll.emit('wheel', { deltaY: 50, clientX: 412, clientY: 200 }); assert.equal(f.scroll.scrollTop, 150);
    f.scroll.emit('wheel', { ctrlKey: true, shiftKey: true, deltaY: -100, clientX: 412, clientY: 200 }); assert(f.workspace.readViewport().zoom > 2);
    f.scroll.emit('wheel', { ctrlKey: true, deltaY: -100, clientX: 412, clientY: 200 }); assert(f.workspace.readViewport().rowHeight > 24);
    const top = f.scroll.scrollTop; const rowHeight = f.workspace.readViewport().rowHeight;
    f.document.emit('keydown', { target: f.scroll, key: 'ArrowDown' }); assert.equal(f.scroll.scrollTop, top + rowHeight);
    f.document.emit('keydown', { target: f.scroll, key: 'ArrowRight', ctrlKey: true });
    f.scroll.scrollTop = 250; f.scroll.emit('scroll'); f.flushFrames(); assert.equal(f.viewports.at(-1)!.top, 250);
    const count = f.viewports.length; f.scroll.emit('scroll'); f.flushFrames(); assert.equal(f.viewports.length, count, 'unchanged native scroll is not reported twice');
    f.scroll.scrollTop = -100; f.scroll.emit('scroll'); f.flushFrames(); assert.equal(f.viewports.at(-1)!.top, 0);
    assert.deepEqual(f.viewports.at(-1), f.workspace.readViewport());
    assert.deepEqual(f.phrase.read().body, original); assert.equal(f.previews.length, previewCount); assert.equal(f.changes(), 0); assert.equal(f.seeks.length, 0);
  } finally { f.cleanup(); }
});

test('refresh retains seconds and section scroll while clamping a shortened phrase, and entry auto-scroll is reported', () => {
  const f = fixture({ performance: true, initialViewport: { leftSeconds: 5, zoom: 4, top: 700, rowHeight: 30 } }); try {
    f.phrase.setLength(20); f.workspace.refresh(f.phrase.read());
    assert.equal(f.workspace.readViewport().leftSeconds, 5); assert.equal(f.workspace.readViewport().top, 700);
    f.phrase.setTempo(240); f.workspace.refresh(f.phrase.read());
    assert.equal(f.workspace.readViewport().leftSeconds, 3); assert.equal(f.workspace.readViewport().zoom, 4);
    f.phrase.setLength(4); f.workspace.refresh(f.phrase.read());
    assert.equal(f.workspace.readViewport().leftSeconds, 0); assert.equal(f.workspace.readViewport().top, 700); assert.equal(f.changes(), 0);
    f.selectTone(); const prior = f.viewports.length;
    f.document.emit('keydown', { target: f.scroll, key: 'x' }); assert(f.viewports.length > prior);
    assert.deepEqual(f.viewports.at(-1), f.workspace.readViewport()); assert.equal(f.changes(), 0);
    f.scroll.scrollTop = 0; f.scroll.emit('scroll');
    f.document.emit('keydown', { target: f.scroll, key: 'c' });
    assert(f.scroll.scrollTop > 0); assert.deepEqual(f.viewports.at(-1), f.workspace.readViewport());
  } finally { f.cleanup(); }
});


test('Alt blank dragging with a selected melody tone pans both axes while an ordinary click still writes once', async () => {
  const f = fixture({ initialViewport: { leftSeconds: 1, zoom: 4, top: 600, rowHeight: 24 } }); try {
    f.selectTone(); const before = f.phrase.read().body;
    f.scroll.emit('pointerdown', { target: f.canvas, clientX: 412, clientY: 300, altKey: true });
    assert.equal(f.previews.length, 0); assert.equal(f.auditions.length, 0);
    f.document.emit('pointermove', { clientX: 392, clientY: 280 });
    f.document.emit('pointermove', { clientX: 372, clientY: 260 }); f.document.emit('pointerup'); await settle();
    assert.deepEqual(f.workspace.readViewport(), { leftSeconds: 1.1, zoom: 4, top: 640, rowHeight: 24 });
    assert.deepEqual(f.phrase.read().body, before); assert.equal(f.changes(), 0); assert.equal(f.previews.length, 0); assert.equal(f.auditions.length, 0);
    assert.equal(f.root.querySelectorAll('.melody-note').length, 0);
    f.scroll.emit('pointerdown', { target: f.canvas, clientX: 412, clientY: 300 });
    f.document.emit('pointermove', { clientX: 414, clientY: 301 }); f.document.emit('pointerup'); await settle();
    assert.equal(f.phrase.read().body!.parts[0]!.notes.length, 1); assert.equal(f.auditions.length, 1); assert.equal(f.changes(), 1);
    assert(f.root.querySelector('.melody-note')!.classList.contains('is-selected'));
  } finally { f.cleanup(); }
});




test('ordinary wheel fine-tunes only the selected note duration without moving the view or playhead', () => {
  const f = fixture({ notes: true }); try {
    const original = f.phrase.read().body!.parts[0]!.notes[0]!; const at = f.pointAt(2.02);
    f.scroll.emit('pointerdown', { target: f.block(original.id), ...at }); f.document.emit('pointerup', at);
    const viewport = f.workspace.readViewport(); const changes = f.changes(); const seeks = [...f.seeks];
    f.scroll.emit('wheel', { target: f.block(original.id), deltaY: -100 });
    const next = f.phrase.read().body!.parts[0]!.notes[0]!;
    assert.deepEqual(next, { ...original, durationSeconds: .51, durationBeats: 1.02 });
    assert.deepEqual(f.workspace.readViewport(), viewport); assert.deepEqual(f.seeks, seeks); assert.equal(f.changes(), changes + 1);
    assert(f.block(original.id).classList.contains('is-selected')); assert.equal(Number.parseFloat(f.block(original.id).style.width!), .51 * f.canvas.clientWidth * viewport.zoom / 8);
    assert.equal(f.root.querySelectorAll('input').find(input => input.attributes.get('aria-label') === '时长 / 秒')!.value, '0.51');
    assert.equal(f.lastChange()!.body!.parts[0]!.notes[0]!.durationSeconds, .51, 'the shared playback callback receives the changed duration');
    f.scroll.emit('wheel', { target: f.block(original.id), deltaY: 25 });
    assert(Math.abs(f.phrase.read().body!.parts[0]!.notes[0]!.durationSeconds! - .5075) < 1e-10);
    f.document.emit('keydown', { target: f.scroll, key: 'Backspace' });
    assert.equal(f.phrase.read().body!.parts[0]!.notes[0]!.durationSeconds, .51);
    f.phrase.redo(); f.workspace.refresh(); assert(Math.abs(f.phrase.read().body!.parts[0]!.notes[0]!.durationSeconds! - .5075) < 1e-10);
  } finally { f.cleanup(); }
});

test('duration wheel normalizes device units and preserves short notes and natural tails at its bounds', () => {
  const f = fixture({ notes: true }); try {
    const id = f.phrase.read().body!.parts[0]!.notes[0]!.id; const at = f.pointAt(2.02);
    f.scroll.emit('pointerdown', { target: f.block(id), ...at }); f.document.emit('pointerup', at);
    const held = () => f.phrase.read().body!.parts[0]!.notes[0]!.durationSeconds!;
    f.scroll.emit('wheel', { target: f.block(id), deltaY: -3, deltaMode: 1 }); assert.equal(held(), .51);
    f.scroll.emit('wheel', { target: f.block(id), deltaY: 1, deltaMode: 2 }); assert.equal(held(), .5);
    f.scroll.emit('wheel', { target: f.block(id), deltaY: -100000 }); assert.equal(held(), .54, 'large wheel deltas stay a fine adjustment');
    f.phrase.updateNote(f.partId, id, { durationSeconds: .00011 }); f.workspace.refresh();
    f.scroll.emit('wheel', { target: f.block(id), deltaY: 100 }); assert.equal(held(), .0001);
    let token = f.library.currentToken(); f.scroll.emit('wheel', { target: f.block(id), deltaY: 100 }); assert.equal(f.library.currentToken(), token);
    f.phrase.updateNote(f.partId, id, { startBeat: 15.75, durationBeats: .25, durationSeconds: 96 }); f.workspace.refresh();
    token = f.library.currentToken(); f.scroll.emit('wheel', { target: f.block(id), deltaY: -100 }); assert.equal(f.library.currentToken(), token);
    f.scroll.emit('wheel', { target: f.block(id), deltaY: 100 });
    const tail = f.phrase.read().body!.parts[0]!.notes[0]!;
    assert.equal(tail.durationSeconds, 95.99); assert.equal(tail.durationBeats, .25); assert.equal(tail.startBeat, 15.75);
  } finally { f.cleanup(); }
});

test('note duration wheel leaves modifiers, labels, ruler, horizontal input and family-only navigation intact', () => {
  const f = fixture({ notes: true, initialViewport: { leftSeconds: 1, zoom: 2, top: 600, rowHeight: 24 } }); try {
    f.workspace.frameNotes();
    const id = f.phrase.read().body!.parts[0]!.notes[0]!.id; const at = f.pointAt(2.02);
    f.scroll.emit('pointerdown', { target: f.block(id), ...at }); f.document.emit('pointerup', at);
    const before = structuredClone(f.phrase.read().body); const token = f.library.currentToken();
    for (const modifiers of [{ ctrlKey: true }, { metaKey: true }, { shiftKey: true }, { altKey: true }]) f.scroll.emit('wheel', { target: f.canvas, deltaY: -20, ...modifiers });
    f.scroll.emit('wheel', { target: f.root.querySelector('.melody-key'), deltaY: 20 });
    f.root.querySelector('.melody-ruler')!.emit('wheel', { deltaY: 20 });
    f.scroll.emit('wheel', { target: f.canvas, deltaY: 0, deltaX: 20 });
    assert.deepEqual(f.phrase.read().body, before); assert.equal(f.library.currentToken(), token);
    f.selectTone(); const top = f.workspace.readViewport().top;
    f.scroll.emit('wheel', { target: f.canvas, deltaY: 20 }); assert(f.workspace.readViewport().top > top);
    assert.equal(f.library.currentToken(), token);
  } finally { f.cleanup(); }
});

test('legacy beat durations remain fine-adjustable and failed duration edits leave the note and selection intact', () => {
  const f = fixture({ notes: true }); try {
    const id = f.phrase.read().body!.parts[0]!.notes[0]!.id;
    f.phrase.setLength(512); f.phrase.updateNote(f.partId, id, { durationBeats: 240, durationSeconds: undefined }); f.workspace.refresh();
    const at = f.pointAt(2.02); f.scroll.emit('pointerdown', { target: f.block(id), ...at }); f.document.emit('pointerup', at);
    f.scroll.emit('wheel', { target: f.block(id), deltaY: 100 });
    let note = f.phrase.read().body!.parts[0]!.notes[0]!;
    assert.equal(note.durationSeconds, undefined); assert(Math.abs(note.durationBeats - 239.98) < 1e-10);
    f.phrase.updateNote(f.partId, id, { durationBeats: 1 }); f.workspace.refresh();
    f.scroll.emit('wheel', { target: f.block(id), deltaY: -100 }); note = f.phrase.read().body!.parts[0]!.notes[0]!;
    assert.equal(note.durationSeconds, .51); assert.equal(note.durationBeats, 1.02);
    const before = structuredClone(f.phrase.read().body); const token = f.library.currentToken(); const changes = f.changes();
    const update = f.phrase.updateNote; f.phrase.updateNote = () => { throw new Error('测试拒绝时长修改'); };
    f.scroll.emit('wheel', { target: f.block(id), deltaY: 100 }); f.phrase.updateNote = update;
    assert.deepEqual(f.phrase.read().body, before); assert.equal(f.library.currentToken(), token); assert.equal(f.changes(), changes);
    assert(f.block(id).classList.contains('is-selected')); assert.match(f.root.querySelector('.melody-notice')!.textContent, /测试拒绝/u);
  } finally { f.cleanup(); }
});



test('selecting a total note dims other families even when their sound identity is shared', () => {
  const f = fixture({ notes: true }); try {
    const shared = f.phrase.addPart(f.voices[0]!.id); const same = f.phrase.addNote(shared, { startBeat: 4, durationBeats: 1, frequencyHz: 440, velocity: .7 });
    const other = f.phrase.addPart(f.voices[1]!.id); const different = f.phrase.addNote(other, { startBeat: 6, durationBeats: 1, frequencyHz: 440, velocity: .7 });
    f.workspace.refresh(); f.selectTone(); assert.equal(f.block(same).classList.contains('is-dim'), true); assert.equal(f.block(different).classList.contains('is-dim'), true);
    assert.equal(f.block(same).style['--tone-color'], f.block(f.phrase.read().body!.parts[0]!.notes[0]!.id).style['--tone-color']);
  } finally { f.cleanup(); }
});




test('flush commits pending notes for save and disposal cancels unfinished edits and late auditions', async () => {
  const f = fixture(); try {
    f.selectTone(); f.scroll.emit('pointerdown', { target: f.canvas, ...f.pointAt(3) }); f.workspace.flush(); assert.equal(f.phrase.read().body!.parts[0]!.notes.length, 1);
    f.scroll.emit('pointerdown', { target: f.canvas, ...f.pointAt(5) }); f.workspace.dispose(); f.document.emit('pointerup'); await settle();
    assert.equal(f.phrase.read().body!.parts[0]!.notes.length, 1); assert.equal(f.previews.at(-1), undefined); assert.equal(f.scroll.hasPointerCapture(1), false);
  } finally { f.cleanup(); }
});

test('flush reports a failed pending write to its save caller and clears its temporary preview', () => {
  const f = fixture(); try {
    f.selectTone(); f.scroll.emit('pointerdown', { target: f.canvas, ...f.pointAt(3) });
    const originalAdd = f.phrase.addNote; f.phrase.addNote = () => { throw new Error('暂时无法写入音符'); };
    assert.throws(() => f.workspace.flush(), /暂时无法写入音符/u); assert.equal(f.phrase.read().body!.parts[0]!.notes.length, 0); assert.equal(f.previews.at(-1), undefined);
    f.phrase.addNote = originalAdd; f.scroll.emit('pointerdown', { target: f.canvas, ...f.pointAt(4) }); f.workspace.flush(); assert.equal(f.phrase.read().body!.parts[0]!.notes.length, 1);
    const volume = f.root.querySelectorAll('input').find(value => value.attributes.get('aria-label') === '音量')!;
    volume.value = '.3'; volume.emit('input'); const originalUpdate = f.phrase.updateNote; f.phrase.updateNote = () => { throw new Error('暂时无法调整音量'); };
    assert.throws(() => f.workspace.flush(), /暂时无法调整音量/u); assert.equal(f.phrase.read().body!.parts[0]!.notes[0]!.level, undefined); assert.equal(f.previews.at(-1), undefined); f.phrase.updateNote = originalUpdate;
  } finally { f.cleanup(); }
});



test('viewport refresh reuses grid nodes and accepts an already-read phrase snapshot', () => {
  const f = fixture({ fixedGridBpm: true }); const originalRead = f.phrase.read;
  try {
    const snapshot = f.phrase.read();
    const lines = f.root.querySelectorAll('.melody-grid-line');
    let reads = 0; f.phrase.read = () => { reads++; return originalRead(); };
    f.workspace.refresh(snapshot);
    assert(reads <= 1, 'a supplied snapshot must not be read again for rendering; audition scope may recheck once');
    assert.deepEqual(f.root.querySelectorAll('.melody-grid-line'), lines);
    f.scroll.emit('wheel', { ctrlKey: true, deltaY: -40, clientX: 212 });
    assert.equal(f.root.querySelectorAll('.melody-grid-line')[0], lines[0]);
  } finally { f.phrase.read = originalRead; f.cleanup(); }
});

function toneTransfer() {
  const data = new Map<string, string>(); let ghost = 0;
  return { effectAllowed: '', dropEffect: '', types: ['application/x-rootsound-timbre'],
    setData(type: string, value: string) { data.set(type, value); }, getData(type: string) { return data.get(type) ?? ''; },
    setDragImage() { ghost++; }, ghost: () => ghost };
}

test('tone-library two-dimensional sorting previews displaced cards and commits only its final drop', () => {
  const moves: Array<[string, number]> = [];
  let f!: ReturnType<typeof fixture>;
  f = fixture({ voices: 4, notes: true, onImportTimbre: async () => false, onReorderTimbres(id, index) {
    moves.push([id, index]); const previous = f.voices.findIndex(voice => voice.id === id);
    f.voices.splice(index, 0, f.voices.splice(previous, 1)[0]!);
  } });
  try {
    const before = f.phrase.read().draft; const token = f.library.currentToken(); const id = f.voices[0]!.id;
    f.root.querySelector('.melody-add-tone')!.emit('click'); const dialog = f.root.querySelector('.melody-tone-library')!;
    const grid = dialog.querySelector('.melody-library-grid')!; const cards = grid.querySelectorAll('.melody-library-card'); const data = toneTransfer();
    cards[0]!.emit('dragstart', { dataTransfer: data, clientX: 35, clientY: 65 });
    assert.equal(data.ghost(), 1); assert.equal(dialog.querySelector('.melody-tone-trash')!.hidden, false);
    grid.emit('dragover', { dataTransfer: data, clientX: 195, clientY: 112 });
    assert.equal(grid.classList.contains('is-sorting'), true);
    assert.equal(cards[0]!.style.transform, 'translate(120px, 44px)');
    assert.equal(cards[1]!.style.transform, 'translate(-120px, 0px)');
    assert.equal(cards[2]!.style.transform, 'translate(120px, -44px)');
    assert.equal(cards[3]!.style.transform, 'translate(-120px, 0px)');
    assert.deepEqual(moves, []); assert.equal(f.library.currentToken(), token);
    grid.emit('drop', { dataTransfer: data });
    assert.deepEqual(moves, [[id, 3]]);
    assert.equal(f.root.querySelector('.melody-tone-library'), dialog);
    assert.deepEqual(dialog.querySelectorAll('.melody-library-tone').map(tile => tile.textContent), ['音色 2', '音色 3', '音色 4', '音色 1']);
    assert.equal(dialog.querySelector('.melody-library-grid')!.children.at(-1)!.className, 'melody-library-import');
    assert.equal(dialog.querySelector('.melody-tone-trash')!.hidden, true);
    dialog.querySelector('.melody-library-tone')!.emit('click');
    assert.deepEqual(f.phrase.read().draft, before, 'a completed drag must not also pick a tone or create a family');
    assert.equal(f.library.currentToken(), token); assert.equal(f.auditions.length, 0);
  } finally { f.cleanup(); }
});

test('cancelled sorting and trash drops never reorder the tone library or activate a dragged tile', () => {
  const reordered: string[] = []; const removed: string[] = [];
  const f = fixture({ voices: 4, onReorderTimbres(id) { reordered.push(id); }, onRemoveTimbre(id) { removed.push(id); } });
  try {
    const token = f.library.currentToken(); f.root.querySelector('.melody-add-tone')!.emit('click');
    const dialog = f.root.querySelector('.melody-tone-library')!; const grid = dialog.querySelector('.melody-library-grid')!;
    let card = grid.querySelector('.melody-library-card')!; const data = toneTransfer(); const id = f.voices[0]!.id;
    card.emit('dragstart', { dataTransfer: data, clientX: 30, clientY: 60 });
    grid.emit('dragover', { dataTransfer: data, clientX: 195, clientY: 112 }); card.emit('dragend');
    assert.equal(grid.classList.contains('is-sorting'), false); assert.equal(card.style.transform, '');
    assert.deepEqual(reordered, []); assert.deepEqual(removed, []);
    card.emit('dragstart', { dataTransfer: data, clientX: 30, clientY: 60 });
    grid.emit('dragover', { dataTransfer: data, clientX: 195, clientY: 112 });
    dialog.querySelector('.melody-tone-trash')!.emit('drop', { dataTransfer: data });
    assert.deepEqual(removed, [id]); assert.deepEqual(reordered, []);
    assert.equal(f.library.currentToken(), token);
    card = dialog.querySelector('.melody-library-card')!;
    card.emit('dragstart', { dataTransfer: data, clientX: 30, clientY: 60 });
    const foreign = toneTransfer(); foreign.setData('application/x-rootsound-timbre', 'foreign');
    grid.emit('drop', { dataTransfer: foreign }); assert.deepEqual(reordered, []);
    assert.equal(dialog.querySelector('.melody-tone-trash')!.hidden, true);
  } finally { f.cleanup(); }
});

test('failed tone reorder reports inside the open library and leaves its previous order retryable', () => {
  let fail = true; const f = fixture({ voices: 4, onReorderTimbres() { if (fail) throw new Error('排序保存失败'); } });
  try {
    const token = f.library.currentToken(); f.root.querySelector('.melody-add-tone')!.emit('click');
    const dialog = f.root.querySelector('.melody-tone-library')!; const grid = dialog.querySelector('.melody-library-grid')!;
    const drag = () => {
      const card = grid.querySelector('.melody-library-card')!; const data = toneTransfer();
      card.emit('dragstart', { dataTransfer: data, clientX: 30, clientY: 60 }); grid.emit('dragover', { dataTransfer: data, clientX: 195, clientY: 112 }); grid.emit('drop', { dataTransfer: data });
    };
    drag(); assert.equal(dialog.querySelector('.melody-library-error')!.textContent, '排序保存失败');
    assert.equal(dialog.querySelector('.melody-library-error')!.hidden, false);
    assert.equal(grid.querySelector('.melody-library-card')!.style.transform, ''); assert.equal(f.library.currentToken(), token);
    fail = false; drag(); assert.equal(f.root.querySelector('.melody-tone-library'), dialog);
    assert.equal(dialog.querySelector('.melody-tone-trash')!.hidden, true);
  } finally { f.cleanup(); }
});

test('SPN label and canvas wheels share navigation modes and retain pitch/time anchors without editing', () => {
  const f = fixture({ notes: true, initialViewport: { leftSeconds: 1, zoom: 2, top: 200, rowHeight: 24 } }); try {
    const token = f.library.currentToken(); const before = f.phrase.read().draft;
    const wheel = (values: Record<string, unknown>) => f.scroll.emit('wheel', { target: f.root.querySelector('.melody-key')!, clientX: 180, clientY: 200, ...values });
    wheel({ deltaY: 60 }); assert.equal(f.workspace.readViewport().top, 260); assert.equal(f.workspace.readViewport().leftSeconds, 1);
    const pitchAnchor = (f.workspace.readViewport().top + 100) / 24;
    wheel({ deltaY: -100, ctrlKey: true });
    const vertical = f.workspace.readViewport(); assert(vertical.rowHeight > 24); assert.equal(vertical.zoom, 2);
    assert(Math.abs((vertical.top + 100) / vertical.rowHeight - pitchAnchor) < 1e-8);
    wheel({ deltaY: 100, shiftKey: true }); const horizontal = f.workspace.readViewport();
    assert.equal(horizontal.top, vertical.top); assert.equal(horizontal.leftSeconds, 1.5);
    wheel({ deltaY: -100, ctrlKey: true, shiftKey: true }); const zoomed = f.workspace.readViewport();
    assert(zoomed.zoom > horizontal.zoom); assert.equal(zoomed.rowHeight, horizontal.rowHeight); assert.equal(zoomed.leftSeconds, horizontal.leftSeconds);
    f.scroll.emit('wheel', { target: f.canvas, shiftKey: true, deltaY: 20, clientX: 400, clientY: 200 });
    assert.equal(f.workspace.readViewport().top, zoomed.top, 'Shift scrolls horizontally on both labels and grid');
    assert(f.workspace.readViewport().leftSeconds > zoomed.leftSeconds);
    assert.equal(f.library.currentToken(), token); assert.deepEqual(f.phrase.read().draft, before);
    assert.equal(f.auditions.length, 0); assert.equal(f.seeks.length, 0);
  } finally { f.cleanup(); }
});

test('console overflow consumes local non-control wheel input while focused and hovered form controls retain their meanings', () => {
  const environment = dom(); const root = new Element(); root.clientWidth = 300; root.scrollWidth = 1000;
  const text = new Element('strong'); const input = new Input('input'); input.type = 'range'; root.append(text, input);
  const remove = attachConsoleHorizontalWheel(root as unknown as HTMLElement);
  try {
    let prevented = 0; const event = { target: text, deltaY: 120, preventDefault() { prevented++; } };
    root.emit('wheel', event); assert.equal(root.scrollLeft, 120); assert.equal(prevented, 1);
    input.focus(); root.emit('wheel', event); assert.equal(root.scrollLeft, 240, 'prior slider focus cannot block scrolling elsewhere');
    root.emit('wheel', { ...event, target: input }); assert.equal(root.scrollLeft, 240); assert.equal(prevented, 2);
    root.emit('wheel', { ...event, ctrlKey: true }); assert.equal(root.scrollLeft, 240);
    root.emit('wheel', { ...event, defaultPrevented: true }); assert.equal(root.scrollLeft, 240);
    root.emit('wheel', { ...event, deltaMode: 1, deltaY: 2 }); assert.equal(root.scrollLeft, 288);
    root.emit('wheel', { ...event, deltaMode: 2, deltaY: 1 }); assert.equal(root.scrollLeft, 588);
    root.emit('wheel', { ...event, deltaY: 200 }); assert.equal(root.scrollLeft, 700);
    remove(); root.emit('wheel', { ...event, deltaY: -100 }); assert.equal(root.scrollLeft, 700);
  } finally { remove(); environment.restore(); }
});

test('a note range wheel adjusts its parameter once instead of scrolling the overflowing console', () => {
  const f = fixture({ notes: true }); try {
    const voice = f.phrase.read().body!.parts[0]!; const id = voice.notes[0]!.id;
    f.scroll.emit('pointerdown', { target: f.block(id), ...f.pointAt(2.2) }); f.document.emit('pointerup');
    const console = f.root.querySelector('.melody-console')!; console.clientWidth = 200; console.scrollWidth = 1200;
    const slider = console.querySelectorAll('input').find(input => input.type === 'range' && input.attributes.get('aria-label') === '音量')!;
    slider.focus(); const changes = f.changes(); slider.emit('wheel', { deltaY: 1 });
    assert.equal(f.phrase.read().body!.parts[0]!.notes[0]!.level, .99);
    assert.equal(f.changes(), changes + 1); assert.equal(console.scrollLeft, 0);
    assert.equal(f.phrase.read().body!.parts[0]!.notes[0]!.id, id);
  } finally { f.cleanup(); }
});


for (const ending of ['escape', 'pointercancel', 'dispose'] as const) test(`a drawn ghost cancelled by ${ending} leaves the existing note, selection and audio untouched`, async () => {
  const f = fixture({ notes: true }); try {
    const original = f.phrase.read().body!.parts[0]!.notes[0]!;
    f.scroll.emit('pointerdown', { target: f.block(original.id), ...f.pointAt(2.02) }); f.document.emit('pointerup'); await settle();
    const before = f.phrase.read().draft, token = f.library.currentToken(), auditionCount = f.auditions.length, previewCount = f.previews.length;
    const start = f.pointAt(6); f.scroll.emit('pointerdown', { target: f.canvas, ...start });
    f.document.emit('pointermove', { clientX: start.clientX + 43.2, clientY: start.clientY + 50 }); assert(f.root.querySelector('.is-drawing'));
    if (ending === 'escape') f.document.emit('keydown', { target: f.scroll, key: 'Escape' });
    else if (ending === 'dispose') f.workspace.dispose();
    else f.document.emit('pointercancel');
    f.document.emit('pointerup'); await settle();
    assert.deepEqual(f.phrase.read().draft, before); assert.equal(f.library.currentToken(), token); assert.equal(f.auditions.length, auditionCount);
    assert.equal(f.changes(), 0); assert.equal(f.scroll.hasPointerCapture(1), false);
    if (ending !== 'dispose') { assert.equal(f.root.querySelector('.is-drawing'), undefined); assert(f.block(original.id).classList.contains('is-selected')); assert.equal(f.previews.length, previewCount); }
  } finally { f.cleanup(); }
});




function dropFirstTone(f: ReturnType<typeof fixture>) {
  f.root.querySelector('.melody-add-tone')!.emit('click'); const library = f.root.querySelector('.melody-tone-library')!;
  const data = toneTransfer(); library.querySelector('.melody-library-card')!.emit('dragstart', { dataTransfer: data, clientX: 30, clientY: 60 });
  library.querySelector('.melody-tone-trash')!.emit('drop', { dataTransfer: data }); return library;
}

test('custom tone deletion warns before any change, supports cancellation and confirms exactly once', () => {
  const removed: string[] = []; const f = fixture({ confirmDeletion: true, onRemoveTimbre(id) { removed.push(id); } }); try {
    const token = f.library.currentToken(); const library = dropFirstTone(f); const warning = f.root.querySelector('.melody-tone-delete-dialog')!;
    assert(warning); assert.deepEqual(removed, []); assert.equal(f.library.currentToken(), token);
    warning.querySelector('.melody-tone-delete-cancel')!.emit('click'); assert.equal(f.root.querySelector('.melody-tone-delete-dialog'), undefined); assert.equal(f.root.querySelector('.melody-tone-library'), library);
    const data = toneTransfer(); library.querySelector('.melody-library-card')!.emit('dragstart', { dataTransfer: data }); library.querySelector('.melody-tone-trash')!.emit('drop', { dataTransfer: data });
    const confirm = f.root.querySelector('.melody-tone-delete-confirm')!; confirm.emit('click'); confirm.emit('click');
    assert.deepEqual(removed, [f.voices[0]!.id]); assert.equal(f.root.querySelector('.melody-tone-delete-dialog'), undefined); assert.equal(f.root.querySelector('.melody-tone-library'), library);
  } finally { f.cleanup(); }
});

for (const ending of ['cancel', 'library-close', 'draft-change', 'dispose'] as const) test(`a pending custom tone warning cannot remove a stale tone after ${ending}`, () => {
  const removed: string[] = []; const f = fixture({ confirmDeletion: true, onRemoveTimbre(id) { removed.push(id); } }); try {
    const library = dropFirstTone(f); const warning = f.root.querySelector('.melody-tone-delete-dialog')!, confirm = warning.querySelector('.melody-tone-delete-confirm')!;
    if (ending === 'cancel') warning.emit('cancel');
    else if (ending === 'library-close') library.querySelector('.melody-library-close')!.emit('click');
    else if (ending === 'dispose') f.workspace.dispose();
    else { f.phrase.create(f.voices[1]!.id); f.workspace.refresh(); }
    confirm.emit('click'); assert.deepEqual(removed, []); assert.equal(f.root.querySelector('.melody-tone-delete-dialog'), undefined);
  } finally { f.cleanup(); }
});

test('a failed custom tone removal keeps its warning retryable and an externally changed tone cannot be confirmed', () => {
  let calls = 0; const f = fixture({ confirmDeletion: true, onRemoveTimbre() { calls++; if (calls === 1) throw new Error('删除失败'); } }); try {
    dropFirstTone(f); const confirm = f.root.querySelector('.melody-tone-delete-confirm')!;
    confirm.emit('click'); assert.equal(calls, 1); assert.equal(confirm.disabled, false); assert.equal(f.root.querySelector('.melody-tone-delete-error')!.hidden, false);
    f.voices[0]!.name = '已经替换'; confirm.emit('click'); assert.equal(calls, 1); assert.equal(f.root.querySelector('.melody-tone-delete-dialog'), undefined);
  } finally { f.cleanup(); }
});



test('group merge drag preserves both note sets without selecting the target and is one undo step', () => {
  const f = fixture({ notes: true });
  try {
    const source = f.phrase.addPart(f.voices[0]!.id);
    f.phrase.addNote(source, { startBeat: 2, durationBeats: 1, frequencyHz: 440, velocity: .4, pan: -.5 });
    const before = structuredClone(f.phrase.read().body!);
    f.workspace.refresh();
    const cards = f.root.querySelectorAll('.melody-note-family');
    const sourceCard = cards.find(card => card.dataset.partId === source)!;
    const targetCard = cards.find(card => card.dataset.partId === f.partId)!;
    const data = toneTransfer(); sourceCard.emit('dragstart', { dataTransfer: data });
    targetCard.parentElement!.emit('dragover', { dataTransfer: data });
    assert.equal(targetCard.parentElement!.classList.contains('is-merge-target'), true);
    targetCard.parentElement!.emit('drop', { dataTransfer: data });
    const after = f.phrase.read().body!;
    assert.equal(after.parts.length, 1);
    assert.deepEqual(after.parts[0]!.notes, before.parts.flatMap(part => part.notes));
    assert.equal(f.root.querySelector('.melody-note-family')!.classList.contains('is-selected'), false);
    assert.equal(f.changes(), 1);
    f.phrase.undo(); assert.deepEqual(f.phrase.read().body, before);
    f.phrase.redo(); assert.deepEqual(f.phrase.read().body, after);
  } finally { f.cleanup(); }
});

for (const desktop of [false, true]) for (const selected of ['none', 'target', 'other', 'source'] as const) {
  if (desktop && selected === 'source') continue;
  test(`card merge preserves ${selected} selection in ${desktop ? 'desktop hand' : 'horizontal roll'}`, t => {
    let now = 10000; t.mock.method(Date, 'now', () => now);
    const f = fixture({ desktopPointerUx: desktop, notes: true });
    try {
      const source = f.phrase.addPart(f.voices[0]!.id), other = f.phrase.addPart(f.voices[1]!.id);
      f.phrase.addNote(source, { startBeat: 4, durationBeats: .5, frequencyHz: 220, velocity: .4 });
      f.workspace.refresh(); f.openTones();
      const chosen = selected === 'target' ? f.partId : selected === 'source' ? source : selected === 'other' ? other : undefined;
      if (chosen) f.selectTone(chosen);
      const before = structuredClone(f.phrase.read().body!);
      const find = (id: string) => f.root.querySelectorAll('.melody-note-family').find(card => card.dataset.partId === id)!;
      const otherPosition = find(other).parentElement!.style['--hand-x'];
      const transfer = toneTransfer(); find(source).emit('dragstart', { dataTransfer: transfer });
      find(f.partId).parentElement!.emit('drop', { dataTransfer: transfer });
      if (desktop && selected === 'none') {
        const hand = f.root.querySelector('.melody-tone-hand')!;
        assert.deepEqual(hand.children.map(entry => entry.dataset.partId), [f.partId, other]);
        assert.notEqual(find(other).parentElement!.style['--hand-x'], otherPosition);
      }
      assert.equal(f.phrase.read().body!.parts.length, 2);
      assert.deepEqual(f.phrase.read().body!.parts.find(part => part.id === f.partId)!.notes,
        before.parts.filter(part => part.id !== other).flatMap(part => part.notes));
      const expected = selected === 'source' ? undefined : chosen;
      const chosenCards = () => f.root.querySelectorAll('.melody-note-family').filter(card => card.classList.contains('is-selected')).map(card => card.dataset.partId);
      assert.deepEqual(chosenCards(), expected ? [expected] : []);
      find(f.partId).emit('click'); assert.deepEqual(chosenCards(), expected ? [expected] : [], 'drop must suppress its follow-up click');
      f.phrase.undo(); f.workspace.refresh(); assert.deepEqual(f.phrase.read().body, before);
      f.phrase.redo(); f.workspace.refresh(); assert.equal(f.phrase.read().body!.parts.length, 2);
      assert.deepEqual(chosenCards(), expected ? [expected] : []);
      now += 251;
      find(f.partId).emit('click'); assert.deepEqual(chosenCards(), desktop && expected === f.partId ? [] : [f.partId], 'an intentional later click keeps normal selection behavior');
    } finally { f.cleanup(); }
  });
}

test('group merge drag rejects different tones, itself, foreign payloads and stale drafts', () => {
  const f = fixture({ notes: true });
  try {
    const other = f.phrase.addPart(f.voices[1]!.id); f.workspace.refresh();
    let cards = f.root.querySelectorAll('.melody-note-family');
    const data = toneTransfer(), before = f.phrase.read().draft;
    cards[0]!.emit('dragstart', { dataTransfer: data });
    cards[1]!.parentElement!.emit('drop', { dataTransfer: data });
    assert.deepEqual(f.phrase.read().draft, before);
    cards[0]!.emit('dragstart', { dataTransfer: data });
    cards[0]!.parentElement!.emit('drop', { dataTransfer: data });
    assert.deepEqual(f.phrase.read().draft, before);
    f.phrase.setPartTimbre(other, f.voices[0]!.id); f.workspace.refresh();
    cards = f.root.querySelectorAll('.melody-note-family');
    cards[0]!.emit('dragstart', { dataTransfer: data });
    cards[1]!.parentElement!.emit('drop', { dataTransfer: toneTransfer() });
    assert.equal(f.phrase.read().body!.parts.length, 2);
    cards[0]!.emit('dragstart', { dataTransfer: data });
    f.phrase.create(f.voices[0]!.id); f.workspace.refresh();
    cards[1]!.parentElement!.emit('drop', { dataTransfer: data });
    assert.equal(f.phrase.read().body!.parts.length, 1); assert.equal(f.changes(), 0);
  } finally { f.cleanup(); }
});

function assertCloseValue(actual: unknown, expected: unknown, message?: string) { if(typeof actual==='number'&&typeof expected==='number') assert(Math.abs(actual-expected)<=1e-10*Math.max(1,Math.abs(expected)),message??String(actual)+' != '+String(expected)); else assert.equal(actual,expected,message??'values differ'); }

function pointInViewport(f: ReturnType<typeof fixture>,beat:number,frequency=440){const v=f.workspace.readViewport(),keys=f.phrase.keyboard().slice().reverse(),row=keys.findIndex(k=>Math.abs(k.frequencyHz-frequency)<.01);return {clientX:212+(beat*60/f.phrase.read().body!.tempoBpm-v.leftSeconds)*f.canvas.clientWidth*v.zoom/8,clientY:100+(row+.5)*v.rowHeight-f.scroll.scrollTop};}
test('initial viewport renders a windowed grid and the complete keyboard without edits', ()=>{const f=fixture();try{const v=f.workspace.readViewport();assert(v.zoom>1);assert.equal(f.root.querySelectorAll('.melody-key').length,f.phrase.keyboard().length);const lines=f.root.querySelectorAll('.melody-grid-line');assert(lines.length>0&&lines.length<65);assert.equal(f.phrase.read().body!.parts[0]!.notes.length,0);}finally{f.cleanup();}});

test('unified creation edits visible legacy rhythm notes without removed nudging shortcuts', async () => {
  const f = fixture({ notes: true, legacyRhythm: true, includeAllSections: true }); try {
    f.workspace.frameNotes(); const original = f.phrase.read().body!; const legacy = original.parts.find(part => part.id === f.legacyRhythmId)!; const note = legacy.notes[0]!;
    const originalMelody = structuredClone(original.parts.find(part => part.id === f.partId)!);
    f.selectTone(legacy.id);
    assert(f.root.querySelectorAll('.melody-note-family').find(card => card.dataset.partId === legacy.id)!.classList.contains('is-selected'));
    assert(!f.block(note.id).classList.contains('is-dim')); assert(f.block(originalMelody.notes[0]!.id).classList.contains('is-dim'));
    f.scroll.emit('pointerdown', { target: f.block(note.id), ...pointInViewport(f,4.02, 220) }); f.document.emit('pointerup'); await settle();
    const pitch = f.root.querySelectorAll('select').find(input => input.attributes.get('aria-label') === '音高')!; assert(pitch);
    const hz = f.phrase.keyboard().find(key => key.label === 'C4')!.frequencyHz; pitch.value = String(hz); pitch.emit('change');
    f.document.emit('keydown', { target: f.scroll, key: 'd' });
    const edited = f.phrase.read().body!.parts.find(part => part.id === legacy.id)!;
    assert.equal(edited.section, 'rhythm'); assert.equal(edited.id, legacy.id); assert.equal(edited.timbreId, legacy.timbreId);
    assert.equal(edited.notes[0]!.id, note.id); assert.equal(edited.notes[0]!.frequencyHz, hz); assert.equal(edited.notes[0]!.startBeat, 4);
    assert.equal(edited.notes[0]!.durationSeconds, .17); assert.equal(edited.notes[0]!.pan, -.2);
    assert.deepEqual(f.phrase.read().body!.parts.find(part => part.id === f.partId), originalMelody);
    f.phrase.undo(); assert.deepEqual(f.phrase.read().body!.parts.find(part => part.id === legacy.id), legacy);
  } finally { f.cleanup(); }
});


test('removing a populated legacy family requires confirmation and is undoable', ()=>{const f=fixture({notes:true,legacyRhythm:true,includeAllSections:true});try{const before=f.phrase.read().body!;f.selectTone(f.legacyRhythmId!);f.root.querySelector('.melody-delete-tone-notes')!.emit('click');assert(f.root.querySelector('.melody-tone-delete-dialog'));assert(f.phrase.read().body!.parts.some(p=>p.id===f.legacyRhythmId));f.root.querySelector('.melody-tone-delete-confirm')!.emit('click');assert(!f.phrase.read().body!.parts.some(p=>p.id===f.legacyRhythmId));assert.deepEqual(f.phrase.read().body!.parts.find(p=>p.id===f.partId),before.parts.find(p=>p.id===f.partId));f.phrase.undo();assert.deepEqual(f.phrase.read().body,before);}finally{f.cleanup();}});

test('mouse drawing retains the clicked free onset and can be cancelled', async () => {
  const f = fixture({initialViewport:{leftSeconds:0,zoom:1,top:1200,rowHeight:24}}); try {
    f.selectTone(); const at = f.pointAt(2.13); f.scroll.emit('pointerdown', { target: f.canvas, ...at });
    assert.equal(f.phrase.read().body!.parts[0]!.notes.length, 0); assert.equal(f.previews.length, 0); assert.equal(f.auditions.length, 0);
    f.document.emit('pointerup', at); await settle(); const note = f.phrase.read().body!.parts[0]!.notes[0]!;
    assert.equal(note.startBeat, 2.13); assert.equal(note.durationSeconds, .125); assert.equal(f.auditions.length, 1); assert.equal(f.changes(), 1);
    assert.equal(f.root.querySelector('.melody-console')!.querySelectorAll('input').length, 5);
    f.scroll.emit('pointerdown', { target: f.canvas, ...f.pointAt(4) }); f.document.emit('pointercancel');
    assert.equal(f.phrase.read().body!.parts[0]!.notes.length, 1); assert.equal(f.previews.at(-1), undefined); assert.equal(f.scroll.hasPointerCapture(1), false);
    f.phrase.undo(); assert.equal(f.phrase.read().body!.parts[0]!.notes.length, 0);
  } finally { f.cleanup(); }
});


test('dragging retains continuous unsnapped time and one undo step', () => {
  const f = fixture({ notes: true, initialViewport: {leftSeconds:0,zoom:1,top:1200,rowHeight:24} }); try {
    const original = f.phrase.read().body!.parts[0]!.notes[0]!; const originalX = Number.parseFloat(f.block(original.id).style.left ?? '0');
    const start = f.pointAt(2.02); f.scroll.emit('pointerdown', { target: f.block(original.id), ...start });
    f.document.emit('pointermove', { ...start, clientX: start.clientX + 17.3, clientY: start.clientY + 9.5 });
    assert(Math.abs(Number.parseFloat(f.block(original.id).style.left ?? '0') - originalX - 17.3) < 1e-7);
    assertCloseValue(f.phrase.read().body!.parts[0]!.notes[0]!.startBeat, 2); assert(f.previews.at(-1));
    f.document.emit('pointerup'); const moved = f.phrase.read().body!.parts[0]!.notes[0]!; assertCloseValue(moved.startBeat, 2 + 17.3/50); assertCloseValue(moved.durationSeconds, .5);
    assertCloseValue(f.changes(), 1); f.phrase.undo(); assert.deepEqual(f.phrase.read().body!.parts[0]!.notes[0], original);
  } finally { f.cleanup(); }
});


test('eraser sweeps protect dimmed families', ()=>{const f=fixture({notes:true});try{const other=f.phrase.addPart(f.voices[1]!.id),id=f.phrase.addNote(other,{startBeat:4,durationBeats:1,frequencyHz:440,velocity:.7});f.workspace.refresh();f.workspace.frameNotes();f.selectTone();const before=f.phrase.read().body!;const original=before.parts[0]!.notes[0]!;f.scroll.emit('pointerdown',{button:2,target:f.block(original.id),...pointInViewport(f,2.7)});f.document.emit('pointermove',{button:2,...pointInViewport(f,4.8)});f.document.emit('pointerup');assert.equal(f.phrase.read().body!.parts.find(p=>p.id===other)!.notes[0]!.id,id);assert.equal(f.phrase.read().body!.parts[0]!.notes.length,0);f.phrase.undo();assert.deepEqual(f.phrase.read().body,before);}finally{f.cleanup();}});

test('duration preview and slider commits use an explicit test scale', () => {
  const f = fixture({ notes: true, initialViewport: {leftSeconds:0,zoom:1,top:1200,rowHeight:24} }); try {
    const id = f.phrase.read().body!.parts[0]!.notes[0]!.id; f.scroll.emit('pointerdown', { target: f.block(id), ...f.pointAt(2.02) }); f.document.emit('pointerup');
    const input = (name: string) => f.root.querySelectorAll('input').find(value => value.attributes.get('aria-label') === name)!;
    const duration = input('时长 / 秒'); duration.value = '1.25'; duration.emit('input');
    assert.equal(f.previews.at(-1)!.parts[0]!.notes[0]!.durationSeconds, 1.25); assert.equal(Number.parseFloat(f.block(id).style.width ?? '0'), 125);
    assert.equal(f.phrase.read().body!.parts[0]!.notes[0]!.durationSeconds, .5); duration.emit('change'); assert.equal(f.phrase.read().body!.parts[0]!.notes[0]!.durationSeconds, 1.25);
    const volume = input('音量'); volume.emit('pointerdown', { pointerId: 4 }); volume.value = '.2'; volume.emit('input'); volume.value = '.4'; volume.emit('input');
    assert.equal(f.phrase.read().body!.parts[0]!.notes[0]!.level, undefined); f.document.emit('pointerup', { pointerId: 4 }); volume.emit('change');
    assert.equal(f.phrase.read().body!.parts[0]!.notes[0]!.level, .4); f.phrase.undo(); assert.equal(f.phrase.read().body!.parts[0]!.notes[0]!.level, undefined);
  } finally { f.cleanup(); }
});


test('wheel duration commits pending edits and preserves legacy family identity', () => {
  const f = fixture({ notes: true, legacyRhythm: true, includeAllSections: true }); try {
    f.workspace.frameNotes(); const melody = structuredClone(f.phrase.read().body!.parts[0]!);
    const legacy = f.phrase.read().body!.parts.find(part => part.id === f.legacyRhythmId)!; const note = legacy.notes[0]!;
    const at = pointInViewport(f,4.02, 220); f.scroll.emit('pointerdown', { target: f.block(note.id), ...at }); f.document.emit('pointerup', at);
    const duration = f.root.querySelectorAll('input').find(input => input.attributes.get('aria-label') === '时长 / 秒')!;
    duration.value = '.3'; duration.emit('input'); assertCloseValue(f.phrase.read().body!.parts[1]!.notes[0]!.durationSeconds, .17);
    f.scroll.emit('wheel', { target: f.block(note.id), deltaY: -100 });
    const result = f.phrase.read().body!.parts.find(part => part.id === legacy.id)!;
    assertCloseValue(result.section, 'rhythm'); assertCloseValue(result.notes[0]!.id, note.id);
    assertCloseValue(result.notes[0]!.durationSeconds, .31); assertCloseValue(result.notes[0]!.durationBeats, .62);
    assert.deepEqual(f.phrase.read().body!.parts[0], melody);
    const before = structuredClone(f.phrase.read().body); const token = f.library.currentToken(); const view = f.workspace.readViewport();
    for (const deltaY of [NaN, Infinity, -Infinity, 0]) f.scroll.emit('wheel', { target: f.block(note.id), deltaY });
    assert.deepEqual(f.phrase.read().body, before); assertCloseValue(f.library.currentToken(), token); assert.deepEqual(f.workspace.readViewport(), view);
    f.root.querySelector('.melody-add-tone')!.emit('click');
    f.scroll.emit('wheel', { target: f.block(note.id), deltaY: -100 });
    assertCloseValue(f.library.currentToken(), token, 'an open dialog cannot edit a selected background note');
  } finally { f.cleanup(); }
});


test('edge resizing and cancelled mix preserve the saved note at a known scale', () => {
  const f = fixture({ notes: true, initialViewport: {leftSeconds:0,zoom:1,top:1200,rowHeight:24} }); try {
    const original = f.phrase.read().body!.parts[0]!.notes[0]!; const block = f.block(original.id); const bounds = block.getBoundingClientRect();
    const point = { clientX: bounds.right - 2, clientY: bounds.top + 6 };
    f.scroll.emit('pointerdown', { target: block.querySelector('.melody-note-resize'), ...point });
    f.document.emit('pointermove', { ...point, clientX: point.clientX + 37.5 }); assertCloseValue(f.previews.at(-1)!.parts[0]!.notes[0]!.durationSeconds, .875);
    assertCloseValue(f.phrase.read().body!.parts[0]!.notes[0]!.durationSeconds, .5); f.document.emit('pointerup'); assertCloseValue(f.phrase.read().body!.parts[0]!.notes[0]!.durationSeconds, .875);
    f.phrase.undo(); assert.deepEqual(f.phrase.read().body!.parts[0]!.notes[0], original); f.workspace.refresh();
    const pan = f.root.querySelectorAll('input').find(value => value.attributes.get('aria-label') === '声像')!;
    pan.emit('pointerdown', { pointerId: 7 }); pan.value = '.8'; pan.emit('input'); assertCloseValue(f.previews.at(-1)!.parts[0]!.notes[0]!.pan, .8);
    f.document.emit('pointercancel', { pointerId: 7 }); assert.deepEqual(f.phrase.read().body!.parts[0]!.notes[0], original); assertCloseValue(f.previews.at(-1), undefined);
  } finally { f.cleanup(); }
});


test('removed QWEASD editing shortcuts leave selected notes unchanged', ()=>{const f=fixture({notes:true});try{const before=f.phrase.read().body!,n=before.parts[0]!.notes[0]!;f.scroll.emit('pointerdown',{target:f.block(n.id),...pointInViewport(f,2.02)});f.document.emit('pointerup');for(const key of ['a','d','q','w','e','s'])f.document.emit('keydown',{target:f.scroll,key});assert.deepEqual(f.phrase.read().body,before);assert.equal(f.changes(),0);}finally{f.cleanup();}});

test('tempo, end boundaries and compositor playhead work at an explicit scale', () => {
  const f = fixture({ notes: true, initialViewport: {leftSeconds:0,zoom:1,top:1200,rowHeight:24} }); try {
    f.selectTone(); const id = f.phrase.read().body!.parts[0]!.notes[0]!.id; const width = f.block(id).style.width; const x = Number.parseFloat(f.block(id).style.left ?? '0');
    f.phrase.setTempo(240, { preserveNoteDurations: true }); f.workspace.refresh(); assert.equal(f.block(id).style.width, width); assert.equal(Number.parseFloat(f.block(id).style.left ?? '0'), x / 2);
    assert.equal(f.root.querySelector('.melody-after-end')!.hidden, false); const count = f.phrase.read().body!.parts[0]!.notes.length;
    f.scroll.emit('pointerdown', { target: f.canvas, clientX: 912, clientY: 200 }); f.document.emit('pointerup'); assert.equal(f.phrase.read().body!.parts[0]!.notes.length, count);
    f.workspace.setPlayhead(1); assert.equal(f.root.querySelector('.melody-playhead')!.style.transform, 'translateX(100px)');
    f.root.querySelector('.melody-ruler')!.emit('pointerdown', { clientX: 412, clientY: 90 }); f.document.emit('pointerup'); assert.equal(f.seeks.at(-1), 2);
  } finally { f.cleanup(); }
});


test('eight tones have independent colors and legacy names remain visible', ()=>{const f=fixture({voices:8});try{for(const v of f.voices.slice(1))f.phrase.addPart(v.id);f.workspace.refresh();const colors=f.root.querySelectorAll('.melody-tone').map(n=>n.style['--tone-color']);assert.equal(new Set(colors).size,8);}finally{f.cleanup();}const legacy=fixture({placeholder:true});try{assert.equal(legacy.root.querySelectorAll('.melody-tone').length,1);assert.equal(legacy.root.querySelector('.melody-tone')!.textContent,'乐句 1 音色');}finally{legacy.cleanup();}});

test('audio-clock compositor frames read no score or layout', () => {
  const f = fixture({ notes: true, initialViewport: {leftSeconds:0,zoom:1,top:1200,rowHeight:24} }); const originalRead = f.phrase.read;
  try {
    const note = f.root.querySelector('.melody-note')!;
    const before = { ...note.style };
    f.phrase.read = () => { throw new Error('clock frame must not read project content'); };
    f.canvas.layoutReads = 0;
    f.scroll.layoutReads = 0;
    for (let frame = 0; frame < 120; frame++) f.workspace.setPlayhead(frame / 60);
    assert.equal(f.canvas.layoutReads, 0); assert.equal(f.scroll.layoutReads, 0);
    assert.deepEqual({ ...note.style }, before);
    f.workspace.setPlayhead(2);
    assert.equal(f.root.querySelector('.melody-playhead')!.style.transform, 'translateX(200px)');
  } finally { f.phrase.read = originalRead; f.cleanup(); }
});


test('dense dragging leaves unrelated blocks untouched at an explicit scale', () => {
  const f = fixture({ notes: true, initialViewport: {leftSeconds:0,zoom:1,top:1200,rowHeight:24} });
  try {
    f.phrase.addNotes(f.partId, Array.from({ length: 399 }, (_, index) => ({ startBeat: index / 26,
      durationBeats: .25, durationSeconds: .125, frequencyHz: 440, velocity: .6 })));
    f.workspace.refresh();
    const original = f.phrase.read().body!.parts[0]!.notes[0]!;
    const unrelated = f.root.querySelectorAll('.melody-note').find(block => block.dataset.noteId !== original.id)!;
    let unrelatedWrites = 0;
    unrelated.style = new Proxy(unrelated.style, { set(target, property, value) { unrelatedWrites++; return Reflect.set(target, property, value); } });
    const start = f.pointAt(2.02);
    f.scroll.emit('pointerdown', { target: f.block(original.id), ...start });
    unrelatedWrites = 0; f.canvas.layoutReads = 0;
    for (let step = 1; step <= 40; step++) f.document.emit('pointermove', { ...start, clientX: start.clientX + step });
    assert.equal(unrelatedWrites, 0);
    assert(f.canvas.layoutReads <= 40 * 4, `dense drag read layout ${f.canvas.layoutReads} times`);
    assert(Math.abs(Number.parseFloat(f.block(original.id).style.left!) - 140) < 1e-8);
    f.document.emit('pointerup');
    assert.equal(f.phrase.read().body!.parts[0]!.notes.length, 400);
    assert.equal(f.changes(), 1);
    assert.deepEqual(f.lastChange()?.body, f.phrase.read().body);
    f.phrase.undo(); assert.equal(f.phrase.read().body!.parts[0]!.notes[0]!.startBeat, 2);
  } finally { f.cleanup(); }
});


test('free drawing retains the exact anchor and commits one note on release', async () => {
  const f = fixture({initialViewport:{leftSeconds:0,zoom:1,top:1200,rowHeight:24}}); try {
    f.selectTone(); const before = f.phrase.read().draft, token = f.library.currentToken(); const viewport = f.workspace.readViewport();
    const start = f.pointAt(2.1); f.scroll.emit('pointerdown', { target: f.canvas, ...start });
    const ghost = f.root.querySelector('.is-drawing')!; assert(ghost); assert.equal(f.phrase.read().body!.parts[0]!.notes.length, 0);
    assert.equal(f.library.currentToken(), token); assert.deepEqual(f.phrase.read().draft, before);
    f.document.emit('pointermove', { clientX: start.clientX + 38.4, clientY: start.clientY + 96 });
    const moving = f.root.querySelector('.is-drawing')!;
    assert.equal(moving.style.left, '105px'); assert(Math.abs(Number.parseFloat(moving.style.width!) - 38.4) < 1e-8);
    assert.equal(moving.style.top, ghost.style.top); assert.equal(f.previews.length, 0); assert.equal(f.auditions.length, 0);
    assert.equal(f.changes(), 0); assert.deepEqual(f.workspace.readViewport(), viewport);
    f.document.emit('pointerup'); await settle();
    const note = f.phrase.read().body!.parts[0]!.notes[0]!;
    assert.equal(note.startBeat, 2.1); assert.equal(note.durationSeconds, .375); assert.equal(note.durationBeats, .75); assert.equal(note.frequencyHz, 440);
    assert.equal(f.root.querySelector('.is-drawing'), undefined); assert(f.block(note.id).classList.contains('is-selected'));
    assert.equal(f.changes(), 1); assert.equal(f.auditions.length, 1); assert.equal(f.auditions[0]!.note.holdSeconds, .375);
    const next = f.pointAt(4.13); f.scroll.emit('pointerdown', { target: f.canvas, ...next });
    f.document.emit('pointermove', { clientX: next.clientX - 100, clientY: next.clientY - 48 }); f.document.emit('pointerup'); await settle();
    const notes = f.phrase.read().body!.parts[0]!.notes; assert.equal(notes.length, 2); assert.deepEqual(notes[0], note);
    assertCloseValue(notes[1]!.startBeat, 4.13); assert.equal(notes[1]!.durationSeconds, .125); assert.equal(notes[1]!.frequencyHz, 440);
    assert.equal(f.auditions.length, 2); f.phrase.undo(); assert.deepEqual(f.phrase.read().body!.parts[0]!.notes, [note]);
  } finally { f.cleanup(); }
});


test('two visual cells preserve free note onsets and existing notes', async()=>{const f=fixture({notes:true,performance:true});try{const before=f.phrase.read().body!.parts[0]!.notes[0]!;f.phrase.setStepsPerBeat(2);f.workspace.refresh();assert.deepEqual(f.phrase.read().body!.parts[0]!.notes[0],before);f.selectTone();const beat=4+.2/2,at=pointInViewport(f,beat);f.scroll.emit('pointerdown',{target:f.canvas,...at});f.document.emit('pointerup');await settle();const note=f.phrase.read().body!.parts[0]!.notes[1]!;assertCloseValue(note.startBeat,beat);assertCloseValue(note.durationSeconds,.5/2);const time=note.startBeat;f.document.emit('keydown',{target:f.scroll,key:'d'});assertCloseValue(f.phrase.read().body!.parts[0]!.notes[1]!.startBeat,time);}finally{f.cleanup();}});

test('three visual cells preserve free note onsets and existing notes', async()=>{const f=fixture({notes:true,performance:true});try{const before=f.phrase.read().body!.parts[0]!.notes[0]!;f.phrase.setStepsPerBeat(3);f.workspace.refresh();assert.deepEqual(f.phrase.read().body!.parts[0]!.notes[0],before);f.selectTone();const beat=4+.2/3,at=pointInViewport(f,beat);f.scroll.emit('pointerdown',{target:f.canvas,...at});f.document.emit('pointerup');await settle();const note=f.phrase.read().body!.parts[0]!.notes[1]!;assertCloseValue(note.startBeat,beat);assertCloseValue(note.durationSeconds,.5/3);const time=note.startBeat;f.document.emit('keydown',{target:f.scroll,key:'d'});assertCloseValue(f.phrase.read().body!.parts[0]!.notes[1]!.startBeat,time);}finally{f.cleanup();}});

test('nine visual cells preserve free note onsets and existing notes', async()=>{const f=fixture({notes:true,performance:true});try{const before=f.phrase.read().body!.parts[0]!.notes[0]!;f.phrase.setStepsPerBeat(9);f.workspace.refresh();assert.deepEqual(f.phrase.read().body!.parts[0]!.notes[0],before);f.selectTone();const beat=4+.5/9,at=pointInViewport(f,beat);f.scroll.emit('pointerdown',{target:f.canvas,...at});f.document.emit('pointerup');await settle();const note=f.phrase.read().body!.parts[0]!.notes[1]!;assertCloseValue(note.startBeat,beat);assertCloseValue(note.durationSeconds,.5/9);const time=note.startBeat;f.document.emit('keydown',{target:f.scroll,key:'d'});assertCloseValue(f.phrase.read().body!.parts[0]!.notes[1]!.startBeat,time);}finally{f.cleanup();}});

test('two-cell grids permit valid notes in a fractional tail', ()=>{const f=fixture({initialViewport:{leftSeconds:0,zoom:1,top:1200,rowHeight:24}});try{f.phrase.setLength(3.17);f.phrase.setStepsPerBeat(2);f.workspace.refresh();f.selectTone();const beat=3.12,at=pointInViewport(f,beat);f.scroll.emit('pointerdown',{target:f.canvas,...at});f.document.emit('pointerup');const note=f.phrase.read().body!.parts[0]!.notes[0]!;assertCloseValue(note.startBeat,beat);assert(note.durationBeats>0&&note.startBeat+note.durationBeats<=3.17+1e-10);f.phrase.undo();assert.equal(f.phrase.read().body!.parts[0]!.notes.length,0);}finally{f.cleanup();}});

test('three-cell grids permit valid notes in a fractional tail', ()=>{const f=fixture({initialViewport:{leftSeconds:0,zoom:1,top:1200,rowHeight:24}});try{f.phrase.setLength(3.17);f.phrase.setStepsPerBeat(3);f.workspace.refresh();f.selectTone();const beat=3.12,at=pointInViewport(f,beat);f.scroll.emit('pointerdown',{target:f.canvas,...at});f.document.emit('pointerup');const note=f.phrase.read().body!.parts[0]!.notes[0]!;assertCloseValue(note.startBeat,beat);assert(note.durationBeats>0&&note.startBeat+note.durationBeats<=3.17+1e-10);f.phrase.undo();assert.equal(f.phrase.read().body!.parts[0]!.notes.length,0);}finally{f.cleanup();}});

test('nine-cell grids permit valid notes in a fractional tail', ()=>{const f=fixture({initialViewport:{leftSeconds:0,zoom:1,top:1200,rowHeight:24}});try{f.phrase.setLength(3.17);f.phrase.setStepsPerBeat(9);f.workspace.refresh();f.selectTone();const beat=3.12,at=pointInViewport(f,beat);f.scroll.emit('pointerdown',{target:f.canvas,...at});f.document.emit('pointerup');const note=f.phrase.read().body!.parts[0]!.notes[0]!;assertCloseValue(note.startBeat,beat);assert(note.durationBeats>0&&note.startBeat+note.durationBeats<=3.17+1e-10);f.phrase.undo();assert.equal(f.phrase.read().body!.parts[0]!.notes.length,0);}finally{f.cleanup();}});

test('a short score supports valid sub-grid notes and undo', ()=>{const f=fixture({initialViewport:{leftSeconds:0,zoom:1,top:1200,rowHeight:24}});try{f.phrase.setLength(.25);const id=f.phrase.addNote(f.partId,{startBeat:0,durationBeats:.25,durationSeconds:.125,frequencyHz:440,velocity:.75});f.phrase.setStepsPerBeat(2);f.workspace.refresh();f.selectTone();const before=f.phrase.read().body!,at=pointInViewport(f,.15);f.scroll.emit('pointerdown',{target:f.canvas,...at});f.document.emit('pointerup');const notes=f.phrase.read().body!.parts[0]!.notes;assert.equal(notes.length,2);assert.equal(notes[0]!.id,id);assertCloseValue(notes[1]!.startBeat,.15);assert(notes[1]!.startBeat+notes[1]!.durationBeats<=.25+1e-10);f.phrase.undo();assert.deepEqual(f.phrase.read().body,before);}finally{f.cleanup();}});
