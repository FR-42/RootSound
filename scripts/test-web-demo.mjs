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
window.__webTest={audioCreated:0,now:0,fetches:[],banks:[],errors:[]};
window.addEventListener('error',e=>__webTest.errors.push(e.message));
window.addEventListener('unhandledrejection',e=>__webTest.errors.push(String(e.reason)));
const request=window.fetch;
window.fetch=(input,options)=>{
  __webTest.fetches.push(new URL(typeof input==='string' ? input : input.url,location.href).pathname);
  return request(input,options);
};
Object.defineProperty(window,'AudioContext',{configurable:true,value:class{
 constructor(){__webTest.audioCreated++;const clock=new OfflineAudioContext(2,44100,44100);
 Object.defineProperties(clock,{state:{get:()=> 'running'},currentTime:{get:()=>__webTest.now},close:{value:async()=>{}}});return clock;}
}});
const WorkletNode=window.AudioWorkletNode;
window.AudioWorkletNode=class extends WorkletNode{
 constructor(context,name,options){
   super(context,name,options);
   if(options?.processorOptions?.bank) this.port.addEventListener('message',event=>{
     if(event.data.type==='ready') __webTest.banks.push(options.processorOptions.starter ? 'starter' : 'full');
   });
 }
};
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
 let frame=win.webContents.mainFrame.frames.find(f=>f.url.includes('/play/'));
 const parentJs=code=>win.webContents.executeJavaScript('(async()=>('+code+'))()');
 const js=code=>{expression=code;return frame.executeJavaScript('(async()=>('+code+'))()');};
 const inFrame=(fn,...args)=>js('('+fn.toString()+')(...'+JSON.stringify(args)+')');
 const click=selector=>js("document.querySelector("+JSON.stringify(selector)+").click()");
 const ready=selector=>wait(()=>js("!!document.querySelector("+JSON.stringify(selector)+")"));
 const key=name=>js("document.body.dispatchEvent(new KeyboardEvent('keydown',{key:"+JSON.stringify(name)+",bubbles:true,cancelable:true}))");
 const loadHome=async()=>{
   await win.loadURL(origin+'/RootSound/');
   await wait(()=>win.webContents.mainFrame.frames.some(f=>f.url.includes('/play/')));
   frame=win.webContents.mainFrame.frames.find(f=>f.url.includes('/play/'));
 };
 const answerKey='rootsound.website-guide-choice.v1';
 const starterRequested="__webTest.fetches.some(url=>url.endsWith('/GeneralUser-GS-starter.sf2'))";
 const fullRequested="__webTest.fetches.some(url=>url.endsWith('/GeneralUser-GS.sf2'))";
 const heading='.website-guide-choice h1';

 stage='first visit and skip';
 await ready(heading);
 assert.equal(await js("document.querySelector('.website-guide-choice h1').textContent"),'是否观看引导');
 assert.deepEqual(await js("[...document.querySelectorAll('.website-guide-choice button')].map(n=>n.textContent)"),['是','否']);
 assert.equal(await js("!!document.querySelector('.melody-workspace')"),false);
 await wait(()=>js(starterRequested));
 assert.equal(await js('__webTest.audioCreated'),0);
 await click('.website-guide-choice .secondary');await ready('.melody-workspace');
 assert.equal(await js("!!document.querySelector('.project-library-overlay')"),false);
 assert.deepEqual(await js("[...document.querySelectorAll('.song-file-actions button')].map(n=>n.textContent)"),['设置']);
 assert.equal(await js("document.querySelector('.melody-tempo-button').textContent"),'148');
 assert.equal(await js("document.querySelectorAll('.melody-key').length"),128);
 assert(await js("(()=>{const note=document.querySelector('.melody-note');if(!note)return false;const style=getComputedStyle(note),canvas=document.createElement('canvas').getContext('2d');canvas.fillStyle=style.getPropertyValue('--tone-color').trim();canvas.fillRect(0,0,1,1);const original=[...canvas.getImageData(0,0,1,1).data];canvas.fillStyle=style.backgroundColor;canvas.fillRect(0,0,1,1);const lighter=[...canvas.getImageData(0,0,1,1).data];return lighter.slice(0,3).every((value,index)=>value>=original[index])&&lighter.slice(0,3).some((value,index)=>value>original[index])})()"));
 const downloads=await parentJs("[...document.querySelectorAll('.platform-download:not([hidden])')].map(link=>link.href)");
 assert.equal(downloads.length,2,'download links remain visible with GitHub API blocked');
 assert(downloads.every(url=>url.startsWith('https://github.com/FR-42/RootSound/releases/download/')));
 assert(downloads[0].endsWith('-Setup.exe')&&downloads[1].endsWith('.pkg'));
 assert.equal(await parentJs("document.querySelector('.release-history').href"),'https://github.com/FR-42/RootSound/releases');
 assert.equal(await js('__webTest.audioCreated'),0);

 stage='starter playback';
 const began=Date.now();
 await click('.song-play');await wait(()=>js("document.querySelector('.song-play').getAttribute('aria-label')==='暂停'"));
 const firstPlaybackMs=Date.now()-began;
 assert.deepEqual(await js('__webTest.banks'),['starter']);
 assert.equal(await js(fullRequested),false);
 assert.equal(await js("__webTest.fetches.some(url=>url.endsWith('/manifest.json'))"),false);
 assert.equal(await js("__webTest.fetches.some(url=>url.endsWith('/manifest.starter.json'))"),true);
 await click('.song-stop');

 stage='replay guide without losing editor draft';
 await js("document.querySelector('.song-project-name').dispatchEvent(new MouseEvent('dblclick',{bubbles:true}))");
 await ready('.song-project-name-input');
 const name='引导前的草稿';
 await js("(()=>{const input=document.querySelector('.song-project-name-input');input.value="+JSON.stringify(name)+";input.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true,cancelable:true}))})()");
 await wait(()=>js("document.querySelector('.song-project-name')?.textContent==="+JSON.stringify(name)));
 await click('.song-settings');await ready('.learning-settings[open]');
 await click('.learning-replay-guide');await ready('.music-guide-word');
 assert.equal(await js("document.querySelector('.music-guide-word').textContent"),'卷帘');
 assert.equal(await js("!!document.querySelector('.music-guide.is-mobile-web, .music-guide-touch-right')"),false);
 await key('Enter');await wait(()=>js("document.querySelector('.music-guide-word')?.textContent==='音符'"));
 await key('Escape');await ready('.song-topbar');
 assert.equal(await js("document.querySelector('.song-project-name').textContent"),name);

 stage='complete palette loads on demand';
 await click('.melody-add-note-family');await ready('.melody-tone-library[open]');
 assert.equal(await js("document.querySelectorAll('.melody-library-tone').length"),175);
 await js("(()=>{const tone=[...document.querySelectorAll('.melody-library-tone')].find(n=>n.textContent==='明亮钢琴');tone.closest('.melody-library-card').querySelector('.melody-library-preview').click()})()");
 await wait(()=>js(fullRequested));
 await wait(()=>js("__webTest.banks.includes('full')"));
 await click('.melody-library-close');
 await wait(()=>js("!document.querySelector('.melody-tone-library[open]')"));
 assert.deepEqual(await js('__webTest.errors'),[]);

 stage='return visit skips first-visit question';
 await loadHome();await ready('.melody-workspace');
 assert.equal(await js("!!document.querySelector('.website-guide-choice')"),false);
 assert.equal(await js("localStorage.getItem("+JSON.stringify(answerKey)+")"),'no');

 stage='first visit choosing yes and compact guide';
 await js("localStorage.removeItem("+JSON.stringify(answerKey)+")");
 win.setContentSize(390,950);
 win.webContents.debugger.attach('1.3');
 await win.webContents.debugger.sendCommand('Emulation.setDeviceMetricsOverride',{width:390,height:950,screenWidth:390,screenHeight:950,deviceScaleFactor:1,mobile:true});
 await win.webContents.debugger.sendCommand('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:5});
 await loadHome();await ready(heading);
 await click('.website-guide-choice .primary');await ready('.music-guide-word');
 assert.equal(await js("document.querySelector('.music-guide-word').textContent"),'卷帘');
 await ready('.music-guide.is-mobile-web');
 const playVisible=()=>js("document.querySelector('.music-guide-touch-play').getBoundingClientRect().width>0");
 assert(await playVisible());
 await click('.music-guide-touch-play');
 await wait(()=>js("document.querySelector('.song-play').getAttribute('aria-label')==='暂停'"));
 await click('.music-guide-touch-play');
 await wait(()=>js("document.querySelector('.song-play').getAttribute('aria-label')==='播放'"));
 const dragTouch = (selector, dx, dy, at) => inFrame((selector, dx, dy, at) => {
   const target=document.querySelector(selector);
   const rect=(selector==='.melody-canvas' ? document.querySelector('.melody-scroll') : target).getBoundingClientRect();
   const x=rect.left+rect.width*at[0], y=rect.top+rect.height*at[1];
   const opts={bubbles:true,cancelable:true,pointerId:41,isPrimary:true,pointerType:'touch',button:0,buttons:1,clientX:x,clientY:y};
   target.dispatchEvent(new PointerEvent('pointerdown',opts));
   if(dx||dy) document.dispatchEvent(new PointerEvent('pointermove',{...opts,button:-1,clientX:x+dx,clientY:y+dy}));
   document.dispatchEvent(new PointerEvent('pointerup',{...opts,buttons:0,clientX:x+dx,clientY:y+dy}));
 }, selector,dx,dy,at);
 const pinch = async (dx,dy) => {
   const frameOrigin=await parentJs("(()=>{const r=document.querySelector('.music-editor').getBoundingClientRect();return {x:r.left,y:r.top}})()");
   const center=await js("(()=>{const r=document.querySelector('.melody-scroll').getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+180}})()");
   const x=frameOrigin.x+center.x, y=frameOrigin.y+center.y;
   const fingers=(extraX,extraY)=>[{id:51,x:x-26-extraX,y:y-34-extraY},{id:52,x:x+26+extraX,y:y+34+extraY}];
   const send=(type,touchPoints)=>win.webContents.debugger.sendCommand('Input.dispatchTouchEvent',{type,touchPoints});
   await send('touchStart',fingers(0,0));
   await send('touchMove',fingers(dx,dy));
   await js("new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))");
   await send('touchEnd',[]);
 };
 const scales=()=>js("(()=>{const beats=document.querySelectorAll('.melody-grid-line.is-beat');return {pitch:parseFloat(document.querySelector('.melody-key').style.width),time:parseFloat(beats[1].style.top)-parseFloat(beats[0].style.top)}})()");
 for(let step=2;step<=10;step++){
   await click('.music-guide-touch button:nth-child(2)');
   await wait(()=>js("Number(document.querySelector('.music-guide')?.dataset.step)==="+step));
   assert(await playVisible());
   if(step===6) {
     await ready('.music-guide[data-timbre-phase=select]');
     await click('.melody-note-family');
     assert.equal(await js("document.querySelector('.music-guide-copy p:nth-child(2)').textContent"),'左键卷帘添加音符');
     const drawn=await js("(()=>{const canvas=document.querySelector('.melody-canvas'),r=document.querySelector('.melody-scroll').getBoundingClientRect(),x=r.x+r.width*.58,y=r.y+180;const opts={bubbles:true,cancelable:true,pointerId:31,isPrimary:true,pointerType:'mouse',button:0,buttons:1,clientX:x,clientY:y};const note=()=>document.querySelector('.melody-note.is-drawing');const length=()=>parseFloat(note().style.height);const count=()=>document.querySelectorAll('.melody-note').length;const before=count();canvas.dispatchEvent(new PointerEvent('pointerdown',opts));const initial=length();document.dispatchEvent(new PointerEvent('pointermove',{...opts,clientY:y+100}));const down=length();document.dispatchEvent(new PointerEvent('pointermove',{...opts,clientY:y+55}));const up=length();document.dispatchEvent(new PointerEvent('pointerup',{...opts,clientY:y+55,buttons:0}));return {initial,down,up,added:count()-before,finished:!note(),notice:document.querySelector('.melody-notice')?.textContent}})()");
     assert(drawn.down>drawn.initial&&drawn.up<drawn.down,JSON.stringify(drawn));
     assert.equal(drawn.added,1,JSON.stringify(drawn));
     assert(drawn.finished);
     await ready('.music-guide-touch-right:not([hidden])');
     await click('.music-guide-touch-right');
     assert.equal(await js("document.querySelector('.music-guide-touch-right').getAttribute('aria-pressed')"),'true');
     await dragTouch('.melody-canvas',0,0,[.04,.5]);
     assert.equal(await js("!!document.querySelector('.melody-note-family.is-selected')"),false);
     assert.equal(await js("document.querySelector('.music-guide-touch-right').hidden"),true);
   }
   if(step===7) {
     assert.equal(await js("document.querySelector('.music-guide-copy p:last-child').textContent"),'手机端可以双指缩放');
     await parentJs("document.querySelector('.music-editor').scrollIntoView({block:'start'})");
     const before=await scales();
     await pinch(14,0);
     const horizontal=await scales();
     assert(horizontal.pitch>before.pitch && horizontal.time===before.time, JSON.stringify({before,horizontal}));
     await pinch(0,21);
     const vertical=await scales();
     assert(vertical.time>horizontal.time && vertical.pitch===horizontal.pitch, JSON.stringify({horizontal,vertical}));
   }
   if(step===9) {
     await dragTouch('.melody-note',30,12,[.5,.45]);
     await ready('[data-guide-action="delete-note"]');
     await ready('.music-guide-touch-right:not([hidden])');
     await click('.music-guide-touch-right');
     const before=await js("document.querySelectorAll('.melody-note').length");
     await dragTouch('.melody-note',0,20,[.5,.45]);
     assert(await js("document.querySelectorAll('.melody-note').length")<before);
     await ready('[data-guide-action="resize-note"]');
     assert.equal(await js("document.querySelector('.music-guide-touch-right').getAttribute('aria-pressed')"),'false');
   }
 }
 await click('.music-guide-touch button:nth-child(2)');await ready('.melody-workspace');
 assert(await js('document.documentElement.scrollWidth<=innerWidth'));

 stage='homepage guide and direct link';
 await parentJs("document.querySelector('.guide-entry').click()");
 await ready('.music-guide-word');
 assert.equal(await js("document.querySelector('.music-guide-word').textContent"),'卷帘');
 await win.loadURL(origin+'/RootSound/play/?guide=1');
 await wait(()=>parentJs("document.querySelector('.music-guide-word')?.textContent==='卷帘'"));
 assert.deepEqual(rendererErrors,[]);assert(!win.isVisible());
 fs.writeFileSync(root+'/report.json',JSON.stringify({passed:true,firstVisitYes:true,firstVisitNo:true,returningVisit:true,replayFromSettings:true,
   guideStages:10,timbreDragLength:true,mobileGuideControls:true,mobilePinchAxes:true,draftPreserved:true,voices:175,starterPlayback:true,firstPlaybackMs,fullBankOnDemand:true,visibleWindow:false,physicalAudio:false},null,2));win.destroy();app.exit(0);
}catch(error){fs.writeFileSync(root+'/report.json',JSON.stringify({error:String(error),stack:error?.stack,expression:expression.slice(0,350),stage}));app.exit(1)}})();
`);
const env={...process.env};delete env.ELECTRON_RUN_AS_NODE;
try{
 const syntax=spawnSync(process.execPath,['--check',harness],{encoding:'utf8',windowsHide:true});
 if(syntax.status)throw Error(syntax.stderr);
 const result=await new Promise(resolve=>{const child=spawn(path.resolve(process.env.ROOTSOUND_TEST_ELECTRON||'.cache/release-smoke-engine/electron.exe'),[harness],{env,windowsHide:true,stdio:['ignore','pipe','pipe']});let output='';child.stdout.on('data',d=>output=(output+d).slice(-3000));child.stderr.on('data',d=>output=(output+d).slice(-3000));child.on('error',e=>resolve({code:1,output:String(e)}));child.on('exit',code=>resolve({code,output}));});
 const report=await readFile(path.join(root,'report.json'),'utf8').catch(()=>result.output);console.log(report);console.log('Evidence: '+root);
 await writeFile(path.join(root,'requests.json'),JSON.stringify(requests));
 if(result.code)process.exitCode=1;
}finally{server.close();}
