import { MAX_TIMBRE_IMPORT_TEXT_BYTES, type TimbreFilesPort } from '../../contracts/timbre-files.ts';

export interface NativeTimbreFilesBridge { Open(): Promise<unknown>; Sync(songDraftId: string): Promise<unknown> }
function result(raw: unknown): Record<string, unknown> {
  let value: unknown;
  try { value = typeof raw === 'string' ? JSON.parse(raw) : undefined; } catch { /* Report one transport failure below. */ }
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('音色文件服务返回了无法识别的结果。');
  const item = value as Record<string, unknown>;
  if (item.status === 'error') throw new Error(typeof item.message === 'string' ? item.message : '音色文件未能读取，原文件已保留。');
  return item;
}
function checked(name: unknown, text: unknown): { status: 'opened'; name: string; text: string } {
  if (typeof name !== 'string' || !name.trim() || typeof text !== 'string' || !text.trim()
    || new TextEncoder().encode(text).length > MAX_TIMBRE_IMPORT_TEXT_BYTES) throw new Error('音色文件为空、过大或传输不完整，原文件已保留。');
  return { status: 'opened', name, text };
}
export function createDesktopTimbreFiles(bridge?: NativeTimbreFilesBridge): TimbreFilesPort {
  let opening = false;
  return {
    async open() {
      if (!bridge) throw new Error('请关闭旧窗口并重新打开 RootSound，以使用音色文件导入。');
      if (opening) throw new Error('已有一个音色选择窗口，请先完成或取消它。');
      opening = true;
      try {
        const value = result(await bridge.Open());
        if (value.status === 'cancelled') return { status: 'cancelled' };
        if (value.status !== 'opened') throw new Error('音色文件尚未打开。');
        return checked(value.name, value.text);
      } finally { opening = false; }
    },
    async sync(songDraftId = '') {
      if (!bridge) throw new Error('尚未连接本机音色目录。');
      const value = result(await bridge.Sync(songDraftId));
      if (value.status === 'idle') return { status: 'idle' };
      if (typeof value.directory !== 'string' || !value.directory) throw new Error('音色目录服务返回了无效位置。');
      if (value.status === 'mirrored') return { status: 'mirrored', directory: value.directory };
      if (value.status === 'warning' && typeof value.message === 'string') return { status: 'warning', directory: value.directory, message: value.message };
      throw new Error('无法确认音色目录副本是否写入成功。');
    },
  };
}
export function createBrowserTimbreFiles(): TimbreFilesPort {
  let opening = false;
  return { open() {
    if (opening) return Promise.reject(new Error('已有一个音色选择窗口，请先完成或取消它。'));
    opening = true;
    return new Promise((resolve, reject) => {
      const input = document.createElement('input'); input.type = 'file'; input.accept = '.rssynth,.rssound'; input.multiple = false; input.hidden = true;
      const cleanup = () => { opening = false; input.remove(); };
      input.addEventListener('cancel', () => { cleanup(); resolve({ status: 'cancelled' }); }, { once: true });
      input.addEventListener('change', () => {
        const file = input.files?.[0];
        if (!file) { cleanup(); resolve({ status: 'cancelled' }); return; }
        if (!file.size || file.size > MAX_TIMBRE_IMPORT_TEXT_BYTES) { cleanup(); reject(new Error('音色文件为空或过大。')); return; }
        void file.text().then(text => { const value = checked(file.name, text); cleanup(); resolve(value); }, error => { cleanup(); reject(error); })
          .catch(error => { cleanup(); reject(error); });
      }, { once: true });
      try { document.body.append(input); input.click(); } catch (error) { cleanup(); reject(error); }
    });
  } };
}
