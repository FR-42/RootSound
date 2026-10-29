/** Local horizontal overflow navigation; native form controls retain their own wheel meaning. */
export function attachConsoleHorizontalWheel(root: HTMLElement): () => void {
  const wheel = (event: WheelEvent): void => {
    if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey) return;
    const target = event.target instanceof HTMLElement ? event.target : undefined;
    if (target?.closest('input') || target?.closest('select') || target?.closest('textarea') || target?.isContentEditable) return;
    const maximum = root.scrollWidth - root.clientWidth;
    if (!Number.isFinite(maximum) || maximum <= 0) return;
    const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
    if (!delta) return;
    const unit = event.deltaMode === 1 ? 24 : event.deltaMode === 2 ? root.clientWidth : 1;
    const next = Math.max(0, Math.min(maximum, root.scrollLeft + delta * unit));
    if (next === root.scrollLeft) return;
    event.preventDefault(); event.stopPropagation(); root.scrollLeft = next;
  };
  root.addEventListener('wheel', wheel, { passive: false });
  return () => root.removeEventListener('wheel', wheel);
}
