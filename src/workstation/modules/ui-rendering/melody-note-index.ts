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
  // A prefix maximum cannot skip short notes after one very long sustain.
  // Store maxima per subtree so an overlap query can prune those ranges too.
  let size = 1; while (size < entries.length) size *= 2;
  const maximumEnds = new Float64Array(size * 2).fill(-Infinity);
  for (let i = 0; i < entries.length; i++) maximumEnds[size + i] = entries[i]!.end;
  for (let i = size - 1; i > 0; i--) maximumEnds[i] = Math.max(maximumEnds[i * 2]!, maximumEnds[i * 2 + 1]!);
  return { byId, startingBetween(start: number, end: number): IndexedMelodyNote[] {
    let low = 0, high = entries.length;
    while (low < high) { const mid = (low + high) >>> 1; if (entries[mid]!.start < start) low = mid + 1; else high = mid; }
    const result: IndexedMelodyNote[] = [];
    for (let i = low; i < entries.length && entries[i]!.start <= end; i++) result.push(entries[i]!);
    return result;
  }, visible(start: number, end: number): IndexedMelodyNote[] {
    const result: IndexedMelodyNote[] = [];
    function visit(node: number, left: number, right: number): void {
      if (left >= entries.length || maximumEnds[node]! < start || entries[left]!.start > end) return;
      if (right - left === 1) { result.push(entries[left]!); return; }
      const middle = (left + right) >>> 1;
      visit(node * 2, left, middle); visit(node * 2 + 1, middle, right);
    }
    visit(1, 0, size);
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
