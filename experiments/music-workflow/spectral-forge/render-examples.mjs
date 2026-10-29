/** Offline examples. Never opens an audio device or overwrites user output. */
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createDefaultPatch, createPresets, normalizePatch } from './web/model.mjs';
import { renderPatch, encodeWav24 } from './web/dsp.mjs';

const directory = join(dirname(fileURLToPath(import.meta.url)), 'output', `examples-${new Date().toISOString().replace(/[:.]/g, '-')}`);
await mkdir(directory, { recursive: true });
const presets = createPresets();
for (const item of presets) await writeFile(join(directory, `${item.name}.rssynth`), JSON.stringify(item.patch, null, 2), { flag: 'wx' });
const glide = createDefaultPatch(); glide.name = '音高包络示范'; glide.oscillators[0].waveform = 'sine';
glide.spectrum.points = [{ x: 20, y: 0, curve: 0 }, { x: 20000, y: 0, curve: 0 }];
glide.pitch = { points: [{ x: 0, y: 12, curve: 0 }, { x: .35, y: 0, curve: 0 }, { x: .6, y: 0, curve: 0 }], sustainIndex: 1 };
await writeFile(join(directory, `${glide.name}.rssynth`), JSON.stringify(normalizePatch(glide), null, 2), { flag: 'wx' });
const auditions = [['bass', 36, .45], ['glass', 72, .3], ['wide', 60, .7], ['pitch-demo', 60, .6]];
const report = [];
for (const [id, midi, holdSeconds, tailSeconds] of auditions) {
  const patch = id === 'pitch-demo' ? glide : presets.find(item => item.id === id).patch;
  const started = performance.now();
  const result = renderPatch(patch, { sampleRate: 48000, midi, velocity: .8, holdSeconds, tailSeconds });
  const milliseconds = performance.now() - started;
  if (!(result.peak > 1e-6 && result.peak <= 1) || !result.left.every(Number.isFinite) || !result.right.every(Number.isFinite))
    throw new Error(`Invalid example audio: ${patch.name}`);
  const filename = `${String(report.length + 1).padStart(2, '0')}-${patch.name}.wav`;
  await writeFile(join(directory, filename), encodeWav24(result), { flag: 'wx' });
  report.push({ filename, midi, holdSeconds, tailSeconds, sampleRate: result.sampleRate, durationSeconds: result.durationSeconds,
    peak: result.peak, finite: result.left.every(Number.isFinite) && result.right.every(Number.isFinite),
    renderMilliseconds: milliseconds, realtimeFactor: milliseconds / 1000 / result.durationSeconds,
    latencySeconds: result.latencySeconds, tailTruncated: result.tailTruncated });
}
await writeFile(join(directory, 'verification.json'), JSON.stringify({ created: new Date().toISOString(), offlineOnly: true, listeningAccepted: false, report }, null, 2), { flag: 'wx' });
process.stdout.write(JSON.stringify({ directory, report }, null, 2) + '\n');
