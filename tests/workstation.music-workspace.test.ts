import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import { test } from 'node:test';
import type { SoundRuntimePort, SoundSequencePlan } from '../src/workstation/contracts/sound.ts';
import type { ProjectDirectoriesPort } from '../src/workstation/contracts/project-directory.ts';
import type { MusicWorkspaceStatePort } from '../src/workstation/contracts/workspace.ts';
import { createMusicWorkspaceState } from '../src/workstation/app/platform/music-workspace-state.ts';
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

test('unified music opens directly in the piano roll, plays and saves the complete document with Ctrl+S', async () => {
  const dom = installDom(); let working = createInitialProjectLibrary('直达创作'); let disk = working; let saves = 0;
  const library = createMaterialLibrary({ read: () => working, write: text => { working = text; } },
    { project: { rootKind: 'rootsound.song', adapters: [createTimbreReferenceAdapter(), createPhraseReferenceAdapter(), createSongReferenceAdapter()] } });
  const tones = createTimbrePlayback(library,undefined,undefined,musicClockVoice), phrase = createPhraseEditor(library, tones);
  const song = createSongEditor(library, createPhrasePlayback(library, tones), { defaultTempoMode: 'source' });
  openMusicDocument(library, song, phrase);
  const part = phrase.addPart(library.listContentInfo().find(item => item.kind === 'rootsound.timbre')!.id);
  phrase.addNote(part, { startBeat: 0, durationBeats: 1, frequencyHz: 440, velocity: .5 });
  const plans: SoundSequencePlan[] = [];
  const sound = { stopAll() {}, stop() {}, cancelAudition() {}, subscribe() { return () => {}; }, position() { return 0; },
    async preview(plan: SoundSequencePlan) { plans.push(plan); return { id: 'play', status: 'playing', durationSeconds: plan.durationSeconds }; }, async audition() {} } as unknown as SoundRuntimePort;
  const directories = { read: async () => ({ defaultLocation: 'D:/RootSound/project', hasUnsavedChanges: working !== disk }),
    async save() { disk = working; saves++; return { id: 'file', name: song.read().draft!.name, path: 'D:/RootSound/project/test.rootsound' }; } } as unknown as ProjectDirectoriesPort;
  const root = new Element('main');
  const setup = createProjectSetup(directories, () => {}, { read: () => working, songDraftId: () => song.read().draft!.id,
    name: () => song.read().draft!.name, prepareSave() { commitMusicDocument(library, song, phrase); } });
  const studio = mountStudio(root as unknown as HTMLElement, { timbre: createTimbreEditor(library), sound, hasPrevious: true,
    phrase, song, projectSetup: setup, initialEntry: 'song' });
  try {
    await settle();
    assert(root.querySelector('.melody-workspace'));
    assert.equal(root.querySelector('.melody-note')!.style.width,'30px','direct project entry uses equally wide pitch columns');
    assert(root.querySelector('.melody-workspace')!.classList.contains('is-vertical'));
    assert.equal(root.querySelector('.melody-console'),undefined,'active workspace has no bottom console');
    const openingLines=root.querySelectorAll('.melody-grid-line');
    assert(Math.abs(Number.parseFloat(String(openingLines[1]!.style.top))-Number.parseFloat(String(openingLines[0]!.style.top))-128)<1e-8);
    assert(openingLines.every(line=>line.classList.contains('is-beat')),'initial view shows only beat/bar lines');
    assert.equal(root.querySelector('.phrase-composition-main')!.hidden, true);
    assert.equal(root.querySelector('.phrase-melody-back'), undefined);
    assert.equal(root.querySelector('.song-project-kind'), undefined);
    assert.equal(root.querySelector('.song-playlist'), undefined);
    assert.equal(root.querySelector('.song-new-phrase'), undefined);
    assert.equal(root.querySelector('.song-phrase-library'), undefined);
    assert.equal(root.querySelector('.song-project-name')!.textContent, '直达创作');
    root.querySelector('.melody-add-tone')!.emit('click');
    assert.equal(root.querySelectorAll('.melody-library-tone').length, 53);
    const category = (name: string) => root.querySelectorAll('.melody-library-category').find(item => item.textContent === name)!;
    category('键盘').emit('click'); assert.equal(root.querySelectorAll('.melody-library-tone').length, 7);
    category('打击').emit('click'); assert.equal(root.querySelectorAll('.melody-library-tone').length, 14);
    category('全部').emit('click'); const search = root.querySelector('.melody-library-search')!;
    search.value = 'flute'; search.emit('input');
    assert.equal(root.querySelectorAll('.melody-library-tone').length, 1);
    assert.equal(root.querySelector('.melody-library-tone')!.textContent, '长笛');
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
      assert.equal(phrase.read().body!.tempoBpm,150);assert.equal(phrase.read().body!.parts[0]!.notes[0]!.durationSeconds,.5);
      assert.equal(saves,1,'applying tempo is a working edit, not a disk save');
    }finally{if(originalPerformance)Object.defineProperty(globalThis,'performance',originalPerformance);}
  } finally { studio.dispose(); dom.restore(); }
});

