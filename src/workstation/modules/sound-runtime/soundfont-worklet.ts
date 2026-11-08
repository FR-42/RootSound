import type {TimedMidiExpressionLane} from '../../contracts/midi-expression.ts';
import {loadSoundFont,SoundFontStream,type FontEvent} from './soundfont-engine.ts';

declare const sampleRate:number;
declare const currentTime:number;
declare function registerProcessor(name:string,processor:typeof AudioWorkletProcessor):void;
declare class AudioWorkletProcessor {
  readonly port:MessagePort;
  constructor(options?:unknown);
}
let bank:ReturnType<typeof loadSoundFont>|undefined;
class FontProcessor extends AudioWorkletProcessor {
  #stream:SoundFontStream|undefined;
  #start=Infinity;
  #stop=Infinity;
  #ended=false;
  constructor(options:{processorOptions:{bank?:ArrayBuffer;events?:FontEvent[];midiExpression?:TimedMidiExpressionLane[]}}) {
    super();
    try {
      if(options.processorOptions.bank){bank=loadSoundFont(options.processorOptions.bank);this.port.postMessage({type:'ready'});}
      else {
        if(!bank)throw Error('完整 SoundFont 音源尚未加载。');
        this.#stream=new SoundFontStream(bank,sampleRate,options.processorOptions.events!,options.processorOptions.midiExpression);
      }
      this.port.onmessage=event=>{
        const value=event.data;
        if(value.type==='start'){this.#stream!.seek(value.position);this.#start=value.at;this.port.postMessage({type:'scheduled'});}
        if(value.type==='patch-schedule')this.#stream!.patchSchedule(value.patch);
        if(value.type==='stop')this.#stop=value.at;
        if(value.type==='dispose'){this.#ended=true;this.#stream?.dispose();this.#stream=undefined;}
      };
    }catch(error){this.#ended=true;this.port.postMessage({type:'error',message:String(error)});}
  }
  process(_inputs:Float32Array[][],outputs:Float32Array[][]):boolean {
    if(this.#ended)return false;
    if(!this.#stream)return true;
    const output=outputs[0]!;
    if(!output?.length)return true;
    const left=output[0]!,right=output[1]??left;
    if(currentTime>=this.#stop){this.#ended=true;this.#stream.dispose();this.port.postMessage({type:'ended'});return false;}
    const begin=Math.max(0,Math.round((this.#start-currentTime)*sampleRate));
    const end=Math.min(left.length,Math.round((this.#stop-currentTime)*sampleRate));
    if(end>begin)this.#stream.process(left,right,begin,end-begin);
    return true;
  }
}
registerProcessor('rootsound-soundfont',FontProcessor as unknown as typeof AudioWorkletProcessor);
