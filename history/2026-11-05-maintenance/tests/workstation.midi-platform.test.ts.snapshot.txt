import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createDesktopProjectDirectories, type NativeProjectDirectoriesBridge } from '../src/workstation/app/platform/project-directories.ts';
import { MAX_MIDI_FILE_BYTES } from '../src/workstation/contracts/midi.ts';

const midi = Uint8Array.of(77,84,104,100,0,0,0,6,0,0,0,1,1,224,77,84,114,107,0,0,0,4,0,255,47,0);
const encode = (bytes: Uint8Array) => Buffer.from(bytes).toString('base64');
const raw = (value: unknown) => Promise.resolve(JSON.stringify(value));
function fixture(value: unknown = { status: 'midi', name: '旋律.MIDI', base64: encode(midi) }) {
  let reply = value; const calls: string[] = [];
  const bridge: NativeProjectDirectoriesBridge = {
    Read: () => raw({ status: 'ready', defaultLocation: 'D:/RootSound/project' }),
    ChooseLocation: () => raw({ status: 'cancelled' }),
    Create: async () => { calls.push('create'); throw new Error('Selection must not create a project'); },
    Open: () => { calls.push('open'); return raw(reply); },
    OpenKnown: () => { calls.push('known'); return raw(reply); },
  };
  return { port: createDesktopProjectDirectories(bridge), bridge, calls, set(value: unknown) { reply = value; } };
}

test('native MIDI selection decodes exact owned bytes without creating or activating a project', async () => {
  const f = fixture();
  const selected = await f.port.open(); assert.equal(selected.status, 'midi');
  if (selected.status !== 'midi') throw new Error('Expected MIDI selection');
  assert.equal(selected.name, '旋律.MIDI'); assert.deepEqual(selected.bytes, midi); assert.deepEqual(f.calls, ['open']);
  selected.bytes[0] = 0;
  const repeated = await f.port.open(); assert.equal(repeated.status, 'midi');
  if (repeated.status === 'midi') assert.deepEqual(repeated.bytes, midi);
});

test('both MIDI extensions are accepted case-insensitively; invalid names fail before import', async () => {
  const f = fixture();
  for (const name of ['name.mid','name.midi','name.MID','name.MiDi']) {
    f.set({status:'midi',name,base64:encode(midi)}); assert.equal((await f.port.open()).status,'midi');
  }
  for (const name of ['', 'track.wav', 'nested/track.mid', 'nested\\track.mid', 'bad\u0000.mid', 'a'.repeat(252)+'.mid']) {
    f.set({status:'midi',name,base64:encode(midi)}); await assert.rejects(f.port.open(), /名称无效/);
  }
});

test('invalid, truncated, noncanonical and oversized base64 cannot reach project creation', async () => {
  const f = fixture();
  for (const base64 of [null,'','@@@@','AAAA\n','AAAA===',encode(midi).slice(1),encode(midi).slice(0,-1)]) {
    f.set({status:'midi',name:'track.mid',base64}); await assert.rejects(f.port.open(), /MIDI/);
  }
  // Same decoded bytes, invalid unused padding bits: atob accepts it, canonical transport must not.
  const canonical = encode(midi), end = canonical.slice(-4); assert.equal(end, 'LwA=');
  f.set({status:'midi',name:'track.mid',base64:canonical.slice(0,-4)+'LwB='});
  await assert.rejects(f.port.open(), /MIDI/);
  f.set({status:'midi',name:'track.mid',base64:'A'.repeat(Math.ceil(MAX_MIDI_FILE_BYTES/3)*4+4)});
  await assert.rejects(f.port.open(), /10 MiB/); assert(!f.calls.includes('create'));
});

test('transport header validation rejects spoofed files and declared header lengths beyond byte boundaries', async () => {
  const f = fixture();
  const wrongTag = midi.slice(); wrongTag[0]=0;
  const undersizedHeader = midi.slice(); new DataView(undersizedHeader.buffer).setUint32(4,5,false);
  const hugeHeader = midi.slice(); new DataView(hugeHeader.buffer).setUint32(4,0xffffffff,false);
  for (const bytes of [midi.slice(0,13),wrongTag,undersizedHeader,hugeHeader]) {
    f.set({status:'midi',name:'track.mid',base64:encode(bytes)}); await assert.rejects(f.port.open(), /MIDI/);
  }
});

test('cancellation and failures preserve the ordinary project picker protocol and allow retry', async () => {
  const f = fixture({status:'cancelled'}); assert.deepEqual(await f.port.open(),{status:'cancelled'});
  f.set({status:'error',message:'文件被占用'}); await assert.rejects(f.port.open(), /文件被占用/);
  f.set({status:'opened',project:{id:'existing',name:'原工程',path:'D:/RootSound/project/原工程.rootsound'}});
  assert.deepEqual(await f.port.open(),{status:'opened',project:{id:'existing',name:'原工程',path:'D:/RootSound/project/原工程.rootsound'}});
  f.set({status:'midi',name:'retry.mid',base64:encode(midi)}); assert.equal((await f.port.open()).status,'midi');
  assert(!f.calls.includes('create'));
});

test('a known project path cannot be replaced by a MIDI selection response', async () => {
  const f = fixture(); await assert.rejects(f.port.open('D:/RootSound/project/known.rootsound'), /不能被替换/);
  assert.deepEqual(f.calls,['known']);
});
