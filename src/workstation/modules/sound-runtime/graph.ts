import { samePcm } from './pcm.ts';
import { envelopeValue } from './envelope.ts';
import { noteDuration, type SampleSourceSnapshot, type ScheduledPreview, type ScheduledSound } from './plan.ts';

export interface GraphResources {
  readonly oscillators: OscillatorNode[];
  readonly samples: AudioBufferSourceNode[];
  readonly bufferReleases: (() => void)[];
  readonly gains: GainNode[];
  readonly panners: StereoPannerNode[];
  /** A processed graph exits through these buses rather than its panners. */
  outputBuses?: GainNode[];
  filters?: BiquadFilterNode[];
}

type GraphStart =
  | { kind: 'oscillator'; node: OscillatorNode; gain: GainNode; atSeconds: number; duration: number; frequency: number; level: number; pitch?: Extract<ScheduledSound, { kind: 'basic-synth' }>['pitch'] }
  | { kind: 'noise'; node: AudioBufferSourceNode; gain: GainNode; atSeconds: number; duration: number; level: number }
  | { kind: 'sample'; node: AudioBufferSourceNode; atSeconds: number; duration: number; plan: Extract<ScheduledSound, { kind: 'sample' }> };
export interface SoundGraph {
  readonly envelopes: { atSeconds: number; plan: ScheduledSound; node: GainNode }[];
  readonly starts: GraphStart[];
  readonly pans: { atSeconds: number; node: StereoPannerNode; pan: number }[];
  readonly output?: { node: GainNode; preview: ScheduledPreview };
}

type BufferEntry = { audio: SampleSourceSnapshot['audio']; buffer: AudioBuffer; references: number };
const bufferPools = new WeakMap<BaseAudioContext, Map<string, BufferEntry[]>>();
const noisePools = new WeakMap<BaseAudioContext, AudioBuffer>();
function noiseBuffer(audio: BaseAudioContext): AudioBuffer {
  let buffer = noisePools.get(audio); if (buffer) return buffer;
  buffer = audio.createBuffer(1, audio.sampleRate, audio.sampleRate);
  const channel = buffer.getChannelData(0); let seed = 0x726f6f74;
  for (let i = 0; i < channel.length; i++) { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; channel[i] = seed / 0x80000000 - 1; }
  noisePools.set(audio, buffer); return buffer;
}

function leaseBuffer(audio: BaseAudioContext, source: SampleSourceSnapshot): { buffer: AudioBuffer; release(): void } {
  // Material identities are part of plan semantics, not distinct copies of an
  // identical decoded waveform. A shared PCM must not multiply device memory
  // just because several imported materials refer to it under different ids.
  const key = JSON.stringify([source.audio.sampleRate, source.audio.channels.length, source.audio.channels[0]!.length, source.hash]);
  let pool = bufferPools.get(audio); if (!pool) { pool = new Map(); bufferPools.set(audio, pool); }
  let bucket = pool.get(key); if (!bucket) { bucket = []; pool.set(key, bucket); }
  let entry = bucket.find(candidate => candidate.audio === source.audio || samePcm(candidate.audio, source.audio));
  if (!entry) {
    try {
      const buffer = audio.createBuffer(source.audio.channels.length, source.audio.channels[0]!.length, source.audio.sampleRate);
      source.audio.channels.forEach((channel, index) => buffer.getChannelData(index).set(channel));
      entry = { audio: source.audio, buffer, references: 0 }; bucket.push(entry);
    } catch (error) { if (!bucket.length) pool.delete(key); throw error; }
  }
  const leased = entry; leased.references++; let released = false;
  return { buffer: leased.buffer, release() {
    if (released) return; released = true; leased.references--;
    if (leased.references !== 0) return;
    const entries = pool!.get(key); if (!entries) return;
    const index = entries.indexOf(leased); if (index >= 0) entries.splice(index, 1);
    if (!entries.length) pool!.delete(key);
  } };
}

