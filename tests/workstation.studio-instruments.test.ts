import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { createInitialProjectLibrary } from '../src/workstation/app/project-setup.ts';
import { listProjectTimbres } from '../src/workstation/app/project-timbres.ts';
import { createMaterialLibrary } from '../src/workstation/modules/materials/public.ts';
import { readPreview } from '../src/workstation/modules/sound-runtime/plan.ts';
import { defaultInstrumentInfo, studioBank } from '../src/workstation/modules/timbre/instrument-catalog.ts';
import { createTimbrePlayback } from '../src/workstation/modules/timbre/public.ts';
import { createSampleBankAudio } from '../src/workstation/modules/timbre/sample-bank.ts';

test('every curated voice reads real PCM through the desktop playback path', async () => {
  let text = createInitialProjectLibrary('采样播放测试');
  const library = createMaterialLibrary({ read: () => text, write: value => { text = value; } });
  const song = library.listDrafts().find(draft => draft.kind === 'rootsound.song')!;
  const fetcher = (async (url: string) => {
    assert(url.startsWith(`/instruments/${studioBank}/`));
    return new Response(readFileSync(`public${url}`));
  }) as typeof fetch;
  const bank = createSampleBankAudio(library, undefined, fetcher);
  const tones = createTimbrePlayback(library, undefined, undefined, bank, true);
  const records = listProjectTimbres(library, song.id);
  const pianoIds = new Set<string>();
  for (const record of records) {
    const info = defaultInstrumentInfo(record.id)!;
    for (const velocity of [.2, .75, .97]) {
      const note = { frequencyHz: 440 * 2 ** ((info.midi - 69) / 12), holdSeconds: .25, velocity };
      await tones.prepareForSaved(record.id, [note]);
      const plan = tones.planForSaved(record.id, note);
      assert(plan.kind === 'sample');
      assert(readPreview(plan));
      assert(plan.source.audio.channels.some(channel => channel.some(value => Math.abs(value) > .0001)), record.name);
      if (info.key === 'studio-piano') pianoIds.add(plan.source.id);
      if (info.key === 'studio-black-pearl-kick') {
        const high = { ...note, frequencyHz: 880 };
        await tones.prepareForSaved(record.id, [high]);
        assert.deepEqual(tones.planForSaved(record.id, high), plan);
      }
    }
  }
  assert.equal(pianoIds.size, 3);
  const piano = await tones.previewPianoPlan({ frequencyHz: 440, holdSeconds: .35, velocity: .75 });
  assert(piano.kind === 'sample' && piano.source.audio.channels.length === 2);
});

test('steel guitar recordings cover pitches and dynamics, reuse prepared audio and survive reopening', async () => {
  let text = createInitialProjectLibrary('木吉他');
  const storage = { read: () => text, write: (value: string) => { text = value; } };
  const requests: string[] = [];
  const fetcher = (async (url: string) => {
    requests.push(url);
    return new Response(readFileSync(`public${url}`));
  }) as typeof fetch;
  const library = createMaterialLibrary(storage);
  const guitar = library.listContent().find(item => item.name === '木吉他')!;
  const bank = createSampleBankAudio(library, undefined, fetcher);
  const tones = createTimbrePlayback(library, undefined, undefined, bank, true);
  assert.equal(requests.length, 0);
  for (const pitch of [40, 45, 57, 64, 76, 85]) for (const velocity of [.2, .75, .97]) {
    const note = { frequencyHz: 440 * 2 ** ((pitch - 69) / 12), holdSeconds: .08, velocity };
    await tones.prepareForSaved(guitar.id, [note]);
    const plan = tones.planForSaved(guitar.id, note);
    assert(plan.kind === 'sample');
    assert.deepEqual(plan.note, note);
    assert(plan.source.audio.channels.some(channel => channel.some(value => Math.abs(value) > .001)));
    assert(plan.envelope.attackSeconds < .01);
    assert(plan.envelope.releaseSeconds > .03 && plan.envelope.releaseSeconds <= .36);
    const count: number = requests.length;
    await tones.prepareForSaved(guitar.id, [note]);
    assert.equal(requests.length, count);
    assert.equal(tones.planForSaved(guitar.id, note).kind, 'sample');
  }
  const reopened = createMaterialLibrary(storage);
  const restored = reopened.readContent(guitar.id)!;
  assert.deepEqual(restored, guitar);
  const coldBank = createSampleBankAudio(reopened, undefined, fetcher);
  const coldTones = createTimbrePlayback(reopened, undefined, undefined, coldBank, true);
  const note = { frequencyHz: 220, holdSeconds: .3, velocity: .75 };
  await coldTones.prepareForSaved(guitar.id, [note]);
  assert(readPreview(coldTones.planForSaved(guitar.id, note)).samples.length > 0);
});
