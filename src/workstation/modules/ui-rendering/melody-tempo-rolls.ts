import type { PhraseBody, PhraseEditorPort } from '../../contracts/phrase.ts';
import { phraseTempoSpans, phraseStepsAtBeat } from '../../contracts/phrase-time.ts';
import type { MelodyView } from './melody-geometry.ts';
import { showTapTempo } from './tap-tempo.ts';
import { MAX_PHRASE_BEATS } from '../../contracts/phrase-limits.ts';

function element<K extends keyof HTMLElementTagNameMap>(tag: K, className: string, text = '') {
  const node = document.createElement(tag); node.className = className; node.textContent = text; return node;
}
export function mountMelodyTempoRolls(options: {
  root: HTMLElement; dock: HTMLElement; ruler: HTMLElement; bands: HTMLElement; extend: HTMLButtonElement; end: HTMLButtonElement;
  phrase: PhraseEditorPort; readBody(): PhraseBody | undefined; readView(): MelodyView; scale(): number; height(): number;
  flush(): boolean; changed(committed?: boolean): void; preview(body?: PhraseBody): void; navigate(seconds: number): void; report(message: string): void;
}) {
  let active: string | undefined, opened = false, disposed = false;
  let tap: ReturnType<typeof showTapTempo> | undefined;
  let drag: { id: string | undefined; pointerId: number; capture: HTMLElement; fromY: number; scale: number; bpm: number;
    start: number; previousStart: number; bar: number; length: number; raw: number; snapped: number; moved: boolean } | undefined;
  let frame = 0, suppressClickUntil = 0;
  const markers = new Map<string, { band: HTMLElement; block: HTMLElement; button: HTMLButtonElement; grid: HTMLSelectElement }>();
  const button = element('button', 'melody-tempo-button', '120'); button.type = 'button'; button.title = 'BPM';
  button.setAttribute('aria-label', '速度 BPM'); button.setAttribute('aria-expanded', 'false');
  const panel = element('div', 'melody-tempo-panel'); panel.hidden = true;
  const field = element('label', 'melody-tempo-field', 'BPM'), input = element('input', 'melody-tempo-input');
  input.type = 'number'; input.min = '40'; input.max = '240'; input.step = '1'; input.setAttribute('aria-label', '当前卷帘 BPM'); field.append(input);
  function makeGrid(readId: () => string | undefined, className: string) {
    const grid = element('select', className); grid.setAttribute('aria-label', '每拍格数'); grid.title = '每拍格数';
    for (let count = 2; count <= 9; count++) { const choice = element('option', '', `${count}格`); choice.value = String(count); grid.append(choice); }
    grid.addEventListener('pointerdown', event => event.stopPropagation());
    grid.addEventListener('keydown', event => event.stopPropagation());
    grid.addEventListener('change', () => {
      const id = readId(); if (!options.flush()) return;
      try { options.phrase.setTempoSectionSteps(id, Number(grid.value)); options.changed(); }
      catch (error) { options.report(error instanceof Error ? error.message : String(error)); paint(); }
    });
    return grid;
  }
  function makeTap(readId: () => string | undefined) {
    const trigger = element('button', 'melody-tap-tempo song-tap-tempo', '敲'); trigger.type = 'button';
    trigger.title = '敲击定速'; trigger.setAttribute('aria-label', '敲击定速');
    trigger.addEventListener('pointerdown', event => event.stopPropagation());
    trigger.addEventListener('click', () => {
      if (tap) return; const id = readId(); close();
      tap = showTapTempo(options.root, { onApply(value) { active = id; apply(value); }, onClose() { tap = undefined; } });
    });
    return trigger;
  }
  const grid = makeGrid(() => active, 'melody-grid-select');
  panel.append(field, makeTap(() => active)); options.dock.append(button, grid); options.root.append(panel);
  const hint = element('div', 'melody-tempo-resize-hint'); hint.hidden = true; options.root.append(hint);
  function close() { opened = false; panel.hidden = true; button.setAttribute('aria-expanded', 'false'); }
  function open(id: string | undefined, anchor: HTMLElement) {
    active = id; opened = true; paint(); panel.hidden = false; button.setAttribute('aria-expanded', 'true');
    const rect = anchor.getBoundingClientRect(); panel.style.left = `${rect.left}px`; panel.style.top = `${rect.bottom + 4}px`;
  }
  button.addEventListener('click', () => { if (opened) close(); else open(active, button); });
  function apply(value: number) {
    if (disposed || !options.flush()) return;
    if (active) options.phrase.setTempoSection(active, value); else options.phrase.setTempo(value, { preserveNoteDurations: false });
    options.changed(); paint();
  }
  input.addEventListener('change', () => { try { apply(Number(input.value)); } catch (error) { options.report(String(error instanceof Error ? error.message : error)); paint(); } });
  function addRoll() {
    if (!options.flush()) return;
    try {
      const id = options.phrase.addTempoSection(); close(); options.changed(); active = id;
      const span = phraseTempoSpans(options.readBody()!).find(value => value.id === id)!;
      options.navigate(span.startSeconds); paint();
    } catch (error) { options.report(error instanceof Error ? error.message : String(error)); }
  }
  const outside = (event: PointerEvent) => { if (opened && !options.dock.contains(event.target as Node) && !panel.contains(event.target as Node)
    && !(event.target as HTMLElement).closest?.('.melody-tempo-marker')) close(); };
  document.addEventListener('pointerdown', outside);
  function beginResize(event: PointerEvent, id: string | undefined, marker: HTMLElement) {
    event.stopPropagation();
    if ((!id && marker !== options.end) || event.button !== 0 || !options.flush()) return;
    event.preventDefault(); close();
    const body = options.readBody()!, spans = phraseTempoSpans(body), index = id ? spans.findIndex(span => span.id === id) : spans.length;
    const previous = spans[index - 1]!, start = id ? spans[index]!.startBeat : body.lengthBeats;
    drag = { id, pointerId: event.pointerId, capture: marker, fromY: event.clientY, scale: options.scale(), bpm: previous.tempoBpm,
      start, previousStart: previous.startBeat, bar: body.beatsPerBar ?? 4, length: body.lengthBeats,
      raw: start, snapped: start, moved: false };
    marker.classList.add('is-dragging'); marker.setPointerCapture?.(event.pointerId);
  }
  function paintResize() {
    frame = 0; if (!drag || !drag.moved) return;
    try { options.preview(drag.id ? options.phrase.previewTempoSectionStart(drag.id, drag.raw) : options.phrase.previewLastTempoRollLength(drag.raw)); }
    catch (error) { options.report(error instanceof Error ? error.message : String(error)); }
  }
  const move = (event: PointerEvent) => {
    const d = drag; if (!d || d.pointerId !== event.pointerId) return;
    event.preventDefault(); const pixels = event.clientY - d.fromY;
    if (Math.abs(pixels) > 3) d.moved = true; if (!d.moved) return;
    const clamp = (beat: number) => Math.max(d.previousStart + d.bar, Math.min(d.start + MAX_PHRASE_BEATS - d.length, beat));
    d.raw = clamp(d.start + pixels / d.scale * d.bpm / 60);
    d.snapped = clamp(d.start + Math.round((d.raw - d.start) / d.bar) * d.bar);
    hint.hidden = false; hint.textContent = `${Number(((d.snapped - d.previousStart) / d.bar).toFixed(2))} 小节`;
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
    if (render) options.changed(changed);
  }
  const up = (event: PointerEvent) => { if (drag?.pointerId === event.pointerId) finishResize(true); };
  const cancel = (event: PointerEvent) => { if (drag?.pointerId === event.pointerId) finishResize(false); };
  const escape = (event: KeyboardEvent) => { if (drag && event.key === 'Escape') { event.preventDefault(); finishResize(false); } };
  document.addEventListener('pointermove', move); document.addEventListener('pointerup', up); document.addEventListener('pointercancel', cancel); document.addEventListener('keydown', escape);
  options.end.addEventListener('pointerdown', event => beginResize(event, undefined, options.end));
  options.end.addEventListener('lostpointercapture', event => { if (drag?.capture === options.end && drag.pointerId === event.pointerId) finishResize(false); });
  options.end.addEventListener('keydown', event => {
    if (!['ArrowUp', 'ArrowDown'].includes(event.key) || !options.flush()) return;
    event.preventDefault(); event.stopPropagation();
    try { const body = options.readBody()!; options.phrase.setLastTempoRollLength(body.lengthBeats + (event.key === 'ArrowUp' ? -1 : 1) * (body.beatsPerBar ?? 4)); options.changed(); }
    catch (error) { options.report(error instanceof Error ? error.message : String(error)); }
  });
  panel.addEventListener('keydown', event => { event.stopPropagation(); if (event.key === 'Escape') { event.preventDefault(); close(); button.focus(); } });
  function paint() {
    const body = options.readBody(); if (disposed || !body) return;
    const spans = phraseTempoSpans(body), view = options.readView(), scale = options.scale(), height = options.height();
    const end = (spans.at(-1)!.endSeconds - view.leftSeconds) * scale;
    options.end.hidden = end < 0 || end > height;
    options.end.style.top = `${end - 5}px`;
    if (!opened && !tap) active = spans.find(span => view.leftSeconds >= span.startSeconds && view.leftSeconds < span.endSeconds)?.id;
    const selected = spans.find(span => span.id === active) ?? spans[0]!;
    grid.value = String(phraseStepsAtBeat(body, selected.startBeat));
    options.dock.dataset.sectionId = selected.id ?? 'first';
    button.textContent = String(Number(selected.tempoBpm.toFixed(1))); button.title = `BPM ${selected.tempoBpm}`;
    if (document.activeElement !== input) input.value = String(selected.tempoBpm);
    const seen = new Set<string>();
    for (const [index, span] of spans.entries()) {
      const top = (span.startSeconds - view.leftSeconds) * scale, bottom = (span.endSeconds - view.leftSeconds) * scale;
      if ((bottom < 0 || top > height) && drag?.id !== span.id) continue;
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
            const body = options.readBody()!, current = body.tempoSections!.find(section => section.id === span.id)!;
            options.phrase.setTempoSectionStart(span.id, current.startBeat + (event.key === 'ArrowUp' ? -1 : 1) * (body.beatsPerBar ?? 4)); options.changed();
          } catch (error) { options.report(error instanceof Error ? error.message : String(error)); }
        });
        const block = element('div', 'melody-tempo-block'), sectionGrid = makeGrid(() => span.id, 'melody-tempo-grid');
        block.dataset.sectionId = id;
        block.append(marker, sectionGrid);
        options.bands.append(band); options.ruler.append(block); item = { band, block, button: marker, grid: sectionGrid }; markers.set(id, item);
      }
      item.band.dataset.sectionId = id; item.band.dataset.tempoBpm = String(span.tempoBpm); item.band.dataset.index = String(index);
      item.band.style.top = `${Math.max(0, top)}px`; item.band.style.height = `${Math.max(0, Math.min(height, bottom) - Math.max(0, top))}px`;
      item.band.classList.toggle('is-continuation', top < 0); item.band.classList.toggle('is-alternate', index % 2 === 1);
      item.block.hidden = index === 0 || top < 0 && drag?.id !== span.id; item.button.hidden = item.block.hidden; item.block.style.top = `${top}px`;
      item.grid.value = String(phraseStepsAtBeat(body, span.startBeat));
      item.button.textContent = String(Number(span.tempoBpm.toFixed(1))); item.button.title = `卷帘 ${index + 1} · ${span.tempoBpm} BPM`;
      item.button.setAttribute('aria-label', `卷帘 ${index + 1} BPM`);
    }
    for (const [id, item] of markers) if (!seen.has(id)) { item.band.remove(); item.block.remove(); markers.delete(id); }
    options.extend.hidden = false;
  }
  return { paint, addRoll, flush() { finishResize(true); }, isDragging: () => !!drag,
    dispose() { finishResize(false, false); disposed = true; tap?.dispose(); panel.remove(); hint.remove();
      document.removeEventListener('pointerdown', outside); document.removeEventListener('pointermove', move); document.removeEventListener('pointerup', up);
      document.removeEventListener('pointercancel', cancel); document.removeEventListener('keydown', escape); } };
}
