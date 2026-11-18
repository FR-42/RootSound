import type { CardDwellTiming, PointerPanMode } from './pointer-gestures.ts';

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

  let followingPanOutside = false;
  let timing: CardDwellTiming | null = null;
  let frame = 0;
  function move(event: PointerEvent) {
    if (event.pointerType !== 'mouse') { hide(); return; }
    followingPanOutside = false;
    pointer.hidden = false;
    pointer.style.translate = `${event.clientX}px ${event.clientY}px`;
  }
  function hide() {
    pointer.hidden = true;
    dwellReset();
    pointer.style.setProperty('--pan-dot-x', '0px');
    pointer.style.setProperty('--pan-dot-y', '0px');
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
  function pan(event: Event) {
    const { x, y, clientX, clientY } = (event as CustomEvent<{ x: number; y: number; clientX: number; clientY: number }>).detail;
    const magnitude = Math.hypot(x, y);
    const offset = magnitude ? 3 + 5.5 * Math.sqrt(Math.min(1, magnitude)) : 0;
    const scale = magnitude ? offset / magnitude : 0;
    pointer.style.setProperty('--pan-dot-x', `${x * scale}px`);
    pointer.style.setProperty('--pan-dot-y', `${y * scale}px`);
    if (!magnitude) { if (followingPanOutside) hide(); followingPanOutside = false; return; }
    if (pointer.hidden || followingPanOutside) {
      const bound = (value: number, limit: number) => Math.max(11, Math.min(limit - 11, value));
      followingPanOutside = true;
      pointer.hidden = false;
      pointer.style.translate = `${bound(clientX, window.innerWidth)}px ${bound(clientY, window.innerHeight)}px`;
    }
  }
  const panMode = (event: Event) => {
    const mode = (event as CustomEvent<PointerPanMode>).detail;
    pointer.classList.toggle('has-pan-dot', mode !== 'off');
    pointer.classList.toggle('is-pan-waiting', mode === 'waiting');
  };
  document.addEventListener('rootsound-pan', pan);
  document.addEventListener('rootsound-pan-mode', panMode);
  root.addEventListener('pointermove', move, true);
  root.addEventListener('pointerleave', hide);
  document.addEventListener('rootsound-dwell', dwell);
  window.addEventListener('blur', hide);
  return () => {
    document.removeEventListener('rootsound-pan', pan);
    document.removeEventListener('rootsound-pan-mode', panMode);
    dwellReset();
    root.removeEventListener('pointermove', move, true);
    root.removeEventListener('pointerleave', hide);
    document.removeEventListener('rootsound-dwell', dwell);
    window.removeEventListener('blur', hide);
    root.classList.remove('has-round-pointer');
    pointer.remove();
  };
}
