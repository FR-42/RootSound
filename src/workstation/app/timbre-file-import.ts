import type { ContentRecord } from '../contracts/content.ts';
import { prepareImportedTimbre } from '../modules/timbre/public.ts';

/** Read one self-contained voice. The owning modules validate its complete graph on adoption. */
export function readTimbreImport(text: string, fileName: string): { timbre: ContentRecord; dependencies: ContentRecord[] } {
  if (!/\.(rssynth|rssound)$/iu.test(fileName)) throw new Error('请选择 .rssynth 或 .rssound 音色文件；.rstimbre 是早期采样音色格式，当前尚未接入音色库。');
  let value: unknown;
  try { value = JSON.parse(text.replace(/^\uFEFF/u, '')); } catch { throw new Error('音色文件损坏，尚未添加到音色库，原文件已保留。'); }
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const file = value as Record<string, unknown>;
    if (file.format === 'RootSoundTimbre') {
      if (file.version !== 1 || Object.keys(file).some(key => !['format', 'version', 'timbre', 'contents'].includes(key))
        || !file.timbre || typeof file.timbre !== 'object' || Array.isArray(file.timbre) || !Array.isArray(file.contents)) throw new Error('暂不支持这份便携音色文件。');
      return { timbre: file.timbre as ContentRecord, dependencies: file.contents as ContentRecord[] };
    }
    if (file.format === 'RootSoundSampleTimbre' || file.format === 'RootSound.Timbre') throw new Error('.rstimbre 是早期采样音色格式，包含采样及演奏设置；当前音色库请导入 .rssynth 或 .rssound。原文件已保留。');
  }
  return { timbre: prepareImportedTimbre(JSON.stringify(value)), dependencies: [] };
}
