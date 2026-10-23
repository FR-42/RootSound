import type { BasicWaveform, PcmAudio, SampleSoundPlan, SoundPlan } from '../../contracts/sound.ts';
import type { OutputProcessingPlan } from '../../contracts/post-production.ts';
import { pcmShape, readPcmSnapshot, samePcm, type PcmSnapshot } from './pcm.ts';

const WAVEFORMS: readonly BasicWaveform[] = ['sine', 'triangle', 'sawtooth', 'square', 'noise'];
const MAX_SOURCES = 8;
const MAX_EVENTS = 2048;
const MAX_SIMULTANEOUS_SOURCES = 256;
const MAX_PLAN_PCM_BYTES = 128 * 1024 * 1024;

export type SampleSourceSnapshot = SampleSoundPlan['source'] & {
  readonly key: string;
  readonly peak: number;
  readonly hash: string;
};
export type ScheduledSound = SoundPlan | (Omit<SampleSoundPlan, 'source'> & { source: SampleSourceSnapshot });

export interface ScheduledPreview {
  readonly events: readonly { atSeconds: number; sound: ScheduledSound; pan?: number }[];
  readonly durationSeconds: number;
  readonly normalization: number;
  readonly sequence: boolean;
  readonly samples: readonly SampleSourceSnapshot[];
  readonly output?: OutputProcessingPlan;
}

function object(value: unknown, label: string): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error(`${label}必须是有效对象。`);
  }
  return value as Record<string, unknown>;
}

function number(value: unknown, label: string, minimum: number, maximum: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < minimum || value > maximum) {
    throw new Error(`${label}必须是 ${minimum} 至 ${maximum} 之间的有限数值。`);
  }
  return value;
}

function fields(value: Record<string, unknown>, allowed: readonly string[], label: string): void {
  const unsupported = Object.keys(value).find(key => !allowed.includes(key));
  if (unsupported !== undefined) throw new Error(`${label}包含当前执行器不支持的内容：${unsupported}。`);
}

/** Adapter limits, not restrictions on future RootSound content formats. */
function readPlan(value: unknown, readSample: (value: unknown) => SampleSourceSnapshot): ScheduledSound {
  const plan = object(value, '声音执行计划');
  if (plan.kind === 'sample' && plan.version === 1) {
    fields(plan, ['kind', 'version', 'source', 'startSeconds', 'endSeconds', 'playbackRate', 'envelope', 'note', 'level', 'loop'], '采样声音执行计划');
    const source = readSample(plan.source); const duration = source.audio.channels[0]!.length / source.audio.sampleRate;
    const startSeconds = number(plan.startSeconds, '采样开始位置', 0, duration);
    const endSeconds = number(plan.endSeconds, '采样结束位置', 0, duration);
    if (endSeconds <= startSeconds) throw new Error('采样的结束位置需要晚于开始位置。');
    let loop: SampleSoundPlan['loop'];
    if (plan.loop !== undefined) {
      const value = object(plan.loop, '循环范围'); fields(value, ['startSeconds', 'endSeconds'], '循环范围');
      loop = { startSeconds: number(value.startSeconds, '循环开始', startSeconds, endSeconds), endSeconds: number(value.endSeconds, '循环结束', startSeconds, endSeconds) };
      if (loop.endSeconds <= loop.startSeconds) throw new Error('循环结束需要晚于循环开始。');
    }
    const common = readControls(plan);
    return { kind: 'sample', version: 1, source, startSeconds, endSeconds,
      playbackRate: number(plan.playbackRate, '采样播放倍率', 1 / 256, 256), ...common, ...(loop ? { loop } : {}) };
  }
  if (plan.kind !== 'basic-synth' || plan.version !== 1) {
    throw new Error('当前声音运行仅支持第 1 版基础合成计划。');
  }
  fields(plan, ['kind', 'version', 'sources', 'envelope', 'note', 'level', 'filter', 'pitch'], '声音执行计划');
  if (!Array.isArray(plan.sources) || plan.sources.length < 1 || plan.sources.length > MAX_SOURCES) {
    throw new Error(`当前试听需要 1 至 ${MAX_SOURCES} 个波形声源。`);
  }
  const sources = Array.from(plan.sources, (raw: unknown) => {
    const source = object(raw, '波形声源');
    fields(source, ['waveform', 'frequencyRatio', 'level'], '波形声源');
    if (!WAVEFORMS.includes(source.waveform as BasicWaveform)) {
      throw new Error('当前声音运行不支持这个波形。');
    }
    return {
      waveform: source.waveform as BasicWaveform,
      frequencyRatio: number(source.frequencyRatio, '频率倍率', 0.001, 64),
      level: number(source.level, '声源音量', 0, 1),
    };
  });
  if (sources.reduce((sum, source) => sum + source.level, 0) > 1 + 1e-12) {
    throw new Error('声源音量之和不能超过 1，请先降低音量。');
  }
  let filter: SoundPlan['filter']; let pitch: SoundPlan['pitch'];
  if (plan.filter !== undefined) {
    const value = object(plan.filter, '声音明暗'); fields(value, ['type', 'frequencyHz', 'resonance'], '声音明暗');
    if (!['lowpass', 'highpass', 'bandpass'].includes(String(value.type))) throw new Error('不支持这个声音明暗处理方式。');
    filter = { type: value.type as NonNullable<SoundPlan['filter']>['type'], frequencyHz: number(value.frequencyHz, '滤波频率', 20, 20000), resonance: number(value.resonance, '共鸣', 0, 8) };
  }
  if (plan.pitch !== undefined) {
    const value = object(plan.pitch, '音高变化'); fields(value, ['semitones', 'seconds'], '音高变化');
    pitch = { semitones: number(value.semitones, '起始音高变化', -48, 48), seconds: number(value.seconds, '音高回落时间', .005, 5) };
  }
  return { kind: 'basic-synth', version: 1, sources, ...readControls(plan), ...(filter ? { filter } : {}), ...(pitch ? { pitch } : {}) };
}

