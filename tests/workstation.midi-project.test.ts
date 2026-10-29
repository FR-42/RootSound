import assert from 'node:assert/strict';
import test from 'node:test';
import { createMidiProjectLibrary } from '../src/workstation/app/midi-project.ts';
import { MAX_SEQUENCE_EVENTS } from '../src/workstation/contracts/playback-limits.ts';
import { MAX_PHRASE_BEATS, MAX_PHRASE_NOTES } from '../src/workstation/contracts/phrase-limits.ts';
import type { SoundSequencePlan } from '../src/workstation/contracts/sound.ts';
import { createMaterialLibrary, createProjectPackages } from '../src/workstation/modules/materials/public.ts';
import { createTimbrePlayback, createTimbreReferenceAdapter, readEditableTimbreBody } from '../src/workstation/modules/timbre/public.ts';
import { createPhraseEditor, createPhrasePlayback, createPhraseReferenceAdapter, readPhraseBody } from '../src/workstation/modules/phrase/public.ts';
import { createSongEditor, createSongReferenceAdapter, readSongBody } from '../src/workstation/modules/song/public.ts';

const be16 = (value: number) => [value >> 8 & 255, value & 255];
const be32 = (value: number) => [value >>> 24, value >>> 16 & 255, value >>> 8 & 255, value & 255];
const ascii = (text: string) => [...new TextEncoder().encode(text)];
function vlq(value: number): number[] { const bytes = [value & 127]; while ((value >>>= 7)) bytes.unshift((value & 127) | 128); return bytes; }
const event = (delta: number, ...bytes: number[]) => [...vlq(delta), ...bytes];
const title = (name: string) => [0, 255, 3, ...vlq(ascii(name).length), ...ascii(name)];
function file(tracks: number[][], division = 480): Uint8Array {
  const chunks = tracks.flatMap(track => { const body = [...track, 0, 255, 47, 0]; return [...ascii('MTrk'), ...be32(body.length), ...body]; });
  return Uint8Array.from([...ascii('MThd'), ...be32(6), ...be16(tracks.length > 1 ? 1 : 0), ...be16(tracks.length), ...be16(division), ...chunks]);
}
const adapters = [createTimbreReferenceAdapter(), createPhraseReferenceAdapter(), createSongReferenceAdapter()];
const policy = { project: { rootKind: 'rootsound.song', adapters } };
function opened(text: string) {
  let raw = text;
  const library = createMaterialLibrary({ read: () => raw, write: value => { raw = value; } }, policy);
  const tones = createTimbrePlayback(library), phrases = createPhrasePlayback(library, tones);
  const song = createSongEditor(library, phrases, { defaultTempoMode: 'source' });
  return { library, tones, phrases, song, raw: () => raw };
}
function close(a: number, b: number, tolerance = 1e-8) { assert(Math.abs(a - b) < tolerance, `${a} != ${b}`); }

