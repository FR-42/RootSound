import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { ContentRecord, SaveResult } from '../src/workstation/contracts/content.ts';
import type { CoCreationDirection } from '../src/workstation/contracts/co-creation.ts';
import { createMaterialLibrary, createProjectPackages, createReferenceEditing } from '../src/workstation/modules/materials/public.ts';
import { createCoCreation, createCoCreationReferenceAdapter } from '../src/workstation/modules/co-creation/public.ts';
import { createTimbreEditor, createTimbrePlayback, createTimbreReferenceAdapter } from '../src/workstation/modules/timbre/public.ts';
import { createPhraseEditor, createPhrasePlayback, createPhraseReferenceAdapter, readPhraseBody } from '../src/workstation/modules/phrase/public.ts';
import { createSongEditor, createSongPlayback, createSongReferenceAdapter } from '../src/workstation/modules/song/public.ts';

function saved(result: SaveResult): ContentRecord { assert.equal(result.status, 'saved'); if (result.status !== 'saved') throw new Error('Expected saved'); return result.content; }
function fixture() {
  let raw: string | null = null; let writes = 0; let failing = false;
  const storage = { read: () => raw, write(value: string) { if (failing) throw new Error('磁盘空间不足'); raw = value; writes++; } };
  const library = createMaterialLibrary(storage);
  return { storage, library, raw: () => raw, writes: () => writes, fail: (value = true) => { failing = value; } };
}
function source(f: ReturnType<typeof fixture>) {
  const timbre = createTimbreEditor(f.library); timbre.rename('自己的起点声音'); const sound = saved(timbre.save('new'));
  const phrase = createPhraseEditor(f.library, createTimbrePlayback(f.library)); phrase.create(sound.id); phrase.rename('心里一直记着的旋律'); phrase.setTempo(97); phrase.setLength(8);
  phrase.addNote(phrase.read().body!.parts[0]!.id, { startBeat: 0.123456789123, durationBeats: 1.234567891234,
    frequencyHz: 317.123456789123, velocity: 0.765432198765 });
  const music = saved(phrase.save('new')); return { sound, music };
}
function adapters() { return [createTimbreReferenceAdapter(), createPhraseReferenceAdapter(), createSongReferenceAdapter(), createCoCreationReferenceAdapter()]; }

test('a fresh offline journey offers three audible directions and previews publish no candidates or history', () => {
  const f = fixture(); const co = createCoCreation(f.library);
  assert.equal(f.library.listContent().length, 0); assert.equal(f.library.listDrafts().length, 1);
  const view = co.read(); assert.equal(view.draft.kind, 'rootsound.co-creation'); assert.equal(view.draft.owner, 'co-creation');
  assert.deepEqual(view.ideas.map(idea => idea.id), ['light', 'calm', 'airy']); assert.equal(view.currentPhrase, undefined);
  const raw = f.raw(); const writes = f.writes();
  const plans = view.ideas.map(idea => co.previewIdea(idea.id));
  assert(plans.every(plan => plan.events.length > 0 && plan.durationSeconds > 0));
  assert.notDeepEqual(plans[0], plans[1]); assert.notDeepEqual(plans[1], plans[2]);
  assert.equal(f.raw(), raw); assert.equal(f.writes(), writes); assert.equal(co.read().canUndo, false);
  assert.throws(() => co.previewCurrent(), /先选择/);
});

test('choosing one auditioned direction atomically publishes exactly its graph and one session undo step', () => {
  const f = fixture(); const co = createCoCreation(f.library); const view = co.read();
  for (const idea of view.ideas) co.previewIdea(idea.id);
  const heard = co.previewIdea('calm'); const writes = f.writes(); co.chooseIdea('calm', view.token);
  assert.equal(f.writes() - writes, 1); const chosen = co.read();
  assert.equal(chosen.body!.round, 1); assert.equal(chosen.body!.lastDirection, 'calm'); assert.equal(chosen.body!.hasArrangement, true);
  assert.deepEqual(co.previewCurrent(), heard); assert(chosen.currentPhrase);
  assert.equal(f.library.listContent().length, chosen.currentPhrase.dependencies.length + 1);
  assert.equal(f.library.listContent().filter(record => record.kind === 'rootsound.phrase').length, 1);
  assert.deepEqual(chosen.draft.dependencies, [chosen.currentPhrase.id]); assert.equal(chosen.canUndo, true);
  assert.equal(f.library.readDraftHistory(chosen.draft.id).past.length, 1);
  assert(f.library.listContent().every(record => record.kind !== 'rootsound.co-creation'));
});

