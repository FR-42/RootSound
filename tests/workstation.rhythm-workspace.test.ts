import assert from 'node:assert/strict';
import test from 'node:test';
import { registerHooks } from 'node:module';
import type { PhraseBody } from '../src/workstation/contracts/phrase.ts';
import type { PlayableNotePlan, SoundRuntimePort } from '../src/workstation/contracts/sound.ts';
import { createMaterialLibrary } from '../src/workstation/modules/materials/public.ts';
import { createPhraseEditor } from '../src/workstation/modules/phrase/public.ts';
import { createTimbreEditor, createTimbrePlayback } from '../src/workstation/modules/timbre/public.ts';
const hook = registerHooks({ load(url, context, next) { return url.endsWith('.css') ? { format: 'module', source: '', shortCircuit: true } : next(url, context); } });
const { mountMelodyWorkspace } = await import('../src/workstation/modules/ui-rendering/melody-workspace.ts');
const { mountRhythmWorkspace } = await import('../src/workstation/modules/ui-rendering/rhythm-workspace.ts'); hook.deregister();

type Event = Record<string, unknown> & { type: string; target: Element; preventDefault(): void; stopPropagation(): void };
class Element {
  tagName: string; className = ''; private text = ''; children: Element[] = []; parentElement?: Element;
  style: Record<string, string> & { setProperty(key: string, value: string): void } = Object.assign(Object.create(null), { setProperty: (key: string, value: string) => { this.style[key] = value; } });
  dataset: Record<string, string> = {}; attributes = new Map<string, string>(); value = ''; hidden = false; disabled = false; tabIndex = 0; scrollTop = 0;
  clientWidth = 800; clientHeight = 400; private captures = new Set<number>(); private listeners = new Map<string, Array<(event: Event) => void>>();
  constructor(tag = 'div') { this.tagName = tag.toUpperCase(); }
  set textContent(value: string) { this.text = value; this.children.forEach(child => { child.parentElement = undefined; }); this.children = []; }
  get textContent() { return this.text; }
  classList = {
    contains: (name: string) => this.className.split(' ').includes(name),
    add: (...names: string[]) => { this.className = [...new Set([...this.className.split(' ').filter(Boolean), ...names])].join(' '); },
    remove: (...names: string[]) => { this.className = this.className.split(' ').filter(name => !names.includes(name)).join(' '); },
    toggle: (name: string, value?: boolean) => { const on = value ?? !this.classList.contains(name); if (on) this.classList.add(name); else this.classList.remove(name); return on; },
  };
  append(...nodes: Element[]) { nodes.forEach(child => { child.remove(); child.parentElement = this; this.children.push(child); }); }
  replaceChildren(...nodes: Element[]) { this.textContent = ''; this.append(...nodes); }
  remove() { if (this.parentElement) this.parentElement.children = this.parentElement.children.filter(child => child !== this); this.parentElement = undefined; }
  setAttribute(name: string, value: string) { this.attributes.set(name, value); }
  matches(selector: string): boolean { if (selector[0] === '.') return this.classList.contains(selector.slice(1)); const match = /^([a-z]+)(?:\[([^\]]+)\])?$/u.exec(selector); return !!match && this.tagName.toLowerCase() === match[1] && (!match[2] || this.attributes.has(match[2])); }
  closest<T = Element>(selector: string): T | undefined { let item: Element | undefined = this; while (item) { if (item.matches(selector)) return item as T; item = item.parentElement; } }
  querySelectorAll(selector: string): Element[] { return this.children.flatMap(child => [...(child.matches(selector) ? [child] : []), ...child.querySelectorAll(selector)]); }
  querySelector(selector: string) { return this.querySelectorAll(selector)[0]; }
  addEventListener(type: string, callback: (event: Event) => void) { this.listeners.set(type, [...this.listeners.get(type) ?? [], callback]); }
  removeEventListener(type: string, callback: (event: Event) => void) { this.listeners.set(type, (this.listeners.get(type) ?? []).filter(value => value !== callback)); }
  emit(type: string, values: Record<string, unknown> = {}) { const event = { type, target: this, pointerId: 1, clientX: 0, clientY: 0, button: 0, altKey: false, shiftKey: false, ctrlKey: false, metaKey: false, key: '', repeat: false, deltaX: 0, deltaY: 0, preventDefault() {}, stopPropagation() {}, ...values } as Event; for (const listener of this.listeners.get(type) ?? []) listener(event); return event; }
  setPointerCapture(id: number) { this.captures.add(id); } hasPointerCapture(id: number) { return this.captures.has(id); } releasePointerCapture(id: number) { this.captures.delete(id); }
  focus() { (globalThis.document as unknown as Document).activeElement = this; }
  showModal() { this.attributes.set('open', ''); } close() { this.attributes.delete('open'); this.emit('close'); }
  getBoundingClientRect() {
    let left = 212; let top = 100; let width = this.clientWidth; let height = this.clientHeight;
    if (this.classList.contains('melody-note')) {
      const scroll = this.closest('.melody-workspace')?.querySelector('.melody-scroll');
      left += Number.parseFloat(this.style.left ?? '0'); top += Number.parseFloat(this.style.top ?? '0') - (scroll?.scrollTop ?? 0); width = Number.parseFloat(this.style.width ?? '0'); height = Number.parseFloat(this.style.height ?? '0');
    }
    return { left, right: left + width, top, bottom: top + height, width, height };
  }
}
class Input extends Element {} class Select extends Element {} class TextArea extends Element {}
class Document extends Element { activeElement?: Element; createElement(tag: string) { return tag === 'input' ? new Input(tag) : tag === 'select' ? new Select(tag) : new Element(tag); } createElementNS(_namespace: string, tag: string) { return new Element(tag); } }
function dom() {
  const document = new Document(); const window = new Element(); const timers: ReturnType<typeof setTimeout>[] = [];
  Object.assign(window, { setTimeout(callback: () => void, delay: number) { const timer = setTimeout(callback, delay); timer.unref(); timers.push(timer); return Number(timer); }, clearTimeout });
  const values = { document, window, HTMLElement: Element, HTMLInputElement: Input, HTMLSelectElement: Select, HTMLTextAreaElement: TextArea };
  const previous = new Map<string, PropertyDescriptor | undefined>(); for (const [key, value] of Object.entries(values)) { previous.set(key, Object.getOwnPropertyDescriptor(globalThis, key)); Object.defineProperty(globalThis, key, { value, writable: true, configurable: true }); }
  return { document, restore() { timers.forEach(clearTimeout); for (const [key, descriptor] of previous) if (descriptor) Object.defineProperty(globalThis, key, descriptor); else Reflect.deleteProperty(globalThis, key); } };
}
async function settle() { for (let index = 0; index < 10; index++) await Promise.resolve(); }

