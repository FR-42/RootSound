import type { PhraseBody, PhraseNote, PhrasePart } from './phrase.ts';
import { phraseBeatSeconds, phraseDurationSeconds, phraseGainTimeline, phraseHeldSeconds } from './phrase-time.ts';
import { gainAtTime, stepGainAtTime } from './gain-curve.ts';
import { pedalGates, type PedalNote, type TimedMidiExpressionLane } from './midi-expression.ts';

/** Convert the shared beat clock once; note key gates remain independent of pedals. */
export function phraseExpression(body: PhraseBody, ratio = 1, includeMidi = true) {
  const end = phraseDurationSeconds(body) * ratio;
  const lanes: TimedMidiExpressionLane[] = (includeMidi ? body.midiExpression ?? [] : []).map(lane => ({ id: lane.id,
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
  for (const part of body.parts) {
    const { sustain, sostenuto } = part.performanceCurves ?? {};
    if (part.unassigned || !sustain?.length && !sostenuto?.length) continue;
    const events = ([[64, sustain], [66, sostenuto]] as const).flatMap(([controller, points]) =>
      (points ?? []).filter(point => point.beat < body.lengthBeats).map(point => ({ type: 'controller' as const,
        controller, value: point.db ? 127 : 0, at: phraseBeatSeconds(body, point.beat) * ratio })));
    const notes = part.notes.map(note => {
      const start = phraseBeatSeconds(body, note.startBeat) * ratio;
      const original = start + (note.durationSeconds ?? phraseHeldSeconds(body, note) * ratio);
      return { id: note.id, start, end: gates.get(note.id)?.soundEnd ?? original, onOrder: note.midiOnOrder, offOrder: note.midiOffOrder };
    });
    for (const [id, gate] of pedalGates(notes, events, end)) gates.set(id, gate);
  }
  return { lanes, gates, keyOrders };
}

export function phrasePartTouch(body: PhraseBody, part: PhrasePart) {
  const velocity = phraseGainTimeline(body, part.performanceCurves?.velocity ?? []);
  const soft = phraseGainTimeline(body, part.performanceCurves?.soft ?? []);
  if (!velocity.length && !soft.length) return (note: PhraseNote) => note.velocity;
  return (note: PhraseNote) => {
    const at = phraseBeatSeconds(body, note.startBeat);
    const offset = gainAtTime(velocity, at) / 100;
    const strength = offset === 0 ? note.velocity : Math.max(1 / 127, Math.min(1, note.velocity + offset));
    const softened = stepGainAtTime(soft, at) ? .84 : 1;
    return strength * softened;
  };
}
