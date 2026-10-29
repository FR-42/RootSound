/** Bounded Standard MIDI File interchange; channels and programs are zero based. */
export const MAX_MIDI_FILE_BYTES = 10 * 1024 * 1024;
export const MIDI_LIMITS = Object.freeze({ bytes: MAX_MIDI_FILE_BYTES, tracks: 256,
  events: 200_000, notes: 50_000, durationSeconds: 7_200 });

export type MidiTrack = { index: number; name: string };
export type MidiTempo = { tick: number; beat: number; seconds: number; bpm: number };
export type MidiTimeSignature = { tick: number; beat: number; numerator: number; denominator: number };
export type MidiNote = {
  trackIndex: number; channel: number; program: number; pitch: number;
  /** Key-on velocity, channel volume × expression, and channel pan at note start. */
  velocity: number; level: number; pan: number;
  startTick: number; endTick: number; startBeat: number; endBeat: number;
  startSeconds: number; endSeconds: number;
};
export type MidiDocument = {
  format: 0 | 1; division: number; initialTempoBpm: number;
  durationSeconds: number; durationBeats: number;
  tracks: MidiTrack[]; tempos: MidiTempo[]; timeSignatures: MidiTimeSignature[];
  notes: MidiNote[]; warnings: string[];
};
