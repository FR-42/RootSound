import { resizeCurve } from './curve-density.mjs';

/** Shared, versioned instrument parameters. No audio device or DOM is used. */
export const PATCH_FORMAT = 'RootSoundSpectralPatch';
export const MAX_CURVE_POINTS = 10;
export const LEGACY_CURVE_POINTS = 512;
export const VOICE_UNIT_BUDGET = 48;
export function effectivePolyphony(patch) {
  const units = patch.oscillators.reduce((sum, o) => sum + (o.enabled ? o.unison : 0), 0);
  return Math.min(patch.master.polyphony, Math.max(1, Math.floor(VOICE_UNIT_BUDGET / Math.max(1, units))));
}
const clone = value => JSON.parse(JSON.stringify(value));
const point = (x, y, curve = 0) => ({ x, y, curve });
const osc = index => ({ id: `osc-${index + 1}`, enabled: index === 0, waveform: 'saw', level: index === 0 ? .7 : .3,
  pan: 0, semitones: 0, cents: 0, phase: 0, pulseWidth: .5, unison: 1, detuneCents: 12, spread: .65, fmRatio: 2, fmAmount: 0 });

function createBasePatch() {
  return { format: PATCH_FORMAT, version: 1, name: '新的音色',
    master: { level: .7, glideSeconds: .04, polyphony: 8, velocitySensitivity: .7 },
    oscillators: Array.from({ length: 4 }, (_, index) => osc(index)),
    spectrum: { mix: 1, points: [point(20, 0), point(160, 0), point(1200, 0), point(5500, -4), point(20000, -18)] },
    amplitude: { points: [point(0, 0), point(.012, 1, -.2), point(.24, .65), point(.65, 0, .2)], sustainIndex: 2 },
    pitch: { points: [point(0, 0), point(.1, 0), point(.35, 0)], sustainIndex: 1 },
    lfos: Array.from({ length: 2 }, () => ({ enabled: false, waveform: 'sine', rateHz: 5, depth: .1, target: 'pitch' })),
    effects: { drive: 0, delaySeconds: .25, delayFeedback: .3, delayMix: 0,
      chorusMix: 0, chorusRateHz: .35, chorusDepthMs: 6 }, seed: 148923 };
}

function editableCurves(patch) {
  patch.spectrum.points = resizeCurve(patch.spectrum.points, 6, { logX: true });
  for (const kind of ['amplitude', 'pitch']) {
    const envelope = patch[kind], sustainX = envelope.points[envelope.sustainIndex].x;
    envelope.points = resizeCurve(envelope.points, 6, { protectedXs: [sustainX] });
    envelope.sustainIndex = envelope.points.findIndex(point => point.x === sustainX);
  }
  return patch;
}

export function createDefaultPatch() { return editableCurves(createBasePatch()); }

function fail(message) { throw new Error(message); }
function object(value, label) { if (!value || typeof value !== 'object' || Array.isArray(value)) fail(`${label}不是有效对象。`); return value; }
function number(value, low, high, label, integer = false) {
  if (!Number.isFinite(value) || value < low || value > high || integer && !Number.isInteger(value)) fail(`${label}需要在 ${low}～${high} 之间。`);
  return value;
}
function choice(value, values, label) { if (!values.includes(value)) fail(`${label}不受支持。`); return value; }
function bool(value, label) { if (typeof value !== 'boolean') fail(`${label}需要开关值。`); return value; }

