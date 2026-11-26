
export type DesktopPointerSample = {
  x: number; y: number; clientX: number; clientY: number; dx: number; dy: number; pressed: boolean; held: boolean;
};

export function listenDesktopPointer(move: (sample: DesktopPointerSample) => void, reset: () => void): (() => void) | undefined {
  const webview = (window as Window & { chrome?: { webview?: EventTarget } }).chrome?.webview;
  if (!webview) return undefined;
  const message = (event: Event) => {
    const sample = (event as MessageEvent).data;
    if (sample?.type === 'rootsound-pointer-reset') reset();
    if (sample?.type === 'rootsound-pointer') move(sample);
  };
  webview.addEventListener('message', message);
  return () => webview.removeEventListener('message', message);
}

type EdgeDirection = 'left' | 'right' | 'top' | 'bottom';

export function attachEdgeGesture<Side extends EdgeDirection>(target: HTMLElement, direction: Side | readonly Side[], options: {
  enabled(side: Side, across: number): boolean;
  open(across: number, side: Side): void;
  preview?(x: number, y: number): void;
  clearPreview?(): void;
}) {
  const edges = typeof direction === 'string' ? [direction] : direction;
  const doc = target.ownerDocument ?? document;
  const keys = new Set<string>();
  const motion: Array<{ x: number; y: number; at: number }> = [];
  let consumed = false;
  let lastNativeAt = -Infinity;
  let singleAlt = false;
  function hintDown(event: KeyboardEvent): void {
    if (event.code !== 'AltLeft') { singleAlt = false; return; }
    if (event.repeat) {
      if (singleAlt) event.preventDefault();
      return;
    }
    if (event.isComposing || event.ctrlKey || event.shiftKey || event.metaKey) return;
    singleAlt = true;
    event.preventDefault();
  }
  function hintUp(event: KeyboardEvent): void {
    if (event.code !== 'AltLeft') return;
    if (singleAlt) event.preventDefault();
    singleAlt = false;
  }
  function hintVisibility(): void { if (doc.hidden) singleAlt = false; }
  window.addEventListener('keydown', hintDown, true);
  window.addEventListener('keyup', hintUp, true);
  doc.addEventListener('visibilitychange', hintVisibility);
  function test(x: number, y: number, blocked: boolean, at: number) {
    if (!Number.isFinite(x) || !Number.isFinite(y)) return;
    if (blocked || keys.size || target.closest?.('[inert]')) { motion.length = 0; return; }
    const inside = x > 0 && x < 1 && y > 0 && y < 1;
    while (motion.length && at - motion[0]!.at > 95) motion.shift();
    if (inside) {
      consumed = false;
      motion.push({ x, y, at });
      if (motion.length > 16) motion.shift();
    }
    options.preview?.(x, y);
    if (inside || consumed || !motion.length) return;
    for (const side of edges) {
      const vertical = side === 'top' || side === 'bottom';
      const across = vertical ? x : y;
      const position = vertical ? y : x;
      const negative = side === 'left' || side === 'top';
      const reached = negative ? position <= 0 : position >= 1;
      if (!reached || across < 0 || across > 1 || !options.enabled(side, across)) continue;
      const size = Math.max(1, vertical ? window.innerHeight - 1 : window.innerWidth - 1);
      const boundary = negative ? 0 : 1;
      const fast = motion.some(sample => {
        const distance = Math.abs(boundary - (vertical ? sample.y : sample.x)) * size;
        return distance >= 8 && distance * 1000 / Math.max(8, at - sample.at) >= 520;
      });
      if (!fast) continue;
      consumed = true;
      options.open(across, side);
      break;
    }
    motion.length = 0;
  }
  const clearPreview = () => {
    motion.length = 0;
    options.clearPreview?.();
  };
  const reset = () => { keys.clear(); clearPreview(); singleAlt = false; };
  const keydown = (event: KeyboardEvent) => { keys.add(event.code || event.key); clearPreview(); };
  const keyup = (event: KeyboardEvent) => { keys.delete(event.code || event.key); clearPreview(); };
  const removeNative = listenDesktopPointer(({ x, y, pressed, held }) => {
    lastNativeAt = performance.now();
    test(x, y, pressed || held, lastNativeAt);
  }, clearPreview);
  function move(event: PointerEvent) {
    if (event.pointerType !== 'mouse') return;
    const now = performance.now();
    if (removeNative && now - lastNativeAt <= 180) return;
    test(event.clientX / Math.max(1, window.innerWidth - 1), event.clientY / Math.max(1, window.innerHeight - 1),
      !!event.buttons || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey, now);
  }
  const leave = () => { if (!removeNative || performance.now() - lastNativeAt > 180) clearPreview(); };
  target.addEventListener('pointermove', move);
  target.addEventListener('pointerleave', leave);
  doc.addEventListener('keydown', keydown, true);
  doc.addEventListener('keyup', keyup, true);
  doc.addEventListener('pointerdown', clearPreview, true);
  doc.addEventListener('pointerup', clearPreview, true);
  doc.addEventListener('pointercancel', clearPreview, true);
  window.addEventListener('blur', reset);
  const resize = clearPreview;
  window.addEventListener('resize', resize);
  return {
    dispose() {
      clearPreview();
      removeNative?.();
      target.removeEventListener('pointermove', move);
      target.removeEventListener('pointerleave', leave);
      doc.removeEventListener('keydown', keydown, true);
      doc.removeEventListener('keyup', keyup, true);
      doc.removeEventListener('pointerdown', clearPreview, true);
      doc.removeEventListener('pointerup', clearPreview, true);
      doc.removeEventListener('pointercancel', clearPreview, true);
      window.removeEventListener('blur', reset);
      window.removeEventListener('resize', resize);
      window.removeEventListener('keydown', hintDown, true);
      window.removeEventListener('keyup', hintUp, true);
      doc.removeEventListener('visibilitychange', hintVisibility);
    },
  };
}

