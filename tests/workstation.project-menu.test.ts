import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import { test } from 'node:test';
import type { ProjectSetupPort } from '../src/workstation/contracts/project-directory.ts';
import { createProjectSetup } from '../src/workstation/app/project-setup.ts';

const hook = registerHooks({ load(url, context, next) { return url.endsWith('.css') ? { format: 'module', source: '', shortCircuit: true } : next(url, context); } });
const { mountProjectLibrary } = await import('../src/workstation/modules/ui-rendering/project-library.ts'); hook.deregister();
class Element extends EventTarget {
  children: Element[] = []; parent?: Element; textContent = ''; className = ''; hidden = false; disabled = false; title = '';
  attributes = new Map<string, string>(); tagName: string;
  style: Record<string, unknown> & { setProperty(name: string, value: string): void } = { setProperty(name, value) { this[name] = value; } };
  dataset: Record<string, string> = {}; scrollTop = 0; clientHeight = 400;
  constructor(tag = 'div') { super(); this.tagName = tag; }
  classList = {
    add: (name: string) => { if (!this.className.split(' ').includes(name)) this.className = (this.className + ' ' + name).trim(); },
    remove: (name: string) => { this.className = this.className.split(' ').filter(item => item !== name).join(' '); },
    toggle: (name: string, value: boolean) => { if (value) this.classList.add(name); else this.classList.remove(name); },
  };
  closest(selector: string): Element | undefined {
    return this.className.split(' ').includes(selector.slice(1)) ? this : this.parent?.closest(selector);
  }
  get lastElementChild(): Element | undefined { return this.children.at(-1); }
  get firstElementChild(): Element | undefined { return this.children[0]; }
  querySelector(selector: string): Element | undefined { return this.children.flatMap(flatten).find(item => item.className.split(' ').includes(selector.slice(1))); }
  append(...elements: Element[]) { for (const element of elements) { element.parent = this; this.children.push(element); } }
  insertBefore(element: Element, before: Element | null) {
    if (!before) { this.append(element); return; }
    element.parent = this;
    this.children.splice(this.children.indexOf(before), 0, element);
  }
  replaceChildren(...elements: Element[]) { this.children = []; this.append(...elements); }
  remove() { if (this.parent) this.parent.children = this.parent.children.filter(element => element !== this); }
  setAttribute(key: string, value: string) { this.attributes.set(key, value); }
  contains(other: Element): boolean { return other === this || this.children.some(element => element.contains(other)); }
  replaceWith(other: Element) { if (this.parent) { const parent = this.parent; parent.children[parent.children.indexOf(this)] = other; other.parent = parent; this.parent = undefined; } }
  getBoundingClientRect() { return { top: 300 }; }
  focus() { (document as unknown as { activeElement: Element }).activeElement = this; }
}
const flatten = (root: Element): Element[] => [root, ...root.children.flatMap(flatten)];
const visible = (root: Element): Element[] => root.hidden ? [] : [root, ...root.children.flatMap(visible)];
const settle = async () => { for (let index = 0; index < 8; index++) await Promise.resolve(); };
function fixture(overrides: Partial<ProjectSetupPort> = {}, desktopPointerUx = false) {
  const old = Object.getOwnPropertyDescriptor(globalThis, 'document'); const document = new Element('document');
  Object.assign(document, { createElement: (tag: string) => new Element(tag), createElementNS: (_: string, tag: string) => new Element(tag) });
  Object.defineProperty(globalThis, 'document', { configurable: true, value: document });
  const oldWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
  if (desktopPointerUx) {
    const window = Object.assign(new EventTarget(), {
      setTimeout: (call: () => void, delay: number) => setTimeout(call, delay),
      clearTimeout: (timer: ReturnType<typeof setTimeout>) => clearTimeout(timer),
    });
    Object.defineProperty(globalThis, 'window', { configurable: true, value: window });
  }
  const root = new Element('root'); const trigger = new Element('button'); root.append(trigger);
  const opened: Array<string | undefined> = []; let created = 0;
  const service: ProjectSetupPort = { defaultLocation: async () => 'D:/RootSound/project', chooseLocation: async () => ({ status: 'cancelled' }), create: async () => {},
    list: async () => [{ id: 'one', name: '第一首', path: 'D:/RootSound/project/第一首.rootsound' }], open: async path => { opened.push(path); }, ...overrides };
  const menu = mountProjectLibrary(root as unknown as HTMLElement, trigger as unknown as HTMLButtonElement, service, () => { created++; }, undefined, desktopPointerUx);
  return { root, trigger, menu, service, opened, get created() { return created; }, document,
    button(label: string) { const button = flatten(root).find(element => element.tagName === 'button' && (element.attributes.get('aria-label') === label || element.textContent === label)); assert(button); return button; },
    cleanup() {
      menu.dispose();
      if (old) Object.defineProperty(globalThis, 'document', old); else Reflect.deleteProperty(globalThis, 'document');
      if (desktopPointerUx) {
        if (oldWindow) Object.defineProperty(globalThis, 'window', oldWindow); else Reflect.deleteProperty(globalThis, 'window');
      }
    } };
}

