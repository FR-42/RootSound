import type { ProjectSaveChoice } from '../contracts/project-directory.ts';

export type ProjectClosePreparation = { ready: true; name?: string; canSave: boolean; saveMessage?: string; saved?: true; discarded?: true; cancelled?: true };

export function createProjectClosePreparation(source: {
  flush(): void | Promise<void>;
  prepareSave(): void | Promise<void>;
  chooseSave?(): Promise<ProjectSaveChoice>;
  name(): string | undefined;
}): (mode: 'check' | 'save') => Promise<ProjectClosePreparation> {
  return async mode => {
    try {
      await source.flush();
      if (mode === 'check') return { ready: true, canSave: true };
      if (source.chooseSave) {
        const choice = await source.chooseSave();
        if (choice === 'cancelled') return { ready: true, canSave: false, cancelled: true };
        return choice === 'saved' ? { ready: true, canSave: true, saved: true } : { ready: true, canSave: true, discarded: true };
      }
      await source.prepareSave();
      const name = source.name();
      return { ready: true, canSave: true, ...(name ? { name } : {}) };
    } catch (error) {
      const saveMessage = error instanceof Error ? error.message : String(error ?? '当前修改尚未处理完成。');
      return { ready: true, canSave: false, saveMessage };
    }
  };
}
