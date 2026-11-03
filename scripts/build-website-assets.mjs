// Original, small demonstration only. Never reads or changes user music projects.
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {createMaterialLibrary} from '../src/workstation/modules/materials/public.ts';
import {createInitialProjectLibrary} from '../src/workstation/app/project-setup.ts';
import {createTimbrePlayback} from '../src/workstation/modules/timbre/public.ts';
import {createPhraseEditor,createPhrasePlayback} from '../src/workstation/modules/phrase/public.ts';
import {createSongEditor} from '../src/workstation/modules/song/public.ts';
import {openMusicDocument,commitMusicDocument} from '../src/workstation/app/music-document.ts';
import {loadSoundFont,SoundFontStream} from '../src/workstation/modules/sound-runtime/soundfont-engine.ts';

await mkdir('website/assets',{recursive:true});await mkdir('.test-output/rb127',{recursive:true});
const bpm=144,beat=60/bpm;
const melody=[
  [0,76,.5],[.5,79,.5],[1,83,.75],[1.75,81,.25],[2,79,.5],[2.5,78,.5],[3,76,.9],
  [4,74,.5],[4.5,78,.5],[5,81,.75],[5.75,79,.25],[6,78,.5],[6.5,76,.5],[7,74,.9],
  [8,72,.5],[8.5,76,.5],[9,79,.75],[9.75,81,.25],[10,79,.5],[10.5,76,.5],[11,74,.5],[11.5,76,.5],
  [12,74,.5],[12.5,78,.5],[13,71,.9],[14,76,1.7],
];
const roots=[52,50,48,52],chords=[[64,67,71],[62,66,69],[60,64,67],[64,67,71]];
const voices=[
  {key:'piano',program:0,notes:melody,level:.8},
  {key:'electric-bass',program:33,notes:roots.flatMap((root,i)=>[[i*4,root,1.5],[i*4+2,root,1.3]]),level:.25},
  {key:'electric-piano',program:4,notes:chords.flatMap((chord,i)=>Array.from({length:8},(_,n)=>[i*4+n*.5,chord[n%3],.38])),level:.2},
];
let text=createInitialProjectLibrary('微光 · 原创演示');
const library=createMaterialLibrary({read:()=>text,write:value=>{text=value;}}),tones=createTimbrePlayback(library);
const score=createPhraseEditor(library,tones),song=createSongEditor(library,createPhrasePlayback(library,tones),{defaultTempoMode:'source'});
openMusicDocument(library,song,score);score.setLength(16);score.setTempo(bpm);
for(const voice of voices){
  const tone=library.listContent().find(item=>item.kind==='rootsound.timbre'&&item.body.instrument===voice.key);
  if(!tone)throw Error('Missing demonstration instrument '+voice.key);
  const id=score.addPart(tone.id);
  for(const [at,key,duration] of voice.notes)score.addNote(id,{startBeat:at,durationBeats:duration,durationSeconds:duration*beat,
    frequencyHz:440*2**((key-69)/12),velocity:voice.key==='piano'?.78:.62,level:voice.level});
}
commitMusicDocument(library,song,score);
await writeFile('.test-output/rb127/demo-library.json',text);
await writeFile('.test-output/rb127/demo-workspace.json',JSON.stringify({songId:song.read().draft.id,state:{version:1,orientation:'vertical',
  viewport:{leftSeconds:0,zoom:1,top:(46-16)*24,rowHeight:24},playheadSeconds:0,entryOctave:4,noteLengths:{}}}));

