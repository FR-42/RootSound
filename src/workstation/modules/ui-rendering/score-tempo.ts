import type { PhraseBody } from '../../contracts/phrase.ts';
import { phraseBeatSeconds, phraseTempoSpans } from '../../contracts/phrase-time.ts';

export function estimateScoreTempo(body: PhraseBody, sectionId?: string): number | undefined {
  const span = phraseTempoSpans(body).find(item => item.id === sectionId);
  if (!span) return;
  const starts = body.parts.flatMap(part => part.notes
    .filter(note => note.startBeat >= span.startBeat && note.startBeat < span.endBeat)
    .map(note => phraseBeatSeconds(body, note.startBeat))).sort((a, b) => a - b);
  const onsets: number[] = [];
  for (const start of starts)
    if (!onsets.length || start - onsets.at(-1)! >= .025) onsets.push(start);
  if (onsets.length < 5 || onsets.at(-1)! - onsets[0]! < 1.2) return;

  const minimum = 40, maximum = 300;
  const votes = new Float64Array(maximum + 1);
  const pulses = new Float64Array(maximum + 1);
  const periods = [[.5, .35], [1, 1], [2, .58], [3, .34], [4, .24]] as const;
  const stride = Math.max(1, Math.ceil(onsets.length / 1600));
  let observed = 0;
  for (let index = 0; index < onsets.length - 1; index += stride) {
    for (let lag = 1; lag <= 4 && index + lag < onsets.length; lag++) {
      const delta = onsets[index + lag]! - onsets[index]!;
      if (delta > 4) break;
      if (delta < .09) continue;
      if (lag === 1) observed++;
      for (const [beats, weight] of periods) {
        const bpm = 60 * beats / delta;
        if (bpm < minimum || bpm > maximum) continue;
        const width = Math.max(1, Math.round(bpm * .025));
        for (let key = Math.max(minimum, Math.ceil(bpm - width)); key <= Math.min(maximum, Math.floor(bpm + width)); key++) {
          const match = 1 - Math.abs(key - bpm) / (width + 1);
          votes[key]! += weight * match / lag;
          if (beats === 1) pulses[key]! += match;
        }
      }
    }
  }
  if (observed < 4) return;
  for (let bpm = minimum; bpm <= maximum; bpm++) votes[bpm]! *= .55 + .45 * Math.min(1, pulses[bpm]! / observed);
  let best = minimum;
  for (let bpm = minimum + 1; bpm <= maximum; bpm++) if (votes[bpm]! > votes[best]!) best = bpm;
  if (votes[best]! < observed * .38) return;
  for (let bpm = minimum; bpm <= maximum; bpm++) {
    if (Math.abs(best - bpm) <= Math.max(4, best * .055)) continue;
    if (votes[bpm]! >= votes[best]! * .86) return;
  }
  return best;
}
