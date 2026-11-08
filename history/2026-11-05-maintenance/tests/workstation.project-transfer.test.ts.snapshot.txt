import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { ProjectFilesPort } from '../src/workstation/contracts/files.ts';
import type { ProjectPackagesPort } from '../src/workstation/contracts/project.ts';
import type { ReferenceSession } from '../src/workstation/contracts/references.ts';
import { createProjectTransfer } from '../src/workstation/modules/ui-rendering/project-transfer.ts';

function fixture() {
  let music = 'first snapshot'; let imports = 0; let exports = 0;
  let sessions: ReferenceSession[] = [];
  const written: string[] = [];
  const packages: ProjectPackagesPort = {
    exportDraft() { exports++; return { text: music, name: '我的歌曲.rsproject', contentCount: 3 }; },
    importProject() { imports++; return { status: 'storage-error', message: '模拟保存失败，原库保留' }; },
  };
  const files: ProjectFilesPort = {
    async open() { return { status: 'cancelled' }; },
    async save(text, name) { written.push(text); return { status: 'saved', name }; },
  };
  const transfer = createProjectTransfer(packages, files, { sessions: () => sessions });
  return { transfer, files, packages, written, setMusic(value: string) { music = value; },
    setSessions(value: ReferenceSession[]) { sessions = value; }, get imports() { return imports; }, get exports() { return exports; } };
}

test('project save captures music before a delayed file dialog and rejects overlapping file actions', async () => {
  const f = fixture(); let finish!: () => void;
  f.files.save = (text, name) => { f.written.push(text); return new Promise(resolve => { finish = () => resolve({ status: 'saved', name }); }); };
  const pending = f.transfer.save('song'); f.setMusic('later edits');
  assert.deepEqual(await f.transfer.open(), { status: 'busy' });
  assert.deepEqual(await f.transfer.save('other-song'), { status: 'busy' });
  assert.deepEqual(f.written, ['first snapshot']);
  finish(); assert.equal((await pending).status, 'saved');
  assert.equal(f.exports, 1); assert.equal(f.imports, 0);
});

test('cancelled project open does not import, and a failed import is never reported as opened', async () => {
  const f = fixture(); assert.deepEqual(await f.transfer.open(), { status: 'cancelled' }); assert.equal(f.imports, 0);
  f.files.open = async () => ({ status: 'opened', name: '带依赖.rsproject', text: '{}' });
  assert.deepEqual(await f.transfer.open(), { status: 'storage-error', message: '模拟保存失败，原库保留' });
  assert.equal(f.imports, 1);
  f.files.open = async () => { throw new Error('文件无法读取'); };
  await assert.rejects(f.transfer.open(), /文件无法读取/);
  f.files.open = async () => ({ status: 'cancelled' });
  assert.deepEqual(await f.transfer.open(), { status: 'cancelled' });
});

test('saving a song cannot silently omit clean or nested reference edits belonging to it', async () => {
  const f = fixture();
  const phrase: ReferenceSession = { draftId: 'phrase-edit', targetId: 'phrase-source', targetKind: 'rootsound.phrase',
    context: { root: { type: 'draft', id: 'song' }, path: ['clip'] } };
  const sound: ReferenceSession = { draftId: 'sound-edit', targetId: 'sound-source', targetKind: 'rootsound.timbre',
    context: { root: { type: 'draft', id: phrase.draftId }, path: ['part'] } };
  f.setSessions([sound, phrase]);
  await assert.rejects(f.transfer.save('song'), /先完成或取消/);
  assert.equal(f.exports, 0); assert.equal(f.written.length, 0);
  assert.equal((await f.transfer.save('unrelated-song')).status, 'saved');
  f.setSessions([]); assert.equal((await f.transfer.save('song')).status, 'saved');
});

test('save errors release the transfer guard and cannot be confused with a successful file write', async () => {
  const f = fixture(); f.files.save = async () => { throw new Error('磁盘空间不足'); };
  await assert.rejects(f.transfer.save('song'), /磁盘空间不足/);
  assert.deepEqual(await f.transfer.open(), { status: 'cancelled' });
  f.files.save = async () => ({ status: 'cancelled' });
  assert.deepEqual(await f.transfer.save('song'), { status: 'cancelled' });
});
