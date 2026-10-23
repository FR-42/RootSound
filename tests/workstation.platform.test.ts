import assert from 'node:assert/strict';
import { test } from 'node:test';
import { MAX_AUDIO_FILE_BYTES, MAX_SOUND_FILE_BYTES } from '../src/workstation/contracts/files.ts';
import { createDesktopPlatform, isDesktopOrigin, type DesktopBridge } from '../src/workstation/app/platform/desktop.ts';
import { createBrowserAudioFiles, createBrowserSoundFiles } from '../src/workstation/app/platform/browser-files.ts';

function bridgeFixture() {
  let stored: string | null = null;
  let opened: unknown = { status: 'opened', name: '夜雨.rssound', text: '{"name":"夜雨"}' };
  let saved: unknown = { status: 'saved', name: '新想法.rssound' };
  const writes: string[] = [];
  const fileWrites: [string, string][] = [];
  const audioWrites: [string, string][] = [];
  const bridge: DesktopBridge = {
    storage: {
      Read: () => JSON.stringify({ ok: true, value: stored }),
      Write: value => { writes.push(value); stored = value; return '{"ok":true}'; },
    },
    files: {
      Open: async () => JSON.stringify(opened),
      Save: async (text, name) => { fileWrites.push([text, name]); return JSON.stringify(saved); },
    },
    audioFiles: { Save: async (base64, name) => { audioWrites.push([base64, name]); return JSON.stringify(saved); } },
  };
  return {
    bridge, writes, fileWrites, audioWrites,
    openResult: (value: unknown) => { opened = value; },
    saveResult: (value: unknown) => { saved = value; },
  };
}

function replaceGlobal(name: string, value: unknown): () => void {
  const before = Object.getOwnPropertyDescriptor(globalThis, name);
  Object.defineProperty(globalThis, name, { value, configurable: true, writable: true });
  return () => {
    if (before) Object.defineProperty(globalThis, name, before);
    else Reflect.deleteProperty(globalThis, name);
  };
}

test('only the fixed local desktop origin is recognized', () => {
  assert.equal(isDesktopOrigin('https://rootsound.local'), true);
  for (const origin of ['http://rootsound.local', 'https://rootsound.local:444', 'https://rootsound.local.attacker.test',
    'http://127.0.0.1:5178', 'null', '']) assert.equal(isDesktopOrigin(origin), false);
});

test('desktop library reads and writes preserve the actual saved Chinese text', () => {
  const fixture = bridgeFixture();
  const { storage } = createDesktopPlatform(fixture.bridge);
  assert.equal(storage.read(), null);
  storage.write('{"name":"窗边的第一声"}');
  assert.deepEqual(fixture.writes, ['{"name":"窗边的第一声"}']);
  assert.equal(storage.read(), '{"name":"窗边的第一声"}');
});

test('native storage failures and invalid responses cannot appear as an empty library or successful save', () => {
  const fixture = bridgeFixture();
  const platform = createDesktopPlatform(fixture.bridge);
  fixture.bridge.storage.Read = () => '{"ok":false,"error":"原文件无法读取"}';
  assert.throws(() => platform.storage.read(), /原文件无法读取/);
  for (const raw of ['bad json', 'null', '[]', '{"ok":true}', '{"ok":true,"value":1}', '{"value":null}']) {
    fixture.bridge.storage.Read = () => raw;
    assert.throws(() => platform.storage.read());
  }
  fixture.bridge.storage.Write = () => '{"ok":false,"error":"磁盘写满"}';
  assert.throws(() => platform.storage.write('old value'), /磁盘写满/);
  for (const raw of ['bad json', 'null', '{}', '{"ok":"true"}']) {
    fixture.bridge.storage.Write = () => raw;
    assert.throws(() => platform.storage.write('new value'));
  }
  assert.deepEqual(fixture.writes, []);
});

test('a missing native bridge at the desktop origin fails without accessing browser storage', () => {
  let browserStorageAccessed = false;
  const restore = [
    replaceGlobal('location', { origin: 'https://rootsound.local' }),
    replaceGlobal('chrome', { webview: { hostObjects: {} } }),
    replaceGlobal('localStorage', { getItem: () => { browserStorageAccessed = true; return null; } }),
  ];
  try {
    assert.throws(() => createDesktopPlatform(), /未能连接本机存储/);
    assert.equal(browserStorageAccessed, false);
  } finally { restore.reverse().forEach(action => action()); }
});

test('desktop file operations preserve names and contents and distinguish cancellation', async () => {
  const fixture = bridgeFixture();
  const { files } = createDesktopPlatform(fixture.bridge);
  assert.deepEqual(await files.open(), { status: 'opened', name: '夜雨.rssound', text: '{"name":"夜雨"}' });
  assert.deepEqual(await files.save('声音正文', '建议的名字.rssound'), { status: 'saved', name: '新想法.rssound' });
  assert.deepEqual(fixture.fileWrites, [['声音正文', '建议的名字.rssound']]);
  fixture.openResult({ status: 'cancelled' });
  fixture.saveResult({ status: 'cancelled' });
  assert.deepEqual(await files.open(), { status: 'cancelled' });
  assert.deepEqual(await files.save('内容', '名字'), { status: 'cancelled' });
});

