import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createMaterialLibrary } from './public.ts';
import type { ContentRecord, Draft, MaterialLibrary, NewContent, SaveResult } from './public.ts';

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

test('an unfinished phrase reference requires confirmation before its timbre is overwritten', () => {
  const library = createMaterialLibrary();
  const timbre = add(library);
  const phrase = library.createDraft(input('未保存的乐句', [timbre.id]));
  const edit = library.createDraft({ sourceId: timbre.id });
  library.updateDraft(edit.id, { body: { gain: 0.7 } });
  const check = library.saveDraft(edit.id, 'overwrite');
  assert.equal(check.status, 'needs-confirmation');
  if (check.status !== 'needs-confirmation') return;
  assert.deepEqual(check.affectedContent, []);
  assert.deepEqual(check.affectedDrafts, [phrase]);
  assert(!check.affectedDrafts.some(draft => draft.id === edit.id));
  check.affectedDrafts[0]!.name = '不能修改保管内容';
  assert.equal(library.readDraft(phrase.id)?.name, '未保存的乐句');
  assert.equal(library.readContent(timbre.id)?.revision, 1);
  assert.equal(saved(library.saveDraft(edit.id, 'overwrite', check.confirmation)).revision, 2);
});

test('unfinished drafts using an indirectly affected saved phrase also require confirmation', () => {
  const library = createMaterialLibrary();
  const timbre = add(library);
  const phrase = add(library, '保存的乐句', [timbre.id]);
  const song = library.createDraft(input('未完成歌曲', [phrase.id]));
  const edit = library.createDraft({ sourceId: timbre.id });
  const check = library.saveDraft(edit.id, 'overwrite');
  assert.equal(check.status, 'needs-confirmation');
  if (check.status !== 'needs-confirmation') return;
  assert.deepEqual(check.affectedContent.map(content => content.id), [phrase.id]);
  assert(check.affectedDrafts.some(draft => draft.id === song.id));
  assert(check.affectedDrafts.some(draft => draft.sourceId === phrase.id));
  assert(!check.affectedDrafts.some(draft => draft.sourceId === timbre.id));
});

test('draft content, reference and replacement edits invalidate an earlier impact confirmation', () => {
  const library = createMaterialLibrary();
  const timbre = add(library);
  const phrase = add(library, '引用音色的乐句', [timbre.id]);
  const song = library.createDraft(input('正在创作', [timbre.id]));
  const edit = library.createDraft({ sourceId: timbre.id });
  let check = library.saveDraft(edit.id, 'overwrite');
  if (check.status !== 'needs-confirmation') throw new Error('Expected impact confirmation.');
  const changes = [
    () => library.updateDraft(song.id, { body: { gain: 0.8 } }),
    () => library.updateDraft(song.id, { dependencies: [phrase.id] }),
    () => library.updateDraft(edit.id, { body: { gain: 0.9 } }),
  ];
  for (const change of changes) {
    change();
    const retry = library.saveDraft(edit.id, 'overwrite', check.confirmation);
    assert.equal(retry.status, 'needs-confirmation');
    if (retry.status !== 'needs-confirmation') throw new Error('Expected refreshed confirmation.');
    assert.notEqual(retry.confirmation.impactToken, check.confirmation.impactToken);
    assert.equal(library.readContent(timbre.id)?.revision, 1);
    check = retry;
  }
  assert.equal(saved(library.saveDraft(edit.id, 'overwrite', check.confirmation)).revision, 2);
});

