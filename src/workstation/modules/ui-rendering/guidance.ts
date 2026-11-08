import type { AudioFilesPort } from '../../contracts/files.ts';
import type { GuideId, LearningSettingsPort, PracticeFactory } from '../../contracts/guidance.ts';
import type { SoundRuntimePort } from '../../contracts/sound.ts';
import { guideScenes } from './guidance-flow.ts';
import { createGuidanceDemonstration } from './guidance-demonstration.ts';
import './guidance.css';

export function mountGuidance(root: HTMLElement, options: {
  id: GuideId; settings: LearningSettingsPort; createPractice: PracticeFactory;
  sound: SoundRuntimePort; audioFiles: AudioFilesPort; replay?: boolean; onClose(): void;
}): { dispose(): void } {
  const scenes = guideScenes(options.id), stored = options.settings.read().guides[options.id];
  let index = options.id === 'tempo-rolls' && !options.replay && stored.status === 'learning' ? Math.min(stored.step, scenes.length - 1) : 0;
  let local = 0, last = performance.now(), disposed = false, raf = 0, dirty = true;
  const output = options.sound.readOutputLevel?.() ?? 1;
  let listening = Math.min(output, .7);
  const sound: SoundRuntimePort = new Proxy(options.sound, {
    get(target, key) {
      if (key === 'readOutputLevel') return () => listening;
      if (key === 'setOutputLevel') return (value: number) => { listening = value; target.setOutputLevel?.(value); };
      const value = Reflect.get(target, key); return typeof value === 'function' ? value.bind(target) : value;
    },
  });
  options.sound.setOutputLevel?.(listening);
  const background = Array.from(root.children).filter((node): node is HTMLElement => node instanceof HTMLElement).map(node => ({ node, inert: node.inert }));
  background.forEach(({ node }) => { node.inert = true; });
  const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : undefined;
  const shell = document.createElement('section'); shell.className = 'guidance-shell'; shell.tabIndex = -1; shell.setAttribute('aria-label', '基础操作演示'); shell.dataset.mode = 'demonstration';
  const host = document.createElement('div'); host.className = 'guidance-editor'; shell.append(host); root.append(shell); shell.focus({ preventScroll: true });
  const practice = options.createPractice(options.id, false);
  const demo = createGuidanceDemonstration(shell, host, practice, sound, options.id === 'tempo-rolls');
  function record(status: 'learning' | 'completed' | 'skipped') { try { options.settings.record(options.id, { status, step: index }); } catch { shell.dataset.storageError = 'true'; } }
  function enter(value: number) {
    index = value; local = 0; demo.enter(scenes[index]!.id); last = performance.now(); dirty = true;
    shell.dataset.scene = scenes[index]!.id; record('learning');
  }
  function finish(completed: boolean) { if (disposed) return; record(completed ? 'completed' : 'skipped'); dispose(); options.onClose(); }
  function tick(now: number) {
    if (disposed) return;
    const delta = Math.max(0, now - last); last = now;
    if (!document.hidden && demo.ready()) {
      local += delta;
      if (local >= scenes[index]!.duration) {
        if (index === scenes.length - 1) { finish(true); return; }
        enter(index + 1);
      }
      dirty = true;
    }
    if (dirty && demo.ready()) {
      try { demo.render(local); } catch { finish(false); return; }
      dirty = false;
    }
    raf = requestAnimationFrame(tick);
  }
  function visibility() { if (document.hidden) demo.pause(); else demo.resume(); last = performance.now(); }
  function resize() { dirty = true; }
  function key(event: KeyboardEvent) {
    if (event.key !== 'Escape') return;
    event.preventDefault(); event.stopImmediatePropagation(); finish(false);
  }
  document.addEventListener('visibilitychange', visibility); window.addEventListener('resize', resize); document.addEventListener('keydown', key, true);
  function dispose() {
    if (disposed) return; disposed = true; cancelAnimationFrame(raf); demo.dispose(); options.sound.stopAll(); options.sound.setOutputLevel?.(output);
    document.removeEventListener('visibilitychange', visibility); window.removeEventListener('resize', resize); document.removeEventListener('keydown', key, true);
    shell.remove(); background.forEach(({ node, inert }) => { if (node.isConnected) node.inert = inert; }); if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
  }
  enter(index); raf = requestAnimationFrame(tick);
  return { dispose };
}
