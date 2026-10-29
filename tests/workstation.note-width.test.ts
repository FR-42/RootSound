import assert from 'node:assert/strict';
import test from 'node:test';
import type { PhraseBody, PhraseNote } from '../src/workstation/contracts/phrase.ts';
import { melodyGrid, melodyNoteRect, melodyScale } from '../src/workstation/modules/ui-rendering/melody-geometry.ts';

const keys = [{ label: 'C4', frequencyHz: 261.6255653005986, accidental: false }];
const close = (actual: number, expected: number) => assert(Math.abs(actual - expected) < 1e-8);
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
  for (const n of [0, 1, 10, -1, 2.5, NaN, Infinity, null, '3']) assert.throws(() => melodyGrid(8, 120, n as number), /每拍格数/);
});
