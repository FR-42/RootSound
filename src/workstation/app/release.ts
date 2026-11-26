import { createDesktopPlatform } from './platform/desktop.ts';
import { mountReleaseStudio, showReleaseStartupError } from './release-studio.ts';
import { createRendererCloseRequests } from './project-close.ts';
import { mountTextFieldSelection } from './text-field-selection.ts';
import { mountRoundPointer } from '../modules/ui-rendering/public.ts';
import './release-window.css';
import './release-colors.css';

if (navigator.userAgent.includes('Windows')) document.documentElement.classList.add('windows-desktop-colors');
const root = document.getElementById('app')!;
const disposePointer = mountRoundPointer(root);
if (document.documentElement.classList.contains('windows-desktop-colors')) {
  const disposeTextSelection = mountTextFieldSelection(root);
  window.addEventListener('pagehide', disposeTextSelection, { once: true });
}
const titlebar = document.createElement('div');
titlebar.className = 'release-window-titlebar';
titlebar.setAttribute('aria-hidden', 'true');
root.before(titlebar);
const closeRequests = createRendererCloseRequests();
const closeHost = globalThis as typeof globalThis & {
  __rootSoundClose?: typeof closeRequests;
  __rootSoundPrepareClose?: Awaited<ReturnType<typeof mountReleaseStudio>>['prepareClose'];
};
closeHost.__rootSoundClose = closeRequests;
let activeStudio: Awaited<ReturnType<typeof mountReleaseStudio>> | undefined;
let starting = false;
async function start() {
  if (starting) return;
  starting = true;
  activeStudio?.dispose();
  activeStudio = undefined;
  try {
    const platform = createDesktopPlatform(), projectDirectories = platform.projectDirectories;
    if (!projectDirectories) throw new Error('未连接音乐工程服务。');
    const studio = await mountReleaseStudio(root, { ...platform, projectDirectories, pointerMounted: true, humPitch: navigator.userAgent.includes('Windows') }, () => { void start(); });
    activeStudio = studio;
    closeRequests.useEditor(studio);
    closeHost.__rootSoundPrepareClose = studio.prepareClose;
  } catch (error) {
    closeRequests.startupFailed(error);
    showReleaseStartupError(root, error);
  } finally { starting = false; }
}
window.addEventListener('pagehide', () => {
  delete closeHost.__rootSoundClose;
  delete closeHost.__rootSoundPrepareClose;
  activeStudio?.dispose();
  disposePointer();
}, { once: true });
void start();
