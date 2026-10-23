import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { ContentRecord, SaveResult } from '../src/workstation/contracts/content.ts';
import type { SampleSoundPlan, SoundSequencePlan } from '../src/workstation/contracts/sound.ts';
import { createMaterialLibrary, createProjectPackages, createReferenceEditing } from '../src/workstation/modules/materials/public.ts';
import { createSampling, createSampleAudio, createSampleReferenceAdapter, readSampleBody } from '../src/workstation/modules/sampling/public.ts';
import { decodeBase64, decodePcmWav, encodeFloatWav } from '../src/workstation/modules/sampling/audio.ts';
import { createTimbreEditor, createTimbrePlayback, createTimbreReferenceAdapter, readEditableTimbreBody } from '../src/workstation/modules/timbre/public.ts';
import { createPhraseEditor, createPhrasePlayback, createPhraseReferenceAdapter, readPhraseBody } from '../src/workstation/modules/phrase/public.ts';
import { createSongEditor, createSongPlayback, createSongReferenceAdapter, readSongBody } from '../src/workstation/modules/song/public.ts';
import { createCoCreation, createCoCreationReferenceAdapter } from '../src/workstation/modules/co-creation/public.ts';

function saved(result: SaveResult): ContentRecord {
  assert.equal(result.status, 'saved', JSON.stringify(result));
  if (result.status !== 'saved') throw new Error('Expected saved');
  return result.content;
}
function adapters() {
  return [createTimbreReferenceAdapter(), createPhraseReferenceAdapter(), createSongReferenceAdapter(),
    createSampleReferenceAdapter(), createCoCreationReferenceAdapter()];
}
function sampleEvent(plan: SoundSequencePlan): SampleSoundPlan {
  const sound = plan.events.find(event => event.sound.kind === 'sample')?.sound;
  assert(sound?.kind === 'sample'); return sound;
}
function memoryStore() {
  let raw: string | null = null; let writes = 0;
  const storage = { read: () => raw, write(value: string) { raw = value; writes++; } };
  return { storage, library: createMaterialLibrary(storage), writes: () => writes, raw: () => raw };
}
async function fixture() {
  const store = memoryStore(); const { library } = store;
  const rate = 16000; const frames = rate * 2;
  const channels = [new Float32Array(frames), new Float32Array(frames)];
  for (let frame = 0; frame < frames; frame++) {
    channels[0]![frame] = Math.sin(2 * Math.PI * 220 * frame / rate) * 0.32;
    channels[1]![frame] = Math.sin(2 * Math.PI * 220 * frame / rate + 0.23) * 0.19;
  }
  const bytes = encodeFloatWav({ sampleRate: rate, channels }); let decodes = 0;
  const decoder = { async decode(input: Uint8Array) { decodes++; const audio = decodePcmWav(input); assert(audio); return audio; } };
  const sampling = createSampling(library, { decoder,
    files: { async open() { return { status: 'opened', name: '玻璃杯的声音.wav', mimeType: 'audio/wav', bytes }; } },
    capture: { async start() { throw new Error('No real microphone in programmatic checks'); }, cancel() {} } });
  await sampling.importFile(); const source = sampling.save();
  const audio = createSampleAudio(library, decoder); const timbre = createTimbreEditor(library, audio);
  await timbre.createFromSample(source.id); timbre.rename('我的玻璃琴'); timbre.setSampleRange(0.125, 1.625);
  timbre.setRootFrequency(220); timbre.setEnvelope(0.007, 0.19); timbre.setLevel(0.57);
  const voice = saved(timbre.save('new'));
  const sounds = createTimbrePlayback(library, audio); const phrases = createPhrasePlayback(library, sounds);
  const phrase = createPhraseEditor(library, sounds); phrase.create(voice.id); phrase.rename('敲出来的一句话'); phrase.setTempo(90);
  const partId = phrase.read().body!.parts[0]!.id;
  phrase.addNotes(partId, [
    { startBeat: 0.125, durationBeats: 1, frequencyHz: 330, velocity: 0.72 },
    { startBeat: 1.5, durationBeats: 0.375, frequencyHz: 440, velocity: 0.53 },
  ]);
  const melody = saved(phrase.save('new'));
  const song = createSongEditor(library, phrases, { defaultTempoMode: 'source' }); song.createFromPhrase(melody.id, '玻璃之歌');
  const track = song.read().body!.tracks[0]!; song.updateTrack(track.id, { level: 0.8, pan: -0.37 });
  song.copyClip(track.id, track.clips[0]!.id, track.id, 6.25);
  return { ...store, sampling, source, voice, melody, timbre, sounds, phrase, phrases, song, bytes, channels, decoder, decodes: () => decodes };
}

