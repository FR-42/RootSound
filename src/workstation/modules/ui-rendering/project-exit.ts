import type { ProjectSaveChoice, ProjectSetupPort } from '../../contracts/project-directory.ts';
import { createWorkspacePanel } from './workspace-panel.ts';
import './project-exit.css';

export function showWorkspaceProjectExit(editor: HTMLElement, actions: {
  discard(): Promise<void>;
  copy(): Promise<ProjectSaveChoice>;
  save(): Promise<ProjectSaveChoice>;
}): { result: Promise<ProjectSaveChoice>; cancel(): void; awaitingChoice(): boolean } {
  const panel = createWorkspacePanel(true);
  panel.classList.add('song-exit-choice'); panel.setAttribute('aria-label', '退出');
  const error = document.createElement('p'); error.className = 'project-exit-error'; error.setAttribute('role', 'alert'); error.hidden = true;
  const bar = document.createElement('div'); bar.className = 'project-exit-actions';
  const covered = Array.from(editor.children).filter(child => child instanceof HTMLElement && !child.inert) as HTMLElement[];
  let choice: ProjectSaveChoice = 'cancelled';
  let working = false;
  const buttons: HTMLButtonElement[] = [];
  function add(label: string, className: string, action: () => Promise<ProjectSaveChoice>): void {
    const button = document.createElement('button'); button.type = 'button'; button.textContent = label; button.className = className;
    button.addEventListener('click', async () => {
      if (working) return;
      working = true; error.hidden = true; buttons.forEach(item => { item.disabled = true; });
      try {
        choice = await action();
        if (choice !== 'cancelled') panel.close();
      } catch (reason) {
        error.textContent = reason instanceof Error ? reason.message : String(reason); error.hidden = false;
      } finally {
        working = false; buttons.forEach(item => { item.disabled = false; });
        if (!panel.hidden) button.focus({ preventScroll: true });
      }
    });
    buttons.push(button); bar.append(button);
  }
  add('直接退出', 'project-exit-discard', async () => { await actions.discard(); return 'discarded'; });
  add('另存为', 'project-exit-copy', actions.copy);
  add('保存', 'project-exit-save', actions.save);
  panel.append(error, bar);
  panel.addEventListener('cancel', event => { if (working) event.preventDefault(); });
  const result = new Promise<ProjectSaveChoice>(resolve => {
    panel.addEventListener('close', () => {
      panel.remove();
      for (const child of covered) child.inert = false;
      if (choice === 'cancelled') editor.querySelector<HTMLElement>('.melody-scroll')?.focus({ preventScroll: true });
      resolve(choice);
    }, { once: true });
  });
  for (const child of covered) child.inert = true;
  editor.append(panel); panel.showModal();
  return { result, cancel: () => panel.close(), awaitingChoice: () => !panel.hidden && !working };
}

/** Return to welcome only after a deliberate save/discard succeeds. */
export async function showProjectExit(root: HTMLElement, service: Pick<ProjectSetupPort, 'hasUnsavedChanges' | 'exit'>,
  saveInLibrary?: () => Promise<void>): Promise<void> {
  if (!service.hasUnsavedChanges || !service.exit) throw new Error('当前窗口尚不支持退出项目，请重新打开 RootSound。');
  if (!await service.hasUnsavedChanges()) { await service.exit('discard'); return; }
  if (saveInLibrary) { await saveInLibrary(); return; }

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
    dialog.addEventListener('close', () => {
      dialog.remove();
      resolve();
    }, { once: true });
    root.append(dialog); dialog.showModal();
  });
}
