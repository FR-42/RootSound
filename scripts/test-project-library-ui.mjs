// Real renderer in a hidden offscreen window; no user desktop or audio device.
import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import { spawn } from 'node:child_process';
import { build } from 'vite';

const base = path.resolve(process.argv[2] ?? '.test-output/library-folders'); await fs.mkdir(base, { recursive: true });
const sourceRoot = path.resolve(process.argv[3] ?? '.');
const evidence = await fs.mkdtemp(path.join(base, 'ui-')), output = path.join(evidence, 'build');
const entry = process.argv[3] ? path.join(sourceRoot, '.qa-library/index.html') : path.join(evidence, 'index.html');
await fs.mkdir(path.dirname(entry), { recursive: true });
await fs.writeFile(entry, `<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><body><main id="app" class="welcome"><div class="wordmark">RootSound</div><section class="invitation"><h1>你好，你想创作什么？</h1><button id="start" class="primary">开始</button></section></main><script type="module">
import {mountProjectLibrary} from '/src/workstation/modules/ui-rendering/project-library.ts';
import '/src/workstation/modules/ui-rendering/studio.css'; import '/src/workstation/modules/ui-rendering/theme.css';
const root='D:/RootSound/project', folder=root+'/my music', midiFolder=root+'/MIDI';
window.fixture={opened:[],browsed:[],errors:[],root,folder,midiFolder};addEventListener('error',e=>fixture.errors.push(e.message));addEventListener('unhandledrejection',e=>fixture.errors.push(String(e.reason)));
let project={kind:'project',id:'p',name:'我的歌曲',path:folder+'/我的歌曲.rootsound'};
const pages={
 [root]:{root,path:root,entries:[{kind:'folder',name:'my music',path:folder},{kind:'folder',name:'MIDI',path:midiFolder},{kind:'folder',name:'空文件夹',path:root+'/空文件夹'}]},
 [folder]:{root,path:folder,parent:root,entries:[project,{kind:'midi',name:'参考乐曲',path:folder+'/参考乐曲.mid'}]},
 [midiFolder]:{root,path:midiFolder,parent:root,entries:Array.from({length:448},(_,i)=>({kind:'midi',name:'MIDI 乐曲 '+(i+1),path:midiFolder+'/'+(i+1)+'.mid'}))},
 [root+'/空文件夹']:{root,path:root+'/空文件夹',parent:root,entries:[]},
};
window.library=mountProjectLibrary(document.querySelector('#app'),document.querySelector('#start'),{
 browse:async(path=root)=>{fixture.browsed.push(path);await new Promise(r=>setTimeout(r,5));return structuredClone(pages[path]);},
 list:async()=>{throw Error('Unexpected recursive scan')},open:async path=>{fixture.opened.push(path??'picker');},
 rename:async(old,name)=>{project={...old,kind:'project',name,path:folder+'/'+name+'.rootsound'};pages[folder].entries[0]=project;return project;},
 remove:async()=>{pages[folder].entries=pages[folder].entries.filter(e=>e.kind!=='project');},
},()=>{fixture.newProject=true},100);
document.querySelector('#start').onclick=()=>library.open();window.fixtureReady=true;
</script></body></html>`);
await build({ root: sourceRoot, configFile: false, publicDir: false, base: './', logLevel: 'error', build: { outDir: output, emptyOutDir: true, rollupOptions: { input: entry } } });
const html = (await fs.readdir(output, { recursive: true })).find(p => p.endsWith('index.html'));
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'application/javascript', '.css': 'text/css' };
const server = http.createServer(async (req, res) => { try {
  const filename = path.resolve(output, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
  if (!filename.startsWith(output + path.sep)) throw Error('outside fixture');
  res.setHeader('Content-Type', mime[path.extname(filename)] ?? 'application/octet-stream'); res.end(await fs.readFile(filename));
} catch { res.writeHead(404); res.end(); } });
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const url = 'http://127.0.0.1:' + server.address().port + '/' + html.replaceAll('\\', '/');
const harness = path.join(evidence, 'qa.cjs');
await fs.writeFile(harness, `const {app,BrowserWindow}=require('electron'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const evidence=${JSON.stringify(evidence)},url=${JSON.stringify(url)};app.setPath('userData',path.join(evidence,'profile'));app.commandLine.appendSwitch('disable-gpu');
const delay=ms=>new Promise(r=>setTimeout(r,ms));let win,checks=0,stage='start';
(async()=>{try{await app.whenReady();win=new BrowserWindow({show:false,width:1100,height:850,webPreferences:{offscreen:true,contextIsolation:true,sandbox:true,backgroundThrottling:false}});
 const js=code=>win.webContents.executeJavaScript(code);const check=(value,label)=>{assert(value,label);checks++};
 async function wait(code){for(let i=0;i<200;i++){if(await js(code).catch(()=>false))return;await delay(20)}throw Error('Timeout '+stage)};
 const click=selector=>js('document.querySelector('+JSON.stringify(selector)+').click()');
 const capture=async name=>{await delay(100);win.webContents.invalidate();await delay(60);fs.writeFileSync(path.join(evidence,name),(await win.webContents.capturePage()).toPNG())};
 await win.loadURL(url);await wait('window.fixtureReady');await delay(150);stage='root';await click('#start');await wait("document.querySelectorAll('.project-library-folder').length===3");
 check(await js("document.querySelectorAll('.project-library-song,.project-library-midi').length===0"),'root is not flattened');check(await js("[...document.querySelectorAll('.project-library h2,.project-library-navigation button')].filter(n=>n.textContent==='乐曲库'&&!n.closest('[hidden]')).length===1"),'single library title');check(await js("getComputedStyle(document.querySelector('.project-library-folder')).borderTopWidth==='0px'"),'rows have no file boxes');check(await js("!document.querySelector('.project-library-columns,.project-library-count')"),'no column labels or item count');check(await js("getComputedStyle(document.querySelector('.project-library-folder'),'::before').maskImage!=='none'&&['none','normal'].includes(getComputedStyle(document.querySelector('.project-library-folder'),'::after').content)"),'left icons without a type column');await capture('root.png');
 stage='folder';await click('.project-library-grid button[aria-label="打开文件夹 my music"]');await wait("document.querySelectorAll('.project-library-midi').length===1");
 check(await js("document.querySelector('.project-library-song').textContent==='我的歌曲'"),'project visible');check(await js("!document.querySelector('.project-library-midi').draggable"),'MIDI cannot be dragged to project deletion');
 await capture('folder.png');check(await js("(()=>{const n=document.querySelector('.project-library-navigation button');n.focus();const event=new KeyboardEvent('keydown',{bubbles:true,cancelable:true,key:'Tab'});n.dispatchEvent(event);return !event.defaultPrevented})()"),'folder navigation participates in keyboard focus');await click('.project-library-midi');await delay(40);check(await js("fixture.opened[0]===fixture.folder+'/参考乐曲.mid'"),'MIDI opens exact path');
 stage='rename';await js("document.querySelector('.project-library-song').dispatchEvent(new MouseEvent('dblclick',{bubbles:true,cancelable:true}))");await wait("!!document.querySelector('.project-library-name')");
 check(await js("(()=>{const n=document.querySelector('.project-library-name'),e=new KeyboardEvent('keydown',{bubbles:true,cancelable:true,key:'ArrowRight'});n.focus();n.dispatchEvent(e);return !e.defaultPrevented&&document.querySelector('.project-library-name')===n})()"),'rename keeps arrow-key text editing');
 await js("(()=>{const n=document.querySelector('.project-library-name');n.value='新的名字';n.dispatchEvent(new KeyboardEvent('keydown',{bubbles:true,key:'Enter'}))})()");await wait("document.querySelector('.project-library-song')?.textContent==='新的名字'");checks++;
 stage='delete';await js("(()=>{const dataTransfer=new DataTransfer();document.querySelector('.project-library-song').dispatchEvent(new DragEvent('dragstart',{bubbles:true,dataTransfer}));document.querySelector('.project-library-trash').dispatchEvent(new DragEvent('drop',{bubbles:true,cancelable:true,dataTransfer}))})()");await wait("!document.querySelector('.project-delete-overlay').hidden");
 await click('button[aria-label="确认彻底删除乐曲"]');await wait("document.querySelectorAll('.project-library-song').length===0");checks++;
 await click('button[aria-label="关闭乐曲库"]');await click('#start');await wait("document.querySelectorAll('.project-library-midi').length===1&&!document.querySelector('.project-library-overlay').hidden");checks++;
 stage='many';await click('button[aria-label="返回上级文件夹"]');await wait("document.querySelectorAll('.project-library-folder').length===3");const start=Date.now();await click('.project-library-grid button[aria-label="打开文件夹 MIDI"]');await wait("document.querySelectorAll('.project-library-midi').length===12");const renderFirstPageMs=Date.now()-start;checks++;
 check(await js("document.querySelector('.project-library-pagination span').textContent==='/ 38'&&getComputedStyle(document.querySelector('.project-library-footer')).borderTopWidth==='0px'"),'page count without divider');check(await js("(()=>{const n=document.querySelector('.project-library-grid'),p=document.querySelector('input[aria-label=页码]').value,e=new WheelEvent('wheel',{bubbles:true,cancelable:true,deltaY:500});n.dispatchEvent(e);return e.defaultPrevented&&n.scrollTop===0&&document.querySelector('input[aria-label=页码]').value===p})()"),'wheel neither scrolls nor changes page');await capture('midi-folder.png');
 await click('button[aria-label="下一页"]');check(await js("document.querySelector('.project-library-midi').textContent==='MIDI 乐曲 13'"),'next page');await click('button[aria-label="上一页"]');check(await js("document.querySelector('.project-library-midi').textContent==='MIDI 乐曲 1'"),'previous page');
 await js("(()=>{const n=document.querySelector('.project-library-midi');n.focus();n.dispatchEvent(new KeyboardEvent('keydown',{bubbles:true,cancelable:true,key:'ArrowRight'}))})()");check(await js("document.querySelector('input[aria-label=页码]').value==='2'&&document.querySelector('.project-library-midi').textContent==='MIDI 乐曲 13'"),'right arrow advances');
 await js("document.dispatchEvent(new KeyboardEvent('keydown',{bubbles:true,cancelable:true,key:'ArrowLeft'}))");check(await js("document.querySelector('input[aria-label=页码]').value==='1'"),'left arrow returns');
 await js("document.dispatchEvent(new KeyboardEvent('keydown',{bubbles:true,cancelable:true,key:'ArrowLeft'}))");check(await js("document.querySelector('input[aria-label=页码]').value==='38'"),'left arrow wraps from first to last');
 await js("document.dispatchEvent(new KeyboardEvent('keydown',{bubbles:true,cancelable:true,key:'ArrowRight'}))");check(await js("document.querySelector('input[aria-label=页码]').value==='1'"),'right arrow wraps from last to first');
 check(await js("(()=>{const n=document.querySelector('input[aria-label=页码]'),e=new KeyboardEvent('keydown',{bubbles:true,cancelable:true,key:'ArrowRight'});n.focus();n.dispatchEvent(e);return !e.defaultPrevented&&n.value==='1'})()"),'page input keeps arrow-key editing');
 check(await js("(()=>{document.querySelector('.project-library-midi').focus();const e=new KeyboardEvent('keydown',{bubbles:true,cancelable:true,key:'ArrowRight',altKey:true});document.dispatchEvent(e);return !e.defaultPrevented&&document.querySelector('input[aria-label=页码]').value==='1'})()"),'modified arrows are not captured');
 await js("(()=>{const n=document.querySelector('input[aria-label=页码]');n.value='38';n.dispatchEvent(new Event('change',{bubbles:true}))})()");check(await js("document.querySelectorAll('.project-library-midi').length===4&&!document.querySelector('button[aria-label=下一页]').disabled"),'final page stays navigable');await capture('last-page.png');
 await click('button[aria-label="下一页"]');check(await js("document.querySelector('input[aria-label=页码]').value==='1'"),'next button wraps from final page');
 await click('button[aria-label="上一页"]');check(await js("document.querySelector('input[aria-label=页码]').value==='38'"),'previous button wraps from first page');
 await js("(()=>{const n=document.querySelector('.project-library-midi');n.focus();n.dispatchEvent(new KeyboardEvent('keydown',{bubbles:true,cancelable:true,key:'ArrowRight'}))})()");check(await js("document.querySelector('input[aria-label=页码]').value==='1'"),'right arrow wraps at final page');
 await js("document.dispatchEvent(new KeyboardEvent('keydown',{bubbles:true,cancelable:true,key:'ArrowLeft'}))");check(await js("document.querySelector('input[aria-label=页码]').value==='38'"),'left arrow restores final page');
 await click('button[aria-label="关闭乐曲库"]');await click('#start');await wait("document.querySelector('input[aria-label=页码]').value==='38'&&document.querySelectorAll('.project-library-midi').length===4&&document.querySelector('.project-library').getAttribute('aria-busy')==='false'");checks++;
 await js("(()=>{const n=document.querySelector('input[aria-label=页码]');n.value='1';n.dispatchEvent(new Event('change',{bubbles:true}))})()");
 win.setContentSize(390,820);await delay(120);check(await js("(()=>{const r=document.querySelector('.project-library').getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&r.bottom<=innerHeight})()"),'narrow dialog fits');await capture('narrow.png');
 win.setContentSize(390,420);await wait("document.querySelectorAll('.project-library-midi').length<12");await delay(80);check(await js("(()=>{const n=document.querySelector('.project-library-grid'),last=n.lastElementChild;return n.scrollHeight<=n.clientHeight+1&&last.getBoundingClientRect().bottom<=n.getBoundingClientRect().bottom+1&&getComputedStyle(n).overflowY==='hidden'})()"),'short window uses fewer rows with no scrolling or clipping');await capture('short-window.png');
 win.setContentSize(1100,850);await wait("document.querySelectorAll('.project-library-midi').length===12");checks++;
 await click('button[aria-label="返回上级文件夹"]');await wait("document.querySelectorAll('.project-library-folder').length===3");await click('.project-library-grid button[aria-label="打开文件夹 空文件夹"]');await wait("document.querySelector('.project-library-note')?.textContent.includes('还没有')");checks++;
 await click('button[aria-label="关闭乐曲库"]');check(await js("(()=>{const e=new KeyboardEvent('keydown',{bubbles:true,cancelable:true,key:'ArrowRight'});document.dispatchEvent(e);return !e.defaultPrevented})()"),'closed library does not consume arrows');
 check((await js('fixture.errors')).length===0,'no renderer errors');check(!win.isVisible(),'window stayed hidden');fs.writeFileSync(path.join(evidence,'report.json'),JSON.stringify({passed:true,checks,renderFirstPageMs,paginatedEntries:448,pageSize:12,visibleWindow:false,physicalAudio:false},null,2));win.destroy();app.exit(0);
}catch(error){try{fs.writeFileSync(path.join(evidence,'failure.png'),(await win.webContents.capturePage()).toPNG())}catch{}fs.writeFileSync(path.join(evidence,'report.json'),JSON.stringify({stage,error:String(error),stack:error.stack},null,2));app.exit(1)}})();`);
const env = { ...process.env }; delete env.ELECTRON_RUN_AS_NODE;
try {
  const result = await new Promise((resolve, reject) => {
    const child = spawn(path.resolve('.cache/release-smoke-engine/electron.exe'), [harness], { env, windowsHide: true, stdio: ['ignore', 'ignore', 'pipe'] });
    let error = ''; child.stderr.on('data', b => { error = (error + b).slice(-2000); }); child.once('error', reject); child.once('exit', code => resolve({ code, error }));
  });
  console.log(await fs.readFile(path.join(evidence, 'report.json'), 'utf8').catch(() => JSON.stringify(result))); console.log('Evidence: ' + evidence); if (result.code) process.exitCode = result.code;
} finally { server.close(); }
