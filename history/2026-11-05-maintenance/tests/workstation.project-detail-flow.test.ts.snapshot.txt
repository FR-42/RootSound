import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { ContentRecord, Draft, MaterialLibrary, SaveResult } from '../src/workstation/contracts/content.ts';
import { createMaterialLibrary, createProjectPackages, createReferenceEditing } from '../src/workstation/modules/materials/public.ts';
import { createSampling, createSampleAudio, createSampleReferenceAdapter, readSampleBody } from '../src/workstation/modules/sampling/public.ts';
import { decodeBase64, decodePcmWav, encodeFloatWav } from '../src/workstation/modules/sampling/audio.ts';
import { createTimbreEditor, createTimbrePlayback, createTimbreReferenceAdapter, readEditableTimbreBody } from '../src/workstation/modules/timbre/public.ts';
import { createPhraseEditor, createPhrasePlayback, createPhraseReferenceAdapter, readPhraseBody } from '../src/workstation/modules/phrase/public.ts';
import { createSongEditor, createSongReferenceAdapter, readSongBody } from '../src/workstation/modules/song/public.ts';
import { createCoCreation, createCoCreationReferenceAdapter } from '../src/workstation/modules/co-creation/public.ts';

function adapters() { return [createTimbreReferenceAdapter(), createPhraseReferenceAdapter(), createSongReferenceAdapter(), createSampleReferenceAdapter(), createCoCreationReferenceAdapter()]; }
function options() { return { project: { rootKind: 'rootsound.song', adapters: adapters() } }; }
function saved(result: SaveResult): ContentRecord {
  assert.equal(result.status, 'saved', JSON.stringify(result)); if (result.status !== 'saved') throw new Error('Expected save'); return result.content;
}
function graph(library: MaterialLibrary, root: Draft | ContentRecord): ContentRecord[] {
  const records = new Map<string, ContentRecord>(); const pending = [...root.dependencies];
  while (pending.length) { const id = pending.pop()!; if (records.has(id)) continue; const value = library.readContent(id); assert(value); records.set(id, value); pending.push(...value.dependencies); }
  return [...records.values()];
}
function uniqueNames(records: ContentRecord[]): void {
  const names = records.map(item => JSON.stringify([item.kind, item.name.trim().normalize('NFC').toLowerCase()]));
  assert.equal(new Set(names).size, names.length);
}

