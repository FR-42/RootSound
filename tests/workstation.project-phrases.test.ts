import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { ContentRecord, MaterialLibrary, SaveResult } from '../src/workstation/contracts/content.ts';
import { createProjectPhrase, retainProjectPhrases } from '../src/workstation/app/project-phrases.ts';
import { createMaterialLibrary, createProjectPackages } from '../src/workstation/modules/materials/public.ts';
import { createTimbreEditor, createTimbrePlayback, createTimbreReferenceAdapter } from '../src/workstation/modules/timbre/public.ts';
import { createPhraseEditor, createPhrasePlayback, createPhraseReferenceAdapter, readPhraseBody } from '../src/workstation/modules/phrase/public.ts';
import { createSongEditor, createSongReferenceAdapter } from '../src/workstation/modules/song/public.ts';
import { createProjectAssets } from '../src/workstation/modules/project-assets/public.ts';

function saved(result: SaveResult): ContentRecord {
  assert.equal(result.status, 'saved', JSON.stringify(result));
  if (result.status !== 'saved') throw new Error('Expected saved content.');
  return result.content;
}
function fixture() {
  let raw: string | null = null; let writes = 0; let fail = false;
  const storage = { read: () => raw, write(value: string) { if (fail) throw new Error('测试磁盘拒绝写入'); raw = value; writes++; } };
  const adapters = [createTimbreReferenceAdapter(), createPhraseReferenceAdapter(), createSongReferenceAdapter()];
  const policy = { project: { rootKind: 'rootsound.song', adapters } };
  const library = createMaterialLibrary(storage, policy);
  const sounds = createTimbrePlayback(library); const phrases = createPhrasePlayback(library, sounds);
  const phrase = createPhraseEditor(library, sounds);
  const song = createSongEditor(library, phrases, { defaultTempoMode: 'source', initialTrackCount: 7 });
  song.create(); song.rename('新的歌曲');
  const songId = song.read().draft!.id;
  const assets = createProjectAssets(library, () => library.readDraft(songId));
  return { library, sounds, phrases, phrase, song, songId, assets, storage, policy, adapters,
    raw: () => raw, writes: () => writes, fail: () => { fail = true; } };
}
function publicPhrase(library: MaterialLibrary, name: string): ContentRecord {
  const timbre = createTimbreEditor(library); timbre.rename(`${name} 公共音色`); const voice = saved(timbre.save('new'));
  const phrase = createPhraseEditor(library, createTimbrePlayback(library)); phrase.create(voice.id); phrase.rename(name);
  phrase.addNote(phrase.read().body!.parts[0]!.id, { startBeat: 0, durationBeats: 1, frequencyHz: 330, velocity: 0.7 });
  return saved(phrase.save('new'));
}

test('a new empty reusable phrase enters the current shelf in one write without changing the song or its history', () => {
  const f = fixture(); const song = f.song.read().draft!; const history = f.library.readDraftHistory(f.songId); const writes = f.writes();
  const created = createProjectPhrase(f.library, f.songId);
  assert.equal(f.writes() - writes, 1);
  assert.deepEqual(f.song.read().draft, song); assert.deepEqual(f.library.readDraftHistory(f.songId), history);
  assert.equal(f.song.read().draft!.sourceId, undefined, 'creating a shelf item does not silently save the song');
  const record = f.phrases.readSaved(created.id).content; const body = readPhraseBody(record.body);
  assert.equal(record.name, '乐句 1'); assert.equal(body.parts.length, 1); assert.deepEqual(body.parts[0]!.notes, []);
  assert.equal(body.lengthBeats, 16, 'new project phrases span four bars without changing old phrase defaults');
  const draft = f.library.readDraft(created.draftId)!;
  assert.equal(draft.sourceId, record.id); assert.equal(draft.name, record.name); assert.deepEqual(draft.body, record.body);
  assert.equal(f.library.listDrafts().filter(item => item.kind === 'rootsound.timbre').length, 0, 'temporary voice work never enters the real project');
  assert.deepEqual(f.assets.read().current.map(item => item.kind).sort(), ['rootsound.phrase', 'rootsound.timbre']);
  assert.equal(f.assets.read().current.find(item => item.kind === 'rootsound.phrase')!.id, created.id);
  assert.deepEqual(f.library.currentProjectView!(f.songId)!.memberIds, [created.id]);
  assert.equal(f.library.projectScopeOf!({ type: 'content', id: created.id }), f.library.projectScopeOf!({ type: 'draft', id: f.songId }));
  assert.equal(f.library.projectScopeOf!({ type: 'content', id: body.parts[0]!.timbreId }), f.library.projectScopeOf!({ type: 'draft', id: f.songId }));
  f.phrase.openDraft(created.draftId); assert.throws(() => f.phrase.save('overwrite'), /先添加几个音符/);
  f.song.undo(); assert.equal(f.song.read().draft!.name, '我的第一首歌', 'the existing song history remains usable');
  assert(f.assets.read().current.some(item => item.id === created.id));
});

