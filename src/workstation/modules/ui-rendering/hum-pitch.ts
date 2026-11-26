import { createBrowserSampleCapture } from '../sampling/public.ts';
import { createHumPitchTracker } from '../pitch-guide/public.ts';

export function mountHumPitch(target: HTMLElement, options: {
  canStart(): boolean;
  showPitch(midi?: number, released?: boolean): void;
  report(message: string): void;
}): { dismissResult(): void; dispose(): void } {
  const doc = target.ownerDocument ?? document;
  const capture = createBrowserSampleCapture({ reuseEngine: true });
  let session: object | undefined;
  let pitch: number | undefined;

  function end(keepResult: boolean): void {
    session = undefined;
    capture.cancel();
    if (pitch !== undefined) {
      options.showPitch(keepResult ? pitch : undefined, keepResult);
      if (!keepResult) pitch = undefined;
    }
  }
  const interrupt = () => end(false);

  async function record(token: object): Promise<void> {
    const tracker = createHumPitchTracker(midi => {
      if (session !== token) return;
      pitch = midi;
      options.showPitch(midi);
    });
    try {
      const recording = await capture.startStreaming((samples, rate) => {
        if (session === token) tracker.push(samples, rate);
      });
      if (session !== token) { recording.cancel(); return; }
      await recording.result;
    } catch (error) {
      if (session !== token) return;
      interrupt();
      options.report(error instanceof Error ? error.message : String(error));
    }
  }

  function down(event: KeyboardEvent): void {
    if (event.code !== 'AltLeft') {
      if (!session || event.repeat) return;
      interrupt();
      if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); }
      return;
    }
    if (event.repeat) { if (session) event.preventDefault(); return; }
    if (session || event.isComposing || event.ctrlKey || event.shiftKey || event.metaKey ||
        (event.target as Element | null)?.closest?.('input, textarea, select, [contenteditable="true"]') || !options.canStart()) return;
    interrupt();
    session = {};
    event.preventDefault();
    void record(session);
  }
  function up(event: KeyboardEvent): void {
    if (event.code !== 'AltLeft' || !session) return;
    event.preventDefault();
    end(true);
  }
  function visibility(): void {
    if (doc.hidden) interrupt();
  }

  doc.addEventListener('keydown', down, true);
  doc.addEventListener('keyup', up, true);
  doc.addEventListener('visibilitychange', visibility);
  window.addEventListener('blur', interrupt);
  return {
    dismissResult: interrupt,
    dispose() {
      interrupt();
      capture.dispose();
      doc.removeEventListener('keydown', down, true);
      doc.removeEventListener('keyup', up, true);
      doc.removeEventListener('visibilitychange', visibility);
      window.removeEventListener('blur', interrupt);
    },
  };
}
