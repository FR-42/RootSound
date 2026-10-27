import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import { test } from 'node:test';
import type { ProjectDirectoriesPort, ProjectSetupPort } from '../src/workstation/contracts/project-directory.ts';
import { createProjectSetup } from '../src/workstation/app/project-setup.ts';

const hook = registerHooks({ load(url, context, next) {
  return url.endsWith('.css') ? { format: 'module', source: '', shortCircuit: true } : next(url, context);
} });
const { showProjectExit } = await import('../src/workstation/modules/ui-rendering/project-exit.ts'); hook.deregister();

class Element extends EventTarget {
  children: Element[] = []; parent?: Element; textContent = ''; className = ''; hidden = false; disabled = false;
  attributes = new Map<string, string>();
  readonly tagName: string;
  constructor(tagName = 'div') { super(); this.tagName = tagName; }
  append(...elements: Element[]) { for (const element of elements) { element.parent = this; this.children.push(element); } }
  remove() { if (this.parent) this.parent.children = this.parent.children.filter(element => element !== this); }
  setAttribute(key: string, value: string) { this.attributes.set(key, value); }
  showModal() { this.attributes.set('open', ''); }
  close() { this.attributes.delete('open'); this.dispatchEvent(new Event('close')); }
}
const flatten = (root: Element): Element[] => [root, ...root.children.flatMap(flatten)];
function dom() {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'document');
  Object.defineProperty(globalThis, 'document', { configurable: true, value: { createElement: (tag: string) => new Element(tag) } });
  const root = new Element('root');
  return { root, button(label: string) { const button = flatten(root).find(element => element.tagName === 'button' && element.textContent === label); assert(button); return button; },
    restore() { if (descriptor) Object.defineProperty(globalThis, 'document', descriptor); else Reflect.deleteProperty(globalThis, 'document'); } };
}
const settle = async () => { for (let index = 0; index < 8; index++) await Promise.resolve(); };
function service(overrides: Partial<ProjectSetupPort> = {}): ProjectSetupPort {
  return { defaultLocation: async () => '', chooseLocation: async () => ({ status: 'cancelled' }), create: async () => {}, open: async () => {},
    hasUnsavedChanges: async () => true, exit: async () => {}, ...overrides };
}

test('a clean project returns to welcome without a confirmation; inspection failure never exits', async t => {
  const f = dom(); t.after(() => f.restore()); const modes: string[] = [];
  await showProjectExit(f.root as unknown as HTMLElement, service({ hasUnsavedChanges: async () => false, exit: async mode => { modes.push(mode); } }));
  assert.deepEqual(modes, ['discard']); assert.equal(f.root.children.length, 0);
  await assert.rejects(showProjectExit(f.root as unknown as HTMLElement, service({ hasUnsavedChanges: async () => { throw new Error('无法检查项目'); }, exit: async () => { throw new Error('must not exit'); } })), /无法检查项目/);
  assert.equal(f.root.children.length, 0);
});

test('dirty project cancellation preserves the project and save/discard are explicit different commands', async t => {
  const f = dom(); t.after(() => f.restore()); const modes: string[] = [];
  const setup = service({ exit: async mode => { modes.push(mode); } });
  const cancelled = showProjectExit(f.root as unknown as HTMLElement, setup); await settle();
  f.button('取消').dispatchEvent(new Event('click')); await cancelled; assert.deepEqual(modes, []);
  for (const [label, mode] of [['直接退出', 'discard'], ['保存并退出', 'save']]) {
    const pending = showProjectExit(f.root as unknown as HTMLElement, setup); await settle();
    f.button(label!).dispatchEvent(new Event('click')); await pending;
    assert.equal(modes.at(-1), mode); assert.equal(f.root.children.length, 0);
  }
});

test('failed save stays in the confirmation and supports retry without overlapping exits', async t => {
  const f = dom(); t.after(() => f.restore()); let finish!: () => void; let reject!: (reason: Error) => void; let calls = 0;
  const pending = showProjectExit(f.root as unknown as HTMLElement, service({ exit() {
    calls++; return new Promise<void>((yes, no) => { finish = yes; reject = no; });
  } })); await settle();
  const save = f.button('保存并退出'); save.dispatchEvent(new Event('click'));
  f.button('直接退出').dispatchEvent(new Event('click')); assert.equal(calls, 1); assert(save.disabled);
  const cancelEvent = new Event('cancel', { cancelable: true }); f.root.children[0]!.dispatchEvent(cancelEvent); assert(cancelEvent.defaultPrevented);
  reject(new Error('磁盘不可写')); await settle();
  const error = flatten(f.root).find(element => element.attributes.get('role') === 'alert')!;
  assert.equal(error.textContent, '磁盘不可写'); assert.equal(error.hidden, false); assert.equal(save.disabled, false);
  save.dispatchEvent(new Event('click')); assert.equal(calls, 2); finish(); await pending;
  assert.equal(f.root.children.length, 0);
});

test('application exits through native custody before reloading welcome, and failures retain current editor', async () => {
  const order: string[] = [];
  const directories: ProjectDirectoriesPort = {
    read: async () => ({ defaultLocation: 'D:/RootSound/project', hasUnsavedChanges: true }),
    create: async () => { throw new Error('unused'); }, open: async () => ({ status: 'cancelled' }), chooseLocation: async () => ({ status: 'cancelled' }),
    exit: async mode => { order.push(mode); },
  };
  const setup = createProjectSetup(directories, () => { order.push('welcome'); });
  assert.equal(await setup.hasUnsavedChanges!(), true);
  await setup.exit!('save'); assert.deepEqual(order, ['save', 'welcome']);
  directories.exit = async () => { throw new Error('外部文件已变化'); };
  await assert.rejects(setup.exit!('discard'), /外部文件已变化/); assert.deepEqual(order, ['save', 'welcome']);
  directories.read = async () => ({ defaultLocation: 'D:/RootSound/project' });
  await assert.rejects(setup.hasUnsavedChanges!(), /不支持检查/);
});

test('pending exit excludes concurrent save, create and exit until the custodian completes', async () => {
  let finish!: () => void; let entered = 0;
  const directories: ProjectDirectoriesPort = {
    read: async () => ({ defaultLocation: 'D:/RootSound/project', hasUnsavedChanges: false }),
    create: async () => { throw new Error('must not create'); }, open: async () => ({ status: 'cancelled' }), chooseLocation: async () => ({ status: 'cancelled' }),
    exit: () => new Promise<void>(done => { finish = done; }),
  };
  const setup = createProjectSetup(directories, () => { entered++; });
  const pending = setup.exit!('discard');
  await assert.rejects(setup.exit!('save'), /稍候/); await assert.rejects(setup.save!(), /稍候/);
  await assert.rejects(setup.create('另一首', 'D:/RootSound/project'), /稍候/);
  assert.equal(entered, 0); finish(); await pending; assert.equal(entered, 1);
});
