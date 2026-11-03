import type { PhraseBody, PhraseNote } from '../../contracts/phrase.ts';
import { MAX_PHRASE_BEATS, MIN_NOTE_BEATS } from '../../contracts/phrase-limits.ts';
import { phraseHeldSeconds, phraseTempoSpans, phraseTempoSpanAtBeat } from '../../contracts/phrase-time.ts';

/** Resize a roll without deleting its cropped music or moving music within later rolls. */
export function resizeTempoRoll(body: PhraseBody, id: string | undefined, startBeat: number): PhraseBody {
  const sections = body.tempoSections ?? [];
  const index = id === undefined ? sections.length : sections.findIndex(section => section.id === id);
  if (index < 0) throw new Error('这个BPM卷帘已不存在。');
  const previousStart = index ? sections[index - 1]!.startBeat : 0;
  const delta = startBeat - (id === undefined ? body.lengthBeats : sections[index]!.startBeat), lengthBeats = body.lengthBeats + delta;
  if (!Number.isFinite(startBeat) || startBeat < previousStart + (body.beatsPerBar ?? 4) || lengthBeats > MAX_PHRASE_BEATS)
    throw new Error('上一段至少保留一个小节，音乐总长不能超过当前长度范围。');
  if (Math.abs(delta) < 1e-10) return body;
  const next: PhraseBody = { ...body, lengthBeats, ...(sections.length ? { tempoSections: sections.map((section, position) => position < index ? { ...section }
    : { ...section, startBeat: section.startBeat + delta }) } : {}), parts: [] };
  const spans = new Map(phraseTempoSpans(next).map(span => [span.id ?? 'first', span]));
  next.parts = body.parts.map(part => {
    const stored = part.notes.map(note => {
      const span = phraseTempoSpanAtBeat(body, note.startBeat);
      return { sectionId: span.id ?? 'first', note: { ...note, startBeat: note.startBeat - span.startBeat,
        durationSeconds: phraseHeldSeconds(body, note) } };
    });
    stored.push(...(part.hiddenNotes ?? []).map(item => ({ sectionId: item.sectionId, note: { ...item.note, durationSeconds: item.note.durationSeconds! } })));
    const notes: PhraseNote[] = [], hiddenNotes: NonNullable<typeof part.hiddenNotes> = [];
    for (const item of stored) {
      const span = spans.get(item.sectionId); if (!span) throw new Error('被保留的音符缺少所属BPM卷帘。');
      if (item.note.startBeat >= span.endBeat - span.startBeat - MIN_NOTE_BEATS) hiddenNotes.push(item);
      else {
        const start = span.startBeat + item.note.startBeat;
        notes.push({ ...item.note, startBeat: start,
          durationBeats: Math.max(MIN_NOTE_BEATS, Math.min(next.lengthBeats - start, item.note.durationBeats)) });
      }
    }
    notes.sort((a, b) => a.startBeat - b.startBeat);
    const { hiddenNotes: _old, ...rest } = part;
    return { ...rest, notes, ...(hiddenNotes.length ? { hiddenNotes } : {}) };
  });
  return next;
}
