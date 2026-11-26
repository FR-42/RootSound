import type { CardDwellTiming } from './pointer-gestures.ts';

export const ROUND_POINTER_DIAMETER = 25;

export function mountRoundPointer(root: HTMLElement): () => void {
  const pointer = document.createElement('div');
  pointer.className = 'round-pointer';
  pointer.style.setProperty('--round-pointer-size', `${ROUND_POINTER_DIAMETER}px`);
  pointer.hidden = true;
  pointer.setAttribute('aria-hidden', 'true');
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  const progress = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  for (const [name, value] of Object.entries({ cx: '12', cy: '12', r: '10', pathLength: '1' })) progress.setAttribute(name, value);
  svg.append(progress);
  pointer.append(svg);
  document.body.append(pointer);
  root.classList.add('has-round-pointer');

  let timing: CardDwellTiming | null = null;
  let frame = 0;
  function move(event: PointerEvent) {
    if (event.pointerType !== 'mouse') { hide(); return; }
    pointer.hidden = false;
    pointer.style.translate = `${event.clientX}px ${event.clientY}px`;
  }
  function hide() {
    pointer.hidden = true;
    dwellReset();
  }
  function dwellReset() {
    cancelAnimationFrame(frame);
    frame = 0;
    timing = null;
    progress.style.strokeDashoffset = '1';
    pointer.classList.remove('is-counting');
  }
  function tick() {
    if (!timing) return;
    const remaining = Math.max(0, timing.endsAt - Date.now());
    progress.style.strokeDashoffset = String(Math.min(1, remaining / (timing.endsAt - timing.startedAt)));
    if (remaining) frame = requestAnimationFrame(tick);
  }
  function dwell(event: Event) {
    dwellReset();
    timing = (event as CustomEvent<CardDwellTiming | null>).detail;
    if (timing) { pointer.classList.add('is-counting'); tick(); }
  }
  function moveToLayer(event: Event) {
    const layer = (event as CustomEvent<HTMLDialogElement | null>).detail;
    (layer ?? document.body).append(pointer);
  }
  document.addEventListener('rootsound-round-pointer-layer', moveToLayer);
  document.addEventListener('pointermove', move, true);
  document.addEventListener('pointerleave', hide);
  document.addEventListener('rootsound-dwell', dwell);
  window.addEventListener('blur', hide);
  return () => {
    dwellReset();
    document.removeEventListener('pointermove', move, true);
    document.removeEventListener('pointerleave', hide);
    document.removeEventListener('rootsound-dwell', dwell);
    document.removeEventListener('rootsound-round-pointer-layer', moveToLayer);
    window.removeEventListener('blur', hide);
    root.classList.remove('has-round-pointer');
    pointer.remove();
  };
}
