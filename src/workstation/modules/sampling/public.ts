import type { ContentRecord, JsonValue, MaterialLibrary } from '../../contracts/content.ts';
import type { SampleFilesPort } from '../../contracts/files.ts';
import type { ReferenceAdapter } from '../../contracts/references.ts';
import { MAX_RECORDING_SECONDS, type SampleBody, type SampleCapturePort, type SampleDecoderPort, type SampleRecording, type SampleSummary, type SamplingPort, type SamplingView } from '../../contracts/sampling.ts';
import { MAX_PCM_AUDIO_BYTES, MAX_SAMPLE_DURATION_SECONDS, type PcmAudio } from '../../contracts/sound.ts';
import { checkSampleBytes, copyPcm, decodeBase64, encodeBase64, encodeFloatWav, waveform } from './audio.ts';

export { createBrowserSampleCapture, createBrowserSampleDecoder } from './browser.ts';
export { createSampleAudio } from './sample-audio.ts';
export type { SampleBody, SampleAudioPort, SampleCapturePort, SampleDecoderPort, SampleRecording, SampleSummary, SamplingPort, SamplingView } from '../../contracts/sampling.ts';

const KIND = 'rootsound.sample';
const OWNER = 'sampling';
function fail(message: string): never { throw new Error(message); }
function message(error: unknown): string { return error instanceof Error ? error.message : String(error); }
function object(value: unknown, allowed: string[], label: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value) || Object.keys(value).length !== allowed.length
    || allowed.some(key => !Object.hasOwn(value, key))) fail(`${label}包含缺失或暂不支持的设置，原内容已保留。`);
  return value as Record<string, unknown>;
}
function text(value: unknown, label: string, maximum = 4096): string {
  if (typeof value !== 'string' || !value.trim() || value.length > maximum) fail(`${label}不能为空或过长。`);
  return value;
}
export function readSampleBody(value: unknown): SampleBody {
  const body = object(value, ['model', 'version', 'source', 'audio', 'decoded'], '采样');
  if (body.model !== 'audio-sample' || body.version !== 1) fail('暂不支持这份采样的格式或版本。');
  const source = object(body.source, ['kind', 'name', 'mimeType'], '采样来源');
  if (source.kind !== 'file' && source.kind !== 'microphone') fail('采样来源无效。');
  const name = text(source.name, '原文件名称'); const mimeType = text(source.mimeType, '原文件类型', 256);
  const audio = object(body.audio, ['encoding', 'byteLength', 'data'], '采样原文件');
  if (audio.encoding !== 'base64' || typeof audio.data !== 'string' || typeof audio.byteLength !== 'number') fail('采样原文件的编码无效。');
  decodeBase64(audio.data, audio.byteLength);
  const decoded = object(body.decoded, ['sampleRate', 'channels', 'frames', 'durationSeconds'], '采样试听信息');
  const { sampleRate, channels, frames, durationSeconds } = decoded;
  if (typeof sampleRate !== 'number' || !Number.isInteger(sampleRate) || sampleRate < 8000 || sampleRate > 192000
    || typeof channels !== 'number' || !Number.isInteger(channels) || channels < 1 || channels > 8
    || typeof frames !== 'number' || !Number.isSafeInteger(frames) || frames < 1 || frames * channels * 4 > MAX_PCM_AUDIO_BYTES
    || typeof durationSeconds !== 'number' || !Number.isFinite(durationSeconds) || durationSeconds <= 0 || durationSeconds > MAX_SAMPLE_DURATION_SECONDS
    || Math.abs(frames / sampleRate - durationSeconds) > Math.max(1, durationSeconds) * 1e-12) fail('采样试听的声道、时钟或长度信息无效。');
  return { model: 'audio-sample', version: 1, source: { kind: source.kind, name, mimeType },
    audio: { encoding: 'base64', byteLength: audio.byteLength, data: audio.data }, decoded: { sampleRate, channels, frames, durationSeconds } };
}
export function createSampleReferenceAdapter(): ReferenceAdapter {
  function validate(record: ContentRecord): void {
    if (record.kind !== KIND || record.owner !== OWNER || record.schemaVersion !== 1 || record.dependencies.length) fail('这份内容不是当前支持的独立采样。');
    readSampleBody(record.body);
  }
  return { kind: KIND,
    slots(record) { validate(record as ContentRecord); return []; },
    validateTarget() { fail('原始采样没有下层素材引用。'); },
    replace(record, replacements) {
      validate(record as ContentRecord); if (replacements.length) fail('原始采样没有可替换的下层素材。');
      return { body: readSampleBody(record.body) as unknown as JsonValue, dependencies: [] };
    },
  };
}

type Pending = { audioToken: string; bytes: Uint8Array; audio: PcmAudio; waveform: number[]; source: SampleBody['source']; name: string; currentId?: string; savedName?: string; explicitName?: boolean };

