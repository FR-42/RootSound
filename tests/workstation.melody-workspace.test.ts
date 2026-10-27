import assert from 'node:assert/strict';
import test from 'node:test';
import { registerHooks } from 'node:module';
import type { PhraseBody } from '../src/workstation/contracts/phrase.ts';
import type { PlayableNotePlan, SoundRuntimePort } from '../src/workstation/contracts/sound.ts';
import { createMaterialLibrary } from '../src/workstation/modules/materials/public.ts';
import { createPhraseEditor } from '../src/workstation/modules/phrase/public.ts';
import { createTimbreEditor, createTimbrePlayback } from '../src/workstation/modules/timbre/public.ts';
import { clampMelodyView, melodyGrid, melodyNoteRect, melodyScale, melodyTimeAt, zoomMelody } from '../src/workstation/modules/ui-rendering/melody-geometry.ts';
const hook = registerHooks({ load(url, context, next) { return url.endsWith('.css') ? { format: 'module', source: '', shortCircuit: true } : next(url, context); } });
const { mountMelodyWorkspace } = await import('../src/workstation/modules/ui-rendering/melody-workspace.ts'); hook.deregister();

type Event = Record<string, unknown> & { type: string; target: Element; preventDefault(): void; stopPropagation(): void };
class Element {
  tagName: string; className = ''; private text = ''; children: Element[] = []; parentElement?: Element;
  style: Record<string, string> & { setProperty(key: string, value: string): void } = Object.assign(Object.create(null), { setProperty: (key: string, value: string) => { this.style[key] = value; } });
  dataset: Record<string, string> = {}; attributes = new Map<string, string>(); value = ''; hidden = false; disabled = false; tabIndex = 0; scrollTop = 0;
  clientWidth = 800; clientHeight = 400; private captures = new Set<number>(); private listeners = new Map<string, Array<(event: Event) => void>>();
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
  replaceChildren(...nodes: Element[]) { this.textContent = ''; this.append(...nodes); }
  remove() { if (this.parentElement) this.parentElement.children = this.parentElement.children.filter(child => child !== this); this.parentElement = undefined; }
  setAttribute(name: string, value: string) { this.attributes.set(name, value); }
  matches(selector: string): boolean { if (selector[0] === '.') return this.classList.contains(selector.slice(1)); const match = /^([a-z]+)(?:\[([^\]]+)\])?$/u.exec(selector); return !!match && this.tagName.toLowerCase() === match[1] && (!match[2] || this.attributes.has(match[2])); }
  closest<T = Element>(selector: string): T | undefined { let item: Element | undefined = this; while (item) { if (item.matches(selector)) return item as T; item = item.parentElement; } }
  querySelectorAll(selector: string): Element[] { return this.children.flatMap(child => [...(child.matches(selector) ? [child] : []), ...child.querySelectorAll(selector)]); }
  querySelector(selector: string) { return this.querySelectorAll(selector)[0]; }
  addEventListener(type: string, callback: (event: Event) => void) { this.listeners.set(type, [...this.listeners.get(type) ?? [], callback]); }
  removeEventListener(type: string, callback: (event: Event) => void) { this.listeners.set(type, (this.listeners.get(type) ?? []).filter(value => value !== callback)); }
  emit(type: string, values: Record<string, unknown> = {}) { const event = { type, target: this, pointerId: 1, clientX: 0, clientY: 0, button: 0, altKey: false, shiftKey: false, ctrlKey: false, metaKey: false, key: '', repeat: false, deltaX: 0, deltaY: 0, preventDefault() {}, stopPropagation() {}, ...values } as Event; for (const listener of this.listeners.get(type) ?? []) listener(event); return event; }
  setPointerCapture(id: number) { this.captures.add(id); } hasPointerCapture(id: number) { return this.captures.has(id); } releasePointerCapture(id: number) { this.captures.delete(id); }
  focus() { (globalThis.document as unknown as Document).activeElement = this; }
  showModal() { this.attributes.set('open', ''); } close() { this.attributes.delete('open'); this.emit('close'); }
  getBoundingClientRect() {
    let left = 212; let top = 100; let width = this.clientWidth; let height = this.clientHeight;
    if (this.classList.contains('melody-note')) {
      const scroll = this.closest('.melody-workspace')?.querySelector('.melody-scroll');
      left += Number.parseFloat(this.style.left ?? '0'); top += Number.parseFloat(this.style.top ?? '0') - (scroll?.scrollTop ?? 0); width = Number.parseFloat(this.style.width ?? '0'); height = Number.parseFloat(this.style.height ?? '0');
    }
    return { left, right: left + width, top, bottom: top + height, width, height };
  }
}
class Input extends Element {} class Select extends Element {} class TextArea extends Element {}
class Document extends Element { activeElement?: Element; createElement(tag: string) { return tag === 'input' ? new Input(tag) : tag === 'select' ? new Select(tag) : new Element(tag); } createElementNS(_namespace: string, tag: string) { return new Element(tag); } }
function dom() {
  const document = new Document(); const window = new Element(); const timers: ReturnType<typeof setTimeout>[] = [];
  Object.assign(window, { setTimeout(callback: () => void, delay: number) { const timer = setTimeout(callback, delay); timer.unref(); timers.push(timer); return Number(timer); }, clearTimeout });
  const values = { document, window, HTMLElement: Element, HTMLInputElement: Input, HTMLSelectElement: Select, HTMLTextAreaElement: TextArea };
  const previous = new Map<string, PropertyDescriptor | undefined>(); for (const [key, value] of Object.entries(values)) { previous.set(key, Object.getOwnPropertyDescriptor(globalThis, key)); Object.defineProperty(globalThis, key, { value, writable: true, configurable: true }); }
  return { document, restore() { timers.forEach(clearTimeout); for (const [key, descriptor] of previous) if (descriptor) Object.defineProperty(globalThis, key, descriptor); else Reflect.deleteProperty(globalThis, key); } };
}
async function settle() { for (let index = 0; index < 10; index++) await Promise.resolve(); }
function fixture(config: { voices?: number; notes?: boolean; placeholder?: boolean; customized?: boolean } = {}) {
  const environment = dom(); const library = createMaterialLibrary(); const timbre = createTimbreEditor(library); const voices: Array<{ id: string; name: string }> = [];
  for (let index = 0; index < (config.voices ?? 2); index++) { if (index) timbre.create(); timbre.rename(config.placeholder && !index ? '乐句 1 音色' : `音色 ${index + 1}`); if (config.customized) timbre.setLevel(.4); const saved = timbre.save('new'); if (saved.status !== 'saved') throw new Error('voice'); voices.push(saved.content); }
  const phrase = createPhraseEditor(library, createTimbrePlayback(library)); phrase.create(voices[0]!.id); phrase.rename('乐句 1'); phrase.setLength(16); const partId = phrase.read().body!.parts[0]!.id;
  if (config.notes) phrase.addNote(partId, { startBeat: 2, durationBeats: 1, durationSeconds: .5, frequencyHz: 440, velocity: .75 });
  const root = new Element('main'); const previews: Array<PhraseBody | undefined> = []; const auditions: PlayableNotePlan[] = []; const seeks: number[] = []; let changes = 0;
  const sound = { async audition(plan: PlayableNotePlan) { auditions.push(plan); }, cancelAudition() {} } as unknown as SoundRuntimePort;
  const workspace = mountMelodyWorkspace(root as unknown as HTMLElement, { phrase, sound, gridBpm: () => phrase.read().body!.tempoBpm,
    onPreview(value) { previews.push(value); }, onChange() { changes++; }, onSeek(value) { seeks.push(value); }, listTimbres: () => voices,
    onAddTimbre(id) { return phrase.read().body!.parts.find(value => value.timbreId === id)?.id ?? phrase.addPart(id); } });
  const scroll = root.querySelector('.melody-scroll')!; const canvas = root.querySelector('.melody-canvas')!;
  function pointAt(beat: number, frequency = 440) { const keys = phrase.keyboard().slice().reverse(); const row = keys.findIndex(key => Math.abs(key.frequencyHz - frequency) < .01); return { clientX: 212 + beat * 50, clientY: 100 + row * 24 + 12 - scroll.scrollTop }; }
  function selectTone(id = partId) { root.querySelectorAll('.melody-tone').find(value => value.dataset.partId === id)!.emit('click'); }
  function block(id: string) { return root.querySelectorAll('.melody-note').find(value => value.dataset.noteId === id)!; }
  return { ...environment, root, phrase, workspace, previews, auditions, seeks, voices, scroll, canvas, partId, selectTone, pointAt, block, changes: () => changes,
    cleanup() { workspace.dispose(); environment.restore(); } };
}

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

