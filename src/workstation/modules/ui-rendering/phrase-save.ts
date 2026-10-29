import type { PhraseEditorPort } from '../../contracts/phrase.ts';
import type { SaveResult } from '../../contracts/content.ts';
import type { ReferenceContext, ReferenceEditingPort, ReferenceSession } from '../../contracts/references.ts';
import { beginOrResumeReferenceEdit } from './reference-activity.ts';

export type PhraseSaveSelection = { ids: string[]; token: string; reuseIfAllSelected?: boolean };
export type PhraseSaveContinuation = { id: string; session?: ReferenceSession; selection?: PhraseSaveSelection };
const locationKey = (location: ReferenceContext): string => JSON.stringify([location.root.type, location.root.id, location.path]);

/** Save the current occurrence without navigating away or losing its next editing scope. */
export function savePhraseInPlace(options: {
  phrase: PhraseEditorPort;
  references?: ReferenceEditingPort;
  selection?: PhraseSaveSelection;
  onKeep?(ids: string[]): void;
  saveDraft?(draftId: string, mode: 'new' | 'overwrite'): SaveResult;
  /** Runs before retention, so the caller can repair scope state even when retention fails. */
  onContinuation?(continuation: PhraseSaveContinuation): void;
}): PhraseSaveContinuation {
  const { phrase, references, selection } = options;
  const view = phrase.read(); const draft = view.draft;
  if (!draft || !view.body) throw new Error(view.problem ?? '先打开一个乐句。');
  let session = references?.resume(draft.id);
  // New project phrases are already saved empty entities. A clean save need
  // not pass the older note editor's intentional empty-phrase save guard.
  if (!session && draft.sourceId && !view.changed) return complete({ id: draft.sourceId });
  if (!session && draft.sourceId && references) session = references.beginLibrary(draft.sourceId, draft.id);
  if (!session || !references) {
    const mode = draft.sourceId ? 'overwrite' : 'new';
    const saved = options.saveDraft ? options.saveDraft(draft.id, mode) : phrase.save(mode);
    if (saved.status !== 'saved') throw new Error(saved.status === 'storage-error' ? saved.message
      : saved.status === 'conflict' ? saved.reason : '乐句还未保存，请检查使用位置。');
    return complete({ id: saved.content.id });
  }
  const selectedLocations = selection ? new Set(references.locations(session.draftId).locations
    .filter(location => selection.ids.includes(location.id)).map(locationKey)) : undefined;
  const result = references.apply(session.draftId, selection ? {
    locationIds: selection.ids, expectedToken: selection.token,
    ...(selection.reuseIfAllSelected ? { reuseIfAllSelected: true } : {}),
  } : undefined);
  if (result.status !== 'applied') throw new Error(result.status === 'storage-error' ? result.message : result.reason);
  let next: ReferenceSession | undefined;
  if (session.context && (!selectedLocations || selectedLocations.has(locationKey(session.context)))) {
    next = beginOrResumeReferenceEdit(references, session.context);
    phrase.openDraft(next.draftId);
  } else if (result.workingDraftId) {
    phrase.openDraft(result.workingDraftId);
    // An explicit multi-location selection needs a fresh token for its next
    // save. Ordinary library saves can keep the clean non-session draft.
    if (selection) {
      next = references.beginLibrary(result.content.id, result.workingDraftId);
      phrase.openDraft(next.draftId);
    }
  } else {
    next = references.beginLibrary(result.content.id);
    phrase.openDraft(next.draftId);
  }
  const continuationReferences = references;
  function refreshSelection(): PhraseSaveSelection | undefined {
    if (!next || !selection || !selectedLocations) return undefined;
    const locations = continuationReferences.locations(next.draftId);
    return { ids: locations.locations.filter(location => selectedLocations.has(locationKey(location))).map(location => location.id),
      token: locations.token, ...(selection.reuseIfAllSelected ? { reuseIfAllSelected: true } : {}) };
  }
  const nextSelection = refreshSelection();
  return complete({ id: result.content.id, ...(next ? { session: next } : {}), ...(nextSelection ? { selection: nextSelection } : {}) }, refreshSelection);

  function complete(continuation: PhraseSaveContinuation, refresh?: () => PhraseSaveSelection | undefined): PhraseSaveContinuation {
    options.onContinuation?.(continuation);
    options.onKeep?.([continuation.id]);
    // Retaining a newly forked source can persist project membership, changing
    // the token after the editor has already adopted its valid continuation.
    const updated = refresh?.();
    if (updated) {
      continuation.selection = updated;
      options.onContinuation?.(continuation);
    }
    return continuation;
  }
}
