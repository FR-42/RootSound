import type { ProjectSaveChoice } from '../contracts/project-directory.ts';

export type ProjectClosePreparation = { ready: true; name?: string; canSave: boolean; saveMessage?: string; saved?: true; discarded?: true; cancelled?: true };
type CloseMode = 'check' | 'save';
type PrepareClose = (mode: CloseMode, signal?: AbortSignal) => Promise<ProjectClosePreparation>;
type CloseResult = ProjectClosePreparation | { ready: false; canSave: false; message: string; startupFailed?: true };

export function createProjectClosePreparation(source: {
  flush(): void | Promise<void>;
  prepareSave(): void | Promise<void>;
  chooseSave?(signal?: AbortSignal): Promise<ProjectSaveChoice>;
  name(): string | undefined;
}): PrepareClose {
  return async (mode, signal) => {
    try {
      await source.flush();
      if (signal?.aborted) return { ready: true, canSave: false, cancelled: true };
      if (mode === 'check') return { ready: true, canSave: true };
      if (source.chooseSave) {
        const choice = await source.chooseSave(signal);
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

export function createRendererCloseRequests() {
  type Editor = { prepareClose: PrepareClose; awaitingCloseChoice(): boolean };
  type Request = { id: string; mode: CloseMode; controller: AbortController; result: CloseResult | null };
  let active: Request | undefined;
  let editor: Editor | undefined;
  let attach!: (state: Editor | { error: string }) => void;
  const startup = new Promise<Editor | { error: string }>(resolve => { attach = resolve; });

  return {
    useEditor(value: Editor) { editor = value; attach(value); },
    startupFailed(error: unknown) { attach({ error: error instanceof Error ? error.message : String(error) }); },
    begin(id: string, mode: CloseMode) {
      active?.controller.abort();
      const request: Request = { id, mode, controller: new AbortController(), result: null };
      active = request;
      const signal = request.controller.signal;
      void startup.then(async state => {
        if (signal.aborted) return;
        request.result = 'error' in state
          ? { ready: false, canSave: false, message: state.error, startupFailed: true }
          : await state.prepareClose(mode, signal);
      }).catch(error => {
        request.result = { ready: false, canSave: false, message: error instanceof Error ? error.message : String(error) };
      });
      return true;
    },
    read(id: string) {
      if (active?.id !== id) return null;
      return { result: active.result, awaitingChoice: !active.result && active.mode === 'save' && !!editor?.awaitingCloseChoice() };
    },
    cancel(id: string) {
      if (active?.id !== id) return;
      active.controller.abort();
      active = undefined;
    },
  };
}
