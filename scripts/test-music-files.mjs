// Small disposable fixtures only. Does not read the user's music or operate a desktop.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';
import { writeMidi } from 'midi-file';
import { createDesktopProjectDirectories } from '../src/workstation/app/platform/project-directories.ts';
import { createProjectSetup } from '../src/workstation/app/project-setup.ts';
import { readMusicFile } from '../src/workstation/app/music-file.ts';
import { writeExchangeXml } from '../src/workstation/app/music-interchange-xml.ts';

const evidence=path.resolve('.test-output/music-formats');await fs.mkdir(evidence,{recursive:true});
const installation=await fs.mkdtemp(path.join(evidence,'native-')),root=path.join(installation,'project'),nested=path.join(root,'folder');
await fs.mkdir(nested,{recursive:true});
const midi=Uint8Array.from(writeMidi({header:{format:0,numTracks:1,ticksPerBeat:480},tracks:[[
  {deltaTime:0,type:'noteOn',channel:0,noteNumber:60,velocity:100},
  {deltaTime:480,type:'noteOff',channel:0,noteNumber:60,velocity:0},{deltaTime:0,type:'endOfTrack'},
]]}));
const score={name:'Sample',length:4,tempos:[{beat:0,bpm:120}],parts:[{name:'Piano',program:0,notes:[{beat:0,duration:1,pitch:60,velocity:.8,level:1,pan:0}]}]};
const samples=[['Sample.mid',midi,'midi'],['Score.musicxml',writeExchangeXml(score,false),'musicxml'],['Compressed.mxl',writeExchangeXml(score,true),'mxl']];
for(const [name,bytes]of samples)await fs.writeFile(path.join(nested,name),bytes);
await fs.writeFile(path.join(nested,'bad.xml'),'<unrelated/>');
const assembly=path.resolve(process.argv[2]??'.test-output/music-formats/host/RootSound.Host.dll');
const host=spawn('dotnet',[assembly,installation],{windowsHide:true,stdio:['pipe','pipe','pipe']});
const lines=createInterface({input:host.stdout});let sequence=0,checks=0,stderr='';host.stderr.on('data',data=>stderr+=data);
function check(condition,label){assert(condition,label);checks++;}
async function raw(method,args=[]){
  const reply=new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error(method+': '+stderr)),15000);lines.once('line',line=>{clearTimeout(timer);resolve(line);});});
  host.stdin.write(JSON.stringify({id:++sequence,method,args})+'\n');return JSON.parse(await reply).result;
}
async function call(method,args=[]){return JSON.parse(await raw(method,args));}
const methods=['Read','Create','CreateCopy','OpenKnown','OpenDocument','ReadDocument','PrepareDocumentSave','FinishLoading','Exit','Save','Browse'];
const bridge=Object.fromEntries(methods.map(name=>[name,(...args)=>raw('project.'+name,args)]));
bridge.ChooseLocation=async()=>JSON.stringify({status:'cancelled'});bridge.Open=async()=>JSON.stringify({status:'cancelled'});
const port=createDesktopProjectDirectories(bridge);let entered=0;const setup=createProjectSetup(port,()=>entered++);
try{
  const page=await port.browse(nested);check(page.entries.filter(entry=>entry.kind==='document').length===3,'MusicXML and MXL appear alongside MIDI');
  for(const [name,bytes,format]of samples){
    const filename=path.join(nested,name),before=await fs.readdir(nested);
    await setup.open(filename);check(entered>0,'entered source document');
    const current=(await port.read()).current;check(current.path===filename&&current.format===format,'active source retains path and format');
    check(JSON.stringify(await fs.readdir(nested))===JSON.stringify(before),'opening creates no music file');
    check((await fs.readFile(filename)).equals(bytes),'open preserves every source byte');
    check(!(await port.read()).hasUnsavedChanges,'initial document is clean');
    const source=await port.readDocument();check(source.path===filename&&Buffer.from(source.bytes).equals(bytes),'source reload after renderer navigation');
    check(typeof source.libraryText==='string','source session retains a separate saved baseline');
    await port.finishLoading();
    const storage=await call('storage.Read');const replacement=readMusicFile(bytes,name,format).libraryText;
    check((await call('storage.WriteScoped',[replacement,storage.scope])).ok,'editor changes memory draft');
    check((await port.read()).hasUnsavedChanges,'memory edit is dirty');
    check((await port.readDocument()).libraryText===source.libraryText,'unsaved edits cannot replace saved baseline on renderer reload');
    check((await fs.readFile(filename)).equals(bytes),'memory edits do not auto-save');
    await assert.rejects(port.save(),/准备/);checks++;
    await port.prepareDocumentSave(bytes);
    const saved=await port.save();check(saved.path===filename,'Save keeps source filename');
    check((await fs.readFile(filename)).equals(bytes),'source save writes prepared bytes');
    check(!(await port.read()).hasUnsavedChanges,'explicit source save clears dirty flag');
    check((await port.readDocument()).libraryText===replacement,'explicit save advances the saved baseline');
    await port.exit('discard');
    await setup.open(filename);check((await port.read()).current.id===current.id,'reopening source retains workspace identity');
    await port.exit('discard');
  }
  const filename=path.join(nested,'Sample.mid');await setup.open(filename);
  const before=await fs.readFile(filename),source=await port.readDocument();
  await port.prepareDocumentSave(source.bytes);
  await port.createCopy('Native copy',root,readMusicFile(source.bytes,source.name,source.format).libraryText);
  check((await fs.readFile(filename)).equals(before),'Save As does not modify source');
  check((await port.read()).current.path===path.join(root,'Native copy.rootsound'),'explicit Save As creates native project');await port.exit('discard');
  await setup.open(filename);await port.prepareDocumentSave(midi);await fs.writeFile(filename,Buffer.concat([Buffer.from(midi),Buffer.from([0])]));
  await assert.rejects(port.save(),/变化|改变|修改/);checks++;check((await fs.readFile(filename)).length===midi.length+1,'external modification is not overwritten');await port.exit('discard');
  const previous=entered;await assert.rejects(setup.open(path.join(nested,'bad.xml')),/MusicXML/);check(entered===previous,'invalid XML never activates a document');
  check(!(await port.read()).current,'failed conversion leaves previous session unchanged');
  await fs.writeFile(filename,midi);const selected=await port.open(filename);await fs.writeFile(filename,Buffer.concat([Buffer.from(midi),Buffer.from([0])]));
  await assert.rejects(port.openDocument(selected,readMusicFile(midi,'Sample.mid','midi').libraryText),/变化/);checks++;
  check((await fs.readdir(root)).filter(name=>name.endsWith('.rootsound')).length===1,'only explicit Save As creates a rootsound file');
  const report={passed:true,checks,fixture:installation,physicalAudio:false,desktopControl:false};
  await fs.writeFile(path.join(evidence,'native-report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));
}finally{host.stdin.end();await new Promise(resolve=>host.once('exit',resolve));lines.close();}
