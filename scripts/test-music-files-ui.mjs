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
const manyMidi=Uint8Array.from(writeMidi({header:{format:0,numTracks:1,ticksPerBeat:480},tracks:[[
  ...Array.from({length:48},(_,program)=>[
    {deltaTime:0,type:'programChange',channel:0,programNumber:program},
    {deltaTime:0,type:'noteOn',channel:0,noteNumber:60+program%12,velocity:100},
    {deltaTime:30,type:'noteOff',channel:0,noteNumber:60+program%12,velocity:0},
  ]).flat(),{deltaTime:0,type:'endOfTrack'},
]]}));
const fixtures=[['Demo.mid',midi,'midi'],['Score.musicxml',writeExchangeXml(score,false),'musicxml'],['Many.mid',manyMidi,'midi']];
for(const [name,bytes,format]of fixtures){await fs.writeFile(path.join(project,name),bytes);await fs.writeFile(path.join(root,name+'.json'),readMusicFile(bytes,name,format).libraryText);}
const oldNames=JSON.parse(readMusicFile(midi,'TimbreNames.mid','midi').libraryText);
oldNames.contents.find(item=>item.kind==='rootsound.timbre').name='大钢琴';
await fs.writeFile(path.join(project,'TimbreNames.rootsound'),JSON.stringify({format:'RootSoundWorkspace',version:2,id:crypto.randomUUID(),name:'TimbreNames',createdAtUtc:new Date().toISOString(),libraryText:JSON.stringify(oldNames)}));
const legacyName='幻想即兴曲 Op.66.rootsound';
const legacyFixture=path.resolve('project','演示项目',legacyName);
const methods=['Read','Create','StartNew','CreateCopy','CreateDetached','OpenKnown','OpenDocument','ReadDocument','FinishLoading','Exit','Save','Browse','List','CreateLibraryFolder','RenameLibraryEntry','DeleteLibraryEntry','Rename','Inspect','Delete'];
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
setTimeout(()=>{fs.writeFileSync(path.join(root,'report.json'),JSON.stringify({passed:false,stage,checks,error:'UI regression exceeded 60 seconds'},null,2));processHost?.kill();win?.destroy();app.exit(1);},60000).unref();
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
await open('Demo.mid');win=new BrowserWindow({show:false,width:1300,height:900,webPreferences:{preload:path.join(root,'preload.cjs'),contextIsolation:true,sandbox:true,backgroundThrottling:false,offscreen:true}});
stage='load desktop renderer';
await win.loadURL('https://rootsound.local/index.html');
stage='focus emulation';win.webContents.debugger.attach('1.3');await win.webContents.debugger.sendCommand('Emulation.setFocusEmulationEnabled',{enabled:true});
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
check(!(await host('project.Read')).hasUnsavedChanges,'loading source is clean');check(!fs.existsSync(path.join(project,'Demo.rootsound')),'opening does not create native file');
stage='tone deck proportions';
await js("document.querySelector('.melody-tone-pile').click()");
await wait("!!document.querySelector('.melody-library-deck')");
await js("(()=>{window.__deckNodes=[...document.querySelectorAll('.melody-library-card')];window.__deckMeasureCount=0;window.__deckOriginalMeasure=Element.prototype.getBoundingClientRect;Element.prototype.getBoundingClientRect=function(){if(this.matches('.melody-library-card,.melody-card-backs,.melody-tone-pile'))window.__deckMeasureCount++;return window.__deckOriginalMeasure.call(this)}})()");
check(await js("(()=>{const row=document.querySelector('.melody-library-deck'),animations=row.getAnimations({subtree:true}).filter(a=>a.effect.target.matches('.melody-library-card,.melody-card-backs'));return !row.inert&&row.classList.contains('is-deck-moving')&&animations.length>0&&animations.every(a=>a.effect.getTiming().duration===240&&!a.effect.getKeyframes().some(f=>String(f.transform).includes('rotateY')))})()"),'spreading restores the previous 240 ms animation without face turns');
await delay(70);
const deckReads=await js("window.__deckMeasureCount");
await delay(80);
check(await js("window.__deckMeasureCount")===deckReads,'card flight does not repeatedly read layout while moving');
await js("document.querySelector('.melody-tone-pile').click()");
check(await js("document.querySelector('.melody-library-deck').inert&&document.querySelector('.melody-library-deck').classList.contains('is-deck-moving')"),'the first click reverses the running spread');
await delay(45);
await js("document.querySelector('.melody-tone-pile').click()");
check(await js("!document.querySelector('.melody-library-deck').inert&&window.__deckNodes.every((node,index)=>document.querySelectorAll('.melody-library-card')[index]===node)"),'a second click reverses the gathering without replacing cards');
await wait("!document.querySelector('.melody-library-deck').classList.contains('is-deck-moving')");
check(await js("!!document.querySelector('.melody-library-tone [data-instrument-icon=studio-steel-guitar]')&&[...document.querySelectorAll('.melody-library-tone')].some(n=>n.textContent.includes('木吉他'))"),'the steel-string guitar is available with its icon in the song tone deck');
check(await js("(()=>{const stack=document.querySelector('.melody-card-backs i');return getComputedStyle(stack,'::after').backgroundImage.includes('url(')&&getComputedStyle(stack).backgroundColor==='rgb(255, 255, 255)'&&getComputedStyle(stack).borderTopColor==='rgb(214, 215, 223)'})()"),'the dotted note pattern is printed on white card backs with distinct paper edges');
const backPattern=fs.readFileSync(${JSON.stringify(path.resolve('src/workstation/modules/ui-rendering/tone-card-back.svg'))},'utf8');
check(backPattern.includes('id="dots"')&&backPattern.includes('id="shadow"')&&backPattern.includes('<ellipse'),'the card back has a note and a dotted shadow');
await js("void(Element.prototype.getBoundingClientRect=window.__deckOriginalMeasure)");
await js("document.querySelector('.melody-tone-library').dispatchEvent(new Event('cancel',{cancelable:true}))");
await wait("!!document.querySelector('.song-editor-controls[open]')");
check(await js("document.querySelector('.melody-tone-library').inert"),'details cover the open deck without removing its cards');
await js("document.activeElement.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true}))");
await wait("!document.querySelector('.song-editor-controls[open]')");
check(await js("!!document.querySelector('.melody-library-deck')&&window.__deckNodes.every((node,index)=>document.querySelectorAll('.melody-library-card')[index]===node)"),'closing details restores the same deck');
for(const size of [[1180,800],[1800,1000]]){
  win.setContentSize(...size);await delay(100);
  check(await js("(()=>{const stacks=[...document.querySelectorAll('.melody-library-deck .melody-card-backs')].filter(n=>n.offsetWidth&&n.offsetHeight);return stacks.length>0&&stacks.every(n=>n.offsetWidth/n.offsetHeight>.6&&n.offsetWidth/n.offsetHeight<1.1&&n.offsetHeight<=126)})()"),'tone-library stacks keep a balanced card shape at '+size.join('x'));
}
await js("document.querySelector('.melody-tone-pile').click()");
await wait("!document.querySelector('.melody-library-deck')");
check(await js("!document.querySelector('.is-deck-moving,.melody-card-flight,.is-card-arriving')&&document.querySelector('.melody-tone-pile').getAttribute('aria-expanded')==='false'"),'gathering removes temporary animation state and restores the pile');
win.setContentSize(1300,900);await delay(100);
stage='save picker and MIDI copy';
const original=fs.readFileSync(path.join(project,'Demo.mid'));
const libraryOpen="!!document.querySelector('.project-library-overlay:not([hidden])')";
const homeOpen=libraryOpen+"&&!document.querySelector('.project-library-copy-form')";
const copyOpen="!!document.querySelector('.project-library-copy-form button:enabled')";
const exitOpen="!!document.querySelector('.song-exit-choice[open]')";
const editorReady="!!document.querySelector('.melody-workspace')&&!document.querySelector('.song-save-project').disabled";
const detailsOpen="!!document.querySelector('.song-editor-controls[open]')";
const selector=(label,scope='button')=>"[...document.querySelectorAll("+JSON.stringify(scope)+")].find(n=>n.textContent.trim()==="+JSON.stringify(label)+")";
const button=label=>"[...document.querySelectorAll('button')].find(n=>n.getAttribute('aria-label')==="+JSON.stringify(label)+")";
const click=async expression=>{await wait('!!('+expression+')');return js('('+expression+').click()');};
async function openHomeLibrary(){
  const entry="document.querySelector('.is-desktop-welcome')";
  await wait('!!'+entry);
  check(!await js(libraryOpen),'returning home shows the welcome page before opening the library');
  await js('(()=>{const page='+entry+";for(const x of [.43,.74,1])page.dispatchEvent(new PointerEvent('pointermove',{pointerType:'mouse',bubbles:true,clientX:(innerWidth-1)*x,clientY:innerHeight/2}))})()");
  await wait(homeOpen);
}
const esc=()=>js("document.activeElement.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true}))");
async function showDetails(){await wait(editorReady);if(!await js(detailsOpen))await esc();await wait(detailsOpen);}
const changeTempo=tempo=>js("(()=>{const n=document.querySelector('.melody-tempo-input');n.value="+tempo+";n.dispatchEvent(new Event('change',{bubbles:true}));})()");
function exitAction(label){return click(selector(label,'.song-exit-choice button'));}
async function fillForm(className,value){
  const target="document.querySelector("+JSON.stringify(className)+")";
  await wait('!!'+target);
  await js("(()=>{const form="+target+";form.querySelector('input').value="+JSON.stringify(value)+";form.requestSubmit()})()");
}
const copyName=async(value,reload=false)=>{const reloaded=reload?new Promise(resolve=>win.webContents.once('did-finish-load',resolve)):undefined;await fillForm('.project-library-copy-form',value);if(reloaded)await reloaded;};
async function renameRow(label,name){
  const entry=button(label);await wait('!!('+entry+')');
  await js('('+entry+").dispatchEvent(new MouseEvent('dblclick',{bubbles:true,cancelable:true}))");
  check(await js("!document.querySelector('.project-library-name')"),'double-click does not begin library rename');
  await js('('+entry+").dispatchEvent(new MouseEvent('contextmenu',{bubbles:true,cancelable:true,clientX:400,clientY:300}))");
  await wait("!document.querySelector('.project-library-context').hidden");
  if(await js(copyOpen))check(await js("[...document.querySelectorAll('.project-library-context button')].map(n=>n.textContent).join(',')==='改名'"),'Save As exposes rename without adding unrelated context actions');
  await click("[...document.querySelectorAll('.project-library-context button')].find(n=>n.textContent==='改名')");
  await wait("!!document.querySelector('.project-library-name')");
  await js("(()=>{const input=document.querySelector('.project-library-name');input.value="+JSON.stringify(name)+";input.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true,cancelable:true}));})()");
  await wait("!document.querySelector('.project-library-name')&&!!document.querySelector('.project-library[aria-busy=false]')");
}
const checkExitActions=async()=>check(await js("[...document.querySelectorAll('.song-exit-choice button')].map(n=>n.textContent).join(',')==='直接退出,另存为,保存'&&!document.querySelector('dialog[open]')"),'dirty exit shows the three inline actions');
await click("document.querySelector('.song-save-project')");await wait(copyOpen);
check(await js("!document.querySelector('.is-library-workspace .project-library-header')"),'Save As has no heading');
check(await js("(()=>{const input=document.querySelector('.project-library-copy-form input'),style=getComputedStyle(input);input.focus();return style.borderTopWidth==='0px'&&style.backgroundColor!=='rgb(255, 255, 255)'&&getComputedStyle(input).boxShadow==='none'})()"),'text fields use a colored strip without a focus frame');
check(await js("document.querySelector('.project-library-copy-form input').value==='Demo'"),'foreign source save opens the directory grid and pre-fills its name');
await js("(()=>{const n=document.querySelector('.project-library-copy-form input');n.value='演示项目 · 新的旋律';n.focus();n.setSelectionRange(9,11);n.dispatchEvent(new Event('select',{bubbles:true}));})()");
await wait("document.querySelector('.project-library-copy-form input').classList.contains('has-gradient-selection')");
check(await js("(()=>{const n=document.querySelector('.project-library-copy-form input'),s=getComputedStyle(n),selection=getComputedStyle(n,'::selection');return s.backgroundImage.includes('90deg')&&s.backgroundImage.includes('112deg')&&s.color==='rgb(64, 50, 68)'&&selection.color==='rgb(255, 249, 242)'&&selection.backgroundColor==='rgba(0, 0, 0, 0)'&&parseFloat(n.style.getPropertyValue('--field-selection-sizes'))>0})()"),'a two-character native selection uses a dark gradient above the light field with light selected glyphs');
await js("document.querySelector('.project-library-copy-form input').dispatchEvent(new CompositionEvent('compositionstart',{bubbles:true}))");
check(await js("!document.querySelector('.project-library-copy-form input').classList.contains('has-gradient-selection')"),'Chinese composition keeps the native selection until composition completes');
await js("document.querySelector('.project-library-copy-form input').dispatchEvent(new CompositionEvent('compositionend',{bubbles:true}))");
await wait("document.querySelector('.project-library-copy-form input').classList.contains('has-gradient-selection')");
await js("(()=>{const n=document.querySelector('.project-library-copy-form input');n.value='Very long name 旋律 '.repeat(20);n.setSelectionRange(n.value.length-3,n.value.length-1);n.scrollLeft=n.scrollWidth;n.dispatchEvent(new Event('select',{bubbles:true}));n.dispatchEvent(new Event('scroll'));})()");
await wait("!!document.querySelector('.project-library-copy-form input').style.getPropertyValue('--field-selection-sizes')");
check(await js("(()=>{const n=document.querySelector('.project-library-copy-form input'),p=n.style.getPropertyValue('--field-selection-positions').split(',')[0].trim().split(' ').map(parseFloat),size=n.style.getPropertyValue('--field-selection-sizes').split(',')[0].trim().split(' ').map(parseFloat);return n.scrollLeft>0&&p[0]>=0&&p[0]+size[0]<=n.clientWidth+.5})()"),'the gradient follows a long name horizontally without painting outside the text field');
await js("(()=>{const n=document.querySelector('.project-library-copy-form input');n.value='演示旋律';n.scrollLeft=0;n.setSelectionRange(0,4);document.execCommand('insertText',false,'声音');})()");
check(await js("document.querySelector('.project-library-copy-form input').value==='声音'"),'native typing replaces selected text without a custom editor');
await js("document.execCommand('undo')");
check(await js("document.querySelector('.project-library-copy-form input').value==='演示旋律'"),'native text undo remains available');
await js("(()=>{const n=document.querySelector('.project-library-copy-form input');n.value='Demo';n.setSelectionRange(0,0);n.dispatchEvent(new Event('select',{bubbles:true}));})()");
await wait("!document.querySelector('.project-library-copy-form input').classList.contains('has-gradient-selection')");
check(await js("!document.querySelector('.song-export-audio')"),'audio export is hidden');
await click(button('新建文件夹'));await fillForm('.project-library-folder-form','Drafts');
await wait('!!('+button('打开文件夹 Drafts')+')');await click(button('打开文件夹 Drafts'));
await wait("document.querySelector('.project-library-navigation [aria-current]').textContent==='Drafts'");
await copyName('Demo',true);await wait(editorReady+'&&!('+libraryOpen+')');
let copied=path.join(project,'Drafts','Demo.rootsound');
check(fs.existsSync(copied)&&fs.readFileSync(path.join(project,'Demo.mid')).equals(original),'native copy keeps original MIDI bytes');
await wait(detailsOpen);
check(await js("document.querySelector('.song-project-unsaved').hidden"),'Save As returns to clean song details');
check(await js("(()=>{const group=document.querySelector('.song-rate-segments').getBoundingClientRect(),buttons=[...document.querySelectorAll('.song-rate-segments button')],boxes=buttons.map(n=>n.getBoundingClientRect());return Math.abs(group.width-126)<.5&&boxes.every(r=>Math.abs(r.width-42)<.5&&r.height===28&&r.y===boxes[0].y)&&boxes[2].right<=group.right+.5&&buttons.every(n=>n.getAttribute('aria-pressed')==='true'?getComputedStyle(n).backgroundImage.includes('linear-gradient'):getComputedStyle(n).backgroundImage==='none'&&getComputedStyle(n).backgroundColor==='rgba(0, 0, 0, 0)')})()"),'the compact rate blocks stay aligned and only the selected speed has a coloured fill');
await js("document.querySelectorAll('.song-rate-choice')[1].click()");
check(await js("(()=>{const selected=document.querySelector('.song-rate-segments [aria-pressed=true]');return selected.textContent==='0.75x'&&document.querySelectorAll('.song-rate-segments [aria-pressed=true]').length===1&&getComputedStyle(selected).backgroundImage!==getComputedStyle(selected.previousElementSibling).backgroundImage})()"),'rate selection changes the gradient without changing the three available speeds');
check(await js("(()=>{const tracks=[...document.querySelectorAll('.song-editor-controls input[type=range]')].map(n=>n.getBoundingClientRect());return tracks.length===3&&tracks.every(r=>Math.abs(r.left-tracks[0].left)<.5&&Math.abs(r.right-tracks[0].right)<.5)})()"),'the volume, grid and pointer sliders remain aligned at both ends');
await js("document.querySelectorAll('.song-rate-choice')[2].click()");

