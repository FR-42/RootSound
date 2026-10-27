import type {
  PlaybackSession,
  PlaybackStatus,
  PlayableNotePlan,
  SoundRuntimeEvent,
  SoundRuntimePort,
  SoundSequencePlan,
  PcmAudio,
} from '../../contracts/sound.ts';

import { noteDuration, previewFingerprint, readPreview, samePreviewSamples, validateFrequency, type ScheduledPreview } from './plan.ts';
import { allocateGraph, releaseGraph, scheduleGraph, startGraphSource, type GraphResources } from './graph.ts';
import { renderOffline } from './offline.ts';
import { readPcmAudio } from './pcm.ts';

const DEVICE_RESUME_TIMEOUT_MS = 3000;
const LIVE_TRANSITION_SECONDS = 0.005;
let runtimeSequence = 0;

interface ActiveVoice {
  audioSource?: AudioBufferSourceNode;
  session: PlaybackSession;
  readonly oscillators: OscillatorNode[];
  readonly samples: AudioBufferSourceNode[];
  readonly bufferReleases: (() => void)[];
  readonly gains: GainNode[];
  readonly panners: StereoPannerNode[];
  outputBuses?: GainNode[];
  filters?: BiquadFilterNode[];
  completion: ConstantSourceNode | null;
  remaining: number;
  generation: number;
  fadeGains: GainNode[];
  fingerprint: string;
  preview?: ScheduledPreview;
  startTimes: Map<AudioScheduledSourceNode, number>;
  readonly retiring: Set<{ resources: GraphResources; clock: ConstantSourceNode; until: number }>;
  originSeconds: number;
  clockFloorSeconds?: number;
  pausedElapsed?: number;
}

interface AuditionVoice {
  readonly resources: GraphResources;
  remaining: number;
}


