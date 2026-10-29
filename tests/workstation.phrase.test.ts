import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { ContentRecord, MaterialStorage, SaveResult } from '../src/workstation/contracts/content.ts';
import type { PhraseBody, PhraseNote } from '../src/workstation/contracts/phrase.ts';
import { PHRASE_STEPS_PER_BEAT, phraseStepsPerBeat } from '../src/workstation/contracts/phrase.ts';
import type { PlayableNotePlan, SoundPlan } from '../src/workstation/contracts/sound.ts';
import { MAX_PHRASE_BEATS, MAX_PHRASE_NOTES } from '../src/workstation/contracts/phrase-limits.ts';
import { createMaterialLibrary, createProjectPackages } from '../src/workstation/modules/materials/public.ts';
import { createPhraseEditor, createPhrasePlayback, createPhraseReferenceAdapter, readPhraseBody } from '../src/workstation/modules/phrase/public.ts';
import { createTimbreEditor, createTimbrePlayback, createTimbreReferenceAdapter } from '../src/workstation/modules/timbre/public.ts';
import { createSongEditor, createSongReferenceAdapter } from '../src/workstation/modules/song/public.ts';
import { createPhraseAudition } from '../src/workstation/modules/ui-rendering/phrase-audition.ts';
import { createSampleAudio } from '../src/workstation/modules/sampling/public.ts';
import { encodeBase64, encodeFloatWav, decodePcmWav } from '../src/workstation/modules/sampling/audio.ts';

function sources(sound: PlayableNotePlan) { assert.equal(sound.kind, 'basic-synth'); if (sound.kind !== 'basic-synth') throw new Error('Expected basic voice'); return sound.sources; }

function saved(result: SaveResult): ContentRecord {
  assert.equal(result.status, 'saved');
  if (result.status !== 'saved') throw new Error('Expected successful save.');
  return result.content;
}
function fixture() {
  let raw: string | null = null;
  let failing = false;
  let writes = 0;
  const storage: MaterialStorage = {
    read: () => raw,
    write(value) { if (failing) throw new Error('测试磁盘写入失败'); raw = value; writes++; },
  };
  const library = createMaterialLibrary(storage);
  const timbre = createTimbreEditor(library);
  timbre.rename('温柔的光');
  const first = saved(timbre.save('new'));
  timbre.create();
  timbre.rename('清澈的雨');
  timbre.setCharacter('clear');
  timbre.setEnvelope(2, 1.25);
  const second = saved(timbre.save('new'));
  const playback = createTimbrePlayback(library);
  const phrase = createPhraseEditor(library, playback);
  return { library, timbre, playback, phrase, first, second, storage, raw: () => raw,
    writes: () => writes, fail: (value = true) => { failing = value; } };
}
function start(f: ReturnType<typeof fixture>): string {
  f.phrase.create(f.first.id);
  return f.phrase.read().body!.parts[0]!.id;
}
function note(changes: Partial<Omit<PhraseNote, 'id'>> = {}): Omit<PhraseNote, 'id'> {
  return { startBeat: 0, durationBeats: 1, frequencyHz: 220, velocity: 0.7, ...changes };
}
function baseBody(timbreId = 'sound-a'): PhraseBody {
  return { model: 'note-phrase', version: 1, timeUnit: 'beat', tempoBpm: 120, lengthBeats: 8,
    parts: [{ id: 'part-a', name: '一个声音', timbreId, notes: [{ id: 'note-a', ...note() }] }] };
}

test('older phrases default to four cells without rewriting omitted metadata, and invalid subdivision never changes a draft', () => {
  assert.equal(PHRASE_STEPS_PER_BEAT, 4); assert.equal(phraseStepsPerBeat(), 4); assert.equal(phraseStepsPerBeat({}), 4);
  const legacy = readPhraseBody(baseBody()); assert.equal(phraseStepsPerBeat(legacy), 4); assert.equal(Object.hasOwn(legacy, 'stepsPerBeat'), false);
  assert.equal(readPhraseBody({ ...legacy, stepsPerBeat: 4 }).stepsPerBeat, 4);
  const f = fixture(); start(f); const before = f.phrase.read(), raw = f.raw(), writes = f.writes(), token = f.library.currentToken();
  f.phrase.setStepsPerBeat(4); assert.equal(f.writes(), writes); assert.equal(f.library.currentToken(), token);
  for (const value of [0, 1, 10, -1, 2.5, NaN, Infinity, null, '3', undefined]) {
    assert.throws(() => f.phrase.setStepsPerBeat(value as number), /每拍格数/);
    if (value !== undefined) assert.throws(() => readPhraseBody({ ...legacy, stepsPerBeat: value }), /每拍格数/);
  }
  assert.equal(f.raw(), raw); assert.equal(f.writes(), writes); assert.deepEqual(f.phrase.read(), before);
});

test('changing shared melody/rhythm subdivision preserves off-grid starts, exact held seconds and playback through durable undo', () => {
  const f = fixture(), melody = start(f), rhythm = f.phrase.addPart(f.second.id, 'rhythm');
  f.phrase.addNote(melody, note({ startBeat: .137, durationBeats: .347, durationSeconds: .413, level: .45, pan: -.3 }));
  f.phrase.addNote(rhythm, note({ startBeat: 2.173, durationBeats: .129, frequencyHz: 55, velocity: .9 }));
  const parts = structuredClone(f.phrase.read().body!.parts), plan = f.phrase.previewPlan();
  for (const n of [2, 3, 5, 9]) {
    const before = f.phrase.read().body!, writes = f.writes(); f.phrase.setStepsPerBeat(n);
    assert.equal(f.writes(), writes + 1); assert.equal(phraseStepsPerBeat(f.phrase.read().body), n);
    assert.deepEqual(f.phrase.read().body!.parts, parts); assert.deepEqual(f.phrase.previewPlan(), plan);
    f.phrase.undo(); assert.deepEqual(f.phrase.read().body, before); f.phrase.redo(); assert.equal(f.phrase.read().body!.stepsPerBeat, n);
    const unchanged = f.writes(); f.phrase.setStepsPerBeat(n); assert.equal(f.writes(), unchanged);
  }
  const content = saved(f.phrase.save('new')), reopenedLibrary = createMaterialLibrary(f.storage);
  const reopened = createPhraseEditor(reopenedLibrary, createTimbrePlayback(reopenedLibrary)); reopened.open(content.id);
  assert.equal(reopened.read().body!.stepsPerBeat, 9); assert.deepEqual(reopened.read().body!.parts, parts); assert.deepEqual(reopened.previewPlan(), plan);
  reopened.undo(); assert.equal(reopened.read().body!.stepsPerBeat, 5); assert.deepEqual(reopened.previewPlan(), plan);
  reopened.redo(); assert.equal(reopened.read().body!.stepsPerBeat, 9);
  const before = reopened.read(), oldRaw = f.raw(); f.fail();
  assert.throws(() => reopened.setStepsPerBeat(2), /写入失败/); assert.equal(f.raw(), oldRaw); assert.deepEqual(reopened.read(), before);
});

