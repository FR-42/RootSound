import assert from 'node:assert/strict';
import { test } from 'node:test';
import { Worker as ThreadWorker } from 'node:worker_threads';
import { createInitialProjectLibrary, createProjectCopyLibraryAsync } from '../src/workstation/app/project-setup.ts';
import { openMusicDocument } from '../src/workstation/app/music-document.ts';
import { saveMusicDocument } from '../src/workstation/app/music-save.ts';
import { createMaterialLibrary } from '../src/workstation/modules/materials/public.ts';
import { createPhraseEditor, createPhrasePlayback, createPhraseReferenceAdapter } from '../src/workstation/modules/phrase/public.ts';
import { createSongEditor, createSongReferenceAdapter } from '../src/workstation/modules/song/public.ts';
import { createTimbrePlayback, createTimbreReferenceAdapter } from '../src/workstation/modules/timbre/public.ts';

class TestWorker {
  onmessage?: (event: { data: unknown }) => void;
  onerror?: (error: Error) => void;
  worker: ThreadWorker;
  constructor(url: URL) {
    this.worker = new ThreadWorker(new URL('./music-save-worker-host.ts', import.meta.url), { workerData: { target: url.href } });
    this.worker.on('message', data => this.onmessage?.({ data }));
    this.worker.on('error', error => this.onerror?.(error instanceof Error ? error : new Error(String(error))));
  }
  postMessage(value: unknown) { this.worker.postMessage(value); }
  terminate() { void this.worker.terminate(); }
}
function fixture() {
  let raw = createInitialProjectLibrary('保存测试'), writes = 0, fail = false;
  const library = createMaterialLibrary({ read: () => raw, write: value => { if (fail) throw Error('写盘失败'); raw = value; writes++; } }, {
    project: { rootKind: 'rootsound.song', adapters: [createTimbreReferenceAdapter(), createPhraseReferenceAdapter(), createSongReferenceAdapter()] },
  });
  const tones = createTimbrePlayback(library), score = createPhraseEditor(library, tones);
  const song = createSongEditor(library, createPhrasePlayback(library, tones), { defaultTempoMode: 'source' });
  openMusicDocument(library, song, score);
  const tone = library.listContentInfo().find(item => item.kind === 'rootsound.timbre')!;
  const partId = score.addPart(tone.id);
  const noteId = score.addNote(partId, { startBeat: 1, durationBeats: .5, frequencyHz: 440, velocity: .7 });
  score.setNoteWritesDeferred!(true);
  const draftId = score.read({ includeCatalog: false, sharedDraft: true }).draft!.id;
  score.editDraftNote!(draftId, partId, { kind: 'gain', id: noteId, gainDb: 6 });
  return { library, score, song, draftId, noteId, partId, raw: () => raw, writes: () => writes, fail: () => { fail = true; } };
}
async function withWorker(action: () => Promise<void>) {
  const previous = globalThis.Worker;
  globalThis.Worker = TestWorker as unknown as typeof Worker;
  try { await action(); } finally { globalThis.Worker = previous; }
}
test('background save commits one snapshot and preserves note gain and undo/redo history', () => withWorker(async () => {
  const f = fixture(), history = f.library.readDraftHistory(f.draftId), writes = f.writes();
  const body = f.score.read({ includeCatalog: false, sharedDraft: true }).body;
  await saveMusicDocument(f.library, f.song, f.score);
  assert.equal(f.writes(), writes + 1);
  assert.deepEqual(f.library.readDraftHistory(f.draftId), history);
  assert.equal(f.score.read({ includeCatalog: false, sharedDraft: true }).body, body);
  assert.equal(f.score.read().body!.parts[0]!.notes[0]!.gainDb, 6);
  assert.equal(f.library.hasDeferredWrites!(), false);
  const parsed = JSON.parse(f.raw());
  assert.equal(parsed.contents.find((x: { kind: string }) => x.kind === 'rootsound.phrase').body.parts[0].notes[0].gainDb, 6);
  f.score.undo(); assert.equal(f.score.read().body!.parts[0]!.notes[0]!.gainDb, undefined);
  f.score.redo(); assert.equal(f.score.read().body!.parts[0]!.notes[0]!.gainDb, 6);
}));
test('changes made while a background save is preparing cannot be overwritten', () => withWorker(async () => {
  const f = fixture(), before = f.raw();
  const saving = saveMusicDocument(f.library, f.song, f.score);
  f.score.editDraftNote!(f.draftId, f.partId, { kind: 'gain', id: f.noteId, gainDb: 3 });
  await assert.rejects(saving, /保存期间音乐已变化/);
  assert.equal(f.raw(), before);
  assert.equal(f.score.read().body!.parts[0]!.notes[0]!.gainDb, 3);
}));
test('a failed background save retains the file and editable changes for retry', () => withWorker(async () => {
  const f = fixture(), before = f.raw(); f.fail();
  await assert.rejects(saveMusicDocument(f.library, f.song, f.score), /写盘失败/);
  assert.equal(f.raw(), before);
  assert.equal(f.score.read().body!.parts[0]!.notes[0]!.gainDb, 6);
  assert.equal(f.library.hasDeferredWrites!(), true);
}));

test('background save-as preserves the source and every note while renaming the copy', () => withWorker(async () => {
  const f = fixture();
  await saveMusicDocument(f.library, f.song, f.score);
  const before = f.raw();
  const copy = await createProjectCopyLibraryAsync(before, '副本', f.song.readDraft()!.id);
  assert.equal(f.raw(), before);
  const parsed = JSON.parse(copy);
  const phrase = parsed.contents.find((x: { kind: string }) => x.kind === 'rootsound.phrase');
  assert.equal(phrase.name, '副本');
  assert.equal(phrase.body.parts[0].notes[0].gainDb, 6);
  await assert.rejects(createProjectCopyLibraryAsync('broken', '副本', f.draftId));
  assert.equal(f.raw(), before);
}));