function fixture(config: { notes?: boolean; extraVoices?: number } = {}) {
  const environment=dom(); const library=createMaterialLibrary(); const timbre=createTimbreEditor(library);
  const voices: Array<{id:string;name:string}>=[];
  for(let index=0;index<(config.extraVoices??2);index++){if(index)timbre.create();timbre.rename('节奏音色 '+(index+1));const result=timbre.save('new');if(result.status!=='saved')throw new Error('voice');voices.push(result.content);}
  const phrase=createPhraseEditor(library,createTimbrePlayback(library));phrase.create(voices[0]!.id);phrase.setLength(16);
  const melodyPart=phrase.read().body!.parts[0]!.id;
  const melodyNote=phrase.addNote(melodyPart,{startBeat:2,durationBeats:1,durationSeconds:.5,frequencyHz:440,velocity:.75});
  const parts=voices.map(voice=>phrase.addPart(voice.id,'rhythm'));
  const ids:string[]=[];
  if(config.notes)for(let index=0;index<Math.min(2,parts.length);index++)ids.push(phrase.addNote(parts[index]!,{startBeat:2+index*2,durationBeats:1,durationSeconds:.5,frequencyHz:index?220:330,velocity:.7,level:.6,pan:.2}));
  const root=new Element('main');const previews:Array<PhraseBody|undefined>=[];let changes=0;const auditions:PlayableNotePlan[]=[];
  const sound={async audition(plan:PlayableNotePlan){auditions.push(plan);},cancelAudition(){}} as unknown as SoundRuntimePort;
  const workspace=mountRhythmWorkspace(root as unknown as HTMLElement,{phrase,sound,gridBpm:()=>phrase.read().body!.tempoBpm,onPreview(value){previews.push(value);},onChange(){changes++;},onSeek(){},listTimbres:()=>voices,onAddTimbre(id){return phrase.read().body!.parts.find(part=>part.timbreId===id&&part.section==='rhythm')?.id??phrase.addPart(id,'rhythm');}});
  const scroll=root.querySelector('.melody-scroll')!,canvas=root.querySelector('.melody-canvas')!;
  const pointAt=(beat:number,row:number)=>({clientX:212+beat*50,clientY:100+row*72+36-scroll.scrollTop});
  const block=(id:string)=>root.querySelectorAll('.melody-note').find(value=>value.dataset.noteId===id)!;
  return{...environment,library,phrase,root,workspace,scroll,canvas,voices,parts,ids,melodyPart,melodyNote,previews,auditions,pointAt,block,changes:()=>changes,cleanup(){workspace.dispose();environment.restore();}};
}

