import { allocateGraph, releaseGraph, scheduleGraph, startGraphSource, type GraphResources, type SoundGraph } from './graph.ts';
import { noteDuration, type ScheduledPreview } from './plan.ts';

/** Device-clock lookahead; the timer only replenishes it, never supplies note timing. */
export const SCHEDULING_LOOKAHEAD_SECONDS = .35;
export const WINDOWED_EVENT_THRESHOLD = 256;
const TICK_MILLISECONDS = 25;

export function emptyResources(): GraphResources {
  return { oscillators: [], samples: [], bufferReleases: [], gains: [], panners: [] };
}

type LiveEvent = { readonly resources: GraphResources; readonly graph: SoundGraph; readonly end: number; readonly starts: Map<AudioScheduledSourceNode, number> };

/** A single output bus, with only sounding and shortly upcoming notes allocated. */
export class WindowedGraph {
  readonly graph: SoundGraph;
  readonly fade: GainNode;
  readonly #audio: BaseAudioContext;
  readonly #preview: ScheduledPreview;
  readonly #events: ScheduledPreview['events'];
  readonly #live = new Set<LiveEvent>();
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
    let sources = 0; for (const event of this.#live) sources += event.graph.starts.length;
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
    for (const event of this.#live) this.#start(event, from);
  }

  /** Also used while an offline clock is suspended, before rendering its next block. */
  advance(position: number): void {
    if (this.#disposed) return;
    const from = Math.max(this.#from, position);
    for (const event of this.#live) if (event.end + .002 <= from) this.#release(event);
    this.#fill(from, true);
  }

  #fill(from: number, start: boolean): void {
    const horizon = from + SCHEDULING_LOOKAHEAD_SECONDS;
    while (this.#cursor < this.#events.length && this.#events[this.#cursor]!.atSeconds <= horizon) {
      const event = this.#events[this.#cursor++]!;
      const end = event.atSeconds + noteDuration(event.sound);
      // If a background timer was delayed, recover a surviving note at its real
      // age. Entirely expired notes must not be replayed as a burst on return.
      if (end <= from) continue;
      const resources = emptyResources();
      let live: LiveEvent | undefined;
      let remaining = event.sound.kind === 'sample' ? 1 : event.sound.sources.length;
      try {
        const graph = allocateGraph(this.#audio, { ...this.#preview, output: undefined, events: [event] }, resources, () => {
          if (--remaining === 0 && live) this.#release(live);
        }, this.graph.output?.node ?? this.fade);
        live = { resources, graph, end, starts: new Map() }; this.#live.add(live);
        if (start) this.#start(live, from);
      } catch (error) { releaseGraph(resources); throw error; }
    }
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

  run(onError: (error: unknown) => void): void {
    if (this.#disposed || this.#running || (!this.#live.size && this.#cursor >= this.#events.length)) return;
    this.#running = true;
    const tick = (): void => {
      this.#timer = undefined;
      if (!this.#running || this.#disposed) return;
      try { this.advance(Math.max(this.#from, this.#audio.currentTime - this.#origin)); }
      catch (error) { this.#running = false; onError(error); return; }
      if (!this.#live.size && this.#cursor >= this.#events.length) { this.#running = false; return; }
      this.#timer = setTimeout(tick, TICK_MILLISECONDS);
    };
    this.#timer = setTimeout(tick, TICK_MILLISECONDS);
  }

  retire(cutover: number, until: number): void {
    this.#cancelTimer();
    for (const event of this.#live) for (const source of [...event.resources.oscillators, ...event.resources.samples]) {
      source.onended = null;
      try { source.stop((event.starts.get(source) ?? cutover) >= cutover ? cutover : until); } catch { /* Already ended. */ }
    }
  }

  dispose(): void {
    if (this.#disposed) return;
    this.#disposed = true; this.#cancelTimer();
    for (const event of this.#live) this.#release(event);
  }

  #cancelTimer(): void {
    this.#running = false;
    if (this.#timer !== undefined) clearTimeout(this.#timer);
    this.#timer = undefined;
  }

  #release(event: LiveEvent): void {
    if (!this.#live.delete(event)) return;
    for (const source of [...event.resources.oscillators, ...event.resources.samples]) source.onended = null;
    releaseGraph(event.resources);
  }
}