test('family selection scopes transport without changing music; clearing, selecting a note and deleting the family restore all parts', async () => {
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
    await settle(); assert.deepEqual(pitches(), [440, 660], 'selecting an individual note does not solo its family');
    assert.equal(text, before, 'listening scope must not edit or save music');
    choose(first); phrase.removePart(first); shell.refresh(); await settle();
    assert.deepEqual(pitches(), [660], 'removed family must not leave a stale listening scope');
  } finally { shell.dispose(); dom.restore(); }
});

test('tap dialog supports mouse and keyboard, reset, cancel and listener cleanup',()=>{
  const dom=installDom(),root=new Element('main'),applied:number[]=[];let now=0;
  let dialog=showTapTempo(root as unknown as HTMLElement,{now:()=>now,onApply:value=>applied.push(value)});
  try{
    for(const at of [0,500,1000,1500]){now=at;dom.document.emit('keydown',{key:' ',code:'Space'});}
    assert.equal(root.querySelector('.tap-tempo-value')!.textContent,'120');assert.equal(applied.length,0);
    now=1700;dom.document.emit('keydown',{key:' ',code:'Space',repeat:true});assert.equal(root.querySelector('.tap-tempo-value')!.textContent,'120');
    root.querySelector('.tap-tempo-reset')!.emit('click');assert.equal(root.querySelector('.tap-tempo-apply')!.disabled,true);
    for(const at of [2000,2400,2800,3200]){now=at;root.querySelector('.tap-tempo-pad')!.emit('click');}
    root.querySelector('.tap-tempo-cancel')!.emit('click');assert.equal(applied.length,0);assert.equal(root.querySelector('.tap-tempo-dialog'),undefined);
    assert.equal(dom.document.emit('keydown',{key:' ',code:'Space'}).defaultPrevented,false,'dialog shortcuts must be released on close');
    dialog=showTapTempo(root as unknown as HTMLElement,{now:()=>now,onApply:value=>applied.push(value)});
    for(const at of [0,200,400,600]){now=at;dom.document.emit('keydown',{key:' ',code:'Space'});}
    assert.equal(root.querySelector('.tap-tempo-value')!.textContent,'300');assert(root.querySelector('.tap-tempo-apply')!.disabled);
    dom.document.emit('keydown',{key:'Escape'});assert.equal(applied.length,0);assert.equal(root.querySelector('.tap-tempo-dialog'),undefined);
  }finally{dialog.dispose();dom.restore();}
});

