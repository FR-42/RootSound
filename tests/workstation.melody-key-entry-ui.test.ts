import assert from 'node:assert/strict';
import test from 'node:test';
import { registerHooks } from 'node:module';
import type { PlayableNotePlan, SoundRuntimePort } from '../src/workstation/contracts/sound.ts';
import { createMaterialLibrary } from '../src/workstation/modules/materials/public.ts';
import { createPhraseEditor } from '../src/workstation/modules/phrase/public.ts';
import { createTimbreEditor, createTimbrePlayback } from '../src/workstation/modules/timbre/public.ts';
import { melodyNoteRect } from '../src/workstation/modules/ui-rendering/melody-geometry.ts';
const hook = registerHooks({ load(url, context, next) { return url.endsWith('.css') ? { format: 'module', source: '', shortCircuit: true } : next(url, context); } });
const { mountMelodyWorkspace } = await import('../src/workstation/modules/ui-rendering/melody-workspace.ts'); hook.deregister();

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

function fixture(config:{rhythm?:boolean;existing?:boolean;authoritativeHead?:number;seekReady?:Promise<void>;performance?:boolean;omitMode?:boolean}={}){
 const environment=dom(),library=createMaterialLibrary(),timbre=createTimbreEditor(library);const saved=timbre.save('new');if(saved.status!=='saved')throw new Error('voice');
 const phrase=createPhraseEditor(library,createTimbrePlayback(library));phrase.create(saved.content.id);phrase.setLength(16);let partId=phrase.read().body!.parts[0]!.id;
 if(config.rhythm)partId=phrase.addPart(saved.content.id,'rhythm');
 if(config.existing)phrase.addNote(partId,{startBeat:4,durationBeats:1,durationSeconds:.5,frequencyHz:440,velocity:.75});
 const root=new Element('main'),seeks:number[]=[],auditions:PlayableNotePlan[]=[];let authoritative=config.authoritativeHead;let performance=config.performance??true;
 const workspace=mountMelodyWorkspace(root as unknown as HTMLElement,{phrase,sound:{async audition(plan:PlayableNotePlan){auditions.push(plan);},cancelAudition(){}} as unknown as SoundRuntimePort,gridBpm:()=>phrase.read().body!.tempoBpm,onChange(){},onPreview(){},onSeek(seconds){seeks.push(seconds);if(authoritative!==undefined)authoritative=seconds;return config.seekReady;},readPlayhead:authoritative===undefined?undefined:()=>authoritative!,readPerformanceMode:config.omitMode?undefined:()=>performance,listTimbres:()=>[{id:saved.content.id,name:saved.content.name}],onAddTimbre:()=>partId,section:config.rhythm?'rhythm':'melody'});
 const scroll=root.querySelector('.melody-scroll')!;
 const selectTone=()=>root.querySelectorAll('.melody-tone').find(card=>card.dataset.partId===partId)!.emit('click');
 const press=(key:string,extras:Record<string,unknown>={})=>environment.document.emit('keydown',{target:scroll,key,...extras});
 const notes=()=>phrase.read().body!.parts.find(part=>part.id===partId)!.notes;
 const highlighted=()=>root.querySelectorAll('.melody-key').filter(key=>key.classList.contains('is-entry-range')).map(key=>key.textContent);
 return{...environment,library,root,phrase,partId,workspace,selectTone,press,notes,seeks,auditions,highlighted,scroll,head(seconds:number){workspace.setPlayhead(seconds);},mode(enabled:boolean){performance=enabled;workspace.refresh();},cleanup(){workspace.dispose();environment.restore();}};
}
const octave4=['B4','A♯4','A4','G♯4','G4','F♯4','F4','E4','D♯4','D4','C♯4','C4'];

test('typing all twelve mapped keys creates a chromatic run and advances the head once per note',async()=>{
 const f=fixture();try{
  f.selectTone();assert.equal(f.workspace.isStepInputActive(),true);assert.deepEqual(f.highlighted(),octave4);assert.equal(f.root.querySelector('.melody-entry-octave'),undefined);
  for(const key of 'cfvgbnjmk,l.'){f.press(key);await settle();}
  assert.equal(f.notes().length,12);assert.deepEqual(f.notes().map(note=>note.startBeat),Array.from({length:12},(_,index)=>(index+1)/4));
  f.notes().forEach((note,index)=>{assert(Math.abs(note.frequencyHz-261.6255653005986*Math.pow(2,index/12))<1e-9);assert.equal(note.durationSeconds,.125);assert.equal(note.durationBeats,.25);});
  assert.deepEqual(f.seeks,Array.from({length:12},(_,index)=>(index+1)*.125));assert.equal(f.auditions.length,12);assert.equal(f.workspace.isStepInputActive(),true);
  assert.equal(f.root.querySelectorAll('input').length,5,'typing selects the new note while the independent tone entry stays armed');
  assert.equal(f.root.querySelectorAll('.melody-note').find(note=>note.classList.contains('is-selected'))!.dataset.noteId,f.notes().at(-1)!.id);
 }finally{f.cleanup();}
});

