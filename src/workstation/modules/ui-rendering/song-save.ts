/** One save command for both the primary button and the keyboard shortcut. */
export function createSongSaveAction(options: {
  prepare(): void;
  saveProject?(): void | Promise<void>;
  saveLocal(): void | Promise<void>;
  active(): boolean;
  onBusy(busy: boolean): void;
  onError(error: unknown): void;
}) {
  let busy = false;
  return {
    get busy() { return busy; },
    async run(): Promise<void> {
      if (busy || !options.active()) return;
      busy = true; options.onBusy(true);
      try {
        // Blurring may synchronously commit a field and rebuild the DOM. Read
        // the current editor only after that commit, and retain the file task
        // until its actual completion rather than treating a click as success.
        options.prepare();
        if (!options.active()) return;
        await (options.saveProject ?? options.saveLocal)();
      } catch (error) {
        if (options.active()) options.onError(error);
      } finally {
        busy = false;
        if (options.active()) options.onBusy(false);
      }
    },
  };
}

export function isSongSaveShortcut(event: Pick<KeyboardEvent, 'ctrlKey' | 'metaKey' | 'code' | 'key'>): boolean {
  return (event.ctrlKey || event.metaKey)
    && (event.code === 'KeyS' || (!/^Key[A-Z]$/u.test(event.code) && event.key.toLowerCase() === 's'));
}