test('original sample becomes a referenced playable sound and complete song survives an empty-device project import and cold restart', async () => {
  const f = await fixture(); const sourceBefore = f.library.readContent(f.source.id);
  await f.song.preparePreview(); const plan = f.song.previewPlan(); const first = sampleEvent(plan);
  assert.equal(first.playbackRate, 1.5); assert.equal(first.startSeconds, 0.125); assert.equal(first.endSeconds, 1.625);
  assert.equal(first.source.id, f.source.id); assert.equal(first.source.audio.sampleRate, 16000);
  assert.deepEqual(first.source.audio.channels, f.channels); assert.equal(first.level, 0.57 * 0.8);
  assert(plan.events.every(event => event.sound.kind === 'sample')); assert.equal(plan.events.length, 4);
  assert.equal(plan.events[0]!.atSeconds, 0.125 * 60 / 90); assert.equal(plan.events[0]!.pan, -0.37);
  assert.deepEqual(f.library.readContent(f.source.id), sourceBefore);
  const packed = createProjectPackages(f.library, adapters(), { rootKind: 'rootsound.song' }).exportDraft(f.song.read().draft!.id);
  assert.equal(packed.contentCount, 4); const file = JSON.parse(packed.text);
  assert.equal(file.contents.filter((record: ContentRecord) => record.kind === 'rootsound.sample').length, 1);
  assert(!packed.text.includes('sampleRate\":16000,\"channels\":[')); // Execution PCM is never persisted.
  const destination = memoryStore(); const transferred = createProjectPackages(destination.library, adapters(), { rootKind: 'rootsound.song' }).importProject(packed.text);
  assert.equal(transferred.status, 'imported'); if (transferred.status !== 'imported') throw new Error('Expected project import');
  assert.equal(destination.writes(), 1);
  const reopened = createMaterialLibrary(destination.storage); let coldDecodes = 0;
  const sourceAudio = createSampleAudio(reopened, { async decode(input) { coldDecodes++; return f.decoder.decode(input); } });
  const sounds = createTimbrePlayback(reopened, sourceAudio); const phrases = createPhrasePlayback(reopened, sounds);
  const song = createSongEditor(reopened, phrases, { defaultTempoMode: 'source' }); song.openDraft(transferred.draft.id);
  // Structural reads and edits work before any codec/cache preparation.
  assert.equal(coldDecodes, 0); assert.equal(song.read().body!.tracks[0]!.clips.length, 2);
  song.rename('换台电脑继续写'); await song.preparePreview(); const recovered = song.previewPlan();
  assert.equal(coldDecodes, 1); assert.equal(recovered.events.length, plan.events.length);
  const recoveredSource = sampleEvent(recovered).source; assert.notEqual(recoveredSource.id, f.source.id);
  assert.deepEqual(recoveredSource.audio, first.source.audio);
  const withoutIdentity = (value: SoundSequencePlan) => ({ ...value, events: value.events.map(event => ({ ...event,
    sound: event.sound.kind === 'sample' ? { ...event.sound, source: { ...event.sound.source, id: 'same-original' } } : event.sound })) });
  assert.deepEqual(withoutIdentity(recovered), withoutIdentity(plan));
  const original = readSampleBody(reopened.readContent(recoveredSource.id)!.body);
  assert.deepEqual(decodeBase64(original.audio.data, original.audio.byteLength), f.bytes);
  await song.preparePreview(); assert.equal(coldDecodes, 1); saved(song.save('overwrite'));
  assert.equal(createSongPlayback(reopened, phrases).readSaved(transferred.content.id).content.name, '换台电脑继续写');
  f.sampling.dispose();
});