function dragEvent(element: Element, type: string, transfer: object): Event {
  const event = new Event(type, { cancelable: true }); Object.assign(event, { dataTransfer: transfer }); element.dispatchEvent(event); return event;
}
function transfer() {
  const data = new Map<string, string>();
  return { effectAllowed: '', dropEffect: '', setData(type: string, value: string) { data.set(type, value); }, getData(type: string) { return data.get(type) ?? ''; } };
}
function named(root: Element, className: string): Element {
  const result = flatten(root).find(node => node.className.split(' ').includes(className)); assert(result); return result;
}

test('desktop library mounts only nearby rows and opens the correct song after scrolling to the end', async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const root = 'D:/RootSound/project';
  const entries = Array.from({ length: 448 }, (_, index) => ({
    kind: 'project' as const, id: String(index), name: '乐曲 ' + index, path: `${root}/${index}.rootsound`,
  }));
  const f = fixture({ browse: async () => ({ root, path: root, entries }), readLibraryDuration: async () => 65 }, true);
  try {
    f.menu.open(); await settle();
    const overlay = named(f.root, 'is-library-workspace');
    const visibleRows = () => visible(f.root).filter(item => item.className === 'project-library-entry-name');
    assert.equal(visibleRows().length, 14);
    assert.equal(visibleRows()[0]!.textContent, '乐曲 0');
    assert.equal(named(f.root, 'project-library-entry-duration').textContent, '1:05');
    const scroll = new Event('wheel', { cancelable: true });
    overlay.dispatchEvent(scroll);
    assert.equal(scroll.defaultPrevented, false);
    const list = named(f.root, 'project-library-grid');
    list.scrollTop = entries.length * 40 - list.clientHeight;
    list.dispatchEvent(new Event('scroll')); await settle();
    assert.equal(visibleRows().length, 14);
    assert.equal(visibleRows().at(-1)!.textContent, '乐曲 447');
    const last = f.button('乐曲 447');
    last.dispatchEvent(new Event('pointerover')); await settle();
    assert.deepEqual(f.opened, []);
    last.dispatchEvent(new Event('click')); t.mock.timers.tick(600); await settle();
    assert.deepEqual(f.opened, [entries[447]!.path]);
  } finally { f.cleanup(); }
});

test('desktop library folder rows and breadcrumb navigate the list', async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const root = 'D:/RootSound/project', child = root + '/演示项目';
  const opened: string[] = [];
  const f = fixture({ browse: async (path = root) => {
    opened.push(path);
    return path === root ? { root, path, entries: [{ kind: 'folder', name: '演示项目', path: child }] }
      : { root, path, parent: root, entries: [{ kind: 'project', name: '钟', path: child + '/钟.rootsound', id: 'one' }] };
  } }, true);
  try {
    f.menu.open(); await settle();
    f.button('打开文件夹 演示项目').dispatchEvent(new Event('click')); t.mock.timers.tick(600); await settle();
    assert(f.button('钟'));
    f.button('乐曲库根目录').dispatchEvent(new Event('click')); await settle();
    assert.deepEqual(opened, [root, child, root]);
  } finally { f.cleanup(); }
});

