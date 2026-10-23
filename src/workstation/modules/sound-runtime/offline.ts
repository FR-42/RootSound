import type { AudioRenderOptions, RenderedAudio, PlayableNotePlan, SoundSequencePlan } from '../../contracts/sound.ts';
import { MAX_AUDIO_FILE_BYTES } from '../../contracts/files.ts';
import { allocateGraph, releaseGraph, scheduleGraph, startGraphSource, type GraphResources } from './graph.ts';
import { readPreview, validateFrequency } from './plan.ts';

function cancelled(): DOMException { return new DOMException('音频导出已取消，尚未保存文件。', 'AbortError'); }
function abortIfNeeded(signal?: AbortSignal): void { if (signal?.aborted) throw cancelled(); }
function report(options: AudioRenderOptions, progress: number): void {
  try { options.onProgress?.(progress); } catch { /* Display callbacks must not change the output. */ }
}

/** 24-bit little-endian, two interleaved channels, ordinary RIFF PCM WAV. */
async function encodeWav(buffer: AudioBuffer, options: AudioRenderOptions): Promise<Uint8Array> {
  const frames = buffer.length;
  const dataBytes = frames * 6;
  const padding = dataBytes % 2;
  const bytes = new Uint8Array(44 + dataBytes + padding);
  const view = new DataView(bytes.buffer);
  const label = (at: number, text: string): void => { for (let i = 0; i < text.length; i += 1) bytes[at + i] = text.charCodeAt(i); };
  label(0, 'RIFF'); view.setUint32(4, bytes.byteLength - 8, true);
  label(8, 'WAVE'); label(12, 'fmt '); view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); view.setUint16(22, 2, true);
  view.setUint32(24, buffer.sampleRate, true); view.setUint32(28, buffer.sampleRate * 6, true);
  view.setUint16(32, 6, true); view.setUint16(34, 24, true);
  label(36, 'data'); view.setUint32(40, dataBytes, true);
  const channels = [buffer.getChannelData(0), buffer.getChannelData(1)];
  for (let begin = 0; begin < frames; begin += 65536) {
    abortIfNeeded(options.signal);
    const end = Math.min(frames, begin + 65536);
    for (let frame = begin; frame < end; frame += 1) {
      for (let channel = 0; channel < 2; channel += 1) {
        const value = channels[channel]![frame]!;
        if (!Number.isFinite(value)) throw new Error('声音执行器产生了无效采样，尚未保存音频。');
        // Shared graph normalization bounds the sum; clipping here handles only
        // waveform/filter numerical overshoot and the signed PCM boundary.
        const bounded = Math.min(1, Math.max(-1, value));
        const sample = Math.round(bounded * (bounded < 0 ? 8388608 : 8388607));
        const at = 44 + frame * 6 + channel * 3;
        bytes[at] = sample & 255;
        bytes[at + 1] = (sample >> 8) & 255;
        bytes[at + 2] = (sample >> 16) & 255;
      }
    }
    report(options, 0.85 + 0.15 * end / frames);
    if (end < frames) await new Promise<void>(resolve => setTimeout(resolve, 0));
  }
  abortIfNeeded(options.signal);
  return bytes;
}

export async function renderOffline(plan: PlayableNotePlan | SoundSequencePlan, options: AudioRenderOptions = {}): Promise<RenderedAudio> {
  abortIfNeeded(options.signal);
  const preview = readPreview(plan);
  const sampleRate = options.sampleRate ?? 48000;
  if (![44100, 48000, 96000].includes(sampleRate)) throw new Error('当前音频导出支持 44100、48000 或 96000 Hz。');
  validateFrequency(preview, sampleRate);
  const frames = Math.max(1, Math.ceil(preview.durationSeconds * sampleRate));
  if (44 + frames * 6 > MAX_AUDIO_FILE_BYTES) throw new Error('这段音频超出当前导出大小范围，请缩短内容或降低采样率。');
  if (typeof globalThis.OfflineAudioContext !== 'function') throw new Error('当前环境没有可用的离线音频接口。');
  const audio = new OfflineAudioContext(2, frames, sampleRate);
  const resources: GraphResources = { oscillators: [], samples: [], bufferReleases: [], gains: [], panners: [] };
  let rejectAborted: ((error: DOMException) => void) | undefined;
  const aborted = new Promise<never>((_resolve, reject) => { rejectAborted = reject; });
  const abort = (): void => {
    releaseGraph(resources);
    // Offline close is optional in current hosts; older implementations stop at
    // the next scheduled suspension and never resume a cancelled graph.
    const close = (audio as OfflineAudioContext & { close?: () => Promise<void> }).close;
    if (typeof close === 'function') void close.call(audio).catch(() => {});
    rejectAborted?.(cancelled());
  };
  options.signal?.addEventListener('abort', abort, { once: true });
  try {
    const graph = allocateGraph(audio, preview, resources);
    scheduleGraph(graph, preview.normalization, 0);
    for (const scheduled of graph.starts) {
      startGraphSource(scheduled, 0);
    }
    abortIfNeeded(options.signal);
    report(options, 0);
    // Offline clocks render faster than real time. Periodic suspensions provide
    // progress and let cancellation leave the graph suspended instead of burning CPU.
    const step = (): void => {
      const next = audio.currentTime + 0.25;
      // Suspensions are quantized to render blocks. A time before the nominal
      // end can still round beyond its last frame and reject the whole render.
      if (Math.ceil(next * sampleRate / 128) * 128 >= frames) return;
      void audio.suspend(next).then(async () => {
        if (options.signal?.aborted) return;
        report(options, 0.85 * audio.currentTime / (frames / sampleRate));
        step();
        await audio.resume();
      }).catch(error => { rejectAborted?.(error instanceof DOMException ? error : new DOMException(String(error), 'OperationError')); });
    };
    step();
    const buffer = await Promise.race([audio.startRendering(), aborted]);
    abortIfNeeded(options.signal);
    report(options, 0.85);
    const bytes = await encodeWav(buffer, options);
    return Object.freeze({ bytes, mimeType: 'audio/wav', extension: '.wav', sampleRate, channels: 2, bitsPerSample: 24, durationSeconds: frames / sampleRate });
  } finally {
    options.signal?.removeEventListener('abort', abort);
    releaseGraph(resources);
  }
}