function editableRoll(options: { workspaceState?: MusicWorkspaceStatePort; performance?: boolean; orientation?: 'vertical' } = {}) {
  const dom=installDom();let text=createInitialProjectLibrary('交互测试');
  const library=createMaterialLibrary({read:()=>text,write:value=>{text=value;}});
  const tones=createTimbrePlayback(library,undefined,undefined,musicClockVoice),phrase=createPhraseEditor(library,tones);
  const song=createSongEditor(library,createPhrasePlayback(library,tones),{defaultTempoMode:'source'});openMusicDocument(library,song,phrase);
  const sounds=library.listContentInfo().filter(item=>item.kind==='rootsound.timbre');
  const first=phrase.addPart(sounds[0]!.id),second=phrase.addPart(sounds[1]!.id),empty=phrase.addPart(sounds[2]!.id);
  const a=phrase.addNote(first,{startBeat:1,durationBeats:1,frequencyHz:261.6255653005986,velocity:.7});
  const b=phrase.addNote(second,{startBeat:1,durationBeats:1,frequencyHz:293.6647679174076,velocity:.7});
  const root=new Element('main');const sound={cancelAudition(){},async audition(){}} as unknown as SoundRuntimePort;
  const mount=()=>mountMelodyWorkspace(root as unknown as HTMLElement,{phrase,sound,gridBpm:()=>120,workspaceState:options.workspaceState,orientation:options.orientation,readPerformanceMode:()=>!!options.performance,
    listTimbres:()=>sounds,onAddTimbre:id=>phrase.addPart(id),onChange(){},onPreview(){},onSeek(){}});
  let roll=mount();
  const family=(id:string)=>root.querySelectorAll('.melody-tone').find(item=>item.dataset.partId===id)!;
  const remove=(id:string)=>family(id).parentElement!.querySelector('.melody-family-remove')!;
  const note=(id:string)=>root.querySelectorAll('.melody-note').find(item=>item.dataset.noteId===id)!;
  return {...dom,root,get roll(){return roll;},phrase,first,second,empty,a,b,family,remove,note,read:()=>text,reopen(workspaceState=options.workspaceState){roll.dispose();options.workspaceState=workspaceState;roll=mount();},
    cleanup(){roll.dispose();dom.restore();}};
}

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
    const gap=()=>{const lines=f.root.querySelectorAll('.melody-grid-line');return Number.parseFloat(String(lines[1]!.style.left))-Number.parseFloat(String(lines[0]!.style.left));};
    const original=structuredClone(body.parts);assert(Math.abs(gap()/4-32)<1e-8);
    for(const n of [9,2,4]){f.phrase.setStepsPerBeat(n);f.roll.refresh();assert(Math.abs(gap()/n-32)<1e-8);assert.deepEqual(f.phrase.read().body!.parts,original);}
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

test('zoom reveals finer drawing cells and black and white pitch rows have equal size',()=>{
  const f=editableRoll();try{
    const scroll=f.root.querySelector('.melody-scroll')!,canvas=f.root.querySelector('.melody-canvas')!;
    const lines=()=>f.root.querySelectorAll('.melody-grid-line');
    assert(lines().every(line=>line.classList.contains('is-beat')));
    const zoom=()=>scroll.emit('wheel',{target:canvas,ctrlKey:true,shiftKey:true,deltaY:-Math.log(2)/.002,clientX:0,clientY:100});
    zoom();assert(lines().some(line=>!line.classList.contains('is-beat')));
    zoom();const keys=f.root.querySelectorAll('.melody-key'),black=keys.find(key=>key.textContent==='C♯4'||key.textContent==='C#4')!;
    assert(black,'keyboard contains C sharp');const rowHeight=f.roll.readViewport().rowHeight;
    assert.equal(Number.parseFloat(String(black.style.height)),rowHeight);
    f.family(f.first).emit('click');
    const start=Number.parseFloat(String(lines()[1]!.style.left))+1;
    const at={clientX:start,clientY:Number.parseFloat(String(black.style.top))+rowHeight*.4-scroll.scrollTop};
    const before=f.phrase.read().body!.parts.find(part=>part.id===f.first)!.notes.length;
    scroll.emit('pointerdown',{target:canvas,...at});f.document.emit('pointerup',at);
    const notes=f.phrase.read().body!.parts.find(part=>part.id===f.first)!.notes;assert.equal(notes.length,before+1);
    const added=notes.at(-1)!;assert(Math.abs(added.frequencyHz-Number(black.dataset.frequencyHz))<1e-8);
    assert(Math.abs(added.durationSeconds!-.0625)<1e-8,'finer visible divisions enable notes shorter than a configured quarter-beat cell');
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
    await settle();assert(f.note(f.a).classList.contains('is-selected'));
    assert.equal(f.root.querySelector('.song-clock')!.textContent,'00:02.500');
    await composition.flush();assert.deepEqual(port.read()!.viewport,expected);assert.equal(port.read()!.playheadSeconds,2.5);
  }finally{composition.dispose();f.cleanup();}
});

