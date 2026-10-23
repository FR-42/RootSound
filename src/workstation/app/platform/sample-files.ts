import { MAX_SAMPLE_FILE_BYTES, type SampleFilesPort } from '../../contracts/files.ts';

export interface NativeSampleBridge { Open(): Promise<unknown> }

function fail(message: string): never { throw new Error(`采样文件：${message}`); }
function size(bytes: number): void {
  if (!Number.isSafeInteger(bytes) || bytes <= 0) fail('这个文件没有可读取的声音内容。');
  if (bytes > MAX_SAMPLE_FILE_BYTES) fail('文件超出当前 16 MiB 的大小范围，原文件已保留。');
}
function decode(base64: unknown): Uint8Array {
  if (typeof base64 !== 'string' || !base64 || base64.length > Math.ceil(MAX_SAMPLE_FILE_BYTES / 3) * 4) fail('文件传输内容无效或超出当前大小范围。');
  if (base64.length % 4 !== 0 || !/^[A-Za-z0-9+/]*={0,2}$/u.test(base64)) fail('文件传输内容无效。');
  let binary: string;
  try { binary = atob(base64); } catch { return fail('文件传输内容无法读取。'); }
  size(binary.length);
  const result = new Uint8Array(binary.length);
  for (let index = 0; index < result.length; index++) result[index] = binary.charCodeAt(index);
  return result;
}

/** The host reads original bytes only. Audio decoding decides actual format support. */
export function createDesktopSampleFiles(bridge?: NativeSampleBridge): SampleFilesPort {
  let opening = false;
  return {
    async open() {
      if (!bridge) fail('当前桌面窗口尚不支持采样导入，请关闭旧窗口后重新打开 RootSound。');
      if (opening) fail('已有一个文件选择窗口，请先完成或取消它。');
      opening = true;
      try {
        let raw: unknown;
        try { raw = await bridge.Open(); } catch { return fail('无法连接本机文件选择服务，请重新打开 RootSound。'); }
        if (typeof raw !== 'string') fail('本机返回了无法识别的文件结果。');
        let result: unknown;
        try { result = JSON.parse(raw); } catch { return fail('本机文件结果无法读取。'); }
        if (!result || typeof result !== 'object' || Array.isArray(result)) fail('本机返回了无法识别的文件结果。');
        const value = result as Record<string, unknown>;
        if (value.status === 'cancelled') return { status: 'cancelled' };
        if (value.status === 'error') fail(typeof value.message === 'string' && value.message.trim() ? value.message : '文件未能读取，原文件已保留。');
        if (value.status !== 'opened' || typeof value.name !== 'string' || !value.name.trim() || typeof value.mimeType !== 'string') fail('本机返回的文件信息不完整。');
        return { status: 'opened', name: value.name, bytes: decode(value.base64), mimeType: value.mimeType || 'application/octet-stream' };
      } finally { opening = false; }
    },
  };
}

/** Selecting a file never uploads or rewrites it; MIME metadata is only a hint. */
export function createBrowserSampleFiles(): SampleFilesPort {
  let opening = false;
  return {
    open() {
      if (opening) return Promise.reject(new Error('已有一个文件选择窗口，请先完成或取消它。'));
      opening = true;
      return new Promise((resolve, reject) => {
        let input: HTMLInputElement;
        try { input = document.createElement('input'); input.type = 'file'; input.accept = 'audio/*'; input.multiple = false; input.hidden = true; }
        catch (error) { opening = false; reject(error); return; }
        function cleanup(): void { input.removeEventListener('cancel', cancelled); input.removeEventListener('change', changed); input.remove(); }
        function cancelled(): void { cleanup(); opening = false; resolve({ status: 'cancelled' }); }
        function changed(): void {
          const file = input.files?.[0]; cleanup();
          if (!file) { opening = false; resolve({ status: 'cancelled' }); return; }
          try { size(file.size); } catch (error) { opening = false; reject(error); return; }
          Promise.resolve().then(() => file.arrayBuffer()).then(buffer => {
            size(buffer.byteLength);
            if (buffer.byteLength !== file.size) fail('文件在读取时发生变化，请重新选择。原文件已保留。');
            return { status: 'opened' as const, name: file.name, bytes: new Uint8Array(buffer).slice(), mimeType: file.type || 'application/octet-stream' };
          }).then(value => { opening = false; resolve(value); }, error => { opening = false; reject(error); });
        }
        input.addEventListener('cancel', cancelled, { once: true }); input.addEventListener('change', changed, { once: true });
        try { document.body.append(input); input.click(); } catch (error) { cleanup(); opening = false; reject(error); }
      });
    },
  };
}