test('Space inserts one rest, repeated keydown does not flood notes or advance the head',()=>{
 const f=fixture();try{
  f.selectTone();f.press(' ',{code:'Space'});assert.equal(f.notes().length,0);assert.deepEqual(f.seeks,[.125]);
  f.press(' ',{code:'Space',repeat:true});f.press('c',{repeat:true});f.press('x',{repeat:true});assert.deepEqual(f.seeks,[.125]);assert.deepEqual(f.highlighted(),octave4);
  f.press('C');assert.equal(f.notes()[0]!.startBeat,.5);assert.deepEqual(f.seeks,[.125,.25]);
  f.phrase.undo();assert.equal(f.notes().length,0,'a rest never creates a storage undo item');
 }finally{f.cleanup();}
});

test('Z and X select bounded octaves and unsupported edge pitches never move the head',()=>{
 const f=fixture();try{
  f.selectTone();f.press('x');f.press('c');assert(Math.abs(f.notes()[0]!.frequencyHz-523.2511306011972)<1e-9);assert.deepEqual(f.highlighted(),octave4.map(label=>label.replace('4','5')));
  for(let index=0;index<8;index++)f.press('x');assert.deepEqual(f.highlighted(),['D♯8','D8','C♯8','C8']);
  const before=f.seeks.length;f.press('.');assert.equal(f.seeks.length,before);assert.equal(f.notes().length,1);f.press('c');assert.equal(f.notes().length,2);
  for(let index=0;index<12;index++)f.press('z');assert.deepEqual(f.highlighted(),['B0','A♯0','A0','G♯0','G0','F♯0','F0','E0']);
  const low=f.seeks.length;f.press('c');assert.equal(f.seeks.length,low);f.press('b');assert.equal(f.notes().length,3);assert(f.notes()[2]!.frequencyHz>=20);
 }finally{f.cleanup();}
});

test('the final valid cell accepts a note, later notes stop while a rest can reach the exact end',()=>{
 const f=fixture();try{
  f.selectTone();f.head(7.75);f.press('c');assert.equal(f.notes()[0]!.startBeat,15.75);assert.deepEqual(f.seeks,[7.875]);
  f.press('f');assert.equal(f.notes().length,1);assert.deepEqual(f.seeks,[7.875]);f.press(' ',{code:'Space'});assert.deepEqual(f.seeks,[7.875,8]);
  f.press('c');f.press(' ',{code:'Space'});assert.equal(f.notes().length,1);assert.deepEqual(f.seeks,[7.875,8]);
 }finally{f.cleanup();}
});

test('keyboard entry reads the authoritative cursor instead of the last painted head',()=>{
 const f=fixture({authoritativeHead:.37});try{
  f.selectTone();f.head(0);f.press('c');assert.equal(f.notes()[0]!.startBeat,.75);assert.deepEqual(f.seeks,[.375]);f.press('f');assert.equal(f.notes()[1]!.startBeat,1);assert.deepEqual(f.seeks,[.375,.5]);
 }finally{f.cleanup();}
});

test('editable targets, composition, modifiers and modal dialogs never enter notes',()=>{
 const f=fixture();try{
  f.selectTone();for(const target of [new Input('input'),new Select('select'),new TextArea('textarea')])f.press('c',{target});
  const content=Object.assign(new Element('div'),{isContentEditable:true});f.press('c',{target:content});
  for(const extras of [{isComposing:true},{keyCode:229},{ctrlKey:true},{metaKey:true},{altKey:true}])f.press('c',extras);
  f.root.querySelector('.melody-add-tone')!.emit('click');assert.equal(f.workspace.isStepInputActive(),false);f.press('c');f.root.querySelector('.melody-tone-library')!.close();
  const dialog=new Element('dialog');f.root.append(dialog);dialog.showModal();assert.equal(f.workspace.isStepInputActive(),false);f.press(' ',{code:'Space'});dialog.close();dialog.remove();
  assert.equal(f.notes().length,0);assert.deepEqual(f.seeks,[]);
  const active=Object.assign(new Element('div'),{isContentEditable:true});f.document.activeElement=active;assert.equal(f.workspace.isStepInputActive(),false);
 }finally{f.cleanup();}
});

