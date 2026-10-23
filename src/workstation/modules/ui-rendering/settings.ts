import type { WorkspaceId, WorkspacePreferencesPort } from '../../contracts/workspace.ts';
import { visibleWorkspace } from './visible-workspaces.ts';
import './workspace.css';

export function showWorkspaceSettings(root: HTMLElement, preferences: WorkspacePreferencesPort): void {
  const current = preferences.read(); const dialog = document.createElement('dialog'); dialog.className = 'settings-dialog';
  const heading = document.createElement('h2'); heading.textContent = '启动设置';
  const form = document.createElement('form');
  const welcome = document.createElement('input'); welcome.type = 'checkbox'; welcome.checked = current.welcomeEnabled;
  const welcomeLabel = document.createElement('label'); welcomeLabel.className = 'settings-check'; welcomeLabel.append(welcome, document.createTextNode('打开时显示欢迎页')); form.append(welcomeLabel);
  const label = document.createElement('label'); label.className = 'settings-field'; label.textContent = '直接进入创作时，打开';
  const select = document.createElement('select'); select.setAttribute('aria-label', '启动工作区');
  for (const [value, text] of [['last', '上次工作区'], ['sampling', '采样获取'], ['sound', '音色制作'], ['phrase', '乐句谱写'], ['song', '歌曲编排'], ['library', '素材管理']]) { const option = document.createElement('option'); option.value = value!; option.textContent = text!; select.append(option); }
  select.value = current.startWorkspace === 'last' ? 'last' : visibleWorkspace(current.startWorkspace); label.append(select); form.append(label);
  const error = document.createElement('p'); error.className = 'dialog-error'; error.setAttribute('role', 'status'); form.append(error);
  const actions = document.createElement('div'); actions.className = 'dialog-actions';
  const cancel = document.createElement('button'); cancel.type = 'button'; cancel.className = 'secondary'; cancel.textContent = '返回'; cancel.addEventListener('click', () => dialog.close());
  const save = document.createElement('button'); save.type = 'submit'; save.className = 'primary'; save.textContent = '保存设置'; actions.append(cancel, save); form.append(actions);
  form.addEventListener('submit', event => {
    event.preventDefault();
    try { preferences.update({ welcomeEnabled: welcome.checked, startWorkspace: select.value as 'last' | WorkspaceId }); dialog.close(); }
    catch (problem) { error.textContent = problem instanceof Error ? problem.message : String(problem); }
  });
  dialog.append(heading, form); dialog.addEventListener('close', () => dialog.remove(), { once: true }); root.append(dialog); dialog.showModal();
}
