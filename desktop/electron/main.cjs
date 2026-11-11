const { app, BrowserWindow, protocol, ipcMain, dialog, Menu } = require('electron');
const fs = require('node:fs');
const fsp = require('node:fs/promises');
const path = require('node:path');
const { Readable } = require('node:stream');
const { randomUUID } = require('node:crypto');
const { HostClient } = require('./rpc.cjs');
const { seedBundledProjects } = require('./bundled-projects.cjs');

const ORIGIN = 'https://rootsound.local';
app.setName('RootSound');
const base = __dirname;
let window, host, closeAccepted = false, preparingClose = false, pickerBusy = false;
const failure = error => JSON.stringify({ status: 'error', message: error.message ?? String(error), ok: false, error: error.message ?? String(error) });
const cancelled = () => JSON.stringify({ status: 'cancelled' });
const syncMethods = new Set(['storage.Read', 'storage.WriteScoped', 'storage.WriteScopedCheckpoint']);
const projectMethods = new Set(['Read', 'Create', 'CreateCopy', 'CreateDetached', 'List', 'Browse', 'CreateLibraryFolder', 'RenameLibraryEntry', 'DeleteLibraryEntry', 'OpenKnown', 'OpenDocument', 'ReadDocument', 'Delete', 'Inspect', 'Rename', 'Save', 'FinishLoading', 'Exit']);
let lastDirectory;
function trusted(event) {
  return window && event.sender === window.webContents && event.senderFrame === window.webContents.mainFrame
    && new URL(event.senderFrame.url).origin === ORIGIN;
}
function readResponse(raw) { const value = JSON.parse(raw); if (value.status === 'error' || value.ok === false) throw new Error(value.message ?? value.error); return value; }
async function pick(operation) {
  if (pickerBusy) throw new Error('请先完成或取消当前文件窗口。');
  pickerBusy = true; try { return await operation(); } finally { pickerBusy = false; }
}
async function remember(filename) {
  lastDirectory = path.dirname(filename);
  await fsp.writeFile(path.join(app.getPath('userData'), 'last-import-directory.json'), JSON.stringify(lastDirectory)).catch(() => {});
}
async function openFile(kind) {
  return pick(async () => {
    const chosen = await dialog.showOpenDialog(window, { title: kind === 'project' ? '打开音乐文件' : '导入音色',
      defaultPath: lastDirectory, properties: ['openFile'], filters: kind === 'project'
        ? [{ name: '可编辑音乐', extensions: ['rootsound', 'mid', 'midi', 'smf', 'kar', 'rmi', 'musicxml', 'xml', 'mxl', 'rsproject'] }]
        : [{ name: 'RootSound 音色', extensions: ['rssynth', 'rssound'] }] });
    if (chosen.canceled || !chosen.filePaths[0]) return cancelled();
    const filename = chosen.filePaths[0]; await remember(filename);
    if (kind === 'timbre') return host.call('timbres.OpenPath', [filename]);
    return host.call('project.OpenPath', [filename]);
  });
}
async function exportAudio(base64, name) {
  return pick(async () => {
    if (typeof base64 !== 'string' || base64.length > Math.ceil(256 * 1024 * 1024 / 3) * 4) throw new Error('导出音频过大。');
    const bytes = Buffer.from(base64, 'base64');
    if (bytes.length < 44 || bytes.toString('ascii', 0, 4) !== 'RIFF' || bytes.toString('ascii', 8, 12) !== 'WAVE'
      || bytes.readUInt32LE(4) + 8 !== bytes.length) throw new Error('音频数据不完整，尚未导出。');
    const suggested = path.basename(String(name ?? '我的音乐.wav')).replace(/[<>:"/\\|?*\x00-\x1f]/g, '_');
    const selected = await dialog.showSaveDialog(window, { title: '导出音频', defaultPath: suggested, filters: [{ name: 'WAV 音频', extensions: ['wav'] }] });
    if (selected.canceled || !selected.filePath) return cancelled();
    const target = selected.filePath;
    if (path.extname(target).toLowerCase() !== '.wav') throw new Error('请使用 .wav 后缀。');
    const temporary = target + '.' + randomUUID() + '.tmp', lock = target + '.rootsound-save.lock';
    const owner = await fsp.open(lock, 'wx');
    try { const output = await fsp.open(temporary, 'wx'); try { await output.writeFile(bytes); await output.sync(); } finally { await output.close(); } await fsp.rename(temporary, target); }
    finally { await owner.close(); await fsp.unlink(lock).catch(() => {}); await fsp.unlink(temporary).catch(() => {}); }
    return JSON.stringify({ status: 'saved', name: path.basename(target) });
  });
}
async function invoke(method, args) {
  if (!Array.isArray(args)) throw new Error('文件操作参数无效。');
  if (method === 'project.Open') return openFile('project');
  if (method === 'timbres.Open') return openFile('timbre');
  if (method === 'audio.Save') return exportAudio(...args);
  if (method === 'project.ChooseLocation') return pick(async () => {
    const selected = await dialog.showOpenDialog(window, { title: '选择项目保存位置', defaultPath: args[0] || lastDirectory,
      properties: ['openDirectory', 'createDirectory'] });
    return selected.canceled ? cancelled() : JSON.stringify({ status: 'chosen', path: selected.filePaths[0] });
  });
  if (method.startsWith('project.') && projectMethods.has(method.slice(8)) || ['timbres.Sync', 'timbres.State'].includes(method)) return host.call(method, args);
  throw new Error('当前版本没有这个功能。');
}
async function resource(request) {
  const url = new URL(request.url);
  if (url.origin !== ORIGIN || !['GET', 'HEAD'].includes(request.method)) return new Response(null, { status: 403 });
  try {
    let file, size;
    if (url.pathname.startsWith('/__payload/')) {
      const token = decodeURIComponent(url.pathname.slice(11));
      if (!/^rootsound-payload:[a-f0-9]{32}:[a-f0-9]{64}$/.test(token)) return new Response(null, { status: 404 });
      const result = readResponse(await host.call('payload.Open', [token])); file = result.path; size = result.bytes;
    } else {
      const relative = decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname);
      if (relative.includes('\0') || relative.includes('\\') || !/^\/(?:index\.html|assets\/[^/]+|instruments\/[a-zA-Z0-9./_-]+)$/.test(relative)) return new Response(null, { status: 404 });
      const ui = path.resolve(base, 'ui'); file = path.resolve(ui, '.' + relative);
      if (!file.startsWith(ui + path.sep)) return new Response(null, { status: 403 });
      size = (await fsp.stat(file)).size;
    }
    const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.wav': 'audio/wav' };
    const headers = { 'Content-Type': types[path.extname(file)] ?? 'application/octet-stream', 'Content-Length': String(size),
      'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'wasm-unsafe-eval'; worker-src 'self' blob:; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-src 'none'" };
    return new Response(request.method === 'HEAD' ? null : Readable.toWeb(fs.createReadStream(file)), { headers });
  } catch { return new Response(null, { status: 404 }); }
}
async function confirmClose(event) {
  if (closeAccepted) return;
  event.preventDefault(); if (preparingClose) return; preparingClose = true;
  try {
    const state = readResponse(await host.call('project.Read'));
    if (state.current) {
      const prepared = await window.webContents.executeJavaScript('globalThis.__rootSoundPrepareClose("check")');
      if (!prepared?.ready) throw new Error('当前编辑尚未准备好，请稍后重试。');
      if (!prepared.canSave) throw new Error(prepared.saveMessage ?? '当前编辑尚未准备好，请稍后重试。');
      if (readResponse(await host.call('project.Read')).hasUnsavedChanges) {
        const choice = await window.webContents.executeJavaScript('globalThis.__rootSoundPrepareClose("save")');
        if (choice?.cancelled) return;
        if (!choice?.ready || !choice.canSave) throw new Error(choice?.saveMessage ?? choice?.message ?? '当前编辑尚未准备好，请稍后重试。');
        if (!choice.saved && !choice.discarded) readResponse(await host.call('project.Save', [choice.name ?? '']));
      }
      readResponse(await host.call('project.Exit', ['discard', '']));
    }
    closeAccepted = true; window.close();
  } catch (error) { await dialog.showMessageBox(window, { type: 'error', title: '暂时无法关闭', message: error.message ?? String(error) }); }
  finally { preparingClose = false; }
}
app.whenReady().then(async () => {
  const executableDirectory = path.dirname(process.execPath);
  const installed = process.platform === 'win32' && await fsp.access(path.join(base, 'rootsound-installed')).then(() => true, () => false);
  const dataDirectory = process.platform === 'darwin' ? path.join(app.getPath('music'), 'RootSound')
    : installed ? path.dirname(executableDirectory) : executableDirectory;
  await seedBundledProjects(path.join(base, 'seed-projects'), dataDirectory);
  await fsp.mkdir(app.getPath('userData'), { recursive: true });
  try { lastDirectory = JSON.parse(await fsp.readFile(path.join(app.getPath('userData'), 'last-import-directory.json'), 'utf8')); } catch { lastDirectory = path.join(dataDirectory, 'project'); }
  host = new HostClient(path.join(base, 'runtime', process.platform === 'win32' ? 'dotnet.exe' : 'dotnet'), path.join(base, 'host', 'RootSound.Host.dll'), dataDirectory);
  readResponse(await host.call('project.Read'));
  protocol.handle('https', resource);
  window = new BrowserWindow({ title: 'RootSound', icon: path.join(base, 'icon.png'), width: 1280, height: 850, minWidth: 800, minHeight: 560, backgroundColor: '#fafbfd', show: false,
    webPreferences: { preload: path.join(base, 'preload.cjs'), contextIsolation: true, sandbox: true, nodeIntegration: false, webSecurity: true } });
  window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  window.webContents.on('will-navigate', (event, url) => { if (new URL(url).origin !== ORIGIN) event.preventDefault(); });
  window.webContents.session.setPermissionRequestHandler((_contents, _permission, callback) => callback(false));
  ipcMain.on('rootsound:storage', async (event, method, args) => {
    try { if (!trusted(event) || !syncMethods.has(method) || !Array.isArray(args)) throw new Error('文件操作来源无效。'); event.returnValue = await host.call(method, args); }
    catch (error) { event.returnValue = failure(error); }
  });
  ipcMain.handle('rootsound:call', async (event, method, args) => {
    try { if (!trusted(event) || typeof method !== 'string') throw new Error('文件操作来源无效。'); return await invoke(method, args); }
    catch (error) { return failure(error); }
  });
  Menu.setApplicationMenu(process.platform === 'darwin' ? Menu.buildFromTemplate([{ label: 'RootSound', submenu: [{ role: 'about' }, { type: 'separator' }, { role: 'quit' }] }, { role: 'editMenu' }]) : null);
  window.on('close', confirmClose); window.once('ready-to-show', () => window.show());
  await window.loadURL(ORIGIN + '/');
}).catch(error => { dialog.showErrorBox('RootSound 启动失败', error.message ?? String(error)); app.quit(); });
app.on('window-all-closed', () => app.quit());
app.on('will-quit', () => host?.close());
