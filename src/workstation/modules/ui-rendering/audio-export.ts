import type { AudioFilesPort } from '../../contracts/files.ts';
import type { PlayableNotePlan, SoundSequencePlan, SoundRuntimePort } from '../../contracts/sound.ts';
import './workspace.css';

/** Export captures one complete plan before rendering; later editing cannot alter the job. */
export function showAudioExport(root: HTMLElement, options: {
  name: string; plan: PlayableNotePlan | SoundSequencePlan | (() => PlayableNotePlan | SoundSequencePlan);
  prepare?(): Promise<void>; sound: SoundRuntimePort; files: AudioFilesPort;
}): void {
  const dialog = document.createElement('dialog'); dialog.className = 'settings-dialog';
  const title = document.createElement('h2'); title.textContent = '让它，成为一段真正的声音。';
  const description = document.createElement('p'); description.textContent = `导出“${options.name}”的当前版本，可在其他播放器中直接打开。`;
  const quality = document.createElement('p'); quality.className = 'export-notice'; quality.textContent = 'WAV 音频 · 48 kHz · 24 位 · 双声道，包含自然尾音。';
  const progress = document.createElement('progress'); progress.className = 'audio-export-progress'; progress.max = 1; progress.value = 0; progress.setAttribute('aria-label', '音频导出进度');
  const status = document.createElement('p'); status.className = 'export-notice'; status.textContent = '准备好后开始导出，再选择保存位置。'; status.setAttribute('role', 'status');
  const actions = document.createElement('div'); actions.className = 'dialog-actions';
  const cancel = document.createElement('button'); cancel.type = 'button'; cancel.className = 'secondary'; cancel.textContent = '返回';
  const start = document.createElement('button'); start.type = 'button'; start.className = 'primary'; start.textContent = '开始导出'; actions.append(cancel, start);
  let controller: AbortController | undefined; let stage: 'idle' | 'rendering' | 'saving' | 'done' = 'idle';
  function abort(): void { if (stage === 'saving') return; controller?.abort(); dialog.close(); }
  cancel.addEventListener('click', abort);
  dialog.addEventListener('cancel', event => { event.preventDefault(); abort(); });
  dialog.addEventListener('close', () => { controller?.abort(); dialog.remove(); }, { once: true });
  start.addEventListener('click', () => { void run(); });
  async function run(): Promise<void> {
    if (stage === 'rendering' || stage === 'saving') return;
    controller = new AbortController(); stage = 'rendering'; start.disabled = true; cancel.textContent = '取消导出';
    status.textContent = '正在生成音频…'; status.classList.remove('dialog-error'); progress.value = 0;
    try {
      if (options.prepare) { status.textContent = '正在准备作品使用的声音…'; await options.prepare(); }
      if (controller.signal.aborted || !dialog.isConnected) return;
      const capturedPlan = typeof options.plan === 'function' ? options.plan() : options.plan;
      status.textContent = '正在生成音频…';
      const result = await options.sound.render(capturedPlan, { sampleRate: 48000, signal: controller.signal,
        onProgress(value) { if (dialog.isConnected && stage === 'rendering') progress.value = Math.max(0, Math.min(1, value)); } });
      if (controller.signal.aborted || !dialog.isConnected) return;
      stage = 'saving'; cancel.disabled = true; status.textContent = '音频已生成，正在选择保存位置…';
      const outcome = await options.files.save(result.bytes, `${options.name}.wav`);
      if (!dialog.isConnected) return;
      stage = 'done'; progress.value = 1;
      status.textContent = outcome.status === 'saved' ? `“${outcome.name}”已保存，可以在其他播放器中打开。`
        : outcome.status === 'download-started' ? '已发起音频下载，请在浏览器中确认文件保存位置。' : '已取消保存文件，当前创作仍然保留。';
      start.textContent = '再次导出';
    } catch (error) {
      if (!dialog.isConnected) return;
      stage = 'idle'; status.textContent = controller.signal.aborted ? '导出已取消，当前创作仍然保留。' : error instanceof Error ? error.message : String(error);
      status.classList.add('dialog-error'); start.textContent = '重新导出';
    } finally {
      if (dialog.isConnected) { start.disabled = false; cancel.disabled = false; cancel.textContent = '关闭'; }
    }
  }
  dialog.append(title, description, quality, progress, status, actions); root.append(dialog); dialog.showModal();
}