test('note selection and rhythm keep their existing editing keys without activating note entry',()=>{
 const f=fixture({existing:true});try{
  f.selectTone();const block=f.root.querySelector('.melody-note')!,bounds=block.getBoundingClientRect();f.scroll.emit('pointerdown',{target:block,clientX:bounds.left+2,clientY:bounds.top+5});f.document.emit('pointerup');
  assert.equal(f.workspace.isStepInputActive(),false);assert.deepEqual(f.highlighted(),[]);f.press('c');assert.equal(f.notes().length,1);f.press('q');assert.equal(f.notes()[0]!.pan,-.05);assert.deepEqual(f.seeks,[]);
 }finally{f.cleanup();}
 const rhythm=fixture({rhythm:true});try{rhythm.selectTone();assert.equal(rhythm.workspace.isStepInputActive(),false);assert.equal(rhythm.root.querySelector('.melody-entry-octave'),undefined);rhythm.press('c');rhythm.press(' ',{code:'Space'});rhythm.press('x');assert.equal(rhythm.notes().length,0);assert.deepEqual(rhythm.seeks,[]);}finally{rhythm.cleanup();}
});

test('write failures do not advance or leave tone entry and a successful retry still works',()=>{
 const f=fixture();try{
  f.selectTone();const add=f.phrase.addNote;f.phrase.addNote=()=>{throw new Error('测试写入失败');};f.press('c');assert.equal(f.notes().length,0);assert.deepEqual(f.seeks,[]);assert.equal(f.workspace.isStepInputActive(),true);assert.match(f.root.querySelector('.melody-notice')!.textContent,/测试写入失败/u);
  f.phrase.addNote=add;f.press('f');assert.equal(f.notes()[0]!.startBeat,.25);assert.deepEqual(f.seeks,[.125]);
  f.workspace.dispose();f.press('c');assert.equal(f.notes().length,1);assert.equal(f.workspace.isStepInputActive(),false);
 }finally{f.cleanup();}
});

test('a high-tempo one-cell note can be moved from its centre and resized from its narrow right edge',()=>{
 const f=fixture();try{
  f.phrase.setTempo(240);f.workspace.refresh();f.selectTone();f.press('c');
  const note=f.notes()[0]!,block=f.root.querySelector('.melody-note')!,bounds=block.getBoundingClientRect();assert.equal(bounds.width,6.25);
  const centre={clientX:bounds.left+bounds.width/2,clientY:bounds.top+5};
  f.scroll.emit('pointerdown',{target:block,...centre});f.document.emit('pointermove',{clientX:centre.clientX+25,clientY:centre.clientY});f.document.emit('pointerup');
  assert.equal(f.notes()[0]!.id,note.id);assert.equal(f.notes()[0]!.startBeat,1.25);assert.equal(f.notes()[0]!.durationSeconds,.0625);
  const moved=f.root.querySelector('.melody-note')!,edge=moved.getBoundingClientRect();const at={clientX:edge.right-.5,clientY:edge.top+5};
  f.scroll.emit('pointerdown',{target:moved.querySelector('.melody-note-resize'),...at});f.document.emit('pointermove',{clientX:at.clientX+12.5,clientY:at.clientY});f.document.emit('pointerup');
  assert.equal(f.notes()[0]!.startBeat,1.25);assert.equal(f.notes()[0]!.durationSeconds,.1875);
 }finally{f.cleanup();}
});


test('Backspace undoes edits instead of deleting a selected note and keeps a valid typing context',()=>{
 const f=fixture();try{
  f.selectTone();f.press('c');const first=f.notes()[0]!.id;f.press('q');assert.equal(f.notes()[0]!.pan,-.05);
  f.press('Backspace');assert.equal(f.notes()[0]!.id,first);assert.equal(f.notes()[0]!.pan,undefined);assert.equal(f.workspace.isStepInputActive(),true);
  f.press('Backspace',{repeat:true});assert.equal(f.notes().length,1);
  f.press('Backspace');assert.equal(f.notes().length,0);assert.equal(f.workspace.isStepInputActive(),true);f.press('f');assert.equal(f.notes()[0]!.startBeat,.25);
  const second=f.notes()[0]!.id;f.press('Delete');assert.equal(f.notes().length,0);f.press('Backspace');assert.equal(f.notes()[0]!.id,second);
 }finally{f.cleanup();}
});

