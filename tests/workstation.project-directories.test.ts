import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { ProjectDirectoriesPort } from '../src/workstation/contracts/project-directory.ts';
import { createDesktopProjectDirectories, type NativeProjectDirectoriesBridge } from '../src/workstation/app/platform/project-directories.ts';
import { createDesktopPlatform, type DesktopBridge } from '../src/workstation/app/platform/desktop.ts';
import { createInitialProjectLibrary, createProjectCopyLibrary, createProjectSetup, renameProjectLibrary } from '../src/workstation/app/project-setup.ts';
import { createProjectClosePreparation } from '../src/workstation/app/project-close.ts';
import { createMaterialLibrary } from '../src/workstation/modules/materials/public.ts';
import { createTimbrePlayback } from '../src/workstation/modules/timbre/public.ts';
import { createPhrasePlayback } from '../src/workstation/modules/phrase/public.ts';
import { createSongEditor } from '../src/workstation/modules/song/public.ts';

const entry = { id: 'project-1', name: '清晨 🌤', path: 'D:\\RootSound\\project\\清晨 🌤' };
const raw = (value: unknown) => Promise.resolve(JSON.stringify(value));
function directoryBridge(): NativeProjectDirectoriesBridge {
  return { Read: () => raw({ status: 'ready', defaultLocation: 'D:\\RootSound\\project' }),
    ChooseLocation: () => raw({ status: 'cancelled' }),
    Create: () => raw({ status: 'created', project: entry }), Open: () => raw({ status: 'cancelled' }) };
}

test('successful project deletion carries a retained-copy notice through the platform and setup without retrying deletion', async () => {
  const bridge = directoryBridge(); let calls = 0;
  bridge.Delete = () => { calls++; return raw({ status: 'deleted', warning: '歌曲已删除，用户另外修改过的音色副本已保留。' }); };
  const port = createDesktopProjectDirectories(bridge); const setup = createProjectSetup(port, () => { throw new Error('Deletion must not open a project.'); });
  assert.deepEqual(await setup.remove!(entry), { warning: '歌曲已删除，用户另外修改过的音色副本已保留。' }); assert.equal(calls, 1);
});

test('library rename uses a versioned native snapshot and validates path identity and result', async () => {
  const bridge = directoryBridge(); const calls: unknown[][] = [];
  const port = createDesktopProjectDirectories(bridge);
  await assert.rejects(port.inspect!(entry), /尚不支持库内改名/);
  bridge.Inspect = (path, id) => { calls.push(['inspect', path, id]); return raw({ status: 'snapshot', project: entry, libraryText: '完整原件', token: 'file-token' }); };
  assert.deepEqual(await port.inspect!(entry), { project: entry, libraryText: '完整原件', token: 'file-token' });
  bridge.Rename = (path, id, name, text, token) => { calls.push(['rename', path, id, name, text, token]); return raw({ status: 'renamed', project: { ...entry, name } }); };
  assert.deepEqual(await port.rename!(entry, '新名称', '完整修改件', 'file-token'), { ...entry, name: '新名称' });
  assert.deepEqual(calls, [['inspect', entry.path, entry.id], ['rename', entry.path, entry.id, '新名称', '完整修改件', 'file-token']]);
  for (const value of [{ status: 'snapshot', project: { ...entry, id: 'replaced' }, libraryText: '原件', token: 'token' },
    { status: 'snapshot', project: entry, libraryText: '', token: 'token' }, { status: 'snapshot', project: entry, libraryText: '原件', token: '' }]) {
    bridge.Inspect = () => raw(value); await assert.rejects(port.inspect!(entry), /无效/);
  }
  bridge.Rename = () => raw({ status: 'renamed', project: { ...entry, path: 'D:/elsewhere', name: '新名称' } });
  await assert.rejects(port.rename!(entry, '新名称', '完整修改件', 'file-token'), /无效/);
  bridge.Rename = () => raw({ status: 'error', message: '工程刚刚发生变化' });
  await assert.rejects(port.rename!(entry, '新名称', '完整修改件', 'file-token'), /刚刚发生变化/);
});

