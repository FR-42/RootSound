import type {
  BasicWaveform,
  PlaybackSession,
  PlaybackStatus,
  SoundPlan,
  SoundRuntimeEvent,
  SoundRuntimePort,
} from '../../contracts/sound.ts';

const WAVEFORMS: readonly BasicWaveform[] = ['sine', 'triangle', 'sawtooth', 'square'];
const MAX_SOURCES = 8;
const DEVICE_RESUME_TIMEOUT_MS = 3000;
let runtimeSequence = 0;

interface ActiveVoice {
  session: PlaybackSession;
  readonly oscillators: OscillatorNode[];
  readonly gains: GainNode[];
  remaining: number;
}

function object(value: unknown, label: string): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error(`${label}必须是有效对象。`);
  }
  return value as Record<string, unknown>;
}

function number(value: unknown, label: string, minimum: number, maximum: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < minimum || value > maximum) {
    throw new Error(`${label}必须是 ${minimum} 至 ${maximum} 之间的有限数值。`);
  }
  return value;
}

function fields(value: Record<string, unknown>, allowed: readonly string[], label: string): void {
  const unsupported = Object.keys(value).find(key => !allowed.includes(key));
  if (unsupported !== undefined) throw new Error(`${label}包含当前执行器不支持的内容：${unsupported}。`);
}

