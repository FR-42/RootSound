import { phraseNotePan, type PhraseBody, type PhraseEditorPort, type PhraseNote, type PhraseView } from '../../contracts/phrase.ts';
import { phraseExpression, phrasePartTouch } from '../../contracts/phrase-expression.ts';
import { MIN_NOTE_SECONDS } from '../../contracts/phrase-limits.ts';
import { phraseBeatSeconds, phraseDurationSeconds, phraseGainTimeline, phraseHeldSeconds } from '../../contracts/phrase-time.ts';
import type { SoundPlan, SoundRuntimePort } from '../../contracts/sound.ts';
import { defaultInstrumentInfo } from '../timbre/instrument-catalog.ts';

/** A short-note lane has its own request lifetime, separate from the transport. */
export function createPhraseAudition(
  phrase: Pick<PhraseEditorPort, 'read' | 'previewNotePlan' | 'previewTimbrePlan' | 'previewPianoPlan'>,
  sound: Pick<SoundRuntimePort, 'audition' | 'cancelAudition'>,
  currentPart: () => string | undefined,
  onError: (message: string) => void,
  preserveNoteLevel = false,
): { request(frequencyHz: number, holdSeconds?: number, velocity?: number, ready?: void | Promise<void>, level?: number, partId?: string): Promise<void>; requestNote(partId: string, note: PhraseNote, body: PhraseBody, ready?: void | Promise<void>): Promise<void>; requestKeyboard(frequencyHz: number): Promise<void>; requestTimbre(id: string): Promise<void>; sync(snapshot?: Pick<PhraseView, 'draft' | 'body'>): void; cancel(): void } {
  let generation = 0;
  let scope = '';
  function currentScope(view: Pick<PhraseView, 'draft' | 'body'> = phrase.read(), partId = currentPart()): string {
    const part = view.body?.parts.find(item => item.id === partId);
    return view.draft && part && !part.unassigned ? JSON.stringify([view.draft.id, part.id, part.timbreId]) : '';
  }
  function cancel(): void { generation++; sound.cancelAudition(); }
  const midiGates = new WeakMap<PhraseBody, ReturnType<typeof phraseExpression>['gates']>();
  async function play(input: SoundPlan['note'], options: { partId?: string; ready?: void | Promise<void>; level?: number; note?: PhraseNote; held?: number }): Promise<void> {
    const { partId = currentPart(), ready, level = 1, note, held } = options;
    cancel(); const initial = phrase.read(); scope = currentScope(initial);
    const expected = currentScope(initial, partId);
    if (!partId || !expected) return;
    const voice = initial.body!.parts.find(item => item.id === partId)!;
    const request = generation; const expectedSelection = scope;
    const stillCurrent = () => {
      if (generation !== request) return false;
      const view = phrase.read();
      return currentScope(view) === expectedSelection && currentScope(view, partId) === expected;
    };
    try {
      const preparation = phrase.previewNotePlan(partId, input);
      // Observe both promises immediately; a rejected transport barrier must
      // not become unhandled while a sampled tone is still being prepared.
      const plan = ready === undefined ? await preparation : (await Promise.all([preparation, ready]))[0];
      if (!stillCurrent()) return;
      const gain = level * (voice.level ?? 1);
      const soundPlan = gain === 1 ? plan : { ...plan, level: plan.level * gain };
      const output = held === undefined ? soundPlan : { ...soundPlan, note: { ...soundPlan.note, holdSeconds: held } };
      const gainCurve = note && voice.gainCurve?.length ? phraseGainTimeline(initial.body!, voice.gainCurve) : undefined;
      const pitchCurve = note && voice.performanceCurves?.pitch?.length ? phraseGainTimeline(initial.body!, voice.performanceCurves.pitch) : undefined;
      await sound.audition(output, note ? { pan: phraseNotePan(voice, note), preserveNoteLevel: true,
        ...(gainCurve ? { gainCurve } : {}), ...(pitchCurve ? { pitchCurve } : {}),
        ...(gainCurve || pitchCurve ? { gainCurveStartSeconds: phraseBeatSeconds(initial.body!, note.startBeat) } : {}) } : undefined);
    } catch (error) {
      if (stillCurrent()) onError(`试音暂不可用：${error instanceof Error ? error.message : String(error)}`);
    }
  }
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
    request(frequencyHz, holdSeconds = .35, velocity = .75, ready, level, partId) {
      return play({ frequencyHz, holdSeconds: Math.max(.01, Math.min(.75, holdSeconds)), velocity }, { partId, ready, level });
    },
    requestNote(partId, note, body, ready) {
      const duration = phraseHeldSeconds(body, note);
      if (!preserveNoteLevel) return this.request(note.frequencyHz, duration, note.velocity, ready, note.level, partId);
      const at = phraseBeatSeconds(body, note.startBeat);
      let performed = duration;
      const part = body.parts.find(voice => voice.id === partId);
      if (body.midiExpression?.length || part?.performanceCurves) {
        let gates = midiGates.get(body);
        if (!gates) { gates = phraseExpression(body).gates; midiGates.set(body, gates); }
        const gate = gates.get(note.id);
        if (gate) performed = gate.soundEnd - at;
      }
      const holdSeconds = Math.max(MIN_NOTE_SECONDS, Math.min(120, duration));
      const held = Math.max(MIN_NOTE_SECONDS, Math.min(120, performed, phraseDurationSeconds(body) - at));
      return play({ frequencyHz: note.frequencyHz, holdSeconds, velocity: part ? phrasePartTouch(body, part)(note) : note.velocity },
        { partId, ready, level: note.level, note, held: held === holdSeconds ? undefined : held });
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
