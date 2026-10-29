/** Small request/response bridge; browser fallback is only for local development. */
export function createHostBridge(webview = globalThis.chrome?.webview) {
  let serial = 0;
  const pending = new Map();
  const listeners = new Set();
  webview?.addEventListener('message', event => {
    const message = event.data;
    if (message?.event) { for (const listener of listeners) listener(message); return; }
    const request = pending.get(message?.id); if (!request) return;
    pending.delete(message.id); clearTimeout(request.timeout);
    if (message.ok) request.resolve(message.result);
    else request.reject(new Error(message.error || '文件操作失败'));
  });
  function download(textOrBytes, name, type) {
    const url = URL.createObjectURL(new Blob([textOrBytes], { type }));
    const link = document.createElement('a'); link.href = url; link.download = name; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
    return { status: 'saved', name };
  }
  async function fallback(method, payload) {
    if (method === 'getInfo') return { version: 'browser-preview', outputDirectory: '', patchExtension: '.rssynth' };
    if (method === 'setDirty' || method === 'clearRecovery') return { status: 'updated' };
    if (method === 'loadRecovery') return { status: 'empty' };
    if (method === 'saveRecovery') return { status: 'saved' };
    if (method === 'savePatch') return download(payload.text, payload.name.replace(/\.rssynth$/iu, '') + '.rssynth', 'application/json');
    if (method === 'exportWav') {
      const binary = atob(payload.base64);
      return download(Uint8Array.from(binary, character => character.charCodeAt(0)), payload.name.replace(/\.wav$/iu, '') + '.wav', 'audio/wav');
    }
    if (method === 'openPatch') return new Promise(resolve => {
      const input = document.createElement('input'); input.type = 'file'; input.accept = '.rssynth,application/json';
      input.addEventListener('change', async () => {
        const file = input.files?.[0];
        if (!file) resolve({ status: 'cancelled' });
        else if (file.size > 2 * 1024 * 1024) resolve({ status: 'invalid', text: '', name: file.name });
        else resolve({ status: 'opened', text: await file.text(), name: file.name });
      });
      input.addEventListener('cancel', () => resolve({ status: 'cancelled' })); input.click();
    });
    throw new Error('此操作需要桌面实验工具');
  }
  return {
    native: Boolean(webview),
    request(method, payload = {}) {
      if (!webview) return fallback(method, payload);
      return new Promise((resolve, reject) => {
        const id = `spectral-${++serial}`;
        // A native save/open dialog may legitimately remain open for minutes.
        const timeout = setTimeout(() => { pending.delete(id); reject(new Error('文件操作等待超时，请重试')); }, 15 * 60 * 1000);
        pending.set(id, { resolve, reject, timeout });
        try { webview.postMessage({ id, method, payload }); }
        catch (error) { clearTimeout(timeout); pending.delete(id); reject(error); }
      });
    },
    onEvent(listener) { listeners.add(listener); return () => listeners.delete(listener); },
  };
}

export function bytesToBase64(bytes) {
  const parts = [];
  for (let offset = 0; offset < bytes.length; offset += 32766)
    parts.push(btoa(String.fromCharCode(...bytes.subarray(offset, offset + 32766))));
  return parts.join('');
}
