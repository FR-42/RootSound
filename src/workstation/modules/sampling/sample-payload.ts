import { MAX_SAMPLE_FILE_BYTES } from '../../contracts/files.ts';
import type { SampleBody, SamplePayloadPort } from '../../contracts/sampling.ts';
import { decodeBase64 } from './audio.ts';

const HOST_ASSET_TOKEN = /^rootsound-payload:[a-f0-9]{32}:[a-f0-9]{64}$/u;

/** Validate only the small session reference; source bytes remain in native custody. */
export function validateHostAsset(token: unknown, byteLength: unknown): void {
  if (typeof token !== 'string' || token.length !== 115 || !HOST_ASSET_TOKEN.test(token)
    || !Number.isSafeInteger(byteLength) || typeof byteLength !== 'number'
    || byteLength < 1 || byteLength > MAX_SAMPLE_FILE_BYTES)
    throw new Error('采样的本机会话引用无效，原内容已保留。');
}

/** Resolve one source on explicit audition/open, never during metadata validation. */
export async function resolveSampleBytes(audio: SampleBody['audio'], payloads?: SamplePayloadPort): Promise<Uint8Array> {
  if (audio.encoding === 'base64') return decodeBase64(audio.data, audio.byteLength);
  if (audio.encoding !== 'host-asset') throw new Error('采样原文件的编码无效。');
  validateHostAsset(audio.data, audio.byteLength);
  if (!payloads) throw new Error('这份采样需要当前本机工程会话，请重新打开 RootSound 工程。');
  const loaded = await payloads.load(audio.data, audio.byteLength);
  if (!(loaded instanceof Uint8Array) || loaded.byteLength !== audio.byteLength)
    throw new Error('本机返回的采样内容不完整，尚未采用这份声音。');
  return new Uint8Array(loaded);
}
