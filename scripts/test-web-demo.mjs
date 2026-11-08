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
const inputClick=HTMLInputElement.prototype.click;
HTMLInputElement.prototype.click=function(){
  if(this.type!=='file') return inputClick.call(this);
  const fixture=__webTest.nextFile; __webTest.nextFile=undefined;
  if(!fixture) { this.dispatchEvent(new Event('cancel')); return; }
  Object.defineProperty(this,'files',{value:[fixture]});
  this.dispatchEvent(new Event('change'));
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
 const frame=win.webContents.mainFrame.frames.find(f=>f.url.includes('/play/'));
 const parentJs=code=>win.webContents.executeJavaScript('(async()=>('+code+'))()');
 const js=code=>{expression=code;return frame.executeJavaScript('(async()=>('+code+'))()');};
 const click=selector=>js("document.querySelector("+JSON.stringify(selector)+").click()");
 const ready=selector=>wait(()=>js("!!document.querySelector("+JSON.stringify(selector)+")"));
 const key=name=>js("document.body.dispatchEvent(new KeyboardEvent('keydown',{key:"+JSON.stringify(name)+",bubbles:true,cancelable:true}))");
 const library=async()=>{await click('.welcome-actions button');await ready('.project-library-overlay:not([hidden]) .project-library-custom');};
 const exit=async()=>{await click('.song-exit');await ready('.welcome-actions');};
 const file=async(name,text)=>{
   await js("__webTest.nextFile=new File(["+JSON.stringify(text)+"],"+JSON.stringify(name)+")");
   await click('.project-library-custom');await ready('.song-topbar');
 };
 const savedFile=async(extension)=>{
   await wait(()=>js("__webTest.downloads.some(item=>item.name.endsWith("+JSON.stringify(extension)+"))"));
   return js("__webTest.downloads.find(item=>item.name.endsWith("+JSON.stringify(extension)+")).blob.text()");
 };
 await ready('.welcome-actions');
 assert.equal(await js("document.querySelector('.invitation h1').textContent"),'你好，你想创作什么？');
 assert.equal(await js("document.querySelector('.music-guide-launch').textContent"),'操作引导');
 assert.equal(await js("document.querySelectorAll('.web-studio,.web-toolbar').length"),0);
 assert.equal(await parentJs("document.querySelectorAll('.music-editor').length"),1);
 assert.equal(await parentJs("document.querySelector('.guide-entry').textContent"),'操作引导');
 assert.equal(await js('__webTest.audioCreated'),0);

 stage='shared welcome, library and editor';
 await library();await ready('.project-library-song');await click('.project-library-song');await ready('.song-topbar');
 assert.deepEqual(await js("[...document.querySelectorAll('.song-file-actions button')].map(n=>n.textContent)"),['导出音频','设置','保存','退出']);
 assert.equal(await js("document.querySelector('.melody-tempo-button').textContent"),'148');
 assert.equal(await js("document.querySelectorAll('.melody-key').length"),128);
 await click('.melody-add-note-family');await ready('.melody-tone-library[open]');
 assert.equal(await js("document.querySelectorAll('.melody-library-tone').length"),175);
 assert.equal(await js("!!document.querySelector('.melody-library-import')"),true);
 await click('.melody-library-close');
 await wait(()=>js("!document.querySelector('.melody-tone-library[open]')"));
 await click('.song-settings');await ready('.learning-settings[open]');await click('.learning-settings header button');
 await wait(()=>js("!document.querySelector('.learning-settings[open]')"));

 stage='homepage guide and unsaved draft';
 await js("document.querySelector('.song-project-name').dispatchEvent(new MouseEvent('dblclick',{bubbles:true}))");
 await ready('.song-project-name-input');
 const name='网页一致性测试';
 await js("(()=>{const input=document.querySelector('.song-project-name-input');input.value="+JSON.stringify(name)+";input.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true,cancelable:true}))})()");
 await wait(()=>js("document.querySelector('.song-project-name')?.textContent==="+JSON.stringify(name)));
 await parentJs("document.querySelector('.guide-entry').click()");await ready('.music-guide[data-step="1"] .music-guide-word');
 assert.equal(await js("document.querySelector('.music-guide-word').textContent"),'卷帘');
 await key('Enter');await ready('.music-guide[data-step="2"] .music-guide-word');
 await key('Escape');await ready('.song-topbar');
 assert.equal(await js("document.querySelector('.song-project-name').textContent"),name);
 await click('.song-save-project');
 const original=await savedFile('.rootsound');
 const workspace=JSON.parse(original);
 assert.equal(workspace.name,name);
 const notes=JSON.parse(workspace.libraryText).contents.find(record=>record.kind==='rootsound.phrase').body.parts.flatMap(part=>part.notes);
 assert.equal(notes.length,40);
 assert.equal(await js('__webTest.audioCreated'),0);

 stage='desktop WAV export dialog';
 await click('.song-export-audio');await ready('.audio-export-progress');
 await click('.settings-dialog[open] .primary');
 await wait(()=>js("__webTest.downloads.some(item=>item.name.endsWith('.wav'))"));
 const wave=await js("(async()=>{const item=__webTest.downloads.find(item=>item.name.endsWith('.wav'));const bytes=await item.blob.arrayBuffer(),view=new DataView(bytes);return {size:bytes.byteLength,rate:view.getUint32(24,true),bits:view.getUint16(34,true)}})()");
 assert(wave.size>44);assert.equal(wave.rate,48000);assert.equal(wave.bits,24);
 await click('.settings-dialog[open] .secondary');
 await wait(()=>js("!document.querySelector('.settings-dialog[open]')"));

 stage='create and reopen using the shared library';
 await exit();await library();await click('.project-library-new');await ready('#project-start-name');
 await js("(()=>{const input=document.querySelector('#project-start-name');input.value='新建测试';input.dispatchEvent(new Event('input'))})()");
 await click('.project-start-submit');await ready('.song-topbar');
 assert.equal(await js("document.querySelector('.song-project-name').textContent"),'新建测试');
 assert.equal(await js("document.querySelectorAll('.melody-note').length"),0);
 await exit();await library();await file(name+'.rootsound',original);
 assert.equal(await js("document.querySelector('.song-project-name').textContent"),name);
 await js('__webTest.downloads=[]');await click('.song-save-project');
 assert.equal(JSON.parse(await savedFile('.rootsound')).name,name);

 stage='source MIDI and narrow layout';
 await exit();await library();
 const midi=[77,84,104,100,0,0,0,6,0,0,0,1,1,224,77,84,114,107,0,0,0,16,0,0xc0,19,0,0x90,60,100,0x83,0x60,0x80,60,0,0,255,47,0];
 await js("__webTest.nextFile=new File([Uint8Array.from("+JSON.stringify(midi)+")],'原格式.mid')");
 await click('.project-library-custom');await ready('.song-topbar');
 await js('__webTest.downloads=[]');await click('.song-save-project');
 await wait(()=>js("__webTest.downloads.some(item=>item.name==='原格式.mid')"));
 const roundtrip=await js("(async()=>[...new Uint8Array(await __webTest.downloads[0].blob.arrayBuffer())])()");
 assert.deepEqual(roundtrip,midi);
 win.setContentSize(390,950);await delay(100);
 assert(await parentJs('document.documentElement.scrollWidth<=innerWidth'));
 assert(await js("document.querySelector('.melody-roll').getBoundingClientRect().width>110"));
 assert(await js("document.documentElement.scrollWidth<=innerWidth"));
 assert.deepEqual(await js('__webTest.errors'),[]);

 stage='direct guide link and compact touch controls';
 await win.loadURL(origin+'/RootSound/play/?guide=1');
 await wait(()=>parentJs("document.querySelector('.music-guide-word')?.textContent==='卷帘'"));
 assert(await parentJs("document.querySelector('.music-guide-touch').getBoundingClientRect().width>0"));
 for(let step=2;step<=10;step++){
   await parentJs("document.querySelector('.music-guide-touch button:nth-child(2)').click()");
   await wait(()=>parentJs("Number(document.querySelector('.music-guide')?.dataset.step)==="+step));
 }
 await parentJs("document.querySelector('.music-guide-touch button:nth-child(2)').click()");
 await wait(()=>parentJs("!!document.querySelector('.welcome-actions')"));
 assert.deepEqual(rendererErrors,[]);assert(!win.isVisible());
 fs.writeFileSync(root+'/report.json',JSON.stringify({passed:true,welcome:true,library:true,desktopToolbar:true,voices:175,guideStages:10,draftPreserved:true,nativeDownload:true,midiUnchanged:true,wave,visibleWindow:false,physicalAudio:false},null,2));win.destroy();app.exit(0);
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
