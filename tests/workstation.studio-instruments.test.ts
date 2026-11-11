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
  let text = createInitialProjectLibrary('采样播放测试', true);
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