test('vertical roll transposes time, pitches, gestures, resize and physical wheel axes without a console',()=>{
  const records=new Map<string,string>(),storage={getItem:(key:string)=>records.get(key)??null,setItem(key:string,value:string){records.set(key,value);}};
  const state=createMusicWorkspaceState(storage,'vertical-test'),f=editableRoll({orientation:'vertical',workspaceState:state});try{
    const scroll=f.root.querySelector('.melody-scroll')!,canvas=f.root.querySelector('.melody-canvas')!,ruler=f.root.querySelector('.melody-ruler')!;
    assert.equal(f.root.querySelector('.melody-console'),undefined);
    const keys=f.root.querySelectorAll('.melody-key');
    assert(Number(keys[0]!.dataset.frequencyHz)<Number(keys.at(-1)!.dataset.frequencyHz));
    assert(keys.every(key=>key.style.width==='32px'),'white and black keys have equal pitch width');
    assert(keys.filter(key=>key.textContent).every(key=>/^C\d+$/u.test(key.textContent)),'only C octave names are printed');
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
    scroll.emit('pointerdown',{target:block.querySelector('.melody-note-resize'),...resize});
    f.document.emit('pointermove',{...resize,clientY:resize.clientY+64});f.document.emit('pointerup');
    notes=f.phrase.read().body!.parts.find(part=>part.id===f.first)!.notes;assert(notes.at(-1)!.durationSeconds!>added.durationSeconds!);
    const changed=f.note(added.id),point={clientX:Number.parseFloat(String(changed.style.left))+10-scroll.scrollLeft,clientY:Number.parseFloat(String(changed.style.top))+2};
    scroll.emit('pointerdown',{target:changed,...point});f.document.emit('pointermove',{clientX:point.clientX+view.rowHeight,clientY:point.clientY+32});f.document.emit('pointerup');
    const moved=f.phrase.read().body!.parts.find(part=>part.id===f.first)!.notes.at(-1)!;
    assert(moved.frequencyHz>added.frequencyHz);assert(moved.startBeat>added.startBeat);
    ruler.emit('pointerdown',{button:0,clientX:0,clientY:120});f.document.emit('pointerup');
    assert(!f.root.querySelector('.melody-head-handle')!.hidden);
    const remembered=f.roll.readViewport();f.roll.flush();assert.equal(state.read()!.orientation,'vertical');
    f.reopen(createMusicWorkspaceState(storage,'vertical-test'));assert.deepEqual(f.roll.readViewport(),remembered);assert(f.note(moved.id).classList.contains('is-selected'));
    f.family(f.first).emit('dblclick');assert(f.root.querySelector('.melody-tone-library'),'family sound replacement remains accessible without a console');
  }finally{f.cleanup();}
});

test('vertical scroll renders notes in its visible time window without altering offscreen music',()=>{
  const f=editableRoll({orientation:'vertical'});try{
    const far=f.phrase.addNote(f.first,{startBeat:15,durationBeats:.5,durationSeconds:.25,frequencyHz:261.6255653005986,velocity:.7});f.roll.refresh();
    assert.equal(f.root.querySelectorAll('.melody-note').find(note=>note.dataset.noteId===far),undefined);
    const before=structuredClone(f.phrase.read().body),scroll=f.root.querySelector('.melody-scroll')!,canvas=f.root.querySelector('.melody-canvas')!;
    scroll.emit('wheel',{target:canvas,deltaY:3000,clientX:200,clientY:100});
    assert(f.note(far));assert.deepEqual(f.phrase.read().body,before);
  }finally{f.cleanup();}
});

test('narrow pitch columns stack C octave labels and keep every full pitch available on hover',()=>{
  const f=editableRoll({orientation:'vertical'});try{
    const scroll=f.root.querySelector('.melody-scroll')!,canvas=f.root.querySelector('.melody-canvas')!,before=structuredClone(f.phrase.read().body);
    scroll.emit('wheel',{target:canvas,ctrlKey:true,shiftKey:true,deltaY:1000,clientX:0,clientY:100});
    let keys=f.root.querySelectorAll('.melody-key');assert(keys.some(key=>key.textContent==='C\n4'));
    assert(keys.filter(key=>key.textContent).every(key=>/^C\n\d+$/u.test(key.textContent)&&key.classList.contains('is-stacked-label')));
    assert(keys.every(key=>key.title.startsWith(key.dataset.pitchLabel!)));
    scroll.emit('wheel',{target:canvas,ctrlKey:true,shiftKey:true,deltaY:-1000,clientX:0,clientY:100});
    keys=f.root.querySelectorAll('.melody-key');assert(keys.some(key=>key.textContent==='C4'));
    assert(keys.every(key=>!key.classList.contains('is-stacked-label')));assert.deepEqual(f.phrase.read().body,before);
  }finally{f.cleanup();}
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
