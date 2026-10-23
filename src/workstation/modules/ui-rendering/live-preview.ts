import type { PlayableNotePlan, SoundSequencePlan, SoundRuntimePort } from '../../contracts/sound.ts';

type Plan = PlayableNotePlan | SoundSequencePlan;
type Frames = { request(callback: () => void): number; cancel(id: number): void };

/** Coalesce pointer input without persisting provisional edits or restarting playback. */
export function createLivePreview(
  sound: Pick<SoundRuntimePort, 'update'>,
  session: () => string | undefined,
  onError: (error: unknown) => void,
  frames: Frames = { request: callback => requestAnimationFrame(callback), cancel: id => cancelAnimationFrame(id) },
  prepare?: () => Promise<void>,
): { request(build: () => Plan): void; flush(build?: () => Plan): void; cancel(): void } {
  let scheduled: number | undefined;
  let pending: { id: string; build: () => Plan } | undefined;
  let generation = 0;
  function cancel(): void {
    if (scheduled !== undefined) frames.cancel(scheduled);
    scheduled = undefined; pending = undefined; generation++;
  }
  function flush(build?: () => Plan): void {
    if (scheduled !== undefined) frames.cancel(scheduled);
    scheduled = undefined;
    const id = session();
    const update = build && id ? { id, build } : pending;
    pending = undefined;
    // A queued gesture from a previous transport must never update its replacement.
    if (!update || update.id !== id) return;
    const request = ++generation;
    if (!prepare) { try { sound.update(update.id, update.build()); } catch (error) { onError(error); } return; }
    void (async () => {
      try {
        await prepare();
        if (request === generation && update.id === session()) sound.update(update.id, update.build());
      } catch (error) { if (request === generation && update.id === session()) onError(error); }
    })();
  }
  return {
    request(build) {
      const id = session();
      if (!id) return;
      generation++;
      pending = { id, build };
      if (scheduled === undefined) scheduled = frames.request(() => flush());
    },
    flush,
    cancel,
  };
}
