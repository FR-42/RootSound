import type { SampleTimbreBody, TimbreEditorPort } from '../../contracts/timbre.ts';
import type { SoundPlan, SoundRuntimePort } from '../../contracts/sound.ts';
import { createLivePreview } from './live-preview.ts';
import { createSaveControls } from './save-controls.ts';
import { createReferenceNavigation, type ReferenceEditorContext } from './reference-ui.ts';
import './sample-timbre.css';

function node<K extends keyof HTMLElementTagNameMap>(tag: K, className = '', text = ''): HTMLElementTagNameMap[K] {
  const value = document.createElement(tag); value.className = className; value.textContent = text; return value;
}
function button(text: string, className: string, action: () => void): HTMLButtonElement {
  const value = node('button', className, text); value.type = 'button'; value.addEventListener('click', action); return value;
}
const clamp = (value: number, minimum: number, maximum: number) => Math.max(minimum, Math.min(maximum, value));
const errorMessage = (error: unknown) => error instanceof Error ? error.message : String(error);
const noteNames = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];

/** Sample content stays in its owner; this task shows a non-destructive playback selection. */
export function mountSampleTimbreWorkspace(root: HTMLElement, options: {
  timbre: TimbreEditorPort; sound: SoundRuntimePort;
  onWelcome(): void; onSound(): void;
  onSampling?(): void; onCoCreation?(): void; onPhrase?(): void; onSong?(): void;
  onLibrary?(): void; onMySounds?(): void; onNewSound?(): void; onSettings?(): void; onExport?(): void;
  referenceContext?: ReferenceEditorContext; onSave?(): void; onApplyElsewhere?(): void;
  renderEntities?(): HTMLElement;
}): { dispose(): void; refresh(context?: ReferenceEditorContext, onApplyElsewhere?: () => void): void; notify(message: string, error?: boolean): void } {
  const { timbre, sound } = options;
  let disposed = false; let generation = 0; let loadingGeneration = 0;
  let preparing = false; let sessionId: string | undefined; let selectedPitch = 1;
  let liveBody: SampleTimbreBody | undefined; let endGesture: (() => void) | undefined;
  let waveSignature = ''; let loadedSource = ''; let waveDuration = 0;
  let committingField = false; let fieldCommitError: unknown;
  const pitchButtons = new Map<number, HTMLButtonElement>();
  function body(): SampleTimbreBody {
    const value = timbre.read().body;
    if (value.model !== 'sample-instrument') throw new Error('当前声音已改变，请重新打开采样音色。');
    return value;
  }
  const initialDraftId = timbre.read().draft.id;
  const livePreview = createLivePreview(sound, () => sessionId, error => report(errorMessage(error), true), undefined, () => timbre.preparePreview());
  const page = node('div', 'studio sample-timbre-studio');
  const toolbar = node('header', 'studio-toolbar'); toolbar.append(button('RootSound', 'wordmark brand-button', () => leave(options.onWelcome)));
  const tabs = node('nav', 'workspace-tabs'); tabs.setAttribute('aria-label', '切换创作工作区');
  if (options.onSampling) tabs.append(button('采样获取', 'workspace-tab', () => leave(options.onSampling!)));
  tabs.append(button('音色制作', 'workspace-tab is-active', () => {}));
  if (options.onPhrase) tabs.append(button('乐句谱写', 'workspace-tab', () => leave(options.onPhrase!)));
  if (options.onSong) tabs.append(button('歌曲编排', 'workspace-tab', () => leave(options.onSong!)));
  toolbar.append(tabs);
  const tools = node('nav', 'toolbar-tools');
  const newSound = options.onNewSound ? button('新建音色', 'quiet', () => leave(options.onNewSound!)) : undefined;
  const mySounds = options.onMySounds ? button('我的音色', 'quiet', () => leave(options.onMySounds!)) : undefined;
  if (newSound) tools.append(newSound); if (mySounds) tools.append(mySounds);
  if (options.onExport) tools.append(button('导出音频', 'quiet', () => leave(options.onExport!)));
  if (options.onLibrary) tools.append(button('素材', 'quiet', () => leave(options.onLibrary!)));
  if (options.onSettings) tools.append(button('设置', 'quiet', () => leave(options.onSettings!)));
  const saveControls = createSaveControls({ onSave: save }); tools.append(saveControls.element);
  toolbar.append(tools); page.append(toolbar);
  const main = node('main', 'sample-timbre-workspace');
  const navigation = node('div'); main.append(navigation);
  const card = node('section', 'sound-card sample-timbre-card');
  const header = node('div', 'sound-card-header'); const nameGroup = node('div');
  const name = node('input', 'sound-name'); name.maxLength = 100; name.setAttribute('aria-label', '采样音色名称');
  const saveState = node('p', 'save-state'); nameGroup.append(name, saveState);
  const stop = button('停止试听', 'quiet', () => { stopPlayback(); report('试听已停止。'); }); stop.hidden = true;
  const history = node('div', 'synth-transport');
  const undo = button('撤销', 'quiet', () => change(() => timbre.undo())); const redo = button('重做', 'quiet', () => change(() => timbre.redo()));
  history.append(undo, redo, stop); header.append(nameGroup, history); card.append(header);
  const source = node('div', 'sample-timbre-source'); const sourceName = node('p'); const sourceState = node('p', 'sample-timbre-source-state'); source.append(sourceName, sourceState); card.append(source);
  const trim = node('section', 'sample-timbre-trim');
  trim.append(node('h2', '', '播放范围'));
  const wave = node('div', 'sample-timbre-wave');
  wave.title = '拖动两端选择播放范围，原素材保持完整。';
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); svg.setAttribute('viewBox', '0 0 1000 160'); svg.setAttribute('preserveAspectRatio', 'none'); svg.setAttribute('aria-hidden', 'true');
  const wavePath = document.createElementNS('http://www.w3.org/2000/svg', 'path'); svg.append(wavePath); wave.append(svg);
  const leftShade = node('div', 'sample-trim-shade is-left'); const rightShade = node('div', 'sample-trim-shade is-right'); const selection = node('div', 'sample-trim-selection');
  const startHandle = button('开始', 'sample-trim-handle is-start', () => {}); const endHandle = button('结束', 'sample-trim-handle is-end', () => {});
  for (const [handle, label] of [[startHandle, '采样播放起点'], [endHandle, '采样播放终点']] as const) { handle.setAttribute('role', 'slider'); handle.setAttribute('aria-label', label); handle.setAttribute('aria-orientation', 'horizontal'); }
  wave.append(leftShade, rightShade, selection, startHandle, endHandle); trim.append(wave);
  const times = node('div', 'sample-timbre-times');
  function numberField(label: string, className: string): HTMLInputElement {
    const field = node('label', className, label); const input = node('input'); input.type = 'number'; input.step = '0.001'; input.min = '0'; input.setAttribute('aria-label', label); field.append(input, node('span', '', '秒')); times.append(field); return input;
  }
  const startInput = numberField('开始', 'sample-time-field'); const endInput = numberField('结束', 'sample-time-field'); const span = node('p', 'sample-trim-duration'); times.append(span); trim.append(times); card.append(trim);
  const looping = node('details', 'sample-looping'); looping.append(node('summary', '', '延长声音'));
  const loopLabel = node('label'); const loopEnabled = node('input'); loopEnabled.type = 'checkbox'; loopLabel.append(loopEnabled, node('span', '', '循环延音')); looping.append(loopLabel);
  loopLabel.title = '保留开头，只重复指定片段直到音符结束。选择平稳、衔接自然的片段。';
  function loopField(label: string): HTMLInputElement {
    const field = node('label', 'sample-time-field', label); const input = node('input'); input.type = 'number'; input.min = '0'; input.step = '.001'; input.setAttribute('aria-label', label); field.append(input, node('span', '', '秒')); looping.append(field); return input;
  }
  const loopStart = loopField('循环开始'); const loopEnd = loopField('循环结束'); trim.append(looping);
  const tuning = node('section', 'sample-timbre-tuning');
  tuning.append(node('h2', '', '原始音高'));
  const pitchPicker = node('select', 'sample-root-picker'); pitchPicker.setAttribute('aria-label', '原始音高');
  pitchPicker.title = '手动设置原音高；改变播放音高也会改变速度与长短。';
  const custom = node('option', '', '自定义音高'); custom.value = 'custom'; pitchPicker.append(custom);
  const pitches: Array<{ hz: number; label: string }> = [];
  for (let midi = 16; midi <= 111; midi++) {
    const hz = 440 * 2 ** ((midi - 69) / 12); const label = `${noteNames[midi % 12]}${Math.floor(midi / 12) - 1}`;
    const option = node('option', '', label); option.value = String(hz); pitchPicker.append(option); pitches.push({ hz, label });
  }
  tuning.append(pitchPicker);
  const precise = node('details', 'sample-timbre-precise'); precise.append(node('summary', '', '频率'));
  const frequencyField = node('label', '', '原始频率'); const frequency = node('input'); frequency.type = 'number'; frequency.min = '20'; frequency.max = '5000'; frequency.step = 'any'; frequency.setAttribute('aria-label', '原始音高频率'); frequencyField.append(frequency, node('span', '', 'Hz')); precise.append(frequencyField); tuning.append(precise);
  const audition = node('div', 'sample-timbre-audition');
  for (const [ratio, label] of [[0.5, '低八度'], [1, '原音'], [2, '高八度']] as const) {
    const control = button(label, ratio === 1 ? 'preview-button' : 'secondary', () => { void play(ratio); }); pitchButtons.set(ratio, control); audition.append(control);
  }
  tuning.append(audition); card.append(tuning);
  const contour = node('section', 'sample-timbre-contour'); contour.append(node('h2', '', '起落'));
  const envelope = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); envelope.setAttribute('viewBox', '0 0 540 125'); envelope.setAttribute('preserveAspectRatio', 'none'); envelope.classList.add('envelope-graph'); envelope.setAttribute('aria-label', '声音起落曲线');
  const envelopePath = document.createElementNS('http://www.w3.org/2000/svg', 'path'); envelopePath.classList.add('envelope-line');
  const attackDot = document.createElementNS('http://www.w3.org/2000/svg', 'circle'); const releaseDot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  for (const dot of [attackDot, releaseDot]) { dot.classList.add('envelope-handle'); dot.setAttribute('r', '7'); }
  envelope.append(envelopePath, attackDot, releaseDot); contour.append(envelope);
  const envelopeSliders = node('div', 'envelope-sliders');
  function slider(label: string, maximum: number, step: string): HTMLInputElement {
    const field = node('label', 'slider-field', label); const input = node('input'); input.type = 'range'; input.min = label === '收音' ? '0.01' : '0'; input.max = String(maximum); input.step = step; input.setAttribute('aria-label', label); field.append(input); envelopeSliders.append(field); return input;
  }
  const attack = slider('起音', 2, '0.005'); const release = slider('收音', 4, '0.01'); contour.append(envelopeSliders); card.append(contour);
  const footer = node('div', 'sound-card-footer'); const volumeLabel = node('label', 'volume-control', '轻一点'); const volume = node('input'); volume.type = 'range'; volume.min = '0'; volume.max = '1'; volume.step = '0.01'; volume.setAttribute('aria-label', '声音音量'); volumeLabel.append(volume, node('span', '', '响一点')); footer.append(volumeLabel);
  let hasApplyElsewhere: boolean | undefined;
  card.append(footer); main.append(card);
  const notice = node('p', 'studio-notice'); notice.setAttribute('role', 'status'); main.append(notice); page.append(main);
  let entities = options.renderEntities?.(); let entitiesSignature = '';
  if (entities) { page.classList.add('has-entity-rail'); page.append(entities); }
  root.replaceChildren(page);

  function report(message: string, error = false): void { if (!disposed) { notice.textContent = message; notice.classList.toggle('is-error', error); } }
  function safely(action: () => void): void { try { action(); } catch (error) { if (committingField) fieldCommitError = error; liveBody = undefined; report(errorMessage(error), true); update(); livePreview.flush(() => timbre.previewPlan(undefined, note())); } }
  function note(ratio = selectedPitch): SoundPlan['note'] {
    const current = liveBody ?? body(); return { frequencyHz: current.rootFrequencyHz * ratio, holdSeconds: current.loop ? 2 : Math.max(0.0001, Math.min(1, (current.endSeconds - current.startSeconds) / ratio * 0.65)), velocity: 0.8 };
  }
  function syncPlayback(): void {
    stop.hidden = !preparing && !sessionId; stop.textContent = preparing ? '取消准备' : '停止试听';
    const current = liveBody ?? body();
    for (const [ratio, control] of pitchButtons) {
      control.disabled = current.rootFrequencyHz * ratio < 20 || current.rootFrequencyHz * ratio > 5000;
      control.setAttribute('aria-pressed', String(selectedPitch === ratio && (preparing || !!sessionId)));
    }
  }
  function stopPlayback(): void { generation++; preparing = false; sessionId = undefined; livePreview.cancel(); sound.stopAll(); if (!disposed) syncPlayback(); }
  function commitField(): void {
    fieldCommitError = undefined; committingField = true;
    try { endGesture?.(); if (document.activeElement instanceof HTMLElement) document.activeElement.blur(); }
    finally { committingField = false; }
    if (fieldCommitError !== undefined) throw fieldCommitError;
  }
  function leave(callback: () => void): void { safely(() => { commitField(); stopPlayback(); callback(); }); }
  async function play(ratio: number): Promise<void> {
    if (disposed) return;
    if (selectedPitch === ratio && (preparing || sessionId)) { stopPlayback(); report('试听已停止。'); return; }
    stopPlayback(); selectedPitch = ratio; const request = ++generation; preparing = true; syncPlayback();
    const snapshot = JSON.stringify(timbre.read().draft);
    report('正在准备这段声音…');
    try {
      await timbre.preparePreview(); if (disposed || request !== generation) return;
      if (JSON.stringify(timbre.read().draft) !== snapshot) throw new Error('声音已改变，请重新试听当前版本。');
      update(); const playback = await sound.preview(timbre.previewPlan(liveBody, note(ratio)));
      if (disposed || request !== generation) { sound.stop(playback.id); return; }
      sessionId = playback.status === 'playing' ? playback.id : undefined;
      if (playback.status === 'failed') throw new Error(playback.error ?? '试听未能完成。');
      report(sessionId ? '正在试听…' : '试听结束。');
    } catch (error) { if (!disposed && request === generation) report(errorMessage(error), true); }
    finally { if (!disposed && request === generation) { preparing = false; syncPlayback(); } }
  }
  function save(): void {
    safely(() => {
      commitField(); const callback = options.referenceContext?.onSave ?? options.onSave;
      if (callback) callback(); else {
        const result = timbre.save(timbre.read().draft.sourceId ? 'overwrite' : 'new');
        if (result.status !== 'saved') throw new Error(result.status === 'conflict' ? result.reason : result.status === 'storage-error' ? result.message : '请先选择声音的保存范围。');
        report(`“${result.content.name}”已保存。`);
      }
      if (!disposed) update();
    });
  }
  function draw(current: SampleTimbreBody): void {
    const duration = waveDuration || current.endSeconds; const start = clamp(current.startSeconds / duration * 100, 0, 100); const end = clamp(current.endSeconds / duration * 100, 0, 100);
    leftShade.style.width = `${start}%`; rightShade.style.left = `${end}%`; selection.style.left = `${start}%`; selection.style.width = `${end - start}%`;
    startHandle.style.left = `${start}%`; endHandle.style.left = `${end}%`;
    for (const [control, value] of [[startHandle, current.startSeconds], [endHandle, current.endSeconds]] as const) { control.setAttribute('aria-valuemin', '0'); control.setAttribute('aria-valuemax', String(duration)); control.setAttribute('aria-valuenow', String(value)); control.setAttribute('aria-valuetext', `${value.toFixed(3)} 秒`); }
    if (document.activeElement !== startInput) startInput.value = String(Number(current.startSeconds.toFixed(6)));
    if (document.activeElement !== endInput) endInput.value = String(Number(current.endSeconds.toFixed(6)));
    span.textContent = `保留 ${(current.endSeconds - current.startSeconds).toFixed(3)} 秒`;
    const attackX = 25 + current.attackSeconds / 2 * 180; const releaseX = 320 + current.releaseSeconds / 4 * 195;
    envelopePath.setAttribute('d', `M25 105L${attackX} 22H320L${releaseX} 105`); attackDot.setAttribute('cx', String(attackX)); attackDot.setAttribute('cy', '22'); releaseDot.setAttribute('cx', String(releaseX)); releaseDot.setAttribute('cy', '105');
    attack.value = String(current.attackSeconds); release.value = String(current.releaseSeconds); volume.value = String(current.level);
  }
  function update(): void {
    if (disposed) return;
    try {
      const view = timbre.read(); const current = liveBody ?? body();
      if (view.draft.id !== initialDraftId) { stopPlayback(); report('当前编辑稿已改变，请重新打开声音。', true); return; }
      if (document.activeElement !== name) name.value = view.draft.name;
      saveState.textContent = liveBody ? '正在调整…' : view.changed ? '编辑稿已保留' : '已保存';
      undo.disabled = !view.canUndo; redo.disabled = !view.canRedo;
      loopEnabled.checked = !!current.loop; loopStart.disabled = loopEnd.disabled = !current.loop;
      if (document.activeElement !== loopStart) loopStart.value = String(current.loop?.startSeconds ?? current.startSeconds);
      if (document.activeElement !== loopEnd) loopEnd.value = String(current.loop?.endSeconds ?? current.endSeconds);
      waveDuration = view.sample?.durationSeconds ?? current.endSeconds;
      sourceName.textContent = view.sample?.name ?? '采样素材';
      sourceState.textContent = view.sample?.ready ? '' : '准备中…';
      const values = view.sample?.waveform ?? []; const signature = values.join(',');
      if (signature !== waveSignature) {
        waveSignature = signature;
        const coordinates = values.map((value, index) => ({ x: values.length < 2 ? 500 : index * 1000 / (values.length - 1), amplitude: clamp(Math.abs(value), 0, 1) * 62 }));
        wavePath.setAttribute('d', coordinates.length ? `M${coordinates.map(point => `${point.x},${80 - point.amplitude}`).join('L')}L${coordinates.slice().reverse().map(point => `${point.x},${80 + point.amplitude}`).join('L')}Z` : '');
      }
      const nearest = pitches.find(pitch => Math.abs(pitch.hz - current.rootFrequencyHz) < 1e-6);
      if (document.activeElement !== pitchPicker) pitchPicker.value = nearest ? String(nearest.hz) : 'custom';
      if (document.activeElement !== frequency) frequency.value = String(current.rootFrequencyHz);
      draw(current); syncPlayback();
      navigation.replaceChildren(); if (options.referenceContext) {
        const context = options.referenceContext;
        navigation.append(createReferenceNavigation({ ...context, onBack: () => leave(context.onBack) }));
      }
      if (newSound) newSound.hidden = false; if (mySounds) mySounds.hidden = !!options.referenceContext;
      const canApply = !!(options.referenceContext?.onApplyElsewhere ?? options.onApplyElsewhere);
      if (hasApplyElsewhere !== canApply) {
        hasApplyElsewhere = canApply; saveControls.update({ onSave: save,
          onApplyElsewhere: canApply ? () => safely(() => { commitField(); (options.referenceContext?.onApplyElsewhere ?? options.onApplyElsewhere)?.(); }) : undefined });
      }
      const entitySignature = JSON.stringify([view.draft.id, view.draft.name, view.draft.sourceId, view.changed]);
      if (options.renderEntities && entitySignature !== entitiesSignature) {
        const next = options.renderEntities(); entities?.replaceWith(next); entities = next; entitiesSignature = entitySignature;
      }
    } catch (error) { report(errorMessage(error), true); }
  }
  async function prepare(): Promise<void> {
    const sourceId = body().sampleId; if (loadedSource === sourceId && timbre.read().sample?.ready) return;
    const request = ++loadingGeneration; report('正在读取采样声音…');
    try { await timbre.preparePreview(); if (!disposed && request === loadingGeneration && timbre.read().draft.id === initialDraftId && body().sampleId === sourceId) { loadedSource = sourceId; update(); report(''); } }
    catch (error) { if (!disposed && request === loadingGeneration) report(errorMessage(error), true); }
  }
  function change(action: () => void): void { safely(() => { liveBody = undefined; action(); update(); livePreview.flush(() => timbre.previewPlan(undefined, note())); }); }
  name.addEventListener('change', () => change(() => timbre.rename(name.value)));
  startInput.addEventListener('change', () => change(() => timbre.setSampleRange(Number(startInput.value), body().endSeconds)));
  endInput.addEventListener('change', () => change(() => timbre.setSampleRange(body().startSeconds, Number(endInput.value))));
  loopEnabled.addEventListener('change', () => change(() => { const current = body(); timbre.setSampleLoop(loopEnabled.checked ? { startSeconds: current.startSeconds, endSeconds: current.endSeconds } : undefined); }));
  loopStart.addEventListener('change', () => change(() => timbre.setSampleLoop({ startSeconds: Number(loopStart.value), endSeconds: body().loop!.endSeconds })));
  loopEnd.addEventListener('change', () => change(() => timbre.setSampleLoop({ startSeconds: body().loop!.startSeconds, endSeconds: Number(loopEnd.value) })));
  pitchPicker.addEventListener('change', () => { if (pitchPicker.value !== 'custom') change(() => timbre.setRootFrequency(Number(pitchPicker.value))); else { precise.open = true; frequency.focus(); } });
  frequency.addEventListener('change', () => change(() => timbre.setRootFrequency(Number(frequency.value))));
  function provisional(patch: Partial<SampleTimbreBody>): void { liveBody = { ...body(), ...patch }; draw(liveBody); saveState.textContent = '正在调整…'; livePreview.request(() => timbre.previewPlan(liveBody, note())); }
  attack.addEventListener('input', () => provisional({ attackSeconds: Number(attack.value) })); release.addEventListener('input', () => provisional({ releaseSeconds: Number(release.value) })); volume.addEventListener('input', () => provisional({ level: Number(volume.value) }));
  attack.addEventListener('change', () => change(() => timbre.setEnvelope(Number(attack.value), body().releaseSeconds)));
  release.addEventListener('change', () => change(() => timbre.setEnvelope(body().attackSeconds, Number(release.value)))); volume.addEventListener('change', () => change(() => timbre.setLevel(Number(volume.value))));
  for (const input of [attack, release, volume]) input.addEventListener('pointercancel', () => { liveBody = undefined; update(); livePreview.flush(() => timbre.previewPlan(undefined, note())); });
  function drag(handle: HTMLElement | SVGCircleElement, event: PointerEvent, make: (initial: SampleTimbreBody, input: PointerEvent) => Partial<SampleTimbreBody>, commit: (value: SampleTimbreBody) => void): void {
    if (event.button !== 0 || disposed) return; event.preventDefault(); endGesture?.();
    const initial = body(); let moved = false; handle.setPointerCapture(event.pointerId);
    const move: EventListener = input => { moved = true; provisional(make(initial, input as PointerEvent)); };
    const finish = (keep: boolean) => {
      handle.removeEventListener('pointermove', move); handle.removeEventListener('pointerup', up); handle.removeEventListener('pointercancel', cancel); handle.removeEventListener('lostpointercapture', cancel);
      endGesture = undefined; if (handle.hasPointerCapture(event.pointerId)) handle.releasePointerCapture(event.pointerId);
      const candidate = liveBody; liveBody = undefined;
      if (keep && moved && candidate) change(() => commit(candidate)); else { update(); livePreview.flush(() => timbre.previewPlan(undefined, note())); }
    };
    const up = () => finish(true); const cancel = () => finish(false); endGesture = cancel;
    handle.addEventListener('pointermove', move); handle.addEventListener('pointerup', up); handle.addEventListener('pointercancel', cancel); handle.addEventListener('lostpointercapture', cancel);
  }
  for (const [handle, start] of [[startHandle, true], [endHandle, false]] as const) {
    handle.addEventListener('pointerdown', event => drag(handle, event, (initial, input) => {
      const bounds = wave.getBoundingClientRect(); const time = clamp((input.clientX - bounds.left) / bounds.width * waveDuration, 0, waveDuration);
      const gap = Math.min(0.001, initial.endSeconds - initial.startSeconds);
      return start ? { startSeconds: Math.min(time, initial.endSeconds - gap) } : { endSeconds: Math.max(time, initial.startSeconds + gap) };
    }, current => timbre.setSampleRange(current.startSeconds, current.endSeconds)));
    handle.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return; event.preventDefault(); const current = body(); const delta = (event.key === 'ArrowLeft' ? -1 : 1) * (event.shiftKey ? 0.01 : 0.001);
      const gap = Math.min(0.001, current.endSeconds - current.startSeconds);
      change(() => timbre.setSampleRange(start ? clamp(current.startSeconds + delta, 0, current.endSeconds - gap) : current.startSeconds, start ? current.endSeconds : clamp(current.endSeconds + delta, current.startSeconds + gap, waveDuration)));
    });
  }
  for (const [dot, isAttack] of [[attackDot, true], [releaseDot, false]] as const) dot.addEventListener('pointerdown', event => {
    const startX = event.clientX; const width = envelope.getBoundingClientRect().width || 540;
    drag(dot, event, (initial, input) => isAttack ? { attackSeconds: clamp(initial.attackSeconds + (input.clientX - startX) / width * 540 / 180 * 2, 0, 2) } : { releaseSeconds: clamp(initial.releaseSeconds + (input.clientX - startX) / width * 540 / 195 * 4, 0.01, 4) }, current => timbre.setEnvelope(current.attackSeconds, current.releaseSeconds));
  });
  const unsubscribe = sound.subscribe(event => { if (!disposed && event.type === 'session' && event.session.id === sessionId && event.session.status !== 'playing') { sessionId = undefined; report(event.session.status === 'failed' ? event.session.error ?? '试听失败。' : '试听已结束。', event.session.status === 'failed'); syncPlayback(); } });
  const keydown = (event: KeyboardEvent) => {
    if (disposed || root.querySelector('dialog[open]')) return;
    if ((event.ctrlKey || event.metaKey) && (event.code === 'KeyS' || event.key.toLowerCase() === 's')) { event.preventDefault(); save(); return; }
    if ((event.ctrlKey || event.metaKey) && ['KeyZ', 'KeyY'].includes(event.code) && !(event.target instanceof HTMLInputElement)) { event.preventDefault(); change(() => event.code === 'KeyY' || event.shiftKey ? timbre.redo() : timbre.undo()); return; }
    if (event.code === 'Space' && !(event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement || event.target instanceof HTMLButtonElement)) { event.preventDefault(); void play(selectedPitch); }
    else if (event.key === 'Escape') { endGesture?.(); stopPlayback(); }
  };
  document.addEventListener('keydown', keydown); update(); void prepare();
  return {
    refresh(context, onApplyElsewhere) { options.referenceContext = context; options.onApplyElsewhere = onApplyElsewhere; update(); },
    notify: report,
    dispose() { if (disposed) return; endGesture?.(); disposed = true; generation++; loadingGeneration++; livePreview.cancel(); unsubscribe(); sound.stopAll(); document.removeEventListener('keydown', keydown); },
  };
}