export function validateCurve(points, { minX = 0, maxX = 60, minY = 0, maxY = 1, firstX, lastY, logarithmic = false, maxPoints = MAX_CURVE_POINTS } = {}) {
  if (!Number.isInteger(maxPoints) || maxPoints < 2 || maxPoints > LEGACY_CURVE_POINTS) fail('曲线校验范围无效。');
  if (!Array.isArray(points) || points.length < 2 || points.length > maxPoints) fail(`曲线需要2～${maxPoints}个点。`);
  let previous = -Infinity;
  const result = points.map(raw => {
    object(raw, '曲线点');
    const x = number(raw.x, minX, maxX, '横坐标');
    if (x <= previous) fail('曲线点的横坐标必须严格递增。');
    previous = x;
    return point(x, number(raw.y, minY, maxY, '纵坐标'), number(raw.curve ?? 0, -1, 1, '曲率'));
  });
  const span = logarithmic ? Math.log(maxX / minX) : result.at(-1).x - minX;
  const transform = x => logarithmic ? Math.log(x / minX) / span : (x - minX) / span;
  for (let index = 1; index < result.length; index++) {
    if (!(span > 0) || transform(result[index].x) - transform(result[index - 1].x) < 1e-8) fail('曲线点过于接近，请适当分开。');
  }
  if (firstX !== undefined && Math.abs(result[0].x - firstX) > 1e-9) fail(`曲线起点需要位于 ${firstX}。`);
  if (lastY !== undefined && Math.abs(result.at(-1).y - lastY) > 1e-9) fail('音量包络的终点需要归零。');
  return result;
}

function normalizeWithLimit(value, maxPoints) {
  object(value, '音色');
  if (value.format !== PATCH_FORMAT || value.version !== 1) fail('暂不支持这份音色文件的格式或版本。');
  if (typeof value.name !== 'string' || !value.name.trim() || value.name.length > 120) fail('音色名称需要1～120个字符。');
  const master = object(value.master, '输出设置');
  if (!Array.isArray(value.oscillators) || value.oscillators.length !== 4) fail('音色需要四个振荡器位置。');
  const identifiers = new Set();
  const oscillators = value.oscillators.map(raw => {
    object(raw, '振荡器');
    if (typeof raw.id !== 'string' || !raw.id || raw.id.length > 64 || identifiers.has(raw.id)) fail('振荡器标识需要互不相同。');
    identifiers.add(raw.id);
    return { id: raw.id, enabled: bool(raw.enabled, '振荡器开关'),
      waveform: choice(raw.waveform, ['sine', 'triangle', 'saw', 'pulse', 'noise'], '波形'),
      level: number(raw.level, 0, 1, '振荡器音量'), pan: number(raw.pan, -1, 1, '声像'),
      semitones: number(raw.semitones, -48, 48, '半音'), cents: number(raw.cents, -100, 100, '音分'),
      phase: number(raw.phase, 0, 1, '初相'), pulseWidth: number(raw.pulseWidth, .01, .99, '脉宽'),
      unison: number(raw.unison, 1, 5, '齐奏数量', true), detuneCents: number(raw.detuneCents, 0, 50, '齐奏微调'),
      spread: number(raw.spread, 0, 1, '齐奏宽度'), fmRatio: number(raw.fmRatio, .25, 16, '调制倍率'),
      fmAmount: number(raw.fmAmount, 0, 6, '相位调制深度') };
  });
  const spectrum = object(value.spectrum, '频谱');
  const amplitude = object(value.amplitude, '音量包络'), pitch = object(value.pitch, '音高包络');
  const ampPoints = validateCurve(amplitude.points, { firstX: 0, lastY: 0, maxPoints });
  const pitchPoints = validateCurve(pitch.points, { minY: -48, maxY: 48, firstX: 0, maxPoints });
  if (!Array.isArray(value.lfos) || value.lfos.length !== 2) fail('音色需要两个调制位置。');
  const effects = object(value.effects, '效果');
  return { format: PATCH_FORMAT, version: 1, name: value.name.trim(),
    master: { level: number(master.level, 0, 1, '总音量'), glideSeconds: number(master.glideSeconds, 0, 2, '连音时间'),
      polyphony: number(master.polyphony, 1, 12, '复音数', true), velocitySensitivity: number(master.velocitySensitivity, 0, 1, '力度响应') },
    oscillators,
    spectrum: { mix: number(spectrum.mix, 0, 1, '频谱混合'), points: validateCurve(spectrum.points, { minX: 20, maxX: 20000, minY: -96, maxY: 24, logarithmic: true, maxPoints }) },
    amplitude: { points: ampPoints, sustainIndex: number(amplitude.sustainIndex, 0, ampPoints.length - 2, '音量保持点', true) },
    pitch: { points: pitchPoints, sustainIndex: number(pitch.sustainIndex, 0, pitchPoints.length - 2, '音高保持点', true) },
    lfos: value.lfos.map(raw => { object(raw, '低频调制'); return {
      enabled: bool(raw.enabled, '调制开关'), waveform: choice(raw.waveform, ['sine', 'triangle', 'square', 'random'], '调制波形'),
      rateHz: number(raw.rateHz, .01, 40, '调制速度'), depth: number(raw.depth, 0, 1, '调制深度'),
      target: choice(raw.target, ['pitch', 'amplitude', 'pan', 'fm'], '调制目标') }; }),
    effects: { drive: number(effects.drive, 0, 1, '饱和'), delaySeconds: number(effects.delaySeconds, .01, 2, '回声时间'),
      delayFeedback: number(effects.delayFeedback, 0, .85, '回声反馈'), delayMix: number(effects.delayMix, 0, .6, '回声混合'),
      chorusMix: number(effects.chorusMix, 0, .5, '合唱混合'), chorusRateHz: number(effects.chorusRateHz, .05, 5, '合唱速度'),
      chorusDepthMs: number(effects.chorusDepthMs, 1, 20, '合唱深度') },
    seed: number(value.seed, 1, 0xffffffff, '随机种子', true) };
}

