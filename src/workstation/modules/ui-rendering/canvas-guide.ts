import type { LearningAction } from '../../contracts/guidance.ts';
import { paintGuideShape } from './welcome-guide.ts';
import './canvas-guide.css';

type Cue = 'space' | 'click' | 'drag-canvas' | 'drag-note' | 'seek' | 'erase' | 'wheel-pan' | 'wheel-duration' | 'wheel-click' | 'wheel-lock' | 'hum' | 'gain' | 'undo' | 'edge';
const cueByAction: Partial<Record<LearningAction, Cue>> = {
  'resume-space': 'space',
  'pause-space': 'space',
  'audition-pitch': 'click',
  pan: 'drag-canvas',
  'move-note': 'drag-note',
  'seek-right': 'seek',
  'erase-right': 'erase',
  'scroll-x': 'wheel-pan',
  'scroll-y': 'wheel-pan',
  'wheel-duration': 'wheel-duration',
  'highlight-scale': 'wheel-click',
  'highlight-column': 'wheel-lock',
  'hum-pitch': 'hum',
  'note-gain-key': 'gain',
  undo: 'undo',
};
const mouseGroups = {
  left: { title: '接下来讲解鼠标左键的作用', cues: [['click', '点击－可试听音调'], ['drag-canvas', '按住可拖动画布'], ['drag-note', '按住可拖动音符']] },
  right: { title: '右键的作用', cues: [['seek', '点击－召唤播放线'], ['erase', '长按－可擦除音符']] },
  wheel: { title: '滚轮', cues: [['wheel-pan', '画布上滑动－拖动画布'], ['wheel-duration', '音符上滑动－修改时长'], ['wheel-click', '点击－高亮若干列'], ['wheel-lock', 'Ctrl＋点击－锁定当前列高亮，再次操作取消']] },
} as const satisfies Record<string, { title: string; cues: readonly (readonly [Cue, string])[] }>;
type Stage = 'waiting' | 'intro' | 'space' | keyof typeof mouseGroups | 'keyboard' | 'edges' | 'done';
const edgeSteps = [
  { id: 'open-tones', text: '接下来是边缘功能', cue: '先试试鼠标快速滑到左边缘吧', edge: 'left', action: 'open-tones' },
  { id: 'select-tone', text: '哦，看来你打开了音色界面\n下方是音色卡，代表你正在使用的音色\n点击它们，来选中一个音色吧', target: '.melody-tone-hand', action: 'select-group' },
  { id: 'add-note', text: '你已选中{tone}音色\n此时可滑动滚轮来添加音符\n（但是这个时候不能滑动画布了）', cue: '添加一个音符', action: 'draw-note' },
  { id: 'deselect-tone', text: '鼠标快速滑到上边缘就可以解除选中', cue: '解除选中', edge: 'top', action: 'deselect-top' },
  { id: 'close-tones', text: '棒！现在再次滑动到左边缘\n来退出音色界面吧', cue: '向左边缘快速滑动', edge: 'left', action: 'close-tones' },
  { id: 'open-details', text: '接下来是右边缘', cue: '向右边缘快速滑动', edge: 'right', action: 'open-details' },
  { id: 'details', text: '你打开了详情页\n这里记载着这首歌曲的信息和设置', target: '.song-editor-controls' },
  { id: 'name', text: '这是名字，双击可修改', target: '.phrase-composition-title' },
  { id: 'files', text: '这是保存、另存为和退出键', target: '.song-editor-controls .song-file-actions' },
  { id: 'playback', text: '这里可以调节播放速度和音量', target: '.song-editor-controls .song-transport' },
  { id: 'bpm', text: '这是BPM，表示一分钟有多少拍\n在简乐里，它会改变画布上等距横线的疏密\n你可以有节奏地敲击空格键来确定它', target: '.melody-tempo-dock' },
  { id: 'beat-lines', text: '点击可以开关拍线\n按住拖动可以调整拍线位置', target: '.melody-grid-shift' },
  { id: 'multi-bpm', text: '歌曲不同部分需要不同的拍线间距时\n可以开启多 BPM', target: '.learning-roll-switch' },
] as const;
type EdgeStep = { id: string; text: string; cue?: string; edge?: 'left' | 'right' | 'top'; action?: LearningAction; target?: string };

