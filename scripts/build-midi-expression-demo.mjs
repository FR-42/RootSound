// Self-authored, tiny musical fixture. No reference recordings or user projects.
import fs from 'node:fs/promises';
import path from 'node:path';
import { writeExchangeMidi } from '../src/workstation/app/music-interchange-midi.ts';
import { readMusicFile } from '../src/workstation/app/music-file.ts';
import { createMaterialLibrary } from '../src/workstation/modules/materials/public.ts';
import { createSampleBankAudio } from '../src/workstation/modules/timbre/sample-bank.ts';
import { createTimbrePlayback } from '../src/workstation/modules/timbre/public.ts';
import { createPhraseEditor, createPhrasePlayback } from '../src/workstation/modules/phrase/public.ts';
import { createSongEditor } from '../src/workstation/modules/song/public.ts';
import { openMusicDocument } from '../src/workstation/app/music-document.ts';
import { readPreview } from '../src/workstation/modules/sound-runtime/plan.ts';
import { loadSoundFont, SoundFontStream } from '../src/workstation/modules/sound-runtime/soundfont-engine.ts';

const directory=path.resolve('experiments/midi-expression-demo');await fs.mkdir(directory,{recursive:true});
const note=(beat,pitch,duration=.35)=>({beat,pitch,duration,velocity:.73,level:1,pan:0});
const cc=(beat,controller,value)=>({beat,type:'controller',controller,value});
const score={name:'MIDI 演奏效果演示',length:32,tempos:[{beat:0,bpm:120}],parts:[
  {name:'延音踏板',program:0,midiChannelId:'sustain',notes:[60,64,67,72,67,64,60].map((pitch,i)=>note(i,pitch))},
  {name:'保持音踏板',program:0,midiChannelId:'sostenuto',notes:[note(8,48),note(8,55),note(8,60),note(9,76),note(10,74),note(11,72),note(12,71),note(13,69),note(14,67)]},
  {name:'弯音与调制',program:73,midiChannelId:'flute',notes:[note(16,69,3.5),note(20,72,3.5)]},
  {name:'连续表情与空间',program:48,midiChannelId:'strings',notes:[note(24,60,7),note(24,64,7),note(24,67,7)]},
],midiExpression:[
  {id:'sustain',events:[cc(0,64,127),cc(7.6,64,0)]},
  {id:'sostenuto',events:[cc(8.1,66,127),cc(15.5,66,0),cc(10,67,127),cc(14,67,0)]},
  {id:'flute',events:[cc(16,101,0),cc(16,100,0),cc(16,6,2),cc(16,100,127),cc(16,101,127),
    ...[0,1,2,3,4,5,6,7,8].map((i)=>({type:'pitch-bend',value:Math.round(8192+Math.sin(i/8*Math.PI)*6500),beat:16+i*.4})),
    cc(20,1,90),cc(23.6,1,0),{type:'pitch-bend',value:8192,beat:20}]},
  {id:'strings',events:[cc(24,91,90),cc(24,93,65),...Array.from({length:29},(_,i)=>cc(24+i/4,11,Math.round(35+92*i/28))),
    ...Array.from({length:29},(_,i)=>cc(24+i/4,10,Math.round(15+97*i/28)))]},
]};
// Explicit cross-message order preserves the CC66 capture after the chord starts.
let order=10;for(const part of score.parts)for(const n of part.notes){n.midiOnOrder=++order;n.midiOffOrder=++order;}
for(const lane of score.midiExpression)for(const event of lane.events)event.order=++order;
const midi=writeExchangeMidi(score).bytes;
await fs.writeFile(path.join(directory,'MIDI演奏效果演示.mid'),midi);
const imported=readMusicFile(midi,'MIDI演奏效果演示.mid','midi');
const library=createMaterialLibrary({read:()=>imported.libraryText,write(){}});
const fetcher=async()=>new Response(await fs.readFile('public/instruments/generaluser-gs-2.0.3/manifest.json'));
const tones=createTimbrePlayback(library,undefined,undefined,createSampleBankAudio(library,undefined,fetcher,{soundFont:true}));
const phrase=createPhraseEditor(library,tones),song=createSongEditor(library,createPhrasePlayback(library,tones),{defaultTempoMode:'source'});
openMusicDocument(library,song,phrase);await phrase.preparePreview();
const data=await fs.readFile('public/instruments/generaluser-gs-2.0.3/GeneralUser-GS.sf2');
const bank=loadSoundFont(data.buffer.slice(data.byteOffset,data.byteOffset+data.byteLength));
const sampleRate=44100,seconds=19,outputs=[];
for(const midiEffects of [false,true]){
  const plan=readPreview(phrase.previewPlan(undefined,{midiEffects}));
  const events=plan.events.map(event=>({atSeconds:event.atSeconds,holdSeconds:event.sound.note.holdSeconds,
    releaseSeconds:event.sound.envelope.releaseSeconds,level:event.sound.level,pan:event.pan??0,font:event.sound.soundFont}));
  const stream=new SoundFontStream(bank,sampleRate,events,plan.midiExpression);await stream.ready();
  const left=new Float32Array(sampleRate*seconds),right=new Float32Array(left.length);stream.process(left,right);stream.dispose();
  outputs.push({name:midiEffects?'02-演奏效果开启.wav':'01-演奏效果关闭.wav',left,right});
}
let peak=0;for(const audio of outputs)for(const channel of [audio.left,audio.right])for(const x of channel){if(!Number.isFinite(x))throw Error('Invalid PCM');peak=Math.max(peak,Math.abs(x));}
const gain=Math.min(1,.96/peak);
for(const audio of outputs){
  const wav=Buffer.alloc(44+audio.left.length*4);wav.write('RIFF',0);wav.writeUInt32LE(wav.length-8,4);wav.write('WAVEfmt ',8);
  wav.writeUInt32LE(16,16);wav.writeUInt16LE(1,20);wav.writeUInt16LE(2,22);wav.writeUInt32LE(sampleRate,24);wav.writeUInt32LE(sampleRate*4,28);wav.writeUInt16LE(4,32);wav.writeUInt16LE(16,34);wav.write('data',36);wav.writeUInt32LE(wav.length-44,40);
  for(let i=0;i<audio.left.length;i++)for(let c=0;c<2;c++)wav.writeInt16LE(Math.round(Math.max(-1,Math.min(1,(c?audio.right:audio.left)[i]*gain))*32767),44+i*4+c*2);
  await fs.writeFile(path.join(directory,audio.name),wav);
}
const envelope={format:'RootSoundWorkspace',version:2,id:crypto.randomUUID(),name:'MIDI演奏效果演示',createdAtUtc:new Date().toISOString(),libraryText:imported.libraryText};
// Never overwrite an existing user-edited demonstration.
let project=path.resolve('project/MIDI演奏效果演示.rootsound'),suffix=2;
while(await fs.stat(project).then(()=>true,()=>false))project=path.resolve(`project/MIDI演奏效果演示 ${suffix++}.rootsound`);
await fs.writeFile(project,JSON.stringify(envelope),{flag:'wx'});
await fs.writeFile(path.join(directory,'试听说明.txt'),'0–4 秒：钢琴延音踏板。4–8 秒：保持音踏板保留低音，随后高音正常松键。8–12 秒：长笛弯音、调制轮。12–16 秒：弦乐表情渐强、声像移动、混响与合唱。\n两个 WAV 使用同一固定增益，不分别归一化。\n工程顶栏的“演奏效果”可以实时切换对比，开关不删除源演奏事件。\n');
await fs.writeFile(path.join(directory,'verification.json'),JSON.stringify({project,sampleRate,seconds,noteCount:score.parts.reduce((sum,part)=>sum+part.notes.length,0),peakBeforeGain:peak,sharedGain:gain,source:'self-authored MIDI; installed GeneralUser GS samples; shared production SoundFontStream',physicalAudio:false},null,2));
console.log(JSON.stringify({project,directory,sharedGain:gain}));
