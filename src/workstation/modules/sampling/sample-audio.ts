import type { MaterialLibrary } from '../../contracts/content.ts';
import type { SampleAudioPort, SampleBody, SampleDecoderPort } from '../../contracts/sampling.ts';
import { readSampleBody } from './public.ts';
import { copyPcm, decodeBase64, waveform } from './audio.ts';

import { MAX_SEQUENCE_PCM_BYTES } from '../../contracts/playback-limits.ts';
const MAX_PREPARED_BYTES = MAX_SEQUENCE_PCM_BYTES;

/** Original files decode once per identity/revision; callers borrow prepared, read-only audio. */
export function createSampleAudio(library: MaterialLibrary, decoder: SampleDecoderPort): SampleAudioPort {
  type Prepared = ReturnType<SampleAudioPort['readPrepared']>;
  type Header = { id: string; revision: number; decoded: SampleBody['decoded']; bytes: number };
  const cache = new Map<string, { token: string; bytes: number; value: Prepared }>();
  const headers = new Map<string, Header>();
  let cacheBytes = 0;
  const requests: { ids: readonly string[]; resolve: () => void; reject: (error: unknown) => void }[] = [];
  let draining = false;
  function info(id: string) {
    const record = library.readContentInfo(id);
    if (!record || record.kind !== 'rootsound.sample' || record.owner !== 'sampling' || record.schemaVersion !== 1 || record.dependencies.length) throw new Error('找不到当前支持的原始采样。');
    return record;
  }
  function forget(id: string): void {
    const old = cache.get(id); if (old) cacheBytes -= old.bytes; cache.delete(id);
  }
  function ready(id: string): Prepared | undefined {
    const cached = cache.get(id); if (!cached) return undefined;
    if (cached.token !== library.currentToken()) {
      let revision: number | undefined;
      try { revision = info(id).revision; } catch { forget(id); return undefined; }
      if (revision !== cached.value.revision) { forget(id); return undefined; }
      cached.token = library.currentToken();
    }
    cache.delete(id); cache.set(id, cached); return cached.value;
  }
  function header(id: string): Header {
    const current = info(id); const old = headers.get(id); if (old?.revision === current.revision) return old;
    const record = library.readContent(id)!; const body = readSampleBody(record.body);
    const next = { id, revision: current.revision, decoded: body.decoded, bytes: body.decoded.frames * body.decoded.channels * 4 };
    headers.set(id, next); return next;
  }
  async function prepareGroup(ids: readonly string[]): Promise<void> {
    const group = [...new Set(ids)].map(header); const pinned = new Set(group.map(item => item.id));
    const required = group.reduce((sum, item) => sum + item.bytes, 0);
    if (required > MAX_PREPARED_BYTES) throw new Error('这组声音解码后超过当前 512 MiB 试听容量，请减少同时使用的原始采样。');
    for (const item of group) ready(item.id);
    const missingBytes = group.reduce((sum, item) => sum + (cache.has(item.id) ? 0 : item.bytes), 0);
    for (const [id] of cache) {
      if (cacheBytes + missingBytes <= MAX_PREPARED_BYTES) break;
      if (!pinned.has(id)) forget(id);
    }
    for (const item of group) {
      if (ready(item.id)) continue;
      const record = library.readContent(item.id);
      if (!record || record.revision !== item.revision) throw new Error('原始采样已发生变化，请重新准备声音。');
      const body = readSampleBody(record.body);
      const audio = copyPcm(await decoder.decode(decodeBase64(body.audio.data, body.audio.byteLength)));
      if (info(item.id).revision !== item.revision) throw new Error('解码期间原始采样发生变化，请重试。');
      if (audio.sampleRate !== item.decoded.sampleRate || audio.channels.length !== item.decoded.channels || audio.channels[0]!.length !== item.decoded.frames) throw new Error('解码结果与原始采样记录不一致，未采用这份声音。');
      const value: Prepared = Object.freeze({ id: item.id, revision: item.revision,
        audio: Object.freeze({ sampleRate: audio.sampleRate, channels: Object.freeze([...audio.channels]) }), waveform: Object.freeze(waveform(audio)) });
      forget(item.id); cache.set(item.id, { token: library.currentToken(), bytes: item.bytes, value }); cacheBytes += item.bytes;
    }
    for (const item of group) if (info(item.id).revision !== item.revision || !ready(item.id)) throw new Error('准备期间原始采样发生变化，请重新试听。');
  }
  async function drain(): Promise<void> {
    while (requests.length) {
      // One song's parallel owner calls form one pinned working set, never partial playback.
      const batch = requests.splice(0); const ids = batch.flatMap(request => [...request.ids]);
      try { await prepareGroup(ids); for (const request of batch) request.resolve(); }
      catch (error) { for (const request of batch) request.reject(error); }
    }
    draining = false;
  }
  return {
    prepare(ids) {
      if (!Array.isArray(ids) || ids.length > 8192 || ids.some(id => typeof id !== 'string' || !id.trim())) return Promise.reject(new Error('准备的采样列表无效或过长。'));
      return new Promise<void>((resolve, reject) => {
        requests.push({ ids: [...ids], resolve, reject });
        if (!draining) { draining = true; queueMicrotask(() => { void drain(); }); }
      });
    },
    readPrepared(id) { const found = ready(id); if (!found) throw new Error('采样尚未准备，请先等待声音载入后再试听。'); return found; },
  };
}
