import assert from 'node:assert/strict';
import { test } from 'node:test';
import { initialPhraseViewport, phrasePitchRow } from '../src/workstation/modules/ui-rendering/phrase-viewport.ts';
import { createMaterialLibrary } from '../src/workstation/modules/materials/public.ts';
import { createTimbrePlayback } from '../src/workstation/modules/timbre/public.ts';
import { createPhraseEditor } from '../src/workstation/modules/phrase/public.ts';

const library = createMaterialLibrary();
const phrase = createPhraseEditor(library, createTimbrePlayback(library));
const keys = phrase.keyboard().reverse();

test('incoming low, high and boundary pitches focus visible rows in the same full keyboard without retuning', () => {
  for (const frequencies of [[54.99993, 61.73541, 73.4123], [1100.2345, 1399.37, 1400.379], [220.123, 277.18, 329.62], [20, 21.123], [4900.123, 5000]]) {
    const original = [...frequencies]; const viewport = initialPhraseViewport(frequencies, keys);
    for (const frequency of frequencies) {
      const row = phrasePitchRow(frequency, keys);
      assert(row * 25 >= viewport.scrollTop && (row + 1) * 25 <= viewport.scrollTop + 271);
    }
    assert.deepEqual(frequencies, original);
  }
});

test('an unusually wide melody keeps the largest useful group visible rather than opening an empty middle register', () => {
  const frequencies = [55, 60, 65, 70, 75, 80, 1400]; const viewport = initialPhraseViewport(frequencies, keys);
  assert(frequencies.filter(value => { const top = phrasePitchRow(value, keys) * 25;
    return top >= viewport.scrollTop && top + 25 <= viewport.scrollTop + 271;
  }).length >= 6);
});

test('empty or unusable pitch hints show middle C and adapt focus to the actual scroller height', () => {
  const middleC = phrase.keyboard().find(key => key.label === 'C4')!.frequencyHz;
  for (const height of [270, 300, 490]) {
    const viewport = initialPhraseViewport([], keys, height);
    const row = phrasePitchRow(middleC, keys); const visibleHeight = height - 29;
    assert.equal(row * 25 + 12.5 - viewport.scrollTop, visibleHeight / 2);
    assert.deepEqual(initialPhraseViewport([NaN, Infinity, -1, 0], keys, height), viewport);
  }
});

test('every full-keyboard row has a stable mapping including exact-frequency endpoints', () => {
  keys.forEach((key, index) => assert.equal(phrasePitchRow(key.frequencyHz, keys), index));
  assert.equal(phrasePitchRow(20, keys), keys.length - 1);
  assert.equal(phrasePitchRow(5000, keys), 0);
  const custom = 220.123456;
  assert.equal(keys[phrasePitchRow(custom, keys)]!.label, 'A3');
  assert.equal(custom, 220.123456);
  assert.deepEqual(initialPhraseViewport([], []), { scrollTop: 0 });
});
