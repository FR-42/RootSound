import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import test from 'node:test';
import type { PlaybackSession, SoundRuntimeEvent, SoundRuntimePort, SoundSequencePlan } from '../src/workstation/contracts/sound.ts';
import { createMaterialLibrary } from '../src/workstation/modules/materials/public.ts';
import { createTimbreEditor, createTimbrePlayback } from '../src/workstation/modules/timbre/public.ts';
import { createPhraseEditor } from '../src/workstation/modules/phrase/public.ts';
import { clampPhraseCompositionView, panPhraseComposition, phraseCompositionBeatAt, zoomPhraseComposition } from '../src/workstation/modules/ui-rendering/phrase-composition-geometry.ts';

const hooks = registerHooks({ load(url, context, nextLoad) {
  return url.endsWith('.css') ? { format: 'module', source: '', shortCircuit: true } : nextLoad(url, context);
} });
const { mountPhraseComposition } = await import('../src/workstation/modules/ui-rendering/phrase-composition.ts'); hooks.deregister();

type FakeEvent = Record<string, unknown> & { type: string; target: FakeElement; preventDefault(): void; stopPropagation(): void };
class FakeElement {
  tagName: string; className = ''; style: Record<string, string> = {}; dataset: Record<string, string> = {};
  parentElement?: FakeElement; children: FakeElement[] = []; attributes = new Map<string, string>();
  value = ''; hidden = false; disabled = false; tabIndex = 0; clientWidth = 1000; clientHeight = 700;
  private text = ''; private listeners = new Map<string, Array<(event: FakeEvent) => void>>(); private captured = new Set<number>();
  constructor(tag = 'div') { this.tagName = tag.toUpperCase(); }
  get textContent() { return this.text; }
  set textContent(value: string) { this.text = value; for (const child of this.children) child.parentElement = undefined; this.children = []; }
  classList = {
    add: (...names: string[]) => { this.className = [...new Set([...this.className.split(' ').filter(Boolean), ...names])].join(' '); },
    remove: (...names: string[]) => { this.className = this.className.split(' ').filter(name => !names.includes(name)).join(' '); },
    contains: (name: string) => this.className.split(' ').includes(name),
    toggle: (name: string, force?: boolean) => { const on = force ?? !this.classList.contains(name); if (on) this.classList.add(name); else this.classList.remove(name); return on; },
  };
  append(...nodes: FakeElement[]): void { for (const child of nodes) { child.remove(); child.parentElement = this; this.children.push(child); } }
  replaceChildren(...nodes: FakeElement[]): void { this.textContent = ''; this.append(...nodes); }
  remove(): void { if (this.parentElement) this.parentElement.children = this.parentElement.children.filter(child => child !== this); this.parentElement = undefined; }
  setAttribute(key: string, value: string): void { this.attributes.set(key, value); }
  matches(selector: string): boolean {
    if (selector.startsWith('.')) return this.classList.contains(selector.slice(1));
    const match = /^([a-z][a-z0-9]*)(?:\[([^\]]+)\])?$/u.exec(selector);
    return !!match && this.tagName.toLowerCase() === match[1] && (!match[2] || this.attributes.has(match[2]));
  }
  querySelectorAll(selector: string): FakeElement[] { return this.children.flatMap(child => [...(child.matches(selector) ? [child] : []), ...child.querySelectorAll(selector)]); }
  querySelector(selector: string): FakeElement | undefined { return this.querySelectorAll(selector)[0]; }
  addEventListener(type: string, callback: (event: FakeEvent) => void): void { this.listeners.set(type, [...this.listeners.get(type) ?? [], callback]); }
  removeEventListener(type: string, callback: (event: FakeEvent) => void): void { this.listeners.set(type, (this.listeners.get(type) ?? []).filter(item => item !== callback)); }
  emit(type: string, values: Record<string, unknown> = {}): FakeEvent {
    const event = { type, target: this, pointerId: 1, button: 0, clientX: 0, clientY: 0, key: '', code: '', deltaX: 0, deltaY: 0,
      ctrlKey: false, metaKey: false, shiftKey: false, repeat: false, preventDefault() {}, stopPropagation() {}, ...values } as FakeEvent;
    for (const listener of this.listeners.get(type) ?? []) listener(event); return event;
  }
  getBoundingClientRect() { return { left: 172, top: 76, width: this.clientWidth, height: this.clientHeight }; }
  setPointerCapture(id: number): void { this.captured.add(id); }
  hasPointerCapture(id: number): boolean { return this.captured.has(id); }
  releasePointerCapture(id: number): void { this.captured.delete(id); }
  focus(): void { const document = globalThis.document as unknown as FakeDocument; if (document.activeElement !== this) document.activeElement?.blur(); document.activeElement = this; }
  blur(): void { const document = globalThis.document as unknown as FakeDocument; if (document.activeElement === this) document.activeElement = undefined; this.emit('blur'); }
  select(): void {}
}
class FakeInput extends FakeElement {}
class FakeSelect extends FakeElement {}
class FakeTextArea extends FakeElement {}
class FakeDocument extends FakeElement {
  activeElement?: FakeElement;
  createElement(tag: string): FakeElement { return tag === 'input' ? new FakeInput(tag) : new FakeElement(tag); }
  createElementNS(_namespace: string, tag: string): FakeElement { return this.createElement(tag); }
}
function installDom() {
  const document = new FakeDocument('document'); const window = new FakeElement('window'); const timers: ReturnType<typeof setTimeout>[] = [];
  Object.assign(window, { setTimeout(callback: () => void, delay: number) { const timer = setTimeout(callback, delay); timer.unref(); timers.push(timer); return Number(timer); }, clearTimeout });
  const replacements = { document, window, HTMLElement: FakeElement, HTMLInputElement: FakeInput, HTMLSelectElement: FakeSelect,
    HTMLTextAreaElement: FakeTextArea, Node: FakeElement, requestAnimationFrame: () => 1, cancelAnimationFrame() {} };
  const previous = new Map<string, PropertyDescriptor | undefined>();
  for (const [key, value] of Object.entries(replacements)) { previous.set(key, Object.getOwnPropertyDescriptor(globalThis, key)); Object.defineProperty(globalThis, key, { configurable: true, writable: true, value }); }
  return { document, restore() { timers.forEach(clearTimeout); for (const [key, descriptor] of previous) { if (descriptor) Object.defineProperty(globalThis, key, descriptor); else Reflect.deleteProperty(globalThis, key); } } };
}
const settle = async () => { for (let index = 0; index < 10; index++) await Promise.resolve(); };
function deferred() { let resolve!: () => void; let reject!: (error: Error) => void; const promise = new Promise<void>((yes, no) => { resolve = yes; reject = no; }); return { promise, resolve, reject }; }
function fixture(overrides: Partial<Parameters<typeof mountPhraseComposition>[1]> = {}, config: { legacy?: boolean; empty?: boolean } = {}) {
  const dom = installDom(); const library = createMaterialLibrary(); const timbre = createTimbreEditor(library); const voice = timbre.save('new');
  if (voice.status !== 'saved') throw new Error('voice');
  const phrase = createPhraseEditor(library, createTimbrePlayback(library)); phrase.create(voice.content.id); phrase.rename('乐句 1'); phrase.setTempo(120); phrase.setLength(config.legacy ? 24 : 16);
  if (!config.empty) phrase.addNote(phrase.read().body!.parts[0]!.id, { startBeat: config.legacy ? 20 : 1, durationBeats: 1, frequencyHz: 220, velocity: .7 });
  const plans: SoundSequencePlan[] = []; const methods: string[] = []; let session: PlaybackSession | undefined; let count = 0; let elapsed = 0;
  const listeners = new Set<(event: SoundRuntimeEvent) => void>();
  const emit = (status: PlaybackSession['status']) => { if (!session) return; session = { ...session, status }; for (const listener of listeners) listener({ type: 'session', session }); };
  const runtime = { async preview(plan: SoundSequencePlan) { plans.push(plan); methods.push('preview'); elapsed = 0; return session = { id: String(++count), status: 'playing', startedAtSeconds: 0, durationSeconds: plan.durationSeconds }; },
    update(_id: string, plan: SoundSequencePlan) { plans.push(plan); methods.push('update'); return session; },
    pause() { methods.push('pause'); emit('paused'); return session; }, async resume(_id: string, plan: SoundSequencePlan) { plans.push(plan); methods.push('resume'); emit('playing'); return session!; },
    position: () => elapsed, stop() { methods.push('stop'); emit('stopped'); }, stopAll() { methods.push('stopAll'); emit('stopped'); },
    subscribe(listener: (event: SoundRuntimeEvent) => void) { listeners.add(listener); return () => listeners.delete(listener); },
  } as unknown as SoundRuntimePort;
  const root = new FakeElement('main'); let saved = 0; let exited = 0;
  const workspace = mountPhraseComposition(root as unknown as HTMLElement, { phrase, sound: runtime, onSave() { saved++; }, onExit() { exited++; }, ...overrides });
  const viewport = root.querySelector('.phrase-composition-viewport')!; const ruler = root.querySelector('.phrase-composition-ruler')!;
  return { ...dom, phrase, library, root, workspace, viewport, ruler, plans, methods, saved: () => saved, exited: () => exited, elapsed(value: number) { elapsed = value; },
    cleanup() { workspace.dispose(); dom.restore(); } };
}