function readControls(plan: Record<string, unknown>): Pick<SoundPlan, 'envelope' | 'note' | 'level'> {
  const envelope = object(plan.envelope, '音量变化');
  const note = object(plan.note, '试听音符');
  fields(envelope, ['attackSeconds', 'releaseSeconds', 'decaySeconds', 'sustain'], '音量变化');
  fields(note, ['frequencyHz', 'holdSeconds', 'velocity'], '试听音符');
  const attackSeconds = number(envelope.attackSeconds, '起音时间（秒）', 0, 10);
  const releaseSeconds = number(envelope.releaseSeconds, '收音时间（秒）', 0, 10);
  const holdSeconds = number(note.holdSeconds, '持续时间（秒）', 0.0001, 120);
  return {
    envelope: { attackSeconds, releaseSeconds,
      ...(envelope.decaySeconds !== undefined || envelope.sustain !== undefined ? { decaySeconds: number(envelope.decaySeconds, '回落时间', 0, 10), sustain: number(envelope.sustain, '保持音量', 0, 1) } : {}) },
    note: {
      frequencyHz: number(note.frequencyHz, '音符频率（Hz）', 1, 20000),
      holdSeconds,
      velocity: number(note.velocity, '音符力度', 0, 1),
    },
    level: number(plan.level, '试听总音量', 0, 1),
  };
}

export function noteDuration(sound: ScheduledSound): number {
  const envelope = sound.note.holdSeconds + sound.envelope.releaseSeconds;
  return sound.kind === 'sample' && !sound.loop ? Math.min(envelope, (sound.endSeconds - sound.startSeconds) / sound.playbackRate) : envelope;
}

