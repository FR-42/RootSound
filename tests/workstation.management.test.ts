import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createMaterialLibrary, createMaterialCatalog } from '../src/workstation/modules/materials/public.ts';
import { createWorkspacePreferences } from '../src/workstation/app/platform/preferences.ts';
import type { SaveResult } from '../src/workstation/contracts/content.ts';
import type { WorkspacePreferences } from '../src/workstation/contracts/workspace.ts';
import { registerHooks } from 'node:module';
const settingsHook = registerHooks({ load(url, context, next) { return url.endsWith('.css') ? { format: 'module', source: '', shortCircuit: true } : next(url, context); } });
const { showWorkspaceSettings } = await import('../src/workstation/modules/ui-rendering/settings.ts'); settingsHook.deregister();

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
  assert.deepEqual(preferences.read(), { keyboardPerformance: false, welcomeEnabled: true, startWorkspace: 'last', lastWorkspace: 'phrase' });
  preferences.update({ welcomeEnabled: false, startWorkspace: 'library', lastWorkspace: 'song' });
  assert.deepEqual(createWorkspacePreferences(storage).read(), { keyboardPerformance: false, welcomeEnabled: false, startWorkspace: 'library', lastWorkspace: 'song' });
  const view = preferences.read(); view.lastWorkspace = 'sound'; assert.equal(preferences.read().lastWorkspace, 'song');
  preferences.update({ startWorkspace: 'co-creation', lastWorkspace: 'co-creation' });
  assert.deepEqual(createWorkspacePreferences(storage).read(), { keyboardPerformance: false, welcomeEnabled: false, startWorkspace: 'co-creation', lastWorkspace: 'co-creation' });
  preferences.update({ startWorkspace: 'sampling', lastWorkspace: 'sampling' });
  assert.deepEqual(createWorkspacePreferences(storage).read(), { keyboardPerformance: false, welcomeEnabled: false, startWorkspace: 'sampling', lastWorkspace: 'sampling' });
});
test('invalid display preferences recover safe defaults, and failed updates preserve the previous in-memory setting', () => {
  const preferences = createWorkspacePreferences({ getItem: () => '{invalid', setItem: () => { throw new Error('blocked'); } });
  assert.equal(preferences.read().welcomeEnabled, true);
  assert.throws(() => preferences.update({ welcomeEnabled: false }), /未能保存/);
  assert.equal(preferences.read().welcomeEnabled, true);
  assert.throws(() => preferences.update({ startWorkspace: 'unknown' as never }), /无效/);
});

test('keyboard performance is opt-in for old preferences and persists independently of project storage', () => {
  const map = new Map([['rootsound.workstation.preferences.v1', JSON.stringify({ version: 1, welcomeEnabled: false, startWorkspace: 'phrase', lastWorkspace: 'song' })], ['song-data', 'untouched']]);
  let writes = 0; const storage = { getItem: (key: string) => map.get(key) ?? null, setItem(key: string, value: string) { writes++; map.set(key, value); } };
  const preferences = createWorkspacePreferences(storage);
  assert.equal(preferences.read().keyboardPerformance, false); assert.equal(preferences.read().startWorkspace, 'phrase');
  preferences.update({ keyboardPerformance: true });
  const reopened = createWorkspacePreferences(storage); assert.equal(reopened.read().keyboardPerformance, true); assert.equal(reopened.read().welcomeEnabled, false);
  reopened.update({ keyboardPerformance: false }); assert.equal(createWorkspacePreferences(storage).read().keyboardPerformance, false);
  assert.equal(map.get('song-data'), 'untouched'); assert.equal(writes, 2);
  assert.throws(() => reopened.update({ keyboardPerformance: 'true' as never }), /无效/); assert.equal(writes, 2);
  let fail = false; let raw: string | null = null;
  const guarded = createWorkspacePreferences({ getItem: () => raw, setItem(_key, value) { if (fail) throw new Error('unavailable'); raw = value; } });
  guarded.update({ keyboardPerformance: true }); fail = true;
  assert.throws(() => guarded.update({ keyboardPerformance: false }), /未能保存/); assert.equal(guarded.read().keyboardPerformance, true);
});

