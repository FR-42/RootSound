import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createInitialProjectLibrary, createProjectCopyLibrary } from '../src/workstation/app/project-setup.ts';
import { createMaterialLibrary, createProjectPackages } from '../src/workstation/modules/materials/public.ts';
import { createTimbreEditor, createTimbrePlayback, createTimbreReferenceAdapter } from '../src/workstation/modules/timbre/public.ts';
import { createPhraseEditor, createPhrasePlayback, createPhraseReferenceAdapter } from '../src/workstation/modules/phrase/public.ts';
import { createSongEditor, createSongReferenceAdapter } from '../src/workstation/modules/song/public.ts';

function open(text: string) {
  let raw = text;
  const library = createMaterialLibrary({ read: () => raw, write: value => { raw = value; } });
  const playback = createPhrasePlayback(library, createTimbrePlayback(library));
  const song = createSongEditor(library, playback, { defaultTempoMode: 'source' });
  return { library, song, raw: () => raw };
}

// Project adoption may renew material identities; musical placement and the
// referenced audio must survive rather than depending on the old identifiers.
function arrangementShape(body: ReturnType<ReturnType<typeof createSongEditor>['read']>['body']) {
  return body && { ...body, tracks: body.tracks.map(track => ({ ...track, clips: track.clips.map(clip => ({ ...clip, phraseId: 'reference' })) })) };
}

function fixture() {
  const f = open(createInitialProjectLibrary('原歌曲'));
  const tone = createTimbreEditor(f.library); const toneResult = tone.save('new');
  assert.equal(toneResult.status, 'saved'); if (toneResult.status !== 'saved') throw new Error('tone');
  const phrase = createPhraseEditor(f.library, createTimbrePlayback(f.library));
  phrase.create(toneResult.content.id); phrase.rename('独立乐句'); phrase.setTempo(90);
  phrase.addNote(phrase.read().body!.parts[0]!.id, { startBeat: .5, durationBeats: .75, frequencyHz: 330, velocity: .6 });
  const phraseResult = phrase.save('new'); if (phraseResult.status !== 'saved') throw new Error('phrase');
  const tracks = f.song.read().body!.tracks;
  const clip = f.song.addClip(tracks[0]!.id, phraseResult.content.id, 2.125);
  f.song.updateClip(tracks[0]!.id, clip, { pan: -.2, level: .7 });
  f.song.updateTrack(tracks[0]!.id, { name: '主音', color: '#746AC9' });
  f.song.updateTrack(tracks[2]!.id, { name: '鼓点', color: '#D79054' });
  f.song.reorderTrack(tracks[0]!.id, 3);
  f.song.setGridTempo(140);
  f.song.setGridTempo(180, 2.5);
  f.song.setGridTempo(95, 5.75);
  return f;
}

test('save-as and reopen preserve row order/color, per-instance mix and cursor-based grid sections independently', () => {
  const f = fixture(); const original = f.raw(); const expectedBody = f.song.read().body;
  const expectedPlan = f.song.previewPlan(); const draftId = f.song.read().draft!.id;
  const text = createProjectCopyLibrary(original, '原歌曲 1', draftId);
  assert.equal(f.raw(), original);
  const copy = open(text);
  copy.song.openDraft(draftId);
  assert.equal(copy.song.read().draft!.name, '原歌曲 1');
  assert.deepEqual(arrangementShape(copy.song.read().body), arrangementShape(expectedBody));
  assert.deepEqual(copy.song.previewPlan(), expectedPlan);
  copy.song.updateTrack(copy.song.read().body!.tracks[3]!.id, { color: '#112233' });
  copy.song.setGridTempo(210, 4);
  assert.equal(f.raw(), original);
  assert.deepEqual(f.song.read().body, expectedBody);
  const reopened = open(copy.raw()); reopened.song.openDraft(draftId);
  assert.deepEqual(reopened.song.read().body, copy.song.read().body);
  assert.deepEqual(reopened.song.previewPlan(), expectedPlan);
});

test('portable project interchange retains visual tempo boundaries and row controls without changing phrase timing', () => {
  const f = fixture();
  const adapters = [createSongReferenceAdapter(), createPhraseReferenceAdapter(), createTimbreReferenceAdapter()];
  const packageService = createProjectPackages(f.library, adapters, { rootKind: 'rootsound.song' });
  const exported = packageService.exportDraft(f.song.read().draft!.id);
  const destination = createMaterialLibrary();
  const result = createProjectPackages(destination, adapters, { rootKind: 'rootsound.song' }).importProject(exported.text);
  assert.equal(result.status, 'imported'); if (result.status !== 'imported') throw new Error('import');
  const song = createSongEditor(destination, createPhrasePlayback(destination, createTimbrePlayback(destination)), { defaultTempoMode: 'source' });
  song.openDraft(result.draft.id);
  const body = song.read().body!; const expected = f.song.read().body!;
  assert.deepEqual(body.gridTempoChanges, expected.gridTempoChanges);
  assert.deepEqual(body.tracks.map(track => ({ name: track.name, color: track.color })), expected.tracks.map(track => ({ name: track.name, color: track.color })));
  assert.deepEqual(song.previewPlan(), f.song.previewPlan());
});

test('deleting every row leaves a saveable project that reopens and can add a row again', () => {
  const f = fixture();
  for (const track of f.song.read().body!.tracks) f.song.removeTrack(track.id);
  assert.deepEqual(f.song.read().body!.tracks, []);
  const draftId = f.song.read().draft!.id;
  const copy = open(createProjectCopyLibrary(f.raw(), '空编排', draftId)); copy.song.openDraft(draftId);
  assert.deepEqual(copy.song.read().body!.tracks, []);
  assert.equal(copy.song.previewPlan(undefined, { allowSilence: true }).events.length, 0);
  const id = copy.song.addTrack();
  assert.equal(copy.song.read().body!.tracks[0]!.id, id);
  assert.equal(copy.song.read().body!.tracks[0]!.name, '行1');
});
