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
  constructor(tag = 'div') { super(); this.tagName = tag; }
  append(...elements: Element[]) { for (const element of elements) { element.parent = this; this.children.push(element); } }
  replaceChildren(...elements: Element[]) { this.children = []; this.append(...elements); }
  remove() { if (this.parent) this.parent.children = this.parent.children.filter(element => element !== this); }
  setAttribute(key: string, value: string) { this.attributes.set(key, value); }
  contains(other: Element): boolean { return other === this || this.children.some(element => element.contains(other)); }
  replaceWith(other: Element) { if (this.parent) { const parent = this.parent; parent.children[parent.children.indexOf(this)] = other; other.parent = parent; this.parent = undefined; } }
  focus() { (document as unknown as { activeElement: Element }).activeElement = this; }
}
const flatten = (root: Element): Element[] => [root, ...root.children.flatMap(flatten)];
const visible = (root: Element): Element[] => root.hidden ? [] : [root, ...root.children.flatMap(visible)];
const settle = async () => { for (let index = 0; index < 8; index++) await Promise.resolve(); };
function fixture(overrides: Partial<ProjectSetupPort> = {}, doubleClickIntervalMs?: number) {
  const old = Object.getOwnPropertyDescriptor(globalThis, 'document'); const document = new Element('document');
  Object.assign(document, { createElement: (tag: string) => new Element(tag), createElementNS: (_: string, tag: string) => new Element(tag) });
  Object.defineProperty(globalThis, 'document', { configurable: true, value: document });
  const root = new Element('root'); const trigger = new Element('button'); root.append(trigger);
  const opened: Array<string | undefined> = []; let created = 0;
  const service: ProjectSetupPort = { defaultLocation: async () => 'D:/RootSound/project', chooseLocation: async () => ({ status: 'cancelled' }), create: async () => {},
    list: async () => [{ id: 'one', name: '第一首', path: 'D:/RootSound/project/第一首.rootsound' }], open: async path => { opened.push(path); }, ...overrides };
  const menu = mountProjectLibrary(root as unknown as HTMLElement, trigger as unknown as HTMLButtonElement, service, () => { created++; }, doubleClickIntervalMs);
  return { root, trigger, menu, service, opened, get created() { return created; }, document,
    button(label: string) { const button = flatten(root).find(element => element.tagName === 'button' && element.attributes.get('aria-label') === label); assert(button); return button; },
    cleanup() { menu.dispose(); if (old) Object.defineProperty(globalThis, 'document', old); else Reflect.deleteProperty(globalThis, 'document'); } };
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
test('song library discovers default files with new first, song tiles in between and file picker last', async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const f = fixture(); try {
    f.menu.open(); await settle();
    assert.deepEqual(f.opened, []);
    const labels = visible(f.root).filter(element => element.tagName === 'button').map(element => element.textContent);
    assert.deepEqual(labels, ['', '×', '+', '第一首', '📁']);
    assert(flatten(f.root).some(element => element.attributes.get('role') === 'dialog' && element.attributes.get('aria-label') === '乐曲库'));
    f.button('第一首').dispatchEvent(new Event('click')); t.mock.timers.tick(600); await settle();
    assert.deepEqual(f.opened, ['D:/RootSound/project/第一首.rootsound']);
    f.button('选择歌曲项目文件').dispatchEvent(new Event('click')); await settle();
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
    f.button('选择歌曲项目文件').dispatchEvent(new Event('click')); await settle();
    assert(flatten(f.root).some(element => element.textContent === '工程已移走'));
    f.button('选择歌曲项目文件').dispatchEvent(new Event('click')); await settle(); assert.equal(attempts, 2);
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
    f.button('选择歌曲项目文件').dispatchEvent(new Event('click')); f.menu.open(); assert.equal(opens, 1);
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
    assert.deepEqual(flatten(f.root).filter(node => node.className.includes('project-library-tile')).map(node => node.textContent), ['+', '📁']);
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

test('two clicks followed by double-click edit a song name without opening it, and Enter persists the listed identity', async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] }); const renamed: unknown[][] = [];
  const f = fixture({ rename: async (project, name) => { renamed.push([project, name]); return { ...project, name }; } });
  try {
    f.menu.open(); await settle(); const tile = f.button('第一首');
    tile.dispatchEvent(new Event('click')); t.mock.timers.tick(450); tile.dispatchEvent(new Event('click'));
    tile.dispatchEvent(new Event('dblclick', { cancelable: true })); t.mock.timers.tick(500); await settle();
    assert.deepEqual(f.opened, []); const input = named(f.root, 'project-library-name'); assert.equal(input.tagName, 'input');
    Object.assign(input, { value: '新的曲名' }); const enter = new Event('keydown', { cancelable: true }); Object.assign(enter, { key: 'Enter' }); input.dispatchEvent(enter); await settle();
    assert.deepEqual(renamed, [[{ id: 'one', name: '第一首', path: 'D:/RootSound/project/第一首.rootsound' }, '新的曲名']]);
    assert(f.button('新的曲名')); assert.deepEqual(f.opened, []);
  } finally { f.cleanup(); }
});