/** One graph builder and one envelope scheduler serve live and offline clocks. */
export function allocateGraph(audio: BaseAudioContext, preview: ScheduledPreview, resources: GraphResources, ended?: () => void,
  destination: AudioNode = audio.destination): SoundGraph {
  let output: SoundGraph['output'];
  if (preview.output) {
    const node = audio.createGain(); resources.gains.push(node); (resources.outputBuses ??= []).push(node);
    node.connect(destination); destination = node; output = { node, preview };
  }
  const graph: SoundGraph = { envelopes: [], starts: [], pans: [], ...(output ? { output } : {}) };
  const buffers = new Map<SampleSourceSnapshot, AudioBuffer>();
  for (const event of preview.events) {
    const plan = event.sound;
    const envelope = audio.createGain();
    resources.gains.push(envelope);
    graph.envelopes.push({ atSeconds: event.atSeconds, plan, node: envelope });
    // Use the same equal-power path at center and on either side. Bypassing the
    // panner only for zero would make its level jump as a slider crosses center.
    const panner = audio.createStereoPanner();
    resources.panners.push(panner);
    graph.pans.push({ atSeconds: event.atSeconds, node: panner, pan: event.pan ?? 0 });
    envelope.connect(panner);
    panner.connect(destination);
    if (plan.kind === 'sample') {
      let buffer = buffers.get(plan.source);
      if (!buffer) { const lease = leaseBuffer(audio, plan.source); resources.bufferReleases.push(lease.release); buffer = lease.buffer; buffers.set(plan.source, buffer); }
      const source = audio.createBufferSource(); resources.samples.push(source); source.buffer = buffer; source.loop = !!plan.loop;
      if (plan.loop) { source.loopStart = plan.loop.startSeconds; source.loopEnd = plan.loop.endSeconds; }
      source.connect(envelope); if (ended) source.onended = ended;
      graph.starts.push({ kind: 'sample', node: source, atSeconds: event.atSeconds, duration: noteDuration(plan), plan });
      continue;
    }
    let input: AudioNode = envelope;
    if (plan.filter) {
      const filter = audio.createBiquadFilter(); (resources.filters ??= []).push(filter);
      filter.type = plan.filter.type; filter.frequency.value = Math.min(plan.filter.frequencyHz, audio.sampleRate * .49); filter.Q.value = plan.filter.resonance;
      const compensation = audio.createGain(); resources.gains.push(compensation);
      // Resonant filters can amplify a narrow band. Preserve the conservative
      // amplitude budget used for all voices and for live/offline peak control.
      compensation.gain.value = 1 / (1 + plan.filter.resonance * 2);
      filter.connect(compensation); compensation.connect(envelope); input = filter;
    }
    for (const source of plan.sources) {
      if (source.waveform === 'noise') {
        const noise = audio.createBufferSource(); resources.samples.push(noise); noise.buffer = noiseBuffer(audio); noise.loop = true;
        const gain = audio.createGain(); resources.gains.push(gain); noise.connect(gain); gain.connect(input);
        if (ended) noise.onended = ended;
        graph.starts.push({ kind: 'noise', node: noise, gain, atSeconds: event.atSeconds, duration: noteDuration(plan), level: source.level });
        continue;
      }
      const oscillator = audio.createOscillator();
      resources.oscillators.push(oscillator);
      const gain = audio.createGain();
      resources.gains.push(gain);
      oscillator.type = source.waveform;
      oscillator.connect(gain);
      gain.connect(input);
      if (ended) oscillator.onended = ended;
      graph.starts.push({
        kind: 'oscillator', node: oscillator, gain, atSeconds: event.atSeconds,
        duration: plan.note.holdSeconds + plan.envelope.releaseSeconds,
        frequency: plan.note.frequencyHz * source.frequencyRatio, level: source.level, ...(plan.pitch ? { pitch: plan.pitch } : {}),
      });
    }
  }
  return graph;
}

