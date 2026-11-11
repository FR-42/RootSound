import './project-save-as.css';

export function showProjectNameDialog(root: HTMLElement, titleText: string, suggestedName: string, actionText: string,
  submit: (name: string) => Promise<void>): Promise<boolean> {
  return new Promise(resolve => {
    const dialog = document.createElement('dialog'); dialog.className = 'project-copy-dialog';
    const form = document.createElement('form'); form.noValidate = true;
    const heading = document.createElement('div'); heading.className = 'library-heading';
    const title = document.createElement('h2'); title.textContent = titleText;
    const close = document.createElement('button'); close.type = 'button'; close.className = 'quiet'; close.textContent = '×';
    close.setAttribute('aria-label', '关闭'); heading.append(title, close);
    const label = document.createElement('label'); label.className = 'project-copy-field'; label.textContent = '名称';
    const name = document.createElement('input'); name.className = 'project-start-input'; name.type = 'text'; name.required = true;
    name.autocomplete = 'off'; name.spellcheck = false; name.maxLength = 80; name.value = suggestedName; label.append(name);
    const message = document.createElement('p'); message.className = 'project-start-error'; message.hidden = true; message.setAttribute('role', 'alert');
    const actions = document.createElement('div'); actions.className = 'project-copy-actions';
    const accept = document.createElement('button'); accept.type = 'submit'; accept.className = 'primary'; accept.textContent = actionText;
    actions.append(accept); form.append(heading, label, message, actions);
    let busy = false; let saved = false;
    close.addEventListener('click', () => { if (!busy) dialog.close(); });
    dialog.addEventListener('cancel', event => { if (busy) event.preventDefault(); });
    dialog.addEventListener('keydown', event => event.stopPropagation());
    dialog.addEventListener('close', () => { dialog.remove(); resolve(saved); }, { once: true });
    form.addEventListener('submit', event => {
      event.preventDefault(); if (busy) return;
      const value = name.value.trim();
      if (!value) { message.textContent = '名称不能为空。'; message.hidden = false; name.focus(); return; }
      busy = accept.disabled = close.disabled = name.disabled = true; message.hidden = true;
      void submit(value).then(() => { saved = true; dialog.close(); }, error => {
        message.textContent = error instanceof Error ? error.message : String(error); message.hidden = false;
        busy = accept.disabled = close.disabled = name.disabled = false; name.focus();
      });
    });
    dialog.append(form); root.append(dialog); dialog.showModal(); name.focus(); name.select?.();
  });
}