function message(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/**
 * Browser adapter for architecture verification, not the final desktop backend.
 * It owns one device and one active preview; new previews replace old ones.
 * Creating this adapter does not open the device. Call preview from a user action.
 */
export function createBrowserSoundRuntime(): SoundRuntimePort {
  const runtimeId = ++runtimeSequence;
  const listeners = new Set<(event: SoundRuntimeEvent) => void>();
  const pendingResumes = new Set<() => void>();
  const pendingAuditionResumes = new Set<() => void>();
  const renders = new Set<AbortController>();
  const events: SoundRuntimeEvent[] = [];
  let dispatching = false;
  let context: AudioContext | null = null;
  let active: ActiveVoice | null = null;
  let auditionVoice: AuditionVoice | null = null;
  let auditionSequence = 0;
  let mainMix: GainNode | null = null;
  let sequence = 0;
  let requestSequence = 0;
  let disposed = false;
  let disposePromise: Promise<void> | null = null;
  let deviceState: SoundRuntimeEvent = { type: 'device', status: 'idle' };
  let terminalPosition: { id: string; seconds: number } | null = null;

  function elapsed(voice: ActiveVoice): number {
    return Math.max(0, Math.min(voice.session.durationSeconds!, Math.max(voice.clockFloorSeconds ?? 0, voice.pausedElapsed ?? (context?.currentTime ?? voice.originSeconds) - voice.originSeconds)));
  }

  function send(listener: (event: SoundRuntimeEvent) => void, event: SoundRuntimeEvent): void {
    // A display subscriber must not interrupt audio cleanup or other subscribers.
    try { listener(event); } catch { /* Subscriber errors belong to the caller. */ }
  }

  function emit(event: SoundRuntimeEvent): void {
    events.push(event);
    if (dispatching) return;
    dispatching = true;
    try {
      while (events.length > 0) {
        const next = events.shift()!;
        for (const listener of listeners) send(listener, next);
      }
    } finally {
      dispatching = false;
    }
  }

  function device(status: Extract<SoundRuntimeEvent, { type: 'device' }>['status'], error?: string): void {
    deviceState = Object.freeze(error === undefined ? { type: 'device', status } : { type: 'device', status, error });
    emit(deviceState);
  }

  function cancelPendingResumes(pending = pendingResumes): void {
    for (const cancel of pending) cancel();
    pending.clear();
  }

  function releaseAudition(voice: AuditionVoice): void {
    if (auditionVoice === voice) auditionVoice = null;
    releaseGraph(voice.resources);
    if (!auditionVoice) duckMain(false);
  }

  function duckMain(duck: boolean, until?: number): void {
    if (!mainMix || !context || context.state === 'closed') return;
    mainMix.gain.cancelAndHoldAtTime(context.currentTime);
    mainMix.gain.linearRampToValueAtTime(duck ? 0.5 : 1, until ?? context.currentTime + LIVE_TRANSITION_SECONDS);
  }

  function ensureMainMix(audio: AudioContext): void {
    if (mainMix) return;
    const mix = audio.createGain(); mix.gain.setValueAtTime(1, audio.currentTime); mix.connect(audio.destination);
    mainMix = mix;
    // Add the bus only when a short note is first needed. Existing and retiring
    // graphs keep their clocks; subsequent live replacements use the same bus.
    const outlets = (resources: GraphResources): AudioNode[] => resources.outputBuses?.length ? resources.outputBuses : resources.panners;
    for (const outlet of [...(active ? outlets(active) : []), ...[...(active?.retiring ?? [])].flatMap(item => outlets(item.resources))]) {
      outlet.disconnect(); outlet.connect(mix);
    }
    if (active?.audioSource) { active.audioSource.disconnect(); active.audioSource.connect(mix); }
  }

  function cancelAudition(): void {
    auditionSequence++;
    cancelPendingResumes(pendingAuditionResumes);
    if (auditionVoice) releaseAudition(auditionVoice);
  }

  function clearVoice(voice: ActiveVoice): void {
    if (voice.audioSource) {
      voice.audioSource.onended = null;
      try { voice.audioSource.stop(); } catch { /* The sample may already have ended. */ }
      voice.audioSource.disconnect(); voice.audioSource = undefined;
    }
    if (voice.completion !== null) {
      voice.completion.onended = null;
      try { voice.completion.stop(); } catch { /* The clock source may have ended. */ }
      voice.completion.disconnect();
    }
    releaseGraph(voice);
    for (const retiring of voice.retiring) {
      retiring.clock.onended = null;
      try { retiring.clock.stop(); } catch { /* It may have completed. */ }
      retiring.clock.disconnect();
      releaseGraph(retiring.resources);
    }
    voice.retiring.clear();
    voice.completion = null;
    voice.oscillators.length = 0; voice.samples.length = 0; voice.gains.length = 0; voice.panners.length = 0;
    voice.outputBuses = undefined; voice.filters = undefined; voice.fadeGains = []; voice.startTimes.clear();
  }

  function finish(voice: ActiveVoice, status: Exclude<PlaybackStatus, 'playing' | 'paused'>, error?: string): void {
    if (voice.session.status !== 'playing' && voice.session.status !== 'paused') return;
    terminalPosition = { id: voice.session.id, seconds: status === 'ended' ? voice.session.durationSeconds! : elapsed(voice) };
    voice.session = Object.freeze({ ...voice.session, status, endedAtSeconds: context?.currentTime ?? voice.session.startedAtSeconds,
      ...(error === undefined ? {} : { error }) });
    if (active === voice) active = null;
    clearVoice(voice);
    emit({ type: 'session', session: voice.session });
  }

  function deviceChanged(): void {
    if (context === null || disposed) return;
    const state = String(context.state);
    if (state === 'running') {
      device('running');
    } else if (state === 'suspended' || state === 'interrupted') {
      cancelAudition();
      const error = '声音设备已暂停，当前试听已结束；请重新点击试听。';
      if (active !== null) finish(active, 'failed', error);
      device('suspended', error);
    } else if (state === 'closed') {
      cancelAudition();
      const error = '声音设备已关闭，请重新打开工作站。';
      if (active !== null) finish(active, 'failed', error);
      device('closed', error);
    } else {
      cancelAudition();
      const error = `无法识别声音设备状态：${state}。`;
      if (active !== null) finish(active, 'failed', error);
      device('failed', error);
    }
  }

  async function ready(pending = pendingResumes): Promise<AudioContext> {
    if (context === null) {
      if (typeof globalThis.AudioContext !== 'function') {
        throw new Error('当前环境没有可用的声音设备接口。');
      }
      context = new AudioContext();
      context.onstatechange = deviceChanged;
    }
    const audio = context;
    if (audio.state === 'closed') throw new Error('声音设备已关闭，请重新打开工作站。');
    if (audio.state !== 'running') {
      let timer: ReturnType<typeof setTimeout> | undefined;
      let cancel: (() => void) | undefined;
      try {
        await Promise.race([
          audio.resume(),
          new Promise<never>((_resolve, reject) => {
            timer = setTimeout(() => reject(new Error('声音设备未能启动，请重新点击试听并检查浏览器的声音权限。')), DEVICE_RESUME_TIMEOUT_MS);
          }),
          new Promise<never>((_resolve, reject) => {
            cancel = () => reject(new Error('这次试听已取消。'));
            pending.add(cancel);
          }),
        ]);
      } finally {
        if (timer !== undefined) clearTimeout(timer);
        if (cancel !== undefined) pending.delete(cancel);
      }
    }
    if (audio.state !== 'running') throw new Error('声音设备当前不可用，请重新点击试听。');
    return audio;
  }

  async function preview(input: PlayableNotePlan | SoundSequencePlan): Promise<PlaybackSession> {
    if (disposed) throw new Error('声音运行已关闭。');
    const preview = readPreview(input, { previous: active?.preview,
      // The playlist deliberately retains its clock through an empty song or
      // an empty phrase. Ordinary note/phrase auditions still reject silence.
      allowEmptySequence: input.kind === 'sequence' && input.transport !== undefined });
    cancelAudition();
    const request = ++requestSequence;
    cancelPendingResumes();
    let audio: AudioContext;
    try {
      audio = await ready();
    } catch (error) {
      if (!disposed && request === requestSequence) device('failed', message(error));
      throw error;
    }
    if (disposed || request !== requestSequence) throw new Error('这次试听已取消。');
    validateFrequency(preview, audio.sampleRate);
    let session: PlaybackSession = Object.freeze({
      id: `preview-${runtimeId}-${++sequence}`,
      status: 'playing',
      startedAtSeconds: audio.currentTime,
      durationSeconds: preview.durationSeconds,
    });
    const voice: ActiveVoice = {
      session, oscillators: [], samples: [], bufferReleases: [], gains: [], panners: [], remaining: 0,
      completion: null, retiring: new Set(), generation: 0, fadeGains: [], fingerprint: previewFingerprint(preview), preview, startTimes: new Map(),
      originSeconds: session.startedAtSeconds,
    };
    try {
      if (preview.sequence) voice.completion = audio.createConstantSource();
      const generation = voice.generation;
      const graph = allocateGraph(audio, preview, voice, () => {
        if (voice.generation !== generation) return;
        voice.remaining -= 1;
        if (voice.remaining === 0 && !preview.sequence) finish(voice, 'ended');
      }, mainMix ?? audio.destination);
      voice.fadeGains = graph.envelopes.map(envelope => envelope.node);
      // Allocate the graph before choosing a start, so large phrases do not consume
      // their first notes while nodes are still being built. The small lead also
      // leaves room to send the following automation commands to the audio device.
      const lead = preview.sequence ? 0.01 + graph.starts.length * 0.00004 + graph.envelopes.length * 0.00002 : 0.005;
      const start = audio.currentTime + lead;
      session = Object.freeze({ ...session, startedAtSeconds: start });
      voice.session = session;
      voice.originSeconds = start;
      scheduleGraph(graph, preview.normalization, start);
      if (audio.currentTime >= start) throw new Error('当前乐句的声音调度未能及时完成，请减少同时使用的声音后重试。');
      voice.remaining = voice.oscillators.length + voice.samples.length;
      if (active !== null) finish(active, 'stopped');
      if (disposed || request !== requestSequence) throw new Error('这次试听已取消。');
      active = voice;
      if (voice.completion !== null) {
        // A zero-valued audio source completes on the device clock even through trailing silence.
        voice.completion.offset.setValueAtTime(0, start);
        voice.completion.connect(audio.destination);
        const completion = voice.completion;
        voice.completion.onended = () => {
          if (voice.completion === completion && active === voice) finish(voice, 'ended');
        };
        voice.completion.start(start);
        voice.completion.stop(start + preview.durationSeconds + 0.001);
      }
      for (const scheduled of graph.starts) {
        const time = startGraphSource(scheduled, start);
        if (time !== undefined) voice.startTimes.set(scheduled.node, time);
      }
    } catch (error) {
      finish(voice, 'failed', message(error));
      throw new Error(`试听启动失败：${message(error)}`);
    }
    emit({ type: 'session', session });
    deviceChanged();
    return voice.session;
  }

  async function previewAudio(input: PcmAudio): Promise<PlaybackSession> {
    if (disposed) throw new Error('声音运行已关闭。');
    const pcm = readPcmAudio(input);
    cancelAudition();
    const request = ++requestSequence; cancelPendingResumes();
    let audio: AudioContext;
    try { audio = await ready(); }
    catch (error) { if (!disposed && request === requestSequence) device('failed', message(error)); throw error; }
    if (disposed || request !== requestSequence) throw new Error('这次试听已取消。');
    let source: AudioBufferSourceNode | undefined;
    let voice: ActiveVoice | undefined;
    try {
      const buffer = audio.createBuffer(pcm.channels.length, pcm.channels[0]!.length, pcm.sampleRate);
      pcm.channels.forEach((channel, index) => buffer.getChannelData(index).set(channel));
      source = audio.createBufferSource(); source.buffer = buffer;
      source.connect(mainMix ?? audio.destination);
      if (active) finish(active, 'stopped');
      // A subscriber may stop or replace playback during the previous stop event.
      if (disposed || request !== requestSequence) throw new Error('这次试听已取消。');
      const session: PlaybackSession = Object.freeze({ id: `preview-${runtimeId}-${++sequence}`, status: 'playing',
        startedAtSeconds: audio.currentTime + 0.005, durationSeconds: buffer.length / buffer.sampleRate });
      voice = { session, audioSource: source, oscillators: [], samples: [], bufferReleases: [], gains: [], panners: [], completion: null,
        remaining: 0, generation: 0, fadeGains: [], fingerprint: 'acquired-audio', startTimes: new Map(), retiring: new Set(), originSeconds: session.startedAtSeconds };
      const current = voice;
      source.onended = () => { if (active === current) finish(current, 'ended'); };
      active = voice; source.start(session.startedAtSeconds);
      emit({ type: 'session', session }); deviceChanged(); return voice.session;
    } catch (error) {
      if (voice) finish(voice, 'failed', message(error));
      else if (source) { source.onended = null; try { source.stop(); } catch { /* Not started. */ } source.disconnect(); }
      throw new Error(`采样试听启动失败：${message(error)}`);
    }
  }

  async function audition(input: PlayableNotePlan): Promise<void> {
    if (disposed) throw new Error('声音运行已关闭。');
    const preview = readPreview(input);
    if (preview.sequence) throw new Error('按键试音需要一个音符。');
    cancelAudition();
    const request = auditionSequence;
    // The short-note lane shares the device, but never changes the main session
    // or its pending start. Its completion is intentionally not a transport event.
    const audio = await ready(pendingAuditionResumes);
    if (disposed || request !== auditionSequence) throw new Error('这次试音已取消。');
    validateFrequency(preview, audio.sampleRate);
    const resources: GraphResources = { oscillators: [], samples: [], bufferReleases: [], gains: [], panners: [] };
    const voice: AuditionVoice = { resources, remaining: 0 };
    try {
      const graph = allocateGraph(audio, preview, resources, () => {
        if (auditionVoice !== voice) return;
        if (--voice.remaining === 0) releaseAudition(voice);
      });
      const start = audio.currentTime + 0.005;
      // Each lane is bounded to half scale during overlap. Duck the main lane
      // smoothly before this note starts, then restore it when this lane ends.
      ensureMainMix(audio);
      scheduleGraph(graph, preview.normalization * 0.5, start);
      if (audio.currentTime >= start || disposed || request !== auditionSequence) throw new Error('这次试音已取消，请重试。');
      voice.remaining = resources.oscillators.length + resources.samples.length;
      auditionVoice = voice;
      duckMain(true, start);
      for (const scheduled of graph.starts) startGraphSource(scheduled, start);
      deviceChanged();
    } catch (error) {
      releaseAudition(voice);
      throw new Error(`按键试音未能播放：${message(error)}`);
    }
  }

  function update(sessionId: string, input: PlayableNotePlan | SoundSequencePlan): PlaybackSession | undefined {
    const voice = active;
    const audio = context;
    if (disposed || voice === null || audio === null || voice.session.id !== sessionId || voice.session.status !== 'playing') return undefined;
    if (voice.audioSource) throw new Error('采样试听暂不支持乐句计划更新，请重新试听。');
    // An ended event can still be queued while the UI handles a pointer event.
    // Editing that stale session must not extend it into another playback.
    if (audio.currentTime >= voice.originSeconds + voice.session.durationSeconds! + 0.001) {
      finish(voice, 'ended');
      return undefined;
    }
    const preview = readPreview(input, { allowEmptySequence: true, previous: voice.preview, transportElapsed: elapsed(voice) });
    validateFrequency(preview, audio.sampleRate);
    const fingerprint = previewFingerprint(preview);
    if (voice.fingerprint === fingerprint && samePreviewSamples(voice.preview, preview)) {
      // The head may have changed speed during a long sustained tail without
      // changing today's audible graph. Retain that history for later edits.
      voice.preview = preview;
      return voice.session;
    }
    if (audio.state !== 'running') throw new Error('声音设备当前不可用，请重新点击试听。');
    const resources: GraphResources = { oscillators: [], samples: [], bufferReleases: [], gains: [], panners: [] };
    let completion: ConstantSourceNode | null = null;
    let retiringClock: ConstantSourceNode | null = null;
    const origin = voice.originSeconds;
    try {
      const position = Math.max(0, audio.currentTime - origin);
      const remaining = {
        ...preview,
        events: preview.events.filter(event => event.atSeconds + noteDuration(event.sound) > position),
      };
      const graph = allocateGraph(audio, remaining, resources, undefined, mainMix ?? audio.destination);
      if (audio.currentTime >= origin + voice.session.durationSeconds! + 0.001) {
        releaseGraph(resources);
        finish(voice, 'ended');
        return undefined;
      }
      completion = audio.createConstantSource();
      retiringClock = audio.createConstantSource();
      const cutover = Math.max(origin, audio.currentTime + 0.005 + graph.starts.length * 0.000002 + graph.envelopes.length * 0.000001);
      const fromSeconds = cutover - origin;
      scheduleGraph(graph, preview.normalization, origin, fromSeconds, LIVE_TRANSITION_SECONDS);
      const until = cutover + LIVE_TRANSITION_SECONDS + 0.002;
      completion.offset.setValueAtTime(0, cutover);
      completion.connect(audio.destination);
      completion.onended = () => {
        if (voice.completion === completion && active === voice) finish(voice, 'ended');
      };
      completion.start(cutover);
      completion.stop(Math.max(origin + preview.durationSeconds + 0.001, until));
      retiringClock.offset.setValueAtTime(0, cutover);
      retiringClock.connect(audio.destination);
      retiringClock.start(cutover);
      retiringClock.stop(until);
      const startTimes = new Map<AudioScheduledSourceNode, number>();
      for (const scheduled of graph.starts) {
        const time = startGraphSource(scheduled, origin, fromSeconds);
        if (time !== undefined) startTimes.set(scheduled.node, time);
      }
      if (audio.currentTime >= cutover) throw new Error('当前声音更新未能及时完成，请减少同时使用的声音后重试。');

      // All replacement nodes are ready before touching the audible graph. An
      // invalid plan or allocation failure therefore leaves the old music intact.
      const retired = {
        resources: { oscillators: [...voice.oscillators], samples: [...voice.samples], bufferReleases: [...voice.bufferReleases], gains: [...voice.gains], panners: [...voice.panners], outputBuses: [...(voice.outputBuses ?? [])], filters: [...(voice.filters ?? [])] },
        clock: retiringClock, until,
      };
      for (const gain of voice.fadeGains) {
        gain.gain.cancelAndHoldAtTime(cutover);
        gain.gain.linearRampToValueAtTime(0, cutover + LIVE_TRANSITION_SECONDS);
      }
      for (const oscillator of [...retired.resources.oscillators, ...retired.resources.samples]) {
        oscillator.onended = null;
        // Future notes removed by an edit must not start briefly during the fade.
        const stop = (voice.startTimes.get(oscillator) ?? cutover) >= cutover ? cutover : cutover + LIVE_TRANSITION_SECONDS + 0.001;
        try { oscillator.stop(stop); } catch { /* A note may have expired during graph preparation without starting. */ }
      }
      voice.retiring.add(retired);
      retiringClock.onended = () => {
        retiringClock!.onended = null;
        retiringClock!.disconnect();
        releaseGraph(retired.resources);
        voice.retiring.delete(retired);
      };
      if (voice.completion !== null) {
        voice.completion.onended = null;
        try { voice.completion.stop(); } catch { /* It may already have completed. */ }
        voice.completion.disconnect();
      }
      voice.oscillators.splice(0, voice.oscillators.length, ...resources.oscillators);
      voice.samples.splice(0, voice.samples.length, ...resources.samples);
      voice.bufferReleases.splice(0, voice.bufferReleases.length, ...resources.bufferReleases);
      voice.gains.splice(0, voice.gains.length, ...resources.gains);
      voice.panners.splice(0, voice.panners.length, ...resources.panners);
      voice.outputBuses = resources.outputBuses;
      voice.filters = resources.filters;
      voice.completion = completion;
      voice.generation += 1;
      voice.fadeGains = graph.envelopes.map(envelope => envelope.node);
      voice.fingerprint = fingerprint;
      voice.preview = preview;
      voice.startTimes = startTimes;
      voice.remaining = resources.oscillators.length + resources.samples.length;
      voice.session = Object.freeze({ ...voice.session, durationSeconds: preview.durationSeconds });
      emit({ type: 'session', session: voice.session });
      return voice.session;
    } catch (error) {
      for (const clock of [completion, retiringClock]) {
        if (clock === null) continue;
        clock.onended = null;
        try { clock.stop(); } catch { /* A failed graph may not have started. */ }
        clock.disconnect();
      }
      releaseGraph(resources);
      throw new Error(`声音更新失败：${message(error)}`);
    }
  }

  function pause(sessionId: string): PlaybackSession | undefined {
    const voice = active;
    if (!voice || voice.session.id !== sessionId || !voice.preview?.sequence) return undefined;
    if (voice.session.status === 'paused') return voice.session;
    if (voice.session.status !== 'playing') return undefined;
    if (elapsed(voice) >= voice.session.durationSeconds!) { finish(voice, 'ended'); return undefined; }
    voice.pausedElapsed = elapsed(voice);
    voice.generation++;
    clearVoice(voice);
    voice.session = Object.freeze({ ...voice.session, status: 'paused' });
    emit({ type: 'session', session: voice.session });
    return voice.session;
  }

  async function resume(sessionId: string, input?: SoundSequencePlan): Promise<PlaybackSession> {
    const voice = active;
    if (disposed || !voice || voice.session.id !== sessionId || voice.session.status !== 'paused' || !voice.preview) throw new Error('这次暂停的试听已经结束。');
    const request = ++requestSequence;
    const fromSeconds = voice.pausedElapsed!;
    // Validate before touching the retained paused session. Invalid edits leave it resumable.
    const preview = input ? readPreview(input, { allowEmptySequence: true, previous: voice.preview, transportElapsed: fromSeconds }) : voice.preview;
    cancelPendingResumes();
    const audio = await ready();
    if (disposed || request !== requestSequence || active !== voice || voice.session.status !== 'paused') throw new Error('这次试听已取消。');
    validateFrequency(preview, audio.sampleRate);
    const resources: GraphResources = { oscillators: [], samples: [], bufferReleases: [], gains: [], panners: [] };
    let completion: ConstantSourceNode | null = null;
    try {
      const remaining = { ...preview, events: preview.events.filter(event => event.atSeconds + noteDuration(event.sound) > fromSeconds) };
      const graph = allocateGraph(audio, remaining, resources, undefined, mainMix ?? audio.destination);
      completion = audio.createConstantSource();
      const start = audio.currentTime + .01 + graph.starts.length * .00004 + graph.envelopes.length * .00002;
      const origin = start - fromSeconds;
      scheduleGraph(graph, preview.normalization, origin, fromSeconds, LIVE_TRANSITION_SECONDS);
      completion.offset.setValueAtTime(0, start); completion.connect(audio.destination);
      completion.start(start); completion.stop(Math.max(start, origin + preview.durationSeconds) + .001);
      const clock = completion;
      completion.onended = () => { if (active === voice && voice.completion === clock) finish(voice, 'ended'); };
      const starts = new Map<AudioScheduledSourceNode, number>();
      for (const scheduled of graph.starts) { const time = startGraphSource(scheduled, origin, fromSeconds); if (time !== undefined) starts.set(scheduled.node, time); }
      if (audio.currentTime >= start) throw new Error('当前声音续播未能及时完成，请减少同时使用的声音后重试。');
      voice.oscillators.push(...resources.oscillators); voice.samples.push(...resources.samples);
      voice.bufferReleases.push(...resources.bufferReleases); voice.gains.push(...resources.gains); voice.panners.push(...resources.panners);
      voice.outputBuses = resources.outputBuses; voice.filters = resources.filters; voice.completion = completion;
      voice.fadeGains = graph.envelopes.map(item => item.node); voice.startTimes = starts;
      voice.preview = preview; voice.fingerprint = previewFingerprint(preview); voice.originSeconds = origin; voice.clockFloorSeconds = fromSeconds; voice.pausedElapsed = undefined;
      voice.session = Object.freeze({ ...voice.session, status: 'playing', durationSeconds: preview.durationSeconds });
      emit({ type: 'session', session: voice.session }); return voice.session;
    } catch (error) {
      if (completion) { completion.onended = null; try { completion.stop(); } catch { /* Allocation may have failed before start. */ } completion.disconnect(); }
      releaseGraph(resources);
      throw new Error(`声音续播失败：${message(error)}`);
    }
  }

  return {
    preview,
    previewAudio,
    audition,
    cancelAudition,
    update,
    pause,
    resume,
    async render(plan, options = {}) {
      if (disposed) return Promise.reject(new Error('声音运行已关闭。'));
      const controller = new AbortController();
      const abort = (): void => controller.abort();
      options.signal?.addEventListener('abort', abort, { once: true });
      if (options.signal?.aborted) controller.abort();
      renders.add(controller);
      try { return await renderOffline(plan, { ...options, signal: controller.signal }); }
      finally {
        options.signal?.removeEventListener('abort', abort);
        renders.delete(controller);
      }
    },
    position(sessionId) {
      if (active?.session.id === sessionId) return elapsed(active);
      return terminalPosition?.id === sessionId ? terminalPosition.seconds : undefined;
    },
    stop(sessionId) {
      if (active?.session.id === sessionId) finish(active, 'stopped');
    },
    stopAll() {
      cancelAudition();
      requestSequence += 1;
      cancelPendingResumes();
      if (active !== null) finish(active, 'stopped');
    },
    dispose() {
      if (disposePromise !== null) return disposePromise;
      disposed = true;
      cancelAudition();
      for (const render of renders) render.abort();
      requestSequence += 1;
      cancelPendingResumes();
      if (active !== null) finish(active, 'stopped');
      const audio = context;
      mainMix?.disconnect(); mainMix = null;
      if (audio !== null) audio.onstatechange = null;
      disposePromise = (async () => {
        try {
          if (audio !== null && audio.state !== 'closed') await audio.close();
          device('closed');
        } catch (error) {
          device('failed', `声音设备释放失败：${message(error)}`);
          throw error;
        } finally {
          listeners.clear();
        }
      })();
      return disposePromise;
    },
    subscribe(listener) {
      listeners.add(listener);
      send(listener, deviceState);
      if (active !== null) send(listener, { type: 'session', session: active.session });
      return () => { listeners.delete(listener); };
    },
  };
}
