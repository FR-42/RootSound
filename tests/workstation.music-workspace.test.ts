import { listDefaultInstruments } from '../src/workstation/modules/timbre/instrument-catalog.ts';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import { test } from 'node:test';
import type { PlayableNotePlan, SoundRuntimePort, SoundSequencePlan } from '../src/workstation/contracts/sound.ts';
import type { ProjectDirectoriesPort } from '../src/workstation/contracts/project-directory.ts';
import type { MusicWorkspaceStatePort } from '../src/workstation/contracts/workspace.ts';
import type { PhraseBody } from '../src/workstation/contracts/phrase.ts';
import type { LearningAction } from '../src/workstation/contracts/guidance.ts';
import { createMusicWorkspaceState } from '../src/workstation/app/platform/music-workspace-state.ts';
import { createWorkspacePreferences } from '../src/workstation/app/platform/preferences.ts';
import { createLearningSettings } from '../src/workstation/app/platform/learning-settings.ts';
import { createInitialProjectLibrary, createProjectSetup } from '../src/workstation/app/project-setup.ts';
import { openMusicDocument, commitMusicDocument } from '../src/workstation/app/music-document.ts';
import { createMaterialLibrary } from '../src/workstation/modules/materials/public.ts';
import { createTimbreEditor, createTimbrePlayback, createTimbreReferenceAdapter } from '../src/workstation/modules/timbre/public.ts';
import { createPhraseEditor, createPhrasePlayback, createPhraseReferenceAdapter } from '../src/workstation/modules/phrase/public.ts';
import { createSongEditor, createSongReferenceAdapter } from '../src/workstation/modules/song/public.ts';
import { musicClockVoice } from './music-clock-fixture.ts';
import { initialMelodyView, melodyScale, melodyDuration } from '../src/workstation/modules/ui-rendering/melody-geometry.ts';
const hooks = registerHooks({ load(url, context, next) { return url.endsWith('.css') ? { format: 'module', source: '', shortCircuit: true } : next(url, context); } });
const { mountStudio } = await import('../src/workstation/modules/ui-rendering/public.ts'); hooks.deregister();
const { mountMelodyWorkspace } = await import('../src/workstation/modules/ui-rendering/melody-workspace.ts');
const { showTapTempo } = await import('../src/workstation/modules/ui-rendering/tap-tempo.ts');
const { mountPhraseComposition } = await import('../src/workstation/modules/ui-rendering/phrase-composition.ts');
type FakeEvent = Record<string, unknown> & { type: string; target: Element; preventDefault(): void; stopPropagation(): void };
let navigationHeight: number | undefined;
/** In-memory event DOM only; no browser, screen, device, or audio is accessed. */
class Element {
  tagName: string; className = ''; style: Record<string, unknown> & { setProperty(name: string, value: string): void } = { setProperty(name, value) { this[name] = value; } }; dataset: Record<string, string> = {};
  parentElement?: Element; children: Element[] = []; attributes = new Map<string, string>();
  value = ''; title = ''; hidden = false; disabled = false; tabIndex = 0; clientWidth = 1000; private height = 700; scrollTop = 0; scrollLeft = 0;
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
  click(): void { this.emit('click'); }
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
    const event = { type, target: this, pointerId: 1, pointerType: 'mouse', timeStamp: performance.now(), button: 0, clientX: 0, clientY: 0, key: '', code: '', ctrlKey: false, metaKey: false,
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

test('unified music opens in the piano roll, plays and tracks unsaved changes through Ctrl+S', async () => {
  const dom = installDom(); let working = createInitialProjectLibrary('直达创作'); let saves = 0; let failSave = false;
  const library = createMaterialLibrary({ read: () => working, write: text => { working = text; } },
    { project: { rootKind: 'rootsound.song', adapters: [createTimbreReferenceAdapter(), createPhraseReferenceAdapter(), createSongReferenceAdapter()] } });
  const tones = createTimbrePlayback(library,undefined,undefined,musicClockVoice), phrase = createPhraseEditor(library, tones);
  const song = createSongEditor(library, createPhrasePlayback(library, tones), { defaultTempoMode: 'source' });
  openMusicDocument(library, song, phrase);
  const part = phrase.addPart(library.listContentInfo().find(item => item.kind === 'rootsound.timbre')!.id);
  phrase.addNote(part, { startBeat: 0, durationBeats: 1, frequencyHz: 440, velocity: .5 });
  const timbre = createTimbreEditor(library);
  let disk = working;
  const plans: SoundSequencePlan[] = [];
  const sound = { stopAll() {}, stop() {}, cancelAudition() {}, subscribe() { return () => {}; }, position() { return 0; },
    async preview(plan: SoundSequencePlan) { plans.push(plan); return { id: 'play', status: 'playing', durationSeconds: plan.durationSeconds }; }, async audition() {} } as unknown as SoundRuntimePort;
  const directories = { read: async () => ({ defaultLocation: 'D:/RootSound/project', hasUnsavedChanges: working !== disk }),
    async save() {
      if (failSave) throw new Error('模拟保存失败');
      disk = working; saves++;
      return { id: 'file', name: song.read().draft!.name, path: 'D:/RootSound/project/test.rootsound' };
    } } as unknown as ProjectDirectoriesPort;
  const root = new Element('main');
  const setup = createProjectSetup(directories, () => {}, { read: () => working, songDraftId: () => song.read().draft!.id,
    name: () => song.read().draft!.name, prepareSave() { commitMusicDocument(library, song, phrase); } });
  let openingReads=0;const readPhrase=phrase.read.bind(phrase);phrase.read=()=>{openingReads++;return readPhrase();};
  const studio = mountStudio(root as unknown as HTMLElement, { timbre, sound, hasPrevious: true,
    preferences:createWorkspacePreferences({getItem:()=>JSON.stringify({version:1,keyboardPerformance:true}),setItem(){}}),
    phrase, song, projectSetup: setup, initialEntry: 'song' });
  try {
    await settle();
    const unsaved = root.querySelector('.song-project-unsaved')!;
    assert(unsaved.hidden, 'opening a clean project leaves its title unmarked');
    assert(openingReads<=3,'opening the active canvas must reuse its view instead of repeatedly reading the entire score');
    assert(root.querySelector('.melody-workspace'));
    assert.equal(root.querySelector('.melody-note')!.style.width,'30px','direct project entry uses equally wide pitch columns');
    assert(root.querySelector('.melody-workspace')!.classList.contains('is-vertical'));
    assert.equal(root.querySelector('.melody-console')!.hidden,true,'workbench is hidden by default');
    assert.equal(root.querySelector('.song-topbar')!.querySelector('.song-tempo-panel'),undefined,'BPM is beside the keyboard, not in the topbar');
    assert.equal(root.querySelector('.song-topbar')!.querySelector('.phrase-grid-button'),undefined,'grid division is beside BPM, not in the topbar');
    assert(root.querySelector('.melody-tempo-dock')!.querySelector('.melody-tempo-button'));
    const beatPositions = () => root.querySelectorAll('.melody-grid-line').filter(line=>line.classList.contains('is-beat')).map(line=>line.style.top);
    const originalBeatPositions = beatPositions();
    const grid=root.querySelector('.melody-grid-select')!;grid.value='3';grid.emit('change');await settle();
    assert.equal(phrase.read().body!.stepsPerBeat,3);
    assert(!unsaved.hidden, 'a grid edit marks the project as unsaved');
    grid.value='4';grid.emit('change');await settle();
    const openingLines=root.querySelectorAll('.melody-grid-line');
    assert.deepEqual(beatPositions(), originalBeatPositions, 'changing divisions preserves beat positions and scale');
    assert(openingLines.some(line=>!line.classList.contains('is-beat')), 'explicit division changes reveal subdivision lines');
    assert.equal(root.querySelector('.phrase-composition-main')!.hidden, true);
    assert.equal(root.querySelector('.phrase-melody-back'), undefined);
    assert.equal(root.querySelector('.song-project-kind'), undefined);
    assert.equal(root.querySelector('.song-playlist'), undefined);
    assert.equal(root.querySelector('.song-new-phrase'), undefined);
    assert.equal(root.querySelector('.song-phrase-library'), undefined);
    assert.equal(root.querySelector('.song-project-name')!.textContent, '直达创作');
    assert.equal(root.querySelector('.song-settings'),undefined,'empty settings entry is removed');
    assert.equal(root.querySelector('.song-rate-choice'),undefined,'playback rate control is removed');
    assert.equal(root.querySelector('.song-volume-panel'),undefined,'topbar volume control is removed');
    assert.equal(root.querySelector('.workspace-settings-dialog'),undefined);
    root.querySelector('.melody-tone')!.emit('click');
    dom.document.emit('keydown',{key:'c'});
    assert.equal(phrase.read().body!.parts.reduce((sum,part)=>sum+part.notes.length,0),1,'old enabled preferences cannot reactivate performance entry');
    root.querySelector('.melody-add-tone')!.emit('click');
    const availableInstruments = listDefaultInstruments().filter(item => item.drum === undefined);
    assert.equal(root.querySelectorAll('.melody-library-tone').length, availableInstruments.length);
    const category = (name: string) => root.querySelectorAll('.melody-library-category').find(item => item.textContent === name)!;
    category('钢琴').emit('click'); assert.equal(root.querySelectorAll('.melody-library-tone').length, availableInstruments.filter(item=>item.category==='键盘').length);
    assert.equal(category('录音室鼓 A'), undefined);
    category('全部').emit('click'); const search = root.querySelector('.melody-library-search')!;
    search.value = '管弦长笛'; search.emit('input');
    assert.equal(root.querySelectorAll('.melody-library-tone').length, 1);
    assert.equal(root.querySelector('.melody-library-tone')!.textContent, '管弦长笛');
    root.querySelector('.melody-library-preview')!.emit('click'); await settle();
    assert(root.querySelector('.melody-tone-library'), 'audition must not choose or close the library');
    root.querySelector('.melody-library-tone')!.emit('click'); await settle();
    assert.equal(root.querySelector('.melody-tone-library'), undefined);
    assert.equal(saves, 0);
    root.querySelector('.melody-scroll')!.emit('pointerdown', { button: 2, pointerId: 91, clientX: 400, clientY: 300 });
    dom.document.emit('pointerup', { pointerId: 91 });
    root.querySelector('.song-play')!.emit('click'); await settle(); assert.equal(plans[0]!.events.length, 1);
    dom.document.emit('keydown', { key: 's', ctrlKey: true }); await settle();
    assert.equal(saves, 1); assert.equal(disk, working);
    assert(unsaved.hidden, 'successful save clears the marker');
    const parsed = JSON.parse(disk); const rootDraft = parsed.drafts.find((item: {kind:string}) => item.kind === 'rootsound.song');
    const savedScore = parsed.contents.find((item: {id:string}) => item.id === rootDraft.dependencies[0]);
    assert.equal(savedScore.body.parts[0].notes.length, 1);
    assert.equal(root.querySelectorAll('dialog').length, 0);
    root.querySelector('.song-stop')!.emit('click');
    const originalPerformance=Object.getOwnPropertyDescriptor(globalThis,'performance');let now=0;
    Object.defineProperty(globalThis,'performance',{configurable:true,value:{now:()=>now}});
    try{
      root.querySelector('.song-tap-tempo')!.emit('click');await settle();assert(root.querySelector('.tap-tempo-dialog'));
      for(const at of [0,400,800,1200]){now=at;dom.document.emit('keydown',{key:' ',code:'Space'});}
      assert.equal(root.querySelector('.tap-tempo-value')!.textContent,'150');
      assert.equal(phrase.read().body!.tempoBpm,120,'tapping alone cannot change the project');
      assert.equal(plans.length,1,'tap keys cannot start playback');
      root.querySelector('.tap-tempo-apply')!.emit('click');await settle();
      assert.equal(phrase.read().body!.tempoBpm,150);assert.equal(phrase.read().body!.parts[0]!.notes[0]!.durationSeconds,.4);
      assert.equal(saves,1,'applying tempo is a working edit, not a disk save');
      assert(!unsaved.hidden, 'another edit brings the marker back');
      failSave = true;
      dom.document.emit('keydown', { key: 's', ctrlKey: true }); await settle();
      assert.equal(saves, 1);
      assert(!unsaved.hidden, 'failed save leaves the marker visible');
    }finally{if(originalPerformance)Object.defineProperty(globalThis,'performance',originalPerformance);}
  } finally { studio.dispose(); dom.restore(); }
});

test('only family selection changes the playback scope, and clicking a note keeps it', async () => {
  const dom = installDom(); let text = createInitialProjectLibrary('选择族试听');
  const library = createMaterialLibrary({ read: () => text, write: next => { text = next; } });
  const tones = createTimbrePlayback(library, undefined, undefined, musicClockVoice);
  const phrase = createPhraseEditor(library, tones);
  const song = createSongEditor(library, createPhrasePlayback(library, tones), { defaultTempoMode: 'source' });
  openMusicDocument(library, song, phrase);
  const tone = library.listContentInfo().find(item => item.kind === 'rootsound.timbre')!.id;
  const first = phrase.addPart(tone), second = phrase.addPart(tone), empty = phrase.addPart(tone);
  phrase.addNote(first, { startBeat: 0, durationBeats: 1, frequencyHz: 440, velocity: .6 });
  const other = phrase.addNote(second, { startBeat: 1, durationBeats: 1, frequencyHz: 660, velocity: .6 });
  let releaseFirst!: () => void; const readiness = new Promise<void>(resolve => { releaseFirst = resolve; });
  let delayed = true; const prepared: string[][] = [], prepare = phrase.preparePreview.bind(phrase);
  phrase.preparePreview = async body => { prepared.push(body!.parts.map(part => part.id)); if (delayed) { delayed = false; await readiness; } await prepare(body); };
  const before = text, plans: SoundSequencePlan[] = [];
  const session = (plan: SoundSequencePlan) => { plans.push(plan); return { id: 'selected-play', status: 'playing', durationSeconds: plan.durationSeconds }; };
  const sound = { preview: async (plan: SoundSequencePlan) => session(plan), update: (_id: string, plan: SoundSequencePlan) => session(plan),
    position: () => .25, stop() {}, stopAll() {}, cancelAudition() {}, audition: async () => {}, subscribe: () => () => {} } as unknown as SoundRuntimePort;
  const root = new Element('main');
  const shell = mountPhraseComposition(root as unknown as HTMLElement, { phrase, sound, directMusic: true });
  const choose = (id: string) => root.querySelectorAll('.melody-tone').find(item => item.dataset.partId === id)!.emit('click');
  const clear = () => { root.querySelector('.melody-scroll')!.emit('pointerdown', { button: 2, pointerId: 92, clientX: 400, clientY: 300 }); dom.document.emit('pointerup', { pointerId: 92 }); };
  const pitches = () => plans.at(-1)!.events.map(event => Math.round(event.sound.note.frequencyHz));
  try {
    await settle(); choose(first);
    root.querySelector('.song-play')!.emit('click'); await settle(); assert.equal(plans.length, 0);
    choose(second); releaseFirst(); await settle(); assert.deepEqual(pitches(), [660], 'selection during sample loading must prepare the latest family');
    assert.deepEqual(prepared.slice(0, 2), [[first], [second]]);
    choose(first); await settle(); assert.deepEqual(pitches(), [440]);
    choose(second); await settle(); assert.deepEqual(pitches(), [660], 'same timbre in another family must stay silent');
    assert.equal(plans.at(-1)!.transport!.positionSeconds, .25, 'live selection preserves the running head');
    choose(empty); await settle(); assert.deepEqual(pitches(), [], 'empty selection is silence, not full-song fallback');
    clear(); await settle(); assert.deepEqual(pitches(), [440, 660]);
    choose(second); await settle();
    const block = root.querySelectorAll('.melody-note').find(item => item.dataset.noteId === other)!;
    root.querySelector('.melody-scroll')!.emit('pointerdown', { target: block, pointerId: 93,
      clientX: block.getBoundingClientRect().left + 5, clientY: block.getBoundingClientRect().top + 2 });
    dom.document.emit('pointerup', { pointerId: 93 });
    await settle(); assert.deepEqual(pitches(), [660], 'clicking a note keeps the selected family');
    assert.equal(text, before, 'listening scope must not edit or save music');
    choose(first); phrase.removePart(first); shell.refresh(); await settle();
    assert.deepEqual(pitches(), [660], 'removed family must not leave a stale listening scope');
  } finally { shell.dispose(); dom.restore(); }
});

test('tap dialog supports mouse and keyboard, reset, cancel and listener cleanup',()=>{
  const dom=installDom(),root=new Element('main'),applied:number[]=[];let now=0;
  let dialog=showTapTempo(root as unknown as HTMLElement,{now:()=>now,onApply(value){applied.push(value);}});
  try{
    for(const at of [0,500,1000,1500]){now=at;dom.document.emit('keydown',{key:' ',code:'Space'});}
    assert.equal(root.querySelector('.tap-tempo-value')!.textContent,'120');assert.equal(applied.length,0);
    now=1700;dom.document.emit('keydown',{key:' ',code:'Space',repeat:true});assert.equal(root.querySelector('.tap-tempo-value')!.textContent,'120');
    root.querySelector('.tap-tempo-reset')!.emit('click');assert.equal(root.querySelector('.tap-tempo-apply')!.hidden,true);
    for(const at of [2000,2400,2800,3200]){now=at;root.querySelector('.tap-tempo-pad')!.emit('click');}
    root.querySelector('.tap-tempo-cancel')!.emit('click');assert.equal(applied.length,0);assert.equal(root.querySelector('.tap-tempo-dialog'),undefined);
    assert.equal(dom.document.emit('keydown',{key:' ',code:'Space'}).defaultPrevented,false,'dialog shortcuts must be released on close');
    dialog=showTapTempo(root as unknown as HTMLElement,{now:()=>now,onApply(value){applied.push(value);}});
    for(const at of [0,200,400,600]){now=at;dom.document.emit('keydown',{key:' ',code:'Space'});}
    assert.equal(root.querySelector('.tap-tempo-value')!.textContent,'300');assert.equal(root.querySelector('.tap-tempo-apply')!.hidden,false);
    dom.document.emit('keydown',{key:'Enter'});assert.deepEqual(applied,[300]);assert.equal(root.querySelector('.tap-tempo-dialog'),undefined);
    dialog=showTapTempo(root as unknown as HTMLElement,{now:()=>now,onApply(value){applied.push(value);}});
    dom.document.emit('keydown',{key:'Enter'});assert(root.querySelector('.tap-tempo-dialog'));
    dom.document.emit('keydown',{key:'Escape'});assert.deepEqual(applied,[300]);assert.equal(root.querySelector('.tap-tempo-dialog'),undefined);
  }finally{dialog.dispose();dom.restore();}
});

function editableRoll(options: { workbench?: boolean; workspaceState?: MusicWorkspaceStatePort; performance?: boolean; orientation?: 'vertical'; playing?: boolean; multipleRolls?: boolean; studio?: boolean; readDrumLanes?(): boolean; onLearningAction?(action: LearningAction): void } = {}) {
  const dom=installDom();let text=createInitialProjectLibrary('交互测试', options.studio);
  const library=createMaterialLibrary({read:()=>text,write:value=>{text=value;}});
  const tones=createTimbrePlayback(library,undefined,undefined,musicClockVoice),phrase=createPhraseEditor(library,tones);
  const song=createSongEditor(library,createPhrasePlayback(library,tones),{defaultTempoMode:'source'});openMusicDocument(library,song,phrase);
  const sounds=library.listContentInfo().filter(item=>item.kind==='rootsound.timbre');
  const first=phrase.addPart(sounds[0]!.id),second=phrase.addPart(sounds[1]!.id),empty=phrase.addPart(sounds[2]!.id);
  const a=phrase.addNote(first,{startBeat:1,durationBeats:1,frequencyHz:261.6255653005986,velocity:.7});
  const b=phrase.addNote(second,{startBeat:1,durationBeats:1,frequencyHz:293.6647679174076,velocity:.7});
  const root=new Element('main'),auditions:PlayableNotePlan[]=[];const sound={cancelAudition(){},async audition(plan:PlayableNotePlan){auditions.push(plan);}} as unknown as SoundRuntimePort;
  const previews:Array<PhraseBody|undefined>=[];
  const seeks: number[] = [];
  const commits: boolean[] = [];
  const mount=()=>mountMelodyWorkspace(root as unknown as HTMLElement,{phrase,sound,gridBpm:()=>120,workspaceState:options.workspaceState,orientation:options.orientation,readPerformanceMode:()=>!!options.performance,
    readIsPlaying:options.playing===undefined?undefined:()=>options.playing!,
    readMultipleTempoRolls: options.multipleRolls === undefined ? undefined : () => options.multipleRolls!, onLearningAction: options.onLearningAction,
    readDrumLanes: options.readDrumLanes,
    readWorkbench: () => options.workbench === true,
    listTimbres:()=>sounds,onAddTimbre:id=>phrase.addPart(id),onChange(_view, preserveSounding){commits.push(!!preserveSounding);},onPreview(body){previews.push(body);},onSeek(seconds){seeks.push(seconds);}});
  let roll=mount();
  const family=(id:string)=>root.querySelectorAll('.melody-tone').find(item=>item.dataset.partId===id)!;
  const remove=(id:string)=>family(id).parentElement!.querySelector('.melody-family-remove')!;
  const note=(id:string)=>root.querySelectorAll('.melody-note').find(item=>item.dataset.noteId===id)!;
  return {...dom,root,get roll(){return roll;},phrase,library,song,first,second,empty,a,b,family,remove,note,previews,seeks,commits,read:()=>text,reopen(workspaceState=options.workspaceState){roll.dispose();options.workspaceState=workspaceState;roll=mount();},
    sounds,auditions,cleanup(){roll.dispose();dom.restore();}};
}

test('the studio library filters by actual instruments, separate drum kits and custom sounds', () => {
  let drumLanes = false;
  const f = editableRoll({ orientation: 'vertical', studio: true, readDrumLanes: () => drumLanes });
  try {
    f.root.querySelector('.melody-add-tone')!.emit('click');
    const tabs = () => f.root.querySelectorAll('.melody-library-category');
    const names = () => f.root.querySelectorAll('.melody-library-tone').map(card => card.textContent);
    const select = (name: string) => tabs().find(tab => tab.textContent === name)!.emit('click');
    assert(!tabs().some(tab => tab.textContent.startsWith('录音室鼓')));
    assert(!names().some(name => name.startsWith('录音室鼓')));
    drumLanes = true; f.roll.refresh();
    assert.deepEqual(new Set(tabs().map(tab => tab.textContent)),
      new Set(['全部', '钢琴', '木管', '贝斯', '吉他', '弦乐', '铜管', '录音室鼓 A', '录音室鼓 B']));
    select('钢琴');
    assert.deepEqual(names(), ['三角钢琴']);
    for (const kit of ['录音室鼓 A', '录音室鼓 B']) {
      select(kit);
      assert.equal(names().length, 11);
      assert(names().every(name => name.startsWith(kit)));
    }
    const search = f.root.querySelector('.melody-library-search')!;
    search.value = '底鼓'; search.emit('input');
    assert.deepEqual(names(), ['录音室鼓 B · 底鼓']);
    search.value = ''; search.emit('input');
    for (let i = f.sounds.length - 1; i >= 0; i--) {
      if (f.sounds[i]!.name.startsWith('录音室鼓 B')) f.sounds.splice(i, 1);
    }
    f.sounds.push({ ...f.sounds[0]!, id: 'custom-tone', name: '自制钢琴' });
    f.roll.refresh();
    assert(!tabs().some(tab => tab.textContent === '录音室鼓 B'));
    assert.equal(tabs().find(tab => tab.textContent === '全部')!.attributes.get('aria-pressed'), 'true');
    select('自定义');
    assert.deepEqual(names(), ['自制钢琴']);
  } finally { f.cleanup(); }
});

test('drum cards reveal the divider, each drag changes one lane, and zoom respects both axes', () => {
  const records = new Map<string, string>();
  const storage = { getItem: (key: string) => records.get(key) ?? null, setItem: (key: string, value: string) => { records.set(key, value); } };
  const workspaceState = createMusicWorkspaceState(storage, 'drum-divider');
  let drumLanes = true;
  const f = editableRoll({ orientation: 'vertical', studio: true, workspaceState, readDrumLanes: () => drumLanes });
  try {
    const strip = f.root.querySelector('.melody-drum-strip')!;
    const canvas = strip.querySelector('.melody-drum-canvas')!;
    const scroll = f.root.querySelector('.melody-scroll')!;
    const divider = f.root.querySelector('.melody-drum-divider')!;
    const keys = () => strip.querySelectorAll('.melody-drum-key');
    f.root.querySelector('.melody-ruler-row')!.clientWidth = 36;
    scroll.clientWidth = 600;
    assert(strip.hidden && divider.hidden);
    assert.equal(keys().length, 0);
    const addDrum = (name: string) => f.phrase.addPart(f.sounds.find(sound => sound.name === name)!.id);
    const kick = addDrum('录音室鼓 A · 底鼓');
    f.roll.refresh();
    f.family(kick).emit('click');
    assert(!strip.hidden && !divider.hidden);
    assert.equal(keys().length, 1);
    const snare = addDrum('录音室鼓 A · 军鼓');
    f.roll.refresh();
    const startX = 960;
    const drag = (handle: Element, delta: number) => {
      handle.emit('pointerdown', { clientX: startX });
      handle.emit('pointermove', { clientX: startX + delta / 2 });
      handle.emit('pointermove', { clientX: startX + delta });
      handle.emit('pointerup');
      f.flushFrames();
    };
    drag(divider, 250); assert.equal(keys().length, 1);
    drag(divider, -250); assert.equal(keys().length, 2);
    drag(divider, -250); assert.equal(keys().length, 3);
    assert(keys().every(key => key.textContent === '' && !key.disabled));
    const hit = (partId: string, clientX: number) => {
      f.family(partId).emit('click');
      assert(!strip.hidden);
      const at = { clientX, clientY: 130 };
      canvas.emit('pointerdown', at);
      f.document.emit('pointerup', at);
      return f.phrase.read().body!.parts.find(part => part.id === partId)!.notes[0]!;
    };
    const first = hit(kick, 635), second = hit(snare, 607);
    assert.equal(first.startBeat, second.startBeat);
    assert.equal(first.frequencyHz, second.frequencyHz);
    assert.equal(first.drumLane, 0);
    assert.equal(second.drumLane, 2);
    assert.equal(f.note(first.id).style.top, f.note(second.id).style.top);
    assert(canvas.contains(f.note(first.id)));
    assert(canvas.contains(f.note(second.id)));
    const initialLeft = f.note(first.id).style.left;
    scroll.scrollLeft += 120;
    scroll.emit('scroll');
    f.flushFrames();
    assert.equal(f.note(first.id).style.left, initialLeft);

    const at = { clientX: 607, clientY: 132 };
    canvas.emit('pointerdown', { target: f.note(second.id), ...at, timeStamp: 0 });
    f.document.emit('pointermove', { ...at, clientX: 621, timeStamp: 50 });
    assert.equal(f.note(second.id).style.left, '2px');
    f.document.emit('pointermove', { ...at, clientX: 621, timeStamp: 140 });
    f.document.emit('pointerup', { ...at, clientX: 621, timeStamp: 160 });
    assert.deepEqual(f.phrase.read().body!.parts.find(part => part.id === snare)!.notes, [{ ...second, drumLane: 1 }]);
    assert.equal(f.note(second.id).style.left, '16px');

    const beforeZoom = f.roll.readViewport();
    const drumWidth = () => Number.parseFloat(String(f.note(second.id).style.width));
    const initialDrumWidth = drumWidth();
    const wheel = (surface: Element, shiftKey: boolean) => {
      surface.emit('wheel', { ctrlKey: true, shiftKey, deltaY: -150, clientX: 280, clientY: 0 });
      f.flushFrames();
    };
    wheel(strip, true);
    assert(drumWidth() > initialDrumWidth);
    assert.equal(f.roll.readViewport().rowHeight, beforeZoom.rowHeight);
    assert.equal(f.roll.readViewport().zoom, beforeZoom.zoom);
    const zoomedDrumWidth = drumWidth();
    wheel(scroll, true);
    assert(f.roll.readViewport().rowHeight > beforeZoom.rowHeight);
    assert.equal(drumWidth(), zoomedDrumWidth);
    const pianoHeight = Number.parseFloat(String(f.note(f.a).style.height));
    const drumHeight = Number.parseFloat(String(f.note(second.id).style.height));
    wheel(strip, false);
    const ratio = f.roll.readViewport().zoom / beforeZoom.zoom;
    assert(ratio > 1);
    assert(Math.abs(Number.parseFloat(String(f.note(f.a).style.height)) / pianoHeight - ratio) < 1e-9);
    assert(Math.abs(Number.parseFloat(String(f.note(second.id).style.height)) / drumHeight - ratio) < 1e-9);

    const before = f.phrase.read().body;
    const playback = f.phrase.previewPlan();
    drumLanes = false; f.roll.refresh();
    assert(strip.hidden && divider.hidden);
    assert.equal(f.note(second.id), undefined);
    assert.deepEqual(f.phrase.previewPlan(), playback);
    drumLanes = true; f.roll.refresh();
    assert.equal(keys().length, 3);
    drag(divider, 250); assert.equal(keys().length, 2);
    drag(divider, 250); assert.equal(keys().length, 1);
    drag(divider, 250); assert.equal(keys().length, 1);
    assert(!strip.hidden);
    assert.equal(f.note(second.id), undefined);
    assert.deepEqual(f.phrase.read().body, before);
    assert.deepEqual(f.phrase.previewPlan(), playback);
    const saved = createMusicWorkspaceState(storage, 'drum-divider');
    assert.equal(saved.read()!.drumLanes, 1);
    assert(saved.read()!.drumLaneWidth! > 14);

    f.reopen(saved);
    assert(!f.root.querySelector('.melody-drum-strip')!.hidden);
    f.root.querySelector('.melody-ruler-row')!.clientWidth = 36;
    const reopenedDivider = f.root.querySelector('.melody-drum-divider')!;
    drag(reopenedDivider, -250);
    assert.equal(drumWidth(), zoomedDrumWidth);
    assert.deepEqual(f.phrase.read().body, before);
    f.phrase.removeParts([kick, snare]); f.roll.refresh();
    assert(reopenedDivider.hidden);
    assert(f.root.querySelector('.melody-drum-strip')!.hidden);
  } finally { f.cleanup(); }
});

test('playing note drags and resizes commit once, and undo and redo skip copying full history', () => {
  const f = editableRoll({ playing: true });
  try {
    const original = f.phrase.read().body;
    const scroll = f.root.querySelector('.melody-scroll')!, block = f.note(f.a);
    const from = { clientX: Number.parseFloat(String(block.style.left)) + 2, clientY: Number.parseFloat(String(block.style.top)) + 2 };
    const before = block.style.left;
    scroll.emit('pointerdown', { target: block, ...from });
    for (let index = 1; index <= 20; index++) {
      f.document.emit('pointermove', { ...from, clientX: from.clientX + index * 2 });
      f.flushFrames();
    }
    assert.notEqual(block.style.left, before);
    assert.deepEqual(f.previews, []);
    assert.deepEqual(f.auditions, []);
    assert.deepEqual(f.phrase.read().body, original);
    f.document.emit('pointerup');
    const moved = f.phrase.read().body;
    assert.notDeepEqual(moved, original);
    f.flushFrames();
    assert.deepEqual(f.previews, [undefined]);
    assert.deepEqual(f.commits, [true]);

    let historyCopies = 0;
    const history = f.library.readDraftHistory.bind(f.library);
    f.library.readDraftHistory = id => { historyCopies++; return history(id); };
    f.document.emit('keydown', { key: 'z', ctrlKey: true });
    assert.deepEqual(f.phrase.read().body, original);
    f.document.emit('keydown', { key: 'y', ctrlKey: true });
    assert.deepEqual(f.phrase.read().body, moved);
    assert.equal(historyCopies, 0);
    assert.deepEqual(f.seeks, []);

    const movedBlock = f.note(f.a);
    const resize = movedBlock.querySelector('.melody-note-resize')!;
    const edge = movedBlock.getBoundingClientRect();
    scroll.emit('pointerdown', { target: resize, clientX: edge.right - 1, clientY: edge.top + 2 });
    f.document.emit('pointermove', { clientX: edge.right + 30, clientY: edge.top + 2 });
    f.flushFrames();
    assert.deepEqual(f.phrase.read().body, moved);
    f.document.emit('pointerup');
    assert.notDeepEqual(f.phrase.read().body, moved);
    assert.equal(f.commits.at(-1), true);
  } finally { f.cleanup(); }
});

test('added families can be removed, populated removal can be cancelled and note edits remain undoable',()=>{
  const f=editableRoll();try{
    f.remove(f.empty).emit('click');assert(!f.phrase.read().body!.parts.some(part=>part.id===f.empty));
    f.remove(f.first).emit('click');assert(f.root.querySelector('.melody-tone-delete-dialog'));
    f.root.querySelector('.melody-tone-delete-cancel')!.emit('click');assert(f.phrase.read().body!.parts.some(part=>part.id===f.first));
    f.remove(f.first).emit('click');f.root.querySelector('.melody-tone-delete-confirm')!.emit('click');
    assert(!f.phrase.read().body!.parts.some(part=>part.id===f.first));assert.equal(f.phrase.read().body!.parts[0]!.notes[0]!.id,f.b);
    f.phrase.undo();f.roll.refresh();assert(f.phrase.read().body!.parts.some(part=>part.id===f.first));
    f.family(f.first).emit('click');f.document.emit('keydown',{key:'Delete'});f.document.emit('keydown',{key:'Delete'});
    assert(!f.phrase.read().body!.parts.some(part=>part.id===f.first),'two Delete presses remove the actual family, not only its notes');
  }finally{f.cleanup();}
});

test('roll starts with spacious cells even for a long score, and subdivision changes preserve cell width',()=>{
  const f=editableRoll();try{
    const body=f.phrase.read().body!;
    for(const lengthBeats of [16,1024]) for(const stepsPerBeat of [2,4,9]) {
      const score={...body,lengthBeats,stepsPerBeat}; const view=initialMelodyView(score,1000);
      assert.equal(view.rowHeight,32);
      assert(Math.abs(melodyScale(view,1000,melodyDuration(score))*60/score.tempoBpm/stepsPerBeat-32)<1e-8);
    }
    assert.equal(f.roll.readViewport().rowHeight,32);
    const gap=()=>{const lines=f.root.querySelectorAll('.melody-grid-line').filter(line=>line.classList.contains('is-beat'));return Number.parseFloat(String(lines[1]!.style.left))-Number.parseFloat(String(lines[0]!.style.left));};
    const original=structuredClone(body.parts);assert(Math.abs(gap()/4-32)<1e-8);
    for(const n of [9,2,4]){f.phrase.setStepsPerBeat(n);f.roll.refresh();assert(Math.abs(gap()/4-32)<1e-8);assert.deepEqual(f.phrase.read().body!.parts,original);}
    f.roll.refresh();assert(Math.abs(gap()/4-32)<1e-8,'repeated refresh must not compound zoom');
  }finally{f.cleanup();}
});

test('roll wheel axes are consistent over canvas and pitch labels and do not edit the score',()=>{
  const f=editableRoll();try{
    const scroll=f.root.querySelector('.melody-scroll')!,canvas=f.root.querySelector('.melody-canvas')!;
    const before=structuredClone(f.phrase.read().body);
    for(const target of [canvas,f.root.querySelector('.melody-key')!]) {
      const wheel=(extra:Record<string,unknown>)=>scroll.emit('wheel',{target,deltaY:60,clientX:200,clientY:100,...extra});
      let view=f.roll.readViewport();wheel({});let next=f.roll.readViewport();assert.equal(next.top,view.top+60);assert.equal(next.leftSeconds,view.leftSeconds);
      view=next;wheel({shiftKey:true});next=f.roll.readViewport();assert(next.leftSeconds>view.leftSeconds);assert.equal(next.top,view.top);
      view=next;wheel({ctrlKey:true,deltaY:-60});next=f.roll.readViewport();assert(next.rowHeight>view.rowHeight);assert.equal(next.zoom,view.zoom);
      view=next;wheel({ctrlKey:true,shiftKey:true,deltaY:-60});next=f.roll.readViewport();assert(next.zoom>view.zoom);assert.equal(next.rowHeight,view.rowHeight);
    }
    assert.deepEqual(f.phrase.read().body,before);
  }finally{f.cleanup();}
});

test('duration wheel requires hovering the selected note; blank and unselected notes keep scrolling',()=>{
  const f=editableRoll();try{
    const scroll=f.root.querySelector('.melody-scroll')!,canvas=f.root.querySelector('.melody-canvas')!;
    const at={clientX:200,clientY:100};
    scroll.emit('pointerdown',{target:f.note(f.a),...at});f.document.emit('pointerup',at);
    assert(f.note(f.a).classList.contains('is-selected'));
    const original=structuredClone(f.phrase.read().body);
    const sameFamily=f.phrase.addNote(f.first,{startBeat:2,durationBeats:1,frequencyHz:330,velocity:.7});f.roll.refresh();
    const before=structuredClone(f.phrase.read().body);
    for(const target of [canvas,scroll,f.note(sameFamily),f.note(f.b)]){
      const top=f.roll.readViewport().top;
      scroll.emit('wheel',{target,deltaY:20,...at});
      assert.equal(f.roll.readViewport().top,top+20);
      assert.deepEqual(f.phrase.read().body,before,'scrolling away from the selected note cannot edit it');
      assert(f.note(f.a).classList.contains('is-selected'));
    }
    const viewport=f.roll.readViewport();
    for(const target of [f.note(f.a),f.note(f.a).querySelector('.melody-note-resize')!])scroll.emit('wheel',{target,deltaY:-100,...at});
    const edited=f.phrase.read().body!.parts.find(part=>part.id===f.first)!.notes.find(note=>note.id===f.a)!;
    const initial=original!.parts.find(part=>part.id===f.first)!.notes[0]!;
    const seconds=initial.durationSeconds??initial.durationBeats*60/original!.tempoBpm;
    assert(Math.abs(edited.durationSeconds!-(seconds+.02))<1e-8);
    assert.deepEqual(f.roll.readViewport(),viewport);
    const after=structuredClone(f.phrase.read().body);
    for(const modifiers of [{shiftKey:true},{ctrlKey:true},{ctrlKey:true,shiftKey:true}])scroll.emit('wheel',{target:f.note(f.a),deltaY:-20,...at,...modifiers});
    assert.deepEqual(f.phrase.read().body,after,'navigation modifiers still work over the selected note');
  }finally{f.cleanup();}
});

test('vertical time lines use one physical pixel at 125 percent scaling', () => {
  const f = editableRoll({ orientation: 'vertical' });
  try {
    Object.assign(f.window, { devicePixelRatio: 1.25 });
    f.phrase.setTempo(137);
    f.roll.refresh();
    const grid = f.root.querySelector('.melody-grid')!;
    assert.equal(grid.style['--melody-grid-stroke'], '0.8px');
    const pixels = grid.querySelectorAll('.melody-grid-line').map(line => parseFloat(String(line.style.top)) * 1.25);
    assert(pixels.length > 1);
    assert(pixels.every(pixel => Math.abs(pixel - Math.round(pixel)) < 1e-8));
    assert.equal(new Set(pixels.map(Math.round)).size, pixels.length);
  } finally { f.cleanup(); }
});

test('zoom reveals finer drawing cells and black and white pitch rows have equal size',()=>{
  const f=editableRoll();try{
    const scroll=f.root.querySelector('.melody-scroll')!,canvas=f.root.querySelector('.melody-canvas')!;
    const lines=()=>f.root.querySelectorAll('.melody-grid-line');
    assert(lines().every(line=>line.classList.contains('is-beat')));
    const zoom=()=>{scroll.emit('wheel',{target:canvas,ctrlKey:true,shiftKey:true,deltaY:-Math.log(2)/.002,clientX:0,clientY:100});f.flushFrames();};
    zoom();assert(lines().some(line=>!line.classList.contains('is-beat')));
    zoom();zoom();const keys=f.root.querySelectorAll('.melody-key'),black=keys.find(key=>key.textContent==='C♯4'||key.textContent==='C#4')!;
    assert(black,'keyboard contains C sharp');const rowHeight=f.roll.readViewport().rowHeight;
    assert.equal(Number.parseFloat(String(black.style.height)),rowHeight);
    f.family(f.first).emit('click');
    const start=Number.parseFloat(String(lines()[1]!.style.left))+1;
    const at={clientX:start,clientY:Number.parseFloat(String(black.style.top))+rowHeight*.4-scroll.scrollTop};
    const before=f.phrase.read().body!.parts.find(part=>part.id===f.first)!.notes.length;
    scroll.emit('pointerdown',{target:canvas,...at});f.document.emit('pointerup',at);
    const notes=f.phrase.read().body!.parts.find(part=>part.id===f.first)!.notes;assert.equal(notes.length,before+1);
    const added=notes.at(-1)!;assert(Math.abs(added.frequencyHz-Number(black.dataset.frequencyHz))<1e-8);
    assert(Math.abs(added.durationSeconds!-.03125)<1e-8,'finer visible divisions enable notes shorter than a configured quarter-beat cell');
    assert.equal(f.note(added.id).style.top,`${Number.parseFloat(String(black.style.top))+1}px`);
    assert.equal(f.note(added.id).style.height,`${rowHeight-2}px`);
    const lowerKey=keys[keys.indexOf(black)+1]!,moving=f.note(added.id);
    const from={clientX:Number.parseFloat(String(moving.style.left))+3,clientY:at.clientY};
    scroll.emit('pointerdown',{target:moving,...from});
    f.document.emit('pointermove',{...from,clientY:Number.parseFloat(String(lowerKey.style.top))+Number.parseFloat(String(lowerKey.style.height))/2-scroll.scrollTop});f.document.emit('pointerup');
    assert.equal(f.phrase.read().body!.parts.find(part=>part.id===f.first)!.notes.at(-1)!.frequencyHz,Number(lowerKey.dataset.frequencyHz),'dragging across a narrow black row lands on the visible destination');
    assert.equal(f.note(added.id).style.height,`${rowHeight-2}px`);
    const held=()=>f.phrase.read().body!.parts.find(part=>part.id===f.first)!.notes.find(note=>note.id===added.id)!;
    const duration=f.root.querySelectorAll('input').find(input=>input.attributes.get('aria-label')==='时长 / 秒')!;
    duration.value='.0001';duration.emit('input');duration.emit('change');
    assert.equal(held().durationSeconds,.0001);assert(held().durationBeats<1/1024);
    scroll.emit('wheel',{target:f.note(added.id),deltaY:-100});assert(held().durationSeconds!>.0001&&held().durationSeconds!<.001,'wheel remains fine-grained for very short notes');
    const block=f.note(added.id),bounds=block.getBoundingClientRect(),point={clientX:bounds.right,clientY:at.clientY};
    scroll.emit('pointerdown',{target:block.querySelector('.melody-note-resize'),...point});
    f.document.emit('pointermove',{...point,clientX:point.clientX-20});f.document.emit('pointerup');
    assert.equal(held().durationSeconds,.0001,'resize shares the same 0.1ms floor');
  }finally{f.cleanup();}
});

test('reopening restores viewport, selected note and per-family duration without saving music',()=>{
  const records=new Map<string,string>(),storage={getItem:(key:string)=>records.get(key)??null,setItem(key:string,value:string){records.set(key,value);}};
  const port=createMusicWorkspaceState(storage,'fixture-project'),f=editableRoll({workspaceState:port});try{
    const scroll=f.root.querySelector('.melody-scroll')!,canvas=f.root.querySelector('.melody-canvas')!;
    scroll.emit('pointerdown',{target:f.note(f.a),clientX:130,clientY:100});f.document.emit('pointerup');
    const duration=f.root.querySelectorAll('input').find(item=>item.attributes.get('aria-label')==='时长 / 秒')!;
    duration.value='.173';duration.emit('input');duration.emit('change');
    for(const modifiers of [{ctrlKey:true},{ctrlKey:true,shiftKey:true},{shiftKey:true},{}])scroll.emit('wheel',{target:canvas,deltaY:40,clientX:200,clientY:100,...modifiers});
    f.roll.setPlayhead(3.25);const original=f.read();f.roll.flush();
    const expected=f.roll.readViewport();assert.equal(f.read(),original,'saving view context must not change musical content');
    assert.deepEqual(port.read()!.selection,{partId:f.first,noteId:f.a});
    f.reopen(createMusicWorkspaceState(storage,'fixture-project'));assert.deepEqual(f.roll.readViewport(),expected);assert(f.note(f.a).classList.contains('is-selected'));
    assert.equal(createMusicWorkspaceState(storage,'fixture-project').read()!.noteLengths[f.first],.173);
    assert.equal(port.read()!.playheadSeconds,3.25);
    f.phrase.removeNote(f.first,f.a);f.reopen();assert.equal(f.root.querySelectorAll('.melody-note').filter(note=>note.classList.contains('is-selected')).length,0);
    assert(f.family(f.first).classList.contains('is-selected'),'an unsaved/deleted note is not recreated; its surviving family remains available');
  }finally{f.cleanup();}
});

test('edited family duration is reused exactly for mouse and keyboard notes and does not affect other families',()=>{
  const f=editableRoll({performance:true});try{
    let scroll=f.root.querySelector('.melody-scroll')!,canvas=f.root.querySelector('.melody-canvas')!;
    scroll.emit('pointerdown',{target:f.note(f.a),clientX:130,clientY:100});f.document.emit('pointerup');
    const input=f.root.querySelectorAll('input').find(item=>item.attributes.get('aria-label')==='时长 / 秒')!;
    input.value='.173';input.emit('input');input.emit('change');
    const draw=(family:string,x:number)=>{f.family(family).emit('click');const note=f.note(f.a);const at={clientX:x,clientY:Number.parseFloat(String(note.style.top))+5-scroll.scrollTop};scroll.emit('pointerdown',{target:canvas,...at});f.document.emit('pointerup',at);return f.phrase.read().body!.parts.find(part=>part.id===family)!.notes.at(-1)!;};
    assert.equal(draw(f.first,700).durationSeconds,.173,'a remembered non-grid length must not be rounded');
    assert.equal(draw(f.second,800).durationSeconds,.125,'another family still uses its own default');
    f.family(f.first).emit('click');f.document.emit('keydown',{key:'c',target:scroll});
    let notes=f.phrase.read().body!.parts.find(part=>part.id===f.first)!.notes;
    assert.equal(notes.at(-1)!.durationSeconds,.173);
    scroll.emit('wheel',{target:f.note(notes.at(-1)!.id),deltaY:-100});assert.equal(draw(f.first,900).durationSeconds,.183);
    const resizing=f.note(f.a),bounds=resizing.getBoundingClientRect(),at={clientX:bounds.right,clientY:100};
    scroll.emit('pointerdown',{target:resizing.querySelector('.melody-note-resize'),...at});
    f.document.emit('pointermove',{...at,clientX:at.clientX+64});f.document.emit('pointerup');
    assert(Math.abs(draw(f.first,600).durationSeconds!-.423)<1e-8,'resize changes the same family default');
    notes=f.phrase.read().body!.parts.find(part=>part.id===f.first)!.notes;assert.equal(notes[0]!.durationSeconds,.423);
  }finally{f.cleanup();}
});

test('music shell restores playhead before the roll can persist a new context',async()=>{
  const records=new Map<string,string>(),storage={getItem:(key:string)=>records.get(key)??null,setItem(key:string,value:string){records.set(key,value);}};
  const port=createMusicWorkspaceState(storage,'shell-project'),f=editableRoll();f.roll.dispose();
  const expected={leftSeconds:1,zoom:4,top:500,rowHeight:36};
  port.write({orientation:'vertical',viewport:expected,selection:{partId:f.first,noteId:f.a},playheadSeconds:2.5,entryOctave:5,noteLengths:{[f.first]:.173}});
  const sound={stopAll(){},stop(){},cancelAudition(){},subscribe(){return()=>{};},position(){return 0;},async audition(){}} as unknown as SoundRuntimePort;
  const composition=mountPhraseComposition(f.root as unknown as HTMLElement,{phrase:f.phrase,sound,directMusic:true,workspaceState:port});
  try{
    await settle();assert(!f.root.querySelector('.melody-note.is-selected'));
    assert(!f.root.querySelector('.melody-note-family.is-selected'));
    assert(!f.root.querySelector('.song-clock'));
    assert.equal(f.root.querySelector('.melody-playhead-time')!.textContent,'00:02.500');
    await composition.flush();assert.deepEqual(port.read()!.viewport,expected);assert.equal(port.read()!.playheadSeconds,2.5);
  }finally{composition.dispose();f.cleanup();}
});

test('vertical roll transposes time, pitches, gestures, resize and physical wheel axes without a console',()=>{
  const records=new Map<string,string>(),storage={getItem:(key:string)=>records.get(key)??null,setItem(key:string,value:string){records.set(key,value);}};
  const state=createMusicWorkspaceState(storage,'vertical-test'),f=editableRoll({orientation:'vertical',workspaceState:state});try{
    const scroll=f.root.querySelector('.melody-scroll')!,canvas=f.root.querySelector('.melody-canvas')!,ruler=f.root.querySelector('.melody-ruler')!;
    assert.equal(f.root.querySelector('.melody-console')!.hidden,true);
    const keys=f.root.querySelectorAll('.melody-key');
    assert(Number(keys[0]!.dataset.frequencyHz)<Number(keys.at(-1)!.dataset.frequencyHz));
    assert(keys.every(key=>key.style.width==='32px'),'white and black keys have equal pitch width');
    assert(keys.filter(key=>key.textContent).every(key=>/^C-?\d+$/u.test(key.textContent)),'only C octave names are printed');
    assert(keys.every(key=>key.title.startsWith(key.dataset.pitchLabel!)),'all pitches remain readable on hover');
    assert.equal(f.note(f.a).style.width,'30px');
    const initial=f.roll.readViewport(),before=structuredClone(f.phrase.read().body);
    scroll.emit('wheel',{target:canvas,deltaY:64,clientX:200,clientY:100});let next=f.roll.readViewport();
    assert(next.leftSeconds>initial.leftSeconds);assert.equal(next.top,initial.top);
    scroll.emit('wheel',{target:canvas,deltaY:40,shiftKey:true,clientX:200,clientY:100});assert.equal(f.roll.readViewport().top,initial.top+40);
    next=f.roll.readViewport();scroll.emit('wheel',{target:canvas,deltaY:-60,ctrlKey:true,clientX:200,clientY:100});assert(f.roll.readViewport().zoom>next.zoom);assert.equal(f.roll.readViewport().rowHeight,next.rowHeight);
    next=f.roll.readViewport();scroll.emit('wheel',{target:canvas,deltaY:-60,ctrlKey:true,shiftKey:true,clientX:200,clientY:100});assert(f.roll.readViewport().rowHeight>next.rowHeight);assert.equal(f.roll.readViewport().zoom,next.zoom);
    next=f.roll.readViewport();f.document.emit('keydown',{key:'ArrowRight',ctrlKey:true,target:scroll});assert(f.roll.readViewport().rowHeight>next.rowHeight);assert.equal(f.roll.readViewport().zoom,next.zoom);
    next=f.roll.readViewport();f.document.emit('keydown',{key:'ArrowUp',ctrlKey:true,target:scroll});assert(f.roll.readViewport().zoom>next.zoom);assert.equal(f.roll.readViewport().rowHeight,next.rowHeight);
    assert.deepEqual(f.phrase.read().body,before);
    const panBefore=f.roll.readViewport();scroll.emit('pointerdown',{target:canvas,button:1,clientX:250,clientY:250});
    f.document.emit('pointermove',{clientX:220,clientY:210});f.document.emit('pointerup');
    assert(f.roll.readViewport().top>panBefore.top);assert(f.roll.readViewport().leftSeconds>panBefore.leftSeconds);
    const view=f.roll.readViewport();f.family(f.first).emit('click');
    const key=f.root.querySelectorAll('.melody-key').find(key=>key.textContent==='C4')!;
    const at={clientX:Number.parseFloat(String(key.style.left))+view.rowHeight/2-scroll.scrollLeft,clientY:200};
    scroll.emit('pointerdown',{target:canvas,...at});f.document.emit('pointerup',at);
    let notes=f.phrase.read().body!.parts.find(part=>part.id===f.first)!.notes;const added=notes.at(-1)!;
    assert(Math.abs(added.frequencyHz-Number(key.dataset.frequencyHz))<1e-8);
    const block=f.note(added.id),bounds=block.getBoundingClientRect();
    const resize={clientX:bounds.left+10,clientY:bounds.bottom};
    scroll.emit('pointerdown',{target:block.querySelector('.melody-note-resize'),...resize,timeStamp:0});
    f.document.emit('pointermove',{...resize,clientY:resize.clientY+64,timeStamp:140});f.document.emit('pointerup',{timeStamp:160});
    notes=f.phrase.read().body!.parts.find(part=>part.id===f.first)!.notes;assert(notes.at(-1)!.durationSeconds!>added.durationSeconds!);
    const changed=f.note(added.id),point={clientX:Number.parseFloat(String(changed.style.left))+10-scroll.scrollLeft,clientY:Number.parseFloat(String(changed.style.top))+2};
    scroll.emit('pointerdown',{target:changed,...point,timeStamp:200});f.document.emit('pointermove',{clientX:point.clientX+view.rowHeight,clientY:point.clientY+32,timeStamp:340});f.document.emit('pointerup',{timeStamp:360});
    const moved=f.phrase.read().body!.parts.find(part=>part.id===f.first)!.notes.at(-1)!;
    assert(moved.frequencyHz>added.frequencyHz);assert(moved.startBeat>added.startBeat);
    ruler.emit('pointerdown',{button:0,clientX:0,clientY:120});f.document.emit('pointerup');
    assert(!f.root.querySelector('.melody-head-handle')!.hidden);
    const remembered=f.roll.readViewport();f.roll.flush();assert.equal(state.read()!.orientation,'vertical');
    f.reopen(createMusicWorkspaceState(storage,'vertical-test'));assert.deepEqual(f.roll.readViewport(),remembered);
    assert(f.family(f.first).classList.contains('is-selected'));assert(!f.note(moved.id).classList.contains('is-selected'));
    f.family(f.first).emit('dblclick');assert(f.root.querySelector('.melody-tone-library'),'family sound replacement remains accessible without a console');
  }finally{f.cleanup();}
});

test('playhead drag follows the pointer during playback and seeks only once on release', () => {
  const f = editableRoll({ orientation: 'vertical', playing: true });
  try {
    const ruler = f.root.querySelector('.melody-ruler')!;
    const head = f.root.querySelector('.melody-head-handle')!;
    const displayed = () => Number(head.attributes.get('aria-valuenow'));
    ruler.emit('pointerdown', { clientY: 120 });
    const start = displayed();
    for (let index = 1; index <= 60; index++) {
      f.document.emit('pointermove', { clientY: 120 + index });
      const preview = displayed();
      f.roll.setPlayhead(index / 100, true);
      assert.equal(displayed(), preview);
    }
    const target = displayed();
    assert(target > start);
    assert.deepEqual(f.seeks, []);
    f.document.emit('pointerup');
    ruler.emit('lostpointercapture');
    assert.deepEqual(f.seeks, [target]);

    ruler.emit('pointerdown', { clientY: 200 });
    f.roll.setPlayhead(.8, true);
    f.document.emit('pointercancel');
    assert.equal(displayed(), .8);
    assert.deepEqual(f.seeks, [target]);
  } finally { f.cleanup(); }
});

test('vertical scroll renders notes in its visible time window without altering offscreen music',()=>{
  const f=editableRoll({orientation:'vertical'});try{
    const far=f.phrase.addNote(f.first,{startBeat:15,durationBeats:.5,durationSeconds:.25,frequencyHz:261.6255653005986,velocity:.7});f.roll.refresh();
    assert.equal(f.root.querySelectorAll('.melody-note').find(note=>note.dataset.noteId===far),undefined);
    const before=structuredClone(f.phrase.read().body),scroll=f.root.querySelector('.melody-scroll')!,canvas=f.root.querySelector('.melody-canvas')!;
    scroll.emit('wheel',{target:canvas,deltaY:3000,clientX:200,clientY:100});
    f.flushFrames();
    assert(f.note(far));assert.deepEqual(f.phrase.read().body,before);
  }finally{f.cleanup();}
});

test('8192-note roll mounts only visible pitches and restores notes on native scrolling', t => {
  const records = new Map<string, string>();
  const workspaceState = createMusicWorkspaceState({ getItem: key => records.get(key) ?? null,
    setItem(key, value) { records.set(key, value); } }, 'dense-roll');
  const f = editableRoll({ orientation: 'vertical', workspaceState });
  try {
    const keys = f.phrase.keyboard();
    f.phrase.addNotes(f.first, Array.from({ length: 8192 }, (_, i) => ({ startBeat: (i % 64) / 32,
      durationBeats: .125, frequencyHz: keys[i % keys.length]!.frequencyHz, velocity: .7 })));
    let created = 0;
    const createElement = f.document.createElement.bind(f.document);
    f.document.createElement = tag => { created++; return createElement(tag); };
    f.reopen();
    assert(created < 7000, `opening created ${created} elements including resize handles`);
    const before = structuredClone(f.phrase.read().body);
    const scroll = f.root.querySelector('.melody-scroll')!;
    const mounted = () => f.root.querySelectorAll('.melody-note');
    assert(mounted().length > 0 && mounted().length < 3000, `mounted ${mounted().length} notes`);
    t.diagnostic(`8194 stored notes: ${mounted().length} mounted note blocks, ${created} total elements created on reopen`);
    scroll.scrollLeft = 0; scroll.emit('scroll'); f.flushFrames();
    const lowIds = new Set(mounted().map(block => block.dataset.noteId));
    const retained = mounted()[0]!;
    let writes = 0;
    const setAttribute = retained.setAttribute.bind(retained);
    retained.setAttribute = (name, value) => { writes++; setAttribute(name, value); };
    retained.style = new Proxy(retained.style, { set(target, key, value) { writes++; return Reflect.set(target, key, value); } });
    scroll.emit('scroll'); f.flushFrames();
    assert.equal(writes, 0, 'an unchanged viewport does not rewrite retained note styles or labels');
    const lowPitch = Math.min(...keys.map(key => key.frequencyHz));
    assert(before!.parts.find(part => part.id === f.first)!.notes.filter(note => note.frequencyHz === lowPitch)
      .every(note => lowIds.has(note.id)), 'native pitch scrolling restores low notes');
    scroll.scrollLeft = 100000; scroll.emit('scroll'); f.flushFrames();
    assert(mounted().length > 0 && mounted().length < 3000);
    assert(mounted().every(block => !lowIds.has(block.dataset.noteId)), 'opposite pitch window releases old nodes');
    scroll.scrollLeft = 0; scroll.emit('scroll'); f.flushFrames();
    assert.deepEqual(new Set(mounted().map(block => block.dataset.noteId)), lowIds);
    assert.deepEqual(f.phrase.read().body, before, 'virtualization preserves every stored note');
  } finally { f.cleanup(); }
});

test('footer plus appends connected rolls and the BPM menu has no duplicate creation entry',()=>{
  const f=editableRoll({orientation:'vertical'});try{
    f.phrase.setLength(16);f.roll.refresh();
    const first=structuredClone(f.phrase.read().body!.parts),scroll=f.root.querySelector('.melody-scroll')!,canvas=f.root.querySelector('.melody-canvas')!;
    f.root.querySelector('.melody-tempo-button')!.emit('click');
    assert(!f.root.querySelector('.melody-tempo-panel')!.hidden);
    assert.equal(f.root.querySelector('.melody-add-tempo-roll'),undefined);
    f.root.querySelector('.melody-extend')!.emit('click');
    let body=f.phrase.read().body!;assert.equal(body.tempoSections!.length,1);assert.equal(body.tempoSections![0]!.startBeat,16);
    assert.equal(body.lengthBeats,32);assert.deepEqual(body.parts,first);assert.equal(f.roll.readViewport().leftSeconds,8);
    const input=f.root.querySelector('.melody-tempo-input')!;
    f.root.querySelector('.melody-tempo-button')!.emit('click');input.value='60';input.emit('change');
    body=f.phrase.read().body!;assert.equal(body.tempoBpm,120);assert.equal(body.tempoSections![0]!.tempoBpm,60);
    f.root.querySelector('.melody-tempo-button')!.emit('click');
    f.family(f.first).emit('click');
    const view=f.roll.readViewport(),scale=melodyScale(view,scroll.clientHeight-48,melodyDuration(body));
    scroll.emit('pointerdown',{target:canvas,clientX:200,clientY:(9-view.leftSeconds)*scale});f.document.emit('pointerup');
    body=f.phrase.read().body!;const note=body.parts.find(p=>p.id===f.first)!.notes.at(-1)!;
    assert(Math.abs(note.startBeat-17)<1e-10,'second roll uses its60BPM clock');
    scroll.emit('wheel',{target:canvas,deltaY:-100,clientX:200,clientY:100});f.flushFrames();
    assert.equal(f.root.querySelectorAll('.melody-bpm-roll').length,2,'both adjacent rolls move in the same canvas');
    f.root.querySelector('.melody-quick-thumb')!.emit('keydown',{key:'End'});f.flushFrames();
    const plus=f.root.querySelector('.melody-extend')!;assert(!plus.hidden);
    assert.equal(plus.style.top,undefined,'footer plus has no time-positioned inline offset');
    const old=body.lengthBeats;plus.emit('click');assert.equal(f.phrase.read().body!.lengthBeats,old+16);
    assert.equal(f.phrase.read().body!.tempoSections![0]!.startBeat,16);
    assert.equal(f.phrase.read().body!.tempoSections![1]!.startBeat,old);
    assert.equal(f.phrase.read().body!.tempoSections![1]!.tempoBpm,60);
  }finally{f.cleanup();}
});

test('the keyboard BPM follows and edits the tempo roll at the lower viewport edge', () => {
  const f = editableRoll({ orientation: 'vertical' });
  try {
    f.phrase.setLength(16);
    const section = f.phrase.addTempoSection();
    f.phrase.setTempoSection(section, 90);
    f.roll.refresh();
    const scroll = f.root.querySelector('.melody-scroll')!, canvas = f.root.querySelector('.melody-canvas')!;
    const dock = f.root.querySelector('.melody-tempo-dock')!, button = dock.querySelector('.melody-tempo-button')!;
    const view = f.roll.readViewport(), scale = melodyScale(view, scroll.clientHeight - 48, melodyDuration(f.phrase.read().body!));
    const lowerEdge = (seconds: number) => {
      const left = f.roll.readViewport().leftSeconds;
      scroll.emit('wheel', { target: canvas, deltaY: (seconds - left) * scale - (scroll.clientHeight - 48), clientX: 200, clientY: 100 });
      f.flushFrames();
    };
    lowerEdge(8);
    assert.equal(dock.dataset.sectionId, 'first');
    assert.equal(button.textContent, '120');
    lowerEdge(8.25);
    assert(f.roll.readViewport().leftSeconds < 8);
    assert.equal(dock.dataset.sectionId, section);
    assert.equal(button.textContent, '90');
    button.emit('click');
    const input = f.root.querySelector('.melody-tempo-input')!;
    assert.equal(input.value, '90');
    input.value = '100'; input.emit('change');
    assert.equal(f.phrase.read().body!.tempoBpm, 120);
    assert.equal(f.phrase.read().body!.tempoSections![0]!.tempoBpm, 100);
    const control = f.root.querySelector('.melody-tempo-rate')!;
    const commits = f.commits.length;
    control.emit('pointerdown', { target: input, clientY: 300 });
    control.emit('pointermove', { target: input, clientY: 260 });
    f.flushFrames();
    assert.equal(input.value, '140');
    assert.equal(f.phrase.read().body!.tempoSections![0]!.tempoBpm, 100);
    assert.equal(f.commits.length, commits);
    control.emit('pointerup', { target: input, clientY: 260 });
    assert.equal(f.phrase.read().body!.tempoBpm, 120);
    assert.equal(f.phrase.read().body!.tempoSections![0]!.tempoBpm, 140);
    assert.equal(f.commits.length, commits + 1);
    f.phrase.undo();
    assert.equal(f.phrase.read().body!.tempoSections![0]!.tempoBpm, 100);
  } finally { f.cleanup(); }
});

test('compact roll labels open shared controls that edit only the selected roll',()=>{
  const f=editableRoll({orientation:'vertical'}),original=Object.getOwnPropertyDescriptor(globalThis,'performance');let now=0;
  Object.defineProperty(globalThis,'performance',{configurable:true,value:{now:()=>now}});
  try{
    f.phrase.setLength(16);const section=f.phrase.addTempoSection();f.roll.refresh();
    const scroll=f.root.querySelector('.melody-scroll')!,canvas=f.root.querySelector('.melody-canvas')!;
    scroll.emit('wheel',{target:canvas,deltaY:1800,clientX:200,clientY:100});f.flushFrames();
    const block=f.root.querySelectorAll('.melody-tempo-block').find(b=>b.dataset.sectionId===section)!;
    assert(!block.hidden);assert.equal(block.querySelector('.melody-tempo-grid'),undefined);
    assert.equal(f.root.querySelector('.melody-tempo-dock')!.querySelector('select'),undefined);
    block.querySelector('.melody-tempo-marker')!.emit('click');
    const grid=f.root.querySelector('.melody-tempo-panel')!.querySelector('.melody-tempo-grid')!;
    grid.value='3';grid.emit('change');let body=f.phrase.read().body!;
    assert.equal(body.tempoSections![0]!.stepsPerBeat,3);assert.equal(body.stepsPerBeat,undefined);
    block.querySelector('.melody-tempo-marker')!.emit('click');
    assert.equal(f.root.querySelector('.melody-panel-grid'),undefined);
    assert.equal(block.querySelector('.melody-tap-tempo'),undefined);
    assert.equal(f.root.querySelector('.melody-tempo-dock')!.querySelector('.melody-tap-tempo'),undefined);
    grid.value='5';grid.emit('change');
    assert.equal(f.phrase.read().body!.tempoSections![0]!.stepsPerBeat,5);
    f.root.querySelector('.melody-tempo-panel')!.querySelector('.melody-tap-tempo')!.emit('click');
    for(const at of [0,400,800,1200]){now=at;f.root.querySelector('.tap-tempo-pad')!.emit('click');}
    f.root.querySelector('.tap-tempo-apply')!.emit('click');body=f.phrase.read().body!;
    assert.equal(body.tempoBpm,120);assert.equal(body.tempoSections![0]!.tempoBpm,150);assert.equal(body.tempoSections![0]!.stepsPerBeat,5);
    f.phrase.undo();assert.equal(f.phrase.read().body!.tempoSections![0]!.tempoBpm,120);
  }finally{f.cleanup();if(original)Object.defineProperty(globalThis,'performance',original);}
});

test('last roll edge is reachable after the end, previews without saving and resizes in one undo step',()=>{
  const f=editableRoll({orientation:'vertical',playing:true});try{
    f.phrase.setLength(16);const section=f.phrase.addTempoSection();
    const late=f.phrase.addNote(f.first,{startBeat:30,durationBeats:.5,durationSeconds:.25,frequencyHz:440,velocity:.7});f.roll.refresh();
    const scroll=f.root.querySelector('.melody-scroll')!,canvas=f.root.querySelector('.melody-canvas')!,edge=f.root.querySelector('.melody-roll-end')!;
    scroll.emit('wheel',{target:canvas,deltaY:100000,clientX:200,clientY:100});f.flushFrames();
    assert(!edge.hidden);const top=Number.parseFloat(String(edge.style.top));assert(top>0&&top<scroll.clientHeight-48-10,'the edge has blank space below it');
    const before=f.phrase.read().body!,text=f.read(),scale=melodyScale(f.roll.readViewport(),scroll.clientHeight-48,melodyDuration(before));
    edge.emit('pointerdown',{clientY:100});f.document.emit('pointermove',{clientY:100-2*scale});f.flushFrames();
    f.roll.setPlayhead(15.2, true);
    assert.equal(f.read(),text);
    assert.deepEqual(f.previews, []);
    assert.deepEqual(f.commits, []);
    assert.deepEqual(f.seeks, []);
    f.document.emit('pointerup');let body=f.phrase.read().body!;assert.equal(body.lengthBeats,28);
    assert.deepEqual(f.commits, [true]);
    assert.equal(body.tempoSections![0]!.startBeat,16);assert.equal(body.tempoSections![0]!.id,section);assert(body.parts[0]!.hiddenNotes!.some(item=>item.note.id===late));
    f.phrase.undo();assert.deepEqual(f.phrase.read().body,before);f.roll.refresh();
    edge.emit('pointerdown',{clientY:100});f.document.emit('pointermove',{clientY:100+scale});f.flushFrames();f.document.emit('pointercancel');assert.deepEqual(f.phrase.read().body,before);
    edge.emit('keydown',{key:'ArrowDown'});assert.equal(f.phrase.read().body!.lengthBeats,36);
  }finally{f.cleanup();}
});

test('dragging a BPM label previews only the boundary, snaps to a beat and supports undo and cancel',()=>{
  const f=editableRoll({orientation:'vertical',playing:true});try{
    f.phrase.setLength(16);const section=f.phrase.addTempoSection();
    const late=f.phrase.addNote(f.first,{startBeat:14,durationBeats:.5,durationSeconds:.25,frequencyHz:440,velocity:.7});
    const lower=f.phrase.addNote(f.first,{startBeat:18,durationBeats:.5,durationSeconds:.25,frequencyHz:660,velocity:.7});f.roll.refresh();
    const scroll=f.root.querySelector('.melody-scroll')!,canvas=f.root.querySelector('.melody-canvas')!;
    scroll.emit('wheel',{target:canvas,deltaY:1800,clientX:200,clientY:100});f.flushFrames();
    let marker=f.root.querySelectorAll('.melody-tempo-marker').find(m=>m.attributes.get('aria-label')==='卷帘 2 BPM')!;
    const scale=melodyScale(f.roll.readViewport(),scroll.clientHeight-48,melodyDuration(f.phrase.read().body!));
    const before=f.read(),viewport=f.roll.readViewport(),original=f.phrase.read().body!;
    const markerTop = Number.parseFloat(String(marker.parentElement!.style.top));
    marker.emit('pointerdown',{clientY:100});f.document.emit('pointermove',{clientY:100-2*scale});f.flushFrames();
    f.flushFrames();
    assert(Math.abs(Number.parseFloat(String(marker.parentElement!.style.top)) - markerTop + 2 * scale) < 1e-6);
    assert.deepEqual(f.previews, []);
    assert.deepEqual(f.commits, []);
    assert.deepEqual(f.phrase.read().body!.parts, original.parts);
    assert.equal(f.read(),before,'preview cannot change persisted working content');assert(!f.root.querySelector('.melody-tempo-resize-hint')!.hidden);
    f.roll.setPlayhead(0,true);assert.deepEqual(f.roll.readViewport(),viewport,'label drag owns the camera');
    f.document.emit('pointerup');
    let body=f.phrase.read().body!;assert.equal(body.tempoSections![0]!.startBeat,12);
    assert.deepEqual(f.commits, [true]);
    assert.equal(body.parts[0]!.notes.find(n=>n.id===late)!.startBeat,14);
    assert.equal(body.parts[0]!.notes.find(n=>n.id===lower)!.startBeat,18);
    f.phrase.undo();assert.equal(f.phrase.read().body!.tempoSections![0]!.startBeat,16);assert(f.phrase.read().body!.parts[0]!.notes.some(n=>n.id===late));f.roll.refresh();
    marker=f.root.querySelectorAll('.melody-tempo-marker').find(m=>m.attributes.get('aria-label')==='卷帘 2 BPM')!;
    const restored=f.read();marker.emit('pointerdown',{clientY:100});f.document.emit('pointermove',{clientY:100+scale});f.flushFrames();
    f.document.emit('pointercancel');assert.equal(f.read(),restored);assert(f.root.querySelector('.melody-tempo-resize-hint')!.hidden);
    assert(!marker.hasPointerCapture(1));
    marker.emit('pointerdown',{clientY:100});f.document.emit('pointermove',{clientY:100+.65*scale});f.flushFrames();
    f.document.emit('pointerup');body=f.phrase.read().body!;assert.equal(body.tempoSections![0]!.startBeat,17);
    marker.emit('keydown',{key:'ArrowDown'});body=f.phrase.read().body!;assert.equal(body.tempoSections![0]!.startBeat,18);
    assert.equal(body.tempoSections![0]!.id,section);
  }finally{f.cleanup();}
});

test('off-grid note heads and triplets retain exact placement and QWEASD leave notes unchanged',()=>{
  const f=editableRoll({orientation:'vertical'});
  try{
    const scroll=f.root.querySelector('.melody-scroll')!,canvas=f.root.querySelector('.melody-canvas')!;
    f.family(f.first).emit('click');const view=f.roll.readViewport(),scale=melodyScale(view,scroll.clientHeight-48,melodyDuration(f.phrase.read().body!));
    for(const beat of [1/3,2/3]){
      const at={clientX:200,clientY:beat*.5*scale};
      scroll.emit('pointerdown',{target:canvas,...at});f.document.emit('pointerup',at);
      const created=f.phrase.read().body!.parts.find(p=>p.id===f.first)!.notes.at(-1)!;
      assert(Math.abs(created.startBeat-beat)<1e-10,'a triplet position is not floored to quarters');
    }
    const note=f.phrase.read().body!.parts.find(p=>p.id===f.first)!.notes.at(-1)!,block=f.note(note.id),bounds=block.getBoundingClientRect();
    const at={clientX:bounds.left+4,clientY:bounds.top+2};
    scroll.emit('pointerdown',{target:block,...at,timeStamp:0});f.document.emit('pointermove',{...at,clientY:at.clientY+3,timeStamp:140});
    const ghost=f.note(note.id).style.top;f.document.emit('pointerup',{timeStamp:160});
    let edited=f.phrase.read().body!.parts.find(p=>p.id===f.first)!.notes.at(-1)!;
    assert(Math.abs(edited.startBeat-(note.startBeat+6/scale))<1e-10);
    assert.equal(f.note(note.id).style.top,ghost,'releasing does not jump the note head');
    const before=structuredClone(f.phrase.read().body),working=f.read();
    for(const key of 'qweasdQWEASD'){
      f.document.emit('keydown',{target:scroll,key});f.document.emit('keydown',{target:scroll,key});
      f.document.emit('keydown',{target:scroll,key,repeat:true});
    }
    assert.deepEqual(f.phrase.read().body,before,'position, gain, pan and other musical data stay unchanged');
    assert.equal(f.read(),working,'removed shortcuts cannot add edit-history entries');
  }finally{f.cleanup();}
});

test('keyboard auditions piano without selection and drags pitch independently with or without a selected family',async()=>{
  const f=editableRoll({orientation:'vertical'});try{
    const scroll=f.root.querySelector('.melody-scroll')!;
    const piano=f.phrase.previewPianoPlan.bind(f.phrase);let pianoCalls=0;
    f.phrase.previewPianoPlan=note=>{pianoCalls++;return piano(note);};
    let key=f.root.querySelectorAll('.melody-key').find(k=>k.dataset.pitchLabel==='C4')!;
    const music=structuredClone(f.phrase.read().body);
    key.emit('click');await settle();assert.equal(pianoCalls,1);assert.equal(f.auditions.length,1);assert(Math.abs(f.auditions[0]!.note.frequencyHz-261.6255653005986)<1e-8);
    for(const selected of [false,true]){
      if(selected)f.family(f.first).emit('click');
      key=f.root.querySelectorAll('.melody-key').find(k=>k.dataset.pitchLabel==='C4')!;
      const before=f.roll.readViewport();const count:number=f.auditions.length;
      scroll.emit('pointerdown',{target:key,clientX:500,clientY:10});
      f.document.emit('pointermove',{clientX:460,clientY:10});f.document.emit('pointerup');f.flushFrames();
      const after=f.roll.readViewport();assert.equal(after.top,before.top+40);assert.equal(after.leftSeconds,before.leftSeconds);
      key.emit('click');await settle();assert.equal(f.auditions.length,count,'a drag must not also trigger a click audition');
      assert.deepEqual(f.phrase.read().body,music);
    }
  }finally{f.cleanup();}
});

test('vertical playback flips instantly only at the bottom, keeps pitch zoom and never edits music',()=>{
  const f=editableRoll({orientation:'vertical'});
  const original=Object.getOwnPropertyDescriptor(globalThis,'performance');let now=0;
  Object.defineProperty(globalThis,'performance',{configurable:true,value:{now:()=>now}});
  try{
    f.phrase.setLength(64);f.roll.refresh();
    const before=structuredClone(f.phrase.read().body),start=f.roll.readViewport(),span=8/start.zoom;
    f.roll.setPlayhead(start.leftSeconds+span*.99,true);
    assert.equal(f.roll.readViewport().leftSeconds,start.leftSeconds,'no early movement or easing');
    const time=start.leftSeconds+span*.999;
    f.roll.setPlayhead(time,true);
    assert.equal(f.roll.readViewport().leftSeconds,time,'one clock update puts the head exactly at the top');
    assert.equal(f.root.querySelector('.melody-playhead')!.style.transform,'translateY(0px)');
    now=400;f.roll.setPlayhead(time+.1,true);
    const followed=f.roll.readViewport();
    assert(time+.1>=followed.leftSeconds&&time+.1<followed.leftSeconds+span);
    assert.equal(followed.top,start.top);assert.equal(followed.rowHeight,start.rowHeight);assert.equal(followed.zoom,start.zoom);
    const head=f.root.querySelector('.melody-playhead')!;
    assert(!head.hidden);assert(String(head.style.transform).startsWith('translateY('));
    f.roll.setPlayhead(0,true);assert(!head.hidden,'seeking back during playback immediately reveals the head');
    const paused=f.roll.readViewport();f.roll.setPlayhead(span*3,false);
    assert.deepEqual(f.roll.readViewport(),paused,'paused seeking does not take over navigation');
    f.roll.setPlayhead(31.5,true);
    assert.equal(f.roll.readViewport().leftSeconds,31.5,'final page also leaves the head at the top');
    assert.equal(f.root.querySelector('.melody-playhead')!.style.transform,'translateY(0px)');
    assert(f.root.querySelector('.melody-quick-scroll')!.hidden,'automatic following cannot reveal the manual locator');
    assert.deepEqual(f.phrase.read().body,before);
    assert(!f.root.querySelector('.melody-shelf')!.classList.contains('is-family-strip'));
  }finally{f.cleanup();if(original)Object.defineProperty(globalThis,'performance',original);}
});

test('manual browsing away suspends follow for30 seconds and further browsing restarts that interval',()=>{
  const f=editableRoll({orientation:'vertical'});
  const original=Object.getOwnPropertyDescriptor(globalThis,'performance');let now=0;
  Object.defineProperty(globalThis,'performance',{configurable:true,value:{now:()=>now}});
  try{
    f.phrase.setLength(128);f.roll.refresh();const music=structuredClone(f.phrase.read().body);
    const scroll=f.root.querySelector('.melody-scroll')!,canvas=f.root.querySelector('.melody-canvas')!;
    f.roll.setPlayhead(.5,true);
    const pan=()=>{scroll.emit('pointerdown',{target:canvas,altKey:true,clientX:200,clientY:200});f.document.emit('pointermove',{clientX:200,clientY:-800});f.document.emit('pointerup');f.flushFrames();};
    pan();const away=f.roll.readViewport();assert(away.leftSeconds>.5);
    now=29_999;f.roll.setPlayhead(.6,true);assert.deepEqual(f.roll.readViewport(),away);assert(f.root.querySelector('.melody-playhead')!.hidden);
    pan();const further=f.roll.readViewport();
    now=30_001;f.roll.setPlayhead(.7,true);assert.deepEqual(f.roll.readViewport(),further,'another manual pan restarts the grace period');
    now=60_000;f.roll.setPlayhead(.8,true);assert(!f.root.querySelector('.melody-playhead')!.hidden,'following resumes after the latest30-second interval');
    assert.deepEqual(f.phrase.read().body,music);
  }finally{f.cleanup();if(original)Object.defineProperty(globalThis,'performance',original);}
});

test('small navigation keeps following and returning to the head cancels the browsing grace period',()=>{
  const f=editableRoll({orientation:'vertical'});
  const original=Object.getOwnPropertyDescriptor(globalThis,'performance');let now=0;
  Object.defineProperty(globalThis,'performance',{configurable:true,value:{now:()=>now}});
  try{
    f.phrase.setLength(128);f.roll.refresh();
    const scroll=f.root.querySelector('.melody-scroll')!,canvas=f.root.querySelector('.melody-canvas')!;
    const wheel=(deltaY:number)=>{scroll.emit('wheel',{target:canvas,deltaY,clientX:200,clientY:100});f.flushFrames();};
    const span=8/f.roll.readViewport().zoom;f.roll.setPlayhead(span*.5,true);
    wheel(10);const slightly=f.roll.readViewport().leftSeconds;
    f.roll.setPlayhead(slightly+span*.999,true);
    assert(f.roll.readViewport().leftSeconds>slightly,'head remained visible after the small wheel move');
    f.roll.setPlayhead(.5,false);wheel(3000);const away=f.roll.readViewport();
    now=300;f.roll.setPlayhead(.6,true);assert.deepEqual(f.roll.readViewport(),away);
    wheel(-10000);assert.equal(f.roll.readViewport().leftSeconds,0);
    f.roll.setPlayhead(span*.999,true);
    assert(f.roll.readViewport().leftSeconds>0,'bringing the head back into view resumes without waiting30 seconds');
  }finally{f.cleanup();if(original)Object.defineProperty(globalThis,'performance',original);}
});

test('sustained time browsing reveals the locator and dragging reports the head direction without editing or seeking',()=>{
  const f=editableRoll({orientation:'vertical'});
  const original=Object.getOwnPropertyDescriptor(globalThis,'performance');let now=0;
  Object.defineProperty(globalThis,'performance',{configurable:true,value:{now:()=>now}});
  try{
    f.phrase.setLength(256);f.roll.refresh();const music=structuredClone(f.phrase.read().body);
    const scroll=f.root.querySelector('.melody-scroll')!,canvas=f.root.querySelector('.melody-canvas')!;
    const quick=f.root.querySelector('.melody-quick-scroll')!,thumb=f.root.querySelector('.melody-quick-thumb')!,hint=f.root.querySelector('.melody-quick-hint')!;
    const wheel=(deltaY:number)=>{scroll.emit('wheel',{target:canvas,deltaY,clientX:200,clientY:100});f.flushFrames();};
    wheel(30);assert(quick.hidden,'a short scroll does not clutter the canvas');
    now=650;wheel(30);assert(!quick.hidden,'continued small scrolls reveal the locator');
    f.roll.setPlayhead(0,false);
    quick.emit('pointerdown',{clientY:600});f.flushFrames();
    const late=f.roll.readViewport();assert(late.leftSeconds>60);assert.equal(hint.textContent,'');assert.equal(thumb.attributes.get('aria-description'),'播放线在上方');assert(!hint.hidden);
    now=40_000;f.roll.setPlayhead(.1,true);assert.deepEqual(f.roll.readViewport(),late,'drag owns navigation even past the grace timeout');
    f.document.emit('pointermove',{clientY:0});f.flushFrames();assert.equal(f.roll.readViewport().leftSeconds,0);
    f.roll.setPlayhead(100,false);assert.equal(thumb.attributes.get('aria-description'),'播放线在下方');
    f.document.emit('pointerup');assert(hint.hidden);
    quick.emit('pointerdown',{target:thumb,clientY:10});assert.equal(f.roll.readViewport().leftSeconds,0,'grabbing the thumb keeps its offset');
    f.document.emit('pointermove',{clientY:350});f.flushFrames();assert(f.roll.readViewport().leftSeconds>0);
    f.document.emit('pointercancel');assert(hint.hidden);assert(!quick.hasPointerCapture(1));
    thumb.emit('keydown',{key:'End'});f.flushFrames();assert.equal(f.roll.readViewport().leftSeconds,128-2/f.roll.readViewport().zoom);
    thumb.emit('keydown',{key:'Home'});f.flushFrames();assert.equal(f.roll.readViewport().leftSeconds,0);
    assert.deepEqual(f.phrase.read().body,music,'locator moves the camera, not notes or tempo');
  }finally{f.cleanup();if(original)Object.defineProperty(globalThis,'performance',original);}
});

test('a large canvas pan reveals the locator and the head hint also identifies an in-view head',()=>{
  const f=editableRoll({orientation:'vertical'});try{
    f.phrase.setLength(256);f.roll.refresh();
    const scroll=f.root.querySelector('.melody-scroll')!,canvas=f.root.querySelector('.melody-canvas')!,quick=f.root.querySelector('.melody-quick-scroll')!;
    scroll.emit('pointerdown',{target:canvas,altKey:true,clientX:200,clientY:200});
    f.document.emit('pointermove',{clientX:200,clientY:-800});f.document.emit('pointerup');f.flushFrames();
    assert(!quick.hidden);
    quick.emit('pointerdown',{clientY:0});f.flushFrames();
    f.roll.setPlayhead(.1,false);assert.equal(f.root.querySelector('.melody-quick-hint')!.textContent,'');
    assert.equal(f.root.querySelector('.melody-quick-thumb')!.attributes.get('aria-description'),'播放线在视野内');
    f.document.emit('pointerup');
  }finally{f.cleanup();}
});

test('narrow pitch columns stack C octave labels and keep every full pitch available on hover',()=>{
  const f=editableRoll({orientation:'vertical'});try{
    const scroll=f.root.querySelector('.melody-scroll')!,canvas=f.root.querySelector('.melody-canvas')!,before=structuredClone(f.phrase.read().body);
    scroll.emit('wheel',{target:canvas,ctrlKey:true,shiftKey:true,deltaY:1000,clientX:0,clientY:100});
    let keys=f.root.querySelectorAll('.melody-key');assert(keys.some(key=>key.textContent==='C\n4'));
    assert(keys.filter(key=>key.textContent).every(key=>/^C\n-?\d+$/u.test(key.textContent)&&key.classList.contains('is-stacked-label')));
    assert(keys.every(key=>key.title.startsWith(key.dataset.pitchLabel!)));
    scroll.emit('wheel',{target:canvas,ctrlKey:true,shiftKey:true,deltaY:-1000,clientX:0,clientY:100});
    keys=f.root.querySelectorAll('.melody-key');assert(keys.some(key=>key.textContent==='C4'));
    assert(keys.every(key=>!key.classList.contains('is-stacked-label')));assert.deepEqual(f.phrase.read().body,before);
  }finally{f.cleanup();}
});

test('single-roll mode keeps the draggable end and blocks adding tempo sections',()=>{
  const options = { orientation: 'vertical' as const, multipleRolls: false };
  const f = editableRoll(options); try {
    const original = structuredClone(f.phrase.read().body);
    const plus = f.root.querySelector('.melody-extend')!; assert.equal(plus.hidden, true);
    plus.emit('click'); assert.deepEqual(f.phrase.read().body, original);
    const edge = f.root.querySelector('.melody-roll-end')!;
    const scroll = f.root.querySelector('.melody-scroll')!, canvas = f.root.querySelector('.melody-canvas')!;
    scroll.emit('wheel', { target: canvas, deltaY: 100000, clientX: 200, clientY: 100 });
    f.flushFrames();
    assert.equal(edge.hidden, false);
    const scale = melodyScale(f.roll.readViewport(), scroll.clientHeight - 48, melodyDuration(original!));
    edge.emit('pointerdown', { clientY: 100 });
    f.document.emit('pointermove', { clientY: 100 + 2 * scale }); f.flushFrames();
    assert.deepEqual(f.phrase.read().body, original);
    f.document.emit('pointerup');
    assert.equal(f.phrase.read().body!.lengthBeats, original!.lengthBeats + 4);
    assert.equal(f.phrase.read().body!.tempoSections, undefined);
    edge.emit('keydown', {key:'ArrowDown'});
    assert.equal(f.phrase.read().body!.lengthBeats, original!.lengthBeats + 8);
    const measures = f.root.querySelectorAll('input').find(input => input.attributes.get('aria-label') === '小节数')!;
    measures.value = '8'; measures.emit('change');
    assert.equal(f.phrase.read().body!.lengthBeats, 32);
    options.multipleRolls = true; f.roll.refresh(); assert.equal(plus.hidden, false);
    plus.emit('click'); assert.equal(f.phrase.read().body!.tempoSections!.length, 1);
  } finally { f.cleanup(); }
});

test('desktop blocks a multi-roll project until its required feature is explicitly enabled', async()=>{
  const f = editableRoll({ orientation: 'vertical' }); let studio: ReturnType<typeof mountStudio> | undefined;
  try {
    f.roll.dispose(); f.phrase.addTempoSection(); const before = structuredClone(f.phrase.read().body);
    let raw: string | null = null;
    const learning = createLearningSettings({ getItem: () => raw, setItem(_key,value) { raw = value; } });
    learning.record('basics', { status: 'learning', step: 1 });
    const sound = { stopAll() {}, stop() {}, cancelAudition() {}, subscribe() { return () => {}; }, position() { return 0; } } as unknown as SoundRuntimePort;
    studio = mountStudio(f.root as unknown as HTMLElement, { timbre: createTimbreEditor(f.library), phrase: f.phrase,
      song: f.song, sound, learning, hasPrevious: true, initialEntry: 'song' });
    assert(f.root.querySelector('.learning-feature-gate')); assert.equal(f.root.querySelector('.melody-workspace'), undefined);
    const gate = f.root.querySelector('.learning-feature-gate')!;
    const enable = gate.querySelectorAll('button').find(node => node.textContent === '启用并打开')!;
    enable.emit('click'); await settle();
    assert.equal(learning.read().multipleTempoRolls, true); assert(f.root.querySelector('.melody-workspace'));
    assert.equal(f.root.querySelector('.guidance-invitation'), undefined);
    assert.equal(f.root.querySelector('.guidance-shell'), undefined);
    assert.deepEqual(f.phrase.read().body, before, 'unlocking only changes local visibility, never music');
  } finally { studio?.dispose(); f.cleanup(); }
});

test('playback pulses notes and matching piano keys without repainting or modifying music',()=>{
  const f = editableRoll({ orientation: 'vertical' }); try {
    const original = f.read(), a = f.note(f.a), b = f.note(f.b);
    const keys = f.root.querySelectorAll('.melody-key');
    const c = keys.find(key => key.dataset.pitchLabel === 'C4')!, d = keys.find(key => key.dataset.pitchLabel === 'D4')!;
    f.roll.setPlayhead(.51, true); assert(a.classList.contains('is-sounding')); assert(b.classList.contains('is-sounding'));
    assert(c.classList.contains('is-sounding')); assert(d.classList.contains('is-sounding'));
    assert.equal(c.style['--key-flash-color'], a.style['--tone-color']);
    assert.equal(d.style['--key-flash-color'], b.style['--tone-color']);
    f.roll.setPlayhead(.7, true); assert(!a.classList.contains('is-sounding')); assert(!b.classList.contains('is-sounding'));
    assert(!c.classList.contains('is-sounding')); assert(!d.classList.contains('is-sounding'));
    f.family(f.first).emit('click'); f.roll.setPlayhead(.51, true);
    assert(a.classList.contains('is-sounding')); assert(!b.classList.contains('is-sounding'), 'the unplayed family cannot flash');
    assert(c.classList.contains('is-sounding')); assert(!d.classList.contains('is-sounding'));
    assert.equal(f.note(f.a), a, 'ordinary clock ticks reuse the same note element');
    f.roll.setPlayhead(.52, false); assert(!a.classList.contains('is-sounding')); assert(!c.classList.contains('is-sounding')); assert.equal(f.read(), original);
  } finally { f.cleanup(); }
});

test('playback frames and automatic following defer saving the workspace until paused', () => {
  const writes: number[] = [];
  const f = editableRoll({ orientation: 'vertical', workspaceState: {
    read: () => undefined, write: state => { writes.push(state.playheadSeconds); },
  } });
  try {
    f.phrase.setLength(64);
    f.roll.refresh();
    f.roll.flush();
    const pending: Array<() => void> = [];
    Object.assign(f.window, { setTimeout(callback: () => void) { pending.push(callback); return 100_000; } });
    const firstPage = f.roll.readViewport().leftSeconds;
    for (let frame = 1; frame <= 600; frame++) f.roll.setPlayhead(frame / 60, true);
    assert(f.roll.readViewport().leftSeconds > firstPage);
    assert.deepEqual(writes, [0]);
    assert.equal(pending.length, 0);

    f.roll.setPlayhead(10, false);
    assert.equal(pending.length, 1);
    pending.shift()!();
    assert.deepEqual(writes, [0, 10]);
  } finally { f.cleanup(); }
});

test('learning reports real pan, wheel axes and committed edit actions without counting unrelated clicks',()=>{
  const actions: LearningAction[] = [];
  const f = editableRoll({ orientation: 'vertical', onLearningAction: action => actions.push(action) }); try {
    const canvas = f.root.querySelector('.melody-canvas')!, scroll = f.root.querySelector('.melody-scroll')!;
    scroll.emit('pointerdown', { target: canvas, clientX: 500, clientY: 400 });
    f.document.emit('pointermove', { clientX: 450, clientY: 350 }); f.document.emit('pointerup');
    assert(actions.includes('pan'));
    for (const modifiers of [{}, {shiftKey: true}, {ctrlKey: true}, {ctrlKey: true, shiftKey: true}])
      scroll.emit('wheel', {target: canvas, deltaY: 60, clientX: 250, clientY: 250, ...modifiers});
    for (const action of ['scroll-y', 'scroll-x', 'zoom-y', 'zoom-x']) assert(actions.includes(action as LearningAction));
    f.family(f.first).emit('click'); assert.equal(actions.at(-1), 'select-group');
    scroll.emit('pointerdown', { target: canvas, button: 2 }); f.document.emit('pointerup'); assert(actions.includes('deselect'));
  } finally { f.cleanup(); }
});

test('dim notes reject selection, dragging and right-click erasure while another family is active',()=>{
  const f=editableRoll();try{
    f.family(f.first).emit('click');const dim=f.note(f.b);assert(dim.classList.contains('is-dim'));assert.equal(dim.attributes.get('aria-disabled'),'true');
    const scroll=f.root.querySelector('.melody-scroll')!;const before=structuredClone(f.phrase.read().body);
    const event=scroll.emit('pointerdown',{target:dim,clientX:50,clientY:50});assert(event.defaultPrevented);
    f.document.emit('pointermove',{clientX:200,clientY:100});f.document.emit('pointerup');
    assert.deepEqual(f.phrase.read().body,before);assert(f.family(f.first).classList.contains('is-selected'));
    scroll.emit('pointerdown',{target:dim,button:2});f.document.emit('pointerup');assert.deepEqual(f.phrase.read().body,before);
    f.family(f.second).emit('click');assert(!f.note(f.b).classList.contains('is-dim'));assert(f.note(f.a).classList.contains('is-dim'));
    f.family(f.first).emit('click');const a=f.note(f.a),b=f.note(f.b);
    const x=Number.parseFloat(String(a.style.left))+1;
    const y=(note:Element)=>Number.parseFloat(String(note.style.top))+1-scroll.scrollTop;
    scroll.emit('pointerdown',{target:a,button:2,clientX:x,clientY:y(a)});
    f.document.emit('pointermove',{clientX:x,clientY:y(b)});f.document.emit('pointerup');
    assert.equal(f.phrase.read().body!.parts.find(part=>part.id===f.first)!.notes.length,0);
    assert.equal(f.phrase.read().body!.parts.find(part=>part.id===f.second)!.notes.length,1,'an erase sweep must not touch dim notes');
  }finally{f.cleanup();}
});


test('vertical roll selects only groups and drops legacy note selection on reopen', () => {
  const records = new Map<string, string>();
  const storage = { getItem: (key: string) => records.get(key) ?? null, setItem(key: string, value: string) { records.set(key, value); } };
  const port = createMusicWorkspaceState(storage, 'vertical-selection');
  const f = editableRoll({ orientation: 'vertical', workspaceState: port });
  try {
    const scroll = () => f.root.querySelector('.melody-scroll')!;
    const canvas = () => f.root.querySelector('.melody-canvas')!;
    const press = (target: Element, button = 0) => {
      scroll().emit('pointerdown', { target, button, clientX: 500, clientY: 350 });
      f.document.emit('pointerup');
    };
    const initial = structuredClone(f.phrase.read().body);
    press(canvas());
    assert.deepEqual(f.phrase.read().body, initial);
    press(f.note(f.a));
    assert(!f.note(f.a).classList.contains('is-selected'));
    assert(!f.family(f.first).classList.contains('is-selected'));
    assert(!f.note(f.b).classList.contains('is-dim'));
    assert(!canvas().classList.contains('is-write-mode'));
    press(canvas());
    assert.deepEqual(f.phrase.read().body, initial);
    assert(!f.note(f.a).classList.contains('is-selected'));
    const viewport = f.roll.readViewport();
    scroll().emit('pointerdown', { target: canvas(), clientX: 500, clientY: 350 });
    f.document.emit('pointermove', { clientX: 480, clientY: 300 });
    f.document.emit('pointerup');
    assert(f.roll.readViewport().leftSeconds > viewport.leftSeconds);
    assert(f.roll.readViewport().top > viewport.top);
    assert.deepEqual(f.phrase.read().body, initial);
    f.roll.flush();
    port.write({ ...port.read()!, selection: { partId: f.first, noteId: f.a }, entryToneId: f.first });
    f.reopen(createMusicWorkspaceState(storage, 'vertical-selection'));
    assert(!f.note(f.a).classList.contains('is-selected'));
    assert(!f.family(f.first).classList.contains('is-selected'));
    press(f.note(f.b));
    assert(!f.note(f.b).classList.contains('is-selected'));
    assert(!f.note(f.a).classList.contains('is-selected'));
    f.family(f.first).emit('click');
    assert(canvas().classList.contains('is-write-mode'));
    press(canvas());
    press(canvas());
    assert.equal(f.phrase.read().body!.parts.find(part => part.id === f.first)!.notes.length, 3);
    assert(f.family(f.first).classList.contains('is-selected'));
    assert(f.note(f.b).classList.contains('is-dim'));
    assert(!f.root.querySelectorAll('.melody-note').some(note => note.classList.contains('is-selected')));
    press(canvas(), 2);
    assert(!f.family(f.first).classList.contains('is-selected'));
    assert(!f.note(f.b).classList.contains('is-dim'));
  } finally { f.cleanup(); }
});

test('vertical roll adjusts hovered notes with Alt-wheel and confirms group removal separately', async () => {
  const f = editableRoll({ orientation: 'vertical' });
  try {
    const scroll = f.root.querySelector('.melody-scroll')!;
    const before = structuredClone(f.phrase.read().body!);
    scroll.emit('pointerdown', { target: f.note(f.a) });
    f.document.emit('pointerup');
    await settle();
    assert.equal(f.auditions.length, 1);
    assert(!f.root.querySelector('.melody-note-family.is-selected'));
    scroll.emit('wheel', { target: f.note(f.a), deltaY: 10 });
    assert.deepEqual(f.phrase.read().body, before);
    scroll.emit('wheel', { target: f.note(f.a), deltaY: -100, altKey: true });
    assert.equal(f.phrase.read().body!.parts[0]!.notes[0]!.durationSeconds, .51);
    assert(!f.root.querySelector('.melody-note.is-selected'));
    f.family(f.first).emit('click');
    f.document.emit('keydown', { key: 'Delete' });
    f.document.emit('keydown', { key: 'Delete' });
    assert.equal(f.phrase.read().body!.parts[0]!.notes.length, 1);
    f.document.emit('keydown', { key: 'Delete', shiftKey: true });
    assert(f.root.querySelector('.melody-tone-delete-dialog'));
    f.root.querySelector('.melody-tone-delete-cancel')!.emit('click');
    assert.equal(f.phrase.read().body!.parts[0]!.notes.length, 1);
  } finally { f.cleanup(); }
});

test('short mouse presses with drift audition the note, and holding allows editing', async () => {
  for (const playing of [false, true]) {
    const f = editableRoll({ orientation: 'vertical', playing });
    try {
      const scroll = f.root.querySelector('.melody-scroll')!;
      const block = f.note(f.a), bounds = block.getBoundingClientRect();
      const start = { clientX: bounds.left + bounds.width / 2 - scroll.scrollLeft, clientY: bounds.top + 2 };
      const original = f.read(), position = block.style.top, height = block.style.height;
      for (const target of [block, block.querySelector('.melody-note-resize')!]) {
        scroll.emit('pointerdown', { target, ...start, timeStamp: 100 });
        f.document.emit('pointermove', { ...start, clientY: start.clientY + 3, timeStamp: 180 });
        await settle();
        assert.equal(f.auditions.length, 0);
        assert(!block.classList.contains('is-dragging'));
        assert.equal(block.style.top, position);
        assert.equal(block.style.height, height);
        f.document.emit('pointerup', { timeStamp: 219 });
        await settle();
        assert.deepEqual(f.auditions.map(plan => plan.note.frequencyHz), [261.6255653005986]);
        assert.equal(f.read(), original);
        f.auditions.length = 0;
      }
      scroll.emit('pointerdown', { target: block, ...start, timeStamp: 300 });
      f.document.emit('pointercancel', { timeStamp: 340 });
      scroll.emit('pointerdown', { target: block, ...start, timeStamp: 400 });
      f.roll.flush();
      scroll.emit('pointerdown', { target: block, ...start, timeStamp: 500 });
      f.document.emit('pointerup', { timeStamp: 650 });
      await settle();
      assert.equal(f.auditions.length, 0);
      assert.equal(f.read(), original);
      assert.deepEqual(f.commits, []);

      scroll.emit('pointerdown', { target: block, ...start, timeStamp: 700 });
      f.document.emit('pointermove', { ...start, clientY: start.clientY + 12, timeStamp: 810 });
      assert.equal(block.style.top, position);
      f.document.emit('pointermove', { ...start, clientY: start.clientY + 16, timeStamp: 820 });
      assert(block.classList.contains('is-dragging'));
      assert.notEqual(block.style.top, position);
      assert.equal(f.read(), original);
      f.document.emit('pointerup', { timeStamp: 850 });
      await settle();
      assert.equal(f.auditions.length, 0);
      assert.deepEqual(f.commits, [true]);
      assert.notEqual(f.read(), original);
    } finally { f.cleanup(); }
  }
});

test('vertical roll can grab any bright note or its lower edge and right-click deletes the targeted note', () => {
  for (const mode of ['none', 'group']) {
    const f = editableRoll({ orientation: 'vertical' });
    try {
      const scroll = f.root.querySelector('.melody-scroll')!;
      const canvas = f.root.querySelector('.melody-canvas')!;
      const note = () => f.phrase.read().body!.parts.find(part => part.id === f.first)!.notes.find(item => item.id === f.a)!;
      const clear = (target: Element) => {
        scroll.emit('pointerdown', { target, button: 2 });
        f.document.emit('pointerup');
      };
      const setMode = () => {
        if (mode === 'group') f.family(f.first).emit('click');
        else clear(canvas);
      };
      setMode();
      if (mode === 'group') {
        const before = structuredClone(f.phrase.read().body);
        for (const target of [f.note(f.b), f.note(f.b).querySelector('.melody-note-resize')!]) {
          scroll.emit('pointerdown', { target, clientX: 400, clientY: 200 });
          f.document.emit('pointermove', { clientX: 440, clientY: 260 });
          f.document.emit('pointerup');
        }
        assert.deepEqual(f.phrase.read().body, before);
        assert(f.family(f.first).classList.contains('is-selected'));
      }
      const original = { ...note() };
      const bounds = f.note(f.a).getBoundingClientRect();
      const x = bounds.left + bounds.width / 2, y = bounds.top + bounds.height / 2;
      scroll.emit('pointerdown', { target: f.note(f.a), clientX: x, clientY: y, timeStamp: 0 });
      f.document.emit('pointermove', { clientX: x + 36, clientY: y + 60, timeStamp: 140 });
      f.document.emit('pointerup', { timeStamp: 160 });
      assert(note().startBeat > original.startBeat);
      assert(note().frequencyHz > original.frequencyHz);
      assert.equal(note().durationBeats, original.durationBeats);
      assert(!f.note(f.a).classList.contains('is-selected'));
      assert.equal(f.note(f.b).classList.contains('is-dim'), mode === 'group');
      setMode();
      const moved = { ...note() };
      const edge = f.note(f.a).getBoundingClientRect();
      scroll.emit('pointerdown', { target: f.note(f.a).querySelector('.melody-note-resize'), clientX: edge.left + 4, clientY: edge.bottom - 1, timeStamp: 200 });
      f.document.emit('pointermove', { clientX: edge.left + 4, clientY: edge.bottom + 49, timeStamp: 340 });
      f.document.emit('pointerup', { timeStamp: 360 });
      assert(note().durationBeats > moved.durationBeats);
      assert.equal(note().startBeat, moved.startBeat);
      assert.equal(note().frequencyHz, moved.frequencyHz);
      setMode();
      const beforeDelete = structuredClone(f.phrase.read().body);
      clear(f.note(f.a));
      assert.equal(note(), undefined);
      f.phrase.undo();
      assert.deepEqual(f.phrase.read().body, beforeDelete);
    } finally { f.cleanup(); }
  }
});

test('holding right click erases across groups along the swept path in one undo step', () => {
  const f = editableRoll({ orientation: 'vertical', playing: true });
  try {
    const scroll = f.root.querySelector('.melody-scroll')!, canvas = f.root.querySelector('.melody-canvas')!;
    f.family(f.first).emit('click');
    const centre = (id: string) => {
      const bounds = f.note(id).getBoundingClientRect();
      return { clientX: bounds.left + bounds.width / 2 - scroll.scrollLeft, clientY: bounds.top + bounds.height / 2 };
    };
    const a = centre(f.a), b = centre(f.b);
    const original = structuredClone(f.phrase.read().body);
    scroll.emit('pointerdown', { target: canvas, button: 2, clientX: a.clientX, clientY: a.clientY - 4 });
    f.document.emit('pointermove', { ...b, getCoalescedEvents: () => [a, b] });
    f.flushFrames();
    assert.deepEqual(f.phrase.read().body, original);
    assert.equal(f.root.querySelectorAll('.melody-note').length, 0);
    f.document.emit('pointercancel');
    assert.equal(f.root.querySelectorAll('.melody-note').length, 2);
    scroll.emit('pointerdown', { target: f.note(f.b), button: 2, ...b });
    f.document.emit('pointermove', a);
    f.document.emit('pointermove', b);
    f.document.emit('pointerup', { button: 2, ...b });
    assert(f.phrase.read().body!.parts.every(part => part.notes.length === 0));
    assert.deepEqual(f.commits, [true]);
    f.phrase.undo();
    assert.deepEqual(f.phrase.read().body, original);
  } finally { f.cleanup(); }
});

test('fast raw pointer turns catch thin note edges even when the regular move only reports the return point', () => {
  const f = editableRoll({ orientation: 'vertical' });
  try {
    const scroll = f.root.querySelector('.melody-scroll')!, canvas = f.root.querySelector('.melody-canvas')!;
    const bounds = f.note(f.a).getBoundingClientRect(), x = bounds.left - scroll.scrollLeft;
    const from = { clientX: x - 8, clientY: bounds.top - 12 };
    const corner = { clientX: from.clientX, clientY: bounds.top - 1 };
    const across = { clientX: x + bounds.width + 4, clientY: corner.clientY };
    scroll.emit('pointerdown', { target: canvas, button: 2, ...from });
    f.document.emit('pointerrawupdate', { ...across, getCoalescedEvents: () => [corner, across] });
    f.document.emit('pointerrawupdate', from);
    f.document.emit('pointermove', { ...from, buttons: 2 });
    f.flushFrames();
    assert.equal(f.root.querySelectorAll('.melody-note').length, 1);
    f.document.emit('pointerup', { ...from, button: 2 });
    const remaining = f.phrase.read().body!.parts.flatMap(part => part.notes.map(note => note.id));
    assert.deepEqual(remaining, [f.b]);
  } finally { f.cleanup(); }
});

test('a sparse fast sweep combines raw and newer move samples without erasing the neighbouring pitch', () => {
  const f = editableRoll({ orientation: 'vertical' });
  try {
    f.phrase.updateNote(f.first, f.a, { durationSeconds: .001 });
    f.roll.refresh();
    const scroll = f.root.querySelector('.melody-scroll')!, canvas = f.root.querySelector('.melody-canvas')!;
    const bounds = f.note(f.a).getBoundingClientRect();
    const x = bounds.left - scroll.scrollLeft - 5;
    const start = { clientX: x, clientY: bounds.top - 60, timeStamp: 10 };
    const after = { clientX: x, clientY: bounds.top + 30, timeStamp: 30 };
    const stale = { clientX: f.note(f.b).getBoundingClientRect().left - scroll.scrollLeft + 10, clientY: bounds.top + 15, timeStamp: 11 };
    scroll.emit('pointerdown', { target: canvas, button: 2, ...start });
    f.document.emit('pointerrawupdate', { ...start, clientY: start.clientY + 4, timeStamp: 20 });
    f.document.emit('pointermove', { ...after, buttons: 2, getCoalescedEvents: () => [stale, after] });
    f.flushFrames();
    assert.deepEqual(f.root.querySelectorAll('.melody-note').map(note => note.dataset.noteId), [f.b]);
    f.document.emit('pointermove', { ...start, timeStamp: 40, buttons: 2 });
    f.document.emit('pointerup', { ...start, timeStamp: 41, button: 2 });
    const remaining = f.phrase.read().body!.parts.flatMap(part => part.notes.map(note => note.id));
    assert.deepEqual(remaining, [f.b]);
    assert.deepEqual(f.commits, [true]);
  } finally { f.cleanup(); }
});

test('dense group merging reads only history status and keeps the canvas windowed', () => {
  const f = editableRoll({ orientation: 'vertical' });
  try {
    const body = f.phrase.read().body!;
    body.lengthBeats = 1024;
    const source = body.parts.find(part => part.id === f.first)!, targetPart = body.parts.find(part => part.id === f.second)!;
    targetPart.timbreId = source.timbreId;
    for (const [index, part] of [source, targetPart].entries()) part.notes = Array.from({ length: 6000 }, (_, note) => ({
      id: `dense-${index}-${note}`, startBeat: note / 8, durationBeats: .25, frequencyHz: 440, velocity: .7,
    }));
    f.library.updateDraft(f.phrase.read().draft!.id, { body: JSON.parse(JSON.stringify(body)), dependencies: [...new Set(body.parts.map(part => part.timbreId))] });
    f.roll.refresh();
    let reads = 0, fullHistoryReads = 0;
    const read = f.phrase.read.bind(f.phrase), history = f.library.readDraftHistory.bind(f.library);
    f.phrase.read = () => { reads++; return read(); };
    f.library.readDraftHistory = id => { fullHistoryReads++; return history(id); };
    const payload = new Map<string, string>();
    const dataTransfer = { effectAllowed: '', dropEffect: '', setData(type: string, value: string) { payload.set(type, value); }, getData(type: string) { return payload.get(type) ?? ''; } };
    f.family(f.first).emit('dragstart', { dataTransfer });
    const target = f.family(f.second).parentElement!;
    for (let index = 0; index < 20; index++) target.emit('dragover', { dataTransfer });
    assert.equal(reads, 0);
    target.emit('drop', { dataTransfer });
    assert.equal(reads, 1); assert.equal(fullHistoryReads, 0);
    assert(f.root.querySelectorAll('.melody-note').length < 400);
    const merged = f.phrase.read().body!;
    assert(!merged.parts.some(part => part.id === f.first));
    assert.equal(merged.parts.find(part => part.id === f.second)!.notes.length, 12000);
    assert.equal(JSON.parse(f.read()).editHistory.entries.at(-1).past.length, 1);
    f.phrase.undo(); assert.deepEqual(f.phrase.read().body, body);
  } finally { f.cleanup(); }
});


test('optional workbench selects individual notes and persists group mix independently', () => {
  const settings = { orientation: 'vertical' as const, workbench: false };
  const f = editableRoll(settings);
  try {
    f.family(f.first).emit('click');
    assert.equal(f.root.querySelector('.melody-console')!.hidden, true);
    settings.workbench = true; f.roll.refresh();
    assert.equal(f.root.querySelector('.melody-console')!.hidden, false);
    const groupLevel = f.root.querySelector('.melody-console')!.querySelectorAll('input').find(item => item.attributes.get('aria-label') === '音量')!;
    groupLevel.value = '.4'; groupLevel.emit('input'); groupLevel.emit('change');
    assert.equal(f.phrase.read().body!.parts.find(part => part.id === f.first)!.level, .4);
    assert.equal(f.phrase.read().body!.parts.find(part => part.id === f.first)!.notes[0]!.level, undefined);
    const block = f.note(f.a), bounds = block.getBoundingClientRect();
    f.root.querySelector('.melody-scroll')!.emit('pointerdown', { target: block, clientX: bounds.left + 2, clientY: bounds.top + 2 });
    f.document.emit('pointerup');
    assert(f.note(f.a).classList.contains('is-selected'));
    assert.equal(f.root.querySelector('.melody-console-name')!.textContent, '音符控制台');
    const level = f.root.querySelector('.melody-console')!.querySelectorAll('input').find(item => item.attributes.get('aria-label') === '音量')!;
    level.value = '.5'; level.emit('input'); level.emit('change');
    assert.equal(f.phrase.read().body!.parts.find(part => part.id === f.first)!.notes[0]!.level, .5);
    f.phrase.undo(); f.roll.refresh();
    assert.equal(f.phrase.read().body!.parts.find(part => part.id === f.first)!.notes[0]!.level, undefined);
    settings.workbench = false; f.roll.refresh();
    assert.equal(f.root.querySelector('.melody-console')!.hidden, true);
    assert(!f.note(f.a).classList.contains('is-selected'));
  } finally { f.cleanup(); }
});
