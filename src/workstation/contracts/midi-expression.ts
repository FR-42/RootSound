/** Channel performance data, independent of a file format, sound bank or editor UI. */
export type MidiExpressionMessage =
  | { type: 'controller'; controller: number; value: number }
  | { type: 'pitch-bend'; value: number }
  | { type: 'channel-pressure'; value: number }
  | { type: 'poly-pressure'; key: number; value: number };
export type MidiExpressionEvent = MidiExpressionMessage & { beat: number; order?: number };
export type MidiExpressionLane = { id: string; events: MidiExpressionEvent[];
  hiddenEvents?: { sectionId: string; event: MidiExpressionEvent }[] };
export type TimedMidiExpressionEvent = MidiExpressionMessage & { atSeconds: number; order?: number };
export type TimedMidiExpressionLane = { id: string; events: TimedMidiExpressionEvent[] };
export const MAX_MIDI_EXPRESSION_EVENTS = 200000;

export function readMidiExpressionMessage(raw: Record<string, unknown>): MidiExpressionMessage {
  function integer(value: unknown, maximum: number): number {
    if (typeof value !== 'number' || !Number.isInteger(value) || value < 0 || value > maximum) throw new Error('MIDI 演奏数值无效。');
    return value;
  }
  const value = integer(raw.value, raw.type === 'pitch-bend' ? 16383 : 127);
  if (raw.type === 'controller') return { type: 'controller', controller: integer(raw.controller, 127), value };
  if (raw.type === 'pitch-bend' || raw.type === 'channel-pressure') return { type: raw.type, value };
  if (raw.type === 'poly-pressure') return { type: 'poly-pressure', key: integer(raw.key, 127), value };
  throw new Error('未知的 MIDI 演奏事件。');
}

export type PedalNote = { id: string; start: number; end: number; onOrder?: number; offOrder?: number };
export type PedalGate = { keyEnd: number; soundEnd: number };
/** CC64 holds released keys; CC66 captures only the keys down when it is pressed. */
export function pedalGates(notes: readonly PedalNote[], events: readonly (MidiExpressionMessage & { at: number; order?: number })[], end: number): Map<string, PedalGate> {
  type Action = { at: number; order: number } & ({ kind: 'on'; note: PedalNote } | { kind: 'off'; note: PedalNote } | { kind: 'control'; controller: number; value: number });
  const actions: Action[] = notes.flatMap(note => [{ kind: 'on' as const, at: note.start, order: note.onOrder ?? 1, note },
    { kind: 'off' as const, at: note.end, order: note.offOrder ?? -1, note }]);
  for (const event of events) if (event.type === 'controller' && [64, 66, 120, 121, 123].includes(event.controller))
    actions.push({ kind: 'control', at: event.at, order: event.order ?? 0, controller: event.controller, value: event.value });
  actions.sort((a, b) => a.at - b.at || a.order - b.order);
  const gates = new Map(notes.map(note => [note.id, { keyEnd: note.end, soundEnd: note.end }]));
  const down = new Map<string, PedalNote>(), latched = new Set<string>(), waiting = new Map<string, PedalNote>();
  let sustain = false, sostenuto = false;
  function release(at: number) {
    for (const [id] of waiting) if (!sostenuto || !latched.has(id)) {
      const gate = gates.get(id)!; if (latched.has(id)) gate.keyEnd = Math.max(gate.keyEnd, at);
      if (!sustain) { gate.soundEnd = Math.max(gate.soundEnd, at); waiting.delete(id); }
    }
  }
  for (const action of actions) {
    if (action.kind === 'on') down.set(action.note.id, action.note);
    else if (action.kind === 'off') {
      if (!down.delete(action.note.id)) continue;
      if (sustain || sostenuto && latched.has(action.note.id)) waiting.set(action.note.id, action.note);
    } else {
      if (action.controller === 64) { sustain = action.value >= 64; if (!sustain) release(action.at); }
      else if (action.controller === 66) {
        const next = action.value >= 64;
        if (next && !sostenuto) for (const id of down.keys()) latched.add(id);
        sostenuto = next;
        if (!next) { release(action.at); latched.clear(); }
      } else if (action.controller === 120) {
        for (const id of new Set([...down.keys(), ...waiting.keys()])) { const gate = gates.get(id)!; gate.keyEnd = gate.soundEnd = action.at; }
        down.clear(); waiting.clear(); latched.clear();
      } else if (action.controller === 121) { sustain = sostenuto = false; release(action.at); latched.clear(); }
      else if (action.controller === 123) {
        for (const [id, note] of down) {
          gates.get(id)!.keyEnd = action.at;
          if (sustain || sostenuto && latched.has(id)) waiting.set(id, note); else gates.get(id)!.soundEnd = action.at;
        }
        down.clear();
      }
    }
  }
  for (const [id] of waiting) { const gate = gates.get(id)!; if (latched.has(id)) gate.keyEnd = Math.max(gate.keyEnd, end); gate.soundEnd = Math.max(gate.soundEnd, end); }
  return gates;
}
