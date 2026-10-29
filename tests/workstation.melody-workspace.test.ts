import assert from 'node:assert/strict';
import type { PhraseEditorViewport } from '../src/workstation/modules/ui-rendering/phrase-editor-viewport.ts';
import test from 'node:test';
import { registerHooks } from 'node:module';
import type { PhraseBody, PhraseView } from '../src/workstation/contracts/phrase.ts';
import type { PlayableNotePlan, SoundRuntimePort } from '../src/workstation/contracts/sound.ts';
import { createMaterialLibrary } from '../src/workstation/modules/materials/public.ts';
import { createPhraseEditor } from '../src/workstation/modules/phrase/public.ts';
import { createTimbreEditor, createTimbrePlayback, prepareImportedTimbre, readEditableTimbreBody } from '../src/workstation/modules/timbre/public.ts';
import { createDefaultPatch } from '../src/workstation/modules/timbre/spectral/model.mjs';
import { clampMelodyView, melodyGrid, melodyNoteRect, melodyScale, melodyTimeAt, zoomMelody } from '../src/workstation/modules/ui-rendering/melody-geometry.ts';
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
  replaceChildren(...nodes: Element[]) { this.textContent = ''; this.append(...nodes); }
  remove() { if (this.parentElement) this.parentElement.children = this.parentElement.children.filter(child => child !== this); this.parentElement = undefined; }
  contains(other: Element): boolean { return other === this || this.children.some(child => child.contains(other)); }
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
class Document extends Element { activeElement?: Element; createElement(tag: string) { return tag === 'input' ? new Input(tag) : tag === 'select' ? new Select(tag) : new Element(tag); } createElementNS(_namespace: string, tag: string) { return new Element(tag); } }
function dom() {
  const document = new Document(); const window = new Element(); const timers: ReturnType<typeof setTimeout>[] = [];
  Object.assign(window, { setTimeout(callback: () => void, delay: number) { const timer = setTimeout(callback, delay); timer.unref(); timers.push(timer); return Number(timer); }, clearTimeout });
  const values = { document, window, HTMLElement: Element, HTMLInputElement: Input, HTMLSelectElement: Select, HTMLTextAreaElement: TextArea };
  const previous = new Map<string, PropertyDescriptor | undefined>(); for (const [key, value] of Object.entries(values)) { previous.set(key, Object.getOwnPropertyDescriptor(globalThis, key)); Object.defineProperty(globalThis, key, { value, writable: true, configurable: true }); }
  return { document, restore() { timers.forEach(clearTimeout); for (const [key, descriptor] of previous) if (descriptor) Object.defineProperty(globalThis, key, descriptor); else Reflect.deleteProperty(globalThis, key); } };
}
async function settle() { for (let index = 0; index < 10; index++) await Promise.resolve(); }
function fixture(config: { voices?: number; notes?: boolean; placeholder?: boolean; customized?: boolean; fixedGridBpm?: boolean; initialViewport?: PhraseEditorViewport; performance?: boolean; confirmDeletion?: boolean; includeAllSections?: boolean; legacyRhythm?: boolean; onImportTimbre?(): Promise<boolean>; onReorderTimbres?(id: string, targetIndex: number): void; onRemoveTimbre?(id: string): void } = {}) {
  const environment = dom(); const library = createMaterialLibrary(); const timbre = createTimbreEditor(library); const voices: Array<{ id: string; name: string; requiresDeleteConfirmation?: boolean }> = [];
  for (let index = 0; index < (config.voices ?? 2); index++) { if (index) timbre.create(); timbre.rename(config.placeholder && !index ? '乐句 1 音色' : `音色 ${index + 1}`); if (config.customized) timbre.setLevel(.4); const saved = timbre.save('new'); if (saved.status !== 'saved') throw new Error('voice'); voices.push(saved.content); }
  if (config.confirmDeletion) for (const voice of voices) voice.requiresDeleteConfirmation = true;
  const phrase = createPhraseEditor(library, createTimbrePlayback(library)); phrase.create(voices[0]!.id); phrase.rename('乐句 1'); phrase.setLength(16); const partId = phrase.read().body!.parts[0]!.id;
  if (config.notes) phrase.addNote(partId, { startBeat: 2, durationBeats: 1, durationSeconds: .5, frequencyHz: 440, velocity: .75 });
  const legacyRhythmId = config.legacyRhythm ? phrase.addPart(voices[1]!.id, 'rhythm') : undefined;
  if (legacyRhythmId) phrase.addNote(legacyRhythmId, { startBeat: 4, durationBeats: .5, durationSeconds: .17, frequencyHz: 220, velocity: .6, pan: -.2 });
  const beforeMount = phrase.read().draft; const tokenBeforeMount = library.currentToken();
  const root = new Element('main'); const previews: Array<PhraseBody | undefined> = []; const auditions: PlayableNotePlan[] = []; const seeks: number[] = []; let changes = 0; let lastChange: PhraseView | undefined; const viewports: PhraseEditorViewport[] = [];
  const sound = { async audition(plan: PlayableNotePlan) { auditions.push(plan); }, cancelAudition() {} } as unknown as SoundRuntimePort;
  const workspace = mountMelodyWorkspace(root as unknown as HTMLElement, { phrase, sound, gridBpm: () => config.fixedGridBpm ? 120 : phrase.read().body!.tempoBpm,
    initialViewport: config.initialViewport, includeAllSections: config.includeAllSections, onViewportChange(value) { viewports.push(value); }, readPerformanceMode: () => !!config.performance,
    onImportTimbre: config.onImportTimbre,
    onReorderTimbres: config.onReorderTimbres, onRemoveTimbre: config.onRemoveTimbre,
    onPreview(value) { previews.push(value); }, onChange(view) { changes++; lastChange = view; }, onSeek(value) { seeks.push(value); }, listTimbres: () => voices,
    onAddTimbre(id) { return phrase.read().body!.parts.find(value => value.timbreId === id)?.id ?? phrase.addPart(id); } });
  const scroll = root.querySelector('.melody-scroll')!; const canvas = root.querySelector('.melody-canvas')!;
  function pointAt(beat: number, frequency = 440) { const keys = phrase.keyboard().slice().reverse(); const row = keys.findIndex(key => Math.abs(key.frequencyHz - frequency) < .01); return { clientX: 212 + beat * 50, clientY: 100 + row * 24 + 12 - scroll.scrollTop }; }
  function selectTone(id = partId) { root.querySelectorAll('.melody-tone').find(value => value.dataset.partId === id)!.emit('click'); }
  function block(id: string) { return root.querySelectorAll('.melody-note').find(value => value.dataset.noteId === id)!; }
  return { ...environment, root, library, phrase, workspace, previews, auditions, seeks, voices, scroll, canvas, partId, legacyRhythmId, beforeMount, tokenBeforeMount, selectTone, pointAt, block, viewports, changes: () => changes,
    lastChange: () => lastChange, cleanup() { workspace.dispose(); environment.restore(); } };
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

test('ordinary Melody remains section-scoped while unified creation exposes legacy rhythm families without rewriting a draft', () => {
  for (const includeAllSections of [false, true]) {
    const f = fixture({ notes: true, legacyRhythm: true, includeAllSections }); try {
      assert.equal(f.root.querySelectorAll('.melody-note-family').length, includeAllSections ? 2 : 1);
      assert.equal(f.root.querySelectorAll('.melody-note').length, includeAllSections ? 2 : 1);
      assert.deepEqual(f.phrase.read().draft, f.beforeMount); assert.equal(f.library.currentToken(), f.tokenBeforeMount);
      assert.equal(f.phrase.read().body!.parts.find(part => part.id === f.legacyRhythmId)!.section, 'rhythm');
      assert.equal(f.changes(), 0); assert.equal(f.previews.length, 0); assert.equal(f.auditions.length, 0);
      f.workspace.refresh(); assert.deepEqual(f.phrase.read().draft, f.beforeMount); assert.equal(f.library.currentToken(), f.tokenBeforeMount);
    } finally { f.cleanup(); }
  }
});

test('unified creation selects and edits legacy rhythm notes using ordinary pitch and mix controls while retaining their family', async () => {
  const f = fixture({ notes: true, legacyRhythm: true, includeAllSections: true }); try {
    const original = f.phrase.read().body!; const legacy = original.parts.find(part => part.id === f.legacyRhythmId)!; const note = legacy.notes[0]!;
    const originalMelody = structuredClone(original.parts.find(part => part.id === f.partId)!);
    f.selectTone(legacy.id);
    assert(f.root.querySelectorAll('.melody-note-family').find(card => card.dataset.partId === legacy.id)!.classList.contains('is-selected'));
    assert(!f.block(note.id).classList.contains('is-dim')); assert(f.block(originalMelody.notes[0]!.id).classList.contains('is-dim'));
    f.scroll.emit('pointerdown', { target: f.block(note.id), ...f.pointAt(4.02, 220) }); f.document.emit('pointerup'); await settle();
    const pitch = f.root.querySelectorAll('select').find(input => input.attributes.get('aria-label') === '音高')!; assert(pitch);
    const hz = f.phrase.keyboard().find(key => key.label === 'C4')!.frequencyHz; pitch.value = String(hz); pitch.emit('change');
    f.document.emit('keydown', { target: f.scroll, key: 'd' });
    const edited = f.phrase.read().body!.parts.find(part => part.id === legacy.id)!;
    assert.equal(edited.section, 'rhythm'); assert.equal(edited.id, legacy.id); assert.equal(edited.timbreId, legacy.timbreId);
    assert.equal(edited.notes[0]!.id, note.id); assert.equal(edited.notes[0]!.frequencyHz, hz); assert.equal(edited.notes[0]!.startBeat, 4.25);
    assert.equal(edited.notes[0]!.durationSeconds, .17); assert.equal(edited.notes[0]!.pan, -.2);
    assert.deepEqual(f.phrase.read().body!.parts.find(part => part.id === f.partId), originalMelody);
    f.phrase.undo(); f.phrase.undo(); assert.deepEqual(f.phrase.read().body!.parts.find(part => part.id === legacy.id), legacy);
  } finally { f.cleanup(); }
});

test('unified creation can replace a legacy rhythm family voice, clear its notes and create new Melody families independently', () => {
  const f = fixture({ notes: true, legacyRhythm: true, includeAllSections: true }); try {
    const legacy = f.phrase.read().body!.parts.find(part => part.id === f.legacyRhythmId)!;
    const melody = structuredClone(f.phrase.read().body!.parts.find(part => part.id === f.partId)!);
    f.selectTone(legacy.id); f.root.querySelector('.melody-change-timbre')!.emit('click');
    const picker = f.root.querySelector('.melody-tone-library')!; picker.querySelectorAll('.melody-library-tone')[0]!.emit('click');
    const changed = f.phrase.read().body!.parts.find(part => part.id === legacy.id)!;
    assert.equal(changed.timbreId, f.voices[0]!.id); assert.equal(changed.section, 'rhythm'); assert.deepEqual(changed.notes, legacy.notes);
    assert.deepEqual(f.phrase.read().body!.parts.find(part => part.id === f.partId), melody);
    f.root.querySelector('.melody-delete-tone-notes')!.emit('dblclick');
    assert.equal(f.phrase.read().body!.parts.find(part => part.id === legacy.id)!.notes.length, 0);
    assert.deepEqual(f.phrase.read().body!.parts.find(part => part.id === f.partId), melody);
    f.phrase.undo(); f.workspace.refresh(); assert.deepEqual(f.phrase.read().body!.parts.find(part => part.id === legacy.id)!.notes, legacy.notes);
    f.root.querySelector('.melody-add-tone')!.emit('click'); f.root.querySelector('.melody-tone-library')!.querySelectorAll('.melody-library-tone')[1]!.emit('click');
    const added = f.phrase.read().body!.parts.at(-1)!; assert.notEqual(added.id, legacy.id); assert.equal(added.section ?? 'melody', 'melody');
    assert.deepEqual(f.phrase.read().body!.parts.find(part => part.id === legacy.id)!.notes, legacy.notes);
  } finally { f.cleanup(); }
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
    f.scroll.emit('wheel', { deltaY: 100, clientX: 412, clientY: 200 });
    assert.equal(f.workspace.readViewport().leftSeconds, 1.5);
    f.scroll.emit('wheel', { shiftKey: true, deltaY: 50, clientX: 412, clientY: 200 }); assert.equal(f.scroll.scrollTop, 150);
    f.scroll.emit('wheel', { ctrlKey: true, deltaY: -100, clientX: 412, clientY: 200 }); assert(f.workspace.readViewport().zoom > 2);
    f.scroll.emit('wheel', { ctrlKey: true, shiftKey: true, deltaY: -100, clientX: 412, clientY: 200 }); assert(f.workspace.readViewport().rowHeight > 24);
    const top = f.scroll.scrollTop; const rowHeight = f.workspace.readViewport().rowHeight;
    f.document.emit('keydown', { target: f.scroll, key: 'ArrowDown' }); assert.equal(f.scroll.scrollTop, top + rowHeight);
    f.document.emit('keydown', { target: f.scroll, key: 'ArrowRight', ctrlKey: true });
    f.scroll.scrollTop = 250; f.scroll.emit('scroll'); assert.equal(f.viewports.at(-1)!.top, 250);
    const count = f.viewports.length; f.scroll.emit('scroll'); assert.equal(f.viewports.length, count, 'unchanged native scroll is not reported twice');
    f.scroll.scrollTop = -100; f.scroll.emit('scroll'); assert.equal(f.viewports.at(-1)!.top, 0);
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

test('clicking a cell creates one physical-duration note on release, auditions it and can be cancelled', async () => {
  const f = fixture(); try {
    f.selectTone(); const at = f.pointAt(2.13); f.scroll.emit('pointerdown', { target: f.canvas, ...at });
    assert.equal(f.phrase.read().body!.parts[0]!.notes.length, 0); assert.equal(f.previews.length, 0); assert.equal(f.auditions.length, 0);
    f.document.emit('pointerup', at); await settle(); const note = f.phrase.read().body!.parts[0]!.notes[0]!;
    assert.equal(note.startBeat, 2); assert.equal(note.durationSeconds, .125); assert.equal(f.auditions.length, 1); assert.equal(f.changes(), 1);
    assert.equal(f.root.querySelector('.melody-console')!.querySelectorAll('input').length, 5);
    f.scroll.emit('pointerdown', { target: f.canvas, ...f.pointAt(4) }); f.document.emit('pointercancel');
    assert.equal(f.phrase.read().body!.parts[0]!.notes.length, 1); assert.equal(f.previews.at(-1), undefined); assert.equal(f.scroll.hasPointerCapture(1), false);
    f.phrase.undo(); assert.equal(f.phrase.read().body!.parts[0]!.notes.length, 0);
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

test('ordinary wheel fine-tunes only the selected note duration without moving the view or playhead', () => {
  const f = fixture({ notes: true }); try {
    const original = f.phrase.read().body!.parts[0]!.notes[0]!; const at = f.pointAt(2.02);
    f.scroll.emit('pointerdown', { target: f.block(original.id), ...at }); f.document.emit('pointerup', at);
    const viewport = f.workspace.readViewport(); const changes = f.changes(); const seeks = [...f.seeks];
    f.scroll.emit('wheel', { target: f.canvas, deltaY: -100 });
    const next = f.phrase.read().body!.parts[0]!.notes[0]!;
    assert.deepEqual(next, { ...original, durationSeconds: .51, durationBeats: 1.02 });
    assert.deepEqual(f.workspace.readViewport(), viewport); assert.deepEqual(f.seeks, seeks); assert.equal(f.changes(), changes + 1);
    assert(f.block(original.id).classList.contains('is-selected')); assert.equal(Number.parseFloat(f.block(original.id).style.width!), 51);
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
    f.scroll.emit('wheel', { target: f.canvas, deltaY: -3, deltaMode: 1 }); assert.equal(held(), .51);
    f.scroll.emit('wheel', { target: f.canvas, deltaY: 1, deltaMode: 2 }); assert.equal(held(), .5);
    f.scroll.emit('wheel', { target: f.canvas, deltaY: -100000 }); assert.equal(held(), .54, 'large wheel deltas stay a fine adjustment');
    f.phrase.updateNote(f.partId, id, { durationSeconds: .0002 }); f.workspace.refresh();
    f.scroll.emit('wheel', { target: f.canvas, deltaY: 100 }); assert.equal(held(), .0001);
    let token = f.library.currentToken(); f.scroll.emit('wheel', { target: f.canvas, deltaY: 100 }); assert.equal(f.library.currentToken(), token);
    f.phrase.updateNote(f.partId, id, { startBeat: 15.75, durationBeats: .25, durationSeconds: 96 }); f.workspace.refresh();
    token = f.library.currentToken(); f.scroll.emit('wheel', { target: f.canvas, deltaY: -100 }); assert.equal(f.library.currentToken(), token);
    f.scroll.emit('wheel', { target: f.canvas, deltaY: 100 });
    const tail = f.phrase.read().body!.parts[0]!.notes[0]!;
    assert.equal(tail.durationSeconds, 95.99); assert.equal(tail.durationBeats, .25); assert.equal(tail.startBeat, 15.75);
  } finally { f.cleanup(); }
});

test('note duration wheel leaves modifiers, labels, ruler, horizontal input and family-only navigation intact', () => {
  const f = fixture({ notes: true, initialViewport: { leftSeconds: 1, zoom: 2, top: 600, rowHeight: 24 } }); try {
    const id = f.phrase.read().body!.parts[0]!.notes[0]!.id; const at = f.pointAt(2.02);
    f.scroll.emit('pointerdown', { target: f.block(id), ...at }); f.document.emit('pointerup', at);
    const before = structuredClone(f.phrase.read().body); const token = f.library.currentToken();
    for (const modifiers of [{ ctrlKey: true }, { metaKey: true }, { shiftKey: true }, { altKey: true }]) f.scroll.emit('wheel', { target: f.canvas, deltaY: -20, ...modifiers });
    f.scroll.emit('wheel', { target: f.root.querySelector('.melody-key'), deltaY: 20 });
    f.root.querySelector('.melody-ruler')!.emit('wheel', { deltaY: 20 });
    f.scroll.emit('wheel', { target: f.canvas, deltaY: 0, deltaX: 20 });
    assert.deepEqual(f.phrase.read().body, before); assert.equal(f.library.currentToken(), token);
    f.selectTone(); const left = f.workspace.readViewport().leftSeconds;
    f.scroll.emit('wheel', { target: f.canvas, deltaY: 20 }); assert(f.workspace.readViewport().leftSeconds > left);
    assert.equal(f.library.currentToken(), token);
  } finally { f.cleanup(); }
});

test('legacy beat durations remain fine-adjustable and failed duration edits leave the note and selection intact', () => {
  const f = fixture({ notes: true }); try {
    const id = f.phrase.read().body!.parts[0]!.notes[0]!.id;
    f.phrase.setLength(512); f.phrase.updateNote(f.partId, id, { durationBeats: 240, durationSeconds: undefined }); f.workspace.refresh();
    const at = f.pointAt(2.02); f.scroll.emit('pointerdown', { target: f.block(id), ...at }); f.document.emit('pointerup', at);
    f.scroll.emit('wheel', { target: f.canvas, deltaY: 100 });
    let note = f.phrase.read().body!.parts[0]!.notes[0]!;
    assert.equal(note.durationSeconds, undefined); assert(Math.abs(note.durationBeats - 239.98) < 1e-10);
    f.phrase.updateNote(f.partId, id, { durationBeats: 1 }); f.workspace.refresh();
    f.scroll.emit('wheel', { target: f.canvas, deltaY: -100 }); note = f.phrase.read().body!.parts[0]!.notes[0]!;
    assert.equal(note.durationSeconds, .51); assert.equal(note.durationBeats, 1.02);
    const before = structuredClone(f.phrase.read().body); const token = f.library.currentToken(); const changes = f.changes();
    const update = f.phrase.updateNote; f.phrase.updateNote = () => { throw new Error('测试拒绝时长修改'); };
    f.scroll.emit('wheel', { target: f.canvas, deltaY: 100 }); f.phrase.updateNote = update;
    assert.deepEqual(f.phrase.read().body, before); assert.equal(f.library.currentToken(), token); assert.equal(f.changes(), changes);
    assert(f.block(id).classList.contains('is-selected')); assert.match(f.root.querySelector('.melody-notice')!.textContent, /测试拒绝/u);
  } finally { f.cleanup(); }
});

test('duration wheel reads the freshly flushed note and supports legacy rhythm families in unified Creation', () => {
  const f = fixture({ notes: true, legacyRhythm: true, includeAllSections: true }); try {
    const melody = structuredClone(f.phrase.read().body!.parts[0]!);
    const legacy = f.phrase.read().body!.parts.find(part => part.id === f.legacyRhythmId)!; const note = legacy.notes[0]!;
    const at = f.pointAt(4.02, 220); f.scroll.emit('pointerdown', { target: f.block(note.id), ...at }); f.document.emit('pointerup', at);
    const duration = f.root.querySelectorAll('input').find(input => input.attributes.get('aria-label') === '时长 / 秒')!;
    duration.value = '.3'; duration.emit('input'); assert.equal(f.phrase.read().body!.parts[1]!.notes[0]!.durationSeconds, .17);
    f.scroll.emit('wheel', { target: f.canvas, deltaY: -100 });
    const result = f.phrase.read().body!.parts.find(part => part.id === legacy.id)!;
    assert.equal(result.section, 'rhythm'); assert.equal(result.notes[0]!.id, note.id);
    assert.equal(result.notes[0]!.durationSeconds, .31); assert.equal(result.notes[0]!.durationBeats, .62);
    assert.deepEqual(f.phrase.read().body!.parts[0], melody);
    const before = structuredClone(f.phrase.read().body); const token = f.library.currentToken(); const view = f.workspace.readViewport();
    for (const deltaY of [NaN, Infinity, -Infinity, 0]) f.scroll.emit('wheel', { target: f.canvas, deltaY });
    assert.deepEqual(f.phrase.read().body, before); assert.equal(f.library.currentToken(), token); assert.deepEqual(f.workspace.readViewport(), view);
    f.root.querySelector('.melody-add-tone')!.emit('click');
    f.scroll.emit('wheel', { target: f.canvas, deltaY: -100 });
    assert.equal(f.library.currentToken(), token, 'an open dialog cannot edit a selected background note');
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

test('audio-clock head frames never read the project, inspect layout or rewrite notes', () => {
  const f = fixture({ notes: true }); const originalRead = f.phrase.read;
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
    assert.equal(f.root.querySelector('.melody-playhead')!.style.left, '200px');
  } finally { f.phrase.read = originalRead; f.cleanup(); }
});

test('dense roll dragging only redraws the active note and bounds layout reads independently of note count', () => {
  const f = fixture({ notes: true });
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

test('SPN label wheels invert only the four navigation modes and retain pitch/time anchors without editing', () => {
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
    assert.equal(f.workspace.readViewport().top, zoomed.top + 20, 'main grid retains its original Shift vertical mode');
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

test('a selected total-note family draws a continuous anchored ghost and commits one grid-sized note only on release', async () => {
  const f = fixture(); try {
    f.selectTone(); const before = f.phrase.read().draft, token = f.library.currentToken(); const viewport = f.workspace.readViewport();
    const start = f.pointAt(2.1); f.scroll.emit('pointerdown', { target: f.canvas, ...start });
    const ghost = f.root.querySelector('.is-drawing')!; assert(ghost); assert.equal(f.phrase.read().body!.parts[0]!.notes.length, 0);
    assert.equal(f.library.currentToken(), token); assert.deepEqual(f.phrase.read().draft, before);
    f.document.emit('pointermove', { clientX: start.clientX + 38.4, clientY: start.clientY + 96 });
    const moving = f.root.querySelector('.is-drawing')!;
    assert.equal(moving.style.left, '100px'); assert(Math.abs(Number.parseFloat(moving.style.width!) - 43.4) < 1e-8);
    assert.equal(moving.style.top, ghost.style.top); assert.equal(f.previews.length, 0); assert.equal(f.auditions.length, 0);
    assert.equal(f.changes(), 0); assert.deepEqual(f.workspace.readViewport(), viewport);
    f.document.emit('pointerup'); await settle();
    const note = f.phrase.read().body!.parts[0]!.notes[0]!;
    assert.equal(note.startBeat, 2); assert.equal(note.durationSeconds, .375); assert.equal(note.durationBeats, .75); assert.equal(note.frequencyHz, 440);
    assert.equal(f.root.querySelector('.is-drawing'), undefined); assert(f.block(note.id).classList.contains('is-selected'));
    assert.equal(f.changes(), 1); assert.equal(f.auditions.length, 1); assert.equal(f.auditions[0]!.note.holdSeconds, .375);
    const next = f.pointAt(4.1); f.scroll.emit('pointerdown', { target: f.canvas, ...next });
    f.document.emit('pointermove', { clientX: next.clientX - 100, clientY: next.clientY - 48 }); f.document.emit('pointerup'); await settle();
    const notes = f.phrase.read().body!.parts[0]!.notes; assert.equal(notes.length, 2); assert.deepEqual(notes[0], note);
    assert.equal(notes[1]!.startBeat, 4); assert.equal(notes[1]!.durationSeconds, .125); assert.equal(notes[1]!.frequencyHz, 440);
    assert.equal(f.auditions.length, 2); f.phrase.undo(); assert.deepEqual(f.phrase.read().body!.parts[0]!.notes, [note]);
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

for (const steps of [2, 3, 9]) test(`subdivision ${steps} controls drawn starts, held cells, fields, nudges and typed entries without stretching old notes`, async () => {
  const f = fixture({ notes: true, performance: true }); try {
    const original = f.phrase.read().body!.parts[0]!.notes[0]!; const oldWidth = f.block(original.id).style.width;
    f.phrase.setStepsPerBeat(steps); f.workspace.refresh(); assert.equal(f.block(original.id).style.width, oldWidth);
    assert.equal(f.root.querySelectorAll('.melody-grid-line').length, 16 * steps + 1); f.selectTone();
    const at = f.pointAt(4 + .2 / steps); f.scroll.emit('pointerdown', { target: f.canvas, ...at });
    f.document.emit('pointermove', { clientX: 212 + (4 + 2.1 / steps) * 50, clientY: at.clientY }); f.document.emit('pointerup'); await settle();
    const added = f.phrase.read().body!.parts[0]!.notes[1]!; assert.equal(added.startBeat, 4); assert(Math.abs(added.durationSeconds! - 1 / steps) < 1e-10);
    assert(f.block(added.id).classList.contains('is-selected'));
    const startInput = () => f.root.querySelectorAll('input').find(input => input.attributes.get('aria-label') === '开始 / 秒')!;
    assert.equal(Number(startInput().attributes.get('step') ?? (startInput() as unknown as { step: string }).step), .5 / steps);
    f.document.emit('keydown', { target: f.scroll, key: 'd' }); assert(Math.abs(f.phrase.read().body!.parts[0]!.notes[1]!.startBeat - (4 + 1 / steps)) < 1e-10);
    f.selectTone(); f.workspace.setPlayhead(3); f.document.emit('keydown', { target: f.scroll, key: 'c' }); await settle();
    const typed = f.phrase.read().body!.parts[0]!.notes[2]!; assert(Math.abs(typed.durationBeats - 1 / steps) < 1e-10); assert(Math.abs(typed.durationSeconds! - .5 / steps) < 1e-10);
    assert.equal(f.auditions.length, 2);
  } finally { f.cleanup(); }
});

for (const steps of [2, 3, 9]) test(`fractional phrase tail at subdivision ${steps} accepts only full cells and retains grid-aligned last starts`, () => {
  const f = fixture(); try {
    f.phrase.setLength(3.17); f.phrase.setStepsPerBeat(steps); f.workspace.refresh(); f.selectTone();
    const fullEnd = Math.floor(3.17 * steps) / steps, lastStart = fullEnd - 1 / steps;
    const xAt = (beat: number) => 212 + beat * 50;
    const at = { ...f.pointAt(lastStart + .1 / steps), clientX: xAt(lastStart + .1 / steps) };
    f.scroll.emit('pointerdown', { target: f.canvas, ...at }); f.document.emit('pointermove', { clientX: xAt(5), clientY: at.clientY }); f.document.emit('pointerup');
    const note = f.phrase.read().body!.parts[0]!.notes[0]!; assert(Math.abs(note.startBeat - lastStart) < 1e-10); assert(Math.abs(note.durationBeats - 1 / steps) < 1e-10);
    assert(note.startBeat + note.durationBeats <= 3.17);
    const input = f.root.querySelectorAll('input').find(input => input.attributes.get('aria-label') === '开始 / 秒')!;
    input.value = '999'; input.emit('input'); input.emit('change');
    assert(Math.abs(f.phrase.read().body!.parts[0]!.notes[0]!.startBeat - lastStart) < 1e-10);
    f.document.emit('keydown', { target: f.scroll, key: 'd' }); assert(Math.abs(f.phrase.read().body!.parts[0]!.notes[0]!.startBeat - lastStart) < 1e-10);
    f.selectTone(); const count = f.phrase.read().body!.parts[0]!.notes.length;
    f.scroll.emit('pointerdown', { target: f.canvas, ...at, clientX: xAt((fullEnd + 3.17) / 2) }); f.document.emit('pointerup');
    assert.equal(f.phrase.read().body!.parts[0]!.notes.length, count); assert.equal(f.root.querySelector('.is-drawing'), undefined);
  } finally { f.cleanup(); }
});

test('a phrase shorter than its chosen subdivision rejects new drawing without altering existing notes', () => {
  const f = fixture(); try {
    f.phrase.setLength(.25); const id = f.phrase.addNote(f.partId, { startBeat: 0, durationBeats: .25, durationSeconds: .125, frequencyHz: 440, velocity: .75 });
    f.phrase.setStepsPerBeat(2); f.workspace.refresh(); f.selectTone(); const token = f.library.currentToken(), before = f.phrase.read().draft;
    f.scroll.emit('pointerdown', { target: f.canvas, ...f.pointAt(.1) }); f.document.emit('pointerup');
    assert.equal(f.library.currentToken(), token); assert.deepEqual(f.phrase.read().draft, before);
    assert.equal(f.root.querySelector('.is-drawing'), undefined); assert.equal(f.root.querySelector('.melody-notice')!.textContent, '乐句不足一格，请先增加长度。');
    f.scroll.emit('pointerdown', { target: f.block(id), ...f.pointAt(.02) }); f.document.emit('pointerup');
    f.document.emit('keydown', { target: f.scroll, key: 'd' }); assert.deepEqual(f.phrase.read().draft, before);
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