test('rhythm has broad one-to-one tone rows and no pitch keyboard or pitch console',()=>{
 const f=fixture({notes:true});try{
  assert(f.root.querySelector('.rhythm-workspace'));assert.equal(f.root.querySelectorAll('.melody-key').length,0);
  assert.equal(f.root.querySelectorAll('.rhythm-tone-row').length,2);assert.equal(f.root.querySelectorAll('.melody-tone').length,2);
  assert.equal(f.root.querySelectorAll('.melody-grid-line').length,65);assert.equal(f.block(f.melodyNote),undefined);
  f.root.querySelectorAll('.melody-tone').forEach((card,index)=>{const row=f.root.querySelectorAll('.rhythm-tone-row')[index]!;assert.equal(card.dataset.partId,row.dataset.partId);assert.equal(Number.parseFloat(card.parentElement!.style.top!),24+Number.parseFloat(row.style.top!));assert.equal(card.style.height,'72px');});
  assert.equal(f.block(f.ids[0]!).style.height,'58px');
  f.scroll.emit('pointerdown',{target:f.block(f.ids[0]!),...f.pointAt(2.02,0)});f.document.emit('pointerup');
  assert.equal(f.root.querySelectorAll('select').length,0);assert.equal(f.root.querySelectorAll('input').length,5);
  assert.equal(f.block(f.ids[1]!).classList.contains('is-dim'),true);
 }finally{f.cleanup();}
});

test('tone row controls follow shared vertical scroll and horizontal zoom retains broad row heights',()=>{
 const f=fixture({extraVoices:6});try{
  f.scroll.scrollTop=83;f.scroll.emit('scroll');
  assert.equal(f.root.querySelectorAll('.melody-tone')[2]!.parentElement!.style.top,85+'px');
  f.scroll.emit('wheel',{ctrlKey:true,deltaY:-200,clientX:412,clientY:200});
  assert.equal(f.root.querySelectorAll('.rhythm-tone-row')[0]!.style.height,'72px');assert.equal(f.root.querySelectorAll('.melody-tone')[0]!.style.height,'72px');
  f.scroll.emit('wheel',{ctrlKey:true,shiftKey:true,deltaY:-150,clientX:412,clientY:200});
  const row=f.root.querySelectorAll('.rhythm-tone-row')[2]!,card=f.root.querySelectorAll('.melody-tone')[2]!;
  assert.equal(row.style.height,card.style.height);assert.equal(Number.parseFloat(card.parentElement!.style.top!),24+Number.parseFloat(row.style.top!)-f.scroll.scrollTop);assert(Number.parseFloat(card.style.height!)>72);
 }finally{f.cleanup();}
});

