import type { SoundRuntimePort } from '../../contracts/sound.ts';
import { paintRangeProgress } from './range-progress.ts';
import './output-volume.css';

export function mountTransportPopover(parent: HTMLElement, label: string, className: string) {
  const control = document.createElement('div');
  control.className = `song-transport-control ${className}`;
  const button = document.createElement('button');
  button.type = 'button'; button.className = 'song-transport-toggle';
  button.setAttribute('aria-label', label); button.setAttribute('aria-expanded', 'false');
  const panel = document.createElement('div');
  panel.className = 'song-transport-panel'; panel.hidden = true;
  panel.setAttribute('role', 'group'); panel.setAttribute('aria-label', label);
  control.append(button, panel); parent.append(control);

  function close(restoreFocus = false) {
    if (panel.hidden) return;
    panel.hidden = true; button.setAttribute('aria-expanded', 'false');
    document.removeEventListener('pointerdown', outside, true);
    document.removeEventListener('focusin', outside, true);
    if (restoreFocus) button.focus({ preventScroll: true });
  }
  function outside(event: Event) {
    if (!control.contains(event.target as Node)) close();
  }
  button.addEventListener('click', () => {
    if (!panel.hidden) { close(); return; }
    panel.hidden = false; button.setAttribute('aria-expanded', 'true');
    document.addEventListener('pointerdown', outside, true);
    document.addEventListener('focusin', outside, true);
    (panel.querySelector<HTMLElement>('[aria-pressed="true"]') ?? panel.querySelector<HTMLElement>('input, button'))?.focus({ preventScroll: true });
  });
  control.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !panel.hidden) { event.preventDefault(); close(true); }
    else if (![' ', 'Enter', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.stopPropagation();
  });
  return { button, panel, close, dispose: () => close() };
}

export function mountOutputVolume(parent: HTMLElement, readSound: () => SoundRuntimePort, inline = false) {
  const popover = inline ? undefined : mountTransportPopover(parent, '试听音量', 'output-volume');
  const panel: HTMLElement = popover?.panel ?? document.createElement('label');
  const icon = popover?.button ?? document.createElement('span');
  if (inline) { panel.className = 'output-volume output-volume-inline'; panel.append(icon); parent.append(panel); }
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24'); svg.setAttribute('aria-hidden', 'true');
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  svg.append(path); icon.append(svg);
  const input = document.createElement('input'); input.type = 'range'; input.min = '0'; input.max = '400'; input.step = '1';
  input.setAttribute('aria-label', '试听音量'); input.setAttribute('aria-orientation', inline ? 'horizontal' : 'vertical');
  const value = document.createElement('output');
  value.setAttribute('aria-hidden', 'true');
  if (inline) panel.append(input, value); else panel.append(value, input);
  function refresh() {
    const percent = Math.round((readSound().readOutputLevel?.() ?? 1) * 100);
    input.value = String(percent); value.textContent = `${percent}%`;
    if (inline) paintRangeProgress(input);
    input.setAttribute('aria-valuetext', value.textContent);
    path.setAttribute('d', percent ? 'M3 9v6h4l5 4V5L7 9H3Zm13-1a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14' : 'M3 9v6h4l5 4V5L7 9H3Zm13 0 5 6m0-6-5 6');
  }
  function setVolume(percent: number) {
    readSound().setOutputLevel?.(Math.max(0, Math.min(400, percent)) / 100);
    refresh();
  }
  popover?.button.addEventListener('click', refresh);
  input.addEventListener('input', () => setVolume(Number(input.value)));
  panel.addEventListener('wheel', event => {
    if (event.ctrlKey || event.metaKey || !event.deltaY || inline && event.target !== input) return;
    event.preventDefault(); event.stopPropagation();
    setVolume(Number(input.value) - Math.sign(event.deltaY) * 5);
  }, { passive: false });
  let stopChordDrag: (() => void) | undefined;
  if (inline) input.addEventListener('mousedown', event => {
    if (event.button !== 0 || !(event.buttons & 2)) return;
    event.preventDefault();
    input.focus({ preventScroll: true });
    stopChordDrag?.();
    const adjust = (sample: MouseEvent) => {
      const { left, width } = input.getBoundingClientRect();
      setVolume(Math.round((sample.clientX - left) / Math.max(1, width) * 400));
    };
    const move = (sample: MouseEvent) => { if (sample.buttons & 1) adjust(sample); else finish(); };
    const up = (sample: MouseEvent) => { if (sample.button === 0) { adjust(sample); finish(); } };
    const finish = () => { events.abort(); stopChordDrag = undefined; };
    const events = new AbortController();
    const listen = { capture: true, signal: events.signal };
    stopChordDrag = finish;
    document.addEventListener('mousemove', move, listen);
    document.addEventListener('mouseup', up, listen);
    window.addEventListener('blur', finish, listen);
    adjust(event);
  });
  refresh();
  return { cancelDrag: () => stopChordDrag?.(), dispose() { stopChordDrag?.(); popover?.dispose(); } };
}
