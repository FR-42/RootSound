import type { ContentRecord, Draft, MaterialLibrary } from '../../contracts/content.ts';
import { MAX_MELODY_INPUT_SECONDS, type MelodyAnalysis, type MelodyAnalyzerPort, type MelodyRecognitionInput, type MelodyRecognitionPort, type MelodyRecognitionView } from '../../contracts/melody-recognition.ts';
import { MAX_PCM_AUDIO_BYTES, type PcmAudio, type SoundSequencePlan } from '../../contracts/sound.ts';
import { createMaterialLibrary } from '../materials/public.ts';
import { createTimbrePlayback, prepareBasicTimbre } from '../timbre/public.ts';
import { createPhrasePlayback, preparePhraseFromSeconds } from '../phrase/public.ts';

export { createBrowserMelodyAnalyzer } from './browser.ts';
export { analyzeMelody } from './analyze.ts';
export type { MelodyAnalysis, MelodyAnalyzerPort, MelodyRecognitionInput, MelodyRecognitionPort, MelodyRecognitionView, RecognizedNote } from '../../contracts/melody-recognition.ts';

function clone<T>(value: T): T { return JSON.parse(JSON.stringify(value)) as T; }
function fail(message: string): never { throw new Error(message); }
function message(error: unknown): string { return error instanceof Error ? error.message : String(error); }
function object(value: unknown, fields: string[], label: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value) || Object.keys(value).length !== fields.length
    || fields.some(field => !Object.hasOwn(value, field))) return fail(`${label}格式不完整或包含尚不支持的信息。`);
  return value as Record<string, unknown>;
}
function finite(value: unknown, min: number, max: number, label: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max) return fail(`${label}无效。`);
  return value;
}
function captureInput(input: MelodyRecognitionInput) {
  if (!input || typeof input.sourceToken !== 'string' || !input.sourceToken.trim() || input.sourceToken.length > 4096
    || typeof input.sourceName !== 'string' || !input.sourceName.trim() || input.sourceName.length > 4096) fail('先选好一段已完成的声音，再识别旋律。');
  const audio = input.audio;
  if (!audio || !Number.isInteger(audio.sampleRate) || audio.sampleRate < 8000 || audio.sampleRate > 192000
    || !Array.isArray(audio.channels) || audio.channels.length < 1 || audio.channels.length > 8) fail('这段声音不是支持的 PCM 音频。');
  const frames = audio.channels[0]?.length ?? 0; const durationSeconds = frames / audio.sampleRate;
  if (!frames || durationSeconds > MAX_MELODY_INPUT_SECONDS || frames * audio.channels.length * 4 > MAX_PCM_AUDIO_BYTES) fail('本轮旋律识别支持最长 30 秒的小段声音，请换一段较短的哼唱。');
  for (const channel of audio.channels) {
    if (!(channel instanceof Float32Array) || channel.length !== frames) fail('声音各声道的 PCM 长度不一致。');
    for (const value of channel) if (!Number.isFinite(value)) fail('声音包含无效的非有限数据。');
  }
  return { audio: { sampleRate: audio.sampleRate, channels: audio.channels.map(channel => new Float32Array(channel)) } satisfies PcmAudio,
    durationSeconds, channelCount: audio.channels.length, sourceToken: input.sourceToken, sourceName: input.sourceName.trim() };
}
function validateAnalysis(value: unknown, input: ReturnType<typeof captureInput>): MelodyAnalysis {
  const result = object(value, ['durationSeconds', 'channelIndex', 'notes', 'coverage', 'warnings'], '旋律识别结果');
  const durationSeconds = finite(result.durationSeconds, Number.MIN_VALUE, MAX_MELODY_INPUT_SECONDS, '识别时长');
  const epsilon = Number.EPSILON * Math.max(1, input.durationSeconds) * 32;
  if (Math.abs(durationSeconds - input.durationSeconds) > epsilon) fail('识别结果的时长与原声音不一致。');
  if (!Number.isInteger(result.channelIndex) || Number(result.channelIndex) < 0 || Number(result.channelIndex) >= input.channelCount) fail('识别结果的声道无效。');
  if (!Array.isArray(result.notes) || result.notes.length > 512) fail('识别音符数量超出当前支持范围。');
  if (!Array.isArray(result.warnings) || result.warnings.length > 64
    || result.warnings.some(item => typeof item !== 'string' || item.length > 2048)) fail('识别提示信息无效。');
  let previousEnd = 0; let voicedSeconds = 0;
  const notes = result.notes.map(raw => {
    const note = object(raw, ['startSeconds', 'durationSeconds', 'frequencyHz', 'velocity', 'confidence'], '识别音符');
    const startSeconds = finite(note.startSeconds, 0, durationSeconds, '音符开始时间');
    const length = finite(note.durationSeconds, 1 / 2048, durationSeconds, '音符持续时间');
    if (startSeconds < previousEnd - epsilon || startSeconds + length > durationSeconds + epsilon) fail('识别音符有重叠、顺序错误或超出原声音结尾。');
    previousEnd = startSeconds + length; voicedSeconds += length;
    return { startSeconds, durationSeconds: length, frequencyHz: finite(note.frequencyHz, 20, 5000, '识别音高'),
      velocity: finite(note.velocity, 0, 1, '识别力度'), confidence: finite(note.confidence, 0, 1, '识别可信度') };
  });
  const coverage = finite(result.coverage, 0, 1, '旋律覆盖比例');
  if (Math.abs(coverage - voicedSeconds / durationSeconds) > 1e-8) fail('识别结果的音符时长与覆盖比例不一致。');
  if (!notes.length) fail('暂时没有找到清晰的单人旋律，请换一段更清楚的哼唱再试。');
  return { durationSeconds, channelIndex: Number(result.channelIndex), notes, coverage, warnings: [...result.warnings] as string[] };
}

