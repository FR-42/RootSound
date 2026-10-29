import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import { test } from 'node:test';
import type { ProjectSetupPort } from '../src/workstation/contracts/project-directory.ts';
import type { TimbreEditorPort } from '../src/workstation/contracts/timbre.ts';
import type { SoundRuntimePort } from '../src/workstation/contracts/sound.ts';
import { createProjectSetup } from '../src/workstation/app/project-setup.ts';
import { createDesktopProjectDirectories } from '../src/workstation/app/platform/project-directories.ts';
import type { MidiImportNotice } from '../src/workstation/contracts/project-directory.ts';

const hook = registerHooks({ load(url, context, next) {
  return url.endsWith('.css') ? { format: 'module', source: '', shortCircuit: true } : next(url, context);
} });
const { mountStudio, showMidiImportNotice } = await import('../src/workstation/modules/ui-rendering/public.ts'); hook.deregister();

/** A small event DOM exercises application navigation without observing or controlling Windows. */
class Element extends EventTarget {
  tagName: string; children: Element[] = []; parent?: Element;
  className = ''; textContent = ''; hidden = false; disabled = false; value = ''; name = ''; type = ''; title = '';
  attributes = new Map<string, string>();
  constructor(tag: string) { super(); this.tagName = tag; }
  append(...children: Element[]) {
    for (const child of children) { child.remove(); child.parent = this; this.children.push(child); }
  }
  replaceChildren(...children: Element[]) {
    this.children.forEach(child => { child.parent = undefined; }); this.children = []; this.append(...children);
  }
  remove() { if (this.parent) this.parent.children = this.parent.children.filter(child => child !== this); this.parent = undefined; }
  setAttribute(name: string, value: string) { this.attributes.set(name, value); }
  contains(other: Element): boolean { return other === this || this.children.some(child => child.contains(other)); }
  replaceWith(other: Element) { if (this.parent) { const parent = this.parent; parent.children[parent.children.indexOf(this)] = other; other.parent = parent; this.parent = undefined; } }
  focus() { (document as unknown as { activeElement?: Element }).activeElement = this; }
}
const all = (root: Element): Element[] => [root, ...root.children.flatMap(all)];
const visible = (root: Element): Element[] => root.hidden ? [] : [root, ...root.children.flatMap(visible)];
const settle = async () => { for (let index = 0; index < 12; index++) await Promise.resolve(); };
const fire = (node: Element, type = 'click') => node.dispatchEvent(new Event(type, { cancelable: true }));

function fixture(overrides: Partial<ProjectSetupPort> = {}) {
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'document'); const dom = new Element('document');
  Object.assign(dom, { createElement: (tag: string) => new Element(tag), createElementNS: (_: string, tag: string) => new Element(tag) });
  Object.defineProperty(globalThis, 'document', { configurable: true, value: dom });
  const root = new Element('root'); let reads = 0; let stops = 0;
  const opened: Array<string | undefined> = []; const created: Array<[string, string]> = [];
  const setup: ProjectSetupPort = {
    defaultLocation: async () => 'D:/RootSound/project', chooseLocation: async () => ({ status: 'cancelled' }),
    list: async () => { reads++; return [{ id: 'first', name: '我的第一首歌', path: 'D:/RootSound/project/我的第一首歌.rootsound' }]; },
    open: async path => { opened.push(path); }, create: async (name, path) => { created.push([name, path]); }, ...overrides,
  };
  const timbre = { read() { throw new Error('Welcome must not enter a musical editor.'); } } as unknown as TimbreEditorPort;
  const sound = { stopAll() { stops++; } } as unknown as SoundRuntimePort;
  const mounted = mountStudio(root as unknown as HTMLElement, { timbre, sound, hasPrevious: true, initialEntry: 'welcome', projectSetup: setup });
  const find = (predicate: (node: Element) => boolean) => { const result = all(root).find(predicate); assert(result, 'Expected an application control.'); return result; };
  return { root, dom, opened, created, get reads() { return reads; }, get stops() { return stops; },
    button: (label: string) => find(node => node.tagName === 'button' && (node.textContent === label || node.attributes.get('aria-label') === label)),
    field: (name: string) => find(node => node.tagName === 'input' && node.name === name),
    submit() { fire(find(node => node.tagName === 'form'), 'submit'); },
    cleanup() { mounted.dispose(); if (previous) Object.defineProperty(globalThis, 'document', previous); else Reflect.deleteProperty(globalThis, 'document'); } };
}

test('mountStudio welcome exposes only brand, invitation and Start, then a discovered song library', async () => {
  const f = fixture(); try {
    assert.deepEqual(visible(f.root).filter(node => node.textContent).map(node => node.textContent), ['RootSound', '你好，你想创作什么？', '开始']);
    assert.deepEqual(visible(f.root).filter(node => node.tagName === 'button').map(node => node.textContent), ['开始']);
    assert.equal(f.reads, 0, 'starting the software does not open a picker or fetch the library'); assert.deepEqual(f.opened, []);
    fire(f.button('开始')); await settle();
    assert.equal(f.reads, 1); assert.deepEqual(f.opened, []);
    assert(visible(f.root).some(node => node.attributes.get('aria-label') === '乐曲库' && node.attributes.get('role') === 'dialog'));
    assert.deepEqual(visible(f.root).filter(node => node.className.includes('project-library-tile')).map(node => node.textContent), ['+', '我的第一首歌', '📁']);
    fire(f.button('关闭乐曲库'));
    assert.deepEqual(visible(f.root).filter(node => node.textContent).map(node => node.textContent), ['RootSound', '你好，你想创作什么？', '开始']);
  } finally { f.cleanup(); }
});

