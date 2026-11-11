import type { PhraseEditorPort } from '../../contracts/phrase.ts';
import type { LearningAction } from '../../contracts/guidance.ts';
import type { SoundRuntimePort } from '../../contracts/sound.ts';
import type { MusicWorkspaceState } from '../../contracts/workspace.ts';
import { melodyPitchTop } from './melody-geometry.ts';
import { phrasePitchRow } from './phrase-viewport.ts';
import { mountPhraseComposition } from './phrase-composition.ts';
import { showProjectExit } from './project-exit.ts';
import { introduceTimbres } from './music-guide-timbre.ts';
import './music-guide.css';

export interface MusicGuideDocument {
  phrase: PhraseEditorPort;
  listTimbres(): Array<{ id: string; name: string }>;
  addGroup(id: string): string;
  changeTone(partId: string, id: string): void;
  rename(name: string): void;
  save(): void;
}
export interface MusicGuideFactory {
  createDocument(name: string): MusicGuideDocument;
  createSound(): SoundRuntimePort;
  mobileWeb?: boolean;
}

const enterDelayMs = 500;
const subdivisionStep = 8;
const editStep = 9;
const noteEditPrompts: ReadonlyArray<readonly [action: LearningAction, text: string]> = [
  ['move-note', '左键按住并拖动音符可以改变位置'],
  ['delete-note', '右键点击音符或按住右键划过音符可以删除它'],
  ['resize-note', '拖动音符下边缘可以更改时长'],
  ['undo', '回退键可以撤销上一步操作'],
];
const scenes = [
  { title: '卷帘', lines: ['核心创作画布'], wait: enterDelayMs },
  { title: '音符', lines: ['音符散落在卷帘上'], wait: enterDelayMs },
  { title: '播放线', lines: ['播放线匀速向下，碰到音符就发声', '按空格开始或暂停'], wait: 0 },
  { title: '琴键与列线', lines: ['卷帘分列，列与琴键一一对应，表示音调。'], wait: enterDelayMs },
  { title: 'BPM', lines: ['BPM 值 × 一拍的时长 = 一分钟', '相邻两条横线之间是一拍', '点击左下角数字以改变 BPM'], wait: 0 },
  { title: '音色', lines: [], wait: 0 },
  { title: '缩放', lines: ['Control + 滚轮竖直缩放，Shift + Control + 滚轮水平缩放'], wait: 5000 },
  { title: '拍内细分', lines: [
    '上下拉宽，会出现更细、更密集的横线',
    '点击bpm可调节均分份数',
  ], wait: 5000 },
  { title: '编辑音符', lines: [], wait: 0 },
  { title: '顶栏', lines: [
    '顶栏是核心控制区',
    '左上角是乐曲名，双击可修改',
  ], wait: 5000 },
] as const;

const finalStep = scenes.length;
const doubleEnterMs = 175;

function element<K extends keyof HTMLElementTagNameMap>(tag: K, className = '', text = '') {
  const node = document.createElement(tag); node.className = className; node.textContent = text; return node;
}
function button(className: string, text: string, click: () => void) {
  const control = element('button', className, text); control.type = 'button'; control.addEventListener('click', click); return control;
}
function seed(document: MusicGuideDocument): void {
  const { phrase } = document;
  phrase.setTempo(120);
  phrase.setStepsPerBeat(3);
  phrase.setLength(16);
  const tones = document.listTimbres();
  for (const [index, notes] of [[[.6, 60], [2.4, 64], [4, 62]], [[1.4, 67], [3.2, 65]], [[4.8, 69]]].entries()) {
    const tone = tones[index % tones.length]!;
    const part = phrase.read().body!.parts.find(part => part.timbreId === tone.id && !part.unassigned)?.id ?? document.addGroup(tone.id);
    phrase.addNotes(part, notes.map(([startBeat, pitch]) => ({
      startBeat: startBeat!, durationBeats: .55, frequencyHz: 440 * 2 ** ((pitch! - 69) / 12), velocity: .65,
    })));
  }
}

