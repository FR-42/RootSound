import type { BasicWaveform, SoundRuntimePort, PlayableNotePlan, SoundSequencePlan } from '../../contracts/sound.ts';
import type { SynthesizerBody, TimbreEditorPort } from '../../contracts/timbre.ts';
import { synthesisFromBasic, timbrePresets } from '../timbre/public.ts';
import { createLivePreview } from './live-preview.ts';
import { createSaveControls } from './save-controls.ts';
import { createReferenceNavigation, type ReferenceEditorContext } from './reference-ui.ts';
import './synth.css';
import { mountImportedSpectralWorkspace } from './imported-spectral-workspace.ts';

function node<K extends keyof HTMLElementTagNameMap>(tag: K, cls = '', text = ''): HTMLElementTagNameMap[K] {
  const result = document.createElement(tag); result.className = cls; result.textContent = text; return result;
}
function button(text: string, cls: string, run: () => void): HTMLButtonElement {
  const result = node('button', cls, text); result.type = 'button'; result.addEventListener('click', run); return result;
}
const clone = <T>(value: T): T => structuredClone(value);
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
const waves: Array<[BasicWaveform, string]> = [['sine', '圆波'], ['triangle', '三角波'], ['sawtooth', '锯齿波'], ['square', '方波'], ['noise', '噪声']];
type Options = {
  timbre: TimbreEditorPort; sound: SoundRuntimePort;
  onWelcome(): void; onNew(): void; onSave(): void; onSaveCopy?(): void;
  onPhrase?(): void; onSong?(): void; onSampling?(): void; onLibrary?(): void; onMySounds?(): void;
  onImport?(): void; onExportSound?(): void; onExportAudio?(): void; onSettings?(): void;
  referenceContext?: ReferenceEditorContext; onApplyElsewhere?(): void; renderEntities?(): HTMLElement;
};

