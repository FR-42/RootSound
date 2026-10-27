import type { ProjectSetupPort } from '../../contracts/project-directory.ts';
import './project-exit.css';

/** Return to welcome only after a deliberate save/discard succeeds. */
export async function showProjectExit(root: HTMLElement, service: ProjectSetupPort): Promise<void> {
  if (!service.hasUnsavedChanges || !service.exit) throw new Error('当前窗口尚不支持退出项目，请重新打开 RootSound。');
  if (!await service.hasUnsavedChanges()) { await service.exit('discard'); return; }

  await new Promise<void>(resolve => {
    const dialog = document.createElement('dialog'); dialog.className = 'project-exit-dialog';
    const heading = document.createElement('h2'); heading.textContent = '退出当前项目？';
    const description = document.createElement('p'); description.textContent = '有未保存的修改。';
    const error = document.createElement('p'); error.className = 'project-exit-error'; error.setAttribute('role', 'alert'); error.hidden = true;
    const actions = document.createElement('div'); actions.className = 'project-exit-actions';
    const buttons: HTMLButtonElement[] = []; let working = false;
    function add(label: string, kind: string, callback: () => void): void {
      const button = document.createElement('button'); button.type = 'button'; button.textContent = label; button.className = kind;
      button.addEventListener('click', () => { if (!working) callback(); }); actions.append(button); buttons.push(button);
    }
    async function leave(mode: 'save' | 'discard'): Promise<void> {
      working = true; buttons.forEach(button => { button.disabled = true; }); error.hidden = true;
      try { await service.exit!(mode); dialog.close(); }
      catch (reason) {
        error.textContent = reason instanceof Error ? reason.message : String(reason); error.hidden = false;
        working = false; buttons.forEach(button => { button.disabled = false; });
      }
    }
    add('取消', 'project-exit-cancel', () => dialog.close());
    add('直接退出', 'project-exit-discard', () => { void leave('discard'); });
    add('保存并退出', 'project-exit-save', () => { void leave('save'); });
    dialog.append(heading, description, error, actions);
    dialog.addEventListener('cancel', event => { if (working) event.preventDefault(); });
    dialog.addEventListener('close', () => { dialog.remove(); resolve(); }, { once: true });
    root.append(dialog); dialog.showModal();
  });
}
