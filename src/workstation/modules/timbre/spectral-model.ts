import type { JsonValue } from '../../contracts/content.ts';
import type { SoundPlan } from '../../contracts/sound.ts';
import type { SpectralPatch, SpectralTimbreBody } from '../../contracts/timbre.ts';
import { normalizePatch, releaseSeconds } from './spectral/model.mjs';

export const SPECTRAL_SAMPLE_RATE = 48000;
export const MAX_SPECTRAL_CACHE_BYTES = 128 * 1024 * 1024;
const MAX_SPECTRAL_SECONDS = 120;
const object = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value);
function fields(value: unknown, names: string[], label: string): asserts value is Record<string, unknown> {
  if (!object(value) || Object.keys(value).some(key => !names.includes(key))) throw new Error(label + '包含不支持的设置，未简化或覆盖原音色。');
}
export function readSpectralPatch(value: unknown): SpectralPatch {
  fields(value, ['format', 'version', 'name', 'master', 'oscillators', 'spectrum', 'amplitude', 'pitch', 'lfos', 'effects', 'seed'], '精细音色');
  fields(value.master, ['level', 'glideSeconds', 'polyphony', 'velocitySensitivity'], '输出');
  if (!Array.isArray(value.oscillators) || !Array.isArray(value.lfos)) throw new Error('精细音色的振荡器或调制格式无效。');
  for (const osc of value.oscillators) fields(osc, ['id', 'enabled', 'waveform', 'level', 'pan', 'semitones', 'cents', 'phase', 'pulseWidth', 'unison', 'detuneCents', 'spread', 'fmRatio', 'fmAmount'], '振荡器');
  for (const lfo of value.lfos) fields(lfo, ['enabled', 'waveform', 'rateHz', 'depth', 'target'], '调制');
  fields(value.effects, ['drive', 'delaySeconds', 'delayFeedback', 'delayMix', 'chorusMix', 'chorusRateHz', 'chorusDepthMs'], '效果');
  for (const kind of ['spectrum', 'amplitude', 'pitch']) {
    const envelope = value[kind]; fields(envelope, kind === 'spectrum' ? ['mix', 'points'] : ['points', 'sustainIndex'], '曲线');
    if (!Array.isArray(envelope.points)) throw new Error('精细音色曲线不是有效点列。');
    for (const point of envelope.points) fields(point, ['x', 'y', 'curve'], '曲线点');
  }
  return normalizePatch(value);
}
export function spectralTailSeconds(patch: SpectralPatch): number {
  const effects = patch.effects;
  const feedback = effects.delayMix > 0 ? effects.delaySeconds * Math.log(.0001) / Math.log(Math.max(.0001, effects.delayFeedback)) : 0;
  return releaseSeconds(patch.amplitude) + 8192 / SPECTRAL_SAMPLE_RATE + .07 + feedback;
}
export function spectralTimbreBody(value: unknown): SpectralTimbreBody {
  const patch = readSpectralPatch(value);
  const peak = Math.max(...patch.amplitude.points.map(point => point.y));
  return { model: 'spectral-synth', version: 1, patch,
    attackSeconds: patch.amplitude.points.find(point => point.y === peak)!.x,
    releaseSeconds: spectralTailSeconds(patch), level: patch.master.level };
}
export function readSpectralTimbreBody(value: JsonValue): SpectralTimbreBody {
  fields(value, ['model', 'version', 'patch', 'attackSeconds', 'releaseSeconds', 'level'], '精细合成音色');
  if (value.model !== 'spectral-synth' || value.version !== 1) throw new Error('不支持这个精细音色版本。');
  const body = spectralTimbreBody(value.patch);
  if (value.attackSeconds !== body.attackSeconds || value.releaseSeconds !== body.releaseSeconds || value.level !== body.level)
    throw new Error('精细音色参数与显示信息不一致，原数据已保留。');
  return body;
}
type Note = SoundPlan['note'];
export function spectralRenderShape(patch: SpectralPatch, note: Note): { frames: number; bytes: number; tailSeconds: number } {
  const midi = 69 + 12 * Math.log2(note.frequencyHz / 440);
  if (!Number.isFinite(midi) || midi < 12 || midi > 120 || !Number.isFinite(note.holdSeconds) || note.holdSeconds < .0001 || note.holdSeconds > 120
    || !Number.isFinite(note.velocity) || note.velocity < 0 || note.velocity > 1) throw new Error('精细音色的音高、持续时间或力度超出支持范围。');
  const tailSeconds = spectralTailSeconds(patch); const frames = Math.ceil((note.holdSeconds + tailSeconds) * SPECTRAL_SAMPLE_RATE);
  if (frames > MAX_SPECTRAL_SECONDS * SPECTRAL_SAMPLE_RATE) throw new Error('这个精细音符连同完整效果尾音超过120秒，未截断或替换声音。');
  return { frames, bytes: frames * 8, tailSeconds };
}
