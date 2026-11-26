const flights = new WeakMap<HTMLElement, { animation: Animation; finish(): void }>();
const arrivals = new WeakMap<HTMLElement, Animation>();
const slides = new WeakMap<HTMLElement, Animation>();

function animateCards(element: HTMLElement): boolean {
  return typeof element.animate === 'function' && !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

export function paintCardBacks(stack: HTMLElement, count: number): void {
  const visible = Math.min(7, count);
  stack.dataset.count = String(count);
  if (stack.childElementCount === visible) return;
  const backs = Array.from({ length: visible }, (_, index) => {
    const back = document.createElement('i');
    back.style.setProperty('--stack-step', String(visible - index - 1));
    return back;
  });
  stack.replaceChildren(...backs);
}

export function mountToneHand(row: HTMLElement) {
  let cards: HTMLElement[] = [], position = 0, target = 0, frame = 0;
  let slots = 7, spacing = 72, bounds: DOMRect | undefined;
  const limit = () => Math.max(0, cards.length - slots);
  function paint(): void {
    const centre = (Math.min(cards.length, slots) - 1) / 2;
    cards.forEach((card, index) => {
      const offset = index - position - centre;
      const outside = Math.max(0, Math.abs(offset) - (slots - 1) / 2);
      const hidden = outside > .9;
      card.style.setProperty('--hand-x', `${offset * spacing}px`);
      card.style.setProperty('--hand-y', `${offset * offset * 2.6 + Math.min(2, outside) * 125}px`);
      card.style.setProperty('--card-turn', `${offset * 5}deg`);
      card.style.setProperty('--card-layer', String(Math.max(1, 50 - Math.round(Math.abs(offset) * 2))));
      card.classList.toggle('is-hand-hidden', hidden);
      card.inert = hidden;
      card.setAttribute('aria-hidden', String(hidden));
    });
    row.dataset.handStart = String(target);
    row.dataset.handSlots = String(slots);
  }
  function measure(): void {
    bounds = row.getBoundingClientRect();
    const width = cards[0]?.offsetWidth || Math.min(182, Math.max(74, window.innerWidth * .102));
    slots = Math.max(3, Math.min(9, Math.floor(bounds.width / (width * .72))));
    spacing = Math.min(width * .78, bounds.width / Math.max(1, slots));
    target = Math.max(0, Math.min(target, limit())); position = target;
    paint();
  }
  function update(next: HTMLElement[]): void {
    if (cards.length === next.length && cards.every((card, index) => card === next[index])) return;
    const first = cards[Math.round(target)]?.dataset.partId;
    cards = next;
    const retained = first ? cards.findIndex(card => card.dataset.partId === first) : -1;
    if (retained >= 0) target = retained;
    measure();
  }
  function wheel(event: WheelEvent): boolean {
    if (!bounds || !cards.length || event.ctrlKey || event.metaKey || !event.deltaY
      || event.clientX < bounds.left || event.clientX > bounds.right
      || event.clientY < bounds.top - 24 || event.clientY > bounds.bottom) return false;
    event.preventDefault(); event.stopPropagation();
    const unit = event.deltaMode === 1 ? 3 : event.deltaMode === 2 ? 1 : 100;
    target = Math.max(0, Math.min(limit(), target + Math.max(-2, Math.min(2, event.deltaY / unit))));
    if (!frame) frame = requestAnimationFrame(() => { frame = 0; position = target; paint(); });
    return true;
  }
  window.addEventListener('resize', measure);
  return { update, measure, wheel, dispose() { cancelAnimationFrame(frame); window.removeEventListener('resize', measure); } };
}

const photographedInstruments = new Set(['piano', 'sax', 'bass', 'guitar', 'steel-guitar', 'violin', 'viola', 'cello',
  'flute', 'trumpet', 'trombone', 'horn', 'dizi', 'kick', 'snare', 'hat', 'tom', 'crash', 'ride']);

function photoKey(key?: string): string {
  const name = key?.replace(/^studio-/, '') ?? '';
  const drum = name.replace(/^(black-pearl|red-zeppelin)-/, '');
  if (drum.startsWith('hat-')) return 'hat';
  if (drum.startsWith('tom-')) return 'tom';
  return drum === 'rim' ? 'snare' : drum;
}

export function showToneCardFace(button: HTMLButtonElement, key?: string): void {
  const name = document.createElement('span');
  const art = document.createElement('span');
  name.className = 'melody-card-name';
  art.className = 'melody-card-art';
  name.textContent = button.textContent;
  art.setAttribute('aria-hidden', 'true');
  const imageKey = photoKey(key);
  if (photographedInstruments.has(imageKey)) {
    const photo = document.createElement('img');
    photo.src = new URL(`./instrument-photos/${imageKey}.webp`, import.meta.url).href; photo.alt = ''; photo.decoding = 'async'; photo.draggable = false;
    art.append(photo);
  }
  button.classList.remove('has-instrument-icon');
  button.classList.add('melody-photo-card');
  button.replaceChildren(name, art);
}

export function setMiniToneDrag(data: DataTransfer, card: HTMLElement): void {
  if (typeof data.setDragImage !== 'function' || typeof card.cloneNode !== 'function') return;
  const image = card.cloneNode(true) as HTMLElement;
  image.classList.add('melody-card-drag-image');
  image.inert = true;
  image.setAttribute('aria-hidden', 'true');
  document.body.append(image);
  data.setDragImage(image, 23, 29);
  requestAnimationFrame(() => image.remove());
}

type CardPicture = { bounds: DOMRect; card: HTMLElement };

export function takeToneCardPicture(card: HTMLElement, release?: Pick<DragEvent, 'clientX' | 'clientY'>, origin?: DOMRect): CardPicture | undefined {
  if (!animateCards(card)) return;
  const bounds = origin ?? card.getBoundingClientRect();
  if (!bounds.width || !bounds.height) return;
  return {
    bounds: release ? new DOMRect(release.clientX - bounds.width / 2, release.clientY - bounds.height / 2, bounds.width, bounds.height) : bounds,
    card: card.cloneNode(true) as HTMLElement,
  };
}

export function flyToneCard(picture: CardPicture | undefined, target: HTMLElement | null | undefined, workspace: HTMLElement,
  kind: 'pin' | 'return' | 'stack' | 'deal'): void {
  if (!picture || !target || !animateCards(workspace)) return;
  const to = target.getBoundingClientRect();
  if (!to.width || !to.height) return;
  const { bounds: from, card } = picture;
  const frame = workspace.getBoundingClientRect();
  const dx = to.left + to.width / 2 - from.left - from.width / 2;
  const dy = to.top + to.height / 2 - from.top - from.height / 2;
  card.classList.remove('is-card-arriving', 'is-group-dragging');
  card.classList.add('melody-card-flight');
  card.inert = true;
  card.setAttribute('aria-hidden', 'true');
  Object.assign(card.style, {
    left: `${from.left - frame.left}px`, top: `${from.top - frame.top}px`,
    width: `${from.width}px`, height: `${from.height}px`,
  });
  workspace.append(card);
  if (kind !== 'stack') target.classList.add('is-card-arriving');
  const selection = kind === 'pin';
  const scale = Math.min(.78, Math.max(.18, to.height / from.height));
  const bend = Math.min(51, Math.hypot(dx, dy) * .12);
  const frames = kind === 'return' ? [
    { transform: 'translate(0px, 0px) scale(1)', opacity: .92 },
    { transform: `translate(${dx}px, ${dy}px) scale(${to.width / from.width}, ${to.height / from.height})`, opacity: 1 },
  ] : selection ? Array.from({ length: 13 }, (_, index) => {
    const t = index / 12;
    const small = .31;
    const size = t < .38 ? 1 + (small - 1) * (t / .38) : small + (scale - small) * ((t - .38) / .62);
    return {
      transform: `translate(${dx * t}px, ${dy * t - 4 * bend * t * (1 - t)}px) scale(${size})`,
      opacity: Math.min(1, (1 - t) * 8),
    };
  }) : [
    { transform: 'translate(0, 0) scale(1)', opacity: 1 },
    { transform: `translate(${dx * .58}px, ${dy * .58 - 13}px) scale(.9)`, opacity: 1 },
    { transform: `translate(${dx}px, ${dy}px) scale(${scale})`, opacity: 0 },
  ];
  const animation = card.animate(frames, { duration: selection ? 335 : kind === 'return' ? 195 : 230, easing: 'cubic-bezier(.2,.67,.24,1)' });
  if (kind !== 'stack') arrivals.set(target, animation);
  const finish = () => {
    flights.delete(card);
    if (arrivals.get(target) === animation) {
      arrivals.delete(target);
      target.classList.remove('is-card-arriving');
    }
    card.remove();
  };
  flights.set(card, { animation, finish });
  animation.onfinish = finish;
  animation.oncancel = finish;
}

export function stopToneCardFlights(workspace: HTMLElement): void {
  for (const card of workspace.querySelectorAll<HTMLElement>('.melody-card-flight')) {
    const flight = flights.get(card);
    flight?.animation.cancel();
    if (flight) flight.finish();
    else card.remove();
  }
}

export function slideToneCards(container: HTMLElement, previous: Map<string, number>): void {
  if (!animateCards(container)) return;
  for (const child of container.children) slides.get(child as HTMLElement)?.cancel();
  const offsets = [...container.children].flatMap(child => {
    const card = child as HTMLElement;
    const start = previous.get(card.dataset.partId ?? card.dataset.timbreId ?? '');
    return start === undefined ? [] : [{ card, dx: start - card.getBoundingClientRect().left }];
  });
  for (const { card, dx } of offsets) {
    if (Math.abs(dx) < 1) continue;
    const animation = card.animate([{ translate: `${dx}px` }, { translate: '0px' }], { duration: 210, easing: 'cubic-bezier(.22,.75,.2,1)' });
    slides.set(card, animation);
    const finish = () => { if (slides.get(card) === animation) slides.delete(card); };
    animation.onfinish = finish;
    animation.oncancel = finish;
  }
}

export function toneCardPositions(container: HTMLElement): Map<string, number> {
  return new Map([...container.children].map(child => {
    const card = child as HTMLElement;
    return [card.dataset.partId ?? card.dataset.timbreId ?? '', card.getBoundingClientRect().left];
  }));
}

export function mountToneDeck(row: HTMLElement, strip: HTMLElement, fan?: { workspace: HTMLElement; pile: HTMLElement }) {
  let gathering = false;
  let disposed = false;
  let motion: Animation[] = [];
  let flightLayer: HTMLElement | undefined;
  let flying: { card: HTMLElement; clone: HTMLElement; face: HTMLElement; stacked: string }[] = [];
  function clearFlights(): void {
    flightLayer?.remove();
    flightLayer = undefined;
    for (const { card } of flying) card.classList.remove('is-deck-flying');
    flying = [];
  }
  function animateFan({ workspace, pile }: NonNullable<typeof fan>, closed?: () => void): void {
    const resuming = !!flightLayer;
    if (!flightLayer) {
      const slots = Array.from(pile.querySelectorAll<HTMLElement>('.melody-card-backs i'), card => ({
        bounds: card.getBoundingClientRect(), width: card.offsetWidth, height: card.offsetHeight,
      }));
      const viewport = strip.getBoundingClientRect();
      const area = workspace.getBoundingClientRect();
      flightLayer = document.createElement('div');
      flightLayer.className = 'melody-library-deck melody-deck-flights';
      flightLayer.inert = true;
      flightLayer.setAttribute('aria-hidden', 'true');
      for (const card of Array.from(strip.children) as HTMLElement[]) {
        const rect = card.getBoundingClientRect();
        if (!rect.width || !rect.height || rect.bottom <= viewport.top || rect.top >= viewport.bottom) continue;
        const index = flying.length % slots.length;
        const slot = slots[index];
        if (!slot?.width || !slot.height) continue;
        const clone = card.cloneNode(true) as HTMLElement;
        const face = clone.querySelector<HTMLElement>('.melody-library-tone');
        if (!face) continue;
        const back = document.createElement('span');
        back.className = 'melody-deck-flight-back';
        if (index === 0) back.classList.add('has-note-mark');
        clone.prepend(back);
        clone.classList.remove('is-card-arriving');
        Object.assign(clone.style, {
          left: `${rect.left - area.left}px`, top: `${rect.top - area.top}px`,
          width: `${rect.width}px`, height: `${rect.height}px`,
          zIndex: String(7 - index),
        });
        const dx = slot.bounds.left + slot.bounds.width / 2 - (rect.left + rect.width / 2);
        const dy = slot.bounds.top + slot.bounds.height / 2 - (rect.top + rect.height / 2);
        const stacked = `translate(${dx}px, ${dy}px) rotate(${index * 15}deg) scale(${slot.width / rect.width}, ${slot.height / rect.height})`;
        flying.push({ card, clone, face, stacked });
        flightLayer.append(clone);
      }
      workspace.append(flightLayer);
      for (const { card } of flying) card.classList.add('is-deck-flying');
    }
    const current = resuming ? flying.map(({ clone, face }) => ({
      transform: getComputedStyle(clone).transform, opacity: Number(getComputedStyle(face).opacity),
    })) : undefined;
    for (const animation of motion) animation.cancel();
    const spread = 'translate(0px, 0px) rotate(0deg) scale(1)';
    const animations = flying.flatMap(({ clone, face, stacked }, index) => {
      const delay = resuming ? 0 : Math.min(6, gathering ? flying.length - index - 1 : index) * 10;
      const timing: KeyframeAnimationOptions = { duration: 245, delay, fill: 'both' };
      const travel = clone.animate([
        { transform: current?.[index]?.transform ?? (gathering ? spread : stacked) },
        { transform: gathering ? stacked : spread },
      ], { ...timing, easing: 'cubic-bezier(.26,.62,.26,1)' });
      const reveal = face.animate(resuming ? [
        { opacity: current?.[index]?.opacity }, { opacity: gathering ? 0 : 1 },
      ] : gathering ? [
        { opacity: 1 }, { opacity: 1, offset: .37 }, { opacity: 0, offset: .85 }, { opacity: 0 },
      ] : [
        { opacity: 0 }, { opacity: 0, offset: .14 }, { opacity: 1, offset: .64 }, { opacity: 1 },
      ], timing);
      return [travel, reveal];
    });
    motion = animations;
    void Promise.allSettled(animations.map(animation => animation.finished)).then(() => {
      if (disposed || motion !== animations) return;
      motion = [];
      for (const animation of animations) animation.cancel();
      clearFlights();
      closed?.();
    });
  }
  function animateSpread(pile: HTMLElement, closed?: () => void): void {
    if (disposed) return;
    gathering = !!closed;
    row.inert = gathering;
    if (!animateCards(strip)) { closed?.(); return; }
    if (fan) { animateFan(fan, closed); return; }
    const view = strip.getBoundingClientRect();
    const moving = Array.from(strip.children, card => ({ card: card as HTMLElement, bounds: card.getBoundingClientRect() }))
      .filter(({ bounds }) => bounds.bottom > view.top && bounds.top < view.bottom);
    const current = motion.length ? moving.map(({ card }) => {
      const { translate, scale, opacity } = getComputedStyle(card);
      return { translate, scale, opacity };
    }) : undefined;
    for (const animation of motion) animation.cancel();
    const origin = pile.getBoundingClientRect();
    const boxes = current ? moving.map(({ card }) => card.getBoundingClientRect()) : moving.map(({ bounds }) => bounds);
    const spread = { translate: '0px 0px', scale: '1', opacity: '1' };
    const animations = moving.map(({ card }, index) => {
      const box = boxes[index]!;
      const x = origin.left + origin.width / 2 - box.left - box.width / 2;
      const y = origin.top + origin.height / 2 - box.top - box.height / 2;
      const stacked = { translate: x + 'px ' + y + 'px', scale: '.55', opacity: '0' };
      return card.animate([current?.[index] ?? (gathering ? spread : stacked), gathering ? stacked : spread],
        { duration: 240, delay: current ? 0 : Math.min(10, index) * 14, fill: 'both', easing: 'cubic-bezier(.2,.74,.24,1)' });
    });
    motion = animations;
    void Promise.allSettled(animations.map(animation => animation.finished)).then(() => {
      if (disposed || motion !== animations) return;
      motion = [];
      closed?.();
      for (const animation of animations) animation.cancel();
    });
  }
  return {
    setCards(next: HTMLElement[]) {
      const top = strip.scrollTop;
      strip.replaceChildren(...next);
      strip.scrollTop = top;
    },
    dealFrom(pile: HTMLElement) { animateSpread(pile); },
    toggle(pile: HTMLElement, closed: () => void) { animateSpread(pile, gathering ? undefined : closed); },
    dispose() {
      disposed = true;
      for (const animation of motion) animation.cancel();
      motion = [];
      clearFlights();
    },
  };
}
