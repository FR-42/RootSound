export type PointerPanMode = 'off' | 'ready' | 'waiting';

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

const EDGE_SWIPE_TIME_MS = 120;
const EDGE_SWIPE_ZONE = .94;
const EDGE_SWIPE_DISTANCE = .12;
export const EDGE_COOLDOWN_MS = 500;

export function createEdgeGesture(lightPush = false) {
  let armed = false;
  let triggered = false;
  let distance = 0;
  const pushes: Array<{ time: number; amount: number }> = [];
  function clearPushes() { distance = 0; pushes.length = 0; }
  function reset() { armed = triggered = false; clearPushes(); }
  return {
    reset,
    move(position: number, outward: number, tangent: number, time: number, sensitivity = .65) {
      if (position < 1) {
        if (position < .985 || !triggered && (!lightPush || position < .996)) reset();
        return { progress: 0, open: false };
      }
      if (!armed) {
        armed = true;
        return { progress: 0, open: false };
      }
      if (triggered) return { progress: 0, open: false };
      const tangentLimit = lightPush ? 1.5 : 1.2;
      const directed = outward > 0 && Math.abs(tangent) <= outward * tangentLimit;
      if (outward < 0 || !directed && !lightPush) clearPushes();
      if (!directed) return { progress: 0, open: false };
      while (pushes[0] && time - pushes[0].time > EDGE_SWIPE_TIME_MS) distance -= pushes.shift()!.amount;
      pushes.push({ time, amount: outward });
      distance += outward;
      const threshold = lightPush ? 20 : 34 - 16 * sensitivity;
      triggered = distance >= threshold;
      return { progress: Math.min(1, distance / threshold), open: triggered };
    },
  };
}

export function createEdgeSwipe() {
  const trail: Array<{ time: number; horizontal: number; vertical: number }> = [];
  let previous: { position: number; across: number; time: number } | undefined;
  let horizontal = 0;
  let vertical = 0;
  function clearTrail() { trail.length = 0; horizontal = vertical = 0; }
  return {
    reset() { previous = undefined; clearTrail(); },
    move(position: number, across: number, time: number): boolean {
      const before = previous;
      position = Math.max(0, Math.min(1, position));
      previous = { position, across, time };
      if (!before) return false;
      const dx = position - before.position, dy = Math.abs(across - before.across);
      if (dx < 0 || time - before.time > EDGE_SWIPE_TIME_MS) { clearTrail(); return false; }
      while (trail[0] && time - trail[0].time > EDGE_SWIPE_TIME_MS) {
        const expired = trail.shift()!;
        horizontal -= expired.horizontal;
        vertical -= expired.vertical;
      }
      if (dx || dy) {
        trail.push({ time: before.time, horizontal: dx, vertical: dy });
        horizontal += dx;
        vertical += dy;
      }
      return dx > 0 && position >= EDGE_SWIPE_ZONE && horizontal >= EDGE_SWIPE_DISTANCE && horizontal >= 1.5 * vertical;
    },
  };
}

export function attachEdgeGesture(target: HTMLElement, direction: 'left' | 'right' | 'top' | 'bottom', options: {
  enabled(): boolean;
  open(across: number): void;
}) {
  const vertical = direction === 'top' || direction === 'bottom';
  const reversed = direction === 'top' || direction === 'left';
  const push = createEdgeGesture(true);
  const swipe = createEdgeSwipe();
  let width = window.innerWidth, height = window.innerHeight;
  let previous: { x: number; y: number } | undefined;
  let lastNativeAt = -Infinity;
  let usingNative = false;
  let lastOutward = -Infinity;
  function reset() { push.reset(); swipe.reset(); previous = undefined; }
  function interrupt() { lastOutward = -Infinity; reset(); }
  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    interrupt();
  }
  function test(x: number, y: number, dx: number, dy: number, blocked: boolean) {
    const across = vertical ? x : y;
    if (blocked || !width || !height || across < 0 || across > 1) { interrupt(); return; }
    const position = vertical ? y : x;
    const axis = reversed ? 1 - position : position;
    const outward = (vertical ? dy : dx) * (reversed ? -1 : 1);
    const tangent = vertical ? dx : dy;
    const time = performance.now();
    if (axis >= EDGE_SWIPE_ZONE && time - lastOutward <= EDGE_SWIPE_TIME_MS) {
      if (outward > 0) lastOutward = time;
      return;
    }
    lastOutward = -Infinity;
    if (!options.enabled()) { reset(); return; }
    const swept = swipe.move(axis, across * (vertical ? width / height : height / width), time);
    if (!(swept && outward > 0) && !push.move(axis, outward, tangent, time).open) return;
    reset();
    lastOutward = time;
    options.open(across);
  }
  const removeNative = listenDesktopPointer(({ x, y, dx, dy, pressed, held }) => {
    if (!usingNative) push.reset();
    usingNative = true;
    lastNativeAt = performance.now();
    test(x, y, dx, dy, pressed || held);
  }, interrupt);
  function move(event: PointerEvent) {
    if (event.pointerType !== 'mouse' || !width || !height) return;
    const { clientX: x, clientY: y } = event;
    if (!removeNative || performance.now() - lastNativeAt > 180) {
      if (usingNative) push.reset();
      usingNative = false;
      const dx = x - (previous?.x ?? x), dy = y - (previous?.y ?? y);
      test(x / Math.max(1, width - 1), y / Math.max(1, height - 1), dx || event.movementX || 0, dy || event.movementY || 0, !!event.buttons);
    }
    previous = { x, y };
  }
  target.addEventListener('pointermove', move);
  window.addEventListener('blur', interrupt);
  window.addEventListener('resize', resize);
  return {
    reset,
    dispose() {
      interrupt();
      removeNative?.();
      target.removeEventListener('pointermove', move);
      window.removeEventListener('blur', interrupt);
      window.removeEventListener('resize', resize);
    },
  };
}

export function pointerPanVector(x: number, y: number, width: number, height: number, sensitivity: number) {
  if (width <= 0 || height <= 0) return { x: 0, y: 0 };
  const dx = x - width / 2, dy = y - height / 2;
  const distance = Math.hypot(dx, dy);
  const extent = Math.max(Math.abs(dx) * 2 / width, Math.abs(dy) * 2 / height);
  const deadZone = .34 - .14 * sensitivity;
  const amount = Math.max(0, Math.min(1, (extent - deadZone) / (1 - deadZone)));
  const speed = .15 * amount + .85 * amount ** 4.5;
  return distance ? { x: dx / distance * speed, y: dy / distance * speed } : { x: 0, y: 0 };
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
