import { normalizePatch } from './model.mjs';
import { preparePatch, renderPatch, encodeWav24 } from './dsp.mjs';

// Worker-local evidence only: callers receive structured copies, never this
// worker's mutable typed arrays. Two entries bound audio compilation memory.
const prepared = new Map();
export function handleWorkerRequest(message, emit) {
  const id = message?.id;
  try {
    if (!message || typeof message !== 'object') throw new Error('声音计算请求无效。');
    const patch = normalizePatch(message.patch);
    if (message.type === 'prepare') {
      const rate = message.sampleRate ?? 48000;
      const key = JSON.stringify([rate, patch.oscillators.map(o => [o.enabled, o.waveform, o.pulseWidth]), patch.spectrum]);
      let bank = prepared.get(key);
      if (bank) { prepared.delete(key); prepared.set(key, bank); }
      else {
        bank = preparePatch(patch, rate, message.midis);
        if (prepared.size >= 2) prepared.delete(prepared.keys().next().value);
        prepared.set(key, bank);
      }
      emit({ type: 'prepared', id, prepared: bank });
    } else if (message.type === 'render') {
      const result = renderPatch(patch, message.options);
      const bytes = encodeWav24(result);
      emit({ type: 'rendered', id, bytes: bytes.buffer, peak: result.peak, durationSeconds: result.durationSeconds,
        sampleRate: result.sampleRate, latencySeconds: result.latencySeconds,
        spectrumResolutionHz: result.spectrumResolutionHz, tailTruncated: result.tailTruncated }, [bytes.buffer]);
    } else throw new Error('不支持这个声音计算请求。');
  } catch (error) { emit({ type: 'error', id, message: error instanceof Error ? error.message : String(error) }); }
}

if (typeof globalThis.postMessage === 'function' && typeof globalThis.document === 'undefined') {
  globalThis.onmessage = event => handleWorkerRequest(event.data, (message, transfer) => globalThis.postMessage(message, transfer ?? []));
}
