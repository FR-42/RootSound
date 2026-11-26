const paths = {
  score: 'M5 5h14v14H5zM5 10h14M10 5v5m4-5v5M8 13.5h4m0 2.5h4',
  musicLibrary: 'M4 17V5a2 2 0 0 1 2-2h10M7 6h12v15H7zM14 15v-5l2 .8M14 15a1.6 1.15 0 1 1-3.2 0 1.6 1.15 0 0 1 3.2 0z',
  note: 'M14 16V5l4 1.5M14 16a2.75 1.8 0 1 1-5.5 0 2.75 1.8 0 0 1 5.5 0z',
  plus: 'M12 5v14M5 12h14',
  back: 'M19 12H5m6-6-6 6 6 6',
  metronome: 'M5 20 9 4h6l4 16H5zM8 17h8M12 14l6-5M16 9l1.5 2.5',
  details: 'M12 4Q13.8 10.2 20 12Q13.8 13.8 12 20Q10.2 13.8 4 12Q10.2 10.2 12 4Z',
  folder: 'M3 7V5h6l2.5 2.5H21V19H3zM3 9h18',
  folderPlus: 'M3 7V5h6l2.5 2.5H21V19H3zM12 10v6m-3-3h6',
  projectPlus: 'M6 3.5h8l4 4V20H6zM14 3.5V8h4M12 10.5v6m-3-3h6',
  rename: 'M5 15.5 15.8 4.7a1.5 1.5 0 0 1 2.1 0l1.4 1.4a1.5 1.5 0 0 1 0 2.1L8.5 19H5zM14 6.5l3.5 3.5',
  trash: 'M4.5 7h15m-12 0 1 13h7l1-13M9 7V4h6v3m-4.5 3v7m3-7v7',
};

export function libraryIcon(kind: keyof typeof paths): SVGSVGElement {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', paths[kind]);
  path.setAttribute('fill', 'none');
  path.setAttribute('stroke', 'currentColor');
  path.setAttribute('stroke-width', '1.5');
  path.setAttribute('stroke-linecap', 'round');
  path.setAttribute('stroke-linejoin', 'round');
  svg.append(path);
  return svg;
}
