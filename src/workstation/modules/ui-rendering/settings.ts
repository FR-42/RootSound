import type { WorkspacePreferencesPort } from '../../contracts/workspace.ts';
import './workspace.css';

export function showWorkspaceSettings(root: HTMLElement, _preferences: WorkspacePreferencesPort, onClose?: () => void): void {
  if (root.querySelector('.settings-dialog')) return;
  const dialog = document.createElement('dialog'); dialog.className = 'settings-dialog workspace-settings-dialog';
  dialog.setAttribute('aria-label', '设置');
  const heading = document.createElement('h2'); heading.textContent = '设置';
  const header = document.createElement('div'); header.className = 'settings-dialog-heading';
  const close = document.createElement('button'); close.type = 'button'; close.className = 'settings-close'; close.textContent = '×'; close.setAttribute('aria-label', '关闭设置'); close.addEventListener('click', () => dialog.close());
  header.append(heading, close); dialog.append(header);
  dialog.addEventListener('close', () => { dialog.remove(); onClose?.(); }, { once: true }); root.append(dialog); dialog.showModal();
}