export const CARD_DWELL_MS = 1000;
const CARD_COOLDOWN_MS = 1000;
export type CardDwellTiming = { startedAt: number; endsAt: number };
type DwellScope = {
  timing?: CardDwellTiming;
  until: number; needsBlank: boolean;
  targets: Set<(target: EventTarget | null) => HTMLElement | undefined>;
};
const dwellScopes = new WeakMap<Document, DwellScope>();

export function attachCardDwell(container: HTMLElement, selector: string, options: {
  enabled(): boolean;
  activate(card: HTMLElement): void;
  readDuration?(): number;
  cooldown?: { readUntil(): number; start(): void };
}) {
  const doc = container.ownerDocument ?? document;
  let scope = dwellScopes.get(doc);
  if (!scope) {
    scope = { until: 0, needsBlank: false, targets: new Set() };
    dwellScopes.set(doc, scope);
  }
  const shared = scope;
  let active: HTMLElement | undefined;
  let timer: number | undefined;
  let suppressed: HTMLElement | undefined;
  let timing: CardDwellTiming | undefined;
  function signal(detail: CardDwellTiming | null) {
    doc.dispatchEvent?.(new CustomEvent('rootsound-dwell', { detail }));
  }
  function cancel() {
    window.clearTimeout(timer);
    if (active) {
      active.classList.remove('is-pointer-dwelling');
      active = undefined;
      if (timing && shared.timing === timing) { shared.timing = undefined; signal(null); }
      timing = undefined;
    }
  }
  function cardAt(target: EventTarget | null) {
    const card = (target as Element | null)?.closest?.<HTMLElement>(selector);
    return card && container.contains(card) ? card : undefined;
  }
  shared.targets.add(cardAt);
  function observe(target: EventTarget | null) {
    const card = cardAt(target);
    if (active && card !== active) cancel();
    if (suppressed && card !== suppressed) suppressed = undefined;
    if (![...shared.targets].some(find => find(target))) shared.needsBlank = false;
    else if (Date.now() < shared.until) shared.needsBlank = true;
  }
  function enter(event: PointerEvent) {
    if (event.pointerType !== 'mouse') return;
    observe(event.target);
    const card = cardAt(event.target);
    if (event.buttons || !card || card === active || card === suppressed || !options.enabled()) return;
    if (!options.cooldown && (Date.now() < shared.until || shared.needsBlank)) return;
    active = card;
    begin(card);
  }
  function begin(card: HTMLElement): void {
    if (active !== card || !container.contains(card) || !options.enabled()) { cancel(); return; }
    const remaining = (options.cooldown?.readUntil() ?? 0) - Date.now();
    if (remaining > 0) { timer = window.setTimeout(() => begin(card), remaining); return; }
    card.classList.add('is-pointer-dwelling');
    const startedAt = Date.now();
    const duration = options.readDuration?.() ?? CARD_DWELL_MS;
    const next = { startedAt, endsAt: startedAt + duration };
    timing = shared.timing = next;
    signal(next);
    timer = window.setTimeout(() => {
      if (active !== card || shared.timing !== next || !container.contains(card) || !options.enabled()) { cancel(); return; }
      if (options.cooldown) options.cooldown.start();
      else {
        shared.until = Date.now() + CARD_COOLDOWN_MS;
        shared.needsBlank = true;
      }
      cancel();
      options.activate(card);
    }, duration);
  }
  const track = (event: PointerEvent) => { if (event.pointerType === 'mouse') observe(event.target); };
  const leave = (event: PointerEvent) => observe(event.relatedTarget);
  const interrupt = (event: Event) => { suppressed = cardAt(event.target); cancel(); };
  const cancellations = ['pointerdown', 'dragstart', 'wheel', 'keydown'] as const;
  doc.addEventListener('pointermove', track, true);
  doc.addEventListener('pointerout', leave, true);
  container.addEventListener('pointermove', enter);
  container.addEventListener('pointerout', leave);
  container.addEventListener('pointerleave', leave);
  for (const type of cancellations) container.addEventListener(type, interrupt, true);
  window.addEventListener('blur', cancel);
  return {
    cancel,
    dispose() {
      cancel();
      shared.targets.delete(cardAt);
      doc.removeEventListener('pointermove', track, true);
      doc.removeEventListener('pointerout', leave, true);
      container.removeEventListener('pointermove', enter);
      container.removeEventListener('pointerout', leave);
      container.removeEventListener('pointerleave', leave);
      for (const type of cancellations) container.removeEventListener(type, interrupt, true);
      window.removeEventListener('blur', cancel);
    },
  };
}
