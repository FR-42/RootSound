import assert from 'node:assert/strict';
import test from 'node:test';
import { createInitialProjectLibrary, createProjectCopyLibrary } from '../src/workstation/app/project-setup.ts';
import { importProjectTimbre } from '../src/workstation/app/project-timbre-import.ts';
import { listProjectTimbres, addProjectPhraseTimbre } from '../src/workstation/app/project-timbres.ts';
import { createProjectPhrase } from '../src/workstation/app/project-phrases.ts';
import { createMaterialLibrary, createProjectPackages } from '../src/workstation/modules/materials/public.ts';
import { createTimbrePlayback, createTimbreReferenceAdapter, prepareBasicTimbre } from '../src/workstation/modules/timbre/public.ts';
import { createPhrasePlayback, createPhraseReferenceAdapter } from '../src/workstation/modules/phrase/public.ts';
import { createSongEditor, createSongReferenceAdapter } from '../src/workstation/modules/song/public.ts';
import { createSampleReferenceAdapter } from '../src/workstation/modules/sampling/public.ts';
import { createDesktopTimbreFiles } from '../src/workstation/app/platform/timbre-files.ts';
import { readTimbreImport } from '../src/workstation/app/timbre-file-import.ts';
import { encodeBase64, encodeFloatWav } from '../src/workstation/modules/sampling/audio.ts';
import type { ContentRecord } from '../src/workstation/contracts/content.ts';

const adapters = [createTimbreReferenceAdapter(), createPhraseReferenceAdapter(), createSongReferenceAdapter(), createSampleReferenceAdapter()];
function fixture() {
  let raw = createInitialProjectLibrary('本曲'); let fail = false;
  const storage = { read: () => raw, write(text: string) { if (fail) throw new Error('测试写入失败'); raw = text; } };
  const policy = { project: { rootKind: 'rootsound.song', adapters } };
  const library = createMaterialLibrary(storage, policy); const playback = createTimbrePlayback(library);
  const song = createSongEditor(library, createPhrasePlayback(library, playback), { defaultTempoMode: 'source' }); const songId = song.read().draft!.id;
  return { library, storage, policy, playback, songId, raw: () => raw, fail() { fail = true; } };
}
test('external voices become independent song-wide members with unique names and no phrase edits', () => {
  const f = fixture(); const original = prepareBasicTimbre('钢琴'); const source = structuredClone(original);
  const before = f.library.readDraft(f.songId); const first = importProjectTimbre(f.library, f.songId, original);
  const second = importProjectTimbre(f.library, f.songId, original);
  assert.equal(first.name, '钢琴 2'); assert.equal(second.name, '钢琴 3');
  assert.notEqual(first.id, second.id); assert.notEqual(first.id, original.id); assert.deepEqual(original, source);
  assert.deepEqual(f.library.readDraft(f.songId), before);
  assert(listProjectTimbres(f.library, f.songId).some(record => record.id === first.id));
  for (let index = 0; index < 2; index++) {
    const phrase = createProjectPhrase(f.library, f.songId); const part = addProjectPhraseTimbre(f.library, f.songId, phrase.draftId, first.id);
    assert(part); assert(f.library.readDraft(phrase.draftId)!.dependencies.includes(first.id));
  }
  const separate = fixture(); const sameName = importProjectTimbre(separate.library, separate.songId, original);
  assert.equal(sameName.name, '钢琴 2');
  assert(!listProjectTimbres(separate.library, separate.songId).some(record => record.id === first.id));
});
test('unused imported tones survive Save As and self-contained project transfer without the source file', () => {
  const f = fixture(); const imported = importProjectTimbre(f.library, f.songId, prepareBasicTimbre('外部声音'));
  const copied = createProjectCopyLibrary(f.raw(), '副本', f.songId);
  const cold = createMaterialLibrary({ read: () => copied, write() {} }, f.policy);
  assert.equal(listProjectTimbres(cold, f.songId).find(record => record.id === imported.id)!.name, '外部声音');
  const packed = createProjectPackages(f.library, adapters, { rootKind: 'rootsound.song' }).exportDraft(f.songId);
  const target = createMaterialLibrary(undefined, f.policy); const packages = createProjectPackages(target, adapters, { rootKind: 'rootsound.song' });
  const adopted = packages.importProject(packed.text);
  assert.equal(adopted.status, 'imported');
  const tone = target.listContentInfo().find(record => record.name === '外部声音')!;
  assert(tone); assert.deepEqual(createTimbrePlayback(target).planForSaved(tone.id, { frequencyHz: 440, holdSeconds: .5, velocity: .7 }).note, { frequencyHz: 440, holdSeconds: .5, velocity: .7 });
});
test('invalid graphs and failed writes add no tone, history or membership', () => {
  const f = fixture(); const voice = prepareBasicTimbre('拒绝的声音'); const raw = f.raw(); const token = f.library.currentToken();
  assert.throws(() => importProjectTimbre(f.library, f.songId, { ...voice, dependencies: ['missing'] }), /引用|依赖/);
  assert.throws(() => importProjectTimbre(f.library, f.songId, voice, [prepareBasicTimbre('不相关')]), /依赖/);
  assert.throws(() => importProjectTimbre(f.library, 'other-song', voice), /歌曲/);
  assert.equal(f.raw(), raw); assert.equal(f.library.currentToken(), token);
  f.fail(); assert.throws(() => importProjectTimbre(f.library, f.songId, voice), /写入失败/);
  assert.equal(f.raw(), raw); assert.equal(f.library.currentToken(), token);
});
test('native tone file port checks transport, cancellation, single picker and mirror warnings', async () => {
  let resolve!: (value: unknown) => void;
  const pending = new Promise<unknown>(done => { resolve = done; });
  const port = createDesktopTimbreFiles({ Open: () => pending, Sync: async () => JSON.stringify({ status: 'warning', directory: 'D:/RootSound/timbres/song', message: '测试目录只读' }) });
  const first = port.open(); await assert.rejects(port.open(), /已有/);
  resolve(JSON.stringify({ status: 'cancelled' })); assert.deepEqual(await first, { status: 'cancelled' });
  assert.deepEqual(await port.sync!(), { status: 'warning', directory: 'D:/RootSound/timbres/song', message: '测试目录只读' });
  await assert.rejects(createDesktopTimbreFiles().open(), /重新打开/);
  for (const value of [null, 'not json', JSON.stringify({ status: 'opened', name: '', text: '{}' }), JSON.stringify({ status: 'error', message: '原文件损坏' })]) {
    const bad = createDesktopTimbreFiles({ Open: async () => value, Sync: async () => value }); await assert.rejects(bad.open());
  }
  const good = createDesktopTimbreFiles({ Open: async () => JSON.stringify({ status: 'opened', name: '中文.rssynth', text: '{"format":"sample"}' }), Sync: async () => JSON.stringify({ status: 'mirrored', directory: 'D:/RootSound/timbres/song' }) });
  assert.equal((await good.open()).status, 'opened'); assert.equal((await good.sync!()).status, 'mirrored');
});

