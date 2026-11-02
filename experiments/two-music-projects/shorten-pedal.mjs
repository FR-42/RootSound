import { readFile, writeFile, mkdir, rename } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import assert from 'node:assert/strict';
import { parseMidi } from '../../src/workstation/modules/midi-import/public.ts';
import { openMusicDocument, commitMusicDocument } from '../../src/workstation/app/music-document.ts';
import { createMaterialLibrary } from '../../src/workstation/modules/materials/public.ts';
import { createTimbrePlayback, createTimbreReferenceAdapter } from '../../src/workstation/modules/timbre/public.ts';
import { createPhraseEditor, createPhrasePlayback, createPhraseReferenceAdapter } from '../../src/workstation/modules/phrase/public.ts';
import { createSongEditor, createSongReferenceAdapter } from '../../src/workstation/modules/song/public.ts';
import { createSampleReferenceAdapter } from '../../src/workstation/modules/sampling/public.ts';

const folder = new URL('./duration-revision/', import.meta.url);
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const readScore = data => data.contents.find(record => record.id === data.drafts.find(draft => draft.kind === 'rootsound.song').dependencies[0]);

// Leave the source MIDI and normal import policy untouched. In a private byte
// copy only, zero CC64 while preserving all original events/tempo/running status.
export function withoutSustain(input) {
  const data = Buffer.from(input);
  let at = 8 + data.readUInt32BE(4);
  const variable = () => { let n = 0, b; do { b = data[at++]; n = n * 128 + (b & 127); } while (b & 128); return n; };
  while (at < data.length) {
    const tag = data.toString('ascii', at, at + 4), end = at + 8 + data.readUInt32BE(at + 4); at += 8;
    if (tag !== 'MTrk') { at = end; continue; }
    let running = 0;
    while (at < end) {
      variable(); let status = data[at++];
      if (status < 128) { assert(running); at--; status = running; }
      if (status < 0xf0) {
        running = status; const first = data[at++];
        if ((status & 0xe0) !== 0xc0) { if ((status & 0xf0) === 0xb0 && first === 64) data[at] = 0; at++; }
      } else if (status === 0xff) { running = 0; at++; const count = variable(); at += count; }
      else if (status === 0xf0 || status === 0xf7) { running = 0; const count = variable(); at += count; }
      else throw new Error('Unexpected source MIDI event');
      assert(at <= end);
    }
  }
  return new Uint8Array(data);
}