export function createCanvasGuide(root: HTMLElement, options: {
  commitName?(): Promise<boolean>;
  setTempoOpen?(open: boolean): void;
  onComplete?(): Promise<void>;
} = {}) {
  const layer = document.createElement('aside');
  layer.className = 'canvas-guide';
  layer.setAttribute('role', 'status');
  const title = document.createElement('div');
  title.className = 'canvas-guide-title';
  const words = ['这就是', '画布', '和', '音符'].map(text => {
    const word = document.createElement('span');
    word.textContent = text;
    word.classList.toggle('is-key-word', text === '画布' || text === '音符');
    word.setAttribute('aria-hidden', 'true');
    title.append(word);
    return word;
  });
  const card = document.createElement('div');
  card.className = 'canvas-guide-card';
  card.hidden = true;
  const shape = document.createElement('canvas');
  shape.width = 720;
  shape.height = 240;
  shape.setAttribute('aria-hidden', 'true');
  const message = document.createElement('div');
  message.className = 'canvas-guide-message';
  const continuation = document.createElement('span');
  continuation.className = 'canvas-guide-continue';
  continuation.hidden = true;
  const hints = document.createElement('div');
  hints.className = 'canvas-guide-hints';
  card.append(shape, message, continuation);
  const spotlight = document.createElement('div');
  spotlight.className = 'canvas-guide-spotlight';
  spotlight.hidden = true;
  const edgeHint = document.createElement('div');
  edgeHint.className = 'pointer-edge-hints canvas-guide-edge-hint';
  edgeHint.hidden = true;
  edgeHint.setAttribute('aria-hidden', 'true');
  const edgeBand = document.createElement('i');
  edgeHint.append(edgeBand);
  layer.append(spotlight, edgeHint, title, card, hints);
  const context = shape.getContext('2d');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const branches = new Map<Cue, HTMLElement>();
  let stage: Stage = 'waiting';
  let timer = 0, frame = 0;
  let escaped = false;
  let edgeIndex = -1, changing = false;
  let selectedTone = '';
  let positionFrame = 0;
  let observedTarget: HTMLElement | undefined;
  const observer = new ResizeObserver(() => positionStep());
  const edgeStep = (): EdgeStep | undefined => stage === 'edges' ? edgeSteps[edgeIndex] : undefined;

  function after(ms: number, action: () => void): void {
    window.clearTimeout(timer);
    timer = window.setTimeout(action, ms);
  }
  function paint(time: number): void {
    if (!context) return;
    paintGuideShape(context, time, true, reduceMotion.matches, true);
    if (!reduceMotion.matches) frame = requestAnimationFrame(paint);
  }
  function addCue(cue: Cue, ...content: (Node | string)[]): void {
    const branch = document.createElement('div');
    branch.className = 'canvas-guide-branch';
    branch.dataset.cue = cue;
    const label = document.createElement('span');
    label.append(...content);
    branch.append(label);
    hints.append(branch);
    branches.set(cue, branch);
  }
  function remove(): void {
    if (edgeStep()?.id === 'bpm') options.setTempoOpen?.(false);
    stage = 'done';
    window.clearTimeout(timer);
    cancelAnimationFrame(frame);
    delete root.dataset.canvasGuideEmphasis;
    layer.remove();
    branches.clear();
    observer.disconnect();
    cancelAnimationFrame(positionFrame);
    delete root.dataset.canvasGuideStep;
    for (const type of inputEvents) window.removeEventListener(type, restrictInput, true);
    window.removeEventListener('resize', positionStep);
  }
  function escape(event: KeyboardEvent): void {
    if (event.key !== 'Escape' || event.isComposing) return;
    if (!event.repeat) escaped = stage !== 'done';
    if (stage === 'done' && !escaped) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    remove();
  }
  document.addEventListener('keydown', escape, true);

  const inputEvents = ['pointerdown', 'pointerup', 'mousedown', 'mouseup', 'click', 'dblclick', 'contextmenu', 'wheel', 'keydown', 'keyup', 'dragstart', 'drop'] as const;
  function restrictInput(event: Event): void {
    const step = edgeStep();
    if (!step) return;
    if (event instanceof KeyboardEvent && event.key === 'Escape') return;
    const target = event.target instanceof Element ? event.target : undefined;
    const guideClick = target && card.contains(target);
    let allowed = !changing && !step.action && guideClick;
    if (!changing && step.id === 'name' && target?.closest('.song-project-name')) {
      allowed = !['dragstart', 'drop', 'contextmenu', 'wheel'].includes(event.type);
    }
    if (!changing && step.id === 'bpm') {
      allowed ||= !!target?.closest('.melody-tempo-panel, .melody-tempo-button')
        || event instanceof KeyboardEvent && (event.code === 'Space' || event.key === ' ');
    }
    if (event instanceof KeyboardEvent && (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') allowed = false;
    if (!changing && step.id === 'select-tone') {
      const tone = target?.closest('.melody-note-family');
      allowed = !!tone && !!root.querySelector('.melody-tone-hand')?.contains(tone) && /^(pointer|mouse|click)/.test(event.type)
        && (!(event instanceof MouseEvent) || event.button === 0);
    }
    if (!changing && step.id === 'add-note') allowed = event.type === 'wheel' && !!target?.closest('.melody-canvas');
    if (allowed) return;
    if (event.cancelable) event.preventDefault();
    event.stopImmediatePropagation();
  }
  for (const type of inputEvents) window.addEventListener(type, restrictInput, { capture: true, passive: false });
  window.addEventListener('resize', positionStep);
  function positionStep(): void {
    const step = edgeStep();
    if (!step) return;
    const target = step.target ? root.querySelector<HTMLElement>(step.target) ?? undefined : undefined;
    if (target !== observedTarget) {
      observer.disconnect();
      observedTarget = target;
      if (target) observer.observe(target);
    }
    let bounds = target?.getBoundingClientRect();
    const focusSelector = step.id === 'select-tone' ? '.melody-tone-hand .melody-tone-entry:not(.is-hand-hidden)'
      : step.id === 'bpm' ? '.melody-tempo-button, .melody-tempo-panel:not([hidden])' : undefined;
    if (focusSelector) {
      const cards = [...root.querySelectorAll(focusSelector)]
        .map(card => card.getBoundingClientRect()).filter(rect => rect.width > 0);
      if (cards.length) {
        const left = Math.min(...cards.map(card => card.left)), top = Math.min(...cards.map(card => card.top));
        bounds = new DOMRect(left, top, Math.max(...cards.map(card => card.right)) - left, Math.max(...cards.map(card => card.bottom)) - top);
      }
    }
    const box = bounds;
    const active = box && box.width > 0 && box.height > 0;
    spotlight.style.left = `${active ? Math.max(0, box.left - 10) : 0}px`;
    spotlight.style.top = `${active ? Math.max(0, box.top - 10) : 0}px`;
    spotlight.style.width = `${active ? box.width + 20 : window.innerWidth}px`;
    spotlight.style.height = `${active ? box.height + 20 : window.innerHeight}px`;
    spotlight.classList.toggle('is-whole-screen', !active);
    spotlight.hidden = step.id === 'add-note' || step.id === 'deselect-tone' || step.id === 'close-tones';
    layer.classList.toggle('has-dim-background', !spotlight.hidden);
    layer.style.setProperty('--guide-center-x', `${step.target && edgeIndex >= 6 ? 27 : 50}%`);
    layer.style.setProperty('--guide-card-top', step.id === 'select-tone' ? '24vh' : edgeIndex >= 6 ? '33vh' : '12vh');
    if (box && active && edgeIndex > 6 && box.left < 480) {
      layer.style.setProperty('--guide-center-x', '50%');
      layer.style.setProperty('--guide-card-top', `${Math.max(16, box.top - card.getBoundingClientRect().height - 24)}px`);
    }
    edgeHint.hidden = !step.edge || step.edge === 'top';
    if (step.edge) {
      edgeBand.dataset.edge = step.edge;
      edgeBand.style.setProperty('--edge-hint-color', step.edge === 'left' ? '#78cafff2' : '#cca5fff2');
      const pile = root.querySelector('.melody-tone-pile')?.getBoundingClientRect();
      edgeBand.style.setProperty('--edge-hint-length', `${pile?.top ?? window.innerHeight * .75}px`);
    }
  }
  function showEdgeStep(): void {
    const next = edgeIndex + 1;
    const step = edgeSteps[next] as EdgeStep | undefined;
    if (!step) {
      if (!options.onComplete) { remove(); return; }
      void options.onComplete().then(() => { if (stage !== 'done') remove(); }).catch(error => {
        if (stage === 'done') return;
        changing = false;
        message.textContent = error instanceof Error ? error.message : String(error);
        layer.classList.remove('is-changing');
      });
      return;
    }
    edgeIndex = next;
    beginGroup('edges', step.text.replace('{tone}', selectedTone));
    if (step.id === 'bpm') {
      const [before, after] = message.textContent!.split('有节奏');
      const emphasis = document.createElement('span');
      emphasis.className = 'canvas-guide-rhythm-word';
      emphasis.textContent = '有节奏';
      message.replaceChildren(before!, emphasis, after!);
      options.setTempoOpen?.(true);
    }
    root.dataset.canvasGuideStep = step.id;
    layer.dataset.step = step.id;
    layer.classList.toggle('is-readable', !step.action);
    continuation.hidden = !!step.action;
    continuation.textContent = edgeIndex === edgeSteps.length - 1 ? '点击结束' : '点击继续 →';
    if (step.action) { card.removeAttribute('role'); card.removeAttribute('tabindex'); }
    else { card.setAttribute('role', 'button'); card.tabIndex = 0; }
    if (step.cue) addCue('edge', step.cue);
    positionStep();
    positionFrame = requestAnimationFrame(positionStep);
  }
  async function nextEdgeStep(): Promise<void> {
    if (changing) return;
    changing = true;
    if (edgeStep()?.action) { switchGroup(showEdgeStep); return; }
    card.animate?.([{ transform: 'scale(1)' }, { transform: 'scale(.98)', offset: .35 }, { transform: 'scale(1)' }], { duration: 180, easing: 'ease-out' });
    if (edgeStep()?.id === 'name' && options.commitName) {
      const saved = await options.commitName();
      if (stage !== 'edges') return;
      if (!saved) { changing = false; return; }
    }
    if (edgeStep()?.id === 'bpm') options.setTempoOpen?.(false);
    layer.classList.add('is-changing');
    after(reduceMotion.matches ? 0 : 300, showEdgeStep);
  }
  card.addEventListener('click', () => { if (edgeStep() && !edgeStep()!.action && !changing) void nextEdgeStep(); });
  card.addEventListener('keydown', event => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    event.stopPropagation();
    if (!event.repeat && edgeStep() && !edgeStep()!.action && !changing) void nextEdgeStep();
  });

  function showSpace(): void {
    stage = 'space';
    const key = document.createElement('kbd');
    key.className = 'canvas-guide-key';
    key.setAttribute('aria-hidden', 'true');
    addCue('space', '按下空格键', key, '可以播放/暂停');
  }
  function beginGroup(next: Stage, title: string): void {
    branches.clear();
    hints.replaceChildren();
    stage = next;
    changing = false;
    message.textContent = title;
    layer.classList.remove('is-changing');
  }
  function showMouse(): void {
    const next = stage === 'right' ? 'wheel' : stage === 'left' ? 'right' : 'left';
    const group = mouseGroups[next];
    beginGroup(next, group.title);
    for (const [cue, label] of group.cues) addCue(cue, label);
  }
  function keycap(text: string, name = text): HTMLElement {
    const element = document.createElement('kbd');
    element.className = 'canvas-guide-keycap';
    element.textContent = text;
    element.setAttribute('aria-label', name);
    return element;
  }
  function showKeyboard(): void {
    beginGroup('keyboard', '接下来是一些键盘键位');
    addCue('hum', '左 Alt 键－长按并哼唱可识别高亮对应音调');
    addCue('gain', '方向键', keycap('↑', '上'), keycap('↓', '下'), '－调节你上一个操作过的音符的音量');
    addCue('undo', '回退键', keycap('⌫', '回退'), '／', keycap('Ctrl'), '+', keycap('Z'), '－撤销上一步修改');
  }
  function switchGroup(next: () => void): void {
    after(2000, () => {
      layer.classList.add('is-changing');
      after(reduceMotion.matches ? 0 : 350, next);
    });
  }
  function shrinkTitle(): void {
    card.hidden = false;
    paint(performance.now());
    const from = title.getBoundingClientRect(), to = card.getBoundingClientRect();
    const x = to.left + to.width / 2 - from.left - from.width / 2;
    const y = to.top + to.height / 2 - from.top - from.height / 2;
    const duration = reduceMotion.matches ? 0 : 850;
    message.textContent = '这就是画布和音符';
    message.animate([{ opacity: 0 }, { opacity: 0, offset: .68 }, { opacity: 1 }],
      { duration, easing: 'ease-out' });
    title.animate([{ transform: 'none', opacity: .76 },
      { transform: `translate(${x}px, ${y}px) scale(.23)`, opacity: 0 }],
    { duration, easing: 'cubic-bezier(.22,.72,.22,1)', fill: 'forwards' });
    after(duration, () => {
      title.remove();
      root.dataset.canvasGuideEmphasis = 'restore';
      after(300, showSpace);
    });
  }
  function revealWord(index: number): void {
    words[index]!.removeAttribute('aria-hidden');
    if (index === 1) root.dataset.canvasGuideEmphasis = 'canvas';
    if (index === 3) root.dataset.canvasGuideEmphasis = 'notes';
    if (index + 1 === words.length) after(1400, shrinkTitle);
    else after(index === 1 ? 1200 : 550, () => revealWord(index + 1));
  }
  function complete(cue: Cue): boolean {
    const branch = branches.get(cue);
    if (!branch || branch.classList.contains('is-complete')) return false;
    branch.classList.add('is-complete');
    return true;
  }
  return {
    blocksSideEdges(side: 'left' | 'right' | 'top'): boolean {
      return stage !== 'done' && (changing || edgeStep()?.edge !== side);
    },
    ready(): void {
      if (stage !== 'waiting') return;
      stage = 'intro';
      root.append(layer);
      after(1000, () => {
        root.dataset.canvasGuideEmphasis = 'dim';
        revealWord(0);
      });
    },
    action(action: LearningAction): void {
      if (stage === 'edges') {
        if (changing || edgeStep()?.action !== action) return;
        if (action === 'select-group') selectedTone = root.querySelector('.melody-selected-tone-name')?.textContent ?? '';
        complete('edge');
        void nextEdgeStep();
        return;
      }
      const cue = cueByAction[action];
      if (cue && complete(cue) && [...branches.values()].every(branch => branch.classList.contains('is-complete'))) {
        changing = true;
        switchGroup(stage === 'keyboard' ? showEdgeStep : stage === 'wheel' ? showKeyboard : showMouse);
      }
    },
    dispose(): void {
      document.removeEventListener('keydown', escape, true);
      remove();
    },
  };
}
