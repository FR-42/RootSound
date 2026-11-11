import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { writeMidi, parseMidi as rawMidi, type MidiEvent } from 'midi-file';
import { readExchangeMidi, writeExchangeMidi, createMidiPatcher } from '../src/workstation/app/music-interchange-midi.ts';
import { readMusicFile, scoreForFile } from '../src/workstation/app/music-file.ts';
import { phraseExpression } from '../src/workstation/contracts/phrase-expression.ts';
import { pedalGates } from '../src/workstation/contracts/midi-expression.ts';
import { phraseBeatSeconds } from '../src/workstation/contracts/phrase-time.ts';
import { createSampleBankAudio } from '../src/workstation/modules/timbre/sample-bank.ts';
import { createMaterialLibrary } from '../src/workstation/modules/materials/public.ts';
import { createPhraseEditor, createPhrasePlayback, readPhraseBody } from '../src/workstation/modules/phrase/public.ts';
import { createTimbrePlayback } from '../src/workstation/modules/timbre/public.ts';
import { createSongEditor } from '../src/workstation/modules/song/public.ts';
import { openMusicDocument } from '../src/workstation/app/music-document.ts';
import { readPreview, previewFingerprint } from '../src/workstation/modules/sound-runtime/plan.ts';
import { resizeTempoRoll } from '../src/workstation/modules/phrase/tempo-roll-resize.ts';
import { phraseAuditionExtent } from '../src/workstation/modules/ui-rendering/phrase-audition-extent.ts';

function midi(events: MidiEvent[]) { return Uint8Array.from(writeMidi({ header: { format: 0, numTracks: 1, ticksPerBeat: 480 }, tracks: [events] })); }
const fixture = () => midi([
  { deltaTime: 0, type: 'setTempo', microsecondsPerBeat: 500000 },
  { deltaTime: 0, type: 'controller', channel: 0, controllerType: 64, value: 127 },
  { deltaTime: 0, type: 'noteOn', channel: 0, noteNumber: 60, velocity: 100 },
  { deltaTime: 240, type: 'noteOff', channel: 0, noteNumber: 60, velocity: 0 },
  { deltaTime: 240, type: 'pitchBend', channel: 0, value: 4096 },
  { deltaTime: 0, type: 'channelAftertouch', channel: 0, amount: 80 },
  { deltaTime: 0, type: 'noteAftertouch', channel: 0, noteNumber: 60, amount: 90 },
  { deltaTime: 480, type: 'controller', channel: 0, controllerType: 64, value: 0 },
  { deltaTime: 480, type: 'endOfTrack' },
]);
function load(source = fixture()) {
  const imported = readMusicFile(source, 'Pedal.mid', 'midi');
  let stored = imported.libraryText;
  const library = createMaterialLibrary({ read: () => stored, write(value) { stored = value; } });
  const fetcher = (async (url: string) => new Response(readFileSync('public' + url))) as typeof fetch;
  const tones = createTimbrePlayback(library, undefined, undefined, createSampleBankAudio(library, undefined, fetcher));
  const editor = createPhraseEditor(library, tones);
  const song = createSongEditor(library, createPhrasePlayback(library, tones), {defaultTempoMode:'source'});
  openMusicDocument(library, song, editor); return { library, editor, song };
}

test('MIDI captures physical key release, ordered pedals, absolute bend and both aftertouch types', () => {
  const { score, warnings } = readExchangeMidi(fixture(), 'Test');
  assert.equal(score.parts[0]!.notes[0]!.duration, .5);
  assert.deepEqual(score.midiExpression![0]!.events.map(e => e.type), ['controller', 'pitch-bend', 'channel-pressure', 'poly-pressure', 'controller']);
  assert.equal(score.midiExpression![0]!.events[1]!.value, 12288);
  assert(!warnings.some(w => /弯音变化尚未|触后压力变化尚未|连续变化尚未/.test(w)));
});