test('creating a step uses its clicked tone row, leaves melody intact and previews the whole phrase',async()=>{
 const f=fixture();try{
  f.root.querySelectorAll('.melody-tone')[0]!.emit('click');
  f.scroll.emit('pointerdown',{target:f.canvas,...f.pointAt(2.13,1)});
  const preview=f.previews.at(-1)!;assert.equal(preview.parts.find(part=>part.id===f.melodyPart)!.notes[0]!.id,f.melodyNote);
  assert.equal(preview.parts.find(part=>part.id===f.parts[1])!.notes[0]!.startBeat,2);assert.equal(f.phrase.read().body!.parts.find(part=>part.id===f.parts[1])!.notes.length,0);
  f.document.emit('pointerup');await settle();const note=f.phrase.read().body!.parts.find(part=>part.id===f.parts[1])!.notes[0]!;
  assert.equal(note.frequencyHz,261.6255653005986);assert.equal(note.durationSeconds,.125);assert.equal(f.auditions.length,1);assert.equal(f.changes(),1);
  assert.equal(f.root.querySelectorAll('select').length,0);f.phrase.undo();assert.equal(f.phrase.read().body!.parts.find(part=>part.id===f.parts[1])!.notes.length,0);
 }finally{f.cleanup();}
});

test('continuous cross-row dragging transfers tone and preserves pitch, identity and one-step undo',()=>{
 const f=fixture({notes:true});try{
  const original=structuredClone(f.phrase.read().body!);const note=original.parts.find(part=>part.id===f.parts[0])!.notes[0]!;
  const start=f.pointAt(2.02,0);f.scroll.emit('pointerdown',{target:f.block(note.id),...start});
  f.document.emit('pointermove',{clientX:start.clientX+17.3,clientY:start.clientY+72});
  assert.equal(f.block(note.id).dataset.partId,f.parts[1]);assert.equal(f.block(note.id).classList.contains('is-dim'),false);assert.equal(Number.parseFloat(f.block(note.id).style.top!),79);
  assert.equal(f.phrase.read().body!.parts.find(part=>part.id===f.parts[0])!.notes[0]!.id,note.id);
  const preview=f.previews.at(-1)!;assert.equal(preview.parts.find(part=>part.id===f.parts[1])!.notes.find(value=>value.id===note.id)!.frequencyHz,330);
  f.document.emit('pointerup');const moved=f.phrase.read().body!.parts.find(part=>part.id===f.parts[1])!.notes.find(value=>value.id===note.id)!;
  assert.equal(moved.startBeat,2.25);assert.equal(moved.frequencyHz,note.frequencyHz);assert.equal(moved.durationSeconds,.5);assert.equal(moved.level,.6);assert.equal(moved.pan,.2);
  f.phrase.undo();assert.deepEqual(f.phrase.read().body,original);
 }finally{f.cleanup();}
});

test('right erasing in rhythm only removes rhythm hitboxes including dimmed rows',()=>{
 const f=fixture({notes:true});try{
  f.root.querySelectorAll('.melody-tone')[0]!.emit('click');
  f.scroll.emit('pointerdown',{button:2,target:f.block(f.ids[0]!),...f.pointAt(2.5,0)});
  f.document.emit('pointermove',{button:2,...f.pointAt(4.5,1)});f.document.emit('pointerup');
  assert.equal(f.phrase.read().body!.parts.filter(part=>part.section==='rhythm').flatMap(part=>part.notes).length,0);
  assert.equal(f.phrase.read().body!.parts.find(part=>part.id===f.melodyPart)!.notes[0]!.id,f.melodyNote);f.phrase.undo();
  assert.equal(f.phrase.read().body!.parts.filter(part=>part.section==='rhythm').flatMap(part=>part.notes).length,2);
 }finally{f.cleanup();}
});