/** One electronic editor also displays legacy recipes without migrating them on open. */
export function mountSynthWorkspace(root: HTMLElement, options: Options) {
  const { timbre, sound } = options;
  if (timbre.read().body.model === 'spectral-synth') return mountImportedSpectralWorkspace(root, options);
  let disposed = false; let session: string | undefined; let preparing = false; let generation = 0;
  let temporary: SynthesizerBody | undefined; let frequency = 220; let fieldError: unknown; let committing = false;
  let endGesture: (() => void) | undefined;
  let envelopeSpan = 2;
  const initialId = timbre.read().draft.id;
  function body(): SynthesizerBody {
    const current = timbre.read().body;
    if (current.model === 'sample-instrument' || current.model === 'spectral-synth') throw new Error('当前音色类型已改变，请重新打开。');
    return synthesisFromBasic(current);
  }
  const initialBody = JSON.stringify(body());
  const initialPreset = timbrePresets().find(preset => JSON.stringify(preset.body) === initialBody);
  if (initialPreset?.category === '低音' || initialPreset?.id === 'kick') frequency = 55;
  const live = createLivePreview(sound, () => session, error => report(String(error), true));
  const page = node('div', 'studio synth-studio'); const toolbar = node('header', 'studio-toolbar');
  toolbar.append(button('RootSound', 'wordmark brand-button', () => leave(options.onWelcome)));
  const tabs = node('nav', 'workspace-tabs'); tabs.setAttribute('aria-label', '创作工作区');
  if (options.onSampling) tabs.append(button('采样获取', 'workspace-tab', () => leave(options.onSampling!)));
  tabs.append(button('音色制作', 'workspace-tab is-active', () => {}));
  if (options.onPhrase) tabs.append(button('乐句谱写', 'workspace-tab', () => leave(options.onPhrase!)));
  if (options.onSong) tabs.append(button('歌曲编排', 'workspace-tab', () => leave(options.onSong!)));
  toolbar.append(tabs); const tools = node('nav', 'toolbar-tools');
  tools.append(button('新建音色', 'secondary synth-new', () => leave(options.onNew)));
  if (options.onMySounds) tools.append(button('打开音色', 'quiet', () => leave(options.onMySounds!)));
  const fileActions = node('div', 'save-controls-popup'); fileActions.popover = 'auto'; fileActions.id = `synth-files-${crypto.randomUUID()}`;
  const fileButton = button('文件', 'quiet', () => {}); fileButton.setAttribute('popovertarget', fileActions.id); fileButton.setAttribute('aria-label', '音色文件操作');
  for (const [label, callback] of [['导入音色…', options.onImport], ['导出音色…', options.onExportSound], ['导出音频…', options.onExportAudio]] as const)
    if (callback) fileActions.append(button(label, 'save-controls-option', () => { fileActions.hidePopover(); leave(callback); }));
  fileActions.addEventListener('beforetoggle', event => { if ((event as ToggleEvent).newState === 'open') queueMicrotask(() => {
    if (!fileActions.matches(':popover-open')) return; const anchor = fileButton.getBoundingClientRect(); const size = fileActions.getBoundingClientRect();
    fileActions.style.left = `${Math.max(8, Math.min(anchor.right - size.width, window.innerWidth - size.width - 8))}px`;
    fileActions.style.top = `${Math.max(8, Math.min(anchor.bottom + 6, window.innerHeight - size.height - 8))}px`;
  }); });
  if (fileActions.children.length) tools.append(fileButton, fileActions);
  if (options.onLibrary) tools.append(button('素材', 'quiet', () => leave(options.onLibrary!)));
  if (options.onSettings) tools.append(button('设置', 'quiet', () => leave(options.onSettings!)));
  const saveControls = createSaveControls({ onSave: save }); tools.append(saveControls.element);
  toolbar.append(tools); page.append(toolbar);
  const main = node('main', 'synth-workspace'); const navigation = node('div', 'synth-navigation'); main.append(navigation);
  const heading = node('header', 'synth-heading'); const title = node('div'); const name = node('input', 'sound-name');
  name.maxLength = 100; name.setAttribute('aria-label', '音色名称'); const state = node('p', 'save-state'); title.append(name, state);
  const transport = node('div', 'synth-transport'); const undo = button('撤销', 'quiet', () => edit(() => timbre.undo())); const redo = button('重做', 'quiet', () => edit(() => timbre.redo()));
  const listenMode = node('select'); listenMode.setAttribute('aria-label', '试听方式');
  for (const [value, label] of [['long', '长音'], ['repeat', '重复']]) { const option = node('option', '', label); option.value = value!; listenMode.append(option); }
  listenMode.value = body().sustain < .05 ? 'repeat' : 'long';
  const listen = button('▶ 试听', 'preview-button', () => { void play(); }); transport.append(undo, redo, listenMode, listen); heading.append(title, transport); main.append(heading);
  const start = node('div', 'synth-start'); const startLabel = node('label', '', '起点'); const preset = node('select'); preset.setAttribute('aria-label', '音色起点');
  preset.append(node('option', '', '选择一个起点…')); preset.options[0]!.value = '';
  for (const category of ['旋律', '低音', '铺底', '打击', '音效']) {
    const group = node('optgroup'); group.label = category;
    for (const item of timbrePresets().filter(item => item.category === category)) { const option = node('option', '', item.name); option.value = item.id; group.append(option); }
    preset.append(group);
  }
  startLabel.append(preset); start.append(startLabel); main.append(start);
  const panels = node('div', 'synth-panels'); const sourcesPanel = node('section', 'synth-panel synth-sources');
  const sourcesHeader = node('header', 'synth-panel-heading'); const add = button('＋ 声源', 'quiet', () => mutate(current => {
    if (current.sources.length >= 4) throw new Error('当前最多叠加四个声源。');
    current.sources.push({ id: crypto.randomUUID(), waveform: 'sine', enabled: true, semitones: 0, detuneCents: 0, level: .5 });
  })); sourcesHeader.append(node('h2', '', '声音组成'), add); sourcesPanel.append(sourcesHeader);
  const sourceList = node('div', 'synth-source-list'); sourcesPanel.append(sourceList); panels.append(sourcesPanel);
  const shapePanel = node('section', 'synth-panel synth-shape'); shapePanel.append(node('h2', '', '音量形状'));
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); svg.classList.add('synth-envelope'); svg.setAttribute('viewBox', '0 0 600 200'); svg.setAttribute('aria-label', '可拖动的音量曲线');
  const path = document.createElementNS(svg.namespaceURI, 'path'); path.classList.add('synth-envelope-line'); svg.append(path);
  const handles = ['起音', '回落与保持', '收音'].map(label => {
    const dot = document.createElementNS(svg.namespaceURI, 'circle') as SVGCircleElement;
    dot.classList.add('envelope-handle'); dot.setAttribute('r', '8'); dot.setAttribute('tabindex', '0'); dot.setAttribute('role', 'slider'); dot.setAttribute('aria-label', label);
    svg.append(dot); return dot;
  }); shapePanel.append(svg);
  const envelopeFields = node('div', 'synth-envelope-fields'); shapePanel.append(envelopeFields);
  const bindings: Array<() => void> = []; let sourceBindings: Array<() => void> = []; let sourceSignature = '';
  function range(parent: HTMLElement, label: string, min: number, max: number, step: number, get: (value: SynthesizerBody) => number, set: (value: SynthesizerBody, number: number) => void, format: (value: number) => string = value => String(Number(value.toFixed(2))), logarithmic = false, list = bindings): HTMLInputElement {
    const field = node('label', 'synth-parameter'); const line = node('span', 'synth-parameter-title', label); const output = node('output'); line.append(output);
    const input = node('input'); input.type = 'range'; input.min = String(logarithmic ? 0 : min); input.max = String(logarithmic ? 1 : max); input.step = String(logarithmic ? .001 : step); input.setAttribute('aria-label', label);
    const decode = () => logarithmic ? min * (max / min) ** Number(input.value) : Number(input.value);
    input.addEventListener('input', () => { const value = decode(); output.textContent = format(value); preview(current => set(current, value)); });
    input.addEventListener('change', () => { const value = decode(); mutate(current => set(current, value)); });
    input.addEventListener('pointercancel', () => { temporary = undefined; update(); live.flush(plan); });
    field.append(line, input); parent.append(field);
    list.push(() => { const value = get(temporary ?? body()); if (document.activeElement !== input) input.value = String(logarithmic ? Math.log(value / min) / Math.log(max / min) : value); output.textContent = format(value); });
    return input;
  }
  const seconds = (value: number) => `${Number(value.toFixed(3))} s`; const percent = (value: number) => `${Math.round(value * 100)}%`;
  range(envelopeFields, '起音', 0, 5, .005, value => value.attackSeconds, (value, n) => { value.attackSeconds = n; }, seconds);
  range(envelopeFields, '回落', 0, 5, .005, value => value.decaySeconds, (value, n) => { value.decaySeconds = n; }, seconds);
  range(envelopeFields, '保持', 0, 1, .01, value => value.sustain, (value, n) => { value.sustain = n; }, percent);
  range(envelopeFields, '收音', 0, 10, .01, value => value.releaseSeconds, (value, n) => { value.releaseSeconds = n; }, seconds);
  panels.append(shapePanel);
  const color = node('section', 'synth-panel synth-color'); const colorHead = node('header', 'synth-panel-heading');
  colorHead.append(node('h2', '', '声音明暗')); const enabled = node('input'); enabled.type = 'checkbox'; enabled.setAttribute('aria-label', '启用声音明暗'); colorHead.append(enabled); color.append(colorHead);
  const filterType = node('select'); filterType.setAttribute('aria-label', '声音明暗方式');
  for (const [value, label] of [['lowpass', '柔化高音'], ['highpass', '削去低音'], ['bandpass', '突出一段']]) { const option = node('option', '', label); option.value = value!; filterType.append(option); } color.append(filterType);
  const cutoff = range(color, '明暗位置', 20, 20000, 1, value => value.filter.frequencyHz, (value, n) => { value.filter.frequencyHz = n; }, value => `${Math.round(value)} Hz`, true);
  const resonance = range(color, '共鸣', 0, 8, .05, value => value.filter.resonance, (value, n) => { value.filter.resonance = n; });
  panels.append(color);
  const motion = node('details', 'synth-panel synth-motion'); motion.append(node('summary', '', '音高变化'));
  range(motion, '起始偏移', -48, 48, 1, value => value.pitch.semitones, (value, n) => { value.pitch.semitones = n; }, value => `${value > 0 ? '+' : ''}${value} 半音`);
  range(motion, '回到原音', .005, 5, .005, value => value.pitch.seconds, (value, n) => { value.pitch.seconds = n; }, seconds);
  panels.append(motion); main.append(panels);
  const keyboard = node('div', 'synth-keyboard'); keyboard.setAttribute('aria-label', '音色试音键盘');
  const names = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B', 'C'];
  const typingKeys = ['KeyA', 'KeyW', 'KeyS', 'KeyE', 'KeyD', 'KeyF', 'KeyT', 'KeyG', 'KeyY', 'KeyH', 'KeyU', 'KeyJ', 'KeyK'];
  names.forEach((label, index) => {
    const key = button(`${label}${index === 12 ? 5 : 4}`, label.includes('♯') ? 'synth-key is-black' : 'synth-key', () => { frequency = 261.625565 * 2 ** (index / 12); void audition(); });
    key.title = `键盘 ${typingKeys[index]!.slice(3)}`;
    const blackPosition = new Map([[1, 1], [3, 2], [6, 4], [8, 5], [10, 6]]).get(index);
    if (blackPosition !== undefined) key.style.left = `${blackPosition / 8 * 100}%`;
    keyboard.append(key);
  });
  main.append(keyboard);
  const footer = node('footer', 'synth-footer'); range(footer, '音量', 0, 1, .01, value => value.level, (value, n) => { value.level = n; }, percent);
  main.append(footer);
  let saveControlsSignature = '';
  const notice = node('p', 'studio-notice'); notice.setAttribute('role', 'status'); main.append(notice); page.append(main);
  let entities = options.renderEntities?.(); let entitySignature = '';
  if (entities) { page.classList.add('has-entity-rail'); page.append(entities); } root.replaceChildren(page);

  function report(message: string, error = false): void { if (!disposed) { notice.textContent = message; notice.classList.toggle('is-error', error); } }
  function safely(action: () => void): void { try { action(); } catch (error) { if (committing) fieldError = error; temporary = undefined; report(error instanceof Error ? error.message : String(error), true); update(); live.flush(plan); } }
  function commit(): void { fieldError = undefined; committing = true; try { endGesture?.(); if (document.activeElement instanceof HTMLElement) document.activeElement.blur(); } finally { committing = false; } if (fieldError !== undefined) throw fieldError; }
  function leave(callback: () => void): void { safely(() => { commit(); stop(); callback(); }); }
  function plan(): PlayableNotePlan | SoundSequencePlan {
    const repeat = listenMode.value === 'repeat';
    const note = timbre.previewPlan(temporary ?? body(), { frequencyHz: frequency, holdSeconds: repeat ? .45 : 4, velocity: .8 });
    return repeat ? { kind: 'sequence', version: 1, durationSeconds: 4, events: Array.from({ length: 8 }, (_, index) => ({ atSeconds: index * .5, sound: note })) } : note;
  }
  function stop(): void { generation++; preparing = false; session = undefined; live.cancel(); sound.stopAll(); listen.textContent = '▶ 试听'; }
  async function play(): Promise<void> {
    if (session || preparing) { stop(); return; } const request = ++generation; preparing = true; listen.textContent = '取消准备';
    try { const result = await sound.preview(plan()); if (disposed || request !== generation) { sound.stop(result.id); return; } session = result.status === 'playing' ? result.id : undefined; listen.textContent = session ? '■ 停止' : '▶ 试听'; }
    catch (error) { report(error instanceof Error ? error.message : String(error), true); }
    finally { if (!disposed && request === generation) { preparing = false; if (!session) listen.textContent = '▶ 试听'; } }
  }
  async function audition(): Promise<void> { try { await sound.audition(timbre.previewPlan(temporary ?? body(), { frequencyHz: frequency, holdSeconds: .65, velocity: .8 })); } catch (error) { if (!disposed) report(String(error), true); } }
  function edit(action: () => void): void { safely(() => { temporary = undefined; action(); update(); live.flush(plan); }); }
  function mutate(change: (value: SynthesizerBody) => void): void { edit(() => { const current = body(); change(current); timbre.setSynthesis(current); }); }
  function preview(change: (value: SynthesizerBody) => void): void { temporary = clone(temporary ?? body()); change(temporary); draw(); bindings.forEach(bind => bind()); sourceBindings.forEach(bind => bind()); state.textContent = '正在调整…'; live.request(plan); }
  function save(): void { safely(() => { commit(); (options.referenceContext?.onSave ?? options.onSave)(); if (!disposed) update(); }); }
  function draw(): void {
    const current = temporary ?? body(); const hold = Math.max(1, current.attackSeconds + current.decaySeconds + .5);
    // Keep the horizontal scale fixed while grabbing a point, so its endpoint
    // follows the pointer instead of remaining pinned to an auto-scaled edge.
    if (!endGesture) envelopeSpan = Math.max(2, hold + current.releaseSeconds + .5);
    const total = envelopeSpan;
    const x = (time: number) => 24 + time / total * 552; const y = (level: number) => 172 - level * 140;
    path.setAttribute('d', `M24 172L${x(current.attackSeconds)} 32L${x(current.attackSeconds + current.decaySeconds)} ${y(current.sustain)}H${x(hold)}L${x(hold + current.releaseSeconds)} 172`);
    [[x(current.attackSeconds), 32], [x(current.attackSeconds + current.decaySeconds), y(current.sustain)], [x(hold + current.releaseSeconds), 172]].forEach(([cx, cy], index) => { handles[index]!.setAttribute('cx', String(cx)); handles[index]!.setAttribute('cy', String(cy)); });
    handles.forEach((dot, index) => {
      const value = index === 0 ? current.attackSeconds : index === 1 ? current.sustain : current.releaseSeconds;
      dot.setAttribute('aria-valuemin', '0'); dot.setAttribute('aria-valuemax', String(index === 0 ? 5 : index === 1 ? 1 : 10)); dot.setAttribute('aria-valuenow', String(value));
      dot.setAttribute('aria-valuetext', index === 1 ? `${seconds(current.decaySeconds)} · ${percent(value)}` : seconds(value));
    });
  }
  function renderSources(current: SynthesizerBody): void {
    sourceList.replaceChildren(); sourceBindings = [];
    for (let i = 0; i < current.sources.length; i++) {
      const row = node('article', 'synth-source'); const head = node('header'); const on = node('input'); on.type = 'checkbox'; on.setAttribute('aria-label', `启用声源 ${i + 1}`);
      const wave = node('select'); wave.setAttribute('aria-label', `声源 ${i + 1} 波形`);
      waves.forEach(([id, label]) => { const option = node('option', '', label); option.value = id; wave.append(option); });
      const remove = button('×', 'quiet', () => mutate(value => { value.sources.splice(i, 1); })); remove.title = '移除声源'; remove.setAttribute('aria-label', `移除声源 ${i + 1}`); remove.disabled = current.sources.length === 1;
      head.append(on, node('span', 'synth-source-number', String(i + 1)), wave, remove); row.append(head);
      range(row, `声源 ${i + 1} 音量`, 0, 1, .01, value => value.sources[i]!.level, (value, n) => { value.sources[i]!.level = n; }, percent, false, sourceBindings);
      const tuning = node('details', 'synth-tuning'); tuning.append(node('summary', '', '音高与微调'));
      range(tuning, `声源 ${i + 1} 音高`, -24, 24, .01, value => value.sources[i]!.semitones, (value, n) => { value.sources[i]!.semitones = n; }, value => `${Number(value.toFixed(2))} 半音`, false, sourceBindings);
      range(tuning, `声源 ${i + 1} 微调`, -100, 100, 1, value => value.sources[i]!.detuneCents, (value, n) => { value.sources[i]!.detuneCents = n; }, value => `${value} 音分`, false, sourceBindings);
      row.append(tuning); sourceList.append(row);
      on.addEventListener('change', () => mutate(value => { value.sources[i]!.enabled = on.checked; }));
      wave.addEventListener('change', () => mutate(value => { value.sources[i]!.waveform = wave.value as BasicWaveform; }));
      sourceBindings.push(() => { const source = (temporary ?? body()).sources[i]!; on.checked = source.enabled; wave.value = source.waveform; tuning.hidden = source.waveform === 'noise'; row.classList.toggle('is-muted', !source.enabled); });
    }
  }
  function update(): void {
    if (disposed) return;
    const view = timbre.read(); if (view.draft.id !== initialId) return;
    const current = temporary ?? body(); if (document.activeElement !== name) name.value = view.draft.name;
    state.textContent = view.changed ? '编辑稿已保留' : '已保存音色'; undo.disabled = !view.canUndo; redo.disabled = !view.canRedo;
    const signature = current.sources.map(source => source.id).join('|'); if (signature !== sourceSignature) { sourceSignature = signature; renderSources(current); }
    bindings.forEach(bind => bind()); sourceBindings.forEach(bind => bind()); add.disabled = current.sources.length >= 4;
    enabled.checked = current.filter.enabled; filterType.value = current.filter.type; filterType.disabled = cutoff.disabled = resonance.disabled = !current.filter.enabled; draw();
    motion.hidden = current.sources.every(source => !source.enabled || source.waveform === 'noise');
    navigation.replaceChildren(); if (options.referenceContext) navigation.append(createReferenceNavigation({ ...options.referenceContext, onBack: () => leave(options.referenceContext!.onBack) }));
    const canCopy = !!(!options.referenceContext && view.draft.sourceId && options.onSaveCopy);
    const canApply = !!(options.referenceContext?.onApplyElsewhere ?? options.onApplyElsewhere); const saveSignature = `${canCopy}|${canApply}`;
    if (saveSignature !== saveControlsSignature) {
      saveControlsSignature = saveSignature; saveControls.update({ onSave: save,
        onSaveCopy: canCopy ? () => leave(options.onSaveCopy!) : undefined,
        onApplyElsewhere: canApply ? () => leave((options.referenceContext?.onApplyElsewhere ?? options.onApplyElsewhere)!) : undefined });
    }
    const sig = JSON.stringify([view.draft.id, view.draft.name, view.changed]);
    if (options.renderEntities && sig !== entitySignature) { const next = options.renderEntities(); entities?.replaceWith(next); entities = next; entitySignature = sig; }
  }
  name.addEventListener('change', () => edit(() => timbre.rename(name.value)));
  preset.addEventListener('change', () => { const chosen = timbrePresets().find(item => item.id === preset.value); if (!chosen) return; edit(() => timbre.setSynthesis(chosen.body)); preset.value = ''; listenMode.value = chosen.body.sustain < .05 ? 'repeat' : 'long'; if (chosen.category === '低音' || chosen.id === 'kick') frequency = 55; else frequency = 220; live.flush(plan); void audition(); });
  listenMode.addEventListener('change', () => live.flush(plan));
  enabled.addEventListener('change', () => mutate(value => { value.filter.enabled = enabled.checked; }));
  filterType.addEventListener('change', () => mutate(value => { value.filter.type = filterType.value as SynthesizerBody['filter']['type']; }));
  handles.forEach((dot, index) => {
    dot.addEventListener('keydown', event => { if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return; event.preventDefault(); const sign = event.key === 'ArrowLeft' || event.key === 'ArrowDown' ? -1 : 1; mutate(value => {
      if (index === 0) value.attackSeconds = clamp(value.attackSeconds + sign * .01, 0, 5);
      else if (index === 2) value.releaseSeconds = clamp(value.releaseSeconds + sign * .01, 0, 10);
      else if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') value.decaySeconds = clamp(value.decaySeconds + sign * .01, 0, 5);
      else value.sustain = clamp(value.sustain + sign * .01, 0, 1);
    }); });
    dot.addEventListener('pointerdown', event => {
      if (event.button !== 0) return; event.preventDefault(); endGesture?.();
      const initial = body(); const bounds = svg.getBoundingClientRect(); const matrix = svg.getScreenCTM()?.inverse();
      const coordinates = (input: PointerEvent) => {
        if (matrix) { const point = svg.createSVGPoint(); point.x = input.clientX; point.y = input.clientY; return point.matrixTransform(matrix); }
        return { x: (input.clientX - bounds.left) / bounds.width * 600, y: (input.clientY - bounds.top) / bounds.height * 200 };
      };
      const origin = coordinates(event); const total = envelopeSpan; let moved = false;
      dot.setPointerCapture(event.pointerId);
      const move = (input: PointerEvent) => { moved = true; const point = coordinates(input); const secondsDelta = (point.x - origin.x) / 552 * total;
        preview(value => { if (index === 0) value.attackSeconds = clamp(initial.attackSeconds + secondsDelta, 0, 5); else if (index === 2) value.releaseSeconds = clamp(initial.releaseSeconds + secondsDelta, 0, 10); else { value.decaySeconds = clamp(initial.decaySeconds + secondsDelta, 0, 5); value.sustain = clamp(initial.sustain - (point.y - origin.y) / 140, 0, 1); } });
      };
      const finish = (keep: boolean) => { dot.removeEventListener('pointermove', move); dot.removeEventListener('pointerup', up); dot.removeEventListener('pointercancel', cancel); dot.removeEventListener('lostpointercapture', cancel); endGesture = undefined; if (dot.hasPointerCapture(event.pointerId)) dot.releasePointerCapture(event.pointerId); const candidate = temporary; temporary = undefined; if (keep && moved && candidate) edit(() => timbre.setSynthesis(candidate)); else { update(); live.flush(plan); } };
      const up = () => finish(true); const cancel = () => finish(false); endGesture = cancel;
      dot.addEventListener('pointermove', move); dot.addEventListener('pointerup', up); dot.addEventListener('pointercancel', cancel); dot.addEventListener('lostpointercapture', cancel);
    });
  });
  const unsubscribe = sound.subscribe(event => { if (!disposed && event.type === 'session' && event.session.id === session && event.session.status !== 'playing') { session = undefined; listen.textContent = '▶ 试听'; if (event.session.status === 'failed') report(event.session.error ?? '试听失败。', true); } });
  const keydown = (event: KeyboardEvent) => {
    if (disposed || root.querySelector('dialog[open]') || root.querySelector(':popover-open')) return;
    if ((event.ctrlKey || event.metaKey) && (event.code === 'KeyS' || event.key.toLowerCase() === 's')) { event.preventDefault(); save(); return; }
    const typing = event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement || event.target instanceof HTMLTextAreaElement;
    if (!typing && (event.ctrlKey || event.metaKey) && ['KeyZ', 'KeyY'].includes(event.code)) { event.preventDefault(); edit(() => event.code === 'KeyY' || event.shiftKey ? timbre.redo() : timbre.undo()); return; }
    if (!typing && event.code === 'Space' && !(event.target instanceof HTMLButtonElement)) { event.preventDefault(); void play(); }
    if (!typing && !event.ctrlKey && !event.metaKey && !event.altKey && !event.repeat) {
      const index = typingKeys.indexOf(event.code); if (index >= 0) { event.preventDefault(); frequency = 261.625565 * 2 ** (index / 12); void audition(); }
    }
    if (event.key === 'Escape') { endGesture?.(); stop(); }
  };
  document.addEventListener('keydown', keydown); update();
  return { refresh(context?: ReferenceEditorContext, onApplyElsewhere?: () => void) { options.referenceContext = context; options.onApplyElsewhere = onApplyElsewhere; update(); }, notify: report,
    dispose() { if (disposed) return; endGesture?.(); disposed = true; generation++; live.cancel(); unsubscribe(); sound.stopAll(); document.removeEventListener('keydown', keydown); } };
}