test('welcome library places its three actions after the path and creates in the current folder', async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const root = 'D:/RootSound/project', child = root + '/演示项目';
  const started: Array<[string, string]> = [];
  const created: Array<[string, string]> = [];
  const f = fixture({
    browse: async (path = root) => path === root
      ? { root, path, entries: [{ kind: 'folder', name: '演示项目', path: child }] }
      : { root, path, parent: root, entries: [{ kind: 'project', id: 'one', name: '新建项目', path: child + '/新建项目.rootsound' }] },
    chooseLibraryFolder: async () => { throw Error('Unexpected folder chooser'); },
    createFolder: async (path, name) => {
      created.push([path, name]);
    },
    startNew: async (name, path) => { started.push([name, path]); },
  }, true);
  try {
    f.menu.open(); await settle();
    const directory = named(f.root, 'project-library-directory');
    const [breadcrumb, actions] = directory.children;
    assert.equal(breadcrumb?.tagName, 'nav');
    assert.deepEqual(actions?.children.map(button => [button.attributes.get('aria-label'), button.textContent, button.children[0]?.tagName]), [
      ['选择音乐文件', '', 'svg'], ['新建文件夹', '', 'svg'], ['新建项目', '', 'svg'],
    ]);
    assert(!visible(f.root).some(node => node.tagName === 'h2'));
    f.button('打开文件夹 演示项目').dispatchEvent(new Event('click')); t.mock.timers.tick(600); await settle();
    f.button('选择音乐文件').dispatchEvent(new Event('click')); await settle();
    assert.deepEqual(f.opened, [undefined]);
    assert.equal(breadcrumb?.lastElementChild?.textContent, '演示项目');
    assert.equal(named(f.root, 'is-welcome-library').hidden, false);
    f.button('新建文件夹').dispatchEvent(new Event('click'));
    const form = named(f.root, 'project-library-folder-form');
    Object.assign(form.children[0]!, { value: '草稿' });
    form.dispatchEvent(new Event('submit', { cancelable: true })); await settle();
    assert.deepEqual(created, [[child, '草稿']]);
    f.button('新建项目').dispatchEvent(new Event('click')); await settle();
    assert.deepEqual(started, [['新建项目 1', child]]);
  } finally { f.cleanup(); }
});