test('a mouse-created note is selected and arms continuous typing, but a manual existing-note pick exits it',()=>{
 const f=fixture();try{
  f.selectTone();const keys=f.phrase.keyboard().slice().reverse(),row=keys.findIndex(key=>Math.abs(key.frequencyHz-440)<.01);
  f.scroll.emit('pointerdown',{target:f.root.querySelector('.melody-canvas'),clientX:312,clientY:100+row*24+12-f.scroll.scrollTop});f.document.emit('pointerup');
  const mouse=f.notes()[0]!,block=f.root.querySelector('.melody-note')!;assert.equal(block.classList.contains('is-selected'),true);assert.equal(f.workspace.isStepInputActive(),true);
  assert.equal(f.root.querySelectorAll('input').length,5);f.press('c');assert.equal(f.notes().length,2);
  const old=f.root.querySelectorAll('.melody-note').find(note=>note.dataset.noteId===mouse.id)!,bounds=old.getBoundingClientRect();f.scroll.emit('pointerdown',{target:old,clientX:bounds.left+bounds.width/2,clientY:bounds.top+6});f.document.emit('pointerup');
  assert.equal(f.workspace.isStepInputActive(),false);assert.deepEqual(f.highlighted(),[]);f.press('c');assert.equal(f.notes().length,2);
 }finally{f.cleanup();}
});

test('right-clicking blank space clears selection and typing without adding an undo entry in either department',()=>{
 for(const rhythm of [false,true]){const f=fixture({rhythm,existing:true});try{
  f.selectTone();if(!rhythm)f.press('c');const before=structuredClone(f.phrase.read().body),undoBefore=f.library.readDraftHistory(f.phrase.read().draft!.id);
  f.scroll.emit('pointerdown',{button:2,target:f.root.querySelector('.melody-canvas'),clientX:912,clientY:150});
  assert.equal(f.root.querySelector('.melody-console')!.hidden,true);assert.equal(f.workspace.isStepInputActive(),false);assert.equal(f.root.querySelectorAll('.melody-tone').some(card=>card.classList.contains('is-selected')),false);
  assert.equal(f.root.querySelectorAll('.melody-note').some(note=>note.classList.contains('is-selected')||note.classList.contains('is-dim')),false);
  f.document.emit('pointerup');assert.deepEqual(f.phrase.read().body,before);assert.deepEqual(f.library.readDraftHistory(f.phrase.read().draft!.id),undoBefore);const count=f.notes().length;f.press('c');assert.equal(f.notes().length,count);
 }finally{f.cleanup();}}
});

test('the console belongs to the right editor while the tone shelf remains a separate full-height column',()=>{
 for(const rhythm of [false,true]){const f=fixture({rhythm,existing:true});try{
  f.selectTone();const console=f.root.querySelector('.melody-console')!,shelf=f.root.querySelector('.melody-shelf')!,roll=f.root.querySelector('.melody-roll')!;
  assert.equal(console.parentElement,roll);assert.equal(console.closest('.melody-shelf'),undefined);assert.equal(shelf.parentElement,f.root.querySelector('.melody-main'));
  if(rhythm){f.scroll.clientHeight=100;shelf.clientHeight=400;f.workspace.refresh();assert.equal(f.root.querySelector('.melody-tone')!.parentElement!.style.clipPath,'inset(0px 0 0px 0)');f.scroll.clientHeight=24;f.workspace.refresh();assert.equal(f.root.querySelector('.melody-tone')!.parentElement!.style.clipPath,'inset(0px 0 48px 0)');}
 }finally{f.cleanup();}}
});

test('zooming a newly generated short note keeps its drawn span within its actual grid cell',()=>{
 const f=fixture();try{
  f.phrase.setTempo(240);f.workspace.refresh();f.selectTone();f.press('c');const note=f.notes()[0]!,body=f.phrase.read().body!;
  const rect=melodyNoteRect(note,body,f.phrase.keyboard(),{leftSeconds:0,zoom:.25,rowHeight:24},800);assert.equal(rect.width,1.5625);
  f.scroll.emit('wheel',{target:f.root.querySelector('.melody-canvas'),clientX:212,clientY:100,ctrlKey:true,deltaY:Math.log(4)/.002});
  const block=f.root.querySelector('.melody-note')!,lines=f.root.querySelectorAll('.melody-grid-line');
  const left=Number.parseFloat(block.style.left!),right=left+Number.parseFloat(block.style.width!);
  assert(Math.abs(left-Number.parseFloat(lines[1]!.style.left!))<1e-8);
  assert(Math.abs(right-Number.parseFloat(lines[2]!.style.left!))<1e-8);
  assert.equal(f.notes()[0]!.durationSeconds,note.durationSeconds,'view zoom never shortens the sound');
 }finally{f.cleanup();}
});