test('four-bar geometry clamps the entire visible window and keeps the zoom anchor stable', () => {
  assert.deepEqual(clampPhraseCompositionView({ leftBeat: 9, zoom: 1 }), { leftBeat: 0, zoom: 1 });
  const zoomed = zoomPhraseComposition({ leftBeat: 0, zoom: 1 }, 800, 200, 4);
  assert.deepEqual(zoomed, { leftBeat: 3, zoom: 4 }); assert.equal(phraseCompositionBeatAt(zoomed, 800, 200), 4);
  assert.deepEqual(panPhraseComposition(zoomed, 800, 100_000), { leftBeat: 12, zoom: 4 });
  assert.deepEqual(panPhraseComposition(zoomed, 800, -100_000), { leftBeat: 0, zoom: 4 });
  assert.deepEqual(zoomPhraseComposition(zoomed, 800, 200, .01), { leftBeat: 0, zoom: 1 });
  assert.equal(clampPhraseCompositionView({ leftBeat: 90, zoom: 100 }).zoom, 32);
  assert.equal(phraseCompositionBeatAt(zoomed, 800, -10000), 0); assert.equal(phraseCompositionBeatAt(zoomed, 800, 10000), 16);
  assert(Number.isFinite(phraseCompositionBeatAt(zoomed, 0, 0)));
});

