import { createWebDemoModel } from './web-demo-model.ts';
import { commitMusicDocument } from './music-document.ts';
import type { MusicGuideDocument } from '../modules/ui-rendering/public.ts';

export function createMusicGuideDocument(name: string): MusicGuideDocument {
  const model = createWebDemoModel(undefined, name);
  return {
    phrase: model.score,
    listTimbres: () => model.palette.filter(tone => ['studio-piano', 'studio-flute', 'studio-violin'].includes(tone.key)),
    addGroup: model.addGroup,
    changeTone: model.changeTone,
    rename: model.rename,
    save() {
      commitMusicDocument(model.library, model.song, model.score);
    },
  };
}
