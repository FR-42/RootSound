import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import { test } from 'node:test';
import type { PlaybackSession, PlayableNotePlan, SoundRuntimeEvent, SoundRuntimePort, SoundSequencePlan } from '../src/workstation/contracts/sound.ts';
import type { TimbreBody } from '../src/workstation/contracts/timbre.ts';
import { createWorkspacePreferences } from '../src/workstation/app/platform/preferences.ts';
import { copyProjectPhrase, createProjectPhrase, beginProjectPhraseDraft, discardProjectPhraseDraft, assertProjectPhraseSaveReady, readProjectPhraseInfo, readProjectPhrases, retainProjectPhrases } from '../src/workstation/app/project-phrases.ts';
import { addProjectPhraseTimbre, changeProjectPhraseNoteGroupTimbre, createProjectPhraseNoteGroup, ensureProjectMelodyTimbres, listProjectTimbres, removeProjectPhraseTimbre, reorderProjectTimbres, tryRemoveUnusedProjectTimbre, requiresTimbreDeleteConfirmation } from '../src/workstation/app/project-timbres.ts';
import { importProjectTimbre } from '../src/workstation/app/project-timbre-import.ts';
import { createMaterialLibrary, createProjectPackages, createReferenceEditing } from '../src/workstation/modules/materials/public.ts';
import { createPhraseEditor, createPhrasePlayback, createPhraseReferenceAdapter, readPhraseBody } from '../src/workstation/modules/phrase/public.ts';
import { createSongEditor, createSongReferenceAdapter, readSongBody } from '../src/workstation/modules/song/public.ts';
import { createTimbreEditor, createTimbrePlayback, createTimbreReferenceAdapter, prepareBasicTimbre } from '../src/workstation/modules/timbre/public.ts';
import { toneColor } from '../src/workstation/modules/ui-rendering/phrase-overview-notes.ts';

const hooks = registerHooks({ load(url, context, next) { return url.endsWith('.css') ? { format: 'module', source: '', shortCircuit: true } : next(url, context); } });
const { mountStudio } = await import('../src/workstation/modules/ui-rendering/public.ts'); hooks.deregister();

type FakeEvent = Record<string, unknown> & { type: string; target: Element; preventDefault(): void; stopPropagation(): void };
let navigationHeight: number | undefined;
/** In-memory event DOM only; no browser, screen, device, or audio is accessed. */
class Element {
  tagName: string; className = ''; style: Record<string, unknown> & { setProperty(name: string, value: string): void } = { setProperty(name, value) { this[name] = value; } }; dataset: Record<string, string> = {};
  parentElement?: Element; children: Element[] = []; attributes = new Map<string, string>();
  value = ''; hidden = false; disabled = false; tabIndex = 0; clientWidth = 1000; private height = 700; scrollTop = 0; scrollLeft = 0;
  get clientHeight(): number { return navigationHeight !== undefined && (this.classList.contains('melody-scroll') || this.classList.contains('phrase-composition-section')) ? navigationHeight : this.height; }
  set clientHeight(value: number) { this.height = value; }
  private text = ''; private listeners = new Map<string, Array<(event: FakeEvent) => void>>(); private captured = new Set<number>();
  constructor(tag = 'div') { this.tagName = tag.toUpperCase(); }
  get textContent() { return this.text; }
  set textContent(value: string) { this.text = value; for (const child of this.children) child.parentElement = undefined; this.children = []; }
  classList = {
    add: (...names: string[]) => { this.className = [...new Set([...this.className.split(' ').filter(Boolean), ...names])].join(' '); },
    remove: (...names: string[]) => { this.className = this.className.split(' ').filter(name => !names.includes(name)).join(' '); },
    contains: (name: string) => this.className.split(' ').includes(name),
    toggle: (name: string, force?: boolean) => { const on = force ?? !this.classList.contains(name); if (on) this.classList.add(name); else this.classList.remove(name); return on; },
  };
  append(...nodes: Element[]): void { for (const child of nodes) { child.remove(); child.parentElement = this; this.children.push(child); } }
  replaceChildren(...nodes: Element[]): void { this.textContent = ''; this.append(...nodes); }
  remove(): void { if (this.parentElement) this.parentElement.children = this.parentElement.children.filter(child => child !== this); this.parentElement = undefined; }
  setAttribute(key: string, value: string): void { this.attributes.set(key, value); }
  showModal(): void { this.attributes.set('open', ''); }
  close(): void { this.attributes.delete('open'); this.emit('close'); }
  matches(selector: string): boolean {
    if (selector.startsWith('.')) return this.classList.contains(selector.slice(1));
    const match = /^([a-z][a-z0-9]*)(?:\[([^\]]+)\])?$/u.exec(selector);
    return !!match && this.tagName.toLowerCase() === match[1] && (!match[2] || this.attributes.has(match[2]));
  }
  closest(selector: string): Element | undefined { return this.matches(selector) ? this : this.parentElement?.closest(selector); }
  querySelectorAll(selector: string): Element[] { return this.children.flatMap(child => [...(child.matches(selector) ? [child] : []), ...child.querySelectorAll(selector)]); }
  querySelector(selector: string): Element | undefined { return this.querySelectorAll(selector)[0]; }
  contains(other: Element): boolean { return other === this || this.children.some(child => child.contains(other)); }
  addEventListener(type: string, callback: (event: FakeEvent) => void): void { this.listeners.set(type, [...this.listeners.get(type) ?? [], callback]); }
  removeEventListener(type: string, callback: (event: FakeEvent) => void): void { this.listeners.set(type, (this.listeners.get(type) ?? []).filter(item => item !== callback)); }
  emit(type: string, values: Record<string, unknown> = {}): FakeEvent {
    const event = { type, target: this, pointerId: 1, button: 0, clientX: 0, clientY: 0, key: '', code: '', ctrlKey: false, metaKey: false,
      shiftKey: false, repeat: false, defaultPrevented: false, propagationStopped: false,
      preventDefault() { this.defaultPrevented = true; }, stopPropagation() { this.propagationStopped = true; }, ...values } as FakeEvent;
    for (const listener of this.listeners.get(type) ?? []) listener(event); return event;
  }
  getBoundingClientRect() {
    const note = this.classList.contains('melody-note'); const left = note ? Number.parseFloat(String(this.style.left ?? 0)) : 0;
    const top = note ? Number.parseFloat(String(this.style.top ?? 0)) : 0; const width = note ? Number.parseFloat(String(this.style.width ?? 1)) : this.clientWidth;
    const height = note ? Number.parseFloat(String(this.style.height ?? 1)) : this.clientHeight;
    return { left, top, right: left + width, bottom: top + height, width, height };
  }
  setPointerCapture(id: number): void { this.captured.add(id); }
  hasPointerCapture(id: number): boolean { return this.captured.has(id); }
  releasePointerCapture(id: number): void { this.captured.delete(id); }
  focus(): void { const doc = globalThis.document as unknown as Document; if (doc.activeElement !== this) doc.activeElement?.blur(); doc.activeElement = this; }
  blur(): void { const doc = globalThis.document as unknown as Document; if (doc.activeElement === this) doc.activeElement = undefined; this.emit('blur'); }
  select(): void {}
}
class Input extends Element {}
class Select extends Element {}
class TextArea extends Element {}
class Document extends Element {
  activeElement?: Element;
  createElement(tag: string): Element { return tag === 'input' ? new Input(tag) : new Element(tag); }
  createElementNS(_namespace: string, tag: string): Element { return this.createElement(tag); }
  createTextNode(text: string): Element { const node = new Element('text'); node.textContent = text; return node; }
}
function installDom() {
  const document = new Document('document'); const window = new Element('window'); const timers: ReturnType<typeof setTimeout>[] = [];
  const frames = new Map<number, FrameRequestCallback>(); let serial = 0;
  Object.assign(window, { setTimeout(callback: () => void, delay: number) { const timer = setTimeout(callback, delay); timer.unref(); timers.push(timer); return Number(timer); }, clearTimeout });
  const replacements = { document, window, HTMLElement: Element, HTMLInputElement: Input, HTMLSelectElement: Select, HTMLTextAreaElement: TextArea,
    Node: Element, requestAnimationFrame(callback: FrameRequestCallback) { frames.set(++serial, callback); return serial; }, cancelAnimationFrame(id: number) { frames.delete(id); } };
  const previous = new Map<string, PropertyDescriptor | undefined>();
  for (const [key, value] of Object.entries(replacements)) { previous.set(key, Object.getOwnPropertyDescriptor(globalThis, key)); Object.defineProperty(globalThis, key, { configurable: true, writable: true, value }); }
  return { document, window, flushFrames() { const pending = [...frames.values()]; frames.clear(); for (const callback of pending) callback(0); },
    restore() { timers.forEach(clearTimeout); frames.clear(); for (const [key, descriptor] of previous) { if (descriptor) Object.defineProperty(globalThis, key, descriptor); else Reflect.deleteProperty(globalThis, key); } } };
}
const settle = async () => { for (let index = 0; index < 24; index++) await Promise.resolve(); };
function fixture(config: { empty?: boolean; performance?: boolean; navigationHeight?: number } = {}) {
  const previousHeight = navigationHeight; navigationHeight = config.navigationHeight;
  const dom = installDom();
  const adapters = [createTimbreReferenceAdapter(), createPhraseReferenceAdapter(), createSongReferenceAdapter()];
  const library = createMaterialLibrary(undefined, { project: { rootKind: 'rootsound.song', adapters } });
  const timbre = createTimbreEditor(library); const sounds = createTimbrePlayback(library);
  const phrase = createPhraseEditor(library, sounds); const song = createSongEditor(library, createPhrasePlayback(library, sounds), { defaultTempoMode: 'source', initialTrackCount: 7 });
  song.create(); const songId = song.read().draft!.id; const original = createProjectPhrase(library, songId);
  phrase.openDraft(original.draftId);
  if (!config.empty) { phrase.addNote(phrase.read().body!.parts[0]!.id, { startBeat: 1, durationBeats: 1, frequencyHz: 330, velocity: .7 }); assert.equal(phrase.save('overwrite').status, 'saved'); }
  const track = song.read().body!.tracks[0]!.id; const clipId = song.addClip(track, original.id, 0); song.addClip(track, original.id, 16);
  const references = createReferenceEditing(library, adapters); const context = { root: { type: 'draft' as const, id: songId }, path: [clipId] };
  const session = references.begin(context); phrase.openDraft(session.draftId);
  const plans: SoundSequencePlan[] = []; const auditions: PlayableNotePlan[] = []; const listeners = new Set<(event: SoundRuntimeEvent) => void>();
  let playback: PlaybackSession | undefined; let serial = 0; let elapsed = 0; let prepared = 0;
  const emit = (status: PlaybackSession['status']) => { if (playback) { playback = { ...playback, status }; for (const listener of listeners) listener({ type: 'session', session: playback }); } };
  const runtime = { async preview(plan: SoundSequencePlan) { plans.push(plan); elapsed = 0; return playback = { id: String(++serial), status: 'playing', startedAtSeconds: 0, durationSeconds: plan.durationSeconds }; },
    update(_id: string, plan: SoundSequencePlan) { plans.push(plan); return playback; }, pause() { emit('paused'); return playback; },
    async resume(_id: string, plan: SoundSequencePlan) { plans.push(plan); emit('playing'); return playback!; },
    stopAll() { emit('stopped'); }, stop() { emit('stopped'); }, position() { return elapsed; },
    async audition(plan: PlayableNotePlan) { auditions.push(plan); }, cancelAudition() {},
    subscribe(listener: (event: SoundRuntimeEvent) => void) { listeners.add(listener); return () => listeners.delete(listener); } } as unknown as SoundRuntimePort;
  const root = new Element('main'); const saved: string[] = []; const workspaces: string[] = []; let failFamilyChange = false; let failCopy = false; let failDiscard = false;
  const projects = createProjectPackages(library, adapters, { rootKind: 'rootsound.song' });
  const preferences = createWorkspacePreferences({ getItem: () => null, setItem() {} });
  if (config.performance) preferences.update({ keyboardPerformance: true });
  const studio = mountStudio(root as unknown as HTMLElement, { timbre, phrase, song, references, preferences, sound: runtime, hasPrevious: true, initialEntry: 'phrase',
    onWorkspaceChange: workspace => workspaces.push(workspace), projects,
    projectFiles: { async open() { return { status: 'cancelled' }; }, async save(text, name) { saved.push(text); return { status: 'saved', name }; } },
    onNewPhrase(timbreId, tempoBpm) { phrase.openDraft(beginProjectPhraseDraft(library, songId, timbreId, tempoBpm).draftId); },
    onSavePhraseDraft: (id, mode) => library.saveDraft(id, mode),
    onDiscardPhraseDraft(id) { if (failDiscard) throw new Error('测试无法释放编辑状态'); discardProjectPhraseDraft(library, songId, id); },
    onCopyPhrase() { if (failCopy) throw new Error('测试无法另存'); phrase.openDraft(copyProjectPhrase(library, songId, phrase.read().draft!.id).draftId); },
    onPrepareMelody() { prepared++; ensureProjectMelodyTimbres(library, songId); },
    projectTimbres: () => listProjectTimbres(library, songId).map(record => ({ id: record.id, name: record.name, requiresDeleteConfirmation: requiresTimbreDeleteConfirmation(record, library.listDrafts()) })),
    onAddPhraseTimbre: (id, section) => addProjectPhraseTimbre(library, songId, phrase.read().draft!.id, id, section),
    onCreateNoteGroup: id => createProjectPhraseNoteGroup(library, songId, phrase.read().draft!.id, id),
    onChangeNoteGroupTimbre(partId,id) { if (failFamilyChange) throw new Error('测试更换失败'); changeProjectPhraseNoteGroupTimbre(library,songId,phrase.read().draft!.id,partId,id); },
    onRemovePhraseTimbre(id, section) { if (!tryRemoveUnusedProjectTimbre(library, songId, id)) removeProjectPhraseTimbre(library, songId, phrase.read().draft!.id, id, section); },
    onReorderTimbres: (id, targetIndex) => reorderProjectTimbres(library, songId, id, targetIndex),
    onKeepPhrases: ids => retainProjectPhrases(library, songId, ids),
    projectPhrases: () => readProjectPhrases(library, songId), phraseInfo: id => readProjectPhraseInfo(library, songId, id) });
  const find = (selector: string) => { const value = root.querySelector(selector); assert(value, `Expected ${selector}`); return value; };
  const save = () => find('.song-save').emit('click'); const exit = () => find('.song-exit').emit('click');
  const tempo = (value: number) => { const field = root.querySelectorAll('input').find(item => item.attributes.get('aria-label') === 'BPM'); assert(field); field.value = String(value); field.emit('change'); };
  const field = (label: string) => { const input = root.querySelectorAll('input').find(item => item.attributes.get('aria-label') === label); assert(input, `Expected ${label} field`); return input; };
  return { ...dom, library, phrase, song, songId, original, context, session, references, root, saved, workspaces, find, save, exit, tempo, field, studio,
    plans, auditions, adapters, prepared: () => prepared, playback: () => playback, failFamilyChange(value: boolean) { failFamilyChange = value; }, failCopy(value: boolean) { failCopy = value; }, failDiscard(value: boolean) { failDiscard = value; },
    cleanup() { studio.dispose(); dom.restore(); navigationHeight = previousHeight; } };
}
async function enterMelodyWithPiano(f: ReturnType<typeof fixture>): Promise<void> {
  f.find('.phrase-composition-open-creation').emit('click'); await settle();
  assert(f.root.querySelector('.melody-workspace')); assert.equal(f.find('.phrase-composition-main').hidden, true);
  f.find('.melody-add-tone').emit('click');
  const options = f.root.querySelectorAll('.melody-library-tone');
  for(const name of ['钢琴','长笛','底鼓','踢','弦乐','小号','吉他'])assert(options.some(item => item.textContent === name));
  options.find(item => item.textContent === '钢琴')!.emit('click'); await settle();
  assert.equal(f.root.querySelector('.melody-tone-library'), undefined);
  assert(f.root.querySelectorAll('.melody-tone').some(item => item.textContent === '钢琴'));
}