test('portable songs carry non-four phrase subdivisions without quantizing stored performance or changing dependency identity', () => {
  for (const n of [2, 3, 5, 9]) {
    const f = fixture(), melody = start(f), rhythm = f.phrase.addPart(f.second.id, 'rhythm');
    f.phrase.addNote(melody, note({ startBeat: 1 / 7, durationBeats: .12345, durationSeconds: .27182 }));
    f.phrase.addNote(rhythm, note({ startBeat: 1 / 3, durationBeats: .19283, durationSeconds: .09273, frequencyHz: 55 }));
    f.phrase.setStepsPerBeat(n); const content = saved(f.phrase.save('new'));
    const playback = createPhrasePlayback(f.library, f.playback), song = createSongEditor(f.library, playback, { defaultTempoMode: 'source' });
    song.createFromPhrase(content.id, `每拍 ${n} 格`); const expected = song.previewPlan();
    const adapters = [createTimbreReferenceAdapter(), createPhraseReferenceAdapter(), createSongReferenceAdapter()];
    const packed = createProjectPackages(f.library, adapters, { rootKind: 'rootsound.song' }).exportDraft(song.read().draft!.id);
    const target = createMaterialLibrary(), result = createProjectPackages(target, adapters, { rootKind: 'rootsound.song' }).importProject(packed.text);
    assert.equal(result.status, 'imported'); if (result.status !== 'imported') throw new Error('Expected imported');
    const restored = target.listContent().find(record => record.kind === 'rootsound.phrase')!, body = readPhraseBody(restored.body);
    assert.equal(body.stepsPerBeat, n); assert.deepEqual(body.parts.map(part => part.notes), f.phrase.read().body!.parts.map(part => part.notes));
    assert.equal(restored.dependencies.length, 2); assert(restored.dependencies.every(id => !content.dependencies.includes(id)));
    const importedSong = createSongEditor(target, createPhrasePlayback(target, createTimbrePlayback(target)), { defaultTempoMode: 'source' }); importedSong.openDraft(result.draft.id);
    assert.deepEqual(importedSong.previewPlan(), expected);
  }
});

test('unselecting tones is optional, atomic and retains note identities while silencing their uses', () => {
  const f=fixture();const one=start(f);const two=f.phrase.addPart(f.first.id);const rhythm=f.phrase.addPart(f.first.id,'rhythm');
  f.phrase.addNote(one,note());f.phrase.addNote(two,note({startBeat:1}));f.phrase.addNote(rhythm,note({startBeat:2}));
  const original=f.phrase.read().body!;const plan=f.phrase.previewPlan();const writes=f.writes();
  assert.equal(Object.hasOwn(original.parts[0]!,'unassigned'),false);
  f.phrase.setPartsVisible([one,two],false);assert.equal(f.writes(),writes+1);
  const hidden=f.phrase.read().body!;assert(hidden.parts.slice(0,2).every(part=>part.unassigned===true));assert.equal(hidden.parts[2]!.unassigned,undefined);
  assert.deepEqual(hidden.parts.map(part=>part.notes),original.parts.map(part=>part.notes));const partial={...plan,events:[plan.events[2]!]};assert.deepEqual(f.phrase.previewPlan(),partial);
  const token=f.library.currentToken();f.phrase.setPartsVisible([one,two],false);assert.equal(f.library.currentToken(),token);
  f.phrase.undo();assert.deepEqual(f.phrase.read().body,original);f.phrase.redo();assert.deepEqual(f.phrase.read().body,hidden);
  const content=saved(f.phrase.save('new'));const reopenedLibrary=createMaterialLibrary(f.storage);const reopened=createPhraseEditor(reopenedLibrary,createTimbrePlayback(reopenedLibrary));reopened.open(content.id);
  assert.deepEqual(reopened.read().body,hidden);assert.deepEqual(reopened.previewPlan(),partial);
  reopened.setPartVisible(one,true);assert.equal(Object.hasOwn(reopened.read().body!.parts[0]!,'unassigned'),false);
  const before=f.raw();assert.throws(()=>f.phrase.setPartsVisible([one,'missing'],true),/找不到/);assert.equal(f.raw(),before);
  for(const value of [null,'true',1]){const body=structuredClone(original);Object.assign(body.parts[0]!,{unassigned:value});assert.throws(()=>readPhraseBody(body),/音色状态/);}
});

test('removing every tone is a reversible silent phrase edit and never removes the saved sound assets', () => {
  const f=fixture();const one=start(f),two=f.phrase.addPart(f.second.id);f.phrase.addNote(one,note());f.phrase.addNote(two,note());
  const before=f.phrase.read().body!;const writes=f.writes();f.phrase.removeParts([one,two]);assert.equal(f.writes(),writes+1);
  assert.deepEqual(f.phrase.read().body!.parts,[]);assert.deepEqual(f.phrase.read().draft!.dependencies,[]);
  assert.deepEqual(f.phrase.previewPlan(undefined,{allowSilence:true}),{kind:'sequence',version:1,durationSeconds:4,events:[]});
  assert.deepEqual(f.library.readContent(f.first.id),f.first);assert.deepEqual(f.library.readContent(f.second.id),f.second);
  f.phrase.undo();assert.deepEqual(f.phrase.read().body,before);f.phrase.redo();assert.deepEqual(f.phrase.read().body!.parts,[]);
  f.phrase.addPart(f.first.id);assert.equal(f.phrase.read().body!.parts.length,1);
});

test('a library tone can be auditioned before it is added without changing phrase history or selection data', async () => {
  const f=fixture();start(f);f.phrase.setMasterLevel(.4);const before=f.raw(),writes=f.writes(),history=f.library.readDraftHistory(f.phrase.read().draft!.id);
  const input={frequencyHz:261.6255653005986,holdSeconds:.35,velocity:.75};const sound=await f.phrase.previewTimbrePlan(f.second.id,input);const raw=f.playback.planForSaved(f.second.id,input);
  assert.deepEqual(sound,{...raw,level:raw.level*.4});assert.equal(f.raw(),before);assert.equal(f.writes(),writes);assert.deepEqual(f.library.readDraftHistory(f.phrase.read().draft!.id),history);assert.equal(f.phrase.read().body!.parts.length,1);
  await assert.rejects(f.phrase.previewTimbrePlan('missing',input),/当前歌曲音色库/);await assert.rejects(f.phrase.previewTimbrePlan(f.second.id,{...input,frequencyHz:NaN}),/音高/);assert.equal(f.raw(),before);
});

test('fully unassigned notes save and play silently without preparing or auditioning their former tone', async () => {
  const f=fixture();const part=start(f);const id=f.phrase.addNote(part,note());const original=f.phrase.read().body!;f.phrase.setPartVisible(part,false);
  const prepared:string[]=[];const editor=createPhraseEditor(f.library,{...f.playback,async prepareForSaved(id){prepared.push(id);}});
  await editor.preparePreview();assert.deepEqual(prepared,[]);assert.deepEqual(editor.previewPlan().events,[]);
  await assert.rejects(editor.previewNotePlan(part,noteToPlan()),/尚未定义/);assert.deepEqual(prepared,[]);
  const file=saved(editor.save('new'));const phrases=createPhrasePlayback(f.library,f.playback);await phrases.prepareForSaved(file.id);assert.deepEqual(phrases.planForSaved(file.id).events,[]);
  const input={frequencyHz:261.6255653005986,holdSeconds:.35,velocity:.75};const sound=await editor.previewTimbrePlan(f.first.id,input);assert.equal(sound.note.frequencyHz,input.frequencyHz);
  editor.setPartVisible(part,true);assert.deepEqual(editor.read().body,original);assert.equal(editor.read().body!.parts[0]!.notes[0]!.id,id);assert.equal(editor.previewPlan().events.length,1);
});

