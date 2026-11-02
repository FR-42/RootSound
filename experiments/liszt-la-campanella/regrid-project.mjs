import { readFile, writeFile, mkdir, rename } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { openMusicDocument, commitMusicDocument } from '../../src/workstation/app/music-document.ts';
import { createMaterialLibrary } from '../../src/workstation/modules/materials/public.ts';
import { createTimbrePlayback, createTimbreReferenceAdapter } from '../../src/workstation/modules/timbre/public.ts';
import { createPhraseEditor, createPhrasePlayback, createPhraseReferenceAdapter } from '../../src/workstation/modules/phrase/public.ts';
import { createSongEditor, createSongReferenceAdapter } from '../../src/workstation/modules/song/public.ts';
import { createSampleReferenceAdapter } from '../../src/workstation/modules/sampling/public.ts';
import { melodyDetailGrid } from '../../src/workstation/modules/ui-rendering/melody-geometry.ts';

const folder = new URL('./grid-revision/', import.meta.url), hash = data => createHash('sha256').update(data).digest('hex');
if (process.argv.includes('--apply')) {
  // Caller holds the native application's per-project lock for this path.
  const report = JSON.parse(await readFile(new URL('report.json', folder), 'utf8'));
  const staged = await readFile(new URL('revised.rootsound', folder));
  assert.equal(hash(staged), report.afterSha256);
  assert.equal(hash(await readFile(report.destination)), report.beforeSha256, 'Project changed since preparation');
  const temporary = report.destination + '.rb100.tmp';
  await writeFile(temporary, staged, { flag: 'wx' }); await rename(temporary, report.destination);
  report.applied = true; await writeFile(new URL('report.json', folder), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
} else {
  await mkdir(folder, { recursive: true });
  const generated = JSON.parse(await readFile(new URL('./result.json', import.meta.url), 'utf8'));
  const original = await readFile(generated.destination), envelope = JSON.parse(original);
  let text = envelope.libraryText;
  const library = createMaterialLibrary({ read: () => text, write: next => { text = next; } }, { project: { rootKind: 'rootsound.song',
    adapters: [createTimbreReferenceAdapter(), createPhraseReferenceAdapter(), createSongReferenceAdapter(), createSampleReferenceAdapter()] } });
  const tones = createTimbrePlayback(library), score = createPhraseEditor(library, tones);
  const song = createSongEditor(library, createPhrasePlayback(library, tones), { defaultTempoMode: 'source' }); openMusicDocument(library, song, score);
  const previous = score.read().body, ratio = 60 / previous.tempoBpm;
  assert.equal(previous.tempoBpm, 90); assert.equal(previous.beatsPerBar, 3);
  const revised = { ...previous, tempoBpm: 60, beatsPerBar: 2, stepsPerBeat: 3,
    lengthBeats: previous.lengthBeats * ratio,
    ...(previous.pickupBeats === undefined ? {} : { pickupBeats: previous.pickupBeats * ratio }),
    parts: previous.parts.map(part => ({ ...part, notes: part.notes.map(note => ({ ...note,
      startBeat: note.startBeat * ratio, durationBeats: note.durationBeats * ratio })) })) };
  let noteCount = 0;
  for (let p = 0; p < previous.parts.length; p++) for (let n = 0; n < previous.parts[p].notes.length; n++) {
    const before = previous.parts[p].notes[n], after = revised.parts[p].notes[n];
    assert(Math.abs(before.startBeat * 60 / previous.tempoBpm - after.startBeat * 60 / revised.tempoBpm) < 1e-8);
    assert(Math.abs(before.durationBeats * 60 / previous.tempoBpm - after.durationBeats * 60 / revised.tempoBpm) < 1e-8);
    assert.deepEqual({ ...after, startBeat: before.startBeat, durationBeats: before.durationBeats }, before); noteCount++;
  }
  assert(Math.abs(previous.lengthBeats * 60 / previous.tempoBpm - revised.lengthBeats * 60 / revised.tempoBpm) < 1e-8);
  // Exercise the real grid calculation: at detailed zoom a bar contains six
  // eighth-note cells, with its second large pulse at cell three.
  const lines = melodyDetailGrid(4, 60, 3, { leftSeconds: 0, zoom: 2, rowHeight: 32 }, 1000, 2);
  const firstBar = lines.filter(line => line.seconds < 2 - 1e-8);
  assert.equal(firstBar.length, 6); assert.deepEqual(firstBar.filter(line => line.beat).map(line => line.seconds), [0, 1]);
  assert.deepEqual(lines.filter(line => line.bar).map(line => line.seconds), [0, 2, 4]);
  library.updateDraft(score.read().draft.id, { body: revised }); commitMusicDocument(library, song, score);
  envelope.libraryText = text;
  envelope.source = { ...envelope.source, editingBeatUnit: 'dotted-quarter', editingBpm: 60,
    gridRevision: 'Two dotted-quarter pulses per6/8 bar, three eighth-note cells each. Rebased all note coordinates from90 quarter BPM to60 dotted-quarter BPM without retiming playback. Supersedes the original three-quarter-beat/four-cell editing grid.' };
  const packed = JSON.stringify(envelope);
  await writeFile(new URL('before.rootsound', folder), original, { flag: 'wx' });
  await writeFile(new URL('revised.rootsound', folder), packed);
  const report = { destination: generated.destination, beforeSha256: hash(original), afterSha256: hash(packed),
    notes: noteCount, oldBpm: previous.tempoBpm, newBpm: 60, beatUnit: 'dotted-quarter', beatsPerBar: 2, stepsPerBeat: 3,
    onsetSecondsUnchanged: true, holdSecondsUnchanged: true, allOtherNotePropertiesPreserved: true,
    totalDurationSecondsUnchanged: true, sixCellsPerBarVerified: true, applied: false };
  await writeFile(new URL('report.json', folder), JSON.stringify(report, null, 2)); console.log(JSON.stringify(report, null, 2));
}
