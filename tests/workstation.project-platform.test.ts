import assert from 'node:assert/strict';
import { test } from 'node:test';
import { MAX_PROJECT_FILE_BYTES, MAX_SOUND_FILE_BYTES } from '../src/workstation/contracts/files.ts';
import { createDesktopPlatform, type DesktopBridge } from '../src/workstation/app/platform/desktop.ts';
import { createBrowserProjectFiles } from '../src/workstation/app/platform/browser-files.ts';

const project = (name = '雨后的琴声 🌧') => JSON.stringify({ format: 'RootSoundProject', version: 1, name, opaque: { preserve: '音乐数据由所属模块判断' } });
function replaceGlobal(name: string, value: unknown): () => void {
  const before = Object.getOwnPropertyDescriptor(globalThis, name); Object.defineProperty(globalThis, name, { value, configurable: true, writable: true });
  return () => { if (before) Object.defineProperty(globalThis, name, before); else Reflect.deleteProperty(globalThis, name); };
}
function fixture() {
  let opened: unknown = { status: 'opened', name: '中文工程.rsproject', text: project() };
  let saved: unknown = { status: 'saved', name: '真实保存名.rsproject' };
  const projectWrites: [string, string][] = [];
  const bridge: DesktopBridge = {
    storage: { Read: () => '{"ok":true,"value":null}', Write: () => '{"ok":true}' },
    files: { Open: async () => '{"status":"cancelled"}', Save: async () => '{"status":"cancelled"}' },
    audioFiles: { Save: async () => '{"status":"cancelled"}' },
    projectFiles: { Open: async () => JSON.stringify(opened), Save: async (text, name) => { projectWrites.push([text, name]); return JSON.stringify(saved); } },
  };
  return { bridge, projectWrites, openResult: (value: unknown) => { opened = value; }, saveResult: (value: unknown) => { saved = value; } };
}
class TestElement extends EventTarget {
  type = ''; accept = ''; multiple = false; hidden = false; href = ''; download = ''; removed = false; clicked = false;
  files: { name: string; size: number; arrayBuffer(): Promise<ArrayBuffer> }[] = [];
  click(): void { this.clicked = true; }
  remove(): void { this.removed = true; }
}
function documentFixture() {
  const elements: TestElement[] = []; const appended: TestElement[] = [];
  const restore = replaceGlobal('document', { createElement: () => { const element = new TestElement(); elements.push(element); return element; }, body: { append: (element: TestElement) => appended.push(element) } });
  return { elements, appended, restore };
}
function bytes(text: string): ArrayBuffer { return new TextEncoder().encode(text).buffer; }
function selected(document: ReturnType<typeof documentFixture>, content: ArrayBuffer, name = '工程.rsproject') {
  const input = document.elements.at(-1)!;
  input.files = [{ name, size: content.byteLength, arrayBuffer: async () => content }]; input.dispatchEvent(new Event('change')); return input;
}

test('project transfer is optional on old native bridges and never falls back to browser storage', async () => {
  const f = fixture(); delete f.bridge.projectFiles; let touched = false;
  const restore = replaceGlobal('localStorage', { getItem: () => { touched = true; return null; } });
  try {
    const platform = createDesktopPlatform(f.bridge); assert.equal(platform.storage.read(), null);
    assert.deepEqual(await platform.files.open(), { status: 'cancelled' });
    await assert.rejects(platform.projectFiles.open(), /旧窗口/); await assert.rejects(platform.projectFiles.save(project(), '工程'), /旧窗口/);
    assert.equal(touched, false);
  } finally { restore(); }
});

test('an older host rejecting an unknown project capability does not prevent normal desktop startup', async () => {
  const f = fixture(); const host = { sync: { storage: f.bridge.storage }, files: f.bridge.files, audioFiles: f.bridge.audioFiles };
  Object.defineProperty(host, 'projectFiles', { get() { throw new Error('unknown host object'); } });
  const restore = [replaceGlobal('location', { origin: 'https://rootsound.local' }), replaceGlobal('chrome', { webview: { hostObjects: host } })];
  try { const platform = createDesktopPlatform(); assert.equal(platform.storage.read(), null); await assert.rejects(platform.projectFiles.open(), /旧窗口/); }
  finally { restore.reverse().forEach(action => action()); }
});

test('native project files retain Chinese text and distinguish saved names and cancelled operations', async () => {
  const f = fixture(); const files = createDesktopPlatform(f.bridge).projectFiles;
  assert.deepEqual(await files.open(), { status: 'opened', name: '中文工程.rsproject', text: project() });
  assert.deepEqual(await files.save('\ufeff' + project(), '夜雨/合奏.RSPROJECT'), { status: 'saved', name: '真实保存名.rsproject' });
  assert.deepEqual(f.projectWrites, [[project(), '夜雨合奏.rsproject']]);
  f.openResult({ status: 'cancelled' }); f.saveResult({ status: 'cancelled' });
  assert.deepEqual(await files.open(), { status: 'cancelled' }); assert.deepEqual(await files.save(project(), '项目'), { status: 'cancelled' });
});

