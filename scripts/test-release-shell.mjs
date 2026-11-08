import { readFile, writeFile, mkdir, mkdtemp } from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { createInitialProjectLibrary } from '../src/workstation/app/project-setup.ts';
import { createMaterialLibrary } from '../src/workstation/modules/materials/public.ts';
import { createPhraseEditor, createPhrasePlayback } from '../src/workstation/modules/phrase/public.ts';
import { createSongEditor } from '../src/workstation/modules/song/public.ts';
import { createTimbrePlayback } from '../src/workstation/modules/timbre/public.ts';
import { openMusicDocument, commitMusicDocument } from '../src/workstation/app/music-document.ts';

const plan = JSON.parse(await readFile('.cache/release-package-plan.json', 'utf8'));
await mkdir('.test-output/release-shell', { recursive: true });
const directory = await mkdtemp(path.resolve('.test-output/release-shell/case-'));
let text = createInitialProjectLibrary('发布集成检查');
const library = createMaterialLibrary({ read: () => text, write: value => { text = value; } });
const tones = createTimbrePlayback(library), score = createPhraseEditor(library, tones), song = createSongEditor(library, createPhrasePlayback(library, tones), { defaultTempoMode: 'source' });
openMusicDocument(library, song, score);
const part = score.addPart(library.listContentInfo().find(item => item.kind === 'rootsound.timbre').id);
score.addNote(part, { startBeat: 0, durationBeats: .5, durationSeconds: .25, frequencyHz: 440, velocity: .6 });
commitMusicDocument(library, song, score);
await writeFile(path.join(directory, 'input.json'), text);
const harness = path.join(directory, 'harness.cjs');
await writeFile(harness, `
const { app, BrowserWindow, dialog } = require('electron');
const fs = require('node:fs'); const path = require('node:path'); const Module = require('node:module');
const root=${JSON.stringify(directory)}, main=${JSON.stringify(path.join(plan.windows, 'resources/app/main.cjs'))};
const report=path.join(root,'report.json'); const assert=require('node:assert/strict');
app.setPath('userData',path.join(root,'profile')); app.commandLine.appendSwitch('disable-gpu');
dialog.showErrorBox=(_title,message)=>{fs.writeFileSync(report,JSON.stringify({error:message}));app.exit(1);};
dialog.showMessageBox=async()=>({response:2});
let source=fs.readFileSync(main,'utf8').replace('path.dirname(process.execPath)',JSON.stringify(path.join(root,'data')))
 .replace("window.once('ready-to-show', () => window.show());",'// No visible window in the isolated smoke run.');
const loaded=new Module(main,module); loaded.filename=main; loaded.paths=Module._nodeModulePaths(path.dirname(main)); loaded._compile(source,main);
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function waitFor(predicate){for(let n=0;n<400;n++){if(await predicate())return;await delay(50);}throw new Error('Timed out waiting for the isolated page');}
async function run(){
 try {
  await app.whenReady();await waitFor(()=>BrowserWindow.getAllWindows().length>0);
  const window=BrowserWindow.getAllWindows()[0];assert(!window.isVisible());
  const js=code=>window.webContents.executeJavaScript('(async()=>('+code+'))()');
  await waitFor(async()=>await js("!!document.querySelector('.guidance-invitation')").catch(()=>false));
  assert.equal(await js("document.querySelector('.guidance-invitation h2').textContent"),'是否观看引导');
  await js("document.querySelector('.guidance-skip').click()");
  await waitFor(async()=>await js("!!document.querySelector('.welcome-actions')").catch(()=>false));
  const welcome=await js("({name:document.querySelector('.wordmark').textContent,start:document.querySelector('.welcome-actions').textContent,bridge:typeof rootSoundDesktop.storage.Read})");
  assert.equal(welcome.name,'RootSound');assert.equal(welcome.bridge,'function');
  const initial=await js("JSON.parse(await rootSoundDesktop.projectDirectories.Read())");
  const bundled=await js("JSON.parse(await rootSoundDesktop.projectDirectories.List()).projects.length");assert.equal(bundled,${plan.projects?.length ?? 0});
  const payload=fs.readFileSync(path.join(root,'input.json'),'utf8');
  const created=await js('JSON.parse(await rootSoundDesktop.projectDirectories.Create('+JSON.stringify('发布集成检查')+','+JSON.stringify(initial.defaultLocation)+','+JSON.stringify(payload)+'))');
  assert.equal(created.status,'created');
  const stored=fs.readFileSync(created.project.path,'utf8');
  const reloaded=new Promise(resolve=>window.webContents.once('did-finish-load',resolve));window.webContents.reload();await reloaded;
  await waitFor(async()=>await js("!!document.querySelector('.melody-workspace.is-vertical')").catch(()=>false));
  const view=await js("({notes:document.querySelectorAll('.melody-note').length,old:!!document.querySelector('.song-playlist'),error:document.querySelector('.startup-error')?.textContent,scope:JSON.parse(rootSoundDesktop.storage.Read()).scope})");
  assert.equal(view.notes,1);assert.equal(view.old,false);assert(!view.error);assert(view.scope);
  assert.equal(fs.readFileSync(created.project.path,'utf8'),stored,'loading cannot autosave');
  await js("document.querySelector('.melody-add-note-family').click()");
  assert(await js("!!document.querySelector('.melody-tone-library')"));
  const voiceCount=await js("document.querySelectorAll('.melody-library-tone').length");assert.equal(voiceCount,175);
  await js("document.querySelector('.melody-library-close').click()");
  const save=await js("JSON.parse(await rootSoundDesktop.projectDirectories.Save('发布集成检查'))");assert.equal(save.status,'saved');
  const missing=await js("(await fetch('/__payload/invalid')).status");assert.equal(missing,404);
  // Exercise the actual packaged worklet under the production URL scheme/CSP.
  // Only OfflineAudioContext is permitted; this never opens the speaker device.
  const assets=path.join(path.dirname(main),'ui/assets');
  const worker=fs.readdirSync(assets).find(name=>name.startsWith('soundfont-worklet-')&&fs.statSync(path.join(assets,name)).size>100000);assert(worker);
  const fontAudio=await js('(async()=>{'+
   'globalThis.AudioContext=class{constructor(){throw Error("physical audio forbidden")}};'+
   'const context=new OfflineAudioContext(2,48000,48000);'+
   'await context.audioWorklet.addModule('+JSON.stringify('/assets/'+worker)+');'+
   'const bank=await fetch("/instruments/generaluser-gs-2.0.3/GeneralUser-GS.sf2").then(response=>{if(!response.ok)throw Error("missing SF2");return response.arrayBuffer()});'+
   'const init=new AudioWorkletNode(context,"rootsound-soundfont",{numberOfInputs:0,numberOfOutputs:1,outputChannelCount:[2],processorOptions:{bank}});'+
   'await new Promise((resolve,reject)=>{init.port.onmessage=event=>event.data.type==="ready"?resolve():reject(Error(event.data.message));init.onprocessorerror=()=>reject(Error("worklet initialization failed"))});init.port.close();'+
   'const font={bank:"generaluser-gs-2.0.3",program:0,key:60,velocity:100,cents:0,drums:false};'+
   'const voice=new AudioWorkletNode(context,"rootsound-soundfont",{numberOfInputs:0,numberOfOutputs:1,outputChannelCount:[2],processorOptions:{events:[{atSeconds:0,holdSeconds:.2,releaseSeconds:.5,level:.7,pan:0,font}]}});voice.connect(context.destination);'+
   'const ready=new Promise((resolve,reject)=>{voice.port.onmessage=event=>event.data.type==="scheduled"?resolve():event.data.type==="error"&&reject(Error(event.data.message));voice.onprocessorerror=()=>reject(Error("worklet render failed"))});'+
   'voice.port.postMessage({type:"start",at:0,position:0});voice.port.postMessage({type:"stop",at:.9});await ready;'+
   'const audio=await context.startRendering();let peak=0;for(const value of audio.getChannelData(0))peak=Math.max(peak,Math.abs(value));voice.disconnect();voice.port.close();if(peak<.00001)throw Error("packaged SoundFont was silent");return {peak,frames:audio.length,offlineOnly:true};})()');
  assert(!window.isVisible());
  fs.writeFileSync(report,JSON.stringify({passed:true,actualBundledRenderer:true,actualBundledDotnet:true,welcome:true,bundledProjects:bundled,createAndReload:true,noteCount:view.notes,defaultVoices:voiceCount,fontAudio,save:true,manualSavePreserved:true,noOldArrangement:true,opaquePayloadBoundary:true,visibleWindow:false,screenCaptured:false,audioDeviceOpened:false},null,2));
  window.destroy();app.exit(0);
 }catch(error){fs.writeFileSync(report,JSON.stringify({error:error.stack}));app.exit(1);}
}
void run();
`);
const executable = path.resolve('.cache/release-smoke-engine/electron.exe');
const env = { ...process.env }; delete env.ELECTRON_RUN_AS_NODE;
const result = await new Promise(resolve => {
  const child = spawn(executable, [harness], { env, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
  let output = ''; child.stdout.on('data', bytes => { output = (output + bytes).slice(-6000); }); child.stderr.on('data', bytes => { output = (output + bytes).slice(-6000); });
  child.on('error', error => resolve({ code: 1, output: String(error) })); child.on('exit', code => resolve({ code, output }));
});
const proof = await readFile(path.join(directory, 'report.json'), 'utf8').catch(() => result.output);
console.log(proof); if (result.code !== 0) { console.error({ exitCode: result.code, detail: result.output }); process.exitCode = 1; }
