import { createDefaultPatch, normalizePatch, createPresets, effectivePolyphony, importPatch, MAX_CURVE_POINTS } from './model.mjs';
import { createCurveEditor } from './curve-editor.mjs';
import { createDocumentState } from './document-state.mjs';
import { createHostBridge, bytesToBase64 } from './host-bridge.mjs';
import { createAudioClient } from './audio-client.mjs';
import { resizeCurve } from './curve-density.mjs';
import { ANALYSIS_FFT_SIZE, createOutputAnalysis } from './output-analysis.mjs';

const byId = id => document.getElementById(id);
const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
const noteName = midi => ['C','C♯','D','E♭','E','F','F♯','G','A♭','A','B♭','B'][midi % 12] + (Math.floor(midi / 12) - 1);
const frequency = midi => 440 * 2 ** ((midi - 69) / 12);
const readable = value => Number(value.toFixed(5)).toString();
const bridge = createHostBridge();
const doc = createDocumentState(createDefaultPatch(), normalizePatch);
// Read once per edit, never clone the whole instrument on an animation frame.
let currentPatch = doc.read();
const meterData = new Float32Array(ANALYSIS_FFT_SIZE), spectrumData = new Float32Array(ANALYSIS_FFT_SIZE / 2);
const outputAnalysis = createOutputAnalysis();
let lastAnalysisFrame = -Infinity;
let envelopeKind = 'amplitude', spectrumEditor, envelopeEditor;
let keyboardEnabled = false, keyboardOctave = 4, previewActive = false;
let recoveryTimer, renderAbort, saving = false, opening = false, restoring = false;
let spectrumSelection, envelopeSelection, lastError = '', meterFrame;
const pointerNotes = new Map(), computerNotes = new Map();
const presets = createPresets();

function status(message, error = false) {
  byId('status').textContent = message; byId('status').classList.toggle('is-error', error);
  if (error) lastError = message;
}
function error(reason) { status(reason instanceof Error ? reason.message : String(reason), true); }
const audio = createAudioClient({ onError: reason => { stopAll(); error(reason); }, onStatus: message => status(message) });

function field(parent, label, value, options, callback) {
  const wrap = document.createElement('label'); wrap.className = 'control-field';
  const caption = document.createElement('span'); caption.textContent = label; wrap.append(caption);
  let input;
  if (options.choices) {
    input = document.createElement('select');
    for (const [key, title] of options.choices) { const item = document.createElement('option'); item.value = key; item.textContent = title; input.append(item); }
    input.value = String(value); input.addEventListener('change', () => callback(options.integer ? Number(input.value) : input.value, false));
  } else if (options.checkbox) {
    input = document.createElement('input'); input.type = 'checkbox'; input.checked = Boolean(value);
    input.addEventListener('change', () => callback(input.checked, false));
  } else {
    input = document.createElement('input'); input.type = options.range ? 'range' : 'number';
    input.min = String(options.min); input.max = String(options.max); input.step = String(options.step ?? .001); input.value = String(value);
    if (options.range) {
      const row = document.createElement('div'); row.className = 'range-line'; const output = document.createElement('output');
      output.textContent = options.format ? options.format(value) : readable(value);
      input.addEventListener('input', () => { const n = Number(input.value); output.textContent = options.format ? options.format(n) : readable(n); callback(n, true); });
      input.addEventListener('change', () => callback(Number(input.value), false)); row.append(input, output); wrap.append(row);
    } else input.addEventListener('change', () => {
      const number = Number(input.value);
      if (!Number.isFinite(number) || input.value === '') { input.value = String(value); return; }
      callback(number, false);
    });
  }
  input.setAttribute('aria-label', label);
  if (!options.range) wrap.append(input);
  parent.append(wrap); return input;
}
function setPath(value, path, next) { let cursor = value; for (const key of path.slice(0, -1)) cursor = cursor[key]; cursor[path.at(-1)] = next; }
function getPath(value, path) { for (const key of path) value = value[key]; return value; }
function changed({ repaint = true, recovery = true } = {}) {
  const patch = currentPatch = doc.read(); audio.setPatch(patch);
  outputAnalysis.clear(audio.noteClock);
  byId('undo').disabled = !doc.canUndo; byId('redo').disabled = !doc.canRedo;
  byId('dirty-mark').textContent = doc.dirty ? '未保存' : '';
  document.title = `${doc.dirty ? '• ' : ''}${patch.name} · RootSound 音色实验`;
  // Send a new dirty generation even while already dirty, so a save in flight
  // cannot close over later live edits.
  void bridge.request('setDirty', { dirty: doc.dirty }).catch(error);
  if (recovery && !restoring) {
    clearTimeout(recoveryTimer);
    recoveryTimer = setTimeout(() => { if (doc.dirty) void bridge.request('saveRecovery', { text: JSON.stringify(doc.read()) }).catch(error); }, 700);
  }
  if (repaint) paintAll(); else updateEnvelopeSummary();
}
function edit(path, value, live = false) {
  try {
    const next = doc.read(); setPath(next, path, value);
    if (live) doc.preview(next); else doc.commit(next);
    changed({ repaint: !live });
  } catch (reason) { error(reason); if (!live) paintAll(); }
}
function bind(parent, label, path, options = {}) {
  const patch = currentPatch;
  return field(parent, label, options.toDisplay ? options.toDisplay(getPath(patch, path)) : getPath(patch, path), options,
    (value, live) => edit(path, options.fromDisplay ? options.fromDisplay(value) : value, live));
}