test('multi-track MIDI becomes an independent editable project with exact tempo-crossing note times and useful percussion', () => {
  const bytes = file([
    [...title('Tempo'), ...event(0, 255, 81, 3, 7, 161, 32), ...event(960, 255, 81, 3, 15, 66, 64)],
    [...title('Lead'), ...event(0, 192, 0), ...event(0, 144, 60, 96), ...event(480, 128, 60, 0),
      ...event(0, 192, 48), ...event(0, 144, 64, 80), ...event(960, 128, 64, 0)],
    [...title('Lead'), ...event(240, 145, 67, 90), ...event(1200, 129, 67, 0)],
    [...title('Drums'), ...event(0, 153, 36, 110), ...event(120, 137, 36, 0),
      ...event(360, 153, 38, 100), ...event(120, 137, 38, 0)],
  ]);
  const before = new Uint8Array(bytes), result = createMidiProjectLibrary(bytes, '导入曲');
  assert.deepEqual(bytes, before); assert.equal(result.noteCount, 5); assert.equal(result.trackCount, 5);
  assert(result.warnings.some(message => /音色/.test(message)));
  const f = opened(result.libraryText), view = f.song.read(); assert.equal(view.problem, undefined);
  assert.equal(view.draft!.name, '导入曲'); assert.equal(view.body!.tempoMode, 'source');
  assert.deepEqual(view.body!.gridTempoChanges, [{ atSeconds: 1, tempoBpm: 60 }]);
  const plan = f.song.previewPlan(); assert.equal(plan.events.length, 5);
  const c = plan.events.find(event => Math.abs(event.sound.note.frequencyHz - 261.6255653) < .001)!;
  close(c.atSeconds, 0); close(c.sound.note.holdSeconds, .5); close(c.sound.note.velocity, 96 / 127);
  const e = plan.events.find(event => Math.abs(event.sound.note.frequencyHz - 329.6275569) < .001)!;
  close(e.atSeconds, .5); close(e.sound.note.holdSeconds, 1.5);
  const g = plan.events.find(event => Math.abs(event.sound.note.frequencyHz - 391.995436) < .001)!;
  close(g.atSeconds, .25); close(g.sound.note.holdSeconds, 1.75);
  const records = f.library.listContent(); const tones = records.filter(record => record.kind === 'rootsound.timbre');
  assert.equal(tones.length, 4); assert.equal(new Set(tones.map(tone => tone.name)).size, tones.length);
  const rhythm = records.filter(record => record.kind === 'rootsound.phrase').map(record => readPhraseBody(record.body)).filter(phrase => phrase.parts[0]!.section === 'rhythm');
  assert.equal(rhythm.length, 2);
  const drumBodies = rhythm.map(phrase => readEditableTimbreBody(f.library.readContent(phrase.parts[0]!.timbreId)!.body));
  assert(drumBodies.every(body => body.model === 'synthesizer'));
  assert(drumBodies.some(body => body.model === 'synthesizer' && body.sources.some(source => source.waveform === 'noise')));
  assert(drumBodies.some(body => body.model === 'synthesizer' && body.pitch.semitones > 0));
  const scope = f.library.projectScopeOf!({ type: 'draft', id: view.draft!.id });
  assert(records.every(record => f.library.projectScopeOf!({ type: 'content', id: record.id }) === scope));
  const copied = opened(createMidiProjectLibrary(bytes, '另一首').libraryText);
  assert.notEqual(copied.song.read().draft!.id, view.draft!.id);
  assert(copied.library.listContent().every(record => !records.some(previous => previous.id === record.id)));
});

test('only genuine tempo changes split a source lane while all note positions and channel controls remain exact', () => {
  const bytes = file([
    [...event(0, 255, 81, 3, 7, 161, 32), ...event(960, 255, 81, 3, 15, 66, 64)],
    [...title('Keys'), ...event(0, 176, 7, 100), ...event(0, 176, 11, 80), ...event(0, 176, 10, 0),
      ...event(0, 144, 60, 64), ...event(240, 128, 60, 0), ...event(720, 144, 62, 64), ...event(240, 128, 62, 0),
      ...event(7680, 144, 64, 64), ...event(240, 128, 64, 0)],
  ]);
  const f = opened(createMidiProjectLibrary(bytes, '速度变化').libraryText);
  const plan = f.song.previewPlan(); assert.equal(plan.events.length, 3);
  close(plan.events[0]!.atSeconds, 0); close(plan.events[1]!.atSeconds, 1); close(plan.events[2]!.atSeconds, 17.5);
  assert(plan.events.every(event => event.pan === -1));
  const contents = f.library.listContent().filter(record => record.kind === 'rootsound.phrase');
  assert.equal(contents.length, 2);
  assert.deepEqual(contents.map(record => readPhraseBody(record.body).parts[0]!.notes.length), [1, 2]);
  assert(contents.every(record => readPhraseBody(record.body).parts[0]!.notes.every(note => Math.abs(note.level! - 100 * 80 / 127 ** 2) < 1e-12)));
});

