import type { KeyboardPitch } from '../../contracts/phrase.ts';

/** The roll uses descending pitches; non-standard pitches stay exact in storage. */
export function phrasePitchRow(frequency: number, keys: readonly KeyboardPitch[]): number {
  if (!keys.length) return 0;
  return keys.reduce((best, key, index) => Math.abs(Math.log2(key.frequencyHz / frequency))
    < Math.abs(Math.log2(keys[best]!.frequencyHz / frequency)) ? index : best, 0);
}

/** Focus the useful melody area of one continuous keyboard, never a different range. */
export function initialPhraseViewport(frequencies: readonly number[], keys: readonly KeyboardPitch[], viewportHeight = 300) {
  const rowHeight = 25; const rulerHeight = 29;
  const visibleHeight = Math.max(rowHeight, viewportHeight - rulerHeight);
  const maxScroll = Math.max(0, keys.length * rowHeight - visibleHeight);
  if (!keys.length) return { scrollTop: 0 };
  const rows = frequencies.filter(value => Number.isFinite(value) && value > 0)
    .map(value => phrasePitchRow(value, keys)).sort((a, b) => a - b);
  let centre = phrasePitchRow(440 * 2 ** (-9 / 12), keys); // C4 for an empty phrase.
  if (rows.length) {
    const median = rows[Math.floor(rows.length / 2)]!;
    const maxSpan = Math.max(0, Math.floor(visibleHeight / rowHeight) - 1);
    let left = 0; let bestCount = 0; let bestDistance = Infinity;
    for (let right = 0; right < rows.length; right++) {
      while (rows[right]! - rows[left]! > maxSpan) left++;
      const count = right - left + 1;
      const candidate = (rows[right]! + rows[left]!) / 2;
      const distance = Math.abs(candidate - median);
      if (count > bestCount || count === bestCount && distance < bestDistance) {
        bestCount = count; bestDistance = distance; centre = candidate;
      }
    }
  }
  return { scrollTop: Math.max(0, Math.min(maxScroll, centre * rowHeight - (visibleHeight - rowHeight) / 2)) };
}