test('the actual configured workstation keeps sampled co-creation songs independent through scoped fine edits, audition and cold project transfer', async () => {
  let raw: string | null = null; let writes = 0;
  const storage = { read: () => raw, write(value: string) { raw = value; writes++; } };
  const library = createMaterialLibrary(storage, options());
  const bytes = encodeFloatWav({ sampleRate: 16000, channels: [Float32Array.from({ length: 6400 }, (_, index) => 0.3 * Math.sin(2 * Math.PI * 220 * index / 16000))] });
  const decoder = { async decode(input: Uint8Array) { const audio = decodePcmWav(input); assert(audio); return audio; } };
  const sampling = createSampling(library, { decoder, files: { async open() { return { status: 'opened', name: '杯子.wav', mimeType: 'audio/wav', bytes }; } },
    capture: { async start() { throw new Error('No real microphone'); }, cancel() {} } });
  await sampling.importFile(); const original = sampling.save(); const audio = createSampleAudio(library, decoder);
  const timbre = createTimbreEditor(library, audio); await timbre.createFromSample(original.id); timbre.rename('玻璃琴');
  const voice = saved(timbre.save('new')); const sounds = createTimbrePlayback(library, audio); const phrases = createPhrasePlayback(library, sounds);
  const phrase = createPhraseEditor(library, sounds); phrase.create(voice.id);
  phrase.addNote(phrase.read().body!.parts[0]!.id, { startBeat: 0.125, durationBeats: 0.75, frequencyHz: 330.123456789, velocity: 0.7 });
  const seed = saved(phrase.save('new')); const co = createCoCreation(library, audio); co.start(seed.id);
  co.chooseIdea('calm', co.read().token); co.renameCurrent('一杯雨', co.read().token); const coBefore = co.read().currentPhrase!;
  const first = createSongEditor(library, phrases, { defaultTempoMode: 'source' }); first.createFromPhrase(coBefore.id, '同名歌曲');
  const firstSaved = saved(first.save('new')); const a = first.read().draft!;
  const second = createSongEditor(library, phrases, { defaultTempoMode: 'source' }); second.createFromPhrase(coBefore.id, '同名歌曲');
  const secondSaved = saved(second.save('new')); const b = second.read().draft!;
  const aGraph = graph(library, a); const bGraph = graph(library, b); uniqueNames(aGraph); uniqueNames(bGraph);
  assert(aGraph.every(item => !bGraph.some(other => other.id === item.id)));
  assert.deepEqual(aGraph.map(item => [item.kind, item.name]).sort(), bGraph.map(item => [item.kind, item.name]).sort());
  const aSource = aGraph.find(item => item.kind === 'rootsound.sample')!; const bSource = bGraph.find(item => item.kind === 'rootsound.sample')!;
  assert.notEqual(aSource.id, bSource.id); assert.notEqual(aSource.id, original.id); assert.deepEqual(aSource.body, original.body);
  assert.deepEqual(bSource.body, original.body); assert.equal(firstSaved.name, secondSaved.name);
  assert(first.read().availablePhrases.every(item => !bGraph.some(foreign => foreign.id === item.id)));
  const aTrack = readSongBody(a.body).tracks[0]!; first.copyClip(aTrack.id, aTrack.clips[0]!.id, aTrack.id, 8);
  const current = first.read().draft!; const clips = readSongBody(current.body).tracks[0]!.clips;
  assert.equal(clips[0]!.phraseId, clips[1]!.phraseId);
  const part = readPhraseBody(library.readContent(clips[0]!.phraseId)!.body).parts[0]!;
  const references = createReferenceEditing(library, adapters());
  const edit = references.begin({ root: { type: 'draft', id: current.id }, path: [clips[0]!.id, part.id] });
  timbre.openDraft(edit.draftId); assert(timbre.read().savedSounds.every(item => !bGraph.some(foreign => foreign.id === item.id)));
  timbre.setSampleRange(0.05, 0.3); timbre.setRootFrequency(233.123456789);
  const result = references.apply(edit.draftId); assert.equal(result.status, 'applied', JSON.stringify(result));
  assert.deepEqual(library.readContent(secondSaved.id), secondSaved); assert.deepEqual(co.read().currentPhrase, coBefore);
  const changed = first.read().draft!; const changedGraph = graph(library, changed); uniqueNames(changedGraph);
  assert.equal(changedGraph.filter(item => item.kind === 'rootsound.sample').length, 1, 'same-song voices continue sharing their original sample');
  const changedClip = readSongBody(changed.body).tracks[0]!.clips[0]!;
  const tunedPhrase = readPhraseBody(library.readContent(changedClip.phraseId)!.body); phrase.open(changedClip.phraseId);
  assert(phrase.read().availableSounds.every(item => !bGraph.some(foreign => foreign.id === item.id)));
  const writesBeforeKey = writes; const preview = await phrase.previewNotePlan(tunedPhrase.parts[0]!.id, { frequencyHz: 440, holdSeconds: 0.35, velocity: 0.75 });
  assert.equal(preview.kind, 'sample'); if (preview.kind !== 'sample') throw new Error('Expected sampled key');
  assert.equal(preview.startSeconds, 0.05); assert.equal(preview.playbackRate, 440 / 233.123456789); assert.equal(writes, writesBeforeKey);
  saved(first.save('overwrite'));
  const project = createProjectPackages(library, adapters(), { rootKind: 'rootsound.song' }).exportDraft(changed.id);
  let targetRaw: string | null = null; const targetStorage = { read: () => targetRaw, write(value: string) { targetRaw = value; } };
  const destination = createMaterialLibrary(targetStorage, options());
  const transferred = createProjectPackages(destination, adapters(), { rootKind: 'rootsound.song' }).importProject(project.text);
  assert.equal(transferred.status, 'imported', JSON.stringify(transferred)); if (transferred.status !== 'imported') throw new Error('Expected transfer');
  const reopened = createMaterialLibrary(targetStorage, options()); const coldAudio = createSampleAudio(reopened, decoder);
  const cold = createSongEditor(reopened, createPhrasePlayback(reopened, createTimbrePlayback(reopened, coldAudio)), { defaultTempoMode: 'source' });
  cold.openDraft(transferred.draft.id); await cold.preparePreview(); const plan = cold.previewPlan();
  assert(plan.events.some(event => event.sound.kind === 'sample' && event.sound.startSeconds === 0.05));
  const finalGraph = graph(reopened, cold.read().draft!); uniqueNames(finalGraph);
  const copiedSource = finalGraph.find(item => item.kind === 'rootsound.sample')!; const body = readSampleBody(copiedSource.body);
  assert.deepEqual(decodeBase64(body.audio.data, body.audio.byteLength), bytes);
  const sampled = finalGraph.filter(item => item.kind === 'rootsound.timbre').map(item => readEditableTimbreBody(item.body)).filter(item => item.model === 'sample-instrument');
  assert.equal(sampled.length, 2); assert(sampled.every(item => item.sampleId === copiedSource.id));
  sampling.dispose();
});
