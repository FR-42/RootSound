import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { PcmAudio } from '../src/workstation/contracts/sound.ts';
import { previewSavedSample } from '../src/workstation/app/sample-preview.ts';

test('cancelling a slow saved-sample decode cannot replace music started in the next workspace', async () => {
  let complete!: (audio: PcmAudio) => void; let played = 0;
  const cancellation = new AbortController();
  const pending = previewSavedSample({ audioForSaved: () => new Promise(resolve => { complete = resolve; }) },
    { async previewAudio() { played++; return { id: 'late', status: 'playing', startedAtSeconds: 0 }; } }, 'sample', cancellation.signal);
  const rejected = assert.rejects(pending, /取消/); cancellation.abort();
  complete({ sampleRate: 8000, channels: [new Float32Array([0.5])] }); await rejected; assert.equal(played, 0);
});

test('an active saved-sample audition uses decoded PCM through the common runtime without acquiring or replacing a draft', async () => {
  const audio = { sampleRate: 8000, channels: [new Float32Array([0.5])] }; const heard: PcmAudio[] = [];
  const session = await previewSavedSample({ async audioForSaved(id) { assert.equal(id, 'sample'); return audio; } },
    { async previewAudio(next) { heard.push(next); return { id: 'sample-preview', status: 'playing', startedAtSeconds: 1 }; } }, 'sample');
  assert.equal(session.id, 'sample-preview'); assert.deepEqual(heard, [audio]);
});
