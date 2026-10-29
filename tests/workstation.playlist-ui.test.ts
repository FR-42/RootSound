import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import { test } from 'node:test';
import type { SoundRuntimePort, SoundSequencePlan } from '../src/workstation/contracts/sound.ts';
import { createMaterialLibrary } from '../src/workstation/modules/materials/public.ts';
import { createTimbreEditor, createTimbrePlayback } from '../src/workstation/modules/timbre/public.ts';
import { createPhraseEditor, createPhrasePlayback } from '../src/workstation/modules/phrase/public.ts';
import { createSongEditor } from '../src/workstation/modules/song/public.ts';
import { createProjectPhrase } from '../src/workstation/app/project-phrases.ts';
import { PLAYLIST_COLORS, playlistColorInk, playlistPhraseColor } from '../src/workstation/modules/ui-rendering/playlist-colors.ts';

const hooks = registerHooks({ load(url, context, nextLoad) {
  if (url.endsWith('.css')) return { format: 'module', source: '', shortCircuit: true };
  return nextLoad(url, context);
} });
const { mountSongWorkspace } = await import('../src/workstation/modules/ui-rendering/song-workspace.ts'); hooks.deregister();

type FakeEvent = Record<string, unknown> & { type: string; target: FakeElement; preventDefault(): void; stopPropagation(): void };
class FakeElement {
  tagName: string; className = ''; textContent = ''; style: Record<string, string> = {}; dataset: Record<string, string> = {};
  parentElement?: FakeElement; children: FakeElement[] = []; attributes = new Map<string, string>();
  value = ''; hidden = false; disabled = false; isContentEditable = false; tabIndex = 0;
  scrollWidth = 1000; scrollLeft = 0;
  clientWidth = 1000; clientHeight = 700; private listeners = new Map<string, Array<(event: FakeEvent) => void>>();
  private captured = new Set<number>();
  animations: Array<Array<{transform:string}>> = [];
  animate(keyframes: Array<{transform:string}>): void { this.animations.push(keyframes); }
  constructor(tag = 'div') { this.tagName = tag.toUpperCase(); }
  classList = {
    add: (...names: string[]) => { this.className = [...new Set([...this.className.split(' ').filter(Boolean), ...names])].join(' '); },
    remove: (...names: string[]) => { this.className = this.className.split(' ').filter(name => !names.includes(name)).join(' '); },
    contains: (name: string) => this.className.split(' ').includes(name),
    toggle: (name: string, force?: boolean) => { const on = force ?? !this.classList.contains(name); if (on) this.classList.add(name); else this.classList.remove(name); return on; },
  };
  append(...nodes: FakeElement[]): void { for (const child of nodes) { child.remove(); child.parentElement = this; this.children.push(child); } }
  replaceChildren(...nodes: FakeElement[]): void { for (const child of this.children) child.parentElement = undefined; this.children = []; this.append(...nodes); }
  remove(): void { if (this.parentElement) this.parentElement.children = this.parentElement.children.filter(child => child !== this); this.parentElement = undefined; }
  setAttribute(key: string, value: string): void { this.attributes.set(key, value); }
  showModal(): void { this.attributes.set('open', ''); }
  close(): void { this.attributes.delete('open'); this.emit('close'); }
  matches(selector: string): boolean {
    if (selector.startsWith('.')) return this.classList.contains(selector.slice(1));
    const match = /^([a-z][a-z0-9]*)(?:\[([^\]]+)\])?$/u.exec(selector);
    return !!match && this.tagName.toLowerCase() === match[1] && (!match[2] || this.attributes.has(match[2]));
  }
  closest<T = FakeElement>(selector: string): T | undefined { let element: FakeElement | undefined = this; while (element) { if (element.matches(selector)) return element as T; element = element.parentElement; } }
  querySelectorAll<T = FakeElement>(selector: string): T[] { return this.children.flatMap(child => [...(child.matches(selector) ? [child as T] : []), ...child.querySelectorAll<T>(selector)]); }
  querySelector<T = FakeElement>(selector: string): T | undefined { return this.querySelectorAll<T>(selector)[0]; }
  contains(other: FakeElement): boolean { return other === this || this.children.some(child => child.contains(other)); }
  addEventListener(type: string, callback: (event: FakeEvent) => void): void { this.listeners.set(type, [...this.listeners.get(type) ?? [], callback]); }
  removeEventListener(type: string, callback: (event: FakeEvent) => void): void { this.listeners.set(type, (this.listeners.get(type) ?? []).filter(item => item !== callback)); }
  emit(type: string, values: Record<string, unknown> = {}): FakeEvent {
    const event = { type, target: this, pointerId: 1, button: 0, clientX: 0, clientY: 0, key: '', code: '',
      ctrlKey: false, metaKey: false, shiftKey: false, repeat: false, defaultPrevented: false, propagationStopped: false,
      preventDefault() { this.defaultPrevented = true; }, stopPropagation() { this.propagationStopped = true; }, ...values } as FakeEvent;
    for (const listener of this.listeners.get(type) ?? []) listener(event); return event;
  }
  getBoundingClientRect() {
    if (this.classList.contains('song-phrase-trash')) return { left: 860, top: 35, width: 68, height: 68 };
    if (this.classList.contains('song-row-controls')) return { left: 0, top: 28, width: this.clientWidth, height: this.clientHeight };
    if (this.classList.contains('song-phrase-card')) {
      const shift = /translateY\(([-.0-9]+)px\)/u.exec(this.style.transform ?? '');
      return { left: 0, top: (this.parentElement?.children.indexOf(this) ?? 0) * 60 + Number(shift?.[1] ?? 0), width: 120, height: 48 };
    }
    let left = 0; let top = this.classList.contains('song-timeline') ? 28 : 0;
    if (this.classList.contains('song-clip') || this.classList.contains('song-track') || this.classList.contains('song-row-control')) {
      left = Number.parseFloat(this.style.left ?? '0'); top = 28 + Number.parseFloat(this.style.top ?? '0');
      const xy = /translate\(([-.0-9]+)px, ([-.0-9]+)px\)/u.exec(this.style.transform ?? '');
      const y = /translateY\(([-.0-9]+)px\)/u.exec(this.style.transform ?? '');
      if (xy) { left += Number(xy[1]); top += Number(xy[2]); } else if (y) top += Number(y[1]);
    }
    return { left, top, width: 1000, height: this.clientHeight };
  }
  setPointerCapture(id: number): void { this.captured.add(id); }
  hasPointerCapture(id: number): boolean { return this.captured.has(id); }
  releasePointerCapture(id: number): void { this.captured.delete(id); }
  focus(): void { const document = globalThis.document as unknown as FakeDocument; if (document.activeElement !== this) document.activeElement?.blur(); document.activeElement = this; this.emit('focus'); }
  blur(): void { const document = globalThis.document as unknown as FakeDocument; if (document.activeElement === this) document.activeElement = undefined; this.emit('blur'); }
}
class FakeInput extends FakeElement {}
class FakeSelect extends FakeElement {}
class FakeTextArea extends FakeElement {}
class FakeDocument extends FakeElement {
  activeElement?: FakeElement;
  createElement(tag: string): FakeElement { return tag === 'input' ? new FakeInput(tag) : new FakeElement(tag); }
  createElementNS(_namespace: string, tag: string): FakeElement { return this.createElement(tag); }
}
function installDom() {
  const document = new FakeDocument('document'); const window = new FakeElement('window');
  const timers: ReturnType<typeof setTimeout>[] = [];
  const frames = new Map<number, FrameRequestCallback>(); let frameId = 0;
  const flushFrames = () => { const pending = [...frames.values()]; frames.clear(); for (const callback of pending) callback(0); };
  Object.assign(window, { setTimeout(callback: () => void, delay: number) { const timer = setTimeout(callback, delay); timer.unref(); timers.push(timer); return Number(timer); }, clearTimeout });
  const replacements = { document, window, HTMLElement: FakeElement, HTMLInputElement: FakeInput, HTMLSelectElement: FakeSelect,
    HTMLTextAreaElement: FakeTextArea, Node: FakeElement, requestAnimationFrame: (callback: FrameRequestCallback) => { frames.set(++frameId, callback); return frameId; }, cancelAnimationFrame(id: number) { frames.delete(id); } };
  const previous = new Map<string, PropertyDescriptor | undefined>();
  for (const [key, value] of Object.entries(replacements)) { previous.set(key, Object.getOwnPropertyDescriptor(globalThis, key)); Object.defineProperty(globalThis, key, { configurable: true, writable: true, value }); }
  return { document, flushFrames, pendingFrames: () => frames.size, restore() { timers.forEach(clearTimeout); for (const [key, descriptor] of previous) { if (descriptor) Object.defineProperty(globalThis, key, descriptor); else Reflect.deleteProperty(globalThis, key); } } };
}
function fixture(overrides: Partial<Parameters<typeof mountSongWorkspace>[1]> = {}) {
  const dom = installDom(); const library = createMaterialLibrary(); const timbre = createTimbreEditor(library);
  const voice = timbre.save('new'); assert.equal(voice.status, 'saved'); if (voice.status !== 'saved') throw new Error('voice');
  const sounds = createTimbrePlayback(library); const phrase = createPhraseEditor(library, sounds);
  phrase.create(voice.content.id); phrase.rename('第一乐句'); phrase.setTempo(120); phrase.setLength(4);
  phrase.addNote(phrase.read().body!.parts[0]!.id, { startBeat: 0, durationBeats: 1, frequencyHz: 220, velocity: .7 });
  const first = phrase.save('new'); if (first.status !== 'saved') throw new Error('phrase');
  phrase.create(voice.content.id); phrase.rename('其它歌曲的乐句'); phrase.addNote(phrase.read().body!.parts[0]!.id, { startBeat: 0, durationBeats: 1, frequencyHz: 330, velocity: .7 }); const second = phrase.save('new'); if (second.status !== 'saved') throw new Error('phrase');
  const song = createSongEditor(library, createPhrasePlayback(library, sounds), { defaultTempoMode: 'source', initialTrackCount: 7 }); song.create();
  const track = song.read().body!.tracks[0]!.id; const ids = [0, 4, 8].map(beat => song.addClip(track, first.content.id, beat));
  const otherTrack = song.read().body!.tracks[1]!.id; song.addClip(otherTrack, first.content.id, 0);
  const root = new FakeElement('main'); const sound = { subscribe: () => () => {}, stopAll() {}, stop() {}, position: () => 0 } as unknown as SoundRuntimePort;
  const retained: string[][] = []; const edited: SongClipRefLike[] = [];
  const shelf = [{ id: first.content.id, name: first.content.name, tempoBpm: 120, durationSeconds: 2 }];
  const workspace = mountSongWorkspace(root as unknown as HTMLElement, { song, sound, onSound() {}, onPhrase() {}, onWelcome() {},
    projectName: () => '当前项目', phrases: () => shelf,
    renderEntities() { throw new Error('old rail must never render'); }, onKeepPhrases(ids) { retained.push(ids); },
    onEditPhrase(ref) { edited.push(ref); }, ...overrides });
  const viewport = root.querySelector('.song-scroll')!;
  root.querySelector('.song-row-controls')!.clientWidth = 144;
  return { ...dom, root, song, library, workspace, viewport, ids, track, otherTrack, phraseId: first.content.id, retained, edited, shelf,
    cleanup() { workspace.dispose(); dom.restore(); }, block: (id: string) => root.querySelectorAll('.song-clip').find(item => item.dataset.clipId === id)! };
}
type SongClipRefLike = { trackId: string; clipId: string };

function phraseTransfer() {
  const data = new Map<string, string>();
  return { types: ['application/x-rootsound-phrase'], effectAllowed: '', dropEffect: '',
    setData(type: string, value: string) { data.set(type, value); }, getData(type: string) { return data.get(type) ?? ''; } };
}

test('arrow keys pan the song view and Ctrl arrows zoom each axis without editing music or moving the head', () => {
  const f = fixture(); try {
    const content = f.root.querySelector('.song-timeline')!; content.clientHeight = 180;
    const before = structuredClone(f.song.read().draft); const token = f.library.currentToken();
    const clock = f.root.querySelector('.song-clock')!.textContent;
    const press = (key: string, ctrlKey = false) => f.document.emit('keydown', { target: f.viewport, key, ctrlKey });
    const second = f.ids[1]!; const initialX = Number.parseFloat(f.block(second).style.left!);
    press('ArrowRight'); assert.equal(Number.parseFloat(f.block(second).style.left!), initialX - 64);
    press('ArrowLeft'); assert.equal(Number.parseFloat(f.block(second).style.left!), initialX);
    press('ArrowLeft'); assert.equal(f.block(f.ids[0]!).style.left, '0px', 'left pan clamps at song zero');
    const row = () => f.root.querySelectorAll('.song-row-control').find(control => control.dataset.trackId === f.otherTrack)!;
    press('ArrowDown'); assert.equal(row().style.top, '0px');
    press('ArrowUp'); assert.equal(row().style.top, '60px');
    const width = Number.parseFloat(f.block(second).style.width!);
    press('ArrowRight', true); assert(Math.abs(Number.parseFloat(f.block(second).style.width!) - width * 1.15) < 1e-8);
    assert(Math.abs(Number.parseFloat(f.block(second).style.left!) - (500 + (initialX - 500) * 1.15)) < 1e-8, 'horizontal zoom keeps the visible center anchored');
    press('ArrowLeft', true); assert(Math.abs(Number.parseFloat(f.block(second).style.width!) - width) < 1e-8);
    press('ArrowUp', true); assert.equal(row().style.height, '69px'); assert.equal(row().style.top, '55.5px');
    press('ArrowDown', true); assert(Math.abs(Number.parseFloat(row().style.height!) - 60) < 1e-8);
    assert.deepEqual(f.song.read().draft, before); assert.equal(f.library.currentToken(), token);
    assert.equal(f.root.querySelector('.song-clock')!.textContent, clock);
  } finally { f.cleanup(); }
});

test('song arrow navigation leaves inputs, composition, unrelated modifiers and open dialogs alone', () => {
  const f = fixture(); try {
    const before = f.block(f.ids[1]!).style.left;
    for (const target of [new FakeInput('input'), new FakeSelect('select'), new FakeTextArea('textarea'), Object.assign(new FakeElement(), { isContentEditable: true })]) {
      f.document.emit('keydown', { target, key: 'ArrowRight' });
      f.document.emit('keydown', { target, key: 'ArrowRight', ctrlKey: true });
    }
    for (const extras of [{ isComposing: true }, { keyCode: 229 }, { altKey: true }, { metaKey: true }, { shiftKey: true }]) {
      f.document.emit('keydown', { target: f.viewport, key: 'ArrowRight', ...extras });
    }
    const dialog = new FakeElement('dialog'); f.root.append(dialog); dialog.showModal();
    f.document.emit('keydown', { target: f.viewport, key: 'ArrowRight' }); dialog.close(); dialog.remove();
    assert.equal(f.block(f.ids[1]!).style.left, before);
    f.document.emit('keydown', { target: f.viewport, key: 'ArrowRight', repeat: true }); assert.equal(Number.parseFloat(f.block(f.ids[1]!).style.left!), Number.parseFloat(before!) - 64);
  } finally { f.cleanup(); }
});

test('song header opens settings immediately before Save while preserving the current project', () => {
  let opened = 0; const f = fixture({ onSettings() { opened++; } }); try {
    const files = f.root.querySelector('.song-file-actions')!; const before = structuredClone(f.song.read().draft);
    assert.equal(files.children[0]!.textContent, '设置'); assert.equal(files.children[1]!.textContent, '保存');
    files.children[0]!.emit('click'); assert.equal(opened, 1); assert.deepEqual(f.song.read().draft, before);
  } finally { f.cleanup(); }
});

test('the shelf plus opens this song phrase library; only the library plus enters phrase creation', () => {
  let created = 0; const f = fixture({ onNewPhrase() { created++; } }); try {
    const before = f.song.read().body;
    f.root.querySelector('.song-new-phrase')!.emit('click');
    const dialog = f.root.querySelector('.song-phrase-library')!; assert(dialog);
    assert.equal(dialog.attributes.get('aria-label'), '乐句库'); assert.equal(dialog.querySelector('h2')!.textContent, '乐句库');
    assert.equal(created, 0); assert.equal(dialog.querySelectorAll('.song-library-phrase').length, 1);
    assert.equal(dialog.querySelector('.song-library-phrase')!.dataset.phraseId, f.phraseId);
    assert.equal(dialog.querySelector('.song-library-grid')!.children.at(-1)!.className, 'song-library-new');
    f.document.emit('keydown', { target: f.viewport, key: 'd' }); assert.deepEqual(f.song.read().body, before);
    dialog.querySelector('.song-library-new')!.emit('click');
    assert.equal(created, 1); assert.equal(f.root.querySelector('.song-phrase-library'), undefined);
    f.root.querySelector('.song-new-phrase')!.emit('click');
    f.root.querySelector('.song-library-close')!.emit('click'); assert.equal(created, 1);
    assert.equal(f.root.querySelector('.song-phrase-library'), undefined);
  } finally { f.cleanup(); }
});

test('an empty project phrase library offers one create tile without leaking other project phrases', () => {
  const f = fixture({ phrases: () => [] }); try {
    f.root.querySelector('.song-new-phrase')!.emit('click');
    const dialog = f.root.querySelector('.song-phrase-library')!;
    assert.equal(dialog.querySelectorAll('.song-library-phrase').length, 0);
    assert.equal(dialog.querySelector('.song-library-grid')!.children.length, 1);
    assert.equal(dialog.querySelectorAll('.song-library-new').length, 1);
  } finally { f.cleanup(); }
});

test('console reveals immediately on selecting a clip or row and stays visible during a subsequent drag', () => {
  const f = fixture(); try {
    const console = f.root.querySelector('.song-inspector')!; assert.equal(console.hidden, true);
    f.viewport.emit('pointerdown', { target: f.block(f.ids[0]!), clientX: 20, clientY: 52 });
    assert.equal(console.hidden, false); assert.equal(console.style.visibility, '');
    f.document.emit('pointermove', { clientX: 30, clientY: 52 }); f.flushFrames(); assert.equal(console.hidden, false);
    f.document.emit('pointerup', { clientX: 30, clientY: 52 }); assert.equal(console.hidden, false); assert.equal(console.style.visibility, '');
    f.viewport.emit('pointerdown', { target: f.block(f.ids[1]!), clientX: 210, clientY: 52 });
    assert.equal(console.hidden, false, 'the allocated console cannot change viewport geometry while pressed');
    assert.equal(console.style.visibility, '');
    f.document.emit('pointerup', { clientX: 210, clientY: 52 });
    assert.equal(console.style.visibility, ''); assert.equal(console.querySelectorAll('strong')[2]!.textContent, '2.000 秒');
    const level = console.querySelector('.song-inspector-level')!.querySelector('input')!;
    level.emit('pointerdown'); assert.equal(console.style.visibility, '', 'its own controls stay visible and stable'); f.document.emit('pointerup');
    const card = f.root.querySelector('.song-phrase-card')!; card.emit('dragstart', { dataTransfer: phraseTransfer() });
    assert.equal(console.hidden, false); assert.equal(console.style.visibility, '');
    card.emit('dragend'); assert.equal(console.hidden, false); assert.equal(console.style.visibility, '');
  } finally { f.cleanup(); }
  const row = fixture(); try {
    row.viewport.emit('pointerdown', { target: row.root.querySelector('.song-row-control'), clientX: 10, clientY: 52 });
    assert.equal(row.root.querySelector('.song-inspector')!.hidden, false);
    row.document.emit('pointerup'); assert.equal(row.root.querySelector('.song-inspector')!.hidden, false);
  } finally { row.cleanup(); }
});