test('a deleted song disappears while a retained external tone-copy notice remains visible in the library', async () => {
  let projects = [{ id: 'one', name: '第一首', path: 'D:/RootSound/project/第一首.rootsound' }]; let removals = 0;
  const f = fixture({ list: async () => projects, remove: async () => { removals++; projects = []; return { warning: '歌曲已删除，外部修改过的音色副本已保留。' }; } });
  try {
    f.menu.open(); await settle(); const item = f.button('第一首'); const data = transfer();
    dragEvent(item, 'dragstart', data); dragEvent(named(f.root, 'project-library-trash'), 'drop', data);
    f.button('确认彻底删除乐曲').dispatchEvent(new Event('click')); await settle();
    assert.equal(removals, 1); assert(!visible(f.root).some(node => node.textContent === '第一首'));
    const notice = named(f.root, 'project-library-error'); assert.equal(notice.hidden, false); assert.match(notice.textContent, /歌曲已删除.*副本已保留/);
    assert.equal(named(f.root, 'project-delete-overlay').hidden, true);
  } finally { f.cleanup(); }
});
test('song library keeps new/import in its toolbar and files in the row list', async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const f = fixture(); try {
    f.menu.open(); await settle();
    assert.deepEqual(f.opened, []);
    const labels = visible(f.root).filter(element => element.tagName === 'button').map(element => element.textContent);
    assert.deepEqual(labels, ['', '新建', '打开', '×', '第一首']);
    assert.equal(f.button('新的开始').children[0]?.tagName, 'svg');
    assert(flatten(f.root).some(element => element.attributes.get('role') === 'dialog' && element.attributes.get('aria-label') === '乐曲库'));
    f.button('第一首').dispatchEvent(new Event('click')); t.mock.timers.tick(600); await settle();
    assert.deepEqual(f.opened, ['D:/RootSound/project/第一首.rootsound']);
    f.button('选择音乐文件').dispatchEvent(new Event('click')); await settle();
    assert.deepEqual(f.opened, ['D:/RootSound/project/第一首.rootsound', undefined]);
    // A cancelled native picker does not dismiss the library.
    assert.equal(f.trigger.attributes.get('aria-expanded'), 'true');
    f.button('新的开始').dispatchEvent(new Event('click')); assert.equal(f.created, 1);
    assert.equal(f.trigger.attributes.get('aria-expanded'), 'false');
  } finally { f.cleanup(); }
});
test('a failed listing keeps creation and custom-file opening available and a failed open can retry', async () => {
  let attempts = 0;
  const f = fixture({ list: async () => { throw new Error('无法读取默认目录'); }, open: async () => { if (++attempts === 1) throw new Error('工程已移走'); } });
  try {
    f.menu.open(); await settle(); assert(flatten(f.root).some(element => element.textContent === '无法读取默认目录'));
    f.button('选择音乐文件').dispatchEvent(new Event('click')); await settle();
    assert(flatten(f.root).some(element => element.textContent === '工程已移走'));
    f.button('选择音乐文件').dispatchEvent(new Event('click')); await settle(); assert.equal(attempts, 2);
  } finally { f.cleanup(); }
});
test('disposal ignores a late project listing and pending opens cannot overlap', async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  let listDone!: (value: []) => void;
  const late = fixture({ list: () => new Promise(resolve => { listDone = resolve; }) });
  late.menu.open(); late.menu.dispose(); listDone([]); await settle(); assert.equal(late.root.children.length, 1); late.cleanup();
  let finish!: () => void; let opens = 0;
  const f = fixture({ open: () => { opens++; return new Promise(resolve => { finish = resolve; }); } });
  try {
    f.menu.open(); await settle(); f.button('第一首').dispatchEvent(new Event('click')); t.mock.timers.tick(600);
    f.button('选择音乐文件').dispatchEvent(new Event('click')); f.menu.open(); assert.equal(opens, 1);
    f.button('新的开始').dispatchEvent(new Event('click')); assert.equal(f.created, 0);
    f.button('关闭乐曲库').dispatchEvent(new Event('click')); assert.equal(f.trigger.attributes.get('aria-expanded'), 'true');
    finish(); await settle(); f.button('关闭乐曲库').dispatchEvent(new Event('click'));
    assert.equal(f.trigger.attributes.get('aria-expanded'), 'false');
  } finally { f.cleanup(); }
});

test('empty library stays minimal, Escape restores focus and reopening refreshes its catalog', async () => {
  let reads = 0;
  const f = fixture({ list: async () => { reads++; return []; } });
  try {
    f.menu.open(); await settle();
    assert.deepEqual(flatten(f.root).filter(node => node.className.includes('project-library-tile')).map(node => node.textContent), []);
    const event = new Event('keydown', { cancelable: true }); Object.assign(event, { key: 'Escape' });
    f.document.dispatchEvent(event); assert.equal(event.defaultPrevented, true);
    assert.equal(f.trigger.attributes.get('aria-expanded'), 'false');
    assert.equal((document as unknown as { activeElement: Element }).activeElement, f.trigger);
    f.menu.open(); await settle(); assert.equal(reads, 2);
  } finally { f.cleanup(); }
});

test('a closed library cannot receive a stale catalog result', async () => {
  let finish!: (projects: []) => void;
  const f = fixture({ list: () => new Promise(resolve => { finish = resolve; }) });
  try {
    f.menu.open(); f.button('关闭乐曲库').dispatchEvent(new Event('click')); finish([]); await settle();
    assert.equal(f.trigger.attributes.get('aria-expanded'), 'false'); assert.deepEqual(f.opened, []);
  } finally { f.cleanup(); }
});

