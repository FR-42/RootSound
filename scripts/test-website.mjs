// Static-site QA in a permanently hidden renderer; no desktop or audio device.
import http from 'node:http';
import {readFile,writeFile,mkdir,mkdtemp,stat} from 'node:fs/promises';
import path from 'node:path';
import {spawn} from 'node:child_process';
await mkdir('.test-output/rb127',{recursive:true});
const root=await mkdtemp(path.resolve('.test-output/rb127/site-'));
const mime={'.html':'text/html','.css':'text/css','.js':'application/javascript','.json':'application/json','.webp':'image/webp','.svg':'image/svg+xml','.png':'image/png','.mp3':'audio/mpeg','.mid':'audio/midi'};
const server=http.createServer(async(req,res)=>{
  try{
    const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    if(pathname==='/release-fixture'){
      res.setHeader('Access-Control-Allow-Origin','*');
      if(req.headers['x-test-release']!=='future'){res.writeHead(503);res.end('{}');return;}
      const assets=['RootSound-Windows-x64-test-next.zip','RootSound-macOS-arm64-test-next.zip','SHA256SUMS.txt'].map(name=>({name,size:1000000,browser_download_url:'https://github.com/FR-42/RootSound/releases/download/test-next/'+name}));
      res.setHeader('Content-Type','application/json');res.end(JSON.stringify([{draft:false,assets}]));return;
    }
    if(!pathname.startsWith('/RootSound/')){res.writeHead(404);res.end();return;}
    const file=path.resolve('website',pathname.slice('/RootSound/'.length)||'index.html');
    if(!file.startsWith(path.resolve('website')+path.sep)){res.writeHead(403);res.end();return;}
    const bytes=await readFile(file);res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');res.end(bytes);
  }catch{res.writeHead(404);res.end();}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin='http://127.0.0.1:'+server.address().port;
const cardHTML=`<style>*{box-sizing:border-box}body{margin:0;background:#faf9f6;color:#252a30;font-family:Segoe UI,Microsoft YaHei,sans-serif;padding:44px 55px;overflow:hidden}.brand{display:flex;align-items:center;gap:12px;font-size:28px;font-weight:600}.brand img{width:46px;height:46px}h1{font-size:43px;letter-spacing:-1.5px;margin:22px 0 7px;font-weight:600}p{font-size:17px;color:#626972;margin:0 0 29px}.product{width:100%;border:1px solid #d5d9e1;border-radius:10px;box-shadow:0 12px 35px #252a3010}</style><div class="brand"><img src="${origin}/RootSound/assets/icon.svg">RootSound</div><h1>让想法，变成自己的音乐。</h1><p>直观的音乐编辑器 · Windows / Mac 开发预览版</p><img class="product" src="${origin}/RootSound/assets/workspace.webp">`;
const harness=path.join(root,'test.cjs');
await writeFile(harness,`
const {app,BrowserWindow,session}=require('electron'),fs=require('node:fs'),assert=require('node:assert/strict');
const root=${JSON.stringify(root)},origin=${JSON.stringify(origin)};app.setPath('userData',root+'/profile');app.commandLine.appendSwitch('disable-gpu');app.commandLine.appendSwitch('force-device-scale-factor','1');
const delay=ms=>new Promise(r=>setTimeout(r,ms));async function wait(check){for(let i=0;i<200;i++){if(await check())return;await delay(20)}throw Error('Page timeout')}
(async()=>{try{
 await app.whenReady();let future=false;
 session.defaultSession.webRequest.onBeforeRequest({urls:['https://*/*']},(details,callback)=>callback(details.url.startsWith('https://api.github.com/')?{redirectURL:origin+'/release-fixture'}:{cancel:true}));
 session.defaultSession.webRequest.onBeforeSendHeaders({urls:[origin+'/release-fixture']},(details,callback)=>callback({requestHeaders:{...details.requestHeaders,'X-Test-Release':future?'future':'offline'}}));
 const win=new BrowserWindow({show:false,width:1440,height:1000,webPreferences:{backgroundThrottling:false,contextIsolation:true,sandbox:true}});
 let errors=[];win.webContents.on('console-message',(_e,level,message)=>{if(level>=3&&!message.includes('503'))errors.push(message)});
 const js=code=>win.webContents.executeJavaScript('(async()=>{try{return ('+code+')}catch(error){return {testError:String(error),testStack:error.stack}}})()').then(value=>{if(value?.testError)throw Error(value.testError+' in '+code.slice(0,140));return value}).catch(error=>{throw Error(error.message+'; expression: '+code.slice(0,140)+'; console: '+JSON.stringify(errors))});
 await win.loadURL(origin+'/RootSound/');await wait(()=>js("!document.querySelector('.play-button').disabled"));
 assert.equal(await js("document.querySelector('[data-platform=windows]').href.includes('preview261103')"),true,'last release survives API failure');
 const layout=[];
 for(const width of [1440,768,390,320]){
   win.setContentSize(width,1000);await delay(80);
   const metrics=await js("({width:innerWidth,scroll:document.documentElement.scrollWidth,images:[...document.images].every(i=>i.complete&&i.naturalWidth>0),buttons:[...document.querySelectorAll('button')].every(b=>b.getAttribute('aria-label')||b.textContent.trim())})");
   assert(metrics.scroll<=metrics.width,JSON.stringify(metrics));assert(metrics.images,'images load');assert(metrics.buttons);layout.push(metrics);
   if(width===1440||width===390){const height=await js('document.documentElement.scrollHeight');win.setContentSize(width,height);await delay(120);fs.writeFileSync(root+'/page-'+width+'.png',(await win.webContents.capturePage()).toPNG());}
 }
 const audioDecoded=await js("(async()=>{const context=new OfflineAudioContext(2,1,48000),out=[];for(const name of ['piano','musicbox']){const bytes=await (await fetch('assets/demo-'+name+'.mp3')).arrayBuffer(),audio=await context.decodeAudioData(bytes);let peak=0;for(const sample of audio.getChannelData(0))peak=Math.max(peak,Math.abs(sample));out.push({name,duration:audio.duration,peak})}return out})()");
 assert(audioDecoded.every(a=>a.duration>9&&a.duration<11&&a.peak>.1));
 // Exercise controls with a media stub; decoded files above use offline audio only.
 await js("(()=>{const a=document.querySelector('audio');let paused=true,position=0;Object.defineProperties(a,{paused:{get:()=>paused},duration:{get:()=>9.67},currentTime:{get:()=>position,set:v=>position=v},ended:{get:()=>false}});a.play=async()=>{paused=false;a.dispatchEvent(new Event('play'))};a.pause=()=>{paused=true;a.dispatchEvent(new Event('pause'))};a.load=()=>queueMicrotask(()=>a.dispatchEvent(new Event('loadedmetadata')))})()");
 await js("document.querySelector('.play-button').click()");await delay(40);
 assert.equal(await js("document.querySelector('.play-button').getAttribute('aria-pressed')"),'true');
 await js("(()=>{const s=document.querySelector('.audio-seek');s.value='400';s.dispatchEvent(new Event('input'));document.querySelector('[name=tone][value=musicbox]').click()})()");await delay(40);
 assert.equal(await js("document.querySelector('audio').currentTime>3"),true);
 assert.equal(await js("document.querySelector('.play-button').getAttribute('aria-pressed')"),'true');
 assert.equal(await js("document.querySelector('audio').src.endsWith('demo-musicbox.mp3')"),true);
 await js("document.querySelector('.play-button').click()");assert.equal(await js("document.querySelector('.play-button').getAttribute('aria-pressed')"),'false');
 await js("document.querySelector('details summary').click()");assert.equal(await js("document.querySelector('details').open"),true);
 future=true;await js('sessionStorage.clear()');await win.reload();await wait(()=>js("document.querySelector('[data-release-version]').textContent==='test-next'"));
 assert.equal(await js("document.querySelector('[data-platform=mac]').href.endsWith('RootSound-macOS-arm64-test-next.zip')"),true);
 // Link preview is code-drawn from the genuine UI image, not a fabricated product UI.
 await win.loadURL('about:blank');win.setContentSize(1200,630);
 await js("(()=>{document.documentElement.lang='zh-CN';document.body.innerHTML="+JSON.stringify(${JSON.stringify(cardHTML)})+"})()");
 await wait(()=>js('[...document.images].every(i=>i.complete&&i.naturalWidth>0)'));await delay(100);
 fs.writeFileSync(${JSON.stringify(path.resolve('website/assets/social-card.png'))},(await win.webContents.capturePage()).toPNG());
 assert(!win.isVisible());assert.equal(errors.length,0,JSON.stringify(errors));
 fs.writeFileSync(root+'/report.json',JSON.stringify({passed:true,layout,audioDecoded,controls:true,releaseFallback:true,releaseUpdate:true,visibleWindow:false,audioDeviceOpened:false},null,2));win.destroy();app.exit(0);
}catch(error){fs.writeFileSync(root+'/report.json',JSON.stringify({error:error.stack}));app.exit(1)}})();
`);
const env={...process.env};delete env.ELECTRON_RUN_AS_NODE;
try{
const code=await new Promise(resolve=>{const child=spawn(path.resolve('.cache/release-smoke-engine/electron.exe'),[harness],{env,windowsHide:true,stdio:'ignore'});child.on('error',()=>resolve(1));child.on('exit',resolve)});
console.log(await readFile(path.join(root,'report.json'),'utf8'));console.log('Preview images: '+root);if(code)process.exitCode=1;
}finally{server.close()}
