import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { ProjectSetupPort } from '../src/workstation/contracts/project-directory.ts';
import { mountProjectStart } from '../src/workstation/modules/ui-rendering/project-start.ts';

// Exercise the form's state and asynchronous boundaries without a browser or disk.
class TestElement extends EventTarget {
  tagName: string;
  children: TestElement[] = [];
  attributes = new Map<string, string>();
  textContent = '';
  value = '';
  name = '';
  type = '';
  hidden = false;
  disabled = false;
  focused = false;
  constructor(tagName: string) { super(); this.tagName = tagName; }
  append(...children: TestElement[]): void { this.children.push(...children); }
  replaceChildren(...children: TestElement[]): void { this.children = children; }
  setAttribute(name: string, value: string): void { this.attributes.set(name, value); }
  focus(): void { this.focused = true; }
}

function all(root: TestElement): TestElement[] { return [root, ...root.children.flatMap(all)]; }
function find(root: TestElement, predicate: (node: TestElement) => boolean): TestElement {
  const found = all(root).find(predicate);
  assert.ok(found, 'Expected an active form control.');
  return found;
}
function fire(node: TestElement, type: string): void { node.dispatchEvent(new Event(type, { cancelable: true })); }
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}
function settle(): Promise<void> { return new Promise(resolve => setImmediate(resolve)); }
function setup(overrides: Partial<ProjectSetupPort> = {}): ProjectSetupPort {
  return {
    defaultLocation: async () => 'D:/Music',
    chooseLocation: async () => ({ status: 'cancelled' }),
    create: async () => {},
    open: async () => {},
    ...overrides,
  };
}
function fixture(service?: ProjectSetupPort, onBack?: () => void) {
  const before = Object.getOwnPropertyDescriptor(globalThis, 'document');
  Object.defineProperty(globalThis, 'document', {
    configurable: true, writable: true, value: { createElement: (tag: string) => new TestElement(tag) },
  });
  const root = new TestElement('root');
  const mounted = mountProjectStart(root as unknown as HTMLElement, service, undefined, onBack);
  const field = (name: string) => find(root, node => node.tagName === 'input' && node.name === name);
  return {
    root, mounted, field,
    button: (text: string) => find(root, node => node.tagName === 'button' && node.textContent === text),
    error: () => find(root, node => node.attributes.get('role') === 'alert'),
    enter(name: string, value: string) { const input = field(name); input.value = value; fire(input, 'input'); },
    submit() { fire(find(root, node => node.tagName === 'form'), 'submit'); },
    dispose() {
      mounted.dispose();
      if (before) Object.defineProperty(globalThis, 'document', before);
      else Reflect.deleteProperty(globalThis, 'document');
    },
  };
}

test('settings save preserves the song name and parent location without creating a project', async t => {
  const creations: [string, string][] = [];
  const chosenFrom: string[] = [];
  const f = fixture(setup({
    create: async (name, path) => { creations.push([name, path]); },
    chooseLocation: async current => { chosenFrom.push(current); return { status: 'chosen', path: 'E:/Songs' }; },
  }));
  t.after(() => f.dispose());
  await settle();
  f.enter('name', '窗边的第一首歌');
  fire(f.button('详细设置'), 'click');
  assert.equal(f.field('location').value, 'D:/Music');
  f.enter('location', 'D:/MySongs');
  f.submit();
  assert.equal(f.field('name').value, '窗边的第一首歌');
  fire(f.button('详细设置'), 'click');
  assert.equal(f.field('location').value, 'D:/MySongs');
  fire(find(f.root, node => node.attributes.get('aria-label') === '选择文件夹'), 'click');
  await settle();
  assert.deepEqual(chosenFrom, ['D:/MySongs']);
  assert.equal(f.field('location').value, 'E:/Songs');
  f.submit();
  assert.equal(f.field('name').value, '窗边的第一首歌');
  fire(f.button('详细设置'), 'click');
  assert.equal(f.field('location').value, 'E:/Songs');
  assert.deepEqual(creations, []);
});

