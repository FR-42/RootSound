import type { PlaybackSession, SoundRuntimePort, SoundSequencePlan } from '../../contracts/sound.ts';

export interface PlaylistTransportState {
  readonly playing: boolean;
  readonly preparing: boolean;
  readonly rate: number;
  readonly position: number;
}

/** The playlist owns its song clock; each voice continues on its original sound clock. */
export function createPlaylistTransport(options: {
  readPlan(): SoundSequencePlan;
  prepare(): Promise<void>;
  runtime: SoundRuntimePort;
  onChange(state: PlaylistTransportState): void;
  onError(error: unknown): void;
}): {
  toggle(): Promise<void>;
  pause(): void;
  stop(): void;
  setRate(rate: number): void;
  seek(seconds: number): Promise<void>;
  position(): number;
  refresh(): void;
  dispose(): void;
} {
  const { runtime } = options;
  let playing = false; let preparing = false; let rate = 1; let cursor = 0; let duration = Infinity;
  let id: string | undefined; let anchorPosition = 0; let anchorElapsed = 0;
  let generation = 0; let editGeneration = 0; let disposed = false; let pendingDevice = false;

  function position(): number {
    if (!playing || !id) return cursor;
    const elapsed = runtime.position(id) ?? anchorElapsed;
    return Math.min(duration, Math.max(0, anchorPosition + Math.max(0, elapsed - anchorElapsed) * rate));
  }
  function changed(): void {
    if (!disposed) options.onChange({ playing, preparing, rate, position: position() });
  }
  function planAt(seconds: number, speed = rate): SoundSequencePlan {
    const source = options.readPlan();
    const position = Math.max(0, seconds);
    // Explicit seeking is not a restart command. Audition the empty area after
    // the music for a bounded tail, without extending the saved song or export.
    // Beyond the execution adapter's 600s plan limit, a local silent clock is
    // mapped to the absolute playlist head by anchorPosition below.
    if (position >= 600) {
      duration = position + 30;
      return { kind: 'sequence', version: 1, durationSeconds: 30, events: [],
        transport: { positionSeconds: 0, rate: speed } };
    }
    const extent = position >= source.durationSeconds ? Math.min(600, position + 30) : source.durationSeconds;
    duration = extent;
    return { ...source, durationSeconds: extent, transport: { positionSeconds: position, rate: speed } };
  }
  function forget(stop: boolean): void {
    const previous = id; id = undefined;
    if (stop && previous) runtime.stop(previous);
  }
  function pause(): void {
    if (disposed) return;
    generation++; editGeneration++;
    cursor = position();
    if (preparing) {
      preparing = false;
      if (pendingDevice) { pendingDevice = false; runtime.stopAll(); }
    }
    if (playing && id) {
      if (!runtime.pause || !runtime.resume) { options.onError(new Error('当前声音执行器尚不支持暂停续播。')); changed(); return; }
      try {
        const session = runtime.pause(id);
        if (session?.status === 'paused') playing = false;
        else { playing = false; forget(false); }
      } catch (error) { options.onError(error); }
    }
    changed();
  }
  function stop(): void {
    if (disposed) return;
    generation++; editGeneration++;
    const cancelDevice = pendingDevice;
    pendingDevice = false; playing = false; preparing = false;
    // Forget before stopping: the runtime synchronously publishes the stop.
    // That event must not restore the old cursor or invalidate the next start.
    forget(true);
    if (cancelDevice) runtime.stopAll();
    cursor = 0; anchorPosition = 0; anchorElapsed = 0;
    changed();
  }
  async function toggle(): Promise<void> {
    if (disposed) return;
    if (playing || preparing) { pause(); return; }
    const request = ++generation; preparing = true; changed();
    try {
      await options.prepare();
      if (disposed || request !== generation) return;
      const requestedPosition = cursor;
      const plan = planAt(requestedPosition);
      const previousElapsed = id ? runtime.position(id) ?? 0 : 0;
      pendingDevice = true;
      let session: PlaybackSession;
      if (id && runtime.resume) session = await runtime.resume(id, plan);
      else session = await runtime.preview(plan);
      if (request === generation) pendingDevice = false;
      if (disposed || request !== generation) { runtime.stop(session.id); return; }
      id = session.id; playing = session.status === 'playing';
      if (!playing && session.status !== 'paused') id = undefined;
      const currentElapsed = runtime.position(session.id) ?? previousElapsed;
      cursor = Math.min(duration, requestedPosition + Math.max(0, currentElapsed - previousElapsed) * plan.transport!.rate);
      anchorPosition = cursor; anchorElapsed = currentElapsed;
      // A speed click while the device was starting also reaches its schedule.
      if (playing && plan.transport!.rate !== rate) runtime.update(session.id, planAt(cursor));
    } catch (error) {
      if (!disposed && request === generation) { pendingDevice = false; playing = false; options.onError(error); }
    } finally {
      if (!disposed && request === generation) { preparing = false; changed(); }
    }
  }
  function setRate(nextRate: number): void {
    if (disposed) return;
    if (!Number.isFinite(nextRate) || nextRate < .25 || nextRate > 4) { options.onError(new Error('播放头速度需要在 0.25 至 4 倍之间。')); return; }
    if (nextRate === rate) return;
    const current = position();
    try {
      if (playing && id) {
        const elapsed = runtime.position(id) ?? anchorElapsed;
        const session = runtime.update(id, planAt(current, nextRate));
        if (!session) { playing = false; forget(false); }
        anchorPosition = current; anchorElapsed = elapsed;
      }
      cursor = current; rate = nextRate; changed();
    } catch (error) { options.onError(error); }
  }
  function seek(seconds: number): Promise<void> {
    if (disposed || !Number.isFinite(seconds)) return Promise.resolve();
    const continuePlaying = playing || preparing;
    generation++; editGeneration++;
    if (pendingDevice) { pendingDevice = false; runtime.stopAll(); }
    preparing = false; playing = false; forget(true);
    // A paused head can be placed beyond the previously played extent; edits
    // may already have extended the song while its prepared duration is stale.
    cursor = Math.max(0, seconds); anchorPosition = cursor; anchorElapsed = 0;
    changed();
    // Step entry can wait for the restarted main lane before auditioning its
    // new note: opening that lane cancels any earlier short-note audition.
    return continuePlaying ? toggle() : Promise.resolve();
  }
  function refresh(): void {
    const target = id; const request = ++editGeneration;
    if (disposed || !playing || !target) return;
    void (async () => {
      try {
        await options.prepare();
        if (disposed || request !== editGeneration || id !== target || !playing) return;
        const current = position(); const elapsed = runtime.position(target) ?? anchorElapsed;
        const session = runtime.update(target, planAt(current));
        if (!session) { cursor = current; playing = false; forget(false); }
        else { anchorPosition = current; anchorElapsed = elapsed; }
        changed();
      } catch (error) { if (!disposed && request === editGeneration && id === target) options.onError(error); }
    })();
  }
  const unsubscribe = runtime.subscribe(event => {
    if (disposed || event.type !== 'session' || event.session.id !== id || event.session.status === 'playing') return;
    if (event.session.status === 'paused') { cursor = position(); playing = false; changed(); return; }
    cursor = event.session.status === 'ended' ? 0 : position();
    playing = false; preparing = false; pendingDevice = false; generation++; editGeneration++; forget(false);
    if (event.session.status === 'failed') options.onError(new Error(event.session.error ?? '播放未能完成。'));
    changed();
  });
  return { toggle, pause, stop, setRate, seek, position, refresh, dispose() {
    if (disposed) return;
    disposed = true; generation++; editGeneration++; unsubscribe();
    if (pendingDevice) runtime.stopAll();
    forget(true); playing = false; preparing = false;
  } };
}
