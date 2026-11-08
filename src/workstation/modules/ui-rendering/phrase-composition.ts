import type { PhraseEditorPort, PhraseSection, PhraseView } from '../../contracts/phrase.ts';
import { phraseStepsPerBeat } from '../../contracts/phrase.ts';
import { phraseDurationSeconds } from '../../contracts/phrase-time.ts';
import { MIN_TEMPO_BPM, MAX_TEMPO_BPM } from '../../contracts/music-limits.ts';
import type { SoundRuntimePort } from '../../contracts/sound.ts';
import type { MusicWorkspaceStatePort } from '../../contracts/workspace.ts';
import type { LearningAction } from '../../contracts/guidance.ts';
import { createPhraseCompositionTransport } from './phrase-composition-transport.ts';
import { mountMelodyWorkspace } from './melody-workspace.ts';
import { attachConsoleHorizontalWheel } from './console-scroll.ts';
import { undoPhraseEdit } from './phrase-performance-history.ts';
import { clampMelodyView, formatPlayheadTime, melodyClamp, melodyScale, melodyTimeAt, zoomMelody, type MelodyView } from './melody-geometry.ts';
import type { PhraseEditorViewport } from './phrase-editor-viewport.ts';
import { centerTop, mountPhraseOverviewNotes } from './phrase-overview-notes.ts';
import { clampPhraseSplit, defaultPhraseSplit, phraseSplitBounds } from './phrase-section-split.ts';
import { showTapTempo } from './tap-tempo.ts';
import { mountOutputVolume } from './output-volume.ts';
import './song.css';
import './phrase-composition.css';

function node<K extends keyof HTMLElementTagNameMap>(tag: K, className = '', text = ''): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag); element.className = className; element.textContent = text; return element;
}
function action(text: string, className: string, callback: () => void): HTMLButtonElement {
  const button = node('button', className, text); button.type = 'button'; button.addEventListener('click', callback); return button;
}
function icon(kind: 'play' | 'pause' | 'stop' | 'tempo'): SVGSVGElement {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); svg.setAttribute('viewBox', '0 0 24 24'); svg.setAttribute('aria-hidden', 'true');
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', { play: 'M8 5v14l11-7z', pause: 'M7 5h3v14H7zM14 5h3v14h-3z', stop: 'M6 6h12v12H6z',
    tempo: 'M9 3h6l5 18H4zM12 6v10m-3-4 7-5M8 18h8' }[kind]);
  path.setAttribute('fill', ['play', 'pause', 'stop'].includes(kind) ? 'currentColor' : 'none'); path.setAttribute('stroke', 'currentColor'); path.setAttribute('stroke-width', '1.5'); path.setAttribute('stroke-linejoin', 'round'); svg.append(path); return svg;
}
type FileActionResult = void | 'saved' | 'download-started' | 'cancelled';