test('an empty name never creates, and a failed creation retains inputs for retry', async t => {
  const creations: [string, string][] = [];
  const f = fixture(setup({ create: async (name, path) => {
    creations.push([name, path]);
    if (creations.length === 1) throw new Error('同名项目已存在。');
  } }));
  t.after(() => f.dispose());
  await settle();
  f.enter('name', '   ');
  f.submit();
  assert.equal(creations.length, 0);
  assert.equal(f.field('name').value, '   ');
  assert.equal(f.field('name').focused, true);
  assert.match(f.error().textContent, /名字/);
  f.enter('name', '雨后的歌');
  fire(f.button('详细设置'), 'click');
  f.enter('location', 'E:/MySongs');
  f.submit();
  f.submit();
  await settle();
  assert.equal(f.field('name').value, '雨后的歌');
  assert.equal(f.field('name').disabled, false);
  assert.equal(f.error().textContent, '同名项目已存在。');
  assert.equal(f.error().hidden, false);
  fire(f.button('详细设置'), 'click');
  assert.equal(f.field('location').value, 'E:/MySongs');
  f.submit();
  f.submit();
  await settle();
  assert.deepEqual(creations, [['雨后的歌', 'E:/MySongs'], ['雨后的歌', 'E:/MySongs']]);
});

test('pending and successful creation cannot be submitted again before the application reloads', async t => {
  const creation = deferred<void>();
  let count = 0;
  const f = fixture(setup({ create: () => { count++; return creation.promise; } }));
  t.after(() => f.dispose());
  await settle();
  f.enter('name', '新歌曲');
  f.submit();
  f.submit();
  fire(f.button('详细设置'), 'click');
  assert.equal(count, 1);
  assert.equal(f.field('name').disabled, true);
  assert.equal(f.button('创建！').disabled, true);
  creation.resolve();
  await settle();
  f.submit();
  assert.equal(count, 1);
  assert.equal(f.button('创建！').disabled, true);
});

test('a late default location cannot replace a manually entered parent folder across view changes', async t => {
  const location = deferred<string>();
  const f = fixture(setup({ defaultLocation: () => location.promise }));
  t.after(() => f.dispose());
  f.enter('name', '慢慢写');
  fire(f.button('详细设置'), 'click');
  f.enter('location', 'E:/Manual');
  f.submit();
  location.resolve('D:/Default');
  await settle();
  assert.equal(f.field('name').value, '慢慢写');
  fire(f.button('详细设置'), 'click');
  assert.equal(f.field('location').value, 'E:/Manual');
});

test('disposing the form prevents a pending default read from filling an obsolete input', async t => {
  const location = deferred<string>();
  const f = fixture(setup({ defaultLocation: () => location.promise }));
  t.after(() => f.dispose());
  fire(f.button('详细设置'), 'click');
  const staleInput = f.field('location');
  f.mounted.dispose();
  const replacement = new TestElement('replacement');
  f.root.replaceChildren(replacement);
  location.resolve('D:/TooLate');
  await settle();
  assert.equal(staleInput.value, '');
  assert.deepEqual(f.root.children, [replacement]);
});

test('default-read failures stay in the form and allow recovery through settings', async t => {
  const creations: [string, string][] = [];
  const f = fixture(setup({
    defaultLocation: async () => { throw new Error('无法读取默认位置。'); },
    create: async (name, path) => { creations.push([name, path]); },
  }));
  t.after(() => f.dispose());
  f.enter('name', '保留下来的名字');
  await settle();
  assert.equal(f.error().textContent, '无法读取默认位置。');
  assert.equal(f.field('name').value, '保留下来的名字');
  fire(f.button('详细设置'), 'click');
  f.enter('location', 'E:/Recovered');
  f.submit();
  f.submit();
  await settle();
  assert.deepEqual(creations, [['保留下来的名字', 'E:/Recovered']]);
});

test('without a project service, submission retains the name and reports desktop availability', t => {
  const f = fixture();
  t.after(() => f.dispose());
  f.enter('name', '还没创建的歌');
  f.submit();
  assert.equal(f.field('name').value, '还没创建的歌');
  assert.match(f.error().textContent, /桌面版/);
  assert.equal(f.field('name').disabled, false);
});

test('return leaves creation without creating a folder and stays blocked during an actual create', async t => {
  let back = 0; let creates = 0; let reject!: (reason: Error) => void;
  const f = fixture(setup({ create: () => { creates++; return new Promise<void>((_resolve, fail) => { reject = fail; }); } }), () => { back++; });
  t.after(() => f.dispose()); await settle();
  fire(f.button('返回'), 'click'); assert.equal(back, 1); assert.equal(creates, 0);
  f.enter('name', '新作品'); f.submit(); assert.equal(f.button('返回').disabled, true);
  fire(f.button('返回'), 'click'); assert.equal(back, 1);
  reject(new Error('目录不可写')); await settle(); fire(f.button('返回'), 'click'); assert.equal(back, 2);
});
