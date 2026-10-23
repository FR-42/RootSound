import { MAX_PROJECT_FILE_BYTES, MAX_SOUND_FILE_BYTES, PROJECT_FILE_EXTENSION, SOUND_FILE_EXTENSION, type AudioFilesPort, type ProjectFilesPort, type SoundFilesPort } from '../../contracts/files.ts';
import { audioFileName, checkAudioBytes } from './audio-bytes.ts';
import { decodeProjectBytes, projectFileName, projectText } from './project-text.ts';

function fileName(suggestedName: string): string {
  const clean = suggestedName.replace(/[\\/:*?"<>|\u0000-\u001f]/gu, '').trim().replace(/[. ]+$/u, '');
  const stem = clean.replace(/\.rssound$/iu, '').slice(0, 120).replace(/[. ]+$/u, '') || '我的声音';
  return `${stem}${SOUND_FILE_EXTENSION}`;
}

export function createBrowserAudioFiles(): AudioFilesPort {
  return {
    async save(bytes, suggestedName) {
      checkAudioBytes(bytes);
      // Copy into an owned ArrayBuffer; callers may use a view into a larger buffer.
      const blob = new Blob([new Uint8Array(bytes).buffer], { type: 'audio/wav' });
      const name = audioFileName(suggestedName);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = name;
      anchor.hidden = true;
      try { document.body.append(anchor); anchor.click(); }
      finally { anchor.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000); }
      return { status: 'download-started', name };
    },
  };
}

/** This separate route never changes the smaller single-sound file boundary. */
export function createBrowserProjectFiles(): ProjectFilesPort {
  let opening = false;
  return {
    open() {
      if (opening) return Promise.reject(new Error('已有一个工程文件选择窗口，请先完成或取消它。'));
      opening = true;
      return new Promise((resolve, reject) => {
        const input = document.createElement('input'); input.type = 'file'; input.accept = `${PROJECT_FILE_EXTENSION},.json`; input.multiple = false; input.hidden = true;
        function cleanup(): void { input.removeEventListener('cancel', cancelled); input.removeEventListener('change', changed); input.remove(); }
        function cancelled(): void { cleanup(); opening = false; resolve({ status: 'cancelled' }); }
        function changed(): void {
          const file = input.files?.[0]; cleanup();
          if (!file) { opening = false; resolve({ status: 'cancelled' }); return; }
          if (file.size > MAX_PROJECT_FILE_BYTES) { opening = false; reject(new Error('工程文件超出当前 32 MiB 的大小范围。')); return; }
          Promise.resolve().then(() => file.arrayBuffer()).then(bytes => ({ status: 'opened' as const, name: file.name, text: decodeProjectBytes(bytes) }))
            .then(value => { opening = false; resolve(value); }, error => { opening = false; reject(error); });
        }
        input.addEventListener('cancel', cancelled, { once: true }); input.addEventListener('change', changed, { once: true });
        try { document.body.append(input); input.click(); } catch (error) { cleanup(); opening = false; reject(error); }
      });
    },
    async save(text, suggestedName) {
      const checked = projectText(text); const name = projectFileName(suggestedName);
      const blob = new Blob([checked], { type: 'application/json;charset=utf-8' }); const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a'); anchor.href = url; anchor.download = name; anchor.hidden = true;
      try { document.body.append(anchor); anchor.click(); }
      finally { anchor.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000); }
      return { status: 'download-started', name };
    },
  };
}

/** 浏览器只用于验证；下载发起后不能声称已经写入用户的磁盘。 */
export function createBrowserSoundFiles(): SoundFilesPort {
  return {
    open() {
      return new Promise((resolve, reject) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = `${SOUND_FILE_EXTENSION},.json`;
        input.multiple = false;
        input.hidden = true;
        function cleanup(): void {
          input.removeEventListener('cancel', cancelled);
          input.removeEventListener('change', changed);
          input.remove();
        }
        function cancelled(): void { cleanup(); resolve({ status: 'cancelled' }); }
        function changed(): void {
          const file = input.files?.[0];
          cleanup();
          if (!file) { resolve({ status: 'cancelled' }); return; }
          if (file.size > MAX_SOUND_FILE_BYTES) {
            reject(new Error('这个文件超出了当前单个声音文件的大小范围。'));
            return;
          }
          file.text().then(text => resolve({ status: 'opened', name: file.name, text }), reject);
        }
        input.addEventListener('cancel', cancelled, { once: true });
        input.addEventListener('change', changed, { once: true });
        document.body.append(input);
        try { input.click(); } catch (error) { cleanup(); reject(error); }
      });
    },
    async save(text, suggestedName) {
      const blob = new Blob([text], { type: 'application/json;charset=utf-8' });
      if (blob.size > MAX_SOUND_FILE_BYTES) throw new Error('声音文件过大，尚未发起下载。');
      const name = fileName(suggestedName);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = name;
      anchor.hidden = true;
      try {
        document.body.append(anchor);
        anchor.click();
      } finally {
        anchor.remove();
        // 下载消费资源可能晚于 click 返回；保留至浏览器接管后再释放。
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
      return { status: 'download-started', name };
    },
  };
}
