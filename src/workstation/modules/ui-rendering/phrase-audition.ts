import type { PhraseEditorPort, PhraseView } from '../../contracts/phrase.ts';
import type { SoundRuntimePort } from '../../contracts/sound.ts';

/** A short-note lane has its own request lifetime, separate from the transport. */
export function createPhraseAudition(
  phrase: Pick<PhraseEditorPort, 'read' | 'previewNotePlan' | 'previewTimbrePlan'>,
  sound: Pick<SoundRuntimePort, 'audition' | 'cancelAudition'>,
  currentPart: () => string | undefined,
  onError: (message: string) => void,
): { request(frequencyHz: number, holdSeconds?: number, velocity?: number, ready?: void | Promise<void>): Promise<void>; requestTimbre(id: string): Promise<void>; sync(snapshot?: Pick<PhraseView, 'draft' | 'body'>): void; cancel(): void } {
  let generation = 0;
  let scope = '';
  function currentScope(view: Pick<PhraseView, 'draft' | 'body'> = phrase.read()): string {
    const part = view.body?.parts.find(item => item.id === currentPart());
    return view.draft && part && !part.unassigned ? JSON.stringify([view.draft.id, part.id, part.timbreId]) : '';
  }
  function cancel(): void { generation++; sound.cancelAudition(); }
  return {
    async request(frequencyHz, holdSeconds = 0.35, velocity = 0.75, ready) {
      cancel(); scope = currentScope();
      const selected = currentPart(); if (!selected || !scope) return;
      const request = generation; const expected = scope;
      try {
        const preparation = phrase.previewNotePlan(selected, { frequencyHz,
          holdSeconds: Math.max(0.01, Math.min(0.75, holdSeconds)), velocity });
        // Observe both promises immediately; a rejected transport barrier must
        // not become unhandled while a sampled tone is still being prepared.
        const plan = ready === undefined ? await preparation : (await Promise.all([preparation, ready]))[0];
        if (generation !== request || currentScope() !== expected) return;
        await sound.audition(plan);
      } catch (error) {
        if (generation === request && currentScope() === expected) {
          onError(`试音暂不可用：${error instanceof Error ? error.message : String(error)}`);
        }
      }
    },
    async requestTimbre(id) {
      cancel(); const initial = phrase.read(); scope = currentScope(initial); const expected = scope; const draftId = initial.draft?.id;
      if (!draftId) return; const request = generation;
      try {
        const plan = await phrase.previewTimbrePlan(id, { frequencyHz: 261.6255653005986, holdSeconds: .35, velocity: .75 });
        if (request !== generation) return;
        const current = phrase.read();
        if (current.draft?.id !== draftId || currentScope(current) !== expected) return;
        await sound.audition(plan);
      } catch (error) {
        if (request === generation) {
          const current = phrase.read();
          if (current.draft?.id === draftId && currentScope(current) === expected)
            onError(`试音暂不可用：${error instanceof Error ? error.message : String(error)}`);
        }
      }
    },
    sync(snapshot) { const next = currentScope(snapshot); if (next !== scope) { cancel(); scope = next; } },
    cancel,
  };
}