test('double-clicking a hidden project phrase in the library opens its editable original through the real studio route', async () => {
  const f = fixture(); try {
    f.exit(); await settle();
    f.find('.song-new-phrase').emit('click');
    f.find('.song-library-phrase').emit('keydown', { key: 'Enter' });
    assert(!f.root.querySelectorAll('.song-phrase-card').some(card => card.dataset.phraseId === f.original.id));
    const before = structuredClone(f.song.read().body); const source = f.library.readContent(f.original.id);
    const tile = f.root.querySelectorAll('.song-library-phrase').find(item => item.dataset.phraseId === f.original.id); assert(tile);
    tile.emit('click'); tile.emit('dblclick'); await settle();
    assert(f.root.querySelector('.phrase-composition-studio')); assert.equal(f.root.querySelector('.song-phrase-library'), undefined);
    assert.equal(f.phrase.read().draft!.sourceId, f.original.id);
    assert.equal(f.phrase.read().draft!.name, source!.name);
    assert.equal(f.find('.song-project-name').textContent, source!.name); assert.equal(f.find('.song-project-kind').textContent, '乐句');
    assert.deepEqual(f.song.read().body, before); assert.deepEqual(f.library.readContent(f.original.id), source);
    f.find('.phrase-composition-open-creation').emit('click'); await settle(); assert(f.root.querySelector('.melody-workspace'));
  } finally { f.cleanup(); }
});
async function createMelodyNote(f: ReturnType<typeof fixture>, x = 250): Promise<string> {
  const key = f.root.querySelectorAll('.melody-key').find(item => item.textContent === 'C4'); assert(key);
  const scroll = f.find('.melody-scroll'); const canvas = f.find('.melody-canvas');
  const clientY = Number.parseFloat(String(key.style.top)) - scroll.scrollTop + 4;
  scroll.emit('pointerdown', { target: canvas, clientX: x, clientY }); f.document.emit('pointerup'); await settle();
  const current = f.phrase.read().body!.parts.find(part => part.name === '钢琴')!; assert.equal(current.notes.length, 1);
  assert.equal(current.notes[0]!.frequencyHz, Number(key.dataset.frequencyHz));
  return current.notes[0]!.id;
}
async function enterRhythmWithTone(f: ReturnType<typeof fixture>, name = '钢琴'): Promise<string> {
  // Build a legacy rhythm family at the domain boundary, then edit it through
  // the actual unified creation route. No retired rhythm entry is simulated.
  ensureProjectMelodyTimbres(f.library, f.songId);
  const tone = listProjectTimbres(f.library, f.songId).find(item => item.name === name); assert(tone);
  const partId = addProjectPhraseTimbre(f.library, f.songId, f.phrase.read().draft!.id, tone.id, 'rhythm');
  f.tempo(120); await settle();
  f.find('.phrase-composition-open-creation').emit('click'); await settle();
  assert(f.root.querySelector('.melody-workspace')); assert.equal(f.root.querySelector('.rhythm-workspace'), undefined);
  assert.equal(f.find('.phrase-composition-main').hidden, true); assert.equal(f.find('.phrase-composition-section-label').textContent, '创作');
  const card = f.root.querySelectorAll('.melody-note-family').find(item => item.dataset.partId === partId); assert(card); card.emit('click');
  return partId;
}
async function createRhythmNote(f: ReturnType<typeof fixture>, partId: string, x = 250): Promise<string> {
  const card = f.root.querySelectorAll('.melody-note-family').find(item => item.dataset.partId === partId); assert(card); card.emit('click');
  const key = f.root.querySelectorAll('.melody-key').find(item => item.textContent === 'C4'); assert(key);
  const scroll = f.find('.melody-scroll'); const canvas = f.find('.melody-canvas');
  scroll.emit('pointerdown', { target: canvas, clientX: x, clientY: Number.parseFloat(String(key.style.top)) - scroll.scrollTop + 4 });
  f.document.emit('pointerup'); await settle();
  const part = f.phrase.read().body!.parts.find(item => item.id === partId)!; assert.equal(part.notes.length, 1);
  assert.equal(part.section, 'rhythm', 'editing does not rewrite the original family tag');
  assert.equal(f.root.querySelectorAll('select').filter(item => item.attributes.get('aria-label') === '音高').length, 1);
  return part.notes[0]!.id;
}
async function newMelodyFamily(f: ReturnType<typeof fixture>, name: string): Promise<string> {
  f.find('.melody-add-note-family').emit('click');
  const tones = f.root.querySelectorAll('.melody-library-tone'); assert(tones.length);
  assert(tones.every(tone => !tone.attributes.has('aria-pressed') && !tone.classList.contains('is-on-shelf')), 'the family picker has no membership toggle');
  const tone = tones.find(tone => tone.textContent === name); assert(tone); tone.emit('click'); await settle();
  assert.equal(f.root.querySelector('.melody-tone-library'), undefined);
  const selected = f.root.querySelectorAll('.melody-note-family').find(card => card.classList.contains('is-selected')); assert(selected);
  assert.equal(selected.textContent, name); assert(selected.dataset.partId); return selected.dataset.partId;
}
async function changeMelodyFamily(f: ReturnType<typeof fixture>, id: string, name: string): Promise<void> {
  const card=f.root.querySelectorAll('.melody-note-family').find(card=>card.dataset.partId===id);assert(card);card.emit('click');
  f.find('.melody-change-timbre').emit('click');
  const tone=f.root.querySelectorAll('.melody-library-tone').find(tone=>tone.textContent===name);assert(tone);tone.emit('click');await settle();
  assert.equal(f.root.querySelector('.melody-tone-library'),undefined);
}

test('mountStudio routes occurrence editing through the new shell, saves in place twice and exits to an exportable song', async () => {
  const f = fixture(); try {
    assert(f.root.querySelector('.phrase-composition-studio')); assert.equal(f.root.querySelector('.phrase-workspace'), undefined);
    f.tempo(140); f.save(); await settle();
    const first = f.phrase.read().draft!; const firstSession = f.references.resume(first.id)!;
    assert.deepEqual(firstSession.context, f.context); assert.notEqual(first.sourceId, f.original.id);
    assert(f.root.querySelector('.phrase-composition-studio')); assert.equal(f.workspaces.at(-1), 'phrase');
    f.find('.song-project-name').emit('dblclick'); const title = f.find('.song-project-name-input'); title.value = '新的旋律'; title.emit('blur'); await settle();
    f.tempo(155); f.document.emit('keydown', { key: 's', code: 'KeyS', ctrlKey: true }); await settle();
    const second = f.phrase.read().draft!; assert.equal(second.sourceId, first.sourceId); assert.equal(second.name, '新的旋律');
    assert.equal(readPhraseBody(f.library.readContent(second.sourceId!)!.body).tempoBpm, 155);
    const clips = readSongBody(f.library.readDraft(f.songId)!.body).tracks[0]!.clips;
    assert.equal(clips[0]!.phraseId, second.sourceId); assert.equal(clips[1]!.phraseId, f.original.id);
    f.exit(); await settle(); assert(f.root.querySelector('.song-timeline')); assert.equal(f.workspaces.at(-1), 'song');
    assert.equal(f.references.sessions().length, 0); f.save(); await settle(); assert.equal(f.saved.length, 1);
    const output = JSON.parse(f.saved[0]!); assert(output.contents.some((item: { name: string }) => item.name === '新的旋律'));
  } finally { f.cleanup(); }
});

test('a dirty exit asks first, Cancel keeps the scratch work, and Discard restores saved music before returning', async () => {
  const f = fixture(); try {
    const original = f.library.readContent(f.original.id)!; const beforeSong = f.song.read().body;
    f.tempo(165); const draft = f.phrase.read().draft!; f.exit(); await settle();
    assert(f.root.querySelector('.phrase-exit-dialog')); assert.equal(f.root.querySelector('.song-timeline'), undefined);
    assert.deepEqual(f.library.readDraft(draft.id), draft); assert.deepEqual(f.library.readContent(f.original.id), original); assert.deepEqual(f.song.read().body, beforeSong);
    f.find('.phrase-exit-cancel').emit('click'); await settle(); assert.equal(f.root.querySelector('.phrase-exit-dialog'), undefined);
    assert.equal(f.phrase.read().body!.tempoBpm, 165); assert(f.references.resume(draft.id));
    f.exit(); await settle(); f.find('.phrase-exit-discard').emit('click'); await settle();
    assert(f.root.querySelector('.song-timeline')); assert.equal(f.references.resume(draft.id), undefined);
    const clip = f.root.querySelectorAll('.song-clip').find(item => item.dataset.clipId === f.context.path[0]); assert(clip);
    f.find('.song-scroll').emit('dblclick', { target: clip }); await settle();
    assert(f.root.querySelector('.phrase-composition-studio')); assert.equal(f.phrase.read().body!.tempoBpm, 120);
    assert.deepEqual(f.library.readContent(f.original.id), original); assert.deepEqual(f.song.read().body, beforeSong);
  } finally { f.cleanup(); }
});

test('exiting a clean parent asks about nested tone scratch work and Discard removes it without applying it', async () => {
  const f = fixture(); try {
    const part = f.phrase.read().body!.parts[0]!;
    const inner = f.references.begin({ root: { type: 'draft', id: f.session.draftId }, path: [part.id] });
    const tone = f.library.readDraft(inner.draftId)!;
    f.library.updateDraft(tone.id, { body: { ...(tone.body as TimbreBody), level: .19 } }, { remember: true, expected: tone });
    const edited = f.library.readDraft(tone.id); assert.equal(f.phrase.read().changed, false);
    f.exit(); await settle(); assert(f.root.querySelector('.phrase-exit-dialog')); assert.deepEqual(f.library.readDraft(tone.id), edited);
    f.find('.phrase-exit-discard').emit('click'); await settle(); assert(f.root.querySelector('.song-timeline'));
    assert.equal(f.library.readDraft(tone.id), undefined); assert.equal(f.references.resume(f.session.draftId), undefined);
  } finally { f.cleanup(); }
});

