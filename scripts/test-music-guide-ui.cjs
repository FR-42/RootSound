const { app, BrowserWindow, ipcMain, session } = require('electron');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const runs = path.resolve('.test-output/music-guide');
fs.mkdirSync(runs, { recursive: true });
const run = fs.mkdtempSync(path.join(runs, 'ui-'));
const dist = path.resolve('dist');
const location = 'D:\\测试乐曲库';
app.setPath('userData', path.join(run, 'profile'));
app.commandLine.appendSwitch('disable-gpu');

const preload = path.join(run, 'preload.cjs');
fs.writeFileSync(preload, `
const { contextBridge, ipcRenderer } = require('electron');
const unexpected = name => () => { ipcRenderer.send('unexpected', name, !!document.querySelector('.music-guide')); return '{}'; };
contextBridge.exposeInMainWorld('rootSoundDesktop', {
  projectDirectories: {
    Read: async () => JSON.stringify({ status: 'ready', defaultLocation: ${JSON.stringify(location)} }),
    Browse: unexpected('browse'), Open: unexpected('open'), OpenKnown: unexpected('open-known'),
    ChooseLocation: unexpected('choose'), Create: unexpected('create'), CreateCopy: unexpected('copy'),
    Save: unexpected('save'), Exit: unexpected('exit'),
  },
  storage: { Read: unexpected('storage-read'), WriteScoped: unexpected('storage-write') },
  files: { Open: unexpected('sound-open'), Save: unexpected('sound-save') },
  audioFiles: { Save: unexpected('audio-save') },
  timbreFiles: { State: unexpected('timbre-state'), Open: unexpected('timbre-open') },
});
`);

const bridgeCalls = [];
ipcMain.on('unexpected', (_, name, inGuide) => {
  if (inGuide || name !== 'browse') bridgeCalls.push(name);
});

let win;
let stage = 'start';
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const js = code => win.webContents.executeJavaScript(code, true);
const call = (fn, ...args) => js('(' + fn.toString() + ')(...' + JSON.stringify(args) + ')');
const click = selector => call(selector => document.querySelector(selector).click(), selector);
const key = (key, code = key) => call((key, code) => {
  document.body.dispatchEvent(new KeyboardEvent('keydown', { key, code, bubbles: true, cancelable: true }));
}, key, code);
const currentStep = () => js('Number(document.querySelector(".music-guide")?.dataset.step)');
async function next() {
  const from = await currentStep();
  if (from !== 1 && from !== 11) await ready('.music-guide-enter');
  await key('Enter');
  assert.equal(await currentStep(), from + 1);
}
const visible = selector => call(selector => {
  const node = document.querySelector(selector);
  return !!node && !!node.getClientRects().length && getComputedStyle(node).visibility === 'visible';
}, selector);
async function wait(check, description) {
  for (let i = 0; i < 240; i++) {
    if (await check()) return;
    await delay(25);
  }
  throw Error('Timeout ' + description);
}
const ready = selector => wait(() => visible(selector), selector);
async function expectCue(startedAt, description) {
  await ready('.music-guide-enter');
  const elapsed = Date.now() - startedAt;
  assert(elapsed >= 1300 && elapsed < 2300, description + ' (' + elapsed + ' ms)');
}
const step = number => ready('.music-guide[data-step="' + number + '"] .music-guide-words');
const notes = () => js('document.querySelectorAll(".melody-note").length');
const geometry = selector => call(selector => {
  const box = document.querySelector(selector).getBoundingClientRect();
  return { x: box.x, y: box.y, w: box.width, h: box.height };
}, selector);
const transform = selector => call(selector => document.querySelector(selector).style.transform, selector);
const style = (selector, property) => call((selector, property) => getComputedStyle(document.querySelector(selector))[property], selector, property);
const send = (type, x, y, extra) => win.webContents.debugger.sendCommand('Input.dispatchMouseEvent', { type, x, y, ...extra });
async function gesture(points, button = 'left') {
  const [first, ...rest] = points;
  const buttons = button === 'right' ? 2 : 1;
  await send('mousePressed', ...first, { button, buttons, clickCount: 1 });
  for (const point of rest) await send('mouseMoved', ...point, { button, buttons });
  await send('mouseReleased', ...(points.at(-1)), { button, buttons: 0, clickCount: 1 });
}
const wheel = (x, y, deltaY, modifiers) => send('mouseWheel', x, y, { deltaX: 0, deltaY, modifiers });
const name = () => js('document.querySelector(".song-project-name")?.textContent');

