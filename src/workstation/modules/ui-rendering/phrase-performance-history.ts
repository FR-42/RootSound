import type { PhraseEditorPort, PhraseView } from '../../contracts/phrase.ts';

type Entry = { beforeBeat: number; afterBeat: number };
const histories = new WeakMap<PhraseEditorPort, Map<string, Map<string, Entry>>>();

/** Cursor companions to domain edits, kept only for this editing session. */
export function recordPerformanceEntry(phrase: PhraseEditorPort, noteId: string, beforeBeat: number, afterBeat: number): void {
  const draftId = phrase.read().draft?.id; if (!draftId) return;
  let drafts = histories.get(phrase); if (!drafts) histories.set(phrase, drafts = new Map());
  let entries = drafts.get(draftId); if (!entries) drafts.set(draftId, entries = new Map());
  entries.set(noteId, { beforeBeat, afterBeat });
}

function noteIds(view: PhraseView): Set<string> { return new Set(view.body?.parts.flatMap(part => part.notes.map(note => note.id))); }
function moveHistory(phrase: PhraseEditorPort, redo: boolean): number | undefined {
  const before = phrase.read();
  if (redo) phrase.redo(); else phrase.undo();
  const after = phrase.read();
  if (!before.draft || before.draft.id !== after.draft?.id || !after.body) return;
  const entries = histories.get(phrase)?.get(before.draft.id); if (!entries) return;
  const previous = noteIds(before), next = noteIds(after);
  const changed = [...(redo ? next : previous)].filter(id => !(redo ? previous : next).has(id));
  if (changed.length !== 1) return;
  const entry = entries.get(changed[0]!); if (!entry) return;
  return (redo ? entry.afterBeat : entry.beforeBeat) * 60 / after.body.tempoBpm;
}

/** Returns a restored cursor only when undo/redo adds or removes a typed note. */
export const undoPhraseEdit = (phrase: PhraseEditorPort): number | undefined => moveHistory(phrase, false);
export const redoPhraseEdit = (phrase: PhraseEditorPort): number | undefined => moveHistory(phrase, true);
