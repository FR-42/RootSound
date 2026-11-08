import { readFile, writeFile, mkdir, mkdtemp } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import http from 'node:http';
import path from 'node:path';

await mkdir('.test-output/guidance-film', { recursive: true });
const evidence = await mkdtemp(path.resolve('.test-output/guidance-film/ui-'));
const fixture = `
window.__guideTest={downloads:[],errors:[]};
addEventListener('error',e=>__guideTest.errors.push(e.message));
addEventListener('unhandledrejection',e=>__guideTest.errors.push(String(e.reason)));
HTMLAnchorElement.prototype.click=function(){if(this.download)__guideTest.downloads.push(this.download)};
Element.prototype.setPointerCapture=function(){};
`;
const mime={'.html':'text/html; charset=utf-8','.js':'application/javascript','.json':'application/json','.css':'text/css','.wav':'audio/wav','.mp4':'video/mp4','.jpg':'image/jpeg'};
const server=http.createServer(async(req,res)=>{try{
  const relative=decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/^\/RootSound\//,'');
  const filename=path.resolve('.cache/website',relative||'index.html');
  if(!filename.startsWith(path.resolve('.cache/website')+path.sep))throw Error('outside fixture');
  let bytes=await readFile(filename);
  if(relative==='play/index.html')bytes=Buffer.from(bytes.toString().replace('<head>','<head><script>'+fixture+'</script>'));
  res.setHeader('Content-Type',mime[path.extname(filename)]||'application/octet-stream');
  if(path.extname(filename)==='.mp4'){
    res.setHeader('Accept-Ranges','bytes');
    const match=req.headers.range?.match(/^bytes=(\d+)-(\d*)$/);
    if(match){const start=Number(match[1]),end=Math.min(match[2]?Number(match[2]):bytes.length-1,bytes.length-1);res.statusCode=206;res.setHeader('Content-Range',`bytes ${start}-${end}/${bytes.length}`);bytes=bytes.subarray(start,end+1)}
  }
  res.setHeader('Content-Length',bytes.length);res.end(bytes);
}catch{res.writeHead(404);res.end()}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin='http://127.0.0.1:'+server.address().port;
const harness=path.join(evidence,'qa.cjs');
await writeFile(harness,`
const {app,BrowserWindow,session}=require('electron'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=${JSON.stringify(evidence)},origin=${JSON.stringify(origin)};app.setPath('userData',path.join(root,'profile'));app.commandLine.appendSwitch('disable-gpu');app.commandLine.appendSwitch('mute-audio');
const delay=ms=>new Promise(r=>setTimeout(r,ms));let stage='start',win;
(async()=>{try{
 await app.whenReady();session.defaultSession.webRequest.onBeforeRequest({urls:['https://*/*']},(_d,cb)=>cb({cancel:true}));
 win=new BrowserWindow({show:false,width:1280,height:900,webPreferences:{sandbox:true,contextIsolation:true,backgroundThrottling:false,offscreen:true}});
 const js=code=>win.webContents.executeJavaScript('(async()=>('+code+'))()');
 async function wait(code){for(let i=0;i<700;i++){if(await js(code).catch(()=>false))return;await delay(30)}throw Error('Timed out: '+stage+' / '+code)}
 const click=selector=>js('document.querySelector('+JSON.stringify(selector)+').click()');
 async function capture(name){await delay(180);win.webContents.invalidate();await delay(100);fs.writeFileSync(root+'/'+name,(await win.webContents.capturePage()).toPNG())}
 const open=async()=>{await win.loadURL(origin+'/RootSound/play/index.html');await wait("!!document.querySelector('.guidance-video')");await wait("document.querySelector('.guidance-video').readyState>=2")};
 stage='automatic film';await open();
 await wait("document.querySelector('.guidance-video').currentTime>.25");
 assert.equal(await js("document.querySelector('.guidance-video').muted"),true);
 assert.equal(await js("document.querySelectorAll('.guidance-shell .melody-note').length"),0,'film never mounts a practice score automatically');
 assert.equal(await js("document.querySelector('.web-studio').inert"),true);
 await capture('overture.png');
 stage='pause and seeking';await click('.guidance-pause');
 const paused=await js("document.querySelector('.guidance-video').currentTime");await delay(400);
 assert(Math.abs(await js("document.querySelector('.guidance-video').currentTime")-paused)<.1);
 await js("document.querySelectorAll('.guidance-chapter')[1].click()");
 await wait("document.querySelector('.guidance-video').currentTime>=5&&!document.querySelector('.guidance-video').seeking");await capture('real-interface.png');
 await win.reload();await wait("document.querySelector('.guidance-shell')?.dataset.scene==='draw'");
 await wait("document.querySelector('.guidance-video').readyState>=2");
 stage='complete with no operations';await js("(()=>{const v=document.querySelector('.guidance-video');v.playbackRate=4;return v.play()})()");
 await wait("document.querySelector('.guidance-shell').dataset.completed==='true'");
 assert.equal(await js("JSON.parse(localStorage.getItem('rootsound.learning.v1')).guides.basics.status"),'completed');
 assert.deepEqual(await js('__guideTest.downloads'),[]);
 assert.equal(await js("document.querySelectorAll('.guidance-shell .melody-note').length"),0);
 await capture('complete-without-actions.png');
 await click('.guidance-pause');await wait("document.querySelector('.guidance-video').currentTime<2&&!document.querySelector('.guidance-video').paused");
 await click('.guidance-pause');
 stage='optional practice';await click('.guidance-try');await wait("document.querySelector('.guidance-shell').dataset.mode==='practice'");
 assert.equal(await js("document.querySelectorAll('.guidance-shell .melody-note').length"),24);
 await click('.guidance-back');await wait("document.querySelector('.guidance-shell').dataset.mode==='film'");
 await click('.guidance-try');await wait("document.querySelector('.guidance-shell').dataset.mode==='practice'");
 await click('.guidance-shell .song-save-project');await wait("__guideTest.downloads.some(n=>n.endsWith('.rootsound'))");
 await click('.guidance-shell .song-export-audio');await wait("!!document.querySelector('.guidance-shell dialog[open]')");
 await js("[...document.querySelectorAll('.guidance-shell dialog button')].find(n=>n.textContent==='返回').click()");
 await click('.guidance-practice-exit');await wait("!document.querySelector('.guidance-shell')");
 assert.equal(await js("document.querySelectorAll('.web-workspace .melody-note').length"),40);
 stage='automatic advanced film';await click('.web-settings');await js("(()=>{const n=document.querySelector('.learning-feature input');n.checked=true;n.dispatchEvent(new Event('change'))})()");
 await wait("!!document.querySelector('.guidance-video')");await wait("document.querySelector('.guidance-video').readyState>=2");
 await js("(()=>{const v=document.querySelector('.guidance-video');v.playbackRate=4;return v.play()})()");
 await wait("document.querySelector('.guidance-shell').dataset.completed==='true'");
 assert.equal(await js("JSON.parse(localStorage.getItem('rootsound.learning.v1')).guides['tempo-rolls'].status"),'completed');
 await click('.guidance-exit');await wait("!document.querySelector('.guidance-shell')");
 stage='small screen and reduced motion';
 await js("(()=>{const k='rootsound.learning.v1',p=JSON.parse(localStorage.getItem(k));p.guides.basics={status:'new',step:0};localStorage.setItem(k,JSON.stringify(p))})()");
 win.webContents.debugger.attach('1.3');await win.webContents.debugger.sendCommand('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
 win.setContentSize(390,850);await open();await delay(350);
 assert.equal(await js("document.querySelector('.guidance-video').paused"),true);
 assert(await js("[...document.querySelectorAll('.guidance-film-header button,.guidance-film-footer button,.guidance-timeline')].every(n=>{const r=n.getBoundingClientRect();return r.width>0&&r.left>=0&&r.right<=innerWidth&&r.bottom<=innerHeight})"));
 await capture('mobile-film.png');
 stage='media failure fallback';await js("document.querySelector('.guidance-video').src='missing.mp4'");await wait("!document.querySelector('.guidance-error').hidden");
 await click('.guidance-try');await wait("document.querySelector('.guidance-shell').dataset.mode==='practice'");
 assert(await js("['.song-save-project','.song-export-audio','.song-exit','.song-play','.song-stop'].every(s=>{const r=document.querySelector('.guidance-shell '+s).getBoundingClientRect();return r.width>0&&r.left>=0&&r.right<=innerWidth})"));
 await click('.guidance-back');await click('.guidance-exit');
 await wait("!document.querySelector('.guidance-shell')");
 assert.equal(await js("JSON.parse(localStorage.getItem('rootsound.learning.v1')).guides.basics.status"),'skipped');
 await win.reload();await delay(500);assert.equal(await js("!!document.querySelector('.guidance-shell')"),false);
 assert.deepEqual(await js('__guideTest.errors'),[]);assert(!win.isVisible());
 fs.writeFileSync(root+'/report.json',JSON.stringify({passed:true,autoplayMuted:true,noOperationGate:true,noAutomaticPracticeOrMusicFile:true,completeBasicAndAdvancedByTime:true,pauseReplaySeekResume:true,optionalPracticeAndSave:true,cancelExportDoesNotBlock:true,originalScoreUnchanged:true,reducedMotionNoAutoplay:true,mobileControlsFit:true,mediaErrorFallback:true,visibleWindow:false},null,2));win.destroy();app.exit(0);
}catch(error){let diagnostic;try{diagnostic=await win.webContents.executeJavaScript("({scene:document.querySelector('.guidance-shell')?.dataset.scene,video:(()=>{const v=document.querySelector('.guidance-video');return v&&{time:v.currentTime,duration:v.duration,paused:v.paused,state:v.readyState,error:v.error?.message}})(),errors:globalThis.__guideTest?.errors,text:document.querySelector('.guidance-error')?.textContent})");fs.writeFileSync(root+'/failure.png',(await win.webContents.capturePage()).toPNG())}catch{}fs.writeFileSync(root+'/report.json',JSON.stringify({stage,error:String(error),stack:error.stack,diagnostic},null,2));app.exit(1)}})();
`);
const env={...process.env};delete env.ELECTRON_RUN_AS_NODE;
try {
  const result=await new Promise(resolve=>{const child=spawn(path.resolve(process.env.ROOTSOUND_TEST_ELECTRON || '.cache/release-smoke-engine/electron.exe'),[harness],{env,windowsHide:true,stdio:['ignore','pipe','pipe']});
    let log='';child.stdout.on('data',d=>log=(log+d).slice(-4000));child.stderr.on('data',d=>log=(log+d).slice(-4000));child.on('error',e=>resolve({code:1,log:String(e)}));child.on('exit',code=>resolve({code,log}));});
  console.log(await readFile(path.join(evidence,'report.json'),'utf8').catch(()=>result.log));console.log('Evidence: '+evidence);if(result.code)process.exitCode=1;
}finally{server.close()}
