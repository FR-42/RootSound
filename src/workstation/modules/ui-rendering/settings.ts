import type { LearningSettingsPort } from '../../contracts/guidance.ts';
import type { WorkspacePreferencesPort } from '../../contracts/workspace.ts';
import { createWorkspacePanel, type WorkspacePanel } from './workspace-panel.ts';
import { mountRollAppearanceSettings } from './roll-appearance.ts';
import { libraryIcon } from './library-icon.ts';
import './workspace.css';
import './settings.css';

type LearningSettingsOptions = {
  inline?: boolean; appearance?: WorkspacePreferencesPort; onChange?(): void;
  tempoRolls?: { enabled: boolean; required: boolean; set(enabled: boolean): void };
};

export function showLearningSettings(root: HTMLElement, preferences: LearningSettingsPort | undefined, options: LearningSettingsOptions): (() => void) | undefined {
  if (root.querySelector('.learning-settings')) return;
  const dialog = createWorkspacePanel(options.inline);
  const disposeContent = mountLearningSettings(root, dialog, preferences, options);
  const dispose = () => { disposeContent(); dialog.remove(); };
  dialog.addEventListener('close', dispose, { once: true }); root.append(dialog); dialog.showModal();
  return dispose;
}

export function mountLearningSettings(root: HTMLElement, dialog: WorkspacePanel, preferences: LearningSettingsPort | undefined,
  options: LearningSettingsOptions, editorControls?: HTMLElement): () => void {
  dialog.classList.add('settings-dialog', 'learning-settings');
  dialog.setAttribute('aria-label', '设置');
  const header = document.createElement('header'); header.className = 'learning-heading';
  const title = document.createElement('h2'); title.textContent = '设置';
  const close = document.createElement('button'); close.type = 'button'; close.textContent = '×'; close.setAttribute('aria-label', '关闭设置');
  close.addEventListener('click', () => dialog.close()); header.append(title, close);
  const problem = document.createElement('p'); problem.className = 'dialog-error'; problem.hidden = true; problem.setAttribute('role', 'alert');
  if (editorControls) {
    dialog.setAttribute('aria-label', editorControls.querySelector('.song-project-name')?.textContent || '设置');
    dialog.replaceChildren(editorControls);
  }
  else dialog.append(header);
  if (preferences && !options.inline && !editorControls) {
    const label = document.createElement('label'); label.className = 'learning-feature';
    const input = document.createElement('input'); input.type = 'checkbox'; input.checked = preferences.read().workbench === true;
    input.setAttribute('aria-label', '工作台');
    const text = document.createElement('span'); text.textContent = '工作台'; label.append(input, text);
    input.addEventListener('change', () => {
      problem.hidden = true;
      try { preferences.setWorkbench(input.checked); options.onChange?.(); }
      catch (error) { input.checked = preferences.read().workbench === true; problem.textContent = String(error instanceof Error ? error.message : error); problem.hidden = false; }
    });
    dialog.append(label);
  }
  const disposeAppearance = !editorControls && options.appearance
    ? mountRollAppearanceSettings(root, dialog, options.appearance, problem) : undefined;
  const tempo = options.tempoRolls;
  if (editorControls && tempo) {
    const label = document.createElement('label'); label.className = 'learning-feature learning-roll-switch';
    const input = document.createElement('input'); input.type = 'checkbox'; input.checked = tempo.enabled; input.disabled = tempo.required;
    input.setAttribute('role', 'switch'); input.setAttribute('aria-label', '多 BPM');
    const name = document.createElement('span'); name.className = 'learning-roll-switch-name'; name.textContent = '多 BPM';
    const face = document.createElement('span'); face.className = 'learning-roll-switch-face'; face.setAttribute('aria-hidden', 'true');
    const theme = document.documentElement?.classList;
    if (theme?.contains('windows-desktop-colors') && !theme.contains('website-editor')) face.append(libraryIcon('metronome'));
    label.append(input, name, face);
    input.addEventListener('change', () => {
      problem.hidden = true;
      try { tempo.set(input.checked); options.onChange?.(); }
      catch (error) {
        input.checked = !input.checked;
        problem.textContent = error instanceof Error ? error.message : String(error); problem.hidden = false;
      }
    });
    dialog.append(label);
  }
  if (preferences || options.appearance || tempo) dialog.append(problem);
  return () => disposeAppearance?.();
}
