import type { PcmAudio, SampleSoundPlan, SoundPlan } from '../../contracts/sound.ts';
import type { SpectralPatch, SpectralTimbreBody } from '../../contracts/timbre.ts';
import { SPECTRAL_SAMPLE_RATE, MAX_SPECTRAL_CACHE_BYTES, readSpectralTimbreBody, spectralRenderShape } from './spectral-model.ts';
export { readSpectralPatch, spectralTimbreBody, readSpectralTimbreBody, spectralTailSeconds } from './spectral-model.ts';
type Note = SoundPlan['note'];

export type SpectralWorkerFactory = () => Worker;
type Prepared = { key: string; sourceId: string; audio: PcmAudio; bytes: number; tailSeconds: number };
export type SpectralAudio = { prepare(body: SpectralTimbreBody, notes: readonly Note[]): Promise<void>; plan(body: SpectralTimbreBody, note: Note): SampleSoundPlan };
let cacheSequence = 0;
/** DSP never runs on the UI thread. The complete requested working set must fit before rendering. */
export function createSpectralAudio(createWorker: SpectralWorkerFactory = () => {
  if (typeof Worker !== 'function') throw new Error('当前环境不支持后台精细音色准备，请使用新版RootSound桌面程序。');
  return new Worker(new URL('./spectral-worker.ts', import.meta.url), { type: 'module' });
}): SpectralAudio {
  const instance = ++cacheSequence; let serial = 0; let bytes = 0; let draining = false;
  const cache = new Map<string, Prepared>();
  const patchKeys = new WeakMap<SpectralPatch, string>();
  const pending: { body: SpectralTimbreBody; notes: readonly Note[]; resolve(): void; reject(error: unknown): void }[] = [];
  const keyFor = (body: SpectralTimbreBody, note: Note) => {
    let patch = patchKeys.get(body.patch);
    if (!patch) { patch = JSON.stringify(body.patch); patchKeys.set(body.patch, patch); }
    return patch + '\0' + JSON.stringify([note.frequencyHz, note.holdSeconds, note.velocity]);
  };
  const ready = (key: string) => { const entry = cache.get(key); if (entry) { cache.delete(key); cache.set(key, entry); } return entry; };
  async function group(requests: typeof pending): Promise<void> {
    const wanted = new Map<string, { patch: SpectralPatch; note: Note; shape: ReturnType<typeof spectralRenderShape> }>();
    let required = 0;
    for (const request of requests) for (const note of request.notes) {
      const key = keyFor(request.body, note);
      if (!wanted.has(key)) {
        const shape = spectralRenderShape(request.body.patch, note); required += shape.bytes;
        if (required > MAX_SPECTRAL_CACHE_BYTES) throw new Error('这组精细音色连同完整尾音超过128 MiB准备容量，请减少不同音符或分段使用；没有截断声音。');
        wanted.set(key, { patch: request.body.patch, note: { ...note }, shape });
      }
    }
    const jobs = [...wanted].filter(([key]) => !ready(key));
    let missingBytes = jobs.reduce((sum, [, item]) => sum + item.shape.bytes, 0);
    for (const [key, old] of cache) {
      if (bytes + missingBytes <= MAX_SPECTRAL_CACHE_BYTES) break;
      if (!wanted.has(key)) { cache.delete(key); bytes -= old.bytes; }
    }
    if (!jobs.length) return;
    await new Promise<void>((resolve, reject) => {
      let worker: Worker | undefined; let settled = false; const remaining = new Set(jobs.map(([key]) => key));
      const timer = setTimeout(() => fail(new Error('精细音色准备超时，请减少音符或分段重试。')), 300000);
      function cleanup() { clearTimeout(timer); if (worker) { worker.onmessage = null; worker.onerror = null; worker.onmessageerror = null; worker.terminate(); } }
      function fail(error: unknown) { if (!settled) { settled = true; cleanup(); reject(error); } }
      try {
        worker = createWorker();
        worker.onerror = event => { event.preventDefault?.(); fail(new Error('后台精细音色计算失败，请重试。')); };
        worker.onmessageerror = () => fail(new Error('后台精细音色返回了损坏的数据。'));
        worker.onmessage = event => {
          if (settled) return;
          const result = event.data as { type?: string; key?: string; left?: Float32Array; right?: Float32Array; message?: string };
          if (result?.type === 'error') { fail(new Error(result.message ?? '精细音色计算失败。')); return; }
          const item = result?.key ? wanted.get(result.key) : undefined;
          if (result?.type !== 'rendered' || !result.key || !remaining.delete(result.key) || !item
            || !(result.left instanceof Float32Array) || !(result.right instanceof Float32Array)
            || result.left.length !== item.shape.frames || result.right.length !== item.shape.frames) { fail(new Error('后台精细音色返回了不完整的声音。')); return; }
          const entry: Prepared = { key: result.key, sourceId: 'spectral-' + instance + '-' + ++serial,
            audio: { sampleRate: SPECTRAL_SAMPLE_RATE, channels: [result.left, result.right] }, bytes: item.shape.bytes,
            tailSeconds: item.shape.frames / SPECTRAL_SAMPLE_RATE - item.note.holdSeconds };
          cache.set(result.key, entry); bytes += entry.bytes; missingBytes -= entry.bytes;
          if (!remaining.size) { settled = true; cleanup(); resolve(); }
        };
        worker.postMessage({ type: 'render', jobs: jobs.map(([key, item]) => ({ key, patch: item.patch, note: item.note })) });
      } catch (error) { fail(error); }
    });
  }
  async function drain() {
    while (pending.length) {
      const batch = pending.splice(0);
      try { await group(batch); for (const request of batch) request.resolve(); }
      catch (error) { for (const request of batch) request.reject(error); }
      // Fulfilled callers must compile their plans before a later queued batch
      // can evict their working set. A task turn drains every Promise.all chain.
      if (pending.length) await new Promise<void>(resolve => setTimeout(resolve, 0));
    }
    draining = false;
  }
  return {
    prepare(body, notes) {
      if (!Array.isArray(notes) || notes.length > 50000) return Promise.reject(new Error('精细音色准备的音符列表无效或过长。'));
      const ownedBody = readSpectralTimbreBody(body);
      return new Promise<void>((resolve, reject) => {
        pending.push({ body: ownedBody, notes: notes.map(note => ({ ...note })), resolve, reject });
        if (!draining) { draining = true; queueMicrotask(() => { void drain(); }); }
      });
    },
    plan(body, note) {
      const shape = spectralRenderShape(body.patch, note); const entry = ready(keyFor(body, note));
      if (!entry) throw new Error('这个精细音符尚未在后台准备，请先等待音色载入。');
      return { kind: 'sample', version: 1, source: { id: entry.sourceId, revision: 1, audio: entry.audio },
        startSeconds: 0, endSeconds: shape.frames / SPECTRAL_SAMPLE_RATE, playbackRate: 1,
        envelope: { attackSeconds: 0, releaseSeconds: entry.tailSeconds }, envelopeBaked: true, note: { ...note, velocity: 1 },
        level: 1 };
    },
  };
}
