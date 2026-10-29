/** One history step per gesture; previews never erase the gesture's origin. */
export function createDocumentState(initial, validate, { maxEntries = 128, maxBytes = 16 * 1024 * 1024 } = {}) {
  const copy = value => structuredClone(value);
  const canonical = value => JSON.stringify(value);
  let current = validate(copy(initial));
  let baseline = canonical(current);
  let gesture;
  let past = [];
  let future = [];
  let retainedBytes = 0;
  function remember(value) {
    const text = canonical(value);
    const entry = { value: copy(value), bytes: text.length * 2 };
    past.push(entry); retainedBytes += entry.bytes;
    while (past.length > maxEntries || retainedBytes > maxBytes && past.length > 1) retainedBytes -= past.shift().bytes;
  }
  function commit(next = current) {
    const value = validate(copy(next));
    const before = gesture ?? current;
    gesture = undefined;
    if (canonical(value) !== canonical(before)) { remember(before); future = []; }
    current = value;
    return read();
  }
  function preview(next) {
    const value = validate(copy(next));
    gesture ??= copy(current); current = value; return read();
  }
  function cancelPreview() { if (gesture) { current = gesture; gesture = undefined; } return read(); }
  function read() { return copy(current); }
  return {
    read, commit, preview, cancelPreview,
    undo() { if (gesture) return cancelPreview(); const previous = past.pop(); if (!previous) return read(); retainedBytes -= previous.bytes; future.push(copy(current)); current = previous.value; return read(); },
    redo() { if (gesture) return cancelPreview(); const next = future.pop(); if (!next) return read(); remember(current); current = next; return read(); },
    reset(next, clean = true) { current = validate(copy(next)); gesture = undefined; past = []; future = []; retainedBytes = 0; if (clean) baseline = canonical(current); return read(); },
    markSaved(snapshot = current) { baseline = canonical(validate(copy(snapshot))); },
    get dirty() { return canonical(current) !== baseline; },
    get canUndo() { return Boolean(gesture || past.length); },
    get canRedo() { return Boolean(future.length); },
    get previewing() { return gesture !== undefined; },
  };
}
