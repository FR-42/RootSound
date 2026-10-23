import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { ReferenceSession } from '../src/workstation/contracts/references.ts';
import { beginOrResumeReferenceEdit, pendingReferenceEdits } from '../src/workstation/modules/ui-rendering/reference-activity.ts';
import { createMaterialLibrary, createReferenceEditing } from '../src/workstation/modules/materials/public.ts';
import { createCoCreation, createCoCreationReferenceAdapter } from '../src/workstation/modules/co-creation/public.ts';
import { createPhraseReferenceAdapter, readPhraseBody } from '../src/workstation/modules/phrase/public.ts';
import { createTimbreEditor, createTimbreReferenceAdapter } from '../src/workstation/modules/timbre/public.ts';

function session(draftId: string, rootId: string, rootType: 'draft' | 'content' = 'draft'): ReferenceSession {
  return { draftId, targetId: 'saved', targetKind: 'rootsound.phrase',
    context: { root: { type: rootType, id: rootId }, path: ['current'] } };
}

test('pending edits include a phrase and its nested sound, while unrelated drafts do not block a new direction', () => {
  const phrase = session('phrase-edit', 'journey'); const sound = session('sound-edit', 'phrase-edit');
  const unrelated = session('other-edit', 'song'); const saved = session('saved-edit', 'journey', 'content');
  assert.deepEqual(pendingReferenceEdits({ sessions: () => [phrase, sound, unrelated, saved] }, 'journey'), [phrase, sound]);
  assert.deepEqual(pendingReferenceEdits({ sessions: () => [unrelated, saved] }, 'journey'), []);
  assert.deepEqual(pendingReferenceEdits(undefined, 'journey'), []);
});

test('invalid cyclic editing links fail safely instead of hanging or reporting a root ready', () => {
  assert.throws(() => pendingReferenceEdits({ sessions: () => [session('a', 'b'), session('b', 'a')] }, 'journey'), /关联无效/);
});

test('returning to an unfinished phrase and sound resumes both edits instead of creating hidden duplicates', () => {
  const library = createMaterialLibrary(); const co = createCoCreation(library); co.chooseIdea('light', co.read().token);
  const references = createReferenceEditing(library, [createCoCreationReferenceAdapter(), createPhraseReferenceAdapter(), createTimbreReferenceAdapter()]);
  const rootId = co.read().draft.id;
  const phraseContext = { root: { type: 'draft' as const, id: rootId }, path: ['current'] };
  const phrase = beginOrResumeReferenceEdit(references, phraseContext);
  const partId = readPhraseBody(library.readDraft(phrase.draftId)!.body).parts[0]!.id;
  const soundContext = { root: { type: 'draft' as const, id: phrase.draftId }, path: [partId] };
  const sound = beginOrResumeReferenceEdit(references, soundContext);
  const editor = createTimbreEditor(library); editor.openDraft(sound.draftId); editor.setLevel(0.123456789);
  const count = library.listDrafts().length;
  assert.equal(beginOrResumeReferenceEdit(references, phraseContext).draftId, phrase.draftId);
  assert.equal(beginOrResumeReferenceEdit(references, soundContext).draftId, sound.draftId);
  assert.equal(library.listDrafts().length, count); assert.equal(pendingReferenceEdits(references, rootId).length, 2);
  assert.equal(references.apply(sound.draftId).status, 'applied');
  assert.equal(pendingReferenceEdits(references, rootId).length, 1);
  assert.equal(references.apply(phrase.draftId).status, 'applied');
  assert.equal(pendingReferenceEdits(references, rootId).length, 0);
  const result = readPhraseBody(co.read().currentPhrase!.body);
  assert.equal((library.readContent(result.parts[0]!.timbreId)!.body as { level: number }).level, 0.123456789);
});
