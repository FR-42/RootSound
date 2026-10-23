import type { JsonValue } from '../../contracts/content.ts';
import type { BasicWaveform, SoundPlan } from '../../contracts/sound.ts';
import type { SynthesizerBody, TimbreBody, TimbrePreset } from '../../contracts/timbre.ts';

const waves: readonly BasicWaveform[] = ['sine', 'triangle', 'sawtooth', 'square', 'noise'];
function fail(): never { throw new Error('音色的声源、音量曲线或音高设置无效，原内容已保留。'); }
function object(value: unknown, fields: string[]): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value) || Object.keys(value).length !== fields.length || fields.some(key => !Object.hasOwn(value, key))) fail();
  return value as Record<string, unknown>;
}
function finite(value: unknown, min: number, max: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max) fail();
  return value;
}
export function readSynthesizerBody(value: JsonValue | SynthesizerBody): SynthesizerBody {
  const v = object(value, ['model', 'version', 'sources', 'attackSeconds', 'decaySeconds', 'sustain', 'releaseSeconds', 'level', 'filter', 'pitch']);
  if (v.model !== 'synthesizer' || v.version !== 1 || !Array.isArray(v.sources) || !v.sources.length || v.sources.length > 4) fail();
  const ids = new Set<string>();
  const sources = v.sources.map(raw => {
    const s = object(raw, ['id', 'waveform', 'semitones', 'detuneCents', 'level', 'enabled']);
    if (typeof s.id !== 'string' || !s.id.trim() || s.id.length > 128 || ids.has(s.id) || !waves.includes(s.waveform as BasicWaveform) || typeof s.enabled !== 'boolean') fail();
    ids.add(s.id);
    return { id: s.id, waveform: s.waveform as BasicWaveform, semitones: finite(s.semitones, -24, 24), detuneCents: finite(s.detuneCents, -100, 100), level: finite(s.level, 0, 1), enabled: s.enabled };
  });
  const filter = object(v.filter, ['enabled', 'type', 'frequencyHz', 'resonance']);
  const pitch = object(v.pitch, ['semitones', 'seconds']);
  if (typeof filter.enabled !== 'boolean' || !['lowpass', 'highpass', 'bandpass'].includes(String(filter.type))) fail();
  return { model: 'synthesizer', version: 1, sources,
    attackSeconds: finite(v.attackSeconds, 0, 5), decaySeconds: finite(v.decaySeconds, 0, 5), sustain: finite(v.sustain, 0, 1), releaseSeconds: finite(v.releaseSeconds, 0, 10), level: finite(v.level, 0, 1),
    filter: { enabled: filter.enabled, type: filter.type as SynthesizerBody['filter']['type'], frequencyHz: finite(filter.frequencyHz, 20, 20000), resonance: finite(filter.resonance, 0, 8) },
    pitch: { semitones: finite(pitch.semitones, -48, 48), seconds: finite(pitch.seconds, .005, 5) } };
}
export function synthesisFromBasic(body: TimbreBody | SynthesizerBody): SynthesizerBody {
  if (body.model === 'synthesizer') return readSynthesizerBody(body);
  const parts: Array<[BasicWaveform, number, number]> = body.character === 'warm' ? [['sine', 0, .8], ['triangle', 0, .2]]
    : body.character === 'clear' ? [['sine', 0, .8], ['sine', 12, .2]] : [['triangle', 0, .7], ['sawtooth', 0, .3]];
  return { model: 'synthesizer', version: 1, sources: parts.map(([waveform, semitones, level], index) => ({ id: `source-${index}`, waveform, semitones, level, detuneCents: 0, enabled: true })),
    attackSeconds: body.attackSeconds, decaySeconds: 0, sustain: 1, releaseSeconds: body.releaseSeconds, level: body.level,
    filter: { enabled: false, type: 'lowpass', frequencyHz: 12000, resonance: 0 }, pitch: { semitones: 0, seconds: .12 } };
}
export function synthesisPlan(body: SynthesizerBody, note: SoundPlan['note']): SoundPlan {
  const current = readSynthesizerBody(body);
  const selected = current.sources.filter(source => source.enabled);
  const sum = Math.max(1, selected.reduce((total, source) => total + source.level, 0));
  return { kind: 'basic-synth', version: 1,
    sources: selected.length ? selected.map(source => ({ waveform: source.waveform, frequencyRatio: 2 ** ((source.semitones + source.detuneCents / 100) / 12), level: source.level / sum }))
      : [{ waveform: 'sine', frequencyRatio: 1, level: 0 }],
    envelope: { attackSeconds: current.attackSeconds, decaySeconds: current.decaySeconds, sustain: current.sustain, releaseSeconds: current.releaseSeconds },
    note: { ...note }, level: current.level,
    ...(current.filter.enabled ? { filter: { type: current.filter.type, frequencyHz: current.filter.frequencyHz, resonance: current.filter.resonance } } : {}),
    ...(current.pitch.semitones ? { pitch: { ...current.pitch } } : {}) };
}
export function previewTimbrePreset(id: string): SoundPlan {
  const preset = timbrePresets().find(item => item.id === id);
  if (!preset) throw new Error('找不到这个音色起点。');
  return synthesisPlan(preset.body, { frequencyHz: preset.category === '低音' || id === 'kick' ? 55 : 220, holdSeconds: 1, velocity: .8 });
}
export function timbrePresets(): TimbrePreset[] {
  function preset(id: string, name: string, category: TimbrePreset['category'], wave: BasicWaveform, patch: Partial<SynthesizerBody> = {}): TimbrePreset {
    const base = synthesisFromBasic({ model: 'basic-synth', version: 1, character: 'warm', attackSeconds: .01, releaseSeconds: .2, level: .65 });
    return { id, name, category, body: readSynthesizerBody({ ...base, sources: [{ id: 'source-1', waveform: wave, semitones: 0, detuneCents: 0, level: 1, enabled: true }], ...patch }) };
  }
  const pair = (waveform: BasicWaveform, detune = 0) => [0, 1].map(index => ({ id: `source-${index}`, waveform, semitones: 0, detuneCents: index ? detune : -detune, level: .5, enabled: true }));
  return [
    preset('plain', '纯净起点', '旋律', 'sine'),
    preset('soft-keys', '柔和琴键', '旋律', 'triangle', { decaySeconds: .5, sustain: .25, releaseSeconds: .4 }),
    preset('pluck', '轻拨弦', '旋律', 'triangle', { decaySeconds: .18, sustain: 0, releaseSeconds: .18 }),
    preset('bell', '玻璃铃', '旋律', 'sine', { sources: [{ ...pair('sine')[0]!, level: .75 }, { ...pair('sine')[1]!, semitones: 19.1, level: .25 }], decaySeconds: 1.1, sustain: 0, releaseSeconds: .8 }),
    preset('lead', '明亮主音', '旋律', 'sawtooth', { sources: pair('sawtooth', 7), sustain: .8 }),
    preset('bass', '厚实低音', '低音', 'sawtooth', { filter: { enabled: true, type: 'lowpass', frequencyHz: 700, resonance: .4 }, decaySeconds: .25, sustain: .55 }),
    preset('sub', '纯净低音', '低音', 'sine', { attackSeconds: .006, releaseSeconds: .12 }),
    preset('pad', '缓慢铺底', '铺底', 'sawtooth', { sources: pair('sawtooth', 12), attackSeconds: 1.2, decaySeconds: .4, sustain: .7, releaseSeconds: 2.5, filter: { enabled: true, type: 'lowpass', frequencyHz: 2200, resonance: .2 } }),
    preset('kick', '电子底鼓', '打击', 'sine', { attackSeconds: .001, decaySeconds: .28, sustain: 0, releaseSeconds: .08, pitch: { semitones: 30, seconds: .07 } }),
    preset('snare', '沙鼓', '打击', 'noise', { sources: [{ ...pair('noise')[0]!, level: .8 }, { ...pair('triangle')[1]!, level: .2 }], attackSeconds: .001, decaySeconds: .15, sustain: 0, releaseSeconds: .04, filter: { enabled: true, type: 'highpass', frequencyHz: 650, resonance: 0 } }),
    preset('hat', '细碎踩镲', '打击', 'noise', { attackSeconds: .001, decaySeconds: .045, sustain: 0, releaseSeconds: .025, filter: { enabled: true, type: 'highpass', frequencyHz: 6500, resonance: 0 } }),
    preset('wind', '风与气流', '音效', 'noise', { attackSeconds: .8, decaySeconds: .6, sustain: .7, releaseSeconds: 1.4, filter: { enabled: true, type: 'bandpass', frequencyHz: 1100, resonance: .6 } }),
  ];
}