test('new production phrases stay drafts until explicit Save and discarding another draft leaves no library item', async () => {
  const f = fixture(); try {
    f.exit(); await settle(); const catalog = readProjectPhrases(f.library, f.songId);
    f.find('.song-new-phrase').emit('click'); f.find('.song-library-new').emit('click'); await settle();
    const draftId = f.phrase.read().draft!.id; assert.equal(f.phrase.read().draft!.sourceId, undefined);
    assert.deepEqual(readProjectPhrases(f.library, f.songId), catalog); assert.equal(f.phrase.read().body!.parts[0]!.notes.length, 0);
    f.tempo(177); assert.throws(() => assertProjectPhraseSaveReady(f.library, f.songId), /未保存/u);
    f.exit(); await settle(); assert(f.root.querySelector('.phrase-exit-dialog')); f.find('.phrase-exit-cancel').emit('click'); await settle();
    assert.equal(f.phrase.read().draft!.id, draftId); assert.deepEqual(readProjectPhrases(f.library, f.songId), catalog);
    f.document.emit('keydown', { key: 's', code: 'KeyS', ctrlKey: true }); await settle();
    const savedId = f.phrase.read().draft!.sourceId!; assert(savedId); assert.equal(f.phrase.read().changed, false);
    assert.equal(readProjectPhrases(f.library, f.songId).length, catalog.length + 1); assert.equal(readPhraseBody(f.library.readContent(savedId)!.body).tempoBpm, 177);
    f.exit(); await settle(); assert(f.root.querySelector('.song-timeline')); assert.doesNotThrow(() => assertProjectPhraseSaveReady(f.library, f.songId));
    f.find('.song-new-phrase').emit('click'); f.find('.song-library-new').emit('click'); await settle();
    const discarded = f.phrase.read().draft!.id; f.exit(); await settle(); f.find('.phrase-exit-discard').emit('click'); await settle();
    assert(f.root.querySelector('.song-timeline')); assert.equal(f.library.readDraft(discarded), undefined);
    assert.equal(readProjectPhrases(f.library, f.songId).length, catalog.length + 1); assert.doesNotThrow(() => assertProjectPhraseSaveReady(f.library, f.songId));
  } finally { f.cleanup(); }
});

test('saving on phrase exit explicitly applies the edited occurrence and closes its clean continuation', async () => {
  const f = fixture(); try {
    const original = f.library.readContent(f.original.id)!; f.tempo(168); f.exit(); await settle();
    assert.deepEqual(f.library.readContent(f.original.id), original); f.find('.phrase-exit-save').emit('click'); await settle();
    assert(f.root.querySelector('.song-timeline')); assert.equal(f.references.sessions().length, 0);
    const clips = f.song.read().body!.tracks[0]!.clips; assert.notEqual(clips[0]!.phraseId, f.original.id); assert.equal(clips[1]!.phraseId, f.original.id);
    assert.equal(readPhraseBody(f.library.readContent(clips[0]!.phraseId)!.body).tempoBpm, 168); assert.deepEqual(f.library.readContent(f.original.id), original);
    assert.doesNotThrow(() => assertProjectPhraseSaveReady(f.library, f.songId));
  } finally { f.cleanup(); }
});

test('window-close preparation flushes scratch work without saving and permits only actual project-level dialogs when requested', async () => {
  const f = fixture(); try {
    const original = f.library.readContent(f.original.id)!; const beforeSong = f.song.read().body;
    f.find('.song-project-name').emit('dblclick'); const name = f.find('.song-project-name-input'); name.value = '尚未保存的草稿';
    await f.studio.prepareClose(); assert.equal(f.phrase.read().draft!.name, '尚未保存的草稿');
    assert.deepEqual(f.library.readContent(f.original.id), original); assert.deepEqual(f.song.read().body, beforeSong);
    for (const kind of ['project-copy-dialog', 'project-exit-dialog', 'phrase-exit-dialog', 'other-modal']) {
      const dialog = new Element('dialog'); dialog.className = kind; f.root.append(dialog); dialog.showModal();
      await assert.rejects(() => f.studio.prepareClose(), /当前窗口/u);
      if (kind === 'project-copy-dialog' || kind === 'project-exit-dialog') await f.studio.prepareClose({ allowProjectDialog: true });
      else await assert.rejects(() => f.studio.prepareClose({ allowProjectDialog: true }), /当前窗口/u);
      dialog.close(); dialog.remove();
    }
    assert.deepEqual(f.library.readContent(f.original.id), original);
  } finally { f.cleanup(); }
});

test('save-as after an occurrence save clears its obsolete clean continuation and the copied phrase can leave and export', async () => {
  const f = fixture(); try {
    f.tempo(145); f.save(); await settle(); const originalSource = f.phrase.read().draft!.sourceId;
    const copyButton = f.root.querySelectorAll('.song-save').find(item => item.textContent === '另存为'); assert(copyButton); copyButton.emit('click'); await settle();
    assert(f.root.querySelector('.phrase-composition-studio')); assert.notEqual(f.phrase.read().draft!.sourceId, originalSource);
    assert.equal(f.phrase.read().changed, false); f.exit(); await settle(); f.save(); await settle();
    assert.equal(f.references.sessions().length, 0); assert.equal(f.saved.length, 1);
  } finally { f.cleanup(); }
});

test('a saved copy remains in the library when cleanup fails, while the original stays reachable for retry', async () => {
  const f = fixture(); try {
    f.tempo(145); f.save(); await settle();
    const previous = f.phrase.read().draft!; const source = f.library.readContent(previous.sourceId!);
    f.failDiscard(true); const before = readProjectPhrases(f.library, f.songId);
    const copyButton = f.root.querySelectorAll('.song-save').find(item => item.textContent === '另存为'); assert(copyButton); copyButton.emit('click'); await settle();
    assert(f.root.querySelector('.phrase-composition-studio')); assert.equal(f.phrase.read().draft!.id, previous.id);
    assert.equal(f.phrase.read().changed, false); assert(f.references.resume(previous.id));
    assert.deepEqual(f.library.readContent(previous.sourceId!), source);
    assert.match(f.find('.phrase-composition-notice').textContent, /已另存新乐句，原草稿仍待处理.*测试无法释放编辑状态/u);
    assert.equal(readProjectPhrases(f.library, f.songId).length, before.length + 1);
    f.failDiscard(false); f.exit(); await settle(); assert(f.root.querySelector('.song-timeline'));
  } finally { f.cleanup(); }
});

test('Save As publishes an unpublished phrase and removes the old scratch draft before song Save', async () => {
  const f = fixture(); try {
    f.exit(); await settle(); f.find('.song-new-phrase').emit('click'); f.find('.song-library-new').emit('click'); await settle();
    f.tempo(186); const previous = f.phrase.read().draft!; assert.equal(previous.sourceId, undefined);
    const copy = f.root.querySelectorAll('.song-save').find(item => item.textContent === '另存为')!; copy.emit('click'); await settle();
    const next = f.phrase.read().draft!; assert.notEqual(next.id, previous.id); assert(next.sourceId); assert.equal(readPhraseBody(next.body).tempoBpm, 186);
    assert.equal(f.library.readDraft(previous.id), undefined); assert.equal(f.phrase.read().changed, false);
    assert.doesNotThrow(() => assertProjectPhraseSaveReady(f.library, f.songId));
    f.exit(); await settle(); f.save(); await settle(); assert.equal(f.saved.length, 1);
    assert(JSON.parse(f.saved[0]!).contents.some((record: { id: string }) => record.id === next.sourceId));
  } finally { f.cleanup(); }
});

test('Save As of a dirty saved phrase restores the original scratch fields without changing its saved source', async () => {
  const f = fixture(); try {
    const original = f.library.readContent(f.original.id)!; f.tempo(169); const previous = f.phrase.read().draft!;
    f.root.querySelectorAll('.song-save').find(item => item.textContent === '另存为')!.emit('click'); await settle();
    const next = f.phrase.read().draft!; assert.notEqual(next.id, previous.id); assert(next.sourceId); assert.equal(readPhraseBody(next.body).tempoBpm, 169);
    assert.equal(readPhraseBody(f.library.readDraft(previous.id)!.body).tempoBpm, 120); assert.equal(f.references.resume(previous.id), undefined);
    assert.deepEqual(f.library.readContent(f.original.id), original); assert.doesNotThrow(() => assertProjectPhraseSaveReady(f.library, f.songId));
    f.exit(); await settle(); f.save(); await settle(); assert.equal(f.saved.length, 1);
  } finally { f.cleanup(); }
});

test('failed Save As keeps unpublished scratch work active and does not run discard', async () => {
  const f = fixture(); try {
    f.exit(); await settle(); f.find('.song-new-phrase').emit('click'); f.find('.song-library-new').emit('click'); await settle();
    f.tempo(187); const previous = f.phrase.read().draft!; const contents = f.library.listContent(); f.failCopy(true);
    f.root.querySelectorAll('.song-save').find(item => item.textContent === '另存为')!.emit('click'); await settle();
    assert.deepEqual(f.phrase.read().draft, previous); assert.deepEqual(f.library.listContent(), contents); assert.match(f.find('.phrase-composition-notice').textContent, /测试无法另存/u);
    f.failCopy(false); f.exit(); await settle(); f.find('.phrase-exit-discard').emit('click'); await settle();
    assert.equal(f.library.readDraft(previous.id), undefined); assert.doesNotThrow(() => assertProjectPhraseSaveReady(f.library, f.songId));
  } finally { f.cleanup(); }
});

test('failed cleanup after unpublished Save As returns to the original draft so it can be discarded', async () => {
  const f = fixture(); try {
    f.exit(); await settle(); f.find('.song-new-phrase').emit('click'); f.find('.song-library-new').emit('click'); await settle();
    f.tempo(188); const previous = f.phrase.read().draft!; const before = readProjectPhrases(f.library, f.songId); f.failDiscard(true);
    f.root.querySelectorAll('.song-save').find(item => item.textContent === '另存为')!.emit('click'); await settle();
    assert.deepEqual(f.phrase.read().draft, previous); assert.equal(readProjectPhrases(f.library, f.songId).length, before.length + 1);
    assert.throws(() => assertProjectPhraseSaveReady(f.library, f.songId), /未保存/u); assert.match(f.find('.phrase-composition-notice').textContent, /原草稿仍待处理/u);
    f.failDiscard(false); f.exit(); await settle(); f.find('.phrase-exit-discard').emit('click'); await settle();
    assert(f.root.querySelector('.song-timeline')); assert.equal(f.library.readDraft(previous.id), undefined);
    assert.doesNotThrow(() => assertProjectPhraseSaveReady(f.library, f.songId));
  } finally { f.cleanup(); }
});

test('production melody creation, detailed mix, held duration, Save and BPM edit return to a portable editable song', async () => {
  const f = fixture({ empty: true }); try {
    await enterMelodyWithPiano(f); assert.equal(f.prepared(), 1);
    const voices = listProjectTimbres(f.library, f.songId); assert(voices.some(item => item.name === '钢琴')); assert(voices.some(item => item.name === '长笛'));
    const id = await createMelodyNote(f); assert.equal(f.phrase.read().body!.parts.length, 1, 'the untouched generated placeholder is replaced');
    const volume = f.field('音量'); volume.value = '.45'; volume.emit('input'); volume.emit('change');
    const pan = f.field('声像'); pan.value = '-.35'; pan.emit('input'); pan.emit('change');
    const duration = f.field('时长 / 秒'); duration.value = '.625'; duration.emit('input'); duration.emit('change');
    let note = f.phrase.read().body!.parts[0]!.notes[0]!; assert.equal(note.id, id); assert.equal(note.startBeat, 4);
    assert.equal(note.durationSeconds, .625); assert.equal(note.level, .45); assert.equal(note.pan, -.35);
    const block = f.root.querySelectorAll('.melody-note').find(item => item.dataset.noteId === id)!; const width = Number.parseFloat(String(block.style.width));
    f.save(); await settle(); assert(f.root.querySelector('.melody-workspace')); assert.equal(f.find('.phrase-composition-main').hidden, true);
    const source = f.phrase.read().draft!.sourceId; assert.notEqual(source, f.original.id);
    f.tempo(240); await settle(); note = f.phrase.read().body!.parts[0]!.notes[0]!;
    assert.equal(note.startBeat, 4); assert.equal(note.durationSeconds, .625);
    const plan = f.phrase.previewPlan(); assert.equal(plan.events[0]!.atSeconds, 1); assert.equal(plan.events[0]!.sound.note.holdSeconds, .625);
    assert.equal(Number.parseFloat(String(f.root.querySelectorAll('.melody-note').find(item => item.dataset.noteId === id)!.style.width)), width);
    f.document.emit('keydown', { key: 's', code: 'KeyS', ctrlKey: true }); await settle();
    assert.equal(f.phrase.read().draft!.sourceId, source); assert(f.root.querySelector('.melody-workspace'));
    f.find('.phrase-melody-back').emit('click'); await settle(); assert.equal(f.find('.phrase-composition-main').hidden, false);
    assert.equal(f.root.querySelector('.melody-workspace'), undefined); f.exit(); await settle();
    const expected = f.song.previewPlan(); f.save(); await settle(); assert.equal(f.saved.length, 1);
    const target = createMaterialLibrary(undefined, { project: { rootKind: 'rootsound.song', adapters: f.adapters } });
    const imported = createProjectPackages(target, f.adapters, { rootKind: 'rootsound.song' }).importProject(f.saved[0]!);
    assert.equal(imported.status, 'imported'); if (imported.status !== 'imported') throw new Error('Expected imported project.');
    const importedPhrase = createPhrasePlayback(target, createTimbrePlayback(target)); const song = createSongEditor(target, importedPhrase, { defaultTempoMode: 'source' });
    song.openDraft(imported.draft.id); assert.deepEqual(song.previewPlan(), expected);
    const restored = target.listContent().filter(item => item.kind === 'rootsound.phrase').flatMap(item => readPhraseBody(item.body).parts.flatMap(part => part.notes));
    assert(restored.some(item => item.durationSeconds === .625 && item.level === .45 && item.pan === -.35));
  } finally { f.cleanup(); }
});

