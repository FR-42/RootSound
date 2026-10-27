import type { PlaybackSession, SoundRuntimePort } from '../../contracts/sound.ts';

export type SongPhraseAuditionState = { phraseId?: string; playing: boolean; preparing: boolean };

/** One console audition owns only its own request/session, never the whole audio device. */
export function createSongPhraseAudition(options: {
  runtime: Pick<SoundRuntimePort, 'stop' | 'subscribe'>;
  preview(id: string, signal: AbortSignal): Promise<PlaybackSession>;
  onChange(state: SongPhraseAuditionState): void;
  onError(error: unknown): void;
}): { read(): SongPhraseAuditionState; toggle(id: string): Promise<void>; stop(): void; dispose(): void } {
  let state: SongPhraseAuditionState = { playing: false, preparing: false };
  let sessionId: string | undefined; let request: AbortController | undefined;
  let generation = 0; let disposed = false;
  const changed = () => { if (!disposed) options.onChange({ ...state }); };
  function stopSession(id: string): void {
    try { options.runtime.stop(id); } catch (error) { if (!disposed) options.onError(error); }
  }
  function stop(): void {
    generation++; request?.abort(); request = undefined;
    const previous = sessionId; sessionId = undefined;
    const active = !!state.phraseId || state.playing || state.preparing;
    state = { playing: false, preparing: false };
    if (previous) stopSession(previous);
    if (active) changed();
  }
  const unsubscribe = options.runtime.subscribe(event => {
    if (disposed) return;
    if (event.type === 'device') {
      if (event.status === 'failed' && (state.playing || state.preparing)) {
        stop(); options.onError(new Error(event.error ?? '暂时无法演奏这个乐句。'));
      }
      return;
    }
    if (event.session.id !== sessionId) return;
    if (event.session.status === 'playing' || event.session.status === 'paused') {
      state = { ...state, playing: event.session.status === 'playing', preparing: false }; changed(); return;
    }
    sessionId = undefined; state = { playing: false, preparing: false }; changed();
    if (event.session.status === 'failed') options.onError(new Error(event.session.error ?? '暂时无法演奏这个乐句。'));
  });
  return {
    read: () => ({ ...state }),
    async toggle(id) {
      if (disposed) return;
      if (!id.trim()) { options.onError(new Error('找不到要演奏的乐句。')); return; }
      if (state.phraseId === id && (state.playing || state.preparing)) { stop(); return; }
      stop(); const expected = ++generation; const controller = new AbortController(); request = controller;
      state = { phraseId: id, playing: false, preparing: true }; changed();
      try {
        const session = await options.preview(id, controller.signal);
        if (disposed || expected !== generation || controller.signal.aborted) { stopSession(session.id); return; }
        request = undefined;
        if (session.status === 'ended' || session.status === 'stopped' || session.status === 'failed') {
          state = { playing: false, preparing: false }; changed();
          if (session.status === 'failed') options.onError(new Error(session.error ?? '暂时无法演奏这个乐句。'));
          return;
        }
        sessionId = session.id; state = { phraseId: id, playing: session.status === 'playing', preparing: false }; changed();
      } catch (error) {
        if (disposed || expected !== generation || controller.signal.aborted) return;
        request = undefined; state = { playing: false, preparing: false }; changed(); options.onError(error);
      }
    },
    stop,
    dispose() { if (disposed) return; disposed = true; stop(); unsubscribe(); },
  };
}
