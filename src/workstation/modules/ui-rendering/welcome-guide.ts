import './welcome-guide.css';
import type { ProjectDirectory, ProjectLibraryEntry } from '../../contracts/project-directory.ts';

type Point = [number, number];
const signs = [-1, 1];
const phi = (1 + Math.sqrt(5)) / 2;
const dodecahedron = signs.flatMap(a => signs.flatMap(b => [
  [a, b, -1], [a, b, 1], [0, a / phi, b * phi], [b * phi, 0, a / phi], [a / phi, b * phi, 0],
]));
const icosahedron = signs.flatMap(a => signs.flatMap(b => [
  [0, a, b * phi], [a, b * phi, 0], [b * phi, 0, a],
]));
const invitationKey = 'rootsound.welcome-guide-invited.v1';
const canvasKey = 'rootsound.welcome-guide-canvas.v1';
const demoFolder = '演示项目';
const demoTitle = '初次创作';
const demoKey = 'rootsound.welcome-guide-project.v1';
const completionKey = 'rootsound.welcome-guide-complete.v1';

export function rememberGuideProject(project: ProjectDirectory): void {
  localStorage.setItem(demoKey, JSON.stringify({ id: project.id, name: project.name }));
}
export function markGuideCompletion(complete: boolean): void {
  if (complete) sessionStorage.setItem(completionKey, 'true');
  else sessionStorage.removeItem(completionKey);
}
export async function returnGuideToWelcome(root: HTMLElement, leave: () => Promise<void>): Promise<void> {
  const cover = document.createElement('div');
  cover.className = 'guide-return-transition';
  cover.setAttribute('aria-hidden', 'true');
  document.body.append(cover);
  const wasInert = root.inert;
  root.inert = true;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fade = async (from: number, to: number) => {
    cover.style.opacity = String(to);
    if (reduced || typeof cover.animate !== 'function') return;
    await cover.animate([{ opacity: from }, { opacity: to }], { duration: 400, easing: 'ease-in-out' }).finished;
  };
  try {
    await fade(0, 1);
    markGuideCompletion(true);
    await leave();
    await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
    await fade(1, 0);
    root.inert = wasInert;
    cover.remove();
    document.dispatchEvent(new Event('rootsound-guide-returned'));
  } catch (error) {
    markGuideCompletion(false);
    root.inert = wasInert;
    cover.remove();
    throw error;
  }
}

export type WelcomeLibraryGuide = {
  enterLibrary(): boolean;
  target(entries: readonly ProjectLibraryEntry[], directory: string | undefined, loading: boolean): string | null | undefined;
  complete(): void;
  prepareCanvas(): () => void;
};

export function takeCanvasGuide(): boolean {
  const pending = sessionStorage.getItem(canvasKey) === 'true';
  sessionStorage.removeItem(canvasKey);
  return pending;
}

function halfHull(points: Point[]): Point[] {
  const hull: Point[] = [];
  for (const point of points) {
    while (hull.length >= 2) {
      const [ax, ay] = hull[hull.length - 2]!;
      const [bx, by] = hull[hull.length - 1]!;
      if ((bx - ax) * (point[1] - ay) - (by - ay) * (point[0] - ax) > 0) break;
      hull.pop();
    }
    hull.push(point);
  }
  return hull.slice(0, -1);
}

export function paintGuideShape(context: CanvasRenderingContext2D, time: number, wide: boolean, still: boolean, forCanvas = false): void {
  const { width, height } = context.canvas;
  const angle = still ? .4 : time * Math.PI / (wide ? 6700 : 4600);
  const cos = Math.cos(angle), sin = Math.sin(angle);
  const tilt = wide ? .58 : .24;
  const roll = wide ? .55 : 0;
  const rollCos = Math.cos(roll), rollSin = Math.sin(roll);
  const points = (forCanvas ? icosahedron : dodecahedron).map(([x, y, z]): Point => {
    const side = x! * rollCos - y! * rollSin;
    const upright = x! * rollSin + y! * rollCos;
    const horizontal = side * cos + z! * sin;
    const depth = z! * cos - side * sin;
    return [width / 2 + horizontal * width * .257,
      height / 2 + (upright * Math.cos(tilt) - depth * Math.sin(tilt)) * height * .257];
  });
  points.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const contour = halfHull(points).concat(halfHull(points.reverse()));
  context.clearRect(0, 0, width, height);
  context.beginPath();
  context.moveTo(...contour[0]!);
  for (const point of contour.slice(1)) context.lineTo(...point);
  context.closePath();
  context.fillStyle = wide ? '#e9e8ec' : '#f5e9f3';
  context.strokeStyle = wide ? '#8b8593' : '#a5759a';
  context.lineWidth = 2.7;
  context.fill();
  context.stroke();
}

