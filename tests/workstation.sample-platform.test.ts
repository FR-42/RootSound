import assert from 'node:assert/strict';
import { test } from 'node:test';
import { MAX_SAMPLE_FILE_BYTES } from '../src/workstation/contracts/files.ts';
import { createDesktopPlatform, type DesktopBridge } from '../src/workstation/app/platform/desktop.ts';
import { createBrowserSampleFiles, createDesktopSampleFiles } from '../src/workstation/app/platform/sample-files.ts';

function replaceGlobal(name: string, value: unknown): () => void {
  const before = Object.getOwnPropertyDescriptor(globalThis, name); Object.defineProperty(globalThis, name, { value, configurable: true, writable: true });
  return () => { if (before) Object.defineProperty(globalThis, name, before); else Reflect.deleteProperty(globalThis, name); };
}
function bridgeFixture() {
  let opened: unknown = { status: 'opened', name: '雨声 🌧.wav', base64: 'AP8BgA==', mimeType: 'application/octet-stream' };
  const bridge: DesktopBridge = {
    storage: { Read: () => '{"ok":true,"value":null}', Write: () => '{"ok":true}' },
    files: { Open: async () => '{"status":"cancelled"}', Save: async () => '{"status":"cancelled"}' },
    audioFiles: { Save: async () => '{"status":"cancelled"}' },
    sampleFiles: { Open: async () => JSON.stringify(opened) },
  };
  return { bridge, result: (value: unknown) => { opened = value; } };
}
type SelectedFile = { name: string; type: string; size: number; arrayBuffer(): Promise<ArrayBuffer> };
class TestInput extends EventTarget {
  type = ''; accept = ''; multiple = false; hidden = false; removed = false; clicked = false; files: SelectedFile[] = [];
  click(): void { this.clicked = true; }
  remove(): void { this.removed = true; }
}
function documentFixture() {
  const inputs: TestInput[] = [];
  const restore = replaceGlobal('document', { createElement: () => { const input = new TestInput(); inputs.push(input); return input; }, body: { append: () => {} } });
  function select(file: SelectedFile): TestInput { const input = inputs.at(-1)!; input.files = [file]; input.dispatchEvent(new Event('change')); return input; }
  return { inputs, select, restore };
}
function file(bytes = Uint8Array.from([0, 255, 1, 128]), name = '素材.wav', type = 'audio/wav'): SelectedFile {
  return { name, type, size: bytes.byteLength, arrayBuffer: async () => bytes.buffer as ArrayBuffer };
}

test('native sample import retains exact opaque bytes and honest MIME hints, including cancellation', async () => {
  const fixture = bridgeFixture(); const files = createDesktopPlatform(fixture.bridge).sampleFiles;
  const opened = await files.open(); assert.deepEqual(opened, { status: 'opened', name: '雨声 🌧.wav', bytes: Uint8Array.from([0, 255, 1, 128]), mimeType: 'application/octet-stream' });
  if (opened.status === 'opened') opened.bytes[0] = 99;
  const fresh = await files.open(); assert.equal(fresh.status === 'opened' ? fresh.bytes[0] : undefined, 0);
  fixture.result({ status: 'opened', name: 'unknown.bin', base64: 'AA==', mimeType: '' });
  assert.equal((await files.open()).status, 'opened');
  fixture.result({ status: 'cancelled' }); assert.deepEqual(await files.open(), { status: 'cancelled' });
});

test('old desktop windows preserve their other capabilities and never silently substitute browser sampling', async () => {
  const fixture = bridgeFixture(); delete fixture.bridge.sampleFiles; let touchedBrowser = false;
  const restore = replaceGlobal('document', { createElement: () => { touchedBrowser = true; throw new Error('unexpected browser'); } });
  try {
    const platform = createDesktopPlatform(fixture.bridge); assert.equal(platform.storage.read(), null);
    assert.deepEqual(await platform.files.open(), { status: 'cancelled' }); await assert.rejects(platform.sampleFiles.open(), /旧窗口/);
    assert.equal(touchedBrowser, false);
  } finally { restore(); }
});