test('right-dragging from blank space still erases crossed notes and supports Undo in both departments',()=>{
 for(const rhythm of [false,true]){const f=fixture({rhythm,existing:true});try{
  f.selectTone();const note=f.root.querySelector('.melody-note')!,bounds=note.getBoundingClientRect(),y=bounds.top+bounds.height/2;
  f.scroll.emit('pointerdown',{button:2,target:f.root.querySelector('.melody-canvas'),clientX:bounds.left-20,clientY:y});assert.equal(f.notes().length,1);assert.equal(f.root.querySelector('.melody-console')!.hidden,true);
  f.document.emit('pointermove',{button:2,clientX:bounds.right+20,clientY:y});f.document.emit('pointerup');assert.equal(f.notes().length,0);
  f.press('Backspace');assert.equal(f.notes().length,1);assert.equal(f.workspace.isStepInputActive(),false);
 }finally{f.cleanup();}}
});

test('Backspace ignores editing fields and a failed undo preserves the selected note and history',()=>{
 const f=fixture();try{
  f.selectTone();f.press('c');f.press('q');const before=structuredClone(f.phrase.read().body),history=f.library.readDraftHistory(f.phrase.read().draft!.id);
  f.press('Backspace',{target:new Input('input')});assert.deepEqual(f.phrase.read().body,before);
  const undo=f.phrase.undo;f.phrase.undo=()=>{throw new Error('测试无法撤销');};f.press('Backspace');assert.deepEqual(f.phrase.read().body,before);assert.deepEqual(f.library.readDraftHistory(f.phrase.read().draft!.id),history);assert.match(f.root.querySelector('.melody-notice')!.textContent,/测试无法撤销/u);f.phrase.undo=undo;
  const slider=f.root.querySelectorAll('input').find(input=>input.attributes.get('aria-label')==='音量')!;assert(slider);f.press('Backspace',{target:slider});assert.equal(f.notes()[0]!.pan,undefined,'a focused note slider permits Undo');assert.equal(f.notes().length,1);
 }finally{f.cleanup();}
});

test('a blank click auditions once when released in either department and a cancelled press stays silent',async()=>{
 for(const rhythm of [false,true])for(const bpm of [120,240]){const f=fixture({rhythm});try{
  f.phrase.setTempo(bpm);f.workspace.refresh();
  f.selectTone();const pitches=f.phrase.keyboard().slice().reverse(),row=rhythm?0:pitches.findIndex(pitch=>pitch.label==='A4');
  const at={target:f.root.querySelector('.melody-canvas'),clientX:312,clientY:100+row*(rhythm?72:24)+12-f.scroll.scrollTop};
  f.scroll.emit('pointerdown',at);await settle();
  assert.equal(f.notes().length,0,'a press may still become a viewport drag');assert.equal(f.auditions.length,0,'a pending click remains silent');
  f.document.emit('pointerup');await settle();assert.equal(f.notes().length,1);assert.equal(f.auditions.length,1,'a confirmed click sounds once');
  assert(Math.abs(f.auditions[0]!.note.frequencyHz-(rhythm?261.6255653005986:440))<1e-9);assert.equal(f.auditions[0]!.note.holdSeconds,60/bpm/4);
  f.document.emit('pointerup');await settle();assert.equal(f.auditions.length,1,'another release does not play a second copy');
  f.scroll.emit('pointerdown',{...at,clientX:512});await settle();assert.equal(f.auditions.length,1);f.document.emit('pointercancel');await settle();
  assert.equal(f.notes().length,1);assert.equal(f.auditions.length,1,'cancelling the new gesture stays silent');
 }finally{f.cleanup();}}
});

test('a typed note waits for the moving transport to settle before its single audition',async()=>{
 let finish!:()=>void;const ready=new Promise<void>(resolve=>{finish=resolve;});const f=fixture({seekReady:ready});try{
  f.phrase.setTempo(240);f.workspace.refresh();f.selectTone();f.press('c');await settle();assert.equal(f.notes().length,1);assert.equal(f.auditions.length,0);assert.deepEqual(f.seeks,[.0625]);
  finish();await settle();assert.equal(f.auditions.length,1);assert(Math.abs(f.auditions[0]!.note.frequencyHz-261.6255653005986)<1e-9);assert.equal(f.auditions[0]!.note.holdSeconds,.0625);
  f.press(' ',{code:'Space'});await settle();assert.equal(f.auditions.length,1,'a rest never auditions a note');
 }finally{finish();f.cleanup();}
});