test('a provided phrase stays unchanged and its exact melody remains inside each chosen suggestion', () => {
  const f = fixture(); const original = source(f); const co = createCoCreation(f.library); const previous = co.read().draft;
  co.start(original.music.id); const started = co.read();
  assert.notEqual(started.draft.id, previous.id); assert(f.library.readDraft(previous.id));
  assert.deepEqual(started.draft.dependencies, [original.music.id]); assert.equal(started.sourceName, original.music.name);
  assert.equal(started.currentPhrase!.id, original.music.id);
  co.chooseIdea('light', started.token);
  assert.deepEqual(f.library.readContent(original.music.id), original.music); assert.deepEqual(f.library.readContent(original.sound.id), original.sound);
  const selected = readPhraseBody(co.read().currentPhrase!.body); const seed = readPhraseBody(original.music.body);
  assert.equal(selected.tempoBpm, seed.tempoBpm); assert.equal(selected.lengthBeats, seed.lengthBeats);
  assert.deepEqual(selected.parts[0]!.notes, seed.parts[0]!.notes);
  assert.deepEqual(new Set(co.read().draft.dependencies), new Set([original.music.id, co.read().currentPhrase!.id]));
});

test('failed choices and failed new starts preserve all music, current journey, history and disk bytes', () => {
  const f = fixture(); const co = createCoCreation(f.library); const before = co.read(); const raw = f.raw(); const writes = f.writes();
  f.fail(); assert.throws(() => co.chooseIdea('airy', before.token), /磁盘空间不足/);
  assert.equal(f.raw(), raw); assert.equal(f.writes(), writes); assert.deepEqual(co.read(), before); assert.deepEqual(f.library.listContent(), []);
  assert.throws(() => co.start(), /磁盘空间不足/); assert.equal(co.read().draft.id, before.draft.id);
  f.fail(false); co.chooseIdea('airy', before.token); assert(co.read().currentPhrase);
});

test('old selection tokens and unsupported directions cannot overwrite a newer current result', () => {
  const f = fixture(); const co = createCoCreation(f.library); const before = co.read();
  co.chooseIdea('light', before.token); const raw = f.raw(); const chosen = co.read();
  assert.throws(() => co.chooseIdea('calm', before.token), /已改变/);
  assert.throws(() => co.chooseIdea('unknown' as CoCreationDirection), /支持的创作方向/);
  assert.equal(f.raw(), raw); assert.deepEqual(co.read(), chosen);
});

test('selection tokens also reject same-identity saved sound changes instead of using an outdated audition', () => {
  const f = fixture(); const original = source(f); const co = createCoCreation(f.library); co.start(original.music.id);
  const before = co.read(); co.previewIdea('calm');
  const replacement = { ...original.sound, revision: 2, name: '后来修改的声音' };
  assert.equal(f.library.commitTransaction({ expectedToken: f.library.currentToken(), label: '另一个位置的明确联合修改',
    replaceContents: [{ expected: original.sound, replacement }] }).status, 'committed');
  const raw = f.raw(); assert.throws(() => co.chooseIdea('calm', before.token), /已改变/); assert.equal(f.raw(), raw);
  co.chooseIdea('calm', co.read().token); assert(co.read().currentPhrase);
});