/** The live document and sound engine always use at most ten points per curve. */
export function normalizePatch(value) { return normalizeWithLimit(value, MAX_CURVE_POINTS); }

/** Explicit import boundary for earlier version-one files; never changes input or disk. */
export function importPatch(value) {
  const patch = normalizeWithLimit(value, LEGACY_CURVE_POINTS);
  let reduced = false;
  if (patch.spectrum.points.length > MAX_CURVE_POINTS) {
    patch.spectrum.points = resizeCurve(patch.spectrum.points, MAX_CURVE_POINTS, { logX: true });
    reduced = true;
  }
  for (const kind of ['amplitude', 'pitch']) {
    const envelope = patch[kind];
    if (envelope.points.length <= MAX_CURVE_POINTS) continue;
    const sustainX = envelope.points[envelope.sustainIndex].x;
    envelope.points = resizeCurve(envelope.points, MAX_CURVE_POINTS, { protectedXs: [sustainX] });
    envelope.sustainIndex = envelope.points.findIndex(point => point.x === sustainX);
    reduced = true;
  }
  return { patch: normalizePatch(patch), reduced };
}

export function curveValue(points, x, logarithmic = false) {
  if (x <= points[0].x) return points[0].y;
  if (x >= points.at(-1).x) return points.at(-1).y;
  let lo = 0, hi = points.length - 1;
  while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (points[mid].x <= x) lo = mid; else hi = mid; }
  const a = points[lo], b = points[hi];
  let t = logarithmic ? Math.log(x / a.x) / Math.log(b.x / a.x) : (x - a.x) / (b.x - a.x);
  const c = a.curve ?? 0;
  if (c > 0) t = t ** (1 + 8 * c); else if (c < 0) t = 1 - (1 - t) ** (1 - 8 * c);
  return a.y + (b.y - a.y) * t;
}

/** Sustain and release are both parts of the same editable multi-point curve. */
export function envelopeValue(envelope, age, releasedAt = null, releaseStartValue = null) {
  const points = envelope.points, sustain = points[envelope.sustainIndex];
  if (releasedAt === null) return curveValue(points, Math.min(Math.max(0, age), sustain.x));
  const releaseDuration = points.at(-1).x - sustain.x;
  const elapsed = Math.max(0, age - releasedAt);
  if (elapsed >= releaseDuration) return points.at(-1).y;
  const initial = releaseStartValue ?? curveValue(points, Math.min(releasedAt, sustain.x));
  const raw = curveValue(points, sustain.x + elapsed);
  return raw + (initial - sustain.y) * (1 - elapsed / releaseDuration);
}

export function releaseSeconds(envelope) { return envelope.points.at(-1).x - envelope.points[envelope.sustainIndex].x; }