test('entry-range row edges follow octave changes and row resizing, then clear with blank deselection',()=>{
 const f=fixture();try{
  assert.deepEqual(f.highlighted(),[]);f.selectTone();assert.deepEqual(f.highlighted(),octave4);
  assert.equal(f.root.querySelector('.melody-entry-octave'),undefined);f.press('x');const octave5=octave4.map(label=>label.replace('4','5'));assert.deepEqual(f.highlighted(),octave5);
  f.scroll.emit('wheel',{ctrlKey:true,shiftKey:true,deltaY:-50,clientX:212,clientY:100});assert.deepEqual(f.highlighted(),octave5);
  f.press('c');assert.deepEqual(f.highlighted(),octave5,'automatically selecting the new note keeps the active entry range');
  f.scroll.emit('pointerdown',{button:2,target:f.root.querySelector('.melody-canvas'),clientX:912,clientY:150});f.document.emit('pointerup');assert.deepEqual(f.highlighted(),[]);
 }finally{f.cleanup();}
});

test('performance mode is opt-in and can be changed without recreating the editor',()=>{
 for(const omitMode of [false,true]){const f=fixture({performance:false,omitMode});try{
  f.selectTone();assert.equal(f.workspace.isStepInputActive(),false);assert.deepEqual(f.highlighted(),[]);
  for(const key of 'cfvgbnjmk,l.zx ')f.press(key);assert.equal(f.notes().length,0);assert.deepEqual(f.seeks,[]);
  if(!omitMode){f.mode(true);assert.equal(f.workspace.isStepInputActive(),true);assert.deepEqual(f.highlighted(),octave4);f.press('c');assert.equal(f.notes().length,1);
   f.mode(false);f.press('f');f.press('x');assert.equal(f.notes().length,1);assert.equal(f.workspace.isStepInputActive(),false);assert.deepEqual(f.highlighted(),[]);}
 }finally{f.cleanup();}}
});

test('changing performance octave centers its highlighted range inside the visible pitch roll',()=>{
 const f=fixture();try{
  f.selectTone();
  for(const key of ['x','x','z']){
   f.press(key);const active=f.root.querySelectorAll('.melody-key').filter(key=>key.classList.contains('is-entry-range'));
   const centre=(Number.parseFloat(active[0]!.style.top!)+Number.parseFloat(active.at(-1)!.style.top!)+24)/2;
   assert(Math.abs(centre-f.scroll.scrollTop-f.scroll.clientHeight/2)<1e-8);
  }
  for(let index=0;index<10;index++)f.press('x');let active=f.root.querySelectorAll('.melody-key').filter(key=>key.classList.contains('is-entry-range'));
  assert(Number.parseFloat(active[0]!.style.top!)>=f.scroll.scrollTop);assert(Number.parseFloat(active.at(-1)!.style.top!)+24<=f.scroll.scrollTop+f.scroll.clientHeight);
  for(let index=0;index<10;index++)f.press('z');active=f.root.querySelectorAll('.melody-key').filter(key=>key.classList.contains('is-entry-range'));
  assert(Number.parseFloat(active[0]!.style.top!)>=f.scroll.scrollTop);assert(Number.parseFloat(active.at(-1)!.style.top!)+24<=f.scroll.scrollTop+f.scroll.clientHeight);
 }finally{f.cleanup();}
});

test('undo and redo restore the cursor of typed notes while ordinary edits and mouse notes leave it alone',()=>{
 const f=fixture({authoritativeHead:.37});try{
  f.selectTone();f.press('c');const first=f.notes()[0]!.id;assert.deepEqual(f.seeks,[.375]);f.press('q');f.press('Backspace');assert.deepEqual(f.seeks,[.375]);
  f.press('Backspace');assert.equal(f.notes().length,0);assert.deepEqual(f.seeks,[.375,.37]);
  f.press('y',{ctrlKey:true});assert.equal(f.notes()[0]!.id,first);assert.deepEqual(f.seeks,[.375,.37,.375]);
  f.press('f');assert.equal(f.notes().length,2);f.press('Backspace');assert.equal(f.notes().length,1);assert.equal(f.seeks.at(-1),.375);
  f.press('z',{ctrlKey:true});assert.equal(f.notes().length,0);assert.equal(f.seeks.at(-1),.37);
  const keys=f.phrase.keyboard().slice().reverse(),row=keys.findIndex(key=>key.label==='A4');
  f.scroll.emit('pointerdown',{target:f.root.querySelector('.melody-canvas'),clientX:312,clientY:100+row*24+12-f.scroll.scrollTop});f.document.emit('pointerup');
  const count=f.seeks.length;f.press('Backspace');assert.equal(f.notes().length,0);assert.equal(f.seeks.length,count);
 }finally{f.cleanup();}
});

