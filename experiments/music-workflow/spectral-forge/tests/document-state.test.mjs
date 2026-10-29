import test from 'node:test';
import assert from 'node:assert/strict';
import { createDocumentState } from '../web/document-state.mjs';
const validate = value => { if (!Number.isFinite(value.gain)) throw new Error('invalid'); return value; };

test('undo during a live gesture cancels only that gesture', () => {
  const doc = createDocumentState({ gain: .5 }, validate); doc.commit({ gain: .7 });
  doc.preview({ gain: .9 }); assert.equal(doc.undo().gain, .7);
  assert.equal(doc.canUndo, true); assert.equal(doc.undo().gain, .5);
});
test('many live previews commit as one undo and remain independent snapshots', () => {
  const doc = createDocumentState({ gain: .5, points: [{ x: 0, y: 1 }] }, validate);
  for (let n = 0; n < 100; n++) doc.preview({ gain: n / 100, points: [{ x: 0, y: 1 }] });
  assert.equal(doc.dirty, true); doc.commit();
  assert.equal(doc.undo().gain, .5); assert.equal(doc.canUndo, false); assert.equal(doc.dirty, false);
  assert.equal(doc.redo().gain, .99);
  const view = doc.read(); view.points[0].y = 99; assert.equal(doc.read().points[0].y, 1);
});
test('cancelled/invalid edits preserve content and redo, while saving an older snapshot keeps newer work dirty', () => {
  const doc = createDocumentState({ gain: .5 }, validate); doc.commit({ gain: .8 }); doc.undo();
  doc.preview({ gain: .2 }); doc.cancelPreview(); assert.equal(doc.read().gain, .5); assert.equal(doc.canRedo, true);
  assert.throws(() => doc.preview({ gain: NaN })); assert.equal(doc.read().gain, .5); assert.equal(doc.canRedo, true);
  const saved = doc.read(); doc.commit({ gain: .3 }); doc.markSaved(saved); assert.equal(doc.dirty, true);
  doc.markSaved(); assert.equal(doc.dirty, false);
});
test('history and resets are bounded without turning discard into a hidden commit', () => {
  const doc = createDocumentState({ gain: 0 }, validate, { maxEntries: 3 });
  for (let n = 1; n <= 10; n++) doc.commit({ gain: n });
  assert.equal(doc.undo().gain, 9); assert.equal(doc.undo().gain, 8); assert.equal(doc.undo().gain, 7);
  assert.equal(doc.canUndo, false);
  doc.preview({ gain: 6 }); doc.reset({ gain: 1 }); assert.equal(doc.dirty, false); assert.equal(doc.canUndo, false); assert.equal(doc.canRedo, false);
});