test('song inline rename rejects empty names, Escape cancels, and failures retain text for retry', async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] }); let attempts = 0;
  const f = fixture({ rename: async (project, name) => { if (++attempts === 1) throw new Error('文件正在使用'); return { ...project, name }; } });
  const key = (node: Element, value: string) => { const event = new Event('keydown', { cancelable: true }); Object.assign(event, { key: value }); node.dispatchEvent(event); };
  try {
    f.menu.open(); await settle(); f.button('第一首').dispatchEvent(new Event('dblclick'));
    const field = named(f.root, 'project-library-name'); Object.assign(field, { value: '  ' }); key(field, 'Enter'); await settle(); assert.equal(attempts, 0);
    assert(visible(f.root).some(node => node.textContent === '名称不能为空。'));
    Object.assign(field, { value: '保留输入' }); key(field, 'Enter'); await settle(); assert.equal(attempts, 1);
    assert(visible(f.root).some(node => node.textContent === '文件正在使用')); assert.equal((field as unknown as { value: string }).value, '保留输入');
    key(field, 'Enter'); await settle(); assert.equal(attempts, 2); assert(f.button('保留输入'));
    f.button('保留输入').dispatchEvent(new Event('dblclick')); Object.assign(named(f.root, 'project-library-name'), { value: '取消这次输入' });
    key(named(f.root, 'project-library-name'), 'Escape'); assert(f.button('保留输入')); assert.equal(attempts, 2);
  } finally { f.cleanup(); }
});

test('pending rename blocks duplicate saves and navigation; a disposed completion cannot change a new page', async () => {
  let finish!: (value: { id: string; name: string; path: string }) => void; let writes = 0;
  const f = fixture({ rename: () => { writes++; return new Promise(resolve => { finish = resolve; }); } });
  try {
    f.menu.open(); await settle(); f.button('第一首').dispatchEvent(new Event('dblclick'));
    const field = named(f.root, 'project-library-name'); Object.assign(field, { value: '稍后完成' });
    field.dispatchEvent(new Event('blur')); field.dispatchEvent(new Event('blur')); assert.equal(writes, 1);
    assert.equal(field.disabled, true); f.button('关闭乐曲库').dispatchEvent(new Event('click')); assert.equal(f.trigger.attributes.get('aria-expanded'), 'true');
    f.menu.dispose(); const replacement = new Element('new-page'); f.root.replaceChildren(replacement);
    finish({ id: 'one', name: '稍后完成', path: 'D:/RootSound/project/第一首.rootsound' }); await settle(); assert.deepEqual(f.root.children, [replacement]);
  } finally { f.cleanup(); }
});

test('a slower configured double-click interval is respected before a song opens', async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const f = fixture({ rename: async (project, name) => ({ ...project, name }) }, 900);
  try {
    f.menu.open(); await settle(); f.button('第一首').dispatchEvent(new Event('click'));
    t.mock.timers.tick(880); assert.deepEqual(f.opened, []);
    f.button('第一首').dispatchEvent(new Event('dblclick')); t.mock.timers.tick(1000); assert.deepEqual(f.opened, []);
    assert.equal(named(f.root, 'project-library-name').tagName, 'input');
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
    assert.deepEqual(visible(f.root).filter(node => node.className.includes('project-library-tile')).map(node => node.textContent), ['+', '📁']);
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