test('arrows pan both rolls and Ctrl arrows zoom their view without altering notes or the cursor',()=>{
 for(const rhythm of [false,true]){const f=fixture({rhythm,existing:true});try{
  const before=structuredClone(f.phrase.read().draft);const block=()=>f.root.querySelector('.melody-note')!;
  f.press('ArrowRight',{ctrlKey:true});f.press('ArrowRight',{ctrlKey:true});const left=Number.parseFloat(block().style.left!),width=Number.parseFloat(block().style.width!);
  f.press('ArrowRight');assert(Math.abs(Number.parseFloat(block().style.left!)-left+64)<1e-8);f.press('ArrowLeft');assert(Math.abs(Number.parseFloat(block().style.left!)-left)<1e-8);
  f.press('ArrowLeft',{ctrlKey:true});assert(Number.parseFloat(block().style.width!)<width);
  if(rhythm)f.scroll.clientHeight=48;const top=f.scroll.scrollTop;f.press('ArrowDown');assert.equal(f.scroll.scrollTop,top+(rhythm?72:24));f.press('ArrowUp');assert.equal(f.scroll.scrollTop,top);
  const row=()=>f.root.querySelectorAll('.melody-pitch-row')[0]!;const height=Number.parseFloat(row().style.height!);f.press('ArrowUp',{ctrlKey:true});assert(Number.parseFloat(row().style.height!)>height);f.press('ArrowDown',{ctrlKey:true});assert(Math.abs(Number.parseFloat(row().style.height!)-height)<1e-8);
  const drawn=block().style.left;for(const extra of [{target:new Input('input')},{isComposing:true},{keyCode:229},{altKey:true},{metaKey:true},{shiftKey:true}])f.press('ArrowRight',extra);assert.equal(block().style.left,drawn);
  assert.deepEqual(f.phrase.read().draft,before);assert.deepEqual(f.seeks,[]);
 }finally{f.cleanup();}}
});

test('the plus column extends either roll one measure, reveals editable late cells and can be undone',()=>{
 for(const rhythm of [false,true]){const f=fixture({rhythm,existing:true});try{
  const original=structuredClone(f.notes());const plus=f.root.querySelector('.melody-extend')!;
  assert.equal(plus.closest('.melody-scroll'),undefined,'the extension column is outside musical hitboxes');plus.emit('click');assert.equal(f.phrase.read().body!.lengthBeats,20);assert.deepEqual(f.notes(),original);assert.deepEqual(f.seeks,[]);
  f.selectTone();const keys=f.phrase.keyboard().slice().reverse(),row=rhythm?0:keys.findIndex(key=>key.label==='A4');
  f.scroll.emit('pointerdown',{target:f.root.querySelector('.melody-canvas'),clientX:912,clientY:100+row*(rhythm?72:24)+12-f.scroll.scrollTop});f.document.emit('pointerup');
  assert.equal(f.notes().at(-1)!.startBeat,18);assert.equal(f.root.querySelectorAll('.melody-note').length,2);f.press('Backspace');f.press('Backspace');assert.equal(f.phrase.read().body!.lengthBeats,16);assert.deepEqual(f.notes(),original);
  for(let index=0;index<20;index++)plus.emit('click');assert.equal(f.phrase.read().body!.lengthBeats,96);assert.equal(plus.disabled,false);assert.deepEqual(f.notes(),original);
  f.phrase.setLength(1020);f.workspace.refresh();plus.emit('click');assert.equal(f.phrase.read().body!.lengthBeats,1024);assert.equal(plus.disabled,true);plus.emit('click');assert.equal(f.phrase.read().body!.lengthBeats,1024);assert.deepEqual(f.notes(),original);
 }finally{f.cleanup();}}
});

