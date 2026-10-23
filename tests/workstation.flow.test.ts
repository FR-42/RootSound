import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { MaterialStorage, SaveResult } from '../src/workstation/contracts/content.ts';
import type { PlayableNotePlan } from '../src/workstation/contracts/sound.ts';
import { createMaterialLibrary } from '../src/workstation/modules/materials/public.ts';
import { createTimbreEditor } from '../src/workstation/modules/timbre/public.ts';

function memoryStorage(): MaterialStorage {
  let data: string | null = null;
  return { read: () => data, write: value => { data = value; } };
}

function saved(result: SaveResult) {
  assert.equal(result.status, 'saved');
  if (result.status !== 'saved') throw new Error('Expected a successful save.');
  return result;
}

function playable(plan: PlayableNotePlan): asserts plan is Extract<PlayableNotePlan, { kind: 'basic-synth' }> {
  assert.equal(plan.kind, 'basic-synth');
  if (plan.kind !== 'basic-synth') throw new Error('Expected basic synthesized sound');
  assert.ok(plan.sources.length > 0);
  assert.ok(plan.sources.every(source => Number.isFinite(source.frequencyRatio) && source.frequencyRatio > 0));
  assert.ok(plan.sources.every(source => Number.isFinite(source.level) && source.level >= 0));
  assert.ok(plan.sources.reduce((sum, source) => sum + source.level, 0) <= 1);
  assert.ok(Number.isFinite(plan.note.frequencyHz) && plan.note.frequencyHz > 0);
  assert.ok(plan.note.holdSeconds >= plan.envelope.attackSeconds);
  assert.ok(plan.envelope.releaseSeconds > 0);
  assert.ok(plan.level > 0 && plan.level <= 1);
}

test('a fresh timbre produces a preview without creating a phrase, song or project', () => {
  const library = createMaterialLibrary(memoryStorage());
  assert.equal(library.listContent().length, 0);
  const editor = createTimbreEditor(library);
  const draftBeforePreview = editor.read().draft;
  playable(editor.previewPlan());
  assert.deepEqual(editor.read().draft, draftBeforePreview);
  assert.equal(library.listContent().length, 0);
  assert.equal(library.listDrafts().length, 1);
  assert.deepEqual(draftBeforePreview.dependencies, []);
  assert.equal(draftBeforePreview.kind, 'rootsound.timbre');
});

test('creating and editing a sound changes its preview through the public editor', () => {
  const library = createMaterialLibrary(memoryStorage());
  const editor = createTimbreEditor(library);
  const previousDraftId = editor.read().draft.id;
  editor.create();
  assert.notEqual(editor.read().draft.id, previousDraftId);
  const initial = editor.previewPlan();
  playable(initial);
  editor.rename('  清晨的铃声  ');
  editor.setCharacter('clear');
  editor.setEnvelope(0.3, 1.4);
  editor.setLevel(0.42);
  const changed = editor.previewPlan();
  playable(changed);
  assert.equal(editor.read().draft.name, '清晨的铃声');
  const body = editor.read().body; assert.equal(body.model, 'basic-synth');
  if (body.model !== 'basic-synth') throw new Error('Expected basic synthesized sound');
  assert.equal(body.character, 'clear');
  assert.notDeepEqual(changed.sources, initial.sources);
  assert.deepEqual(changed.envelope, { attackSeconds: 0.3, releaseSeconds: 1.4 });
  assert.equal(changed.level, 0.42);
  assert.equal(editor.read().changed, true);
  assert.equal(library.listContent().length, 0);
});

test('saved sound settings and preview survive recreating both custody and editor', () => {
  const storage = memoryStorage();
  const library = createMaterialLibrary(storage);
  const editor = createTimbreEditor(library);
  editor.rename('远处的光');
  editor.setCharacter('bright');
  editor.setEnvelope(0.18, 1.7);
  editor.setLevel(0.56);
  const plan = editor.previewPlan();
  const result = saved(editor.save('new'));
  assert.equal(editor.read().changed, false);
  const reopenedLibrary = createMaterialLibrary(storage);
  const reopenedEditor = createTimbreEditor(reopenedLibrary);
  assert.deepEqual(reopenedLibrary.readContent(result.content.id), result.content);
  assert.equal(reopenedEditor.read().draft.sourceId, result.content.id);
  assert.deepEqual(reopenedEditor.previewPlan(), plan);
  assert.equal(reopenedEditor.read().draft.name, '远处的光');
  assert.equal(reopenedEditor.read().changed, false);
});

test('editing and recovering an unfinished draft keeps the saved sound intact', () => {
  const storage = memoryStorage();
  const library = createMaterialLibrary(storage);
  const editor = createTimbreEditor(library);
  const original = saved(editor.save('new')).content;
  editor.rename('仍在探索的声音');
  editor.setCharacter('clear');
  editor.setEnvelope(0.6, 2.3);
  const unfinished = editor.previewPlan();
  assert.equal(editor.read().changed, true);
  assert.deepEqual(library.readContent(original.id), original);
  const reopenedLibrary = createMaterialLibrary(storage);
  const reopenedEditor = createTimbreEditor(reopenedLibrary);
  assert.equal(reopenedEditor.read().draft.name, '仍在探索的声音');
  assert.deepEqual(reopenedEditor.previewPlan(), unfinished);
  assert.equal(reopenedEditor.read().changed, true);
  assert.deepEqual(reopenedLibrary.readContent(original.id), original);
});