test('fine tuning through the common current reference returns to the journey and the next suggestions preserve those edits', () => {
  const f = fixture(); const original = source(f); const co = createCoCreation(f.library); co.start(original.music.id); co.chooseIdea('light', co.read().token);
  const old = co.read().currentPhrase!; const stale = co.read().token; const manager = createReferenceEditing(f.library, adapters());
  const sounds = old.dependencies.map(id => f.library.readContent(id)!);
  const edit = manager.begin({ root: { type: 'draft', id: co.read().draft.id }, path: ['current'] });
  assert.equal(edit.rootKind, 'rootsound.co-creation');
  const phrase = createPhraseEditor(f.library, createTimbrePlayback(f.library)); phrase.openDraft(edit.draftId);
  const part = phrase.read().body!.parts[0]!; const note = part.notes[0]!;
  phrase.updateNote(part.id, note.id, { frequencyHz: 777.123456789123, velocity: 0.412345678912 });
  const applied = manager.apply(edit.draftId); assert.equal(applied.status, 'applied');
  const fine = co.read(); assert.equal(fine.currentPhrase!.id, old.id); assert.equal(fine.currentPhrase!.revision, old.revision + 1);
  assert.equal(fine.draft.id, edit.context!.root.id);
  assert.deepEqual(f.library.readContent(original.music.id), original.music);
  assert.deepEqual(f.library.readContent(original.sound.id), original.sound);
  for (const sound of sounds) assert.deepEqual(f.library.readContent(sound.id), sound);
  assert.throws(() => co.chooseIdea('airy', stale), /已改变/);
  const tuned = readPhraseBody(fine.currentPhrase!.body); const preview = co.previewIdea('airy');
  const expected = readPhraseBody(old.body); expected.parts[0]!.notes[0]!.frequencyHz = 777.123456789123; expected.parts[0]!.notes[0]!.velocity = 0.412345678912;
  assert.deepEqual(tuned, expected, 'fine tuning changes exactly the requested note fields');
  assert(preview.events.some(event => event.sound.note.frequencyHz === 777.123456789123));
  co.chooseIdea('airy', fine.token); const next = readPhraseBody(co.read().currentPhrase!.body);
  assert.equal(next.parts.length, tuned.parts.length); assert.equal(next.tempoBpm, tuned.tempoBpm); assert.equal(next.lengthBeats, tuned.lengthBeats);
  for (let index = 0; index < tuned.parts.length; index++) assert.deepEqual(next.parts[index]!.notes, tuned.parts[index]!.notes);
  assert.equal(co.read().body!.round, 2);
});

test('choices and their complete musical graphs support undo and redo across separate restarts', () => {
  const f = fixture(); const co = createCoCreation(f.library); const id = co.read().draft.id;
  co.chooseIdea('calm', co.read().token); const first = co.read().currentPhrase!; const firstPlan = co.previewCurrent();
  co.chooseIdea('airy', co.read().token); const second = co.read().currentPhrase!; const secondPlan = co.previewCurrent();
  const reopenedLibrary = createMaterialLibrary(f.storage); const reopened = createCoCreation(reopenedLibrary); reopened.openDraft(id);
  assert.equal(reopened.read().currentPhrase!.id, second.id); reopened.undo();
  assert.equal(reopened.read().currentPhrase!.id, first.id); assert.deepEqual(reopened.previewCurrent(), firstPlan);
  assert.equal(reopenedLibrary.readContent(second.id), undefined);
  reopened.undo(); assert.equal(reopened.read().currentPhrase, undefined); assert.deepEqual(reopenedLibrary.listContent(), []);
  const again = createCoCreation(createMaterialLibrary(f.storage)); again.openDraft(id); again.redo(); again.redo();
  assert.equal(again.read().currentPhrase!.id, second.id); assert.deepEqual(again.previewCurrent(), secondPlan);
});

test('adopting the current phrase in a saved song protects that song while the journey is undone and redone', () => {
  const f = fixture(); const co = createCoCreation(f.library); co.chooseIdea('airy', co.read().token); const chosen = co.read().currentPhrase!;
  const song = createSongEditor(f.library, createPhrasePlayback(f.library, createTimbrePlayback(f.library)), { defaultTempoMode: 'source' });
  song.create(); song.addClip(song.read().body!.tracks[0]!.id, chosen.id, 0); const savedSong = saved(song.save('new')); const expected = song.previewPlan();
  co.undo(); assert.equal(co.read().currentPhrase, undefined); assert(f.library.readContent(chosen.id)); assert.deepEqual(f.library.readContent(savedSong.id), savedSong);
  co.redo(); assert.equal(co.read().currentPhrase!.id, chosen.id); assert.deepEqual(song.previewPlan(), expected);
  const projects = createProjectPackages(f.library, adapters(), { rootKind: 'rootsound.song' }); const output = projects.exportDraft(song.read().draft!.id);
  assert(JSON.parse(output.text).contents.every((record: ContentRecord) => record.kind !== 'rootsound.co-creation'));
  const target = createMaterialLibrary(); const imported = createProjectPackages(target, adapters(), { rootKind: 'rootsound.song' }).importProject(output.text);
  assert.equal(imported.status, 'imported'); if (imported.status !== 'imported') throw new Error('Expected imported song');
  assert.deepEqual(createSongPlayback(target, createPhrasePlayback(target, createTimbrePlayback(target))).planForSaved(imported.content.id), expected);
});

