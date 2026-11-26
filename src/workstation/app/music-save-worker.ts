import { createMaterialLibrary } from '../modules/materials/public.ts';
import { createPhraseEditor, createPhrasePlayback, createPhraseReferenceAdapter } from '../modules/phrase/public.ts';
import { createSongEditor, createSongReferenceAdapter } from '../modules/song/public.ts';
import { createTimbrePlayback, createTimbreReferenceAdapter } from '../modules/timbre/public.ts';
import { createSampleReferenceAdapter } from '../modules/sampling/public.ts';
import { commitMusicDocument } from './music-document.ts';

self.onmessage = ({ data }) => {
  try {
    let text = JSON.stringify(data.state);
    const library = createMaterialLibrary({ read: () => text, write: value => { text = value; } }, {
      project: { rootKind: 'rootsound.song', adapters: [createTimbreReferenceAdapter(), createPhraseReferenceAdapter(), createSongReferenceAdapter(), createSampleReferenceAdapter()] },
    });
    const tones = createTimbrePlayback(library);
    const song = createSongEditor(library, createPhrasePlayback(library, tones), { defaultTempoMode: 'source', initialTrackCount: 1 });
    const score = createPhraseEditor(library, tones);
    song.openDraft(data.songId);
    score.openDraft(data.scoreId);
    const original = library.prepareSnapshot!().state as unknown as HistoryState;
    commitMusicDocument(library, song, score);
    library.flushDeferredWrites?.();
    const prepared = library.prepareSnapshot!().state as unknown as HistoryState;
    const history = prepared.editHistory?.entries.map(entry => {
      const previous = original.editHistory?.entries.find(item => item.draftId === entry.draftId);
      const indices = (steps: object[], source?: object[]) => steps.map(step => {
        const index = source?.indexOf(step) ?? -1;
        if (index < 0) throw new Error('保存历史发生了意外变化，请再次保存。');
        return index;
      });
      return { draftId: entry.draftId, past: indices(entry.past, previous?.past), future: indices(entry.future, previous?.future) };
    });
    const transactions = prepared.transactionHistory?.entries.map(entry => entry.id);
    const originals = (['drafts', 'contents'] as const).flatMap(kind => data.state[kind].map((record: { id: string; body: unknown }) =>
      ({ kind, id: record.id, body: JSON.stringify(record.body) })));
    const bodies: { kind: 'drafts' | 'contents'; id: string; sourceKind: 'drafts' | 'contents'; sourceId: string }[] = [];
    const state = { ...prepared, editHistory: undefined, transactionHistory: undefined } as unknown as Record<string, unknown>;
    for (const kind of ['drafts', 'contents'] as const) state[kind] = (prepared as unknown as Record<typeof kind, { id: string; body: unknown }[]>)[kind].map(record => {
      const body = JSON.stringify(record.body);
      const source = originals.find(item => item.body === body);
      if (!source) return record;
      bodies.push({ kind, id: record.id, sourceKind: source.kind, sourceId: source.id });
      return { ...record, body: null };
    });
    self.postMessage({ state, history, transactions, bodies, text });
  } catch (error) {
    self.postMessage({ error: error instanceof Error ? error.message : String(error) });
  }
};

type HistoryState = {
  editHistory?: { entries: { draftId: string; past: object[]; future: object[] }[] };
  transactionHistory?: { entries: { id: string }[] };
};
