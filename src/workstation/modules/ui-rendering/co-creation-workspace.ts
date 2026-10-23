import type { CoCreationDirection, CoCreationPort, CoCreationView } from '../../contracts/co-creation.ts';
import type { SoundRuntimePort, SoundSequencePlan } from '../../contracts/sound.ts';
import './co-creation.css';

function node<K extends keyof HTMLElementTagNameMap>(tag: K, className = '', text = ''): HTMLElementTagNameMap[K] {
  const result = document.createElement(tag); result.className = className; result.textContent = text; return result;
}
function button(label: string, className: string, callback: () => void): HTMLButtonElement {
  const result = node('button', className, label); result.type = 'button'; result.addEventListener('click', callback); return result;
}

/** The workspace presents three offline choices; the domain owns every musical result. */
export function mountCoCreationWorkspace(root: HTMLElement, options: {
  coCreation: CoCreationPort;
  sound: SoundRuntimePort;
  onSound(): void;
  onPhrase?(): void;
  onSong?(): void;
  onWelcome(): void;
  onLibrary?(): void;
  onSampling?(): void;
  onSettings?(): void;
  beforeChange?(): void;
  onEditPhrase(): void;
  onUsePhrase(phraseId: string): void;
}): { dispose(): void; refresh(): void; notify(message: string, error?: boolean): void } {
  const { coCreation, sound } = options;
  let disposed = false;
  let busy = false;
  let preparing = false;
  let generation = 0;
  let sessionId: string | undefined;
  let previewTarget: string | undefined;
  let sourcePhraseId = '';
  let sourceInitialized = false;
  let renderedDraftId: string | undefined;
  let lastView: CoCreationView | undefined;
  let renameField: HTMLInputElement | undefined;
  let renameEdit: { token: string; original: string; value: string } | undefined;
  let notice: HTMLElement | undefined;
  let status = '先听听，再选一个喜欢的方向。不必一次决定所有细节。';
  let isError = false;
  const previewButtons = new Map<string, HTMLButtonElement>();

  function report(message: string, error = false): void {
    status = message; isError = error;
    if (notice) { notice.textContent = message; notice.classList.toggle('is-error', error); }
  }
  function syncControls(): void {
    for (const [target, control] of previewButtons) {
      const current = previewTarget === target;
      control.textContent = current && preparing ? '取消试听' : current && sessionId ? '■ 停止' : target === 'current' ? '听听当前结果' : '听听';
      control.disabled = busy;
      control.setAttribute('aria-pressed', String(current && (preparing || !!sessionId)));
      control.setAttribute('aria-busy', String(current && preparing));
    }
    root.querySelectorAll<HTMLButtonElement>('[data-co-command]').forEach(control => { control.disabled = busy; });
    const source = root.querySelector<HTMLSelectElement>('.co-source-picker'); if (source) source.disabled = busy;
    if (renameField) renameField.disabled = busy;
    const undo = root.querySelector<HTMLButtonElement>('.co-undo'); if (undo) undo.disabled = busy || !lastView?.canUndo;
    const redo = root.querySelector<HTMLButtonElement>('.co-redo'); if (redo) redo.disabled = busy || !lastView?.canRedo;
  }
  function stopPreview(): void {
    generation++; preparing = false; sessionId = undefined; previewTarget = undefined;
    sound.stopAll(); syncControls();
  }
  function leave(callback: () => void): void {
    if (disposed) return;
    try { if (!commitName()) return; stopPreview(); busy = false; syncControls(); callback(); }
    catch (error) { if (!disposed) report(error instanceof Error ? error.message : String(error), true); }
  }
  function change(callback: () => void, message: string): void {
    if (busy || disposed) return;
    if (!commitName()) return;
    stopPreview(); busy = true; syncControls();
    try { options.beforeChange?.(); callback(); report(message); }
    catch (error) { report(error instanceof Error ? error.message : String(error), true); }
    finally { busy = false; render(); }
  }
  async function preview(target: string, plan: () => SoundSequencePlan): Promise<void> {
    if (busy || disposed) return;
    if (previewTarget === target && (preparing || sessionId)) { stopPreview(); report('试听已停止。'); return; }
    stopPreview();
    const request = ++generation; previewTarget = target; preparing = true; syncControls(); report('正在准备试听…');
    const token = coCreation.read().token;
    try {
      if (target === 'current') await coCreation.prepareCurrent(); else await coCreation.prepareIdea(target as CoCreationDirection);
      if (disposed || request !== generation) return;
      if (coCreation.read().token !== token) throw new Error('探索内容已改变，请重新试听当前方向。');
      const playback = await sound.preview(plan());
      if (disposed || request !== generation) { sound.stop(playback.id); return; }
      sessionId = playback.status === 'playing' ? playback.id : undefined;
      report(sessionId ? '正在试听。喜欢的话，可以把这个方向留下来。' : '听完了，可以换个方向再听听。');
    } catch (error) {
      if (!disposed && request === generation) report(error instanceof Error ? error.message : String(error), true);
    } finally {
      if (!disposed && request === generation) {
        preparing = false; if (!sessionId) previewTarget = undefined; syncControls();
      }
    }
  }
  function listenButton(target: string, plan: () => SoundSequencePlan): HTMLButtonElement {
    const control = button(target === 'current' ? '听听当前结果' : '听听', 'secondary co-listen', () => { void preview(target, plan); });
    previewButtons.set(target, control); return control;
  }
  async function choose(id: CoCreationDirection, token: string): Promise<void> {
    if (busy || disposed) return;
    const beforeRename = lastView?.token;
    if (!commitName()) return;
    if (token === beforeRename) token = lastView?.token ?? token;
    stopPreview(); const request = ++generation; busy = true; syncControls();
    try {
      options.beforeChange?.(); await coCreation.prepareIdea(id); if (disposed || request !== generation) return;
      options.beforeChange?.(); coCreation.chooseIdea(id, token);
      report('这份结果已保留。可以继续挑一个方向，也可以细调这段旋律。');
    } catch (error) { if (!disposed && request === generation) report(error instanceof Error ? error.message : String(error), true); }
    finally { if (request === generation) { busy = false; if (!disposed) { render(); root.querySelector<HTMLElement>('.co-current-title')?.focus({ preventScroll: true }); } } }
  }
  function commitName(): boolean {
    if (!renameEdit || !renameField || busy || disposed) return !renameEdit;
    const edit = renameEdit;
    if (edit.value.trim() === edit.original) { renameField.value = edit.original; renameEdit = undefined; return true; }
    try {
      options.beforeChange?.();
      coCreation.renameCurrent(edit.value, edit.token);
      lastView = coCreation.read(); renameEdit = undefined;
      renameField.value = lastView.currentPhrase?.name ?? edit.value.trim();
      renameField.removeAttribute('aria-invalid');
      // Keep this input and any button being clicked in place when blur commits the title.
      const picker = root.querySelector<HTMLSelectElement>('.co-source-picker');
      if (picker) {
        const oldValue = picker.value; picker.replaceChildren();
        const fresh = node('option', '', '给我一个新的起点'); fresh.value = ''; picker.append(fresh);
        for (const phrase of lastView.availablePhrases) { const option = node('option', '', phrase.name); option.value = phrase.id; picker.append(option); }
        picker.value = oldValue;
      }
      syncControls(); report('名称已修改，只影响这次旅途中的当前结果。'); return true;
    } catch (error) {
      renameField.setAttribute('aria-invalid', 'true');
      report(error instanceof Error ? error.message : String(error), true); return false;
    }
  }
  function render(): void {
    if (disposed) return;
    const pageScroll = document.scrollingElement?.scrollTop ?? 0;
    let view: CoCreationView | undefined;
    try { view = coCreation.read(); }
    catch (error) { report(error instanceof Error ? error.message : String(error), true); }
    lastView = view;
    if (view && !sourceInitialized) { sourcePhraseId = view.body?.sourcePhraseId ?? ''; sourceInitialized = true; }
    const sameDraft = !!view && renderedDraftId === view.draft.id;
    if (!sameDraft) renameEdit = undefined;
    renderedDraftId = view?.draft.id;
    if (sourcePhraseId && !view?.availablePhrases.some(item => item.id === sourcePhraseId)) sourcePhraseId = '';
    renameField = undefined; previewButtons.clear(); root.replaceChildren();
    const page = node('div', 'studio co-studio');
    const toolbar = node('header', 'studio-toolbar'); toolbar.append(button('RootSound', 'wordmark brand-button', () => leave(options.onWelcome)));
    const tabs = node('nav', 'workspace-tabs'); tabs.setAttribute('aria-label', '切换创作工作区');
    tabs.append(button('灵感共创', 'workspace-tab is-active', () => {}), button('音色制作', 'workspace-tab', () => leave(options.onSound)));
    if (options.onSampling) tabs.insertBefore(button('采样获取', 'workspace-tab', () => leave(options.onSampling!)), tabs.lastChild);
    if (options.onPhrase) tabs.append(button('乐句谱写', 'workspace-tab', () => leave(options.onPhrase!)));
    if (options.onSong) tabs.append(button('歌曲编排', 'workspace-tab', () => leave(options.onSong!)));
    toolbar.append(tabs);
    const tools = node('nav', 'toolbar-tools');
    if (options.onLibrary) tools.append(button('素材', 'quiet', () => leave(options.onLibrary!)));
    if (options.onSettings) tools.append(button('设置', 'quiet', () => leave(options.onSettings!)));
    toolbar.append(tools); page.append(toolbar);
    const main = node('main', 'co-workspace');
    const heading = node('header', 'co-heading');
    heading.append(node('h1', '', '从一个灵感开始'), node('p', 'co-offline-note', '离线灵感 · 本地规则生成'));
    main.append(heading);

    const source = node('section', 'co-source'); source.setAttribute('aria-label', '选择探索起点');
    const field = node('label', 'co-source-field'); field.append(node('span', '', '从我的乐句继续'));
    const picker = node('select', 'co-source-picker'); picker.setAttribute('aria-label', '探索的起点');
    const fresh = node('option', '', '给我一个新的起点'); fresh.value = ''; picker.append(fresh);
    for (const phrase of view?.availablePhrases ?? []) { const option = node('option', '', phrase.name); option.value = phrase.id; picker.append(option); }
    picker.value = sourcePhraseId; picker.addEventListener('change', () => { sourcePhraseId = picker.value; }); field.append(picker);
    const start = button(view?.currentPhrase || view?.body?.round ? '换个起点' : '开始探索', 'quiet co-start', () => {
      change(() => coCreation.start(sourcePhraseId || undefined), '新的探索已准备好。原来的作品和探索稿仍然保留。');
    }); start.dataset.coCommand = ''; source.append(field, start);
    if (view?.sourceName) source.append(node('p', 'co-source-name', `这次从“${view.sourceName}”开始。`));
    main.append(source);

    if (view?.problem || !view?.body) {
      const problem = node('section', 'co-problem'); problem.append(node('p', '', view?.problem ?? '暂时无法读取这份探索稿。原有内容已保留，可以换个起点继续。')); main.append(problem);
    } else {
      if (view.currentPhrase) {
        const current = node('section', 'co-current'); current.setAttribute('aria-label', '当前创作结果');
        const description = node('div', 'co-current-description');
        description.append(node('p', 'co-section-label', view.body.round ? '留下来的这一份' : '你的旋律起点'));
        const title = node('h2', 'co-current-title'); title.tabIndex = -1;
        const name = node('input', 'co-current-name'); name.type = 'text'; name.maxLength = 4096;
        name.setAttribute('aria-label', '当前结果名称'); name.title = '直接修改当前结果名称';
        name.value = renameEdit?.value ?? view.currentPhrase.name; renameField = name;
        const beginName = () => {
          if (!renameEdit && lastView?.currentPhrase) renameEdit = {
            token: lastView.token, original: lastView.currentPhrase.name, value: name.value };
        };
        name.addEventListener('focus', beginName);
        name.addEventListener('input', () => { beginName(); if (renameEdit) renameEdit.value = name.value; name.removeAttribute('aria-invalid'); });
        name.addEventListener('blur', () => { commitName(); });
        name.addEventListener('keydown', event => {
          if (event.isComposing) return;
          if (event.key === 'Enter') { event.preventDefault(); if (commitName()) name.blur(); }
          else if (event.key === 'Escape') {
            event.preventDefault(); name.value = lastView?.currentPhrase?.name ?? renameEdit?.original ?? name.value;
            renameEdit = undefined; name.removeAttribute('aria-invalid'); name.blur(); report('已取消改名。');
          }
        });
        title.append(name); description.append(title);
        description.append(node('p', '', '先听，再改。细节可以交给旋律编辑，回来后继续探索。'));
        const actions = node('div', 'co-current-actions');
        const edit = button('细调这段旋律', 'quiet', () => leave(options.onEditPhrase)); edit.dataset.coCommand = '';
        const use = button('用它创作歌曲', 'primary', () => leave(() => {
          const current = coCreation.read().currentPhrase;
          if (!current) throw new Error('当前结果已改变，请重新听听并选择一个方向。');
          options.onUsePhrase(current.id);
        })); use.dataset.coCommand = '';
        actions.append(listenButton('current', () => coCreation.previewCurrent()), edit, use); current.append(description, actions); main.append(current);
      }
      const ideas = node('section', 'co-ideas'); ideas.setAttribute('aria-label', '选择一个灵感方向');
      const introduction = node('div', 'co-ideas-heading'); introduction.append(node('h2', '', view.currentPhrase ? '接下来，想往哪个方向？' : '先听听，哪一种更接近你？'),
        node('p', '', '每次选一个就好。听见新想法，再继续。')); ideas.append(introduction);
      const cards = node('div', 'co-idea-cards');
      for (const idea of view.ideas.slice(0, 3)) {
        const card = node('article', `co-idea-card co-direction-${idea.id}`); card.dataset.direction = idea.id;
        card.append(node('span', 'co-idea-mark', idea.id === 'light' ? '∿' : idea.id === 'calm' ? '≈' : '⋯'), node('h3', '', idea.title), node('p', '', idea.description));
        const actions = node('div', 'co-idea-actions');
        const select = button('选这个', 'primary co-choose', () => { void choose(idea.id, lastView!.token); }); select.dataset.coCommand = '';
        actions.append(listenButton(idea.id, () => coCreation.previewIdea(idea.id)), select); card.append(actions); cards.append(card);
      }
      ideas.append(cards); main.append(ideas);
    }
    const history = node('div', 'co-history');
    history.append(button('撤销', 'quiet co-undo', () => change(() => coCreation.undo(), '已回到上一步，原作品仍然保留。')),
      button('重做', 'quiet co-redo', () => change(() => coCreation.redo(), '已恢复这一步。')));
    main.append(history);
    notice = node('p', `studio-notice${isError ? ' is-error' : ''}`, status); notice.setAttribute('role', 'status'); main.append(notice);
    page.append(main); root.append(page); syncControls();
    const restore = () => {
      if (!disposed && page.isConnected && document.scrollingElement) document.scrollingElement.scrollTop = sameDraft ? pageScroll : 0;
    };
    restore(); queueMicrotask(restore);
  }

  const unsubscribe = sound.subscribe(event => {
    if (disposed) return;
    if (event.type === 'session' && event.session.id === sessionId && event.session.status !== 'playing') {
      sessionId = undefined; previewTarget = undefined;
      report(event.session.status === 'failed' ? event.session.error ?? '试听没有完成，请重试。' : '听完了，可以换个方向再听听。', event.session.status === 'failed');
      syncControls();
    } else if (event.type === 'device' && (event.status === 'failed' || event.status === 'suspended')) report(event.error ?? '声音设备暂不可用，请重新试听。', true);
  });
  const keydown = (event: KeyboardEvent) => {
    if (disposed || busy || root.querySelector('dialog[open]') || event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement || event.target instanceof HTMLTextAreaElement
      || event.target instanceof HTMLElement && event.target.isContentEditable) return;
    if (event.key === 'Escape' && (sessionId || preparing)) { event.preventDefault(); stopPreview(); report('试听已停止。'); return; }
    if (!(event.ctrlKey || event.metaKey)) return;
    const shortcut = (letter: string) => /^Key[A-Z]$/u.test(event.code) ? event.code === `Key${letter.toUpperCase()}` : event.key.toLowerCase() === letter;
    if (shortcut('z')) {
      event.preventDefault();
      if (event.shiftKey ? lastView?.canRedo : lastView?.canUndo) change(() => event.shiftKey ? coCreation.redo() : coCreation.undo(), event.shiftKey ? '已恢复这一步。' : '已回到上一步，原作品仍然保留。');
    } else if (shortcut('y')) { event.preventDefault(); if (lastView?.canRedo) change(() => coCreation.redo(), '已恢复这一步。'); }
  };
  document.addEventListener('keydown', keydown); render();
  return {
    refresh() { if (!disposed) { stopPreview(); render(); } },
    notify(message, error = false) { if (!disposed) report(message, error); },
    dispose() { if (disposed) return; disposed = true; stopPreview(); unsubscribe(); document.removeEventListener('keydown', keydown); },
  };
}