test('native project readiness passes optional system double-click interval and rejects malformed values', async () => {
  const bridge = directoryBridge(); const port = createDesktopProjectDirectories(bridge);
  assert.deepEqual(await port.read(), { defaultLocation: 'D:\\RootSound\\project' }, 'older hosts may omit the optional interval');
  for (const interval of [1, 450, 500, 10000]) {
    bridge.Read = () => raw({ status: 'ready', defaultLocation: 'D:/RootSound/project', doubleClickIntervalMs: interval });
    assert.equal((await port.read()).doubleClickIntervalMs, interval);
  }
  for (const interval of [null, '450', 0, -1, 0.5, 10001, {}, []]) {
    bridge.Read = () => raw({ status: 'ready', defaultLocation: 'D:/RootSound/project', doubleClickIntervalMs: interval });
    await assert.rejects(port.read(), /无效/);
  }
});

test('library rename edits the real selected song through its domain and keeps music and identities intact', async () => {
  const original = createInitialProjectLibrary('原歌曲'); const before = JSON.parse(original);
  const renamed = renameProjectLibrary(original, '  新歌曲 🌤  '); const after = JSON.parse(renamed);
  const beforeSong = before.drafts.find((draft: {kind:string}) => draft.kind === 'rootsound.song');
  const afterSong = after.drafts.find((draft: {kind:string}) => draft.kind === 'rootsound.song');
  assert.equal(afterSong.id, beforeSong.id); assert.deepEqual(afterSong.body, beforeSong.body);
  assert.deepEqual(after.contents, before.contents); assert.equal(afterSong.name, '新歌曲 🌤');
  assert.equal(JSON.parse(original).drafts[0].name, '原歌曲');
  const calls: unknown[][] = []; let entered = 0;
  const setup = createProjectSetup({
    read: async () => ({ defaultLocation: 'D:/RootSound/project' }), chooseLocation: async () => ({ status: 'cancelled' }),
    create: async () => entry, open: async () => ({ status: 'cancelled' }),
    inspect: async selected => { calls.push(['inspect', selected]); return { project: entry, libraryText: original, token: 'checked-version' }; },
    rename: async (selected, name, text, token) => { calls.push(['rename', selected, name, JSON.parse(text).drafts[0].name, token]); return { ...selected, name }; },
  }, () => { entered++; });
  assert.deepEqual(await setup.rename!(entry, ' 新歌曲 🌤 '), { ...entry, name: '新歌曲 🌤' });
  assert.deepEqual(calls, [['inspect', entry], ['rename', entry, '新歌曲 🌤', '新歌曲 🌤', 'checked-version']]);
  assert.equal(entered, 0);
  await assert.rejects(setup.rename!(entry, '../invalid')); assert.equal(calls.length, 2);
});

test('pending library rename excludes open/delete and failure releases the project operation gate', async () => {
  const f = fixture(); let finish!: (value: {project:typeof entry;libraryText:string;token:string}) => void;
  f.directories.inspect = () => new Promise(resolve => { finish = resolve; });
  f.directories.rename = async () => { throw new Error('外部写入冲突'); };
  const setup = createProjectSetup(f.directories, () => { throw new Error('must not navigate'); });
  const pending = setup.rename!(entry, '新名称');
  await assert.rejects(setup.open(), /稍候/); await assert.rejects(setup.remove!(entry), /稍候/);
  finish({ project: entry, libraryText: createInitialProjectLibrary('原名称'), token: 'token' });
  await assert.rejects(pending, /外部写入冲突/);
  f.directories.inspect = async () => { throw new Error('原件被占用'); };
  await assert.rejects(setup.rename!(entry, '新名称'), /原件被占用/);
});

test('confirmed project deletion passes the exact listed path and identity and rejects unsupported or malformed replies', async () => {
  const bridge = directoryBridge(); const calls: unknown[][] = [];
  const port = createDesktopProjectDirectories(bridge);
  await assert.rejects(port.remove!(entry), /尚不支持删除/);
  bridge.Delete = (path, id) => { calls.push([path, id]); return raw({ status: 'deleted' }); };
  await port.remove!(entry); assert.deepEqual(calls, [[entry.path, entry.id]]);
  await assert.rejects(port.remove!({ ...entry, id: '' }), /无效/); assert.equal(calls.length, 1);
  bridge.Delete = () => raw({ status: 'error', message: '这首歌正在编辑' }); await assert.rejects(port.remove!(entry), /正在编辑/);
  bridge.Delete = () => raw({ status: 'saved' }); await assert.rejects(port.remove!(entry), /无效/);
});

