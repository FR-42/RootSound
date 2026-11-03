import {createMaterialLibrary} from '../src/workstation/modules/materials/public.ts';
import {createSampleBankAudio} from '../src/workstation/modules/timbre/sample-bank.ts';
import {createBrowserSoundRuntime} from '../src/workstation/modules/sound-runtime/public.ts';
import {prepareSoundFont,awaitSoundFontScheduling} from '../src/workstation/modules/sound-runtime/soundfont-node.ts';
import {readPreview} from '../src/workstation/modules/sound-runtime/plan.ts';
import type {SoundSequencePlan,SoundPlan} from '../src/workstation/contracts/sound.ts';

const assert=(condition:unknown,message:string)=>{if(!condition)throw Error(message);};
const wavPeak=(bytes:Uint8Array)=>{let peak=0;for(let i=44;i<bytes.length-2;i+=3){let n=bytes[i]!|bytes[i+1]!<<8|bytes[i+2]!<<16;if(n&0x800000)n-=0x1000000;peak=Math.max(peak,Math.abs(n));}return peak;};

/** All contexts here are offline; a native live AudioContext is never constructed. */
export async function run() {
  Object.defineProperty(globalThis,'AudioContext',{configurable:true,value:class {constructor(){throw Error('physical audio forbidden');}}});
  const bank=createSampleBankAudio(createMaterialLibrary(),undefined,fetch,{soundFont:true});
  const body={model:'sample-bank',version:1,bank:'generaluser-gs-2.0.3',instrument:'gm-73',attackSeconds:0,releaseSeconds:.03,level:.7} as const;
  const note={frequencyHz:440,holdSeconds:.2,velocity:.8};
  await bank.prepare(body,[note]);const plan=bank.plan(body,note);
  const runtime=createBrowserSoundRuntime(),start=performance.now();
  const rendered=await runtime.render(plan,{sampleRate:48000}),peak=wavPeak(rendered.bytes);
  assert(peak>100,'silent single-note SoundFont render');
  const second=await runtime.render(plan,{sampleRate:48000});assert(wavPeak(second.bytes)>100,'bank destroyed after first render');
  const basic:SoundPlan={kind:'basic-synth',version:1,sources:[{waveform:'sine',frequencyRatio:1,level:1}],
    envelope:{attackSeconds:0,releaseSeconds:.05},note:{frequencyHz:220,velocity:.5,holdSeconds:.1},level:.1};
  const short=bank.plan(body,{...note,holdSeconds:.01});
  const mixed:SoundSequencePlan={kind:'sequence',version:1,durationSeconds:6,events:[
    ...Array.from({length:257},(_,i)=>({atSeconds:i*.02,sound:short})),{atSeconds:.2,sound:basic},{atSeconds:4,sound:basic}]};
  const mix=await runtime.render(mixed,{sampleRate:48000});assert(wavPeak(mix.bytes)>100,'silent mixed/windowed stream');
  const held=bank.plan(body,{...note,holdSeconds:.8});
  const seeked=await runtime.render({kind:'sequence',version:1,durationSeconds:1,transport:{positionSeconds:.5,rate:1},events:[{atSeconds:0,sound:held}]},{sampleRate:48000});
  assert(wavPeak(seeked.bytes.slice(0,44+4800*6))>100,'moving the head lost an already-held note');
  await runtime.dispose();

  let clock:OfflineAudioContext|undefined;
  Object.defineProperty(globalThis,'AudioContext',{configurable:true,value:class{
    constructor(){clock=new OfflineAudioContext(2,48000,48000);Object.defineProperty(clock,'state',{get:()=> 'running'});
      Object.defineProperty(clock,'close',{value:async()=>{}});return clock;}
  }});
  const live=createBrowserSoundRuntime();
  const empty:SoundSequencePlan={kind:'sequence',version:1,durationSeconds:1,events:[],transport:{positionSeconds:0,rate:1}};
  const session=await live.preview(empty);
  const long=bank.plan(body,{...note,holdSeconds:.8});
  const song:SoundSequencePlan={...empty,events:[{atSeconds:0,sound:long}]};
  // Exercise the first SF2 note added to an already-running empty document.
  live.update(session.id,song);
  await prepareSoundFont(clock!,readPreview(song));await new Promise(resolve=>setTimeout(resolve,0));await awaitSoundFontScheduling(clock!);
  assert(live.position(session.id)!>=0,'empty-to-SF2 live update lost the session');
  const paused=clock!.suspend(.2),rendering=clock!.startRendering();await paused;
  assert(live.pause!(session.id)?.status==='paused','pause failed');
  const resumed=await live.resume!(session.id,song);assert(resumed.id===session.id&&resumed.status==='playing','resume failed');
  await awaitSoundFontScheduling(clock!);
  const next=clock!.suspend(.4);await clock!.resume();await next;
  const edited={...song,events:[{atSeconds:0,sound:{...long,level:.25}}]};
  assert(live.update(session.id,edited)?.id===session.id,'live gain update replaced the transport');
  await awaitSoundFontScheduling(clock!);
  await clock!.resume();const audio=await rendering;
  const data=audio.getChannelData(0),energy=(a:number,b:number)=>data.slice(a,b).reduce((sum,x)=>sum+x*x,0);
  assert(energy(2400,7200)>1e-9,'live graph silent before pause');
  assert(energy(24000,36000)>1e-9,'live graph silent after resume/update');
  await live.dispose();
  return {passed:true,peak,singleBytes:rendered.bytes.length,mixedBytes:mix.bytes.length,elapsed:performance.now()-start,
    fullSoundFont:!!plan.soundFont,mixedWindowed:true,repeatedRender:true,seekFromHead:true,emptyToSoundFont:true,pauseResume:true,liveEdit:true};
}
