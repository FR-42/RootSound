import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createMaterialLibrary, createProjectPackages, createReferenceEditing } from '../src/workstation/modules/materials/public.ts';
import { createSampling, createSampleReferenceAdapter } from '../src/workstation/modules/sampling/public.ts';
import { encodeFloatWav, decodePcmWav } from '../src/workstation/modules/sampling/audio.ts';
import { createMelodyRecognition, analyzeMelody } from '../src/workstation/modules/melody-recognition/public.ts';
import { createCoCreation, createCoCreationReferenceAdapter } from '../src/workstation/modules/co-creation/public.ts';
import { createTimbrePlayback, createTimbreReferenceAdapter } from '../src/workstation/modules/timbre/public.ts';
import { createPhraseEditor, createPhrasePlayback, createPhraseReferenceAdapter, readPhraseBody } from '../src/workstation/modules/phrase/public.ts';
import { createSongEditor, createSongPlayback, createSongReferenceAdapter } from '../src/workstation/modules/song/public.ts';

test('acquired humming becomes editable music, returns from fine editing, explores further and travels as a complete song', async () => {
  const rate = 16000; const channel = new Float32Array(rate * 3.4);
  const frequencies = [220, 293.6647679, 261.6255653, 329.6275569];
  frequencies.forEach((frequency, index) => {
    const start = 0.2 + index * 0.75;
    for (let frame = Math.round(start * rate); frame < Math.round((start + 0.55) * rate); frame++) {
      const time = frame / rate - start; const gate = Math.min(1, time / 0.02, (0.55 - time) / 0.025);
      channel[frame] = gate * (0.22 * Math.sin(2 * Math.PI * frequency * time) + 0.13 * Math.sin(4 * Math.PI * frequency * time) + 0.06 * Math.sin(6 * Math.PI * frequency * time));
    }
  });
  const bytes = encodeFloatWav({ sampleRate: rate, channels: [channel] }); const originalBytes = bytes.slice();
  let raw: string | null = null; let writes = 0;
  const library = createMaterialLibrary({ read: () => raw, write(value) { raw = value; writes++; } });
  const sampling = createSampling(library, { files: { async open() { return { status: 'opened', name: '心里的旋律.wav', mimeType: 'audio/wav', bytes }; } },
    decoder: { async decode(input) { return decodePcmWav(input)!; } }, capture: { async start() { throw new Error('No actual microphone in this test'); }, cancel() {} } });
  await sampling.importFile();
  const recognition = createMelodyRecognition(library, { analyzer: { analyze: analyzeMelody },
    currentSourceToken: () => sampling.read().phase === 'idle' ? sampling.read().audioToken : undefined });
  await recognition.analyze({ sourceToken: sampling.read().audioToken!, sourceName: sampling.read().name, audio: sampling.previewAudio() });
  const analysis = recognition.read().result!; assert(analysis.notes.length >= 3); assert.equal(analysis.durationSeconds, 3.4);
  assert(Math.abs(1200 * Math.log2(analysis.notes[0]!.frequencyHz / 220)) < 20);
  const heard = recognition.previewPlan(); assert.equal(writes, 0); assert.equal(library.listContent().length, 0);
  const adopted = recognition.adopt(); assert.equal(writes, 1); assert.equal(library.listContent().length, 2);
  assert.equal(library.listContent().some(item => item.kind === 'rootsound.sample'), false);
  assert.deepEqual(bytes, originalBytes); assert.equal(sampling.read().changed, true);
  const sounds = createTimbrePlayback(library); const phrases = createPhrasePlayback(library, sounds);
  assert.deepEqual(phrases.planForSaved(adopted.content.id), heard);
  const adapters = [createTimbreReferenceAdapter(), createPhraseReferenceAdapter(), createSongReferenceAdapter(), createCoCreationReferenceAdapter(), createSampleReferenceAdapter()];
  const co = createCoCreation(library); co.start(adopted.content.id);
  const references = createReferenceEditing(library, adapters);
  const edit = references.begin({ root: { type: 'draft', id: co.read().draft.id }, path: ['current'] });
  const phrase = createPhraseEditor(library, sounds); phrase.openDraft(edit.draftId);
  const part = phrase.read().body!.parts[0]!; phrase.updateNote(part.id, part.notes[0]!.id, { frequencyHz: 343.210987654 });
  assert.equal(references.apply(edit.draftId).status, 'applied');
  const tuned = readPhraseBody(co.read().currentPhrase!.body); co.chooseIdea('airy', co.read().token);
  assert.deepEqual(readPhraseBody(co.read().currentPhrase!.body).parts[0]!.notes, tuned.parts[0]!.notes);
  const song = createSongEditor(library, phrases, { defaultTempoMode: 'source' }); song.createFromPhrase(co.read().currentPhrase!.id);
  const plan = song.previewPlan(); const packageText = createProjectPackages(library, adapters, { rootKind: 'rootsound.song' }).exportDraft(song.read().draft!.id).text;
  const target = createMaterialLibrary(); const imported = createProjectPackages(target, adapters, { rootKind: 'rootsound.song' }).importProject(packageText);
  assert.equal(imported.status, 'imported'); if (imported.status !== 'imported') throw new Error('Expected editable song import');
  assert.deepEqual(createSongPlayback(target, createPhrasePlayback(target, createTimbrePlayback(target))).planForSaved(imported.content.id), plan);
  recognition.dispose(); sampling.dispose();
});