test('rhythm console and shortcuts alter only selected note mix and time and flush surfaces transfer failures',()=>{
 const f=fixture({notes:true});try{
  const id=f.ids[0]!;f.scroll.emit('pointerdown',{target:f.block(id),...f.pointAt(2.02,0)});f.document.emit('pointerup');
  f.document.emit('keydown',{key:'q',target:f.scroll});f.document.emit('keydown',{key:'s',target:f.scroll});f.document.emit('keydown',{key:'d',target:f.scroll});
  const changed=f.phrase.read().body!.parts.find(part=>part.id===f.parts[0])!.notes[0]!;assert.equal(changed.startBeat,2.25);assert(Math.abs(changed.pan!-.15)<1e-12);assert(Math.abs(changed.level!-.55)<1e-12);
  const duration=f.root.querySelectorAll('input').find(input=>input.attributes.get('aria-label')==='时长 / 秒')!;duration.value='1.25';duration.emit('input');assert.equal(f.previews.at(-1)!.parts.find(part=>part.id===f.parts[0])!.notes[0]!.durationSeconds,1.25);f.workspace.flush();
  const before=structuredClone(f.phrase.read().body);const start=f.pointAt(2.27,0);f.scroll.emit('pointerdown',{target:f.block(id),...start});f.document.emit('pointermove',{clientX:start.clientX,clientY:start.clientY+72});
  const move=f.phrase.moveNote;f.phrase.moveNote=()=>{throw new Error('转移暂时失败');};assert.throws(()=>f.workspace.flush(),/转移暂时失败/u);assert.deepEqual(f.phrase.read().body,before);assert.equal(f.previews.at(-1),undefined);f.phrase.moveNote=move;
 }finally{f.cleanup();}
});

test('melody opening excludes rhythm rows and its erase cannot delete rhythm data',()=>{
 const f=fixture({notes:true});try{
  f.workspace.dispose();const melody=mountMelodyWorkspace(f.root as unknown as HTMLElement,{phrase:f.phrase,sound:{async audition(){},cancelAudition(){}} as unknown as SoundRuntimePort,gridBpm:()=>120,onChange(){},onPreview(){},onSeek(){},listTimbres:()=>f.voices,onAddTimbre:id=>f.phrase.addPart(id)});
  assert.equal(f.root.querySelectorAll('.melody-note').length,1);assert.equal(f.root.querySelectorAll('.melody-tone').length,1);
  const scroll=f.root.querySelector('.melody-scroll')!,note=f.root.querySelector('.melody-note')!,bounds=note.getBoundingClientRect();
  scroll.emit('pointerdown',{button:2,target:note,clientX:bounds.left+8,clientY:bounds.top+8});f.document.emit('pointerup');
  assert.equal(f.phrase.read().body!.parts.find(part=>part.id===f.melodyPart)!.notes.length,0);assert.equal(f.phrase.read().body!.parts.filter(part=>part.section==='rhythm').flatMap(part=>part.notes).length,2);melody.dispose();
 }finally{f.cleanup();}
});

test('shortcuts and Delete flush a cross-row drag before reading its new note and voice',()=>{
 const f=fixture({notes:true});try{
  const id=f.ids[0]!,start=f.pointAt(2.02,0);
  f.scroll.emit('pointerdown',{target:f.block(id),...start});
  f.document.emit('pointermove',{clientX:start.clientX+25,clientY:start.clientY+72});
  assert.equal(f.block(id).classList.contains('is-dim'),false);
  f.document.emit('keydown',{key:'d',target:f.scroll});
  const moved=f.phrase.read().body!.parts.find(part=>part.id===f.parts[1])!.notes.find(note=>note.id===id)!;
  assert.equal(moved.startBeat,2.75);assert.equal(f.phrase.read().body!.parts.find(part=>part.id===f.parts[0])!.notes.length,0);
  const again=f.pointAt(2.77,1);f.scroll.emit('pointerdown',{target:f.block(id),...again});
  f.document.emit('pointermove',{clientX:again.clientX+12.5,clientY:again.clientY-72});
  f.document.emit('keydown',{key:'Delete',target:f.scroll});
  assert.equal(f.phrase.read().body!.parts.flatMap(part=>part.notes).some(note=>note.id===id),false);
  f.document.emit('pointerup');assert.equal(f.previews.at(-1),undefined);
 }finally{f.cleanup();}
});
