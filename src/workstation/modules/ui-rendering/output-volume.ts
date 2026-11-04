import type { SoundRuntimePort } from '../../contracts/sound.ts';
import './output-volume.css';

/** One listening control for the transport, keys and note auditions. */
export function mountOutputVolume(parent: HTMLElement, readSound: () => SoundRuntimePort) {
  const label = document.createElement('label'); label.className = 'output-volume';
  label.title = '试听音量，不影响导出音频';
  label.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9v6h4l5 4V5L7 9H3Zm13-1a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/></svg>';
  const input = document.createElement('input'); input.type = 'range'; input.min = '0'; input.max = '400'; input.step = '1';
  input.setAttribute('aria-label', '试听音量');
  const value = document.createElement('output'); label.append(input, value); parent.append(label);
  function refresh() { const level = readSound().readOutputLevel?.() ?? 1; input.value = String(Math.round(level * 100)); value.textContent = `${Math.round(level * 100)}%`; input.setAttribute('aria-valuetext', value.textContent); }
  input.addEventListener('input', () => { readSound().setOutputLevel?.(Number(input.value) / 100); refresh(); });
  input.addEventListener('keydown', event => event.stopPropagation());
  input.addEventListener('wheel', event => { event.preventDefault(); input.value = String(Math.max(0, Math.min(400, Number(input.value) - Math.sign(event.deltaY) * 5))); input.dispatchEvent(new Event('input')); }, { passive: false });
  refresh(); return { refresh };
}