test('phrase library drag exposes an icon-only trash inside the top-layer dialog and warns before deletion', () => {
  const deleted: string[] = []; const f = fixture({ onDeletePhrase(id) { deleted.push(id); } }); try {
    const before = f.song.read().body; f.root.querySelector('.song-new-phrase')!.emit('click');
    const dialog = f.root.querySelector('.song-phrase-library')!; const tile = dialog.querySelector('.song-library-phrase')!;
    const transfer = phraseTransfer(); tile.emit('dragstart', { dataTransfer: transfer });
    assert.equal((tile as unknown as {draggable:boolean}).draggable, true); assert.equal(transfer.effectAllowed, 'move');
    assert.equal(transfer.getData('application/x-rootsound-library-phrase'), f.phraseId);
    const trash = dialog.querySelector('.song-phrase-trash')!; assert(trash); assert.equal(trash.parentElement, dialog);
    assert.equal(trash.hidden, false); assert.equal(trash.textContent, ''); assert.equal(trash.querySelector('span'), undefined);
    assert.equal((trash as unknown as {title?:string}).title ?? '', ''); assert.equal(trash.querySelectorAll('svg').length, 1);
    trash.emit('drop', { dataTransfer: { getData: () => 'foreign' } }); assert.equal(f.root.querySelector('.song-library-delete-dialog'), undefined);
    trash.emit('drop', { dataTransfer: transfer }); tile.emit('dragend'); tile.emit('click');
    assert.equal(f.root.querySelector('.song-phrase-library'), dialog, 'a drag must not add/open its tile');
    const warning = f.root.querySelector('.song-library-delete-dialog')!; assert(warning);
    assert.match(warning.querySelector('p')!.textContent, /使用位置.*保存工程后生效.*退出并放弃/);
    assert.deepEqual(deleted, []); assert.deepEqual(f.song.read().body, before);
    warning.querySelector('.song-library-delete-cancel')!.emit('click');
    assert.equal(f.root.querySelector('.song-library-delete-dialog'), undefined);
    assert.equal(dialog.querySelectorAll('.song-library-phrase').length, 1); assert.deepEqual(f.song.read().body, before);
    assert.equal(f.root.querySelectorAll('.song-clip').length, 4); assert.equal(trash.hidden, true);
    dialog.querySelector('.song-library-close')!.emit('click'); tile.emit('dragstart', { dataTransfer: transfer }); trash.emit('drop', { dataTransfer: transfer });
    assert.equal(trash.hidden, true); assert.equal(f.root.querySelector('.song-library-delete-dialog'), undefined); assert.deepEqual(deleted, []);
  } finally { f.cleanup(); }
});

test('confirmed phrase library deletion waits once, refreshes all uses and library, and cancel is blocked while saving', async () => {
  let finish!: () => void; const deleted: string[] = []; let f!: ReturnType<typeof fixture>;
  f = fixture({ onDeletePhrase(id) {
    deleted.push(id); return new Promise<void>(resolve => { finish = () => {
      f.song.removeClips(f.song.read().body!.tracks.flatMap(track => track.clips.filter(clip => clip.phraseId === id).map(clip => ({trackId:track.id,clipId:clip.id}))));
      f.shelf.splice(0); resolve();
    }; });
  } });
  try {
    f.root.querySelector('.song-new-phrase')!.emit('click'); const tile = f.root.querySelector('.song-library-phrase')!; const transfer = phraseTransfer();
    tile.emit('dragstart', { dataTransfer: transfer }); f.root.querySelector('.song-phrase-trash')!.emit('drop', { dataTransfer: transfer });
    const warning = f.root.querySelector('.song-library-delete-dialog')!; const confirm = warning.querySelector('.song-library-delete-confirm')!;
    confirm.emit('click'); confirm.emit('click'); warning.querySelector('.song-library-delete-cancel')!.emit('click');
    assert.deepEqual(deleted, [f.phraseId]); assert.equal(confirm.disabled, true);
    assert.equal(warning.querySelector('.song-library-delete-cancel')!.disabled, true); assert.equal(f.root.querySelector('.song-library-delete-dialog'), warning);
    assert.equal(f.root.querySelectorAll('.song-clip').length, 4); finish(); await settlePlaylistAudio();
    assert.equal(f.root.querySelector('.song-library-delete-dialog'), undefined); assert.equal(f.root.querySelectorAll('.song-library-phrase').length, 0);
    assert.equal(f.root.querySelectorAll('.song-phrase-card').length, 0); assert.equal(f.root.querySelectorAll('.song-clip').length, 0);
    assert(f.root.querySelector('.song-empty-curtain')); assert.equal(f.root.querySelector('.song-phrase-trash')!.hidden, true);
  } finally { f.cleanup(); }
});

test('failed permanent phrase deletion remains in its warning with untouched sources and supports retry', async () => {
  let attempts = 0; const f = fixture({ onDeletePhrase() { attempts++; throw new Error('磁盘暂不可写'); } }); try {
    const before = f.song.read().body; f.root.querySelector('.song-new-phrase')!.emit('click'); const transfer = phraseTransfer();
    f.root.querySelector('.song-library-phrase')!.emit('dragstart', { dataTransfer: transfer }); f.root.querySelector('.song-phrase-trash')!.emit('drop', { dataTransfer: transfer });
    const warning = f.root.querySelector('.song-library-delete-dialog')!; const confirm = warning.querySelector('.song-library-delete-confirm')!;
    confirm.emit('click'); await settlePlaylistAudio();
    assert.equal(warning.querySelector('.song-library-delete-error')!.textContent, '磁盘暂不可写'); assert.equal(confirm.disabled, false);
    assert.equal(f.root.querySelector('.song-library-delete-dialog'), warning); assert.deepEqual(f.song.read().body, before);
    assert.equal(f.root.querySelectorAll('.song-library-phrase').length, 1); assert.equal(f.root.querySelectorAll('.song-phrase-card').length, 1);
    confirm.emit('click'); await settlePlaylistAudio(); assert.equal(attempts, 2);
    warning.querySelector('.song-library-delete-cancel')!.emit('click'); assert.deepEqual(f.song.read().body, before);
  } finally { f.cleanup(); }
});

test('shelf trash hides only its reusable card, and the library restores its exact identity and every existing use', () => {
  const f = fixture(); try {
    const before = structuredClone(f.song.read().body!.tracks); const transfer = phraseTransfer();
    const card = f.root.querySelector('.song-phrase-card')!; card.emit('dragstart', { dataTransfer: transfer });
    const trash = f.root.querySelector('.song-phrase-trash')!;
    assert.equal(trash.hidden, false); assert.equal(transfer.effectAllowed, 'copyMove');
    assert.equal(trash.attributes.get('aria-label'), '从乐句栏移除');
    f.document.emit('dragover', { clientX: 900, clientY: 60, dataTransfer: transfer }); f.flushFrames();
    assert(trash.classList.contains('is-over')); trash.emit('drop', { dataTransfer: transfer });
    assert.equal(trash.hidden, true); assert.equal(f.root.querySelectorAll('.song-phrase-card').length, 0);
    assert.deepEqual(f.song.read().body!.hiddenPhraseIds, [f.phraseId]);
    assert.deepEqual(f.song.read().body!.tracks, before); assert.equal(f.root.querySelectorAll('.song-clip').length, 4);
    card.emit('dragend');
    f.root.querySelector('.song-new-phrase')!.emit('click');
    f.root.querySelector('.song-library-phrase')!.emit('keydown', { key: 'Enter' });
    assert.equal(f.root.querySelectorAll('.song-phrase-card').length, 1);
    assert.equal(f.root.querySelector('.song-phrase-card')!.dataset.phraseId, f.phraseId);
    assert.equal(f.song.read().body!.hiddenPhraseIds, undefined); assert.deepEqual(f.song.read().body!.tracks, before);
    assert(f.root.querySelector('.song-phrase-library')); assert.equal(f.root.querySelector('.song-library-phrase')!.attributes.get('aria-pressed'), 'true');
    assert(f.root.querySelectorAll('.song-clip').every(clip => !clip.classList.contains('is-selected')), 'visibility selection does not select arrangement clips');
    f.document.emit('keydown', { target: f.viewport, key: 'q' }); assert.deepEqual(f.song.read().body!.tracks, before);
    assert.equal(f.retained.length, 0, 'shelf visibility never removes or re-retains musical sources');
  } finally { f.cleanup(); }
});

test('timeline trash removes dragged occurrences with the erase animation and keeps source/library/shelf intact', () => {
  const f = fixture(); try {
    const id = f.ids[0]!;
    f.viewport.emit('pointerdown', { target: f.block(id), clientX: 20, clientY: 52 });
    assert.equal(f.root.querySelector('.song-phrase-trash')!.hidden, true, 'a click alone is not a drag');
    f.document.emit('pointermove', { clientX: 900, clientY: 60 }); f.flushFrames();
    const trash = f.root.querySelector('.song-phrase-trash')!; assert.equal(trash.hidden, false);
    assert.equal(trash.attributes.get('aria-label'), '从播放列表移除'); assert(trash.classList.contains('is-over'));
    f.document.emit('pointerup', { clientX: 900, clientY: 60 });
    assert.equal(trash.hidden, true); assert.equal(f.song.read().body!.tracks.flatMap(track => track.clips).length, 3);
    assert.equal(f.song.read().body!.tracks.flatMap(track => track.clips).find(clip => clip.id === id), undefined);
    assert.deepEqual(f.retained, [[f.phraseId]]); assert.equal(f.root.querySelectorAll('.song-clip-erasure').length, 1);
    assert.equal(f.root.querySelectorAll('.song-phrase-card').length, 1); assert.equal(f.song.read().body!.hiddenPhraseIds, undefined);
    f.root.querySelector('.song-new-phrase')!.emit('click'); assert.equal(f.root.querySelectorAll('.song-library-phrase').length, 1);
  } finally { f.cleanup(); }
});

test('cancelled timeline or shelf drags clear the trash and preserve the song, and a failed source retention never deletes clips', () => {
  const f = fixture({ onKeepPhrases() { throw new Error('保留失败'); } }); try {
    const before = structuredClone(f.song.read().body!); const id = f.ids[0]!;
    f.viewport.emit('pointerdown', { target: f.block(id), clientX: 20, clientY: 52 }); f.document.emit('pointermove', { clientX: 900, clientY: 60 }); f.flushFrames();
    f.document.emit('pointercancel', { clientX: 900, clientY: 60 });
    assert.equal(f.root.querySelector('.song-phrase-trash')!.hidden, true); assert.deepEqual(f.song.read().body, before);
    const card = f.root.querySelector('.song-phrase-card')!; card.emit('dragstart', { dataTransfer: phraseTransfer() }); card.emit('dragend');
    assert.equal(f.root.querySelector('.song-phrase-trash')!.hidden, true); assert.deepEqual(f.song.read().body, before);
    f.viewport.emit('pointerdown', { target: f.block(id), clientX: 20, clientY: 52 }); f.document.emit('pointermove', { clientX: 900, clientY: 60 }); f.flushFrames();
    f.document.emit('pointerup', { clientX: 900, clientY: 60 });
    assert.deepEqual(f.song.read().body, before); assert.equal(f.root.querySelector('.song-notice')!.textContent, '保留失败');
    assert.equal(f.root.querySelector('.song-phrase-trash')!.hidden, true);
  } finally { f.cleanup(); }
});

test('actual playlist drop accepts an unsnapped time in every real row, and rejects the outline row', () => {
  const f = fixture(); try {
    assert.equal(f.root.querySelector('.song-project-name')!.textContent, '当前项目');
    assert.equal(f.root.querySelectorAll('.song-phrase-card').length, 1);
    const transfer = { types: ['application/x-rootsound-phrase'], getData: (type: string) => type === 'application/x-rootsound-phrase' ? f.phraseId : '' };
    f.viewport.emit('drop', { clientX: 317.2, clientY: 28 + 120, dataTransfer: transfer });
    const clip = f.song.read().body!.tracks[2]!.clips[0]!;
    assert(Math.abs(clip.startBeat - 317.2 / 88 * 2) < 1e-10);
    f.viewport.emit('drop', { clientX: 317.2, clientY: 28 + 7 * 60 + 10, dataTransfer: transfer });
    assert.equal(f.song.read().body!.tracks.flatMap(track => track.clips).length, 5);
  } finally { f.cleanup(); }
});

const nearAlignmentCases = [
  { name: 'a beat line', seconds: .5, offsetPixels: .5 },
  { name: 'a bar line', seconds: 2, offsetPixels: -.5 },
  { name: 'another clip start', seconds: 3.317, offsetPixels: .5 },
  { name: 'another clip end', seconds: 5.317, offsetPixels: -.5 },
  { name: 'another clip start with its own end', seconds: 1.317, offsetPixels: -.5 },
  { name: 'another clip end with its own end', seconds: 3.317, offsetPixels: -.5 },
];
test('clip drag previews, shelf previews and commits stay precise within half a pixel of beat, bar and clip edges', () => {
  for (const position of nearAlignmentCases) for (const operation of ['drag', 'drop']) {
    const f = fixture(); try {
      const reference = f.song.read().body!.tracks[1]!.clips[0]!;
      f.song.moveClip(f.otherTrack, reference.id, f.otherTrack, 3.317 * 2); f.workspace.refresh();
      const viewport = f.root.querySelector('.song-scroll')!; const id = f.ids[0]!;
      const before = f.song.read().body; const pixels = position.seconds * 88 + position.offsetPixels;
      if (operation === 'drag') {
        viewport.emit('pointerdown', { target: f.block(id), clientX: 20, clientY: 52 });
        const block = f.block(id);
        f.document.emit('pointermove', { clientX: 20 + pixels, clientY: 52 }); f.flushFrames();
        assert.equal(f.block(id), block);
        assert(Math.abs(Number.parseFloat(block.style.transform!.slice('translate('.length)) - pixels) < 1e-10);
        assert.deepEqual(f.song.read().body, before, 'preview does not persist the move');
        f.document.emit('pointerup');
        const moved = f.song.read().body!.tracks[0]!.clips.find(clip => clip.id === id)!;
        assert(Math.abs(moved.startBeat - pixels / 88 * 2) < 1e-10, `drag near ${position.name}`);
        assert.notEqual(moved.startBeat, position.seconds * 2);
      } else {
        const transfer = { types: ['application/x-rootsound-phrase'], getData: () => f.phraseId };
        viewport.emit('dragover', { clientX: pixels, clientY: 172, dataTransfer: transfer }); f.flushFrames();
        assert(Math.abs(Number.parseFloat(f.root.querySelector('.song-drop-preview')!.style.left!) - pixels) < 1e-10);
        assert.deepEqual(f.song.read().body, before, 'shelf preview does not add an instance');
        viewport.emit('drop', { clientX: pixels, clientY: 172, dataTransfer: transfer });
        const added = f.song.read().body!.tracks[2]!.clips[0]!;
        assert(Math.abs(added.startBeat - pixels / 88 * 2) < 1e-10, `drop near ${position.name}`);
        assert.notEqual(added.startBeat, position.seconds * 2);
        assert.equal(f.root.querySelector('.song-drop-preview'), undefined);
      }
      assert.equal(f.song.read().body!.tracks[1]!.clips[0]!.startBeat, 3.317 * 2);
    } finally { f.cleanup(); }
  }
});

test('the first A/D press moves clips and row groups by exactly 25 ms away from alignments, clamped only at zero', () => {
  for (const selection of ['clip', 'row'] as const) for (const seconds of [0, .01, .5, 2, 3.317, 5.317]) for (const key of ['a', 'd'] as const) {
    const f = fixture(); try {
      const ids = selection === 'row' ? f.ids : [f.ids[0]!];
      f.song.moveClips(ids.map((id, index) => ({ trackId: f.track, clipId: id, targetTrackId: f.track, startBeat: seconds * 2 + index * 4 })));
      const reference = f.song.read().body!.tracks[1]!.clips[0]!;
      f.song.moveClip(f.otherTrack, reference.id, f.otherTrack, 3.317 * 2); f.workspace.refresh();
      const viewport = f.root.querySelector('.song-scroll')!;
      viewport.emit('pointerdown', { target: selection === 'row' ? f.root.querySelector('.song-row-control') : f.block(ids[0]!), clientX: selection === 'row' ? 5 : seconds * 88 + 20, clientY: 52 });
      f.document.emit('pointerup');
      const before = f.song.read().body!.tracks[0]!.clips;
      f.document.emit('keydown', { target: viewport, key });
      const delta = Math.max(-seconds, key === 'a' ? -.025 : .025);
      const after = f.song.read().body!.tracks[0]!.clips;
      for (const id of ids) {
        const original = before.find(clip => clip.id === id)!; const moved = after.find(clip => clip.id === id)!;
        assert(Math.abs(moved.startBeat - original.startBeat - delta * 2) < 1e-10, `${selection} ${key} at ${seconds}s`);
      }
      for (const clip of before.filter(clip => !ids.includes(clip.id))) assert.deepEqual(after.find(item => item.id === clip.id), clip);
      assert.equal(f.song.read().body!.tracks[1]!.clips[0]!.startBeat, 3.317 * 2);
    } finally { f.cleanup(); }
  }
});