test('native file errors and malformed outcomes reject instead of reporting success', async () => {
  const fixture = bridgeFixture();
  const { files } = createDesktopPlatform(fixture.bridge);
  fixture.openResult({ status: 'error', message: '文件已被移动' });
  fixture.saveResult({ status: 'error', message: '没有写入权限' });
  await assert.rejects(files.open(), /文件已被移动/);
  await assert.rejects(files.save('内容', '名字'), /没有写入权限/);
  for (const value of [null, [], {}, { status: 'opened', name: 'x' }, { status: 'opened', name: '', text: 'x' }]) {
    fixture.openResult(value);
    await assert.rejects(files.open());
  }
  for (const value of [null, [], {}, { status: 'saved' }, { status: 'download-started', name: 'x' }]) {
    fixture.saveResult(value);
    await assert.rejects(files.save('内容', '名字'));
  }
  fixture.bridge.files.Open = async () => { throw new Error('宿主连接中断'); };
  await assert.rejects(files.open(), /宿主连接中断/);
});

test('native file size checks use encoded bytes and happen before a save request', async () => {
  const fixture = bridgeFixture();
  const { files } = createDesktopPlatform(fixture.bridge);
  const tooLarge = '声'.repeat(Math.floor(MAX_SOUND_FILE_BYTES / 3) + 1);
  assert.ok(tooLarge.length < MAX_SOUND_FILE_BYTES);
  await assert.rejects(files.save(tooLarge, '名字.rssound'), /大小范围/);
  assert.equal(fixture.fileWrites.length, 0);
  fixture.openResult({ status: 'opened', name: '过大.rssound', text: tooLarge });
  await assert.rejects(files.open(), /大小范围/);
});

class TestElement extends EventTarget {
  type = '';
  accept = '';
  multiple = false;
  hidden = false;
  href = '';
  download = '';
  files: { name: string; size: number; text(): Promise<string> }[] = [];
  removed = false;
  clicked = false;
  click(): void { this.clicked = true; }
  remove(): void { this.removed = true; }
}

function documentFixture() {
  const elements: TestElement[] = [];
  const appended: TestElement[] = [];
  const restore = replaceGlobal('document', {
    createElement: () => { const element = new TestElement(); elements.push(element); return element; },
    body: { append: (element: TestElement) => appended.push(element) },
  });
  return { elements, appended, restore };
}

test('browser file cancellation resolves explicitly, cleans the input and never reads a file', async () => {
  const document = documentFixture();
  try {
    const opening = createBrowserSoundFiles().open();
    const input = document.elements[0]!;
    assert.equal(input.accept, '.rssound,.json');
    assert.equal(input.clicked, true);
    input.dispatchEvent(new Event('cancel'));
    assert.deepEqual(await opening, { status: 'cancelled' });
    assert.equal(input.removed, true);
  } finally { document.restore(); }
});

test('browser opens UTF-8 Chinese text, rejects oversized files before reading, and preserves read errors', async () => {
  const document = documentFixture();
  try {
    const files = createBrowserSoundFiles();
    const opening = files.open();
    const input = document.elements.at(-1)!;
    input.files = [{ name: '第一声.rssound', size: 18, text: async () => '窗边的第一声' }];
    input.dispatchEvent(new Event('change'));
    assert.deepEqual(await opening, { status: 'opened', name: '第一声.rssound', text: '窗边的第一声' });
    assert.equal(input.removed, true);
    let read = false;
    const oversized = files.open();
    const large = document.elements.at(-1)!;
    large.files = [{ name: '太大.rssound', size: MAX_SOUND_FILE_BYTES + 1, text: async () => { read = true; return ''; } }];
    large.dispatchEvent(new Event('change'));
    await assert.rejects(oversized, /大小范围/);
    assert.equal(read, false);
    const unreadable = files.open();
    const invalid = document.elements.at(-1)!;
    invalid.files = [{ name: '失效.rssound', size: 20, text: async () => { throw new Error('文件无法读取'); } }];
    invalid.dispatchEvent(new Event('change'));
    await assert.rejects(unreadable, /文件无法读取/);
  } finally { document.restore(); }
});

