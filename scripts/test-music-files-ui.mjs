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
const methods=['Read','Create','CreateCopy','CreateDetached','OpenKnown','OpenDocument','ReadDocument','PrepareDocumentSave','FinishLoading','Exit','Save','Browse','List'];
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
stage='unchanged Save';const original=fs.readFileSync(path.join(project,'Demo.mid'));await js("document.querySelector('.song-save-project').click()");await wait("!document.querySelector('.song-save-project').disabled");await delay(80);
check(fs.readFileSync(path.join(project,'Demo.mid')).equals(original),'unchanged UI Save retains MIDI bytes');
stage='high BPM edit';await js("document.querySelector('.melody-tempo-marker[aria-label=\\\"卷帘 2 BPM\\\"]').click()");await wait("!document.querySelector('.melody-tempo-panel').hidden");
await js("(()=>{const input=document.querySelector('.melody-tempo-input');input.value='1000';input.dispatchEvent(new Event('change',{bubbles:true}));document.querySelector('.melody-tempo-button').click();})()");
check(await js("[...document.querySelectorAll('.melody-bpm-roll')].some(n=>n.dataset.tempoBpm==='1000')"),'second roll accepts 1000 BPM');
stage='rename and Save';await js("(()=>{const n=document.querySelector('.song-project-name');n.dispatchEvent(new MouseEvent('dblclick',{bubbles:true}));})()");
await wait("!!document.querySelector('input.song-project-name-input')");
await js("(()=>{const n=document.querySelector('input.song-project-name-input');n.value='Renamed';n.dispatchEvent(new KeyboardEvent('keydown',{bubbles:true,key:'Enter'}));})()");
await delay(80);await js("document.querySelector('.song-save-project').click()");
for(let i=0;i<200&&!fs.existsSync(path.join(project,'Renamed.mid'));i++)await delay(30);
check(fs.existsSync(path.join(project,'Renamed.mid')),'renamed Save stays MIDI');check(!fs.existsSync(path.join(project,'Renamed.rootsound')),'no automatic rootsound copy');
check(!(await host('project.Read')).hasUnsavedChanges,'saved source is clean');
check(require('midi-file').parseMidi(fs.readFileSync(path.join(project,'Renamed.mid'))).tracks.flat().some(n=>n.type==='setTempo'&&n.microsecondsPerBeat===60000),'saved MIDI retains high BPM event');
stage='Save As shortcut';await js("document.dispatchEvent(new KeyboardEvent('keydown',{bubbles:true,cancelable:true,key:'S',ctrlKey:true,shiftKey:true}))");await wait("!!document.querySelector('.project-copy-dialog[open]')");check(await js("document.querySelector('.project-copy-dialog input').value==='Renamed 1'"),'native Save As shortcut uses separate name');await js("document.querySelector('.project-copy-dialog').close()");
stage='XML';await host('project.Exit',['discard']);await open('Score.musicxml');const loaded=new Promise(resolve=>win.webContents.once('did-finish-load',resolve));win.webContents.reload();await loaded;await wait("!!document.querySelector('.melody-workspace')");
await js("document.querySelector('.song-project-name').dispatchEvent(new MouseEvent('dblclick',{bubbles:true}))");await wait("!!document.querySelector('input.song-project-name-input')");await js("(()=>{const n=document.querySelector('input.song-project-name-input');n.value='XmlChanged';n.dispatchEvent(new KeyboardEvent('keydown',{bubbles:true,key:'Enter'}));})()");await delay(60);
const before=fs.readFileSync(path.join(project,'Score.musicxml'));await js("document.querySelector('.song-save-project').click()");await wait("!!document.querySelector('.format-save-warning[open]')");
check(fs.readFileSync(path.join(project,'Score.musicxml')).equals(before),'format warning precedes any write');await js("[...document.querySelectorAll('.format-save-warning button')].find(n=>n.textContent==='取消').click()");await wait("!document.querySelector('.song-save-project').disabled");
check(fs.readFileSync(path.join(project,'Score.musicxml')).equals(before),'cancel preserves XML');check((await host('project.Read')).hasUnsavedChanges,'cancel retains draft');
await js("document.querySelector('.song-save-project').click()");await wait("!!document.querySelector('.format-save-warning[open]')");await js("[...document.querySelectorAll('.format-save-warning button')].find(n=>n.textContent==='保存原格式').click()");
for(let i=0;i<200&&!fs.existsSync(path.join(project,'XmlChanged.musicxml'));i++)await delay(30);check(fs.existsSync(path.join(project,'XmlChanged.musicxml')),'confirmed save writes XML extension');check(fs.readFileSync(path.join(project,'XmlChanged.musicxml'),'utf8').includes('<score-partwise'),'confirmed output is actual XML');
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
  await wait('!!('+tile+')');await js('('+tile+').click()');
  await wait("!!document.querySelector('.melody-workspace')&&!document.querySelector('.song-exit').disabled");
}
await reopenLegacy();
stage='legacy project edit and discard';
await js("(()=>{const input=document.querySelector('.melody-tempo-input');input.value='137';input.dispatchEvent(new Event('change',{bubbles:true}));})()");
check(await js("document.querySelector('.melody-tempo-input').value==='137'"),'tempo edit is visible before exit');
check((await host('project.Read')).hasUnsavedChanges,'actual tempo edit is dirty');
await js("document.querySelector('.song-exit').click()");await wait("!!document.querySelector('.project-exit-dialog[open]')");
await js("document.querySelector('.project-exit-discard').click()");await wait("!!document.querySelector('.welcome')");
check(fs.readFileSync(legacyPath).equals(legacyBytes),'direct exit keeps the original demo file byte for byte');
await reopenLegacy();
check(await js("document.querySelector('.melody-tempo-input').value")===originalTempo,'reopening the same song restores its saved tempo');
check(!(await host('project.Read')).hasUnsavedChanges,'reopened song is clean');
fs.writeFileSync(path.join(root,'report.json'),JSON.stringify({passed:true,checks,desktopControl:false,physicalAudio:false,visibleWindow:false},null,2));win.destroy();processHost.stdin.end();await new Promise(resolve=>processHost.once('exit',resolve));lines.close();app.exit(0);
}catch(error){const page=win?await js("({text:document.body.innerText.slice(-1600),errors:window.__errors})").catch(()=>null):null;fs.writeFileSync(path.join(root,'report.json'),JSON.stringify({passed:false,error:String(error),stack:error?.stack,stage,page},null,2));processHost?.kill();win?.destroy();app.exit(1);}})();
`;
await fs.writeFile(path.join(root,'qa.cjs'),code);
const env={...process.env};delete env.ELECTRON_RUN_AS_NODE;
const child=spawn(path.resolve(process.argv[2]??'.cache/release-smoke-engine/electron.exe'),[path.join(root,'qa.cjs')],{env,windowsHide:true,stdio:['ignore','pipe','pipe']});
let output='';child.stderr.on('data',data=>output=(output+data).slice(-3000));child.stdout.on('data',data=>output=(output+data).slice(-3000));
const exit=await new Promise(resolve=>child.once('exit',resolve));console.log(await fs.readFile(path.join(root,'report.json'),'utf8').catch(()=>output));console.log('Evidence: '+root);if(exit)process.exitCode=1;
