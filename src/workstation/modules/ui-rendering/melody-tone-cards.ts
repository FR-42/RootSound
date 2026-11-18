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

export function arrangeToneCards(cards: HTMLElement[], angle: number): void {
  const centre = (cards.length - 1) / 2;
  cards.forEach((card, index) => {
    card.style.setProperty('--card-turn', `${(index - centre) * Math.min(5, angle / Math.max(1, centre))}deg`);
    card.style.setProperty('--card-layer', String(index + 1));
  });
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

export function showToneCardFace(button: HTMLButtonElement): void {
  const name = document.createElement('span');
  const art = document.createElement('span');
  name.className = 'melody-card-name';
  art.className = 'melody-card-art';
  name.textContent = button.textContent;
  art.setAttribute('aria-hidden', 'true');
  const icon = button.querySelector('svg');
  if (icon) art.append(icon);
  button.classList.remove('has-instrument-icon');
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

export function takeToneCardPicture(card: HTMLElement, release?: Pick<DragEvent, 'clientX' | 'clientY'>): CardPicture | undefined {
  if (!animateCards(card)) return;
  const bounds = card.getBoundingClientRect();
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
  const mask = kind === 'return' ? target.closest('.melody-tone-hand-mask')?.getBoundingClientRect() : undefined;
  const visibleHeight = mask ? Math.max(0, Math.min(to.bottom, mask.bottom) - to.top) : to.height;
  const dy = to.top + visibleHeight / 2 - from.top - from.height / 2;
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
  const selection = kind === 'pin' || kind === 'return';
  const scale = Math.min(.78, Math.max(.18, visibleHeight / from.height));
  const bend = Math.min(51, Math.hypot(dx, dy) * .12);
  const frames = selection ? Array.from({ length: 13 }, (_, index) => {
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
  const animation = card.animate(frames, { duration: selection ? 335 : 230, easing: 'cubic-bezier(.2,.67,.24,1)' });
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

export function mountToneDeck(workspace: HTMLElement, row: HTMLElement, strip: HTMLElement, left: HTMLElement, right: HTMLElement) {
  let cards: HTMLElement[] = [];
  let start = 0;
  let count = 7;
  let wheel = 0;
  let firstSpread = true;
  let gathering = false;
  let disposed = false;
  let motion: Animation[] = [];
  const limit = () => Math.max(0, cards.length - count);
  function paint(): void {
    if (disposed) return;
    const available = strip.clientWidth || row.clientWidth - 100;
    if (available > 0) count = Math.min(7, Math.max(3, Math.floor(available / 72)));
    start = Math.min(start, limit());
    const visible = cards.slice(start, start + count);
    for (const card of [...strip.children]) if (!visible.includes(card as HTMLElement)) card.remove();
    visible.forEach((card, index) => {
      if (strip.children[index] !== card) strip.insertBefore(card, strip.children[index] ?? null);
    });
    arrangeToneCards(visible, 7);
    paintCardBacks(left, start);
    paintCardBacks(right, Math.max(0, cards.length - start - visible.length));
  }
  function step(direction: number): void {
    const next = Math.max(0, Math.min(limit(), start + direction));
    if (next === start) return;
    const departing = (direction > 0 ? strip.firstElementChild : strip.lastElementChild) as HTMLElement;
    const old = toneCardPositions(strip);
    const leaving = takeToneCardPicture(departing);
    const incomingStack = direction > 0 ? right : left;
    const dealt = takeToneCardPicture(incomingStack);
    start = next;
    paint();
    slideToneCards(strip, old);
    flyToneCard(leaving, direction > 0 ? left : right, workspace, 'stack');
    flyToneCard(dealt, (direction > 0 ? strip.lastElementChild : strip.firstElementChild) as HTMLElement, workspace, 'deal');
  }
  function scroll(event: WheelEvent): void {
    if (gathering) return;
    if (event.ctrlKey || event.metaKey) return;
    event.preventDefault();
    const delta = Math.abs(event.deltaY) >= Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
    if (!delta) return;
    if (Math.sign(wheel) !== Math.sign(delta)) wheel = 0;
    wheel += delta * (event.deltaMode === 1 ? 24 : event.deltaMode === 2 ? 80 : 1);
    if (Math.abs(wheel) < 32) return;
    step(Math.sign(wheel)); wheel = 0;
  }
  function keys(event: KeyboardEvent): void {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault(); event.stopPropagation();
    step(event.key === 'ArrowRight' ? 1 : -1);
  }
  function animateSpread(pile: HTMLElement, closed?: () => void): void {
    if (disposed) return;
    gathering = !!closed;
    row.inert = gathering;
    if (!animateCards(strip)) { closed?.(); return; }
    const moving = [...strip.children, left, right].filter(card => card.childElementCount) as HTMLElement[];
    const current = motion.length ? moving.map(card => {
      const { translate, scale, opacity } = getComputedStyle(card);
      return { translate, scale, opacity };
    }) : undefined;
    for (const animation of motion) animation.cancel();
    row.classList.add('is-deck-moving');
    const origin = pile.getBoundingClientRect();
    const spread = { translate: '0px 0px', scale: '1', opacity: '1' };
    const destinations = moving.map(card => ({ card, box: card.getBoundingClientRect() }));
    const animations = destinations.map(({ card, box }, index) => {
      const x = origin.left + origin.width / 2 - box.left - box.width / 2;
      const y = origin.top + origin.height / 2 - box.top - box.height / 2;
      const stacked = { translate: `${x}px ${y}px`, scale: '.55', opacity: '0' };
      return card.animate([current?.[index] ?? (gathering ? spread : stacked), gathering ? stacked : spread],
        { duration: 240, delay: current ? 0 : 14 * index, fill: 'both', easing: 'cubic-bezier(.2,.74,.24,1)' });
    });
    motion = animations;
    void Promise.allSettled(animations.map(animation => animation.finished)).then(() => {
      if (disposed || motion !== animations) return;
      motion = [];
      closed?.();
      for (const animation of animations) animation.cancel();
      row.classList.remove('is-deck-moving');
    });
  }
  row.addEventListener('wheel', scroll, { passive: false });
  row.addEventListener('keydown', keys);
  window.addEventListener('resize', paint);
  return {
    setCards(next: HTMLElement[]) {
      if (!firstSpread && next.length === cards.length && next.every((card, index) => card === cards[index])) return;
      const first = cards[start]?.dataset.timbreId;
      cards = next;
      const retained = first ? cards.findIndex(card => card.dataset.timbreId === first) : -1;
      start = firstSpread ? Math.min(2, Math.max(0, limit() - 1)) : Math.max(0, retained);
      firstSpread = false;
      paint();
    },
    resize: paint,
    dealFrom(pile: HTMLElement) { animateSpread(pile); },
    toggle(pile: HTMLElement, closed: () => void) {
      animateSpread(pile, gathering ? undefined : closed);
    },
    dispose() {
      disposed = true;
      for (const animation of motion) animation.cancel();
      motion = [];
      row.removeEventListener('wheel', scroll);
      row.removeEventListener('keydown', keys);
      window.removeEventListener('resize', paint);
    },
  };
}
