import assert from 'node:assert/strict';
import test from 'node:test';
import type { PhraseBody, PhrasePart } from '../src/workstation/contracts/phrase.ts';
import { PHRASE_SECTION_MIN_RATIO, PHRASE_SECTION_MIN_HEIGHT, phraseSplitBounds, clampPhraseSplit, defaultPhraseSplit } from '../src/workstation/modules/ui-rendering/phrase-section-split.ts';

function phrase(melody: boolean, rhythm: boolean, unassigned = false): PhraseBody {
  const part = (id: string, active: boolean, section?: 'rhythm'): PhrasePart => ({ id, name: id, timbreId: `tone-${id}`,
    ...(section ? { section } : {}), ...(unassigned ? { unassigned: true } : {}),
    notes: active ? [{ id: `note-${id}`, startBeat: 0, durationBeats: 1, frequencyHz: 440, velocity: .7 }] : [] });
  return { model: 'note-phrase', version: 1, timeUnit: 'beat', tempoBpm: 120, lengthBeats: 16,
    parts: [part('melody', melody), part('rhythm', rhythm, 'rhythm')] };
}

test('split bounds are symmetric and preserve fifteen percent or sixty-four pixels whenever both sections fit', () => {
  assert.equal(PHRASE_SECTION_MIN_RATIO, .15); assert.equal(PHRASE_SECTION_MIN_HEIGHT, 64);
  for (const height of [0, 1, 64, 96, 128, 200, 400, 700, 2000]) {
    const bounds = phraseSplitBounds(height);
    const expected = height === 0 ? .15 : Math.min(.5, Math.max(.15, 64 / height));
    assert.equal(bounds.min, expected); assert.equal(bounds.max, 1 - expected);
    assert.equal(bounds.min + bounds.max, 1);
    assert(bounds.min > 0 && bounds.max < 1);
    if (height === 0) assert.deepEqual(bounds, { min: .15, max: .85 });
    else if (height >= 128) {
      assert(bounds.min * height >= 64 - 1e-9); assert((1 - bounds.max) * height >= 64 - 1e-9);
    } else assert.deepEqual(bounds, { min: .5, max: .5 });
  }
});

test('clamping shares the same limits in either drag direction and never hides a section', () => {
  for (const height of [100, 200, 700]) {
    const { min, max } = phraseSplitBounds(height);
    assert.equal(clampPhraseSplit(-100, height), min); assert.equal(clampPhraseSplit(100, height), max);
    assert.equal(clampPhraseSplit(min, height), min); assert.equal(clampPhraseSplit(max, height), max);
    assert.equal(clampPhraseSplit(.5, height), .5);
    assert(Math.abs(clampPhraseSplit(.37, height) + clampPhraseSplit(.63, height) - 1) < 1e-12);
  }
});

test('unmeasured or invalid layouts retain safe proportional bounds and invalid ratios remain finite', () => {
  for (const height of [0, -1, Number.NaN, Number.POSITIVE_INFINITY]) {
    assert.deepEqual(phraseSplitBounds(height), { min: .15, max: .85 });
  }
  for (const ratio of [Number.NaN, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY]) {
    const clamped = clampPhraseSplit(ratio, 700);
    assert(Number.isFinite(clamped) && clamped >= .15 && clamped <= .85);
  }
});

test('opening prioritizes creation independently of legacy note sections and never squeezes away the console', () => {
  for (const height of [0, 100, 128, 200, 256, 700]) for (const unassigned of [false, true]) {
    const expected = clampPhraseSplit(.75, height);
    assert.equal(defaultPhraseSplit(undefined, height), expected);
    for (const [melody, rhythm] of [[false, false], [true, false], [false, true], [true, true]] as const) {
      const body = phrase(melody, rhythm, unassigned); const before = structuredClone(body);
      assert.equal(defaultPhraseSplit(body, height), expected, `${melody}/${rhythm}, unassigned=${unassigned}, height=${height}`);
      assert.deepEqual(body, before);
    }
  }
  assert.equal(defaultPhraseSplit(phrase(false, false), 700), .75);
  assert.equal(defaultPhraseSplit(phrase(true, true), 100), .5);
  assert(Math.abs(defaultPhraseSplit(phrase(true, true), 200) - .68) < 1e-12);
});
