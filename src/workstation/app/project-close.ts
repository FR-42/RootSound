export type ProjectClosePreparation = { ready: true; name?: string; canSave: boolean; saveMessage?: string };

/** Flush working fields only. The caller still chooses Save, Discard or Cancel. */
export function createProjectClosePreparation(source: {
  flush(): void | Promise<void>;
  assertSaveReady(): void;
  name(): string | undefined;
}): () => Promise<ProjectClosePreparation> {
  return async () => {
    let failed = false; let failure: unknown;
    try { await source.flush(); source.assertSaveReady(); } catch (error) { failed = true; failure = error; }
    let name: string | undefined;
    try { name = source.name(); } catch (error) { if (!failed) failure = error; failed = true; }
    return { ready: true, ...(name ? { name } : {}), canSave: !failed,
      ...(failed ? { saveMessage: failure instanceof Error ? failure.message : failure == null ? '当前修改尚未处理完成。' : String(failure) } : {}) };
  };
}
