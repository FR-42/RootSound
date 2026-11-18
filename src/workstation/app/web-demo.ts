import './release-colors.css';
import './website-editor.css';

function loadEditor() {
  return Promise.all([
    import('../../../website/examples/starter.json'),
    import('./music-document.ts'),
    import('./platform/timbre-files.ts'),
    import('./release-studio.ts'),
    import('./web-demo-example.ts'),
    import('./web-demo-model.ts'),
  ]);
}

const root = document.getElementById('app')!;
document.documentElement.classList.add('windows-desktop-colors', 'website-editor');
let studio: Awaited<ReturnType<typeof import('./release-studio.ts')['mountReleaseStudio']>> | undefined;

async function start() {
  const [{ default: starterExample }, { commitMusicDocument }, { createBrowserTimbreFiles },
    { mountReleaseStudio, showReleaseStartupError }, { createWebExampleModel }, { WEBSITE_PIANO }] = await loadEditor();
  try {
    const example = createWebExampleModel(starterExample, undefined, WEBSITE_PIANO);
    commitMusicDocument(example.library, example.song, example.score);
    let text = example.readLibrary();
    studio = await mountReleaseStudio(root, {
      demoProject: { id: 'website-starter', name: starterExample.name,
        mobileWeb: matchMedia('(pointer: coarse) and (hover: none)').matches && Math.min(screen.width, screen.height) < 600 },
      storage: { read: () => text, write: value => { text = value; } },
      timbreFiles: createBrowserTimbreFiles(),
    });
  } catch (error) { showReleaseStartupError(root, error); }
}

window.addEventListener('pagehide', event => { if (!event.persisted) studio?.dispose(); });
void start().catch(error => { root.textContent = error instanceof Error ? error.message : String(error); });