test('production Save As keeps the melody section open and repeated entry does not duplicate the local voice library', async () => {
  const f = fixture({ empty: true }); try {
    await enterMelodyWithPiano(f); const id = await createMelodyNote(f); f.save(); await settle();
    const previousSource = f.phrase.read().draft!.sourceId; const voices = listProjectTimbres(f.library, f.songId).map(item => item.id);
    const copy = f.root.querySelectorAll('.song-save').find(item => item.textContent === '另存为'); assert(copy); copy.emit('click'); await settle();
    assert(f.root.querySelector('.melody-workspace')); assert.equal(f.find('.phrase-composition-main').hidden, true);
    assert.notEqual(f.phrase.read().draft!.sourceId, previousSource); assert.equal(f.phrase.read().changed, false);
    assert(f.root.querySelectorAll('.melody-note').some(item => item.dataset.noteId === id));
    assert.deepEqual(listProjectTimbres(f.library, f.songId).map(item => item.id), voices); assert.equal(f.prepared(), 2);
    f.find('.phrase-melody-back').emit('click'); await settle(); f.exit(); await settle(); f.save(); await settle();
    assert.equal(f.references.sessions().length, 0); assert.equal(f.saved.length, 1);
  } finally { f.cleanup(); }
});

test('melody seek shares the header clock and an uncommitted note mix updates live playback before Save flushes it', async () => {
  const f = fixture({ empty: true }); try {
    await enterMelodyWithPiano(f); await createMelodyNote(f);
    const ruler = f.find('.melody-ruler'); ruler.emit('pointerdown', { clientX: 375 }); f.document.emit('pointerup'); await settle();
    assert.equal(f.find('.song-clock').textContent, '00:03.000');
    f.find('.song-play').emit('click'); await settle(); assert(f.plans.length > 0);
    assert.equal(f.plans.at(-1)!.transport!.positionSeconds, 3); const before = f.phrase.read().draft!; const original = f.plans.at(-1)!.events[0]!.sound.level;
    const duration = f.field('时长 / 秒'); duration.value = '.625'; duration.emit('input'); await settle();
    assert.deepEqual(f.phrase.read().draft, before); assert.equal(f.plans.at(-1)!.events[0]!.sound.note.holdSeconds, .625);
    assert.equal(Number.parseFloat(String(f.find('.melody-note').style.width)), 78.125, 'the held-seconds preview updates the note rectangle before persistence');
    const volume = f.field('音量'); volume.value = '.3'; volume.emit('input'); await settle();
    assert.deepEqual(f.phrase.read().draft, before, 'drag preview does not write until commit');
    assert(f.plans.at(-1)!.events[0]!.sound.level < original);
    f.save(); await settle(); assert.equal(f.phrase.read().body!.parts[0]!.notes[0]!.level, .3); assert.equal(f.phrase.read().body!.parts[0]!.notes[0]!.durationSeconds, .625);
    assert(f.root.querySelector('.melody-workspace')); assert.equal(f.find('.song-play').attributes.get('aria-label'), '暂停');
    f.find('.song-stop').emit('click'); assert.equal(f.find('.song-clock').textContent, '00:00.000');
    assert.equal(f.find('.melody-head-handle').attributes.get('aria-valuenow'), '0');
  } finally { f.cleanup(); }
});

test('legacy rhythm families remain separately editable alongside melody in unified creation and travel through the same song', async () => {
  const f = fixture({ empty: true }); try {
    await enterMelodyWithPiano(f); const melodyId = await createMelodyNote(f); f.save(); await settle();
    const melodyPart = structuredClone(f.phrase.read().body!.parts.find(part => part.notes.some(note => note.id === melodyId))!);
    const source = f.phrase.read().draft!.sourceId;
    f.find('.phrase-melody-back').emit('click'); await settle(); const rhythmPartId = await enterRhythmWithTone(f);
    const rhythmPart = f.phrase.read().body!.parts.find(part => part.id === rhythmPartId)!;
    assert.notEqual(rhythmPart.id, melodyPart.id); assert.equal(rhythmPart.timbreId, melodyPart.timbreId);
    assert.equal(f.root.querySelectorAll('.melody-note').some(item => item.dataset.noteId === melodyId), true);
    const rhythmId = await createRhythmNote(f, rhythmPartId);
    f.field('音量').value = '.6'; f.field('音量').emit('input'); f.field('音量').emit('change');
    f.field('声像').value = '.25'; f.field('声像').emit('input'); f.field('声像').emit('change');
    f.field('时长 / 秒').value = '.375'; f.field('时长 / 秒').emit('input'); f.field('时长 / 秒').emit('change');
    assert.deepEqual(f.phrase.read().body!.parts.find(part => part.id === melodyPart.id), melodyPart);
    f.document.emit('keydown', { key: 's', code: 'KeyS', ctrlKey: true }); await settle();
    assert(f.root.querySelector('.melody-workspace')); assert.equal(f.root.querySelector('.rhythm-workspace'), undefined); assert.equal(f.phrase.read().draft!.sourceId, source);
    assert.equal(f.find('.phrase-composition-section-label').textContent, '创作');
    const note = f.phrase.read().body!.parts.find(part => part.id === rhythmPartId)!.notes[0]!;
    assert.equal(note.id, rhythmId); assert.equal(note.level, .6); assert.equal(note.pan, .25); assert.equal(note.durationSeconds, .375);
    f.find('.phrase-melody-back').emit('click'); await settle(); f.find('.phrase-composition-open-creation').emit('click'); await settle();
    assert(f.root.querySelectorAll('.melody-note').some(item => item.dataset.noteId === melodyId));
    assert.equal(f.root.querySelectorAll('.melody-note').some(item => item.dataset.noteId === rhythmId), true);
    f.find('.phrase-melody-back').emit('click'); await settle(); f.exit(); await settle();
    const expected = f.song.previewPlan(); assert.equal(expected.events.length, 2); f.save(); await settle(); assert.equal(f.saved.length, 1);
    const target = createMaterialLibrary(undefined, { project: { rootKind: 'rootsound.song', adapters: f.adapters } });
    const imported = createProjectPackages(target, f.adapters, { rootKind: 'rootsound.song' }).importProject(f.saved[0]!);
    assert.equal(imported.status, 'imported'); if (imported.status !== 'imported') throw new Error('Expected imported project.');
    const restoredSong = createSongEditor(target, createPhrasePlayback(target, createTimbrePlayback(target)), { defaultTempoMode: 'source' });
    restoredSong.openDraft(imported.draft.id); assert.deepEqual(restoredSong.previewPlan(), expected);
    const restoredParts = target.listContent().filter(item => item.kind === 'rootsound.phrase').flatMap(item => readPhraseBody(item.body).parts);
    assert(restoredParts.some(part => part.section === 'rhythm' && part.notes.some(item => item.id === rhythmId && item.durationSeconds === .375)));
    assert(restoredParts.some(part => part.section !== 'rhythm' && part.notes.some(item => item.id === melodyId)));
  } finally { f.cleanup(); }
});

test('legacy rhythm Save As retains its stored tag inside unified creation and the shared header clock', async () => {
  const f = fixture({ empty: true }); try {
    const partId = await enterRhythmWithTone(f, '长笛'); const id = await createRhythmNote(f, partId); f.save(); await settle();
    const previousSource = f.phrase.read().draft!.sourceId;
    f.find('.melody-ruler').emit('pointerdown', { clientX: 375 }); f.document.emit('pointerup'); await settle();
    assert.equal(f.find('.song-clock').textContent, '00:03.000');
    const copy = f.root.querySelectorAll('.song-save').find(item => item.textContent === '另存为'); assert(copy); copy.emit('click'); await settle();
    assert(f.root.querySelector('.melody-workspace')); assert.equal(f.root.querySelector('.rhythm-workspace'), undefined); assert.equal(f.find('.phrase-composition-section-label').textContent, '创作');
    assert.notEqual(f.phrase.read().draft!.sourceId, previousSource); assert.equal(f.phrase.read().changed, false);
    assert(f.root.querySelectorAll('.melody-note').some(item => item.dataset.noteId === id));
    const body = f.phrase.read().body!; const held = body.parts.find(part => part.section === 'rhythm')!.notes[0]!.durationSeconds;
    f.tempo(240); assert.equal(f.phrase.read().body!.parts.find(part => part.section === 'rhythm')!.notes[0]!.durationSeconds, held);
    assert.equal(f.find('.song-clock').textContent, '00:00.000', 'copy starts its own transport, independent of the previous phrase head');
    f.save(); await settle(); f.find('.phrase-melody-back').emit('click'); await settle(); f.exit(); await settle(); f.save(); await settle();
    assert.equal(f.references.sessions().length, 0); assert.equal(f.saved.length, 1);
  } finally { f.cleanup(); }
});

test('production melody typing writes one cell at a time, preserves rests and travels through safe save and project import', async () => {
  const f = fixture({ empty: true, performance: true }); try {
    await enterMelodyWithPiano(f);
    const press = async (key: string, extra: Record<string, unknown> = {}) => { f.document.emit('keydown', { key, ...extra }); await settle(); };
    await press('c'); let notes = f.phrase.read().body!.parts.flatMap(part => part.notes);
    assert.equal(notes.length, 1); assert.equal(notes[0]!.startBeat, .25); assert.equal(notes[0]!.durationSeconds, .125);
    assert(Math.abs(notes[0]!.frequencyHz - 261.6255653005986) < 1e-9);
    assert.equal(f.find('.song-clock').textContent, '00:00.125');
    assert.equal(f.find('.song-play').attributes.get('aria-label'), '播放');
    await press('f'); notes = f.phrase.read().body!.parts.flatMap(part => part.notes);
    assert.equal(notes.length, 2); assert.equal(notes[1]!.startBeat, .5);
    assert(Math.abs(notes[1]!.frequencyHz - 277.1826309768721) < 1e-9);
    assert.equal(f.find('.song-clock').textContent, '00:00.250');
    const auditions = f.auditions.length; await press(' ', { code: 'Space' });
    assert.equal(f.phrase.read().body!.parts.flatMap(part => part.notes).length, 2);
    assert.equal(f.find('.song-clock').textContent, '00:00.375'); assert.equal(f.plans.length, 0); assert.equal(f.auditions.length, auditions);
    await press('x'); assert.equal(f.find('.song-clock').textContent, '00:00.375'); await press('v');
    notes = f.phrase.read().body!.parts.flatMap(part => part.notes);
    assert.equal(notes.length, 3); assert.equal(notes[2]!.startBeat, 1);
    assert(Math.abs(notes[2]!.frequencyHz - 587.3295358348151) < 1e-9);
    assert.equal(f.find('.song-clock').textContent, '00:00.500');
    assert(f.field('音量'), 'typing selects the newly written note and shows its controls');
    assert(f.root.querySelectorAll('.melody-note').some(block => block.dataset.noteId === notes[2]!.id && block.classList.contains('is-selected')));
    await press('s', { code: 'KeyS', ctrlKey: true }); assert(f.root.querySelector('.melody-workspace'));
    assert.equal(f.find('.song-clock').textContent, '00:00.500');
    const source = f.phrase.read().draft!.sourceId; assert.notEqual(source, f.original.id);
    f.tempo(240); notes = f.phrase.read().body!.parts.flatMap(part => part.notes);
    assert.deepEqual(notes.map(note => note.startBeat), [.25, .5, 1]); assert(notes.every(note => note.durationSeconds === .125));
    assert.equal(f.phrase.previewPlan().events[0]!.atSeconds, .0625);
    assert.equal(f.find('.song-clock').textContent, '00:00.250'); await press('s', { code: 'KeyS', ctrlKey: true });
    assert.equal(f.phrase.read().draft!.sourceId, source);
    f.find('.phrase-melody-back').emit('click'); await settle(); f.exit(); await settle();
    const expected = f.song.previewPlan(); f.save(); await settle(); assert.equal(f.saved.length, 1);
    const target = createMaterialLibrary(undefined, { project: { rootKind: 'rootsound.song', adapters: f.adapters } });
    const imported = createProjectPackages(target, f.adapters, { rootKind: 'rootsound.song' }).importProject(f.saved[0]!);
    assert.equal(imported.status, 'imported'); if (imported.status !== 'imported') throw new Error('Expected imported project.');
    const restored = createSongEditor(target, createPhrasePlayback(target, createTimbrePlayback(target)), { defaultTempoMode: 'source' });
    restored.openDraft(imported.draft.id); assert.deepEqual(restored.previewPlan(), expected);
    const savedNotes = target.listContent().filter(item => item.kind === 'rootsound.phrase').flatMap(item => readPhraseBody(item.body).parts.flatMap(part => part.notes));
    assert(savedNotes.some(note => note.startBeat === 1 && note.durationSeconds === .125 && Math.abs(note.frequencyHz - 587.3295358348151) < 1e-9));
  } finally { f.cleanup(); }
});

