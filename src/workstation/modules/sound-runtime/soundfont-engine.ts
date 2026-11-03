import { SoundBankLoader, SpessaSynthProcessor, SpessaLog, GeneratorTypes, type BasicSoundBank, type BasicPreset } from 'spessasynth_core';
import type { SampleSoundPlan } from '../../contracts/sound.ts';

export type FontEvent={atSeconds:number;holdSeconds:number;releaseSeconds:number;level:number;pan:number;font:NonNullable<SampleSoundPlan['soundFont']>};
type Trigger={time:number;on:boolean;id:number};
SpessaLog.setLogLevel(false,false,false);
export function loadSoundFont(bytes:ArrayBuffer):BasicSoundBank{return SoundBankLoader.fromArrayBuffer(bytes);}

/** One complete SF2 engine per stream, shared by every note in that stream. */
export class SoundFontStream {
  readonly sampleRate:number;
  readonly synth:SpessaSynthProcessor;
  readonly #events:readonly FontEvent[];
  readonly #drums:BasicPreset|undefined;
  readonly #triggers:Trigger[];
  readonly #channels=new Map<number,number>();
  readonly #leases=new Map<number,{key:string;until:number}>();
  #cursor=0;
  #disposed=false;
  position=0;
  constructor(bank:BasicSoundBank,sampleRate:number,events:readonly FontEvent[]) {
    this.sampleRate=sampleRate;
    this.#events=events;
    this.#drums=bank.presets.find(preset=>preset.isGMGSDrum&&preset.program===0);
    this.synth=new SpessaSynthProcessor(sampleRate,{eventsEnabled:false,effectsEnabled:true});
    this.synth.soundBankManager.addSoundBank(bank,'rootsound');
    this.synth.setSystemParameter('autoAllocateVoices',true);
    this.#triggers=events.flatMap((event,id)=>[{time:event.atSeconds,on:true,id},{time:event.atSeconds+event.holdSeconds,on:false,id}])
      .sort((a,b)=>a.time-b.time||Number(a.on)-Number(b.on));
  }
  async ready():Promise<void>{await this.synth.ready;}
  #trigger(trigger:Trigger):void {
    const event=this.#events[trigger.id]!,font=event.font;
    if(!trigger.on){const channel=this.#channels.get(trigger.id);if(channel!==undefined)this.synth.noteOff(channel,font.key);return;}
    if(!font.velocity||!event.level)return;
    const exclusive=font.drums?this.#drums?.getVoiceParameters(font.key,font.velocity)
      .map(voice=>voice.generators[GeneratorTypes.exclusiveClass]).find(group=>group!==0):undefined;
    // Choke groups must survive individual hit gain/pan changes as well.
    const key=exclusive?`exclusive:${font.program}:${exclusive}`:JSON.stringify([font.program,font.drums,font.cents,event.level,event.pan]);
    // Drums with common controls share a channel, preserving hi-hat choke groups.
    let channel=font.drums?[...this.#leases].find(([,lease])=>lease.key===key)?.[0]:undefined;
    if(channel===undefined)channel=Array.from({length:this.synth.midiChannels.length},(_,i)=>i)
      .find(i=>!this.#leases.has(i)||(this.#leases.get(i)!.until<=this.position&&this.synth.midiChannels[i]!.voiceCount===0));
    if(channel===undefined){channel=this.synth.midiChannels.length;this.synth.createMIDIChannel();}
    const controls=this.synth.midiChannels[channel]!;
    controls.setDrums(font.drums);this.synth.programChange(channel,font.program);
    controls.setSystemParameter('gain',event.level);controls.setSystemParameter('pan',event.pan);controls.setSystemParameter('fineTune',font.cents);
    this.#channels.set(trigger.id,channel);this.#leases.set(channel,{key,until:Math.max(this.#leases.get(channel)?.until??0,event.atSeconds+event.holdSeconds+event.releaseSeconds)});
    this.synth.noteOn(channel,font.key,font.velocity);
  }
  process(left:Float32Array,right:Float32Array,start=0,count=left.length-start):void {
    let offset=start;
    while(offset<start+count) {
      while(this.#cursor<this.#triggers.length&&this.#triggers[this.#cursor]!.time<=this.position+.5/this.sampleRate)this.#trigger(this.#triggers[this.#cursor++]!);
      const next=this.#triggers[this.#cursor]?.time??Infinity;
      const size=Math.min(128,start+count-offset,Math.max(1,Math.round((next-this.position)*this.sampleRate)));
      this.synth.process(left,right,offset,size);this.position+=size/this.sampleRate;offset+=size;
    }
  }
  /** Render only surviving notes/tails during a seek; never replay expired music. */
  seek(seconds:number):void {
    const surviving=this.#events.filter(event=>event.atSeconds<seconds&&event.atSeconds+event.holdSeconds+event.releaseSeconds+3>seconds);
    const from=Math.min(seconds,...surviving.map(event=>event.atSeconds));
    this.position=from;
    while(this.#cursor<this.#triggers.length&&this.#triggers[this.#cursor]!.time<from)this.#cursor++;
    const left=new Float32Array(128),right=new Float32Array(128);
    while(this.position+.5/this.sampleRate<seconds){left.fill(0);right.fill(0);this.process(left,right,0,Math.min(128,Math.round((seconds-this.position)*this.sampleRate)));}
  }
  dispose():void{
    if(this.#disposed)return;this.#disposed=true;
    // The parsed immutable bank is shared by concurrent preview/audition streams.
    // Core.destroy() also destroys attached banks, so detach our shared bank first.
    this.synth.soundBankManager.deleteSoundBank('rootsound');this.synth.destroy();
  }
}