const source=await readFile('public/instruments/generaluser-gs-2.0.3/GeneralUser-GS.sf2');
const bank=loadSoundFont(source.buffer.slice(source.byteOffset,source.byteOffset+source.byteLength));
const waveforms={};
for(const [name,program] of [['piano',0],['musicbox',10]]){
  const events=voices.flatMap((voice,index)=>voice.notes.map(([at,key,duration])=>({atSeconds:at*beat,holdSeconds:duration*beat,releaseSeconds:2,
    level:voice.level,pan:index===2?-.15:0,font:{bank:'generaluser-gs-2.0.3',program:index===0?program:voice.program,key,velocity:index===0?99:79,cents:0,drums:false}})));
  const frames=Math.ceil((16*beat+3)*48000),left=new Float32Array(frames),right=new Float32Array(frames);
  const stream=new SoundFontStream(bank,48000,events);await stream.ready();stream.process(left,right);stream.dispose();
  let peak=0;for(let i=0;i<frames;i++)peak=Math.max(peak,Math.abs(left[i]),Math.abs(right[i]));
  if(peak<1e-6)throw Error('Demonstration was silent');const gain=.62/peak;
  const wav=Buffer.alloc(44+frames*4);wav.write('RIFF');wav.writeUInt32LE(wav.length-8,4);wav.write('WAVEfmt ',8);wav.writeUInt32LE(16,16);
  wav.writeUInt16LE(1,20);wav.writeUInt16LE(2,22);wav.writeUInt32LE(48000,24);wav.writeUInt32LE(192000,28);wav.writeUInt16LE(4,32);wav.writeUInt16LE(16,34);wav.write('data',36);wav.writeUInt32LE(frames*4,40);
  for(let i=0;i<frames;i++){wav.writeInt16LE(Math.round(Math.max(-1,Math.min(1,left[i]*gain))*32767),44+i*4);wav.writeInt16LE(Math.round(Math.max(-1,Math.min(1,right[i]*gain))*32767),46+i*4);}
  const temporary=`.test-output/rb127/demo-${name}.wav`;await writeFile(temporary,wav);
  const encoded=spawnSync('ffmpeg',['-hide_banner','-loglevel','error','-y','-i',temporary,'-codec:a','libmp3lame','-b:a','160k',`website/assets/demo-${name}.mp3`],{windowsHide:true});
  if(encoded.status!==0)throw Error('MP3 encoding failed: '+encoded.stderr);
  const waveform=Array.from({length:72},(_,bucket)=>{let energy=0;const from=Math.floor(bucket*frames/72),to=Math.floor((bucket+1)*frames/72);for(let i=from;i<to;i++)energy+=(left[i]*left[i]+right[i]*right[i])*.5;return Math.round(Math.min(1,Math.sqrt(energy/(to-from))*gain*4)*1000)/1000;});
  waveforms[name]=waveform;
}
const be32=value=>[value>>>24,value>>>16&255,value>>>8&255,value&255],ascii=value=>[...Buffer.from(value)];
const vlq=value=>{const out=[value&127];while(value>>>=7)out.unshift((value&127)|128);return out;};
const tracks=voices.map((voice,channel)=>{
  const tempo=Math.round(60e6/bpm),events=[{tick:0,data:[0xc0+channel,voice.program]}];
  if(!channel)events.unshift({tick:0,data:[255,81,3,tempo>>>16,tempo>>>8&255,tempo&255]});
  for(const [at,key,duration] of voice.notes){events.push({tick:Math.round(at*480),data:[0x90+channel,key,channel?79:99]},{tick:Math.round((at+duration)*480),data:[0x80+channel,key,0]});}
  const priority=event=>event.data[0]>=0xc0?0:(event.data[0]&0xf0)===0x80?1:2;
  events.sort((a,b)=>a.tick-b.tick||priority(a)-priority(b));let tick=0;const bytes=events.flatMap(event=>{const delta=event.tick-tick;tick=event.tick;return [...vlq(delta),...event.data];});bytes.push(0,255,47,0);
  return [...ascii('MTrk'),...be32(bytes.length),...bytes];
});
await writeFile('website/assets/shimmer.mid',Buffer.from([...ascii('MThd'),0,0,0,6,0,1,0,3,1,224,...tracks.flat()]));
await writeFile('website/assets/demo.json',JSON.stringify({title:'微光',bpm,duration:16*beat+3,melody:melody.map(([at,pitch,duration])=>({at:at*beat,pitch,duration:duration*beat})),waveforms}));
console.log(JSON.stringify({originalDemo:true,bpm,notes:voices.reduce((n,v)=>n+v.notes.length,0),audioVersions:2,userProjectsRead:false}));