test('a confirmed overwrite with unfinished dependents remains atomic when storage fails', () => {
  let raw: string | null = null;
  let failWrites = false;
  const library = createMaterialLibrary({ read: () => raw, write: value => {
    if (failWrites) throw new Error('磁盘空间不足');
    raw = value;
  } });
  const timbre = add(library);
  const phrase = library.createDraft(input('未保存乐句', [timbre.id]));
  const edit = library.createDraft({ sourceId: timbre.id });
  library.updateDraft(edit.id, { body: { gain: 0.95 } });
  const check = library.saveDraft(edit.id, 'overwrite');
  if (check.status !== 'needs-confirmation') throw new Error('Expected impact confirmation.');
  const before = raw;
  const draftsBefore = library.listDrafts();
  failWrites = true;
  assert.equal(library.saveDraft(edit.id, 'overwrite', check.confirmation).status, 'storage-error');
  assert.equal(raw, before);
  assert.deepEqual(library.readContent(timbre.id), timbre);
  assert.deepEqual(library.listDrafts(), draftsBefore);
  assert.deepEqual(createMaterialLibrary({ read: () => raw, write() {} }).readDraft(phrase.id), phrase);
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

function historyFixture() {
  let raw: string | null = null;
  let failing = false;
  let writes = 0;
  const storage = { read: () => raw, write(value: string) { if (failing) throw new Error('磁盘空间不足'); raw = value; writes++; } };
  const library = createMaterialLibrary(storage);
  const draft = library.createDraft(input());
  const edit = (name: string) => library.updateDraft(draft.id, { name }, { remember: true, expected: library.readDraft(draft.id)! });
  return { library, storage, draft, edit, raw: () => raw, writes: () => writes, fail: (value: boolean) => { failing = value; } };
}

test('draft changes and both history directions persist in one write and survive full store reconstruction', () => {
  const f = historyFixture();
  const writes = f.writes(); f.edit('第一步');
  assert.equal(f.writes() - writes, 1);
  f.edit('第二步');
  const reopened = createMaterialLibrary(f.storage);
  assert.equal(reopened.readDraftHistory(f.draft.id).past.length, 2);
  const beforeUndo = f.writes();
  reopened.travelDraft(f.draft.id, 'undo', reopened.readDraft(f.draft.id)!);
  assert.equal(f.writes() - beforeUndo, 1);
  const again = createMaterialLibrary(f.storage);
  assert.equal(again.readDraft(f.draft.id)!.name, '第一步');
  assert.equal(again.readDraftHistory(f.draft.id).future.length, 1);
  again.travelDraft(f.draft.id, 'redo', again.readDraft(f.draft.id)!);
  assert.equal(createMaterialLibrary(f.storage).readDraft(f.draft.id)!.name, '第二步');
  const copied = again.readDraftHistory(f.draft.id); copied.past[0]!.body = null; copied.past.length = 0;
  assert.equal(again.readDraftHistory(f.draft.id).past.length, 2);
  assert.deepEqual(again.readDraftHistory(f.draft.id).past[0]!.body, { gain: 0.4 });
});

test('failed remembered edits and history travel leave the entire durable history unchanged', () => {
  const f = historyFixture(); f.edit('第一步'); f.edit('第二步');
  const raw = f.raw(); const history = f.library.readDraftHistory(f.draft.id);
  f.fail(true);
  assert.throws(() => f.edit('不能写入'), /写入失败/);
  assert.throws(() => f.library.travelDraft(f.draft.id, 'undo', f.library.readDraft(f.draft.id)!), /写入失败/);
  assert.equal(f.raw(), raw); assert.deepEqual(f.library.readDraftHistory(f.draft.id), history);
  f.fail(false); f.library.travelDraft(f.draft.id, 'undo', f.library.readDraft(f.draft.id)!);
  const undoneRaw = f.raw(); const undone = f.library.readDraftHistory(f.draft.id); f.fail(true);
  assert.throws(() => f.library.travelDraft(f.draft.id, 'redo', f.library.readDraft(f.draft.id)!), /写入失败/);
  assert.equal(f.raw(), undoneRaw); assert.deepEqual(f.library.readDraftHistory(f.draft.id), undone);
});

test('save preserves draft history and identity while undo only edits the draft, including after Save As', () => {
  const f = historyFixture(); f.edit('已保存的第一版');
  const original = saved(f.library.saveDraft(f.draft.id, 'new'));
  f.edit('已保存的第二版'); saved(f.library.saveDraft(f.draft.id, 'overwrite'));
  const reopened = createMaterialLibrary(f.storage);
  const beforeUndo = reopened.readDraft(f.draft.id)!;
  reopened.travelDraft(f.draft.id, 'undo', beforeUndo);
  assert.equal(reopened.readDraft(f.draft.id)!.name, '已保存的第一版');
  assert.equal(reopened.readDraft(f.draft.id)!.baseRevision, 2);
  assert.equal(reopened.readDraft(f.draft.id)!.sourceId, original.id);
  assert.equal(reopened.readContent(original.id)!.name, '已保存的第二版');
  const copy = saved(reopened.saveDraft(f.draft.id, 'new'));
  reopened.travelDraft(f.draft.id, 'undo', reopened.readDraft(f.draft.id)!);
  assert.equal(reopened.readDraft(f.draft.id)!.id, f.draft.id);
  assert.equal(reopened.readDraft(f.draft.id)!.sourceId, copy.id);
  assert.equal(reopened.readContent(copy.id)!.name, '已保存的第一版');
  assert.equal(reopened.readContent(original.id)!.revision, 2);
  assert.equal('editHistory' in reopened.readContent(copy.id)!, false);
});

test('no-op edits preserve redo and a branch clears only its own future, including after reopening', () => {
  const f = historyFixture(); f.edit('第一步'); f.edit('第二步');
  const second = f.library.createDraft(input('另一份编辑稿'));
  f.library.updateDraft(second.id, { name: '另一份历史' }, { remember: true, expected: second });
  f.library.travelDraft(f.draft.id, 'undo', f.library.readDraft(f.draft.id)!);
  const reopened = createMaterialLibrary(f.storage); const raw = f.raw();
  reopened.updateDraft(f.draft.id, { name: '第一步' }, { remember: true, expected: reopened.readDraft(f.draft.id)! });
  assert.equal(f.raw(), raw); assert.equal(reopened.readDraftHistory(f.draft.id).future.length, 1);
  reopened.updateDraft(f.draft.id, { name: '新分支' }, { remember: true, expected: reopened.readDraft(f.draft.id)! });
  assert.equal(reopened.readDraftHistory(f.draft.id).future.length, 0);
  assert.equal(reopened.readDraftHistory(second.id).past.length, 1);
});

test('external draft edits invalidate old history and stale validation or stale store instances cannot replace new changes', () => {
  const f = historyFixture(); f.edit('第一步'); const staleDraft = f.library.readDraft(f.draft.id)!;
  f.library.updateDraft(f.draft.id, { name: '其他编辑者的新改动' });
  assert.deepEqual(f.library.readDraftHistory(f.draft.id), { past: [], future: [] });
  const freshRaw = f.raw();
  assert.throws(() => f.library.updateDraft(f.draft.id, { name: '过期编辑' }, { remember: true, expected: staleDraft }), /发生变化/);
  assert.throws(() => f.library.travelDraft(f.draft.id, 'undo', staleDraft), /发生变化/);
  assert.equal(f.raw(), freshRaw);
  f.edit('新的历史'); const other = createMaterialLibrary(f.storage);
  other.updateDraft(f.draft.id, { name: '另一个窗口' }); const externalRaw = f.raw();
  assert.throws(() => f.library.travelDraft(f.draft.id, 'undo', f.library.readDraft(f.draft.id)!), /其他窗口/);
  assert.equal(f.raw(), externalRaw); assert.equal(other.readDraft(f.draft.id)!.name, '另一个窗口');
});

test('old libraries gain history without conversion and each draft keeps at most 64 undo steps across reopening', () => {
  const f = historyFixture();
  assert.equal('editHistory' in JSON.parse(f.raw()!), false);
  const legacy = createMaterialLibrary(f.storage);
  assert.deepEqual(legacy.readDraftHistory(f.draft.id), { past: [], future: [] });
  for (let index = 1; index <= 80; index++) legacy.updateDraft(f.draft.id, { name: String(index) }, { remember: true, expected: legacy.readDraft(f.draft.id)! });
  const reopened = createMaterialLibrary(f.storage);
  for (let index = 0; index < 64; index++) reopened.travelDraft(f.draft.id, 'undo', reopened.readDraft(f.draft.id)!);
  assert.equal(reopened.readDraft(f.draft.id)!.name, '16');
  assert.equal(reopened.readDraftHistory(f.draft.id).past.length, 0);
  assert.equal(reopened.readDraftHistory(f.draft.id).future.length, 64);
});

test('damaged or unsupported history is never silently discarded, truncated, or used to restore saved identity', () => {
  const f = historyFixture(); f.edit('第一步');
  const original = JSON.parse(f.raw()!);
  const variants = [
    (state: typeof original) => { state.editHistory.version = 2; },
    (state: typeof original) => { state.editHistory.entries[0].draftId = 'missing'; },
    (state: typeof original) => { state.editHistory.entries.push(state.editHistory.entries[0]); },
    (state: typeof original) => { state.editHistory.entries[0].past[0].sourceId = 'never-restore-source'; },
    (state: typeof original) => { state.editHistory.entries[0].past[0].dependencies = [1]; },
    (state: typeof original) => { state.editHistory.entries[0].past = Array(65).fill(state.editHistory.entries[0].past[0]); },
  ];
  for (const change of variants) {
    const state = structuredClone(original); change(state); let writes = 0;
    const raw = JSON.stringify(state);
    assert.throws(() => createMaterialLibrary({ read: () => raw, write() { writes++; } }));
    assert.equal(writes, 0);
  }
});

function transactionFixture() {
  let raw: string | null = null;
  let failing = false;
  let writes = 0;
  const storage = { read: () => raw, write(value: string) { if (failing) throw new Error('磁盘空间不足'); raw = value; writes++; } };
  const library = createMaterialLibrary(storage);
  const sound = add(library, '原声音');
  const phrase = add(library, '共享乐句', [sound.id]);
  const song = add(library, '歌曲甲', [phrase.id]);
  const secondSong = add(library, '歌曲乙', [phrase.id]);
  const anchor = library.createDraft({ sourceId: song.id });
  const other = library.createDraft({ sourceId: secondSong.id });
  library.updateDraft(other.id, { name: '歌曲乙修改稿' }, { remember: true, expected: other });
  const session = library.createDraft({ sourceId: sound.id });
  const copiedSound: ContentRecord = { ...sound, id: crypto.randomUUID(), revision: 1, body: { gain: 0.9 } };
  const copiedPhrase: ContentRecord = { ...phrase, id: crypto.randomUUID(), revision: 1, dependencies: [copiedSound.id], body: { voice: copiedSound.id } };
  function operation() {
    const current = library.readDraft(anchor.id)!;
    const currentOther = library.readDraft(other.id)!;
    return { label: '仅对选中的两个位置应用声音', expectedToken: library.currentToken(), anchorDraftId: anchor.id,
      createContents: [structuredClone(copiedSound), structuredClone(copiedPhrase)],
      replaceDrafts: [
        { expected: current, replacement: { ...current, name: '歌曲甲局部修改', dependencies: [copiedPhrase.id], body: { phrase: copiedPhrase.id } } },
        { expected: currentOther, replacement: { ...currentOther, dependencies: [copiedPhrase.id], body: { phrase: copiedPhrase.id } } },
      ], deleteDrafts: [session] };
  }
  return { library, storage, sound, phrase, song, anchor, other, session, copiedSound, copiedPhrase, operation,
    raw: () => raw, writes: () => writes, fail: (value: boolean) => { failing = value; } };
}

test('nested forks, multiple root rebindings and session cleanup commit as exactly one durable operation', () => {
  const f = transactionFixture();
  const before = f.writes(); const token = f.library.currentToken();
  const result = f.library.commitTransaction(f.operation());
  assert.equal(result.status, 'committed'); assert.equal(f.writes() - before, 1);
  assert.notEqual(f.library.currentToken(), token);
  assert.deepEqual(f.library.readContent(f.phrase.id)!.dependencies, [f.sound.id]);
  assert.deepEqual(f.library.readContent(f.copiedPhrase.id)!.dependencies, [f.copiedSound.id]);
  assert.deepEqual(f.library.readDraft(f.anchor.id)!.dependencies, [f.copiedPhrase.id]);
  assert.deepEqual(f.library.readDraft(f.other.id)!.dependencies, [f.copiedPhrase.id]);
  assert.equal(f.library.readDraft(f.session.id), undefined);
  assert.deepEqual(f.library.readDraftHistory(f.other.id), { past: [], future: [] });
  assert.equal(f.library.readDraftHistory(f.anchor.id).past.length, 1);
  const target = f.library.readDraftHistory(f.anchor.id).past[0]!;
  assert.deepEqual(Object.keys(target).sort(), ['body', 'dependencies', 'name', 'transactionId']);
  assert.equal(typeof target.transactionId, 'string');
});

test('one undo after reopening restores every root and removes forks; one redo after reopening restores the complete transaction', () => {
  const f = transactionFixture();
  assert.equal(f.library.commitTransaction(f.operation()).status, 'committed');
  const reopened = createMaterialLibrary(f.storage); const beforeUndo = f.writes();
  reopened.travelDraft(f.anchor.id, 'undo', reopened.readDraft(f.anchor.id)!);
  assert.equal(f.writes() - beforeUndo, 1);
  assert.deepEqual(reopened.readDraft(f.anchor.id), f.anchor);
  assert.deepEqual(reopened.readDraft(f.other.id)!.dependencies, [f.phrase.id]);
  assert.deepEqual(reopened.readDraft(f.session.id), f.session);
  assert.equal(reopened.readContent(f.copiedSound.id), undefined);
  assert.equal(reopened.readContent(f.copiedPhrase.id), undefined);
  const again = createMaterialLibrary(f.storage); const beforeRedo = f.writes();
  again.travelDraft(f.anchor.id, 'redo', again.readDraft(f.anchor.id)!);
  assert.equal(f.writes() - beforeRedo, 1);
  assert.deepEqual(again.readDraft(f.other.id)!.dependencies, [f.copiedPhrase.id]);
  assert.deepEqual(again.readContent(f.copiedSound.id), f.copiedSound);
  assert.equal(again.readDraft(f.session.id), undefined);
});

test('compound operations retain chronological order with ordinary edits on either side', () => {
  const f = transactionFixture();
  f.library.updateDraft(f.anchor.id, { name: '应用前的名字' }, { remember: true, expected: f.anchor });
  assert.equal(f.library.commitTransaction(f.operation()).status, 'committed');
  f.library.updateDraft(f.anchor.id, { name: '应用后的名字' }, { remember: true, expected: f.library.readDraft(f.anchor.id)! });
  const reopened = createMaterialLibrary(f.storage);
  const travel = (direction: 'undo' | 'redo') => reopened.travelDraft(f.anchor.id, direction, reopened.readDraft(f.anchor.id)!);
  travel('undo'); assert(reopened.readContent(f.copiedSound.id));
  travel('undo'); assert.equal(reopened.readContent(f.copiedSound.id), undefined);
  assert.equal(reopened.readDraft(f.anchor.id)!.name, '应用前的名字');
  travel('undo'); assert.equal(reopened.readDraft(f.anchor.id)!.name, f.anchor.name);
  travel('redo'); travel('redo'); travel('redo');
  assert.equal(reopened.readDraft(f.anchor.id)!.name, '应用后的名字');
  assert(reopened.readContent(f.copiedSound.id));
});

test('storage failure leaves all transaction records, token and composite history unchanged, including failed undo', () => {
  const f = transactionFixture(); const raw = f.raw(); const token = f.library.currentToken();
  f.fail(true);
  assert.equal(f.library.commitTransaction(f.operation()).status, 'storage-error');
  assert.equal(f.raw(), raw); assert.equal(f.library.currentToken(), token);
  assert.equal(f.library.readContent(f.copiedSound.id), undefined);
  assert.deepEqual(f.library.readDraft(f.anchor.id), f.anchor);
  f.fail(false); assert.equal(f.library.commitTransaction(f.operation()).status, 'committed');
  const appliedRaw = f.raw(); const appliedToken = f.library.currentToken();
  f.fail(true);
  assert.throws(() => f.library.travelDraft(f.anchor.id, 'undo', f.library.readDraft(f.anchor.id)!), /写入失败/);
  assert.equal(f.raw(), appliedRaw); assert.equal(f.library.currentToken(), appliedToken);
  assert.equal(f.library.readDraftHistory(f.anchor.id).past.length, 1);
});

test('stale scope tokens, stale records, cycles and missing fork dependencies reject the entire transaction', () => {
  const f = transactionFixture(); const stale = f.operation();
  f.library.createDraft(input('新增使用位置'));
  assert.equal(f.library.commitTransaction(stale).status, 'conflict');
  const staleRecord = f.operation(); staleRecord.replaceDrafts[0]!.expected.name = '过期快照';
  const missing = f.operation(); missing.createContents[1]!.dependencies = ['missing'];
  const cycle = f.operation(); cycle.createContents[0]!.dependencies = [f.copiedPhrase.id];
  for (const transaction of [staleRecord, missing, cycle]) {
    const raw = f.raw(); const token = f.library.currentToken();
    assert.equal(f.library.commitTransaction(transaction).status, 'conflict');
    assert.equal(f.raw(), raw); assert.equal(f.library.currentToken(), token);
    assert.equal(f.library.readContent(f.copiedSound.id), undefined);
  }
});

test('later saved and unfinished references retain needed forks while the original editing operation remains undoable', () => {
  for (const external of ['saved', 'draft'] as const) {
    const f = transactionFixture(); assert.equal(f.library.commitTransaction(f.operation()).status, 'committed');
    const other = external === 'saved' ? add(f.library, '其他作品开始使用新声音', [f.copiedSound.id]) : undefined;
    if (external === 'draft') f.library.createDraft(input('新的未保存作品', [f.copiedPhrase.id]));
    f.library.travelDraft(f.anchor.id, 'undo', f.library.readDraft(f.anchor.id)!);
    assert.deepEqual(f.library.readDraft(f.anchor.id), f.anchor);
    assert(f.library.readContent(f.copiedSound.id));
    if (other) assert.deepEqual(f.library.readContent(other.id), other);
    const reopened = createMaterialLibrary(f.storage);
    reopened.travelDraft(f.anchor.id, 'redo', reopened.readDraft(f.anchor.id)!);
    assert.deepEqual(reopened.readDraft(f.anchor.id)!.dependencies, [f.copiedPhrase.id]);
    assert.equal(reopened.listContent().filter(item => item.id === f.copiedSound.id).length, 1);
  }
});

test('later edits to a selected root still reject the complete compound undo without changing anything', () => {
  const f = transactionFixture(); assert.equal(f.library.commitTransaction(f.operation()).status, 'committed');
  f.library.updateDraft(f.other.id, { name: '之后手工修改的位置' });
  const raw = f.raw();
  assert.throws(() => f.library.travelDraft(f.anchor.id, 'undo', f.library.readDraft(f.anchor.id)!));
  assert.equal(f.raw(), raw); assert(f.library.readContent(f.copiedSound.id));
  assert.equal(f.library.readDraftHistory(f.anchor.id).past.length, 1);
});

test('later-edited generated content survives undo but cannot be silently overwritten by redo', () => {
  const f = transactionFixture(); assert.equal(f.library.commitTransaction(f.operation()).status, 'committed');
  const edited = { ...f.copiedSound, revision: 2, body: { gain: 0.15 } };
  assert.equal(f.library.commitTransaction({ expectedToken: f.library.currentToken(), label: '之后修改新声音',
    replaceContents: [{ expected: f.copiedSound, replacement: edited }] }).status, 'committed');
  f.library.travelDraft(f.anchor.id, 'undo', f.library.readDraft(f.anchor.id)!);
  assert.deepEqual(f.library.readDraft(f.anchor.id), f.anchor);
  assert.deepEqual(f.library.readContent(f.copiedSound.id), edited);
  assert.equal(f.library.readContent(f.copiedPhrase.id), undefined);
  const raw = f.raw();
  assert.throws(() => f.library.travelDraft(f.anchor.id, 'redo', f.library.readDraft(f.anchor.id)!));
  assert.equal(f.raw(), raw); assert.deepEqual(f.library.readContent(f.copiedSound.id), edited);
});

test('draft context updates preserve history and are stripped from saved material while remaining on the draft', () => {
  const f = historyFixture(); f.edit('已有手工修改'); const before = f.library.readDraft(f.draft.id)!;
  const context = { namespace: 'references', source: 'a-usage' };
  assert.equal(f.library.commitTransaction({ expectedToken: f.library.currentToken(), label: '记录编辑入口',
    replaceDrafts: [{ expected: before, replacement: { ...before, editingContext: context } }] }).status, 'committed');
  assert.equal(f.library.readDraftHistory(f.draft.id).past.length, 1);
  const content = saved(f.library.saveDraft(f.draft.id, 'new'));
  assert.equal('editingContext' in content, false);
  assert.deepEqual(f.library.readDraft(f.draft.id)!.editingContext, context);
  const reopened = createMaterialLibrary(f.storage);
  reopened.travelDraft(f.draft.id, 'undo', reopened.readDraft(f.draft.id)!);
  assert.equal(reopened.readDraft(f.draft.id)!.name, f.draft.name);
  assert.deepEqual(reopened.readDraft(f.draft.id)!.editingContext, context);
});

test('saved root replacement is atomic with draft changes and undo restores its exact previous revision', () => {
  const f = transactionFixture(); const replacement = { ...f.song, revision: f.song.revision + 1, name: '保存后的联合结果' };
  assert.equal(f.library.commitTransaction({ expectedToken: f.library.currentToken(), label: '修改两个根', anchorDraftId: f.anchor.id,
    replaceContents: [{ expected: f.song, replacement }],
    replaceDrafts: [{ expected: f.anchor, replacement: { ...f.anchor, name: replacement.name } }] }).status, 'committed');
  assert.deepEqual(f.library.readContent(f.song.id), replacement);
  f.library.travelDraft(f.anchor.id, 'undo', f.library.readDraft(f.anchor.id)!);
  assert.deepEqual(f.library.readContent(f.song.id), f.song);
  f.library.travelDraft(f.anchor.id, 'redo', f.library.readDraft(f.anchor.id)!);
  assert.deepEqual(f.library.readContent(f.song.id), replacement);
});

test('saving the anchor keeps its new identity during undo and preserves published forks for later undo and redo', () => {
  const f = historyFixture(); const before = f.library.readDraft(f.draft.id)!;
  assert.equal(f.library.commitTransaction({ expectedToken: f.library.currentToken(), label: '一组更改', anchorDraftId: before.id,
    replaceDrafts: [{ expected: before, replacement: { ...before, name: '新的名字' } }] }).status, 'committed');
  const content = saved(f.library.saveDraft(before.id, 'new'));
  f.library.travelDraft(before.id, 'undo', f.library.readDraft(before.id)!);
  assert.equal(f.library.readDraft(before.id)!.sourceId, content.id);
  assert.equal(f.library.readDraft(before.id)!.name, before.name);
  assert.equal(f.library.readContent(content.id)!.name, '新的名字');

  const nested = transactionFixture(); assert.equal(nested.library.commitTransaction(nested.operation()).status, 'committed');
  const published = saved(nested.library.saveDraft(nested.anchor.id, 'new'));
  const reopened = createMaterialLibrary(nested.storage);
  reopened.travelDraft(nested.anchor.id, 'undo', reopened.readDraft(nested.anchor.id)!);
  assert.deepEqual(reopened.readDraft(nested.anchor.id)!.dependencies, [nested.phrase.id]);
  assert.equal(reopened.readDraft(nested.anchor.id)!.sourceId, published.id);
  assert.deepEqual(reopened.readContent(published.id), published);
  assert.deepEqual(reopened.readContent(nested.copiedPhrase.id), nested.copiedPhrase);
  const again = createMaterialLibrary(nested.storage);
  again.travelDraft(nested.anchor.id, 'redo', again.readDraft(nested.anchor.id)!);
  assert.deepEqual(again.readDraft(nested.anchor.id)!.dependencies, [nested.copiedPhrase.id]);
  assert.deepEqual(again.readContent(published.id), published);
});

test('cancel removes isolated drafts and owned contents only when no surviving root needs them', () => {
  const f = transactionFixture(); const extra: Draft = { ...f.session, id: crypto.randomUUID(), editingContext: { temporary: true } };
  assert.equal(f.library.commitTransaction({ expectedToken: f.library.currentToken(), label: '暂存声音', createContents: [f.copiedSound],
    createDrafts: [{ ...extra, sourceId: f.copiedSound.id, baseRevision: 1 }] }).status, 'committed');
  const temporaryDraft = f.library.readDraft(extra.id)!;
  assert.equal(f.library.commitTransaction({ expectedToken: f.library.currentToken(), label: '取消暂存编辑',
    deleteDrafts: [temporaryDraft], deleteContents: [f.copiedSound] }).status, 'committed');
  assert.equal(f.library.readDraft(extra.id), undefined); assert.equal(f.library.readContent(f.copiedSound.id), undefined);
  assert(f.library.readContent(f.sound.id));
});

test('composite journals are retained for reachable redo markers and pruned when their history branch is abandoned', () => {
  const f = transactionFixture(); assert.equal(f.library.commitTransaction(f.operation()).status, 'committed');
  f.library.travelDraft(f.anchor.id, 'undo', f.library.readDraft(f.anchor.id)!);
  assert.equal(JSON.parse(f.raw()!).transactionHistory.entries.length, 1);
  const reopened = createMaterialLibrary(f.storage);
  reopened.updateDraft(f.anchor.id, { name: '不同方向' }, { remember: true, expected: reopened.readDraft(f.anchor.id)! });
  assert.equal(JSON.parse(f.raw()!).transactionHistory.entries.length, 0);
  assert.equal(reopened.readDraftHistory(f.anchor.id).future.length, 0);
});

test('each anchor keeps at most 64 compound steps and their journals remain valid after reopening', () => {
  const f = historyFixture();
  for (let index = 1; index <= 70; index++) {
    const before = f.library.readDraft(f.draft.id)!;
    assert.equal(f.library.commitTransaction({ expectedToken: f.library.currentToken(), label: `联合应用 ${index}`, anchorDraftId: before.id,
      replaceDrafts: [{ expected: before, replacement: { ...before, name: String(index) } }] }).status, 'committed');
  }
  assert.equal(JSON.parse(f.raw()!).transactionHistory.entries.length, 64);
  const reopened = createMaterialLibrary(f.storage);
  for (let index = 0; index < 64; index++) reopened.travelDraft(f.draft.id, 'undo', reopened.readDraft(f.draft.id)!);
  assert.equal(reopened.readDraft(f.draft.id)!.name, '6');
  assert.equal(reopened.readDraftHistory(f.draft.id).future.length, 64);
  assert.equal(JSON.parse(f.raw()!).transactionHistory.entries.length, 64);
});

test('missing, mismatched or damaged composite journals reject loading without any write', () => {
  const f = transactionFixture(); assert.equal(f.library.commitTransaction(f.operation()).status, 'committed');
  const original = JSON.parse(f.raw()!);
  const mutations = [
    (state: typeof original) => { delete state.transactionHistory; },
    (state: typeof original) => { state.transactionHistory.version = 2; },
    (state: typeof original) => { state.transactionHistory.entries[0].anchorDraftId = 'wrong-draft'; },
    (state: typeof original) => { state.transactionHistory.entries[0].contents[0].after.revision = 0; },
    (state: typeof original) => { state.editHistory.entries.find((entry: { draftId: string }) => entry.draftId === f.anchor.id).past[0].body = null; },
    (state: typeof original) => { state.transactionHistory.entries.push(state.transactionHistory.entries[0]); },
  ];
  for (const mutate of mutations) {
    const state = structuredClone(original); mutate(state); let writes = 0;
    assert.throws(() => createMaterialLibrary({ read: () => JSON.stringify(state), write() { writes++; } }));
    assert.equal(writes, 0);
  }
});