test('selection shortcuts adjust the instance and skip input fields; a double click edits the shared phrase', () => {
  const f = fixture(); try {
    f.viewport.emit('pointerdown', { target: f.block(f.ids[0]!), clientX: 40, clientY: 52 }); f.document.emit('pointerup');
    f.document.emit('keydown', { target: f.viewport, key: 'e' }); f.document.emit('keydown', { target: f.viewport, key: 's' });
    let clip = f.song.read().body!.tracks[0]!.clips[0]!; assert.equal(clip.pan, .05); assert.equal(clip.level, .95);
    const tempo = f.root.querySelectorAll('input').find(input => input.attributes.get('aria-label') === '网格 BPM')!;
    tempo.focus(); f.document.emit('keydown', { target: tempo, key: 'q' });
    assert.equal(f.song.read().body!.tracks[0]!.clips[0]!.pan, .05);
    const left = f.block(f.ids[1]!).style.left; const width = f.block(f.ids[1]!).style.width;
    tempo.value = '75'; tempo.emit('input'); assert.equal(f.song.read().body!.tempoBpm, 120); assert.equal(f.song.read().body!.gridTempoBpm, 75);
    assert.equal(f.block(f.ids[1]!).style.left, left); assert.equal(f.block(f.ids[1]!).style.width, width);
    f.viewport.emit('dblclick', { target: f.block(f.ids[0]!), clientX: 40, clientY: 52 }); assert.equal(f.edited[0]!.clipId, f.ids[0]);
    for (let index = 0; index < 10; index++) f.document.emit('keydown', { target: f.viewport, key: 'd', repeat: true });
    clip = f.song.read().body!.tracks[0]!.clips.find(item => item.id === f.ids[0])!; assert(Math.abs(clip.startBeat - .5) < 1e-12);
  } finally { f.cleanup(); }
});

test('Backspace undoes a song edit while Delete removes the selected instance', () => {
  const f = fixture(); try {
    const original = f.song.read().body!;
    f.viewport.emit('pointerdown', { target: f.block(f.ids[0]!), clientX: 40, clientY: 52 }); f.document.emit('pointerup');
    f.document.emit('keydown', { target: f.viewport, key: 's' });
    const quieter = f.song.read().body!; assert.equal(quieter.tracks[0]!.clips[0]!.level, .95);
    f.document.emit('keydown', { target: f.viewport, key: 'Backspace' }); assert.deepEqual(f.song.read().body, original);
    f.document.emit('keydown', { target: f.viewport, key: 'z', ctrlKey: true, shiftKey: true }); assert.deepEqual(f.song.read().body, quieter);
    f.document.emit('keydown', { target: f.viewport, key: 'z', ctrlKey: true }); assert.deepEqual(f.song.read().body, original);
    f.document.emit('keydown', { target: f.viewport, key: 'Delete' });
    assert.equal(f.song.read().body!.tracks[0]!.clips.length, 2); assert.equal(f.block(f.ids[0]!), undefined);
    f.document.emit('keydown', { target: f.viewport, key: 'Backspace' }); assert.deepEqual(f.song.read().body, original);
  } finally { f.cleanup(); }
});

test('song undo ignores text editing, IME, modified Backspace, held keys and open dialogs', () => {
  const f = fixture(); try {
    f.viewport.emit('pointerdown', { target: f.block(f.ids[0]!), clientX: 40, clientY: 52 }); f.document.emit('pointerup');
    f.document.emit('keydown', { target: f.viewport, key: 's' });
    const before = f.song.read().body!; const token = f.library.currentToken();
    for (const values of [{ repeat: true }, { isComposing: true }, { keyCode: 229 }, { ctrlKey: true }, { metaKey: true }, { altKey: true }, { shiftKey: true }]) {
      f.document.emit('keydown', { target: f.viewport, key: 'Backspace', ...values });
    }
    for (const target of [new FakeInput('input'), new FakeSelect('select'), new FakeTextArea('textarea'), new FakeElement('div')]) {
      if (target.tagName === 'DIV') target.isContentEditable = true;
      f.document.emit('keydown', { target, key: 'Backspace' }); f.document.emit('keydown', { target, key: 'z', ctrlKey: true });
    }
    f.document.emit('keydown', { target: f.viewport, key: 'z', ctrlKey: true, repeat: true });
    const dialog = new FakeElement('dialog'); dialog.setAttribute('open', ''); f.root.append(dialog);
    f.document.emit('keydown', { target: f.viewport, key: 'Backspace' }); f.document.emit('keydown', { target: f.viewport, key: 'z', ctrlKey: true });
    assert.deepEqual(f.song.read().body, before); assert.equal(f.library.currentToken(), token);
    dialog.remove(); f.document.emit('keydown', { target: f.viewport, key: 'Backspace' });
    assert.equal(f.song.read().body!.tracks[0]!.clips[0]!.level ?? 1, 1);
  } finally { f.cleanup(); }
});

for (const endEvent of ['pointerup', 'pointercancel']) test(`blank dragging pans the view until ${endEvent} without seeking or changing the music`, () => {
  const f = fixture(); try {
    const before = structuredClone(f.song.read().body!); const left = f.block(f.ids[1]!).style.left; const width = f.block(f.ids[1]!).style.width;
    const pointerId = 7;
    f.viewport.emit('pointerdown', { target: f.viewport, pointerId, clientX: 800, clientY: 150 });
    assert.equal(f.root.querySelector('.song-clock')!.textContent, '00:00.000');
    assert(f.viewport.hasPointerCapture(pointerId));
    for (const [clientX, expectedLeft] of [[712, '88px'], [800, left], [900, left], [856, '132px']] as const) {
      f.document.emit('pointermove', { pointerId, clientX, clientY: 190 }); f.flushFrames();
      assert.equal(f.root.querySelector('.song-clock')!.textContent, '00:00.000');
      assert.equal(f.block(f.ids[1]!).style.left, expectedLeft);
    }
    assert.equal(f.song.read().body!.gridOffsetSeconds, undefined);
    assert.equal(f.block(f.ids[1]!).style.width, width);
    f.document.emit(endEvent, { pointerId });
    assert.equal(f.viewport.hasPointerCapture(pointerId), false);
    f.document.emit('pointermove', { pointerId, clientX: 528, clientY: 190 }); f.flushFrames();
    assert.equal(f.root.querySelector('.song-clock')!.textContent, '00:00.000');
    assert.equal(f.block(f.ids[1]!).style.left, '132px');
    assert.equal(f.root.querySelector('.song-play')!.attributes.get('aria-label'), '播放');
    assert.equal(f.song.read().body!.gridOffsetSeconds, undefined);
    assert.deepEqual(f.song.read().body!.tracks, before.tracks);
    assert.deepEqual(f.song.read().body, before);
  } finally { f.cleanup(); }
});

for (const shiftKey of [false, true]) test(`blank diagonal dragging pans both axes with Shift ${shiftKey ? 'held' : 'released'} and clamps each boundary`, () => {
  const f = fixture(); try {
    const content = f.root.querySelector('.song-timeline')!; content.clientHeight = 180;
    const state = f.song.read(), before = structuredClone(state.draft), token = f.library.currentToken();
    const lastTrack = state.body!.tracks.at(-1)!;
    const clock = f.root.querySelector('.song-clock')!.textContent;
    const initialX = Number.parseFloat(f.block(f.ids[1]!).style.left!);
    const otherRow = () => f.root.querySelectorAll('.song-row-control').find(row => row.dataset.trackId === f.otherTrack)!;
    const move = (clientX: number, clientY: number) => {
      f.document.emit('pointermove', { clientX, clientY, shiftKey }); f.flushFrames();
    };
    f.viewport.emit('pointerdown', { target: content, clientX: 900, clientY: 200 });
    move(812, 155);
    assert.equal(Number.parseFloat(f.block(f.ids[1]!).style.left!), initialX - 88);
    assert.equal(otherRow().style.top, '15px', 'one diagonal drag moves both time and rows');
    move(5000, 5000);
    assert.equal(Number.parseFloat(f.block(f.ids[1]!).style.left!), initialX, 'horizontal pan stops at song zero');
    assert.equal(otherRow().style.top, '60px', 'vertical pan stops at the first row');
    move(4999, 4999);
    assert.equal(Number.parseFloat(f.block(f.ids[1]!).style.left!), initialX - 1, 'reversing at an edge responds immediately');
    assert.equal(otherRow().style.top, '59px');
    move(4999, -10000);
    const lastRow = () => f.root.querySelectorAll('.song-row-control').find(row => row.dataset.trackId === lastTrack.id)!;
    assert.equal(lastRow().style.top, '60px', 'the bottom row and add-row outline remain within the bounded view');
    move(4999, -9999); assert.equal(lastRow().style.top, '61px', 'bottom-edge reversal uses the last client point');
    f.document.emit('pointerup');
    assert.equal(f.viewport.hasPointerCapture(1), false);
    assert.equal(f.root.querySelector('.song-clock')!.textContent, clock);
    assert.equal(f.library.currentToken(), token); assert.deepEqual(f.song.read().draft, before);
  } finally { f.cleanup(); }
});

test('a fast right-drag erases crossed instances once and keeps their phrase in the song shelf', () => {
  const f = fixture(); try {
    f.viewport.emit('pointerdown', { button: 2, clientX: 5, clientY: 52 });
    f.document.emit('pointermove', { clientX: 600, clientY: 52 }); f.flushFrames(); f.document.emit('pointerup');
    assert.equal(f.song.read().body!.tracks[0]!.clips.length, 0); assert.equal(f.song.read().body!.tracks[1]!.clips.length, 1);
    assert.deepEqual(f.retained, [[f.phraseId]]); assert.equal(f.root.querySelectorAll('.song-clip-erasure').length, 3);
    f.song.undo(); assert.equal(f.song.read().body!.tracks[0]!.clips.length, 3);
  } finally { f.cleanup(); }
});

test('right-clicking blank playlist space clears clip, row and source selection without changing the song or history', () => {
  for (const selection of ['clip', 'row', 'source'] as const) {
    const f = fixture(); try {
      if (selection === 'source') f.root.querySelector('.song-phrase-card')!.emit('click');
      else {
        f.viewport.emit('pointerdown', { target: selection === 'row' ? f.root.querySelector('.song-row-control')! : f.block(f.ids[0]!), clientX: 40, clientY: 52 });
        f.document.emit('pointerup');
      }
      assert.equal(f.root.querySelector('.song-inspector')!.hidden, false);
      const before = f.song.read().body!; const token = f.library.currentToken();
      const history = f.library.readDraftHistory(f.song.read().draft!.id);
      const position = { left: f.block(f.ids[1]!).style.left, top: f.block(f.ids[1]!).style.top };
      f.viewport.emit('pointerdown', { button: 2, clientX: 800, clientY: 300 });
      assert.equal(f.root.querySelector('.song-inspector')!.hidden, true);
      for (const selector of ['.song-clip', '.song-row-control', '.song-phrase-card']) {
        assert(f.root.querySelectorAll(selector).every(element => !element.classList.contains('is-selected')), selection);
      }
      f.document.emit('pointerup');
      assert.deepEqual(f.song.read().body, before); assert.equal(f.library.currentToken(), token);
      assert.deepEqual(f.library.readDraftHistory(f.song.read().draft!.id), history); assert.deepEqual(f.retained, []);
      assert.deepEqual({ left: f.block(f.ids[1]!).style.left, top: f.block(f.ids[1]!).style.top }, position);
    } finally { f.cleanup(); }
  }
});

test('a right-drag starting in blank space still erases only the instances crossed after deselection', () => {
  const f = fixture(); try {
    f.viewport.emit('pointerdown', { target: f.block(f.ids[0]!), clientX: 40, clientY: 52 }); f.document.emit('pointerup');
    const before = f.song.read().body!;
    f.viewport.emit('pointerdown', { button: 2, clientX: 800, clientY: 52 });
    assert.equal(f.root.querySelector('.song-inspector')!.hidden, true);
    f.document.emit('pointermove', { clientX: 400, clientY: 52 }); f.flushFrames();
    assert.deepEqual(f.song.read().body, before); assert.equal(f.root.querySelectorAll('.song-clip').length, 3);
    f.document.emit('pointerup');
    assert.deepEqual(f.song.read().body!.tracks[0]!.clips.map(clip => clip.id), f.ids.slice(0, 2));
    assert.equal(f.song.read().body!.tracks[1]!.clips.length, 1); assert.deepEqual(f.retained, [[f.phraseId]]);
    f.document.emit('keydown', { target: f.viewport, key: 'Backspace' }); assert.deepEqual(f.song.read().body, before);
  } finally { f.cleanup(); }
});

test('a shelf retention failure aborts deletion and restores the visible instances', () => {
  const f = fixture({ onKeepPhrases() { throw new Error('保留失败'); } }); try {
    f.viewport.emit('pointerdown', { button: 2, clientX: 5, clientY: 52 }); f.document.emit('pointerup');
    assert.equal(f.song.read().body!.tracks[0]!.clips.length, 3); assert.equal(f.root.querySelectorAll('.song-clip').length, 4);
    assert.match(f.root.querySelector('.song-notice')!.textContent, /保留失败/u);
  } finally { f.cleanup(); }
});

test('save commits and validates the BPM field and shares one pending command with Save As', async () => {
  let calls = 0; let asCalls = 0; let finish!: () => void;
  const f = fixture({ onSaveProject() { calls++; return new Promise<void>(resolve => { finish = resolve; }); }, onSaveProjectAs() { asCalls++; } });
  try {
    const buttons = f.root.querySelectorAll('.song-save'); const tempo = f.root.querySelectorAll('input')[0]!;
    tempo.focus(); tempo.value = '9'; tempo.blur(); buttons[0]!.emit('click'); await Promise.resolve(); assert.equal(calls, 0);
    tempo.value = '90'; buttons[0]!.emit('click'); assert.equal(f.song.read().body!.gridTempoBpm, 90); assert.equal(calls, 1);
    buttons[1]!.emit('click'); assert.equal(asCalls, 0); finish(); await Promise.resolve(); await Promise.resolve();
    buttons[1]!.emit('click'); assert.equal(asCalls, 1);
  } finally { f.cleanup(); }
});




test('dragging a selected instance changes its row and fine time without changing its phrase', () => {
  const f = fixture(); try {
    const id = f.ids[0]!;
    f.viewport.emit('pointerdown', { target: f.block(id), clientX: 40, clientY: 52 });
    f.document.emit('pointermove', { clientX: 153, clientY: 52 + 3 * 60 }); f.flushFrames();
    assert.equal(f.song.read().body!.tracks[0]!.clips.some(clip => clip.id === id), true);
    f.document.emit('pointerup');
    const clip = f.song.read().body!.tracks[3]!.clips.find(clip => clip.id === id)!;
    assert.equal(clip.phraseId, f.phraseId); assert(Math.abs(clip.startBeat - 113 / 88 * 2) < 1e-10);
    const before = clip.startBeat;
    f.viewport.emit('pointerdown', { target: f.block(id), clientX: 153, clientY: 52 + 3 * 60 });
    f.document.emit('pointermove', { clientX: 230, clientY: 28 + 7 * 60 + 20 }); f.flushFrames(); f.document.emit('pointerup');
    assert.equal(f.song.read().body!.tracks[3]!.clips.find(clip => clip.id === id)!.startBeat, before);
    f.viewport.emit('pointerdown', { target: f.block(id), clientX: 153, clientY: 52 + 3 * 60 });
    f.document.emit('pointermove', { clientX: 1, clientY: 52 + 3 * 60 }); f.flushFrames(); f.document.emit('pointerup');
    assert.equal(f.song.read().body!.tracks[3]!.clips.find(clip => clip.id === id)!.startBeat, 0);
  } finally { f.cleanup(); }
});

test('wheel scrolls the timeline, Ctrl zooms around the pointer, and modal keys never reach the background', () => {
  const f = fixture(); try {
    const start = Number.parseFloat(f.block(f.ids[1]!).style.left!);
    f.viewport.emit('wheel', { deltaX: 0, deltaY: 100, clientX: 400, clientY: 100 }); f.flushFrames();
    const scrolled = Number.parseFloat(f.block(f.ids[1]!).style.left!); assert(Math.abs(scrolled - start + 100) < 1e-9);
    const beforeX = Number.parseFloat(f.block(f.ids[1]!).style.left!); const beforeWidth = Number.parseFloat(f.block(f.ids[1]!).style.width!);
    f.viewport.emit('wheel', { deltaX: 0, deltaY: -100, ctrlKey: true, clientX: 400, clientY: 100 }); f.flushFrames();
    const afterX = Number.parseFloat(f.block(f.ids[1]!).style.left!); const afterWidth = Number.parseFloat(f.block(f.ids[1]!).style.width!);
    assert(Math.abs((400 - beforeX) / beforeWidth - (400 - afterX) / afterWidth) < 1e-10);
    const dialog = new FakeElement('dialog'); dialog.setAttribute('open', ''); f.root.append(dialog);
    const before = f.song.read().body!; f.document.emit('keydown', { target: dialog, key: 'Delete' }); f.document.emit('keydown', { target: dialog, key: 'q' });
    assert.deepEqual(f.song.read().body, before);
  } finally { f.cleanup(); }
});

test('row controls reverse the main timeline wheel axes for all four modifier combinations without changing music or the head', () => {
  for (const controls of [false, true]) for (const [ctrlKey, shiftKey] of [[false, false], [true, false], [false, true], [true, true]]) {
    const f = fixture(); try {
      const content = f.root.querySelector('.song-timeline')!; content.clientHeight = 180;
      f.viewport.emit('pointerdown', { target: f.root.querySelector('.song-ruler'), clientX: 88, clientY: 12 }); f.document.emit('pointerup');
      const track = f.song.read().body!.tracks[1]!; const other = track.clips[0]!.id;
      const width = Number.parseFloat(f.block(other).style.width!);
      const before = { token: f.library.currentToken(), body: f.song.read().body, time: f.root.querySelector('.song-clock')!.textContent };
      const target = controls ? f.root.querySelector('.song-row-name')! : content;
      f.viewport.emit('wheel', { target, ctrlKey, shiftKey, deltaX: 0, deltaY: ctrlKey ? -100 : 60, clientX: controls ? 40 : 400, clientY: 108 });
      assert.equal(f.pendingFrames(), 1); f.flushFrames(); assert.equal(f.pendingFrames(), 0);
      const vertical = controls ? !shiftKey : shiftKey;
      const row = f.root.querySelectorAll('.song-row-control').find(item => item.dataset.trackId === track.id)!;
      const block = f.block(other);
      if (ctrlKey) {
        assert(Math.abs(Number.parseFloat(row.style.height!) - 60 * (vertical ? Math.exp(.2) : 1)) < 1e-8);
        assert(Math.abs(Number.parseFloat(block.style.width!) - width * (vertical ? 1 : Math.exp(.2))) < 1e-8);
      } else {
        assert.equal(Number.parseFloat(row.style.top!), vertical ? 0 : 60);
        assert(Math.abs(Number.parseFloat(block.style.left!) - (vertical ? 0 : -60)) < 1e-8);
        assert.equal(Number.parseFloat(block.style.width!), width);
      }
      assert.equal(f.library.currentToken(), before.token); assert.deepEqual(f.song.read().body, before.body);
      assert.equal(f.root.querySelector('.song-clock')!.textContent, before.time);
    } finally { f.cleanup(); }
  }
});

