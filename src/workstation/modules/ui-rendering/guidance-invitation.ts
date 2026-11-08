import './guidance.css';

export function mountGuidanceInvitation(root: HTMLElement, options: { onWatch(): void; onSkip(): void }): { dispose(): void } {
  const previous = document.activeElement instanceof HTMLElement ? document.activeElement : undefined;
  const background = Array.from(root.children).filter((node): node is HTMLElement => node instanceof HTMLElement).map(node => ({ node, inert: node.inert }));
  background.forEach(({ node }) => { node.inert = true; });
  const overlay = document.createElement('section'); overlay.className = 'guidance-invitation'; overlay.setAttribute('role', 'dialog'); overlay.setAttribute('aria-modal', 'true'); overlay.setAttribute('aria-label', '是否观看引导');
  const card = document.createElement('div'); card.className = 'guidance-invitation-card';
  const title = document.createElement('h2'); title.textContent = '是否观看引导';
  const art = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); art.setAttribute('viewBox', '0 0 260 180'); art.setAttribute('aria-hidden', 'true');
  art.innerHTML = '<rect x="28" y="12" width="204" height="154" rx="10" fill="#f4f7f7" stroke="#c9d9d7"/><path d="M28 52h204M62 12v154M96 12v154M130 12v154M164 12v154M198 12v154M28 90h204M28 128h204" stroke="#d9e4e1"/><path d="M63 13h18v25H63zm68 0h18v25h-18zm34 0h18v25h-18" fill="#758681"/><rect x="101" y="60" width="23" height="47" rx="3" fill="#79ac9e"/><rect x="169" y="112" width="23" height="34" rx="3" fill="#d6b374"/><circle cx="130" cy="90" r="26" fill="#355e58"/><path d="m124 77 20 13-20 13z" fill="white"/>';
  const watch = document.createElement('button'); watch.type = 'button'; watch.className = 'guidance-watch'; watch.textContent = '观看引导';
  const skip = document.createElement('button'); skip.type = 'button'; skip.className = 'guidance-skip'; skip.textContent = '跳过';
  let disposed = false;
  function dispose() { if (disposed) return; disposed = true; overlay.remove(); background.forEach(({ node, inert }) => { if (node.isConnected) node.inert = inert; }); if (previous?.isConnected) previous.focus({ preventScroll: true }); }
  watch.addEventListener('click', () => { if (!disposed) { dispose(); options.onWatch(); } });
  skip.addEventListener('click', () => { if (!disposed) { dispose(); options.onSkip(); } });
  overlay.addEventListener('keydown', event => {
    event.stopPropagation();
    if (event.key === 'Escape') { event.preventDefault(); dispose(); options.onSkip(); }
    if (event.key === 'Tab') { event.preventDefault(); (document.activeElement === watch ? skip : watch).focus(); }
  });
  card.append(title, art, watch, skip); overlay.append(card); root.append(overlay); watch.focus();
  return { dispose };
}
