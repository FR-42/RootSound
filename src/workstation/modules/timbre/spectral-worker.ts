import type { SoundPlan } from '../../contracts/sound.ts';
import type { SpectralPatch } from '../../contracts/timbre.ts';
import { SpectralSynth, preparePatch } from './spectral/dsp.mjs';
import { SPECTRAL_SAMPLE_RATE, spectralRenderShape } from './spectral-model.ts';

/** The experiment's actual oscillator/convolution/LFO/effects engine, one independent gated note. */
export function renderSpectralNote(patch: SpectralPatch, note: SoundPlan['note'], prepared?: unknown) {
  const { frames } = spectralRenderShape(patch, note);
  const synth = new SpectralSynth(SPECTRAL_SAMPLE_RATE, patch, prepared);
  const left = new Float32Array(frames); const right = new Float32Array(frames);
  synth.noteOn({ id: 'offline-note', midi: 69 + 12 * Math.log2(note.frequencyHz / 440), velocity: note.velocity });
  const heldFrames = Math.round(note.holdSeconds * SPECTRAL_SAMPLE_RATE);
  for (let start = 0; start < frames;) {
    if (start === heldFrames) synth.noteOff('offline-note');
    const end = Math.min(frames, start + 128, start < heldFrames ? heldFrames : frames);
    if (end <= start) break;
    synth.process(left.subarray(start, end), right.subarray(start, end)); start = end;
  }
  const edge = Math.min(Math.round(.006 * SPECTRAL_SAMPLE_RATE), frames);
  for (let index = 0; index < edge; index++) {
    const gain = 1 - index / Math.max(1, edge - 1); left[frames - edge + index]! *= gain; right[frames - edge + index]! *= gain;
  }
  return { left, right };
}
type Job = { key: string; patch: SpectralPatch; note: SoundPlan['note'] };
export function handleSpectralWorkerRequest(message: { type: string; jobs: Job[] }, emit: (value: unknown, transfer?: Transferable[]) => void) {
  try {
    if (message?.type !== 'render' || !Array.isArray(message.jobs) || message.jobs.length > 50000) throw new Error('精细音色计算请求无效。');
    let prepared: unknown; let preparedKey = '';
    for (const job of message.jobs) {
      const key = JSON.stringify([job.patch.oscillators.map(osc => [osc.enabled, osc.waveform, osc.pulseWidth]), job.patch.spectrum]);
      if (key !== preparedKey) { prepared = preparePatch(job.patch, SPECTRAL_SAMPLE_RATE); preparedKey = key; }
      const result = renderSpectralNote(job.patch, job.note, prepared);
      emit({ type: 'rendered', key: job.key, ...result }, [result.left.buffer, result.right.buffer]);
    }
  } catch (error) { emit({ type: 'error', message: error instanceof Error ? error.message : String(error) }); }
}
if (typeof globalThis.postMessage === 'function' && typeof globalThis.document === 'undefined') {
  globalThis.onmessage = event => handleSpectralWorkerRequest(event.data, (value, transfer) => globalThis.postMessage(value, { transfer }));
}