function paintOscillators(patch) {
  const root = byId('osc-list'); const open = new Set([...root.querySelectorAll('details[open]')].map(item => item.dataset.osc)); root.replaceChildren();
  patch.oscillators.forEach((oscillator, index) => {
    const card = document.createElement('section'); card.className = 'oscillator-card'; card.classList.toggle('is-disabled', !oscillator.enabled);
    const heading = document.createElement('div'); heading.className = 'oscillator-heading';
    const label = document.createElement('label'); const enabled = document.createElement('input'); enabled.type = 'checkbox'; enabled.checked = oscillator.enabled;
    enabled.setAttribute('aria-label', `振荡器 ${index + 1} 开关`); enabled.addEventListener('change', () => edit(['oscillators', index, 'enabled'], enabled.checked));
    label.append(enabled, document.createTextNode(`振荡器 ${index + 1}`)); heading.append(label); card.append(heading);
    const controls = document.createElement('div'); controls.className = 'oscillator-controls';
    bind(controls, '波形', ['oscillators', index, 'waveform'], { choices: [['sine','正弦'],['triangle','三角'],['saw','锯齿'],['pulse','脉冲'],['noise','噪声']] });
    bind(controls, '音量', ['oscillators', index, 'level'], { min: 0, max: 1, range: true, format: n => `${Math.round(n * 100)}%` });
    const tuning = document.createElement('div'); tuning.className = 'control-row'; controls.append(tuning);
    bind(tuning, '移调 / 半音', ['oscillators', index, 'semitones'], { min: -48, max: 48, step: .01 });
    bind(tuning, '微调 / 音分', ['oscillators', index, 'cents'], { min: -100, max: 100, step: .01 });
    const advanced = document.createElement('details'); advanced.dataset.osc = String(index); advanced.open = open.has(String(index));
    const summary = document.createElement('summary'); summary.textContent = '精细参数'; advanced.append(summary);
    const grid = document.createElement('div'); grid.className = 'control-grid'; advanced.append(grid);
    bind(grid, '相位 / °', ['oscillators', index, 'phase'], { min: 0, max: 360, step: .01, toDisplay: n => n * 360, fromDisplay: n => n / 360 });
    bind(grid, '脉宽', ['oscillators', index, 'pulseWidth'], { min: .01, max: .99, step: .001 });
    bind(grid, '齐奏数量', ['oscillators', index, 'unison'], { min: 1, max: 5, step: 1 });
    bind(grid, '齐奏微调 / 音分', ['oscillators', index, 'detuneCents'], { min: 0, max: 50, step: .01 });
    bind(grid, '齐奏宽度', ['oscillators', index, 'spread'], { min: 0, max: 1, step: .001 });
    bind(grid, '声像', ['oscillators', index, 'pan'], { min: -1, max: 1, step: .001 });
    bind(grid, '调制倍率', ['oscillators', index, 'fmRatio'], { min: .25, max: 16, step: .001 });
    bind(grid, '相位调制深度', ['oscillators', index, 'fmAmount'], { min: 0, max: 6, step: .001 });
    controls.append(advanced); card.append(controls); root.append(card);
  });
}
function paintSideControls() {
  const master = byId('master-controls'); master.replaceChildren();
  bind(master, '总音量', ['master','level'], { min: 0, max: 1, range: true });
  bind(master, '力度响应', ['master','velocitySensitivity'], { min: 0, max: 1, step: .001 });
  bind(master, '连音 / s', ['master','glideSeconds'], { min: 0, max: 2, step: .001 });
  bind(master, '复音数量', ['master','polyphony'], { choices: [1,2,4,8,12].map(n => [String(n),String(n)]), integer: true });
  const limit = effectivePolyphony(currentPatch);
  if (limit < currentPatch.master.polyphony) {
    const effective = document.createElement('span'); effective.className = 'control-field';
    effective.textContent = `当前可用 ${limit} 复音`;
    effective.title = '当前齐奏数量较多，使用固定计算预算限制同时发声数量；减少齐奏或振荡器可增加复音。';
    master.append(effective);
  }
  const lfos = byId('lfo-controls'); lfos.replaceChildren();
  currentPatch.lfos.forEach((_value, index) => {
    const group = document.createElement('div'); group.className = 'lfo-group'; lfos.append(group);
    bind(group, `LFO ${index + 1}`, ['lfos',index,'enabled'], { checkbox: true });
    const row = document.createElement('div'); row.className = 'control-grid'; group.append(row);
    bind(row, '波形', ['lfos',index,'waveform'], { choices: [['sine','正弦'],['triangle','三角'],['square','方形'],['random','随机保持']] });
    bind(row, '目标', ['lfos',index,'target'], { choices: [['pitch','音高'],['amplitude','音量'],['pan','声像'],['fm','相位调制']] });
    bind(row, '速度 / Hz', ['lfos',index,'rateHz'], { min: .01, max: 40, step: .01 });
    bind(row, '深度', ['lfos',index,'depth'], { min: 0, max: 1, step: .001 });
  });
  const effects = byId('effect-controls'); effects.replaceChildren();
  for (const [label,key,min,max,step] of [['饱和','drive',0,1,.001],['回声 / s','delaySeconds',.01,2,.001],['回声反馈','delayFeedback',0,.85,.001],['回声混合','delayMix',0,.6,.001],['合唱混合','chorusMix',0,.5,.001],['合唱速度 / Hz','chorusRateHz',.05,5,.01],['合唱深度 / ms','chorusDepthMs',1,20,.01]])
    bind(effects,label,['effects',key],{min,max,step});
}
function envelopeRange(patch) {
  const pitch = envelopeKind === 'pitch';
  return { xMin: 0, xMax: patch[envelopeKind].points.at(-1).x, yMin: pitch ? -48 : 0, yMax: pitch ? 48 : 1, logX: false };
}
function changeCurve(kind, points, live) {
  try {
    const next = doc.read();
    if (kind === 'spectrum') next.spectrum.points = points;
    else {
      const previous = next[kind]; const sustainX = previous.points[previous.sustainIndex].x;
      const match = points.findIndex(point => Math.abs(point.x - sustainX) < 1e-8);
      const preceding = points.findLastIndex(point => point.x <= sustainX);
      // Moving a point does not change its identity; insertion/deletion does.
      next[kind] = { points, sustainIndex: points.length === previous.points.length
        ? previous.sustainIndex : clamp(match >= 0 ? match : preceding, 0, points.length - 2) };
    }
    if (live) doc.preview(next); else doc.commit(next);
    changed({ repaint: !live });
  } catch (reason) { error(reason); }
}
function cancelCurve() { doc.cancelPreview(); changed(); }
function updateEnvelopeSummary() {
  const patch = currentPatch, env = patch[envelopeKind], selected = envelopeEditor?.getSelected();
  byId('envelope-summary').textContent = `持续点 ${readable(env.points[env.sustainIndex].x)} s · 释放 ${readable(env.points.at(-1).x-env.points[env.sustainIndex].x)} s`;
  byId('sustain-point').disabled = !selected || selected.index >= env.points.length - 1;
  const pitch = envelopeKind === 'pitch';
  byId('point-frequency').textContent = pitch && selected ? `${readable(frequency(Number(byId('preview-note').value)) * 2 ** (selected.point.y / 12))} Hz` : '';
  envelopeEditor?.setMarkers([{ x: env.points[env.sustainIndex].x, label: '持续' }]);
}
function paintGraphs(patch) {
  if (!spectrumEditor) spectrumEditor = createCurveEditor(byId('spectrum-editor'), {
    kind: 'spectrum', label: '频率 → 强弱', xMin: 20, xMax: 20000, yMin: -96, yMax: 24, logX: true,
    points: patch.spectrum.points, maxPoints: MAX_CURVE_POINTS, lockEndpoints: true,
    formatX: n => n >= 1000 ? `${readable(n/1000)}k` : readable(n), formatY: n => `${readable(n)} dB`,
    onPreview: points => changeCurve('spectrum', points, true), onCommit: points => changeCurve('spectrum', points, false),
    onCancel: cancelCurve, onSelect: (index, point) => { spectrumSelection = { index, point }; },
  });
  else spectrumEditor.setPoints(patch.spectrum.points);
  const range = envelopeRange(patch);
  if (!envelopeEditor) envelopeEditor = createCurveEditor(byId('envelope-editor'), {
    kind: envelopeKind, label: envelopeKind === 'pitch' ? '时间 → 音高 / 半音' : '时间 → 音量', ...range,
    points: patch[envelopeKind].points, maxPoints: MAX_CURVE_POINTS, lockEndpoints: true,
    getProtectedXs: () => { const envelope = currentPatch[envelopeKind]; return [envelope.points[envelope.sustainIndex].x]; },
    ...(envelopeKind === 'amplitude' ? { fixedEndY: 0 } : {}),
    formatX: n => `${readable(n)} s`, formatY: n => envelopeKind === 'pitch' ? `${readable(n)} st` : `${readable(n*100)}%`,
    onPreview: points => changeCurve(envelopeKind, points, true), onCommit: points => changeCurve(envelopeKind, points, false),
    onCancel: cancelCurve, onSelect: (index, point) => { envelopeSelection = { index, point }; updateEnvelopeSummary(); },
  });
  else envelopeEditor.setData(patch[envelopeKind].points, range);
  byId('envelope-length').value = String(range.xMax);
  byId('spectrum-mix').value = String(patch.spectrum.mix); byId('spectrum-mix-value').textContent = `${Math.round(patch.spectrum.mix*100)}%`;
  updateEnvelopeSummary();
  paintAnalysis();
}
function paintAnalysis() {
  const frame = outputAnalysis.frame;
  spectrumEditor?.setAnalysis(frame.spectrum, { label: frame.measured ? '实际输出频谱 · dBFS' : '试听后显示实际频谱', filled: true });
  if (envelopeKind === 'amplitude') envelopeEditor?.setAnalysis(frame.amplitude,
    { label: frame.amplitude.length ? '实际输出峰值' : '试听后显示实际音量', filled: true });
  else envelopeEditor?.setAnalysis(frame.pitch, { label: `${frame.pitchStatus}${frame.referenceMidi === undefined ? '' : ` · 相对 ${noteName(frame.referenceMidi)}`}` });
}
function paintAll() {
  const patch = currentPatch = doc.read();
  if (document.activeElement !== byId('patch-name')) byId('patch-name').value = patch.name;
  paintOscillators(patch); paintSideControls(); paintGraphs(patch);
  byId('undo').disabled = !doc.canUndo; byId('redo').disabled = !doc.canRedo;
}
function switchEnvelope(kind) {
  if (kind === envelopeKind) return;
  if (doc.previewing) doc.commit();
  envelopeEditor?.destroy(); envelopeEditor = undefined; envelopeSelection = undefined; envelopeKind = kind;
  for (const button of document.querySelectorAll('[data-envelope]')) button.setAttribute('aria-selected', String(button.dataset.envelope === kind));
  currentPatch = doc.read(); paintGraphs(currentPatch);
}

