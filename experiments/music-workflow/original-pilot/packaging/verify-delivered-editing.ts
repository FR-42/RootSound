import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { createMaterialLibrary } from '../../../../src/workstation/modules/materials/public.ts';
import { createTimbrePlayback, createTimbreReferenceAdapter } from '../../../../src/workstation/modules/timbre/public.ts';
import { createPhraseEditor, createPhraseReferenceAdapter } from '../../../../src/workstation/modules/phrase/public.ts';
import { createSongReferenceAdapter } from '../../../../src/workstation/modules/song/public.ts';
import { createSampleAudio, createSampleReferenceAdapter } from '../../../../src/workstation/modules/sampling/public.ts';
import { decodePcmWav } from '../../../../src/workstation/modules/sampling/audio.ts';

const file = path.resolve(process.argv[2]!);
const startedAt = performance.now();
const original = await readFile(file);
const envelope = JSON.parse(original.toString('utf8'));
let memory = envelope.libraryText as string;
const adapters = [createTimbreReferenceAdapter(), createPhraseReferenceAdapter(), createSongReferenceAdapter(), createSampleReferenceAdapter()];
const library = createMaterialLibrary({ read: () => memory, write: value => { memory = value; } },
  { project: { rootKind: 'rootsound.song', adapters } });
const audio = createSampleAudio(library, { async decode(bytes) { const result = decodePcmWav(bytes); assert(result); return result; } });
const tones = createTimbrePlayback(library, audio);
const phrase = createPhraseEditor(library, tones);
const phrases = library.listContentInfo().filter(item => item.kind === 'rootsound.phrase');
assert.equal(phrases.length, 30);
const representatives = ['女声 · 啊', '背景旋律', '和声铺底', '低音', '低频鼓', '轻拍', '细节节奏', '高处回应']
  .map(name => phrases.find(item => item.name.startsWith(name + ' · '))!);
assert(representatives.every(Boolean));
let independentlyChanged = 0;
for (const source of representatives) {
  phrase.open(source.id);
  const before = phrase.read().body!;
  const part = before.parts.find(item => item.notes.length)!;
  const note = part.notes[0]!;
  const startBeat = Math.min(before.lengthBeats - .001, note.startBeat + .125);
  phrase.updateNote(part.id, note.id, { frequencyHz: note.frequencyHz * 2 ** (1 / 12), startBeat, level: .63, pan: .17 });
  const changed = phrase.read().body!;
  const result = changed.parts.find(item => item.id === part.id)!.notes.find(item => item.id === note.id)!;
  assert.equal(result.frequencyHz, note.frequencyHz * 2 ** (1 / 12));
  assert.equal(result.startBeat, startBeat); assert.equal(result.level, .63); assert.equal(result.pan, .17);
  for (const oldPart of before.parts) {
    const newPart = changed.parts.find(item => item.id === oldPart.id)!;
    assert.equal(newPart.notes.length, oldPart.notes.length);
    for (const oldNote of oldPart.notes) {
      if (oldPart.id === part.id && oldNote.id === note.id) continue;
      assert.deepEqual(newPart.notes.find(item => item.id === oldNote.id), oldNote);
    }
  }
  phrase.undo(); assert.deepEqual(phrase.read().body, before);
  phrase.redo(); assert.deepEqual(phrase.read().body, changed);
  phrase.undo(); assert.deepEqual(phrase.read().body, before);
  independentlyChanged++;
  console.log(`Editable track checked: ${source.name}`);
}
assert.deepEqual(await readFile(file), original);
const result = { passed: true, deliveredPhrasesEditedInMemory: independentlyChanged,
  elapsedSeconds: (performance.now() - startedAt) / 1000,
  pitchTimeLevelPanEditable: true, unrelatedNotesPreserved: true, undoRedoExact: true,
  fileUnchanged: true, sha256: createHash('sha256').update(original).digest('hex'),
  desktopOperated: false, soundDeviceOpened: false };
await writeFile(path.join(path.dirname(file), '实际工程编辑核验.json'), JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