test('pedal gates distinguish key release from sound release, including sostenuto selective capture', () => {
  const notes = [{ id: 'captured', start: 0, end: .3 }, { id: 'later', start: .2, end: .4 }];
  const gates = pedalGates(notes, [{ type: 'controller', controller: 66, value: 127, at: .1 },
    { type: 'controller', controller: 66, value: 0, at: 1 }], 2);
  assert.deepEqual(gates.get('captured'), { keyEnd: 1, soundEnd: 1 });
  assert.deepEqual(gates.get('later'), { keyEnd: .4, soundEnd: .4 });
  const sustain = pedalGates(notes, [{ type: 'controller', controller: 64, value: 127, at: 0 },
    { type: 'controller', controller: 64, value: 0, at: 1 }], 2);
  assert.deepEqual(sustain.get('captured'), { keyEnd: .3, soundEnd: 1 });
});

test('same-time CC66 only captures keys down before it; reset releases both pedals', () => {
  const gates = pedalGates([{ id: 'before', start: 0, end: .1, onOrder: 1 }, { id: 'after', start: 0, end: .1, onOrder: 3 }],
    [{ type: 'controller', controller: 66, value: 127, at: 0, order: 2 }, { type: 'controller', controller: 121, value: 0, at: .5 }], 1);
  assert.equal(gates.get('before')!.keyEnd, .5); assert.equal(gates.get('after')!.keyEnd, .1);
});

test('native body and compile keep lanes once, dry comparison removes effects, audition includes pedal tail', async () => {
  const { editor } = load(); const body = editor.read().body!;
  await editor.preparePreview(); const wet = editor.previewPlan(), dry = editor.previewPlan(undefined, { midiEffects: false });
  assert.equal(wet.midiExpression?.length, 1); assert.equal(dry.midiExpression, undefined);
  assert.equal(wet.events[0]!.sound.note.holdSeconds, 1);
  assert.equal(dry.events[0]!.sound.note.holdSeconds, .25);
  assert.equal(phraseAuditionExtent(body).noteEnd, 1); assert.equal(phraseAuditionExtent(body, false).noteEnd, .25);
  const preview = readPreview(wet); assert(previewFingerprint(preview).includes('pitch-bend'));
  const moved = readPreview({ ...wet, transport: { positionSeconds: .6, rate: 1 } });
  assert(moved.midiExpression![0]!.events[0]!.atSeconds < 0); assert.equal(moved.events[0]!.atSeconds, -.6);
  assert.deepEqual(readPhraseBody(JSON.parse(JSON.stringify(body))).midiExpression, body.midiExpression);
});

test('moving a boundary preserves MIDI controller times and the end handle can still crop and restore events', () => {
  const { editor } = load(); const body = editor.read().body!;
  body.lengthBeats = 12; body.tempoSections = [{ id: 'next', startBeat: 8, tempoBpm: 90 }];
  body.midiExpression![0]!.events.push({ type: 'pitch-bend', value: 9000, beat: 7 }, { type: 'pitch-bend', value: 10000, beat: 9 });
  const moved = resizeTempoRoll(body, 'next', 4);
  const oldEvents = body.midiExpression![0]!.events;
  const newEvents = moved.midiExpression![0]!.events;
  assert.equal(moved.midiExpression![0]!.hiddenEvents, undefined);
  assert.equal(newEvents.length, oldEvents.length);
  for (const [i, event] of oldEvents.entries())
    assert(Math.abs(phraseBeatSeconds(moved, newEvents[i]!.beat) - phraseBeatSeconds(body, event.beat)) < 1e-9);

  body.lengthBeats = 16;
  oldEvents.push({ type: 'pitch-bend', value: 11000, beat: 14 });
  const short = resizeTempoRoll({ ...body }, undefined, 12);
  assert(short.midiExpression![0]!.hiddenEvents!.some(item => item.event.value === 11000));
  assert.deepEqual(resizeTempoRoll(short, undefined, 16).midiExpression, body.midiExpression);
});