test('right-click rename persists the listed song identity without opening it', async () => {
  const renamed: unknown[][] = [];
  const f = fixture({ rename: async (project, name) => { renamed.push([project, name]); return { ...project, name }; } });
  try {
    f.menu.open(); await settle(); const tile = f.button('第一首');
    tile.dispatchEvent(new Event('dblclick', { cancelable: true }));
    assert(!flatten(f.root).some(item => item.className === 'project-library-name'));
    tile.dispatchEvent(new Event('contextmenu', { cancelable: true })); f.button('改名').dispatchEvent(new Event('click')); await settle();
    assert.deepEqual(f.opened, []); const input = named(f.root, 'project-library-name'); assert.equal(input.tagName, 'input');
    Object.assign(input, { value: '新的曲名' }); const enter = new Event('keydown', { cancelable: true }); Object.assign(enter, { key: 'Enter' }); input.dispatchEvent(enter); await settle();
    assert.deepEqual(renamed, [[{ id: 'one', name: '第一首', path: 'D:/RootSound/project/第一首.rootsound' }, '新的曲名']]);
    assert(f.button('新的曲名')); assert.deepEqual(f.opened, []);
  } finally { f.cleanup(); }
});

test('desktop folders and imported files rename only through their right-click menus', async () => {
  const root = 'D:/RootSound/project';
  for (const entry of [
    { kind: 'folder' as const, name: 'Folder', path: root + '/Folder' },
    { kind: 'midi' as const, name: 'Imported', path: root + '/Imported.mid' },
  ]) {
    const renames: string[][] = [];
    let browses = 0;
    const f = fixture({
      browse: async () => { browses++; return { root, path: root, entries: [entry] }; },
      renameEntry: async (path, name) => { renames.push([path, name]); },
    }, true);
    try {
      f.menu.open(); await settle();
      const row = f.button(entry.kind === 'folder' ? '打开文件夹 Folder' : '打开 Imported');
      row.dispatchEvent(new Event('dblclick', { cancelable: true }));
      assert(!flatten(f.root).some(item => item.className === 'project-library-name'));
      row.dispatchEvent(new Event('contextmenu', { cancelable: true })); f.button('改名').dispatchEvent(new Event('click')); await settle();
      assert.equal(browses, 1); assert.deepEqual(f.opened, []);
      const input = named(f.root, 'project-library-name'); Object.assign(input, { value: 'New name' });
      const enter = new Event('keydown', { cancelable: true }); Object.assign(enter, { key: 'Enter' });
      input.dispatchEvent(enter); await settle();
      assert.deepEqual(renames, [[entry.path, 'New name']]);
    } finally { f.cleanup(); }
  }
});

test('song inline rename rejects empty names, Escape cancels, and failures retain text for retry', async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] }); let attempts = 0;
  const f = fixture({ rename: async (project, name) => { if (++attempts === 1) throw new Error('文件正在使用'); return { ...project, name }; } });
  const key = (node: Element, value: string) => { const event = new Event('keydown', { cancelable: true }); Object.assign(event, { key: value }); node.dispatchEvent(event); };
  try {
    f.menu.open(); await settle(); f.button('第一首').dispatchEvent(new Event('contextmenu')); f.button('改名').dispatchEvent(new Event('click'));
    const field = named(f.root, 'project-library-name'); Object.assign(field, { value: '  ' }); key(field, 'Enter'); await settle(); assert.equal(attempts, 0);
    assert(visible(f.root).some(node => node.textContent === '名称不能为空。'));
    Object.assign(field, { value: '保留输入' }); key(field, 'Enter'); await settle(); assert.equal(attempts, 1);
    assert(visible(f.root).some(node => node.textContent === '文件正在使用')); assert.equal((field as unknown as { value: string }).value, '保留输入');
    key(field, 'Enter'); await settle(); assert.equal(attempts, 2); assert(f.button('保留输入'));
    f.button('保留输入').dispatchEvent(new Event('contextmenu')); f.button('改名').dispatchEvent(new Event('click')); Object.assign(named(f.root, 'project-library-name'), { value: '取消这次输入' });
    key(named(f.root, 'project-library-name'), 'Escape'); assert(f.button('保留输入')); assert.equal(attempts, 2);
  } finally { f.cleanup(); }
});

