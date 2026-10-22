import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createMaterialLibrary } from './public.ts';
import type { MaterialLibrary, NewContent, SaveResult } from './public.ts';

const input = (name = '柔和音色', dependencies: string[] = []): NewContent => ({
  kind: 'timbre', schemaVersion: 1, owner: 'timbre', name, dependencies, body: { gain: 0.4 },
});
function saved(result: SaveResult) {
  assert.equal(result.status, 'saved');
  if (result.status !== 'saved') throw new Error('Expected saved content.');
  return result.content;
}
function add(library: MaterialLibrary, name?: string, dependencies?: string[]) {
  return saved(library.saveDraft(library.createDraft(input(name, dependencies)).id, 'new'));
}

test('input and output copies cannot mutate drafts or saved content; both survive reopening', () => {
  let raw: string | null = null;
  const storage = { read: () => raw, write: (value: string) => { raw = value; } };
  const library = createMaterialLibrary(storage);
  const seed = input();
  const draft = library.createDraft(seed);
  seed.body = null;
  draft.body = null;
  const content = saved(library.saveDraft(draft.id, 'new'));
  library.updateDraft(draft.id, { body: { gain: 0.8 } });
  content.body = null;
  const reopened = createMaterialLibrary(storage);
  assert.deepEqual(reopened.readContent(content.id)?.body, { gain: 0.4 });
  assert.deepEqual(reopened.readDraft(draft.id)?.body, { gain: 0.8 });
  const list = reopened.listDrafts();
  list[0]!.body = false;
  assert.deepEqual(reopened.readDraft(draft.id)?.body, { gain: 0.8 });
});

test('names are independent from identity; save as new preserves all old references', () => {
  const library = createMaterialLibrary();
  const original = add(library);
  const project = add(library, '歌曲', [original.id]);
  const draft = library.createDraft({ sourceId: original.id });
  library.updateDraft(draft.id, { body: { gain: 0.9 } });
  const copy = saved(library.saveDraft(draft.id, 'new'));
  assert.notEqual(copy.id, original.id);
  assert.equal(copy.name, original.name);
  assert.deepEqual(library.readContent(project.id)?.dependencies, [original.id]);
  assert.deepEqual(library.readContent(original.id)?.body, { gain: 0.4 });
});

test('overwrite reports direct and indirect dependencies, including projects never opened', () => {
  const library = createMaterialLibrary();
  const timbre = add(library);
  const phrase = add(library, '乐句', [timbre.id]);
  const song = add(library, '歌曲', [phrase.id]);
  const otherSong = add(library, '另一首歌曲', [timbre.id]);
  const draft = library.createDraft({ sourceId: timbre.id });
  library.updateDraft(draft.id, { body: { gain: 0.6 } });
  const check = library.saveDraft(draft.id, 'overwrite');
  assert.equal(check.status, 'needs-confirmation');
  if (check.status !== 'needs-confirmation') return;
  assert.deepEqual(new Set(check.affectedContent.map(item => item.id)), new Set([phrase.id, song.id, otherSong.id]));
  assert.equal(library.readContent(timbre.id)?.revision, 1);
  assert.equal(saved(library.saveDraft(draft.id, 'overwrite', check.confirmation)).revision, 2);
});

test('a dependency change invalidates the previous impact confirmation', () => {
  const library = createMaterialLibrary();
  const timbre = add(library);
  add(library, '原歌曲', [timbre.id]);
  const draft = library.createDraft({ sourceId: timbre.id });
  const check = library.saveDraft(draft.id, 'overwrite');
  assert.equal(check.status, 'needs-confirmation');
  if (check.status !== 'needs-confirmation') return;
  add(library, '新增歌曲', [timbre.id]);
  const retry = library.saveDraft(draft.id, 'overwrite', check.confirmation);
  assert.equal(retry.status, 'needs-confirmation');
  if (retry.status === 'needs-confirmation') assert.notEqual(retry.confirmation.impactToken, check.confirmation.impactToken);
  assert.equal(library.readContent(timbre.id)?.revision, 1);
});

test('two drafts cannot silently overwrite one another', () => {
  const library = createMaterialLibrary();
  const content = add(library);
  const first = library.createDraft({ sourceId: content.id });
  const second = library.createDraft({ sourceId: content.id });
  saved(library.saveDraft(first.id, 'overwrite'));
  const conflict = library.saveDraft(second.id, 'overwrite');
  assert.equal(conflict.status, 'conflict');
  if (conflict.status === 'conflict') assert.equal(conflict.actualRevision, 2);
  assert.equal(library.readDraft(second.id)?.baseRevision, 1);
  assert.equal(saved(library.saveDraft(second.id, 'new')).revision, 1);
});

test('failed writes leave saved content and drafts untouched in memory and on disk', () => {
  let raw: string | null = null;
  let failWrites = false;
  const library = createMaterialLibrary({ read: () => raw, write: value => {
    if (failWrites) throw new Error('磁盘空间不足');
    raw = value;
  } });
  const content = add(library);
  const draft = library.createDraft({ sourceId: content.id });
  library.updateDraft(draft.id, { name: '修改名称' });
  const before = raw;
  failWrites = true;
  assert.throws(() => library.updateDraft(draft.id, { name: '不能写入' }), /写入失败/);
  assert.equal(library.readDraft(draft.id)?.name, '修改名称');
  assert.equal(library.saveDraft(draft.id, 'overwrite').status, 'storage-error');
  assert.equal(library.readContent(content.id)?.revision, 1);
  assert.equal(library.readDraft(draft.id)?.baseRevision, 1);
  assert.equal(raw, before);
});

test('damaged or unreadable storage produces an error and never overwrites evidence', () => {
  let writes = 0;
  assert.throws(() => createMaterialLibrary({ read: () => '{bad', write: () => { writes++; } }), /损坏/);
  assert.throws(() => createMaterialLibrary({ read: () => { throw new Error('denied'); }, write: () => { writes++; } }), /读取失败/);
  assert.equal(writes, 0);
});

test('invalid JSON, missing dependencies and cycles never commit saved content', () => {
  const library = createMaterialLibrary();
  assert.throws(() => library.createDraft({ ...input(), body: { invalid: Infinity } }), /JSON/);
  const missing = library.createDraft(input('缺失依赖', ['absent']));
  assert.equal(library.saveDraft(missing.id, 'new').status, 'conflict');
  const first = add(library);
  const second = add(library, '使用第一个', [first.id]);
  const draft = library.createDraft({ sourceId: first.id });
  library.updateDraft(draft.id, { dependencies: [second.id] });
  const check = library.saveDraft(draft.id, 'overwrite');
  if (check.status !== 'needs-confirmation') throw new Error('Expected impact check.');
  assert.equal(library.saveDraft(draft.id, 'overwrite', check.confirmation).status, 'conflict');
  assert.equal(library.readContent(first.id)?.revision, 1);
  assert.equal(library.listContent().length, 2);
});
