import type { MaterialStorage } from '../contracts/content.ts';
import { createMaterialLibrary } from '../modules/materials/public.ts';

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
