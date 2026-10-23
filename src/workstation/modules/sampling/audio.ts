import { MAX_SAMPLE_FILE_BYTES } from '../../contracts/files.ts';
import { MAX_PCM_AUDIO_BYTES, MAX_SAMPLE_DURATION_SECONDS, type PcmAudio } from '../../contracts/sound.ts';

function fail(message: string): never { throw new Error(message); }

export function validatePcm(audio: PcmAudio): PcmAudio {
  if (!audio || !Number.isInteger(audio.sampleRate) || audio.sampleRate < 8000 || audio.sampleRate > 192000
    || !Array.isArray(audio.channels) || audio.channels.length < 1 || audio.channels.length > 8) fail('采样需要 8–192 kHz、1–8 声道的有效 PCM 音频。');
  const frames = audio.channels[0]?.length ?? 0;
  if (!frames || frames * audio.channels.length * 4 > MAX_PCM_AUDIO_BYTES || frames / audio.sampleRate > MAX_SAMPLE_DURATION_SECONDS) fail('采样为空，或超出当前 120 秒、64 MiB 解码音频范围。');
  for (const channel of audio.channels) {
    if (!(channel instanceof Float32Array) || channel.length !== frames) fail('采样的各声道需要相同长度的 Float32 音频。');
    for (const value of channel) if (!Number.isFinite(value)) fail('采样包含无效的非有限音频值。');
  }
  return audio;
}
export function copyPcm(audio: PcmAudio): PcmAudio {
  validatePcm(audio); return { sampleRate: audio.sampleRate, channels: audio.channels.map(channel => new Float32Array(channel)) };
}
export function checkSampleBytes(bytes: Uint8Array): void {
  if (!(bytes instanceof Uint8Array) || !bytes.byteLength || bytes.byteLength > MAX_SAMPLE_FILE_BYTES) fail('音频文件为空，或超出当前 16 MiB 的大小范围。');
}
export function encodeBase64(bytes: Uint8Array): string {
  checkSampleBytes(bytes); const chunks: string[] = [];
  // Every nonfinal chunk is divisible by three, so concatenated base64 has no inner padding.
  for (let offset = 0; offset < bytes.length; offset += 32766) chunks.push(btoa(String.fromCharCode(...bytes.subarray(offset, offset + 32766))));
  return chunks.join('');
}
export function decodeBase64(value: string, expectedLength: number): Uint8Array {
  if (typeof value !== 'string' || !Number.isSafeInteger(expectedLength) || expectedLength < 1 || expectedLength > MAX_SAMPLE_FILE_BYTES
    || value.length !== Math.ceil(expectedLength / 3) * 4) fail('采样的原文件数据长度无效。');
  let decoded: string;
  try { decoded = atob(value); } catch { return fail('采样的原文件数据已损坏。'); }
  if (decoded.length !== expectedLength) fail('采样的原文件数据与长度不一致。');
  const bytes = Uint8Array.from(decoded, character => character.charCodeAt(0));
  // Reject noncanonical encodings and ignored whitespace, preserving exact file identity.
  if (encodeBase64(bytes) !== value) fail('采样的原文件编码无效。');
  return bytes;
}
export function waveform(audio: PcmAudio, requested = 128): number[] {
  validatePcm(audio); if (!Number.isFinite(requested)) fail('波形显示长度无效。'); const frames = audio.channels[0]!.length;
  const count = Math.min(frames, Math.max(1, Math.min(1024, Math.floor(requested))));
  const result: number[] = [];
  for (let bucket = 0; bucket < count; bucket++) {
    const first = Math.floor(bucket * frames / count); const end = Math.floor((bucket + 1) * frames / count); let peak = 0;
    for (const channel of audio.channels) for (let frame = first; frame < end; frame++) peak = Math.max(peak, Math.abs(channel[frame]!));
    result.push(Math.min(1, peak));
  }
  return result;
}
function tag(view: DataView, offset: number): string { return String.fromCharCode(...new Uint8Array(view.buffer, view.byteOffset + offset, 4)); }
function writeTag(view: DataView, offset: number, text: string): void { for (let index = 0; index < 4; index++) view.setUint8(offset + index, text.charCodeAt(index)); }

/** Recording keeps every captured Float32 value; no integer quantization or lossy codec. */
export function encodeFloatWav(audio: PcmAudio): Uint8Array {
  validatePcm(audio); const frames = audio.channels[0]!.length; const channels = audio.channels.length;
  const dataBytes = frames * channels * 4;
  if (58 + dataBytes > MAX_SAMPLE_FILE_BYTES) fail('录音超出当前 16 MiB 的原始音频文件范围。');
  const bytes = new Uint8Array(58 + dataBytes);
  const view = new DataView(bytes.buffer);
  writeTag(view, 0, 'RIFF'); view.setUint32(4, bytes.length - 8, true); writeTag(view, 8, 'WAVE');
  writeTag(view, 12, 'fmt '); view.setUint32(16, 18, true); view.setUint16(20, 3, true); view.setUint16(22, channels, true);
  view.setUint32(24, audio.sampleRate, true); view.setUint32(28, audio.sampleRate * channels * 4, true);
  view.setUint16(32, channels * 4, true); view.setUint16(34, 32, true); view.setUint16(36, 0, true);
  writeTag(view, 38, 'fact'); view.setUint32(42, 4, true); view.setUint32(46, frames, true);
  writeTag(view, 50, 'data'); view.setUint32(54, dataBytes, true);
  for (let frame = 0; frame < frames; frame++) for (let channel = 0; channel < channels; channel++) view.setFloat32(58 + (frame * channels + channel) * 4, audio.channels[channel]![frame]!, true);
  return bytes;
}

