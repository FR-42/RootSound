type TextField = HTMLInputElement | HTMLTextAreaElement;

export function mountTextFieldSelection(root: HTMLElement) {
  const events = new AbortController();
  const forcedColors = matchMedia('(forced-colors: active)');
  const mirror = document.createElement('div');
  mirror.setAttribute('aria-hidden', 'true');
  mirror.style.cssText = 'position:fixed;left:0;top:-100000px;visibility:hidden;pointer-events:none;box-sizing:border-box;border:0;margin:0;height:auto;';
  document.body.append(mirror);
  let active: TextField | undefined;
  let composing = false;
  let frame = 0;
  const resize = new ResizeObserver(queue);

  function clearPaint() {
    active?.classList.remove('has-gradient-selection');
    for (const name of ['layers', 'sizes', 'positions']) active?.style.removeProperty(`--field-selection-${name}`);
  }

  function clear() {
    clearPaint();
    resize.disconnect();
    active = undefined;
    composing = false;
    mirror.replaceChildren();
  }

  function paint() {
    frame = 0;
    const field = active;
    if (!field) return;
    if (!field.isConnected || document.activeElement !== field || !document.hasFocus()) { clearPaint(); return; }
    const start = field.selectionStart, end = field.selectionEnd;
    const fitName = field.matches('.song-project-name-input, .project-library-tile.project-library-name');
    const hasSelection = !composing && start !== null && end !== null && start !== end;
    if (forcedColors.matches || (!fitName && !hasSelection)) { clearPaint(); return; }
    const style = getComputedStyle(field);
    mirror.style.font = style.font;
    mirror.style.fontKerning = style.fontKerning;
    mirror.style.fontFeatureSettings = style.fontFeatureSettings;
    mirror.style.fontVariationSettings = style.fontVariationSettings;
    mirror.style.lineHeight = style.lineHeight;
    mirror.style.letterSpacing = style.letterSpacing;
    mirror.style.wordSpacing = style.wordSpacing;
    mirror.style.textTransform = style.textTransform;
    mirror.style.textIndent = style.textIndent;
    mirror.style.textAlign = style.textAlign;
    mirror.style.direction = style.direction;
    mirror.style.tabSize = style.tabSize;
    mirror.style.padding = style.padding;
    const width = fitName ? parseFloat(style.width) : field.clientWidth;
    mirror.style.width = `${width}px`;
    mirror.style.whiteSpace = field instanceof HTMLTextAreaElement ? 'pre-wrap' : 'pre';
    mirror.style.overflowWrap = field instanceof HTMLTextAreaElement ? 'break-word' : 'normal';
    mirror.style.wordBreak = style.wordBreak;
    const text = document.createTextNode(field.value);
    mirror.replaceChildren(text);
    const range = document.createRange();
    const bounds = mirror.getBoundingClientRect();
    const paddingLeft = parseFloat(style.paddingLeft) || 0, paddingRight = parseFloat(style.paddingRight) || 0;
    if (fitName) {
      range.selectNodeContents(text);
      const name = field.value ? range.getBoundingClientRect() : undefined;
      const visibleRight = width - paddingRight;
      const alignRight = style.textAlign === 'right' || style.textAlign === 'end';
      const emptyLeft = alignRight ? Math.max(paddingLeft, visibleRight - 18) : paddingLeft;
      const left = name ? Math.max(paddingLeft, Math.min(visibleRight, name.left - bounds.left - field.scrollLeft)) : emptyLeft;
      const right = name ? Math.max(left, Math.min(visibleRight, name.right - bounds.left - field.scrollLeft)) : Math.min(visibleRight, emptyLeft + 18);
      field.style.setProperty('--rename-start', `${left}px`);
      field.style.setProperty('--rename-end', `${right}px`);
    }
    if (!hasSelection) { clearPaint(); return; }
    range.setStart(text, start); range.setEnd(text, end);
    const offsetY = field instanceof HTMLInputElement ? (field.clientHeight - bounds.height) / 2 : 0;
    const paddingTop = parseFloat(style.paddingTop) || 0, paddingBottom = parseFloat(style.paddingBottom) || 0;
    const boxes = [...range.getClientRects()].map(rect => {
      const left = Math.max(paddingLeft, rect.left - bounds.left - field.scrollLeft);
      const right = Math.min(width - paddingRight, rect.right - bounds.left - field.scrollLeft);
      const top = Math.max(Math.min(2, paddingTop), rect.top - bounds.top + offsetY - field.scrollTop - 1);
      const bottom = Math.min(field.clientHeight - Math.min(2, paddingBottom), rect.bottom - bounds.top + offsetY - field.scrollTop + 1);
      return { left, top, width: right - left, height: bottom - top };
    }).filter(box => box.width > 0 && box.height > 0);
    if (!boxes.length) { clearPaint(); return; }
    field.style.setProperty('--field-selection-layers', [...boxes.map(() => 'var(--text-selection-gradient)'), 'var(--field-fill-image, var(--input-gradient))'].join(', '));
    field.style.setProperty('--field-selection-sizes', [...boxes.map(box => `${box.width}px ${box.height}px`), '100% 100%'].join(', '));
    field.style.setProperty('--field-selection-positions', [...boxes.map(box => `${box.left}px ${box.top}px`), '0 0'].join(', '));
    field.classList.add('has-gradient-selection');
  }

  function queue() {
    if (active && !frame) frame = requestAnimationFrame(paint);
  }

  root.addEventListener('focusin', event => {
    clear();
    const field = event.target;
    if (!(field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement)
      || field instanceof HTMLInputElement && !['text', 'search', 'url', 'tel'].includes(field.type)) return;
    active = field;
    resize.observe(field);
    queue();
  }, { signal: events.signal });
  root.addEventListener('focusout', clear, { signal: events.signal });
  for (const name of ['select', 'input', 'keydown', 'keyup', 'pointerup', 'scroll']) root.addEventListener(name, queue, { capture: true, signal: events.signal });
  root.addEventListener('compositionstart', () => { composing = true; clearPaint(); }, { signal: events.signal });
  root.addEventListener('compositionend', () => { composing = false; queue(); }, { signal: events.signal });
  document.addEventListener('selectionchange', queue, { signal: events.signal });
  window.addEventListener('resize', queue, { signal: events.signal });
  window.addEventListener('focus', queue, { signal: events.signal });
  window.addEventListener('blur', clearPaint, { signal: events.signal });
  forcedColors.addEventListener('change', queue, { signal: events.signal });
  return () => { events.abort(); cancelAnimationFrame(frame); clear(); mirror.remove(); };
}
