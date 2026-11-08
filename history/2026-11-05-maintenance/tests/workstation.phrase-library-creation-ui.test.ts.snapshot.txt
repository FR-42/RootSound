import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import { test } from 'node:test';
import type { PhraseEditorPort, PhraseView } from '../src/workstation/contracts/phrase.ts';
import type { SoundRuntimePort } from '../src/workstation/contracts/sound.ts';

const hooks = registerHooks({ load(url, context, next) { return url.endsWith('.css') ? { format: 'module', source: '', shortCircuit: true } : next(url, context); } });
const { mountPhraseWorkspace } = await import('../src/workstation/modules/ui-rendering/phrase-workspace.ts'); hooks.deregister();

class Element {
  tagName: string; children: Element[] = []; parent?: Element; className = ''; textContent = ''; value = '';
  hidden = false; disabled = false; dataset: Record<string, string> = {}; attributes = new Map<string, string>();
  clientWidth = 800; clientHeight = 400; scrollLeft = 0; scrollTop = 0;
  listeners = new Map<string, Array<(event: Record<string, unknown>) => void>>();
  style: Record<string, unknown> & { setProperty(name: string, value: string): void } = { setProperty(name, value) { this[name] = value; } };
  constructor(tag: string) { this.tagName = tag; }
  classList = {
    contains: (name: string) => this.className.split(' ').includes(name),
    add: (...names: string[]) => { this.className = [...new Set([...this.className.split(' '), ...names])].join(' '); },
    remove: (...names: string[]) => { this.className = this.className.split(' ').filter(name => !names.includes(name)).join(' '); },
    toggle: (name: string, force?: boolean) => { const on = force ?? !this.classList.contains(name); if (on) this.classList.add(name); else this.classList.remove(name); return on; },
  };
  append(...children: Element[]) { for (const child of children) { child.remove(); child.parent = this; this.children.push(child); } }
  replaceChildren(...children: Element[]) { this.children.forEach(child => { child.parent = undefined; }); this.children = []; this.append(...children); }
  remove() { if (this.parent) this.parent.children = this.parent.children.filter(child => child !== this); this.parent = undefined; }
  setAttribute(name: string, value: string) { this.attributes.set(name, value); }
  matches(selector: string) {
    if (selector.startsWith('.')) return this.classList.contains(selector.slice(1));
    return selector === this.tagName || selector === 'dialog[open]' && this.tagName === 'dialog' && this.attributes.has('open');
  }
  querySelectorAll(selector: string): Element[] { return this.children.flatMap(child => [...child.matches(selector) ? [child] : [], ...child.querySelectorAll(selector)]); }
  querySelector(selector: string) { return this.querySelectorAll(selector)[0]; }
  closest(selector: string): Element | undefined { return this.matches(selector) ? this : this.parent?.closest(selector); }
  addEventListener(type: string, callback: (event: Record<string, unknown>) => void) { this.listeners.set(type, [...this.listeners.get(type) ?? [], callback]); }
  removeEventListener(type: string, callback: (event: Record<string, unknown>) => void) { this.listeners.set(type, (this.listeners.get(type) ?? []).filter(item => item !== callback)); }
  emit(type: string, values: Record<string, unknown> = {}) {
    const event = { target: this, preventDefault() {}, stopPropagation() {}, ...values };
    for (const callback of this.listeners.get(type) ?? []) callback(event);
  }
  showModal() { this.attributes.set('open', ''); }
  close() { this.attributes.delete('open'); this.emit('close'); }
  focus() { Object.assign(document, { activeElement: this }); }
}
function fixture(empty = true, saveCallback = false) {
  const document = new Element('document'); const window = new Element('window');
  Object.assign(document, { createElement: (tag: string) => new Element(tag) });
  const previous = new Map<string, PropertyDescriptor | undefined>();
  const globals = { document, window, HTMLElement: Element, HTMLInputElement: Element, HTMLSelectElement: Element,
    HTMLTextAreaElement: Element, HTMLButtonElement: Element, Node: Element, ResizeObserver: class { observe() {} disconnect() {} },
    requestAnimationFrame: () => 1, cancelAnimationFrame() {} };
  for (const [name, value] of Object.entries(globals)) { previous.set(name, Object.getOwnPropertyDescriptor(globalThis, name)); Object.defineProperty(globalThis, name, { configurable: true, value }); }
  let view: PhraseView = { savedPhrases: [], unfinishedDrafts: [], availableSounds: [{ id: 'voice', kind: 'rootsound.timbre', owner: 'timbre', schemaVersion: 1, revision: 1, name: '音色', dependencies: [], body: null }], changed: false, canUndo: false, canRedo: false };
  function activate(id: string, sourceId?: string) {
    view = { ...view, draft: { id, sourceId, kind: 'rootsound.phrase', owner: 'phrase', schemaVersion: 1, name: '新乐句', dependencies: ['voice'], body: null },
      body: { model: 'note-phrase', version: 1, timeUnit: 'beat', tempoBpm: 120, lengthBeats: 4, parts: [{ id: 'part', name: '音色', timbreId: 'voice', notes: [] }] }, changed: false };
  }
  if (!empty) activate('original', 'original-source');
  const created: Array<string | undefined> = []; const retained: string[] = []; const saves: string[] = [];
  const phrase = { read: () => view, keyboard: () => [], create() { throw new Error('Legacy direct create must not run when the project callback exists.'); },
    save(mode: string) { saves.push(mode); activate('saved-draft', 'saved-source'); return { status: 'saved', draft: view.draft!,
      content: { ...view.draft!, id: 'saved-source', revision: 1 } }; } } as unknown as PhraseEditorPort;
  const sound = { subscribe: () => () => {}, cancelAudition() {}, stop() {}, stopAll() {} } as unknown as SoundRuntimePort;
  const root = new Element('root');
  const workspace = mountPhraseWorkspace(root as unknown as HTMLElement, { phrase, sound, onSound() {}, onWelcome() {},
    onNewPhrase(id) { created.push(id); activate('created-by-project', 'project-source'); }, onSaved(id) { retained.push(id); },
    ...(saveCallback ? { onSave() { phrase.save('new'); } } : {}) });
  const button = (text: string) => { const node = root.querySelectorAll('button').find(node => node.textContent === text); assert(node, `Missing ${text}`); return node; };
  return { root, created, retained, saves, button, view: () => view,
    cleanup() { workspace.dispose(); for (const [name, descriptor] of previous) { if (descriptor) Object.defineProperty(globalThis, name, descriptor); else Reflect.deleteProperty(globalThis, name); } } };
}