function stopAll() {
  audio.stop(); pointerNotes.clear(); computerNotes.clear(); previewActive = false;
  byId('preview-button').textContent = '持续试听'; byId('preview-button').setAttribute('aria-pressed', 'false');
  for (const key of document.querySelectorAll('.piano-key')) key.classList.remove('is-held');
}
function paintKeyboard() {
  const piano = byId('piano'); piano.replaceChildren();
  for (let index = 0; index < 24; index++) {
    const midi = keyboardOctave * 12 + 12 + index;
    if (midi < 12 || midi > 120) continue;
    const key = document.createElement('button'); key.className = 'piano-key'; key.dataset.midi = String(midi);
    key.classList.toggle('is-black', [1,3,6,8,10].includes(midi%12)); key.textContent = noteName(midi); key.title = `${noteName(midi)} · ${readable(frequency(midi))} Hz`;
    key.addEventListener('pointerdown', event => {
      if (event.button !== 0) return; event.preventDefault();
      const id = `pointer-${event.pointerId}`; if (pointerNotes.has(event.pointerId)) audio.noteOff(id);
      pointerNotes.set(event.pointerId, { id, key }); key.classList.add('is-held'); key.setPointerCapture?.(event.pointerId);
      void audio.noteOn(id, midi, Number(byId('export-velocity').value));
    }); piano.append(key);
  }
}
function releasePointer(event) {
  const note = pointerNotes.get(event.pointerId); if (!note) return;
  audio.noteOff(note.id); note.key.classList.remove('is-held'); pointerNotes.delete(event.pointerId);
}
function updatePreviewPitch() {
  outputAnalysis.clear(); paintAnalysis();
  const midi = Number(byId('preview-note').value); byId('preview-frequency').textContent = `${readable(frequency(midi))} Hz`;
  updateEnvelopeSummary();
  if (previewActive) { audio.noteOff('continuous-preview'); void audio.noteOn('continuous-preview', midi, Number(byId('export-velocity').value)); }
}

