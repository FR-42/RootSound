const { app, BrowserWindow, session } = require('electron');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const [origin, root] = process.argv.slice(2);
app.setPath('userData', path.join(root, 'profile'));
app.commandLine.appendSwitch('force-device-scale-factor', '1');
app.commandLine.appendSwitch('disable-gpu');
let win;
const timer = setTimeout(() => { win?.destroy(); app.exit(1); }, 25000);
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
(async () => {
  try {
    await app.whenReady();
    session.defaultSession.webRequest.onBeforeRequest({ urls: ['https://*/*'] }, (_d, cb) => cb({ cancel: true }));
    win = new BrowserWindow({ show: false, width: 1440, height: 1000,
      webPreferences: { offscreen: true, contextIsolation: true, sandbox: true, backgroundThrottling: false } });
    const errors = [];
    win.webContents.on('console-message', (_e, level, message) => { if (level >= 3 && !/ERR_BLOCKED_BY_CLIENT/.test(message)) errors.push(message); });
    const js = code => win.webContents.executeJavaScript(code);
    await win.loadURL(origin + '/RootSound/');
    const sizes = [];
    for (const width of [1440, 768, 390, 320]) {
      win.setContentSize(width, 1000);
      await delay(100);
      const result = await js(`({ width: innerWidth, content: document.documentElement.scrollWidth,
        images: [...document.images].every(i => i.complete && i.naturalWidth > 0),
        noTrial: !document.querySelector('iframe,a[href*="play/"],.editor-instructions'),
        downloads: [...document.querySelectorAll('[data-platform]')].every(a => a.href.startsWith('https://github.com/FR-42/RootSound/releases/download/')) })`);
      assert(result.content <= result.width, JSON.stringify(result));
      assert(result.images && result.noTrial && result.downloads, JSON.stringify(result));
      sizes.push(result);
      if (width === 1440 || width === 390) {
        const height = await js('document.documentElement.scrollHeight');
        win.setContentSize(width, height);
        await delay(100);
        fs.writeFileSync(path.join(root, `website-${width}.png`), (await win.webContents.capturePage()).toPNG());
      }
    }
    await win.loadURL(origin + '/RootSound/play/?guide=1');
    for (let i = 0; i < 100 && !win.webContents.getURL().endsWith('/RootSound/'); i++) await delay(25);
    assert(win.webContents.getURL().endsWith('/RootSound/'));
    assert(!win.isVisible());
    assert.equal(errors.length, 0, JSON.stringify(errors));
    fs.writeFileSync(path.join(root, 'report.json'), JSON.stringify({ passed: true, responsive: sizes, retiredTrialRedirects: true, visibleWindow: false, errors }, null, 2));
    win.destroy(); clearTimeout(timer); app.exit(0);
  } catch (error) {
    fs.writeFileSync(path.join(root, 'report.json'), JSON.stringify({ error: error.stack }));
    win?.destroy(); app.exit(1);
  }
})();