export function scheduleGraph(graph: SoundGraph, normalization: number, start: number, fromSeconds = 0, transitionSeconds = 0): void {
  if (graph.output) scheduleOutput(graph.output.node.gain, graph.output.preview, start, fromSeconds);
  for (const scheduled of graph.envelopes) {
    const plan = scheduled.plan;
    const envelope = scheduled.node;
    const noteStart = start + scheduled.atSeconds;
    const release = noteStart + plan.note.holdSeconds;
    const end = release + plan.envelope.releaseSeconds;
    const amplitude = plan.level * plan.note.velocity * normalization;
    if (plan.kind === 'sample' && plan.envelopeBaked) {
      const age = Math.max(0, fromSeconds - scheduled.atSeconds); if (age >= plan.note.holdSeconds + plan.envelope.releaseSeconds) continue;
      const time = noteStart + age; const joined = Math.min(end, time + transitionSeconds);
      envelope.gain.setValueAtTime(transitionSeconds > 0 ? 0 : amplitude, time);
      if (joined > time) envelope.gain.linearRampToValueAtTime(amplitude, joined);
      envelope.gain.setValueAtTime(0, end);
      continue;
    }
    if (plan.envelope.decaySeconds !== undefined) {
      const age = Math.max(0, fromSeconds - scheduled.atSeconds); if (age >= plan.note.holdSeconds + plan.envelope.releaseSeconds) continue;
      const time = noteStart + age; const joined = Math.min(plan.note.holdSeconds + plan.envelope.releaseSeconds, age + transitionSeconds);
      const value = (at: number) => amplitude * envelopeValue(plan.envelope, plan.note.holdSeconds, at);
      envelope.gain.setValueAtTime(transitionSeconds > 0 ? 0 : value(age), time);
      if (joined > age) envelope.gain.linearRampToValueAtTime(value(joined), noteStart + joined);
      const points = [plan.envelope.attackSeconds, plan.envelope.attackSeconds + plan.envelope.decaySeconds, plan.note.holdSeconds, plan.note.holdSeconds + plan.envelope.releaseSeconds];
      for (const point of [...new Set(points)].filter(point => point > joined && point <= plan.note.holdSeconds + plan.envelope.releaseSeconds).sort((a, b) => a - b)) envelope.gain.linearRampToValueAtTime(value(point), noteStart + point);
      continue;
    }
    // A short note releases from the partial attack level it has actually reached.
    const attackDuration = Math.min(plan.envelope.attackSeconds, plan.note.holdSeconds);
    const releaseAmplitude = plan.envelope.attackSeconds === 0 ? amplitude : amplitude * attackDuration / plan.envelope.attackSeconds;
    if (fromSeconds > scheduled.atSeconds) {
      const resume = start + fromSeconds;
      if (end <= resume) continue;
      const valueAt = (time: number): number => {
        if (time >= end) return 0;
        if (time >= release) return plan.envelope.releaseSeconds === 0 ? 0 : releaseAmplitude * (end - time) / plan.envelope.releaseSeconds;
        if (plan.envelope.attackSeconds > 0 && time < noteStart + attackDuration) return amplitude * (time - noteStart) / plan.envelope.attackSeconds;
        return releaseAmplitude;
      };
      // Rejoin the envelope at the original note age, rather than attacking it
      // again. A short fade masks the oscillator phase change during replacement.
      envelope.gain.setValueAtTime(transitionSeconds > 0 ? 0 : valueAt(resume), resume);
      const joined = Math.min(end, resume + transitionSeconds);
      if (joined > resume) envelope.gain.linearRampToValueAtTime(valueAt(joined), joined);
      const attackEnd = noteStart + attackDuration;
      if (attackEnd > joined) envelope.gain.linearRampToValueAtTime(releaseAmplitude, attackEnd);
      if (release > joined) envelope.gain.setValueAtTime(releaseAmplitude, release);
      if (end > joined) {
        if (plan.envelope.releaseSeconds === 0) envelope.gain.setValueAtTime(0, release);
        else envelope.gain.linearRampToValueAtTime(0, end);
      }
      continue;
    }
    envelope.gain.setValueAtTime(0, noteStart);
    if (attackDuration === 0) envelope.gain.setValueAtTime(amplitude, noteStart);
    else envelope.gain.linearRampToValueAtTime(releaseAmplitude, noteStart + attackDuration);
    envelope.gain.setValueAtTime(releaseAmplitude, release);
    if (plan.envelope.releaseSeconds === 0) envelope.gain.setValueAtTime(0, release);
    else envelope.gain.linearRampToValueAtTime(0, end);
  }
  for (const scheduled of graph.starts) {
    const time = start + Math.max(scheduled.atSeconds, fromSeconds);
    if (scheduled.kind === 'oscillator') {
      const pitch = scheduled.pitch; const age = Math.max(0, fromSeconds - scheduled.atSeconds);
      const initial = pitch ? scheduled.frequency * 2 ** (pitch.semitones / 12) : scheduled.frequency;
      const fraction = pitch ? Math.min(1, age / pitch.seconds) : 1;
      scheduled.node.frequency.setValueAtTime(initial + (scheduled.frequency - initial) * fraction, time);
      if (pitch && age < pitch.seconds) scheduled.node.frequency.linearRampToValueAtTime(scheduled.frequency, start + scheduled.atSeconds + pitch.seconds);
      scheduled.gain.gain.setValueAtTime(scheduled.level, time);
    } else if (scheduled.kind === 'sample') scheduled.node.playbackRate.setValueAtTime(scheduled.plan.playbackRate, time);
    else scheduled.gain.gain.setValueAtTime(scheduled.level, time);
  }
  for (const scheduled of graph.pans) scheduled.node.pan.setValueAtTime(scheduled.pan, start + Math.max(scheduled.atSeconds, fromSeconds));
}

