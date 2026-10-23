import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { SaveResult } from '../src/workstation/contracts/content.ts';
import { createMaterialLibrary, createMaterialCatalog, createProjectPackages } from '../src/workstation/modules/materials/public.ts';
import { createTimbreEditor, createTimbrePlayback, createTimbreReferenceAdapter } from '../src/workstation/modules/timbre/public.ts';
import { createPhraseEditor, createPhrasePlayback, createPhraseReferenceAdapter } from '../src/workstation/modules/phrase/public.ts';
import { createSongEditor, createSongReferenceAdapter } from '../src/workstation/modules/song/public.ts';
import { createProjectAssets } from '../src/workstation/modules/project-assets/public.ts';

function saved(result: SaveResult) {
  assert.equal(result.status, 'saved', JSON.stringify(result));
  if (result.status !== 'saved') throw new Error('Expected saved content');
  return result.content;
}
function fixture() {
  const adapters = [createTimbreReferenceAdapter(), createPhraseReferenceAdapter(), createSongReferenceAdapter()];
  let raw: string | null = null; let writes = 0; let fail = false;
  const storage = { read: () => raw, write(value: string) { if (fail) throw new Error('disk unavailable'); raw = value; writes++; } };
  const policy = { project: { rootKind: 'rootsound.song', adapters } };
  const library = createMaterialLibrary(storage, policy);
  const timbre = createTimbreEditor(library); timbre.rename('木琴'); const voice = saved(timbre.save('new'));
  const voices = createTimbrePlayback(library); const phrase = createPhraseEditor(library, voices);
  phrase.create(voice.id); phrase.rename('短句');
  phrase.addNote(phrase.read().body!.parts[0]!.id, { startBeat: 0, durationBeats: 1, frequencyHz: 220, velocity: .7 });
  const melody = saved(phrase.save('new'));
  const song = createSongEditor(library, createPhrasePlayback(library, voices), { defaultTempoMode: 'source' });
  const catalog = createMaterialCatalog(library, { currentProject: () => song.read().draft });
  const entities = createProjectAssets(library, () => song.read().draft);
  const packages = createProjectPackages(library, adapters, { rootKind: 'rootsound.song' });
  return { adapters, library, policy, storage, timbre, phrase, voice, melody, song, catalog, entities, packages,
    raw: () => raw, writes: () => writes, fail: () => { fail = true; } };
}

test('production catalog starts empty without a song and never exposes the global custody library', () => {
  const f = fixture(); const raw = f.raw(); const token = f.library.currentToken();
  assert(f.library.listContentInfo().length > 0);
  assert.equal(f.catalog.project!(), undefined); assert.deepEqual(f.catalog.list(), []); assert.deepEqual(f.catalog.listDrafts(), []);
  assert.deepEqual(f.library.currentProjectView!('missing'), undefined);
  assert.equal(f.raw(), raw); assert.equal(f.library.currentToken(), token);
});

test('the current song replaces its saved snapshot and repeated identities appear exactly once', () => {
  const f = fixture(); f.song.createFromPhrase(f.melody.id, '本曲'); saved(f.song.save('new'));
  const body = f.song.read().body!; f.song.copyClip(body.tracks[0]!.id, body.tracks[0]!.clips[0]!.id, body.tracks[0]!.id, 4);
  const raw = f.raw(); const token = f.library.currentToken(); const writes = f.writes();
  assert.equal(f.catalog.project!()!.name, '本曲');
  assert.deepEqual(f.catalog.list().map(item => item.kind).sort(), ['rootsound.phrase', 'rootsound.timbre']);
  assert.deepEqual(f.catalog.listDrafts().map(item => item.id), [f.song.read().draft!.id]);
  assert.equal(f.catalog.list('', 'rootsound.timbre').length, 1);
  assert.equal(f.entities.read().current.length, 2);
  assert.equal(f.raw(), raw); assert.equal(f.writes(), writes); assert.equal(f.library.currentToken(), token);
});