test('writing notes, saving, placing and erasing an instance keep the reusable phrase and independent note undo', () => {
  const f = fixture(); const created = createProjectPhrase(f.library, f.songId); f.phrase.openDraft(created.draftId);
  const part = f.phrase.read().body!.parts[0]!.id;
  f.phrase.addNote(part, { startBeat: 0.25, durationBeats: 1.5, frequencyHz: 440, velocity: 0.6 });
  f.phrase.undo(); assert.deepEqual(f.phrase.read().body!.parts[0]!.notes, []);
  assert(f.assets.read().current.some(item => item.id === created.id));
  f.phrase.redo(); assert.equal(f.phrase.read().body!.parts[0]!.notes.length, 1);
  assert.equal(f.assets.read().current.find(item => item.id === created.id)!.draftId, created.draftId);
  const content = saved(f.phrase.save('overwrite')); assert.equal(content.id, created.id);
  const track = f.song.read().body!.tracks[0]!.id; const clip = f.song.addClip(track, created.id, 3.125);
  assert.equal(f.song.previewPlan().events.length, 1);
  retainProjectPhrases(f.library, f.songId, [created.id]);
  f.song.removeClip(track, clip); assert.deepEqual(f.song.read().draft!.dependencies, []);
  assert(f.assets.read().current.some(item => item.id === created.id));
  const reopened = createMaterialLibrary(f.storage, f.policy);
  const shelf = createProjectAssets(reopened, () => reopened.readDraft(f.songId));
  assert(shelf.read().current.some(item => item.id === created.id));
  const playback = createPhrasePlayback(reopened, createTimbrePlayback(reopened));
  assert.equal(playback.readSaved(created.id).body.parts[0]!.notes.length, 1);
});

test('two new phrases use distinct names and voices while another song can start its own numbering', () => {
  const f = fixture(); const first = createProjectPhrase(f.library, f.songId); const second = createProjectPhrase(f.library, f.songId);
  const one = f.phrases.readSaved(first.id); const two = f.phrases.readSaved(second.id);
  assert.deepEqual([one.content.name, two.content.name], ['乐句 1', '乐句 2']);
  assert.notEqual(one.body.parts[0]!.timbreId, two.body.parts[0]!.timbreId);
  assert.equal(f.library.readContent(one.body.parts[0]!.timbreId)!.name, '乐句 1 音色');
  assert.equal(f.library.readContent(two.body.parts[0]!.timbreId)!.name, '乐句 2 音色');
  f.song.create(); const otherId = f.song.read().draft!.id;
  const other = createProjectPhrase(f.library, otherId); assert.equal(f.library.readContent(other.id)!.name, '乐句 1');
  const raw = f.raw(); assert.throws(() => retainProjectPhrases(f.library, f.songId, [other.id]), /不属于当前歌曲/); assert.equal(f.raw(), raw);
  assert.deepEqual(f.assets.read().current.filter(item => item.kind === 'rootsound.phrase').map(item => item.id).sort(), [first.id, second.id].sort());
});

