import assert from 'node:assert/strict';
import test from 'node:test';
import { MELODY_ENTRY_KEYS, melodyEntryKey, melodyEntryPitch, nextMelodyEntryStep } from '../src/workstation/modules/ui-rendering/melody-key-entry.ts';

const close = (actual: number | undefined, expected: number) => {
  assert.notEqual(actual, undefined); assert(Math.abs(actual! - expected) <= Math.max(1, expected) * 1e-12);
};

test('the twelve typing keys follow one chromatic C4–B4 octave including accidental pitches', () => {
  assert.equal(MELODY_ENTRY_KEYS, 'cfvgbnjmk,l.');
  const expectedMidi = [60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71];
  [...MELODY_ENTRY_KEYS].forEach((key, index) => {
    assert(melodyEntryKey(key)); assert(melodyEntryKey(key.toUpperCase()));
    close(melodyEntryPitch(key, 4), 440 * 2 ** ((expectedMidi[index]! - 69) / 12));
    assert.equal(melodyEntryPitch(key.toUpperCase(), 4), melodyEntryPitch(key, 4));
    close(melodyEntryPitch(key, 5), melodyEntryPitch(key, 4)! * 2);
  });
  assert.equal(melodyEntryPitch(',', 4), 440);
  for (const key of ['', ' ', 'cc', 'z', 'x', ';', '<', '>']) {
    assert.equal(melodyEntryKey(key), false); assert.equal(melodyEntryPitch(key, 4), undefined);
  }
});

test('octave edges respect the shared playable range without silently transposing unsupported notes', () => {
  assert.equal(melodyEntryPitch('c', 0), undefined); assert.equal(melodyEntryPitch('g', 0), undefined);
  close(melodyEntryPitch('b', 0), 20.601722307054366); close(melodyEntryPitch(',', 0), 27.5);
  close(melodyEntryPitch('c', 8), 4186.009044809578); close(melodyEntryPitch('g', 8), 4978.031739553295);
  assert.equal(melodyEntryPitch('b', 8), undefined); assert.equal(melodyEntryPitch('.', 8), undefined);
  for (const octave of [-1, 9, 4.5, NaN, Infinity]) assert.equal(melodyEntryPitch('c', octave), undefined);
});

test('entry uses the strictly next quarter beat at supported tempos and preserves one-cell seconds duration', () => {
  for (const tempo of [40, 60, 93, 120, 143.5, 240]) {
    const cellSeconds = 60 / tempo / 4;
    const first = nextMelodyEntryStep(0, tempo)!;
    assert.equal(first.startBeat, .25); close(first.seconds, cellSeconds); close(first.durationSeconds, cellSeconds); assert(first.canWrite);
    const second = nextMelodyEntryStep(first.seconds, tempo)!;
    assert.equal(second.startBeat, .5); close(second.seconds, 2 * cellSeconds);
    const between = nextMelodyEntryStep(cellSeconds * .4, tempo)!;
    assert.equal(between.startBeat, .25);
    assert.deepEqual(nextMelodyEntryStep(-10, tempo), first, 'a defensive negative head starts from the left edge');
  }
});

test('tiny seconds round-trip errors never repeat a line or skip an extra cell', () => {
  for (const tempo of [60, 93, 120, 143.5, 240]) for (const cell of [1, 7, 31, 62]) {
    const seconds = cell / 4 * 60 / tempo;
    for (const cellError of [-1e-11, 0, 1e-11]) {
      const next = nextMelodyEntryStep(seconds + cellError / 4 * 60 / tempo, tempo)!;
      assert.equal(next.startBeat, (cell + 1) / 4);
    }
    const trulyBefore = nextMelodyEntryStep(seconds - 1e-5 / 4 * 60 / tempo, tempo)!;
    assert.equal(trulyBefore.startBeat, cell / 4, 'a real position before a line still advances to that line');
  }
});

test('the final cell is writable while the end boundary is rest-only and never wraps', () => {
  for (const tempo of [60, 120, 240]) {
    const lastNote = nextMelodyEntryStep(15.5 * 60 / tempo, tempo)!;
    assert.equal(lastNote.startBeat, 15.75); assert.equal(lastNote.canWrite, true);
    const finalRest = nextMelodyEntryStep(lastNote.seconds, tempo)!;
    assert.equal(finalRest.startBeat, 16); assert.equal(finalRest.canWrite, false);
    close(finalRest.seconds, 16 * 60 / tempo);
    assert.equal(nextMelodyEntryStep(finalRest.seconds, tempo), undefined);
    assert.equal(nextMelodyEntryStep(finalRest.seconds + 10, tempo), undefined);
    assert.equal(nextMelodyEntryStep(16 * 60 / tempo, tempo, 64)!.startBeat, 16.25, 'an extended phrase accepts entry beyond the initial four bars');
    for (const length of [20,64]) {
      const tail=nextMelodyEntryStep((length-.5)*60/tempo,tempo,length)!;assert.equal(tail.startBeat,length-.25);assert.equal(tail.canWrite,true);
      const end=nextMelodyEntryStep(tail.seconds,tempo,length)!;assert.equal(end.startBeat,length);assert.equal(end.canWrite,false);assert.equal(nextMelodyEntryStep(end.seconds,tempo,length),undefined);
    }
  }
});

test('short legacy phrase bounds and invalid coordinates never create an out-of-range step', () => {
  const last = nextMelodyEntryStep(7.5 * .5, 120, 8)!; assert.equal(last.startBeat, 7.75); assert.equal(last.canWrite, true);
  const end = nextMelodyEntryStep(last.seconds, 120, 8)!; assert.equal(end.startBeat, 8); assert.equal(end.canWrite, false);
  assert.equal(nextMelodyEntryStep(end.seconds, 120, 8), undefined);
  const partial = nextMelodyEntryStep(0, 120, .3)!; assert.equal(partial.startBeat, .25); assert.equal(partial.canWrite, false);
  assert.equal(nextMelodyEntryStep(partial.seconds, 120, .3), undefined);
  for (const value of [NaN, Infinity, -Infinity]) assert.equal(nextMelodyEntryStep(value, 120), undefined);
  for (const tempo of [NaN, Infinity, 0, -1, 39, 241]) assert.equal(nextMelodyEntryStep(0, tempo), undefined);
  for (const length of [NaN, Infinity, 0, -1]) assert.equal(nextMelodyEntryStep(0, 120, length), undefined);
});