test('unsupported session drafts are preserved and reported while earlier journeys remain reopenable', () => {
  const f = fixture(); const co = createCoCreation(f.library); const good = co.read().draft;
  const future = f.library.createDraft({ kind: 'rootsound.co-creation', owner: 'co-creation', schemaVersion: 2, name: '未来版本的旅途', body: { model: 'guided-session', version: 2 } });
  const raw = f.raw(); const reopened = createCoCreation(f.library); assert.equal(reopened.read().draft.id, future.id); assert(reopened.read().problem);
  assert.equal(f.raw(), raw); assert.deepEqual(f.library.readDraft(future.id), future);
  reopened.openDraft(good.id); assert.equal(reopened.read().problem, undefined); assert.equal(reopened.read().draft.id, good.id);
  assert.throws(() => reopened.openDraft('missing'), /找不到/); assert.equal(reopened.read().draft.id, good.id);
});

test('reference slots distinguish source from current while deduplicating identical phrase dependencies', () => {
  const f = fixture(); const original = source(f); const co = createCoCreation(f.library); co.start(original.music.id);
  const adapter = createCoCreationReferenceAdapter(); const draft = co.read().draft;
  assert.deepEqual(adapter.slots(draft).map(slot => [slot.id, slot.targetId]), [['source', original.music.id], ['current', original.music.id]]);
  assert.throws(() => adapter.validateTarget!(draft, 'current', original.sound), /乐句/);
  assert.throws(() => adapter.replace(draft, [{ slotId: 'missing', targetId: 'new' }]), /不存在/);
  assert.throws(() => adapter.slots({ ...draft, dependencies: [] }), /引用记录/);
  const updated = adapter.replace(draft, [{ slotId: 'current', targetId: 'a-new-phrase' }]);
  assert.deepEqual(updated.dependencies, [original.music.id, 'a-new-phrase']);
  assert.equal((updated.body as { sourcePhraseId: string }).sourcePhraseId, original.music.id);
});

test('a new starting point keeps earlier sessions, invalid starts do not replace the active one, and empty history is a no-op', () => {
  const f = fixture(); const original = source(f); const co = createCoCreation(f.library); const before = co.read(); const raw = f.raw();
  co.undo(); co.redo(); assert.equal(f.raw(), raw);
  assert.throws(() => co.start(original.sound.id)); assert.equal(co.read().draft.id, before.draft.id); assert.equal(f.raw(), raw);
  assert.throws(() => co.start('')); assert.equal(co.read().draft.id, before.draft.id); assert.equal(f.raw(), raw);
  co.chooseIdea('light', before.token); const selected = co.read().draft; co.start(original.music.id);
  assert(f.library.readDraft(selected.id)); assert.notEqual(co.read().draft.id, selected.id);
  co.openDraft(selected.id); assert(co.read().currentPhrase); assert.equal(co.read().body!.lastDirection, 'light');
});

test('unsupported sound ownership in a proposed starting phrase is rejected before a new journey is written', () => {
  const f = fixture(); const original = source(f); const co = createCoCreation(f.library); const active = co.read().draft.id;
  const changed = { ...original.sound, id: crypto.randomUUID(), owner: 'unknown-sound-owner', revision: 1 };
  const body = readPhraseBody(original.music.body); body.parts[0]!.timbreId = changed.id;
  const phrase = { ...original.music, id: crypto.randomUUID(), dependencies: [changed.id], body };
  assert.equal(f.library.commitTransaction({ expectedToken: f.library.currentToken(), label: '不支持的声音来源',
    createContents: [changed, phrase] }).status, 'committed');
  const raw = f.raw(); assert.throws(() => co.start(phrase.id), /声音的格式/);
  assert.equal(co.read().draft.id, active); assert.equal(f.raw(), raw);
});
