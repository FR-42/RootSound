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
 assert.equal(await parentJs("!!(document.querySelector('#guide').compareDocumentPosition(document.querySelector('.music-editor')) & Node.DOCUMENT_POSITION_FOLLOWING)"),true);
 assert.equal(await parentJs("document.querySelectorAll('video').length"),0);
 await wait(()=>parentJs("document.querySelectorAll('.guide-dot').length===5"));
 const titles=['添加音色','BPM','格数','横向缩放','竖向缩放'];
 for(let i=0;i<5;i++){
  await parentJs("document.querySelectorAll('.guide-dot')["+i+"].click()");
  await wait(()=>parentJs("document.querySelector('#guide-title').textContent==="+JSON.stringify(titles[i])));
  await wait(()=>parentJs("document.querySelectorAll('.guide-page').length===1"));
  assert.equal(await parentJs("document.querySelectorAll('.guide-dot[aria-current=true]').length"),1);
  assert.equal(await parentJs("document.querySelector('.guide-page img').naturalWidth"),1120);
  assert.equal(await parentJs("new URL(document.querySelector('.guide-page img').src).pathname.endsWith('.webp')"),true);
 }
 await parentJs("document.querySelector('#guide').dispatchEvent(new KeyboardEvent('keydown',{bubbles:true,key:'ArrowRight'}))");
 await wait(()=>parentJs("document.querySelector('#guide-title').textContent==='添加音色'"));
 await parentJs("document.querySelector('#guide').dispatchEvent(new KeyboardEvent('keydown',{bubbles:true,key:'ArrowLeft'}))");
 await wait(()=>parentJs("document.querySelector('#guide-title').textContent==='竖向缩放'"));
 await parentJs("(()=>{const n=document.querySelector('.guide-next');n.click();n.click();n.click()})()");
 await wait(()=>parentJs("document.querySelector('#guide-title').textContent==='格数'"));
 await wait(()=>parentJs("document.querySelectorAll('.guide-page').length===1"));
 await parentJs("(()=>{const n=document.querySelector('.guide-stage');n.setPointerCapture=()=>{};n.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,button:0,pointerId:7,clientX:400,clientY:200}));n.dispatchEvent(new PointerEvent('pointerup',{bubbles:true,button:0,pointerId:7,clientX:300,clientY:205}))})()");
 await wait(()=>parentJs("document.querySelector('#guide-title').textContent==='横向缩放'"));
 await wait(()=>parentJs("document.querySelectorAll('.guide-page').length===1"));
 await parentJs("document.querySelector('.guide-motion').click()");
 assert.equal(await parentJs("new URL(document.querySelector('.guide-page img').src).pathname.endsWith('.jpg')"),true);
 await parentJs("document.querySelector('.guide-motion').click()");
 assert.equal(await parentJs("new URL(document.querySelector('.guide-page img').src).pathname.endsWith('.webp')"),true);
 await win.webContents.debugger.attach('1.3');
 await win.webContents.debugger.sendCommand('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
 await wait(()=>parentJs("document.querySelector('.guide-motion').getAttribute('aria-pressed')==='true'"));
 await parentJs("document.querySelector('.guide-next').click()");
 await wait(()=>parentJs("document.querySelector('#guide-title').textContent==='竖向缩放'"));
 assert.equal(await parentJs("document.querySelectorAll('.guide-page').length"),1);
 assert.equal(await parentJs("document.querySelector('.guide-stage').getAnimations({subtree:true}).length"),0);
 await win.webContents.debugger.sendCommand('Emulation.setEmulatedMedia',{features:[]});win.webContents.debugger.detach();
 assert.equal(await js('__webTest.audioCreated'),0,'startup cannot open an audio device');
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
 await js("document.querySelector('.web-play').click()");await wait(()=>js("document.querySelector('.web-play').getAttribute('aria-pressed')==='true'"));
 await js('__webTest.now=.2');await delay(60);
 await js("document.querySelector('.web-play').click()");assert.equal(await js("document.querySelector('.web-play').getAttribute('aria-pressed')"),'false');
 await js("document.querySelector('.web-play').click()");await wait(()=>js("document.querySelector('.web-play').getAttribute('aria-pressed')==='true'"));
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
 win.setContentSize(1280,950);await parentJs("document.querySelector('#guide').scrollIntoView()");await delay(100);fs.writeFileSync(root+'/guide-desktop.png',(await win.webContents.capturePage()).toPNG());
 win.setContentSize(390,950);await delay(100);assert.equal(await parentJs('document.documentElement.scrollWidth<=innerWidth'),true);fs.writeFileSync(root+'/guide-mobile.png',(await win.webContents.capturePage()).toPNG());
 const errors=await js('__webTest.errors');assert.deepEqual(errors,[]);assert.deepEqual(rendererErrors,[]);assert(!win.isVisible());
 fs.writeFileSync(root+'/report.json',JSON.stringify({passed:true,audio,layouts,voices:8,realProductionBuild:true,subpath:true,drawUndoRedo:true,pauseResume:true,nativeWorkspaceRoundtrip:true,guidePages:5,guideKeysSwipeRapidFlip:true,guideReducedMotion:true,noVideo:true,visibleWindow:false,physicalAudio:false},null,2));win.destroy();app.exit(0);
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
