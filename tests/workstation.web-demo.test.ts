import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { createWebDemoModel, WEB_TONES } from '../src/workstation/app/web-demo-model.ts';
import { createWebExampleModel, webExampleSnapshot } from '../src/workstation/app/web-demo-example.ts';
import { createInitialProjectLibrary } from '../src/workstation/app/project-setup.ts';
import { createMidiProjectLibrary } from '../src/workstation/app/midi-project.ts';
import { loadSoundFont, SoundFontStream } from '../src/workstation/modules/sound-runtime/soundfont-engine.ts';

const fetcher = (async (input: string | URL | Request) => {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
  const file = path.join('.cache/website/play', url.replace(/^\//, ''));
  return new Response(new Uint8Array(await readFile(file)));
}) as typeof fetch;
const note = { startBeat: 0, durationBeats: 1, durationSeconds: .5, frequencyHz: 440, velocity: .7 };

test('web score shares editable note timing, undo/redo and an atomic 64-beat limit', () => {
  const model = createWebDemoModel(undefined, '网页草稿');
  assert.deepEqual(model.palette.map(tone => tone.key), [...WEB_TONES]);
  const part = model.score.read().body!.parts[0]!.id;
  const id = model.score.addNote(part, note);
  model.score.setTempo(240);
  assert.equal(model.score.read().body!.parts[0]!.notes[0]!.durationSeconds, .25);
  model.score.undo(); assert.equal(model.score.read().body!.tempoBpm, 120);
  model.score.updateNote(part, id, { startBeat: .1321, pan: -.3, level: .45 });
  assert.equal(model.score.read().body!.parts[0]!.notes[0]!.startBeat, .1321);
  model.score.undo(); model.score.redo();
  assert.equal(model.score.read().body!.parts[0]!.notes[0]!.startBeat, .1321);
  model.score.setLength(64); const before = model.library.currentToken();
  assert.throws(() => model.score.addTempoSection(), /16 小节/);
  assert.equal(model.library.currentToken(), before);
  assert.equal(model.score.read().body!.lengthBeats, 64);
  assert.throws(() => model.score.addNotes(part, Array.from({ length: 2048 }, () => ({ ...note }))), /2048/);
  assert.equal(model.score.read().body!.parts[0]!.notes.length, 1);
  assert.throws(() => model.score.updateNote(part, id, { durationSeconds: 96 }), /16 小节/);
});

test('web download is a native v2 workspace with embedded samples, no histories, and survives reopening', async () => {
  const model = createWebDemoModel(undefined, '网页工程', fetcher);
  model.score.addNote(model.score.read().body!.parts[0]!.id, note);
  const bass = model.addGroup(model.palette.find(tone => tone.key === 'electric-bass')!.id);
  model.score.addNote(bass, { ...note, frequencyHz: 110, startBeat: .25 });
  const text = await model.save(), envelope = JSON.parse(text), raw = JSON.parse(envelope.libraryText);
  assert.equal(envelope.format, 'RootSoundWorkspace'); assert.equal(envelope.version, 2);
  assert.match(envelope.id, /^[a-f0-9-]{36}$/); assert(new Date(envelope.createdAtUtc).getTime() > 0);
  assert(!raw.editHistory && !raw.transactionHistory);
  assert(raw.contents.some((record: { kind: string }) => record.kind === 'rootsound.sample'));
  const opened = createWebDemoModel(text, '重新打开', fetcher);
  assert.equal(opened.score.read().draft!.name, '网页工程');
  assert.equal(opened.score.read().body!.parts.flatMap(part => part.notes).length, 2);
  assert.equal(opened.score.read().body!.parts[1]!.notes[0]!.startBeat, .25);
  await mkdir('.test-output/rb130', { recursive: true });
  await writeFile('.test-output/rb130/网页工程.rootsound', text);
});

test('short MIDI remaps unsupported instruments without moving notes; oversized import does not alter the current model', () => {
  const midi = Uint8Array.from([77,84,104,100,0,0,0,6,0,0,0,1,1,224,77,84,114,107,0,0,0,16,
    0,0xc0,19,0,0x90,60,100,0x83,0x60,0x80,60,0,0,255,47,0]);
  const imported = createMidiProjectLibrary(midi, '短曲');
  const model = createWebDemoModel(imported.libraryText);
  const written = model.score.read().body!.parts[0]!.notes[0]!;
  assert.equal(written.startBeat, 0); assert.equal(written.durationSeconds, .5); assert.equal(model.replaced, 1);
  const source = createInitialProjectLibrary('超长');
  const candidate = JSON.parse(source);
  for (const draft of candidate.drafts) if (draft.kind === 'rootsound.phrase') draft.body.lengthBeats = 128;
  const before = model.library.currentToken();
  assert.throws(() => createWebDemoModel(JSON.stringify(candidate)), /16 小节/);
  assert.equal(model.library.currentToken(), before);
});

test('website serves the same complete SF2 as the desktop build', async () => {
  const bytes = await readFile('.cache/website/play/instruments/generaluser-gs-2.0.3/GeneralUser-GS.sf2');
  assert.deepEqual(bytes, await readFile('public/instruments/generaluser-gs-2.0.3/GeneralUser-GS.sf2'));
  const bank = loadSoundFont(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
  const starterBytes = await readFile('.cache/website/play/instruments/generaluser-gs-2.0.3/GeneralUser-GS-starter.sf2');
  assert(starterBytes.byteLength < bytes.byteLength / 5);
  const starter = loadSoundFont(starterBytes.buffer.slice(starterBytes.byteOffset, starterBytes.byteOffset + starterBytes.byteLength));
  assert.deepEqual(starter.presets.map(preset => preset.program).sort((a,b) => a-b), [0,48,73]);
  const voices = [{program:0,key:60},{program:73,key:72},{program:48,key:60},{program:33,key:48},{program:10,key:72},
    {program:0,key:35,drums:true},{program:0,key:38,drums:true},{program:0,key:42,drums:true}];
  for (const voice of voices) {
    const stream = new SoundFontStream(bank, 44100, [{atSeconds:0,holdSeconds:.2,releaseSeconds:.2,level:.5,pan:0,
      font:{bank:'generaluser-gs-2.0.3',program:voice.program,key:voice.key,velocity:95,cents:0,drums:!!voice.drums}}]);
    await stream.ready(); const left = new Float32Array(22050), right = new Float32Array(22050);
    stream.process(left, right); stream.dispose();
    assert(left.every(Number.isFinite));
    assert(left.some(sample => Math.abs(sample) > .001), JSON.stringify(voice));
    if (!voice.drums && [0,48,73].includes(voice.program)) {
      const compact = new SoundFontStream(starter, 44100, [{atSeconds:0,holdSeconds:.2,releaseSeconds:.2,level:.5,pan:0,
        font:{bank:'generaluser-gs-2.0.3',program:voice.program,key:voice.key,velocity:95,cents:0,drums:false}}]);
      await compact.ready();
      const output = new Float32Array(left.length);
      compact.process(output, new Float32Array(right.length)); compact.dispose();
      assert.deepEqual(output, left);
    }
  }
});


test('published starter retains the authored 40 notes and timing while each visit is independent', async () => {
  const snapshot = JSON.parse(await readFile('website/examples/starter.json', 'utf8'));
  const model = createWebExampleModel(snapshot, fetcher);
  assert.deepEqual(webExampleSnapshot(model), snapshot);
  assert.equal(model.score.read().body!.tempoBpm, 148);
  assert.equal(model.score.read().body!.parts.flatMap(part => part.notes).length, 40);
  const part = model.score.read().body!.parts[0]!;
  model.score.removeNote(part.id, part.notes[0]!.id);
  assert.equal(model.score.read().body!.parts.flatMap(part => part.notes).length, 39);
  assert.deepEqual(webExampleSnapshot(createWebExampleModel(snapshot, fetcher)), snapshot);
  const saved = createWebDemoModel(await model.save(), undefined, fetcher);
  assert.equal(saved.score.read().body!.parts.flatMap(part => part.notes).length, 39);
});
