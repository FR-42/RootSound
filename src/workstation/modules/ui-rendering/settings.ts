import type { LearningSettings, LearningSettingsPort } from '../../contracts/guidance.ts';
import type { WorkspacePreferencesPort } from '../../contracts/workspace.ts';
import { createWorkspacePanel, type WorkspacePanel } from './workspace-panel.ts';
import { mountRollAppearanceSettings } from './roll-appearance.ts';
import { paintRangeProgress } from './range-progress.ts';
import './workspace.css';
import './settings.css';

type LearningSettingsOptions = {
  requiresTempoRolls?: boolean; inline?: boolean; appearance?: WorkspacePreferencesPort; onChange?(): void;
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
  function feature(prefs: LearningSettingsPort, name: string, key: keyof Pick<LearningSettings, 'multipleTempoRolls' | 'drumLanes' | 'workbench'>, write: (enabled: boolean) => void, disabled = false) {
    const label = document.createElement('label'); label.className = 'learning-feature';
    const input = document.createElement('input'); input.type = 'checkbox'; input.checked = prefs.read()[key] === true;
    input.disabled = disabled; input.setAttribute('aria-label', name);
    const text = document.createElement('span'); text.textContent = name; label.append(input, text);
    if (editorControls && key === 'multipleTempoRolls') {
      label.classList.add('learning-roll-switch');
      input.setAttribute('role', 'switch');
      const face = document.createElement('span'); face.className = 'learning-roll-switch-face';
      face.setAttribute('aria-hidden', 'true'); label.append(face);
    }
    input.addEventListener('change', () => {
      problem.hidden = true;
      try { write(input.checked); options.onChange?.(); }
      catch (error) { input.checked = prefs.read()[key] === true; problem.textContent = String(error instanceof Error ? error.message : error); problem.hidden = false; }
    });
    return label;
  }
  if (editorControls) {
    dialog.setAttribute('aria-label', editorControls.querySelector('.song-project-name')?.textContent || '设置');
    dialog.replaceChildren(editorControls);
  }
  else dialog.append(header);
  const tempoRolls = preferences && feature(preferences, '多卷帘', 'multipleTempoRolls', preferences.setMultipleTempoRolls, !!options.requiresTempoRolls);
  if (preferences) {
    if (tempoRolls && !editorControls) dialog.append(tempoRolls);
    if (!options.inline) dialog.append(
      feature(preferences, '打击音色', 'drumLanes', preferences.setDrumLanes),
      feature(preferences, '工作台', 'workbench', preferences.setWorkbench));
  }
  const disposeAppearance = options.appearance && mountRollAppearanceSettings(root, dialog, options.appearance, problem);
  if (options.inline && options.appearance) {
    const appearance = options.appearance;
    const label = document.createElement('label'); label.className = 'learning-appearance';
    const text = document.createElement('span'); text.textContent = '鼠标灵敏度';
    const input = document.createElement('input'); input.type = 'range'; input.min = '0'; input.max = '100';
    input.value = String(appearance.read().pointerSensitivity ?? 65);
    input.setAttribute('aria-label', text.textContent);
    paintRangeProgress(input);
    input.addEventListener('input', () => {
      problem.hidden = true;
      try { appearance.update({ pointerSensitivity: Number(input.value) }); }
      catch (error) { input.value = String(appearance.read().pointerSensitivity ?? 65); problem.textContent = String(error instanceof Error ? error.message : error); problem.hidden = false; }
      paintRangeProgress(input);
    });
    label.append(text, input); dialog.append(label);
  }
  if (tempoRolls && editorControls) dialog.append(tempoRolls);
  if (preferences || options.appearance) dialog.append(problem);
  return () => disposeAppearance?.();
}

export function showFeatureGate(root: HTMLElement, options: { inline?: boolean; onEnable(): void | Promise<void>; onCancel(): void | Promise<void> }): void {
  const dialog = createWorkspacePanel(options.inline); dialog.className += ' settings-dialog learning-feature-gate'; dialog.setAttribute('aria-label', '工程需要高级功能');
  const title = document.createElement('h2'); title.textContent = '这个工程使用了分段速度';
  const copy = document.createElement('p'); copy.textContent = '启用“多卷帘”后才能打开。';
  const problem = document.createElement('p'); problem.className = 'dialog-error'; problem.hidden = true;
  const actions = document.createElement('div'); actions.className = 'dialog-actions';
  const back = document.createElement('button'); back.textContent = '返回'; back.type = 'button';
  const enable = document.createElement('button'); enable.textContent = '启用并打开'; enable.type = 'button'; enable.className = 'primary';
  let busy = false;
  async function run(action: () => void | Promise<void>) {
    if (busy) return; busy = true; back.disabled = enable.disabled = true;
    try { await action(); dialog.close(); }
    catch (error) { problem.textContent = error instanceof Error ? error.message : String(error); problem.hidden = false; }
    finally { busy = false; back.disabled = enable.disabled = false; }
  }
  back.addEventListener('click', () => { void run(options.onCancel); }); enable.addEventListener('click', () => { void run(options.onEnable); });
  dialog.addEventListener('cancel', event => { event.preventDefault(); void run(options.onCancel); });
  actions.append(back, enable); dialog.append(title, copy, problem, actions); root.append(dialog); dialog.showModal();
  dialog.addEventListener('close', () => dialog.remove(), { once: true });
}
