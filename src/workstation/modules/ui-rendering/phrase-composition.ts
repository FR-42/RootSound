import type { PhraseEditorPort, PhraseSection, PhraseView } from '../../contracts/phrase.ts';
import { phraseStepsPerBeat } from '../../contracts/phrase.ts';
import type { SoundRuntimePort } from '../../contracts/sound.ts';
import { createPhraseCompositionTransport } from './phrase-composition-transport.ts';
import { mountMelodyWorkspace } from './melody-workspace.ts';
import { attachConsoleHorizontalWheel } from './console-scroll.ts';
import { undoPhraseEdit } from './phrase-performance-history.ts';
import { clampMelodyView, melodyClamp, melodyScale, melodyTimeAt, zoomMelody, type MelodyView } from './melody-geometry.ts';
import type { PhraseEditorViewport } from './phrase-editor-viewport.ts';
import { centerTop, mountPhraseOverviewNotes } from './phrase-overview-notes.ts';
import { clampPhraseSplit, defaultPhraseSplit, phraseSplitBounds } from './phrase-section-split.ts';
import './song.css';
import './phrase-composition.css';

function node<K extends keyof HTMLElementTagNameMap>(tag: K, className = '', text = ''): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag); element.className = className; element.textContent = text; return element;
}
function action(text: string, className: string, callback: () => void): HTMLButtonElement {
  const button = node('button', className, text); button.type = 'button'; button.addEventListener('click', callback); return button;
}
function icon(kind: 'play' | 'pause' | 'stop' | 'tempo' | 'volume'): SVGSVGElement {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); svg.setAttribute('viewBox', '0 0 24 24'); svg.setAttribute('aria-hidden', 'true');
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', { play: 'M8 5v14l11-7z', pause: 'M7 5h3v14H7zM14 5h3v14h-3z', stop: 'M6 6h12v12H6z',
    tempo: 'M9 3h6l5 18H4zM12 6v10m-3-4 7-5M8 18h8', volume: 'M4 9h4l5-4v14l-5-4H4zM16 8q5 4 0 8M19 5q7 7 0 14' }[kind]);
  path.setAttribute('fill', ['play', 'pause', 'stop'].includes(kind) ? 'currentColor' : 'none'); path.setAttribute('stroke', 'currentColor'); path.setAttribute('stroke-width', '1.5'); path.setAttribute('stroke-linejoin', 'round'); svg.append(path); return svg;
}

