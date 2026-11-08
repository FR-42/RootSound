import assert from 'node:assert/strict';
import test from 'node:test';
import { createBrowserSoundRuntime } from '../src/workstation/modules/sound-runtime/public.ts';
import { createPlaylistTransport, type PlaylistTransportState } from '../src/workstation/modules/ui-rendering/playlist-transport.ts';
import { audio, close, fixture, longSample, phrase, plan } from '../src/workstation/modules/sound-runtime/testing.ts';
import { createMaterialLibrary } from '../src/workstation/modules/materials/public.ts';
import { createTimbrePlayback, createTimbreReferenceAdapter } from '../src/workstation/modules/timbre/public.ts';
import { createPhrasePlayback, createPhraseReferenceAdapter } from '../src/workstation/modules/phrase/public.ts';
import { createSongEditor, createSongReferenceAdapter } from '../src/workstation/modules/song/public.ts';
import { createProjectPhrase } from '../src/workstation/app/project-phrases.ts';

test('playlist transport resumes the actual adapter and advances after its synchronous pause events', async () => fixture(async () => {
  const runtime = createBrowserSoundRuntime(); const states: PlaylistTransportState[] = []; const errors: unknown[] = [];
  const input = phrase([{ atSeconds: 0, sound: longSample() }, { atSeconds: 4, sound: plan() }], 6);
  const transport = createPlaylistTransport({ runtime, prepare: async () => {}, readPlan: () => input,
    onChange: state => states.push(state), onError: error => errors.push(error) });
  await transport.toggle();
  audio().currentTime += 1; const before = transport.position();
  transport.pause(); close(transport.position(), before); assert.equal(states.at(-1)!.playing, false);
  audio().currentTime += 20; await transport.toggle();
  assert.equal(states.at(-1)!.playing, true); close(transport.position(), before);
  audio().currentTime += 1; assert(transport.position() > before + .9);
  assert.deepEqual(errors, []); transport.dispose(); await runtime.dispose();
}));

test('an empty playlist starts, pauses and continues its clock through the actual adapter', async () => fixture(async () => {
  const runtime = createBrowserSoundRuntime(); const states: PlaylistTransportState[] = []; const errors: unknown[] = [];
  const transport = createPlaylistTransport({ runtime, prepare: async () => {},
    readPlan: () => phrase([], 8), onChange: state => states.push(state), onError: error => errors.push(error) });
  await transport.toggle(); assert.equal(states.at(-1)!.playing, true); assert.deepEqual(errors, []);
  assert.equal(audio().oscillators.length, 0); const clock = audio().clocks[0]!;
  audio().currentTime = clock.startTime! + 2; close(transport.position(), 2);
  transport.pause(); audio().currentTime += 10; await transport.toggle();
  assert.equal(states.at(-1)!.playing, true); close(transport.position(), 2);
  const resumed = audio().clocks.at(-1)!; audio().currentTime = resumed.startTime! + .5;
  close(transport.position(), 2.5); transport.stop(); close(transport.position(), 0);
  assert.equal(states.at(-1)!.playing, false); assert.deepEqual(errors, []); transport.dispose(); await runtime.dispose();
}));

test('a newly created empty reusable phrase reaches the playlist runtime and can continue', async () => fixture(async () => {
  let raw: string | null = null;
  const library = createMaterialLibrary({ read: () => raw, write: value => { raw = value; } }, {
    project: { rootKind: 'rootsound.song', adapters: [createSongReferenceAdapter(), createPhraseReferenceAdapter(), createTimbreReferenceAdapter()] },
  });
  const song = createSongEditor(library, createPhrasePlayback(library, createTimbrePlayback(library)), { initialTrackCount: 7, defaultTempoMode: 'source' });
  song.create(); const created = createProjectPhrase(library, song.read().draft!.id);
  song.addClip(song.read().body!.tracks[0]!.id, created.id, 4);
  const runtime = createBrowserSoundRuntime(); const states: PlaylistTransportState[] = []; const errors: unknown[] = [];
  const transport = createPlaylistTransport({ runtime, prepare: () => song.preparePreview(), readPlan: () => song.previewPlan(undefined, { allowSilence: true }),
    onChange: state => states.push(state), onError: error => errors.push(error) });
  await transport.toggle(); assert.equal(states.at(-1)!.playing, true);
  audio().currentTime = audio().clocks[0]!.startTime! + 1; transport.pause(); await transport.toggle();
  assert.equal(states.at(-1)!.playing, true); close(transport.position(), 1); assert.deepEqual(errors, []);
  transport.dispose(); await runtime.dispose();
}));

