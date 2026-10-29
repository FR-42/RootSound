import fs from 'node:fs';
import assert from 'node:assert/strict';
import { createMaterialLibrary } from '../../../src/workstation/modules/materials/public.ts';
import { createSampleAudio, createSampleReferenceAdapter } from '../../../src/workstation/modules/sampling/public.ts';
import { decodePcmWav } from '../../../src/workstation/modules/sampling/audio.ts';
import { createTimbrePlayback, createTimbreReferenceAdapter } from '../../../src/workstation/modules/timbre/public.ts';
import { createPhrasePlayback, createPhraseReferenceAdapter } from '../../../src/workstation/modules/phrase/public.ts';
import { createSongEditor, createSongReferenceAdapter } from '../../../src/workstation/modules/song/public.ts';
import { readPreview } from '../../../src/workstation/modules/sound-runtime/plan.ts';
const started = performance.now();
const envelope = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
assert.equal(envelope.format, 'RootSoundWorkspace'); assert.equal(envelope.version, 2);
const adapters = [createSampleReferenceAdapter(), createTimbreReferenceAdapter(), createPhraseReferenceAdapter(), createSongReferenceAdapter()];
const library = createMaterialLibrary({ read: () => envelope.libraryText, write: () => { throw new Error('Read only'); } }, { project: { rootKind: 'rootsound.song', adapters } });
const audio = createSampleAudio(library, { async decode(bytes) { const result = decodePcmWav(bytes); assert(result); return result; } });
const song = createSongEditor(library, createPhrasePlayback(library, createTimbrePlayback(library, audio)), { defaultTempoMode: 'source' });
await song.preparePreview();
const plan = song.previewPlan();
const scheduled = readPreview(plan);
const body = song.read().body;
assert(body); assert(plan.events.length > 0);
console.log(JSON.stringify({ name: envelope.name, tracks: body.tracks.length, events: plan.events.length,
  duration: plan.durationSeconds, preparedSamples: scheduled.samples.length, seconds: (performance.now() - started) / 1000,
  maxRSSKiB: process.resourceUsage().maxRSS }));