async function savePatch() {
  if (saving || opening) return; saving = true; paintFileBusy(); clearTimeout(recoveryTimer);
  stopAll();
  if (doc.previewing) doc.commit();
  const snapshot = doc.read();
  try {
    const result = await bridge.request('savePatch', { text: JSON.stringify(snapshot, null, 2), name: snapshot.name });
    if (result.status === 'saved') {
      doc.markSaved(snapshot); changed({ repaint: false, recovery: false }); status('已保存');
      if (doc.dirty) changed({ repaint: false });
    }
  } catch (reason) { error(reason); }
  finally { saving = false; paintFileBusy(); }
}
function paintFileBusy() { for (const id of ['new-patch','open-patch','save-patch']) byId(id).disabled = saving || opening; }
async function openPatch() {
  if (opening || saving) return; opening = true; paintFileBusy();
  stopAll();
  try {
    await bridge.request('setDirty', { dirty: doc.dirty });
    if (!bridge.native && doc.dirty && !confirm('放下当前修改并打开另一个音色？')) return;
    const result = await bridge.request('openPatch');
    if (result.status === 'opened') {
      const imported = importPatch(JSON.parse(result.text));
      await bridge.request('clearRecovery'); stopAll(); clearTimeout(recoveryTimer); doc.reset(imported.patch);
      changed({ recovery: false }); status(imported.reduced ? '已打开 · 旧曲线已简化至10点以内，原文件保留' : '已打开');
    } else if (result.status === 'invalid') throw new Error('音色文件过大或无效');
  } catch (reason) { error(reason); }
  finally { opening = false; paintFileBusy(); }
}
async function exportWave() {
  if (renderAbort) return;
  if (doc.previewing) doc.commit();
  const snapshot = doc.read(), controller = new AbortController(); renderAbort = controller;
  byId('render-progress').hidden = false; byId('cancel-render').hidden = false; byId('export-wav').disabled = true; status('生成音频…');
  try {
    const sampleRate = Number(byId('export-rate').value), midi = Number(byId('preview-note').value);
    const holdSeconds = Number(byId('export-hold').value), tailSeconds = Number(byId('export-tail').value), velocity = Number(byId('export-velocity').value);
    if (![holdSeconds,tailSeconds,velocity].every(Number.isFinite) || holdSeconds < .01 || holdSeconds > 55 || tailSeconds < 0 || tailSeconds > 10 || holdSeconds + tailSeconds > 60 || velocity <= 0 || velocity > 1)
      throw new Error('检查输出时长与力度；按住加尾音最多60秒');
    const rendered = await audio.render(snapshot, { sampleRate, midi, velocity, holdSeconds, tailSeconds }, controller.signal);
    if (controller.signal.aborted) return;
    const result = await bridge.request('exportWav', { base64: bytesToBase64(new Uint8Array(rendered.bytes)), name: `${snapshot.name}-${noteName(midi)}` });
    if (result.status === 'saved') status(`已导出 · ${readable(rendered.durationSeconds)} s · 24 bit`);
  } catch (reason) { if (reason.name === 'AbortError') status('已取消导出'); else error(reason); }
  finally { renderAbort = undefined; byId('render-progress').hidden = true; byId('cancel-render').hidden = true; byId('export-wav').disabled = false; }
}

