import { createTapTempo } from './tap-tempo-model.ts';
import { MIN_TEMPO_BPM, MAX_TEMPO_BPM } from '../../contracts/music-limits.ts';
import './tap-tempo.css';

export function showTapTempo(root: HTMLElement, options: {
  inGuide?: boolean;
  onApply(bpm: number): boolean | void;
  onClose?(): void;
  now?(): number;
}): { dispose(): void } {
  const model = createTapTempo();
  let closed = false, closing = false, timer = 0, taps = 0;
  const dialog = document.createElement('dialog');
  dialog.className = 'tap-tempo-dialog'; dialog.setAttribute('aria-label', '敲击定速');
  const title = document.createElement('h2'); title.textContent = '敲击定速';
  dialog.append(title);
  const note = options.inGuide ? document.createElement('p') : undefined;
  if (note) {
    note.className = 'tap-tempo-guide-note';
    note.textContent = '有节奏地敲击空格键吧。'; dialog.append(note);
  }
  const display = document.createElement('div'); display.className = 'tap-tempo-display';
  const value = document.createElement('strong'); value.className = 'tap-tempo-value';
  value.setAttribute('aria-live', 'polite'); display.append(value);
  const error = document.createElement('p'); error.className = 'tap-tempo-error';
  error.setAttribute('role', 'alert'); error.hidden = true;

  function button(text: string, className: string, action: () => void): HTMLButtonElement {
    const node = document.createElement('button');
    node.type = 'button'; node.className = className; node.textContent = text;
    node.addEventListener('click', action); return node;
  }
  const pad = button('', 'tap-tempo-pad', tap);
  pad.setAttribute('aria-label', '空格键');
  const actions = document.createElement('div'); actions.className = 'tap-tempo-actions';
  const reset = button('重来', 'tap-tempo-reset', () => { taps = 0; model.reset(); refresh(); pad.focus(); });
  const cancel = button('取消', 'tap-tempo-cancel', close);
  const apply = button('应用', 'tap-tempo-apply', () => {
    const bpm = model.read().bpm;
    if (closed || closing || apply.hidden || bpm === undefined) return;
    try { if (options.onApply(bpm) !== false) close(); }
    catch (cause) { error.textContent = cause instanceof Error ? cause.message : String(cause); error.hidden = false; }
  });
  function refresh(): void {
    const { bpm } = model.read();
    const valid = bpm !== undefined && bpm >= MIN_TEMPO_BPM && bpm <= MAX_TEMPO_BPM;
    note?.classList.toggle('music-guide-prompt', taps === 0);
    value.textContent = valid ? String(bpm) : '';
    reset.hidden = taps < 4;
    apply.hidden = !valid;
    error.hidden = true;
  }
  function tap(): void {
    if (closed || closing) return;
    taps++; model.tap(options.now?.() ?? performance.now()); refresh();
    pad.classList.add('is-tapped');
    window.clearTimeout(timer);
    timer = window.setTimeout(() => pad.classList.remove('is-tapped'), 100);
  }
  function keydown(event: KeyboardEvent): void {
    if (closed || closing) return;
    if (event.key === 'Escape') {
      event.preventDefault(); event.stopPropagation(); close(); return;
    }
    if (event.key === 'Enter') {
      event.preventDefault(); event.stopPropagation();
      if (!event.repeat && !apply.hidden) apply.click();
      return;
    }
    if (event.code !== 'Space' && event.key !== ' ') return;
    event.preventDefault(); event.stopPropagation();
    if (!event.repeat && !event.ctrlKey && !event.metaKey && !event.altKey) tap();
  }
  function dispose(): void {
    if (closed) return;
    closed = true; window.clearTimeout(timer);
    document.removeEventListener('keydown', keydown, true);
    dialog.remove(); options.onClose?.();
  }
  function close(): void {
    if (closed || closing) return;
    closing = true; dialog.close(); dispose();
  }
  dialog.addEventListener('cancel', event => { event.preventDefault(); close(); });
  dialog.addEventListener('close', dispose, { once: true });
  actions.append(reset, cancel, apply);
  dialog.append(display, pad, error, actions); root.append(dialog); refresh();
  document.addEventListener('keydown', keydown, true);
  dialog.showModal(); pad.focus();
  return { dispose };
}