test('row wheel bursts share one frame and both pan and zoom stop at the defined viewport boundaries', () => {
  const f = fixture(); try {
    const content = f.root.querySelector('.song-timeline')!; content.clientHeight = 180;
    const controls = f.root.querySelector('.song-row-controls')!; const token = f.library.currentToken(); const before = f.song.read().body;
    const row = () => f.root.querySelectorAll('.song-row-control').find(item => item.dataset.trackId === f.otherTrack)!;
    for (let index = 0; index < 100; index++) f.viewport.emit('wheel', { target: controls, deltaY: 1, clientX: 40, clientY: 108 });
    assert.equal(row().style.top, '60px', 'no intermediate repaint before the shared frame'); assert.equal(f.pendingFrames(), 1);
    f.flushFrames(); assert.equal(row().style.top, '-40px');
    f.viewport.emit('wheel', { target: controls, deltaY: 100000, clientX: 40, clientY: 108 }); f.flushFrames();
    const last = f.root.querySelector('.song-add-track')!; assert.equal(last.style.top, '120px', 'the outline row reaches the bottom of the bounded vertical view');
    f.viewport.emit('wheel', { target: controls, deltaY: -100000, clientX: 40, clientY: 108 }); f.flushFrames(); assert.equal(row().style.top, '60px');
    f.viewport.emit('wheel', { target: controls, shiftKey: true, deltaY: -100000, clientX: 40, clientY: 108 }); f.flushFrames();
    assert.equal(f.block(f.ids[0]!).style.left, '0px', 'horizontal wheel cannot cross song zero');
    f.viewport.emit('wheel', { target: controls, ctrlKey: true, deltaY: -100000, clientX: 40, clientY: 108 }); f.flushFrames();
    assert.equal(Number.parseFloat(row().style.height!), 128);
    f.viewport.emit('wheel', { target: controls, ctrlKey: true, deltaY: 100000, clientX: 40, clientY: 108 }); f.flushFrames();
    assert.equal(Number.parseFloat(row().style.height!), 28);
    f.viewport.emit('wheel', { target: controls, ctrlKey: true, shiftKey: true, deltaY: -100000, clientX: 40, clientY: 108 }); f.flushFrames();
    const other = f.song.read().body!.tracks[1]!.clips[0]!.id; assert.equal(Number.parseFloat(f.block(other).style.width!), 5120);
    f.viewport.emit('wheel', { target: controls, ctrlKey: true, shiftKey: true, deltaY: 100000, clientX: 40, clientY: 108 }); f.flushFrames();
    assert.equal(Number.parseFloat(f.block(other).style.width!), 24);
    assert.equal(f.library.currentToken(), token); assert.deepEqual(f.song.read().body, before); assert.equal(f.root.querySelector('.song-clock')!.textContent, '00:00.000');
  } finally { f.cleanup(); }
});

test('the phrase-library create action inherits the grid BPM at the current head, including tempo markers', () => {
  const received: Array<number | undefined> = []; const f = fixture({ onNewPhrase(tempoBpm) { received.push(tempoBpm); } }); try {
    const seek = (seconds: number) => { f.root.querySelector('.song-scroll')!.emit('pointerdown', { target: f.root.querySelector('.song-ruler'), clientX: seconds * 88, clientY: 12 }); f.document.emit('pointerup'); };
    const create = () => {
      const token = f.library.currentToken(); f.root.querySelector('.song-new-phrase')!.emit('click');
      f.root.querySelector('.song-library-new')!.emit('click');
      assert.equal(f.root.querySelector('.song-phrase-library'), undefined); assert.equal(f.library.currentToken(), token, 'choosing a creation tempo does not edit the current song');
    };
    create(); assert.deepEqual(received, [120]);
    f.song.setGridTempo(150); f.workspace.refresh(); seek(3);
    const tempo = f.root.querySelectorAll('input').find(input => input.attributes.get('aria-label') === '网格 BPM')!;
    tempo.focus(); tempo.value = '170'; tempo.emit('input'); tempo.blur();
    assert.equal(f.song.read().body!.tempoBpm, 120, 'musical storage tempo is distinct from the displayed tempo grid');
    create(); assert.equal(received.at(-1), 170);
    seek(1); create(); assert.equal(received.at(-1), 150);
    seek(5); create(); assert.equal(received.at(-1), 170);
    seek(3); create(); assert.equal(received.at(-1), 170, 'the marker itself uses its new BPM');
  } finally { f.cleanup(); }
});

test('the overflowed song console scrolls horizontally while mix ranges keep their own wheel action and disposal detaches scrolling', () => {
  const f = fixture(); try {
    f.viewport.emit('pointerdown', { target: f.block(f.ids[0]!), clientX: 20, clientY: 52 }); f.document.emit('pointerup');
    const console = f.root.querySelector('.song-inspector')!; Object.assign(console, { clientWidth: 500, scrollWidth: 1500, scrollLeft: 0 });
    const token = f.library.currentToken(), before = f.song.read().body;
    const wheel = (values: Record<string, unknown> = {}) => console.emit('wheel', { target: console.querySelector('.song-inspector-details'), deltaX: 0, deltaY: 80, deltaMode: 0, ...values });
    const first = wheel(); assert.equal(console.scrollLeft, 80); assert.equal(first.defaultPrevented, true); assert.equal(first.propagationStopped, true);
    wheel({ deltaX: 50, deltaY: 5 }); assert.equal(console.scrollLeft, 130);
    wheel({ deltaY: 2, deltaMode: 1 }); assert.equal(console.scrollLeft, 178);
    wheel({ deltaY: 1, deltaMode: 2 }); assert.equal(console.scrollLeft, 678);
    wheel({ deltaY: 10000 }); assert.equal(console.scrollLeft, 1000); wheel({ deltaY: -10000 }); assert.equal(console.scrollLeft, 0);
    for (const modifier of [{ ctrlKey: true }, { metaKey: true }, { altKey: true }]) { const event = wheel(modifier); assert.equal(console.scrollLeft, 0); assert.equal(event.defaultPrevented, false); }
    assert.equal(f.library.currentToken(), token); assert.deepEqual(f.song.read().body, before);
    console.scrollWidth = 500; const fitting = wheel(); assert.equal(fitting.defaultPrevented, false); assert.equal(console.scrollLeft, 0);
    console.scrollWidth = 1500; console.scrollLeft = 100;
    const range = console.querySelector('.song-inspector-level')!.querySelector('input')!;
    const edit = range.emit('wheel', { deltaY: 40 });
    assert.equal(f.song.read().body!.tracks[0]!.clips[0]!.level, .99);
    console.emit('wheel', { target: range, deltaY: 40, defaultPrevented: edit.defaultPrevented }); assert.equal(console.scrollLeft, 100, 'range changes never turn into console navigation');
    const editedToken = f.library.currentToken(); f.workspace.dispose();
    const late = wheel(); assert.equal(console.scrollLeft, 100); assert.equal(late.defaultPrevented, false); assert.equal(f.library.currentToken(), editedToken);
  } finally { f.cleanup(); }
});



async function settlePlaylistAudio(): Promise<void> { for (let index = 0; index < 15; index++) await Promise.resolve(); }

test('Backspace refreshes playing audio and an undo while paused stays paused until resuming', async () => {
  const plans: SoundSequencePlan[] = [];
  const session = { id: 'playlist-undo', status: 'playing' as const, startedAtSeconds: 0 };
  const sound = { subscribe: () => () => {}, stop() {}, stopAll() {}, position: () => 0,
    async preview(plan: SoundSequencePlan) { plans.push(plan); return session; },
    update(_id: string, plan: SoundSequencePlan) { plans.push(plan); return session; },
    pause() { return { ...session, status: 'paused' as const }; },
    async resume(_id: string, plan: SoundSequencePlan) { plans.push(plan); return session; },
  } as unknown as SoundRuntimePort;
  const f = fixture({ sound }); try {
    f.root.querySelector('.song-play')!.emit('click'); await settlePlaylistAudio();
    const initial = plans[0]!.events;
    f.viewport.emit('pointerdown', { target: f.block(f.ids[0]!), clientX: 40, clientY: 52 }); f.document.emit('pointerup');
    f.document.emit('keydown', { target: f.viewport, key: 's' }); await settlePlaylistAudio(); assert.notDeepEqual(plans.at(-1)!.events, initial);
    f.document.emit('keydown', { target: f.viewport, key: 'Backspace' }); await settlePlaylistAudio();
    assert.deepEqual(plans.at(-1)!.events, initial); assert.equal(f.root.querySelector('.song-play')!.attributes.get('aria-label'), '暂停');
    f.document.emit('keydown', { target: f.viewport, key: 's' }); await settlePlaylistAudio();
    f.root.querySelector('.song-play')!.emit('click'); await settlePlaylistAudio();
    const pausedPlanCount = plans.length;
    f.document.emit('keydown', { target: f.viewport, key: 'Backspace' }); await settlePlaylistAudio();
    assert.equal(f.song.read().body!.tracks[0]!.clips[0]!.level ?? 1, 1); assert.equal(plans.length, pausedPlanCount);
    assert.equal(f.root.querySelector('.song-play')!.attributes.get('aria-label'), '播放');
    f.root.querySelector('.song-play')!.emit('click'); await settlePlaylistAudio(); assert.deepEqual(plans.at(-1)!.events, initial);
  } finally { f.cleanup(); }
});

test('live clip drag and eraser previews update audio without persisting provisional changes; cancellation restores it', async () => {
  const plans: SoundSequencePlan[] = [];
  const session = { id: 'playlist-test', status: 'playing' as const, startedAtSeconds: 0 };
  const sound = { subscribe: () => () => {}, stop() {}, stopAll() {}, position: () => 0,
    async preview(plan: SoundSequencePlan) { plans.push(plan); return session; },
    update(_id: string, plan: SoundSequencePlan) { plans.push(plan); return session; },
  } as unknown as SoundRuntimePort;
  const f = fixture({ sound });
  try {
    const originalBody = f.song.read().body!;
    f.root.querySelector('.song-play')!.emit('click'); await settlePlaylistAudio(); assert.equal(plans.length, 1);
    const initialTimes = plans[0]!.events.map(event => event.atSeconds);
    f.viewport.emit('pointerdown', { target: f.block(f.ids[0]!), clientX: 40, clientY: 52 });
    f.document.emit('pointermove', { clientX: 153, clientY: 52 + 3 * 60 }); f.flushFrames(); await settlePlaylistAudio();
    assert.deepEqual(f.song.read().body, originalBody);
    assert(plans.at(-1)!.events.some(event => Math.abs(event.atSeconds - 113 / 88) < 1e-10));
    f.document.emit('pointercancel'); await settlePlaylistAudio();
    assert.deepEqual(plans.at(-1)!.events.map(event => event.atSeconds), initialTimes);
    const beforeGrid = plans.length;
    f.viewport.emit('pointerdown', { target: f.viewport, clientX: 800, clientY: 150 });
    f.document.emit('pointermove', { clientX: 900, clientY: 150 }); f.flushFrames(); f.document.emit('pointerup'); await settlePlaylistAudio();
    assert.equal(plans.length, beforeGrid);
    assert.equal(plans.at(-1)!.transport!.positionSeconds, 0);
    f.viewport.emit('pointerdown', { target: f.root.querySelector('.song-playhead-handle'), clientX: 0, clientY: 15 }); f.document.emit('pointerup'); await settlePlaylistAudio();
    f.viewport.emit('pointerdown', { button: 2, clientX: 5, clientY: 52 });
    f.document.emit('pointermove', { clientX: 600, clientY: 52 }); f.flushFrames(); await settlePlaylistAudio();
    assert.equal(f.song.read().body!.tracks[0]!.clips.length, 3); assert.equal(plans.at(-1)!.events.length, 1);
    f.document.emit('pointercancel'); await settlePlaylistAudio(); assert.equal(plans.at(-1)!.events.length, 4);
    f.viewport.emit('pointerdown', { target: f.block(f.ids[0]!), clientX: 40, clientY: 52 });
    f.document.emit('pointermove', { clientX: 153, clientY: 52 + 3 * 60 }); f.flushFrames(); f.document.emit('pointerup'); await settlePlaylistAudio();
    assert.equal(f.song.read().body!.tracks[3]!.clips[0]!.id, f.ids[0]);
    f.song.undo(); assert.equal(f.song.read().body!.tracks[0]!.clips.some(clip => clip.id === f.ids[0]), true);
  } finally { f.cleanup(); }
});


test('negative scroll, pointer zoom and drops behind row controls cannot cross song zero', () => {
  const f = fixture(); try {
    const initial = f.block(f.ids[1]!).style.left;
    f.viewport.emit('wheel', { deltaX: 0, deltaY: -5000, clientX: 400, clientY: 100 }); f.flushFrames();
    assert.equal(f.block(f.ids[1]!).style.left, initial);
    f.viewport.emit('wheel', { deltaX: 0, deltaY: 1000, ctrlKey: true, clientX: 900, clientY: 100 }); f.flushFrames();
    assert(Number.parseFloat(f.block(f.ids[0]!).style.left!) >= 0);
    assert.equal(f.root.querySelector('.song-ruler')!.querySelectorAll('span').length, 0);
    const content = f.root.querySelector('.song-timeline')!;
    content.getBoundingClientRect = () => ({ left: 144, top: 28, width: 856, height: 700 });
    const transfer = { types: ['application/x-rootsound-phrase'], getData: () => f.phraseId };
    f.viewport.emit('drop', { clientX: 120, clientY: 80, dataTransfer: transfer });
    assert.equal(f.song.read().body!.tracks.flatMap(track => track.clips).length, 4);
  } finally { f.cleanup(); }
});

test('clip drag keeps the same nodes and follows continuous raw XY with fine unsnapped placement', () => {
  const f = fixture(); try {
    const id = f.ids[0]!;
    f.viewport.emit('pointerdown', { target: f.block(id), clientX: 20, clientY: 52 });
    const block = f.block(id); const before = f.song.read().body;
    f.document.emit('pointermove', { clientX: 67, clientY: 83 }); f.flushFrames();
    assert.equal(f.block(id), block); assert.equal(block.style.transform, 'translate(47px, 31px)');
    f.document.emit('pointermove', { clientX: 68.25, clientY: 84.5 }); f.flushFrames();
    assert.equal(f.block(id), block); assert.equal(block.style.transform, 'translate(48.25px, 32.5px)');
    assert.deepEqual(f.song.read().body, before);
    f.document.emit('pointerup');
    assert(Math.abs(f.song.read().body!.tracks[0]!.clips.find(clip => clip.id === id)!.startBeat - 48.25 / 88 * 2) < 1e-12);
    assert.equal(f.block(id).style.top, '4px');
  } finally { f.cleanup(); }
});

test('row name, color and double-click deletion affect exactly that row and retain its reusable phrases', () => {
  const f = fixture(); try {
    assert.equal(f.song.read().body!.tracks[0]!.name, '行1');
    const name = f.root.querySelector('.song-row-name')!; name.emit('dblclick'); name.value = '鼓组'; name.blur();
    assert.equal(f.song.read().body!.tracks[0]!.name, '鼓组');
    f.root.querySelector('.song-row-color')!.emit('click');
    const dialog = f.root.querySelector('.song-color-dialog')!; dialog.querySelectorAll('.song-color-swatch')[2]!.emit('click');
    assert.equal(f.song.read().body!.tracks[0]!.color, '#f43f8d');
    assert.equal(f.root.querySelector('.song-track')!.style.backgroundColor, '#f43f8d16');
    f.root.querySelector('.song-row-delete')!.emit('click');
    assert.equal(f.song.read().body!.tracks.length, 7); assert(f.root.querySelector('.song-row-delete')!.classList.contains('is-armed'));
    f.root.querySelector('.song-row-delete')!.emit('click');
    assert.equal(f.song.read().body!.tracks.length, 7, 'a populated row also requires a clear confirmation');
    f.root.querySelector('.song-row-delete-confirm')!.emit('click');
    assert.equal(f.song.read().body!.tracks.length, 6); assert(!f.song.read().body!.tracks.some(track => track.id === f.track));
    assert.deepEqual(f.retained, [[f.phraseId]]);
    f.song.undo(); assert.equal(f.song.read().body!.tracks[0]!.clips.length, 3);
  } finally { f.cleanup(); }
});

test('row drag smoothly displaces neighbors without provisional writes, then commits one complete reorder', () => {
  const f = fixture(); try {
    const controls = f.root.querySelectorAll('.song-row-control'); const order = f.song.read().body!.tracks.map(track => track.id);
    f.viewport.emit('pointerdown', { target: controls[0], clientX: 10, clientY: 50 });
    const active = f.root.querySelectorAll('.song-row-control')[0]!;
    f.document.emit('pointermove', { clientX: 10, clientY: 181.5 }); f.flushFrames();
    assert.equal(f.root.querySelectorAll('.song-row-control')[0], active); assert.equal(active.style.transform, 'translate(0px, 131.5px)');
    assert.equal(f.root.querySelectorAll('.song-row-control')[1]!.style.transform, 'translateY(-60px)');
    assert.deepEqual(f.song.read().body!.tracks.map(track => track.id), order);
    f.document.emit('pointerup', { clientX: 10, clientY: 181.5 });
    assert.deepEqual(f.song.read().body!.tracks.map(track => track.id), [order[1], order[2], order[0], ...order.slice(3)]);
    assert.equal(f.song.read().body!.tracks[2]!.clips.length, 3);
    assert.equal(f.root.querySelectorAll('.song-row-control')[2]!.animations[0]![0]!.transform, 'translate(0px, 11.5px)');
    f.song.undo(); assert.deepEqual(f.song.read().body!.tracks.map(track => track.id), order);
  } finally { f.cleanup(); }
});

test('row swipes follow both axes within the control-column width and fade the trash more slowly than the grid', () => {
  const f = fixture(); try {
    const before = structuredClone(f.song.read().draft); const token = f.library.currentToken();
    const controls = f.root.querySelectorAll('.song-row-control'); const active = controls[0]!;
    f.viewport.emit('pointerdown', { target: active, clientX: 10, clientY: 50 });
    f.document.emit('pointermove', { clientX: 106, clientY: 51 });
    const trash = f.root.querySelector('.song-row-trash')!;
    const grid = f.root.querySelector('.song-grid-lines')!;
    assert.equal(trash.hidden, false); assert.equal(trash.style.opacity, '0.25');
    assert.equal(trash.style.top, '1px'); assert.equal(trash.style.transform, undefined);
    assert.equal(active.style.transform, 'translate(72px, 1px)');
    assert.equal(grid.style.maskImage, 'linear-gradient(to bottom, #000 0px, #000 1px, rgba(0, 0, 0, 0.5) 1px, rgba(0, 0, 0, 0.5) 61px, #000 61px, #000 100%)');
    assert.equal(controls[1]!.style.transform, 'translateY(0px)');
    f.document.emit('pointermove', { clientX: 212.5, clientY: 270 });
    assert.equal(active.style.transform, 'translate(144px, 220px)', 'rightward motion stops at one control-column width while vertical movement continues');
    assert.equal(trash.style.opacity, '1'); assert(trash.classList.contains('is-armed'));
    assert.match(grid.style.maskImage!, /rgba\(0, 0, 0, 0\) 220px/u);
    assert.deepEqual(f.song.read().draft, before); assert.equal(f.library.currentToken(), token);
    f.document.emit('pointermove', { clientX: 149, clientY: 50 });
    assert.equal(trash.classList.contains('is-armed'), false); assert(Number(trash.style.opacity) < 1);
    f.document.emit('pointerup', { clientX: 149, clientY: 50 });
    assert.equal(trash.hidden, true); assert.equal(active.style.transform, '');
    assert.equal(grid.style.maskImage, '');
    assert.equal(f.root.querySelector('.song-row-delete-dialog'), undefined);
    assert.deepEqual(f.song.read().draft, before); assert.equal(f.library.currentToken(), token);
    assert.deepEqual(f.retained, []);
    f.viewport.emit('pointerdown', { target: active, clientX: 10, clientY: 50 });
    f.document.emit('pointermove', { clientX: 210, clientY: 50 });
    f.document.emit('pointerup', { clientX: 149, clientY: 50 });
    assert.equal(f.root.querySelector('.song-row-delete-dialog'), undefined, 'release below the threshold also disarms when its final move event was coalesced');
    assert.deepEqual(f.song.read().draft, before); assert.equal(f.library.currentToken(), token);
  } finally { f.cleanup(); }
});