test('phrase construction is lazy and exposes every valid equal-tempered pitch without limiting stored tuning', () => {
  const f = fixture();
  const before = f.raw();
  assert.equal(f.phrase.read().draft, undefined);
  assert.equal(f.phrase.read().body, undefined);
  assert.deepEqual(f.phrase.read().availableSounds.map(sound => sound.id), [f.first.id, f.second.id]);
  assert.equal(f.raw(), before);
  assert.throws(() => f.phrase.previewPlan(), /开始谱写/);
  const keys = f.phrase.keyboard();
  assert.equal(keys.length, 96);
  assert.equal(keys[0]!.label, 'E0');
  assert.equal(keys.at(-1)!.label, 'D♯8');
  assert.equal(keys.find(key => key.label === 'A4')!.frequencyHz, 440);
  assert.equal(keys.filter(key => key.accidental).length, 40);
  for (let index = 0; index < keys.length; index++) {
    assert(keys[index]!.frequencyHz >= 20 && keys[index]!.frequencyHz <= 5000);
    if (index) assert(Math.abs(keys[index]!.frequencyHz / keys[index - 1]!.frequencyHz - 2 ** (1 / 12)) < 1e-12);
  }
  assert(keys[0]!.frequencyHz / 2 ** (1 / 12) < 20);
  assert(keys.at(-1)!.frequencyHz * 2 ** (1 / 12) > 5000);
  assert.equal(f.raw(), before);
  const part = start(f);
  const frequencies = [...keys.map(key => key.frequencyHz), 20, 5000, 220.123456];
  f.phrase.addNotes(part, frequencies.map(frequencyHz => note({ frequencyHz })));
  assert.deepEqual(f.phrase.read().body!.parts[0]!.notes.map(item => item.frequencyHz), frequencies);
  assert.deepEqual(f.phrase.previewPlan().events.map(event => event.sound.note.frequencyHz), frequencies);
});

test('a phrase references several saved sounds once and translates beats and overlaps into an execution sequence', () => {
  const f = fixture();
  const firstPart = start(f);
  const secondPart = f.phrase.addPart(f.second.id);
  const duplicatePart = f.phrase.addPart(f.first.id);
  f.phrase.setTempo(90);
  f.phrase.setLength(4);
  f.phrase.addNote(firstPart, note({ startBeat: 0, durationBeats: 2 }));
  f.phrase.addNote(secondPart, note({ startBeat: 1, durationBeats: 0.25, frequencyHz: 440, velocity: 0.4 }));
  f.phrase.addNote(duplicatePart, note({ startBeat: 3, durationBeats: 1, frequencyHz: 330 }));
  const body = f.phrase.read().body!;
  assert.equal(body.parts[1]!.name, f.second.name);
  assert.deepEqual(f.phrase.read().draft!.dependencies, [f.first.id, f.second.id]);
  const before = f.raw();
  const plan = f.phrase.previewPlan();
  assert.equal(plan.kind, 'sequence');
  assert.equal(plan.events.length, 3);
  assert.deepEqual(plan.events.map(event => event.atSeconds), [0, 2 / 3, 2]);
  assert.equal(plan.events[0]!.sound.note.holdSeconds, 4 / 3);
  assert.equal(plan.events[1]!.sound.note.holdSeconds, 1 / 6);
  assert.equal(plan.events[1]!.sound.envelope.attackSeconds, 2, 'short notes retain the saved attack and release early');
  assert.deepEqual(sources(plan.events[1]!.sound), sources(f.playback.planForSaved(f.second.id, noteToPlan())));
  assert.equal(plan.durationSeconds, 2 + 2 / 3 + 0.55);
  assert.equal(f.raw(), before, 'compilation cannot write or save a phrase');
  const content = saved(f.phrase.save('new'));
  assert.deepEqual(content.dependencies, [f.first.id, f.second.id]);
  assert.equal(JSON.stringify(content.body).includes('basic-synth'), false);
  assert.equal(JSON.stringify(content.body).includes('attackSeconds'), false);
});

function noteToPlan() { return { frequencyHz: 220, holdSeconds: 1, velocity: 0.7 }; }

test('individual key audition prepares the selected voice in an empty phrase without changing content or history', async () => {
  const f = fixture(); start(f); const part = f.phrase.addPart(f.second.id); const prepared: string[] = [];
  const phrase = createPhraseEditor(f.library, { ...f.playback, async prepareForSaved(id) { prepared.push(id); } });
  const before = f.raw(); const writes = f.writes(); const history = f.library.readDraftHistory(phrase.read().draft!.id);
  const target = { frequencyHz: 369.9944227116344, holdSeconds: 0.37, velocity: 0.42 };
  const plan = await phrase.previewNotePlan(part, target);
  assert.deepEqual(plan, f.playback.planForSaved(f.second.id, target)); assert.deepEqual(prepared, [f.second.id]);
  assert.equal(f.raw(), before); assert.equal(f.writes(), writes); assert.deepEqual(f.library.readDraftHistory(phrase.read().draft!.id), history);
  assert(phrase.read().body!.parts.every(item => item.notes.length === 0));
  await assert.rejects(phrase.previewNotePlan(part, { ...target, frequencyHz: NaN }), /音高/);
  assert.equal(prepared.length, 1); assert.equal(f.writes(), writes);
});

test('late individual note preparation rejects a changed sound or a different draft', async () => {
  const f = fixture(); const part = start(f); let release!: () => void;
  const phrase = createPhraseEditor(f.library, { ...f.playback, prepareForSaved() { return new Promise<void>(resolve => { release = resolve; }); } });
  const first = phrase.previewNotePlan(part, noteToPlan()); phrase.setPartTimbre(part, f.second.id); release();
  await assert.rejects(first, /声音发生变化/);
  const second = phrase.previewNotePlan(part, noteToPlan()); phrase.create(f.first.id); release();
  await assert.rejects(second, /声音发生变化/);
});