test('pending rename blocks duplicate saves and navigation; a disposed completion cannot change a new page', async () => {
  let finish!: (value: { id: string; name: string; path: string }) => void; let writes = 0;
  const f = fixture({ rename: () => { writes++; return new Promise(resolve => { finish = resolve; }); } });
  try {
    f.menu.open(); await settle(); f.button('第一首').dispatchEvent(new Event('contextmenu')); f.button('改名').dispatchEvent(new Event('click'));
    const field = named(f.root, 'project-library-name'); Object.assign(field, { value: '稍后完成' });
    field.dispatchEvent(new Event('blur')); field.dispatchEvent(new Event('blur')); assert.equal(writes, 1);
    assert.equal(field.disabled, true); f.button('关闭乐曲库').dispatchEvent(new Event('click')); assert.equal(f.trigger.attributes.get('aria-expanded'), 'true');
    f.menu.dispose(); const replacement = new Element('new-page'); f.root.replaceChildren(replacement);
    finish({ id: 'one', name: '稍后完成', path: 'D:/RootSound/project/第一首.rootsound' }); await settle(); assert.deepEqual(f.root.children, [replacement]);
  } finally { f.cleanup(); }
});

test('single-click opens synchronously and a following double-click cannot rename or overlap the open', async () => {
  const calls: unknown[] = []; let finish!: () => void;
  const f = fixture({ open: path => { calls.push(path); return new Promise<void>(resolve => { finish = resolve; }); }, rename: async (project, name) => ({ ...project, name }) });
  try {
    f.menu.open(); await settle(); const tile = f.button('第一首'); tile.dispatchEvent(new Event('click'));
    assert.deepEqual(calls, ['D:/RootSound/project/第一首.rootsound']);
    tile.dispatchEvent(Object.assign(new Event('click'), { detail: 2 })); tile.dispatchEvent(new Event('dblclick'));
    assert.equal(calls.length, 1); assert(!flatten(f.root).some(item => item.className === 'project-library-name'));
    finish(); await settle(); assert.equal(calls.length, 1);
  } finally { f.cleanup(); }
});

test('dragging a song to the icon-only trash warns before permanent deletion and Cancel preserves it', async () => {
  const removed: unknown[] = [];
  const f = fixture({ remove: async project => { removed.push(project); } });
  try {
    f.menu.open(); await settle(); const source = f.button('第一首'); const data = transfer();
    assert.equal(named(f.root, 'project-library-trash').hidden, true);
    dragEvent(source, 'dragstart', data);
    const trash = named(f.root, 'project-library-trash'); assert.equal(trash.hidden, false);
    assert.equal(trash.textContent, ''); assert.equal(trash.title, ''); assert.deepEqual(trash.children.map(child => child.tagName), ['svg']);
    assert.equal(data.effectAllowed, 'move'); assert(dragEvent(trash, 'dragover', data).defaultPrevented);
    dragEvent(trash, 'drop', data); assert.equal(trash.hidden, true);
    assert(visible(f.root).some(node => node.attributes.get('role') === 'alertdialog'));
    assert(visible(f.root).some(node => node.textContent.includes('无法撤销')));
    assert.deepEqual(removed, []); source.dispatchEvent(new Event('click')); assert.deepEqual(f.opened, []);
    f.button('取消删除乐曲').dispatchEvent(new Event('click'));
    assert.equal(named(f.root, 'project-delete-overlay').hidden, true); assert.deepEqual(removed, []);
    assert(visible(f.root).some(node => node.textContent === '第一首'));
  } finally { f.cleanup(); }
});

test('confirmed library deletion passes the listed identity exactly once and refreshes without entering another song', async () => {
  const project = { id: 'one', name: '第一首', path: 'D:/RootSound/project/第一首.rootsound' };
  let projects = [project]; const removed: unknown[] = []; let finish!: () => void; let lists = 0;
  const f = fixture({ list: async () => { lists++; return projects; }, remove: target => {
    removed.push(target); return new Promise(resolve => { finish = () => { projects = []; resolve(); }; });
  } });
  try {
    f.menu.open(); await settle(); const data = transfer(); dragEvent(f.button('第一首'), 'dragstart', data);
    dragEvent(named(f.root, 'project-library-trash'), 'drop', data);
    f.button('确认彻底删除乐曲').dispatchEvent(new Event('click'));
    f.button('确认彻底删除乐曲').dispatchEvent(new Event('click'));
    f.button('取消删除乐曲').dispatchEvent(new Event('click')); f.button('关闭乐曲库').dispatchEvent(new Event('click'));
    assert.deepEqual(removed, [project]); assert.equal(f.button('确认彻底删除乐曲').disabled, true);
    assert.equal(f.trigger.attributes.get('aria-expanded'), 'true');
    finish(); await settle(); assert.equal(lists, 2);
    assert.deepEqual(visible(f.root).filter(node => node.className.includes('project-library-tile')).map(node => node.textContent), []);
    assert.equal(named(f.root, 'project-delete-overlay').hidden, true); assert.deepEqual(f.opened, []);
  } finally { f.cleanup(); }
});