test('an armed empty row deletes only on release, with its whole deletion kept in one reversible edit', () => {
  const f = fixture(); try {
    const track = f.song.read().body!.tracks[2]!; const before = structuredClone(f.song.read().draft); const beforeClips = structuredClone(f.song.read().body!.tracks.flatMap(item => item.clips));
    const token = f.library.currentToken(); const row = f.root.querySelectorAll('.song-row-control').find(control => control.dataset.trackId === track.id)!;
    f.viewport.emit('pointerdown', { target: row, clientX: 15, clientY: 175 });
    f.document.emit('pointermove', { clientX: 207, clientY: 175 });
    assert.equal(f.song.read().body!.tracks.length, 7); assert.equal(f.library.currentToken(), token);
    assert(f.root.querySelector('.song-row-trash')!.classList.contains('is-armed'));
    f.document.emit('pointerup', { clientX: 207, clientY: 175 });
    assert.equal(f.root.querySelector('.song-row-delete-dialog'), undefined);
    assert.equal(f.song.read().body!.tracks.length, 6); assert(!f.song.read().body!.tracks.some(item => item.id === track.id));
    assert.deepEqual(f.song.read().body!.tracks.flatMap(item => item.clips), beforeClips);
    f.song.undo(); assert.deepEqual(f.song.read().draft, before);
  } finally { f.cleanup(); }
});

test('horizontal row dragging runs at three quarters pointer speed while vertical movement and release safety remain unchanged', () => {
  const f = fixture(); try {
    const track = f.song.read().body!.tracks[2]!; const before = structuredClone(f.song.read().draft); const token = f.library.currentToken();
    const row = f.root.querySelectorAll('.song-row-control').find(control => control.dataset.trackId === track.id)!;
    const trash = f.root.querySelector('.song-row-trash')!;
    f.viewport.emit('pointerdown', { target: row, clientX: 10, clientY: 175 });
    f.document.emit('pointermove', { clientX: 110, clientY: 200 });
    assert.equal(row.style.transform, 'translate(75px, 25px)');
    f.document.emit('pointermove', { clientX: 110.5, clientY: 200.5 });
    assert.equal(row.style.transform, 'translate(75.375px, 25.5px)', 'fractional movement stays continuous on both axes');
    f.document.emit('pointermove', { clientX: 154, clientY: 175 });
    assert.equal(row.style.transform, 'translate(108px, 0px)'); assert(!trash.classList.contains('is-armed'));
    f.document.emit('pointermove', { clientX: 202, clientY: 175 });
    assert.equal(row.style.transform, 'translate(144px, 0px)'); assert(trash.classList.contains('is-armed'));
    f.document.emit('pointerup', { clientX: 154, clientY: 175 });
    assert.deepEqual(f.song.read().draft, before); assert.equal(f.library.currentToken(), token);
    assert.equal(row.style.transform, ''); assert.equal(f.root.querySelector('.song-grid-lines')!.style.maskImage, '');
  } finally { f.cleanup(); }
});

test('normal and narrow columns bound diagonal drags and require the actual release to reach the right edge', () => {
  for (const width of [144, 116]) {
    const f = fixture(); try {
      f.root.querySelector('.song-row-controls')!.clientWidth = width;
      const track = f.song.read().body!.tracks[2]!; const before = structuredClone(f.song.read().draft); const token = f.library.currentToken();
      const row = f.root.querySelectorAll('.song-row-control').find(control => control.dataset.trackId === track.id)!;
      const trash = f.root.querySelector('.song-row-trash')!;
      f.viewport.emit('pointerdown', { target: row, clientX: 20, clientY: 170 });
      f.document.emit('pointermove', { clientX: -300, clientY: 179.25 });
      assert.equal(row.style.transform, 'translate(0px, 9.25px)'); assert.equal(trash.hidden, true);
      f.document.emit('pointermove', { clientX: 20 + width / 1.5, clientY: 179.25 });
      assert.equal(trash.style.opacity, '0.25'); assert.equal(trash.classList.contains('is-armed'), false);
      f.document.emit('pointermove', { clientX: 2000, clientY: 179.25 });
      assert.equal(row.style.transform, `translate(${width}px, 9.25px)`); assert.equal(trash.style.opacity, '1');
      assert(trash.classList.contains('is-armed')); assert.deepEqual(f.song.read().draft, before); assert.equal(f.library.currentToken(), token);
      f.document.emit('pointerup', { clientX: 20 + (width - .25) / .75, clientY: 170 });
      assert.deepEqual(f.song.read().draft, before); assert.equal(f.library.currentToken(), token);
      assert.equal(f.root.querySelector('.song-grid-lines')!.style.maskImage, '');
      f.viewport.emit('pointerdown', { target: row, clientX: 20, clientY: 170 });
      f.document.emit('pointermove', { clientX: 20 + width / 1.5, clientY: 240 });
      f.document.emit('pointerup', { clientX: 20 + width / .75, clientY: 240 });
      assert(!f.song.read().body!.tracks.some(item => item.id === track.id), 'the full diagonal release deletes the source row, not its proposed destination');
      assert.equal(f.root.querySelector('.song-row-delete-dialog'), undefined);
      f.song.undo(); assert.deepEqual(f.song.read().draft, before);
    } finally { f.cleanup(); }
  }
});

test('diagonal reorder settles both axes and keeps a single reversible edit', () => {
  const f = fixture(); try {
    const before = structuredClone(f.song.read().draft); const token = f.library.currentToken();
    const row = f.root.querySelector('.song-row-control')!; const clip = f.block(f.ids[0]!);
    f.viewport.emit('pointerdown', { target: row, clientX: 10, clientY: 50 });
    f.document.emit('pointermove', { clientX: 45, clientY: 181.5 });
    assert.equal(row.style.transform, 'translate(26.25px, 131.5px)'); assert.equal(clip.style.transform, row.style.transform);
    assert.deepEqual(f.song.read().draft, before); assert.equal(f.library.currentToken(), token);
    f.document.emit('pointerup', { clientX: 45, clientY: 181.5 });
    assert.equal(f.song.read().body!.tracks[2]!.id, f.track);
    assert.equal(row.style.transform, ''); assert.equal(row.animations.at(-1)![0]!.transform, 'translate(26.25px, 11.5px)');
    assert.equal(clip.animations.at(-1)![0]!.transform, 'translate(26.25px, 11.5px)');
    assert.equal(f.root.querySelector('.song-grid-lines')!.style.maskImage, '');
    f.song.undo(); assert.deepEqual(f.song.read().draft, before);
  } finally { f.cleanup(); }
});

test('resizing the control column during a drag re-clamps its right edge and leaves no grid mask after disposal', () => {
  const f = fixture(); try {
    const controls = f.root.querySelector('.song-row-controls')!; const row = f.root.querySelector('.song-row-control')!;
    const grid = f.root.querySelector('.song-grid-lines')!; const before = structuredClone(f.song.read().draft); const token = f.library.currentToken();
    f.viewport.emit('pointerdown', { target: row, clientX: 10, clientY: 50 });
    f.document.emit('pointermove', { clientX: 202, clientY: 72.5 }); assert.equal(row.style.transform, 'translate(144px, 22.5px)');
    controls.clientWidth = 116;
    // The next movement uses the changed layout without recreating nodes.
    f.document.emit('pointermove', { clientX: 202, clientY: 72.5 });
    assert.equal(row.style.transform, 'translate(116px, 22.5px)'); assert.match(grid.style.maskImage!, /rgba\(0, 0, 0, 0\) 22.5px/u);
    f.workspace.dispose(); assert.equal(grid.style.maskImage, ''); assert.equal(row.style.transform, '');
    assert.deepEqual(f.song.read().draft, before); assert.equal(f.library.currentToken(), token);
  } finally { f.cleanup(); }
});

test('canceling a populated row swipe restores the earlier clip selection and leaves music and ongoing playback untouched', async () => {
  let previews = 0; let updates = 0; let stopped = 0;
  const sound = { subscribe: () => () => {}, stop() { stopped++; }, stopAll() {}, position: () => 0,
    async preview() { previews++; return { id: 'row-cancel-playback', status: 'playing' as const, startedAtSeconds: 0 }; },
    update() { updates++; return { id: 'row-cancel-playback', status: 'playing' as const, startedAtSeconds: 0 }; } } as unknown as SoundRuntimePort;
  const f = fixture({ sound }); try {
    f.viewport.emit('pointerdown', { target: f.block(f.ids[1]!), clientX: 200, clientY: 52 }); f.document.emit('pointerup');
    f.root.querySelector('.song-play')!.emit('click'); await settlePlaylistAudio();
    const before = structuredClone(f.song.read().draft); const token = f.library.currentToken(); const calls = [previews, updates, stopped];
    f.viewport.emit('pointerdown', { target: f.root.querySelector('.song-row-control'), clientX: 10, clientY: 50 });
    f.document.emit('pointermove', { clientX: 210, clientY: 50 }); f.document.emit('pointerup', { clientX: 210, clientY: 50 });
    const dialog = f.root.querySelector('.song-row-delete-dialog')!; assert(dialog);
    assert.match(dialog.querySelector('p')!.textContent, /3 个乐句片段/u); assert.match(dialog.querySelector('p')!.textContent, /原乐句会保留/u);
    assert.deepEqual(f.song.read().draft, before); assert.equal(f.library.currentToken(), token);
    dialog.querySelector('.song-row-delete-cancel')!.emit('click');
    assert.equal(f.root.querySelector('.song-row-delete-dialog'), undefined);
    assert(f.block(f.ids[1]!).classList.contains('is-selected')); assert(!f.block(f.ids[0]!).classList.contains('is-selected'));
    assert(!f.root.querySelector('.song-row-control')!.classList.contains('is-selected'));
    assert.deepEqual(f.song.read().draft, before); assert.equal(f.library.currentToken(), token);
    assert.deepEqual([previews, updates, stopped], calls); assert.equal(f.root.querySelector('.song-play')!.attributes.get('aria-label'), '暂停');
    assert.deepEqual(f.retained, []);
  } finally { f.cleanup(); }
});

test('confirming a populated row removes its occurrences but retains reusable phrases, and undo restores the complete row', () => {
  const f = fixture(); try {
    const before = structuredClone(f.song.read().draft);
    f.viewport.emit('pointerdown', { target: f.root.querySelector('.song-row-control'), clientX: 10, clientY: 50 });
    f.document.emit('pointermove', { clientX: 230, clientY: 52 }); f.document.emit('pointerup', { clientX: 230, clientY: 52 });
    f.root.querySelector('.song-row-delete-confirm')!.emit('click');
    assert(!f.song.read().body!.tracks.some(track => track.id === f.track)); assert.deepEqual(f.retained, [[f.phraseId]]);
    assert(f.library.readContent(f.phraseId)); assert.equal(f.song.read().body!.tracks[0]!.id, f.otherTrack);
    f.song.undo(); assert.deepEqual(f.song.read().draft, before);
  } finally { f.cleanup(); }
});

test('diagonal row reorders retain both coordinates and horizontal return avoids deletion in a scrolled viewport', () => {
  const f = fixture(); try {
    const content = f.root.querySelector('.song-timeline')!; content.clientHeight = 180;
    f.viewport.emit('wheel', { target: f.root.querySelector('.song-row-controls'), deltaY: 60 }); f.flushFrames();
    const before = f.song.read().body!.tracks.map(track => track.id); const row = f.root.querySelector('.song-row-control')!;
    f.viewport.emit('pointerdown', { target: row, clientX: 10, clientY: 50 });
    f.document.emit('pointermove', { clientX: 24, clientY: 70 });
    f.document.emit('pointermove', { clientX: 90, clientY: 110 });
    assert.equal(row.style.transform, 'translate(60px, 60px)'); assert.equal(f.root.querySelector('.song-row-trash')!.hidden, false);
    f.document.emit('pointermove', { clientX: -30, clientY: 110 });
    assert.equal(row.style.transform, 'translate(0px, 60px)'); assert.equal(f.root.querySelector('.song-row-trash')!.hidden, true);
    assert.equal(f.root.querySelector('.song-grid-lines')!.style.maskImage, '');
    f.document.emit('pointerup', { clientX: -30, clientY: 110 });
    assert.deepEqual(f.song.read().body!.tracks.map(track => track.id), [before[0], before[2], before[1], ...before.slice(3)]);
    assert.equal(f.root.querySelector('.song-row-delete-dialog'), undefined);
    f.song.undo(); assert.deepEqual(f.song.read().body!.tracks.map(track => track.id), before);
  } finally { f.cleanup(); }
});

test('cancel, lost capture, Escape, wheel and saving cannot commit an armed row swipe without pointer release', async () => {
  for (const end of ['pointercancel', 'lostpointercapture', 'Escape', 'wheel', 'save', 'refresh'] as const) {
    const f = fixture(); try {
      const emptyId = f.song.read().body!.tracks[2]!.id;
      const row = f.root.querySelectorAll('.song-row-control').find(control => control.dataset.trackId === emptyId)!;
      const token = f.library.currentToken(); const before = structuredClone(f.song.read().body);
      f.viewport.emit('pointerdown', { target: row, clientX: 10, clientY: 170 });
      f.document.emit('pointermove', { clientX: 230, clientY: 240 });
      if (end === 'lostpointercapture') f.viewport.emit(end);
      else if (end === 'Escape') f.document.emit('keydown', { target: f.viewport, key: 'Escape' });
      else if (end === 'wheel') f.viewport.emit('wheel', { deltaY: 15 });
      else if (end === 'save') { f.root.querySelector('.song-save')!.emit('click'); await settlePlaylistAudio(); }
      else if (end === 'refresh') f.workspace.refresh();
      else f.document.emit(end);
      f.document.emit('pointerup');
      assert.deepEqual(f.song.read().body, before, end); assert.equal(f.root.querySelector('.song-row-delete-dialog'), undefined, end);
      assert.equal(f.root.querySelector('.song-row-trash')!.hidden, true, end);
      assert.equal(f.root.querySelector('.song-grid-lines')!.style.maskImage, '', end);
      if (end !== 'save') assert.equal(f.library.currentToken(), token, end);
    } finally { f.cleanup(); }
  }
});

test('a pending row delete refuses concurrent new clips and stale confirmations after disposal', () => {
  const f = fixture(); try {
    f.viewport.emit('pointerdown', { target: f.root.querySelector('.song-row-control'), clientX: 10, clientY: 50 });
    f.document.emit('pointermove', { clientX: 210, clientY: 50 }); f.document.emit('pointerup', { clientX: 210, clientY: 50 });
    const confirm = f.root.querySelector('.song-row-delete-confirm')!;
    const newClip = f.song.addClip(f.track, f.phraseId, 16); const changed = structuredClone(f.song.read().draft); const token = f.library.currentToken();
    confirm.emit('click'); assert.equal(confirm.disabled, true); assert.match(f.root.querySelector('.song-library-delete-error')!.textContent, /已发生变化/u);
    assert(f.song.read().body!.tracks[0]!.clips.some(clip => clip.id === newClip)); assert.deepEqual(f.song.read().draft, changed); assert.equal(f.library.currentToken(), token);
    f.workspace.dispose(); confirm.emit('click');
    assert.equal(f.root.querySelector('.song-row-delete-dialog'), undefined); assert.deepEqual(f.song.read().draft, changed); assert.equal(f.library.currentToken(), token);
  } finally { f.cleanup(); }
});

test('selected row shortcuts batch mix changes and double taps move exactly one visual beat from the first tap origin', () => {
  const f = fixture(); try {
    f.viewport.emit('pointerdown', { target: f.root.querySelector('.song-row-control'), clientX: 5, clientY: 52 }); f.document.emit('pointerup');
    f.document.emit('keydown', { target: f.viewport, key: 'e' }); f.document.emit('keydown', { target: f.viewport, key: 's' });
    assert.equal(f.song.read().body!.tracks[0]!.panOffset, .05); assert.equal(f.song.read().body!.tracks[0]!.level, .75);
    assert(f.song.read().body!.tracks[0]!.clips.every(clip => clip.pan === undefined && clip.level === undefined));
    assert.equal(f.song.read().body!.tracks[1]!.clips[0]!.pan, undefined);
    f.song.undo(); assert.equal(f.song.read().body!.tracks[0]!.level, .8); f.workspace.refresh();
    const tempo = f.root.querySelectorAll('input').find(input => input.attributes.get('aria-label') === '网格 BPM')!; tempo.value = '90'; tempo.emit('input');
    const before = f.song.read().body!.tracks[0]!.clips.map(clip => clip.startBeat);
    f.document.emit('keydown', { target: f.viewport, key: 'd' });
    f.song.read().body!.tracks[0]!.clips.forEach((clip, index) => assert(Math.abs(clip.startBeat - before[index]! - .05) < 1e-10));
    f.document.emit('keydown', { target: f.viewport, key: 'd' });
    f.song.read().body!.tracks[0]!.clips.forEach((clip, index) => assert(Math.abs(clip.startBeat - before[index]! - 4 / 3) < 1e-10));
    f.document.emit('keydown', { target: f.viewport, key: 'a' }); f.document.emit('keydown', { target: f.viewport, key: 'a' });
    assert(Math.abs(Math.min(...f.song.read().body!.tracks[0]!.clips.map(clip => clip.startBeat))) < 1e-10);
  } finally { f.cleanup(); }
});