test('out-of-range tempo uses explicit coordinate folding without changing actual seconds', () => {
  // 480 BPM: 125000 microseconds/beat, edited at 240 BPM.
  const bytes = file([[...event(0, 255, 81, 3, 1, 232, 72), ...event(480, 144, 60, 100), ...event(480, 128, 60, 0)]]);
  const result = createMidiProjectLibrary(bytes, '快速段'); assert(result.warnings.some(message => /半速|倍速/.test(message)));
  const f = opened(result.libraryText); assert.equal(f.song.read().body!.gridTempoBpm, 240);
  const eventPlan = f.song.previewPlan().events[0]!; close(eventPlan.atSeconds, .125); close(eventPlan.sound.note.holdSeconds, .125);

  const slow = file([[...event(0, 255, 81, 3, 30, 132, 128), ...event(240, 144, 60, 100), ...event(240, 128, 60, 0)]]);
  const slower = opened(createMidiProjectLibrary(slow, '慢速段').libraryText);
  assert.equal(slower.song.read().body!.gridTempoBpm, 60);
  close(slower.song.previewPlan().events[0]!.atSeconds, 1); close(slower.song.previewPlan().events[0]!.sound.note.holdSeconds, 1);
});

test('a long sparse MIDI keeps its timeline without overflowing internal song coordinates', () => {
  // 240 BPM with 550 seconds of intentional timeline, including final rests.
  const bytes = file([[...event(0, 255, 81, 3, 3, 208, 144), ...event(0, 144, 60, 100),
    ...event(480, 128, 60, 0), ...event(1055520, 255, 1, 0)]]);
  const f = opened(createMidiProjectLibrary(bytes, '长时间线').libraryText);
  assert.equal(f.song.read().body!.gridTempoBpm, 240);
  assert(f.song.read().body!.lengthBeats <= 1024);
  close(f.song.previewPlan().events[0]!.sound.note.holdSeconds, .25);
  close(f.song.previewPlan().durationSeconds, 550);
});

test('imported phrases survive portable save, reopening, musical editing and undo/redo', () => {
  const bytes = file([[...event(0, 144, 60, 100), ...event(480, 128, 60, 0)]]);
  const f = opened(createMidiProjectLibrary(bytes, '可编辑').libraryText);
  const rootId = f.song.read().draft!.id;
  const packed = createProjectPackages(f.library, adapters, { rootKind: 'rootsound.song' }).exportDraft(rootId);
  const receiving = createMaterialLibrary(undefined, policy);
  const imported = createProjectPackages(receiving, adapters, { rootKind: 'rootsound.song' }).importProject(packed.text);
  assert.equal(imported.status, 'imported');
  const phrase = f.library.listContent().find(record => record.kind === 'rootsound.phrase')!;
  const editor = createPhraseEditor(f.library, f.tones); editor.open(phrase.id);
  const before = editor.read().body!, part = before.parts[0]!, note = part.notes[0]!;
  editor.updateNote(part.id, note.id, { frequencyHz: 440, pan: .3 });
  assert.equal(editor.read().body!.parts[0]!.notes[0]!.frequencyHz, 440);
  editor.undo(); assert.deepEqual(editor.read().body, before); editor.redo();
  assert.equal(editor.read().body!.parts[0]!.notes[0]!.pan, .3);
  const reopened = opened(f.raw()); assert.equal(reopened.song.read().problem, undefined);
  assert(readSongBody(reopened.song.read().draft!.body).tracks.length > 0);
});

