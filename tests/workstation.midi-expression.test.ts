import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { writeMidi, parseMidi as rawMidi, type MidiEvent } from 'midi-file';
import { readExchangeMidi, writeExchangeMidi, createMidiPatcher } from '../src/workstation/app/music-interchange-midi.ts';
import { readMusicFile, scoreForFile } from '../src/workstation/app/music-file.ts';
import { phraseExpression } from '../src/workstation/contracts/phrase-expression.ts';
import { phraseBeatSeconds } from '../src/workstation/contracts/phrase-time.ts';
import { pedalGates, type TimedMidiExpressionLane } from '../src/workstation/contracts/midi-expression.ts';
import { createSampleBankAudio } from '../src/workstation/modules/timbre/sample-bank.ts';
import { createMaterialLibrary } from '../src/workstation/modules/materials/public.ts';
import { createPhraseEditor, createPhrasePlayback, readPhraseBody } from '../src/workstation/modules/phrase/public.ts';
import { createTimbrePlayback } from '../src/workstation/modules/timbre/public.ts';
import { createSongEditor } from '../src/workstation/modules/song/public.ts';
import { openMusicDocument } from '../src/workstation/app/music-document.ts';
import { readPreview, previewFingerprint } from '../src/workstation/modules/sound-runtime/plan.ts';
import { resizeTempoRoll } from '../src/workstation/modules/phrase/tempo-roll-resize.ts';
import { phraseAuditionExtent } from '../src/workstation/modules/ui-rendering/phrase-audition-extent.ts';
import { SoundFontStream, loadSoundFont, type FontEvent } from '../src/workstation/modules/sound-runtime/soundfont-engine.ts';

