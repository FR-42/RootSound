// Isolated hidden renderer; offline audio only, no desktop input or user files.
import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { createServer } from 'vite';
const root=await fs.mkdtemp(path.resolve('.test-output/midi-expression-ui-'));
await fs.writeFile(path.join(root,'index.html'),`<!doctype html><html><body><main id="app"></main><script type="module">
import {writeMidi} from 'midi-file';
import {readMusicFile} from '/src/workstation/app/music-file.ts';
import {createMaterialLibrary} from '/src/workstation/modules/materials/public.ts';
import {createTimbrePlayback} from '/src/workstation/modules/timbre/public.ts';
import {createPhraseEditor,createPhrasePlayback} from '/src/workstation/modules/phrase/public.ts';
import {createSongEditor} from '/src/workstation/modules/song/public.ts';
import {openMusicDocument} from '/src/workstation/app/music-document.ts';
import {createBrowserSoundRuntime} from '/src/workstation/modules/sound-runtime/public.ts';
import {mountPhraseComposition} from '/src/workstation/modules/ui-rendering/phrase-composition.ts';
window.errors=[];addEventListener('error',e=>errors.push(e.message));addEventListener('unhandledrejection',e=>errors.push(String(e.reason)));
window.ready=(async()=>{
const source=Uint8Array.from(writeMidi({header:{format:0,numTracks:1,ticksPerBeat:480},tracks:[[
{deltaTime:0,type:'programChange',channel:0,programNumber:73},
{deltaTime:0,type:'controller',channel:0,controllerType:64,value:127},
{deltaTime:0,type:'noteOn',channel:0,noteNumber:69,velocity:100},
{deltaTime:96,type:'noteOff',channel:0,noteNumber:69,velocity:0},
{deltaTime:384,type:'controller',channel:0,controllerType:64,value:0},
{deltaTime:240,type:'endOfTrack'}]]}));
const imported=readMusicFile(source,'Test.mid','midi');let text=imported.libraryText;
const library=createMaterialLibrary({read:()=>text,write:value=>text=value}),tones=createTimbrePlayback(library);
const score=createPhraseEditor(library,tones),song=createSongEditor(library,createPhrasePlayback(library,tones),{defaultTempoMode:'source'});
openMusicDocument(library,song,score);const sound=createBrowserSoundRuntime();let exported;
const mounted=mountPhraseComposition(document.querySelector('#app'),{phrase:score,sound,directMusic:true,onExport:async()=>{exported=await sound.render(score.previewPlan(),{sampleRate:44100});}});
await score.preparePreview();
function energy(result,from,to){const data=new DataView(result.bytes.buffer,result.bytes.byteOffset,result.bytes.byteLength);let e=0;
for(let i=Math.floor(from*44100);i<Math.floor(to*44100);i++){let value=data.getUint8(44+i*6)|data.getUint8(45+i*6)<<8|data.getUint8(46+i*6)<<16;if(value&0x800000)value-=0x1000000;e+=(value/8388608)**2;}return e;}
window.check=async()=>{
 const before=JSON.stringify(score.read().body);
 if(document.querySelector('.song-midi-effects'))throw Error('MIDI effects button is still in the top bar');
 document.querySelector('.song-export-audio').click();
 for(let i=0;i<300&&!exported;i++)await new Promise(r=>setTimeout(r,30));
 if(!exported)throw Error('Export did not complete');
 const dry=await sound.render(score.previewPlan(undefined,{midiEffects:false}),{sampleRate:44100});
 const wetEnergy=energy(exported,.25,.4),dryEnergy=energy(dry,.25,.4);
 if(wetEnergy<dryEnergy*3)throw Error('Export lost pedal tail '+wetEnergy+'/'+dryEnergy);
 if(JSON.stringify(score.read().body)!==before)throw Error('Export mutated saved music');
 if(errors.length)throw Error(errors.join(';'));mounted.dispose();sound.dispose();
 return {passed:true,checks:5,wetEnergy,dryEnergy,physicalAudio:false,desktopControl:false};
};return true;})();
</script></body></html>`);
const server=await createServer({configFile:false,publicDir:path.resolve('public'),optimizeDeps:{include:['midi-file','spessasynth_core','@xmldom/xmldom','fflate']},server:{host:'127.0.0.1',port:0,hmr:false,watch:{ignored:['**/.cache/**','**/.test-output/**','**/project/**','**/legacy/**','**/release/**']}},logLevel:'error'});await server.listen();
const origin='http://127.0.0.1:'+server.httpServer.address().port;
await fs.writeFile(path.join(root,'qa.cjs'),`
const {app,BrowserWindow}=require('electron'),fs=require('node:fs'),path=require('node:path');
app.setPath('userData',path.join(${JSON.stringify(root)},'profile'));app.commandLine.appendSwitch('disable-gpu');
(async()=>{let win;try{await app.whenReady();win=new BrowserWindow({show:false,width:1100,height:800,webPreferences:{backgroundThrottling:false}});
await win.loadURL(${JSON.stringify(origin+'/'+path.relative(process.cwd(),root).replaceAll('\\','/')+'/index.html')});
for(let i=0;i<300;i++){if(await win.webContents.executeJavaScript('!!window.check'))break;await new Promise(r=>setTimeout(r,50));}
const result=await win.webContents.executeJavaScript('window.check()');result.visibleWindow=win.isVisible();fs.writeFileSync(path.join(${JSON.stringify(root)},'report.json'),JSON.stringify(result,null,2));win.destroy();app.exit(0);
}catch(error){fs.writeFileSync(path.join(${JSON.stringify(root)},'report.json'),JSON.stringify({passed:false,error:String(error),stack:error.stack}));win?.destroy();app.exit(1);}})();`);
const env={...process.env};delete env.ELECTRON_RUN_AS_NODE;
const child=spawn(path.resolve('.cache/release-smoke-engine/electron.exe'),[path.join(root,'qa.cjs')],{env,windowsHide:true,stdio:['ignore','pipe','pipe']});
let output='';for(const stream of [child.stdout,child.stderr])stream.on('data',data=>output=(output+data).slice(-3000));
const timer=setTimeout(()=>child.kill(),60000);const exit=await new Promise(resolve=>child.once('exit',resolve));clearTimeout(timer);await server.close();
console.log(await fs.readFile(path.join(root,'report.json'),'utf8').catch(()=>output));console.log('Evidence: '+root);if(exit)process.exitCode=1;
