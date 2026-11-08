import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { MaterialStorage, SaveResult } from '../src/workstation/contracts/content.ts';
import { createMaterialLibrary } from '../src/workstation/modules/materials/public.ts';
import { createTimbreEditor } from '../src/workstation/modules/timbre/public.ts';

function storageFixture() {
  let raw: string | null = null;
  let failWrites = false;
  const storage: MaterialStorage = {
    read: () => raw,
    write: value => { if (failWrites) throw new Error('磁盘写入失败'); raw = value; },
  };
  return { storage, raw: () => raw, fail: () => { failWrites = true; } };
}

function saved(result: SaveResult) {
  assert.equal(result.status, 'saved');
  if (result.status !== 'saved') throw new Error('Expected a saved sound.');
  return result.content;
}

function fileValue() {
  return {
    format: 'RootSoundSound', version: 1, name: '夜雨里的光 · 第一声',
    timbre: { model: 'basic-synth', version: 1, character: 'clear', attackSeconds: 0.36,
      releaseSeconds: 2.71, level: 0.43 },
  };
}

test('a portable sound carries the current Chinese name and every setting into a clean library', () => {
  const sourceStorage = storageFixture();
  const sourceLibrary = createMaterialLibrary(sourceStorage.storage);
  const source = createTimbreEditor(sourceLibrary);
  source.rename('夜雨里的光 · 第一声');
  source.setCharacter('clear');
  source.setEnvelope(0.36, 2.71);
  source.setLevel(0.43);
  const before = sourceStorage.raw();
  const sourceDraft = source.read().draft;
  const plan = source.previewPlan();
  const text = source.exportSound();
  assert.deepEqual(JSON.parse(text), fileValue());
  assert.equal(sourceStorage.raw(), before, 'export cannot save or mutate the source library');
  assert.deepEqual(source.read().draft, sourceDraft);

  const destinationStorage = storageFixture();
  const destinationLibrary = createMaterialLibrary(destinationStorage.storage);
  const destination = createTimbreEditor(destinationLibrary);
  const originalDraft = destination.read().draft;
  destination.importSound(text);
  assert.equal(destination.read().draft.name, sourceDraft.name);
  assert.deepEqual(destination.read().body, source.read().body);
  assert.deepEqual(destination.previewPlan(), plan);
  assert.notEqual(destination.read().draft.id, sourceDraft.id);
  assert.notEqual(destination.read().draft.id, originalDraft.id);
  assert.equal(destination.read().draft.sourceId, undefined);
  assert.deepEqual(destination.read().draft.dependencies, []);
  assert.equal(destinationLibrary.listContent().length, 0);
  assert.deepEqual(destinationLibrary.readDraft(originalDraft.id), originalDraft);
  const reopened = createTimbreEditor(createMaterialLibrary(destinationStorage.storage));
  assert.deepEqual(reopened.previewPlan(), plan);
  assert.equal(reopened.read().draft.name, sourceDraft.name);
});

test('export uses the unfinished edit rather than silently falling back to the saved sound', () => {
  const library = createMaterialLibrary();
  const editor = createTimbreEditor(library);
  const original = saved(editor.save('new'));
  editor.rename('还未保存的新想法');
  editor.setCharacter('bright');
  const before = library.listContent();
  const file = JSON.parse(editor.exportSound());
  assert.equal(file.name, '还未保存的新想法');
  assert.equal(file.timbre.character, 'bright');
  assert.equal(file.id, undefined);
  assert.equal(file.sourceId, undefined);
  assert.equal(file.owner, undefined);
  assert.deepEqual(library.listContent(), before);
  assert.deepEqual(library.readContent(original.id), original);
  assert.equal(editor.read().changed, true);
});

