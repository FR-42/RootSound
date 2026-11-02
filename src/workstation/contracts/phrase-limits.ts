import { MAX_SEQUENCE_EVENTS } from './playback-limits.ts';

/** Editing budgets shared by phrase validation, MIDI conversion and the UI. */
export const MAX_PHRASE_BEATS = 1024;
export const MAX_PHRASE_NOTES = MAX_SEQUENCE_EVENTS;
export const MIN_NOTE_BEATS = .000001;
export const MIN_NOTE_SECONDS = .0001;
