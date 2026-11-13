import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, writeFile, rename, symlink } from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { createInitialProjectLibrary, renameProjectLibrary } from '../src/workstation/app/project-setup.ts';
const { HostClient } = createRequire(import.meta.url)('../desktop/electron/rpc.cjs');

test('portable desktop host creates, edits without autosave, saves, reopens, copies, renames, imports and deletes only fixture projects', async () => {
  const root = path.resolve('.test-output/release-host-fixtures'); await mkdir(root, { recursive: true });
  const directory = await mkdtemp(path.join(root, 'case-'));
  const host = new HostClient('dotnet', path.resolve('.cache/release-host/RootSound.Host.dll'), directory);
  const call = async (method, ...args) => JSON.parse(await host.call(method, args));
  try {
    const initial = await call('project.Read'); assert.equal(initial.current, null);
    const data = createInitialProjectLibrary('跨平台测试');
    const made = await call('project.Create', '跨平台测试', initial.defaultLocation, data);
    assert.equal(made.status, 'created'); const filename = made.project.path;
    const disk = await readFile(filename, 'utf8');
    await call('project.FinishLoading'); const storage = await call('storage.Read');
    assert.equal(storage.ok, true); const working = JSON.parse(storage.value);
    const song = working.drafts.find(draft => draft.kind === 'rootsound.song'); song.name = '保存后的名字';
    const changed = JSON.stringify(working);
    assert.equal((await call('storage.WriteScoped', changed, storage.scope)).ok, true);
    assert.equal(await readFile(filename, 'utf8'), disk, 'editing must not write the project');
    assert.equal((await call('project.Read')).hasUnsavedChanges, true);
    const save = await call('project.Save', '保存后的名字'); assert.equal(save.status, 'saved');
    assert.equal(save.project.path, filename);
    assert.equal(JSON.parse(await readFile(filename, 'utf8')).name, '保存后的名字');
    assert.notEqual(await readFile(filename, 'utf8'), disk);
    assert.equal((await call('project.List')).projects.length, 1);
    const saved = await readFile(filename, 'utf8');
    const modifiedAgain = JSON.parse(changed); modifiedAgain.drafts.find(draft => draft.kind === 'rootsound.song').name = '放弃这次';
    await call('storage.WriteScoped', JSON.stringify(modifiedAgain), storage.scope);
    assert.equal((await call('project.Exit', 'discard', '')).status, 'exited');
    assert.equal(await readFile(filename, 'utf8'), saved);
    assert.equal((await call('storage.WriteScoped', changed, storage.scope)).ok, false, 'stale pages cannot write another session');
    assert.deepEqual(await call('project.ResolveLibrarySongPath', filename, made.project.id), { status: 'ready', path: filename });
    assert.equal((await call('project.ResolveLibrarySongPath', filename, '00000000-0000-0000-0000-000000000000')).status, 'error');
    assert.equal((await call('project.Read')).current, null, 'resolving a path does not open the score');
    assert.equal(await readFile(filename, 'utf8'), saved);
    const opened = await call('project.OpenKnown', filename); assert.equal(opened.status, 'opened');
    const current = await call('storage.Read');
    const copy = await call('project.CreateCopy', '独立副本', initial.defaultLocation, current.value); assert.equal(copy.status, 'created');
    assert.notEqual(copy.project.id, made.project.id); assert.equal(await readFile(filename, 'utf8'), saved);
    await call('project.Exit', 'discard', '');
    const snapshot = await call('project.Inspect', copy.project.path, copy.project.id); assert.equal(snapshot.status, 'snapshot');
    const renamed = JSON.parse(snapshot.libraryText); renamed.drafts.find(draft => draft.kind === 'rootsound.song').name = '库内改名';
    const copyRename = await call('project.Rename', copy.project.path, copy.project.id, '库内改名', JSON.stringify(renamed), snapshot.token);
    assert.equal(copyRename.status, 'renamed'); copy.project.path = copyRename.project.path;
    const tone = path.join(directory, '自己的音色.rssynth'); await writeFile(tone, '{}');
    const imported = await call('timbres.OpenPath', tone); assert.equal(imported.status, 'opened'); assert.equal(imported.name, '自己的音色.rssynth');
    assert.equal((await call('payload.Open', '../../secret')).status, 'error');
    assert.equal((await call('unknown.command')).status, 'error');
    assert.equal((await call('project.Delete', copy.project.path, copy.project.id)).status, 'deleted');
    assert.equal((await call('project.List')).projects.length, 1);
  } finally { host.close(); }
});

