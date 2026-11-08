import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createMaterialLibrary } from '../src/workstation/modules/materials/public.ts';
import { createCoCreation } from '../src/workstation/modules/co-creation/public.ts';
import { createTimbrePlayback } from '../src/workstation/modules/timbre/public.ts';
import { createPhrasePlayback } from '../src/workstation/modules/phrase/public.ts';
import { createSongEditor } from '../src/workstation/modules/song/public.ts';

function fixture() {
  let raw: string | null = null; let writes = 0; let failing = false;
  const storage = { read: () => raw, write(value: string) { if (failing) throw new Error('磁盘空间不足'); raw = value; writes++; } };
  const library = createMaterialLibrary(storage); const co = createCoCreation(library);
  return { storage, library, co, raw: () => raw, writes: () => writes, fail: (value: boolean) => { failing = value; } };
}

test('renaming the current result changes its phrase and journey title in one write without changing its music or voices', () => {
  const f = fixture(); f.co.chooseIdea('calm', f.co.read().token);
  const before = f.co.read(); const music = f.co.previewCurrent(); const sounds = f.library.listContent().filter(item => item.kind === 'rootsound.timbre');
  const writes = f.writes(); const history = f.library.readDraftHistory(before.draft.id).past.length;
  f.co.renameCurrent('  窗边的雨  ', before.token); const after = f.co.read();
  assert.equal(f.writes() - writes, 1); assert.equal(after.currentPhrase!.name, '窗边的雨'); assert.equal(after.draft.name, '窗边的雨');
  assert.notEqual(after.currentPhrase!.id, before.currentPhrase!.id); assert.deepEqual(after.currentPhrase!.body, before.currentPhrase!.body);
  assert.deepEqual(after.currentPhrase!.dependencies, before.currentPhrase!.dependencies); assert.deepEqual(f.co.previewCurrent(), music);
  assert.deepEqual(f.library.listContent().filter(item => item.kind === 'rootsound.timbre'), sounds);
  assert.equal(f.library.readDraftHistory(before.draft.id).past.length, history + 1);
  assert.equal(after.body!.round, before.body!.round); assert.equal(after.body!.lastDirection, before.body!.lastDirection);
});

test('renaming one journey isolates its current occurrence from the source, another journey and a saved song', () => {
  const f = fixture(); f.co.chooseIdea('light', f.co.read().token); const origin = f.co.read(); const phrase = origin.currentPhrase!;
  const other = createCoCreation(f.library); other.start(phrase.id); const otherBefore = other.read();
  f.co.start(phrase.id); const current = f.co.read();
  const song = createSongEditor(f.library, createPhrasePlayback(f.library, createTimbrePlayback(f.library)), { defaultTempoMode: 'source' });
  song.create(); song.addClip(song.read().body!.tracks[0]!.id, phrase.id, 0);
  const saved = song.save('new'); assert.equal(saved.status, 'saved'); if (saved.status !== 'saved') throw new Error('Expected song');
  const plan = song.previewPlan(); f.co.renameCurrent('我这一份的名字', current.token);
  const result = f.co.read(); assert.equal(result.body!.sourcePhraseId, phrase.id); assert.notEqual(result.body!.currentPhraseId, phrase.id);
  assert.deepEqual(f.library.readContent(phrase.id), phrase); assert.deepEqual(f.library.readContent(saved.content.id), saved.content);
  assert.deepEqual(song.previewPlan(), plan); const otherAfter = other.read();
  assert.deepEqual(otherAfter.draft, otherBefore.draft); assert.deepEqual(otherAfter.currentPhrase, otherBefore.currentPhrase);
  assert.equal(otherAfter.token, otherBefore.token);
  assert.deepEqual(f.library.readDraft(origin.draft.id), origin.draft);
  assert.deepEqual(new Set(result.draft.dependencies), new Set([phrase.id, result.currentPhrase!.id]));
});

test('the title and isolated phrase undo and redo atomically across restarts', () => {
  const f = fixture(); f.co.chooseIdea('airy', f.co.read().token); const before = f.co.read();
  f.co.renameCurrent('星光', before.token); const after = f.co.read();
  const firstLibrary = createMaterialLibrary(f.storage); const first = createCoCreation(firstLibrary); first.openDraft(before.draft.id); first.undo();
  assert.deepEqual(first.read().currentPhrase, before.currentPhrase); assert.equal(first.read().draft.name, before.draft.name);
  assert.equal(firstLibrary.readContent(after.currentPhrase!.id), undefined);
  const secondLibrary = createMaterialLibrary(f.storage); const second = createCoCreation(secondLibrary); second.openDraft(before.draft.id); second.redo();
  assert.deepEqual(second.read().currentPhrase, after.currentPhrase); assert.equal(second.read().draft.name, '星光');
  assert.deepEqual(second.previewCurrent(), f.co.previewCurrent());
});

test('an unsuccessful title write preserves all saved bytes and history, then can be retried with the same token', () => {
  const f = fixture(); f.co.chooseIdea('calm', f.co.read().token); const before = f.co.read();
  const raw = f.raw(); const writes = f.writes(); const history = f.library.readDraftHistory(before.draft.id);
  f.fail(true); assert.throws(() => f.co.renameCurrent('明天', before.token), /磁盘空间不足/);
  assert.equal(f.raw(), raw); assert.equal(f.writes(), writes); assert.deepEqual(f.co.read(), before);
  assert.deepEqual(f.library.readDraftHistory(before.draft.id), history);
  f.fail(false); f.co.renameCurrent('明天', before.token); assert.equal(f.co.read().currentPhrase!.name, '明天');
});

test('empty, oversized and stale titles never replace the current result; an unchanged title is a no-op', () => {
  const f = fixture(); const emptyRaw = f.raw();
  assert.throws(() => f.co.renameCurrent('还没有结果'), /先选择/); assert.equal(f.raw(), emptyRaw);
  f.co.chooseIdea('light', f.co.read().token); const first = f.co.read(); const raw = f.raw(); const writes = f.writes();
  assert.throws(() => f.co.renameCurrent('   ', first.token), /名称/);
  assert.throws(() => f.co.renameCurrent('雨'.repeat(4097), first.token), /过长/);
  f.co.renameCurrent(` ${first.currentPhrase!.name} `, first.token);
  assert.equal(f.raw(), raw); assert.equal(f.writes(), writes);
  f.co.chooseIdea('airy', first.token); const after = f.co.read(); const afterRaw = f.raw();
  assert.throws(() => f.co.renameCurrent('过时的名字', first.token), /已改变/);
  assert.equal(f.raw(), afterRaw); assert.deepEqual(f.co.read(), after);
});

test('subsequent directions use the renamed phrase and retain its exact musical notes', () => {
  const f = fixture(); f.co.chooseIdea('light', f.co.read().token); f.co.renameCurrent('小路', f.co.read().token);
  const renamed = f.co.read(); const body = renamed.currentPhrase!.body as { parts: { notes: unknown[] }[] };
  f.co.chooseIdea('calm', renamed.token);
  const next = f.co.read().currentPhrase!; assert(next.name.includes('小路'));
  assert.deepEqual((next.body as { parts: { notes: unknown[] }[] }).parts.map(part => part.notes), body.parts.map(part => part.notes));
});
