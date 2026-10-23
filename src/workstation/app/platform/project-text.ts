import { MAX_PROJECT_FILE_BYTES, PROJECT_FILE_EXTENSION } from '../../contracts/files.ts';

export function decodeProjectBytes(bytes: ArrayBuffer): string {
  if (bytes.byteLength > MAX_PROJECT_FILE_BYTES) throw new Error('工程文件超出当前 32 MiB 的大小范围。');
  let text: string;
  try { text = new TextDecoder('utf-8', { fatal: true }).decode(bytes); }
  catch { throw new Error('工程文件不是有效的 UTF-8 文本，原文件已保留。'); }
  return projectText(text);
}

/** A file boundary check only: the materials module validates musical meaning. */
export function projectText(value: string): string {
  if (typeof value !== 'string') throw new Error('工程文件必须是有效的 UTF-8 文本。');
  if (value.length > MAX_PROJECT_FILE_BYTES) throw new Error('工程文件超出当前 32 MiB 的大小范围。');
  // TextEncoder otherwise silently replaces malformed UTF-16 with a different
  // character, which must never masquerade as faithful project transfer.
  for (let index = 0; index < value.length; index++) {
    const code = value.charCodeAt(index);
    if (code >= 0xd800 && code <= 0xdbff) {
      const next = value.charCodeAt(++index);
      if (!(next >= 0xdc00 && next <= 0xdfff)) throw new Error('工程文件含有无效的 Unicode 文本，原文件已保留。');
    } else if (code >= 0xdc00 && code <= 0xdfff) throw new Error('工程文件含有无效的 Unicode 文本，原文件已保留。');
  }
  if (new TextEncoder().encode(value).byteLength > MAX_PROJECT_FILE_BYTES) throw new Error('工程文件超出当前 32 MiB 的大小范围。');
  const text = value.startsWith('\ufeff') ? value.slice(1) : value;
  let parsed: unknown;
  try { parsed = JSON.parse(text); } catch { throw new Error('工程文件不是完整的 JSON 文本，原文件已保留。'); }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('这不是可识别的 RootSound 工程文件。');
  const envelope = parsed as Record<string, unknown>;
  if (envelope.format !== 'RootSoundProject' || envelope.version !== 1 && envelope.version !== 2) throw new Error('暂不支持这个工程文件的格式或版本，原文件已保留。');
  return text;
}

export function projectFileName(suggestedName: string): string {
  const clean = suggestedName.replace(/[\\/:*?"<>|\u0000-\u001f]/gu, '').trim().replace(/[. ]+$/u, '');
  const stem = [...clean.replace(/\.rsproject$/iu, '')].slice(0, 120).join('').replace(/[. ]+$/u, '') || '我的音乐';
  return `${stem}${PROJECT_FILE_EXTENSION}`;
}