test('filename governs discovery and opening, saving keeps the path, and explicit rename rejects conflicts', async () => {
  const root = path.resolve('.test-output/release-host-fixtures'); await mkdir(root, { recursive: true });
  const directory = await mkdtemp(path.join(root, 'names-'));
  const host = new HostClient('dotnet', path.resolve('.cache/release-host/RootSound.Host.dll'), directory);
  const call = async (method, ...args) => JSON.parse(await host.call(method, args));
  try {
    const { defaultLocation } = await call('project.Read');
    const made = await call('project.Create', '内部旧名称', defaultLocation, createInitialProjectLibrary('内部旧名称'));
    await call('project.Exit', 'discard', '');
    let filename = path.join(defaultLocation, '外部改名.rootsound'); await rename(made.project.path, filename);
    const original = await readFile(filename, 'utf8');
    assert.equal((await call('project.List')).projects[0].name, '外部改名');
    assert.equal((await call('project.OpenKnown', filename)).project.name, '外部改名');
    const stored = await call('storage.Read');
    const synced = renameProjectLibrary(stored.value, '外部改名');
    await call('storage.WriteScoped', synced, stored.scope); await call('project.FinishLoading');
    assert.equal((await call('project.Read')).hasUnsavedChanges, false);
    assert.equal(await readFile(filename, 'utf8'), original, 'opening cannot write metadata back to disk');
    await call('project.Save', '外部改名');
    const envelope = JSON.parse(await readFile(filename, 'utf8')); assert.equal(envelope.name, '外部改名');
    assert.equal(JSON.parse(envelope.libraryText).drafts.find(d => d.kind === 'rootsound.song').name, '外部改名');
    const before = await readFile(filename, 'utf8');
    const occupied = path.join(defaultLocation, '冲突.rootsound'); await writeFile(occupied, '这是另一个文件');
    const renamed = renameProjectLibrary(synced, '冲突'); await call('storage.WriteScoped', renamed, stored.scope);
    const invalid = JSON.parse(synced); invalid.invalidExport = { encoding: 'host-asset' };
    assert.equal((await call('storage.WriteScoped', JSON.stringify(invalid), stored.scope)).status, 'error');
    assert.equal(await readFile(filename, 'utf8'), before, 'invalid input cannot modify the source');
    assert.equal((await call('project.Read')).hasUnsavedChanges, true);
    const save = await call('project.Save', '冲突');
    assert.equal(save.status, 'saved'); assert.equal(save.project.path, filename);
    const checkpoint = await readFile(filename, 'utf8'); assert.equal(JSON.parse(checkpoint).name, '冲突');
    assert.equal(await readFile(occupied, 'utf8'), '这是另一个文件');
    await call('project.Exit', 'discard', '');
    const snapshot = await call('project.Inspect', filename, made.project.id);
    assert.equal(snapshot.status, 'snapshot');
    assert.equal((await call('project.Rename', filename, made.project.id, '冲突', renamed, snapshot.token)).status, 'error');
    assert.equal(await readFile(filename, 'utf8'), checkpoint);
    assert.equal(await readFile(occupied, 'utf8'), '这是另一个文件');
    for (const name of ['Case', 'case']) {
      const snapshot = await call('project.Inspect', filename, made.project.id);
      assert.equal(snapshot.status, 'snapshot');
      const result = await call('project.Rename', filename, made.project.id, name, renameProjectLibrary(snapshot.libraryText, name), snapshot.token);
      assert.equal(result.status, 'renamed', JSON.stringify(result));
      assert.equal(path.basename(result.project.path), name + '.rootsound'); filename = result.project.path;
      assert.equal(JSON.parse(await readFile(filename, 'utf8')).name, name);
    }
    assert.equal((await call('project.OpenKnown', filename)).status, 'opened', 'new filename remains owned and can reopen');
  } finally { host.close(); }
});

