import { readFile, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { parseMidi } from '../../src/workstation/modules/midi-import/public.ts';
import { openMusicDocument } from '../../src/workstation/app/music-document.ts';
import { createMaterialLibrary } from '../../src/workstation/modules/materials/public.ts';
import { createTimbrePlayback, createTimbreReferenceAdapter } from '../../src/workstation/modules/timbre/public.ts';
import { createPhraseEditor, createPhrasePlayback, createPhraseReferenceAdapter } from '../../src/workstation/modules/phrase/public.ts';
import { createSongEditor, createSongReferenceAdapter } from '../../src/workstation/modules/song/public.ts';
import { createSampleAudio, createBrowserSampleDecoder, createSampleReferenceAdapter } from '../../src/workstation/modules/sampling/public.ts';
import { createSampleBankAudio } from '../../src/workstation/modules/timbre/sample-bank.ts';

const here = new URL('./', import.meta.url), result = JSON.parse(await readFile(new URL('result.json', here), 'utf8'));
const envelope = JSON.parse(await readFile(process.argv[2] ?? result.destination, 'utf8'));
let text = envelope.libraryText;
const library = createMaterialLibrary({ read: () => text, write: next => { text = next; } }, { project: { rootKind: 'rootsound.song',
  adapters: [createTimbreReferenceAdapter(), createPhraseReferenceAdapter(), createSongReferenceAdapter(), createSampleReferenceAdapter()] } });
const samples = createSampleAudio(library, createBrowserSampleDecoder());
const bank = createSampleBankAudio(library, samples, async () => { throw new Error('External recordings forbidden during portable reopen'); });
const tones = createTimbrePlayback(library, samples, undefined, bank), score = createPhraseEditor(library, tones);
const song = createSongEditor(library, createPhrasePlayback(library, tones), { defaultTempoMode: 'source' });
openMusicDocument(library, song, score);
const body = score.read().body, midi = parseMidi(new Uint8Array(await readFile(new URL('key-down.mid', here))));
assert.equal(body.parts.length, 1); assert.equal(body.parts[0].notes.length, 4077);
assert.equal(body.beatsPerBar, 2); assert.equal(body.stepsPerBeat, 3); assert.equal(body.tempoBpm, 60);
assert(body.lengthBeats * 60 / body.tempoBpm >= midi.durationSeconds);
for (let n = 0; n < midi.notes.length; n++) {
  const actual = body.parts[0].notes[n], original = midi.notes[n];
  assert(Math.abs(actual.startBeat * 60 / body.tempoBpm - original.startSeconds) < 1e-8);
  assert(Math.abs(69 + 12 * Math.log2(actual.frequencyHz / 440) - original.pitch) < 1e-8);
  assert.equal(actual.durationSeconds, original.endSeconds - original.startSeconds);
  assert.equal(actual.velocity, original.velocity);
}
await score.preparePreview(); const plan = score.previewPlan();
assert.equal(plan.events.length, 4077);
assert(plan.events.every(event => event.sound.kind === 'sample' && event.sound.source.audio.channels[0].length > 0));
assert.equal(envelope.name, song.read().draft.name);
const proof = { project: result.destination, domainReopen: true, notes: 4077, allPitchesOnsetsKeyHoldsAndVelocitiesMatch: true,
  embeddedOnlyPlaybackPlan: true, gridBpm: 60, gridBeatUnit: 'dotted-quarter', beatsPerBar: 2, stepsPerBeat: 3, actualDevicePlayback: false };
await writeFile(new URL('verification.json', here), JSON.stringify(proof, null, 2)); console.log(JSON.stringify(proof, null, 2));
