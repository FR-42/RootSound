import type { ProjectDirectory, ProjectLibraryEntry, ProjectLibraryPage, ProjectSaveChoice, ProjectSetupPort } from '../../contracts/project-directory.ts';
import { showProjectNameDialog } from './project-save-as.ts';
import { libraryClickDelay } from './library-click.ts';
import './project-library.css';

/** The welcome page's only entry: discover songs, create one, or pick a file. */
export function mountProjectLibrary(container: HTMLElement, trigger: HTMLButtonElement, service: Pick<ProjectSetupPort, 'open' | 'list' | 'browse' | 'remove' | 'rename' | 'createFolder' | 'renameEntry' | 'removeEntry'>,
  onNew: () => void, doubleClickIntervalMs?: number, save?: {
    source?: ProjectDirectory; name: string; original?: () => Promise<void>; discard?: () => Promise<void>;
    copy(name: string, path: string): Promise<void>; finish(choice: ProjectSaveChoice): void;
  }): { open(): void; dispose(): void } {
  let disposed = false; let expanded = false; let opening = false; let generation = 0;
  let projects: ProjectDirectory[] = []; let loading = false; let error = '';
  let page: ProjectLibraryPage | undefined;
  let pageSize = 12;
  let pageIndex = 0;
  let layoutFrame: number | undefined;
  let warmup: number | undefined;
  let dragged: ProjectDirectory | undefined; let suppressOpenUntil = 0;
  let candidate: ProjectLibraryEntry | undefined; let deleting = false; let naming = false;
  let pendingOpen: ReturnType<typeof setTimeout> | undefined;
  let editing: { project: ProjectLibraryEntry; input: HTMLInputElement } | undefined; let renaming = false;
  let contextTarget: HTMLButtonElement | undefined;
  const overlay = document.createElement('div'); overlay.className = 'project-library-overlay'; overlay.hidden = true;
  const dialog = document.createElement('section'); dialog.className = 'project-library';
  dialog.setAttribute('role', 'dialog'); dialog.setAttribute('aria-modal', 'true'); dialog.setAttribute('aria-label', '乐曲库');
  const header = document.createElement('header'); header.className = 'project-library-header';
  const title = document.createElement('h2'); title.textContent = '乐曲库';
  const actions = document.createElement('div'); actions.className = 'project-library-actions';
  const closeButton = document.createElement('button'); closeButton.type = 'button'; closeButton.textContent = '×';
  closeButton.className = 'project-library-close'; closeButton.setAttribute('aria-label', '关闭乐曲库');
  const grid = document.createElement('div'); grid.className = 'project-library-grid';
  const navigation = document.createElement('nav'); navigation.className = 'project-library-navigation'; navigation.hidden = true;
  navigation.setAttribute('aria-label', '乐曲库文件夹');
  const note = document.createElement('p'); note.className = 'project-library-note';
  const problem = document.createElement('p'); problem.className = 'project-library-error'; problem.setAttribute('role', 'alert');
  const footer = document.createElement('footer'); footer.className = 'project-library-footer';
  const pagination = document.createElement('div'); pagination.className = 'project-library-pagination'; pagination.hidden = true;
  const previousPage = document.createElement('button'); previousPage.type = 'button'; previousPage.textContent = '‹'; previousPage.setAttribute('aria-label', '上一页');
  previousPage.title = '上一页（←）'; previousPage.setAttribute('aria-keyshortcuts', 'ArrowLeft');
  const pageNumber = document.createElement('input'); pageNumber.type = 'number'; pageNumber.min = '1'; pageNumber.title = '输入页码跳转'; pageNumber.setAttribute('aria-label', '页码');
  const pageTotal = document.createElement('span');
  const nextPage = document.createElement('button'); nextPage.type = 'button'; nextPage.textContent = '›'; nextPage.setAttribute('aria-label', '下一页');
  nextPage.title = '下一页（→）'; nextPage.setAttribute('aria-keyshortcuts', 'ArrowRight');
  pagination.append(previousPage, pageNumber, pageTotal, nextPage); footer.append(pagination);
  const saveActions = document.createElement('div'); saveActions.className = 'project-library-save-actions';
  const discard = document.createElement('button'); discard.type = 'button'; discard.textContent = '直接退出';
  const original = document.createElement('button'); original.type = 'button'; original.textContent = '保存';
  const copy = document.createElement('button'); copy.type = 'button'; copy.textContent = '另存为';
  if (save) {
    if (save.discard) saveActions.append(discard);
    saveActions.append(copy, original); footer.append(saveActions);
  }
  const contextMenu = document.createElement('div'); contextMenu.className = 'project-library-context'; contextMenu.hidden = true;
  contextMenu.setAttribute('role', 'menu');
  header.append(title, actions, closeButton); dialog.append(header, navigation, grid, note, problem, footer, contextMenu); overlay.append(dialog); container.append(overlay);
  overlay.addEventListener('wheel', event => { event.preventDefault(); event.stopPropagation(); }, { passive: false });
  const trash = document.createElement('div'); trash.className = 'project-library-trash'; trash.hidden = true;
  trash.setAttribute('role', 'region'); trash.setAttribute('aria-label', '删除乐曲项目');
  const trashIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); trashIcon.setAttribute('viewBox', '0 0 24 24'); trashIcon.setAttribute('aria-hidden', 'true');
  const trashPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  trashPath.setAttribute('d', 'M4 6h16M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7m4-7v7');
  for (const [key, value] of Object.entries({ fill: 'none', stroke: 'currentColor', 'stroke-width': '1.6', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' })) trashPath.setAttribute(key, value);
  trashIcon.append(trashPath); trash.append(trashIcon); overlay.append(trash);
  const confirmation = document.createElement('div'); confirmation.className = 'project-delete-overlay'; confirmation.hidden = true;
  const warning = document.createElement('section'); warning.className = 'project-delete-warning'; warning.setAttribute('role', 'alertdialog');
  warning.setAttribute('aria-modal', 'true'); warning.setAttribute('aria-label', '彻底删除乐曲项目');
  const warningTitle = document.createElement('h3');
  const warningText = document.createElement('p'); warningText.textContent = '工程和全部素材将被删除，无法撤销。';
  const warningError = document.createElement('p'); warningError.className = 'project-library-error'; warningError.setAttribute('role', 'alert'); warningError.hidden = true;
  const warningActions = document.createElement('div'); warningActions.className = 'project-delete-actions';
  const cancel = document.createElement('button'); cancel.type = 'button'; cancel.textContent = '取消'; cancel.setAttribute('aria-label', '取消删除乐曲');
  const confirm = document.createElement('button'); confirm.type = 'button'; confirm.textContent = '彻底删除'; confirm.setAttribute('aria-label', '确认彻底删除乐曲');
  warningActions.append(cancel, confirm); warning.append(warningTitle, warningText, warningError, warningActions); confirmation.append(warning); overlay.append(confirmation);
  trigger.setAttribute('aria-haspopup', 'dialog'); trigger.setAttribute('aria-expanded', 'false');
  // Warm the first small directory only after the welcome page has painted.
  if (!save && service.browse && typeof globalThis.requestIdleCallback === 'function') {
    warmup = requestIdleCallback(() => {
      warmup = undefined;
      if (disposed || expanded || generation !== 0) return;
      void service.browse!().then(listed => {
        if (disposed || expanded || generation !== 0) return;
        page = listed;
      }).catch(() => { /* Opening the library retries and presents any error. */ });
    }, { timeout: 1000 });
  }

  function close(restoreFocus = true, choice: ProjectSaveChoice = 'cancelled'): void {
    if (opening || deleting || candidate || renaming || naming) return;
    closeContextMenu(); clearPendingOpen(); editing = undefined; endDrag();
    expanded = false; generation++; loading = false; overlay.hidden = true;
    trigger.setAttribute('aria-expanded', 'false'); if (restoreFocus) trigger.focus();
    save?.finish(choice);
  }
  function tile(label: string, className: string, callback: () => void, ariaLabel = label, toolbar = false): HTMLButtonElement {
    const button = document.createElement('button'); button.type = 'button'; button.className = `${toolbar ? 'project-library-action' : 'project-library-tile'} ${className}`;
    button.textContent = label; button.setAttribute('aria-label', ariaLabel); button.disabled = opening || deleting || !!candidate || renaming;
    button.addEventListener('click', () => { if (!disposed && expanded && !opening && !deleting && !candidate && !renaming) callback(); }); return button;
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
    const saved = await showProjectNameDialog(container, copy.textContent!, suggested, '保存', name => save.copy(name, path));
    naming = false;
    if (saved) close(true, 'saved');
  }
  async function newFolder(): Promise<void> {
    if (!page || !service.createFolder || naming) return;
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
    opening = true; error = ''; render();
    try {
      // Successful native opens reload the application. A cancelled picker leaves
      // this library available so the user can choose a different starting point.
      await service.open(path);
    } catch (reason) { if (!disposed) error = reason instanceof Error ? reason.message : String(reason); }
    finally { opening = false; if (!disposed) render(); }
  }
  function render(): void {
    if (disposed) return;
    closeContextMenu(); clearPendingOpen();
    grid.replaceChildren(); dialog.setAttribute('aria-busy', String(loading || opening || deleting || renaming)); closeButton.disabled = opening || deleting || !!candidate || renaming;
    renderNavigation();
    actions.replaceChildren();
    const create = tile('＋ 新建', 'project-library-new', () => { close(false); onNew(); }, '新的开始', true);
    const custom = tile('打开', 'project-library-custom', () => { void openProject(); }, '选择音乐文件', true);
    if (page && service.createFolder) actions.append(tile('新建文件夹', 'project-library-new-folder', () => { void newFolder(); }, '新建文件夹', true));
    if (!save) actions.append(create, custom);
    custom.title = '打开简乐、MIDI 或 MusicXML 文件';
    const entries: ProjectLibraryEntry[] = page?.entries ?? projects.map(project => ({ kind: 'project', ...project }));
    const totalPages = Math.max(1, Math.ceil(entries.length / pageSize));
    grid.className = 'project-library-grid' + (totalPages > 1 ? ' has-pages' : '');
    pageIndex = Math.min(pageIndex, totalPages - 1);
    pagination.hidden = totalPages <= 1;
    footer.hidden = !save && pagination.hidden;
    dialog.style?.setProperty('--library-page-rows', String(pageSize));
    pageNumber.value = String(pageIndex + 1); pageNumber.max = String(totalPages); pageTotal.textContent = `/ ${totalPages}`;
    for (const entry of entries.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize)) {
      if (entry.kind === 'folder') {
        const folder = tile(entry.name, 'project-library-folder', () => { void load(entry.path); }, `打开文件夹 ${entry.name}`);
        folder.title = entry.path; appendEntry(entry, folder); continue;
      }
      if (entry.kind === 'midi' || entry.kind === 'document') {
        const midi = tile(entry.name, 'project-library-midi', () => { void openProject(entry.path); }, save ? entry.name : `打开 ${entry.name}`);
        midi.title = save ? entry.name : `打开 ${entry.name}`; appendEntry(entry, midi); continue;
      }
      const project = entry;
      const item = tile(project.name, 'project-library-song', () => {
        if (save || dragged || editing || Date.now() < suppressOpenUntil) return;
        clearPendingOpen(); pendingOpen = setTimeout(() => { pendingOpen = undefined; void openProject(project.path); }, libraryClickDelay(doubleClickIntervalMs));
      });
      if (!save) item.addEventListener('dblclick', event => { event.preventDefault(); event.stopPropagation(); beginRename(project, item); });
      item.draggable = !save && !!service.remove;
      item.addEventListener('dragstart', event => {
        if (save || !service.remove || !event.dataTransfer || opening || deleting || candidate || editing || renaming || disposed || !expanded) { event.preventDefault(); return; }
        clearPendingOpen();
        dragged = { ...project }; event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('application/x-rootsound-project', JSON.stringify({ id: project.id, path: project.path }));
        trash.hidden = false;
      });
      item.addEventListener('dragend', () => { suppressOpenUntil = Date.now() + 180; endDrag(); });
      item.title = project.name; appendEntry(project, item);
    }
    navigationBusy();
    note.textContent = loading ? '读取项目…' : page && entries.length === 0 ? '这个文件夹还没有工程或 MIDI。' : '';
    note.hidden = !note.textContent;
    problem.textContent = error; problem.hidden = !error;
    queueFit();
  }
  function appendEntry(entry: ProjectLibraryEntry, item: HTMLButtonElement): void {
    grid.append(item);
    const canRename = entry.kind === 'project' ? service.rename : service.renameEntry;
    const canDelete = entry.kind === 'project' ? service.remove : service.removeEntry;
    if (!canRename && !canDelete) return;
    item.setAttribute('aria-haspopup', 'menu');
    item.addEventListener('contextmenu', event => {
      event.preventDefault();
      if (disposed || !expanded || opening || loading || deleting || candidate || renaming || editing || naming) return;
      clearPendingOpen(); closeContextMenu();
      contextTarget = item;
      const addAction = (label: string, action: () => void) => {
        const button = document.createElement('button'); button.type = 'button'; button.textContent = label; button.tabIndex = -1;
        button.setAttribute('role', 'menuitem'); button.setAttribute('aria-label', `${label} ${entry.name}`);
        button.addEventListener('click', () => { closeContextMenu(true); action(); });
        contextMenu.append(button);
      };
      if (canRename) addAction('改名', () => beginRename(entry, item));
      if (canDelete) addAction('删除', () => requestDelete(entry));
      contextMenu.hidden = false;
      const { width, height } = contextMenu.getBoundingClientRect();
      contextMenu.style.left = `${Math.max(0, Math.min(event.clientX, globalThis.innerWidth - width))}px`;
      contextMenu.style.top = `${Math.max(0, Math.min(event.clientY, globalThis.innerHeight - height))}px`;
      (contextMenu.firstElementChild as HTMLButtonElement).focus();
    });
  }
  function closeContextMenu(restoreFocus = false): void {
    if (!contextTarget) return;
    const item = contextTarget; contextTarget = undefined;
    contextMenu.hidden = true; contextMenu.replaceChildren();
    if (restoreFocus) item.focus();
  }
  function gridControls(): (HTMLButtonElement | HTMLInputElement)[] {
    return Array.from(grid.children) as (HTMLButtonElement | HTMLInputElement)[];
  }
  function queueFit(): void {
    if (disposed || !expanded || layoutFrame !== undefined || typeof globalThis.requestAnimationFrame !== 'function') return;
    layoutFrame = requestAnimationFrame(() => { layoutFrame = undefined; fitPage(); });
  }
  function fitPage(): void {
    if (disposed || !expanded || editing || renaming || typeof globalThis.getComputedStyle !== 'function') return;
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
    navigation.replaceChildren(); navigation.hidden = !page?.parent;
    if (!page) return;
    const navButton = (label: string, target: string, ariaLabel: string) => {
      const button = document.createElement('button'); button.type = 'button'; button.textContent = label;
      button.setAttribute('aria-label', ariaLabel); button.disabled = opening || deleting || !!candidate || renaming || !!editing;
      button.addEventListener('click', () => { if (!button.disabled) void load(target); }); navigation.append(button);
    };
    if (page.parent) navButton('←', page.parent, '返回上级文件夹');
    navButton('⌂', page.root, '乐曲库根目录');
    const root = page.root.replaceAll('\\', '/').replace(/\/+$/u, '');
    const parts = page.path.replaceAll('\\', '/').slice(root.length).split('/').filter(Boolean);
    let target = root;
    for (const part of parts) {
      target += '/' + part;
      const separator = document.createElement('span'); separator.textContent = '/'; navigation.append(separator);
      navButton(part, target, `打开文件夹 ${part}`);
    }
  }
  function navigationBusy(): void {
    const blocked = opening || deleting || !!candidate || renaming || !!editing;
    for (const item of [...Array.from(actions.children), ...Array.from(navigation.children)])
      if (item.tagName.toLowerCase() === 'button') (item as HTMLButtonElement).disabled = blocked;
    const singlePage = (page?.entries.length ?? projects.length) <= pageSize;
    previousPage.disabled = blocked || loading || singlePage;
    nextPage.disabled = blocked || loading || singlePage;
    pageNumber.disabled = blocked || loading;
    discard.disabled = blocked || !save?.discard;
    original.disabled = blocked || loading || !save?.original;
    copy.disabled = blocked || loading || !page;
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
  function clearPendingOpen(): void { if (pendingOpen !== undefined) { clearTimeout(pendingOpen); pendingOpen = undefined; } }
  function renameBusy(): void {
    closeButton.disabled = renaming;
    for (const item of gridControls()) item.disabled = renaming;
    dialog.setAttribute('aria-busy', String(renaming));
    navigationBusy();
  }
  function cancelRename(): void {
    if (renaming) return;
    editing = undefined; error = ''; render(); closeButton.focus();
  }
  function beginRename(project: ProjectLibraryEntry, tile: HTMLButtonElement): void {
    clearPendingOpen();
    if (disposed || !expanded || opening || deleting || candidate || renaming || editing) return;
    if (!(project.kind === 'project' ? service.rename : service.renameEntry)) { error = '当前窗口暂不支持改名，请重新打开 RootSound。'; problem.textContent = error; problem.hidden = false; return; }
    const input = document.createElement('input'); input.type = 'text'; input.className = 'project-library-tile project-library-name';
    input.value = project.name; input.maxLength = 80; input.setAttribute('aria-label', '乐曲名称'); input.autocomplete = 'off'; input.spellcheck = false;
    editing = { project: { ...project }, input }; tile.replaceWith(input); error = ''; problem.hidden = true;
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
  function endDrag(): void { dragged = undefined; trash.hidden = true; trash.className = 'project-library-trash'; }
  function cancelDelete(): void {
    if (deleting) return;
    candidate = undefined; confirmation.hidden = true; dialog.inert = false; render(); closeButton.focus();
  }
  function requestDelete(project: ProjectLibraryEntry): void {
    if (candidate || deleting || editing || renaming || !(project.kind === 'project' ? service.remove : service.removeEntry)) return;
    clearPendingOpen();
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
    if (opening || deleting || candidate || renaming || editing) return;
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
  closeButton.addEventListener('click', () => close());
  overlay.addEventListener('pointerdown', event => {
    if (contextTarget) {
      if (!contextMenu.contains(event.target as Node)) closeContextMenu(true);
      return;
    }
    if (event.target === overlay) close();
  });
  const key = (event: KeyboardEvent) => {
    if (!expanded || disposed || naming) return;
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
    if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); if (candidate) cancelDelete(); else if (editing) cancelRename(); else close(); }
    if ((event.key === 'ArrowLeft' || event.key === 'ArrowRight') && !editing && !candidate && !event.isComposing
      && !event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.defaultPrevented) {
      const typing = [event.target, document.activeElement].some(target => {
        const element = target as HTMLElement | null;
        return ['input', 'textarea', 'select'].includes(element?.tagName?.toLowerCase() ?? '') || element?.isContentEditable;
      });
      if (!typing) { event.preventDefault(); event.stopPropagation(); turnPage(pageIndex + (event.key === 'ArrowRight' ? 1 : -1), true); }
    }
    if ((event.key === 'PageDown' || event.key === 'PageUp') && !editing && event.target !== pageNumber) {
      event.preventDefault(); turnPage(pageIndex + (event.key === 'PageDown' ? 1 : -1), true);
    }
    if (event.key === 'Tab') {
      const navigationButtons = Array.from(navigation.children).filter(item => item.tagName.toLowerCase() === 'button') as HTMLButtonElement[];
      const toolbarButtons = Array.from(actions.children) as HTMLButtonElement[];
      const pageControls = pagination.hidden ? [] : [previousPage, pageNumber, nextPage];
      const controls = (candidate ? [cancel, confirm] : [closeButton, ...toolbarButtons, ...(navigation.hidden ? [] : navigationButtons), ...gridControls(), ...pageControls, ...(save ? [discard, copy, original] : [])]).filter(button => !button.disabled);
      const index = controls.indexOf(document.activeElement as HTMLButtonElement);
      if (!controls.length || index < 0 || event.shiftKey && index === 0 || !event.shiftKey && index === controls.length - 1) {
        event.preventDefault(); (event.shiftKey ? controls.at(-1) : controls[0])?.focus();
      }
    }
  };
  document.addEventListener('keydown', key);
  return {
    open() {
      if (disposed || expanded || opening) return;
      expanded = true; overlay.hidden = false; trigger.setAttribute('aria-expanded', 'true');
      void load(); closeButton.focus();
    },
    dispose() {
      if (disposed) return;
      if (warmup !== undefined) cancelIdleCallback(warmup);
      if (layoutFrame !== undefined) cancelAnimationFrame(layoutFrame);
      globalThis.removeEventListener?.('resize', queueFit);
      globalThis.visualViewport?.removeEventListener('resize', queueFit);
      disposed = true; generation++; clearPendingOpen(); editing = undefined; endDrag(); document.removeEventListener('keydown', key); overlay.remove();
      trigger.setAttribute('aria-expanded', 'false');
    },
  };
}