test('project library discovers nested files, opens/renames/deletes them, and stays inside the project tree', { timeout: 30_000 }, async () => {
  const root = path.resolve('.test-output/release-host-fixtures'); await mkdir(root, { recursive: true });
  const directory = await mkdtemp(path.join(root, 'recursive-'));
  const host = new HostClient('dotnet', path.resolve('.cache/release-host/RootSound.Host.dll'), directory);
  const call = async (method, ...args) => JSON.parse(await host.call(method, args));
  try {
    const { defaultLocation } = await call('project.Read');
    const nested = path.join(defaultLocation, '分类', '更深一层'), outside = defaultLocation + '-outside';
    await mkdir(nested, { recursive: true }); await mkdir(outside, { recursive: true });
    const create = async (name, location) => {
      const result = await call('project.Create', name, location, createInitialProjectLibrary(name));
      assert.equal(result.status, 'created'); await call('project.Exit', 'discard', ''); return result.project;
    };
    const top = await create('根目录', defaultLocation), deep = await create('子目录工程', nested), excluded = await create('外部工程', outside);
    const upper = await create('大写后缀', path.dirname(nested));
    const upperPath = upper.path.replace(/\.rootsound$/i, '.ROOTSOUND'); await rename(upper.path, upperPath);
    await writeFile(path.join(nested, '坏文件.rootsound'), '{'); await writeFile(path.join(nested, '空文件.rootsound'), '');
    await symlink(outside, path.join(defaultLocation, '外部链接'), process.platform === 'win32' ? 'junction' : 'dir');
    await symlink(defaultLocation, path.join(nested, '循环链接'), process.platform === 'win32' ? 'junction' : 'dir');
    const before = await readFile(deep.path, 'utf8');
    const listed = await call('project.List');
    assert.deepEqual(listed.projects.map(p => p.path).sort(), [top.path, deep.path, upperPath].sort());
    assert.equal(await readFile(deep.path, 'utf8'), before, 'discovery is read only');
    const midiPath = path.join(nested, '主题.mid');
    const midi = Buffer.from('4d546864000000060000000101e04d54726b0000000400ff2f00', 'hex');
    await writeFile(midiPath, midi);
    assert.deepEqual(await call('project.ResolveLibrarySongPath', midiPath, ''), { status: 'ready', path: midiPath });
    assert.deepEqual(await readFile(midiPath), midi);
    assert.equal((await call('project.ResolveLibrarySongPath', excluded.path, excluded.id)).status, 'error');
    assert.equal((await call('project.ResolveLibrarySongPath', path.join(defaultLocation, '外部链接', path.basename(excluded.path)), excluded.id)).status, 'error');
    assert.equal((await call('project.ResolveLibrarySongPath', nested, '')).status, 'error');
    assert.equal((await call('project.ResolveLibrarySongPath', path.join(nested, '已移动.mid'), '')).status, 'error');
    assert.equal((await call('project.OpenKnown', excluded.path)).status, 'error');
    assert.equal((await call('project.OpenKnown', path.join(defaultLocation, '外部链接', path.basename(excluded.path)))).status, 'error');
    assert.equal((await call('project.OpenKnown', deep.path)).status, 'opened');
    const stored = await call('storage.Read'); const revised = JSON.parse(stored.value);
    revised.drafts.find(d => d.kind === 'rootsound.song').name = '子目录保存';
    await call('project.FinishLoading'); await call('storage.WriteScoped', JSON.stringify(revised), stored.scope);
    const save = await call('project.Save', '子目录保存'); assert.equal(save.status, 'saved'); deep.path = save.project.path;
    await call('project.Exit', 'discard', '');
    const snapshot = await call('project.Inspect', deep.path, deep.id); assert.equal(snapshot.status, 'snapshot');
    const renamed = JSON.parse(snapshot.libraryText); renamed.drafts.find(d => d.kind === 'rootsound.song').name = '子目录改名';
    const moved = await call('project.Rename', deep.path, deep.id, '子目录改名', JSON.stringify(renamed), snapshot.token);
    assert.equal(moved.status, 'renamed'); deep.path = moved.project.path;
    assert.equal((await call('project.List')).projects.find(p => p.id === deep.id).name, '子目录改名');
    assert.equal((await call('project.Delete', deep.path, deep.id)).status, 'deleted');
    assert.deepEqual((await call('project.List')).projects.map(p => p.path).sort(), [top.path, upperPath].sort());
    assert.equal((await call('project.OpenKnown', upperPath)).status, 'opened');
  } finally { host.close(); }
});
