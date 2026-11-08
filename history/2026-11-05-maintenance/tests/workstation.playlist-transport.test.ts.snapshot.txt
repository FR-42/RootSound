import assert from 'node:assert/strict';
import test from 'node:test';
import type { PlaybackSession, SoundRuntimeEvent, SoundRuntimePort, SoundSequencePlan } from '../src/workstation/contracts/sound.ts';
import { createPlaylistTransport, type PlaylistTransportState } from '../src/workstation/modules/ui-rendering/playlist-transport.ts';

function deferred() { let resolve!: () => void; const promise = new Promise<void>(done => { resolve = done; }); return { promise, resolve }; }
const sound = { kind: 'basic-synth' as const, version: 1 as const, sources: [{ waveform: 'sine' as const, frequencyRatio: 1, level: 1 }],
  envelope: { attackSeconds: .1, releaseSeconds: .2 }, note: { frequencyHz: 440, holdSeconds: 2, velocity: 1 }, level: .5 };
function fixture() {
  let elapsed = 0; let session: PlaybackSession | undefined; let count = 0;
  const calls: { method: string; plan?: SoundSequencePlan; id?: string }[] = []; const listeners = new Set<(event: SoundRuntimeEvent) => void>();
  const states: PlaylistTransportState[] = []; const errors: unknown[] = [];
  let input: SoundSequencePlan = { kind: 'sequence', version: 1, durationSeconds: 10, events: [{ atSeconds: 0, sound }] };
  let prepare = async () => {}; let failPreview = false; let previewWait: Promise<void> | undefined; let resumeWait: Promise<void> | undefined;
  const emit = (status: PlaybackSession['status']) => { session = { ...session!, status }; for (const listener of listeners) listener({ type: 'session', session }); };
  const runtime = {
    async preview(plan: SoundSequencePlan) { calls.push({ method: 'preview', plan }); if (previewWait) await previewWait; if (failPreview) throw new Error('failed device'); elapsed = 0; session = { id: String(++count), status: 'playing', startedAtSeconds: 1, durationSeconds: 10 }; return session; },
    update(id: string, plan: SoundSequencePlan) { calls.push({ method: 'update', plan, id }); return session; },
    pause(id: string) { calls.push({ method: 'pause', id }); emit('paused'); return session; },
    async resume(id: string, plan: SoundSequencePlan) { calls.push({ method: 'resume', id, plan }); if (resumeWait) await resumeWait; emit('playing'); return session!; },
    position: () => elapsed,
    stop(id: string) { calls.push({ method: 'stop', id }); if (id === session?.id) emit('stopped'); },
    stopAll() { calls.push({ method: 'stopAll' }); if (session) emit('stopped'); },
    subscribe(listener: (event: SoundRuntimeEvent) => void) { listeners.add(listener); return () => listeners.delete(listener); },
  } as unknown as SoundRuntimePort;
  const transport = createPlaylistTransport({ runtime, prepare: () => prepare(), readPlan: () => input, onChange: state => states.push(state), onError: error => errors.push(error) });
  return { transport, calls, states, errors, emit, elapsed(value: number) { elapsed = value; }, plan(value: SoundSequencePlan) { input = value; }, prepare(value: () => Promise<void>) { prepare = value; }, waitDevice(value: Promise<void>) { previewWait = value; }, waitResume(value: Promise<void>) { resumeWait = value; }, fail() { failPreview = true; } };
}

test('playlist pauses in song seconds, resumes retained session, and changes only the head rate', async () => {
  const f = fixture(); await f.transport.toggle(); f.elapsed(2); assert.equal(f.transport.position(), 2);
  f.transport.setRate(.75); assert.deepEqual(f.calls.at(-1)!.plan!.transport, { positionSeconds: 2, rate: .75 });
  assert.equal(f.calls.at(-1)!.plan!.events[0]!.sound, sound);
  f.elapsed(4); assert.equal(f.transport.position(), 3.5);
  f.transport.pause(); assert.equal(f.states.at(-1)!.playing, false); assert.equal(f.transport.position(), 3.5);
  f.elapsed(8); assert.equal(f.transport.position(), 3.5);
  await f.transport.toggle(); assert.equal(f.calls.at(-1)!.method, 'resume'); assert.deepEqual(f.calls.at(-1)!.plan!.transport, { positionSeconds: 3.5, rate: .75 });
  f.transport.setRate(1.25); f.elapsed(10); assert.equal(f.transport.position(), 6);
  f.transport.dispose(); assert.equal(f.calls.at(-1)!.method, 'stop');
});

