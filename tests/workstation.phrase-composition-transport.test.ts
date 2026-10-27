import assert from 'node:assert/strict';
import test from 'node:test';
import type { PlaybackSession, SoundRuntimeEvent, SoundRuntimePort, SoundSequencePlan } from '../src/workstation/contracts/sound.ts';
import { createPhraseCompositionTransport } from '../src/workstation/modules/ui-rendering/phrase-composition-transport.ts';
import type { PlaylistTransportState } from '../src/workstation/modules/ui-rendering/playlist-transport.ts';
import { createPhraseAudition } from '../src/workstation/modules/ui-rendering/phrase-audition.ts';
import { createMaterialLibrary } from '../src/workstation/modules/materials/public.ts';
import { createPhraseEditor } from '../src/workstation/modules/phrase/public.ts';
import { createTimbreEditor, createTimbrePlayback } from '../src/workstation/modules/timbre/public.ts';
import { createBrowserSoundRuntime } from '../src/workstation/modules/sound-runtime/public.ts';
import { audio, fixture as simulatedDevice } from '../src/workstation/modules/sound-runtime/testing.ts';

const sound = { kind: 'basic-synth' as const, version: 1 as const, sources: [{ waveform: 'sine' as const, frequencyRatio: 1, level: 1 }],
  envelope: { attackSeconds: .1, releaseSeconds: .2 }, note: { frequencyHz: 440, holdSeconds: 2, velocity: 1 }, level: .5 };
function deferred() { let resolve!: () => void; const promise = new Promise<void>(done => { resolve = done; }); return { promise, resolve }; }
function fixture() {
  let elapsed = 0; let tempo = 120; let length = 16; let session: PlaybackSession | undefined; let count = 0;
  let prepare = async () => {}; let waitDevice: Promise<void> | undefined;
  let input: SoundSequencePlan = { kind: 'sequence', version: 1, durationSeconds: 20, events: [{ atSeconds: 0, sound }] };
  const calls: { method: string; plan?: SoundSequencePlan; id?: string }[] = [];
  const states: PlaylistTransportState[] = []; const errors: unknown[] = [];
  const listeners = new Set<(event: SoundRuntimeEvent) => void>();
  const emit = (status: PlaybackSession['status']) => { session = { ...session!, status }; for (const listener of listeners) listener({ type: 'session', session }); };
  const runtime = {
    async preview(plan: SoundSequencePlan) { calls.push({ method: 'preview', plan }); if (waitDevice) await waitDevice; elapsed = 0; session = { id: String(++count), status: 'playing', startedAtSeconds: 1, durationSeconds: plan.durationSeconds }; return session; },
    update(id: string, plan: SoundSequencePlan) { calls.push({ method: 'update', id, plan }); return session; },
    pause(id: string) { calls.push({ method: 'pause', id }); emit('paused'); return session; },
    async resume(id: string, plan: SoundSequencePlan) { calls.push({ method: 'resume', id, plan }); emit('playing'); return session!; },
    position: () => elapsed,
    stop(id: string) { calls.push({ method: 'stop', id }); if (session?.id === id) emit('stopped'); },
    stopAll() { calls.push({ method: 'stopAll' }); if (session) emit('stopped'); },
    subscribe(listener: (event: SoundRuntimeEvent) => void) { listeners.add(listener); return () => listeners.delete(listener); },
  } as unknown as SoundRuntimePort;
  const transport = createPhraseCompositionTransport({ runtime, tempoBpm: () => tempo, lengthBeats: () => length, prepare: () => prepare(), readPlan: () => input,
    onChange: state => states.push(state), onError: error => errors.push(error) });
  return { transport, calls, states, errors, emit, elapsed(value: number) { elapsed = value; }, tempo(value: number) { tempo = value; },
    plan(value: SoundSequencePlan) { input = value; }, length(value: number) { length = value; }, prepare(value: () => Promise<void>) { prepare = value; }, waitDevice(value: Promise<void>) { waitDevice = value; } };
}
async function settle() { await Promise.resolve(); await Promise.resolve(); await Promise.resolve(); }

test('phrase audition contains only the fixed four bars and leaves stored source notes intact', async () => {
  const f = fixture();
  const source: SoundSequencePlan = { kind: 'sequence', version: 1, durationSeconds: 20, events: [
    { atSeconds: 0, sound }, { atSeconds: 7.5, sound }, { atSeconds: 8, sound }, { atSeconds: 10, sound },
  ] };
  const snapshot = structuredClone(source); f.plan(source); await f.transport.toggle();
  const plan = f.calls.at(-1)!.plan!;
  assert.equal(plan.durationSeconds, 8); assert.equal(plan.events.length, 2);
  assert.equal(plan.events[0]!.sound, sound, 'notes inside the window retain their sound clock');
  assert.equal(plan.events[1]!.sound.note.holdSeconds, .5); assert.equal(plan.events[1]!.sound.envelope.releaseSeconds, 0);
  assert.deepEqual(source, snapshot, 'four-bar audition never shortens the saved phrase');
  f.elapsed(8); assert.equal(f.transport.position(), 0); assert.equal(f.states.at(-1)!.playing, false);
  assert.equal(f.calls.at(-1)!.method, 'stop'); f.transport.dispose();
});

