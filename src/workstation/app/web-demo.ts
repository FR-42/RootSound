import starterExample from '../../../website/examples/starter.json';
import { commitMusicDocument } from './music-document.ts';
import { createBrowserMusicWorkspace } from './platform/browser-music.ts';
import { mountReleaseStudio, showReleaseStartupError } from './release-studio.ts';
import { createWebExampleModel } from './web-demo-example.ts';

const root = document.getElementById('app')!;
const example = createWebExampleModel(starterExample);
commitMusicDocument(example.library, example.song, example.score);
const workspace = createBrowserMusicWorkspace({ name: starterExample.name, text: example.readLibrary() });
let studio: Awaited<ReturnType<typeof mountReleaseStudio>> | undefined;

async function render(startGuide = false) {
  studio?.dispose();
  studio = undefined;
  try {
    studio = await mountReleaseStudio(root, workspace.platform(), () => { void render(); });
    if (startGuide) await studio.openGuide();
  } catch (error) { showReleaseStartupError(root, error); }
}

window.addEventListener('message', event => {
  if (event.origin === location.origin && event.source === parent && event.data?.type === 'jianle:start-guide')
    void studio?.openGuide();
});
window.addEventListener('beforeunload', event => {
  if (workspace.dirty()) event.preventDefault();
});
window.addEventListener('pagehide', event => { if (!event.persisted) studio?.dispose(); });
void render(new URLSearchParams(location.search).get('guide') === '1');