stage='native save directly updates its file and stays in the editor';
await showDetails();
await js("document.querySelector('.song-project-name').dispatchEvent(new MouseEvent('dblclick',{bubbles:true}))");
await wait("!!document.querySelector('.song-project-name-input')");
await js("(()=>{const n=document.querySelector('.song-project-name-input');n.value='New title';n.dispatchEvent(new KeyboardEvent('keydown',{bubbles:true,key:'Enter',cancelable:true}));})()");
await wait("document.querySelector('.song-project-name').textContent==='New title'");
const oldPath=copied;copied=path.join(project,'Drafts','New title.rootsound');
check(fs.existsSync(copied)&&!fs.existsSync(oldPath)&&(await host('project.Read')).current.path===copied,'details rename changes the real file and active path');
await click("document.querySelector('.song-save-project')");await wait(editorReady);
check(!(await js(libraryOpen)),'ordinary Save did not open a chooser');
check(JSON.parse(fs.readFileSync(copied)).name==='New title','Save writes to the renamed file');
check(await js(detailsOpen+"&&document.querySelector('.song-project-unsaved').hidden"),'successful Save stays in details and clears the star');
await click("document.querySelector('.song-save-copy')");await wait(copyOpen);
check(await js("document.querySelector('.project-library-copy-form input').value==='New title'"),'Save As uses the current name');
await click(button('打开文件夹 Drafts'));await wait("document.querySelector('.project-library-navigation [aria-current]').textContent==='Drafts'");
await renameRow('New title','Library title');
const beforeLibraryRename=copied;copied=path.join(project,'Drafts','Library title.rootsound');
check(fs.existsSync(copied)&&!fs.existsSync(beforeLibraryRename)&&(await host('project.Read')).current.path===copied,'right-click rename inside Save As updates the active file path');
await esc();await wait(editorReady+'&&!('+libraryOpen+')&&'+detailsOpen);check(fs.existsSync(copied),'cancel returns to details');
check(await js("document.querySelector('.song-project-name').textContent==='Library title'"),'library rename updates the open song title');

