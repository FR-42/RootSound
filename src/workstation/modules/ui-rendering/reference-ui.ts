import './reference-ui.css';

export type ReferenceEditorContext = {
  label: string;
  hint?: string;
  backLabel: string;
  onBack(): void;
  onSave(): void;
  onApplyElsewhere?(): void;
};

export type ReferenceLocationOption = {
  id: string;
  label: string;
  detail?: string;
  group?: string;
  selected?: boolean;
  /** A selected, disabled location is the current position and cannot be dropped. */
  disabled?: boolean;
};

function node<K extends keyof HTMLElementTagNameMap>(tag: K, className = '', text = ''): HTMLElementTagNameMap[K] {
  const result = document.createElement(tag); result.className = className; result.textContent = text; return result;
}
function button(label: string, className: string, callback: () => void): HTMLButtonElement {
  const result = node('button', className, label); result.type = 'button'; result.addEventListener('click', callback); return result;
}

/** The application supplies the position; rendering never resolves or changes references. */
export function createReferenceNavigation(context: ReferenceEditorContext): HTMLElement {
  const navigation = node('nav', 'reference-navigation'); navigation.setAttribute('aria-label', '当前编辑位置');
  navigation.append(button(`← ${context.backLabel}`, 'quiet reference-back', context.onBack));
  const description = node('div', 'reference-description');
  description.append(node('p', 'reference-path', context.label));
  if (context.hint) description.append(node('p', 'reference-hint', context.hint));
  navigation.append(description); return navigation;
}

export function showReferenceActions(root: HTMLElement, options: {
  label: string; onEdit(): void; onChoose(): void;
}): void {
  const dialog = node('dialog', 'reference-actions-dialog');
  dialog.append(node('h2', '', options.label), node('p', '', '通常只修改这一处，需要时再选择其他位置。'));
  const actions = node('div', 'reference-action-choices');
  function choose(callback: () => void): void { dialog.close(); callback(); }
  actions.append(button('编辑这一处', 'secondary', () => choose(options.onEdit)), button('联合修改…', 'quiet', () => choose(options.onChoose)));
  dialog.append(actions, button('返回', 'quiet', () => dialog.close()));
  dialog.addEventListener('close', () => dialog.remove(), { once: true }); root.append(dialog); dialog.showModal();
}

/** Selection is local until confirmation. Cancelling never calls onApply. */
export function showReferenceLocations(root: HTMLElement, options: {
  title?: string;
  description?: string;
  locations: ReferenceLocationOption[];
  confirmLabel?: string;
  onApply(ids: string[]): void | Promise<void>;
  onCancel?(): void;
}): { close(): void } {
  const ids = new Set<string>();
  for (const location of options.locations) {
    if (ids.has(location.id)) throw new Error('使用位置重复，请重新打开位置列表。');
    ids.add(location.id);
  }
  const dialog = node('dialog', 'reference-locations-dialog'); const form = node('form');
  form.append(node('h2', '', options.title ?? '应用到哪些位置？'),
    node('p', 'reference-scope-description', options.description ?? '只有选中的位置会采用修改，其他位置保持原样。'));
  const list = node('div', 'reference-location-groups'); const controls: Array<{ location: ReferenceLocationOption; input: HTMLInputElement }> = [];
  const groups = new Map<string, ReferenceLocationOption[]>();
  for (const location of options.locations) {
    const key = location.group ?? '使用位置'; const group = groups.get(key) ?? [];
    group.push(location); groups.set(key, group);
  }
  let firstGroup = true;
  for (const [name, locations] of groups) {
    const group = node('details', 'reference-location-group');
    group.open = firstGroup || locations.some(item => item.disabled && item.selected); firstGroup = false;
    group.append(node('summary', '', `${name} · ${locations.length} 处`));
    for (const location of locations) {
      const label = node('label', 'reference-location');
      const input = node('input'); input.type = 'checkbox'; input.value = location.id; input.checked = location.selected ?? false; input.disabled = location.disabled ?? false;
      input.setAttribute('aria-label', location.label);
      const description = node('span', 'reference-location-description'); description.append(node('span', 'reference-location-label', location.label));
      if (location.detail) description.append(node('span', 'reference-location-detail', location.detail));
      label.append(input, description);
      if (location.disabled && location.selected) label.append(node('span', 'reference-current', '当前处'));
      controls.push({ location, input }); group.append(label);
    }
    list.append(group);
  }
  if (!options.locations.length) list.append(node('p', 'muted', '没有其他使用位置。可以返回，继续修改当前内容。'));
  form.append(list);
  const selection = node('div', 'reference-selection-tools'); const count = node('span', 'reference-selection-count');
  const selectAll = button('全选', 'quiet', () => { controls.forEach(({ input }) => { if (!input.disabled) input.checked = true; }); refresh(); });
  const clear = button('清除可选项', 'quiet', () => { controls.forEach(({ input }) => { if (!input.disabled) input.checked = false; }); refresh(); });
  selection.append(count, selectAll, clear); form.append(selection);
  const error = node('p', 'dialog-error'); error.setAttribute('role', 'alert'); form.append(error);
  const actions = node('div', 'dialog-actions'); const cancel = button('取消', 'secondary', () => dialog.close());
  const apply = node('button', 'primary', options.confirmLabel ?? '应用修改'); apply.type = 'submit'; actions.append(cancel, apply); form.append(actions);
  let busy = false; let applied = false;
  function refresh(): void {
    const selected = controls.filter(({ input }) => input.checked).length;
    count.textContent = `已选 ${selected} 处`;
    apply.disabled = busy || !selected;
    selectAll.disabled = busy || !controls.some(({ location }) => !location.disabled);
    clear.disabled = selectAll.disabled;
  }
  controls.forEach(({ input }) => input.addEventListener('change', refresh));
  form.addEventListener('submit', async event => {
    event.preventDefault(); if (busy || !controls.some(({ input }) => input.checked)) return;
    const selected = controls.filter(({ input }) => input.checked).map(({ location }) => location.id);
    busy = true; error.textContent = ''; cancel.disabled = true;
    controls.forEach(({ input }) => { input.disabled = true; }); refresh();
    try { await options.onApply(selected); applied = true; if (dialog.open) dialog.close(); else dialog.remove(); }
    catch (reason) { error.textContent = reason instanceof Error ? reason.message : String(reason); }
    finally {
      busy = false; cancel.disabled = false;
      controls.forEach(({ location, input }) => { input.disabled = location.disabled ?? false; }); refresh();
    }
  });
  dialog.addEventListener('cancel', event => { if (busy) event.preventDefault(); });
  dialog.addEventListener('close', () => { dialog.remove(); if (!applied) options.onCancel?.(); }, { once: true });
  dialog.append(form); root.append(dialog); refresh(); dialog.showModal();
  return { close() { if (!busy && dialog.open) dialog.close(); } };
}