test('phrase shell contains two blank shared sections and the compact song-style topbar', () => {
  const f = fixture({}, { legacy: true }); try {
    const before = f.phrase.read().body;
    assert.equal(f.root.querySelector('.song-project-name')!.textContent, '乐句 1');
    assert.equal(f.root.querySelector('.song-project-kind')!.textContent, '乐句');
    assert.deepEqual(f.root.querySelectorAll('.phrase-composition-control').map(item => item.textContent), ['旋律部', '节奏部']);
    assert.equal(f.root.querySelectorAll('.phrase-composition-section').length, 2);
    assert.equal(f.root.querySelectorAll('.phrase-composition-playhead').length, 1);
    assert.equal(f.root.querySelectorAll('.phrase-composition-head-handle').length, 1);
    assert.equal(f.root.querySelector('.phrase-composition-create')!.textContent, '创作');
    assert.equal(f.root.querySelector('.phrase-composition-rhythm-create')!.textContent, '创作');
    assert.equal(f.root.querySelectorAll('.phrase-note').length + f.root.querySelectorAll('.song-grid-lines').length, 0);
    assert.deepEqual(f.root.querySelectorAll('.song-save').map(item => item.textContent), ['保存']);
    assert.equal(f.root.querySelector('.song-clock')!.textContent, '00:00.000');
    assert.deepEqual(f.phrase.read().body, before); assert.equal(before!.lengthBeats, 24); assert.equal(before!.parts[0]!.notes[0]!.startBeat, 20);
  } finally { f.cleanup(); }
});