/** A bounded shared canvas is the phrase workspace; notes remain owned by the phrase domain. */
export function mountPhraseComposition(root: HTMLElement, options: {
  phrase: PhraseEditorPort; sound: SoundRuntimePort;
  initialView?: PhraseView;
  directMusic?: boolean;
  workspaceState?: MusicWorkspaceStatePort;
  onExport?(): void | Promise<void>;
  onSettings?(): void;
  readMultipleTempoRolls?(): boolean;
  onLearningAction?(action: LearningAction): void;
  readLessonInput?: Parameters<typeof mountMelodyWorkspace>[1]['readLessonInput'];
  mobileTouch?: Parameters<typeof mountMelodyWorkspace>[1]['mobileTouch'];
  mobileWeb?: boolean;
  readLessonToolbar?(): boolean;
  onPlaybackAdvance?(): void;
  frameNotesOnMount?: boolean;
  onSave?(): FileActionResult | Promise<FileActionResult>; onSaveAs?(): void | Promise<void>; onExit?(): void | Promise<void>;
  readUnsavedChanges?(): Promise<boolean>;
  onRename?(name: string): void | Promise<void>;
  readPerformanceMode?(): boolean;
  initialSection?: 'overview' | PhraseSection;
  onSectionChange?(section: 'overview' | PhraseSection): void;
  listTimbres?(): { id: string; name: string; requiresDeleteConfirmation?: boolean }[];
  onAddTimbre?(id: string, section: PhraseSection): string;
  onImportTimbre?(): Promise<boolean>;
  onCreateNoteGroup?(id: string): string;
  onChangeNoteGroupTimbre?(partId: string, timbreId: string): void;
  onRemoveTimbre?(id: string, section: PhraseSection | 'all'): void;
  onReorderTimbres?(id: string, targetIndex: number): void;
}): { dispose(): void; refresh(): void; notify(message: string, error?: boolean): void; flush(): Promise<void>; frameNotes(reserveEndSpace?: boolean): void; previewTempoRate(value?: number): void } {
  const { phrase, sound } = options;
  let disposed = false; let current = options.initialView ?? phrase.read(); let draftId = current.draft?.id;
  let view: MelodyView = { leftSeconds: 0, zoom: current.body ? 8 / (current.body.lengthBeats * 60 / current.body.tempoBpm) : 1, rowHeight: 24 };
  let detailViewInitialized = false;
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
  let playbackFamilyId: string | undefined;
  let state = { playing: false, preparing: false, position: 0, rate: 1 };
  let spaceAction: 'pause-space' | 'resume-space' | undefined;
  let playButton: HTMLButtonElement; let viewport: HTMLElement; let ruler: HTMLElement;
  let playhead: HTMLElement; let handle: HTMLButtonElement; let notice: HTMLElement; let title: HTMLElement;
  let tempoInput: HTMLInputElement;
  let subdivisionSelect: HTMLSelectElement; let subdivisionButton: HTMLButtonElement;
  let titleInput: HTMLInputElement | undefined; let titleCommit: Promise<boolean> | undefined;
  let unsavedRequest = 0;
  let tapTempoDialog: ReturnType<typeof showTapTempo> | undefined;
  let masterPreview: number | undefined; let masterPointer: number | undefined;
  const fileButtons: HTMLButtonElement[] = [];
  let gesture: { kind: 'head' | 'pan' | 'split'; id: number; capture: HTMLElement; lastX: number; lastY: number; section: PhraseSection; startRatio?: number; startTops?: Record<PhraseSection, number> } | undefined;
  let headPreview: number | undefined;
  const tempo = () => current.body?.tempoBpm ?? 120;
  const length = () => current.body?.lengthBeats ?? 16;
  const duration = () => current.body ? phraseDurationSeconds(current.body) : 8;
  const timelineWidth = () => Math.max(1, viewport.clientWidth);
  const gridTempo = tempo;
  function report(message: string, error = false): void {
    if (disposed || !notice || !error) return;
    notice.textContent = message; notice.hidden = !message; notice.classList.toggle('is-error', error);
    window.clearTimeout(noticeTimer); noticeTimer = window.setTimeout(() => { if (!disposed) notice.hidden = true; }, error ? 7000 : 3200);
  }
  function playbackBody(): Parameters<PhraseEditorPort['previewPlan']>[0] {
      let body = previewBody ?? current.body;
      // Selection is a listening scope only: never mute or remove saved notes.
      if (body && playbackFamilyId) body = { ...body, parts: body.parts.filter(part => part.id === playbackFamilyId) };
      // Creation includes every family, including notes stored in the former
      // rhythm section. Keeping their original markers avoids rewriting music.
      return body;
  }
  async function preparePlayback(): Promise<void> {
    let scope: string | undefined;
    do {
      scope = playbackFamilyId;
      await phrase.preparePreview(playbackBody());
      // A different family can be chosen while its recordings are loading.
      // Prepare the newly selected recordings before compiling that plan.
    } while (!disposed && scope !== playbackFamilyId);
  }
  const transport = createPhraseCompositionTransport({ runtime: sound, tempoBpm: tempo, lengthBeats: length, durationSeconds: duration, readBody: playbackBody,
    prepare: preparePlayback, readPlan: () => phrase.previewPlan(playbackBody(), { allowSilence: true }),
    onChange(next) {
      const wasPlaying = state.playing; state = next; updatePlayback();
      if (next.playing && !wasPlaying) { options.onLearningAction?.('play'); if (spaceAction === 'resume-space') options.onLearningAction?.('resume-space'); spaceAction = undefined; }
      if (!next.playing && wasPlaying && spaceAction === 'pause-space') { spaceAction = undefined; options.onLearningAction?.('pause-space'); }
    }, onError: error => { spaceAction = undefined; report(error instanceof Error ? error.message : String(error), true); } });

  function updateTitle(): void { if (!titleInput && title) title.textContent = current.draft?.name ?? '音乐'; }
  async function updateUnsavedMarker(): Promise<void> {
    if (!options.readUnsavedChanges) return;
    const request = ++unsavedRequest;
    try {
      const unsaved = await options.readUnsavedChanges();
      if (!disposed && request === unsavedRequest) unsavedMarker.hidden = !unsaved;
    } catch {
      // A failed status read cannot confirm that the latest changes were saved.
    }
  }
  function sync(snapshot?: PhraseView): void {
    current = snapshot ?? phrase.read();
    if (draftId !== current.draft?.id) {
      draftId = current.draft?.id;
      if (!keepDraftViewport || !current.body) {
        view = { leftSeconds: 0, zoom: 8 / duration(), rowHeight: 24 }; detailViewInitialized = false;
        sectionViews.melody = { top: 0, rowHeight: 24, initialized: false };
        sectionViews.rhythm = { top: 0, rowHeight: 72, initialized: false };
        splitInitialized = false;
        masterPreview = undefined; transport.stop();
      }
    }
    updateTitle();
    void updateUnsavedMarker();
    if (document.activeElement !== tempoInput) tempoInput.value = String(Math.round(gridTempo()));
    if (document.activeElement !== subdivisionSelect) subdivisionSelect.value = String(phraseStepsPerBeat(current.body));
    subdivisionButton.textContent = `${phraseStepsPerBeat(current.body)} 份`;
    syncConsole();
    for (const button of fileButtons) button.disabled = busy || !current.draft;
    if (playButton) playButton.disabled = busy || !current.body;
    tempoInput.disabled = busy || !current.body;
    subdivisionSelect.disabled = subdivisionButton.disabled = busy || !current.body;
  }
  function positionHead(): number | undefined {
    if (disposed || !viewport) return;
    const seconds = headPreview ?? transport.position();
    if (clock) clock.textContent = formatPlayheadTime(seconds);
    if (sectionEditor) { sectionEditor.setPlayhead(seconds, state.playing); return seconds; }
    const beat = Math.max(0, Math.min(length(), seconds * tempo() / 60));
    const width = headWidth; const x = (Math.max(0, Math.min(duration(), seconds)) - view.leftSeconds) * melodyScale(view, width, duration());
    playhead.hidden = x < 0 || x > width; handle.hidden = playhead.hidden;
    playhead.style.left = `${Math.min(width - 1, Math.max(0, x))}px`; handle.style.left = `${Math.min(width - 1, Math.max(0, x))}px`;
    handle.setAttribute('aria-valuenow', String(beat)); handle.setAttribute('aria-valuemax', String(length())); handle.title = `${Number(beat.toFixed(3))} 拍`;
    viewport.dataset.leftBeat = String(view.leftSeconds * tempo() / 60); viewport.dataset.zoom = String(view.zoom * duration() / 8);
    viewport.dataset.leftSeconds = String(view.leftSeconds); viewport.dataset.visibleSeconds = String(8 / view.zoom);
    return seconds;
  }
  function updatePlayback(): void {
    if (!playButton || disposed) return;
    playButton.replaceChildren(icon(state.playing ? 'pause' : 'play')); playButton.classList.toggle('is-preparing', state.preparing);
    playButton.setAttribute('aria-label', state.preparing ? '取消播放准备' : state.playing ? '暂停' : '播放');
    cancelAnimationFrame(frame); positionHead(); if (state.playing) frame = requestAnimationFrame(tick);
  }
  function tick(): void {
    if (disposed) return;
    const seconds = positionHead();
    if (!state.playing) return;
    if (seconds !== undefined && seconds > state.position) options.onPlaybackAdvance?.();
    frame = requestAnimationFrame(tick);
  }
  function refresh(): void { if (disposed) return; sync(); view = clampMelodyView(view, duration()); sectionEditor?.refresh(current); if (!sectionEditor) paintOverview(); positionHead(); transport.refresh(); }
  function changedInEditor(snapshot?: PhraseView, preserveSounding = false): void {
    if (disposed) return;
    // The detailed editor has already refreshed its own notes and selection.
    // Reuse that view for the header instead of reading and repainting it again.
    sync(snapshot); view = clampMelodyView(view, duration()); if (!sectionEditor) paintOverview(); positionHead(); transport.refresh(preserveSounding);
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
        if (!next) throw new Error('音乐名称不能为空。');
        if (next !== current.draft?.name) { if (options.onRename) await options.onRename(next); else phrase.rename(next); }
        titleInput = undefined;
        if (!disposed) { current = phrase.read(); updateTitle(); syncConsole(); void updateUnsavedMarker(); }
        return true;
      } catch (error) { report(error instanceof Error ? error.message : String(error), true); return false; }
      finally { titleCommit = undefined; }
    });
    titleCommit = commit;
    return titleCommit;
  }
  async function execute(callback: (() => FileActionResult | Promise<FileActionResult>) | undefined, keepView = false): Promise<void> {
    if (busy || disposed || !callback) return;
    busy = true; sync(); finishGesture();
    try { if (!await commitTitle()) return; sectionEditor?.flush(); commitMaster(); if (disposed) return; keepDraftViewport = keepView; await callback(); if (!disposed) refresh(); }
    catch (error) { report(error instanceof Error ? error.message : String(error), true); }
    finally { busy = false; if (!disposed) sync(); keepDraftViewport = false; }
  }
  function localX(event: Pick<PointerEvent, 'clientX'>): number { return event.clientX - viewport.getBoundingClientRect().left; }
  function previewHead(x: number): void { headPreview = melodyTimeAt(view, headWidth, duration(), x); positionHead(); }
  function startGesture(event: PointerEvent, kind: 'head' | 'pan'): void {
    if (disposed || busy || event.button !== 0 || !current.body || (event.target as HTMLElement)?.closest?.('.phrase-composition-console')) return;
    event.preventDefault(); finishGesture(); viewport.focus({ preventScroll: true });
    const capture = kind === 'head' ? ruler : viewport;
    overviewSection = 'melody';
    gesture = { kind, id: event.pointerId, capture, lastX: event.clientX, lastY: event.clientY, section: overviewSection };
    capture.setPointerCapture?.(event.pointerId); if (kind === 'head') previewHead(localX(event)); else viewport.classList.add('is-panning');
  }
  function move(event: PointerEvent): void {
    if (!gesture || gesture.id !== event.pointerId || disposed) return;
    event.preventDefault();
    if (gesture.kind === 'split') {
      const height = viewport.clientHeight;
      if (height > 0) splitRatio = clampPhraseSplit(clampPhraseSplit(splitRatio, height) + (event.clientY - gesture.lastY) / height, height);
      gesture.lastY = event.clientY; scheduleOverview();
    } else if (gesture.kind === 'head') previewHead(localX(event));
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
    if (previous?.kind === 'head') {
      const seconds = headPreview; headPreview = undefined;
      if (commit && seconds !== undefined) void transport.seek(seconds);
      positionHead();
    }
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
      consoleVolume.value = String(current.body?.masterLevel ?? 1);
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
    if (options.readLessonToolbar?.() === false) return;
    if (disposed || root.querySelector('dialog[open]')) return;
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') { event.preventDefault(); if (!event.repeat && !busy) void execute(event.shiftKey ? options.onSaveAs : options.onSave, !event.shiftKey); return; }
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
      event.preventDefault(); if (!event.repeat && current.body) { spaceAction = state.playing ? 'pause-space' : 'resume-space'; void transport.toggle(); }
    }
  };

  const page = node('div', 'song-studio phrase-composition-studio');
  const topbar = node('header', 'song-topbar');
  title = node('div', 'song-project-name'); title.title = '双击修改名称';
  const unsavedMarker = node('span', 'song-project-unsaved', '*');
  unsavedMarker.hidden = true;
  unsavedMarker.title = '有未保存的改动';
  unsavedMarker.setAttribute('role', 'img');
  unsavedMarker.setAttribute('aria-label', '有未保存的改动');
  const titleGroup = node('div', 'phrase-composition-title');
  titleGroup.append(title, unsavedMarker);
  title.addEventListener('dblclick', () => {
    if (disposed || busy || titleInput || !current.draft) return;
    const field = node('input', 'song-project-name-input'); field.type = 'text'; field.maxLength = 80; field.value = current.draft.name;
    field.setAttribute('aria-label', '音乐名称'); titleInput = field; title.replaceChildren(field);
    field.addEventListener('blur', () => { if (titleInput === field) void commitTitle(); });
    field.addEventListener('keydown', event => {
      if (event.key === 'Enter') { event.preventDefault(); event.stopPropagation(); void commitTitle(); }
      if (event.key === 'Escape' && !titleCommit) { event.preventDefault(); event.stopPropagation(); titleInput = undefined; updateTitle(); }
    });
    field.focus(); field.select();
  });
  const controls = node('div', 'song-transport');
  const stopButton = action('', 'song-icon-button song-stop', () => { if (!disposed) { finishGesture(); spaceAction = undefined; transport.stop(); options.onLearningAction?.('reset'); } });
  stopButton.setAttribute('aria-label', '停止并回到开头'); stopButton.title = '停止并回到开头'; stopButton.append(icon('stop'));
  playButton = action('', 'song-icon-button song-play', () => { if (!disposed && !busy && current.body) void transport.toggle(); });
  const clock = options.directMusic ? undefined : node('output', 'song-clock', '00:00.000');
  clock?.setAttribute('aria-label', '当前时间');
  const bpm = node('div', 'song-popover'); const bpmButton = action('', 'song-icon-button', () => {}); bpmButton.setAttribute('aria-label', '速度 BPM'); bpmButton.append(icon('tempo'));
  const bpmPanel = node('div', 'song-popover-panel song-tempo-panel'); const bpmLabel = node('label', '', 'BPM');
  tempoInput = node('input'); tempoInput.type = 'number'; tempoInput.min = String(MIN_TEMPO_BPM); tempoInput.max = String(MAX_TEMPO_BPM); tempoInput.step = '1'; tempoInput.setAttribute('aria-label', 'BPM');
  tempoInput.addEventListener('change', () => {
    if (disposed || busy || !current.body) return;
    try { const value = Number(tempoInput.value); if (!Number.isFinite(value) || value < MIN_TEMPO_BPM || value > MAX_TEMPO_BPM) throw new Error(`BPM 需在 ${MIN_TEMPO_BPM} 至 ${MAX_TEMPO_BPM} 之间。`); sectionEditor?.flush(); phrase.setTempo(value, { preserveNoteDurations: false }); refresh(); }
    catch (error) { tempoInput.value = String(Math.round(tempo())); report(error instanceof Error ? error.message : String(error), true); }
  });
  const tapTempo = action('敲击定速', 'song-tap-tempo', () => { void execute(() => {
    if(tapTempoDialog)return;
    tapTempoDialog=showTapTempo(root,{onApply(value){
      if(disposed||busy||!current.body)throw new Error('当前音乐尚未准备好，请稍后重试。');
      sectionEditor?.flush();phrase.setTempo(value,{preserveNoteDurations:false});refresh();
    },onClose(){tapTempoDialog=undefined;}});
  }); });
  bpmLabel.append(tempoInput); bpmPanel.append(bpmLabel,tapTempo); bpm.append(bpmButton, bpmPanel);
  const subdivision = node('div', 'song-popover');
  subdivisionButton = action('4 份', 'song-icon-button phrase-grid-button', () => {});
  subdivisionButton.setAttribute('aria-label', '设置每拍细分'); subdivisionButton.title = '每拍细分';
  const subdivisionPanel = node('div', 'song-popover-panel phrase-grid-panel'); const subdivisionLabel = node('label', '', '每拍细分');
  subdivisionSelect = node('select', 'phrase-grid-select'); subdivisionSelect.setAttribute('aria-label', '每拍细分');
  for (let count = 2; count <= 9; count++) { const option = node('option', '', `${count} 份`); option.value = String(count); subdivisionSelect.append(option); }
  subdivisionSelect.addEventListener('change', () => {
    if (disposed || busy || !current.body) return;
    const value = Number(subdivisionSelect.value);
    try { sectionEditor?.flush(); commitMaster(); phrase.setStepsPerBeat(value); refresh(); }
    catch (error) { subdivisionSelect.value = String(phraseStepsPerBeat(current.body)); report(error instanceof Error ? error.message : String(error), true); }
  });
  subdivisionLabel.append(subdivisionSelect); subdivisionPanel.append(subdivisionLabel); subdivision.append(subdivisionButton, subdivisionPanel);
  const volumeCommit = () => { if (disposed || busy) return; try { commitMaster(); } catch (error) { masterPreview = undefined; report(error instanceof Error ? error.message : String(error), true); sync(); } };
  controls.append(stopButton, playButton);
  if (clock) controls.append(clock, bpm, subdivision);
  mountOutputVolume(controls, () => sound);
  const files = node('div', 'song-file-actions');
  let mobileTouch = options.mobileTouch;
  if (options.onExport) files.append(action('导出音频', 'song-save song-export-audio', () => { void execute(options.onExport); }));
  if (options.onSettings) files.append(action('设置', 'song-save song-settings', () => { void execute(options.onSettings); }));
  if (options.mobileWeb) {
    let rightMode = false;
    const right = action('右键', 'song-save song-touch-right', () => {
      rightMode = !rightMode;
      right.setAttribute('aria-pressed', String(rightMode));
    });
    right.setAttribute('aria-pressed', 'false');
    files.append(right);
    mobileTouch = { readRightButton: () => rightMode };
  }
  if (options.onSave) {
    const save = action('保存', 'song-save song-save-project', () => { void execute(options.onSave, true); });
    files.append(save); fileButtons.push(save);
  }
  if (options.onExit) { const exit = action('退出', 'song-exit', () => { void execute(options.onExit); }); files.append(exit); fileButtons.push(exit); }
  const identity = node('div', 'phrase-composition-identity');
  const back = action('‹', 'song-icon-button phrase-melody-back', () => { void execute(showOverview); });
  back.title = '返回音乐'; back.setAttribute('aria-label', '返回音乐'); back.hidden = true;
  const sectionLabel = node('span', 'phrase-composition-section-label', '创作'); sectionLabel.hidden = true;
  if (options.directMusic) identity.append(titleGroup);
  else identity.append(back, titleGroup, node('span', 'song-project-kind', '音乐'), sectionLabel);
  topbar.append(identity, controls, files);
  const main = node('main', 'phrase-composition-main'); const sectionControls = node('aside', 'phrase-composition-controls');
  const openCreation = action('创作', 'phrase-composition-control phrase-composition-open-creation', () => { void execute(() => showSection('melody')); });
  openCreation.setAttribute('aria-label', '进入创作'); openCreation.title = '进入创作';
  openCreation.addEventListener('keydown', event => { if (event.key === ' ' || event.key === 'Enter') event.stopPropagation(); });
  sectionControls.append(node('div', 'phrase-composition-control-spacer'), openCreation, node('div', 'phrase-composition-control', '音乐控制台'));
  const canvas = node('div', 'phrase-composition-canvas'); ruler = node('div', 'phrase-composition-ruler');
  handle = action('', 'phrase-composition-head-handle', () => {}); handle.setAttribute('role', 'slider'); handle.setAttribute('aria-label', '播放头'); handle.setAttribute('aria-valuemin', '0'); handle.setAttribute('aria-valuemax', String(length()));
  const flag = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); flag.setAttribute('viewBox', '0 0 16 20'); flag.setAttribute('aria-hidden', 'true');
  const shape = document.createElementNS('http://www.w3.org/2000/svg', 'path'); shape.setAttribute('d', 'M1 1h14v11l-7 7-7-7z'); shape.setAttribute('fill', 'currentColor'); flag.append(shape); handle.append(flag); ruler.append(handle);
  handle.addEventListener('keydown', event => {
    if (busy || disposed || !current.body) return;
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? length() : undefined;
    if (next !== undefined) { event.preventDefault(); event.stopPropagation(); transport.seek(next * 60 / tempo()); positionHead(); }
  });
  viewport = node('div', 'phrase-composition-viewport'); viewport.tabIndex = 0; viewport.setAttribute('aria-label', '音乐播放列表');
  const melodySection = node('section', 'phrase-composition-section phrase-composition-melody'); melodySection.setAttribute('aria-label', '创作播放区');
  const phraseConsole = node('section', 'phrase-composition-section phrase-composition-console'); phraseConsole.setAttribute('aria-label', '音乐控制台');
  const consoleDetails = node('div', 'phrase-console-details'); const consoleName = node('strong', 'phrase-console-name');
  const consoleStats = node('div', 'phrase-console-stats'); const consoleFields = new Map<string, HTMLElement>();
  for (const [label, suffix] of [['BPM', 'tempo'], ['时长', 'duration'], ['小节', 'bars'], ['音符', 'note-count'], ['音色', 'tone-count']] as const) {
    const field = node('div', 'phrase-console-stat'); const value = node('span', `phrase-console-value phrase-console-${suffix}`);
    field.append(node('span', 'phrase-console-label', label), value); consoleStats.append(field); consoleFields.set(label, value);
  }
  const consoleVolumeField = node('label', 'phrase-console-volume-field');
  const consoleVolume = node('input', 'phrase-console-volume'); consoleVolume.type = 'range'; consoleVolume.min = '0'; consoleVolume.max = '1'; consoleVolume.step = '.01'; consoleVolume.setAttribute('aria-label', '音乐音量');
  const consoleVolumeValue = node('output', 'phrase-console-volume-value');
  consoleVolumeField.append(node('span', 'phrase-console-label', '音量'), consoleVolume, consoleVolumeValue);
  consoleDetails.append(consoleName, consoleStats, consoleVolumeField); phraseConsole.append(consoleDetails);
  const removeConsoleWheel = attachConsoleHorizontalWheel(phraseConsole);
  function syncConsole(): void {
    const body = current.body; const level = masterPreview ?? body?.masterLevel ?? 1;
    consoleName.textContent = current.draft?.name ?? '音乐';
    consoleFields.get('BPM')!.textContent = body ? String(Math.round(body.tempoBpm)) : '—';
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
    masterPreview = Math.max(0, Math.min(1, value)); syncConsole();
  });
  consoleVolume.addEventListener('change', volumeCommit); consoleVolume.addEventListener('blur', volumeCommit);
  const melodyNotes = node('div', 'phrase-composition-notes'); melodySection.append(melodyNotes);
  const melodyOverview = mountPhraseOverviewNotes(melodyNotes, 'melody', keyboard, { includeAllSections: true });
  playhead = node('div', 'phrase-composition-playhead'); playhead.setAttribute('aria-hidden', 'true'); notice = node('div', 'phrase-composition-notice'); notice.hidden = true; notice.setAttribute('role', 'status');
  const melodyRegion = node('div', 'phrase-melody-region'); melodyRegion.hidden = true;
  const divider = node('div', 'phrase-composition-divider'); divider.tabIndex = 0;
  divider.setAttribute('role', 'separator'); divider.setAttribute('aria-orientation', 'horizontal');
  divider.setAttribute('aria-label', '调整创作与音乐控制台高度'); divider.title = '拖动调整高度';
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
    divider.setAttribute('aria-valuetext', `创作 ${Math.round(percent)}%，音乐控制台 ${Math.round(100 - percent)}%`);
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
    if (disposed || sectionEditor || options.directMusic) return;
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
    detailViewInitialized = true;
    // Detailed editors already constrain their own view; no content or audio changes.
    view = { leftSeconds: next.leftSeconds, zoom: next.zoom, rowHeight: 24 };
    sectionViews[section] = { top: next.top, rowHeight: next.rowHeight, initialized: true };
  }
  async function showSection(_section: PhraseSection, initial?: PhraseView): Promise<void> {
    if (sectionEditor || disposed) return;
    current = initial ?? phrase.read();
    if (!detailViewInitialized) {
      const restored = options.workspaceState?.read();
      if (restored) await transport.seek(restored.playheadSeconds);
      if (disposed) return;
    }
    if (!options.directMusic) paintOverview(); cancelAnimationFrame(overviewFrame); overviewFrame = 0;
    main.hidden = true; melodyRegion.hidden = false;
    activeSection = 'melody';
    try { sectionEditor = mountMelodyWorkspace(melodyRegion, { phrase, sound, initialView: current, gridBpm: gridTempo, readPerformanceMode: options.readPerformanceMode, includeAllSections: true,
      readMultipleTempoRolls: options.readMultipleTempoRolls, onLearningAction: options.onLearningAction, readLessonInput: options.readLessonInput,
      mobileTouch,
      orientation: options.directMusic ? 'vertical' : 'horizontal',
      showPlayheadTime: options.directMusic,
      workspaceState: options.workspaceState,
      initialViewport: !options.directMusic || detailViewInitialized ? { leftSeconds: view.leftSeconds, zoom: view.zoom, top: sectionViews.melody.top, rowHeight: sectionViews.melody.rowHeight } : undefined,
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
      onPreview(body) { if (disposed || body === previewBody) return; previewBody = body; transport.refresh(); },
      onPlaybackFamilyChange(id) { if (disposed) return; playbackFamilyId = id; transport.refresh(id === undefined); },
      readPlayhead: () => transport.position(),
      readIsPlaying: () => state.playing || state.preparing,
      onSeek(seconds) { const ready = transport.seek(seconds); positionHead(); return ready; },
    }); } catch (error) { activeSection = undefined; main.hidden = false; melodyRegion.hidden = true; melodyRegion.replaceChildren(); throw error; }
    if (options.frameNotesOnMount) sectionEditor.frameNotes();
    sectionLabel.textContent = '创作';
    back.hidden = sectionLabel.hidden = !!options.directMusic;
    options.onSectionChange?.('melody'); positionHead(); transport.refresh();
  }
  function showOverview(): void {
    if (sectionEditor && activeSection) rememberViewport(activeSection, sectionEditor.readViewport());
    activeSection = undefined;
    const previous = sectionEditor; sectionEditor = undefined; previous?.dispose(); previewBody = undefined; playbackFamilyId = undefined;
    melodyRegion.replaceChildren(); melodyRegion.hidden = true; main.hidden = false;
    back.hidden = sectionLabel.hidden = true; options.onSectionChange?.('overview'); paintOverview(); transport.refresh();
  }
  ruler.addEventListener('pointerdown', event => startGesture(event, 'head')); viewport.addEventListener('pointerdown', event => startGesture(event, 'pan'));
  const lostCapture = (event: PointerEvent) => { if (gesture?.id === event.pointerId) finishGesture(gesture.kind !== 'head'); };
  ruler.addEventListener('lostpointercapture', lostCapture); viewport.addEventListener('lostpointercapture', lostCapture);
  divider.addEventListener('lostpointercapture', lostCapture);
  viewport.addEventListener('wheel', wheel, { passive: false }); ruler.addEventListener('wheel', wheel, { passive: false });
  document.addEventListener('pointermove', move); document.addEventListener('pointerup', up); document.addEventListener('pointercancel', cancel); document.addEventListener('keydown', key);
  const resize = () => { if (!sectionEditor) scheduleOverview(); };
  window.addEventListener('resize', resize);
  if (typeof ResizeObserver !== 'undefined') { observer = new ResizeObserver(resize); observer.observe(viewport); }
  sync(current); if (!options.directMusic) paintOverview(); updatePlayback();
  const initialSection = options.directMusic ? 'melody' : options.initialSection;
  if (options.directMusic) main.hidden = true;
  if (initialSection && initialSection !== 'overview') {
    // Initial mounting is read-only setup, not a file action. Avoid execute's
    // repeated full-score reads, save flushing and second editor repaint.
    busy = true; sync(current);
    void showSection(initialSection, current).catch(error => report(error instanceof Error ? error.message : String(error), true))
      .finally(() => { if (!disposed) { busy = false; sync(current); } });
  }
  return { dispose() {
    if (disposed) return; finishGesture(false); disposed = true; tapTempoDialog?.dispose(); sectionEditor?.dispose(); sectionEditor = undefined; melodyOverview.dispose(); removeConsoleWheel(); transport.dispose(); observer?.disconnect(); cancelAnimationFrame(frame); cancelAnimationFrame(overviewFrame); overviewFrame = 0; window.clearTimeout(noticeTimer);
    document.removeEventListener('pointermove', move); document.removeEventListener('pointerup', up); document.removeEventListener('pointercancel', cancel); document.removeEventListener('keydown', key);
    window.removeEventListener('resize', resize);
  }, refresh, notify: report, frameNotes(reserveEndSpace) { sectionEditor?.frameNotes(reserveEndSpace); }, previewTempoRate(value) { sectionEditor?.previewTempoRate(value); }, async flush() {
    if (disposed) throw new Error('当前音乐页面已关闭。');
    if (busy) throw new Error('正在处理音乐，请稍候再试。');
    if (!await commitTitle()) throw new Error('请先完成音乐名称。');
    finishGesture(false); sectionEditor?.flush(); commitMaster();
  } };
}
