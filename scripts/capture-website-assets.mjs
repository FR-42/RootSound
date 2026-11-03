// Render only the original demonstration in a permanently hidden app window.
// No user projects, desktop capture, input automation or audio hardware.
import {readFile,writeFile,mkdir,mkdtemp,copyFile} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import path from 'node:path';
await mkdir('.test-output/rb127',{recursive:true});
const root=await mkdtemp(path.resolve('.test-output/rb127/capture-'));
await copyFile('desktop/assets/RootSound.svg','website/assets/icon.svg');
const plan=JSON.parse(await readFile('.cache/release-package-plan.json','utf8'));
const harness=path.join(root,'capture.cjs');
await writeFile(harness,`
const {app,BrowserWindow,dialog}=require('electron'),fs=require('node:fs'),path=require('node:path'),Module=require('node:module');
const root=${JSON.stringify(root)},main=${JSON.stringify(path.join(plan.windows,'resources/app/main.cjs'))};
app.setPath('userData',path.join(root,'profile'));app.commandLine.appendSwitch('disable-gpu');app.commandLine.appendSwitch('force-device-scale-factor','1');
dialog.showErrorBox=(_t,message)=>{fs.writeFileSync(path.join(root,'report.json'),JSON.stringify({error:message}));app.exit(1)};dialog.showMessageBox=async()=>({response:2});
let source=fs.readFileSync(${JSON.stringify(path.resolve('desktop/electron/main.cjs'))},'utf8')
 .replace('path.dirname(process.execPath)',JSON.stringify(path.join(root,'data')))
 .replace("await seedBundledProjects(path.join(base, 'seed-projects'), dataDirectory);",'// No user or bundled music.')
 .replace("path.resolve(base, 'ui')",JSON.stringify(${JSON.stringify(path.resolve('.cache/release-ui'))}))
 .replace("path.join(base, 'host', 'RootSound.Host.dll')",JSON.stringify(${JSON.stringify(path.resolve('.cache/release-host/RootSound.Host.dll'))}))
 .replace('webSecurity: true','webSecurity: true, backgroundThrottling: false')
 .replace("window.once('ready-to-show', () => window.show());",'// Permanently hidden.');
const loaded=new Module(main,module);loaded.filename=main;loaded.paths=Module._nodeModulePaths(path.dirname(main));loaded._compile(source,main);
const delay=ms=>new Promise(r=>setTimeout(r,ms));async function wait(check){for(let i=0;i<400;i++){if(await check())return;await delay(30)}throw Error('Renderer timeout')}
(async()=>{try{
 await app.whenReady();await wait(()=>BrowserWindow.getAllWindows().length);const win=BrowserWindow.getAllWindows()[0];win.setContentSize(1280,760);
 const js=code=>win.webContents.executeJavaScript('(async()=>('+code+'))()');await wait(()=>js("!!document.querySelector('.welcome')").catch(()=>false));
 const state=await js('JSON.parse(await rootSoundDesktop.projectDirectories.Read())');
 const fixture=fs.readFileSync(${JSON.stringify(path.resolve('.test-output/rb127/demo-library.json'))},'utf8');
 const made=await js('JSON.parse(await rootSoundDesktop.projectDirectories.Create('+JSON.stringify('微光 · 原创演示')+','+JSON.stringify(state.defaultLocation)+','+JSON.stringify(fixture)+'))');if(made.status!=='created')throw Error(JSON.stringify(made));
 const workspace=JSON.parse(fs.readFileSync(${JSON.stringify(path.resolve('.test-output/rb127/demo-workspace.json'))},'utf8'));
 await js('localStorage.setItem('+JSON.stringify('rootsound.music-workspace.v1:'+encodeURIComponent(made.project.id))+','+JSON.stringify(JSON.stringify(workspace.state))+')');
 const ready=new Promise(resolve=>win.webContents.once('did-finish-load',resolve));win.webContents.reload();await ready;
 await wait(()=>js("!!document.querySelector('.melody-workspace.is-vertical') && document.querySelectorAll('.melody-note').length>10").catch(()=>false));
 await delay(200);if(win.isVisible())throw Error('Fixture must stay hidden');
 const image=await win.webContents.capturePage();fs.writeFileSync(path.join(root,'workspace.png'),image.toPNG());
 fs.writeFileSync(path.join(root,'report.json'),JSON.stringify({originalDemo:true,visibleWindow:false,userProjectsRead:false,audioDeviceOpened:false,notes:await js("document.querySelectorAll('.melody-note').length"),size:image.getSize()}));
 win.destroy();app.exit(0);
}catch(error){fs.writeFileSync(path.join(root,'report.json'),JSON.stringify({error:error.stack}));app.exit(1)}})();
`);
const env={...process.env};delete env.ELECTRON_RUN_AS_NODE;
const code=await new Promise(resolve=>{const child=spawn(path.resolve('.cache/release-smoke-engine/electron.exe'),[harness],{env,windowsHide:true,stdio:'ignore'});child.on('error',()=>resolve(1));child.on('exit',resolve)});
console.log(await readFile(path.join(root,'report.json'),'utf8'));if(code)process.exitCode=1;
else await copyFile(path.join(root,'workspace.png'),'.test-output/rb127/workspace.png');