/** Piecewise linear fades meet at a reduced peak if they overlap on a short song. */
function scheduleOutput(param: AudioParam, preview: ScheduledPreview, start: number, fromSeconds: number): void {
  const settings = preview.output!; const duration = preview.durationSeconds;
  const fadeIn = Math.min(duration, settings.fadeInSeconds); const fadeOut = Math.min(duration, settings.fadeOutSeconds);
  const valueAt = (time: number): number => settings.level * Math.min(1, fadeIn > 0 ? time / fadeIn : 1,
    fadeOut > 0 ? (duration - time) / fadeOut : 1);
  // A single peak gives an exact linear envelope even when fade intervals overlap.
  const overlap = fadeIn + fadeOut > duration;
  const peakAt = overlap ? duration * fadeIn / (fadeIn + fadeOut) : fadeIn;
  const points = overlap ? [peakAt, duration] : [fadeIn, duration - fadeOut, duration];
  const current = Math.min(duration, Math.max(0, fromSeconds));
  param.setValueAtTime(Math.max(0, valueAt(current)), start + current);
  for (const time of [...new Set(points)].sort((a, b) => a - b)) {
    if (time > current) param.linearRampToValueAtTime(Math.max(0, valueAt(time)), start + time);
  }
}

/** Start at the note's present age; a one-shot sample never restarts at its head. */
export function startGraphSource(scheduled: GraphStart, origin: number, fromSeconds = 0): number | undefined {
  const age = Math.max(0, fromSeconds - scheduled.atSeconds);
  if (age >= scheduled.duration) { scheduled.node.onended = null; scheduled.node.disconnect(); return undefined; }
  const time = origin + Math.max(scheduled.atSeconds, fromSeconds);
  if (scheduled.kind === 'sample') {
    let offset = scheduled.plan.startSeconds + age * scheduled.plan.playbackRate;
    const loop = scheduled.plan.loop;
    if (loop) {
      if (offset >= loop.endSeconds) offset = loop.startSeconds + (offset - loop.startSeconds) % (loop.endSeconds - loop.startSeconds);
      scheduled.node.start(time, offset); scheduled.node.stop(origin + scheduled.atSeconds + scheduled.duration + .001); return time;
    }
    const remaining = scheduled.plan.endSeconds - offset;
    if (remaining <= 0) { scheduled.node.onended = null; scheduled.node.disconnect(); return undefined; }
    scheduled.node.start(time, offset, remaining);
  } else if (scheduled.kind === 'noise') scheduled.node.start(time, age % 1);
  else scheduled.node.start(time);
  scheduled.node.stop(origin + scheduled.atSeconds + scheduled.duration + 0.001);
  return time;
}

export function releaseGraph(resources: GraphResources): void {
  for (const oscillator of resources.oscillators) {
    oscillator.onended = null;
    try { oscillator.stop(); } catch { /* It may already have ended. */ }
    oscillator.disconnect();
  }
  for (const sample of resources.samples) {
    sample.onended = null; try { sample.stop(); } catch { /* A failed allocation or an exhausted source may not be active. */ } sample.disconnect();
  }
  for (const gain of resources.gains) gain.disconnect();
  for (const panner of resources.panners) panner.disconnect();
  for (const filter of resources.filters ?? []) filter.disconnect();
  for (const release of resources.bufferReleases.splice(0)) release();
}
