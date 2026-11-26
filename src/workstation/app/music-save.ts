import type { MaterialLibrary, JsonValue } from '../contracts/content.ts';
import type { PhraseEditorPort } from '../contracts/phrase.ts';
import type { SongEditorPort } from '../contracts/song.ts';
import { commitMusicDocument } from './music-document.ts';

export async function saveMusicDocument(library: MaterialLibrary, song: SongEditorPort, score: PhraseEditorPort): Promise<string | undefined> {
  if (typeof Worker !== 'function' || !library.prepareSnapshot || !library.applyPreparedSnapshot) {
    commitMusicDocument(library, song, score);
    return;
  }
  const songId = song.readDraft()!.id;
  const scoreId = score.read({ includeCatalog: false, sharedDraft: true }).draft!.id;
  const snapshot = library.prepareSnapshot();
  const worker = new Worker(new URL('./music-save-worker.ts', import.meta.url), { type: 'module' });
  try {
    const prepared = await new Promise<{ state: { [key: string]: JsonValue }; text: string; history?: { draftId: string; past: number[]; future: number[] }[]; transactions?: string[];
      bodies: { kind: 'drafts' | 'contents'; id: string; sourceKind: 'drafts' | 'contents'; sourceId: string }[] }>((resolve, reject) => {
      worker.onmessage = ({ data }) => {
        if (typeof data?.error === 'string') reject(new Error(data.error));
        else if (typeof data?.text === 'string' && data?.state) resolve(data);
        else reject(new Error('保存数据准备失败，请再次保存。'));
      };
      worker.onerror = () => reject(new Error('保存数据准备失败，请再次保存。'));
      worker.onmessageerror = () => reject(new Error('保存数据准备失败，请再次保存。'));
      worker.postMessage({ state: snapshot.state, songId, scoreId });
    });
    const original = snapshot.state as unknown as {
      drafts: { id: string; body: JsonValue }[];
      contents: { id: string; body: JsonValue }[];
      editHistory?: { entries: { draftId: string; past: JsonValue[]; future: JsonValue[] }[] };
      transactionHistory?: { entries: ({ id: string } & { [key: string]: JsonValue })[] };
    };
    for (const reference of prepared.bodies) {
      const record = (prepared.state[reference.kind] as { id: string; body: JsonValue }[]).find(item => item.id === reference.id)!;
      record.body = original[reference.sourceKind].find(item => item.id === reference.sourceId)!.body;
    }
    if (prepared.history) prepared.state.editHistory = { version: 1, entries: prepared.history.map(entry => {
      const previous = original.editHistory?.entries.find(item => item.draftId === entry.draftId);
      return { draftId: entry.draftId, past: entry.past.map(index => previous!.past[index]!), future: entry.future.map(index => previous!.future[index]!) };
    }) };
    if (prepared.transactions) prepared.state.transactionHistory = { version: 1, entries: prepared.transactions.map(id => original.transactionHistory!.entries.find(entry => entry.id === id)!) };
    await library.applyPreparedSnapshot(prepared, snapshot.token);
    return prepared.text;
  } finally { worker.terminate(); }
}
