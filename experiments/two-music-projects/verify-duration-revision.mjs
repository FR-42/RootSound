import { readFile, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { openMusicDocument } from '../../src/workstation/app/music-document.ts';
import { createMaterialLibrary } from '../../src/workstation/modules/materials/public.ts';
import { createTimbrePlayback, createTimbreReferenceAdapter } from '../../src/workstation/modules/timbre/public.ts';
import { createPhraseEditor, createPhrasePlayback, createPhraseReferenceAdapter } from '../../src/workstation/modules/phrase/public.ts';
import { createSongEditor, createSongReferenceAdapter } from '../../src/workstation/modules/song/public.ts';
import { createSampleAudio, createBrowserSampleDecoder, createSampleReferenceAdapter } from '../../src/workstation/modules/sampling/public.ts';
import { createSampleBankAudio } from '../../src/workstation/modules/timbre/sample-bank.ts';

const folder = new URL('./duration-revision/', import.meta.url);
const reports = JSON.parse(await readFile(new URL('report.json', folder), 'utf8')), results = [];
for (const report of reports) {
  const envelope = JSON.parse(await readFile(new URL(report.stagedFile, folder), 'utf8'));
  const before = JSON.parse(JSON.parse(await readFile(new URL(report.backupFile, folder), 'utf8')).libraryText);
  const beforeScore = before.contents.find(content => content.id === before.drafts.find(draft => draft.kind === 'rootsound.song').dependencies[0]);
  let text = envelope.libraryText;
  const library = createMaterialLibrary({ read: () => text, write: next => { text = next; } }, { project: { rootKind: 'rootsound.song',
    adapters: [createTimbreReferenceAdapter(), createPhraseReferenceAdapter(), createSongReferenceAdapter(), createSampleReferenceAdapter()] } });
  const samples = createSampleAudio(library, createBrowserSampleDecoder());
  const bank = createSampleBankAudio(library, samples, async () => { throw new Error('No external audio allowed'); });
  const tones = createTimbrePlayback(library, samples, undefined, bank), score = createPhraseEditor(library, tones);
  const song = createSongEditor(library, createPhrasePlayback(library, tones), { defaultTempoMode: 'source' }); openMusicDocument(library, song, score);
  const expected = structuredClone(beforeScore.body), changes = new Map(report.changes.map(change => [change.id, change.after]));
  for (const part of expected.parts) for (const note of part.notes) if (changes.has(note.id)) {
    note.durationSeconds = changes.get(note.id); note.durationBeats = Math.min(expected.lengthBeats - note.startBeat, note.durationSeconds * expected.tempoBpm / 60);
  }
  assert.deepEqual(score.read().body, expected, 'Only the authorized durations may differ from the user-edited score');
  await score.preparePreview(); const plan = score.previewPlan();
  const noteCount = expected.parts.reduce((sum, part) => sum + part.notes.length, 0);
  assert.equal(plan.events.length, noteCount);
  assert(plan.events.every(event => event.sound.kind === 'sample' && event.sound.source.audio.channels[0].length > 0));
  results.push({ project: report.destination, notes: noteCount, shortened: report.shortenedNotes, allOtherMusicalEditsPreserved: true,
    domainReopen: true, portableSampleEventsVerified: true, actualDevicePlayback: false });
}
await writeFile(new URL('verification.json', folder), JSON.stringify(results, null, 2)); console.log(JSON.stringify(results, null, 2));