test('phrase readiness prepares exact unique note parameters for current, temporary and tempo-overridden playback', async () => {
  const f = fixture(), first = start(f); f.phrase.setLength(32);
  f.phrase.addNotes(first, [note({ durationBeats: 2, velocity: .5 }), note({ startBeat: 4, durationBeats: 2, velocity: .5 }),
    note({ startBeat: 8, durationBeats: 1, durationSeconds: .37, frequencyHz: 330 })]);
  const duplicate = f.phrase.addPart(f.first.id); f.phrase.addNote(duplicate, note({ startBeat: 12, durationBeats: 2, velocity: .5 }));
  const silent = f.phrase.addPart(f.second.id); f.phrase.addNote(silent, note({ frequencyHz: 880 })); f.phrase.setPartVisible(silent, false);
  const calls: Array<{ id: string; notes: readonly SoundPlan['note'][] }> = [];
  const sounds = { ...f.playback, async prepareForSaved(id: string, notes: readonly SoundPlan['note'][] = []) { calls.push({ id, notes: structuredClone(notes) }); } };
  const editor = createPhraseEditor(f.library, sounds), before = f.raw();
  await editor.preparePreview();
  assert.deepEqual(calls, [{ id: f.first.id, notes: [{ frequencyHz: 220, holdSeconds: 1, velocity: .5 },
    { frequencyHz: 330, holdSeconds: .37, velocity: .7 }] }]);
  const temporary = structuredClone(editor.read().body!); temporary.tempoBpm = 240;
  temporary.parts[0]!.notes[0] = { ...temporary.parts[0]!.notes[0]!, frequencyHz: 660, durationSeconds: .19, velocity: .42 };
  calls.length = 0; await editor.preparePreview(temporary);
  const expected = [...new Set(editor.previewPlan(temporary).events.map(event => JSON.stringify(event.sound.note)))].sort();
  assert.deepEqual(calls.flatMap(call => call.notes.map(input => JSON.stringify(input))).sort(), expected);
  assert.equal(calls.length, 1); assert.equal(f.raw(), before, 'readiness never stores a temporary body');
  const content = saved(f.phrase.save('new')); calls.length = 0;
  await createPhrasePlayback(f.library, sounds).prepareForSaved(content.id, 60);
  assert.deepEqual(calls[0]!.notes.map(input => input.holdSeconds), [2, .37], 'only beat-held notes follow the overridden tempo');
  calls.length = 0; const key = { frequencyHz: 612, holdSeconds: .29, velocity: .42 };
  await editor.previewNotePlan(first, key); assert.deepEqual(calls, [{ id: f.first.id, notes: [key] }]);
  calls.length = 0; await editor.previewTimbrePlan(f.second.id, key); assert.deepEqual(calls, [{ id: f.second.id, notes: [key] }]);
});

test('a sampled voice can audition before the phrase has notes and prepares only its selected source', async () => {
  const f = fixture(); const pcm = { sampleRate: 8000, channels: [new Float32Array(8000).fill(0.3)] }; const bytes = encodeFloatWav(pcm);
  const source: ContentRecord = { id: 'note-source', kind: 'rootsound.sample', owner: 'sampling', schemaVersion: 1,
    revision: 1, name: 'note source', dependencies: [], body: { model: 'audio-sample', version: 1,
      source: { kind: 'file', name: 'note.wav', mimeType: 'audio/wav' }, audio: { encoding: 'base64', byteLength: bytes.length, data: encodeBase64(bytes) },
      decoded: { sampleRate: 8000, channels: 1, frames: 8000, durationSeconds: 1 } } };
  assert.equal(f.library.commitTransaction({ expectedToken: f.library.currentToken(), label: 'test sample', createContents: [source] }).status, 'committed');
  const warm = createSampleAudio(f.library, { async decode(input) { return decodePcmWav(input)!; } });
  const editor = createTimbreEditor(f.library, warm); await editor.createFromSample(source.id); editor.setRootFrequency(220);
  const voice = saved(editor.save('new')); let release!: () => void; let decodes = 0;
  const cold = createSampleAudio(f.library, { async decode(input) { decodes++; await new Promise<void>(resolve => { release = resolve; }); return decodePcmWav(input)!; } });
  const phrase = createPhraseEditor(f.library, createTimbrePlayback(f.library, cold)); phrase.create(voice.id);
  const part = phrase.read().body!.parts[0]!.id; phrase.addPart(f.first.id); const writes = f.writes();
  const requested = phrase.previewNotePlan(part, { frequencyHz: 440, holdSeconds: 0.27, velocity: 0.6 });
  await Promise.resolve();
  assert.equal(decodes, 1); release(); const plan = await requested; assert.equal(plan.kind, 'sample');
  if (plan.kind !== 'sample') throw new Error('Expected prepared sampled voice');
  assert.equal(plan.source.id, source.id); assert.equal(plan.playbackRate, 2); assert.equal(plan.note.holdSeconds, 0.27);
  assert.equal(plan.note.velocity, 0.6); assert.equal(f.writes(), writes); assert.equal(phrase.read().body!.parts[0]!.notes.length, 0);
});

test('audition controller discards stale keys and cancelled or changed voice scopes without disturbing stored notes', async () => {
  const f = fixture(); let part = start(f); const requests: { resolve(): void }[] = []; const heard: PlayableNotePlan[] = []; const errors: string[] = []; let stops = 0;
  const phrase = { ...f.phrase, async previewNotePlan(id: string, input: Parameters<typeof f.phrase.previewNotePlan>[1]) {
    await new Promise<void>(resolve => { requests.push({ resolve }); }); return f.phrase.previewNotePlan(id, input);
  } };
  const audition = createPhraseAudition(phrase, { async audition(plan) { heard.push(plan); }, cancelAudition() { stops++; } }, () => part, error => errors.push(error));
  audition.sync(); const before = f.raw(); const first = audition.request(220); const second = audition.request(440, 4, 0.4);
  requests[1]!.resolve(); await second; requests[0]!.resolve(); await first;
  assert.equal(heard.length, 1); assert.equal(heard[0]!.note.frequencyHz, 440); assert.equal(heard[0]!.note.holdSeconds, 0.75);
  assert.equal(heard[0]!.note.velocity, 0.4); assert.equal(f.raw(), before);
  const leaving = audition.request(330); audition.cancel(); requests[2]!.resolve(); await leaving; assert.equal(heard.length, 1);
  const changing = audition.request(660); part = f.phrase.addPart(f.second.id); audition.sync(); requests[3]!.resolve(); await changing;
  assert.equal(heard.length, 1); assert.deepEqual(errors, []); assert(stops >= 6);
});

test('audition device failures leave an already committed note and its single undo step intact', async () => {
  const f = fixture(); const part = start(f); const writes = f.writes(); const added = f.phrase.addNote(part, note()); const errors: string[] = [];
  const audition = createPhraseAudition(f.phrase, { async audition() { throw new Error('device unavailable'); }, cancelAudition() {} }, () => part, error => errors.push(error));
  await audition.request(220, 0.5, 0.7);
  assert.equal(f.writes(), writes + 1); assert.equal(f.phrase.read().body!.parts[0]!.notes[0]!.id, added);
  assert.match(errors[0]!, /device unavailable/); f.phrase.undo(); assert.equal(f.phrase.read().body!.parts[0]!.notes.length, 0);
});

test('off-grid timing and arbitrary physical pitch survive edits, save, reopening, and short-note compilation exactly', () => {
  const f = fixture();
  const part = start(f);
  const input = note({ startBeat: 0.123456789123, durationBeats: 0.00123456789,
    frequencyHz: 439.123456789, velocity: 0.7321234567 });
  const id = f.phrase.addNote(part, input);
  assert.deepEqual(f.phrase.read().body!.parts[0]!.notes, [{ ...input, id }]);
  const content = saved(f.phrase.save('new'));
  const reopenedLibrary = createMaterialLibrary(f.storage);
  const reopened = createPhraseEditor(reopenedLibrary, createTimbrePlayback(reopenedLibrary));
  assert.deepEqual(reopened.read().body, f.phrase.read().body);
  assert.equal(reopened.read().draft!.sourceId, content.id);
  assert.equal(reopened.read().changed, false);
  const event = reopened.previewPlan().events[0]!;
  assert.equal(event.atSeconds, input.startBeat / 2);
  assert.equal(event.sound.note.holdSeconds, input.durationBeats / 2);
  assert.equal(event.sound.note.frequencyHz, input.frequencyHz);
  assert.equal(event.sound.envelope.attackSeconds, 0.025);
  assert.equal(reopened.read().canUndo, true, 'the editable draft retains its undo history after reopening');
});