test('rhythm unchecking leaves undefined silent notes and rechecking restores the same note identities',async()=>{
 for(const rhythm of [true]){const f=fixture({rhythm,existing:true});try{
  const original=structuredClone(f.phrase.read().body!.parts.find(part=>part.id===f.partId));f.root.querySelector('.melody-add-tone')!.emit('click');
  const tile=()=>f.root.querySelector('.melody-library-tone')!;tile().emit('click');
  assert.equal(f.root.querySelector('.melody-tone-library')!.attributes.has('open'),true);assert.equal(tile().attributes.get('aria-pressed'),'false');
  const part=f.phrase.read().body!.parts.find(part=>part.id===f.partId)!;assert.equal(part.unassigned,true);assert.deepEqual(part.notes,original!.notes);
  assert.equal(f.root.querySelector('.melody-tone')!.textContent,'未定义');assert.equal(f.root.querySelector('.melody-note')!.classList.contains('is-unassigned'),true);
  assert.deepEqual(f.phrase.previewPlan().events,[]);tile().emit('click');assert.deepEqual(f.phrase.read().body!.parts.find(part=>part.id===f.partId),original);assert.equal(tile().attributes.get('aria-pressed'),'true');
  assert.equal(f.root.querySelector('.melody-library-close')!.textContent,'→');f.root.querySelector('.melody-library-close')!.emit('click');
  assert.equal(f.phrase.previewPlan().events.length,1);await settle();assert.equal(f.auditions.length,0,'toggling does not implicitly audition');
 }finally{f.cleanup();}}
});

test('library and shelf play buttons audition independently and closing cancels a pending library preview',async()=>{
 const f=fixture({existing:true});try{
  f.root.querySelector('.melody-add-tone')!.emit('click');const before=structuredClone(f.phrase.read().draft);
  const play=f.root.querySelector('.melody-library-preview')!;play.emit('click');await settle();assert.equal(f.auditions.length,1);assert.deepEqual(f.phrase.read().draft,before);
  play.emit('click');f.root.querySelector('.melody-library-close')!.emit('click');await settle();assert.equal(f.auditions.length,1,'closing prevents a late note');
  f.root.querySelector('.melody-tone-preview')!.emit('click');await settle();assert.equal(f.auditions.length,2);assert.deepEqual(f.phrase.read().draft,before);assert.equal(f.root.querySelector('.melody-console')!.hidden,true,'preview does not select the tone');
  f.phrase.setPartVisible(f.partId,false);f.workspace.refresh();f.root.querySelector('.melody-tone-preview')!.emit('click');await settle();assert.equal(f.auditions.length,2,'undefined tone has no audition');
 }finally{f.cleanup();}
});

test('dropping a library tone into the icon removes its last use and notes, retains the asset and allows Undo',()=>{
 const f=fixture({existing:true});try{
  const original=structuredClone(f.phrase.read().body);f.root.querySelector('.melody-add-tone')!.emit('click');
  const data=new Map<string,string>();const transfer={effectAllowed:'',dropEffect:'',setData(type:string,value:string){data.set(type,value);},getData(type:string){return data.get(type)??'';}};
  const frame=f.root.querySelector('.melody-library-card')!;frame.emit('dragstart',{dataTransfer:transfer});const trash=f.root.querySelector('.melody-tone-trash')!;assert.equal(trash.hidden,false);assert.equal(trash.parentElement,f.root.querySelector('.melody-tone-library'));
  trash.emit('dragover',{dataTransfer:transfer});trash.emit('drop',{dataTransfer:transfer});assert.equal(trash.hidden,true);assert.deepEqual(f.phrase.read().body!.parts,[]);assert.equal(f.root.querySelector('.melody-console')!.hidden,true);
  assert(f.library.readContent(original!.parts[0]!.timbreId));assert.equal(f.root.querySelectorAll('.melody-library-tone').length,1);f.root.querySelector('.melody-library-close')!.emit('click');f.press('Backspace');assert.deepEqual(f.phrase.read().body,original);
 }finally{f.cleanup();}
});

test('two deliberate Delete presses or a console double-click clear all tone notes, single actions and repeats do not',()=>{
 const f=fixture({existing:true});const oldNow=Date.now;let now=1000;Date.now=()=>now;try{
  f.phrase.addNote(f.partId,{startBeat:6,durationBeats:.25,frequencyHz:330,velocity:.75});f.workspace.refresh();const original=structuredClone(f.phrase.read().body);
  f.selectTone();f.press('Delete');f.press('Delete',{repeat:true});assert.equal(f.notes().length,2);now+=600;f.press('Delete');assert.equal(f.notes().length,2);now+=100;f.press('Delete');assert.equal(f.notes().length,0);assert.equal(f.phrase.read().body!.parts.length,1);
  f.press('Backspace');assert.deepEqual(f.phrase.read().body,original);const remove=f.root.querySelector('.melody-delete-tone-notes')!;remove.emit('click');assert.equal(f.notes().length,2);remove.emit('dblclick');assert.equal(f.notes().length,0);f.press('Backspace');assert.deepEqual(f.phrase.read().body,original);assert.deepEqual(f.seeks,[]);
 }finally{Date.now=oldNow;f.cleanup();}
});
