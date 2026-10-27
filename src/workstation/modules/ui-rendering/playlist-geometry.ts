import { songGridSegments } from '../song/public.ts';

export type PlaylistViewport = { leftSeconds: number; top: number; pixelsPerSecond: number; rowHeight: number };
export type PlaylistRect = { x: number; y: number; width: number; height: number };
export const PLAYLIST_RULER_HEIGHT = 28;
export const clampPlaylist = (value: number, minimum: number, maximum: number): number => Math.min(maximum, Math.max(minimum, value));
export const playlistSeconds = (beats: number, tempoBpm: number): number => beats * 60 / tempoBpm;
export const playlistBeats = (seconds: number, tempoBpm: number): number => seconds * tempoBpm / 60;

/** Only visible nonnegative lines are materialized; each tempo boundary starts a new bar. */
export function playlistGridLines(left: number, width: number, pixelsPerSecond: number, tempoBpm: number, offsetSeconds = 0,
  changes?: ReadonlyArray<{ atSeconds: number; tempoBpm: number }>): Array<{ seconds: number; x: number; strong: boolean }> {
  left = Math.max(0, left);
  const result: Array<{ seconds: number; x: number; strong: boolean }> = [];
  for (const segment of songGridSegments({ tempoBpm, gridOffsetSeconds: offsetSeconds, gridTempoChanges: changes ? [...changes] : undefined })) {
    if (segment.endSeconds <= left || segment.atSeconds > left + width / pixelsPerSecond) continue;
    const beatSeconds = 60 / segment.tempoBpm;
    let stride = 1;
    while (beatSeconds * pixelsPerSecond * stride < 8) stride *= 2;
    const first = Math.ceil((Math.max(0, left, segment.atSeconds) - segment.offsetSeconds) / (beatSeconds * stride) - 1e-9);
    const last = Math.floor((left + width / pixelsPerSecond - segment.offsetSeconds) / (beatSeconds * stride) + 1e-9);
    for (let step = first; step <= last; step++) {
      const beat = step * stride; const seconds = segment.offsetSeconds + beat * beatSeconds;
      if (seconds < 0 || seconds < segment.atSeconds || seconds >= segment.endSeconds) continue;
      result.push({ seconds, x: (seconds - left) * pixelsPerSecond, strong: beat % 4 === 0 });
    }
  }
  return result;
}

export function playlistTrackAt(y: number, top: number, rowHeight: number, count: number): number | undefined {
  const index = Math.floor((y + top) / rowHeight);
  return y >= 0 && index >= 0 && index < count ? index : undefined;
}

export function playlistClipRect(startSeconds: number, durationSeconds: number, trackIndex: number, view: PlaylistViewport): PlaylistRect {
  return { x: (startSeconds - view.leftSeconds) * view.pixelsPerSecond, y: trackIndex * view.rowHeight - view.top + 4,
    width: durationSeconds * view.pixelsPerSecond, height: view.rowHeight - 8 };
}

/** Pointer-anchored zoom preserves the exact underlying time or track coordinate. */
export function zoomPlaylist(view: PlaylistViewport, x: number, y: number, factor: number, vertical: boolean): PlaylistViewport {
  if (vertical) {
    const rowHeight = clampPlaylist(view.rowHeight * factor, 28, 128);
    return { ...view, rowHeight, top: Math.max(0, (view.top + y) * rowHeight / view.rowHeight - y) };
  }
  const pixelsPerSecond = clampPlaylist(view.pixelsPerSecond * factor, 12, 2560);
  return { ...view, pixelsPerSecond, leftSeconds: Math.max(0, view.leftSeconds + x / view.pixelsPerSecond - x / pixelsPerSecond) };
}

/** Liang–Barsky clipping catches a fast eraser even when no event lands inside a clip. */
export function playlistSegmentIntersectsRect(from: { x: number; y: number }, to: { x: number; y: number }, rect: PlaylistRect): boolean {
  const dx = to.x - from.x; const dy = to.y - from.y;
  let enter = 0; let exit = 1;
  const p = [-dx, dx, -dy, dy];
  const q = [from.x - rect.x, rect.x + rect.width - from.x, from.y - rect.y, rect.y + rect.height - from.y];
  for (let index = 0; index < 4; index++) {
    if (p[index] === 0) { if (q[index]! < 0) return false; continue; }
    const ratio = q[index]! / p[index]!;
    if (p[index]! < 0) enter = Math.max(enter, ratio); else exit = Math.min(exit, ratio);
    if (enter > exit) return false;
  }
  return true;
}