test('older unsaved sounds stay discoverable and can be reopened after creating another', () => {
  const storage = memoryStorage();
  const library = createMaterialLibrary(storage);
  const editor = createTimbreEditor(library);
  editor.rename('尚未保存的第一声');
  editor.setCharacter('clear');
  editor.setEnvelope(0.25, 1.6);
  const firstId = editor.read().draft.id;
  const firstPlan = editor.previewPlan();
  editor.create();
  editor.rename('尚未保存的第二声');
  editor.setCharacter('bright');
  const secondId = editor.read().draft.id;
  const secondPlan = editor.previewPlan();
  assert.notEqual(firstId, secondId);
  assert.deepEqual(new Set(editor.read().unfinishedDrafts.map(draft => draft.id)), new Set([firstId, secondId]));
  assert.equal(library.listContent().length, 0);
  editor.openDraft(firstId);
  assert.equal(editor.read().draft.name, '尚未保存的第一声');
  assert.deepEqual(editor.previewPlan(), firstPlan);
  editor.openDraft(secondId);
  assert.deepEqual(editor.previewPlan(), secondPlan);
  const reopenedEditor = createTimbreEditor(createMaterialLibrary(storage));
  assert.ok(reopenedEditor.read().unfinishedDrafts.some(draft => draft.id === firstId));
  reopenedEditor.openDraft(firstId);
  assert.deepEqual(reopenedEditor.previewPlan(), firstPlan);
});

test('unknown same-version timbre fields are rejected without being discarded from custody', () => {
  const storage = memoryStorage();
  const library = createMaterialLibrary(storage);
  const editor = createTimbreEditor(library);
  const draftId = editor.read().draft.id;
  const extendedBody = { ...editor.read().body, futureSettings: { detail: '必须保留' } };
  library.updateDraft(draftId, { body: extendedBody });
  const original = library.readDraft(draftId);
  assert.throws(() => editor.setCharacter('bright'), /尚不支持/);
  assert.throws(() => editor.openDraft(draftId), /尚不支持/);
  assert.throws(() => createTimbreEditor(library), /尚不支持/);
  assert.deepEqual(library.readDraft(draftId), original);
  assert.deepEqual(createMaterialLibrary(storage).readDraft(draftId)?.body, extendedBody);
  assert.equal(library.listContent().length, 0);
});

test('save as creates a new identity while retaining the original and its references', () => {
  const library = createMaterialLibrary(memoryStorage());
  const editor = createTimbreEditor(library);
  editor.rename('同名的声音');
  const original = saved(editor.save('new')).content;
  const projectDraft = library.createDraft({
    kind: 'rootsound.project', schemaVersion: 1, owner: 'projects', name: '使用原音色的工程',
    dependencies: [original.id], body: { note: '此工程只引用原音色。' },
  });
  const project = saved(library.saveDraft(projectDraft.id, 'new')).content;
  editor.setCharacter('bright');
  const copy = saved(editor.save('new')).content;
  assert.notEqual(copy.id, original.id);
  assert.equal(copy.name, original.name);
  assert.deepEqual(library.readContent(original.id), original);
  assert.deepEqual(library.readContent(project.id)?.dependencies, [original.id]);
  assert.equal(editor.read().draft.sourceId, copy.id);
  assert.equal(editor.read().savedSounds.length, 2);
  assert.equal(editor.read().changed, false);
});

test('overwriting a referenced sound waits for an explicit impact confirmation', () => {
  const library = createMaterialLibrary(memoryStorage());
  const editor = createTimbreEditor(library);
  const original = saved(editor.save('new')).content;
  const projectDraft = library.createDraft({
    kind: 'rootsound.project', schemaVersion: 1, owner: 'projects', name: '未打开的工程',
    dependencies: [original.id], body: {},
  });
  const project = saved(library.saveDraft(projectDraft.id, 'new')).content;
  editor.setCharacter('bright');
  editor.setEnvelope(0.2, 1.2);
  const previewBeforeSave = editor.previewPlan();
  const impact = editor.save('overwrite');
  assert.equal(impact.status, 'needs-confirmation');
  if (impact.status !== 'needs-confirmation') throw new Error('Expected impact confirmation.');
  assert.deepEqual(impact.affectedContent.map(item => item.id), [project.id]);
  assert.deepEqual(library.readContent(original.id), original);
  assert.equal(editor.read().changed, true);
  const replaced = saved(editor.save('overwrite', impact.confirmation)).content;
  assert.equal(replaced.id, original.id);
  assert.equal(replaced.revision, original.revision + 1);
  assert.deepEqual(library.readContent(project.id), project);
  assert.deepEqual(editor.previewPlan(), previewBeforeSave);
  assert.equal(editor.read().changed, false);
});
