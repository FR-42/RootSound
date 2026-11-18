// Production build served under its actual Pages subpath, hidden fixture only.
// AudioContext is replaced before app scripts with an offline clock. No desktop
// capture, OS input, file pickers, user projects, downloads or physical audio.
import {readFile,writeFile,mkdir,mkdtemp} from 'node:fs/promises';
import {spawn,spawnSync} from 'node:child_process';
import http from 'node:http';
import path from 'node:path';

await mkdir('.test-output/website-ui',{recursive:true});
const root=await mkdtemp(path.resolve('.test-output/website-ui/ui-'));
const requests=[];
const offline=`

window.__webTest={audioCreated:0,now:0,fetches:[],errors:[]};
window.addEventListener('error',e=>__webTest.errors.push(e.message));
window.addEventListener('unhandledrejection',e=>__webTest.errors.push(String(e.reason)));
const request=window.fetch;
window.fetch=(input,options)=>{
  __webTest.fetches.push(new URL(typeof input==='string' ? input : input.url,location.href).pathname);
  return request(input,options);
};
Object.defineProperty(window,'AudioContext',{configurable:true,value:class{
 constructor(){__webTest.audioCreated++;const clock=new OfflineAudioContext(2,44100,44100);
 const createSource=clock.createBufferSource.bind(clock);clock.createBufferSource=()=>{const source=createSource(),start=source.start.bind(source);source.start=(...args)=>{__webTest.starts=(__webTest.starts||0)+1;return start(...args)};return source;};
 Object.defineProperties(clock,{state:{get:()=> 'running'},currentTime:{get:()=>__webTest.now},close:{value:async()=>{}}});return clock;}
}});
const capturePointer=Element.prototype.setPointerCapture;
Element.prototype.setPointerCapture=function(id){
 try{capturePointer.call(this,id)}catch(error){if(error.name!=='NotFoundError')throw error}
};
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
const harnessSource=String.raw`
const {app,BrowserWindow,session}=require('electron'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=ROOT_PATH,origin=ORIGIN_URL;
app.setPath('userData',path.join(root,'profile'));
app.commandLine.appendSwitch('disable-gpu');
app.commandLine.appendSwitch('force-device-scale-factor','1');
const delay=ms=>new Promise(r=>setTimeout(r,ms));
async function wait(check){for(let i=0;i<300;i++){if(await check())return;await delay(25)}throw Error('Timed out waiting for web fixture')}
let stage='setup',expression='',win;
(async()=>{try{
 await app.whenReady();
 session.defaultSession.webRequest.onBeforeRequest({urls:['https://*/*']},(_d,cb)=>cb({cancel:true}));
 win=new BrowserWindow({show:false,width:1440,height:1050,webPreferences:{offscreen:true,contextIsolation:true,sandbox:true,backgroundThrottling:false}});
 let frame;
 const parentJs=code=>win.webContents.executeJavaScript('(async()=>('+code+'))()');
 const js=code=>{expression=code;return frame.executeJavaScript('(async()=>('+code+'))()')};
 const inFrame=(fn,...args)=>js('('+fn.toString()+')(...'+JSON.stringify(args)+')');
 const click=selector=>js('document.querySelector('+JSON.stringify(selector)+').click()');
 const ready=selector=>wait(()=>js('!!document.querySelector('+JSON.stringify(selector)+')'));
 const loadHome=async()=>{
   await win.loadURL(origin+'/RootSound/');
   await wait(()=>win.webContents.mainFrame.frames.some(f=>f.url.includes('/play/')));
   frame=win.webContents.mainFrame.frames.find(f=>f.url.includes('/play/'));
   await ready('.melody-workspace');
 };
 const absentGuide=async()=>assert.equal(await js("!!document.querySelector('.website-guide-choice,.music-guide,.guidance-invitation,.learning-replay-guide')"),false);
 stage='first visit opens editor directly';
 await loadHome();await absentGuide();
 assert.equal(await js("document.querySelectorAll('.melody-note').length"),40);
 assert.equal(await js("document.querySelectorAll('.melody-key').length"),128);
 assert.equal(await js("document.querySelector('.melody-tempo-button').textContent"),'148');
 assert.equal(await parentJs("!!document.querySelector('.guide-entry')"),false);
 assert.equal(await js("!!document.querySelector('.project-library-overlay:not([hidden])')"),false);
 const palette=await js("(()=>{const s=getComputedStyle(document.documentElement);return Object.fromEntries(['--surface-base','--text','--accent','--workspace-gradient'].map(k=>[k,s.getPropertyValue(k).trim()]))})()");
 assert.equal(palette['--surface-base'],'#fdf1e7');assert.equal(palette['--text'],'#422b34');
 for(const [key,value]of Object.entries(palette))assert.equal(await parentJs('getComputedStyle(document.documentElement).getPropertyValue('+JSON.stringify(key)+').trim()'),value);
 assert(await js("getComputedStyle(document.querySelector('.melody-note'),'::before').backgroundImage.includes('gradient')"));
 await delay(150);
 fs.writeFileSync(root+'/desktop.png',(await win.webContents.capturePage()).toPNG());
 fs.writeFileSync(root+'/editor-styles.json',JSON.stringify(await js("Object.fromEntries(['.song-editor-controls','.melody-canvas','.melody-key','.melody-note'].map(selector=>{const e=document.querySelector(selector),s=getComputedStyle(e),r=e.getBoundingClientRect();return[selector,{background:s.background,color:s.color,width:r.width,height:r.height}]}))"),null,2));
 stage='published download fallback and simple installer names';
 const downloads=await parentJs("[...document.querySelectorAll('.platform-download:not([hidden])')].map(a=>a.href)");
 assert.equal(downloads.length,2);assert(downloads.every(url=>url.startsWith('https://github.com/FR-42/RootSound/releases/download/')));
 const site=fs.readFileSync(path.resolve('website/site.js'),'utf8');
 for(const fileBase of ['简乐安装','default']){
 const target=fileBase==='default'?'default':'simple';
 await parentJs("(()=>{const releases=[{assets:[{name:'"+fileBase+".exe',size:123000000,browser_download_url:'https://github.com/FR-42/RootSound/releases/download/test/"+target+".exe'},{name:'"+fileBase+".pkg',size:234000000,browser_download_url:'https://github.com/FR-42/RootSound/releases/download/test/"+target+".pkg'}]}];window.fetch=async()=>({ok:true,json:async()=>releases});return true})()");
 await parentJs('(()=>{'+site+';return true})()');
 await wait(()=>parentJs("document.querySelector('[data-platform=windows]').href.endsWith('/"+target+".exe')"));
 }
 const key=async name=>{
  await js('document.body.dispatchEvent(new KeyboardEvent("keydown",{key:'+JSON.stringify(name)+',code:'+JSON.stringify(name===' '?'Space':name)+',bubbles:true,cancelable:true}))');
  await js('document.body.dispatchEvent(new KeyboardEvent("keyup",{key:'+JSON.stringify(name)+',code:'+JSON.stringify(name===' '?'Space':name)+',bubbles:true,cancelable:true}))');
 };
 const edge=side=>inFrame(side=>{
   const page=document.querySelector('.music-editor'),y=innerHeight*.4;
   for(const x of side==='left'?[innerWidth*.55,innerWidth*.32,1]:[innerWidth*.45,innerWidth*.68,innerWidth-1])
     page.dispatchEvent(new PointerEvent('pointermove',{pointerType:'mouse',pointerId:1,bubbles:true,buttons:0,clientX:x,clientY:y}));
 },side);
 stage='current desktop interface';
 assert(await js("document.querySelector('.melody-workspace').classList.contains('has-pointer-roll')"));
 assert.equal(await js("!!document.querySelector('.song-topbar')"),false);
 assert.equal(await js("!!document.querySelector('.song-save-project,.song-save-copy,.song-exit')"),false);
 assert.equal(await parentJs("document.querySelectorAll('.editor-instructions p').length"),5);
 stage='left and right edge gestures';
 await edge('left');await ready('.has-pointer-roll.is-tone-shelf-open');
 await delay(510);await edge('right');await ready('.song-editor-controls[open]');
 await delay(510);await edge('left');
 assert(await js("document.querySelector('.song-editor-controls').hasAttribute('open')"),'left edge keeps details open');
 assert.equal(await js("document.querySelectorAll('.song-rate-choice').length"),3);
 assert.deepEqual(await js("[...document.querySelectorAll('.song-rate-choice')].map(b=>b.textContent)"),['0.5x','0.75x','1x']);
 await absentGuide();
 await delay(200);fs.writeFileSync(root+'/details.png',(await win.webContents.capturePage()).toPNG());
 const gridRange='.learning-grid-appearance input[type=range]';
 await inFrame(selector=>{const input=document.querySelector(selector);input.value='55';input.dispatchEvent(new Event('input'));input.dispatchEvent(new Event('change'));},gridRange);
 assert.equal(await js('document.querySelector('+JSON.stringify(gridRange)+').value'),'55');
 await delay(510);await edge('right');await wait(()=>js("!document.querySelector('.song-editor-controls').hasAttribute('open')"));
 await delay(190);
 stage='only piano in current card library';
 if(!await js("document.querySelector('.has-pointer-roll').classList.contains('is-tone-shelf-open')")){await delay(510);await edge('left');}
 await ready('.has-pointer-roll.is-tone-shelf-open');
 await click('.melody-add-note-family');await ready('.melody-tone-library[open]');
 assert.deepEqual(await js("[...document.querySelectorAll('.melody-library-tone')].map(t=>t.textContent)"),['三角钢琴']);
 await delay(200);fs.writeFileSync(root+'/cards.png',(await win.webContents.capturePage()).toPNG());
 await click('.melody-add-note-family');await wait(()=>js("!document.querySelector('.melody-tone-library[open]')"));
 await delay(510);await edge('left');
 stage='playback without legacy transport bar';
 const began=Date.now();await key(' ');await wait(()=>js("document.querySelector('.melody-workspace').classList.contains('is-playing')"));
 const firstPlaybackMs=Date.now()-began;
 assert(await js("__webTest.fetches.some(url=>url.includes('/rootsound-studio-v1/')&&url.endsWith('.wav'))"));
 await key(' ');
 stage='mouse click, drag, middle toggle and wheel editing';
 const spot=kind=>inFrame(kind=>{
  const v=document.querySelector('.melody-scroll').getBoundingClientRect();
  if(kind==='note')for(const e of document.querySelectorAll('.melody-note')){
   const r=e.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2;
   if(x>v.left+30&&x<v.right-30&&y>v.top+40&&y<v.bottom-100&&document.elementFromPoint(x,y)?.closest('.melody-note')===e)
    return{x,y,id:e.dataset.noteId,top:e.style.top,height:r.height};
  }
  if(kind==='blank')for(let fy=.5;fy<.85;fy+=.1)for(let fx=.3;fx<.8;fx+=.1){
   const x=v.left+v.width*fx,y=v.top+v.height*fy,e=document.elementFromPoint(x,y);
   if(e?.closest('.melody-canvas')&&!e.closest('.melody-note,.melody-playhead,.melody-roll-end'))return{x,y};
  }
 },kind);
 const mouse=(type,p,button=0,buttons=type==='pointerup'?0:button===2?2:button===1?4:1)=>inFrame((type,p,button,buttons)=>{
  const target=type==='pointerdown'||type==='pointermove'&&buttons===0?document.elementFromPoint(p.x,p.y):document;
  target.dispatchEvent(new PointerEvent(type,{bubbles:true,cancelable:true,pointerType:'mouse',pointerId:1,isPrimary:true,clientX:p.x,clientY:p.y,button,buttons}));
 },type,p,button,buttons);
 const tap=async(p,button=0)=>{await mouse('pointerdown',p,button);await mouse('pointerup',p,button);await delay(40)};
 const wheelAt=p=>inFrame(p=>document.elementFromPoint(p.x,p.y).dispatchEvent(new WheelEvent('wheel',{bubbles:true,cancelable:true,clientX:p.x,clientY:p.y,deltaY:100})),p);
 const scene=()=>js("JSON.stringify([document.querySelector('.melody-note').getBoundingClientRect().top,document.querySelector('.melody-scroll').scrollLeft])");
 let blank=await spot('blank');assert(blank);await tap(blank,1);
 assert.equal(await js("document.querySelector('.round-pointer').classList.contains('has-pan-dot')"),false);
 await tap(blank,1);assert(await js("document.querySelector('.round-pointer').classList.contains('has-pan-dot')"));
 await tap(blank,1);
 const beforeScroll=await scene();await wheelAt(blank);await delay(60);assert.notEqual(await scene(),beforeScroll,'unselected blank wheel scrolls');
 blank=await spot('blank');await tap(blank);
 assert.notEqual(await js("document.querySelector('.melody-playhead-time').textContent"),'00:00.000');
 const beforeDrag=await scene();await mouse('pointerdown',blank);await mouse('pointermove',{x:blank.x+28,y:blank.y+40});await mouse('pointerup',{x:blank.x+28,y:blank.y+40});await delay(60);
 assert.notEqual(await scene(),beforeDrag,'blank drag pans the roll');
 let editNote=await spot('note');assert(editNote);
 const beforeAudition=await js('__webTest.starts||0');await tap(editNote);await wait(()=>js('(__webTest.starts||0)>'+beforeAudition));
 await mouse('pointermove',editNote,0,0);await wheelAt(editNote);await delay(160);
 assert(await inFrame(p=>document.querySelector('.melody-note[data-note-id="'+p.id+'"]').getBoundingClientRect().height>p.height,editNote),'wheel over center edits existing note');
 editNote=await spot('note');const draggedId=editNote.id;
 await mouse('pointerdown',editNote);await mouse('pointermove',{x:editNote.x,y:editNote.y+30});await mouse('pointerup',{x:editNote.x,y:editNote.y+30});await delay(80);
 assert(await inFrame(p=>document.querySelector('.melody-note[data-note-id="'+p.id+'"]').style.top!==p.top,editNote),'left drag moves a note');
 blank=await spot('blank');const rightStarts=await js('__webTest.starts||0');await tap(blank,2);await wait(()=>js('(__webTest.starts||0)>'+rightStarts));
 editNote=await spot('note');await tap(editNote,2);await wait(()=>inFrame(id=>!document.querySelector('.melody-note[data-note-id="'+id+'"]'),editNote.id));
 await delay(510);await edge('left');await ready('.has-pointer-roll.is-tone-shelf-open');
 await click('.melody-tone-hand .melody-note-family');await ready('.melody-pinned-tone:not([hidden])');await delay(210);
 if(await js("document.querySelector('.has-pointer-roll').classList.contains('is-tone-shelf-open')")){await delay(510);await edge('left');}
 blank=await spot('blank');assert(blank);await mouse('pointermove',blank,0,0);
 const notesBefore=await js("document.querySelectorAll('.melody-note').length"),selectedScene=await scene();
 await wheelAt(blank);await delay(180);
 assert.equal(await scene(),selectedScene,'selected tone prevents wheel navigation');
 assert.equal(await js("document.querySelectorAll('.melody-note').length"),notesBefore+1,'selected tone creates notes with wheel');
 await loadHome();
 stage='old guide preferences and direct guide links';
 for(const choice of ['yes','no']){
  await js('localStorage.setItem("rootsound.website-guide-choice.v1",'+JSON.stringify(choice)+')');
  await loadHome();await absentGuide();
 }
 await win.loadURL(origin+'/RootSound/play/?guide=1');frame=win.webContents.mainFrame;await ready('.melody-workspace');await absentGuide();
 await delay(510);await edge('right');await ready('.song-editor-controls[open]');await delay(510);await edge('right');
 await js("window.postMessage({type:'jianle:start-guide'},location.origin)");await delay(80);await absentGuide();
 stage='responsive layouts';
 for(const width of [1440,768,390,320]){
  win.setContentSize(width,950);await loadHome();await delay(80);
  assert(await parentJs('document.documentElement.scrollWidth<=innerWidth'),'homepage overflow at '+width);
  assert(await js('document.documentElement.scrollWidth<=innerWidth'),'editor overflow at '+width);
  assert(await parentJs("[...document.images].every(i=>i.complete&&i.naturalWidth>0)"));
 }
 stage='phone right button, deletion and left-offset dragging';
 win.setContentSize(390,950);win.webContents.debugger.attach('1.3');
 await win.webContents.debugger.sendCommand('Emulation.setDeviceMetricsOverride',{width:390,height:950,screenWidth:390,screenHeight:950,deviceScaleFactor:1,mobile:true});
 await win.webContents.debugger.sendCommand('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:5});
 await loadHome();await ready('.song-touch-right');await absentGuide();
 assert(await js("document.querySelector('.song-touch-right').getBoundingClientRect().width>0"));
 await click('.song-settings');await ready('.song-editor-controls[open]');
 await click('.song-settings');await wait(()=>js("!document.querySelector('.song-editor-controls').hasAttribute('open')"));await delay(190);
 assert.equal(await js("getComputedStyle(document.querySelector('.melody-tone-shortcut')).clipPath"),'none');
 await click('.melody-tone-shortcut');await ready('.has-pointer-roll.is-tone-shelf-open');
 await click('.melody-tone-shortcut');await wait(()=>js("!document.querySelector('.has-pointer-roll').classList.contains('is-tone-shelf-open')"));
 await delay(200);
 fs.writeFileSync(root+'/phone.png',(await win.webContents.capturePage()).toPNG());
 await parentJs("document.querySelector('.music-editor').scrollIntoView({block:'start'})");
 const frameOrigin=()=>parentJs("(()=>{const e=document.querySelector('.music-editor'),r=e.getBoundingClientRect();return{x:r.left+e.clientLeft,y:r.top+e.clientTop}})()");
 const sendTouch=(type,touchPoints)=>win.webContents.debugger.sendCommand('Input.dispatchTouchEvent',{type,touchPoints});
 const visibleNote=()=>js("(()=>{const v=document.querySelector('.melody-scroll').getBoundingClientRect();for(const e of document.querySelectorAll('.melody-note')){const r=e.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2;if(x>v.left+65&&x<v.right-12&&y>v.top+16&&y<v.bottom-72&&document.elementFromPoint(x,y)?.closest('.melody-note')===e)return{id:e.dataset.noteId,x,y,left:e.style.left,top:parseFloat(e.style.top)}}})()");
 await click('.song-touch-right');assert.equal(await js("document.querySelector('.song-touch-right').getAttribute('aria-pressed')"),'true');
 let note=await visibleNote();assert(note,'visible note for touch deletion');let offset=await frameOrigin();
 await sendTouch('touchStart',[{id:61,x:offset.x+note.x,y:offset.y+note.y}]);await sendTouch('touchEnd',[]);
 await wait(()=>inFrame(id=>!document.querySelector('.melody-note[data-note-id="'+id+'"]'),note.id));
 await click('.song-touch-right');note=await visibleNote();assert(note);offset=await frameOrigin();
 await sendTouch('touchStart',[{id:62,x:offset.x+note.x,y:offset.y+note.y}]);
 await sendTouch('touchMove',[{id:62,x:offset.x+note.x,y:offset.y+note.y+24}]);
 const bounds=id=>inFrame(id=>{const e=document.querySelector('.melody-note[data-note-id="'+id+'"]');return{right:e.getBoundingClientRect().right,left:e.style.left,top:parseFloat(e.style.top)}},id);
 assert((await bounds(note.id)).right<=note.x-12);await sendTouch('touchEnd',[]);
 assert.equal((await bounds(note.id)).left,note.left);assert((await bounds(note.id)).top>note.top);
 stage='pinch zoom';
 const scales=()=>js("(()=>{const beats=document.querySelectorAll('.melody-grid-line.is-beat');return{pitch:parseFloat(document.querySelector('.melody-key').style.width),time:parseFloat(beats[1].style.top)-parseFloat(beats[0].style.top)}})()");
 const before=await scales();offset=await frameOrigin();
 const center=await js("(()=>{const r=document.querySelector('.melody-scroll').getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+180}})()");
 const fingers=d=>[{id:51,x:offset.x+center.x-26-d,y:offset.y+center.y-34-d},{id:52,x:offset.x+center.x+26+d,y:offset.y+center.y+34+d}];
 await sendTouch('touchStart',fingers(0));await sendTouch('touchMove',fingers(18));await delay(50);await sendTouch('touchEnd',[]);
 const after=await scales();assert(after.pitch>before.pitch);assert(after.time>before.time);
 assert.deepEqual(await js('__webTest.errors'),[]);assert(!win.isVisible());
 fs.writeFileSync(root+'/report.json',JSON.stringify({passed:true,guidesRemoved:true,oldGuideLinks:true,sharedPalette:palette,responsiveWidths:[1440,768,390,320],onlyGrandPiano:true,starterNotes:40,starterBpm:148,currentEditor:true,mouseClickDragWheel:true,middlePanToggle:true,edgeGestures:true,currentCards:true,detailsWithoutFileActions:true,starterPlayback:true,firstPlaybackMs,mobileRightDelete:true,mobileLeftOffsetDrag:true,mobilePinchZoom:true,visibleWindow:false,physicalAudio:false},null,2));
 win.destroy();app.exit(0);
}catch(error){fs.writeFileSync(root+'/report.json',JSON.stringify({error:String(error),stack:error?.stack,expression:expression.slice(0,350),stage},null,2));win?.destroy();app.exit(1)}})();
`;
await writeFile(harness,harnessSource.replace('ROOT_PATH',JSON.stringify(root)).replace('ORIGIN_URL',JSON.stringify(origin)));
const env={...process.env};delete env.ELECTRON_RUN_AS_NODE;
try{
 const syntax=spawnSync(process.execPath,['--check',harness],{encoding:'utf8',windowsHide:true});
 if(syntax.status)throw Error(syntax.stderr);
 const result=await new Promise(resolve=>{const child=spawn(path.resolve(process.env.ROOTSOUND_TEST_ELECTRON||'.cache/release-smoke-engine/electron.exe'),[harness],{env,windowsHide:true,stdio:['ignore','pipe','pipe']});let output='';child.stdout.on('data',d=>output=(output+d).slice(-3000));child.stderr.on('data',d=>output=(output+d).slice(-3000));const watchdog=setTimeout(()=>child.kill(),60000);child.on('exit',()=>clearTimeout(watchdog));child.on('error',e=>resolve({code:1,output:String(e)}));child.on('exit',code=>resolve({code,output}));});
 const report=await readFile(path.join(root,'report.json'),'utf8').catch(()=>result.output);console.log(report);console.log('Evidence: '+root);
 await writeFile(path.join(root,'requests.json'),JSON.stringify(requests));
 if(result.code)process.exitCode=1;
}finally{server.close();}
