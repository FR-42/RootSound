import {readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';
import {parseMidi} from '../../src/workstation/modules/midi-import/public.ts';
import {writeMusicProject} from './project-writer.mjs';

const here=path.dirname(fileURLToPath(import.meta.url));
const clamp=(value,low,high)=>Math.max(low,Math.min(high,value));
const fromMidi=(notes,scale=1)=>notes.map(note=>({at:note.startSeconds,hold:note.endSeconds-note.startSeconds,pitch:note.pitch,
  velocity:clamp(note.velocity*scale,.1,.95),level:note.level,pan:note.pan}));
const results=[];

const v3=parseMidi(new Uint8Array(await readFile(path.join(here,'v3-author.mid'))));assert.equal(v3.notes.length,2713);assert.equal(v3.initialTempoBpm,160);
const v3parts=[{name:'钢琴 · 旋律',instrument:'gm-0',origin:'aqtq314 piano transcription',pan:.04,notes:fromMidi(v3.notes.filter(n=>n.trackIndex===1),.88)},
  {name:'钢琴 · 织体',instrument:'gm-0',origin:'aqtq314 piano transcription',pan:-.04,notes:fromMidi(v3.notes.filter(n=>n.trackIndex===2),.78)}];
const bass={name:'新增 · 电贝斯',instrument:'gm-33',level:.48,pan:0,origin:'RootSound new arrangement',notes:[]};
const kick={name:'新增 · 底鼓',instrument:'gm-drum-36',drumPitch:36,level:.6,origin:'RootSound new arrangement',notes:[]};
const snare={name:'新增 · 军鼓',instrument:'gm-drum-38',drumPitch:38,level:.45,origin:'RootSound new arrangement',notes:[]};
const hat={name:'新增 · 踩镲',instrument:'gm-drum-42',drumPitch:42,level:.28,origin:'RootSound new arrangement',notes:[]};
const crash={name:'新增 · 重音镲',instrument:'gm-drum-49',drumPitch:49,level:.3,origin:'RootSound new arrangement',notes:[]};
for(let bar=4;bar<Math.floor(v3.durationSeconds*160/60/4)-2;bar++){
  const start=bar*4,activity=v3.notes.filter(n=>n.startBeat>=start&&n.startBeat<start+4);if(!activity.length)continue;
  // A short breakdown in each large section leaves room for the piano runs.
  const sparse=bar%32===31;
  const left=activity.filter(n=>n.trackIndex===2);if(left.length){let root=Math.min(...left.map(n=>n.pitch));while(root>48)root-=12;while(root<28)root+=12;
    for(let beat=0;beat<4;beat++)bass.notes.push({at:(start+beat)*60/160,hold:.75*60/160,pitch:root,velocity:beat===0?.58:.48});}
  for(let beat=0;beat<4;beat++)if(!sparse||beat===0)kick.notes.push({at:(start+beat)*60/160,hold:.1,pitch:36,velocity:beat===0?.72:.62});
  for(const beat of [1,3])if(!sparse)snare.notes.push({at:(start+beat)*60/160,hold:.09,pitch:38,velocity:.6});
  for(let half=0;half<8;half++)if(!sparse)hat.notes.push({at:(start+half/2)*60/160,hold:.045,pitch:42,velocity:half%2?.34:.44});
  if(bar%8===4)crash.notes.push({at:start*60/160,hold:.2,pitch:49,velocity:.62});
  if(bar%16===3)for(const beat of [3.5,3.75])snare.notes.push({at:(start+beat)*60/160,hold:.07,pitch:38,velocity:.38+(beat-3.5)*.5});
}
v3parts.push(bass,kick,snare,hat,crash);
results.push(await writeMusicProject({name:'V3 · 悲怆第三乐章 · 节奏编配',bpm:160,parts:v3parts,master:.6,durationSeconds:v3.durationSeconds,
  source:{work:'V3 (O2Jam)',originalComposer:'Ludwig van Beethoven',gameArrangement:'BeautifulDay',transcription:'aqtq314',
    url:'https://www.youtube.com/watch?v=TL_8UmASF3Q',download:'https://www.mediafire.com/?vgi1jzco12iy2',
    changes:'Original complete 2713-note piano transcription retained. Electric bass and four percussion families newly arranged; not a note-for-note recreation of the original game instrumentation.'}}));

const mitsuha=parseMidi(new Uint8Array(await readFile(path.join(here,'mitsuha-github.mid'))));assert.equal(mitsuha.notes.length,712);
const right=mitsuha.notes.filter(n=>n.trackIndex===0),left=mitsuha.notes.filter(n=>n.trackIndex===1);
const mparts=[{name:'钢琴 · 旋律',instrument:'gm-0',origin:'public piano MIDI',notes:fromMidi(right,.95)},
  {name:'钢琴 · 伴奏',instrument:'gm-0',origin:'public piano MIDI',notes:fromMidi(left,.82)}];
// A quiet, monophonic inner line uses structural notes already present in the
// piano; it enters after the exposed introduction and releases before the coda.
const viola={name:'新增 · 中提琴长线',instrument:'gm-41',level:.43,attack:.04,release:.25,pan:-.2,origin:'RootSound new string arrangement',notes:[]};
let last=-Infinity;
for(const note of right){
  if(note.startSeconds<36||note.startSeconds>mitsuha.durationSeconds-17||note.startSeconds-last<1.35||note.endSeconds-note.startSeconds<.5)continue;
  const same=right.filter(other=>Math.abs(other.startSeconds-note.startSeconds)<.025);if(note.pitch!==Math.max(...same.map(n=>n.pitch)))continue;
  let pitch=note.pitch-12;while(pitch<48)pitch+=12;while(pitch>84)pitch-=12;
  viola.notes.push({at:note.startSeconds,hold:1.8,pitch,velocity:.44*clamp((mitsuha.durationSeconds-7-note.startSeconds)/18,.15,1)});last=note.startSeconds;
}
for(let i=0;i<viola.notes.length-1;i++)viola.notes[i].hold=clamp(viola.notes[i+1].at-viola.notes[i].at+.04,.7,3.5);
const cello={name:'新增 · 大提琴低线',instrument:'gm-42',level:.43,attack:.045,release:.3,pan:.17,origin:'RootSound new string arrangement',notes:[]};
for(let start=48;start<mitsuha.durationSeconds-15;start+=4*60/62){
  const choices=left.filter(n=>n.startSeconds>=start&&n.startSeconds<start+4*60/62);if(!choices.length)continue;
  const selected=choices.reduce((a,b)=>a.pitch<=b.pitch?a:b);let pitch=selected.pitch;while(pitch>60)pitch-=12;while(pitch<36)pitch+=12;
  cello.notes.push({at:selected.startSeconds,hold:3.4,pitch,velocity:.39*clamp((mitsuha.durationSeconds-7-selected.startSeconds)/18,.15,1)});
}
for(let i=0;i<cello.notes.length-1;i++)cello.notes[i].hold=clamp(cello.notes[i+1].at-cello.notes[i].at+.05,1,4.2);
mparts.push(viola,cello);
assert(viola.notes.length>20&&cello.notes.length>20);
results.push(await writeMusicProject({name:'三葉のテーマ · 钢琴与弦乐编配',bpm:62,parts:mparts,master:.78,durationSeconds:mitsuha.durationSeconds,
  source:{composer:'RADWIMPS / Yojiro Noda',work:'Theme of Mitsuha / 三葉のテーマ',url:'https://github.com/callmeyyzx/midi',
    referenceInstrumentation:'https://flat.io/score/65f42ebc2d7d555fd65f80b7-san-xie-note-ma',
    changes:'All 712 piano notes retain their source pitches, onset seconds and pedal-aware durations. Viola and cello lines are newly arranged, not a transcription of the original soundtrack strings. Public filename claiming official provenance is not independently verified.'}}));
await writeFile(path.join(here,'results.json'),JSON.stringify(results,null,2));
await writeFile(path.join(here,'SOURCES.txt'),`V3：BeautifulDay 编曲，贝多芬《悲怆》第三乐章主题。钢琴录谱 aqtq314。\n作者视频：https://www.youtube.com/watch?v=TL_8UmASF3Q\n作者分享：https://www.mediafire.com/?vgi1jzco12iy2\n保留完整2713钢琴音符，电贝斯与鼓组为本次新增编配，不声称游戏原版分轨。\n\n三葉のテーマ：RADWIMPS／野田洋次郎。\n钢琴MIDI来源：https://github.com/callmeyyzx/midi\n参考配器的公开录谱：https://flat.io/score/65f42ebc2d7d555fd65f80b7-san-xie-note-ma\n保留712个钢琴音符，中提琴与大提琴为本次新增编配，不声称原OST弦乐逐音转录。\n上游文件名中的“官方原版”未核实，未据此宣称授权或商业使用权。\n\n音源：RootSound 自带 GeneralUser GS 2.0.3，录音与许可均嵌入工程。未进行实际听音验收。\n`);
console.log(JSON.stringify(results,null,2));
