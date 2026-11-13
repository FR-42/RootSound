import type { MidiExpressionLane } from '../contracts/midi-expression.ts';
/** Format-neutral performance data. Beats are quarter notes, never screen cells. */
export interface ExchangeNote { id?: string; beat: number; duration: number; pitch: number; velocity: number; level: number; pan: number; midiOnOrder?: number; midiOffOrder?: number }
export interface ExchangePart { id?: string; name: string; program: number; drum?: number; sourceTrack?: number; sourceChannel?: number; sourcePort?: number; midiChannelId?: string; notes: ExchangeNote[] }
export interface ExchangeScore { name: string; length: number; tempos: { beat: number; bpm: number }[]; meter?: { numerator: number; denominator: number }; parts: ExchangePart[]; midiExpression?: MidiExpressionLane[] }
export const musicFileFormat = (name: string) => /\.(?:mid|midi|smf|kar|rmi)$/iu.test(name) ? 'midi' as const
  : /\.mxl$/iu.test(name) ? 'mxl' as const : /\.(?:musicxml|xml)$/iu.test(name) ? 'musicxml' as const
    : /\.rsproject$/iu.test(name) ? 'rsproject' as const : undefined;
export function exchangeSeconds(score: ExchangeScore, beat: number): number {
  let seconds = 0;
  for (let i = 0; i < score.tempos.length; i++) {
    const point = score.tempos[i]!;
    if (beat <= point.beat) break;
    seconds += (Math.min(beat, score.tempos[i + 1]?.beat ?? beat) - point.beat) * 60 / point.bpm;
  }
  return seconds;
}
export function exchangeSignature(score: ExchangeScore): string {
  // Document and note identities survive edits but differ after format conversion.
  return JSON.stringify({ ...score, parts: score.parts.map(part => ({ ...part, id: undefined,
    notes: part.notes.map(note => ({ ...note, id: undefined })) })) });
}