test('retaining current sources keeps erased phrases on the shelf without listing all historical custody', () => {
  const f = fixture(); const publicRecord = publicPhrase(f.library, '乐句 1'); const track = f.song.read().body!.tracks[0]!.id;
  const firstClip = f.song.addClip(track, publicRecord.id, 0); const adoptedId = f.song.read().body!.tracks[0]!.clips[0]!.phraseId;
  f.song.removeClip(track, firstClip); assert(!f.assets.read().current.some(item => item.id === adoptedId));
  assert(f.library.readContent(adoptedId), 'history retains the old graph without putting it in the current shelf');
  const next = createProjectPhrase(f.library, f.songId); assert.equal(f.library.readContent(next.id)!.name, '乐句 2', 'retained local names remain reserved');
  assert(!f.assets.read().current.some(item => item.id === adoptedId));
  const secondClip = f.song.addClip(track, publicRecord.id, 4); const currentId = f.song.read().body!.tracks[0]!.clips[0]!.phraseId;
  const music = f.song.read().draft!; const history = f.library.readDraftHistory(f.songId);
  retainProjectPhrases(f.library, f.songId, [currentId, currentId]);
  assert.deepEqual(f.song.read().draft, music); assert.deepEqual(f.library.readDraftHistory(f.songId), history);
  assert.deepEqual(new Set(f.library.currentProjectView!(f.songId)!.memberIds), new Set([next.id, currentId]));
  f.song.removeClip(track, secondClip);
  assert(f.assets.read().current.some(item => item.id === currentId));
  const writes = f.writes(); retainProjectPhrases(f.library, f.songId, [currentId]); assert.equal(f.writes(), writes, 'keeping an existing member is a no-op');
});

test('creation and retention failures preserve every original entity, draft, token and undo history', () => {
  const f = fixture(); const source = publicPhrase(f.library, '暂时放入'); const track = f.song.read().body!.tracks[0]!.id;
  f.song.addClip(track, source.id, 0); const currentId = f.song.read().body!.tracks[0]!.clips[0]!.phraseId;
  const raw = f.raw(); const token = f.library.currentToken(); const contents = f.library.listContent(); const drafts = f.library.listDrafts();
  const history = f.library.readDraftHistory(f.songId);
  assert.throws(() => retainProjectPhrases(f.library, f.songId, [currentId, 'missing']), /不属于当前歌曲/);
  assert.throws(() => createProjectPhrase(f.library, 'missing'), /先打开一首歌曲/);
  assert.equal(f.raw(), raw);
  f.fail(); assert.throws(() => createProjectPhrase(f.library, f.songId), /测试磁盘/);
  assert.throws(() => retainProjectPhrases(f.library, f.songId, [currentId]), /测试磁盘/);
  assert.equal(f.raw(), raw); assert.equal(f.library.currentToken(), token);
  assert.deepEqual(f.library.listContent(), contents); assert.deepEqual(f.library.listDrafts(), drafts);
  assert.deepEqual(f.library.readDraftHistory(f.songId), history);
});

test('empty phrases remain explicit project members through packaging and saved-song roots', () => {
  const f = fixture(); const created = createProjectPhrase(f.library, f.songId);
  const packages = createProjectPackages(f.library, f.adapters, { rootKind: 'rootsound.song' });
  const output = packages.exportDraft(f.songId); const file = JSON.parse(output.text);
  assert.equal(file.version, 2); assert.deepEqual(file.memberIds, [created.id]); assert.equal(file.contents.length, 3);
  const savedSong = saved(f.library.saveDraft(f.songId, 'new'));
  const second = createProjectPhrase(f.library, f.songId);
  assert.deepEqual(new Set(f.library.currentProjectView!(f.songId)!.memberIds), new Set([created.id, second.id]));
  assert.equal(f.library.readDraft(f.songId)!.sourceId, savedSong.id);
  const target = createMaterialLibrary(undefined, f.policy);
  const imported = createProjectPackages(target, f.adapters, { rootKind: 'rootsound.song' }).importProject(output.text);
  assert.equal(imported.status, 'imported'); if (imported.status !== 'imported') throw new Error('Expected imported project.');
  const importedAssets = createProjectAssets(target, () => target.readDraft(imported.draft.id));
  assert.equal(importedAssets.read().current.filter(item => item.kind === 'rootsound.phrase').length, 1);
  const phrase = importedAssets.read().current.find(item => item.kind === 'rootsound.phrase')!;
  assert.deepEqual(readPhraseBody(target.readContent(phrase.id)!.body).parts[0]!.notes, []);
});
