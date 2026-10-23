import { MAX_AUDIO_FILE_BYTES } from '../../contracts/files.ts';

export function checkAudioBytes(bytes: Uint8Array): void {
  if (!(bytes instanceof Uint8Array) || bytes.byteLength < 50) throw new Error('音频内容无效，尚未保存文件。');
  if (bytes.byteLength > MAX_AUDIO_FILE_BYTES) throw new Error('音频超出当前文件大小范围，尚未保存。');
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const label = (at: number, text: string): boolean => [...text].every((character, index) => bytes[at + index] === character.charCodeAt(0));
  if (!label(0, 'RIFF') || !label(8, 'WAVE') || !label(12, 'fmt ') || !label(36, 'data')
    || view.getUint32(4, true) + 8 !== bytes.byteLength || view.getUint32(16, true) !== 16
    || view.getUint16(20, true) !== 1 || view.getUint16(22, true) !== 2
    || view.getUint16(32, true) !== 6 || view.getUint16(34, true) !== 24
    || ![44100, 48000, 96000].includes(view.getUint32(24, true))
    || view.getUint32(28, true) !== view.getUint32(24, true) * 6
    || view.getUint32(40, true) !== bytes.byteLength - 44 || (bytes.byteLength - 44) % 6 !== 0) {
    throw new Error('音频不是当前支持的双声道 24 位 WAV 文件，尚未保存。');
  }
}

export function audioFileName(suggestedName: string): string {
  const clean = suggestedName.replace(/[\\/:*?"<>|\u0000-\u001f]/gu, '').trim().replace(/[. ]+$/u, '');
  const stem = clean.replace(/\.wav$/iu, '').slice(0, 120).replace(/[. ]+$/u, '') || '我的音乐';
  return `${stem}.wav`;
}

export function audioBase64(bytes: Uint8Array): string {
  const chunks: string[] = [];
  for (let offset = 0; offset < bytes.length; offset += 32768) {
    chunks.push(String.fromCharCode(...bytes.subarray(offset, offset + 32768)));
  }
  return btoa(chunks.join(''));
}
