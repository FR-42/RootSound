import { createDesktopPlatform } from './platform/desktop.ts';
import { mountReleaseStudio, showReleaseStartupError } from './release-studio.ts';
import { createRendererCloseRequests } from './project-close.ts';
import { mountTextFieldSelection } from './text-field-selection.ts';
import './release-window.css';
import './release-colors.css';

if (navigator.userAgent.includes('Windows')) document.documentElement.classList.add('windows-desktop-colors');
const root = document.getElementById('app')!;
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
async function start() {
  try {
    const platform = createDesktopPlatform(), projectDirectories = platform.projectDirectories;
    if (!projectDirectories) throw new Error('未连接音乐工程服务。');
    const studio = await mountReleaseStudio(root, { ...platform, projectDirectories }, () => location.reload());
    closeRequests.useEditor(studio);
    closeHost.__rootSoundPrepareClose = studio.prepareClose;
    window.addEventListener('pagehide', () => {
      delete closeHost.__rootSoundClose;
      delete closeHost.__rootSoundPrepareClose;
      studio.dispose();
    }, { once: true });
  } catch (error) {
    closeRequests.startupFailed(error);
    showReleaseStartupError(root, error);
  }
}
void start();