export function mountWelcomeGuide(root: HTMLElement, welcome: HTMLElement, refreshLibrary: () => void): WelcomeLibraryGuide & { dispose(): void } {
  const introduction = welcome.querySelector<HTMLElement>('.project-welcome-introduction')!;
  const hint = document.createElement('p');
  hint.className = 'welcome-guide-edge-hint';
  hint.textContent = '试试向边缘滑动鼠标吧';
  hint.hidden = true;
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'welcome-guide-launch';
  const shape = document.createElement('canvas');
  shape.width = shape.height = 144;
  shape.setAttribute('aria-hidden', 'true');
  const label = document.createElement('span');
  label.textContent = '引导';
  button.append(shape, label);
  introduction.append(hint, button);
  const panel = document.createElement('aside');
  panel.className = 'welcome-guide-panel';
  panel.hidden = true;
  panel.setAttribute('role', 'status');
  const panelShape = document.createElement('canvas');
  panelShape.width = 720;
  panelShape.height = 240;
  panelShape.setAttribute('aria-hidden', 'true');
  const message = document.createElement('div');
  message.className = 'welcome-guide-message';
  panel.append(panelShape, message);
  root.append(panel);
  const edgeHint = document.createElement('div');
  edgeHint.className = 'pointer-edge-hints welcome-guide-edges';
  edgeHint.hidden = true;
  edgeHint.setAttribute('aria-hidden', 'true');
  for (const side of ['left', 'right', 'top', 'bottom']) {
    const band = document.createElement('i');
    band.dataset.edge = side;
    band.style.setProperty('--edge-hint-color', '#85bcecb8');
    edgeHint.append(band);
  }
  root.append(edgeHint);
  const buttonContext = shape.getContext('2d');
  const panelContext = panelShape.getContext('2d');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let frame = 0, timer = 0, libraryOpen = false;
  let step: 'welcome' | 'library' | 'complete' | undefined;
  let escapedGuide = false;

  function animate(time: number): void {
    if (!libraryOpen && buttonContext) paintGuideShape(buttonContext, time, false, reducedMotion.matches);
    if (step && panelContext) paintGuideShape(panelContext, time, true, reducedMotion.matches);
    if (!reducedMotion.matches && ((!libraryOpen && buttonContext) || (step && panelContext))) frame = requestAnimationFrame(animate);
  }
  function syncMotion(): void {
    cancelAnimationFrame(frame);
    animate(performance.now());
  }
  function startHint(): void {
    window.clearTimeout(timer);
    hint.hidden = true;
    if (!libraryOpen) timer = window.setTimeout(() => { hint.hidden = false; }, 7000);
  }
  const observer = new MutationObserver(() => {
    const open = welcome.classList.contains('is-library-open');
    if (libraryOpen === open) return;
    libraryOpen = open;
    startHint();
    syncMotion();
  });
  observer.observe(welcome, { attributeFilter: ['class'] });
  reducedMotion.addEventListener('change', syncMotion);
  startHint();
  syncMotion();

  const dialog = document.createElement('dialog');
  dialog.className = 'welcome-guide-dialog';
  dialog.setAttribute('aria-label', '引导');
  const actions = document.createElement('div');
  actions.className = 'welcome-guide-dialog-actions';
  function control(text: string, run: () => void, primary = false): HTMLButtonElement {
    const item = document.createElement('button');
    item.type = 'button';
    item.textContent = text;
    item.classList.toggle('is-primary', primary);
    item.addEventListener('click', run);
    return item;
  }
  function showGuide(): void {
    if (dialog.open) dialog.close();
    step = 'welcome';
    edgeHint.hidden = false;
    welcome.classList.add('is-guided-welcome');
    panel.hidden = false;
    panel.dataset.step = step;
    panel.setAttribute('role', 'status');
    panel.removeAttribute('tabindex');
    const title = document.createElement('strong');
    title.textContent = '来打开一首乐曲吧';
    const instruction = document.createElement('span');
    const mouse = document.createElement('i');
    mouse.className = 'welcome-guide-mouse';
    mouse.setAttribute('aria-hidden', 'true');
    instruction.append(mouse, '滑动到边缘');
    message.replaceChildren(title, instruction);
    syncMotion();
  }
  function finish(): void {
    step = undefined;
    panel.hidden = true;
    edgeHint.hidden = true;
    welcome.classList.remove('is-guided-welcome');
    syncMotion();
  }
  function completeWelcome(): void {
    markGuideCompletion(false);
    step = 'complete';
    welcome.classList.add('is-guided-welcome');
    panel.hidden = false;
    panel.dataset.step = step;
    panel.setAttribute('role', 'status');
    panel.removeAttribute('tabindex');
    const title = document.createElement('strong');
    title.textContent = '您已阅读完引导';
    message.replaceChildren(title);
    syncMotion();
  }
  const dismissCompletion = () => { if (step === 'complete') finish(); };
  const completionInputs = ['pointerdown', 'click', 'keydown', 'wheel'] as const;
  for (const type of completionInputs) window.addEventListener(type, dismissCompletion, { capture: true, passive: true });
  document.addEventListener('rootsound-guide-returned', completeWelcome);
  function escape(event: KeyboardEvent): void {
    if (event.key !== 'Escape' || event.isComposing) return;
    if (!event.repeat) escapedGuide = !!step;
    if (!step && !escapedGuide) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if (!step) return;
    sessionStorage.removeItem(canvasKey);
    const inLibrary = step === 'library';
    finish();
    if (inLibrary) refreshLibrary();
  }
  document.addEventListener('keydown', escape, true);
  function pointerLayer(layer: HTMLDialogElement | null): void {
    document.dispatchEvent(new CustomEvent('rootsound-round-pointer-layer', { detail: layer }));
  }
  function open(): void {
    if (!dialog.open) dialog.showModal();
    pointerLayer(dialog);
  }
  dialog.addEventListener('close', () => {
    if (dialog.isConnected && !dialog.open) pointerLayer(null);
  });
  dialog.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || event.isComposing || !dialog.open) return;
    event.preventDefault();
    event.stopPropagation();
    dialog.close();
  });
  root.append(dialog);
  button.addEventListener('click', showGuide);
  if (localStorage.getItem(invitationKey) === null) {
    localStorage.setItem(invitationKey, 'true');
    const question = document.createElement('p');
    question.textContent = '看起来是新客户呢，您愿意观看引导吗？';
    dialog.setAttribute('aria-label', question.textContent);
    actions.append(control('跳过', () => dialog.close()), control('想（推荐）', showGuide, true));
    dialog.append(question, actions);
    open();
  }
  if (sessionStorage.getItem(completionKey) === 'true' && !document.querySelector('.guide-return-transition')) completeWelcome();
  return {
    enterLibrary() {
      if (step !== 'welcome') return false;
      step = 'library';
      edgeHint.hidden = true;
      panel.dataset.step = step;
      message.textContent = `这次先打开《${demoTitle}》这首音乐吧`;
      return true;
    },
    target(entries, directory, loading) {
      if (step !== 'library') return undefined;
      if (loading) return null;
      const inDemoFolder = directory?.split(/[/\\]/u).filter(Boolean).at(-1) === demoFolder;
      let rememberedId: string | undefined;
      try { rememberedId = JSON.parse(localStorage.getItem(demoKey) ?? 'null')?.id; } catch {}
      const entry = inDemoFolder
        ? entries.find(item => item.kind === 'project' && item.id === rememberedId)
          ?? entries.find(item => item.kind !== 'folder' && item.path.split(/[/\\]/u).at(-1)?.toLowerCase() === `${demoTitle}.rootsound`.toLowerCase())
        : entries.find(item => item.kind === 'folder' && item.name === demoFolder);
      if (entry) {
        if (inDemoFolder) {
          message.textContent = `这次先打开《${entry.name.replace(/\.rootsound$/iu, '')}》这首音乐吧`;
          if (entry.kind === 'project') rememberGuideProject(entry);
        }
        return entry.path;
      }
      finish();
      return undefined;
    },
    complete: finish,
    prepareCanvas() {
      sessionStorage.setItem(canvasKey, 'true');
      return () => sessionStorage.removeItem(canvasKey);
    },
    dispose() {
      observer.disconnect();
      document.removeEventListener('keydown', escape, true);
      for (const type of completionInputs) window.removeEventListener(type, dismissCompletion, true);
      document.removeEventListener('rootsound-guide-returned', completeWelcome);
      reducedMotion.removeEventListener('change', syncMotion);
      window.clearTimeout(timer);
      cancelAnimationFrame(frame);
      if (dialog.open) {
        dialog.close();
        pointerLayer(null);
      }
      dialog.remove();
      panel.remove();
      edgeHint.remove();
    },
  };
}