test('browser download reports only download-started and keeps Chinese names with the sound extension', async () => {
  const document = documentFixture();
  const previousCreate = URL.createObjectURL;
  const previousRevoke = URL.revokeObjectURL;
  const previousTimeout = globalThis.setTimeout;
  let downloaded: Blob | undefined;
  const released: string[] = [];
  const deferred: (() => void)[] = [];
  URL.createObjectURL = value => { downloaded = value as Blob; return 'blob:sound-file'; };
  URL.revokeObjectURL = value => { released.push(value); };
  globalThis.setTimeout = ((callback: () => void) => { deferred.push(callback); return 1; }) as typeof setTimeout;
  try {
    const files = createBrowserSoundFiles();
    const outcome = await files.save('夜雨里的光', '夜雨/第一声.rssound');
    assert.deepEqual(outcome, { status: 'download-started', name: '夜雨第一声.rssound' });
    assert.equal(await downloaded!.text(), '夜雨里的光');
    const anchor = document.elements.at(-1)!;
    assert.equal(anchor.download, '夜雨第一声.rssound');
    assert.equal(anchor.href, 'blob:sound-file');
    assert.equal(anchor.clicked, true);
    assert.equal(anchor.removed, true);
    assert.equal(released.length, 0);
    deferred.forEach(action => action());
    assert.deepEqual(released, ['blob:sound-file']);
    const previousCount = document.elements.length;
    await assert.rejects(files.save('x'.repeat(MAX_SOUND_FILE_BYTES + 1), '过大'), /过大/);
    assert.equal(document.elements.length, previousCount);
  } finally {
    URL.createObjectURL = previousCreate;
    URL.revokeObjectURL = previousRevoke;
    globalThis.setTimeout = previousTimeout;
    document.restore();
  }
});

function wavFixture(): Uint8Array {
  const bytes = new Uint8Array(50);
  const view = new DataView(bytes.buffer);
  for (const [at, label] of [[0, 'RIFF'], [8, 'WAVE'], [12, 'fmt '], [36, 'data']] as const) {
    [...label].forEach((character, index) => { bytes[at + index] = character.charCodeAt(0); });
  }
  view.setUint32(4, 42, true); view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); view.setUint16(22, 2, true);
  view.setUint32(24, 48000, true); view.setUint32(28, 288000, true);
  view.setUint16(32, 6, true); view.setUint16(34, 24, true);
  view.setUint32(40, 6, true);
  bytes.set([0, 0, 64, 0, 0, 192], 44);
  return bytes;
}

test('native audio save transfers exact WAV bytes, preserves Chinese filename and distinguishes cancellation', async () => {
  const fixture = bridgeFixture();
  const { audioFiles } = createDesktopPlatform(fixture.bridge);
  const bytes = wavFixture();
  fixture.saveResult({ status: 'saved', name: '夜雨.wav' });
  assert.deepEqual(await audioFiles.save(bytes, '夜雨/合奏'), { status: 'saved', name: '夜雨.wav' });
  assert.deepEqual([...Buffer.from(fixture.audioWrites[0]![0], 'base64')], [...bytes]);
  assert.equal(fixture.audioWrites[0]![1], '夜雨合奏.wav');
  fixture.saveResult({ status: 'cancelled' });
  assert.deepEqual(await audioFiles.save(bytes, '夜雨'), { status: 'cancelled' });
  fixture.saveResult({ status: 'error', message: '导出文件被其他程序占用' });
  await assert.rejects(audioFiles.save(bytes, '夜雨'), /其他程序占用/);
  for (const value of [{}, { status: 'saved' }, { status: 'download-started', name: 'x.wav' }]) {
    fixture.saveResult(value);
    await assert.rejects(audioFiles.save(bytes, '夜雨'), /无法确认/);
  }
});

test('native audio rejects malformed RIFF and oversized bytes before invoking its dialog', async () => {
  const fixture = bridgeFixture();
  const { audioFiles } = createDesktopPlatform(fixture.bridge);
  const invalid = wavFixture(); invalid[20] = 3;
  await assert.rejects(audioFiles.save(invalid, '错误'), /24 位 WAV/);
  const invalidLength = wavFixture(); invalidLength[40] = 7;
  await assert.rejects(audioFiles.save(invalidLength, '错误'), /24 位 WAV/);
  await assert.rejects(audioFiles.save(new Uint8Array(MAX_AUDIO_FILE_BYTES + 1), '过大'), /大小范围/);
  assert.deepEqual(fixture.audioWrites, []);
});

test('browser audio download preserves the selected byte view and never claims a completed disk write', async () => {
  const document = documentFixture();
  const oldCreate = URL.createObjectURL;
  const oldRevoke = URL.revokeObjectURL;
  const oldTimeout = globalThis.setTimeout;
  let downloaded: Blob | undefined;
  let revoked = '';
  let release: (() => void) | undefined;
  URL.createObjectURL = value => { downloaded = value as Blob; return 'blob:audio'; };
  URL.revokeObjectURL = value => { revoked = value; };
  globalThis.setTimeout = ((action: () => void) => { release = action; return 1; }) as typeof setTimeout;
  try {
    const whole = new Uint8Array(70);
    whole.set(wavFixture(), 10);
    const bytes = whole.subarray(10, 60);
    const saved = await createBrowserAudioFiles().save(bytes, '夜雨:合奏.WAV');
    assert.deepEqual(saved, { status: 'download-started', name: '夜雨合奏.wav' });
    assert.equal(downloaded!.type, 'audio/wav');
    assert.deepEqual([...new Uint8Array(await downloaded!.arrayBuffer())], [...bytes]);
    assert.equal(document.elements.at(-1)!.removed, true);
    assert.equal(revoked, ''); release!(); assert.equal(revoked, 'blob:audio');
  } finally {
    document.restore(); URL.createObjectURL = oldCreate; URL.revokeObjectURL = oldRevoke;
    globalThis.setTimeout = oldTimeout;
  }
});
