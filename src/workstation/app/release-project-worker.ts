import { createMaterialLibrary } from '../modules/materials/public.ts';
import { createTimbrePlayback, createTimbreReferenceAdapter } from '../modules/timbre/public.ts';
import { createPhraseEditor, createPhrasePlayback, createPhraseReferenceAdapter } from '../modules/phrase/public.ts';
import { createSongEditor, createSongReferenceAdapter } from '../modules/song/public.ts';
import { createSampleReferenceAdapter } from '../modules/sampling/public.ts';
import { openMusicDocument } from './music-document.ts';
import { prepareProjectMelodyTimbres } from './project-timbres.ts';
import { normalizeImportedTimbreNames, normalizeProjectToneCards } from './curated-timbre-names.ts';

self.addEventListener('message', (event: MessageEvent<{ text: string; name: string; legacyNames: boolean; strictNames: boolean; seedCatalog: boolean }>) => {
  try {
    let text = event.data.strictNames ? normalizeProjectToneCards(event.data.text) : event.data.legacyNames ? normalizeImportedTimbreNames(event.data.text) : event.data.text;
    if (event.data.seedCatalog) {
      const library = createMaterialLibrary({ read: () => text, write: next => { text = next; } }, { project: { rootKind: 'rootsound.song',
        adapters: [createTimbreReferenceAdapter(), createPhraseReferenceAdapter(), createSongReferenceAdapter(), createSampleReferenceAdapter()] } });
      const tones = createTimbrePlayback(library), phrase = createPhraseEditor(library, tones);
      const song = createSongEditor(library, createPhrasePlayback(library, tones), { defaultTempoMode: 'source', initialTrackCount: 1 });
      const id = openMusicDocument(library, song, phrase, event.data.name);
      if (id) prepareProjectMelodyTimbres(library, id, undefined, { preserveHistory: true });
    }
    self.postMessage(text === event.data.text ? { unchanged: true } : { text });
  } catch {
    self.postMessage({});
  }
});