test('application deletion is exclusive, never enters a song and allows retry after failure', async () => {
  const f = fixture(); let entered = 0; let finish!: () => void; const removed: unknown[] = [];
  f.directories.remove = project => { removed.push(project); return new Promise(resolve => { finish = resolve; }); };
  const setup = createProjectSetup(f.directories, () => { entered++; });
  const pending = setup.remove!(entry);
  await assert.rejects(setup.open(), /稍候/); await assert.rejects(setup.remove!(entry), /稍候/);
  finish(); await pending; assert.deepEqual(removed, [entry]); assert.equal(entered, 0);
  f.directories.remove = async () => { throw new Error('工程被占用'); };
  await assert.rejects(setup.remove!(entry), /被占用/); assert.equal(entered, 0);
  f.directories.remove = async project => { removed.push(project); };
  await setup.remove!(entry); assert.equal(removed.length, 2); assert.equal(entered, 0);
});

test('default project listing and path opening do not invoke the custom folder picker', async () => {
  const bridge = directoryBridge(); let dialogs = 0; const opened: string[] = [];
  bridge.List = () => raw({ status: 'listed', projects: [entry] });
  bridge.Open = () => { dialogs++; return raw({ status: 'cancelled' }); };
  bridge.OpenKnown = path => { opened.push(path); return raw({ status: 'opened', project: entry }); };
  const port = createDesktopProjectDirectories(bridge);
  assert.deepEqual(await port.list!(), [entry]); assert.equal(dialogs, 0);
  assert.equal((await port.open(entry.path)).status, 'opened'); assert.deepEqual(opened, [entry.path]); assert.equal(dialogs, 0);
  assert.equal((await port.open()).status, 'cancelled'); assert.equal(dialogs, 1);
  for (const value of [{ status: 'listed' }, { status: 'listed', projects: [{ ...entry, name: '' }] }, { status: 'listed', projects: [entry, entry] }]) {
    bridge.List = () => raw(value); await assert.rejects(port.list!(), /无效/);
  }
  await assert.rejects(port.open('  '), /不支持直接打开/); assert.equal(opened.length, 1);
});

test('Save As uses an explicit copy bridge independently of ordinary project creation', async () => {
  const bridge = directoryBridge(); const requests: string[][] = [];
  bridge.Create = () => { throw new Error('ordinary create must not switch a dirty project'); };
  bridge.CreateCopy = (name, location, text) => { requests.push([name, location, text]); return raw({ status: 'created', project: { ...entry, name } }); };
  const port = createDesktopProjectDirectories(bridge);
  assert.equal((await port.createCopy!('副本', 'E:\\副本', 'working snapshot')).name, '副本');
  assert.deepEqual(requests, [['副本', 'E:\\副本', 'working snapshot']]);
  bridge.CreateCopy = () => raw({ status: 'error', message: '副本位置不可写' });
  await assert.rejects(port.createCopy!('副本', 'E:\\副本', 'working snapshot'), /不可写/u);
});

test('manual save and save-exit pass the current project title while legacy unnamed calls remain explicit', async () => {
  const bridge = directoryBridge(); const saves: string[] = []; const exits: [string, string][] = [];
  bridge.Save = name => { saves.push(name!); return raw({ status: 'saved', project: { ...entry, name: name || entry.name } }); };
  bridge.Exit = (mode, name) => { exits.push([mode, name!]); return raw({ status: 'exited' }); };
  const port = createDesktopProjectDirectories(bridge);
  assert.equal((await port.save!('新的标题')).name, '新的标题'); await port.save!();
  await port.exit!('save', '退出时标题'); await port.exit!('discard');
  assert.deepEqual(saves, ['新的标题', '']); assert.deepEqual(exits, [['save', '退出时标题'], ['discard', '']]);
});
function fixture() {
  const requests: { name: string; location: string; text: string }[] = [];
  let entered = 0;
  const directories: ProjectDirectoriesPort = {
    read: async () => ({ defaultLocation: 'D:\\RootSound\\project' }),
    chooseLocation: async () => ({ status: 'cancelled' }),
    create: async (name, location, text) => { requests.push({ name, location, text }); return { ...entry, name }; },
    open: async () => ({ status: 'cancelled' }),
  };
  return { directories, requests, setup: createProjectSetup(directories, () => { entered++; }), get entered() { return entered; } };
}

