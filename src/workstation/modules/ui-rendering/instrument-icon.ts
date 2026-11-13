const paths: Readonly<Record<string, string>> = {
  'studio-piano': 'M3.5 20V10h3c2.3 0 3.6-1.6 4.7-3.6 1.1-2.1 2.6-3.9 5.1-3.9 2.7 0 4.2 2.3 4.2 5.2 0 5.9-2.4 12.3-7.4 12.3H3.5ZM3.5 15.5h15.1M7 15.5V20m3.5-4.5V20m3.5-4.5v4.4',
  'studio-sax': 'M13 6V5a2.5 2.5 0 0 1 2.5-2.5H18M15.8 6.5v10.2a4.3 4.3 0 0 1-8.6 0V13m5.8-7v10.7a1.5 1.5 0 0 1-3 0V13m-4.5 0h6M16 9h2m-2 3h2m-2 3h1.5',
  'studio-bass': 'M10.6 11.6 15.4 6l2.7 2.3-5.3 6.2m2.6-8.5.9-3.6 3.8-.9 1.1 2.7-3.1 4.1m-7.5 3.3-3-1.4-.5 3.1c-2.5.3-4.3 2-4.3 4.1 0 2.5 2.1 4.1 4.5 4.1 3.7 0 5.7-3.5 5.5-7.1M7 17.6l2.5 1.4m-.7-3.9 2.1 1.2m6.5-13.8.2 1.7m1.7-2.2.2 1.6',
  'studio-guitar': 'M12.6 9.9 17 5l2 1.7-4.4 5.1M17 5l1.3-2.6 2.4.2.3 2.2L19 6.7m-6.4 3.2c-2.3-1.6-4.7-.4-4.7 1.7 0 1.2-.8 1.6-2.2 2-2.4.6-3.3 2.8-2.2 4.8 1.4 2.5 4.5 3.3 6.9 1.7 1-.7 1.7-1.8 1.6-3.2-.1-1.4.3-1.8 1.5-2.1 1.2-.3 1.8-1.6 1.1-3M7 17.7l1.8 1.1m3.3-5.2a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z',
  'studio-violin': 'M12.8 9.6l4.1-4.7 1.7 1.5-4.4 5.2m2.7-6.7 1-2 2.3-.2.3 2-1.9 1.7m-5.8 3.2c-2-1.1-3.6-.5-3.6.9 0 1.2.4 1.6-.4 2.4-.7.8-1.3.4-2.5.8-2.2.8-2.6 3.3-.7 5.2 1.9 1.9 4.5 1.4 5.3-.7.4-1.1 0-1.7.8-2.5.8-.8 1.2-.3 2.4-.4 1.5 0 2.1-1.7.1-3.7M4 10l10 11',
  'studio-viola': 'M10 8.2V4.3l1-1.6h2l1 1.6v3.9m-4 0c-3.2-.6-4.3 1.3-3.4 3.1.6 1.2.8 1.8-.3 3.2-1.7 2.3-.7 5.8 5.7 5.8s7.4-3.5 5.7-5.8c-1.1-1.4-.9-2-.3-3.2.9-1.8-.2-3.7-3.4-3.1M12 7v10m-2 0h4m6-9v12',
  'studio-cello': 'M10.5 8V3.8l.9-1.3h1.2l.9 1.3V8m-3 0c-2.8-.2-4.3 1.3-3.4 3.4.6 1.3.8 1.8-.3 3-2.1 2.1-1 5.3 5.2 5.3s7.3-3.2 5.2-5.3c-1.1-1.2-.9-1.7-.3-3 .9-2.1-.6-3.6-3.4-3.4M12 6v11m-2.4-2h4.8M12 19.7v2.3',
  'studio-flute': 'M3 16.5 19.4 6.9l1.6 2.7L4.6 19.2zM6.5 14.4l1.6 2.7m8-8.2 1.6 2.7m-7.6 1.7.1.1m2.1-1.4.1.1m2.1-1.4.1.1M19 4.5l2 3.4',
  'studio-trumpet': 'M3 10.5h3l1.4 1.4H15c1.5 0 3.1-.8 5.5-2.7v8.6C18 15.7 16.5 15 15 15H7.4L6 13.6H3m6 1.5v2a1.7 1.7 0 0 0 3.4 0v-2m-4-3.2V9m3.2 2.9V9m3.2 2.9V9M7.6 9h1.6m1.6 0h1.6m1.6 0h1.6',
  'studio-trombone': 'M3 9.5h3.4l1.8 1.7h6.5c1.7 0 3.8-.9 6.2-3v8.8c-2.4-2.1-4.5-3-6.2-3H8.2l-1.8-1.7H3m4.8 2v3.1c0 1.5.9 2.3 2.4 2.3h8.3a1.8 1.8 0 0 0 0-3.6h-8.3m2-2.1v2.1',
  'studio-horn': 'M4.5 8.8h2.2l2.8 3.8a3.3 3.3 0 1 0 3.8-1.1 5.6 5.6 0 1 0 1.9 6.5l2.5-5.5c.7-1.4 1.8-2.6 3.1-3.4L16.9 6c-.3 1.6-.8 2.6-1.5 3.3l-2.3 2.2M10 9.3l.9 1.5m1-2.1.7 1.6',
  'studio-dizi': 'M3 10.3h18v3.4H3zM5.5 10.3v3.4m13-3.4v3.4M8 12h.1m2.2 0h.1m2.2 0h.1m2.2 0h.1m2.2 0h.1M5.5 13.7v3.7m0 0-1.2 1.2m1.2-1.2 1.2 1.2',
};

export function createInstrumentIcon(key: string | undefined): SVGSVGElement | undefined {
  if (!key || !Object.hasOwn(paths, key)) return;
  const namespace = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(namespace, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('class', 'melody-instrument-icon');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  svg.setAttribute('data-instrument-icon', key);
  const path = document.createElementNS(namespace, 'path');
  path.setAttribute('d', paths[key]!);
  path.setAttribute('fill', 'none');
  path.setAttribute('stroke', 'currentColor');
  path.setAttribute('stroke-width', '1.35');
  path.setAttribute('stroke-linecap', 'round');
  path.setAttribute('stroke-linejoin', 'round');
  svg.append(path);
  return svg;
}