test('resources and unsupported physical pitches fail before any project snapshot is returned', () => {
  const tooMany: number[] = [];
  for (let index = 0; index <= MAX_SEQUENCE_EVENTS; index++) tooMany.push(...event(1, 144, 60, 100), ...event(1, 128, 60, 0));
  assert.throws(() => createMidiProjectLibrary(file([tooMany]), '超量'), /50000/);
  assert.throws(() => createMidiProjectLibrary(file([[...event(0, 144, 0, 100), ...event(480, 128, 0, 0)]]), '低音'), /20～5000/);
  assert.throws(() => createMidiProjectLibrary(file([[...event(0, 144, 60, 100), ...event(100000, 128, 60, 0)]]), '长音'), /96秒/);
  assert.throws(() => createMidiProjectLibrary(Uint8Array.of(1, 2, 3), '坏文件'));
});

test('same-tick drum strikes retain their exact positions with an explicit one-shot gate', () => {
  const bytes = file([[...event(0, 153, 36, 110), ...event(0, 137, 36, 0),
    ...event(480, 153, 38, 100), ...event(0, 137, 38, 0)]]);
  const result = createMidiProjectLibrary(bytes, '零长鼓点');
  assert.equal(result.noteCount, 2); assert(result.warnings.some(message => /0\.12秒/.test(message)));
  const f = opened(result.libraryText), plan = f.song.previewPlan();
  assert.equal(plan.events.length, 2);
  close(plan.events[0]!.atSeconds, 0); close(plan.events[1]!.atSeconds, .5);
  assert(plan.events.every(event => event.sound.note.holdSeconds === .12));
  const pure = createMidiProjectLibrary(file([[...event(0, 153, 36, 100), ...event(0, 137, 36, 0)]]), '单次鼓点');
  assert.equal(pure.noteCount, 1); close(opened(pure.libraryText).song.previewPlan().events[0]!.sound.note.holdSeconds, .12);
});

type ExpectedNote = { atSeconds: number; holdSeconds: number; frequencyHz: number; velocity: number };
/** Real SMF bytes and independently calculated seconds; lanes exceed old phrase budgets. */
function denseMidi(count: number): { bytes: Uint8Array; expected: ExpectedNote[] } {
  const tracks = [[...title('Tempo'), ...event(0, 255, 81, 3, 7, 161, 32), ...event(7680, 255, 81, 3, 10, 44, 43)]];
  const expected: ExpectedNote[] = [];
  // 666667 microseconds after beat 16; retain the actual integer SMF tempo.
  const seconds = (tick: number) => tick <= 7680 ? tick / 960 : 8 + (tick - 7680) * 666667 / 480_000_000;
  for (let trackIndex = 0; trackIndex < 4; trackIndex++) {
    const channel = trackIndex === 3 ? 9 : trackIndex;
    const track = [...title('Part'), ...event(0, 192 + channel, [0, 48, 80, 0][trackIndex]!)];
    const length = Math.floor(count / 4) + (trackIndex < count % 4 ? 1 : 0);
    for (let index = 0; index < length; index++) {
      const pitch = channel === 9 ? [36, 38, 42, 46][index % 4]! : 50 + (index + trackIndex) % 21;
      const velocity = 80 + index % 40, start = index * 12;
      track.push(...event(index ? 8 : 0, 144 + channel, pitch, velocity), ...event(4, 128 + channel, pitch, 0));
      expected.push({ atSeconds: seconds(start), holdSeconds: seconds(start + 4) - seconds(start),
        frequencyHz: 440 * 2 ** ((pitch - 69) / 12), velocity: velocity / 127 });
    }
    tracks.push(track);
  }
  return { bytes: file(tracks), expected };
}
function assertNotes(plan: SoundSequencePlan, expected: ExpectedNote[]): void {
  assert.equal(plan.events.length, expected.length);
  const groups = new Map<string, { wanted: ExpectedNote[]; actual: ExpectedNote[] }>();
  const key = (note: ExpectedNote) => `${note.frequencyHz}:${note.velocity}`;
  for (const note of expected) {
    const group = groups.get(key(note));
    if (group) group.wanted.push(note); else groups.set(key(note), { wanted: [note], actual: [] });
  }
  for (const event of plan.events) {
    const note = { atSeconds: event.atSeconds, ...event.sound.note }, group = groups.get(key(note));
    assert(group, `Unexpected pitch/velocity: ${key(note)}`); group.actual.push(note);
  }
  for (const { wanted, actual } of groups.values()) {
    wanted.sort((a, b) => a.atSeconds - b.atSeconds); actual.sort((a, b) => a.atSeconds - b.atSeconds);
    assert.equal(actual.length, wanted.length);
    for (let index = 0; index < wanted.length; index++) {
      close(actual[index]!.atSeconds, wanted[index]!.atSeconds); close(actual[index]!.holdSeconds, wanted[index]!.holdSeconds);
    }
  }
}

