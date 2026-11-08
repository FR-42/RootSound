// Production build served under its actual Pages subpath, hidden fixture only.
// AudioContext is replaced before app scripts with an offline clock. No desktop
// capture, OS input, file pickers, user projects, downloads or physical audio.
import {readFile,writeFile,mkdir,mkdtemp} from 'node:fs/promises';
import {spawn,spawnSync} from 'node:child_process';
import http from 'node:http';
import path from 'node:path';

await mkdir('.test-output/rb130',{recursive:true});
const root=await mkdtemp(path.resolve('.test-output/rb130/ui-'));
const requests=[];
const offline=`
localStorage.setItem('rootsound.learning.v1',JSON.stringify({version:1,multipleTempoRolls:true,guides:{basics:{status:'skipped',step:0},'tempo-rolls':{status:'skipped',step:0}}}));
window.__webTest={audioCreated:0,now:0,downloads:[],blobs:new Map(),errors:[]};
window.addEventListener('error',e=>__webTest.errors.push(e.message));
window.addEventListener('unhandledrejection',e=>__webTest.errors.push(String(e.reason)));
Object.defineProperty(window,'AudioContext',{configurable:true,value:class{
 constructor(){__webTest.audioCreated++;const clock=new OfflineAudioContext(2,44100,44100);
 Object.defineProperties(clock,{state:{get:()=> 'running'},currentTime:{get:()=>__webTest.now},close:{value:async()=>{}}});return clock;}
}});
const nativeObjectURL=URL.createObjectURL.bind(URL);URL.createObjectURL=blob=>{const url=nativeObjectURL(blob);__webTest.blobs.set(url,blob);return url};
const click=HTMLAnchorElement.prototype.click;HTMLAnchorElement.prototype.click=function(){if(this.download){__webTest.downloads.push({name:this.download,blob:__webTest.blobs.get(this.href)});return;}return click.call(this)};
Element.prototype.setPointerCapture=function(){};
`;
const types={'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.wav':'audio/wav','.sf2':'application/octet-stream','.txt':'text/plain','.jpg':'image/jpeg','.gif':'image/gif','.webp':'image/webp','.mp4':'video/mp4','.vtt':'text/vtt'};
const server=http.createServer(async(req,res)=>{try{
  const url=new URL(req.url,'http://localhost');requests.push(url.pathname);
  if(!url.pathname.startsWith('/RootSound/')){res.writeHead(404);res.end();return;}
  let relative=decodeURIComponent(url.pathname.slice('/RootSound/'.length));if(!relative||relative.endsWith('/'))relative+='index.html';
  const file=path.resolve('.cache/website',relative);if(!file.startsWith(path.resolve('.cache/website')+path.sep)){res.writeHead(403);res.end();return;}
  let bytes=await readFile(file);if(relative==='play/index.html')bytes=Buffer.from(bytes.toString().replace('<head>','<head><script>'+offline+'</script>'));
  res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');res.end(bytes);
}catch{res.writeHead(404);res.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const origin='http://127.0.0.1:'+server.address().port;
const harness=path.join(root,'qa.cjs');
await writeFile(harness,`
const {app,BrowserWindow,session}=require('electron'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=${JSON.stringify(root)},origin=${JSON.stringify(origin)};app.setPath('userData',path.join(root,'profile'));app.commandLine.appendSwitch('disable-gpu');app.commandLine.appendSwitch('force-device-scale-factor','1');
const delay=ms=>new Promise(r=>setTimeout(r,ms));async function wait(check){for(let i=0;i<500;i++){if(await check())return;await delay(30)}throw Error('Timed out waiting for web fixture')}
let expression='starting',stage='setup';
(async()=>{try{
 await app.whenReady();session.defaultSession.webRequest.onBeforeRequest({urls:['https://*/*']},(_d,cb)=>cb({cancel:true}));
 const win=new BrowserWindow({show:false,width:1280,height:950,webPreferences:{contextIsolation:true,sandbox:true,backgroundThrottling:false}});
 let rendererErrors=[];win.webContents.on('console-message',(_e,level,message)=>{if(level>=3&&!message.includes('ERR_BLOCKED_BY_CLIENT'))rendererErrors.push(message)});
 await win.loadURL(origin+'/RootSound/');
 await wait(()=>win.webContents.mainFrame.frames.some(f=>f.url.includes('/play/')));
 const frame=win.webContents.mainFrame.frames.find(f=>f.url.includes('/play/'));
 const parentJs=code=>win.webContents.executeJavaScript('(async()=>('+code+'))()');
 const js=code=>{expression=code;return frame.executeJavaScript('(async()=>('+code+'))()');};
 await wait(()=>js("!!document.querySelector('.melody-workspace')").catch(()=>false));
 assert.equal(await js("'__tutorial' in globalThis"),false,'tutorial fixture API must not ship in the public editor');
 await wait(()=>js("document.querySelectorAll('.melody-note').length===40"));
 assert.equal(await js("document.querySelector('.melody-tempo-button').textContent"),'148');
 assert.equal(await js("(()=>{const r=document.querySelector('.melody-scroll').getBoundingClientRect();return [...document.querySelectorAll('.melody-note')].every(n=>{const a=n.getBoundingClientRect();return a.x>=r.x-1&&a.right<=r.right+1&&a.y>=r.y-1&&a.bottom<=r.bottom+1})})()"),true,'the complete starter must be visible');
 await parentJs("document.querySelector('.music-editor').scrollIntoView()");await delay(100);fs.writeFileSync(root+'/starter-desktop.png',(await win.webContents.capturePage()).toPNG());
 await js("document.querySelector('.web-export').click()");await wait(()=>js("__webTest.downloads.some(d=>d.name.endsWith('.wav'))"));
 const starterPeak=await js("(async()=>{const item=__webTest.downloads.find(d=>d.name.endsWith('.wav')),bytes=new Uint8Array(await item.blob.arrayBuffer());let peak=0;for(let i=44;i<bytes.length-2;i+=3){let n=bytes[i]|bytes[i+1]<<8|bytes[i+2]<<16;if(n&0x800000)n-=0x1000000;peak=Math.max(peak,Math.abs(n)/8388608)}return peak})()");
 assert(starterPeak>.08&&starterPeak<1,'SF2 score must retain audible natural level: '+starterPeak);
 await wait(()=>js("!document.querySelector('.web-export').disabled"));await js('__webTest.downloads=[]');
 await js("document.querySelector('.web-new').click()");await wait(()=>js("document.querySelectorAll('.melody-note').length===0"));
 await js("location.reload()");await wait(()=>js("document.querySelectorAll('.melody-note').length===40").catch(()=>false));
 await js("document.querySelector('.web-new').click()");await wait(()=>js("document.querySelectorAll('.melody-note').length===0"));
 assert.equal(await parentJs("document.querySelectorAll('.music-editor').length"),1);
 assert.equal(await parentJs("document.querySelectorAll('#guide, video').length"),0);
 assert.equal(await parentJs("document.querySelector('[data-platform=windows]').href.endsWith('-Setup.exe')"),true);
 assert.equal(await parentJs("document.querySelector('[data-platform=mac]').href.endsWith('.pkg')"),true);
 assert.equal(await parentJs("document.querySelector('.site-thanks').textContent"),'特别鸣谢：frank。（b站：Frank讲明白）');
 assert.equal(await js('__webTest.audioCreated'),0,'startup cannot open an audio device');
 assert.equal(await js("document.querySelectorAll('.melody-grid-line.is-bar').length"),0);
 assert.equal(await js("document.querySelector('.output-volume input').value"),'100');
 await js("(()=>{const n=document.querySelector('.output-volume input');n.value='250';n.dispatchEvent(new Event('input'))})()");
 assert.equal(await js("document.querySelector('.output-volume output').textContent"),'250%');
 assert.equal(await js('__webTest.audioCreated'),0,'volume control cannot open an audio device');
 await js("(()=>{const n=document.querySelector('.output-volume input');n.value='100';n.dispatchEvent(new Event('input'))})()");
 const beforeGridBeats=await js("[...document.querySelectorAll('.melody-grid-line.is-beat')].map(n=>n.style.top)");
 await js("(()=>{const n=document.querySelector('.melody-grid-select');n.value='3';n.dispatchEvent(new Event('change'))})()");
 assert.equal(await js("document.querySelector('.melody-grid-select').value"),'3');
 const cellPositions=await js("[...document.querySelectorAll('.melody-grid-line.is-cell')].slice(0,4).map(n=>parseFloat(n.style.top))");
 assert.equal(cellPositions.length,4);assert(cellPositions[1]>cellPositions[0]);
 const beatPositions=await js("[...document.querySelectorAll('.melody-grid-line.is-beat')].slice(0,2).map(n=>parseFloat(n.style.top))");
 assert(Math.abs((beatPositions[1]-beatPositions[0])/3-(cellPositions[1]-cellPositions[0]))<=1,JSON.stringify({beatPositions,cellPositions}));
 assert.equal(await js("document.querySelectorAll('.melody-grid-line.is-beat').length>=2"),true);
 assert.deepEqual(await js("[...document.querySelectorAll('.melody-grid-line.is-beat')].map(n=>n.style.top)"),beforeGridBeats);
 await js("(()=>{const n=document.querySelector('.melody-grid-select');n.value='4';n.dispatchEvent(new Event('change'))})()");
 assert.equal(await js("document.querySelectorAll('.melody-tone').length"),1);
 await js("document.querySelector('.melody-add-tone').click()");
 assert.equal(await js("document.querySelectorAll('.melody-library-card').length"),8);
 await js("(()=>{document.querySelector('.melody-library-close').click();document.querySelector('.melody-tone-library')?.dispatchEvent(new Event('close'))})()");
 await delay(40);
 // Draw and resize by pointer events in the isolated renderer, no OS input.
 await js("(()=>{const canvas=document.querySelector('.melody-canvas'),r=canvas.getBoundingClientRect(),x=r.left+r.width/2,y=Math.max(110,r.top+80);canvas.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,cancelable:true,button:0,buttons:1,pointerId:91,isPrimary:true,pointerType:'mouse',clientX:x,clientY:y}));document.dispatchEvent(new PointerEvent('pointermove',{bubbles:true,cancelable:true,button:0,buttons:1,pointerId:91,isPrimary:true,pointerType:'mouse',clientX:x,clientY:y+60}));document.dispatchEvent(new PointerEvent('pointerup',{bubbles:true,cancelable:true,button:0,pointerId:91,isPrimary:true,pointerType:'mouse',clientX:x,clientY:y+60}))})()");
 await wait(()=>js("document.querySelectorAll('.melody-note').length===1"));
 await wait(()=>js('__webTest.audioCreated===1'));
 await js("document.querySelector('.web-undo').click()");assert.equal(await js("document.querySelectorAll('.melody-note').length"),0);
 await js("document.querySelector('.web-redo').click()");assert.equal(await js("document.querySelectorAll('.melody-note').length"),1);
 const originalNotes=await js("[...document.querySelectorAll('.melody-note')].map(n=>n.style.cssText)");
 const originalBeats=await js("[...document.querySelectorAll('.melody-grid-line.is-beat')].map(n=>n.style.top)");
 for (const n of [3,9]) {
  await js("(()=>{const n=document.querySelector('.melody-grid-select');n.value='"+n+"';n.dispatchEvent(new Event('change'))})()");
  assert.deepEqual(await js("[...document.querySelectorAll('.melody-note')].map(n=>n.style.cssText)"),originalNotes);
  assert.deepEqual(await js("[...document.querySelectorAll('.melody-grid-line.is-beat')].map(n=>n.style.top)"),originalBeats);
 }
 await js("(()=>{document.querySelector('.web-undo').click();document.querySelector('.web-undo').click()})()");
 await js("document.querySelector('.web-play').click()");await wait(()=>js("document.querySelector('.web-play').getAttribute('aria-pressed')==='true'"));
 await js('__webTest.now=.2');await delay(60);
 await js("document.querySelector('.web-play').click()");assert.equal(await js("document.querySelector('.web-play').getAttribute('aria-pressed')"),'false');
 await js("document.querySelector('.web-play').click()");await wait(()=>js("document.querySelector('.web-play').getAttribute('aria-pressed')==='true'"));
 await js('__webTest.now=3');await wait(()=>js("document.querySelector('.web-play').getAttribute('aria-pressed')==='false'"));assert.equal(await js("document.querySelector('.web-clock').textContent"),'00:00.000');
 await js("document.querySelector('.melody-scroll').dispatchEvent(new WheelEvent('wheel',{bubbles:true,cancelable:true,deltaY:800,clientX:700,clientY:300}))");await delay(50);
 await js("(()=>{const n=document.querySelector('.melody-ruler'),r=n.getBoundingClientRect();const p={bubbles:true,cancelable:true,button:0,buttons:1,pointerId:92,isPrimary:true,pointerType:'mouse',clientX:r.x+10,clientY:r.y+170};n.dispatchEvent(new PointerEvent('pointerdown',p));document.dispatchEvent(new PointerEvent('pointerup',{...p,buttons:0}))})()");
 await js("document.querySelector('.web-play').click()");await wait(()=>js("document.querySelector('.web-play').getAttribute('aria-pressed')==='true'"));await js('__webTest.now=5.5');await delay(90);assert.equal(await js("document.querySelector('.web-play').getAttribute('aria-pressed')"),'true','manual tail placement can play after the automatic bar ending');
 await js("document.querySelector('.web-stop').click()");assert.equal(await js("document.querySelector('.web-clock').textContent"),'00:00.000');
 await js("document.querySelector('.web-export').click()");await wait(()=>js("__webTest.downloads.some(d=>d.name.endsWith('.wav'))"));
 const audio=await js("(async()=>{const item=__webTest.downloads.find(d=>d.name.endsWith('.wav')),bytes=new Uint8Array(await item.blob.arrayBuffer());let peak=0;for(let i=44;i<bytes.length-2;i+=3){let n=bytes[i]|bytes[i+1]<<8|bytes[i+2]<<16;if(n&0x800000)n-=0x1000000;peak=Math.max(peak,Math.abs(n))}return {name:item.name,bytes:bytes.length,peak}})()");assert(audio.peak>100,'export must contain sound');
 await js("document.querySelector('.web-save').click()");await wait(()=>js("__webTest.downloads.some(d=>d.name.endsWith('.rootsound'))"));
 const exported=await js("__webTest.downloads.find(d=>d.name.endsWith('.rootsound')).blob.text()");
 const saved=JSON.parse(exported);assert.equal(saved.format,'RootSoundWorkspace');assert.equal(saved.version,2);fs.writeFileSync(root+'/web-export.rootsound',exported);
 await js("document.querySelector('.web-new').click()");await wait(()=>js("document.querySelectorAll('.melody-note').length===0"));
 await js("(()=>{const f=document.querySelector('.web-file');Object.defineProperty(f,'files',{configurable:true,value:[new File(["+JSON.stringify(exported)+"],'已下载.rootsound',{type:'application/json'})]});f.dispatchEvent(new Event('change'))})()");
 await wait(()=>js("document.querySelectorAll('.melody-note').length===1"));
 const layouts=[];
 for(const width of [1280,390,320]){
  win.setContentSize(width,950);await delay(100);
  const layout=await js("({width:innerWidth,scroll:document.documentElement.scrollWidth,rollWidth:document.querySelector('.melody-roll').getBoundingClientRect().width,rollHeight:document.querySelector('.melody-roll').getBoundingClientRect().height,toolbar:document.querySelector('.web-toolbar').getBoundingClientRect().height})");assert(layout.scroll<=layout.width+1,JSON.stringify(layout));assert(layout.rollWidth>110&&layout.rollHeight>300);layouts.push(layout);
  fs.writeFileSync(root+'/web-'+width+'.png',(await win.webContents.capturePage()).toPNG());
 }
 stage='embedded interactive guide';
 win.setContentSize(1280,950);
 const draft='引导前的草稿';
 await js("(()=>{const n=document.querySelector('.web-name');n.dispatchEvent(new MouseEvent('dblclick'));n.value="+JSON.stringify(draft)+";n.dispatchEvent(new Event('blur'))})()");
 assert(await js("document.querySelector('.web-save').hasAttribute('data-unsaved')"));
 await js("document.querySelector('.web-play').click()");
 await wait(()=>js("document.querySelector('.web-play').getAttribute('aria-pressed')==='true'"));
 assert.equal(await parentJs("document.querySelector('.guide-entry').textContent"),'操作引导');
 await parentJs("document.querySelector('.guide-entry').click()");
 await wait(()=>js("document.querySelector('.music-guide-word')?.textContent==='卷帘'"));
 assert(await js("document.querySelector('.web-studio').inert"));
 assert.equal(await js("document.querySelector('.web-play').getAttribute('aria-pressed')"),'false');
 assert.equal(await js("document.querySelectorAll('.web-guide .melody-note').length"),6);
 await js("document.activeElement.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true,cancelable:true}))");
 await wait(()=>js("document.querySelector('.music-guide-word')?.textContent==='音符'"));
 await js("document.activeElement.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true}))");
 await wait(()=>js("!document.querySelector('.music-guide')&&!document.querySelector('.web-studio').inert"));
 assert.equal(await js("document.activeElement.className"),'web-guide-start');
 assert.equal(await js("document.querySelector('.web-name').value"),draft);
 assert.equal(await js("document.querySelectorAll('.web-studio .melody-note').length"),1);

 stage='compact guide navigation and draft isolation';
 win.setContentSize(390,950);
 await js("document.querySelector('.web-guide-start').click()");
 await wait(()=>js("document.querySelector('.music-guide-word')?.textContent==='卷帘'"));
 assert(await js("document.querySelector('.web-guide-next').getBoundingClientRect().width>0"));
 assert(await parentJs('document.documentElement.scrollWidth<=innerWidth'));
 for(let step=2;step<=10;step++){
   await js("document.querySelector('.web-guide-next').click()");
   await wait(()=>js("Number(document.querySelector('.music-guide')?.dataset.step)==="+step));
   if(step===3) {
     assert(await js("document.querySelector('.web-guide-play').getBoundingClientRect().width>0"));
     const before=await js('__webTest.audioCreated');
     await js("document.querySelector('.web-guide-play').click()");
     await wait(async()=>await js('__webTest.audioCreated')>before);
   }
   if(step===9) {
     const count=await js("document.querySelectorAll('.web-studio .melody-note').length");
     await js("document.activeElement.dispatchEvent(new KeyboardEvent('keydown',{key:'Backspace',bubbles:true,cancelable:true}))");
     assert.equal(await js("document.querySelectorAll('.web-studio .melody-note').length"),count);
   }
 }
 assert.equal(await js("document.querySelector('.music-guide-word').textContent"),'顶栏');
 await js("document.querySelector('.web-guide-next').click()");
 await wait(()=>js("document.querySelector('.web-guide').hidden&&!document.querySelector('.web-studio').inert"));
 await js("document.querySelector('.web-guide-start').click()");
 await wait(()=>js("document.querySelector('.music-guide-word')?.textContent==='卷帘'"));
 await js("document.querySelector('.web-guide-exit').click()");
 assert.equal(await js("document.querySelector('.web-name').value"),draft);
 assert(await js("document.querySelector('.web-save').hasAttribute('data-unsaved')"));
 await js("__webTest.downloads=[],document.querySelector('.web-save').click()");
 await wait(()=>js("__webTest.downloads.some(item=>item.name.endsWith('.rootsound'))"));
 const afterGuide=JSON.parse(await js("__webTest.downloads.find(item=>item.name.endsWith('.rootsound')).blob.text()"));
 assert.equal(afterGuide.name,draft);
 const savedNotes=workspace=>JSON.parse(workspace.libraryText).contents.filter(item=>item.kind==='rootsound.phrase').flatMap(item=>item.body.parts.flatMap(part=>part.notes));
 assert.deepEqual(savedNotes(afterGuide),savedNotes(saved));
 const errors=await js('__webTest.errors');assert.deepEqual(errors,[]);
 stage='direct guide entry';
 await win.loadURL(origin+'/RootSound/play/?guide=1');
 await wait(()=>parentJs("document.querySelector('.music-guide-word')?.textContent==='卷帘'"));
 assert.equal(await parentJs("document.querySelector('.web-studio').inert"),true);
 assert.deepEqual(rendererErrors,[]);assert(!win.isVisible());
 fs.writeFileSync(root+'/report.json',JSON.stringify({passed:true,audio,layouts,voices:8,realProductionBuild:true,subpath:true,drawUndoRedo:true,pauseResume:true,lastNoteBarStop:true,manualTailPlayback:true,nativeWorkspaceRoundtrip:true,starterNotes:40,starterReload:true,guideStages:10,guideDraftIsolation:true,guideKeyboardAndTouchControls:true,noVideo:true,visibleWindow:false,physicalAudio:false},null,2));win.destroy();app.exit(0);
}catch(error){fs.writeFileSync(root+'/report.json',JSON.stringify({error:String(error),stack:error?.stack,expression:expression.slice(0,350),stage}));app.exit(1)}})();
`);
const env={...process.env};delete env.ELECTRON_RUN_AS_NODE;
try{
 const syntax=spawnSync(process.execPath,['--check',harness],{encoding:'utf8',windowsHide:true});
 if(syntax.status)throw Error(syntax.stderr);
 const result=await new Promise(resolve=>{const child=spawn(path.resolve('.cache/release-smoke-engine/electron.exe'),[harness],{env,windowsHide:true,stdio:['ignore','pipe','pipe']});let output='';child.stdout.on('data',d=>output=(output+d).slice(-3000));child.stderr.on('data',d=>output=(output+d).slice(-3000));child.on('error',e=>resolve({code:1,output:String(e)}));child.on('exit',code=>resolve({code,output}));});
 const report=await readFile(path.join(root,'report.json'),'utf8').catch(()=>result.output);console.log(report);console.log('Evidence: '+root);
 await writeFile(path.join(root,'requests.json'),JSON.stringify(requests));
 if(result.code)process.exitCode=1;
}finally{server.close();}