test('empty phrase audition has a four-bar clock, including background completion', async context => {
  context.mock.timers.enable({ apis: ['setTimeout'] });
  const f = fixture(); f.plan({ kind: 'sequence', version: 1, durationSeconds: 1, events: [] });
  await f.transport.toggle(); assert.equal(f.calls.at(-1)!.plan!.durationSeconds, 8);
  assert.deepEqual(f.calls.at(-1)!.plan!.events, []);
  f.elapsed(4); assert.equal(f.transport.position(), 4);
  f.elapsed(8); context.mock.timers.tick(8000);
  assert.equal(f.states.at(-1)!.playing, false); assert.equal(f.transport.position(), 0);
  assert.equal(f.calls.at(-1)!.method, 'stop'); f.transport.dispose();
});

test('head placement clamps to the phrase edges and playing at the end starts a new audition', async () => {
  const f = fixture(); f.transport.seek(-3); assert.equal(f.transport.position(), 0);
  f.transport.seek(100); assert.equal(f.transport.position(), 8); await f.transport.toggle();
  assert.deepEqual(f.calls.at(-1)!.plan!.transport, { positionSeconds: 0, rate: 1 });
  f.transport.seek(8); await settle(); assert.equal(f.states.at(-1)!.playing, false); assert.equal(f.transport.position(), 8);
  const count = f.calls.length; f.transport.seek(NaN); assert.equal(f.calls.length, count);
  await f.transport.toggle(); assert.equal(f.calls.at(-1)!.plan!.durationSeconds, 8);
  assert.deepEqual(f.calls.at(-1)!.plan!.transport, { positionSeconds: 0, rate: 1 });
  f.transport.dispose();
});

test('phrase speed changes move the head without stretching ordinary notes and crop only boundary tails', async () => {
  const f = fixture(); f.plan({ kind: 'sequence', version: 1, durationSeconds: 12, events: [{ atSeconds: 0, sound }, { atSeconds: 7.5, sound }] });
  await f.transport.toggle(); f.elapsed(2); f.transport.setRate(1.25);
  const plan = f.calls.at(-1)!.plan!;
  assert.deepEqual(plan.transport, { positionSeconds: 2, rate: 1.25 }); assert.equal(plan.events[0]!.sound, sound);
  assert.equal(plan.events[1]!.sound.note.holdSeconds, .4);
  f.elapsed(4); assert.equal(f.transport.position(), 4.5); f.transport.pause();
  f.transport.setRate(.75); await f.transport.toggle(); assert.equal(f.calls.at(-1)!.method, 'resume');
  assert.deepEqual(f.calls.at(-1)!.plan!.transport, { positionSeconds: 4.5, rate: .75 });
  f.transport.setRate(NaN); assert.equal(f.errors.length, 1); assert.equal(f.states.at(-1)!.rate, .75);
  f.transport.dispose();
});

test('tempo edits preserve the head beat and refresh other edits in the current session', async () => {
  const f = fixture(); f.transport.seek(3); f.tempo(60); f.transport.refresh();
  assert.equal(f.transport.position(), 6, 'beat six stays beat six after a paused tempo edit');
  await f.transport.toggle(); assert.equal(f.calls.at(-1)!.plan!.durationSeconds, 16);
  f.elapsed(2); assert.equal(f.transport.position(), 8);
  f.tempo(120); f.transport.refresh(); await settle();
  assert.equal(f.transport.position(), 4, 'beat eight stays beat eight during playback');
  assert.deepEqual(f.calls.at(-1)!.plan!.transport, { positionSeconds: 4, rate: 1 });
  f.plan({ kind: 'sequence', version: 1, durationSeconds: 12, events: [{ atSeconds: 0, sound: { ...sound, level: .2 } }] });
  f.transport.refresh(); await settle(); assert.equal(f.calls.at(-1)!.method, 'update');
  assert.equal(f.calls.at(-1)!.plan!.events[0]!.sound.level, .2);
  f.transport.dispose();
});

test('stop and disposal cancel pending phrase preparation and late device starts', async () => {
  const f = fixture(); const wait = deferred(); f.prepare(() => wait.promise);
  const start = f.transport.toggle(); f.transport.stop(); wait.resolve(); await start;
  assert.equal(f.calls.length, 0); assert.equal(f.transport.position(), 0); f.transport.dispose();
  const pending = fixture(); const device = deferred(); pending.waitDevice(device.promise);
  const deviceStart = pending.transport.toggle(); await settle(); pending.transport.dispose();
  device.resolve(); await deviceStart;
  assert.equal(pending.calls.at(-2)!.method, 'stopAll'); assert.equal(pending.calls.at(-1)!.method, 'stop');
  assert.equal(pending.states.at(-1)!.playing, false); assert.deepEqual(pending.errors, []);
});

function auditionPhrase() {
  const library = createMaterialLibrary(); const timbre = createTimbreEditor(library);
  const saved = timbre.save('new'); if (saved.status !== 'saved') throw new Error('tone');
  const phrase = createPhraseEditor(library, createTimbrePlayback(library)); phrase.create(saved.content.id); phrase.setLength(16);
  return phrase;
}

