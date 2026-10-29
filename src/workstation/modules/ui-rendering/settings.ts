import type { WorkspacePreferencesPort } from '../../contracts/workspace.ts';
import './workspace.css';

export function showWorkspaceSettings(root: HTMLElement, preferences: WorkspacePreferencesPort, onClose?: () => void): void {
  if (root.querySelector('.settings-dialog')) return;
  const current = preferences.read(); const dialog = document.createElement('dialog'); dialog.className = 'settings-dialog workspace-settings-dialog';
  dialog.setAttribute('aria-label', '设置');
  const heading = document.createElement('h2'); heading.textContent = '设置';
  const form = document.createElement('form');
  const performance = document.createElement('input'); performance.type = 'checkbox'; performance.checked = current.keyboardPerformance; performance.setAttribute('aria-label', '键盘演奏');
  const performanceLabel = document.createElement('label'); performanceLabel.className = 'settings-check'; performanceLabel.append(performance, document.createTextNode('键盘演奏')); form.append(performanceLabel);
  const error = document.createElement('p'); error.className = 'dialog-error'; error.setAttribute('role', 'status'); form.append(error);
  const actions = document.createElement('div'); actions.className = 'dialog-actions';
  const cancel = document.createElement('button'); cancel.type = 'button'; cancel.className = 'secondary'; cancel.textContent = '返回'; cancel.addEventListener('click', () => dialog.close());
  const save = document.createElement('button'); save.type = 'submit'; save.className = 'primary'; save.textContent = '保存设置'; actions.append(cancel, save); form.append(actions);
  form.addEventListener('submit', event => {
    event.preventDefault();
    try { preferences.update({ keyboardPerformance: performance.checked }); dialog.close(); }
    catch (problem) { error.textContent = problem instanceof Error ? problem.message : String(problem); }
  });
  dialog.append(heading, form); dialog.addEventListener('close', () => { dialog.remove(); onClose?.(); }, { once: true }); root.append(dialog); dialog.showModal();
}
