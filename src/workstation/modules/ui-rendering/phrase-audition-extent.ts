import type { PhraseBody } from '../../contracts/phrase.ts';
import { phraseBeatSeconds, phraseDurationSeconds, phraseHeldSeconds, phraseSecondsBeat, phraseTempoSpanAtBeat } from '../../contracts/phrase-time.ts';

/** End at the bar containing the final held note, not the empty editable extent. */
export function phraseAuditionExtent(body: PhraseBody): { noteEnd: number; barEnd: number; fullEnd: number } {
  const fullEnd = phraseDurationSeconds(body);
  let noteEnd = 0;
  for (const part of body.parts) if (!part.unassigned) for (const note of part.notes) {
    if (note.startBeat < body.lengthBeats) noteEnd = Math.max(noteEnd,
      Math.min(fullEnd, phraseBeatSeconds(body, note.startBeat) + phraseHeldSeconds(body, note)));
  }
  const endBeat = phraseSecondsBeat(body, noteEnd);
  const span = phraseTempoSpanAtBeat(body, Math.max(0, endBeat - 1e-8));
  const origin = span.startBeat + (span.startBeat === 0 ? body.pickupBeats ?? 0 : 0);
  const beats = body.beatsPerBar ?? 4;
  const boundary = Math.max(origin || beats, origin + Math.ceil((endBeat - origin - 1e-8) / beats) * beats);
  const barEnd = phraseBeatSeconds(body, Math.min(span.endBeat, body.lengthBeats, boundary));
  return { noteEnd, barEnd, fullEnd };
}
