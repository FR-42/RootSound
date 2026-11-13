import {readMidiExpressionMessage,MAX_MIDI_EXPRESSION_EVENTS,type TimedMidiExpressionLane} from '../../contracts/midi-expression.ts';
import type { BasicWaveform, PcmAudio, SampleSoundPlan, SoundPlan, SoundAuditionOptions, SoundGainPoint } from '../../contracts/sound.ts';
import { CURVE_LIMITS, dbAmplitude, gainAtTime, GAIN_CURVE_LIMIT_DB, MAX_GAIN_CURVE_POINTS, sampleGainCurve, segmentAfter } from '../../contracts/gain-curve.ts';
import type { OutputProcessingPlan } from '../../contracts/post-production.ts';
import { pcmShape, readPcmSnapshot, samePcm, type PcmSnapshot } from './pcm.ts';
import { MAX_SEQUENCE_EVENTS, MAX_SEQUENCE_SECONDS } from '../../contracts/playback-limits.ts';

const WAVEFORMS: readonly BasicWaveform[] = ['sine', 'triangle', 'sawtooth', 'square', 'noise'];
const MAX_SOURCES = 8;
const MAX_SIMULTANEOUS_SOURCES = 256;
const MAX_LOOKAHEAD_SOURCES = 4096;
import { MAX_SEQUENCE_PCM_BYTES } from '../../contracts/playback-limits.ts';
const MAX_PLAN_PCM_BYTES = MAX_SEQUENCE_PCM_BYTES;

export type SampleSourceSnapshot = SampleSoundPlan['source'] & {
  readonly key: string;
  readonly peak: number;
  readonly hash: string;
};
export type ScheduledSound = SoundPlan | (Omit<SampleSoundPlan, 'source'> & { source: SampleSourceSnapshot });
export type ScheduledPitch = { points: readonly SoundGainPoint[]; distance: readonly number[] };
type ScheduledEvent = { atSeconds: number; sound: ScheduledSound; pan?: number; songAtSeconds?: number;
  gainCurve?: readonly SoundGainPoint[]; pitchCurve?: ScheduledPitch; duration: number };