test('a generated-note audition survives live head movement by waiting for the main player restart', async () => simulatedDevice(async () => {
  const phrase = auditionPhrase(); const part = phrase.read().body!.parts[0]!.id;
  phrase.addNote(part, { startBeat: 0, durationBeats: 4, frequencyHz: 440, velocity: .75 });
  const runtime = createBrowserSoundRuntime(); const errors: unknown[] = []; let preparation = async () => {};
  const transport = createPhraseCompositionTransport({ runtime, tempoBpm: () => 120, prepare: () => preparation(),
    readPlan: () => phrase.previewPlan(), onChange() {}, onError: error => errors.push(error) });
  let requests = 0;
  const audition = createPhraseAudition(phrase, { async audition(plan) { requests++; await runtime.audition(plan); }, cancelAudition: runtime.cancelAudition }, () => part, message => errors.push(message));
  try {
    await transport.toggle();
    const wait = deferred(); preparation = () => wait.promise;
    const pending = audition.request(660, .125, .75, transport.seek(.125));
    await settle();
    assert.equal(audio().oscillators.some(node => node.frequency.changes.some(change => change.value === 660)), false);
    wait.resolve(); await pending;
    const played = audio().oscillators.filter(node => node.frequency.changes.some(change => change.value === 660));
    assert.equal(requests, 1); assert(played.length > 0); assert(played.every(node => node.started && !node.stopped));
    assert.equal(transport.position(), .125); assert.deepEqual(errors, []);
  } finally { audition.cancel(); transport.dispose(); await runtime.dispose(); }
}));

test('waiting generated-note auditions retain cancellation and do not sound after selection changes', async () => {
  for (const mode of ['cancel', 'selection', 'supersede'] as const) {
    const phrase = auditionPhrase(); let selected: string | undefined = phrase.read().body!.parts[0]!.id;
    const played: number[] = []; const errors: string[] = []; const wait = deferred();
    const audition = createPhraseAudition(phrase, { async audition(plan) { played.push(plan.note.frequencyHz); }, cancelAudition() {} }, () => selected, message => errors.push(message));
    const pending = audition.request(440, .125, .75, wait.promise); await settle(); assert.deepEqual(played, []);
    if (mode === 'cancel') audition.cancel();
    else if (mode === 'selection') { selected = undefined; audition.sync(); }
    else await audition.request(660, .125, .75);
    wait.resolve(); await pending;
    assert.deepEqual(played, mode === 'supersede' ? [660] : [], mode);
    assert.deepEqual(errors, [], mode); audition.cancel();
  }
});

test('a failed readiness barrier reports only the current request and never emits a late note', async () => {
  const phrase = auditionPhrase(); const part = phrase.read().body!.parts[0]!.id;
  const played: number[] = []; const errors: string[] = [];
  const audition = createPhraseAudition(phrase, { async audition(plan) { played.push(plan.note.frequencyHz); }, cancelAudition() {} }, () => part, message => errors.push(message));
  await audition.request(440, .125, .75, Promise.reject(new Error('seek preparation failed')));
  assert.equal(errors.length, 1); assert.match(errors[0]!, /seek preparation failed/); assert.deepEqual(played, []);
  let reject!: (error: Error) => void;
  const rejected = new Promise<void>((_resolve, fail) => { reject = fail; });
  const stale = audition.request(660, .125, .75, rejected); audition.cancel(); reject(new Error('stale seek'));
  await stale; assert.equal(errors.length, 1); assert.deepEqual(played, []);
});

test('adding and undoing a bar updates the running and paused phrase boundary without losing late notes', async () => {
  const f = fixture(); f.plan({ kind: 'sequence', version: 1, durationSeconds: 12, events: [{ atSeconds: 9, sound }] });
  try {
    f.transport.seek(8); f.length(20); f.transport.refresh(); await f.transport.toggle();
    assert.equal(f.calls.at(-1)!.plan!.durationSeconds, 10); assert.equal(f.calls.at(-1)!.plan!.transport!.positionSeconds, 8);
    assert.equal(f.calls.at(-1)!.plan!.events[0]!.atSeconds, 9); assert.equal(f.calls.at(-1)!.plan!.events[0]!.sound.note.holdSeconds, 1);
    f.elapsed(1); assert.equal(f.transport.position(), 9);
    const starts = f.calls.filter(call => call.method === 'preview').length;
    f.length(24); f.transport.refresh(); await settle();
    assert.equal(f.calls.at(-1)!.method, 'update'); assert.equal(f.calls.at(-1)!.plan!.durationSeconds, 12);
    assert.equal(f.transport.position(), 9); assert.equal(f.calls.filter(call => call.method === 'preview').length, starts, 'extension keeps the running session');
    f.transport.pause(); f.length(16); f.transport.refresh(); await settle(); assert.equal(f.transport.position(), 8);
    await f.transport.toggle(); assert.equal(f.calls.at(-1)!.plan!.transport!.positionSeconds, 0, 'resuming at the new end restarts from zero');
  } finally { f.transport.dispose(); }
});
