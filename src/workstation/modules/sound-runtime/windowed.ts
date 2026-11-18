import { allocateGraph, createWindowedSampleCache, releaseGraph, releaseScheduledNotes, scheduleGraph, startGraphSource, type GraphResources, type SoundGraph } from './graph.ts';
import type { ScheduledPreview } from './plan.ts';

/** Device-clock lookahead; the timer only replenishes it, never supplies note timing. */
export const SCHEDULING_LOOKAHEAD_SECONDS = .35;
export const WINDOWED_EVENT_THRESHOLD = 256;
const TICK_MILLISECONDS = 25;

export function emptyResources(): GraphResources {
  return { oscillators: [], samples: [], bufferReleases: [], gains: [], panners: [] };
}

type LiveEvent = { readonly index: number; readonly resources: GraphResources; readonly graph: SoundGraph; readonly end: number; readonly starts: Map<AudioScheduledSourceNode, number> };

/** A single output bus, with only sounding and shortly upcoming notes allocated. */
export class WindowedGraph {
  readonly graph: SoundGraph;
  readonly fade: GainNode;
  readonly #audio: BaseAudioContext;
  readonly #preview: ScheduledPreview;
  readonly #events: ScheduledPreview['events'];
  readonly #sampleCache: ReturnType<typeof createWindowedSampleCache>;
  readonly #live = new Map<number, LiveEvent>();
  readonly #noteIndices = new Map<string, number[]>();
  readonly #restored = new Set<number>();
  #cursor = 0;
  #origin = 0;
  #from = 0;
  #timer: ReturnType<typeof setTimeout> | undefined;
  #disposed = false;
  #running = false;
  #primedAt: number | undefined;