test('seeking replaces the old sequence and a paused seek starts at the requested cursor', async () => {
  const f = fixture(); await f.transport.toggle(); f.elapsed(1); f.transport.seek(4);
  await Promise.resolve(); await Promise.resolve();
  assert.equal(f.calls.filter(call => call.method === 'preview').length, 2);
  assert.deepEqual(f.calls.at(-1)!.plan!.transport, { positionSeconds: 4, rate: 1 });
  f.transport.pause(); f.transport.seek(6); await f.transport.toggle();
  assert.equal(f.calls.at(-1)!.method, 'preview'); assert.deepEqual(f.calls.at(-1)!.plan!.transport, { positionSeconds: 6, rate: 1 });
  f.transport.dispose();
});

test('a live seek completes only after the replacement player is ready, while paused placement stays immediate', async () => {
  const f = fixture();
  try {
    await f.transport.seek(2); assert.equal(f.transport.position(), 2);
    await f.transport.toggle();
    const preparation = deferred(); const device = deferred();
    f.prepare(() => preparation.promise); f.waitDevice(device.promise);
    let complete = false;
    const seek = f.transport.seek(4).then(() => { complete = true; });
    assert.equal(f.transport.position(), 4); assert.equal(complete, false);
    preparation.resolve(); await Promise.resolve(); await Promise.resolve();
    assert.equal(f.calls.at(-1)!.method, 'preview'); assert.equal(complete, false);
    device.resolve(); await seek;
    assert.equal(complete, true); assert.equal(f.states.at(-1)!.playing, true);
    assert.deepEqual(f.calls.at(-1)!.plan!.transport, { positionSeconds: 4, rate: 1 });
    assert.deepEqual(f.errors, []);
  } finally { f.transport.dispose(); }
});

test('edits update the current playing position and cancelled preparation cannot play or edit late', async () => {
  const f = fixture(); await f.transport.toggle(); f.elapsed(2);
  const edit = deferred(); f.prepare(() => edit.promise); f.transport.refresh(); f.transport.pause(); edit.resolve();
  await Promise.resolve(); await Promise.resolve(); assert.equal(f.calls.filter(call => call.method === 'update').length, 0);
  f.prepare(async () => {}); await f.transport.toggle(); f.elapsed(3);
  f.plan({ kind: 'sequence', version: 1, durationSeconds: 10, events: [{ atSeconds: 0, sound: { ...sound, level: .2 } }] });
  f.transport.refresh(); await Promise.resolve(); await Promise.resolve();
  assert.equal(f.calls.at(-1)!.method, 'update'); assert.deepEqual(f.calls.at(-1)!.plan!.transport, { positionSeconds: 3, rate: 1 });
  f.transport.dispose();
  const pending = fixture(); const wait = deferred(); pending.prepare(() => wait.promise);
  const start = pending.transport.toggle(); pending.transport.pause(); wait.resolve(); await start;
  assert.equal(pending.calls.length, 0); assert.equal(pending.states.at(-1)!.preparing, false); pending.transport.dispose();
});

test('device failures, external stops, natural completion and disposal leave truthful playback state', async () => {
  const f = fixture(); f.fail(); await f.transport.toggle(); assert.equal(f.errors.length, 1); assert.equal(f.states.at(-1)!.playing, false); f.transport.dispose();
  const stopped = fixture(); await stopped.transport.toggle(); stopped.elapsed(2); stopped.emit('stopped');
  assert.equal(stopped.states.at(-1)!.playing, false); assert.equal(stopped.transport.position(), 2); stopped.transport.dispose();
  const ended = fixture(); await ended.transport.toggle(); ended.elapsed(10); ended.emit('ended'); assert.equal(ended.transport.position(), 0);
  const before = ended.states.length; ended.transport.dispose(); ended.emit('failed'); assert.equal(ended.states.length, before);
  const pending = fixture(); const wait = deferred(); pending.prepare(() => wait.promise); const start = pending.transport.toggle(); pending.transport.dispose(); wait.resolve(); await start;
  assert.equal(pending.calls.length, 0);
});

test('speed changes and cancellation during an unresolved device start cannot create a stale player', async () => {
  const f = fixture(); const wait = deferred(); f.waitDevice(wait.promise);
  const start = f.transport.toggle(); await Promise.resolve(); f.transport.setRate(.75); wait.resolve(); await start;
  assert.equal(f.calls.at(-1)!.method, 'update'); assert.deepEqual(f.calls.at(-1)!.plan!.transport, { positionSeconds: 0, rate: .75 });
  f.elapsed(2); assert.equal(f.transport.position(), 1.5); f.transport.dispose();
  const cancelled = fixture(); const device = deferred(); cancelled.waitDevice(device.promise);
  const pending = cancelled.transport.toggle(); await Promise.resolve(); cancelled.transport.pause(); device.resolve(); await pending;
  assert.equal(cancelled.calls.at(-2)!.method, 'stopAll'); assert.equal(cancelled.calls.at(-1)!.method, 'stop');
  assert.equal(cancelled.states.at(-1)!.playing, false); assert.equal(cancelled.states.at(-1)!.preparing, false); cancelled.transport.dispose();
});

