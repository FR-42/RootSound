import type { SongBody } from '../../contracts/song.ts';

/** This clock describes background lines only, never sound scheduling. */
export type SongGrid = Pick<SongBody, 'tempoBpm' | 'gridTempoBpm' | 'gridTempoChanges' | 'gridOffsetSeconds'>;
export type SongGridSegment = { atSeconds: number; endSeconds: number; tempoBpm: number; offsetSeconds: number };

export function songGridTempoAt(grid: SongGrid, seconds: number): number {
  let tempo = grid.gridTempoBpm ?? grid.tempoBpm;
  for (const change of grid.gridTempoChanges ?? []) {
    if (change.atSeconds > seconds) break;
    tempo = change.tempoBpm;
  }
  return tempo;
}

/** Boundary belongs to its new segment; the preceding section is strictly before it. */
export function songGridSegments(grid: SongGrid): SongGridSegment[] {
  const changes = grid.gridTempoChanges ?? [];
  const starts = [{ atSeconds: 0, tempoBpm: grid.gridTempoBpm ?? grid.tempoBpm,
    offsetSeconds: grid.gridOffsetSeconds ?? 0 },
  ...changes.map(change => ({ ...change, offsetSeconds: change.atSeconds }))];
  return starts.map((segment, index) => ({ ...segment, endSeconds: starts[index + 1]?.atSeconds ?? Infinity }));
}
