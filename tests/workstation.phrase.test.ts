import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { ContentRecord, MaterialStorage, SaveResult } from '../src/workstation/contracts/content.ts';
import type { PhraseBody, PhraseNote } from '../src/workstation/contracts/phrase.ts';
import type { PlayableNotePlan } from '../src/workstation/contracts/sound.ts';
import { createMaterialLibrary } from '../src/workstation/modules/materials/public.ts';
import { createPhraseEditor, createPhrasePlayback, readPhraseBody } from '../src/workstation/modules/phrase/public.ts';
import { createTimbreEditor, createTimbrePlayback } from '../src/workstation/modules/timbre/public.ts';
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
  for (const length of [-1, 0, 65, NaN, Infinity]) assert.throws(() => f.phrase.setLength(length));
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
  assert.throws(() => f.phrase.removePart(firstPart), /至少需要/);
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
    { ...base, waveform: 'sine' }, { ...base, parts: [] }, { ...base, tempoBpm: NaN },
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
  assert.throws(() => f.phrase.addPart(f.second.id), /1 至 8/);
  assert.equal(f.raw(), before);
  const body = baseBody(f.first.id);
  body.parts[0]!.notes = Array.from({ length: 512 }, (_, index) => ({ id: `note-${index}`, ...note() }));
  assert.equal(readPhraseBody(body).parts[0]!.notes.length, 512);
  body.parts[0]!.notes.push({ id: 'too-many', ...note() });
  assert.throws(() => readPhraseBody(body), /512/);
  for (let index = 0; index < 70; index++) f.phrase.rename(`第${index}次修改`);
  let undos = 0;
  while (f.phrase.read().canUndo) { f.phrase.undo(); undos++; }
  assert.equal(undos, 64);
  assert.equal(f.phrase.read().draft!.name, '第5次修改');
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
