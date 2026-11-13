import {phraseExpression} from '../../contracts/phrase-expression.ts';
import type { PhraseBody } from '../../contracts/phrase.ts';
import { phraseBarBeats, phraseBeatSeconds, phraseDurationSeconds, phraseHeldSeconds, phraseSecondsBeat, phraseTempoSpanAtBeat } from '../../contracts/phrase-time.ts';

/** End at the bar containing the final held note, not the empty editable extent. */
export function phraseAuditionExtent(body: PhraseBody, midiEffects=true): { noteEnd: number; barEnd: number; fullEnd: number } {
  const fullEnd = phraseDurationSeconds(body);
  let noteEnd = 0;
  const gates=phraseExpression(body, 1, midiEffects).gates;
  for (const part of body.parts) if (!part.unassigned) for (const note of part.notes) {
    if (note.startBeat < body.lengthBeats) noteEnd = Math.max(noteEnd,
      Math.min(fullEnd, gates.get(note.id)?.soundEnd ?? phraseBeatSeconds(body, note.startBeat) + phraseHeldSeconds(body, note)));
  }
  const endBeat = phraseSecondsBeat(body, noteEnd);
  const span = phraseTempoSpanAtBeat(body, Math.max(0, endBeat - 1e-8));
  const origin = span.startBeat - (span.gridOffsetBeats ?? 0) + (span.startBeat === 0 ? body.pickupBeats ?? 0 : 0);
  const beats = phraseBarBeats(body);
  const boundary = origin + Math.max(endBeat === 0 && origin <= 0 ? 1 : 0, Math.ceil((endBeat - origin - 1e-8) / beats)) * beats;
  const barEnd = phraseBeatSeconds(body, Math.min(span.endBeat, body.lengthBeats, boundary));
  return { noteEnd, barEnd, fullEnd };
}
