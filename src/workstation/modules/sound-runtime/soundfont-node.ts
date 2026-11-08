import type {TimedMidiExpressionLane} from '../../contracts/midi-expression.ts';
import type {ScheduledPreview} from './plan.ts';
import { createFontScheduleEditor, type FontEvent } from './soundfont-schedule.ts';
export type SoundFontSource = AudioBufferSourceNode & { failure: Promise<never>; scheduled: Promise<void>; updateSchedule(events: readonly FontEvent[], expression: readonly TimedMidiExpressionLane[]): void };
const prepared=new WeakMap<BaseAudioContext,Promise<void>>();
const modules=new WeakMap<BaseAudioContext,Promise<void>>();
const readyContexts=new WeakSet<BaseAudioContext>();
const scheduling=new WeakMap<BaseAudioContext,Set<Promise<void>>>();
export async function awaitSoundFontScheduling(audio:BaseAudioContext):Promise<void>{await Promise.all(scheduling.get(audio)??[]);}
export const soundFontReady=(audio:BaseAudioContext)=>readyContexts.has(audio);
let font:Promise<ArrayBuffer>|undefined;
export const hasSoundFont=(preview:ScheduledPreview)=>preview.events.some(event=>event.sound.kind==='sample'&&!!event.sound.soundFont);
export async function prepareSoundFont(audio:BaseAudioContext,preview:ScheduledPreview):Promise<void> {
  if(!hasSoundFont(preview))return;
  let pending=prepared.get(audio);
  if(!pending){
    pending=(async()=>{
      let module=modules.get(audio);
      if(!module){module=import('./soundfont-worklet.ts?worker&url').then(({default:url})=>audio.audioWorklet.addModule(url))
        .catch(error=>{modules.delete(audio);throw error;});modules.set(audio,module);}
      await module;
      font??=fetch((import.meta.env?.BASE_URL ?? '/')+'instruments/generaluser-gs-2.0.3/GeneralUser-GS.sf2').then(async response=>{
        if(!response.ok)throw Error('完整音源读取失败，请重新安装新版 RootSound。');return response.arrayBuffer();
      }).catch(error=>{font=undefined;throw error;});
      const bytes=await font;
      await new Promise<void>((resolve,reject)=>{
        const init=new AudioWorkletNode(audio,'rootsound-soundfont',{numberOfInputs:0,numberOfOutputs:1,outputChannelCount:[2],processorOptions:{bank:bytes}});
        const timer=setTimeout(()=>{init.port.close();reject(Error('完整音源初始化超时。'));},30000);
        init.port.onmessage=event=>{clearTimeout(timer);init.port.close();event.data.type==='ready'?resolve():reject(Error(event.data.message));};
        init.onprocessorerror=()=>{clearTimeout(timer);reject(Error('完整音源初始化失败。'));};
      });
      readyContexts.add(audio);
    })().catch(error=>{prepared.delete(audio);throw error;});
    prepared.set(audio,pending);
  }
  await pending;
}
/** Adapts one streaming SF2 processor to the shared scheduled-source lifecycle. */
export function createSoundFontSource(audio:BaseAudioContext,events:FontEvent[],midiExpression:readonly TimedMidiExpressionLane[]=[]): SoundFontSource {
  const node=new AudioWorkletNode(audio,'rootsound-soundfont',{numberOfInputs:0,numberOfOutputs:1,outputChannelCount:[2],processorOptions:{events,midiExpression}});
  let rejectFailure:(error:Error)=>void=()=>{};
  const failure=new Promise<never>((_resolve,reject)=>{rejectFailure=reject;});
  void failure.catch(()=>{});
  let ready:()=>void=()=>{};
  const scheduled=Promise.race([new Promise<void>(resolve=>{ready=resolve;}),failure]);
  const tasks=scheduling.get(audio)??new Set<Promise<void>>();scheduling.set(audio,tasks);tasks.add(scheduled);
  void scheduled.then(()=>tasks.delete(scheduled),()=>tasks.delete(scheduled));
  let editSchedule: ReturnType<typeof createFontScheduleEditor> | undefined;
  const source={onended:null as null|(()=>void),
    failure,scheduled,
    updateSchedule(nextEvents: readonly FontEvent[], nextExpression: readonly TimedMidiExpressionLane[]) {
      editSchedule ??= createFontScheduleEditor(events, midiExpression);
      const patch = editSchedule(nextEvents, nextExpression);
      if (patch) node.port.postMessage({ type: 'patch-schedule', patch });
    },
    connect(destination:AudioNode){node.connect(destination);},
    disconnect(){ready();node.port.postMessage({type:'dispose'});node.disconnect();node.port.close();},
    start(at=0,position=0){node.port.postMessage({type:'start',at,position});},
    stop(at=audio.currentTime){node.port.postMessage({type:'stop',at});},
  };
  node.port.onmessage=event=>{if(event.data.type==='scheduled')ready();if(event.data.type==='ended')source.onended?.();if(event.data.type==='error')rejectFailure(Error(event.data.message));};
  node.onprocessorerror=()=>rejectFailure(Error('SoundFont 后台音频处理失败。'));
  return source as unknown as SoundFontSource;
}