/** Adapter limits, not restrictions on future RootSound content formats. */
function readPlan(value: unknown): SoundPlan {
  const plan = object(value, '声音执行计划');
  if (plan.kind !== 'basic-synth' || plan.version !== 1) {
    throw new Error('当前声音运行仅支持第 1 版基础合成计划。');
  }
  fields(plan, ['kind', 'version', 'sources', 'envelope', 'note', 'level'], '声音执行计划');
  if (!Array.isArray(plan.sources) || plan.sources.length < 1 || plan.sources.length > MAX_SOURCES) {
    throw new Error(`当前试听需要 1 至 ${MAX_SOURCES} 个波形声源。`);
  }
  const sources = Array.from(plan.sources, (raw: unknown) => {
    const source = object(raw, '波形声源');
    fields(source, ['waveform', 'frequencyRatio', 'level'], '波形声源');
    if (!WAVEFORMS.includes(source.waveform as BasicWaveform)) {
      throw new Error('当前声音运行不支持这个波形。');
    }
    return {
      waveform: source.waveform as BasicWaveform,
      frequencyRatio: number(source.frequencyRatio, '频率倍率', 0.001, 64),
      level: number(source.level, '声源音量', 0, 1),
    };
  });
  if (sources.reduce((sum, source) => sum + source.level, 0) > 1 + 1e-12) {
    throw new Error('声源音量之和不能超过 1，请先降低音量。');
  }
  const envelope = object(plan.envelope, '音量变化');
  const note = object(plan.note, '试听音符');
  fields(envelope, ['attackSeconds', 'releaseSeconds'], '音量变化');
  fields(note, ['frequencyHz', 'holdSeconds', 'velocity'], '试听音符');
  const attackSeconds = number(envelope.attackSeconds, '起音时间（秒）', 0, 10);
  const releaseSeconds = number(envelope.releaseSeconds, '收音时间（秒）', 0, 10);
  const holdSeconds = number(note.holdSeconds, '持续时间（秒）', 0.01, 30);
  if (attackSeconds > holdSeconds) {
    throw new Error('当前试听的起音时间不能长于持续时间。');
  }
  return {
    kind: 'basic-synth',
    version: 1,
    sources,
    envelope: { attackSeconds, releaseSeconds },
    note: {
      frequencyHz: number(note.frequencyHz, '音符频率（Hz）', 1, 20000),
      holdSeconds,
      velocity: number(note.velocity, '音符力度', 0, 1),
    },
    level: number(plan.level, '试听总音量', 0, 1),
  };
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
  const events: SoundRuntimeEvent[] = [];
  let dispatching = false;
  let context: AudioContext | null = null;
  let active: ActiveVoice | null = null;
  let sequence = 0;
  let requestSequence = 0;
  let disposed = false;
  let disposePromise: Promise<void> | null = null;
  let deviceState: SoundRuntimeEvent = { type: 'device', status: 'idle' };

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

  function cancelPendingResumes(): void {
    for (const cancel of pendingResumes) cancel();
    pendingResumes.clear();
  }

  function finish(voice: ActiveVoice, status: Exclude<PlaybackStatus, 'playing'>, error?: string): void {
    if (voice.session.status !== 'playing') return;
    voice.session = Object.freeze({
      ...voice.session,
      status,
      endedAtSeconds: context?.currentTime ?? voice.session.startedAtSeconds,
      ...(error === undefined ? {} : { error }),
    });
    if (active === voice) active = null;
    for (const oscillator of voice.oscillators) {
      oscillator.onended = null;
      try { oscillator.stop(); } catch { /* The source may already have ended. */ }
      oscillator.disconnect();
    }
    for (const gain of voice.gains) gain.disconnect();
    emit({ type: 'session', session: voice.session });
  }

  function deviceChanged(): void {
    if (context === null || disposed) return;
    const state = String(context.state);
    if (state === 'running') {
      device('running');
    } else if (state === 'suspended' || state === 'interrupted') {
      const error = '声音设备已暂停，当前试听已结束；请重新点击试听。';
      if (active !== null) finish(active, 'failed', error);
      device('suspended', error);
    } else if (state === 'closed') {
      const error = '声音设备已关闭，请重新打开工作站。';
      if (active !== null) finish(active, 'failed', error);
      device('closed', error);
    } else {
      const error = `无法识别声音设备状态：${state}。`;
      if (active !== null) finish(active, 'failed', error);
      device('failed', error);
    }
  }

  async function ready(): Promise<AudioContext> {
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
            pendingResumes.add(cancel);
          }),
        ]);
      } finally {
        if (timer !== undefined) clearTimeout(timer);
        if (cancel !== undefined) pendingResumes.delete(cancel);
      }
    }
    if (audio.state !== 'running') throw new Error('声音设备当前不可用，请重新点击试听。');
    return audio;
  }

  async function preview(input: SoundPlan): Promise<PlaybackSession> {
    if (disposed) throw new Error('声音运行已关闭。');
    const plan = readPlan(input);
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
    const frequencyLimit = Math.min(20000, audio.sampleRate / 2);
    if (plan.sources.some(source => plan.note.frequencyHz * source.frequencyRatio > frequencyLimit)) {
      throw new Error(`声源频率超出了当前设备的试听范围（最高 ${frequencyLimit} Hz）。`);
    }
    if (active !== null) finish(active, 'stopped');
    const start = audio.currentTime + 0.005;
    const release = start + plan.note.holdSeconds;
    const end = release + plan.envelope.releaseSeconds;
    const session: PlaybackSession = Object.freeze({
      id: `preview-${runtimeId}-${++sequence}`,
      status: 'playing',
      startedAtSeconds: start,
    });
    const voice: ActiveVoice = { session, oscillators: [], gains: [], remaining: plan.sources.length };
    try {
      const envelope = audio.createGain();
      voice.gains.push(envelope);
      envelope.gain.setValueAtTime(0, start);
      const amplitude = plan.level * plan.note.velocity;
      if (plan.envelope.attackSeconds === 0) envelope.gain.setValueAtTime(amplitude, start);
      else envelope.gain.linearRampToValueAtTime(amplitude, start + plan.envelope.attackSeconds);
      envelope.gain.setValueAtTime(amplitude, release);
      if (plan.envelope.releaseSeconds === 0) envelope.gain.setValueAtTime(0, release);
      else envelope.gain.linearRampToValueAtTime(0, end);
      envelope.connect(audio.destination);
      for (const source of plan.sources) {
        const oscillator = audio.createOscillator();
        voice.oscillators.push(oscillator);
        const gain = audio.createGain();
        voice.gains.push(gain);
        oscillator.type = source.waveform;
        oscillator.frequency.setValueAtTime(plan.note.frequencyHz * source.frequencyRatio, start);
        gain.gain.setValueAtTime(source.level, start);
        oscillator.connect(gain);
        gain.connect(envelope);
        oscillator.onended = () => {
          voice.remaining -= 1;
          if (voice.remaining === 0) finish(voice, 'ended');
        };
      }
      active = voice;
      for (const oscillator of voice.oscillators) {
        oscillator.start(start);
        oscillator.stop(end + 0.001);
      }
    } catch (error) {
      finish(voice, 'failed', message(error));
      throw new Error(`试听启动失败：${message(error)}`);
    }
    emit({ type: 'session', session });
    deviceChanged();
    return voice.session;
  }

  return {
    preview,
    stop(sessionId) {
      if (active?.session.id === sessionId) finish(active, 'stopped');
    },
    stopAll() {
      requestSequence += 1;
      cancelPendingResumes();
      if (active !== null) finish(active, 'stopped');
    },
    dispose() {
      if (disposePromise !== null) return disposePromise;
      disposed = true;
      requestSequence += 1;
      cancelPendingResumes();
      if (active !== null) finish(active, 'stopped');
      const audio = context;
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
