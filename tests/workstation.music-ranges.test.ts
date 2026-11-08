import assert from 'node:assert/strict';
import test from 'node:test';
import { writeMidi } from 'midi-file';
import { MIN_PITCH_HZ, MAX_PITCH_HZ, MIN_TEMPO_BPM, MAX_TEMPO_BPM } from '../src/workstation/contracts/music-limits.ts';
import { createInitialProjectLibrary } from '../src/workstation/app/project-setup.ts';
import { readMusicFile, createMusicFileSession } from '../src/workstation/app/music-file.ts';
import { readExchangeMidi, writeExchangeMidi } from '../src/workstation/app/music-interchange-midi.ts';
import { createMidiProjectLibrary } from '../src/workstation/app/midi-project.ts';
import { openMusicDocument, commitMusicDocument } from '../src/workstation/app/music-document.ts';
import { createMaterialLibrary } from '../src/workstation/modules/materials/public.ts';
import { createTimbrePlayback, createTimbreReferenceAdapter } from '../src/workstation/modules/timbre/public.ts';
import { createPhraseEditor, createPhrasePlayback, createPhraseReferenceAdapter } from '../src/workstation/modules/phrase/public.ts';
import { createSongEditor, createSongReferenceAdapter } from '../src/workstation/modules/song/public.ts';
import { phraseBeatSeconds, phraseHeldSeconds } from '../src/workstation/contracts/phrase-time.ts';
import { melodyScoreGrid } from '../src/workstation/modules/ui-rendering/melody-geometry.ts';
import { createTapTempo } from '../src/workstation/modules/ui-rendering/tap-tempo-model.ts';
import { musicClockVoice } from './music-clock-fixture.ts';
import { readEditableTimbreBody } from '../src/workstation/modules/timbre/public.ts';
import { readExchangeXml, writeExchangeXml } from '../src/workstation/app/music-interchange-xml.ts';