test('the roll exposes the whole continuous keyboard, a four-cell grid and a compact local tone library', () => {
  const f = fixture(); try {
    assert.equal(f.root.querySelectorAll('.melody-key').length, f.phrase.keyboard().length); assert(f.root.querySelectorAll('.melody-key').length > 80);
    assert.equal(f.root.querySelectorAll('.melody-grid-line').length, 65); assert.equal(f.root.querySelectorAll('.melody-note').length, 0);
    f.root.querySelector('.melody-add-tone')!.emit('click'); const dialog = f.root.querySelector('.melody-tone-library')!;
    assert.equal(dialog.querySelectorAll('.melody-library-tone').length, 2); dialog.querySelectorAll('.melody-library-tone')[1]!.emit('click');
    assert.equal(f.root.querySelector('.melody-tone-library'), undefined); assert.equal(f.phrase.read().body!.parts.length, 2);
    assert.equal(f.root.querySelector('.melody-console')!.querySelectorAll('input').length, 0); assert.equal(f.root.querySelector('.melody-console-name')!.textContent, '音色 2');
  } finally { f.cleanup(); }
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

test('clicking a cell creates one physical-duration note on release, auditions it and can be cancelled', async () => {
  const f = fixture(); try {
    f.selectTone(); const at = f.pointAt(2.13); f.scroll.emit('pointerdown', { target: f.canvas, ...at });
    assert.equal(f.phrase.read().body!.parts[0]!.notes.length, 0); assert.equal(f.previews.at(-1)!.parts[0]!.notes[0]!.startBeat, 2);
    f.document.emit('pointerup', at); await settle(); const note = f.phrase.read().body!.parts[0]!.notes[0]!;
    assert.equal(note.startBeat, 2); assert.equal(note.durationSeconds, .125); assert.equal(f.auditions.length, 1); assert.equal(f.changes(), 1);
    assert.equal(f.root.querySelector('.melody-console')!.querySelectorAll('input').length, 5);
    f.scroll.emit('pointerdown', { target: f.canvas, ...f.pointAt(4) }); f.document.emit('pointercancel');
    assert.equal(f.phrase.read().body!.parts[0]!.notes.length, 1); assert.equal(f.previews.at(-1), undefined); assert.equal(f.scroll.hasPointerCapture(1), false);
    f.phrase.undo(); assert.equal(f.phrase.read().body!.parts[0]!.notes.length, 0);
  } finally { f.cleanup(); }
});

test('note dragging moves continuously, settles on a quarter beat and stores only one undoable change', () => {
  const f = fixture({ notes: true }); try {
    const original = f.phrase.read().body!.parts[0]!.notes[0]!; const originalX = Number.parseFloat(f.block(original.id).style.left ?? '0');
    const start = f.pointAt(2.02); f.scroll.emit('pointerdown', { target: f.block(original.id), ...start });
    f.document.emit('pointermove', { ...start, clientX: start.clientX + 17.3, clientY: start.clientY + 9.5 });
    assert(Math.abs(Number.parseFloat(f.block(original.id).style.left ?? '0') - originalX - 17.3) < 1e-7);
    assert.equal(f.phrase.read().body!.parts[0]!.notes[0]!.startBeat, 2); assert(f.previews.at(-1));
    f.document.emit('pointerup'); const moved = f.phrase.read().body!.parts[0]!.notes[0]!; assert.equal(moved.startBeat, 2.25); assert.equal(moved.durationSeconds, .5);
    assert.equal(f.changes(), 1); f.phrase.undo(); assert.deepEqual(f.phrase.read().body!.parts[0]!.notes[0], original);
  } finally { f.cleanup(); }
});

test('right drag erases complete note hitboxes across dimmed tones in one transaction', () => {
  const f = fixture({ notes: true }); try {
    const other = f.phrase.addPart(f.voices[1]!.id); const id = f.phrase.addNote(other, { startBeat: 4, durationBeats: 1, frequencyHz: 440, velocity: .7 }); f.workspace.refresh(); f.selectTone();
    assert(f.block(id).classList.contains('is-dim')); const start = f.pointAt(2.7); f.scroll.emit('pointerdown', { button: 2, target: f.block(f.phrase.read().body!.parts[0]!.notes[0]!.id), ...start });
    f.document.emit('pointermove', { button: 2, ...f.pointAt(4.8) }); f.document.emit('pointerup');
    assert.equal(f.phrase.read().body!.parts.reduce((count, value) => count + value.notes.length, 0), 0); f.phrase.undo(); assert.equal(f.phrase.read().body!.parts.reduce((count, value) => count + value.notes.length, 0), 2);
  } finally { f.cleanup(); }
});

test('duration fields preview physical width immediately and pointer-up commits sliders once', () => {
  const f = fixture({ notes: true }); try {
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

test('the right edge resizes seconds continuously and a cancelled mix returns to the saved note', () => {
  const f = fixture({ notes: true }); try {
    const original = f.phrase.read().body!.parts[0]!.notes[0]!; const block = f.block(original.id); const bounds = block.getBoundingClientRect();
    const point = { clientX: bounds.right - 2, clientY: bounds.top + 6 };
    f.scroll.emit('pointerdown', { target: block.querySelector('.melody-note-resize'), ...point });
    f.document.emit('pointermove', { ...point, clientX: point.clientX + 37.5 }); assert.equal(f.previews.at(-1)!.parts[0]!.notes[0]!.durationSeconds, .875);
    assert.equal(f.phrase.read().body!.parts[0]!.notes[0]!.durationSeconds, .5); f.document.emit('pointerup'); assert.equal(f.phrase.read().body!.parts[0]!.notes[0]!.durationSeconds, .875);
    f.phrase.undo(); assert.deepEqual(f.phrase.read().body!.parts[0]!.notes[0], original); f.workspace.refresh();
    const pan = f.root.querySelectorAll('input').find(value => value.attributes.get('aria-label') === '声像')!;
    pan.emit('pointerdown', { pointerId: 7 }); pan.value = '.8'; pan.emit('input'); assert.equal(f.previews.at(-1)!.parts[0]!.notes[0]!.pan, .8);
    f.document.emit('pointercancel', { pointerId: 7 }); assert.deepEqual(f.phrase.read().body!.parts[0]!.notes[0], original); assert.equal(f.previews.at(-1), undefined);
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

test('single A/D moves one cell and a 150ms pair moves one beat from the original start', () => {
  const f = fixture({ notes: true }); const oldNow = Date.now; let now = 1000; Date.now = () => now;
  try {
    const id = f.phrase.read().body!.parts[0]!.notes[0]!.id; f.scroll.emit('pointerdown', { target: f.block(id), ...f.pointAt(2.02) }); f.document.emit('pointerup');
    f.document.emit('keydown', { target: f.scroll, key: 'd' }); assert.equal(f.phrase.read().body!.parts[0]!.notes[0]!.startBeat, 2.25);
    now += 100; f.document.emit('keydown', { target: f.scroll, key: 'd' }); assert.equal(f.phrase.read().body!.parts[0]!.notes[0]!.startBeat, 3);
    now += 200; f.document.emit('keydown', { target: f.scroll, key: 'a' }); now += 180; f.document.emit('keydown', { target: f.scroll, key: 'a' });
    assert.equal(f.phrase.read().body!.parts[0]!.notes[0]!.startBeat, 2.5); f.document.emit('keydown', { target: f.scroll, key: 'q' }); assert.equal(f.phrase.read().body!.parts[0]!.notes[0]!.pan, -.05);
  } finally { Date.now = oldNow; f.cleanup(); }
});

test('tempo moves note onset and beat lines without stretching explicit seconds; the extra area is non-placeable', () => {
  const f = fixture({ notes: true }); try {
    f.selectTone(); const id = f.phrase.read().body!.parts[0]!.notes[0]!.id; const width = f.block(id).style.width; const x = Number.parseFloat(f.block(id).style.left ?? '0');
    f.phrase.setTempo(240, { preserveNoteDurations: true }); f.workspace.refresh(); assert.equal(f.block(id).style.width, width); assert.equal(Number.parseFloat(f.block(id).style.left ?? '0'), x / 2);
    assert.equal(f.root.querySelector('.melody-after-end')!.hidden, false); const count = f.phrase.read().body!.parts[0]!.notes.length;
    f.scroll.emit('pointerdown', { target: f.canvas, clientX: 912, clientY: 200 }); f.document.emit('pointerup'); assert.equal(f.phrase.read().body!.parts[0]!.notes.length, count);
    f.workspace.setPlayhead(1); assert.equal(f.root.querySelector('.melody-playhead')!.style.left, '100px');
    f.root.querySelector('.melody-ruler')!.emit('pointerdown', { clientX: 412, clientY: 90 }); f.document.emit('pointerup'); assert.equal(f.seeks.at(-1), 2);
  } finally { f.cleanup(); }
});

test('eight distinct tones get distinct colors and customized autogenerated names stay visible', () => {
  const f = fixture({ voices: 8 }); try {
    for (const voice of f.voices.slice(1)) f.phrase.addPart(voice.id); f.workspace.refresh();
    const colors = f.root.querySelectorAll('.melody-tone').map(value => value.style['--tone-color']); assert.equal(new Set(colors).size, 8);
    const before = [...colors]; f.workspace.refresh(); assert.deepEqual(f.root.querySelectorAll('.melody-tone').map(value => value.style['--tone-color']), before);
  } finally { f.cleanup(); }
  const empty = fixture({ placeholder: true }); try { assert.equal(empty.root.querySelectorAll('.melody-tone').length, 0); } finally { empty.cleanup(); }
  const customized = fixture({ placeholder: true, customized: true }); try { assert.equal(customized.root.querySelectorAll('.melody-tone').length, 1); } finally { customized.cleanup(); }
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

