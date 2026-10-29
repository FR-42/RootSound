import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildProject, type Score } from './build-project.ts';
import { encodeFloatWav } from '../../../../src/workstation/modules/sampling/audio.ts';
import { createMaterialLibrary } from '../../../../src/workstation/modules/materials/public.ts';
import { createPhraseEditor, createPhrasePlayback, createPhraseReferenceAdapter } from '../../../../src/workstation/modules/phrase/public.ts';
import { createTimbrePlayback, createTimbreReferenceAdapter } from '../../../../src/workstation/modules/timbre/public.ts';
import { createSongReferenceAdapter } from '../../../../src/workstation/modules/song/public.ts';
import { createSampleReferenceAdapter, createSampleAudio } from '../../../../src/workstation/modules/sampling/public.ts';
import { decodePcmWav } from '../../../../src/workstation/modules/sampling/audio.ts';

const directory = path.join(path.dirname(fileURLToPath(import.meta.url)), '.check');
await mkdir(directory, { recursive: true });
const rate = 16000;
const samples = new Float32Array(rate);
for (let index = 0; index < samples.length; index++) samples[index] = .25 * Math.sin(2 * Math.PI * 440 * index / rate);
await writeFile(path.join(directory, 'fixture.wav'), encodeFloatWav({ sampleRate: rate, channels: [samples] }));
const score: Score = { name: '可编辑打包检查', tempoBpm: 212, lengthBeats: 32, phraseBeats: 16,
  instruments: [{ id: 'tone', name: '检查用音色', wavPath: 'fixture.wav', rootMidi: 69, level: .7, attackSeconds: .002, releaseSeconds: .05 }],
  tracks: [{ name: '旋律', instrumentId: 'tone', section: 'melody', level: .8, pan: -.1,
    notes: [{ midi: 69, startBeat: .25, durationSeconds: .15 }, { midi: 72, startBeat: 15.75, durationSeconds: .8 },
      { midi: 76, startBeat: 20.125, durationSeconds: .1, velocity: .9, pan: .3 }] },
    { name: '节奏', instrumentId: 'tone', section: 'rhythm', notes: [{ midi: 57, startBeat: 0, durationSeconds: .1 }] }],
};
const result = await buildProject(score, directory);
assert.equal(result.verification.notes, 4); assert.equal(result.verification.phrases, 3);
assert.equal(result.plan.events.length, 4);
const event = result.plan.events.find(item => Math.abs(item.atSeconds - 20.125 * 60 / 212) < 1e-8)!;
assert.equal(event.sound.note.frequencyHz, 440 * 2 ** (7 / 12));
assert.equal(event.sound.note.holdSeconds, .1); assert(Math.abs(event.pan! - .2) < 1e-8);
const envelope = JSON.parse(result.workspace);
assert.deepEqual(Object.keys(envelope).sort(), ['createdAtUtc', 'format', 'id', 'libraryText', 'name', 'version']);
assert.equal(envelope.format, 'RootSoundWorkspace'); assert.equal(envelope.version, 2);
let stored = envelope.libraryText;
const adapters = [createTimbreReferenceAdapter(), createPhraseReferenceAdapter(), createSongReferenceAdapter(), createSampleReferenceAdapter()];
const library = createMaterialLibrary({ read: () => stored, write: value => { stored = value; } }, { project: { rootKind: 'rootsound.song', adapters } });
const decoder = { async decode(bytes: Uint8Array) { const pcm = decodePcmWav(bytes); assert(pcm); return pcm; } };
const tones = createTimbrePlayback(library, createSampleAudio(library, decoder));
const phrasePlayback = createPhrasePlayback(library, tones);
const source = phrasePlayback.listSaved().find(item => item.name === '旋律 · 2')!;
const phrase = createPhraseEditor(library, tones); phrase.open(source.id);
const part = phrase.read().body!.parts[0]!; const note = part.notes[0]!;
phrase.updateNote(part.id, note.id, { frequencyHz: 500, startBeat: 2.5 });
assert.equal(phrase.read().body!.parts[0]!.notes[0]!.frequencyHz, 500);
assert.equal(phrase.read().body!.parts[0]!.notes[0]!.startBeat, 2.5);
phrase.undo(); assert.equal(phrase.read().body!.parts[0]!.notes[0]!.frequencyHz, note.frequencyHz);
assert.equal(phrase.read().body!.parts[0]!.notes[0]!.startBeat, note.startBeat);
const saved = phrase.save('overwrite'); assert.equal(saved.status, 'saved');
assert.equal(result.midi.subarray(0, 4).toString(), 'MThd');
assert.equal(result.midi.readUInt16BE(10), 3);
await assert.rejects(buildProject({ ...score, instruments: [{ ...score.instruments[0]!, wavPath: 'missing.wav' }] }, directory), /ENOENT/);
await assert.rejects(buildProject({ ...score, tracks: [{ ...score.tracks[0]!, notes: [{ midi: 128, startBeat: 0, durationSeconds: .1 }] }] }, directory), /frequency/);
await writeFile(path.join(directory, 'fixture.rootsound'), result.workspace);
await writeFile(path.join(directory, 'fixture.rsproject'), result.portable);
await writeFile(path.join(directory, 'fixture.mid'), result.midi);
console.log(JSON.stringify({ passed: true, checks: ['all notes survive official export/import and cold decode',
  'cross-boundary held duration retained', 'note pitch and time are editable with undo', 'native workspace six-field envelope',
  'MIDI header and track count', 'missing sample rejected', 'out-of-range pitch rejected'], details: result.verification }, null, 2));
