export type ProjectClosePreparation = { ready: true; name?: string; canSave: boolean; saveMessage?: string };

export function createProjectClosePreparation(source: {
  flush(): void | Promise<void>;
  prepareSave(): void | Promise<void>;
  name(): string | undefined;
}): (mode: 'check' | 'save') => Promise<ProjectClosePreparation> {
  return async mode => {
    try {
      await source.flush();
      if (mode === 'check') return { ready: true, canSave: true };
      await source.prepareSave();
      const name = source.name();
      return { ready: true, canSave: true, ...(name ? { name } : {}) };
    } catch (error) {
      const saveMessage = error instanceof Error ? error.message : String(error ?? '当前修改尚未处理完成。');
      return { ready: true, canSave: false, saveMessage };
    }
  };
}
