import { createDesktopPlatform } from './platform/desktop.ts';
import { mountReleaseStudio, showReleaseStartupError } from './release-studio.ts';

const root = document.getElementById('app')!;
async function start() {
  try {
    const platform = createDesktopPlatform(), projectDirectories = platform.projectDirectories;
    if (!projectDirectories) throw new Error('未连接音乐工程服务。');
    const studio = await mountReleaseStudio(root, { ...platform, projectDirectories }, () => location.reload());
    const closeHost = globalThis as typeof globalThis & { __rootSoundPrepareClose?: typeof studio.prepareClose };
    closeHost.__rootSoundPrepareClose = studio.prepareClose;
    window.addEventListener('pagehide', () => { delete closeHost.__rootSoundPrepareClose; studio.dispose(); });
  } catch (error) { showReleaseStartupError(root, error); }
}
void start();
