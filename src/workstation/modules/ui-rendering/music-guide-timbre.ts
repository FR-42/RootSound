import type { LearningAction } from '../../contracts/guidance.ts';

export function introduceTimbres(shell: HTMLElement, host: HTMLElement, heading: HTMLElement, copy: HTMLElement, onComplete: () => void) {
  const shelf = host.querySelector<HTMLElement>('.melody-shelf')!;
  const main = shelf.closest<HTMLElement>('.melody-main')!;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const layer = document.createElement('div');
  layer.className = 'music-guide-timbre-flight music-editor is-vertical';
  layer.setAttribute('aria-hidden', 'true');
  layer.inert = true;
  shell.append(layer);
  const phase = (value: string) => { shell.dataset.timbrePhase = value; };
  function tip(text: string) {
    const line = document.createElement('p');
    line.textContent = text;
    line.className = 'music-guide-prompt';
    return line;
  }
  const selectTip = tip('点击左上角音色卡可以进入选中状态');
  const mutedTip = document.createElement('p');
  mutedTip.textContent = '选中音色时，其他音色的音符将变暗且静默';
  const drawTip = tip('左键卷帘添加音符');
  const deselectTip = tip('右键卷帘空白处以取消选中');
  let animations: Animation[] = [];
  let disposed = false;

  function play(next: Animation[], land: () => void) {
    animations = next;
    void Promise.all(next.map(animation => animation.finished)).then(() => {
      if (disposed) return;
      layer.replaceChildren();
      animations = [];
      land();
    }, () => {});
  }
  function fly(controls: HTMLElement[], land: () => void) {
    if (reducedMotion || !controls.length) { land(); return; }
    const title = heading.getBoundingClientRect();
    const targets = controls.map(control => control.getBoundingClientRect());
    const center = (targets[0]!.top + targets.at(-1)!.bottom) / 2;
    const x = Math.min(title.right + 20, innerWidth - Math.max(...targets.map(target => target.width)) - 12);
    const offsetY = title.top + title.height / 2 - center;
    play(controls.map((control, index) => {
      const target = targets[index]!;
      const replica = control.cloneNode(true) as HTMLElement;
      replica.draggable = false;
      Object.assign(replica.style, { left: `${x}px`, top: `${target.top + offsetY}px`, width: `${target.width}px`, height: `${target.height}px` });
      layer.append(replica);
      return replica.animate([
        { opacity: 0, transform: 'none' },
        { opacity: 1, transform: 'none', offset: .26 },
        { opacity: 1, transform: 'none', offset: .41, easing: 'cubic-bezier(.22, .72, .26, 1)' },
        { opacity: 1, transform: `translate(${target.left - x}px, ${-offsetY}px)` },
      ], { duration: 2050, fill: 'both' });
    }), land);
  }
  function revealCards() {
    phase('cards');
    fly([...shelf.querySelectorAll<HTMLElement>('.melody-note-family')], () => {
      phase('select');
      copy.append(selectTip);
    });
  }
  function action(value: LearningAction) {
    const current = shell.dataset.timbrePhase;
    if (current === 'select' && value === 'select-group') {
      phase('draw');
      copy.replaceChildren(...(shelf.querySelectorAll('.melody-note-family').length > 1 ? [mutedTip, drawTip] : [drawTip]));
    } else if (current === 'draw' && value === 'draw-note') {
      phase('deselect');
      drawTip.replaceWith(deselectTip);
    } else if (current === 'draw' && value === 'deselect') {
      phase('select');
      copy.replaceChildren(selectTip);
    } else if (current === 'deselect' && value === 'deselect') {
      phase('complete');
      deselectTip.remove();
      onComplete();
    }
  }
  function resize() {
    if (shell.dataset.timbrePhase === 'cards') animations.forEach(animation => animation.finish());
  }
  window.addEventListener('resize', resize);
  phase('opening');
  if (reducedMotion) revealCards();
  else play([main.animate([
    { gridTemplateColumns: '0px minmax(0, 1fr)' },
    { gridTemplateColumns: 'var(--melody-shelf-width) minmax(0, 1fr)' },
  ], { duration: 1150, easing: 'ease-in-out' })], revealCards);

  return { action, dispose() {
    disposed = true;
    animations.forEach(animation => animation.cancel());
    window.removeEventListener('resize', resize);
    layer.remove();
    delete shell.dataset.timbrePhase;
  } };
}