/** Acquisition stays private until an explicit immutable save into the common library. */
export function createSampling(library: MaterialLibrary, options: { files: SampleFilesPort; decoder: SampleDecoderPort; capture: SampleCapturePort }): SamplingPort {
  let pending: Pending | undefined; let phase: SamplingView['phase'] = 'idle'; let problem: string | undefined;
  let generation = 0; let disposed = false; let elapsedSeconds = 0; let inputLevel = 0;
  let recording: SampleRecording | undefined; let processing: Promise<void> | undefined;
  let summaryToken: string | undefined; let summaries: SampleSummary[] = [];
  const summaryDetails = new Map<string, { revision: number; duration?: number }>();
  const listeners = new Set<() => void>();
  function notify(): void { if (!disposed) for (const listener of [...listeners]) { try { listener(); } catch { /* One display cannot interrupt acquisition or cleanup. */ } } }
  function active(token: number): boolean { return !disposed && token === generation; }
  function ensureLive(): void { if (disposed) fail('采样工作区已经关闭。'); }
  function abort(): void {
    generation++; const previous = recording; recording = undefined; processing = undefined;
    try { previous?.cancel(); } catch (error) { problem = message(error); }
    try { options.capture.cancel(); } catch (error) { problem = message(error); }
    phase = 'idle'; elapsedSeconds = 0; inputLevel = 0;
  }
  function begin(next: SamplingView['phase']): number {
    ensureLive(); abort(); problem = undefined; phase = next; const token = generation; notify(); return token;
  }
  function failed(token: number, error: unknown): void {
    if (!active(token)) return;
    phase = 'idle'; inputLevel = 0; problem = message(error); notify();
  }
  function prepared(bytes: Uint8Array, audio: PcmAudio, source: SampleBody['source'], name: string, saved?: ContentRecord): Pending {
    checkSampleBytes(bytes); const owned = copyPcm(audio);
    return { audioToken: crypto.randomUUID(), bytes: new Uint8Array(bytes), audio: owned, waveform: waveform(owned), source: { ...source }, name,
      ...(saved ? { currentId: saved.id, savedName: saved.name } : {}) };
  }
  function complete(token: number, next: Pending): void {
    if (!active(token)) return;
    pending = next; phase = 'idle'; problem = undefined; elapsedSeconds = 0; inputLevel = 0; notify();
  }
  function savedSummaries(): SampleSummary[] {
    const token = library.currentToken();
    if (summaryToken !== token) {
      summaries = library.listContentInfo().filter(record => record.kind === KIND).map(record => {
        let details = summaryDetails.get(record.id);
        if (details?.revision !== record.revision) {
          const body = library.readContent(record.id)!.body as unknown as { decoded?: { durationSeconds?: unknown } } | null;
          const duration = body && typeof body === 'object' ? body.decoded?.durationSeconds : undefined;
          details = { revision: record.revision, ...(typeof duration === 'number' ? { duration } : {}) }; summaryDetails.set(record.id, details);
        }
        const duration = details.duration;
        return { id: record.id, name: record.name, ...(typeof duration === 'number' && Number.isFinite(duration) && duration > 0 ? { durationSeconds: duration } : {}) };
      }); summaryToken = token;
    }
    return summaries.map(item => ({ ...item }));
  }
  async function savedAudio(id: string) {
    const record = library.readContent(id); if (!record || record.kind !== KIND || record.owner !== OWNER || record.schemaVersion !== 1 || record.dependencies.length) fail('找不到当前支持的已保存采样。');
    const body = readSampleBody(record.body); const bytes = decodeBase64(body.audio.data, body.audio.byteLength);
    const audio = await options.decoder.decode(new Uint8Array(bytes)); return { record, body, bytes, audio };
  }
  async function consume(recorder: SampleRecording, token: number): Promise<void> {
    try {
      const captured = await recorder.result; if (!active(token)) return;
      phase = 'processing'; notify(); if (!active(token)) return; const audio = copyPcm(captured);
      const bytes = encodeFloatWav(audio); const name = `录音 ${new Date().toLocaleString('zh-CN', { hour12: false })}`;
      complete(token, prepared(bytes, audio, { kind: 'microphone', name: `${name}.wav`, mimeType: 'audio/wav' }, name));
    } catch (error) { if (active(token)) { failed(token, error); throw error; } }
    finally { if (active(token) && recording === recorder) recording = undefined; }
  }
  const api: SamplingPort = {
    read() {
      const frames = pending?.audio.channels[0]?.length;
      return { phase, name: pending?.name ?? '', ...(pending?.currentId ? { currentId: pending.currentId } : {}),
        ...(pending ? { audioToken: pending.audioToken, sourceKind: pending.source.kind, durationSeconds: frames! / pending.audio.sampleRate,
          sampleRate: pending.audio.sampleRate, channelCount: pending.audio.channels.length } : {}),
        waveform: [...(pending?.waveform ?? [])], elapsedSeconds, inputLevel,
        changed: !!pending && (!pending.currentId || pending.name !== pending.savedName), savedSamples: savedSummaries(), ...(problem ? { problem } : {}) };
    },
    async importFile() {
      const token = begin('loading');
      try {
        if (!active(token)) return;
        const result = await options.files.open(); if (!active(token)) return;
        if (result.status === 'cancelled') { phase = 'idle'; notify(); return; }
        checkSampleBytes(result.bytes); const bytes = new Uint8Array(result.bytes);
        const sourceName = text(result.name, '原文件名称'); const mimeType = result.mimeType.trim() || 'application/octet-stream'; text(mimeType, '原文件类型', 256);
        const decoded = await options.decoder.decode(new Uint8Array(bytes)); if (!active(token)) return;
        complete(token, prepared(bytes, decoded, { kind: 'file', name: sourceName, mimeType }, sourceName));
      } catch (error) { if (active(token)) { failed(token, error); throw error; } }
    },
    async open(id) {
      const token = begin('loading');
      try {
        if (!active(token)) return;
        const result = await savedAudio(id); if (!active(token)) return;
        complete(token, prepared(result.bytes, result.audio, result.body.source, result.record.name, result.record));
      } catch (error) { if (active(token)) { failed(token, error); throw error; } }
    },
    async startRecording() {
      const token = begin('requesting');
      try {
        if (!active(token)) return;
        const recorder = await options.capture.start((seconds, level) => {
          if (!active(token)) return;
          if (Number.isFinite(seconds)) elapsedSeconds = Math.min(MAX_RECORDING_SECONDS, Math.max(0, seconds));
          if (Number.isFinite(level)) inputLevel = Math.min(1, Math.max(0, level)); notify();
        });
        if (!active(token)) { void recorder.result.catch(() => {}); recorder.cancel(); return; }
        recording = recorder; phase = 'recording'; processing = consume(recorder, token); void processing.catch(() => {}); notify();
      } catch (error) { if (active(token)) { failed(token, error); throw error; } }
    },
    async stopRecording() {
      ensureLive();
      if (phase === 'requesting') { api.cancelRecording(); return; }
      const job = processing;
      try { recording?.stop(); } catch (error) { abort(); problem = message(error); notify(); throw error; }
      if (job) await job;
    },
    cancelRecording() { abort(); notify(); },
    rename(name) {
      ensureLive(); if (!pending) fail('先导入或录下一段声音，再给它起名。');
      if (phase !== 'idle') fail('请先完成或取消当前采样获取。');
      pending.name = text(name.trim(), '采样名称'); pending.explicitName = true; problem = undefined; notify();
    },
    save() {
      ensureLive(); if (!pending) return fail('先导入或录下一段声音，再保存采样。');
      if (phase !== 'idle') return fail('请先完成或取消当前采样获取。');
      if (pending.currentId && pending.name === pending.savedName) {
        const existing = library.readContent(pending.currentId); if (existing) return existing;
      }
      const expectedToken = library.currentToken(); const frames = pending.audio.channels[0]!.length;
      const body: SampleBody = { model: 'audio-sample', version: 1, source: { ...pending.source },
        audio: { encoding: 'base64', byteLength: pending.bytes.byteLength, data: encodeBase64(pending.bytes) },
        decoded: { sampleRate: pending.audio.sampleRate, channels: pending.audio.channels.length, frames, durationSeconds: frames / pending.audio.sampleRate } };
      const record: ContentRecord = { id: crypto.randomUUID(), kind: KIND, owner: OWNER, schemaVersion: 1, name: pending.name, revision: 1, dependencies: [], body: body as unknown as JsonValue };
      const result = library.commitTransaction({ expectedToken, label: '保存原始采样', createContents: [record],
        ...(pending.explicitName ? { exactNameIds: [record.id] } : {}) });
      if (result.status !== 'committed') { const reason = result.status === 'conflict' ? result.reason : result.message; problem = reason; notify(); return fail(reason); }
      const committed = library.readContent(record.id)!;
      pending.currentId = committed.id; pending.name = committed.name; pending.savedName = committed.name; pending.explicitName = false;
      problem = undefined; notify(); return committed;
    },
    previewAudio() { ensureLive(); if (!pending) return fail('先导入或录下一段声音，再试听采样。'); return copyPcm(pending.audio); },
    async audioForSaved(id) { ensureLive(); const result = await savedAudio(id); ensureLive(); return copyPcm(result.audio); },
    leave() { abort(); notify(); },
    dispose() { if (disposed) return; abort(); disposed = true; pending = undefined; listeners.clear(); },
    subscribe(listener) { if (disposed) return () => {}; listeners.add(listener); try { listener(); } catch { /* Subscriber failure does not break its registration. */ } return () => { listeners.delete(listener); }; },
  };
  return api;
}