test('phrase undo and redo survive separate restarts without rolling back the saved shared phrase', () => {
  const f = fixture(); const part = start(f); const id = f.phrase.addNote(part, note());
  const content = saved(f.phrase.save('new')); const draftId = f.phrase.read().draft!.id;
  f.phrase.updateNote(part, id, { startBeat: 2, frequencyHz: 440 });
  let library = createMaterialLibrary(f.storage);
  let editor = createPhraseEditor(library, createTimbrePlayback(library));
  assert.equal(editor.read().canUndo, true); editor.undo();
  assert.equal(editor.read().body!.parts[0]!.notes[0]!.startBeat, 0);
  assert.equal(editor.read().changed, false); assert.equal(editor.read().draft!.id, draftId);
  library = createMaterialLibrary(f.storage); editor = createPhraseEditor(library, createTimbrePlayback(library));
  assert.equal(editor.read().canRedo, true); editor.redo();
  assert.equal(editor.read().body!.parts[0]!.notes[0]!.frequencyHz, 440);
  assert.deepEqual(library.readContent(content.id), content);
  assert.equal(editor.read().draft!.sourceId, content.id);
});

test('phrase temporary preview compiles a validated body without changing the draft, saved phrase or durable history', () => {
  const f = fixture(); const part = start(f); f.phrase.addNote(part, note()); saved(f.phrase.save('new'));
  const view = f.phrase.read(); const raw = f.raw(); const temporary = structuredClone(view.body!);
  temporary.parts[0]!.notes[0]!.frequencyHz = 440; temporary.parts[0]!.notes[0]!.startBeat = 2;
  temporary.parts[0]!.timbreId = f.second.id;
  const inputBefore = structuredClone(temporary); const preview = f.phrase.previewPlan(temporary);
  assert.equal(preview.events[0]!.atSeconds, 1); assert.equal(preview.events[0]!.sound.note.frequencyHz, 440);
  assert.equal(preview.events[0]!.sound.envelope.attackSeconds, 2);
  assert.deepEqual(temporary, inputBefore); assert.deepEqual(f.phrase.read(), view); assert.equal(f.raw(), raw);
  assert.throws(() => f.phrase.previewPlan({ ...temporary, futureParameter: 1 } as PhraseBody), /尚不支持/);
  temporary.parts[0]!.timbreId = 'missing'; assert.throws(() => f.phrase.previewPlan(temporary));
  assert.equal(f.raw(), raw); assert.deepEqual(f.phrase.read(), view);
});

test('live removal of every phrase note can replace the running plan with silence without allowing empty initial playback', () => {
  const f = fixture(); const part = start(f); const id = f.phrase.addNote(part, note());
  const temporary = f.phrase.read().body!; temporary.parts[0]!.notes = [];
  const raw = f.raw(); const history = f.library.readDraftHistory(f.phrase.read().draft!.id);
  assert.throws(() => f.phrase.previewPlan(temporary), /先添加/);
  const live = f.phrase.previewPlan(temporary, { allowSilence: true });
  assert.deepEqual(live.events, []); assert.equal(live.durationSeconds, 4);
  assert.equal(f.raw(), raw); assert.deepEqual(f.library.readDraftHistory(f.phrase.read().draft!.id), history);
  f.phrase.removeNote(part, id);
  assert.throws(() => f.phrase.previewPlan(), /先添加/);
  assert.deepEqual(f.phrase.previewPlan(undefined, { allowSilence: true }).events, []);
});

test('length changes reject cutting notes and invalid controls preserve the full current state', () => {
  const f = fixture();
  const part = start(f);
  f.phrase.addNote(part, note({ startBeat: 7, durationBeats: 1 }));
  const before = f.raw();
  const view = f.phrase.read();
  assert.throws(() => f.phrase.setLength(4), /超出乐句结尾/);
  for (const length of [-1, 0, MAX_PHRASE_BEATS + 1, NaN, Infinity]) assert.throws(() => f.phrase.setLength(length));
  for (const tempo of [0, 39, 241, NaN, Infinity]) assert.throws(() => f.phrase.setTempo(tempo));
  for (const change of [note({ durationBeats: 0 }), note({ durationBeats: 1 / 2048 }),
    note({ frequencyHz: 19 }), note({ frequencyHz: Infinity }), note({ velocity: 2 }),
    note({ startBeat: 8 }), { ...note(), samplePath: 'not-supported' }]) {
    assert.throws(() => f.phrase.addNote(part, change));
  }
  assert.equal(f.raw(), before);
  assert.deepEqual(f.phrase.read(), view);
  f.phrase.setLength(64);
  f.phrase.setTempo(40);
  f.phrase.addNote(part, note({ startBeat: 0, durationBeats: 64 }));
  assert.equal(f.phrase.previewPlan().events[0]!.sound.note.holdSeconds, 96);
});

test('note and part editing support undo, redo, branched history and independent save-as identity', () => {
  const f = fixture();
  const firstPart = start(f);
  const noteId = f.phrase.addNote(firstPart, note());
  f.phrase.updateNote(firstPart, noteId, { startBeat: 1.25, durationBeats: 0.5, frequencyHz: 330 });
  const updated = f.phrase.read().body;
  f.phrase.undo();
  assert.equal(f.phrase.read().body!.parts[0]!.notes[0]!.startBeat, 0);
  f.phrase.redo();
  assert.deepEqual(f.phrase.read().body, updated);
  const original = saved(f.phrase.save('new'));
  f.phrase.rename('另一个想法');
  const secondPart = f.phrase.addPart(f.second.id);
  f.phrase.setPartTimbre(firstPart, f.second.id);
  assert.deepEqual(f.phrase.read().draft!.dependencies, [f.second.id]);
  f.phrase.undo();
  assert.deepEqual(f.phrase.read().draft!.dependencies, [f.first.id, f.second.id]);
  f.phrase.removePart(secondPart);
  assert.equal(f.phrase.read().canRedo, false);
  f.phrase.removePart(firstPart);
  assert.deepEqual(f.phrase.read().body!.parts, []);
  assert.deepEqual(f.phrase.read().draft!.dependencies, []);
  f.phrase.undo();
  f.phrase.removeNote(firstPart, noteId);
  assert.throws(() => f.phrase.previewPlan(), /先添加/);
  assert.throws(() => f.phrase.save('new'), /先添加/);
  f.phrase.undo();
  const copy = saved(f.phrase.save('new'));
  assert.notEqual(copy.id, original.id);
  assert.equal(copy.name, '另一个想法');
  assert.deepEqual(f.library.readContent(original.id), original);
  assert.equal(f.phrase.read().draft!.sourceId, copy.id);
  assert.equal(f.phrase.read().changed, false);
});

