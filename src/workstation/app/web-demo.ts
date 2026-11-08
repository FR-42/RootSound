import starterExample from '../../../website/examples/starter.json';
import { preloadWebSoundFont } from '../modules/sound-runtime/public.ts';
import { commitMusicDocument } from './music-document.ts';
import { createBrowserTimbreFiles } from './platform/timbre-files.ts';
import { mountReleaseStudio, showReleaseStartupError } from './release-studio.ts';
import { createWebExampleModel } from './web-demo-example.ts';

const root = document.getElementById('app')!;
const choiceKey = 'rootsound.website-guide-choice.v1';
let startup: Promise<void> | undefined;
let studio: Awaited<ReturnType<typeof mountReleaseStudio>> | undefined;

void preloadWebSoundFont().catch(() => {});

function start(watchGuide: boolean) {
  if (startup) {
    if (watchGuide) void startup.then(() => studio?.openGuide());
    return;
  }
  try { if (localStorage.getItem(choiceKey) === null) localStorage.setItem(choiceKey, watchGuide ? 'yes' : 'no'); } catch {}
  startup = (async () => {
    try {
      const example = createWebExampleModel(starterExample);
      commitMusicDocument(example.library, example.song, example.score);
      let text = example.readLibrary();
      studio = await mountReleaseStudio(root, {
        demoProject: { id: 'website-starter', name: starterExample.name, startWithGuide: watchGuide },
        storage: { read: () => text, write: value => { text = value; } },
        timbreFiles: createBrowserTimbreFiles(),
      });
    } catch (error) { showReleaseStartupError(root, error); }
  })();
}

function askAboutGuide() {
  const welcome = document.createElement('section'); welcome.className = 'welcome website-guide-choice';
  const invitation = document.createElement('section'); invitation.className = 'invitation';
  const title = document.createElement('h1'); title.textContent = '是否观看引导';
  const actions = document.createElement('div'); actions.className = 'welcome-actions';
  for (const [label, watch] of [['是', true], ['否', false]] as const) {
    const button = document.createElement('button');
    button.type = 'button'; button.className = watch ? 'primary' : 'secondary'; button.textContent = label;
    button.addEventListener('click', () => { start(watch); });
    actions.append(button);
  }
  invitation.append(title, actions); welcome.append(invitation); root.replaceChildren(welcome);
}

window.addEventListener('message', event => {
  if (event.origin === location.origin && event.source === parent && event.data?.type === 'jianle:start-guide') start(true);
});
window.addEventListener('pagehide', event => { if (!event.persisted) studio?.dispose(); });

let answered = false;
try { answered = localStorage.getItem(choiceKey) !== null; } catch {}
if (new URLSearchParams(location.search).get('guide') === '1') start(true);
else if (answered) start(false);
else askAboutGuide();