test('stop resets a retained pause and cancels pending starts without late playback', async () => {
  const f = fixture(); await f.transport.toggle(); f.elapsed(3); f.transport.pause(); f.transport.stop();
  assert.equal(f.transport.position(), 0); assert.equal(f.states.at(-1)!.playing, false);
  assert.equal(f.calls.at(-1)!.method, 'stop');
  await f.transport.toggle(); assert.equal(f.calls.at(-1)!.method, 'preview');
  assert.deepEqual(f.calls.at(-1)!.plan!.transport, { positionSeconds: 0, rate: 1 }); f.transport.dispose();

  const pending = fixture(); const wait = deferred(); pending.waitDevice(wait.promise);
  const start = pending.transport.toggle(); await Promise.resolve(); pending.transport.stop(); wait.resolve(); await start;
  assert.equal(pending.transport.position(), 0); assert.equal(pending.states.at(-1)!.playing, false);
  assert.equal(pending.states.at(-1)!.preparing, false); assert(pending.calls.some(call => call.method === 'stopAll'));
  pending.transport.dispose();
});

test('head placement uses the freshly extended song instead of the last played duration', async () => {
  const f = fixture(); await f.transport.toggle(); f.transport.pause();
  f.plan({ kind: 'sequence', version: 1, durationSeconds: 30, events: [{ atSeconds: 0, sound }] });
  f.transport.seek(20); assert.equal(f.transport.position(), 20); await f.transport.toggle();
  assert.deepEqual(f.calls.at(-1)!.plan!.transport, { positionSeconds: 20, rate: 1 });
  f.transport.seek(-2); await Promise.resolve(); await Promise.resolve();
  assert.deepEqual(f.calls.at(-1)!.plan!.transport, { positionSeconds: 0, rate: 1 }); f.transport.dispose();
});

test('rapid playing seeks coalesce their preparation and only the last head position starts', async () => {
  const f = fixture(); await f.transport.toggle(); const wait = deferred(); f.prepare(() => wait.promise);
  f.transport.seek(3); f.transport.seek(5); f.transport.seek(7);
  assert.equal(f.transport.position(), 7); wait.resolve(); await Promise.resolve(); await Promise.resolve();
  assert.equal(f.calls.filter(call => call.method === 'preview').length, 2);
  assert.deepEqual(f.calls.at(-1)!.plan!.transport, { positionSeconds: 7, rate: 1 });
  assert.equal(f.states.at(-1)!.playing, true); assert.deepEqual(f.errors, []); f.transport.dispose();
});

test('stop while a retained resume is pending cannot be undone by its late result', async () => {
  const f = fixture(); await f.transport.toggle(); f.elapsed(2); f.transport.pause();
  const wait = deferred(); f.waitResume(wait.promise); const resume = f.transport.toggle();
  await Promise.resolve(); assert.equal(f.calls.at(-1)!.method, 'resume'); f.transport.stop();
  assert.equal(f.transport.position(), 0); assert.equal(f.states.at(-1)!.preparing, false);
  wait.resolve(); await resume;
  assert.equal(f.states.at(-1)!.playing, false); assert.equal(f.transport.position(), 0);
  assert.equal(f.calls.at(-1)!.method, 'stop'); assert.deepEqual(f.errors, []); f.transport.dispose();
});

test('explicit seeks into empty space preserve the head, including beyond the execution plan limit', async () => {
  const f = fixture(); await f.transport.toggle(); f.transport.seek(12);
  await Promise.resolve(); await Promise.resolve();
  assert.equal(f.states.at(-1)!.playing, true); assert.equal(f.transport.position(), 12);
  assert.equal(f.calls.at(-1)!.plan!.durationSeconds, 42);
  assert.deepEqual(f.calls.at(-1)!.plan!.transport, { positionSeconds: 12, rate: 1 });
  f.transport.pause(); f.transport.seek(750); await f.transport.toggle();
  assert.equal(f.transport.position(), 750); assert.equal(f.calls.at(-1)!.plan!.durationSeconds, 30);
  assert.deepEqual(f.calls.at(-1)!.plan!.events, []);
  assert.deepEqual(f.calls.at(-1)!.plan!.transport, { positionSeconds: 0, rate: 1 });
  f.elapsed(2); assert.equal(f.transport.position(), 752);
  f.transport.setRate(.75); f.elapsed(4); assert.equal(f.transport.position(), 753.5);
  f.transport.pause(); await f.transport.toggle(); assert.equal(f.transport.position(), 753.5);
  f.transport.stop(); assert.equal(f.transport.position(), 0); assert.deepEqual(f.errors, []); f.transport.dispose();
});
