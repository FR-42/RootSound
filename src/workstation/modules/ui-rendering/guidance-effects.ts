export type GuideRect = { x: number; y: number; width: number; height: number };
export type GuidePoint = { x: number; y: number };
const ns = 'http://www.w3.org/2000/svg';
export function guideRect(node: Element | null, padding = 0): GuideRect | undefined {
  if (!node) return;
  const r = node.getBoundingClientRect();
  if (!r.width || !r.height) return;
  return { x: Math.max(0, r.left - padding), y: Math.max(0, r.top - padding), width: Math.min(innerWidth, r.right + padding) - Math.max(0, r.left - padding), height: Math.min(innerHeight, r.bottom + padding) - Math.max(0, r.top - padding) };
}
export function guideCenter(node: Element | null): GuidePoint | undefined { const r = guideRect(node); return r && { x: r.x + r.width / 2, y: r.y + r.height / 2 }; }

export function createGuidanceEffects(shell: HTMLElement) {
  let lastMouse: GuidePoint | undefined;
  const layer = document.createElement('div'); layer.className = 'guidance-effects';
  const svg = document.createElementNS(ns, 'svg'); svg.setAttribute('aria-hidden', 'true');
  const defs = document.createElementNS(ns, 'defs'), mask = document.createElementNS(ns, 'mask');
  const id = 'guide-mask-' + crypto.randomUUID(); mask.id = id; mask.setAttribute('maskUnits', 'userSpaceOnUse');
  const white = document.createElementNS(ns, 'rect'); white.setAttribute('fill', 'white');
  const holes = document.createElementNS(ns, 'g'); mask.append(white, holes); defs.append(mask);
  const shade = document.createElementNS(ns, 'rect'); shade.setAttribute('fill', '#10212bcc'); shade.setAttribute('mask', `url(#${id})`);
  const drawings = document.createElementNS(ns, 'g'); svg.append(defs, shade, drawings); layer.append(svg); shell.append(layer);
  function shape(tag: 'rect' | 'path' | 'circle' | 'ellipse', attrs: Record<string, string | number>, parent: Element = drawings) {
    const node = document.createElementNS(ns, tag); Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, String(value))); parent.append(node); return node;
  }
  return {
    layer,
    pointer: () => lastMouse,
    begin(targets: GuideRect[], strength = .75) {
      const dialog = shell.querySelector<HTMLDialogElement>('dialog[open]');
      const parent = dialog ?? shell; if (layer.parentElement !== parent) parent.append(layer);
      svg.setAttribute('viewBox', `0 0 ${innerWidth} ${innerHeight}`);
      for (const node of [white, shade]) { node.setAttribute('width', String(innerWidth)); node.setAttribute('height', String(innerHeight)); }
      shade.setAttribute('opacity', String(strength)); holes.replaceChildren(); drawings.replaceChildren();
      targets.forEach(r => {
        if (r.width <= 0 || r.height <= 0) return;
        shape('rect', { ...r, rx: 7, fill: 'black' }, holes);
        shape('rect', { x: r.x - 1, y: r.y - 1, width: r.width + 2, height: r.height + 2, rx: 8, fill: 'none', stroke: '#b6d8cb', 'stroke-width': 1.5 });
      });
    },
    band(r: GuideRect, colour = '#6fb5a0', opacity = .3) { if (r.width > 0 && r.height > 0) shape('rect', { ...r, rx: 3, fill: colour, opacity, stroke: colour, 'stroke-width': 1 }); },
    line(a: GuidePoint, b: GuidePoint, colour = '#b9e0d0', dashed = false) {
      shape('path', { d: `M${a.x},${a.y}L${b.x},${b.y}`, fill: 'none', stroke: colour, 'stroke-width': 2, ...(dashed ? { 'stroke-dasharray': '5 5' } : {}) });
    },
    ring(p: GuidePoint, radius = 20, colour = '#8fcdb8', opacity = .8) { shape('circle', { cx: p.x, cy: p.y, r: radius, fill: 'none', stroke: colour, 'stroke-width': 2.5, opacity }); },
    outline(r: GuideRect | undefined, colour: string, dashed = false) {
      if (!r || r.width <= 0 || r.height <= 0) return;
      shape('rect', { ...r, rx: 3, fill: 'none', stroke: colour, 'stroke-width': 2.5, ...(dashed ? { 'stroke-dasharray': '4 4' } : {}) });
    },
    mouse(p: GuidePoint | undefined, button?: 'left' | 'right' | 'wheel', wheel = 0) {
      if (!p) return;
      lastMouse = p;
      const x = Math.min(innerWidth - 64, Math.max(12, p.x + 23)), y = Math.min(innerHeight - 69, Math.max(12, p.y + 22));
      shape('path', { d: `M${p.x},${p.y}l0 22 6-6 5 10 5-3-5-10h10z`, fill: '#f5fbf8', stroke: '#335b58', 'stroke-width': 1.8 });
      shape('rect', { x, y, width: 38, height: 57, rx: 18, fill: '#f9fbfa', stroke: '#66877e', 'stroke-width': 1.8 });
      const fill = button === 'right' ? '#d96c68' : '#72b39d';
      if (button === 'left' || button === 'right') shape('path', { d: button === 'right' ? `M${x + 20},${y + 2}q16 0 16 18v7h-16z` : `M${x + 18},${y + 2}q-16 0-16 18v7h16z`, fill });
      shape('path', { d: `M${x + 19},${y + 1}v27M${x + 1},${y + 28}h36`, fill: 'none', stroke: '#66877e', 'stroke-width': 1.3 });
      shape('rect', { x: x + 15, y: y + 9, width: 8, height: 14, rx: 4, fill: button === 'wheel' ? '#d6ad60' : '#b8cdc4' });
      if (button === 'wheel') { const offset = 5 * Math.sin(wheel * 8); shape('path', { d: `M${x + 11},${y - 8 + offset}l8-6 8 6M${x + 11},${y + 67 + offset}l8 6 8-6`, fill: 'none', stroke: '#d6ad60', 'stroke-width': 2.5 }); }
    },
    keys(control = false, shift = false, space = false) {
      const x = 26, y = innerHeight - 164;
      shape('rect', { x, y, width: 157, height: 72, rx: 9, fill: '#f5f8f6', stroke: '#c2d3cc' });
      shape('rect', { x: x + 8, y: y + 8, width: 44, height: 23, rx: 4, fill: shift ? '#d6ad60' : '#e3ece7' });
      shape('path', { d: `M${x + 20},${y + 22}v-5h-4l10-8 10 8h-4v5z`, fill: 'none', stroke: '#4a7062', 'stroke-width': 1.3 });
      shape('rect', { x: x + 8, y: y + 39, width: 36, height: 23, rx: 4, fill: control ? '#d6ad60' : '#e3ece7' });
      shape('path', { d: `m${x + 17} ${y + 53} 9-7 9 7`, fill: 'none', stroke: '#4a7062', 'stroke-width': 2 });
      shape('rect', { x: x + 53, y: y + 39, width: 95, height: 23, rx: 4, fill: space ? '#d6ad60' : '#e3ece7' });
      shape('path', { d: `M${x + 69} ${y + 48}v7h62v-7`, fill: 'none', stroke: '#4a7062', 'stroke-width': 1.5 });
      for (let i = 0; i < 3; i++) shape('rect', { x: x + 61 + i * 29, y: y + 8, width: 23, height: 23, rx: 3, fill: '#e3ece7' });
    },
    dispose() { layer.remove(); },
  };
}
