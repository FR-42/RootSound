import type { PhraseEditorPort } from '../../contracts/phrase.ts';
import type { SoundRuntimePort } from '../../contracts/sound.ts';

/** A short-note lane has its own request lifetime, separate from the transport. */
export function createPhraseAudition(
  phrase: Pick<PhraseEditorPort, 'read' | 'previewNotePlan'>,
  sound: Pick<SoundRuntimePort, 'audition' | 'cancelAudition'>,
  currentPart: () => string | undefined,
  onError: (message: string) => void,
): { request(frequencyHz: number, holdSeconds?: number, velocity?: number): Promise<void>; sync(): void; cancel(): void } {
  let generation = 0;
  let scope = '';
  function currentScope(): string {
    const view = phrase.read(); const part = view.body?.parts.find(item => item.id === currentPart());
    return view.draft && part ? JSON.stringify([view.draft.id, part.id, part.timbreId]) : '';
  }
  function cancel(): void { generation++; sound.cancelAudition(); }
  return {
    async request(frequencyHz, holdSeconds = 0.35, velocity = 0.75) {
      cancel(); scope = currentScope();
      const selected = currentPart(); if (!selected || !scope) return;
      const request = generation; const expected = scope;
      try {
        const plan = await phrase.previewNotePlan(selected, { frequencyHz,
          holdSeconds: Math.max(0.08, Math.min(0.75, holdSeconds)), velocity });
        if (generation !== request || currentScope() !== expected) return;
        await sound.audition(plan);
      } catch (error) {
        if (generation === request && currentScope() === expected) {
          onError(`试音暂不可用：${error instanceof Error ? error.message : String(error)}`);
        }
      }
    },
    sync() { const next = currentScope(); if (next !== scope) { cancel(); scope = next; } },
    cancel,
  };
}