stage='inline exit state and failed save';
await changeTempo(130);await click("document.querySelector('.song-exit')");
await wait("!!document.querySelector('.song-file-actions.is-exit-armed')");
check(await js("!document.querySelector('.song-exit-choice')&&!document.querySelector('.song-project-unsaved').hidden"),'first Exit uses the existing details buttons');
const checkpoint=fs.readFileSync(copied),external=JSON.parse(checkpoint);external.name='External name';fs.writeFileSync(copied,JSON.stringify(external));
await click("document.querySelector('.song-save-project')");await wait(editorReady);
check(await js("!!document.querySelector('.song-file-actions.is-exit-armed')&&!document.querySelector('.song-project-unsaved').hidden"),'a failed save retains the armed exit and unsaved star');
check(JSON.parse(fs.readFileSync(copied)).name==='External name','failed Save preserves the changed disk file');
fs.writeFileSync(copied,checkpoint);
await click("document.querySelector('.song-save-project')");await wait(editorReady);
check(await js("!document.querySelector('.song-file-actions.is-exit-armed')&&document.querySelector('.song-project-unsaved').hidden&&[...document.querySelectorAll('.song-file-actions button')].every(button=>button.getAnimations().length>0)"),'successful Save resets colors, clears the star and flashes all three buttons');

