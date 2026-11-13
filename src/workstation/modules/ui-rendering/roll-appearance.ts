import { DEFAULT_ROLL_APPEARANCE, type RollAppearance, type WorkspacePreferencesPort } from '../../contracts/workspace.ts';

export function applyRollAppearance(root: HTMLElement, appearance: Readonly<RollAppearance>): void {
  const grid = appearance.gridStrength / 100;
  root.style.setProperty('--melody-grid-thickness', String(.5 + grid * .5));
  root.style.setProperty('--melody-grid-opacity', String(.12 + grid * .88));
}

function createRollPreview(root: HTMLElement): HTMLElement {
  const preview = document.createElement('div');
  preview.className = 'roll-appearance-preview is-vertical';
  preview.setAttribute('aria-hidden', 'true');
  const canvas = document.createElement('div');
  canvas.className = 'melody-canvas';
  const columns = 24;
  for (let column = 0; column < columns; column++) {
    const pitch = document.createElement('i');
    const accidental = [1, 3, 6, 8, 10].includes(column % 12);
    pitch.className = accidental ? 'melody-pitch-row is-accidental' : 'melody-pitch-row';
    pitch.style.left = `${column * 100 / columns}%`;
    pitch.style.width = `${100 / columns}%`;
    canvas.append(pitch);
  }
  for (let line = 0; line < 24; line++) {
    const grid = document.createElement('i');
    grid.className = line % 12 === 0 ? 'melody-grid-line is-beat is-bar' : line % 3 === 0 ? 'melody-grid-line is-beat' : 'melody-grid-line';
    grid.style.top = `${line * 3.25}%`;
    canvas.append(grid);
  }
  for (const [column, row, length, color] of [
    [7, 2, 4, '#9ac2ec'], [10, 7, 2, '#9ac2ec'], [12, 11, 4, '#a9c9a0'], [17, 15, 5, '#a9c9a0'],
  ] as const) {
    const note = document.createElement('span');
    note.className = 'melody-note';
    note.style.left = `calc(${column * 100 / columns}% + 1px)`;
    note.style.width = `calc(${100 / columns}% - 2px)`;
    note.style.top = `${row * 3.25}%`;
    note.style.height = `${length * 3.25}%`;
    note.style.setProperty('--tone-color', color);
    canvas.append(note);
  }
  const afterEnd = document.createElement('div');
  afterEnd.className = 'melody-after-end';
  afterEnd.style.top = '78%';
  const edge = document.createElement('span');
  edge.className = 'melody-roll-end';
  edge.style.top = 'calc(78% - 5px)';
  canvas.append(afterEnd, edge);
  preview.append(canvas);
  root.append(preview);
  return preview;
}

type Gesture = { pointerId: number } | { keys: Set<string> };
const rangeKeys = new Set(['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown']);

export function mountRollAppearanceSettings(root: HTMLElement, dialog: HTMLDialogElement, preferences: WorkspacePreferencesPort, problem: HTMLElement): () => void {
  let saved = preferences.read().rollAppearance?.gridStrength ?? DEFAULT_ROLL_APPEARANCE.gridStrength;
  let gesture: Gesture | undefined;
  let preview: HTMLElement | undefined;
  const events = new AbortController();

  const label = document.createElement('label');
  label.className = 'learning-appearance';
  const text = document.createElement('span');
  text.textContent = '网格线浓淡';
  const input = document.createElement('input');
  input.type = 'range';
  input.min = '0';
  input.max = '100';
  input.step = '1';
  input.value = String(saved);
  input.setAttribute('aria-label', text.textContent);
  label.append(text, input);
  dialog.append(label);

  function restore(): void {
    input.value = String(saved);
    applyRollAppearance(root, { gridStrength: saved });
  }

  function save(): void {
    const gridStrength = Number(input.value);
    if (gridStrength === saved) return;
    problem.hidden = true;
    try {
      saved = preferences.update({ rollAppearance: { gridStrength } }).rollAppearance?.gridStrength ?? gridStrength;
      restore();
    } catch (error) {
      restore();
      problem.textContent = error instanceof Error ? error.message : String(error);
      problem.hidden = false;
    }
  }

  function start(nextGesture: Gesture): void {
    if (gesture) return;
    gesture = nextGesture;
    const canvas = root.querySelector<HTMLElement>('.melody-canvas');
    const end = canvas?.querySelector<HTMLElement>('.melody-after-end');
    if (!canvas || canvas.querySelectorAll('.melody-grid-line').length < 3
      || (end && !end.hidden && parseFloat(end.style.top) < canvas.clientHeight / 3)) preview = createRollPreview(root);
    dialog.classList.add('is-previewing');
  }

  function finish(commit: boolean): void {
    if (!gesture) return;
    gesture = undefined;
    dialog.classList.remove('is-previewing');
    preview?.remove();
    preview = undefined;
    if (commit) save();
    else restore();
  }

  input.addEventListener('input', () => applyRollAppearance(root, { gridStrength: Number(input.value) }));
  input.addEventListener('change', () => { if (!gesture) save(); });
  input.addEventListener('pointerdown', event => {
    if (event.button === 0 && event.isPrimary) start({ pointerId: event.pointerId });
  });
  input.addEventListener('keydown', event => {
    if (!rangeKeys.has(event.key)) return;
    if (gesture && 'keys' in gesture) gesture.keys.add(event.key);
    else start({ keys: new Set([event.key]) });
  });

  const endPointer = (event: PointerEvent) => {
    if (gesture && 'pointerId' in gesture && gesture.pointerId === event.pointerId) finish(event.type !== 'pointercancel');
  };
  const capture = { capture: true, signal: events.signal };
  window.addEventListener('pointerup', endPointer, capture);
  window.addEventListener('pointercancel', endPointer, capture);
  window.addEventListener('lostpointercapture', endPointer, capture);
  window.addEventListener('keyup', event => {
    if (gesture && 'keys' in gesture && gesture.keys.delete(event.key) && gesture.keys.size === 0) finish(true);
  }, capture);
  window.addEventListener('blur', () => finish(true), { signal: events.signal });
  return () => { finish(false); events.abort(); };
}
