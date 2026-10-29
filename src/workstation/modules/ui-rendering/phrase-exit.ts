import './project-exit.css';

/** Leaving a phrase never means committing it implicitly. */
export function showPhraseExit(root: HTMLElement, options: {
  name: string; active(): boolean; save(): void | Promise<void>; discard(): void | Promise<void>; leave(): void;
}): Promise<void> {
  return new Promise(resolve => {
    const dialog = document.createElement('dialog'); dialog.className = 'project-exit-dialog phrase-exit-dialog';
    const title = document.createElement('h2'); title.textContent = '返回歌曲？';
    const description = document.createElement('p'); description.textContent = `“${options.name}”有未保存的草稿。`;
    const error = document.createElement('p'); error.className = 'project-exit-error phrase-exit-error'; error.hidden = true; error.setAttribute('role', 'alert');
    const actions = document.createElement('div'); actions.className = 'project-exit-actions';
    const buttons: HTMLButtonElement[] = []; let working = false;
    function add(text: string, className: string, callback: () => void) {
      const button = document.createElement('button'); button.type = 'button'; button.className = className; button.textContent = text;
      button.addEventListener('click', () => { if (!working && options.active()) callback(); }); buttons.push(button); actions.append(button);
    }
    async function finish(mode: 'save' | 'discard'): Promise<void> {
      if (!options.active()) return;
      working = true; buttons.forEach(button => { button.disabled = true; }); error.hidden = true;
      try {
        await (mode === 'save' ? options.save() : options.discard());
        if (options.active()) { dialog.close(); options.leave(); }
        else dialog.close();
      } catch (reason) {
        if (options.active()) {
          error.textContent = reason instanceof Error ? reason.message : String(reason); error.hidden = false;
          working = false; buttons.forEach(button => { button.disabled = false; });
        } else dialog.close();
      }
    }
    add('继续编辑', 'phrase-exit-cancel', () => dialog.close());
    add('放弃修改', 'phrase-exit-discard', () => { void finish('discard'); });
    add('保存并返回', 'phrase-exit-save', () => { void finish('save'); });
    dialog.append(title, description, error, actions);
    dialog.addEventListener('cancel', event => { if (working) event.preventDefault(); });
    dialog.addEventListener('close', () => { dialog.remove(); resolve(); }, { once: true });
    root.append(dialog); dialog.showModal();
  });
}
