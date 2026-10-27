import type { PhraseEditorPort, PhraseSection } from '../../contracts/phrase.ts';
import type { SoundRuntimePort } from '../../contracts/sound.ts';
import { createPhraseCompositionTransport } from './phrase-composition-transport.ts';
import { mountMelodyWorkspace } from './melody-workspace.ts';
import { mountRhythmWorkspace } from './rhythm-workspace.ts';
import { undoPhraseEdit } from './phrase-performance-history.ts';
import { clampPhraseCompositionView, panPhraseComposition, phraseCompositionBeatAt, phraseCompositionScale,
  zoomPhraseComposition, type PhraseCompositionView } from './phrase-composition-geometry.ts';
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
  listTimbres?(): { id: string; name: string }[];
  onAddTimbre?(id: string, section: PhraseSection): string;
  onCreateNoteGroup?(id: string): string;
  onChangeNoteGroupTimbre?(partId: string, timbreId: string): void;
  onRemoveTimbre?(id: string, section: PhraseSection): void;
}): { dispose(): void; refresh(): void; notify(message: string, error?: boolean): void } {
  const { phrase, sound } = options;
  let disposed = false; let current = phrase.read(); let draftId = current.draft?.id;
  let view: PhraseCompositionView = { leftBeat: 0, zoom: 1 };
  let busy = false; let frame = 0; let noticeTimer = 0; let observer: ResizeObserver | undefined;
  let keepDraftViewport = false;
  let sectionEditor: ReturnType<typeof mountMelodyWorkspace> | undefined;
  let activeSection: PhraseSection | undefined;
  let previewBody: Parameters<PhraseEditorPort['previewPlan']>[0];
  let state = { playing: false, preparing: false, position: 0, rate: 1 };
  let playButton: HTMLButtonElement; let clock: HTMLElement; let viewport: HTMLElement; let ruler: HTMLElement;
  let playhead: HTMLElement; let handle: HTMLButtonElement; let notice: HTMLElement; let title: HTMLElement;
  let tempoInput: HTMLInputElement; let masterInput: HTMLInputElement; let rateButton: HTMLButtonElement;
  let titleInput: HTMLInputElement | undefined; let titleCommit: Promise<boolean> | undefined;
  let masterPreview: number | undefined; let masterPointer: number | undefined;
  const fileButtons: HTMLButtonElement[] = [];
  let gesture: { kind: 'head' | 'pan'; id: number; capture: HTMLElement; lastX: number } | undefined;
  const tempo = () => current.body?.tempoBpm ?? 120;
  const length = () => current.body?.lengthBeats ?? 16;
  const gridTempo = tempo;
  function report(message: string, error = false): void {
    if (disposed || !notice) return;
    notice.textContent = message; notice.hidden = !message; notice.classList.toggle('is-error', error);
    window.clearTimeout(noticeTimer); noticeTimer = window.setTimeout(() => { if (!disposed) notice.hidden = true; }, error ? 7000 : 3200);
  }
  const transport = createPhraseCompositionTransport({ runtime: sound, tempoBpm: tempo, lengthBeats: length,
    prepare: () => phrase.preparePreview(), readPlan: () => {
      let body = previewBody ?? current.body;
      // Section audition is a temporary view of one phrase, never a content edit.
      // Keep every part present so a section without tones still has a valid silent plan.
      if (body && activeSection) body = { ...body, parts: body.parts.map(part =>
        (part.section ?? 'melody') === activeSection ? part : { ...part, notes: [] }) };
      if (body && masterPreview !== undefined) body = { ...body, masterLevel: masterPreview };
      return phrase.previewPlan(body, { allowSilence: true });
    },
    onChange(next) { state = next; updatePlayback(); }, onError: error => report(error instanceof Error ? error.message : String(error), true) });

  function updateTitle(): void { if (!titleInput && title) title.textContent = current.draft?.name ?? '乐句'; }
  function sync(): void {
    current = phrase.read();
    if (draftId !== current.draft?.id) {
      draftId = current.draft?.id;
      if (!keepDraftViewport || !current.body) { view = { leftBeat: 0, zoom: 1 }; masterPreview = undefined; transport.stop(); }
    }
    updateTitle();
    if (document.activeElement !== tempoInput) tempoInput.value = String(gridTempo());
    if (document.activeElement !== masterInput) masterInput.value = String(masterPreview ?? current.body?.masterLevel ?? 1);
    for (const button of fileButtons) button.disabled = busy || !current.draft;
    if (playButton) playButton.disabled = busy || !current.body;
    tempoInput.disabled = masterInput.disabled = busy || !current.body;
  }
  function positionHead(): void {
    if (disposed || !viewport) return;
    const seconds = transport.position();
    const ms = Math.round(seconds * 1000); clock.textContent = `${Math.floor(ms / 60000).toString().padStart(2, '0')}:${Math.floor(ms / 1000 % 60).toString().padStart(2, '0')}.${(ms % 1000).toString().padStart(3, '0')}`;
    if (sectionEditor) { sectionEditor.setPlayhead(seconds); return; }
    const beat = Math.max(0, Math.min(length(), seconds * tempo() / 60));
    const width = Math.max(1, viewport.clientWidth); const x = (beat - view.leftBeat) * phraseCompositionScale(view, width, length());
    playhead.hidden = x < 0 || x > width; handle.hidden = playhead.hidden;
    playhead.style.left = `${Math.min(width - 1, Math.max(0, x))}px`; handle.style.left = `${Math.min(width - 1, Math.max(0, x))}px`;
    handle.setAttribute('aria-valuenow', String(beat)); handle.setAttribute('aria-valuemax', String(length())); handle.title = `${Number(beat.toFixed(3))} 拍`;
    viewport.dataset.leftBeat = String(view.leftBeat); viewport.dataset.zoom = String(view.zoom);
  }
  function updatePlayback(): void {
    if (!playButton || disposed) return;
    playButton.replaceChildren(icon(state.playing ? 'pause' : 'play')); playButton.classList.toggle('is-preparing', state.preparing);
    playButton.setAttribute('aria-label', state.preparing ? '取消播放准备' : state.playing ? '暂停' : '播放');
    cancelAnimationFrame(frame); positionHead(); if (state.playing) frame = requestAnimationFrame(tick);
  }
  function tick(): void { if (!disposed) { positionHead(); if (state.playing) frame = requestAnimationFrame(tick); } }
  function refresh(): void { if (disposed) return; sync(); view = clampPhraseCompositionView(view, length()); sectionEditor?.refresh(); positionHead(); transport.refresh(); }
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
        if (!disposed) { current = phrase.read(); updateTitle(); }
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
  function seek(x: number): void { transport.seek(phraseCompositionBeatAt(view, viewport.clientWidth, x, length()) * 60 / tempo()); positionHead(); }
  function startGesture(event: PointerEvent, kind: 'head' | 'pan'): void {
    if (disposed || busy || event.button !== 0 || !current.body) return;
    event.preventDefault(); finishGesture(); viewport.focus({ preventScroll: true });
    const capture = kind === 'head' ? ruler : viewport; gesture = { kind, id: event.pointerId, capture, lastX: event.clientX };
    capture.setPointerCapture?.(event.pointerId); if (kind === 'head') seek(localX(event)); else viewport.classList.add('is-panning');
  }
  function move(event: PointerEvent): void {
    if (!gesture || gesture.id !== event.pointerId || disposed) return;
    event.preventDefault();
    if (gesture.kind === 'head') seek(localX(event));
    else { view = panPhraseComposition(view, viewport.clientWidth, gesture.lastX - event.clientX, length()); gesture.lastX = event.clientX; positionHead(); }
  }
  function finishGesture(): void {
    const previous = gesture; gesture = undefined; viewport?.classList.remove('is-panning');
    if (previous?.capture.hasPointerCapture?.(previous.id)) previous.capture.releasePointerCapture(previous.id);
  }
  const up = (event: PointerEvent) => { if (gesture?.id === event.pointerId) finishGesture(); if (masterPointer === event.pointerId) { masterPointer = undefined; try { commitMaster(); } catch (error) { report(String(error), true); sync(); } } };
  const cancel = (event: PointerEvent) => { if (gesture?.id === event.pointerId) finishGesture(); if (masterPointer === event.pointerId) { masterPointer = undefined; masterPreview = undefined; sync(); transport.refresh(); } };
  function wheel(event: WheelEvent): void {
    if (disposed || busy) return; event.preventDefault(); finishGesture();
    view = event.ctrlKey || event.metaKey ? zoomPhraseComposition(view, viewport.clientWidth, localX(event), Math.exp(-event.deltaY * .002), length())
      : panPhraseComposition(view, viewport.clientWidth, event.deltaX || event.deltaY, length());
    positionHead();
  }
  const key = (event: KeyboardEvent) => {
    if (disposed || root.querySelector('dialog[open]')) return;
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') { event.preventDefault(); if (!event.repeat && !busy) void execute(event.shiftKey ? options.onSaveAs : options.onSave, true, !event.shiftKey); return; }
    if (busy) return;
    const rangeUndo = event.key === 'Backspace' && event.target instanceof HTMLInputElement && event.target.type === 'range';
    if (event.isComposing || event.keyCode === 229 || event.target instanceof HTMLInputElement && !rangeUndo || event.target instanceof HTMLSelectElement || event.target instanceof HTMLTextAreaElement
      || (event.target as HTMLElement)?.isContentEditable) return;
    if (!sectionEditor && !event.altKey && !event.metaKey && !event.shiftKey && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
      event.preventDefault(); finishGesture();
      const right = event.key === 'ArrowRight';
      view = event.ctrlKey ? zoomPhraseComposition(view, viewport.clientWidth, viewport.clientWidth / 2, right ? 1.2 : 1 / 1.2, length())
        : panPhraseComposition(view, viewport.clientWidth, right ? 80 : -80, length());
      positionHead(); return;
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
  const volume = node('div', 'song-popover'); const volumeButton = action('', 'song-icon-button', () => {}); volumeButton.setAttribute('aria-label', '音量'); volumeButton.append(icon('volume'));
  const volumePanel = node('div', 'song-popover-panel song-volume-panel'); masterInput = node('input'); masterInput.type = 'range'; masterInput.min = '0'; masterInput.max = '1'; masterInput.step = '.01'; masterInput.setAttribute('aria-label', '总音量');
  masterInput.addEventListener('pointerdown', event => { if (!disposed && !busy) masterPointer = event.pointerId; });
  masterInput.addEventListener('input', () => {
    if (disposed || busy || !current.body) return; const value = Number(masterInput.value); if (!Number.isFinite(value)) return;
    masterPreview = Math.max(0, Math.min(1, value)); transport.refresh();
  });
  const volumeCommit = () => { if (disposed || busy) return; try { commitMaster(); } catch (error) { masterPreview = undefined; report(error instanceof Error ? error.message : String(error), true); sync(); } };
  masterInput.addEventListener('change', volumeCommit); masterInput.addEventListener('blur', volumeCommit);
  volumePanel.append(masterInput); volume.append(volumeButton, volumePanel);
  controls.append(stopButton, playButton, clock, rate, bpm, volume);
  const files = node('div', 'song-file-actions');
  if (options.onSettings) { const settings = action('设置', 'song-settings', () => { void execute(options.onSettings); }); files.append(settings); fileButtons.push(settings); }
  const save = action('保存', 'song-save', () => { void execute(options.onSave, true, true); }); files.append(save); fileButtons.push(save);
  if (options.onSaveAs) { const saveAs = action('另存为', 'song-save', () => { void execute(options.onSaveAs, true); }); files.append(saveAs); fileButtons.push(saveAs); }
  if (options.onExit) { const exit = action('退出', 'song-exit', () => { void execute(options.onExit); }); files.append(exit); fileButtons.push(exit); }
  const identity = node('div', 'phrase-composition-identity');
  const back = action('‹', 'song-icon-button phrase-melody-back', () => { void execute(showOverview); });
  back.title = '返回乐句'; back.setAttribute('aria-label', '返回乐句'); back.hidden = true;
  const sectionLabel = node('span', 'phrase-composition-section-label', '旋律部'); sectionLabel.hidden = true;
  identity.append(back, title, node('span', 'song-project-kind', '乐句'), sectionLabel); topbar.append(identity, controls, files);
  const main = node('main', 'phrase-composition-main'); const sectionControls = node('aside', 'phrase-composition-controls');
  sectionControls.append(node('div', 'phrase-composition-control-spacer'), node('div', 'phrase-composition-control', '旋律部'), node('div', 'phrase-composition-control', '节奏部'));
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
  const melodySection = node('section', 'phrase-composition-section phrase-composition-melody'); melodySection.setAttribute('aria-label', '旋律部播放区');
  const create = action('创作', 'phrase-composition-create phrase-composition-melody-create', () => { void execute(() => showSection('melody')); });
  create.addEventListener('pointerdown', event => event.stopPropagation()); melodySection.append(create);
  const rhythm = node('section', 'phrase-composition-section phrase-composition-rhythm'); rhythm.setAttribute('aria-label', '节奏部播放区');
  const createRhythm = action('创作', 'phrase-composition-create phrase-composition-rhythm-create', () => { void execute(() => showSection('rhythm')); });
  createRhythm.addEventListener('pointerdown', event => event.stopPropagation()); rhythm.append(createRhythm);
  playhead = node('div', 'phrase-composition-playhead'); playhead.setAttribute('aria-hidden', 'true'); notice = node('div', 'phrase-composition-notice'); notice.hidden = true; notice.setAttribute('role', 'status');
  const melodyRegion = node('div', 'phrase-melody-region'); melodyRegion.hidden = true;
  viewport.append(melodySection, rhythm, playhead); canvas.append(ruler, viewport); main.append(sectionControls, canvas); page.append(topbar, main, melodyRegion, notice); root.replaceChildren(page);
  async function showSection(section: PhraseSection): Promise<void> {
    if (sectionEditor || disposed) return;
    await options.onPrepareMelody?.();
    if (disposed) return;
    current = phrase.read();
    main.hidden = true; melodyRegion.hidden = false;
    const mount = section === 'rhythm' ? mountRhythmWorkspace : mountMelodyWorkspace;
    activeSection = section;
    try { sectionEditor = mount(melodyRegion, { phrase, sound, gridBpm: gridTempo, readPerformanceMode: options.readPerformanceMode,
      listTimbres: options.listTimbres ?? (() => phrase.read().availableSounds.map(item => ({ id: item.id, name: item.name }))),
      onAddTimbre: id => options.onAddTimbre ? options.onAddTimbre(id, section) : phrase.read().body?.parts
        .find(part => part.timbreId === id && (part.section ?? 'melody') === section)?.id ?? phrase.addPart(id, section),
      onRemoveTimbre: options.onRemoveTimbre ? id => options.onRemoveTimbre!(id, section) : undefined,
      onCreateNoteGroup: options.onCreateNoteGroup,
      onChangeNoteGroupTimbre: options.onChangeNoteGroupTimbre,
      onChange: refresh,
      onPreview(body) { previewBody = body; transport.refresh(); },
      readPlayhead: () => transport.position(),
      onSeek(seconds) { const ready = transport.seek(seconds); positionHead(); return ready; },
    }); } catch (error) { activeSection = undefined; main.hidden = false; melodyRegion.hidden = true; melodyRegion.replaceChildren(); throw error; }
    sectionLabel.textContent = section === 'rhythm' ? '节奏部' : '旋律部';
    back.hidden = sectionLabel.hidden = false;
    options.onSectionChange?.(section); positionHead(); transport.refresh();
  }
  function showOverview(): void {
    activeSection = undefined;
    const previous = sectionEditor; sectionEditor = undefined; previous?.dispose(); previewBody = undefined;
    melodyRegion.replaceChildren(); melodyRegion.hidden = true; main.hidden = false;
    back.hidden = sectionLabel.hidden = true; options.onSectionChange?.('overview'); positionHead(); transport.refresh();
  }
  ruler.addEventListener('pointerdown', event => startGesture(event, 'head')); viewport.addEventListener('pointerdown', event => startGesture(event, 'pan'));
  const lostCapture = (event: PointerEvent) => { if (gesture?.id === event.pointerId) finishGesture(); };
  ruler.addEventListener('lostpointercapture', lostCapture); viewport.addEventListener('lostpointercapture', lostCapture);
  viewport.addEventListener('wheel', wheel, { passive: false }); ruler.addEventListener('wheel', wheel, { passive: false });
  document.addEventListener('pointermove', move); document.addEventListener('pointerup', up); document.addEventListener('pointercancel', cancel); document.addEventListener('keydown', key);
  const resize = () => { view = clampPhraseCompositionView(view, length()); positionHead(); };
  window.addEventListener('resize', resize);
  if (typeof ResizeObserver !== 'undefined') { observer = new ResizeObserver(resize); observer.observe(viewport); }
  sync(); updatePlayback();
  const initialSection = options.initialSection;
  if (initialSection && initialSection !== 'overview') void execute(() => showSection(initialSection));
  return { dispose() {
    if (disposed) return; finishGesture(); disposed = true; sectionEditor?.dispose(); sectionEditor = undefined; transport.dispose(); observer?.disconnect(); cancelAnimationFrame(frame); window.clearTimeout(noticeTimer);
    document.removeEventListener('pointermove', move); document.removeEventListener('pointerup', up); document.removeEventListener('pointercancel', cancel); document.removeEventListener('keydown', key);
    window.removeEventListener('resize', resize);
  }, refresh, notify: report };
}