stage='window close actions';
async function closeChoice(){
  check((await js("globalThis.__rootSoundPrepareClose('check')")).canSave,'native close preparation completes');
  await js("(()=>{window.__saveOnClose=globalThis.__rootSoundPrepareClose('save');return true})()");
  await wait(exitOpen);await checkExitActions();
}
await changeTempo(131);const beforeClosing=fs.readFileSync(copied);
await closeChoice();await esc();
check(await js("window.__saveOnClose.then(result=>result.cancelled===true)"),'Escape cancels the native close');
check((await host('project.Read')).hasUnsavedChanges&&fs.readFileSync(copied).equals(beforeClosing),'cancel retains the unsaved working score');
await closeChoice();await exitAction('直接退出');
check(await js("window.__saveOnClose.then(result=>result.discarded===true&&result.saved!==true)"),'discard resolves the native close without writing');
check(fs.readFileSync(copied).equals(beforeClosing),'discard has not overwritten the original');
await closeChoice();await exitAction('保存');
check(await js("window.__saveOnClose.then(result=>result.saved===true&&result.discarded!==true)"),'save resolves the native close after writing');
check(!(await host('project.Read')).hasUnsavedChanges&&!fs.readFileSync(copied).equals(beforeClosing),'window close save writes the original first');
await changeTempo(132);await closeChoice();await exitAction('另存为');await wait(copyOpen);await esc();await wait(exitOpen);
await wait("!!document.querySelector('.song-exit-choice button:enabled')");await esc();
check(await js("window.__saveOnClose.then(result=>result.cancelled===true)"),'cancelling Save As returns to the close actions and then to the editor');
await closeChoice();await exitAction('另存为');await wait(copyOpen);await copyName('Window copy');
check(await js("window.__saveOnClose.then(result=>result.saved===true)"),'save as also resolves the native close');
check(fs.existsSync(path.join(project,'Window copy.rootsound')),'window close save as writes the copy first');

