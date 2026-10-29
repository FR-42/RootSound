import test from 'node:test';
import assert from 'node:assert/strict';
import { createHostBridge, bytesToBase64 } from '../web/host-bridge.mjs';

/** Message-only host and deterministic clock. No document, window or device. */
function fixture(t) {
  let now = 0, serial = 0;
  const timers = new Map(), sent = [], listeners = new Set();
  let postFailure;
  t.mock.method(globalThis, 'setTimeout', (callback, delay) => {
    const id = ++serial; timers.set(id, { callback, at: now + delay }); return id;
  });
  t.mock.method(globalThis, 'clearTimeout', id => timers.delete(id));
  const webview = {
    addEventListener(name, callback) { assert.equal(name, 'message'); listeners.add(callback); },
    postMessage(message) { sent.push(message); if (postFailure) { const error = postFailure; postFailure = undefined; throw error; } },
  };
  const bridge = createHostBridge(webview);
  return { bridge, sent, timers,
    failNext(error) { postFailure = error; },
    emit(message) { for (const listener of listeners) listener({ data: message }); },
    tick(ms) {
      now += ms;
      for (let limit = 0; limit < 1000; limit++) {
        const due = [...timers].filter(([, timer]) => timer.at <= now).sort((a, b) => a[1].at - b[1].at)[0];
        if (!due) return;
        timers.delete(due[0]); due[1].callback();
      }
      throw new Error('Test timer failed to settle');
    },
  };
}

test('parallel native operations correlate out-of-order replies and ignore stale or unknown ids', async t => {
  const f = fixture(t);
  const savePayload = { text: '{"name":"精细音色"}', name: '细调' };
  const save = f.bridge.request('savePatch', savePayload);
  const info = f.bridge.request('getInfo');
  const recovery = f.bridge.request('loadRecovery');
  assert.equal(f.bridge.native, true);
  assert.equal(new Set(f.sent.map(message => message.id)).size, 3);
  assert.deepEqual(f.sent.map(({ method, payload }) => ({ method, payload })), [
    { method: 'savePatch', payload: savePayload }, { method: 'getInfo', payload: {} }, { method: 'loadRecovery', payload: {} },
  ]);
  f.emit({ id: 'not-a-request', ok: true, result: 'ignored' });
  f.emit({ id: f.sent[2].id, ok: true, result: { status: 'empty' } });
  f.emit({ id: f.sent[1].id, ok: true, result: { outputDirectory: 'D:/实验/output' } });
  f.emit({ id: f.sent[0].id, ok: true, result: { status: 'saved', path: 'D:/实验/output/细调.rssynth' } });
  assert.deepEqual(await info, { outputDirectory: 'D:/实验/output' });
  assert.deepEqual(await recovery, { status: 'empty' });
  assert.equal((await save).status, 'saved');
  assert.equal(f.timers.size, 0);
  f.emit({ id: f.sent[0].id, ok: false, error: 'late error' });
  assert.equal(f.timers.size, 0);
});

test('native failures reject their own operation while cancellation remains an ordinary result', async t => {
  const f = fixture(t);
  const bad = f.bridge.request('savePatch', { text: 'bad' });
  const cancelled = f.bridge.request('openPatch');
  const rejection = assert.rejects(bad, /目标文件已被其他程序修改/u);
  f.emit({ id: f.sent[0].id, ok: false, error: '目标文件已被其他程序修改' });
  f.emit({ id: f.sent[1].id, ok: true, result: { status: 'cancelled' } });
  await rejection; assert.deepEqual(await cancelled, { status: 'cancelled' });
  const generic = f.bridge.request('getInfo');
  const genericFailure = assert.rejects(generic, /文件操作失败/u);
  f.emit({ id: f.sent[2].id, ok: false }); await genericFailure;
  assert.equal(f.timers.size, 0);
});

test('native events do not consume a matching pending id and unsubscribe removes their listener', async t => {
  const f = fixture(t); const events = [];
  const unsubscribe = f.bridge.onEvent(message => events.push(message));
  const pending = f.bridge.request('savePatch', { text: 'snapshot' });
  let settled = false; void pending.then(() => { settled = true; });
  f.emit({ id: f.sent[0].id, event: 'requestSave', reason: 'close' });
  f.emit({ event: 'beforeClose' }); await Promise.resolve();
  assert.equal(settled, false); assert.equal(f.timers.size, 1);
  assert.deepEqual(events.map(event => event.event), ['requestSave', 'beforeClose']);
  unsubscribe(); f.emit({ event: 'requestSave', reason: 'close' }); assert.equal(events.length, 2);
  f.emit({ id: f.sent[0].id, ok: true, result: { status: 'saved' } });
  assert.equal((await pending).status, 'saved'); assert.equal(f.timers.size, 0);
});

test('a throwing postMessage rejects immediately, clears its timer and does not poison later requests', async t => {
  const f = fixture(t); const failure = new Error('native transport unavailable'); f.failNext(failure);
  await assert.rejects(f.bridge.request('savePatch'), error => error === failure);
  assert.equal(f.timers.size, 0);
  const next = f.bridge.request('getInfo'); assert.notEqual(f.sent[0].id, f.sent[1].id);
  f.emit({ id: f.sent[0].id, ok: true, result: 'late failed send' });
  assert.equal(f.timers.size, 1);
  f.emit({ id: f.sent[1].id, ok: true, result: { version: 1 } });
  assert.deepEqual(await next, { version: 1 }); assert.equal(f.timers.size, 0);
});

test('a dialog may wait for minutes; timeout and a late response cannot settle a later operation', async t => {
  const f = fixture(t); const delayed = f.bridge.request('openPatch');
  let settled = false; void delayed.then(() => { settled = true; }, () => { settled = true; });
  f.tick(14 * 60 * 1000); await Promise.resolve(); assert.equal(settled, false);
  const rejected = assert.rejects(delayed, /等待超时/u);
  f.tick(60 * 1000); await rejected; assert.equal(f.timers.size, 0);
  const next = f.bridge.request('openPatch');
  f.emit({ id: f.sent[0].id, ok: true, result: { status: 'opened', text: 'stale' } });
  assert.equal(f.timers.size, 1);
  f.emit({ id: f.sent[1].id, ok: true, result: { status: 'cancelled' } });
  assert.deepEqual(await next, { status: 'cancelled' }); assert.equal(f.timers.size, 0);
});

test('base64 encoding preserves exact bytes across every chunk edge and subarray offset', () => {
  for (const length of [0, 1, 2, 3, 32765, 32766, 32767, 65531, 65532, 65533, 98300]) {
    const backing = Uint8Array.from({ length: length + 19 }, (_, index) => (index * 29 + 137) & 255);
    const bytes = backing.subarray(7, 7 + length);
    const encoded = bytesToBase64(bytes);
    assert.equal(encoded, Buffer.from(bytes).toString('base64'), `${length} exact encoded bytes`);
    assert.deepEqual(new Uint8Array(Buffer.from(encoded, 'base64')), bytes, `${length} decoded bytes`);
    assert.equal(encoded.length, Math.ceil(length / 3) * 4);
    assert.equal(encoded.slice(0, -2).includes('='), false, 'no inner padding may truncate concatenated chunks');
  }
});
