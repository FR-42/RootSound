import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import { test } from 'node:test';
import type { ProjectSetupPort } from '../src/workstation/contracts/project-directory.ts';

const hook = registerHooks({ load(url, context, next) {
  return url.endsWith('.css') ? { format: 'module', source: '', shortCircuit: true } : next(url, context);
} });
const { showProjectSaveAs } = await import('../src/workstation/modules/ui-rendering/project-save-as.ts'); hook.deregister();

class Element extends EventTarget {
  readonly tagName: string; children: Element[] = []; parent?: Element;
  textContent = ''; className = ''; hidden = false; disabled = false; value = ''; focused = false;
  attributes = new Map<string, string>();
  constructor(tag: string) { super(); this.tagName = tag; }
  append(...children: Element[]) { for (const child of children) { child.parent = this; this.children.push(child); } }
  remove() { if (this.parent) this.parent.children = this.parent.children.filter(child => child !== this); this.parent = undefined; }
  contains(other: Element): boolean { return this === other || this.children.some(child => child.contains(other)); }
  setAttribute(key: string, value: string) { this.attributes.set(key, value); }
  showModal() { this.attributes.set('open', ''); }
  close() { this.attributes.delete('open'); this.dispatchEvent(new Event('close')); }
  focus() { this.focused = true; }
  select() {}
}
const flatten = (root: Element): Element[] => [root, ...root.children.flatMap(flatten)];
const settle = async () => { for (let index = 0; index < 10; index++) await Promise.resolve(); };
function fixture(overrides: Partial<ProjectSetupPort> = {}) {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'document');
  Object.defineProperty(globalThis, 'document', { configurable: true, value: { createElement: (tag: string) => new Element(tag) } });
  const root = new Element('root'); const copies: Array<[string, string]> = []; let choosers = 0; let locations = 0;
  const service: ProjectSetupPort = {
    defaultLocation: async () => { locations++; return 'D:/RootSound/project'; },
    chooseLocation: async () => { choosers++; return { status: 'chosen', path: 'E:/MustNotChoose' }; },
    create: async () => {}, open: async () => {}, saveAs: async (name, location) => { copies.push([name, location]); }, ...overrides,
  };
  showProjectSaveAs(root as unknown as HTMLElement, service, '原名称');
  const find = (predicate: (node: Element) => boolean) => { const value = flatten(root).find(predicate); assert(value); return value; };
  return { root, copies, get choosers() { return choosers; }, get locations() { return locations; },
    name: () => find(node => node.tagName === 'input'),
    button: (text: string) => find(node => node.tagName === 'button' && node.textContent === text),
    error: () => find(node => node.attributes.get('role') === 'alert'),
    dialog: () => find(node => node.tagName === 'dialog'),
    submit() { find(node => node.tagName === 'form').dispatchEvent(new Event('submit', { cancelable: true })); },
    cleanup() { if (descriptor) Object.defineProperty(globalThis, 'document', descriptor); else Reflect.deleteProperty(globalThis, 'document'); },
  };
}

test('Save As shows only one name field and saves directly to the default library without a directory chooser', async () => {
  const f = fixture(); try {
    assert.equal(flatten(f.root).filter(node => node.tagName === 'input').length, 1);
    assert.equal(f.name().value, '原名称 1'); assert.equal(f.locations, 0);
    assert(!flatten(f.root).some(node => node.textContent === '保存目录' || node.textContent === '…'));
    f.name().value = '  新的歌曲  '; f.submit(); f.submit(); await settle();
    assert.deepEqual(f.copies, [['新的歌曲', 'D:/RootSound/project']]); assert.equal(f.locations, 1); assert.equal(f.choosers, 0);
    assert.equal(f.button('保存').disabled, true, 'successful save waits for the application reload');
    f.submit(); await settle(); assert.equal(f.copies.length, 1);
  } finally { f.cleanup(); }
});

test('empty name never reads a location or saves; failure preserves the name and allows retry', async () => {
  let calls = 0; const copies: Array<[string, string]> = [];
  const f = fixture({ saveAs: async (name, location) => { copies.push([name, location]); if (++calls === 1) throw new Error('同名歌曲已存在'); } });
  try {
    f.name().value = '  '; f.submit(); await settle(); assert.equal(f.locations, 0); assert.equal(calls, 0);
    assert.match(f.error().textContent, /填写/); assert(f.name().focused);
    f.name().value = '保留输入'; f.submit(); await settle();
    assert.equal(f.error().textContent, '同名歌曲已存在'); assert.equal(f.name().value, '保留输入'); assert.equal(f.button('保存').disabled, false);
    f.submit(); await settle(); assert.deepEqual(copies, [['保留输入', 'D:/RootSound/project'], ['保留输入', 'D:/RootSound/project']]);
  } finally { f.cleanup(); }
});

test('default-location errors do not fall back to another directory or save; retry can recover', async () => {
  let calls = 0; const f = fixture({ defaultLocation: async () => { if (++calls === 1) throw new Error('暂时无法找到乐曲库'); return 'D:/DefaultOnly'; } });
  try {
    f.submit(); await settle(); assert.equal(f.error().textContent, '暂时无法找到乐曲库'); assert.equal(f.button('保存').disabled, false);
    assert.deepEqual(f.copies, []); assert.equal(f.choosers, 0); assert.equal(f.name().value, '原名称 1');
    f.submit(); await settle(); assert.deepEqual(f.copies, [['原名称 1', 'D:/DefaultOnly']]);
  } finally { f.cleanup(); }
});

test('Cancel is free before save, but a pending save blocks duplicate submits and user cancellation', async () => {
  const cancelled = fixture(); cancelled.button('×').dispatchEvent(new Event('click')); assert.equal(cancelled.root.children.length, 0); cancelled.cleanup();
  let finish!: () => void; let saves = 0;
  const f = fixture({ saveAs: () => { saves++; return new Promise(resolve => { finish = resolve; }); } });
  try {
    f.submit(); await settle(); f.submit(); f.button('×').dispatchEvent(new Event('click'));
    const event = new Event('cancel', { cancelable: true }); f.dialog().dispatchEvent(event);
    assert(event.defaultPrevented); assert.equal(f.root.children.length, 1); assert.equal(saves, 1);
    assert(f.button('×').disabled); finish(); await settle(); assert(f.button('保存').disabled);
  } finally { f.cleanup(); }
});

test('a closed or detached dialog cannot trigger a late save after location lookup', async () => {
  for (const detach of [false, true]) {
    let finish!: (path: string) => void;
    const f = fixture({ defaultLocation: () => new Promise(resolve => { finish = resolve; }) });
    try {
      f.submit(); if (detach) f.dialog().remove(); else f.dialog().close();
      finish('D:/RootSound/project'); await settle(); assert.deepEqual(f.copies, []);
    } finally { f.cleanup(); }
  }
});