export interface ScheduledPreview {
  readonly events: readonly ScheduledEvent[];
  readonly durationSeconds: number;
  readonly normalization: number;
  readonly sequence: boolean;
  readonly samples: readonly SampleSourceSnapshot[];
  readonly midiExpression?: readonly TimedMidiExpressionLane[];
  readonly output?: OutputProcessingPlan;
  readonly transport?: { readonly positionSeconds: number; readonly rate: number };
  /** Piecewise head clock, retained even when an edit temporarily removes every note. */
  readonly transportClock?: readonly { positionSeconds: number; elapsedSeconds: number; rate: number }[];
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

function readGainPoints(value: unknown, limit = GAIN_CURVE_LIMIT_DB): SoundGainPoint[] {
  if (!Array.isArray(value) || value.length > MAX_GAIN_CURVE_POINTS) throw new Error('音量增益曲线无效。');
  let previous = -Infinity;
  return value.map(raw => {
    const point = object(raw, '音量增益控制点');
    fields(point, ['atSeconds', 'db', 'before', 'after'], '曲线控制点');
    const atSeconds = number(point.atSeconds, '控制点时间', 0, Number.MAX_SAFE_INTEGER);
    if (atSeconds <= previous) throw new Error('音量增益控制点的时间必须递增。');
    previous = atSeconds;
    return { atSeconds, db: number(point.db, '控制点数值', -limit, limit),
      ...(point.before === undefined ? {} : { before: number(point.before, '曲线形状', -limit, limit) }),
      ...(point.after === undefined ? {} : { after: number(point.after, '曲线形状', -limit, limit) }) };
  });
}

/** Adapter limits, not restrictions on future RootSound content formats. */
function readPlan(value: unknown, readSample: (value: unknown) => SampleSourceSnapshot): ScheduledSound {
  const plan = object(value, '声音执行计划');
  if (plan.kind === 'sample' && plan.version === 1) {
    fields(plan, ['kind', 'version', 'source', 'startSeconds', 'endSeconds', 'playbackRate', 'envelope', 'note', 'level', 'sampleGain', 'loop', 'envelopeBaked'], '采样声音执行计划');
    if (plan.envelopeBaked !== undefined && plan.envelopeBaked !== true) throw new Error('生成音色的包络标记无效。');
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
    const sampleGain = plan.sampleGain === undefined ? undefined : number(plan.sampleGain, '采样增益', 1, 4);
    return { kind: 'sample', version: 1, source, startSeconds, endSeconds,
      playbackRate: number(plan.playbackRate, '采样播放倍率', 1 / 256, 256), ...common, ...(loop ? { loop } : {}),
      ...(sampleGain === undefined ? {} : { sampleGain }), ...(plan.envelopeBaked ? { envelopeBaked: true as const } : {}) };
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
  fields(envelope, ['attackSeconds', 'releaseSeconds', 'releaseShape', 'decaySeconds', 'sustain'], '音量变化');
  fields(note, ['frequencyHz', 'holdSeconds', 'velocity'], '试听音符');
  const attackSeconds = number(envelope.attackSeconds, '起音时间（秒）', 0, 10);
  const releaseSeconds = number(envelope.releaseSeconds, '收音时间（秒）', 0, plan.kind === 'sample' ? 120 : 10);
  if (envelope.releaseShape !== undefined && envelope.releaseShape !== 'natural') throw new Error('收音曲线无效。');
  const holdSeconds = number(note.holdSeconds, '持续时间（秒）', 0.0001, 120);
  return {
    envelope: { attackSeconds, releaseSeconds, ...(envelope.releaseShape === 'natural' ? { releaseShape: 'natural' as const } : {}),
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

const pitchRate = (semitones: number) => 2 ** (semitones / 12);
function pitchDistance(seconds: number, first: number, last: number) {
  const delta = (last - first) * Math.LN2 / 12;
  return seconds * pitchRate(first) * (Math.abs(delta) < 1e-9 ? 1 : Math.expm1(delta) / delta);
}

function scheduledPitch(points: readonly SoundGainPoint[]): ScheduledPitch {
  let distance = 0;
  return { points, distance: points.map((point, index) => {
    const previous = points[index - 1];
    if (previous) distance += pitchDistance(point.atSeconds - previous.atSeconds, previous.db, point.db);
    return distance;
  }) };
}

export function pitchSampleOffset(curve: ScheduledPitch, from: number, to: number): number {
  function at(seconds: number) {
    const index = segmentAfter(curve.points, seconds) - 1;
    const point = curve.points[Math.max(0, index)]!;
    return curve.distance[Math.max(0, index)]! + pitchDistance(seconds - point.atSeconds, point.db, gainAtTime(curve.points, seconds, false));
  }
  return at(to) - at(from);
}

function eventDuration(sound: ScheduledSound, at: number, curve?: ScheduledPitch): number {
  if (!curve || sound.kind !== 'sample' || sound.loop) return noteDuration(sound);
  const envelope = sound.note.holdSeconds + sound.envelope.releaseSeconds;
  const available = (sound.endSeconds - sound.startSeconds) / sound.playbackRate;
  if (pitchSampleOffset(curve, at, at + envelope) <= available) return envelope;
  let low = 0, high = envelope;
  while (high - low > 1e-5) {
    const mid = (low + high) / 2;
    if (pitchSampleOffset(curve, at, at + mid) <= available) low = mid;
    else high = mid;
  }
  return high;
}

export function noteAmplitude(sound: ScheduledSound): number {
  return sound.level * sound.note.velocity * (sound.kind === 'sample' ? sound.sampleGain ?? 1 : 1);
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
        if (totalBytes + shape.bytes > MAX_PLAN_PCM_BYTES) throw new Error('这段乐曲的独立采样合计超出当前 512 MiB 执行范围，请减少同时载入的素材。');
        snapshot = readPcmSnapshot(audio);
      }
      snapshots.set(audio, snapshot);
    }
    if (!counted.has(snapshot.audio)) {
      if (totalBytes + snapshot.bytes > MAX_PLAN_PCM_BYTES) throw new Error('这段乐曲的独立采样合计超出当前 512 MiB 执行范围，请减少同时载入的素材。');
      counted.add(snapshot.audio); totalBytes += snapshot.bytes;
    }
    const result: SampleSourceSnapshot = { id: source.id, revision: source.revision as number, audio: snapshot.audio, peak: snapshot.peak, hash: snapshot.hash,
      key: JSON.stringify([source.id, source.revision, snapshot.audio.sampleRate, snapshot.audio.channels.length, shape.frames, snapshot.hash]) };
    identities.set(identity, { input: audio, source: result }); sources.push(result); return result;
  } };
}

/** Only small note parameters and complete-source digests enter live-edit comparisons. */
export function previewFingerprint(preview: ScheduledPreview): string {
  const curves = new Map<readonly SoundGainPoint[], number>();
  const curveIndex = (points?: readonly SoundGainPoint[]) => {
    if (!points) return;
    if (!curves.has(points)) curves.set(points, curves.size);
    return curves.get(points);
  };
  return JSON.stringify({ durationSeconds: preview.durationSeconds, normalization: preview.normalization, sequence: preview.sequence, output: preview.output, midiExpression:preview.midiExpression,
    events: preview.events.map(({ gainCurve, pitchCurve, ...event }) => {
      return { ...event, gainCurve: curveIndex(gainCurve), pitchCurve: curveIndex(pitchCurve?.points), sound: event.sound.kind === 'sample' ? { ...event.sound, source: event.sound.source.key } : event.sound };
    }), gainCurves: [...curves.keys()] });
}

export function samePreviewSamples(left: ScheduledPreview | undefined, right: ScheduledPreview): boolean {
  if (!left || left.samples.length !== right.samples.length) return false;
  const byKey = new Map(left.samples.map(sample => [sample.key, sample]));
  return right.samples.every(sample => { const previous = byKey.get(sample.key); return previous !== undefined && (previous.audio === sample.audio || samePcm(previous.audio, sample.audio)); });
}

function samplePeak(sound: Extract<ScheduledSound, { kind: 'sample' }>, pan = 0): number {
  // A full SF2 stream has its own velocity curves, envelopes and output peak
  // protection. Its thin placeholder PCM is not a full-scale waveform estimate.
  // Counting every held/releasing SF2 note as full scale attenuates entire scores.
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

function recordingLayers(value: unknown): unknown[] {
  const plan=object(value,'声音执行计划');
  if(plan.kind!=='sample' || plan.layers===undefined) return [value];
  if(!Array.isArray(plan.layers) || plan.layers.length>15) throw new Error('一个采样音符最多支持 16 层原始录音。');
  const reference=number(plan.layerReferenceLevel,'采样层参考音量',0,1);
  const gain=number(plan.level,'采样音量',0,1);
  const {layers,layerReferenceLevel:_reference,...root}=plan;
  return [root,...layers.map(raw=>{
    const layer=object(raw,'采样层');
    if(layer.kind!=='sample' || layer.layers!==undefined || layer.layerReferenceLevel!==undefined) throw new Error('采样层不能嵌套。');
    const initial=number(layer.level,'采样层音量',0,1);
    return {...layer,note:root.note,level:reference ? initial*gain/reference : 0};
  })];
}

export function readPreview(value: unknown, options: { allowEmptySequence?: boolean; previous?: ScheduledPreview; transportElapsed?: number; audition?: SoundAuditionOptions } = {}): ScheduledPreview {
  const input = object(value, '声音执行计划');
  const sampleReader = sourceReader(options.previous);
  if (input.kind !== 'sequence') {
    const sounds=recordingLayers(input).map(plan=>readPlan(plan,sampleReader.read));
    const pan = options.audition?.pan === undefined ? undefined : number(options.audition.pan, '左右位置', -1, 1);
    const gainPoints = options.audition?.gainCurve && readGainPoints(options.audition.gainCurve);
    const curveStart = number(options.audition?.gainCurveStartSeconds ?? 0, '音量增益曲线开始时间', 0, MAX_SEQUENCE_SECONDS);
    const gainCurve = gainPoints && sampleGainCurve(gainPoints).map(point => ({ ...point, atSeconds: point.atSeconds - curveStart }));
    const pitchPoints = options.audition?.pitchCurve && readGainPoints(options.audition.pitchCurve, CURVE_LIMITS.pitch);
    const pitchCurve = pitchPoints?.length ? scheduledPitch(sampleGainCurve(pitchPoints).map(point => ({ ...point, atSeconds: point.atSeconds - curveStart }))) : undefined;
    const gain = gainPoints?.length ? dbAmplitude(Math.max(...gainPoints.map(point => point.db))) : 1;
    const amplitude=sounds.reduce((sum,sound)=>sum+noteAmplitude(sound)*(sound.kind==='sample'?samplePeak(sound, pan):1)*gain,0);
    const events = sounds.map(sound => ({ atSeconds: 0, sound, duration: eventDuration(sound, 0, pitchCurve),
      ...(pan === undefined ? {} : { pan }), ...(gainCurve?.length ? { gainCurve } : {}), ...(pitchCurve ? { pitchCurve } : {}) }));
    return {
      events,
      durationSeconds: Math.max(...events.map(event => event.duration)),
      normalization: input.kind==='sample' && !options.audition?.preserveNoteLevel ? 1/Math.max(1,amplitude) : 1,
      sequence: false,
      samples: sampleReader.sources,
    };
  }
  if (input.version !== 1) throw new Error('当前声音运行仅支持第 1 版音乐试听计划。');
  fields(input, ['kind', 'version', 'durationSeconds', 'events', 'output', 'transport', 'midiExpression', 'preserveNoteLevel', 'gainCurves', 'pitchCurves'], '音乐试听计划');
  if (input.preserveNoteLevel !== undefined && input.preserveNoteLevel !== true) throw new Error('音乐试听音量设置无效。');
  let output: OutputProcessingPlan | undefined;
  if (input.output !== undefined) {
    const settings = object(input.output, '输出处理'); fields(settings, ['level', 'fadeInSeconds', 'fadeOutSeconds'], '输出处理');
    output = { level: number(settings.level, '总输出音量', 0, 1), fadeInSeconds: number(settings.fadeInSeconds, '淡入秒数', 0, 30),
      fadeOutSeconds: number(settings.fadeOutSeconds, '淡出秒数', 0, 30) };
  }
  const duration = number(input.durationSeconds, '音乐时长（秒）', 0.0001, MAX_SEQUENCE_SECONDS);
  let transport: ScheduledPreview['transport'];
  if (input.transport !== undefined) {
    const settings = object(input.transport, '播放线设置'); fields(settings, ['positionSeconds', 'rate'], '播放线设置');
    transport = { positionSeconds: number(settings.positionSeconds, '播放线位置', 0, duration), rate: number(settings.rate, '播放线速度', .25, 4) };
  }
  if (!Array.isArray(input.events) || (input.events.length < 1 && !options.allowEmptySequence) || input.events.length > MAX_SEQUENCE_EVENTS) {
    throw new Error(`音乐试听需要 1 至 ${MAX_SEQUENCE_EVENTS} 个音符，空音乐暂时无法试听。`);
  }
  const elapsed = options.transportElapsed ?? 0;
  let durationSeconds = transport ? elapsed + (duration - transport.positionSeconds) / transport.rate : duration;
  const transportClock = transport ? [...(options.previous?.transportClock ?? [])] : undefined;
  if (transportClock && transport) {
    const last = transportClock.at(-1);
    if (!last || last.rate !== transport.rate || Math.abs(last.positionSeconds + (elapsed - last.elapsedSeconds) * last.rate - transport.positionSeconds) > 1e-8) {
      transportClock.push({ ...transport, elapsedSeconds: elapsed });
    }
  }
  function clock(songAtSeconds:number):number {
    if(!transport)return songAtSeconds;
    let segment=transportClock![0]!;
    for(let i=transportClock!.length-1;i>=0;i--)if(transportClock![i]!.positionSeconds<=songAtSeconds){segment=transportClock![i]!;break;}
    return segment.elapsedSeconds+(songAtSeconds-segment.positionSeconds)/segment.rate;
  }
  function readCurves(value: unknown, limit: number) {
    const curves = new Map<string, { points: SoundGainPoint[]; peak: number }>();
    const entries = value === undefined ? [] : Object.entries(object(value, '演奏曲线'));
    if (entries.length > MAX_SEQUENCE_EVENTS) throw new Error('音量增益曲线数量超出范围。');
    for (const [id, raw] of entries) {
      const knots = readGainPoints(raw, limit);
      const points = sampleGainCurve(knots);
      const peak = dbAmplitude(Math.max(0, ...knots.map(point => point.db)));
      const clockChanges = transportClock?.slice(1) ?? [];
      if (points.length > 1) {
        const boundaries = clockChanges.filter(change => change.positionSeconds > points[0]!.atSeconds && change.positionSeconds < points.at(-1)!.atSeconds);
        for (const change of boundaries) {
          if (!points.some(point => point.atSeconds === change.positionSeconds)) {
            const db = gainAtTime(points, change.positionSeconds, false);
            points.push({ atSeconds: change.positionSeconds, db });
            points.sort((a, b) => a.atSeconds - b.atSeconds);
          }
        }
      }
      curves.set(id, { points: points.map(point => ({ ...point, atSeconds: clock(point.atSeconds) })), peak });
    }
    return curves;
  }
  const gainCurves = readCurves(input.gainCurves, CURVE_LIMITS.gain);
  const pitchCurves = new Map([...readCurves(input.pitchCurves, CURVE_LIMITS.pitch)].map(([id, curve]) => [id, scheduledPitch(curve.points)]));
  let eventCount=0;const laneIds=new Set<string>();
  const midiExpression:TimedMidiExpressionLane[]|undefined=input.midiExpression===undefined?undefined:(()=>{
    if(!Array.isArray(input.midiExpression)||input.midiExpression.length>2048)throw new Error('MIDI 演奏通道无效。');
    return input.midiExpression.map(raw=>{
      const lane=object(raw,'MIDI 演奏通道');fields(lane,['id','events'],'MIDI 演奏通道');
      if(typeof lane.id!=='string'||!lane.id||laneIds.has(lane.id)||!Array.isArray(lane.events))throw new Error('MIDI 演奏通道无效。');
      laneIds.add(lane.id);
      const events=lane.events.map(raw=>{
        if(++eventCount>MAX_MIDI_EXPRESSION_EVENTS+4096)throw new Error('MIDI 演奏事件超出范围。');
        const item=object(raw,'MIDI 演奏事件');fields(item,['type','controller','key','value','atSeconds','order'],'MIDI 演奏事件');
        return {...readMidiExpressionMessage(item),atSeconds:clock(number(item.atSeconds,'演奏事件时间',0,duration)),
          ...(item.order===undefined?{}:{order:number(item.order,'MIDI 事件顺序',0,Number.MAX_SAFE_INTEGER)})};
      });
      return {id:lane.id,events};
    });
  })();
  const boundaries: { time: number; amplitude: number; sources: number }[] = [];
  const expanded=Array.from(input.events).flatMap((raw:unknown)=>{
    const event=object(raw,'音乐音符');
    fields(event,['atSeconds','sound','pan','gainCurveId','pitchCurveId'],'音乐音符');
    return recordingLayers(event.sound).map(sound=>({...event,sound}));
  });
  const scheduled = Array.from(expanded, (raw: unknown) => {
    const event = object(raw, '音乐音符');
    fields(event, ['atSeconds', 'sound', 'pan', 'gainCurveId', 'pitchCurveId'], '音乐音符');
    const songAtSeconds = number(event.atSeconds, '音符开始时间（秒）', 0, duration);
    if (songAtSeconds >= duration) throw new Error('音符必须在音乐结束前开始。');
    let atSeconds = songAtSeconds;
    if (transport) {
      // Already-triggered notes retain their physical onset across speed changes,
      // pauses and live edits. Only future triggers follow the new head speed.
      let segment = transportClock![0]!;
      for (let i = transportClock!.length - 1; i >= 0; i--) {
        if (transportClock![i]!.positionSeconds <= songAtSeconds) { segment = transportClock![i]!; break; }
      }
      atSeconds = segment.elapsedSeconds + (songAtSeconds - segment.positionSeconds) / segment.rate;
    }
    const sound = readPlan(event.sound, sampleReader.read);
    const pan = event.pan === undefined ? undefined : number(event.pan, '左右位置', -1, 1);
    const pitchCurve = typeof event.pitchCurveId === 'string' ? pitchCurves.get(event.pitchCurveId) : undefined;
    if (event.pitchCurveId !== undefined && !pitchCurve?.points.length) throw new Error('找不到音符对应的音高曲线。');
    const sounding = eventDuration(sound, atSeconds, pitchCurve);
    const end = atSeconds + sounding;
    durationSeconds = Math.max(durationSeconds, end);
    const gainCurve = typeof event.gainCurveId === 'string' ? gainCurves.get(event.gainCurveId) : undefined;
    if (event.gainCurveId !== undefined && !gainCurve) throw new Error('找不到音符对应的音量增益曲线。');
    const amplitude = noteAmplitude(sound) * (gainCurve?.peak ?? 1) * (sound.kind === 'sample' ? samplePeak(sound, pan) : sound.sources.reduce((sum, source) => sum + source.level, 0));
    const sourceCount = sound.kind === 'sample' ? 1 : sound.sources.length;
    boundaries.push({ time: atSeconds, amplitude, sources: sourceCount });
    boundaries.push({ time: end, amplitude: -amplitude, sources: -sourceCount });
    return { atSeconds, sound, duration: sounding, ...(pan === undefined ? {} : { pan }), ...(gainCurve?.points.length ? { gainCurve: gainCurve.points } : {}),
      ...(pitchCurve ? { pitchCurve } : {}), ...(transport ? { songAtSeconds } : {}) };
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
  // The total song budget is independent of an extreme burst. Bound upcoming
  // allocations too, even when ultra-short, non-overlapping notes evade polyphony.
  const onsets = scheduled.map(event => ({ time: event.atSeconds, sources: event.sound.kind === 'sample' ? 1 : event.sound.sources.length })).sort((a, b) => a.time - b.time);
  let begin = 0; let upcomingSources = 0;
  for (let index = 0; index < onsets.length; index++) {
    upcomingSources += onsets[index]!.sources;
    while (onsets[index]!.time - onsets[begin]!.time > .35) upcomingSources -= onsets[begin++]!.sources;
    if (upcomingSources > MAX_LOOKAHEAD_SOURCES) throw new Error('音符过于密集：任意 0.35 秒内最多支持 4096 个波形声源，请减少极短音符。');
  }
  return { ...(midiExpression?{midiExpression}:{}), events: scheduled, durationSeconds, normalization: input.preserveNoteLevel ? 1 : 1 / peak, sequence: true, samples: sampleReader.sources, ...(output ? { output } : {}), ...(transport ? { transport, transportClock } : {}) };
}


export function validateFrequency(preview: ScheduledPreview, sampleRate: number): void {
  const frequencyLimit = Math.min(20000, sampleRate / 2);
  if (preview.events.some(event => event.sound.kind === 'basic-synth' && event.sound.sources.some(source => source.waveform !== 'noise' && event.sound.note.frequencyHz * source.frequencyRatio * 2 ** (Math.max(0, event.sound.kind === 'basic-synth' ? event.sound.pitch?.semitones ?? 0 : 0) / 12) > frequencyLimit))) {
    throw new Error(`声源频率超出了当前设备的试听范围（最高 ${frequencyLimit} Hz）。`);
  }
}