test('old hosts rejecting the optional sampling property still start normally', async () => {
  const fixture = bridgeFixture(); const host = { sync: { storage: fixture.bridge.storage }, files: fixture.bridge.files, audioFiles: fixture.bridge.audioFiles };
  Object.defineProperty(host, 'sampleFiles', { get() { throw new Error('unknown host object'); } });
  const restore = [replaceGlobal('location', { origin: 'https://rootsound.local' }), replaceGlobal('chrome', { webview: { hostObjects: host } })];
  try { const platform = createDesktopPlatform(); assert.equal(platform.storage.read(), null); await assert.rejects(platform.sampleFiles.open(), /旧窗口/); }
  finally { restore.reverse().forEach(action => action()); }
});

test('native malformed results, invalid base64 and explicit read failures are never accepted as sample bytes', async () => {
  const fixture = bridgeFixture(); const files = createDesktopPlatform(fixture.bridge).sampleFiles;
  fixture.result({ status: 'error', message: '文件已被移走' }); await assert.rejects(files.open(), /已被移走/);
  for (const result of [null, [], {}, { status: 'opened', name: '', base64: 'AA==', mimeType: 'audio/wav' }, { status: 'opened', name: '音频', base64: 'AA==' }]) {
    fixture.result(result); await assert.rejects(files.open());
  }
  for (const base64 of ['', '?===', 'A===', 'AAA', 'AA==AAAA', 'AA==\n', '====']) {
    fixture.result({ status: 'opened', name: '素材', mimeType: 'audio/wav', base64 }); await assert.rejects(files.open());
  }
  fixture.bridge.sampleFiles!.Open = async () => 'not JSON'; await assert.rejects(files.open(), /无法读取/);
  fixture.bridge.sampleFiles!.Open = async () => { throw new Error('COM unavailable'); }; await assert.rejects(files.open(), /本机文件选择服务/);
  fixture.bridge.sampleFiles!.Open = async () => '{"status":"cancelled"}'; assert.deepEqual(await files.open(), { status: 'cancelled' });
});

test('native sample limits use decoded bytes and reject oversized transfer data', async () => {
  const fixture = bridgeFixture(); const files = createDesktopPlatform(fixture.bridge).sampleFiles;
  const maximum = Buffer.alloc(MAX_SAMPLE_FILE_BYTES, 0); maximum[maximum.length - 1] = 255;
  fixture.result({ status: 'opened', name: '边界.bin', mimeType: 'application/octet-stream', base64: maximum.toString('base64') });
  const opened = await files.open(); assert.equal(opened.status === 'opened' ? opened.bytes.byteLength : undefined, MAX_SAMPLE_FILE_BYTES);
  assert.equal(opened.status === 'opened' ? opened.bytes.at(-1) : undefined, 255);
  fixture.result({ status: 'opened', name: '超限.bin', mimeType: 'application/octet-stream', base64: Buffer.alloc(MAX_SAMPLE_FILE_BYTES + 1).toString('base64') });
  await assert.rejects(files.open(), /大小范围/);
  fixture.result({ status: 'opened', name: '超长.bin', mimeType: '', base64: 'A'.repeat(Math.ceil(MAX_SAMPLE_FILE_BYTES / 3) * 4 + 4) });
  await assert.rejects(files.open(), /大小范围/);
});

test('native file-picker reentry is rejected until the original request finishes', async () => {
  let finish: ((value: string) => void) | undefined;
  const files = createDesktopSampleFiles({ Open: () => new Promise(resolve => { finish = resolve; }) });
  const opening = files.open(); await assert.rejects(files.open(), /选择窗口/); finish!('{"status":"cancelled"}');
  assert.deepEqual(await opening, { status: 'cancelled' });
  const again = files.open(); finish!('{"status":"cancelled"}'); assert.deepEqual(await again, { status: 'cancelled' });
});

