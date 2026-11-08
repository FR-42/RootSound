import type { PhraseEditorPort, PhraseView } from '../../contracts/phrase.ts';
import type { SoundRuntimePort } from '../../contracts/sound.ts';
import { defaultInstrumentInfo } from '../timbre/instrument-catalog.ts';

/** A short-note lane has its own request lifetime, separate from the transport. */
export function createPhraseAudition(
  phrase: Pick<PhraseEditorPort, 'read' | 'previewNotePlan' | 'previewTimbrePlan' | 'previewPianoPlan'>,
  sound: Pick<SoundRuntimePort, 'audition' | 'cancelAudition'>,
  currentPart: () => string | undefined,
  onError: (message: string) => void,
): { request(frequencyHz: number, holdSeconds?: number, velocity?: number, ready?: void | Promise<void>, level?: number, partId?: string): Promise<void>; requestKeyboard(frequencyHz: number): Promise<void>; requestTimbre(id: string): Promise<void>; sync(snapshot?: Pick<PhraseView, 'draft' | 'body'>): void; cancel(): void } {
  let generation = 0;
  let scope = '';
  function currentScope(view: Pick<PhraseView, 'draft' | 'body'> = phrase.read(), partId = currentPart()): string {
    const part = view.body?.parts.find(item => item.id === partId);
    return view.draft && part && !part.unassigned ? JSON.stringify([view.draft.id, part.id, part.timbreId]) : '';
  }
  function cancel(): void { generation++; sound.cancelAudition(); }
  return {
    async requestKeyboard(frequencyHz) {
      if (currentScope()) return this.request(frequencyHz);
      cancel(); const initial = phrase.read(), draftId = initial.draft?.id;
      scope = currentScope(initial); const expected = scope, request = generation;
      if (!draftId) return;
      try {
        const plan = await phrase.previewPianoPlan({ frequencyHz, holdSeconds: .35, velocity: .75 });
        if (request !== generation || phrase.read().draft?.id !== draftId || currentScope() !== expected) return;
        await sound.audition(plan);
      } catch (error) {
        if (request === generation && phrase.read().draft?.id === draftId && currentScope() === expected)
          onError(`试音暂不可用：${error instanceof Error ? error.message : String(error)}`);
      }
    },
    async request(frequencyHz, holdSeconds = 0.35, velocity = 0.75, ready, level = 1, partId = currentPart()) {
      cancel(); const initial = phrase.read(); scope = currentScope(initial);
      const expected = currentScope(initial, partId);
      if (!partId || !expected) return;
      const request = generation; const expectedSelection = scope;
      const stillCurrent = () => {
        if (generation !== request) return false;
        const view = phrase.read();
        return currentScope(view) === expectedSelection && currentScope(view, partId) === expected;
      };
      try {
        const preparation = phrase.previewNotePlan(partId, { frequencyHz,
          holdSeconds: Math.max(0.01, Math.min(0.75, holdSeconds)), velocity });
        // Observe both promises immediately; a rejected transport barrier must
        // not become unhandled while a sampled tone is still being prepared.
        const plan = ready === undefined ? await preparation : (await Promise.all([preparation, ready]))[0];
        if (!stillCurrent()) return;
        await sound.audition(level === 1 ? plan : { ...plan, level: plan.level * level });
      } catch (error) {
        if (stillCurrent()) {
          onError(`试音暂不可用：${error instanceof Error ? error.message : String(error)}`);
        }
      }
    },
    async requestTimbre(id) {
      cancel(); const initial = phrase.read(); scope = currentScope(initial); const expected = scope; const draftId = initial.draft?.id;
      if (!draftId) return; const request = generation;
      try {
        const info = defaultInstrumentInfo(id);
        const holdSeconds = info?.key.includes('pad') ? 1.7 : info?.category === '弦乐' || info?.category === '人声' ? 1 : .55;
        const plan = await phrase.previewTimbrePlan(id, { frequencyHz: 440 * 2 ** (((info?.midi ?? 60) - 69) / 12), holdSeconds, velocity: .75 });
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
