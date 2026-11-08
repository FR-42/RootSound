import assert from 'node:assert/strict';
import test from 'node:test';
import type { PhraseBody, PhraseNote } from '../src/workstation/contracts/phrase.ts';
import { readPhraseBody } from '../src/workstation/modules/phrase/public.ts';
import { melodyGrid, melodyNoteRect, melodyScale, initialMelodyView, melodyDetailGrid, melodyDetailSteps, melodyScoreGrid, melodyPitchTop, melodyPitchHeight, melodyPitchAt } from '../src/workstation/modules/ui-rendering/melody-geometry.ts';

const keys = [{ label: 'C4', frequencyHz: 261.6255653005986, accidental: false }];
const close = (actual: number, expected: number) => assert(Math.abs(actual - expected) < 1e-8);

test('explicit subdivision editing exposes configured cells on a fixed time ruler', () => {
  const view={leftSeconds:0,zoom:2.048,rowHeight:32};
  for (const steps of [2,3,4,9]) {
    const lines=melodyDetailGrid(2,120,steps,view,1000,4,0,0);
    assert.deepEqual(lines.filter(line=>line.beat).map(line=>line.seconds),[0,.5,1,1.5,2]);
    {
      const cells=lines.filter(line=>line.cell && line.seconds<.5);
      assert.equal(cells.length,steps);
      cells.forEach((line,index)=>close(line.seconds,index*.5/steps));
    }
  }
});

test('changing only subdivisions preserves every beat position and the full note rectangle at any zoom', () => {
  const note:PhraseNote={id:'n',startBeat:.173,durationBeats:.713,durationSeconds:.413,frequencyHz:261.6255653005986,velocity:.75};
  for (const zoom of [.25,1,4,32]) {
    const view={leftSeconds:.13,zoom,rowHeight:24}, base=body(120);
    const beats=(n:number)=>melodyDetailGrid(8,120,n,view,800,4,0,0).filter(line=>line.beat).map(line=>line.seconds);
    for (const n of [2,3,4,5,9]) {
      assert.deepEqual(beats(n),beats(4));
      assert.deepEqual(melodyNoteRect(note,{...base,stepsPerBeat:n},keys,view,800),melodyNoteRect(note,base,keys,view,800));
    }
  }
});

test('six-beat bars with a three-beat pickup preserve notes and mark the real downbeats',()=>{
  const score=readPhraseBody({...body(120),beatsPerBar:6,pickupBeats:3});
  assert.equal(score.beatsPerBar,6);assert.equal(score.pickupBeats,3);
  const lines=melodyDetailGrid(8,120,4,{leftSeconds:0,zoom:4,rowHeight:32},1000,6,3);
  assert.deepEqual(lines.filter(line=>line.bar).map(line=>line.seconds),[1.5]);
  assert.throws(()=>readPhraseBody({...body(120),beatsPerBar:6,pickupBeats:6}));
  assert.throws(()=>readPhraseBody({...body(120),beatsPerBar:6.5}));
});

test('detail grid reveals beats, configured cells and finer cells in successive zoom levels', () => {
  for (const stepsPerBeat of [2,3,4,9]) {
    const score={...body(120),stepsPerBeat},view=initialMelodyView(score,1000);
    const lines=(zoom:number)=>melodyDetailGrid(8,120,stepsPerBeat,{...view,zoom},1000);
    assert(lines(view.zoom).every(line=>line.beat));
    assert.equal(melodyDetailSteps(120,stepsPerBeat,melodyScale({...view,zoom:view.zoom*2},1000,8)),stepsPerBeat);
    assert(lines(view.zoom*2).some(line=>!line.beat));
    const finer=lines(view.zoom*2*stepsPerBeat);close(finer[1]!.seconds-finer[0]!.seconds,.5/stepsPerBeat**2);
    const forced = melodyDetailSteps(120, stepsPerBeat, 2 * 48 * stepsPerBeat ** 3, 0);
    assert.equal(forced, stepsPerBeat ** 3);
    assert(finer.filter(line=>line.bar).every(line=>line.seconds%2===0));
    assert.equal(score.stepsPerBeat,stepsPerBeat);
  }
});

test('deep zoom generates only visible lines for long music and retains configured subdivision multiples', () => {
  for(const n of [2,3,9]) {
    const view={leftSeconds:300,zoom:256,rowHeight:32},width=2000;
    const divisions=melodyDetailSteps(40,n,melodyScale(view,width,1536));
    assert.equal(divisions%n,0);assert(divisions<=4096);
    const lines=melodyDetailGrid(1536,40,n,view,width);
    assert(lines.length<50);assert(lines.length>0);
    assert(lines.every(line=>line.seconds>=299.999&&line.seconds<=300+8/view.zoom+.001));
  }
});

test('tempo rolls share a subdivision detail level while retaining their beat positions', () => {
  const score = { ...body(60), tempoSections: [{ id: 'fast', startBeat: 4, tempoBpm: 120 }] };
  const view = { leftSeconds: 3, zoom: 1, rowHeight: 32 };
  const beats = melodyScoreGrid(score, view, 2000);
  assert(beats.every(line => line.beat));
  assert.deepEqual(beats.slice(0, 4).map(line => line.seconds), [3, 4, 4.5, 5]);
  const cells = melodyScoreGrid(score, view, 4000);
  assert(cells.some(line => !line.beat && line.seconds === 3.25));
  assert(cells.some(line => !line.beat && line.seconds === 4.125));
  assert(!cells.some(line => line.seconds === 3.125));
  assert(melodyScoreGrid(score, view, 100, 0).every(line => line.beat));
  const mixed = { ...score, stepsPerBeat: 3, tempoSections: [{ ...score.tempoSections[0]!, stepsPerBeat: 2 }] };
  const finer = melodyScoreGrid(mixed, view, 6500);
  assert(finer.some(line => Math.abs(line.seconds - (3 + 1 / 9)) < 1e-8));
  assert(finer.some(line => line.seconds === 4.125));
});