test('native project failures and malformed bridge responses cannot masquerade as a completed save', async () => {
  const f = fixture(); const files = createDesktopPlatform(f.bridge).projectFiles;
  f.openResult({ status: 'error', message: '工程已被移走' }); f.saveResult({ status: 'error', message: '工程文件被占用' });
  await assert.rejects(files.open(), /已被移走/); await assert.rejects(files.save(project(), '工程'), /被占用/);
  for (const result of [null, [], {}, { status: 'opened', name: '工程' }, { status: 'opened', name: '', text: project() }, { status: 'opened', name: '工程', text: '{}' }]) {
    f.openResult(result); await assert.rejects(files.open());
  }
  for (const result of [null, [], {}, { status: 'saved' }, { status: 'download-started', name: '文件' }]) { f.saveResult(result); await assert.rejects(files.save(project(), '工程')); }
  f.bridge.projectFiles!.Open = async () => { throw new Error('COM proxy unavailable'); };
  await assert.rejects(files.open(), /工程文件服务/);
});

test('project boundaries validate actual UTF-8 bytes and recognizable envelopes before requesting native output', async () => {
  const f = fixture(); const files = createDesktopPlatform(f.bridge).projectFiles;
  const tooLarge = project('声'.repeat(Math.floor(MAX_PROJECT_FILE_BYTES / 3) + 1)); assert.ok(tooLarge.length < MAX_PROJECT_FILE_BYTES);
  for (const text of [tooLarge, '{', '[]', '{"format":"RootSoundSound","version":1}', '{"format":"RootSoundProject","version":3}', '{"format":"RootSoundProject","version":1,"bad":"\ud800"}']) await assert.rejects(files.save(text, '不应写入'));
  assert.deepEqual(f.projectWrites, []);
  f.openResult({ status: 'opened', name: '过大.rsproject', text: tooLarge }); await assert.rejects(files.open(), /大小范围/);
});

test('native project boundaries pass version 2 members verbatim and reject unsupported versions before saving', async () => {
  const f = fixture(); const files = createDesktopPlatform(f.bridge).projectFiles;
  const text = JSON.stringify({ format: 'RootSoundProject', version: 2, rootId: '歌曲', memberIds: ['未编排乐句', '音色'], contents: [{ opaque: '原文 🌧' }] });
  f.openResult({ status: 'opened', name: '成员工程.rsproject', text: '\ufeff' + text });
  assert.deepEqual(await files.open(), { status: 'opened', name: '成员工程.rsproject', text });
  assert.equal((await files.save(text, '成员工程')).status, 'saved');
  assert.deepEqual(f.projectWrites, [[text, '成员工程.rsproject']]);
  for (const version of [0, 3, 1.5, -1, '2', null, true]) {
    const invalid = JSON.stringify({ format: 'RootSoundProject', version });
    await assert.rejects(files.save(invalid, '不得覆盖'), /格式或版本/);
    f.openResult({ status: 'opened', name: '无效工程.rsproject', text: invalid });
    await assert.rejects(files.open(), /格式或版本/);
  }
  assert.equal(f.projectWrites.length, 1);
});

test('browser project boundaries accept version 2 without interpreting its members or musical data', async () => {
  const document = documentFixture(); const oldCreate = URL.createObjectURL; const oldRevoke = URL.revokeObjectURL; const oldTimeout = globalThis.setTimeout;
  const text = JSON.stringify({ format: 'RootSoundProject', version: 2, rootId: '歌曲', memberIds: ['还没用的乐句'], contents: [{ opaque: '保留内容' }] });
  let downloaded: Blob | undefined; const deferred: (() => void)[] = [];
  URL.createObjectURL = value => { downloaded = value as Blob; return 'blob:v2-project'; }; URL.revokeObjectURL = () => {};
  globalThis.setTimeout = ((callback: () => void) => { deferred.push(callback); return 1; }) as typeof setTimeout;
  try {
    const files = createBrowserProjectFiles(); const opening = files.open(); selected(document, bytes('\ufeff' + text), '成员工程.rsproject');
    assert.deepEqual(await opening, { status: 'opened', name: '成员工程.rsproject', text });
    assert.deepEqual(await files.save(text, '成员工程'), { status: 'download-started', name: '成员工程.rsproject' });
    assert.equal(await downloaded!.text(), text); deferred.forEach(action => action());
  } finally { URL.createObjectURL = oldCreate; URL.revokeObjectURL = oldRevoke; globalThis.setTimeout = oldTimeout; document.restore(); }
});