test('changing a referenced sound warns for unfinished phrases and only a confirmed overwrite affects their next plan', () => {
  const f = fixture();
  const part = start(f);
  f.phrase.addNote(part, note());
  const draftId = f.phrase.read().draft!.id;
  const originalPlan = f.phrase.previewPlan();
  f.timbre.open(f.first.id);
  f.timbre.setCharacter('bright');
  const warning = f.timbre.save('overwrite');
  assert.equal(warning.status, 'needs-confirmation');
  if (warning.status !== 'needs-confirmation') throw new Error('Expected confirmation.');
  assert.ok(warning.affectedDrafts.some(draft => draft.id === draftId));
  assert.deepEqual(f.phrase.previewPlan(), originalPlan);
  const revised = saved(f.timbre.save('overwrite', warning.confirmation));
  assert.equal(revised.id, f.first.id);
  assert.notDeepEqual(sources(f.phrase.previewPlan().events[0]!.sound), sources(originalPlan.events[0]!.sound));
  const songPhrase = saved(f.phrase.save('new'));
  f.timbre.setCharacter('clear');
  const separate = saved(f.timbre.save('new'));
  assert.notEqual(separate.id, revised.id);
  assert.deepEqual(f.library.readContent(songPhrase.id)!.dependencies, [revised.id]);
  assert.deepEqual(sources(f.phrase.previewPlan().events[0]!.sound),
    sources(f.playback.planForSaved(revised.id, noteToPlan())));
});

test('unfinished older phrases remain discoverable and reopen without changing saved phrases', () => {
  const f = fixture();
  const part = start(f);
  f.phrase.addNote(part, note());
  const first = saved(f.phrase.save('new'));
  f.phrase.rename('尚未保存的第一段');
  f.phrase.updateNote(part, f.phrase.read().body!.parts[0]!.notes[0]!.id, { frequencyHz: 333.3 });
  const firstDraft = f.phrase.read().draft!.id;
  const firstPlan = f.phrase.previewPlan();
  f.phrase.create(f.second.id);
  const secondDraft = f.phrase.read().draft!.id;
  f.phrase.rename('还没有音符的第二段');
  const reopenedLibrary = createMaterialLibrary(f.storage);
  const reopened = createPhraseEditor(reopenedLibrary, createTimbrePlayback(reopenedLibrary));
  assert.equal(reopened.read().draft!.id, secondDraft);
  assert.ok(reopened.read().unfinishedDrafts.some(draft => draft.id === firstDraft));
  reopened.open(first.id);
  assert.equal(reopened.read().draft!.id, firstDraft);
  assert.deepEqual(reopened.previewPlan(), firstPlan);
  assert.deepEqual(reopenedLibrary.readContent(first.id), first);
  reopened.openDraft(secondDraft);
  assert.equal(reopened.read().draft!.name, '还没有音符的第二段');
});

test('unknown, missing and duplicate phrase fields are rejected without silently converting content', () => {
  const base = baseBody();
  const invalid: unknown[] = [null, [], {}, { ...base, version: 2 }, { ...base, timeUnit: 'seconds' },
    { ...base, waveform: 'sine' }, { ...base, parts: null }, { ...base, tempoBpm: NaN },
    { ...base, parts: [{ ...base.parts[0], timbre: {} }] },
    { ...base, parts: [{ ...base.parts[0], notes: [{ ...base.parts[0]!.notes[0], midi: 60 }] }] },
    { ...base, parts: [{ ...base.parts[0], notes: [{ ...base.parts[0]!.notes[0], id: 'part-a' }] }] },
    { ...base, parts: [{ ...base.parts[0], notes: [base.parts[0]!.notes[0], base.parts[0]!.notes[0]] }] },
  ];
  for (const value of invalid) assert.throws(() => readPhraseBody(value));
  for (const key of Object.keys(base)) {
    const value: Record<string, unknown> = { ...base }; delete value[key];
    assert.throws(() => readPhraseBody(value));
  }
  assert.deepEqual(readPhraseBody(base), base);
});

test('missing or mismatched references cannot become active or be partially compiled or saved', () => {
  const f = fixture();
  const part = start(f);
  f.phrase.addNote(part, note());
  const active = f.phrase.read().draft!.id;
  for (const [dependencies, body] of [
    [[], baseBody(f.first.id)], [[f.first.id, f.second.id], baseBody(f.first.id)],
    [['missing-sound'], baseBody('missing-sound')],
  ] as [string[], PhraseBody][]) {
    const bad = f.library.createDraft({ kind: 'rootsound.phrase', schemaVersion: 1, owner: 'phrase',
      name: '必须保留但不能打开的乐句', dependencies, body });
    const raw = f.raw();
    assert.throws(() => f.phrase.openDraft(bad.id));
    assert.equal(f.phrase.read().draft!.id, active);
    assert.equal(f.raw(), raw);
    assert.deepEqual(f.library.readDraft(bad.id), bad);
    const restored = createPhraseEditor(f.library, f.playback);
    assert.equal(restored.read().draft!.id, bad.id);
    assert.equal(restored.read().body, undefined);
    assert.ok(restored.read().problem);
    assert.equal(f.raw(), raw);
  }
  const raw = f.raw();
  assert.throws(() => f.phrase.create('missing-sound'));
  assert.throws(() => f.phrase.addPart('missing-sound'));
  assert.throws(() => f.phrase.setPartTimbre(part, 'missing-sound'));
  assert.throws(() => f.phrase.open(f.first.id));
  assert.equal(f.phrase.read().draft!.id, active);
  assert.equal(f.raw(), raw);
});

test('saved sound compilation rejects unsupported content versions, fields and external dependencies', () => {
  const f = fixture();
  const sample = saved(f.library.saveDraft(f.library.createDraft({ kind: 'rootsound.sample', schemaVersion: 1,
    owner: 'sample', name: '示例采样', body: {} }).id, 'new'));
  for (const input of [
    { schemaVersion: 2, dependencies: [], body: f.first.body },
    { schemaVersion: 1, dependencies: [sample.id], body: f.first.body },
    { schemaVersion: 1, dependencies: [], body: { ...(f.first.body as object), future: 'keep me' } },
  ]) {
    const content = saved(f.library.saveDraft(f.library.createDraft({ ...input,
      kind: 'rootsound.timbre', owner: 'timbre', name: '尚不支持的声音' }).id, 'new'));
    const before = f.raw();
    assert.throws(() => f.playback.planForSaved(content.id, noteToPlan()));
    assert.throws(() => f.phrase.create(content.id));
    assert.equal(f.raw(), before);
    assert.deepEqual(f.library.readContent(content.id), content);
  }
});

test('failed edits, undo, redo and creation preserve both durable content and history', () => {
  const f = fixture();
  const part = start(f);
  const id = f.phrase.addNote(part, note());
  f.phrase.updateNote(part, id, { frequencyHz: 330 });
  const original = f.phrase.read();
  const raw = f.raw();
  f.fail();
  assert.throws(() => f.phrase.undo(), /写入失败/);
  assert.throws(() => f.phrase.updateNote(part, id, { frequencyHz: 440 }), /写入失败/);
  assert.throws(() => f.phrase.create(f.second.id), /写入失败/);
  assert.equal(f.raw(), raw);
  assert.deepEqual(f.phrase.read(), original);
  const failure = f.phrase.save('new');
  assert.equal(failure.status, 'storage-error');
  assert.deepEqual(f.phrase.read(), original);
  f.fail(false);
  f.phrase.undo();
  const undone = f.phrase.read();
  const undoneRaw = f.raw();
  f.fail();
  assert.throws(() => f.phrase.redo(), /写入失败/);
  assert.deepEqual(f.phrase.read(), undone);
  assert.equal(f.raw(), undoneRaw);
  f.fail(false);
  f.phrase.redo();
  assert.deepEqual(f.phrase.read().body, original.body);
});

