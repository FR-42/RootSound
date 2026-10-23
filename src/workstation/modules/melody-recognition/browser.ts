import { MAX_MELODY_INPUT_SECONDS, type MelodyAnalysis, type MelodyAnalyzerPort } from '../../contracts/melody-recognition.ts';
import { MAX_PCM_AUDIO_BYTES, type PcmAudio } from '../../contracts/sound.ts';

function snapshot(audio: PcmAudio): PcmAudio {
  if (!audio || !Number.isInteger(audio.sampleRate) || audio.sampleRate < 8000 || audio.sampleRate > 192000
    || !Array.isArray(audio.channels) || !audio.channels.length || audio.channels.length > 8)
    throw new Error('这份音频的采样率或声道暂不支持旋律识别。');
  const frames = audio.channels[0]?.length ?? 0;
  if (!frames || frames / audio.sampleRate > MAX_MELODY_INPUT_SECONDS || frames * audio.channels.length * 4 > MAX_PCM_AUDIO_BYTES)
    throw new Error('请使用不超过 30 秒的单人清唱或哼唱，不会自动截断原音频。');
  for (const channel of audio.channels) {
    if (!(channel instanceof Float32Array) || channel.length !== frames) throw new Error('音频声道数据不完整。');
    for (const value of channel) if (!Number.isFinite(value)) throw new Error('音频含有无法识别的数值。');
  }
  return { sampleRate: audio.sampleRate, channels: audio.channels.map(channel => new Float32Array(channel)) };
}

/** Each request owns its worker; cancellation terminates analysis without occupying the UI thread. */
export function createBrowserMelodyAnalyzer(createWorker: () => Worker = () => {
  if (typeof globalThis.Worker !== 'function') throw new Error('当前环境不支持后台旋律分析，请重新打开新版 RootSound。');
  return new Worker(new URL('./melody-worker.ts', import.meta.url), { type: 'module' });
}): MelodyAnalyzerPort & { dispose(): void } {
  let disposed = false;
  const requests = new Set<() => void>();
  return {
    async analyze(audio, options = {}) {
      if (disposed) throw new Error('旋律分析已经关闭。');
      if (options.signal?.aborted) throw new Error('旋律识别已取消。');
      const owned = snapshot(audio);
      return new Promise<MelodyAnalysis>((resolve, reject) => {
        let worker: Worker | undefined; let settled = false;
        function cleanup(): void {
          options.signal?.removeEventListener('abort', cancel); requests.delete(cancel);
          if (worker) { worker.onmessage = null; worker.onerror = null; worker.onmessageerror = null; worker.terminate(); }
        }
        function fail(error: unknown): void {
          if (settled) return; settled = true; cleanup(); reject(error instanceof Error ? error : new Error(String(error)));
        }
        function cancel(): void { fail(new Error('旋律识别已取消。')); }
        requests.add(cancel); options.signal?.addEventListener('abort', cancel, { once: true });
        try {
          worker = createWorker();
          if (settled) { worker.terminate(); return; }
          if (disposed || options.signal?.aborted) { cancel(); return; }
          worker.onerror = event => { event.preventDefault?.(); fail(new Error('后台旋律分析未能完成，请重试。')); };
          worker.onmessageerror = () => fail(new Error('后台旋律结果无法读取，请重试。'));
          worker.onmessage = event => {
            if (settled) return;
            const data = event.data as Record<string, unknown> | null;
            if (!data || typeof data !== 'object') { fail(new Error('后台旋律分析返回了无效结果。')); return; }
            if (data.type === 'progress' && typeof data.value === 'number' && Number.isFinite(data.value) && data.value >= 0 && data.value <= 1) {
              try { options.onProgress?.(data.value); } catch { /* Display errors do not interrupt analysis. */ }
            } else if (data.type === 'result' && data.analysis && typeof data.analysis === 'object') {
              settled = true; cleanup(); resolve(data.analysis as unknown as MelodyAnalysis);
            } else if (data.type === 'error' && typeof data.message === 'string') fail(new Error(data.message));
            else fail(new Error('后台旋律分析返回了无法识别的数据。'));
          };
          worker.postMessage({ type: 'analyze', audio: owned }, owned.channels.map(channel => channel.buffer as ArrayBuffer));
        } catch (error) { fail(error); }
      });
    },
    dispose() { if (disposed) return; disposed = true; for (const cancel of [...requests]) cancel(); },
  };
}
