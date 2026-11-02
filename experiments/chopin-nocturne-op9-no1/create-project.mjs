import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import assert from 'node:assert/strict';
import { parseMidi } from '../../src/workstation/modules/midi-import/public.ts';
import { createInitialProjectLibrary } from '../../src/workstation/app/project-setup.ts';
import { openMusicDocument, commitMusicDocument } from '../../src/workstation/app/music-document.ts';
import { createMaterialLibrary } from '../../src/workstation/modules/materials/public.ts';
import { createTimbrePlayback, createTimbreReferenceAdapter } from '../../src/workstation/modules/timbre/public.ts';
import { createPhraseEditor, createPhrasePlayback, createPhraseReferenceAdapter } from '../../src/workstation/modules/phrase/public.ts';
import { createSongEditor, createSongReferenceAdapter } from '../../src/workstation/modules/song/public.ts';
import { createSampleAudio, createBrowserSampleDecoder, createSampleReferenceAdapter } from '../../src/workstation/modules/sampling/public.ts';
import { createSampleBankAudio } from '../../src/workstation/modules/timbre/sample-bank.ts';

const here=path.dirname(fileURLToPath(import.meta.url)),root=path.resolve(here,'../..');
const name='肖邦 · 降B小调夜曲 Op.9 No.1';
const source='https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=582';
const midi=parseMidi(new Uint8Array(await readFile(path.join(here,'source.mid'))));
assert.equal(midi.notes.length,1714);assert.equal(midi.timeSignatures[0].numerator,6);
let text=createInitialProjectLibrary(name);
const adapters=[createTimbreReferenceAdapter(),createPhraseReferenceAdapter(),createSongReferenceAdapter(),createSampleReferenceAdapter()];
const library=createMaterialLibrary({read:()=>text,write:value=>{text=value;}},{project:{rootKind:'rootsound.song',adapters}});
const assetRoot=path.join(root,'public/instruments/generaluser-gs-2.0.3');
let sourceBytes=0;
const fetcher=async input=>{
  const filename=String(input).split('/').at(-1);
  assert(filename==='manifest.json'||/^[a-f0-9]{64}\.wav$/.test(filename));
  const bytes=await readFile(path.join(assetRoot,filename));if(filename.endsWith('.wav'))sourceBytes+=bytes.length;
  return new Response(new Uint8Array(bytes),{headers:{'Content-Type':filename.endsWith('.json')?'application/json':'audio/wav'}});
};
const samples=createSampleAudio(library,createBrowserSampleDecoder());
const bank=createSampleBankAudio(library,samples,fetcher);
const tones=createTimbrePlayback(library,samples,undefined,bank);
const score=createPhraseEditor(library,tones),song=createSongEditor(library,createPhrasePlayback(library,tones),{defaultTempoMode:'source'});
openMusicDocument(library,song,score);
const rootId=song.read().draft.id;
const piano=library.listContent().find(record=>record.kind==='rootsound.timbre'&&record.name==='钢琴');assert(piano);
const voices=['钢琴 · 右手','钢琴 · 左手'].map(label=>({...piano,id:randomUUID(),revision:1,name:label,body:{...piano.body,level:.7,releaseSeconds:.1}}));
const inserted=library.commitTransaction({expectedToken:library.currentToken(),label:'准备肖邦双手钢琴',createContents:voices,
  exactNameIds:voices.map(voice=>voice.id),projectMembers:[{rootId,contentIds:voices.map(voice=>voice.id)}]});assert.equal(inserted.status,'committed');
const bpm=midi.initialTempoBpm;
const parts=voices.map((voice,index)=>({id:randomUUID(),name:voice.name,timbreId:voice.id,section:'melody',notes:midi.notes.filter(note=>note.trackIndex===index+1).map(note=>{
  // The engraved MIDI has fixed full velocity. Keep all pitches, onset times and
  // pedal-expanded durations, but give the melody room above the accompaniment.
  const phraseShape=Math.sin(Math.PI*(note.startBeat%24)/24);
  const velocity=index===0 ? .64+.12*phraseShape : .37+.06*phraseShape+(note.pitch<48?.035:0);
  return {id:randomUUID(),startBeat:note.startBeat,durationBeats:note.endBeat-note.startBeat,
    durationSeconds:note.endSeconds-note.startSeconds,frequencyHz:440*2**((note.pitch-69)/12),velocity,
    pan:index===0?.05:-.05};
})}));
const lengthBeats=3+Math.ceil((midi.durationBeats-3)/6)*6;
library.updateDraft(score.read().draft.id,{dependencies:voices.map(voice=>voice.id),body:{model:'note-phrase',version:1,timeUnit:'beat',tempoBpm:bpm,
  lengthBeats,stepsPerBeat:4,beatsPerBar:6,pickupBeats:3,masterLevel:.75,parts}});