test('no-op edits do not write, and undo never overwrites another client editing the same draft', () => {
  const f = fixture();
  const part = start(f);
  const id = f.phrase.addNote(part, note());
  const count = f.writes();
  f.phrase.setTempo(120);
  f.phrase.setLength(8);
  f.phrase.updateNote(part, id, { frequencyHz: 220 });
  f.phrase.rename(f.phrase.read().draft!.name);
  assert.equal(f.writes(), count);
  const draft = f.phrase.read().draft!;
  f.library.updateDraft(draft.id, { name: '另一个窗口的修改' });
  const before = f.raw();
  f.phrase.undo();
  assert.equal(f.raw(), before);
  assert.equal(f.phrase.read().draft!.name, '另一个窗口的修改');
  assert.equal(f.phrase.read().canUndo, false);
});

test('the current editor caps parts, total notes and draft history without discarding older stored content', () => {
  const f = fixture();
  start(f);
  for (let index = 1; index < 8; index++) f.phrase.addPart(f.first.id);
  const before = f.raw();
  assert.throws(() => f.phrase.addPart(f.second.id), /最多可使用 8/);
  assert.equal(f.raw(), before);
  const body = baseBody(f.first.id);
  body.parts[0]!.notes = Array.from({ length: MAX_PHRASE_NOTES }, (_, index) => ({ id: `note-${index}`, ...note() }));
  assert.equal(readPhraseBody(body).parts[0]!.notes.length, MAX_PHRASE_NOTES);
  body.parts[0]!.notes.push({ id: 'too-many', ...note() });
  assert.throws(() => readPhraseBody(body), /50000/);
  for (let index = 0; index < 70; index++) f.phrase.rename(`第${index}次修改`);
  let undos = 0;
  while (f.phrase.read().canUndo) { f.phrase.undo(); undos++; }
  assert.equal(undos, 64);
  assert.equal(f.phrase.read().draft!.name, '第5次修改');
});

test('a long phrase with thousands of notes remains editable and retains length, exact notes and history after cold reopening', () => {
  const f = fixture(), partId = start(f); f.phrase.setLength(MAX_PHRASE_BEATS);
  const inputs = Array.from({ length: 5267 }, (_, index) => note({ startBeat: index / 8, durationBeats: .125,
    durationSeconds: .0625, frequencyHz: 220 + index % 12, velocity: .6 }));
  const beforeInputs = structuredClone(inputs), writes = f.writes();
  const ids = f.phrase.addNotes(partId, inputs); assert.equal(f.writes() - writes, 1);
  assert.deepEqual(inputs, beforeInputs); assert.equal(ids.length, 5267);
  const content = saved(f.phrase.save('new'));
  const coldLibrary = createMaterialLibrary(f.storage), cold = createPhraseEditor(coldLibrary, createTimbrePlayback(coldLibrary));
  cold.open(content.id); assert.equal(cold.read().body!.lengthBeats, MAX_PHRASE_BEATS);
  assert.equal(cold.previewPlan().events.length, 5267);
  const original = cold.read().body!, lastId = ids.at(-1)!;
  cold.updateNote(partId, lastId, { startBeat: 1000, pan: -.25 });
  assert.equal(cold.read().body!.parts[0]!.notes.at(-1)!.startBeat, 1000);
  cold.undo(); assert.deepEqual(cold.read().body, original); cold.redo();
  assert.equal(cold.read().body!.parts[0]!.notes.at(-1)!.pan, -.25);
  saved(cold.save('overwrite'));
  const finalLibrary = createMaterialLibrary(f.storage), final = createPhraseEditor(finalLibrary, createTimbrePlayback(finalLibrary));
  final.open(content.id); assert.equal(final.read().body!.parts[0]!.notes.length, 5267);
  assert.equal(final.read().body!.parts[0]!.notes.at(-1)!.startBeat, 1000);
  assert.equal(final.previewPlan().events.length, 5267);
});

test('reading and setting the same fractional length use the same floating-point boundary tolerance', () => {
  const f = fixture();
  const part = start(f);
  f.phrase.setLength(0.3);
  f.phrase.addNote(part, note({ startBeat: 0.1, durationBeats: 0.2 }));
  const before = f.raw();
  f.phrase.setLength(0.3);
  assert.equal(f.raw(), before, 'reapplying a valid fractional length is a no-op');
  f.phrase.setLength(0.4);
  f.phrase.setLength(0.3);
  assert.equal(f.phrase.read().body!.lengthBeats, 0.3);
  assert.throws(() => f.phrase.setLength(0.299), /超出乐句结尾/);
});

test('a latest unsupported phrase is preserved and reported without locking the whole workstation or hiding other work', () => {
  const f = fixture();
  const part = start(f);
  f.phrase.addNote(part, note());
  const good = saved(f.phrase.save('new'));
  const bad = f.library.createDraft({ kind: 'rootsound.phrase', schemaVersion: 1, owner: 'phrase',
    name: '将来的乐句', dependencies: [f.first.id], body: { ...baseBody(f.first.id), futureSetting: '保留我' } });
  const before = f.raw();
  const restoredLibrary = createMaterialLibrary(f.storage);
  const restored = createPhraseEditor(restoredLibrary, createTimbrePlayback(restoredLibrary));
  const view = restored.read();
  assert.equal(view.draft!.id, bad.id);
  assert.equal(view.draft!.name, bad.name);
  assert.equal(view.body, undefined);
  assert.match(view.problem!, /尚不支持/);
  assert.equal(view.canUndo, false);
  assert.equal(view.canRedo, false);
  assert.ok(view.unfinishedDrafts.some(draft => draft.id === bad.id));
  assert.ok(view.savedPhrases.some(content => content.id === good.id));
  assert.equal(f.raw(), before);
  assert.throws(() => restored.previewPlan(), /尚不支持/);
  assert.throws(() => restored.rename('不能偷偷修掉未知设置'), /尚不支持/);
  assert.throws(() => restored.save('new'), /尚不支持/);
  assert.equal(f.raw(), before);
  assert.equal(createTimbreEditor(restoredLibrary).read().savedSounds.length, 2);
  restored.open(good.id);
  assert.equal(restored.read().problem, undefined);
  assert.equal(restored.read().draft!.sourceId, good.id);
  const goodActive = restored.read().draft!.id;
  assert.throws(() => restored.openDraft(bad.id), /尚不支持/);
  assert.equal(restored.read().draft!.id, goodActive);
  restored.create(f.second.id);
  assert.equal(restored.read().problem, undefined);
  assert.notEqual(restored.read().draft!.id, goodActive);
  assert.deepEqual(restoredLibrary.readDraft(bad.id), bad);
});

test('bulk note insertion creates fresh identities, persists once and can be undone and redone as a group', () => {
  const f = fixture(); const part = start(f);
  const original = f.phrase.addNote(part, note({ startBeat: 0.123456789, frequencyHz: 439.123456789 }));
  const before = f.phrase.read().body;
  const writes = f.writes();
  const inputs = [note({ startBeat: 1.123456789, frequencyHz: 439.123456789 }), note({ startBeat: 2.5, durationBeats: 0.00123456789 })];
  const copies = f.phrase.addNotes(part, inputs);
  assert.equal(f.writes(), writes + 1);
  assert.equal(new Set([original, ...copies]).size, 3);
  assert.deepEqual(f.phrase.read().body!.parts[0]!.notes.slice(1), inputs.map((input, index) => ({ ...input, id: copies[index] })));
  f.phrase.undo(); assert.deepEqual(f.phrase.read().body, before);
  f.phrase.redo(); assert.deepEqual(f.phrase.read().body!.parts[0]!.notes.slice(1).map(note => note.id), copies);
});