test('new-song tile opens the existing naming flow, Back returns to minimal welcome and creation uses the default parent', async () => {
  const f = fixture(); try {
    fire(f.button('开始')); await settle(); fire(f.button('新的开始')); await settle();
    assert(visible(f.root).some(node => node.textContent === 'RootSound'));
    assert(visible(f.root).some(node => node.textContent === '为新歌曲起一个名字把~'));
    assert.equal(all(f.root).some(node => node.className === 'project-library-overlay'), false, 'navigation disposes the previous modal');
    assert.deepEqual(f.created, []); assert.deepEqual(f.opened, []);
    fire(f.button('返回'));
    assert.deepEqual(visible(f.root).filter(node => node.textContent).map(node => node.textContent), ['RootSound', '你好，你想创作什么？', '开始']);
    fire(f.button('开始')); await settle(); assert.equal(f.reads, 2);
    fire(f.button('新的开始')); await settle();
    f.field('name').value = '第一段旅程'; fire(f.field('name'), 'input'); f.submit(); await settle();
    assert.deepEqual(f.created, [['第一段旅程', 'D:/RootSound/project']]);
    assert.equal(f.button('创建！').disabled, true, 'successful creation waits for application reopening rather than duplicating the song');
  } finally { f.cleanup(); }
});

test('known song tiles use their exact file and only the folder tile requests a custom file picker', async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const f = fixture(); try {
    fire(f.button('开始')); await settle();
    fire(f.button('我的第一首歌')); t.mock.timers.tick(600); await settle();
    assert.deepEqual(f.opened, ['D:/RootSound/project/我的第一首歌.rootsound']);
    fire(f.button('选择歌曲项目文件')); await settle();
    assert.deepEqual(f.opened, ['D:/RootSound/project/我的第一首歌.rootsound', undefined]);
    assert(visible(f.root).some(node => node.attributes.get('aria-label') === '乐曲库'), 'a cancelled file picker keeps the modal usable');
  } finally { f.cleanup(); }
});

test('a late song catalog cannot overwrite the naming page after choosing new during loading', async () => {
  let finish!: (value: []) => void;
  const f = fixture({ list: () => new Promise(resolve => { finish = resolve; }) });
  try {
    fire(f.button('开始')); fire(f.button('新的开始')); await settle();
    f.field('name').value = '保留这个名字'; fire(f.field('name'), 'input');
    finish([]); await settle();
    assert.equal(f.field('name').value, '保留这个名字');
    assert.equal(all(f.root).some(node => node.className === 'project-library-overlay'), false);
    assert.deepEqual(f.opened, []); assert.deepEqual(f.created, []);
  } finally { f.cleanup(); }
});

test('the welcome folder tile follows the real MIDI bridge, conversion and new-project path', async () => {
  const bytes=Uint8Array.from([77,84,104,100,0,0,0,6,0,0,0,1,1,224,
    77,84,114,107,0,0,0,13,0,144,60,100,131,96,128,60,0,0,255,47,0]);
  const writes:Array<{name:string;location:string;text:string}>=[], notices:MidiImportNotice[]=[];let selected=0;
  const raw=(value:unknown)=>Promise.resolve(JSON.stringify(value));
  const directories=createDesktopProjectDirectories({
    Read:()=>raw({status:'ready',defaultLocation:'D:/RootSound/project'}),ChooseLocation:()=>raw({status:'cancelled'}),
    List:()=>raw({status:'listed',projects:[]}),
    Open:()=>{selected++;return raw({status:'midi',name:'文件夹导入.midi',base64:Buffer.from(bytes).toString('base64')});},
    Create:(name,location,text)=>{writes.push({name,location,text});return raw({status:'created',project:{id:'imported',name,path:`${location}/${name}.rootsound`}});},
  });
  const setup=createProjectSetup(directories,notice=>{if(notice)notices.push(notice);});
  const f=fixture(setup);
  try {
    fire(f.button('开始'));await settle();assert.equal(selected,0);
    fire(f.button('选择歌曲项目文件'));await settle();await settle();
    assert.equal(selected,1);assert.equal(writes.length,1);assert.equal(writes[0]!.name,'文件夹导入');
    assert.equal(writes[0]!.location,'D:/RootSound/project');assert.match(writes[0]!.text,/rootsound.song/);
    assert.equal(notices.length,1);assert.equal(notices[0]!.noteCount,1);
  } finally {f.cleanup();}
});

test('MIDI completion details stay collapsed and render warning text safely without disturbing the workspace', () => {
  const f=fixture();
  try {
    const panel=showMidiImportNotice(f.root as unknown as HTMLElement,{projectId:'p',name:'song',trackCount:2,noteCount:99,warnings:['<script>source text</script>']});
    const nodes=all(f.root);assert(nodes.some(node=>node.textContent==='2 个声部 · 99 个音符'));
    assert(nodes.some(node=>node.tagName==='li'&&node.textContent==='<script>source text</script>'));
    assert.equal(nodes.some(node=>node.tagName==='script'),false);
    const details=nodes.find(node=>node.tagName==='details');assert(details);assert.equal(details.attributes.has('open'),false);
    fire(f.button('关闭导入提示'));assert.equal(all(f.root).some(node=>node.className==='midi-import-notice'),false);
    assert(visible(f.root).some(node=>node.textContent==='开始'));panel.dispose();
  } finally {f.cleanup();}
});
