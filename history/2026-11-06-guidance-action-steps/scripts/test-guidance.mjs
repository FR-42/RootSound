// Hidden, isolated production-renderer fixture. No desktop input, user files,
// native pickers or physical sound device. Small practice score only.
import { readFile, writeFile, mkdir, mkdtemp } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import http from 'node:http';
import path from 'node:path';

await mkdir('.test-output/guidance-refresh', { recursive: true });
const evidence = await mkdtemp(path.resolve('.test-output/guidance-refresh/ui-'));
const offline = `
window.__guideTest={now:0,downloads:[],blobs:new Map(),errors:[]};
addEventListener('error',e=>__guideTest.errors.push(e.message));
addEventListener('unhandledrejection',e=>__guideTest.errors.push(String(e.reason)));
Object.defineProperty(window,'AudioContext',{configurable:true,value:class{
 constructor(){const clock=new OfflineAudioContext(2,44100,44100);Object.defineProperties(clock,{state:{get:()=> 'running'},currentTime:{get:()=>__guideTest.now},close:{value:async()=>{}}});return clock;}
}});
const objectURL=URL.createObjectURL.bind(URL);URL.createObjectURL=blob=>{const url=objectURL(blob);__guideTest.blobs.set(url,blob);return url};
HTMLAnchorElement.prototype.click=function(){if(this.download)__guideTest.downloads.push({name:this.download,blob:__guideTest.blobs.get(this.href)})};
Element.prototype.setPointerCapture=function(){};
`;
const mime={'.html':'text/html; charset=utf-8','.js':'application/javascript','.json':'application/json','.css':'text/css','.wav':'audio/wav','.webp':'image/webp','.jpg':'image/jpeg'};
const server=http.createServer(async(req,res)=>{try{
  const relative=decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/^\/RootSound\//,'');
  const filename=path.resolve('.cache/website',relative||'index.html');
  if(!filename.startsWith(path.resolve('.cache/website')+path.sep))throw Error('outside fixture');
  let bytes=await readFile(filename);
  if(relative==='play/index.html')bytes=Buffer.from(bytes.toString().replace('<head>','<head><script>'+offline+'</script>'));
  res.setHeader('Content-Type',mime[path.extname(filename)]||'application/octet-stream');res.end(bytes);
}catch{res.writeHead(404);res.end()}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin='http://127.0.0.1:'+server.address().port;
const harness=path.join(evidence,'qa.cjs');
await writeFile(harness,`
const {app,BrowserWindow,session}=require('electron'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=${JSON.stringify(evidence)},origin=${JSON.stringify(origin)};app.setPath('userData',path.join(root,'profile'));app.commandLine.appendSwitch('disable-gpu');app.commandLine.appendSwitch('force-device-scale-factor','1');
const delay=ms=>new Promise(r=>setTimeout(r,ms));let stage='start',expression='',win;
(async()=>{try{
 await app.whenReady();session.defaultSession.webRequest.onBeforeRequest({urls:['https://*/*']},(_d,cb)=>cb({cancel:true}));
 win=new BrowserWindow({show:false,width:1280,height:900,webPreferences:{sandbox:true,contextIsolation:true,backgroundThrottling:false,offscreen:true}});
 const js=code=>{expression=code;return win.webContents.executeJavaScript('(async()=>('+code+'))()')};
 async function wait(check){for(let i=0;i<500;i++){if(await check().catch(()=>false))return;await delay(30)}throw Error('Timed out: '+stage)}
 async function step(name){await wait(()=>js("document.querySelector('.guidance-shell')?.dataset.step==="+JSON.stringify(name)));await delay(50)}
 const click=selector=>js("document.querySelector("+JSON.stringify(selector)+").click()");
 const capture=async name=>{await delay(150);await js('new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))');win.webContents.invalidate();await delay(100);fs.writeFileSync(root+'/'+name,(await win.webContents.capturePage()).toPNG())};
 const key=(key,code)=>js("document.dispatchEvent(new KeyboardEvent('keydown',{bubbles:true,cancelable:true,key:"+JSON.stringify(key)+",code:"+JSON.stringify(code||key)+"}))");
 const wheel=extra=>js("(()=>{const n=document.querySelector('.guidance-shell .melody-scroll'),r=n.getBoundingClientRect();n.dispatchEvent(new WheelEvent('wheel',{bubbles:true,cancelable:true,clientX:r.left+r.width/2,clientY:r.top+r.height/2,deltaY:100,..."+JSON.stringify(extra)+"}))})()");
 const drag=(selector,dx,dy,part='middle')=>js("(()=>{const n=document.querySelector("+JSON.stringify(selector)+"),r=n.getBoundingClientRect(),x=r.left+r.width/2,y="+(part==='bottom'?"r.bottom-2":"r.top+Math.min(r.height/2,80)")+";const down=new PointerEvent('pointerdown',{bubbles:true,cancelable:true,button:0,pointerId:2,clientX:x,clientY:y});n.dispatchEvent(down);__guideTest.lastDrag={selector:"+JSON.stringify(selector)+",x,y,defaultPrevented:down.defaultPrevented,drawing:!!document.querySelector('.guidance-shell .is-drawing'),notes:document.querySelectorAll('.guidance-shell .melody-note').length};document.dispatchEvent(new PointerEvent('pointermove',{bubbles:true,cancelable:true,pointerId:2,clientX:x+"+dx+",clientY:y+"+dy+"}));document.dispatchEvent(new PointerEvent('pointerup',{bubbles:true,pointerId:2,clientX:x+"+dx+",clientY:y+"+dy+"}));})()");
 const right=selector=>js("(()=>{const n=document.querySelector("+JSON.stringify(selector)+"),r=n.getBoundingClientRect();n.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,cancelable:true,button:2,pointerId:3,clientX:r.left+r.width/2,clientY:r.top+r.height/2}));document.dispatchEvent(new PointerEvent('pointerup',{bubbles:true,pointerId:3}));})()");
 await win.loadURL(origin+'/RootSound/play/index.html');stage='first lesson';await step('play');
 assert.equal(await js("document.querySelector('.web-studio').inert"),true);await capture('first-step.png');
 assert.equal(await js("document.querySelector('.guidance-shell .melody-extend').hidden"),true);
 assert.equal(await js("document.querySelectorAll('.guidance-shell .melody-note').length"),24);
 await click('.guidance-skip');
 await wait(()=>js("!document.querySelector('.guidance-shell')"));assert.equal(await js("document.querySelectorAll('.web-workspace .melody-note').length"),40);
 await win.loadURL(origin+'/RootSound/play/index.html');await wait(()=>js("!!document.querySelector('.web-workspace .melody-note')"));assert.equal(await js("!!document.querySelector('.guidance-shell')"),false);
 // Explicit replay must create a clean practice document, not alter the public example.
 await click('.web-settings');await js("[...document.querySelectorAll('.learning-lessons button')].find(n=>n.textContent==='学习基础操作').click()");await step('play');
 stage='listen and start writing';await click('.guidance-shell .song-play');await step('reset');
 assert(await js("document.querySelectorAll('.guidance-shell .is-sounding').length>0"));
 await click('.guidance-shell .song-stop');await step('add-group');
 await click('.guidance-demo-button');await wait(()=>js("!!document.querySelector('.guidance-demo img')?.naturalWidth"));
 await capture('optional-demo.png');await click('.guidance-demo button');
 await win.loadURL(origin+'/RootSound/play/index.html');await step('add-group');
 stage='write and edit';await click('.guidance-shell .melody-add-note-family');
 await wait(()=>js("!!document.querySelector('.guidance-shell .melody-library-tone')"));
 await js("[...document.querySelectorAll('.guidance-shell .melody-library-tone')].find(n=>n.textContent==='长笛').click()");await step('select-group');
 await js("[...document.querySelectorAll('.guidance-shell .melody-note-family')].at(-1).click()");await step('draw-note');
 await drag('.guidance-shell .melody-canvas',0,60);await step('move-note');
 await drag('.guidance-shell .melody-note.is-selected',30,30);await step('resize-note');
 await drag('.guidance-shell .melody-note.is-selected',0,30,'bottom');await step('delete-note');
 await right('.guidance-shell .melody-note.is-selected');await step('undo');await key('Backspace');await step('deselect');
 await right('.guidance-shell .melody-canvas');await step('exit');
 await capture('finish-without-saving.png');
 assert.equal(await js('__guideTest.downloads.length'),0,'finishing needs no file creation');
 await click('.guidance-finish');await wait(()=>js("!document.querySelector('.guidance-shell')"));
 assert.equal(await js('__guideTest.downloads.length'),0);
 // Optional file actions remain usable but do not gate completion.
 await click('.web-settings');await js("[...document.querySelectorAll('.learning-lessons button')].find(n=>n.textContent==='学习基础操作').click()");await step('play');
 stage='optional steps and files';
 for(let i=0;i<11&&await js("document.querySelector('.guidance-shell')?.dataset.step!=='move-note'");i++)await click('.guidance-next');await step('move-note');
 await win.loadURL(origin+'/RootSound/play/index.html');await step('add-group');
 for(let i=0;i<11&&await js("document.querySelector('.guidance-shell')?.dataset.step!=='exit'");i++)await click('.guidance-next');await step('exit');
 await click('.guidance-shell .song-save-project');await wait(()=>js("__guideTest.downloads.some(d=>d.name.endsWith('.rootsound'))"));await step('exit');
 assert(await js("__guideTest.downloads.some(d=>d.name.endsWith('.rootsound'))"));
 await click('.guidance-shell .song-export-audio');await wait(()=>js("!!document.querySelector('.guidance-shell dialog[open]')"));
 await js("[...document.querySelectorAll('.guidance-shell dialog button')].find(n=>n.textContent==='返回').click()");await wait(()=>js("!document.querySelector('.guidance-shell dialog[open]')"));await step('exit');
 await click('.guidance-finish');await wait(()=>js("!document.querySelector('.guidance-shell')"));
 assert.equal(await js("document.querySelectorAll('.web-workspace .melody-note').length"),40,'practice edits leave the original score intact');
 assert.equal(await js("JSON.parse(localStorage.getItem('rootsound.learning.v1')).guides.basics.status"),'completed');
 stage='advanced lesson';await click('.web-settings');await js("(()=>{const n=document.querySelector('.learning-feature input');n.checked=true;n.dispatchEvent(new Event('change'))})()");await step('add-roll');
 await click('.guidance-shell .melody-extend');await step('change-tempo');
 await click('.guidance-shell .melody-tempo-marker:not([hidden])');
 await js("(()=>{const n=document.querySelector('.guidance-shell .melody-tempo-input');n.value='90';n.dispatchEvent(new Event('change'))})()");await step('change-grid');
 await js("(()=>{const n=document.querySelector('.guidance-shell .melody-tempo-grid');n.value='3';n.dispatchEvent(new Event('change'))})()");await step('resize-roll');
 await drag('.guidance-shell .melody-tempo-marker:not([hidden])',0,130);await step('exit');await click('.guidance-shell .song-exit');
 await wait(()=>js("!document.querySelector('.guidance-shell')"));assert.equal(await js("JSON.parse(localStorage.getItem('rootsound.learning.v1')).guides['tempo-rolls'].status"),'completed');
 stage='feature gate';await click('.web-workspace .melody-extend');await click('.web-save');
 await wait(()=>js("__guideTest.downloads.filter(d=>d.name.endsWith('.rootsound')).length===2"));
 const complex=await js("(async()=>{const item=__guideTest.downloads.filter(d=>d.name.endsWith('.rootsound')).at(-1);return await item.blob.text()})()");
 await js("(()=>{const k='rootsound.learning.v1',p=JSON.parse(localStorage.getItem(k));p.multipleTempoRolls=false;localStorage.setItem(k,JSON.stringify(p))})()");
 await win.loadURL(origin+'/RootSound/play/index.html');await wait(()=>js("!!document.querySelector('.web-workspace .melody-note')"));
 async function importComplex(){await js("(()=>{const transfer=new DataTransfer();transfer.items.add(new File(["+JSON.stringify(complex)+"],'复杂工程.rootsound',{type:'application/json'}));const n=document.querySelector('.web-file');n.files=transfer.files;n.dispatchEvent(new Event('change'))})()");await wait(()=>js("!!document.querySelector('.learning-feature-gate[open]')"))}
 await importComplex();await js("[...document.querySelectorAll('.learning-feature-gate button')].find(n=>n.textContent==='返回').click()");
 await wait(()=>js("!document.querySelector('.learning-feature-gate')"));assert.equal(await js("document.querySelectorAll('.web-workspace .melody-note').length"),40);
 await importComplex();await js("[...document.querySelectorAll('.learning-feature-gate button')].find(n=>n.textContent==='启用并打开').click()");
 await wait(()=>js("document.querySelector('.web-name').value==='复杂工程'"));
 await wait(()=>js("!document.querySelector('.learning-feature-gate')&&!document.querySelector('.web-save').disabled"));
 await click('.web-settings');assert.equal(await js("document.querySelector('.learning-feature input').disabled"),true);
 await capture('advanced-settings.png');
 await js("document.querySelector('.learning-settings button[aria-label=关闭设置]').click()");
 await click('.web-settings');await js("[...document.querySelectorAll('.learning-lessons button')].find(n=>n.textContent==='学习基础操作').click()");await step('play');
 win.setContentSize(390,850);await delay(150);
 assert(await js("(()=>{const r=document.querySelector('.guidance-card').getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&r.bottom<=innerHeight})()"));
 assert(await js("['.song-save-project','.song-export-audio','.song-exit','.song-play','.song-stop'].every(s=>{const r=document.querySelector('.guidance-shell '+s).getBoundingClientRect();return r.width>0&&r.left>=0&&r.right<=innerWidth})"), 'mobile lessons must expose actual file and playback controls');
 await capture('mobile-practice.png');
 const errors=await js('__guideTest.errors');assert.deepEqual(errors,[]);assert(!win.isVisible());
 fs.writeFileSync(root+'/report.json',JSON.stringify({passed:true,firstRun:true,singleClickSkip:true,skipPersists:true,completeBasicHandsOn:true,resumeAfterReload:true,realProjectDownload:true,completeWithoutSaving:true,optionalDemoLoaded:true,skipAnyStep:true,cancelExportDoesNotBlockCompletion:true,scoreIsolation:true,featureFirstUseLesson:true,completeAdvancedHandsOn:true,featureGateCancelAndEnable:true,mobilePromptFits:true,visibleWindow:false,physicalAudio:false},null,2));win.destroy();app.exit(0);
}catch(error){let diagnostic;try{diagnostic=await win.webContents.executeJavaScript("({step:document.querySelector('.guidance-shell')?.dataset.step,prompt:document.querySelector('.guidance-prompt')?.textContent,notices:[...document.querySelectorAll('.melody-notice,.phrase-composition-notice')].map(n=>n.textContent),rects:['.guidance-shell .melody-canvas','.guidance-shell .melody-scroll'].map(s=>({s,rect:document.querySelector(s)?.getBoundingClientRect().toJSON()})),selected:[...document.querySelectorAll('.guidance-shell .is-selected')].map(n=>({text:n.textContent,note:n.dataset.noteId,part:n.dataset.partId})),errors:__guideTest.errors,lastDrag:__guideTest.lastDrag})");fs.writeFileSync(root+'/failure.png',(await win.webContents.capturePage()).toPNG())}catch{}fs.writeFileSync(root+'/report.json',JSON.stringify({stage,expression,error:String(error),stack:error.stack,diagnostic},null,2));app.exit(1)}})();
`);
const env={...process.env};delete env.ELECTRON_RUN_AS_NODE;
try {
  const result=await new Promise(resolve=>{const child=spawn(path.resolve(process.env.ROOTSOUND_TEST_ELECTRON || '.cache/release-smoke-engine/electron.exe'),[harness],{env,windowsHide:true,stdio:['ignore','pipe','pipe']});
    let log='';child.stdout.on('data',d=>log=(log+d).slice(-4000));child.stderr.on('data',d=>log=(log+d).slice(-4000));child.on('error',e=>resolve({code:1,log:String(e)}));child.on('exit',code=>resolve({code,log}));});
  console.log(await readFile(path.join(evidence,'report.json'),'utf8').catch(()=>result.log));console.log('Evidence: '+evidence);if(result.code)process.exitCode=1;
}finally{server.close()}
