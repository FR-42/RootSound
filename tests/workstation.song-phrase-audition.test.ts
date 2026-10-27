import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { PlaybackSession, SoundRuntimeEvent } from '../src/workstation/contracts/sound.ts';
import { createSongPhraseAudition, type SongPhraseAuditionState } from '../src/workstation/modules/ui-rendering/song-phrase-audition.ts';
import { createSongInspector } from '../src/workstation/modules/ui-rendering/song-inspector.ts';

function deferred<T>() { let resolve!: (value: T) => void; let reject!: (reason: unknown) => void; const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no; }); return { promise, resolve, reject }; }
const playing = (id: string): PlaybackSession => ({ id, status: 'playing', startedAtSeconds: 0, durationSeconds: 2 });
function fixture(preview?: (id: string, signal: AbortSignal) => Promise<PlaybackSession>) {
  const calls: Array<{ id: string; signal: AbortSignal }> = []; const stopped: string[] = []; const errors: unknown[] = []; const states: SongPhraseAuditionState[] = [];
  const listeners = new Set<(event: SoundRuntimeEvent) => void>();
  const emit = (event: SoundRuntimeEvent) => { for (const listener of [...listeners]) listener(event); };
  const audition = createSongPhraseAudition({ runtime: {
    stop(id) { stopped.push(id); emit({ type: 'session', session: { ...playing(id), status: 'stopped' } }); },
    subscribe(listener) { listeners.add(listener); listener({ type: 'device', status: 'idle' }); return () => { listeners.delete(listener); }; },
  }, async preview(id, signal) { calls.push({ id, signal }); return preview ? preview(id, signal) : playing(`session:${id}`); },
  onChange: state => states.push(state), onError: error => errors.push(error) });
  return { audition, calls, stopped, errors, states, emit, listeners };
}

test('console audition toggles its own session, follows natural completion and ignores unrelated runtime sessions', async () => {
  const f = fixture();
  try {
    assert.deepEqual(f.audition.read(), { playing: false, preparing: false });
    const start = f.audition.toggle('phrase-a'); assert.deepEqual(f.audition.read(), { phraseId: 'phrase-a', playing: false, preparing: true }); await start;
    assert.deepEqual(f.audition.read(), { phraseId: 'phrase-a', playing: true, preparing: false });
    f.emit({ type: 'session', session: { ...playing('other'), status: 'ended' } }); assert.equal(f.audition.read().playing, true);
    f.emit({ type: 'session', session: { ...playing('session:phrase-a'), status: 'ended' } }); assert.deepEqual(f.audition.read(), { playing: false, preparing: false });
    await f.audition.toggle('phrase-a'); await f.audition.toggle('phrase-a'); assert.deepEqual(f.stopped, ['session:phrase-a']);
    assert.equal(f.calls.length, 2); assert.deepEqual(f.errors, []);
  } finally { f.audition.dispose(); }
});

test('a cancelled or replaced preparation aborts its signal and stops only its own late session', async () => {
  const first = deferred<PlaybackSession>(); const second = deferred<PlaybackSession>();
  const f = fixture(id => id === 'first' ? first.promise : second.promise);
  try {
    const a = f.audition.toggle('first'); const b = f.audition.toggle('second');
    assert.equal(f.calls[0]!.signal.aborted, true); assert.equal(f.calls[1]!.signal.aborted, false);
    second.resolve(playing('second-session')); await b; first.resolve(playing('first-late-session')); await a;
    assert.deepEqual(f.stopped, ['first-late-session']); assert.equal(f.audition.read().phraseId, 'second'); assert.equal(f.audition.read().playing, true);
    await f.audition.toggle('second'); assert.deepEqual(f.stopped, ['first-late-session', 'second-session']);
    assert.deepEqual(f.errors, []);
  } finally { f.audition.dispose(); }
});

test('pressing the same button while loading cancels without starting another preview or reporting a stale error', async () => {
  const request = deferred<PlaybackSession>(); const f = fixture(() => request.promise);
  try {
    const active = f.audition.toggle('one'); await f.audition.toggle('one');
    assert.equal(f.calls.length, 1); assert.equal(f.calls[0]!.signal.aborted, true); assert.equal(f.audition.read().preparing, false);
    request.reject(new Error('late decoder failure')); await active; assert.deepEqual(f.errors, []); assert.deepEqual(f.stopped, []);
  } finally { f.audition.dispose(); }
});