test('a named project reopens through real song services and has fresh identities with no other project material', () => {
  const a = createInitialProjectLibrary('  清晨 🌤  '), b = createInitialProjectLibrary('清晨 🌤');
  const first = createMaterialLibrary({ read: () => a, write() { throw new Error('read-only reopen'); } });
  const second = createMaterialLibrary({ read: () => b, write() { throw new Error('read-only reopen'); } });
  const song = createSongEditor(first, createPhrasePlayback(first, createTimbrePlayback(first)), { defaultTempoMode: 'source' });
  assert.equal(song.read().draft?.name, '清晨 🌤');
  assert.equal(song.read().body?.tempoMode, 'source');
  assert.equal(song.read().body?.tracks.length, 7);
  assert.equal(song.read().body?.tracks[0]?.clips.length, 0);
  assert.deepEqual(new Set(first.listContent().map(item => item.name)), new Set(['钢琴', '长笛', '底鼓', '踢', '弦乐', '小号', '吉他']));
  assert(first.listContent().every(item => !second.listContent().some(other => other.id === item.id)));
  assert.equal(first.listDrafts().length, 1);
  assert.notEqual(first.listDrafts()[0]?.id, second.listDrafts()[0]?.id);
});

test('invalid project names or empty locations never reach the disk service', async () => {
  const f = fixture();
  for (const name of ['', '  ', '../old', 'a/b', 'a\\b', 'a:b', 'CON', 'con.txt', 'LPT1', 'COM¹.txt', '结尾.', 'a\u0000b', '曲'.repeat(81)])
    await assert.rejects(f.setup.create(name, 'D:\\RootSound\\project'));
  await assert.rejects(f.setup.create('好名字', '   '));
  assert.equal(f.requests.length, 0); assert.equal(f.entered, 0);
});

test('creation uses the chosen parent and enters only after successful persistence; failures retain the entry flow', async () => {
  const f = fixture();
  assert.equal(await f.setup.defaultLocation(), 'D:\\RootSound\\project');
  await f.setup.create('  清晨 🌤  ', 'E:\\我的音乐');
  assert.equal(f.requests[0]?.name, '清晨 🌤'); assert.equal(f.requests[0]?.location, 'E:\\我的音乐');
  assert.equal(f.entered, 1);
  f.directories.create = async () => { throw new Error('同名项目已经存在'); };
  await assert.rejects(f.setup.create('清晨 🌤', 'E:\\我的音乐'), /同名/);
  assert.equal(f.entered, 1);
});

test('a pending create cannot create another directory or open a different project', async () => {
  const f = fixture(); let finish!: () => void;
  f.directories.create = () => new Promise(resolve => { finish = () => resolve(entry); });
  const pending = f.setup.create(entry.name, 'D:\\RootSound\\project');
  await assert.rejects(f.setup.create('另一首', 'D:\\RootSound\\project'), /稍候/);
  await assert.rejects(f.setup.open(), /稍候/);
  assert.equal(f.entered, 0); finish(); await pending; assert.equal(f.entered, 1);
});

test('cancelled folder selection or project open keeps the current screen; open failure never enters', async () => {
  const f = fixture(); assert.deepEqual(await f.setup.chooseLocation('D:\\RootSound\\project'), { status: 'cancelled' });
  await f.setup.open(); assert.equal(f.entered, 0);
  f.directories.open = async () => { throw new Error('项目文件损坏'); };
  await assert.rejects(f.setup.open(), /损坏/); assert.equal(f.entered, 0);
  f.directories.open = async () => ({ status: 'opened', project: entry });
  await f.setup.open(); assert.equal(f.entered, 1);
});

test('native directory bridge validates ready/current/create/open responses without treating errors as success', async () => {
  const bridge = directoryBridge(), port = createDesktopProjectDirectories(bridge);
  assert.deepEqual(await port.read(), { defaultLocation: 'D:\\RootSound\\project' });
  assert.deepEqual(await port.create(entry.name, 'D:\\RootSound\\project', '{}'), entry);
  assert.deepEqual(await port.open(), { status: 'cancelled' });
  bridge.Read = () => raw({ status: 'ready', defaultLocation: 'D:\\RootSound\\project', current: entry });
  assert.deepEqual((await port.read()).current, entry);
  bridge.ChooseLocation = () => raw({ status: 'chosen', path: 'E:\\音乐' });
  assert.deepEqual(await port.chooseLocation('D:\\RootSound\\project'), { status: 'chosen', path: 'E:\\音乐' });
  bridge.Open = () => raw({ status: 'opened', project: entry }); assert.equal((await port.open()).status, 'opened');
  bridge.Create = () => raw({ status: 'error', message: '拒绝覆盖旧项目' });
  await assert.rejects(port.create(entry.name, 'D:\\RootSound\\project', '{}'), /拒绝覆盖/);
  for (const value of [{ status: 'created' }, { status: 'created', project: { ...entry, path: '' } }, { status: 'saved', project: entry }]) {
    bridge.Create = () => raw(value); await assert.rejects(port.create(entry.name, 'D:\\RootSound\\project', '{}'), /无效/);
  }
});

