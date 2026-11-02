import type { SamplePayloadPort } from '../../contracts/sampling.ts';
import { MAX_SAMPLE_FILE_BYTES } from '../../contracts/files.ts';

const TOKEN = /^rootsound-payload:[a-f0-9]{32}:[a-f0-9]{64}$/u;

/** Only the trusted host resolves opaque session assets; paths never cross this API. */
export function createDesktopSamplePayloads(fetcher: typeof fetch = (...args) => fetch(...args)): SamplePayloadPort {
  return { async load(token, expectedBytes) {
    if (typeof token !== 'string' || token.length !== 115 || !TOKEN.test(token) || !Number.isSafeInteger(expectedBytes) || expectedBytes < 1 || expectedBytes > MAX_SAMPLE_FILE_BYTES)
      throw new Error('这份原始采样的引用或长度无效。');
    const response = await fetcher(`/__payload/${encodeURIComponent(token)}`, {
      cache: 'no-store', credentials: 'same-origin', redirect: 'error',
    });
    if (!response.ok || !response.body) throw new Error('无法读取这份原始采样，请重新打开歌曲后重试。');
    const declared = response.headers.get('Content-Length');
    if (declared !== null && (!/^\d+$/u.test(declared) || Number(declared) !== expectedBytes)) {
      await response.body.cancel();
      throw new Error('原始采样的长度与工程不一致，未采用这份声音。');
    }
    const bytes = new Uint8Array(expectedBytes);
    const reader = response.body.getReader(); let position = 0;
    try {
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        if (!(value instanceof Uint8Array) || position + value.byteLength > bytes.byteLength)
          throw new Error('原始采样超过约定长度，未采用这份声音。');
        bytes.set(value, position); position += value.byteLength;
      }
      if (position !== bytes.byteLength) throw new Error('原始采样未完整读入，请重新打开歌曲后重试。');
      return bytes;
    } catch (error) {
      try { await reader.cancel(); } catch { /* Keep the original read failure. */ }
      throw error;
    } finally { reader.releaseLock(); }
  } };
}
