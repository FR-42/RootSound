import type { MaterialStorage } from '../contracts/content.ts';
import { createMaterialLibrary } from '../modules/materials/public.ts';

export function stageMaterialStorage(storage: MaterialStorage) {
  let initial = storage.read();
  let pending = initial;
  let staging = true;
  const staged: MaterialStorage = {
    read: () => staging ? pending : storage.read(),
    write(value) {
      if (staging) pending = value;
      else storage.write(value);
    },
  };
  if (storage.writePermanent) staged.writePermanent = value => {
    if (staging) throw new Error('请先等待工程加载完成。');
    storage.writePermanent!(value);
  };
  return { storage: staged, publish() {
    if (!staging) return;
    if (pending !== null && pending !== initial) {
      if (storage.read() !== initial) throw new Error('歌曲在加载时发生了变化，请重新打开。');
      storage.write(pending);
    }
    staging = false;
    initial = pending = null;
  } };
}

/** Observe the initial read without retaining another serialized library. */
export function openMaterialSession(storage: MaterialStorage, options?: Parameters<typeof createMaterialLibrary>[1]) {
  let firstRead = true;
  let hasPrevious = false;
  const sessionStorage: MaterialStorage = { read() {
    const text = storage.read();
    if (firstRead) { hasPrevious = text !== null; firstRead = false; }
    return text;
  }, write(value) { storage.write(value); } };
  if (storage.writePermanent) sessionStorage.writePermanent = value => storage.writePermanent!(value);
  const library = createMaterialLibrary(sessionStorage, options);
  return { library, hasPrevious };
}
