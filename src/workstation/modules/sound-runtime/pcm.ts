import { MAX_PCM_AUDIO_BYTES, MAX_SAMPLE_DURATION_SECONDS, type PcmAudio } from '../../contracts/sound.ts';

/** Snapshot before awaiting the device; later caller edits cannot alter an audition. */
export function pcmShape(input: PcmAudio): { frames: number; bytes: number } {
  if (!input || typeof input !== 'object' || Object.keys(input).some(key => !['sampleRate', 'channels'].includes(key))
    || !Number.isInteger(input.sampleRate) || input.sampleRate < 8000 || input.sampleRate > 192000
    || !Array.isArray(input.channels) || input.channels.length < 1 || input.channels.length > 8)
    throw new Error('这份采样的采样率或声道不受当前试听支持。');
  const frames = input.channels[0]?.length ?? 0;
  if (!frames || frames * input.channels.length * 4 > MAX_PCM_AUDIO_BYTES || frames / input.sampleRate > MAX_SAMPLE_DURATION_SECONDS)
    throw new Error('这份采样超出了当前试听的时长或容量范围。');
  for (const channel of input.channels) {
    if (!(channel instanceof Float32Array) || channel.length !== frames)
      throw new Error('这份采样的声道数据不完整。');
  }
  return { frames, bytes: frames * input.channels.length * 4 };
}

export interface PcmSnapshot { audio: PcmAudio; bytes: number; peak: number; hash: string }

/** Complete owned snapshot; the fingerprint visits every Float32 bit, including tails. */
export function readPcmSnapshot(input: PcmAudio): PcmSnapshot {
  const { bytes } = pcmShape(input); const channels = input.channels.map(channel => new Float32Array(channel));
  let first = 2166136261; let second = 0x9e3779b9; let peak = 0;
  for (const channel of channels) {
    const words = new Uint32Array(channel.buffer, channel.byteOffset, channel.length);
    for (let index = 0; index < channel.length; index++) {
      const value = channel[index]!;
      if (!Number.isFinite(value)) throw new Error('这份采样包含无效的声音数据。');
      peak = Math.max(peak, Math.abs(value));
      first = Math.imul(first ^ words[index]!, 16777619) >>> 0;
      second = Math.imul(second ^ words[index]!, 0x85ebca6b) >>> 0;
    }
  }
  return { audio: { sampleRate: input.sampleRate, channels }, bytes, peak, hash: `${first.toString(16)}:${second.toString(16)}` };
}

/** Digest equality is never used as proof that two mutable inputs contain the same PCM. */
export function samePcm(left: PcmAudio, right: PcmAudio): boolean {
  pcmShape(left); pcmShape(right);
  if (left.sampleRate !== right.sampleRate || left.channels.length !== right.channels.length || left.channels[0]!.length !== right.channels[0]!.length) return false;
  let same = true;
  for (let index = 0; index < left.channels.length; index++) {
    const a = left.channels[index]!; const b = right.channels[index]!;
    for (let frame = 0; frame < a.length; frame++) {
      if (!Number.isFinite(a[frame]!) || !Number.isFinite(b[frame]!)) throw new Error('这份采样包含无效的声音数据。');
      if (a[frame] !== b[frame]) same = false;
    }
  }
  return same;
}

export function readPcmAudio(input: PcmAudio): PcmAudio { return readPcmSnapshot(input).audio; }
