import type { MidiImportNotice } from '../../contracts/project-directory.ts';
import './midi-import-notice.css';

/** Compact completion status; details are opt-in and never use source HTML. */
export function showMidiImportNotice(root: HTMLElement, notice: MidiImportNotice): { dispose(): void } {
  const panel = document.createElement('aside'); panel.className = 'midi-import-notice'; panel.setAttribute('role', 'status');
  const header = document.createElement('div'); header.className = 'midi-import-notice-heading';
  const title = document.createElement('strong'); title.textContent = 'MIDI 已导入';
  const close = document.createElement('button'); close.type = 'button'; close.textContent = '×'; close.setAttribute('aria-label', '关闭导入提示');
  close.addEventListener('click', () => panel.remove()); header.append(title, close);
  const summary = document.createElement('p'); summary.textContent = `${notice.trackCount} 个声部 · ${notice.noteCount} 个音符`;
  panel.append(header, summary);
  if (notice.warnings.length) {
    const details = document.createElement('details'); const label = document.createElement('summary'); label.textContent = '查看导入说明';
    const list = document.createElement('ul');
    for (const warning of notice.warnings) { const row = document.createElement('li'); row.textContent = warning; list.append(row); }
    details.append(label, list); panel.append(details);
  }
  root.append(panel); return { dispose() { panel.remove(); } };
}