test('old editor storage remains bound to its original scope after a project switch', () => {
  let scope = 'first', stored: string | null = null; const writes: string[] = [];
  const bridge: DesktopBridge = {
    projectDirectories: directoryBridge(),
    storage: { Read: () => JSON.stringify({ ok: true, value: stored, scope }),
      Write: () => { throw new Error('must use scoped writes'); },
      WriteScoped(value, token) {
        if (token !== scope) return JSON.stringify({ ok: false, error: '项目已切换' });
        stored = value; writes.push(value); return '{"ok":true}';
      } },
    files: { Open: () => raw({ status: 'cancelled' }), Save: () => raw({ status: 'cancelled' }) },
    audioFiles: { Save: () => raw({ status: 'cancelled' }) },
  };
  const old = createDesktopPlatform(bridge).storage; assert.equal(old.read(), null); old.write('first project');
  scope = 'second'; stored = null;
  assert.throws(() => old.write('stale data'), /切换/);
  assert.throws(() => old.read(), /切换/); assert.equal(stored, null);
  const current = createDesktopPlatform(bridge).storage; current.read(); current.write('second project');
  assert.deepEqual(writes, ['first project', 'second project']);
});

test('save checkpoints the original directory while save-as captures a named independent copy', async () => {
  const original = createInitialProjectLibrary('原名称');
  const root = JSON.parse(original).drafts.find((draft: { kind: string }) => draft.kind === 'rootsound.song').id as string;
  const copied = createProjectCopyLibrary(original, '原名称 1', root);
  assert.equal(JSON.parse(original).drafts.find((draft: { id: string }) => draft.id === root).name, '原名称');
  assert.equal(JSON.parse(copied).drafts.find((draft: { id: string }) => draft.id === root).name, '原名称 1');
  const f = fixture(); let saves = 0;
  f.directories.save = async () => { saves++; return entry; };
  const service = createProjectSetup(f.directories, () => {}, { read: () => original, songDraftId: () => root });
  await service.save!(); assert.equal(saves, 1); assert.equal(f.requests.length, 0);
  await service.saveAs!('原名称 1', 'E:\\副本');
  assert.equal(f.requests[0]?.location, 'E:\\副本');
  assert.equal(f.requests[0]?.name, '原名称 1');
  const decoded = JSON.parse(f.requests[0]!.text);
  assert.equal(decoded.drafts.find((draft: { id: string }) => draft.id === root).name, '原名称 1');
  assert.deepEqual(decoded.drafts.find((draft: { id: string }) => draft.id === root).body, JSON.parse(original).drafts.find((draft: { id: string }) => draft.id === root).body);
});

test('project Save, Save As and save-exit refuse unfinished phrase edits while discard remains available', async () => {
  const original = createInitialProjectLibrary('保存边界');
  const root = JSON.parse(original).drafts.find((draft: { kind: string }) => draft.kind === 'rootsound.song').id as string;
  const f = fixture(); let prepares = 0, saves = 0, copies = 0; const exits: string[] = [];
  f.directories.save = async () => { saves++; return entry; };
  f.directories.createCopy = async () => { copies++; return entry; };
  f.directories.exit = async mode => { exits.push(mode); };
  const service = createProjectSetup(f.directories, () => {}, { read: () => original, songDraftId: () => root,
    prepareSave() { prepares++; throw new Error('请先保存或放弃乐句草稿'); } });
  await assert.rejects(service.save!(), /乐句草稿/u);
  await assert.rejects(service.saveAs!('保存边界 1', 'E:\\副本'), /乐句草稿/u);
  await assert.rejects(service.exit!('save'), /乐句草稿/u);
  await service.exit!('discard');
  assert.equal(prepares, 3); assert.equal(saves, 0); assert.equal(copies, 0); assert.equal(f.requests.length, 0); assert.deepEqual(exits, ['discard']);
});

