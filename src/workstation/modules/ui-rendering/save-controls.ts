import './save-controls.css';

export interface SaveControlsOptions {
  onSave(): void;
  onSaveCopy?(): void;
  onApplyElsewhere?(): void;
}

/** Keep ordinary saving visible; reveal the less common choices on demand. */
export function createSaveControls(initial: SaveControlsOptions): {
  element: HTMLElement;
  update(options: SaveControlsOptions): void;
} {
  const element = document.createElement('div'); element.className = 'save-actions save-controls';
  const save = document.createElement('button'); save.type = 'button'; save.className = 'primary'; save.textContent = '保存';
  let options = initial;
  save.addEventListener('click', () => options.onSave()); element.append(save);
  let secondary: { button: HTMLButtonElement; popup: HTMLDivElement } | undefined;

  function update(next: SaveControlsOptions): void {
    options = next;
    if (secondary) {
      if (secondary.popup.matches(':popover-open')) secondary.popup.hidePopover();
      secondary.button.remove(); secondary.popup.remove(); secondary = undefined;
    }
    const actions: Array<{ label: string; run(): void }> = [];
    if (next.onSaveCopy) actions.push({ label: '另存副本', run: next.onSaveCopy });
    if (next.onApplyElsewhere) actions.push({ label: '应用到其他位置…', run: next.onApplyElsewhere });
    if (!actions.length) return;

    const more = document.createElement('button'); more.type = 'button'; more.className = 'save-controls-more'; more.textContent = '⋯';
    more.setAttribute('aria-label', '更多保存操作'); more.setAttribute('aria-expanded', 'false');
    const popup = document.createElement('div'); popup.className = 'save-controls-popup'; popup.popover = 'auto';
    popup.id = `rootsound-save-actions-${crypto.randomUUID()}`;
    popup.setAttribute('role', 'group'); popup.setAttribute('aria-label', '更多保存操作');
    more.setAttribute('popovertarget', popup.id); more.setAttribute('aria-controls', popup.id);

    function position(): void {
      const anchor = more.getBoundingClientRect(); const size = popup.getBoundingClientRect();
      const width = document.documentElement.clientWidth || window.innerWidth;
      const height = document.documentElement.clientHeight || window.innerHeight;
      const edge = 8; const gap = 6;
      const left = Math.max(edge, Math.min(anchor.right - size.width, width - edge - size.width));
      const above = anchor.top - gap - size.height;
      const preferredTop = above >= edge ? above : anchor.bottom + gap;
      const top = Math.max(edge, Math.min(preferredTop, height - edge - size.height));
      popup.style.left = `${left}px`; popup.style.top = `${top}px`;
    }
    popup.addEventListener('beforetoggle', event => {
      if ((event as ToggleEvent).newState === 'open') queueMicrotask(() => {
        if (popup.matches(':popover-open')) position();
      });
    });
    popup.addEventListener('toggle', () => more.setAttribute('aria-expanded', String(popup.matches(':popover-open'))));
    for (const [index, action] of actions.entries()) {
      const choice = document.createElement('button'); choice.type = 'button'; choice.className = 'save-controls-option'; choice.textContent = action.label;
      if (!index) choice.autofocus = true;
      choice.addEventListener('click', () => { popup.hidePopover(); action.run(); });
      popup.append(choice);
    }
    element.append(more, popup); secondary = { button: more, popup };
  }
  update(initial);
  return { element, update };
}
