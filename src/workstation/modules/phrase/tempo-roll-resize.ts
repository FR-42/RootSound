import type { PhraseBody, PhraseNote } from '../../contracts/phrase.ts';
import { MAX_PHRASE_BEATS, MIN_NOTE_BEATS, MIN_NOTE_SECONDS } from '../../contracts/phrase-limits.ts';
import { phraseBarBeats, phraseBeatSeconds, phraseHeldSeconds, phraseSecondsBeat, phraseTempoBoundary, phraseTempoSpans, phraseTempoSpanAtBeat } from '../../contracts/phrase-time.ts';

function moveTempoBoundary(body: PhraseBody, id: string, startBeat: number, gridOnly: boolean): PhraseBody {
  const { index, upper, lower, ratio, beatShiftPerBeat, minimum, maximum } = phraseTempoBoundary(body, id);
  if (!Number.isFinite(startBeat) || startBeat < minimum - 1e-10 || startBeat > maximum + 1e-10)
    throw new Error('分界线不能越过相邻卷帘或超出音乐长度范围。');
  startBeat = Math.max(minimum, Math.min(maximum, startBeat));
  const delta = startBeat - lower.startBeat;
  if (Math.abs(delta) < 1e-10) return body;

  const bar = phraseBarBeats(body);
  const offset = (lower.gridOffsetBeats ?? 0) + delta * ratio;
  const phase = ((offset % bar) + bar) % bar;
  const shift = delta * beatShiftPerBeat;
  const next: PhraseBody = {
    ...body,
    lengthBeats: Math.min(MAX_PHRASE_BEATS, body.lengthBeats + shift),
    tempoSections: body.tempoSections!.map((section, position) => {
      if (position < index - 1) return section;
      if (position > index - 1) return { ...section, startBeat: section.startBeat + shift };
      const { gridOffsetBeats: _old, ...rest } = section;
      return { ...rest, startBeat, ...(phase > 1e-10 && bar - phase > 1e-10 ? { gridOffsetBeats: phase } : {}) };
    }),
  };
  if (gridOnly || upper.tempoBpm === lower.tempoBpm) return next;

  // The time axis is fixed. Re-express note heads, tails and MIDI controls
  // in the new beat clock so the same positions still play at the same time.
  const unchangedThrough = Math.min(startBeat, lower.startBeat);
  const mapBeat = (beat: number) => beat <= unchangedThrough ? beat
    : beat >= lower.endBeat ? Math.min(next.lengthBeats, beat + shift)
    : phraseSecondsBeat(next, phraseBeatSeconds(body, beat));
  next.parts = body.parts.map(part => ({
    ...part,
    notes: part.notes.map(note => {
      const endBeat = note.startBeat + note.durationBeats;
      if (endBeat <= unchangedThrough) return note;
      const start = mapBeat(note.startBeat);
      if (note.startBeat >= lower.endBeat) return { ...note, startBeat: start };
      const duration = mapBeat(endBeat) - start;
      if (duration >= MIN_NOTE_BEATS) return { ...note, startBeat: start, durationBeats: duration };
      const seconds = phraseHeldSeconds(body, note);
      if (seconds < MIN_NOTE_SECONDS || next.lengthBeats - start < MIN_NOTE_BEATS)
        throw new Error('移动分界线会使极短音符超出当前时值范围。');
      return { ...note, startBeat: start, durationBeats: MIN_NOTE_BEATS, durationSeconds: seconds };
    }),
  }));
  if (body.midiExpression) next.midiExpression = body.midiExpression.map(lane => ({
    ...lane,
    events: lane.events.map(event => ({ ...event, beat: mapBeat(event.beat) })),
  }));
  return next;
}

/** Move an internal boundary, or resize the separate end-of-score handle. */
export function resizeTempoRoll(body: PhraseBody, id: string | undefined, startBeat: number, gridOnly = false): PhraseBody {
  if (id !== undefined) return moveTempoBoundary(body, id, startBeat, gridOnly);
  const sections = body.tempoSections ?? [];
  const previousStart = sections.at(-1)?.startBeat ?? 0;
  const lengthBeats = startBeat;
  if (!Number.isFinite(startBeat) || startBeat < Math.max(.25, previousStart + phraseBarBeats(body)) || lengthBeats > MAX_PHRASE_BEATS)
    throw new Error('上一段至少保留一个小节，音乐总长不能超过当前长度范围。');
  if (Math.abs(lengthBeats - body.lengthBeats) < 1e-10) return body;
  const next: PhraseBody = { ...body, lengthBeats, parts: [] };
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
  if(body.midiExpression)next.midiExpression=body.midiExpression.map(lane=>{
    const stored=lane.events.map(event=>{const span=phraseTempoSpanAtBeat(body,event.beat);return {sectionId:span.id??'first',event:{...event,beat:event.beat-span.startBeat}};});
    stored.push(...(lane.hiddenEvents??[]));
    const events:typeof lane.events=[],hiddenEvents:NonNullable<typeof lane.hiddenEvents>=[];
    for(const item of stored){const span=spans.get(item.sectionId)!;
      if(item.event.beat>=span.endBeat-span.startBeat)hiddenEvents.push(item);
      else events.push({...item.event,beat:span.startBeat+item.event.beat});
    }
    events.sort((a,b)=>a.beat-b.beat||(a.order??0)-(b.order??0));
    return {id:lane.id,events,...(hiddenEvents.length?{hiddenEvents}:{})};
  });
  return next;
}