test('portable sample voices rebind only their enclosed exact audio and survive a cold import', () => {
  const f = fixture(); const audio = { sampleRate: 8000, channels: [new Float32Array([0, .25, -.5, .75, 0])] };
  const wav = encodeFloatWav(audio);
  const sample: ContentRecord = { id: 'external-sample', kind: 'rootsound.sample', owner: 'sampling', schemaVersion: 1, revision: 4, name: '原始声音', dependencies: [],
    body: { model: 'audio-sample', version: 1, source: { kind: 'file', name: '原始.wav', mimeType: 'audio/wav' },
      audio: { encoding: 'base64', byteLength: wav.length, data: encodeBase64(wav) }, decoded: { sampleRate: 8000, channels: 1, frames: 5, durationSeconds: 5 / 8000 } } };
  const voice: ContentRecord = { id: 'external-tone', kind: 'rootsound.timbre', owner: 'timbre', schemaVersion: 1, revision: 3, name: '采样声音', dependencies: [sample.id],
    body: { model: 'sample-instrument', version: 1, sampleId: sample.id, startSeconds: 0, endSeconds: 5 / 8000, rootFrequencyHz: 440, attackSeconds: 0, releaseSeconds: .01, level: .7 } };
  const text = JSON.stringify({ format: 'RootSoundTimbre', version: 1, timbre: voice, contents: [sample] });
  const source = readTimbreImport(text, '声音.rssound'); const imported = importProjectTimbre(f.library, f.songId, source.timbre, source.dependencies);
  assert.notEqual(imported.dependencies[0], sample.id); const localSample = f.library.readContent(imported.dependencies[0]!)!;
  assert.deepEqual(localSample.body, sample.body); assert.equal(localSample.revision, 1);
  const reopened = createMaterialLibrary(f.storage, f.policy);
  assert.equal(listProjectTimbres(reopened, f.songId).find(record => record.id === imported.id)!.name, '采样声音');
  assert.deepEqual(reopened.readContent(localSample.id)!.body, sample.body);
  const before = f.raw(); assert.throws(() => importProjectTimbre(f.library, f.songId, voice), /缺少采样/); assert.equal(f.raw(), before);
});

test('file import preserves internal names and rejects unsupported versions or old sample archives', () => {
  const voice = prepareBasicTimbre('文件里的名字');
  const file = JSON.stringify({ format: 'RootSoundSound', version: 1, name: voice.name, timbre: voice.body });
  assert.equal(readTimbreImport('\uFEFF' + file, '完全不同的文件名.rssound').timbre.name, voice.name);
  assert.throws(() => readTimbreImport(file, '旧格式.rstimbre'), /早期采样音色/);
  assert.throws(() => readTimbreImport('{broken', '损坏.rssynth'), /损坏/);
  assert.throws(() => readTimbreImport(JSON.stringify({ format: 'RootSoundTimbre', version: 9, timbre: voice, contents: [] }), '未知.rssound'), /暂不支持/);
});