test('wheel and blank drags pan one shared bounded view, without seeking or changing music', () => {
  const f = fixture({}, { legacy: true }); try {
    const before = f.phrase.read().body;
    f.viewport.emit('wheel', { deltaY: 500 }); assert.equal(f.viewport.dataset.leftBeat, '0');
    f.viewport.emit('wheel', { ctrlKey: true, deltaY: -Math.log(4) / .002, clientX: 672 });
    assert.equal(Number(f.viewport.dataset.zoom), 4); assert.equal(Number(f.viewport.dataset.leftBeat), 9);
    f.viewport.emit('wheel', { shiftKey: true, deltaY: 100000 }); assert.equal(Number(f.viewport.dataset.leftBeat), 18);
    f.viewport.emit('wheel', { deltaY: -100000 }); assert.equal(Number(f.viewport.dataset.leftBeat), 0);
    f.viewport.emit('pointerdown', { clientX: 872, target: f.root.querySelector('.phrase-composition-rhythm') });
    assert(f.viewport.hasPointerCapture(1));
    f.document.emit('pointermove', { clientX: 622 }); assert.equal(Number(f.viewport.dataset.leftBeat), 1.5);
    assert.equal(f.root.querySelector('.song-clock')!.textContent, '00:00.000');
    f.document.emit('pointercancel'); assert.equal(f.viewport.hasPointerCapture(1), false);
    f.document.emit('pointermove', { clientX: 172 }); assert.equal(Number(f.viewport.dataset.leftBeat), 1.5);
    f.viewport.emit('wheel', { ctrlKey: true, deltaY: 100000, clientX: 672 }); assert.equal(f.viewport.dataset.zoom, '1'); assert.equal(f.viewport.dataset.leftBeat, '0');
    assert.deepEqual(f.phrase.read().body, before);
  } finally { f.cleanup(); }
});

test('only the narrow ruler summons and smoothly drags the head; cancellation releases capture', () => {
  const f = fixture(); try {
    f.ruler.emit('pointerdown', { clientX: 672 }); assert.equal(f.root.querySelector('.song-clock')!.textContent, '00:04.000'); assert(f.ruler.hasPointerCapture(1));
    f.document.emit('pointermove', { clientX: 672.125 }); assert(Math.abs(Number.parseFloat(f.root.querySelector('.phrase-composition-playhead')!.style.left ?? '0') - 500.125) < 1e-8);
    f.document.emit('pointermove', { clientX: 5000 }); assert.equal(f.root.querySelector('.song-clock')!.textContent, '00:08.000');
    f.document.emit('pointermove', { clientX: -100 }); assert.equal(f.root.querySelector('.song-clock')!.textContent, '00:00.000');
    f.document.emit('pointerup'); assert.equal(f.ruler.hasPointerCapture(1), false);
    f.ruler.emit('pointerdown', { clientX: 422 }); f.ruler.emit('lostpointercapture'); f.document.emit('pointermove', { clientX: 672 });
    assert.equal(f.root.querySelector('.song-clock')!.textContent, '00:02.000');
    f.root.querySelector('.song-stop')!.emit('click'); assert.equal(f.root.querySelector('.song-clock')!.textContent, '00:00.000');
  } finally { f.cleanup(); }
});

test('empty phrases run a silent four-bar clock, and the topbar plays, pauses, resumes and changes head speed', async () => {
  const f = fixture({}, { empty: true }); try {
    const play = f.root.querySelector('.song-play')!; assert.equal(play.disabled, false); play.emit('click'); await settle();
    assert.equal(f.plans[0]!.durationSeconds, 8); assert.deepEqual(f.plans[0]!.events, []); assert.equal(play.attributes.get('aria-label'), '暂停');
    f.elapsed(2); f.root.querySelectorAll('.song-rate-choice')[1]!.emit('click'); await settle();
    assert.equal(f.plans.at(-1)!.transport!.rate, .75);
    play.emit('click'); assert.equal(play.attributes.get('aria-label'), '播放');
    play.emit('click'); await settle(); assert.equal(f.methods.at(-1), 'resume');
    f.root.querySelector('.song-stop')!.emit('click'); assert.equal(f.root.querySelector('.song-clock')!.textContent, '00:00.000');
    assert.equal(play.attributes.get('aria-label'), '播放');
  } finally { f.cleanup(); }
});

test('saving and Ctrl-S share one pending action, surface failure and remain usable for retries', async () => {
  const pending = deferred(); let attempts = 0;
  const f = fixture({ onSave() { attempts++; return attempts === 1 ? pending.promise : undefined; } }); try {
    const save = f.root.querySelector('.song-save')!; save.emit('click'); f.document.emit('keydown', { key: 's', ctrlKey: true }); await settle();
    assert.equal(attempts, 1); assert.equal(save.disabled, true);
    pending.reject(new Error('写入失败')); await settle(); assert.equal(save.disabled, false); assert.equal(f.root.querySelector('.phrase-composition-notice')!.textContent, '写入失败');
    f.document.emit('keydown', { key: 's', ctrlKey: true }); await settle(); assert.equal(attempts, 2); assert.equal(f.root.querySelector('.phrase-composition-notice')!.textContent, '已保存');
    f.root.querySelector('.song-exit')!.emit('click'); await settle(); assert.equal(f.exited(), 1);
  } finally { f.cleanup(); }
});

