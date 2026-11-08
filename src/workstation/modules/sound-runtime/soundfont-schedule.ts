import type { TimedMidiExpressionLane, TimedMidiExpressionEvent } from '../../contracts/midi-expression.ts';
import type { SampleSoundPlan } from '../../contracts/sound.ts';

export type FontEvent={atSeconds:number;holdSeconds:number;releaseSeconds:number;level:number;pan:number;font:NonNullable<SampleSoundPlan['soundFont']>};
export type Trigger=({kind:'note';time:number;on:boolean;id:number;event:FontEvent;order:number}|{kind:'expression';time:number;lane:string;event:TimedMidiExpressionEvent;order:number});
export type FontSchedule = readonly Trigger[];
export const compareTriggers = (a: Trigger, b: Trigger) => a.time - b.time || a.order - b.order;
export function fontSchedule(events: readonly FontEvent[], expression: readonly TimedMidiExpressionLane[], firstId = 0): Trigger[] {
  const triggers = events.flatMap((event, index): Trigger[] => [
    { kind: 'note', time: event.atSeconds, on: true, id: firstId + index, event, order: event.font.midiOnOrder ?? 1 },
    { kind: 'note', time: event.atSeconds + (event.font.sostenutoSeconds ?? event.holdSeconds), on: false, id: firstId + index, event, order: event.font.midiOffOrder ?? -1 },
  ]);
  for (const lane of expression) for (const event of lane.events)
    triggers.push({ kind: 'expression', time: event.atSeconds, lane: lane.id, event, order: event.order ?? 0 });
  return triggers.sort(compareTriggers);
}

export type FontSchedulePatch = { removed: number[]; added: FontSchedule; replaceExpression: boolean };

const microseconds = (seconds: number) => Math.round(seconds * 1e6);
function noteKey(event: FontEvent): string {
  const { font } = event;
  return JSON.stringify([
    microseconds(event.atSeconds), microseconds(event.holdSeconds), microseconds(event.releaseSeconds),
    event.level, event.pan, font.bank, font.program, font.key, font.velocity, font.cents, font.drums,
    font.midiChannelId, font.midiOnOrder, font.midiOffOrder,
    font.sostenutoSeconds === undefined ? null : microseconds(font.sostenutoSeconds),
    font.soundingSeconds === undefined ? null : microseconds(font.soundingSeconds),
  ]);
}
function expressionKey(expression: readonly TimedMidiExpressionLane[]): string {
  return JSON.stringify(expression.map(lane => [lane.id, lane.events.map(({ atSeconds, ...event }) =>
    [microseconds(atSeconds), event])]));
}
export function createFontScheduleEditor(events: readonly FontEvent[], expression: readonly TimedMidiExpressionLane[]) {
  function add(index: Map<string, number[]>, key: string, id: number): void {
    const ids = index.get(key);
    if (ids) ids.push(id);
    else index.set(key, [id]);
  }
  let previous = new Map<string, number[]>();
  events.forEach((event, id) => add(previous, noteKey(event), id));
  let nextId = events.length;
  let previousExpression = expressionKey(expression);
  return (events: readonly FontEvent[], expression: readonly TimedMidiExpressionLane[]): FontSchedulePatch | undefined => {
    const next = new Map<string, number[]>();
    const added: FontEvent[] = [];
    for (const event of events) {
      const key = noteKey(event);
      let id = previous.get(key)?.pop();
      if (id === undefined) {
        id = nextId + added.length;
        added.push(event);
      }
      add(next, key, id);
    }
    const removed = [...previous.values()].flat();
    const nextExpression = expressionKey(expression);
    const replaceExpression = previousExpression !== nextExpression;
    const schedule = fontSchedule(added, replaceExpression ? expression : [], nextId);
    nextId += added.length;
    previous = next;
    previousExpression = nextExpression;
    if (!removed.length && !added.length && !replaceExpression) return undefined;
    return { removed, added: schedule, replaceExpression };
  };
}
