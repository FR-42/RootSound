import { analyzeMelody } from './analyze.ts';
import type { PcmAudio } from '../../contracts/sound.ts';

const scope = globalThis as unknown as {
  onmessage: ((event: MessageEvent<{ type: string; audio: PcmAudio }>) => void) | null;
  postMessage(message: unknown): void;
};
let running = false;
scope.onmessage = async event => {
  if (running || event.data?.type !== 'analyze') { scope.postMessage({ type: 'error', message: '旋律分析请求无效。' }); return; }
  running = true;
  try {
    const analysis = await analyzeMelody(event.data.audio, { onProgress(value) { scope.postMessage({ type: 'progress', value }); } });
    scope.postMessage({ type: 'result', analysis });
  } catch (error) { scope.postMessage({ type: 'error', message: error instanceof Error ? error.message : String(error) }); }
};