test('phrase editor New delegates creation to the current project and immediately renders the returned draft', () => {
  const f = fixture(); try {
    f.button('新建乐句').emit('click');
    assert.deepEqual(f.created, [undefined]); assert.equal(f.view().draft!.id, 'created-by-project');
    assert(f.root.querySelector('.phrase-heading')); assert.equal(f.root.querySelectorAll('dialog').length, 0);
  } finally { f.cleanup(); }
});

test('dropping a sound into the empty editor passes that exact sound once to project creation', () => {
  const f = fixture(); try {
    f.root.querySelector('.phrase-workspace')!.emit('drop', { dataTransfer: { getData(type: string) {
      return type === 'application/x-rootsound-entity' ? JSON.stringify({ version: 1, kind: 'rootsound.timbre', id: 'voice' }) : '';
    } } });
    assert.deepEqual(f.created, ['voice']); assert.equal(f.view().body!.parts.length, 1);
    assert(f.root.querySelector('.phrase-heading'));
  } finally { f.cleanup(); }
});

test('direct Save-as and externally handled Save both report the resulting saved identity for library retention', () => {
  const direct = fixture(false); try {
    direct.button('另存').emit('click'); assert.deepEqual(direct.saves, ['new']); assert.deepEqual(direct.retained, ['saved-source']);
  } finally { direct.cleanup(); }
  const handled = fixture(false, true); try {
    handled.button('保存').emit('click'); assert.deepEqual(handled.saves, ['new']); assert.deepEqual(handled.retained, ['saved-source']);
  } finally { handled.cleanup(); }
});
