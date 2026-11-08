import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { ProjectDirectoriesPort, ProjectDirectoryOpenResult } from '../src/workstation/contracts/project-directory.ts';
import { createProjectSetup, midiProjectName } from '../src/workstation/app/project-setup.ts';
import { createMaterialLibrary } from '../src/workstation/modules/materials/public.ts';

function midi(): Uint8Array {
  const track = [0,0xc0,0,0,0x90,60,100,0x83,0x60,0x80,60,64,0,0xff,0x2f,0];
  return Uint8Array.from([77,84,104,100,0,0,0,6,0,0,0,1,1,224,77,84,114,107,0,0,0,track.length,...track]);
}
function fixture(openResult: ProjectDirectoryOpenResult) {
  const creates: Array<{name:string;location:string;text:string}> = [], opened: Array<{name:string;path:string;text:string}> = [], entered: unknown[][] = [];
  let result = openResult, fail = false;
  const directories: ProjectDirectoriesPort = {
    read: async () => ({ defaultLocation:'D:/RootSound/project' }), chooseLocation: async () => ({ status:'cancelled' }),
    list: async () => [{id:'old',name:'Canon',path:'D:/RootSound/project/Canon.rootsound'},
      {id:'other',name:'canon 1',path:'D:/RootSound/project/canon 1.rootsound'}],
    open: async () => result,
    openDocument: async (source,text) => { if(fail)throw new Error('disk unavailable');opened.push({name:source.name,path:source.path,text});return{id:'opened-document',name:source.name.replace(/\.[^.]+$/u,''),path:source.path,format:source.format}; },
    create: async (name,location,text) => { creates.push({name,location,text}); if(fail)throw new Error('disk unavailable'); return {id:'new-project',name,path:`${location}/${name}.rootsound`}; },
  };
  return { creates, opened, entered, directories, setup:createProjectSetup(directories,(...args)=>entered.push(args)),
    select(next:ProjectDirectoryOpenResult){result=next;}, failCreate(value:boolean){fail=value;} };
}

const document = (name: string,bytes=midi(),path='D:/scores/'+name):ProjectDirectoryOpenResult=>({status:'document',format:'midi',name,bytes,path,token:'source-token'});
test('opening MIDI edits the actual source document without creating or renaming a native copy', async () => {
  const bytes=midi(), before=bytes.slice(), f=fixture(document('canon.MIDI',bytes));
  await f.setup.open();
  assert.equal(f.creates.length,0);assert.equal(f.opened[0]!.path,'D:/scores/canon.MIDI');
  const library=createMaterialLibrary({read:()=>f.opened[0]!.text,write:()=>{throw new Error('Read-only verification');}});
  assert.equal(library.listDrafts().find(draft=>draft.kind==='rootsound.song')?.name,'canon');
  assert.deepEqual(f.entered,[[]]);
  assert.deepEqual(bytes,before);
});

test('cancel and ordinary song Open keep their existing behavior; malformed MIDI never reaches project creation', async () => {
  const f=fixture({status:'cancelled'});await f.setup.open();assert.equal(f.entered.length,0);assert.equal(f.creates.length,0);
  f.select({status:'opened',project:{id:'song',name:'Song',path:'D:/Song.rootsound'}});await f.setup.open();
  assert.deepEqual(f.entered,[[]]);assert.equal(f.creates.length,0);
  f.select(document('broken.mid',new Uint8Array([0,1,2])));
  await assert.rejects(f.setup.open(),/MIDI|文件|格式|读取/);assert.equal(f.creates.length,0);assert.equal(f.entered.length,1);
});

test('failed document activation does not create a project and can be retried', async () => {
  const f=fixture(document('fresh.mid'));f.failCreate(true);
  await assert.rejects(f.setup.open(),/disk unavailable/);assert.equal(f.entered.length,0);
  f.failCreate(false);await f.setup.open();assert.equal(f.entered.length,1);assert.equal(f.creates.length,0);assert.equal(f.opened.length,1);
});

test('unrelated library names have no effect on opening the original MIDI document', async () => {
  for (const path of ['D:/RootSound/project/canon.rootsound', 'D:\\RootSound\\project\\CANON.ROOTSOUND', 'D:/RootSound/project/canon/']) {
    const f=fixture(document('canon.mid'));
    f.directories.list=async()=>[{id:'renamed',name:'Different title',path}];
    await f.setup.open();
    assert.equal(f.creates.length,0);
    assert.deepEqual(f.entered,[[]]);
  }
});

test('source filenames produce valid names without paths, device names or cut surrogate pairs', () => {
  assert.equal(midiProjectName('C:/scores/canon.MID'),'canon');assert.equal(midiProjectName('CON.midi'),'导入 CON');
  assert.equal(midiProjectName('?.mid'),'_');assert.equal(midiProjectName('.mid'),'导入的 MIDI');
  assert.equal(midiProjectName('😀'.repeat(80)+'.mid'),'😀'.repeat(40));
});
