import type { KeyboardPitch, PhraseBody, PhraseSection } from '../../contracts/phrase.ts';
import { melodyScale, melodySeconds } from './melody-geometry.ts';
import { phrasePitchRow } from './phrase-viewport.ts';

const COLORS = ['#8bb6e8', '#e9a184', '#8ac7b2', '#c0a3e2', '#e4c374', '#89c4d5', '#d89dbb', '#b3c982'];
const orderedKeyboard = (keys: readonly KeyboardPitch[]) => [...keys].sort((left, right) => right.frequencyHz - left.frequencyHz);
const positive = (value: number | undefined, fallback: number) => Number.isFinite(value) && value! > 0 ? value! : fallback;
const nonnegative = (value: number) => Number.isFinite(value) ? Math.max(0, value) : 0;

/** A tone keeps its visual identity across sections, reopening and part order changes. */
export function toneColor(timbreId: string): string {
  let hash = 0;
  for (const character of timbreId) hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  return COLORS[hash % COLORS.length]!;
}

/** One phrase-wide palette, deterministic across departments, reopening and part order. */
export function buildPhraseToneColors(timbreIds: Iterable<string>): Map<string, string> {
  const result = new Map<string, string>(); const used = new Set<number>();
  for (const id of [...new Set(timbreIds)].sort()) {
    let index = COLORS.indexOf(toneColor(id));
    while (used.size < COLORS.length && used.has(index)) index = (index + 1) % COLORS.length;
    used.add(index); result.set(id, COLORS[index]!);
  }
  return result;
}

export type PhraseOverviewNotesView = {
  body?: PhraseBody;
  horizontal: { leftSeconds: number; zoom: number };
  /** Vertical offset belongs to this section only. */
  top: number;
  rowHeight?: number;
  width: number;
  height: number;
};

/** Focus the densest visible melody register without folding or dropping keyboard rows. */
export function centerTop(body: PhraseBody | undefined, keyboard: readonly KeyboardPitch[], height: number, rowHeight = 24, includeAllSections = false): number {
  const keys = orderedKeyboard(keyboard); if (!keys.length) return 0;
  const row = positive(rowHeight, 24); const visibleHeight = nonnegative(height);
  const rows = (body?.parts ?? []).filter(part => includeAllSections || (part.section ?? 'melody') === 'melody')
    .flatMap(part => part.notes.map(note => phrasePitchRow(note.frequencyHz, keys))).sort((left, right) => left - right);
  let centre = phrasePitchRow(440 * 2 ** (-9 / 12), keys);
  if (rows.length) {
    const median = rows[Math.floor(rows.length / 2)]!; const span = Math.max(0, Math.floor(visibleHeight / row) - 1);
    let left = 0; let bestCount = 0; let bestDistance = Infinity;
    for (let right = 0; right < rows.length; right++) {
      while (rows[right]! - rows[left]! > span) left++;
      const count = right - left + 1; const candidate = (rows[right]! + rows[left]!) / 2; const distance = Math.abs(candidate - median);
      if (count > bestCount || count === bestCount && distance < bestDistance) {
        bestCount = count; bestDistance = distance; centre = candidate;
      }
    }
  }
  return Math.max(0, Math.min(Math.max(0, keys.length * row - visibleHeight), (centre + .5) * row - visibleHeight / 2));
}

/** Read-only preview. The caller owns the snapshot, clocks and both vertical view offsets. */
export function mountPhraseOverviewNotes(root: HTMLElement, section: PhraseSection, keyboard: readonly KeyboardPitch[], options: { includeAllSections?: boolean } = {}) {
  const keys = orderedKeyboard(keyboard);
  const nodes = new Map<string, HTMLElement>(); let disposed = false;
  let coloredBody: PhraseBody | undefined; let toneColors = new Map<string, string>();
  function update(view: PhraseOverviewNotesView): void {
    if (disposed) return;
    if (coloredBody !== view.body) {
      coloredBody = view.body; toneColors = buildPhraseToneColors(view.body?.parts.map(part => part.timbreId) ?? []);
    }
    const width = nonnegative(view.width); const height = nonnegative(view.height);
    const rowHeight = positive(view.rowHeight, section === 'rhythm' ? 72 : 24);
    const leftSeconds = nonnegative(view.horizontal.leftSeconds); const top = nonnegative(view.top);
    const scale = melodyScale({ leftSeconds, zoom: positive(view.horizontal.zoom, 1), rowHeight }, width, 0);
    const parts = (view.body?.parts ?? []).filter(part => (section === 'melody' && options.includeAllSections) || (part.section ?? 'melody') === section);
    const alive = new Set<string>(); const visible = new Set<string>();
    for (const [partRow, part] of parts.entries()) for (const note of part.notes) {
      const id = JSON.stringify([part.id, note.id]); alive.add(id);
      if (!view.body || !width || !height || note.startBeat >= view.body.lengthBeats) continue;
      const x = (melodySeconds(note.startBeat, view.body.tempoBpm) - leftSeconds) * scale;
      const duration = note.durationSeconds ?? melodySeconds(note.durationBeats, view.body.tempoBpm);
      const inset = Math.min(section === 'rhythm' ? 7 : 1, rowHeight / 4);
      const y = (section === 'rhythm' ? partRow : phrasePitchRow(note.frequencyHz, keys)) * rowHeight + inset - top;
      const left = Math.max(0, x); const right = Math.min(width, x + duration * scale);
      const upper = Math.max(0, y); const lower = Math.min(height, y + rowHeight - inset * 2);
      if (right <= left || lower <= upper) continue;
      visible.add(id); let element = nodes.get(id);
      if (!element) {
        element = document.createElement('div'); element.className = 'phrase-overview-note';
        element.dataset.partId = part.id; element.dataset.noteId = note.id; element.setAttribute('aria-hidden', 'true');
        nodes.set(id, element);
      }
      element.classList.toggle('is-unassigned', !!part.unassigned);
      element.style.left = left + 'px'; element.style.top = upper + 'px';
      element.style.width = (right - left) + 'px'; element.style.height = (lower - upper) + 'px';
      element.style.backgroundColor = part.unassigned ? '#b6bcc4' : toneColors.get(part.timbreId) ?? toneColor(part.timbreId);
      if (element.parentElement !== root) root.append(element);
    }
    for (const [id, element] of nodes) {
      if (!visible.has(id)) element.remove();
      if (!alive.has(id)) nodes.delete(id);
    }
  }
  return { update, dispose() {
    if (disposed) return;
    disposed = true;
    for (const element of nodes.values()) element.remove();
    nodes.clear(); toneColors.clear(); coloredBody = undefined;
  } };
}