for (const count of [5267, 20_000]) test(`${count} MIDI notes survive editable conversion, portable save and cold reopening without truncation`, context => {
  const source = denseMidi(count), before = new Uint8Array(source.bytes), start = performance.now();
  const result = createMidiProjectLibrary(source.bytes, `密集乐曲 ${count}`), convertedAt = performance.now();
  assert.deepEqual(source.bytes, before); assert.equal(result.noteCount, count);
  const f = opened(result.libraryText), initial = f.song.read().body!;
  assert.equal(f.song.read().problem, undefined); assert(initial.tracks.length <= 128);
  assert(initial.tracks.reduce((sum, track) => sum + track.clips.length, 0) <= 512);
  assert.equal(new Set(initial.tracks.map(track => track.name)).size, initial.tracks.length);
  const phrases = f.library.listContent().filter(record => record.kind === 'rootsound.phrase');
  assert(phrases.every(record => { const body = readPhraseBody(record.body);
    return body.lengthBeats <= MAX_PHRASE_BEATS && body.parts.reduce((sum, part) => sum + part.notes.length, 0) <= MAX_PHRASE_NOTES; }));
  assert.equal(phrases.length, 14, 'seven source lanes each use only the two actual source tempo sections');
  if (count === 20_000) assert(phrases.some(record => readPhraseBody(record.body).parts[0]!.notes.length > 4000));
  assertNotes(f.song.previewPlan(), source.expected);
  const plannedAt = performance.now();

  const packed = createProjectPackages(f.library, adapters, { rootKind: 'rootsound.song' }).exportDraft(f.song.read().draft!.id);
  let receivingText = '';
  const receiving = createMaterialLibrary({ read: () => null, write: text => { receivingText = text; } }, policy);
  const imported = createProjectPackages(receiving, adapters, { rootKind: 'rootsound.song' }).importProject(packed.text);
  assert.equal(imported.status, 'imported'); assertNotes(opened(receivingText).song.previewPlan(), source.expected);
  const portableAt = performance.now();

  const track = initial.tracks[0]!, clip = track.clips[0]!;
  f.song.moveClip(track.id, clip.id, track.id, clip.startBeat + .125);
  assert.equal(f.song.previewPlan().events.length, count);
  f.song.undo(); assertNotes(f.song.previewPlan(), source.expected);
  f.song.redo(); assert.equal(f.song.read().body!.tracks[0]!.clips.find(item => item.id === clip.id)!.startBeat, clip.startBeat + .125);
  f.song.undo();

  const phrase = phrases[0]!, editor = createPhraseEditor(f.library, f.tones); editor.open(phrase.id);
  const original = editor.read().body!, part = original.parts[0]!, note = part.notes[0]!;
  editor.updateNote(part.id, note.id, { frequencyHz: 440, pan: .3 });
  editor.undo(); assert.deepEqual(editor.read().body, original); editor.redo();
  let saved = editor.save('overwrite');
  if (saved.status === 'needs-confirmation') saved = editor.save('overwrite', saved.confirmation);
  assert.equal(saved.status, 'saved');
  const cold = opened(f.raw()), edited = readPhraseBody(cold.library.readContent(phrase.id)!.body);
  assert.equal(edited.parts[0]!.notes.find(item => item.id === note.id)!.frequencyHz, 440);
  assert.equal(cold.song.previewPlan().events.length, count);
  assert.deepEqual(source.bytes, before);
  context.diagnostic(JSON.stringify({ count, conversionMs: convertedAt - start, coldPlanMs: plannedAt - convertedAt,
    portableMs: portableAt - plannedAt, editingMs: performance.now() - portableAt,
    rows: initial.tracks.length, clips: phrases.length, libraryBytes: new TextEncoder().encode(result.libraryText).length }));
});

