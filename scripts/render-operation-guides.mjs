// Own, permanently hidden production UI. No user desktop, input or music files.
import http from 'node:http';
import path from 'node:path';
import {readFile,writeFile,mkdir,mkdtemp} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {build} from 'vite';
await mkdir('.test-output/rb135',{recursive:true});
const root=await mkdtemp(path.resolve('.test-output/rb135/render-'));
// Only the teaching build exposes state for precise fixtures/assertions. The
// public editor is unchanged and contains no tutorial control API.
await build({configFile:path.resolve('vite.web.config.ts'),build:{outDir:path.resolve('.cache/guide-ui/play')},plugins:[{
 name:'isolated-guide-fixture',transform(code,id){if(id.replaceAll('\\','/').endsWith('/app/web-demo.ts'))return code+'\nObject.defineProperty(globalThis,"__tutorial",{value:{get model(){return model},get editor(){return editor},get transport(){return transport},get runtime(){return runtime}}});';}
}]});
const offline=`window.__guide={now:0,downloads:[],blobs:new Map(),errors:[],picker:0};
window.addEventListener('error',e=>__guide.errors.push(e.message));
window.addEventListener('unhandledrejection',e=>__guide.errors.push(String(e.reason)));
Object.defineProperty(window,'AudioContext',{configurable:true,value:class{constructor(){const audio=new OfflineAudioContext(2,44100,44100);Object.defineProperties(audio,{state:{get:()=> 'running'},currentTime:{get:()=>__guide.now},close:{value:async()=>{}}});return audio;}}});
const makeURL=URL.createObjectURL.bind(URL);URL.createObjectURL=blob=>{const url=makeURL(blob);__guide.blobs.set(url,blob);return url;};
const anchorClick=HTMLAnchorElement.prototype.click;HTMLAnchorElement.prototype.click=function(){if(this.download){__guide.downloads.push({name:this.download,blob:__guide.blobs.get(this.href)});return;}return anchorClick.call(this);};
const inputClick=HTMLInputElement.prototype.click;HTMLInputElement.prototype.click=function(){if(this.type==='file'){__guide.picker++;return;}return inputClick.call(this);};
Element.prototype.setPointerCapture=function(){};`;
const mime={'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.sf2':'application/octet-stream','.wav':'audio/wav'};
const server=http.createServer(async(req,res)=>{try{
 const url=new URL(req.url,'http://localhost');if(!url.pathname.startsWith('/RootSound/')){res.writeHead(404);res.end();return;}
 let relative=decodeURIComponent(url.pathname.slice('/RootSound/'.length));if(relative.endsWith('/'))relative+='index.html';
 const folder=relative==='play/index.html'||relative.startsWith('play/assets/')?'.cache/guide-ui':'.cache/website';
 const filename=path.resolve(folder,relative);if(!filename.startsWith(path.resolve(folder)+path.sep)){res.writeHead(403);res.end();return;}
 let bytes=await readFile(filename);if(relative==='play/index.html')bytes=Buffer.from(bytes.toString().replace('<head>','<head><script>'+offline+'</script>'));
 res.setHeader('Content-Type',mime[path.extname(filename)]||'application/octet-stream');res.end(bytes);
}catch{res.writeHead(404);res.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const config=path.join(root,'config.json');await writeFile(config,JSON.stringify({root,url:'http://127.0.0.1:'+server.address().port+'/RootSound/play/'}));
console.log('Render directory: '+root);
const env={...process.env};delete env.ELECTRON_RUN_AS_NODE;
try{
 const code=await new Promise(resolve=>{const child=spawn(path.resolve('.cache/release-smoke-engine/electron.exe'),[path.resolve('scripts/operation-guides-renderer.cjs'),config],{env,windowsHide:true,stdio:['ignore','pipe','pipe']});child.stdout.on('data',d=>process.stdout.write(d));child.stderr.on('data',d=>process.stderr.write(d));child.on('error',()=>resolve(1));child.on('exit',resolve);});
 const report=await readFile(path.join(root,'report.json'),'utf8');console.log(report);if(code)process.exitCode=1;else await writeFile('.test-output/rb135/latest.json',JSON.stringify({root}));
}finally{server.close();}