test('playhead dragging seeks during playback, clock follows it and stop returns to zero', async () => {
  const plans: SoundSequencePlan[] = []; const session = { id: 'seek', status: 'playing' as const, startedAtSeconds: 0 };
  const sound = { subscribe: () => () => {}, stop() {}, stopAll() {}, position: () => 0,
    async preview(plan: SoundSequencePlan) { plans.push(plan); return session; }, update(_id: string, plan: SoundSequencePlan) { plans.push(plan); return session; } } as unknown as SoundRuntimePort;
  const f = fixture({ sound }); try {
    f.root.querySelector('.song-play')!.emit('click'); await settlePlaylistAudio();
    f.viewport.emit('pointerdown', { target: f.root.querySelector('.song-playhead-handle'), clientX: 220, clientY: 15 });
    f.document.emit('pointermove', { clientX: 264, clientY: 15 }); f.flushFrames(); f.document.emit('pointerup'); await settlePlaylistAudio();
    assert.equal(plans.at(-1)!.transport!.positionSeconds, 3);
    assert.equal(f.root.querySelector('.song-clock')!.textContent, '00:03.000');
    f.root.querySelector('.song-stop')!.emit('click'); assert.equal(f.root.querySelector('.song-clock')!.textContent, '00:00.000');
    assert.equal(f.root.querySelector('.song-play')!.attributes.get('aria-label'), '播放');
  } finally { f.cleanup(); }
});

test('BPM edit starts at the playhead and preserves all grid columns before that boundary', () => {
  const f = fixture(); try {
    const columns = () => f.root.querySelector('.song-grid-lines')!.children.map(item => Number.parseFloat(item.style.left!));
    const before = columns().filter(x => x < 264);
    f.viewport.emit('pointerdown', { target: f.root.querySelector('.song-playhead-handle'), clientX: 264, clientY: 10 }); f.document.emit('pointerup');
    const tempo = f.root.querySelectorAll('input').find(input => input.attributes.get('aria-label') === '网格 BPM')!; tempo.focus(); tempo.value = '90'; tempo.emit('input'); tempo.blur();
    assert.deepEqual(f.song.read().body!.gridTempoChanges, [{ atSeconds: 3, tempoBpm: 90 }]);
    assert.deepEqual(columns().filter(x => x < 264), before);
    assert(columns().some(x => Math.abs(x - (3 + 2 / 3) * 88) < 1e-8));
    assert.equal(f.song.read().body!.tempoBpm, 120); assert.equal(f.song.read().body!.gridOffsetSeconds, undefined);
  } finally { f.cleanup(); }
});

test('an empty phrase shelf covers the playlist and highlights its create tile', () => {
  const f = fixture({ phrases: () => [] }); try {
    const curtain = f.root.querySelector('.song-empty-curtain')!; assert(curtain);
    assert.equal(curtain.querySelector('p')!.textContent, '先创建乐句吧'); assert.equal(curtain.querySelector('span')!.textContent, '←');
    assert(f.root.querySelector('.song-new-phrase')!.classList.contains('is-highlighted'));
    const before = f.song.read().body;
    f.viewport.emit('pointerdown', { target: curtain, button: 2, clientX: 10, clientY: 50 }); f.document.emit('pointerup');
    assert.deepEqual(f.song.read().body, before);
  } finally { f.cleanup(); }
});


test('a single name click selects the row, a captured double click renames it, and a drag reorders it', () => {
  const f = fixture(); try {
    let name = f.root.querySelector('.song-row-name')!;
    f.viewport.emit('pointerdown', { target: name, clientX: 30, clientY: 50 }); f.document.emit('pointerup');
    assert.equal(f.root.querySelector('.song-row-name'), name);
    assert.equal((name as unknown as {readOnly:boolean}).readOnly, true);
    assert.equal(f.document.activeElement, f.viewport);
    assert(f.root.querySelector('.song-row-control')!.classList.contains('is-selected'));
    f.document.emit('keydown', { target: f.viewport, key: 'e' });
    assert.equal(f.song.read().body!.tracks[0]!.panOffset, .05);
    name = f.root.querySelector('.song-row-name')!;
    f.viewport.emit('pointerdown', { target: name, clientX: 30, clientY: 50 }); f.document.emit('pointerup');
    assert.equal((name as unknown as {readOnly:boolean}).readOnly, true);
    f.viewport.emit('pointerdown', { target: name, clientX: 30, clientY: 50 }); f.document.emit('pointerup');
    f.viewport.emit('dblclick', { target: f.viewport, clientX: 30, clientY: 50 });
    assert.equal((name as unknown as {readOnly:boolean}).readOnly, false);
    name.blur(); name = f.root.querySelector('.song-row-name')!;
    f.viewport.emit('pointerdown', { target: name, clientX: 30, clientY: 50 });
    f.document.emit('pointermove', { clientX: 30, clientY: 115 }); f.flushFrames(); f.document.emit('pointerup', { clientX: 30, clientY: 115 });
    assert.equal(f.song.read().body!.tracks[1]!.id, f.track);
    assert(f.root.querySelectorAll('.song-row-name').every(item => (item as unknown as {readOnly:boolean}).readOnly));
  } finally { f.cleanup(); }
});

test('double-tap displacement uses the BPM shown at the head, even when the selected phrase is earlier', () => {
  const f = fixture(); try {
    f.song.setGridTempo(80, 3); f.workspace.refresh();
    f.viewport.emit('pointerdown', { target: f.root.querySelector('.song-playhead-handle'), clientX: 264, clientY: 15 }); f.document.emit('pointerup');
    f.viewport.emit('pointerdown', { target: f.block(f.ids[0]!), clientX: 40, clientY: 52 }); f.document.emit('pointerup');
    f.document.emit('keydown', { target: f.viewport, key: 'd' });
    assert.equal(f.song.read().body!.tracks[0]!.clips.find(clip => clip.id === f.ids[0])!.startBeat, .05);
    f.document.emit('keydown', { target: f.viewport, key: 'd' });
    assert.equal(f.song.read().body!.tracks[0]!.clips.find(clip => clip.id === f.ids[0])!.startBeat, 1.5);
    f.document.emit('keydown', { target: f.viewport, key: 'a' });
    assert(Math.abs(f.song.read().body!.tracks[0]!.clips.find(clip => clip.id === f.ids[0])!.startBeat - 1.45) < 1e-10);
    f.document.emit('keydown', { target: f.viewport, key: 'a' });
    assert.equal(f.song.read().body!.tracks[0]!.clips.find(clip => clip.id === f.ids[0])!.startBeat, 0);
  } finally { f.cleanup(); }
});

test('only A/D taps within 150ms trigger a beat; ordinary fast nudges and held repeats stay fine', () => {
  const realNow = Date.now; let now = 1000; Date.now = () => now;
  try {
    for (const row of [false, true]) for (const key of ['a', 'd']) for (const gap of [140, 150, 151, 200, 299]) {
      const f = fixture();
      try {
        // Keep leftward checks away from zero so a clamped result cannot conceal a beat jump.
        const refs = row ? f.song.read().body!.tracks[0]!.clips : [f.song.read().body!.tracks[0]!.clips[0]!];
        for (const clip of refs) f.song.moveClip(f.track, clip.id, f.track, clip.startBeat + 4);
        f.workspace.refresh();
        f.viewport.emit('pointerdown', { target: row ? f.root.querySelector('.song-row-control') : f.block(f.ids[0]!), clientX: 200, clientY: 52 });
        f.document.emit('pointerup');
        const before = new Map(f.song.read().body!.tracks[0]!.clips.map(clip => [clip.id, clip.startBeat]));
        f.document.emit('keydown', { target: f.viewport, key }); now += gap;
        f.document.emit('keydown', { target: f.viewport, key });
        const expected = (key === 'a' ? -1 : 1) * (gap <= 150 ? 1 : .1);
        const after = f.song.read().body!.tracks[0]!.clips;
        after.forEach(clip => assert(Math.abs(clip.startBeat - before.get(clip.id)! - (row || clip.id === f.ids[0] ? expected : 0)) < 1e-10,
          `${row ? 'row' : 'clip'} ${key} ${gap}ms`));
        now += 1000;
      } finally { f.cleanup(); }
    }
    const f = fixture();
    try {
      f.viewport.emit('pointerdown', { target: f.block(f.ids[0]!), clientX: 20, clientY: 52 }); f.document.emit('pointerup');
      f.document.emit('keydown', { target: f.viewport, key: 'd' }); now += 100;
      f.document.emit('keydown', { target: f.viewport, key: 'd', repeat: true });
      assert(Math.abs(f.song.read().body!.tracks[0]!.clips.find(clip => clip.id === f.ids[0])!.startBeat - .1) < 1e-10);
    } finally { f.cleanup(); }
  } finally { Date.now = realNow; }
});


test('dragging the head commits and leaves a focused BPM field before starting a new tempo section', () => {
  const f = fixture(); try {
    f.viewport.emit('pointerdown', { target: f.root.querySelector('.song-playhead-handle'), clientX: 88, clientY: 15 }); f.document.emit('pointerup');
    const tempo = f.root.querySelectorAll('input').find(input => input.attributes.get('aria-label') === '网格 BPM')!;
    tempo.focus(); tempo.value = '100'; tempo.emit('input');
    assert.equal(f.document.activeElement, tempo);
    f.viewport.emit('pointerdown', { target: f.root.querySelector('.song-playhead-handle'), clientX: 264, clientY: 15 }); f.document.emit('pointerup');
    assert.equal(f.document.activeElement, f.viewport);
    tempo.focus(); tempo.value = '90'; tempo.emit('input'); tempo.blur();
    assert.deepEqual(f.song.read().body!.gridTempoChanges, [{ atSeconds: 1, tempoBpm: 100 }, { atSeconds: 3, tempoBpm: 90 }]);
  } finally { f.cleanup(); }
});


test('scrolling retains the focused row-name editor and commits it when editing finishes', () => {
  const f = fixture(); try {
    const name = f.root.querySelector('.song-row-name')!; name.emit('dblclick'); name.value = '副歌鼓组';
    assert.equal(f.document.activeElement, name);
    f.viewport.emit('wheel', { deltaX: 0, deltaY: 100, clientX: 400, clientY: 100 }); f.flushFrames();
    assert.equal(f.song.read().body!.tracks[0]!.name, '行1', 'camera motion must not commit a musical edit');
    assert.equal(f.root.querySelector('.song-row-name'), name);
    assert.equal(name.value, '副歌鼓组'); assert.equal(f.document.activeElement, name);
    name.blur(); assert.equal(f.song.read().body!.tracks[0]!.name, '副歌鼓组');
  } finally { f.cleanup(); }
});

test('a focused row name is committed before its virtualized control scrolls out of view', () => {
  const f = fixture(); try {
    for (let index = 0; index < 14; index++) f.song.addTrack(); f.workspace.refresh();
    const name = f.root.querySelector('.song-row-name')!; const first = f.root.querySelector('.song-row-control')!;
    name.emit('dblclick'); name.value = '离屏前保留';
    f.viewport.emit('wheel', { deltaY: 660, shiftKey: true, clientX: 300, clientY: 100 }); f.flushFrames();
    assert.equal(f.song.read().body!.tracks[0]!.name, '离屏前保留');
    assert.notEqual(f.document.activeElement, name);
    f.viewport.emit('wheel', { deltaY: -660, shiftKey: true, clientX: 300, clientY: 100 }); f.flushFrames();
    assert.equal(f.root.querySelector('.song-row-control'), first);
    assert.equal(f.root.querySelector('.song-row-name'), name); assert.equal(name.value, '离屏前保留');
    f.document.emit('keydown', { target: f.viewport, key: 'Backspace' });
    assert.equal(f.song.read().body!.tracks[0]!.name, '行1'); assert.equal(name.value, '行1');
  } finally { f.cleanup(); }
});

test('cached offscreen row controls and returning clips reflect changed names, colors and mix flags', () => {
  const f = fixture(); try {
    for (let index = 0; index < 14; index++) f.song.addTrack(); f.workspace.refresh();
    const control = f.root.querySelector('.song-row-control')!;
    f.viewport.emit('pointerdown', { target: control, clientX: -20, clientY: 50 }); f.document.emit('pointerup');
    for (const enabled of [true, false]) {
      f.viewport.emit('wheel', { deltaY: 660, shiftKey: true, clientX: 300, clientY: 100 }); f.flushFrames();
      const color = enabled ? '#ff0000' : '#00ff00'; const title = enabled ? '更新后的行' : '再次更新';
      f.song.updateTrack(f.track, { name: title, color, solo: enabled, muted: enabled });
      f.shelf[0]!.name = `${title}乐句`;
      // A normal offscreen row edit synchronizes data without rebuilding the
      // workspace, retaining the same cached control across the round trip.
      f.document.emit('keydown', { target: f.viewport, key: enabled ? 'e' : 'q' });
      f.viewport.emit('wheel', { deltaY: -660, shiftKey: true, clientX: 300, clientY: 100 }); f.flushFrames();
      assert.equal(f.root.querySelector('.song-row-control'), control);
      assert.equal(control.querySelector('.song-row-name')!.value, title);
      assert.equal(control.querySelector('.song-row-color')!.style.background, color);
      assert.equal(control.querySelector('.song-row-solo')!.classList.contains('is-on'), enabled);
      assert.equal(control.querySelector('.song-row-mute')!.classList.contains('is-on'), enabled);
      assert.equal(f.block(f.ids[0]!).style.backgroundColor, color);
      assert.equal(f.block(f.ids[0]!).textContent, `${title}乐句`);
    }
  } finally { f.cleanup(); }
});


test('selecting another row commits the first name, and double-clicking focuses its current attached name', () => {
  const f = fixture(); try {
    const first = f.root.querySelectorAll('.song-row-name')[0]!; const second = f.root.querySelectorAll('.song-row-name')[1]!;
    first.emit('dblclick'); first.value = '第一组';
    f.viewport.emit('pointerdown', { target: second, clientX: 40, clientY: 110 }); f.document.emit('pointerup');
    assert.equal(f.song.read().body!.tracks[0]!.name, '第一组');
    const activeSecond = f.root.querySelectorAll('.song-row-name')[1]!;
    assert.equal((activeSecond as unknown as {readOnly:boolean}).readOnly, true);
    f.viewport.emit('pointerdown', { target: activeSecond, clientX: 40, clientY: 110 }); f.document.emit('pointerup');
    f.viewport.emit('dblclick', { target: f.viewport, clientX: 40, clientY: 110 });
    assert.equal(f.document.activeElement, activeSecond); assert.equal((activeSecond as unknown as {readOnly:boolean}).readOnly, false);
    assert(f.root.contains(activeSecond));
  } finally { f.cleanup(); }
});


test('name blur preserves neighboring button nodes so the pending color or delete click is delivered', () => {
  const f = fixture(); try {
    const color = f.root.querySelector('.song-row-color')!; const remove = f.root.querySelector('.song-row-delete')!;
    const name = f.root.querySelector('.song-row-name')!;
    name.emit('dblclick'); name.value = '主鼓组'; color.focus();
    assert.equal(f.song.read().body!.tracks[0]!.name, '主鼓组');
    assert.equal(f.root.querySelector('.song-row-color'), color); assert.equal(f.root.querySelector('.song-row-delete'), remove);
    color.emit('click'); assert.equal(f.root.querySelector('.song-color-dialog')!.querySelector('.song-color-title')!.textContent, '主鼓组');
    f.root.querySelector('.song-color-dialog')!.close();
    name.emit('dblclick'); name.value = '新鼓组'; remove.focus();
    assert.equal(f.root.querySelector('.song-row-delete'), remove); remove.emit('click');
    assert(f.root.querySelector('.song-row-delete')!.classList.contains('is-armed'));
    const currentName = f.root.querySelector('.song-row-name')!; currentName.emit('dblclick'); currentName.value = '未提交名字';
    currentName.emit('keydown', { key: 'Escape' });
    assert.equal(f.song.read().body!.tracks[0]!.name, '新鼓组'); assert.equal(currentName.value, '新鼓组');
  } finally { f.cleanup(); }
});

test('resetting BPM to its current value still replaces every future grid section, but Save alone preserves them', async () => {
  let saved = 0;
  const f = fixture({ onSaveProject() { saved++; } }); try {
    f.song.setGridTempo(160, 2); f.song.setGridTempo(90, 4); f.workspace.refresh();
    const markers = f.song.read().body!.gridTempoChanges;
    f.root.querySelectorAll('.song-save')[0]!.emit('click'); await settlePlaylistAudio();
    assert.equal(saved, 1); assert.deepEqual(f.song.read().body!.gridTempoChanges, markers);
    const tempo = f.root.querySelectorAll('input').find(input => input.attributes.get('aria-label') === '网格 BPM')!;
    tempo.focus(); tempo.value = '120'; tempo.emit('input'); tempo.blur();
    assert.deepEqual(f.song.read().body!.gridTempoChanges ?? [], []);
    assert.equal(f.song.read().body!.gridTempoBpm, 120);
  } finally { f.cleanup(); }
});

test('Shift slows displacement to one tenth without a jump and drops retain their precise time', () => {
  const f = fixture(); try {
    const id = f.ids[0]!;
    f.viewport.emit('pointerdown', { target: f.block(id), clientX: 20, clientY: 52 });
    f.document.emit('pointermove', { clientX: 26, clientY: 52 }); f.flushFrames(); f.document.emit('pointerup');
    assert(Math.abs(f.song.read().body!.tracks[0]!.clips.find(clip => clip.id === id)!.startBeat - 6 / 88 * 2) < 1e-12);
    const start = f.song.read().body!.tracks[0]!.clips.find(clip => clip.id === id)!.startBeat;
    f.viewport.emit('pointerdown', { target: f.block(id), clientX: 26, clientY: 52 });
    f.document.emit('pointermove', { clientX: 36, clientY: 52 }); f.flushFrames();
    assert.equal(f.block(id).style.transform, 'translate(10px, 0px)');
    f.document.emit('pointermove', { clientX: 46, clientY: 52, shiftKey: true }); f.flushFrames();
    assert.equal(f.block(id).style.transform, 'translate(11px, 0px)');
    f.document.emit('pointerup');
    assert(Math.abs(f.song.read().body!.tracks[0]!.clips.find(clip => clip.id === id)!.startBeat - start - 11 / 88 * 2) < 1e-12);
    const transfer = { types: ['application/x-rootsound-phrase'], getData: () => f.phraseId };
    f.viewport.emit('drop', { clientX: 44.5, clientY: 180, dataTransfer: transfer, shiftKey: true });
    assert(Math.abs(f.song.read().body!.tracks[2]!.clips[0]!.startBeat - 44.5 / 88 * 2) < 1e-12);
  } finally { f.cleanup(); }
});