const all=score.read().body.parts.flatMap(part=>part.notes);
assert.equal(all.length,midi.notes.length);
for(let hand=0;hand<2;hand++){
  const original=midi.notes.filter(note=>note.trackIndex===hand+1),created=parts[hand].notes;
  for(let i=0;i<original.length;i++){
    assert(Math.abs(created[i].startBeat*60/bpm-original[i].startSeconds)<1e-8);
    assert.equal(created[i].durationSeconds,original[i].endSeconds-original[i].startSeconds);
  }
}
await bank.materialize(voices.map(voice=>voice.id));
commitMusicDocument(library,song,score);
await score.preparePreview();const plan=score.previewPlan();assert.equal(plan.events.length,1714);
assert(plan.events.every(event=>event.sound.kind==='sample'));
const directory=path.join(root,'project');await mkdir(directory,{recursive:true});
const project={format:'RootSoundWorkspace',version:2,id:randomUUID().replaceAll('-',''),name,createdAtUtc:new Date().toISOString(),
  source:{composer:'Frédéric Chopin',work:'Nocturne in B-flat minor, Op.9 No.1',meter:'6/4',edition:'Schirmer 1915, R. Joseffy',
    transcription:'Benjamin D. Esham / Mutopia-2005/08/08-582',url:source,license:'CC BY-SA 2.5',licenseUrl:'https://creativecommons.org/licenses/by-sa/2.5/',
    changes:'Editable RootSound score; separate right/left hand families, piano recordings embedded; melody/accompaniment velocity balance. Source pitches, onsets and pedal-expanded durations preserved.'},
  assetLicenses:{bank:'GeneralUser GS 2.0.3',license:await readFile(path.join(assetRoot,'LICENSE.txt'),'utf8'),credits:await readFile(path.join(assetRoot,'CREDITS.txt'),'utf8')},libraryText:text};
let destination=path.join(directory,name+'.rootsound'),suffix=1;
while(true){try{await writeFile(destination,JSON.stringify(project),{flag:'wx'});break;}catch(error){if(error.code!=='EEXIST')throw error;destination=path.join(directory,`${name} ${suffix++}.rootsound`);}}
const report={destination,noteCount:all.length,rightHand:parts[0].notes.length,leftHand:parts[1].notes.length,
  durationSeconds:midi.durationSeconds,tempoBpm:bpm,meter:'6/4',pickupBeats:3,lengthBeats,embeddedSourceBytes:sourceBytes,bytes:Buffer.byteLength(JSON.stringify(project)),
  sampleVoices:2,fullSamplePlanVerified:true,physicalAudioUsed:false};
await writeFile(path.join(here,'result.json'),JSON.stringify(report,null,2));
await writeFile(path.join(here,'SOURCE.txt'),`肖邦《降B小调夜曲》Op.9 No.1\n来源：${source}\n录谱：Benjamin D. Esham，Mutopia-2005/08/08-582\n底本：Schirmer 1915，R. Joseffy 编订\n录谱许可：Creative Commons Attribution-ShareAlike 2.5\nhttps://creativecommons.org/licenses/by-sa/2.5/\n本次转换：保留1714个音符的音高、起点及踏板延长时值；拆为左右手；调整力度平衡；嵌入 RootSound 自带钢琴录音。\n采用6/4小节、3拍弱起，小节线与谱面同步。\n音色来源与许可见项目 public/instruments/generaluser-gs-2.0.3/CREDITS.txt 和 LICENSE.txt。\n`);
console.log(JSON.stringify(report,null,2));
