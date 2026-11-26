import type { ProjectDirectory, ProjectLibraryEntry, ProjectLibraryPage, ProjectSaveChoice, ProjectSetupPort } from '../../contracts/project-directory.ts';
import { showProjectNameDialog } from './project-save-as.ts';
import { libraryIcon } from './library-icon.ts';
import { attachEdgeGesture } from './pointer-gestures.ts';
import type { WelcomeLibraryGuide } from './welcome-guide.ts';
import './project-library.css';
import './pointer-ux.css';

/** The welcome page's only entry: discover songs, create one, or pick a file. */
export function mountProjectLibrary(container: HTMLElement, trigger: HTMLElement, service: Pick<ProjectSetupPort, 'open' | 'list' | 'browse' | 'remove' | 'rename' | 'createFolder' | 'renameEntry' | 'removeEntry' | 'transferEntry' | 'undoEntryTransfer' | 'reveal' | 'chooseLibraryFolder' | 'readLibraryDuration'> & Partial<Pick<ProjectSetupPort, 'create' | 'startNew'>>,
  onNew: () => void, save?: {
    source?: ProjectDirectory; name: string; original?: () => Promise<void>; discard?: () => Promise<void>;
    copy(name: string, path: string): Promise<void>; finish(choice: ProjectSaveChoice): void;
  }, desktopPointerUx = false, guide?: WelcomeLibraryGuide): { open(): void; dispose(): void; awaitingInput(): boolean; refreshGuide(reload?: boolean): void } {
  const welcomeLibrary = desktopPointerUx && !save;
  const welcomePage = welcomeLibrary ? trigger.closest<HTMLElement>('.welcome') : null;
  let libraryMotion: Animation | undefined;
  let disposed = false; let expanded = false; let opening = false; let generation = 0;
  let projects: ProjectDirectory[] = []; let loading = false; let error = '';
  let page: ProjectLibraryPage | undefined;
  let guideTarget: string | null | undefined;
  let pageSize = 12;
  let pageIndex = 0;
  let readingDuration = false;
  let choosingFolder = false;
  const durationCache = new Map<string, number | undefined>();
  const durationQueue = new Map<string, HTMLElement>();
  const rowHeight = 40, overscan = 4;
  let listedEntries: readonly ProjectLibraryEntry[] = [];
  const mountedRows = new Map<number, HTMLButtonElement | HTMLInputElement>();
  let listFrame: number | undefined;
  let layoutFrame: number | undefined;
  let warmup: number | undefined;
  let dragged: ProjectDirectory | undefined; let suppressOpenUntil = 0;
  let candidate: ProjectLibraryEntry | undefined; let deleting = false; let naming = false;
  let editing: { project: ProjectLibraryEntry; input: HTMLInputElement } | undefined; let renaming = false;
  let contextTarget: HTMLButtonElement | undefined;
  let sourceClipboard: { path: string; cut: boolean } | undefined;
  let pointedEntry: string | undefined;
  const overlay = document.createElement('div'); overlay.className = 'project-library-overlay'; overlay.hidden = true;
  const bridgeNotes = welcomePage?.classList.contains('is-desktop-welcome') &&
    document.documentElement?.classList.contains('windows-desktop-colors');
  if (bridgeNotes) welcomePage?.classList.add('has-library-bridge');
  const dialog = document.createElement('section'); dialog.className = save ? 'project-library is-saving' : 'project-library';
  dialog.setAttribute('role', desktopPointerUx ? 'region' : 'dialog');
  if (!desktopPointerUx) dialog.setAttribute('aria-modal', 'true');
  dialog.setAttribute('aria-label', '乐曲库');
  const header = document.createElement('header'); header.className = 'project-library-header';
  const title = document.createElement('h2'); title.textContent = '乐曲库';
  const actions = document.createElement('div'); actions.className = 'project-library-actions';
  const closeButton = document.createElement('button'); closeButton.type = 'button'; closeButton.textContent = '×';
  closeButton.className = 'project-library-close'; closeButton.setAttribute('aria-label', '关闭乐曲库');
  const grid = document.createElement('div'); grid.className = 'project-library-grid';
  const list = desktopPointerUx ? document.createElement('div') : undefined;
  if (list) {
    overlay.classList.add('is-library-workspace');
    if (welcomeLibrary) overlay.classList.add('is-welcome-library');
    list.className = 'project-library-list';
    list.style.setProperty('--library-list-row-height', `${rowHeight}px`);
    grid.tabIndex = 0;
    grid.setAttribute('role', 'group');
    grid.setAttribute('aria-label', '曲目');
    grid.append(list);
    grid.addEventListener('scroll', () => { closeContextMenu(); queueList(); }, { passive: true });
  }
  const navigation = document.createElement('nav'); navigation.className = 'project-library-navigation'; navigation.hidden = true;
  navigation.setAttribute('aria-label', '乐曲库文件夹');
  const listResize = list && typeof ResizeObserver === 'function' ? new ResizeObserver(queueList) : undefined;
  listResize?.observe(grid);
  const note = document.createElement('p'); note.className = 'project-library-note'; note.setAttribute('role', 'status');
  const problem = document.createElement('p'); problem.className = 'project-library-error'; problem.setAttribute('role', 'alert');
  const footer = document.createElement('footer'); footer.className = 'project-library-footer';
  const pagination = document.createElement('div'); pagination.className = 'project-library-pagination'; pagination.hidden = true;
  const previousPage = document.createElement('button'); previousPage.type = 'button'; previousPage.textContent = '‹'; previousPage.setAttribute('aria-label', '上一页');
  previousPage.setAttribute('aria-keyshortcuts', 'ArrowLeft');
  const pageNumber = document.createElement('input'); pageNumber.type = 'number'; pageNumber.min = '1'; pageNumber.setAttribute('aria-label', '页码');
  const pageTotal = document.createElement('span');
  const nextPage = document.createElement('button'); nextPage.type = 'button'; nextPage.textContent = '›'; nextPage.setAttribute('aria-label', '下一页');
  nextPage.setAttribute('aria-keyshortcuts', 'ArrowRight');
  pagination.append(previousPage, pageNumber, pageTotal, nextPage); footer.append(pagination);
  const saveActions = document.createElement('div'); saveActions.className = 'project-library-save-actions';
  const discard = document.createElement('button'); discard.type = 'button'; discard.textContent = '直接退出';
  const original = document.createElement('button'); original.type = 'button'; original.textContent = '保存';
  const copy = document.createElement('button'); copy.type = 'button'; copy.textContent = '另存为';
  if (save && !desktopPointerUx) {
    if (save.discard) saveActions.append(discard);
    saveActions.append(copy, original); footer.append(saveActions);
  }
  const contextMenu = document.createElement('div'); contextMenu.className = 'project-library-context'; contextMenu.hidden = true;
  contextMenu.setAttribute('role', 'menu');
  const copyForm = desktopPointerUx && save ? document.createElement('form') : undefined;
  const copyName = copyForm ? document.createElement('input') : undefined;
  const submitCopy = copyForm ? document.createElement('button') : undefined;
  if (copyForm && copyName && submitCopy && save) {
    copyForm.className = 'project-library-copy-form';
    copyName.type = 'text'; copyName.value = save.name; copyName.maxLength = 80; copyName.required = true;
    copyName.autocomplete = 'off'; copyName.spellcheck = false; copyName.setAttribute('aria-label', '乐曲名称');
    submitCopy.type = 'submit'; submitCopy.textContent = '保存';
    copyForm.append(copyName, submitCopy);
    copyForm.addEventListener('submit', event => {
      event.preventDefault();
      if (!page || submitCopy.disabled) return;
      const path = page.path;
      const base = copyName.value.trim().replace(/\.rootsound$/iu, '');
      const name = base ? availableName(base, page.entries, save.source?.path) : '';
      void finishAction(() => save.copy(name, path), 'saved');
    });
  }
  const folderForm = document.createElement('form'); folderForm.className = 'project-library-folder-form'; folderForm.hidden = true;
  const folderName = document.createElement('input');
  folderName.type = 'text'; folderName.maxLength = 80; folderName.required = true;
  folderName.autocomplete = 'off'; folderName.spellcheck = false; folderName.setAttribute('aria-label', '文件夹名称');
  const submitFolder = document.createElement('button'); submitFolder.type = 'submit'; submitFolder.textContent = '新建文件夹';
  const cancelFolder = document.createElement('button'); cancelFolder.type = 'button'; cancelFolder.textContent = '取消';
  folderForm.append(folderName, submitFolder, cancelFolder);
  cancelFolder.addEventListener('click', () => closeFolderForm());
  folderForm.addEventListener('submit', event => { event.preventDefault(); void submitNewFolder(); });
  if (desktopPointerUx) {
    dialog.tabIndex = -1;
    const directory = document.createElement('div'); directory.className = 'project-library-directory';
    directory.append(navigation, actions);
    if (copyForm) {
      closeButton.classList.add('project-library-save-back');
      closeButton.setAttribute('aria-label', '取消另存为');
      closeButton.replaceChildren(libraryIcon('back'));
      directory.prepend(closeButton);
      directory.append(copyForm);
    }
    grid.tabIndex = 0; grid.setAttribute('aria-label', '乐曲库文件列表');
    dialog.append(directory, folderForm, note, problem, grid, footer, contextMenu);
  } else {
    const titleIcon = document.createElement('span'); titleIcon.className = 'project-library-title-icon'; titleIcon.append(libraryIcon('musicLibrary'));
    header.append(titleIcon, title, actions, closeButton);
    dialog.append(header, navigation, grid, note, problem, footer, contextMenu);
  }
  overlay.append(dialog); container.append(overlay);
  if (guide) {
    function protectGuide(event: Event): void {
      if (guideTarget === undefined) return;
      if (event.type === 'click' && event.target instanceof Element && event.target.closest('.is-welcome-guide-target')) return;
      event.preventDefault();
      event.stopImmediatePropagation();
    }
    overlay.addEventListener('click', protectGuide, true);
    overlay.addEventListener('contextmenu', protectGuide, true);
  }
  let welcomeLift = 0;
  const clearWelcomeMotion = () => {
    welcomeLift = 0;
    welcomePage?.classList.remove('is-welcome-lifting');
    welcomePage?.style.removeProperty('--welcome-pointer-lift');
  };
  const canUseLibraryEdge = () => expanded
      ? guideTarget === undefined && !opening && !deleting && !candidate && !renaming && !naming && !editing && folderForm.hidden && !contextTarget
      : overlay.inert || overlay.hidden && !container.querySelector('.project-library-overlay:not([hidden]), dialog[open], .workspace-inline-panel[open]');
  const edgeGesture = welcomePage ? attachEdgeGesture(container, ['right', 'left', 'top', 'bottom'], {
    enabled: canUseLibraryEdge,
    open: () => { if (expanded) close(); else openLibrary(); },
    preview: (x, y) => {
      if (expanded && !bridgeNotes) return;
      if (!expanded) welcomePage.classList.remove('is-welcome-library-returning');
      const edgeBand = .18;
      const insetX = Math.min(x, 1 - x);
      const inset = expanded ? Math.min(insetX, y, 1 - y) : insetX;
      const proximity = Math.max(0, Math.min(1, (edgeBand - inset) / edgeBand));
      const lift = 38 * proximity ** 1.25;
      if (lift === welcomeLift) return;
      welcomeLift = lift;
      welcomePage.classList.toggle('is-welcome-lifting', lift > 0);
      welcomePage.style.setProperty('--welcome-pointer-lift', `${expanded ? lift : -lift}px`);
    },
    clearPreview: clearWelcomeMotion,
  }) : undefined;
  if (!desktopPointerUx) overlay.addEventListener('wheel', event => {
    event.preventDefault(); event.stopPropagation();
  }, { passive: false });
  const trash = document.createElement('div'); trash.className = 'project-library-trash'; trash.hidden = true;
  trash.setAttribute('role', 'region'); trash.setAttribute('aria-label', '删除乐曲项目');
  const trashIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); trashIcon.setAttribute('viewBox', '0 0 24 24'); trashIcon.setAttribute('aria-hidden', 'true');
  const trashPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  trashPath.setAttribute('d', 'M4 6h16M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7m4-7v7');
  for (const [key, value] of Object.entries({ fill: 'none', stroke: 'currentColor', 'stroke-width': '1.6', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' })) trashPath.setAttribute(key, value);
  trashIcon.append(trashPath); trash.append(trashIcon); overlay.append(trash);
  const confirmation = document.createElement('div'); confirmation.className = 'project-delete-overlay'; confirmation.hidden = true;
  const warning = document.createElement('section'); warning.className = 'project-delete-warning'; warning.setAttribute('role', 'alertdialog');
  if (!desktopPointerUx) warning.setAttribute('aria-modal', 'true');
  warning.setAttribute('aria-label', '彻底删除乐曲项目');
  const warningTitle = document.createElement('h3');
  const warningText = document.createElement('p'); warningText.textContent = '工程和全部素材将被删除，无法撤销。';
  const warningError = document.createElement('p'); warningError.className = 'project-library-error'; warningError.setAttribute('role', 'alert'); warningError.hidden = true;
  const warningActions = document.createElement('div'); warningActions.className = 'project-delete-actions';
  const cancel = document.createElement('button'); cancel.type = 'button'; cancel.textContent = '取消'; cancel.setAttribute('aria-label', '取消删除乐曲');
  const confirm = document.createElement('button'); confirm.type = 'button'; confirm.textContent = '彻底删除'; confirm.setAttribute('aria-label', '确认彻底删除乐曲');
  warningActions.append(cancel, confirm); warning.append(warningTitle, warningText, warningError, warningActions); confirmation.append(warning); overlay.append(confirmation);
  if (!desktopPointerUx) trigger.setAttribute('aria-haspopup', 'dialog');
  updateExpanded(false);
  // Warm the first small directory only after the welcome page has painted.
  if (!desktopPointerUx && !save && service.browse && typeof globalThis.requestIdleCallback === 'function') {
    warmup = requestIdleCallback(() => {
      warmup = undefined;
      if (disposed || expanded || generation !== 0) return;
      void service.browse!().then(listed => {
        if (disposed || expanded || generation !== 0) return;
        page = listed;
      }).catch(() => { /* Opening the library retries and presents any error. */ });
    }, { timeout: 1000 });
  }

  function updateExpanded(value: boolean): void {
    if (trigger.tagName.toLowerCase() === 'button') trigger.setAttribute('aria-expanded', String(value));
  }
  function focusLibrary(): void { (desktopPointerUx ? dialog : closeButton).focus({ preventScroll: true }); }
  function setWelcomeLibraryOpen(open: boolean): void {
    if (!welcomeLibrary) return;
    welcomePage?.classList.toggle('is-library-open', open);
  }
  function animateLibrary(open: boolean): Animation | undefined {
    if (!welcomeLibrary || typeof dialog.animate !== 'function') return;
    const style = getComputedStyle(dialog);
    const from = open && !libraryMotion ? { transform: 'translateY(28%)', opacity: 0 }
      : { transform: style.transform, opacity: Number(style.opacity) };
    libraryMotion?.cancel();
    libraryMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ? undefined : dialog.animate([
      from, { transform: open ? 'translateY(0)' : 'translateY(28%)', opacity: open ? 1 : 0 },
    ], { duration: open ? 300 : 260, easing: open ? 'cubic-bezier(.18,.75,.3,1)' : 'ease-in-out', fill: open ? 'backwards' : 'forwards' });
    return libraryMotion;
  }
  function close(restoreFocus = true, choice: ProjectSaveChoice = 'cancelled'): void {
    if (!expanded || opening || deleting || candidate || renaming || naming) return;
    durationQueue.clear();
    closeContextMenu(); editing = undefined; endDrag();
    expanded = false; generation++; loading = false; updateExpanded(false);
    welcomePage?.classList.add('is-welcome-library-returning');
    setWelcomeLibraryOpen(false);
    clearWelcomeMotion();
    const finish = () => {
      if (disposed) return;
      overlay.hidden = true; overlay.inert = false;
      setWelcomeLibraryOpen(false);
      if (welcomePage) welcomePage.inert = false;
      if (restoreFocus) trigger.focus({ preventScroll: true });
      save?.finish(choice);
    };
    const closing = animateLibrary(false);
    if (!closing) { finish(); return; }
    overlay.inert = true;
    void closing.finished.then(() => {
      finish();
      closing.cancel();
      libraryMotion = undefined;
    }, () => {});
  }
  function tile(label: string, className: string, callback: () => void, ariaLabel = label, icon?: Parameters<typeof libraryIcon>[0]): HTMLButtonElement {
    const button = document.createElement('button'); button.type = 'button'; button.className = `${icon ? 'project-library-action' : 'project-library-tile'} ${className}`;
    button.textContent = label;
    if (icon) button.append(libraryIcon(icon));
    button.setAttribute('aria-label', ariaLabel); button.disabled = opening || deleting || !!candidate || renaming;
    button.addEventListener('click', event => { if (!(event.detail > 1) && !disposed && expanded && !opening && !deleting && !candidate && !renaming) callback(); }); return button;
  }
  function normalizePath(path: string): string { return path.replaceAll('\\', '/').replace(/\/+$/u, '').toLowerCase(); }
  async function nameCopy(): Promise<void> {
    if (!save || !page || copy.disabled || naming) return;
    const path = page.path;
    const base = save.name;
    const sourceDirectory = save.source ? normalizePath(save.source.path).split('/').slice(0, -1).join('/') : undefined;
    const names = new Set(page.entries.map(entry => entry.path.split(/[\\/]/u).at(-1)!.toLowerCase()));
    const withSuffix = (number: number) => {
      const suffix = number ? ' ' + number : '';
      return [...base].slice(0, 80 - suffix.length).join('').trimEnd() + suffix;
    };
    let index = sourceDirectory === normalizePath(path) ? 1 : 0;
    let suggested = withSuffix(index);
    while (names.has(suggested.toLowerCase()) || names.has((suggested + '.rootsound').toLowerCase())) suggested = withSuffix(++index);
    naming = true;
    const saved = await showProjectNameDialog(desktopPointerUx ? footer : container, copy.textContent!, suggested, '保存', name => save.copy(name, path), desktopPointerUx);
    naming = false;
    if (saved) close(true, 'saved');
  }
  function availableName(base: string, entries: readonly ProjectLibraryEntry[], source?: string): string {
    const names = new Set(entries.map(entry => normalizePath(entry.path).split('/').at(-1)));
    if (source && page && normalizePath(source).split('/').slice(0, -1).join('/') === normalizePath(page.path)) {
      names.add(normalizePath(source).split('/').at(-1));
    }
    let name = base;
    for (let index = 1; names.has(name.toLowerCase()) || names.has((name + '.rootsound').toLowerCase()); index++) {
      const suffix = ' ' + index;
      name = [...base].slice(0, 80 - suffix.length).join('').trimEnd() + suffix;
    }
    return name;
  }
  function closeFolderForm(): void {
    if (naming) return;
    folderForm.hidden = true; folderName.value = ''; navigationBusy();
    actions.querySelector<HTMLButtonElement>('.project-library-new-folder')?.focus();
  }
  async function submitNewFolder(): Promise<void> {
    if (!page || !service.createFolder || naming || opening || disposed || folderForm.hidden) return;
    const path = page.path;
    naming = true; navigationBusy();
    try {
      await service.createFolder(path, folderName.value);
      if (disposed) return;
      naming = false; closeFolderForm(); await load(path);
      focusLibrary();
    } catch (reason) {
      if (disposed) return;
      error = reason instanceof Error ? reason.message : String(reason);
      problem.textContent = error; problem.hidden = false;
      naming = false; navigationBusy(); folderName.focus();
    }
  }
  async function newFolder(): Promise<void> {
    if (!page || !service.createFolder || naming) return;
    if (desktopPointerUx) { folderForm.hidden = false; navigationBusy(); folderName.focus(); return; }
    const path = page.path;
    naming = true;
    const created = await showProjectNameDialog(container, '新建文件夹', '', '新建', name => service.createFolder!(path, name));
    naming = false;
    if (created) await load(path);
  }
  async function finishAction(action: () => Promise<void>, choice: ProjectSaveChoice): Promise<void> {
    opening = true; error = ''; render();
    try { await action(); opening = false; close(true, choice); }
    catch (reason) {
      opening = false; error = reason instanceof Error ? reason.message : String(reason); render();
    }
  }
  discard.addEventListener('click', () => {
    if (save?.discard && !discard.disabled) void finishAction(save.discard, 'discarded');
  });
  original.addEventListener('click', () => {
    if (save?.original && !original.disabled) void finishAction(save.original, 'saved');
  });
  copy.addEventListener('click', () => { void nameCopy(); });
  async function openProject(path?: string): Promise<void> {
    if (save || disposed || opening || deleting || candidate || renaming || editing || !expanded) return;
    const cancelGuideHandoff = path && path === guideTarget ? guide?.prepareCanvas() : undefined;
    opening = true; error = ''; render();
    try {
      // Successful native opens reload the application. A cancelled picker leaves
      // this library available so the user can choose a different starting point.
      await service.open(path);
      if (path && path === guideTarget) guide?.complete();
    } catch (reason) {
      cancelGuideHandoff?.();
      if (!disposed) error = reason instanceof Error ? reason.message : String(reason);
    }
    finally {
      opening = false;
      if (!disposed) {
        render();
        if (welcomeLibrary && path === undefined) actions.querySelector<HTMLButtonElement>('.project-library-custom')?.focus({ preventScroll: true });
      }
    }
  }
  function render(): void {
    if (disposed) return;
    durationQueue.clear(); closeContextMenu();
    dialog.setAttribute('aria-busy', String(loading || opening || deleting || renaming)); closeButton.disabled = opening || deleting || !!candidate || renaming;
    renderNavigation();
    actions.replaceChildren();
    if (welcomeLibrary) {
      actions.append(
        tile('', 'project-library-custom', () => { void openProject(); }, '选择音乐文件', 'folder'),
        tile('', 'project-library-new-folder', () => { void newFolder(); }, '新建文件夹', 'folderPlus'),
        tile('', 'project-library-new', () => { void createInDirectory(); }, '新建项目', 'projectPlus'),
      );
    } else if (desktopPointerUx) {
      if (page && service.chooseLibraryFolder) actions.append(tile('打开文件夹', 'project-library-choose-folder', () => { void chooseFolder(); }, '打开文件夹', 'folder'));
      if (page && service.createFolder) actions.append(tile('新建文件夹', 'project-library-new-folder', () => { void newFolder(); }, '新建文件夹', 'folderPlus'));
    } else {
      const create = tile('新建', 'project-library-new', () => { close(false); onNew(); }, '新的开始', 'plus');
      const custom = tile('打开', 'project-library-custom', () => { void openProject(); }, '选择音乐文件', 'folder');
      if (page && service.createFolder) actions.append(tile('新建文件夹', 'project-library-new-folder', () => { void newFolder(); }, '新建文件夹', 'folderPlus'));
      if (!save) actions.append(create, custom);
    }
    const entries: ProjectLibraryEntry[] = page?.entries ?? projects.map(project => ({ kind: 'project', ...project }));
    const previousGuideTarget = guideTarget;
    guideTarget = expanded ? guide?.target(entries, page?.path, loading) : undefined;
    if (guide) {
      const guided = guideTarget !== undefined;
      overlay.classList.toggle('is-welcome-guided-library', guided);
      navigation.inert = actions.inert = footer.inert = guided;
      grid.tabIndex = guided ? -1 : 0;
      if (guided) closeButton.disabled = true;
    }
    const totalPages = Math.max(1, Math.ceil(entries.length / pageSize));
    grid.className = 'project-library-grid' + (!desktopPointerUx && totalPages > 1 ? ' has-pages' : '');
    pageIndex = Math.min(pageIndex, totalPages - 1);
    pagination.hidden = desktopPointerUx || totalPages <= 1;
    footer.hidden = (!save || desktopPointerUx) && pagination.hidden;
    dialog.style?.setProperty('--library-page-rows', String(pageSize));
    pageNumber.value = String(pageIndex + 1); pageNumber.max = String(totalPages); pageTotal.textContent = `/ ${totalPages}`;
    navigationBusy();
    note.textContent = loading ? '读取项目…' : !desktopPointerUx && page && entries.length === 0 ? '这个文件夹还没有工程或 MIDI。' : '';
    note.hidden = !note.textContent;
    problem.textContent = error; problem.hidden = !error;
    if (list) {
      listedEntries = entries;
      list.style.height = `${entries.length * rowHeight}px`;
      list.replaceChildren();
      mountedRows.clear();
      const targetIndex = guideTarget ? entries.findIndex(entry => entry.path === guideTarget) : -1;
      if (targetIndex >= 0 && guideTarget !== previousGuideTarget) {
        const offset = targetIndex * rowHeight;
        if (offset < grid.scrollTop || offset + rowHeight > grid.scrollTop + grid.clientHeight) grid.scrollTop = offset;
      }
      renderList();
      if (targetIndex >= 0 && !opening) mountedRows.get(targetIndex)?.focus({ preventScroll: true });
    } else grid.replaceChildren(...entries.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize).map(renderEntry));
    queueFit();
  }
  function renderEntry(entry: ProjectLibraryEntry): HTMLButtonElement {
    let item: HTMLButtonElement;
    if (entry.kind === 'folder') {
      item = tile(entry.name, 'project-library-folder', () => {
        if (!loading) void load(entry.path);
      }, `打开文件夹 ${entry.name}`);
    } else if (entry.kind === 'midi' || entry.kind === 'document') {
      item = tile(entry.name, 'project-library-midi', () => {
        if (save || editing) return;
        void openProject(entry.path);
      }, save ? entry.name : `打开 ${entry.name}`);
    } else {
      item = tile(entry.name, 'project-library-song', () => {
        if (save || dragged || editing || Date.now() < suppressOpenUntil) return;
        void openProject(entry.path);
      });
      item.draggable = !desktopPointerUx && !save && !!service.remove;
      if (!desktopPointerUx) {
        item.addEventListener('dragstart', event => {
          if (save || !service.remove || !event.dataTransfer || opening || deleting || candidate || editing || renaming || disposed || !expanded) { event.preventDefault(); return; }

          dragged = { ...entry }; event.dataTransfer.effectAllowed = 'move';
          event.dataTransfer.setData('application/x-rootsound-project', JSON.stringify({ id: entry.id, path: entry.path }));
          trash.hidden = false;
        });
        item.addEventListener('dragend', () => { suppressOpenUntil = Date.now() + 180; endDrag(); });
      }
    }
    decorateEntry(entry, item);
    if (guideTarget !== undefined) {
      const allowed = entry.path === guideTarget;
      item.classList.toggle('is-welcome-guide-target', allowed);
      if (!allowed) item.disabled = true;
    }
    return item;
  }
  function queueList(): void {
    if (!expanded || disposed || listFrame !== undefined) return;
    if (typeof globalThis.requestAnimationFrame !== 'function') { renderList(); return; }
    listFrame = requestAnimationFrame(() => { listFrame = undefined; renderList(); });
  }
  function renderList(): void {
    if (!list || !expanded || disposed) return;
    const viewport = grid.clientHeight || rowHeight * pageSize;
    const top = Math.max(0, grid.scrollTop || 0);
    const firstVisible = Math.min(listedEntries.length, Math.floor(top / rowHeight));
    const afterVisible = Math.min(listedEntries.length, Math.ceil((top + viewport) / rowHeight));
    const first = Math.max(0, firstVisible - overscan), after = Math.min(listedEntries.length, afterVisible + overscan);
    let next: HTMLButtonElement | HTMLInputElement | null = null;
    let nextIndex = Infinity;
    for (const [index, row] of mountedRows) {
      if (index >= first && index < after) continue;
      if (row !== document.activeElement && row !== editing?.input) { row.remove(); mountedRows.delete(index); }
      else if (index >= after && index < nextIndex) { next = row; nextIndex = index; }
    }
    for (let index = after - 1; index >= first; index--) {
      let row = mountedRows.get(index);
      if (!row) {
        row = renderEntry(listedEntries[index]!);
        row.style.top = `${index * rowHeight}px`;
        row.dataset.libraryIndex = String(index);
        list.insertBefore(row, next);
        mountedRows.set(index, row);
      }
      next = row;
    }
    durationQueue.clear();
    if (!service.readLibraryDuration || save || loading || opening || deleting || candidate || renaming || editing) return;
    for (let index = firstVisible; index < afterVisible; index++) {
      const entry = listedEntries[index]!;
      if (entry.kind === 'folder') continue;
      const label = mountedRows.get(index)?.querySelector<HTMLElement>('.project-library-entry-duration');
      if (!label) continue;
      if (durationCache.has(entry.path)) {
        const text = formatDuration(durationCache.get(entry.path));
        if (label.textContent !== text) label.textContent = text;
      } else durationQueue.set(entry.path, label);
    }
    if (!readingDuration && durationQueue.size) void readDurations();
  }
  function moveListFocus(event: KeyboardEvent): void {
    if (!list || !listedEntries.length || opening || loading || deleting || renaming || editing) return;
    const focused = document.activeElement as HTMLElement | null;
    if (!focused || focused !== grid && !list.contains(focused)) return;
    const current = Number(focused.dataset.libraryIndex ?? -1);
    const viewport = grid.clientHeight || rowHeight * pageSize;
    const step = Math.max(1, Math.floor(viewport / rowHeight));
    const direction = event.key === 'ArrowUp' || event.key === 'PageUp' || event.key === 'End' ? -1 : 1;
    const target = ({
      ArrowUp: current - 1, ArrowDown: current + 1, PageUp: current - step, PageDown: current + step,
      Home: 0, End: listedEntries.length - 1,
    } as Record<string, number>)[event.key];
    if (target === undefined) return;
    let index = Math.max(0, Math.min(listedEntries.length - 1, target));
    while (save && listedEntries[index] && listedEntries[index]!.kind !== 'folder') index += direction;
    if (!listedEntries[index]) return;
    event.preventDefault(); event.stopPropagation();
    const top = index * rowHeight;
    if (top < grid.scrollTop) grid.scrollTop = top;
    else if (top + rowHeight > grid.scrollTop + viewport) grid.scrollTop = top + rowHeight - viewport;
    renderList();
    mountedRows.get(index)?.focus({ preventScroll: true });
  }
  async function chooseFolder(): Promise<void> {
    if (!service.chooseLibraryFolder || !page) return;
    opening = true; choosingFolder = true; error = ''; render();
    try {
      const selected = await service.chooseLibraryFolder(page.path);
      if (selected) {
        page = selected; grid.scrollTop = 0;
      }
    } catch (reason) { if (!disposed) error = reason instanceof Error ? reason.message : String(reason); }
    finally { choosingFolder = false; opening = false; if (!disposed) { render(); focusLibrary(); } }
  }
  async function createInDirectory(): Promise<void> {
    const start = service.startNew ?? service.create;
    if (!page || !start) { if (!loading) { close(false); onNew(); } return; }
    const path = page.path;
    const name = availableName('新建项目', page.entries);
    await finishAction(() => start(name, path), 'saved');
  }
  function formatDuration(seconds: number | undefined): string {
    if (seconds === undefined) return '';
    const rounded = Math.round(seconds);
    return `${Math.floor(rounded / 60)}:${String(rounded % 60).padStart(2, '0')}`;
  }
  async function readDurations(): Promise<void> {
    readingDuration = true;
    while (expanded && !disposed && durationQueue.size) {
      const path = durationQueue.keys().next().value!;
      const request = generation;
      const duration = await service.readLibraryDuration!(path).catch(() => undefined);
      if (disposed) break;
      if (!expanded || request !== generation) continue;
      const label = durationQueue.get(path);
      durationQueue.delete(path);
      durationCache.set(path, duration);
      if (durationCache.size > 1024) durationCache.delete(durationCache.keys().next().value!);
      if (label) label.textContent = formatDuration(duration);
    }
    readingDuration = false;
  }
  function decorateEntry(entry: ProjectLibraryEntry, item: HTMLButtonElement): void {
    if (desktopPointerUx) {
      item.dataset.libraryPath = entry.path;
      item.addEventListener('pointerenter', () => { pointedEntry = entry.path; });
      item.addEventListener('pointerleave', () => { if (pointedEntry === entry.path) pointedEntry = undefined; });
      const art = document.createElement('span'); art.className = 'project-library-entry-icon';
      art.setAttribute('aria-hidden', 'true');
      const icon = entry.kind === 'folder' ? 'folder' : welcomeLibrary ? 'note' : entry.kind === 'midi' ? 'musicLibrary' : 'score';
      art.append(libraryIcon(icon));
      const label = document.createElement('span'); label.className = 'project-library-entry-name'; label.textContent = entry.name;
      item.replaceChildren(art, label);
      if (entry.kind !== 'folder' && !save) {
        const duration = document.createElement('span'); duration.className = 'project-library-entry-duration';
        duration.textContent = formatDuration(durationCache.get(entry.path)); item.append(duration);
      }
    }
    const canRename = entry.kind === 'project' ? service.rename : service.renameEntry;
    const canDelete = desktopPointerUx && save ? undefined : entry.kind === 'project' ? service.remove : service.removeEntry;
    const canReveal = !save && entry.kind !== 'folder' && !!service.reveal;
    const canSaveHere = !!copyName && entry.kind === 'folder';
    if (!canRename && !canDelete && !canReveal && !canSaveHere) return;
    item.setAttribute('aria-haspopup', 'menu');
    item.addEventListener('contextmenu', event => {
      event.preventDefault();
      if (disposed || !expanded || opening || loading || deleting || candidate || renaming || editing || naming) return;
      closeContextMenu();
      contextTarget = item;
      const addAction = (label: string, icon: 'rename' | 'folder' | 'trash', action: () => void) => {
        const button = document.createElement('button'); button.type = 'button'; button.textContent = label; button.append(libraryIcon(icon)); button.tabIndex = -1;
        button.setAttribute('role', 'menuitem'); button.setAttribute('aria-label', `${label} ${entry.name}`);
        button.addEventListener('click', () => { closeContextMenu(true); action(); });
        contextMenu.append(button);
      };
      if (canRename) addAction('改名', 'rename', () => beginRename(entry, item));
      if (canReveal) addAction('打开所在文件夹', 'folder', () => { void reveal(entry); });
      if (canSaveHere) addAction('保存到此处', 'folder', () => {
        void load(entry.path).then(() => {
          if (disposed || loading || error || !expanded) return;
          copyName?.focus({ preventScroll: true });
          copyName?.select?.();
        });
      });
      if (canDelete) addAction('删除', 'trash', () => requestDelete(entry));
      contextMenu.hidden = false;
      const { width, height } = contextMenu.getBoundingClientRect();
      contextMenu.style.left = `${Math.max(0, Math.min(event.clientX, globalThis.innerWidth - width))}px`;
      contextMenu.style.top = `${Math.max(0, Math.min(event.clientY, globalThis.innerHeight - height))}px`;
      (contextMenu.firstElementChild as HTMLButtonElement).focus();
    });
  }
  async function reveal(entry: Exclude<ProjectLibraryEntry, { kind: 'folder' }>): Promise<void> {
    if (disposed || opening || !service.reveal) return;
    opening = true; error = ''; render();
    try { await service.reveal(entry); }
    catch (reason) { error = reason instanceof Error ? reason.message : String(reason); }
    finally { opening = false; if (!disposed) { render(); focusLibrary(); } }
  }
  function closeContextMenu(restoreFocus = false): void {
    if (!contextTarget) return;
    const item = contextTarget; contextTarget = undefined;
    contextMenu.hidden = true; contextMenu.replaceChildren();
    if (restoreFocus) item.focus();
  }
  function gridControls(): (HTMLButtonElement | HTMLInputElement)[] {
    return Array.from((list ?? grid).children) as (HTMLButtonElement | HTMLInputElement)[];
  }
  function queueFit(): void {
    if (desktopPointerUx || disposed || !expanded || layoutFrame !== undefined || typeof globalThis.requestAnimationFrame !== 'function') return;
    layoutFrame = requestAnimationFrame(() => { layoutFrame = undefined; fitPage(); });
  }
  function fitPage(): void {
    if (disposed || !expanded || editing || renaming || naming || typeof globalThis.getComputedStyle !== 'function') return;
    const pixels = (value: string) => Number.parseFloat(value) || 0;
    const outerHeight = (element: HTMLElement) => {
      if (element.hidden) return 0;
      const style = getComputedStyle(element);
      return element.getBoundingClientRect().height + pixels(style.marginTop) + pixels(style.marginBottom);
    };
    const style = getComputedStyle(dialog), footerStyle = getComputedStyle(footer);
    const viewport = globalThis.visualViewport?.height ?? globalThis.innerHeight;
    const maximum = Number.parseFloat(style.maxHeight) || viewport - 64;
    const reservedFooter = Math.max(footer.getBoundingClientRect().height, pixels(footerStyle.minHeight))
      + pixels(footerStyle.marginTop) + pixels(footerStyle.marginBottom);
    const fixed = pixels(style.paddingTop) + pixels(style.paddingBottom) + pixels(style.borderTopWidth) + pixels(style.borderBottomWidth)
      + outerHeight(header) + outerHeight(navigation) + outerHeight(note) + outerHeight(problem) + reservedFooter;
    const rowHeight = grid.firstElementChild?.getBoundingClientRect().height || 32;
    const nextSize = Math.max(1, Math.min(12, Math.floor((maximum - fixed) / rowHeight)));
    if (nextSize === pageSize) return;
    const firstVisible = pageIndex * pageSize;
    pageSize = nextSize; pageIndex = Math.floor(firstVisible / pageSize); render();
  }
  globalThis.addEventListener?.('resize', queueFit);
  globalThis.visualViewport?.addEventListener('resize', queueFit);
  function renderNavigation(): void {
    navigation.replaceChildren(); navigation.hidden = !desktopPointerUx && !page?.parent;
    if (!page) return;
    const navButton = (label: string, target: string, ariaLabel: string) => {
      const button = document.createElement('button'); button.type = 'button'; button.textContent = label;
      button.setAttribute('aria-label', ariaLabel); button.disabled = opening || deleting || !!candidate || renaming || !!editing;
      button.addEventListener('click', () => { if (!button.disabled) void load(target); }); navigation.append(button);
    };
    if (!desktopPointerUx && page.parent) navButton('←', page.parent, '返回上级文件夹');
    navButton(desktopPointerUx ? page.root.replace(/[\\/]+$/u, '').split(/[\\/]/u).at(-1)! : '⌂', page.root, '乐曲库根目录');
    const root = page.root.replaceAll('\\', '/').replace(/\/+$/u, '');
    const parts = page.path.replaceAll('\\', '/').slice(root.length).split('/').filter(Boolean);
    let target = root;
    for (const part of parts) {
      target += '/' + part;
      const separator = document.createElement('span'); separator.textContent = '/'; navigation.append(separator);
      navButton(part, target, `打开文件夹 ${part}`);
    }
    if (desktopPointerUx) navigation.lastElementChild?.setAttribute('aria-current', 'location');
  }
  function navigationBusy(): void {
    const blocked = opening || deleting || !!candidate || renaming || !!editing || naming || !folderForm.hidden;
    for (const item of [...Array.from(actions.children), ...Array.from(navigation.children)])
      if (item.tagName.toLowerCase() === 'button') (item as HTMLButtonElement).disabled = blocked;
    if (welcomeLibrary && (loading || !page || !service.createFolder)) {
      const createFolder = actions.querySelector<HTMLButtonElement>('.project-library-new-folder');
      if (createFolder) createFolder.disabled = true;
    }
    if (desktopPointerUx && loading) {
      const create = actions.querySelector<HTMLButtonElement>('.project-library-new');
      if (create) create.disabled = true;
    }
    const singlePage = (page?.entries.length ?? projects.length) <= pageSize;
    previousPage.disabled = blocked || loading || singlePage;
    nextPage.disabled = blocked || loading || singlePage;
    pageNumber.disabled = blocked || loading;
    discard.disabled = blocked || !save?.discard;
    original.disabled = blocked || loading || !save?.original;
    copy.disabled = blocked || loading || !page;
    if (submitCopy && copyName) { submitCopy.disabled = copy.disabled; copyName.disabled = opening || naming; }
    submitFolder.disabled = naming; cancelFolder.disabled = naming; folderName.disabled = naming;
  }
  function turnPage(next: number, loop = false): void {
    if (opening || deleting || candidate || renaming || editing || loading) return;
    const pages = Math.max(1, Math.ceil((page?.entries.length ?? projects.length) / pageSize));
    const requested = Number.isFinite(next) ? Math.trunc(next) : pageIndex;
    pageIndex = loop ? ((requested % pages) + pages) % pages : Math.max(0, Math.min(pages - 1, requested));
    grid.scrollTop = 0; render();
  }
  previousPage.addEventListener('click', () => turnPage(pageIndex - 1, true));
  nextPage.addEventListener('click', () => turnPage(pageIndex + 1, true));
  pageNumber.addEventListener('change', () => turnPage(Number(pageNumber.value) - 1));
  pageNumber.addEventListener('keydown', event => {
    if (event.key === 'Enter') { event.preventDefault(); event.stopPropagation(); turnPage(Number(pageNumber.value) - 1); }
  });
  function renameBusy(): void {
    closeButton.disabled = renaming;
    for (const item of gridControls()) item.disabled = renaming;
    dialog.setAttribute('aria-busy', String(renaming));
    navigationBusy();
  }
  function cancelRename(): void {
    if (renaming) return;
    editing = undefined; error = ''; render(); focusLibrary();
  }
  function beginRename(project: ProjectLibraryEntry, tile: HTMLButtonElement): void {

    if (disposed || !expanded || opening || deleting || candidate || renaming || editing) return;
    if (!(project.kind === 'project' ? service.rename : service.renameEntry)) { error = '当前窗口暂不支持改名，请重新打开 RootSound。'; problem.textContent = error; problem.hidden = false; return; }
    const input = document.createElement('input'); input.type = 'text'; input.className = 'project-library-tile project-library-name';
    input.value = project.name; input.maxLength = 80; input.setAttribute('aria-label', '乐曲名称'); input.autocomplete = 'off'; input.spellcheck = false;
    editing = { project: { ...project }, input };
    if (list) {
      const index = Number(tile.dataset.libraryIndex);
      input.dataset.libraryIndex = String(index);
      input.style.top = tile.style.top;
      mountedRows.set(index, input);
    }
    tile.replaceWith(input); error = ''; problem.hidden = true;
    navigationBusy();
    input.addEventListener('blur', () => { void commitRename(); });
    input.addEventListener('keydown', event => {
      if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); cancelRename(); }
      if (event.key === 'Enter') { event.preventDefault(); event.stopPropagation(); void commitRename(); }
    });
    input.focus(); input.select?.();
  }
  async function commitRename(): Promise<void> {
    const current = editing; if (!current || renaming || disposed || !expanded) return;
    const name = current.input.value.trim();
    if (!name) { error = '名称不能为空。'; problem.textContent = error; problem.hidden = false; current.input.focus(); return; }
    if (name === current.project.name) { cancelRename(); return; }
    renaming = true; renameBusy(); problem.hidden = true;
    try {
      if (current.project.kind !== 'project') {
        await service.renameEntry!(current.project.path, name);
        if (!disposed && editing === current) { editing = undefined; renaming = false; await load(); }
        return;
      }
      const { kind: _kind, ...target } = current.project;
      const renamed = await service.rename!(target, name);
      if (disposed || editing !== current || !expanded) return;
      projects = projects.map(item => item.path === target.path && item.id === target.id ? renamed : item);
      if (page) page.entries = page.entries.map(item => item.kind === 'project' && item.path === current.project.path ? { kind: 'project', ...renamed } : item);
      editing = undefined; renaming = false; error = ''; render();
    } catch (reason) {
      if (!disposed && editing === current) { error = reason instanceof Error ? reason.message : String(reason); problem.textContent = error; problem.hidden = false; }
    } finally {
      renaming = false;
      if (!disposed && editing === current) { renameBusy(); current.input.focus(); }
    }
  }
  function endDrag(): void {
    dragged = undefined; trash.hidden = true; trash.className = 'project-library-trash';
  }
  function cancelDelete(): void {
    if (deleting) return;
    candidate = undefined; confirmation.hidden = true; dialog.inert = false; render(); focusLibrary();
  }
  function requestDelete(project: ProjectLibraryEntry): void {
    if (candidate || deleting || editing || renaming || !(project.kind === 'project' ? service.remove : service.removeEntry)) return;

    candidate = { ...project };
    warningText.hidden = project.kind !== 'project' && project.kind !== 'folder';
    warningText.textContent = project.kind === 'folder' ? '文件夹及其中的内容将被删除，无法撤销。' : '工程和全部素材将被删除，无法撤销。';
    warningTitle.textContent = `彻底删除“${project.name}”？`;
    warningError.textContent = ''; warningError.hidden = true; confirmation.hidden = false;
    dialog.inert = true; render(); cancel.focus();
  }
  async function deleteProject(): Promise<void> {
    if (!candidate || deleting || disposed) return;
    const target = candidate; deleting = true; cancel.disabled = true; confirm.disabled = true; warningError.hidden = true;
    try {
      const result = target.kind === 'project' ? await service.remove!({ id: target.id, path: target.path, name: target.name }) : await service.removeEntry!(target.path);
      if (disposed) return;
      projects = projects.filter(item => item.path !== target.path); deleting = false; cancelDelete();
      await load();
      if (!disposed && expanded && result?.warning) { error = [error, result.warning].filter(Boolean).join('\n'); render(); }
    } catch (reason) {
      if (!disposed) { warningError.textContent = reason instanceof Error ? reason.message : String(reason); warningError.hidden = false; }
    } finally { deleting = false; if (!disposed) { cancel.disabled = false; confirm.disabled = false; if (candidate) cancel.focus(); } }
  }
  trash.addEventListener('dragover', event => {
    if (!dragged || candidate || deleting) return;
    event.preventDefault(); event.stopPropagation(); if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
    trash.className = 'project-library-trash is-over';
  });
  trash.addEventListener('dragleave', () => { trash.className = 'project-library-trash'; });
  trash.addEventListener('drop', event => {
    event.preventDefault(); event.stopPropagation();
    const target = dragged;
    if (!target || !event.dataTransfer || disposed || !expanded) { endDrag(); return; }
    let payload: { id?: unknown; path?: unknown };
    try { payload = JSON.parse(event.dataTransfer.getData('application/x-rootsound-project')); }
    catch { endDrag(); return; }
    endDrag(); suppressOpenUntil = Date.now() + 180;
    if (payload?.id === target.id && payload.path === target.path) requestDelete({ kind: 'project', ...target });
  });
  cancel.addEventListener('click', cancelDelete); confirm.addEventListener('click', () => { void deleteProject(); });
  confirmation.addEventListener('pointerdown', event => { if (event.target === confirmation) cancelDelete(); });
  async function load(path = page?.path): Promise<void> {
    if (opening || deleting || candidate || renaming || editing || naming) return;
    const request = ++generation; loading = true; error = ''; projects = []; render();
    try {
      if (service.browse) {
        const listed = await service.browse(path); if (disposed || request !== generation) return;
        if (page?.path !== listed.path) pageIndex = 0;
        page = listed; projects = listed.entries.filter((item): item is { kind: 'project' } & ProjectDirectory => item.kind === 'project');
        grid.scrollTop = 0;
      } else {
        if (!service.list) throw new Error('暂时无法读取乐曲库，请选择项目文件。');
        const listed = await service.list(); if (disposed || request !== generation) return;
        projects = listed;
      }
    } catch (reason) { if (!disposed && request === generation) error = reason instanceof Error ? reason.message : String(reason); }
    finally { if (!disposed && request === generation) { loading = false; render(); } }
  }
  function openLibrary(): void {
    if (disposed || expanded || (!overlay.hidden && !overlay.inert) || opening) return;
    expanded = true; overlay.hidden = false; updateExpanded(true);
    overlay.inert = false;
    clearWelcomeMotion();
    welcomePage?.classList.remove('is-welcome-library-returning');
    if (welcomePage) welcomePage.inert = true;
    setWelcomeLibraryOpen(true);
    const guided = guide?.enterLibrary();
    animateLibrary(true);
    void load(guided ? page?.root : save?.source?.pendingSave ? save.source.path : undefined);
    if (copyName) copyName.focus({ preventScroll: true }); else focusLibrary();
  }
  function handleFileShortcut(event: KeyboardEvent): boolean {
    if (!desktopPointerUx || event.altKey || !event.ctrlKey || event.metaKey || event.shiftKey || event.isComposing ||
      candidate || editing || !folderForm.hidden ||
      [event.target, document.activeElement].some(target => {
        const element = target as HTMLElement | null;
        return ['input', 'textarea', 'select'].includes(element?.tagName?.toLowerCase() ?? '') || element?.isContentEditable;
      })) return false;
    const key = event.key.toLowerCase();
    if (!['c', 'x', 'v', 'z'].includes(key) || !service.transferEntry) return false;
    event.preventDefault();
    event.stopPropagation();
    if (opening || loading || deleting || choosingFolder || renaming || event.repeat) return true;
    if (key === 'c' || key === 'x') {
      const row = contextTarget ?? (document.activeElement as HTMLElement | null)?.closest<HTMLElement>('.project-library-tile');
      const path = row?.dataset.libraryPath ?? pointedEntry;
      if (path && page?.entries.some(entry => entry.path === path)) {
        sourceClipboard = { path, cut: key === 'x' };
        closeContextMenu(true);
      }
      return true;
    }
    const clipboard = sourceClipboard;
    const directory = page?.path;
    const transfer = key === 'z' ? service.undoEntryTransfer :
      (clipboard && directory ? () => service.transferEntry!(clipboard.path, directory, clipboard.cut) : undefined);
    if (!transfer) return true;
    closeContextMenu(true);
    opening = true;
    void transfer().then(async () => {
      if (key === 'v' && clipboard?.cut && clipboard === sourceClipboard) sourceClipboard = undefined;
      if (!disposed && expanded) {
        durationCache.clear();
        await load(directory);
        focusLibrary();
      }
    }, reason => {
      if (disposed || !expanded) return;
      error = reason instanceof Error ? reason.message : String(reason);
      render();
      focusLibrary();
    }).finally(() => { opening = false; if (!disposed && expanded) navigationBusy(); });
    return true;
  }
  closeButton.addEventListener('click', () => close());
  overlay.addEventListener('pointerdown', event => {
    if (contextTarget) {
      if (!contextMenu.contains(event.target as Node)) closeContextMenu(true);
      return;
    }
    if (!desktopPointerUx && event.target === overlay) close();
  });
  const key = (event: KeyboardEvent) => {
    if (!expanded || disposed || naming || event.defaultPrevented) return;
    if (desktopPointerUx && container.querySelector('dialog[open], .workspace-inline-panel[open]:not(.song-exit-choice)')) return;
    if (guideTarget !== undefined) return;
    if (handleFileShortcut(event)) return;
    if (contextTarget) {
      if (event.key === 'Tab') closeContextMenu(true);
      else {
        if (event.key === 'Escape' || event.key === 'ArrowUp' || event.key === 'ArrowDown') {
          event.preventDefault(); event.stopPropagation();
          if (event.key === 'Escape') closeContextMenu(true);
          else {
            const items = Array.from(contextMenu.children) as HTMLButtonElement[];
            const current = items.indexOf(document.activeElement as HTMLButtonElement);
            items[(current + items.length + (event.key === 'ArrowDown' ? 1 : -1)) % items.length]?.focus();
          }
        }
        return;
      }
    }
    if (event.key === 'Escape') {
      event.preventDefault(); event.stopPropagation();
      if (candidate) cancelDelete();
      else if (editing) cancelRename();
      else if (!folderForm.hidden) closeFolderForm();
      else if (welcomeLibrary && page?.parent) void load(page.parent);
      else close();
      return;
    }
    if (desktopPointerUx && !candidate) {
      if ((event.key === 'Backspace' || event.key === 'BrowserBack') && !editing && folderForm.hidden
        && event.target !== copyName && !event.isComposing && page?.parent) {
        event.preventDefault(); event.stopPropagation(); void load(page.parent);
      }
      if (!event.defaultPrevented && !event.altKey && !event.ctrlKey && !event.metaKey && !event.isComposing) moveListFocus(event);
      return;
    }
    if ((event.key === 'ArrowLeft' || event.key === 'ArrowRight') && !editing && !candidate && !event.isComposing
      && !event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.defaultPrevented) {
      const typing = [event.target, document.activeElement].some(target => {
        const element = target as HTMLElement | null;
        return ['input', 'textarea', 'select'].includes(element?.tagName?.toLowerCase() ?? '') || element?.isContentEditable;
      });
      if (!typing) {
        event.preventDefault(); event.stopPropagation();
        const direction = event.key === 'ArrowRight' ? 1 : -1;
        turnPage(pageIndex + direction, true);
      }
    }
    if ((event.key === 'PageDown' || event.key === 'PageUp') && !editing && event.target !== pageNumber) {
      event.preventDefault();
      const direction = event.key === 'PageDown' ? 1 : -1;
      turnPage(pageIndex + direction, true);
    }
    if (event.key === 'Tab') {
      const navigationButtons = Array.from(navigation.children).filter(item => item.tagName.toLowerCase() === 'button') as HTMLButtonElement[];
      const toolbarButtons = Array.from(actions.children) as HTMLButtonElement[];
      const pageControls = pagination.hidden ? [] : [previousPage, pageNumber, nextPage];
      const controls = (candidate ? [cancel, confirm] : [...(desktopPointerUx ? [] : [closeButton]), ...toolbarButtons, ...(navigation.hidden ? [] : navigationButtons), ...gridControls(), ...pageControls, ...(save ? [discard, copy, original] : [])]).filter(button => !button.disabled);
      const index = controls.indexOf(document.activeElement as HTMLButtonElement);
      if (!controls.length || index < 0 || event.shiftKey && index === 0 || !event.shiftKey && index === controls.length - 1) {
        event.preventDefault(); (event.shiftKey ? controls.at(-1) : controls[0])?.focus();
      }
    }
  };
  document.addEventListener('keydown', key);
  return {
    awaitingInput() {
      return expanded && (choosingFolder || !loading && !opening && !deleting && !renaming && !naming);
    },
    open: openLibrary,
    refreshGuide(reload = false) { if (expanded) { if (reload) void load(''); else render(); } },
    dispose() {
      if (disposed) return;
      edgeGesture?.dispose(); libraryMotion?.cancel();
      welcomePage?.classList.remove('is-welcome-library-returning');
      if (!overlay.hidden) setWelcomeLibraryOpen(false);
      welcomePage?.classList.remove('has-library-bridge');
      if (welcomePage) welcomePage.inert = false;
      listResize?.disconnect(); durationQueue.clear();
      if (warmup !== undefined) cancelIdleCallback(warmup);
      if (layoutFrame !== undefined) cancelAnimationFrame(layoutFrame);
      if (listFrame !== undefined) cancelAnimationFrame(listFrame);
      globalThis.removeEventListener?.('resize', queueFit);
      globalThis.visualViewport?.removeEventListener('resize', queueFit);
      disposed = true; generation++; editing = undefined; endDrag(); document.removeEventListener('keydown', key); overlay.remove();
      updateExpanded(false);
    },
  };
}