test('blank dragging preserves running playback while only the ruler summons and drags the playhead', async () => {
  const plans: SoundSequencePlan[] = []; const session = { id: 'blank-seek', status: 'playing' as const, startedAtSeconds: 0 };
  const sound = { subscribe: () => () => {}, stop() {}, stopAll() {}, position: () => 0,
    async preview(plan: SoundSequencePlan) { plans.push(plan); return session; } } as unknown as SoundRuntimePort;
  const f = fixture({ sound }); try {
    const before = structuredClone(f.song.read().body!);
    f.root.querySelector('.song-play')!.emit('click'); await settlePlaylistAudio();
    const planCount = plans.length;
    f.viewport.emit('pointerdown', { target: f.root.querySelector('.song-timeline'), clientX: 352, clientY: 400 }); await settlePlaylistAudio();
    f.document.emit('pointermove', { clientX: 264, clientY: 400 }); f.flushFrames(); f.document.emit('pointerup'); await settlePlaylistAudio();
    assert.equal(plans.length, planCount); assert.equal(plans.at(-1)!.transport!.positionSeconds, 0);
    assert.equal(f.root.querySelector('.song-clock')!.textContent, '00:00.000');
    f.viewport.emit('pointerdown', { target: f.root.querySelector('.song-ruler'), clientX: 132, clientY: 15 }); await settlePlaylistAudio();
    assert.equal(plans.at(-1)!.transport!.positionSeconds, 2.5);
    f.document.emit('pointermove', { clientX: 264, clientY: 15 }); f.flushFrames(); f.document.emit('pointerup'); await settlePlaylistAudio();
    assert.equal(plans.at(-1)!.transport!.positionSeconds, 4);
    assert.equal(f.root.querySelector('.song-play')!.attributes.get('aria-label'), '暂停');
    assert.equal(f.viewport.hasPointerCapture(1), false);
    assert.deepEqual(f.song.read().body, before);
    const count = plans.length;
    f.document.emit('pointermove', { clientX: 440, clientY: 400 }); f.flushFrames(); await settlePlaylistAudio();
    assert.equal(plans.length, count); assert.equal(f.root.querySelector('.song-clock')!.textContent, '00:04.000');
    f.viewport.emit('pointerdown', { target: f.root.querySelector('.song-row-control'), clientX: 10, clientY: 50 }); f.document.emit('pointerup');
    assert.equal(f.root.querySelector('.song-clock')!.textContent, '00:04.000'); assert.equal(plans.length, count);
    f.viewport.emit('pointerdown', { target: f.block(f.ids[0]!), clientX: 30, clientY: 50 }); f.document.emit('pointerup'); await settlePlaylistAudio();
    assert.equal(f.root.querySelector('.song-clock')!.textContent, '00:04.000');
  } finally { f.cleanup(); }
});

test('vivid expanded colors fill clips and choose readable text for every palette and arbitrary custom shade', () => {
  const luminance = (hex: string) => {
    const rgb = hex.match(/[0-9a-f]{2}/giu)!.map(component => Number.parseInt(component, 16) / 255)
      .map(value => value < .04045 ? value / 12.92 : Math.pow((value + .055) / 1.055, 2.4));
    return rgb[0]! * .2126 + rgb[1]! * .7152 + rgb[2]! * .0722;
  };
  const contrast = (first: string, second: string) => {
    const values = [luminance(first), luminance(second)].sort((a, b) => a - b); return (values[1]! + .05) / (values[0]! + .05);
  };
  for (const color of [...PLAYLIST_COLORS, '#777777', '#797979', '#6b69cd', '#000000', '#ffffff']) assert(contrast(color, playlistColorInk(color)) >= 4.5, color);
  const f = fixture(); try {
    assert(f.root.querySelector('.song-phrase-card')!.style.backgroundColor);
    f.root.querySelector('.song-row-color')!.emit('click');
    const dialog = f.root.querySelector('.song-color-dialog')!;
    const swatches = dialog.querySelectorAll('.song-color-swatch'); assert.equal(swatches.length, 24);
    swatches[6]!.emit('click');
    const block = f.block(f.ids[0]!); assert.equal(block.style.backgroundColor, '#8b5cf6');
    assert(contrast(block.style.backgroundColor!, block.style.color!) >= 4.5);
  } finally { f.cleanup(); }
});

test('the red Exit action follows Save As, commits fields and suppresses duplicate exit or save while pending', async () => {
  let finish!: () => void; let exits = 0; let saves = 0; let readName = '';
  const f = fixture({ onExit() { exits++; readName = f.song.read().body!.tracks[0]!.name; return new Promise<void>(resolve => { finish = resolve; }); }, onSaveProject() { saves++; } });
  try {
    const files = f.root.querySelector('.song-file-actions')!; assert.deepEqual(files.children.map(item => item.textContent), ['保存', '另存为', '退出']);
    const name = f.root.querySelector('.song-row-name')!; name.emit('dblclick'); name.value = '退出前的名字';
    const exit = f.root.querySelector('.song-exit')!; exit.emit('click');
    assert.equal(readName, '退出前的名字'); assert.equal(exits, 1); assert.equal(exit.disabled, true);
    assert.equal((f.root.querySelector('.song-studio') as unknown as { inert: boolean }).inert, true);
    const body = f.song.read().body;
    f.document.emit('keydown', { target: f.viewport, key: 'Delete' });
    f.viewport.emit('pointerdown', { target: f.block(f.ids[0]!), button: 2, clientX: 5, clientY: 52 }); f.document.emit('pointerup');
    const transfer = { types: ['application/x-rootsound-phrase'], getData: () => f.phraseId };
    f.viewport.emit('drop', { clientX: 600, clientY: 52, dataTransfer: transfer });
    assert.deepEqual(f.song.read().body, body);
    exit.emit('click'); f.document.emit('keydown', { target: f.viewport, key: 's', code: 'KeyS', ctrlKey: true });
    assert.equal(exits, 1); assert.equal(saves, 0);
    finish(); await settlePlaylistAudio(); assert.equal(exit.disabled, false);
    assert.equal((f.root.querySelector('.song-studio') as unknown as { inert: boolean }).inert, false);
  } finally { f.cleanup(); }
});

test('instance console shows source metadata and a read-only start time, with direct phrase editing', () => {
  const f = fixture(); try {
    f.song.setGridTempo(190); f.workspace.refresh();
    f.viewport.emit('pointerdown', { target: f.block(f.ids[1]!), clientX: 210, clientY: 52 }); f.document.emit('pointerup');
    const console = f.root.querySelector('.song-inspector')!;
    assert.equal(console.hidden, false);
    assert.deepEqual(console.querySelector('.song-inspector-details')!.querySelectorAll('strong').map(item => item.textContent), ['120', '2 秒', '2.000 秒']);
    assert.deepEqual(console.querySelector('.song-inspector-details')!.querySelectorAll('span').map(item => item.textContent), ['BPM', '时长', '播放时间点']);
    assert.equal(console.querySelectorAll('input').length, 3, 'metadata is text; only name and two mix sliders are inputs');
    console.querySelector('.song-inspector-detail')!.emit('click');
    assert.equal(f.edited.at(-1)!.clipId, f.ids[1]);
  } finally { f.cleanup(); }
});

test('console sliders preview without writes, retain their nodes and commit one undoable edit; cancelling restores values', () => {
  const f = fixture(); try {
    f.viewport.emit('pointerdown', { target: f.block(f.ids[0]!), clientX: 20, clientY: 52 }); f.document.emit('pointerup');
    const level = f.root.querySelector('.song-inspector-level')!.querySelector('input')!;
    const before = f.song.read().body; const token = f.library.currentToken();
    level.focus(); level.blur(); level.emit('wheel', { deltaY: -100 });
    assert.equal(f.library.currentToken(), token, 'untouched focus/blur and wheel at the upper bound are not edits');
    level.emit('pointerdown'); level.value = '.6'; level.emit('input');
    assert.deepEqual(f.song.read().body, before);
    assert.equal(f.root.querySelector('.song-inspector-level')!.querySelector('input'), level);
    level.value = '.4'; level.emit('input'); f.document.emit('pointerup');
    assert.equal(f.song.read().body!.tracks[0]!.clips[0]!.level, .4);
    f.song.undo(); assert.deepEqual(f.song.read().body, before); f.workspace.refresh();
    const current = f.root.querySelector('.song-inspector-level')!.querySelector('input')!;
    current.emit('pointerdown'); current.value = '.2'; current.emit('input'); f.document.emit('pointercancel');
    assert.deepEqual(f.song.read().body, before); assert.equal(current.value, '1');
    const pan = f.root.querySelector('.song-inspector-pan')!.querySelector('input')!;
    let prevented = false; pan.emit('wheel', { deltaY: -20, preventDefault() { prevented = true; } });
    assert(prevented); assert.equal(f.song.read().body!.tracks[0]!.clips[0]!.pan, .01);
  } finally { f.cleanup(); }
});

test('shelf selection highlights every use but exposes only shared metadata and ignores musical shortcut edits', () => {
  const opened: string[] = []; const renames: Array<{ id: string; name: string; ref?: SongClipRefLike }> = [];
  const f = fixture({ onOpenPhrase(id) { opened.push(id); }, onRenamePhrase(id, name, ref) { renames.push({ id, name, ref }); f.shelf[0]!.name = name; return { id }; } });
  try {
    const card = f.root.querySelector('.song-phrase-card')!; card.emit('click');
    assert.equal(f.root.querySelectorAll('.song-clip').filter(item => item.classList.contains('is-selected')).length, 4);
    const console = f.root.querySelector('.song-inspector')!;
    assert.deepEqual(console.querySelector('.song-inspector-details')!.querySelectorAll('span').map(item => item.textContent), ['时长']);
    assert.equal(console.querySelectorAll('input').length, 1);
    const before = f.song.read().body;
    for (const key of ['q', 'w', 'e', 'a', 's', 'd', 'Delete']) f.document.emit('keydown', { target: f.viewport, key });
    assert.deepEqual(f.song.read().body, before);
    console.querySelector('.song-inspector-detail')!.emit('click'); assert.deepEqual(opened, [f.phraseId]);
    const name = console.querySelector('.song-inspector-name')!; name.emit('dblclick'); name.value = '新的乐句名'; name.blur();
    assert.deepEqual(renames, [{ id: f.phraseId, name: '新的乐句名', ref: undefined }]);
    assert.equal(f.root.querySelector('.song-phrase-card'), card, 'renaming does not replace the shelf drag source');
    assert.equal(card.textContent, '新的乐句名');
    f.viewport.emit('pointerdown', { target: f.block(f.ids[0]!), clientX: 20, clientY: 52 }); f.document.emit('pointerup');
    assert.equal(f.root.querySelectorAll('.song-clip').filter(item => item.classList.contains('is-selected')).length, 1);
    f.document.emit('keydown', { target: f.viewport, key: 'e' }); assert.equal(f.song.read().body!.tracks[0]!.clips[0]!.pan, .05);
  } finally { f.cleanup(); }
});

test('instance name edits identify just its occurrence, while row console edits bus gain and additive pan', () => {
  const renames: Array<{ id: string; name: string; ref?: SongClipRefLike }> = [];
  const f = fixture({ onRenamePhrase(id, name, ref) { renames.push({ id, name, ref }); f.shelf[0]!.name = name; return { id }; } });
  try {
    f.viewport.emit('pointerdown', { target: f.block(f.ids[0]!), clientX: 20, clientY: 52 }); f.document.emit('pointerup');
    const name = f.root.querySelector('.song-inspector-name')!; name.emit('dblclick'); name.value = '当前位置'; name.blur();
    assert.equal(renames[0]!.ref!.clipId, f.ids[0]);
    f.viewport.emit('pointerdown', { target: f.root.querySelector('.song-row-control'), clientX: 5, clientY: 50 }); f.document.emit('pointerup');
    const console = f.root.querySelector('.song-inspector')!; assert(console.querySelector('.song-inspector-color'));
    assert.deepEqual(console.querySelectorAll('label').map(item => item.children[0]!.textContent), ['音量增益', '声像增益']);
    const pan = console.querySelector('.song-inspector-pan')!.querySelector('input')!;
    pan.emit('pointerdown'); pan.value = '.3'; pan.emit('input'); f.document.emit('pointerup');
    assert.equal(f.song.read().body!.tracks[0]!.panOffset, .3);
    assert(f.song.read().body!.tracks[0]!.clips.every(clip => clip.pan === undefined));
    const level = console.querySelector('.song-inspector-level')!.querySelector('input')!;
    level.emit('wheel', { deltaY: 40 }); assert.equal(f.song.read().body!.tracks[0]!.level, .79);
  } finally { f.cleanup(); }
});

test('project title double-click commits its name in place and Escape preserves it; default colors stay neutral', () => {
  const f = fixture({ onRenameProject(name) { f.song.rename(name); } }); try {
    assert.equal(playlistPhraseColor('one'), '#dce3e9'); assert.equal(playlistPhraseColor('two'), '#dce3e9');
    assert.equal(f.block(f.ids[0]!).style.backgroundColor, '#dce3e9');
    const title = f.root.querySelector('.song-project-name')!; title.emit('dblclick');
    const input = title.querySelector('input')!; input.value = '新的项目名'; input.blur();
    assert.equal(title.textContent, '新的项目名'); assert.equal(f.song.read().draft!.name, '新的项目名');
    assert.equal(f.root.querySelector('.song-project-kind')!.textContent, '乐曲');
    assert.equal(title.querySelector('.song-project-kind'), undefined, 'type badge never enters the editable or persisted name');
    title.emit('dblclick'); const cancelled = title.querySelector('input')!; cancelled.value = '不保留'; cancelled.emit('keydown', { key: 'Escape' });
    assert.equal(title.textContent, '新的项目名'); assert.equal(f.song.read().draft!.name, '新的项目名');
  } finally { f.cleanup(); }
});

test('two real stationary press/release cycles preserve the clip node and edit exactly the same captured source', () => {
  const f = fixture(); try {
    const id = f.ids[2]!; const original = f.block(id);
    for (let click = 0; click < 2; click++) {
      f.viewport.emit('pointerdown', { target: f.block(id), clientX: 380, clientY: 52 });
      f.document.emit('pointermove', { clientX: 382, clientY: 52 }); f.flushFrames();
      f.document.emit('pointerup', { clientX: 382, clientY: 52 });
      assert.equal(f.block(id), original, 'stationary click/jitter cannot replace the browser double-click target');
    }
    assert.deepEqual(f.edited, [{ trackId: f.track, clipId: id }], 'the second release opens even if the browser loses its native dblclick target');
    f.viewport.emit('dblclick', { target: f.viewport });
    assert.deepEqual(f.edited, [{ trackId: f.track, clipId: id }]);
    f.viewport.emit('pointerdown', { target: f.block(f.ids[0]!), clientX: 20, clientY: 52 }); f.document.emit('pointerup');
    f.viewport.emit('pointerdown', { target: f.block(f.ids[1]!), clientX: 200, clientY: 52 }); f.document.emit('pointerup');
    f.viewport.emit('dblclick', { target: f.viewport, clientX: 200, clientY: 52 });
    assert.equal(f.edited.length, 1, 'retargeted clicks on different clips are not a shared double-click');
    f.viewport.emit('pointerdown', { target: f.block(id), clientX: 380, clientY: 52 });
    f.document.emit('pointermove', { clientX: 390, clientY: 52 }); f.flushFrames(); f.document.emit('pointerup');
    f.viewport.emit('dblclick', { target: f.viewport, clientX: 390, clientY: 52 });
    assert.equal(f.edited.length, 1, 'a completed real drag cannot be mistaken for a double-click');
  } finally { f.cleanup(); }
});

test('placed double-click survives a viewport repaint between presses and still opens only once', () => {
  const f = fixture(); const realNow = Date.now; let now = 1000; Date.now = () => now;
  try {
    const id = f.ids[1]!; const original = f.block(id);
    f.root.querySelector('.song-scroll')!.emit('pointerdown', { target: original, clientX: 200, clientY: 52 }); f.document.emit('pointerup');
    assert.equal(f.edited.length, 0); f.workspace.refresh(); assert.notEqual(f.block(id), original);
    now += 400;
    f.root.querySelector('.song-scroll')!.emit('pointerdown', { target: f.block(id), clientX: 202, clientY: 52 }); f.document.emit('pointerup');
    assert.deepEqual(f.edited, [{ trackId: f.track, clipId: id }]);
    f.root.querySelector('.song-scroll')!.emit('dblclick', { target: f.block(id), clientX: 202, clientY: 52 });
    assert.equal(f.edited.length, 1);
    now += 1000;
    f.root.querySelector('.song-scroll')!.emit('pointerdown', { target: f.block(id), clientX: 200, clientY: 52 }); f.document.emit('pointerup');
    now += 401;
    f.root.querySelector('.song-scroll')!.emit('pointerdown', { target: f.block(id), clientX: 200, clientY: 52 }); f.document.emit('pointerup');
    assert.equal(f.edited.length, 1, 'slower clicks remain selections until the system reports a double-click');
    f.root.querySelector('.song-scroll')!.emit('dblclick', { target: f.root.querySelector('.song-scroll'), clientX: 200, clientY: 52 });
    assert.equal(f.edited.length, 2, 'native system timing remains a fallback');
  } finally { Date.now = realNow; f.cleanup(); }
});

test('phrase library double-click opens its original phrase without adding it to the shelf or renaming it', context => {
  context.mock.timers.enable({ apis: ['setTimeout'] }); const opened: string[] = [];
  const f = fixture({ onOpenPhrase(id) { opened.push(id); }, onRenamePhrase() { throw new Error('double-click must not rename'); } });
  try {
    f.song.setPhraseShelfVisible(f.phraseId, false); f.workspace.refresh(); const before = structuredClone(f.song.read().draft); const token = f.library.currentToken();
    const source = f.library.readContent(f.phraseId);
    f.root.querySelector('.song-new-phrase')!.emit('click'); const tile = f.root.querySelector('.song-library-phrase')!;
    tile.emit('click'); context.mock.timers.tick(450);
    assert(f.root.querySelector('.song-phrase-library'), 'a normal slow Windows double-click must not lose the library on its first click');
    tile.emit('click'); tile.emit('dblclick');
    assert.deepEqual(opened, [f.phraseId]); assert.equal(f.root.querySelector('.song-phrase-library'), undefined);
    assert.equal(f.root.querySelector('.song-library-rename'), undefined);
    context.mock.timers.tick(1000); tile.emit('dblclick');
    assert.deepEqual(opened, [f.phraseId], 'a detached card cannot open again');
    assert.deepEqual(f.song.read().draft, before); assert.equal(f.library.currentToken(), token);
    assert.deepEqual(f.library.readContent(f.phraseId), source);
  } finally { f.cleanup(); }
});

