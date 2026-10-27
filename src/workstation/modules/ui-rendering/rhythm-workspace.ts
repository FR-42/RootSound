import { mountMelodyWorkspace } from './melody-workspace.ts';

/** Both departments share gestures and the phrase clock; rhythm rows represent tones. */
export function mountRhythmWorkspace(root: HTMLElement, options: Omit<Parameters<typeof mountMelodyWorkspace>[1], 'section'>): ReturnType<typeof mountMelodyWorkspace> {
  return mountMelodyWorkspace(root, { ...options, section: 'rhythm' });
}
