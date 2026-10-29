/** Current whole-song budgets, shared by import, composition and execution. */
export const MAX_SEQUENCE_EVENTS = 50_000;
export const MAX_SEQUENCE_SECONDS = 600;
/** Six full-length stereo stems plus residual, retained as bounded PCM. */
export const MAX_SEQUENCE_PCM_BYTES = 512 * 1024 * 1024;