test('project transfer accepts a larger independent boundary without changing single-sound limits', async () => {
  const f = fixture(); const platform = createDesktopPlatform(f.bridge); const large = project('声'.repeat(Math.floor(MAX_SOUND_FILE_BYTES / 3) + 1));
  assert.ok(new TextEncoder().encode(large).byteLength > MAX_SOUND_FILE_BYTES);
  assert.equal((await platform.projectFiles.save(large, '大工程')).status, 'saved');
  await assert.rejects(platform.files.save(large, '声音'), /大小范围/);
});

test('browser project picker has a separate extension, refuses reentry, and releases its guard on cancellation', async () => {
  const document = documentFixture(); const files = createBrowserProjectFiles();
  try {
    const opening = files.open(); const input = document.elements[0]!; assert.equal(input.accept, '.rsproject,.json'); assert.equal(input.clicked, true);
    await assert.rejects(files.open(), /选择窗口/); input.dispatchEvent(new Event('cancel')); assert.deepEqual(await opening, { status: 'cancelled' }); assert.equal(input.removed, true);
    const second = files.open(); document.elements.at(-1)!.dispatchEvent(new Event('cancel')); assert.deepEqual(await second, { status: 'cancelled' });
  } finally { document.restore(); }
});

test('browser project input decodes strict UTF-8 and BOM while retaining opaque music for later domain validation', async () => {
  const document = documentFixture(); const files = createBrowserProjectFiles();
  try {
    const opening = files.open(); const input = selected(document, bytes('\ufeff' + project()));
    assert.deepEqual(await opening, { status: 'opened', name: '工程.rsproject', text: project() }); assert.equal(input.removed, true);
    const badUtf8 = files.open(); selected(document, Uint8Array.from([0x7b, 0xc3, 0x28, 0x7d]).buffer); await assert.rejects(badUtf8, /UTF-8/);
    const badEnvelope = files.open(); selected(document, bytes('{"format":"RootSoundSound","version":1}')); await assert.rejects(badEnvelope, /格式或版本/);
    const again = files.open(); selected(document, bytes(project('重新可用'))); assert.equal((await again).status, 'opened');
  } finally { document.restore(); }
});

test('browser project read rejects oversized metadata before reading and keeps genuine read failures', async () => {
  const document = documentFixture(); const files = createBrowserProjectFiles(); let read = false;
  try {
    const large = files.open(); const input = document.elements.at(-1)!;
    input.files = [{ name: '过大.rsproject', size: MAX_PROJECT_FILE_BYTES + 1, arrayBuffer: async () => { read = true; return new ArrayBuffer(0); } }];
    input.dispatchEvent(new Event('change')); await assert.rejects(large, /大小范围/); assert.equal(read, false);
    const broken = files.open(); const failing = document.elements.at(-1)!;
    failing.files = [{ name: '失效.rsproject', size: 1, arrayBuffer: () => { throw new Error('文件读取失败'); } }]; failing.dispatchEvent(new Event('change'));
    await assert.rejects(broken, /读取失败/); assert.equal(failing.removed, true);
  } finally { document.restore(); }
});

test('browser project download transfers exact UTF-8 text and never claims the disk write completed', async () => {
  const document = documentFixture(); const oldCreate = URL.createObjectURL; const oldRevoke = URL.revokeObjectURL; const oldTimeout = globalThis.setTimeout;
  let downloaded: Blob | undefined; const released: string[] = []; const deferred: (() => void)[] = [];
  URL.createObjectURL = value => { downloaded = value as Blob; return 'blob:project'; }; URL.revokeObjectURL = value => released.push(value);
  globalThis.setTimeout = ((callback: () => void) => { deferred.push(callback); return 1; }) as typeof setTimeout;
  try {
    const files = createBrowserProjectFiles(); const result = await files.save(project(), '夜雨/第一首.rsproject');
    assert.deepEqual(result, { status: 'download-started', name: '夜雨第一首.rsproject' }); assert.equal(await downloaded!.text(), project());
    const anchor = document.elements.at(-1)!; assert.equal(anchor.download, '夜雨第一首.rsproject'); assert.equal(anchor.clicked, true); assert.equal(anchor.removed, true);
    assert.deepEqual(released, []); deferred.forEach(action => action()); assert.deepEqual(released, ['blob:project']);
    const before = document.elements.length; await assert.rejects(files.save('{}', '坏文件')); assert.equal(document.elements.length, before);
  } finally { URL.createObjectURL = oldCreate; URL.revokeObjectURL = oldRevoke; globalThis.setTimeout = oldTimeout; document.restore(); }
});