test('bulk move, velocity and delete can span parts and each produce exactly one history step', () => {
  const f = fixture(); const first = start(f); const second = f.phrase.addPart(f.second.id);
  const a = f.phrase.addNote(first, note({ startBeat: 0.123456789, frequencyHz: 439.123456789 }));
  const b = f.phrase.addNote(second, note({ startBeat: 1.123456789, frequencyHz: 333.33333333 }));
  const before = f.phrase.read().body; const writes = f.writes();
  f.phrase.updateNotes([{ partId: first, noteId: a, changes: { startBeat: 0.623456789, velocity: 0.42 } },
    { partId: second, noteId: b, changes: { startBeat: 1.623456789, velocity: 0.42 } }]);
  assert.equal(f.writes(), writes + 1);
  const moved = f.phrase.read().body!;
  assert.equal(moved.parts[0]!.notes[0]!.frequencyHz, 439.123456789);
  assert.equal(moved.parts[1]!.notes[0]!.frequencyHz, 333.33333333);
  f.phrase.undo(); assert.deepEqual(f.phrase.read().body, before);
  f.phrase.redo();
  f.phrase.removeNotes([{ partId: first, noteId: a }, { partId: second, noteId: b }]);
  assert.equal(f.phrase.read().body!.parts.flatMap(part => part.notes).length, 0);
  f.phrase.undo(); assert.deepEqual(f.phrase.read().body, moved);
});

test('bulk operations reject partial, repeated and invalid instructions without writes or history changes', () => {
  const f = fixture(); const part = start(f); const id = f.phrase.addNote(part, note());
  const before = f.phrase.read(); const raw = f.raw(); const writes = f.writes();
  const updates = [
    [{ partId: part, noteId: id, changes: { startBeat: 1 } }, { partId: part, noteId: 'missing', changes: { velocity: 0.4 } }],
    [{ partId: part, noteId: id, changes: { startBeat: 1 } }, { partId: part, noteId: id, changes: { velocity: 0.4 } }],
    [{ partId: part, noteId: id, changes: { startBeat: 1 } }, { partId: part, noteId: id, changes: { velocity: 3 } }],
    [{ partId: part, noteId: id, changes: { durationBeats: 9 } }],
    [{ partId: part, noteId: id, changes: { velocity: 0.7, midi: 60 } }],
  ];
  for (const changes of updates) assert.throws(() => f.phrase.updateNotes(changes));
  assert.throws(() => f.phrase.removeNotes([{ partId: part, noteId: id }, { partId: part, noteId: 'missing' }]));
  assert.throws(() => f.phrase.addNotes(part, [note(), note({ durationBeats: 9 })]));
  assert.equal(f.raw(), raw); assert.equal(f.writes(), writes); assert.deepEqual(f.phrase.read(), before);
});

test('failed bulk persistence leaves both selection content and undo history intact', () => {
  const f = fixture(); const part = start(f); const ids = f.phrase.addNotes(part, [note(), note({ startBeat: 2 })]);
  const before = f.phrase.read(); const raw = f.raw(); f.fail();
  assert.throws(() => f.phrase.addNotes(part, [note()]), /写入失败/);
  assert.throws(() => f.phrase.updateNotes(ids.map(noteId => ({ partId: part, noteId, changes: { velocity: 0.5 } }))), /写入失败/);
  assert.throws(() => f.phrase.removeNotes(ids.map(noteId => ({ partId: part, noteId }))), /写入失败/);
  assert.equal(f.raw(), raw); assert.deepEqual(f.phrase.read(), before);
  f.fail(false); f.phrase.undo(); assert.equal(f.phrase.read().body!.parts[0]!.notes.length, 0);
});

test('empty and unchanged bulk edits neither write nor erase redo, and each draft retains its own undo history', () => {
  const f = fixture(); const first = start(f); const [id] = f.phrase.addNotes(first, [note()]);
  const firstDraft = f.phrase.read().draft!.id;
  f.phrase.updateNote(first, id!, { velocity: 0.4 }); f.phrase.undo();
  const before = f.phrase.read(); const writes = f.writes();
  f.phrase.addNotes(first, []); f.phrase.updateNotes([]); f.phrase.removeNotes([]);
  f.phrase.updateNotes([{ partId: first, noteId: id!, changes: { frequencyHz: 220 } }]);
  assert.equal(f.writes(), writes); assert.deepEqual(f.phrase.read(), before);
  f.phrase.create(f.second.id); const second = f.phrase.read().body!.parts[0]!.id;
  f.phrase.addNotes(second, [note(), note({ startBeat: 2 })]);
  const secondDraft = f.phrase.read().draft!.id;
  f.phrase.openDraft(firstDraft); f.phrase.redo(); assert.equal(f.phrase.read().body!.parts[0]!.notes[0]!.velocity, 0.4);
  f.phrase.openDraft(secondDraft); f.phrase.undo(); assert.equal(f.phrase.read().body!.parts[0]!.notes.length, 0);
});

test('saved phrase playback is read-only, uses saved identity and only changes tempo when explicitly requested', () => {
  const f = fixture(); const part = start(f);
  f.phrase.setTempo(90); f.phrase.addNotes(part, [note({ startBeat: 1.123456789, durationBeats: 0.0123456789, frequencyHz: 439.123456789 })]);
  const content = saved(f.phrase.save('new'));
  const playback = createPhrasePlayback(f.library, f.playback);
  f.phrase.updateNote(part, f.phrase.read().body!.parts[0]!.notes[0]!.id, { frequencyHz: 330 });
  const raw = f.raw();
  assert.deepEqual(playback.listSaved(), [content]);
  assert.deepEqual(playback.readSaved(content.id), { content, body: content.body });
  const ownTempo = playback.planForSaved(content.id);
  const override = playback.planForSaved(content.id, 120);
  assert.equal(ownTempo.events[0]!.atSeconds, 1.123456789 * (60 / 90));
  assert.equal(ownTempo.events[0]!.sound.note.frequencyHz, 439.123456789);
  assert.equal(override.events[0]!.atSeconds, 1.123456789 / 2);
  assert.equal(override.events[0]!.sound.note.holdSeconds, 0.0123456789 / 2);
  for (const tempo of [0, 39, 241, Infinity, NaN]) assert.throws(() => playback.planForSaved(content.id, tempo));
  assert.throws(() => playback.readSaved(f.first.id)); assert.throws(() => playback.planForSaved('missing'));
  assert.equal(f.raw(), raw);
});

test('saved phrase compilation resolves current sound revisions instead of embedding old sound settings', () => {
  const f = fixture(); const part = start(f); f.phrase.addNote(part, note());
  const content = saved(f.phrase.save('new')); const playback = createPhrasePlayback(f.library, f.playback);
  const before = playback.planForSaved(content.id);
  f.timbre.open(f.first.id); f.timbre.setCharacter('clear');
  const warning = f.timbre.save('overwrite');
  if (warning.status !== 'needs-confirmation') throw new Error('Expected reference warning.');
  saved(f.timbre.save('overwrite', warning.confirmation));
  assert.notDeepEqual(sources(playback.planForSaved(content.id).events[0]!.sound), sources(before.events[0]!.sound));
  assert.deepEqual(f.library.readContent(content.id), content);
});