/** A bounded shared canvas is the phrase workspace; notes remain owned by the phrase domain. */
export function mountPhraseComposition(root: HTMLElement, options: {
  phrase: PhraseEditorPort; sound: SoundRuntimePort;
  onSave?(): void | Promise<void>; onSaveAs?(): void | Promise<void>; onExit?(): void | Promise<void>;
  onRename?(name: string): void | Promise<void>;
  onSettings?(): void;
  readPerformanceMode?(): boolean;
  initialSection?: 'overview' | PhraseSection;
  onSectionChange?(section: 'overview' | PhraseSection): void;
  onPrepareMelody?(): void | Promise<void>;
  listTimbres?(): { id: string; name: string; requiresDeleteConfirmation?: boolean }[];
  onAddTimbre?(id: string, section: PhraseSection): string;
  onImportTimbre?(): Promise<boolean>;
  onCreateNoteGroup?(id: string): string;
  onChangeNoteGroupTimbre?(partId: string, timbreId: string): void;
  onRemoveTimbre?(id: string, section: PhraseSection | 'all'): void;
  onReorderTimbres?(id: string, targetIndex: number): void;
}): { dispose(): void; refresh(): void; notify(message: string, error?: boolean): void; flush(): Promise<void> } {
  const { phrase, sound } = options;
  let disposed = false; let current = phrase.read(); let draftId = current.draft?.id;
  let view: MelodyView = { leftSeconds: 0, zoom: current.body ? 8 / (current.body.lengthBeats * 60 / current.body.tempoBpm) : 1, rowHeight: 24 };
  const keyboard = phrase.keyboard().slice().reverse();
  const sectionViews: Record<PhraseSection, { top: number; rowHeight: number; initialized: boolean }> = {
    melody: { top: 0, rowHeight: 24, initialized: false }, rhythm: { top: 0, rowHeight: 72, initialized: false },
  };
  let overviewSection: PhraseSection = 'melody';
  let splitRatio = .5; let displayedSplit = .5; let splitInitialized = false;
  let overviewFrame = 0; let headWidth = 1;
  let busy = false; let frame = 0; let noticeTimer = 0; let observer: ResizeObserver | undefined;
  let keepDraftViewport = false;
  let sectionEditor: ReturnType<typeof mountMelodyWorkspace> | undefined;
  let activeSection: PhraseSection | undefined;
  let previewBody: Parameters<PhraseEditorPort['previewPlan']>[0];
  let state = { playing: false, preparing: false, position: 0, rate: 1 };
  let playButton: HTMLButtonElement; let clock: HTMLElement; let viewport: HTMLElement; let ruler: HTMLElement;
  let playhead: HTMLElement; let handle: HTMLButtonElement; let notice: HTMLElement; let title: HTMLElement;
  let tempoInput: HTMLInputElement; let masterInput: HTMLInputElement; let rateButton: HTMLButtonElement;
  let subdivisionSelect: HTMLSelectElement; let subdivisionButton: HTMLButtonElement;
  let titleInput: HTMLInputElement | undefined; let titleCommit: Promise<boolean> | undefined;
  let masterPreview: number | undefined; let masterPointer: number | undefined;
  const fileButtons: HTMLButtonElement[] = [];
  let gesture: { kind: 'head' | 'pan' | 'split'; id: number; capture: HTMLElement; lastX: number; lastY: number; section: PhraseSection; startRatio?: number; startTops?: Record<PhraseSection, number> } | undefined;
  const tempo = () => current.body?.tempoBpm ?? 120;
  const length = () => current.body?.lengthBeats ?? 16;
  const duration = () => length() * 60 / tempo();
  const timelineWidth = () => Math.max(1, viewport.clientWidth);
  const gridTempo = tempo;
  function report(message: string, error = false): void {
    if (disposed || !notice) return;
    notice.textContent = message; notice.hidden = !message; notice.classList.toggle('is-error', error);
    window.clearTimeout(noticeTimer); noticeTimer = window.setTimeout(() => { if (!disposed) notice.hidden = true; }, error ? 7000 : 3200);
  }
  function playbackBody(): Parameters<PhraseEditorPort['previewPlan']>[0] {
      let body = previewBody ?? current.body;
      // Creation includes every family, including notes stored in the former
      // rhythm section. Keeping their original markers avoids rewriting music.
      if (body && masterPreview !== undefined) body = { ...body, masterLevel: masterPreview };
      return body;
  }
  const transport = createPhraseCompositionTransport({ runtime: sound, tempoBpm: tempo, lengthBeats: length,
    prepare: () => phrase.preparePreview(playbackBody()), readPlan: () => phrase.previewPlan(playbackBody(), { allowSilence: true }),
    onChange(next) { state = next; updatePlayback(); }, onError: error => report(error instanceof Error ? error.message : String(error), true) });

  function updateTitle(): void { if (!titleInput && title) title.textContent = current.draft?.name ?? '乐句'; }
  function sync(snapshot?: PhraseView): void {
    current = snapshot ?? phrase.read();
    if (draftId !== current.draft?.id) {
      draftId = current.draft?.id;
      if (!keepDraftViewport || !current.body) {
        view = { leftSeconds: 0, zoom: 8 / duration(), rowHeight: 24 };
        sectionViews.melody = { top: 0, rowHeight: 24, initialized: false };
        sectionViews.rhythm = { top: 0, rowHeight: 72, initialized: false };
        splitInitialized = false;
        masterPreview = undefined; transport.stop();
      }
    }
    updateTitle();
    if (document.activeElement !== tempoInput) tempoInput.value = String(gridTempo());
    if (document.activeElement !== masterInput) masterInput.value = String(masterPreview ?? current.body?.masterLevel ?? 1);
    if (document.activeElement !== subdivisionSelect) subdivisionSelect.value = String(phraseStepsPerBeat(current.body));
    subdivisionButton.textContent = `${phraseStepsPerBeat(current.body)}格`;
    syncConsole();
    for (const button of fileButtons) button.disabled = busy || !current.draft;
    if (playButton) playButton.disabled = busy || !current.body;
    tempoInput.disabled = masterInput.disabled = busy || !current.body;
    subdivisionSelect.disabled = subdivisionButton.disabled = busy || !current.body;
  }
  function positionHead(): void {
    if (disposed || !viewport) return;
    const seconds = transport.position();
    const ms = Math.round(seconds * 1000); clock.textContent = `${Math.floor(ms / 60000).toString().padStart(2, '0')}:${Math.floor(ms / 1000 % 60).toString().padStart(2, '0')}.${(ms % 1000).toString().padStart(3, '0')}`;
    if (sectionEditor) { sectionEditor.setPlayhead(seconds); return; }
    const beat = Math.max(0, Math.min(length(), seconds * tempo() / 60));
    const width = headWidth; const x = (Math.max(0, Math.min(duration(), seconds)) - view.leftSeconds) * melodyScale(view, width, duration());
    playhead.hidden = x < 0 || x > width; handle.hidden = playhead.hidden;
    playhead.style.left = `${Math.min(width - 1, Math.max(0, x))}px`; handle.style.left = `${Math.min(width - 1, Math.max(0, x))}px`;
    handle.setAttribute('aria-valuenow', String(beat)); handle.setAttribute('aria-valuemax', String(length())); handle.title = `${Number(beat.toFixed(3))} 拍`;
    viewport.dataset.leftBeat = String(view.leftSeconds * tempo() / 60); viewport.dataset.zoom = String(view.zoom * duration() / 8);
    viewport.dataset.leftSeconds = String(view.leftSeconds); viewport.dataset.visibleSeconds = String(8 / view.zoom);
  }
  function updatePlayback(): void {
    if (!playButton || disposed) return;
    playButton.replaceChildren(icon(state.playing ? 'pause' : 'play')); playButton.classList.toggle('is-preparing', state.preparing);
    playButton.setAttribute('aria-label', state.preparing ? '取消播放准备' : state.playing ? '暂停' : '播放');
    cancelAnimationFrame(frame); positionHead(); if (state.playing) frame = requestAnimationFrame(tick);
  }
  function tick(): void { if (!disposed) { positionHead(); if (state.playing) frame = requestAnimationFrame(tick); } }
  function refresh(): void { if (disposed) return; sync(); view = clampMelodyView(view, duration()); sectionEditor?.refresh(current); if (!sectionEditor) paintOverview(); positionHead(); transport.refresh(); }
  function changedInEditor(snapshot?: PhraseView): void {
    if (disposed) return;
    // The detailed editor has already refreshed its own notes and selection.
    // Reuse that view for the header instead of reading and repainting it again.
    sync(snapshot); view = clampMelodyView(view, duration()); if (!sectionEditor) paintOverview(); positionHead(); transport.refresh();
  }
  function commitMaster(): void {
    if (masterPreview === undefined || !current.body) return;
    const value = masterPreview; masterPreview = undefined;
    if (value !== current.body.masterLevel && !(current.body.masterLevel === undefined && value === 1)) phrase.setMasterLevel(value);
    sync(); transport.refresh();
  }
  async function commitTitle(): Promise<boolean> {
    if (titleCommit) return titleCommit;
    const field = titleInput; if (!field) return true;
    const next = field.value.trim();
    const commit = Promise.resolve().then(async () => {
      try {
        if (disposed) return false;
        if (!next) throw new Error('乐句名称不能为空。');
        if (next !== current.draft?.name) { if (options.onRename) await options.onRename(next); else phrase.rename(next); }
        titleInput = undefined;
        if (!disposed) { current = phrase.read(); updateTitle(); syncConsole(); }
        return true;
      } catch (error) { report(error instanceof Error ? error.message : String(error), true); return false; }
      finally { titleCommit = undefined; }
    });
    titleCommit = commit;
    return titleCommit;
  }
  async function execute(callback: (() => void | Promise<void>) | undefined, saved = false, keepView = false): Promise<void> {
    if (busy || disposed || !callback) return;
    busy = true; sync(); finishGesture();
    try { if (!await commitTitle()) return; sectionEditor?.flush(); commitMaster(); if (disposed) return; keepDraftViewport = keepView; await callback(); if (!disposed) { refresh(); if (saved) report('已保存'); } }
    catch (error) { report(error instanceof Error ? error.message : String(error), true); }
    finally { busy = false; if (!disposed) sync(); keepDraftViewport = false; }
  }
  function localX(event: Pick<PointerEvent, 'clientX'>): number { return event.clientX - viewport.getBoundingClientRect().left; }
  function seek(x: number): void { transport.seek(melodyTimeAt(view, headWidth, duration(), x)); positionHead(); }
  function startGesture(event: PointerEvent, kind: 'head' | 'pan'): void {
    if (disposed || busy || event.button !== 0 || !current.body || (event.target as HTMLElement)?.closest?.('.phrase-composition-console')) return;
    event.preventDefault(); finishGesture(); viewport.focus({ preventScroll: true });
    const capture = kind === 'head' ? ruler : viewport;
    overviewSection = 'melody';
    gesture = { kind, id: event.pointerId, capture, lastX: event.clientX, lastY: event.clientY, section: overviewSection };
    capture.setPointerCapture?.(event.pointerId); if (kind === 'head') seek(localX(event)); else viewport.classList.add('is-panning');
  }
  function move(event: PointerEvent): void {
    if (!gesture || gesture.id !== event.pointerId || disposed) return;
    event.preventDefault();
    if (gesture.kind === 'split') {
      const height = viewport.clientHeight;
      if (height > 0) splitRatio = clampPhraseSplit(clampPhraseSplit(splitRatio, height) + (event.clientY - gesture.lastY) / height, height);
      gesture.lastY = event.clientY; scheduleOverview();
    } else if (gesture.kind === 'head') seek(localX(event));
    else {
      view = clampMelodyView({ ...view, leftSeconds: view.leftSeconds + (gesture.lastX - event.clientX) / melodyScale(view, headWidth, duration()) }, duration());
      const vertical = sectionViews[gesture.section]; vertical.top += gesture.lastY - event.clientY;
      clampVertical(gesture.section); gesture.lastX = event.clientX; gesture.lastY = event.clientY; scheduleOverview();
    }
  }
  function finishGesture(commit = true): void {
    const previous = gesture; gesture = undefined; viewport?.classList.remove('is-panning');
    main?.classList.remove('is-resizing-split');
    if (previous?.capture.hasPointerCapture?.(previous.id)) previous.capture.releasePointerCapture(previous.id);
    if (previous?.kind === 'split') {
      if (!commit) {
        splitRatio = previous.startRatio ?? .5;
        if (previous.startTops) { sectionViews.melody.top = previous.startTops.melody; sectionViews.rhythm.top = previous.startTops.rhythm; }
      }
      paintOverview();
    }
  }
  const up = (event: PointerEvent) => { if (gesture?.id === event.pointerId) finishGesture(); if (masterPointer === event.pointerId) { masterPointer = undefined; try { commitMaster(); } catch (error) { report(String(error), true); sync(); } } };
  const cancel = (event: PointerEvent) => {
    if (gesture?.id === event.pointerId) finishGesture(false);
    if (masterPointer === event.pointerId) {
      masterPointer = undefined; masterPreview = undefined; sync();
      masterInput.value = consoleVolume.value = String(current.body?.masterLevel ?? 1);
      transport.refresh();
    }
  };
  function wheel(event: WheelEvent): void {
    if (disposed || busy || (event.target as HTMLElement)?.closest?.('.phrase-composition-console')) return;
    event.preventDefault(); finishGesture(); overviewSection = 'melody';
    if ((event.ctrlKey || event.metaKey) && event.shiftKey) zoomVertical(overviewSection, Math.exp(-event.deltaY * .002));
    else if (event.ctrlKey || event.metaKey) view = zoomMelody(view, headWidth, duration(), localX(event), Math.exp(-event.deltaY * .002));
    else if (event.shiftKey) { sectionViews[overviewSection].top += event.deltaY || event.deltaX; clampVertical(overviewSection); }
    else view = clampMelodyView({ ...view, leftSeconds: view.leftSeconds + (event.deltaX || event.deltaY) / melodyScale(view, headWidth, duration()) }, duration());
    scheduleOverview();
  }
  const key = (event: KeyboardEvent) => {
    if (disposed || root.querySelector('dialog[open]')) return;
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') { event.preventDefault(); if (!event.repeat && !busy) void execute(event.shiftKey ? options.onSaveAs : options.onSave, true, !event.shiftKey); return; }
    if (busy) return;
    if (event.key === 'Escape' && gesture?.kind === 'split') { event.preventDefault(); event.stopPropagation(); finishGesture(false); return; }
    const rangeUndo = event.key === 'Backspace' && event.target instanceof HTMLInputElement && event.target.type === 'range';
    if (event.isComposing || event.keyCode === 229 || event.target instanceof HTMLInputElement && !rangeUndo || event.target instanceof HTMLSelectElement || event.target instanceof HTMLTextAreaElement
      || (event.target as HTMLElement)?.isContentEditable) return;
    if (!sectionEditor && !event.altKey && !event.metaKey && !event.shiftKey && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
      event.preventDefault(); finishGesture();
      const horizontal = event.key === 'ArrowLeft' || event.key === 'ArrowRight';
      const forward = event.key === 'ArrowRight' || event.key === 'ArrowDown';
      if (horizontal) view = event.ctrlKey ? zoomMelody(view, headWidth, duration(), headWidth / 2, forward ? 1.2 : 1 / 1.2)
        : clampMelodyView({ ...view, leftSeconds: view.leftSeconds + (forward ? 80 : -80) / melodyScale(view, headWidth, duration()) }, duration());
      else if (event.ctrlKey) zoomVertical(overviewSection, forward ? 1 / 1.15 : 1.15);
      else { sectionViews[overviewSection].top += (forward ? 1 : -1) * sectionViews[overviewSection].rowHeight; clampVertical(overviewSection); }
      paintOverview(); return;
    }
    if (event.key === 'Backspace' && !event.ctrlKey && !event.metaKey && !event.altKey && !event.shiftKey) {
      if (sectionEditor) return;
      event.preventDefault();
      if (!event.repeat && current.body) {
        try { finishGesture(); commitMaster(); const restored = undoPhraseEdit(phrase); if (restored !== undefined) void transport.seek(restored); refresh(); }
        catch (error) { report(error instanceof Error ? error.message : String(error), true); }
      }
      return;
    }
    if (event.code === 'Space' || event.key === ' ') {
      if (!event.ctrlKey && !event.metaKey && !event.altKey && sectionEditor?.isStepInputActive()) return;
      event.preventDefault(); if (!event.repeat && current.body) void transport.toggle();
    }
  };

  const page = node('div', 'song-studio phrase-composition-studio');
  const topbar = node('header', 'song-topbar');
  title = node('div', 'song-project-name'); title.title = '双击修改名称';
  title.addEventListener('dblclick', () => {
    if (disposed || busy || titleInput || !current.draft) return;
    const field = node('input', 'song-project-name-input'); field.type = 'text'; field.maxLength = 80; field.value = current.draft.name;
    field.setAttribute('aria-label', '乐句名称'); titleInput = field; title.replaceChildren(field);
    field.addEventListener('blur', () => { if (titleInput === field) void commitTitle(); });
    field.addEventListener('keydown', event => {
      if (event.key === 'Enter') { event.preventDefault(); event.stopPropagation(); void commitTitle(); }
      if (event.key === 'Escape' && !titleCommit) { event.preventDefault(); event.stopPropagation(); titleInput = undefined; updateTitle(); }
    });
    field.focus(); field.select();
  });
  const controls = node('div', 'song-transport');
  const stopButton = action('', 'song-icon-button song-stop', () => { if (!disposed) { finishGesture(); transport.stop(); } });
  stopButton.setAttribute('aria-label', '停止并回到开头'); stopButton.title = '停止并回到开头'; stopButton.append(icon('stop'));
  playButton = action('', 'song-icon-button song-play', () => { if (!disposed && !busy && current.body) void transport.toggle(); });
  clock = node('output', 'song-clock', '00:00.000'); clock.setAttribute('aria-label', '当前时间');
  const rate = node('div', 'song-popover'); rateButton = action('1x', 'song-icon-button', () => {}); rateButton.setAttribute('aria-label', '播放倍速');
  const rates = node('div', 'song-popover-panel song-rate-options');
  for (const value of [1, .75, 1.25]) rates.append(action(`${value}x`, 'song-rate-choice', () => {
    if (disposed || busy) return; transport.setRate(value); rateButton.textContent = `${value}x`;
  }));
  rate.append(rateButton, rates);
  const bpm = node('div', 'song-popover'); const bpmButton = action('', 'song-icon-button', () => {}); bpmButton.setAttribute('aria-label', '速度 BPM'); bpmButton.append(icon('tempo'));
  const bpmPanel = node('div', 'song-popover-panel song-tempo-panel'); const bpmLabel = node('label', '', 'BPM');
  tempoInput = node('input'); tempoInput.type = 'number'; tempoInput.min = '40'; tempoInput.max = '240'; tempoInput.step = '1'; tempoInput.setAttribute('aria-label', 'BPM');
  tempoInput.addEventListener('change', () => {
    if (disposed || busy || !current.body) return;
    try { const value = Number(tempoInput.value); if (!Number.isFinite(value) || value < 40 || value > 240) throw new Error('BPM 需在 40 至 240 之间。'); sectionEditor?.flush(); phrase.setTempo(value, { preserveNoteDurations: true }); refresh(); }
    catch (error) { tempoInput.value = String(tempo()); report(error instanceof Error ? error.message : String(error), true); }
  });
  bpmLabel.append(tempoInput); bpmPanel.append(bpmLabel); bpm.append(bpmButton, bpmPanel);
  const subdivision = node('div', 'song-popover');
  subdivisionButton = action('4格', 'song-icon-button phrase-grid-button', () => {});
  subdivisionButton.setAttribute('aria-label', '设置每拍格数'); subdivisionButton.title = '每拍格数';
  const subdivisionPanel = node('div', 'song-popover-panel phrase-grid-panel'); const subdivisionLabel = node('label', '', '每拍格数');
  subdivisionSelect = node('select', 'phrase-grid-select'); subdivisionSelect.setAttribute('aria-label', '每拍格数');
  for (let count = 2; count <= 9; count++) { const option = node('option', '', String(count)); option.value = String(count); subdivisionSelect.append(option); }
  subdivisionSelect.addEventListener('change', () => {
    if (disposed || busy || !current.body) return;
    const value = Number(subdivisionSelect.value);
    try { sectionEditor?.flush(); commitMaster(); phrase.setStepsPerBeat(value); refresh(); }
    catch (error) { subdivisionSelect.value = String(phraseStepsPerBeat(current.body)); report(error instanceof Error ? error.message : String(error), true); }
  });
  subdivisionLabel.append(subdivisionSelect); subdivisionPanel.append(subdivisionLabel); subdivision.append(subdivisionButton, subdivisionPanel);
  const volume = node('div', 'song-popover'); const volumeButton = action('', 'song-icon-button', () => {}); volumeButton.setAttribute('aria-label', '音量'); volumeButton.append(icon('volume'));
  const volumePanel = node('div', 'song-popover-panel song-volume-panel'); masterInput = node('input'); masterInput.type = 'range'; masterInput.min = '0'; masterInput.max = '1'; masterInput.step = '.01'; masterInput.setAttribute('aria-label', '总音量');
  masterInput.addEventListener('pointerdown', event => { if (!disposed && !busy) masterPointer = event.pointerId; });
  masterInput.addEventListener('input', () => {
    if (disposed || busy || !current.body) return; const value = Number(masterInput.value); if (!Number.isFinite(value)) return;
    masterPreview = Math.max(0, Math.min(1, value)); syncConsole(); transport.refresh();
  });
  const volumeCommit = () => { if (disposed || busy) return; try { commitMaster(); } catch (error) { masterPreview = undefined; report(error instanceof Error ? error.message : String(error), true); sync(); } };
  masterInput.addEventListener('change', volumeCommit); masterInput.addEventListener('blur', volumeCommit);
  volumePanel.append(masterInput); volume.append(volumeButton, volumePanel);
  controls.append(stopButton, playButton, clock, rate, bpm, subdivision, volume);
  const files = node('div', 'song-file-actions');
  if (options.onSettings) { const settings = action('设置', 'song-settings', () => { void execute(options.onSettings); }); files.append(settings); fileButtons.push(settings); }
  const save = action('保存', 'song-save', () => { void execute(options.onSave, true, true); }); files.append(save); fileButtons.push(save);
  if (options.onSaveAs) { const saveAs = action('另存为', 'song-save', () => { void execute(options.onSaveAs, true); }); files.append(saveAs); fileButtons.push(saveAs); }
  if (options.onExit) { const exit = action('退出', 'song-exit', () => { void execute(options.onExit); }); files.append(exit); fileButtons.push(exit); }
  const identity = node('div', 'phrase-composition-identity');
  const back = action('‹', 'song-icon-button phrase-melody-back', () => { void execute(showOverview); });
  back.title = '返回乐句'; back.setAttribute('aria-label', '返回乐句'); back.hidden = true;
  const sectionLabel = node('span', 'phrase-composition-section-label', '创作'); sectionLabel.hidden = true;
  identity.append(back, title, node('span', 'song-project-kind', '乐句'), sectionLabel); topbar.append(identity, controls, files);
  const main = node('main', 'phrase-composition-main'); const sectionControls = node('aside', 'phrase-composition-controls');
  const openCreation = action('创作', 'phrase-composition-control phrase-composition-open-creation', () => { void execute(() => showSection('melody')); });
  openCreation.setAttribute('aria-label', '进入创作'); openCreation.title = '进入创作';
  openCreation.addEventListener('keydown', event => { if (event.key === ' ' || event.key === 'Enter') event.stopPropagation(); });
  sectionControls.append(node('div', 'phrase-composition-control-spacer'), openCreation, node('div', 'phrase-composition-control', '乐句控制台'));
  const canvas = node('div', 'phrase-composition-canvas'); ruler = node('div', 'phrase-composition-ruler');
  handle = action('', 'phrase-composition-head-handle', () => {}); handle.setAttribute('role', 'slider'); handle.setAttribute('aria-label', '播放头'); handle.setAttribute('aria-valuemin', '0'); handle.setAttribute('aria-valuemax', String(length()));
  const flag = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); flag.setAttribute('viewBox', '0 0 16 20'); flag.setAttribute('aria-hidden', 'true');
  const shape = document.createElementNS('http://www.w3.org/2000/svg', 'path'); shape.setAttribute('d', 'M1 1h14v11l-7 7-7-7z'); shape.setAttribute('fill', 'currentColor'); flag.append(shape); handle.append(flag); ruler.append(handle);
  handle.addEventListener('keydown', event => {
    if (busy || disposed || !current.body) return;
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? length() : undefined;
    if (next !== undefined) { event.preventDefault(); event.stopPropagation(); transport.seek(next * 60 / tempo()); positionHead(); }
  });
  viewport = node('div', 'phrase-composition-viewport'); viewport.tabIndex = 0; viewport.setAttribute('aria-label', '乐句播放列表');
  const melodySection = node('section', 'phrase-composition-section phrase-composition-melody'); melodySection.setAttribute('aria-label', '创作播放区');
  const phraseConsole = node('section', 'phrase-composition-section phrase-composition-console'); phraseConsole.setAttribute('aria-label', '乐句控制台');
  const consoleDetails = node('div', 'phrase-console-details'); const consoleName = node('strong', 'phrase-console-name');
  const consoleStats = node('div', 'phrase-console-stats'); const consoleFields = new Map<string, HTMLElement>();
  for (const [label, suffix] of [['BPM', 'tempo'], ['时长', 'duration'], ['小节', 'bars'], ['音符', 'note-count'], ['音色', 'tone-count']] as const) {
    const field = node('div', 'phrase-console-stat'); const value = node('span', `phrase-console-value phrase-console-${suffix}`);
    field.append(node('span', 'phrase-console-label', label), value); consoleStats.append(field); consoleFields.set(label, value);
  }
  const consoleVolumeField = node('label', 'phrase-console-volume-field');
  const consoleVolume = node('input', 'phrase-console-volume'); consoleVolume.type = 'range'; consoleVolume.min = '0'; consoleVolume.max = '1'; consoleVolume.step = '.01'; consoleVolume.setAttribute('aria-label', '乐句音量');
  const consoleVolumeValue = node('output', 'phrase-console-volume-value');
  consoleVolumeField.append(node('span', 'phrase-console-label', '音量'), consoleVolume, consoleVolumeValue);
  consoleDetails.append(consoleName, consoleStats, consoleVolumeField); phraseConsole.append(consoleDetails);
  const removeConsoleWheel = attachConsoleHorizontalWheel(phraseConsole);
  function syncConsole(): void {
    const body = current.body; const level = masterPreview ?? body?.masterLevel ?? 1;
    consoleName.textContent = current.draft?.name ?? '乐句';
    consoleFields.get('BPM')!.textContent = body ? String(body.tempoBpm) : '—';
    consoleFields.get('时长')!.textContent = body ? `${Number(duration().toFixed(3))} 秒` : '—';
    consoleFields.get('小节')!.textContent = body ? String(Number((body.lengthBeats / 4).toFixed(3))) : '—';
    consoleFields.get('音符')!.textContent = String(body?.parts.reduce((count, part) => count + part.notes.length, 0) ?? 0);
    consoleFields.get('音色')!.textContent = String(new Set(body?.parts.filter(part => !part.unassigned).map(part => part.timbreId)).size);
    if (document.activeElement !== consoleVolume) consoleVolume.value = String(level);
    consoleVolumeValue.textContent = `${Math.round(level * 100)}%`; consoleVolume.disabled = busy || !body; openCreation.disabled = busy || !body;
  }
  consoleVolume.addEventListener('pointerdown', event => { if (!disposed && !busy) masterPointer = event.pointerId; });
  consoleVolume.addEventListener('input', () => {
    if (disposed || busy || !current.body) return; const value = Number(consoleVolume.value); if (!Number.isFinite(value)) return;
    masterPreview = Math.max(0, Math.min(1, value)); syncConsole(); masterInput.value = String(masterPreview); transport.refresh();
  });
  consoleVolume.addEventListener('change', volumeCommit); consoleVolume.addEventListener('blur', volumeCommit);
  const melodyNotes = node('div', 'phrase-composition-notes'); melodySection.append(melodyNotes);
  const melodyOverview = mountPhraseOverviewNotes(melodyNotes, 'melody', keyboard, { includeAllSections: true });
  playhead = node('div', 'phrase-composition-playhead'); playhead.setAttribute('aria-hidden', 'true'); notice = node('div', 'phrase-composition-notice'); notice.hidden = true; notice.setAttribute('role', 'status');
  const melodyRegion = node('div', 'phrase-melody-region'); melodyRegion.hidden = true;
  const divider = node('div', 'phrase-composition-divider'); divider.tabIndex = 0;
  divider.setAttribute('role', 'separator'); divider.setAttribute('aria-orientation', 'horizontal');
  divider.setAttribute('aria-label', '调整创作与乐句控制台高度'); divider.title = '拖动调整高度';
  const grip = node('span', 'phrase-composition-divider-grip'); grip.setAttribute('aria-hidden', 'true'); divider.append(grip);
  divider.addEventListener('pointerdown', event => {
    event.stopPropagation();
    if (disposed || busy || sectionEditor || event.button !== 0) return;
    event.preventDefault(); finishGesture(); divider.focus({ preventScroll: true });
    gesture = { kind: 'split', id: event.pointerId, capture: divider, lastX: event.clientX, lastY: event.clientY, section: overviewSection, startRatio: splitRatio,
      startTops: { melody: sectionViews.melody.top, rhythm: sectionViews.rhythm.top } };
    divider.setPointerCapture?.(event.pointerId); main.classList.add('is-resizing-split');
  });
  divider.addEventListener('keydown', event => {
    if (disposed || busy || sectionEditor || event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === 'Escape' && gesture?.kind === 'split') { event.preventDefault(); event.stopPropagation(); finishGesture(false); return; }
    if (!['ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault(); event.stopPropagation(); finishGesture();
    const bounds = phraseSplitBounds(viewport.clientHeight);
    splitRatio = clampPhraseSplit(event.key === 'Home' ? bounds.min : event.key === 'End' ? bounds.max
      : displayedSplit + (event.key === 'ArrowUp' ? -1 : 1) * (event.shiftKey ? .05 : .02), viewport.clientHeight);
    paintOverview();
  });
  melodySection.append(playhead); viewport.append(melodySection, phraseConsole); canvas.append(ruler, viewport); main.append(sectionControls, canvas, divider); page.append(topbar, main, melodyRegion, notice); root.replaceChildren(page);
  function layoutSections(): void {
    const height = viewport.clientHeight;
    if (!splitInitialized) { splitRatio = defaultPhraseSplit(current.body, height); splitInitialized = true; }
    displayedSplit = clampPhraseSplit(splitRatio, height);
    const percent = displayedSplit * 100; const bounds = phraseSplitBounds(height);
    melodySection.style.height = `${percent}%`;
    phraseConsole.style.top = `${percent}%`; phraseConsole.style.height = `${(1 - displayedSplit) * 100}%`;
    sectionControls.style.gridTemplateRows = `24px minmax(0, ${displayedSplit}fr) minmax(0, ${1 - displayedSplit}fr)`;
    divider.style.top = `${24 + Math.max(0, height) * displayedSplit}px`;
    viewport.dataset.splitRatio = String(displayedSplit);
    divider.setAttribute('aria-valuemin', String(Number((bounds.min * 100).toFixed(2))));
    divider.setAttribute('aria-valuemax', String(Number((bounds.max * 100).toFixed(2))));
    divider.setAttribute('aria-valuenow', String(Number(percent.toFixed(2))));
    divider.setAttribute('aria-valuetext', `创作 ${Math.round(percent)}%，乐句控制台 ${Math.round(100 - percent)}%`);
  }
  function sectionHeight(section: PhraseSection): number {
    return Math.max(1, viewport.clientHeight * (section === 'melody' ? displayedSplit : 1 - displayedSplit));
  }
  function clampVertical(section: PhraseSection): void {
    const vertical = sectionViews[section]; const height = sectionHeight(section);
    if (!vertical.initialized && current.body) {
      vertical.top = section === 'melody' ? centerTop(current.body, keyboard, height, vertical.rowHeight, true) : 0;
      vertical.initialized = true;
    }
    const rows = section === 'melody' ? keyboard.length : current.body?.parts.filter(part => (part.section ?? 'melody') === 'rhythm').length ?? 0;
    vertical.top = melodyClamp(vertical.top, 0, Math.max(0, rows * vertical.rowHeight + (section === 'rhythm' ? 52 : 0) - height));
  }
  function zoomVertical(section: PhraseSection, factor: number): void {
    clampVertical(section); const vertical = sectionViews[section]; const height = sectionHeight(section);
    const row = (vertical.top + height / 2) / vertical.rowHeight;
    vertical.rowHeight = melodyClamp(vertical.rowHeight * factor, section === 'rhythm' ? 48 : 12, section === 'rhythm' ? 120 : 44);
    vertical.top = row * vertical.rowHeight - height / 2; clampVertical(section);
  }
  function paintOverview(): void {
    if (disposed || sectionEditor) return;
    cancelAnimationFrame(overviewFrame); overviewFrame = 0;
    layoutSections();
    view = clampMelodyView(view, duration()); headWidth = timelineWidth();
    for (const [section, painter, host] of [['melody', melodyOverview, melodyNotes]] as const) {
      clampVertical(section); const vertical = sectionViews[section];
      painter.update({ body: current.body, horizontal: view, top: vertical.top, rowHeight: vertical.rowHeight, width: headWidth, height: sectionHeight(section) });
      host.dataset.top = String(vertical.top); host.dataset.rowHeight = String(vertical.rowHeight);
      host.dataset.leftSeconds = String(view.leftSeconds); host.dataset.visibleSeconds = String(8 / view.zoom);
    }
    positionHead();
  }
  function scheduleOverview(): void {
    if (disposed || sectionEditor || overviewFrame) return;
    overviewFrame = requestAnimationFrame(() => { overviewFrame = 0; paintOverview(); });
  }
  function rememberViewport(section: PhraseSection, next: PhraseEditorViewport): void {
    if (disposed) return;
    // Detailed editors already constrain their own view; no content or audio changes.
    view = { leftSeconds: next.leftSeconds, zoom: next.zoom, rowHeight: 24 };
    sectionViews[section] = { top: next.top, rowHeight: next.rowHeight, initialized: true };
  }
  async function showSection(_section: PhraseSection): Promise<void> {
    if (sectionEditor || disposed) return;
    await options.onPrepareMelody?.();
    if (disposed) return;
    current = phrase.read();
    paintOverview(); cancelAnimationFrame(overviewFrame); overviewFrame = 0;
    main.hidden = true; melodyRegion.hidden = false;
    activeSection = 'melody';
    try { sectionEditor = mountMelodyWorkspace(melodyRegion, { phrase, sound, initialView: current, gridBpm: gridTempo, readPerformanceMode: options.readPerformanceMode, includeAllSections: true,
      initialViewport: { leftSeconds: view.leftSeconds, zoom: view.zoom, top: sectionViews.melody.top, rowHeight: sectionViews.melody.rowHeight },
      onViewportChange: next => rememberViewport('melody', next),
      listTimbres: options.listTimbres ?? (() => phrase.read().availableSounds.map(item => ({ id: item.id, name: item.name }))),
      onImportTimbre: options.onImportTimbre,
      onAddTimbre: id => options.onAddTimbre ? options.onAddTimbre(id, 'melody') : phrase.read().body?.parts
        .find(part => part.timbreId === id)?.id ?? phrase.addPart(id, 'melody'),
      onRemoveTimbre: options.onRemoveTimbre ? id => options.onRemoveTimbre!(id, 'all') : undefined,
      onReorderTimbres: options.onReorderTimbres,
      onCreateNoteGroup: options.onCreateNoteGroup,
      onChangeNoteGroupTimbre: options.onChangeNoteGroupTimbre,
      onChange: changedInEditor,
      onPreview(body) { if (disposed) return; previewBody = body; transport.refresh(); },
      readPlayhead: () => transport.position(),
      onSeek(seconds) { const ready = transport.seek(seconds); positionHead(); return ready; },
    }); } catch (error) { activeSection = undefined; main.hidden = false; melodyRegion.hidden = true; melodyRegion.replaceChildren(); throw error; }
    sectionLabel.textContent = '创作';
    back.hidden = sectionLabel.hidden = false;
    options.onSectionChange?.('melody'); positionHead(); transport.refresh();
  }
  function showOverview(): void {
    if (sectionEditor && activeSection) rememberViewport(activeSection, sectionEditor.readViewport());
    activeSection = undefined;
    const previous = sectionEditor; sectionEditor = undefined; previous?.dispose(); previewBody = undefined;
    melodyRegion.replaceChildren(); melodyRegion.hidden = true; main.hidden = false;
    back.hidden = sectionLabel.hidden = true; options.onSectionChange?.('overview'); paintOverview(); transport.refresh();
  }
  ruler.addEventListener('pointerdown', event => startGesture(event, 'head')); viewport.addEventListener('pointerdown', event => startGesture(event, 'pan'));
  const lostCapture = (event: PointerEvent) => { if (gesture?.id === event.pointerId) finishGesture(); };
  ruler.addEventListener('lostpointercapture', lostCapture); viewport.addEventListener('lostpointercapture', lostCapture);
  divider.addEventListener('lostpointercapture', lostCapture);
  viewport.addEventListener('wheel', wheel, { passive: false }); ruler.addEventListener('wheel', wheel, { passive: false });
  document.addEventListener('pointermove', move); document.addEventListener('pointerup', up); document.addEventListener('pointercancel', cancel); document.addEventListener('keydown', key);
  const resize = () => { if (!sectionEditor) scheduleOverview(); };
  window.addEventListener('resize', resize);
  if (typeof ResizeObserver !== 'undefined') { observer = new ResizeObserver(resize); observer.observe(viewport); }
  sync(); paintOverview(); updatePlayback();
  const initialSection = options.initialSection;
  if (initialSection && initialSection !== 'overview') void execute(() => showSection(initialSection));
  return { dispose() {
    if (disposed) return; finishGesture(); disposed = true; sectionEditor?.dispose(); sectionEditor = undefined; melodyOverview.dispose(); removeConsoleWheel(); transport.dispose(); observer?.disconnect(); cancelAnimationFrame(frame); cancelAnimationFrame(overviewFrame); overviewFrame = 0; window.clearTimeout(noticeTimer);
    document.removeEventListener('pointermove', move); document.removeEventListener('pointerup', up); document.removeEventListener('pointercancel', cancel); document.removeEventListener('keydown', key);
    window.removeEventListener('resize', resize);
  }, refresh, notify: report, async flush() {
    if (disposed) throw new Error('当前乐句页面已关闭。');
    if (busy) throw new Error('正在处理乐句，请稍候再试。');
    if (!await commitTitle()) throw new Error('请先完成乐句名称。');
    finishGesture(false); sectionEditor?.flush(); commitMaster();
  } };
}