const bytes = readFileSync('public/instruments/generaluser-gs-2.0.3/GeneralUser-GS.sf2');
const bank = loadSoundFont(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
const font = { bank: 'generaluser-gs-2.0.3', program: 73, key: 69, velocity: 100, cents: 0, drums: false, midiChannelId: 'lead' } as const;
const sound = (patch: Partial<FontEvent> = {}): FontEvent => ({ atSeconds: 0, holdSeconds: 1, releaseSeconds: .5, level: .7, pan: 0, font, ...patch });
const energy = (a: Float32Array) => a.reduce((sum, x) => sum + x * x, 0);
function render(events: FontEvent[], expression: TimedMidiExpressionLane[], seconds = 1.4, seek?: number) {
  const stream = new SoundFontStream(bank, 24000, events, expression);
  if (seek !== undefined) stream.seek(seek);
  const left = new Float32Array(Math.round(seconds * 24000)), right = new Float32Array(left.length);
  stream.process(left, right); assert(left.every(Number.isFinite) && right.every(Number.isFinite));
  stream.dispose(); return { left, right };
}
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
  const fetcher = (async () => new Response(readFileSync('public/instruments/generaluser-gs-2.0.3/manifest.json'))) as typeof fetch;
  const tones = createTimbrePlayback(library, undefined, undefined, createSampleBankAudio(library, undefined, fetcher, {soundFont:true}));
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

test('real sustain keeps a flute sounding after key release, without changing its physical gate', () => {
  const events = [sound({ holdSeconds: .15, font: { ...font, soundingSeconds: .8 } })];
  const lane: TimedMidiExpressionLane = { id: 'lead', events: [{ type: 'controller', controller: 64, value: 127, atSeconds: .05 },
    { type: 'controller', controller: 64, value: 0, atSeconds: .8 }] };
  const dry = render(events, []), wet = render(events, [lane]);
  assert(energy(wet.left.slice(9600, 14400)) > energy(dry.left.slice(9600, 14400)) * 3);
});

test('bend and modulation alter held PCM rather than only the next note', () => {
  const dry = render([sound()], []);
  for (const event of [{ type: 'pitch-bend' as const, value: 15000, atSeconds: .2 },
    { type: 'controller' as const, controller: 1, value: 127, atSeconds: .2 }]) {
    const wet = render([sound()], [{ id: 'lead', events: [event] }]);
    assert.deepEqual(wet.left.slice(0, 4000), dry.left.slice(0, 4000));
    assert.notDeepEqual(wet.left.slice(12000, 18000), dry.left.slice(12000, 18000));
  }
});

test('continuous expression, volume and pan affect already held notes', () => {
  const dry = render([sound()], []);
  for (const controller of [7, 11]) {
    const wet = render([sound()], [{ id: 'lead', events: [{ type: 'controller', controller, value: 0, atSeconds: .2 }] }]);
    assert(energy(wet.left.slice(12000, 18000)) < energy(dry.left.slice(12000, 18000)) * .05);
  }
  const pan = render([sound()], [{ id: 'lead', events: [{ type: 'controller', controller: 10, value: 127, atSeconds: .2 }] }]);
  assert(energy(pan.right.slice(12000, 18000)) > energy(pan.left.slice(12000, 18000)) * 3);
});

test('a sustained note and earlier RPN/bend/controller state survive seeking after physical key release', () => {
  const lane: TimedMidiExpressionLane = { id: 'lead', events: [
    { type: 'controller', controller: 101, value: 0, atSeconds: 0 }, { type: 'controller', controller: 100, value: 0, atSeconds: 0 },
    { type: 'controller', controller: 6, value: 12, atSeconds: 0 }, { type: 'pitch-bend', value: 10000, atSeconds: .02 },
    { type: 'controller', controller: 64, value: 127, atSeconds: .05 }, { type: 'controller', controller: 64, value: 0, atSeconds: .9 }] };
  const events = [sound({ atSeconds: .1, holdSeconds: .1, font: { ...font, soundingSeconds: .8 } })];
  const whole = render(events, [lane], 1), seek = render(events, [lane], .2, .5);
  const target = whole.left.slice(12000, 16800), error = target.reduce((sum, x, i) => sum + (x - seek.left[i]!) ** 2, 0);
  assert(energy(seek.left) > 0); assert(Math.sqrt(error / energy(target)) < .06);
});

test('channel controllers are isolated, while edited per-note variants inherit existing controller state', () => {
  const first = sound({ atSeconds: .3, level: .7 }), second = sound({ atSeconds: .3, level: .35 });
  const muted = render([first, second], [{ id: 'lead', events: [{ type: 'controller', controller: 7, value: 0, atSeconds: 0 }] }]);
  assert(energy(muted.left)<1e-6);
  const independent = render([first, sound({ atSeconds: .3, font: { ...font, midiChannelId: 'other' } })],
    [{ id: 'lead', events: [{ type: 'controller', controller: 7, value: 0, atSeconds: 0 }] }]);
  assert(energy(independent.left) > 0);
});

test('native body and compile keep lanes once, dry comparison removes effects, audition includes pedal tail', async () => {
  const { editor } = load(); const body = editor.read().body!;
  await editor.preparePreview(); const wet = editor.previewPlan(), dry = editor.previewPlan(undefined, { midiEffects: false });
  assert.equal(wet.midiExpression?.length, 1); assert.equal(dry.midiExpression, undefined);
  assert.equal(wet.events[0]!.sound.note.holdSeconds, .25);
  const first = wet.events[0]!.sound; assert(first.kind === 'sample'); assert.equal(first.soundFont?.soundingSeconds, 1);
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


test('soft pedal, reverb, chorus and channel pressure reach the complete sampled instrument', () => {
  const input=sound({font:{...font,program:0},holdSeconds:.7});const dry=render([input],[]);
  for(const [controller,value] of [[67,127],[91,127],[93,127]] as const){
    const wet=render([input],[{id:'lead',events:[{type:'controller',controller,value,atSeconds:0}]}]);
    assert.notDeepEqual(wet.left,dry.left,`CC${controller} should change actual PCM`);
  }
  const flute=render([sound()],[]),pressure=render([sound()],[{id:'lead',events:[{type:'channel-pressure',value:127,atSeconds:.1}]}]);
  assert.notDeepEqual(pressure.left,flute.left);
});

test('sostenuto rendering holds captured notes while later notes release normally',()=>{
  const events=[sound({holdSeconds:.2,font:{...font,sostenutoSeconds:.9,soundingSeconds:.9}}),
    sound({atSeconds:.3,holdSeconds:.1,font:{...font,key:72,sostenutoSeconds:.1,soundingSeconds:.1}})];
  const controls:TimedMidiExpressionLane[]=[{id:'lead',events:[{type:'controller',controller:66,value:127,atSeconds:.1},
    {type:'controller',controller:66,value:0,atSeconds:.9}]}];
  const wet=render(events,controls),reference=render([sound({holdSeconds:.9}),events[1]!],[]);
  const error=wet.left.reduce((sum,x,i)=>sum+(x-reference.left[i]!)**2,0);
  assert(Math.sqrt(error/energy(reference.left))<.01,'selective pedal must match explicitly held captured key');
});


test('sostenuto release defers key-off until after a simultaneous sustain press',()=>{
  const {editor}=load(),body=editor.read().body!;
  body.parts[0]!.notes[0]!.midiOnOrder=1;
  body.parts[0]!.notes[0]!.midiOffOrder=3;
  body.midiExpression![0]!.events=[
    {type:'controller',controller:66,value:127,beat:.1,order:2},
    {type:'controller',controller:64,value:127,beat:1,order:4},
    {type:'controller',controller:66,value:0,beat:1,order:5},
    {type:'controller',controller:64,value:0,beat:2,order:6}];
  const performance=phraseExpression(body),id=body.parts[0]!.notes[0]!.id;
  assert.equal(performance.gates.get(id)!.keyEnd,.5);assert.equal(performance.gates.get(id)!.soundEnd,1);
  assert(performance.keyOrders.get(id)!>5);
});

test('many successive sostenuto notes reuse expired matching channel variants',()=>{
  const events=Array.from({length:64},(_,i)=>sound({atSeconds:i*.6,holdSeconds:.05,releaseSeconds:.1,
    font:{...font,sostenutoSeconds:.15,soundingSeconds:.15}}));
  const stream=new SoundFontStream(bank,12000,events),left=new Float32Array(128),right=new Float32Array(128);
  while(stream.position<39){left.fill(0);right.fill(0);stream.process(left,right);}
  assert(stream.synth.midiChannels.length<20);stream.dispose();
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
  const channels = plan.events.map(event => event.sound.kind === 'sample' ? event.sound.soundFont?.midiChannelId : undefined);
  assert(channels.includes(target!.midiChannelId)); assert(channels.includes(from!.midiChannelId)); assert(channels.includes(undefined));
  const score = scoreForFile(library, merged, 'Merged').score;
  assert.equal(score.parts.length, 3);
  const roundtrip = readExchangeMidi(writeExchangeMidi(score).bytes, 'Merged').score;
  assert.equal(roundtrip.parts.flatMap(part => part.notes).length, 3);
  assert.equal(roundtrip.midiExpression!.filter(lane => lane.events.some(event => event.type === 'controller' && event.controller === 64)).length, 1);
});