test('only the working graph is listed, excluding older saved dependencies, undo custody and foreign same-name songs', () => {
  const f = fixture(); f.song.createFromPhrase(f.melody.id, '第一首'); saved(f.song.save('new'));
  const firstDraft = f.song.read().draft!; const oldIds = new Set(f.catalog.list().map(item => item.id));
  f.song.createFromPhrase(f.melody.id, '第二首'); const foreignIds = new Set(f.catalog.list().map(item => item.id));
  assert.deepEqual(f.catalog.list().map(item => item.name).sort(), ['木琴', '短句']);
  f.song.openDraft(firstDraft.id);
  f.timbre.create(); f.timbre.rename('新的音色'); const newVoice = saved(f.timbre.save('new'));
  f.phrase.create(newVoice.id); f.phrase.rename('新的乐句');
  f.phrase.addNote(f.phrase.read().body!.parts[0]!.id, { startBeat: 0, durationBeats: 1, frequencyHz: 330, velocity: .6 });
  const newPhrase = saved(f.phrase.save('new')); const track = f.song.read().body!.tracks[0]!;
  f.song.addClip(track.id, newPhrase.id, 8); f.song.removeClip(track.id, track.clips[0]!.id);
  const before = f.raw(); const current = f.catalog.list();
  assert.deepEqual(current.map(item => item.name).sort(), ['新的乐句', '新的音色']);
  assert(current.every(item => !oldIds.has(item.id) && !foreignIds.has(item.id)));
  assert([...oldIds].every(id => f.library.readContentInfo(id)), 'old contents stay in custody for recovery');
  assert(f.library.listContentInfoForDraft!(firstDraft.id).every(item => !oldIds.has(item.id) && !foreignIds.has(item.id)));
  assert.throws(() => f.catalog.usage([...foreignIds][0]!), /当前歌曲/);
  assert.equal(f.raw(), before);
  const file = JSON.parse(f.packages.exportDraft(firstDraft.id).text);
  assert(file.contents.every((item: { id: string }) => !oldIds.has(item.id) && !foreignIds.has(item.id)));
  f.song.undo(); assert(f.catalog.list().some(item => oldIds.has(item.id)), 'undo restores the actual current graph');
  f.song.redo(); assert(f.catalog.list().every(item => !oldIds.has(item.id)));
});

test('a current working entity replaces its saved card, while clean and stale recovery drafts do not multiply entries', () => {
  const f = fixture(); f.song.createFromPhrase(f.melody.id, '本曲');
  const voice = f.catalog.list('', 'rootsound.timbre')[0]!;
  const stale = f.library.createDraft({ sourceId: voice.id });
  const working = f.library.createDraft({ sourceId: voice.id }); f.library.updateDraft(working.id, { name: '银色' });
  assert.deepEqual(f.catalog.list('', 'rootsound.timbre'), []);
  assert.deepEqual(f.catalog.listDrafts('', 'rootsound.timbre').map(item => item.id), [working.id]);
  const rail = f.entities.read().current.find(item => item.kind === 'rootsound.timbre')!;
  assert.equal(rail.id, voice.id); assert.equal(rail.draftId, working.id); assert.equal(rail.name, '银色');
  assert.deepEqual(f.catalog.list('木琴'), []); assert.deepEqual(f.catalog.listDrafts('木琴'), [], 'search cannot revive a replaced saved name');
  saved(f.library.saveDraft(working.id, 'overwrite'));
  f.library.updateDraft(stale.id, { name: '旧恢复稿' });
  assert.equal(f.catalog.list('', 'rootsound.timbre')[0]!.name, '银色');
  assert.deepEqual(f.catalog.listDrafts('', 'rootsound.timbre'), []);
});

test('same display names in different dimensions remain separate actual entities', () => {
  const f = fixture(); f.phrase.rename('木琴'); const melody = saved(f.phrase.save('overwrite'));
  f.song.createFromPhrase(melody.id, '本曲');
  const matching = f.catalog.list('木琴');
  assert.equal(matching.length, 2); assert.equal(new Set(matching.map(item => item.id)).size, 2);
  assert.deepEqual(matching.map(item => item.kind).sort(), ['rootsound.phrase', 'rootsound.timbre']);
  assert.equal(f.entities.read().current.filter(item => item.name === '木琴').length, 2);
});