async function runTest() {
  await app.whenReady();
  const mime = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.json': 'application/json', '.wasm': 'application/wasm' };
  await session.defaultSession.protocol.handle('https', request => {
    const url = new URL(request.url);
    if (url.hostname !== 'rootsound.local') return new Response(null, { status: 403 });
    const file = path.join(dist, decodeURIComponent(url.pathname));
    if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) return new Response(null, { status: 404 });
    const ext = path.extname(file);
    let data = fs.readFileSync(file);
    if (ext === '.html') data = data.toString().replace('<head>', '<head><script>window.errors=[];window.addEventListener("error",e=>errors.push(e.message));window.addEventListener("unhandledrejection",e=>errors.push(String(e.reason)));</script>');
    return new Response(data, { headers: { 'Content-Type': mime[ext] ?? 'application/octet-stream' } });
  });
  win = new BrowserWindow({ show: false, width: 1280, height: 820, webPreferences: { preload, sandbox: true, contextIsolation: true, backgroundThrottling: false, offscreen: true } });
  win.webContents.setAudioMuted(true);
  win.webContents.debugger.attach('1.3');
  await win.loadURL('https://rootsound.local/index.html');
  await ready('.guidance-invitation');
  assert.equal(await js('document.querySelector(".guidance-invitation h2").textContent'), '是否观看引导');
  assert.equal(await visible('.welcome'), false);
  await click('.guidance-watch');
  assert.equal(await js('localStorage.getItem("rootsound.desktop-guide-choice.v1")'), 'yes');
  bridgeCalls.length = 0;
  assert.equal(await js('getComputedStyle(document.querySelector(".music-guide")).backgroundColor'), 'rgb(255, 255, 255)');
  assert.equal(await visible('.music-guide-words'), false);
  assert.equal(await visible('.music-guide-host'), false);

  stage = 'canvas and navigation';
  await step(1);
  const firstShownAt = Date.now();
  assert.deepEqual(await js('Array.from(document.querySelectorAll(".music-guide-word, .music-guide-copy p"), n=>n.textContent)'), ['卷帘', '核心创作画布']);
  assert.equal(await js('getComputedStyle(document.querySelector(".music-guide-word")).animationName'), 'music-guide-fade');
  assert.equal(await js('getComputedStyle(document.querySelector(".music-guide-words")).pointerEvents'), 'none');
  assert(await visible('.melody-scroll'));
  assert.equal(await visible('.music-guide-enter'), false);
  const firstWord = await geometry('.music-guide-word');
  const midpoint = await js('({x:innerWidth/2,y:innerHeight/2})');
  assert(Math.abs(firstWord.x + firstWord.w / 2 - midpoint.x) < 2);
  assert(Math.abs(firstWord.y + firstWord.h / 2 - midpoint.y) < 2);
  await expectCue(firstShownAt, 'the canvas scene waits 1.5 seconds');
  assert.equal(await currentStep(), 1);
  await wait(() => js('Number(getComputedStyle(document.querySelector(".music-guide-word")).opacity) === .18'), 'title fades to a visible watermark');
  assert.equal(await js('document.querySelector(".music-guide-enter").textContent'), 'Enter');
  await delay(750);
  const edgeLight = await js('(() => { const style = getComputedStyle(document.querySelector(".music-guide-enter"), "::before"); return { background: style.backgroundImage, opacity: style.opacity }; })()');
  assert.match(edgeLight.background, /linear-gradient/);
  assert.equal(edgeLight.opacity, '1');
  for (const selector of ['.melody-note', '.melody-keys', '.melody-pitch-row', '.melody-grid-line', '.melody-playhead', '.melody-playhead-time', '.melody-shelf', '.song-topbar']) assert.equal(await visible(selector), false, selector);
  const cue = await geometry('.music-guide-enter');
  await gesture([[cue.x + cue.w / 2, cue.y + cue.h / 2]]);
  await step(2);
  const secondShownAt = Date.now();
  assert.equal(await notes(), 6);
  await key('Enter');
  assert.equal(await currentStep(), 2);
  assert.equal(await visible('.music-guide-enter'), false);
  assert.deepEqual(await js('Array.from(document.querySelectorAll(".music-guide-word, .music-guide-copy p"), n=>n.textContent)'), ['音符', '音符散落在卷帘上']);
  assert.equal(await js('document.querySelectorAll(".music-guide-copy p *").length'), 0);
  const canvas = await geometry('.melody-scroll');
  const point = [canvas.x + 190, canvas.y + 340];
  const pitchOffset = () => js('document.querySelector(".melody-scroll").scrollLeft');
  const originalOffset = await pitchOffset();
  await gesture([point, [point[0] - 65, point[1] - 65]]);
  assert(await pitchOffset() > originalOffset);
  const pannedOffset = await pitchOffset();
  await wheel(...point, 94, 8);
  await wait(async () => await pitchOffset() > pannedOffset, 'shift wheel pans');
  const keyWidth = () => call(() => document.querySelector('.melody-key').style.width);
  const initialWidth = await keyWidth();
  await wheel(...point, -500, 10);
  assert.equal(await keyWidth(), initialWidth);
  await gesture([point], 'right');
  assert.equal(await notes(), 6);

  stage = 'playhead and keys';
  await expectCue(secondShownAt, 'the notes scene waits 1.5 seconds');
  await next();
  await step(3);
  assert.equal(await visible('.melody-roll-end'), false);
  const headLane = await geometry('.melody-ruler');
  const headLabel = await geometry('.melody-head-handle');
  assert.equal(headLabel.x, headLane.x);
  assert.equal(headLabel.w, headLane.w);
  assert.equal(await visible('.music-guide-enter'), false);
  const playbackLabel = () => js('document.querySelector(".song-play").getAttribute("aria-label")');
  assert.equal(await playbackLabel(), '播放');
  assert.deepEqual(await call(() => Array.from(document.querySelectorAll('.music-guide-copy p'), p => p.textContent)),
    ['播放头匀速向下，碰到音符就发声', '按空格开始或暂停']);
  const spacePrompt = '.music-guide-copy p:last-child';
  const darkPrompt = 'rgb(25, 44, 64)';
  const breathe = 'music-guide-breathe';
  assert.equal(await style(spacePrompt, 'animationName'), breathe);
  await key('Enter');
  assert.equal(await currentStep(), 3);
  const firstHead = await transform('.melody-playhead');
  assert.equal(firstHead, 'translateY(0px)');
  const headTime = '.melody-playhead-time';
  assert(await visible(headTime));
  assert.equal(await js('document.querySelector(".melody-playhead-time").textContent'), '00:00.000');
  assert.equal(await style(headTime, 'pointerEvents'), 'none');
  assert.equal(await style(headTime, 'color'), 'rgb(181, 47, 56)');
  assert.equal(await style(headTime, 'fontSize'), '9px');
  const timeAtTop = await geometry(headTime);
  const rollViewport = await geometry('.melody-scroll');
  assert(Math.abs(rollViewport.x + rollViewport.w - timeAtTop.x - timeAtTop.w - 14) < 1);
  assert(timeAtTop.y > (await geometry('.melody-playhead')).y);
  await key(' ', 'Space');
  await wait(async () => await playbackLabel() === '暂停', 'example audio transport starts');
  await wait(async () => await transform('.melody-playhead') !== firstHead, 'playhead moves down');
  assert.equal(await style(spacePrompt, 'animationName'), 'none');
  assert.equal(await style(spacePrompt, 'color'), darkPrompt);
  const movingSince = Date.now();
  await key('Enter');
  assert.equal(await currentStep(), 3);
  assert.equal(await visible('.music-guide-enter'), false);
  await expectCue(movingSince, 'the playhead cue waits 1.5 seconds from the first movement');
  const movingTime = await geometry(headTime);
  assert(movingTime.y + movingTime.h < (await geometry('.melody-playhead')).y);
  const pitchBeforeTimeCheck = await pitchOffset();
  await wheel(...point, 94, 8);
  await wait(async () => await pitchOffset() !== pitchBeforeTimeCheck, 'the roll pans across pitches');
  assert.equal((await geometry(headTime)).x, movingTime.x);

  await wheel(...point, 1000, 0);
  await wait(async () => !await visible('.melody-playhead'), 'wheel scrolls away from the playing head');
  assert.equal(await visible(headTime), false);
  await wheel(...point, -1000, 0);
  await ready('.melody-quick-thumb');
  const thumb = await geometry('.melody-quick-thumb');
  await gesture([[thumb.x + thumb.w / 2, thumb.y + 12], [thumb.x + thumb.w / 2, thumb.y + 108]]);
  await wait(async () => !await visible('.melody-playhead'), 'dragging the scrollbar moves the viewport during playback');
  await wheel(...point, -1000, 0);
  await ready('.melody-playhead');

  const ruler = await geometry('.melody-ruler');
  const readClock = () => call(() => {
    const [minutes, seconds] = document.querySelector('.melody-playhead-time').textContent.split(':').map(Number);
    return minutes * 60 + seconds;
  });
  const rulerX = ruler.x + ruler.w / 2;
  await gesture([[rulerX, ruler.y + 90], [rulerX, ruler.y + 205]]);
  await wait(async () => await playbackLabel() === '暂停' && await readClock() > 2, 'ruler seeks and resumes playback');

  const playhead = await geometry('.melody-playhead');
  const headX = ruler.x + ruler.w + 250;
  await send('mousePressed', headX, playhead.y + 1, { button: 'left', buttons: 1, clickCount: 1 });
  await send('mouseMoved', headX, ruler.y + 26, { button: 'left', buttons: 1 });
  await wait(async () => await readClock() < 1, 'the timestamp previews the drag before release');
  await send('mouseReleased', headX, ruler.y + 26, { button: 'left', buttons: 0, clickCount: 1 });
  await wait(async () => await playbackLabel() === '暂停' && await readClock() < 1, 'playhead line seeks on release');
  await key(' ', 'Space');
  await wait(async () => await playbackLabel() === '播放', 'Space pauses the moving head');
  const pausedAt = await readClock();
  await delay(100);
  assert.equal(await readClock(), pausedAt);
  await gesture([[rulerX, ruler.y + 65], [rulerX, ruler.y + 76]]);
  const relocated = await readClock();
  assert(relocated > pausedAt && relocated < 1);
  assert.equal(await playbackLabel(), '播放');
  await key(' ', 'Space');
  await wait(async () => await playbackLabel() === '暂停' && await readClock() > relocated, 'Space resumes after a paused seek');
  assert.equal(await js('getComputedStyle(document.querySelector(".music-guide-copy p:first-child")).opacity'), '1');
  assert.equal(await js('getComputedStyle(document.querySelector(".music-guide-copy p:last-child")).opacity'), '1');
  assert(await visible('.music-guide-enter'));
  assert.equal(await playbackLabel(), '暂停');
  await wait(() => js('Number(getComputedStyle(document.querySelector(".music-guide-word")).opacity) === .18'), 'third title remains faintly visible');
  assert.equal(await js('Number(getComputedStyle(document.querySelector(".music-guide-words")).opacity)'), 1);
  assert.equal(await visible('.melody-keys'), false);
  await next();
  await step(4);
  const fourthShownAt = Date.now();
  await key('Enter');
  assert.equal(await currentStep(), 4);
  assert(await visible('.melody-pitch-row'));
  assert(await visible('.melody-keys'));
  assert(await visible('.melody-roll-end'));
  assert.equal(await js('document.querySelector(".music-guide-copy p").textContent'), '卷帘分列，列与琴键一一对应，表示音调。');
  assert.equal(await js('document.querySelector(".melody-ruler-row").inert'), false);
  const fourthHead = await geometry('.melody-playhead');
  await gesture([[headX, fourthHead.y + 1], [headX, ruler.y + 36]]);
  await wait(async () => await playbackLabel() === '暂停' && await readClock() < 1, 'the playback head still seeks in the fourth scene');
  await key(' ', 'Space');
  await wait(async () => await playbackLabel() === '播放', 'Space still pauses in the fourth scene');
  await expectCue(fourthShownAt, 'the keys scene waits 1.5 seconds');

  stage = 'tempo and drawing';
  await next();
  await step(5);
  const tempoShownAt = Date.now();
  assert.equal(await visible('.melody-tempo-button'), false);
  assert.equal(await visible('.music-guide-tempo-tip'), false);
  assert.equal(await js('getComputedStyle(document.querySelector(".music-guide-tempo-tail")).opacity'), '0');
  assert.equal(await js('getComputedStyle(document.querySelector(".music-guide-word")).animationName'), 'none');
  assert.deepEqual(await call(() => Array.from(document.querySelectorAll('.music-guide-copy p'), p => p.textContent)), [
    'BPM 值 × 一拍的时长 = 一分钟', '相邻两条横线之间是一拍', '点击左下角数字以改变 BPM',
  ]);
  assert.equal(await style('.music-guide-tempo-tip', 'animationPlayState'), 'paused');
  await wait(() => js('getComputedStyle(document.querySelector(".music-guide-tempo-tail")).opacity === "1"'), 'BPM expands to include the tempo');
  assert.equal(await js('document.querySelector(".music-guide-word").textContent'), 'BPM=120');
  const beatGap = () => call(() => {
    const beats = document.querySelectorAll('.melody-grid-line.is-beat');
    return parseFloat(beats[1].style.top) - parseFloat(beats[0].style.top);
  });
  const initialGap = await beatGap();
  const animatedTempo = () => js('Number(document.querySelector(".music-guide-tempo-digits")?.textContent)');
  await call(() => { window.initialBeatLine = document.querySelector('.melody-grid-line'); });
  await wait(async () => {
    const bpm = await animatedTempo();
    return bpm > 135 && bpm < 165 && await beatGap() < initialGap;
  }, 'the beat spacing changes during the tempo sweep');
  await wait(async () => await animatedTempo() === 180, 'the demonstration reaches 180 BPM');
  const fastGap = await beatGap();
  assert(fastGap < initialGap * .75);
  assert(await js('window.initialBeatLine === document.querySelector(".melody-grid-line")'));
  await wait(async () => {
    const bpm = await animatedTempo();
    return bpm > 130 && bpm < 165 && await beatGap() > fastGap;
  }, 'beat lines spread apart on the way back to 120');
  await wait(async () => await animatedTempo() === 120 && Math.abs(await beatGap() - initialGap) <= 1, 'the original grid returns before docking');
  await ready('.music-guide-tempo-flight');
  assert.equal(await visible('.music-guide-tempo-tip'), false);
  const origin = await geometry('.music-guide-tempo-flight');
  await wait(async () => {
    if (!await visible('.music-guide-tempo-flight')) return false;
    const flying = await geometry('.music-guide-tempo-flight');
    return flying.x < origin.x - 10 && flying.y > origin.y + 10 && flying.w < origin.w;
  }, 'the value shrinks and moves to the lower left');
  await ready('.melody-tempo-button');
  assert(await visible('.music-guide-tempo-tip'));
  assert.equal(await style('.music-guide-tempo-tip', 'animationName'), breathe);
  assert.equal(await style('.music-guide-tempo-tip', 'animationPlayState'), 'running');
  assert.equal(await visible('.music-guide-tempo-flight'), false);
  assert.equal(await js('document.querySelector(".music-guide-word").textContent'), 'BPM');
  await wait(() => js('getComputedStyle(document.querySelector(".music-guide-word > span")).opacity === "0.18"'), 'the centered BPM title fades');
  assert.equal(await js('document.querySelector(".melody-tempo-button").textContent'), '120');
  assert.equal((await geometry('.melody-ruler-row')).w, 24);
  assert.equal(await visible('.melody-extend'), false);
  assert(await visible('.melody-roll-end'));
  assert(await visible('.melody-grid-line.is-beat'));
  assert.equal(await js('document.querySelector(".melody-tempo-button").getAttribute("aria-label")'), 'BPM');
  assert.equal(await visible('.melody-grid-line:not(.is-beat)'), false);

  await delay(Math.max(0, 5300 - (Date.now() - tempoShownAt)));
  assert.equal(await visible('.music-guide-enter'), false);
  await key('Enter');
  assert.equal(await currentStep(), 5);
  const tempo = await geometry('.melody-tempo-button');
  const tempoClickedAt = Date.now();
  await gesture([[tempo.x + tempo.w / 2, tempo.y + tempo.h / 2]]);
  await ready('.melody-tempo-panel');
  assert.equal(await style('.music-guide-tempo-tip', 'animationName'), 'none');
  assert.equal(await style('.music-guide-tempo-tip', 'color'), darkPrompt);
  assert((await geometry('.melody-tempo-panel')).w < 185);
  assert.equal(await visible('.music-guide-enter'), false);
  assert.equal(await visible('.melody-tempo-grid-field'), false);
  assert.equal(await visible('input[aria-label="小节数"]'), false);
  assert.deepEqual(await call(() => Array.from(document.querySelectorAll('.music-guide-copy p'), p => p.textContent)), [
    'BPM 值 × 一拍的时长 = 一分钟', '相邻两条横线之间是一拍', '点击左下角数字以改变 BPM',
  ]);
  await expectCue(tempoClickedAt, 'the first tempo click starts the 1.5-second wait');
  const rate = await geometry('.melody-tempo-rate-input');
  const ratePoint = [rate.x + 17, rate.y + rate.h / 2];
  const readRate = () => js('document.querySelector(".melody-tempo-rate-input").value');
  assert(await visible('.melody-tempo-scrub-mark'));
  assert.equal(await js('getComputedStyle(document.querySelector(".melody-tempo-rate-input")).appearance'), 'textfield');
  await send('mousePressed', ...ratePoint, { button: 'left', buttons: 1, clickCount: 1 });
  assert.equal(await js('getComputedStyle(document.querySelector(".melody-tempo-rate-input")).outlineStyle'), 'none');
  await send('mouseMoved', ratePoint[0], ratePoint[1] - 60, { button: 'left', buttons: 1 });
  assert.equal(await js('getComputedStyle(document.querySelector(".melody-tempo-rate-input")).outlineStyle'), 'none');
  await wait(async () => await readRate() === '180' && await beatGap() < initialGap * .75, 'drag previews the value and grid before release');
  assert.equal(await js('document.querySelector(".song-project-unsaved").hidden'), true);
  await send('mouseReleased', ratePoint[0], ratePoint[1] - 60, { button: 'left', buttons: 0, clickCount: 1 });
  await wait(() => js('!document.querySelector(".song-project-unsaved").hidden'), 'the drag commits on release');
  await wheel(...ratePoint, -100, 0);
  await wait(async () => await readRate() === '181', 'the mouse wheel adjusts one BPM');
  await call(() => document.querySelector('.melody-tempo-rate-input').dispatchEvent(new KeyboardEvent('keydown', {
    key: 'ArrowDown', bubbles: true, cancelable: true,
  })));
  await wait(async () => await readRate() === '180', 'arrow keys adjust one BPM');
  await call(() => {
    const input = document.querySelector('.melody-tempo-input');
    input.value = '100';
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });
  assert.equal(await js('document.querySelector(".melody-tempo-button").textContent'), '100');
  assert.equal(await js('document.querySelector(".melody-tap-tempo").textContent'), '敲击定速');
  const tapAt = offsets => call(offsets => {
    const pad = document.querySelector('.tap-tempo-pad');
    const original = Object.getOwnPropertyDescriptor(performance, 'now');
    const start = performance.now();
    let time = start;
    Object.defineProperty(performance, 'now', { value: () => time, configurable: true });
    try {
      for (const offset of offsets) { time = start + offset; pad.click(); }
    } finally {
      if (original) Object.defineProperty(performance, 'now', original);
      else delete performance.now;
    }
  }, offsets);
  await click('.melody-tap-tempo');
  await ready('.tap-tempo-dialog[open]');
  assert.equal(await visible('.tap-tempo-hint'), false);
  assert.equal(await js('document.querySelector(".tap-tempo-guide-note").textContent'), '有节奏地敲击空格键吧。');
  assert.equal(await style('.tap-tempo-guide-note', 'animationName'), breathe);
  const noteAbove = await geometry('.tap-tempo-guide-note');
  assert((await geometry('.tap-tempo-dialog')).y - (noteAbove.y + noteAbove.h) >= 26);
  assert.match(await js('getComputedStyle(document.querySelector(".tap-tempo-guide-note"), "::before").backgroundImage'), /radial-gradient/);
  const placeholder = await geometry('.tap-tempo-value');
  assert.equal(placeholder.h, 5);
  assert.equal(await js('getComputedStyle(document.querySelector(".tap-tempo-value")).backgroundColor'), 'rgb(23, 25, 28)');
  assert.equal(await js('document.querySelector(".tap-tempo-pad").getAttribute("aria-label")'), '空格键');
  assert.equal(await js('document.querySelector(".tap-tempo-pad").textContent'), '');
  assert.equal(await js('document.querySelector(".tap-tempo-dialog").innerText.includes("BPM")'), false);
  await tapAt([0, 360, 860]);
  assert.equal(await style('.tap-tempo-guide-note', 'color'), 'rgb(49, 70, 90)');
  assert.equal(await style('.tap-tempo-guide-note', 'animationName'), 'none');
  assert.equal(await visible('.tap-tempo-reset'), false);
  assert.equal(await visible('.tap-tempo-apply'), false);
  await click('.tap-tempo-cancel');
  await wait(async () => !await visible('.tap-tempo-dialog'), 'tap tempo closes on cancel');
  assert(await visible('.music-guide-enter'));

  await click('.melody-tempo-button');
  await click('.melody-tap-tempo');
  await ready('.tap-tempo-dialog[open]');
  assert(await visible('.music-guide-enter'));
  await tapAt([0, 360, 860, 1540]);
  assert(await visible('.tap-tempo-reset'));
  assert.equal(await visible('.tap-tempo-apply'), false);
  assert.equal(await js('document.querySelector(".tap-tempo-value").textContent'), '');
  await key('Enter');
  assert(await visible('.tap-tempo-dialog[open]'));
  assert.equal(await currentStep(), 5);
  await click('.tap-tempo-reset');
  assert.equal(await visible('.tap-tempo-reset'), false);
  assert.equal(await style('.tap-tempo-guide-note', 'animationName'), breathe);
  await tapAt([0, 500, 1000, 1500]);
  assert.equal(await js('document.querySelector(".tap-tempo-value").textContent'), '120');
  assert(await visible('.tap-tempo-apply'));
  const tempoDigits = await geometry('.tap-tempo-value');
  assert(placeholder.w >= tempoDigits.w && placeholder.w <= tempoDigits.w * 1.5);
  assert(Math.abs(placeholder.y + placeholder.h / 2 - tempoDigits.y - tempoDigits.h / 2) < 1);
  assert.equal(await js('getComputedStyle(document.querySelector(".tap-tempo-value")).backgroundColor'), 'rgba(0, 0, 0, 0)');
  await key('Enter');
  await wait(async () => !await visible('.tap-tempo-dialog'), 'Enter applies the detected tempo');
  assert.equal(await currentStep(), 5);
  assert(await visible('.music-guide-enter'));
  assert.equal(await js('document.querySelector(".melody-tempo-button").textContent'), '120');

  stage = 'timbre introduction';
  const rollLeft = (await geometry('.melody-roll')).x;
  await next();
  await step(6);
  const cards = '.melody-shelf .melody-note-family', flyingCards = '.music-guide-timbre-flight .melody-note-family';
  const plus = '.melody-shelf .melody-add-tone';
  const selectPrompt = '.music-guide-copy p:first-child';
  const actionPrompt = '.music-guide-copy p:nth-child(2)';
  const selectText = '点击左上角音色卡可以进入选中状态';
  const mutedText = '选中音色时，其他音色的音符将变暗且静默';
  const drawText = '左键卷帘添加音符';
  const deselectText = '右键卷帘空白处以取消选中';
  const copyLines = () => call(() => Array.from(document.querySelectorAll('.music-guide-copy p'), line => line.textContent));
  const cardNames = selector => call(selector => Array.from(document.querySelectorAll(selector), card => card.textContent), selector);
  assert.equal(await js('document.querySelector(".melody-tempo-dock").inert'), false);
  assert.deepEqual(await copyLines(), []);
  assert.equal(await visible(cards), false);
  assert(await visible(plus));
  await wait(async () => {
    const delta = (await geometry('.melody-roll')).x - rollLeft;
    return delta > 4 && delta < 72;
  }, 'the left edge slides to make room for the shelf');
  await ready(flyingCards);
  assert.deepEqual(await cardNames(flyingCards), ['钢琴', '长笛', '弦乐合奏']);
  const titleBox = await geometry('.music-guide-word');
  const rightOfTitle = titleBox.x + titleBox.w;
  assert((await geometry(flyingCards)).x >= rightOfTitle);
  assert.equal(await visible(cards), false);
  assert.deepEqual(await copyLines(), []);
  const initialPlus = await geometry(plus);
  assert(initialPlus.x < 12 && initialPlus.y > titleBox.y + titleBox.h);
  await ready(cards);
  assert((await geometry(cards)).x < 12);
  assert.deepEqual(await cardNames(cards), ['钢琴', '长笛', '弦乐合奏']);
  assert.deepEqual(await copyLines(), [selectText]);
  assert.equal(await style(selectPrompt, 'animationIterationCount'), 'infinite');
  assert(await call(cards => [...document.querySelectorAll(cards)].every(node => node.getAnimations().length === 0
    && getComputedStyle(node).opacity === '1'), cards));
  const cycle = await call(selector => {
    const node = document.querySelector(selector);
    const [animation] = node.getAnimations();
    const originalTime = animation.currentTime;
    const { duration } = animation.effect.getComputedTiming();
    const samples = [0, .5, 1].map(fraction => {
      animation.currentTime = duration * fraction;
      const { color, opacity } = getComputedStyle(node);
      return [color, opacity];
    });
    animation.currentTime = originalTime;
    return samples;
  }, selectPrompt);
  assert.deepEqual(cycle, [['rgb(120, 138, 156)', '1'], ['rgb(167, 180, 192)', '1'], ['rgb(120, 138, 156)', '1']]);
  assert.equal(await visible('.music-guide-enter'), false);
  await wait(() => js('!document.querySelector(".music-guide-host [title]")'), 'hover labels suppressed');
  const flute = await geometry('.melody-shelf .melody-tone-entry:nth-child(2) .melody-note-family');
  await gesture([[flute.x + flute.w / 2, flute.y + flute.h / 2]]);
  assert.deepEqual(await cardNames('.melody-note-family.is-selected'), ['长笛']);
  assert(await call(cards => [...document.querySelectorAll(cards)].every(node => getComputedStyle(node).opacity === '1'), cards));
  assert(await visible('.melody-note.is-dim'));
  assert.deepEqual(await copyLines(), [mutedText, drawText]);
  assert.equal(await style('.music-guide-copy p:first-child', 'color'), 'rgb(65, 87, 109)');
  assert.equal(await style(actionPrompt, 'animationName'), breathe);
  const drawPoint = [canvas.x + 210, canvas.y + 440];
  await send('mousePressed', ...drawPoint, { button: 'left', buttons: 1, clickCount: 1 });
  await ready('.melody-note.is-drawing');
  const initialLength = (await geometry('.melody-note.is-drawing')).h;
  await send('mouseMoved', drawPoint[0], drawPoint[1] + 112, { button: 'left', buttons: 1 });
  const extendedLength = (await geometry('.melody-note.is-drawing')).h;
  assert(extendedLength > initialLength);
  await send('mouseMoved', drawPoint[0], drawPoint[1] + 62, { button: 'left', buttons: 1 });
  const shortenedLength = (await geometry('.melody-note.is-drawing')).h;
  assert(shortenedLength < extendedLength);
  await send('mouseReleased', drawPoint[0], drawPoint[1] + 62, { button: 'left', buttons: 0, clickCount: 1 });
  assert.equal(await visible('.melody-note.is-drawing'), false);
  assert.equal(await notes(), 7);
  assert.deepEqual(await copyLines(), [mutedText, deselectText]);
  assert.equal(await style(actionPrompt, 'animationName'), breathe);
  const protectedNote = await geometry('.melody-note');
  const eraseX = protectedNote.x + protectedNote.w / 2;
  await gesture([[eraseX, protectedNote.y - 8], [eraseX, protectedNote.y + protectedNote.h + 8]], 'right');
  assert.equal(await notes(), 7);
  assert(await visible('.melody-note-family.is-selected'));
  assert.equal(await visible('.music-guide-enter'), false);
  const deselectedAt = Date.now();
  await gesture([[drawPoint[0] - 60, drawPoint[1]]], 'right');
  assert.equal(await visible('.melody-note-family.is-selected'), false);
  assert.equal(await visible('.melody-note.is-dim'), false);
  assert.equal(await notes(), 7);
  const plusBox = await geometry(plus);
  assert.deepEqual(plusBox, initialPlus);
  assert.deepEqual(await copyLines(), [mutedText]);
  assert.equal(await visible('.music-guide-enter'), false);
  await key('Enter');
  assert.equal(await currentStep(), 6);
  await expectCue(deselectedAt, 'the timbre cue waits 1.5 seconds after deselection');
  assert.deepEqual(await copyLines(), [mutedText]);

  stage = 'zoom and detail';
  await next();
  await step(7);
  const zoomWidth = await keyWidth();
  await wheel(...point, -240, 10);
  await wait(async () => await keyWidth() !== zoomWidth, 'ctrl shift wheel zooms pitch');
  const gridPosition = () => call(() => Array.from(document.querySelectorAll('.melody-grid-line.is-beat'), node => node.style.top).join(','));
  const beforeZoom = await gridPosition();
  await wheel(...point, -320, 2);
  await wait(async () => await gridPosition() !== beforeZoom, 'ctrl wheel zooms time');
  assert.equal(await visible('.melody-grid-line:not(.is-beat)'), false);
  await next();
  await step(8);
  assert.equal(await js('document.querySelector(".music-guide-word").textContent'), '拍内细分');
  assert.deepEqual(await copyLines(), ['点击左下角的 BPM 设置每拍细分。', '每拍会有更细的横线划分']);
  await click('.melody-tempo-button');
  const subdivision = 'select[aria-label="每拍细分"]';
  await ready(subdivision);
  assert.deepEqual(await call(selector => Array.from(document.querySelector(selector).options, option => option.textContent), subdivision),
    Array.from({ length: 8 }, (_, i) => (i + 2) + ' 份'));
  assert.equal(await visible('input[aria-label="小节数"]'), false);
  await click('.melody-tempo-button');
  await ready('.melody-grid-line.is-cell:not(.is-beat)');
  await wheel(point[0], 30, -1020, 2);
  await ready('.melody-grid-line:not(.is-beat, .is-cell)');
  const lineStyles = await call(() => ['.is-beat', '.is-cell:not(.is-beat)', ':not(.is-beat, .is-cell)'].map(selector => {
    const { backgroundColor, height } = getComputedStyle(document.querySelector('.melody-grid-line' + selector));
    return { opacity: Number(backgroundColor.match(/, ([\d.]+)\)$/)?.[1]), height };
  }));
  const [beat, subdivisionLine, finerLine] = lineStyles;
  assert(beat.opacity >= .7 && subdivisionLine.opacity >= .44 && finerLine.opacity >= .23);
  assert(beat.opacity > subdivisionLine.opacity && subdivisionLine.opacity > finerLine.opacity);
  assert(beat.height === subdivisionLine.height && subdivisionLine.height === finerLine.height);

  stage = 'edit and save';
  await next();
  await step(9);
  const moveText = '左键按住并拖动音符可以改变位置';
  const eraseText = '右键点击音符或按住右键划过音符可以删除它';
  const resizeText = '拖动音符下边缘可以更改时长';
  const undoText = '回退键可以撤销上一步操作';
  const editPrompt = '.music-guide-copy p';
  assert.deepEqual(await copyLines(), [moveText]);
  assert.equal(await style(editPrompt, 'animationName'), breathe);
  await delay(1600);
  assert.equal(await visible('.music-guide-enter'), false);
  await key('Enter');
  assert.equal(await currentStep(), 9);
  const beforeEdit = await geometry('.melody-note');
  const editCenter = [beforeEdit.x + beforeEdit.w / 2, beforeEdit.y + beforeEdit.h / 2];
  const editTarget = [beforeEdit.x + beforeEdit.w * 1.6, editCenter[1] + 20];
  await gesture([editCenter]);
  await gesture([editCenter, editTarget, editCenter]);
  await gesture([[drawPoint[0] - 60, drawPoint[1]]], 'right');
  assert.deepEqual(await copyLines(), [moveText]);
  await gesture([editCenter, editTarget]);
  const moved = await geometry('.melody-note');
  assert.notEqual(moved.x, beforeEdit.x);
  assert.equal(await notes(), 7);
  assert.deepEqual(await copyLines(), [eraseText]);
  assert.equal(await style(editPrompt, 'animationName'), breathe);
  const eraseMovedX = moved.x + moved.w / 2;
  await gesture([[eraseMovedX, moved.y - 6], [eraseMovedX, moved.y + moved.h + 7]], 'right');
  assert.equal(await notes(), 6);
  assert.deepEqual(await copyLines(), [resizeText]);
  assert.equal(await style(editPrompt, 'animationName'), breathe);
  const resizeNoteId = await call(() => {
    const canvasBottom = document.querySelector('.melody-canvas').getBoundingClientRect().bottom;
    return [...document.querySelectorAll('.melody-note')].find(note => {
      const rect = note.getBoundingClientRect();
      return rect.bottom + 20 < canvasBottom
        && document.elementFromPoint(rect.x + rect.width / 2, rect.bottom - 2)?.closest('.melody-note') === note;
    })?.dataset.noteId;
  });
  assert(resizeNoteId, 'a note with a reachable lower edge is available after deletion');
  const resizeNote = '.melody-note[data-note-id="' + resizeNoteId + '"]';
  const beforeResize = await geometry(resizeNote);
  const resizeX = beforeResize.x + beforeResize.w / 2;
  await gesture([[resizeX, beforeResize.y + beforeResize.h - 2], [resizeX, beforeResize.y + beforeResize.h + 20]]);
  const resized = await geometry(resizeNote);
  assert(resized.h > beforeResize.h);
  assert.deepEqual(await copyLines(), [undoText]);
  assert.equal(await style(editPrompt, 'animationName'), breathe);
  assert.equal(await visible('.music-guide-enter'), false);
  const editCompletedAt = Date.now();
  await key('Backspace');
  assert.equal(await notes(), 6);
  assert.equal((await geometry(resizeNote)).h, beforeResize.h);
  assert.deepEqual(await copyLines(), []);
  assert.equal(await visible('.music-guide-enter'), false);
  await key('Backspace');
  assert.equal(await notes(), 7);
  assert.deepEqual(await copyLines(), []);
  await expectCue(editCompletedAt, 'the edit cue waits 1.5 seconds after undo');
  const previousGroups = await js('document.querySelectorAll(".melody-note-family").length');
  await click('.melody-add-tone');
  await ready('.melody-tone-library[open] .melody-library-tone');
  await click('.melody-tone-library .melody-library-tone');
  assert.equal(await js('document.querySelectorAll(".melody-note-family").length'), previousGroups + 1);
  assert(await js('Array.from(document.querySelectorAll(".melody-note-family")).filter(card=>card.textContent===document.querySelector(".melody-note-family.is-selected").textContent).length===2'));
  assert(await js('Array.from(document.querySelectorAll(".melody-note")).every(note=>note.classList.contains("is-dim"))'));
  await gesture([[drawPoint[0] + 90, drawPoint[1]], [drawPoint[0] + 90, drawPoint[1] + 85]]);
  assert.equal(await notes(), 8);
  await gesture([[drawPoint[0], drawPoint[1] + 110]], 'right');
  await next();
  await step(10);
  assert(await visible('.song-topbar'));
  assert.equal(await js('document.querySelector(".song-topbar .song-clock") === null'), true);
  assert.deepEqual(await copyLines(), ['顶栏是核心控制区', '左上角是乐曲名，双击可修改']);
  assert.equal(await style('.music-guide-copy p:first-child', 'color'), darkPrompt);
  assert.equal(await style('.music-guide-copy p:last-child', 'color'), 'rgb(98, 119, 140)');
  await key('Enter');
  assert.equal(await currentStep(), 10);
  await click('.song-play');
  await wait(() => js('!!document.querySelector(".melody-key.is-sounding")'), 'note lights the corresponding key');
  await click('.song-stop');
  await call(() => {
    document.querySelector('.song-project-name').dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
    const input = document.querySelector('.song-project-name-input');
    input.value = '已保存的练习';
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
  });
  await wait(async () => await name() === '已保存的练习', 'title change');
  await click('.song-save-project');
  await wait(() => js('!document.querySelector(".song-project-unsaved:not([hidden])")'), 'practice saved');
  const savedCount = await notes();
  const unsavedNote = await geometry('.melody-note');
  await gesture([[unsavedNote.x + unsavedNote.w / 2, unsavedNote.y + unsavedNote.h / 2]], 'right');
  assert.equal(await notes(), savedCount - 1);
  await click('.song-exit');
  await ready('.project-exit-dialog[open]');
  await click('.project-exit-cancel');
  await wait(async () => !await visible('.project-exit-dialog[open]'), 'cancel keeps the guide open');
  assert.equal(await currentStep(), 10);
  await ready('.music-guide-enter');
  await key('Enter');
  await ready('.music-guide-launch');
  assert.equal(await visible('.music-guide'), false);
  assert(await visible('.welcome-actions .primary'));
  assert.deepEqual(bridgeCalls, []);
  await click('.music-guide-launch');
  await step(1);
  assert.equal(await visible('.music-guide-enter'), false);
  await key('Enter');
  assert.equal(await currentStep(), 2);

  stage = 'double Enter skips';
  const enterSteps = await call(() => {
    const original = Object.getOwnPropertyDescriptor(performance, 'now');
    const start = Math.ceil(performance.now());
    let time = start;
    Object.defineProperty(performance, 'now', { value: () => time, configurable: true });
    function press(offset, repeat = false) {
      time = start + offset;
      document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', repeat, bubbles: true, cancelable: true }));
      return Number(document.querySelector('.music-guide').dataset.step);
    }
    try { return [press(0), press(176), press(200, true), press(351)]; }
    finally {
      if (original) Object.defineProperty(performance, 'now', original);
      else delete performance.now;
    }
  });
  assert.deepEqual(enterSteps, [2, 2, 2, 3]);
  await step(3);
  await key('Enter');
  assert.equal(await currentStep(), 3);
  await key('Enter');
  await step(4);
  const lowerEdge = await geometry('.melody-roll-end');
  const edgeX = lowerEdge.x + lowerEdge.w / 2, edgeY = lowerEdge.y + lowerEdge.h / 2;
  const canvasBottom = await geometry('.melody-canvas');
  const dragRoom = canvasBottom.y + canvasBottom.h - edgeY;
  assert(dragRoom > 100);
  await gesture([[edgeX, edgeY], [edgeX, edgeY + dragRoom * .75]]);
  assert((await geometry('.melody-roll-end')).y > lowerEdge.y + 80);
  await key('Enter');
  assert.equal(await currentStep(), 4);
  await key('Enter');
  await step(5);
  assert(await visible('.melody-roll-end'));
  const gapBeforeSweep = await beatGap();
  await wait(async () => await animatedTempo() > 140, 'tempo sweep starts before skipping');
  assert.equal(await visible('.music-guide-enter'), false);
  await key('Enter');
  assert.equal(await currentStep(), 5);
  await key('Enter');
  await step(6);
  assert.equal(await visible('.music-guide-tempo-flight'), false);
  assert(Math.abs(await beatGap() - gapBeforeSweep) <= 1);
  assert.equal(await js('document.querySelector(".melody-tempo-button").textContent'), '120');
  await ready(flyingCards);
  await key('Enter');
  assert.equal(await currentStep(), 6);
  await key('Enter');
  await step(7);
  assert(await visible(cards));
  assert(await visible(plus));
  assert.equal(await visible(flyingCards), false);
  stage = 'discard practice';
  for (const nextStep of [8, 9, 10]) {
    await key('Enter');
    await key('Enter');
    await step(nextStep);
  }
  await click('.song-exit');
  await ready('.project-exit-dialog[open]');
  await click('.project-exit-discard');
  await ready('.music-guide-launch');
  assert.equal(await visible('.music-guide'), false);
  assert.deepEqual(bridgeCalls, []);
  await click('.music-guide-launch');
  await step(1);
  await key('Escape');
  await ready('.music-guide-launch');
  assert.deepEqual(await js('window.errors'), []);
}
runTest().then(() => {
  console.log('Ten guide stages, keyboard timing, playback, practice save/discard and return to welcome passed.');
  win.destroy(); app.exit(0);
}).catch(async error => {
  const page = await js('({ text:document.body.innerText.slice(0,1600), errors:window.errors })').catch(() => undefined);
  console.error(stage, error, page, run);
  win?.destroy(); app.exit(1);
});
