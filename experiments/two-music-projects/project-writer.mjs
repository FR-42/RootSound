import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {randomUUID} from 'node:crypto';
import assert from 'node:assert/strict';
import {createInitialProjectLibrary} from '../../src/workstation/app/project-setup.ts';
import {openMusicDocument,commitMusicDocument} from '../../src/workstation/app/music-document.ts';
import {createMaterialLibrary} from '../../src/workstation/modules/materials/public.ts';
import {createTimbrePlayback,createTimbreReferenceAdapter} from '../../src/workstation/modules/timbre/public.ts';
import {createPhraseEditor,createPhrasePlayback,createPhraseReferenceAdapter} from '../../src/workstation/modules/phrase/public.ts';
import {createSongEditor,createSongReferenceAdapter} from '../../src/workstation/modules/song/public.ts';
import {createSampleAudio,createBrowserSampleDecoder,createSampleReferenceAdapter} from '../../src/workstation/modules/sampling/public.ts';
import {createSampleBankAudio} from '../../src/workstation/modules/timbre/sample-bank.ts';

const here=path.dirname(fileURLToPath(import.meta.url)),root=path.resolve(here,'../..');
export async function writeMusicProject({name,bpm,parts,source,master=.72,durationSeconds,beatsPerBar=4,stepsPerBeat=4}){
  let text=createInitialProjectLibrary(name),loadedBytes=0;
  const adapters=[createTimbreReferenceAdapter(),createPhraseReferenceAdapter(),createSongReferenceAdapter(),createSampleReferenceAdapter()];
  const library=createMaterialLibrary({read:()=>text,write:value=>{text=value;}},{project:{rootKind:'rootsound.song',adapters}});
  const assetRoot=path.join(root,'public/instruments/generaluser-gs-2.0.3');
  const fetcher=async input=>{const filename=String(input).split('/').at(-1);assert(filename==='manifest.json'||/^[a-f0-9]{64}\.wav$/.test(filename));
    const bytes=await readFile(path.join(assetRoot,filename));if(filename.endsWith('.wav'))loadedBytes+=bytes.length;
    return new Response(new Uint8Array(bytes),{headers:{'Content-Type':filename.endsWith('.json')?'application/json':'audio/wav'}});};
  const samples=createSampleAudio(library,createBrowserSampleDecoder()),bank=createSampleBankAudio(library,samples,fetcher);
  const tones=createTimbrePlayback(library,samples,undefined,bank),score=createPhraseEditor(library,tones),song=createSongEditor(library,createPhrasePlayback(library,tones),{defaultTempoMode:'source'});
  openMusicDocument(library,song,score);const rootId=song.read().draft.id;
  const voices=parts.map(part=>({id:randomUUID(),kind:'rootsound.timbre',owner:'timbre',schemaVersion:1,revision:1,name:part.name,dependencies:[],
    body:{model:'sample-bank',version:1,bank:'generaluser-gs-2.0.3',instrument:part.instrument,level:part.level??.7,attackSeconds:part.attack??0,releaseSeconds:part.release??.08,
      ...(part.drumPitch===undefined?{}:{tuningSemitones:60-part.drumPitch})}}));
  const result=library.commitTransaction({expectedToken:library.currentToken(),label:'创建分层编配',createContents:voices,exactNameIds:voices.map(voice=>voice.id),projectMembers:[{rootId,contentIds:voices.map(voice=>voice.id)}]});assert.equal(result.status,'committed');
  const lengthBeats=Math.ceil(Math.max(durationSeconds,...parts.flatMap(part=>part.notes.map(note=>note.at+note.hold)))*bpm/60/beatsPerBar)*beatsPerBar;
  const bodies=parts.map((part,i)=>({id:randomUUID(),name:part.name,timbreId:voices[i].id,section:'melody',notes:part.notes.map(note=>({id:randomUUID(),
    startBeat:note.at*bpm/60,durationBeats:Math.min(note.hold*bpm/60,lengthBeats-note.at*bpm/60),durationSeconds:note.hold,
    frequencyHz:440*2**((note.pitch-69)/12),velocity:note.velocity??.65,level:note.level??1,pan:note.pan??part.pan??0}))}));
  library.updateDraft(score.read().draft.id,{dependencies:voices.map(voice=>voice.id),body:{model:'note-phrase',version:1,timeUnit:'beat',tempoBpm:bpm,lengthBeats,
    beatsPerBar,stepsPerBeat,masterLevel:master,parts:bodies}});
  await bank.materialize(voices.map(voice=>voice.id));commitMusicDocument(library,song,score);
  await score.preparePreview();const plan=score.previewPlan();assert.equal(plan.events.length,parts.reduce((sum,part)=>sum+part.notes.length,0));
  assert(plan.events.every(event=>event.sound.kind==='sample'));
  const stored=JSON.parse(text),draft=stored.drafts.find(record=>record.kind==='rootsound.song'),saved=stored.contents.find(record=>record.id===draft.dependencies[0]);
  assert.equal(saved.body.parts.length,parts.length);assert.equal(saved.body.parts.reduce((sum,part)=>sum+part.notes.length,0),plan.events.length);
  const file={format:'RootSoundWorkspace',version:2,id:randomUUID().replaceAll('-',''),name,createdAtUtc:new Date().toISOString(),source,
    arrangement:parts.map(part=>({name:part.name,origin:part.origin,notes:part.notes.length})),
    assetLicenses:{bank:'GeneralUser GS 2.0.3',license:await readFile(path.join(assetRoot,'LICENSE.txt'),'utf8'),credits:await readFile(path.join(assetRoot,'CREDITS.txt'),'utf8')},libraryText:text};
  const directory=path.join(root,'project');await mkdir(directory,{recursive:true});let destination=path.join(directory,name+'.rootsound'),suffix=1;
  const packed=JSON.stringify(file);
  while(true){try{await writeFile(destination,packed,{flag:'wx'});break;}catch(error){if(error.code!=='EEXIST')throw error;destination=path.join(directory,`${name} ${suffix++}.rootsound`);}}
  return {name,destination,bytes:Buffer.byteLength(packed),durationSeconds,notes:plan.events.length,parts:parts.map(part=>({name:part.name,notes:part.notes.length,origin:part.origin})),embeddedRecordingBytes:loadedBytes,fullSamplePlanVerified:true,physicalAudioUsed:false};
}