test('explicit unused project copies retain membership and exact dependencies across v2 files and cold reopen', () => {
  const f = fixture(); f.song.createFromPhrase(f.melody.id, '本曲'); saved(f.song.save('new'));
  const source = f.catalog.list('', 'rootsound.phrase')[0]!;
  const copy = saved(f.catalog.duplicate(source.id, '备用乐句', source.revision));
  assert.equal(f.library.projectScopeOf!({ type: 'content', id: copy.id }), f.library.projectScopeOf!({ type: 'draft', id: f.song.read().draft!.id }));
  assert(f.catalog.list().some(item => item.id === copy.id)); assert.deepEqual(copy.dependencies, source.dependencies);
  const raw = f.raw(); const file = f.packages.exportDraft(f.song.read().draft!.id); const envelope = JSON.parse(file.text);
  assert.equal(envelope.version, 2); assert.deepEqual(envelope.memberIds, [copy.id]); assert.equal(file.contentCount, 4);
  assert.equal(f.raw(), raw);
  const target = createMaterialLibrary(undefined, f.policy);
  const imported = createProjectPackages(target, f.adapters, { rootKind: 'rootsound.song' }).importProject(file.text);
  assert.equal(imported.status, 'imported', JSON.stringify(imported)); if (imported.status !== 'imported') return;
  const importedView = target.currentProjectView!(imported.draft.id)!;
  assert.equal(importedView.memberIds.length, 1);
  assert.equal(importedView.contents.find(item => item.id === importedView.memberIds[0])!.name, '备用乐句');
  assert(importedView.contents.every(item => !f.library.readContentInfo(item.id)));
  const reopened = createMaterialLibrary(f.storage, f.policy);
  assert(reopened.currentProjectView!(f.song.read().draft!.id)!.contents.some(item => item.id === copy.id));
  const track = f.song.read().body!.tracks[0]!; f.song.removeClip(track.id, track.clips[0]!.id);
  assert.deepEqual(f.catalog.list().map(item => item.name).sort(), ['备用乐句', '木琴']);
});

test('project copies reject duplicate names and failed writes without exposing any partial membership', () => {
  const f = fixture(); f.song.createFromPhrase(f.melody.id, '本曲');
  const source = f.catalog.list('', 'rootsound.timbre')[0]!; const before = f.raw();
  assert.equal(f.catalog.duplicate(source.id, source.name, source.revision).status, 'conflict');
  assert.equal(f.raw(), before);
  f.fail(); assert.equal(f.catalog.duplicate(source.id, '另一个音色', source.revision).status, 'storage-error');
  assert.equal(f.raw(), before); assert.equal(f.catalog.list('', 'rootsound.timbre').length, 1);
  assert.deepEqual(f.library.currentProjectView!(f.song.read().draft!.id)!.memberIds, []);
});

test('v2 accepts only declared member closures and rejects invalid or hidden extra content without writes', () => {
  const f = fixture(); f.song.createFromPhrase(f.melody.id, '本曲');
  const source = f.catalog.list('', 'rootsound.timbre')[0]!; saved(f.catalog.duplicate(source.id, '备用音色', source.revision));
  const original = JSON.parse(f.packages.exportDraft(f.song.read().draft!.id).text);
  for (const change of [
    (value: typeof original) => { value.memberIds = ['missing']; },
    (value: typeof original) => { value.memberIds.push(value.memberIds[0]); },
    (value: typeof original) => { value.memberIds = [value.rootId]; },
    (value: typeof original) => { value.memberIds = []; },
    (value: typeof original) => { value.contents.push({ ...value.contents.at(-1), id: 'undeclared' }); },
  ]) {
    const value = structuredClone(original); change(value); let writes = 0;
    const target = createMaterialLibrary({ read: () => null, write() { writes++; } }, f.policy);
    assert.equal(createProjectPackages(target, f.adapters, { rootKind: 'rootsound.song' }).importProject(JSON.stringify(value)).status, 'conflict');
    assert.equal(writes, 0); assert.deepEqual(target.listContent(), []);
  }
});

test('project files refuse unfinished current source edits, ignore unrelated drafts, and export after completion', () => {
  const f = fixture(); f.song.createFromPhrase(f.melody.id, '本曲');
  const song = f.song.read().draft!; const voice = f.catalog.list('', 'rootsound.timbre')[0]!;
  f.timbre.create(); f.timbre.rename('无关音色'); f.timbre.setLevel(.12);
  assert.equal(f.packages.exportDraft(song.id).contentCount, 3, 'unrelated public work does not block this song');
  const working = f.library.createDraft({ sourceId: voice.id });
  f.library.updateDraft(working.id, { name: '当前尚未保存的音色' });
  const raw = f.raw(); const token = f.library.currentToken(); const writes = f.writes();
  assert.throws(() => f.packages.exportDraft(song.id), /先完成或取消当前音色、乐句等素材/);
  assert.equal(f.raw(), raw); assert.equal(f.library.currentToken(), token); assert.equal(f.writes(), writes);
  saved(f.library.saveDraft(working.id, 'overwrite'));
  const file = JSON.parse(f.packages.exportDraft(song.id).text);
  assert(file.contents.some((item: { name: string }) => item.name === '当前尚未保存的音色'));
  assert(!file.contents.some((item: { name: string }) => item.name === '无关音色'));
});