stage='home grid and library edits';
const legacyPath=path.join(project,${JSON.stringify(legacyName)});
fs.copyFileSync(${JSON.stringify(legacyFixture)},legacyPath);
const legacyBytes=fs.readFileSync(legacyPath);
await host('project.Exit',['discard']);
const reloaded=new Promise(resolve=>win.webContents.once('did-finish-load',resolve));win.webContents.reload();await reloaded;
await openHomeLibrary();
await wait(homeOpen+"&&!!document.querySelector('.project-library-song')");
for(let i=0;i<2;i++){
  await js("(()=>{const library=document.querySelector('.is-welcome-library:not([hidden])');for(const x of [.43,.74,1])library.dispatchEvent(new PointerEvent('pointermove',{pointerType:'mouse',bubbles:true,clientX:(innerWidth-1)*x,clientY:innerHeight/2}))})()");
  await wait('!('+libraryOpen+')');
  check(await js("!document.querySelector('.is-desktop-welcome .welcome-actions button')&&document.activeElement===document.querySelector('.is-desktop-welcome')"),'returning through the right edge leaves the welcome page without a library button');
  await openHomeLibrary();
}
check(await js("!document.querySelector('.project-library-copy-form, .project-exit-actions')"),'the welcome library shows no editor actions');
check(await js("document.querySelector('.project-library-list .project-library-song').getBoundingClientRect().height===40"),'library renders fixed-height song rows at desktop size');
await click(button('新建文件夹'));await fillForm('.project-library-folder-form','Temporary');
async function rightClick(label){
  const entry=button(label);await wait('!!('+entry+')');
  await js('('+entry+").dispatchEvent(new MouseEvent('contextmenu',{bubbles:true,cancelable:true,button:2,clientX:400,clientY:300}))");
}
await rightClick('打开文件夹 Temporary');
check(await js("!document.querySelector('.project-library-context').hidden&&[...document.querySelectorAll('.project-library-context button')].map(n=>n.textContent).join(',')==='改名,删除'"),'folder has rename and delete in its right-click menu');
await esc();check(await js("document.querySelector('.project-library-context').hidden"),'Escape only closes the context menu');
await renameRow('打开文件夹 Temporary','Renamed');
check(fs.existsSync(path.join(project,'Renamed'))&&!fs.existsSync(path.join(project,'Temporary')),'folder right-click rename changes the real directory');
await rightClick('打开文件夹 Renamed');await click(button('删除 Renamed'));
await click("document.querySelector('.project-delete-actions button:last-child')");await wait("document.querySelector('.project-delete-overlay').hidden");
check(!fs.existsSync(path.join(project,'Renamed')),'library removed the renamed folder');