/** Analysis is temporary; only an explicit, repeat-safe confirmation publishes musical material. */
export function createMelodyRecognition(library: MaterialLibrary, options: { analyzer: MelodyAnalyzerPort; currentSourceToken: () => string | undefined }): MelodyRecognitionPort {
  let phase: MelodyRecognitionView['phase'] = 'idle'; let progress = 0; let sourceName: string | undefined;
  let sourceToken: string | undefined; let result: MelodyAnalysis | undefined; let problem: string | undefined;
  let graph: { timbre: ContentRecord; phrase: ContentRecord } | undefined;
  let adopted: { contentId: string; draftId: string } | undefined;
  let generation = 0; let abort: AbortController | undefined; let disposed = false;
  const listeners = new Set<() => void>();
  function notify(): void { if (!disposed) for (const listener of [...listeners]) { try { listener(); } catch { /* Display failures cannot publish or corrupt music. */ } } }
  function ensureLive(): void { if (disposed) fail('旋律识别已经关闭。'); }
  function currentSource(): string | undefined { try { return options.currentSourceToken(); } catch { return undefined; } }
  function reset(error?: string): void {
    generation++; abort?.abort(); abort = undefined; phase = 'idle'; progress = 0;
    sourceName = undefined; sourceToken = undefined; result = undefined; graph = undefined; adopted = undefined; problem = error;
  }
  function synchronize(): boolean {
    if (sourceToken !== undefined && currentSource() !== sourceToken) {
      reset('声音来源已改变，请重新识别当前声音。'); notify(); return false;
    }
    return true;
  }
  function ready() {
    ensureLive(); if (!synchronize()) fail('声音来源已改变，请重新识别当前声音。');
    if (phase !== 'ready' || !graph || !result) return fail('先识别并试听一段清楚的旋律，再采用结果。');
    return graph;
  }
  function plan(candidate: { timbre: ContentRecord; phrase: ContentRecord }): SoundSequencePlan {
    const memory = createMaterialLibrary({ read: () => JSON.stringify({ format: 'RootSoundMaterialLibrary', version: 1,
      contents: [candidate.timbre, candidate.phrase], drafts: [] }), write() { fail('旋律预览不能改动素材库。'); } });
    return createPhrasePlayback(memory, createTimbrePlayback(memory)).planForSaved(candidate.phrase.id);
  }
  return {
    read() {
      synchronize(); return { phase, progress, ...(sourceName ? { sourceName } : {}), ...(result ? { result: clone(result) } : {}),
        ...(problem ? { problem } : {}), ...(adopted ? { adopted: { ...adopted } } : {}) };
    },
    async analyze(input) {
      ensureLive(); synchronize(); const snapshot = captureInput(input);
      if (currentSource() !== snapshot.sourceToken) fail('声音来源已改变，请重新选好声音后再识别。');
      reset(); sourceName = snapshot.sourceName; sourceToken = snapshot.sourceToken; phase = 'analyzing'; abort = new AbortController();
      const signal = abort.signal; const token = generation; notify();
      if (disposed || token !== generation || !synchronize()) return;
      try {
        const recognized = await options.analyzer.analyze(snapshot.audio, { signal, onProgress(value) {
          if (disposed || token !== generation || !synchronize() || !Number.isFinite(value)) return;
          progress = Math.max(progress, Math.min(1, Math.max(0, value))); notify();
        } });
        if (disposed || token !== generation || !synchronize()) return;
        const checked = validateAnalysis(recognized, snapshot);
        const timbre = prepareBasicTimbre('识别旋律的声音');
        const phrase = preparePhraseFromSeconds({ name: `${snapshot.sourceName.slice(0, 240)} · 旋律`, timbreId: timbre.id,
          durationSeconds: checked.durationSeconds, notes: checked.notes.map(note => ({ startSeconds: note.startSeconds,
            durationSeconds: note.durationSeconds, frequencyHz: note.frequencyHz, velocity: note.velocity })) });
        const candidate = { timbre, phrase }; plan(candidate);
        graph = candidate; result = checked; progress = 1; phase = 'ready'; abort = undefined; notify();
      } catch (error) {
        if (disposed || token !== generation || !synchronize()) return;
        phase = 'idle'; progress = 0; abort = undefined; problem = message(error); notify(); throw error;
      }
    },
    previewPlan() { return plan(ready()); },
    adopt(name) {
      const candidate = ready();
      if (adopted) {
        const content = library.readContent(adopted.contentId); const draft = library.readDraft(adopted.draftId);
        if (!content || !draft) return fail('已采用的乐句已被移动，请从素材库打开或重新识别。');
        return { content, draft };
      }
      const title = name === undefined ? candidate.phrase.name : name.trim();
      if (!title || title.length > 4096) return fail('请给要采用的乐句起一个有效名称。');
      const content: ContentRecord = { ...clone(candidate.phrase), name: title };
      const { id, revision, ...fields } = content;
      const draft: Draft = { ...clone(fields), id: crypto.randomUUID(), sourceId: id, baseRevision: revision };
      const expectedToken = library.currentToken();
      const commit = library.commitTransaction({ expectedToken, label: '采用识别旋律', createContents: [candidate.timbre, content], createDrafts: [draft],
        ...(name === undefined ? {} : { exactNameIds: [content.id] }) });
      if (commit.status !== 'committed') { const error = commit.status === 'conflict' ? commit.reason : commit.message; problem = error; notify(); return fail(error); }
      adopted = { contentId: content.id, draftId: draft.id }; problem = undefined; notify();
      return { content: library.readContent(content.id)!, draft: library.readDraft(draft.id)! };
    },
    cancel() { if (disposed) return; reset(); notify(); },
    dispose() {
      if (disposed) return; reset(); disposed = true; listeners.clear();
      try { options.analyzer.dispose?.(); } catch { /* Closing a worker must not interrupt application cleanup. */ }
    },
    subscribe(listener) { if (disposed) return () => {}; listeners.add(listener); try { listener(); } catch { /* Keep observer failures isolated. */ } return () => { listeners.delete(listener); }; },
  };
}