test('production keyboard entry guards input and modifiers while legacy families share performance and transport', async () => {
  const f = fixture({ empty: true, performance: true }); try {
    await enterMelodyWithPiano(f); const before = f.phrase.read().draft!;
    for (const extra of [{ repeat: true }, { isComposing: true }, { keyCode: 229 }, { ctrlKey: true }, { metaKey: true }, { altKey: true }]) {
      f.document.emit('keydown', { key: 'c', ...extra }); await settle();
    }
    const bpm = f.field('BPM'); bpm.focus();
    f.document.emit('keydown', { key: 'c', target: bpm }); f.document.emit('keydown', { key: ' ', code: 'Space', target: bpm }); await settle();
    assert.deepEqual(f.phrase.read().draft, before); assert.equal(f.plans.length, 0); assert.equal(f.find('.song-clock').textContent, '00:00.000');
    bpm.blur(); f.find('.melody-scroll').focus(); f.find('.melody-add-tone').emit('click');
    f.document.emit('keydown', { key: 'c' }); f.document.emit('keydown', { key: ' ', code: 'Space' }); await settle();
    assert.deepEqual(f.phrase.read().draft, before); assert.equal(f.plans.length, 0);
    f.find('.melody-library-close').emit('click'); f.find('.melody-scroll').focus();
    f.document.emit('keydown', { key: 'c' }); await settle(); const note = f.phrase.read().body!.parts.flatMap(part => part.notes)[0]!;
    const block = f.root.querySelectorAll('.melody-note').find(item => item.dataset.noteId === note.id)!; assert(block);
    f.find('.melody-scroll').emit('pointerdown', { target: block, clientX: Number.parseFloat(String(block.style.left)) + 1,
      clientY: Number.parseFloat(String(block.style.top)) - f.find('.melody-scroll').scrollTop + 4 });
    f.document.emit('pointerup'); await settle(); assert(f.field('音量'));
    const snapshot = f.phrase.read().draft!; const count = f.plans.length;
    f.document.emit('keydown', { key: ' ', code: 'Space' }); await settle();
    assert.equal(f.plans.length, count + 1); assert.equal(f.find('.song-play').attributes.get('aria-label'), '暂停'); assert.deepEqual(f.phrase.read().draft, snapshot);
    f.find('.song-stop').emit('click'); f.find('.phrase-melody-back').emit('click'); await settle();
    const legacyId = await enterRhythmWithTone(f, '长笛'); const countBefore = f.phrase.read().body!.parts.find(part => part.id === legacyId)!.notes.length;
    f.document.emit('keydown', { key: 'c' }); await settle();
    assert.equal(f.phrase.read().body!.parts.find(part => part.id === legacyId)!.notes.length, countBefore + 1, 'legacy families use the same performance entry');
    const rhythm = f.phrase.read().draft!; const played = f.plans.length;
    f.find('.melody-scroll').emit('pointerdown', { button: 2, target: f.find('.melody-canvas'), clientX: 900, clientY: 5 }); f.document.emit('pointerup'); await settle();
    f.document.emit('keydown', { key: ' ', code: 'Space' }); await settle();
    assert.equal(f.plans.length, played + 1); assert.equal(f.find('.song-play').attributes.get('aria-label'), '暂停'); assert.deepEqual(f.phrase.read().draft, rhythm);
  } finally { f.cleanup(); }
});

test('double-clicking a song shelf phrase opens that source with an independent phrase type label', async () => {
  const f = fixture(); try {
    f.exit(); await settle();
    assert(f.root.querySelector('.song-timeline'));
    assert.equal(f.find('.song-project-kind').textContent, '乐曲');
    const card = f.root.querySelectorAll('.song-phrase-card').find(item => item.dataset.phraseId === f.original.id);
    assert(card); card.emit('click'); card.emit('dblclick'); await settle();
    assert(f.root.querySelector('.phrase-composition-studio'));
    assert.equal(f.phrase.read().draft!.sourceId, f.original.id);
    assert.equal(f.find('.song-project-kind').textContent, '乐句');
    assert.equal(f.find('.song-project-name').textContent, f.library.readContent(f.original.id)!.name);
  } finally { f.cleanup(); }
});

test('newly typed notes stay selected for right-column controls while Backspace undoes edits and right blank exits entry', async () => {
  const f = fixture({ empty: true, performance: true }); try {
    await enterMelodyWithPiano(f);
    const press = async (key: string, extra: Record<string, unknown> = {}) => { f.document.emit('keydown', { key, ...extra }); await settle(); };
    await press('c'); await press('f'); await press(' ', { code: 'Space' });
    const notes = f.phrase.read().body!.parts.flatMap(part => part.notes); assert.equal(notes.length, 2);
    assert.equal(f.find('.song-clock').textContent, '00:00.375'); assert.equal(f.plans.length, 0);
    assert.equal(f.find('.melody-console').parentElement, f.find('.melody-roll'));
    assert(f.root.querySelectorAll('.melody-note').some(block => block.dataset.noteId === notes[1]!.id && block.classList.contains('is-selected')));
    const level = f.field('音量'); level.value = '.4'; level.emit('input'); level.emit('change');
    assert.equal(f.phrase.read().body!.parts.flatMap(part => part.notes)[1]!.level, .4);
    await press('Backspace'); let current = f.phrase.read().body!.parts.flatMap(part => part.notes);
    assert.equal(current.length, 2); assert.equal(current[1]!.level, undefined, 'Backspace undoes the last volume edit instead of deleting the selected note');
    assert.equal(f.find('.song-clock').textContent, '00:00.375', 'musical undo does not invent cursor-only history');
    await press('Delete'); assert.equal(f.phrase.read().body!.parts.flatMap(part => part.notes).length, 1);
    await press('Backspace'); current = f.phrase.read().body!.parts.flatMap(part => part.notes);
    assert.deepEqual(current.map(note => note.id), notes.map(note => note.id), 'Backspace also undoes an explicit Delete');
    await press('v'); assert.equal(f.phrase.read().body!.parts.flatMap(part => part.notes).length, 3, 'undo retains the armed tone for continuous entry');
    assert.equal(f.find('.song-clock').textContent, '00:00.500');
    const before = f.phrase.read().draft!; const scroll = f.find('.melody-scroll'); const canvas = f.find('.melody-canvas');
    scroll.emit('pointerdown', { button: 2, target: canvas, clientX: 900, clientY: 5 }); f.document.emit('pointerup'); await settle();
    assert.equal(f.find('.melody-console').hidden, true);
    assert.equal(f.root.querySelectorAll('.melody-note').some(block => block.classList.contains('is-selected')), false);
    assert.equal(f.root.querySelectorAll('.melody-tone').some(block => block.classList.contains('is-selected')), false);
    assert.deepEqual(f.phrase.read().draft, before, 'right blank clears only selection');
    await press(' ', { code: 'Space' }); assert.equal(f.find('.song-play').attributes.get('aria-label'), '暂停'); assert.equal(f.plans.length, 1);
    f.find('.song-stop').emit('click'); f.find('.phrase-melody-back').emit('click'); await settle();
    const count = f.phrase.read().body!.parts.flatMap(part => part.notes).length;
    await press('Backspace'); assert.equal(f.phrase.read().body!.parts.flatMap(part => part.notes).length, count - 1, 'overview Backspace uses the same phrase undo history');
    f.save(); await settle(); assert(f.root.querySelector('.phrase-composition-main'));
  } finally { f.cleanup(); }
});

test('legacy rhythm note controls use the unified pitch-aware console and right blank clears selection without deletion', async () => {
  const f = fixture({ empty: true }); try {
    const partId = await enterRhythmWithTone(f, '长笛'); const id = await createRhythmNote(f, partId);
    const console = f.find('.melody-console'); assert.equal(console.parentElement, f.find('.melody-roll'));
    assert.equal(console.hidden, false); assert(f.root.querySelectorAll('.melody-note').some(block => block.dataset.noteId === id && block.classList.contains('is-selected')));
    assert.equal(f.root.querySelectorAll('select').some(input => input.attributes.get('aria-label') === '音高'), true);
    const level = f.field('音量'); level.value = '.5'; level.emit('input'); level.emit('change');
    f.document.emit('keydown', { key: 'Backspace' }); await settle();
    let note = f.phrase.read().body!.parts.find(part => part.id === partId)!.notes[0]!; assert.equal(note.id, id); assert.equal(note.level, undefined);
    f.document.emit('keydown', { key: 'Delete' }); await settle(); assert.equal(f.phrase.read().body!.parts.find(part => part.id === partId)!.notes.length, 0);
    f.document.emit('keydown', { key: 'Backspace' }); await settle(); note = f.phrase.read().body!.parts.find(part => part.id === partId)!.notes[0]!; assert.equal(note.id, id);
    const before = f.phrase.read().draft!; const scroll = f.find('.melody-scroll'); const canvas = f.find('.melody-canvas');
    scroll.emit('pointerdown', { button: 2, target: canvas, clientX: 900, clientY: 5 }); f.document.emit('pointerup'); await settle();
    assert.equal(console.hidden, true); assert.deepEqual(f.phrase.read().draft, before);
    assert.equal(f.root.querySelectorAll('.melody-note').some(block => block.classList.contains('is-selected')), false);
    assert.equal(f.root.querySelectorAll('.melody-tone').some(block => block.classList.contains('is-selected')), false);
    f.document.emit('keydown', { key: ' ', code: 'Space' }); await settle();
    assert.equal(f.find('.song-play').attributes.get('aria-label'), '暂停'); assert.equal(f.plans.length, 1);
  } finally { f.cleanup(); }
});

test('production song Backspace undoes mix edits and right blank clears clip, row and shelf selections', async () => {
  const f = fixture(); try {
    f.exit(); await settle(); const scroll = f.find('.song-scroll'); const timeline = f.find('.song-timeline');
    const original = structuredClone(f.song.read().body!); const trackId = original.tracks[0]!.id;
    const row = f.root.querySelectorAll('.song-row-control').find(control => control.dataset.trackId === trackId); assert(row);
    scroll.emit('pointerdown', { target: row, clientX: 10, clientY: 50 }); f.document.emit('pointerup'); await settle();
    f.document.emit('keydown', { key: 's' }); await settle(); assert(f.song.read().body!.tracks[0]!.level < original.tracks[0]!.level);
    f.document.emit('keydown', { key: 'Backspace' }); await settle(); assert.deepEqual(f.song.read().body, original);
    const blank = async () => {
      const before = f.song.read().draft!;
      scroll.emit('pointerdown', { button: 2, target: timeline, clientX: 900, clientY: 500 }); f.document.emit('pointerup'); await settle();
      assert.equal(f.find('.song-inspector').hidden, true);
      assert.equal(f.root.querySelectorAll('.song-row-control').some(control => control.classList.contains('is-selected')), false);
      assert.equal(f.root.querySelectorAll('.song-phrase-card').some(card => card.classList.contains('is-selected')), false);
      assert.equal(f.root.querySelectorAll('.song-clip').some(clip => clip.classList.contains('is-selected')), false);
      assert.deepEqual(f.song.read().draft, before);
    };
    await blank();
    const shelf = f.root.querySelectorAll('.song-phrase-card').find(card => card.dataset.phraseId === f.original.id); assert(shelf); shelf.emit('click'); await settle();
    assert.equal(f.find('.song-inspector').hidden, false); await blank();
    const clip = f.root.querySelectorAll('.song-clip').find(block => block.dataset.clipId === f.context.path[0]); assert(clip);
    scroll.emit('pointerdown', { target: clip, clientX: 160, clientY: 50 }); f.document.emit('pointerup'); await settle();
    assert.equal(f.find('.song-inspector').hidden, false); await blank();
  } finally { f.cleanup(); }
});

test('unified creation keeps all legacy voices in the live schedule through entry, mix, tempo edits and resume', async () => {
  const f = fixture(); try {
    const melody = f.phrase.read().body!.parts[0]!;
    const rhythmId = f.phrase.addPart(melody.timbreId, 'rhythm');
    f.phrase.addNote(rhythmId, { startBeat: 2, durationBeats: .5, frequencyHz: 110, velocity: .8 });
    const original = structuredClone(f.phrase.read().body!);
    const frequencies = () => f.plans.at(-1)!.events.map(event => event.sound.note.frequencyHz).sort((a, b) => a - b);
    f.tempo(120); f.find('.phrase-composition-ruler').emit('pointerdown', { clientX: 375 }); f.document.emit('pointerup');
    assert.equal(f.find('.song-clock').textContent, '00:03.000');
    f.find('.song-play').emit('click'); await settle(); assert.deepEqual(frequencies(), [110, 330]);
    f.find('.phrase-composition-open-creation').emit('click'); await settle();
    assert.deepEqual(frequencies(), [110, 330]); assert.equal(f.plans.at(-1)!.transport!.positionSeconds, 3);
    assert.equal(f.find('.song-clock').textContent, '00:03.000'); assert.deepEqual(f.phrase.read().body, original);
    const beforeLevel = f.plans.at(-1)!.events[0]!.sound.level;
    const master = f.field('总音量'); master.value = '.4'; master.emit('input'); await settle();
    assert.deepEqual(frequencies(), [110, 330]); assert(f.plans.at(-1)!.events[0]!.sound.level < beforeLevel);
    master.emit('change'); await settle(); f.find('.song-play').emit('click'); await settle();
    assert.equal(f.find('.song-play').attributes.get('aria-label'), '播放');
    f.find('.phrase-melody-back').emit('click'); await settle(); f.find('.phrase-composition-open-creation').emit('click'); await settle();
    f.find('.song-play').emit('click'); await settle(); assert.deepEqual(frequencies(), [110, 330]);
    f.tempo(240); await settle(); assert.deepEqual(frequencies(), [110, 330]);
    assert(f.plans.at(-1)!.events.some(event => event.sound.note.frequencyHz === 110 && event.atSeconds === .5));
    f.find('.phrase-melody-back').emit('click'); await settle(); assert.deepEqual(frequencies(), [110, 330]);
    assert.equal(f.find('.song-play').attributes.get('aria-label'), '暂停');
    assert.deepEqual(f.phrase.read().body!.parts.map(part => part.notes.map(note => note.id)), original.parts.map(part => part.notes.map(note => note.id)));
  } finally { f.cleanup(); }
});