function sourceReader(previous?: ScheduledPreview): { read(value: unknown): SampleSourceSnapshot; sources: SampleSourceSnapshot[] } {
  const sources: SampleSourceSnapshot[] = []; const identities = new Map<string, { input: PcmAudio; source: SampleSourceSnapshot }>();
  const snapshots = new WeakMap<PcmAudio, PcmSnapshot>(); const counted = new Set<PcmAudio>(); let totalBytes = 0;
  const previousSources = new Map(previous?.samples.map(source => [JSON.stringify([source.id, source.revision]), source]));
  return { sources, read(value) {
    const source = object(value, '采样声源'); fields(source, ['id', 'revision', 'audio'], '采样声源');
    if (typeof source.id !== 'string' || !source.id.trim() || source.id.length > 4096 || !Number.isSafeInteger(source.revision) || (source.revision as number) < 1) throw new Error('采样声源的身份或版本无效。');
    const audio = source.audio as PcmAudio; const shape = pcmShape(audio); const identity = JSON.stringify([source.id, source.revision]);
    const existing = identities.get(identity);
    if (existing) {
      if (existing.input !== audio && !samePcm(audio, existing.source.audio)) throw new Error('同一个采样声源版本包含不同的声音内容，请重新生成播放计划。');
      return existing.source;
    }
    let snapshot = snapshots.get(audio);
    if (!snapshot) {
      const reusable = previousSources.get(identity);
      if (reusable && samePcm(audio, reusable.audio)) snapshot = { audio: reusable.audio, bytes: shape.bytes, peak: reusable.peak, hash: reusable.hash };
      else {
        if (totalBytes + shape.bytes > MAX_PLAN_PCM_BYTES) throw new Error('这段乐曲的独立采样合计超出当前 128 MiB 执行范围，请减少同时载入的素材。');
        snapshot = readPcmSnapshot(audio);
      }
      snapshots.set(audio, snapshot);
    }
    if (!counted.has(snapshot.audio)) {
      if (totalBytes + snapshot.bytes > MAX_PLAN_PCM_BYTES) throw new Error('这段乐曲的独立采样合计超出当前 128 MiB 执行范围，请减少同时载入的素材。');
      counted.add(snapshot.audio); totalBytes += snapshot.bytes;
    }
    const result: SampleSourceSnapshot = { id: source.id, revision: source.revision as number, audio: snapshot.audio, peak: snapshot.peak, hash: snapshot.hash,
      key: JSON.stringify([source.id, source.revision, snapshot.audio.sampleRate, snapshot.audio.channels.length, shape.frames, snapshot.hash]) };
    identities.set(identity, { input: audio, source: result }); sources.push(result); return result;
  } };
}

/** Only small note parameters and complete-source digests enter live-edit comparisons. */
export function previewFingerprint(preview: ScheduledPreview): string {
  return JSON.stringify({ durationSeconds: preview.durationSeconds, normalization: preview.normalization, sequence: preview.sequence, output: preview.output,
    events: preview.events.map(event => ({ ...event, sound: event.sound.kind === 'sample' ? { ...event.sound, source: event.sound.source.key } : event.sound })) });
}

export function samePreviewSamples(left: ScheduledPreview | undefined, right: ScheduledPreview): boolean {
  if (!left || left.samples.length !== right.samples.length) return false;
  const byKey = new Map(left.samples.map(sample => [sample.key, sample]));
  return right.samples.every(sample => { const previous = byKey.get(sample.key); return previous !== undefined && (previous.audio === sample.audio || samePcm(previous.audio, sample.audio)); });
}

function samplePeak(sound: Extract<ScheduledSound, { kind: 'sample' }>, pan = 0): number {
  const channels = sound.source.audio.channels.length;
  if (channels === 1) return sound.source.peak;
  if (channels === 2) {
    // StereoPanner combines the two channels towards a fully panned side.
    // At the centre neither channel is added to the other.
    return sound.source.peak * (pan <= 0 ? 1 + Math.cos((pan + 1) * Math.PI / 2) : 1 + Math.sin(pan * Math.PI / 2));
  }
  // WebAudio's speaker downmix can add centre/surround contributions before
  // panning. Channel-count × input peak conservatively bounds all 3–8ch cases.
  return sound.source.peak * channels;
}

