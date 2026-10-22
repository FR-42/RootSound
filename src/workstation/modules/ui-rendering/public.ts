import type { SoundRuntimePort } from '../../contracts/sound.ts';
import type { SaveConfirmation, SaveResult } from '../../contracts/content.ts';
import type { TimbreBody, TimbreEditorPort } from '../../contracts/timbre.ts';
import './studio.css';

export interface StudioOptions {
  timbre: TimbreEditorPort;
  sound: SoundRuntimePort;
  hasPrevious: boolean;
}

const svgNS = 'http://www.w3.org/2000/svg';
const playIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8 5 11 7-11 7z" fill="currentColor"/></svg>';
function element<K extends keyof HTMLElementTagNameMap>(tag: K, className = '', text = ''): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  node.className = className;
  node.textContent = text;
  return node;
}
function button(text: string, className: string, action: () => void): HTMLButtonElement {
  const node = element('button', className, text);
  node.type = 'button';
  node.addEventListener('click', action);
  return node;
}

/** Rendering owns DOM and pointer feedback; musical mutations use the domain port. */
export function mountStudio(root: HTMLElement, options: StudioOptions): { dispose(): void } {
  const { timbre, sound } = options;
  let playing: string | undefined;
  let pending = false;
  let disposed = false;
  let notice: HTMLElement | undefined;
  let previewButton: HTMLButtonElement | undefined;
  let endDrag: (() => void) | undefined;
  let unsubscribe: (() => void) | undefined;

  function report(message: string, error = false): void {
    if (notice) { notice.textContent = message; notice.classList.toggle('is-error', error); }
  }
  function safely(action: () => void): void {
    try { action(); } catch (error) {
      // Reload the authoritative draft so rejected edits cannot remain on screen.
      try { showEditor(); } catch { /* Keep the last visible error surface. */ }
      report(error instanceof Error ? error.message : String(error), true);
    }
  }
  function showWelcome(): void {
    root.replaceChildren();
    const page = element('main', 'welcome');
    page.append(element('div', 'wordmark', 'RootSound'));
    const invitation = element('section', 'invitation');
    invitation.append(element('p', 'eyebrow', '每个声音，都可以是一个开始'), element('h1', '', '你好，\n你想创作什么？'));
    invitation.append(element('p', 'welcome-description', '让心里的声音，慢慢有了模样。'));
    invitation.append(button('开始旅途  ↗', 'primary journey', showEditor));
    if (options.hasPrevious) invitation.append(button('继续创作', 'quiet continue', showEditor));
    page.append(invitation);
    page.append(button('直接进入创作  →', 'quiet skip', showEditor));
    page.append(element('span', 'welcome-footer', '从一个声音，到无限可能。'));
    root.append(page);
  }

  async function audition(): Promise<void> {
    if (pending) return;
    if (playing) { sound.stop(playing); return; }
    pending = true;
    if (previewButton) previewButton.disabled = true;
    report('正在准备声音…');
    try {
      const session = await sound.preview(timbre.previewPlan());
      if (disposed) { sound.stop(session.id); return; }
      playing = session.status === 'playing' ? session.id : undefined;
    } catch (error) { report(error instanceof Error ? error.message : String(error), true); }
    finally { pending = false; if (previewButton) previewButton.disabled = false; updatePlayback(); }
  }
  function updatePlayback(): void {
    if (!previewButton) return;
    previewButton.innerHTML = playing ? '<span aria-hidden="true">■</span> 停止' : `${playIcon} 听听看`;
    previewButton.classList.toggle('is-playing', !!playing);
    previewButton.setAttribute('aria-label', playing ? '停止试听' : '试听当前声音');
  }
  function save(mode: 'overwrite' | 'new', confirmation?: SaveConfirmation): void {
    safely(() => {
      const result = timbre.save(mode, confirmation);
      if (result.status === 'saved') { showEditor(); report(`“${result.content.name}”已保存，可以随时回来继续。`); }
      else if (result.status === 'needs-confirmation') showSaveChoice(result);
      else report(result.status === 'conflict' ? result.reason : result.message, true);
    });
  }
  function showSaveChoice(result: Extract<SaveResult, { status: 'needs-confirmation' }>): void {
    const modal = element('dialog', 'save-dialog');
    modal.append(element('h2', '', '这个声音正在被使用'));
    modal.append(element('p', '', '覆盖后，以下内容会使用修改后的声音：'));
    const list = element('ul');
    for (const content of result.affectedContent) list.append(element('li', '', content.name));
    modal.append(list);
    const actions = element('div', 'dialog-actions');
    const close = () => { modal.close(); modal.remove(); };
    actions.append(button('返回编辑', 'secondary', close), button('保存为新声音', 'secondary', () => { close(); save('new'); }),
      button('确认覆盖', 'primary', () => { close(); save('overwrite', result.confirmation); }));
    modal.append(actions);
    modal.addEventListener('cancel', () => modal.remove(), { once: true });
    root.append(modal);
    modal.showModal();
  }
  function showLibrary(): void {
    const modal = element('dialog', 'library-dialog');
    const heading = element('div', 'library-heading');
    heading.append(element('h2', '', '我的声音'), button('关闭', 'quiet', () => modal.close()));
    modal.append(heading);
    const view = timbre.read();
    const sounds = view.savedSounds;
    if (view.unfinishedDrafts.length) {
      modal.append(element('p', 'control-caption', '继续未完成的编辑'));
      for (const draft of view.unfinishedDrafts) modal.append(button(draft.name + ' · 编辑稿  ↗', 'library-sound', () => safely(() => {
        sound.stopAll(); timbre.openDraft(draft.id); modal.close(); showEditor();
      })));
    }
    if (!sounds.length) modal.append(element('p', 'muted', '保存后的声音也会出现在这里。'));
    else modal.append(element('p', 'control-caption library-group', '已保存的声音'));
    for (const content of sounds) modal.append(button(content.name + '  ↗', 'library-sound', () => safely(() => {
      sound.stopAll(); timbre.open(content.id); modal.close(); showEditor();
    })));
    modal.addEventListener('close', () => modal.remove(), { once: true });
    root.append(modal);
    modal.showModal();
  }

  function showEditor(): void {
    endDrag?.(); endDrag = undefined;
    const view = timbre.read();
    root.replaceChildren();
    const page = element('div', 'studio');
    const toolbar = element('header', 'studio-toolbar');
    const brand = button('RootSound', 'wordmark brand-button', () => { sound.stopAll(); showWelcome(); });
    brand.setAttribute('aria-label', '回到欢迎页');
    const section = element('span', 'toolbar-section', '声音创作');
    const tools = element('nav', 'toolbar-tools');
    tools.setAttribute('aria-label', '创作工具栏');
    tools.append(button('新建声音', 'quiet', () => safely(() => { sound.stopAll(); timbre.create(); showEditor(); })),
      button('我的声音', 'quiet', showLibrary));
    toolbar.append(brand, section, tools);

    const main = element('main', 'sound-workspace');
    const intro = element('div', 'workspace-intro');
    intro.append(element('p', 'eyebrow', '从一个声音开始'), element('h1', '', '让它，接近你的想象。'),
      element('p', 'muted', '选一种感觉，动手改变，再听听看。'));
    main.append(intro);

    const card = element('section', 'sound-card');
    card.setAttribute('aria-label', '当前声音');
    const cardHeader = element('div', 'sound-card-header');
    const titleGroup = element('div');
    const name = element('input', 'sound-name');
    name.value = view.draft.name;
    name.maxLength = 100;
    name.setAttribute('aria-label', '声音名称');
    name.addEventListener('change', () => safely(() => { timbre.rename(name.value); refreshSavedState(); }));
    const saveState = element('p', 'save-state', view.changed ? '编辑稿已保留' : '已保存');
    titleGroup.append(name, saveState);
    previewButton = button('', 'preview-button', () => { void audition(); });
    updatePlayback();
    cardHeader.append(titleGroup, previewButton);
    card.append(cardHeader);

    function refreshSavedState(): void { saveState.textContent = timbre.read().changed ? '编辑稿已保留' : '已保存'; }
    const characterSection = element('div', 'character-section');
    characterSection.append(element('p', 'control-caption', '它听起来…'));
    const choices = element('div', 'character-choices');
    const variants: Array<[TimbreBody['character'], string, string, string]> = [
      ['warm', '温暖圆润', '像一束柔和的光', '∿'], ['clear', '清澈轻盈', '让声音透一点气', '≈'], ['bright', '明亮鲜活', '多一点棱角与活力', '⋀'],
    ];
    const characterButtons = new Map<TimbreBody['character'], HTMLButtonElement>();
    for (const [id, label, description, symbol] of variants) {
      const choice = button('', 'character-choice', () => safely(() => {
        sound.stopAll();
        timbre.setCharacter(id);
        for (const [key, control] of characterButtons) control.setAttribute('aria-pressed', String(key === id));
        refreshSavedState(); report('声音已改变，听听看。');
      }));
      choice.setAttribute('aria-pressed', String(view.body.character === id));
      choice.append(element('span', 'character-symbol', symbol), element('strong', '', label), element('span', 'choice-description', description));
      characterButtons.set(id, choice); choices.append(choice);
    }
    characterSection.append(choices); card.append(characterSection);

    const contour = element('div', 'contour-section');
    const contourHeading = element('div', 'contour-heading');
    contourHeading.append(element('p', 'control-caption', '声音怎样出现，又怎样消散'), element('span', 'contour-hint', '拖动两个圆点试试'));
    contour.append(contourHeading);
    const graph = document.createElementNS(svgNS, 'svg');
    graph.classList.add('envelope-graph'); graph.setAttribute('viewBox', '0 0 640 158');
    graph.setAttribute('aria-label', '声音起落曲线；也可以使用下方滑杆调整');
    const grid = document.createElementNS(svgNS, 'path');
    grid.setAttribute('d', 'M28 30H612M28 76H612M28 122H612M174 22V132M320 22V132M466 22V132');
    grid.classList.add('envelope-grid');
    const area = document.createElementNS(svgNS, 'path'); area.classList.add('envelope-area');
    const line = document.createElementNS(svgNS, 'path'); line.classList.add('envelope-line');
    graph.append(grid, area, line);
    const dots = [document.createElementNS(svgNS, 'circle'), document.createElementNS(svgNS, 'circle')];
    for (const dot of dots) { dot.setAttribute('r', '7'); dot.classList.add('envelope-handle'); graph.append(dot); }
    contour.append(graph);
    const labels = element('div', 'contour-labels');
    labels.append(element('span', '', '出现'), element('span', '', '停留'), element('span', '', '消散')); contour.append(labels);
    const sliders = element('div', 'envelope-sliders');
    function slider(label: string, max: number, value: number, action: (value: number) => void): HTMLInputElement {
      const field = element('label', 'slider-field');
      field.append(element('span', '', label));
      const control = element('input'); control.type = 'range'; control.min = '0'; control.max = String(max); control.step = '0.01'; control.value = String(value);
      control.addEventListener('input', () => safely(() => { sound.stopAll(); action(Number(control.value)); drawEnvelope(); refreshSavedState(); }));
      field.append(control); sliders.append(field); return control;
    }
    const attack = slider('慢慢响起', 2, view.body.attackSeconds, value => timbre.setEnvelope(value, timbre.read().body.releaseSeconds));
    const release = slider('渐渐消散', 4, view.body.releaseSeconds, value => timbre.setEnvelope(timbre.read().body.attackSeconds, Math.max(0.01, value)));
    function drawEnvelope(): void {
      const body = timbre.read().body;
      const a = 48 + body.attackSeconds / 2 * 180;
      const r = 394 + body.releaseSeconds / 4 * 198;
      const path = `M28 122L${a} 35L360 35L${r} 122`;
      line.setAttribute('d', path); area.setAttribute('d', path + 'Z');
      dots[0]!.setAttribute('cx', String(a)); dots[0]!.setAttribute('cy', '35');
      dots[1]!.setAttribute('cx', String(r)); dots[1]!.setAttribute('cy', '122');
      attack.value = String(body.attackSeconds); release.value = String(body.releaseSeconds);
    }
    dots.forEach((dot, index) => dot.addEventListener('pointerdown', event => {
      if (event.button !== 0) return;
      event.preventDefault(); dot.setPointerCapture(event.pointerId);
      const matrix = graph.getScreenCTM();
      if (!matrix) return;
      const startX = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse()).x;
      const initial = timbre.read().body;
      sound.stopAll();
      const move = (input: PointerEvent) => safely(() => {
        const transform = graph.getScreenCTM();
        if (!transform) return;
        const x = new DOMPoint(input.clientX, input.clientY).matrixTransform(transform.inverse()).x;
        const delta = x - startX;
        const body = timbre.read().body;
        timbre.setEnvelope(index === 0 ? Math.min(2, Math.max(0, initial.attackSeconds + delta / 180 * 2)) : body.attackSeconds,
          index === 1 ? Math.min(4, Math.max(0.01, initial.releaseSeconds + delta / 198 * 4)) : body.releaseSeconds);
        drawEnvelope(); refreshSavedState();
      });
      const finish = () => {
        dot.removeEventListener('pointermove', move); dot.removeEventListener('pointerup', finish); dot.removeEventListener('pointercancel', finish);
        if (dot.hasPointerCapture(event.pointerId)) dot.releasePointerCapture(event.pointerId);
        endDrag = undefined;
      };
      endDrag?.(); endDrag = finish;
      dot.addEventListener('pointermove', move); dot.addEventListener('pointerup', finish); dot.addEventListener('pointercancel', finish);
    }));
    contour.append(sliders); drawEnvelope(); card.append(contour);

    const footer = element('div', 'sound-card-footer');
    const volumeLabel = element('label', 'volume-control', '轻一点');
    const volume = element('input'); volume.type = 'range'; volume.min = '0'; volume.max = '1'; volume.step = '0.01'; volume.value = String(view.body.level);
    volume.setAttribute('aria-label', '声音音量');
    volume.addEventListener('input', () => safely(() => { sound.stopAll(); timbre.setLevel(Number(volume.value)); refreshSavedState(); }));
    volumeLabel.append(volume, element('span', '', '响一点')); footer.append(volumeLabel);
    const saveActions = element('div', 'save-actions');
    if (view.draft.sourceId) saveActions.append(button('另存为新声音', 'quiet', () => save('new')));
    saveActions.append(button('保存声音  ↗', 'primary', () => save(view.draft.sourceId ? 'overwrite' : 'new')));
    footer.append(saveActions); card.append(footer); main.append(card);
    notice = element('p', 'studio-notice', '修改会保留为编辑稿。满意时，再保存为自己的声音。');
    notice.setAttribute('role', 'status'); main.append(notice);
    const bottom = element('footer', 'studio-footer');
    bottom.append(element('span', '', 'RootSound · 从听见，到创造'));
    page.append(toolbar, main, bottom); root.append(page);
  }

  unsubscribe = sound.subscribe(event => {
    if (event.type === 'session') {
      if (event.session.status === 'playing') { playing = event.session.id; report('正在试听…'); }
      else if (event.session.id === playing) {
        playing = undefined;
        report(event.session.status === 'failed' ? event.session.error ?? '试听失败。' : '还可以再改一点，再听一次。', event.session.status === 'failed');
      }
      updatePlayback();
    } else if (event.status === 'failed' || event.status === 'suspended') report(event.error ?? '声音设备暂不可用，请重新试听。', true);
  });
  const keydown = (event: KeyboardEvent) => {
    const target = event.target;
    if (event.code !== 'Space' || !previewButton?.isConnected || target instanceof HTMLInputElement || target instanceof HTMLButtonElement || root.querySelector('dialog[open]')) return;
    event.preventDefault(); void audition();
  };
  document.addEventListener('keydown', keydown);
  showWelcome();
  return { dispose() { disposed = true; endDrag?.(); unsubscribe?.(); document.removeEventListener('keydown', keydown); root.replaceChildren(); } };
}