test('MIDI canonical writeback preserves all performance types and physical note duration', () => {
  const score = readExchangeMidi(fixture(), 'Test').score;
  const result = readExchangeMidi(writeExchangeMidi(score).bytes, 'Test').score;
  assert.equal(result.parts[0]!.notes[0]!.duration, .5);
  for (const type of ['pitch-bend', 'channel-pressure', 'poly-pressure']) assert(result.midiExpression!.flatMap(l => l.events).some(e => e.type === type));
});

test('editing a note preserves original controllers; changing automation selects canonical writeback', () => {
  const bytes = fixture(), score = readExchangeMidi(bytes, 'Test').score;
  score.parts.forEach((part, p) => { part.id = `p${p}`; part.notes.forEach((note, i) => note.id = `n${i}`); });
  const patch = createMidiPatcher(bytes, score), edited = structuredClone(score);
  edited.parts[0]!.notes[0]!.beat = .125;
  const result = patch(edited); assert(result); assert(rawMidi(result.bytes).tracks.flat().some(e => e.type === 'pitchBend'));
  edited.midiExpression![0]!.events[1]!.value = 9000; assert.equal(patch(edited), undefined);
});

test('invalid expression is rejected without silently applying unrelated channel state', () => {
  const { editor } = load(), body = editor.read().body!;
  assert.throws(() => readPhraseBody({ ...body, midiExpression: [{ id: 'x', events: [{ type: 'pitch-bend', value: 20000, beat: 0 }] }] }), /MIDI/);
  assert.throws(() => readPhraseBody({ ...body, midiExpression: [] }), /MIDI/);
});


test('merged same-timbre groups retain independent MIDI lanes through playback, native reload and MIDI save', async () => {
  const source = midi([
    { deltaTime: 0, type: 'controller', channel: 0, controllerType: 64, value: 127 },
    { deltaTime: 0, type: 'controller', channel: 1, controllerType: 10, value: 110 },
    { deltaTime: 0, type: 'noteOn', channel: 0, noteNumber: 60, velocity: 100 },
    { deltaTime: 0, type: 'noteOn', channel: 1, noteNumber: 64, velocity: 80 },
    { deltaTime: 240, type: 'noteOff', channel: 0, noteNumber: 60, velocity: 0 },
    { deltaTime: 0, type: 'noteOff', channel: 1, noteNumber: 64, velocity: 0 },
    { deltaTime: 480, type: 'controller', channel: 0, controllerType: 64, value: 0 },
    { deltaTime: 0, type: 'endOfTrack' },
  ]);
  const { library, editor } = load(source);
  const before = structuredClone(editor.read().body!);
  assert.equal(before.parts.length, 2);
  const [target, from] = before.parts;
  assert.equal(target!.timbreId, from!.timbreId);
  const plain = editor.addPart(target!.timbreId);
  const plainNote = editor.addNote(plain, { startBeat: 0, durationBeats: .5, frequencyHz: 440, velocity: .7 });
  const gates = phraseExpression(editor.read().body!).gates;
  editor.mergeParts(from!.id, target!.id); editor.mergeParts(plain, target!.id);
  const merged = readPhraseBody(JSON.parse(JSON.stringify(editor.read().body)));
  assert.equal(merged.parts.length, 1);
  assert.deepEqual(phraseExpression(merged).gates, gates);
  assert.equal(merged.parts[0]!.notes.find(note => note.id === plainNote)!.midiChannelId, null);
  await editor.preparePreview();
  const plan = editor.previewPlan();
  assert.equal(plan.events.length, 3);
  assert.equal(plan.midiExpression?.length, 2);
  const score = scoreForFile(library, merged, 'Merged').score;
  assert.equal(score.parts.length, 3);
  const roundtrip = readExchangeMidi(writeExchangeMidi(score).bytes, 'Merged').score;
  assert.equal(roundtrip.parts.flatMap(part => part.notes).length, 3);
  assert.equal(roundtrip.midiExpression!.filter(lane => lane.events.some(event => event.type === 'controller' && event.controller === 64)).length, 1);
});