test('an empty unified creation keeps the silent phrase clock when returning to overview without content edits', async () => {
  const f = fixture({ empty: true }); try {
    ensureProjectMelodyTimbres(f.library, f.songId); const original = f.phrase.read().draft!;
    f.find('.song-play').emit('click'); await settle(); assert.equal(f.plans.at(-1)!.events.length, 0);
    f.find('.phrase-composition-open-creation').emit('click'); await settle();
    assert.deepEqual(f.plans.at(-1)!.events, []); assert.equal(f.plans.at(-1)!.durationSeconds, 8);
    assert.equal(f.find('.song-play').attributes.get('aria-label'), '暂停'); assert.deepEqual(f.phrase.read().draft, original);
    f.find('.song-play').emit('click'); await settle(); f.find('.song-play').emit('click'); await settle();
    assert.deepEqual(f.plans.at(-1)!.events, []); f.find('.phrase-melody-back').emit('click'); await settle();
    assert.deepEqual(f.plans.at(-1)!.events, []); assert.deepEqual(f.phrase.read().draft, original);
  } finally { f.cleanup(); }
});

test('the production tone library removes an unused starter for the whole song and keeps it removed after reentry and transfer', async () => {
  const f = fixture({ empty: true }); try {
    await enterMelodyWithPiano(f); const noteId = await createMelodyNote(f);
    f.find('.melody-add-tone').emit('click');
    const flute = f.root.querySelectorAll('.melody-library-card').find(card => card.querySelector('.melody-library-tone')?.textContent === '长笛')!;
    const fluteId = flute.dataset.timbreId!; const values = new Map<string, string>();
    const dataTransfer = { effectAllowed: '', dropEffect: '', setData(type: string, value: string) { values.set(type, value); }, getData(type: string) { return values.get(type) ?? ''; } };
    flute.emit('dragstart', { dataTransfer }); f.find('.melody-tone-trash').emit('drop', { dataTransfer }); await settle();
    assert(!f.library.readContent(fluteId)); assert(!f.root.querySelectorAll('.melody-library-tone').some(card => card.textContent === '长笛'));
    assert(f.phrase.read().body!.parts.some(part => part.notes.some(note => note.id === noteId)));
    f.find('.melody-library-close').emit('click'); f.find('.phrase-melody-back').emit('click'); await settle();
    f.find('.phrase-composition-open-creation').emit('click'); await settle(); f.find('.melody-add-tone').emit('click');
    assert(!f.root.querySelectorAll('.melody-library-tone').some(card => card.textContent === '长笛'));
    f.find('.melody-library-close').emit('click'); f.save(); await settle(); f.exit(); await settle(); f.save(); await settle();
    assert.equal(f.saved.length, 1);
    const target = createMaterialLibrary(undefined, { project: { rootKind: 'rootsound.song', adapters: f.adapters } });
    const opened = createProjectPackages(target, f.adapters, { rootKind: 'rootsound.song' }).importProject(f.saved[0]!);
    assert.equal(opened.status, 'imported'); if (opened.status !== 'imported') throw new Error('Expected import');
    assert(!ensureProjectMelodyTimbres(target, opened.draft.id).some(tone => tone.name === '长笛'));
  } finally { f.cleanup(); }
});

test('production tone-card reordering persists across unified-creation reentry without preventing occurrence save', async () => {
  const f = fixture({ empty: true }); try {
    await enterMelodyWithPiano(f); const noteId = await createMelodyNote(f); f.find('.melody-add-tone').emit('click');
    const cards = f.root.querySelectorAll('.melody-library-card'); const source = cards.at(-1)!; const sourceId = source.dataset.timbreId!;
    cards.forEach((card, index) => { card.getBoundingClientRect = () => ({ left: index % 3 * 110, top: Math.floor(index / 3) * 45, right: index % 3 * 110 + 100, bottom: Math.floor(index / 3) * 45 + 36, width: 100, height: 36 }); });
    const values = new Map<string, string>();
    const dataTransfer = { effectAllowed: '', dropEffect: '', setData(type: string, value: string) { values.set(type, value); }, getData(type: string) { return values.get(type) ?? ''; } };
    source.emit('dragstart', { dataTransfer }); const grid = f.find('.melody-library-grid');
    grid.emit('dragover', { dataTransfer, clientX: 50, clientY: 18 }); grid.emit('drop', { dataTransfer }); await settle();
    assert.equal(listProjectTimbres(f.library, f.songId)[0]!.id, sourceId);
    f.find('.melody-library-close').emit('click'); f.find('.phrase-melody-back').emit('click'); await settle();
    f.find('.phrase-composition-open-creation').emit('click'); await settle(); f.find('.melody-add-tone').emit('click');
    assert.equal(f.root.querySelectorAll('.melody-library-card')[0]!.dataset.timbreId, sourceId);
    f.find('.melody-library-close').emit('click'); f.save(); await settle();
    assert.notEqual(f.phrase.read().draft!.sourceId, f.original.id);
    assert(f.phrase.read().body!.parts.some(part => part.notes.some(note => note.id === noteId)));
  } finally { f.cleanup(); }
});

test('production imported-tone removal waits for confirmation and Cancel leaves the library and phrase untouched', async () => {
  const f = fixture({ empty: true }); try {
    await enterMelodyWithPiano(f); const noteId = await createMelodyNote(f);
    const imported = importProjectTimbre(f.library, f.songId, prepareBasicTimbre('我导入的声音'));
    f.find('.melody-add-tone').emit('click');
    const discard = () => {
      const card = f.root.querySelectorAll('.melody-library-card').find(card => card.dataset.timbreId === imported.id)!; assert(card);
      const values = new Map<string, string>();
      const dataTransfer = { effectAllowed: '', dropEffect: '', setData(type: string, value: string) { values.set(type, value); }, getData(type: string) { return values.get(type) ?? ''; } };
      card.emit('dragstart', { dataTransfer }); f.find('.melody-tone-trash').emit('drop', { dataTransfer });
    };
    const before = structuredClone(f.phrase.read().draft); const token = f.library.currentToken();
    discard(); assert(f.root.querySelector('.melody-tone-delete-dialog')); assert(f.library.readContent(imported.id)); assert.equal(f.library.currentToken(), token);
    f.find('.melody-tone-delete-cancel').emit('click'); assert.equal(f.root.querySelector('.melody-tone-delete-dialog'), undefined);
    assert(f.library.readContent(imported.id)); assert.deepEqual(f.phrase.read().draft, before); assert.equal(f.library.currentToken(), token);
    discard(); f.find('.melody-tone-delete-confirm').emit('click'); await settle();
    assert.equal(f.root.querySelector('.melody-tone-delete-dialog'), undefined); assert.equal(f.library.readContent(imported.id), undefined);
    assert(!f.root.querySelectorAll('.melody-library-card').some(card => card.dataset.timbreId === imported.id));
    assert(f.phrase.read().body!.parts.some(part => part.notes.some(note => note.id === noteId)));
    f.find('.melody-library-close').emit('click'); f.save(); await settle(); assert.notEqual(f.phrase.read().draft!.sourceId, f.original.id);
  } finally { f.cleanup(); }
});

test('production header cell resolution survives unified-creation reentry, phrase save and full project import', async () => {
  const f = fixture({ empty: true }); try {
    await enterMelodyWithPiano(f); const noteId = await createMelodyNote(f); const note = structuredClone(f.phrase.read().body!.parts[0]!.notes[0]!);
    const field = f.find('.phrase-grid-select'); field.value = '3'; field.emit('change'); await settle();
    assert.equal(f.phrase.read().body!.stepsPerBeat, 3); assert.equal(f.root.querySelectorAll('.melody-grid-line').length, 49);
    assert.deepEqual(f.phrase.read().body!.parts[0]!.notes[0], note);
    f.find('.phrase-melody-back').emit('click'); await settle(); f.find('.phrase-composition-open-creation').emit('click'); await settle();
    assert.equal(f.find('.phrase-grid-select').value, '3'); assert.equal(f.root.querySelectorAll('.melody-grid-line').length, 49);
    f.save(); await settle(); f.exit(); await settle(); f.save(); await settle();
    const target = createMaterialLibrary(undefined, { project: { rootKind: 'rootsound.song', adapters: f.adapters } });
    const opened = createProjectPackages(target, f.adapters, { rootKind: 'rootsound.song' }).importProject(f.saved[0]!);
    assert.equal(opened.status, 'imported');
    const body = target.listContent().filter(record => record.kind === 'rootsound.phrase').map(record => readPhraseBody(record.body))
      .find(body => body.parts.some(part => part.notes.some(note => note.id === noteId)))!;
    assert.equal(body.stepsPerBeat, 3); assert.deepEqual(body.parts.find(part => part.notes.some(note => note.id === noteId))!.notes.find(note => note.id === noteId), note);
  } finally { f.cleanup(); }
});

test('bar extension remains available while editing a legacy family and survives song save and project import', async () => {
  const f = fixture({ empty: true }); try {
    await enterMelodyWithPiano(f); const initialHead = f.find('.song-clock').textContent;
    f.find('.melody-extend').emit('click'); await settle();
    assert.equal(f.phrase.read().body!.lengthBeats, 20); assert.equal(f.find('.song-clock').textContent, initialHead);
    const part = f.phrase.read().body!.parts.find(part => part.name === '钢琴')!;
    const late = f.phrase.addNote(part.id, { startBeat: 17, durationBeats: .25, durationSeconds: .125, frequencyHz: 440, velocity: .75 });
    f.tempo(120); await settle(); assert(f.root.querySelectorAll('.melody-note').some(note => note.dataset.noteId === late));
    f.find('.phrase-melody-back').emit('click'); await settle();
    f.find('.song-play').emit('click'); await settle();
    assert.equal(f.plans.at(-1)!.durationSeconds, 10); assert.equal(f.plans.at(-1)!.events[0]!.atSeconds, 8.5);
    f.find('.song-stop').emit('click');
    await enterRhythmWithTone(f, '长笛');
    assert.equal(f.phrase.read().body!.lengthBeats, 20); f.find('.melody-extend').emit('click'); await settle();
    assert.equal(f.phrase.read().body!.lengthBeats, 24); f.save(); await settle();
    assert(f.phrase.read().body!.parts.some(voice => voice.notes.some(note => note.id === late)));
    f.find('.phrase-melody-back').emit('click'); await settle();
    f.find('.song-play').emit('click'); await settle(); assert.equal(f.plans.at(-1)!.durationSeconds, 12);
    f.find('.song-stop').emit('click'); f.exit(); await settle(); const expected = f.song.previewPlan(); f.save(); await settle();
    const target = createMaterialLibrary(undefined, { project: { rootKind: 'rootsound.song', adapters: f.adapters } });
    const imported = createProjectPackages(target, f.adapters, { rootKind: 'rootsound.song' }).importProject(f.saved[0]!);
    assert.equal(imported.status, 'imported'); if (imported.status !== 'imported') throw new Error('Expected imported project.');
    const restored = createSongEditor(target, createPhrasePlayback(target, createTimbrePlayback(target)), { defaultTempoMode: 'source' });
    restored.openDraft(imported.draft.id); assert.deepEqual(restored.previewPlan(), expected);
    assert(target.listContent().filter(item => item.kind === 'rootsound.phrase').some(item => {
      const body = readPhraseBody(item.body); return body.lengthBeats === 24 && body.parts.some(part => part.notes.some(note => note.id === late && note.startBeat === 17));
    }));
  } finally { f.cleanup(); }
});

test('performance is disabled by default and enabling it through the shared settings page takes effect in place', async () => {
  const f = fixture({ empty: true }); try {
    await enterMelodyWithPiano(f);
    f.document.emit('keydown', { key: 'c' }); await settle(); assert.equal(f.phrase.read().body!.parts.flatMap(part => part.notes).length, 0);
    assert.equal(f.root.querySelectorAll('.melody-key').some(key => key.classList.contains('is-entry-range')), false);
    const actions = f.find('.song-file-actions').children; assert.equal(actions[0]!.textContent, '设置'); assert.equal(actions[1]!.textContent, '保存');
    f.find('.song-settings').emit('click'); await settle();
    const setting = f.root.querySelectorAll('input').find(input => input.attributes.get('aria-label') === '键盘演奏'); assert(setting);
    Object.assign(setting, { checked: true }); f.find('.settings-dialog').querySelector('form')!.emit('submit'); await settle();
    assert.equal(f.root.querySelector('.settings-dialog'), undefined); assert(f.root.querySelector('.melody-workspace'));
    f.find('.melody-scroll').focus(); f.document.emit('keydown', { key: 'c' }); await settle();
    assert.equal(f.phrase.read().body!.parts.flatMap(part => part.notes).length, 1);
    assert(f.root.querySelectorAll('.melody-key').some(key => key.classList.contains('is-entry-range')));
  } finally { f.cleanup(); }
});