export function readPreview(value: unknown, options: { allowEmptySequence?: boolean; previous?: ScheduledPreview } = {}): ScheduledPreview {
  const input = object(value, '声音执行计划');
  const sampleReader = sourceReader(options.previous);
  if (input.kind !== 'sequence') {
    const sound = readPlan(input, sampleReader.read);
    return {
      events: [{ atSeconds: 0, sound }],
      durationSeconds: noteDuration(sound),
      normalization: sound.kind === 'sample' ? 1 / Math.max(1, sound.level * sound.note.velocity * samplePeak(sound)) : 1,
      sequence: false,
      samples: sampleReader.sources,
    };
  }
  if (input.version !== 1) throw new Error('当前声音运行仅支持第 1 版乐句试听计划。');
  fields(input, ['kind', 'version', 'durationSeconds', 'events', 'output'], '乐句试听计划');
  let output: OutputProcessingPlan | undefined;
  if (input.output !== undefined) {
    const settings = object(input.output, '输出处理'); fields(settings, ['level', 'fadeInSeconds', 'fadeOutSeconds'], '输出处理');
    output = { level: number(settings.level, '总输出音量', 0, 1), fadeInSeconds: number(settings.fadeInSeconds, '淡入秒数', 0, 30),
      fadeOutSeconds: number(settings.fadeOutSeconds, '淡出秒数', 0, 30) };
  }
  const duration = number(input.durationSeconds, '乐句时长（秒）', 0.0001, 600);
  if (!Array.isArray(input.events) || (input.events.length < 1 && !options.allowEmptySequence) || input.events.length > MAX_EVENTS) {
    throw new Error(`乐句试听需要 1 至 ${MAX_EVENTS} 个音符，空乐句暂时无法试听。`);
  }
  let durationSeconds = duration;
  const boundaries: { time: number; amplitude: number; sources: number }[] = [];
  const scheduled = Array.from(input.events, (raw: unknown) => {
    const event = object(raw, '乐句音符');
    fields(event, ['atSeconds', 'sound', 'pan'], '乐句音符');
    const atSeconds = number(event.atSeconds, '音符开始时间（秒）', 0, duration);
    if (atSeconds >= duration) throw new Error('音符必须在乐句结束前开始。');
    const sound = readPlan(event.sound, sampleReader.read);
    const pan = event.pan === undefined ? undefined : number(event.pan, '左右位置', -1, 1);
    const end = atSeconds + noteDuration(sound);
    durationSeconds = Math.max(durationSeconds, end);
    const amplitude = sound.level * sound.note.velocity * (sound.kind === 'sample' ? samplePeak(sound, pan) : sound.sources.reduce((sum, source) => sum + source.level, 0));
    const sourceCount = sound.kind === 'sample' ? 1 : sound.sources.length;
    boundaries.push({ time: atSeconds, amplitude, sources: sourceCount });
    boundaries.push({ time: end, amplitude: -amplitude, sources: -sourceCount });
    return { atSeconds, sound, ...(pan === undefined ? {} : { pan }) };
  });
  // Treat sub-nanosecond rounding differences as simultaneous only for the peak bound;
  // actual note scheduling keeps the full input precision on the device clock.
  boundaries.sort((left, right) => Math.round(left.time * 1e9) - Math.round(right.time * 1e9) || left.sources - right.sources);
  let amplitude = 0;
  let sources = 0;
  let peak = 1;
  for (const boundary of boundaries) {
    amplitude += boundary.amplitude;
    sources += boundary.sources;
    peak = Math.max(peak, amplitude);
    if (sources > MAX_SIMULTANEOUS_SOURCES) {
      throw new Error(`当前试听最多同时运行 ${MAX_SIMULTANEOUS_SOURCES} 个波形声源，请减少同时发声的音符。`);
    }
  }
  return { events: scheduled, durationSeconds, normalization: 1 / peak, sequence: true, samples: sampleReader.sources, ...(output ? { output } : {}) };
}


export function validateFrequency(preview: ScheduledPreview, sampleRate: number): void {
  const frequencyLimit = Math.min(20000, sampleRate / 2);
  if (preview.events.some(event => event.sound.kind === 'basic-synth' && event.sound.sources.some(source => source.waveform !== 'noise' && event.sound.note.frequencyHz * source.frequencyRatio * 2 ** (Math.max(0, event.sound.kind === 'basic-synth' ? event.sound.pitch?.semitones ?? 0 : 0) / 12) > frequencyLimit))) {
    throw new Error(`声源频率超出了当前设备的试听范围（最高 ${frequencyLimit} Hz）。`);
  }
}