export function mountMusicGuide(root: HTMLElement, factory: MusicGuideFactory, onClose: () => void) {
  let disposed = false;
  let step = 1;
  let shown = false;
  let lastEnterAt = -Infinity;
  let sceneTimer = 0, advanceTimer = 0, firstFrame = 0;
  let leaveTempoScene: (() => void) | undefined;
  let leaveSubdivisionScene: (() => void) | undefined;
  let timbreScene: ReturnType<typeof introduceTimbres> | undefined;
  let noteEditAction: ((action: LearningAction) => void) | undefined;
  let sound: SoundRuntimePort | undefined;
  let editor: ReturnType<typeof mountPhraseComposition> | undefined;
  const shell = element('main', 'music-guide');
  shell.classList.toggle('is-mobile-web', !!factory.mobileWeb);
  const host = element('div', 'music-guide-host');
  const words = element('section', 'music-guide-words');
  words.hidden = true; words.setAttribute('aria-live', 'polite'); words.setAttribute('aria-atomic', 'true');
  const enterCue = button('music-guide-enter', '下一幕', () => { if (!enterCue.hidden) advance(); });
  enterCue.hidden = true;
  const touchControls = element('div', 'music-guide-touch');
  const touchPlay = button('music-guide-touch-play', '播放 / 暂停', () => host.querySelector<HTMLButtonElement>('.song-play')?.click());
  touchPlay.hidden = !!factory.mobileWeb;
  let rightMode = false;
  const touchRight = factory.mobileWeb ? button('music-guide-touch-right', '右键', () => setRightMode(!rightMode)) : undefined;
  touchControls.append(touchPlay,
    button('', '下一步', () => { if (shown && !host.querySelector('dialog[open]')) advance(); }),
    button('', '退出引导', () => finish()));
  if (touchRight) {
    touchRight.setAttribute('aria-pressed', 'false');
    touchControls.append(touchRight);
  }
  shell.append(host, words, enterCue, touchControls); root.replaceChildren(shell);
  const suppressTitles = (node: Element) => {
    if (node.hasAttribute('title')) node.removeAttribute('title');
    node.querySelectorAll('[title]').forEach(child => child.removeAttribute('title'));
  };
  const tooltips = new MutationObserver(records => {
    for (const record of records) {
      if (record.type === 'attributes') (record.target as Element).removeAttribute('title');
      else for (const node of record.addedNodes) if (node instanceof Element) suppressTitles(node);
    }
  });
  tooltips.observe(host, { subtree: true, childList: true, attributes: true, attributeFilter: ['title'] });

  function setRightMode(enabled: boolean) {
    rightMode = enabled;
    touchRight?.setAttribute('aria-pressed', String(enabled));
  }
  function cueAfter(delay = enterDelayMs) {
    advanceTimer = window.setTimeout(() => { enterCue.hidden = false; }, delay);
  }
  function introduceNoteEdits(copy: HTMLElement) {
    let index = 0;
    const showPrompt = () => {
      const [action, text] = noteEditPrompts[index]!;
      const prompt = element('p', 'music-guide-prompt', text);
      prompt.dataset.guideAction = action;
      copy.replaceChildren(prompt);
    };
    showPrompt();
    return (action: LearningAction) => {
      if (noteEditPrompts[index]?.[0] !== action) return;
      index++;
      if (index < noteEditPrompts.length) showPrompt();
      else { copy.replaceChildren(); cueAfter(); }
    };
  }
  function introduceSubdivisions(copy: HTMLElement, nextLine: Element) {
    const scroll = host.querySelector<HTMLElement>('.melody-scroll');
    const grid = scroll?.querySelector<HTMLElement>('.melody-grid');
    if (!scroll || !grid || matchMedia('(prefers-reduced-motion: reduce)').matches) {
      copy.append(nextLine);
      return;
    }

    let frame = 0;
    const paint = (progress: number) => {
      const edge = scroll.scrollLeft + scroll.clientWidth * progress;
      grid.style.setProperty('--music-guide-subdivision-edge', `${edge}px`);
    };
    const stop = () => {
      cancelAnimationFrame(frame);
      grid.classList.remove('is-drawing-subdivisions');
      grid.style.removeProperty('--music-guide-subdivision-edge');
    };
    paint(0);
    grid.classList.add('is-drawing-subdivisions');
    const start = performance.now();
    function draw(now: number) {
      const progress = Math.max(0, (now - start) / 1000);
      if (progress >= 1) {
        stop();
        copy.append(nextLine);
        return;
      }
      paint(progress ** 2);
      frame = requestAnimationFrame(draw);
    }
    frame = requestAnimationFrame(draw);
    return stop;
  }
  function introduceTempo(heading: HTMLElement, copy: HTMLElement) {
    const tempoButton = host.querySelector<HTMLButtonElement>('.melody-tempo-button');
    const dock = tempoButton?.closest<HTMLElement>('.melody-tempo-dock');
    if (!tempoButton || !dock) return;
    const label = element('span', '', heading.textContent ?? '');
    const value = tempoButton.textContent ?? '';
    const digits = element('span', 'music-guide-tempo-digits', value);
    const tail = element('span', 'music-guide-tempo-tail');
    const tailText = element('span', 'music-guide-tempo-tail-text');
    tailText.append('=', digits); tail.append(tailText);
    heading.classList.add('music-guide-tempo-equation');
    heading.replaceChildren(label, tail);
    const tempoTip = copy.lastElementChild!;
    tempoTip.classList.add('music-guide-tempo-tip', 'music-guide-prompt');
    shell.classList.add('is-introducing-tempo');
    dock.inert = true;
    const onTempoClick = () => {
      if (dock.inert) return;
      tempoTip.classList.remove('music-guide-prompt');
      if (!advanceTimer) cueAfter();
    };
    tempoButton.addEventListener('click', onTempoClick);

    let flight: HTMLElement | undefined;
    let movement: Animation | undefined;
    let returnToCenter: Animation | undefined;
    let sweepFrame = 0, dockTimer = 0;
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const land = () => {
      window.removeEventListener('resize', land);
      flight?.remove();
      shell.classList.remove('is-introducing-tempo');
      dock.inert = false;
    };
    const fly = () => {
      const source = digits.getBoundingClientRect();
      const labelLeft = label.getBoundingClientRect().left;
      tail.remove();
      if (reducedMotion) { land(); return; }

      const target = tempoButton.getBoundingClientRect();
      const buttonStyle = getComputedStyle(tempoButton);
      const scale = parseFloat(buttonStyle.fontSize) / parseFloat(getComputedStyle(heading).fontSize);
      const dx = target.x + target.width / 2 - source.x - source.width / 2;
      const dy = target.y + target.height / 2 - source.y - source.height / 2;
      const titleDx = labelLeft - label.getBoundingClientRect().left;
      const timing: KeyframeAnimationOptions = { duration: 1400, easing: 'cubic-bezier(.22, .72, .26, 1)', fill: 'both' };
      returnToCenter = label.animate([
        { transform: `translateX(${titleDx}px)`, opacity: 1 },
        { transform: 'translateX(0)', opacity: .18 },
      ], timing);
      flight = element('span', 'music-guide-word music-guide-tempo-flight', value);
      flight.setAttribute('aria-hidden', 'true');
      flight.style.left = `${source.x}px`; flight.style.top = `${source.y}px`;
      shell.append(flight);
      movement = flight.animate([
        { transform: 'translate(0, 0) scale(1)' },
        { transform: `translate(${dx}px, ${dy}px) scale(${scale})`, color: buttonStyle.color },
      ], timing);
      window.addEventListener('resize', land, { once: true });
      void movement.finished.then(land, () => {});
    };
    const hold = window.setTimeout(() => {
      const start = performance.now();
      const ramp = 1800, plateau = 350, duration = 2 * ramp + plateau;
      const original = Number(value);
      let previous = original;
      function sweep(now: number) {
        const elapsed = Math.min(duration, now - start);
        const fraction = Math.min(1, elapsed / ramp, (duration - elapsed) / ramp);
        const progress = reducedMotion ? Number(fraction === 1) : (1 - Math.cos(Math.PI * fraction)) / 2;
        const tempo = original + 60 * progress;
        if (tempo !== previous) {
          previous = tempo;
          const text = String(Math.round(tempo));
          if (digits.textContent !== text) digits.textContent = text;
          editor?.previewTempoRate(tempo);
        }
        if (elapsed < duration) sweepFrame = requestAnimationFrame(sweep);
        else {
          editor?.previewTempoRate();
          dockTimer = window.setTimeout(fly, 450);
        }
      }
      sweepFrame = requestAnimationFrame(sweep);
    }, 2400);
    leaveTempoScene = () => {
      window.clearTimeout(hold);
      window.clearTimeout(dockTimer);
      cancelAnimationFrame(sweepFrame);
      tempoButton.removeEventListener('click', onTempoClick);
      editor?.previewTempoRate();
      movement?.cancel(); returnToCenter?.cancel();
      if (tempoButton.getAttribute('aria-expanded') === 'true') tempoButton.click();
      land();
    };
  }
  function mountEditor(document: MusicGuideDocument, sound: SoundRuntimePort) {
    function signature() {
      const view = document.phrase.read();
      return JSON.stringify([view.draft!.name, view.body]);
    }
    let savedSignature: string;
    function savePractice() {
      document.save();
      savedSignature = signature();
    }
    const hasUnsavedChanges = async () => signature() !== savedSignature;
    async function exitPractice() {
      let leaving = false;
      await showProjectExit(host, {
        hasUnsavedChanges,
        async exit(mode) {
          if (mode === 'save') savePractice();
          leaving = true;
        },
      });
      if (leaving) finish();
    }
    savePractice();
    const keys = document.phrase.keyboard();
    const rowHeight = Math.min(28, Math.max(12, host.clientWidth / 28));
    const c4 = melodyPitchTop(keys, phrasePitchRow(261.625565, keys), rowHeight);
    let workspace: MusicWorkspaceState = {
      viewport: { leftSeconds: 0, zoom: 2.25, top: Math.max(0, c4 - host.clientWidth * .26), rowHeight },
      showGridCells: true, orientation: 'vertical', playheadSeconds: 0, entryOctave: 4, noteLengths: {},
    };
    editor = mountPhraseComposition(host, {
      phrase: document.phrase, sound, directMusic: true,
      workspaceState: { read: () => workspace, write: next => { workspace = next; } },
      readMultipleTempoRolls: () => false,
      readLessonInput: () => step === 1 ? 'locked' : step < 6 ? 'pan' : step === 6 ? 'draw' : step < editStep ? 'zoom' : 'edit',
      mobileTouch: factory.mobileWeb ? { readRightButton: () => rightMode } : undefined,
      readLessonToolbar: () => step >= finalStep,
      listTimbres: document.listTimbres, onCreateNoteGroup: document.addGroup, onChangeNoteGroupTimbre: document.changeTone,
      onRename: document.rename, onSave: savePractice, readUnsavedChanges: hasUnsavedChanges,
      onExit: exitPractice,
      onLearningAction(action) {
        if (rightMode && (action === 'deselect' && shell.dataset.timbrePhase === 'deselect'
          || action === 'delete-note' && words.querySelector('[data-guide-action="delete-note"]'))) setRightMode(false);
        timbreScene?.action(action);
        noteEditAction?.(action);
      },
      onPlaybackAdvance() {
        if (step === 3 && !advanceTimer) {
          words.querySelector('.music-guide-prompt')?.classList.remove('music-guide-prompt');
          cueAfter();
        }
      },
    });
  }
  function showScene(next: number) {
    if (disposed) return;
    leaveTempoScene?.(); leaveTempoScene = undefined;
    leaveSubdivisionScene?.(); leaveSubdivisionScene = undefined;
    timbreScene?.dispose(); timbreScene = undefined;
    noteEditAction = undefined;
    window.clearTimeout(advanceTimer); advanceTimer = 0;
    enterCue.hidden = true;
    lastEnterAt = -Infinity;
    step = next;
    const scene = scenes[step - 1]!;
    shell.dataset.step = String(step);
    if (factory.mobileWeb) {
      touchPlay.hidden = step < 3;
      setRightMode(false);
    }
    if (step === 3 || step === 4 || step === editStep) editor?.frameNotes(step !== 3);
    host.querySelector<HTMLElement>('.song-topbar')?.toggleAttribute('inert', step < finalStep);
    host.querySelector<HTMLElement>('.melody-tempo-dock')?.toggleAttribute('inert', step < 5);
    host.querySelector<HTMLElement>('.melody-ruler-row')?.toggleAttribute('inert', step < 3);
    const heading = element('h2', 'music-guide-word', scene.title);
    const copy = element('div', 'music-guide-copy');
    copy.append(...scene.lines.map(line => element('p', '', line)));
    if (factory.mobileWeb && step === 7) copy.append(element('p', '', '手机端可以双指缩放'));
    const subdivisionTip = step === subdivisionStep ? copy.lastElementChild : null;
    subdivisionTip?.remove();
    if (step === 3) copy.lastElementChild?.classList.add('music-guide-prompt');
    words.replaceChildren(heading, copy);
    words.hidden = false;
    if (step === 5) introduceTempo(heading, copy);
    if (step === 6) timbreScene = introduceTimbres(shell, host, heading, copy, cueAfter);
    if (subdivisionTip) leaveSubdivisionScene = introduceSubdivisions(copy, subdivisionTip);
    if (step === editStep) noteEditAction = introduceNoteEdits(copy);
    if (scene.wait) cueAfter(scene.wait);
    shown = true;
  }
  function dispose() {
    if (disposed) return;
    disposed = true;
    leaveTempoScene?.();
    leaveSubdivisionScene?.();
    timbreScene?.dispose();
    cancelAnimationFrame(firstFrame);
    window.clearTimeout(sceneTimer);
    window.clearTimeout(advanceTimer);
    document.removeEventListener('keydown', key, true);
    tooltips.disconnect();
    editor?.dispose();
    void sound?.dispose();
    shell.remove();
  }
  function finish() { if (!disposed) { dispose(); onClose(); } }
  function advance() {
    if (step === finalStep) finish();
    else showScene(step + 1);
  }
  function key(event: KeyboardEvent) {
    if (event.defaultPrevented || event.isComposing || event.keyCode === 229 || event.altKey || event.ctrlKey || event.metaKey
      || host.querySelector('dialog[open]')) { lastEnterAt = -Infinity; return; }
    const target = event.target;
    if (target instanceof HTMLElement && (target.isContentEditable || target.closest('input, select, textarea')
      || target.closest('.music-guide-touch') && (event.key === 'Enter' || event.code === 'Space'))) { lastEnterAt = -Infinity; return; }
    if (event.key !== 'Enter' && !event.repeat) lastEnterAt = -Infinity;
    if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); finish(); return; }
    if (!shown) return;
    if (step >= 3 && step < finalStep && (event.code === 'Space' || event.key === ' ')) {
      event.preventDefault();
      if (!event.repeat) host.querySelector<HTMLButtonElement>('.song-play')?.click();
    } else if (event.key === 'Enter') {
      if (event.repeat) { event.preventDefault(); return; }
      const now = performance.now();
      const skip = now - lastEnterAt <= doubleEnterMs;
      lastEnterAt = now;
      if (!skip && enterCue.hidden && target instanceof Element && target.closest('.melody-tempo-button')) return;
      event.preventDefault();
      if (!skip && step !== 1 && enterCue.hidden) return;
      advance();
    }
  }

  document.addEventListener('keydown', key, true);
  firstFrame = requestAnimationFrame(() => {
    sceneTimer = window.setTimeout(() => {
      if (disposed) return;
      shell.dataset.step = '1';
      shell.classList.add('is-ready');
      try {
        sound = factory.createSound();
        const project = factory.createDocument('引导练习');
        seed(project);
        mountEditor(project, sound);
        sceneTimer = window.setTimeout(() => showScene(1), 220);
      } catch {
        finish();
      }
    }, 320);
  });
  return { dispose };
}