test('saving a continued draft keeps the same zoom, head and playing or paused state', async () => {
  for (const playing of [false, true]) {
    const f = fixture({ onSave() {
      const saved = f.phrase.save('new'); if (saved.status !== 'saved') throw new Error('save failed');
      const continuation = f.library.createDraft({ sourceId: saved.content.id }); f.phrase.openDraft(continuation.id); f.workspace.refresh();
    } }); try {
      const draftId = f.phrase.read().draft!.id; const notes = f.phrase.read().body!.parts;
      f.viewport.emit('wheel', { ctrlKey: true, deltaY: -Math.log(4) / .002, clientX: 672 });
      f.ruler.emit('pointerdown', { clientX: 422 }); f.document.emit('pointerup');
      const play = f.root.querySelector('.song-play')!;
      play.emit('click'); await settle(); if (!playing) play.emit('click');
      const before = { zoom: f.viewport.dataset.zoom, left: f.viewport.dataset.leftBeat, time: f.root.querySelector('.song-clock')!.textContent,
        state: play.attributes.get('aria-label'), stops: f.methods.filter(method => method === 'stop').length };
      if (playing) f.root.querySelector('.song-save')!.emit('click'); else f.document.emit('keydown', { key: 's', ctrlKey: true });
      await settle();
      assert.notEqual(f.phrase.read().draft!.id, draftId);
      assert.equal(f.viewport.dataset.zoom, before.zoom); assert.equal(f.viewport.dataset.leftBeat, before.left);
      assert.equal(f.root.querySelector('.song-clock')!.textContent, before.time); assert.equal(play.attributes.get('aria-label'), before.state);
      assert.equal(f.methods.filter(method => method === 'stop').length, before.stops); assert.deepEqual(f.phrase.read().body!.parts, notes);
      assert.equal(f.root.querySelector('.phrase-composition-notice')!.textContent, '已保存');
      if (!playing) { play.emit('click'); await settle(); assert.equal(f.methods.at(-1), 'resume'); }
    } finally { f.cleanup(); }
  }
});

test('double-click title editing needs no dialog and save commits the pending name before its callback', async () => {
  let savedName = ''; const f = fixture({ onSave() { savedName = f.phrase.read().draft!.name; } }); try {
    const title = f.root.querySelector('.song-project-name')!; title.emit('dblclick'); const field = f.root.querySelector('.song-project-name-input')!;
    field.value = '新的旋律'; f.root.querySelector('.song-save')!.emit('click'); await settle();
    assert.equal(savedName, '新的旋律'); assert.equal(title.textContent, '新的旋律'); assert.equal(f.root.querySelector('.song-project-kind')!.textContent, '乐句'); assert.equal(f.root.querySelector('dialog'), undefined);
    title.emit('dblclick'); const cancelled = f.root.querySelector('.song-project-name-input')!; cancelled.value = '取消'; cancelled.emit('keydown', { key: 'Escape' });
    assert.equal(f.phrase.read().draft!.name, '新的旋律'); assert.equal(title.textContent, '新的旋律');
  } finally { f.cleanup(); }
});

test('invalid names and failed asynchronous renames block save, save-as and exit until corrected', async () => {
  let saves = 0; let copies = 0; let exits = 0; let renames = 0; const pending = deferred();
  const f = fixture({ onSave() { saves++; }, onSaveAs() { copies++; }, onExit() { exits++; },
    async onRename() { renames++; await pending.promise; throw new Error('无法修改名称'); } }); try {
    const original = f.phrase.read(); f.root.querySelector('.song-project-name')!.emit('dblclick');
    const field = f.root.querySelector('.song-project-name-input')!; field.value = '   '; f.root.querySelector('.song-save')!.emit('click'); await settle();
    assert.equal(saves, 0); assert.equal(renames, 0); assert.equal(f.root.querySelector('.phrase-composition-notice')!.textContent, '乐句名称不能为空。');
    assert.deepEqual(f.phrase.read(), original);
    field.value = '不能保存的新名'; field.emit('blur'); f.root.querySelector('.song-save')!.emit('click'); await settle(); assert.equal(renames, 1);
    pending.resolve(); await settle(); assert.equal(saves, 0); assert.equal(f.root.querySelector('.phrase-composition-notice')!.textContent, '无法修改名称');
    f.root.querySelectorAll('.song-save')[1]!.emit('click'); await settle(); f.root.querySelector('.song-exit')!.emit('click'); await settle();
    assert.equal(copies, 0); assert.equal(exits, 0); assert.deepEqual(f.phrase.read(), original);
    field.emit('keydown', { key: 'Escape' }); f.root.querySelector('.song-save')!.emit('click'); await settle(); assert.equal(saves, 1);
  } finally { f.cleanup(); }
});