  constructor(audio: BaseAudioContext, preview: ScheduledPreview, resources: GraphResources, destination: AudioNode) {
    this.#audio = audio; this.#preview = preview;
    this.#events = [...preview.events].sort((a, b) => a.atSeconds - b.atSeconds);
    if (preview.deletedNotes) this.#events.forEach(({ noteId }, index) => {
      if (noteId === undefined) return;
      const indices = this.#noteIndices.get(noteId);
      if (indices) indices.push(index);
      else this.#noteIndices.set(noteId, [index]);
    });
    this.#sampleCache = createWindowedSampleCache(audio);
    this.fade = audio.createGain(); resources.gains.push(this.fade);
    // Keep the fader as the outlet so audition ducking can reroute a live stream.
    resources.outputBuses = [this.fade]; this.fade.connect(destination);
    this.graph = allocateGraph(audio, { ...preview, events: [] }, resources, undefined, this.fade);
    resources.outputBuses = [this.fade];
  }

  /** Build the first batch before choosing a start on a clock that keeps moving. */
  prime(from: number): void {
    this.#primedAt = from;
    this.#fill(from, false);
  }

  get leadSeconds(): number {
    let sources = 0; for (const event of this.#live.values()) sources += event.graph.starts.length;
    return .01 + sources * .00004 + this.#live.size * .00002;
  }

  prepare(origin: number, from: number, transitionSeconds = 0): void {
    this.#origin = origin; this.#from = from;
    if (this.#primedAt === undefined) this.prime(from);
    // A severely stalled live replacement keeps the old audible graph intact.
    // Normal allocation has already finished before its new cutover is chosen.
    if (from - this.#primedAt! > SCHEDULING_LOOKAHEAD_SECONDS - .025) throw new Error('当前声音准备时间过长，请重新播放。');
    this.fade.gain.setValueAtTime(transitionSeconds ? 0 : 1, origin + from);
    if (transitionSeconds) this.fade.gain.linearRampToValueAtTime(1, origin + from + transitionSeconds);
    for (const event of this.#live.values()) this.#start(event, from);
  }

  /** Also used while an offline clock is suspended, before rendering its next block. */
  advance(position: number): void {
    if (this.#disposed) return;
    const from = Math.max(this.#from, position);
    for (const event of this.#live.values()) if (event.end + .002 <= from) this.#release(event);
    this.#fill(from, true);
  }

  #fill(from: number, start: boolean): void {
    const horizon = from + SCHEDULING_LOOKAHEAD_SECONDS;
    for (const index of this.#restored) {
      if (this.#events[index]!.atSeconds > horizon) continue;
      this.#restored.delete(index);
      this.#queueEvent(index, from, start);
    }
    while (this.#cursor < this.#events.length && this.#events[this.#cursor]!.atSeconds <= horizon)
      this.#queueEvent(this.#cursor++, from, start);
  }

  #queueEvent(index: number, from: number, start: boolean): void {
    const event = this.#events[index]!;
    const end = event.atSeconds + event.duration;
    // If a background timer was delayed, recover a surviving note at its real
    // age. Entirely expired notes must not be replayed as a burst on return.
    if (end <= from || (event.noteId !== undefined && this.#preview.deletedNotes?.has(event.noteId))) return;
    const resources = emptyResources();
    let live: LiveEvent | undefined;
    let remaining = event.sound.kind === 'sample' ? 1 : event.sound.sources.length;
    try {
      if (event.sound.kind === 'sample') this.#sampleCache.retain(event.sound.source);
      const graph = allocateGraph(this.#audio, { ...this.#preview, output: undefined, events: [event] }, resources, () => {
        if (--remaining === 0 && live) this.#release(live);
      }, this.graph.output?.node ?? this.fade, this.graph.groups);
      live = { index, resources, graph, end, starts: new Map() };
      this.#live.set(index, live);
      if (start) this.#start(live, from);
    } catch (error) {
      if (live) this.#release(live);
      else releaseGraph(resources);
      throw error;
    }
  }

  setNotesDeleted(ids: readonly string[], deleted: boolean): boolean {
    const deletedNotes = this.#preview.deletedNotes;
    if (!deletedNotes || this.#disposed) return false;
    const now = this.#audio.currentTime;
    let needsRefill = false;
    for (const id of ids) {
      const indices = this.#noteIndices.get(id);
      if (!indices) continue;
      if (deleted) {
        if (deletedNotes.has(id)) continue;
        deletedNotes.add(id);
        for (const index of indices) {
          this.#restored.delete(index);
          const live = this.#live.get(index);
          if (live && !Array.from(live.starts.values()).some(time => time <= now)) this.#release(live);
        }
      } else if (this.#origin + this.#events[indices[0]!]!.atSeconds > now && deletedNotes.delete(id)) {
        for (const index of indices) {
          if (index >= this.#cursor || this.#live.has(index)) continue;
          this.#restored.add(index);
          needsRefill = true;
        }
      }
    }
    return needsRefill;
  }

  #start(event: LiveEvent, position: number): void {
    const from = Math.max(position, this.#audio.currentTime - this.#origin);
    if (event.end <= from) { this.#release(event); return; }
    scheduleGraph(event.graph, this.#preview.normalization, this.#origin, from, event.graph.starts[0]!.atSeconds < from ? .005 : 0);
    for (const scheduled of event.graph.starts) {
      const time = startGraphSource(scheduled, this.#origin, from);
      if (time !== undefined) event.starts.set(scheduled.node, time);
    }
  }

  run(onError: (error: unknown) => void, immediate = false): void {
    if (this.#disposed || (this.#running && !immediate) || !this.#hasWork()) return;
    this.#cancelTimer();
    this.#running = true;
    const tick = (): void => {
      this.#timer = undefined;
      if (!this.#running || this.#disposed) return;
      try { this.advance(Math.max(this.#from, this.#audio.currentTime - this.#origin)); }
      catch (error) { this.#running = false; onError(error); return; }
      if (!this.#hasWork()) { this.#running = false; return; }
      this.#timer = setTimeout(tick, TICK_MILLISECONDS);
    };
    this.#timer = setTimeout(tick, immediate ? 0 : TICK_MILLISECONDS);
  }

  #hasWork(): boolean {
    return this.#live.size > 0 || this.#restored.size > 0 || this.#cursor < this.#events.length;
  }

  retire(cutover: number, until: number): void {
    this.#cancelTimer();
    for (const event of this.#live.values()) for (const source of [...event.resources.oscillators, ...event.resources.samples]) {
      source.onended = null;
      try { source.stop((event.starts.get(source) ?? cutover) >= cutover ? cutover : until); } catch { /* Already ended. */ }
    }
  }

  releaseNotes(now: number): number {
    this.#cancelTimer();
    let end = now;
    for (const event of this.#live.values())
      end = Math.max(end, releaseScheduledNotes(event.graph, event.starts, this.#origin, now, this.#preview.normalization));
    return end;
  }

  dispose(): void {
    if (this.#disposed) return;
    this.#disposed = true; this.#cancelTimer();
    for (const event of this.#live.values()) this.#release(event);
    this.#sampleCache.dispose();
  }

  #cancelTimer(): void {
    this.#running = false;
    if (this.#timer !== undefined) clearTimeout(this.#timer);
    this.#timer = undefined;
  }

  #release(event: LiveEvent): void {
    if (this.#live.get(event.index) !== event) return;
    this.#live.delete(event.index);
    for (const source of [...event.resources.oscillators, ...event.resources.samples]) source.onended = null;
    releaseGraph(event.resources);
  }
}