test('Save As waits for field preparation and snapshots only the prepared working state', async () => {
  let current = createInitialProjectLibrary('准备前');
  const root = JSON.parse(current).drafts.find((draft: { kind: string }) => draft.kind === 'rootsound.song').id as string;
  const f = fixture(); let savedText = ''; let ordinaryCreates = 0;
  f.directories.create = async () => { ordinaryCreates++; return entry; };
  f.directories.createCopy = async (_name, _location, text) => { savedText = text; return entry; };
  const service = createProjectSetup(f.directories, () => {}, { read: () => current, songDraftId: () => root,
    async prepareSave() { await Promise.resolve(); current = renameProjectLibrary(current, '准备后的工作名'); } });
  await service.saveAs!('明确的副本', 'E:\\副本');
  assert.equal(ordinaryCreates, 0);
  assert.equal(JSON.parse(savedText).drafts.find((draft: { id: string }) => draft.id === root).name, '明确的副本');
  assert.equal(JSON.parse(current).drafts.find((draft: { id: string }) => draft.id === root).name, '准备后的工作名');
});

test('window-close preparation flushes without saving and still allows discard when phrase saving is blocked', async () => {
  const calls: string[] = []; let failed = false;
  const prepare = createProjectClosePreparation({ async flush() { calls.push('flush'); await Promise.resolve(); },
    assertSaveReady() { calls.push('check'); if (failed) throw new Error('还有乐句草稿'); }, name: () => '正在编辑的歌' });
  assert.deepEqual(await prepare(), { ready: true, canSave: true, name: '正在编辑的歌' });
  failed = true;
  assert.deepEqual(await prepare(), { ready: true, canSave: false, name: '正在编辑的歌', saveMessage: '还有乐句草稿' });
  assert.deepEqual(calls, ['flush', 'check', 'flush', 'check']);
  const invalid = createProjectClosePreparation({ flush() { throw new Error('名称无效'); }, assertSaveReady() { throw new Error('must not run'); }, name: () => '旧名' });
  assert.deepEqual(await invalid(), { ready: true, canSave: false, name: '旧名', saveMessage: '名称无效' });
});

test('failed save-as cannot enter the copy or mutate its source, and a failed checkpoint is not success', async () => {
  const original = createInitialProjectLibrary('保留');
  const root = JSON.parse(original).drafts.find((draft: { kind: string }) => draft.kind === 'rootsound.song').id as string;
  const f = fixture(); let entered = 0;
  f.directories.create = async () => { throw new Error('同名目录'); };
  f.directories.save = async () => { throw new Error('磁盘不可写'); };
  const service = createProjectSetup(f.directories, () => { entered++; }, { read: () => original, songDraftId: () => root });
  await assert.rejects(service.saveAs!('保留 1', 'E:\\副本'), /同名/);
  await assert.rejects(service.save!(), /不可写/);
  assert.equal(entered, 0); assert.equal(JSON.parse(original).drafts.find((draft: { id: string }) => draft.id === root).name, '保留');
});

test('project exit bridge exposes dirty state and passes only supported exit modes', async () => {
  const bridge = directoryBridge(); const calls: string[] = [];
  bridge.Read = () => raw({ status: 'ready', defaultLocation: 'D:\\RootSound\\project', current: entry, hasUnsavedChanges: true });
  bridge.Exit = mode => { calls.push(mode); return raw({ status: 'exited' }); };
  const port = createDesktopProjectDirectories(bridge);
  assert.equal((await port.read()).hasUnsavedChanges, true);
  await port.exit!('save'); await port.exit!('discard');
  assert.deepEqual(calls, ['save', 'discard']);
  await assert.rejects(port.exit!('unknown' as never), /请选择/); assert.equal(calls.length, 2);
  bridge.Read = () => raw({ status: 'ready', defaultLocation: 'D:\\RootSound\\project', hasUnsavedChanges: 'yes' });
  await assert.rejects(port.read(), /无效/);
});

test('exit and loader acknowledgements reject failed or malformed native results without reporting success', async () => {
  const bridge = directoryBridge(); const port = createDesktopProjectDirectories(bridge);
  await assert.rejects(port.exit!('discard'), /尚不支持退出/);
  await port.finishLoading!();
  let initializations = 0;
  bridge.FinishLoading = () => { initializations++; return raw({ status: 'ready' }); };
  await port.finishLoading!(); assert.equal(initializations, 1);
  bridge.FinishLoading = () => raw({ status: 'error', message: '加载未完成' });
  await assert.rejects(port.finishLoading!(), /加载未完成/);
  bridge.FinishLoading = () => raw({ status: 'saved' }); await assert.rejects(port.finishLoading!(), /无效/);
  bridge.Exit = () => raw({ status: 'error', message: '外部文件已改变' });
  await assert.rejects(port.exit!('discard'), /外部文件已改变/);
  bridge.Exit = () => raw({ status: 'saved' }); await assert.rejects(port.exit!('save'), /无效/);
});