test('equal black and white rows share exact boundaries for drawing, hit testing, notes and zoom', () => {
  const keyboard=[{label:'D4',frequencyHz:293.6647679174076,accidental:false},{label:'C#4',frequencyHz:277.1826309768721,accidental:true},keys[0]!];
  for(const height of [12,32,44]) for(let row=0;row<keyboard.length;row++) {
    const top=melodyPitchTop(keyboard,row,height),extent=melodyPitchHeight(keyboard,row,height);
    close(extent,height);
    close(melodyPitchTop(keyboard,row+1,height),top+extent);
    assert.equal(melodyPitchAt(keyboard,top+.001,height),row);
    assert.equal(melodyPitchAt(keyboard,top+extent-.001,height),row);
    const rect=melodyNoteRect({id:'n',startBeat:0,durationBeats:.0002,durationSeconds:.0001,frequencyHz:keyboard[row]!.frequencyHz,velocity:1},body(120),keyboard,{leftSeconds:0,zoom:256,rowHeight:height},1000);
    close(rect.y,top+1);close(rect.height,extent-2);assert(rect.width>0);
  }
});
function body(tempoBpm: number): PhraseBody {
  return { model: 'note-phrase', version: 1, timeUnit: 'beat', tempoBpm, lengthBeats: 16,
    parts: [{ id: 'piano', name: '钢琴', timbreId: 'voice', notes: [] }] };
}

test('one-cell notes stay within their actual grid interval at high tempo and small horizontal zoom', () => {
  for (const tempo of [40, 120, 240]) for (const zoom of [.25, .5, 1, 4]) for (const width of [320, 800]) {
    const value = body(tempo); const view = { leftSeconds: 0, zoom, rowHeight: 24 };
    const note: PhraseNote = { id: 'note', startBeat: .25, durationBeats: .25, durationSeconds: 60 / tempo / 4,
      frequencyHz: keys[0]!.frequencyHz, velocity: .75 };
    const rect = melodyNoteRect(note, value, keys, view, width);
    const grid = melodyGrid(16 * 60 / tempo, tempo); const scale = melodyScale(view, width, 16 * 60 / tempo);
    close(rect.x, grid[1]!.seconds * scale);
    close(rect.x + rect.width, grid[2]!.seconds * scale);
    assert(rect.width > 0);
    assert.deepEqual(note.durationSeconds, 60 / tempo / 4, 'drawing never changes the sound duration');
  }
});

test('longer held notes retain their real multi-cell span rather than being clipped to one cell', () => {
  const value = body(240); const view = { leftSeconds: 0, zoom: .25, rowHeight: 24 };
  const note: PhraseNote = { id: 'held', startBeat: 1, durationBeats: .25, durationSeconds: .125,
    frequencyHz: keys[0]!.frequencyHz, velocity: .75 };
  const rect = melodyNoteRect(note, value, keys, view, 320);
  const grid = melodyGrid(4, 240); const scale = melodyScale(view, 320, 4);
  close(rect.x, grid[4]!.seconds * scale);
  close(rect.x + rect.width, grid[6]!.seconds * scale);
  assert(rect.width < 6, 'short notes are never expanded by a fixed pixel minimum');
});

test('non-four subdivisions draw exact cells with independent beat/bar flags and never resize existing held notes', () => {
  for (const n of [2, 3, 5, 9]) for (const tempo of [40, 93.7, 212, 240]) {
    const value = { ...body(tempo), stepsPerBeat: n }, duration = value.lengthBeats * 60 / tempo;
    const lines = melodyGrid(duration, tempo, n); assert.equal(lines.length, 16 * n + 1);
    for (let index = 0; index <= 16 * n; index++) {
      close(lines[index]!.seconds, index / n * 60 / tempo);
      assert.equal(lines[index]!.beat, index % n === 0); assert.equal(lines[index]!.bar, index % (4 * n) === 0);
    }
    const view = { leftSeconds: 0, zoom: .25, rowHeight: 24 }, scale = melodyScale(view, 320, duration);
    const note: PhraseNote = { id: 'cell', startBeat: 1 / n, durationBeats: 1 / n, durationSeconds: 60 / tempo / n,
      frequencyHz: keys[0]!.frequencyHz, velocity: .75 };
    const rect = melodyNoteRect(note, value, keys, view, 320);
    close(rect.x, lines[1]!.seconds * scale); close(rect.x + rect.width, lines[2]!.seconds * scale);
    const held = { ...note, startBeat: .173, durationBeats: .713, durationSeconds: .413 };
    assert.deepEqual(melodyNoteRect(held, value, keys, view, 320), melodyNoteRect(held, { ...value, stepsPerBeat: 4 }, keys, view, 320));
  }
  for (const n of [0, 1, 10, -1, 2.5, NaN, Infinity, null, '3']) assert.throws(() => melodyGrid(8, 120, n as number), /每拍细分/);
});
