import type { PhraseBody, PhraseEditorPort } from '../../contracts/phrase.ts';
import { phraseBarBeats, phraseMeterBeatLength, phraseTempoBoundary, phraseTempoSpans, phraseStepsAtBeat } from '../../contracts/phrase-time.ts';
import type { MelodyView } from './melody-geometry.ts';
import { showTapTempo } from './tap-tempo.ts';
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
  gridChanged?(steps: number, bpm: number): void;
  readMultipleTempoRolls?(): boolean; previewRate(value?: number, sectionId?: string): void; inGuide?: boolean; onLearningAction?(action: LearningAction): void;
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
  const button = element('button', 'melody-tempo-button', '120'); button.type = 'button'; button.title = 'BPM';
  button.setAttribute('aria-label', 'BPM'); button.setAttribute('aria-expanded', 'false');
  const panel = element('div', 'melody-tempo-panel'); panel.hidden = true;
  const field = element('label', 'melody-tempo-field', 'BPM'), input = element('input', 'melody-tempo-input melody-tempo-rate-input');
  input.type = 'number'; input.min = String(MIN_TEMPO_BPM); input.max = String(MAX_TEMPO_BPM); input.step = 'any'; input.setAttribute('aria-label', '当前卷帘 BPM');
  const rateControl = element('span', 'melody-tempo-rate');
  const scrubIcon = element('span', 'melody-tempo-scrub-mark'); scrubIcon.setAttribute('aria-hidden', 'true');
  rateControl.append(input, scrubIcon); field.append(rateControl);
  const rateInput = attachMelodyTempoInput(input, rateControl, {
    read: readTempo,
    preview(value) { options.previewRate(value, active); },
    commit(value) {
      try { apply(value); }
      catch (error) { options.report(error instanceof Error ? error.message : String(error)); paint(); }
    },
  });
  function makeGrid(readId: () => string | undefined, className: string) {
    const grid = element('select', className); grid.setAttribute('aria-label', '每拍细分'); grid.title = '每拍细分';
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
    trigger.title = '敲击节奏设置 BPM'; trigger.setAttribute('aria-label', '敲击定速');
    trigger.addEventListener('pointerdown', event => event.stopPropagation());
    trigger.addEventListener('click', () => {
      if (tap) return; const id = readId(); close();
      tap = showTapTempo(options.root, {
        inGuide: options.inGuide,
        onApply(value) { active = id; return apply(value); },
        onClose() { tap = undefined; },
      });
    });
    return trigger;
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
  panel.append(field, makeTap(() => active), gridField, meterField); options.dock.append(button); options.root.append(panel);
  const menu = element('div', 'melody-tempo-menu'); menu.hidden = true; menu.setAttribute('role', 'menu');
  const remove = element('button', '', '删除'); remove.type = 'button'; remove.setAttribute('role', 'menuitem');
  menu.append(remove); options.root.append(menu);
  const hint = element('div', 'melody-tempo-resize-hint'); hint.hidden = true; options.root.append(hint);
  function close() { rateInput.flush(); opened = false; panel.hidden = true; button.setAttribute('aria-expanded', 'false'); }
  function closeMenu(focus = false) {
    menu.hidden = true; menuSection = undefined;
    if (focus) menuAnchor?.focus();
    menuAnchor = undefined;
  }
  function open(id: string | undefined, anchor: HTMLElement) {
    closeMenu(); rateInput.flush(); selected = id ?? 'first'; active = id; opened = true; paint(); panel.hidden = false; button.setAttribute('aria-expanded', 'true');
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
    if (active) options.phrase.setTempoSection(active, value); else options.phrase.setTempo(value, { preserveNoteDurations: false });
    options.changed(); paint(); if (previous !== value) options.onLearningAction?.('change-tempo');
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
    const d = drag; if (!d || d.pointerId !== event.pointerId) return;
    event.preventDefault(); const pixels = event.clientY - d.fromY;
    if (Math.abs(pixels) > 3) d.moved = true; if (!d.moved) return;
    const clamp = (beat: number) => Math.max(d.minimum, Math.min(d.maximum, beat));
    d.raw = clamp(d.start + pixels / d.scale * d.bpm / 60);
    if (d.id) {
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
  const up = (event: PointerEvent) => { if (drag?.pointerId === event.pointerId) finishResize(true); };
  const cancel = (event: PointerEvent) => { if (drag?.pointerId === event.pointerId) finishResize(false); };
  const escape = (event: KeyboardEvent) => {
    if (event.key !== 'Escape') return;
    if (!menu.hidden) { event.preventDefault(); closeMenu(true); }
    else if (drag) { event.preventDefault(); finishResize(false); }
  };
  document.addEventListener('pointermove', move); document.addEventListener('pointerup', up); document.addEventListener('pointercancel', cancel); document.addEventListener('keydown', escape);
  options.end.addEventListener('pointerdown', event => beginResize(event, undefined, options.end));
  options.end.addEventListener('lostpointercapture', event => { if (drag?.capture === options.end && drag.pointerId === event.pointerId) finishResize(false); });
  options.end.addEventListener('keydown', event => {
    if (!['ArrowUp', 'ArrowDown'].includes(event.key) || !options.flush()) return;
    event.preventDefault(); event.stopPropagation();
    try { const body = options.readBody()!; options.phrase.setLastTempoRollLength(body.lengthBeats + (event.key === 'ArrowUp' ? -1 : 1) * phraseBarBeats(body)); options.changed(); }
    catch (error) { options.report(error instanceof Error ? error.message : String(error)); }
  });
  panel.addEventListener('keydown', event => { event.stopPropagation(); if (event.key === 'Escape') { event.preventDefault(); rateInput.cancel(); close(); button.focus(); } });
  function paint(body = options.readBody()) {
    if (disposed || !body) return;
    const spans = phraseTempoSpans(body), view = options.readView(), scale = options.scale(), height = options.height();
    const end = (spans.at(-1)!.endSeconds - view.leftSeconds) * scale;
    const basic = options.readMultipleTempoRolls?.() === false;
    options.root.classList.toggle('is-single-roll', basic);
    options.end.hidden = drag?.capture !== options.end && (end < 0 || end > height);
    const meterValue = `${body.beatsPerBar ?? 4}/${body.beatUnit ?? 4}`;
    if (importedMeter?.value !== meterValue) {
      importedMeter?.remove(); importedMeter = undefined;
      if (!commonMeters.includes(meterValue)) { importedMeter = element('option', '', meterValue); importedMeter.value = meterValue; meter.append(importedMeter); }
    }
    meter.value = meterValue;
    options.end.style.top = `${Math.max(0, Math.min(end, height)) - 5}px`;
    const visibleEnd = view.leftSeconds + height / scale;
    const chosen = selected && spans.find(span => (span.id ?? 'first') === selected);
    const dockSpan = chosen || spans.find(span => span.endSeconds >= visibleEnd - 1e-8) || spans.at(-1)!;
    if (!opened && !tap) active = dockSpan.id;
    const panelSpan = spans.find(span => span.id === active) ?? dockSpan;
    grid.value = String(phraseStepsAtBeat(body, panelSpan.startBeat));
    options.dock.dataset.sectionId = dockSpan.id ?? 'first';
    button.textContent = String(Math.round(dockSpan.tempoBpm)); button.title = `BPM ${button.textContent}`;
    if (document.activeElement !== input) input.value = String(Math.round(panelSpan.tempoBpm));
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
        marker.addEventListener('click', () => { if (performance.now() >= suppressClickUntil) open(span.id, marker); });
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
      item.button.textContent = String(Math.round(span.tempoBpm)); item.button.title = `卷帘 ${index + 1} · ${item.button.textContent} 拍/分钟`;
      item.button.setAttribute('aria-label', `卷帘 ${index + 1} BPM`);
    }
    for (const [id, item] of markers) if (!seen.has(id)) { item.band.remove(); item.block.remove(); markers.delete(id); }
    options.extend.hidden = basic;
  }
  return { paint, addRoll, selectAt, flush() { rateInput.flush(); finishResize(true); }, isDragging: () => !!drag,
    dispose() { finishResize(false, false); disposed = true; rateInput.cancel(); tap?.dispose(); panel.remove(); menu.remove(); hint.remove();
      document.removeEventListener('pointerdown', outside); document.removeEventListener('pointermove', move); document.removeEventListener('pointerup', up);
      document.removeEventListener('pointercancel', cancel); document.removeEventListener('keydown', escape); } };
}