/** Handles uncompressed RIFF WAVE on its native clock; other codecs return undefined for a decoder fallback. */
export function decodePcmWav(bytes: Uint8Array): PcmAudio | undefined {
  checkSampleBytes(bytes); if (bytes.byteLength < 12) return undefined;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (tag(view, 0) !== 'RIFF' || tag(view, 8) !== 'WAVE') return undefined;
  const end = view.getUint32(4, true) + 8;
  if (end < 12 || end > bytes.length) fail('WAV 文件长度无效或尚未完整写入。');
  let format: { encoding: number; channels: number; rate: number; bits: number; align: number } | undefined;
  const data: { offset: number; length: number }[] = [];
  let chunkOffset = 12;
  for (; chunkOffset + 8 <= end;) {
    const offset = chunkOffset;
    const name = tag(view, offset); const length = view.getUint32(offset + 4, true); const start = offset + 8;
    if (start + length > end) fail('WAV 文件中的音频区块不完整。');
    if (name === 'fmt ') {
      if (format || length < 16) fail('WAV 文件的格式区块无效。');
      let encoding = view.getUint16(start, true); const channels = view.getUint16(start + 2, true); const rate = view.getUint32(start + 4, true);
      const bits = view.getUint16(start + 14, true); const align = view.getUint16(start + 12, true);
      if (encoding === 0xfffe) {
        if (length < 40 || view.getUint16(start + 16, true) < 22) fail('WAV 扩展格式区块不完整。');
        const guidTail = [0, 0, 0, 0, 16, 0, 128, 0, 0, 170, 0, 56, 155, 113];
        if (!guidTail.every((value, index) => view.getUint8(start + 26 + index) === value)) return undefined;
        encoding = view.getUint16(start + 24, true);
      }
      if (![1, 3].includes(encoding)) return undefined;
      if (!Number.isInteger(rate) || rate < 8000 || rate > 192000 || channels < 1 || channels > 8
        || !(encoding === 1 ? [8, 16, 24, 32] : [32, 64]).includes(bits)
        || align !== channels * bits / 8 || view.getUint32(start + 8, true) !== rate * align) fail('WAV 的采样率、声道或 PCM 格式无效。');
      format = { encoding, channels, rate, bits, align };
    } else if (name === 'data') data.push({ offset: start, length });
    const next = start + length + (length % 2);
    if (next > end && start + length !== end) fail('WAV 的区块对齐无效。');
    chunkOffset = next;
  }
  if (chunkOffset < end) fail('WAV 文件末尾有不完整的音频区块。');
  if (!format || !data.length) fail('WAV 文件缺少 PCM 格式或音频数据。');
  const pcmFormat = format; const total = data.reduce((sum, item) => sum + item.length, 0);
  if (data.some(item => item.length % pcmFormat.align !== 0) || total === 0) fail('WAV 的音频帧不完整或为空。');
  const frames = total / pcmFormat.align;
  if (frames * pcmFormat.channels * 4 > MAX_PCM_AUDIO_BYTES || frames / pcmFormat.rate > MAX_SAMPLE_DURATION_SECONDS) fail('WAV 超出当前 120 秒、64 MiB 解码音频范围。');
  const channels = Array.from({ length: pcmFormat.channels }, () => new Float32Array(frames)); let frame = 0;
  for (const item of data) for (let offset = item.offset; offset < item.offset + item.length; offset += pcmFormat.align) {
    for (let channel = 0; channel < channels.length; channel++) {
      const at = offset + channel * pcmFormat.bits / 8; let value: number;
      if (pcmFormat.encoding === 3) value = pcmFormat.bits === 32 ? view.getFloat32(at, true) : view.getFloat64(at, true);
      else if (pcmFormat.bits === 8) value = (view.getUint8(at) - 128) / 128;
      else if (pcmFormat.bits === 16) value = view.getInt16(at, true) / 32768;
      else if (pcmFormat.bits === 24) { const packed = view.getUint8(at) | view.getUint8(at + 1) << 8 | view.getUint8(at + 2) << 16; value = (packed & 0x800000 ? packed - 0x1000000 : packed) / 8388608; }
      else value = view.getInt32(at, true) / 2147483648;
      channels[channel]![frame] = value;
    }
    frame++;
  }
  return validatePcm({ sampleRate: pcmFormat.rate, channels });
}