test('ordinary sampled-sound editing forks one song occurrence and retains the immutable shared original through undo and restart', async () => {
  const f = await fixture(); const root = { type: 'draft' as const, id: f.song.read().draft!.id };
  const track = f.song.read().body!.tracks[0]!; const part = readPhraseBody(f.melody.body).parts[0]!;
  const before = f.library.readContent(f.source.id); const voiceBefore = f.library.readContent(f.voice.id);
  const references = createReferenceEditing(f.library, adapters());
  const edit = references.begin({ root, path: [track.clips[1]!.id, part.id] }); f.timbre.openDraft(edit.draftId);
  f.timbre.setSampleRange(0.5, 1.125); f.timbre.setRootFrequency(233.123456789);
  const result = references.apply(edit.draftId); assert.equal(result.status, 'applied');
  if (result.status !== 'applied') throw new Error('Expected occurrence application');
  const changed = readSongBody(f.library.readDraft(root.id)!.body).tracks[0]!.clips;
  assert.equal(changed[0]!.phraseId, f.melody.id); assert.notEqual(changed[1]!.phraseId, f.melody.id);
  const isolated = readPhraseBody(f.library.readContent(changed[1]!.phraseId)!.body);
  assert.equal(isolated.parts[0]!.timbreId, result.content.id);
  const voice = readEditableTimbreBody(result.content.body); assert.equal(voice.model, 'sample-instrument');
  if (voice.model !== 'sample-instrument') throw new Error('Expected sampled instrument');
  assert.equal(voice.sampleId, f.source.id); assert.equal(voice.startSeconds, 0.5); assert.equal(voice.rootFrequencyHz, 233.123456789);
  assert.deepEqual(f.library.readContent(f.source.id), before); assert.deepEqual(f.library.readContent(f.voice.id), voiceBefore);
  const reopened = createMaterialLibrary(f.storage); reopened.travelDraft(root.id, 'undo', reopened.readDraft(root.id)!);
  assert(readSongBody(reopened.readDraft(root.id)!.body).tracks[0]!.clips.every(clip => clip.phraseId === f.melody.id));
  assert.deepEqual(reopened.readContent(f.source.id), before);
  reopened.travelDraft(root.id, 'redo', reopened.readDraft(root.id)!);
  assert.equal(readSongBody(reopened.readDraft(root.id)!.body).tracks[0]!.clips[1]!.phraseId, changed[1]!.phraseId);
  const restored = createSongEditor(reopened, createPhrasePlayback(reopened, createTimbrePlayback(reopened, createSampleAudio(reopened, f.decoder))), { defaultTempoMode: 'source' });
  restored.openDraft(root.id); await restored.preparePreview();
  const events = restored.previewPlan().events; assert.equal(events.length, 4);
  assert.equal((events[0]!.sound as SampleSoundPlan).startSeconds, 0.125);
  assert.equal((events[2]!.sound as SampleSoundPlan).startSeconds, 0.5);
  f.sampling.dispose();
});

test('co-creation preserves a hand-shaped sample voice and shares its source through candidate preview, fine editing and song packaging', async () => {
  const f = await fixture(); const cache = createSampleAudio(f.library, f.decoder); const co = createCoCreation(f.library, cache);
  co.start(f.melody.id); const writes = f.writes(); const contents = f.library.listContent();
  await co.prepareIdea('airy'); const audition = co.previewIdea('airy'); const sampled = sampleEvent(audition);
  assert.equal(sampled.source.id, f.source.id); assert.equal(sampled.startSeconds, 0.125); assert.equal(sampled.playbackRate, 1.5);
  assert.equal(f.writes(), writes); assert.deepEqual(f.library.listContent(), contents);
  co.chooseIdea('airy', co.read().token); const selected = co.read().currentPhrase!;
  const melodyVoice = f.library.readContent(readPhraseBody(selected.body).parts[0]!.timbreId)!;
  assert.deepEqual(melodyVoice.body, f.voice.body); assert.deepEqual(melodyVoice.dependencies, [f.source.id]);
  assert.equal(f.library.listContentInfo().filter(item => item.kind === 'rootsound.sample').length, 1);
  await co.prepareCurrent(); assert.equal(sampleEvent(co.previewCurrent()).source.id, f.source.id);
  f.song.createFromPhrase(selected.id); const output = createProjectPackages(f.library, adapters(), { rootKind: 'rootsound.song' }).exportDraft(f.song.read().draft!.id);
  const target = memoryStore(); const imported = createProjectPackages(target.library, adapters(), { rootKind: 'rootsound.song' }).importProject(output.text);
  assert.equal(imported.status, 'imported'); assert.equal(target.library.listContentInfo().filter(item => item.kind === 'rootsound.sample').length, 1);
  f.sampling.dispose();
});

test('metadata reads expose independent identity/revision/dependencies without copying original sample payloads', async () => {
  const f = await fixture(); const before = f.raw(); const writes = f.writes();
  const info = f.library.readContentInfo(f.voice.id)!; assert.equal(Object.hasOwn(info, 'body'), false);
  info.dependencies.length = 0; info.name = '外部篡改';
  const list = f.library.listContentInfo(); assert(list.every(item => !Object.hasOwn(item, 'body')));
  list.find(item => item.id === f.source.id)!.revision = 100;
  assert.deepEqual(f.library.readContent(f.voice.id), f.voice); assert.deepEqual(f.library.readContent(f.source.id), f.source);
  assert.equal(f.library.readContentInfo('missing'), undefined); assert.equal(f.raw(), before); assert.equal(f.writes(), writes);
  f.sampling.dispose();
});
