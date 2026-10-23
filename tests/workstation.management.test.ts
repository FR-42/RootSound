import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createMaterialLibrary, createMaterialCatalog } from '../src/workstation/modules/materials/public.ts';
import { createWorkspacePreferences } from '../src/workstation/app/platform/preferences.ts';
import type { SaveResult } from '../src/workstation/contracts/content.ts';

function result(value: SaveResult) { assert.equal(value.status, 'saved'); if (value.status !== 'saved') throw new Error('Expected saved'); return value.content; }
function fixture() {
  let raw: string | null = null; let fail = false;
  const storage = { read: () => raw, write(value: string) { if (fail) throw new Error('disk unavailable'); raw = value; } };
  const library = createMaterialLibrary(storage);
  const sound = result(library.saveDraft(library.createDraft({ kind: 'rootsound.timbre', owner: 'timbre', schemaVersion: 1, name: '雨后的光', body: { preserved: '中文参数' } }).id, 'new'));
  const phrase = result(library.saveDraft(library.createDraft({ kind: 'rootsound.phrase', owner: 'phrase', schemaVersion: 1, name: 'Morning Melody', dependencies: [sound.id], body: { notes: [] } }).id, 'new'));
  const song = result(library.saveDraft(library.createDraft({ kind: 'rootsound.song', owner: 'song', schemaVersion: 1, name: 'Morning Song', dependencies: [phrase.id], body: { arrangement: [] } }).id, 'new'));
  return { library, catalog: createMaterialCatalog(library), sound, phrase, song, storage, raw: () => raw, fail: () => { fail = true; } };
}
test('material catalog searches by human name and kind while retaining opaque musical content', () => {
  const f = fixture(); const before = f.raw();
  assert.deepEqual(f.catalog.list(' MORNING ', 'rootsound.phrase').map(item => item.id), [f.phrase.id]);
  assert.equal(f.catalog.list('雨后')[0]!.name, '雨后的光');
  assert.equal(f.catalog.list('', 'rootsound.timbre').length, 1);
  const copy = f.catalog.list(); copy[0]!.name = 'not authoritative';
  assert.equal(f.catalog.list()[0]!.name, '雨后的光'); assert.equal(f.raw(), before);
});
test('catalog usage includes indirect saved songs and unpublished drafts without treating editing origin as use', () => {
  const f = fixture(); const draft = f.library.createDraft({ kind: 'rootsound.song', owner: 'song', schemaVersion: 1, name: '未完成的夜曲', dependencies: [f.phrase.id], body: {} });
  const usage = f.catalog.usage(f.sound.id);
  assert.deepEqual(new Set(usage.saved.map(item => item.id)), new Set([f.phrase.id, f.song.id]));
  assert.ok(usage.drafts.some(item => item.id === draft.id));
  assert.ok(!usage.drafts.some(item => item.sourceId === f.sound.id));
  assert.throws(() => f.catalog.usage('missing'), /找不到/);
});
test('unfinished catalog entries exclude clean recovery drafts and retain changed drafts across reopen', () => {
  const f = fixture(); assert.equal(f.catalog.listDrafts().length, 0);
  const draft = f.library.createDraft({ sourceId: f.phrase.id });
  f.library.updateDraft(draft.id, { name: '未完成的旋律' });
  assert.deepEqual(f.catalog.listDrafts('旋律').map(item => item.id), [draft.id]);
  assert.deepEqual(createMaterialCatalog(createMaterialLibrary(f.storage)).listDrafts().map(item => item.id), [draft.id]);
});
test('safe material copy creates one new identity and keeps dependencies and all old references shared', () => {
  const f = fixture(); const copy = result(f.catalog.duplicate(f.phrase.id, '独立尝试', f.phrase.revision));
  assert.notEqual(copy.id, f.phrase.id); assert.equal(copy.revision, 1); assert.deepEqual(copy.body, f.phrase.body);
  assert.deepEqual(copy.dependencies, [f.sound.id]);
  assert.deepEqual(f.library.readContent(f.song.id)!.dependencies, [f.phrase.id]);
  assert.equal(f.library.listContent().filter(item => item.kind === 'rootsound.timbre').length, 1);
  assert.equal(createMaterialLibrary(f.storage).readContent(copy.id)!.name, '独立尝试');
});
test('stale or failed material copies leave the complete saved library and drafts unchanged', () => {
  const f = fixture(); const before = f.raw();
  assert.equal(f.catalog.duplicate(f.phrase.id, '副本', 99).status, 'conflict');
  assert.equal(f.catalog.duplicate(f.phrase.id, '  ', 1).status, 'conflict');
  f.fail(); assert.equal(f.catalog.duplicate(f.phrase.id, '副本', 1).status, 'storage-error');
  assert.equal(f.raw(), before); assert.equal(f.library.listContent().length, 3); assert.equal(f.library.listDrafts().length, 3);
});
test('workspace preferences migrate last workspace and persist welcome and a selected entry without touching musical data', () => {
  const map = new Map<string, string>([['rootsound.workstation.workspace.v1', 'phrase']]);
  const storage = { getItem: (key: string) => map.get(key) ?? null, setItem: (key: string, value: string) => { map.set(key, value); } };
  const preferences = createWorkspacePreferences(storage);
  assert.deepEqual(preferences.read(), { welcomeEnabled: true, startWorkspace: 'last', lastWorkspace: 'phrase' });
  preferences.update({ welcomeEnabled: false, startWorkspace: 'library', lastWorkspace: 'song' });
  assert.deepEqual(createWorkspacePreferences(storage).read(), { welcomeEnabled: false, startWorkspace: 'library', lastWorkspace: 'song' });
  const view = preferences.read(); view.lastWorkspace = 'sound'; assert.equal(preferences.read().lastWorkspace, 'song');
  preferences.update({ startWorkspace: 'co-creation', lastWorkspace: 'co-creation' });
  assert.deepEqual(createWorkspacePreferences(storage).read(), { welcomeEnabled: false, startWorkspace: 'co-creation', lastWorkspace: 'co-creation' });
  preferences.update({ startWorkspace: 'sampling', lastWorkspace: 'sampling' });
  assert.deepEqual(createWorkspacePreferences(storage).read(), { welcomeEnabled: false, startWorkspace: 'sampling', lastWorkspace: 'sampling' });
});
test('invalid display preferences recover safe defaults, and failed updates preserve the previous in-memory setting', () => {
  const preferences = createWorkspacePreferences({ getItem: () => '{invalid', setItem: () => { throw new Error('blocked'); } });
  assert.equal(preferences.read().welcomeEnabled, true);
  assert.throws(() => preferences.update({ welcomeEnabled: false }), /未能保存/);
  assert.equal(preferences.read().welcomeEnabled, true);
  assert.throws(() => preferences.update({ startWorkspace: 'unknown' as never }), /无效/);
});