byId('new-patch').addEventListener('click', async () => {
  if (opening || saving) return;
  if (doc.dirty && !confirm('放下当前修改，开始新的音色？')) return;
  opening = true; paintFileBusy();
  stopAll(); clearTimeout(recoveryTimer);
  try { await bridge.request('clearRecovery'); doc.reset(createDefaultPatch()); changed({ recovery: false }); status('新的音色'); } catch (reason) { error(reason); }
  finally { opening = false; paintFileBusy(); }
});
byId('open-patch').addEventListener('click', () => { void openPatch(); });
byId('save-patch').addEventListener('click', () => { void savePatch(); });
byId('export-wav').addEventListener('click', () => { void exportWave(); });
byId('cancel-render').addEventListener('click', () => renderAbort?.abort());
byId('patch-name').addEventListener('change', event => edit(['name'], event.target.value));
byId('undo').addEventListener('click', () => { doc.undo(); changed(); });
byId('redo').addEventListener('click', () => { doc.redo(); changed(); });
byId('spectrum-flat').addEventListener('click', () => edit(['spectrum','points'], resizeCurve([{ x: 20, y: 0, curve: 0 }, { x: 20000, y: 0, curve: 0 }], currentPatch.spectrum.points.length, { logX: true })));
byId('spectrum-mix').addEventListener('input', event => { const amount = Number(event.target.value); byId('spectrum-mix-value').textContent = `${Math.round(amount*100)}%`; edit(['spectrum','mix'], amount, true); });
byId('spectrum-mix').addEventListener('change', event => edit(['spectrum','mix'], Number(event.target.value)));
for (const button of document.querySelectorAll('[data-envelope]')) button.addEventListener('click', () => switchEnvelope(button.dataset.envelope));
byId('envelope-length').addEventListener('change', event => {
  const length = Number(event.target.value);
  if (!Number.isFinite(length) || length < .01 || length > 60) { paintGraphs(doc.read()); return; }
  const patch = doc.read(), points = patch[envelopeKind].points, oldLength = points.at(-1).x;
  edit([envelopeKind,'points'], points.map(point => ({ ...point, x: point.x / oldLength * length })));
});
byId('sustain-point').addEventListener('click', () => {
  const selected = envelopeEditor.getSelected(); if (!selected || selected.index >= doc.read()[envelopeKind].points.length - 1) return;
  edit([envelopeKind,'sustainIndex'], selected.index);
});
for (const preset of presets) { const option = document.createElement('option'); option.value = preset.id; option.textContent = preset.name; byId('preset-select').append(option); }
byId('preset-select').addEventListener('change', event => {
  const preset = presets.find(item => item.id === event.target.value); if (!preset) return;
  stopAll(); doc.commit(preset.patch); changed(); event.target.value = '';
});
for (let midi = 12; midi <= 120; midi++) { const option = document.createElement('option'); option.value = String(midi); option.textContent = noteName(midi); byId('preview-note').append(option); }
byId('preview-note').value = '60'; byId('preview-note').addEventListener('change', updatePreviewPitch);
byId('preview-button').addEventListener('click', () => {
  previewActive = !previewActive;
  byId('preview-button').textContent = previewActive ? '松开试听' : '持续试听'; byId('preview-button').setAttribute('aria-pressed', String(previewActive));
  if (previewActive) void audio.noteOn('continuous-preview', Number(byId('preview-note').value), Number(byId('export-velocity').value));
  else audio.noteOff('continuous-preview');
});
byId('stop-audio').addEventListener('click', stopAll);
byId('keyboard-toggle').addEventListener('click', () => { keyboardEnabled = !keyboardEnabled; byId('keyboard-toggle').setAttribute('aria-pressed', String(keyboardEnabled)); if (!keyboardEnabled) stopAll(); });
byId('octave-down').addEventListener('click', () => { stopAll(); keyboardOctave = clamp(keyboardOctave - 1, 0, 8); paintKeyboard(); });
byId('octave-up').addEventListener('click', () => { stopAll(); keyboardOctave = clamp(keyboardOctave + 1, 0, 8); paintKeyboard(); });
document.addEventListener('pointerup', releasePointer); document.addEventListener('pointercancel', releasePointer);
window.addEventListener('blur', stopAll);
document.addEventListener('visibilitychange', () => { if (document.hidden) stopAll(); });
document.addEventListener('keydown', event => {
  if (event.isComposing || event.repeat) return;
  const typing = event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement || event.target instanceof HTMLTextAreaElement || event.target?.isContentEditable;
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') { event.preventDefault(); void savePatch(); return; }
  if (!typing && (event.ctrlKey || event.metaKey) && ['z','y'].includes(event.key.toLowerCase())) {
    event.preventDefault(); if (event.key.toLowerCase() === 'y' || event.shiftKey) doc.redo(); else doc.undo(); changed(); return;
  }
  if (typing || !keyboardEnabled || event.ctrlKey || event.metaKey || event.altKey) return;
  const key = event.key.toLowerCase();
  if (key === 'z' || key === 'x') { event.preventDefault(); stopAll(); keyboardOctave = clamp(keyboardOctave + (key === 'z' ? -1 : 1), 0, 8); paintKeyboard(); return; }
  if (key === ' ') { event.preventDefault(); stopAll(); return; }
  const offset = key.length === 1 ? 'cfvgbnjmk,l.'.indexOf(key) : -1; if (offset < 0) return;
  const midi = keyboardOctave*12+12+offset; if (midi < 12 || midi > 120) return;
  event.preventDefault(); const id = `key-${event.code || key}`; computerNotes.set(event.code || key, id);
  document.querySelector(`.piano-key[data-midi="${midi}"]`)?.classList.add('is-held');
  void audio.noteOn(id, midi, Number(byId('export-velocity').value));
});
document.addEventListener('keyup', event => { const id = computerNotes.get(event.code || event.key.toLowerCase()); if (id) { audio.noteOff(id); computerNotes.delete(event.code || event.key.toLowerCase()); for (const key of document.querySelectorAll('.piano-key')) key.classList.toggle('is-held', audio.activeKeys.has(Number(key.dataset.midi))); } });
bridge.onEvent(message => { if (message.event === 'requestSave') void savePatch(); else if (message.event === 'beforeClose') { stopAll(); clearTimeout(recoveryTimer); renderAbort?.abort(); void audio.dispose(); } });

