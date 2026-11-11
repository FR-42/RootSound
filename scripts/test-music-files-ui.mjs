// Production desktop renderer + real portable file service, fully hidden and isolated.
import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { writeMidi } from 'midi-file';
import { readMusicFile } from '../src/workstation/app/music-file.ts';
import { writeExchangeXml } from '../src/workstation/app/music-interchange-xml.ts';
const evidence=path.resolve('.test-output/music-formats');await fs.mkdir(evidence,{recursive:true});
const root=await fs.mkdtemp(path.join(evidence,'ui-')),project=path.join(root,'project');await fs.mkdir(project);
const midi=Uint8Array.from(writeMidi({header:{format:0,numTracks:1,ticksPerBeat:480},tracks:[[
  {deltaTime:0,type:'setTempo',microsecondsPerBeat:500000},{deltaTime:0,type:'noteOn',channel:0,noteNumber:60,velocity:100},
  {deltaTime:480,type:'setTempo',microsecondsPerBeat:273973},{deltaTime:480,type:'noteOff',channel:0,noteNumber:60,velocity:0},{deltaTime:0,type:'endOfTrack'},
]]}));
const score={name:'Score',length:4,tempos:[{beat:0,bpm:120}],parts:[{name:'Piano',program:0,notes:[{beat:0,duration:1,pitch:60,velocity:.8,level:1,pan:0}]}]};
const fixtures=[['Demo.mid',midi,'midi'],['Score.musicxml',writeExchangeXml(score,false),'musicxml']];
for(const [name,bytes,format]of fixtures){await fs.writeFile(path.join(project,name),bytes);await fs.writeFile(path.join(root,name+'.json'),readMusicFile(bytes,name,format).libraryText);}
const legacyName='幻想即兴曲 Op.66.rootsound';
const legacyFixture=path.resolve('project','演示项目',legacyName);
const methods=['Read','Create','CreateCopy','CreateDetached','OpenKnown','OpenDocument','ReadDocument','FinishLoading','Exit','Save','Browse','List','CreateLibraryFolder','RenameLibraryEntry','DeleteLibraryEntry','Rename','Inspect','Delete'];
await fs.writeFile(path.join(root,'preload.cjs'),`
const {contextBridge,ipcRenderer}=require('electron');
const call=(method,...args)=>ipcRenderer.invoke('call',method,args),sync=(method,...args)=>ipcRenderer.sendSync('sync',method,args);
contextBridge.exposeInMainWorld('rootSoundDesktop',{storage:{Read:()=>sync('storage.Read'),WriteScoped:(...args)=>sync('storage.WriteScoped',...args),WriteScopedCheckpoint:(...args)=>sync('storage.WriteScopedCheckpoint',...args)},
 files:{Open:()=>{},Save:()=>{}},audioFiles:{Save:()=>{}},timbreFiles:{State:()=>call('timbres.State'),Sync:id=>call('timbres.Sync',id??''),Open:()=>{}},
 projectDirectories:Object.fromEntries(${JSON.stringify(methods)}.map(name=>[name,(...args)=>call('project.'+name,...args)]))});
`);
const setupScript=`localStorage.setItem('rootsound.learning.v1',JSON.stringify({version:1,multipleTempoRolls:true,guides:{basics:{status:'new',step:0},'tempo-rolls':{status:'skipped',step:0}}}));window.__errors=[];window.addEventListener('error',e=>__errors.push(e.message));window.addEventListener('unhandledrejection',e=>__errors.push(String(e.reason)));`;
const code=`
const {app,BrowserWindow,ipcMain,session}=require('electron'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{spawn}=require('node:child_process'),{createInterface}=require('node:readline');
const root=${JSON.stringify(root)},project=path.join(root,'project'),ui=${JSON.stringify(path.resolve('dist'))},hostDll=${JSON.stringify(path.resolve('.test-output/music-formats/host/RootSound.Host.dll'))};
app.setPath('userData',path.join(root,'profile'));app.commandLine.appendSwitch('disable-gpu');
let stage='start',checks=0,processHost,win,lines,sequence=0;const pending=new Map();
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function wait(expression){for(let i=0;i<300;i++){if(await js(expression).catch(()=>false))return;await delay(30);}throw Error('Timeout '+expression);}
function js(expression){return win.webContents.executeJavaScript('(async()=>('+expression+'))()');}
function rpc(method,args=[]){return new Promise((resolve,reject)=>{const id=++sequence;const timer=setTimeout(()=>reject(Error('RPC timeout '+method)),15000);pending.set(id,line=>{clearTimeout(timer);resolve(line.result);});processHost.stdin.write(JSON.stringify({id,method,args})+'\\n');});}
async function host(method,args=[]){const result=JSON.parse(await rpc(method,args));if(result.status==='error')throw Error(result.message);return result;}
const check=(value,label)=>{assert(value,label);checks++;};
(async()=>{try{
await app.whenReady();processHost=spawn('dotnet',[hostDll,root],{windowsHide:true,stdio:['pipe','pipe','pipe']});lines=createInterface({input:processHost.stdout});lines.on('line',text=>{const line=JSON.parse(text);pending.get(line.id)?.(line);pending.delete(line.id);});
ipcMain.handle('call',(_event,method,args)=>rpc(method,args));ipcMain.on('sync',(event,method,args)=>{rpc(method,args).then(value=>event.returnValue=value);});
await session.defaultSession.protocol.handle('https',async request=>{const url=new URL(request.url);if(url.hostname!=='rootsound.local')return new Response('',{status:403});const file=path.join(ui,decodeURIComponent(url.pathname));let bytes=fs.readFileSync(file);const ext=path.extname(file);if(ext==='.html')bytes=Buffer.from(bytes.toString().replace('<head>','<head><script>'+${JSON.stringify(setupScript)}+'</script>'));return new Response(bytes,{headers:{'Content-Type':{'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.wasm':'application/wasm'}[ext]??'application/octet-stream'}});});
async function open(name){const file=path.join(project,name),source=await host('project.OpenKnown',[file]);await host('project.OpenDocument',[file,source.token,fs.readFileSync(path.join(root,name+'.json'),'utf8')]);}
await open('Demo.mid');win=new BrowserWindow({show:false,width:1300,height:900,webPreferences:{preload:path.join(root,'preload.cjs'),contextIsolation:true,sandbox:true,backgroundThrottling:false}});
await win.loadURL('https://rootsound.local/index.html');
stage='first launch with a project already open';
await wait("!!document.querySelector('.guidance-invitation')");
check(await js("document.querySelector('.guidance-invitation h2').textContent==='是否观看引导'&&!document.querySelector('.melody-workspace')"),'first startup asks before rendering an already-open score');
await js("document.querySelector('.guidance-skip').click()");await wait("!!document.querySelector('.melody-workspace')");
check(await js("localStorage.getItem('rootsound.desktop-guide-choice.v1')==='no'"),'skip is remembered for the desktop profile');
stage='MIDI startup';check(await js("document.querySelectorAll('.melody-note').length===1"),'source note renders');check(await js("!document.querySelector('.song-save-as, .song-midi-effects')"),'the top bar has no native Save As or MIDI effects button');
check(await js("document.querySelectorAll('.melody-key').length===128&&document.querySelector('.melody-key[data-pitch-label=\\\"C-1\\\"]')!==null&&document.querySelector('.melody-key[data-pitch-label=\\\"G9\\\"]')!==null"),'complete MIDI keyboard renders');
check(await js("document.querySelector('.melody-tempo-input').min==='1'&&document.querySelector('.melody-tempo-input').max==='1000'"),'BPM field exposes expanded range');
check(await js("[...document.querySelectorAll('.melody-bpm-roll')].map(n=>n.dataset.tempoBpm).join(',')==='120,"+(60000000/273973)+"'"),'source tempo changes retain precision in separate BPM rolls');
check(await js("document.querySelector('.melody-tempo-input').value==='219'&&document.querySelector('.melody-tempo-button').textContent==='219'"),'fractional MIDI tempo is displayed as an integer');
check(!(await host('project.Read')).hasUnsavedChanges,'loading source is clean');check(!fs.readdirSync(project).some(name=>name.endsWith('.rootsound')),'opening does not create native file');
stage='save picker and MIDI copy';
const original=fs.readFileSync(path.join(project,'Demo.mid'));
const clickText=label=>js("[...document.querySelectorAll('button')].find(n=>n.textContent=== "+JSON.stringify(label)+").click()");
const openSave=async()=>{await js("document.querySelector('.song-save-project').click()");await wait("!!document.querySelector('.project-library-folder, .project-library-midi, .project-library-song')");};
const nameDialog="!!document.querySelector('.project-copy-dialog[open]')";
const saveOriginal='保存',saveCopy='另存为',discard='直接退出';
const saveButton=label=>"[...document.querySelectorAll('.project-library-save-actions button')].find(n=>n.textContent=== "+JSON.stringify(label)+")";
const saveLabels=()=>js("[...document.querySelectorAll('.project-library-save-actions button')].map(n=>n.textContent).join(',')");
const clickSave=label=>js('('+saveButton(label)+').click()');
const isOriginalDisabled=()=>js('('+saveButton(saveOriginal)+').disabled');
async function enterName(value){
  await wait(nameDialog);
  await js("(()=>{const form=document.querySelector('.project-copy-dialog form');form.querySelector('input').value="+JSON.stringify(value)+";form.requestSubmit()})()");
}
await openSave();
check(await saveLabels()==='另存为,保存','regular save only shows the two save actions');
check(await js("(()=>{const buttons=[...document.querySelectorAll('.project-library-save-actions button')];return buttons.every(n=>getComputedStyle(n).backgroundColor==='rgba(0, 0, 0, 0)'&&getComputedStyle(n).color===getComputedStyle(buttons[0]).color)})()"),'save actions use matching neutral styles');
check(await isOriginalDisabled(),'external files cannot save to original');
check(await js("!document.querySelector('.song-export-audio')"),'audio export is hidden');
await clickSave(saveCopy);await wait(nameDialog);
check(await js("document.querySelector('.project-copy-dialog input').value==='Demo 1'"),'same-directory copy suggests a suffix');
await js("document.querySelector('.project-copy-dialog').close()");
await wait("!document.querySelector('.project-copy-dialog')");
await clickText('新建文件夹');await enterName('Drafts');
await wait("!![...document.querySelectorAll('.project-library-folder')].find(n=>n.textContent==='Drafts')");
await clickText('Drafts');
await wait("!![...document.querySelectorAll('.project-library-navigation button')].find(n=>n.textContent==='Drafts')");
await clickSave(saveCopy);await wait(nameDialog);
check(await js("document.querySelector('.project-copy-dialog input').value==='Demo'"),'another folder keeps the original name');
await enterName('Demo');
await wait("!!document.querySelector('.melody-workspace')&&!document.querySelector('.project-library-overlay:not([hidden])')&&!document.querySelector('.song-save-project').disabled");
const copied=path.join(project,'Drafts','Demo.rootsound');
check(fs.existsSync(copied)&&fs.readFileSync(path.join(project,'Demo.mid')).equals(original),'native copy keeps original MIDI bytes');
stage='original save keeps native path';
await js("document.querySelector('.song-project-name').dispatchEvent(new MouseEvent('dblclick',{bubbles:true}))");
await wait("!!document.querySelector('.song-project-name-input')");
await js("(()=>{const n=document.querySelector('.song-project-name-input');n.value='New title';n.dispatchEvent(new KeyboardEvent('keydown',{bubbles:true,key:'Enter'}));})()");
await openSave();
check(!(await isOriginalDisabled()),'native project can save to original');
await clickSave(saveOriginal);
await wait("!document.querySelector('.project-library-overlay:not([hidden])')");
check(await js("!!document.querySelector('.melody-workspace')"),'regular save keeps the current editor open');
check(JSON.parse(fs.readFileSync(copied)).name==='New title','original file stores the new title at the same path');
check(!fs.existsSync(path.join(project,'Drafts','New title.rootsound')),'original save does not rename the file');
stage='library folder operations';
await openSave();
await clickText('新建文件夹');await enterName('Temporary');
const button=label=>"[...document.querySelectorAll('button')].find(n=>n.getAttribute('aria-label')=== "+JSON.stringify(label)+")";
async function rightClick(label){
  const entry=button(label);
  await wait('!!('+entry+')');
  await js('('+entry+").dispatchEvent(new MouseEvent('contextmenu',{bubbles:true,cancelable:true,button:2,clientX:400,clientY:300}))");
}
await wait('!!('+button('打开文件夹 Temporary')+')');
check(await js('!('+button('改名 Temporary')+')&&!('+button('删除 Temporary')+')'),'library entries have no inline rename or delete buttons');
await rightClick('打开文件夹 Temporary');
check(await js("!document.querySelector('.project-library-context').hidden&&[...document.querySelectorAll('.project-library-context button')].map(n=>n.textContent).join(',')==='改名,删除'"),'right-click opens the context menu');
await js("document.activeElement.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}))");
check(await js("document.querySelector('.project-library-context').hidden&&!document.querySelector('.project-library-overlay').hidden"),'Escape dismisses only the context menu');
await rightClick('打开文件夹 Temporary');
await js('('+button('改名 Temporary')+').click()');
await js("(()=>{const input=document.querySelector('.project-library-name');input.value='Renamed';input.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true}));})()");
await rightClick('打开文件夹 Renamed');
await js('('+button('删除 Renamed')+').click()');
await js("document.querySelector('.project-delete-actions button:last-child').click()");
await wait("document.querySelector('.project-delete-overlay').hidden");
check(!fs.existsSync(path.join(project,'Renamed')),'library removed the renamed folder');
await js("document.querySelector('.project-library-close').click()");
await wait("!document.querySelector('.project-library-overlay:not([hidden])')");
stage='closing save can be cancelled';
const libraryOpen="!!document.querySelector('.project-library-overlay:not([hidden])')";
const changeTempo=tempo=>js("(()=>{const input=document.querySelector('.melody-tempo-input');input.value="+tempo+";input.dispatchEvent(new Event('change',{bubbles:true}));})()");
async function closeChoice(){
  check((await js("globalThis.__rootSoundPrepareClose('check')")).canSave,'native close preparation completes');
  await js("(()=>{window.__saveOnClose=globalThis.__rootSoundPrepareClose('save');return true})()");
  await wait(libraryOpen+"&&!document.querySelector('.project-library-save-actions button:last-child').disabled");
  check(await saveLabels()==='直接退出,另存为,保存','window close picker shows all three actions');
}
await changeTempo(131);
const beforeClosing=fs.readFileSync(copied);
await closeChoice();
await js("document.querySelector('.project-library-close').click()");
check(await js("window.__saveOnClose.then(result=>result.cancelled===true)"),'cancelled picker leaves the editor open');
check((await host('project.Read')).hasUnsavedChanges&&fs.readFileSync(copied).equals(beforeClosing),'cancel retains the unsaved draft');
stage='window close can save or discard in the library';
await closeChoice();await clickSave(discard);
check(await js("window.__saveOnClose.then(result=>result.discarded===true&&result.saved!==true)"),'discard asks the native window to close without saving');
check(fs.readFileSync(copied).equals(beforeClosing),'discard has not overwritten the original');
await closeChoice();await clickSave(saveOriginal);
check(await js("window.__saveOnClose.then(result=>result.saved===true&&result.discarded!==true)"),'save asks the native window to close after saving');
check(!(await host('project.Read')).hasUnsavedChanges&&!fs.readFileSync(copied).equals(beforeClosing),'window close save writes the original first');
await changeTempo(132);
await closeChoice();await clickSave(saveCopy);await enterName('Window copy');
check(await js("window.__saveOnClose.then(result=>result.saved===true)"),'save as also asks the native window to close');
check(fs.existsSync(path.join(project,'Window copy.rootsound')),'window close save as writes the copy first');
check((await js('__errors')).length===0,'no renderer errors');check(!win.isVisible(),'window stayed hidden');
stage='legacy project startup';
const legacyPath=path.join(project,${JSON.stringify(legacyName)});
fs.copyFileSync(${JSON.stringify(legacyFixture)},legacyPath);
const legacyBytes=fs.readFileSync(legacyPath);
await host('project.Exit',['discard']);await host('project.OpenKnown',[legacyPath]);
const legacyLoaded=new Promise(resolve=>win.webContents.once('did-finish-load',resolve));win.webContents.reload();await legacyLoaded;
await wait("!!document.querySelector('.melody-workspace')&&!document.querySelector('.song-exit').disabled");
const originalTempo=await js("document.querySelector('.melody-tempo-input').value");
check(!(await host('project.Read')).hasUnsavedChanges,'automatic upgrade of the demo timbre catalog is not a user edit');
await js("document.querySelector('.song-exit').click()");await wait("!!document.querySelector('.welcome')");
async function reopenLegacy(){
  await js("document.querySelector('.welcome-actions button').click()");
  const tile="[...document.querySelectorAll('.project-library-song')].find(n=>n.textContent==='幻想即兴曲 Op.66')";
  await wait('!!('+tile+')');
  check(await saveLabels()==='','welcome library has no save or discard actions');
  await js('('+tile+').click()');
  await wait("!!document.querySelector('.melody-workspace')&&!document.querySelector('.song-exit').disabled");
}
await reopenLegacy();
stage='legacy project edit and discard';
await changeTempo(137);
check(await js("document.querySelector('.melody-tempo-input').value==='137'"),'tempo edit is visible before exit');
check((await host('project.Read')).hasUnsavedChanges,'actual tempo edit is dirty');
async function exitPicker(){
  await js("document.querySelector('.song-exit').click()");await wait(libraryOpen+"&&!document.querySelector('.project-library-save-actions button:last-child').disabled");
  check(await saveLabels()==='直接退出,另存为,保存','project exit picker shows all three actions');
  check(await js("!document.querySelector('.project-exit-dialog[open]')"),'dirty editor opens the library directly');
}
await exitPicker();await clickSave(discard);await wait("!!document.querySelector('.welcome')");
check(fs.readFileSync(legacyPath).equals(legacyBytes),'direct exit keeps the original demo file byte for byte');
await reopenLegacy();
check(await js("document.querySelector('.melody-tempo-input').value")===originalTempo,'reopening the same song restores its saved tempo');
check(!(await host('project.Read')).hasUnsavedChanges,'reopened song is clean');
stage='dirty project saves before exiting to welcome';
await changeTempo(138);await exitPicker();await clickSave(saveOriginal);await wait("!!document.querySelector('.welcome')");
check(!(await host('project.Read')).current&&!fs.readFileSync(legacyPath).equals(legacyBytes),'project saves the original and returns to welcome');
await reopenLegacy();await changeTempo(139);await exitPicker();await clickSave(saveCopy);await enterName('Exit copy');await wait("!!document.querySelector('.welcome')");
check(!(await host('project.Read')).current&&fs.existsSync(path.join(project,'Exit copy.rootsound')),'save as writes the copy and returns to welcome');
fs.writeFileSync(path.join(root,'report.json'),JSON.stringify({passed:true,checks,desktopControl:false,physicalAudio:false,visibleWindow:false},null,2));win.destroy();processHost.stdin.end();await new Promise(resolve=>processHost.once('exit',resolve));lines.close();app.exit(0);
}catch(error){const page=win?await js("({text:document.body.innerText.slice(-1600),errors:window.__errors})").catch(()=>null):null;fs.writeFileSync(path.join(root,'report.json'),JSON.stringify({passed:false,error:String(error),stack:error?.stack,stage,page},null,2));processHost?.kill();win?.destroy();app.exit(1);}})();
`;
await fs.writeFile(path.join(root,'qa.cjs'),code);
const env={...process.env};delete env.ELECTRON_RUN_AS_NODE;
const child=spawn(path.resolve(process.argv[2]??'.cache/release-smoke-engine/electron.exe'),[path.join(root,'qa.cjs')],{env,windowsHide:true,stdio:['ignore','pipe','pipe']});
let output='';child.stderr.on('data',data=>output=(output+data).slice(-3000));child.stdout.on('data',data=>output=(output+data).slice(-3000));
const exit=await new Promise(resolve=>child.once('exit',resolve));console.log(await fs.readFile(path.join(root,'report.json'),'utf8').catch(()=>output));console.log('Evidence: '+root);if(exit)process.exitCode=1;