test('paused arrangement deletion resumes as silence and stop cancels an adapter resume in flight', async () => fixture(async () => {
  const runtime = createBrowserSoundRuntime(); const states: PlaylistTransportState[] = []; const errors: unknown[] = [];
  let input = phrase([{ atSeconds: 0, sound: longSample() }, { atSeconds: 4, sound: plan() }], 6);
  const transport = createPlaylistTransport({ runtime, prepare: async () => {}, readPlan: () => input,
    onChange: state => states.push(state), onError: error => errors.push(error) });
  await transport.toggle(); const initialClock = audio().clocks[0]!;
  audio().currentTime = initialClock.startTime! + 1; transport.pause();
  input = phrase([], 6); transport.refresh(); await transport.toggle();
  const resumedClock = audio().clocks.at(-1)!; audio().currentTime = resumedClock.startTime! + .5;
  close(transport.position(), 1.5); assert.equal(states.at(-1)!.playing, true);
  assert(audio().sampleSources.every(source => source.stopped && source.disconnected));
  transport.pause(); const clockCount = audio().clocks.length;
  const resume = transport.toggle(); await Promise.resolve(); transport.stop(); await resume;
  assert.equal(audio().clocks.length, clockCount); close(transport.position(), 0);
  assert.equal(states.at(-1)!.playing, false); assert.deepEqual(errors, []); transport.dispose(); await runtime.dispose();
}));

test('live playlist seek beyond musical extent stays at its new head on a bounded silent adapter clock', async () => fixture(async () => {
  const runtime = createBrowserSoundRuntime(); const states: PlaylistTransportState[] = []; const errors: unknown[] = [];
  const transport = createPlaylistTransport({ runtime, prepare: async () => {}, readPlan: () => phrase([{ atSeconds: 0, sound: longSample() }, { atSeconds: 4, sound: plan() }], 6),
    onChange: state => states.push(state), onError: error => errors.push(error) });
  await transport.toggle(); transport.seek(12);
  await Promise.resolve(); await Promise.resolve(); await Promise.resolve();
  assert.equal(states.at(-1)!.playing, true); close(transport.position(), 12);
  let clock = audio().clocks.at(-1)!; audio().currentTime = clock.startTime! + .5; close(transport.position(), 12.5);
  transport.seek(750); await Promise.resolve(); await Promise.resolve(); await Promise.resolve();
  close(transport.position(), 750); clock = audio().clocks.at(-1)!;
  audio().currentTime = clock.startTime! + 1; close(transport.position(), 751);
  transport.pause(); await transport.toggle(); clock = audio().clocks.at(-1)!;
  audio().currentTime = clock.startTime! + 1; close(transport.position(), 752);
  transport.seek(2); await Promise.resolve(); await Promise.resolve(); await Promise.resolve();
  close(transport.position(), 2); close(audio().sampleSources.at(-1)!.offset, .2 + 2 * 1.5);
  audio().currentTime = audio().clocks.at(-1)!.startTime!;
  transport.setRate(.75); const current = transport.position(); audio().currentTime += .5;
  close(transport.position(), current + .375);
  transport.stop(); close(transport.position(), 0);
  assert.deepEqual(errors, []); transport.dispose(); await runtime.dispose();
}));