function monitor(timestamp = 0) {
  const analyser = audio.analyser, canvas = byId('monitor'), context = canvas.getContext('2d');
  if (analyser) analyser.getFloatTimeDomainData(meterData); else meterData.fill(0);
  const note = audio.noteClock;
  if (analyser && (timestamp - lastAnalysisFrame >= 50 || timestamp < lastAnalysisFrame)) {
    lastAnalysisFrame = timestamp; analyser.getFloatFrequencyData(spectrumData);
    outputAnalysis.update({ samples: meterData, frequencyDb: spectrumData, sampleRate: audio.sampleRate,
      note, patch: currentPatch, multipleKeys: audio.activeKeys.size > 1 });
    paintAnalysis();
  }
  if (context) {
    context.clearRect(0,0,canvas.width,canvas.height); context.strokeStyle = '#2479aa'; context.lineWidth = 1;
    const data = meterData.subarray(meterData.length - 512);
    let peak = 0; context.beginPath();
    for (let index=0;index<data.length;index++) { const value=data[index] || 0; peak=Math.max(peak,Math.abs(value)); const x=index/(data.length-1)*canvas.width, y=(.5-value*.42)*canvas.height; if (index) context.lineTo(x,y); else context.moveTo(x,y); } context.stroke();
    byId('peak-level').textContent = peak>1e-7 ? `${(20*Math.log10(peak)).toFixed(1)} dB` : '−∞ dB';
  }
  const env = currentPatch[envelopeKind];
  if (note) {
    const sustain = env.points[env.sustainIndex].x;
    const phase = note.released === null ? Math.min(note.age,sustain) : sustain + note.age - (note.released-note.started);
    envelopeEditor?.setPlayhead(phase <= env.points.at(-1).x ? phase : undefined);
  } else envelopeEditor?.setPlayhead(undefined);
  meterFrame = requestAnimationFrame(monitor);
}
async function initialize() {
  changed({ recovery: false }); paintKeyboard(); updatePreviewPitch(); monitor();
  try {
    const info = await bridge.request('getInfo'); byId('export-wav').title = info.outputDirectory ? `默认保存到 ${info.outputDirectory}` : '导出24位WAV';
    const recovery = await bridge.request('loadRecovery');
    if (recovery.status === 'opened') {
      let restored;
      try { restored = importPatch(JSON.parse(recovery.text)).patch; } catch { status('恢复稿无法读取，当前音色已保留', true); return; }
      if (confirm('继续上次未保存的音色？')) { restoring = true; doc.reset(restored, false); changed({ recovery: false }); restoring = false; status('已恢复'); }
      else await bridge.request('clearRecovery');
    }
  } catch (reason) { error(reason); }
}
window.addEventListener('beforeunload', () => { cancelAnimationFrame(meterFrame); renderAbort?.abort(); void audio.dispose(); });
void initialize();