test('BPM preserves the beat position and volume gestures preview without repeated history writes', async () => {
  const f = fixture(); try {
    f.ruler.emit('pointerdown', { clientX: 672 }); f.document.emit('pointerup');
    const bpm = f.root.querySelectorAll('input').find(item => item.attributes.get('aria-label') === 'BPM')!; bpm.value = '60'; bpm.emit('change');
    assert.equal(f.phrase.read().body!.tempoBpm, 60); assert.equal(f.root.querySelector('.song-clock')!.textContent, '00:08.000');
    bpm.value = '0'; bpm.emit('change'); assert.equal(f.phrase.read().body!.tempoBpm, 60); assert.equal(bpm.value, '60');
    const volume = f.root.querySelectorAll('input').find(item => item.attributes.get('aria-label') === '总音量')!;
    volume.emit('pointerdown', { pointerId: 4 }); volume.value = '.2'; volume.emit('input'); volume.value = '.4'; volume.emit('input');
    assert.equal(f.phrase.read().body!.masterLevel, undefined); f.document.emit('pointerup', { pointerId: 4 });
    assert.equal(f.phrase.read().body!.masterLevel, .4); volume.emit('change'); f.phrase.undo(); assert.equal(f.phrase.read().body!.masterLevel, undefined);
    f.workspace.refresh(); volume.emit('pointerdown', { pointerId: 5 }); volume.value = '.1'; volume.emit('input'); f.document.emit('pointercancel', { pointerId: 5 });
    assert.equal(f.phrase.read().body!.masterLevel, undefined); assert.equal(volume.value, '1');
    await settle();
  } finally { f.cleanup(); }
});

test('disposing cancels captured gestures and ignores late save completion and global input', async () => {
  const pending = deferred(); const f = fixture({ onSave() { return pending.promise; } }); try {
    f.ruler.emit('pointerdown', { clientX: 672 }); assert(f.ruler.hasPointerCapture(1)); f.workspace.dispose(); assert.equal(f.ruler.hasPointerCapture(1), false);
    f.document.emit('pointermove', { clientX: 172 }); assert.equal(f.root.querySelector('.song-clock')!.textContent, '00:04.000');
    f.document.emit('keydown', { key: 's', ctrlKey: true }); pending.resolve(); await settle();
    f.workspace.notify('late'); assert.equal(f.root.querySelector('.phrase-composition-notice')!.hidden, true);
  } finally { f.cleanup(); }
  const late = deferred(); const waiting = fixture({ onSave() { return late.promise; } }); try {
    waiting.root.querySelector('.song-save')!.emit('click'); await settle(); waiting.workspace.dispose(); late.reject(new Error('late failure')); await settle();
    assert.equal(waiting.root.querySelector('.phrase-composition-notice')!.hidden, true);
  } finally { waiting.cleanup(); }
});

test('Backspace undoes an overview edit once while text fields and composing keys remain untouched', () => {
  const f = fixture(); try {
    const notes = structuredClone(f.phrase.read().body!.parts[0]!.notes);
    f.phrase.setMasterLevel(.3); f.workspace.refresh();
    f.document.emit('keydown', { key: 'Backspace', target: f.viewport });
    assert.equal(f.phrase.read().body!.masterLevel, undefined);
    assert.deepEqual(f.phrase.read().body!.parts[0]!.notes, notes);
    f.phrase.setMasterLevel(.4); f.workspace.refresh();
    const field = f.root.querySelectorAll('input').find(item => item.attributes.get('aria-label') === 'BPM')!;
    for (const extra of [{ repeat: true }, { target: field }, { isComposing: true }, { keyCode: 229 }, { ctrlKey: true }, { altKey: true }, { metaKey: true }, { shiftKey: true }]) {
      f.document.emit('keydown', { key: 'Backspace', target: f.viewport, ...extra });
      assert.equal(f.phrase.read().body!.masterLevel, .4);
    }
    const volume = f.root.querySelectorAll('input').find(item => item.attributes.get('aria-label') === '总音量')!;
    f.document.emit('keydown', { key: 'Backspace', target: volume });
    assert.equal(f.phrase.read().body!.masterLevel, undefined, 'a focused volume slider does not swallow Undo');
  } finally { f.cleanup(); }
});