test('audition preparation/session/device errors release its state and can be retried', async () => {
  let attempt = 0; const f = fixture(async () => { if (++attempt === 1) throw new Error('无法解码'); return playing('audition'); });
  try {
    await f.audition.toggle('one'); assert.equal(f.errors.length, 1); assert.equal(f.audition.read().playing, false);
    await f.audition.toggle('one'); f.emit({ type: 'session', session: { ...playing('audition'), status: 'failed', error: '设备失效' } });
    assert.equal(f.errors.length, 2); assert.equal(f.audition.read().playing, false);
    await f.audition.toggle('one'); f.emit({ type: 'device', status: 'failed', error: '设备已关闭' });
    assert.equal(f.errors.length, 3); assert.deepEqual(f.stopped, ['audition']); assert.equal(f.audition.read().playing, false);
    await f.audition.toggle('one'); assert.equal(f.audition.read().playing, true);
  } finally { f.audition.dispose(); }
});

test('dispose aborts pending work, ignores callbacks and stops late owned audio without touching another preview', async () => {
  const late = deferred<PlaybackSession>(); const f = fixture(() => late.promise); const start = f.audition.toggle('one'); const changed = f.states.length;
  f.audition.dispose(); assert.equal(f.calls[0]!.signal.aborted, true); assert.equal(f.listeners.size, 0);
  late.resolve(playing('late-owned-session')); await start; assert.deepEqual(f.stopped, ['late-owned-session']); assert.equal(f.states.length, changed);
  await f.audition.toggle('another'); assert.equal(f.calls.length, 1); assert.deepEqual(f.errors, []); f.audition.dispose();
});

class Element extends EventTarget {
  children: Element[] = []; className = ''; textContent = ''; hidden = false; type = ''; value = ''; readOnly = false; title = ''; attributes = new Map<string, string>(); style = { setProperty() {} };
  append(...children: Element[]) { this.children.push(...children); }
  replaceChildren(...children: Element[]) { this.children = children; }
  setAttribute(name: string, value: string) { this.attributes.set(name, value); }
  querySelector(selector: string): Element | undefined { return this.children.flatMap(all).find(node => node.className.split(' ').includes(selector.slice(1))); }
  focus() {} select() {} blur() { this.dispatchEvent(new Event('blur')); }
}
const all = (root: Element): Element[] => [root, ...root.children.flatMap(all)];
test('source and occurrence inspectors expose an icon audition control while rows do not, with state updating in place', () => {
  const before = Object.getOwnPropertyDescriptor(globalThis, 'document'); Object.defineProperty(globalThis, 'document', { configurable: true, value: {
    createElement: () => new Element(), createElementNS: () => new Element(),
  } });
  try {
    const errors: unknown[] = []; let played = 0; const inspector = createSongInspector(error => errors.push(error));
    inspector.update({ key: 'source', kind: 'phrase', name: 'A', details: [], onAudition: () => { played++; } });
    const root = inspector.element as unknown as Element; const button = all(root).find(node => node.attributes.get('aria-label') === '演奏'); assert(button);
    assert.equal(button.textContent, ''); button.dispatchEvent(new Event('click')); assert.equal(played, 1);
    inspector.update({ key: 'source', kind: 'phrase', name: 'A', details: [], onAudition: () => { played++; }, auditioning: true });
    assert.equal(button.attributes.get('aria-label'), '停止演奏'); assert(all(root).includes(button));
    inspector.update({ key: 'clip', kind: 'clip', name: 'A', details: [], onAudition: () => { throw new Error('cannot play'); }, preparingAudition: true });
    const preparing = all(root).find(node => node.attributes.get('aria-label') === '取消演奏准备'); assert(preparing); preparing.dispatchEvent(new Event('click')); assert.equal(errors.length, 1);
    inspector.update({ key: 'row', kind: 'row', name: '行1', details: [], onAudition: () => { played++; } });
    assert.equal(all(root).some(node => node.className.includes('song-inspector-audition')), false);
  } finally { if (before) Object.defineProperty(globalThis, 'document', before); else Reflect.deleteProperty(globalThis, 'document'); }
});
