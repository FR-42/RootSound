import { decodePcmWav } from '../sampling/audio.ts';
import { readPcmSnapshot } from '../sound-runtime/public.ts';

export function decodeBankSample(buffer: ArrayBuffer) {
  const pcm = decodePcmWav(new Uint8Array(buffer));
  if (!pcm) throw new Error('内置录音不是有效的 PCM WAV。');
  return readPcmSnapshot(pcm);
}

if (typeof globalThis.postMessage === 'function' && typeof globalThis.document === 'undefined') {
  globalThis.onmessage = (event: MessageEvent<{ id: number; buffer: ArrayBuffer }>) => {
    const { id, buffer } = event.data;
    try {
      const sample = decodeBankSample(buffer);
      globalThis.postMessage({ id, sample }, { transfer: sample.audio.channels.map(channel => channel.buffer as ArrayBuffer) });
    } catch (error) {
      globalThis.postMessage({ id, error: error instanceof Error ? error.message : String(error) });
    }
  };
}
