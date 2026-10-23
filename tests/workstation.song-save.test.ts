import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createSongSaveAction, isSongSaveShortcut } from '../src/workstation/modules/ui-rendering/song-save.ts';

test('primary song save uses the file operation after committing the focused field, including unchanged saves', async () => {
  let name = 'before blur'; const written: string[] = []; let localSaves = 0;
  const action = createSongSaveAction({
    prepare() { name = 'after blur'; },
    async saveProject() { written.push(name); },
    saveLocal() { localSaves++; },
    active: () => true, onBusy() {}, onError(error) { throw error; },
  });
  await action.run(); await action.run();
  assert.deepEqual(written, ['after blur', 'after blur']);
  assert.equal(localSaves, 0);
});

test('a pending file dialog accepts only one save and cancellation releases the same command for retry', async () => {
  let calls = 0; let finish!: () => void;
  const busy: boolean[] = []; const errors: unknown[] = [];
  const action = createSongSaveAction({
    prepare() {},
    saveProject() { calls++; return new Promise<void>(resolve => { finish = resolve; }); },
    saveLocal() { throw new Error('must use files'); },
    active: () => true, onBusy(value) { busy.push(value); }, onError(error) { errors.push(error); },
  });
  const first = action.run();
  assert.equal(action.busy, true);
  await action.run(); assert.equal(calls, 1);
  // A cancelled platform dialog resolves without success. The workspace neither
  // creates an internal song version nor invents a successful file notification.
  finish(); await first;
  assert.equal(action.busy, false); assert.deepEqual(errors, []);
  const retry = action.run(); assert.equal(calls, 2); finish(); await retry;
  assert.deepEqual(busy, [true, false, true, false]);
});

test('invalid focused edits and failed file writes remain errors, and later saves can retry', async () => {
  let invalid = true; let diskFails = true; let calls = 0;
  const errors: string[] = [];
  const action = createSongSaveAction({
    prepare() { if (invalid) throw new Error('歌曲名称不能为空'); },
    async saveProject() { calls++; if (diskFails) throw new Error('磁盘空间不足'); },
    saveLocal() { throw new Error('must use files'); },
    active: () => true, onBusy() {}, onError(error) { errors.push((error as Error).message); },
  });
  await action.run(); assert.equal(calls, 0);
  invalid = false; await action.run(); assert.equal(calls, 1);
  diskFails = false; await action.run(); assert.equal(calls, 2);
  assert.deepEqual(errors, ['歌曲名称不能为空', '磁盘空间不足']);
  assert.equal(action.busy, false);
});

test('an inactive or replaced workspace cannot start a stale save and file-less hosts retain local fallback', async () => {
  let active = false; let writes = 0; let commitDisposes = false;
  const action = createSongSaveAction({
    prepare() { if (commitDisposes) active = false; },
    saveLocal() { writes++; }, active: () => active, onBusy() {}, onError(error) { throw error; },
  });
  await action.run(); assert.equal(writes, 0);
  active = true; commitDisposes = true; await action.run(); assert.equal(writes, 0);
  active = true; commitDisposes = false; await action.run(); assert.equal(writes, 1);
});

test('save shortcut accepts physical and virtual keyboards without stealing other letter commands', () => {
  const event = { ctrlKey: true, metaKey: false, code: 'KeyS', key: 's' };
  assert.equal(isSongSaveShortcut(event), true);
  assert.equal(isSongSaveShortcut({ ...event, key: '輸' }), true);
  assert.equal(isSongSaveShortcut({ ...event, code: '', key: 'S' }), true);
  assert.equal(isSongSaveShortcut({ ...event, ctrlKey: false, metaKey: true }), true);
  assert.equal(isSongSaveShortcut({ ...event, ctrlKey: false }), false);
  assert.equal(isSongSaveShortcut({ ...event, code: 'KeyD' }), false);
});