class SettingsElement extends EventTarget {
  children: SettingsElement[] = []; parent?: SettingsElement; attributes = new Map<string, string>();
  className = ''; textContent = ''; type = ''; value = ''; checked = false;
  readonly tag: string;
  constructor(tag: string) { super(); this.tag = tag; }
  append(...children: SettingsElement[]) { for (const child of children) { child.parent = this; this.children.push(child); } }
  setAttribute(name: string, value: string) { this.attributes.set(name, value); }
  remove() { if (this.parent) this.parent.children = this.parent.children.filter(child => child !== this); this.parent = undefined; }
  querySelector(selector: string): SettingsElement | undefined { return this.children.find(child => selector[0] === '.' && child.className.split(' ').includes(selector.slice(1))) ?? this.children.map(child => child.querySelector(selector)).find(Boolean); }
  showModal() { this.attributes.set('open', ''); }
  close() { this.attributes.delete('open'); this.dispatchEvent(new Event('close')); }
}
const settingsNodes = (root: SettingsElement): SettingsElement[] => [root, ...root.children.flatMap(settingsNodes)];
function settingsFixture(fail = false, initial?: Record<string, unknown>) {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'document');
  Object.defineProperty(globalThis, 'document', { configurable: true, value: { createElement: (tag: string) => new SettingsElement(tag), createTextNode(text: string) { const node = new SettingsElement('text'); node.textContent = text; return node; } } });
  const map = new Map<string, string>(initial ? [['rootsound.workstation.preferences.v1', JSON.stringify(initial)]] : []); const preferences = createWorkspacePreferences({ getItem: key => map.get(key) ?? null, setItem(key, value) { if (fail) throw new Error('read-only'); map.set(key, value); } });
  const updates: Partial<WorkspacePreferences>[] = []; const update = preferences.update;
  preferences.update = changes => { updates.push({ ...changes }); return update(changes); };
  const root = new SettingsElement('root'); let closed = 0;
  const open = () => showWorkspaceSettings(root as unknown as HTMLElement, preferences, () => { closed++; }); open();
  const find = (predicate: (node: SettingsElement) => boolean) => { const result = settingsNodes(root).find(predicate); assert(result); return result; };
  return { root, preferences, map, updates, open, get closed() { return closed; }, performance: () => find(node => node.attributes.get('aria-label') === '键盘演奏'),
    submit: () => find(node => node.tag === 'form').dispatchEvent(new Event('submit', { cancelable: true })),
    back: () => find(node => node.textContent === '返回').dispatchEvent(new Event('click')),
    error: () => find(node => node.attributes.get('role') === 'status'),
    cleanup() { if (descriptor) Object.defineProperty(globalThis, 'document', descriptor); else Reflect.deleteProperty(globalThis, 'document'); } };
}

test('settings exposes one opt-in keyboard switch, saves it on submit and refreshes once after close', () => {
  const f = settingsFixture(); try {
    assert.equal(f.performance().checked, false); assert.equal(f.preferences.read().keyboardPerformance, false);
    assert.equal(settingsNodes(f.root).filter(node => node.tag === 'input').length, 1);
    assert.equal(settingsNodes(f.root).filter(node => node.tag === 'select' || node.tag === 'option').length, 0);
    assert(!settingsNodes(f.root).some(node => /欢迎|工作区|直接进入/u.test(node.textContent)), 'removed entry controls and explanatory text are absent');
    f.open(); assert.equal(settingsNodes(f.root).filter(node => node.tag === 'dialog').length, 1, 'repeated settings clicks reuse the open page');
    f.performance().checked = true; f.submit(); assert.equal(f.preferences.read().keyboardPerformance, true); assert.equal(f.root.children.length, 0); assert.equal(f.closed, 1);
    assert.deepEqual(f.updates, [{ keyboardPerformance: true }], 'the sole setting cannot reset any unrelated preference');
    f.open(); assert.equal(f.performance().checked, true); f.performance().checked = false; f.back();
    assert.equal(f.preferences.read().keyboardPerformance, true, 'Back discards uncommitted switch edits'); assert.equal(f.closed, 2);
  } finally { f.cleanup(); }
});

test('saving the only visible setting preserves retired entry data and unrelated same-version preferences', () => {
  const initial = { version: 1, keyboardPerformance: false, welcomeEnabled: false, startWorkspace: 'sampling', lastWorkspace: 'song', unrelated: { retained: '原有偏好' } };
  const f = settingsFixture(false, initial); try {
    f.performance().checked = true; f.submit();
    const stored = JSON.parse(f.map.get('rootsound.workstation.preferences.v1')!);
    assert.deepEqual(stored, { ...initial, keyboardPerformance: true });
    assert.deepEqual(f.updates, [{ keyboardPerformance: true }]);
    assert.equal(createWorkspacePreferences({ getItem: key => f.map.get(key) ?? null, setItem() { throw new Error('read only'); } }).read().keyboardPerformance, true);
  } finally { f.cleanup(); }
});

test('keyboard setting migrates independently of missing or invalid retired controls without rewriting music', () => {
  for (const retired of [{}, { welcomeEnabled: 'invalid', startWorkspace: 'removed-workspace' }]) {
    const key = 'rootsound.workstation.preferences.v1'; const map = new Map([[key, JSON.stringify({ version: 1, keyboardPerformance: true, lastWorkspace: 'phrase', ...retired })], ['song-data', '完整工程原文']]);
    const writes: string[] = []; const storage = { getItem: (name: string) => map.get(name) ?? null, setItem(name: string, value: string) { writes.push(name); map.set(name, value); } };
    const preferences = createWorkspacePreferences(storage);
    assert.equal(preferences.read().keyboardPerformance, true); assert.equal(preferences.read().lastWorkspace, 'phrase');
    assert.equal(preferences.read().welcomeEnabled, true); assert.equal(preferences.read().startWorkspace, 'last'); assert.deepEqual(writes, [], 'reading preferences does not cause a migration write');
    preferences.update({ keyboardPerformance: false });
    assert.deepEqual(writes, [key]); assert.equal(map.get('song-data'), '完整工程原文');
    assert.equal(createWorkspacePreferences(storage).read().keyboardPerformance, false);
  }
});

test('failed settings persistence keeps the page and edited switch available without enabling performance', () => {
  const f = settingsFixture(true); try {
    f.performance().checked = true; f.submit(); assert.equal(f.preferences.read().keyboardPerformance, false); assert.equal(f.performance().checked, true);
    assert.match(f.error().textContent, /未能保存/); assert.equal(f.closed, 0); assert.equal(f.root.children.length, 1);
    f.back(); assert.equal(f.closed, 1); assert.equal(f.root.children.length, 0);
  } finally { f.cleanup(); }
});