if (process.argv.includes('--apply')) {
  // The caller holds the same exclusive per-project locks as the native app.
  const report = JSON.parse(await readFile(new URL('report.json', folder), 'utf8'));
  for (const item of report) {
    assert.equal(sha(await readFile(item.destination)), item.beforeSha256, 'Project changed after preparation');
    assert.equal(sha(await readFile(new URL(item.stagedFile, folder))), item.afterSha256);
  }
  for (const item of report) {
    const temporary = path.join(path.dirname(item.destination), `.${path.basename(item.destination)}.rb98.tmp`);
    await writeFile(temporary, await readFile(new URL(item.stagedFile, folder)), { flag: 'wx' });
    assert.equal(sha(await readFile(item.destination)), item.beforeSha256);
    await rename(temporary, item.destination);
    item.applied = true;
  }
  await writeFile(new URL('report.json', folder), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
} else {
  await mkdir(folder, { recursive: true });
  const reports = [], generated = JSON.parse(await readFile(new URL('./results.json', import.meta.url), 'utf8'));
  for (let index = 0; index < generated.length; index++) {
    const destination = generated[index].destination, before = await readFile(destination);
    const envelope = JSON.parse(before), originalEnvelope = JSON.parse(await readFile(destination + '.bak', 'utf8'));
    assert.equal(originalEnvelope.id, envelope.id);
    const original = readScore(JSON.parse(originalEnvelope.libraryText));
    assert.equal(original.body.parts.reduce((sum, part) => sum + part.notes.length, 0), generated[index].notes,
      'The backup must be the initial generated score, not another user revision');
    const midiBytes = await readFile(new URL(index === 0 ? './v3-author.mid' : './mitsuha-github.mid', import.meta.url));
    const midi = parseMidi(withoutSustain(midiBytes));
    const gates = new Map();
    for (let part = 0; part < 2; part++) {
      const notes = midi.notes.filter(note => note.trackIndex === part + (index === 0 ? 1 : 0));
      assert.equal(notes.length, original.body.parts[part].notes.length);
      original.body.parts[part].notes.forEach((note, n) => {
        assert(Math.abs(note.startBeat * 60 / original.body.tempoBpm - notes[n].startSeconds) < 1e-8);
        assert(Math.abs(69 + 12 * Math.log2(note.frequencyHz / 440) - notes[n].pitch) < 1e-8);
        gates.set(note.id, { old: note, hold: notes[n].endSeconds - notes[n].startSeconds });
      });
    }
    let text = envelope.libraryText;
    const library = createMaterialLibrary({ read: () => text, write: next => { text = next; } }, {
      project: { rootKind: 'rootsound.song', adapters: [createTimbreReferenceAdapter(), createPhraseReferenceAdapter(), createSongReferenceAdapter(), createSampleReferenceAdapter()] },
    });
    const tones = createTimbrePlayback(library), score = createPhraseEditor(library, tones);
    const song = createSongEditor(library, createPhrasePlayback(library, tones), { defaultTempoMode: 'source' });
    openMusicDocument(library, song, score);
    const body = score.read().body, changes = []; let userLengthsPreserved = 0;
    const next = { ...body, parts: body.parts.map(part => ({ ...part, notes: part.notes.map(note => {
      const gate = gates.get(note.id); if (!gate) return note;
      if (note.durationSeconds !== gate.old.durationSeconds || note.durationBeats !== gate.old.durationBeats) { userLengthsPreserved++; return note; }
      if (gate.hold <= 0 || gate.hold >= note.durationSeconds - 1e-7) return note;
      const replacement = { ...note, durationSeconds: gate.hold,
        durationBeats: Math.min(body.lengthBeats - note.startBeat, gate.hold * body.tempoBpm / 60) };
      changes.push({ id: note.id, before: note.durationSeconds, after: gate.hold }); return replacement;
    }) })) };
    assert(changes.length > 0);
    // Compare every retained musical property other than the authorized lengths.
    for (let p = 0; p < body.parts.length; p++) {
      assert.deepEqual({ ...next.parts[p], notes: [] }, { ...body.parts[p], notes: [] });
      for (let n = 0; n < body.parts[p].notes.length; n++) {
        const { durationSeconds: a, durationBeats: b, ...left } = next.parts[p].notes[n];
        const { durationSeconds: c, durationBeats: d, ...right } = body.parts[p].notes[n]; assert.deepEqual(left, right);
      }
    }
    library.updateDraft(score.read().draft.id, { body: next }); commitMusicDocument(library, song, score);
    envelope.libraryText = text;
    envelope.durationRevision = { date: '2026-11-02', reason: 'Replace pedal-expanded piano holds with source key-down durations; preserve user-adjusted lengths, notes, sound assignments and removed parts.' };
    if (envelope.arrangement) envelope.arrangement = body.parts.map(part => ({ ...envelope.arrangement.find(item => item.name === part.name), name: part.name, notes: part.notes.length }));
    const packed = JSON.stringify(envelope), stagedFile = `${index}-shortened.rootsound`, backupFile = `${index}-user-before.rootsound`;
    await writeFile(new URL(backupFile, folder), before, { flag: 'wx' });
    await writeFile(new URL(stagedFile, folder), packed);
    reports.push({ destination, stagedFile, backupFile, beforeSha256: sha(before), afterSha256: sha(packed),
      shortenedNotes: changes.length, userAdjustedLengthsPreserved: userLengthsPreserved,
      retainedParts: body.parts.map(part => ({ name: part.name, notes: part.notes.length })),
      totalRemovedHoldSeconds: changes.reduce((sum, item) => sum + item.before - item.after, 0), changes });
  }
  await writeFile(new URL('report.json', folder), JSON.stringify(reports, null, 2));
  console.log(JSON.stringify(reports.map(({ changes, ...report }) => report), null, 2));
}
