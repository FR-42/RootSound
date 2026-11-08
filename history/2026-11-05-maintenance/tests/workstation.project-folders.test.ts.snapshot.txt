import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import test from 'node:test';
import { createDesktopProjectDirectories } from '../src/workstation/app/platform/project-directories.ts';
import { createMidiProjectLibrary } from '../src/workstation/app/midi-project.ts';
import type { ProjectLibraryPage } from '../src/workstation/contracts/project-directory.ts';

const raw = (value: unknown) => Promise.resolve(JSON.stringify(value));
const root = 'D:/RootSound/project';
const song = { kind: 'project' as const, id: 'song-id', name: '歌曲', path: root + '/my music/歌曲.rootsound' };
const midi = { kind: 'midi' as const, name: '参考', path: root + '/my music/参考.mid' };
const page: ProjectLibraryPage = { root, path: root + '/my music', parent: root, entries: [song, midi] };

test('folder page validates immediate children and preserves MIDI entries', async () => {
  let response: unknown = { status: 'browsed', page };
  const port = createDesktopProjectDirectories({ Read: () => raw({}), Open: () => raw({}), ChooseLocation: () => raw({}),
    Create: () => raw({}), Browse: path => { assert.equal(path, page.path); return raw(response); } });
  assert.deepEqual(await port.browse!(page.path), page);
  for (const invalid of [{ ...page, path: 'D:/elsewhere' }, { ...page, parent: root + '/other' },
    { ...page, entries: [song, song] }, { ...page, entries: [{ ...midi, path: root + '/elsewhere/参考.mid' }] },
    { ...page, entries: [{ ...song, id: '' }] }]) {
    response = { status: 'browsed', page: invalid }; await assert.rejects(port.browse!(page.path), /无效/);
  }
});

test('known MIDI opens through the same validated source-byte path as the picker', async () => {
  const bytes = midiFile(); let selected = '';
  const port = createDesktopProjectDirectories({ Read: () => raw({}), Open: () => raw({}), ChooseLocation: () => raw({}),
    Create: () => raw({}), OpenKnown: path => { selected = path; return raw({ status: 'midi', name: '参考.mid', base64: Buffer.from(bytes).toString('base64') }); } });
  const result = await port.open(midi.path); assert.equal(selected, midi.path); assert.equal(result.status, 'midi');
  if (result.status === 'midi') assert.deepEqual(result.bytes, bytes);
});

function midiFile() {
  const track = (delay: number) => {
    const bytes = [...(delay ? [0x83, 0x60] : [0]), 0x90, 60, 96, 0x83, 0x60, 0x80, 60, 0, 0, 255, 47, 0];
    return [...Buffer.from('MTrk'), 0, 0, 0, bytes.length, ...bytes];
  };
  return Uint8Array.from([...Buffer.from('MThd'), 0, 0, 0, 6, 0, 1, 0, 2, 1, 0xe0, ...track(480), ...track(0)]);
}

test('identical piano notes in reversed track order preserve both original timestamps', () => {
  const bytes = midiFile(), before = new Uint8Array(bytes);
  const result = createMidiProjectLibrary(bytes, '交错声部');
  assert.equal(result.noteCount, 2); assert.equal(result.trackCount, 2); assert.deepEqual(bytes, before);
  const library = JSON.parse(result.libraryText);
  const notes = library.contents.filter((item: { kind: string }) => item.kind === 'rootsound.phrase')
    .flatMap((item: { body: { parts: { notes: { startBeat: number }[] }[] } }) => item.body.parts.flatMap(part => part.notes));
  assert.equal(notes.length, 2);
});

const hook = registerHooks({ load(url, context, next) {
  return url.endsWith('.css') ? { format: 'module', source: '', shortCircuit: true } : next(url, context);
} });
const { mountProjectLibrary } = await import('../src/workstation/modules/ui-rendering/project-library.ts'); hook.deregister();
class Element extends EventTarget {
  tagName: string; children: Element[] = []; parent?: Element; textContent = ''; className = ''; hidden = false; disabled = false;
  title = ''; type = ''; value = ''; draggable = false; attributes = new Map<string, string>();
  constructor(tag: string) { super(); this.tagName = tag; }
  append(...items: Element[]) { for (const item of items) { item.parent = this; this.children.push(item); } }
  replaceChildren(...items: Element[]) { this.children = []; this.append(...items); }
  remove() { if (this.parent) this.parent.children = this.parent.children.filter(item => item !== this); }
  setAttribute(key: string, value: string) { this.attributes.set(key, value); }
  focus() {}
}
const all = (element: Element): Element[] => [element, ...element.children.flatMap(all)];
const settle = async () => { for (let i = 0; i < 12; i++) await Promise.resolve(); };
test('library navigates folders, keeps the current folder on reopen, and opens only clicked files', async () => {
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'document');
  const dom = new Element('document'); Object.assign(dom, { createElement: (tag: string) => new Element(tag), createElementNS: (_: string, tag: string) => new Element(tag) });
  Object.defineProperty(globalThis, 'document', { configurable: true, value: dom });
  const container = new Element('main'), trigger = new Element('button'), opened: (string | undefined)[] = [], browsed: (string | undefined)[] = [];
  const mounted = mountProjectLibrary(container as unknown as HTMLElement, trigger as unknown as HTMLButtonElement, {
    list: async () => { throw new Error('Must not recursively list.'); }, open: async path => { opened.push(path); },
    browse: async path => { browsed.push(path); return path === page.path ? page : { root, path: root, entries: [{ kind: 'folder', name: 'my music', path: page.path }] }; },
  }, () => {});
  const button = (label: string) => {
    const found = all(container).find(item => item.tagName === 'button' && item.attributes.get('aria-label') === label);
    assert(found, label); return found;
  };
  try {
    mounted.open(); await settle(); assert(!all(container).some(item => item.textContent === song.name));
    button('打开文件夹 my music').dispatchEvent(new Event('click')); await settle();
    assert(all(container).some(item => item.textContent === song.name)); assert.deepEqual(opened, []);
    button('打开 参考').dispatchEvent(new Event('click')); await settle(); assert.deepEqual(opened, [midi.path]);
    button('关闭乐曲库').dispatchEvent(new Event('click')); mounted.open(); await settle(); assert.equal(browsed.at(-1), page.path);
    button('返回上级文件夹').dispatchEvent(new Event('click')); await settle(); assert.equal(browsed.at(-1), root);
    assert(!all(container).some(item => item.textContent === song.name));
  } finally { mounted.dispose(); if (previous) Object.defineProperty(globalThis, 'document', previous); else Reflect.deleteProperty(globalThis, 'document'); }
});
