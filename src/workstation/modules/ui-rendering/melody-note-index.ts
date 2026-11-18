import type { PhraseBody, PhraseNote, PhrasePart } from '../../contracts/phrase.ts';
import { phraseBeatSeconds, phraseHeldSeconds } from '../../contracts/phrase-time.ts';

export type IndexedMelodyNote = { voice: PhrasePart; note: PhraseNote; start: number; end: number };

type TimedNote = IndexedMelodyNote & { order: number };
type Interval = { entry: TimedNote; left?: Interval; right?: Interval; height: number; maxEnd: number };

const compare = (a: TimedNote, b: TimedNote) => a.start - b.start || a.order - b.order;
const height = (node?: Interval) => node?.height ?? 0;

function update(node: Interval): Interval {
  node.height = 1 + Math.max(height(node.left), height(node.right));
  node.maxEnd = Math.max(node.entry.end, node.left?.maxEnd ?? -Infinity, node.right?.maxEnd ?? -Infinity);
  return node;
}
function rotateLeft(node: Interval): Interval {
  const root = node.right!;
  node.right = root.left; root.left = update(node);
  return update(root);
}
function rotateRight(node: Interval): Interval {
  const root = node.left!;
  node.left = root.right; root.right = update(node);
  return update(root);
}
function balance(node: Interval): Interval {
  const left = node.left, right = node.right;
  if (left && height(left) > height(right) + 1) {
    if (height(left.right) > height(left.left)) node.left = rotateLeft(left);
    return rotateRight(node);
  }
  if (right && height(right) > height(left) + 1) {
    if (height(right.left) > height(right.right)) node.right = rotateRight(right);
    return rotateLeft(node);
  }
  return update(node);
}
function insert(node: Interval | undefined, entry: TimedNote): Interval {
  if (!node) return { entry, height: 1, maxEnd: entry.end };
  if (compare(entry, node.entry) < 0) node.left = insert(node.left, entry);
  else node.right = insert(node.right, entry);
  return balance(node);
}
function remove(node: Interval | undefined, entry: TimedNote): Interval | undefined {
  if (!node) return;
  const order = compare(entry, node.entry);
  if (order < 0) node.left = remove(node.left, entry);
  else if (order > 0) node.right = remove(node.right, entry);
  else {
    if (!node.left) return node.right;
    if (!node.right) return node.left;
    let successor = node.right;
    while (successor.left) successor = successor.left;
    node.entry = successor.entry; node.right = remove(node.right, successor.entry);
  }
  return balance(node);
}

/** Interval lookup: scrolling visits visible notes, not every note in a song. */
export function createMelodyNoteIndex(body: PhraseBody, parts: readonly PhrasePart[]) {
  const byId = new Map<string, TimedNote>();
  const entries: TimedNote[] = [];
  let order = 0;
  function timed(value: PhraseBody, voice: PhrasePart, note: PhraseNote, rank: number): TimedNote {
    const start = phraseBeatSeconds(value, note.startBeat);
    return { voice, note, start, end: start + phraseHeldSeconds(value, note), order: rank };
  }
  for (const voice of parts) for (const note of voice.notes) {
    const entry = timed(body, voice, note, order++);
    entries.push(entry); byId.set(note.id, entry);
  }
  entries.sort(compare);
  function build(first: number, last: number): Interval | undefined {
    if (first === last) return;
    const middle = (first + last) >>> 1;
    return update({ entry: entries[middle]!, left: build(first, middle), right: build(middle + 1, last), height: 0, maxEnd: 0 });
  }
  let root = build(0, entries.length);
  let previous: readonly IndexedMelodyNote[] = [];
  function scan(start: number, end: number, onsets: boolean): IndexedMelodyNote[] {
    const found: IndexedMelodyNote[] = [];
    function visit(node?: Interval): void {
      if (!node || node.maxEnd < start) return;
      const item = node.entry;
      if (!onsets || item.start >= start) visit(node.left);
      if (item.start > end) return;
      if ((onsets ? item.start : item.end) >= start) found.push(item);
      visit(node.right);
    }
    visit(root);
    return found;
  }
  return {
    byId,
    replace(value: PhraseBody, id: string, voice?: PhrasePart, note?: PhraseNote): boolean {
      const before = byId.get(id);
      if (before) root = remove(root, before);
      if (voice && note) {
        const entry = timed(value, voice, note, before?.order ?? order++);
        root = insert(root, entry);
        byId.set(id, entry);
      } else byId.delete(id);
      return true;
    },
    startingBetween(start: number, end: number): readonly IndexedMelodyNote[] {
      const found = scan(start, end, true);
      if (previous.length !== found.length || found.some((item, index) => item !== previous[index])) previous = found;
      return previous;
    },
    visible(start: number, end: number): IndexedMelodyNote[] { return scan(start, end, false); },
  };
}

/** Flip at the bottom edge, placing the head at the top, including the last page. */
export function melodyFollowTarget(seconds: number, start: number, span: number, duration: number, edgeSeconds = 0): number | undefined {
  if (span <= 0 || duration <= span) return;
  if (seconds >= start && seconds < start + span - edgeSeconds) return;
  const target = Math.max(0, Math.min(duration, seconds));
  return Math.abs(target - start) > 1e-8 ? target : undefined;
}
