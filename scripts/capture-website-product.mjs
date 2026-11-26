import { build } from 'vite';
import { mkdir, writeFile, readFile, mkdtemp } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import path from 'node:path';

const root = await mkdtemp(path.resolve('.cache/site-product-'));
const source = path.join(root, 'index.html');
await writeFile(source, `<!doctype html><html lang="zh-CN" class="windows-desktop-colors"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/src/workstation/modules/ui-rendering/studio.css"><link rel="stylesheet" href="/src/workstation/modules/ui-rendering/theme.css"><style>html,body,#app{margin:0;width:100%;height:100%;overflow:hidden}</style><main id="app"></main><script type="module">
import '/src/workstation/app/release-colors.css';
import { mountReleaseStudio } from '/src/workstation/app/release-studio.ts';
import { createBrowserTimbreFiles } from '/src/workstation/app/platform/timbre-files.ts';
import raw from '/project/演示项目/初次创作.rootsound?raw';
const envelope=JSON.parse(raw);let text=envelope.libraryText;
window.previewStudio=await mountReleaseStudio(document.querySelector('#app'), { pointerUx:true, demoProject:{id:'product-preview',name:envelope.name}, storage:{read:()=>text,write:value=>{text=value}},timbreFiles:createBrowserTimbreFiles() });
window.productReady=true;
</script></html>`);
const output = path.join(root, 'ui');
await build({ configFile: false, base: './', publicDir: false, build: { outDir: output, emptyOutDir: true, rollupOptions: { input: source } } });
const harness = path.join(root, 'capture.cjs');
await writeFile(harness, `const {app,BrowserWindow,session}=require('electron');const fs=require('node:fs'),path=require('node:path');
const root=${JSON.stringify(root)},ui=${JSON.stringify(output)},repo=${JSON.stringify(process.cwd())};
app.setPath('userData',path.join(root,'profile'));app.commandLine.appendSwitch('force-device-scale-factor','1');
let win;const timer=setTimeout(()=>{win?.destroy();app.exit(1)},30000);
(async()=>{try{await app.whenReady();await session.defaultSession.protocol.handle('https',async request=>{const u=new URL(request.url);if(u.hostname!=='product.local')return new Response('',{status:403});const name=decodeURIComponent(u.pathname).replace(/^\\//,'');const base=name.startsWith('instruments/')||name.startsWith('licenses/')?path.join(repo,'public'):ui;const file=path.resolve(base,name);if(!file.startsWith(base+path.sep))return new Response('',{status:403});try{return new Response(fs.readFileSync(file),{headers:{'Content-Type':{'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.webp':'image/webp','.wasm':'application/wasm'}[path.extname(file)]||'application/octet-stream'}})}catch{return new Response('',{status:404})}});
win=new BrowserWindow({show:false,width:1600,height:1000,webPreferences:{offscreen:true,contextIsolation:true,sandbox:true,backgroundThrottling:false}});
const entry=${JSON.stringify(path.relative(output, path.join(output, path.relative(process.cwd(), source))).replaceAll('\\','/'))};
const html=[];function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,e.name);if(e.isDirectory())walk(file);else if(e.name.endsWith('.html'))html.push(path.relative(ui,file).replaceAll('\\\\','/'))}}walk(ui);
await win.loadURL('https://product.local/'+html[0]);win.webContents.debugger.attach('1.3');await win.webContents.debugger.sendCommand('Emulation.setFocusEmulationEnabled',{enabled:true});
for(let i=0;i<200;i++){if(await win.webContents.executeJavaScript('!!window.productReady&&document.querySelectorAll(".melody-note").length>0'))break;await new Promise(r=>setTimeout(r,50));}
await win.webContents.executeJavaScript('document.querySelector(".melody-scroll").dispatchEvent(new PointerEvent("pointermove",{bubbles:true,pointerType:"mouse",clientX:500,clientY:500}));document.querySelector(".melody-scroll").dispatchEvent(new PointerEvent("pointermove",{bubbles:true,pointerType:"mouse",clientX:0,clientY:500,movementX:-500}))');
win.webContents.sendInputEvent({type:"mouseMove",x:850,y:915});await new Promise(r=>setTimeout(r,1100));
const count=await win.webContents.executeJavaScript('document.querySelectorAll(".melody-note").length');if(!count)throw Error('Current editor did not render');
fs.writeFileSync(path.join(repo,'website/assets/workspace.jpg'),(await win.webContents.capturePage()).toJPEG(94));
fs.writeFileSync(path.join(root,'report.json'),JSON.stringify({cards:await win.webContents.executeJavaScript('document.querySelector(".melody-workspace").className'),passed:true,source:'current release-studio with 初次创作.rootsound',notes:count,visibleWindow:win.isVisible()}));win.destroy();clearTimeout(timer);app.exit(0);
}catch(e){fs.writeFileSync(path.join(root,'report.json'),JSON.stringify({error:e.stack}));win?.destroy();app.exit(1)}})();`);
const env = { ...process.env }; delete env.ELECTRON_RUN_AS_NODE;
const code = await new Promise((resolve, reject) => {
  const child = spawn(path.resolve('.cache/release-smoke-engine/electron.exe'), [harness], { windowsHide: true, env, stdio: 'ignore' });
  child.on('error', reject); child.on('exit', resolve);
});
console.log(await readFile(path.join(root, 'report.json'), 'utf8'));
if (code) process.exitCode = 1;
