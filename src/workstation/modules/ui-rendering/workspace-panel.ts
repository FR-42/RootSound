export type WorkspacePanel = HTMLElement & Pick<HTMLDialogElement, 'showModal' | 'close'>;

export function createWorkspacePanel(inline = false, initialFocus: 'first-control' | 'panel' = 'first-control'): WorkspacePanel {
  if (!inline) return document.createElement('dialog');
  const panel = document.createElement('section') as WorkspacePanel;
  panel.className = 'workspace-inline-panel';
  panel.hidden = true;
  if (initialFocus === 'panel') panel.tabIndex = -1;
  panel.showModal = () => {
    panel.hidden = false;
    panel.setAttribute('open', '');
    const focus = initialFocus === 'panel' ? panel : panel.querySelector<HTMLElement>('button, input, select');
    focus?.focus({ preventScroll: true });
  };
  panel.close = () => {
    if (panel.hidden) return;
    panel.hidden = true;
    panel.removeAttribute('open');
    panel.dispatchEvent(new Event('close'));
  };
  panel.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || event.defaultPrevented || event.repeat || event.isComposing) return;
    event.preventDefault();
    event.stopPropagation();
    panel.dispatchEvent(new Event('cancel', { cancelable: true })) && panel.close();
  });
  return panel;
}
