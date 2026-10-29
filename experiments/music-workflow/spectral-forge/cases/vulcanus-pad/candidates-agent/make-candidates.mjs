import { mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createDefaultPatch, normalizePatch, effectivePolyphony } from '../../../web/model.mjs';
import { renderPatch, encodeWav24 } from '../../../web/dsp.mjs';

const output = dirname(fileURLToPath(import.meta.url));
await mkdir(output, { recursive: true });
const p = (x, y, curve = 0) => ({ x, y, curve });

function candidate(brighter = false) {
  const patch = createDefaultPatch();
  patch.name = brighter ? 'Vulcanus铺底-明亮候选' : 'Vulcanus铺底-柔和候选';
  patch.master = { level: .94, glideSeconds: .045, polyphony: 6, velocitySensitivity: .25 };
  const common = { enabled: true, semitones: 0, phase: 0, pulseWidth: .5, fmRatio: 1, fmAmount: 0 };
  patch.oscillators[0] = { ...patch.oscillators[0], ...common, waveform: 'saw', level: .85, pan: -.12,
    cents: -2.7, unison: 3, detuneCents: brighter ? 8 : 6, spread: .82 };
  patch.oscillators[1] = { ...patch.oscillators[1], ...common, waveform: brighter ? 'saw' : 'pulse',
    level: brighter ? .44 : .38, pan: .16, cents: 3.4, phase: .29, pulseWidth: .47,
    unison: 3, detuneCents: brighter ? 5 : 4.2, spread: .9 };
  patch.oscillators[2] = { ...patch.oscillators[2], ...common, waveform: 'triangle', semitones: 12,
    level: brighter ? .16 : .12, pan: .03, cents: -.8, phase: .13,
    unison: 1, detuneCents: 0, spread: 0 };
  patch.oscillators[3] = { ...patch.oscillators[3], ...common, waveform: 'noise', level: brighter ? .009 : .006,
    pan: -.04, cents: 0, unison: 1, detuneCents: 0, spread: 0 };
  patch.spectrum = { mix: 1, points: brighter
    ? [p(20,-72),p(70,-34),p(150,-8),p(330,1),p(800,2),p(1500,-1),p(2700,-7),p(4700,-17),p(9000,-34),p(20000,-66)]
    : [p(20,-72),p(70,-38),p(150,-12),p(330,0),p(800,-1),p(1450,-5),p(2500,-11),p(4200,-22),p(8000,-42),p(20000,-72)] };
  patch.amplitude = brighter
    ? { points: [p(0,0,-.15),p(.035,.04,-.15),p(.15,.6,-.12),p(.42,1,.1),p(1.4,.82,.08),p(3.1,0)], sustainIndex: 4 }
    : { points: [p(0,0,-.1),p(.03,.008,-.1),p(.12,.14,-.2),p(.36,.74,-.12),p(.72,1,.12),p(1.1,.91,.12),p(1.7,.87,.08),p(3.55,0)], sustainIndex: 6 };
  patch.pitch = { points: [p(0,0),p(.4,0),p(1.8,0)], sustainIndex: 1 };
  patch.lfos = [
    { enabled: true, waveform: 'sine', rateHz: brighter ? .19 : .16, depth: brighter ? .022 : .018, target: 'pitch' },
    { enabled: true, waveform: 'sine', rateHz: .11, depth: .1, target: 'pan' },
  ];
  patch.effects = { drive: 0, chorusMix: brighter ? .26 : .3, chorusRateHz: brighter ? .37 : .29,
    chorusDepthMs: brighter ? 7 : 6.5, delaySeconds: .212, delayFeedback: .34, delayMix: .11 };
  patch.seed = 837219;
  return normalizePatch(patch);
}

const reports = [];
for (const brighter of [false, true]) {
  const patch = candidate(brighter);
  const text = JSON.stringify(patch, null, 2);
  const patchFile = `${patch.name}.rssynth`;
  await writeFile(join(output, patchFile), text, { flag: 'wx' });
  const rendered = renderPatch(patch, { sampleRate: 48000, midi: 60, velocity: .85, holdSeconds: 3.4 });
  let energy = 0, sideEnergy = 0, midEnergy = 0;
  for (let i = 0; i < rendered.left.length; i++) {
    const l = rendered.left[i], r = rendered.right[i];
    if (!Number.isFinite(l) || !Number.isFinite(r)) throw new Error('Nonfinite candidate output');
    energy += (l*l+r*r)/2; sideEnergy += ((l-r)/2)**2; midEnergy += ((l+r)/2)**2;
  }
  if (!(rendered.peak > .00001 && rendered.peak < 1)) throw new Error('Invalid candidate peak');
  const wavFile = `${patch.name}-C4.wav`;
  await writeFile(join(output, wavFile), encodeWav24(rendered), { flag: 'wx' });
  reports.push({ patchFile, wavFile, patchSha256: createHash('sha256').update(text).digest('hex'),
    engine: 'Original SpectralSynth and renderPatch; no postprocessing', listeningVerified: false,
    target: 'Sustained harmony bed below the vocal, not the lead or a reverse-engineered score',
    curvePoints: [patch.spectrum.points.length, patch.amplitude.points.length, patch.pitch.points.length],
    oscillatorUnitsPerNote: patch.oscillators.reduce((n,o)=>n+(o.enabled?o.unison:0),0),
    effectivePolyphony: effectivePolyphony(patch), midi: 60, velocity: .85,
    holdSeconds: 3.4, durationSeconds: rendered.durationSeconds, peak: rendered.peak,
    rms: Math.sqrt(energy/rendered.left.length), sideToMidDb: 10*Math.log10(sideEnergy/midEnergy),
    tailTruncated: rendered.tailTruncated, originalSongAudioIncluded: false });
}
await writeFile(join(output, 'candidate-report.json'), JSON.stringify(reports, null, 2), { flag: 'wx' });
process.stdout.write(JSON.stringify(reports, null, 2));
