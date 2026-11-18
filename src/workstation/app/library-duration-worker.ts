import type { EditableFileSource } from '../contracts/project-directory.ts';
import { phraseDurationSeconds } from '../contracts/phrase-time.ts';
import { createMaterialLibrary } from '../modules/materials/public.ts';
import { createTimbrePlayback, createTimbreReferenceAdapter } from '../modules/timbre/public.ts';
import { createPhraseEditor, createPhrasePlayback, createPhraseReferenceAdapter } from '../modules/phrase/public.ts';
import { createSongEditor, createSongReferenceAdapter } from '../modules/song/public.ts';
import { createCoCreationReferenceAdapter } from '../modules/co-creation/public.ts';
import { createSampleReferenceAdapter } from '../modules/sampling/public.ts';
import { openMusicDocument } from './music-document.ts';
import { readMusicFile } from './music-file.ts';

export function measureLibraryDuration(source: string | EditableFileSource): number | undefined {
  let snapshot = typeof source === 'string' ? source : readMusicFile(source.bytes, source.name, source.format).libraryText;
  const adapters = [createTimbreReferenceAdapter(), createPhraseReferenceAdapter(), createSongReferenceAdapter(),
    createCoCreationReferenceAdapter(), createSampleReferenceAdapter()];
  const library = createMaterialLibrary({ read: () => snapshot, write: value => { snapshot = value; } },
    { project: { rootKind: 'rootsound.song', adapters } });
  const tones = createTimbrePlayback(library);
  const song = createSongEditor(library, createPhrasePlayback(library, tones), { defaultTempoMode: 'source' });
  const score = createPhraseEditor(library, tones);
  if (!openMusicDocument(library, song, score)) return undefined;
  const body = score.read().body;
  return body && phraseDurationSeconds(body);
}

if (typeof globalThis.postMessage === 'function' && typeof globalThis.document === 'undefined') {
  globalThis.onmessage = (event: MessageEvent<{ id: number; source: string | EditableFileSource }>) => {
    const { id, source } = event.data;
    let duration: number | undefined;
    try { duration = measureLibraryDuration(source); }
    catch { duration = undefined; }
    globalThis.postMessage({ id, duration });
  };
}