test('browser picker is specific to audio selection, cancels honestly and releases its guard', async () => {
  const document = documentFixture(); const files = createBrowserSampleFiles();
  try {
    const opening = files.open(); const input = document.inputs[0]!;
    assert.equal(input.type, 'file'); assert.equal(input.accept, 'audio/*'); assert.equal(input.multiple, false); assert.equal(input.clicked, true);
    await assert.rejects(files.open(), /选择窗口/); input.dispatchEvent(new Event('cancel'));
    assert.deepEqual(await opening, { status: 'cancelled' }); assert.equal(input.removed, true);
    const emptySelection = files.open(); document.inputs.at(-1)!.dispatchEvent(new Event('change')); assert.deepEqual(await emptySelection, { status: 'cancelled' });
  } finally { document.restore(); }
});

test('browser import preserves exact original bytes independently of MIME and extension', async () => {
  const document = documentFixture(); const files = createBrowserSampleFiles(); const original = Uint8Array.from([0, 255, 1, 128]);
  try {
    const opening = files.open(); const input = document.select(file(original, '任意内容.wav', 'audio/wav')); const result = await opening;
    assert.deepEqual(result, { status: 'opened', name: '任意内容.wav', bytes: original, mimeType: 'audio/wav' }); assert.equal(input.removed, true);
    if (result.status === 'opened') result.bytes[0] = 99; assert.equal(original[0], 0);
    const unknown = files.open(); document.select(file(original, '内容无扩展名', '')); const fallback = await unknown;
    assert.equal(fallback.status === 'opened' ? fallback.mimeType : undefined, 'application/octet-stream');
  } finally { document.restore(); }
});

test('browser preflight size rejection never reads oversized or empty source files', async () => {
  const document = documentFixture(); const files = createBrowserSampleFiles(); let reads = 0;
  try {
    for (const size of [0, MAX_SAMPLE_FILE_BYTES + 1, Number.NaN, -1]) {
      const opening = files.open(); document.select({ name: '不可读.wav', type: '', size, arrayBuffer: async () => { reads++; return new ArrayBuffer(0); } });
      await assert.rejects(opening); assert.equal(document.inputs.at(-1)!.removed, true);
    }
    assert.equal(reads, 0);
  } finally { document.restore(); }
});

test('browser rejects changed bytes and read failures, then allows another import', async () => {
  const document = documentFixture(); const files = createBrowserSampleFiles();
  try {
    const mismatch = files.open(); document.select({ ...file(), size: 1 }); await assert.rejects(mismatch, /发生变化/);
    const tooLarge = files.open(); document.select({ ...file(), arrayBuffer: async () => new ArrayBuffer(MAX_SAMPLE_FILE_BYTES + 1) }); await assert.rejects(tooLarge, /大小范围/);
    const empty = files.open(); document.select({ ...file(), arrayBuffer: async () => new ArrayBuffer(0) }); await assert.rejects(empty, /没有可读取/);
    for (const read of [() => { throw new Error('同步读取失败'); }, () => Promise.reject(new Error('异步读取失败'))]) {
      const failure = files.open(); document.select({ ...file(), arrayBuffer: read }); await assert.rejects(failure, /读取失败/);
    }
    const again = files.open(); document.select(file()); assert.equal((await again).status, 'opened');
  } finally { document.restore(); }
});

test('browser remains busy while original bytes are being read', async () => {
  const document = documentFixture(); const files = createBrowserSampleFiles(); let finish: ((value: ArrayBuffer) => void) | undefined;
  try {
    const opening = files.open(); document.select({ ...file(), arrayBuffer: () => new Promise(resolve => { finish = resolve; }) });
    await Promise.resolve(); await assert.rejects(files.open(), /选择窗口/); finish!(Uint8Array.from([0, 255, 1, 128]).buffer);
    assert.equal((await opening).status, 'opened');
  } finally { document.restore(); }
});

test('browser setup and picker failures release the file-operation guard', async () => {
  const files = createBrowserSampleFiles(); let createCount = 0;
  const restore = replaceGlobal('document', { createElement: () => {
    if (createCount++ === 0) throw new Error('创建失败');
    const input = new TestInput(); input.click = () => { throw new Error('打开失败'); }; return input;
  }, body: { append: () => {} } });
  try { await assert.rejects(files.open(), /创建失败/); await assert.rejects(files.open(), /打开失败/); await assert.rejects(files.open(), /打开失败/); }
  finally { restore(); }
});
