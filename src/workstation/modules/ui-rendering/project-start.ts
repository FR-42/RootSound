import type { ProjectSetupPort } from '../../contracts/project-directory.ts';

function element<K extends keyof HTMLElementTagNameMap>(tag: K, className = '', text = ''): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  node.className = className;
  node.textContent = text;
  return node;
}

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message.trim() ? error.message : fallback;
}

/** The location is a parent folder; the project service creates one named file. */
export function mountProjectStart(root: HTMLElement, service?: ProjectSetupPort, onViewChange?: () => void, onBack?: () => void): { dispose(): void } {
  let disposed = false;
  let view: 'name' | 'settings' = 'name';
  let name = '';
  let location = '';
  let locationEdited = false;
  let loadingLocation = !!service;
  let operation: 'choose' | 'create' | undefined;
  let message = '';
  let error: HTMLElement;
  let form: HTMLFormElement;
  let nameInput: HTMLInputElement | undefined;
  let locationInput: HTMLInputElement | undefined;
  let submit: HTMLButtonElement;
  let choose: HTMLButtonElement | undefined;
  let details: HTMLButtonElement | undefined;
  let back: HTMLButtonElement | undefined;

  function showError(text: string): void {
    message = text;
    error.textContent = text;
    error.hidden = !text;
  }

  function updateBusy(): void {
    if (disposed) return;
    form.setAttribute('aria-busy', String(!!operation || loadingLocation));
    submit.disabled = !!operation || view === 'name' && loadingLocation;
    if (nameInput) nameInput.disabled = !!operation;
    if (locationInput) locationInput.disabled = !!operation;
    if (choose) choose.disabled = !!operation || loadingLocation;
    if (details) details.disabled = !!operation;
    if (back) back.disabled = !!operation;
  }

  function switchView(next: 'name' | 'settings'): void {
    if (disposed || operation) return;
    onViewChange?.();
    view = next;
    render();
  }

  async function createProject(): Promise<void> {
    if (disposed || operation || loadingLocation) return;
    const projectName = name.trim();
    if (!projectName) {
      showError('请先为歌曲起个名字。');
      nameInput?.focus();
      return;
    }
    if (!service) { showError('请在桌面版中创建歌曲。'); return; }
    if (!location.trim()) { showError('请在详细设置中选择项目存储位置。'); return; }
    operation = 'create';
    showError('');
    updateBusy();
    let created = false;
    try {
      await service.create(projectName, location.trim());
      created = true;
      // The application owns reopening the successfully created project.
    } catch (cause) {
      if (!disposed) showError(errorMessage(cause, '创建失败，请重试。'));
    } finally {
      if (!created) operation = undefined;
      updateBusy();
    }
  }

  async function chooseLocation(): Promise<void> {
    if (disposed || operation || loadingLocation) return;
    if (!service) { showError('请在桌面版中选择文件夹。'); return; }
    operation = 'choose';
    showError('');
    updateBusy();
    try {
      const result = await service.chooseLocation(location);
      if (disposed) return;
      if (result.status === 'chosen') {
        location = result.path;
        locationEdited = true;
        if (locationInput) locationInput.value = location;
      }
    } catch (cause) {
      if (!disposed) showError(errorMessage(cause, '无法选择文件夹，请重试。'));
    } finally {
      operation = undefined;
      updateBusy();
      if (!disposed) locationInput?.focus();
    }
  }

  function render(): void {
    nameInput = undefined;
    locationInput = undefined;
    choose = undefined;
    details = undefined;
    back = undefined;
    const page = element('main', 'welcome project-start');
    page.append(element('div', 'wordmark', 'RootSound'));
    form = element('form', 'project-start-form');
    form.noValidate = true;
    const content = element('div', 'project-start-content');
    const label = element('label', 'project-start-label', view === 'name' ? '为新歌曲起一个名字把~' : '项目存储位置');
    const input = element('input', 'project-start-input');
    input.type = 'text';
    input.id = view === 'name' ? 'project-start-name' : 'project-start-location';
    input.name = view === 'name' ? 'name' : 'location';
    input.required = true;
    input.autocomplete = 'off';
    input.spellcheck = false;
    label.htmlFor = input.id;
    content.append(label);
    if (view === 'name') {
      nameInput = input;
      input.value = name;
      input.addEventListener('input', () => { name = input.value; showError(''); });
      content.append(input);
    } else {
      locationInput = input;
      input.value = location;
      input.addEventListener('input', () => { location = input.value; locationEdited = true; showError(''); });
      const row = element('div', 'project-start-location');
      choose = element('button', 'secondary project-location-choose', '…');
      choose.type = 'button';
      choose.setAttribute('aria-label', '选择文件夹');
      choose.title = '选择文件夹';
      choose.addEventListener('click', () => { void chooseLocation(); });
      row.append(input, choose);
      content.append(row);
    }
    error = element('p', 'project-start-error', message);
    error.id = 'project-start-error';
    error.setAttribute('role', 'alert');
    error.hidden = !message;
    input.setAttribute('aria-describedby', error.id);
    content.append(error);
    submit = element('button', 'primary project-start-submit', view === 'name' ? '创建！' : '保存');
    submit.type = 'submit';
    const footer = element('div', 'project-start-footer');
    if (view === 'name') {
      if (onBack) {
        back = element('button', 'quiet project-start-back', '返回'); back.type = 'button';
        back.addEventListener('click', () => { if (!disposed && !operation) onBack(); });
        footer.append(back);
      }
      content.append(submit);
      details = element('button', 'quiet', '详细设置');
      details.type = 'button';
      details.addEventListener('click', () => switchView('settings'));
      footer.append(details);
    } else footer.append(submit);
    form.append(content, footer);
    form.addEventListener('submit', event => {
      event.preventDefault();
      if (view === 'name') { void createProject(); return; }
      if (operation) return;
      if (!location.trim()) { showError('请选择项目存储位置。'); locationInput?.focus(); return; }
      switchView('name');
    });
    page.append(form);
    root.replaceChildren(page);
    updateBusy();
    input.focus();
  }

  render();
  if (service) {
    void (async () => {
      try {
        const defaultLocation = await service.defaultLocation();
        if (disposed || locationEdited) return;
        location = defaultLocation;
        if (locationInput) locationInput.value = location;
      } catch (cause) {
        if (!disposed && !locationEdited) showError(errorMessage(cause, '无法读取默认位置，请在详细设置中选择。'));
      } finally {
        loadingLocation = false;
        updateBusy();
      }
    })();
  }
  return { dispose() { disposed = true; } };
}
