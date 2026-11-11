import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import { test } from 'node:test';

const hook = registerHooks({ load(url, context, next) {
  return url.endsWith('.css') ? { format: 'module', source: '', shortCircuit: true } : next(url, context);
} });
const { showProjectNameDialog } = await import('../src/workstation/modules/ui-rendering/project-save-as.ts'); hook.deregister();

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
function fixture(save?: (name: string) => Promise<void>) {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'document');
  Object.defineProperty(globalThis, 'document', { configurable: true, value: { createElement: (tag: string) => new Element(tag) } });
  const root = new Element('root'); const names: string[] = [];
  const result = showProjectNameDialog(root as unknown as HTMLElement, '另存为', '原名称', '保存',
    save ?? (async name => { names.push(name); }));
  const find = (predicate: (node: Element) => boolean) => { const value = flatten(root).find(predicate); assert(value); return value; };
  return { root, names, result,
    name: () => find(node => node.tagName === 'input'),
    button: (text: string) => find(node => node.tagName === 'button' && node.textContent === text),
    error: () => find(node => node.attributes.get('role') === 'alert'),
    dialog: () => find(node => node.tagName === 'dialog'),
    submit() { find(node => node.tagName === 'form').dispatchEvent(new Event('submit', { cancelable: true })); },
    cleanup() { if (descriptor) Object.defineProperty(globalThis, 'document', descriptor); else Reflect.deleteProperty(globalThis, 'document'); },
  };
}

test('save name dialog contains one name field and submits exactly once', async () => {
  const f = fixture(); try {
    assert.equal(flatten(f.root).filter(node => node.tagName === 'input').length, 1);
    assert.equal(f.name().value, '原名称');
    f.name().value = '  新的歌曲  '; f.submit(); await settle();
    assert.deepEqual(f.names, ['新的歌曲']);
    assert.equal(await f.result, true);
    assert.equal(f.root.children.length, 0);
  } finally { f.cleanup(); }
});

test('empty names do not save and errors preserve input for retry', async () => {
  const calls: string[] = [];
  const f = fixture(async name => { calls.push(name); if (calls.length === 1) throw new Error('同名歌曲已存在'); });
  try {
    f.name().value = '  '; f.submit(); await settle(); assert.equal(calls.length, 0);
    assert.match(f.error().textContent, /不能为空/);
    f.name().value = '保留输入'; f.submit(); await settle();
    assert.equal(f.error().textContent, '同名歌曲已存在'); assert.equal(f.name().value, '保留输入');
    f.submit(); assert.equal(await f.result, true);
    assert.deepEqual(calls, ['保留输入', '保留输入']);
  } finally { f.cleanup(); }
});

test('Cancel closes the dialog and a pending save prevents duplicate submissions', async () => {
  const cancelled = fixture();
  try { cancelled.button('×').dispatchEvent(new Event('click')); assert.equal(await cancelled.result, false); }
  finally { cancelled.cleanup(); }
  let finish!: () => void; let saves = 0;
  const f = fixture(() => { saves++; return new Promise(resolve => { finish = resolve; }); });
  try {
    f.submit(); await settle(); f.submit(); f.button('×').dispatchEvent(new Event('click'));
    const event = new Event('cancel', { cancelable: true }); f.dialog().dispatchEvent(event);
    assert(event.defaultPrevented); assert.equal(f.root.children.length, 1); assert.equal(saves, 1);
    finish(); assert.equal(await f.result, true);
  } finally { f.cleanup(); }
});
