import type { PhraseBody, PhraseEditorPort } from '../../contracts/phrase.ts';
import { phraseBarBeats, phraseMeterBeatLength, phraseTempoBoundary, phraseTempoSpans, phraseStepsAtBeat, withPhraseGridOffset } from '../../contracts/phrase-time.ts';
import type { MelodyView } from './melody-geometry.ts';
import { showTapTempo } from './tap-tempo.ts';
import { createTapTempo } from './tap-tempo-model.ts';
import { estimateScoreTempo } from './score-tempo.ts';
import { attachMelodyTempoInput } from './melody-tempo-input.ts';
import { MAX_PHRASE_BEATS } from '../../contracts/phrase-limits.ts';
import type { LearningAction } from '../../contracts/guidance.ts';
import { MIN_TEMPO_BPM, MAX_TEMPO_BPM } from '../../contracts/music-limits.ts';

function element<K extends keyof HTMLElementTagNameMap>(tag: K, className: string, text = '') {
  const node = document.createElement(tag); node.className = className; node.textContent = text; return node;
}
export function mountMelodyTempoRolls(options: {
  root: HTMLElement; dock: HTMLElement; ruler: HTMLElement; bands: HTMLElement; extend: HTMLButtonElement; end: HTMLButtonElement;
  phrase: PhraseEditorPort; readBody(): PhraseBody | undefined; readView(): MelodyView; scale(): number; height(): number;
  flush(): boolean; changed(committed?: boolean, preserveSounding?: boolean): void; preview(body?: PhraseBody, boundaryOnly?: boolean): void; navigate(seconds: number): void; report(message: string): void;
  gridVisibilityChanged?(): void;
  gridChanged?(steps: number, bpm: number): void;
  readMultipleTempoRolls?(): boolean; previewRate(value?: number, sectionId?: string): void; inGuide?: boolean; beatLinesOnly?: boolean; desktopTapTempo?: boolean; onLearningAction?(action: LearningAction): void;
}) {
  let active: string | undefined, opened = false, disposed = false;
  let selected: string | undefined;
  let menuSection: string | undefined;
  let menuAnchor: HTMLButtonElement | undefined;
  let tap: ReturnType<typeof showTapTempo> | undefined;
  let drag: { base: PhraseBody; id: string | undefined; pointerId: number; capture: HTMLElement; fromY: number; scale: number; bpm: number;
    start: number; previousStart: number; gridOrigin: number; bar: number; beatSize: number; minimum: number; maximum: number;
    raw: number; snapped: number; moved: boolean } | undefined;
  let frame = 0, suppressClickUntil = 0;
  const markers = new Map<string, { band: HTMLElement; block: HTMLElement; button: HTMLButtonElement }>();
  const button = element('button', 'melody-tempo-button', '120');
  button.type = 'button';
  button.setAttribute('aria-label', 'BPM');
  button.setAttribute('aria-expanded', 'false');
  const panel = element('div', 'melody-tempo-panel'); panel.hidden = true;
  panel.classList.toggle('is-compact-tempo', options.beatLinesOnly === true);
  const field = element('label', 'melody-tempo-field', 'BPM'), input = element('input', 'melody-tempo-input melody-tempo-rate-input');
  input.type = 'number'; input.min = String(MIN_TEMPO_BPM); input.max = String(MAX_TEMPO_BPM); input.step = 'any'; input.setAttribute('aria-label', '当前画布 BPM');
  const rateControl = element('span', 'melody-tempo-rate');
  const scrubIcon = element('span', 'melody-tempo-scrub-mark'); scrubIcon.setAttribute('aria-hidden', 'true');
  rateControl.append(input, scrubIcon); field.append(rateControl);
  const rateInput = attachMelodyTempoInput(input, rateControl, {
    read: () => desktopSuggestion() ?? readTempo(),
    preview(value) { if (desktopSuggestion() === undefined) options.previewRate(value, active); },
    adjusted() { if (desktopSuggestion() !== undefined) armTimeout(); },
    commit(value) {
      const candidate = desktopSuggestion();
      if (candidate !== undefined) {
        if (candidate !== value) {
          pulse.reset();
          lastTap = -Infinity;
          showSuggestion(value);
        }
        return;
      }
      try { apply(value); }
      catch (error) { options.report(error instanceof Error ? error.message : String(error)); paint(); }
    },
  });
  function makeGrid(readId: () => string | undefined, className: string) {
    const grid = element('select', className); grid.setAttribute('aria-label', '每拍细分');
    for (let count = 2; count <= 9; count++) { const choice = element('option', '', `${count} 份`); choice.value = String(count); grid.append(choice); }
    grid.addEventListener('pointerdown', event => event.stopPropagation());
    grid.addEventListener('keydown', event => event.stopPropagation());
    grid.addEventListener('change', () => {
      const id = readId(), steps = Number(grid.value); if (!options.flush()) return;
      const previous = phraseStepsAtBeat(options.readBody()!, phraseTempoSpans(options.readBody()!).find(span => span.id === id)?.startBeat ?? 0);
      try {
        options.phrase.setTempoSectionSteps(id, steps);
        const bpm = phraseTempoSpans(options.readBody()!).find(span => span.id === id)?.tempoBpm ?? options.readBody()!.tempoBpm;
        options.gridChanged?.(steps, bpm); options.changed(); if (previous !== steps) options.onLearningAction?.('change-grid');
      }
      catch (error) { options.report(error instanceof Error ? error.message : String(error)); paint(); }
    });
    return grid;
  }
  function makeTap(readId: () => string | undefined) {
    const trigger = element('button', 'melody-tap-tempo song-tap-tempo', '敲击定速'); trigger.type = 'button';
    trigger.setAttribute('aria-label', '敲击定速');
    trigger.addEventListener('pointerdown', event => event.stopPropagation());
    trigger.addEventListener('click', () => openTap(readId()));
    return trigger;
  }
  function openTap(id?: string): void {
    if (tap) return;
    close();
    tap = showTapTempo(options.root, {
      inGuide: options.inGuide,
      onApply(value) { active = id; return apply(value); },
      onClose() { tap = undefined; },
    });
  }
  const grid = makeGrid(() => active, 'melody-grid-select melody-tempo-grid');
  const gridField = element('label', 'melody-tempo-grid-field', '每拍细分'); gridField.append(grid);
  const meterField = element('label', 'melody-tempo-grid-field', '拍号');
  const meter = element('select', 'melody-grid-select melody-meter-select'); meter.setAttribute('aria-label', '拍号');
  const commonMeters = ['2/4', '3/4', '4/4', '5/4', '3/8', '5/8', '6/8', '7/8', '9/8', '12/8'];
  for (const label of commonMeters) { const choice = element('option', '', label); choice.value = label; meter.append(choice); }
  let importedMeter: HTMLOptionElement | undefined;
  meterField.append(meter); meterField.hidden = options.inGuide === true;
  meter.addEventListener('pointerdown', event => event.stopPropagation());
  meter.addEventListener('change', () => {
    if (!options.flush()) return;
    const [numerator, denominator] = meter.value.split('/').map(Number);
    const body = options.readBody();
    if (!body || (body.beatsPerBar ?? 4) === numerator && (body.beatUnit ?? 4) === denominator) return;
    try {
      options.phrase.setMeter(numerator!, denominator!);
      options.changed();
    } catch (error) { options.report(error instanceof Error ? error.message : String(error)); paint(); }
  });
  const pulse = createTapTempo();
  let tapping = false, suggestion: number | undefined, tapTimeout = 0, lastTap = -Infinity;
  const tapButton = element('button', 'melody-tap-tempo');
  const analyzeButton = options.desktopTapTempo ? undefined : element('button', 'melody-analyze-tempo', '分析');
  const analysisStatus = analyzeButton ? element('output', 'melody-tempo-status', '无法确定 BPM') : undefined;
  tapButton.type = 'button';
  if (analyzeButton) analyzeButton.type = 'button';
  function desktopSuggestion(): number | undefined {
    return options.desktopTapTempo ? suggestion : undefined;
  }
  function showSuggestion(value?: number): void {
    suggestion = value;
    input.value = String(Math.round(value ?? readTempo()));
    if (analyzeButton && analysisStatus) {
      analysisStatus.hidden = true;
      tapButton.textContent = '敲拍';
      analyzeButton.textContent = value === undefined ? '分析' : '应用';
      return;
    }
    tapButton.textContent = value === undefined ? '' : '应用';
    tapButton.classList.toggle('is-space-key', value === undefined);
    tapButton.setAttribute('aria-label', value === undefined ? '空格定速' : '应用 BPM');
  }
  function resetSuggestion(): void {
    window.clearTimeout(tapTimeout);
    pulse.reset();
    lastTap = -Infinity;
    tapping = false;
    tapButton.removeAttribute('aria-pressed');
    showSuggestion();
  }
  function armTimeout(): void {
    window.clearTimeout(tapTimeout);
    tapTimeout = window.setTimeout(() => {
      if (desktopSuggestion() !== undefined) rateInput.cancel();
      resetSuggestion();
    }, 7000);
  }
  function tapBeat(): void {
    const now = performance.now();
    if (now - lastTap < 60000 / MAX_TEMPO_BPM) return;
    lastTap = now;
    const { bpm } = pulse.tap(now);
    if (!options.desktopTapTempo || bpm !== undefined) showSuggestion(bpm);
    if (options.desktopTapTempo) armTimeout();
  }
  function applySuggestion(): void {
    if (desktopSuggestion() !== undefined) rateInput.flush();
    if (suggestion === undefined) return;
    try { if (apply(suggestion)) close(); }
    catch (error) { options.report(error instanceof Error ? error.message : String(error)); resetSuggestion(); }
  }
  function beginTapping(): void {
    if (tapping) return;
    rateInput.flush();
    tapping = true;
    tapButton.setAttribute('aria-pressed', 'true');
  }
  resetSuggestion();
  tapButton.addEventListener('click', () => {
    if (desktopSuggestion() !== undefined) { applySuggestion(); return; }
    beginTapping();
    if (options.desktopTapTempo) armTimeout();
    else tapBeat();
  });
  analyzeButton?.addEventListener('click', () => {
    if (suggestion !== undefined) { applySuggestion(); return; }
    rateInput.flush();
    resetSuggestion();
    const body = options.readBody();
    const bpm = body && estimateScoreTempo(body, active);
    if (bpm === undefined) { analysisStatus!.hidden = false; return; }
    showSuggestion(bpm);
  });
  function cancelTapForRateEdit(): void {
    if (tapping && desktopSuggestion() === undefined) resetSuggestion();
  }
  rateControl.addEventListener('pointerdown', cancelTapForRateEdit, true);
  rateControl.addEventListener('wheel', cancelTapForRateEdit, { capture: true });
  input.addEventListener('keydown', event => {
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') cancelTapForRateEdit();
  }, true);
  input.addEventListener('input', () => {
    if (!tapping) return;
    const typed = input.value;
    resetSuggestion();
    input.value = typed;
  });
  panel.append(field);
  if (options.beatLinesOnly) {
    const actions = element('div', 'melody-tempo-actions'); actions.append(tapButton); panel.append(actions);
    if (analyzeButton && analysisStatus) { actions.append(analyzeButton); panel.append(analysisStatus); }
  } else panel.append(makeTap(() => active));
  if (!options.beatLinesOnly) panel.append(gridField, meterField);
  options.root.append(panel);
  options.dock.append(button);
  const gridHandle = options.beatLinesOnly ? element('button', 'melody-grid-shift') : undefined;
  const hiddenGrids = new Set<string | undefined>();
  let gridVisibilityVersion = 0;
  let gridPressed: boolean | undefined;
  let gridShift: { body: PhraseBody; sectionId?: string; pointerId: number; fromX: number; fromY: number; offset: number; initial: number;
    beatsPerPixel: number; panel: HTMLElement; frame: number; moved: boolean; dragging: boolean } | undefined;
  function gridHidden(id?: string): boolean {
    return hiddenGrids.has(id) && !(gridShift?.dragging && gridShift.sectionId === id);
  }
  function toggleGrid(id?: string): void {
    if (!hiddenGrids.delete(id)) hiddenGrids.add(id);
    gridVisibilityVersion++;
    refreshGridControls();
    options.gridVisibilityChanged?.();
  }
  function refreshGridControls(body = options.readBody()): void {
    if (!gridHandle) return;
    const allHidden = !!body && phraseTempoSpans(body).every(span => hiddenGrids.has(span.id));
    if (allHidden && opened) close();
    button.hidden = allHidden;
    options.dock.closest('.song-details-tempo')?.classList.toggle('are-beat-grids-hidden', allHidden);
  }
  if (gridHandle) {
    gridHandle.type = 'button';
    gridHandle.setAttribute('aria-label', '隐藏拍线');
    gridHandle.addEventListener('click', event => {
      if (event.detail === 0 && !gridShift) toggleGrid(active);
    });
    options.dock.append(gridHandle);
    gridHandle.addEventListener('pointerdown', event => {
      const details = options.dock.closest<HTMLElement>('.song-editor-controls');
      if (event.button !== 0 || gridShift || drag || !details?.hasAttribute('open') || !options.flush()) return;
      close();
      const body = options.readBody();
      if (!body) return;
      const span = phraseTempoSpans(body).find(item => item.id === active);
      if (!span) return;
      const initial = span.gridOffsetBeats ?? 0;
      gridShift = { body, sectionId: span.id, pointerId: event.pointerId, fromX: event.clientX, fromY: event.clientY, initial, offset: initial,
        beatsPerPixel: span.tempoBpm / (60 * options.scale()), panel: details, frame: 0, moved: false, dragging: false };
      event.preventDefault();
      event.stopPropagation();
      gridHandle.setPointerCapture(event.pointerId);
    });
    gridHandle.addEventListener('lostpointercapture', event => { if (gridShift?.pointerId === event.pointerId) finishGridShift(false); });
  }
  function moveGridShift(event: PointerEvent): void {
    const shift = gridShift;
    if (!shift || shift.pointerId !== event.pointerId) return;
    const dy = event.clientY - shift.fromY;
    shift.moved ||= Math.hypot(event.clientX - shift.fromX, dy) >= 4;
    const started = !shift.dragging && Math.abs(dy) >= 4;
    if (started) {
      shift.dragging = true;
      shift.panel.classList.add('is-shifting-beats');
      if (hiddenGrids.has(shift.sectionId)) gridVisibilityVersion++;
    }
    if (!shift.dragging) return;
    const cycle = phraseBarBeats(shift.body);
    const rawOffset = shift.initial - dy * shift.beatsPerPixel;
    const offset = ((rawOffset % cycle) + cycle) % cycle;
    if (!started && Math.abs(offset - shift.offset) < 1e-9) return;
    shift.offset = offset;
    if (!shift.frame) shift.frame = requestAnimationFrame(() => {
      shift.frame = 0;
      options.preview(withPhraseGridOffset(shift.body, shift.sectionId, shift.offset), true);
    });
  }
  function finishGridShift(commit: boolean, render = true, tap = false): void {
    const shift = gridShift;
    if (!shift) return;
    gridShift = undefined;
    if (gridHandle?.hasPointerCapture(shift.pointerId)) gridHandle.releasePointerCapture(shift.pointerId);
    if (!shift.dragging) {
      if (commit && tap && !shift.moved) toggleGrid(shift.sectionId);
      return;
    }
    cancelAnimationFrame(shift.frame);
    shift.panel.classList.remove('is-shifting-beats');
    if (hiddenGrids.has(shift.sectionId)) gridVisibilityVersion++;
    options.preview();
    let changed = false;
    try {
      if (commit && Math.abs(shift.offset - shift.initial) >= 1e-9) {
        options.phrase.setTempoGridOffset(shift.sectionId, shift.offset);
        changed = true;
      }
    } catch (error) { options.report(error instanceof Error ? error.message : String(error)); }
    if (render) options.changed(changed, true);
  }
  const menu = element('div', 'melody-tempo-menu'); menu.hidden = true; menu.setAttribute('role', 'menu');
  const remove = element('button', '', '删除'); remove.type = 'button'; remove.setAttribute('role', 'menuitem');
  menu.append(remove); options.root.append(menu);
  const hint = element('div', 'melody-tempo-resize-hint'); hint.hidden = true; options.root.append(hint);
  function close() {
    if (desktopSuggestion() !== undefined) rateInput.cancel();
    else rateInput.flush();
    resetSuggestion();
    opened = false; panel.hidden = true; button.setAttribute('aria-expanded', 'false');
  }
  function closeMenu(focus = false) {
    menu.hidden = true; menuSection = undefined;
    if (focus) menuAnchor?.focus();
    menuAnchor = undefined;
  }
  function open(id: string | undefined, anchor: HTMLElement) {
    closeMenu(); rateInput.flush(); selected = id ?? 'first'; active = id; opened = true; paint(); panel.hidden = false; button.setAttribute('aria-expanded', 'true');
    const inDetails = anchor === button && !!options.dock.closest('.song-details-tempo');
    (inDetails ? options.dock : options.root).append(panel);
    if (inDetails) { panel.style.left = ''; panel.style.top = ''; return; }
    const rect = anchor.getBoundingClientRect(), height = panel.getBoundingClientRect().height;
    const top = rect.bottom + 4 + height > window.innerHeight ? Math.max(4, rect.top - height - 4) : rect.bottom + 4;
    panel.style.left = `${rect.left}px`; panel.style.top = `${top}px`;
  }
  button.addEventListener('click', () => { if (opened) close(); else open(active, button); });
  function selectAt(seconds: number) {
    const body = options.readBody();
    if (!body || options.readMultipleTempoRolls?.() === false) return;
    const span = phraseTempoSpans(body).find(item => seconds >= item.startSeconds && seconds < item.endSeconds);
    if (!span || selected === (span.id ?? 'first')) return;
    if (opened) close();
    selected = span.id ?? 'first';
    paint();
  }
  function readTempo(): number {
    const body = options.readBody();
    return body ? phraseTempoSpans(body).find(span => span.id === active)?.tempoBpm ?? body.tempoBpm : 120;
  }
  function apply(value: number): boolean {
    if (disposed || !options.flush()) return false;
    const previous = readTempo();
    if (previous === value) return true;
    if (active) options.phrase.setTempoSection(active, value, { preserveTimeline: true });
    else options.phrase.setTempo(value, { preserveTimeline: true });
    options.changed(true, true); paint(); if (previous !== value) options.onLearningAction?.('change-tempo');
    return true;
  }
  function addRoll() {
    if (options.readMultipleTempoRolls?.() === false) return;
    if (!options.flush()) return;
    try {
      const id = options.phrase.addTempoSection(); close(); selected = id; options.changed();
      const span = phraseTempoSpans(options.readBody()!).find(value => value.id === id)!;
      options.navigate(span.startSeconds); paint(); options.onLearningAction?.('add-roll');
    } catch (error) { options.report(error instanceof Error ? error.message : String(error)); }
  }
  function openMenu(event: MouseEvent, id: string | undefined, anchor: HTMLButtonElement) {
    event.preventDefault(); event.stopPropagation();
    close(); menuSection = id; menuAnchor = anchor; remove.disabled = id === undefined;
    menu.hidden = false;
    const { width, height } = menu.getBoundingClientRect();
    const rect = anchor.getBoundingClientRect();
    const fromKeyboard = event.clientX === 0 && event.clientY === 0;
    const left = fromKeyboard ? rect.left : event.clientX;
    const top = fromKeyboard ? rect.bottom : event.clientY;
    menu.style.left = `${Math.max(0, Math.min(left, window.innerWidth - width))}px`;
    menu.style.top = `${Math.max(0, Math.min(top, window.innerHeight - height))}px`;
    if (!remove.disabled) remove.focus();
  }
  remove.addEventListener('click', () => {
    const id = menuSection; closeMenu();
    const body = options.readBody();
    if (!body || !id || !options.flush()) return;
    try {
      const { upper } = phraseTempoBoundary(body, id);
      options.phrase.removeTempoSection(id);
      selected = upper.id ?? 'first';
      options.changed(); button.focus();
    } catch (error) { options.report(error instanceof Error ? error.message : String(error)); }
  });
  const outside = (event: PointerEvent) => {
    const target = event.target as HTMLElement;
    if (!menu.hidden && !menu.contains(target)) closeMenu();
    if (opened && !options.dock.contains(target) && !panel.contains(target) && !target.closest?.('.melody-tempo-marker')) close();
  };
  document.addEventListener('pointerdown', outside);
  function beginResize(event: PointerEvent, id: string | undefined, marker: HTMLElement) {
    event.stopPropagation();
    closeMenu();
    if ((id ? options.readMultipleTempoRolls?.() === false : marker !== options.end) || event.button !== 0 || !options.flush()) return;
    event.preventDefault(); close();
    const body = options.readBody()!, boundary = id ? phraseTempoBoundary(body, id) : undefined;
    const previous = boundary?.upper ?? phraseTempoSpans(body).at(-1)!;
    const start = boundary?.lower.startBeat ?? body.lengthBeats;
    const bar = phraseBarBeats(body);
    drag = { base: body, id, pointerId: event.pointerId, capture: marker, fromY: event.clientY, scale: options.scale(), bpm: previous.tempoBpm,
      start, previousStart: previous.startBeat, gridOrigin: previous.startBeat - (previous.gridOffsetBeats ?? 0), bar, beatSize: phraseMeterBeatLength(body),
      minimum: boundary?.minimum ?? Math.max(.25, previous.startBeat + bar), maximum: boundary?.maximum ?? MAX_PHRASE_BEATS,
      raw: start, snapped: start, moved: false };
    marker.classList.add('is-dragging'); marker.setPointerCapture?.(event.pointerId);
  }
  function paintResize() {
    frame = 0; if (!drag || !drag.moved) return;
    try { options.preview(drag.id ? options.phrase.previewTempoSectionStart(drag.id, drag.raw, drag.base) : options.phrase.previewLastTempoRollLength(drag.raw, drag.base), drag.id !== undefined); }
    catch (error) { options.report(error instanceof Error ? error.message : String(error)); }
  }
  const move = (event: PointerEvent) => {
    if (gridShift) { moveGridShift(event); return; }
    const d = drag; if (!d || d.pointerId !== event.pointerId) return;
    event.preventDefault(); const pixels = event.clientY - d.fromY;
    if (Math.abs(pixels) > 3) d.moved = true; if (!d.moved) return;
    const clamp = (beat: number) => Math.max(d.minimum, Math.min(d.maximum, beat));
    d.raw = clamp(d.start + pixels / d.scale * d.bpm / 60);
    if (d.id && options.beatLinesOnly) d.snapped = d.raw;
    else if (d.id) {
      const first = Math.ceil((d.minimum - d.gridOrigin) / d.beatSize - 1e-10);
      const last = Math.floor((d.maximum - d.gridOrigin) / d.beatSize + 1e-10);
      const beat = Math.max(first, Math.min(last, Math.round((d.raw - d.gridOrigin) / d.beatSize)));
      const snapped = clamp(d.gridOrigin + beat * d.beatSize);
      d.snapped = first <= last && (snapped - d.start) * (d.raw - d.start) > 0 ? snapped : d.start;
    } else d.snapped = clamp(d.start + Math.round((d.raw - d.start) / d.bar) * d.bar);
    const beats = d.snapped - d.previousStart;
    hint.hidden = false;
    hint.textContent = d.id ? `${Number((beats / d.beatSize).toFixed(2))} 拍` : `${Number((beats / d.bar).toFixed(2))} 小节`;
    const rect = d.capture.getBoundingClientRect(); hint.style.left = `${rect.right + 8}px`; hint.style.top = `${event.clientY - 12}px`;
    if (!frame) frame = requestAnimationFrame(paintResize);
  };
  function finishResize(commit: boolean, render = true) {
    const d = drag; if (!d) return; drag = undefined;
    cancelAnimationFrame(frame); frame = 0; hint.hidden = true; d.capture.classList.remove('is-dragging');
    if (d.capture.hasPointerCapture?.(d.pointerId)) d.capture.releasePointerCapture(d.pointerId);
    if (d.moved) suppressClickUntil = performance.now() + 250;
    options.preview();
    let changed = false;
    try { if (commit && d.moved && Math.abs(d.snapped - d.start) > 1e-10) {
      if (d.id) options.phrase.setTempoSectionStart(d.id, d.snapped); else options.phrase.setLastTempoRollLength(d.snapped); changed = true;
    } }
    catch (error) { options.report(error instanceof Error ? error.message : String(error)); }
    if (render) options.changed(changed, true);
    if (changed) options.onLearningAction?.('resize-roll');
  }
  const up = (event: PointerEvent) => {
    if (gridShift?.pointerId === event.pointerId) { moveGridShift(event); finishGridShift(true, true, true); }
    if (drag?.pointerId === event.pointerId) {
      if (drag.id && options.beatLinesOnly) move(event);
      finishResize(true);
    }
  };
  const cancel = (event: PointerEvent) => {
    if (gridShift?.pointerId === event.pointerId) finishGridShift(false);
    if (drag?.pointerId === event.pointerId) finishResize(false);
  };
  function cancelInteraction(): boolean {
    if (gridShift) { finishGridShift(false); return true; }
    if (!menu.hidden) { closeMenu(true); return true; }
    if (drag) { finishResize(false); return true; }
    if (opened) { rateInput.cancel(); close(); button.focus(); return true; }
    return false;
  }
  const escape = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && !event.defaultPrevented && cancelInteraction()) event.preventDefault();
  };
  document.addEventListener('pointermove', move); document.addEventListener('pointerup', up); document.addEventListener('pointercancel', cancel); document.addEventListener('keydown', escape);
  if (options.phrase.autoRollLength) {
    options.end.disabled = true; options.end.setAttribute('aria-hidden', 'true');
  }
  options.end.addEventListener('pointerdown', event => { if (!options.phrase.autoRollLength) beginResize(event, undefined, options.end); });
  options.end.addEventListener('lostpointercapture', event => { if (drag?.capture === options.end && drag.pointerId === event.pointerId) finishResize(false); });
  options.end.addEventListener('keydown', event => {
    if (options.phrase.autoRollLength || !['ArrowUp', 'ArrowDown'].includes(event.key) || !options.flush()) return;
    event.preventDefault(); event.stopPropagation();
    try { const body = options.readBody()!; options.phrase.setLastTempoRollLength(body.lengthBeats + (event.key === 'ArrowUp' ? -1 : 1) * phraseBarBeats(body)); options.changed(); }
    catch (error) { options.report(error instanceof Error ? error.message : String(error)); }
  });
  panel.addEventListener('keydown', event => {
    event.stopPropagation();
    if (event.key === 'Escape') { event.preventDefault(); rateInput.cancel(); close(); button.focus(); }
    if (options.desktopTapTempo) return;
    if (tapping && event.target !== input && (event.code === 'Space' || event.key === ' ')) {
      event.preventDefault(); if (!event.repeat) tapBeat();
    }
    if (suggestion !== undefined && event.target === tapButton && event.key === 'Enter') {
      event.preventDefault(); if (!event.repeat) applySuggestion();
    }
  });
  function tapKeys(event: KeyboardEvent): void {
    if (!options.desktopTapTempo || !opened || event.code !== 'Space' && event.key !== ' ' ||
        event.altKey || event.ctrlKey || event.metaKey || event.shiftKey ||
        event.target !== input && (event.target as HTMLElement | null)?.closest?.('input, textarea, [contenteditable="true"]')) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if (!event.repeat) {
      beginTapping();
      tapBeat();
    }
  }
  document.addEventListener('keydown', tapKeys, true);

  function paint(body = options.readBody(), geometry?: { scale: number; height: number }) {
    if (disposed || !body) return;
    const spans = phraseTempoSpans(body), view = options.readView();
    const { scale, height } = geometry ?? { scale: options.scale(), height: options.height() };
    const end = (spans.at(-1)!.endSeconds - view.leftSeconds) * scale;
    const basic = options.readMultipleTempoRolls?.() === false;
    options.root.classList.toggle('is-single-roll', basic);
    options.end.hidden = drag?.capture !== options.end && (end < 0 || end > height);
    const meterValue = `${body.beatsPerBar ?? 4}/${body.beatUnit ?? 4}`;
    if (meter.value !== meterValue) {
      importedMeter?.remove(); importedMeter = undefined;
      if (!commonMeters.includes(meterValue)) { importedMeter = element('option', '', meterValue); importedMeter.value = meterValue; meter.append(importedMeter); }
      meter.value = meterValue;
    }
    const endTop = `${Math.max(0, Math.min(end, height)) - 5}px`;
    if (options.end.style.top !== endTop) options.end.style.top = endTop;
    const visibleEnd = view.leftSeconds + height / scale;
    const chosen = selected && spans.find(span => (span.id ?? 'first') === selected);
    const dockSpan = chosen || spans.find(span => span.endSeconds >= visibleEnd - 1e-8) || spans.at(-1)!;
    if (!opened && !tap) active = dockSpan.id;
    refreshGridControls(body);
    if (gridHandle) {
      const hidden = hiddenGrids.has(active);
      if (gridPressed !== hidden) {
        gridPressed = hidden;
        gridHandle.setAttribute('aria-pressed', String(hidden));
      }
    }
    const panelSpan = spans.find(span => span.id === active) ?? dockSpan;
    const gridValue = String(phraseStepsAtBeat(body, panelSpan.startBeat));
    if (grid.value !== gridValue) grid.value = gridValue;
    const sectionId = dockSpan.id ?? 'first';
    if (options.dock.dataset.sectionId !== sectionId) options.dock.dataset.sectionId = sectionId;
    const dockBpm = String(Math.round(dockSpan.tempoBpm));
    if (button.textContent !== dockBpm) button.textContent = dockBpm;
    const panelBpm = String(Math.round(panelSpan.tempoBpm));
    if (suggestion === undefined && document.activeElement !== input && input.value !== panelBpm) input.value = panelBpm;
    const seen = new Set<string>();
    for (const [index, span] of basic ? [] : spans.entries()) {
      const top = (span.startSeconds - view.leftSeconds) * scale, bottom = (span.endSeconds - view.leftSeconds) * scale;
      const dragging = drag !== undefined && drag.id === span.id;
      if ((bottom < 0 || top > height) && !dragging) continue;
      const id = span.id ?? 'first'; seen.add(id);
      let item = markers.get(id);
      if (!item) {
        const band = element('div', 'melody-bpm-roll'), marker = element('button', 'melody-tempo-marker'); marker.type = 'button';
        marker.addEventListener('pointerdown', event => beginResize(event, span.id, marker));
        marker.addEventListener('lostpointercapture', event => { if (drag?.pointerId === event.pointerId) finishResize(false); });
        marker.addEventListener('click', () => {
          if (performance.now() < suppressClickUntil) return;
          open(span.id, marker);
        });
        marker.addEventListener('keydown', event => {
          if (!span.id || !['ArrowUp', 'ArrowDown'].includes(event.key)) return;
          event.preventDefault(); event.stopPropagation(); if (!options.flush()) return;
          try {
            const body = options.readBody()!;
            const { upper, lower, minimum, maximum } = phraseTempoBoundary(body, span.id);
            const origin = upper.startBeat - (upper.gridOffsetBeats ?? 0);
            const beatSize = phraseMeterBeatLength(body), beat = (lower.startBeat - origin) / beatSize;
            const target = origin + beatSize * (event.key === 'ArrowUp' ? Math.ceil(beat - 1e-10) - 1 : Math.floor(beat + 1e-10) + 1);
            if (target < minimum - 1e-10 || target > maximum + 1e-10) return;
            options.phrase.setTempoSectionStart(span.id, target);
            options.changed();
            options.onLearningAction?.('resize-roll');
          } catch (error) { options.report(error instanceof Error ? error.message : String(error)); }
        });
        const block = element('div', 'melody-tempo-block');
        block.dataset.sectionId = id;
        block.addEventListener('contextmenu', event => openMenu(event, span.id, marker));
        if (span.id === undefined) marker.classList.add('is-fixed');
        block.append(marker);
        options.bands.append(band); options.ruler.append(block); item = { band, block, button: marker }; markers.set(id, item);
      }
      item.band.dataset.sectionId = id; item.band.dataset.tempoBpm = String(span.tempoBpm); item.band.dataset.index = String(index);
      item.band.style.top = `${Math.max(0, top)}px`; item.band.style.height = `${Math.max(0, Math.min(height, bottom) - Math.max(0, top))}px`;
      item.band.classList.toggle('is-continuation', top < 0);
      item.block.hidden = top < 0 && !dragging; item.button.hidden = item.block.hidden;
      item.block.style.top = `${top}px`;
      item.block.style.translate = `0 ${Math.max(0, Math.min(top - 9, height - 20)) - top}px`;
      const bpm = String(Math.round(span.tempoBpm));
      if (item.button.textContent !== bpm) item.button.textContent = bpm;
      item.button.setAttribute('aria-label', `画布 ${index + 1} BPM`);
    }
    for (const [id, item] of markers) if (!seen.has(id)) { item.band.remove(); item.block.remove(); markers.delete(id); }
    options.extend.hidden = basic;
  }
  return { paint, addRoll, selectAt, gridHidden, readGridVisibility: () => gridVisibilityVersion, cancelInteraction,
    setOpen(visible: boolean) { if (visible) open(active, button); else close(); },
    closeControls() { finishGridShift(false); close(); },
    flush() { rateInput.flush(); finishResize(true); finishGridShift(true); }, isDragging: () => !!drag || !!gridShift,
    dispose() { finishGridShift(false, false); finishResize(false, false); disposed = true; window.clearTimeout(tapTimeout); rateInput.cancel(); tap?.dispose(); panel.remove(); menu.remove(); hint.remove();
      document.removeEventListener('pointerdown', outside); document.removeEventListener('pointermove', move); document.removeEventListener('pointerup', up);
      document.removeEventListener('pointercancel', cancel); document.removeEventListener('keydown', escape); document.removeEventListener('keydown', tapKeys, true); } };
}