test('importing the same named sound creates new identities and never overwrites old references', () => {
  const library = createMaterialLibrary();
  const editor = createTimbreEditor(library);
  editor.importSound(JSON.stringify(fileValue()));
  const first = saved(editor.save('new'));
  const project = saved(library.saveDraft(library.createDraft({
    kind: 'rootsound.project', schemaVersion: 1, owner: 'projects', name: '原来的工程',
    dependencies: [first.id], body: {},
  }).id, 'new'));
  const originalDrafts = library.listDrafts();
  editor.importSound(JSON.stringify(fileValue()));
  const nextDraft = editor.read().draft;
  assert.equal(nextDraft.sourceId, undefined);
  assert.ok(originalDrafts.every(draft => draft.id !== nextDraft.id));
  const second = saved(editor.save('new'));
  assert.equal(second.name, first.name);
  assert.notEqual(second.id, first.id);
  assert.deepEqual(library.readContent(first.id), first);
  assert.deepEqual(library.readContent(project.id), project);
  assert.equal(editor.read().savedSounds.length, 2);
});

test('malformed, unsupported and externally dependent files leave the full library and active draft intact', () => {
  const fixture = storageFixture();
  const library = createMaterialLibrary(fixture.storage);
  const editor = createTimbreEditor(library);
  saved(editor.save('new'));
  editor.rename('当前未完成的声音');
  const before = fixture.raw();
  const view = editor.read();
  const file = fileValue();
  const invalid: unknown[] = [
    null, [], {}, { ...file, format: 'RootSoundProject' }, { ...file, version: 2 },
    { ...file, version: '1' }, { ...file, name: '' }, { ...file, name: '   ' },
    { ...file, id: 'external-library-id' }, { ...file, sourceId: 'saved-id' },
    { ...file, dependencies: ['sample-outside-the-file'] },
    { ...file, anotherSetting: true }, { ...file, timbre: null },
    { ...file, timbre: { ...file.timbre, version: 2 } },
    { ...file, timbre: { ...file.timbre, sample: 'C:\\outside.wav' } },
    { ...file, timbre: { ...file.timbre, character: 'unknown' } },
    { ...file, timbre: { ...file.timbre, attackSeconds: -1 } },
    { ...file, timbre: { ...file.timbre, releaseSeconds: 0 } },
    { ...file, timbre: { ...file.timbre, level: 1.1 } },
  ];
  for (const raw of ['{bad json', ...invalid.map(value => JSON.stringify(value))]) {
    assert.throws(() => editor.importSound(raw));
    assert.equal(fixture.raw(), before);
    assert.deepEqual(editor.read(), view);
  }
});

test('missing required fields and non-finite numeric input cannot produce a partially imported sound', () => {
  const fixture = storageFixture();
  const editor = createTimbreEditor(createMaterialLibrary(fixture.storage));
  const before = fixture.raw();
  const original = editor.read();
  const file = fileValue();
  for (const key of ['format', 'version', 'name', 'timbre']) {
    const missing = { ...file } as Record<string, unknown>;
    delete missing[key];
    assert.throws(() => editor.importSound(JSON.stringify(missing)));
  }
  for (const key of Object.keys(file.timbre)) {
    const missing = { ...file.timbre } as Record<string, unknown>;
    delete missing[key];
    assert.throws(() => editor.importSound(JSON.stringify({ ...file, timbre: missing })));
  }
  assert.throws(() => editor.importSound(JSON.stringify(file).replace('0.43', '1e999')));
  assert.equal(fixture.raw(), before);
  assert.deepEqual(editor.read(), original);
});

test('an imported draft becomes active only after its durable write succeeds', () => {
  const fixture = storageFixture();
  const library = createMaterialLibrary(fixture.storage);
  const editor = createTimbreEditor(library);
  saved(editor.save('new'));
  editor.rename('必须保留的编辑稿');
  const before = fixture.raw();
  const original = editor.read();
  fixture.fail();
  assert.throws(() => editor.importSound(JSON.stringify(fileValue())), /写入失败/);
  assert.equal(fixture.raw(), before);
  assert.deepEqual(editor.read(), original);
  assert.deepEqual(createTimbreEditor(createMaterialLibrary(fixture.storage)).read(), original);
});

test('a sound with external dependencies cannot be exported as a self-contained basic sound', () => {
  const library = createMaterialLibrary();
  const editor = createTimbreEditor(library);
  const draftId = editor.read().draft.id;
  library.updateDraft(draftId, { dependencies: ['not-embedded'] });
  const before = library.listDrafts();
  assert.throws(() => editor.exportSound(), /外部依赖/);
  assert.deepEqual(library.listDrafts(), before);
});
