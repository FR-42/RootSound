import type { ProjectSetupPort } from '../../contracts/project-directory.ts';
import './project-save-as.css';

/** A name is enough: the copy always enters the default song library. */
export function showProjectSaveAs(root: HTMLElement, service: ProjectSetupPort, originalName: string): void {
  const dialog = document.createElement('dialog'); dialog.className = 'project-copy-dialog';
  const form = document.createElement('form'); form.noValidate = true;
  const heading = document.createElement('div'); heading.className = 'library-heading';
  const title = document.createElement('h2'); title.textContent = '另存为';
  const close = document.createElement('button'); close.type = 'button'; close.className = 'quiet'; close.textContent = '×'; close.setAttribute('aria-label', '关闭');
  heading.append(title, close); form.append(heading);
  function field(labelText: string): HTMLInputElement {
    const label = document.createElement('label'); label.className = 'project-copy-field';
    const text = document.createElement('span'); text.textContent = labelText;
    const input = document.createElement('input'); input.className = 'project-start-input'; input.type = 'text'; input.required = true;
    input.autocomplete = 'off'; input.spellcheck = false;
    label.append(text, input); form.append(label); return input;
  }
  const name = field('名称'); name.value = `${originalName} 1`;
  const message = document.createElement('p'); message.className = 'project-start-error'; message.hidden = true; message.setAttribute('role', 'alert'); form.append(message);
  const actions = document.createElement('div'); actions.className = 'project-copy-actions';
  const save = document.createElement('button'); save.type = 'submit'; save.className = 'primary'; save.textContent = '保存'; actions.append(save); form.append(actions);
  let busy = false; let closed = false;
  function state(): void { if (closed) return; save.disabled = busy; close.disabled = busy; name.disabled = busy; }
  function error(cause: unknown): void { if (closed) return; message.textContent = cause instanceof Error ? cause.message : String(cause); message.hidden = false; }
  close.addEventListener('click', () => { if (!busy) dialog.close(); });
  dialog.addEventListener('cancel', event => { if (busy) event.preventDefault(); });
  dialog.addEventListener('close', () => { closed = true; dialog.remove(); }, { once: true });
  form.addEventListener('submit', event => {
    event.preventDefault(); if (busy || closed) return;
    if (!name.value.trim()) { error(new Error('请填写新项目名称。')); name.focus(); return; }
    if (!service.saveAs) { error(new Error('当前窗口不能另存项目，请重新打开 RootSound。')); return; }
    const nextName = name.value.trim();
    busy = true; message.hidden = true; state();
    void (async () => {
      try {
        const location = await service.defaultLocation();
        if (closed || !root.contains(dialog)) return;
        if (!location.trim()) throw new Error('暂时无法找到乐曲库，请重新打开 RootSound。');
        await service.saveAs!(nextName, location.trim());
        // Successful application save-as reloads into the independent new song.
      }
      catch (cause) { busy = false; error(cause); state(); }
    })();
  });
  dialog.append(form); root.append(dialog); dialog.showModal(); name.focus(); name.select(); state();
}