test('failed deletion keeps its warning and song available for retry', async () => {
  let attempts = 0;
  const f = fixture({ remove: async () => { attempts++; if (attempts === 1) throw new Error('项目仍被占用'); } });
  try {
    f.menu.open(); await settle(); const data = transfer(); dragEvent(f.button('第一首'), 'dragstart', data);
    dragEvent(named(f.root, 'project-library-trash'), 'drop', data);
    f.button('确认彻底删除乐曲').dispatchEvent(new Event('click')); await settle();
    assert.equal(named(f.root, 'project-delete-overlay').hidden, false);
    assert(visible(f.root).some(node => node.textContent === '项目仍被占用')); assert.equal(f.button('确认彻底删除乐曲').disabled, false);
    f.button('确认彻底删除乐曲').dispatchEvent(new Event('click')); await settle(); assert.equal(attempts, 2);
    assert.equal(named(f.root, 'project-delete-overlay').hidden, true);
  } finally { f.cleanup(); }
});

test('cancelled or forged song drags never request deletion, and Escape first cancels the warning', async () => {
  let removals = 0;
  const f = fixture({ remove: async () => { removals++; } });
  try {
    f.menu.open(); await settle(); const data = transfer(); const trash = named(f.root, 'project-library-trash');
    dragEvent(f.button('第一首'), 'dragstart', data); dragEvent(f.button('第一首'), 'dragend', data);
    assert.equal(trash.hidden, true); dragEvent(trash, 'drop', data);
    assert.equal(named(f.root, 'project-delete-overlay').hidden, true);
    dragEvent(f.button('第一首'), 'dragstart', data); data.setData('application/x-rootsound-project', JSON.stringify({ id: 'different', path: 'D:/elsewhere.rootsound' }));
    dragEvent(trash, 'drop', data); assert.equal(named(f.root, 'project-delete-overlay').hidden, true);
    dragEvent(f.button('第一首'), 'dragstart', data); dragEvent(trash, 'drop', data);
    const escape = new Event('keydown', { cancelable: true }); Object.assign(escape, { key: 'Escape' }); f.document.dispatchEvent(escape);
    assert.equal(named(f.root, 'project-delete-overlay').hidden, true); assert.equal(f.trigger.attributes.get('aria-expanded'), 'true');
    assert.equal(removals, 0);
  } finally { f.cleanup(); }
});

test('application lists without entering and passes selected paths and current title through save or exit', async () => {
  const projects = [{ id: 'one', name: '旧名', path: 'D:/RootSound/project/旧目录' }];
  const operations: unknown[][] = []; let title = '新名称';
  const setup = createProjectSetup({
    read: async () => ({ defaultLocation: 'D:/RootSound/project' }),
    list: async () => projects, chooseLocation: async () => ({ status: 'cancelled' }),
    create: async () => { throw new Error('unused'); },
    open: async path => { operations.push(['open', path]); return { status: 'opened', project: projects[0]! }; },
    save: async name => { operations.push(['save', name]); return projects[0]!; },
    exit: async (mode, name) => { operations.push(['exit', mode, name]); },
  }, () => { operations.push(['enter']); }, { read: () => '', songDraftId: () => '', name: () => title });
  assert.deepEqual(await setup.list!(), projects); assert.deepEqual(operations, []);
  await setup.open(projects[0]!.path); await setup.save!(); title = '修改后的名字'; await setup.exit!('save');
  assert.deepEqual(operations, [['open', projects[0]!.path], ['enter'], ['save', '新名称'], ['exit', 'save', '修改后的名字'], ['enter']]);
});