export function createPresets() {
  const result = [];
  function preset(id, name, edit) { const patch = createBasePatch(); patch.name = name; edit(patch); result.push({ id, name, patch: normalizePatch(editableCurves(patch)) }); }
  preset('init', '干净起点', p => { p.oscillators[0].waveform = 'sine'; p.spectrum.points = [point(20, 0), point(20000, 0)]; });
  preset('bass', '厚实低音', p => { p.oscillators[0].waveform = 'saw'; p.oscillators[1] = { ...osc(1), enabled: true, waveform: 'sine', semitones: -12, level: .5 }; p.spectrum.points = [point(20, 0), point(90, 2), point(400, -3), point(2500, -22), point(20000, -60)]; p.amplitude.points = [point(0, 0), point(.006, 1), point(.18, .66), point(.28, 0)]; p.pitch.points = [point(0, 7), point(.055, 0), point(.2, 0)]; p.master.polyphony = 1; p.effects.drive = .16; });
  preset('glass', '玻璃键音', p => { p.oscillators[0].waveform = 'sine'; p.oscillators[0].fmRatio = 2; p.oscillators[0].fmAmount = 1.1; p.oscillators[1] = { ...osc(1), enabled: true, waveform: 'sine', semitones: 12, level: .19 }; p.amplitude.points = [point(0, 0), point(.003, 1, -.35), point(1.2, 0, -.3), point(1.8, 0)]; p.spectrum.points = [point(20, -12), point(500, 0), point(4000, -5), point(20000, -18)]; p.effects.delayMix = .12; });
  preset('wide', '宽阔锯齿', p => { p.oscillators[0].unison = 5; p.oscillators[0].detuneCents = 16; p.oscillators[1] = { ...osc(1), enabled: true, waveform: 'saw', semitones: 12, unison: 3, level: .18 }; p.spectrum.points = [point(20, -24), point(130, -3), point(2000, 0), point(12000, -8), point(20000, -30)]; p.amplitude.points = [point(0, 0), point(.04, 1), point(.2, .8), point(.6, 0)]; p.effects.chorusMix = .13; p.effects.delayMix = .15; });
  preset('hollow', '空心脉冲', p => { p.oscillators[0].waveform = 'pulse'; p.oscillators[0].pulseWidth = .24; p.oscillators[0].unison = 2; p.oscillators[0].detuneCents = 5; p.spectrum.points = [point(20, -12), point(350, 0), point(1000, -22), point(2400, 3), point(8000, -8), point(20000, -36)]; p.lfos[0] = { enabled: true, waveform: 'sine', rateHz: 4.1, depth: .05, target: 'pitch' }; });
  preset('metal', '金属棱面', p => { p.oscillators[0].waveform = 'sine'; p.oscillators[0].fmRatio = 3.7; p.oscillators[0].fmAmount = 2.1; p.spectrum.points = [point(20, -18), point(800, 0), point(3400, -4), point(20000, -22)]; p.amplitude.points = [point(0, 0), point(.002, 1), point(.55, .08), point(1.1, 0)]; p.effects.delayMix = .18; p.effects.delaySeconds = .173; });
  preset('air', '空气纹理', p => { p.oscillators[0].waveform = 'noise'; p.oscillators[0].level = .5; p.spectrum.points = [point(20, -72), point(800, -24), point(3500, 0), point(10000, -8), point(20000, -38)]; p.amplitude.points = [point(0, 0), point(.4, 1), point(1.3, .8), point(2.8, 0)]; p.effects.chorusMix = .25; });
  preset('pluck', '弹性拨奏', p => { p.oscillators[0].waveform = 'triangle'; p.oscillators[1] = { ...osc(1), enabled: true, waveform: 'saw', semitones: 12, level: .13 }; p.amplitude.points = [point(0, 0), point(.003, 1), point(.45, 0), point(.8, 0)]; p.pitch.points = [point(0, 3), point(.04, 0), point(.2, 0)]; p.effects.delayMix = .11; });
  return result.map(clone);
}