test('an undefined legacy rhythm family uses the single-choice replacement library without losing notes or identity', async () => {
  const f = fixture({ empty: true }); try {
    const partId = await enterRhythmWithTone(f); const noteId = await createRhythmNote(f, partId);
    const original = structuredClone(f.phrase.read().body!.parts.find(part => part.id === partId)!); const identity = f.phrase.read().draft!.id;
    f.phrase.setPartVisible(partId, false); f.tempo(120); await settle();
    const card = f.root.querySelectorAll('.melody-note-family').find(card => card.dataset.partId === partId); assert(card); assert.equal(card.textContent, '未定义'); card.emit('click');
    f.find('.melody-change-timbre').emit('click');
    const tones = f.root.querySelectorAll('.melody-library-tone'); assert(tones.every(tone => !tone.attributes.has('aria-pressed')));
    f.find('.melody-library-close').emit('click'); assert.equal(f.phrase.read().body!.parts.find(part => part.id === partId)!.unassigned, true);
    await changeMelodyFamily(f, partId, '长笛');
    const rebound = f.phrase.read().body!.parts.find(part => part.id === partId)!;
    assert.equal(rebound.section, 'rhythm'); assert.equal(rebound.unassigned, undefined); assert.equal(rebound.name, '长笛');
    assert.deepEqual(rebound.notes, original.notes); assert.equal(rebound.notes[0]!.id, noteId); assert.equal(f.phrase.read().draft!.id, identity);
    assert.equal(f.phrase.previewPlan().events.length, 1); f.save(); await settle();
    assert(f.root.querySelector('.melody-workspace')); assert.equal(f.phrase.read().body!.parts.find(part => part.id === partId)!.section, 'rhythm');
  } finally { f.cleanup(); }
});

test('production tone previews do not select library cards, add parts or mutate note assignments',async()=>{
 const f=fixture({empty:true});try{
  f.find('.phrase-composition-open-creation').emit('click');await settle();f.find('.melody-add-tone').emit('click');
  const before=f.phrase.read().draft!;const card=f.root.querySelectorAll('.melody-library-card').find(card=>card.querySelector('.melody-library-tone')?.textContent==='小号');assert(card);
  const play=card.querySelector('.melody-tone-preview');assert(play);play.emit('click');await settle();
  assert.equal(f.auditions.length,1);assert.equal(f.root.querySelector('.melody-tone-library')?.attributes.has('open'),true);assert.deepEqual(f.phrase.read().draft,before);
  assert.equal(card.querySelector('.melody-library-tone')!.attributes.has('aria-pressed'),false);
  const piano=f.root.querySelectorAll('.melody-library-tone').find(card=>card.textContent==='钢琴')!;piano.emit('click');await settle();assert.equal(f.root.querySelector('.melody-tone-library'),undefined);
  const selected=f.phrase.read().draft!;const shelf=f.root.querySelectorAll('.melody-tone-entry').find(card=>card.querySelector('.melody-tone')?.textContent==='钢琴');assert(shelf);
  const count=f.auditions.length;shelf.querySelector('.melody-tone-preview')!.emit('click');await settle();assert.equal(f.auditions.length,count+1);assert.deepEqual(f.phrase.read().draft,selected);
 }finally{f.cleanup();}
});

test('production tone trash removes all unified phrase uses atomically, keeps the project asset and supports undo and portable save',async()=>{
 const f=fixture({empty:true});try{
  await enterMelodyWithPiano(f);const melodyId=await createMelodyNote(f);const melodyPart=structuredClone(f.phrase.read().body!.parts.find(part=>part.notes.some(note=>note.id===melodyId))!);
  f.find('.phrase-melody-back').emit('click');await settle();const rhythmPartId=await enterRhythmWithTone(f);const rhythmId=await createRhythmNote(f,rhythmPartId);const rhythm=structuredClone(f.phrase.read().body!.parts.find(part=>part.id===rhythmPartId)!);
  f.find('.phrase-melody-back').emit('click');await settle();f.find('.phrase-composition-open-creation').emit('click');await settle();f.find('.melody-add-tone').emit('click');
  const card=f.root.querySelectorAll('.melody-library-card').find(card=>card.querySelector('.melody-library-tone')?.textContent==='钢琴');assert(card);
  const data=new Map<string,string>();const dataTransfer={effectAllowed:'',dropEffect:'',setData(type:string,value:string){data.set(type,value);},getData(type:string){return data.get(type)??'';}};
  card.emit('dragstart',{dataTransfer});const trash=f.find('.melody-tone-trash');assert.equal(trash.hidden,false);trash.emit('dragover',{dataTransfer});trash.emit('drop',{dataTransfer});card.emit('dragend',{dataTransfer});await settle();
  assert(f.root.querySelector('.melody-tone-library'));assert.equal(f.phrase.read().body!.parts.some(part=>part.id===melodyPart.id),false);
  assert.equal(f.phrase.read().body!.parts.some(part=>part.id===rhythmPartId),false);assert(f.library.readContent(melodyPart.timbreId));
  assert(listProjectTimbres(f.library,f.songId).some(timbre=>timbre.id===melodyPart.timbreId));f.find('.melody-library-close').emit('click');
  f.document.emit('keydown',{key:'Backspace'});await settle();assert.deepEqual(f.phrase.read().body!.parts.find(part=>part.id===melodyPart.id),melodyPart);assert.deepEqual(f.phrase.read().body!.parts.find(part=>part.id===rhythmPartId),rhythm);
  f.document.emit('keydown',{key:'y',ctrlKey:true});await settle();assert.equal(f.phrase.read().body!.parts.some(part=>part.id===melodyPart.id),false);
  f.save();await settle();f.find('.phrase-melody-back').emit('click');await settle();f.exit();await settle();f.save();await settle();
  const target=createMaterialLibrary(undefined,{project:{rootKind:'rootsound.song',adapters:f.adapters}});const imported=createProjectPackages(target,f.adapters,{rootKind:'rootsound.song'}).importProject(f.saved[0]!);
  assert.equal(imported.status,'imported');assert(target.listContent().some(record=>record.kind==='rootsound.timbre'&&record.name==='钢琴'));
  const parts=target.listContent().filter(record=>record.kind==='rootsound.phrase').flatMap(record=>readPhraseBody(record.body).parts);
  assert.equal(parts.some(part=>part.notes.some(note=>note.id===rhythmId)),false);assert.equal(parts.some(part=>part.notes.some(note=>note.id===melodyId)),false);
 }finally{f.cleanup();}
});

test('double Delete on a selected production tone clears its notes in one undo without deleting the tone or other section',async()=>{
 const f=fixture({empty:true});try{
  await enterMelodyWithPiano(f);await createMelodyNote(f);const part=f.phrase.read().body!.parts.find(part=>part.name==='钢琴')!;
  f.phrase.addNote(part.id,{startBeat:3,durationBeats:.25,frequencyHz:440,velocity:.75});const rhythm=f.phrase.addPart(part.timbreId,'rhythm');
  f.phrase.addNote(rhythm,{startBeat:2,durationBeats:.25,frequencyHz:110,velocity:.75});f.tempo(120);await settle();const before=structuredClone(f.phrase.read().body!);
  f.root.querySelectorAll('.melody-tone').find(card=>card.textContent==='钢琴')!.emit('click');f.document.emit('keydown',{key:'Delete'});await settle();assert.equal(f.phrase.read().body!.parts.find(value=>value.id===part.id)!.notes.length,2);
  f.document.emit('keydown',{key:'Delete'});await settle();assert.equal(f.phrase.read().body!.parts.find(value=>value.id===part.id)!.notes.length,0);assert.equal(f.phrase.read().body!.parts.find(value=>value.id===rhythm)!.notes.length,1);
  assert(f.library.readContent(part.timbreId));f.document.emit('keydown',{key:'Backspace'});await settle();assert.deepEqual(f.phrase.read().body,before);
 }finally{f.cleanup();}
});

test('Melody plus creates independent total-note families even when choosing an already-used tone',async()=>{
 const f=fixture({empty:true});try{
  f.find('.phrase-composition-open-creation').emit('click');await settle();
  const one=await newMelodyFamily(f,'钢琴');const first=f.phrase.read().body!.parts.find(part=>part.id===one)!;
  const note1=f.phrase.addNote(one,{startBeat:1,durationBeats:.25,durationSeconds:.125,frequencyHz:440,velocity:.7});f.tempo(120);await settle();
  const before=structuredClone(f.phrase.read().body!.parts.find(part=>part.id===one));
  const two=await newMelodyFamily(f,'钢琴');assert.notEqual(two,one);
  assert.equal(f.phrase.read().body!.parts.find(part=>part.id===two)!.timbreId,first.timbreId);assert.deepEqual(f.phrase.read().body!.parts.find(part=>part.id===one),before);
  assert.equal(f.phrase.read().body!.parts.filter(part=>(part.section??'melody')==='melody').length,2);
  assert.equal(f.root.querySelectorAll('.melody-note-family').filter(card=>card.textContent==='钢琴').length,2);
  const note2=f.phrase.addNote(two,{startBeat:2,durationBeats:.25,durationSeconds:.125,frequencyHz:660,velocity:.8});f.tempo(120);await settle();
  f.root.querySelectorAll('.melody-note-family').find(card=>card.dataset.partId===one)!.emit('click');
  const block=(id:string)=>f.root.querySelectorAll('.melody-note').find(block=>block.dataset.noteId===id)!;
  assert.equal(block(note1).classList.contains('is-dim'),false);assert.equal(block(note2).classList.contains('is-dim'),true,'same-tone families have distinct selection contexts');
  assert.equal(listProjectTimbres(f.library,f.songId).filter(tone=>tone.name==='钢琴').length,1,'families share the sound entity');
  const snapshot=f.phrase.read().draft!;f.find('.melody-add-note-family').emit('click');f.find('.melody-library-close').emit('click');assert.deepEqual(f.phrase.read().draft,snapshot,'cancel does not create an empty family');
 }finally{f.cleanup();}
});

test('changing one total-note family tone keeps its notes and sibling families through Undo, save and portable import',async()=>{
 const f=fixture({empty:true});try{
  f.find('.phrase-composition-open-creation').emit('click');await settle();const one=await newMelodyFamily(f,'钢琴');
  f.phrase.addNote(one,{startBeat:1.25,durationBeats:.5,durationSeconds:.28,frequencyHz:440,velocity:.62,level:.44,pan:-.3});
  const two=await newMelodyFamily(f,'钢琴');f.phrase.addNote(two,{startBeat:3,durationBeats:.25,durationSeconds:.125,frequencyHz:660,velocity:.7});
  const rhythm=f.phrase.addPart(f.phrase.read().body!.parts.find(part=>part.id===one)!.timbreId,'rhythm');f.phrase.addNote(rhythm,{startBeat:2,durationBeats:.25,frequencyHz:110,velocity:.8});f.tempo(120);await settle();
  const before=structuredClone(f.phrase.read().body!);await changeMelodyFamily(f,one,'长笛');
  const changed=structuredClone(f.phrase.read().body!);const target=changed.parts.find(part=>part.id===one)!;
  assert.equal(target.name,'长笛');assert.deepEqual(target.notes,before.parts.find(part=>part.id===one)!.notes);assert.notEqual(target.timbreId,before.parts.find(part=>part.id===one)!.timbreId);
  assert.deepEqual(changed.parts.find(part=>part.id===two),before.parts.find(part=>part.id===two));assert.deepEqual(changed.parts.find(part=>part.id===rhythm),before.parts.find(part=>part.id===rhythm));
  f.document.emit('keydown',{key:'Backspace'});await settle();assert.deepEqual(f.phrase.read().body,before);f.document.emit('keydown',{key:'y',ctrlKey:true});await settle();assert.deepEqual(f.phrase.read().body,changed);
  f.save();await settle();assert(f.root.querySelector('.melody-workspace'));assert.deepEqual(f.phrase.read().body!.parts,changed.parts);
  f.exit();await settle();const expected=f.song.previewPlan();f.save();await settle();
  const targetLibrary=createMaterialLibrary(undefined,{project:{rootKind:'rootsound.song',adapters:f.adapters}});
  const imported=createProjectPackages(targetLibrary,f.adapters,{rootKind:'rootsound.song'}).importProject(f.saved[0]!);assert.equal(imported.status,'imported');if(imported.status!=='imported')throw new Error('Expected imported project');
  const restored=createSongEditor(targetLibrary,createPhrasePlayback(targetLibrary,createTimbrePlayback(targetLibrary)),{defaultTempoMode:'source'});restored.openDraft(imported.draft.id);assert.deepEqual(restored.previewPlan(),expected);
  const family=targetLibrary.listContent().filter(record=>record.kind==='rootsound.phrase').flatMap(record=>readPhraseBody(record.body).parts).find(part=>part.id===one);assert(family);assert.equal(family.name,'长笛');assert.deepEqual(family.notes,target.notes);
 }finally{f.cleanup();}
});