test('unfinished explicit unused members also block project files until their current edit is saved', () => {
  const f = fixture(); f.song.createFromPhrase(f.melody.id, '本曲');
  const source = f.catalog.list('', 'rootsound.phrase')[0]!;
  const copy = f.catalog.duplicate(source.id, '备用乐句', source.revision);
  assert.equal(copy.status, 'saved'); if (copy.status !== 'saved') return;
  f.library.updateDraft(copy.draft.id, { name: '备用乐句的新名称' });
  const raw = f.raw(); const writes = f.writes();
  assert.throws(() => f.packages.exportDraft(f.song.read().draft!.id), /先完成或取消当前音色、乐句等素材/);
  assert.equal(f.raw(), raw); assert.equal(f.writes(), writes);
  saved(f.library.saveDraft(copy.draft.id, 'overwrite'));
  const file = JSON.parse(f.packages.exportDraft(f.song.read().draft!.id).text);
  assert.equal(file.version, 2); assert(file.contents.some((item: { name: string }) => item.name === '备用乐句的新名称'));
});

test('current usage traverses working phrase identities to the song without exposing self, old saves or other songs', () => {
  const f = fixture(); f.song.createFromPhrase(f.melody.id, '本曲'); const old = saved(f.song.save('new'));
  const root = f.song.read().draft!; const phrase = f.catalog.list('', 'rootsound.phrase')[0]!;
  const timbre = f.catalog.list('', 'rootsound.timbre')[0]!;
  f.song.createFromPhrase(f.melody.id, '别曲'); const foreign = f.song.read().draft!;
  f.song.openDraft(root.id);
  const working = f.library.createDraft({ sourceId: phrase.id }); f.library.updateDraft(working.id, { name: '正在写的旋律' });
  const raw = f.raw(); const token = f.library.currentToken();
  const voices = f.catalog.usage(timbre.id);
  assert.deepEqual(voices.saved, []);
  assert.deepEqual(new Set(voices.drafts.map(item => item.id)), new Set([working.id, root.id]));
  assert(voices.drafts.every(item => item.id !== foreign.id && item.id !== old.id));
  const melody = f.catalog.usage(phrase.id);
  assert.deepEqual(melody.saved, []); assert.deepEqual(melody.drafts.map(item => item.id), [root.id]);
  assert.equal(f.raw(), raw); assert.equal(f.library.currentToken(), token);
});

test('an empty song saves as a root-only v1 file without source writes and reopens as an editable project', () => {
  const f = fixture(); f.song.create(); f.song.rename('空白工程');
  const before = f.raw(); const token = f.library.currentToken(); const writes = f.writes();
  const output = f.packages.exportDraft(f.song.read().draft!.id); const file = JSON.parse(output.text);
  assert.equal(file.version, 1); assert.equal(output.contentCount, 1); assert.equal(file.contents.length, 1);
  assert.equal(file.contents[0].id, file.rootId); assert.deepEqual(file.contents[0].dependencies, []);
  assert(file.contents[0].body.tracks.every((track: { clips: unknown[] }) => track.clips.length === 0));
  assert.equal(f.raw(), before); assert.equal(f.library.currentToken(), token); assert.equal(f.writes(), writes);
  const target = createMaterialLibrary(undefined, f.policy);
  const imported = createProjectPackages(target, f.adapters, { rootKind: 'rootsound.song' }).importProject(output.text);
  assert.equal(imported.status, 'imported'); if (imported.status !== 'imported') return;
  const editor = createSongEditor(target, createPhrasePlayback(target, createTimbrePlayback(target)), { defaultTempoMode: 'source' });
  editor.openDraft(imported.draft.id); assert.equal(editor.read().draft!.name, '空白工程');
  assert(editor.read().body!.tracks.every(track => track.clips.length === 0));
  editor.rename('可以继续写的工程'); editor.addTrack('新轨');
  assert.equal(editor.read().draft!.name, '可以继续写的工程'); assert.equal(editor.read().body!.tracks.length, 2);
  assert.equal(target.listContentInfo().length, 1);
});
