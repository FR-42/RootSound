import type { LearningSettings, LearningSettingsPort } from '../../contracts/guidance.ts';
import './workspace.css';
import './settings.css';

export function showLearningSettings(root: HTMLElement, preferences: LearningSettingsPort, options: {
  requiresTempoRolls?: boolean; onChange?(): void; onReplayGuide?(): void;
}): void {
  if (root.querySelector('.learning-settings')) return;
  const dialog = document.createElement('dialog'); dialog.className = 'settings-dialog learning-settings';
  dialog.setAttribute('aria-label', '设置');
  const header = document.createElement('header'); header.className = 'learning-heading';
  const title = document.createElement('h2'); title.textContent = '设置';
  const close = document.createElement('button'); close.type = 'button'; close.textContent = '×'; close.setAttribute('aria-label', '关闭设置');
  close.addEventListener('click', () => dialog.close()); header.append(title, close);
  const problem = document.createElement('p'); problem.className = 'dialog-error'; problem.hidden = true; problem.setAttribute('role', 'alert');
  function feature(name: string, key: keyof Pick<LearningSettings, 'multipleTempoRolls' | 'drumLanes' | 'workbench'>, write: (enabled: boolean) => void, disabled = false) {
    const label = document.createElement('label'); label.className = 'learning-feature';
    const input = document.createElement('input'); input.type = 'checkbox'; input.checked = preferences.read()[key] === true;
    input.disabled = disabled; input.setAttribute('aria-label', name);
    const text = document.createElement('span'); text.textContent = name; label.append(input, text);
    input.addEventListener('change', () => {
      problem.hidden = true;
      try { write(input.checked); options.onChange?.(); }
      catch (error) { input.checked = preferences.read()[key] === true; problem.textContent = String(error instanceof Error ? error.message : error); problem.hidden = false; }
    });
    return label;
  }
  dialog.append(header, feature('多卷帘', 'multipleTempoRolls', preferences.setMultipleTempoRolls, !!options.requiresTempoRolls),
    feature('打击音色', 'drumLanes', preferences.setDrumLanes),
    feature('工作台', 'workbench', preferences.setWorkbench), problem);
  if (options.onReplayGuide) {
    const replay = document.createElement('button'); replay.type = 'button'; replay.className = 'secondary learning-replay-guide';
    replay.textContent = '再次观看引导';
    replay.addEventListener('click', () => { dialog.close(); options.onReplayGuide!(); });
    dialog.append(replay);
  }
  dialog.addEventListener('close', () => dialog.remove(), { once: true }); root.append(dialog); dialog.showModal();
}

export function showFeatureGate(root: HTMLElement, options: { onEnable(): void | Promise<void>; onCancel(): void | Promise<void> }): void {
  const dialog = document.createElement('dialog'); dialog.className = 'settings-dialog learning-feature-gate'; dialog.setAttribute('aria-label', '工程需要高级功能');
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
