/** Explicit choice only when the chosen interchange format cannot retain edited details. */
export function confirmFormatSave(root: HTMLElement, warnings: readonly string[]): Promise<boolean> {
  if (!warnings.length) return Promise.resolve(true);
  return new Promise(resolve => {
    const dialog = document.createElement('dialog'); dialog.className = 'project-copy-dialog format-save-warning';
    const title = document.createElement('h2'); title.textContent = '保存为原格式';
    const list = document.createElement('ul');
    for (const warning of warnings) { const item = document.createElement('li'); item.textContent = warning; list.append(item); }
    const actions = document.createElement('div'); actions.className = 'project-copy-actions';
    let accepted = false;
    const cancel = document.createElement('button'); cancel.type = 'button'; cancel.textContent = '取消'; cancel.addEventListener('click', () => dialog.close());
    const save = document.createElement('button'); save.type = 'button'; save.className = 'primary'; save.textContent = '保存原格式';
    save.addEventListener('click', () => { accepted = true; dialog.close(); });
    dialog.addEventListener('close', () => { dialog.remove(); resolve(accepted); }, { once: true });
    actions.append(cancel, save); dialog.append(title, list, actions); root.append(dialog); dialog.showModal(); cancel.focus();
  });
}
