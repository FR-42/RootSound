import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { PhraseBody, PhraseNote } from '../src/workstation/contracts/phrase.ts';
import { createMelodyNoteIndex, melodyFollowTarget } from '../src/workstation/modules/ui-rendering/melody-note-index.ts';

test('visible interval lookup retains overlapping holds and uses explicit seconds at any tempo',()=>{
  const notes: PhraseNote[] = Array.from({length:1000},(_,i)=>({id:String(i),startBeat:i*2,durationBeats:.25,frequencyHz:440,velocity:.7}));
  notes.push({id:'long',startBeat:0,durationBeats:1,durationSeconds:110,frequencyHz:220,velocity:.7});
  const part={id:'voice',name:'test',timbreId:'tone',notes};
  const body:PhraseBody={model:'note-phrase',version:1,timeUnit:'beat',tempoBpm:120,lengthBeats:2004,parts:[part]};
  const index=createMelodyNoteIndex(body,[part]);
  assert.deepEqual(index.visible(100,102).map(entry=>entry.note.id),['long','100','101','102']);
  assert.equal(index.byId.get('long')!.end,110);
  assert.equal(index.visible(1005,1006).length,0);
  assert.equal(index.visible(110.2,110.8).length,0);
  assert.deepEqual(index.startingBetween(100, 102).map(entry => entry.note.id), ['100', '101', '102'], 'trigger lookup excludes an earlier sustained note');
  assert.equal(index.startingBetween(100.1,100.9).length, 0);
});

test('follow target waits for the edge then places the head at the top, including the final page',()=>{
  assert.equal(melodyFollowTarget(8,0,10,100),undefined);
  assert.equal(melodyFollowTarget(9.9,0,10,100),undefined);
  assert.equal(melodyFollowTarget(9.99,0,10,100,.02),9.99);
  assert.equal(melodyFollowTarget(99,89,10,100),99);
  assert.equal(melodyFollowTarget(100,90,10,100),100);
  assert.equal(melodyFollowTarget(4,30,10,100),4);
  assert.equal(melodyFollowTarget(4,0,10,8),undefined);
});

test('a long sustain does not force a scan of thousands of expired notes', t => {
  const notes: PhraseNote[] = Array.from({ length: 32768 }, (_, i) => ({ id: String(i), startBeat: i * 2,
    durationBeats: .25, frequencyHz: 440, velocity: .7 }));
  notes.unshift({ id: 'long', startBeat: 0, durationBeats: 65536, frequencyHz: 220, velocity: .7 });
  const voice = { id: 'voice', name: 'test', timbreId: 'tone', notes };
  const body: PhraseBody = { model: 'note-phrase', version: 1, timeUnit: 'beat', tempoBpm: 120, lengthBeats: 65536, parts: [voice] };
  const index = createMelodyNoteIndex(body, [voice]);
  let reads = 0;
  for (const entry of index.byId.values()) {
    const start = entry.start, end = entry.end;
    Object.defineProperties(entry, { start: { get() { reads++; return start; } }, end: { get() { reads++; return end; } } });
  }
  assert.deepEqual(index.visible(16000, 16002).map(entry => entry.note.id), ['long', '16000', '16001', '16002']);
  assert(reads < 150, `narrow viewport inspected ${reads} interval fields`);
  t.diagnostic(`32769 notes: narrow overlap query read ${reads} interval fields`);
});

test('interval pruning matches a full overlap scan across mixed lengths and tempo changes', () => {
  const notes: PhraseNote[] = Array.from({ length: 4096 }, (_, i) => ({ id: String(i), startBeat: (i * 97) % 8192,
    durationBeats: 1 + i % 128, ...(i % 7 === 0 ? { durationSeconds: 100 } : {}), frequencyHz: 440, velocity: .7 }));
  const voice = { id: 'voice', name: 'test', timbreId: 'tone', notes };
  const body: PhraseBody = { model: 'note-phrase', version: 1, timeUnit: 'beat', tempoBpm: 120, lengthBeats: 9000,
    tempoSections: [{ id: 'fast', startBeat: 1000, tempoBpm: 240 }], parts: [voice] };
  const index = createMelodyNoteIndex(body, [voice]);
  const entries = [...index.byId.values()].sort((a, b) => a.start - b.start);
  for (let start = -1; start < 2600; start += 37) {
    assert.deepEqual(index.visible(start, start + 2), entries.filter(entry => entry.start <= start + 2 && entry.end >= start));
  }
  assert.deepEqual(createMelodyNoteIndex({ ...body, parts: [] }, []).visible(0, 1), []);
});