stage='clean and dirty returns to the home grid';
async function reopenLegacy(){
  const tile=button('幻想即兴曲 Op.66');
  await wait('!!('+tile+')');await click(tile);await wait(editorReady);
}
await reopenLegacy();
const originalTempo=await js("document.querySelector('.melody-tempo-input').value");
check(!(await host('project.Read')).hasUnsavedChanges,'automatic demo timbre initialization is clean');
await showDetails();
await click("document.querySelector('.song-exit')");await openHomeLibrary();
await reopenLegacy();await changeTempo(137);await showDetails();
await js("(()=>{const exit=document.querySelector('.song-exit');exit.click();exit.click()})()");await openHomeLibrary();
check(fs.readFileSync(legacyPath).equals(legacyBytes),'discard preserves the original song byte for byte');
await reopenLegacy();check(await js("document.querySelector('.melody-tempo-input').value")===originalTempo,'reopen restores saved tempo');
await changeTempo(138);await showDetails();await click("document.querySelector('.song-exit')");
await wait("!!document.querySelector('.song-file-actions.is-exit-armed')");await click("document.querySelector('.song-save-project')");await wait(editorReady);
check((await host('project.Read')).current&&!fs.readFileSync(legacyPath).equals(legacyBytes)&&await js(detailsOpen),'Save writes and remains in song details');
await click("document.querySelector('.song-exit')");await openHomeLibrary();
await reopenLegacy();await changeTempo(139);await showDetails();await click("document.querySelector('.song-exit')");
await wait("!!document.querySelector('.song-file-actions.is-exit-armed')");await click("document.querySelector('.song-save-copy')");await wait(copyOpen);
await copyName('幻想即兴曲 Op.66',true);await wait(editorReady+'&&'+detailsOpen);
check(fs.existsSync(path.join(project,'幻想即兴曲 Op.66 1.rootsound'))&&!(await host('project.Read')).hasUnsavedChanges,'same-directory Save As writes a numbered copy and restores clean details');
await click("document.querySelector('.song-exit')");await openHomeLibrary();

