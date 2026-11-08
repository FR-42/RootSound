const { contextBridge, ipcRenderer } = require('electron');
const sync = (method, ...args) => ipcRenderer.sendSync('rootsound:storage', method, args);
const call = (method, ...args) => ipcRenderer.invoke('rootsound:call', method, args);
const unavailable = () => Promise.resolve(JSON.stringify({ status: 'error', message: '当前版本没有这个入口。' }));
contextBridge.exposeInMainWorld('rootSoundDesktop', {
  storage: {
    Read: () => sync('storage.Read'),
    Write: () => JSON.stringify({ ok: false, error: '缺少当前工程标识，请重新打开工程。' }),
    WriteScoped: (text, scope) => sync('storage.WriteScoped', text, scope),
    WriteScopedCheckpoint: (text, scope) => sync('storage.WriteScopedCheckpoint', text, scope),
  },
  // The old independent sound/project editors are not shipped as entry points.
  files: { Open: unavailable, Save: unavailable },
  audioFiles: { Save: (base64, name) => call('audio.Save', base64, name) },
  projectDirectories: Object.fromEntries(['Read', 'ChooseLocation', 'Create', 'CreateCopy', 'CreateDetached', 'Open', 'List', 'Browse', 'OpenKnown', 'OpenDocument', 'ReadDocument', 'PrepareDocumentSave', 'Delete', 'Inspect', 'Rename', 'Save', 'FinishLoading', 'Exit']
    .map(name => [name, (...args) => call('project.' + name, ...args)])),
  timbreFiles: {
    Open: () => call('timbres.Open'), Sync: id => call('timbres.Sync', id ?? ''), State: () => call('timbres.State'),
  },
});
