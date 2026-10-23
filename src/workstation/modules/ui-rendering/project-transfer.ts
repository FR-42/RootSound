import type { ProjectFilesPort } from '../../contracts/files.ts';
import type { ProjectPackagesPort } from '../../contracts/project.ts';
import type { ReferenceEditingPort } from '../../contracts/references.ts';
import { pendingReferenceEdits } from './reference-activity.ts';

/** File operations are separate from DOM so cancellation and pending edits can be tested directly. */
export function createProjectTransfer(projects: ProjectPackagesPort, files: ProjectFilesPort,
  references?: Pick<ReferenceEditingPort, 'sessions'>) {
  let busy = false;
  function ready(draftId: string): void {
    if (pendingReferenceEdits(references, draftId).length)
      throw new Error('这首歌还有正在调整的乐句或声音。请先完成或取消这些调整，再保存工程文件，避免漏掉你的修改。');
  }
  return {
    async save(draftId: string) {
      if (busy) return { status: 'busy' as const };
      busy = true;
      try {
        ready(draftId);
        // Capture before opening the asynchronous platform dialog. Later edits
        // must not change the file whose save was already requested.
        const snapshot = projects.exportDraft(draftId);
        return await files.save(snapshot.text, snapshot.name);
      } finally { busy = false; }
    },
    async open() {
      if (busy) return { status: 'busy' as const };
      busy = true;
      try {
        const file = await files.open();
        if (file.status === 'cancelled') return file;
        const result = projects.importProject(file.text);
        return result.status === 'imported' ? { ...result, fileName: file.name } : result;
      } finally { busy = false; }
    },
  };
}