stage='new project first save';
await wait('!!('+button('打开文件夹 Drafts')+')');await click(button('打开文件夹 Drafts'));
await wait("document.querySelector('.project-library-navigation [aria-current]').textContent==='Drafts'");
await click(button('新建项目'));await wait(editorReady);
check((await host('project.Read')).current.pendingSave&&!fs.existsSync(path.join(project,'Drafts','新建项目.rootsound')),'New creates an unsaved editing session');
await changeTempo(142);
await click("document.querySelector('.melody-tone-shortcut')");
await click("document.querySelector('.melody-tone-pile')");
await wait("!!document.querySelector('.melody-library-tone')");
await click("document.querySelector('.melody-library-tone')");
await wait("!!document.querySelector('.melody-tone-hand .melody-note-family')");
await click("document.querySelector('.melody-tone-hand .melody-note-family')");
await js("(()=>{const canvas=document.querySelector('.melody-canvas'), bounds=canvas.getBoundingClientRect();canvas.dispatchEvent(new WheelEvent('wheel',{bubbles:true,cancelable:true,clientX:bounds.left+bounds.width*.36,clientY:bounds.top+94,deltaY:100}));return document.querySelector('.song-save-project').click()})()");
await wait(copyOpen);
check(await js("document.querySelector('.project-library-navigation [aria-current]').textContent==='Drafts'&&document.querySelector('.project-library-copy-form input').value==='新建项目'"),'first save opens the starting folder with the default song name');
const firstSaveReload=new Promise(resolve=>win.webContents.once('did-finish-load',resolve));
await copyName('新建项目');await firstSaveReload;await wait(editorReady+'&&!('+libraryOpen+')&&'+detailsOpen);
check(fs.existsSync(path.join(project,'Drafts','新建项目.rootsound'))&&!(await host('project.Read')).hasUnsavedChanges,'first save creates the chosen native file');
check(await js("document.querySelector('.melody-tempo-input').value==='142'"),'first save includes the last edit');
check(await js("document.querySelectorAll('.melody-note').length===1"),'saving immediately after the wheel preserves the new note');
stage='native tone name migration';
await host('project.OpenKnown',[path.join(project,'TimbreNames.rootsound')]);await win.loadURL('https://rootsound.local/index.html');await wait(editorReady);
check(await js("[...document.querySelectorAll('.melody-note-family .melody-card-name')].some(n=>n.textContent==='三角钢琴')"),'old native GM default names become actual curated names in the production editor');
check(!(await host('project.Read')).hasUnsavedChanges,'name migration starts with a clean working session');
await showDetails();await click("document.querySelector('.song-save-project')");await delay(350);
const renamedFile=JSON.parse(fs.readFileSync(path.join(project,'TimbreNames.rootsound'),'utf8'));
check(JSON.parse(renamedFile.libraryText).contents.filter(item=>item.kind==='rootsound.timbre').every(item=>item.name!=='大钢琴'),'native Save persists the normalized names');
stage='large hand fan';
await open('Many.mid');await win.loadURL('https://rootsound.local/index.html');await wait(editorReady);
await click("document.querySelector('.melody-tone-shortcut')");
check(await js("document.querySelector('.melody-tone-hand').children.length===48"),'48 imported source voices remain independent cards');
check(await js("[...document.querySelectorAll('.melody-tone-hand .melody-card-name')].every(n=>!/[0-9]/.test(n.textContent))"),'shared curated names have no numeric suffixes');
await js("(()=>{const h=document.querySelector('.melody-tone-hand');h.classList.add('is-revealed');return getComputedStyle(h.firstElementChild).transform})()");await delay(250);
fs.writeFileSync(path.join(root,'hand-start.png'),(await win.webContents.capturePage()).toPNG());
const handBefore=JSON.stringify(await host('storage.Read'));
await js("(()=>{window.__handNodes=[...document.querySelector('.melody-tone-hand').children];const hand=document.querySelector('.melody-tone-hand'),b=hand.getBoundingClientRect();hand.dispatchEvent(new WheelEvent('wheel',{bubbles:true,cancelable:true,clientX:b.left+b.width/2,clientY:b.bottom-45,deltaY:100}));})()");
await wait("Number(document.querySelector('.melody-tone-hand').dataset.handStart)>0");
check(JSON.stringify(await host('storage.Read'))===handBefore,'hand wheel input does not edit notes or music data');
check(await js("window.__handNodes.every((node,index)=>document.querySelector('.melody-tone-hand').children[index]===node)"),'hand wheel input reuses existing cards');
await js("(()=>{const hand=document.querySelector('.melody-tone-hand'),b=hand.getBoundingClientRect();for(let i=0;i<40;i++)hand.dispatchEvent(new WheelEvent('wheel',{bubbles:true,cancelable:true,clientX:b.left+b.width/2,clientY:b.bottom-45,deltaY:200}));})()");
await wait("(()=>{const h=document.querySelector('.melody-tone-hand');return Number(h.dataset.handStart)===48-Number(h.dataset.handSlots)})()");
await js("getComputedStyle(document.querySelector('.melody-tone-hand').firstElementChild).transform");await delay(270);
check(await js("(()=>{const h=document.querySelector('.melody-tone-hand');return Number(h.dataset.handStart)===48-Number(h.dataset.handSlots)&&!h.lastElementChild.inert&&h.firstElementChild.inert&&!h.querySelector('.melody-card-backs')})()"),'fan reaches the final cards, disables hidden cards and has no side piles');
check(await js("(()=>{const h=document.querySelector('.melody-tone-hand'),last=h.lastElementChild;return getComputedStyle(h.firstElementChild).opacity==='0'&&getComputedStyle(last).opacity==='1'&&last.querySelector('.melody-card-name').textContent==='独奏小提琴'&&last.getBoundingClientRect().top<h.getBoundingClientRect().bottom})()"),'the final violin card is visibly above the keyboard while the first card is hidden');
fs.writeFileSync(path.join(root,'hand-end.png'),(await win.webContents.capturePage()).toPNG());
await click("document.querySelector('.melody-tone-pile')");await wait("!!document.querySelector('.melody-library-tone')");
await click("document.querySelector('.melody-library-tone')");
await wait("document.querySelector('.melody-tone-hand').children.length===49");
check(await js("document.querySelector('.melody-library-tone').getAttribute('aria-disabled')==='false'"),'manual card addition stays available above ten');
check((await js('__errors')).length===0,'no renderer errors');check(!win.isVisible(),'window stayed hidden');
fs.writeFileSync(path.join(root,'report.json'),JSON.stringify({passed:true,checks,desktopControl:false,physicalAudio:false,visibleWindow:false},null,2));win.destroy();processHost.stdin.end();await new Promise(resolve=>processHost.once('exit',resolve));lines.close();app.exit(0);
}catch(error){const page=win?await js("({text:document.body.innerText.slice(-1600),errors:window.__errors})").catch(()=>null):null;fs.writeFileSync(path.join(root,'report.json'),JSON.stringify({passed:false,error:String(error),stack:error?.stack,stage,page},null,2));processHost?.kill();win?.destroy();app.exit(1);}})();
`;
await fs.writeFile(path.join(root,'qa.cjs'),code);
const env={...process.env};delete env.ELECTRON_RUN_AS_NODE;
const child=spawn(path.resolve(process.argv[2]??'.cache/release-smoke-engine/electron.exe'),[path.join(root,'qa.cjs')],{env,windowsHide:true,stdio:['ignore','pipe','pipe']});
let output='';child.stderr.on('data',data=>output=(output+data).slice(-3000));child.stdout.on('data',data=>output=(output+data).slice(-3000));
const exit=await new Promise(resolve=>child.once('exit',resolve));console.log(await fs.readFile(path.join(root,'report.json'),'utf8').catch(()=>output));console.log('Evidence: '+root);if(exit)process.exitCode=1;
