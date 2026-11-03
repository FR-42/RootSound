import { readFile, writeFile, mkdir, mkdtemp } from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { createInitialProjectLibrary } from '../src/workstation/app/project-setup.ts';
import { createMaterialLibrary } from '../src/workstation/modules/materials/public.ts';
import { createPhraseEditor, createPhrasePlayback } from '../src/workstation/modules/phrase/public.ts';
import { createSongEditor } from '../src/workstation/modules/song/public.ts';
import { createTimbrePlayback } from '../src/workstation/modules/timbre/public.ts';
import { openMusicDocument, commitMusicDocument } from '../src/workstation/app/music-document.ts';

// Isolated fixture and permanently hidden renderer. No user projects, screen
// capture, mouse automation, sound playback or release archive mutation.
const batch = process.argv[2] ?? 'rb123';
await mkdir(path.join('.test-output', batch), { recursive: true });
const directory = await mkdtemp(path.resolve('.test-output', batch, 'ui-'));
const packagePlan = JSON.parse(await readFile('.cache/release-package-plan.json', 'utf8'));
let text = createInitialProjectLibrary('浅色工作区检查');
const library = createMaterialLibrary({ read: () => text, write: value => { text = value; } });
const tones = createTimbrePlayback(library), score = createPhraseEditor(library, tones);
const song = createSongEditor(library, createPhrasePlayback(library, tones), { defaultTempoMode: 'source' });
openMusicDocument(library, song, score);
const part = score.addPart(library.listContentInfo().find(item => item.kind === 'rootsound.timbre').id);
score.setLength(64);
score.addNote(part, { startBeat: 0, durationBeats: .5, durationSeconds: .25, frequencyHz: 440, velocity: .6 });
score.addNote(part, { startBeat: 20, durationBeats: .5, durationSeconds: .25, frequencyHz: 440, velocity: .6 });
commitMusicDocument(library, song, score);
await writeFile(path.join(directory, 'input.json'), text);
const harness = path.join(directory, 'harness.cjs');
await writeFile(harness, `
const {app,BrowserWindow,dialog}=require('electron');
const fs=require('node:fs'),path=require('node:path'),Module=require('node:module'),assert=require('node:assert/strict');
const root=${JSON.stringify(directory)}, main=${JSON.stringify(path.join(packagePlan.windows, 'resources/app/main.cjs'))};
const report=path.join(root,'report.json');app.setPath('userData',path.join(root,'profile'));
app.commandLine.appendSwitch('disable-gpu');
dialog.showErrorBox=(_title,message)=>{fs.writeFileSync(report,JSON.stringify({error:message}));app.exit(1);};
dialog.showMessageBox=async()=>({response:2});
let source=fs.readFileSync(${JSON.stringify(path.resolve('desktop/electron/main.cjs'))},'utf8')
 .replace('path.dirname(process.execPath)',JSON.stringify(path.join(root,'data')))
 .replace("await seedBundledProjects(path.join(base, 'seed-projects'), dataDirectory);",'// No bundled or user music in this fixture.')
 .replace("path.resolve(base, 'ui')",JSON.stringify(${JSON.stringify(path.resolve('dist'))}))
 .replace("path.join(base, 'host', 'RootSound.Host.dll')",JSON.stringify(${JSON.stringify(path.resolve('.cache/release-host/RootSound.Host.dll'))}))
 .replace('webSecurity: true','webSecurity: true, backgroundThrottling: false')
 .replace("window.once('ready-to-show', () => window.show());",'// The window remains hidden.');
const loaded=new Module(main,module);loaded.filename=main;loaded.paths=Module._nodeModulePaths(path.dirname(main));loaded._compile(source,main);
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function waitFor(check){for(let i=0;i<300;i++){if(await check())return;await delay(30);}throw new Error('Timed out waiting for fixture renderer');}
async function run(){try{
 await app.whenReady();await waitFor(()=>BrowserWindow.getAllWindows().length);
 const window=BrowserWindow.getAllWindows()[0];assert(!window.isVisible());
 const js=code=>window.webContents.executeJavaScript('(async()=>('+code+'))()');
 await waitFor(async()=>await js("!!document.querySelector('.welcome')").catch(()=>false));
 const welcome=await js("getComputedStyle(document.querySelector('.welcome')).backgroundColor");assert.equal(welcome,'rgb(250, 251, 253)');
 const state=await js("JSON.parse(await rootSoundDesktop.projectDirectories.Read())");
 const payload=fs.readFileSync(path.join(root,'input.json'),'utf8');
 const created=await js('JSON.parse(await rootSoundDesktop.projectDirectories.Create('+JSON.stringify('浅色工作区检查')+','+JSON.stringify(state.defaultLocation)+','+JSON.stringify(payload)+'))');
 assert.equal(created.status,'created');const stored=fs.readFileSync(created.project.path,'utf8');
 await js("rootSoundDesktop.projectDirectories.Exit('discard','')");
 const externalName='文件名优先检查',externalPath=path.join(path.dirname(created.project.path),externalName+'.rootsound');
 fs.renameSync(created.project.path,externalPath);created.project.path=externalPath;
 await js('rootSoundDesktop.projectDirectories.OpenKnown('+JSON.stringify(externalPath)+')');
 const start=Date.now(),reloaded=new Promise(resolve=>window.webContents.once('did-finish-load',resolve));window.webContents.reload();await reloaded;
 await waitFor(async()=>await js("!!document.querySelector('.melody-workspace.is-vertical') && !document.querySelector('.song-play').disabled").catch(()=>false));
 await js("(()=>{window.layoutErrors=[];window.addEventListener('error',event=>window.layoutErrors.push(event.message))})()");
 const openingMilliseconds=Date.now()-start;
 assert.equal(await js("document.querySelector('.song-project-name').textContent"),externalName);
 const layout=await js(\`(()=>{const q=s=>document.querySelector(s),rect=s=>{const r=q(s).getBoundingClientRect();return {left:r.left,top:r.top,right:r.right,bottom:r.bottom,width:r.width,height:r.height};};return {background:getComputedStyle(q('.melody-workspace')).backgroundColor,shelf:rect('.melody-shelf'),roll:rect('.melody-roll'),scroll:rect('.melody-scroll'),direction:getComputedStyle(q('.melody-shelf')).flexDirection,notes:document.querySelectorAll('.melody-note').length,oldOverviewNotes:document.querySelectorAll('.phrase-overview-note').length,error:q('.startup-error')?.textContent};})()\`);
 assert(!layout.error);assert.equal(layout.background,'rgb(250, 251, 253)');assert.equal(layout.direction,'column');
 assert(layout.shelf.right<=layout.roll.left+1);assert(layout.shelf.height>500);assert(layout.roll.width>900);assert(layout.scroll.height>500);
 assert.equal(layout.notes,1,'offscreen note remains virtualized');
 const topbarCentering=await js(\`(()=>{const bar=document.querySelector('.song-topbar'),title=document.querySelector('.song-project-name'),old=title.textContent,read=()=>{const b=bar.getBoundingClientRect(),t=bar.querySelector('.song-transport').getBoundingClientRect(),l=bar.querySelector('.phrase-composition-identity').getBoundingClientRect(),r=bar.querySelector('.song-file-actions').getBoundingClientRect();return {width:b.width,centerError:Math.abs((t.left+t.right-b.left-b.right)/2),leftClear:l.right<=t.left,rightClear:r.left>=t.right};};const samples=[read()];bar.style.width='700px';title.textContent='一个很长的项目名字'.repeat(12);samples.push(read());bar.style.width='';title.textContent=old;return samples;})()\`);
 assert(topbarCentering.every(s=>s.centerError<1&&s.leftClear&&s.rightClear),JSON.stringify(topbarCentering));
 assert.equal(await js("!!document.querySelector('.song-topbar .song-volume-panel')"),false);
 await js("document.querySelector('.melody-scroll').dispatchEvent(new WheelEvent('wheel',{bubbles:true,cancelable:true,deltaY:1500,clientX:300,clientY:200}))");
 await delay(60);
 const locator=await js(\`(()=>{const q=document.querySelector('.melody-quick-scroll'),t=q.querySelector('.melody-quick-thumb'),r=q.getBoundingClientRect(),roll=document.querySelector('.melody-roll').getBoundingClientRect();return {visible:!q.hidden,width:r.width,height:r.height,right:r.right,rollRight:roll.right,thumbHeight:t.getBoundingClientRect().height};})()\`);
 assert(locator.visible);assert.equal(locator.width,10);assert(locator.height>500);assert(locator.right<=locator.rollRight);assert(locator.thumbHeight>=28);
 assert.equal(await js("document.querySelector('.melody-quick-hint').textContent"),'');
 assert.equal(await js("getComputedStyle(document.querySelector('.melody-scroll')).scrollbarWidth"),'none');
 await js("document.querySelector('.melody-quick-thumb').dispatchEvent(new KeyboardEvent('keydown',{bubbles:true,cancelable:true,key:'Home'}))");
 await delay(40);
 assert.equal(await js("document.querySelector('.melody-quick-thumb').getAttribute('aria-valuenow')"),'0');
 await waitFor(async()=>await js("document.querySelector('.melody-quick-scroll').hidden"));
 await js("document.querySelector('.melody-add-note-family').click()");
 const libraryColor=await js("getComputedStyle(document.querySelector('.melody-tone-library')).backgroundColor");assert.equal(libraryColor,'rgb(255, 255, 255)');
 const gmLibrary=await js("({count:document.querySelectorAll('.melody-library-card').length,gm:[...document.querySelectorAll('.melody-library-card')].map(card=>card.title.match(/GM ([0-9]+)$/)?.[1]).filter(Boolean).map(Number)})");
 assert.equal(gmLibrary.count,175);assert.deepEqual(gmLibrary.gm,Array.from({length:128},(_,i)=>i+1));
 await js("document.querySelector('.melody-library-close').click()");
 // Dialog close events may wait for a rendering task in a never-shown window.
 await js("document.querySelector('.melody-tone-library')?.dispatchEvent(new Event('close'))");
 const emptySettingsRemoved=await js("!document.querySelector('.song-settings') && !document.querySelector('.workspace-settings-dialog')");assert(emptySettingsRemoved);
 assert.equal(await js("!!document.querySelector('.song-topbar .song-rate-options')"),false);
 const bpmDock=await js(\`(()=>{const r=s=>document.querySelector(s).getBoundingClientRect(),dock=r('.melody-tempo-dock'),scroll=r('.melody-scroll');return {left:dock.left,right:dock.right,top:dock.top,height:dock.height,scrollLeft:scroll.left,scrollTop:scroll.top,topbarBpm:!!document.querySelector('.song-topbar .song-tempo-panel')};})()\`);
 assert(!bpmDock.topbarBpm);assert.equal(bpmDock.right,bpmDock.scrollLeft);assert.equal(bpmDock.top,bpmDock.scrollTop);assert.equal(bpmDock.height,48);
 assert.equal(await js("!!document.querySelector('.song-topbar .phrase-grid-button')"),false);
 const gridControl=await js(\`(()=>{const r=document.querySelector('.melody-grid-select').getBoundingClientRect(),d=document.querySelector('.melody-tempo-dock').getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,dockLeft:d.left,dockRight:d.right,dockTop:d.top,dockBottom:d.bottom}})()\`);
 assert(gridControl.left>=gridControl.dockLeft&&gridControl.right<=gridControl.dockRight&&gridControl.top>=gridControl.dockTop&&gridControl.bottom<=gridControl.dockBottom);
 assert.equal(await js("!!document.querySelector('.melody-add-tempo-roll')"),false);
 await js("document.querySelector('.melody-tempo-button').click()");
 const compact=await js(\`(()=>{const q=s=>document.querySelector(s),r=s=>{const b=q(s).getBoundingClientRect();return {left:b.left,right:b.right,top:b.top,bottom:b.bottom,width:b.width};};return {number:r('.melody-tempo-button'),input:r('.melody-tempo-input'),tap:r('.melody-tempo-panel .melody-tap-tempo'),dock:r('.melody-tempo-dock'),dockTap:!!q('.melody-tempo-dock .melody-tap-tempo'),panelGrid:!!q('.melody-tempo-panel select'),grid:r('.melody-grid-select'),bpmSuffix:getComputedStyle(q('.melody-tempo-button'),'::after').content,gridAppearance:getComputedStyle(q('.melody-grid-select')).appearance}})()\`);
 assert(!compact.dockTap);assert(!compact.panelGrid);assert.equal(compact.dock.width,46);assert.equal(compact.number.width,36);assert.equal(compact.input.width,54);assert(compact.tap.left>=compact.input.right);assert(compact.grid.top>=compact.number.bottom);assert.equal(compact.bpmSuffix,'none');assert.equal(compact.gridAppearance,'none');
 await js("document.querySelector('.melody-tempo-button').click()");
 await js("document.querySelector('.melody-extend').click()");await delay(50);
 await js("(()=>{document.querySelector('.melody-tempo-button').click();const input=document.querySelector('.melody-tempo-input');input.value='60';input.dispatchEvent(new Event('change',{bubbles:true}))})()");
 assert.equal(await js("document.querySelector('.melody-tempo-button').textContent"),'60');
 await js("(()=>{document.querySelector('.melody-tempo-button').click();document.querySelector('.melody-scroll').dispatchEvent(new WheelEvent('wheel',{bubbles:true,cancelable:true,deltaY:-150,clientX:300,clientY:200}))})()");await delay(50);
 // A never-shown window may suspend native RAF entirely. Opening the BPM menu
 // synchronously paints its geometry; queued-frame behavior has separate tests.
 await js("(()=>{const b=document.querySelector('.melody-tempo-button');b.click();b.click()})()");
 const bpmRolls=await js(\`Array.from(document.querySelectorAll('.melody-bpm-roll')).map(node=>{const r=node.getBoundingClientRect();return {bpm:node.dataset.tempoBpm,top:r.top,bottom:r.bottom}})\`);
 assert.equal(bpmRolls.length,2);assert.equal(bpmRolls[0].bpm,'120');assert.equal(bpmRolls[1].bpm,'60');assert(bpmRolls[0].bottom>bpmRolls[0].top);assert(Math.abs(bpmRolls[0].bottom-bpmRolls[1].top)<1);
 const headLane=await js(\`(()=>{const handle=document.querySelector('.melody-head-handle'),head=getComputedStyle(handle),marker=Array.from(document.querySelectorAll('.melody-tempo-block')).find(node=>!node.hidden),style=getComputedStyle(marker),rect=marker.getBoundingClientRect(),n=marker.querySelector('.melody-tempo-marker').getBoundingClientRect(),grid=marker.querySelector('.melody-tempo-grid');return {headLeft:parseFloat(head.left),headRight:parseFloat(head.left)+parseFloat(head.width),markerLeft:parseFloat(style.left),markerRight:parseFloat(style.left)+parseFloat(style.width),textRight:n.right-rect.left,divider:getComputedStyle(document.querySelector('.melody-ruler'),'::before').content,headZ:Number(head.zIndex),markerZ:Number(style.zIndex),gridAppearance:getComputedStyle(grid).appearance}})()\`);
 assert.equal(headLane.markerLeft,0);assert.equal(headLane.headRight,headLane.markerRight);assert(headLane.headLeft>=headLane.textRight);assert.equal(headLane.divider,'none');assert(headLane.headZ>headLane.markerZ);assert.equal(headLane.gridAppearance,'none');
 await js("(()=>{const g=Array.from(document.querySelectorAll('.melody-tempo-block')).find(n=>!n.hidden).querySelector('.melody-tempo-grid');g.value='3';g.dispatchEvent(new Event('change',{bubbles:true}))})()");
 assert.equal(await js("document.querySelector('.melody-tempo-dock .melody-grid-select').value"),'4');
 await js("document.querySelector('.melody-scroll').dispatchEvent(new WheelEvent('wheel',{bubbles:true,cancelable:true,deltaY:100000,clientX:300,clientY:200}))");await delay(50);
 await js("(()=>{const b=document.querySelector('.melody-tempo-button');b.click();b.click()})()");
 const endPlus=await js(\`(()=>{const node=document.querySelector('.melody-extend'),r=node.getBoundingClientRect(),roll=document.querySelector('.melody-roll').getBoundingClientRect(),thumb=document.querySelector('.melody-quick-thumb');return {visible:!node.hidden,width:r.width,height:r.height,right:r.right,bottom:r.bottom,rollRight:roll.right,rollBottom:roll.bottom,position:thumb.getAttribute('aria-valuenow'),maximum:thumb.getAttribute('aria-valuemax')}})()\`);
 assert(endPlus.visible,JSON.stringify(endPlus));assert(endPlus.width>900);assert.equal(endPlus.height,32);assert(Math.abs(endPlus.right-endPlus.rollRight)<1);assert(Math.abs(endPlus.bottom-endPlus.rollBottom)<1);
 const endEdge=await js(\`(()=>{const e=document.querySelector('.melody-roll-end'),r=e.getBoundingClientRect(),c=document.querySelector('.melody-canvas').getBoundingClientRect();return {visible:!e.hidden,top:r.top,bottom:r.bottom,canvasTop:c.top,canvasBottom:c.bottom}})()\`);
 assert(endEdge.visible);assert(endEdge.top>endEdge.canvasTop&&endEdge.bottom<endEdge.canvasBottom-20,'overscroll leaves room beneath the last edge');
 assert.equal(await js("document.querySelector('.melody-extend').getAttribute('aria-label')"),'新增钢琴卷帘');
 assert.equal(fs.readFileSync(created.project.path,'utf8'),stored,'opening and UI-only changes cannot save music');
 assert(!window.isVisible());fs.writeFileSync(report,JSON.stringify({passed:true,currentDist:true,openingMilliseconds,layout,topbarCentering,bpmDock,compact,gridControl,bpmRolls,footerPlus:endPlus,endEdge,headLane,locator,locatorAutoHidden:true,welcome,libraryColor,gmLibrary,emptySettingsRemoved,manualSavePreserved:true,visibleWindow:false,screenCaptured:false,audioDeviceOpened:false},null,2));
 window.destroy();app.exit(0);
}catch(error){fs.writeFileSync(report,JSON.stringify({error:error.stack}));app.exit(1);}}
void run();
`);
const env = { ...process.env }; delete env.ELECTRON_RUN_AS_NODE;
const result = await new Promise(resolve => {
  const child = spawn(path.resolve('.cache/release-smoke-engine/electron.exe'), [harness], { env, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
  let output = ''; child.stdout.on('data', bytes => { output = (output + bytes).slice(-5000); }); child.stderr.on('data', bytes => { output = (output + bytes).slice(-5000); });
  child.on('error', error => resolve({ code: 1, output: String(error) })); child.on('exit', code => resolve({ code, output }));
});
console.log(await readFile(path.join(directory, 'report.json'), 'utf8').catch(() => result.output));
if (result.code !== 0) { console.error(JSON.stringify(result)); process.exitCode = 1; }
