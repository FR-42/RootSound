import type { PhraseBody } from '../../contracts/phrase.ts';
import { phraseAuditionExtent } from './phrase-audition-extent.ts';
import type { SoundRuntimePort, SoundSequencePlan } from '../../contracts/sound.ts';
import { createPlaylistTransport, type PlaylistTransportState } from './playlist-transport.ts';

export const PHRASE_COMPOSITION_BEATS = 16;

/** Audition the editable phrase extent; older callers without an extent use four bars. */
export function createPhraseCompositionTransport(options: {
  readPlan(): SoundSequencePlan;
  prepare(): Promise<void>;
  tempoBpm(): number;
  lengthBeats?(): number;
  durationSeconds?(): number;
  readBody?(): PhraseBody | undefined;
  runtime: SoundRuntimePort;
  onChange(state: PlaylistTransportState): void;
  onError(error: unknown): void;
}): ReturnType<typeof createPlaylistTransport> {
  let tempo = options.tempoBpm();
  let requestedRate = 1;
  let state: PlaylistTransportState = { playing: false, preparing: false, rate: 1, position: 0 };
  let endTimer: ReturnType<typeof setTimeout> | undefined;
  let disposed = false;
  let manualTail = false;
  // Recompute on edits/transport actions, never scan thousands of notes per frame.
  let bounds: ReturnType<typeof phraseAuditionExtent> | undefined;
  const refreshExtent = () => { const body = options.readBody?.(); bounds = body ? phraseAuditionExtent(body) : undefined; };
  const extent = () => bounds;
  refreshExtent();
  const fullDuration = () => options.durationSeconds?.() ?? (options.lengthBeats?.() ?? PHRASE_COMPOSITION_BEATS) * 60 / tempo;
  const duration = () => { const bounds = extent(); return bounds ? manualTail ? bounds.fullEnd : bounds.barEnd : fullDuration(); };

  function clearEnd(): void {
    if (endTimer !== undefined) clearTimeout(endTimer);
    endTimer = undefined;
  }
  function scheduleEnd(): void {
    clearEnd();
    if (disposed || !state.playing) return;
    // The audio clock remains authoritative if the device stalls. This timer
    // also closes the window when a background UI is not painting frames.
    const remaining = Math.max(0, duration() - base.position());
    endTimer = setTimeout(() => {
      endTimer = undefined;
      position();
      if (!disposed && state.playing) scheduleEnd();
    }, Math.max(1, remaining * 1000 / state.rate));
  }
  function readPlan(): SoundSequencePlan {
    refreshExtent();
    const source = options.readPlan();
    const limit = duration();
    const events: SoundSequencePlan['events'][number][] = [];
    for (const event of source.events) {
      const available = (limit - event.atSeconds) / requestedRate;
      if (available < .0001) continue;
      const original = event.sound;
      const holdSeconds = Math.min(original.note.holdSeconds, available);
      const releaseSeconds = Math.min(original.envelope.releaseSeconds, Math.max(0, available - holdSeconds));
      const sound = holdSeconds === original.note.holdSeconds && releaseSeconds === original.envelope.releaseSeconds
        ? original : { ...original, note: { ...original.note, holdSeconds }, envelope: { ...original.envelope, releaseSeconds } };
      events.push({ ...event, sound });
    }
    return { ...source, durationSeconds: limit, events };
  }
  const base = createPlaylistTransport({ ...options, readPlan, onChange(next) {
    if (!next.playing && !next.preparing && next.position === 0) manualTail = false;
    state = { ...next, position: Math.min(duration(), next.position) };
    scheduleEnd();
    options.onChange(state);
  } });

  function position(): number {
    const current = Math.min(duration(), base.position());
    if (state.playing && current >= duration() - 1e-8) { stop(); return 0; }
    return current;
  }
  function stop(): void { manualTail = false; clearEnd(); base.stop(); }
  function seek(seconds: number): Promise<void> {
    if (disposed || !Number.isFinite(seconds)) return Promise.resolve();
    refreshExtent();
    const bounds = extent();
    if (bounds) manualTail = seconds > bounds.noteEnd + 1e-8;
    const target = Math.max(0, Math.min(bounds?.fullEnd ?? fullDuration(), seconds));
    if (target === duration()) base.pause();
    return base.seek(target);
  }
  return {
    async toggle() {
      if (disposed) return;
      refreshExtent();
      if (!state.playing && !state.preparing && base.position() >= duration()) base.seek(0);
      await base.toggle();
    },
    pause: base.pause,
    stop,
    setRate(rate) {
      if (disposed) return;
      if (Number.isFinite(rate) && rate >= .25 && rate <= 4) requestedRate = rate;
      base.setRate(rate);
      requestedRate = state.rate;
    },
    seek,
    position,
    refresh() {
      if (disposed) return;
      refreshExtent();
      if (bounds && state.playing && base.position() >= duration() - 1e-8) { stop(); return; }
      const nextTempo = options.tempoBpm();
      if (nextTempo !== tempo && !options.durationSeconds) {
        const beat = base.position() * tempo / 60;
        tempo = nextTempo;
        void base.seek(beat * 60 / tempo);
      } else if (base.position() > duration() && !manualTail) void base.seek(duration());
      else { base.refresh(); scheduleEnd(); }
    },
    dispose() { if (disposed) return; disposed = true; clearEnd(); base.dispose(); },
  };
}
