/** Let the operating system's full double-click interval pass before opening a card. */
export function libraryClickDelay(intervalMs?: number): number {
  return typeof intervalMs === 'number' && Number.isFinite(intervalMs) && intervalMs > 0 && intervalMs <= 10000
    ? Math.ceil(intervalMs) + 50 : 600;
}