const close=(a:number,b:number)=>assert(Math.abs(a-b)<1e-8,`${a} != ${b}`);
function open(text=createInitialProjectLibrary('范围测试')) {
  let snapshot=text;
  const library=createMaterialLibrary({read:()=>snapshot,write:value=>snapshot=value},{project:{rootKind:'rootsound.song',adapters:[createTimbreReferenceAdapter(),createPhraseReferenceAdapter(),createSongReferenceAdapter()]}});
  const tones=createTimbrePlayback(library,undefined,undefined,musicClockVoice),score=createPhraseEditor(library,tones);
  const song=createSongEditor(library,createPhrasePlayback(library,tones),{defaultTempoMode:'source'});openMusicDocument(library,song,score);
  return{library,score,song,text:()=>snapshot};
}
function variableMidi() {
  return Uint8Array.from(writeMidi({header:{format:1,numTracks:2,ticksPerBeat:480},tracks:[
    [{deltaTime:0,type:'setTempo',microsecondsPerBeat:2000000},{deltaTime:480,type:'setTempo',microsecondsPerBeat:125000},
      {deltaTime:480,type:'setTempo',microsecondsPerBeat:60000},{deltaTime:480,type:'endOfTrack'}],
    [{deltaTime:0,type:'noteOn',channel:0,noteNumber:0,velocity:100},{deltaTime:240,type:'noteOff',channel:0,noteNumber:0,velocity:0},
      {deltaTime:240,type:'noteOn',channel:0,noteNumber:127,velocity:100},{deltaTime:960,type:'noteOff',channel:0,noteNumber:127,velocity:0},
      {deltaTime:0,type:'endOfTrack'}],
  ]}));
}
test('shared ranges cover BPM 1–1000 and every MIDI pitch from C−1 to G9',()=>{
  assert.equal(MIN_TEMPO_BPM,1);assert.equal(MAX_TEMPO_BPM,1000);
  const f=open(),keys=f.score.keyboard();assert.equal(keys.length,128);assert.equal(keys[0]!.label,'C-1');assert.equal(keys.at(-1)!.label,'G9');
  close(keys[0]!.frequencyHz,MIN_PITCH_HZ);close(keys.at(-1)!.frequencyHz,MAX_PITCH_HZ);
});
test('both range endpoints can be edited, auditioned and saved in a native project',async()=>{
  const f=open(),part=f.score.addPart(f.library.listContentInfo().find(item=>item.kind==='rootsound.timbre')!.id);
  for(const frequencyHz of [MIN_PITCH_HZ,MAX_PITCH_HZ]){
    f.score.addNote(part,{startBeat:0,durationBeats:.25,frequencyHz,velocity:.7});
    const plan=await f.score.previewNotePlan(part,{frequencyHz,holdSeconds:.1,velocity:.7});close(plan.note.frequencyHz,frequencyHz);
    close((await f.score.previewPianoPlan({frequencyHz,holdSeconds:.1,velocity:.7})).note.frequencyHz,frequencyHz);
  }
  for(const bpm of [1,3.6,30,480,1000]){f.score.setTempo(bpm);await f.score.preparePreview();close(f.score.previewPlan().events[0]!.sound.note.frequencyHz,MIN_PITCH_HZ);}
  commitMusicDocument(f.library,f.song,f.score);const restored=open(f.text()).score.read().body!;
  assert.equal(restored.tempoBpm,1000);assert.deepEqual(restored.parts[0]!.notes.map(note=>note.frequencyHz),[MIN_PITCH_HZ,MAX_PITCH_HZ]);
});
test('invalid frequencies and tempos still leave the current draft untouched',()=>{
  const f=open(),part=f.score.addPart(f.library.listContentInfo().find(item=>item.kind==='rootsound.timbre')!.id),before=f.text();
  for(const bpm of [0,-1,1001,NaN,Infinity])assert.throws(()=>f.score.setTempo(bpm));
  for(const frequencyHz of [MIN_PITCH_HZ/2,MAX_PITCH_HZ*2,0,NaN,Infinity])assert.throws(()=>f.score.addNote(part,{startBeat:0,durationBeats:.25,frequencyHz,velocity:.7}));
  assert.equal(f.text(),before);
});
test('new MIDI opening produces separate rolls at actual 30, 480 and 1000 BPM, with extreme notes intact',()=>{
  const f=open(readMusicFile(variableMidi(),'Variable.mid','midi').libraryText),body=f.score.read().body!;
  assert.equal(body.tempoBpm,30);assert.deepEqual(body.tempoSections!.map(section=>[section.startBeat,section.tempoBpm]),[[1,480],[2,1000]]);
  const notes=body.parts[0]!.notes;assert.deepEqual(notes.map(note=>[note.startBeat,note.durationBeats]),[[0,.5],[1,2]]);
  close(notes[0]!.frequencyHz,MIN_PITCH_HZ);close(notes[1]!.frequencyHz,MAX_PITCH_HZ);
  close(phraseBeatSeconds(body,notes[1]!.startBeat),2);close(phraseHeldSeconds(body,notes[1]!),.185);
  commitMusicDocument(f.library,f.song,f.score);const reopened=open(f.text()).score.read().body!;
  assert.deepEqual(reopened.tempoSections,body.tempoSections);
});
test('legacy MIDI projects recover multiple BPM rolls without changing their original playback',()=>{
  const bytes=variableMidi(),converted=createMidiProjectLibrary(bytes,'旧变速'),f=open(converted.libraryText),body=f.score.read().body!;
  assert.equal(body.tempoBpm,30);assert.deepEqual(body.tempoSections!.map(section=>[section.startBeat,section.tempoBpm]),[[1,480],[2,1000]]);
  const notes=body.parts.flatMap(part=>part.notes).sort((a,b)=>a.startBeat-b.startBeat);
  close(notes[0]!.startBeat,0);close(notes[1]!.startBeat,1);close(notes[1]!.durationBeats,2);
  close(phraseBeatSeconds(body,notes[1]!.startBeat),2);close(phraseHeldSeconds(body,notes[1]!),.185);
  commitMusicDocument(f.library,f.song,f.score);assert.equal(open(f.text()).score.read().body!.tempoSections!.length,2);
});
test('a mixed single score retains its BPM rolls even when legacy track gain needs flattening',()=>{
  const f=open(readMusicFile(variableMidi(),'Variable.mid','midi').libraryText);
  f.song.updateTrack(f.song.read().body!.tracks[0]!.id,{level:.5});const restored=open(f.text()),body=restored.score.read().body!;
  assert.deepEqual(body.tempoSections!.map(section=>[section.startBeat,section.tempoBpm]),[[1,480],[2,1000]]);
  close(phraseBeatSeconds(body,body.parts[0]!.notes[1]!.startBeat),2);close(body.parts[0]!.notes[1]!.level!,.5);
});
test('changing an imported roll tempo retimes its notes rather than displacing them off the grid',()=>{
  const f=open(readMusicFile(variableMidi(),'Variable.mid','midi').libraryText),before=f.score.read().body!;
  f.score.setTempoSection(before.tempoSections![0]!.id,960);const after=f.score.read().body!,note=after.parts[0]!.notes[1]!;
  assert.equal(note.startBeat,1);close(note.durationBeats,2);close(phraseHeldSeconds(after,note),.1225);
  const lines=melodyScoreGrid(after,{leftSeconds:1.99,zoom:8,rowHeight:32},900);
  assert(lines.some(line=>Math.abs(line.seconds-phraseBeatSeconds(after,1))<1e-8));
});
test('MIDI edited at 1000 BPM writes actual supported tempo and both edge pitches',()=>{
  const bytes=variableMidi(),f=open(readMusicFile(bytes,'Variable.mid','midi').libraryText);
  const session=createMusicFileSession('midi',bytes,f.library,f.score.read().body!,'Variable');
  f.score.setTempo(1000);commitMusicDocument(f.library,f.song,f.score);
  const saved=session.serialize(f.library,f.score.read().body!,'Variable',f.text()),result=readExchangeMidi(saved.bytes,'Variable').score;
  assert.equal(result.tempos[0]!.bpm,1000);assert.deepEqual(result.parts.flatMap(part=>part.notes.map(note=>note.pitch)),[0,127]);
});
test('saving an unrepresentable MIDI tempo fails explicitly instead of overflowing its 24-bit value',()=>{
  assert.throws(()=>writeExchangeMidi({name:'Slow',length:1,tempos:[{beat:0,bpm:1}],parts:[]}),/3.58.*rootsound/);
  const bytes=writeExchangeMidi({name:'Slow',length:1,tempos:[{beat:0,bpm:3.6}],parts:[]}).bytes;
  close(readExchangeMidi(bytes,'Slow').score.tempos[0]!.bpm,60000000/16666667);
});
test('tap timing supports both 1 and 1000 BPM without treating regular slow beats as pauses',()=>{
  for(const bpm of [1,4,30,480,1000]){const model=createTapTempo();for(let n=0;n<4;n++)model.tap(n*60000/bpm);assert.equal(model.read().bpm,bpm);}
});
test('MIDI percussion keeps its source key without doubling the timbre tuning offset',()=>{
  const bytes=Uint8Array.from(writeMidi({header:{format:0,numTracks:1,ticksPerBeat:480},tracks:[[
    {deltaTime:0,type:'noteOn',channel:9,noteNumber:36,velocity:100},{deltaTime:480,type:'noteOff',channel:9,noteNumber:36,velocity:0},{deltaTime:0,type:'endOfTrack'},
  ]]}));
  const f=open(readMusicFile(bytes,'Drums.mid','midi').libraryText),part=f.score.read().body!.parts[0]!,note=part.notes[0]!;
  const tone=readEditableTimbreBody(f.library.readContent(part.timbreId)!.body);assert.equal(tone.model,'sample-bank');
  if(tone.model!=='sample-bank')throw Error('Expected GM samples');
  close(69+12*Math.log2(note.frequencyHz/440),36);close(69+12*Math.log2(note.frequencyHz/440)+(tone.tuningSemitones??0),60);
});
test('MusicXML preserves both MIDI edges without using a forbidden negative octave number',()=>{
  const score={name:'Edges',length:1,tempos:[{beat:0,bpm:1}],parts:[{name:'Piano',program:0,notes:[0,127].map(pitch=>({pitch,beat:0,duration:.25,velocity:.8,level:1,pan:0}))}]};
  const bytes=writeExchangeXml(score,false),text=new TextDecoder().decode(bytes);assert(!text.includes('<octave>-1</octave>'));
  const reopened=readExchangeXml(bytes,'Edges',false).score;assert.equal(reopened.tempos[0]!.bpm,1);assert.deepEqual(reopened.parts[0]!.notes.map(note=>note.pitch),[0,127]);
});