test('extended phrase geometry keeps endpoints and zoom anchors within the complete editable length', () => {
  const length = 20; const zoomed = zoomPhraseComposition({ leftBeat: 0, zoom: 1 }, 1000, 500, 2, length);
  assert.equal(phraseCompositionBeatAt(zoomed, 1000, 500, length), 10);
  const end = panPhraseComposition(zoomed, 1000, 100000, length);
  assert.equal(end.leftBeat, 10); assert.equal(phraseCompositionBeatAt(end, 1000, 1000, length), 20);
  assert.equal(phraseCompositionBeatAt(end, 1000, -100000, length), 0);
  assert.deepEqual(clampPhraseCompositionView(end, 16), { leftBeat: 8, zoom: 2 }, 'undoing extension clamps the previous viewport');
});

test('overview reads the saved full phrase length for playback, head endpoints and extension undo', async () => {
  const f = fixture({}, { legacy: true }); try {
    const before = structuredClone(f.phrase.read().body!);
    f.root.querySelector('.song-play')!.emit('click'); await settle();
    assert.equal(f.plans.at(-1)!.durationSeconds, 12); assert.equal(f.plans.at(-1)!.events[0]!.atSeconds, 10);
    f.root.querySelector('.song-stop')!.emit('click');
    f.ruler.emit('pointerdown', { clientX: 5000 }); f.document.emit('pointerup');
    assert.equal(f.root.querySelector('.song-clock')!.textContent, '00:12.000');
    assert.equal(f.root.querySelector('.phrase-composition-head-handle')!.attributes.get('aria-valuemax'), '24');
    f.phrase.setLength(28); f.workspace.refresh();
    f.ruler.emit('pointerdown', { clientX: 5000 }); f.document.emit('pointerup');
    assert.equal(f.root.querySelector('.song-clock')!.textContent, '00:14.000');
    f.document.emit('keydown', { key: 'Backspace', target: f.viewport }); await settle();
    assert.deepEqual(f.phrase.read().body, before); assert.equal(f.root.querySelector('.song-clock')!.textContent, '00:12.000');
  } finally { f.cleanup(); }
});

test('overview arrow keys pan or zoom without moving the head or changing notes, with input and modal guards', () => {
  let opened = 0; const f = fixture({ onSettings() { opened++; } }); try {
    const before = structuredClone(f.phrase.read().body!);
    const press = (key: string, extra: Record<string, unknown> = {}) => f.document.emit('keydown', { key, target: f.viewport, ...extra });
    press('ArrowRight', { ctrlKey: true }); assert.equal(Number(f.viewport.dataset.zoom), 1.2);
    const zoomStart = Number(f.viewport.dataset.leftBeat); press('ArrowRight'); assert(Number(f.viewport.dataset.leftBeat) > zoomStart);
    press('ArrowLeft'); assert(Math.abs(Number(f.viewport.dataset.leftBeat) - zoomStart) < 1e-8);
    const zoom = f.viewport.dataset.zoom; const left = f.viewport.dataset.leftBeat;
    for (const extras of [{ target: new FakeInput('input') }, { isComposing: true }, { keyCode: 229 }, { altKey: true }, { metaKey: true }, { shiftKey: true }]) press('ArrowRight', { ctrlKey: true, ...extras });
    const dialog = new FakeElement('dialog'); f.root.append(dialog); dialog.setAttribute('open', ''); press('ArrowRight', { ctrlKey: true }); dialog.remove();
    assert.equal(f.viewport.dataset.zoom, zoom); assert.equal(f.viewport.dataset.leftBeat, left);
    assert.equal(f.root.querySelector('.song-clock')!.textContent, '00:00.000'); assert.deepEqual(f.phrase.read().body, before);
    const actions = f.root.querySelector('.song-file-actions')!.children; assert.equal(actions[0]!.textContent, '设置'); assert.equal(actions[1]!.textContent, '保存');
    assert.equal(opened, 0);
  } finally { f.cleanup(); }
});