test('an existing undefined total-note family can pick a new tone and failed replacement keeps the picker and data intact',async()=>{
 const f=fixture({empty:true});try{
  await enterMelodyWithPiano(f);const id=await createMelodyNote(f);const original=f.phrase.read().body!.parts.find(part=>part.notes.some(note=>note.id===id))!;
  f.phrase.setPartVisible(original.id,false);f.tempo(120);await settle();assert.equal(f.root.querySelectorAll('.melody-note-family').find(card=>card.dataset.partId===original.id)!.textContent,'未定义');
  const before=f.phrase.read().draft!;f.root.querySelectorAll('.melody-note-family').find(card=>card.dataset.partId===original.id)!.emit('click');f.find('.melody-change-timbre').emit('click');
  f.failFamilyChange(true);f.root.querySelectorAll('.melody-library-tone').find(tone=>tone.textContent==='吉他')!.emit('click');await settle();
  assert(f.root.querySelector('.melody-tone-library'));assert.deepEqual(f.phrase.read().draft,before);assert.match(f.find('.melody-library-error').textContent,/测试更换失败/u);f.failFamilyChange(false);
  f.root.querySelectorAll('.melody-library-tone').find(tone=>tone.textContent==='吉他')!.emit('click');await settle();assert.equal(f.root.querySelector('.melody-tone-library'),undefined);
  const current=f.phrase.read().body!.parts.find(part=>part.id===original.id)!;assert.equal(current.unassigned,undefined);assert.equal(current.name,'吉他');assert.deepEqual(current.notes,original.notes);assert.equal(f.phrase.previewPlan().events.length,1);
 }finally{f.cleanup();}
});

test('changing an existing family retains its formerly implicit tone as a project library asset',async()=>{
 const f=fixture();try{
  const initial=f.phrase.read().body!.parts[0]!, oldTone=f.library.readContent(initial.timbreId)!;
  assert.equal(f.library.currentProjectView!(f.songId)!.memberIds.includes(oldTone.id),false);
  f.find('.phrase-composition-open-creation').emit('click');await settle();await changeMelodyFamily(f,initial.id,'长笛');
  assert(f.library.currentProjectView!(f.songId)!.memberIds.includes(oldTone.id));assert(listProjectTimbres(f.library,f.songId).some(tone=>tone.id===oldTone.id));
  assert.deepEqual(f.library.readContent(oldTone.id),oldTone);assert.deepEqual(f.phrase.read().body!.parts.find(part=>part.id===initial.id)!.notes,initial.notes);
 }finally{f.cleanup();}
});

test('unified overview previews preserve melody and legacy rhythm identities through editing, replacement and deletion', async () => {
  const f = fixture({ empty: true }); try {
    const host = () => f.find('.phrase-composition-melody').querySelector('.phrase-composition-notes')!;
    const previews = (section: 'melody' | 'rhythm') => {
      const ids = new Set(f.phrase.read().body!.parts.filter(part => (part.section ?? 'melody') === section).map(part => part.id));
      return host().querySelectorAll('.phrase-overview-note').filter(note => ids.has(note.dataset.partId!));
    };
    const block = (section: 'melody' | 'rhythm', id: string) => { const note = previews(section).find(item => item.dataset.noteId === id); assert(note); return note; };
    const near = (actual: unknown, expected: number) => assert(Math.abs(Number.parseFloat(String(actual)) - expected) < 1e-8, `${actual} != ${expected}`);
    const back = async () => { f.find('.phrase-melody-back').emit('click'); await settle(); f.flushFrames(); };
    const removeSelected = async (id: string) => {
      const note = f.root.querySelectorAll('.melody-note').find(item => item.dataset.noteId === id); assert(note);
      const scroll = f.find('.melody-scroll');
      scroll.emit('pointerdown', { target: note, clientX: Number.parseFloat(String(note.style.left)) + .5,
        clientY: Number.parseFloat(String(note.style.top)) - scroll.scrollTop + 2 });
      f.document.emit('pointerup'); f.document.emit('keydown', { target: scroll, key: 'Delete' }); await settle();
    };
    assert.deepEqual(previews('melody'), []); assert.deepEqual(previews('rhythm'), []);
    await enterMelodyWithPiano(f);
    const shortId = await createMelodyNote(f, 125);
    const hold = f.field('时长 / 秒'); hold.value = '.015'; hold.emit('input'); hold.emit('change');
    const key = f.root.querySelectorAll('.melody-key').find(item => item.textContent === 'C4')!;
    const scroll = f.find('.melody-scroll');
    scroll.emit('pointerdown', { target: f.find('.melody-canvas'), clientX: 375,
      clientY: Number.parseFloat(String(key.style.top)) - scroll.scrollTop + 4 });
    f.document.emit('pointerup'); await settle();
    const melody = f.phrase.read().body!.parts.find(part => part.name === '钢琴')!;
    const longId = melody.notes.find(note => note.id !== shortId)!.id;
    const longHold = f.field('时长 / 秒'); longHold.value = '2.5'; longHold.emit('input'); longHold.emit('change');
    await back(); const originalPreview = block('melody', shortId);
    assert.equal(originalPreview.style.backgroundColor, toneColor(melody.timbreId));
    f.find('.phrase-composition-open-creation').emit('click'); await settle();
    await changeMelodyFamily(f, melody.id, '长笛');
    const flute = f.phrase.read().body!.parts.find(part => part.id === melody.id)!;
    await back();
    assert.deepEqual(new Set(previews('melody').map(note => note.dataset.noteId)), new Set([shortId, longId]));
    assert.deepEqual(previews('rhythm'), []);
    assert.equal(block('melody', shortId), originalPreview, 'a tone change refreshes the already-existing preview identity');
    assert.equal(block('melody', shortId).style.backgroundColor, toneColor(flute.timbreId));

    const rhythmId = await enterRhythmWithTone(f, '踢'), rhythmNoteId = await createRhythmNote(f, rhythmId, 125);
    await back();
    assert.deepEqual(previews('rhythm').map(note => note.dataset.noteId), [rhythmNoteId]);
    assert(previews('melody').every(note => note.dataset.partId === melody.id));
    assert(previews('rhythm').every(note => note.dataset.partId === rhythmId));
    const scale = f.find('.phrase-composition-viewport').clientWidth / 8;
    near(block('melody', shortId).style.left, scale); near(block('melody', shortId).style.width, .015 * scale);
    near(block('melody', longId).style.left, 3 * scale); near(block('melody', longId).style.width, 2.5 * scale);
    const notesBeforeTempo = structuredClone(f.phrase.read().body!.parts.flatMap(part => part.notes));
    f.tempo(240); await settle(); f.flushFrames();
    near(block('melody', shortId).style.left, .5 * scale); near(block('melody', shortId).style.width, .015 * scale);
    near(block('melody', longId).style.left, 1.5 * scale); near(block('melody', longId).style.width, 2.5 * scale);
    assert.deepEqual(f.phrase.read().body!.parts.flatMap(part => part.notes), notesBeforeTempo);
    const plan = f.phrase.previewPlan();
    assert(plan.events.some(event => Math.abs(event.atSeconds - .5) < 1e-8 && event.sound.note.holdSeconds === .015));
    assert(plan.events.some(event => Math.abs(event.atSeconds - 1.5) < 1e-8 && event.sound.note.holdSeconds === 2.5));

    f.find('.phrase-composition-open-creation').emit('click'); await settle(); await removeSelected(shortId); await back();
    assert.deepEqual(previews('melody').map(note => note.dataset.noteId), [longId]);
    assert.deepEqual(previews('rhythm').map(note => note.dataset.noteId), [rhythmNoteId]);
    f.find('.phrase-composition-open-creation').emit('click'); await settle(); await removeSelected(rhythmNoteId); await back();
    assert.deepEqual(previews('rhythm'), []); assert.deepEqual(previews('melody').map(note => note.dataset.noteId), [longId]);
  } finally { f.cleanup(); }
});

test('overview and unified detailed creation retain time and vertical navigation, with one running head and inert console gestures', async () => {
  const f = fixture({ navigationHeight: 140 }); try {
    const back = async () => { f.find('.phrase-melody-back').emit('click'); await settle(); f.flushFrames(); };
    const host = () => f.find('.phrase-composition-melody').querySelector('.phrase-composition-notes')!;
    const near = (actual: unknown, expected: number) => assert(Math.abs(Number.parseFloat(String(actual)) - expected) < 1e-8, `${actual} != ${expected}`);
    const onlyOneHead = () => {
      const visible = (node: Element) => { let current: Element | undefined = node; while (current) { if (current.hidden) return false; current = current.parentElement; } return true; };
      assert.equal([...f.root.querySelectorAll('.phrase-composition-playhead'), ...f.root.querySelectorAll('.melody-playhead')].filter(visible).length, 1);
    };
    f.find('.phrase-composition-open-creation').emit('click'); await settle(); await back();
    const melody = f.phrase.read().body!.parts[0]!;
    const noteId = f.phrase.addNote(melody.id, { startBeat: 6, durationBeats: .4, durationSeconds: .2, frequencyHz: 330, velocity: .7 });
    f.phrase.setLength(32); const legacyPartId = f.phrase.addPart(melody.timbreId, 'rhythm');
    const legacyNoteId = f.phrase.addNote(legacyPartId, { startBeat: 6, durationBeats: .4, durationSeconds: .2, frequencyHz: 330, velocity: .7 });
    f.tempo(120); await settle(); f.flushFrames();
    const before = structuredClone(f.phrase.read().draft), token = f.library.currentToken();
    const viewport = f.find('.phrase-composition-viewport');
    f.find('.phrase-composition-ruler').emit('pointerdown', { clientX: 500 }); f.document.emit('pointerup');
    assert.equal(f.find('.song-clock').textContent, '00:04.000');
    f.find('.song-play').emit('click'); await settle(); const playingId = f.playback()!.id; onlyOneHead();
    viewport.emit('wheel', { target: f.find('.phrase-composition-melody'), ctrlKey: true, deltaY: -Math.log(2) / .002, clientX: 500, clientY: 70 }); f.flushFrames();
    const initialTop = Number(host().dataset.top), left = Number(viewport.dataset.leftSeconds);
    viewport.emit('pointerdown', { target: f.find('.phrase-composition-melody'), clientX: 600, clientY: 200 });
    f.document.emit('pointermove', { clientX: 560, clientY: 170 }); f.flushFrames(); f.document.emit('pointerup');
    assert(Number(viewport.dataset.leftSeconds) > left); near(host().dataset.top, initialTop + 30);
    const navigation = { left: viewport.dataset.leftSeconds, top: host().dataset.top, zoom: viewport.dataset.zoom, time: f.find('.song-clock').textContent };
    const console = f.find('.phrase-composition-console');
    console.emit('wheel', { deltaY: 60, ctrlKey: true });
    console.emit('pointerdown', { clientX: 600, clientY: 620 });
    f.document.emit('pointermove', { clientX: 200, clientY: 100 }); f.document.emit('pointerup'); f.flushFrames();
    assert.deepEqual({ left: viewport.dataset.leftSeconds, top: host().dataset.top, zoom: viewport.dataset.zoom, time: f.find('.song-clock').textContent }, navigation);
    f.find('.phrase-composition-open-creation').emit('click'); await settle();
    const scroll = f.find('.melody-scroll'); near(scroll.scrollTop, initialTop + 30);
    scroll.emit('wheel', { ctrlKey: true, deltaY: -Math.log(1.25) / .002, clientX: 500, clientY: 70 });
    scroll.emit('wheel', { deltaY: -80, clientX: 500, clientY: 70 }); f.document.emit('keydown', { target: scroll, key: 'ArrowUp' }); f.flushFrames();
    const top = scroll.scrollTop; onlyOneHead(); await back(); near(host().dataset.top, top);
    const sharedLeft = Number(viewport.dataset.leftSeconds), span = Number(viewport.dataset.visibleSeconds);
    f.find('.phrase-composition-open-creation').emit('click'); await settle(); near(f.find('.melody-scroll').scrollTop, top);
    for (const id of [noteId, legacyNoteId]) {
      const note = f.root.querySelectorAll('.melody-note').find(note => note.dataset.noteId === id); assert(note);
      near(note.style.left, (3 - sharedLeft) * 1000 / span); near(note.style.width, .2 * 1000 / span);
    }
    onlyOneHead(); await back(); onlyOneHead();
    assert.equal(f.playback()!.id, playingId); assert.equal(f.playback()!.status, 'playing');
    assert.equal(f.find('.song-play').attributes.get('aria-label'), '暂停'); assert.equal(f.find('.song-clock').textContent, '00:04.000');
    assert.equal(f.library.currentToken(), token); assert.deepEqual(f.phrase.read().draft, before);
  } finally { f.cleanup(); }
});

test('a detailed-editor change shares one fresh phrase view with its header instead of rereading and repainting the editor', async () => {
  const f = fixture({ empty: true });
  const read = f.phrase.read;
  try {
    await enterMelodyWithPiano(f);
    const id = await createMelodyNote(f);
    const before = read().body!.parts.flatMap(part => part.notes).find(note => note.id === id)!;
    let reads = 0;
    f.phrase.read = () => { reads++; return read(); };
    f.document.emit('keydown', { key: 's', target: f.find('.melody-scroll') });
    await settle();
    assert.equal(reads, 1, 'the editor reads the committed view once; scope synchronization and the parent reuse it');
    const after = read().body!.parts.flatMap(part => part.notes).find(note => note.id === id)!;
    assert(after.level! < (before.level ?? 1));
    assert.equal(after.startBeat, before.startBeat);
    assert.equal(after.frequencyHz, before.frequencyHz);
    assert.equal(f.root.querySelectorAll('.melody-note').length, 1);

    reads = 0;
    f.tempo(180);
    await settle();
    assert.equal(reads, 1, 'an outer header refresh also supplies its view to the detailed editor');
    assert.equal(read().body!.tempoBpm, 180);
    assert.equal(f.root.querySelectorAll('.melody-note').length, 1);
  } finally {
    f.phrase.read = read;
    f.cleanup();
  }
});
