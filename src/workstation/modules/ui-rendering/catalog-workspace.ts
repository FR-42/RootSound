import type { MaterialCatalogPort, CatalogKind } from '../../contracts/catalog.ts';
import type { ContentRecord, Draft } from '../../contracts/content.ts';
import type { SoundRuntimePort, PlaybackSession } from '../../contracts/sound.ts';
import './workspace.css';

function node<K extends keyof HTMLElementTagNameMap>(tag: K, cls = '', text = ''): HTMLElementTagNameMap[K] {
  const value = document.createElement(tag); value.className = cls; value.textContent = text; return value;
}
function button(label: string, cls: string, callback: () => void): HTMLButtonElement {
  const value = node('button', cls, label); value.type = 'button'; value.addEventListener('click', callback); return value;
}
const names: Record<string, string> = { 'rootsound.timbre': '音色', 'rootsound.phrase': '乐句', 'rootsound.song': '歌曲', 'rootsound.co-creation': '灵感旅途', 'rootsound.sample': '采样' };

export function mountCatalogWorkspace(root: HTMLElement, options: {
  catalog: MaterialCatalogPort; sound: SoundRuntimePort;
  onSound(): void; onPhrase(): void; onSong(): void; onWelcome(): void; onSettings(): void; onCoCreation?(): void; onSampling?(): void;
  onOpen(id: string, kind: string, draft: boolean): void;
  onPreview(id: string, signal?: AbortSignal): Promise<PlaybackSession>;
}): { dispose(): void } {
  const { catalog, sound } = options;
  let kind: CatalogKind = 'all'; let query = ''; let disposed = false; let auditioning = false;
  let preparing = false; let requestSequence = 0; let sessionId: string | undefined;
  let pendingPreview: AbortController | undefined;
  const page = node('div', 'studio catalog-studio');
  const toolbar = node('header', 'studio-toolbar'); toolbar.append(button('RootSound', 'wordmark brand-button', options.onWelcome));
  const tabs = node('nav', 'workspace-tabs'); tabs.setAttribute('aria-label', '切换创作工作区');
  if (options.onCoCreation) tabs.append(button('灵感共创', 'workspace-tab', options.onCoCreation));
  if (options.onSampling) tabs.append(button('采样获取', 'workspace-tab', options.onSampling));
  tabs.append(button('音色制作', 'workspace-tab', options.onSound), button('乐句谱写', 'workspace-tab', options.onPhrase), button('歌曲编排', 'workspace-tab', options.onSong)); toolbar.append(tabs);
  const tools = node('nav', 'toolbar-tools'); tools.append(button('素材管理', 'quiet is-current', () => {}), button('设置', 'quiet', options.onSettings)); toolbar.append(tools); page.append(toolbar);
  const main = node('main', 'catalog-workspace');
  const project = catalog.project?.();
  main.append(node('h1', 'workspace-title', project ? `${project.name} · 素材` : '工程素材'));
  const filters = node('div', 'catalog-filters'); const search = node('input', 'catalog-search'); search.type = 'search'; search.placeholder = '搜索本曲素材'; search.setAttribute('aria-label', '搜索本曲素材');
  const filterButtons = new Map<CatalogKind, HTMLButtonElement>();
  for (const [id, label] of [['all', '全部'], ['rootsound.sample', '采样'], ['rootsound.timbre', '音色'], ['rootsound.phrase', '乐句'], ['rootsound.song', '歌曲']] as const) {
    const control = button(label, 'catalog-filter', () => { kind = id; renderResults(); }); filterButtons.set(id, control); filters.append(control);
  }
  filters.append(search); main.append(filters);
  const results = node('div', 'catalog-results'); main.append(results);
  const notice = node('p', 'studio-notice'); notice.setAttribute('role', 'status'); main.append(notice);
  page.append(main); root.replaceChildren(page);
  function report(message: string, error = false): void { notice.textContent = message; notice.classList.toggle('is-error', error); }
  function open(item: ContentRecord | Draft, draft: boolean): void {
    try { requestSequence++; pendingPreview?.abort(); pendingPreview = undefined; preparing = false; auditioning = false; sessionId = undefined; sound.stopAll(); options.onOpen(item.id, item.kind, draft); }
    catch (error) { report(error instanceof Error ? error.message : String(error), true); }
  }
  function usage(item: ContentRecord): void {
    try {
      const view = catalog.usage(item.id); const dialog = node('dialog', 'library-dialog');
      const head = node('div', 'library-heading'); head.append(node('h2', '', '哪些作品在使用它'), button('关闭', 'quiet', () => dialog.close())); dialog.append(head, node('p', '', item.name));
      if (!view.saved.length && !view.drafts.length) dialog.append(node('p', 'muted', '目前没有其他作品引用这份素材。'));
      for (const dependent of view.saved) dialog.append(button(`${dependent.name} · ${names[dependent.kind] ?? '素材'} ↗`, 'library-sound', () => { dialog.close(); open(dependent, false); }));
      for (const draft of view.drafts) dialog.append(button(`${draft.name} · 编辑稿 ↗`, 'library-sound', () => { dialog.close(); open(draft, true); }));
      const dependencies = item.dependencies.map(id => catalog.list().find(content => content.id === id)).filter((value): value is ContentRecord => !!value);
      if (dependencies.length) { dialog.append(node('p', 'control-caption library-group', '它使用的素材')); for (const dependency of dependencies) dialog.append(button(`${dependency.name} ↗`, 'library-sound', () => { dialog.close(); open(dependency, false); })); }
      dialog.addEventListener('close', () => dialog.remove(), { once: true }); root.append(dialog); dialog.showModal();
    } catch (error) { report(error instanceof Error ? error.message : String(error), true); }
  }
  function duplicate(item: ContentRecord): void {
    const dialog = node('dialog', 'library-dialog'); const form = node('form');
    form.append(node('h2', '', '另存一份，放心尝试'), node('p', 'muted', '副本使用新的身份；原作品及其他作品的引用保持不变。'));
    const name = node('input', 'catalog-search'); name.value = item.name + ' 副本'; name.maxLength = 100; name.setAttribute('aria-label', '副本名称'); form.append(name);
    const errorText = node('p', 'dialog-error'); errorText.setAttribute('role', 'status'); form.append(errorText);
    const actions = node('div', 'dialog-actions'); const save = node('button', 'primary', '保存副本'); save.type = 'submit';
    actions.append(button('返回', 'secondary', () => dialog.close()), save); form.append(actions);
    form.addEventListener('submit', event => {
      event.preventDefault();
      const result = catalog.duplicate(item.id, name.value, item.revision);
      if (result.status === 'saved') { dialog.close(); report(`“${result.content.name}”已另存。原来的“${item.name}”仍然保留。`); renderResults(); }
      else errorText.textContent = result.status === 'conflict' ? result.reason : result.status === 'storage-error' ? result.message : '副本尚未保存，请重新查看这份素材。';
    });
    dialog.append(form); dialog.addEventListener('close', () => dialog.remove(), { once: true }); root.append(dialog); dialog.showModal(); name.focus(); name.select();
  }
  async function preview(item: ContentRecord): Promise<void> {
    if (auditioning || preparing) { requestSequence++; pendingPreview?.abort(); pendingPreview = undefined; sound.stopAll(); auditioning = false; preparing = false; sessionId = undefined; report('试听已停止。'); return; }
    const request = ++requestSequence; preparing = true; report(`正在准备“${item.name}”…`);
    const cancellation = new AbortController(); pendingPreview = cancellation;
    try {
      const session = await options.onPreview(item.id, cancellation.signal);
      if (disposed || request !== requestSequence) { sound.stop(session.id); return; }
      sessionId = session.id; auditioning = session.status === 'playing';
      report(auditioning ? `正在试听“${item.name}”…` : '试听已结束。');
    } catch (error) { if (!disposed && request === requestSequence) report(error instanceof Error ? error.message : String(error), true); }
    finally { if (request === requestSequence) { preparing = false; pendingPreview = undefined; } }
  }
  function renderResults(): void {
    for (const [id, control] of filterButtons) control.setAttribute('aria-pressed', String(id === kind));
    results.replaceChildren();
    const drafts = catalog.listDrafts(query, kind).filter(item => item.kind !== 'rootsound.co-creation');
    const editingSources = new Set(drafts.flatMap(item => item.sourceId ? [item.sourceId] : []));
    const saved = catalog.list(query, kind).filter(item => item.kind !== 'rootsound.co-creation' && !editingSources.has(item.id));
    if (!drafts.length && !saved.length) {
      results.append(node('p', 'catalog-empty', catalog.project && !catalog.project() ? '尚未打开歌曲工程。' : query ? '没有匹配的素材。' : '本曲暂无这类素材。'));
      return;
    }
    function card(item: ContentRecord | Draft, draft: boolean): HTMLElement {
      const value = node('article', 'catalog-card'); const description = node('div', 'catalog-card-description');
      description.append(node('span', 'catalog-badge', `${names[item.kind] ?? item.kind}${draft ? ' · 当前编辑' : ''}`), node('h2', '', item.name));
      const actions = node('div', 'catalog-card-actions'); const supported = !!names[item.kind];
      const edit = button('编辑', 'secondary', () => open(item, draft)); edit.disabled = !supported; actions.append(edit);
      if (!draft) { const content = item as ContentRecord; const listen = button('试听 / 停止', 'quiet', () => { void preview(content); }); listen.disabled = !supported; actions.append(listen, button('使用关系', 'quiet', () => usage(content)), button('另存副本', 'quiet', () => duplicate(content))); }
      value.append(description, actions); return value;
    }
    const items = [...drafts.map(item => ({ item, draft: true })), ...saved.map(item => ({ item, draft: false }))];
    items.sort((a, b) => a.item.kind.localeCompare(b.item.kind) || a.item.name.localeCompare(b.item.name, 'zh-CN'));
    items.forEach(({ item, draft }) => results.append(card(item, draft)));
  }
  search.addEventListener('input', () => { query = search.value; renderResults(); });
  const unsubscribe = sound.subscribe(event => {
    if (!disposed && event.type === 'session' && event.session.id === sessionId && event.session.status !== 'playing') { auditioning = false; sessionId = undefined; report(event.session.status === 'failed' ? event.session.error ?? '试听未能完成。' : '试听已结束。', event.session.status === 'failed'); }
  });
  renderResults();
  return { dispose() { disposed = true; requestSequence++; pendingPreview?.abort(); pendingPreview = undefined; unsubscribe(); sound.stopAll(); } };
}
