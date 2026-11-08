import { MAX_TEMPO_BPM, MIN_TEMPO_BPM } from '../../contracts/music-limits.ts';

export function attachMelodyTempoInput(input: HTMLInputElement, control: HTMLElement, options: {
  read(): number;
  preview(value?: number): void;
  commit(value: number): void;
}) {
  let pending: number | undefined;
  let frame = 0, commitTimer = 0;
  let drag: { pointerId: number; startY: number; bpm: number; capture: HTMLElement; moved: boolean } | undefined;

  function inputValue() {
    const value = Number(input.value);
    return value >= MIN_TEMPO_BPM && value <= MAX_TEMPO_BPM ? value : options.read();
  }
  function update(value: number) {
    const bounded = Math.max(MIN_TEMPO_BPM, Math.min(MAX_TEMPO_BPM, Math.round(value)));
    if (pending === bounded) return;
    pending = bounded;
    if (!frame) frame = requestAnimationFrame(() => {
      frame = 0;
      if (pending === undefined) return;
      options.preview(pending);
      input.value = String(pending);
    });
  }
  function finish(commit: boolean) {
    const value = pending, active = drag;
    pending = undefined; drag = undefined;
    window.clearTimeout(commitTimer); commitTimer = 0;
    cancelAnimationFrame(frame); frame = 0;
    control.classList.remove('is-scrubbing');
    if (active?.capture.hasPointerCapture?.(active.pointerId)) active.capture.releasePointerCapture(active.pointerId);
    if (value === undefined) return;
    options.preview();
    if (commit) options.commit(value);
    input.value = String(Math.round(options.read()));
  }
  function nudge(steps: number) {
    if (drag) return;
    update((pending ?? inputValue()) + steps);
    window.clearTimeout(commitTimer);
    commitTimer = window.setTimeout(() => finish(true), 170);
  }
  function move(event: PointerEvent) {
    if (!drag || event.pointerId !== drag.pointerId) return;
    const distance = drag.startY - event.clientY;
    if (!drag.moved && Math.abs(distance) < 3) return;
    drag.moved = true;
    event.preventDefault();
    control.classList.add('is-scrubbing');
    update(drag.bpm + Math.round(distance));
  }

  control.addEventListener('pointerdown', event => {
    if (event.button !== 0 || drag) return;
    window.clearTimeout(commitTimer); commitTimer = 0;
    const capture = event.target === input ? input : control;
    if (capture !== input) { event.preventDefault(); input.focus(); }
    drag = { pointerId: event.pointerId, startY: event.clientY, bpm: pending ?? inputValue(), capture, moved: false };
    capture.setPointerCapture?.(event.pointerId);
  });
  control.addEventListener('pointermove', move);
  control.addEventListener('pointerup', event => {
    if (drag?.pointerId === event.pointerId) { move(event); finish(true); }
  });
  for (const type of ['pointercancel', 'lostpointercapture'] as const) {
    control.addEventListener(type, event => { if (drag?.pointerId === event.pointerId) finish(false); });
  }
  control.addEventListener('wheel', event => {
    if (event.ctrlKey || event.metaKey || !Number.isFinite(event.deltaY) || !event.deltaY) return;
    event.preventDefault(); event.stopPropagation();
    nudge(event.deltaY < 0 ? 1 : -1);
  }, { passive: false });
  input.addEventListener('keydown', event => {
    if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;
    event.preventDefault(); event.stopPropagation();
    nudge(event.key === 'ArrowUp' ? 1 : -1);
  });
  input.addEventListener('input', () => {
    if (pending === undefined) return;
    const typed = input.value;
    finish(false);
    input.value = typed;
  });
  input.addEventListener('change', () => {
    const value = Number(input.value);
    finish(false);
    options.commit(Math.round(value));
    input.value = String(Math.round(options.read()));
  });

  return { flush() { finish(true); }, cancel() { finish(false); } };
}
