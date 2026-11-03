import type { PhraseBody, PhraseNote, PhrasePart } from '../../contracts/phrase.ts';
import { phraseBeatSeconds, phraseHeldSeconds } from '../../contracts/phrase-time.ts';

export type IndexedMelodyNote = { voice: PhrasePart; note: PhraseNote; start: number; end: number };

/** Interval lookup: scrolling visits visible notes, not every note in a song. */
export function createMelodyNoteIndex(body: PhraseBody, parts: readonly PhrasePart[]) {
  const entries: IndexedMelodyNote[] = [];
  const byId = new Map<string, IndexedMelodyNote>();
  for (const voice of parts) for (const note of voice.notes) {
    const start = phraseBeatSeconds(body, note.startBeat);
    const entry = { voice, note, start, end: start + phraseHeldSeconds(body, note) };
    entries.push(entry); byId.set(note.id, entry);
  }
  entries.sort((a, b) => a.start - b.start);
  const maximumEnds: number[] = []; let maximum = -Infinity;
  for (const entry of entries) { maximum = Math.max(maximum, entry.end); maximumEnds.push(maximum); }
  return { byId, visible(start: number, end: number): IndexedMelodyNote[] {
    let low = 0, high = entries.length;
    while (low < high) { const mid = (low + high) >>> 1; if (maximumEnds[mid]! < start) low = mid + 1; else high = mid; }
    const result: IndexedMelodyNote[] = [];
    for (let index = low; index < entries.length && entries[index]!.start <= end; index++) {
      if (entries[index]!.end >= start) result.push(entries[index]!);
    }
    return result;
  } };
}

/** Flip at the bottom edge, placing the head at the top, including the last page. */
export function melodyFollowTarget(seconds: number, start: number, span: number, duration: number, edgeSeconds = 0): number | undefined {
  if (span <= 0 || duration <= span) return;
  if (seconds >= start && seconds < start + span - edgeSeconds) return;
  const target = Math.max(0, Math.min(duration, seconds));
  return Math.abs(target - start) > 1e-8 ? target : undefined;
}
