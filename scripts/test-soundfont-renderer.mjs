// Permanently hidden Chromium fixture; offline clocks only, no user files or audio device.
import {mkdir,writeFile,readFile,mkdtemp} from 'node:fs/promises';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {createServer} from 'vite';
await mkdir('.test-output/rb125',{recursive:true});
const directory=await mkdtemp(path.resolve('.test-output/rb125/font-'));
await writeFile(path.join(directory,'index.html'),'<!doctype html><html><body>offline fixture</body></html>');
const server=await createServer({configFile:false,root:process.cwd(),server:{host:'127.0.0.1',port:0,hmr:false,headers:{'Content-Security-Policy':"default-src 'self'; script-src 'self' 'wasm-unsafe-eval'; worker-src 'self' blob:; style-src 'self' 'unsafe-inline'; connect-src 'self'"},watch:{ignored:['**/.test-output/**','**/.cache/**','**/legacy/**','**/project/**','**/release/**']}},worker:{format:'es'}});
await server.listen();
const url=server.resolvedUrls.local[0]+path.relative(process.cwd(),path.join(directory,'index.html')).replaceAll('\\','/');
const harness=path.join(directory,'harness.cjs'),report=path.join(directory,'report.json');
await writeFile(harness,`
const {app,BrowserWindow}=require('electron'),fs=require('node:fs');
app.setPath('userData',${JSON.stringify(path.join(directory,'profile'))});app.commandLine.appendSwitch('disable-gpu');
app.whenReady().then(async()=>{
 const window=new BrowserWindow({show:false,webPreferences:{backgroundThrottling:false}});
 const errors=[];window.webContents.on('console-message',(_event,_level,message)=>errors.push(message));
 try {
  await window.loadURL(${JSON.stringify(url)});
  const result=await window.webContents.executeJavaScript(
   'import("/scripts/soundfont-renderer-fixture.ts").then(module=>module.run()).catch(error=>({error:String(error),message:error?.message,name:error?.name,keys:Object.getOwnPropertyNames(error??{})}))' 
  );
  if(result.error)throw Error(JSON.stringify(result));if(window.isVisible())throw Error('test window became visible');
  fs.writeFileSync(${JSON.stringify(report)},JSON.stringify({...result,visibleWindow:false,physicalAudio:false},null,2));app.exit(0);
 }catch(error){fs.writeFileSync(${JSON.stringify(report)},JSON.stringify({error:String(error),stack:error?.stack,console:errors}));app.exit(1);}
});
setTimeout(()=>app.exit(2),45000);
`);
try{
 const env={...process.env};delete env.ELECTRON_RUN_AS_NODE;
 const result=await new Promise(resolve=>{const child=spawn(path.resolve('.cache/release-smoke-engine/electron.exe'),[harness],{env,windowsHide:true,stdio:['ignore','pipe','pipe']});let output='';child.stdout.on('data',b=>output=(output+b).slice(-3000));child.stderr.on('data',b=>output=(output+b).slice(-3000));child.on('error',e=>resolve({code:1,output:String(e)}));child.on('exit',code=>resolve({code,output}));});
 console.log(await readFile(report,'utf8').catch(()=>JSON.stringify(result)));if(result.code!==0)process.exitCode=1;
}finally{await server.close();}
