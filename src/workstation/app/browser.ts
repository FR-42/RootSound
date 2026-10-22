import { createMaterialLibrary } from '../modules/materials/public.ts';
import { createBrowserSoundRuntime } from '../modules/sound-runtime/public.ts';
import { createTimbreEditor } from '../modules/timbre/public.ts';
import { mountStudio } from '../modules/ui-rendering/public.ts';

// Temporary host for architecture verification; Windows desktop is the product priority.
const STORAGE_KEY = 'rootsound.workstation.materials.v1';
const root = document.getElementById('app')!;
const runtime = createBrowserSoundRuntime();
try {
  const previous = localStorage.getItem(STORAGE_KEY);
  const library = createMaterialLibrary({
    read: () => localStorage.getItem(STORAGE_KEY),
    write: value => localStorage.setItem(STORAGE_KEY, value),
  });
  const timbre = createTimbreEditor(library);
  const studio = mountStudio(root, { timbre, sound: runtime, hasPrevious: previous !== null });
  window.addEventListener('pagehide', event => {
    if (event.persisted) { runtime.stopAll(); return; }
    studio.dispose(); void runtime.dispose();
  });
} catch (error) {
  const message = document.createElement('main'); message.className = 'startup-error';
  const title = document.createElement('h1'); title.textContent = '暂时无法打开你的声音';
  const explanation = document.createElement('p'); explanation.textContent = error instanceof Error ? error.message : String(error);
  const detail = document.createElement('p'); detail.textContent = '原有保存数据已保留。请保留此窗口中的错误信息，解决后重新打开。';
  message.append(title, explanation, detail); root.replaceChildren(message);
  void runtime.dispose();
}