test('a continuous lane retains leading and trailing rests without four-bar or repeated-tempo fragmentation', () => {
  const bytes = file([[...event(0, 255, 81, 3, 7, 161, 32), ...event(480, 255, 81, 3, 7, 161, 32),
    ...event(480, 144, 60, 100), ...event(240, 128, 60, 0), ...event(42000, 255, 1, 0)]]);
  const f = opened(createMidiProjectLibrary(bytes, '前后空拍').libraryText), clips = f.song.read().body!.tracks[0]!.clips;
  assert.equal(clips.length, 1); assert.equal(clips[0]!.startBeat, 0);
  const phrase = readPhraseBody(f.library.readContent(clips[0]!.phraseId)!.body);
  close(phrase.lengthBeats, 90); close(phrase.parts[0]!.notes[0]!.startBeat, 2);
  close(f.song.previewPlan().events[0]!.atSeconds, 1); close(f.song.previewPlan().durationSeconds, 45);
});

test('only the true 1024-beat boundary splits a long lane and boundary-crossing notes keep their full held seconds', () => {
  // 240 BPM, one onset before 1024 beats with a tail crossing that boundary,
  // plus a later onset. The source remains under ten minutes.
  const bytes = file([[...event(0, 255, 81, 3, 3, 208, 144), ...event(0, 144, 60, 100), ...event(480, 128, 60, 0),
    ...event(490560, 144, 64, 90), ...event(1920, 128, 64, 0), ...event(480, 144, 67, 80), ...event(480, 128, 67, 0)]]);
  const f = opened(createMidiProjectLibrary(bytes, '跨界长音').libraryText), plan = f.song.previewPlan();
  assert.equal(f.song.read().body!.tracks[0]!.clips.length, 3); assert.equal(plan.events.length, 3);
  close(plan.events[0]!.atSeconds, 0); close(plan.events[1]!.atSeconds, 255.75);
  close(plan.events[1]!.sound.note.holdSeconds, 1); close(plan.events[2]!.atSeconds, 257);
  assert(f.library.listContent().filter(record => record.kind === 'rootsound.phrase').every(record => readPhraseBody(record.body).lengthBeats <= MAX_PHRASE_BEATS));
});

test('a single MIDI lane can fill the shared 50000-note phrase budget without density splitting', context => {
  const track: number[] = [];
  for (let index = 0; index < MAX_PHRASE_NOTES; index++) track.push(...event(index ? 4 : 0, 144, 60, 100), ...event(4, 128, 60, 0));
  const bytes = file([track]), before = new Uint8Array(bytes), start = performance.now();
  const result = createMidiProjectLibrary(bytes, '完整密集声部'), f = opened(result.libraryText);
  assert.equal(result.noteCount, MAX_PHRASE_NOTES); assert.equal(f.song.read().body!.tracks[0]!.clips.length, 1);
  const phrase = f.library.listContent().find(record => record.kind === 'rootsound.phrase')!;
  assert.equal(readPhraseBody(phrase.body).parts[0]!.notes.length, MAX_PHRASE_NOTES);
  const plan = f.song.previewPlan(); assert.equal(plan.events.length, MAX_PHRASE_NOTES);
  close(plan.events[0]!.atSeconds, 0); close(plan.events.at(-1)!.atSeconds, (MAX_PHRASE_NOTES - 1) / 120);
  assert.deepEqual(bytes, before); context.diagnostic(JSON.stringify({ notes: MAX_PHRASE_NOTES, clips: 1, milliseconds: performance.now() - start }));
});
