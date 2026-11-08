import type { PhraseBody } from './phrase.ts';
import { phraseBeatSeconds, phraseDurationSeconds, phraseHeldSeconds } from './phrase-time.ts';
import { pedalGates, type PedalNote, type TimedMidiExpressionLane } from './midi-expression.ts';

/** Convert the shared beat clock once; note key gates remain independent of pedals. */
export function phraseExpression(body: PhraseBody, ratio = 1) {
  const end = phraseDurationSeconds(body) * ratio;
  const lanes: TimedMidiExpressionLane[] = (body.midiExpression ?? []).map(lane => ({ id: lane.id,
    events: lane.events.map(({ beat, ...message }) => ({ ...message, atSeconds: phraseBeatSeconds(body, beat) * ratio })) }));
  const gates = new Map<string, { keyEnd: number; soundEnd: number }>();
  const keyOrders = new Map<string, number>();
  const notesByLane = new Map(lanes.map(lane => [lane.id, [] as PedalNote[]]));
  if (notesByLane.size) for (const part of body.parts) if (!part.unassigned) for (const note of part.notes) {
    const channel = note.midiChannelId === undefined ? part.midiChannelId : note.midiChannelId;
    const notes = channel == null ? undefined : notesByLane.get(channel);
    if (!notes) continue;
    const start = phraseBeatSeconds(body, note.startBeat) * ratio;
    notes.push({ id: note.id, start, end: start + (note.durationSeconds ?? phraseHeldSeconds(body, note) * ratio),
      onOrder: note.midiOnOrder, offOrder: note.midiOffOrder });
  }
  for (const lane of lanes) {
    const notes = notesByLane.get(lane.id)!;
    const mapped = pedalGates(notes, lane.events.map(({ atSeconds, ...event }) => ({ ...event, at: atSeconds })), end);
    const releases = new Map(lane.events.filter(event => event.type === 'controller' && (event.controller === 66 && event.value < 64 || event.controller === 121))
      .map(event => [event.atSeconds, (event.order ?? 0) + .1]));
    const originalEnds = new Map(notes.map(note => [note.id, note.end]));
    for (const [id, gate] of mapped) {
      gates.set(id, gate);
      if (gate.keyEnd > originalEnds.get(id)! + 1e-8) keyOrders.set(id, releases.get(gate.keyEnd) ?? Number.MAX_SAFE_INTEGER);
    }
    // A source may finish with a pedal still pressed. Bound its voices at EOF.
    for (const controller of [64, 66]) lane.events.push({ type: 'controller', controller, value: 0, atSeconds: end, order: Number.MAX_SAFE_INTEGER });
    lane.events.sort((a, b) => a.atSeconds - b.atSeconds || (a.order ?? 0) - (b.order ?? 0));
  }
  return { lanes, gates, keyOrders };
}
