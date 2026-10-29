import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { MidiImportNotice, ProjectDirectoriesPort, ProjectDirectoryOpenResult } from '../src/workstation/contracts/project-directory.ts';
import { createProjectSetup, midiProjectName } from '../src/workstation/app/project-setup.ts';
import { createMaterialLibrary } from '../src/workstation/modules/materials/public.ts';
import { rememberMidiImportNotice, takeMidiImportNotice } from '../src/workstation/app/platform/midi-notice.ts';

function midi(): Uint8Array {
  const track = [0,0xc0,0,0,0x90,60,100,0x83,0x60,0x80,60,64,0,0xff,0x2f,0];
  return Uint8Array.from([77,84,104,100,0,0,0,6,0,0,0,1,1,224,77,84,114,107,0,0,0,track.length,...track]);
}
function fixture(openResult: ProjectDirectoryOpenResult) {
  const creates: Array<{name:string;location:string;text:string}> = [], entered: Array<MidiImportNotice|undefined> = [];
  let result = openResult, fail = false;
  const directories: ProjectDirectoriesPort = {
    read: async () => ({ defaultLocation:'D:/RootSound/project' }), chooseLocation: async () => ({ status:'cancelled' }),
    list: async () => [{id:'old',name:'Canon',path:'D:/RootSound/project/Canon.rootsound'},
      {id:'other',name:'canon 1',path:'D:/RootSound/project/canon 1.rootsound'}],
    open: async () => result,
    create: async (name,location,text) => { creates.push({name,location,text}); if(fail)throw new Error('disk unavailable'); return {id:'new-project',name,path:`${location}/${name}.rootsound`}; },
  };
  return { creates, entered, directories, setup:createProjectSetup(directories,notice=>entered.push(notice)),
    select(next:ProjectDirectoryOpenResult){result=next;}, failCreate(value:boolean){fail=value;} };
}

test('the same folder Open route imports MIDI into a uniquely named default-directory project and supplies a completion notice', async () => {
  const bytes=midi(), before=bytes.slice(), f=fixture({status:'midi',name:'canon.MIDI',bytes});
  await f.setup.open();
  assert.equal(f.creates.length,1);assert.equal(f.creates[0]!.name,'canon 2');assert.equal(f.creates[0]!.location,'D:/RootSound/project');
  const library=createMaterialLibrary({read:()=>f.creates[0]!.text,write:()=>{throw new Error('Read-only verification');}});
  assert.equal(library.listDrafts().find(draft=>draft.kind==='rootsound.song')?.name,'canon 2');
  assert.equal(f.entered.length,1);assert.equal(f.entered[0]?.projectId,'new-project');
  assert.equal(f.entered[0]?.noteCount,1);assert.equal(f.entered[0]?.trackCount,1);
  assert.deepEqual(bytes,before);
});

test('cancel and ordinary song Open keep their existing behavior; malformed MIDI never reaches project creation', async () => {
  const f=fixture({status:'cancelled'});await f.setup.open();assert.equal(f.entered.length,0);assert.equal(f.creates.length,0);
  f.select({status:'opened',project:{id:'song',name:'Song',path:'D:/Song.rootsound'}});await f.setup.open();
  assert.deepEqual(f.entered,[undefined]);assert.equal(f.creates.length,0);
  f.select({status:'midi',name:'broken.mid',bytes:new Uint8Array([0,1,2])});
  await assert.rejects(f.setup.open(),/MIDI|文件|格式|读取/);assert.equal(f.creates.length,0);assert.equal(f.entered.length,1);
});

test('failed MIDI project creation does not enter the project and can be retried', async () => {
  const f=fixture({status:'midi',name:'fresh.mid',bytes:midi()});f.failCreate(true);
  await assert.rejects(f.setup.open(),/disk unavailable/);assert.equal(f.entered.length,0);
  f.failCreate(false);await f.setup.open();assert.equal(f.entered.length,1);assert.equal(f.creates.length,2);
});

test('MIDI naming reserves the actual filename after a project display-name rename, including legacy folders', async () => {
  for (const path of ['D:/RootSound/project/canon.rootsound', 'D:\\RootSound\\project\\CANON.ROOTSOUND', 'D:/RootSound/project/canon/']) {
    const f=fixture({status:'midi',name:'canon.mid',bytes:midi()});
    f.directories.list=async()=>[{id:'renamed',name:'Different title',path}];
    await f.setup.open();
    assert.equal(f.creates[0]!.name,'canon 1');
    assert.equal(f.entered[0]?.name,'canon 1');
  }
});

test('source filenames produce valid names without paths, device names or cut surrogate pairs', () => {
  assert.equal(midiProjectName('C:/scores/canon.MID'),'canon');assert.equal(midiProjectName('CON.midi'),'导入 CON');
  assert.equal(midiProjectName('?.mid'),'_');assert.equal(midiProjectName('.mid'),'导入的 MIDI');
  assert.equal(midiProjectName('😀'.repeat(80)+'.mid'),'😀'.repeat(40));
});

function store() {
  const values=new Map<string,string>();return {values,getItem:(key:string)=>values.get(key)??null,
    setItem:(key:string,value:string)=>{values.set(key,value);},removeItem:(key:string)=>{values.delete(key);}};
}
const notice:MidiImportNotice={projectId:'new-project',name:'导入',trackCount:2,noteCount:123,warnings:['已分配近似音色。']};
test('the import summary survives one reload, is project scoped, and is consumed exactly once', () => {
  const memory=store();assert.equal(rememberMidiImportNotice(memory,notice),true);
  assert.deepEqual(takeMidiImportNotice(memory,'new-project'),notice);assert.equal(takeMidiImportNotice(memory,'new-project'),undefined);
  rememberMidiImportNotice(memory,notice);assert.equal(takeMidiImportNotice(memory,'another-project'),undefined);assert.equal(memory.values.size,0);
});

test('broken or blocked notice storage never prevents opening a saved project', () => {
  const memory=store();memory.values.set('rootsound.midi-import-notice.v1','bad JSON');assert.equal(takeMidiImportNotice(memory,'new-project'),undefined);
  assert.equal(rememberMidiImportNotice(memory,{...notice,noteCount:-1}),false);
  const blocked={getItem(){throw new Error('blocked');},setItem(){throw new Error('blocked');},removeItem(){throw new Error('blocked');}};
  assert.equal(rememberMidiImportNotice(blocked,notice),false);assert.equal(takeMidiImportNotice(blocked,'new-project'),undefined);
});
