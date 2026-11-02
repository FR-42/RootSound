import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createMusicWorkspaceState } from '../src/workstation/app/platform/music-workspace-state.ts';
import type { MusicWorkspaceState } from '../src/workstation/contracts/workspace.ts';

const state: MusicWorkspaceState = { viewport: { leftSeconds: 2.5, zoom: 6, top: 720, rowHeight: 38 },
  selection: { partId: 'p', noteId: 'n' }, playheadSeconds: 4.5, entryOctave: 5, entryToneId: 'p', noteLengths: { p: .173 } };

test('project-local context survives reopening, isolates projects and returns owned snapshots', () => {
  const records = new Map<string,string>();
  const storage = { getItem: (key: string) => records.get(key) ?? null, setItem(key: string,value: string) { records.set(key,value); } };
  const first = createMusicWorkspaceState(storage,'project-a'); assert.equal(first.read(),undefined);
  first.write(state); assert.deepEqual(createMusicWorkspaceState(storage,'project-a').read(),state);
  assert.equal(createMusicWorkspaceState(storage,'project-b').read(),undefined);
  const copy=first.read()!;copy.viewport.top=0;copy.noteLengths.p=2;assert.deepEqual(first.read(),state);
  const serialized=[...records.values()][0]!;assert(serialized.length<1024);assert(!serialized.includes('durationBeats'));
});

test('bad or unavailable local context cannot prevent music opening', () => {
  for (const raw of ['{bad',JSON.stringify({version:1,viewport:{zoom:0}}),JSON.stringify({...state,version:2})]) {
    const port=createMusicWorkspaceState({getItem:()=>raw,setItem(){}},'p');assert.equal(port.read(),undefined);
  }
  const port=createMusicWorkspaceState({getItem(){throw new Error('blocked');},setItem(){throw new Error('blocked');}},'p');
  assert.equal(port.read(),undefined);assert.doesNotThrow(()=>port.write(state));assert.deepEqual(port.read(),state);
});