test('phrase library respects a slower configured system double-click interval before its single-add action', context => {
  context.mock.timers.enable({ apis: ['setTimeout'] }); const opened: string[] = [];
  const f = fixture({ doubleClickIntervalMs: 900, onOpenPhrase(id) { opened.push(id); } });
  try {
    const before = structuredClone(f.song.read().body);
    f.root.querySelector('.song-new-phrase')!.emit('click'); const tile = f.root.querySelector('.song-library-phrase')!;
    tile.emit('click'); context.mock.timers.tick(650);
    assert(f.root.querySelector('.song-phrase-library'), 'system900ms must not use fallback600ms');
    tile.emit('click'); tile.emit('dblclick'); context.mock.timers.tick(1000);
    assert.equal(f.root.querySelector('.song-phrase-library'), undefined); assert.deepEqual(opened, [f.phraseId]);
    assert.deepEqual(f.song.read().body, before);
  } finally { f.cleanup(); }
});

test('failed library opening keeps the dialog usable and retries without a delayed visibility toggle', context => {
  context.mock.timers.enable({ apis: ['setTimeout'] }); let attempts = 0;
  const f = fixture({ onOpenPhrase() { if (++attempts === 1) throw new Error('测试打开失败'); } }); try {
    const before = structuredClone(f.song.read().draft); const token = f.library.currentToken();
    f.root.querySelector('.song-new-phrase')!.emit('click'); const dialog = f.root.querySelector('.song-phrase-library')!;
    const tile = dialog.querySelector('.song-library-phrase')!; tile.emit('click'); tile.emit('dblclick');
    assert.equal(f.root.querySelector('.song-phrase-library'), dialog); assert.equal(dialog.querySelector('.song-library-open-error')!.textContent, '测试打开失败');
    context.mock.timers.tick(1000); assert.deepEqual(f.song.read().draft, before); assert.equal(f.library.currentToken(), token);
    tile.emit('dblclick'); assert.equal(attempts, 2); assert.equal(f.root.querySelector('.song-phrase-library'), undefined);
  } finally { f.cleanup(); }
});

test('opening a library phrase during workspace replacement does not restore focus to the old shelf', context => {
  context.mock.timers.enable({ apis: ['setTimeout'] }); let f!: ReturnType<typeof fixture>; const target = new FakeElement('input');
  f = fixture({ onOpenPhrase() { f.workspace.dispose(); f.root.replaceChildren(target); target.focus(); } }); try {
    const before = structuredClone(f.song.read().body);
    f.root.querySelector('.song-new-phrase')!.emit('click'); const tile = f.root.querySelector('.song-library-phrase')!;
    tile.emit('click'); tile.emit('dblclick'); context.mock.timers.tick(1000);
    assert.equal(f.document.activeElement, target); assert.equal(f.root.querySelector('.song-phrase-library'), undefined);
    assert.deepEqual(f.song.read().body, before);
  } finally { f.cleanup(); }
});

test('library drags and delete warnings suppress synthetic double-clicks until the next real interaction', context => {
  context.mock.timers.enable({ apis: ['setTimeout'] }); const realNow = Date.now; let now = 10000; Date.now = () => now;
  const opened: string[] = []; const f = fixture({ onOpenPhrase(id) { opened.push(id); } }); try {
    f.root.querySelector('.song-new-phrase')!.emit('click'); const dialog = f.root.querySelector('.song-phrase-library')!;
    const tile = dialog.querySelector('.song-library-phrase')!; const transfer = phraseTransfer();
    tile.emit('dragstart', { dataTransfer: transfer }); tile.emit('dblclick'); assert.deepEqual(opened, []);
    dialog.querySelector('.song-phrase-trash')!.emit('drop', { dataTransfer: transfer }); tile.emit('dragend');
    now += 1000; tile.emit('dblclick'); assert.deepEqual(opened, [], 'a delete confirmation owns the interaction');
    f.root.querySelector('.song-library-delete-cancel')!.emit('click');
    tile.emit('dragstart', { dataTransfer: transfer }); tile.emit('dragend'); tile.emit('dblclick'); assert.deepEqual(opened, []);
    now += 300; tile.emit('click'); tile.emit('dblclick'); context.mock.timers.tick(1000);
    assert.deepEqual(opened, [f.phraseId]); assert.equal(f.root.querySelector('.song-phrase-library'), undefined);
  } finally { Date.now = realNow; f.cleanup(); }
});

test('phrase library keeps open while toggling shelf visibility and leaves placed clips and saved identity intact', context => {
  context.mock.timers.enable({ apis: ['setTimeout'] }); const f = fixture(); try {
    const before=structuredClone(f.song.read().body!.tracks);const source=f.library.readContent(f.phraseId);
    f.root.querySelector('.song-new-phrase')!.emit('click');const dialog=f.root.querySelector('.song-phrase-library')!;
    assert.equal(dialog.querySelector('.song-library-close')!.textContent,'→');
    const tile=()=>dialog.querySelector('.song-library-phrase')!;
    assert.equal(tile().attributes.get('aria-pressed'),'true');tile().emit('click');context.mock.timers.tick(650);
    assert.equal(f.root.querySelector('.song-phrase-library'),dialog);assert.equal(tile().attributes.get('aria-pressed'),'false');
    assert.equal(f.root.querySelectorAll('.song-phrase-card').length,0);assert.deepEqual(f.song.read().body!.tracks,before);assert.deepEqual(f.library.readContent(f.phraseId),source);
    tile().emit('click');context.mock.timers.tick(650);
    assert.equal(f.root.querySelector('.song-phrase-library'),dialog);assert.equal(tile().attributes.get('aria-pressed'),'true');
    assert.equal(f.root.querySelector('.song-phrase-card')!.dataset.phraseId,f.phraseId);assert.deepEqual(f.song.read().body!.tracks,before);assert.deepEqual(f.library.readContent(f.phraseId),source);
    f.song.undo();f.workspace.refresh();assert.equal(f.root.querySelectorAll('.song-phrase-card').length,0);assert.deepEqual(f.song.read().body!.tracks,before);
    dialog.querySelector('.song-library-close')!.emit('click');assert.equal(f.root.querySelector('.song-phrase-library'),undefined);
  }finally{f.cleanup();}
});

test('quick selections of different phrase library cards each toggle rather than cancelling one another', context => {
  context.mock.timers.enable({apis:['setTimeout']});const f=fixture();try{
    const made=createProjectPhrase(f.library,f.song.read().draft!.id);f.shelf.push({id:made.id,name:'另一乐句',tempoBpm:120,durationSeconds:2});f.workspace.refresh();
    f.song.setPhraseShelfVisible(f.phraseId,false);f.song.setPhraseShelfVisible(made.id,false);f.workspace.refresh();
    f.root.querySelector('.song-new-phrase')!.emit('click');const dialog=f.root.querySelector('.song-phrase-library')!;
    const tiles=dialog.querySelectorAll('.song-library-phrase');assert.equal(tiles.length,2);tiles[0]!.emit('click');context.mock.timers.tick(100);tiles[1]!.emit('click');context.mock.timers.tick(650);
    assert.equal(f.root.querySelector('.song-phrase-library'),dialog);assert.equal(f.root.querySelectorAll('.song-phrase-card').length,2);
    assert(dialog.querySelectorAll('.song-library-phrase').every(tile=>tile.attributes.get('aria-pressed')==='true'));
  }finally{f.cleanup();}
});

test('a failed phrase library visibility change preserves selection and allows retry without closing',context=>{
  context.mock.timers.enable({apis:['setTimeout']});const f=fixture();try{
    f.root.querySelector('.song-new-phrase')!.emit('click');const dialog=f.root.querySelector('.song-phrase-library')!,before=structuredClone(f.song.read().body);
    const toggle=f.song.setPhraseShelfVisible;f.song.setPhraseShelfVisible=()=>{throw new Error('测试保存失败');};dialog.querySelector('.song-library-phrase')!.emit('click');context.mock.timers.tick(650);
    assert.equal(f.root.querySelector('.song-phrase-library'),dialog);assert.equal(dialog.querySelector('.song-library-phrase')!.attributes.get('aria-pressed'),'true');assert.deepEqual(f.song.read().body,before);
    f.song.setPhraseShelfVisible=toggle;dialog.querySelector('.song-library-phrase')!.emit('click');context.mock.timers.tick(650);assert.equal(dialog.querySelector('.song-library-phrase')!.attributes.get('aria-pressed'),'false');
  }finally{f.cleanup();}
});

test('row solo and mute icon buttons immediately route through exclusive song mix without selecting or moving rows', () => {
  const f = fixture(); try {
    f.song.updateTrack(f.track, { level: 0, muted: true }); f.workspace.refresh();
    const row = (id: string) => f.root.querySelectorAll('.song-row-control').find(node => node.dataset.trackId === id)!;
    row(f.track).querySelector('.song-row-solo')!.emit('click');
    let body = f.song.read().body!; assert.equal(body.tracks[0]!.solo, true); assert.equal(body.tracks[0]!.muted, false); assert.equal(body.tracks[0]!.level, 1);
    assert.equal(row(f.track).querySelector('.song-row-solo')!.attributes.get('aria-pressed'), 'true');
    row(f.otherTrack).querySelector('.song-row-solo')!.emit('click');
    body = f.song.read().body!; assert.equal(body.tracks[0]!.solo, false); assert.equal(body.tracks[1]!.solo, true);
    row(f.otherTrack).querySelector('.song-row-mute')!.emit('click');
    assert.equal(f.song.read().body!.tracks[1]!.muted, true); assert.equal(row(f.otherTrack).querySelector('.song-row-mute')!.attributes.get('aria-pressed'), 'true');
    row(f.otherTrack).querySelector('.song-row-solo')!.emit('click');
    assert(f.song.read().body!.tracks.every(track => !track.solo)); assert.equal(f.song.read().body!.tracks[1]!.muted, true);
    assert.equal(f.song.read().body!.tracks[0]!.id, f.track); assert.equal(f.root.querySelector('.song-inspector')!.hidden, true);
  } finally { f.cleanup(); }
});

test('shelf drag smoothly pushes neighbors with stable baseline spacing and commits one durable visible order', () => {
  const f = fixture(); try {
    f.shelf.splice(0); // Production lists project-owned library entries, never this fixture's unowned starter.
    for (let index = 0; index < 3; index++) { const made = createProjectPhrase(f.library, f.song.read().draft!.id); f.shelf.push({ id: made.id, name: f.library.readContent(made.id)!.name, tempoBpm: 120, durationSeconds: 2 }); }
    f.workspace.refresh(); const original = f.root.querySelectorAll('.song-phrase-card').map(card => card.dataset.phraseId); const body = f.song.read().body!; const token = f.library.currentToken();
    const cards = () => f.root.querySelectorAll('.song-phrase-card'); const list = f.root.querySelector('.song-phrase-list')!; const data = phraseTransfer();
    cards()[0]!.emit('dragstart', { clientY: 20, dataTransfer: data });
    list.emit('dragover', { clientY: 90, dataTransfer: data }); assert.equal(cards()[1]!.style.transform, 'translateY(-60px)');
    list.emit('dragover', { clientY: 115, dataTransfer: data }); assert.equal(cards()[2]!.style.transform, 'translateY(-60px)');
    list.emit('dragover', { clientY: 90, dataTransfer: data }); assert.equal(cards()[2]!.style.transform, 'translateY(0px)');
    list.emit('dragover', { clientY: 115, dataTransfer: data }); assert.equal(cards()[2]!.style.transform, 'translateY(-60px)');
    assert.equal(f.library.currentToken(), token); assert.deepEqual(f.song.read().body, body);
    list.emit('drop', { dataTransfer: data });
    assert.equal(f.root.querySelector('.song-notice')!.textContent, '');
    assert.deepEqual(cards().map(card => card.dataset.phraseId), [original[1], original[2], original[0]]);
    assert.deepEqual(f.song.read().body!.tracks, body.tracks); assert.equal(f.root.querySelector('.song-phrase-trash')!.hidden, true);
    f.song.undo(); f.workspace.refresh(); assert.deepEqual(cards().map(card => card.dataset.phraseId), original);
    const cancelToken = f.library.currentToken(); cards()[0]!.emit('dragstart', { clientY: 20, dataTransfer: data }); list.emit('dragover', { clientY: 115, dataTransfer: data }); cards()[0]!.emit('dragend');
    assert.deepEqual(cards().map(card => card.dataset.phraseId), original); assert.equal(f.library.currentToken(), cancelToken);
  } finally { f.cleanup(); }
});

test('Shift blank dragging scrolls rows without seeking, modifying music or starting a clip drag', () => {
  const f = fixture(); try {
    for (let index = 0; index < 14; index++) f.song.addTrack(); f.workspace.refresh(); const body = f.song.read().body!;
    f.viewport.emit('pointerdown', { target: f.root.querySelector('.song-timeline'), clientX: 800, clientY: 500 });
    f.document.emit('pointermove', { clientX: 800, clientY: 350, shiftKey: true }); f.flushFrames(); f.document.emit('pointerup');
    assert.equal(f.root.querySelector('.song-row-control')!.dataset.trackId, body.tracks[2]!.id);
    assert.equal(f.root.querySelector('.song-clock')!.textContent, '00:00.000'); assert.deepEqual(f.song.read().body, body);
    assert.equal(f.root.querySelector('.song-phrase-trash')!.parentElement, f.root.querySelector('.song-scroll')); assert.equal(f.root.querySelector('.song-phrase-trash')!.hidden, true);
  } finally { f.cleanup(); }
});

test('console audition uses its phrase source, stops on selection or song playback, and disappears for row selection', async () => {
  const previews: string[] = []; const stopped: string[] = [];
  const sound = { subscribe: () => () => {}, stop(id: string) { stopped.push(id); }, stopAll() {}, position: () => 0,
    async preview() { return { id: 'song-playback', status: 'playing' as const, startedAtSeconds: 0 }; } } as unknown as SoundRuntimePort;
  const f = fixture({ sound, async onPreviewPhrase(id) { previews.push(id); return { id: 'phrase-audition', status: 'playing', startedAtSeconds: 0 }; } });
  try {
    f.viewport.emit('pointerdown', { target: f.block(f.ids[0]!), clientX: 20, clientY: 52 });
    const play = f.root.querySelector('.song-inspector-audition')!; assert(play); play.emit('click'); await settlePlaylistAudio();
    assert.deepEqual(previews, [f.phraseId]); assert.equal(play.attributes.get('aria-label'), '停止演奏');
    f.root.querySelector('.song-play')!.emit('click'); await settlePlaylistAudio(); assert.deepEqual(stopped, ['phrase-audition']);
    f.root.querySelector('.song-phrase-card')!.emit('click'); f.root.querySelector('.song-inspector-audition')!.emit('click'); await settlePlaylistAudio();
    f.viewport.emit('pointerdown', { target: f.root.querySelector('.song-row-control'), clientX: 10, clientY: 52 });
    assert.equal(f.root.querySelector('.song-inspector-audition'), undefined); assert.deepEqual(stopped, ['phrase-audition', 'phrase-audition']);
  } finally { f.cleanup(); }
});


test('left phrase shelf double-click directly opens its source once without changing song placement',()=>{
 const opened:string[]=[];const f=fixture({onOpenPhrase(id){opened.push(id);}});try{
  const before=structuredClone(f.song.read().body);const card=f.root.querySelector('.song-phrase-card')!;
  card.emit('click');assert.deepEqual(opened,[]);assert(card.classList.contains('is-selected'));
  card.emit('dblclick');assert.deepEqual(opened,[f.phraseId]);card.emit('dblclick');assert.deepEqual(opened,[f.phraseId]);assert.deepEqual(f.song.read().body,before);
 }finally{f.cleanup();}
});

test('shelf stationary double presses survive redraws and the native double-click cannot open twice',()=>{
 const opened:string[]=[];const f=fixture({onOpenPhrase(id){opened.push(id);},doubleClickIntervalMs:700});const realNow=Date.now;let now=1000;Date.now=()=>now;
 try{
  let card=f.root.querySelector('.song-phrase-card')!;card.emit('pointerdown',{clientX:20,clientY:25});f.document.emit('pointerup',{clientX:20,clientY:25});card.emit('click');assert.deepEqual(opened,[]);
  f.workspace.refresh();card=f.root.querySelector('.song-phrase-card')!;now+=600;
  card.emit('pointerdown',{clientX:22,clientY:26});f.document.emit('pointerup',{clientX:22,clientY:26});card.emit('click');card.emit('dblclick');assert.deepEqual(opened,[f.phraseId]);
 }finally{Date.now=realNow;f.cleanup();}
});

test('rapid presses on different shelf cards and pointer movement do not become source double-clicks',()=>{
 const opened:string[]=[];const f=fixture({onOpenPhrase(id){opened.push(id);}});try{
  const added=createProjectPhrase(f.library,f.song.read().draft!.id);f.shelf.push({id:added.id,name:'另一乐句',tempoBpm:120,durationSeconds:2});f.workspace.refresh();
  const cards=f.root.querySelectorAll('.song-phrase-card');
  for(const card of cards){card.emit('pointerdown',{clientX:20,clientY:20});f.document.emit('pointerup',{clientX:20,clientY:20});card.emit('click');}assert.deepEqual(opened,[]);
  const card=cards[1]!;card.emit('pointerdown',{clientX:20,clientY:20});f.document.emit('pointermove',{clientX:32,clientY:20}); f.flushFrames();f.document.emit('pointerup',{clientX:32,clientY:20});card.emit('click');card.emit('dblclick');assert.deepEqual(opened,[]);
 }finally{f.cleanup();}
});

test('a shelf drag or its synthetic clicks never opens a phrase, but the next real double-click works',()=>{
 const opened:string[]=[];const f=fixture({onOpenPhrase(id){opened.push(id);}});try{
  let card=f.root.querySelector('.song-phrase-card')!;const transfer=phraseTransfer();
  card.emit('pointerdown',{clientX:20,clientY:20});card.emit('dragstart',{dataTransfer:transfer,clientX:20,clientY:20});card.emit('dragend');f.document.emit('pointerup',{clientX:20,clientY:20});card.emit('click');card.emit('dblclick');assert.deepEqual(opened,[]);
  for(let click=0;click<2;click++){card=f.root.querySelector('.song-phrase-card')!;card.emit('pointerdown',{clientX:20,clientY:20});f.document.emit('pointerup',{clientX:20,clientY:20});card.emit('click');}
  card.emit('dblclick');assert.deepEqual(opened,[f.phraseId]);assert.equal(f.root.querySelector('.song-phrase-trash')!.hidden,true);
 }finally{f.cleanup();}
});

test('Backspace still undoes the last song edit when a volume slider retains keyboard focus', () => {
  const f = fixture(); try {
    const previous = f.song.read().body!.masterLevel;
    const clips = f.song.read().body!.tracks.flatMap(track => track.clips).length;
    f.song.setMasterLevel(.4); f.workspace.refresh();
    const volume = f.root.querySelectorAll('input').find(input => input.attributes.get('aria-label') === '总音量')!;
    assert(volume);
    f.document.emit('keydown', { key: 'Backspace', target: volume });
    assert.equal(f.song.read().body!.masterLevel, previous);
    assert.equal(f.song.read().body!.tracks.flatMap(track => track.clips).length, clips);
  } finally { f.cleanup(); }
});
